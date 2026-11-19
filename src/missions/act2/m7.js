function seoulGround(x, z) {
  const river = -9 * Math.min(smooth(clamp((z - 140) / 8, 0, 1)), smooth(clamp((520 - z) / 8, 0, 1)));
  const north = z < -300 ? (-300 - z) * 0.5 : 0;
  const hill = Math.max(0, 60 - Math.hypot(x - 230, z - 40) * 0.6);
  return river + north + hill + (river < -1 ? 0 : Math.sin(x * 0.02) * 0.2);
}
/* 북진 route: off the bridge the road bends west past 숭례문 (on its island) and swings back onto the straight 세종대로 at 시청 */
const NXK = [[-9999, 0], [-20, 0], [20, -14], [60, -24], [100, -12], [132, 0], [99999, 0]];
function nx(z) { for (let i = 1; i < NXK.length; i++) if (z < NXK[i][0]) { const [z0, x0] = NXK[i - 1], [z1, x1] = NXK[i]; return lerp(x0, x1, smooth(clamp((z - z0) / (z1 - z0), 0, 1))); } return 0; }
const NSUNG = 60; const nBump = (z) => smooth(clamp(1 - Math.abs(z - NSUNG) / 40, 0, 1));
const NX = (x, z) => x + nx(z) + Math.sign(x) * nBump(z) * 14;
function nPath(x, pts) { const out = []; for (let i = 0; i < pts.length; i++) { const [px, pz] = pts[i]; if (i > 0) { const pz0 = pts[i - 1][1]; const lo = Math.min(pz0, pz), hi = Math.max(pz0, pz); if (lo < 135 && hi > -25) { const dir = pz < pz0 ? -1 : 1; for (let z = pz0 + dir * 10; dir < 0 ? z > pz : z < pz; z += dir * 10) if (z < 135 && z > -25) out.push([NX(px === undefined ? x : lerp(pts[i - 1][0], px, (z - pz0) / (pz - pz0)), z), z]); } } out.push([NX(px, pz), pz]); } return out; }
function buildSeoul(o = {}) {
  G.groundAt = seoulGround;
  buildTerrain(1200, 220, 'concrete', 6, 0x9a9a98, 0, 100);
  buildMountains(800, 34, 0x56604e, 80, 220, false);
  addMesh(new THREE.ConeGeometry(140, 180, 8), mat('bugak', { color: 0x4e5a48, rough: 1 }), 0, 80, -470, { cast: false });
  waterPlane(0, 330, 1600, 380, -7.4, 0x34464e, false); G.waterY = -7.4;
  // avenue
  roadStrip(0, -142, 40, 244, 0);
  addBox(0, 0, -142, 3, 0.35, 236, mat('median', { color: 0x5e6a4e }), { collide: false, cast: false });
  roadRibbon(nx, (z) => 40 + nBump(z) * 26, -21, 142);
  roadRibbon(nx, () => 3, -21, NSUNG - 42, { mat: mat('median', { color: 0x5e6a4e }), lift: 0.2 }); roadRibbon(nx, () => 3, NSUNG + 42, 132, { mat: mat('median', { color: 0x5e6a4e }), lift: 0.2 });
  // 숭례문 on its island
  { const gx = nx(NSUNG); addMesh(new THREE.CylinderGeometry(1, 1, 0.3, 40).scale(13, 1, 26), mat('lawn', { map: 'grass' }), gx, 0.15, NSUNG, { cast: false });
    tradGate(gx, NSUNG, 0.62, Math.atan((nx(NSUNG + 5) - nx(NSUNG - 5)) / 10) + Math.PI); signBoard(gx, 2.6, NSUNG + 4.4, '崇禮門 숭례문', { w: 4.4, bg: '#4a2a1a', size: 54 });
    for (let a = 0; a < 36; a++) { const t = a / 36 * TAU; addBox(gx + Math.cos(t) * 13.4, 0, NSUNG + Math.sin(t) * 26, 0.4, 0.5, 0.4, MT.concrete(), { collide: false }); } }
  // 서울광장 and the city hall on the west side where 세종대로 straightens
  addMesh(new THREE.CylinderGeometry(20, 20, 0.2, 40), mat('lawn', { map: 'grass' }), -34, 0.1, -36, { cast: false });
  building(-66, -40, 24, 30, 20, { hue: 40, lit: 0.05, broken: 0.3 }); signBoard(-53.8, 15, -40, '서울특별시청', { ry: Math.PI / 2, w: 9, bg: '#3a3a3a' });
  // gate (generic palace gate)
  const gz = -275, stone = mat('gatestone', { map: 'concrete', color: 0xb4ab98 }), tile = mat('tile', { color: 0x2f3236, rough: 0.7 }), wood = mat('gatewood', { color: 0x6a2a24 });
  room(0, gz, 44, 10, 7, [{ side: 's', at: -11, w: 4.5, y1: 4.5 }, { side: 's', at: 0, w: 5.5, y1: 5.2 }, { side: 's', at: 11, w: 4.5, y1: 4.5 }, { side: 'n', at: 0, w: 5.5, y1: 5.2 }], { mat: stone, roof: true, roofMat: stone, tile: 2 });
  addBox(0, 7.3, gz, 30, 4.5, 8, wood, { collide: false }); for (let i = 0; i < 8; i++) addBox(-14 + i * 4, 7.3, gz + 4.2, 0.6, 4.5, 0.6, wood, { collide: false });
  for (const [w, y] of [[40, 11.8], [34, 13.6]]) { const r = addMesh(boxGeo(w, 0.6, 14, 2), tile, 0, y, gz); } addMesh(boxGeo(20, 2.4, 6, 2), tile, 0, 15, gz);
  // buildings along avenue
  for (const side of [-1, 1]) {
    let z = -250;
    while (z < 120) {
      const d = rand(26, 44); const cz = z + d / 2;
      if (![-180, -100, -20, 60].some((sz) => Math.abs(sz - cz) < d / 2 + 6)) {
        if (cz > -60 && cz < -14 && side < 0) { z += d + 4; continue; } const h = rand(24, 80); building(NX(side * rand(40, 46), cz), cz, rand(28, 34), d, h, { hue: pick([200, 210, 30, 220]), lit: o.lit ?? 0.04, broken: 0.35, fire: o.fires && Math.random() < 0.4 ? 2 : 0 });
      }
      z += d + rand(4, 8);
    }
  }
  // side street blocks beyond
  for (let i = 0; i < 60; i++) { const x = pick([-1, 1]) * rand(80, 300), z = rand(-300, 120); building(x, z, rand(20, 40), rand(20, 40), rand(15, 70), { hue: 210, lit: 0.05, broken: 0.3, fire: o.fires && Math.random() < 0.25 ? 1 : 0 }); }
  skyline(0, 600, 420, 60, 20, 90, 0x3a3f46, 0.08);
  // tower on hill
  const th = seoulGround(230, 40); addMesh(new THREE.CylinderGeometry(2.2, 3, 70, 10), mat('tower', { color: 0xd8d6d0 }), 230, th + 35, 40); addMesh(new THREE.CylinderGeometry(7, 5, 8, 12), mat('tower', { color: 0xd8d6d0 }), 230, th + 62, 40); addMesh(new THREE.CylinderGeometry(0.4, 0.4, 20, 6), MT.metal(), 230, th + 76, 40);
  glow(230, th + 86, 40, 0xff3020, 3);
  // bridge
  const deckM = MT.concreteD();
  addBox(0, -1, 330, 22, 1, 390, deckM, { tile: 3 });
  roadStrip(0, 330, 20, 390, 0, 0);
  for (const s of [-1, 1]) addBox(s * 10.8, 0, 330, 0.3, 1.1, 390, MT.metal(), { bullet: false });
  for (let z = 160; z < 520; z += 40) addBox(0, -8, z, 12, 7, 3, MT.concrete(), { tile: 2 });
  for (let z = 150; z < 520; z += 30) { addBox(-10.6, 0, z, 0.2, 8, 0.2, MT.metal(), { collide: false }); addBox(10.6, 0, z, 0.2, 8, 0.2, MT.metal(), { collide: false }); }
  G.onDeck = (p) => Math.abs(p.x) < 11 && p.z > 135 && p.z < 525 && p.y > -1.5;
}

/* ---------------- Seoul, north to south: 세종대로 → 시청 → 서울역 → 남영 → 용산 → 한강대교 → 노량진 ---------------- */
const SR = { river0: 1450, river1: 1790, gwang: 30, cityhall: 330, sungnye: 470, seoulSt: 620, namyeong: 900, yongsan: 1180, noryang: 1910 };
/* 경부선/1호선: beside the road from 서울역, over its own bridge (한강철교) just west of 한강대교, then straight past 노량진역 */
const TRX = -46; const trackX = (z) => z < 1380 ? srx(z) - 82 : lerp(srx(1380) - 82, TRX, smooth(clamp((z - 1380) / 60, 0, 1)));
function routeGround(x, z) {
  const k = Math.min(smooth(clamp((z - SR.river0) / 14, 0, 1)), smooth(clamp((SR.river1 - z) / 14, 0, 1)));
  return -10 * k + (k > 0.05 ? 0 : Math.sin(x * 0.02) * 0.15 + Math.sin(z * 0.013) * 0.1);
}
/* the real road bends: 세종대로 runs straight to 시청, swings south-west to 숭례문 (which sits on an island with traffic either side),
   drifts on past 서울역 and straightens out down 한강대로 to the bridge */
const SRK = [[-9999, 0], [290, 0], [380, -14], [470, -40], [540, -50], [600, -52], [660, -48], [740, -38], [800, -46], [880, -40], [950, -26], [1010, -20], [1080, -32], [1180, -36], [1300, -18], [1390, -4], [1430, 0], [99999, 0]];
function srx(z) { for (let i = 1; i < SRK.length; i++) if (z < SRK[i][0]) { const [z0, x0] = SRK[i - 1], [z1, x1] = SRK[i]; return lerp(x0, x1, smooth(clamp((z - z0) / (z1 - z0), 0, 1))); } return 0; }
const SRX_I = [[588, '서울역 교차로', '퇴계로 · 청파로'], [884, '남영 사거리', '숙대입구 · 갈월동'], [1010, '삼각지', '이태원로 · 녹사평'], [1150, '용산 교차로', '용산역 · 한강대교']];
const srBump = (z) => smooth(clamp(1 - Math.abs(z - SR.sungnye) / 55, 0, 1)); // road splits around 숭례문
const RX = (x, z) => x + srx(z) + Math.sign(x) * srBump(z) * 15;
function srPath(x, z0, z1, step = 12) { const out = []; for (let z = z0; z < z1; z += step) out.push(v3(RX(x, z), 0, z)); out.push(v3(RX(x, z1), 0, z1)); return out; }
const routeY = (x, z) => (Math.abs(x) < 11 && z > SR.river0 - 20 && z < SR.river1 + 20 ? 0 : G.groundAt(x, z));
function signBoard(x, y, z, text, o = {}) {
  const t = canvasTex(512, 128, (g, w, h) => { g.fillStyle = o.bg || '#1b3f7a'; g.fillRect(0, 0, w, h); g.fillStyle = o.fg || '#fff'; g.font = `bold ${o.size || 64}px "Noto Sans KR",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4); if (o.sub) { g.font = '26px sans-serif'; g.fillText(o.sub, w / 2, h - 18); } });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(o.w || 4, (o.w || 4) / 4), new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.35, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.y = o.ry || 0; G.world.add(m); return m;
}
/* traditional gate (숭례문/광화문 style): stone base with an arch, two-tier tiled roof */
function tradGate(x, z, s = 1, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, G.groundAt(x, z), z); g.rotation.y = ry; G.world.add(g);
  const stone = mat('gstone', { color: 0x9a948a, map: 'concrete' }), wood = mat('gwood', { color: 0x7a2a22, rough: 0.8 }), tile = mat('gtile', { color: 0x2c2f33, rough: 0.7 }), green = mat('gdan', { color: 0x3a6a5a });
  const add = (geo, m, px, py, pz) => { const me = new THREE.Mesh(geo, m); me.position.set(px * s, py * s, pz * s); me.scale.setScalar(s); me.castShadow = true; g.add(me); return me; };
  add(new THREE.BoxGeometry(30, 9, 12), stone, 0, 4.5, 0); add(new THREE.BoxGeometry(6, 6.5, 12.4), mat('gdark', { color: 0x1a1a1a }), 0, 3.25, 0);
  add(new THREE.BoxGeometry(22, 4.5, 9), wood, 0, 11.25, 0); add(new THREE.BoxGeometry(22.4, 0.6, 9.4), green, 0, 13.6, 0);
  for (let i = -3; i <= 3; i++) add(new THREE.BoxGeometry(0.6, 4.5, 0.6), mat('gpillar', { color: 0x8a2c22 }), i * 3.4, 11.25, -4.6);
  const roof = (w, d, y, h) => { const sh = new THREE.Shape(); sh.moveTo(-w / 2 - 2, 0); sh.quadraticCurveTo(-w / 4, h * 0.15, 0, h); sh.quadraticCurveTo(w / 4, h * 0.15, w / 2 + 2, 0); sh.lineTo(-w / 2 - 2, 0); const ge = new THREE.ExtrudeGeometry(sh, { depth: d + 4, bevelEnabled: false }); ge.translate(0, 0, -(d + 4) / 2); add(ge, tile, 0, y, 0); };
  roof(24, 11, 13.9, 3.2); add(new THREE.BoxGeometry(16, 3, 7), wood, 0, 18.5, 0); roof(18, 9, 20, 3.4);
  addCollider(x - 15 * s, g.position.y, z - 6 * s, x - 3 * s, g.position.y + 9 * s, z + 6 * s); addCollider(x + 3 * s, g.position.y, z - 6 * s, x + 15 * s, g.position.y + 9 * s, z + 6 * s);
  return g;
}
function makeTrainCar(len = 20, col = 0x2a5a8a) {
  const g = new THREE.Group(); const body = mat('train' + col, { color: col, rough: 0.5, metal: 0.3 }), white = mat('trainw', { color: 0xe8e8e2 }), glass = mat('traing', { color: 0x1c2a34, rough: 0.1, metal: 0.6 });
  const add = (w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = true; g.add(me); return me; };
  add(3.1, 2.9, len, white, 0, 2.3, 0); add(3.12, 0.5, len, body, 0, 1.4, 0); add(3.12, 0.25, len, body, 0, 3.3, 0);
  for (let i = 0; i < Math.floor(len / 2.4); i++) for (const sx of [-1, 1]) add(0.05, 0.9, 1.6, glass, sx * 1.57, 2.55, -len / 2 + 1.4 + i * 2.4);
  for (const sx of [-1, 1]) for (const zz of [-len / 2 + 2.2, len / 2 - 2.2]) add(0.06, 2.2, 1.3, glass, sx * 1.58, 2.0, zz);
  for (const zz of [-len / 2 + 3, len / 2 - 3]) add(2.4, 0.8, 2.6, mat('bogie', { color: 0x1a1a1a }), 0, 0.5, zz);
  return g;
}
/* 서울역: the 1925 brick station, built big (it should dwarf the convoy): copper dome, corner turrets, arched windows, clock.
   The south wing is already burning, and it comes down as the convoy passes (G.seoulCollapse). */
function buildSeoulStation() {
  const k = 2.2, z0 = 662, fx = srx(z0) - 34, x0 = fx - 8 * k;
  const brick = mat('sbrick', { map: 'brick', color: 0xd09a86 }), stone = mat('sstone', { color: 0xe2dccc, rough: 0.8 }), copper = mat('sdome', { color: 0x5f8a78, metal: 0.35, rough: 0.5 }), win = mat('swin', { color: 0x1d2830, rough: 0.2, metal: 0.5 }), burnt = mat('burnt', { color: 0x1d1b19, rough: 1 });
  const B = (lx, ly, lz, w, h, d, m, o = {}) => addBox(x0 + lx * k, ly * k, z0 + lz * k, w * k, h * k, d * k, m, o);
  const M = (geo, m, lx, ly, lz, o) => addMesh(geo.scale(k, k, k), m, x0 + lx * k, ly * k, z0 + lz * k, o);
  addMesh(boxGeo(26, 0.06, 130, 3), mat('plaza', { map: 'concrete', color: 0xb8b2a8 }), fx + 10, 0.06, z0, { cast: false });
  // north wing + centre (intact): lz -25 .. 8
  B(0, 0, -8.5, 16, 2, 33, stone); B(0, 2, -8.5, 16, 11, 33, brick, { tile: 4 }); B(0, 13, -8.5, 17, 0.8, 34, stone); B(0.1, 6.8, -8.5, 16.2, 0.4, 33.2, stone, { collide: false });
  B(9, 0, 0, 4, 15.5, 16, brick, { tile: 2 }); B(9, 15.5, 0, 4.6, 0.8, 16.6, stone);
  for (const dz of [-4.5, 0, 4.5]) { B(11.05, 0, dz, 0.12, 4.6, 3.2, win, { collide: false }); M(new THREE.CylinderGeometry(1.6, 1.6, 0.14, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), stone, 11.1, 4.6, dz); }
  { const clk = new THREE.Mesh(new THREE.CircleGeometry(1.5 * k, 24), mat('sclock', { color: 0xf2eee0, emissive: 0x302a20 })); clk.position.set(x0 + 11.12 * k, 11.5 * k, z0); clk.rotation.y = Math.PI / 2; G.world.add(clk); }
  M(new THREE.CylinderGeometry(5.2, 5.6, 3, 16), stone, 2, 15.3, 0); M(new THREE.SphereGeometry(5.6, 20, 12, 0, TAU, 0, Math.PI / 2), copper, 2, 16.8, 0);
  M(new THREE.CylinderGeometry(0.9, 1.1, 2.4, 10), stone, 2, 23.4, 0); M(new THREE.SphereGeometry(1, 10, 6, 0, TAU, 0, Math.PI / 2), copper, 2, 24.6, 0);
  B(4, 13.8, -23, 5, 3.2, 5, brick, { collide: false }); M(new THREE.SphereGeometry(2.2, 12, 8, 0, TAU, 0, Math.PI / 2), copper, 4, 17, -23);
  for (let i = -5; i <= 1; i++) { if (Math.abs(i) <= 1) continue; for (const [y, h] of [[3, 3.2], [8, 3.4]]) { B(8.06, y, i * 4.2, 0.1, h, 1.8, win, { collide: false }); B(8.1, y - 0.25, i * 4.2, 0.12, 0.25, 2.4, stone, { collide: false }); M(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), win, 8.07, y + h, i * 4.2, { cast: false }); } }
  signBoard(x0 + 11.2 * k, 8.6 * k, z0, '서 울 역', { ry: Math.PI / 2, w: 13, bg: '#2a2a2a', sub: 'SEOUL STATION', size: 70 });
  // south wing (lz 8 .. 25): a separate group so it can fall; scorched, windows glowing
  const wing = new THREE.Group(); wing.position.set(x0 - 8 * k, 0, z0 + 8 * k); G.world.add(wing); // pivot at the back-bottom edge nearest the centre
  const W = (lx, ly, lz, w, h, d, m) => { const me = new THREE.Mesh(boxGeo(w * k, h * k, d * k, 2), m); me.position.set((lx + 8) * k, (ly + h / 2) * k, (lz - 8) * k); me.castShadow = true; wing.add(me); return me; };
  W(0, 0, 16.5, 16, 2, 17, stone); W(0, 2, 16.5, 16, 11, 17, brick); W(0, 13, 16.5, 17, 0.8, 17.5, stone);
  W(4, 13.8, 23, 5, 3.2, 5, brick); { const d = new THREE.Mesh(new THREE.SphereGeometry(2.2 * k, 12, 8, 0, TAU, 0, Math.PI / 2), copper); d.position.set(12 * k, 17 * k, 15 * k); wing.add(d); }
  for (const lz of [10.5, 14.7, 18.9, 23.1]) for (const y of [3, 8]) { const g = W(8.06, y, lz, 0.1, 3.2, 1.8, Math.random() < 0.6 ? basicMat('firewin', 0xff7a30) : win); }
  addCollider(x0 - 8 * k, 0, z0 + 8 * k, x0 + 8 * k, 13 * k, z0 + 25 * k);
  const fires = [[4, 13.5, 12], [-2, 13.5, 18], [6, 8, 22], [0, 13.5, 6]]; for (const [lx, ly, lz] of fires) { const p = v3(x0 + lx * k, ly * k, z0 + lz * k); addEmitter(p, 'fire', 2.2, 18); addEmitter(p.clone().add(v3(0, 6, 0)), 'smoke', 2.6, 3); }
  const base = v3(x0, 4, z0 + 16 * k);
  const seoulDebris = () => { for (let i = 0; i < 14; i++) { const w = rand(5, 13); addMesh(boxGeo(w, rand(2, 5), rand(5, 11), 2), Math.random() < 0.7 ? brick : stone, x0 + rand(-16, 16), rand(0, 3), z0 + rand(9, 25) * k, { rot: [rand(-0.5, 0.5), rand(0, 3), rand(-0.5, 0.5)] }); } addMesh(new THREE.SphereGeometry(2.2 * k, 12, 8, 0, TAU, 0, Math.PI / 2), copper, x0 + 10, 1, z0 + 22 * k, { rot: [1.9, 0, 0.4] }); for (let i = 0; i < 9; i++) rubble(x0 + rand(-14, 14), z0 + rand(9, 25) * k, rand(2.2, 3.4)); for (let i = 0; i < 4; i++) addEmitter(v3(x0 + rand(-12, 12), 3, z0 + rand(10, 24) * k), 'fire', 2, 18); addEmitter(base.clone().add(v3(0, 10, 0)), 'smoke', 4, 4, 200); const ci = G.colliders.findIndex((c) => Math.abs(c.min.x - (x0 - 8 * k)) < 0.01 && Math.abs(c.min.z - (z0 + 8 * k)) < 0.01); if (ci >= 0) G.colliders.splice(ci, 1); };
  G.seoulCollapse = (instant) => {
    if (wing.userData.down) return; wing.userData.down = true;
    if (instant) { wing.visible = false; seoulDebris(); return; }
    explode(base.clone().add(v3(8, 8, 0)), { noPlayer: true, size: 4, radius: 2, dmg: 0, vdmg: 0 }); SFX.explosion(base, 3);
    let t = 0; G.updaters.push((dt) => { t += dt; const e = Math.min(1, t / 3.2), ee = e * e; wing.rotation.x = ee * 0.55; wing.rotation.z = -ee * 0.22; wing.position.y = -ee * 14; if (Math.random() < 0.6) FX.dust(base.clone().add(v3(rand(-15, 20), rand(0, 6), rand(-20, 20))), 26, [0.62, 0.58, 0.54], 3.5); G.shake = Math.max(G.shake, 0.35 * (1 - e)); if (e >= 1) { wing.visible = false; return true; } });
    setGameTimeout(seoulDebris, 3.2);
  };
  // KTX glass hall further south
  const gz = 752; const gx = srx(gz) - 34 - 13 * 1.3; addBox(gx, 0, gz, 26 * 1.3, 20, 56, mat('ktxglass', { color: 0x6a8aa0, rough: 0.12, metal: 0.65 }), { tile: 4 });
  for (let i = 0; i < 14; i++) addBox(gx + 16.95, 0, gz - 26 + i * 4, 0.2, 20, 0.25, stone, { collide: false });
  addBox(gx + 2, 20, gz, 40, 1.2, 62, stone, { collide: false }); signBoard(gx + 17.2, 16, gz, 'KTX 서울역', { ry: Math.PI / 2, w: 12, bg: '#1d4f8a' });
  // 서울스퀘어 across the road
  { const zs = SR.seoulSt + 10, xs = srx(zs) + 52; addBox(xs, 0, zs, 30, 46, 76, mat('sqglass', { map: 'facade:30:0.12:0.15', color: 0x9a8270 }), { tile: 6 }); signBoard(xs - 15.2, 40, zs, 'SEOUL SQUARE', { ry: -Math.PI / 2, w: 14, bg: '#3a2a20', size: 50 }); }
}
function buildNamyeong() {
  const z0 = SR.namyeong + 22, x0 = srx(z0) - 36;
  addBox(x0, 0, z0, 12, 6, 22, mat('nmyb', { map: 'brick', color: 0xc08a72 }), { tile: 2 });
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 23, 3, 1), mat('nroof', { color: 0x3a3e44, rough: 0.7 })); roof.rotation.x = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.scale.set(1, 1, 0.42); roof.position.set(x0, 7.6, z0); G.world.add(roof);
  for (let i = -3; i <= 3; i++) addBox(x0 + 6.05, 1.8, z0 + i * 3, 0.1, 2.6, 1.6, mat('swin', { color: 0x1d2830 }), { collide: false });
  signBoard(x0 + 6.2, 4.9, z0, '남영역', { ry: Math.PI / 2, w: 5, sub: '1호선' });
  addBox(x0 - 40, 0, z0, 4, 0.9, 60, MT.concrete(), { tile: 2 }); addBox(x0 - 40, 3.6, z0, 5, 0.25, 40, MT.concreteD(), { collide: false });
}
/* 용산역: a huge glass concourse with a white roof blade over the tracks, canopy over the bus bays, the mall block behind */
function buildYongsan() {
  const k = 1.5, z0 = SR.yongsan + 70, fx = srx(z0) - 34, x0 = fx - 15 * k, white = mat('ywhite', { color: 0xe8e8e4, rough: 0.5 }), glass = mat('yglass', { color: 0x5f8496, rough: 0.1, metal: 0.7 });
  addMesh(boxGeo(22, 0.06, 130, 3), mat('plaza', { map: 'concrete', color: 0xb8b2a8 }), fx + 8, 0.06, z0, { cast: false });
  addBox(x0, 0, z0, 30 * k, 24 * k, 84 * k, glass, { tile: 6 });
  for (let i = 0; i <= 30; i++) addBox(fx + 0.05, 0, z0 - 42 * k + i * 4.2 * k, 0.25, 24 * k, 0.35, white, { collide: false });
  for (const y of [8, 16]) addBox(fx + 0.1, y * k, z0, 0.25, 0.4, 84 * k, white, { collide: false });
  addBox(x0 + 4 * k, 24 * k, z0, 42 * k, 1.6, 92 * k, white, { collide: false });
  addBox(fx + 9, 7, z0, 18, 0.6, 56, white, { collide: false }); for (const dz of [-24, -8, 8, 24]) addBox(fx + 16, 0, z0 + dz, 0.6, 7, 0.6, white, { collide: true });
  signBoard(fx + 0.4, 30, z0, '용 산 역', { ry: Math.PI / 2, w: 22, bg: '#1d4f8a', sub: 'YONGSAN STATION', size: 66 });
  addBox(x0 - 50 * k, 0, z0, 44 * k, 38 * k, 110, mat('ymall', { map: 'facade:200:0.1:0.2', color: 0xa8aab0 }), { tile: 6 }); signBoard(x0 - 28 * k, 50, z0 - 30, 'I PARK MALL', { ry: Math.PI / 2, w: 16, bg: '#8a1a2a', size: 50 });
  addEmitter(v3(x0 - 10, 36, z0 + 40), 'smoke', 3, 2);
}
function parkTree(x, z, s = 1) { const y = G.groundAt(x, z); addBox(x, y, z, 0.35 * s, 3 * s, 0.35 * s, mat('trunk', { color: 0x3a2e24 }), { collide: false }); addMesh(hgTwigGeo(+(2.2 * s).toFixed(1)), hgTwigMat(), x, y + 4.6 * s, z, { rot: [0, rand(0, TAU), 0] }); }
function parkPatch(x, z, w, d) { addMesh(boxGeo(w, 0.12, d, 3), mat('lawn', { map: 'grass' }), x, 0.08, z, { cast: false }); for (let i = 0; i < Math.floor(w * d / 90); i++) parkTree(x + rand(-w / 2 + 2, w / 2 - 2), z + rand(-d / 2 + 2, d / 2 - 2), rand(0.8, 1.2)); addBox(x, 0, z, 2.4, 0.5, 0.6, mat('bench', { color: 0x5a4030 }), { collide: false }); }
function buildSeoulRoute() {
  G.groundAt = routeGround;
  buildTerrain(2800, 260, 'concrete', 6, 0x9a9a98, 0, 900);
  buildMountains(2300, 40, 0x56604e, 120, 260, false, 0, 900);
  // road drawn in short segments along the bending centreline; it widens round 숭례문
  roadStrip(0, 70, 24, 440); for (const x of [-15, 15]) addMesh(boxGeo(5, 0.2, 440, 1), MT.concrete(), x, 0.1, 70, { cast: false });
  roadRibbon(srx, (z) => 24 + srBump(z) * 30, 288, SR.river1 + 520);
  for (const sx of [-1, 1]) roadRibbon((z) => sx * 14.5, () => 5, SR.river1 + 14, SR.river1 + 520, { mat: MT.concrete(), lift: 0.18 });
  // sidewalks, broken at every junction
  { const cuts = [288, ...SRX_I.flatMap(([z]) => [z - 11, z + 11]), SR.river0 - 10]; for (let i = 0; i < cuts.length; i += 2) for (const sx of [-1, 1]) roadRibbon((z) => srx(z) + sx * (14.5 + srBump(z) * 15), () => 5, cuts[i], cuts[i + 1], { mat: MT.concrete(), lift: 0.18 }); }
  // junctions: crossing road, plain asphalt box, zebra crossings, signals, a green gantry sign
  const asph = mat('isect', { map: 'asphalt', color: 0x8a8a8a }), white = mat('zebra', { color: 0xd8d6d0, rough: 0.8 }), sig = mat('signal', { color: 0x2a2c2e, metal: 0.5 }), red = basicMat('sigred', 0xff3a20);
  for (const [z, name, sub] of SRX_I) {
    const x = srx(z), rot = Math.atan((srx(z + 1) - srx(z - 1)) / 2), c = Math.cos(rot), sn = Math.sin(rot);
    const at = (lx, lz) => [x + lx * c + lz * sn, z - lx * sn + lz * c]; // local (across, along) -> world
    roadStrip(x, z, 16, 320, rot + Math.PI / 2, 0.025);
    addMesh(boxGeo(30, 0.04, 20), asph, x, 0.05, z, { cast: false, rot: [0, rot, 0] });
    for (const sz of [-1, 1]) for (let i = -5; i <= 5; i++) { const [px, pz] = at(i * 2.2, sz * 12); addMesh(boxGeo(1.1, 0.03, 3.6), white, px, 0.07, pz, { cast: false, rot: [0, rot, 0] }); }
    for (const sx of [-1, 1]) for (let i = -3; i <= 3; i++) { const [px, pz] = at(sx * 18, i * 2.2); addMesh(boxGeo(3.6, 0.03, 1.1), white, px, 0.07, pz, { cast: false, rot: [0, rot, 0] }); }
    for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const [px, pz] = at(ax * 14.5, az * 11); addBox(px, 0, pz, 0.25, 6, 0.25, sig, { collide: true }); const [qx, qz] = at(ax * 10.5, az * 11); addMesh(boxGeo(8, 0.2, 0.2), sig, (px + qx) / 2, 5.8, (pz + qz) / 2, { rot: [0, rot, 0] }); addMesh(boxGeo(1.2, 0.45, 0.4), sig, qx, 5.6, qz, { rot: [0, rot, 0] }); if (Math.random() < 0.5) glow(qx, 5.6, qz - az * 0.25, 0xff3a20, 0.6); }
    { const [gx, gz] = at(0, -16); for (const sx of [-1, 1]) { const [px, pz] = at(sx * 13, -16); addBox(px, 0, pz, 0.4, 8, 0.4, sig); } addMesh(boxGeo(26, 0.35, 0.35), sig, gx, 7.8, gz, { rot: [0, rot, 0] }); signBoard(gx, 6.6, gz - 0.25, name, { w: 9, bg: '#1e6a3c', sub, size: 58, ry: rot + Math.PI }); }
  }
  // 경부선/1호선 tracks running beside the road on the west, 서울역 to 용산
  roadRibbon(trackX, () => 11, 560, SR.river1 + 520, { mat: mat('ballast', { color: 0x5a5650, rough: 1 }), lift: 0.08 });
  for (const off of [-84.2, -82.8, -81.2, -79.8]) roadRibbon((z) => trackX(z) + off + 82, () => 0.12, 560, SR.river1 + 520, { mat: MT.metal(), lift: 0.22, step: 6 });
  for (let z = 570; z < SR.river1 + 510; z += 24) { if (z > SR.river0 - 10 && z < SR.river1 + 10) continue; addBox(trackX(z) + 6.5, 0, z, 0.25, 6.5, 0.25, MT.metal(), { collide: false }); addBox(trackX(z) + 1, 6.3, z, 12, 0.15, 0.15, MT.metal(), { collide: false }); }
  const zones = [...SRX_I.flatMap(([z]) => [[z - 13, z + 13, 'L'], [z - 13, z + 13, 'R']]), [SR.seoulSt - 40, SR.seoulSt + 45, 'R'], [SR.cityhall - 50, SR.cityhall + 40, 'L'], [SR.sungnye - 30, SR.sungnye + 30, 'L'], [598, 790, 'L'], [SR.namyeong + 6, SR.namyeong + 40, 'L'], [SR.yongsan - 12, SR.yongsan + 150, 'L'], [SR.gwang - 20, SR.gwang + 20, 'L']];
  const blocked = (side, z) => zones.some(([a, b, s]) => s === side && z > a && z < b) || z > SR.river0 - 40; // nothing south of the river: the view back across it stays open
  for (const side of ['L', 'R']) {
    const sx = side === 'L' ? -1 : 1; let z = -150;
    while (z < 1700) {
      const d = rand(18, 30); const cz = z + d / 2;
      if (Math.abs(((cz + 40) % 140) - 70) < 8) { z += 16; continue; } // cross streets
      const stZone = side === 'R' && ((cz > 680 && cz < 760) || (cz > SR.yongsan + 20 && cz < SR.yongsan + 120));
      if (stZone) { const w = rand(16, 24); Math.random() < 0.5 ? parkPatch(srx(cz) + sx * (19 + w / 2), cz, w, d) : building(srx(cz) + sx * (19 + w / 2), cz, w, d, rand(6, 12), { lit: 0.06, broken: 0.3 }); }
      else if (!blocked(side, cz)) {
        const w = rand(14, 24), h = rand(18, 55), x = srx(cz) + sx * (19 + w / 2 + srBump(cz) * 15);
        building(x, cz, w, d, h, { lit: 0.03, broken: 0.45, fire: Math.random() < 0.3 ? (Math.random() < 0.5 ? 2 : 1) : 0, ruin: Math.random() < 0.2 });
        if (Math.random() < 0.8 && !(sx < 0 && cz > 540)) building(srx(cz) + sx * (rand(55, 75) + srBump(cz) * 15), cz + rand(-4, 4), rand(18, 30), d, rand(35, 95), { lit: 0.02, broken: 0.3, fire: Math.random() < 0.2 ? 1 : 0 });
      }
      z += d + rand(1.5, 4);
    }
  }
  // 광화문 + 광화문역
  tradGate(0, -170, 1, 0);
  room(-14, SR.gwang, 6, 4, 2.8, [{ side: 'e', at: 0, w: 2.4 }], { mat: MT.concrete() }); signBoard(-10.9, 3.4, SR.gwang, '광화문역', { ry: Math.PI / 2, w: 4, sub: '5호선 · 2번 출구' });
  // 시청: stone hall with a clock + glass wave behind, round lawn
  addMesh(new THREE.CylinderGeometry(24, 24, 0.2, 40), mat('lawn', { map: 'grass' }), srx(SR.cityhall) - 48, 0.1, SR.cityhall, { cast: false });
  building(srx(SR.cityhall) - 90, SR.cityhall - 10, 40, 22, 22, { hue: 40, lit: 0.05, broken: 0.3 }); building(srx(SR.cityhall) - 96, SR.cityhall + 26, 46, 30, 48, { hue: 210, lit: 0.04, broken: 0.6, fire: 2 });
  signBoard(srx(SR.cityhall) - 69.8, 18, SR.cityhall - 10, '서울특별시청', { ry: Math.PI / 2, w: 10, bg: '#3a3a3a' });
  { const gx = srx(SR.sungnye); addMesh(new THREE.CylinderGeometry(1, 1, 0.3, 40).scale(15, 1, 34), mat('lawn', { map: 'grass' }), gx, 0.15, SR.sungnye, { cast: false });
    tradGate(gx, SR.sungnye, 0.75, Math.atan((srx(SR.sungnye + 5) - srx(SR.sungnye - 5)) / 10)); signBoard(gx, 3, SR.sungnye - 5.2, '崇禮門 숭례문', { ry: Math.PI, w: 5, bg: '#4a2a1a', size: 54 });
    for (let a = 0; a < 40; a++) { const t = a / 40 * TAU; addBox(gx + Math.cos(t) * 15.5, 0, SR.sungnye + Math.sin(t) * 34, 0.4, 0.5, 0.4, MT.concrete(), { collide: false }); } }
  buildSeoulStation();
  buildNamyeong(); buildYongsan();
  // the river and 한강대교
  waterPlane(0, (SR.river0 + SR.river1) / 2, 2400, SR.river1 - SR.river0 + 10, -2.4, 0x34464e, true);
  const L = SR.river1 - SR.river0 + 40, cz = (SR.river0 + SR.river1) / 2;
  addBox(0, -0.7, cz, 22, 0.7, L, MT.concreteD(), { tile: 4 }); roadStrip(0, cz, 18, L, 0, 0);
  for (const sx of [-1, 1]) { addBox(sx * 10.9, 0, cz, 0.3, 1.1, L, MT.metal(), { tile: 2 }); }
  for (let zz = SR.river0 + 20; zz < SR.river1; zz += 56) addBox(0, -12, zz, 14, 11.3, 4, MT.concrete(), { collide: false });
  const steel = mat('arch', { color: 0x4a6a8a, rough: 0.5, metal: 0.5 });
  for (const sx of [-1, 1]) for (let a = 0; a < 3; a++) { const z0 = SR.river0 + 10 + a * 110, z1 = z0 + 100; let prev = null; for (let i = 0; i <= 12; i++) { const t = i / 12, p = v3(sx * 11.6, Math.sin(t * Math.PI) * 14, lerp(z0, z1, t)); if (prev) { const d = p.clone().sub(prev); const m = addMesh(boxGeo(0.6, 0.6, d.length(), 1), steel, (p.x + prev.x) / 2, (p.y + prev.y) / 2, (p.z + prev.z) / 2, { cast: true }); m.lookAt(p); } prev = p; if (i % 2 === 0 && i > 0 && i < 12) addMesh(boxGeo(0.12, p.y, 0.12, 1), steel, p.x, p.y / 2, p.z, { cast: false }); } }
  signBoard(13, 4, SR.river0 - 30, '한강대교', { ry: -Math.PI / 2, w: 5 });
  // 한강철교: a steel truss railway bridge alongside 한강대교
  { const L = SR.river1 - SR.river0 + 40, cz = (SR.river0 + SR.river1) / 2, steel = mat('rtruss', { color: 0x5a5e62, rough: 0.6, metal: 0.5 });
    addBox(TRX - 3, -0.8, cz, 16, 0.8, L, MT.concreteD(), { collide: false });
    for (let zz = SR.river0 + 20; zz < SR.river1; zz += 50) addBox(TRX - 3, -12, zz, 10, 11.2, 4, MT.concrete(), { collide: false });
    for (const sx of [-1, 1]) { const x = TRX - 3 + sx * 7.6; addMesh(boxGeo(0.5, 0.5, L, 2), steel, x, 8, cz, { cast: false }); addMesh(boxGeo(0.5, 0.5, L, 2), steel, x, 0.3, cz, { cast: false });
      for (let zz = SR.river0 - 20; zz < SR.river1 + 20; zz += 8) { addMesh(boxGeo(0.35, 8, 0.35), steel, x, 4, zz, { cast: false }); addMesh(boxGeo(0.3, 11.3, 0.3), steel, x, 4, zz + 4, { cast: false, rot: [0.78, 0, 0] }); } }
    for (let zz = SR.river0 - 20; zz < SR.river1 + 20; zz += 8) addMesh(boxGeo(15.4, 0.4, 0.4), steel, TRX - 3, 8, zz, { cast: false });
    for (const off of [-2.2, -0.8, 0.8, 2.2]) addMesh(boxGeo(0.12, 0.16, L, 1), MT.metal(), TRX + off, 0.08, cz, { cast: false }); }
  // 노량진역: road straight on the east, tracks on the west, the station between them; a gap through the building leads to the platform
  { const NZ = SR.noryang, PX = TRX + 5.4, bx = -27, stone = mat('nstone', { color: 0xc8c0b0, rough: 0.8 }), band = mat('nband', { color: 0x2a5a9a, rough: 0.4 }), dark = mat('nwin', { color: 0x1c2630, rough: 0.2, metal: 0.4 }), lit = basicMat('nlit', 0xb89060), litc = basicMat('nlitc', 0xbfe0ff);
    addMesh(boxGeo(8, 0.06, 60, 2), mat('plaza', { map: 'concrete', color: 0xb8b2a8 }), -19, 0.2, NZ, { cast: false });
    addBox(PX, 0, NZ, 4.2, 0.45, 150, MT.concrete(), { tile: 3 }); addMesh(boxGeo(0.4, 0.05, 150, 1), mat('pyellow', { color: 0xd8b830 }), PX - 1.8, 0.47, NZ, { cast: false });
    for (let z = NZ - 70; z <= NZ + 70; z += 14) addBox(PX + 1.2, 0.45, z, 0.3, 4, 0.3, MT.metal(), { collide: false });
    addBox(PX, 4.45, NZ, 5.6, 0.3, 140, mat('canopy', { color: 0x4f6a86, metal: 0.4, rough: 0.5 }), { collide: false });
    for (let z = NZ - 60; z <= NZ + 60; z += 30) signBoard(PX + 1.0, 3.2, z, '노량진  Noryangjin', { w: 4.4, bg: '#1d4f8a', size: 52, ry: -Math.PI / 2, sub: '1호선 · 평택 방면 임시 열차' });
    // station block (two halves with a walk-through at NZ), lit upper floors, blue crown, the name facing the road
    for (const [z, d] of [[NZ - 14, 22], [NZ + 14, 22]]) addBox(bx, 0, z, 16, 4.6, d, stone, { tile: 2 });
    addBox(bx, 4.6, NZ, 16, 9, 50, mat('nglassw', { color: 0x46606e, rough: 0.15, metal: 0.6 }), { tile: 3 }); addBox(bx, 13.6, NZ, 17, 1.6, 51, band);
    for (let fl = 0; fl < 3; fl++) for (let i = 0; i < 15; i++) addMesh(boxGeo(0.06, 2.2, 2.6), Math.random() < 0.4 ? lit : dark, bx + 8.04, 6.2 + fl * 2.9, NZ - 22.75 + i * 3.25, { cast: false });
    for (const dz of [-16, -9, 9, 16]) addMesh(boxGeo(0.06, 3.4, 4.2), litc, bx + 8.04, 1.7, NZ + dz, { cast: false });
    addBox(bx + 10, 4.2, NZ, 5, 0.4, 20, stone, { collide: false });
    signBoard(bx + 8.3, 11.2, NZ, '노 량 진 역', { w: 15, bg: '#1d4f8a', sub: 'NORYANGJIN STATION · 1호선', size: 70, ry: Math.PI / 2 });
    // concourse bridge over both tracks
    addBox((bx + TRX - 10) / 2, 7, NZ + 30, Math.abs(bx - TRX) + 14, 5.6, 14, stone, { collide: false }); addBox((bx + TRX - 10) / 2, 12.6, NZ + 30, Math.abs(bx - TRX) + 15, 0.8, 15, band, { collide: false });
    for (const pz of [-1, 1]) for (let i = 0; i < 5; i++) addMesh(boxGeo(2.8, 2, 0.06), Math.random() < 0.7 ? lit : dark, TRX - 8 + i * 5, 9.6, NZ + 30 + pz * 7.04, { cast: false });
    for (const px of [TRX - 9, TRX + 3.6]) addBox(px, 0, NZ + 30, 0.7, 7, 0.7, MT.concrete());
    // 노량진수산시장 by the river, west of the tracks; 63빌딩 further west on 여의도
    addBox(-120, 0, SR.river1 + 80, 70, 11, 46, mat('fishmkt', { color: 0x9aa4a8, rough: 0.6, metal: 0.2 }), { tile: 4 }); signBoard(-120, 9, SR.river1 + 56.8, '노량진수산시장', { w: 14, bg: '#2a6a7a', size: 56, ry: Math.PI });
    addBox(-620, 0, SR.river1 + 40, 34, 150, 22, mat('gold63', { color: 0xc9a040, rough: 0.2, metal: 0.8 }), { collide: false });
    // the train is still north of the river; it comes over 한강철교 when called
    G.train = []; for (let i = 0; i < 6; i++) { const c = makeTrainCar(20, 0x2a5a8a); c.position.set(TRX + 1.5, 0, SR.river0 - 260 + i * 21); G.world.add(c); G.train.push(c); }
    // low and mid-rise blocks either side, leaving the river view open
    for (let z = SR.river1 + 110; z < SR.river1 + 500; z += rand(26, 38)) { const w = rand(16, 26); building(19 + w / 2 + rand(0, 4), z, w, rand(18, 26), rand(10, 24), { hue: pick([30, 40, 200]), lit: 0.08, broken: 0.25 }); if (Math.abs(z - NZ) > 34) building(TRX - 14 - w / 2, z, w, rand(18, 26), rand(8, 18), { hue: pick([30, 40, 200]), lit: 0.08, broken: 0.25 }); }
    parkPatch(40, SR.river1 + 80, 30, 40); }
  // 한강공원 along the south bank: lawn, a footpath, rows of trees
  // the park stops at the road and at the railway, and starts past the bridge abutments
  { const z0 = SR.river1 + 24, z1 = SR.river1 + 56;
    for (const [xa, xb] of [[-600, TRX - 12], [TRX + 9, -17], [17, 600]]) { const w = xb - xa, cx = (xa + xb) / 2; addMesh(boxGeo(w, 0.12, z1 - z0, 6), mat('lawn', { map: 'grass' }), cx, 0.08, (z0 + z1) / 2, { cast: false }); addMesh(boxGeo(w, 0.14, 3, 4), MT.concrete(), cx, 0.1, z0 + 10, { cast: false }); }
    for (let x = -560; x < 560; x += 13) { if (Math.abs(x) < 22 || (x > TRX - 16 && x < TRX + 12)) continue; for (const tz of [z0 + 4, z0 + 20]) parkTree(x + rand(-3, 3), tz + rand(-2, 2)); } }
  { const g0 = G.groundAt; G.groundAt = (x, z) => (Math.abs(x) < 11 && z > SR.river0 - 20 && z < SR.river1 + 20 ? 0 : g0(x, z)); }
  // Seoul burning on the north bank: what you see from the train
  for (let i = 0; i < 70; i++) { const x = rand(-900, 900), z = rand(SR.river0 - 420, SR.river0 - 60); if (Math.abs(x - srx(z)) < 90) continue; building(x, z, rand(18, 40), rand(18, 40), rand(20, 90), { hue: pick([200, 210, 30]), lit: 0.05, broken: 0.4, fire: Math.random() < 0.45 ? 2 : 0 }); }
  for (let i = 0; i < 30; i++) { const p = v3(rand(-900, 900), rand(20, 70), rand(SR.river0 - 400, SR.river0 - 40)); addEmitter(p, 'fire', 2.2, 10); addEmitter(p.clone().add(v3(0, 10, 0)), 'smoke', 4, 1.5); glow(p.x, p.y, p.z, 0xff6a20, rand(34, 60)); }
  for (let i = 0; i < 40; i++) { const z = rand(-120, SR.river0 - 30), x = RX(pick([-1, 1]) * rand(4, 9), z); if (Math.abs(z - SR.sungnye) < 40) continue; if (Math.random() < 0.6) carProp(x, z, rand(-0.5, 0.5) + (Math.random() < 0.5 ? 0 : Math.PI), pick([0x4a5560, 0x6a2a2a, 0x2a3a5a, 0x777777]), Math.random() < 0.6, Math.random() < 0.25); else rubble(x, z, rand(0.7, 1.2)); }
  for (let z = -120; z < SR.river0 - 30; z += 30) { lampPost(RX(-13, z), z, Math.random() < 0.3); lampPost(RX(13, z + 15), z + 15, Math.random() < 0.3); }
}

/* ========== MISSION 7 「남쪽으로」 ========== */
/* the radio net that evening: every unit in the city at once. All of it goes out over the radio (unit name only); 20–30 s between calls */
const M7RADIO = {
  r1: ['수도방위사령부', '전 제대 수신하라. 금일 16시 30분부로 서부전선 및 의정부 축선 방어선이 완전히 붕괴되었다. 현재 중공군 기계화 제대와 러시아 공수군(VDV) 선봉이 북한산 우회로를 통해 서울 시내로 진입 중이다.'],
  r2: ['포병연대 화력지휘소', '백호 2, 여기는 화력지휘소. 현재 당소측 포병대대 진지 적 포격에 초토화됐다. 지원 불가! 현 위치에서 최대한 지연전 펼치고 이탈하라, 이상!'],
  r3: ['시청역 임시 대피소', '지휘소, 여기는 시청역 대피소! 민간인 3천 명이 아직 지하에 갇혀 있다! 적 보병이 출입구 코앞까지 왔다! 지원 바란다!!'],
  r4: ['수도방위사령부', '전 서울 방어 병력에게 알린다. 현 시간부로 1군단 지휘부는 통신이 두절되었다. 상급 부대의 명령은 더 이상 없다! 1군단 병사들을 포함한 전 서울 방어 병력은 당장 강북지역을 포기하고 남쪽으로 후퇴한다!'],
  r5: ['독수리 3소대', '여기는 독수리 3소대, 미아리고개 방어선이 돌파당했다! 적 보병이 진지 내부로 진입했다! 좌표 37-56-12, 아군 진지 직상방으로 진내사격을 실시하기 바란다! 반복한다, 아군 위치 바로 위로 포격하라, 이상!'],
  r6: ['지상유도반', '공군 관제소, 여기는 지상유도반! 수색역 일대 아군 거점이 적 장갑차량들에게 완전히 포위되었다! 적색 연막탄을 투척할 테니 연막 위치에 직격 폭격을 가하기 바란다! 아군 피해는 감수한다, 즉시 투하하라, 이상!'],
  r7: ['공병대대 폭파반', '성수대교 폭파 준비 완료되었으나 아군 보병 중대와 피난민 행렬이 아직 교량 중간을 건너고 있다! 적 전차 선봉이 강변북로 성수 분기점 500미터 전방까지 접근했다! 폭파 시점을 지시하기 바란다, 이상!'],
  r8: ['청룡 2소대', '여기는 청룡 2소대, 내부순환로 홍은 진출입로 방향으로 적 전차 다수를 식별했다! 시야에 포착된 것만 최소 대대급 규모다! 현궁 잔탄은 2발 남았으며, 현 병력으로는 저지가 불가능하다! 기갑여단 지원 제대는 즉시 증원하기 바란다, 이상!'],
  r9: ['대전차 소대', '청량리역 민자역사 앞 방어선의 대전차 화기 탄약이 완전히 소모되었다! 적 주력전차 전면 장갑에 타격이 들어가지 않는다! 보급 차량 추진이 불가능하다면 현 방어선은 10분 내로 붕괴된다, 즉각 화력을 지원하기 바란다, 이상!'],
  r10: ['서울월드컵경기장 대피소 경비대', '지휘소, 여기는 서울월드컵경기장 임시 대피소! 지하 주차장에 피난민 5천여 명이 수용되어 있다! 적 기계화 보병이 경기장 외곽 북측 게이트를 돌파 중이다! 현 방어 병력 1개 소대로는 감당이 불가능하다, 즉각 지원 병력을 급파하기 바란다, 이상!'],
  r11: ['방공소대', '방공소대에서 보고한다! 신궁 재장전 시간조차 확보되지 않는다! 적 공격헬기 편대가 상암 DMC 고층 건물 사이로 저공 침투하며 로켓을 쏟아붓고 있다! 옥상 방공진지 대부분이 무력화되었다, 대공 엄호를 지원하기 바란다, 이상!'],
  r12: ['남산 관측소', '여기는 남산서울타워 관측소, 상공을 주시하라! 적 수송기 편대가 구름을 뚫고 동대문디자인플라자(DDP)와 훈련원공원 일대에 공수부대를 투하 중이다! 도심 한복판의 후방 병참선이 차단될 위기다, 상급 부대는 예비대를 즉각 투입하기 바란다, 이상!'],
  r13: ['DDP 대피소 통제반', '여기는 동대문디자인플라자 지하 임시 대피소! 상부 공원에 착륙한 적 공수부대가 지하 연결 통로로 진입을 시도하고 있다! 민간인 후송 차량 접근이 차단되었다! 인근 기동타격대는 즉시 외곽을 타격하기 바란다, 이상!'],
  r14: ['3중대 생존병', '여기는 3중대… 왕십리 교차로 교전에서 중대장 이하 소대장 전원이 전사했다! 현재 생존 인원은 본관 포함 7명뿐이다! 상급 부대는 다음 작전 지시를 하달하기 바란다, 이상!'],
  r15: ['사단 통신대', '전 주파수 수신하라! 청와대 인근 수도방위 지휘소가 직격탄을 맞았다! 참모장 이하 지휘부 전원이 연락 두절되었다! 현 시간부로 각 제대 선임 부대장이 지휘권을 승계하기 바란다, 이상!'],
  r16: ['1소대 무전병', '2소대, 2소대 응답하라! 종로타워 인근 교신 상태를 확인하기 바란다! 2소대 무전병, 수신 중이라면 즉시 응답하라! …총성 외에 아무것도 들리지 않는다, 이상.'],
  r17: ['지하철 방어제대', '지하철 2호선 건대입구에서 성수 구간 선로를 따라 적 특작부대가 우회 침투했다! 전방 방어선 후미에서 사격이 가해지고 있다! 전 병력 후방 경계 태세로 전환하라, 역 출구로 적이 올라오고 있다, 이상!'],
  r18: ['국립중앙박물관 대피소 경비소대', '여기는 국립중앙박물관 임시 대피소! 서빙고역 방면에서 접근한 적 장갑차량이 박물관 정문 바리케이드를 포격하고 있다! 내부에 시민 수천 명이 고립되었다! 대전차 화력 지원을 요청한다, 조속히 증원하라, 이상!'],
  r19: ['의무후송반', '여기는 의무후송반, 임시 야전병원이 차려진 경희대학교 평화의전당 진입로에서 후송 차량이 피격당해 기동이 불가능한 상태다! 중상자 12명이 탑승해 있으나 사방이 적군이라 고립되었다! 근접 엄호 병력을 급파하기 바란다, 이상!'],
  r20: ['한강 도하 통제소', '적 포병의 집중 포격으로 양화대교와 마포대교 상판이 붕괴되었다! 서부 지역 잔류 병력의 중앙 도하가 차단되었다! 생존 병력은 즉시 동쪽으로 우회하여 원효대교 북단으로 집결하거나, 서측 가양대교 방면으로 이탈하라, 이상!'],
};
const m7Dur = (txt) => clamp(txt.length / 10.5, 4.5, 11);
/* a queue: calls tied to a place go out while the column is there; the rest fill the gaps; never closer than 20–30 s apart */
function m7RadioNet(S, items) {
  const R = G.m7radio = G.m7radio || { next: G.time + 2, q: [] }; R.q.push(...items);
  if (R.started) return R; R.started = true;
  S.every(0.5, () => { if (G.mode !== 'play') return; if (G.time < R.next || G.cut) return;
    R.q = R.q.filter((it) => !(it.gone && it.gone()));
    let it = R.q.find((x) => x.when && x.when()); if (!it) it = R.q.find((x) => !x.when); if (!it) return;
    R.q.splice(R.q.indexOf(it), 1); const [who, txt] = M7RADIO[it.id]; const d = m7Dur(txt); S.radio(who, txt, { dur: d }); R.next = G.time + d + rand(20, 30); });
  return R;
}
const M7L = { K: -9.0, B: -12.0, E1: 9.0, E2: 12.0 };
defMission({
  id: 'm7', act: '2막 · 대후퇴', num: '미션 7', title: '남쪽으로',
  dateText: '2032년 2월 11일 17:40', dateShort: '2032.02.11', place: '서울 · 세종대로 → 노량진역', placeShort: '서울 철수', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: { sky: [0x1c1416, 0x4e2a1c, 0xb2532a], glow: 0xff6a28, glowDir: [-0.85, 0.06, 0.35], fog: 0x4c3026, fogD: 0.0024, hemi: [0xb08070, 0x2c1e1a, 0.74], sun: [0xff8c48, 0.8], sunDir: [-0.85, 0.16, 0.35], exposure: 1.12, stars: false, snow: 0.3, ash: true, snowFall: 0.5, viewDist: 420, battle: 1, flashes: 0.3, windSnd: 0.3 },
  loadout: { weapons: ['rifle', 'pistol'], nades: 4 },
  bounds: [-3600, -7400, 1400, 700],
  build(S) {
    hgCity({ gate: 'burn', tower63: 'burn' });
    // a local frame at the 세종대로 barricade by 광화문역: x across the avenue (east +), z along it (south +)
    const q0 = M7.q0 = HQ0 + RT.V[4] + 760, L = M7.L = (x, z) => hgPath(q0 - z, x), Ls = M7.Ls = (x, z) => { const p = L(x, z); return [p.x, p.z]; };
    const S0 = L(0, 0); M7.yawS = S0.yaw + Math.PI; // facing south, down the avenue
    for (const x of [-16, -8, 8, 16]) { const p = L(x, -2); jersey(p.x, p.z, 6, S0.yaw); }
    { const p = L(-3, 2), q = L(4, 2); sandbags(p.x, p.z, 4, S0.yaw); sandbags(q.x, q.z, 4, S0.yaw); }
    { const p = L(0, 8); S.ammoCrate(p.x, p.z); }
    squad(S, [['lee', '리선우 병장', -6, 3], ['yoon', '윤하린 중사', 6, 3], ['han', '한지운 하사', 12, 3]].map(([key, name, x, z]) => { const p = L(x, z); return { key, name, x: p.x, z: p.z, o: { hold: true, crouch: true } }; }));
    G.m7allies = []; for (const x of [-17, -12, 14, 18]) { const p = L(x, 1); const a = ally(p.x, p.z, { hold: true, hp: 180 }); a.wantCrouch = true; G.m7allies.push(a); }
    // the column, parked nose-south in the order it will drive: K21s in the inner southbound lane, the buses at the kerb (doors to the footway), ours last
    const slots = [[170, 'k'], [148, 'b', 0x2a5aa8], [126, 'k'], [104, 'b', 0x2f8a4a], [82, 'k'], [60, 'b', 0x2a5aa8], [38, 'k'], [16, 'k']];
    G.buses = []; G.bmps = [];
    for (const [z, kind, col] of slots) { const lane = kind === 'b' ? M7L.B : M7L.K, p = L(lane, z);
      if (kind === 'b') { const b = new Vehicle('bus', p.x, p.z, { team: 'ally', armed: false, invuln: true, speed: 0, yieldPeople: false, color: col, acc: 0.9 }); b.yaw = M7.yawS; b.m.root.rotation.y = b.yaw; b.m7lane = lane; G.buses.push(b); }
      else { const last = G.bmps.length === 4; const v = S.allyBMP(p.x, p.z, M7.yawS, { sam: last, rpg: last, invuln: last, speed: 0, armed: true }); v.o.acc = 1.1; v.m7lane = lane; G.bmps.push(v); } }
  },
  phases: [
    {
      setup(S) { const p = M7.L(1, 5); S.player(p.x, p.z, M7.yawS + Math.PI); },
      async run(S) {
        const { L, Ls } = M7;
        S.fade(1, 0); await runBrief(S, { kicker: '한 달 뒤 · 2032년 2월', title: '서울 북방', map: { front: 'seoulN', occ: 0, arrows: ADV().map((a) => Object.assign(a, { k: 0 })), cities: ['pyongyang', 'chuncheon', 'seoul', 'pyeong', 'busan'], hot: 'seoul', occLabel: '적 점령 지역', frontLabel: '2월 · 전선' }, lines: [
          { t: '완충지대였던 북한이 사라지고 한미동맹이 압록강까지 올라오자, 중국과 러시아가 손을 잡았다.' },
          { t: '1월 1일, 「연합 안정화 작전」을 내건 중·러 연합군이 두만강과 압록강을 넘어 쉬지 않고 내려왔다.', grow: [0, 1], growT: 2.2 },
          { t: '1월 27일 평양 함락. 중국군 주력은 옛 휴전선을 넘었다.' },
          { t: '2월, 러시아군이 동부 축선으로 춘천에 들어왔다.' },
          { t: '적 선두는 서울 북쪽 끝까지 왔다. 정부는 서울 사수를 선언했다.', grow: [], fade: true, growT: 1.6, map: { view: { lo: 127.3, la: 37.55, z: 3.2 }, frontAt: [126.05, 37.7], occAt: [126.75, 38.15] } },
          { t: '3분대는 시민 철수 호송에 투입된다.' }] }); S.fade(0, 1.5);
        await S.say('윤하린 중사', '한 달 동안 밀리고 밀려서… 여기까지 왔습니다.');
        await S.radio('수도방위사령부', '3분대, 광화문역에 대피한 시민들이 있다. 버스에 다 태울 때까지 세종대로를 막아라.', { dur: 3.6 });
        S.hint('K21 뒤쪽 열린 램프에서 <kbd>F</kbd> · 대공미사일과 RPG를 꺼낼 수 있어요', 6);
        m7War(S);
        m7RadioNet(S, [{ id: 'r2' }, { id: 'r5' }]).next = G.time + 22;
        // enemy infantry comes down 세종대로 in squads, not one man at a time
        const spawns = [[-10, -210], [10, -205], [-34, -120], [34, -125], [-30, -180], [28, -175]];
        const wave = () => { const [x, z] = pick(spawns), c = L(x, z), dst = L(rand(-14, 14), rand(-60, -40)); m7Squad(v3(c.x, 0, c.z), randi(7, 9), { dest: v3(dst.x, 0, dst.z), free: 18, tag: 'a' }); };
        wave(); S.later(4, wave);
        let boarded = 0; const NEED = 60;
        const waves = S.every(11, () => { if (boarded >= NEED) return true; if ((G.m7squads || []).filter((q) => q.tag === 'a' && q.m.some((a) => a.alive)).length < 3) wave(); });
        S.obj(`세종대로 사수 · 시민 탑승 (0/${NEED})`);
        // people come up out of 광화문역 and run for the buses; they bunch at the doors, push, hesitate, and squeeze in
        const door = (b, k, out) => { const lx = 1.82 + out, lz = k ? 1.35 : -6.5, c = Math.cos(b.yaw), s = Math.sin(b.yaw); return [b.pos.x + lx * c + lz * s, b.pos.z - lx * s + lz * c]; };
        let sent = 0, tSent = 1e9; S.every(0.5, () => { if (sent >= NEED) return true; const b = G.buses[sent % 3], k = sent % 2, p = L(rand(-22.5, -20), rand(8, 30)), q = door(b, k, rand(1.2, 2.6)), lz = rand(-1.2, 1.2), c = Math.cos(b.yaw), sn = Math.sin(b.yaw);
          civ(p.x, p.z, { goTo: [q[0] + lz * sn, q[1] + lz * c], then: door(b, k, 0.35), wait: rand(0.8, 3.5), vanish: true, speed: rand(5.2, 6.6), onRemove: () => { boarded++; S.obj(`세종대로 사수 · 시민 탑승 (${Math.min(NEED, boarded)}/${NEED})`); } }); sent++; if (sent >= NEED) tSent = G.time; });
        const panic = S.every(2.6, () => { if (boarded >= NEED) return true; for (let i = 0; i < randi(2, 4); i++) { const a = L(rand(-23, -19), rand(-60, -30)), b = L(rand(-23, -19), 260); civ(a.x, a.z, { goTo: [b.x, b.z], vanish: 'hidden', speed: rand(5.5, 6.8) }); } });
        (async () => {
          await S.wait(12); if (boarded >= NEED) return;
          const hp = [[-60, 45, -150], [10, 35, -60], [50, 38, 20], [-30, 40, 0], [-60, 42, -90]].map(([x, y, z]) => { const p = L(x, z); return [p.x, y, p.z]; }); const h0 = L(-300, -300);
          await S.threat('heli', { x: h0.x, z: h0.z, path: hp, line: '서한준! 공격 헬기다! K21에서 대공미사일 꺼내!', done: false });
          if (boarded >= NEED) return; await S.wait(4); if (boarded >= NEED) return;
          const b0 = L(0, -230); await S.threat('bmp', { x: b0.x, z: b0.z, path: [Ls(0, -150), Ls(-3, -70)], line: '서한준! 정면 BMP! 로켓 쏴!', done: false });
        })();
        await S.until(() => boarded >= NEED || G.time - tSent > 12);
        if (boarded < NEED) { boarded = NEED; S.obj(`세종대로 사수 · 시민 탑승 (${NEED}/${NEED})`); }
        S.stop(waves); S.stop(panic);
        for (const v of [...G.vehicles]) if (v.alive && v.team === 'enemy') { v.remove(); v.alive = false; }
        G.threatV = null; G.objPos = null;
        G.m7radio.q = G.m7radio.q.filter((x) => x.id !== 'r2' && x.id !== 'r5'); G.m7radio.next = G.time + 60;
        { const [who, txt] = M7RADIO.r4; await S.radio(who, txt, { dur: m7Dur(txt) }); }
        await S.say('한지운 하사', '서한준! K21에 타! 출발한다!', { dur: 2.4 });
        followMode(S, ['lee', 'yoon', 'han']);
        const mine = G.bmps[4];
        if (mine.samIt) mine.samIt.disabled = true; if (mine.rpgIt) mine.rpgIt.disabled = true; // only the boarding prompt at the ramp now
        await S.use(mine.pos.clone().add(v3(Math.sin(mine.yaw) * 5.2, 2.0, Math.cos(mine.yaw) * 5.2)), 'K21 후방 갑판에 탑승', 3);
      },
    },
    {
      setup(S) { },
      async run(S) {
        const mine = G.bmps[4], SP = 15, QF = -400; // the column stops on the street outside 노량진역, the front at z 400
        for (const k of ['lee', 'yoon', 'han']) { const a = S.sq[k]; if (a) a.remove(); }
        for (const a of G.m7allies) if (a.alive) a.remove();
        m7Riders(mine);
        giveWeapon('rpg', false); P.ammo.rpg.res = 6; giveWeapon('sam', false); P.ammo.sam.res = 2;
        P.ride = { obj: mine.m.root, off: [0, 1.55, 1.7] }; P.yaw = mine.yaw + Math.PI; P.pitch = -0.05; P.yawLim = null; P.noFire = false;
        S.obj('버스 행렬 호위 — 뒤따라오는 적을 막아라');
        S.hint('K21 위에서 뒤쪽을 지키세요 · 로켓은 주기적으로 보급돼요', 6);
        // the column, front to back, runs the real road: 세종대로 → 숭례문 → 서울역 → 한강대로 → 한강대교 → 노량진
        const conv = [...G.buses, ...G.bmps].filter((v) => v.alive).sort((a, b) => hgQ(a.pos, M7.q0 - 100) - hgQ(b.pos, M7.q0 - 100)); M7.conv = conv;
        const route = (v, d, q0, q1) => { const pts = []; for (let q = q0 - 10; q > q1; q -= 12) { const p = hgPath(q, d); pts.push(v3(p.x, 0, p.z)); } const e = hgPath(q1, d); pts.push(v3(e.x, 0, e.z)); v.path = pts; v.pi = 0; v.stopped = false; v.speed = SP; };
        conv.forEach((v, i) => { v.q = hgQ(v.pos, M7.q0 - 100); v.lane = v.m7lane; v.stopQ = QF + i * 22; route(v, v.lane, v.q, v.stopQ); });
        m7War(S); m7Departure(S, mine);
        mine.q = hgQ(mine.pos, M7.q0 - 100); const qm = () => (mine.q = hgQ(mine.pos, mine.q));
        // keep station in the column: close up when behind, ease off when ahead (the vehicles themselves brake for whatever is in front)
        S.every(0.25, () => { const tq = qm(); conv.forEach((v, i) => { if (!v.alive || v === mine) return; v.q = hgQ(v.pos, v.q); const want = tq - (conv.length - 1 - i) * 22; v.speed = clamp(SP + (v.q - want) * 0.35, 8, 21); }); });
        const refill = S.every(9, () => { let got = false; if (P.ammo.rpg && P.ammo.rpg.res + P.ammo.rpg.mag < 4) { P.ammo.rpg.res = Math.max(P.ammo.rpg.res, 3); got = true; } if (P.ammo.sam && P.ammo.sam.res + P.ammo.sam.mag < 2) { P.ammo.sam.res = Math.max(P.ammo.sam.res, 1); got = true; } if (got) toast('로켓 보급'); });
        // pursuers come down the avenue behind us in the northbound lanes; they stop where the engineers have mined the approach to the bridge
        const chasers = [];
        const chase = (type, delay, d) => S.later(delay, () => { if (mine.q < 1500) return; const q0 = mine.q + 170; const p = hgPath(q0, d); const v = new Vehicle(type, p.x, p.z, { target: 'veh', speed: SP, reload: type === 'tank' ? 7 : undefined, hp: type === 'tank' ? 600 : 380, acc: 1.6 });
          v.yaw = p.yaw + Math.PI; v.q = q0; route(v, d, q0, 1250); chasers.push(v); S.every(0.3, () => { if (!v.alive) return true; v.q = hgQ(v.pos, v.q); const gap = v.q - mine.q; v.speed = gap > 70 ? SP + 4 : gap > 40 ? SP : SP - 5; }); });
        chase('bmp', 3, M7L.E1); chase('bmp', 6, M7L.E2); chase('bmp', 14, M7L.E1); chase('tank', 30, M7L.E2); chase('bmp', 80, M7L.E1); chase('tank', 140, M7L.E2); chase('bmp', 200, M7L.E1); chase('bmp', 260, M7L.E2);
        S.later(4.5, () => S.say('한지운 하사', '서한준! 뒤에 BMP! 로켓 쏴!', { dur: 2.2 }));
        S.later(31.5, () => S.say('한지운 하사', '서한준, 전차다! 로켓 쏴, 지금!', { dur: 2.2 }));
        // ambush squads at the kerbs ahead
        G.hitMul = 0.45; const regen = S.every(0.5, () => { if (P.alive && P.hp < 100 && G.time - P.lastHit > 3) P.hp = Math.min(100, P.hp + 4); });
        let firstAmb = true;
        // squads all along the road: one every ~7 s, up to three alive at once; often a second squad on the far kerb a little further on
        const amb = S.every(7, () => { if (mine.q < 1300 || mine.q > M7.q0 - 60) return; if ((G.m7squads || []).filter((q) => q.tag === 'amb' && q.m.some((a) => a.alive)).length > 2) return;
          const q = mine.q - rand(110, 170), side = pick([-1, 1]), p = hgPath(q, side * rand(19.5, 21.5)); m7Squad(v3(p.x, 0, p.z), randi(7, 9), { hold: true, tag: 'amb', spread: 3.5 });
          if (Math.random() < 0.45) { const p2 = hgPath(q - rand(25, 45), -side * rand(19.5, 22)); m7Squad(v3(p2.x, 0, p2.z), randi(6, 8), { hold: true, tag: 'amb', spread: 3.2 }); }
          if (firstAmb) { firstAmb = false; S.later(2, () => S.say('윤하린 중사', `서한준! ${side < 0 ? '우측' : '좌측'} 인도에 적 분대! 쏴!`, { dur: 2.2 })); } });
        // 시청역: the shelter the radio is calling about — enemy squads across 서울광장 and from 덕수궁 storming the subway exits, a handful of ours holding them
        S.until(() => mine.q < HQ0 + RT.V[4] + 520).then(() => m7CityHallStation(S));
        // a K21 hit from behind skids out of the lane into the median and burns there
        const lose = (v) => { if (!v.alive) return; const p = v.pos.clone(); new Proj('shell', p.clone().add(v3(0, 2, 0)).addScaledVector(v3(Math.sin(v.yaw), 0, Math.cos(v.yaw)), -40), v3(Math.sin(v.yaw), -0.02, Math.cos(v.yaw)).normalize().multiplyScalar(160), { team: 'enemy' });
          S.later(0.3, () => { v.invuln = false; v.die(); const i = conv.indexOf(v); if (i >= 0) conv.splice(i, 1); let t = 0, q = hgQ(v.pos, v.q), sp = v.cs || SP, d = v.lane;
            G.updaters.push((dt) => { t += dt; sp = Math.max(0, sp - 7 * dt); d = lerp(d, -3.6, Math.min(1, dt * 1.6)); q -= sp * dt; const pp = hgPath(q, d); v.pos.set(pp.x, 0, pp.z); v.yaw = pp.yaw + Math.PI + (d - v.lane) * 0.05; v.m.root.position.copy(v.pos); v.m.root.rotation.y = v.yaw; v.syncCol && v.syncCol(); return t > 3; }); }); };
        S.later(60, () => lose(G.bmps[3])); S.later(130, () => lose(G.bmps[2]));
        // the overpass at 남영: heads down
        S.until(() => mine.q < HQ0 + RT.V[0] + 820).then(() => S.say('한지운 하사', '서한준, 고개 숙여!', { dur: 1.8 }));
        // 서울역: a flight of three comes in low over the station, drops, breaks hard away — and the station comes down behind its bombs
        S.until(() => mine.q < HQ0 + RT.sSta + 200).then(() => m7StationStrike(S));
        // the engineers on 한강대교, mining the northbound deck as we pass, closing the road behind us
        S.until(() => mine.q < 1500).then(() => m7Engineers(S, mine));
        // the radio net
        m7RadioNet(S, [
          { id: 'r1', when: () => true },
          { id: 'r3', when: () => Math.abs(mine.q - (HQ0 + RT.V[4] + 150)) < 260, gone: () => mine.q < HQ0 + RT.V[4] - 150 },
          { id: 'r12', when: () => mine.q < HQ0 + RT.V[3] + 200 && mine.q > HQ0 + RT.sSta + 260, gone: () => mine.q < HQ0 + RT.sSta + 260 },
          { id: 'r13', when: () => mine.q < HQ0 + RT.sSta - 100 && mine.q > HQ0 + RT.V[1], gone: () => mine.q < HQ0 + RT.V[1] },
          { id: 'r7', when: () => mine.q < 1400 && mine.q > 300, gone: () => mine.q < 300 },
          { id: 'r20', when: () => mine.q < 1000 && mine.q > -150, gone: () => mine.q < -150 },
          ...['r15', 'r16', 'r6', 'r8', 'r11', 'r9', 'r17', 'r10', 'r14', 'r18', 'r19'].map((id) => ({ id, when: null })),
        ]);
        G.m7radio.next = G.time + 3;
        await S.until(() => qm() < mine.stopQ + 4 && (mine.cs || 0) < 0.6);
        S.stop(amb); S.stop(refill); S.stop(regen); G.hitMul = 1;
        G.chasers = chasers;
      },
    },
    {
      setup(S) { if (!G.chasers) { // checkpoint: the column already stopped on the 노량진 street
          const conv = [...G.buses, ...G.bmps].sort((a, b) => hgQ(a.pos, M7.q0 - 100) - hgQ(b.pos, M7.q0 - 100)); conv.forEach((v, i) => { const p = hgPath(-400 + i * 22, v.m7lane); v.pos.set(p.x, 0, p.z); v.yaw = Math.PI; v.m.root.position.copy(v.pos); v.m.root.rotation.y = v.yaw; v.syncCol(); v.path = null; });
          m7War(S); if (G.m7war) G.m7war.fight = false; m7Riders(G.bmps[4]); } },
      async run(S) {
        const mine = G.bmps[4]; P.ride = null; S.player(mine.pos.x - 4.2, mine.pos.z, -Math.PI / 2); if (G.m7radio) G.m7radio.q = [];
        if (G.m7war) G.m7war.fight = false; for (const a of aliveEnemies()) if (a.pos.distanceTo(P.pos) > 60) a.remove();
        // the squad climbs down off the deck
        const seats = m7Dismount(mine); squad(S, seats.map(([key, name, p]) => ({ key, name, x: p.x - 3.6, z: p.z })));
        followMode(S, ['lee', 'yoon', 'han']); giveWeapon('rpg', false);
        // the buses carry on south with their people; the K21s pull in to the kerb
        for (const b of G.buses) if (b.alive) { b.path = [v3(b.pos.x, 0, 1200)]; b.pi = 0; b.speed = 9; b.stopped = false; b.o.onArrive = (v) => v.remove(); }
        await S.say('한지운 하사', '서한준, 내려! 역사로 들어가, 2층으로 건너간다!', { dur: 2.4 });
        // the evacuation train — a 무궁화호 — runs in over 한강철교 on the westmost line, to the low platform
        m7NyTrain();
        S.radio('수도방위사령부', '노량진역, 평택행 무궁화호 임시 열차 6번 승강장 진입한다. 서둘러라!', { dur: 3.4 });
        const strike = S.every(2.4, () => { if (P.pos.y < 3 && P.pos.x > NY.xE) S.arty(P.pos.x + rand(-16, 16), P.pos.z + rand(-30, 30), { dmg: 60 }); });
        const run = m7NyRun(S); // the squad leads through the station; the building comes down behind us
        await S.reach(v3(-47, 0, 355), 2.6, '노량진역 역사 안으로'); S.stop(strike); run.stage(1);
        await S.reach(v3(-58, 0, 345.4), 2.6, '계단으로 2층에'); run.stage(2);
        await S.reach(v3(-76.5, NY.FY, 345.4), 2.6, '2층 맞이방'); run.stage(3);
        await S.reach(v3(-168, NY.FY, 366), 3, '6번 저상 승강장 — 끝까지 뛰어!');
        await S.reach(v3(-172.6, 1.2, 386), 2.6, '6번 승강장으로 내려가'); run.stage(4);
        if (!G.trainIn) { S.obj('열차 진입 대기'); S.say('한지운 하사', '들어온다, 들어와! 문 열리면 바로 타!', { dur: 2.2 }); await S.until(() => G.trainIn); }
        await S.reach(v3(-170.4, 1.2, 386.9), 1.8, '마지막 칸에 타');
        run.stop();
        for (const a of aliveEnemies()) a.remove();
        for (const v of G.vehicles) if (v.alive && v.team === 'enemy') { v.remove(); v.alive = false; }
        await S.cut(async () => {
          const tr = G.train, car = tr[0]; for (const k of ['lee', 'yoon', 'han']) { const a = S.sq[k]; if (a) a.remove(); }
          S.music('sad'); S.env({ fog: 0x2a1c18, fogD: 0.0009, viewDist: 900 });
          // out of his own eyes onto the gangway at the back of the last car: one move, the way he would turn round in the doorway
          const at = () => v3(car.position.x - 0.2, 2.95, car.position.z - 12.3), look = () => at().add(v3(6, 6, -160));
          S.later(0.2, () => S.camFov(60)); await S.cam(at(), look(), 1.7);
          // the slack runs out down the train, then it pulls away south; behind, the concourse comes down onto the tracks
          let t = 0; G.updaters.push((dt) => { if (!G.cut) return true; t += dt; const sp = t < 0.6 ? t * 0.4 : Math.min(12, 0.24 + (t - 0.6) * 0.95); for (const c of tr) c.position.z += sp * dt; G.cut.pos.copy(at()); G.cut.look.copy(at().add(v3(6 + t * 0.05, 6 + t * 0.25, -160))); });
          S.later(0.4, () => { SFX.metal(v3(car.position.x, 2, car.position.z)); G.shake += 0.15; });
          S.later(2.2, () => m7NyFallAll());
          for (let i = 0; i < 10; i++) S.later(4 + i * 1.1, () => { const p = v3(rand(-500, 400), rand(0, 30), rand(-1900, -1100)); explode(p, { noPlayer: true, size: rand(3, 5), dmg: 0, vdmg: 0 }); addEmitter(p, 'smoke', 3, 2, 60); });
          S.later(5, () => m7Formation({ from: v3(700, 0, -1350), to: v3(-1000, 0, -1450), alt: 170, n: 3, kind: 'V' }));
          await S.wait(3.2);
          await S.say('리선우 병장', '…불타고 있슴다. 서울 전체가.', { dur: 3 });
          await S.say('서한준', '어머니… 저기 계신데.', { dur: 2.6 });
          await S.radio('수도방위사령부', '…전 부대에 알린다.', { dur: 2.5 });
          await S.radio('수도방위사령부', '서울, 함락.', { dur: 3 });
          await S.say('한지운 하사', '…반드시 돌아온다. 같이.', { dur: 2.6 });
          await S.wait(1);
          await S.fade(1, 2.5);
        });
      },
    },
  ],
});
const M7 = {};

/* ========== MISSION 8 「잠룡」 ========== */