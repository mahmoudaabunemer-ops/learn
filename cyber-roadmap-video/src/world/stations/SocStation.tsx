import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { COLORS } from "../../theme";
import { Glow } from "../common";
import type { StationProps } from "./types";

const W = 256;
const H = 150;

type Kind = "bars" | "line" | "map" | "alerts" | "radar";
const KINDS: Kind[] = ["alerts", "line", "map", "bars", "radar"];

const draw = (g: CanvasRenderingContext2D, kind: Kind, t: number, seed: number) => {
  g.fillStyle = "#06142b";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(0,217,232,0.18)";
  g.lineWidth = 1;
  for (let x = 0; x < W; x += 32) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  if (kind === "bars") {
    for (let i = 0; i < 12; i++) {
      const h = 20 + (0.5 + 0.5 * Math.sin(t * 0.09 + i * 0.8 + seed)) * 100;
      g.fillStyle = i === 7 ? COLORS.red : i % 3 === 0 ? COLORS.goldLight : COLORS.cyan;
      g.fillRect(14 + i * 19, H - 10 - h, 12, h);
    }
  } else if (kind === "line") {
    g.strokeStyle = COLORS.cyan;
    g.lineWidth = 3;
    g.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const y = 85 + Math.sin(x * 0.05 + t * 0.12) * 22 + Math.sin(x * 0.13 - t * 0.2) * 10 - (x > 170 && x < 200 ? 40 : 0);
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = COLORS.red;
    g.beginPath();
    g.arc(186, 50 + Math.sin(t * 0.12) * 8, 6, 0, Math.PI * 2);
    g.fill();
  } else if (kind === "map") {
    for (let i = 0; i < 70; i++) {
      const x = 12 + random(`mx${i}`) * (W - 24);
      const y = 18 + random(`my${i}`) * (H - 36);
      const hot = Math.sin(t * 0.15 + i) > 0.85;
      g.fillStyle = hot ? COLORS.red : "rgba(0,217,232,0.7)";
      g.beginPath();
      g.arc(x, y, hot ? 4.5 : 2.2, 0, Math.PI * 2);
      g.fill();
    }
  } else if (kind === "alerts") {
    for (let i = 0; i < 7; i++) {
      const sev = (Math.floor(t / 12) + i) % 4;
      g.fillStyle = sev === 0 ? COLORS.red : sev === 1 ? COLORS.goldLight : "rgba(0,217,232,0.75)";
      g.fillRect(12, 12 + i * 19, 10, 10);
      g.fillStyle = "rgba(220,235,255,0.55)";
      g.fillRect(30, 14 + i * 19, 60 + ((i * 37 + seed * 13) % 140), 6);
    }
  } else {
    const cx = W / 2;
    const cy = H / 2;
    g.strokeStyle = "rgba(0,217,232,0.6)";
    for (let r = 20; r < 75; r += 18) {
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.stroke();
    }
    const a = t * 0.08;
    g.fillStyle = "rgba(0,217,232,0.35)";
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, 70, a, a + 0.6);
    g.fill();
    g.fillStyle = COLORS.red;
    g.beginPath();
    g.arc(cx + Math.cos(1.2) * 40, cy + Math.sin(1.2) * 40, 5, 0, Math.PI * 2);
    g.fill();
  }
};

export const SocStation: React.FC<StationProps> = ({ t }) => {
  const screens = useMemo(
    () =>
      KINDS.map(() => {
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return { c, tex, g: c.getContext("2d")! };
      }),
    [],
  );
  screens.forEach((s, k) => {
    draw(s.g, KINDS[k], t, k);
    s.tex.needsUpdate = true;
  });

  const arcR = 3.1;
  const center: [number, number, number] = [0, 0, 2.1];
  return (
    <group>
      {screens.map((s, k) => {
        const th = -0.95 + (k / (KINDS.length - 1)) * 1.9;
        const x = center[0] + Math.sin(th) * arcR;
        const z = center[2] - Math.cos(th) * arcR;
        const y = k === 2 ? 2.15 : 1.35;
        return (
          <group key={k} position={[x, y, z]} rotation={[-0.06, -th, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.42, 0.86, 0.06]} />
              <meshStandardMaterial color="#0d182b" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.032]}>
              <planeGeometry args={[1.34, 0.78]} />
              <meshBasicMaterial map={s.tex} toneMapped={false} />
            </mesh>
            <mesh position={[0, -0.75, -0.05]}>
              <boxGeometry args={[0.06, 0.65, 0.06]} />
              <meshStandardMaterial color="#2a3a55" metalness={0.8} roughness={0.3} />
            </mesh>
            <Glow position={[0, 0, -0.2]} scale={2.2} color={COLORS.cyan} opacity={0.22} />
          </group>
        );
      })}
      {/* floor radar */}
      <group position={[0, 0.02, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        {[0.6, 1.2, 1.8].map((r) => (
          <mesh key={r}>
            <ringGeometry args={[r, r + 0.02, 64]} />
            <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.4} toneMapped={false} />
          </mesh>
        ))}
        <mesh rotation={[0, 0, -t * 0.07]}>
          <circleGeometry args={[1.85, 32, 0, 0.7]} />
          <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      {/* alert beacons popping above the wall */}
      {[0, 1, 2].map((k) => {
        const ph = ((((t + k * 23) % 70) + 70) % 70) / 70;
        return (
          <group key={k} position={[-1.6 + k * 1.6, 2.6 + ph * 0.6, -0.4]}>
            <mesh>
              <octahedronGeometry args={[0.1, 0]} />
              <meshBasicMaterial color={COLORS.red} transparent opacity={1 - ph} toneMapped={false} />
            </mesh>
            <Glow scale={0.9} color={COLORS.red} opacity={(1 - ph) * 0.8} />
          </group>
        );
      })}
    </group>
  );
};
