import React from "react";
import * as THREE from "three";
import { random } from "remotion";
import { COLORS } from "../../theme";
import { stageById } from "../../content";
import { Glow } from "../common";
import { pop } from "../layout";
import { clamp01 } from "../math";
import type { StationProps } from "./types";

const terms = stageById("netsec")!.terms;
const ROWS = 6;
const COLS = 7;
const PERIOD = 84;
const N_PACKETS = 12;

export const FIREWALL_YAW = 0.95;

export const FirewallStation: React.FC<StationProps> = ({ t, dur }) => {
  const vpn = pop(t, terms[1].at * dur - 6, 30, 15);
  const ids = pop(t, terms[2].at * dur - 6, 30, 15);
  const ips = t > terms[3].at * dur - 4 ? 1 : 0;
  return (
    <group rotation={[0, FIREWALL_YAW, 0]}>
      {/* brick wall in local plane x = 0 */}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (__, c) => {
          const z = -2.0 + c * 0.64 + (r % 2 ? 0.32 : 0);
          if (z > 2.25) return null;
          const wave = 0.5 + 0.5 * Math.sin(t * 0.12 - r * 0.6 + c * 0.9);
          return (
            <mesh key={`${r}-${c}`} position={[0, 0.17 + r * 0.32, z]} castShadow receiveShadow>
              <boxGeometry args={[0.34, 0.29, 0.6]} />
              <meshStandardMaterial color="#26395e" metalness={0.35} roughness={0.42} emissive="#ff7a1a" emissiveIntensity={0.01 + wave * 0.06} />
            </mesh>
          );
        }),
      )}
      {/* energy shield */}
      <mesh position={[0.25, 1.05, 0.1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.9, 2.3]} />
        <meshBasicMaterial
          color={COLORS.goldLight}
          transparent
          opacity={0.1 + 0.05 * Math.sin(t * 0.37) + 0.04 * Math.sin(t * 1.3)}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.27, 0.1 + ((t * 0.035) % 1) * 1.9, 0.1]}>
        <boxGeometry args={[0.01, 0.02, 4.9]} />
        <meshBasicMaterial color={COLORS.goldLight} toneMapped={false} />
      </mesh>
      {/* IDS inspection gate */}
      {ids > 0.01 ? (
        <group position={[1.75, 1.05, 0.1]} scale={[1, ids, ids]}>
          {[
            [0, 1.2, 0, 0.06, 0.06, 4.8],
            [0, -1.2, 0, 0.06, 0.06, 4.8],
            [0, 0, 2.4, 0.06, 2.4, 0.06],
            [0, 0, -2.4, 0.06, 2.4, 0.06],
          ].map(([x, y, z, a, b, c], k) => (
            <mesh key={k} position={[x, y, z]}>
              <boxGeometry args={[a, b, c]} />
              <meshBasicMaterial color={COLORS.cyan} toneMapped={false} />
            </mesh>
          ))}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[4.8, 2.4]} />
            <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.06} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
      {/* VPN tunnel through the wall */}
      {vpn > 0.01 ? (
        <group position={[0, 1.55, 1.55]} rotation={[0, 0, Math.PI / 2]} scale={[1, vpn, 1]}>
          <mesh>
            <cylinderGeometry args={[0.26, 0.26, 7, 32, 1, true]} />
            <meshStandardMaterial color={COLORS.green} transparent opacity={0.2} emissive={COLORS.green} emissiveIntensity={0.4} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          {[0, 1, 2].map((k) => (
            <mesh key={k} position={[0, 3.5 - (((t * 0.11 + k * 2.3) % 7) + 7) % 7, 0]}>
              <ringGeometry args={[0.25, 0.27, 32]} />
              <meshBasicMaterial color={COLORS.green} side={THREE.DoubleSide} toneMapped={false} />
            </mesh>
          ))}
          {[0, 1, 2, 3].map((k) => (
            <group key={`p${k}`} position={[0, 3.5 - (((t * 0.09 + k * 1.75) % 7) + 7) % 7, 0]}>
              <mesh>
                <sphereGeometry args={[0.08, 12, 8]} />
                <meshBasicMaterial color={COLORS.green} toneMapped={false} />
              </mesh>
              <Glow scale={0.6} color={COLORS.green} />
            </group>
          ))}
        </group>
      ) : null}
      {/* traffic: clean packets pass, malicious ones are blocked and shatter */}
      {Array.from({ length: N_PACKETS }, (_, k) => {
        const bad = k % 3 === 0;
        const y = 0.3 + random(`fy${k}`) * 1.5;
        const z = -1.9 + random(`fz${k}`) * 3.0;
        const tau = (((t + k * (PERIOD / N_PACKETS)) % PERIOD) + PERIOD) % PERIOD;
        const s = tau / PERIOD;
        let x = 3.6 - s * 7.2;
        const hitX = 0.35;
        const flagged = bad && ids > 0.5 && x < 1.75;
        const col = bad ? (flagged ? COLORS.red : "#ff8a5c") : COLORS.cyan;
        if (bad && x < hitX) {
          // shatter at the wall
          const sh = clamp01((hitX - x) / 1.3);
          x = hitX;
          if (sh >= 1) return null;
          return (
            <group key={k} position={[x, y, z]}>
              {Array.from({ length: 6 }, (__, f) => {
                const a = (f / 6) * Math.PI * 2;
                const d = sh * (0.6 + random(`fd${k}${f}`) * 0.5);
                return (
                  <mesh key={f} position={[d * 0.9, Math.sin(a) * d, Math.cos(a) * d]} rotation={[sh * 6, sh * 4, 0]}>
                    <tetrahedronGeometry args={[0.06 * (1 - sh * 0.6), 0]} />
                    <meshBasicMaterial color={COLORS.red} transparent opacity={1 - sh} toneMapped={false} />
                  </mesh>
                );
              })}
              <Glow scale={1.4 * (1 - sh) + 0.2} color={ips ? COLORS.red : "#ff8a5c"} opacity={1 - sh} />
            </group>
          );
        }
        return (
          <group key={k} position={[x, y, z]}>
            <mesh rotation={[t * 0.1, t * 0.07, 0]}>
              {bad ? <octahedronGeometry args={[0.12, 0]} /> : <boxGeometry args={[0.13, 0.13, 0.13]} />}
              <meshBasicMaterial color={col} toneMapped={false} />
            </mesh>
            <Glow scale={0.7} color={col} opacity={0.8} />
          </group>
        );
      })}
    </group>
  );
};
