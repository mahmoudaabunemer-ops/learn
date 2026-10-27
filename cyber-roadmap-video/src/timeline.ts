import { VIDEO } from "./theme";

export const SCENE_IDS = [
  "hook",
  "computer",
  "network",
  "os",
  "programming",
  "secfund",
  "netsec",
  "soc",
  "hacking",
  "cloud",
  "career",
  "finale",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export type SceneSpec = {
  id: SceneId;
  index: number;
  start: number; // frames
  dur: number; // frames
};

export type Variant = "vo" | "short";

export type Timeline = {
  variant: Variant;
  scenes: SceneSpec[];
  total: number;
};

const build = (variant: Variant, startsSec: number[], endSec: number): Timeline => {
  const toF = (s: number) => Math.round(s * VIDEO.fps);
  const scenes = SCENE_IDS.map((id, index) => {
    const start = toF(startsSec[index]);
    const end = index < SCENE_IDS.length - 1 ? toF(startsSec[index + 1]) : toF(endSec);
    return { id, index, start, dur: end - start };
  });
  return { variant, scenes, total: toF(endSec) };
};

// Synced to the supplied ElevenLabs voiceover (118.2s). Boundaries come from the
// word-level transcript (see docs/AUDIO_TIMELINE.md).
export const TIMELINE_VO = build(
  "vo",
  [0, 25.48, 33.76, 41.22, 49.44, 57.52, 64.5, 68.2, 72.38, 79.2, 85.32, 100.16],
  118.7,
);

// The 90s brief timings (Scene 01 0–6s … Scene 12 83–90s).
export const TIMELINE_90 = build(
  "short",
  [0, 6, 13, 20, 27, 34, 41, 48, 56, 64, 72, 83],
  90,
);

export const sceneAt = (tl: Timeline, frame: number): SceneSpec => {
  for (let i = tl.scenes.length - 1; i >= 0; i--) {
    if (frame >= tl.scenes[i].start) return tl.scenes[i];
  }
  return tl.scenes[0];
};
