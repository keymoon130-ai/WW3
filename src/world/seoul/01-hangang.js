/* =====================================================================================
   SAMPLE · 서울 1:1 — 한강대교(노량진 → 노들섬 → 이촌) → 한강대로 → 용산역 → 신용산
   north is -z, east is +x, metres throughout. Bridge and road dimensions follow the real ones:
   한강대교 1,005 m (south section 7 tied-arch spans · 440 m, 노들섬, north section girder spans · 459 m),
   twin decks 37 m wide with 8 lanes; 한강대로 4+4 lanes with median bus lanes, 47 m between building lines.
   ===================================================================================== */
const HG = {
  N: -1005, S: 0, span: 440 / 7, I0: -440, I1: -546,
  water: -11, park: -7, half: 18.6, road: 23.5,
  junc: [[-1030, 30, '한강대교북단'], [-1385, 18, ''], [-1551, 14, ''], [-1655, 18, '용산역']],
  end: -2160,
};
function hgIsland(x, z) { // 노들섬: a long lozenge, 720 m east-west; its west tip is just past 한강대교, the body runs east (the railway bridges stay clear of it)
  if (x < -60 || x > 660) return false; const t = (x - 300) / 360; const half = 62 * Math.sqrt(Math.max(0, 1 - t * t * t * t)) + 2;
  return Math.abs(z - (HG.I0 + HG.I1) / 2) < half;
}
function hgGround(x, z) {
  if (Math.abs(x) <= HG.half + 0.4 && z <= 46 && z >= HG.N - 1) return 0; // decks and approaches
  if (z >= 46) return 0;                                   // 노량진
  if (z >= 14) return -4;                                  // 올림픽대로 terrace
  if (z >= 4) return lerp(-7, -4, (z - 4) / 10);
  if (z >= 0) return -7;
  if (z <= HG.N + 2) return 0;                             // 이촌 / 용산
  if (z <= -905) return -7;                                // 강변북로 + 이촌 한강공원
  if (z <= -897) return lerp(-7, -11, (-905 - z) / -8);
  if (hgIsland(x, z)) return -4;
  return HG.water;
}

/* ---------- materials & facade textures (one tile = 2 bays × 2 floors, mapped in metres so every building gets real storeys) ---------- */
const HGM = {};
function hgMat(key, o) { if (HGM[key]) return HGM[key]; const m = HGM[key] = mat('hg_' + key, o); if (o && o.map === 'asphalt') m.map = hgAsphalt(); return m; }
let HGA = null;
function hgAsphalt() { return HGA || (HGA = canvasTex(256, 256, (g, w, h) => { noiseFill(g, w, h, '#626365', 0.08, 9000, 2); for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(30,30,32,${rand(0.08, 0.2)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(10, 50), rand(4, 20), rand(0, 3), 0, TAU); g.fill(); } g.strokeStyle = 'rgba(20,20,22,.35)'; for (let i = 0; i < 5; i++) { g.beginPath(); let x = rand(0, w), y = rand(0, h); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += rand(-20, 20); y += rand(-20, 20); g.lineTo(x, y); } g.stroke(); } })); }
const HGT = {};
function hgFacade(kind) {
  if (HGT[kind]) return HGT[kind];
  const draw = {
    // Korean apartment slab: cream wall, a balcony band per floor with glass and a railing, slab lines
    apt: [264, 224, (g, w, h) => {
      noiseFill(g, w, h, '#ddd8cc', 0.05, 900, 2);
      for (let f = 0; f < 2; f++) { const y0 = f * 112;
        g.fillStyle = '#c9c3b6'; g.fillRect(0, y0 + 100, w, 12);
        for (let b = 0; b < 2; b++) { const x0 = b * 132; const r = Math.random();
          g.fillStyle = r < 0.12 ? '#0b0c0d' : `hsl(${rand(195, 215)},${rand(8, 18)}%,${rand(30, 44)}%)`; g.fillRect(x0 + 8, y0 + 14, 116, 70);
          if (r >= 0.12) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(x0 + 8, y0 + 14, 40, 70); g.fillStyle = 'rgba(230,220,200,.35)'; if (Math.random() < 0.4) g.fillRect(x0 + rand(10, 70), y0 + 16, rand(20, 40), 66); }
          g.fillStyle = '#e9e5dc'; for (let k = 0; k < 4; k++) g.fillRect(x0 + 8 + k * 38.6, y0 + 14, 3, 70);
          g.fillStyle = '#b8b2a6'; g.fillRect(x0 + 6, y0 + 70, 120, 3); g.fillRect(x0 + 6, y0 + 84, 120, 6);
          if (r < 0.12) { g.fillStyle = 'rgba(20,16,12,.55)'; g.beginPath(); g.ellipse(x0 + 66, y0 + 10, 70, 40, 0, 0, TAU); g.fill(); }
        } }
    }],
    // glass curtain wall: 1.5 m mullions, a spandrel at each 4 m floor
    glass: [192, 256, (g, w, h) => {
      for (let f = 0; f < 2; f++) for (let b = 0; b < 4; b++) { const r = Math.random();
        const x0 = b * 48, y0 = f * 128; const grd = g.createLinearGradient(x0, y0, x0 + 48, y0 + 128);
        const L = rand(26, 38); grd.addColorStop(0, `hsl(205,22%,${L + 14}%)`); grd.addColorStop(1, `hsl(210,25%,${L}%)`);
        g.fillStyle = r < 0.08 ? '#08090a' : grd; g.fillRect(x0, y0, 48, 128);
        g.fillStyle = '#5c646a'; g.fillRect(x0, y0 + 100, 48, 28); }
      g.fillStyle = '#9aa2a8'; for (let x = 0; x <= w; x += 48) g.fillRect(x - 1.5, 0, 3, h); for (let y = 0; y <= h; y += 128) g.fillRect(0, y - 2, w, 4);
    }],
    // mid-rise commercial: tiled wall, window bands, a vertical sign now and then
    mid: [264, 264, (g, w, h) => {
      const hue = pick([30, 35, 200, 20, 0]); noiseFill(g, w, h, `hsl(${hue},${rand(4, 12)}%,${rand(52, 66)}%)`, 0.05, 900, 2);
      for (let f = 0; f < 2; f++) for (let b = 0; b < 2; b++) { const x0 = b * 132, y0 = f * 132, r = Math.random();
        g.fillStyle = '#3c4044'; g.fillRect(x0 + 10, y0 + 22, 112, 70); g.fillStyle = r < 0.15 ? '#070809' : `hsl(205,15%,${rand(28, 40)}%)`; g.fillRect(x0 + 13, y0 + 25, 106, 64);
        g.fillStyle = '#5a5e62'; g.fillRect(x0 + 64, y0 + 25, 3, 64); }
      if (Math.random() < 0.5) { g.fillStyle = pick(['#c8302a', '#2a5aa8', '#e0a020', '#2a8a5a']); g.fillRect(w - 34, 10, 26, h - 20); g.fillStyle = '#fff'; g.font = 'bold 20px sans-serif'; g.textAlign = 'center'; const t = pick(['병원', '학원', '치과', '약국', '모텔', '노래방']); [...t].forEach((c, i) => g.fillText(c, w - 21, 46 + i * 34)); }
    }],
    // street-level shopfronts with Korean signboards
    shop: [512, 192, (g, w, h) => {
      g.fillStyle = '#4a4c4e'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4; i++) { const x0 = i * 128; const col = pick(['#1f4f9a', '#b8282a', '#e8a018', '#1d7a4a', '#2a2a2a', '#7a2a8a', '#e05a1a']);
        g.fillStyle = col; g.fillRect(x0 + 4, 14, 120, 44); g.fillStyle = '#fff'; g.font = 'bold 28px sans-serif'; g.textAlign = 'center';
        g.fillText(pick(['편의점', '부동산', '치킨', '안경', '분식', '약국', '카페', '휴대폰', '은행', '전자', '김밥', '빵집']), x0 + 64, 46);
        const r = Math.random(); g.fillStyle = r < 0.3 ? '#050505' : '#2a3a44'; g.fillRect(x0 + 8, 70, 112, 110); if (r >= 0.3) { g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x0 + 8, 70, 36, 110); }
        g.fillStyle = '#6a6e70'; g.fillRect(x0 + 62, 70, 4, 110); }
    }],
    // the white cube: vertical aluminium fins
    fins: [128, 128, (g, w, h) => { g.fillStyle = '#2e353a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8e8e4'; for (let x = 0; x < w; x += 16) g.fillRect(x, 0, 9, h); g.fillStyle = 'rgba(0,0,0,.15)'; for (let x = 9; x < w; x += 16) g.fillRect(x, 0, 2, h); }],
    // bare concrete core of a tower under construction: formwork lines, floor slabs
    core: [128, 128, (g, w, h) => { noiseFill(g, w, h, '#9a9890', 0.06, 900, 3); g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 2); for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 2, h); }],
    // station / mall: stone base panels and long glass bands
    mall: [256, 256, (g, w, h) => { noiseFill(g, w, h, '#b9b4aa', 0.04, 600, 2); for (let f = 0; f < 2; f++) { g.fillStyle = '#2c3a44'; g.fillRect(0, f * 128 + 30, w, 70); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(0, f * 128 + 30, w, 18); g.fillStyle = '#8a9096'; for (let x = 0; x < w; x += 32) g.fillRect(x, f * 128 + 30, 2, 70); } }],
  };
  const [w, h, fn] = draw[kind]; const t = canvasTex(w, h, fn); t.anisotropy = 8; HGT[kind] = t; return t;
}
const HGTILE = { apt: [6.6, 5.6], glass: [6, 8], mid: [7, 7], shop: [16, 6], fins: [3, 3], core: [6, 6], mall: [10, 10] };
function hgBoxUV(w, h, d, tu, tv) {
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv; const spans = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * spans[f][0] / tu, uv.getY(k) * spans[f][1] / tv); }
  g.userData.uvm = true; return g;
}
let HGR = null; // while set, static pieces go into this group instead (so they can be moved later)
function hgMesh(geo, m, x, y, z, o = {}) {
  // textured boxes tile their texture every 6 m instead of stretching it over the whole box
  if (m.map && geo.type === 'BoxGeometry' && !geo.userData.uvm) { const p = geo.parameters; geo = hgBoxUV(p.width, p.height, p.depth, 6, 6); }
  const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); if (o.ry) me.rotation.y = o.ry; me.castShadow = o.cast ?? true; me.receiveShadow = true; (o.dyn ? G.world : (HGR || G.staticRoot)).add(me); return me; }
/* a city building: real storeys, roof slab, parapet, plant on the roof; a shopfront base on shopping streets */
function hgBuilding(x, z, w, d, h, kind = 'mid', o = {}) {
  const y = o.y ?? 0, [tu, tv] = HGTILE[kind];
  const fm = hgMat('fac_' + kind + (o.v || 0), { map: kind, color: o.tint || 0xffffff, rough: kind === 'glass' ? 0.25 : 0.85, metal: kind === 'glass' ? 0.35 : 0 });
  fm.map = hgFacade(kind);
  let base = 0;
  if (o.shops) { base = 5.2; const sm = hgMat('fac_shop', { rough: 0.7 }); sm.map = hgFacade('shop'); hgMesh(hgBoxUV(w, base, d, 16, 6), sm, x, y + base / 2, z); hgMesh(new THREE.BoxGeometry(w + 0.6, 0.3, d + 0.6), hgMat('slab', { color: 0x8c8a84 }), x, y + base, z); }
  hgMesh(hgBoxUV(w, h - base, d, tu, tv), fm, x, y + base + (h - base) / 2, z);
  const roofM = hgMat('roof', { color: 0x76746e, map: 'concrete', rough: 0.95 });
  hgMesh(new THREE.BoxGeometry(w + 0.4, 0.45, d + 0.4), roofM, x, y + h + 0.2, z);
  for (const [px, pz, pw, pd] of [[0, d / 2, w + 0.4, 0.3], [0, -d / 2, w + 0.4, 0.3], [w / 2, 0, 0.3, d + 0.4], [-w / 2, 0, 0.3, d + 0.4]]) hgMesh(new THREE.BoxGeometry(pw, 1.1, pd), roofM, x + px, y + h + 0.95, z + pz, { cast: false });
  if (!o.bare) { const n = Math.max(1, Math.floor(w * d / 260)); for (let i = 0; i < n; i++) { const bw = rand(2, 5), bd = rand(2, 4); hgMesh(new THREE.BoxGeometry(bw, rand(1.5, 3), bd), hgMat('plant', { color: 0xa6a6a0, rough: 0.7, metal: 0.2 }), x + rand(-w / 2 + bw, w / 2 - bw), y + h + 1.2, z + rand(-d / 2 + bd, d / 2 - bd)); } }
  if (o.num) { const c = canvasTex(256, 128, (g) => { g.fillStyle = '#ddd8cc'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#5a6a7a'; g.font = 'bold 96px sans-serif'; g.textAlign = 'center'; g.fillText(o.num, 128, 104); });
    const nm = new THREE.MeshStandardMaterial({ map: c, roughness: 0.9 }); for (const s of [-1, 1]) { const p = hgMesh(new THREE.PlaneGeometry(Math.min(d * 0.6, 14), Math.min(d * 0.3, 7)), nm, x + s * (w / 2 + 0.02), y + h - 6, z, { cast: false }); p.rotation.y = s * Math.PI / 2; } }
  addCollider(x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2, {});
  if (o.smoke) addEmitter(v3(x + rand(-w / 4, w / 4), y + h, z + rand(-d / 4, d / 4)), 'smoke', 1.6, 2);
  if (o.fire) addEmitter(v3(x + (o.fireSide || 1) * (w / 2 + 0.2), y + h * rand(0.3, 0.7), z), 'fire', 1, 12);
}
/* instanced street furniture: one InstancedMesh per part */
function hgInst(geo, m, list, o = {}) {
  if (!list.length) return; if (m === HGM.twigs && geo.type === 'IcosahedronGeometry') { geo = hgTwigGeo(geo.parameters.radius); m = hgTwigMat(); o = Object.assign({}, o, { cast: true }); } const im = new THREE.InstancedMesh(geo, m, list.length); const d = new THREE.Object3D(); d.rotation.order = 'YXZ';
  list.forEach((p, i) => { d.position.set(p[0], p[1], p[2]); d.rotation.set(p[4] || 0, p[3] || 0, p[5] || 0); d.scale.set(p[6] ?? 1, p[7] ?? p[6] ?? 1, p[8] ?? p[6] ?? 1); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
  im.castShadow = o.cast ?? true; im.receiveShadow = true; (HGR || G.world).add(im); if (m === HGTW || o.noAO) (G.noAO = G.noAO || []).push(im); return im;
}

/* ================= realism pass (sample only): procedural PBR detail, sky reflections, trees, road wear, parked cars ================= */
/* bare March crowns: crossed alpha cards painted with a branching canopy */
let HGTW = null, HGTWG = {};
function hgTwigMat() {
  if (HGTW) return HGTW;
  const t = canvasTex(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.lineCap = 'round';
    const br = (x, y, a, len, wd, d) => { if (d > 7 || wd < 0.4) return; const x2 = x + Math.sin(a) * len, y2 = y - Math.cos(a) * len;
      c.strokeStyle = `rgba(${58 + d * 6},${50 + d * 5},${44 + d * 4},${0.95 - d * 0.05})`; c.lineWidth = wd; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + x2) / 2 + rand(-6, 6), (y + y2) / 2, x2, y2); c.stroke();
      const n = d < 2 ? 3 : 2; for (let k = 0; k < n; k++) br(x2, y2, a + rand(-0.75, 0.75) + (k - (n - 1) / 2) * 0.35, len * rand(0.62, 0.8), wd * 0.66, d + 1); };
    for (let k = 0; k < 4; k++) br(w / 2 + rand(-10, 10), h * 0.98, rand(-0.35, 0.35), h * 0.26, 11, 0);
    // a haze of fine twigs and the first buds
    for (let i = 0; i < 900; i++) { const a2 = rand(0, TAU), r = Math.sqrt(Math.random()) * w * 0.44; const x = w / 2 + Math.cos(a2) * r, y = h * 0.42 + Math.sin(a2) * r * 0.85; c.strokeStyle = `rgba(80,70,58,${rand(0.25, 0.6)})`; c.lineWidth = rand(0.6, 1.2); c.beginPath(); c.moveTo(x, y); c.lineTo(x + rand(-7, 7), y + rand(-9, 3)); c.stroke(); }
    for (let i = 0; i < 260; i++) { const a2 = rand(0, TAU), r = Math.sqrt(Math.random()) * w * 0.42; c.fillStyle = `rgba(${randi(110, 140)},${randi(120, 140)},${randi(70, 90)},.55)`; c.fillRect(w / 2 + Math.cos(a2) * r, h * 0.42 + Math.sin(a2) * r * 0.85, 2, 2); } });
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  HGTW = new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.95, color: 0xffffff });
  HGTW.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.35 }); return HGTW;
}
function hgTwigGeo(r) {
  const k = r.toFixed(2); if (HGTWG[k]) return HGTWG[k];
  const W = r * 2.6, H = r * 2.7, parts = [];
  for (let i = 0; i < 3; i++) { const g = new THREE.PlaneGeometry(W, H); g.translate(0, -H * 0.12, 0); g.rotateY(i * Math.PI / 3); parts.push(g); }
  const pos = [], uv = [], idx = []; let o = 0; for (const g of parts) { pos.push(...g.attributes.position.array); uv.push(...g.attributes.uv.array); idx.push(...Array.from(g.index.array, (v) => v + o)); o += g.attributes.position.count; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  // normals point up-and-out so the crowns light like a volume, not like flat cards
  const n = geo.attributes.normal, p = geo.attributes.position; for (let i = 0; i < n.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i) + H * 0.3, p.getZ(i)).normalize(); n.setXYZ(i, v.x, v.y, v.z); }
  return (HGTWG[k] = geo);
}
/* normal + roughness maps derived from a canvas texture's own pattern (dark = recessed / glossy joints etc.), cached per canvas */
const HGNM = new Map();
function hgDerive(img, strength, kind) {
  const key = img; if (HGNM.has(key)) return HGNM.get(key);
  const w = Math.min(img.width, 512), h = Math.min(img.height, 512); const src = document.createElement('canvas'); src.width = w; src.height = h; const sc = src.getContext('2d'); sc.drawImage(img, 0, 0, w, h);
  const d = sc.getImageData(0, 0, w, h).data, L = new Float32Array(w * h); let mean = 0;
  for (let i = 0; i < w * h; i++) { L[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255; mean += L[i]; } mean /= w * h;
  const at = (x, y) => L[((y + h) % h) * w + ((x + w) % w)];
  const nc = document.createElement('canvas'); nc.width = w; nc.height = h; const nd = nc.getContext('2d').createImageData(w, h);
  const rc = document.createElement('canvas'); rc.width = w; rc.height = h; const rd = rc.getContext('2d').createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const gx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
    const gy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
    let nx = -gx * strength, ny = gy * strength, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l; const i = (y * w + x) * 4;
    nd.data[i] = (nx * 0.5 + 0.5) * 255; nd.data[i + 1] = (ny * 0.5 + 0.5) * 255; nd.data[i + 2] = (nz * 0.5 + 0.5) * 255; nd.data[i + 3] = 255;
    const v = at(x, y) - mean, hp = at(x, y) - (at(x - 2, y) + at(x + 2, y) + at(x, y - 2) + at(x, y + 2)) / 4;
    const r = kind === 'glass' ? 0.35 + (v > 0.12 ? 0.9 : 0.0) + Math.abs(hp) * 2 : 0.82 + v * -0.6 + Math.abs(hp) * 1.2; rd.data[i + 1] = Math.max(0, Math.min(1, r)) * 255; rd.data[i] = rd.data[i + 2] = 0; rd.data[i + 3] = 255; }
  nc.getContext('2d').putImageData(nd, 0, 0); rc.getContext('2d').putImageData(rd, 0, 0);
  const out = { n: nc, r: rc }; HGNM.set(key, out); return out;
}
function hgDetailMaterial(m) {
  if (m.userData.hgDone || !m.isMeshStandardMaterial) return; m.userData.hgDone = true;
  const glass = m.metalness >= 0.3; m.envMapIntensity = glass ? 1.15 : 0.55;
  const map = m.map; if (!map || !map.image || !(map.image instanceof HTMLCanvasElement) || m.normalMap || m.alphaTest > 0) return;
  const soft = ['snow', 'snowdirt', 'dirt', 'grass', 'sand', 'ice'].some((k) => TX[k] && TX[k].image === map.image); // natural ground: a gentle relief, not engraved
  const dv = hgDerive(map.image, glass ? 2.2 : soft ? 0.8 : 3.2, glass ? 'glass' : 'solid');
  const mk = (cv, srgb) => { const t = new THREE.CanvasTexture(cv); t.wrapS = map.wrapS; t.wrapT = map.wrapT; t.repeat.copy(map.repeat); t.offset.copy(map.offset); t.rotation = map.rotation; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  m.normalMap = mk(dv.n); m.normalScale.set(1, 1); m.roughnessMap = mk(dv.r); m.roughness = Math.min(1, m.roughness * (glass ? 1 : 1.05)); m.needsUpdate = true;
}
/* better base textures for the shared surfaces: asphalt with aggregate, tar seams and patches; concrete with formwork, stains and ties */
function hgUpgradeTextures() {
  const asph = canvasTex(512, 512, (c, w, h) => { noiseFill(c, w, h, '#5c5d5f', 0.1, 26000, 2); for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(${randi(150, 200)},${randi(150, 195)},${randi(140, 185)},${rand(0.15, 0.4)})`; c.fillRect(rand(0, w), rand(0, h), rand(1, 2.4), rand(1, 2.4)); }
    for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(28,28,30,${rand(0.05, 0.12)})`; c.beginPath(); c.ellipse(rand(0, w), rand(0, h), rand(30, 110), rand(14, 50), rand(0, 3), 0, TAU); c.fill(); }
    
    c.strokeStyle = 'rgba(14,14,16,.7)'; for (let i = 0; i < 7; i++) { c.lineWidth = rand(0.8, 2.2); c.beginPath(); let x = rand(0, w), y = rand(0, h); c.moveTo(x, y); for (let k = 0; k < 10; k++) { x += rand(-18, 18); y += rand(-18, 18); c.lineTo(x, y); } c.stroke(); }
    c.strokeStyle = 'rgba(10,10,12,.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, h * 0.73); c.lineTo(w, h * 0.73 + rand(-4, 4)); c.stroke(); });
  asph.anisotropy = 8;
  const conc = canvasTex(512, 512, (c, w, h) => { noiseFill(c, w, h, '#a19e97', 0.07, 16000, 2); for (let i = 0; i < 18; i++) { const x = rand(0, w); const g = c.createLinearGradient(x, 0, x + rand(6, 20), 0); g.addColorStop(0, 'rgba(60,56,50,0)'); g.addColorStop(0.5, `rgba(60,56,50,${rand(0.05, 0.16)})`); g.addColorStop(1, 'rgba(60,56,50,0)'); c.fillStyle = g; c.fillRect(x, rand(0, h * 0.4), 20, rand(80, h)); }
    c.fillStyle = 'rgba(40,38,34,.35)'; for (let y = 0; y < h; y += 128) c.fillRect(0, y, w, 2); for (let x = 0; x < w; x += 256) c.fillRect(x, 0, 2, h);
    c.fillStyle = 'rgba(30,30,30,.45)'; for (let y = 32; y < h; y += 64) for (let x = 32; x < w; x += 64) { c.beginPath(); c.arc(x, y, 3, 0, TAU); c.fill(); } });
  conc.anisotropy = 8; return { asph, conc };
}
/* sky reflections: the scene's own sky dome rendered into a prefiltered environment map; lower hemisphere a grey city */
function hgEnvironment() {
  const es = new THREE.Scene(); es.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), skyMat));
  const gnd = new THREE.Mesh(new THREE.CircleGeometry(90, 32), new THREE.MeshBasicMaterial({ color: 0x55534f })); gnd.rotation.x = -Math.PI / 2; gnd.position.y = -6; es.add(gnd);
  for (let i = 0; i < 40; i++) { const a = rand(0, TAU), b = new THREE.Mesh(new THREE.BoxGeometry(rand(6, 14), rand(6, 26), rand(6, 14)), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0.58, 0.08, rand(0.25, 0.5)) })); b.position.set(Math.cos(a) * 75, -6 + b.geometry.parameters.height / 2, Math.sin(a) * 75); es.add(b); }
  const pm = new THREE.PMREMGenerator(renderer); const rt = pm.fromScene(es, 0.03); pm.dispose(); es.remove(es.children[0]);
  scene.environment = rt.texture; const hemi0 = hemi.intensity; hemi.intensity *= 0.62;
  const ultra = SET.quality === 'ultra', ms = sun.shadow.mapSize.x, cam = Object.assign({}, { l: sun.shadow.camera.left, r: sun.shadow.camera.right, t: sun.shadow.camera.top, b: sun.shadow.camera.bottom, f: sun.shadow.camera.far });
  if (ultra) { sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, far: 700 }); sun.shadow.camera.updateProjectionMatrix(); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } sun.shadow.radius = 3; }
  G.envReset = () => { scene.environment = null; rt.dispose(); hemi.intensity = hemi0; G.noAO = null;
    if (ultra) { sun.shadow.mapSize.set(ms, ms); Object.assign(sun.shadow.camera, { left: cam.l, right: cam.r, top: cam.t, bottom: cam.b, far: cam.f }); sun.shadow.camera.updateProjectionMatrix(); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } } };
}
/* road wear: manhole covers, patched trenches, crack lines, oil stains along every carriageway */
function hgRoadWear() {
  const mk = (key, w, h, fn) => { const t = canvasTex(w, h, fn); t.anisotropy = 8; return new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, roughness: 0.85 }); };
  const manM = mk('man', 128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#3e3d3a'; c.beginPath(); c.arc(64, 64, 62, 0, TAU); c.fill(); c.strokeStyle = '#2a2927'; c.lineWidth = 6; c.beginPath(); c.arc(64, 64, 56, 0, TAU); c.stroke(); c.strokeStyle = 'rgba(110,108,100,.6)'; c.lineWidth = 2; for (let k = -40; k <= 40; k += 10) { c.beginPath(); c.moveTo(64 + k, 20); c.lineTo(64 + k, 108); c.stroke(); } c.fillStyle = 'rgba(150,146,135,.7)'; c.font = 'bold 14px sans-serif'; c.textAlign = 'center'; c.fillText('하수', 64, 70); });
  const patchM = mk('patch', 256, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(40,40,42,.28)'; c.beginPath(); c.moveTo(6, 10); for (let x = 6; x < w - 6; x += 20) c.lineTo(x, 6 + rand(0, 8)); c.lineTo(w - 6, h - 10); for (let x = w - 6; x > 6; x -= 20) c.lineTo(x, h - 6 - rand(0, 8)); c.closePath(); c.fill(); c.strokeStyle = 'rgba(16,16,18,.4)'; c.lineWidth = 2; c.stroke(); });
  const crackM = mk('crack', 256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(14,14,16,.5)'; for (let i = 0; i < 4; i++) { c.lineWidth = rand(1, 2.5); c.beginPath(); let x = rand(40, 216), y = rand(40, 216); c.moveTo(x, y); for (let k = 0; k < 12; k++) { x += rand(-16, 16); y += rand(-16, 16); c.lineTo(x, y); } c.stroke(); } });
  const oilM = mk('oil', 128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); const g = c.createRadialGradient(64, 64, 4, 64, 64, 60); g.addColorStop(0, 'rgba(18,18,20,.28)'); g.addColorStop(1, 'rgba(18,18,20,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const man = [], patch = [], crack = [], oil = [];
  const put = (x, z, yaw) => { const r = Math.random(); const y = hgGround(x, z) + 0.075;
    if (r < 0.18) man.push([x, y, z, yaw, -Math.PI / 2, 0, 1, 1, 1]); else if (r < 0.42) patch.push([x, y, z, yaw + (Math.random() < 0.5 ? 0 : Math.PI / 2), -Math.PI / 2, 0, rand(2.5, 6), rand(1.2, 2.5), 1]);
    else if (r < 0.75) crack.push([x, y, z, rand(0, TAU), -Math.PI / 2, 0, rand(2, 5), rand(2, 5), 1]); else oil.push([x, y, z, rand(0, TAU), -Math.PI / 2, 0, rand(1, 2.4), rand(1.4, 3), 1]); };
  for (let z = HG.N - 10; z > HG.end; z -= rand(9, 18)) put(pick([-1, 1]) * rand(3.5, 16), z, 0);
  for (let z = HG.S - 10; z > HG.N + 10; z -= rand(8, 16)) put(pick([-1, 1]) * rand(4, 17), z, 0);
  rtInit(); for (let s = 5; s < RT.total - 40; s += rand(9, 18)) { const p = rtAt(s, pick([-1, 1]) * rand(3.5, 16)); put(p.x, p.z, p.yaw); }
  const pl = new THREE.PlaneGeometry(1, 1);
  for (const [list, m] of [[man, manM], [patch, patchM], [crack, crackM], [oil, oilM]]) { const geo = m === manM ? new THREE.PlaneGeometry(0.9, 0.9) : pl; const im = hgInst(geo, m, list, { cast: false }); if (im) { im.receiveShadow = true; im.renderOrder = 1; } }
}
/* parked and abandoned cars at the kerbs: a modelled sedan / SUV / van, instanced, with paint, glass, wheels and lights */
function hgCars() {
  const sedan = sideExtrude([[2.3, 0.35], [2.32, 0.78], [1.6, 0.98], [0.75, 1.02], [0.25, 1.42], [-1.0, 1.44], [-1.75, 1.05], [-2.28, 0.96], [-2.3, 0.4], [-1.9, 0.28], [1.9, 0.28]], 1.8, 0.08);
  const suv = sideExtrude([[2.3, 0.45], [2.32, 0.95], [1.55, 1.12], [0.9, 1.18], [0.45, 1.74], [-2.05, 1.76], [-2.3, 1.62], [-2.32, 0.5], [-1.9, 0.38], [1.9, 0.38]], 1.88, 0.08);
  const glassS = sideExtrude([[0.72, 1.04], [0.26, 1.4], [-0.98, 1.42], [-1.7, 1.07]], 1.62, 0.02), glassU = sideExtrude([[0.88, 1.2], [0.47, 1.7], [-2.0, 1.72], [-2.24, 1.6], [-2.24, 1.2]], 1.72, 0.02);
  const wheel = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 14); wheel.rotateZ(Math.PI / 2);
  const paint = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, metalness: 0.45 }), glassM = new THREE.MeshStandardMaterial({ color: 0x1a2228, roughness: 0.05, metalness: 0.7 }), tyre = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 }), burnt = MT.burnt();
  const light = new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.2, emissive: 0x222222 }), tail = new THREE.MeshStandardMaterial({ color: 0x8a1810, roughness: 0.3 });
  const cols = [0xe8e8e6, 0x111214, 0x8a8e92, 0x3a3e44, 0xd8d8d2, 0x1c2a44, 0x5a1414, 0xb8bcc0, 0xf2f2ee, 0x26323a];
  const spots = []; const add = (x, z, yaw) => { if (hgGround(x, z) < -1) return; spots.push([x, z, yaw + (Math.random() < 0.15 ? rand(-0.12, 0.12) : rand(-0.04, 0.04)) + (Math.random() < 0.5 ? 0 : Math.PI)]); };
  for (let z = HG.N - 40; z > HG.end + 10; z -= rand(9, 30)) if (Math.random() < 0.55 && !HG.junc.some(([jz, jw]) => Math.abs(z - jz) < jw / 2 + 6)) add(pick([-1, 1]) * 15.6, z, 0);
  rtInit(); for (let s = 20; s < RT.total - 60; s += rand(9, 30)) { if (Math.random() > 0.5 || (RT.junc || []).some(([js, jw]) => Math.abs(s - js) < jw / 2 + 6)) continue; const k = pick([-1, 1]); const p = rtAt(s, k * 15.6); add(p.x, p.z, p.yaw); }
  const kinds = [[sedan, glassS, 0.0], [suv, glassU, 0.1]];
  for (const [bodyG, glassG, ly] of kinds) { const mine = spots.filter(() => Math.random() < (bodyG === sedan ? 0.6 : 0.4)); if (!mine.length) continue;
    const isB = mine.map(() => Math.random() < 0.12); const n = mine.length;
    const body = new THREE.InstancedMesh(bodyG, paint, n), bodyB = new THREE.InstancedMesh(bodyG, burnt, n), gl = new THREE.InstancedMesh(glassG, glassM, n), wh = new THREE.InstancedMesh(wheel, tyre, n * 4), hl = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.14, 0.05), light, n), tl = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.14, 0.05), tail, n);
    const d = new THREE.Object3D(), c = new THREE.Color(), hide = new THREE.Matrix4().makeScale(0, 0, 0);
    mine.forEach(([x, z, yaw], i) => { const y = hgGround(x, z); d.position.set(x, y, z); d.rotation.set(0, yaw, 0); d.scale.set(1, 1, 1); d.updateMatrix();
      if (isB[i]) { bodyB.setMatrixAt(i, d.matrix); body.setMatrixAt(i, hide); gl.setMatrixAt(i, hide); } else { body.setMatrixAt(i, d.matrix); bodyB.setMatrixAt(i, hide); gl.setMatrixAt(i, d.matrix); }
      body.setColorAt(i, c.set(pick(cols)));
      for (let k = 0; k < 4; k++) { const o = new THREE.Vector3(k < 2 ? -0.82 : 0.82, 0.33, k % 2 ? 1.4 : -1.45).applyEuler(d.rotation); const w = new THREE.Object3D(); w.position.set(x + o.x, y + o.y, z + o.z); w.rotation.set(0, yaw, 0); w.updateMatrix(); wh.setMatrixAt(i * 4 + k, isB[i] && k === 1 ? hide : w.matrix); }
      for (const [im, zz] of [[hl, -2.31], [tl, 2.31]]) { const o = new THREE.Vector3(0, 0.82 + ly, zz).applyEuler(d.rotation); const w = new THREE.Object3D(); w.position.set(x + o.x, y + o.y, z + o.z); w.rotation.set(0, yaw, 0); w.updateMatrix(); im.setMatrixAt(i, isB[i] ? hide : w.matrix); }
      const cc = Math.abs(Math.cos(yaw)), ss = Math.abs(Math.sin(yaw)); const hx = 0.95 * cc + 2.3 * ss, hz = 0.95 * ss + 2.3 * cc; addCollider(x - hx, y, z - hz, x + hx, y + 1.5, z + hz, {});
      if (isB[i] && Math.random() < 0.35) addEmitter(v3(x, y + 1.2, z), 'smoke', 0.6, 2); });
    for (const im of [body, bodyB, gl, wh, hl, tl]) { im.castShadow = im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; G.world.add(im); } if (body.instanceColor) body.instanceColor.needsUpdate = true; }
}
function hgRealism() {
  const oldA = HGA; const { asph, conc } = hgUpgradeTextures(); HGA = asph;
  hgRoadWear(); hgCars(); hgEnvironment(); G.realism = true;
  // every standard material in the sample gets reflections and (where it has a pattern) derived relief; the shared concrete swaps to the detailed one
  const seen = new Set();
  const fix = (m) => { if (!m || seen.has(m)) return; seen.add(m); if (m.map === TX.concrete) { m.map = conc.clone(); m.map.needsUpdate = true; m.map.repeat.copy(TX.concrete.repeat); } else if (oldA && m.map === oldA) { m.map = asph; } hgDetailMaterial(m); };
  for (const root of [G.staticRoot, G.world]) root.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(fix); });
}

/* ---------- the river, the banks and 노들섬 ---------- */
function hgRiver() {
  const wm = new THREE.MeshStandardMaterial({ color: 0x3c4a50, roughness: 0.18, metalness: 0.35 });
  { const nt = canvasTex(256, 256, (g, w, h) => { g.fillStyle = 'rgb(128,128,255)'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const v = randi(110, 150); g.fillStyle = `rgba(${v},${randi(110, 150)},255,.5)`; g.fillRect(rand(0, w), rand(0, h), rand(6, 26), rand(1, 3)); } }, false);
    nt.repeat.set(60, 30); wm.normalMap = nt; wm.normalScale.set(0.35, 0.35); G.waterNormal = nt; }
  const wp = new THREE.Mesh(new THREE.PlaneGeometry(5000, 905), wm); wp.rotation.x = -Math.PI / 2; wp.position.set(0, HG.water - 0.2, -450); wp.receiveShadow = true; G.world.add(wp);
  G.updaters.push((dt) => { if (G.waterNormal) G.waterNormal.offset.x += dt * 0.004; });
  const conc = hgMat('bank', { color: 0xa09e98, map: 'concrete', rough: 0.95 }), grass = hgMat('grassP', { color: 0x9aa070, map: 'grass', rough: 1 }), asph = hgMat('asph', { color: 0xffffff, map: 'asphalt', rough: 0.92 });
  const riprap = hgMat('riprap', { color: 0x8a867c, map: 'concrete', rough: 1 }), bike = hgMat('bike', { color: 0xa0584a, rough: 0.95 });
  // 노량진 / 용산 city ground
  hgMesh(new THREE.BoxGeometry(5000, 30, 900), hgMat('city', { color: 0x9a9890, map: 'concrete', rough: 0.95 }), 0, -15, 496, { cast: false });
  hgMesh(new THREE.BoxGeometry(7600, 30, 7000), hgMat('city', { color: 0x9a9890, map: 'concrete', rough: 0.95 }), -1100, -15, HG.N - 3500 + 2, { cast: false });
  // south bank: retaining wall, 올림픽대로 on its terrace, riprap slope, riverside path, quay wall
  hgMesh(new THREE.BoxGeometry(5000, 26, 32), conc, 0, -17, 30, { cast: false });
  hgMesh(new THREE.BoxGeometry(5000, 0.1, 26), asph, 0, -3.95, 30, { cast: false });
  { const sl = new THREE.PlaneGeometry(5000, Math.hypot(10, 3)); sl.rotateX(-Math.PI / 2 + Math.atan2(3, 10)); const m = new THREE.Mesh(sl, riprap); m.position.set(0, -5.5, 9); m.receiveShadow = true; G.world.add(m); }
  hgMesh(new THREE.BoxGeometry(5000, 8, 4), conc, 0, -11, 2, { cast: false }); hgMesh(new THREE.BoxGeometry(5000, 0.05, 2.4), bike, 0, -6.97, 2.2, { cast: false });
  // north bank: retaining wall under 용산, 강변북로, 이촌 한강공원 (lawn, bike path), stepped quay
  hgMesh(new THREE.BoxGeometry(5000, 22, 100), conc, 0, -18, -954, { cast: false });
  hgMesh(new THREE.BoxGeometry(5000, 0.1, 40), asph, 0, -6.95, -982, { cast: false });
  hgMesh(new THREE.BoxGeometry(5000, 0.1, 48), grass, 0, -6.95, -936, { cast: false });
  hgMesh(new THREE.BoxGeometry(5000, 0.06, 3), bike, 0, -6.9, -920, { cast: false });
  for (let i = 0; i < 3; i++) hgMesh(new THREE.BoxGeometry(5000, 1.3, 2.6), conc, 0, -8.3 - i * 1.3, -903.5 + i * 2.6, { cast: false });
  hgMesh(new THREE.BoxGeometry(5000, 7, 1.2), conc, 0, -3.5, HG.N + 1.6, { cast: false }); // the wall up to the street
  // the two riverside expressways: lanes, the centre barrier
  for (const [z0, y] of [[30, -3.9], [-982, -6.88]]) {
    hgMesh(new THREE.BoxGeometry(5000, 0.9, 0.6), conc, 0, y + 0.45, z0);
    const dash = []; for (let x = -1200; x < 1200; x += 9) for (const off of [-9.75, -6.5, -3.25, 3.25, 6.5, 9.75]) if (Math.abs(x) > 22) dash.push([x, y + 0.03, z0 + off, Math.PI / 2]);
    hgInst(new THREE.BoxGeometry(0.15, 0.02, 3), hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), dash, { cast: false });
  }
  // 노들섬: quay walls, lawn, paths, the arts complex terraces, trees
  { const pts = []; for (let i = 0; i <= 64; i++) { const a = (i / 64) * TAU; const t = Math.cos(a); const x = 300 + 360 * Math.sign(t) * Math.pow(Math.abs(t), 0.6); const zc = (HG.I0 + HG.I1) / 2; const zz = zc + Math.sin(a) * 62; pts.push([x, zz]); }
    hgMesh(topExtrude(pts, 7.6, 0.2), conc, 0, -11.8, 0, { cast: false });
    hgMesh(topExtrude(pts.map(([x, z]) => [x * 0.995 - 0.6, (z - (HG.I0 + HG.I1) / 2) * 0.93 + (HG.I0 + HG.I1) / 2]), 0.3, 0.1), grass, 0, -4.25, 0, { cast: false });
    hgMesh(new THREE.BoxGeometry(640, 0.06, 4), hgMat('path', { color: 0xc4beb0, map: 'concrete' }), 300, -3.9, (HG.I0 + HG.I1) / 2 + 22, { cast: false });
    const white = hgMat('nodeul', { color: 0xe8e6e0, rough: 0.7 }), glassM = hgMat('nodeulG', { color: 0x40505a, rough: 0.2, metal: 0.4 });
    for (const [x, w, d, h] of [[70, 50, 46, 9], [140, 60, 52, 12], [205, 40, 36, 7]]) {
      hgMesh(new THREE.BoxGeometry(w, h, d), white, x, -4 + h / 2, (HG.I0 + HG.I1) / 2 - 4); hgMesh(new THREE.BoxGeometry(w - 4, h * 0.45, 0.2), glassM, x, -4 + h * 0.4, (HG.I0 + HG.I1) / 2 - 4 + d / 2 + 0.12, { cast: false });
      hgMesh(new THREE.BoxGeometry(w * 0.7, 0.4, d * 0.7), grass, x - w * 0.1, -4 + h + 0.2, (HG.I0 + HG.I1) / 2 - 4); addCollider(x - w / 2, -4, (HG.I0 + HG.I1) / 2 - 4 - d / 2, x + w / 2, -4 + h, (HG.I0 + HG.I1) / 2 - 4 + d / 2, {});
    }
    // stair tower from the deck down to the island, both sides
    for (const s of [-1, 1]) { hgMesh(new THREE.BoxGeometry(6, 5, 8), white, s * (HG.half + 4), -1.5, -470); hgMesh(new THREE.BoxGeometry(5.6, 3, 0.15), glassM, s * (HG.half + 4), -1.5, -465.9, { cast: false }); }
  }
}

/* ---------- 한강대교: twin decks, seven tied arches each, girder spans over 노들섬 and the north channel ---------- */
function hgBridge() {
  const steel = hgMat('steel', { color: 0x8796a0, rough: 0.5, metal: 0.45 }), steelD = hgMat('steelD', { color: 0x58646c, rough: 0.6, metal: 0.4 });
  const conc = hgMat('pier', { color: 0xa9a7a1, map: 'concrete', rough: 0.95 }), asph = hgMat('deck', { color: 0xf4f4f4, map: 'asphalt', rough: 0.92 }), walk = hgMat('walk', { color: 0xb0a898, map: 'concrete', rough: 0.95 });
  const L = 46 - HG.N, zc = (46 + HG.N) / 2;
  for (const sd of [-1, 1]) {
    const cx = sd * 9.45;
    hgMesh(new THREE.BoxGeometry(18.3, 0.25, L), asph, cx, -0.125, zc, { cast: false });
    hgMesh(new THREE.BoxGeometry(18.3, 1.0, L), conc, cx, -0.75, zc);
    hgMesh(new THREE.BoxGeometry(2.6, 0.2, L), walk, sd * 17.3, 0.1, zc, { cast: false });
    // outer railing (also a collider, so nobody walks off), the inner crash barrier
    hgMesh(new THREE.BoxGeometry(0.12, 0.12, L), steel, sd * 18.55, 1.2, zc); hgMesh(new THREE.BoxGeometry(0.1, 0.1, L), steel, sd * 18.55, 0.7, zc);
    addCollider(sd * 18.55 - 0.15, 0, HG.N, sd * 18.55 + 0.15, 1.3, 46, {});
    hgMesh(new THREE.BoxGeometry(0.4, 0.75, L), conc, sd * 15.85, 0.37, zc); addCollider(sd * 15.85 - 0.2, 0, HG.N, sd * 15.85 + 0.2, 0.75, 46, {});
  }
  hgMesh(new THREE.BoxGeometry(0.9, 0.95, L), conc, 0, 0.47, zc); hgMesh(new THREE.BoxGeometry(0.8, 1.2, L), conc, 0, -0.65, zc); addCollider(-0.45, 0, HG.N, 0.45, 0.95, 46, {});
  // railing posts, lane dashes and edge lines
  { const posts = [], dash = [], edge = [];
    for (let z = 44; z > HG.N; z -= 2) for (const sd of [-1, 1]) posts.push([sd * 18.55, 0.65, z]);
    for (let z = 40; z > HG.N + 4; z -= 9) for (const sd of [-1, 1]) for (const k of [1, 2, 3]) dash.push([sd * (0.95 + k * 3.55), 0.01, z]);
    hgInst(new THREE.BoxGeometry(0.08, 1.3, 0.08), steel, posts, { cast: false });
    hgInst(new THREE.BoxGeometry(0.15, 0.02, 3), hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), dash, { cast: false });
    for (const sd of [-1, 1]) for (const x of [1.0, 15.5]) hgMesh(new THREE.BoxGeometry(0.15, 0.02, L - 4), x < 2 ? hgMat('lineY', { color: 0xd8b040, rough: 0.6 }) : hgMat('lineW', { color: 0xdedcd4, rough: 0.6 }), sd * x, 0.01, zc, { cast: false }); }
  // seven tied arches per deck over the south channel: ribs on both deck edges, hangers every ~5 m, bracing over the deck, portals at the ends
  const rise = 10.5, segs = 22, ribG = new THREE.BoxGeometry(0.75, 1.15, 1);
  const hang = [], strut = [];
  for (let k = 0; k < 7; k++) {
    const z0 = -k * HG.span, z1 = -(k + 1) * HG.span; const yA = (t) => 0.4 + rise * (1 - (2 * t - 1) * (2 * t - 1)); const zA = (t) => lerp(z0, z1, t);
    for (const sd of [-1, 1]) for (const rx of [sd * 0.95, sd * 17.95]) {
      for (let i = 0; i < segs; i++) { const t0 = i / segs, t1 = (i + 1) / segs; const a = v3(rx, yA(t0), zA(t0)), b = v3(rx, yA(t1), zA(t1));
        const me = new THREE.Mesh(ribG, steel); me.position.copy(a).add(b).multiplyScalar(0.5); me.scale.z = a.distanceTo(b) + 0.05; me.lookAt(b); me.castShadow = true; G.staticRoot.add(me); }
      hgMesh(new THREE.BoxGeometry(0.85, 1.3, HG.span), steelD, rx, 0.3, (z0 + z1) / 2); // tie girder at the deck edge
      for (let i = 1; i < 12; i++) { const t = i / 12, y1 = yA(t) - 0.5; hang.push([rx, (0.95 + y1) / 2, zA(t), 0, 0, 0, 1, y1 - 0.95, 1]); }
    }
    for (const sd of [-1, 1]) for (let i = 3; i <= 9; i++) { const t = i / 12; strut.push([sd * 9.45, yA(t) + 0.2, zA(t), 0, 0, 0, 1, 1, 1]); }
  }
  hgInst(new THREE.CylinderGeometry(0.05, 0.05, 1, 6), steelD, hang, { cast: false });
  hgInst(new THREE.BoxGeometry(17, 0.45, 0.45), steel, strut);
  // piers in the south channel: a wall pier with rounded noses and a cap under each pair of arch ends
  for (let k = 0; k <= 7; k++) { const z = -k * HG.span;
    hgMesh(new THREE.BoxGeometry(37, 12, 3.6), conc, 0, HG.water - 4 + 6, z); for (const s of [-1, 1]) hgMesh(new THREE.CylinderGeometry(1.8, 1.8, 12, 16), conc, s * 18.5, HG.water - 4 + 6, z);
    hgMesh(new THREE.BoxGeometry(39, 1.2, 4.6), conc, 0, -1.85, z); }
  // girder spans over 노들섬 and the north channel: steel plate girders under each deck, round column pairs
  const gz = [HG.I0]; for (let z = HG.I0 - 53; z > HG.N + 10; z -= 51) gz.push(z); gz.push(HG.N);
  for (const sd of [-1, 1]) for (const gx of [2.6, 7.2, 11.8, 16.4]) { const x = sd * gx;
    hgMesh(new THREE.BoxGeometry(0.28, 2.2, HG.I0 - HG.N), steelD, x, -2.35, (HG.I0 + HG.N) / 2); hgMesh(new THREE.BoxGeometry(0.7, 0.14, HG.I0 - HG.N), steelD, x, -3.45, (HG.I0 + HG.N) / 2); }
  for (const z of gz.slice(1, -1)) { const base = hgGround(30, z) > -10.5 ? hgGround(30, z) : HG.water - 3;
    for (const x of [-14.5, -4.5, 4.5, 14.5]) hgMesh(new THREE.CylinderGeometry(1.1, 1.2, -3.5 - base, 16), conc, x, (base - 3.5) / 2, z);
    hgMesh(new THREE.BoxGeometry(38, 1.4, 3), conc, 0, -4.2, z); }
  // lamps along the median: tall poles, a double arm out over each deck
  const poles = [], arms = [], heads = [];
  for (let z = 30; z > HG.N; z -= 40) { poles.push([0, 5.9, z]); for (const s of [-1, 1]) { arms.push([s * 1.6, 11.3, z, 0, 0, s * -0.12]); heads.push([s * 3.1, 11.0, z]); } }
  hgInst(new THREE.CylinderGeometry(0.11, 0.17, 11, 10), steelD, poles); hgInst(new THREE.BoxGeometry(3.2, 0.12, 0.12), steelD, arms); hgInst(new THREE.BoxGeometry(0.9, 0.18, 0.4), hgMat('lamphead', { color: 0xd8d8d0, emissive: 0x6a6040, ei: 0.4 }), heads, { cast: false });
  hgRailway();
}

/* ---------- 한강철교 and the lines on either side ----------
   four double-track bridges side by side, ~1,110 m: the ten spans on the 노량진 side are Warren trusses (7 panels each), the rest plate girders.
   Off the bridge the tracks run on into 노량진역 to the south and, past 강변북로, up the west side of 한강대로 into 용산역 and on north. */
const HR = { xs: [-121, -136, -151, -166], z0: 42, zT: 42 - 10 * 62.5, z1: -1070, deck: 0.6, south: 640, north: -3700 };
/* the line's offset from its river alignment, by z, laid through real reference points: straight over the bridges, west into 용산역,
   485 m west of the avenue at 삼각지, 120 m at 남영, then 160 m west of 한강대로 through 서울역, where it ends for us */
const HRB = { z: -1110 };
let HRT = null;
function rtXatZ(z) { rtInit(); if (z >= RT.z0) return 0; let lo = 0, hi = RT.Z.length - 1; if (z <= RT.Z[hi]) return RT.X[hi]; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (RT.Z[m] > z) lo = m; else hi = m; } const t = (RT.Z[lo] - z) / (RT.Z[lo] - RT.Z[hi]); return RT.X[lo] + (RT.X[hi] - RT.X[lo]) * t; }
function hrBuild() {
  rtInit(); const N = 8000; const sz = (s) => rtAt(s).z;
  const zSj = sz(RT.junc0), zNy = sz(RT.junc0 + 770), zSt = sz(RT.sSta);
  HR.north = Math.round(zSt - 420);
  const cp = [[0, -143.5], [-1110, -143.5], [-1655, -268], [zSj, rtXatZ(zSj) - 485], [zNy, rtXatZ(zNy) - 120]];
  for (let z = zNy - 150; z > -N; z -= 100) cp.push([z, rtXatZ(z) - (z > zSt + 300 ? 120 + 40 * (zNy - 150 - z) / (zNy - 150 - zSt - 300) : 160)]);
  const raw = new Float32Array(N + 1); for (let i = 0; i <= N; i++) { const z = -i; let x = cp[cp.length - 1][1]; for (let k = 0; k < cp.length - 1; k++) { const [za, xa] = cp[k], [zb, xb] = cp[k + 1]; if (z <= za && z >= zb) { x = xa + (xb - xa) * (za - z) / (za - zb); break; } } raw[i] = x; }
  // smooth twice (box 160 m) except over the bridges, where the line stays dead straight
  let a = raw; for (let pass = 0; pass < 3; pass++) { const b = new Float32Array(N + 1); for (let i = 0; i <= N; i++) { if (i < 1180) { b[i] = a[i]; continue; } let sum = 0, n = 0; for (let k = -80; k <= 80; k += 4) { const q = Math.min(N, Math.max(0, i + k)); sum += a[q]; n++; } b[i] = sum / n; } a = b; }
  HRT = new Float32Array(N + 1); for (let i = 0; i <= N; i++) HRT[i] = a[i] + 143.5;
}
function hrOff(z) { if (z >= 0) return 0; if (!HRT) hrBuild(); const f = Math.min(-z, 7999), i = Math.floor(f); return HRT[i] + (HRT[i + 1] - HRT[i]) * (f - i); }
function hrYaw(z) { return Math.atan(-(hrOff(z - 1) - hrOff(z))); }
/* x of a line laid at x0 on the river alignment, carried round the bends at its true spacing */
function hrX(x0, z) { return -143.5 + hrOff(z) + (x0 + 143.5) / Math.cos(hrYaw(z)); }