import React, { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "../../theme";
import { stageById } from "../../content";
import { Glow } from "../common";
import { pop } from "../layout";
import type { StationProps } from "./types";

const terms = stageById("os")!.terms;

const Penguin: React.FC<{ t: number }> = ({ t }) => (
  <group rotation={[0, 0.35 + Math.sin(t * 0.05) * 0.15, Math.sin(t * 0.09) * 0.05]}>
    <mesh position={[0, 0.62, 0]} scale={[1, 1.32, 0.9]} castShadow>
      <sphereGeometry args={[0.5, 32, 24]} />
      <meshStandardMaterial color="#141a26" metalness={0.2} roughness={0.45} />
    </mesh>
    <mesh position={[0, 0.55, 0.2]} scale={[0.82, 1.12, 0.6]}>
      <sphereGeometry args={[0.45, 32, 24]} />
      <meshStandardMaterial color="#f2f4f8" roughness={0.6} />
    </mesh>
    <mesh position={[0, 1.42, 0]} castShadow>
      <sphereGeometry args={[0.36, 32, 24]} />
      <meshStandardMaterial color="#141a26" metalness={0.2} roughness={0.45} />
    </mesh>
    {[-0.12, 0.12].map((x) => (
      <group key={x} position={[x, 1.5, 0.29]}>
        <mesh>
          <sphereGeometry args={[0.085, 16, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.04, 12, 8]} />
          <meshStandardMaterial color="#05070c" />
        </mesh>
      </group>
    ))}
    <mesh position={[0, 1.33, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
      <coneGeometry args={[0.1, 0.26, 16]} />
      <meshStandardMaterial color="#f5a623" roughness={0.4} />
    </mesh>
    {[-0.22, 0.22].map((x) => (
      <mesh key={x} position={[x, 0.04, 0.16]} scale={[1, 0.35, 1.5]}>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshStandardMaterial color="#f5a623" roughness={0.4} />
      </mesh>
    ))}
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.48, 0.7, 0]} rotation={[0, 0, s * (0.35 + Math.sin(t * 0.12) * 0.08)]} scale={[0.35, 1.2, 0.6]}>
        <sphereGeometry args={[0.32, 16, 12]} />
        <meshStandardMaterial color="#141a26" roughness={0.5} />
      </mesh>
    ))}
  </group>
);

const Folder: React.FC<{ color: string }> = ({ color }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.4, -0.28);
    s.lineTo(0.4, -0.28);
    s.lineTo(0.4, 0.2);
    s.lineTo(-0.02, 0.2);
    s.lineTo(-0.1, 0.3);
    s.lineTo(-0.4, 0.3);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  }, []);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.35} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  );
};

export const OSStation: React.FC<StationProps> = ({ t, dur }) => {
  const winIn = pop(t, terms[0].at * dur - 6);
  const tuxIn = pop(t, terms[1].at * dur - 6);
  const filesIn = pop(t, terms[2].at * dur - 6);
  const lockIn = pop(t, terms[3].at * dur - 4);
  return (
    <group>
      {/* Windows (right) */}
      <group position={[2.15, 1.25, 0.4]} rotation={[0, -0.4 + Math.sin(t * 0.03) * 0.08, 0]} scale={0.4 + 0.6 * winIn}>
        {[
          [-0.26, 0.26],
          [0.26, 0.26],
          [-0.26, -0.26],
          [0.26, -0.26],
        ].map(([x, y], k) => (
          <mesh key={k} position={[x, y, 0]} castShadow>
            <boxGeometry args={[0.48, 0.48, 0.1]} />
            <meshStandardMaterial
              color="#1593ff"
              emissive={winIn > 0.5 ? COLORS.cyan : "#0a3a66"}
              emissiveIntensity={0.25 + winIn * 0.6}
              metalness={0.4}
              roughness={0.3}
            />
          </mesh>
        ))}
        <Glow scale={2.6} color={COLORS.cyan} opacity={0.18 + winIn * 0.35} />
      </group>
      {/* Linux (left) */}
      <group position={[-2.15, 0, 0.35]} scale={0.75 + 0.25 * tuxIn}>
        <Penguin t={t} />
        <Glow position={[0, 0.9, -0.3]} scale={2.6} color={COLORS.goldLight} opacity={0.12 + tuxIn * 0.25} />
      </group>
      {/* file system orbit */}
      <group position={[0, 1.7, -1.6]} rotation={[0.25, t * 0.012, 0]}>
        {Array.from({ length: 5 }, (_, k) => {
          const a = (k / 5) * Math.PI * 2;
          const r = 1.25 * (0.3 + 0.7 * filesIn);
          return (
            <group key={k} position={[Math.cos(a) * r, Math.sin(t * 0.05 + k) * 0.12, Math.sin(a) * r]} rotation={[0, -a + Math.PI / 2, 0]} scale={0.6 + 0.4 * filesIn}>
              <Folder color={k % 2 ? COLORS.gold : "#1e6fb8"} />
              {lockIn > 0.01 ? (
                <group position={[0, 0, 0.16]} scale={lockIn * 0.5}>
                  <mesh position={[0, -0.06, 0]}>
                    <boxGeometry args={[0.38, 0.3, 0.08]} />
                    <meshStandardMaterial color={COLORS.goldLight} metalness={1} roughness={0.2} emissive={COLORS.gold} emissiveIntensity={0.5} />
                  </mesh>
                  <mesh position={[0, 0.12, 0]}>
                    <torusGeometry args={[0.12, 0.035, 10, 24, Math.PI]} />
                    <meshStandardMaterial color="#e5e9f0" metalness={1} roughness={0.2} />
                  </mesh>
                </group>
              ) : null}
            </group>
          );
        })}
      </group>
    </group>
  );
};
