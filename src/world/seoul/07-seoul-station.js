/* ================= 서울역, built piece by piece from the aerial photo =================
   the 1925 station (문화역서울284) on its forecourt; the KTX hall (2004) behind a glass front under its sweeping white roof,
   the roof carrying on west over the tracks; the glass drum at the corner; the outlet and mart blocks with their mint decks;
   the terrace, the grand stair with escalators and the glass dome of the subway entrance at its foot.
   Frame: every part lives in a group at the station origin (s = 0 on the avenue): local x = d (east +), local z = -s (north is -z).
   KEEP always stands. FALL is the south half of the KTX hall and its roof, which 「남쪽으로」 brings down.
   RUIN is what is left after — torn roof edges, the roof flap hanging off the break, slab ends and rebar, the heap — hidden until then. */
const SS = { CUT: 22, TH: 2.0 };
const SSBOX = new THREE.BoxGeometry(1, 1, 1), SSHALF = new THREE.CircleGeometry(1, 20, 0, Math.PI), SSDISC = new THREE.CircleGeometry(1, 28);
const SSARCH = new THREE.TorusGeometry(1, 0.12, 6, 20, Math.PI), SSARCHT = new THREE.TorusGeometry(1, 0.025, 4, 24, Math.PI), SSRING = new THREE.TorusGeometry(1, 0.08, 6, 28);
const SSCYL = new THREE.CylinderGeometry(1, 1, 1, 12), SSCYL6 = new THREE.CylinderGeometry(1, 1, 1, 6);
const _ssO = new THREE.Object3D(), _ssQ = new THREE.Quaternion(), _ssUp = new THREE.Vector3(0, 1, 0), _ssMx = new THREE.Matrix4();
const _ssA = new THREE.Vector3(), _ssB = new THREE.Vector3(), _ssC = new THREE.Vector3();
function ssSm(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
function ssJag(x, k = 1) { return k * (2.6 * Math.sin(x * 0.23 + 0.7) + 1.7 * Math.sin(x * 0.61 + 2.1) + 1.1 * Math.sin(x * 1.37 + 0.3)); }

/* ---------- a tiny mesh builder: everything is merged per (group, material); materials with userData.tile get box-projected UVs in metres ---------- */
function ssBin(grp, m) { const k = grp.uuid + '|' + m.uuid; let b = SS.bins.get(k); if (!b) SS.bins.set(k, b = { grp, m, p: [], n: [], u: [] }); return b; }
function ssGeoM(grp, m, geo, mtx) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(mtx); if (!g.attributes.normal) g.computeVertexNormals();
  const b = ssBin(grp, m), p = g.attributes.position.array, n = g.attributes.normal.array, uv = g.attributes.uv && g.attributes.uv.array;
  for (let i = 0; i < p.length; i++) { b.p.push(p[i]); b.n.push(n[i]); }
  const c = p.length / 3; for (let i = 0; i < c; i++) b.u.push(uv ? uv[i * 2] : 0, uv ? uv[i * 2 + 1] : 0); g.dispose();
}
function ssGeo(grp, m, geo, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  _ssO.position.set(x, y, z); _ssO.rotation.set(rx, ry, rz, 'YXZ'); _ssO.scale.set(sx, sy, sz); _ssO.updateMatrix(); ssGeoM(grp, m, geo, _ssO.matrix);
}
/* a box by its extents (any order): d0..d1, y0..y1, s0..s1 */
function ssBox(grp, m, d0, d1, y0, y1, s0, s1) { ssGeo(grp, m, SSBOX, (d0 + d1) / 2, (y0 + y1) / 2, -(s0 + s1) / 2, 0, 0, 0, Math.abs(d1 - d0) || 0.01, Math.abs(y1 - y0) || 0.01, Math.abs(s1 - s0) || 0.01); }
/* a member between two local points */
function ssBeam(grp, m, a, b, r, geo = SSCYL, r2) {
  const A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]), D = B.clone().sub(A), L = D.length(); if (L < 1e-4) return;
  _ssQ.setFromUnitVectors(_ssUp, D.multiplyScalar(1 / L)); _ssMx.compose(A.add(B).multiplyScalar(0.5), _ssQ, new THREE.Vector3(r, L, r2 ?? r)); ssGeoM(grp, m, geo, _ssMx);
}
/* raw triangles, wound to face `want`; xf (optional) moves the points after the winding is settled */
function ssTri(grp, m, a, b, c, want, xf) {
  _ssA.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); _ssB.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]); _ssC.crossVectors(_ssA, _ssB);
  if (_ssC.lengthSq() < 1e-12) return;
  if (want && _ssC.x * want[0] + _ssC.y * want[1] + _ssC.z * want[2] < 0) { const t = b; b = c; c = t; }
  if (xf) { a = xf(a); b = xf(b); c = xf(c); }
  _ssA.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); _ssB.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]); _ssC.crossVectors(_ssA, _ssB).normalize();
  const B = ssBin(grp, m); for (const p of [a, b, c]) { B.p.push(p[0], p[1], p[2]); B.n.push(_ssC.x, _ssC.y, _ssC.z); B.u.push(0, 0); }
}
function ssQuad(grp, m, a, b, c, d, want, xf) { ssTri(grp, m, a, b, c, want, xf); ssTri(grp, m, a, c, d, want, xf); }
function ssFlush() {
  for (const b of SS.bins.values()) {
    const n = b.p.length / 3; if (!n) continue;
    const pos = new Float32Array(b.p), nor = new Float32Array(b.n), uv = new Float32Array(b.u), t = b.m.userData.tile;
    if (t) for (let i = 0; i < n; i++) {
      const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2], ax = Math.abs(nor[i * 3]), ay = Math.abs(nor[i * 3 + 1]), az = Math.abs(nor[i * 3 + 2]);
      if (ay > ax && ay > az) { uv[i * 2] = x / t[0]; uv[i * 2 + 1] = -z / t[1]; } else if (ax >= az) { uv[i * 2] = -z / t[0]; uv[i * 2 + 1] = y / t[1]; } else { uv[i * 2] = x / t[0]; uv[i * 2 + 1] = y / t[1]; }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.computeBoundingSphere(); g.computeBoundingBox();
    const me = new THREE.Mesh(g, b.m); me.castShadow = !b.m.userData.noCast && !b.m.transparent; me.receiveShadow = true; if (b.m.transparent) me.renderOrder = 2; b.grp.add(me);
  }
  SS.bins.clear();
}
function ssInst(grp, geo, m, list, o = {}) {
  if (!list.length) return null; if (m === HGM.twigs) { geo = hgTwigGeo(geo.parameters.radius); m = hgTwigMat(); }
  const im = new THREE.InstancedMesh(geo, m, list.length), d = new THREE.Object3D(); d.rotation.order = 'YXZ';
  list.forEach((p, i) => { d.position.set(p[0], p[1], p[2]); d.rotation.set(p[4] || 0, p[3] || 0, p[5] || 0); d.scale.set(p[6] ?? 1, p[7] ?? p[6] ?? 1, p[8] ?? p[6] ?? 1); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
  im.castShadow = o.cast ?? true; im.receiveShadow = true; if (im.computeBoundingSphere) im.computeBoundingSphere(); grp.add(im); if (m === HGTW) (G.noAO = G.noAO || []).push(im); return im;
}
/* colliders for a station-frame rectangle, as squares (the frame is turned ~19° to the world) */
function ssCol(d0, d1, s0, s1, y0, y1, list) {
  const S0 = RT.sSta, L = Math.min(14, d1 - d0, s1 - s0), nd = Math.max(1, Math.ceil((d1 - d0) / L - 1e-6)), ns = Math.max(1, Math.ceil((s1 - s0) / L - 1e-6)), cd = (d1 - d0) / nd, cs = (s1 - s0) / ns, hw = Math.max(cd, cs) * 0.46;
  for (let i = 0; i < nd; i++) for (let j = 0; j < ns; j++) { const p = rtAt(S0 + s0 + (j + 0.5) * cs, d0 + (i + 0.5) * cd); const c = addCollider(p.x - hw, y0, p.z - hw, p.x + hw, y1, p.z + hw, {}); if (list) list.push(c); }
}
function ssW(d, y, s) { const p = rtAt(RT.sSta + s, d); return v3(p.x, y, p.z); }
function ssFrame() { const O = rtAt(RT.sSta, 0), g = new THREE.Group(); g.position.set(O.x, 0, O.z); g.rotation.y = rtAt(RT.sSta).yaw; G.world.add(g); return g; }

/* ---------- textures ---------- */
function ssTex() {
  if (SS.T) return SS.T; const T = SS.T = {};
  const C = (w, h, fn) => { const t = canvasTex(w, h, fn); t.anisotropy = 8; return t; };
  const speck = (c, w, h, n, a, sz = 2) => { for (let i = 0; i < n; i++) { const v = rand(-a, a); c.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; c.fillRect(rand(0, w), rand(0, h), rand(1, sz), rand(1, sz)); } };
  const streaks = (c, w, h, n, col, a0, a1) => { for (let i = 0; i < n; i++) { const x = rand(0, w), wd = rand(3, 18), y = rand(-h * 0.1, h * 0.6), g = c.createLinearGradient(0, y, 0, y + rand(h * 0.2, h * 0.6)); g.addColorStop(0, `rgba(${col},${rand(a0, a1)})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x, y, wd, h); } };
  // red brick, 7.5 cm courses, Flemish-ish bond, mortar joints, the odd overburnt brick (2.4 m tile)
  T.brick = C(512, 512, (c, w, h) => { c.fillStyle = '#c4baa8'; c.fillRect(0, 0, w, h); const rows = 32, rh = h / rows, bl = w / 10;
    for (let r = 0; r < rows; r++) { const hd = r % 2 === 1, L = hd ? bl / 2 : bl, off = [0, bl / 4, bl / 2, -bl / 4][r % 4];
      for (let x = off - bl; x < w + bl; x += L) { const burnt = Math.random() < 0.07, l = burnt ? rand(23, 30) : rand(34, 46);
        c.fillStyle = `hsl(${rand(7, 17)},${rand(40, 58)}%,${l}%)`; c.fillRect(x + 1.5, r * rh + 1.5, L - 3, rh - 3);
        c.fillStyle = 'rgba(255,235,215,.08)'; c.fillRect(x + 1.5, r * rh + 1.5, L - 3, 2); c.fillStyle = 'rgba(30,10,5,.2)'; c.fillRect(x + 1.5, r * rh + rh - 3.5, L - 3, 2); } }
    speck(c, w, h, 14000, 0.09, 2); streaks(c, w, h, 5, '40,25,20', 0.04, 0.09); });
  // cream ashlar (2 m tile, 1.0 × 0.5 m blocks)
  T.stone = C(256, 256, (c, w, h) => { noiseFill(c, w, h, '#ddd5c3', 0.05, 5000, 2); c.fillStyle = 'rgba(110,100,85,.4)'; for (let y = 0; y < h; y += 64) c.fillRect(0, y, w, 1.5);
    for (let y = 0, r = 0; y < h; y += 64, r++) for (let x = (r % 2) * 64; x < w; x += 128) c.fillRect(x, y, 1.5, 64); streaks(c, w, h, 6, '90,80,70', 0.04, 0.1); });
  // rusticated grey granite for the plinth (2 × 1 m tile)
  T.base = C(256, 128, (c, w, h) => { noiseFill(c, w, h, '#8d8982', 0.08, 5000, 2);
    for (let r = 0; r < 2; r++) for (let x = (r % 2) * 64 - 128; x < w; x += 128) { c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x + 3, r * 64 + 3, 122, 3); c.fillRect(x + 3, r * 64 + 3, 3, 58); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 3, r * 64 + 59, 122, 3); c.fillRect(x + 122, r * 64 + 3, 3, 58); c.fillStyle = 'rgba(30,28,26,.6)'; c.fillRect(x, r * 64, 128, 2); c.fillRect(x, r * 64, 2, 64); } });
  // slate: 25 × 20 cm slates in staggered rows
  T.slate = C(256, 256, (c, w, h) => { c.fillStyle = '#2a2f33'; c.fillRect(0, 0, w, h); const rh = h / 10;
    for (let r = 0; r < 10; r++) for (let x = (r % 2) * 16 - 32; x < w + 32; x += 32) { c.fillStyle = `hsl(${rand(200, 216)},${rand(5, 11)}%,${rand(24, 33)}%)`; c.fillRect(x + 1, r * rh + 1, 30, rh - 1); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 1, r * rh + rh - 4, 30, 3); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(x + 1, r * rh + 1, 30, 2); }
    speck(c, w, h, 3000, 0.07, 2); streaks(c, w, h, 4, '200,200,190', 0.03, 0.06); });
  // copper gone green, standing seams every 25 cm, darker runs
  T.copper = C(256, 256, (c, w, h) => { noiseFill(c, w, h, '#5c9f8a', 0.07, 6000, 3); streaks(c, w, h, 14, '30,70,60', 0.06, 0.18); streaks(c, w, h, 8, '190,225,210', 0.05, 0.12);
    for (let x = 0; x < w; x += 32) { c.fillStyle = 'rgba(220,245,235,.35)'; c.fillRect(x, 0, 2, h); c.fillStyle = 'rgba(10,40,30,.35)'; c.fillRect(x + 2, 0, 2, h); } });
  // curtain wall glass: 2 × 3.2 m panes, each its own tint and a soft sky reflection (8 × 12.8 m tile)
  T.glass = C(512, 512, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x0 = i * 128, y0 = j * 128, L = rand(30, 44), g = c.createLinearGradient(x0, y0, x0 + 40, y0 + 128);
      g.addColorStop(0, `hsl(198,${rand(16, 26)}%,${L + 16}%)`); g.addColorStop(0.55, `hsl(202,22%,${L + 4}%)`); g.addColorStop(1, `hsl(208,24%,${L - 4}%)`); c.fillStyle = g; c.fillRect(x0, y0, 128, 128);
      c.fillStyle = `rgba(255,255,255,${rand(0.03, 0.09)})`; c.beginPath(); c.moveTo(x0 + rand(0, 60), y0); c.lineTo(x0 + rand(60, 128), y0); c.lineTo(x0 + rand(20, 80), y0 + 128); c.lineTo(x0, y0 + 128); c.fill();
      c.fillStyle = 'rgba(20,30,36,.5)'; c.fillRect(x0, y0, 128, 1); c.fillRect(x0, y0, 1, 128); } });
  // grey aluminium cladding: 1.5 × 0.75 m panels, joints, grime from the joints down
  const panel = (base, l0, l1) => C(512, 512, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) for (let x = (y / 64 % 2) * 64; x < w + 64; x += 128) { c.fillStyle = `hsl(200,${rand(2, 5)}%,${rand(l0, l1)}%)`; c.fillRect(x - 128 + 1, y + 1, 126, 62); c.fillRect(x + 1, y + 1, 126, 62); }
    c.fillStyle = 'rgba(30,34,38,.65)'; for (let y = 0; y < h; y += 64) c.fillRect(0, y, w, 2); for (let y = 0; y < h; y += 64) for (let x = (y / 64 % 2) * 64; x < w; x += 128) c.fillRect(x, y, 2, 64);
    c.fillStyle = 'rgba(255,255,255,.12)'; for (let y = 2; y < h; y += 64) c.fillRect(0, y, w, 1); speck(c, w, h, 4000, 0.04, 2); streaks(c, w, h, 22, '50,54,58', 0.04, 0.12); });
  T.panel = panel('#a9aeb0', 64, 71); T.panelD = panel('#5c6368', 33, 39);
  // the white standing-seam roof, weathered
  T.roofTop = C(512, 512, (c, w, h) => { noiseFill(c, w, h, '#e7e8e4', 0.03, 6000, 2); for (let i = 0; i < 26; i++) { const x = rand(0, w), y = rand(0, h), r = rand(20, 90), g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(90,92,88,${rand(0.04, 0.1)})`); g.addColorStop(1, 'rgba(90,92,88,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    for (let x = 0; x < w; x += 64) { c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x, 0, 2, h); c.fillStyle = 'rgba(80,84,86,.45)'; c.fillRect(x + 2, 0, 3, h); } });
  T.roofUnder = C(256, 256, (c, w, h) => { noiseFill(c, w, h, '#d9d9d3', 0.03, 2000, 2); c.fillStyle = 'rgba(60,62,64,.45)'; for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 3);
    for (let y = 64; y < h; y += 128) for (let x = 64; x < w; x += 128) { c.fillStyle = '#5a5c5e'; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); c.fillStyle = '#f4f0e4'; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); } });
  // granite plaza pavers, 60 cm
  T.pave = C(512, 512, (c, w, h) => { const p = w / 10; for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) { c.fillStyle = `hsl(${rand(24, 36)},${rand(4, 9)}%,${(i + j) % 7 === 0 ? rand(48, 54) : rand(62, 72)}%)`; c.fillRect(i * p, j * p, p, p); }
    speck(c, w, h, 16000, 0.08, 2); c.fillStyle = 'rgba(40,36,32,.5)'; for (let k = 0; k <= 10; k++) { c.fillRect(k * p - 1, 0, 2, h); c.fillRect(0, k * p - 1, w, 2); }
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(40,38,34,${rand(0.1, 0.3)})`; c.beginPath(); c.arc(rand(0, w), rand(0, h), rand(1.5, 4), 0, TAU); c.fill(); } });
  // mint parking deck with its bays
  T.deck = C(512, 512, (c, w, h) => { noiseFill(c, w, h, '#77baa2', 0.06, 9000, 3); for (let i = 0; i < 12; i++) { const x = rand(0, w), y = rand(0, h), r = rand(30, 120), g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(40,60,52,${rand(0.05, 0.14)})`); g.addColorStop(1, 'rgba(40,60,52,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.fillStyle = 'rgba(245,245,240,.9)'; for (let x = 0; x < w; x += 128) { c.fillRect(x, 0, 5, 232); c.fillRect(x, 280, 5, 232); } c.fillRect(0, 232, w, 4); c.fillRect(0, 276, w, 4);
    c.strokeStyle = 'rgba(30,30,30,.12)'; c.lineWidth = 10; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(rand(0, w), rand(0, h), rand(60, 200), rand(0, 3), rand(3, 6)); c.stroke(); } });
  T.floor = C(256, 256, (c, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.fillStyle = `hsl(36,${rand(10, 16)}%,${rand(76, 82)}%)`; c.fillRect(i * 64, j * 64, 64, 64); } speck(c, w, h, 4000, 0.04, 2); c.fillStyle = 'rgba(90,80,70,.4)'; for (let k = 0; k <= 4; k++) { c.fillRect(k * 64 - 1, 0, 2, h); c.fillRect(0, k * 64 - 1, w, 2); } });
  // rubble: broken concrete, dust, rebar, the odd black void
  T.rubble = C(512, 512, (c, w, h) => { noiseFill(c, w, h, '#625e58', 0.08, 12000, 3);
    for (let i = 0; i < 1600; i++) { const x = rand(0, w), y = rand(0, h), r = rand(4, 20), l = rand(30, 58); c.fillStyle = `hsl(${rand(20, 40)},${rand(2, 8)}%,${l}%)`; c.beginPath(); c.moveTo(x + r, y); for (let k = 1; k < 6; k++) { const a = k / 6 * TAU, rr = r * rand(0.6, 1.2); c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - r * 0.8, y + r * 0.6, r * 1.6, 2); }
    for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(10,9,8,${rand(0.4, 0.8)})`; c.beginPath(); c.ellipse(rand(0, w), rand(0, h), rand(2, 8), rand(1, 5), rand(0, 3), 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(110,60,40,.7)'; c.lineWidth = 1.5; for (let i = 0; i < 60; i++) { const x = rand(0, w), y = rand(0, h); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + rand(-20, 20), y + rand(-20, 20), x + rand(-30, 30), y + rand(-30, 30)); c.stroke(); }
    speck(c, w, h, 6000, 0.08, 2); });
  T.dust = C(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); const g = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(150,144,134,.85)'); g.addColorStop(0.6, 'rgba(150,144,134,.45)'); g.addColorStop(1, 'rgba(150,144,134,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { const a = rand(0, TAU), r = Math.sqrt(Math.random()) * w * 0.48; c.fillStyle = `rgba(${randi(90, 170)},${randi(86, 160)},${randi(80, 150)},${rand(0.2, 0.7) * (1 - r / (w * 0.5))})`; c.fillRect(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r, rand(1, 5), rand(1, 4)); } });
  T.crack = C(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); const cx = rand(80, 176), cy = rand(80, 176); c.strokeStyle = 'rgba(235,245,250,.75)';
    for (let i = 0; i < 16; i++) { c.lineWidth = rand(0.8, 2); c.beginPath(); let x = cx, y = cy; const a = i / 16 * TAU + rand(-0.2, 0.2); c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += Math.cos(a + rand(-0.4, 0.4)) * rand(10, 30); y += Math.sin(a + rand(-0.4, 0.4)) * rand(10, 30); c.lineTo(x, y); } c.stroke(); }
    for (let r = 12; r < 120; r += rand(14, 30)) { c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke(); } c.fillStyle = 'rgba(10,12,14,.8)'; c.beginPath(); c.arc(cx, cy, rand(6, 18), 0, TAU); c.fill(); });
  T.soot = C(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const x = w / 2 + rand(-60, 60), y = h * 0.6 + rand(-50, 50), r = rand(30, 90), g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(8,7,6,${rand(0.15, 0.3)})`); g.addColorStop(1, 'rgba(8,7,6,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); } });
  // signs and boards
  T.signSS = C(1024, 256, (c, w, h) => { c.fillStyle = '#cdd1d3'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(60,66,70,.35)'; for (let x = 0; x < w; x += 128) c.fillRect(x, 0, 2, h); c.fillRect(0, 127, w, 2);
    c.fillStyle = '#1b2530'; c.textAlign = 'left'; c.font = 'bold 168px sans-serif'; c.fillText('서울역', 70, 196); c.font = '600 62px sans-serif'; c.fillText('Seoul Station', 600, 196); });
  T.signDrum = C(1024, 128, (c, w, h) => { c.fillStyle = '#eceeee'; c.fillRect(0, 0, w, h); c.fillStyle = '#9e1c26'; c.textAlign = 'center'; c.font = 'bold 84px sans-serif'; c.fillText('아울렛  OUTLET', w / 2, 98); });
  T.signMart = C(512, 128, (c, w, h) => { c.fillStyle = '#f2f2f0'; c.fillRect(0, 0, w, h); c.fillStyle = '#c3202a'; c.textAlign = 'center'; c.font = 'bold 96px sans-serif'; c.fillText('마트 MART', w / 2, 100); });
  T.board = C(1024, 256, (c, w, h) => { c.fillStyle = '#0a0b0d'; c.fillRect(0, 0, w, h); c.fillStyle = '#1c2a44'; c.fillRect(0, 0, w, 40); c.fillStyle = '#ffffff'; c.font = 'bold 28px sans-serif'; c.textAlign = 'left'; c.fillText('출발  DEPARTURES', 20, 30);
    const rows = [['KTX 001', '부산', '05:15'], ['KTX 101', '목포', '05:30'], ['KTX 003', '부산', '05:57'], ['ITX 1001', '익산', '06:10'], ['KTX 401', '진주', '06:35']];
    rows.forEach(([n, d, t], i) => { const y = 74 + i * 38; c.fillStyle = '#ffb02a'; c.font = '28px monospace'; c.fillText(n, 20, y); c.fillText(d, 230, y); c.fillText(t, 420, y); c.fillStyle = '#ff3a2a'; c.fillText('운행중지 CANCELLED', 600, y); }); });
  T.clock = C(256, 256, (c, w, h) => { c.fillStyle = '#f2efe6'; c.beginPath(); c.arc(128, 128, 126, 0, TAU); c.fill(); c.strokeStyle = '#1a1a1a'; c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 118, 0, TAU); c.stroke();
    for (let k = 0; k < 60; k++) { const a = k / 60 * TAU, r0 = k % 5 ? 108 : 96; c.lineWidth = k % 5 ? 2 : 6; c.beginPath(); c.moveTo(128 + Math.sin(a) * r0, 128 - Math.cos(a) * r0); c.lineTo(128 + Math.sin(a) * 114, 128 - Math.cos(a) * 114); c.stroke(); }
    const hand = (a, L, wd) => { c.lineWidth = wd; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.sin(a) * L, 128 - Math.cos(a) * L); c.stroke(); };
    hand((4 + 17 / 60) / 12 * TAU, 62, 9); hand(17 / 60 * TAU, 92, 5); c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(128, 128, 8, 0, TAU); c.fill(); });
  T.shops = C(768, 128, (c, w, h) => { const names = ['편의점', '카페', '약국', '베이커리', '서점', '기념품']; const cols = ['#1e5aa8', '#3a2a1e', '#1c8a5a', '#b8702a', '#2a3a5a', '#8a2a3a'];
    names.forEach((t, i) => { const x0 = i * 128; c.fillStyle = cols[i]; c.fillRect(x0, 0, 128, 34); c.fillStyle = '#fff'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText(t, x0 + 64, 25);
      const g = c.createLinearGradient(0, 34, 0, h); g.addColorStop(0, '#f6e4c0'); g.addColorStop(1, '#8a7a60'); c.fillStyle = g; c.fillRect(x0 + 4, 38, 120, 86); c.fillStyle = 'rgba(40,30,20,.5)'; for (let k = 0; k < 4; k++) c.fillRect(x0 + 10 + k * 28, 70, 20, 50); c.fillStyle = '#222'; c.fillRect(x0, 34, 4, h); }); });
  return T;
}

/* ---------- materials ---------- */
function ssMats() {
  if (SS.M) return SS.M; const T = ssTex(), M = SS.M = {};
  const mk = (k, o, tile, tex) => { const m = hgMat('ss_' + k, o); if (tex) { m.map = tex; m.needsUpdate = true; } m.userData.tile = tile || null; if (o.noCast) m.userData.noCast = true; return m; };
  const DS = THREE.DoubleSide;
  M.brick = mk('brick', { rough: 0.92 }, [2.4, 2.4], T.brick); M.stone = mk('stone', { rough: 0.78 }, [2, 2], T.stone); M.base = mk('base', { rough: 0.85 }, [2, 1], T.base);
  M.slate = mk('slate', { rough: 0.62, metal: 0.05 }, [2, 2], T.slate); M.copper = mk('copper', { rough: 0.5, metal: 0.25 }, [2, 2], T.copper); M.copperD = mk('copperD', { color: 0x3e7a68, rough: 0.5, metal: 0.3 });
  M.zinc = mk('zinc', { color: 0x6c7276, rough: 0.45, metal: 0.6 }); M.oglass = mk('oglass', { color: 0x1c2830, rough: 0.12, metal: 0.7 }); M.hole = mk('hole', { color: 0x0b0a09, rough: 1 });
  M.door = mk('door', { color: 0x3a2618, rough: 0.6 }); M.sash = mk('sash', { color: 0xe9e6dc, rough: 0.5 });
  M.cw = mk('cw', { color: 0xc6dae0, rough: 0.04, metal: 0.85, transparent: true, opacity: 0.4, side: DS, noCast: true }, [8, 12.8], T.glass);
  M.cwO = mk('cwO', { color: 0xffffff, rough: 0.06, metal: 0.72 }, [8, 12.8], T.glass);
  M.mull = mk('mull', { color: 0xcdd2d4, rough: 0.35, metal: 0.65 }); M.mullD = mk('mullD', { color: 0x3c4348, rough: 0.4, metal: 0.6 });
  M.white = mk('white', { color: 0xeeeeea, rough: 0.5 }); M.fascia = mk('fascia', { color: 0xf1f1ed, rough: 0.4, metal: 0.15, side: DS });
  M.roofTop = mk('roofTop', { rough: 0.45, metal: 0.2 }, [6, 6], T.roofTop); M.roofUnder = mk('roofUnder', { rough: 0.7, side: DS }, [3, 3], T.roofUnder);
  M.sky = mk('sky', { color: 0x86aebf, rough: 0.07, metal: 0.75 }); M.skyU = mk('skyU', { color: 0xdce8ec, rough: 0.3, emissive: 0x7c8c92, ei: 0.35, side: DS });
  M.torn = mk('torn', { color: 0x5c5852, map: 'concrete', rough: 1, side: DS }, [3, 3]); M.steelR = mk('steelR', { color: 0x3a3430, rough: 0.6, metal: 0.6 });
  M.panel = mk('panel', { rough: 0.5, metal: 0.3 }, [6, 6], T.panel); M.panelD = mk('panelD', { rough: 0.5, metal: 0.3 }, [6, 6], T.panelD);
  M.deck = mk('deck', { rough: 0.9 }, [10, 10], T.deck); M.pave = mk('pave', { rough: 0.88 }, [6, 6], T.pave); M.floor = mk('floor', { rough: 0.25 }, [4, 4], T.floor);
  M.conc = mk('conc', { color: 0xb6b2aa, map: 'concrete', rough: 0.95 }, [4, 4]); M.concD = mk('concD', { color: 0x8a8680, map: 'concrete', rough: 1 }, [4, 4]);
  M.light = mk('light', { color: 0xfff4dc, emissive: 0xffe6bc, ei: 1.1, rough: 0.5 }); M.shopGlass = mk('shopGlass', { color: 0x6a6660, emissive: 0xffffff, ei: 0.5, rough: 0.08, metal: 0.35 }, [54, 6.2], T.shops); M.shopGlass.emissiveMap = T.shops;
  M.rubber = mk('rubber', { color: 0x151515, rough: 0.7 }); M.tread = mk('tread', { color: 0x4a4e52, rough: 0.5, metal: 0.6 });
  M.balG = mk('balG', { color: 0xd8ecf0, rough: 0.05, metal: 0.5, transparent: true, opacity: 0.28, side: DS, noCast: true });
  M.dome = mk('dome', { color: 0x6aa896, rough: 0.06, metal: 0.6, transparent: true, opacity: 0.55, side: DS, noCast: true }); M.domeF = mk('domeF', { color: 0xdfe6e4, rough: 0.4, metal: 0.5 });
  M.soil = mk('soil', { color: 0x3e3226, rough: 1 }); M.shrub = mk('shrub', { color: 0x3a4a2e, rough: 1 }); M.pine = mk('pine', { color: 0x283a28, rough: 0.95 }); M.bark = hgMat('bark', { color: 0x4a4038, rough: 1 });
  M.sand = mk('sand', { color: 0xa39374, rough: 1 }); M.rubble = mk('rubble', { rough: 1 }, [9, 9], T.rubble);
  M.shard = mk('shard', { color: 0xc4dae2, rough: 0.05, metal: 0.9, side: DS }); M.rebar = mk('rebar', { color: 0x6a4030, rough: 0.8, metal: 0.4 });
  const tm = (key, o) => HGM[key] || (HGM[key] = new THREE.MeshStandardMaterial(o));
  M.signSS = tm('ss_signSS', { map: T.signSS, roughness: 0.6 }); M.signDrum = tm('ss_signDrum', { map: T.signDrum, roughness: 0.5 }); M.signMart = tm('ss_signMart', { map: T.signMart, roughness: 0.5 });
  M.board = tm('ss_board', { map: T.board, emissive: 0xffffff, emissiveMap: T.board, emissiveIntensity: 0.9, roughness: 0.4 }); M.clock = tm('ss_clock', { map: T.clock, roughness: 0.5 });
  M.shops = tm('ss_shops', { map: T.shops, emissive: 0xffffff, emissiveMap: T.shops, emissiveIntensity: 0.55, roughness: 0.4 });
  M.dust = tm('ss_dust', { map: T.dust, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, roughness: 1, alphaTest: 0.01 });
  M.crack = tm('ss_crack', { map: T.crack, transparent: true, depthWrite: false, roughness: 0.2, alphaTest: 0.01, side: DS });
  M.soot = HGM.ss_soot || (HGM.ss_soot = new THREE.MeshBasicMaterial({ map: T.soot, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, side: DS }));
  for (const k of ['signSS', 'signDrum', 'signMart', 'board', 'clock', 'shops', 'dust', 'crack']) M[k].userData.tile = null;
  return M;
}

/* ---------- 문화역서울284: windows, quoins, mansards, the dome ---------- */
function ssFacePt(face, f, u, y, w) { return face === 'e' ? [f + w, y, -u] : face === 'w' ? [f - w, y, -u] : face === 's' ? [u, y, -(f - w)] : [u, y, -(f + w)]; }
function ssFaceRY(face) { return face === 'e' ? Math.PI / 2 : face === 'w' ? -Math.PI / 2 : face === 's' ? 0 : Math.PI; }
function ssFaceBox(grp, m, face, f, u, y, w, du, dv, dw) { const [x, yy, z] = ssFacePt(face, f, u, y, w), ew = face === 'e' || face === 'w'; ssGeo(grp, m, SSBOX, x, yy, z, 0, 0, 0, ew ? dw : du, dv, ew ? du : dw); }
function ssFaceGeo(grp, m, geo, face, f, u, y, w, sx, sy, sz = 1) { const [x, yy, z] = ssFacePt(face, f, u, y, w); ssGeo(grp, m, geo, x, yy, z, ssFaceRY(face), 0, 0, sx, sy, sz); }
function ssWindow(grp, M, face, f, u, y0, W, H, o = {}) {
  const r = W / 2, broken = Math.random() < (o.broken ?? 0.12), gm = o.door ? M.door : broken ? M.hole : M.oglass;
  ssFaceBox(grp, gm, face, f, u, y0 + H / 2, 0.03, W, H, 0.04);
  if (o.arch) ssFaceGeo(grp, gm, SSHALF, face, f, u, y0 + H, 0.05, r, r);
  ssFaceBox(grp, M.stone, face, f, u - r - 0.15, y0 + H / 2, 0.08, 0.3, H, 0.17); ssFaceBox(grp, M.stone, face, f, u + r + 0.15, y0 + H / 2, 0.08, 0.3, H, 0.17);
  if (!o.door) ssFaceBox(grp, M.stone, face, f, u, y0 - 0.1, 0.14, W + 0.7, 0.2, 0.28);
  if (o.arch) { ssFaceGeo(grp, M.stone, SSARCH, face, f, u, y0 + H, 0.09, r + 0.15, r + 0.15, 1.4); ssFaceBox(grp, M.stone, face, f, u, y0 + H + r + 0.12, 0.13, 0.42, 0.66, 0.26); }
  else { ssFaceBox(grp, M.stone, face, f, u, y0 + H + 0.2, 0.1, W + 0.6, 0.42, 0.2); ssFaceBox(grp, M.stone, face, f, u, y0 + H + 0.26, 0.15, 0.44, 0.66, 0.28); }
  if (!broken && !o.door) { ssFaceBox(grp, M.sash, face, f, u, y0 + H / 2, 0.07, 0.08, H, 0.05); ssFaceBox(grp, M.sash, face, f, u, y0 + H * 0.64, 0.07, W, 0.08, 0.05); ssFaceBox(grp, M.sash, face, f, u, y0 + 0.05, 0.07, W, 0.1, 0.05);
    if (o.arch) ssFaceGeo(grp, M.sash, SSARCHT, face, f, u, y0 + H, 0.07, r * 0.98, r * 0.98, 1); }
  if (broken && Math.random() < 0.6) ssFaceGeo(grp, M.soot, SSDISC, face, f, u, y0 + H + 0.9, 0.2, W * 1.1, H * 0.9);
}
function ssOldStation(g, M, cols) {
  const blk = (d0, d1, s0, s1, h, o = {}) => {
    const band = o.band ?? 5.5, corn = o.corn ?? 0.45;
    ssBox(g, M.brick, d0, d1, 1.3, h, s0, s1);
    ssBox(g, M.base, d0 - 0.18, d1 + 0.18, 0, 1.3, s0 - 0.18, s1 + 0.18); ssBox(g, M.base, d0 - 0.26, d1 + 0.26, 1.2, 1.42, s0 - 0.26, s1 + 0.26);
    ssBox(g, M.stone, d0 - 0.12, d1 + 0.12, band, band + 0.45, s0 - 0.12, s1 + 0.12);
    ssBox(g, M.stone, d0 - 0.16, d1 + 0.16, h - 1.0, h - 0.4, s0 - 0.16, s1 + 0.16);   // frieze
    ssBox(g, M.stone, d0 - corn * 0.6, d1 + corn * 0.6, h - 0.4, h - 0.15, s0 - corn * 0.6, s1 + corn * 0.6); ssBox(g, M.stone, d0 - corn, d1 + corn, h - 0.15, h + 0.12, s0 - corn, s1 + corn); // cornice
    for (let s = s0 + 0.6; s < s1 - 0.3; s += 0.9) for (const d of [d0 - 0.26, d1 + 0.26]) ssBox(g, M.stone, d - 0.1, d + 0.1, h - 0.62, h - 0.42, s - 0.18, s + 0.18); // dentils
    if (!o.noQuoin) for (const [cd, cs, ed, es] of [[d0, s0, -1, -1], [d1, s0, 1, -1], [d0, s1, -1, 1], [d1, s1, 1, 1]]) for (let y = 1.42, k = 0; y < h - 1.3; y += 0.62, k++) {
      const La = k % 2 ? 0.55 : 1.0, Lb = k % 2 ? 1.0 : 0.55;
      ssBox(g, M.stone, cd - ed * 0.02, cd + ed * 0.08, y, y + 0.56, cs + es * 0.08, cs - es * La); ssBox(g, M.stone, cd + ed * 0.08, cd - ed * Lb, y, y + 0.56, cs - es * 0.02, cs + es * 0.08); }
    if (o.col !== false) ssCol(d0, d1, s0, s1, 0, h + (o.colTop || 4), cols);
  };
  const W = (face, f, u, y0, w, h, o) => ssWindow(g, M, face, f, u, y0, w, h, o);
  // centre block, entrance bay, wings, end pavilions, the annex north of it
  blk(-107, -85, 156, 180, 16, { band: 7.2, corn: 0.6, colTop: 18 });
  blk(-85, -84, 162, 174, 17.4, { band: 7.2, corn: 0.5, noQuoin: true, col: false });
  blk(-105, -87, 138, 156, 12); blk(-105, -87, 180, 198, 12);
  blk(-106, -85.5, 130, 138, 13.6, { colTop: 6 }); blk(-106, -85.5, 198, 206, 13.6, { colTop: 6 });
  blk(-104, -89, 206, 250, 7, { band: 3.6, noQuoin: true, colTop: 2 });
  // wing windows: arched below, square-headed above, pilaster strips between the bays
  const wingBays = [[140.25, 144.75, 149.25, 153.75], [182.25, 186.75, 191.25, 195.75]];
  for (const bays of wingBays) for (const [face, f] of [['e', -87], ['w', -105]]) {
    for (const u of bays) { W(face, f, u, 1.75, 2.0, 2.3, { arch: true }); W(face, f, u, 7.0, 1.8, 2.7); }
    for (let k = 0; k < 3; k++) ssFaceBox(g, M.stone, face, f, (bays[k] + bays[k + 1]) / 2, 6.6, 0.07, 0.45, 10.4, 0.14); }
  for (const [u0, u1] of [[132.2, 135.8], [200.2, 203.8]]) for (const [face, f] of [['e', -85.5], ['w', -106]]) for (const u of [u0, u1]) { W(face, f, u, 1.75, 1.7, 2.4, { arch: true }); W(face, f, u, 7.0, 1.6, 2.8); W(face, f, u, 11.0, 1.0, 1.2, { broken: 0.05 }); }
  for (const u of [-102.6, -98.2, -93.4, -89]) { W('s', 130, u, 1.75, 1.7, 2.4, { arch: true }); W('s', 130, u, 7.0, 1.6, 2.8); W('n', 206, u, 8.0, 1.6, 2.6); }
  for (const u of [158.6, 163.4, 168, 172.6, 177.4]) { W('w', -107, u, 1.8, 2.2, 3.0, { arch: true }); W('w', -107, u, 8.8, 2.0, 3.4); }
  for (let u = 209; u < 248; u += 4.2) { W('e', -89, u, 0.3, 2.6, 3.0, { arch: true, door: true }); ssFaceBox(g, M.stone, 'e', -89, u + 2.1, 3.2, 0.06, 0.5, 5.6, 0.16); }
  // the entrance bay: three arched doorways, pilasters, the balcony, the great semicircular window, a segmental pediment
  for (const u of [164.6, 168, 171.4]) W('e', -84, u, 0.2, 2.6, 3.4, { arch: true, door: true });
  for (const u of [162.6, 166.3, 169.7, 173.4]) ssFaceBox(g, M.stone, 'e', -84, u, 3.2, 0.12, 0.6, 6.0, 0.24);
  ssFaceBox(g, M.stone, 'e', -84, 168, 6.3, 0.6, 9.4, 0.3, 1.2); for (let u = 164; u <= 172; u += 0.5) ssFaceGeo(g, M.stone, SSCYL6, 'e', -84, u, 6.9, 1.05, 0.09, 0.9, 0.09);
  ssFaceBox(g, M.stone, 'e', -84, 168, 7.4, 1.05, 9.4, 0.18, 0.16);
  ssFaceBox(g, M.stone, 'e', -84, 168, 10.0, 0.12, 9.6, 0.4, 0.3);
  ssFaceGeo(g, M.oglass, SSHALF, 'e', -84, 168, 10.2, 0.03, 4.3, 4.3); ssFaceGeo(g, M.stone, SSARCH, 'e', -84, 168, 10.2, 0.12, 4.5, 4.5, 2.2);
  ssFaceBox(g, M.stone, 'e', -84, 168, 14.7, 0.22, 0.9, 1.2, 0.4);
  { const c = ssFacePt('e', -84, 168, 10.2, 0.08); for (let k = 1; k < 6; k++) { const a = k / 6 * Math.PI, e = ssFacePt('e', -84, 168 - Math.cos(a) * 4.3, 10.2 + Math.sin(a) * 4.3, 0.08); ssBeam(g, M.sash, c, e, 0.06, SSCYL6); }
    for (const rr of [1.6, 3.0]) ssFaceGeo(g, M.sash, SSARCHT, 'e', -84, 168, 10.2, 0.08, rr, rr, 2); }
  { const sh = new THREE.Shape(); sh.moveTo(-6.4, 0); sh.absellipse(0, 0, 6.4, 1.9, Math.PI, 0, true); sh.lineTo(-6.4, 0); const ge = new THREE.ExtrudeGeometry(sh, { depth: 0.9, bevelEnabled: false, curveSegments: 20 }); ssGeo(g, M.stone, ge, -84.7, 17.4, -168, Math.PI / 2); ge.dispose();
    ssFaceGeo(g, M.stone, SSRING, 'e', -84, 168, 18.0, 0.25, 0.8, 0.8, 3); ssFaceGeo(g, M.copperD, SSDISC, 'e', -84, 168, 18.0, 0.22, 0.75, 0.75); }
  // the two small towers flanking the bay
  for (const u of [160.3, 175.7]) { blk(-86.1, -82.7, u - 1.7, u + 1.7, 17.6, { band: 7.2, corn: 0.3, colTop: 6 });
    W('e', -82.7, u, 8.4, 0.75, 1.7, { arch: true, broken: 0.05 }); W('e', -82.7, u, 13.2, 0.75, 1.5, { arch: true, broken: 0.05 });
    ssGeo(g, M.stone, new THREE.CylinderGeometry(1.55, 1.7, 2.6, 8), -84.4, 19.1, -u); ssGeo(g, M.stone, new THREE.CylinderGeometry(1.9, 1.9, 0.35, 8), -84.4, 20.5, -u);
    ssGeo(g, M.copper, new THREE.SphereGeometry(1.6, 20, 10, 0, TAU, 0, Math.PI / 2), -84.4, 20.65, -u, 0, 0, 0, 1, 1.5, 1);
    ssBeam(g, M.copperD, [-84.4, 23, -u], [-84.4, 24.6, -u], 0.08); ssGeo(g, M.copperD, new THREE.SphereGeometry(0.22, 10, 8), -84.4, 24.6, -u); }
  // roofs: mansards on the wings with dormers and chimneys, steep hips on the pavilions, the centre hip under the drum
  const mans = (dc, s0, s1, y0, half) => { const sh = new THREE.Shape(); sh.moveTo(-half - 0.3, y0); sh.lineTo(-half + 1.0, y0 + 3.2); sh.lineTo(0, y0 + 4.4); sh.lineTo(half - 1.0, y0 + 3.2); sh.lineTo(half + 0.3, y0); sh.lineTo(-half - 0.3, y0);
    const ge = new THREE.ExtrudeGeometry(sh, { depth: s1 - s0, bevelEnabled: false }); ssGeo(g, M.slate, ge, dc, 0, -s1); ge.dispose();
    ssBox(g, M.zinc, dc - 0.18, dc + 0.18, y0 + 4.32, y0 + 4.62, s0, s1); for (const e of [-1, 1]) ssBox(g, M.zinc, dc + e * (half - 1.0) - 0.12, dc + e * (half - 1.0) + 0.12, y0 + 3.12, y0 + 3.3, s0, s1);
    for (let s = s0 + 0.8; s < s1; s += 1.6) ssBeam(g, M.zinc, [dc, y0 + 4.62, -s], [dc, y0 + 5.3, -s], 0.03, SSCYL6); };
  mans(-96, 138, 156, 12.1, 9); mans(-96, 180, 198, 12.1, 9);
  for (const bays of wingBays) for (const u of bays) for (const e of [1, -1]) { const f = e > 0 ? -87.25 : -104.75, d1 = f - e * 1.7;
    ssBox(g, M.stone, f, d1, 12.6, 14.8, u - 0.85, u + 0.85); ssBox(g, M.slate, f + e * 0.15, d1, 14.8, 15.05, u - 1.05, u + 1.05); ssBox(g, M.slate, f + e * 0.05, d1, 15.05, 15.3, u - 0.75, u + 0.75);
    ssFaceBox(g, Math.random() < 0.15 ? M.hole : M.oglass, e > 0 ? 'e' : 'w', f, u, 13.75, 0.02, 0.9, 1.5, 0.04); ssFaceGeo(g, M.stone, SSARCH, e > 0 ? 'e' : 'w', f, u, 14.5, 0.08, 0.55, 0.55, 1.2); }
  for (const u of [141, 153, 183, 195]) { ssBox(g, M.brick, -97, -95.6, 15.5, 18.6, u - 0.6, u + 0.6); ssBox(g, M.stone, -97.25, -95.35, 18.6, 18.95, u - 0.85, u + 0.85); for (const k of [-0.3, 0.3]) ssBeam(g, M.concD, [-96.3, 18.9, -(u + k)], [-96.3, 19.4, -(u + k)], 0.14); }
  for (const s of [134, 202]) { ssGeo(g, M.slate, hgFrustum(21.4, 9.0, 12.4, 1.4, 5.6), -95.75, 13.7 + 2.8, -s); ssBox(g, M.zinc, -102, -89.5, 19.5, 19.85, s - 0.2, s + 0.2);
    for (const e of [-1, 1]) { ssBeam(g, M.zinc, [-95.75 + e * 6.2, 19.85, -s], [-95.75 + e * 6.2, 21.4, -s], 0.07); ssGeo(g, M.zinc, new THREE.SphereGeometry(0.2, 8, 6), -95.75 + e * 6.2, 21.4, -s); } }
  ssGeo(g, M.slate, hgFrustum(22.8, 24.8, 13.4, 13.4, 2.6), -96, 16.12 + 1.3, -168);
  ssGeo(g, M.slate, hgFrustum(15.2, 44.6, 9.5, 39, 2.4), -96.5, 7.12 + 1.2, -228);
  // the drum and the dome
  ssBox(g, M.stone, -102, -90, 18.4, 22, 162, 174); ssBox(g, M.brick, -101.6, -90.4, 16.4, 18.4, 162.4, 173.6);
  for (const [d, s] of [[-102, 162], [-90, 162], [-102, 174], [-90, 174]]) ssBox(g, M.stone, d - 0.6, d + 0.6, 16.4, 22, s - 0.6, s + 0.6);
  ssBox(g, M.stone, -102.6, -89.4, 21.8, 22.5, 161.4, 174.6);
  for (const face of ['w', 'n', 's']) { const f = face === 'w' ? -102 : face === 'n' ? 174 : 162, u = face === 'w' ? 168 : -96; ssFaceGeo(g, M.oglass, SSDISC, face, f, u, 19.6, 0.03, 1.2, 1.2); ssFaceGeo(g, M.stone, SSRING, face, f, u, 19.6, 0.08, 1.35, 1.35, 2); }
  ssFaceGeo(g, M.clock, SSDISC, 'e', -90, 168, 19.6, 0.04, 1.35, 1.35); ssFaceGeo(g, M.copperD, SSRING, 'e', -90, 168, 19.6, 0.08, 1.42, 1.42, 2);
  ssGeo(g, M.stone, new THREE.CylinderGeometry(5.4, 5.4, 3.0, 40), -96, 24.0, -168);
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + 0.2; ssGeo(g, M.oglass, SSBOX, -96 + Math.sin(a) * 5.42, 24.0, -168 + Math.cos(a) * 5.42, a, 0, 0, 0.9, 1.6, 0.06); ssGeo(g, M.stone, SSBOX, -96 + Math.sin(a + TAU / 16) * 5.5, 24.0, -168 + Math.cos(a + TAU / 16) * 5.5, a, 0, 0, 0.5, 3.0, 0.2); }
  ssGeo(g, M.stone, new THREE.CylinderGeometry(5.85, 5.85, 0.5, 40), -96, 25.6, -168);
  ssGeo(g, M.copper, new THREE.SphereGeometry(5.9, 44, 16, 0, TAU, 0, Math.PI / 2), -96, 25.85, -168, 0, 0, 0, 1, 1.12, 1);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; let prev = null; for (let i = 0; i <= 8; i++) { const ph = i / 8 * Math.PI / 2 * 0.93, p = [-96 + Math.sin(a) * Math.cos(ph) * 6.0, 25.85 + Math.sin(ph) * 6.0 * 1.12, -168 + Math.cos(a) * Math.cos(ph) * 6.0]; if (prev) ssBeam(g, M.copperD, prev, p, 0.15, SSCYL6); prev = p; } }
  for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + Math.PI / 4, ph = 0.42; ssGeo(g, M.oglass, SSDISC, -96 + Math.sin(a) * Math.cos(ph) * 6.02, 25.85 + Math.sin(ph) * 6.72, -168 + Math.cos(a) * Math.cos(ph) * 6.02, a, -ph * 0.9, 0, 0.55, 0.55); }
  ssGeo(g, M.copper, new THREE.CylinderGeometry(1.3, 1.3, 2.2, 16), -96, 33.2, -168); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ssGeo(g, M.oglass, SSBOX, -96 + Math.sin(a) * 1.32, 33.2, -168 + Math.cos(a) * 1.32, a, 0, 0, 0.45, 1.2, 0.04); }
  ssGeo(g, M.copper, new THREE.SphereGeometry(1.45, 20, 8, 0, TAU, 0, Math.PI / 2), -96, 34.3, -168, 0, 0, 0, 1, 0.8, 1);
  ssBeam(g, M.copperD, [-96, 35.4, -168], [-96, 37.6, -168], 0.07); ssGeo(g, M.copperD, new THREE.SphereGeometry(0.26, 10, 8), -96, 36.6, -168);
}

/* ---------- the KTX roof: one surface, its plan curving round the outlet block, high over the hall and falling to the south ---------- */
function ssYR(s) { if (s <= 64) { const t = Math.max(0, (s + 62) / 126); return 33 - 21 * (1 - t) * (1 - t); } const k = (s - 64) / 46; return 33 - 9 * k * k; }
function ssYT(s, d) { return ssYR(s) - 0.012 * Math.max(0, -80 - d); }
function ssDE(s) { return -76 + 5 * Math.sin(Math.PI * Math.min(1, Math.max(0, (s + 62) / 132))); }
function ssSN(d) { const x = -205 - d; return 70 + (x > 0 ? 0.42 * x * x / (x + 25) : 0); }
function ssSS(d) { return -62 + 22 * ssSm(-118, -160, d); }
function ssRoofFall(s, d) { return s < SS.CUT + ssJag(d) && d > -150 + ssJag(s * 1.3, 0.7); }
function ssRoof(K, M) {
  const CUT = SS.CUT, TH = SS.TH, NU = 76, NV = 64, N1 = NV + 1;
  const S = new Float32Array((NU + 1) * N1), D = new Float32Array((NU + 1) * N1);
  for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) { const u = i / NU, v = j / NV, d0 = -71 - 229 * v, s = ssSS(d0) + (ssSN(d0) - ssSS(d0)) * u, de = ssDE(s); S[i * N1 + j] = s; D[i * N1 + j] = de + (-300 - de) * v; }
  const top = (k) => [D[k], ssYT(S[k], D[k]), -S[k]], bot = (k) => [D[k], ssYT(S[k], D[k]) - TH, -S[k]];
  const cls = new Int8Array(NU * NV);
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * N1 + j, sc = (S[a] + S[a + N1] + S[a + 1] + S[a + N1 + 1]) / 4, dc = (D[a] + D[a + N1] + D[a + 1] + D[a + N1 + 1]) / 4;
    cls[i * NV + j] = ssRoofFall(sc, dc) ? (sc > CUT - 22 && dc < -86 && dc > -146 ? 2 : 1) : 0; }
  // the flap: hinged at the break, a first leaf dropping ~30°, then folding down steeply
  const rot = (ds, dy, a) => [ds * Math.cos(a) - dy * Math.sin(a), ds * Math.sin(a) + dy * Math.cos(a)];
  const flapX = (p) => { const d = p[0], s = -p[2], sh = CUT + 2.6 * Math.sin(d * 0.23 + 0.7) - 2.5, yh = ssYT(sh, d) - TH / 2, a1 = 0.5 + 0.05 * Math.sin(d * 0.05), a2 = 1.02 + 0.06 * Math.sin(d * 0.07), L1 = 10;
    const ds = s - sh, dy = p[1] - yh; if (ds >= 0) return p; if (-ds <= L1) { const [a, b] = rot(ds, dy, a1); return [d, yh + b, -(sh + a)]; }
    const [fa, fb] = rot(-L1, 0, a1), [ra, rb] = rot(ds + L1, dy, a2); return [d, yh + fb + rb, -(sh + fa + ra)]; };
  const stub = []; const UP = [0, 1, 0], DN = [0, -1, 0];
  const gOf = (c) => (c === 0 ? K.keep : K.fall);
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const c = cls[i * NV + j], k00 = i * N1 + j, k10 = k00 + N1, k11 = k10 + 1, k01 = k00 + 1, sc = (S[k00] + S[k11]) / 2;
    const sky = false, mt = sky ? M.sky : M.roofTop, mb = sky ? M.skyU : M.roofUnder, g = gOf(c);
    ssQuad(g, mt, top(k00), top(k10), top(k11), top(k01), UP); ssQuad(g, mb, bot(k00), bot(k10), bot(k11), bot(k01), DN);
    if (c === 2) { ssQuad(K.ruin, mt, top(k00), top(k10), top(k11), top(k01), UP, flapX); ssQuad(K.ruin, mb, bot(k00), bot(k10), bot(k11), bot(k01), DN, flapX); }
    // the four edges: the outer rim gets the white fascia; a break between kept and fallen roof gets a torn edge in the ruin
    for (const [ka, kb, ni, nj] of [[k00, k01, i - 1, j], [k10, k11, i + 1, j], [k00, k10, i, j - 1], [k01, k11, i, j + 1]]) {
      const out = ni < 0 || nj < 0 || ni >= NU || nj >= NV, nc = out ? -1 : cls[ni * NV + nj];
      const mx = (D[ka] + D[kb]) / 2, mz = -(S[ka] + S[kb]) / 2, cx = (D[k00] + D[k11]) / 2, cz = -sc, want = [mx - cx, 0, mz - cz];
      if (out) { ssQuad(g, M.fascia, top(ka), top(kb), bot(kb), bot(ka), want); if (c === 2) ssQuad(K.ruin, M.fascia, top(ka), top(kb), bot(kb), bot(ka), want, flapX); continue; }
      if (c === 0 && nc !== 0) { ssQuad(K.ruin, M.torn, top(ka), top(kb), bot(kb), bot(ka), want); if (Math.random() < 0.7) stub.push([mx, mz, want, (ssYT(S[ka], D[ka]) - TH / 2)]); }
      if (c === 2 && nc !== 2) ssQuad(K.ruin, M.torn, top(ka), top(kb), bot(kb), bot(ka), want, flapX);
    }
  }
  // skylight bands: straight strips across the roof, a hand's breadth proud of it, aluminium edges
  for (let sk = -54; sk < 108; sk += 13) for (let d0 = -84; d0 > -296; d0 -= 4) { const d1 = d0 - 4, s0 = sk, s1 = sk + 2.6, dm = (d0 + d1) / 2;
    if (s0 < ssSS(d0) + 3 || s0 < ssSS(d1) + 3 || s1 > ssSN(d0) - 3 || s1 > ssSN(d1) - 3 || d0 > ssDE(s0) - 4 || d0 > ssDE(s1) - 4) continue;
    const g = ssRoofFall((s0 + s1) / 2, dm) ? K.fall : K.keep, P = (s, d, e = 0.08) => [d, ssYT(s, d) + e, -s];
    ssQuad(g, M.sky, P(s0, d0), P(s0, d1), P(s1, d1), P(s1, d0), UP); for (const s of [s0, s1]) ssQuad(g, M.mull, P(s - 0.12, d0, 0.1), P(s - 0.12, d1, 0.1), P(s + 0.12, d1, 0.1), P(s + 0.12, d0, 0.1), UP); }
  // steel purlins and decking torn out along the break
  for (const [x, z, w, y] of stub) { const l = Math.hypot(w[0], w[2]) || 1, L = rand(1.2, 4.5); ssBeam(K.ruin, M.steelR, [x, y + rand(-0.6, 0.6), z], [x + w[0] / l * L, y - rand(0.3, 2.5), z + w[2] / l * L], rand(0.12, 0.2), SSBOX); }
  // tree columns over the tracks
  for (const d of [-158, -188, -218, -248, -278]) for (let s = ssSS(d) + 8; s < ssSN(d) - 6; s += 16) {
    const yb = ssYT(s, d) - TH, g = ssRoofFall(s, d) ? K.fall : K.keep, h0 = yb - 5.5;
    ssGeo(g, M.white, new THREE.CylinderGeometry(0.42, 0.62, h0, 14), d, HR.deck + h0 / 2, -s);
    for (const [a, b] of [[3, 3], [-3, 3], [3, -3], [-3, -3]]) ssBeam(g, M.white, [d, HR.deck + h0 - 0.2, -s], [d + a, ssYT(s - b, d + a) - TH, -(s - b)], 0.2);
    ssCol(d - 1, d + 1, s - 1, s + 1, 0, yb, g === K.fall ? SS.fallCols : null);
  }
  // coarse colliders for the roof itself, so aircraft keep above it
  for (let s = -50; s < 100; s += 25) for (let d = -290; d < -80; d += 30) { if (s > ssSN(d) - 5 || s < ssSS(d) + 5) continue; const y = ssYT(s + 12, d + 15); ssCol(d, d + 30, s, s + 25, y - 3, y, ssRoofFall(s + 12, d + 15) ? SS.fallCols : null); }
}

/* ---------- the KTX hall: glass front, floors, mezzanine, shops, boards, doors ---------- */
function ssHall(K, M) {
  const CUT = SS.CUT, TH = SS.TH, yb = (s, d = -80) => ssYT(s, d) - TH - 0.12;
  const fallS = (s, k = 1) => s < CUT + ssJag(k * 5.3 + 2, 0.7);
  // the glass front, pane by pane (some already shot out), mullions and transoms, the white floor band at concourse level
  const cut = (y) => CUT + ssJag(y * 2.1 + 5, 0.8);
  for (let s0 = -52; s0 < 52; s0 += 2) {
    const s1 = s0 + 2, sc = s0 + 1, top0 = yb(s0), top1 = yb(s1);
    const rows = []; if (sc < -40) rows.push(0, 3.2); for (let y = 6.4; y < Math.max(top0, top1) - 0.2; y += 3.2) rows.push(y);
    for (const y0 of rows) { const fall = sc < cut(y0 + 1.6), g = fall ? K.fall : K.keep, ya = Math.min(y0 + 3.2, top0), yb2 = Math.min(y0 + 3.2, top1); if (ya <= y0 + 0.05) continue;
      if (Math.random() < 0.05) { if (Math.random() < 0.5) ssTri(g, M.cw, [-80, y0, -s0], [-80, y0, -s1], [-80, y0 + rand(0.4, 1.6), -s0 + rand(-1.6, -0.2)], [1, 0, 0]); }
      else { ssQuad(g, M.cw, [-80, y0, -s0], [-80, y0, -s1], [-80, yb2, -s1], [-80, ya, -s0], [1, 0, 0]); if (!fall && sc < CUT + 14 && Math.random() < 0.55) ssQuad(K.ruin, M.crack, [-79.95, y0, -s0], [-79.95, y0, -s1], [-79.95, yb2, -s1], [-79.95, ya, -s0], [1, 0, 0]); }
      if (y0 + 3.2 < Math.min(top0, top1)) ssBox(g, M.mull, -80.4, -79.9, y0 + 3.13, y0 + 3.27, s0, s1);
      if (Math.abs(y0 - 6.4) < 0.01) ssBox(g, M.white, -80.55, -79.75, 6.12, 7.08, s0, s1);
    }
    const g = sc - 1 < cut(12) ? K.fall : K.keep; ssBox(g, M.mull, -80.55, -79.9, sc < -40 ? 0 : 6.4, top0, s0 - 0.07, s0 + 0.07); ssBox(g, M.mullD, -80.9, -80.55, sc < -40 ? 0 : 6.4, top0, s0 - 0.04, s0 + 0.04);
  }
  ssBox(K.keep, M.mull, -80.55, -79.9, 6.4, yb(52), 51.93, 52.07);
  // the south end of the hall, glazed too
  for (let d0 = -80; d0 > -135; d0 -= 2.75) { const d1 = d0 - 2.75, t0 = yb(-52, d0), t1 = yb(-52, d1); for (let y0 = 0; y0 < Math.max(t0, t1) - 0.2; y0 += 3.2) { const ya = Math.min(y0 + 3.2, t0), yb2 = Math.min(y0 + 3.2, t1); ssQuad(K.fall, M.cw, [d0, y0, 52], [d1, y0, 52], [d1, yb2, 52], [d0, ya, 52], [0, 0, 1]); if (y0 + 3.2 < Math.min(t0, t1)) ssBox(K.fall, M.mull, d0, d1, y0 + 3.13, y0 + 3.27, -52.2, -51.8); }
    ssBox(K.fall, M.mull, d1 - 0.07, d1 + 0.07, 0, t1, -52.4, -51.8); }
  // back wall (to the tracks) and the north wall beside the drum
  for (let s0 = -52; s0 < 56; s0 += 4) { const s1 = s0 + 4, g = fallS(s0 + 2, 2) ? K.fall : K.keep, t0 = yb(s0, -135), t1 = yb(s1, -135);
    ssQuad(g, M.panel, [-135, 0, -s0], [-135, 0, -s1], [-135, t1, -s1], [-135, t0, -s0], [1, 0, 0]); ssQuad(g, M.panelD, [-135.4, 0, -s0], [-135.4, 0, -s1], [-135.4, t1, -s1], [-135.4, t0, -s0], [-1, 0, 0]); }
  ssBox(K.keep, M.panel, -135, -97, 0, yb(56, -97), 55.6, 56.2);
  // floors: the concourse (6.6) across the hall, a mezzanine (13.4) along the back; both break along a ragged line
  const slab = (grp, m, poly, y, th) => { const sh = new THREE.Shape(poly.map(([d, s]) => new THREE.Vector2(d, s))); const ge = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }); ge.rotateX(-Math.PI / 2); ssGeo(grp, m, ge, 0, y - th, 0); ge.dispose(); };
  const edge = (d0, d1, k) => { const e = []; for (let d = d1; d > d0 + 1; d -= 2.5) e.push([d, CUT + ssJag(d * 1.7 + k, 0.6)]); e.push([d0, CUT + ssJag(d0 * 1.7 + k, 0.6)]); return e; };
  for (const [y, d0, d1, sA, sB, k] of [[6.6, -135, -80.6, -52, 52, 3], [13.4, -135, -104, -30, 52, 9]]) { const e = edge(d0, d1, k);
    slab(K.keep, M.floor, [[d0, sB], [d1, sB], ...e], y, y > 7 ? 0.6 : 0.75); slab(K.fall, M.floor, [[d0, sA], [d1, sA], ...e], y, y > 7 ? 0.6 : 0.75);
    // in the ruin: rebar out of the broken slab edge, a slab or two hanging off it
    for (let i = 0; i < e.length; i++) { const [d, s] = e[i]; for (let n = 0; n < 3; n++) { const a = [d + rand(-1.2, 1.2), y - rand(0.1, 0.6), -s], L = rand(0.8, 2.8); ssBeam(K.ruin, M.rebar, a, [a[0] + rand(-0.6, 0.6), a[1] - rand(0.2, 1.8), a[2] + L], 0.03, SSCYL6); } }
    for (let n = 0; n < 3; n++) { const d = rand(d0 + 4, d1 - 4), s = CUT + ssJag(d * 1.7 + k, 0.6), a = rand(0.7, 1.25), L = rand(4, 7); ssGeo(K.ruin, M.conc, SSBOX, d, y - 0.4 - Math.sin(a) * L / 2, -(s - Math.cos(a) * L / 2), rand(-0.15, 0.15), a, rand(-0.2, 0.2), rand(4, 8), 0.6, L); }
  }
  ssBox(K.keep, M.white, -105, -103.6, 13.4, 13.5, CUT, 52);
  for (let s0 = -30; s0 < 52; s0 += 2.5) { const g = fallS(s0, 4) ? K.fall : K.keep; ssQuad(g, M.balG, [-104, 13.4, -s0], [-104, 13.4, -(s0 + 2.5)], [-104, 14.5, -(s0 + 2.5)], [-104, 14.5, -s0], [1, 0, 0]); ssBox(g, M.mull, -104.05, -103.85, 14.45, 14.6, s0, s0 + 2.5); }
  // ground floor at the south end: a lobby floor, a ticket hall
  ssBox(K.fall, M.floor, -135, -80, 0.0, 0.26, -52, -40);
  // columns, lights, shops, boards, benches
  for (const d of [-98, -121]) for (let s = -46; s <= 50; s += 12) { const g = fallS(s, 6) ? K.fall : K.keep, h = yb(s, d) + 0.1; ssGeo(g, M.white, new THREE.CylinderGeometry(0.45, 0.45, h, 16), d, h / 2, -s); }
  for (let s0 = -46; s0 < 50; s0 += 6) { const g = fallS(s0 + 3, 7) ? K.fall : K.keep; ssBox(g, M.light, -110.5, -110, 12.68, 12.76, s0, s0 + 5.4); ssBox(g, M.light, -125.5, -125, 12.68, 12.76, s0, s0 + 5.4);
    if (s0 > -40) for (const d of [-90, -100]) { const yy = Math.min(22, yb(s0 + 3, d) - 3); ssBox(g, M.light, d - 0.15, d + 0.15, yy, yy + 0.12, s0, s0 + 5.4); ssBeam(g, M.mullD, [d, yy, -(s0 + 2.7)], [d, yb(s0 + 3, d), -(s0 + 2.7)], 0.02, SSCYL6); } }
  for (let s0 = -46, n = 0; s0 < 46; s0 += 10, n++) { const g = fallS(s0 + 5, 8) ? K.fall : K.keep; ssBox(g, M.panelD, -135, -127, 6.6, 11.6, s0 + 0.4, s0 + 9.6); ssBox(g, M.white, -127.2, -126.6, 11.2, 11.6, s0 + 0.2, s0 + 9.8);
    const pl = new THREE.PlaneGeometry(9, 4.4), uv = pl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, ((n % 6) + uv.getX(i)) / 6); ssGeo(g, M.shops, pl, -126.95, 8.9, -(s0 + 5), Math.PI / 2); pl.dispose(); }
  for (const [s, g] of [[13, K.fall], [36, K.keep]]) { ssBox(g, M.mullD, -104.6, -104.2, 9.2, 12.8, s - 7.2, s + 7.2); ssGeo(g, M.board, new THREE.PlaneGeometry(14, 3.4), -104.15, 11.0, -s, Math.PI / 2); for (const e of [-6, 6]) ssBeam(g, M.mullD, [-104.4, 12.8, -(s + e)], [-104.4, 12.83, -(s + e)], 0.05); }
  { const b = []; for (let s = -24; s < 46; s += 3.2) for (const d of [-94, -97, -112, -115]) { const g = fallS(s, 9) ? K.fall : K.keep; ssBox(g, M.mullD, d - 0.25, d + 0.25, 6.6, 7.05, s, s + 2.6); ssBox(g, M.panelD, d - 0.3, d + 0.3, 7.05, 7.12, s, s + 2.6); } }
  // revolving doors and the canopy where the terrace meets the glass
  for (const s of [33, 38, 43]) { ssGeo(K.keep, M.balG, new THREE.CylinderGeometry(1.4, 1.4, 2.7, 24, 1, true), -80, 6.6 + 1.35, -s); ssGeo(K.keep, M.mull, new THREE.CylinderGeometry(1.5, 1.5, 0.35, 24), -80, 9.45, -s);
    for (let k = 0; k < 4; k++) ssGeo(K.keep, M.balG, SSBOX, -80, 7.95, -s, k * Math.PI / 4, 0, 0, 2.7, 2.6, 0.04); }
  ssBox(K.keep, M.white, -80, -74.2, 10.6, 10.95, 28, 48); for (const s of [29, 47]) ssBeam(K.keep, M.mull, [-74.6, 10.95, -s], [-80, 14.5, -s], 0.05, SSCYL6);
  ssCol(-135, -80, CUT + 3, 52, 0, 31, null); ssCol(-135, -80, -52, CUT - 3, 0, 26, SS.fallCols);
}

/* ---------- the glass drum, the outlet block, the mart behind the old station ---------- */
function ssBlocks(K, M) {
  const g = K.keep;
  // drum: recessed glazed base, the drum proper with white bands, the sign band, the cap
  { const cx = -86, cs = 62, z = -cs;
    ssGeo(g, M.cwO, new THREE.CylinderGeometry(8, 8, 6.6, 48, 1, true), cx, 3.3, z); ssGeo(g, M.floor, new THREE.CylinderGeometry(8, 8, 0.2, 48), cx, 0.25, z);
    for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; ssGeo(g, M.mullD, SSBOX, cx + Math.sin(a) * 8.05, 3.3, z + Math.cos(a) * 8.05, a, 0, 0, 0.1, 6.6, 0.16); }
    ssGeo(g, M.white, new THREE.CylinderGeometry(11.3, 11.3, 0.7, 64), cx, 6.75, z);
    ssGeo(g, M.cwO, new THREE.CylinderGeometry(11, 11, 19.2, 64, 1, true), cx, 7.1 + 9.6, z);
    for (let k = 0; k < 60; k++) { const a = k / 60 * TAU; ssGeo(g, M.mull, SSBOX, cx + Math.sin(a) * 11.08, 16.7, z + Math.cos(a) * 11.08, a, 0, 0, 0.1, 19.2, 0.22); }
    for (let y = 9.7; y < 26; y += 3.3) ssGeo(g, M.white, new THREE.CylinderGeometry(11.18, 11.18, 0.42, 64, 1, true), cx, y, z);
    const sg = new THREE.CylinderGeometry(11.24, 11.24, 2.6, 40, 1, true, Math.PI / 2 - 0.75, 1.5); ssGeo(g, M.signDrum, sg, cx, 23.9, z); sg.dispose();
    ssGeo(g, M.white, new THREE.CylinderGeometry(11.5, 11.5, 1.6, 64), cx, 27.1, z); ssGeo(g, M.concD, new THREE.CylinderGeometry(11.0, 11.0, 0.2, 48), cx, 27.95, z);
    ssCol(cx - 7, cx + 7, cs - 7, cs + 7, 0, 28, null); }
  // a block: cladding above a glazed ground floor; over the tracks (d < -135) it stands on columns from 10 m
  const block = (d0, d1, s0, s1, h, front, o = {}) => {
    ssBox(g, M.panel, -135, d1 - 1.4, 6.6, h, s0, s1); ssBox(g, M.panel, d0, -135, 10, h, s0, s1); ssBox(g, M.concD, d0, -135, 9.4, 10, s0, s1);
    ssBox(g, M.panelD, -135, d1 - 2.2, 0, 6.6, s0 + 0.5, s1 - 0.5);
    for (let s = s0 + 1; s < s1 - 1; s += 3) { ssQuad(g, M.shopGlass, [d1 - 1.5, 0.2, -s], [d1 - 1.5, 0.2, -(s + 3)], [d1 - 1.5, 6.0, -(s + 3)], [d1 - 1.5, 6.0, -s], [1, 0, 0]); ssBox(g, M.mullD, d1 - 1.6, d1 - 1.3, 0, 6.2, s - 0.06, s + 0.06); }
    ssBox(g, M.white, d1 - 1.4, d1 + 1.6, 6.3, 6.85, s0, s1);
    for (let s = s0 + 6; s < s1 - 2; s += 12) for (let d = d0 + 5; d < -136; d += 14) ssBox(g, M.concD, d - 0.6, d + 0.6, HR.deck, 9.4, s - 0.6, s + 0.6);
    for (const [y0, y1] of front) { ssQuad(g, M.cwO, [d1 - 1.38, y0, -(s0 + 1)], [d1 - 1.38, y0, -(s1 - 1)], [d1 - 1.38, y1, -(s1 - 1)], [d1 - 1.38, y1, -(s0 + 1)], [1, 0, 0]);
      for (let s = s0 + 1; s <= s1 - 1; s += 1.5) ssBox(g, M.mull, d1 - 1.4, d1 - 1.15, y0, y1, s - 0.05, s + 0.05); ssBox(g, M.white, d1 - 1.4, d1 - 0.4, y1, y1 + 0.22, s0 + 0.6, s1 - 0.6); ssBox(g, M.panelD, d1 - 1.4, d1 - 1.0, y0 - 0.3, y0, s0 + 0.6, s1 - 0.6); }
    ssBox(g, M.panelD, -135, d1 - 1.2, h - 2.2, h, s0, s1);
    ssBox(g, M.deck, d0, d1 - 1.4, h, h + 0.12, s0, s1);
    for (const [a, b, c, e] of [[d0, d1 - 1.4, s0, s0 + 0.3], [d0, d1 - 1.4, s1 - 0.3, s1], [d0, d0 + 0.3, s0, s1], [d1 - 1.7, d1 - 1.2, s0, s1]]) ssBox(g, M.panel, a, b, h, h + 1.1, c, e);
    const lp = []; for (let s = s0 + 8; s < s1 - 4; s += 16) for (let d = d0 + 10; d < d1 - 8; d += 22) { lp.push([d, s]); ssBeam(g, M.mullD, [d, h, -s], [d, h + 7, -s], 0.09, SSCYL6); ssBox(g, M.mullD, d - 0.9, d + 0.9, h + 6.9, h + 7.1, s - 0.25, s + 0.25); }
    if (o.cars) { const cc = [0x111214, 0xe8e8e6, 0x8a8e92, 0x2a3a5a, 0x5a1414]; for (let i = 0; i < o.cars; i++) { const d = rand(d0 + 4, d1 - 6), s = rand(s0 + 3, s1 - 3), ry = Math.random() < 0.5 ? 0 : Math.PI / 2, m = Math.random() < 0.18 ? MT.burnt() : hgMat('ss_car' + (i % 5), { color: cc[i % 5], rough: 0.35, metal: 0.4 });
      ssGeo(g, m, SSBOX, d, h + 0.75, -s, ry, 0, 0, 1.8, 0.8, 4.4); ssGeo(g, M.oglass, SSBOX, d, h + 1.4, -s, ry, 0, 0, 1.6, 0.55, 2.4); } }
    ssCol(d0, d1, s0, s1, 0, h + 1, null);
  };
  block(-205, -92, 64, 128, 27, [[10.2, 13.4], [17.0, 20.2]], { cars: 16 });
  // the glazed top storey of the outlets, set back; a stair tower; the 서울역 sign on the cladding by the drum
  ssBox(g, M.cwO, -118, -96, 27.1, 32.6, 80, 118); ssBox(g, M.white, -118.3, -95.7, 32.6, 33.0, 79.7, 118.3); for (let s = 80; s <= 118; s += 2) ssBox(g, M.mull, -96.1, -95.85, 27.1, 32.6, s - 0.05, s + 0.05);
  ssBox(g, M.white, -190, -182, 27, 33, 70, 78); ssBox(g, M.white, -160, -154, 27, 31, 120, 126);
  ssBox(g, M.panel, -94, -92.4, 20.6, 25.8, 66, 86); ssGeo(g, M.signSS, new THREE.PlaneGeometry(19, 4.75), -92.35, 23.2, -76, Math.PI / 2);
  // the mart behind the old station, its tents on the deck and the tall white sign tower; a glass bridge to the outlets
  block(-215, -118, 132, 216, 25, [[14.0, 18.0]], { cars: 10 });
  ssBox(g, M.panel, -120, -118.4, 19.2, 23.8, 133.5, 148.5); ssGeo(g, M.signMart, new THREE.PlaneGeometry(14, 3.5), -118.35, 21.5, -141, Math.PI / 2);
  for (const [d, s] of [[-140, 150], [-140, 166], [-160, 150], [-160, 166]]) { ssGeo(g, M.white, new THREE.ConeGeometry(6.2, 3.2, 4, 1, true), d, 25.1 + 4.2, -s, Math.PI / 4); ssBeam(g, M.mull, [d, 25.1, -s], [d, 27.8, -s], 0.12); }
  ssBox(g, M.white, -127, -118, 0, 33, 207, 216); ssBox(g, M.panelD, -127.3, -117.7, 29, 31.6, 206.7, 216.3);
  ssBox(g, M.cwO, -132, -98, 10, 16, 127.6, 132.4); ssBox(g, M.white, -132, -98, 16, 16.4, 127.4, 132.6);
}

/* ---------- forecourt: terrace, grand stair and escalators, planters, the glass dome, lamps, the taxi lane ---------- */
function ssPlaza(K, M) {
  const g = K.keep;
  ssBox(g, M.pave, -92, -36, 0, 0.22, -62, 128);
  { const asph = hgMat('asph', { color: 0xffffff, map: 'asphalt', rough: 0.92 }); asph.userData.tile = [6, 6]; ssBox(g, M.pave, -86, -76, 0, 0.22, 128, 256); ssGeo(g, asph, SSBOX, -56, 0.17, -192, 0, 0, 0, 40, 0.12, 128); ssGeo(g, asph, SSBOX, -30, 0.17, -97, 0, 0, 0, 12, 0.12, 318);
    ssBox(g, hgMat('curb', { color: 0xc2c0ba, rough: 0.9 }), -36.35, -36.05, 0, 0.3, -62, 256); for (let s = -58; s < 254; s += 7) ssBox(g, hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), -30.08, -29.92, 0.23, 0.25, s, s + 3);
    const sh = []; for (const s0 of [150, 190]) { ssBox(g, M.pave, -61, -51, 0, 0.8, s0 - 9, s0 + 9); ssBox(g, M.soil, -60.5, -51.5, 0.8, 1.0, s0 - 8.5, s0 + 8.5); for (let k = 0; k < 26; k++) sh.push([rand(-60, -52), 1.2, -(s0 + rand(-8, 8)), rand(0, 3), 0, 0, rand(0.5, 0.95), rand(0.4, 0.7), rand(0.5, 0.95)]); }
    ssInst(g, new THREE.IcosahedronGeometry(1, 1), M.shrub, sh); }
  // terrace in front of the hall at concourse level
  ssBox(g, M.pave, -80, -68, 0, 6.6, -40, 50); ssBox(g, M.stone, -68.2, -67.9, 5.2, 6.3, -40, 30); ssBox(g, M.stone, -68.2, -67.9, 0, 0.4, -40, 22);
  for (let s = -38; s < 20; s += 3) { ssQuad(g, M.shopGlass, [-67.85, 0.4, -s], [-67.85, 0.4, -(s + 3)], [-67.85, 5.2, -(s + 3)], [-67.85, 5.2, -s], [1, 0, 0]); ssBox(g, M.mullD, -67.95, -67.6, 0.4, 5.2, s - 0.06, s + 0.06); }
  ssBox(g, M.stone, -68.2, -67.9, 0.4, 5.2, -40, -38); ssBox(g, M.stone, -68.2, -67.9, 0.4, 5.2, 20, 22.5); ssBox(g, M.white, -67.9, -66.4, 4.9, 5.2, -38, 20); ssBox(g, M.pave, -68.3, -67.8, 6.3, 6.6, -40, 30);
  for (let s = -40; s < 30; s += 1.5) { ssQuad(g, M.balG, [-68.05, 6.6, -s], [-68.05, 6.6, -(s + 1.5)], [-68.05, 7.7, -(s + 1.5)], [-68.05, 7.7, -s], [1, 0, 0]); ssBox(g, M.mull, -68.1, -68.0, 6.6, 7.75, s - 0.04, s + 0.04); }
  ssBox(g, M.mull, -68.15, -67.95, 7.7, 7.82, -40, 30);
  // the grand stair (22 risers of 30 cm) on either side of a pair of escalators
  for (let i = 0; i < 21; i++) { const d0 = -68 + i * 0.62, yt = 6.6 - (i + 1) * 0.3; for (const [s0, s1] of [[30, 38.8], [43.6, 52]]) { ssBox(g, M.pave, d0, d0 + 0.62, 0, yt, s0, s1); ssBox(g, M.mullD, d0 + 0.55, d0 + 0.63, yt - 0.02, yt + 0.01, s0, s1); } }
  for (const s of [30, 52]) { const sh = new THREE.Shape([new THREE.Vector2(-68, 0), new THREE.Vector2(-54.36, 0), new THREE.Vector2(-54.36, 1.1), new THREE.Vector2(-68, 7.7)]); const ge = new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false }); ssGeo(g, M.stone, ge, 0, 0, s === 30 ? -30 : -52.5); ge.dispose(); }
  { const th = Math.atan2(6.6, 13.64), L = Math.hypot(6.6, 13.64), cd = -61.18, cy = 3.3;
    for (const s of [39.6, 42.8]) { ssGeo(g, M.tread, SSBOX, cd, cy - 0.2, -s, 0, 0, -th, L, 0.9, 1.3); ssGeo(g, M.panelD, SSBOX, cd, cy - 0.75, -s, 0, 0, -th, L, 0.5, 1.7);
      for (const e of [-0.78, 0.78]) { ssGeo(g, M.balG, SSBOX, cd, cy + 0.45, -(s + e), 0, 0, -th, L, 1.0, 0.03); ssBeam(g, M.rubber, [-68.3, 7.65, -(s + e)], [-54.0, 1.05, -(s + e)], 0.06, SSCYL6); } }
    ssGeo(g, M.stone, SSBOX, cd, cy, -41.2, 0, 0, -th, L, 1.2, 0.4); }
  // stepped planters beside the stair, shrubs and pines on them
  const pines = [], trunks = [], crowns = [], shrubs = [];
  for (const [d0, d1, h] of [[-68, -63, 4.8], [-63, -59, 3.0], [-59, -55, 1.4]]) { ssBox(g, M.stone, d0, d1, 0, h, 22.5, 29.5); ssBox(g, M.soil, d0 + 0.3, d1 - 0.3, h, h + 0.15, 22.8, 29.2); for (let k = 0; k < 6; k++) shrubs.push([rand(d0 + 0.8, d1 - 0.8), h + 0.5, -rand(23.3, 28.7), rand(0, 3), 0, 0, rand(0.7, 1.2)]); }
  for (const [d, s, y] of [[-65.5, 24.5, 4.95], [-61, 27.5, 3.15], [-57, 24, 1.55], [-64, 54.5, 0.22], [-58, 56, 0.22]]) pines.push([d, s, y]);
  for (const [d, s, y] of pines) { const h = rand(5, 7.5); ssGeo(g, M.bark, new THREE.CylinderGeometry(0.14, 0.22, h * 0.5, 7), d, y + h * 0.25, -s); for (let k = 0; k < 3; k++) ssGeo(g, M.pine, new THREE.ConeGeometry(1.9 - k * 0.5, h * 0.42, 9), d, y + h * (0.42 + k * 0.17), -s, rand(0, 3)); }
  for (const [s, d] of [[-56, -42], [-46, -42], [-26, -42], [-16, -42], [-6, -42], [4, -42], [14, -42], [62, -42], [73, -42], [84, -42], [95, -42], [106, -42], [117, -42], [-56, -86], [-46, -86], [100, -86], [112, -86]]) { trunks.push([d, 2.6, -s]); crowns.push([d, 6.6, -s, 0, 0, 0, 1.15]); }
  ssInst(g, new THREE.CylinderGeometry(0.15, 0.24, 5, 7), M.bark, trunks); ssInst(g, new THREE.IcosahedronGeometry(2.6, 1), hgMat('twigs', { color: 0x5a5046, rough: 1, transparent: true, opacity: 0.22 }), crowns, { cast: false });
  ssInst(g, new THREE.IcosahedronGeometry(1, 1), M.shrub, shrubs);
  // the glass dome over the subway entrance at the foot of the stair
  { const cd = -45.5, cs = 41, R = 6.5, z = -cs; ssGeo(g, M.dome, new THREE.SphereGeometry(R, 36, 14, 0, TAU, 0, Math.PI / 2), cd, 0.22, z);
    for (const ph of [0.3, 0.6, 0.9, 1.2]) ssGeo(g, M.domeF, new THREE.TorusGeometry(R * Math.cos(ph), 0.06, 4, 40), cd, 0.22 + R * Math.sin(ph), z, 0, Math.PI / 2);
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; let prev = null; for (let i = 0; i <= 7; i++) { const ph = i / 7 * Math.PI / 2 * 0.98, p = [cd + Math.sin(a) * Math.cos(ph) * R, 0.22 + Math.sin(ph) * R, z + Math.cos(a) * Math.cos(ph) * R]; if (prev) ssBeam(g, M.domeF, prev, p, 0.05, SSCYL6); prev = p; } }
    ssGeo(g, M.stone, new THREE.CylinderGeometry(R + 0.35, R + 0.45, 0.5, 40), cd, 0.25, z); ssGeo(g, M.hole, SSDISC, cd, 0.24, z, 0, -Math.PI / 2, 0, R - 1, R - 1);
    ssCol(cd - 5, cd + 5, cs - 5, cs + 5, 0, 6.5, null); }
  // lamps (twin LED heads), granite benches, bollards along the kerb
  for (let s = -50; s < 128; s += 24) for (const d of [-39]) { ssGeo(g, M.mullD, new THREE.CylinderGeometry(0.1, 0.16, 10, 8), d, 5, -s); ssBox(g, M.mullD, d - 1.4, d + 1.4, 9.7, 9.85, s - 0.08, s + 0.08); for (const e of [-1.3, 1.3]) { ssBox(g, M.mullD, d + e - 0.35, d + e + 0.35, 9.5, 9.7, s - 0.25, s + 0.25); ssBox(g, M.light, d + e - 0.3, d + e + 0.3, 9.48, 9.5, s - 0.2, s + 0.2); } }
  for (let s = 140; s < 254; s += 22) { ssGeo(g, M.mullD, new THREE.CylinderGeometry(0.1, 0.16, 10, 8), -39, 5, -s); ssBox(g, M.mullD, -40.4, -37.6, 9.7, 9.85, s - 0.08, s + 0.08); }
  for (const [s, d] of [[-34, -48], [-10, -48], [8, -48], [66, -50], [80, -50], [94, -50], [108, -60]]) { ssBox(g, M.stone, d - 0.3, d + 0.3, 0.22, 0.65, s - 1.6, s + 1.6); }
  { const b = []; for (let s = -60; s < 254; s += 2.4) b.push([-36.8, 0.65, -s, 0, 0, 0, 0.12, 0.9, 0.12]); ssInst(g, SSCYL, M.mullD, b, { cast: false }); }
  // war: sandbag rings on the terrace and the forecourt, a crater or two, scorch
  { const bags = []; for (const [d, s, r] of [[-74, 4, 3.2], [-50, 92, 3.6], [-60, 176, 3.0]]) for (let L = 0; L < 3; L++) for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 1.4 - 0.2 + (L % 2) * 0.09; const y = (s === 4 ? 6.6 : 0.22) + 0.14 + L * 0.27; bags.push([d + Math.cos(a) * r, y, -(s + Math.sin(a) * r), -a, 0, 0, 1, 1, 1]); }
    ssInst(g, new RoundedBoxGeometry(0.42, 0.28, 0.75, 2, 0.1), M.sand, bags); }
  for (const [d, s, r] of [[-58, 70, 3.2], [-48, 120, 2.6], [-66, 210, 3.0]]) ssGeo(g, M.soot, SSDISC, d, 0.25, -s, 0, -Math.PI / 2, 0, r * 1.6, r * 1.6);
}

/* ---------- the ruin: the heap where the south half of the hall stood, debris, glass, dust ---------- */
function ssRuin(K, M) {
  const R = K.heap, CUT = SS.CUT;
  const env = (s, d) => ssSm(-68, -50, s) * (0.55 + 0.45 * ssSm(-40, CUT, s)) * (1 - ssSm(CUT + 1, CUT + 10, s)) * ssSm(-60, -78, d) * (1 - ssSm(-142, -158, d));
  const nz = (s, d) => 0.66 + 0.2 * Math.sin(s * 0.21 + d * 0.13) + 0.1 * Math.sin(s * 0.55 - d * 0.43 + 1.3) + 0.04 * Math.sin(s * 1.7 + d * 1.3);
  const H = (s, d) => 15 * env(s, d) * nz(s, d); SS.heapH = H;
  const base = (s, d) => (d > -80 && d < -68 && s > -40 && s < 50 ? 6.6 : 0.22);
  const Y = (s, d) => base(s, d) + 0.05 + H(s, d);
  const st = 1.6; for (let s = -70; s < CUT + 12; s += st) for (let d = -160; d < -46; d += st) {
    const a = [d, Y(s, d), -s], b = [d + st, Y(s, d + st), -s], c = [d + st, Y(s + st, d + st), -(s + st)], e = [d, Y(s + st, d), -(s + st)];
    if (Math.max(H(s, d), H(s, d + st), H(s + st, d + st), H(s + st, d)) < 0.3) continue; ssQuad(R, M.rubble, a, b, c, e, [0, 1, 0]); }
  const pts = (n, minH) => { const L = []; let guard = 0; while (L.length < n && guard++ < n * 30) { const s = rand(-68, CUT + 10), d = rand(-158, -48), h = H(s, d); if (h > minH) L.push([s, d, Y(s, d)]); } return L; };
  // chunks: three rough boulder shapes
  const boulder = () => { const ge = new THREE.IcosahedronGeometry(1, 0), p = ge.attributes.position, seen = new Map(); for (let i = 0; i < p.count; i++) { const k = p.getX(i).toFixed(3) + p.getY(i).toFixed(3) + p.getZ(i).toFixed(3); if (!seen.has(k)) seen.set(k, rand(0.6, 1.25)); const f = seen.get(k); p.setXYZ(i, p.getX(i) * f, p.getY(i) * f * 0.7, p.getZ(i) * f); } ge.computeVertexNormals(); return ge; };
  for (let v = 0; v < 3; v++) ssInst(R, boulder(), v === 2 ? M.concD : M.conc, pts(170, 0.3).map(([s, d, y]) => [d, y + rand(-0.2, 0.4), -s, rand(0, TAU), rand(-0.5, 0.5), rand(-0.5, 0.5), rand(0.6, 2.6), rand(0.5, 1.8), rand(0.6, 2.4)]));
  ssInst(R, SSBOX, M.conc, pts(70, 1).map(([s, d, y]) => [d, y + 0.2, -s, rand(0, TAU), rand(-0.9, 0.9), rand(-0.6, 0.6), rand(3, 8), rand(0.35, 0.55), rand(2, 6)]));
  ssInst(R, SSBOX, M.fascia, pts(46, 1).map(([s, d, y]) => [d, y + 0.3, -s, rand(0, TAU), rand(-0.8, 0.8), rand(-0.5, 0.5), rand(3, 7), 0.14, rand(2, 5)]));
  ssInst(R, SSBOX, M.steelR, pts(40, 1.5).map(([s, d, y]) => [d, y + rand(0, 1.5), -s, rand(0, TAU), rand(-1.1, 1.1), rand(-0.4, 0.4), 0.35, 0.35, rand(6, 14)]));
  ssInst(R, SSBOX, M.mull, pts(90, 0.5).map(([s, d, y]) => [d, y + rand(0, 0.8), -s, rand(0, TAU), rand(-1.2, 1.2), rand(-0.6, 0.6), 0.12, 0.35, rand(3, 8)]));
  ssInst(R, SSCYL6, M.rebar, pts(240, 0.5).map(([s, d, y]) => [d, y + 0.4, -s, rand(0, TAU), rand(-1.4, 1.4), rand(-1.4, 1.4), 0.03, rand(1.5, 4), 0.03]), { cast: false });
  // glass across the forecourt and the terrace, glinting
  { const L = []; for (let i = 0; i < 320; i++) { const s = rand(-66, CUT + 16), d = rand(-80, -38), y = Math.max(base(s, d), Y(s, d)) + 0.03; if (H(s, d) > 2) continue; L.push([d, y, -s, rand(0, TAU), -Math.PI / 2 + rand(-0.15, 0.15), 0, rand(0.2, 0.9), rand(0.2, 0.9), 1]); } ssInst(R, new THREE.PlaneGeometry(1, 1), M.shard, L, { cast: false }); }
  // a pall of dust over the forecourt; soot on the standing glass and the drum
  ssGeo(R, M.dust, new THREE.PlaneGeometry(1, 1), -66, 0.25, 4, 0, -Math.PI / 2, 0, 52, 100); ssGeo(R, M.dust, new THREE.PlaneGeometry(1, 1), -74, 6.64, 0, 0, -Math.PI / 2, 0, 16, 60);
  for (let i = 0; i < 10; i++) ssGeo(K.ruin, M.soot, SSDISC, -79.8, rand(8, 26), -(CUT + rand(0, 18)), Math.PI / 2, 0, 0, rand(3, 7), rand(3, 6));
  for (let i = 0; i < 5; i++) { const a = rand(-0.4, 0.9); ssGeo(K.ruin, M.soot, SSDISC, -86 + Math.sin(Math.PI / 2 + a) * 11.4, rand(9, 24), -62 + Math.cos(Math.PI / 2 + a) * 11.4 - 0, Math.PI / 2 + a, 0, 0, rand(3, 5), rand(4, 7)); }
  // bent mullions hanging off the break in the front
  for (let i = 0; i < 14; i++) { const y = rand(7, 28), s = CUT + ssJag(y * 2.1 + 5, 0.8) + rand(-1, 1), L = rand(2, 7), a = rand(0.3, 1.3); ssBeam(K.ruin, M.mull, [-80.2, y, -s], [-80.2 + rand(-1, 2), y - Math.cos(a) * L, -(s - Math.sin(a) * L)], 0.07, SSBOX); }
  // colliders for the heap (added when it comes down)
  SS.heapDef = []; for (let s = -66; s < CUT + 10; s += 10) for (let d = -156; d < -50; d += 10) { let h = 0; for (const [a, b] of [[0, 0], [10, 0], [0, 10], [10, 10], [5, 5]]) h = Math.max(h, H(s + a, d + b)); if (h > 1.2) { const p = rtAt(RT.sSta + s + 5, d + 5); SS.heapDef.push([p.x - 5, 0, p.z - 5, p.x + 5, h * 0.8, p.z + 5]); } }
}
function ssRuinFx() {
  const CUT = SS.CUT, H = SS.heapH || (() => 0);
  for (let i = 0; i < 7; i++) { const s = rand(-50, CUT), d = rand(-140, -80); addEmitter(ssW(d, H(s, d) + 1, s), 'smoke', rand(2.5, 4.5), 2); if (i < 4) addEmitter(ssW(d, H(s, d) + 0.5, s), 'fire', rand(1.4, 2.4), 14); }
  for (let i = 0; i < 4; i++) { const s = CUT + rand(2, 14), d = rand(-130, -90); addEmitter(ssW(d, 7, s), 'fire', rand(1.2, 2), 12); addEmitter(ssW(d, 26, s), 'smoke', rand(2.5, 3.5), 2); }
  addEmitter(ssW(-115, 30, CUT - 8), 'smoke', 4, 2);
  for (let i = 0; i < 8; i++) { const s = rand(-45, CUT + 10), d = rand(-140, -84); addEmitter(ssW(d, H(s, d) + 2, s), 'smoke', rand(4, 6.5), 3); }
  for (let i = 0; i < 3; i++) { const s = CUT + rand(0, 20), d = rand(-130, -92); addEmitter(ssW(d, 32, s), 'smoke', rand(3.5, 5), 3); }
  const fc = new THREE.Color(G.env.fog ?? 0xbcbab4);
  hgSmokeCol(ssW(-112, 12, -8), { h: 380, r: 36, n: 22, period: 34, drift: [0.4, -0.25], color: new THREE.Color(0x2e2b28), op: 0.8, fog: true });
  hgSmokeCol(ssW(-100, 24, CUT + 8), { h: 300, r: 28, n: 18, period: 30, drift: [0.45, -0.2], color: new THREE.Color(0x3a3632), op: 0.7, fog: true });
  hgSmokeCol(ssW(-128, 8, -36), { h: 240, r: 20, n: 14, period: 28, drift: [0.35, -0.3], color: new THREE.Color(0x56514a).lerp(fc, 0.2), op: 0.55, fog: true });
}

/* ---------- the whole station ---------- */
function hgSeoulStation2() {
  SS.bins = new Map(); SS.down = false; SS.fallCols = []; SS.heapCols = [];
  const M = ssMats();
  const keepF = ssFrame(), fallF = ssFrame(), ruinF = ssFrame();
  const piv = new THREE.Group(); piv.position.set(-108, 0, -SS.CUT); fallF.add(piv); const fall = new THREE.Group(); fall.position.set(108, 0, SS.CUT); piv.add(fall);
  const heap = new THREE.Group(); ruinF.add(heap); ruinF.visible = false;
  const K = { keep: keepF, fall, ruin: ruinF, heap };
  SS.fall = fallF; SS.pivot = piv; SS.ruin = ruinF; SS.heap = heap; G.ssRuin = ruinF; G.ssC = rtAt(RT.sSta + 10, -110);
  const old = new THREE.Group(); keepF.add(old); ssOldStation(old, M, null);
  ssRoof(K, M); ssHall(K, M); ssBlocks(K, M); ssPlaza(K, M); ssRuin(K, M);
  ssFlush();
}
/* 서울역 comes down: the south half of the KTX hall and its roof drop and topple toward the forecourt, a wall of dust rolls out,
   the heap rises out of it; what stands keeps a torn edge, a roof leaf hanging from the break, burning floors */
function hgStationFall(instant) {
  if (!SS.fall || SS.down) return; SS.down = true;
  const F = SS.fall, R = SS.ruin, Hp = SS.heap, PV = SS.pivot;
  for (const c of SS.fallCols) { const i = G.colliders.indexOf(c); if (i >= 0) G.colliders.splice(i, 1); }
  const show = () => { if (R.visible) return; R.visible = true; for (const c of SS.heapDef || []) SS.heapCols.push(addCollider(c[0], c[1], c[2], c[3], c[4], c[5], {})); ssRuinFx(); };
  if (instant) { F.parent && F.parent.remove(F); show(); return; }
  const dust = (n, big) => { for (let k = 0; k < n; k++) { const s = rand(-55, SS.CUT + 4), d = rand(-140, -70), p = ssW(d, rand(1, big ? 18 : 8), s), c = ssW(-110, 0, -10), dx = p.x - c.x, dz = p.z - c.z, l = Math.hypot(dx, dz) || 1;
    particle({ x: p.x, y: p.y, z: p.z, vx: dx / l * rand(4, 14), vy: rand(0.5, 4), vz: dz / l * rand(4, 14), life: rand(4, 9), size: rand(6, 10), size1: rand(22, 40), alpha: 0.55, color: [0.6, 0.58, 0.54], drag: 0.5 }); } };
  SFX.explosion(ssW(-110, 10, 0), 1); G.shake += 0.9;
  for (let i = 0; i < 9; i++) setGameTimeout(() => { explode(ssW(rand(-135, -82), rand(4, 24), rand(-50, SS.CUT)), { noPlayer: true, size: 4, dmg: 0, vdmg: 0 }); }, i * 0.28);
  let t = 0, acc = 0; Hp.position.y = -11;
  G.updaters.push((dt) => { t += dt; acc += dt; const k = Math.min(1, t / 3.2);
    PV.rotation.x = 0.32 * k * k; PV.position.y = -16 * k * k * k;
    if (acc > 0.12 && t < 3.6) { acc = 0; dust(6, t < 1.5); }
    if (t > 1.3) { show(); Hp.position.y = Math.min(0, Hp.position.y + dt * 7); }
    if (t > 3.6 || G.mode !== 'play') { F.parent && F.parent.remove(F); Hp.position.y = 0; show(); return true; } });
}
