// Render preview stills for QA without starting the Studio.
// Usage: node scripts/stills.mjs <compositionId> <outDir> <frame> [frame...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [id, outDir, ...frames] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const chromiumOptions = { gl: "swangle" };
const composition = await selectComposition({ serveUrl, id, chromiumOptions });
for (const f of frames) {
  const output = path.join(outDir, `${id}-${String(f).padStart(4, "0")}.png`);
  try {
    await renderStill({ serveUrl, composition, frame: Number(f), output, chromiumOptions });
    console.log("wrote", output);
  } catch (e) {
    console.log(`FAILED frame ${f}: ${e.message}`);
  }
}
