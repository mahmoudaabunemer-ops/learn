import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { COLORS } from "../../theme";
import { getGlowTexture, Glow, NeonTube } from "../common";
import { clamp01, easeOutCubic } from "../math";
import type { StationProps } from "./types";

const makeShieldShape = () => {
  const s = new THREE.Shape();
  s.moveTo(0, 1.78);
  s.quadraticCurveTo(0.8, 1.98, 1.5, 1.72);
  s.bezierCurveTo(1.56, 0.55, 1.22, -0.95, 0, -1.85);
  s.bezierCurveTo(-1.22, -0.95, -1.56, 0.55, -1.5, 1.72);
  s.quadraticCurveTo(-0.8, 1.98, 0, 1.78);
  return s;
};

const pointInPoly = (x: number, y: number, poly: THREE.Vector2[]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

const N_FILL = 1500;
const N_EDGE = 420;

const neonMat = (c: string, o: number) => (
  <meshBasicMaterial color={c} transparent opacity={o} toneMapped={false} />
);

export const ShieldStation: React.FC<StationProps> = ({ t, dur }) => {
  const data = useMemo(() => {
    const shape = makeShieldShape();
    const poly = shape.getPoints(80);
    const target: number[] = [];
    let k = 0;
    while (target.length / 3 < N_FILL) {
      const x = (random(`sx${k}`) - 0.5) * 3.2;
      const y = (random(`sy${k}`) - 0.5) * 3.9;
      k++;
      if (pointInPoly(x, y, poly)) {
        target.push(x, y, (random(`sz${k}`) - 0.5) * 0.25);
      }
    }
    const edgeCurve = new THREE.CatmullRomCurve3(
      poly.slice(0, -1).map((p) => new THREE.Vector3(p.x, p.y, 0)),
      true,
    );
    for (let i = 0; i < N_EDGE; i++) {
      const p = edgeCurve.getPointAt(i / N_EDGE);
      target.push(p.x, p.y, 0.16);
    }
    const n = target.length / 3;
    const start = new Float32Array(n * 3);
    const delay = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const th = random(`th${i}`) * Math.PI * 2;
      const ph = Math.acos(2 * random(`ph${i}`) - 1);
      const r = 6 + random(`r${i}`) * 9;
      start[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      start[i * 3 + 1] = Math.cos(ph) * r * 0.7 + 0.5;
      start[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
      delay[i] = random(`d${i}`);
    }
    const geoFill = new THREE.BufferGeometry();
    geoFill.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N_FILL * 3), 3));
    const geoEdge = new THREE.BufferGeometry();
    geoEdge.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N_EDGE * 3), 3));
    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.07,
      bevelSegments: 3,
      curveSegments: 40,
    });
    extrude.translate(0, 0, -0.2);
    const outline = poly
      .slice(0, -1)
      .map((p) => [p.x * 1.03, p.y * 1.03, 0.12] as [number, number, number]);
    return { target: new Float32Array(target), start, delay, n, geoFill, geoEdge, extrude, outline };
  }, []);

  // assemble from scattered particles -> hold -> burst outward as the camera flies through
  const exitStart = dur - 60;
  const exit = clamp01((t - exitStart) / 46);
  const fill = data.geoFill.attributes.position as THREE.BufferAttribute;
  const edge = data.geoEdge.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < data.n; i++) {
    const a = easeOutCubic(clamp01((t - 4 - data.delay[i] * 50) / 48));
    const tx = data.target[i * 3];
    const ty = data.target[i * 3 + 1];
    const tz = data.target[i * 3 + 2];
    const sx = data.start[i * 3];
    const sy = data.start[i * 3 + 1];
    const sz = data.start[i * 3 + 2];
    const shimmer = Math.sin(t * 0.08 + i * 0.7) * 0.025;
    let x = sx + (tx - sx) * a;
    let y = sy + (ty - sy) * a;
    let z = sz + (tz - sz) * a + shimmer;
    if (exit > 0) {
      const e = exit * exit;
      const len = Math.hypot(tx, ty) + 0.3;
      x += (tx / len) * e * 7;
      y += (ty / len) * e * 7;
      z += (0.5 - data.delay[i]) * e * 6;
    }
    if (i < N_FILL) fill.setXYZ(i, x, y, z);
    else edge.setXYZ(i - N_FILL, x, y, z);
  }
  fill.needsUpdate = true;
  edge.needsUpdate = true;

  const solid = clamp01((t - 64) / 40) * (1 - clamp01((t - exitStart) / 20));
  const lockIn = clamp01((t - 90) / 25);
  const fade = 1 - exit;

  return (
    <group position={[0, 1.95, 0]}>
      <points geometry={data.geoFill}>
        <pointsMaterial
          map={getGlowTexture()}
          color={COLORS.cyan}
          size={0.085}
          transparent
          opacity={0.9 * fade}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      <points geometry={data.geoEdge}>
        <pointsMaterial
          map={getGlowTexture()}
          color={COLORS.goldLight}
          size={0.12}
          transparent
          opacity={fade}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      {solid > 0.01 ? (
        <>
          <mesh geometry={data.extrude} castShadow>
            <meshStandardMaterial
              color="#0f2a52"
              metalness={0.9}
              roughness={0.22}
              transparent
              opacity={0.82 * solid}
              emissive="#06324a"
              emissiveIntensity={0.6}
            />
          </mesh>
          <NeonTube points={data.outline} radius={0.03} color={COLORS.goldLight} closed segments={160} opacity={solid} />
        </>
      ) : null}
      {lockIn > 0.01 && solid > 0.01 ? (
        <group position={[0, -0.05, 0.22]} scale={0.6 + 0.4 * lockIn}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <boxGeometry args={[0.95, 0.78, 0.22]} />
            <meshStandardMaterial
              color={COLORS.goldLight}
              metalness={0.75}
              roughness={0.28}
              transparent
              opacity={solid}
              emissive={COLORS.gold}
              emissiveIntensity={0.45}
            />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <torusGeometry args={[0.32, 0.075, 16, 40, Math.PI]} />
            <meshStandardMaterial color="#d9dee8" metalness={1} roughness={0.15} transparent opacity={solid} />
          </mesh>
          <mesh position={[0, -0.08, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.04, 20]} />
            {neonMat(COLORS.cyan, solid)}
          </mesh>
          <mesh position={[0, -0.26, 0.12]}>
            <boxGeometry args={[0.06, 0.22, 0.04]} />
            {neonMat(COLORS.cyan, solid)}
          </mesh>
        </group>
      ) : null}
      <group rotation={[0.9 + Math.sin(t * 0.01) * 0.2, t * 0.012, 0.3]}>
        <mesh>
          <torusGeometry args={[2.55, 0.012, 8, 160]} />
          {neonMat(COLORS.cyan, 0.6 * fade * clamp01(t / 40))}
        </mesh>
      </group>
      <group rotation={[-1.1, -t * 0.009, -0.4]}>
        <mesh>
          <torusGeometry args={[2.8, 0.01, 8, 160]} />
          {neonMat(COLORS.goldLight, 0.45 * fade * clamp01(t / 50))}
        </mesh>
      </group>
      <Glow scale={10} color={COLORS.cyan} opacity={0.32 * fade} position={[0, 0, -0.6]} />
    </group>
  );
};
