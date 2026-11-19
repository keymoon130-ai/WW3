/* ---------------- strike jet: long nose, cropped delta, twin fins, glowing nozzles ---------------- */
function makeJetMesh(col = 0x6e747a) {
  const M = vmats(col);
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  mk(body, vg('jetfus', () => { const g = new THREE.CylinderGeometry(0.75, 0.95, 11, 14); g.rotateX(Math.PI / 2); g.scale(1, 0.85, 1); return g; }), M.m, 0, 0, 0.4);
  mk(body, vg('jetnose', () => { const g = new THREE.ConeGeometry(0.75, 4.2, 14); g.rotateX(-Math.PI / 2); g.scale(1, 0.8, 1); return g; }), M.m3, 0, -0.05, -6.7);
  mk(body, vg('jetcan', () => { const g = new THREE.SphereGeometry(0.55, 14, 8, 0, TAU, 0, Math.PI / 2); g.scale(0.85, 0.75, 2.6); return g; }), M.gl, 0, 0.5, -3.9);
  mk(body, vg('jetwing', () => topExtrude([[0.8, -2.2], [6.2, 2.4], [6.2, 3.6], [0.8, 3.8], [-0.8, 3.8], [-6.2, 3.6], [-6.2, 2.4], [-0.8, -2.2]], 0.18)), M.m, 0, -0.15, 0.6);
  mk(body, vg('jetcanard', () => topExtrude([[0.6, -0.6], [2.6, 0.7], [2.6, 1.1], [-2.6, 1.1], [-2.6, 0.7], [-0.6, -0.6]], 0.1)), M.m2, 0, 0.05, 2.0 + 2.2);
  for (const s of [-1, 1]) {
    mk(body, vg('jetfin', () => sideExtrude([[0, 0], [1.9, 0], [3.0, 2.4], [2.2, 2.5]], 0.12)), M.m2, s * 0.7, 0.4, 3.4, 0, 0, -s * 0.22);
    mk(body, VB(0.5, 0.65, 2.4), M.m2, s * 0.92, -0.3, -1.2); // intakes
    mk(body, VB(0.44, 0.56, 0.1), M.dk, s * 0.92, -0.3, -2.42);
    mk(body, VC(0.48, 0.55, 1.2, 12), M.steel, s * 0.55, -0.05, 5.95, Math.PI / 2);
    mk(body, VC(0.18, 0.18, 2.4, 8), M.m3, s * 3.2, -0.45, 0.8, Math.PI / 2); // pylons / bombs
    mk(body, VC(0.22, 0.22, 2.0, 8), M.dk, s * 2.2, -0.62, 0.8, Math.PI / 2);
  }
  const glowM = basicMat('jetglow', 0xffa040);
  for (const s of [-1, 1]) { const n = new THREE.Mesh(VC(0.42, 0.42, 0.05, 12), glowM); n.rotation.x = Math.PI / 2; n.position.set(s * 0.55, -0.05, 6.58); root.add(n); }
  mergeLocal(body);
  return { root };
}
