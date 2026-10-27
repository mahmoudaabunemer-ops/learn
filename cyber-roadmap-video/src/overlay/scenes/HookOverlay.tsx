import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT_FAMILY, LAYOUT } from "../../theme";
import type { SceneProps } from "./types";
import { glowText, Headline, useReveal } from "../Typography";
import { BrandMark } from "../Chrome";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Line: React.FC<{ text: string; at: number; exitAt: number; top: number; size: number; color?: string; weight?: number; strike?: number }> = ({
  text,
  at,
  exitAt,
  top,
  size,
  color = COLORS.white,
  weight = 800,
  strike,
}) => {
  const frame = useCurrentFrame();
  const r = useReveal(at, exitAt);
  const st = strike === undefined ? 0 : interpolate(frame, [strike, strike + 12], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top, width: 1080, textAlign: "center", direction: "rtl", fontFamily: FONT_FAMILY, ...r.style }}>
      <span style={{ position: "relative", fontSize: size, fontWeight: weight, color, textShadow: glowText(color === COLORS.white ? COLORS.cyan : color, 0.8) }}>
        {text}
        {st > 0 ? (
          <span
            style={{
              position: "absolute",
              right: 0,
              top: "55%",
              height: 5,
              width: `${st * 100}%`,
              background: COLORS.red,
              boxShadow: `0 0 14px ${COLORS.red}`,
              borderRadius: 3,
            }}
          />
        ) : null}
      </span>
    </div>
  );
};

export const HookOverlay: React.FC<SceneProps> = ({ scene, tl }) => {
  const d = scene.dur;
  const f = (x: number) => Math.round(x * d);
  if (tl.variant === "short") {
    return (
      <>
        <Headline text="كيف تبدأ تعلم" at={4} exitAt={d - 40} top={LAYOUT.titleY - 20} size={104} />
        <Headline text="الأمن السيبراني؟" at={14} exitAt={d - 40} top={LAYOUT.titleY + 112} size={112} highlight={["الأمن", "السيبراني؟"]} />
        <Line text="من الصفر إلى الاحتراف" at={60} exitAt={d - 40} top={LAYOUT.termsY + 20} size={50} color={COLORS.goldLight} />
      </>
    );
  }
  // voiceover beats (fractions tuned to the narration)
  const qExit = f(0.37);
  return (
    <>
      {/* Beat A — the hook question */}
      <Headline text="كيف تبدأ تعلم" at={4} exitAt={f(0.58)} top={LAYOUT.titleY - 20} size={104} />
      <Headline text="الأمن السيبراني؟" at={14} exitAt={f(0.58)} top={LAYOUT.titleY + 112} size={112} highlight={["الأمن", "السيبراني؟"]} />
      <Line text="الاختراق الأخلاقي؟" at={f(0.19)} exitAt={qExit + 10} top={LAYOUT.termsY - 10} size={54} strike={qExit - 4} />
      <Line text="لينكس؟" at={f(0.265)} exitAt={qExit + 10} top={LAYOUT.termsY + 70} size={54} strike={qExit - 2} />
      <Line text="البرمجة؟" at={f(0.33)} exitAt={qExit + 10} top={LAYOUT.termsY + 150} size={54} strike={qExit} />
      {/* Beat B — the right path */}
      <Line text="الطريق الصحيح لا يبدأ بالاختراق" at={f(0.38)} exitAt={f(0.59)} top={LAYOUT.termsY + 10} size={50} />
      <Line text="بل بفهم التقنية التي تريد حمايتها" at={f(0.5)} exitAt={f(0.59)} top={LAYOUT.termsY + 96} size={50} color={COLORS.goldLight} />
      {/* Beat C — series title + brand */}
      <SeriesTitle at={f(0.61)} exitAt={d - 50} />
      <BrandLockup at={f(0.81)} exitAt={f(0.9)} />
      <Line text="خطوة بخطوة" at={f(0.9)} exitAt={d - 40} top={LAYOUT.termsY + 40} size={64} color={COLORS.goldLight} weight={900} />
    </>
  );
};

const SeriesTitle: React.FC<{ at: number; exitAt: number }> = ({ at, exitAt }) => {
  const r = useReveal(at, exitAt);
  return (
    <>
      <div style={{ position: "absolute", top: LAYOUT.stageLabelY - 4, width: 1080, textAlign: "center", fontFamily: FONT_FAMILY, direction: "rtl", ...r.style }}>
        <span style={{ fontSize: 34, fontWeight: 700, color: COLORS.goldLight, textShadow: glowText(COLORS.gold, 0.7) }}>سلسلة جديدة</span>
      </div>
      <Headline text="تعلم الأمن السيبراني" at={at + 4} exitAt={exitAt} top={LAYOUT.titleY} size={100} highlight={["السيبراني"]} />
      <Headline text="من الصفر إلى الاحتراف" at={at + 14} exitAt={exitAt} top={LAYOUT.titleY + 130} size={64} weight={800} color={COLORS.white} highlight={["الصفر", "الاحتراف"]} />
    </>
  );
};

export const BrandLockup: React.FC<{ at: number; exitAt?: number; top?: number; tagline?: boolean }> = ({ at, exitAt, top = LAYOUT.termsY, tagline = false }) => {
  const r = useReveal(at, exitAt);
  return (
    <div
      style={{
        position: "absolute",
        top,
        width: 1080,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
        direction: "rtl",
        ...r.style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <BrandMark size={112} />
        <span style={{ fontSize: 76, fontWeight: 900, color: COLORS.white, textShadow: glowText(COLORS.gold, 1) }}>نادي المهارات</span>
      </div>
      {tagline ? (
        <div style={{ marginTop: 6, fontSize: 38, fontWeight: 700, color: COLORS.goldLight, textShadow: glowText(COLORS.gold, 0.6) }}>
          <span style={{ color: COLORS.cyan, margin: "0 12px" }}>|</span>
          تعلم التقنية من الصفر
          <span style={{ color: COLORS.cyan, margin: "0 12px" }}>|</span>
        </div>
      ) : null}
    </div>
  );
};
