/* ---------- 한강대로 and the blocks along it ---------- */
function hgAvenue() {
  const asph = hgMat('asph', { color: 0xffffff, map: 'asphalt', rough: 0.92 }), walk = hgMat('pave', { color: 0xb4ab9c, map: 'concrete', rough: 0.95 }), curb = hgMat('curb', { color: 0xc2c0ba, rough: 0.9 });
  const z0 = HG.N - 2, z1 = HG.end, L = z0 - z1, zc = (z0 + z1) / 2;
  hgMesh(new THREE.BoxGeometry(35, 0.1, L), asph, 0, 0.0, zc, { cast: false });
  for (const s of [-1, 1]) { hgMesh(new THREE.BoxGeometry(6, 0.18, L), walk, s * 20.5, 0.09, zc, { cast: false }); hgMesh(new THREE.BoxGeometry(0.3, 0.2, L), curb, s * 17.55, 0.1, zc, { cast: false }); }
  // median bus lanes (red), their kerbs, and the bus platforms
  for (const s of [-1, 1]) hgMesh(new THREE.BoxGeometry(3.4, 0.02, L), hgMat('bus', { color: 0x8c5a4c, rough: 0.9 }), s * 2.0, 0.06, zc, { cast: false });
  const plat = hgMat('plat', { color: 0xb0aca4, map: 'concrete' }), glassM = hgMat('shelter', { color: 0x9ab0bc, rough: 0.1, metal: 0.3, transparent: true, opacity: 0.45 }), frame = hgMat('frame', { color: 0x3a4248, rough: 0.5, metal: 0.4 });
  for (const zs of [-1300, -1720, -2110]) for (const s of [-1, 1]) {
    hgMesh(new THREE.BoxGeometry(2.8, 0.25, 40), plat, s * 5.2, 0.12, zs); hgMesh(new THREE.BoxGeometry(2.0, 0.08, 26), frame, s * 5.4, 3.0, zs);
    hgMesh(new THREE.BoxGeometry(0.05, 2.4, 24), glassM, s * 6.3, 1.45, zs, { cast: false }); for (let k = -2; k <= 2; k++) hgMesh(new THREE.BoxGeometry(0.1, 2.8, 0.1), frame, s * 6.3, 1.5, zs + k * 6);
  }
  // lane dashes and crossings
  { const dash = [], zeb = [];
    for (let z = z0 - 6; z > z1; z -= 9) { if (HG.junc.some(([jz, jw]) => Math.abs(z - jz) < jw / 2 + 8)) continue; for (const s of [-1, 1]) for (const x of [7.05, 10.3, 13.55]) dash.push([s * x, 0.06, z]); }
    for (const [jz, jw] of HG.junc) for (const e of [-1, 1]) for (let x = -16; x <= 16; x += 1.6) zeb.push([x, 0.07, jz + e * (jw / 2 + 3)]);
    hgInst(new THREE.BoxGeometry(0.15, 0.02, 3), hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), dash, { cast: false });
    hgInst(new THREE.BoxGeometry(0.8, 0.02, 3.2), hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), zeb, { cast: false }); }
  // cross streets
  for (const [jz, jw] of HG.junc) { hgMesh(new THREE.BoxGeometry(1400, 0.1, jw), asph, 0, 0.01, jz, { cast: false }); }
  // trees (bare in late March), lamps, signals
  const trunks = [], crowns = [], poles = [], arms = [], heads = [];
  for (let z = z0 - 8; z > z1; z -= 9) { if (HG.junc.some(([jz, jw]) => Math.abs(z - jz) < jw / 2 + 4)) continue;
    for (const s of [-1, 1]) { const sc = rand(0.85, 1.15); trunks.push([s * 19.2, 2.2 * sc, z, rand(0, TAU), 0, 0, sc]);
      // bare in late March: a crown of limbs leaning out from the top of the trunk, and thinner twigs above them
      const a0 = rand(0, TAU); for (let k = 0; k < 5; k++) { const a = a0 + k * TAU / 5 + rand(-0.3, 0.3), tilt = rand(0.45, 0.75), len = rand(2.6, 3.4) * sc, y0 = 4.0 * sc;
        crowns.push([s * 19.2 + Math.sin(a) * Math.sin(tilt) * len / 2, y0 + Math.cos(tilt) * len / 2, z + Math.cos(a) * Math.sin(tilt) * len / 2, a, tilt, 0, 1, len, 1]);
        crowns.push([s * 19.2 + Math.sin(a) * Math.sin(tilt) * len * 0.9, y0 + Math.cos(tilt) * len * 0.9 + 0.8, z + Math.cos(a) * Math.sin(tilt) * len * 0.9, a + 0.6, tilt * 0.5, 0, 0.6, len * 0.5, 0.6]); } } }
  for (let z = z0 - 15; z > z1; z -= 30) for (const s of [-1, 1]) { poles.push([s * 17.9, 5, z]); arms.push([s * 15.9, 9.8, z, 0, 0, s * 0.1]); heads.push([s * 14.2, 9.6, z]); }
  hgInst(new THREE.CylinderGeometry(0.12, 0.2, 4.4, 7), hgMat('bark', { color: 0x4a4038, rough: 1 }), trunks);
  hgInst(new THREE.CylinderGeometry(0.035, 0.07, 1, 5), hgMat('bark', { color: 0x4a4038, rough: 1 }), crowns);
  hgInst(new THREE.IcosahedronGeometry(2.6, 1), hgMat('twigs', { color: 0x5a5046, rough: 1, transparent: true, opacity: 0.22 }), trunks.map((t) => [t[0], 6.6 * t[6], t[2], t[3], 0, 0, t[6] * 1.1, t[6] * 1.0, t[6] * 1.1]), { cast: false });
  hgInst(new THREE.CylinderGeometry(0.1, 0.15, 10, 10), hgMat('pole', { color: 0x4c5458, rough: 0.5, metal: 0.4 }), poles);
  hgInst(new THREE.BoxGeometry(4, 0.12, 0.12), hgMat('pole', { color: 0x4c5458, rough: 0.5, metal: 0.4 }), arms);
  hgInst(new THREE.BoxGeometry(0.9, 0.18, 0.4), hgMat('lamphead', { color: 0xd8d8d0, emissive: 0x6a6040, ei: 0.4 }), heads, { cast: false });
  { const sig = hgMat('signal', { color: 0x2a2e30, rough: 0.5, metal: 0.4 }); const p = [], a = [], b = [];
    for (const [jz, jw] of HG.junc) for (const s of [-1, 1]) { const z = jz + s * (jw / 2 + 1.5); p.push([s * 18.2, 3.5, z]); a.push([s * 11.5, 6.8, z]); b.push([s * 8.0, 6.3, z]); }
    hgInst(new THREE.CylinderGeometry(0.14, 0.18, 7, 8), sig, p); hgInst(new THREE.BoxGeometry(13.5, 0.2, 0.2), sig, a); hgInst(new THREE.BoxGeometry(1.6, 0.5, 0.35), sig, b); }
  // subway entrances at 신용산역
  for (const [x, z] of [[21.5, -1700], [-21.5, -1702], [21.5, -1760], [-21.5, -1790]]) { hgMesh(new THREE.BoxGeometry(2.4, 0.1, 6), frame, x, 2.6, z); hgMesh(new THREE.BoxGeometry(0.06, 2.4, 6), glassM, x + Math.sign(x) * 1.2, 1.3, z, { cast: false }); hgMesh(new THREE.BoxGeometry(2.4, 0.05, 6), hgMat('stairs', { color: 0x3a3a3a }), x, 0.2, z, { cast: false }); }
}
function hgBlocks() {
  // west: 용산국제업무지구 (construction site with two finished towers), 용산역 and its mall, older commercial blocks to 신용산
  const hoard = hgMat('hoard', { color: 0xd8d4c8, rough: 0.9 });
  hgMesh(new THREE.BoxGeometry(0.3, 3, 510), hoard, -24, 1.5, -1295); addCollider(-24.2, 0, -1550, -23.8, 3, -1040, {});
  hgBuilding(-260, -1180, 52, 52, 186, 'glass', { v: 1, bare: true }); hgBuilding(-340, -1330, 48, 48, 152, 'glass', { v: 2, tint: 0xd8e0e8, bare: true });
  for (const [x, z, h] of [[-90, -1460, 96], [-310, -1500, 64]]) { hgBuilding(x, z, 24, 24, h, 'core', { bare: true });
    const crane = hgMat('crane', { color: 0xd8b020, rough: 0.6, metal: 0.3 }); hgMesh(new THREE.BoxGeometry(2, h + 40, 2), crane, x + 16, (h + 40) / 2, z); hgMesh(new THREE.BoxGeometry(70, 2.2, 2), crane, x + 16 - 18, h + 40, z); hgMesh(new THREE.BoxGeometry(6, 4, 3), crane, x + 16 + 10, h + 38, z); }
  for (let z = -1800; z > -2140; z -= rand(26, 40)) hgBuilding(-36 - rand(0, 6), z, rand(20, 28), rand(22, 32), rand(16, 34), 'mid', { shops: true, v: randi(0, 3), smoke: Math.random() < 0.25 });
  for (let z = -2195; z > HG.end + 20; z -= 34) hgBuilding(-50, z, 46, 30, rand(60, 110), 'glass', { v: 3, shops: true });
  // east: 이촌 apartment slabs by the bridge, 용산 센트럴파크, officetels, 래미안 용산 더센트럴, the white cube at 신용산
  for (let z = -1060; z > -1360; z -= 46) { hgBuilding(42, z, 34, 16, 42, 'apt', { num: String(100 + Math.round((-1060 - z) / 46) + 1), fire: Math.random() < 0.2, fireSide: -1 }); hgBuilding(90, z - 12, 40, 16, 45, 'apt', { num: String(110 + Math.round((-1060 - z) / 46)) }); }
  hgBuilding(36, -1405, 22, 26, 14, 'mid', { shops: true }); hgBuilding(36, -1440, 22, 30, 18, 'mid', { shops: true, v: 1 });
  hgBuilding(90, -1430, 40, 40, 128, 'glass', { v: 4, tint: 0xe0e4e8 }); hgBuilding(150, -1510, 40, 40, 124, 'glass', { v: 4, tint: 0xe0e4e8 });
  for (let z = -1500; z > -1640; z -= 34) hgBuilding(38, z, 26, 28, rand(22, 40), 'mid', { shops: true, v: randi(0, 3), smoke: Math.random() < 0.3 });
  for (let z = -1690; z > -1930; z -= 40) hgBuilding(38, z, 30, 32, rand(45, 75), Math.random() < 0.5 ? 'glass' : 'mid', { shops: true, v: randi(0, 3) });
  hgBuilding(52, -1985, 34, 36, 96, 'glass', { v: 6, tint: 0xdde2e6 }); hgBuilding(60, -2060, 40, 44, 70, 'mid', { shops: true, v: 1 });
  for (let z = -2090; z > -2140; z -= 30) hgBuilding(36, z, 22, 24, 20, 'mid', { shops: true });
  // the white cube: a 100 m box of fins with three big open terraces cut into it
  { const x = 112, z = -1811, s = 100, h = 108; const fm = hgMat('fac_fins', { rough: 0.6 }); fm.map = hgFacade('fins');
    for (const [y0, y1] of [[0, 36], [50, 72], [86, h]]) hgMesh(hgBoxUV(s, y1 - y0, s, 3, 3), fm, x, (y0 + y1) / 2, z);
    const core = hgMat('cubecore', { color: 0x5a6064, rough: 0.6 }); for (const [y0, y1] of [[36, 50], [72, 86]]) hgMesh(new THREE.BoxGeometry(s * 0.72, y1 - y0, s * 0.72), core, x, (y0 + y1) / 2, z);
    addCollider(x - s / 2, 0, z - s / 2, x + s / 2, h, z + s / 2, {}); }
  // farther out: the city carries on (filler towers, in the fog), 남산 and its tower to the north-east
  for (let i = 0; i < 70; i++) { const z = rand(HG.end - 300, HG.N - 60), side = pick([-1, 1]), x = side * rand(240, 900); if (Math.abs(x) < 300 && z > -1700 && side < 0) continue; if (rtDist(x, z) < 90) continue; if (Math.abs(x + 143.5 - hrOff(z)) < 80 || (z < -1500 && z > -1820 && x > -360 && x < 0)) continue; hgBuilding(x, z, rand(24, 44), rand(20, 40), rand(30, 120), pick(['apt', 'glass', 'mid']), { v: randi(0, 3), bare: true }); }
  for (let i = 0; i < 40; i++) { const z = rand(60, 700), x = rand(-1200, 1200); if (Math.abs(x) < 60 || Math.abs(x + 143.5) < 75 || Math.hypot(x - Y63.x, z + 40 - Y63.z) < 140 || (x > -130 && x < 75 && z + 40 < 480)) continue; hgBuilding(x, z + 40, rand(22, 40), rand(20, 36), rand(18, 70), pick(['apt', 'mid', 'glass']), { v: randi(0, 3), bare: true }); }
  { const st = rtAt(RT.sSta), nx = st.x + 1495, nz = st.z - 538; // 남산 and its tower, 1.6 km east of 서울역
    const hill = new THREE.Mesh(new THREE.ConeGeometry(700, 240, 14, 1), hgMat('namsan', { color: 0x4e5a44, rough: 1 })); hill.position.set(nx, 100, nz); hill.scale.z = 0.6; G.world.add(hill);
    const tw = hgMat('tower', { color: 0xdcdcd4, rough: 0.6 }); hgMesh(new THREE.CylinderGeometry(4, 9, 150, 12), tw, nx, 290, nz); hgMesh(new THREE.CylinderGeometry(14, 12, 18, 16), tw, nx, 330, nz); hgMesh(new THREE.CylinderGeometry(1.5, 2, 90, 8), tw, nx, 385, nz); }
  // the street south from the bridge past the fish market to 노량진역, the same section as the bridge decks
  { const asph = hgMat('asph', { color: 0xffffff, map: 'asphalt', rough: 0.92 }), walk = hgMat('pave', { color: 0xb4ab9c, map: 'concrete', rough: 0.95 }), curb = hgMat('curb', { color: 0xc2c0ba, rough: 0.9 }), z0 = 44, z1 = 470, L = z1 - z0, zc = (z0 + z1) / 2;
    hgMesh(new THREE.BoxGeometry(37, 0.12, L), asph, 0, 0.0, zc, { cast: false }); for (const s of [-1, 1]) { hgMesh(new THREE.BoxGeometry(6, 0.18, L), walk, s * 21.5, 0.09, zc, { cast: false }); hgMesh(new THREE.BoxGeometry(0.3, 0.2, L), curb, s * 18.55, 0.1, zc, { cast: false }); }
    hgMesh(new THREE.BoxGeometry(0.15, 0.02, L), hgMat('lineY', { color: 0xd8b040, rough: 0.6 }), -0.2, 0.07, zc, { cast: false }); hgMesh(new THREE.BoxGeometry(0.15, 0.02, L), hgMat('lineY', { color: 0xd8b040, rough: 0.6 }), 0.2, 0.07, zc, { cast: false });
    const dash = []; for (let z = z0 + 4; z < z1; z += 9) for (const s of [-1, 1]) for (const x of [4.5, 8.0, 11.5, 15.0]) dash.push([s * x, 0.07, z]); hgInst(new THREE.BoxGeometry(0.15, 0.02, 3), hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), dash, { cast: false });
    // the forecourt west of the street up to the station wall
    hgMesh(new THREE.BoxGeometry(88, 0.14, 170), walk, -65, 0.05, 330, { cast: false }); }
  // 노량진 behind us: the fish market, apartments
  hgBuilding(-62, 120, 70, 70, 26, 'mall', { tint: 0xc8d0d4 }); hgBuilding(90, 110, 40, 30, 22, 'mid', { shops: true });
  for (let x = 70; x < 400; x += 60) hgBuilding(x, 190, 36, 18, rand(40, 60), 'apt', { num: String(201 + (x - 70) / 60) });
}
/* ---------- 용산역 and its front: laid out from the aerial photo, in metres from the 용산역 junction on 한강대로 (z -1655) ----------
   west of 한강대로: 용산역 전면공원 (the park, between the avenue and 한강대로23길) → 23길 → the station forecourt → the station:
   the glass drum over the main entrance between two mall wings, the glass dome and the hypermarket to the north, the mall wing to the south,
   and the station deck over the tracks behind. North of the park, across the junction street, the twin towers of 용산 더센트럴. */
const YS = { z: -1655, g23: -107 };
function hgLawnMat(key) { const m = hgMat(key, { color: 0xffffff, rough: 1 }); if (!m.map) { m.map = ysTex('lawnT', 256, 256, (c, w, h) => { noiseFill(c, w, h, '#a39a68', 0.1, 4000, 2); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${randi(90, 120)},${randi(110, 130)},${randi(60, 80)},${rand(0.15, 0.35)})`; c.fillRect(rand(0, w), rand(0, h), rand(6, 30), rand(4, 16)); } }); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; m.map.repeat.set(1 / 6, 1 / 6); m.needsUpdate = true; } return m; }
function ysTex(key, w, h, fn) { HGT[key] = HGT[key] || canvasTex(w, h, fn); return HGT[key]; }
function hgYongsan() {
  const Z = YS.z, X23 = YS.g23;
  const asph = hgMat('asph', { color: 0xffffff, map: 'asphalt', rough: 0.92 }), pave = hgMat('ysPave', { color: 0xc9c3b6, map: 'concrete', rough: 0.95 }), paveD = hgMat('ysPaveD', { color: 0xa8a297, map: 'concrete', rough: 0.95 });
  const curb = hgMat('curb', { color: 0xc2c0ba, rough: 0.9 }), white = hgMat('ysWhite', { color: 0xe6e4de, rough: 0.6 }), steel = hgMat('ysSteel', { color: 0x5a6266, rough: 0.45, metal: 0.5 });
  const glassB = hgMat('ysGlassB', { color: 0x9fb8d0, rough: 0.12, metal: 0.55, transparent: true, opacity: 0.55 });
  const box = (w, h, d, m, x, y, z, o) => hgMesh(new THREE.BoxGeometry(w, h, d), m, x, y, z, o);
  const solid = (x0, z0, x1, z1, h, y = 0) => addCollider(Math.min(x0, x1), y, Math.min(z0, z1), Math.max(x0, x1), y + h, Math.max(z0, z1), {});
  // 한강대로23길: six lanes in front of the station, from 29길 up past the hypermarket
  { const z0 = Z + 104, z1 = Z - 150, L = z0 - z1, zc = (z0 + z1) / 2;
    box(22, 0.1, L, asph, X23, 0.02, zc, { cast: false });
    for (const s of [-1, 1]) box(0.3, 0.2, L, curb, X23 + s * 11.15, 0.1, zc, { cast: false });
    const dash = []; for (let z = z0 - 4; z > z1; z -= 9) { if (Math.abs(z - Z) < 14 || Math.abs(z - (Z + 104)) < 12) continue; for (const x of [-3.7, 3.7]) dash.push([X23 + x, 0.08, z]); }
    hgInst(new THREE.BoxGeometry(0.15, 0.02, 3), hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), dash, { cast: false });
    for (const s of [-1, 1]) box(0.2, 0.02, L, hgMat('lineY', { color: 0xd8b030, rough: 0.6 }), X23 + s * 0.2, 0.08, zc, { cast: false });
    const zeb = []; for (const zz of [Z + 10, Z - 10]) for (let x = -10; x <= 10; x += 1.6) zeb.push([X23 + x, 0.09, zz]); hgInst(new THREE.BoxGeometry(0.8, 0.02, 3.2), hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), zeb, { cast: false }); }
  // the park: 용산역 전면공원 — a lawn (still brown in March) with young trees, granite paths radiating from a round plaza
  { const x0 = X23 + 13, x1 = -24, za = Z + 9, zb = Z + 96, cx = (x0 + x1) / 2, cz = (za + zb) / 2, W = x1 - x0, D = zb - za;
    box(W, 0.3, D, pave, cx, 0.15, cz, { cast: false });
    hgMesh(hgBoxUV(W - 6, 0.12, D - 6, 1, 1), (() => { const m = hgLawnMat('ysLawn3'); m.map = HGT.lawnT.clone(); m.map.needsUpdate = true; m.map.repeat.set(1 / 6, 1 / 6); return m; })(), cx, 0.36, cz, { cast: false });
    const rx = -60, rz = Z + 53, path = hgMat('ysPath', { color: 0xcfc8b8, map: 'concrete', rough: 0.9 }), pth = [];
    for (const [px, pz] of [[x0 + 3, za + 3], [x1 - 3, za + 3], [x1 - 3, zb - 3], [x0 + 3, zb - 3], [cx, za + 3], [x0 + 3, cz + 6], [x1 - 3, cz - 10]]) pth.push([rx, 0.44, rz, px, 0.44, pz, 2.6, 0.06]);
    hgBars(pth, 1, path, { cast: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(5.5, 8.5, 40), path); ring.rotation.x = -Math.PI / 2; ring.position.set(rx, 0.45, rz); G.staticRoot.add(ring);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(5.5, 32), hgMat('ysBed', { color: 0x5a4a3a, rough: 1 })); disc.rotation.x = -Math.PI / 2; disc.position.set(rx, 0.44, rz); G.staticRoot.add(disc);
    // young trees in loose rows, bare
    const trunks = [], crowns = [];
    for (let i = 0; i < 70; i++) { const x = rand(x0 + 5, x1 - 5), z = rand(za + 5, zb - 5); if (Math.hypot(x - rx, z - rz) < 11) continue; const sc = rand(0.6, 0.9); trunks.push([x, 1.6 * sc + 0.4, z, rand(0, TAU), 0, 0, sc]); crowns.push([x, 4.6 * sc + 0.4, z, 0, 0, 0, sc * 0.8, sc * 0.9, sc * 0.8]); }
    hgInst(new THREE.CylinderGeometry(0.08, 0.14, 3.2, 6), hgMat('bark', { color: 0x4a4038, rough: 1 }), trunks);
    hgInst(new THREE.IcosahedronGeometry(2.2, 1), hgMat('twigs', { color: 0x5a5046, rough: 1, transparent: true, opacity: 0.22 }), crowns, { cast: false });
    // the wavy glass pavilion
    { const g = new THREE.Group(); g.position.set(-80, 0.4, Z + 33); g.rotation.y = 0.3; G.staticRoot.add(g);
      const gm = hgMat('ysPav', { color: 0xdfe8ee, rough: 0.08, metal: 0.2, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      for (const [ax, az, r, t0, s] of [[0, 0, 4.2, 0, 1], [8.4, 0, 4.2, Math.PI, -1]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 3.2, 24, 1, true, t0, Math.PI), gm); c.position.set(ax, 1.6, az); g.add(c);
        for (const y of [0.05, 3.2]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 6, 24, Math.PI), white); t.rotation.set(Math.PI / 2, 0, t0 - Math.PI / 2 + (s < 0 ? 0 : 0)); t.position.set(ax, y, az); g.add(t); } } }
    // the YONGSAN letters on the park's corner by the bus stop
    { const t = ysTex('ysWord', 1024, 192, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#f2f0ea'; g.font = 'bold 170px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('YONGSAN', w / 2, h / 2 + 8); });
      const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.5, roughness: 0.5, side: THREE.DoubleSide });
      for (const dx of [0, 0.12]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 1.8), m); p.position.set(X23 + 15.5 + dx, 1.4, Z + 50); p.rotation.y = -Math.PI / 2; G.staticRoot.add(p); }
      box(0.5, 0.5, 9.6, paveD, X23 + 15.6, 0.45, Z + 50); }
    solid(x0 + 4, za + 4, x0 + 4.2, zb - 4, 0.4); }
  // bus shelters on 23길 (both kerbs) and 한강대로's median stops already exist
  { const fr = hgMat('frame', { color: 0x3a4248, rough: 0.5, metal: 0.4 }), gl = hgMat('shelter', { color: 0x9ab0bc, rough: 0.1, metal: 0.3, transparent: true, opacity: 0.45 }), rf = hgMat('ysShelterRoof', { color: 0x4a5a5a, rough: 0.5 });
    for (const [x, z, s] of [[X23 + 13.2, Z + 58, 1], [X23 - 13.2, Z + 2, -1]]) { box(2.4, 0.12, 9, rf, x, 2.75, z); box(0.05, 2.4, 8.4, gl, x + s * 1.1, 1.4, z, { cast: false }); for (const k of [-1, 1]) box(0.1, 2.7, 0.1, fr, x + s * 1.1, 1.35, z + k * 4.2); box(1.8, 1.0, 0.1, hgMat('ysBench', { color: 0x8a6a4a }), x + s * 0.6, 0.5, z); } }
  // the forecourt between 23길 and the station: granite paving, a planted circle, a curved canopy
  { const x0 = X23 - 11.3, x1 = -192, za = Z + 104, zb = Z - 150; box(x0 - x1, 0.18, za - zb, pave, (x0 + x1) / 2, 0.09, (za + zb) / 2, { cast: false });
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.6, 32), paveD); ring.position.set(-148, 0.3, Z + 44); G.staticRoot.add(ring); solid(-156, Z + 36, -140, Z + 52, 0.6);
    const bed = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 0.1, 32), hgMat('ysBed', { color: 0x5a4a3a, rough: 1 })); bed.position.set(-148, 0.62, Z + 44); G.staticRoot.add(bed);
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6, x = -148 + Math.cos(a) * 4.5, z = Z + 44 + Math.sin(a) * 4.5; box(0.25, 3.5, 0.25, hgMat('bark', { color: 0x4a4038, rough: 1 }), x, 2.3, z); }
    // the white curved canopy on its thin posts, south of the entrance
    { const c = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.4, 32, 1, true, Math.PI * 0.15, Math.PI * 0.55), white); c.scale.set(1, 1, 1); const g = new THREE.Group(); g.position.set(-155, 6.5, Z + 40); G.staticRoot.add(g);
      const roof = new THREE.Mesh(new THREE.RingGeometry(13, 16, 32, 1, Math.PI * 0.15, Math.PI * 0.55), hgMat('ysWhite2', { color: 0xe6e4de, rough: 0.6, side: THREE.DoubleSide })); roof.rotation.x = -Math.PI / 2; g.add(roof);
      for (let i = 0; i <= 6; i++) { const a = Math.PI * 0.15 + i * Math.PI * 0.55 / 6; const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.5, 8), white); p.position.set(Math.cos(a) * 14.5, -3.25, -Math.sin(a) * 14.5); g.add(p); } }
    // lamps and bollards along the kerb
    const lp = [], bl = []; for (let z = zb + 6; z < za; z += 18) { lp.push([x0 - 1.5, 4.5, z]); } for (let z = zb + 2; z < za; z += 3) bl.push([x0 - 0.6, 0.45, z]);
    hgInst(new THREE.CylinderGeometry(0.09, 0.13, 9, 8), steel, lp); hgInst(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8), steel, bl, { cast: false }); }
  // ---- the station front: glass drum between two wings, raised on columns over an open, double-height entrance ----
  { const fx = -150, H = 34, drumR = 12.5, drumY = 9;
    const drumTex = ysTex('ysDrum', 512, 256, (g, w, h) => { const grd = g.createLinearGradient(0, 0, w, 0); grd.addColorStop(0, '#1f3f6a'); grd.addColorStop(0.5, '#4a7eb4'); grd.addColorStop(1, '#203e66'); g.fillStyle = grd; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 32) { g.fillStyle = '#c8d4dc'; g.fillRect(0, y, w, 3); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, y + 3, w, 10); } g.fillStyle = 'rgba(20,30,40,.6)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 2, h); });
    drumTex.wrapS = drumTex.wrapT = THREE.RepeatWrapping; drumTex.repeat.set(3, 3);
    const dm = new THREE.MeshStandardMaterial({ map: drumTex, roughness: 0.12, metalness: 0.55 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(drumR, drumR, H - drumY - 3, 48), dm); drum.position.set(fx, drumY + (H - drumY - 3) / 2, Z); drum.castShadow = drum.receiveShadow = true; G.staticRoot.add(drum);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(drumR + 0.3, drumR + 0.3, 3, 48), white); cap.position.set(fx, H - 1.5, Z); G.staticRoot.add(cap);
    const sof = new THREE.Mesh(new THREE.CylinderGeometry(drumR + 0.2, drumR + 0.2, 0.8, 48), white); sof.position.set(fx, drumY, Z); G.staticRoot.add(sof);
    // the station name round the top of the drum, facing the forecourt
    { const t = ysTex('ysName', 1024, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.font = 'bold 150px sans-serif'; g.fillText('용 산 역', w / 2, 150); g.font = '600 56px sans-serif'; g.fillText('Yongsan Station', w / 2, 225); });
      const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.4, roughness: 0.6 });
      const sign = new THREE.Mesh(new THREE.CylinderGeometry(drumR + 0.35, drumR + 0.35, 3.6, 32, 1, true, Math.PI / 2 - 0.55, 1.1), m); sign.position.set(fx, H - 4.6, Z); G.staticRoot.add(sign); }
    // columns under the drum, the glass entrance wall recessed behind them, escalators up to the concourse
    for (const dz of [-6, 6]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, drumY, 16), white); c.position.set(fx + 4, drumY / 2, Z + dz); c.castShadow = true; G.staticRoot.add(c); solid(fx + 3, Z + dz - 1.1, fx + 5.2, Z + dz + 1.1, drumY); }
    box(0.2, drumY - 0.5, 26, glassB, -170, (drumY - 0.5) / 2, Z, { cast: false }); box(0.4, 0.5, 26.4, steel, -170, drumY - 0.4, Z);
    for (const dz of [-4, 0, 4]) { hgBars([[-156, 0.2, Z + dz, -168, 8.6, Z + dz, 1.4, 0.3]], 1, hgMat('ysEsc', { color: 0x40464a, rough: 0.4, metal: 0.6 })); }
    // north wing (grey, louvred) and south wing (pale stone, with the white entrance canopy and the round stair tower)
    const louv = hgMat('ysLouvre', { rough: 0.7 }); louv.map = ysTex('ysLouvreT', 256, 512, (g, w, h) => { noiseFill(g, w, h, '#b6b8b6', 0.04, 500, 2); for (let i = 0; i < 4; i++) { const y = 40 + i * 118; g.fillStyle = '#4a4e52'; g.fillRect(28, y, w - 56, 80); g.fillStyle = '#8a8e90'; for (let k = 0; k < 80; k += 9) g.fillRect(28, y + k, w - 56, 3); } });
    hgMesh(hgBoxUV(40, H - 8, 18, 40, H - 8), louv, -176, 8 + (H - 8) / 2, Z - 21); box(40, 8, 18, hgMat('ysBase', { color: 0x9a9690, map: 'concrete' }), -176, 4, Z - 21); solid(-196, Z - 30, -156, Z - 12, H);
    const stone = hgMat('fac_mall_ys', { map: 'mall', color: 0xf0ece4, rough: 0.85 }); stone.map = hgFacade('mall');
    hgMesh(hgBoxUV(40, H + 4, 20, 10, 10), stone, -178, (H + 4) / 2, Z + 22); solid(-198, Z + 12, -158, Z + 32, H + 4);
    { const g = new THREE.Group(); g.position.set(-150, 0, Z + 26); G.staticRoot.add(g); // the white portal frame in front of the south wing
      const r = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 22), white); r.position.y = 10.5; r.castShadow = true; g.add(r);
      for (const [px, pz] of [[-6, -10], [-6, 10], [6, -10], [6, 10]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10.5, 0.5), white); c.position.set(px, 5.25, pz); g.add(c); }
      for (const pz of [-10, 10]) for (let y = 2.5; y < 10; y += 2.5) { const b = new THREE.Mesh(new THREE.BoxGeometry(12, 0.16, 0.16), white); b.position.set(0, y, pz); g.add(b); }
      const bb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.5, 11), hgMat('ysBoard', { color: 0xf4f2ee, rough: 0.8 })); bb.position.set(6.2, 6.5, -2); g.add(bb); }
    const silo = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, H - 6, 24), white); silo.position.set(-160, (H - 6) / 2, Z + 34); silo.castShadow = true; G.staticRoot.add(silo); solid(-165, Z + 29, -155, Z + 39, H - 6);
    // rooftop plant and the long glass band over the entrance
    box(18, 2.5, 50, hgMat('plant', { color: 0xa6a6a0, rough: 0.7, metal: 0.2 }), -186, H + 1.2, Z);
    solid(-198, Z - 13, -170, Z + 13, H); solid(fx - drumR, Z - drumR, fx + drumR * 0.3, Z + drumR, H, drumY); }
  // ---- the glass dome over the mall's atrium, the hypermarket and its round car-park ramp, the mall to the south ----
  { const dx = -178, dz = Z - 40, R = 22;
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 10, 48), hgMat('ysDomeBase', { color: 0xb8b4ac, map: 'concrete', rough: 0.8 })); drum.position.set(dx, 5, dz); drum.castShadow = drum.receiveShadow = true; G.staticRoot.add(drum); solid(dx - R, dz - R, dx + R, dz + R, 18);
    const lat = ysTex('ysLattice', 512, 256, (g, w, h) => { g.fillStyle = '#c4ccd0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a7276'; g.lineWidth = 3; for (let x = -h; x < w + h; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke(); g.beginPath(); g.moveTo(x, 0); g.lineTo(x - h, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
    lat.wrapS = lat.wrapT = THREE.RepeatWrapping; lat.repeat.set(4, 2);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 16, 0, TAU, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: lat, roughness: 0.25, metalness: 0.4 })); dome.scale.y = 0.42; dome.position.set(dx, 10, dz); dome.castShadow = true; G.staticRoot.add(dome);
    hgBuilding(-166, Z - 84, 34, 54, 28, 'mall', { tint: 0xd8d6d0 });
    const sky = []; for (let i = -2; i <= 2; i++) sky.push([-166, 28.7, Z - 84 + i * 9]); hgInst(new THREE.BoxGeometry(22, 0.6, 5), hgMat('ysSky', { color: 0x8aa0b0, rough: 0.2, metal: 0.4 }), sky, { cast: false });
    const ramp = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 24, 32), hgMat('ysRamp', { color: 0x9e9a92, map: 'concrete', rough: 0.9 })); ramp.position.set(-146, 12, Z - 120); ramp.castShadow = true; G.staticRoot.add(ramp); solid(-156, Z - 130, -136, Z - 110, 24);
    for (let y = 3; y < 24; y += 3) { const b = new THREE.Mesh(new THREE.CylinderGeometry(10.1, 10.1, 0.9, 32), hgMat('ysRampBand', { color: 0x3a3e40 })); b.position.set(-146, y, Z - 120); G.staticRoot.add(b); }
    hgBuilding(-225, Z - 70, 54, 100, 30, 'mall', { tint: 0xd0d4d0 });           // north wing, behind the dome
    hgBuilding(-232, Z + 62, 70, 76, 30, 'mall', { shops: true, tint: 0xe4e0d8 }); // south wing of the mall (shops on the forecourt)
    hgBuilding(-212, Z + 128, 40, 40, 22, 'mid', { shops: true, v: 2 }); }
  // ---- the station deck over the tracks: concourse and mall floors carried on columns above the platforms ----
  { const o = hrOff(Z), cx = -143.5 + o, zA = Z + 45, zB = Z - 95, W = 96, y0 = 11, y1 = 34;
    const deck = new THREE.Mesh(hgBoxUV(W, y1 - y0, zA - zB, 10, 10), (() => { const m = hgMat('fac_mall_deck', { map: 'mall', color: 0xd8d8d4, rough: 0.8 }); m.map = hgFacade('mall'); return m; })());
    deck.position.set(cx + 6, (y0 + y1) / 2, (zA + zB) / 2); deck.rotation.y = hrYaw(Z); deck.castShadow = deck.receiveShadow = true; G.staticRoot.add(deck);
    const cols = []; for (let z = zB + 6; z < zA; z += 14) for (const k of [-1, 0, 1]) { const x = -143.5 + hrOff(z) + k * 30 + 7.5; cols.push([x, y0 / 2, z]); addCollider(x - 0.6, 0, z - 0.6, x + 0.6, y0, z + 0.6, {}); }
    hgInst(new THREE.BoxGeometry(1.2, y0, 1.2), hgMat('ysCol', { color: 0x9a9690, map: 'concrete' }), cols);
  }
  // ---- north of the park across the junction: 용산 더센트럴 — a podium, the round bank pavilion on its corner, two towers ----
  { const zA = Z - 12, zB = Z - 125; const pod = hgMat('fac_mid_ys', { map: 'mid', color: 0xe0dcd4, rough: 0.85 }); pod.map = hgFacade('mid');
    hgMesh(hgBoxUV(66, 12, zA - zB, 7, 7), pod, -60, 6, (zA + zB) / 2); solid(-93, zB, -27, zA, 12);
    const rp = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 14, 32), hgMat('ysRound', { color: 0x9aa8b0, rough: 0.2, metal: 0.45 })); rp.position.set(-48, 7, Z - 32); rp.castShadow = true; G.staticRoot.add(rp);
    hgBuilding(-72, Z - 58, 32, 30, 136, 'glass', { v: 5, tint: 0xd4dce4, y: 0 }); hgBuilding(-48, Z - 102, 32, 30, 128, 'glass', { v: 5, tint: 0xd4dce4 }); }
}
/* distance from (x, z) to the route's centreline (coarse) */
function rtDist(x, z) { rtInit(); let m = 1e9; for (let i = 0; i < RT.X.length; i += 6) { const d = Math.hypot(RT.X[i] - x, RT.Z[i] - z); if (d < m) m = d; } if (z < -1005 && z > RT.z0) m = Math.min(m, Math.abs(x)); return m; }
/* a building set at an angle: w along the street, d deep, faces the street on yaw */
function hgBuildingR(x, z, w, d, h, kind, o = {}, yaw = 0) {
  const [tu, tv] = HGTILE[kind]; const fm = hgMat('fac_' + kind + (o.v || 0), { map: kind, color: o.tint || 0xffffff, rough: kind === 'glass' ? 0.25 : 0.85, metal: kind === 'glass' ? 0.35 : 0 }); fm.map = hgFacade(kind);
  let base = 0; if (o.shops) { base = 5.2; const sm = hgMat('fac_shop', { rough: 0.7 }); sm.map = hgFacade('shop'); hgMesh(hgBoxUV(d, base, w, 16, 6), sm, x, base / 2, z, { ry: yaw }); }
  hgMesh(hgBoxUV(d, h - base, w, tu, tv), fm, x, base + (h - base) / 2, z, { ry: yaw });
  hgMesh(new THREE.BoxGeometry(d + 0.5, 1.2, w + 0.5), hgMat('roof', { color: 0x76746e, map: 'concrete', rough: 0.95 }), x, h + 0.4, z, { ry: yaw, cast: false });
  if (!o.bare && w * d > 500) hgMesh(new THREE.BoxGeometry(rand(3, 6), rand(1.5, 3), rand(3, 6)), hgMat('plant', { color: 0xa6a6a0, rough: 0.7, metal: 0.2 }), x + rand(-3, 3), h + 1.6, z + rand(-3, 3), { ry: yaw });
  const r = Math.min(w, d) * 0.42; addCollider(x - r, 0, z - r, x + r, h, z + r, {});
  if (o.smoke) addEmitter(v3(x, h, z), 'smoke', 1.6, 2);
}