/* ---------- the avenue on from 삼각지: 한강대로 → 서울역 → 세종대로; same street furniture as the straight part ---------- */
function hgRoute() {
  rtInit(); const T = RT.total, S = RT.sSta;
  const asph = hgMat('asph', { color: 0xffffff, map: 'asphalt', rough: 0.92 }), walk = hgMat('pave', { color: 0xb4ab9c, map: 'concrete', rough: 0.95 }), curb = hgMat('curb', { color: 0xc2c0ba, rough: 0.9 }), busM = hgMat('bus', { color: 0x8c5a4c, rough: 0.9 });
  const J = RT.junc = [[RT.V[0], 30, '삼각지'], [RT.V[0] + 480, 16, ''], [RT.V[0] + 770, 22, '남영'], [RT.V[1], 22, '숙대입구'], [S - 300, 18, ''], [S - 70, 20, ''], [S + 236, 28, ''], [RT.V[3], 34, '숭례문'], [RT.V[3] + 300, 18, ''], [RT.V[4], 26, ''], [RT.V[4] + 150, 24, '시청'], [RT.V[4] + 690, 40, '세종로'], [T - 40, 40, '광화문']];
  const inJ = (s, pad) => J.some(([js, jw]) => Math.abs(s - js) < jw / 2 + pad);
  const road = [], walks = [], curbs = [], buses = [], cross = [];
  const TE = T - 40; for (let s = 0; s < TE; s += 5) { const a = rtAt(s), b = rtAt(Math.min(TE, s + 5)); road.push([a.x, 0, a.z, b.x, 0, b.z, 35, 0.1, 0.6]);
    for (const k of [-1, 1]) { let A = rtAt(s, k * 20.5), B = rtAt(s + 5, k * 20.5); walks.push([A.x, 0.09, A.z, B.x, 0.09, B.z, 6, 0.18, 0.6]);
      A = rtAt(s, k * 17.55); B = rtAt(s + 5, k * 17.55); curbs.push([A.x, 0.1, A.z, B.x, 0.1, B.z, 0.3, 0.2, 0.2]);
      A = rtAt(s, k * 2); B = rtAt(s + 5, k * 2); buses.push([A.x, 0.06, A.z, B.x, 0.06, B.z, 3.4, 0.02, 0.2]); } }
  for (const [js, jw] of J) { const A = rtAt(js, -320), B = rtAt(js, 320); cross.push([A.x, 0.01, A.z, B.x, 0.01, B.z, jw, 0.1]); }
  hgBars(road, 1, asph, { cast: false }); hgBars(walks, 1, walk, { cast: false }); hgBars(curbs, 1, curb, { cast: false }); hgBars(buses, 1, busM, { cast: false }); hgBars(cross, 1, asph, { cast: false });
  const dash = [], zeb = [], trunks = [], crowns = [], poles = [], arms = [], heads = [];
  for (let s = 4; s < TE; s += 9) { if (inJ(s, 8)) continue; const p0 = rtAt(s); for (const k of [-1, 1]) for (const d of [7.05, 10.3, 13.55]) { const p = rtAt(s, k * d); dash.push([p.x, 0.06, p.z, p0.yaw]); } }
  for (const [js, jw] of J) for (const e of [-1, 1]) for (let d = -16; d <= 16; d += 1.6) { const p = rtAt(js + e * (jw / 2 + 3), d); zeb.push([p.x, 0.07, p.z, p.yaw]); }
  for (let s = 6; s < TE - 30; s += 9) { if (inJ(s, 4)) continue; for (const k of [-1, 1]) { if (k > 0 && s > RT.V[3] - 360 && s < RT.V[3] + 30) continue; if (k < 0 && s > RT.V[4] + 660) continue;  const p = rtAt(s, k * 19.2), sc = rand(0.85, 1.15); trunks.push([p.x, 2.2 * sc, p.z, rand(0, TAU), 0, 0, sc]); crowns.push([p.x, 6.4 * sc, p.z, 0, 0, 0, sc * 1.1, sc, sc * 1.1]); } }
  for (let s = 15; s < TE; s += 30) for (const k of [-1, 1]) { const p = rtAt(s, k * 17.9), q = rtAt(s, k * 15.9), h = rtAt(s, k * 14.2); poles.push([p.x, 5, p.z]); arms.push([q.x, 9.8, q.z, p.yaw]); heads.push([h.x, 9.6, h.z, p.yaw]); }
  hgInst(new THREE.BoxGeometry(0.15, 0.02, 3), hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), dash, { cast: false });
  hgInst(new THREE.BoxGeometry(0.8, 0.02, 3.2), hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), zeb, { cast: false });
  hgInst(new THREE.CylinderGeometry(0.12, 0.2, 4.4, 7), hgMat('bark', { color: 0x4a4038, rough: 1 }), trunks);
  hgInst(new THREE.IcosahedronGeometry(2.6, 1), hgMat('twigs', { color: 0x5a5046, rough: 1, transparent: true, opacity: 0.22 }), crowns, { cast: false });
  hgInst(new THREE.CylinderGeometry(0.1, 0.15, 10, 10), hgMat('pole', { color: 0x4c5458, rough: 0.5, metal: 0.4 }), poles);
  hgInst(new THREE.BoxGeometry(4, 0.12, 0.12), hgMat('pole', { color: 0x4c5458, rough: 0.5, metal: 0.4 }), arms);
  hgInst(new THREE.BoxGeometry(0.9, 0.18, 0.4), hgMat('lamphead', { color: 0xd8d8d0, emissive: 0x6a6040, ei: 0.4 }), heads, { cast: false });
  { const sig = hgMat('signal', { color: 0x2a2e30, rough: 0.5, metal: 0.4 }); const p = [], a = [], b = [];
    for (const [js, jw] of J) for (const k of [-1, 1]) { const s = js + k * (jw / 2 + 1.5), P = rtAt(s, k * 18.2), A = rtAt(s, k * 11.5), B = rtAt(s, k * 8); p.push([P.x, 3.5, P.z]); a.push([A.x, 6.8, A.z, P.yaw]); b.push([B.x, 6.3, B.z, P.yaw]); }
    hgInst(new THREE.CylinderGeometry(0.14, 0.18, 7, 8), sig, p); hgInst(new THREE.BoxGeometry(13.5, 0.2, 0.2), sig, a); hgInst(new THREE.BoxGeometry(1.6, 0.5, 0.35), sig, b); }
  // the street walls: a row of buildings on each side, a taller second row behind; landmarks keep their own ground
  const V3 = RT.V[3], V4 = RT.V[4];
  const keep = RT.keep = [[S - 380, S + 260, -1], [S - 270, S + 240, 1], [V3 - 40, V3 + 60, -1], [V3 - 340, V3 + 70, 1], [V4 + 5, V4 + 225, -1], [V4 + 25, V4 + 305, 1], [V4 + 650, T + 50, -1], [T - 120, T + 50, 1]];
  const kept = (s, k) => keep.some(([a, b, kk]) => kk === k && s > a && s < b);
  const railNear = (x, z, r) => { const rx = hrX(-143.5, z); return Math.abs(x - rx) < 40 + r; };
  for (const k of [-1, 1]) for (const row of [0, 1]) { let s = 12 + rand(0, 10);
    while (s < T - 30) { const w = rand(22, 40), d = rand(18, 30), sc = s + w / 2; s += w + rand(2, 8);
      if (inJ(sc, w / 2 + 3) || kept(sc, k)) continue; if (row === 1 && Math.random() < 0.35) continue;
      const off = row === 0 ? 24.5 + d / 2 : 24.5 + 34 + rand(4, 12) + d / 2; const p = rtAt(sc, k * off);
      if (rtDist(p.x, p.z) < off - 2 || railNear(p.x, p.z, Math.max(w, d) / 2)) continue;
      const city = sc > S - 200; // north of 남영: the old centre, taller
      const h = row === 0 ? (city ? rand(28, 90) : rand(14, 40)) : (city ? rand(60, 130) : rand(30, 80)); const kind = h > 55 ? (Math.random() < 0.7 ? 'glass' : 'mid') : pick(['mid', 'mid', 'apt']);
      hgBuildingR(p.x, p.z, w, d, h, kind, { shops: row === 0 && kind !== 'apt', v: randi(0, 4), smoke: Math.random() < 0.12 }, p.yaw); } }
}
/* ---------- 서울역: the 1925 station (brick, copper dome) on its forecourt, the new station and mall over the tracks behind,
   the KTX concourse under its sweeping roof, 서울로7017 overhead to the north, 서울스퀘어 across the avenue ---------- */
function hgSeoulStation() {
  const S0 = RT.sSta, Y = rtAt(S0).yaw, P = (s, d) => rtAt(S0 + s, d);
  { const q = P(168, -30); RT.spots = RT.spots || {}; RT.spots.ss = [q.x, q.z, Y + Math.PI / 2]; }
  const box = (s, d, ad, h, al, m, y = 0, o = {}) => { const p = P(s, d); return hgMesh(new THREE.BoxGeometry(ad, h, al), m, p.x, y + h / 2, p.z, Object.assign({ ry: Y }, o)); };
  const solid = (s, d, ad, al, h, y = 0) => { const p = P(s, d), r = Math.min(ad, al) * 0.5; addCollider(p.x - r, y, p.z - r, p.x + r, y + h, p.z + r, {}); };
  const grp = (s, d, y = 0) => { const g = new THREE.Group(); const p = P(s, d); g.position.set(p.x, y, p.z); g.rotation.y = Y; G.staticRoot.add(g); return g; };
  const add = (g, geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); me.castShadow = me.receiveShadow = true; g.add(me); return me; };
  const pave = hgMat('ysPave', { color: 0xc9c3b6, map: 'concrete', rough: 0.95 }), paveD = hgMat('ysPaveD', { color: 0xa8a297, map: 'concrete', rough: 0.95 }), white = hgMat('ysWhite', { color: 0xe6e4de, rough: 0.6 });
  const glassG = hgMat('ssGlass', { color: 0x6a8a90, rough: 0.1, metal: 0.55 }), steel = hgMat('ysSteel', { color: 0x5a6266, rough: 0.45, metal: 0.5 });
  hgSeoulStation2(); // the station itself: seoulsta.js
  // ---- platforms south of the concourse, under long canopies ----
  { const pl = [], rf = [], cols = [], plat = hgMat('rplat', { color: 0xb8b2a6, map: 'concrete' }), roofM = hgMat('ssCanopy', { color: 0xd8dad8, rough: 0.5, metal: 0.3 });
    const zA = P(68, -160).z, zB = P(-340, -160).z, zC = P(-30, -160).z;
    for (let z = zA; z < zB; z += 20) { const za = z, zb = Math.min(z + 20, zB); for (const x of HR.xs) { pl.push([hrX(x, za), HR.deck + 0.55, za, hrX(x, zb), HR.deck + 0.55, zb, 3.4, 1.1]); if (za > zC) rf.push([hrX(x, za), HR.deck + 5.2, za, hrX(x, zb), HR.deck + 5.2, zb, 7, 0.2]); } }
    for (let z = zC + 6; z < zB; z += 14) for (const x of HR.xs) cols.push([hrX(x, z), HR.deck + 2.9, z]);
    hgBars(pl, 1, plat, { cast: false }); hgBars(rf, 1, roofM); hgInst(new THREE.CylinderGeometry(0.18, 0.18, 4.6, 8), steel, cols, { cast: false }); }
  // ---- 서울로7017: the old overpass turned garden walk, crossing high over the avenue and the tracks north of the station ----
  { const sA = 238, d0 = -300, d1 = 190, y = 13, A = P(sA, d0), B = P(sA, d1); const deck = hgMat('ssDeck', { color: 0xb8b4ac, map: 'concrete', rough: 0.9 });
    hgBars([[A.x, y, A.z, B.x, y, B.z, 10, 1.4]], 1, deck); hgBars([[A.x, y - 1.6, A.z, B.x, y - 1.6, B.z, 6, 1.8]], 1, deck);
    for (const e of [-1, 1]) { const a = P(sA + e * 4.8, d0), b = P(sA + e * 4.8, d1); hgBars([[a.x, y + 1.3, a.z, b.x, y + 1.3, b.z, 0.25, 1.2]], 1, hgMat('ssRail', { color: 0xd8dad6, rough: 0.4, metal: 0.3, transparent: true, opacity: 0.55 })); }
    const piers = [], pots = [], bush = []; for (let d = d0 + 10; d < d1; d += 28) { if (Math.abs(d) < 22) continue; const q = P(sA, d); piers.push([q.x, (y - 2.5) / 2, q.z]); addCollider(q.x - 1.2, 0, q.z - 1.2, q.x + 1.2, y, q.z + 1.2, {}); }
    for (let d = d0 + 6; d < d1; d += 7) { const q = P(sA + rand(-2.5, 2.5), d); pots.push([q.x, y + 1.2, q.z]); bush.push([q.x, y + 2.3, q.z, 0, 0, 0, rand(0.8, 1.2)]); }
    hgInst(new THREE.CylinderGeometry(1.2, 1.2, y - 2.5, 12), deck, piers); hgInst(new THREE.CylinderGeometry(1.3, 1.1, 1.1, 14), white, pots); hgInst(new THREE.IcosahedronGeometry(1.1, 1), hgMat('ssBush', { color: 0x4e5a3e, rough: 1 }), bush); }
  // ---- across the avenue: 서울스퀘어 (the long brown block), the police station, two towers to the south ----
  { const sq = new THREE.MeshStandardMaterial({ roughness: 0.75 }); sq.map = ysTex('ssSquare', 256, 256, (c, w, h) => { noiseFill(c, w, h, '#7c624e', 0.04, 600, 2); c.fillStyle = '#20262a'; for (let y = 6; y < h; y += 32) for (let x = 4; x < w; x += 16) c.fillRect(x, y, 10, 20); });
    const p = P(168, 84); hgMesh(hgBoxUV(48, 82, 100, 8, 8), sq, p.x, 41, p.z, { ry: Y }); hgMesh(new THREE.BoxGeometry(49, 1.5, 101), hgMat('roof', { color: 0x76746e, map: 'concrete', rough: 0.95 }), p.x, 82.6, p.z, { ry: Y }); solid(168, 84, 48, 100, 82); }
  { const b = (s, d, w, dd, h, kind, o) => { const p = P(s, d); hgBuildingR(p.x, p.z, w, dd, h, kind, o, Y); };
    b(72, 52, 40, 30, 22, 'mid', { shops: true, v: 2 }); b(-44, 62, 44, 40, 108, 'glass', { v: 6, tint: 0xd8dee4 }); b(-150, 50, 36, 28, 40, 'mid', { shops: true, v: 1 }); b(-238, 66, 46, 44, 124, 'glass', { v: 7, tint: 0xcfd8e0 }); b(10, 48, 30, 24, 30, 'mid', { shops: true, v: 3 }); }
  // the bus transfer centre in the median
  { const rf = hgMat('ysShelterRoof', { color: 0x4a5a5a, rough: 0.5 }), fr = hgMat('frame', { color: 0x3a4248, rough: 0.5, metal: 0.4 });
    for (const k of [-1, 1]) { box(50, k * 5.2, 2.6, 0.25, 70, hgMat('plat', { color: 0xb0aca4, map: 'concrete' }), 0); box(50, k * 5.4, 2.4, 0.1, 60, rf, 3.0); for (let s = 22; s <= 78; s += 8) box(s, k * 6.3, 0.1, 2.9, 0.1, fr, 0); } }
}
/* ---------- Joseon gates: granite base, a two-storey timber pavilion, hipped tile roofs with swept eaves ---------- */
function hgFrustum(wB, dB, wT, dT, h) { const g = new THREE.BoxGeometry(wB, h, dB); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * wT / wB); p.setZ(i, p.getZ(i) * dT / dB); } g.computeVertexNormals(); return g; }
function hgKTex() {
  if (HGT.kStone) return;
  HGT.kStone = canvasTex(256, 256, (c, w, h) => { noiseFill(c, w, h, '#bdb6a6', 0.07, 1400, 2); c.fillStyle = 'rgba(70,64,56,.55)'; for (let y = 0, r = 0; y < h; y += 32, r++) { c.fillRect(0, y, w, 2); for (let x = (r % 2) * 28; x < w; x += 56) c.fillRect(x, y, 2, 32); } });
  HGT.kStone.wrapS = HGT.kStone.wrapT = THREE.RepeatWrapping;
  HGT.kBody = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#9a4430'; c.fillRect(0, 0, w, h); c.fillStyle = '#3f8c70'; c.fillRect(0, 0, w, 26); c.fillStyle = '#d8b040'; for (let x = 6; x < w; x += 24) { c.beginPath(); c.arc(x, 13, 5, 0, TAU); c.fill(); } c.fillStyle = '#c84a30'; for (let x = 18; x < w; x += 24) c.fillRect(x, 9, 4, 8);
    for (let x = 0; x < w; x += 128) { c.fillStyle = '#b8402a'; c.fillRect(x, 26, 14, h - 26); c.fillStyle = '#8a5a3a'; c.fillRect(x + 20, 34, 96, h - 40); c.strokeStyle = '#c9a070'; c.lineWidth = 2; for (let k = x + 20; k < x + 116; k += 12) { c.beginPath(); c.moveTo(k, 34); c.lineTo(k, h - 6); c.stroke(); } for (let k = 40; k < h; k += 12) { c.beginPath(); c.moveTo(x + 20, k); c.lineTo(x + 116, k); c.stroke(); } } });
  HGT.kBody.wrapS = HGT.kBody.wrapT = THREE.RepeatWrapping;
  HGT.kTile = canvasTex(256, 256, (c, w, h) => { noiseFill(c, w, h, '#6c6f72', 0.06, 600, 2); c.fillStyle = 'rgba(30,32,36,.55)'; for (let x = 0; x < w; x += 10) c.fillRect(x, 0, 3, h); c.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 4; x < w; x += 10) c.fillRect(x, 0, 2, h); });
  HGT.kTile.wrapS = HGT.kTile.wrapT = THREE.RepeatWrapping;
}
/* a hipped roof with a concave fall and corners that sweep up; the ridge runs along x */
function hgKRoof(w, d, h, o = {}) {
  hgKTex(); const r = o.ridge ?? 0.45, up = o.up ?? 1.2, nx = 48, nz = 24;
  const geo = new THREE.PlaneGeometry(w, d, nx, nz); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (w / 2), v = p.getZ(i) / (d / 2), au = Math.abs(u), av = Math.abs(v);
    const mu = Math.max(0, (au - r) / (1 - r)), m = Math.max(mu, av); let y = h * Math.pow(1 - m, 1.7);
    y += up * Math.pow(Math.min(au, 1), 6) * Math.pow(av, 1.5) + up * 0.8 * Math.pow(av, 6) * Math.pow(au, 3); p.setY(i, y); }
  geo.computeVertexNormals();
  const t = HGT.kTile.clone(); t.needsUpdate = true; t.repeat.set(w / 6, d / 6); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const g = new THREE.Group();
  const top = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, side: THREE.FrontSide })); top.castShadow = top.receiveShadow = true; g.add(top);
  const under = new THREE.Mesh(geo, hgMat('kRafter', { color: 0x3c6458, rough: 0.8, side: THREE.BackSide })); under.position.y = -0.12; g.add(under);
  const rl = w * r + 1.5; const ridge = new THREE.Mesh(new THREE.BoxGeometry(rl, 0.7, 0.9), hgMat('kRidge', { color: 0x3c3f42, rough: 0.7 })); ridge.position.y = h + 0.25; g.add(ridge);
  for (const e of [-1, 1]) { const orn = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 1.0), hgMat('kRidge', { color: 0x3c3f42, rough: 0.7 })); orn.position.set(e * rl / 2, h + 0.7, 0); g.add(orn); }
  return g;
}
/* the pavilion: two storeys of red posts and green beams under two roofs. o: w1,d1,h1 (lower), w2,d2,h2 (upper) */
function hgPavilion(g, y0, o) {
  hgKTex(); const body = (w, h, d, y) => { const t = HGT.kBody.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 8, 1); const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.75, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.22 });
      const t2 = HGT.kBody.clone(); t2.needsUpdate = true; t2.wrapS = t2.wrapT = THREE.RepeatWrapping; t2.repeat.set(d / 8, 1); const m2 = new THREE.MeshStandardMaterial({ map: t2, roughness: 0.75, emissive: 0xffffff, emissiveMap: t2, emissiveIntensity: 0.22 }); const cap = hgMat('kBeam', { color: 0x2d6a56, rough: 0.8 });
      const fr = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), m), sd = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, d), m2); for (const e of [-1, 1]) { const f = fr.clone(); f.position.set(0, y + h / 2, e * (d / 2 - 0.2)); g.add(f); const q = sd.clone(); q.position.set(e * (w / 2 - 0.2), y + h / 2, 0); g.add(q); }
      const core = new THREE.Mesh(new THREE.BoxGeometry(w - 0.6, h, d - 0.6), cap); core.position.y = y + h / 2; g.add(core); };
  // a stone floor slab and a low railing on the base, then the lower storey, its roof, the upper storey and the top roof
  const fl = new THREE.Mesh(new THREE.BoxGeometry(o.w1 + 3, 0.5, o.d1 + 3), hgMat('kFloor', { color: 0x8a8070, rough: 0.9 })); fl.position.y = y0 + 0.25; g.add(fl);
  const brk = (w, d, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w + 1.6, 1.1, d + 1.6), hgMat('kBracket', { color: 0x3f8c70, rough: 0.8 })); b.position.y = y; b.castShadow = true; g.add(b); };
  body(o.w1, o.h1, o.d1, y0 + 0.5); brk(o.w1, o.d1, y0 + 0.5 + o.h1 - 0.4); const r1 = hgKRoof(o.w1 + 8, o.d1 + 7, o.rh1 ?? 3.4, { ridge: 0.3, up: 0.9 }); r1.position.y = y0 + 0.5 + o.h1 + 0.1; g.add(r1);
  const y2 = y0 + 0.5 + o.h1 + (o.gap ?? 1.4); body(o.w2, o.h2, o.d2, y2); brk(o.w2, o.d2, y2 + o.h2 - 0.4); const r2 = hgKRoof(o.w2 + 9, o.d2 + 8, o.rh2 ?? 6, { ridge: 0.5, up: 1.1 }); r2.position.y = y2 + o.h2 + 0.1; g.add(r2);
}
/* the granite base with its arched gateways (local +z faces out of the gate) */
function hgGateBase(g, w, d, h, arches) {
  hgKTex(); const t = HGT.kStone.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 8, h / 8);
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }); const b = new THREE.Mesh(hgFrustum(w, d, w - 2.4, d - 2.4, h), m); b.position.y = h / 2; b.castShadow = b.receiveShadow = true; g.add(b);
  const dark = hgMat('kArch', { color: 0x141414, rough: 1 }), rim = hgMat('kRim', { color: 0xd8d0c0, rough: 0.8 });
  for (const [x, aw, ah] of arches) for (const e of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(-aw / 2, 0); sh.lineTo(-aw / 2, ah - aw / 2); sh.absarc(0, ah - aw / 2, aw / 2, Math.PI, 0, true); sh.lineTo(aw / 2, 0); sh.lineTo(-aw / 2, 0);
    const a = new THREE.Mesh(new THREE.ShapeGeometry(sh, 16), dark); a.position.set(x, 0, e * (d / 2 - 0.4) + e * 0.02); if (e < 0) a.rotation.y = Math.PI; g.add(a);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(aw / 2 + 0.35, 0.3, 6, 20, Math.PI), rim); ring.position.set(x, ah - aw / 2, e * (d / 2 - 0.35)); g.add(ring); }
  return b;
}
/* ---------- 숭례문: on its island in the middle of the junction, facing south, its short stretches of wall curling forward ---------- */
function hgSungnyemun() {
  // from the aerial photo (≈1.1 m/px): 세종대로 comes up from 서울역 past the WEST side of the gate's park and swings into the junction
  // north of it; a one-way road runs up the EAST side; 남대문로 leaves the junction eastward. The park is a long lens, gate in its upper third.
  rtInit(); const V3 = RT.V[3], S0 = V3 - 115; const c = rtAt(S0, 71), Yr = c.yaw; const FY = 34 * Math.PI / 180; // local -z = true north (the photo's)
  const g = new THREE.Group(); g.position.set(c.x, 0, c.z); g.rotation.y = FY; G.staticRoot.add(g); g.updateMatrixWorld();
  const W = (x, z) => g.localToWorld(new THREE.Vector3(x, 0, z));
  const asph = hgMat('asph', { color: 0xffffff, map: 'asphalt', rough: 0.92 }), curbM = hgMat('curb', { color: 0xc2c0ba, rough: 0.9 }), walkP = hgMat('pave', { color: 0xb4ab9c, map: 'concrete', rough: 0.95 });
  const road = (pts, w, line) => { const bars = [], dash = []; for (let k = 0; k < pts.length - 1; k++) { const a = W(...pts[k]), b = W(...pts[k + 1]); bars.push([a.x, 0.02, a.z, b.x, 0.02, b.z, w, 0.1, w * 0.4]); if (line) dash.push([a.x, 0.075, a.z, b.x, 0.075, b.z, 0.25, 0.02, 0]); }
    hgBars(bars, 1, asph, { cast: false }); if (dash.length) hgBars(dash, 1, hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), { cast: false }); };
  // the junction north of the park, the east road, 남대문로 east, and the side street to 남대문시장 south
  { const j = new THREE.Mesh(new THREE.BoxGeometry(230, 0.1, 80), asph); j.position.set(15, 0.012, -125); j.receiveShadow = true; g.add(j); }
  road([[84, 400], [82, 200], [80, 60], [78, -80], [72, -120]], 20, true);
  road([[60, -128], [200, -165], [480, -230]], 26, true);
  // the park: kerbed lens with a paved rim, lawn inside
  const park = [[-44, -66], [-11, -80], [33, -83], [66, -77], [72, -40], [72, 171], [44, 198], [17, 193], [-11, 149], [-33, 72], [-50, -6], [-50, -50]];
  const shape = (pts, k) => { const sh = new THREE.Shape(); const cx = 10, cz = 50; pts.forEach(([x, z], n) => { const X = cx + (x - cx) * k, Z = cz + (z - cz) * k; n ? sh.lineTo(X, -Z) : sh.moveTo(X, -Z); }); return sh; };
  { const ig = new THREE.ExtrudeGeometry(shape(park, 1), { depth: 0.3, bevelEnabled: false }); ig.rotateX(-Math.PI / 2); const im = new THREE.Mesh(ig, hgMat('srIsle', { color: 0xc9c3b6, map: 'concrete', rough: 0.95 })); im.receiveShadow = true; g.add(im);
    const lg = new THREE.ExtrudeGeometry(shape(park, 0.9), { depth: 0.08, bevelEnabled: false }); lg.rotateX(-Math.PI / 2); const lm = new THREE.Mesh(lg, hgLawnMat('srLawn2')); lm.position.y = 0.3; lm.receiveShadow = true; g.add(lm);
    const kb = []; for (let k = 0; k < park.length; k++) { const a = W(...park[k]), b = W(...park[(k + 1) % park.length]); kb.push([a.x, 0.2, a.z, b.x, 0.2, b.z, 0.35, 0.4, 0.2]); } hgBars(kb, 1, curbM, { cast: false });
    // the far kerb of the east road, with its pavement
    const sw = []; for (const [a0, b0] of [[[95, 400], [93, 60]], [[93, 60], [90, -80]]]) { const a = W(...a0), b = W(...b0); sw.push([a.x, 0.09, a.z, b.x, 0.09, b.z, 6, 0.18, 0.2]); } hgBars(sw, 1, walkP, { cast: false }); }
  // the paved square south of the gate and the walk up to the arch
  const walkM = hgMat('srWalk', { color: 0xdcd8d0, map: 'concrete', rough: 0.9 });
  { const a = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 64), walkM); a.position.set(0, 0.42, 44); g.add(a); const sq = new THREE.Mesh(new THREE.BoxGeometry(56, 0.1, 22), walkM); sq.position.set(-3, 0.42, 92); g.add(sq);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(36, 0.1, 8), walkM); fr.position.set(0, 0.42, 13); g.add(fr); }
  // the gate: base 30 x 20 m, 8.5 m high, one arch; the pavilion on top
  const gate = new THREE.Group(); gate.position.set(0, 0.3, 0); g.add(gate);
  hgGateBase(gate, 30, 20, 8.5, [[0, 5.6, 7.2]]);
  hgPavilion(gate, 8.5, { w1: 22, d1: 10.5, h1: 5.2, w2: 18, d2: 7, h2: 4.4, rh1: 3.0, rh2: 5.6, gap: 1.6 });
  // the restored walls: straight runs from the ends of the base, the east one turning south along 세종대로, both stepping down to nothing
  { hgKTex(); const t = HGT.kStone.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.4, 0.7); const wm = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }), rim = hgMat('kRim', { color: 0xd8d0c0, rough: 0.8 });
    const run = (pts, h0, h1) => { let L = 0; const seg = []; for (let k = 0; k < pts.length - 1; k++) { const [ax, az] = pts[k], [bx, bz] = pts[k + 1]; seg.push([ax, az, bx, bz, Math.hypot(bx - ax, bz - az)]); L += seg[seg.length - 1][4]; }
      let d = 0; for (const [ax, az, bx, bz, l] of seg) { const n = Math.max(1, Math.round(l / 6)); for (let q = 0; q < n; q++) { const t0 = q / n, t1 = (q + 1) / n, x0 = ax + (bx - ax) * t0, z0 = az + (bz - az) * t0, x1 = ax + (bx - ax) * t1, z1 = az + (bz - az) * t1, h = h0 + (h1 - h0) * (d + l * (t0 + t1) / 2) / L, a = Math.atan2(x1 - x0, z1 - z0), ll = l / n;
          const w = new THREE.Mesh(new THREE.BoxGeometry(4, h, ll + 0.05), wm); w.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2); w.rotation.y = a; w.castShadow = w.receiveShadow = true; gate.add(w);
          const cp = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.4, ll + 0.05), rim); cp.position.set((x0 + x1) / 2, h + 0.2, (z0 + z1) / 2); cp.rotation.y = a; gate.add(cp); } d += l; } };
    run([[15, -2], [27, -2], [31, 8], [31, 46]], 6.5, 2.2); run([[-15, -2], [-28, 0], [-40, 12]], 6.5, 3); }
  // the guard post by the walk, pines round the edge, lamps
  { const gp = new THREE.Group(); gp.position.set(-12, 0.4, 24); g.add(gp); const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), hgMat('kBodyP', { color: 0x8a4430, rough: 0.8 })); b.position.y = 1.2; gp.add(b); const rf = hgKRoof(4, 4, 1.2, { ridge: 0.05, up: 0.4 }); rf.position.y = 2.3; gp.add(rf);
    const pine = hgMat('srPine', { color: 0x3a4a30, rough: 1 }), bark = hgMat('bark', { color: 0x4a4038, rough: 1 });
    for (const [x, z] of [[-30, 40], [-42, 62], [-36, 86], [24, 62], [24, 84], [-22, 70], [12, 100], [-24, 100], [-20, -30], [-38, -6], [18, -38]]) { const sc = rand(0.85, 1.2); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 5 * sc, 7), bark); tr.position.set(x, 2.5 * sc, z); g.add(tr); const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(3 * sc, 1), pine); cr.scale.set(1.3, 0.7, 1.3); cr.position.set(x, 5.8 * sc, z); cr.castShadow = true; g.add(cr); } }
  { const o = W(0, 0); addCollider(o.x - 16, 0, o.z - 16, o.x + 16, 9, o.z + 16, {}); }
  RT.gatePos = W(0, 0);
  // round it: 에티버스타워 and the blocks east of the east road, towers north of the junction and south of the park
  { const B = (x, z, w, d, h, kind, o) => { const p = W(x, z); hgBuildingR(p.x, p.z, w, d, h, kind, o, FY); };
    B(150, 95, 50, 120, 88, 'glass', { v: 8, tint: 0xd8e0e4 }); B(140, -20, 36, 50, 40, 'mid', { shops: true, v: 2 }); B(150, 220, 46, 60, 34, 'mid', { shops: true, v: 3 }); B(200, 160, 40, 40, 22, 'mid', { shops: true, v: 1 });
    B(150, -230, 50, 50, 70, 'glass', { v: 4 }); B(60, -230, 40, 50, 96, 'glass', { v: 6, tint: 0xd4dce4 }); B(-105, -230, 50, 60, 80, 'mid', { v: 3, tint: 0xe0dcd4 }); // west of 세종대로, clear of the road
    B(40, 290, 60, 50, 80, 'glass', { v: 7 }); B(130, 330, 40, 40, 60, 'mid', { v: 5 }); }
  RT.spots = RT.spots || {}; { const p = W(2, 70); RT.spots.sr = [p.x, p.z, FY]; }
}
/* ---------- 시청: 서울광장's oval lawn, the 1926 hall (now the library) with its clock tower, the glass wave of the new hall behind;
   덕수궁's wall and 대한문 across 세종대로 ---------- */
function hgCityHall() {
  rtInit(); const V4 = RT.V[4], Yr = rtAt(V4 + 20).yaw, YN = (34 - 0) * Math.PI / 180;
  const at = (s, d) => rtAt(V4 + 135 + s, d);
  const g = new THREE.Group(); const o = at(10, 92); g.position.set(o.x, 0, o.z); g.rotation.y = YN; G.staticRoot.add(g); // local -z north, +x east; plaza centre
  const add = (geo, m, x, y, z, ry = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.rotation.y = ry; me.castShadow = me.receiveShadow = true; g.add(me); return me; };
  const pave = hgMat('ysPave', { color: 0xc9c3b6, map: 'concrete', rough: 0.95 });
  add(new THREE.BoxGeometry(140, 0.2, 170), pave, 0, 0.1, 0);
  { const sh = new THREE.Shape(); sh.absellipse(0, 0, 52, 58, 0, TAU, false, 0); const lg = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false }); lg.rotateX(-Math.PI / 2); add(lg, hgLawnMat('scLawn2'), 0, 0.2, 6);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 4, 64), hgMat('curb', { color: 0xc2c0ba, rough: 0.9 })); rim.scale.set(52.4, 58.4, 30); rim.rotation.x = Math.PI / 2; rim.position.set(0, 0.32, 6); g.add(rim); }
  // the old hall: granite, four storeys, a square clock tower over the entrance, facing the plaza
  { const st = new THREE.MeshStandardMaterial({ roughness: 0.85 }); st.map = ysTex('scOld', 256, 256, (c, w, h) => { noiseFill(c, w, h, '#cfc8b8', 0.04, 800, 2); for (let y = 20; y < h; y += 64) for (let x = 10; x < w; x += 32) { c.fillStyle = '#2a3238'; c.fillRect(x, y, 14, 36); c.fillStyle = '#e4ded0'; c.fillRect(x - 2, y + 36, 18, 3); } });
    st.map.wrapS = st.map.wrapT = THREE.RepeatWrapping; const b = (w, h, d, x, y, z) => add(hgBoxUV(w, h, d, 8, 8), st, x, y + h / 2, z);
    b(64, 18, 22, -14, 0, -72); b(14, 25, 14, -14, 0, -66); b(10, 4, 10, -14, 25, -66); add(new THREE.BoxGeometry(65, 0.8, 23), hgMat('kRim', { color: 0xd8d0c0, rough: 0.8 }), -14, 18.2, -72);
    const cap = add(hgFrustum(11, 11, 3, 3, 4), hgMat('ssCopper', { color: 0x5aa894, rough: 0.5, metal: 0.3 }), -14, 31, -66); add(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 24), hgMat('ysWhite', { color: 0xe6e4de, rough: 0.6 }), -14, 22, -58.9).rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(12, 4, 3), hgMat('ssDoor', { color: 0x3a2c22, rough: 0.6 }), -14, 2, -58.6); addCollider(o.x - 30, 0, o.z - 30, o.x + 5, 1, o.z + 5, {}); }
  // the new hall: a glass wave whose front swells out over the old hall, the back stepping down
  { const sh = new THREE.Shape(); const pts = [[-48, 0], [-12, 0], [-9, 10], [-4, 22], [2, 34], [6, 44], [5, 52], [-2, 57], [-14, 59], [-30, 56], [-48, 48]]; sh.moveTo(pts[0][0], pts[0][1]); for (const [a, b] of pts.slice(1)) sh.lineTo(a, b);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 100, bevelEnabled: false, curveSegments: 4 });
    const t = ysTex('scWave', 256, 256, (c, w, h) => { const gg = c.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, '#6a8ea0'); gg.addColorStop(1, '#2e5262'); c.fillStyle = gg; c.fillRect(0, 0, w, h); c.strokeStyle = '#cfd8dc'; c.lineWidth = 2; for (let x = 0; x <= w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y <= h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } }).clone();
    t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 6, 1 / 6);
    const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.1, metalness: 0.55 }); const w = new THREE.Mesh(geo, m); w.rotation.y = -Math.PI / 2; w.position.set(36, 0, -100); w.castShadow = w.receiveShadow = true; g.add(w);
    const q = at(10, 92); addCollider(q.x - 20, 0, q.z - 20, q.x + 20, 1, q.z + 20, {}); }
  // tents and stalls along the plaza edge, lamps
  { const tent = hgMat('scTent', { color: 0xf0f0ec, rough: 0.7 }); for (let i = 0; i < 6; i++) { const x = 36 + (i % 2) * 6, z = -40 + i * 10; add(hgFrustum(5, 5, 0.2, 0.2, 2.2), tent, x, 3.3, z); add(new THREE.BoxGeometry(5, 2.2, 5), tent, x, 1.1, z); } }
  // 덕수궁: the palace wall along the west side of 세종대로, 대한문 in it, trees behind
  { const ws = hgMat('scWall', { color: 0xb8ae9c, map: 'concrete', rough: 0.9 }), tile = hgMat('kTileM', { color: 0x606366, rough: 0.8 });
    for (const [s0, s1] of [[-130, -62], [-38, 80]]) { const a = at(s0, -27), b = at(s1, -27); hgBars([[a.x, 1.6, a.z, b.x, 1.6, b.z, 1.2, 3.2]], 1, ws); hgBars([[a.x, 3.5, a.z, b.x, 3.5, b.z, 1.8, 0.6]], 1, tile); }
    const gg = new THREE.Group(); const q = at(-50, -30); gg.position.set(q.x, 0, q.z); gg.rotation.y = Yr - Math.PI / 2; G.staticRoot.add(gg); // faces east, onto the avenue
    hgKTex(); const t = HGT.kBody.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1); const bd = new THREE.Mesh(new THREE.BoxGeometry(17, 5.5, 7), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.22 })); bd.position.y = 1.2 + 2.75; gg.add(bd);
    const st = new THREE.Mesh(new THREE.BoxGeometry(19, 1.2, 9), hgMat('kFloor', { color: 0x8a8070, rough: 0.9 })); st.position.y = 0.6; gg.add(st);
    const rf = hgKRoof(24, 13, 3.6, { ridge: 0.45, up: 1.2 }); rf.position.y = 6.6; gg.add(rf);
    const trunks = [], crowns = []; for (let i = 0; i < 70; i++) { const p = at(rand(-130, 80), -rand(36, 150)); trunks.push([p.x, 3, p.z]); crowns.push([p.x, 8, p.z, 0, 0, 0, rand(1.2, 2)]); }
    hgInst(new THREE.CylinderGeometry(0.25, 0.4, 6, 7), hgMat('bark', { color: 0x4a4038, rough: 1 }), trunks); hgInst(new THREE.IcosahedronGeometry(3, 1), hgMat('twigs', { color: 0x5a5046, rough: 1, transparent: true, opacity: 0.22 }), crowns, { cast: false });
    for (let i = 0; i < 5; i++) { const p = at(rand(-110, 60), -rand(70, 140)); hgBuildingR(p.x, p.z, 18, 10, 6, 'mid', { bare: true, tint: 0x9a6a50, v: 9 }, Yr); } }
  // 더플라자 to the south of the plaza, offices round it
  { const b = (s, d, w, dd, h, kind, op) => { const p = at(s, d); hgBuildingR(p.x, p.z, w, dd, h, kind, op, p.yaw); };
    b(-110, 70, 50, 40, 82, 'apt', { v: 2, tint: 0xd8d4cc }); b(-110, 140, 44, 40, 60, 'glass', { v: 3 }); b(150, 70, 50, 40, 90, 'glass', { v: 5 }); b(150, 140, 40, 40, 70, 'mid', { v: 2 }); b(40, 180, 50, 44, 104, 'glass', { v: 6 }); b(-30, 180, 40, 40, 74, 'mid', { v: 1 }); }
  RT.spots = RT.spots || {}; { const p = at(-70, 70); RT.spots.sc = [p.x, p.z, Yr - 0.6]; }
}
/* ---------- 광화문: the plaza down the west half of 세종대로, 이순신 and 세종대왕, 세종문화회관; the gate in the palace wall,
   경복궁 behind it and 북악산 over all ---------- */
function hgGwanghwamun() {
  rtInit(); const T = RT.total, Y = rtAt(T - 20).yaw; const at = (s, d) => rtAt(s, d);
  const tile = new THREE.MeshStandardMaterial({ roughness: 0.9, color: 0xd8d4cc }); tile.map = HGT.ssTile || ysTex('ssTile', 256, 256, (c, w, h) => { noiseFill(c, w, h, '#cfcbc3', 0.04, 500, 2); });
  // the plaza: 60 m wide, from 세종로 사거리 to the gate
  const s0 = RT.V[4] + 690, s1 = T - 62; { const a = at((s0 + s1) / 2, -48); const p = new THREE.Mesh(hgBoxUV(60, 0.3, s1 - s0, 4, 4), tile); p.position.set(a.x, 0.15, a.z); p.rotation.y = Y; p.receiveShadow = true; G.staticRoot.add(p); }
  // lawns, planted strips, the long water channel by the west edge
  { const lawn = hgLawnMat('ghLawn2'); for (const [a, b, d, w] of [[T - 200, T - 110, -40, 30], [T - 420, T - 340, -62, 12], [T - 520, T - 440, -62, 12]]) { const q = at((a + b) / 2, d); hgMesh(new THREE.BoxGeometry(w, 0.2, b - a), lawn, q.x, 0.4, q.z, { ry: Y, cast: false }); }
    const water = hgMat('ghWater', { color: 0x3a5a66, rough: 0.1, metal: 0.4 }); const a = at(s0 + 20, -75), b = at(s1 - 20, -75); hgBars([[a.x, 0.32, a.z, b.x, 0.32, b.z, 1.2, 0.05]], 1, water, { cast: false });
    const trunks = [], crowns = []; for (let s = s0 + 10; s < s1; s += 12) for (const d of [-70, -26]) { const p = at(s, d); trunks.push([p.x, 2.4, p.z]); crowns.push([p.x, 6, p.z, 0, 0, 0, 1.0]); }
    hgInst(new THREE.CylinderGeometry(0.15, 0.22, 4.8, 7), hgMat('bark', { color: 0x4a4038, rough: 1 }), trunks); hgInst(new THREE.IcosahedronGeometry(2.4, 1), hgMat('twigs', { color: 0x5a5046, rough: 1, transparent: true, opacity: 0.22 }), crowns, { cast: false }); }
  const bronze = hgMat('ghBronze', { color: 0x3a3a30, rough: 0.45, metal: 0.7 }), gold = hgMat('ghGold', { color: 0xe8b848, rough: 0.28, metal: 0.6, emissive: 0x4a3008, ei: 0.6 }), stoneM = hgMat('ghStone', { color: 0xd2ccbe, map: 'concrete', rough: 0.85 });
  const grp = (s, d, ry = Y) => { const q = at(s, d); const g = new THREE.Group(); g.position.set(q.x, 0.3, q.z); g.rotation.y = ry; G.staticRoot.add(g); return g; };
  const put = (g, geo, m, x, y, z) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; g.add(me); return me; };
  // 이순신: a tall stepped plinth, the admiral standing with his sword, the turtle ship before him; fountain jets either side
  { const g = grp(s0 + 35, -48, Y); // faces south down the avenue
    put(g, new THREE.BoxGeometry(9, 1.2, 9), stoneM, 0, 0.6, 0); put(g, new THREE.BoxGeometry(6.5, 2, 6.5), stoneM, 0, 2.2, 0); put(g, hgFrustum(4.4, 4.4, 3.4, 3.4, 9), stoneM, 0, 7.7, 0); put(g, new THREE.BoxGeometry(4, 0.6, 4), stoneM, 0, 12.5, 0);
    put(g, hgFrustum(2.4, 1.8, 1.3, 1.0, 3.2), bronze, 0, 14.4, 0); put(g, new THREE.BoxGeometry(1.5, 1.8, 1.0), bronze, 0, 16.9, 0); put(g, new THREE.SphereGeometry(0.42, 12, 10), bronze, 0, 18.15, 0); put(g, new THREE.ConeGeometry(0.5, 0.5, 12), bronze, 0, 18.6, 0);
    const sw = put(g, new THREE.CylinderGeometry(0.07, 0.07, 3, 6), bronze, 0.55, 15.6, -0.6); sw.rotation.z = 0.1;
    const ship = grp(s0 + 23, -48, Y); put(ship, new THREE.BoxGeometry(2.4, 1, 6), bronze, 0, 1.4, 0); put(ship, hgFrustum(2.2, 5, 1.2, 4, 0.9), bronze, 0, 2.3, 0); put(ship, new THREE.BoxGeometry(2.6, 0.8, 0.6), stoneM, 0, 0.4, 0); }
  // 세종대왕: seated in gold on a broad plinth, facing south
  { const g = grp(s0 + 222, -48, Y); put(g, new THREE.BoxGeometry(14, 1, 10), stoneM, 0, 0.5, 0); put(g, new THREE.BoxGeometry(10, 3.2, 7), stoneM, 0, 2.6, 0);
    put(g, new THREE.BoxGeometry(3.6, 1.6, 3), gold, 0, 5, -0.3); put(g, hgFrustum(3.8, 3.4, 2.4, 1.8, 2.8), gold, 0, 7.2, -0.2); put(g, new THREE.BoxGeometry(3.4, 1.4, 1.8), gold, 0, 5.9, 1.3);
    put(g, new THREE.SphereGeometry(0.75, 16, 12), gold, 0, 9.3, -0.1); put(g, new THREE.CylinderGeometry(0.62, 0.66, 0.6, 14), gold, 0, 10.0, -0.1); for (const e of [-1, 1]) put(g, new THREE.BoxGeometry(0.5, 0.4, 1.4), gold, e * 1.05, 6.9, 0.8);
    put(g, new THREE.BoxGeometry(1.6, 0.2, 1.1), gold, 0.3, 6.9, 1.5); }
  // 세종문화회관 to the west: a long pale hall behind a deep colonnade
  { const p = at(s0 + 190, -128); hgBuildingR(p.x, p.z, 110, 50, 26, 'mid', { bare: true, tint: 0xf0ece4, v: 10 }, Y);
    const cols = []; for (let s = s0 + 140; s <= s0 + 240; s += 6) { const q = at(s, -101); cols.push([q.x, 11, q.z]); } hgInst(new THREE.BoxGeometry(1.4, 22, 1.4), hgMat('ghCol', { color: 0xe8e4dc, rough: 0.8 }), cols);
    const r = at(s0 + 190, -100); hgMesh(new THREE.BoxGeometry(4, 2, 104), hgMat('ghCol', { color: 0xe8e4dc, rough: 0.8 }), r.x, 23, r.z, { ry: Y }); }
  { const b = (s, d, w, dd, h, kind, o) => { const p = at(s, d); hgBuildingR(p.x, p.z, w, dd, h, kind, o, Y); };
    b(T - 330, -115, 80, 30, 84, 'mid', { v: 4, tint: 0xd8d6d0 }); b(T - 200, -112, 60, 40, 30, 'mid', { v: 5, tint: 0xe0dcd4 }); b(s0 + 20, -112, 40, 30, 60, 'glass', { v: 3 });
    b(s0 + 10, 58, 46, 40, 92, 'mid', { v: 2, tint: 0x9a7a62 }); b(s0 + 260, 55, 40, 34, 46, 'mid', { v: 4, tint: 0xd0ccc4 }); b(s0 + 310, 55, 36, 30, 34, 'mid', { v: 6, tint: 0xe6e2da }); b(s0 + 120, 62, 60, 40, 80, 'glass', { v: 7 }); }
  // the gate: base 50 x 14 m with three arches, the pavilion over it; the palace wall each side; 흥례문 behind; the mountains
  { const gq = at(T - 15, 0); const g = new THREE.Group(); g.position.set(gq.x, 0, gq.z); g.rotation.y = Y; G.staticRoot.add(g); // local +z faces south down the plaza
    hgGateBase(g, 50, 15, 9, [[-11, 4.8, 6.6], [0, 6, 7.6], [11, 4.8, 6.6]]); hgPavilion(g, 9, { w1: 30, d1: 11.5, h1: 5.6, w2: 26, d2: 8, h2: 4.6, rh1: 3.2, rh2: 6.4, gap: 1.8 });
    const wall = hgMat('ghWall', { color: 0xf0e6d4, map: 'concrete', rough: 0.9 }), tileM = hgMat('kTileM', { color: 0x606366, rough: 0.8 });
    for (const e of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(280, 6, 2.4), wall); w.position.set(e * 165, 3, 0); w.castShadow = true; g.add(w); const cap = new THREE.Mesh(new THREE.BoxGeometry(280, 0.8, 3.6), tileM); cap.position.set(e * 165, 6.4, 0); g.add(cap); }
    // the stone terrace in front (월대) and the haetae on their plinths
    const wd = new THREE.Mesh(new THREE.BoxGeometry(30, 1, 40), hgMat('kFloor', { color: 0x9a9284, rough: 0.9 })); wd.position.set(0, 0.5, 28); g.add(wd);
    for (const e of [-1, 1]) { const ht = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 3.6), stoneM); ht.position.set(e * 20, 1.5, 44); g.add(ht); }
    // 흥례문 and the palace beyond (back is -z here)
    const hg = new THREE.Group(); hg.position.set(0, 0, -140); g.add(hg); const hb = new THREE.Mesh(new THREE.BoxGeometry(30, 1.6, 16), hgMat('kFloor', { color: 0x8a8070, rough: 0.9 })); hb.position.y = 0.8; hg.add(hb); hgPavilion(hg, 1.6, { w1: 24, d1: 10, h1: 5, w2: 20, d2: 7, h2: 3.6 });
    for (const [x, z, w, d] of [[0, -290, 40, 20], [-60, -240, 30, 12], [60, -240, 30, 12]]) { const ph = new THREE.Group(); ph.position.set(x, 0, z); g.add(ph); const pb = new THREE.Mesh(new THREE.BoxGeometry(w + 6, 2.4, d + 6), hgMat('kFloor', { color: 0x8a8070, rough: 0.9 })); pb.position.y = 1.2; ph.add(pb); hgPavilion(ph, 2.4, { w1: w, d1: d, h1: 6, w2: w * 0.8, d2: d * 0.7, h2: 4 }); }
    const yard = new THREE.Mesh(new THREE.BoxGeometry(560, 0.3, 420), hgMat('ghYard', { color: 0xb8ae98, map: 'concrete', rough: 1 })); yard.position.set(0, 0.1, -210); yard.receiveShadow = true; g.add(yard);
    addCollider(gq.x - 26, 0, gq.z - 26, gq.x + 26, 9, gq.z + 26, {});
    const mtn = (x, z, r, h, col) => { const c0 = new THREE.Color(col).lerp(new THREE.Color(0xbcbab4), 0.45); const pts = []; for (let k = 0; k <= 24; k++) { const t = 0.04 + 0.96 * k / 24; pts.push(new THREE.Vector2(t, Math.pow(1 - t * t, 1.8))); } const geo = new THREE.LatheGeometry(pts.reverse(), 64); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const X = p.getX(i), Z = p.getZ(i), a = Math.atan2(Z, X), rr = Math.hypot(X, Z); const k = 1 + 0.14 * Math.sin(a * 3 + 1) + 0.07 * Math.sin(a * 7) ; p.setX(i, X * k); p.setZ(i, Z * k); p.setY(i, p.getY(i) * (1 + 0.12 * rr * Math.sin(a * 2 + rr * 4))); } geo.computeVertexNormals(); const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: c0, roughness: 1, fog: false, side: THREE.DoubleSide })); m.scale.set(r, h, r * 0.8); m.position.set(x, -2, z); g.add(m); };
    mtn(40, -1150, 620, 260, 0x667a58); mtn(-1000, -800, 520, 230, 0x6a7660); mtn(900, -1500, 700, 220, 0x667458); }
  RT.spots = RT.spots || {}; { const p = at(s0 + 150, -48); RT.spots.gh = [p.x, p.z, Y]; }
}
/* war: wrecks, barricades, craters and smoke along the way */
function hgWar() {
  const cars = [[-6, -120, 0.3], [11, -210, -0.2, true], [-12, -330, 0.6, true], [5, -620, -0.4], [-8, -760, 0.2, true], [13, -880, 0.5],
    [-5, -1100, 0.4, true], [9, -1210, -0.6], [-14, -1450, 0.1, true], [12, -1600, 0.9], [-3, -1820, -0.3, true], [15, -1990, 0.2], [-10, -2080, 0.7, true]];
  for (const [x, z, r, b] of cars) smashProp('car', x, z, r, { color: pick([0x8a8e92, 0x2a2c30, 0xd8d8d4, 0x5a1a1a]), burnt: !!b, fire: !!b && Math.random() < 0.5 });
  // checkpoint lines across the road: jersey units with gaps, the odd unit skewed
  for (const [z, x0, x1] of [[-230, -15, 15], [-520, -15, 15], [-1040, -16, 16], [-1700, -15, 15]]) for (let x = x0; x <= x1; x += 2.05) { if (Math.abs(x) < 1.2 || Math.random() < 0.18) continue; smashProp('jersey', x + rand(-0.15, 0.15), z + rand(-0.6, 0.6), rand(-0.12, 0.12)); }
  for (const [x, z] of [[-8, -515], [9, -1045], [-12, -1695], [14, -1705]]) for (let k = -2; k <= 2; k++) smashProp('bags', x + k * 2.1, z, 0);
  const crater = hgMat('crater', { color: 0x1c1a18, rough: 1, transparent: true, opacity: 0.75 });
  for (const [x, z, r] of [[-9, -160, 2.4], [6, -400, 3], [-3, -1150, 3.4], [10, -1500, 2.6], [-12, -1950, 3]]) { const c = new THREE.Mesh(new THREE.CircleGeometry(r, 18), crater); c.rotation.x = -Math.PI / 2; c.position.set(x, hgGround(x, z) + 0.08, z); G.world.add(c); }
  for (const [x, z] of [[-30, -1250], [60, -1620], [-60, -2000], [140, -1100]]) addEmitter(v3(x, 2, z), 'smoke', 2.2, 1);
}
