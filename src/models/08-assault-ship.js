/* the amphibious assault ship, stern toward the beach: open well deck, the stern gate lowered into the sea, island and flight deck */
function makeLHD() {
  // amphibious assault ship (Dokdo/Wasp style), stern toward the beach: a raked, flared bow, full-length flight deck overhang,
  // a tall starboard island with masts and radars, and the open well deck aft with the stern gate lowered into the sea
  const g = new THREE.Group(); const M = vmats(0x6b7178);
  const hull = mat('lhdhull', { color: 0x6b7178, rough: 0.7, metal: 0.3 }), hullD = mat('lhdhulld', { color: 0x4e5258, rough: 0.75, metal: 0.25 }), boot = mat('lhdboot', { color: 0x2c2626, rough: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2c2e, roughness: 0.9, side: THREE.DoubleSide }), deckM = mat('lhddeck', { color: 0x44474a, rough: 0.85 });
  const L = 260, W = 40, H = 25, Y0 = -6, WW = 21, WL = 84, ZA = -L / 2 + WL; // ZA: where the well deck ends and the closed hull begins
  const B = (w, h, d, m, x, y, z, rx = 0) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.rotation.x = rx; me.castShadow = true; g.add(me); return me; };
  // forward hull: plan outline extruded up, then the bow is raked and the forefoot pulled in so it reads as a ship, not a box
  { const pts = [[-W / 2, ZA], [-W / 2, L / 2 - 70], [-W / 2 * 0.86, L / 2 - 34], [-W / 2 * 0.55, L / 2 - 6], [-W / 2 * 0.2, L / 2 + 14], [0, L / 2 + 20], [W / 2 * 0.2, L / 2 + 14], [W / 2 * 0.55, L / 2 - 6], [W / 2 * 0.86, L / 2 - 34], [W / 2, L / 2 - 70], [W / 2, ZA]];
    const geo = topExtrude(pts, H, 0.2); const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); const t = clamp(y / H, 0, 1), f = clamp((z - (L / 2 - 80)) / 100, 0, 1);
      pa.setX(i, x * lerp(1, lerp(0.35, 1, Math.pow(t, 0.7)), f) * lerp(0.9, 1, t)); pa.setZ(i, z - (1 - t) * 26 * f * f); }
    geo.computeVertexNormals(); const hm = new THREE.Mesh(geo, hull); hm.position.y = Y0; hm.castShadow = true; g.add(hm); }
  // aft hull around the well deck: two side blocks, the hangar block over the well, the well floor
  for (const s of [-1, 1]) { B((W - WW) / 2, H, WL, hull, s * (WW / 2 + (W - WW) / 4), Y0 + H / 2, -L / 2 + WL / 2); B((W - WW) / 2 * 0.9, 6, WL, hullD, s * (WW / 2 + (W - WW) / 4) * 1.0, Y0 + 3, -L / 2 + WL / 2); }
  B(WW, H - 10 - 1.2, WL, hull, 0, Y0 + 1.2 + 10 + (H - 10 - 1.2) / 2 + 0.6, -L / 2 + WL / 2);
  B(WW, 0.6, WL, deckM, 0, -0.8, -L / 2 + WL / 2); // the flooded well-deck floor, just under the sea
  // the waterline: dark boot-top band right round the hull
  for (const s of [-1, 1]) B(0.2, 1.4, L - 30, boot, s * (W / 2 * 0.92 + 0.1), 0.0, -12);
  // knuckle line and shell plating seams along the sides
  for (const s of [-1, 1]) { B(0.3, 0.5, L - 40, hullD, s * (W / 2 + 0.05), Y0 + H - 4.5, -20); for (let k = 0; k < 9; k++) B(0.08, H - 8, 0.15, hullD, s * (W / 2 + 0.04), Y0 + H / 2 + 1, -L / 2 + 14 + k * 26); }
  // well deck interior: walls, overhead, lamps, lane lines
  for (const s of [-1, 1]) B(0.3, 10, WL, dark, s * (WW / 2 - 0.1), 4.3, -L / 2 + WL / 2); B(WW, 0.3, WL, dark, 0, 9.2, -L / 2 + WL / 2); B(WW, 10, 0.3, dark, 0, 4.3, ZA);
  for (let i = 0; i < 10; i++) { const lm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.4), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffb060 : 0xff4030 })); lm.position.set(i % 2 ? WW / 2 - 0.4 : -WW / 2 + 0.4, 7.2, -L / 2 + 8 + i * 8); g.add(lm); }
  const lamp = new THREE.PointLight(0xffa860, 2.4, 70, 1.6); lamp.position.set(0, 8, -L / 2 + 34); g.add(lamp);
  for (const z of [10, 28, 48, 68]) { const pl = new THREE.PointLight(z % 20 ? 0xff5a3a : 0xffc080, 3.4, 40, 1.4); pl.position.set(0, 8.5, -L / 2 + z); g.add(pl); }
  { const sm = new THREE.MeshBasicMaterial({ color: 0xffb070 }); for (const sx of [-WW / 2 + 0.2, WW / 2 - 0.2]) for (let z = 4; z < WL; z += 6) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 1.6), sm); m.position.set(sx, 7.2, -L / 2 + z); g.add(m); } }
  for (const x of [-6.6, 0, 6.6]) B(0.25, 0.05, WL - 6, mat('welline', { color: 0xc8b24a }), x, -0.48, -L / 2 + WL / 2 + 2);
  // the stern: transom frame round the well opening, the gate hinged at its foot and lowered well under the surface
  for (const s of [-1, 1]) B(1.0, H, 0.8, hullD, s * (WW / 2 + 0.5), Y0 + H / 2, -L / 2 - 0.3); B(WW + 2, H - 11.2, 0.8, hullD, 0, Y0 + 11.2 + (H - 11.2) / 2 + 0.6, -L / 2 - 0.3);
  const gate = new THREE.Group(); gate.position.set(0, -1.3, -L / 2 - 0.4); g.add(gate);
  const gp = new THREE.Mesh(new THREE.BoxGeometry(WW - 0.4, 12, 0.5), hullD); gp.position.set(0, 6, 0); gate.add(gp); for (let k = 0; k < 6; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(WW - 1, 0.18, 0.2), M.dk); r.position.set(0, 1 + k * 2, 0.32); gate.add(r); }
  gate.rotation.x = -1.78; // lowered: it slopes down into the sea, its top surface below the boats' keels
  // flight deck: wider than the hull, squared off aft, angled in at the bow, with catwalks and the edge lights below
  const DY = Y0 + H + 0.8;
  { const pts = [[-W / 2 - 3, -L / 2 - 2], [-W / 2 - 3, L / 2 - 40], [-W / 2 + 4, L / 2 - 4], [-8, L / 2 + 12], [8, L / 2 + 12], [W / 2 - 2, L / 2 - 10], [W / 2 + 3, L / 2 - 50], [W / 2 + 3, -L / 2 - 2]];
    const dg = topExtrude(pts, 1.2, 0.05); const dm = new THREE.Mesh(dg, deckM); dm.position.y = DY - 1.2; dm.castShadow = true; g.add(dm); }
  for (const s of [-1, 1]) B(1.6, 0.3, L - 30, M.m2, s * (W / 2 + 4.2), DY - 1.5, -10); // catwalks
  for (let i = 0; i < 9; i++) B(1.4, 0.05, 6, mat('deckline', { color: 0xd0c890 }), -4, DY + 0.03, -L / 2 + 14 + i * 28);
  for (let i = 0; i < 6; i++) B(9, 0.05, 0.4, mat('deckline', {}), -4, DY + 0.03, -L / 2 + 40 + i * 36); // spot markings
  // the island: three stepped tiers, bridge windows, a funnel, two masts with radars
  const IX = W / 2 - 4;
  B(8, 9, 44, hull, IX, DY + 4.5, 18); B(7, 6, 32, hull, IX, DY + 12, 14); B(6, 4.5, 18, hull, IX, DY + 17.25, 10);
  for (let i = 0; i < 7; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 2.0), M.gl); w.position.set(IX - 3.53, DY + 13.2, 2 + i * 2.6); g.add(w); }
  for (let i = 0; i < 3; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.0, 0.05), M.gl); w.position.set(IX, DY + 13.2, -2.03); g.add(w); }
  B(4.5, 6, 7, hullD, IX, DY + 21, 26); B(4.0, 0.4, 6.4, M.dk, IX, DY + 24.1, 26); // funnel
  for (const [z, h] of [[12, 16], [30, 10]]) { B(0.6, h, 0.6, M.steel, IX, DY + 19.5 + h / 2, z); B(3.4, 0.25, 0.25, M.steel, IX, DY + 19.5 + h * 0.7, z); B(2.4, 0.25, 0.25, M.steel, IX, DY + 19.5 + h * 0.9, z); }
  { const dome = new THREE.Mesh(new THREE.SphereGeometry(1.6, 14, 10), mat('radome', { color: 0xe4e4dc, rough: 0.5 })); dome.position.set(IX, DY + 30, 30); g.add(dome);
    const rad = new THREE.Mesh(new THREE.BoxGeometry(6, 1.4, 0.3), M.steel); rad.position.set(IX, DY + 36.4, 12); g.add(rad); G.updaters.push((dt) => { if (!g.parent) return true; rad.rotation.y += dt * 1.6; });
    for (const s of [-1, 1]) { const ar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 3.2), M.m3); ar.position.set(IX + s * 3.1, DY + 17.2, 10); g.add(ar); } }
  // deck life: parked aircraft, deck-edge lights, a deck-edge elevator
  for (const [x, z, r, k] of [[-10, -70, 0.3, 'h'], [-11, -40, -0.2, 'h'], [-10, -8, 0.1, 'o'], [-11, 26, 0.25, 'o'], [-9, 62, -0.15, 'h'], [4, 86, 0.4, 'h'], [-6, 104, 0.2, 'o']]) {
    const c = k === 'o' ? makeOsprey() : makeHeliMesh(0x5a6066); const r0 = c.root; r0.position.set(x, DY + (k === 'o' ? 1.3 : 1.25), z); r0.rotation.y = r; g.add(r0);
    if (k === 'o') for (const rr of c.rotors) rr.nac.rotation.x = 0; }
  const edge = [new THREE.MeshBasicMaterial({ color: 0x40ff70 }), new THREE.MeshBasicMaterial({ color: 0xff4030 }), new THREE.MeshBasicMaterial({ color: 0xfff0c0 })];
  for (let z = -L / 2 + 2; z < L / 2 - 30; z += 8) for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), edge[sx < 0 ? 1 : 0]); m.position.set(sx * (W / 2 + 2.8), DY + 0.1, z); g.add(m); }
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.4), edge[2]); m.position.set(-4, DY + 0.06, -L / 2 + 25 + i * 30); g.add(m); }
  B(14, 0.6, 16, M.m3, -W / 2 - 6, DY - 0.5, 40); // deck-edge elevator
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) B(0.2, 2.5, 7, dark, s * (W / 2 + 0.05), Y0 + 14, -60 + i * 32); // boat-deck openings
  // hull number on the bow quarter, anchors
  const t = canvasTex(256, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#e8e8e0'; c.font = 'bold 96px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('6111', w / 2, h / 2 + 4); });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(13, 6.5), new THREE.MeshBasicMaterial({ map: t, transparent: true })); p.position.set(s * (W / 2 * 0.86 + 0.3), Y0 + H - 6, L / 2 - 36); p.rotation.y = s * Math.PI / 2 + s * -0.08; g.add(p);
    B(1.6, 1.6, 0.5, M.dk, s * 7, Y0 + H - 5, L / 2 + 4); }
  g.userData = { gate, L, W, WW };
  return g;
}
