/* ---------------- art overrides: hand-tuned textures, materials and model parts ----------------
   ART_BAKED is what ships with the game (paste the workshop's "값 복사" JSON here to make edits permanent).
   On top of it sits what the workshop saved in this browser (localStorage 'ww3_art').
   tex: { name: { h, s, b, c, blur, rep, img } }  hue-rotate°, saturate %, brightness %, contrast %, blur px, repeat ×, replacement image (data URL)
   mat: { key: { color, rough, metal, emissive, ei, opacity, map } }
   model: { key: { pid: { p:[dx,dy,dz], r:[drx,dry,drz], s:[sx,sy,sz], c:0xrrggbb, hide:1 } } }   per part, relative to how the code builds it */
const ART_BAKED = { tex: {}, mat: {}, model: {} };
const ART = { tex: {}, mat: {}, model: {} };
function artReload() {
  const local = store.get('ww3_art', null) || {};
  for (const k of ['tex', 'mat', 'model']) {
    ART[k] = JSON.parse(JSON.stringify(ART_BAKED[k] || {}));
    for (const [n, v] of Object.entries(local[k] || {})) {
      if (k === 'model') { ART.model[n] = Object.assign(ART.model[n] || {}, v); for (const p in ART.model[n]) if (ART.model[n][p] === null) delete ART.model[n][p]; }
      else if (v === null) delete ART[k][n]; else ART[k][n] = Object.assign(ART[k][n] || {}, v);
    }
  }
}
artReload();

/* ---- textures: the drawn canvas is kept, and every adjustment is redrawn from it ---- */
function artTex(name, t) {
  if (!t || !t.image || !t.image.getContext) return t;
  const ov = ART.tex[name] || (name.startsWith('facade') ? ART.tex.facade : null);
  if (ov) artTexApply(t, ov); return t;
}
function artTexApply(t, ov) {
  const c = t.image; if (!c.getContext) return;
  if (!t.userData.orig) { const o = document.createElement('canvas'); o.width = c.width; o.height = c.height; o.getContext('2d').drawImage(c, 0, 0); t.userData.orig = o; t.userData.rep0 = t.repeat.clone(); }
  const draw = (src) => {
    const g = c.getContext('2d'); g.save(); g.clearRect(0, 0, c.width, c.height);
    const f = `hue-rotate(${ov.h || 0}deg) saturate(${ov.s ?? 100}%) brightness(${ov.b ?? 100}%) contrast(${ov.c ?? 100}%)` + (ov.blur ? ` blur(${ov.blur}px)` : '');
    g.filter = f;
    if (ov.blur) for (const dx of [-c.width, 0, c.width]) for (const dy of [-c.height, 0, c.height]) g.drawImage(src, dx, dy, c.width, c.height); // wrap the blur so the tile stays seamless
    else g.drawImage(src, 0, 0, c.width, c.height);
    g.restore(); t.needsUpdate = true;
  };
  if (ov.img) { const im = new Image(); im.onload = () => draw(im); im.src = ov.img; } else draw(t.userData.orig);
  const r = ov.rep ?? 1; t.repeat.set(t.userData.rep0.x * r, t.userData.rep0.y * r);
}
function artTexReset(t) { if (!t || !t.userData.orig) return; const c = t.image, g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(t.userData.orig, 0, 0); t.repeat.copy(t.userData.rep0); t.needsUpdate = true; }

/* ---- materials ---- */
function artMat(key, m) {
  if (!m.userData.base) m.userData.base = { color: m.color ? m.color.getHex() : null, rough: m.roughness, metal: m.metalness, emissive: m.emissive ? m.emissive.getHex() : null, ei: m.emissiveIntensity, opacity: m.opacity, map: m.userData.mapName || null };
  const ov = ART.mat[key]; if (ov) artMatApply(m, ov); return m;
}
function artMatApply(m, ov) {
  if (ov.color != null && m.color) m.color.setHex(ov.color);
  if (ov.rough != null && 'roughness' in m) m.roughness = ov.rough;
  if (ov.metal != null && 'metalness' in m) m.metalness = ov.metal;
  if (ov.emissive != null && m.emissive) m.emissive.setHex(ov.emissive);
  if (ov.ei != null && 'emissiveIntensity' in m) m.emissiveIntensity = ov.ei;
  if (ov.opacity != null) { m.opacity = ov.opacity; m.transparent = ov.opacity < 1 || m.transparent; }
  if (ov.map !== undefined) { const nm = ov.map || null; if ((m.userData.mapName || null) !== nm) { m.map = nm ? tex(nm) : null; m.userData.mapName = nm; m.needsUpdate = true; } }
}
function artMatReset(m) { const b = m.userData.base; if (!b) return; artMatApply(m, { color: b.color, rough: b.rough, metal: b.metal, emissive: b.emissive, ei: b.ei, opacity: b.opacity, map: b.map }); }

/* ---- model parts: every object added while a model builder runs gets a part number, in build order ---- */
let ART_MB = null; const ART_SEEN = {}; const ART_CMAT = new Map();
{ const add0 = THREE.Object3D.prototype.add;
  THREE.Object3D.prototype.add = function (...objs) { if (ART_MB) for (const o of objs) if (o && o.isObject3D && !o.userData.merged && o.userData.pid == null) { o.userData.pid = ART_MB.n++; o.userData.mkey = ART_MB.key; ART_MB.list.push(o); } return add0.apply(this, objs); }; }
function artSig(args, idx) {
  const s = (idx ? idx.map((i) => args[i]) : args).map((a) => a === undefined || a === null || a === false ? '' : a === true ? '1' : typeof a === 'string' ? a : typeof a === 'number' ? (Math.abs(a) >= 65536 ? '' : String(+a.toFixed(2))) : typeof a === 'object' && !a.isObject3D ? (() => { const o = {}; for (const k of Object.keys(a).sort()) if (a[k] !== undefined && a[k] !== null && a[k] !== false && typeof a[k] !== 'function' && typeof a[k] !== 'object') o[k] = typeof a[k] === 'number' && Math.abs(a[k]) >= 65536 ? 1 : a[k]; const j = JSON.stringify(o); return j === '{}' ? '' : j; })() : '');
  while (s.length && s[s.length - 1] === '') s.pop(); return s.length ? '(' + s.join(',') + ')' : '';
}
function artColorMat(m, hex) { const k = m.uuid + ':' + hex; let c = ART_CMAT.get(k); if (!c) { c = m.clone(); c.color.setHex(hex); c.userData.partColor = true; c.userData.src = m; ART_CMAT.set(k, c); } return c; }
/* applied once, just before the part is merged into its neighbours (or at the end of the build) */
function artPart(o) {
  if (o.userData.artDone || o.userData.pid == null) return; o.userData.artDone = true;
  o.userData.base = { p: o.position.toArray(), r: [o.rotation.x, o.rotation.y, o.rotation.z], s: o.scale.toArray(), m: o.material || null, v: o.visible };
  const ov = ART.model[o.userData.mkey]?.[o.userData.pid]; if (ov) artPartApply(o, ov);
}
function artPartApply(o, ov) {
  const b = o.userData.base; if (!b) return;
  o.position.fromArray(b.p); if (ov.p) o.position.add(new THREE.Vector3(...ov.p));
  o.rotation.set(b.r[0] + (ov.r?.[0] || 0), b.r[1] + (ov.r?.[1] || 0), b.r[2] + (ov.r?.[2] || 0));
  o.scale.fromArray(b.s); if (ov.s) o.scale.multiply(new THREE.Vector3(...ov.s));
  if (o.isMesh && b.m && b.m.color) o.material = ov.c != null ? artColorMat(b.m, ov.c) : b.m;
  o.visible = ov.hide ? false : b.v;
}
/* idx: which arguments change the model's build (colours and hull numbers do not) */
function artWrapModel(name, fn, idx = []) {
  const w = function (...args) {
    const key = name + artSig(args, idx); ART_SEEN[key] = { name, args };
    const prev = ART_MB; ART_MB = { key, n: 0, list: [] }; let r;
    try { r = fn.apply(this, args); for (const o of ART_MB.list) artPart(o); }
    finally { ART_MB = prev; }
    return r;
  };
  w.artOrig = fn; return w;
}
