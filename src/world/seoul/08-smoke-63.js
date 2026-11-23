/* ================= a smoke column seen from far: camera-facing puffs cycling up and drifting downwind =================
   (the particle emitters only run near the camera; this carries a fire's smoke to the horizon) */
function hgSmokeTex() {
  if (SS.smokeT) return SS.smokeT;
  SS.smokeT = canvasTex(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const x = w / 2 + rand(-26, 26), y = h / 2 + rand(-22, 22), r = rand(14, 34), g = c.createRadialGradient(x, y, 0, x, y, r); const l = randi(150, 230); g.addColorStop(0, `rgba(${l},${l},${l},${rand(0.25, 0.5)})`); g.addColorStop(1, `rgba(${l},${l},${l},0)`); c.fillStyle = g; c.fillRect(0, 0, w, h); } });
  return SS.smokeT;
}
function hgSmokeCol(base, o = {}) {
  const H = o.h || 300, R = o.r || 24, n = Math.min(64, Math.max(o.n || 20, Math.ceil(H / (R * 0.32)))), per = o.period || 40, drift = o.drift || [0.35, -0.2], col = new THREE.Color(o.color ?? 0x2c2a28), op = (o.op ?? 0.8) * Math.min(1, Math.sqrt(24 / n));
  const grp = new THREE.Group(); G.world.add(grp); const L = [];
  for (let i = 0; i < n; i++) { const m = new THREE.SpriteMaterial({ map: hgSmokeTex(), color: col, transparent: true, depthWrite: false, fog: !!o.fog, opacity: 0 }); const s = new THREE.Sprite(m); grp.add(s); L.push([s, i / n, rand(0, TAU), rand(0.8, 1.2)]); }
  const up = () => { const t = G.time / per; for (const [s, ph, rot, f] of L) { const u = (ph + t) % 1, y = u * H;
      s.position.set(base.x + drift[0] * y, base.y + y, base.z + drift[1] * y); const sc = R * f * (0.5 + 2.4 * Math.pow(u, 0.8)); s.scale.set(sc, sc, 1);
      s.material.opacity = op * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.6) * (1 - u * 0.45); s.material.rotation = rot + u * 1.2; } };
  up(); G.updaters.push(() => { if (!grp.parent) return true; up(); }); return grp;
}

/* ================= 63빌딩 on the east tip of 여의도: gold glass, 249 m, the stepped crown and its mast =================
   placed from the map: ~790 m WNW of where 한강철교 lands at 노량진 (bearing 296°), its broad gold face turned to the river.
   'burn' (「남쪽으로」, February): fires on several floors, a missile gouge high up, black smoke leaning out over the river.
   'charred' (a month on): black burnt floors, broken glass, a thin smoke. Far from everything, so it carries its own haze
   (fog-free materials tinted toward the fog colour) and stays readable through the heavy war fog. */
const Y63 = { x: -927, z: 155, yaw: 0.29 };
function hgYeouido() {
  // 여의도한강공원: the land between the expressway and the river, west of where the bank turns north-west
  const sh = new THREE.Shape([[-560, -2], [-680, -8], [-793, -24], [-920, -60], [-1043, -102], [-1250, -176], [-1500, -250], [-1500, -2]].map(([x, z]) => new THREE.Vector2(x, -z)));
  const ge = new THREE.ExtrudeGeometry(sh, { depth: 16, bevelEnabled: false }); ge.rotateX(-Math.PI / 2); const lawn = hgLawnMat('lawnY');
  const m = new THREE.Mesh(ge, [lawn, hgMat('riprap', { color: 0x8a867c, map: 'concrete', rough: 1 })]); m.position.y = -20.05; m.receiveShadow = true; G.world.add(m);
  const path = []; for (let x = -580; x > -1480; x -= 30) { const zc = x > -793 ? -2 - (x + 560) * 0.095 : x > -1043 ? -24 - (x + 793) * 0.31 : -102 - (x + 1043) * 0.33; path.push([x, -4.0, zc * 0.55 + 6]); }
  const tr = [], cr = []; for (let i = 0; i < 70; i++) { const x = rand(-1480, -600), zc = x > -793 ? -2 - (x + 560) * 0.095 : x > -1043 ? -24 - (x + 793) * 0.31 : -102 - (x + 1043) * 0.33, z = rand(zc + 8, 8); tr.push([x, -1.6, z]); cr.push([x, 2.4, z, 0, 0, 0, rand(1, 1.4)]); }
  hgInst(new THREE.CylinderGeometry(0.15, 0.25, 4.8, 6), hgMat('bark', { color: 0x4a4038, rough: 1 }), tr, { cast: false }); hgInst(new THREE.IcosahedronGeometry(2.6, 1), hgMat('twigs', { color: 0x5a5046, rough: 1, transparent: true, opacity: 0.22 }), cr, { cast: false });
}
function hg63(state = 'charred', at = Y63) { /* at: where it stands ({x, z, yaw}); the 한강대로 maps use its real spot, other maps pass their own */
  const fogC = new THREE.Color(G.env.fog ?? 0xbcbab4), dens = G.env.fogD ?? 0.001, k = Math.min(0.2, 1 - Math.exp(-Math.pow(dens * 800, 2)));
  const haze = (m, kk = k) => { m.fog = false; m.color.multiplyScalar(1 - kk); m.emissive = new THREE.Color().copy(fogC).multiplyScalar(kk); m.emissiveIntensity = 1; return m; };
  if (!SS.T63) { SS.T63 = {};
    // gold reflective glass: fine floor lines only (3.9 m floors), each floor its own tint, a broad sky sheen (12 m × 31.2 m tile)
    SS.T63.gold = canvasTex(512, 512, (c, w, h) => { const sh = c.createLinearGradient(0, 0, w, 0); sh.addColorStop(0, 'hsl(44,88%,46%)'); sh.addColorStop(0.5, 'hsl(40,90%,34%)'); sh.addColorStop(1, 'hsl(43,88%,43%)'); c.fillStyle = sh; c.fillRect(0, 0, w, h);
      for (let f = 0; f < 8; f++) { const y0 = f * 64; c.fillStyle = `rgba(${Math.random() < 0.5 ? '255,240,200' : '90,60,20'},${rand(0.03, 0.09)})`; c.fillRect(0, y0, w, 64); c.fillStyle = 'rgba(80,52,16,.55)'; c.fillRect(0, y0 + 54, w, 3); c.fillStyle = 'rgba(255,236,190,.18)'; c.fillRect(0, y0 + 57, w, 1); }
      for (let f = 0; f < 8; f++) { c.fillStyle = 'rgba(80,52,16,.35)'; c.fillRect(0, f * 64 + 26, w, 2); }
      for (let x = 0; x < w; x += 64) { c.fillStyle = 'rgba(70,46,14,.5)'; c.fillRect(x, 0, 2, h); c.fillStyle = 'rgba(255,236,190,.12)'; c.fillRect(x + 2, 0, 1, h); } });
    SS.T63.gold.anisotropy = 8;
    SS.T63.burn = canvasTex(256, 64, (c, w, h) => { c.clearRect(0, 0, w, h); for (let x = 0; x < w; x += 2) { const t = 6 + Math.abs(Math.sin(x * 0.07) * 10 + Math.sin(x * 0.31) * 6); c.fillStyle = 'rgba(10,8,6,.92)'; c.fillRect(x, t, 2, h - t - 4 - Math.abs(Math.sin(x * 0.11)) * 6); } });
    SS.T63.glow = canvasTex(256, 64, (c, w, h) => { c.clearRect(0, 0, w, h); for (let x = 0; x < w; x += 2) { const t = 8 + Math.abs(Math.sin(x * 0.09) * 10 + Math.sin(x * 0.37) * 5), g = c.createLinearGradient(0, t, 0, h); g.addColorStop(0, 'rgba(255,200,90,.95)'); g.addColorStop(0.6, 'rgba(255,110,30,.9)'); g.addColorStop(1, 'rgba(120,30,10,.6)'); c.fillStyle = g; c.fillRect(x, t, 2, h - t - 6); } });
    SS.T63.soot = canvasTex(128, 256, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 70; i++) { const v = Math.pow(Math.random(), 1.6), y = h * (1 - v * 0.95), x = w / 2 + rand(-1, 1) * w * (0.22 + 0.2 * v), r = rand(10, 26) * (1 - v * 0.4), a = 0.32 * (1 - v);
      const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(10,8,6,${a})`); g.addColorStop(1, 'rgba(10,8,6,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); } });
    SS.T63.flame = canvasTex(128, 256, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const g = c.createRadialGradient(w / 2, h * 0.78, 4, w / 2, h * 0.6, h * 0.55); g.addColorStop(0, 'rgba(255,240,180,1)'); g.addColorStop(0.35, 'rgba(255,150,40,.9)'); g.addColorStop(0.75, 'rgba(200,50,10,.45)'); g.addColorStop(1, 'rgba(120,20,0,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(w * 0.15, h); c.quadraticCurveTo(w * (0.1 + i * 0.1), h * 0.4, w / 2 + rand(-20, 20), 0); c.quadraticCurveTo(w * (0.9 - i * 0.1), h * 0.4, w * 0.85, h); c.fill(); } }); }
  const T = SS.T63, gm = at.metal ?? 0.75; /* a map without the Seoul sky reflections asks for less metal, or the glass reads grey */
  const gold = haze(new THREE.MeshStandardMaterial({ map: T.gold, roughness: 0.18, metalness: gm, color: 0xffe08a })); gold.userData.tile = [12, 31.2];
  const dark = haze(new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.25, metalness: 0.7 })), steel = haze(new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 0.5, metalness: 0.5 }));
  const podium = haze(new THREE.MeshStandardMaterial({ map: T.gold, roughness: 0.2, metalness: gm, color: 0xc8c0b0 })); podium.userData.tile = [12, 31.2];
  const root = new THREE.Group(); root.position.set(at.x, at.y ?? 0, at.z); root.rotation.y = at.yaw; G.world.add(root);
  SS.bins = SS.bins || new Map();
  // the massing, from the photos: a straight slab, flat roof, the broad gold face (local +x) a fine grid, a dark sign band just
  // under the roof; the near end (+z) is two slabs
  // split by a deep vertical slot, with double dark bands about a third and two thirds of the way up, the spire on it
  const B = [[14, -30], [14, 27], [1.2, 27], [1.2, 23], [-1.2, 23], [-1.2, 27], [-14, 27], [-14, -30]];
  const Hz = () => 249, Tz = (z) => z;
  for (let i = 0; i < B.length; i++) { const a = B[i], b = B[(i + 1) % B.length], dx = b[0] - a[0], dz = b[1] - a[1], slot = Math.abs(a[0]) < 2 && Math.abs(b[0]) < 2 && (a[1] < 27 || b[1] < 27);
    const m = slot || (Math.abs(a[0]) < 2 && Math.abs(b[0]) < 2) ? dark : gold;
    ssQuad(root, m, [a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], Hz(Tz(b[1])), Tz(b[1])], [a[0], Hz(Tz(a[1])), Tz(a[1])], [dz, 0, -dx]); }
  { const TP = B.map(([x, z]) => new THREE.Vector2(x, Tz(z))), tri = THREE.ShapeUtils.triangulateShape(TP, []); for (const [i, j, l] of tri) ssTri(root, steel, [TP[i].x, Hz(TP[i].y), TP[i].y], [TP[j].x, Hz(TP[j].y), TP[j].y], [TP[l].x, Hz(TP[l].y), TP[l].y], [0, 1, 0]); }
  const lb = (m, x0, x1, y0, y1, z0, z1) => ssGeo(root, m, SSBOX, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 0, 0, 0, Math.abs(x1 - x0), y1 - y0, Math.abs(z1 - z0));
  for (const y of [76, 80.6, 150, 154.6]) for (const [x0, x1] of [[1.2, 14.15], [-14.15, -1.2]]) lb(dark, x0, x1, y, y + 1.6, 26.9, 27.25);
  for (const e of [1, -1]) { const x = e * 14.06, z0 = -30, z1 = 27; ssQuad(root, dark, [x, 240.5, z0], [x, 240.5, z1], [x, 244.5, z1], [x, 244.5, z0], [e, 0, 0]); ssQuad(root, steel, [x + e * 0.02, 239.6, z0], [x + e * 0.02, 239.6, z1], [x + e * 0.02, 240.1, z1], [x + e * 0.02, 240.1, z0], [e, 0, 0]); }
  { const red = haze(new THREE.MeshStandardMaterial({ color: 0xc0281e, roughness: 0.5 })), wht = haze(new THREE.MeshStandardMaterial({ color: 0xe8e6e0, roughness: 0.5 }));
    for (let i = 0; i < 8; i++) ssBeam(root, i % 2 ? wht : red, [0, 252 + i * 3.2, 22], [0, 252 + (i + 1) * 3.2, 22], 0.75 - i * 0.05, SSCYL6); ssBeam(root, steel, [0, 277.6, 22], [0, 281, 22], 0.15, SSCYL6); }
  lb(steel, -9, 9, 249, 252, 4, 26); lb(steel, -6, 6, 249, 251, -24, -6);
  lb(podium, -62, -14, 0, 21, -30, 40); lb(dark, -62.5, -13.5, 21, 22.5, -30.5, 40.5); lb(dark, 14, 20, 0, 5, -12, 12);
  ssFlush(); for (const ch of root.children) { ch.castShadow = false; ch.receiveShadow = false; }
  root.updateMatrixWorld(true);
  addCollider(at.x - 32, at.y ?? 0, at.z - 32, at.x + 32, 250, at.z + 32, {});
  // fires / burns: where they are on the facades (side 'f' = the broad face, 's' = the river-end face)
  const spot = (side, u, y, off = 0.5) => { const p = side === 'f' ? v3(14 + off, y, -1.5 + u * 28.5) : v3(14 - 28 * u, y, -30 - off); return root.localToWorld(p); };
  const nrm = (side) => { const v = side === 'f' ? v3(1, 0, 0) : v3(0, 0, -1); return v.applyAxisAngle(v3(0, 1, 0), at.yaw); };
  const spots = [['f', -0.3, 97, 20], ['f', 0.45, 101, 12], ['f', 0.05, 137, 24], ['f', -0.6, 141, 10], ['f', 0.25, 187, 15], ['s', 0.4, 119, 10], ['s', 0.55, 175, 9], ['f', -0.15, 62, 8]];
  const plane = (m, side, u, y, w, h, off) => { const me = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), p = spot(side, u, y, off), n = nrm(side); me.position.copy(p); me.lookAt(p.clone().add(n)); G.world.add(me); return me; };
  const burnM = new THREE.MeshBasicMaterial({ map: T.burn, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, color: new THREE.Color(1, 1, 1).lerp(fogC, k * 0.5) });
  const sootM = new THREE.MeshBasicMaterial({ map: T.soot, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, opacity: 0.85, color: new THREE.Color(1, 1, 1).lerp(fogC, k * 0.4) });
  for (const [side, u, y, w] of spots) { plane(burnM, side, u, y, w * 1.25, 11, 0.35); plane(sootM, side, u, y + 30, w * 1.6, 56, 0.3); }
  { const p = plane(new THREE.MeshBasicMaterial({ color: 0x050403, fog: false }), 'f', 0.25, 190, 9, 7, 0.45); p.scale.set(1.2, 1, 1); }  // the missile gouge
  if (state === 'burn') {
    const glowM = new THREE.MeshBasicMaterial({ map: T.glow, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide, opacity: 0.9 });
    const fm = new THREE.MeshBasicMaterial({ map: T.flame, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, fog: false });
    const fl = [];
    for (const [side, u, y, w] of spots) { plane(glowM, side, u, y - 0.5, w * 1.05, 8, 0.45);
      const n = Math.max(3, Math.round(w / 4)); for (let i = 0; i < n; i++) { const uu = u + (i / (n - 1) - 0.5) * (w / 30) + rand(-0.03, 0.03), s = rand(14, 26); const p = spot(side, uu, y + s * 0.3 + rand(-1, 2), 2.5); const me = new THREE.Mesh(new THREE.PlaneGeometry(s * 0.75, s), fm); me.position.copy(p); G.world.add(me); fl.push([me, rand(0, TAU), p.y]); } }
    const L = new THREE.PointLight(0xff7a30, 400, 260, 1.4); L.position.copy(spot('f', 0, 140, 12)); G.world.add(L);
    G.updaters.push(() => { if (G.mode !== 'play') return; for (const [m, ph] of fl) { m.scale.set(1 + 0.12 * Math.sin(G.time * 7 + ph), 1 + 0.2 * Math.sin(G.time * 9 + ph) + 0.1 * Math.sin(G.time * 23 + ph * 2), 1); m.lookAt(camera.position.x, m.position.y, camera.position.z); } L.intensity = 340 + 90 * Math.sin(G.time * 11); });
    const sc = new THREE.Color(0x141210);
    hgSmokeCol(spot('f', 0.05, 145, 8), { h: 900, r: 80, n: 40, period: 50, drift: [0.6, -0.34], color: sc, op: 0.95 });
    hgSmokeCol(spot('f', -0.3, 104, 8), { h: 700, r: 60, n: 30, period: 44, drift: [0.62, -0.3], color: sc, op: 0.85 });
    hgSmokeCol(spot('f', 0.25, 192, 8), { h: 800, r: 60, n: 30, period: 48, drift: [0.55, -0.36], color: sc, op: 0.9 });
    hgSmokeCol(spot('s', 0.45, 122, 8), { h: 600, r: 44, n: 22, period: 40, drift: [0.6, -0.3], color: new THREE.Color(0x24201c), op: 0.8 });
  } else hgSmokeCol(spot('f', 0.25, 192, 4), { h: 420, r: 22, n: 14, period: 50, drift: [0.45, -0.3], color: new THREE.Color(0x5a5650).lerp(fogC, k * 0.5), op: 0.4 });
}
