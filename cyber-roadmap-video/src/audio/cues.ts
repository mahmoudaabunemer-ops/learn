import { CAREERS, STAGES } from "../content";
import type { Timeline } from "../timeline";

export const AUDIO_FILES = {
  voiceover: "audio/voiceover.mp3",
  voiceover90: "audio/voiceover-90s.mp3",
  music: "audio/music-bed.mp3",
  whoosh: "audio/sfx-whoosh.mp3",
  click: "audio/sfx-click.mp3",
  pulse: "audio/sfx-data-pulse.mp3",
  rise: "audio/sfx-rise.mp3",
  impact: "audio/sfx-impact.mp3",
} as const;

export type SfxKind = "whoosh" | "click" | "pulse" | "rise" | "impact";

export type Cue = { kind: SfxKind; frame: number; volume: number; note: string };

export const SFX_VOLUME: Record<SfxKind, number> = {
  whoosh: 0.32,
  click: 0.16,
  pulse: 0.26,
  rise: 0.3,
  impact: 0.42,
};

/** SFX cue sheet, derived from the same timeline that drives the visuals. */
export const buildCues = (tl: Timeline): Cue[] => {
  const cues: Cue[] = [];
  const add = (kind: SfxKind, frame: number, note: string) => cues.push({ kind, frame: Math.max(0, Math.round(frame)), volume: SFX_VOLUME[kind], note });
  const sc = tl.scenes;
  add("rise", 2, "Shield particles assemble");
  for (let i = 1; i < sc.length; i++) {
    add("whoosh", sc[i].start - (i === 1 ? 46 : 16), `Camera fly-through → ${sc[i].id}`);
  }
  for (const st of STAGES) {
    const s = sc.find((x) => x.id === st.id)!;
    add("pulse", s.start + st.titleAt * s.dur, `Stage ${st.n} title: ${st.title}`);
    st.terms.forEach((t) => add("click", s.start + t.at * s.dur, `Term: ${t.en}`));
  }
  const career = sc[10];
  CAREERS.forEach((c) => add("click", career.start + c.at * career.dur + 4, `Career: ${c.en}`));
  const fin = sc[11];
  add("impact", fin.start + (tl.variant === "short" ? 8 : fin.dur * 0.04), "Finale slogan");
  add("pulse", fin.start + fin.dur * (tl.variant === "short" ? 0.42 : 0.48), "Brand lockup");
  return cues.sort((a, b) => a.frame - b.frame);
};
