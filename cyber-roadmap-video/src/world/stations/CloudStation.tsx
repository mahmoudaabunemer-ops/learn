import React from "react";
import { COLORS } from "../../theme";
import { stageById } from "../../content";
import { Glow, NeonTube } from "../common";
import { CLOUD_CENTER, CLOUD_SERVERS, pop, ramp } from "../layout";
import type { V3 } from "../layout";
import type { StationProps } from "./types";

const terms = stageById("cloud")!.terms;

const PUFFS: [number, number, number, number][] = [
  [0, 0, 0, 0.62],
  [0.62, -0.12, 0.05, 0.48],
  [-0.62, -0.1, 0.05, 0.5],
  [1.1, -0.25, 0, 0.34],
  [-1.1, -0.25, 0, 0.36],
  [0.3, 0.35, -0.1, 0.45],
  [-0.32, 0.3, -0.05, 0.42],
  [0, -0.22, 0.32, 0.42],
  [0.6, 0.1, -0.35, 0.38],
  [-0.6, 0.08, -0.35, 0.38],
];

export const CloudStation: React.FC<StationProps> = ({ t, dur }) => {
  const bob = Math.sin(t * 0.04) * 0.08;
  const iam = pop(t, terms[2].at * dur - 4);
  const highlight = [terms[0].at, 0.42, terms[1].at].map((a) => (t > a * dur - 4 ? 1 : 0));
  const c: V3 = [CLOUD_CENTER[0], CLOUD_CENTER[1] + bob, CLOUD_CENTER[2]];
  return (
    <group>
      <group position={c}>
        {PUFFS.map(([x, y, z, r], k) => (
          <mesh key={k} position={[x, y, z]} castShadow>
            <sphereGeometry args={[r, 32, 24]} />
            <meshStandardMaterial color="#dff3ff" roughness={0.85} metalness={0} emissive="#3fd6ee" emissiveIntensity={0.22} transparent opacity={0.93} />
          </mesh>
        ))}
        <Glow scale={5} color={COLORS.cyan} opacity={0.35} />
        {/* region orbits */}
        <group rotation={[1.25, 0, t * 0.01]}>
          <mesh>
            <torusGeometry args={[1.7, 0.012, 8, 120]} />
            <meshBasicMaterial color={COLORS.goldLight} transparent opacity={0.7} toneMapped={false} />
          </mesh>
          <mesh position={[Math.cos(t * 0.05) * 1.7, Math.sin(t * 0.05) * 1.7, 0]}>
            <sphereGeometry args={[0.06, 12, 8]} />
            <meshBasicMaterial color={COLORS.goldLight} toneMapped={false} />
          </mesh>
        </group>
        <group rotation={[1.45, 0.35, -t * 0.012]}>
          <mesh>
            <torusGeometry args={[1.95, 0.01, 8, 120]} />
            <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.6} toneMapped={false} />
          </mesh>
        </group>
        {iam > 0.01 ? (
          <group position={[0, -0.05, 0.75]} scale={iam * 0.75}>
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.5, 0.42, 0.14]} />
              <meshStandardMaterial color={COLORS.goldLight} metalness={1} roughness={0.18} emissive={COLORS.gold} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <torusGeometry args={[0.16, 0.045, 12, 32, Math.PI]} />
              <meshStandardMaterial color="#e6eaf1" metalness={1} roughness={0.15} />
            </mesh>
            <Glow scale={1.8} color={COLORS.goldLight} opacity={0.6} />
          </group>
        ) : null}
      </group>
      {CLOUD_SERVERS.map((p, k) => {
        const on = highlight[k];
        const top: V3 = [p[0], 1.25, p[2]];
        const lnk = ramp(t, -20 + k * 8, 10 + k * 8);
        return (
          <group key={k}>
            <group position={[p[0], 0.6, p[2]]}>
              <mesh castShadow>
                <boxGeometry args={[0.72, 1.2, 0.72]} />
                <meshStandardMaterial color="#132744" metalness={0.85} roughness={0.28} emissive={on ? "#0a4a66" : "#000000"} emissiveIntensity={on ? 0.5 : 0} />
              </mesh>
              {Array.from({ length: 5 }, (_, r) => (
                <mesh key={r} position={[0, -0.42 + r * 0.21, 0.365]}>
                  <boxGeometry args={[0.55, 0.03, 0.01]} />
                  <meshBasicMaterial color={on && r === 4 ? COLORS.goldLight : Math.sin(t * 0.3 + r + k) > 0 ? COLORS.cyan : "#1d4a6b"} toneMapped={false} />
                </mesh>
              ))}
            </group>
            <NeonTube points={[top, [p[0] * 0.6, 1.75, p[2] * 0.4 - 0.2], [c[0] + p[0] * 0.3, c[1] - 0.45, c[2]]]} radius={0.02} color={on ? COLORS.goldLight : COLORS.cyan} progress={lnk} segments={30} opacity={0.8} />
            {lnk >= 1
              ? [0, 1].map((j) => {
                  const s = ((((t / 30) * 0.7 + j * 0.5 + k * 0.2) % 1) + 1) % 1;
                  const up = j === 0;
                  const ss = up ? s : 1 - s;
                  const pos: V3 = [
                    top[0] + (c[0] + p[0] * 0.3 - top[0]) * ss,
                    top[1] + (c[1] - 0.45 - top[1]) * ss + Math.sin(ss * Math.PI) * 0.2,
                    top[2] + (c[2] - top[2]) * ss,
                  ];
                  return (
                    <group key={j} position={pos}>
                      <mesh>
                        <sphereGeometry args={[0.055, 10, 8]} />
                        <meshBasicMaterial color={up ? COLORS.cyan : COLORS.goldLight} toneMapped={false} />
                      </mesh>
                      <Glow scale={0.5} color={up ? COLORS.cyan : COLORS.goldLight} />
                    </group>
                  );
                })
              : null}
          </group>
        );
      })}
    </group>
  );
};
