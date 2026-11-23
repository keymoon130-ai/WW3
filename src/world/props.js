/* =========================================================
   props & map building blocks
   ========================================================= */
const MT = {
  sandbag: () => mat('sandbag', { map: 'sandbag' }),
  concrete: () => mat('concrete', { map: 'concrete' }),
  concreteD: () => mat('concreteD', { map: 'concrete', color: 0x8a8a8a }),
  wood: () => mat('wood', { map: 'wood' }),
  metal: () => mat('metal', { map: 'metal', metal: 0.3, rough: 0.6 }),
  rust: () => mat('rust', { map: 'rust' }),
  brick: () => mat('brick', { map: 'brick' }),
  dark: () => mat('darkm', { color: 0x1e1f20 }),
  snowM: () => mat('snowM', { map: 'snow' }),
  roof: () => mat('roof', { color: 0x4a4d52, rough: 0.8 }),
  roofR: () => mat('roofR', { color: 0x6a3a30, rough: 0.8 }),
  glass: () => mat('glass', { color: 0x22282e, rough: 0.2, metal: 0.4 }),
  burnt: () => mat('burnt', { color: 0x1d1b19, rough: 1 }),
  asphalt: () => mat('asphalt', { map: 'asphalt' }),
  road: () => mat('roadm', { map: 'road' }),
  tent: () => mat('tent', { map: 'tent' }),
  pine: () => mat('pine', { color: 0x2c3a2c, rough: 1 }),
  pineSnow: () => mat('pineSnow', { color: 0xc8d2d8, rough: 1 }),
  trunk: () => mat('trunk', { color: 0x3a2e24 }),
};
/* cover helper: register cover points on both sides of a wall segment */
function coverAlong(x, z, len, rot, off = 0.9, step = 2.6) {
  const c = Math.cos(rot), s = Math.sin(rot); const n = Math.max(1, Math.floor(len / step));
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n * len - len / 2; const px = x + c * t, pz = z - s * t;
    G.covers.push(v3(px + s * off, 0, pz + c * off), v3(px - s * off, 0, pz - c * off)); }
}
function sandbags(x, z, len, rot = 0, h = 1.05) {
  const y = G.groundAt(x, z); addBox(x, y, z, len, h, 0.8, MT.sandbag(), { rotY: rot, tile: 1.1 }); coverAlong(x, z, len, rot);
}
function sandbagRing(x, z, r = 2.4, gapAt = 0) {
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; if (Math.abs(angDiff(a, gapAt)) < 0.4) continue; sandbags(x + Math.cos(a) * r, z + Math.sin(a) * r, r * 1.05, -a + Math.PI / 2, 1.1); }
}
function jersey(x, z, len, rot = 0) { const y = G.groundAt(x, z); addBox(x, y, z, len, 0.85, 0.6, MT.concrete(), { rotY: rot, tile: 2 }); coverAlong(x, z, len, rot, 0.8); }
function crate(x, z, s = 1.1, rot = 0, y) { addBox(x, y ?? G.groundAt(x, z), z, s, s, s, MT.wood(), { rotY: rot, tile: 1, cover: false }); G.covers.push(v3(x + s, 0, z), v3(x - s, 0, z)); }
function barrel(x, z) { addMesh(new THREE.CylinderGeometry(0.32, 0.32, 0.9, 10), mat('barrel', { color: 0x3c4a3a, rough: 0.6 }), x, G.groundAt(x, z) + 0.45, z); addCollider(x - 0.3, G.groundAt(x, z), z - 0.3, x + 0.3, G.groundAt(x, z) + 0.9, z + 0.3); }
function carProp(x, z, rot = 0, col = 0x4a5560, burnt = false, fire = false) {
  const y = G.groundAt(x, z); const m = burnt ? MT.burnt() : mat('car' + col, { color: col, rough: 0.5, metal: 0.3 });
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = rot; G.staticRoot.add(grp);
  addBox(0, 0.3, 0, 1.8, 0.75, 4.3, m, { parent: grp, collide: false });
  addBox(0, 1.05, 0.2, 1.6, 0.6, 2.2, burnt ? MT.burnt() : MT.glass(), { parent: grp, collide: false });
  for (const sx of [-0.8, 0.8]) for (const sz of [-1.35, 1.35]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.25, 8), MT.dark()); w.rotation.z = Math.PI / 2; w.position.set(sx, burnt ? 0.2 : 0.33, sz); grp.add(w); }
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot)); const hx = 0.9 * c + 2.15 * s, hz = 0.9 * s + 2.15 * c;
  addCollider(x - hx, y, z - hz, x + hx, y + 1.4, z + hz); coverAlong(x, z, 4, rot + Math.PI / 2, 1.4, 2.2);
  if (fire) { addEmitter(v3(x, y + 1, z), 'fire', 0.8, 18); addEmitter(v3(x, y + 1.8, z), 'smoke', 0.5, 2); }
}
function busProp(x, z, rot = 0, col = 0x2f6a46, burnt = false) {
  const y = G.groundAt(x, z); const b = makeBusMesh(burnt ? 0x1d1b19 : col); b.root.position.set(x, y, z); b.root.rotation.y = rot; if (burnt) b.root.traverse((c) => { if (c.isMesh) c.material = MT.burnt(); }); G.staticRoot.add(b.root);
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot)); const hx = (1.3 * c + 5.5 * s) * VSCALE, hz = (1.3 * s + 5.5 * c) * VSCALE; addCollider(x - hx, y, z - hz, x + hx, y + 3 * VSCALE, z + hz); coverAlong(x, z, 10, rot + Math.PI / 2, 1.8, 3);
}
function truckProp(x, z, rot = 0, col = 0x4d5340, burnt = false) {
  const y = G.groundAt(x, z); const t = makeTruckMesh(burnt ? 0x1d1b19 : col); t.root.position.set(x, y, z); t.root.rotation.y = rot; if (burnt) t.root.traverse((c) => { if (c.isMesh) c.material = MT.burnt(); }); G.staticRoot.add(t.root);
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot)); const hx = (1.2 * c + 3.2 * s) * VSCALE, hz = (1.2 * s + 3.2 * c) * VSCALE; addCollider(x - hx, y, z - hz, x + hx, y + 2.8 * VSCALE, z + hz); coverAlong(x, z, 6, rot + Math.PI / 2, 1.6, 2.5);
}
function tankWreck(x, z, rot = 0, fire = true) {
  const t = makeTankMesh(0x1d1b19); t.root.position.set(x, G.groundAt(x, z), z); t.root.rotation.y = rot; t.turret.rotation.y = rand(-1, 1); t.root.traverse((c) => { if (c.isMesh) c.material = MT.burnt(); }); G.staticRoot.add(t.root);
  addCollider(x - 3.2, G.groundAt(x, z), z - 3.2, x + 3.2, G.groundAt(x, z) + 3.4, z + 3.2); G.covers.push(v3(x + 4.2, 0, z), v3(x - 4.2, 0, z), v3(x, 0, z + 5.2), v3(x, 0, z - 5.2));
  if (fire) { addEmitter(v3(x, G.groundAt(x, z) + 2, z), 'smoke', 0.8, 2.5); addEmitter(v3(x, G.groundAt(x, z) + 1.5, z), 'fire', 0.6, 12); }
}
function lampPost(x, z, broken = false) { const y = G.groundAt(x, z); addBox(x, y, z, 0.15, broken ? 3 : 7, 0.15, MT.metal(), { collide: true }); if (!broken) addBox(x, y + 6.9, z - 0.6, 0.2, 0.15, 1.4, MT.metal(), { collide: false }); }
function pine(x, z, s = 1, snowy = true) {
  const y = G.groundAt(x, z);
  addMesh(new THREE.CylinderGeometry(0.15 * s, 0.22 * s, 2 * s, 6), MT.trunk(), x, y + s, z);
  for (let i = 0; i < 3; i++) { const r = (1.7 - i * 0.45) * s, h = (2.4 - i * 0.4) * s; addMesh(new THREE.ConeGeometry(r, h, 12), MT.pine(), x, y + (1.6 + i * 1.3) * s + h / 2 - 0.3, z); if (snowy) addMesh(new THREE.ConeGeometry(r * 0.62, h * 0.45, 12), MT.pineSnow(), x, y + (1.6 + i * 1.3) * s + h * 0.85 - 0.3, z); }
  addCollider(x - 0.25 * s, y, z - 0.25 * s, x + 0.25 * s, y + 3 * s, z + 0.25 * s);
}
function bareTree(x, z, s = 1) {
  const y = G.groundAt(x, z); addMesh(new THREE.CylinderGeometry(0.12 * s, 0.2 * s, 4 * s, 6), MT.trunk(), x, y + 2 * s, z);
  for (let i = 0; i < 4; i++) { const b = addMesh(new THREE.CylinderGeometry(0.04 * s, 0.08 * s, 2 * s, 5), MT.trunk(), x, y + (2.6 + i * 0.4) * s, z, { rot: [rand(0.5, 1), i * 1.6, 0] }); }
  addMesh(hgTwigGeo(+(2.0 * s).toFixed(1)), hgTwigMat(), x, y + 4.6 * s, z, { rot: [0, rand(0, TAU), 0] }); // the fine crown of twigs
  addCollider(x - 0.2, y, z - 0.2, x + 0.2, y + 3, z + 0.2);
}
/* low vegetation: frozen shrubs and dry grass tufts poking through snow */
function shrub(x, z, s = 1, snowy = true) {
  const y = G.groundAt(x, z); const m = mat('shrub', { color: 0x3b3f2c, rough: 1 }), sn = MT.pineSnow ? MT.pineSnow() : m;
  for (let i = 0; i < 4; i++) { const r = rand(0.35, 0.6) * s; addMesh(new THREE.IcosahedronGeometry(r, 0), m, x + rand(-0.5, 0.5) * s, y + r * 0.6, z + rand(-0.5, 0.5) * s, { cast: true }); }
  if (snowy) addMesh(new THREE.IcosahedronGeometry(0.42 * s, 0), sn, x, y + 0.75 * s, z, { cast: false });
}
const TUFT = (() => { const g = new THREE.PlaneGeometry(0.5, 0.55); g.translate(0, 0.27, 0); const a = g.clone(); a.rotateY(Math.PI / 2); const b = g.clone(); b.rotateY(Math.PI / 4); const out = concatGeos([g.toNonIndexed(), a.toNonIndexed(), b.toNonIndexed()]); out.userData.keep = true; return out; })();
function grassTuft(x, z, s = 1) { const y = G.groundAt(x, z); const me = new THREE.Mesh(TUFT, mat('tuft', { color: 0x8a7a50, rough: 1, side: THREE.DoubleSide })); me.position.set(x, y - 0.05, z); me.scale.setScalar(s); me.rotation.y = rand(0, TAU); G.staticRoot.add(me); }
function scatterVeg(x0, z0, x1, z1, n, avoid = [], o = {}) {
  const free = (x, z) => !avoid.some(([ax0, az0, ax1, az1]) => x > ax0 && x < ax1 && z > az0 && z < az1);
  for (let i = 0; i < n; i++) { const x = rand(x0, x1), z = rand(z0, z1); if (!free(x, z)) continue; const r = Math.random();
    if (r < (o.tree ?? 0.12)) (Math.random() < 0.5 ? pine(x, z, rand(0.8, 1.3)) : bareTree(x, z, rand(0.8, 1.2)));
    else if (r < 0.45) shrub(x, z, rand(0.7, 1.3)); else for (let k = 0; k < 4; k++) grassTuft(x + rand(-1.2, 1.2), z + rand(-1.2, 1.2), rand(0.7, 1.4)); }
}
function rubble(x, z, s = 1) {
  const y = G.groundAt(x, z);
  for (let i = 0; i < 7; i++) { const w = rand(0.4, 1.4) * s; const m = addMesh(boxGeo(w, rand(0.3, 0.8) * s, rand(0.4, 1.3) * s, 1), pick([MT.concrete(), MT.concreteD(), MT.brick()]), x + rand(-1.4, 1.4) * s, y + rand(0.1, 0.4) * s, z + rand(-1.4, 1.4) * s, { rot: [rand(-0.4, 0.4), rand(0, 3), rand(-0.4, 0.4)] }); }
  addCollider(x - 1.1 * s, y, z - 1.1 * s, x + 1.1 * s, y + 0.75 * s, z + 1.1 * s); G.covers.push(v3(x + 2 * s, 0, z), v3(x - 2 * s, 0, z), v3(x, 0, z + 2 * s), v3(x, 0, z - 2 * s));
}
/* solid building block with facade */
function building(x, z, w, d, h, o = {}) {
  const y = o.y ?? G.groundAt(x, z); const hue = o.hue ?? pick([30, 200, 40, 210, 20]);
  const fm = mat(`fac_${hue}_${o.lit ?? 0.08}_${o.broken ?? 0.25}`, { map: `facade:${hue}:${o.lit ?? 0.08}:${o.broken ?? 0.25}` });
  addBox(x, y, z, w, h, d, fm, { tile: 7 });
  addBox(x, y + h, z, w + 0.3, 0.6, d + 0.3, MT.concreteD(), { collide: false, tile: 3 });
  if (o.snowRoof) addBox(x, y + h + 0.6, z, w, 0.15, d, MT.snowM(), { collide: false, cast: false });
  if (o.ruin) { for (let i = 0; i < 4; i++) { const bw = rand(2, w * 0.4), bh = rand(2, 6); addBox(x + rand(-w / 2 + bw / 2, w / 2 - bw / 2), y + h, z + rand(-d / 2 + 1, d / 2 - 1), bw, bh, rand(1, d * 0.5), fm, { tile: 7, collide: false }); } }
  if (o.fire) { addEmitter(v3(x + rand(-w / 3, w / 3), y + h, z + rand(-d / 3, d / 3)), 'smoke', 1.4, 2); if (o.fire > 1) addEmitter(v3(x, y + h * 0.6, z + d / 2 + 0.3), 'fire', 1, 15); }
  // covers at corners
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) G.covers.push(v3(x + sx * (w / 2 + 0.7), 0, z + sz * (d / 2 - 0.5)), v3(x + sx * (w / 2 - 0.5), 0, z + sz * (d / 2 + 0.7)));
}
/* walled room with openings. openings: [{side:'n'|'s'|'e'|'w', at:offset, w:width, y0:0, y1:2.2}] — n = -z side */
function room(x, z, w, d, h, openings = [], o = {}) {
  const y = o.y ?? G.groundAt(x, z); const t = o.t ?? 0.25; const m = o.mat || MT.concrete(); const tile = o.tile ?? 2.5;
  const sides = { n: { cx: x, cz: z - d / 2, len: w, axis: 'x' }, s: { cx: x, cz: z + d / 2, len: w, axis: 'x' }, w: { cx: x - w / 2, cz: z, len: d, axis: 'z' }, e: { cx: x + w / 2, cz: z, len: d, axis: 'z' } };
  for (const k in sides) {
    const S = sides[k]; const ops = openings.filter((op) => op.side === k).sort((a, b) => a.at - b.at);
    let cur = -S.len / 2;
    const seg = (a, b, y0, y1) => { if (b - a < 0.05 || y1 - y0 < 0.05) return; const mid = (a + b) / 2, L = b - a; if (S.axis === 'x') addBox(S.cx + mid, y + y0, S.cz, L + (a <= -S.len / 2 + 0.01 || b >= S.len / 2 - 0.01 ? t : 0), y1 - y0, t, m, { tile }); else addBox(S.cx, y + y0, S.cz + mid, t, y1 - y0, L, m, { tile }); };
    for (const op of ops) { const a = op.at - op.w / 2, b = op.at + op.w / 2; seg(cur, a, 0, h); seg(a, b, 0, op.y0 ?? 0); seg(a, b, op.y1 ?? 2.2, h); cur = b; }
    seg(cur, S.len / 2, 0, h);
  }
  if (o.floor) addBox(x, y - 0.05, z, w, 0.06, d, o.floorMat || MT.concreteD(), { collide: false, tile: 2, cast: false });
  if (o.roof !== false) addBox(x, y + h, z, w + 0.4, 0.3, d + 0.4, o.roofMat || MT.concreteD(), { tile: 3 });
  if (o.lamp) { const l = addMesh(bg(0.3, 0.1, 0.3), basicMat('lampw', 0xffe0a0), x, y + h - 0.1, z, { cast: false }); }
}
/* Korean rural house: room + tiled roof */
function house(x, z, w, d, o = {}) {
  // rural North Korean block house: rendered cement walls, low-pitched corrugated metal roof
  const y = G.groundAt(x, z); const h = 3.0;
  room(x, z, w, d, h, o.openings || [{ side: 's', at: 0, w: 1.1 }, { side: 'e', at: 0, w: 1.2, y0: 1, y1: 2 }, { side: 'w', at: 0, w: 1.2, y0: 1, y1: 2 }], { mat: o.mat || mat('cblock', { color: 0xbab5aa, map: 'concrete' }), roof: false, floor: true, floorMat: MT.concrete() });
  const rc = pick([0x4f6a74, 0x6e5a48, 0x5a6852, 0x5c6066]); const rm = o.roofMat || mat('corr' + rc, { color: rc, map: 'container', rough: 0.55, metal: 0.45 });
  addBox(x, y + h - 0.25, z, w + 0.1, 0.25, d + 0.1, mat('cbband', { color: 0x8e8a80 }), { collide: false, cast: false });
  const pitch = 0.22, half = d / 2 + 0.5, slope = half / Math.cos(pitch);
  for (const s of [-1, 1]) { const m = addMesh(boxGeo(w + 1.2, 0.18, slope, 1), rm, x, y + h + Math.tan(pitch) * half / 2, z + s * half / 2, { rot: [s * pitch, 0, 0] }); }
  addBox(x, y + h, z, w, 0.1, d, MT.concrete(), { collide: true, cast: false });
  if (o.snowRoof !== false && G.env.snow) for (const s of [-1, 1]) addMesh(boxGeo(w + 1.0, 0.1, slope * 0.9, 1), MT.snowM(), x, y + h + Math.tan(pitch) * half / 2 + 0.12, z + s * half / 2, { rot: [s * pitch, 0, 0], cast: false });
}
function guardPost(x, z, o = {}) {
  room(x, z, 3.4, 3.4, 2.5, [{ side: 'n', at: 0, w: 2.2, y0: 1.1, y1: 1.6 }, { side: 'e', at: -0.6, w: 0.8, y0: 1.1, y1: 1.6 }, { side: 'w', at: -0.6, w: 0.8, y0: 1.1, y1: 1.6 }, { side: 's', at: 0.6, w: 0.95 }], { floor: true, mat: MT.concrete() });
  addBox(x, G.groundAt(x, z) + 2.8, z, 3.8, 0.4, 3.8, MT.sandbag(), { collide: false, tile: 1 });
  addBox(x + 0.9, G.groundAt(x, z), z - 1.3, 1.2, 0.95, 0.5, MT.wood(), { tile: 1 });
}
function tent(x, z, w, d, rot = 0, o = {}) {
  // walk-in canvas tent: 3.2 m walls, ridge roof, door on the local -z side
  const H = o.h ?? 3.2, R = o.roof ?? Math.min(2.4, w * 0.3), door = o.door !== false, dw = Math.min(2.6, w * 0.4), dh = Math.min(2.7, H - 0.2);
  const y = G.groundAt(x, z); const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = rot; G.staticRoot.add(grp);
  const tm = MT.tent(); const c = Math.cos(rot), sn = Math.sin(rot);
  const wall = (lx, lz, ww, dd, hh = H, yy = 0) => { addBox(lx, yy, lz, ww, hh, dd, tm, { parent: grp, collide: false, tile: 2 }); const wx = x + lx * c + lz * sn, wz = z - lx * sn + lz * c; const hx = (ww * Math.abs(c) + dd * Math.abs(sn)) / 2, hz = (ww * Math.abs(sn) + dd * Math.abs(c)) / 2; addCollider(wx - hx, y + yy, wz - hz, wx + hx, y + yy + hh, wz + hz); };
  const t = 0.12;
  wall(0, d / 2, w, t); wall(-w / 2, 0, t, d); wall(w / 2, 0, t, d);
  if (door) { const side = (w - dw) / 2; wall(-w / 2 + side / 2, -d / 2, side, t); wall(w / 2 - side / 2, -d / 2, side, t); wall(0, -d / 2, dw, t, H - dh, dh); const flap = new THREE.Mesh(boxGeo(dw * 0.5, dh, 0.05), tm); flap.position.set(-dw * 0.5, dh / 2, -d / 2 - 0.3); flap.rotation.y = 0.9; grp.add(flap); }
  else wall(0, -d / 2, w, t);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 0.15, 0); sh.lineTo(0, R); sh.lineTo(w / 2 + 0.15, 0); sh.lineTo(-w / 2 - 0.15, 0);
  const rg = new THREE.ExtrudeGeometry(sh, { depth: d + 0.3, bevelEnabled: false }); rg.translate(0, H, -d / 2 - 0.15);
  const r = new THREE.Mesh(rg, tm); r.castShadow = true; grp.add(r);
  addBox(0, 0.01, 0, w - 0.2, 0.04, d - 0.2, mat('tentfloor', { color: 0x4a4a3c }), { parent: grp, collide: false });
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(boxGeo(0.04, 0.9, 0.04), MT.metal()); p.position.set(sx * (w / 2 + 0.9), 0.45, -d / 2 + (i + 0.5) * d / 3); p.rotation.z = sx * 0.6; grp.add(p); }
  return grp;
}
function container(x, z, rot = 0, col = 0x8a3b2a, y) {
  const yy = y ?? G.groundAt(x, z); addBox(x, yy, z, 2.44, 2.6, 6.1, mat('cont' + col, { color: col, map: 'container', rough: 0.7, metal: 0.2 }), { rotY: rot, tile: 2.6 });
  if (yy < 1) coverAlong(x, z, 6, rot, 1.8, 3);
}
function fence(x1, z1, x2, z2, h = 2) {
  const L = Math.hypot(x2 - x1, z2 - z1), rot = Math.atan2(-(z2 - z1), x2 - x1); const n = Math.ceil(L / 3);
  for (let i = 0; i <= n; i++) { const t = i / n; addBox(lerp(x1, x2, t), G.groundAt(lerp(x1, x2, t), lerp(z1, z2, t)), lerp(z1, z2, t), 0.1, h, 0.1, MT.metal(), { collide: false }); }
  for (const hy of [0.5, 1.1, 1.7]) addMesh(boxGeo(L, 0.03, 0.03), MT.metal(), (x1 + x2) / 2, G.groundAt((x1 + x2) / 2, (z1 + z2) / 2) + hy * h / 2, (z1 + z2) / 2, { rot: [0, rot, 0], cast: false });
  addCollider(Math.min(x1, x2) - 0.1, G.groundAt(x1, z1), Math.min(z1, z2) - 0.1, Math.max(x1, x2) + 0.1, h, Math.max(z1, z2) + 0.1, { bullet: false });
}
function wire(x1, z1, x2, z2) { // concertina wire coil
  const L = Math.hypot(x2 - x1, z2 - z1); const n = Math.floor(L / 0.6); const g = new THREE.TorusGeometry(0.45, 0.015, 3, 10);
  for (let i = 0; i < n; i++) { const t = i / n; addMesh(g, MT.metal(), lerp(x1, x2, t), G.groundAt(lerp(x1, x2, t), lerp(z1, z2, t)) + 0.45, lerp(z1, z2, t), { rot: [0, Math.atan2(x2 - x1, z2 - z1), 0], cast: false }); }
  addCollider(Math.min(x1, x2) - 0.3, 0, Math.min(z1, z2) - 0.3, Math.max(x1, x2) + 0.3, 0.9, Math.max(z1, z2) + 0.3, { bullet: false });
}
function flagPole(x, z, h = 8, colors = 'kr') {
  const y = G.groundAt(x, z); addBox(x, y, z, 0.12, h, 0.12, MT.metal());
  const fg = new THREE.PlaneGeometry(2.4, 1.6, 12, 6); fg.translate(1.2, 0, 0);
  const ft = canvasTex(240, 160, (g, w, hh) => drawFlag(g, w, hh, colors));
  const fm = new THREE.MeshStandardMaterial({ map: ft, side: THREE.DoubleSide, rough: 0.9 });
  const f = new THREE.Mesh(fg, fm); f.position.set(x + 0.06, y + h - 0.9, z); G.world.add(f);
  const base = fg.attributes.position.array.slice();
  G.updaters.push((dt) => { const p = fg.attributes.position; for (let i = 0; i < p.count; i++) { const bx = base[i * 3]; p.setZ(i, Math.sin(bx * 2.2 - G.time * 5) * 0.12 * bx); } p.needsUpdate = true; fg.computeVertexNormals(); });
  return f;
}
function drawFlag(g, w, h, kind) {
  g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h);
  if (kind === 'kr') {
    const cx = w / 2, cy = h / 2, r = h * 0.25;
    g.save(); g.translate(cx, cy); g.rotate(Math.atan2(2, 3));
    g.fillStyle = '#c8102e'; g.beginPath(); g.arc(0, 0, r, Math.PI, 0); g.fill();
    g.fillStyle = '#003478'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI); g.fill();
    g.fillStyle = '#c8102e'; g.beginPath(); g.arc(-r / 2, 0, r / 2, 0, TAU); g.fill();
    g.fillStyle = '#003478'; g.beginPath(); g.arc(r / 2, 0, r / 2, 0, TAU); g.fill();
    g.restore();
    g.fillStyle = '#111';
    const tri = [[-1, -1, [1, 1, 1]], [1, 1, [0, 0, 0]], [1, -1, [0, 1, 0]], [-1, 1, [1, 0, 1]]];
    for (const [sx, sy, bars] of tri) {
      g.save(); g.translate(cx + sx * w * 0.3, cy + sy * h * 0.3); g.rotate(Math.atan2(sy * 2, sx * 3) + Math.PI / 2);
      for (let b = 0; b < 3; b++) { const yy = (b - 1) * 7; if (bars[b]) g.fillRect(-12, yy - 2.5, 24, 5); else { g.fillRect(-12, yy - 2.5, 10, 5); g.fillRect(2, yy - 2.5, 10, 5); } }
      g.restore();
    }
  } else if (kind === 'enemy') { g.fillStyle = '#8e1b1b'; g.fillRect(0, 0, w, h); g.fillStyle = '#2b2b2b'; g.beginPath(); g.moveTo(0, h * 0.62); g.lineTo(w, h * 0.22); g.lineTo(w, h * 0.42); g.lineTo(0, h * 0.82); g.closePath(); g.fill(); g.strokeStyle = '#e8d8a0'; g.lineWidth = 4; g.beginPath(); g.arc(w * 0.22, h * 0.3, h * 0.14, 0, TAU); g.stroke();
  } else if (kind === 'blue') { g.fillStyle = '#5b92e5'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5; g.beginPath(); g.arc(w / 2, h / 2, h * 0.24, 0, TAU); g.stroke(); }
  else { g.fillStyle = '#555'; g.fillRect(0, 0, w, h); }
}
/* road strip */
/* a road that follows a bending centreline: one continuous ribbon, so wide curves have no seams */
function roadRibbon(cx, wf, z0, z1, o = {}) {
  const step = o.step || 4, n = Math.ceil((z1 - z0) / step), pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) { const z = Math.min(z1, z0 + i * step), x = cx(z), w = wf(z) / 2, k = (cx(z + 0.5) - cx(z - 0.5)), L = Math.hypot(k, 1), nxv = 1 / L, nzv = -k / L;
    for (const s of [-1, 1]) { const px = x + s * w * nxv, pz = z + s * w * nzv; pos.push(px, (o.y ?? G.groundAt(px, pz)) + (o.lift ?? 0.03), pz); uv.push(s < 0 ? 0 : 1, z / 20); }
    if (i < n) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, o.mat || MT.road()); m.receiveShadow = true; G.staticRoot.add(m); return m;
}
function roadStrip(x, z, w, len, rot = 0, y, o = {}) {
  if (y === undefined) {
    // drape the road over the terrain so vehicles driving on the ground never sink through it or float under it
    const segL = Math.max(1, Math.ceil(len / 2)), geo = new THREE.PlaneGeometry(w, len, 2, segL); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, c = Math.cos(rot), sn = Math.sin(rot);
    for (let i = 0; i < pos.count; i++) { const lx = pos.getX(i), lz = pos.getZ(i); const wx = x + lx * c + lz * sn, wz = z - lx * sn + lz * c; pos.setY(i, G.groundAt(wx, wz) + 0.05); }
    geo.computeVertexNormals(); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), uv.getY(i) * len / 20);
    const m = new THREE.Mesh(geo, o.mat || MT.road()); m.position.set(x, 0, z); m.rotation.y = rot; m.receiveShadow = true; G.world.add(m); return m;
  }
  const m = addMesh(boxGeo(w, 0.04, len), MT.road(), x, (y ?? G.groundAt(x, z)) + 0.02, z, { rot: [0, rot, 0], cast: false }); const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), uv.getY(i) * len / 20); return m; }
/* water plane */
function waterPlane(x, z, w, d, y, col = 0x2a3a44, waves = false) {
  const geo = new THREE.PlaneGeometry(w, d, waves ? 80 : 1, waves ? 80 : 1); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: new THREE.Color(col).multiplyScalar(1.45), roughness: 0.3, metalness: 0.15, transparent: true, opacity: 0.93, side: THREE.DoubleSide }));
  m.position.set(x, y, z); m.receiveShadow = true; G.world.add(m);
  if (waves) { const base = geo.attributes.position.array.slice(); G.updaters.push(() => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const bx = base[i * 3] + x, bz = base[i * 3 + 2] + z; p.setY(i, Math.sin(bx * 0.08 + G.time * 1.1) * 0.35 + Math.sin(bz * 0.11 + G.time * 0.8) * 0.3 + Math.sin((bx + bz) * 0.3 + G.time * 2) * 0.08); } p.needsUpdate = true; geo.computeVertexNormals(); }); }
  return m;
}
/* distant city silhouettes (cheap) */
function skyline(cx, cz, r, n, hmin, hmax, col = 0x3a3f46, lit = 0.06) {
  for (let i = 0; i < n; i++) { const a = rand(0, TAU), rr = r * rand(0.8, 1.2), w = rand(12, 30), h = rand(hmin, hmax); addBox(cx + Math.cos(a) * rr, -1, cz + Math.sin(a) * rr, w, h, w, mat(`fac_${200}_${lit}_0.2`, { map: `facade:200:${lit}:0.2` }), { collide: false, tile: 7, cast: false }); }
}
/* scripted animated helpers */
function tweenObj(obj, to, dur, ease = smooth) {
  const from = { px: obj.position.x, py: obj.position.y, pz: obj.position.z, rx: obj.rotation.x, ry: obj.rotation.y, rz: obj.rotation.z }; let t = 0;
  return new Promise((res) => { G.updaters.push(function u(dt) { t += dt; const k = ease(clamp(t / dur, 0, 1)); if (to.p) obj.position.set(lerp(from.px, to.p[0], k), lerp(from.py, to.p[1], k), lerp(from.pz, to.p[2], k)); if (to.r) obj.rotation.set(lerp(from.rx, to.r[0], k), lerp(from.ry, to.r[1], k), lerp(from.rz, to.r[2], k)); if (t >= dur) { res(); return true; } }); });
}

/* ---------- props a convoy smashes through instead of passing through: jersey barriers (one 2 m unit each), sandbag walls, wrecks ----------
   each is its own group in the world with its own collider; a vehicle that drives into one knocks it aside: the piece is flung forward
   and sideways, tumbles, bounces once and comes to rest as debris, with dust, grit and a crash */
let JERSEY_G = null;
function smashProp(kind, x, z, rot = 0, o = {}) {
  const y = G.groundAt(x, z), g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; G.world.add(g);
  const add = (geo, m, px, py, pz) => { const me = new THREE.Mesh(geo, m); me.position.set(px, py, pz); me.castShadow = me.receiveShadow = true; g.add(me); return me; };
  let hx = 1, hz = 1, h = 1, r = 1.2;
  if (kind === 'jersey') { if (!JERSEY_G) { const sh = new THREE.Shape([[-0.3, 0], [0.3, 0], [0.3, 0.08], [0.12, 0.33], [0.08, 0.85], [-0.08, 0.85], [-0.12, 0.33], [-0.3, 0.08]].map(([a, b]) => new THREE.Vector2(a, b))); JERSEY_G = new THREE.ExtrudeGeometry(sh, { depth: 1.95, bevelEnabled: false }); JERSEY_G.translate(0, 0, -0.975); JERSEY_G.rotateY(Math.PI / 2); }
    add(JERSEY_G, MT.concrete(), 0, 0, 0); hx = 1; hz = 0.32; h = 0.85; r = 1.05; }
  else if (kind === 'bags') { const bm = MT.sandbag(); for (let row = 0; row < 3; row++) for (let i = 0; i < 3; i++) add(new RoundedBoxGeometry(0.62, 0.3, 0.42, 2, 0.1), bm, -0.66 + i * 0.66 + (row % 2) * 0.2 - 0.1, 0.16 + row * 0.3, rand(-0.04, 0.04)); hx = 1.05; hz = 0.3; h = 0.95; r = 1.1; }
  else if (kind === 'crate') { // an air-dropped supply bundle: plywood box on a skid board, two cargo straps, stencilled lid
    add(new THREE.BoxGeometry(1.3, 0.12, 1.3), MT.wood(), 0, 0.06, 0); add(new THREE.BoxGeometry(1.2, 0.95, 1.2), mat('ply', { color: 0x8a7a58, rough: 0.85 }), 0, 0.6, 0);
    for (const sx of [-0.32, 0.32]) add(new THREE.BoxGeometry(0.06, 0.97, 1.22), mat('strap', { color: 0x3b3f2e, rough: 0.9 }), sx, 0.6, 0);
    add(new THREE.BoxGeometry(1.22, 0.02, 0.5), mat('stencil', { color: 0x2c2c26, rough: 0.9 }), 0, 1.08, 0); hx = 0.65; hz = 0.65; h = 1.1; r = 0.95; }
  else { const burnt = !!o.burnt, m = burnt ? MT.burnt() : mat('car' + (o.color ?? 0x4a5560), { color: o.color ?? 0x4a5560, rough: 0.5, metal: 0.3 });
    add(new THREE.BoxGeometry(1.8, 0.75, 4.3), m, 0, 0.675, 0); add(new THREE.BoxGeometry(1.6, 0.6, 2.2), burnt ? MT.burnt() : MT.glass(), 0, 1.35, 0.2);
    for (const sx of [-0.8, 0.8]) for (const sz of [-1.35, 1.35]) { const w = add(new THREE.CylinderGeometry(0.33, 0.33, 0.25, 8), MT.dark(), sx, burnt ? 0.2 : 0.33, sz); w.rotation.z = Math.PI / 2; }
    hx = 0.9; hz = 2.15; h = 1.4; r = 2.2; if (o.fire) { g.userData.fire = [addEmitter(v3(x, y + 1, z), 'fire', 0.8, 18), addEmitter(v3(x, y + 1.8, z), 'smoke', 0.5, 2)]; } }
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot)), ax = hx * c + hz * s, az = hx * s + hz * c;
  const col = addCollider(x - ax, y, z - az, x + ax, y + h, z + az);
  G.covers.push(v3(x + Math.sin(rot) * 1.2, 0, z + Math.cos(rot) * 1.2), v3(x - Math.sin(rot) * 1.2, 0, z - Math.cos(rot) * 1.2));
  const it = { kind, g, col, x, z, r, h, hit: false }; (G.smash = G.smash || []).push(it); return it;
}
function smashIt(s, v) {
  s.hit = true; const i = G.colliders.indexOf(s.col); if (i >= 0) G.colliders.splice(i, 1);
  if (s.g.userData.fire) for (const e of s.g.userData.fire) e.life = 0;
  const fx = -Math.sin(v.yaw), fz = -Math.cos(v.yaw), side = Math.sign((s.x - v.pos.x) * fz - (s.z - v.pos.z) * fx) || (Math.random() < 0.5 ? 1 : -1), rx = fz * side, rz = -fx * side;
  const sp = v.cs || 8, heavy = s.kind === 'car', light = s.kind === 'bags';
  const vel = v3(fx * sp * (heavy ? 0.75 : 0.9) + rx * rand(2, heavy ? 3 : 5), heavy ? rand(1, 2.2) : rand(2.5, light ? 4 : 5.5), fz * sp * (heavy ? 0.75 : 0.9) + rz * rand(2, heavy ? 3 : 5));
  const spin = v3(rand(-1, 1), rand(-1.5, 1.5), rand(-1, 1)).multiplyScalar(heavy ? 1.2 : 3);
  const p = s.g.position, at = p.clone().add(v3(0, 0.6, 0));
  FX.dust(at, heavy ? 10 : 7, [0.55, 0.52, 0.48], 0.6); for (let k = 0; k < 12; k++) particle({ x: at.x, y: at.y, z: at.z, vx: vel.x * 0.4 + rand(-3, 3), vy: rand(1, 5), vz: vel.z * 0.4 + rand(-3, 3), life: rand(0.6, 1.4), size: 0.25, size1: 0.15, alpha: 0.9, color: heavy ? [0.75, 0.82, 0.86] : [0.62, 0.6, 0.56], grav: 9.8 });
  SFX.metal(at); SFX.impact(at); if (heavy) SFX.metal(at); const dP = at.distanceTo(P.pos); if (dP < 35) G.shake += heavy ? 0.35 : 0.2;
  v.cs = sp * (heavy ? 0.82 : 0.92);
  if (light) { // the wall bursts: the bags go every way
    for (const ch of [...s.g.children]) { const wp = ch.getWorldPosition(v3()); s.g.remove(ch); ch.position.copy(wp); G.world.add(ch); const cv = vel.clone().add(v3(rand(-2, 2), rand(0, 2), rand(-2, 2))), cs = v3(rand(-4, 4), rand(-4, 4), rand(-4, 4)); let t = 0;
      G.updaters.push((dt) => { t += dt; cv.y -= 9.8 * dt; ch.position.addScaledVector(cv, dt); ch.rotation.x += cs.x * dt; ch.rotation.z += cs.z * dt; const gy = G.groundAt(ch.position.x, ch.position.z) + 0.15; if (ch.position.y <= gy) { ch.position.y = gy; cv.multiplyScalar(0.3); cv.y = Math.abs(cv.y) * 0.2; cs.multiplyScalar(0.3); } return t > 3; }); }
    return; }
  let t = 0, bounced = false; const rest = heavy ? 0 : 0.0;
  G.updaters.push((dt) => { t += dt; vel.y -= 9.8 * dt; p.addScaledVector(vel, dt); s.g.rotation.x += spin.x * dt; s.g.rotation.y += spin.y * dt; s.g.rotation.z += spin.z * dt;
    const gy = G.groundAt(p.x, p.z) + rest; if (p.y <= gy) { p.y = gy; if (!bounced) { bounced = true; vel.multiplyScalar(0.35); vel.y = Math.abs(vel.y) * 0.25 + 0.6; spin.multiplyScalar(0.4); FX.dust(p.clone().add(v3(0, 0.3, 0)), 4, [0.55, 0.52, 0.48], 0.4); SFX.impact(p); }
      else { vel.multiplyScalar(Math.max(0, 1 - dt * 6)); spin.multiplyScalar(Math.max(0, 1 - dt * 6)); vel.y = 0; } }
    // come to rest lying on a face rather than balanced on an edge
    if (bounced && vel.length() < 0.4) { const e = s.g.rotation; const snap = (a) => Math.round(a / (Math.PI / 2)) * (Math.PI / 2); e.x = damp(e.x, snap(e.x), 6, dt); e.z = damp(e.z, snap(e.z), 6, dt); }
    return t > 5; });
}
