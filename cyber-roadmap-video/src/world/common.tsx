import React, { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "../theme";
import type { V3 } from "./layout";

let glowTex: THREE.Texture | null = null;
/** Soft radial sprite used for fake bloom, bokeh and particles. */
export const getGlowTexture = () => {
  if (!glowTex) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.18, "rgba(255,255,255,0.7)");
    gr.addColorStop(0.45, "rgba(255,255,255,0.18)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    glowTex = new THREE.CanvasTexture(c);
    glowTex.colorSpace = THREE.SRGBColorSpace;
  }
  return glowTex;
};

export const Glow: React.FC<{
  position?: V3;
  scale?: number;
  color?: string;
  opacity?: number;
}> = ({ position = [0, 0, 0], scale = 1, color = COLORS.cyan, opacity = 1 }) => (
  <sprite position={position} scale={[scale, scale, scale]}>
    <spriteMaterial
      map={getGlowTexture()}
      color={color}
      transparent
      opacity={opacity}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      toneMapped={false}
    />
  </sprite>
);

/** A glowing tube through points; `progress` reveals it from start to end. */
export const NeonTube: React.FC<{
  points: V3[];
  radius?: number;
  color?: string;
  opacity?: number;
  progress?: number;
  segments?: number;
  closed?: boolean;
  smooth?: boolean;
}> = ({ points, radius = 0.03, color = COLORS.cyan, opacity = 1, progress = 1, segments = 64, closed = false, smooth = true }) => {
  const key = JSON.stringify(points);
  const geo = useMemo(() => {
    const vs = points.map((p) => new THREE.Vector3(...p));
    const path = smooth
      ? new THREE.CatmullRomCurve3(vs, closed, "centripetal")
      : (() => {
          const cp = new THREE.CurvePath<THREE.Vector3>();
          for (let i = 0; i < vs.length - 1; i++) cp.add(new THREE.LineCurve3(vs[i], vs[i + 1]));
          return cp;
        })();
    return new THREE.TubeGeometry(path as THREE.Curve<THREE.Vector3>, segments, radius, 6, closed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, radius, segments, closed, smooth]);
  const count = Math.floor(Math.max(0, Math.min(1, progress)) * segments) * 6 * 6;
  geo.setDrawRange(0, count);
  if (count <= 0) return null;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
};

/** Hexagonal station platform with neon rim and rotating tick ring. */
export const Platform: React.FC<{ t: number; active: number; radius?: number }> = ({ t, active, radius = 3 }) => {
  const ticks = 36;
  const rim = new THREE.Color(COLORS.cyan).lerp(new THREE.Color(COLORS.goldLight), active);
  return (
    <group>
      <mesh position={[0, -0.17, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[radius, radius * 1.06, 0.32, 6]} />
        <meshStandardMaterial color="#0c2142" metalness={0.75} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]} receiveShadow>
        <circleGeometry args={[radius * 0.97, 6]} />
        <meshStandardMaterial color="#0a1b36" metalness={0.5} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
        <ringGeometry args={[radius * 0.9, radius * 0.93, 6]} />
        <meshBasicMaterial color={rim} transparent opacity={0.55 + active * 0.45} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
        <ringGeometry args={[radius * 0.55, radius * 0.56, 6]} />
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.25} toneMapped={false} />
      </mesh>
      <group rotation={[0, t * 0.006, 0]}>
        {Array.from({ length: ticks }, (_, k) => {
          const a = (k / ticks) * Math.PI * 2;
          const r = radius * 1.12;
          return (
            <mesh key={k} position={[Math.cos(a) * r, -0.05, Math.sin(a) * r]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.04, 0.03, k % 3 === 0 ? 0.32 : 0.14]} />
              <meshBasicMaterial color={k % 9 === 0 ? COLORS.goldLight : COLORS.cyan} transparent opacity={0.5 + active * 0.4} toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      <Glow position={[0, -0.25, 0]} scale={radius * 3.2} color={COLORS.cyan} opacity={0.16 + active * 0.12} />
    </group>
  );
};

/** Vertical beacon of light marking the active station. */
export const Beacon: React.FC<{ active: number; t: number }> = ({ active, t }) => {
  if (active <= 0.01) return null;
  return (
    <group>
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[0.05, 0.4, 12, 16, 1, true]} />
        <meshBasicMaterial
          color={COLORS.cyan}
          transparent
          opacity={0.06 * active * (0.85 + 0.15 * Math.sin(t * 0.2))}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

export const metal = (color: string, metalness = 0.85, roughness = 0.28) => (
  <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
);

export const neon = (color: string, opacity = 1) => (
  <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} toneMapped={false} />
);
