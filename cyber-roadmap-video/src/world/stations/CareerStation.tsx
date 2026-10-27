import React from "react";
import { COLORS } from "../../theme";
import { CAREERS, PROJECTS } from "../../content";
import { Glow, NeonTube } from "../common";
import { CAREER_COLORS, CAREER_LEAVES, CAREER_ROOT, pop, ramp } from "../layout";
import type { V3 } from "../layout";
import type { StationProps } from "./types";

export const CareerStation: React.FC<StationProps> = ({ t, dur }) => {
  const trunk = ramp(t, dur * 0.08, dur * 0.18);
  return (
    <group>
      <NeonTube points={[[0, 0, 0], [0, 0.4, 0.02], CAREER_ROOT]} radius={0.07} color={COLORS.goldLight} progress={trunk} segments={20} />
      <group position={CAREER_ROOT} scale={trunk}>
        <mesh>
          <icosahedronGeometry args={[0.2, 1]} />
          <meshStandardMaterial color={COLORS.goldLight} emissive={COLORS.gold} emissiveIntensity={0.9} metalness={0.8} roughness={0.2} />
        </mesh>
        <Glow scale={1.6} color={COLORS.goldLight} opacity={0.7} />
      </group>
      {CAREER_LEAVES.map((leaf, k) => {
        const at = CAREERS[k].at * dur;
        const grow = ramp(t, at - 14, at + 6);
        const mid: V3 = [leaf[0] * 0.45, CAREER_ROOT[1] + (leaf[1] - CAREER_ROOT[1]) * 0.75, leaf[2] * 0.5];
        const s = pop(t, at + 2);
        const col = CAREER_COLORS[k];
        return (
          <group key={k}>
            <NeonTube points={[CAREER_ROOT, mid, leaf]} radius={0.032} color={col} progress={grow} segments={36} />
            {s > 0.01 ? (
              <group position={leaf} scale={s} rotation={[t * 0.02, t * 0.03 + k, 0]}>
                <mesh castShadow>
                  <icosahedronGeometry args={[0.2, 0]} />
                  <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.7} metalness={0.6} roughness={0.25} flatShading />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.34, 0.01, 8, 40]} />
                  <meshBasicMaterial color={col} toneMapped={false} />
                </mesh>
                <Glow scale={1.4} color={col} opacity={0.65} />
              </group>
            ) : null}
          </group>
        );
      })}
      {/* portfolio: project blocks stack up in front of the tree */}
      {PROJECTS.map((p, k) => {
        const s = pop(t, p.at * dur);
        if (s < 0.01) return null;
        const src = CAREER_LEAVES[(k * 2) % 5];
        const dst: V3 = [0.9 - k * 0.6, 0.18, 1.35];
        const f = Math.min(1, s);
        const pos: V3 = [src[0] + (dst[0] - src[0]) * f, src[1] + (dst[1] - src[1]) * f + Math.sin(f * Math.PI) * 0.6, src[2] + (dst[2] - src[2]) * f];
        return (
          <group key={k} position={pos} rotation={[0, 0.3 * (1 - f) + t * 0.004, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.42, 0.3, 0.42]} />
              <meshStandardMaterial color="#13294b" metalness={0.8} roughness={0.25} emissive="#0a3a5a" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.152, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.36, 0.36]} />
              <meshBasicMaterial color={COLORS.goldLight} transparent opacity={0.85} toneMapped={false} />
            </mesh>
            <Glow scale={0.9} color={COLORS.goldLight} opacity={0.45} />
          </group>
        );
      })}
    </group>
  );
};
