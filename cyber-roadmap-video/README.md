# خارطة طريق تعلم الأمن السيبراني — نادي المهارات

Remotion + React + TypeScript + Three.js motion-graphics video, 1080×1920 (9:16), 30 fps, Arabic RTL (Cairo).

| Composition | Duration | Audio |
|---|---|---|
| `CyberRoadmap` | 118.7 s (3561 frames) | Synced to the supplied ElevenLabs voiceover + generated music & SFX |
| `CyberRoadmap90` | 90 s (2700 frames) | Brief's exact scene timings; music & SFX; VO optional (`public/audio/voiceover-90s.mp3`) |

> The supplied voiceover is 118 s, not 90 s. Squeezing it to 90 s would mean speeding it up ×1.31, so the main cut follows the narration and a separate 90 s cut follows the brief.

## Commands

```bash
npm i
npm run dev                         # Remotion Studio (preview)
npx remotion render CyberRoadmap out/cyber-roadmap.mp4
npx remotion render CyberRoadmap90 out/cyber-roadmap-90s.mp4
node scripts/stills.mjs CyberRoadmap out/stills 150 950 3555   # QA stills
python3 scripts/generate_audio.py   # re-synthesise music + SFX (numpy + ffmpeg)
```

`remotion.config.ts` sets `--gl=swangle` (software WebGL) so Three.js renders on machines without a GPU.
On a desktop with a GPU, `--gl=angle` renders faster.

## How it is built

- **One continuous 3D world** (`src/world/World.tsx`): eleven hexagonal stations on a glowing data path
  (`TubeGeometry` along a Catmull-Rom curve), a gold progress line, starfield, grid floor, fog, PBR
  lighting with a room environment map, shadows, and sprite glows standing in for bloom.
- **Camera** (`src/world/camera.ts`): a pure function of the frame. It holds on each station with a slow
  dolly/orbit, then flies to the next station along a Bézier arc. The hook flies straight through the
  shield. The finale pulls back over the whole map. The same math projects 3D anchors into
  overlay pixels, so labels stick to the objects.
- **Stations** (`src/world/stations/*`): particle shield, exploded PC, network topology with packets,
  Windows + Linux + permission locks, gears and an automation lane, a CIA-triad dome that deflects threats,
  a firewall that shatters malicious packets (plus VPN tunnel and IDS gate), a SOC wall of live
  canvas-texture screens, a sandboxed pentest lab, cloud infrastructure, and the career tree.
- **Overlay** (`src/overlay/*`): Cairo typography with word-by-word spring + blur reveals, bilingual terms
  with the newest one in gold, pinned AR labels, a CSS-3D glass terminal/code editor/SIEM feed, a 10-node
  RTL progress rail, bokeh parallax (depth-of-field feel), light sweeps between scenes, and a speed-based
  blur during fly-throughs (subtle motion blur).
- **Deterministic**: everything comes from `useCurrentFrame()`, seeded `random()` and `spring()`.
  No `useFrame`, timers or `requestAnimationFrame`.
- **Brand**: the official نادي المهارات emblem (`brand-src/nadi-al-maharat-logo.jpg`) is cut out onto
  transparency by `scripts/extract_logo.py` → `public/brand/logo-emblem.png`, and used in the top brand
  mark and the hook/finale lockups. The wordmark is typeset in Cairo so it stays crisp on navy.
- **Offline-safe**: fonts are bundled in `public/fonts` (Cairo, JetBrains Mono). No remote images. Audio is local and optional.

## Editing timing

- Scene boundaries: `src/timeline.ts` (`TIMELINE_VO`, `TIMELINE_90`)
- Titles / terms / reveal times (fractions of each scene): `src/content.ts`
- Audio cue sheet: generated from the above in `src/audio/cues.ts`; see `docs/AUDIO_TIMELINE.md`
- Voiceover text: `docs/VOICEOVER_SCRIPT.md`
