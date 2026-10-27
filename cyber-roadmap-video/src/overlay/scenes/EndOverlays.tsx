import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY, LAYOUT } from "../../theme";
import { CAREERS, PROJECTS, STAGES } from "../../content";
import { project, stationWorld } from "../../world/camera";
import { CAREER_COLORS, CAREER_LEAVES } from "../../world/layout";
import { glowText, Headline, PinLabel, StageHeader, useReveal } from "../Typography";
import { BrandLockup } from "./HookOverlay";
import type { SceneProps } from "./types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Statement: React.FC<{ text: string; at: number; exitAt: number; top: number; size: number; color?: string }> = ({ text, at, exitAt, top, size, color = COLORS.white }) => {
  const r = useReveal(at, exitAt);
  return (
    <div style={{ position: "absolute", top, width: 1080, textAlign: "center", direction: "rtl", fontFamily: FONT_FAMILY, ...r.style }}>
      <span style={{ fontSize: size, fontWeight: 900, color, textShadow: glowText(color === COLORS.white ? COLORS.cyan : COLORS.gold, 0.9) }}>{text}</span>
    </div>
  );
};

// ---------------------------------------------------------------- 10 Career paths
export const CareerOverlay: React.FC<SceneProps> = ({ scene, tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = scene.dur;
  const f = (x: number) => Math.round(x * d);
  const out = 1 - interpolate(frame, [d - 16, d - 4], [0, 1], clamp);
  const st = STAGES[9];
  const short = tl.variant === "short";
  const projExit = short ? d - 16 : f(0.5);
  const projO = 1 - interpolate(frame, [projExit, projExit + 12], [0, 1], clamp);
  const dys = [-70, -70, -80, -70, -70];
  return (
    <>
      <StageHeader n={st.n} title={st.title} titleAt={f(st.titleAt)} dur={d} />
      {CAREER_LEAVES.map((leaf, k) => {
        const q = project(frame + scene.start, tl, stationWorld(scene.index, leaf));
        const s = spring({ frame: frame - f(CAREERS[k].at) - 4, fps, config: { damping: 14, stiffness: 140, mass: 0.7 } });
        return <PinLabel key={k} x={q.x} y={q.y} en={CAREERS[k].en} ar={CAREERS[k].ar} show={s * out} dy={dys[k]} color={CAREER_COLORS[k]} enSize={28} />;
      })}
      {/* practical projects that build a portfolio */}
      <div style={{ position: "absolute", top: LAYOUT.termsY - 6, width: 1080, direction: "rtl", fontFamily: FONT_FAMILY, opacity: projO * out }}>
        {frame >= f(PROJECTS[0].at) - 8 ? (
          <div style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: COLORS.goldLight, textShadow: glowText(COLORS.gold, 0.7), opacity: interpolate(frame, [f(PROJECTS[0].at) - 8, f(PROJECTS[0].at)], [0, 1], clamp) }}>
            مشاريع عملية تثبت مهاراتك
          </div>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: 50, rowGap: 6, marginTop: 10, padding: "0 90px" }}>
          {PROJECTS.map((p) => {
            const s = spring({ frame: frame - f(p.at), fps, config: { damping: 14, stiffness: 140, mass: 0.7 } });
            if (frame < f(p.at) - 1) return null;
            return (
              <div key={p.ar} style={{ display: "flex", alignItems: "center", gap: 12, opacity: Math.min(1, s), transform: `translateY(${(1 - s) * 24}px)`, width: 400, justifyContent: "flex-start" }}>
                <svg width={20} height={20}>
                  <rect x={5} y={5} width={10} height={10} transform="rotate(45 10 10)" fill={COLORS.goldLight} />
                </svg>
                <span style={{ fontSize: 34, fontWeight: 700, color: COLORS.white, textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>{p.ar}</span>
              </div>
            );
          })}
        </div>
      </div>
      {!short ? (
        <>
          <Statement text="لا نعتمد على الحفظ وحده" at={f(0.52)} exitAt={f(0.65)} top={LAYOUT.termsY + 30} size={52} />
          <Statement text="نشرح المفاهيم • ونطبّقها عمليًا" at={f(0.66)} exitAt={f(0.84)} top={LAYOUT.termsY + 30} size={50} color={COLORS.goldLight} />
          <Statement text="ونبني المعرفة من الأساس" at={f(0.85)} exitAt={d - 14} top={LAYOUT.termsY + 30} size={52} color={COLORS.goldLight} />
        </>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- 11 Finale
const SHORT_NAMES = ["الحاسوب", "الشبكات", "الأنظمة", "البرمجة", "الأساسيات", "أمن الشبكات", "SOC", "الاختبار الأخلاقي", "السحابة", "التخصص"];

export const FinaleOverlay: React.FC<SceneProps> = ({ scene, tl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = scene.dur;
  const f = (x: number) => Math.round(x * d);
  const short = tl.variant === "short";
  const words = ["تعلم", "طبّق", "ابنِ مشاريع", "تخصص"];
  const wordAt = short ? [8, 22, 36, 50] : [f(0.04), f(0.1), f(0.16), f(0.22)];
  const mapLabels = interpolate(frame, [short ? 30 : 70, short ? 50 : 100], [0, 1], clamp);
  const labelsOut = 1 - interpolate(frame, [short ? d - 70 : f(0.66), short ? d - 55 : f(0.7)], [0, 1], clamp);
  return (
    <>
      {/* slogan in two lines */}
      {[0, 1].map((line) => (
        <div
          key={line}
          style={{
            position: "absolute",
            top: LAYOUT.titleY - 64 + line * 112,
            width: 1080,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            direction: "rtl",
            fontFamily: FONT_FAMILY,
          }}
        >
          {words.slice(line * 2, line * 2 + 2).map((w, j) => {
            const i = line * 2 + j;
            const s = spring({ frame: frame - wordAt[i], fps, config: { damping: 12, stiffness: 150, mass: 0.7 } });
            const cur = frame >= wordAt[i] && (i === 3 || frame < wordAt[i + 1]);
            return (
              <React.Fragment key={w}>
                {j === 1 ? (
                  <span style={{ fontSize: 60, color: COLORS.cyan, margin: "0 26px", opacity: Math.min(1, s), textShadow: glowText(COLORS.cyan, 1) }}>•</span>
                ) : null}
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 88,
                    fontWeight: 900,
                    color: cur ? COLORS.goldLight : COLORS.white,
                    opacity: Math.min(1, s * 1.5),
                    transform: `translateY(${(1 - s) * 60}px) scale(${0.7 + 0.3 * s})`,
                    filter: `blur(${(1 - Math.min(1, s)) * 14}px)`,
                    textShadow: glowText(cur ? COLORS.gold : COLORS.cyan, 1),
                  }}
                >
                  {w}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      ))}
      {/* roadmap station labels on the overview */}
      {mapLabels > 0 && labelsOut > 0
        ? SHORT_NAMES.map((name, i) => {
            const q = project(frame + scene.start, tl, stationWorld(i + 1, [0, 0.4, 0]));
            if (!q.visible || q.y < LAYOUT.visualTop + 20 || q.y > LAYOUT.visualBottom + 10) return null;
            const o = Math.min(1, Math.max(0, mapLabels * 10 - i)) * labelsOut;
            return (
              <div
                key={name}
                style={{
                  position: "absolute",
                  left: q.x - 150,
                  width: 300,
                  top: q.y - 54,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "baseline",
                  gap: 8,
                  direction: "rtl",
                  fontFamily: FONT_FAMILY,
                  opacity: o,
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 900, color: COLORS.goldLight }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.white, textShadow: "0 2px 10px rgba(0,0,0,.85)" }}>{name}</span>
              </div>
            );
          })
        : null}
      {short ? (
        <BrandLockup at={f(0.42)} top={LAYOUT.termsY} tagline />
      ) : (
        <>
          <Headline text="رحلتك من الصفر نحو الاحتراف" at={f(0.32)} exitAt={f(0.47)} top={LAYOUT.termsY + 40} size={60} weight={800} highlight={["الصفر", "الاحتراف"]} />
          <BrandLockup at={f(0.48)} exitAt={f(0.66)} top={LAYOUT.termsY - 10} tagline />
          <EpisodeTeaser at={f(0.68)} exitAt={f(0.92)} />
          <FinalCard at={f(0.935)} />
        </>
      )}
    </>
  );
};

const EpisodeTeaser: React.FC<{ at: number; exitAt: number }> = ({ at, exitAt }) => {
  const r = useReveal(at, exitAt);
  const r2 = useReveal(at + 10, exitAt);
  const r3 = useReveal(at + 40, exitAt);
  return (
    <div style={{ position: "absolute", top: LAYOUT.termsY - 40, width: 1080, textAlign: "center", direction: "rtl", fontFamily: FONT_FAMILY }}>
      <div style={{ fontSize: 34, fontWeight: 800, color: COLORS.goldLight, textShadow: glowText(COLORS.gold, 0.8), ...r.style }}>الحلقة الأولى</div>
      <div style={{ fontSize: 66, fontWeight: 900, color: COLORS.white, textShadow: glowText(COLORS.cyan, 1), ...r2.style }}>ما هو الأمن السيبراني؟</div>
      <div style={{ fontSize: 32, fontWeight: 600, color: COLORS.muted, ...r3.style }}>ولماذا أصبح من أهم مجالات التقنية</div>
    </div>
  );
};

const FinalCard: React.FC<{ at: number }> = ({ at }) => {
  const r = useReveal(at);
  return (
    <>
      <div style={{ position: "absolute", top: LAYOUT.termsY - 70, width: 1080, textAlign: "center", direction: "rtl", fontFamily: FONT_FAMILY, ...r.style }}>
        <span style={{ fontSize: 64, fontWeight: 900, color: COLORS.goldLight, textShadow: glowText(COLORS.gold, 1.1) }}>هيا نبدأ</span>
      </div>
      <BrandLockup at={at + 6} top={LAYOUT.termsY + 40} tagline />
    </>
  );
};
