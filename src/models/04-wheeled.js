/* ---------------- 8x8 APC ---------------- */
function makeAPCMesh(col, o = {}) {
  const M = vmats(col);
  const root = new THREE.Group(), hull = new THREE.Group(), det = new THREE.Group(); root.add(hull); root.add(det);
  const wheels = [];
  mk(hull, vg('apchull', () => sideExtrude([[-3.35, 0.75], [-2.55, 1.6], [-2.1, 1.92], [3.0, 1.95], [3.25, 1.75], [3.25, 0.62], [-2.9, 0.5]], 2.5)), M.m);
  for (const s of [-1, 1]) {
    mk(hull, VB(0.2, 0.42, 6.0), M.m, s * 1.2, 1.78, 0.25, 0, 0, s * 0.45);
    for (const z of [-2.15, -1.05, 0.95, 2.05]) { wheels.push(wheelPivot(hull, s * 1.33, 0.56, z, 0.56, 0.42, M)); mk(hull, VB(0.5, 0.08, 1.1), M.m2, s * 1.33, 1.18, z); }
    for (let i = 0; i < 3; i++) mk(det, VB(0.05, 0.14, 0.24), M.gl, s * 1.27, 1.65, -1 + i * 1.2);
    mk(det, VB(0.06, 0.06, 0.4), M.dk, s * 1.3, 1.5, -2.3); mk(det, VB(0.04, 0.22, 0.16), M.gl, s * 1.45, 1.55, -2.5);
  }
  mk(det, VB(2.1, 0.1, 0.5), M.m2, 0, 1.2, -3.2, -0.6);
  for (const s of [-1, 1]) mk(det, VB(0.25, 0.14, 0.1), M.lamp, s * 0.85, 1.42, -2.95, -0.9);
  mk(det, VB(1.2, 1.1, 0.08), M.m2, 0, 1.15, 3.28); mk(det, VB(0.08, 0.08, 0.3), M.steel, 0.4, 1.1, 3.38);
  mk(det, VB(1.6, 0.06, 0.9), M.m3, 0, 1.99, 1.4);
  const tur = new THREE.Group(); tur.position.set(0, 1.95, -0.4); root.add(tur); const tdet = new THREE.Group(); tur.add(tdet);
  mk(tur, VC(0.55, 0.6, 0.2, 16), M.m2, 0, 0.1, 0);
  mk(tur, VB(0.9, 0.48, 1.1), M.m, 0, 0.42, 0);
  mk(tdet, VB(0.36, 0.3, 0.3), M.steel, 0.3, 0.82, -0.2); mk(tdet, VB(0.3, 0.2, 0.04), M.gl, 0.3, 0.82, -0.36);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) mk(tdet, VC(0.05, 0.05, 0.24, 6), M.dk, s * 0.5, 0.5 + i * 0.1, 0.2, -1.1, 0, s * 0.4);
  const bar = new THREE.Group(); bar.position.set(0, 0.4, -0.55); tur.add(bar);
  mk(bar, VC(0.05, 0.06, 1.8, 8), M.dk, 0, 0, -0.9, Math.PI / 2); mk(bar, VB(0.2, 0.22, 0.5), M.m2, 0, 0, 0);
  const muzzle = new THREE.Object3D(); muzzle.position.z = -1.8; bar.add(muzzle);
  mergeLocal(hull); mergeLocal(det); mergeLocal(tur); mergeLocal(tdet); mergeLocal(bar);
  root.scale.setScalar(VSCALE);
  return { root, turret: tur, barrel: bar, muzzle, wheels, details: [det, tdet] };
}

/* ---------------- cargo truck ---------------- */
function makeTruckMesh(col = 0x4d5340) {
  const M = vmats(col);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const wheels = [];
  mk(body, VB(1.1, 0.25, 6.4), M.dk, 0, 0.78, -0.2);
  // cab + hood
  mk(body, VB(2.25, 1.35, 1.55), M.m, 0, 1.7, -2.15);
  mk(body, VB(2.0, 0.9, 1.25), M.m, 0, 1.25, -3.5);
  mk(body, VB(1.6, 0.6, 0.05), M.dk, 0, 1.25, -4.14);
  for (let i = 0; i < 6; i++) mk(body, VB(1.5, 0.04, 0.06), M.steel, 0, 1.0 + i * 0.1, -4.17);
  mk(body, VB(2.3, 0.22, 0.2), M.steel, 0, 0.82, -4.25);
  for (const s of [-1, 1]) { mk(body, VB(0.3, 0.16, 0.06), M.lamp, s * 0.82, 1.45, -4.15); mk(body, VB(0.62, 0.32, 1.5), M.m2, s * 0.95, 0.95, -3.4); }
  mk(body, VB(1.95, 0.72, 0.05), M.gl, 0, 2.02, -2.95, -0.18);
  for (const s of [-1, 1]) { mk(body, VB(0.05, 0.55, 0.85), M.gl, s * 1.13, 2.0, -2.1); mk(body, VB(0.04, 0.3, 0.18), M.gl, s * 1.38, 2.05, -2.85); mk(body, VB(0.3, 0.03, 0.03), M.steel, s * 1.25, 2.0, -2.85); }
  mk(body, VC(0.28, 0.28, 1.0, 12), M.steel, 1.15, 1.02, -1.05, Math.PI / 2);
  mk(body, VC(0.07, 0.07, 1.4, 8), M.dk, -1.0, 2.6, -1.45);
  // cargo bed with canvas
  mk(body, VB(2.45, 0.14, 3.9), M.m2, 0, 1.15, 0.95);
  for (const s of [-1, 1]) mk(body, VB(0.08, 0.6, 3.9), M.m, s * 1.2, 1.5, 0.95);
  mk(body, VB(2.45, 0.6, 0.08), M.m, 0, 1.5, 2.88);
  const cm = mat('canvas' + col, { color: new THREE.Color(col).offsetHSL(0, -0.05, 0.06).getHex(), side: THREE.DoubleSide, rough: 1 });
  mk(body, vg('canvasTop', () => { const g = new THREE.CylinderGeometry(1.2, 1.2, 3.9, 16, 1, true, -Math.PI / 2, Math.PI); g.rotateX(-Math.PI / 2); return g; }), cm, 0, 1.8, 0.95);
  for (const s of [-1, 1]) mk(body, VB(0.04, 0.6, 3.9), cm, s * 1.2, 1.5, 0.95);
  for (let i = 0; i < 4; i++) mk(body, vg('rib', () => new THREE.TorusGeometry(1.22, 0.03, 4, 14, Math.PI)), M.dk, 0, 1.8, -0.9 + i * 1.25);
  // wheels: front single, rear dual
  for (const s of [-1, 1]) {
    wheels.push(wheelPivot(body, s * 1.05, 0.52, -3.35, 0.52, 0.34, M));
    for (const z of [0.25, 1.65]) { wheels.push(wheelPivot(body, s * 1.0, 0.52, z, 0.52, 0.55, M)); }
    mk(body, VB(0.62, 0.06, 2.8), M.m2, s * 1.0, 1.1, 0.95);
  }
  mergeLocal(body);
  root.scale.setScalar(VSCALE);
  return { root, wheels, details: [] };
}
