import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY, LAYOUT, SAFE } from "../theme";
import type { Term } from "../content";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const glowText = (color: string, strength = 1) =>
  `0 0 ${18 * strength}px ${color}55, 0 0 ${42 * strength}px ${color}33, 0 4px 18px rgba(0,0,0,0.65)`;

/** spring-in with blur-to-sharp + rise; exit with upward drift + blur */
export const useReveal = (at: number, exitAt?: number, exitLen = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 120, mass: 0.8 } });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + exitLen], [0, 1], clamp);
  const opacity = Math.min(1, s * 1.4) * (1 - out);
  return {
    s,
    out,
    opacity,
    style: {
      opacity,
      transform: `translateY(${(1 - s) * 46 - out * 40}px) scale(${0.94 + 0.06 * s})`,
      filter: `blur(${(1 - Math.min(1, s)) * 14 + out * 10}px)`,
    } as React.CSSProperties,
  };
};

// Cairo Black averages ~0.6em per Arabic character; keep every title on one line.
const fitSize = (text: string, max: number, width: number, k = 0.62) =>
  Math.min(max, Math.floor(width / (text.length * k)));

/** Word-by-word dynamic headline (RTL). `highlight` words render in gold. */
export const Headline: React.FC<{
  text: string;
  at: number;
  exitAt?: number;
  size?: number;
  top: number;
  highlight?: string[];
  color?: string;
  weight?: number;
}> = ({ text, at, exitAt, size = 96, top, highlight = [], color = COLORS.white, weight = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const fs = fitSize(text, size, SAFE.right - SAFE.left);
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 14], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        textAlign: "center",
        direction: "rtl",
        fontFamily: FONT_FAMILY,
        fontWeight: weight,
        fontSize: fs,
        lineHeight: 1.25,
        color,
        opacity: 1 - out,
        transform: `translateY(${-out * 50}px)`,
        filter: `blur(${out * 10}px)`,
      }}
    >
      {words.map((w, i) => {
        const s = spring({ frame: frame - at - i * 4, fps, config: { damping: 14, stiffness: 130, mass: 0.7 } });
        const gold = highlight.includes(w);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: `0 ${fs * 0.13}px`,
              opacity: Math.min(1, s * 1.5),
              transform: `translateY(${(1 - s) * fs * 0.55}px) rotateX(${(1 - s) * 70}deg)`,
              filter: `blur(${(1 - Math.min(1, s)) * 12}px)`,
              color: gold ? COLORS.goldLight : undefined,
              textShadow: glowText(gold ? COLORS.gold : COLORS.cyan, 0.8),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** "المرحلة 03" kicker + stage title + animated gold underline */
export const StageHeader: React.FC<{ n: number; title: string; titleAt: number; dur: number }> = ({ n, title, titleAt, dur }) => {
  const frame = useCurrentFrame();
  const exitAt = dur - 15;
  const k = useReveal(2, exitAt);
  const line = interpolate(frame, [titleAt + 6, titleAt + 26], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const fs = fitSize(title, 98, SAFE.right - SAFE.left);
  const lineY = LAYOUT.titleY + fs * 1.32 + 6;
  const out = interpolate(frame, [exitAt, exitAt + 14], [0, 1], clamp);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: LAYOUT.stageLabelY,
          left: 0,
          width: 1080,
          textAlign: "center",
          direction: "rtl",
          fontFamily: FONT_FAMILY,
          ...k.style,
        }}
      >
        <span style={{ fontSize: 34, fontWeight: 700, color: COLORS.goldLight, letterSpacing: 1, textShadow: glowText(COLORS.gold, 0.7) }}>
          المرحلة
        </span>
        <span
          style={{
            fontSize: 40,
            fontWeight: 900,
            marginRight: 14,
            background: `linear-gradient(180deg, #FFE7A3, ${COLORS.gold})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {String(n).padStart(2, "0")}
        </span>
        <span style={{ fontSize: 26, fontWeight: 600, color: COLORS.muted, marginRight: 10 }}>/ 10</span>
      </div>
      <Headline text={title} at={titleAt} exitAt={exitAt} top={LAYOUT.titleY} size={98} />
      <svg width={1080} height={20} style={{ position: "absolute", top: lineY, left: 0, opacity: 1 - out }}>
        <defs>
          <linearGradient id="ul" x1="1" x2="0">
            <stop offset="0" stopColor={COLORS.gold} stopOpacity="0" />
            <stop offset="0.5" stopColor={COLORS.goldLight} />
            <stop offset="1" stopColor={COLORS.cyan} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={540 + 220 * line} x2={540 - 220 * line} y1={10} y2={10} stroke="url(#ul)" strokeWidth={3} strokeLinecap="round" />
        <circle cx={540 - 220 * line} cy={10} r={5 * line} fill={COLORS.cyan} />
      </svg>
    </>
  );
};

const Diamond: React.FC<{ color?: string; size?: number; opacity?: number }> = ({ color = COLORS.gold, size = 12, opacity = 1 }) => (
  <svg width={size * 2} height={size * 2} style={{ opacity, margin: "0 6px", alignSelf: "center" }}>
    <rect x={size / 2} y={size / 2} width={size} height={size} transform={`rotate(45 ${size} ${size})`} fill={color} />
  </svg>
);

/** progressively revealed bilingual terms; the newest one is highlighted in gold */
export const TermsRow: React.FC<{ terms: Term[]; dur: number; top?: number; enSize?: number }> = ({ terms, dur, top = LAYOUT.termsY, enSize = 46 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exitAt = dur - 15;
  const out = interpolate(frame, [exitAt, exitAt + 14], [0, 1], clamp);
  const times = terms.map((t) => Math.round(t.at * dur));
  let current = -1;
  times.forEach((tt, i) => {
    if (frame >= tt) current = i;
  });
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "flex-start",
        rowGap: 18,
        direction: "rtl",
        fontFamily: FONT_FAMILY,
        opacity: 1 - out,
        filter: `blur(${out * 8}px)`,
        transform: `translateY(${out * 20}px)`,
      }}
    >
      {terms.map((t, i) => {
        const s = spring({ frame: frame - times[i], fps, config: { damping: 13, stiffness: 150, mass: 0.6 } });
        if (frame < times[i] - 1) return null;
        const isCur = i === current;
        return (
          <React.Fragment key={t.en}>
            {i > 0 ? <Diamond opacity={Math.min(1, s)} color={isCur ? COLORS.goldLight : COLORS.cyan} size={9} /> : null}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                margin: "0 14px",
                opacity: Math.min(1, s * 1.5),
                transform: `translateY(${(1 - s) * 30}px) scale(${0.8 + 0.2 * s + (isCur ? 0.04 : 0)})`,
                filter: `blur(${(1 - Math.min(1, s)) * 10}px)`,
              }}
            >
              <div
                style={{
                  direction: "ltr",
                  fontSize: t.en.length > 14 ? enSize * 0.8 : enSize,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: isCur ? COLORS.goldLight : COLORS.white,
                  textShadow: glowText(isCur ? COLORS.gold : COLORS.cyan, isCur ? 1 : 0.6),
                }}
              >
                {t.en}
              </div>
              <div style={{ fontSize: 27, fontWeight: 600, color: isCur ? COLORS.white : COLORS.muted, marginTop: 4, textShadow: "0 2px 10px rgba(0,0,0,.7)" }}>
                {t.ar}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** AR-style label pinned to a projected 3D point. */
export const PinLabel: React.FC<{
  x: number;
  y: number;
  en: string;
  ar?: string;
  show: number;
  color?: string;
  dy?: number;
  enSize?: number;
}> = ({ x, y, en, ar, show, color = COLORS.cyan, dy = -70, enSize = 36 }) => {
  if (show <= 0.01) return null;
  const w = Math.max(en.length * enSize * 0.55, (ar?.length ?? 0) * 15) + 20;
  const cx = Math.max(SAFE.left + w / 2, Math.min(SAFE.right - w / 2, x));
  const textH = ar ? 72 : 44;
  // never collide with the stage title: flip below the anchor if there is no room above
  if (dy < 0 && y + dy - textH < LAYOUT.titleY + 150) dy = Math.abs(dy) * 0.8;
  const ty = y + dy;
  const s = Math.min(1, show);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: s }}>
        <line x1={x} y1={y} x2={cx} y2={ty + (dy < 0 ? 26 : -26)} stroke={color} strokeWidth={2} strokeOpacity={0.8} strokeDasharray="4 5" />
        <circle cx={x} cy={y} r={7} fill="none" stroke={color} strokeWidth={2.5} />
        <circle cx={x} cy={y} r={2.5} fill={color} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx - w / 2,
          width: w,
          top: dy < 0 ? ty - textH : ty,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          opacity: s,
          transform: `translateY(${(1 - show) * 14}px) scale(${0.85 + 0.15 * show})`,
          filter: `blur(${(1 - s) * 6}px)`,
        }}
      >
        <div style={{ direction: "ltr", fontSize: enSize, fontWeight: 800, color: COLORS.white, lineHeight: 1.1, textShadow: glowText(color, 0.9) }}>{en}</div>
        {ar ? (
          <div style={{ direction: "rtl", fontSize: 26, fontWeight: 700, color, lineHeight: 1.3, textShadow: "0 2px 10px rgba(0,0,0,.8)" }}>{ar}</div>
        ) : null}
      </div>
    </>
  );
};
