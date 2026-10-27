// Persistent overlay elements: brand mark, roadmap progress rail, bokeh parallax,
// vignette grade and light-sweep transitions.
import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { COLORS, FONT_FAMILY, LAYOUT } from "../theme";
import type { Timeline } from "../timeline";
import { getCamera } from "../world/camera";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Official نادي المهارات emblem (cut out from the supplied logo by scripts/extract_logo.py) */
export const BrandMark: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <Img
    src={staticFile("brand/logo-emblem.png")}
    style={{
      height: size,
      width: (size * 559) / 607,
      filter: `drop-shadow(0 0 ${size * 0.12}px rgba(233,196,106,0.45)) drop-shadow(0 0 ${size * 0.25}px rgba(0,217,232,0.25))`,
    }}
  />
);

export const Brand: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const frame = useCurrentFrame();
  const fin = tl.scenes[11].start;
  const o = interpolate(frame, [12, 36, fin - 10, fin + 10], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: LAYOUT.brandY,
        width: 1080,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        direction: "rtl",
        opacity: o * 0.92,
        fontFamily: FONT_FAMILY,
      }}
    >
      <BrandMark size={48} />
      <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.white, letterSpacing: 0.5, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>نادي المهارات</span>
    </div>
  );
};

/** 10-node roadmap rail (stage 1 on the right, RTL). Current stage glows gold. */
export const ProgressRail: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const frame = useCurrentFrame();
  const cam = getCamera(frame, tl);
  const sf = cam.stationFloat;
  const start = tl.scenes[1].start;
  const fin = tl.scenes[11].start;
  const o = interpolate(frame, [start - 30, start, fin, fin + 20], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  const x0 = 930;
  const x1 = 150;
  const xs = Array.from({ length: 10 }, (_, i) => x0 + ((x1 - x0) * i) / 9);
  const prog = Math.max(0, Math.min(9, sf - 1));
  const fillX = x0 + ((x1 - x0) * prog) / 9;
  const y = LAYOUT.railY;
  return (
    <svg width={1080} height={80} style={{ position: "absolute", left: 0, top: y - 40, opacity: o }}>
      <defs>
        <filter id="rg" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <line x1={x0} x2={x1} y1={40} y2={40} stroke={COLORS.cyan} strokeOpacity={0.25} strokeWidth={3} />
      <line x1={x0} x2={fillX} y1={40} y2={40} stroke={COLORS.goldLight} strokeWidth={4} strokeLinecap="round" />
      <circle cx={fillX} cy={40} r={9} fill={COLORS.goldLight} filter="url(#rg)" />
      {xs.map((x, i) => {
        const d = Math.abs(sf - (i + 1));
        const cur = Math.max(0, 1 - d * 1.6);
        const done = sf >= i + 1 - 0.01;
        const r = 7 + cur * 7;
        return (
          <g key={i}>
            {cur > 0 ? <circle cx={x} cy={40} r={r + 8} fill={COLORS.gold} opacity={0.35 * cur} filter="url(#rg)" /> : null}
            <circle
              cx={x}
              cy={40}
              r={r}
              fill={done ? (cur > 0.3 ? COLORS.goldLight : COLORS.gold) : COLORS.navy}
              stroke={done ? COLORS.goldLight : COLORS.cyan}
              strokeOpacity={done ? 1 : 0.6}
              strokeWidth={2.5}
            />
          </g>
        );
      })}
    </svg>
  );
};

/** foreground bokeh dust: parallax tied to the camera = depth-of-field feel */
export const Bokeh: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const frame = useCurrentFrame();
  const cam = getCamera(frame, tl);
  const n = 22;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const depth = 0.3 + random(`bd${i}`) * 1.2;
        const size = 6 + depth * depth * 40;
        const baseX = random(`bx${i}`) * 1180 - 50;
        const baseY = random(`by${i}`) * 2100 - 90;
        const x = ((((baseX - cam.pos[0] * 60 * depth + Math.sin(frame * 0.01 + i) * 20) % 1180) + 1180) % 1180) - 50;
        const y = ((((baseY + cam.pos[2] * 24 * depth - frame * 0.4 * depth) % 2100) + 2100) % 2100) - 90;
        const gold = i % 4 === 0;
        const c = gold ? "233,196,106" : "0,217,232";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${c},${0.32 / depth}) 0%, rgba(${c},${0.12 / depth}) 45%, rgba(${c},0) 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(4,11,25,0.8) 0%, rgba(4,11,25,0.4) 14%, rgba(4,11,25,0) 30%, rgba(4,11,25,0) 56%, rgba(4,11,25,0.42) 64%, rgba(4,11,25,0.55) 76%, rgba(4,11,25,0.88) 100%)",
      }}
    />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(2,6,16,0.55) 100%)" }} />
  </AbsoluteFill>
);

/** soft diagonal light sweep at every scene boundary */
export const LightSweeps: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {tl.scenes.slice(1).map((s, k) => {
        const p = interpolate(frame, [s.start - 14, s.start + 16], [0, 1], clamp);
        if (p <= 0 || p >= 1) return null;
        const pos = -40 + p * 180;
        const a = Math.sin(p * Math.PI) * 0.22;
        const c = k % 2 ? "0,217,232" : "233,196,106";
        return (
          <AbsoluteFill
            key={s.id}
            style={{
              background: `linear-gradient(115deg, rgba(${c},0) ${pos - 22}%, rgba(${c},${a}) ${pos}%, rgba(${c},0) ${pos + 22}%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
