import * as THREE from "three";
const S = Array.from({ length: 11 }, (_, i) => [i === 0 ? 0 : 4.4 * Math.sin(i * 1.3), 0, -i * 18]);
const cam = new THREE.PerspectiveCamera(46, 1080 / 1920, 0.1, 900);
const C = [];
for (const [h, z] of [[40, 60], [50, 70], [60, 80], [45, 90], [70, 60], [36, 50]])
  for (const ty of [-10, -20, -30]) C.push([0, h, z, 0, ty, -95]);
for (const [x, h, z, tx, ty, tz] of C) {
  cam.position.set(x, h, z);
  cam.lookAt(tx, ty, tz);
  cam.updateMatrixWorld();
  const ps = S.slice(1).map((p) => {
    const v = new THREE.Vector3(...p).project(cam);
    return [Math.round(((v.x + 1) / 2) * 1080), Math.round(((1 - v.y) / 2) * 1920)];
  });
  const d1 = cam.position.distanceTo(new THREE.Vector3(...S[1]));
  const d10 = cam.position.distanceTo(new THREE.Vector3(...S[10]));
  console.log([x, h, z, tx, ty, tz].join(","), "d1", d1.toFixed(0), "d10", d10.toFixed(0), JSON.stringify(ps));
}
