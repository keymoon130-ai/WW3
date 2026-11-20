/* =========================================================
   detailed vehicle models (tanks, APC, truck, helicopters, landing craft)
   ========================================================= */
const VGC = {};
const VSCALE = 1.45; // ground vehicles at 2-3x a soldier's height
function vg(key, fn) { if (!VGC[key]) { VGC[key] = fn(); VGC[key].userData.keep = true; } return VGC[key]; }
function mk(parent, geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); me.castShadow = true; me.receiveShadow = true; parent.add(me); return me; }
const VB = (w, h, d) => vg(`b${w}_${h}_${d}`, () => new THREE.BoxGeometry(w, h, d));
const VC = (rt, rb, h, s = 12) => vg(`c${rt}_${rb}_${h}_${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s));
/* side profile [[z,y]...] extruded across x (width w, centered) */
function sideExtrude(pts, w, bevel = 0.04) {
  const sh = new THREE.Shape(); pts.forEach(([z, y], i) => (i ? sh.lineTo(-z, y) : sh.moveTo(-z, y)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: w - bevel * 2, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1 });
  g.rotateY(Math.PI / 2); g.translate(-(w - bevel * 2) / 2, 0, 0); return g;
}
/* top-view outline [[x,z]...] extruded upward (height h) */
function topExtrude(pts, h, bevel = 0.04) {
  const sh = new THREE.Shape(); pts.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: h - bevel * 2, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 1 });
  g.rotateX(-Math.PI / 2); g.translate(0, bevel, 0); return g;
}
function concatGeos(list) {
  let n = 0; for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o3 = 0, o2 = 0;
  for (const g of list) { pos.set(g.attributes.position.array, o3); nor.set(g.attributes.normal.array, o3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o2); o3 += g.attributes.position.count * 3; o2 += g.attributes.position.count * 2; g.dispose(); }
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); bg.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); bg.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); bg.computeBoundingSphere(); return bg;
}
/* merge the direct mesh children of a group by material (keeps sub-groups such as turrets/wheels) */
function mergeLocal(group) {
  if (G.wsNoMerge) return; // the workshop keeps every part separate so each one can be picked
  const by = new Map(), rm = [];
  for (const c of group.children) {
    artPart(c); if (c.userData.pid != null && ART.model[c.userData.mkey]?.[c.userData.pid]?.hide) { rm.push(c); continue; } // a part hidden in the workshop is left out
    if (!c.isMesh || c.userData.nomerge || c.material.transparent) continue;
    c.updateMatrix(); const g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone(); g.clearGroups(); g.applyMatrix4(c.matrix);
    const k = c.material.uuid; if (!by.has(k)) by.set(k, { m: c.material, g: [] }); by.get(k).g.push(g); rm.push(c);
  }
  rm.forEach((c) => group.remove(c));
  for (const { m, g } of by.values()) { const me = new THREE.Mesh(concatGeos(g), m); me.castShadow = me.receiveShadow = true; me.userData.merged = true; group.add(me); }
}
function vmats(col) {
  const c = new THREE.Color(col);
  return {
    m: mat('veh' + col, { color: col, rough: 0.72, metal: 0.25 }),
    m2: mat('veh2' + col, { color: c.clone().multiplyScalar(0.78).getHex(), rough: 0.8, metal: 0.2 }),
    m3: mat('veh3' + col, { color: c.clone().lerp(new THREE.Color(0x9a9a88), 0.25).getHex(), rough: 0.8, metal: 0.15 }),
    dk: mat('vehdk', { color: 0x1c1d1c, rough: 0.9 }),
    rub: mat('rubber', { color: 0x202020, rough: 1 }),
    steel: mat('steel', { color: 0x4a4c4e, rough: 0.45, metal: 0.7 }),
    gl: mat('vglass', { color: 0x2a3640, rough: 0.12, metal: 0.6 }),
    lamp: mat('vlamp', { color: 0xd8d0b0, rough: 0.3, emissive: 0x302810 }),
  };
}
function wheelPivot(parent, x, y, z, r, w, M, spokes = true) {
  const piv = new THREE.Object3D(); piv.position.set(x, y, z); piv.userData.r = r; parent.add(piv);
  mk(piv, VC(r, r, w, 16), M.rub, 0, 0, 0, 0, 0, Math.PI / 2);
  mk(piv, VC(r * 0.62, r * 0.62, w + 0.02, 12), M.m2, 0, 0, 0, 0, 0, Math.PI / 2);
  mk(piv, VC(r * 0.22, r * 0.22, w + 0.06, 8), M.steel, 0, 0, 0, 0, 0, Math.PI / 2);
  if (spokes) for (let i = 0; i < 3; i++) mk(piv, VB(w + 0.03, r * 1.1, 0.06), M.m2, 0, 0, 0, i * Math.PI / 3, 0, 0);
  mergeLocal(piv);
  return piv;
}
