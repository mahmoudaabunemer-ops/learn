// Pure layout data shared by the Three.js stations and the 2D overlay
// (so overlay labels can be projected exactly onto 3D objects).
import * as THREE from "three";
import { Easing, interpolate, spring } from "remotion";

export type V3 = [number, number, number];

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.inOut(Easing.cubic);

/** 0..1 progress between two local frames */
export const ramp = (t: number, a: number, b: number, easing = ease) =>
  interpolate(t, [a, b], [0, 1], { ...clamp, easing });

export const pop = (t: number, at: number, fps = 30, damping = 13) =>
  spring({ frame: t - at, fps, config: { damping, stiffness: 140, mass: 0.7 } });

// ---------------- Computer (exploded view) ----------------
export const COMPUTER_TILT = 0.62;
export const computerExplode = (t: number, dur: number) =>
  spring({ frame: t - dur * 0.28, fps: 30, config: { damping: 16, stiffness: 60, mass: 1 } });

export const computerParts = (e: number) => ({
  board: [0, 0, 0] as V3,
  cpu: [0.55, 0.1 + 1.0 * e, -0.25] as V3,
  heatsink: [0.55, 0.42 + 1.9 * e, -0.25] as V3,
  ram: [-0.95 - 0.55 * e, 0.28 + 0.75 * e, -0.15] as V3,
  ssd: [0.35, 0.06 + 0.55 * e, 0.85 + 0.45 * e] as V3,
});

const tiltM = new THREE.Matrix4().makeRotationX(COMPUTER_TILT);
export const computerAnchor = (local: V3): V3 => {
  const v = new THREE.Vector3(...local).applyMatrix4(tiltM);
  return [v.x, v.y + 0.55, v.z];
};

// ---------------- Network topology ----------------
export const NET_NODES = {
  router: [0, 0.75, 0.1] as V3,
  switchR: [1.75, 0.35, 0.7] as V3,
  switchL: [-1.75, 0.35, 0.7] as V3,
  serverR: [1.45, 0.75, -1.7] as V3,
  serverC: [0, 0.75, -2.3] as V3,
  serverL: [-1.45, 0.75, -1.7] as V3,
  clientR: [0.95, 0.2, 2.0] as V3,
  clientL: [-0.95, 0.2, 2.0] as V3,
  globe: [0, 2.55, -0.9] as V3,
};
export type NetNode = keyof typeof NET_NODES;
export const NET_EDGES: [NetNode, NetNode][] = [
  ["router", "switchR"],
  ["router", "switchL"],
  ["router", "serverC"],
  ["switchR", "serverR"],
  ["switchL", "serverL"],
  ["switchR", "clientR"],
  ["switchL", "clientL"],
  ["router", "globe"],
];
export const edgePoint = (edge: number, s: number): V3 => {
  const [a, b] = NET_EDGES[edge];
  const A = NET_NODES[a];
  const B = NET_NODES[b];
  const lift = Math.sin(Math.PI * s) * 0.35;
  return [A[0] + (B[0] - A[0]) * s, A[1] + (B[1] - A[1]) * s + lift, A[2] + (B[2] - A[2]) * s];
};
/** packets: edge index, phase offset, speed (cycles per second), reverse */
export const PACKETS = NET_EDGES.flatMap((_, e) => [
  { edge: e, phase: (e * 0.37) % 1, speed: 0.55 + (e % 3) * 0.12, rev: false },
  { edge: e, phase: (e * 0.37 + 0.5) % 1, speed: 0.5 + (e % 2) * 0.15, rev: true },
]);
export const packetPos = (k: number, t: number): V3 => {
  const p = PACKETS[k];
  let s = (((p.phase + (t / 30) * p.speed) % 1) + 1) % 1;
  if (p.rev) s = 1 - s;
  return edgePoint(p.edge, s);
};
// packets carrying protocol tags in the overlay
export const TAGGED_PACKETS = [
  { k: 10, label: "TCP SYN", termIdx: 0 },
  { k: 14, label: "DNS Query", termIdx: 1 },
  { k: 13, label: "HTTP GET /", termIdx: 2 },
];

// ---------------- Security fundamentals (CIA triad) ----------------
export const CIA = {
  c: [0, 2.55, 0] as V3,
  i: [1.75, 0.45, 0.35] as V3,
  a: [-1.75, 0.45, 0.35] as V3,
};
export const DOME_CENTER: V3 = [0, 1.05, 0];
export const DOME_R = 1.05;

// ---------------- Cloud ----------------
export const CLOUD_CENTER: V3 = [0, 2.35, -0.4];
export const CLOUD_SERVERS: V3[] = [
  [1.55, 0, 0.35],
  [0, 0, 0.9],
  [-1.55, 0, 0.35],
];

// ---------------- Career tree ----------------
export const CAREER_ROOT: V3 = [0, 0.8, 0];
export const CAREER_LEAVES: V3[] = [
  [1.6, 1.55, 0.45],
  [0.95, 2.45, 0.1],
  [0, 2.85, -0.1],
  [-0.95, 2.45, 0.1],
  [-1.6, 1.55, 0.45],
];
export const CAREER_COLORS = ["#00D9E8", "#FF3D63", "#7DB7FF", "#E9C46A", "#2EE6A6"];
