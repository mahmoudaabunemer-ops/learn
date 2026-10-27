import React from "react";
import { Composition, Folder } from "remotion";
import { CyberRoadmap } from "./CyberRoadmap";
import { VIDEO } from "./theme";
import { TIMELINE_90, TIMELINE_VO } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Folder name="Cybersecurity-Roadmap">
    {/* Main deliverable: synced to the supplied ElevenLabs voiceover (≈118.7s) */}
    <Composition
      id="CyberRoadmap"
      component={CyberRoadmap}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={TIMELINE_VO.total}
      defaultProps={{ tl: TIMELINE_VO }}
    />
    {/* 90-second cut following the brief's scene timings (music + SFX, VO optional) */}
    <Composition
      id="CyberRoadmap90"
      component={CyberRoadmap}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={TIMELINE_90.total}
      defaultProps={{ tl: TIMELINE_90 }}
    />
  </Folder>
);
