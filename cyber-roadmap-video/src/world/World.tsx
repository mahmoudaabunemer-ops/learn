import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";
import type { Timeline } from "../timeline";
import { FOV, getCamera, getPathCurve, pathProgressU, STATION_POS } from "./camera";
import type { CameraInfo } from "./camera";
import { Beacon, getGlowTexture, Glow, Platform } from "./common";
import { clamp } from "./layout";
import { ShieldStation } from "./stations/ShieldStation";
import { ComputerStation } from "./stations/ComputerStation";
import { NetworkStation } from "./stations/NetworkStation";
import { OSStation } from "./stations/OSStation";
import { CodeStation } from "./stations/CodeStation";
import { SecFundStation } from "./stations/SecFundStation";
import { FirewallStation } from "./stations/FirewallStation";
import { SocStation } from "./stations/SocStation";
import { LabStation } from "./stations/LabStation";
import { CloudStation } from "./stations/CloudStation";
import { CareerStation } from "./stations/CareerStation";
import type { StationProps } from "./stations/types";

const STATIONS: React.FC<StationProps>[] = [
  ShieldStation,
  ComputerStation,
  NetworkStation,
  OSStation,
  CodeStation,
  SecFundStation,
  FirewallStation,
  SocStation,
  LabStation,
  CloudStation,
  CareerStation,
];

const CameraRig: React.FC<{ cam: CameraInfo }> = ({ cam }) => {
  const camera = useThree((s) => s.camera);
  // Deterministic: the camera is a pure function of the current frame.
  camera.position.set(...cam.pos);
  camera.lookAt(...cam.target);
  camera.updateMatrixWorld();
  return null;
};

const Environment: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    pm.dispose();
  }, [gl, scene]);
  return null;
};

const Stars: React.FC<{ frame: number }> = ({ frame }) => {
  const geo = useMemo(() => {
    const n = 1600;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (random(`stx${i}`) - 0.5) * 220;
      arr[i * 3 + 1] = -6 + random(`sty${i}`) * 70;
      arr[i * 3 + 2] = 40 - random(`stz${i}`) * 300;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} rotation={[0, Math.sin(frame * 0.002) * 0.03, 0]}>
      <pointsMaterial map={getGlowTexture()} color="#9fdcff" size={0.45} transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  );
};

const DataPath: React.FC<{ frame: number; progress: number }> = ({ frame, progress }) => {
  const { curve } = getPathCurve();
  const SEG = 900;
  const geo = useMemo(() => new THREE.TubeGeometry(curve, SEG, 0.05, 8, false), [curve]);
  const geoGold = useMemo(() => new THREE.TubeGeometry(curve, SEG, 0.075, 8, false), [curve]);
  geoGold.setDrawRange(0, Math.floor(progress * SEG) * 8 * 6);
  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial color={COLORS.cyan} transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh geometry={geoGold}>
        <meshBasicMaterial color={COLORS.goldLight} toneMapped={false} />
      </mesh>
      {Array.from({ length: 26 }, (_, k) => {
        const u = ((frame * 0.0009 + k / 26) % 1 + 1) % 1;
        const p = curve.getPointAt(u);
        const lit = u < progress;
        return <Glow key={k} position={[p.x, p.y + 0.02, p.z]} scale={lit ? 1.2 : 0.9} color={lit ? COLORS.goldLight : COLORS.cyan} opacity={0.9} />;
      })}
      <Glow position={[curve.getPointAt(Math.max(0.001, progress)).x, -0.2, curve.getPointAt(Math.max(0.001, progress)).z]} scale={3} color={COLORS.goldLight} opacity={0.9} />
    </group>
  );
};

export const World: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = getCamera(frame, tl);
  const finale = tl.scenes[11];
  const overview = interpolate(frame, [finale.start - 10, finale.start + 110], [0, 1], clamp);
  const fogNear = interpolate(overview, [0, 1], [18, 80]);
  const fogFar = interpolate(overview, [0, 1], [58, 330]);
  const keyTarget = useMemo(() => new THREE.Object3D(), []);
  keyTarget.position.set(...cam.target);
  keyTarget.updateMatrixWorld();
  const progress = pathProgressU(cam.stationFloat);

  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows
      gl={{ antialias: true }}
      camera={{ fov: FOV, near: 0.1, far: 600, position: cam.pos }}
    >
      <CameraRig cam={cam} />
      <Environment />
      <color attach="background" args={[COLORS.deep]} />
      <fog attach="fog" args={["#061229", fogNear, fogFar]} />
      <ambientLight intensity={0.35} color="#7aa2d6" />
      <hemisphereLight args={["#5fd3ff", COLORS.navy, 0.55]} />
      <primitive object={keyTarget} />
      <directionalLight
        position={[cam.target[0] - 6, cam.target[1] + 11, cam.target[2] + 7]}
        target={keyTarget}
        intensity={2.4}
        color="#ffe2b0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[cam.target[0] + 6, cam.target[1] + 4, cam.target[2] - 9]} intensity={2.2} color={COLORS.cyan} />
      <Stars frame={frame} />
      <gridHelper args={[700, 350, "#1a6c8a", "#0f3156"]} position={[0, -1.6, -100]} material-transparent material-opacity={0.35} />
      <Glow position={[-60, 30, -260]} scale={160} color="#1b3f8a" opacity={0.35} />
      <Glow position={[70, 20, -220]} scale={120} color={COLORS.gold} opacity={0.08} />
      <DataPath frame={frame} progress={progress} />
      {STATION_POS.map((p, i) => {
        const near = Math.abs(cam.stationFloat - i) < 1.7 || overview > 0;
        if (!near) return null;
        const S = STATIONS[i];
        const sc = tl.scenes[i];
        const active = overview > 0 ? overview : Math.max(0, 1 - Math.abs(cam.stationFloat - i) * 1.5);
        const t = frame - sc.start;
        return (
          <group key={i} position={p}>
            {i > 0 ? <Platform t={frame} active={active} /> : null}
            {i > 0 ? <Beacon active={active} t={frame} /> : null}
            <S t={t} dur={sc.dur} active={active} />
          </group>
        );
      })}
    </ThreeCanvas>
  );
};
