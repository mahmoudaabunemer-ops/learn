import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { COLORS } from "../../theme";
import { stageById } from "../../content";
import { Glow } from "../common";
import { COMPUTER_TILT, computerExplode, computerParts, pop } from "../layout";
import { pulse } from "../math";
import type { StationProps } from "./types";

const terms = stageById("computer")!.terms;

/** emissive highlight: flashes gold when the narrator names the part, then stays lit */
const useHighlight = (t: number, dur: number, idx: number) => {
  const at = terms[idx].at * dur;
  const flash = pulse(t, at, 36);
  const on = t > at ? 1 : 0;
  return { flash, on };
};

export const ComputerStation: React.FC<StationProps> = ({ t, dur }) => {
  const e = computerExplode(t, dur);
  const P = computerParts(e);
  const cpu = useHighlight(t, dur, 0);
  const ram = useHighlight(t, dur, 1);
  const ssd = useHighlight(t, dur, 2);
  const win = pop(t, terms[3].at * dur);

  const traces = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 46; i++) {
      let x = (random(`tx${i}`) - 0.5) * 3.1;
      let z = (random(`tz${i}`) - 0.5) * 2.1;
      for (let s = 0; s < 4; s++) {
        const horiz = random(`th${i}-${s}`) > 0.5;
        const len = (random(`tl${i}-${s}`) - 0.5) * 1.2;
        const nx = horiz ? Math.max(-1.6, Math.min(1.6, x + len)) : x;
        const nz = horiz ? z : Math.max(-1.1, Math.min(1.1, z + len));
        pts.push(x, 0.056, z, nx, 0.056, nz);
        x = nx;
        z = nz;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  const goldFlash = (h: { flash: number; on: number }) =>
    new THREE.Color(COLORS.cyan).lerp(new THREE.Color(COLORS.goldLight), Math.max(h.flash, h.on * 0.6));

  return (
    <group position={[0, 0.55, 0]}>
      <group rotation={[COMPUTER_TILT, Math.sin(t * 0.012) * 0.06, 0]}>
        {/* motherboard */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.1, 2.4]} />
          <meshStandardMaterial color="#0d3346" metalness={0.35} roughness={0.55} />
        </mesh>
        <lineSegments geometry={traces}>
          <lineBasicMaterial color={COLORS.cyan} transparent opacity={0.5} toneMapped={false} />
        </lineSegments>
        {/* CPU socket + die */}
        <group position={P.cpu}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.08, 0.9]} />
            <meshStandardMaterial color="#c7d0dc" metalness={0.95} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.055, 0]}>
            <boxGeometry args={[0.52, 0.03, 0.52]} />
            <meshStandardMaterial
              color={COLORS.gold}
              metalness={1}
              roughness={0.2}
              emissive={goldFlash(cpu)}
              emissiveIntensity={0.25 + cpu.flash * 1.5}
            />
          </mesh>
          <Glow position={[0, 0.2, 0]} scale={1.6 + cpu.flash * 1.4} color={COLORS.goldLight} opacity={0.15 + cpu.flash * 0.6} />
        </group>
        {/* heatsink fins */}
        <group position={P.heatsink}>
          {Array.from({ length: 8 }, (_, k) => (
            <mesh key={k} position={[0, 0, -0.36 + k * 0.103]} castShadow>
              <boxGeometry args={[0.9, 0.42, 0.035]} />
              <meshStandardMaterial color="#aeb9c8" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
        {/* RAM sticks */}
        {[0, 0.24].map((dx, k) => (
          <group key={k} position={[P.ram[0] + dx, P.ram[1], P.ram[2]]}>
            <mesh castShadow>
              <boxGeometry args={[0.06, 0.42, 1.7]} />
              <meshStandardMaterial
                color="#0f5a40"
                metalness={0.3}
                roughness={0.5}
                emissive={goldFlash(ram)}
                emissiveIntensity={ram.flash * 0.9 + ram.on * 0.08}
              />
            </mesh>
            {Array.from({ length: 6 }, (_, c) => (
              <mesh key={c} position={[0.04, 0.03, -0.66 + c * 0.265]}>
                <boxGeometry args={[0.03, 0.2, 0.2]} />
                <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.4} />
              </mesh>
            ))}
            <mesh position={[0, -0.22, 0]}>
              <boxGeometry args={[0.065, 0.04, 1.6]} />
              <meshStandardMaterial color={COLORS.gold} metalness={1} roughness={0.2} />
            </mesh>
          </group>
        ))}
        {/* NVMe SSD */}
        <group position={P.ssd}>
          <mesh castShadow>
            <boxGeometry args={[1.25, 0.05, 0.32]} />
            <meshStandardMaterial color="#141c2c" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[1.0, 0.012, 0.06]} />
            <meshBasicMaterial color={goldFlash(ssd)} toneMapped={false} />
          </mesh>
          <Glow position={[0, 0.1, 0]} scale={1.2 + ssd.flash * 1.5} color={COLORS.cyan} opacity={0.12 + ssd.flash * 0.6} />
        </group>
      </group>
      {/* Operating system: floating window panes */}
      {win > 0.01 ? (
        <group position={[-1.85, 2.05, 0.6]} rotation={[0, 0.45 + Math.sin(t * 0.03) * 0.1, 0]} scale={win * 0.9}>
          {[
            [-0.24, 0.24],
            [0.24, 0.24],
            [-0.24, -0.24],
            [0.24, -0.24],
          ].map(([x, y], k) => (
            <mesh key={k} position={[x, y, 0]}>
              <boxGeometry args={[0.43, 0.43, 0.06]} />
              <meshStandardMaterial color="#1aa7ff" emissive={COLORS.cyan} emissiveIntensity={0.9} metalness={0.3} roughness={0.3} />
            </mesh>
          ))}
          <Glow scale={2.4} color={COLORS.cyan} opacity={0.5} />
        </group>
      ) : null}
    </group>
  );
};
