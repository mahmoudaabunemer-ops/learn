import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { COLORS } from "../../theme";
import { stageById } from "../../content";
import { Glow, NeonTube } from "../common";
import { CIA, DOME_CENTER, DOME_R, pop, ramp } from "../layout";
import { clamp01 } from "../math";
import type { StationProps } from "./types";

const terms = stageById("secfund")!.terms;
const N_THREATS = 7;
const PERIOD = 96;

export const SecFundStation: React.FC<StationProps> = ({ t, dur }) => {
  const threats = useMemo(
    () =>
      Array.from({ length: N_THREATS }, (_, k) => {
        const th = (random(`ta${k}`) - 0.5) * 2.6;
        const ph = 0.15 + random(`tb${k}`) * 0.9;
        const dir = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.sin(ph) * 0.8, Math.cos(th) * Math.cos(ph)).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        const side = new THREE.Vector3(random(`tc${k}`) - 0.5, random(`td${k}`) - 0.5, 0).multiplyScalar(1.6);
        return { dir, q, side, offset: (k * PERIOD) / N_THREATS };
      }),
    [],
  );
  const dome = pop(t, 8, 30, 16);
  const ciaIn = ramp(t, terms[0].at * dur - 20, terms[0].at * dur + 10);
  const lock = pop(t, terms[1].at * dur - 4);
  const mfa = pop(t, terms[2].at * dur - 4);
  const iam = pop(t, terms[3].at * dur - 4);
  const C = new THREE.Vector3(...DOME_CENTER);

  return (
    <group>
      {/* data being protected: documents + database */}
      <group position={[0, 0.05, 0]}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0.05 * k - 0.05, 0.35 + k * 0.11, -0.04 * k]} rotation={[0, 0.2 * k - 0.2, 0]} castShadow>
            <boxGeometry args={[0.7, 0.06, 0.9]} />
            <meshStandardMaterial color="#e6edf7" roughness={0.6} emissive="#7fa3c8" emissiveIntensity={0.15} />
          </mesh>
        ))}
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[-0.9, 0.2 + k * 0.26, -0.35]}>
            <cylinderGeometry args={[0.28, 0.28, 0.2, 28]} />
            <meshStandardMaterial color="#1b4b7c" metalness={0.8} roughness={0.25} emissive={COLORS.cyan} emissiveIntensity={0.12} />
          </mesh>
        ))}
        {lock > 0.01 ? (
          <group position={[0.15, 1.0, 0.25]} scale={lock * 0.7}>
            <mesh position={[0, -0.1, 0]} castShadow>
              <boxGeometry args={[0.55, 0.45, 0.16]} />
              <meshStandardMaterial color={COLORS.goldLight} metalness={1} roughness={0.18} emissive={COLORS.gold} emissiveIntensity={0.45} />
            </mesh>
            <mesh position={[0, 0.17, 0]}>
              <torusGeometry args={[0.18, 0.05, 12, 32, Math.PI]} />
              <meshStandardMaterial color="#e5e9f0" metalness={1} roughness={0.18} />
            </mesh>
            <Glow scale={1.8} color={COLORS.goldLight} opacity={0.5} />
          </group>
        ) : null}
        {/* MFA: second factor token orbiting */}
        {mfa > 0.01 ? (
          <group position={[0.15, 1.0, 0.25]} rotation={[0, t * 0.06, 0]}>
            <group position={[0.75, 0.1, 0]} scale={mfa * 0.55}>
              <mesh>
                <boxGeometry args={[0.32, 0.56, 0.05]} />
                <meshStandardMaterial color="#0f1d33" metalness={0.6} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.03, 0.03]}>
                <boxGeometry args={[0.26, 0.4, 0.01]} />
                <meshBasicMaterial color={COLORS.green} toneMapped={false} />
              </mesh>
            </group>
          </group>
        ) : null}
        {/* IAM: identity badge */}
        {iam > 0.01 ? (
          <group position={[0.95, 0.75, 0.55]} scale={iam * 0.6} rotation={[0, -0.3, 0]}>
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.16, 20, 14]} />
              <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, -0.05, 0]} scale={[1, 0.7, 0.6]}>
              <sphereGeometry args={[0.26, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={COLORS.cyan} emissive={COLORS.cyan} emissiveIntensity={0.6} />
            </mesh>
            <Glow scale={1.4} color={COLORS.cyan} opacity={0.5} />
          </group>
        ) : null}
      </group>
      {/* protective dome */}
      <group position={DOME_CENTER} scale={dome}>
        <mesh rotation={[0, t * 0.004, 0]}>
          <icosahedronGeometry args={[DOME_R, 2]} />
          <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.35} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[DOME_R * 0.98, 40, 28]} />
          <meshStandardMaterial color="#0c3a5c" transparent opacity={0.16} emissive={COLORS.cyan} emissiveIntensity={0.18} depthWrite={false} />
        </mesh>
      </group>
      {/* CIA triad */}
      {ciaIn > 0.01 ? (
        <group>
          <NeonTube points={[CIA.c, CIA.i, CIA.a, CIA.c]} smooth={false} radius={0.025} color={COLORS.goldLight} progress={ciaIn} segments={90} />
          {[CIA.c, CIA.i, CIA.a].map((p, k) => (
            <group key={k} position={p} scale={clamp01(ciaIn * 3 - k)}>
              <mesh>
                <icosahedronGeometry args={[0.17, 1]} />
                <meshStandardMaterial color={COLORS.goldLight} emissive={COLORS.gold} emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
              </mesh>
              <Glow scale={1.2} color={COLORS.goldLight} opacity={0.6} />
            </group>
          ))}
        </group>
      ) : null}
      {/* threats bounce off the dome */}
      {dome > 0.5
        ? threats.map((th, k) => {
            const tau = (((t - th.offset) % PERIOD) + PERIOD) % PERIOD;
            const impact = C.clone().addScaledVector(th.dir, DOME_R);
            const start = C.clone().addScaledVector(th.dir, 5.2).add(th.side);
            let pos: THREE.Vector3;
            let alpha = 1;
            if (tau < 34) {
              const s = tau / 34;
              pos = start.clone().lerp(impact, s * s);
            } else {
              const s = (tau - 34) / 30;
              pos = impact.clone().addScaledVector(th.dir, s * 2.6).addScaledVector(th.side, -s * 0.5);
              alpha = clamp01(1 - s);
            }
            const ring = tau >= 34 && tau < 56 ? (tau - 34) / 22 : -1;
            return (
              <group key={k}>
                {alpha > 0.01 ? (
                  <group position={pos.toArray()} rotation={[t * 0.1 + k, t * 0.13, 0]}>
                    <mesh>
                      <octahedronGeometry args={[0.13, 0]} />
                      <meshStandardMaterial color={COLORS.red} emissive={COLORS.red} emissiveIntensity={0.9} transparent opacity={alpha} />
                    </mesh>
                    <Glow scale={0.8} color={COLORS.red} opacity={0.7 * alpha} />
                  </group>
                ) : null}
                {ring >= 0 ? (
                  <mesh position={impact.toArray()} quaternion={th.q} scale={0.15 + ring * 0.7}>
                    <torusGeometry args={[0.5, 0.03, 8, 40]} />
                    <meshBasicMaterial color={COLORS.cyan} transparent opacity={1 - ring} toneMapped={false} />
                  </mesh>
                ) : null}
              </group>
            );
          })
        : null}
    </group>
  );
};
