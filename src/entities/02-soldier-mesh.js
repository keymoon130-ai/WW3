/* ---------------- soldier mesh ---------------- */
const STYLES = {
  rok: { camo: 'rok', helm: 0x525a3a, vest: 0x5b6147, pants: 'rok' },
  usmc: { camo: 'usmc', helm: 0x857552, vest: 0x8a7a58, pants: 'usmc' },
  enemy: { camo: 'enemy', helm: 0x3e454a, vest: 0x4a5048, pants: 'enemy' },
  enemy2: { camo: 'enemy2', helm: 0x3a3e35, vest: 0x45483e, pants: 'enemy2', fur: true },
  officer: { camo: 'rok', helm: 0x2b3a2b, vest: 0x34392a, pants: 'rok', beret: true },
};
const BOXG = {};
function bg(w, h, d) { const k = w + '_' + h + '_' + d; if (!BOXG[k]) { BOXG[k] = new THREE.BoxGeometry(w, h, d); BOXG[k].userData.keep = true; } return BOXG[k]; }
function part(parent, w, h, d, m, x, y, z) { const me = new THREE.Mesh(bg(w, h, d), m); me.position.set(x, y, z); me.castShadow = true; parent.add(me); return me; }
/* visible wounds: head bandage, leg wrap, sling, crutch under the left arm */
function injure(a, o = {}) {
  const m = a.m, white = mat('bandage', { color: 0xe8e4da, rough: 0.95 }), wood = mat('crutch', { color: 0x6b5a44, rough: 0.8 });
  const bx = (parent, w, h, d, x, y, z, mt = white) => { const b = new THREE.Mesh(boxGeo(w, h, d), mt); b.position.set(x, y, z); b.castShadow = true; parent.add(b); return b; };
  if (o.head !== false) { bx(m.head, 0.215, 0.04, 0.235, 0, 0.175, 0); bx(m.head, 0.06, 0.05, 0.02, 0.05, 0.18, -0.12); }
  if (o.leg !== false) { const th = m.legR; bx(th, 0.18, 0.16, 0.2, 0, -0.3, 0); bx(m.kneeR, 0.165, 0.12, 0.18, 0, -0.08, 0); }
  if (o.arm) bx(m.torso, 0.42, 0.06, 0.06, 0, 0.28, -0.14);
  if (o.crutch) {
    const g = new THREE.Group(); g.position.set(-0.36, 0, -0.05); g.rotation.z = -0.08; m.root.add(g);
    bx(g, 0.04, 1.4, 0.04, 0, 0.7, 0, wood); bx(g, 0.05, 0.05, 0.18, 0, 1.42, 0, wood); bx(g, 0.05, 0.03, 0.12, 0, 0.95, 0, wood); bx(g, 0.05, 0.05, 0.05, 0, 0.02, 0, mat('rubber', { color: 0x222222 }));
    a.crutch = g; a.limp = true; a.speed = Math.min(a.speed, 1.15);
  }
}
const SOLG = {};
const capG = (r, l) => SOLG['c' + r + '_' + l] || (SOLG['c' + r + '_' + l] = Object.assign(new THREE.CapsuleGeometry(r, l, 3, 8), { userData: { keep: true } }));
const sphG = (r, sx, sy, sz) => { const k = `s${r}_${sx}_${sy}_${sz}`; if (!SOLG[k]) { SOLG[k] = new THREE.SphereGeometry(r, 12, 9); SOLG[k].scale(sx, sy, sz); SOLG[k].userData.keep = true; } return SOLG[k]; };
function capPart(parent, r, l, m, x, y, z, rx = 0, rz = 0) { const me = new THREE.Mesh(capG(r, l), m); me.position.set(x, y, z); me.rotation.set(rx, 0, rz); me.castShadow = true; parent.add(me); return me; }
function rot(me, rx, ry, rz) { me.rotation.set(rx, ry, rz); return me; }
/* faction insignia textures, made once */
const INSIG = { plane: new THREE.PlaneGeometry(1, 1), _m: {},
  m(k, draw, w = 128, h = 128) { return this._m[k] || (this._m[k] = new THREE.MeshBasicMaterial({ map: canvasTex(w, h, draw), transparent: true, side: THREE.DoubleSide, depthWrite: false })); },
  starPath(g, cx, cy, R, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); },
  star() { return this.m('star', (g, w, h) => { g.clearRect(0, 0, w, h); this.starPath(g, w / 2, h / 2 + 4, 58, 23); g.fillStyle = '#d42a1e'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#e8c040'; g.stroke(); }); },
  cn() { return this.m('cnflag', (g, w, h) => { g.fillStyle = '#d42a1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2cc30'; this.starPath(g, 30, 34, 20, 8); g.fill(); for (const [x, y] of [[62, 14], [72, 30], [72, 50], [62, 64]]) { this.starPath(g, x, y, 7, 3); g.fill(); } }, 128, 88); },
  ru() { return this.m('ruflag', (g, w, h) => { g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, w, h / 3); g.fillStyle = '#1f4fa8'; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = '#d42a1e'; g.fillRect(0, 2 * h / 3, w, h / 3 + 1); }, 128, 84); },
};
function makeSoldierMesh(styleName, o = {}) {
  const st = STYLES[styleName] || STYLES.rok, civ = !!o.civ, foe = styleName.startsWith('enemy');
  const camo = mat('camo_' + st.camo, { map: st.camo }), pants = civ ? mat('civpants', { color: 0x2e3038 }) : mat('camo_' + st.pants, { map: st.pants });
  const vest = mat('vest' + st.vest, { color: st.vest, rough: 0.85 }), vest2 = mat('vest2' + st.vest, { color: new THREE.Color(st.vest).multiplyScalar(0.78).getHex(), rough: 0.9 });
  const helm = mat('helm' + st.helm, { color: st.helm, rough: 0.75 });
  const skin = mat('skin' + (o.skin || ''), { color: o.skin || 0xc49a7c, rough: 0.7 }), skinD = mat('skinD', { color: 0xa47c60, rough: 0.8 });
  const boot = mat('boot', { color: 0x1d1c1a, rough: 0.8 }), sole = mat('sole', { color: 0x0e0e0e }), gunM = mat('gunM', { color: 0x1a1b1c, rough: 0.5, metal: 0.4 }), gunM2 = mat('gunM2', { color: 0x2c2d2a, rough: 0.7 });
  const glove = mat('glove', { color: 0x2a2a26 }), strap = mat('strap', { color: 0x1f2019, rough: 0.9 }), eyeM = mat('eye', { color: 0x141210, rough: 0.3 }), brow = mat('brow', { color: 0x2a2018 }), lip = mat('lip', { color: 0x8a5a4a });
  const coat = civ ? mat('civ' + o.civ, { color: o.civ, rough: 0.85 }) : camo;
  const root = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 0.95; root.add(hips);
  part(hips, 0.33, 0.17, 0.21, pants, 0, -0.02, 0);
  if (!civ) { part(hips, 0.35, 0.05, 0.23, strap, 0, 0.05, 0); part(hips, 0.07, 0.07, 0.04, gunM2, 0, 0.05, -0.12); part(hips, 0.08, 0.12, 0.09, vest2, 0.19, -0.02, 0.04); }
  const legs = [];
  for (const sx of [-1, 1]) {
    const thigh = new THREE.Group(); thigh.position.set(sx * 0.105, -0.06, 0); hips.add(thigh);
    capPart(thigh, 0.085, 0.3, pants, 0, -0.23, 0);
    if (!civ) { part(thigh, 0.03, 0.12, 0.13, pants, sx * 0.085, -0.25, 0); if (sx > 0) part(thigh, 0.07, 0.15, 0.12, vest2, 0.07, -0.2, 0.02); }
    const knee = new THREE.Group(); knee.position.y = -0.46; thigh.add(knee);
    capPart(knee, 0.072, 0.28, pants, 0, -0.2, 0.005);
    if (!civ) part(knee, 0.12, 0.11, 0.05, vest2, 0, -0.03, -0.075);
    part(knee, 0.14, 0.12, 0.25, boot, 0, -0.38, -0.045); part(knee, 0.15, 0.03, 0.28, sole, 0, -0.445, -0.05); part(knee, 0.13, 0.08, 0.12, boot, 0, -0.3, 0.0);
    legs.push({ thigh, knee });
  }
  const torso = new THREE.Group(); torso.position.y = 0.04; hips.add(torso);
  part(torso, 0.32, 0.26, 0.2, coat, 0, 0.12, 0);
  capPart(torso, 0.13, 0.17, coat, 0, 0.42, 0, 0, Math.PI / 2).scale.set(1, 1.0, 0.95);
  part(torso, 0.38, 0.28, 0.22, coat, 0, 0.38, 0);
  if (!civ) {
    if (!foe || styleName === 'enemy') { // plate carrier
      part(torso, 0.36, 0.31, 0.06, vest, 0, 0.39, -0.125); part(torso, 0.36, 0.32, 0.06, vest, 0, 0.4, 0.125); part(torso, 0.42, 0.13, 0.27, vest2, 0, 0.29, 0);
      for (const sx of [-1, 1]) part(torso, 0.06, 0.05, 0.26, strap, sx * 0.13, 0.555, 0);
      for (const px of [-0.12, 0, 0.12]) { part(torso, 0.095, 0.13, 0.06, vest2, px, 0.3, -0.17); part(torso, 0.1, 0.025, 0.065, vest, px, 0.37, -0.17); }
      part(torso, 0.18, 0.08, 0.05, vest2, 0, 0.47, -0.16); part(torso, 0.07, 0.11, 0.06, vest2, -0.15, 0.48, -0.16);
    } else { // chest rig + greatcoat bulk
      part(torso, 0.4, 0.16, 0.08, vest, 0, 0.3, -0.13); for (const px of [-0.13, -0.045, 0.045, 0.13]) part(torso, 0.075, 0.13, 0.05, vest2, px, 0.31, -0.18);
      for (const sx of [-1, 1]) part(torso, 0.05, 0.05, 0.28, strap, sx * 0.12, 0.5, 0);
      part(torso, 0.44, 0.2, 0.25, coat, 0, 0.1, 0);
    }
    if (!foe) { part(torso, 0.3, 0.34, 0.14, vest2, 0, 0.37, 0.22); part(torso, 0.26, 0.1, 0.12, vest, 0, 0.18, 0.21); const ant = new THREE.Mesh(mbg(0.012, 0.42, 0.012), strap); ant.position.set(-0.11, 0.66, 0.2); torso.add(ant); part(torso, 0.08, 0.14, 0.06, gunM2, -0.11, 0.45, 0.2); }
  }
  if (o.armband) part(torso, 0.1, 0.07, 0.15, mat('armband', { color: 0x9a2a22 }), -0.27, 0.46, 0);
  capPart(torso, 0.05, 0.05, skin, 0, 0.6, 0.005);
  const head = new THREE.Group(); head.position.y = 0.62; torso.add(head);
  const hm0 = new THREE.Mesh(sphG(0.105, 0.92, 1.12, 1.0), skin); hm0.position.set(0, 0.12, 0); hm0.castShadow = true; head.add(hm0); hm0.userData.skin = true;
  part(head, 0.13, 0.07, 0.14, skin, 0, 0.04, -0.02);
  for (const sx of [-1, 1]) { part(head, 0.02, 0.05, 0.035, skinD, sx * 0.098, 0.11, 0.0); part(head, 0.026, 0.016, 0.01, eyeM, sx * 0.038, 0.135, -0.102); part(head, 0.04, 0.012, 0.014, brow, sx * 0.038, 0.158, -0.1); }
  part(head, 0.024, 0.045, 0.03, skinD, 0, 0.11, -0.112); part(head, 0.045, 0.01, 0.01, lip, 0, 0.068, -0.103);
  if (st.beret && !civ) part(head, 0.24, 0.07, 0.25, helm, 0, 0.25, 0);
  else if (st.fur && !civ) { const fm = mat('fur', { color: 0x4a4a42, rough: 1 }); part(head, 0.24, 0.12, 0.25, fm, 0, 0.255, 0); part(head, 0.25, 0.06, 0.05, fm, 0, 0.215, -0.12); for (const sx of [-1, 1]) part(head, 0.04, 0.1, 0.16, fm, sx * 0.115, 0.17, 0.02); part(head, 0.03, 0.03, 0.01, mat('badge', { color: 0xb08a30, metal: 0.6 }), 0, 0.24, -0.128); }
  else if (!civ) {
    const hm = new THREE.Mesh(HELMG, helm); hm.position.set(0, 0.205, 0.015); hm.castShadow = true; head.add(hm);
    part(head, 0.3, 0.025, 0.32, helm, 0, 0.195, 0.015); // brim/cover edge
    part(head, 0.29, 0.03, 0.31, strap, 0, 0.225, 0.015); // band
    if (!foe) { part(head, 0.06, 0.05, 0.03, gunM2, 0, 0.26, -0.15); part(head, 0.12, 0.04, 0.05, mat('goggle', { color: 0x30302a, rough: 0.4 }), 0, 0.29, 0.1); }
    for (const sx of [-1, 1]) part(head, 0.012, 0.12, 0.012, strap, sx * 0.09, 0.09, -0.03);
  } else part(head, 0.21, 0.08, 0.23, mat('hair', { color: 0x1c1a18 }), 0, 0.22, 0.01);
  // insignia: the PLA red star on the helmet; the Russian star on the fur hat and the tricolour on the sleeve
  if (styleName === 'enemy') { const b = new THREE.Mesh(INSIG.plane, INSIG.star()); b.position.set(0, 0.235, -0.168); b.rotation.set(-0.2, Math.PI, 0); b.scale.setScalar(0.07); head.add(b); }
  if (styleName === 'enemy2') { const b = new THREE.Mesh(INSIG.plane, INSIG.star()); b.position.set(0, 0.255, -0.148); b.rotation.y = Math.PI; b.scale.setScalar(0.06); head.add(b); }
  const arms = [];
  for (const sx of [1, -1]) {
    const sh = new THREE.Group(); sh.position.set(sx * 0.24, 0.53, 0); torso.add(sh);
    capPart(sh, 0.062, 0.17, coat, 0, -0.14, 0);
    if (!civ && !foe) part(sh, 0.09, 0.07, 0.11, vest2, 0, -0.04, 0);
    if (styleName === 'enemy2' && sx < 0) { const f = new THREE.Mesh(INSIG.plane, INSIG.ru()); f.position.set(-0.066, -0.09, 0); f.rotation.y = -Math.PI / 2; f.scale.set(0.07, 0.05, 1); sh.add(f); }
    if (styleName === 'enemy' && sx < 0) { const f = new THREE.Mesh(INSIG.plane, INSIG.cn()); f.position.set(-0.066, -0.09, 0); f.rotation.y = -Math.PI / 2; f.scale.set(0.07, 0.05, 1); sh.add(f); }
    const el = new THREE.Group(); el.position.y = -0.28; sh.add(el);
    capPart(el, 0.054, 0.16, coat, 0, -0.13, 0);
    part(el, 0.08, 0.09, 0.095, civ ? skin : glove, 0, -0.3, -0.005); part(el, 0.03, 0.06, 0.05, civ ? skin : glove, sx * -0.03, -0.32, -0.04);
    arms.push({ sh, el, side: sx });
  }
  let gun = null; const muzzle = new THREE.Object3D();
  if (!o.unarmed) {
    gun = new THREE.Group(); gun.position.set(0.06, 0.34, -0.22); torso.add(gun);
    part(gun, 0.055, 0.085, 0.36, gunM, 0, 0, -0.1); part(gun, 0.058, 0.07, 0.26, gunM2, 0, 0, -0.42);
    rot(part(gun, 0.045, 0.15, 0.07, gunM, 0, -0.1, -0.2), 0.25, 0, 0); rot(part(gun, 0.04, 0.1, 0.045, gunM2, 0, -0.07, -0.0), -0.3, 0, 0);
    part(gun, 0.045, 0.075, 0.2, gunM2, 0, -0.02, 0.19); part(gun, 0.05, 0.1, 0.04, gunM2, 0, -0.03, 0.29);
    part(gun, 0.022, 0.022, 0.16, gunM, 0, 0.0, -0.63); part(gun, 0.035, 0.04, 0.09, gunM, 0, 0.065, -0.12); part(gun, 0.018, 0.012, 0.3, gunM, 0, 0.048, -0.24);
    if (o.heavy) { part(gun, 0.1, 0.1, 0.16, gunM, 0, -0.08, -0.22); part(gun, 0.04, 0.04, 0.2, gunM, 0, -0.1, -0.55); for (const sx of [-1, 1]) rot(part(gun, 0.012, 0.16, 0.012, gunM, sx * 0.04, -0.08, -0.5), 0, 0, sx * 0.4); }
    muzzle.position.set(0, 0, -0.72); gun.add(muzzle);
  }
  for (const g of [hips, legs[0].thigh, legs[1].thigh, legs[0].knee, legs[1].knee, torso, head, arms[0].sh, arms[1].sh, arms[0].el, arms[1].el, gun]) if (g) mergeLocal(g);
  const m = { root, hips, legL: legs[0].thigh, legR: legs[1].thigh, kneeL: legs[0].knee, kneeR: legs[1].knee, torso, head, armR: arms[0].sh, armL: arms[1].sh, elR: arms[0].el, elL: arms[1].el, gun, muzzle, civ };
  poseSoldier(m, { moving: false, speed: 0, crouch: 0, aim: 0, walk: 0, pitch: 0 }, 1);
  return m;
}
const mbg = (w, h, d) => new THREE.BoxGeometry(w, h, d);
/* ---- two-bone arm IK (shoulder group -> elbow group), target in torso space ---- */
const _ik = { d: v3(), n: v3(), up: v3(), pole: v3(), q: new THREE.Quaternion(), qi: new THREE.Quaternion(), ax: v3(), down: v3(0, -1, 0) };
function armIK(sh, el, target, side) {
  const L1 = 0.28, L2 = 0.3;
  const d = _ik.d.subVectors(target, sh.position); let dist = d.length(); if (dist < 1e-4) return;
  dist = clamp(dist, 0.12, L1 + L2 - 0.005); d.normalize();
  const a1 = Math.acos(clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1));
  const bend = Math.PI - Math.acos(clamp((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2), -1, 1));
  const pole = _ik.pole.set(side * 0.9, -1, 0.35).normalize();
  const n = _ik.n.crossVectors(d, pole); if (n.lengthSq() < 1e-6) n.set(1, 0, 0); n.normalize();
  const up = _ik.up.copy(d).applyAxisAngle(n, a1);
  sh.quaternion.setFromUnitVectors(_ik.down, up);
  _ik.qi.copy(sh.quaternion).invert(); const ax = _ik.ax.copy(n).applyQuaternion(_ik.qi).normalize();
  el.quaternion.setFromAxisAngle(ax, -bend);
}
const _gt = v3(), _gt2 = v3();
const GRIP_R = v3(0, -0.08, -0.18), GRIP_L = v3(0, -0.04, -0.46);
/* full-body pose. st: { moving, speed, crouch(0..1), aim(0..1), walk(phase), pitch, sprint, down } */
function poseSoldier(m, st, dt) {
  const k = Math.min(1, dt * 12);
  const run = st.moving ? clamp((st.speed - 3.2) / 2, 0, 1) : 0;
  const cr = st.crouch || 0, mv = st.moving ? 1 : 0;
  const ph = st.walk || 0, sn = Math.sin(ph), cs = Math.cos(ph);
  // legs
  const amp = lerp(0.42, 0.75, run) * mv * (1 - cr * 0.35);
  let tL = amp * sn, tR = -amp * sn;
  let kL = -(0.08 + mv * lerp(0.55, 1.15, run) * Math.max(0, cs)), kR = -(0.08 + mv * lerp(0.55, 1.15, run) * Math.max(0, -cs));
  let hy = 0.95 - mv * Math.abs(sn) * 0.03;
  if (cr > 0) {
    // kneel (idle) or crouch-walk
    const kneelTL = 1.45, kneelKL = -1.5, kneelTR = 0.12, kneelKR = -1.7;
    const cwTL = 0.75 + tL * 0.8, cwTR = 0.75 + tR * 0.8, cwKL = -1.15 + Math.min(0, kL + 0.08) * 0.5, cwKR = -1.15 + Math.min(0, kR + 0.08) * 0.5;
    tL = lerp(tL, mv ? cwTL : kneelTL, cr); tR = lerp(tR, mv ? cwTR : kneelTR, cr);
    kL = lerp(kL, mv ? cwKL : kneelKL, cr); kR = lerp(kR, mv ? cwKR : kneelKR, cr);
    hy = lerp(hy, mv ? 0.72 : 0.6, cr);
  }
  m.legL.rotation.x = damp(m.legL.rotation.x, tL, 14, dt); m.legR.rotation.x = damp(m.legR.rotation.x, tR, 14, dt);
  m.kneeL.rotation.x = damp(m.kneeL.rotation.x, kL, 14, dt); m.kneeR.rotation.x = damp(m.kneeR.rotation.x, kR, 14, dt);
  m.hips.position.y = damp(m.hips.position.y, hy, 12, dt);
  // torso lean / aim pitch / flinch
  const lean = -(0.08 * mv + 0.25 * run) - cr * 0.12 * mv;
  const tp = lerp(lean, clamp(st.pitch || 0, -0.6, 0.6) * 0.8 - 0.04, st.aim || 0);
  m.torso.rotation.x = damp(m.torso.rotation.x, tp, 10, dt);
  m.torso.rotation.z = damp(m.torso.rotation.z, (st.flinch || 0) * 0.35, 18, dt);
  m.torso.rotation.y = damp(m.torso.rotation.y, (st.flinch || 0) * 0.3 + (st.aim ? -0.1 : 0), 18, dt);
  // arms
  if (!m.gun) {
    const sw = mv ? sn * lerp(0.4, 0.9, run) : 0;
    m.armR.quaternion.setFromAxisAngle(_ik.ax.set(1, 0, 0), -sw); m.armL.quaternion.setFromAxisAngle(_ik.ax.set(1, 0, 0), sw);
    m.elR.quaternion.setFromAxisAngle(_ik.ax.set(1, 0, 0), 0.3 + run * 0.8); m.elL.quaternion.setFromAxisAngle(_ik.ax.set(1, 0, 0), 0.3 + run * 0.8);
    if (m.custom) m.custom(m, st, dt);
    return;
  }
  // gun pose: aim (at shoulder) / low-ready / sprint (across chest)
  const aim = st.aim || 0, spr = st.sprint ? 1 : 0;
  const g = m.gun;
  const px = lerp(lerp(0.07, 0.06, 1 - aim), -0.02, spr), py = lerp(lerp(0.34, 0.5, aim), 0.36, spr), pz = lerp(lerp(-0.26, -0.12, aim), -0.2, spr);
  g.position.x = damp(g.position.x, px, 12, dt); g.position.y = damp(g.position.y, py, 12, dt); g.position.z = damp(g.position.z, pz + (st.recoil || 0) * 0.08, 20, dt);
  g.rotation.x = damp(g.rotation.x, lerp(lerp(-0.55, 0, aim), -0.25, spr), 12, dt);
  g.rotation.y = damp(g.rotation.y, lerp(lerp(0.12, -0.04, aim), 0.95, spr), 12, dt);
  g.rotation.z = damp(g.rotation.z, lerp(0, 0.4, spr), 12, dt);
  if (st.skipIK) return;
  g.updateMatrix();
  armIK(m.armR, m.elR, _gt.copy(GRIP_R).applyMatrix4(g.matrix), 1);
  armIK(m.armL, m.elL, _gt2.copy(GRIP_L).applyMatrix4(g.matrix), -1);
  if (m.custom) m.custom(m, st, dt);
}
const HELMG = new THREE.SphereGeometry(0.155, 10, 6, 0, TAU, 0, Math.PI * 0.55); HELMG.scale(1, 0.85, 1.08); HELMG.userData.keep = true;
