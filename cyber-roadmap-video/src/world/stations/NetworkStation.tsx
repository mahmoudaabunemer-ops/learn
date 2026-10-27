import React from "react";
import { COLORS } from "../../theme";
import { stageById } from "../../content";
import { Glow, NeonTube } from "../common";
import { edgePoint, NET_EDGES, NET_NODES, PACKETS, packetPos, pop, ramp, TAGGED_PACKETS } from "../layout";
import type { V3 } from "../layout";
import type { StationProps } from "./types";

const terms = stageById("network")!.terms;

const Server: React.FC<{ p: V3; t: number; seed: number }> = ({ p, t, seed }) => (
  <group position={[p[0], p[1], p[2]]}>
    <mesh castShadow>
      <boxGeometry args={[0.62, 1.45, 0.7]} />
      <meshStandardMaterial color="#152a4a" metalness={0.8} roughness={0.3} />
    </mesh>
    {Array.from({ length: 6 }, (_, k) => {
      const on = Math.sin(t * 0.3 + k * 1.7 + seed) > 0;
      return (
        <mesh key={k} position={[0, -0.55 + k * 0.21, 0.355]}>
          <boxGeometry args={[0.46, 0.035, 0.01]} />
          <meshBasicMaterial color={on ? COLORS.cyan : "#1d4a6b"} toneMapped={false} />
        </mesh>
      );
    })}
  </group>
);

const Switch: React.FC<{ p: V3; t: number }> = ({ p, t }) => (
  <group position={p}>
    <mesh castShadow>
      <boxGeometry args={[1.15, 0.22, 0.58]} />
      <meshStandardMaterial color="#1a3156" metalness={0.8} roughness={0.3} />
    </mesh>
    {Array.from({ length: 8 }, (_, k) => (
      <mesh key={k} position={[-0.45 + k * 0.13, 0, 0.295]}>
        <boxGeometry args={[0.07, 0.07, 0.01]} />
        <meshBasicMaterial color={Math.sin(t * 0.5 + k * 2.1) > 0.2 ? COLORS.green : "#174d3c"} toneMapped={false} />
      </mesh>
    ))}
  </group>
);

const Client: React.FC<{ p: V3 }> = ({ p }) => (
  <group position={p}>
    <mesh castShadow>
      <boxGeometry args={[0.7, 0.04, 0.48]} />
      <meshStandardMaterial color="#9aa7bb" metalness={0.9} roughness={0.25} />
    </mesh>
    <mesh position={[0, 0.24, -0.23]} rotation={[-0.25, 0, 0]}>
      <boxGeometry args={[0.7, 0.46, 0.03]} />
      <meshStandardMaterial color="#0b1b33" emissive={COLORS.cyan} emissiveIntensity={0.35} />
    </mesh>
  </group>
);

export const NetworkStation: React.FC<StationProps> = ({ t, dur }) => {
  const osi = pop(t, terms[3].at * dur, 30, 15);
  return (
    <group>
      {/* router */}
      <group position={NET_NODES.router}>
        <mesh castShadow>
          <cylinderGeometry args={[0.55, 0.6, 0.26, 32]} />
          <meshStandardMaterial color="#1b355e" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.36, 0.42, 48]} />
          <meshBasicMaterial color={COLORS.goldLight} toneMapped={false} />
        </mesh>
        {[-0.3, 0, 0.3].map((x, k) => (
          <mesh key={k} position={[x, 0.42, -0.35]} rotation={[0, 0, x * -0.6]}>
            <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
            <meshStandardMaterial color="#c9d2de" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        <Glow scale={2.2} color={COLORS.cyan} opacity={0.35} />
      </group>
      <Switch p={NET_NODES.switchR} t={t} />
      <Switch p={NET_NODES.switchL} t={t + 7} />
      <Server p={NET_NODES.serverR} t={t} seed={1} />
      <Server p={NET_NODES.serverC} t={t} seed={2} />
      <Server p={NET_NODES.serverL} t={t} seed={3} />
      <Client p={NET_NODES.clientR} />
      <Client p={NET_NODES.clientL} />
      {/* internet globe */}
      <group position={NET_NODES.globe} rotation={[0.3, t * 0.015, 0]}>
        <mesh>
          <sphereGeometry args={[0.62, 18, 12]} />
          <meshBasicMaterial color={COLORS.cyan} wireframe transparent opacity={0.55} toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.58, 32, 24]} />
          <meshStandardMaterial color="#0b2a4a" transparent opacity={0.6} emissive="#06405a" emissiveIntensity={0.6} />
        </mesh>
        <Glow scale={2.6} color={COLORS.cyan} opacity={0.4} />
      </group>
      {/* links draw on one by one */}
      {NET_EDGES.map((_, e) => {
        const pts = Array.from({ length: 9 }, (__, s) => edgePoint(e, s / 8));
        return (
          <NeonTube
            key={e}
            points={pts}
            radius={0.022}
            color={e === 7 ? COLORS.goldLight : COLORS.cyan}
            opacity={0.75}
            progress={ramp(t, -30 + e * 6, 10 + e * 6)}
            segments={40}
          />
        );
      })}
      {/* data packets */}
      {PACKETS.map((_, k) => {
        const tagged = TAGGED_PACKETS.find((p) => p.k === k);
        const on = tagged ? t > terms[tagged.termIdx].at * dur - 10 : true;
        const p = packetPos(k, t);
        const col = tagged && on ? COLORS.goldLight : COLORS.cyan;
        return (
          <group key={k} position={p}>
            <mesh>
              <boxGeometry args={tagged ? [0.13, 0.13, 0.13] : [0.08, 0.08, 0.08]} />
              <meshBasicMaterial color={col} toneMapped={false} />
            </mesh>
            <Glow scale={tagged ? 0.9 : 0.5} color={col} opacity={0.8} />
          </group>
        );
      })}
      {/* OSI: seven stacked layers rise next to the router */}
      {osi > 0.01 ? (
        <group position={[2.35, 0.15, -0.3]}>
          {Array.from({ length: 7 }, (_, k) => {
            const s = Math.max(0, Math.min(1, osi * 1.6 - k * 0.09));
            return (
              <mesh key={k} position={[0, 0.12 + k * 0.19 * s, 0]} rotation={[0, t * 0.01 + k * 0.08, 0]} scale={[s, 1, s]}>
                <cylinderGeometry args={[0.42, 0.42, 0.05, 6]} />
                <meshStandardMaterial
                  color={k % 2 ? "#14365e" : "#1b4a7a"}
                  emissive={k === 6 ? COLORS.goldLight : COLORS.cyan}
                  emissiveIntensity={0.45}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            );
          })}
        </group>
      ) : null}
    </group>
  );
};
