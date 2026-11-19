/* ---------------- landing craft ---------------- */
function makeBoat() {
  const g = new THREE.Group(); const M = vmats(0x5a6150); const body = new THREE.Group(); g.add(body);
  mk(body, VB(3.8, 0.3, 11), M.m, 0, -0.2, 0);
  mk(body, vg('boatkeel', () => sideExtrude([[-5.5, -0.35], [5.3, -0.35], [5.0, -0.9], [-5.0, -0.9]], 3.6, 0)), M.m2);
  for (const s of [-1, 1]) {
    mk(body, VB(0.25, 1.9, 11), M.m, s * 1.95, 0.6, 0);
    mk(body, VB(0.4, 0.12, 11), M.m2, s * 1.95, 1.58, 0);
    for (let i = 0; i < 8; i++) mk(body, VB(0.1, 1.6, 0.12), M.m2, s * 2.12, 0.5, -4.6 + i * 1.3);
    mk(body, VB(0.12, 0.25, 9), M.rub, s * 2.12, 0.0, 0);
  }
  mk(body, VB(3.8, 1.9, 0.25), M.m, 0, 0.6, 5.5);
  mk(body, VB(1.7, 1.25, 1.5), M.m, 0, 1.9, 4.6); mk(body, VB(1.2, 0.45, 0.05), M.gl, 0, 2.25, 3.84);
  mk(body, VC(0.04, 0.04, 1.1, 6), M.dk, 1.2, 2.2, 4.0, Math.PI / 2); mk(body, VB(0.3, 0.3, 0.3), M.dk, 1.2, 2.15, 4.6);
  mk(body, VB(3.0, 0.5, 1.4), M.m2, 0, 0.2, 4.3);
  const ramp = new THREE.Group(); ramp.position.set(0, -0.35, -5.5); g.add(ramp);
  mk(ramp, VB(3.8, 2.2, 0.25), M.m, 0, 1.1, 0);
  for (let i = 0; i < 4; i++) mk(ramp, VB(0.12, 2.1, 0.14), M.m2, -1.5 + i, 1.1, -0.18);
  for (let i = 0; i < 3; i++) mk(ramp, VB(3.6, 0.1, 0.12), M.m2, 0, 0.4 + i * 0.7, -0.18);
  mergeLocal(body); mergeLocal(ramp);
  g.userData.ramp = ramp;
  return g;
}
function makeHover() {
  // LCAC-type air-cushion landing craft: wide open cargo deck between two side structures, bow ramp, twin ducted fans aft; two tanks abreast
  const g = new THREE.Group(); const M = vmats(0x6a6e66); const body = new THREE.Group(); g.add(body);
  const sk = mat('skirt', { color: 0x1a1a1a, rough: 0.95 }); const HW = 8, HL = 13;
  for (const s of [-1, 1]) { mk(body, VC(0.85, 0.85, HL * 2, 12), sk, s * HW, 0.8, 0, Math.PI / 2); mk(body, VC(0.85, 0.85, HW * 2, 12), sk, 0, 0.8, s * HL, 0, 0, Math.PI / 2); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mk(body, vg('skc2', () => new THREE.SphereGeometry(0.85, 12, 8)), sk, sx * HW, 0.8, sz * HL);
  for (let i = 0; i < 24; i++) for (const s of [-1, 1]) mk(body, VB(0.06, 1.4, 0.08), M.dk, s * (HW + 0.8), 0.7, -HL + 1 + i * 1.04);
  mk(body, VB(HW * 2, 0.7, HL * 2), M.m, 0, 1.55, 0);
  mk(body, VB(12.4, 0.08, HL * 2 - 3), M.m3, 0, 1.94, -0.5);
  for (const x of [-5.2, -1.8, 1.8, 5.2]) mk(body, VB(0.12, 0.03, HL * 2 - 4), M.dk, x, 1.99, -0.5); // tie-down rails
  for (const s of [-1, 1]) {
    mk(body, VB(1.6, 2.6, HL * 2 - 5), M.m, s * (HW - 1.1), 3.2, 0.5);
    for (let i = 0; i < 7; i++) mk(body, VB(0.04, 1.9, 0.12), M.m2, s * (HW - 0.28), 3.2, -9 + i * 3);
    mk(body, VB(1.3, 0.12, HL * 2 - 6), M.steel, s * (HW - 1.1), 4.56, 0.5);
  }
  // pilot house on the starboard side, navigation mast, horns
  mk(body, VB(1.6, 1.8, 3.6), M.m2, HW - 1.1, 5.4, -6.0); mk(body, VB(0.05, 0.5, 3.0), M.gl, HW - 1.92, 5.7, -6.0); mk(body, VB(1.5, 0.5, 0.05), M.gl, HW - 1.1, 5.7, -7.82);
  mk(body, VC(0.06, 0.06, 4, 6), M.steel, HW - 1.1, 8.3, -5.2); mk(body, VB(0.9, 0.08, 0.08), M.steel, HW - 1.1, 9.4, -5.2);
  mk(body, VB(1.2, 1.3, 2.2), M.m2, -(HW - 1.1), 5.1, -6.5);
  const fans = [];
  for (const x of [-3.6, 3.6]) {
    mk(body, vg('duct2', () => new THREE.TorusGeometry(2.1, 0.38, 10, 26)), M.m, x, 4.6, HL - 0.6);
    mk(body, VB(0.36, 2.4, 0.5), M.m2, x, 2.9, HL - 0.6);
    for (const dx of [-0.35, 0.35]) mk(body, VB(0.05, 4.0, 0.6), M.m2, x + dx, 4.6, HL - 0.05);
    const f = new THREE.Group(); f.position.set(x, 4.6, HL - 0.8); g.add(f);
    for (let i = 0; i < 4; i++) mk(f, VB(3.7, 0.26, 0.05), M.dk, 0, 0, 0, 0, 0, i * Math.PI / 4);
    mk(f, VC(0.36, 0.36, 0.3, 10), M.steel, 0, 0, 0, Math.PI / 2);
    fans.push(f);
  }
  mergeLocal(body);
  // bow ramp: raised it closes the cargo deck; lowered (rotation.x about -1.2) it lies on the sand
  const ramp = new THREE.Group(); ramp.position.set(0, 1.9, -HL + 0.4); g.add(ramp);
  mk(ramp, VB(11.4, 3.4, 0.18), M.m, 0, 1.7, 0); for (let i = 0; i < 6; i++) mk(ramp, VB(11.0, 0.06, 0.08), M.m2, 0, 0.4 + i * 0.52, -0.1); mergeLocal(ramp);
  g.userData.fan0 = fans[0]; g.userData.fan1 = fans[1]; g.userData.ramp = ramp;
  const tanks = [-3.0, 3.0].map((x) => { const t = makeTankMesh(0x4f5539); t.root.position.set(x, 1.98, 0.4); g.add(t.root); return t; });
  g.userData.tanks = tanks; g.userData.tank = tanks[0];
  return g;
}
function makeAAV() {
  const g = new THREE.Group(); const M = vmats(0x6a6448); const body = new THREE.Group(); g.add(body);
  mk(body, VB(3.3, 0.3, 8), M.m, 0, 0.2, 0);
  mk(body, vg('aavnose', () => sideExtrude([[-4.4, 0.35], [-3.3, 1.75], [-2.6, 1.75], [-2.6, 0.35]], 3.3)), M.m);
  for (const s of [-1, 1]) {
    mk(body, VB(0.25, 2.2, 7), M.m, s * 1.6, 1.3, 0.5);
    mk(body, VB(0.65, 1.0, 7.4), M.dk, s * 1.95, 0.5, 0.2);
    for (let i = 0; i < 6; i++) { const p = wheelPivot(body, s * 1.95, 0.45, -2.6 + i * 1.05, 0.34, 0.5, M, false); }
    for (let i = 0; i < 26; i++) mk(body, VB(0.68, 0.05, 0.08), M.dk, s * 1.95, 0.0, -3.0 + i * 0.25);
    mk(body, VB(0.06, 0.3, 6.8), M.m2, s * 1.74, 2.2, 0.5);
  }
  mk(body, VB(3.3, 2.2, 0.25), M.m, 0, 1.3, 4.0);
  mk(body, VB(3.0, 0.1, 0.6), M.m2, 0, 1.3, -4.3, -0.4);
  for (const s of [-1, 1]) mk(body, VB(0.25, 0.14, 0.1), M.lamp, s * 1.1, 1.5, -3.85, -0.7);
  // turret (RWS) front right + hatch doors open
  mk(body, VC(0.5, 0.55, 0.3, 14), M.m2, 0.9, 2.55, -2.6); mk(body, VB(0.7, 0.5, 0.8), M.m, 0.9, 2.95, -2.6); mk(body, VC(0.05, 0.05, 1.2, 6), M.dk, 0.9, 3.0, -3.4, Math.PI / 2);
  for (const s of [-1, 1]) mk(body, VB(1.3, 0.08, 2.4), M.m, s * 1.95, 2.45, 1.5, 0, 0, s * 0.9);
  mergeLocal(body);
  return g;
}
function makeShip(len = 160, w = 20, h = 14) {
  const g = new THREE.Group(); const M = vmats(0x6b7178); const body = new THREE.Group(); g.add(body);
  const L = len / 2;
  mk(body, vg(`shiphull${len}_${w}_${h}`, () => sideExtrude([[-L - 14, h - 2], [-L + 6, h - 4], [L, h - 4], [L, -4], [-L + 10, -4], [-L - 6, 2]], w, 0)), M.m);
  mk(body, VB(w * 0.98, 0.3, len + 10), M.m2, 0, h - 3.85, -2);
  if (len > 180) { // amphibious assault ship: full flight deck + island
    mk(body, VB(w * 1.15, 0.6, len + 14), M.m2, 0, h - 3.6, -4);
    mk(body, VB(w * 0.22, h * 0.9, len * 0.2), M.m, w * 0.42, h * 1.4 - 4, len * 0.05);
    mk(body, VB(w * 0.18, h * 0.4, len * 0.12), M.m3, w * 0.42, h * 2.0 - 4, len * 0.05);
    mk(body, VC(0.6, 0.8, 16, 6), M.steel, w * 0.42, h * 2.6 - 4, len * 0.05);
    for (let i = 0; i < 6; i++) mk(body, VB(1.2, 0.08, 3), mat('deckline', { color: 0xd0c890 }), 0, h - 3.25, -L + 20 + i * 30);
  } else { // destroyer: layered superstructure, gun, funnel, mast
    mk(body, VB(w * 0.6, h * 0.5, len * 0.32), M.m, 0, h - 4 + h * 0.25, -len * 0.05);
    mk(body, VB(w * 0.45, h * 0.4, len * 0.14), M.m3, 0, h - 4 + h * 0.65, -len * 0.12);
    for (let i = 0; i < 6; i++) mk(body, VB(w * 0.46, 0.6, 0.2), M.gl, 0, h - 4 + h * 0.75, -len * 0.19 - 0.01 + i * 0.001);
    mk(body, VB(w * 0.3, h * 0.6, len * 0.07), M.m2, 0, h - 4 + h * 0.6, len * 0.12);
    mk(body, VC(0.4, 0.6, h * 1.3, 6), M.steel, 0, h * 1.6, -len * 0.08);
    mk(body, VB(4, 0.3, 0.3), M.steel, 0, h * 1.9, -len * 0.08);
    mk(body, VC(2.2, 2.6, 1.6, 12), M.m2, 0, h - 3.2, -L + 18); mk(body, VC(0.25, 0.3, 7, 8), M.steel, 0, h - 2.8, -L + 14, Math.PI / 2 - 0.08);
    mk(body, VB(w * 0.4, 1.2, 8), M.m3, 0, h - 3.3, -L + 30);
    mk(body, VB(w * 0.5, 2.2, 10), M.m3, 0, h - 2.8, L * 0.55);
  }
  mergeLocal(body);
  return g;
}

/* KDX-III Aegis destroyer (세종대왕급): raked bow, the big octagonal radar faces on the forward deckhouse, VLS banks, 5-inch gun, twin funnels, hangar aft; bow points -z */
function makeDestroyer(num = '991') {
  const g = new THREE.Group(); const M = vmats(0x737a80); const body = new THREE.Group(); g.add(body);
  const L = 83, W = 21.4, D = 9; // half length, beam, deck height above water
  const hp = [[-L, 0, D + 2.4], [-L + 40, W / 2, D + 1], [L - 10, W / 2, D], [L, W / 2 - 1, D], [L, -W / 2 + 1, D], [L - 10, -W / 2, D], [-L + 40, -W / 2, D + 1]];
  { const pts = [[0, -L], [W / 2 * 0.55, -L + 22], [W / 2, -L + 50], [W / 2, L - 12], [W / 2 - 1.5, L], [-W / 2 + 1.5, L], [-W / 2, L - 12], [-W / 2, -L + 50], [-W / 2 * 0.55, -L + 22]];
    const geo = topExtrude(pts, D + 6, 0.15); const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); const t = clamp(y / (D + 6), 0, 1), f = clamp((-z - (L - 50)) / 50, 0, 1);
      pa.setX(i, x * lerp(1, lerp(0.3, 1, t), f) * lerp(0.82, 1, t)); pa.setZ(i, z + (1 - t) * 14 * f * f); pa.setY(i, y + f * t * 2.2); }
    geo.computeVertexNormals(); const hm = new THREE.Mesh(geo, M.m); hm.position.y = -6; body.add(hm); }
  mk(body, VB(W - 0.6, 0.3, L * 2 - 30), M.m2, 0, D, 8); // main deck
  // forward deckhouse with the four radar faces, bridge windows
  mk(body, VB(W * 0.72, 7, 30), M.m, 0, D + 3.5, -22); mk(body, VB(W * 0.6, 5, 20), M.m3, 0, D + 9.5, -24); mk(body, VB(W * 0.45, 3.5, 11), M.m, 0, D + 13.7, -25);
  for (let i = 0; i < 8; i++) mk(body, VB(0.06, 1.0, 1.6), M.gl, -W * 0.3 - 0.02, D + 10.2, -32 + i * 2.2); mk(body, VB(W * 0.58, 1.0, 0.06), M.gl, 0, D + 10.2, -34.03);
  for (const [x, z, ry] of [[0, -34.2, 0], [W * 0.3 + 0.2, -24, Math.PI / 2], [-W * 0.3 - 0.2, -24, -Math.PI / 2]]) mk(body, vg('spy', () => new THREE.CylinderGeometry(2.6, 2.6, 0.3, 8)), M.m2, x, D + 12, z, Math.PI / 2, ry, 0);
  // masts: tall lattice forward, smaller aft, yards and radomes
  mk(body, VB(0.8, 14, 0.8), M.steel, 0, D + 22, -22); mk(body, VB(6, 0.25, 0.25), M.steel, 0, D + 25, -22); mk(body, VB(4, 0.25, 0.25), M.steel, 0, D + 27.5, -22);
  mk(body, vg('dradome', () => new THREE.SphereGeometry(1.1, 10, 8)), mat('radome', { color: 0xe4e4dc, rough: 0.5 }), 0, D + 29.5, -22);
  mk(body, VB(0.6, 8, 0.6), M.steel, 0, D + 15, 30); mk(body, VB(3.4, 0.2, 0.2), M.steel, 0, D + 17, 30);
  // funnels, midships deckhouse, hangar and flight deck aft
  mk(body, VB(W * 0.6, 5, 40), M.m, 0, D + 2.5, 10); for (const z of [2, 22]) { mk(body, VB(5, 7, 6), M.m3, 0, D + 7.5, z); mk(body, VB(4.4, 0.4, 5.2), M.dk, 0, D + 11.1, z); }
  mk(body, VB(W * 0.7, 6, 16), M.m, 0, D + 3, 42); mk(body, VB(W * 0.5, 4.4, 0.1), M.dk, 0, D + 2.4, 50.06);
  for (let i = 0; i < 4; i++) mk(body, VB(W * 0.7, 0.04, 0.3), mat('deckline', { color: 0xd0c890 }), 0, D + 0.17, 54 + i * 6);
  // VLS banks fore and aft, the 5-inch gun on the foredeck, CIWS
  for (const z of [-46, 34]) { mk(body, VB(W * 0.5, 0.6, 9), M.m2, 0, D + 0.4, z); for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) mk(body, VB(1.8, 0.05, 1.8), M.dk, -3.3 + a * 2.2, D + 0.72, z - 3.3 + b * 2.2); }
  mk(body, VC(2.6, 3.0, 1.8, 14), M.m2, 0, D + 1.2, -60); mk(body, VB(3.2, 1.6, 3.6), M.m, 0, D + 2.6, -60.5); mk(body, VC(0.22, 0.28, 7.5, 8), M.steel, 0, D + 2.8, -65.5, Math.PI / 2 - 0.06);
  for (const z of [-36, 52]) { mk(body, VC(0.9, 1.1, 1.6, 10), M.m3, 0, D + 15 * (z < 0 ? 0.55 : 0.43), z); mk(body, vg('ciws', () => new THREE.SphereGeometry(0.9, 10, 8)), mat('radome', {}), 0, D + 15 * (z < 0 ? 0.55 : 0.43) + 1.4, z); }
  // waterline band, anchors
  for (const s of [-1, 1]) mk(body, VB(0.15, 1.2, L * 2 - 40), mat('lhdboot', { color: 0x2c2626, rough: 0.9 }), s * (W / 2 * 0.86), -0.2, 10);
  mergeLocal(body);
  // hull number on both bows
  const t = canvasTex(256, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#ecece4'; c.font = 'bold 100px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(num, w / 2, h / 2 + 4); });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshBasicMaterial({ map: t, transparent: true })); p.position.set(s * (W / 2 * 0.62 + 0.3), D - 2.5, -L + 26); p.rotation.y = s * Math.PI / 2 + s * 0.12; g.add(p); }
  g.userData.gun = v3(0, D + 2.8, -69);
  return g;
}