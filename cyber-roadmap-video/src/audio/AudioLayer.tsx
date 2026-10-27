import React from "react";
import { Audio } from "@remotion/media";
import { getStaticFiles, interpolate, Sequence, staticFile } from "remotion";
import type { Timeline } from "../timeline";
import { AUDIO_FILES, buildCues } from "./cues";

const has = (name: string) => getStaticFiles().some((f) => f.name === name);

/**
 * Every track is optional: if a file is missing from public/audio the video
 * still renders (silently for that track). Drop ElevenLabs exports in later.
 */
export const AudioLayer: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const vo = tl.variant === "vo" ? AUDIO_FILES.voiceover : AUDIO_FILES.voiceover90;
  const total = tl.total;
  const fin = tl.scenes[11].start;
  const cues = buildCues(tl);
  return (
    <>
      {has(vo) ? <Audio src={staticFile(vo)} volume={1} /> : null}
      {has(AUDIO_FILES.music) ? (
        <Audio
          src={staticFile(AUDIO_FILES.music)}
          trimAfter={total}
          volume={(f) =>
            interpolate(f, [0, 30, fin, fin + 60, total - 75, total - 5], [0, 0.13, 0.13, 0.2, 0.2, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
      {cues.map((c, i) =>
        has(AUDIO_FILES[c.kind]) ? (
          <Sequence key={i} from={c.frame} durationInFrames={120} layout="none" name={`SFX ${c.kind}`}>
            <Audio src={staticFile(AUDIO_FILES[c.kind])} volume={c.volume} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
