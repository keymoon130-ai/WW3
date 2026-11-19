/* ---------------- main battle tank ---------------- */
function makeTankMesh(col, apc = false, o = {}) {
  if (apc) return makeAPCMesh(col, o);
  const ally = col === 0x4f5539 || o.style === 'ally';
  const M = vmats(col);
  const root = new THREE.Group(), hull = new THREE.Group(), det = new THREE.Group(); root.add(hull); root.add(det);
  const wheels = [];
  // hull body (sloped glacis, sloped rear)
  mk(hull, vg('tankhull', () => sideExtrude([[-3.45, 0.62], [-2.5, 1.48], [3.15, 1.55], [3.45, 1.12], [3.3, 0.58], [-3.0, 0.42]], 2.25)), M.m);
  mk(hull, VB(3.36, 0.07, 6.8), M.m, 0, 1.2, 0);
  mk(hull, VB(2.25, 0.06, 1.5), M.m3, 0, 1.56, 2.2);
  for (let i = 0; i < 9; i++) mk(hull, VB(1.9, 0.05, 0.06), M.dk, 0, 1.6, 1.55 + i * 0.15);
  // side skirts
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) mk(hull, VB(0.07, 0.58, 1.08), i < 2 && !ally ? M.m3 : M.m2, s * 1.68, 0.9, -2.75 + i * 1.1, 0, 0, s * 0.05);
    // tracks: top/bottom runs + wraps
    mk(hull, VB(0.64, 0.09, 6.0), M.rub, s * 1.34, 0.08, 0); mk(hull, VB(0.64, 0.08, 6.2), M.rub, s * 1.34, 0.92, 0);
    mk(hull, VC(0.42, 0.42, 0.64, 14), M.rub, s * 1.34, 0.5, -3.05, 0, 0, Math.PI / 2); mk(hull, VC(0.42, 0.42, 0.64, 14), M.rub, s * 1.34, 0.5, 3.05, 0, 0, Math.PI / 2);
    for (let i = 0; i < 24; i++) mk(hull, VB(0.66, 0.05, 0.08), M.dk, s * 1.34, 0.03, -2.9 + i * 0.25);
    for (const z of [-3.05, 3.05]) mk(hull, VC(0.34, 0.34, 0.66, 10), M.steel, s * 1.34, 0.5, z, 0, 0, Math.PI / 2);
    for (let i = 0; i < 3; i++) mk(hull, VC(0.1, 0.1, 0.3, 8), M.steel, s * 1.34, 0.86, -1.6 + i * 1.6, 0, 0, Math.PI / 2);
    for (let i = 0; i < 7; i++) { const z = -2.45 + i * 0.82; mk(hull, VC(0.36, 0.36, 0.3, 16), M.rub, s * 1.34, 0.42, z, 0, 0, Math.PI / 2); mk(hull, VC(0.24, 0.24, 0.32, 12), M.m2, s * 1.34, 0.42, z, 0, 0, Math.PI / 2); mk(hull, VC(0.08, 0.08, 0.36, 8), M.steel, s * 1.34, 0.42, z, 0, 0, Math.PI / 2); }
  }
  // front: headlights, tow hooks, dozer-style plate or spare links
  for (const s of [-1, 1]) { mk(det, VB(0.22, 0.14, 0.12), M.lamp, s * 0.95, 1.3, -2.92, -0.8); mk(det, VB(0.12, 0.2, 0.18), M.steel, s * 0.7, 0.6, -3.45); }
  if (ally) { for (let i = 0; i < 4; i++) mk(det, VB(0.5, 0.06, 0.22), M.dk, -0.7 + i * 0.47, 1.12, -2.85, -0.8); }
  else { mk(det, VC(0.16, 0.16, 2.2, 8), mat('log', { color: 0x4a3a28 }), 0, 1.62, 3.0, 0, 0, Math.PI / 2); for (const s of [-1, 1]) mk(det, VC(0.28, 0.28, 0.9, 12), M.m2, s * 0.6, 1.25, 3.45, Math.PI / 2); }
  // rear: exhaust, tool boxes
  for (const s of [-1, 1]) { mk(det, VB(0.9, 0.35, 0.5), M.m2, s * 1.2, 1.38, 2.85); mk(det, VB(0.5, 0.15, 0.08), M.dk, s * 0.5, 1.2, 3.42); }
  for (let i = 0; i < 3; i++) mk(det, VB(0.12, 0.12, 0.9), M.steel, 1.62, 1.32, -1.5 + i * 1.0);
  // turret
  const tur = new THREE.Group(); tur.position.set(0, 1.56, 0.3); root.add(tur); const tdet = new THREE.Group(); tur.add(tdet);
  if (!ally) {
    mk(tur, vg('tdome', () => { const g = new THREE.SphereGeometry(1, 22, 10, 0, TAU, 0, Math.PI / 2); g.scale(1.22, 0.66, 1.5); return g; }), M.m, 0, 0.04, 0);
    mk(tur, VC(1.28, 1.32, 0.16, 22), M.m2, 0, 0.04, 0);
    mk(tur, VB(1.4, 0.45, 0.7), M.m, 0, 0.3, 1.25);
    // reactive armour bricks on the front
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) mk(tdet, VB(0.42, 0.18, 0.3), M.m3, s * (0.5 + i * 0.28), 0.45 - i * 0.06, -1.05 + i * 0.25, -0.3, s * 0.5, 0);
    mk(tur, VC(0.3, 0.34, 0.22, 14), M.m2, 0.5, 0.72, 0.25); mk(tdet, VC(0.3, 0.3, 0.05, 14), M.m, 0.5, 0.86, 0.25);
    mk(tdet, VB(0.08, 0.08, 0.9), M.dk, 0.5, 0.95, -0.2); mk(tdet, VB(0.12, 0.14, 0.3), M.dk, 0.5, 0.9, 0.3);
    mk(tdet, VB(0.34, 0.3, 0.24), M.steel, -0.55, 0.72, -0.25); mk(tdet, VB(0.28, 0.24, 0.05), M.gl, -0.55, 0.72, -0.38);
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) mk(tdet, VC(0.05, 0.05, 0.28, 6), M.dk, s * (0.95 + i * 0.06), 0.42 + (i % 2) * 0.1, -0.55 + i * 0.07, -1.1, 0, s * 0.3);
    mk(tdet, VC(0.015, 0.015, 2.4, 4), M.dk, -0.7, 1.5, 1.1);
  } else {
    mk(tur, vg('tturA', () => topExtrude([[-0.62, -2.0], [0.62, -2.0], [1.25, -1.05], [1.25, 1.3], [-1.25, 1.3], [-1.25, -1.05]], 0.78)), M.m);
    mk(tur, VC(1.25, 1.3, 0.16, 22), M.m2, 0, 0.04, 0);
    // bustle basket rails
    for (const y of [0.3, 0.65]) { mk(tdet, VB(2.4, 0.05, 0.05), M.steel, 0, y, 2.15); for (const s of [-1, 1]) mk(tdet, VB(0.05, 0.05, 0.85), M.steel, s * 1.2, y, 1.75); }
    for (const s of [-1, 1]) mk(tdet, VB(0.05, 0.4, 0.05), M.steel, s * 1.2, 0.45, 2.15);
    mk(tdet, VB(1.6, 0.35, 0.5), mat('tarp', { color: 0x5e5a3e }), 0, 0.42, 1.8);
    // sights
    mk(tdet, VC(0.18, 0.2, 0.35, 10), M.m2, 0.55, 0.95, -0.4); mk(tdet, VB(0.32, 0.22, 0.22), M.steel, 0.55, 1.2, -0.4); mk(tdet, VB(0.26, 0.16, 0.04), M.gl, 0.55, 1.2, -0.52);
    mk(tdet, VB(0.36, 0.3, 0.4), M.m2, -0.7, 0.92, -1.2); mk(tdet, VB(0.28, 0.2, 0.04), M.gl, -0.7, 0.92, -1.42);
    // RWS MG
    mk(tdet, VB(0.32, 0.28, 0.4), M.m2, -0.45, 0.98, 0.35); mk(tdet, VC(0.03, 0.03, 0.9, 6), M.dk, -0.45, 1.02, -0.1, Math.PI / 2);
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) mk(tdet, VC(0.05, 0.05, 0.26, 6), M.dk, s * (1.15 - i * 0.07), 0.6 + (i % 2) * 0.1, -0.9 - i * 0.05, -1.1, 0, s * 0.3);
    mk(tdet, VC(0.015, 0.015, 2.2, 4), M.dk, -0.9, 1.6, 1.2);
    // hatches
    mk(tdet, VC(0.3, 0.3, 0.06, 14), M.m2, 0.55, 0.81, 0.3); mk(tdet, VC(0.26, 0.26, 0.06, 14), M.m2, -0.5, 0.81, -0.2);
  }
  // mantlet + gun
  mk(tur, VB(1.0, 0.56, 0.45), M.m2, 0, 0.38, ally ? -1.95 : -1.45);
  const bar = new THREE.Group(); bar.position.set(0, 0.4, -1.4); tur.add(bar);
  mk(bar, VC(0.1, 0.14, 4.9, 14), M.m, 0, 0, -2.45, Math.PI / 2);
  mk(bar, VC(0.17, 0.17, 0.75, 14), M.m2, 0, 0, -2.7, Math.PI / 2);
  for (const z of [-1.2, -3.8]) mk(bar, VC(0.135, 0.135, 0.12, 14), M.dk, 0, 0, z, Math.PI / 2);
  mk(bar, VC(0.13, 0.12, 0.2, 14), M.steel, 0, 0, -4.95, Math.PI / 2);
  const muzzle = new THREE.Object3D(); muzzle.position.z = -5.1; bar.add(muzzle);
  // command tank extras
  if (o.command) {
    for (let i = 0; i < 3; i++) mk(tur, VC(0.018, 0.025, 3.2, 4), M.dk, -0.7 + i * 0.55, 2.0, 1.1 + (i % 2) * 0.2);
    mk(tur, VB(0.6, 0.4, 0.6), M.m3, -0.5, 0.75, 0.9);
    const off = makeSoldierMesh('enemy2', { unarmed: true });
    off.root.position.set(0.5, -0.45, 0.25); off.root.rotation.y = 0;
    off.legL.visible = off.legR.visible = false;
    { const sf = new THREE.Mesh(VB(0.21, 0.2, 0.03), mat('shadowface', { color: 0x16161a, rough: 1 })); sf.position.set(0, 0.12, -0.1); off.head.add(sf); }
    const coat = new THREE.Mesh(VB(0.5, 0.5, 0.32), mat('greatcoat', { color: 0x3c3a34 })); coat.position.set(0, 0.3, 0); off.torso.add(coat);
    off.armR.rotation.x = -0.4; off.armL.rotation.x = 0.2;
    tur.add(off.root);
  }
  mergeLocal(hull); mergeLocal(det); mergeLocal(tur); mergeLocal(tdet); mergeLocal(bar);
  root.scale.setScalar(VSCALE);
  return { root, turret: tur, barrel: bar, muzzle, wheels, details: [det, tdet] };
}


/* ---------------- tracked IFV (BMP-style): low hull, sharp ribbed nose, small turret with 30 mm + ATGM ---------------- */
function makeBMPMesh(col) {
  const M = vmats(col);
  const root = new THREE.Group(), hull = new THREE.Group(), det = new THREE.Group(); root.add(hull); root.add(det);
  mk(hull, vg('bmphull', () => sideExtrude([[-3.35, 0.55], [-2.2, 1.05], [-1.4, 1.42], [3.25, 1.48], [3.35, 0.6], [-3.0, 0.38]], 2.9)), M.m);
  mk(hull, VB(3.0, 0.06, 4.4), M.m, 0, 1.45, 0.9);
  for (let i = 0; i < 6; i++) mk(hull, VB(2.7, 0.05, 0.08), M.dk, 0, 1.0 - i * 0.09 + 0.25, -2.0 - i * 0.18, -0.6); // ribbed trim vane
  for (const s of [-1, 1]) {
    mk(hull, VB(0.55, 0.08, 6.1), M.rub, s * 1.25, 0.07, 0); mk(hull, VB(0.55, 0.07, 5.9), M.rub, s * 1.25, 0.84, 0);
    mk(hull, VC(0.36, 0.36, 0.55, 12), M.rub, s * 1.25, 0.46, -3.0, 0, 0, Math.PI / 2); mk(hull, VC(0.36, 0.36, 0.55, 12), M.rub, s * 1.25, 0.46, 3.0, 0, 0, Math.PI / 2);
    for (let i = 0; i < 6; i++) { const z = -2.3 + i * 0.92; mk(hull, VC(0.34, 0.34, 0.26, 14), M.rub, s * 1.25, 0.38, z, 0, 0, Math.PI / 2); mk(hull, VC(0.2, 0.2, 0.28, 10), M.m2, s * 1.25, 0.38, z, 0, 0, Math.PI / 2); }
    for (let i = 0; i < 22; i++) mk(hull, VB(0.57, 0.04, 0.07), M.dk, s * 1.25, 0.02, -2.75 + i * 0.26);
    mk(hull, VB(0.08, 0.32, 6.0), M.m2, s * 1.5, 0.98, 0.1, 0, 0, s * 0.18); // side skirt
    for (let i = 0; i < 3; i++) mk(det, VB(0.05, 0.16, 0.16), M.gl, s * 1.46, 1.2, 0.4 + i * 0.85); // firing ports
  }
  // rear doors with fuel-tank bulges, roof hatches
  for (const s of [-1, 1]) { mk(det, VB(0.9, 0.85, 0.22), M.m2, s * 0.6, 0.95, 3.38); mk(det, VB(0.6, 0.06, 0.3), M.dk, s * 0.6, 1.0, 3.5); }
  for (let i = 0; i < 4; i++) mk(det, VB(0.7, 0.05, 0.8), M.m3, i % 2 ? 0.6 : -0.6, 1.5, 1.2 + Math.floor(i / 2) * 1.0);
  for (const s of [-1, 1]) { mk(det, VB(0.2, 0.12, 0.1), M.lamp, s * 1.0, 1.22, -2.55, -0.6); mk(det, VB(0.18, 0.12, 0.3), M.steel, s * 0.9, 0.55, -3.3); }
  mk(det, VB(0.3, 0.2, 0.2), M.gl, -0.8, 1.42, -1.5); mk(det, VC(0.2, 0.2, 0.12, 10), M.m2, -0.8, 1.52, -1.2);
  // turret
  const tur = new THREE.Group(); tur.position.set(0, 1.48, -0.3); root.add(tur); const tdet = new THREE.Group(); tur.add(tdet);
  mk(tur, vg('bmptur', () => { const g = new THREE.CylinderGeometry(0.78, 1.0, 0.55, 18); return g; }), M.m, 0, 0.27, 0);
  mk(tur, VC(1.02, 1.05, 0.1, 18), M.m2, 0, 0.02, 0);
  mk(tdet, VB(0.5, 0.35, 0.35), M.m2, 0.45, 0.65, 0.25); mk(tdet, VB(0.3, 0.2, 0.05), M.gl, 0.45, 0.65, 0.06);
  mk(tdet, VC(0.25, 0.25, 0.06, 12), M.m2, -0.35, 0.57, 0.3);
  // ATGM launcher on the roof
  mk(tdet, VB(0.22, 0.2, 1.3), M.m3, -0.15, 0.82, 0.0); mk(tdet, VC(0.08, 0.08, 1.35, 8), M.dk, -0.15, 0.82, 0.0, Math.PI / 2);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) mk(tdet, VC(0.045, 0.045, 0.24, 6), M.dk, s * (0.75 + i * 0.05), 0.42 + (i % 2) * 0.08, -0.45 + i * 0.08, -1.1, 0, s * 0.3);
  mk(tdet, VC(0.012, 0.012, 1.8, 4), M.dk, 0.6, 1.4, 0.6);
  mk(tur, VB(0.55, 0.38, 0.4), M.m2, 0, 0.32, -0.85);
  const bar = new THREE.Group(); bar.position.set(0, 0.36, -0.95); tur.add(bar);
  mk(bar, VC(0.05, 0.06, 2.7, 10), M.dk, 0, 0, -1.35, Math.PI / 2); mk(bar, VC(0.09, 0.09, 0.5, 10), M.m2, 0, 0, -0.3, Math.PI / 2); mk(bar, VC(0.07, 0.07, 0.16, 10), M.steel, 0, 0, -2.6, Math.PI / 2);
  mk(bar, VC(0.025, 0.025, 0.6, 6), M.dk, 0.16, 0.05, -0.5, Math.PI / 2); // coax
  const muzzle = new THREE.Object3D(); muzzle.position.z = -2.75; bar.add(muzzle);
  mergeLocal(hull); mergeLocal(det); mergeLocal(tur); mergeLocal(tdet); mergeLocal(bar);
  root.scale.setScalar(VSCALE);
  return { root, turret: tur, barrel: bar, muzzle, wheels: [], details: [det, tdet] };
}


/* ---------------- K21 (Korean IFV): wedge nose, slab-sided hull, 40 mm turret with ATGM pods, rear ramp lowered ---------------- */
function makeK21Mesh(col = 0x56603f) {
  const M = vmats(col);
  const camoDk = mat('k21dk', { color: 0x2e3324, rough: 0.85 }), camoBr = mat('k21br', { color: 0x6a5a3c, rough: 0.85 });
  const root = new THREE.Group(), hull = new THREE.Group(), det = new THREE.Group(); root.add(hull); root.add(det);
  // hull: long flat deck, steep wedge glacis, vertical sides with a slight outward chine
  mk(hull, vg('k21hull', () => sideExtrude([[-3.5, 0.5], [-3.0, 1.28], [-1.9, 1.62], [3.2, 1.66], [3.35, 0.62], [-3.1, 0.4]], 3.0)), M.m);
  mk(hull, VB(3.1, 0.06, 4.9), M.m, 0, 1.66, 0.65);
  for (const s of [-1, 1]) { mk(hull, VB(0.1, 0.5, 6.2), M.m2, s * 1.56, 1.05, 0.15); mk(hull, VB(0.06, 0.06, 6.0), M.dk, s * 1.6, 1.32, 0.15); }
  // camo patches (three-tone, like ROK vehicles)
  for (const [x, y, z, w, d, m] of [[0.6, 1.69, -0.8, 1.2, 1.4, camoDk], [-0.8, 1.69, 1.6, 1.0, 1.8, camoBr], [0.4, 1.69, 2.6, 1.1, 0.9, camoDk]]) mk(hull, VB(w, 0.02, d), m, x, y, z);
  for (const s of [-1, 1]) for (const [y, z, h, d, m] of [[1.1, -1.6, 0.4, 1.4, camoDk], [0.95, 0.8, 0.35, 1.6, camoBr], [1.15, 2.4, 0.3, 1.2, camoDk]]) mk(hull, VB(0.02, h, d), m, s * 1.62, y, z);
  // tracks: 6 road wheels, return rollers, sprocket front
  for (const s of [-1, 1]) {
    mk(hull, VB(0.55, 0.08, 6.4), M.rub, s * 1.3, 0.07, 0.1); mk(hull, VB(0.55, 0.07, 6.1), M.rub, s * 1.3, 0.86, 0.1);
    mk(hull, VC(0.38, 0.38, 0.55, 14), M.rub, s * 1.3, 0.47, -3.1, 0, 0, Math.PI / 2); mk(hull, VC(0.34, 0.34, 0.55, 14), M.rub, s * 1.3, 0.45, 3.2, 0, 0, Math.PI / 2);
    for (let i = 0; i < 6; i++) { const z = -2.4 + i * 0.98; mk(hull, VC(0.36, 0.36, 0.28, 16), M.rub, s * 1.3, 0.38, z, 0, 0, Math.PI / 2); mk(hull, VC(0.22, 0.22, 0.3, 12), M.m2, s * 1.3, 0.38, z, 0, 0, Math.PI / 2); }
    for (let i = 0; i < 3; i++) mk(hull, VC(0.09, 0.09, 0.3, 8), M.steel, s * 1.3, 0.83, -1.6 + i * 1.6, 0, 0, Math.PI / 2);
    for (let i = 0; i < 24; i++) mk(hull, VB(0.57, 0.04, 0.07), M.dk, s * 1.3, 0.02, -2.9 + i * 0.26);
    // side marking: white hull number + small flag
    mk(det, VB(0.02, 0.22, 0.9), mat('k21num', { color: 0xdedcd2 }), s * 1.63, 1.2, -2.3);
  }
  // front: driver hatch, headlight clusters, tow eyes, trim vane
  mk(det, VB(0.6, 0.08, 0.6), M.m2, 0.85, 1.67, -1.9); mk(det, VB(0.3, 0.12, 0.08), M.gl, 0.85, 1.6, -2.15);
  for (const s of [-1, 1]) { mk(det, VB(0.3, 0.16, 0.12), M.lamp, s * 1.15, 1.25, -3.05, -0.9); mk(det, VB(0.16, 0.2, 0.2), M.steel, s * 0.8, 0.55, -3.45); }
  mk(det, VB(2.6, 0.08, 0.5), M.m2, 0, 1.0, -3.25, -1.0);
  // rear: lowered ramp with a weapons crate visible inside
  const ramp = new THREE.Group(); ramp.position.set(0, 0.45, 3.35); det.add(ramp);
  mk(ramp, VB(1.7, 0.1, 1.5), M.m2, 0, 0, 0.75); mk(ramp, VB(1.7, 0.03, 1.4), M.dk, 0, 0.06, 0.75);
  ramp.rotation.x = 0.55;
  mk(det, VB(1.6, 1.0, 0.1), M.dk, 0, 1.0, 3.0); // dark interior back wall seen through the opening
  mk(det, VB(0.9, 0.35, 0.45), mat('k21crate', { color: 0x4a5236, rough: 0.8 }), 0.25, 0.75, 2.75); mk(det, VB(0.12, 0.12, 1.1), mat('k21tube', { color: 0x3e4430 }), -0.45, 0.8, 2.6);
  for (const s of [-1, 1]) { mk(det, VB(0.55, 1.05, 0.12), M.m, s * 1.2, 1.08, 3.3); mk(det, VB(0.18, 0.1, 0.06), M.lamp, s * 1.2, 1.4, 3.37); }
  // turret: low angular box, 40 mm gun, ATGM pod on the left, smoke dischargers
  const tur = new THREE.Group(); tur.position.set(0, 1.66, -0.2); root.add(tur); const tdet = new THREE.Group(); tur.add(tdet);
  mk(tur, vg('k21tur', () => topExtrude([[-0.55, -1.25], [0.55, -1.25], [1.05, -0.6], [1.05, 0.95], [-1.05, 0.95], [-1.05, -0.6]], 0.62)), M.m);
  mk(tur, VC(1.0, 1.05, 0.1, 20), M.m2, 0, 0.03, 0);
  mk(tdet, VB(0.5, 0.32, 0.55), M.m2, 0.55, 0.8, 0.1); mk(tdet, VB(0.32, 0.18, 0.04), M.gl, 0.55, 0.8, -0.18);
  mk(tdet, VC(0.26, 0.26, 0.06, 12), M.m2, -0.4, 0.66, 0.4);
  mk(tdet, VB(0.42, 0.46, 1.25), M.m3, -1.3, 0.52, -0.15); for (const y of [0.4, 0.64]) mk(tdet, VC(0.1, 0.1, 0.06, 10), M.dk, -1.3, y, -0.8, Math.PI / 2);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) mk(tdet, VC(0.045, 0.045, 0.24, 6), M.dk, s * (0.98 - i * 0.06), 0.45 + (i % 2) * 0.09, -0.75 - i * 0.07, -1.1, 0, s * 0.3);
  mk(tdet, VC(0.012, 0.012, 1.9, 4), M.dk, 0.75, 1.5, 0.75);
  mk(tur, VB(0.55, 0.42, 0.45), M.m2, 0, 0.32, -1.35);
  const bar = new THREE.Group(); bar.position.set(0, 0.34, -1.45); tur.add(bar);
  mk(bar, VC(0.075, 0.085, 2.3, 12), M.dk, 0, 0, -1.15, Math.PI / 2); mk(bar, VC(0.11, 0.11, 0.55, 12), M.m2, 0, 0, -0.3, Math.PI / 2); mk(bar, VC(0.1, 0.09, 0.28, 12), M.steel, 0, 0, -2.3, Math.PI / 2);
  const muzzle = new THREE.Object3D(); muzzle.position.z = -2.45; bar.add(muzzle);
  mergeLocal(hull); mergeLocal(det); mergeLocal(tur); mergeLocal(tdet); mergeLocal(bar);
  root.scale.setScalar(VSCALE);
  return { root, turret: tur, barrel: bar, muzzle, wheels: [], details: [det, tdet] };
}

/* ---------------- K808 백호 (8x8 wheeled APC): long boxy hull, sloped nose, four big wheels a side, RCWS with K6 on the roof ---------------- */
function makeK808Mesh(col = 0x56603f, real = false) {
  const M = vmats(col);
  const camoDk = mat('k21dk', { color: 0x2e3324, rough: 0.85 }), camoBr = mat('k21br', { color: 0x6a5a3c, rough: 0.85 }), tire = mat('k808tire', { color: 0x1a1a1a, rough: 1 });
  const root = new THREE.Group(), hull = new THREE.Group(), det = new THREE.Group(); root.add(hull); root.add(det);
  // hull: long sloped glacis to a flat roof, slab sides, a short upright tail
  mk(hull, vg('k808hull', () => sideExtrude([[-3.6, 1.15], [-1.7, 1.98], [3.42, 1.98], [3.5, 0.7], [3.15, 0.5], [-2.7, 0.5], [-3.45, 0.68]], 2.7)), M.m);
  for (const s of [-1, 1]) { mk(hull, VB(0.14, 0.62, 5.05), M.m, s * 1.38, 1.66, 0.9, 0, 0, -s * 0.12); mk(hull, VB(0.06, 0.06, 6.0), M.dk, s * 1.43, 1.3, 0.2); }
  mk(hull, VB(2.5, 0.06, 5.0), M.m2, 0, 1.99, 0.9);
  // camo: three-tone patches on roof and flanks
  for (const [x, y, z, w, d, m] of [[0.5, 2.03, -0.9, 1.2, 1.5, camoDk], [-0.7, 2.03, 1.7, 1.0, 1.6, camoBr], [0.3, 2.03, 2.9, 1.1, 0.8, camoDk], [0, 1.57, -2.7, 1.6, 0.9, camoBr]]) mk(hull, VB(w, 0.02, d), m, x, y, z, z < -2 ? -0.41 : 0);
  for (const s of [-1, 1]) for (const [y, z, h, d, m] of [[1.6, -1.8, 0.4, 1.5, camoDk], [1.45, 0.6, 0.45, 1.7, camoBr], [1.6, 2.5, 0.35, 1.3, camoDk]]) mk(hull, VB(0.02, h, d), m, s * 1.47, y, z, 0, 0, -s * 0.12);
  // wheel arches + the hull number
  for (const s of [-1, 1]) {
    for (const z of [-2.35, -1.1, 1.25, 2.5]) mk(hull, VB(0.5, 0.3, 1.3), M.dk, s * 1.18, 1.0, z);
    mk(det, VB(0.02, 0.24, 0.95), mat('k21num', { color: 0xdedcd2 }), s * 1.46, 1.55, -1.7, 0, 0, -s * 0.12);
  }
  // nose: trim vane, driver's periscopes, headlights, tow hooks; tail: water jets and the rear door
  mk(det, VB(2.3, 0.07, 0.8), M.m2, 0, 1.36, -3.15, -0.41);
  for (let i = 0; i < 3; i++) mk(det, VB(0.16, 0.08, 0.06), M.gl, -0.75 + i * 0.2, 1.62, -2.6 + i * 0.03, -0.5);
  mk(det, VB(0.65, 0.08, 0.65), M.m2, -0.7, 1.67, -2.2, 0.48);
  for (const s of [-1, 1]) { mk(det, VB(0.32, 0.16, 0.12), M.lamp, s * 1.0, 1.08, -3.45, -0.7); mk(det, VB(0.16, 0.18, 0.2), M.steel, s * 0.7, 0.62, -3.5); mk(det, VC(0.16, 0.16, 0.3, 12), M.dk, s * 0.75, 0.75, 3.52, Math.PI / 2); }
  mk(det, VB(1.3, 1.2, 0.06), M.m2, 0.15, 1.25, 3.48); mk(det, VB(0.3, 0.1, 0.06), M.steel, 0.55, 1.25, 3.52); for (const s of [-1, 1]) mk(det, VB(0.18, 0.1, 0.06), M.lamp, s * 1.1, 1.7, 3.5);
  // roof: hatches, stowage, antennas, smoke dischargers
  mk(det, VB(0.85, 0.1, 0.85), M.m2, -0.55, 2.04, 1.0); mk(det, VC(0.42, 0.42, 0.1, 16), M.m2, 0.55, 2.04, 1.0); mk(det, VB(0.85, 0.08, 0.7), M.m2, 0, 2.04, 2.4);
  mk(det, VB(0.9, 0.32, 0.5), mat('k21crate', { color: 0x4a5236, rough: 0.8 }), -0.7, 2.18, 3.0); mk(det, VB(0.5, 0.25, 1.2), camoBr, 0.85, 2.15, 2.75);
  for (const s of [-1, 1]) mk(det, VC(0.013, 0.013, 1.3, 4), M.dk, s * 1.05, 2.65, 3.1);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) mk(det, VC(0.045, 0.045, 0.24, 6), M.dk, s * (1.15 - i * 0.07), 2.12, -1.55 + i * 0.1, -1.0, 0, s * 0.35);
  // wheels: separate groups so they can roll
  const wheels = [];
  for (const s of [-1, 1]) for (const z of [-2.35, -1.1, 1.25, 2.5]) {
    const w = new THREE.Group(); w.position.set(s * 1.2, 0.52, z); w.userData.r = 0.52 * VSCALE; root.add(w);
    mk(w, VC(0.52, 0.52, 0.42, 18), tire, 0, 0, 0, 0, 0, Math.PI / 2); mk(w, VC(0.3, 0.3, 0.44, 12), M.m2, 0, 0, 0, 0, 0, Math.PI / 2);
    for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; mk(w, VB(0.46, 0.08, 0.1), tire, 0, Math.cos(a) * 0.5, Math.sin(a) * 0.5, a); }
    mk(w, VC(0.08, 0.08, 0.46, 8), M.steel, 0, 0, 0, 0, 0, Math.PI / 2); wheels.push(w);
  }
  // RCWS: low pedestal, armoured box with sensor head, K6 on a cradle
  const tur = new THREE.Group(); tur.position.set(0.1, 1.99, -0.45); root.add(tur); const tdet = new THREE.Group(); tur.add(tdet);
  mk(tur, VC(0.45, 0.5, 0.18, 16), M.m2, 0, 0.09, 0); mk(tur, VB(0.62, 0.42, 0.75), M.m, 0, 0.38, 0.05);
  mk(tdet, VB(0.32, 0.3, 0.3), M.m3, 0.42, 0.52, -0.1); mk(tdet, VB(0.22, 0.16, 0.03), M.gl, 0.42, 0.55, -0.26);
  for (let i = 0; i < 4; i++) mk(tdet, VC(0.04, 0.04, 0.2, 6), M.dk, -0.38, 0.32 + i * 0.07, 0.2, -1.2);
  mk(tdet, VB(0.36, 0.3, 0.3), M.m2, -0.06, 0.36, 0.5);
  const bar = new THREE.Group(); bar.position.set(-0.02, 0.5, -0.32); tur.add(bar);
  mk(bar, VB(0.18, 0.2, 0.9), M.dk, 0, 0, -0.1); mk(bar, VC(0.04, 0.045, 1.35, 10), M.dk, 0, 0.02, -1.15, Math.PI / 2); mk(bar, VC(0.06, 0.06, 0.18, 10), M.steel, 0, 0.02, -1.8, Math.PI / 2);
  mk(bar, VB(0.14, 0.18, 0.3), mat('k21crate', { color: 0x4a5236, rough: 0.8 }), 0.18, -0.05, 0.05);
  const muzzle = new THREE.Object3D(); muzzle.position.z = -1.92; bar.add(muzzle);
  mergeLocal(hull); mergeLocal(det); mergeLocal(tur); mergeLocal(tdet); mergeLocal(bar);
  root.scale.setScalar(real ? 1.04 : VSCALE); if (real) for (const w of wheels) w.userData.r = 0.52 * 1.04;
  return { root, turret: tur, barrel: bar, muzzle, wheels, details: [det, tdet] };
}

/* ---------------- K2 흑표, built in real metres (hull 7.5 m, 3.6 m wide, 2.4 m to the turret roof, L55 gun): wedge turret, six road wheels a side, three-tone camo ---------------- */
function makeK2Mesh() {
  const M = vmats(0x4b5530), BR = mat('k2br', { color: 0x6b5a3a, rough: 0.8, metal: 0.15 }), BK = mat('k2bk', { color: 0x262822, rough: 0.85, metal: 0.1 });
  const root = new THREE.Group(), hull = new THREE.Group(), det = new THREE.Group(); root.add(hull); root.add(det);
  // hull: long low body, sloped glacis, upper deck at 1.62 m
  mk(hull, vg('k2hull', () => sideExtrude([[-3.75, 0.86], [-3.1, 1.5], [-2.3, 1.62], [3.55, 1.62], [3.75, 1.35], [3.7, 0.7], [3.3, 0.5], [-3.3, 0.5]], 2.3, 0.05)), M.m);
  mk(hull, VB(3.5, 0.08, 6.9), M.m, 0, 1.2, -0.05); // sponsons over the tracks
  mk(hull, VB(2.2, 0.06, 1.7), M.m2, 0, 1.64, 2.55); for (let i = 0; i < 10; i++) mk(hull, VB(2.0, 0.04, 0.05), BK, 0, 1.68, 1.8 + i * 0.16); // engine deck grilles
  mk(hull, VB(0.62, 0.08, 0.5), M.m2, 0, 1.62, -2.55, -0.22); mk(hull, VB(0.5, 0.06, 0.12), M.gl, 0, 1.6, -2.82, -0.5); // driver's hatch and periscope
  // camo on the hull
  for (const [x, z, w, d, m] of [[0.9, -1.6, 1.4, 1.6, BR], [-0.7, 0.4, 1.6, 1.5, BK], [0.6, 2.2, 1.2, 1.2, BR]]) mk(hull, VB(w, 0.015, d), m, x, 1.63, z);
  const wheels = [];
  for (const s of [-1, 1]) {
    // side skirts: armoured front panels, plain rear, rubber flaps
    for (let i = 0; i < 7; i++) { const z = -3.3 + i * 0.98; mk(hull, VB(0.08, 0.62, 0.96), i < 3 ? M.m : M.m2, s * 1.76, 1.06, z, 0, 0, s * 0.03); mk(hull, VB(0.06, 0.14, 0.96), M.rub, s * 1.77, 0.68, z); }
    for (const [z, w, m] of [[-2.2, 1.6, BR], [0.9, 1.4, BK], [2.6, 0.9, BR]]) mk(hull, VB(0.02, 0.5, w), m, s * 1.81, 1.08, z);
    // running gear: 6 road wheels, drive sprocket at the rear, idler at the front, return rollers, track runs
    for (let i = 0; i < 6; i++) { const w = wheelPivot(hull, s * 1.28, 0.38, -2.55 + i * 0.99, 0.37, 0.6, M, true); wheels.push(w); }
    wheels.push(wheelPivot(hull, s * 1.28, 0.62, 3.25, 0.34, 0.6, M, false)); wheels.push(wheelPivot(hull, s * 1.28, 0.6, -3.35, 0.3, 0.6, M, false));
    mk(hull, VB(0.64, 0.08, 6.5), M.rub, s * 1.28, 0.04, -0.05); mk(hull, VB(0.64, 0.07, 6.4), M.rub, s * 1.28, 0.94, -0.05);
    for (const z of [-3.35, 3.25]) mk(hull, VC(0.4, 0.4, 0.64, 16), M.rub, s * 1.28, z > 0 ? 0.62 : 0.6, z, 0, 0, Math.PI / 2);
    for (let i = 0; i < 26; i++) mk(hull, VB(0.66, 0.04, 0.07), BK, s * 1.28, 0.0, -3.1 + i * 0.245);
  }
  // nose and tail details
  for (const s of [-1, 1]) { mk(det, VB(0.24, 0.12, 0.1), M.lamp, s * 1.2, 1.36, -3.42, -0.75); mk(det, VB(0.14, 0.2, 0.2), M.steel, s * 0.7, 0.62, -3.78); }
  for (let i = 0; i < 5; i++) mk(det, VB(0.36, 0.05, 0.16), BK, -0.9 + i * 0.45, 1.25, -3.3, -0.85);
  mk(det, VB(0.5, 0.3, 0.1), mat('k21num', { color: 0xdedcd2 }), 1.0, 1.2, 3.72);
  // turret: wedge front either side of the mantlet, flat roof, long bustle
  const tur = new THREE.Group(); tur.position.set(0, 1.62, -0.25); root.add(tur); const tdet = new THREE.Group(); tur.add(tdet);
  mk(tur, vg('k2tur', () => topExtrude([[-1.62, -0.6], [-1.2, -2.05], [-0.42, -2.25], [0.42, -2.25], [1.2, -2.05], [1.62, -0.6], [1.66, 1.7], [1.4, 2.95], [-1.4, 2.95], [-1.66, 1.7]], 0.8, 0.05)), M.m);
  mk(tur, VB(2.9, 0.06, 3.6), M.m2, 0, 0.82, 0.8);
  for (const [x, z, w, d, m] of [[-0.8, 0.2, 1.1, 1.4, BR], [0.7, 1.9, 1.2, 1.1, BK], [0.2, -1.4, 0.9, 0.8, BK]]) mk(tur, VB(w, 0.012, d), m, x, 0.86, z);
  for (const s of [-1, 1]) for (const [y, z, h, d, m] of [[0.42, -0.6, 0.5, 1.2, BR], [0.4, 1.6, 0.45, 1.3, BK]]) mk(tur, VB(0.012, h, d), m, s * 1.67, y, z);
  // sights: gunner's box front-left, commander's panoramic sight on a mast front-right, MMW radar plates, laser warners
  mk(tdet, VB(0.5, 0.38, 0.55), M.m2, -0.85, 1.0, -1.15); mk(tdet, VB(0.36, 0.22, 0.03), M.gl, -0.85, 1.02, -1.43);
  mk(tdet, VC(0.12, 0.14, 0.3, 10), M.m2, 0.95, 0.98, -0.75); mk(tdet, VB(0.4, 0.34, 0.38), M.m, 0.95, 1.3, -0.75); mk(tdet, VB(0.3, 0.18, 0.03), M.gl, 0.95, 1.32, -0.95);
  for (const s of [-1, 1]) mk(tdet, VB(0.32, 0.26, 0.06), M.m3, s * 0.5, 0.95, -1.65, -0.2);
  for (const [x, z] of [[-1.5, -0.6], [1.5, -0.6], [-1.4, 2.6], [1.4, 2.6]]) mk(tdet, VC(0.06, 0.08, 0.1, 8), BK, x, 0.88, z);
  // hatches, the commander's K6 on its ring, loader's hatch
  mk(tdet, VC(0.38, 0.38, 0.08, 16), M.m2, 0.6, 0.86, 0.35); mk(tdet, VC(0.34, 0.34, 0.08, 16), M.m2, -0.6, 0.86, 0.5);
  mk(tdet, VC(0.04, 0.04, 0.4, 6), M.dk, 0.6, 1.08, 0.0); mk(tdet, VB(0.12, 0.14, 0.5), M.dk, 0.6, 1.28, -0.05); mk(tdet, VC(0.025, 0.025, 1.1, 8), M.dk, 0.6, 1.3, -0.75, Math.PI / 2);
  // smoke grenade launchers either side, bustle stowage basket, antennas
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) mk(tdet, VC(0.055, 0.055, 0.28, 8), BK, s * (1.52 - i * 0.02), 0.62 + (i % 2) * 0.13, -1.0 + (i >> 1) * 0.14, -0.9, 0, s * 0.5);
  mk(tdet, VB(2.6, 0.04, 0.9), M.dk, 0, 0.4, 3.35); for (const s of [-1, 1]) mk(tdet, VB(0.04, 0.45, 0.9), M.dk, s * 1.3, 0.6, 3.35); mk(tdet, VB(2.6, 0.45, 0.04), M.dk, 0, 0.6, 3.8);
  mk(tdet, VB(1.1, 0.3, 0.6), mat('k21crate', { color: 0x4a5236, rough: 0.8 }), -0.6, 0.6, 3.35); mk(tdet, VB(0.9, 0.35, 0.65), BR, 0.6, 0.62, 3.3);
  for (const s of [-1, 1]) mk(tdet, VC(0.012, 0.012, 1.6, 4), M.dk, s * 1.2, 1.6, 2.4);
  // gun: mantlet, thermal-sleeved L55 (6.6 m from the trunnions), muzzle reference sensor
  const bar = new THREE.Group(); bar.position.set(0, 0.45, -2.05); tur.add(bar);
  mk(bar, VB(0.95, 0.62, 0.45), M.m, 0, 0, -0.1); mk(bar, VC(0.17, 0.2, 0.5, 14), M.m2, 0, 0, -0.5, Math.PI / 2);
  mk(bar, VC(0.13, 0.14, 2.6, 14), M.m, 0, 0, -1.95, Math.PI / 2); mk(bar, VC(0.115, 0.13, 2.4, 14), M.m, 0, 0, -4.4, Math.PI / 2);
  for (const z of [-1.3, -2.6, -3.5, -4.8]) mk(bar, VC(0.145, 0.145, 0.06, 14), M.dk, 0, 0, z, Math.PI / 2);
  mk(bar, VC(0.1, 0.1, 0.9, 14), M.m2, 0, 0, -6.05, Math.PI / 2); mk(bar, VB(0.08, 0.08, 0.18), M.steel, 0, 0.14, -6.3);
  const muzzle = new THREE.Object3D(); muzzle.position.z = -6.55; bar.add(muzzle);
  mergeLocal(hull); mergeLocal(det); mergeLocal(tur); mergeLocal(tdet); mergeLocal(bar);
  return { root, turret: tur, barrel: bar, muzzle, wheels, details: [det, tdet] };
}
