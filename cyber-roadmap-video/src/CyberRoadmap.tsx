import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { COLORS, FONT_FAMILY } from "./theme";
import { ensureFonts } from "./fonts";
import type { SceneId, Timeline } from "./timeline";
import { World } from "./world/World";
import { cameraSpeed } from "./world/camera";
import { Bokeh, Brand, Grade, LightSweeps, ProgressRail } from "./overlay/Chrome";
import { HookOverlay } from "./overlay/scenes/HookOverlay";
import {
  CloudOverlay,
  ComputerOverlay,
  HackingOverlay,
  NetSecOverlay,
  NetworkOverlay,
  OSOverlay,
  ProgrammingOverlay,
  SecFundOverlay,
  SocOverlay,
} from "./overlay/scenes/StageOverlays";
import { CareerOverlay, FinaleOverlay } from "./overlay/scenes/EndOverlays";
import type { SceneProps } from "./overlay/scenes/types";
import { AudioLayer } from "./audio/AudioLayer";

ensureFonts();

const OVERLAYS: Record<SceneId, React.FC<SceneProps>> = {
  hook: HookOverlay,
  computer: ComputerOverlay,
  network: NetworkOverlay,
  os: OSOverlay,
  programming: ProgrammingOverlay,
  secfund: SecFundOverlay,
  netsec: NetSecOverlay,
  soc: SocOverlay,
  hacking: HackingOverlay,
  cloud: CloudOverlay,
  career: CareerOverlay,
  finale: FinaleOverlay,
};

export type CyberRoadmapProps = { tl: Timeline };

export const CyberRoadmap: React.FC<CyberRoadmapProps> = ({ tl }) => {
  const frame = useCurrentFrame();
  // subtle motion blur proportional to camera speed during fly-throughs
  const blur = Math.min(1.6, cameraSpeed(frame, tl) * 1.1);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.deep, fontFamily: FONT_FAMILY }}>
      <AbsoluteFill style={{ filter: blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
        <World tl={tl} />
      </AbsoluteFill>
      <Grade />
      <Bokeh tl={tl} />
      <LightSweeps tl={tl} />
      {tl.scenes.map((s) => {
        const O = OVERLAYS[s.id];
        return (
          <Sequence key={s.id} name={`Scene ${String(s.index + 1).padStart(2, "0")} · ${s.id}`} from={s.start} durationInFrames={s.dur}>
            <AbsoluteFill>
              <O scene={s} tl={tl} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <Brand tl={tl} />
      <ProgressRail tl={tl} />
      <AudioLayer tl={tl} />
    </AbsoluteFill>
  );
};
