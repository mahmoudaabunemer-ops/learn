export const COLORS = {
  navy: "#0D1F3C",
  deep: "#040B19",
  gold: "#B8892A",
  goldLight: "#E9C46A",
  cyan: "#00D9E8",
  white: "#F3F7FF",
  muted: "#8FA3C4",
  red: "#FF3D63",
  green: "#2EE6A6",
} as const;

export const FONT_FAMILY = "Cairo";
export const MONO_FAMILY = "'JetBrains Mono', monospace";

export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

// Short-form safe zones (Reels / TikTok UI overlays): keep all text inside.
export const SAFE = {
  top: 210,
  bottom: 1520,
  left: 80,
  right: 1000,
} as const;

// Vertical layout bands (px)
export const LAYOUT = {
  brandY: 214,
  stageLabelY: 292,
  titleY: 338,
  visualTop: 580,
  visualBottom: 1190,
  termsY: 1222,
  railY: 1478,
} as const;
