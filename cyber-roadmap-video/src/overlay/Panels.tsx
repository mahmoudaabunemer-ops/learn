// Floating glass "screens" rendered with CSS 3D perspective: terminal, code editor, SIEM feed.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY, MONO_FAMILY } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Seg = { text: string; color?: string };
export type TermLine = { kind: "cmd" | "out"; segs: Seg[]; at: number };

const typed = (segs: Seg[], chars: number) => {
  const out: Seg[] = [];
  let left = chars;
  for (const s of segs) {
    if (left <= 0) break;
    out.push({ ...s, text: s.text.slice(0, left) });
    left -= s.text.length;
  }
  return out;
};

export const GlassScreen: React.FC<{
  top: number;
  width: number;
  height: number;
  at: number;
  exitAt: number;
  tiltY?: number;
  children: React.ReactNode;
  header?: React.ReactNode;
}> = ({ top, width, height, at, exitAt, tiltY = -10, children, header }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 16, stiffness: 90, mass: 0.9 } });
  const out = interpolate(frame, [exitAt, exitAt + 14], [0, 1], clamp);
  const float = Math.sin(frame * 0.05) * 6;
  return (
    <div style={{ position: "absolute", top, left: (1080 - width) / 2, width, height, perspective: 1400 }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translateY(${(1 - s) * 80 + float - out * 40}px) rotateX(${8 + (1 - s) * 25}deg) rotateY(${tiltY * s}deg) scale(${0.9 + 0.1 * s})`,
          opacity: Math.min(1, s * 1.3) * (1 - out),
          filter: `blur(${(1 - Math.min(1, s)) * 10 + out * 8}px)`,
          background: "linear-gradient(160deg, rgba(10,28,58,0.9), rgba(4,12,28,0.82))",
          borderRadius: 22,
          boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 60px ${COLORS.cyan}22, inset 0 1px 0 rgba(255,255,255,0.08)`,
          outline: `1px solid ${COLORS.cyan}30`,
          overflow: "hidden",
        }}
      >
        {header}
        {children}
        {/* scanline sheen */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${((frame * 1.2) % 140) - 20}%`,
            height: 60,
            background: `linear-gradient(180deg, rgba(0,217,232,0), rgba(0,217,232,0.07), rgba(0,217,232,0))`,
          }}
        />
      </div>
    </div>
  );
};

export const WindowDots: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px 6px", direction: "ltr" }}>
    {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
      <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c, opacity: 0.85 }} />
    ))}
    <div style={{ marginLeft: 12, fontFamily: MONO_FAMILY, fontSize: 20, color: COLORS.muted }}>{title}</div>
  </div>
);

export const Terminal: React.FC<{ lines: TermLine[]; cps?: number; fontSize?: number }> = ({ lines, cps = 1.6, fontSize = 27 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ padding: "8px 26px", direction: "ltr", fontFamily: MONO_FAMILY, fontSize, lineHeight: 1.55 }}>
      {lines.map((l, i) => {
        if (frame < l.at) return null;
        const total = l.segs.reduce((a, s) => a + s.text.length, 0);
        const chars = l.kind === "cmd" ? Math.floor((frame - l.at) * cps) : total;
        const vis = typed(l.segs, chars);
        const typing = l.kind === "cmd" && chars < total;
        const nextAt = lines[i + 1]?.at ?? Infinity;
        const caret = (typing || frame < nextAt) && l.kind === "cmd" && Math.floor(frame / 8) % 2 === 0;
        const o = l.kind === "out" ? interpolate(frame, [l.at, l.at + 6], [0, 1], clamp) : 1;
        return (
          <div key={i} style={{ whiteSpace: "pre", opacity: o, color: COLORS.white }}>
            {l.kind === "cmd" ? <span style={{ color: COLORS.green }}>analyst@lab</span> : null}
            {l.kind === "cmd" ? <span style={{ color: COLORS.muted }}>:</span> : null}
            {l.kind === "cmd" ? <span style={{ color: COLORS.cyan }}>~$ </span> : null}
            {vis.map((s, k) => (
              <span key={k} style={{ color: s.color ?? (l.kind === "out" ? "#B9C7DD" : COLORS.white), textShadow: s.color ? `0 0 12px ${s.color}88` : undefined }}>
                {s.text}
              </span>
            ))}
            {caret ? <span style={{ display: "inline-block", width: fontSize * 0.55, height: fontSize * 1.05, background: COLORS.cyan, verticalAlign: "middle", marginLeft: 2, boxShadow: `0 0 10px ${COLORS.cyan}` }} /> : null}
          </div>
        );
      })}
    </div>
  );
};

export const ArLabel: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 26, color = COLORS.muted }) => (
  <span style={{ fontFamily: FONT_FAMILY, fontSize: size, fontWeight: 700, color, direction: "rtl" }}>{children}</span>
);
