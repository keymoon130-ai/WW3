/* ---------- 무궁화호: a KORAIL diesel locomotive (hood unit, cab at the front, long hood behind, six-axle bogies) and its coaches
   (white bodies, a blue band under the windows with a red line, grey roofs, gangways, two-axle bogies). Length along z, front at +z ---------- */
function makeLocoMesh() {
  const g = new THREE.Group(), blue = mat('locoB', { color: 0x1f3e7a, rough: 0.45, metal: 0.25 }), wht = mat('locoW', { color: 0xe8e8e2, rough: 0.45, metal: 0.2 }), dk = mat('locoD', { color: 0x1c1d1f, rough: 0.7 }), gl = mat('locoG', { color: 0x141c22, rough: 0.08, metal: 0.6 });
  const org = mat('locoO', { color: 0xe07020, rough: 0.5 }), lamp = mat('locoL', { color: 0xfff6dc, emissive: 0xfff0c8, ei: 1.2 }), steel = mat('locoS', { color: 0x5a5e62, rough: 0.5, metal: 0.6 });
  const add = (w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = true; g.add(me); return me; };
  add(3.0, 0.35, 20, steel, 0, 1.25, 0); add(3.1, 0.25, 19.6, dk, 0, 1.0, 0);                                        // frame and skirt
  add(2.3, 2.3, 13.6, blue, 0, 2.6, -2.7); add(2.32, 0.3, 13.6, wht, 0, 2.2, -2.7);                                    // long hood with a white band
  for (let z = -8.8; z < 3.5; z += 1.4) for (const s of [-1, 1]) add(0.04, 1.0, 1.0, dk, s * 1.17, 2.9, z);          // louvres
  add(3.0, 2.9, 3.2, blue, 0, 2.9, 6.0); add(3.02, 0.35, 3.22, wht, 0, 2.15, 6.0); add(3.02, 0.12, 3.22, org, 0, 1.95, 6.0); // cab
  add(2.7, 0.8, 0.05, gl, 0, 3.6, 7.62); for (const s of [-1, 1]) add(0.05, 0.75, 1.3, gl, s * 1.51, 3.6, 6.2);         // windscreen, side windows
  add(2.3, 1.4, 1.6, blue, 0, 2.3, 8.4); add(2.32, 0.3, 1.62, wht, 0, 2.0, 8.4);                                        // short hood (nose)
  for (const s of [-1, 1]) add(0.32, 0.22, 0.05, lamp, s * 0.75, 2.75, 9.22); add(0.4, 0.3, 0.05, lamp, 0, 4.25, 7.62);
  add(3.0, 0.5, 0.4, dk, 0, 1.0, 9.9); add(3.0, 0.5, 0.4, dk, 0, 1.0, -9.9);                                            // pilots
  for (const z of [-6.6, 6.6]) { add(2.6, 0.7, 4.2, dk, 0, 0.75, z); for (const dz of [-1.5, 0, 1.5]) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 14), steel); w.rotation.z = Math.PI / 2; w.position.set(s * 0.78, 0.5, z + dz); g.add(w); } }
  add(0.9, 0.3, 1.2, dk, 0, 3.9, -6); add(1.6, 0.2, 2.2, steel, 0, 3.85, -1);                                           // exhaust, radiator fan housing
  return g;
}
function makeCoachMesh(len = 23.5) {
  const g = new THREE.Group(), wht = mat('coachW', { color: 0xe6e6e0, rough: 0.4, metal: 0.25 }), blue = mat('coachB', { color: 0x1f3e7a, rough: 0.45 }), red = mat('coachR', { color: 0xb02424, rough: 0.5 });
  const roof = mat('coachRf', { color: 0x8a8e90, rough: 0.6, metal: 0.4 }), dk = mat('locoD', { color: 0x1c1d1f, rough: 0.7 }), gl = mat('coachG', { color: 0x182028, rough: 0.08, metal: 0.55 }), steel = mat('locoS', { color: 0x5a5e62, rough: 0.5, metal: 0.6 });
  const add = (geo, m, x, y, z) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; g.add(me); return me; };
  add(new RoundedBoxGeometry(3.05, 3.0, len, 3, 0.25), wht, 0, 2.55, 0); add(new RoundedBoxGeometry(2.9, 0.4, len - 0.3, 3, 0.18), roof, 0, 4.0, 0);
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.04, 0.42, len - 1.6), blue, s * 1.53, 1.75, 0); add(new THREE.BoxGeometry(0.04, 0.1, len - 1.6), red, s * 1.535, 2.04, 0);
    add(new THREE.BoxGeometry(0.04, 0.9, len - 5.2), gl, s * 1.53, 2.95, 0); for (let z = -len / 2 + 3.2; z <= len / 2 - 3.2; z += 1.95) add(new THREE.BoxGeometry(0.05, 0.92, 0.14), wht, s * 1.535, 2.95, z);
    for (const e of [-1, 1]) add(new THREE.BoxGeometry(0.05, 2.2, 0.85), dk, s * 1.53, 2.15, e * (len / 2 - 1.1)); }
  for (const e of [-1, 1]) add(new THREE.BoxGeometry(2.0, 2.6, 0.5), dk, 0, 2.4, e * (len / 2 + 0.15));                // gangways
  add(new THREE.BoxGeometry(2.6, 0.45, len - 2), dk, 0, 0.95, 0);                                                       // underframe
  for (const z of [-len / 2 + 3.2, len / 2 - 3.2]) { add(new THREE.BoxGeometry(2.5, 0.6, 3.0), dk, 0, 0.7, z); for (const dz of [-1.1, 1.1]) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.15, 14), steel); w.rotation.z = Math.PI / 2; w.position.set(s * 0.78, 0.46, z + dz); g.add(w); } }
  return g;
}
