import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT_FAMILY, LAYOUT, MONO_FAMILY } from "../../theme";
import { stageById } from "../../content";
import type { SceneId } from "../../timeline";
import { project, stationWorld } from "../../world/camera";
import {
  CIA,
  CLOUD_CENTER,
  CLOUD_SERVERS,
  computerAnchor,
  computerExplode,
  computerParts,
  packetPos,
  TAGGED_PACKETS,
} from "../../world/layout";
import type { V3 } from "../../world/layout";
import { LAB_VULNS } from "../../world/stations/LabStation";
import { glowText, PinLabel, StageHeader, TermsRow } from "../Typography";
import { GlassScreen, Terminal, WindowDots } from "../Panels";
import type { TermLine } from "../Panels";
import type { SceneProps } from "./types";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useSpringAt = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number) => spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 140, mass: 0.7 } });
};

/** fades labels out with the scene */
const useSceneOut = (dur: number) => {
  const frame = useCurrentFrame();
  return 1 - interpolate(frame, [dur - 16, dur - 4], [0, 1], clamp);
};

const Header: React.FC<{ id: SceneId; dur: number }> = ({ id, dur }) => {
  const st = stageById(id)!;
  return <StageHeader n={st.n} title={st.title} titleAt={Math.round(st.titleAt * dur)} dur={dur} />;
};

const usePin = (scene: SceneProps["scene"], tl: SceneProps["tl"]) => {
  const frame = useCurrentFrame();
  return (local: V3) => project(frame + scene.start, tl, stationWorld(scene.index, local));
};

// ---------------------------------------------------------------- 01 Computer
export const ComputerOverlay: React.FC<SceneProps> = ({ scene, tl }) => {
  const frame = useCurrentFrame();
  const sp = useSpringAt();
  const pin = usePin(scene, tl);
  const out = useSceneOut(scene.dur);
  const terms = stageById("computer")!.terms;
  const P = computerParts(computerExplode(frame, scene.dur));
  const at = (i: number) => Math.round(terms[i].at * scene.dur);
  const items: { p: V3; i: number; dy: number; c: string }[] = [
    { p: computerAnchor([P.heatsink[0], P.heatsink[1] + 0.25, P.heatsink[2]]), i: 0, dy: -86, c: COLORS.goldLight },
    { p: computerAnchor([P.ram[0], P.ram[1] + 0.25, P.ram[2]]), i: 1, dy: -96, c: COLORS.cyan },
    { p: computerAnchor([P.ssd[0], P.ssd[1], P.ssd[2] + 0.2]), i: 2, dy: 70, c: COLORS.cyan },
    { p: [-1.85, 2.6, 0.6], i: 3, dy: 70, c: COLORS.cyan },
  ];
  return (
    <>
      <Header id="computer" dur={scene.dur} />
      {items.map(({ p, i, dy, c }) => {
        const q = pin(p);
        return <PinLabel key={i} x={q.x} y={q.y} en={terms[i].en} ar={terms[i].ar} show={sp(at(i)) * out} dy={dy} color={c} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- 02 Network
export const NetworkOverlay: React.FC<SceneProps> = ({ scene, tl }) => {
  const frame = useCurrentFrame();
  const pin = usePin(scene, tl);
  const out = useSceneOut(scene.dur);
  const terms = stageById("network")!.terms;
  return (
    <>
      <Header id="network" dur={scene.dur} />
      {TAGGED_PACKETS.map((tp) => {
        const at = Math.round(terms[tp.termIdx].at * scene.dur);
        if (frame < at) return null;
        const q = pin(packetPos(tp.k, frame));
        const o = interpolate(frame, [at, at + 8], [0, 1], clamp) * out;
        return (
          <div
            key={tp.k}
            style={{
              position: "absolute",
              left: q.x + 18,
              top: q.y - 46,
              direction: "ltr",
              fontFamily: MONO_FAMILY,
              fontWeight: 700,
              fontSize: 26,
              color: COLORS.goldLight,
              opacity: o,
              whiteSpace: "nowrap",
              textShadow: glowText(COLORS.gold, 0.9),
            }}
          >
            {tp.label}
          </div>
        );
      })}
      <TermsRow terms={terms} dur={scene.dur} />
    </>
  );
};

// ---------------------------------------------------------------- 03 Operating systems
export const OSOverlay: React.FC<SceneProps> = ({ scene }) => {
  const d = scene.dur;
  const terms = stageById("os")!.terms;
  const t0 = Math.round(d * 0.24);
  const tp = Math.round(terms[3].at * d);
  const step = Math.max(10, Math.round(d * 0.07));
  const permHi = useCurrentFrame() >= tp;
  const lines: TermLine[] = [
    { kind: "cmd", segs: [{ text: "uname -o" }], at: t0 },
    { kind: "out", segs: [{ text: "GNU/Linux" }], at: t0 + step },
    { kind: "cmd", segs: [{ text: "ls -l /srv/reports" }], at: t0 + step + 4 },
    {
      kind: "out",
      segs: [
        { text: "-" },
        { text: "rw-", color: permHi ? COLORS.goldLight : undefined },
        { text: "r--", color: permHi ? COLORS.cyan : undefined },
        { text: "---", color: permHi ? COLORS.red : undefined },
        { text: " analyst soc audit.log" },
      ],
      at: t0 + step * 2 + 6,
    },
    {
      kind: "out",
      segs: [{ text: "d" }, { text: "rwxr-x---", color: permHi ? COLORS.goldLight : undefined }, { text: " root    soc evidence/" }],
      at: t0 + step * 2 + 10,
    },
    { kind: "cmd", segs: [{ text: "chmod " }, { text: "640", color: COLORS.goldLight }, { text: " audit.log" }], at: tp - 8 },
  ];
  return (
    <>
      <Header id="os" dur={d} />
      <GlassScreen top={640} width={700} height={400} at={Math.round(d * 0.2)} exitAt={d - 16} tiltY={-8} header={<WindowDots title="bash — analyst@lab" />}>
        <Terminal lines={lines} cps={1.8} fontSize={26} />
      </GlassScreen>
      <TermsRow terms={terms} dur={d} />
    </>
  );
};

// ---------------------------------------------------------------- 04 Programming
const SNIPPETS: Record<string, { file: string; lines: { t: string; c?: string }[][] }> = {
  Python: {
    file: "scan.py",
    lines: [
      [{ t: "for ", c: COLORS.goldLight }, { t: "host " }, { t: "in ", c: COLORS.goldLight }, { t: "hosts:" }],
      [{ t: "    if ", c: COLORS.goldLight }, { t: "port_open(host, " }, { t: "22", c: COLORS.cyan }, { t: "):" }],
      [{ t: "        alert(host)" }],
    ],
  },
  Bash: {
    file: "logs.sh",
    lines: [
      [{ t: "for ", c: COLORS.goldLight }, { t: "f " }, { t: "in ", c: COLORS.goldLight }, { t: "/var/log/*.log" }],
      [{ t: "  grep " }, { t: '"Failed"', c: COLORS.green }, { t: ' "$f"' }],
      [{ t: "done", c: COLORS.goldLight }],
    ],
  },
  PowerShell: {
    file: "events.ps1",
    lines: [
      [{ t: "Get-WinEvent", c: COLORS.cyan }, { t: " -LogName " }, { t: "Security", c: COLORS.green }],
      [{ t: "  | Where Id " }, { t: "-eq ", c: COLORS.goldLight }, { t: "4625", c: COLORS.cyan }],
      [{ t: "  | Export-Csv " }, { t: "failed.csv", c: COLORS.green }],
    ],
  },
};

export const ProgrammingOverlay: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const sp = useSpringAt();
  const d = scene.dur;
  const terms = stageById("programming")!.terms;
  const times = terms.map((t) => Math.round(t.at * d));
  let cur = 0;
  times.forEach((t, i) => {
    if (frame >= t) cur = i;
  });
  const lang = terms[cur].en;
  const snip = SNIPPETS[lang];
  const since = frame - times[cur];
  const autoAt = Math.round(d * 0.72);
  const morph = interpolate(frame, [autoAt, autoAt + 24], [0, 1], clamp);
  const out = useSceneOut(d);
  return (
    <>
      <Header id="programming" dur={d} />
      <GlassScreen
        top={630}
        width={760}
        height={330}
        at={Math.round(d * 0.3)}
        exitAt={d - 16}
        tiltY={9}
        header={
          <div style={{ display: "flex", direction: "ltr", padding: "14px 18px 4px", gap: 8 }}>
            {terms.map((t, i) => {
              const s = sp(times[i] - 6);
              const on = i === cur;
              return (
                <div
                  key={t.en}
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontWeight: 800,
                    fontSize: 26,
                    padding: "2px 16px",
                    color: on ? COLORS.goldLight : COLORS.muted,
                    opacity: 0.35 + 0.65 * Math.min(1, s),
                    borderBottom: `3px solid ${on ? COLORS.goldLight : "transparent"}`,
                    textShadow: on ? glowText(COLORS.gold, 0.8) : undefined,
                  }}
                >
                  {t.en}
                </div>
              );
            })}
            <div style={{ marginLeft: "auto", fontFamily: MONO_FAMILY, fontSize: 19, color: COLORS.muted, alignSelf: "center" }}>{snip.file}</div>
          </div>
        }
      >
        <div style={{ padding: "16px 28px", direction: "ltr", fontFamily: MONO_FAMILY, fontSize: 27, lineHeight: 1.65 }}>
          {snip.lines.map((ln, li) => {
            const text = ln.map((s) => s.t).join("");
            const chars = Math.max(0, Math.floor((since - li * 9) * 2.2));
            let left = Math.min(chars, text.length);
            return (
              <div key={li} style={{ whiteSpace: "pre", display: "flex", alignItems: "center" }}>
                <span style={{ color: "#3d5a80", width: 38 }}>{li + 1}</span>
                <span style={{ opacity: 1 - morph * 0.75 }}>
                  {ln.map((s, k) => {
                    const v = s.t.slice(0, Math.max(0, left));
                    left -= s.t.length;
                    return (
                      <span key={k} style={{ color: s.c ?? COLORS.white }}>
                        {v}
                      </span>
                    );
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </GlassScreen>
      {/* code lines turn into automation flow paths heading into the gears */}
      {morph > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: out }}>
          <defs>
            <linearGradient id="flow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={COLORS.cyan} />
              <stop offset="1" stopColor={COLORS.goldLight} />
            </linearGradient>
          </defs>
          {[0, 1, 2].map((li) => {
            const y0 = 760 + li * 45;
            const path = `M ${300 + li * 80} ${y0} C ${360 + li * 60} ${y0 + 180}, ${520 + li * 20} ${1000}, ${540 + (li - 1) * 90} ${1130}`;
            const len = 700;
            return (
              <path
                key={li}
                d={path}
                fill="none"
                stroke="url(#flow)"
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={`${len}`}
                strokeDashoffset={len * (1 - morph)}
                style={{ filter: `drop-shadow(0 0 8px ${COLORS.cyan})` }}
              />
            );
          })}
        </svg>
      ) : null}
      <AutomationCaption at={autoAt + 6} dur={d} />
    </>
  );
};

const AutomationCaption: React.FC<{ at: number; dur: number }> = ({ at, dur }) => {
  const sp = useSpringAt();
  const s = sp(at);
  const out = useSceneOut(dur);
  return (
    <div
      style={{
        position: "absolute",
        top: LAYOUT.termsY + 20,
        width: 1080,
        textAlign: "center",
        direction: "rtl",
        fontFamily: FONT_FAMILY,
        opacity: Math.min(1, s) * out,
        transform: `translateY(${(1 - s) * 30}px)`,
      }}
    >
      <div style={{ fontSize: 58, fontWeight: 900, color: COLORS.goldLight, textShadow: glowText(COLORS.gold, 1) }}>أتمتة المهام</div>
      <div style={{ fontSize: 30, fontWeight: 600, color: COLORS.muted, direction: "ltr" }}>Automation</div>
    </div>
  );
};

// ---------------------------------------------------------------- 05 Security fundamentals
export const SecFundOverlay: React.FC<SceneProps> = ({ scene, tl }) => {
  const sp = useSpringAt();
  const pin = usePin(scene, tl);
  const out = useSceneOut(scene.dur);
  const terms = stageById("secfund")!.terms;
  const ciaAt = Math.round(terms[0].at * scene.dur);
  const labels = [
    { p: CIA.c, en: "Confidentiality", ar: "السرية", dy: -64 },
    { p: CIA.i, en: "Integrity", ar: "السلامة", dy: 72 },
    { p: CIA.a, en: "Availability", ar: "التوافر", dy: 72 },
  ];
  return (
    <>
      <Header id="secfund" dur={scene.dur} />
      {labels.map((l, k) => {
        const q = pin(l.p);
        return <PinLabel key={l.en} x={q.x} y={q.y} en={l.en} ar={l.ar} show={sp(ciaAt + k * 6) * out} dy={l.dy} color={COLORS.goldLight} enSize={32} />;
      })}
      <TermsRow terms={terms.slice(1)} dur={scene.dur} />
    </>
  );
};

// ---------------------------------------------------------------- 06 Network security
export const NetSecOverlay: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const d = scene.dur;
  const out = useSceneOut(d);
  const blocked = Math.floor(interpolate(frame, [0, d], [1240, 1312]));
  const o = interpolate(frame, [d * 0.3, d * 0.4], [0, 1], clamp) * out;
  return (
    <>
      <Header id="netsec" dur={d} />
      <div style={{ position: "absolute", top: 1128, width: 1080, display: "flex", justifyContent: "center", gap: 60, fontFamily: MONO_FAMILY, fontSize: 24, opacity: o, direction: "ltr" }}>
        <span style={{ color: COLORS.red, textShadow: glowText(COLORS.red, 0.6) }}>BLOCKED {blocked}</span>
        <span style={{ color: COLORS.cyan, textShadow: glowText(COLORS.cyan, 0.6) }}>ALLOWED 98.6%</span>
      </div>
      <TermsRow terms={stageById("netsec")!.terms} dur={d} />
    </>
  );
};

// ---------------------------------------------------------------- 07 SOC
const ALERTS = [
  { sev: "HIGH", c: COLORS.red, text: "Brute force · 27 failed logins · 10.0.4.12" },
  { sev: "MED", c: COLORS.goldLight, text: "Port scan detected · 172.16.2.9" },
  { sev: "HIGH", c: COLORS.red, text: "Malware hash match · WS-114" },
  { sev: "LOW", c: COLORS.cyan, text: "New admin account · srv-db01" },
];

export const SocOverlay: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const sp = useSpringAt();
  const d = scene.dur;
  const terms = stageById("soc")!.terms;
  const irAt = Math.round(terms[2].at * d);
  return (
    <>
      <Header id="soc" dur={d} />
      <GlassScreen
        top={600}
        width={800}
        height={270}
        at={Math.round(d * 0.12)}
        exitAt={d - 16}
        tiltY={-6}
        header={
          <div style={{ display: "flex", direction: "ltr", padding: "14px 24px 2px", alignItems: "center", gap: 12, fontFamily: MONO_FAMILY, fontSize: 21 }}>
            <div style={{ width: 11, height: 11, borderRadius: 6, background: COLORS.red, opacity: Math.floor(frame / 10) % 2 ? 1 : 0.3, boxShadow: `0 0 10px ${COLORS.red}` }} />
            <span style={{ color: COLORS.white, fontWeight: 700 }}>SIEM · Live alerts</span>
            <span style={{ marginLeft: "auto", color: COLORS.muted }}>events/s {1820 + Math.round(Math.sin(frame * 0.3) * 40)}</span>
          </div>
        }
      >
        <div style={{ padding: "8px 24px", direction: "ltr", fontFamily: MONO_FAMILY, fontSize: 22, lineHeight: 1.75 }}>
          {ALERTS.map((a, i) => {
            const s = sp(Math.round(d * 0.2) + i * 7);
            const contained = i === 0 && frame > irAt + 4;
            return (
              <div key={i} style={{ display: "flex", gap: 14, opacity: Math.min(1, s), transform: `translateX(${(1 - s) * 60}px)`, whiteSpace: "nowrap" }}>
                <span style={{ color: a.c, fontWeight: 700, width: 64 }}>{a.sev}</span>
                <span style={{ color: contained ? COLORS.muted : "#D6E2F5" }}>{a.text}</span>
                {contained ? <span style={{ color: COLORS.green, fontWeight: 700, marginLeft: "auto" }}>CONTAINED</span> : null}
              </div>
            );
          })}
        </div>
      </GlassScreen>
      <TermsRow terms={terms} dur={d} />
    </>
  );
};

// ---------------------------------------------------------------- 08 Ethical hacking
const FINDINGS = [
  { en: "A01 Broken Access Control" },
  { en: "A03 Injection" },
  { en: "A05 Misconfiguration" },
  { en: "A07 Auth Failures" },
];

const CheckShield: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M20 3 L34 8 V19 C34 28 28 34 20 37 C12 34 6 28 6 19 V8 Z" fill="none" stroke={COLORS.goldLight} strokeWidth={3} />
    <path d="M13 20 L18 25 L28 14" fill="none" stroke={COLORS.green} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HackingOverlay: React.FC<SceneProps> = ({ scene, tl }) => {
  const frame = useCurrentFrame();
  const sp = useSpringAt();
  const pin = usePin(scene, tl);
  const out = useSceneOut(scene.dur);
  const d = scene.dur;
  const terms = stageById("hacking")!.terms;
  const owasp = Math.round(terms[0].at * d);
  const fixAt = Math.round(terms[2].at * d) + 22;
  const badge = sp(Math.round(d * 0.2));
  return (
    <>
      <Header id="hacking" dur={d} />
      <div
        style={{
          position: "absolute",
          top: 588,
          width: 1080,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          direction: "rtl",
          fontFamily: FONT_FAMILY,
          opacity: Math.min(1, badge) * out,
          transform: `scale(${0.85 + 0.15 * badge})`,
        }}
      >
        <CheckShield size={50} />
        <span style={{ fontSize: 36, fontWeight: 800, color: COLORS.goldLight, textShadow: glowText(COLORS.gold, 0.8) }}>بيئة مصرّح بها</span>
        <span style={{ fontSize: 24, fontWeight: 700, color: COLORS.muted, direction: "ltr", fontFamily: MONO_FAMILY }}>AUTHORIZED SCOPE</span>
      </div>
      {LAB_VULNS.map((p, k) => {
        const at = owasp + k * 14;
        const q = pin(p);
        const fixed = frame > fixAt + k * 6;
        const side = k < 2 ? 1 : -1;
        const s = Math.min(1, sp(at)) * out;
        if (s <= 0.01) return null;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              top: q.y - 16,
              left: side > 0 ? undefined : q.x + 26,
              right: side > 0 ? 1080 - q.x + 26 : undefined,
              direction: "ltr",
              fontFamily: MONO_FAMILY,
              fontSize: 22,
              fontWeight: 700,
              whiteSpace: "nowrap",
              color: fixed ? COLORS.green : COLORS.red,
              opacity: s,
              textShadow: glowText(fixed ? COLORS.green : COLORS.red, 0.7),
            }}
          >
            {FINDINGS[k].en}
            {fixed ? " · FIXED" : ""}
          </div>
        );
      })}
      <TermsRow terms={terms} dur={d} />
    </>
  );
};

// ---------------------------------------------------------------- 09 Cloud
export const CloudOverlay: React.FC<SceneProps> = ({ scene, tl }) => {
  const sp = useSpringAt();
  const pin = usePin(scene, tl);
  const out = useSceneOut(scene.dur);
  const d = scene.dur;
  const terms = stageById("cloud")!.terms;
  const aws = pin([CLOUD_SERVERS[0][0], 1.3, CLOUD_SERVERS[0][2]]);
  const az = pin([CLOUD_SERVERS[2][0], 1.3, CLOUD_SERVERS[2][2]]);
  const lock = pin([CLOUD_CENTER[0], CLOUD_CENTER[1] + 0.3, CLOUD_CENTER[2] + 0.75]);
  return (
    <>
      <Header id="cloud" dur={d} />
      <PinLabel x={aws.x} y={aws.y} en="AWS" show={sp(Math.round(terms[0].at * d)) * out} dy={-80} color={COLORS.goldLight} enSize={40} />
      <PinLabel x={az.x} y={az.y} en="Azure" show={sp(Math.round(terms[1].at * d)) * out} dy={-80} color={COLORS.cyan} enSize={40} />
      <PinLabel x={lock.x} y={lock.y} en="Least Privilege" ar="أقل صلاحية ممكنة" show={sp(Math.round(terms[2].at * d) + 8) * out} dy={-150} color={COLORS.goldLight} enSize={30} />
      <TermsRow terms={terms} dur={d} />
    </>
  );
};
