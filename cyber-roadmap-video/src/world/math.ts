/** positive modulo into [0, 1) — local frames are negative before a station is reached */
export const mod1 = (v: number) => ((v % 1) + 1) % 1;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** 0 → 1 → 0 bump of `len` frames starting at `at` */
export const pulse = (t: number, at: number, len = 30) => {
  const d = (t - at) / len;
  if (d < 0 || d > 1) return 0;
  return Math.sin(d * Math.PI);
};
