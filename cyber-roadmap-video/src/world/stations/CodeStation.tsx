import React, { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "../../theme";
import { Glow, NeonTube } from "../common";
import type { V3 } from "../layout";
import { mod1 } from "../math";
import type { StationProps } from "./types";

const gearShape = (teeth: number, r: number, depthT = 0.14) => {
  const s = new THREE.Shape();
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const phase = i % 4;
    const rr = phase === 1 || phase === 2 ? r + depthT : r;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, r * 0.32, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
};

const Gear: React.FC<{ teeth: number; r: number; rot: number; color: string; position: V3 }> = ({ teeth, r, rot, color, position }) => {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(gearShape(teeth, r), { depth: 0.18, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
    g.translate(0, 0, -0.09);
    return g;
  }, [teeth, r]);
  return (
    <group position={position} rotation={[0, 0, rot]}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.11]}>
        <ringGeometry args={[r * 0.36, r * 0.46, 32]} />
        <meshBasicMaterial color={COLORS.cyan} toneMapped={false} />
      </mesh>
    </group>
  );
};

// conveyor path for data: enters on the right, passes the gears, exits left (RTL)
const LANE: V3[] = [
  [2.7, 0.35, 1.3],
  [1.4, 0.35, 1.1],
  [0.4, 0.5, 0.75],
  [-0.6, 0.45, 0.95],
  [-1.6, 0.35, 1.2],
  [-2.7, 0.35, 1.3],
];

export const CodeStation: React.FC<StationProps> = ({ t }) => {
  const w = 0.022;
  const lane = useMemo(() => new THREE.CatmullRomCurve3(LANE.map((p) => new THREE.Vector3(...p))), []);
  return (
    <group>
      <group position={[0, 0, -0.9]}>
        <Gear teeth={16} r={0.85} rot={t * w} color="#c9a24a" position={[0.25, 1.35, 0]} />
        <Gear teeth={11} r={0.56} rot={-t * w * (0.85 / 0.56) + 0.14} color="#b8c3d3" position={[-1.29, 1.95, 0]} />
        <Gear teeth={9} r={0.44} rot={-t * w * (0.85 / 0.44) + 0.2} color="#b8c3d3" position={[1.6, 0.48, 0]} />
        <Glow position={[0.25, 1.35, -0.3]} scale={4} color={COLORS.goldLight} opacity={0.22} />
      </group>
      <NeonTube points={LANE} radius={0.03} color={COLORS.cyan} opacity={0.5} segments={80} />
      {Array.from({ length: 9 }, (_, k) => {
        const s = mod1((t / 30) * 0.22 + k / 9);
        const p = lane.getPointAt(s);
        const done = s > 0.5;
        const c = done ? COLORS.goldLight : COLORS.cyan;
        return (
          <group key={k} position={[p.x, p.y + 0.12, p.z]} rotation={[t * 0.05 + k, t * 0.04, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.2, 0.2]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.7} metalness={0.4} roughness={0.3} />
            </mesh>
            <Glow scale={0.8} color={c} opacity={0.6} />
          </group>
        );
      })}
      {/* processing gate where code turns into automation */}
      <group position={[0.4, 0.55, 0.75]} rotation={[0, 0.2, 0]}>
        <mesh>
          <torusGeometry args={[0.38, 0.03, 10, 48]} />
          <meshBasicMaterial color={COLORS.goldLight} toneMapped={false} />
        </mesh>
        <Glow scale={1.6} color={COLORS.goldLight} opacity={0.4 + 0.2 * Math.sin(t * 0.2)} />
      </group>
    </group>
  );
};
