/* ---------------- ACV: 8-wheeled amphibious combat vehicle, rear ramp, remote turret; with a troop compartment you can sit in ---------------- */
function makeACV(col = 0x5b6150, num = '') {
  // Amphibious Combat Vehicle: a tall slab-sided 8x8 with a boat bow, four big tyres a side in two pairs,
  // a remote weapon station up front, troop hatches on the roof and a full-width ramp at the back
  const g = new THREE.Group(); const M = vmats(col); const body = new THREE.Group(); g.add(body);
  const B = (w, h, d, m, x, y, z, rx = 0, ry = 0, rz = 0) => mk(body, VB(w, h, d), m, x, y, z, rx, ry, rz);
  // upper hull: side walls, roof, sponson shelves over the wheels
  for (const s of [-1, 1]) { B(0.12, 1.17, 8.3, M.m, s * 1.49, 1.835, 0.15); B(0.5, 0.1, 8.5, M.m2, s * 1.33, 1.26, 0.1); }
  B(3.1, 0.1, 7.9, M.m, 0, 2.42, 0.35);
  // bow: sloped upper glacis, a short nose plate, the long lower boat bow under it
  B(3.1, 0.1, 1.05, M.m, 0, 2.2, -3.98, -0.5); B(3.0, 0.62, 0.1, M.m, 0, 1.68, -4.48, 0.18); B(2.6, 0.1, 1.9, M.m2, 0, 0.92, -4.0, 0.62);
  for (const s of [-1, 1]) B(0.12, 1.0, 0.95, M.m, s * 1.49, 1.85, -4.0, 0, 0, 0);
  // lower hull between the wheels, belly
  for (const s of [-1, 1]) B(0.1, 0.85, 7.7, M.m2, s * 1.1, 0.87, 0.2); B(2.3, 0.1, 7.6, M.m2, 0, 0.45, 0.3);
  // rear: posts either side of the ramp opening, sill under it, lights
  for (const s of [-1, 1]) { B(0.26, 1.85, 0.14, M.m, s * 1.37, 1.5, 4.32); mk(body, VB(0.12, 0.1, 0.04), basicMat('acvtail', 0xb02018), s * 1.37, 2.15, 4.4); }
  B(2.3, 0.2, 0.14, M.m2, 0, 0.52, 4.32);
  // appliqué armour panels with bolt rows, vision blocks, stowage
  for (const s of [-1, 1]) {
    for (const z of [-2.55, 0.05, 2.65]) { B(0.05, 0.86, 2.45, M.m3, s * 1.57, 1.86, z); for (let k = 0; k < 6; k++) { B(0.04, 0.05, 0.05, M.steel, s * 1.6, 2.24, z - 1.05 + k * 0.42); B(0.04, 0.05, 0.05, M.steel, s * 1.6, 1.47, z - 1.05 + k * 0.42); } }
    for (const z of [-1.2, 0.6, 2.2]) mk(body, VB(0.05, 0.16, 0.3), M.gl, s * 1.6, 2.28, z);
    B(0.3, 0.42, 1.3, M.m2, s * 1.62, 1.55, 3.55); // stowage box over the rear wheels
    B(0.55, 0.06, 2.9, M.dk, s * 1.5, 1.3, -2.4); B(0.55, 0.06, 2.9, M.dk, s * 1.5, 1.3, 2.3); // wheel-well liners
    B(0.48, 0.42, 0.04, M.rub, s * 1.45, 0.82, -0.6); B(0.48, 0.42, 0.04, M.rub, s * 1.45, 0.82, 3.85); // mud flaps
  }
  // headlights in guarded boxes at the front corners, tow eyes, a splash board across the bow
  for (const s of [-1, 1]) { B(0.42, 0.26, 0.2, M.m2, s * 1.22, 2.28, -4.42); mk(body, VB(0.3, 0.16, 0.04), basicMat('acvlight', 0xfff0c0), s * 1.22, 2.28, -4.53); for (const dx of [-0.2, 0.2]) B(0.03, 0.3, 0.03, M.steel, s * 1.22 + dx, 2.28, -4.58); B(0.2, 0.16, 0.12, M.steel, s * 0.85, 1.05, -4.85); }
  B(2.9, 0.06, 0.55, M.m2, 0, 1.98, -4.62, -1.0);
  // roof: driver's hatch and periscopes front left, exhaust grille front right, two troop hatches behind
  mk(body, vg('acvring', () => new THREE.TorusGeometry(0.42, 0.06, 6, 16)), M.dk, 0, 2.48, 1.0, Math.PI / 2);
  mk(body, vg('acvring2', () => new THREE.TorusGeometry(0.34, 0.05, 6, 14)), M.dk, -0.75, 2.48, -3.0, Math.PI / 2); B(0.62, 0.06, 0.62, M.m2, -0.75, 2.5, -3.0);
  for (let i = 0; i < 3; i++) mk(body, VB(0.16, 0.12, 0.1), M.gl, -1.05 + i * 0.3, 2.53, -3.45);
  B(0.95, 0.05, 1.05, M.dk, 0.85, 2.48, -2.75); for (let i = 0; i < 6; i++) B(0.95, 0.04, 0.05, M.steel, 0.85, 2.52, -3.2 + i * 0.18);
  B(0.95, 0.06, 0.95, M.m2, 0, 2.48, 2.65); for (const x of [-1.2, 1.2]) B(0.08, 0.08, 6.5, M.steel, x, 2.5, 0.8); // second troop hatch, grab rails
  // waterjets low at the back, antennas on the rear corners
  for (const s of [-1, 1]) { mk(body, VC(0.27, 0.32, 0.45, 12), M.dk, s * 0.82, 0.78, 4.42, Math.PI / 2); mk(body, VC(0.02, 0.02, 2.4, 4), M.dk, s * 1.32, 3.6, 3.95); B(0.14, 0.12, 0.14, M.dk, s * 1.32, 2.48, 3.95); }
  // wheels: four a side, in a front pair and a rear pair
  const wheels = [];
  for (const s of [-1, 1]) for (const z of [-3.05, -1.75, 1.65, 2.95]) { const w = new THREE.Group(); w.position.set(s * 1.43, 0.6, z); g.add(w); w.userData.r = 0.6;
    mk(w, vg('acvtyre2', () => new THREE.CylinderGeometry(0.6, 0.6, 0.5, 18)), M.rub, 0, 0, 0, 0, 0, Math.PI / 2);
    mk(w, vg('acvhub2', () => new THREE.CylinderGeometry(0.34, 0.34, 0.52, 10)), M.m2, 0, 0, 0, 0, 0, Math.PI / 2);
    mk(w, vg('acvnut', () => new THREE.CylinderGeometry(0.12, 0.12, 0.56, 6)), M.steel, 0, 0, 0, 0, 0, Math.PI / 2); mergeLocal(w); wheels.push(w); }
  // remote weapon station: base ring, cradle, .50 cal with flash hider, ammo can, sight head
  const tur = new THREE.Group(); tur.position.set(0.25, 2.47, -1.9); g.add(tur);
  mk(tur, VC(0.38, 0.42, 0.18, 14), M.m2, 0, 0.09, 0); mk(tur, VB(0.62, 0.42, 0.7), M.m, 0, 0.38, 0.05); mk(tur, VB(0.26, 0.3, 0.46), M.m2, -0.42, 0.42, 0.05);
  mk(tur, VB(0.3, 0.22, 0.26), M.dk, 0.24, 0.72, -0.12); mk(tur, VB(0.24, 0.14, 0.04), M.gl, 0.24, 0.72, -0.26);
  const barrel = new THREE.Group(); barrel.position.set(-0.08, 0.42, -0.2); tur.add(barrel);
  mk(barrel, VB(0.16, 0.16, 0.9), M.dk, 0, 0, -0.4); mk(barrel, VC(0.035, 0.035, 1.25, 8), M.steel, 0, 0, -1.35, Math.PI / 2); mk(barrel, VC(0.055, 0.055, 0.16, 8), M.dk, 0, 0, -2.0, Math.PI / 2); mergeLocal(barrel);
  const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0, -2.1); barrel.add(muzzle);
  mergeLocal(tur);
  // hull number
  if (num) { const t = canvasTex(256, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#d8d4c4'; c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(num, w / 2, h / 2 + 2); }); const pm = new THREE.MeshBasicMaterial({ map: t, transparent: true }); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.38), pm); p.position.set(s * 1.6, 2.1, -1.3); p.rotation.y = s * Math.PI / 2; g.add(p); } }
  // rear ramp, hinged at the bottom of the back face
  const ramp = new THREE.Group(); ramp.position.set(0, 0.62, 4.5); g.add(ramp);
  mk(ramp, VB(2.5, 1.75, 0.12), M.m, 0, 0.88, 0); for (let i = 0; i < 4; i++) mk(ramp, VB(2.3, 0.05, 0.06), M.m2, 0, 0.3 + i * 0.4, 0.07);
  mk(ramp, VB(0.5, 0.3, 0.04), M.gl, 0.6, 1.4, 0.07); mk(ramp, VB(0.5, 0.3, 0.04), M.gl, -0.6, 1.4, 0.07);
  mergeLocal(ramp); mergeLocal(body);
  return { root: g, wheels, ramp, turret: tur, barrel, muzzle };
}
/* the troop compartment, seen from inside: walls drawn from the inside, benches, dim red light, the squad sitting face to face */
function acvInterior(acv, squadN = 6) {
  const g = new THREE.Group(); acv.root.add(g);
  const wall = new THREE.MeshStandardMaterial({ color: 0x4a4e44, roughness: 0.9, side: THREE.DoubleSide }), floor = new THREE.MeshStandardMaterial({ color: 0x2a2a28, roughness: 1, side: THREE.DoubleSide }), seat = new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 0.9 }), metal = new THREE.MeshStandardMaterial({ color: 0x55575a, metalness: 0.5, roughness: 0.5 });
  const B = (w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = false; g.add(me); return me; };
  const FL = 0.78, CE = 2.32, Z0 = -1.6, Z1 = 4.35, X = 1.38;
  B(2 * X, 0.04, Z1 - Z0, floor, 0, FL, (Z0 + Z1) / 2);
  B(2 * X, 0.04, Z1 - Z0 - 1.0, wall, 0, CE, (Z0 + Z1) / 2 - 0.5); B(2 * X, 0.04, 0.4, wall, 0, CE, 4.15); B(0.85, 0.04, 0.9, wall, -0.95, CE, 1.0); B(0.85, 0.04, 0.9, wall, 0.95, CE, 1.0); // ceiling with the hatch hole at z 0.55..1.45
  for (const s of [-1, 1]) B(0.04, CE - FL + 0.1, Z1 - Z0 + 0.3, wall, s * X, (CE + FL) / 2, (Z0 + Z1) / 2 + 0.15);
  B(2 * X, CE - FL, 0.04, wall, 0, (CE + FL) / 2, Z0);
  // a frame round the ramp opening so nothing of the outside shows past the ramp edges; floor and ceiling run out to it
  for (const s of [-1, 1]) B(0.22, CE - FL + 0.2, 0.3, wall, s * (X - 0.08), (CE + FL) / 2, 4.47);
  B(2 * X, 0.2, 0.3, wall, 0, CE - 0.05, 4.47); B(2 * X, 0.12, 0.35, floor, 0, FL - 0.04, 4.45);
  for (const s of [-1, 1]) { B(0.42, 0.06, 4.6, seat, s * (X - 0.24), FL + 0.42, 1.6); B(0.06, 0.55, 4.6, seat, s * (X - 0.04), FL + 0.75, 1.6); for (let z = -0.4; z < 4; z += 0.9) B(0.04, 0.4, 0.04, metal, s * (X - 0.3), FL + 0.2, z); }
  for (let z = Z0 + 0.4; z < Z1; z += 0.6) B(2 * X - 0.1, 0.04, 0.05, metal, 0, CE - 0.04, z);
  for (const s of [-1, 1]) B(0.08, 0.08, 4.4, metal, s * 0.5, CE - 0.1, 1.6); // grab rails
  const red = new THREE.PointLight(0xff3a28, 1.4, 6, 2); red.position.set(0, CE - 0.2, 1.4); g.add(red);
  const glowM = new THREE.MeshBasicMaterial({ color: 0xff4030 }); B(0.25, 0.05, 0.12, glowM, 0, CE - 0.06, 2.6); B(0.25, 0.05, 0.12, glowM, 0, CE - 0.06, 0.2);
  const men = [];
  for (let i = 0; i < squadN; i++) { const s = i % 2 ? 1 : -1, z = 0.0 + (i >> 1) * 1.05; const m = makeSoldierMesh('rok'); m.root.position.set(s * (X - 0.3), FL + 0.02, z + 0.4); m.root.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; poseSoldier(m, { crouch: 1, aim: 0, moving: false }, 1); g.add(m.root); men.push(m); }
  acv.interior = g; acv.men = men; acv.redLight = red;
  return g;
}