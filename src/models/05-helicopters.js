/* ---------------- helicopters ---------------- */
function rotorAssembly(parent, y, r, blades, M, z = 0) {
  const rotor = new THREE.Group(); rotor.position.set(0, y, z); parent.add(rotor);
  mk(rotor, VC(0.32, 0.32, 0.16, 12), M.steel, 0, 0, 0);
  for (let i = 0; i < blades; i++) { const p = new THREE.Group(); p.rotation.y = i * TAU / blades; rotor.add(p); const b = mk(p, VB(0.32, 0.04, r), M.dk, 0, -0.04, r / 2 + 0.2, 0.02, 0, 0.05); }
  const disc = new THREE.Mesh(vg('rdisc' + r, () => new THREE.CircleGeometry(r + 0.2, 36).rotateX(-Math.PI / 2)), mat('rdisc', { color: 0x222222, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide }));
  disc.position.y = y - 0.04; disc.position.z = z; parent.add(disc);
  return rotor;
}
/* a smooth lofted hull: sections [z, w, h, yc, n (2 = ellipse … 6 = rounded box), xc] → one closed surface */
function hullLoft(secs, rs = 20) {
  const pos = [], uv = [], idx = [], N = secs.length;
  for (let i = 0; i < N; i++) { const [z, w, h, yc, n = 2, xc = 0] = secs[i];
    for (let k = 0; k <= rs; k++) { const a = k / rs * TAU, c = Math.cos(a), sn = Math.sin(a); const e = 2 / n;
      pos.push(xc + (w / 2) * Math.sign(c) * Math.pow(Math.abs(c), e), yc + (h / 2) * Math.sign(sn) * Math.pow(Math.abs(sn), e), z); uv.push(k / rs, i / (N - 1)); } }
  for (let i = 0; i < N - 1; i++) for (let k = 0; k < rs; k++) { const a = i * (rs + 1) + k, b = a + rs + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  for (const [i, flip] of [[0, true], [N - 1, false]]) { const [z, , , yc, , xc = 0] = secs[i]; const ci = pos.length / 3; pos.push(xc, yc, z); uv.push(0.5, 0.5);
    for (let k = 0; k < rs; k++) { const a = i * (rs + 1) + k; flip ? idx.push(ci, a + 1, a) : idx.push(ci, a, a + 1); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/* a flat plate from a [z, y] outline, t thick, centred on x */
function plateZY(pts, t) { const sh = new THREE.Shape(); pts.forEach(([z, y], i) => (i ? sh.lineTo(z, y) : sh.moveTo(z, y))); const g = new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }); g.rotateY(-Math.PI / 2); g.translate(t / 2, 0, 0); g.computeVertexNormals(); return g; }
function makeHeliMesh(col = 0x3e4336, attack = false, openDoor = false) {
  const M = vmats(col);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  let rotor, tail;
  if (attack) {
    // AH-64 type: narrow hull, stepped tandem canopy, nose sensor turret, chin cannon, stub wings with Hellfires and rocket pods, side nacelles, Longbow dome
    mk(body, vg('ahHull', () => hullLoft([[-3.95, 0.2, 0.2, -0.12, 2], [-3.65, 0.72, 0.72, -0.08, 2.4], [-3.0, 0.92, 1.0, 0.0, 3], [-1.0, 1.02, 1.28, 0.06, 3.6], [0.6, 1.08, 1.38, 0.1, 3.6], [1.7, 0.96, 1.2, 0.16, 3], [2.7, 0.66, 0.84, 0.32, 2.6], [6.9, 0.34, 0.44, 0.48, 2.2], [7.7, 0.26, 0.5, 0.62, 2]])), M.m);
    mk(body, vg('ahCan1', () => hullLoft([[-3.35, 0.5, 0.3, 0.5, 2.4], [-2.95, 0.78, 0.62, 0.58, 3], [-2.3, 0.88, 0.66, 0.64, 3.4], [-1.95, 0.88, 0.6, 0.62, 3.4]], 16)), M.gl);
    mk(body, vg('ahCan2', () => hullLoft([[-1.95, 0.7, 0.4, 0.74, 3], [-1.6, 0.9, 0.84, 0.86, 3.4], [-0.9, 0.94, 0.9, 0.94, 3.4], [-0.35, 0.86, 0.6, 0.86, 3]], 16)), M.gl);
    for (const z of [-2.62, -1.25]) mk(body, VB(0.92, 0.04, 0.05), M.dk, 0, z < -2 ? 0.93 : 1.36, z); // canopy frames
    mk(body, vg('ahTads', () => { const g = new THREE.CylinderGeometry(0.3, 0.3, 0.46, 16); g.rotateX(Math.PI / 2); return g; }), M.dk, 0, -0.32, -3.82);
    mk(body, vg('ahTadsW', () => new THREE.SphereGeometry(0.31, 14, 10)), M.dk, 0, -0.32, -3.64);
    mk(body, VC(0.18, 0.22, 0.3, 12), M.dk, 0, -0.7, -1.55); mk(body, VC(0.035, 0.035, 1.35, 8), M.steel, 0, -0.78, -2.25, Math.PI / 2); // M230 turret and barrel
    for (const s of [-1, 1]) {
      mk(body, vg('ahNac', () => hullLoft([[-0.55, 0.3, 0.3, 0, 2], [-0.3, 0.56, 0.6, 0, 2.6], [1.2, 0.6, 0.66, 0, 2.8], [1.6, 0.46, 0.5, 0, 2.4]], 14)), M.m2, s * 0.68, 0.82, 0.2);
      mk(body, VB(0.36, 0.3, 0.35), M.dk, s * 0.82, 0.88, 1.85, 0, s * 0.35, 0); // exhaust suppressor
      mk(body, VB(1.75, 0.09, 0.95), M.m, s * 1.32, 0.02, 0.05, 0, 0, s * -0.06); // stub wing
      for (const [wx, kind] of [[1.05, 'pod'], [1.75, 'hf']]) { mk(body, VB(0.1, 0.3, 0.5), M.dk, s * wx, -0.2, 0.05);
        if (kind === 'pod') { mk(body, vg('ahPod', () => { const g = new THREE.CylinderGeometry(0.21, 0.21, 1.5, 14); g.rotateX(Math.PI / 2); return g; }), M.m3, s * wx, -0.48, -0.05); mk(body, VC(0.17, 0.17, 0.02, 14), M.dk, s * wx, -0.48, -0.81, Math.PI / 2); }
        else for (const [dx, dy] of [[-0.12, -0.42], [0.12, -0.42], [-0.12, -0.66], [0.12, -0.66]]) mk(body, vg('ahHf', () => { const g = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 10); g.rotateX(Math.PI / 2); return g; }), M.steel, s * wx + dx, dy, -0.05); }
      mk(body, VC(0.04, 0.05, 0.95, 8), M.dk, s * 0.62, -0.85, -1.15, 0, 0, s * 0.3); mk(body, vg('ahWh', () => { const g = new THREE.CylinderGeometry(0.29, 0.29, 0.18, 16); g.rotateZ(Math.PI / 2); return g; }), M.rub, s * 0.82, -1.32, -1.15); }
    mk(body, plateZY([[6.8, 0.45], [7.45, 2.15], [7.95, 2.15], [7.75, 0.45]], 0.12), M.m, 0, 0, 0); // fin
    mk(body, VB(1.95, 0.06, 0.55), M.m, 0, 0.42, 7.55); // stabilator
    mk(body, VC(0.03, 0.04, 0.5, 6), M.dk, 0, 0.05, 7.1); mk(body, vg('ahTw', () => { const g = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12); g.rotateZ(Math.PI / 2); return g; }), M.rub, 0, -0.22, 7.1);
    mk(body, VC(0.13, 0.2, 0.5, 10), M.steel, 0, 1.35, 0);
    rotor = rotorAssembly(root, 1.62, 3.9, 4, M);
    mk(rotor, vg('ahLong', () => { const g = new THREE.SphereGeometry(0.42, 16, 10); g.scale(1, 0.55, 1); return g; }), M.m3, 0, 0.5, 0); mk(rotor, VC(0.08, 0.08, 0.45, 8), M.steel, 0, 0.22, 0);
    tail = new THREE.Group(); tail.position.set(-0.16, 1.9, 7.75); root.add(tail);
    for (let i = 0; i < 2; i++) mk(tail, VB(0.04, 1.4, 0.15), M.dk, 0, 0, 0, i * Math.PI / 2 + 0.3);
  } else {
    // KUH-1 수리온 type: a deep rounded cabin, a smooth nose with a big glazed cockpit, the engine deck on top, sponsons with wheels, a slim tail boom
    mk(body, vg('uhHull', () => hullLoft([[-3.62, 0.3, 0.32, -0.15, 2], [-3.35, 1.15, 1.05, -0.05, 2.4], [-2.9, 1.72, 1.68, 0.08, 3], [-2.25, 2.0, 2.0, 0.12, 3.6], [-1.5, 2.1, 2.12, 0.12, 4.4], [1.55, 2.1, 2.12, 0.12, 4.4], [2.35, 1.9, 1.95, 0.24, 3.6], [3.05, 1.2, 1.35, 0.48, 3], [3.7, 0.78, 0.86, 0.62, 2.5], [6.7, 0.42, 0.5, 0.78, 2.2], [7.75, 0.32, 0.45, 0.92, 2]])), M.m);
    mk(body, vg('uhGlass', () => hullLoft([[-3.33, 1.0, 0.56, 0.2, 2.4], [-2.95, 1.62, 0.95, 0.42, 3], [-2.4, 1.94, 1.05, 0.58, 3.6], [-2.05, 2.0, 0.9, 0.66, 4]], 18)), M.gl);
    mk(body, VB(0.05, 0.75, 0.05), M.dk, 0, 0.62, -2.98, 0.5); // windscreen centre post
    mk(body, vg('uhDeck', () => hullLoft([[-1.3, 1.1, 0.4, 1.2, 3], [-0.8, 1.45, 0.72, 1.32, 3.6], [1.7, 1.45, 0.72, 1.32, 3.6], [2.6, 0.95, 0.5, 1.22, 3]], 16)), M.m2);
    for (const s of [-1, 1]) {
      mk(body, VB(0.28, 0.24, 0.42), M.dk, s * 0.6, 1.45, 2.35, 0, s * 0.4, 0); // exhaust
      mk(body, VB(0.04, 0.5, 0.75), M.gl, s * 1.04, 0.42, -1.55); // cockpit door window
      if (!(openDoor && s < 0)) { mk(body, VB(0.04, 0.55, 0.62), M.gl, s * 1.05, 0.45, -0.25); mk(body, VB(0.04, 0.55, 0.62), M.gl, s * 1.05, 0.45, 0.65); }
      else mk(body, VB(0.04, 1.35, 1.75), M.dk, s * 1.05, 0.0, 0.2);
      mk(body, VB(0.03, 1.5, 0.04), M.dk, s * 1.06, 0.0, -0.75); mk(body, VB(0.03, 1.5, 0.04), M.dk, s * 1.06, 0.0, 1.15); mk(body, VB(0.03, 0.04, 1.9), M.dk, s * 1.06, 0.72, 0.2); // sliding door seams
      mk(body, vg('uhSpon', () => hullLoft([[-0.2, 0.2, 0.2, 0, 2], [0.2, 0.42, 0.46, 0, 2.6], [1.4, 0.42, 0.46, 0, 2.6], [1.9, 0.2, 0.25, 0, 2]], 12)), M.m2, s * 1.18, -0.72, 0.6);
      mk(body, vg('uhWh', () => { const g = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16); g.rotateZ(Math.PI / 2); return g; }), M.rub, s * 1.18, -1.12, 0.95);
      mk(body, VC(0.04, 0.05, 0.6, 8), M.dk, s * 0.42, -0.95, -2.35); mk(body, vg('uhNw', () => { const g = new THREE.CylinderGeometry(0.2, 0.2, 0.14, 14); g.rotateZ(Math.PI / 2); return g; }), M.rub, s * 0.42, -1.25, -2.35);
    }
    mk(body, vg('uhFlir', () => new THREE.SphereGeometry(0.2, 12, 10)), M.dk, 0, -0.62, -3.15);
    mk(body, plateZY([[6.7, 0.6], [7.55, 2.5], [8.05, 2.5], [7.85, 0.6]], 0.14), M.m, 0, 0, 0); // swept fin
    mk(body, VB(2.4, 0.06, 0.6), M.m, 0, 0.62, 6.9); // stabiliser
    for (const s of [-1, 1]) mk(body, VB(0.06, 0.45, 0.45), M.m, s * 1.2, 0.75, 6.9);
    mk(body, VC(0.03, 0.04, 0.35, 6), M.dk, 0, 0.25, 7.5); // tail skid
    mk(body, VC(0.15, 0.22, 0.55, 8), M.steel, 0, 1.75, -0.2);
    rotor = rotorAssembly(root, 2.0, 4.0, 4, M, -0.2);
    tail = new THREE.Group(); tail.position.set(-0.2, 2.15, 7.85); root.add(tail);
    for (let i = 0; i < 2; i++) mk(tail, VB(0.04, 1.75, 0.17), M.dk, 0, 0, 0, i * Math.PI / 2);
  }
  mergeLocal(body);
  return { root, rotor, tail };
}
