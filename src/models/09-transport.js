/* ---------- Il-76 style transport: high swept wing with droop, four podded engines, T-tail, glazed navigator's nose,
   fuselage gear fairings, the upswept tail with its loading ramp; nose along −z like the fighters. ~46 m long, 50 m span ---------- */
function makeTransportMesh() {
  const g = new THREE.Group(), body = mat('il76', { color: 0x7a7e80, rough: 0.55, metal: 0.35 }), dk = mat('il76d', { color: 0x3a3e40, rough: 0.6, metal: 0.3 }), gl = mat('il76g', { color: 0x1a2228, rough: 0.1, metal: 0.6 });
  const red = mat('il76r', { color: 0xb02020, rough: 0.6 }), add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); me.castShadow = true; g.add(me); return me; };
  // fuselage: a lathe profile (radius along the length), nose at −z, tail upswept
  const prof = []; const N = 36; for (let i = 0; i <= N; i++) { const t = i / N, z = -23 + t * 46; let r = 3.1; if (t < 0.12) r = 3.1 * Math.sqrt(Math.max(0.02, t / 0.12)); if (t > 0.72) r = 3.1 - (t - 0.72) / 0.28 * 1.9; prof.push(new THREE.Vector2(Math.max(0.15, r), z)); }
  const fg = new THREE.LatheGeometry(prof, 24); fg.rotateX(Math.PI / 2); const pos = fg.attributes.position;
  for (let i = 0; i < pos.count; i++) { const z = pos.getZ(i); if (z > 10) pos.setY(i, pos.getY(i) + (z - 10) * 0.12); } fg.computeVertexNormals(); add(fg, body, 0, 0, 0);
  add(new THREE.SphereGeometry(1.2, 14, 10, 0, TAU, Math.PI / 2, Math.PI / 2), gl, 0, -0.9, -22.0, -0.4);           // the navigator's glazed chin
  add(new THREE.BoxGeometry(2.6, 0.7, 2.2), gl, 0, 2.15, -18.4, 0.25);                                                  // cockpit windows
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(1.4, 1.6, 12), dk, s * 2.9, -2.1, 1.0);                            // gear fairings
  add(new THREE.BoxGeometry(2.6, 0.12, 5), dk, 0, 1.2, 21.8, -0.5);                                                     // the ramp door, under the tail
  // high wing: two panels with anhedral and sweep
  for (const s of [-1, 1]) { const w = new THREE.Shape([[0, 0], [24.5, 6.2], [24.5, 8.6], [0, 7.8]].map(([a, b]) => new THREE.Vector2(a, b))); const wg = new THREE.ExtrudeGeometry(w, { depth: 0.55, bevelEnabled: false }); wg.rotateX(Math.PI / 2);
    const m = add(wg, body, s * 1.2, 3.3, -6, 0, 0, s * -0.06); if (s < 0) m.scale.x = -1;
    for (const e of [7.5, 14.5]) { const ex = s * (1.2 + e), ez = -6 + e * 0.253 - 1.5; add(new THREE.CylinderGeometry(0.85, 0.75, 5.2, 14), dk, ex, 3.3 - e * 0.06 - 1.4, ez, Math.PI / 2); add(new THREE.BoxGeometry(0.3, 1.0, 2.6), body, ex, 3.3 - e * 0.06 - 0.6, ez + 0.4); } }
  // T-tail
  { const f = new THREE.Shape([[0, 0], [8.5, 0], [11.5, 8.5], [8.6, 8.5]].map(([a, b]) => new THREE.Vector2(a, b))); const fgeo = new THREE.ExtrudeGeometry(f, { depth: 0.4, bevelEnabled: false }); fgeo.rotateY(-Math.PI / 2); add(fgeo, body, 0.2, 3.4, 13.2);
    for (const s of [-1, 1]) { const h = new THREE.Shape([[0, 0], [8.6, 3.0], [8.6, 4.8], [0, 4.6]].map(([a, b]) => new THREE.Vector2(a, b))); const hg = new THREE.ExtrudeGeometry(h, { depth: 0.3, bevelEnabled: false }); hg.rotateX(Math.PI / 2); const m = add(hg, body, s * 0.2, 12.0, 19.6); if (s < 0) m.scale.x = -1; }
    for (const s of [-1, 1]) { const st = add(new THREE.CircleGeometry(0.9, 5), red, s * 0.45, 7.5, 21.2, 0, s * Math.PI / 2); } }
  g.userData.tail = v3(0, -0.8, 23); return { root: g };
}
