import React, { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "../../theme";
import { stageById } from "../../content";
import { Glow, NeonTube } from "../common";
import { pop } from "../layout";
import type { V3 } from "../layout";
import type { StationProps } from "./types";

const terms = stageById("hacking")!.terms;
export const LAB_VULNS: V3[] = [
  [-0.62, 1.55, 0.42],
  [-0.62, 0.85, 0.42],
  [0.75, 1.5, 0.08],
  [0.95, 1.05, 0.08],
];
const SCANNER: V3 = [2.0, 2.65, 1.4];

export const LabStation: React.FC<StationProps> = ({ t, dur }) => {
  const box = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(3.4, 2.4, 2.2)), []);
  const owasp = terms[0].at * dur;
  const fixAt = terms[2].at * dur + 22;
  const scanY = 1.25 + Math.sin(t * 0.07) * 1.0;
  const current = Math.floor(Math.max(0, t - owasp + 10) / 14) % LAB_VULNS.length;
  return (
    <group>
      {/* isolated sandbox enclosure */}
      <group position={[0, 1.22, 0]}>
        <lineSegments geometry={box}>
          <lineBasicMaterial color={COLORS.cyan} toneMapped={false} />
        </lineSegments>
        <mesh>
          <boxGeometry args={[3.38, 2.38, 2.18]} />
          <meshStandardMaterial color="#0a3050" transparent opacity={0.1} emissive={COLORS.cyan} emissiveIntensity={0.05} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* target server */}
      <mesh position={[-0.62, 1.05, 0]} castShadow>
        <boxGeometry args={[0.78, 1.7, 0.8]} />
        <meshStandardMaterial color="#14284a" metalness={0.85} roughness={0.28} />
      </mesh>
      {Array.from({ length: 7 }, (_, k) => (
        <mesh key={k} position={[-0.62, 0.42 + k * 0.2, 0.405]}>
          <boxGeometry args={[0.6, 0.03, 0.01]} />
          <meshBasicMaterial color={Math.sin(t * 0.25 + k) > 0 ? COLORS.cyan : "#1d4a6b"} toneMapped={false} />
        </mesh>
      ))}
      {/* web application under test */}
      <group position={[0.85, 1.3, 0]} rotation={[0, -0.25, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.25, 0.9, 0.05]} />
          <meshStandardMaterial color="#0c1a30" metalness={0.6} roughness={0.3} />
        </mesh>
        {[
          [0, 0.33, 1.1, 0.06],
          [-0.3, 0.12, 0.5, 0.18],
          [0.28, 0.12, 0.45, 0.04],
          [0.28, 0.02, 0.45, 0.04],
          [0, -0.22, 1.05, 0.1],
        ].map(([x, y, w, h], k) => (
          <mesh key={k} position={[x, y, 0.03]}>
            <planeGeometry args={[w, h]} />
            <meshBasicMaterial color={k === 0 ? COLORS.goldLight : COLORS.cyan} transparent opacity={0.7} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* scanning plane */}
      <mesh position={[0, scanY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.3, 2.1]} />
        <meshBasicMaterial color={COLORS.goldLight} transparent opacity={0.13} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* scanner probe + beam to the current finding */}
      <group position={SCANNER}>
        <mesh>
          <icosahedronGeometry args={[0.18, 1]} />
          <meshStandardMaterial color={COLORS.goldLight} emissive={COLORS.gold} emissiveIntensity={0.9} metalness={0.7} roughness={0.2} />
        </mesh>
        <Glow scale={1.4} color={COLORS.goldLight} opacity={0.7} />
      </group>
      {t > owasp - 10 ? (
        <NeonTube points={[SCANNER, LAB_VULNS[current]]} smooth={false} radius={0.012} color={COLORS.goldLight} opacity={0.85} segments={8} />
      ) : null}
      {/* findings: red while open, green once remediated */}
      {LAB_VULNS.map((p, k) => {
        const s = pop(t, owasp + k * 14 - 6);
        if (s < 0.01) return null;
        const fixed = t > fixAt + k * 6;
        const c = fixed ? COLORS.green : COLORS.red;
        const beat = 0.85 + 0.15 * Math.sin(t * 0.3 + k);
        return (
          <group key={k} position={p} scale={s * beat}>
            <mesh>
              <sphereGeometry args={[0.07, 14, 10]} />
              <meshBasicMaterial color={c} toneMapped={false} />
            </mesh>
            <mesh>
              <torusGeometry args={[0.16, 0.012, 8, 32]} />
              <meshBasicMaterial color={c} toneMapped={false} />
            </mesh>
            <Glow scale={0.9} color={c} opacity={0.8} />
          </group>
        );
      })}
    </group>
  );
};
