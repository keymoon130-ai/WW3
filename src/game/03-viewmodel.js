/* ---------------- viewmodel ---------------- */
const VM = { root: new THREE.Group(), g: null, id: null, muzzle: null, mag: null, sy: 0.09, sz: -0.05, sx: 0 };
vmScene.add(VM.root);
function limb(parent, a, b, t, m) {
  const d = v3().subVectors(b, a); const L = d.length(); const me = new THREE.Mesh(boxGeo(t, t, L), m);
  me.position.copy(a).add(b).multiplyScalar(0.5); me.lookAt(b.clone().add(parent.position)); me.castShadow = false;
  me.quaternion.setFromUnitVectors(v3(0, 0, 1), d.normalize()); parent.add(me); return me;
}
function buildViewmodel() {
  if (VM.g) VM.root.remove(VM.g);
  const id = curId(); VM.id = id; const w = WD[id]; if (!w) return;
  const g = new THREE.Group(); VM.g = g; VM.root.add(g);
  const gm = mat('vmgun', { color: 0x3b3e44, rough: 0.5, metal: 0.25 }), gm2 = mat('vmgun2', { color: 0x4a4c44, rough: 0.75, metal: 0.1 });
  const style = G.allyStyle === 'usmc' ? 'usmc' : 'rok';
  const sleeve = mat('vmsleeve' + style, { map: style }), glove = mat('vmglove', { color: style === 'usmc' ? 0x6b5c40 : 0x2a2b26, rough: 0.9 });
  const add = (w_, h, d, m, x, y, z, rx = 0) => { const me = new THREE.Mesh(boxGeo(w_, h, d), m); me.position.set(x, y, z); me.rotation.x = rx; g.add(me); return me; };
  VM.muzzle = new THREE.Object3D(); g.add(VM.muzzle); VM.mag = null; VM.extra = null; VM.sx = 0; VM.bolt = null; VM.larm = null; VM.lhand = null; VM.dot = null;
  let rh = v3(0, -0.07, 0.07), lh = v3(0, -0.04, -0.24);
  if (w.vm === 'rifle') {
    add(0.07, 0.1, 0.44, gm, 0, 0, 0); add(0.065, 0.075, 0.26, gm2, 0, -0.005, -0.33);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, w.sup ? 0.12 : 0.22, 8), gm); bar.rotation.x = Math.PI / 2; bar.position.set(0, 0.01, w.sup ? -0.52 : -0.56); g.add(bar);
    if (w.sup) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.24, 10), gm); s.rotation.x = Math.PI / 2; s.position.set(0, 0.01, -0.68); g.add(s); }
    VM.mag = add(0.05, 0.18, 0.085, gm, 0, -0.12, -0.04, 0.18);
    add(0.055, 0.1, 0.26, gm2, 0, -0.025, 0.33); add(0.045, 0.11, 0.05, gm, 0, -0.09, 0.1, -0.3);
    add(0.02, 0.012, 0.36, gm, 0, 0.056, -0.06);
    // red dot
    add(0.03, 0.016, 0.07, gm, 0, 0.064, -0.05);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.0035, 6, 18), gm); ring.position.set(0, 0.09, -0.06); g.add(ring);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.016, 16), new THREE.MeshBasicMaterial({ color: 0x88aacc, transparent: true, opacity: 0.1, depthWrite: false })); lens.position.set(0, 0.09, -0.058); g.add(lens);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.0016, 10), basicMat('reddot', 0xff2a1a)); dot.position.set(0, 0.09, -0.057); dot.scale.setScalar(0.25 + 1.25 * (SET.rdot ?? 0.3)); g.add(dot); VM.dot = dot;
    VM.sy = 0.09; VM.sz = -0.06; VM.muzzle.position.set(0, 0.01, w.sup ? -0.8 : -0.68);
  } else if (w.vm === 'sniper') {
    const wood = mat('vmsnip', { color: 0x3a3f33, rough: 0.7 });
    add(0.07, 0.09, 0.4, gm, 0, 0, 0); add(0.06, 0.08, 0.34, wood, 0, -0.01, -0.36); add(0.06, 0.11, 0.3, wood, 0, -0.03, 0.32); add(0.05, 0.13, 0.05, wood, 0, -0.1, 0.1, -0.3);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.5, 8), gm); bar.rotation.x = Math.PI / 2; bar.position.set(0, 0.01, -0.74); g.add(bar);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.3, 12), gm); scope.rotation.x = Math.PI / 2; scope.position.set(0, 0.085, -0.05); g.add(scope);
    for (const z of [-0.2, 0.1]) { const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.026, 0.06, 12), gm); b2.rotation.x = Math.PI / 2; b2.position.set(0, 0.085, z); g.add(b2); }
    add(0.02, 0.03, 0.02, gm, 0, 0.055, -0.12); add(0.02, 0.03, 0.02, gm, 0, 0.055, 0.02);
    VM.mag = add(0.045, 0.07, 0.07, gm, 0, -0.07, -0.02);
    VM.bolt = add(0.012, 0.012, 0.07, gm, 0.05, 0.02, 0.08); const knob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), gm); knob.position.set(0.035, 0, 0.0); VM.bolt.add(knob);
    VM.sy = 0.085; VM.sz = 0.12; VM.muzzle.position.set(0, 0.01, -1.0); lh = v3(0, -0.04, -0.3);
  } else if (w.vm === 'sam') {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.4, 12), mat('samc', { color: 0x4f563d, rough: 0.8 })); tube.rotation.x = Math.PI / 2; tube.position.set(0, 0, -0.2); g.add(tube);
    for (const z of [-0.88, 0.5]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.06, 12), gm); c.rotation.x = Math.PI / 2; c.position.set(0, 0, z); g.add(c); }
    add(0.16, 0.12, 0.14, gm2, 0, -0.1, -0.05); add(0.05, 0.12, 0.05, gm, 0, -0.17, 0.08); add(0.12, 0.1, 0.03, gm2, -0.12, 0.08, -0.35); add(0.012, 0.06, 0.012, gm, -0.12, 0.13, -0.2);
    VM.mag = null; VM.sx = -0.12; VM.sy = 0.09; VM.sz = 0.0; VM.muzzle.position.set(0, 0, -0.95); rh = v3(0, -0.18, 0.08); lh = v3(0, -0.07, -0.28);
  } else if (w.vm === 'pistol') {
    add(0.04, 0.045, 0.2, gm, 0, 0.02, -0.04); VM.mag = add(0.035, 0.12, 0.05, gm2, 0, -0.06, 0.03, 0.25); add(0.006, 0.012, 0.006, gm, 0, 0.048, -0.13); add(0.016, 0.01, 0.008, gm, 0, 0.048, 0.04);
    VM.sy = 0.05; VM.sz = 0.0; VM.muzzle.position.set(0, 0.02, -0.16); rh = v3(0, -0.04, 0.05); lh = v3(-0.03, -0.05, 0.05);
  } else if (w.vm === 'rpg' || w.vm === 'atgm') {
    const big = w.vm === 'atgm';
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(big ? 0.075 : 0.05, big ? 0.075 : 0.05, big ? 1.2 : 1.0, 12), mat(big ? 'atgmc' : 'rpgc', { color: big ? 0x4c5338 : 0x4a4e3a, rough: 0.8 })); tube.rotation.x = Math.PI / 2; tube.position.set(0, 0, -0.1); g.add(tube);
    if (!big) { VM.mag = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.28, 10), mat('warhead', { color: 0x4b5a3a })); VM.mag.rotation.x = -Math.PI / 2; VM.mag.position.set(0, 0, -0.74); g.add(VM.mag); const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.14, 10), mat('warhead', { color: 0x4b5a3a })); cyl.rotation.x = Math.PI / 2; cyl.position.set(0, 0, -0.55); VM.mag.add(cyl); cyl.position.set(0, -0.14, 0); cyl.rotation.x = 0; }
    add(0.05, 0.12, 0.05, gm, 0, -0.09, 0.05); add(0.05, 0.12, 0.05, gm, 0, -0.09, -0.25);
    if (big) { add(0.12, 0.12, 0.2, gm2, -0.13, 0.06, -0.05); VM.sx = -0.13; VM.sy = 0.06; VM.sz = 0.06; }
    else { add(0.012, 0.07, 0.012, gm, -0.065, 0.06, -0.2); add(0.02, 0.05, 0.02, gm, -0.065, 0.05, 0.05); VM.sx = -0.065; VM.sy = 0.085; VM.sz = 0.05; }
    VM.muzzle.position.set(0, 0, -0.75); rh = v3(0, -0.13, 0.05); lh = v3(0, -0.13, -0.25);
  } else if (w.vm === 'binoc') {
    for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.14, 10), gm2); c.rotation.x = Math.PI / 2; c.position.set(s * 0.04, 0, -0.05); g.add(c); }
    add(0.04, 0.03, 0.05, gm, 0, 0, -0.04); VM.sy = 0; VM.sz = 0.04; rh = v3(0.05, -0.04, 0.0); lh = v3(-0.05, -0.04, 0.0);
    if (w.special === 'naval') add(0.05, 0.05, 0.12, mat('desigc', { color: 0x6b6250 }), 0, 0.05, -0.04);
  } else if (w.vm === 'pintle') {
    add(0.1, 0.1, 0.5, gm, 0, -0.07, -0.3); const br = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.9, 10), gm); br.rotation.x = Math.PI / 2; br.position.set(0, -0.03, -0.95); g.add(br);
    const jk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 10), gm2); jk.rotation.x = Math.PI / 2; jk.position.set(0, -0.03, -0.75); g.add(jk);
    if (id === 'k21mg') { const sm = mat('k21shield', { color: 0x56603f, rough: 0.8 }); for (const sx of [-1, 1]) add(0.03, 0.22, 0.5, sm, sx * 0.42, -0.12, -0.75); } add(0.1, 0.12, 0.2, gm2, 0.1, -0.12, -0.1);
    for (const sx of [-1, 1]) add(0.03, 0.12, 0.03, gm, sx * 0.09, -0.12, 0.08);
    add(0.06, 0.04, 0.03, gm, 0, 0.03, -0.3); add(0.012, 0.04, 0.012, gm, 0, 0.05, -1.32);
    VM.sy = 0.05; VM.sz = -0.3; VM.muzzle.position.set(0, -0.03, -1.42); for (const c of g.children) { c.position.y -= 0.1; c.position.z -= 0.08; } rh = v3(0.09, -0.26, 0.04); lh = v3(-0.09, -0.26, 0.04);
  } else if (w.vm === 'aa') {
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.6, 8), gm); b.rotation.x = Math.PI / 2; b.position.set(s * 0.18, -0.12, -0.9); g.add(b); }
    add(0.6, 0.35, 0.5, gm2, 0, -0.32, -0.15); add(0.9, 0.5, 0.03, gm2, 0, -0.1, -0.45);
    const rs = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.006, 6, 24), gm); rs.position.set(0, 0.17, -0.5); g.add(rs); add(0.006, 0.18, 0.006, gm, 0, 0.17, -0.5); add(0.18, 0.006, 0.006, gm, 0, 0.17, -0.5);
    VM.sy = 0.17; VM.sz = -0.5; VM.muzzle.position.set(0, -0.12, -1.7); rh = v3(0.2, -0.3, 0.1); lh = v3(-0.2, -0.3, 0.1);
  }
  // arms
  if (w.vm !== 'aa' && w.vm !== 'none') {
    const rs = v3(0.2, -0.32, 0.55), ls = v3(-0.26, -0.36, 0.3);
    limb(g, rh, rs, 0.075, sleeve); VM.larm = limb(g, lh, ls, 0.075, sleeve); VM.larmL = lh.distanceTo(ls);
    const h1 = new THREE.Mesh(boxGeo(0.06, 0.08, 0.1), glove); h1.position.copy(rh); g.add(h1);
    const h2 = new THREE.Mesh(boxGeo(0.06, 0.08, 0.1), glove); h2.position.copy(lh); g.add(h2);
    VM.lhand = h2; VM.lh0 = lh.clone(); VM.ls = ls.clone(); VM.magHome = VM.mag ? VM.mag.position.clone() : null; VM.magRot = VM.mag ? VM.mag.rotation.x : 0;
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
}
