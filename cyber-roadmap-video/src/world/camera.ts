import * as THREE from "three";
import { Easing, interpolate } from "remotion";
import { VIDEO } from "../theme";
import type { Timeline } from "../timeline";

export const FOV = 46;
type V3 = [number, number, number];

// 0 = hook shield, 1..10 = roadmap stages. Scene 11 (finale) is an overview shot.
export const STATION_POS: V3[] = Array.from({ length: 11 }, (_, i) => [
  i === 0 ? 0 : 4.4 * Math.sin(i * 1.3),
  0,
  -i * 18,
]);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const bezier3 = (a: V3, c: V3, b: V3, t: number): V3 => lerp3(lerp3(a, c, t), lerp3(c, b, t), t);

export type CamState = { pos: V3; target: V3 };

const holdState = (i: number, u: number): CamState => {
  if (i >= 11) {
    // Finale: pull back high above the whole roadmap.
    const e = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, u / 0.35)));
    // framing solved so stations 1→10 stack from y≈1145 up to y≈570 on screen
    return {
      pos: [lerp(-1.5, 0.5, e), lerp(36, 40, e), lerp(50, 60, e)],
      target: [0, -14, -95],
    };
  }
  const p = STATION_POS[i];
  if (i === 0) {
    const d = interpolate(u, [0, 0.8], [17, 12.6], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    return {
      pos: [p[0] + Math.sin(u * 2.2 - 1.1) * 1.1, 2.4, p[2] + d],
      target: [p[0], 1.55, p[2]],
    };
  }
  const dir = i % 2 === 0 ? 1 : -1;
  const ang = interpolate(u, [0, 1], [-0.17, 0.17]) * dir;
  const d = interpolate(u, [0, 1], [14.2, 12.8]);
  return {
    pos: [p[0] + Math.sin(ang) * d, 4.1, p[2] + Math.cos(ang) * d],
    target: [p[0], 0.95, p[2]],
  };
};

const windowFor = (k: number) => {
  // transition from scene k -> k+1 (frames before / after the boundary)
  if (k === 0) return { pre: 56, post: 18, lift: 0.4 };
  if (k === 10) return { pre: 8, post: 120, lift: 0 };
  return { pre: 16, post: 20, lift: 1.6 };
};

const stateOf = (tl: Timeline, sceneIdx: number, frame: number): CamState => {
  const s = tl.scenes[sceneIdx];
  return holdState(sceneIdx, (frame - s.start) / s.dur);
};

export type CameraInfo = CamState & {
  /** continuous station index, e.g. 3.4 = flying from station 3 to 4 */
  stationFloat: number;
  sceneIdx: number;
};

const computeCamera = (frame: number, tl: Timeline): CameraInfo => {
  const sc = tl.scenes;
  for (let k = 0; k < sc.length - 1; k++) {
    const b = sc[k + 1].start;
    const w = windowFor(k);
    if (frame >= b - w.pre && frame <= b + w.post) {
      const raw = (frame - (b - w.pre)) / (w.pre + w.post);
      const s = Easing.inOut(Easing.cubic)(raw);
      const A = stateOf(tl, k, b - w.pre);
      const B = stateOf(tl, k + 1, b + w.post);
      let ctrl: V3 = [
        (A.pos[0] + B.pos[0]) / 2,
        (A.pos[1] + B.pos[1]) / 2 + w.lift * 2,
        (A.pos[2] + B.pos[2]) / 2,
      ];
      if (k === 0) ctrl = [0, 2.6, -3]; // fly straight through the shield first
      const pos = bezier3(A.pos, ctrl, B.pos, s);
      const target = lerp3(A.target, B.target, Easing.inOut(Easing.quad)(raw));
      return {
        pos,
        target,
        stationFloat: Math.min(10, k + s),
        sceneIdx: frame < b ? k : k + 1,
      };
    }
  }
  let idx = 0;
  for (let i = sc.length - 1; i >= 0; i--) {
    if (frame >= sc[i].start) {
      idx = i;
      break;
    }
  }
  return { ...stateOf(tl, idx, frame), stationFloat: Math.min(10, idx), sceneIdx: idx };
};

const cache = new Map<string, CameraInfo>();
export const getCamera = (frame: number, tl: Timeline): CameraInfo => {
  const key = `${tl.variant}:${frame}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const v = computeCamera(frame, tl);
  if (cache.size > 4000) cache.clear();
  cache.set(key, v);
  return v;
};

export const cameraSpeed = (frame: number, tl: Timeline) => {
  const a = getCamera(frame, tl).pos;
  const b = getCamera(Math.max(0, frame - 1), tl).pos;
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};

// --- projection of 3D anchors into overlay pixel space -------------------
const projCam = new THREE.PerspectiveCamera(FOV, VIDEO.width / VIDEO.height, 0.1, 600);
const tmp = new THREE.Vector3();

export const project = (frame: number, tl: Timeline, p: V3) => {
  const c = getCamera(frame, tl);
  projCam.position.set(...c.pos);
  projCam.lookAt(...c.target);
  projCam.updateMatrixWorld();
  tmp.set(...p).project(projCam);
  return {
    x: ((tmp.x + 1) / 2) * VIDEO.width,
    y: ((1 - tmp.y) / 2) * VIDEO.height,
    visible: tmp.z < 1 && tmp.z > -1,
  };
};

export const stationWorld = (i: number, local: V3): V3 => {
  const p = STATION_POS[i];
  return [p[0] + local[0], p[1] + local[1], p[2] + local[2]];
};

// --- the glowing roadmap path ---------------------------------------------
let curve: THREE.CatmullRomCurve3 | null = null;
let stationU: number[] = [];
export const getPathCurve = () => {
  if (!curve) {
    const pts = [
      new THREE.Vector3(0, -0.32, 3),
      ...STATION_POS.map((p) => new THREE.Vector3(p[0], -0.32, p[2])),
      new THREE.Vector3(STATION_POS[10][0], -0.32, STATION_POS[10][2] - 10),
    ];
    curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const samples = 2000;
    stationU = STATION_POS.map((p) => {
      let best = 0;
      let bestD = Infinity;
      for (let s = 0; s <= samples; s++) {
        const q = curve!.getPointAt(s / samples);
        const d = (q.x - p[0]) ** 2 + (q.z - p[2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = s / samples;
        }
      }
      return best;
    });
  }
  return { curve, stationU };
};

export const pathProgressU = (stationFloat: number) => {
  const { stationU: su } = getPathCurve();
  const i = Math.floor(stationFloat);
  const f = stationFloat - i;
  if (i >= su.length - 1) return su[su.length - 1];
  return lerp(su[i], su[i + 1], f);
};
