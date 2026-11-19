/* =========================================================
   ACT 3 「반격」 + EPILOGUE
   ========================================================= */
/* ---------------- landing dressing shared by both beaches ---------------- */
/* obstacles the armour drives straight through: hedgehogs, dragon's teeth, tetrapods, wire */
function crushable(x, z, kind, o = {}) {
  const y = G.groundAt(x, z); const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rand(0, 3); G.world.add(g);
  const M2 = (geo, m, px, py, pz) => { const me = new THREE.Mesh(geo, m); me.position.set(px, py, pz); me.castShadow = true; g.add(me); return me; };
  if (kind === 'hedgehog') { for (let k = 0; k < 3; k++) { const b = M2(boxGeo(0.3, 0.3, 2.4), MT.rust(), 0, 0.8, 0); b.rotation.set(k === 0 ? Math.PI / 4 : 0, k * Math.PI / 3, k === 1 ? Math.PI / 4 : 0.6); } }
  else if (kind === 'tooth') { const m = M2(new THREE.ConeGeometry(0.95, 1.5, 4), MT.concrete(), 0, 0.75, 0); m.rotation.y = Math.PI / 4; }
  else if (kind === 'tetra') { for (const d of [[0, 1, 0], [0.94, -0.33, 0], [-0.47, -0.33, 0.82], [-0.47, -0.33, -0.82]]) { const leg = M2(new THREE.CylinderGeometry(0.22, 0.3, 1.3, 6), MT.concrete(), d[0] * 0.55, 0.6 + d[1] * 0.55, d[2] * 0.55); leg.quaternion.setFromUnitVectors(v3(0, 1, 0), v3(...d)); } }
  else if (kind === 'wire') { g.rotation.y = 0; const len = o.len || 10; for (let px = -len / 2; px <= len / 2; px += 2.5) M2(boxGeo(0.08, 1.1, 0.08), MT.rust(), px, 0.55, 0); for (let px = -len / 2; px < len / 2; px += 0.9) { const c = M2(new THREE.TorusGeometry(0.42, 0.02, 4, 10), MT.rust(), px + 0.45, 0.45, 0); c.rotation.y = Math.PI / 2 + 0.3; } }
  const rx = kind === 'wire' ? (o.len || 10) / 2 : 0.8, rz = kind === 'wire' ? 0.35 : 0.8;
  const col = addCollider(x - rx, y, z - rz, x + rx, y + 1.3, z + rz);
  const it = { g, col, x, z, r: Math.max(rx, 1), kind, alive: true }; (G.crush = G.crush || []).push(it); if (kind !== 'wire') G.covers.push(v3(x, 0, z + 1.4));
  if (!G.crushOn) { G.crushOn = true; let acc = 0; G.updaters.push((dt) => { acc += dt; if (acc < 0.1) return; acc = 0;
    const movers = [...G.vehicles.filter((v) => v.alive && v.team === 'ally' && !v.air && !v.stopped && v.path && v.pi < v.path.length).map((v) => v.pos), ...(G.crushers || []).filter((c) => c.moving).map((c) => c.root.position)];
    for (const it of G.crush) { if (!it.alive) continue; for (const p of movers) { const dx = p.x - it.x, dz = p.z - it.z; if (Math.abs(dz) < 4.5 && Math.abs(dx) < it.r + 2.2) { crushIt(it, p); break; } } } }); }
  return it;
}
function crushIt(it, by) {
  it.alive = false; const i = G.colliders.indexOf(it.col); if (i >= 0) G.colliders.splice(i, 1);
  const p = v3(it.x, G.groundAt(it.x, it.z) + 0.5, it.z); FX.dust(p, 14, [0.62, 0.58, 0.52], 1.2); SFX.metal(p); if (it.kind === 'tooth' || it.kind === 'tetra') SFX.explosion(p, 0.25);
  const dir = v3(it.x - by.x, 0, it.z - by.z).normalize(); const g = it.g; const r0 = g.rotation.clone(); let t = 0;
  G.updaters.push((dt) => { t += dt; const k = Math.min(1, t / 0.6); g.position.x = it.x + dir.x * 2.2 * k; g.position.z = it.z + dir.z * 2.2 * k - 1.5 * k; g.rotation.x = r0.x + 1.4 * k; g.rotation.z = r0.z + 0.8 * k; g.scale.y = 1 - 0.55 * k; return k >= 1; });
}
/* the wet band and the surf, washed-up junk, the dead, columns of smoke along the shore */
/* a body on the sand: limbs splayed, one leg bent, face down or on the back, half sunk in */
function corpse(style, x, z, o = {}) {
  const m = makeSoldierMesh(style); const r = m.root; const back = Math.random() < 0.4; const y = G.groundAt(x, z);
  r.rotation.set(back ? Math.PI / 2 : -Math.PI / 2, o.yaw ?? rand(0, TAU), 0, 'YXZ'); r.position.set(x, y + 0.14, z);
  const E = (part, ex, ey, ez) => { if (part) part.quaternion.setFromEuler(new THREE.Euler(ex, ey, ez)); };
  E(m.armL, rand(-2.6, -0.4), 0, rand(-1.4, -0.3)); E(m.armR, rand(-1.2, 0.8), 0, rand(0.3, 1.5)); E(m.elL, rand(0, 0.9), 0, 0); E(m.elR, rand(0, 0.6), 0, 0);
  E(m.legL, rand(-0.9, -0.2), 0, rand(-0.35, -0.05)); E(m.legR, rand(-0.1, 0.3), 0, rand(0.05, 0.3)); E(m.kneeL, rand(0.4, 1.4), 0, 0); E(m.kneeR, rand(0, 0.4), 0, 0);
  if (m.head) m.head.rotation.set(0, rand(-0.9, 0.9), rand(-0.3, 0.3)); if (m.torso) m.torso.rotation.z = rand(-0.2, 0.2);
  if (m.gun && Math.random() < 0.6) { const gw = m.gun.getWorldPosition(v3()); m.gun.parent.remove(m.gun); m.gun.position.set(x + rand(-1.2, 1.2), y + 0.06, z + rand(-1.2, 1.2)); m.gun.rotation.set(Math.PI / 2, rand(0, 6), 0); G.world.add(m.gun); }
  G.world.add(r); return m;
}
function landingDressing(o) {
  const { xMin, xMax, zWater, zWall, smokeZ } = o;
  const wet = mat('wetsand', { color: 0x6a6252, rough: 0.35, metal: 0.05 });
  for (let x = xMin; x < xMax; x += 20) { const z0 = zWater, z1 = zWater - 16, y0 = G.groundAt(x, z0), y1 = G.groundAt(x, z1); addMesh(boxGeo(20.4, 0.03, 16.2), wet, x + 10, (y0 + y1) / 2 + 0.05, (z0 + z1) / 2, { cast: false, rot: [Math.atan2(y1 - y0, 16), 0, 0] }); }
  const foams = []; for (let i = 0; i < 3; i++) { const m = addMesh(boxGeo(xMax - xMin, 0.02, 1.4 + i), new THREE.MeshBasicMaterial({ color: 0xf2f6f6, transparent: true, opacity: 0.5, depthWrite: false }), (xMin + xMax) / 2, 0.06, zWater + 3 + i * 5, { cast: false }); foams.push(m); }
  G.updaters.push(() => { foams.forEach((m, i) => { const k = (Math.sin(G.time * 0.6 + i * 2.1) + 1) / 2; m.position.z = zWater + 4 + i * 5 - k * 7; m.material.opacity = 0.15 + 0.5 * k; }); });
  const buoyM = mat('buoy', { color: 0xd8642a, rough: 0.6 }), weedM = mat('weed', { color: 0x3a3a22, rough: 1 }), plateM = MT.rust();
  for (let i = 0; i < 60; i++) { const x = rand(xMin, xMax), z = rand(zWall + 6, zWater - 2), y = G.groundAt(x, z); const r = Math.random();
    if (r < 0.3) addMesh(new THREE.CylinderGeometry(0.25, 0.25, 0.7, 10), buoyM, x, y + 0.25, z, { rot: [Math.PI / 2, rand(0, 3), 0] });
    else if (r < 0.65) addMesh(boxGeo(rand(1, 2.4), 0.06, rand(0.5, 1.2)), weedM, x, y + 0.04, z, { rot: [0, rand(0, 3), 0], cast: false });
    else addMesh(boxGeo(rand(0.8, 1.8), 0.05, rand(0.6, 1.4)), plateM, x, y + 0.08, z, { rot: [rand(-0.3, 0.3), rand(0, 3), rand(-0.3, 0.3)] }); }
  for (let i = 0; i < 16; i++) { const x = rand(xMin + 20, xMax - 20), z = rand(zWall + 8, zWater - 4); corpse(o.style || 'rok', x, z); }
  for (let i = 0; i < 8; i++) { const x = xMin + 30 + i * (xMax - xMin - 60) / 7 + rand(-15, 15), z = smokeZ + rand(-30, 20); const p = v3(x, G.groundAt(x, z) + 4, z); addEmitter(p, 'smoke', rand(5, 8), 2.2); addEmitter(p.clone().add(v3(0, -2, 0)), 'fire', 2.4, 16); }
}
/* the column of armour and amphibians as one list the crusher looks at */
function acvWreck(x, z, rot) { const w = makeACV(0x2a2826); w.root.traverse((m) => { if (m.isMesh) m.material = MT.burnt(); }); w.root.position.set(x, G.groundAt(x, z), z); w.root.rotation.set(rand(-0.1, 0.1), rot, rand(-0.15, 0.15)); G.world.add(w.root); addCollider(x - 2, -1, z - 4.5, x + 2, 2.4, z + 4.5); addEmitter(v3(x, G.groundAt(x, z) + 2.5, z), 'fire', 1.5, 18); addEmitter(v3(x, G.groundAt(x, z) + 4, z), 'smoke', 2.2, 2.5); G.covers.push(v3(x, 0, z + 5.5)); }
/* ---------------- Goseong air support: Ospreys and Cobras ---------------- */
function makeOsprey(col = 0x5c6268) {
  const root = new THREE.Group(); const M = mat('osprey', { color: col, rough: 0.6, metal: 0.3 }), G2 = mat('ospglass', { color: 0x203038, rough: 0.1, metal: 0.6 }), R = mat('osprotor', { color: 0x1a1a1a, rough: 0.8 });
  const add = (geo, m, x, y, z, r) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); if (r) me.rotation.set(...r); me.castShadow = true; root.add(me); return me; };
  add(new THREE.BoxGeometry(2.4, 2.5, 13), M, 0, 0, 0);
  add(new THREE.CylinderGeometry(0.4, 1.25, 3.4, 10), M, 0, -0.1, -8, [-Math.PI / 2, 0, 0]);
  add(new THREE.BoxGeometry(2.0, 0.9, 1.6), G2, 0, 0.75, -6.6);
  add(new THREE.BoxGeometry(15.6, 0.35, 2.4), M, 0, 1.45, -0.6);
  add(new THREE.BoxGeometry(5.6, 0.25, 1.6), M, 0, 1.6, 7.2); for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.2, 2.2, 1.6), M, s * 2.8, 2.3, 7.2);
  const rotors = [];
  for (const s of [-1, 1]) { const nac = new THREE.Group(); nac.position.set(s * 7.8, 1.5, -0.6); root.add(nac); const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 4, 10), M); pod.rotation.x = Math.PI / 2; nac.add(pod); nac.rotation.x = 0;
    const hub = new THREE.Group(); hub.position.set(0, 0, -2.2); nac.add(hub); for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 5.8), R); b.position.set(0, 0, 0); b.rotation.set(Math.PI / 2, (k * TAU) / 3, 0); const piv = new THREE.Group(); piv.rotation.z = (k * TAU) / 3; const bb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 5.8, 0.06), R); bb.position.y = 2.9; piv.add(bb); hub.add(piv); }
    rotors.push({ nac, hub }); }
  return { root, rotors };
}
/* a craft flying a straight line, rotor noise on it; cobras salvo rockets at listed ground targets as they pass */
function airPass(kind, from, to, o = {}) {
  const a = v3(...from), b = v3(...to); const L = a.distanceTo(b), sp = o.speed ?? (kind === 'osprey' ? 42 : 48); let t = 0;
  let m, spin;
  if (kind === 'osprey') { m = makeOsprey(); spin = (dt) => { for (const r of m.rotors) { r.nac.rotation.x = -(o.tilt ?? 1.25); r.hub.rotation.z += dt * 22; } }; }
  else { m = makeHeliMesh(0x4a5048, true); spin = (dt) => { m.rotor.rotation.y += dt * 30; m.tail.rotation.x += dt * 40; }; }
  m.root.position.copy(a); m.root.lookAt(b); m.root.rotateY(Math.PI); G.world.add(m.root);
  const snd = makeLoop(kind === 'osprey' ? 'tilt' : 'rotor'); const fired = new Set();
  G.updaters.push((dt) => {
    t += dt; const k = Math.min(1, (t * sp) / L); m.root.position.lerpVectors(a, b, k); m.root.position.y += Math.sin(G.time * 1.1 + a.x) * 0.3; spin(dt);
    if (kind !== 'osprey') m.root.rotation.x = -0.12;
    snd.at(m.root.position, 60, kind === 'osprey' ? 1.2 : 0.9);
    (o.rockets || []).forEach((r, i) => { if (fired.has(i)) return; if (r.pos && !r.alive) return; const [rx, rz] = r.pos ? [r.pos.x, r.pos.z] : r; const d = Math.hypot(m.root.position.x - rx, m.root.position.z - rz); if (d > 150) return; fired.add(i);
      for (let n = 0; n < 4; n++) setGameTimeout(() => { const from = m.root.position.clone().add(v3(n % 2 ? 1.4 : -1.4, -0.8, 0)); const tgt = v3(rx + rand(-5, 5), G.groundAt(rx, rz) + 0.4, rz + rand(-5, 5)); SFX.shot('rocket', from); tracer(from, tgt, [1, 0.7, 0.4], 160);
        setGameTimeout(() => { if (r.pos) tgt.copy(r.pos).setY(r.pos.y + 0.8); explode(tgt, { radius: 7, dmg: 220, vdmg: o.vdmg ?? 260, size: 1.8, noPlayer: true, noAlly: true }); }, Math.max(0.25, from.distanceTo(tgt) / 160)); }, n * 0.16); });
    if (k >= 1 || G.mode !== 'play') { G.world.remove(m.root); snd.stop(); return true; }
  });
  return m;
}
/* the hillside coastal battery: two casemated guns that fire at the boats until the destroyer flattens them */
function buildBattery() {
  const conc = mat('batconc', { map: 'concrete', color: 0x7e7a6c }); const guns = [];
  for (const x of [50, 72]) { const z = -384, y = G.groundAt(x, z);
    addBox(x, y, z, 9, 3.2, 7, conc, { tile: 2 }); addBox(x, y + 3.2, z + 0.6, 10, 0.8, 8.2, conc, { tile: 2 });
    const pivot = new THREE.Group(); pivot.position.set(x, y + 1.9, z + 3.6); G.world.add(pivot);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 7, 10), MT.metal()); bar.rotation.x = Math.PI / 2; bar.position.z = 3.2; bar.castShadow = true; pivot.add(bar); pivot.rotation.x = -0.08;
    guns.push({ pivot, muzzle: () => pivot.localToWorld(v3(0, 0, 6.8)) }); }
  for (let i = 0; i < 6; i++) sandbags(rand(44, 80), rand(-372, -366), rand(3, 5), rand(-0.3, 0.3));
  G.battery = { guns, dead: false };
}
function batteryFire(target) {
  const B = G.battery; if (!B || B.dead) return; const g = pick(B.guns); const mp = g.muzzle();
  for (let i = 0; i < 4; i++) particle({ add: true, x: mp.x, y: mp.y, z: mp.z, vx: rand(-2, 2), vy: rand(0, 2), vz: rand(4, 10), life: 0.25, size: rand(3, 6), color: [1, 0.7, 0.35] });
  for (let i = 0; i < 6; i++) particle({ x: mp.x, y: mp.y, z: mp.z, vx: rand(-1, 1), vy: rand(0.5, 2), vz: rand(2, 6), life: 2.5, size: 2, size1: 6, alpha: 0.35, color: [0.7, 0.7, 0.68] });
  flashLight(mp, 0xffa050, 40, 120, 0.15); SFX.shot('cannon', mp); g.pivot.position.z += 0.0;
  if (target) setGameTimeout(() => { SFX.incoming(target, 1.2); setGameTimeout(() => { FX.splash(target, rand(4, 6)); SFX.explosion(target, 0.8); if (target.distanceTo(P.pos) < 30) G.shake += 0.5; }, 1.2); }, 0.4);
}
function batteryDestroyed() {
  const B = G.battery; if (!B || B.dead) return; B.dead = true;
  B.guns.forEach((g, i) => setGameTimeout(() => { const p = g.pivot.position.clone(); explode(p.clone().add(v3(0, 1, 0)), { noPlayer: true, size: 4, dmg: 0, vdmg: 0 }); SFX.explosion(p); G.shake += 0.6; g.pivot.rotation.x = 0.35; g.pivot.rotation.z = rand(-0.3, 0.3); addEmitter(p.clone().add(v3(0, 2, 0)), 'fire', 2, 20); addEmitter(p.clone().add(v3(0, 5, 0)), 'smoke', 4, 4); }, i * 0.9));
}
/* zig-zag trench line across the dunes: plank revetments, sandbag parapet, dark floor */
function duneTrench(x0, x1, zc) {
  const plank = mat('revet', { color: 0x5a4a36, rough: 1 }), floor = mat('trenchfloor', { color: 0x4a4234, rough: 1 }); const pts = [];
  for (let x = x0; x < x1; x += 8) { const z = zc + ((x / 8) % 2 ? 2.2 : -2.2); pts.push([x, z]); }
  for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1]; const mx = (ax + bx) / 2, mz = (az + bz) / 2, L = Math.hypot(bx - ax, bz - az), r = Math.atan2(bx - ax, bz - az) - Math.PI / 2; const y = G.groundAt(mx, mz);
    addMesh(boxGeo(L, 0.04, 2.2), floor, mx, y + 0.03, mz, { rot: [0, r, 0], cast: false });
    if (i % 3 !== 1) { addBox(mx, y, mz + 1.3, L, 1.05, 0.25, plank, { rotY: r }); sandbags(mx, mz + 1.6, Math.max(2, L / 2.2), r); }
    addMesh(boxGeo(L, 0.9, 0.2), plank, mx, y + 0.45, mz - 1.2, { rot: [0, r, 0] }); G.covers.push(v3(mx, 0, mz)); }
  return pts;
}
/* ---------------- Incheon (world A) ---------------- */
function incheonGround(x, z) {
  if (z > -330) return -0.45 - (z + 330) * 0.03;
  if (z > -360) return lerp(0.2, -0.45, smooth((z + 360) / 30));
  if (z > -404) return lerp(0.9, 0.2, smooth((z + 404) / 44));
  return 3.6;
}
function buildIncheon() {
  G.groundAt = incheonGround;
  buildTerrain(1400, 200, 'sand', 6, 0xbfb6a0, 0, 100);
  addMesh(boxGeo(1400, 0.05, 700, 1), mat('port', { map: 'concrete', color: 0x8a8a86 }), 0, 3.62, -760, { cast: false });
  waterPlane(0, 300, 1600, 1300, 0, 0x34505c, true); G.waterY = 0;
  buildMountains(900, 24, 0x5a6458, 40, 120, false);
  // seawall z -405..-402; four segments the tanks blow open (G.gapWalls), each with a ramp up behind it
  const wm = mat('seawall', { map: 'concrete', color: 0x9a968e });
  G.breachX = [-84, -36, 24, 84]; const nearGap = (x) => G.breachX.some((b) => Math.abs(x - b) < 8);
  for (let x = -294; x < 294; x += 12) { if (G.breachX.includes(x + 6)) continue; addBox(x + 6, 0.8, -403.5, 12, 4, 3, wm, { tile: 2 }); }
  G.gapWalls = G.breachX.map((bx) => addBox(bx, 0.8, -403.5, 12, 4, 3, wm, { tile: 2, dynamic: true })); G.gapWall = G.gapWalls[2];
  for (const bx of G.breachX) for (let i = 0; i < 6; i++) addBox(bx, 0.8, -401 - i * 0.9, 10, 0.47 * (i + 1), 0.9, MT.concrete(), { tile: 1 });
  for (let x = -280; x < 280; x += 12) G.covers.push(v3(x, 0, -400.5));
  // vehicles climb the breach ramps instead of popping up the wall
  G.inY = (x, z) => { const g = G.groundAt(x, z); if (z < -398 && z > -406 && nearGap(x)) return lerp(0.9, 3.6, smooth(clamp((-398 - z) / 7, 0, 1))); return g; };
  // tetrapods / hedgehogs on beach
  addMesh(boxGeo(900, 0.02, 3, 1), new THREE.MeshBasicMaterial({ color: 0xe8eef0, transparent: true, opacity: 0.55, depthWrite: false }), 0, 0.03, -353.5, { cast: false });
  for (let i = 0; i < 80; i++) { const x = rand(-160, 160), z = rand(-396, -352); if (nearGap(x) && z < -380) continue; crushable(x, z, 'tetra'); }
  for (let i = 0; i < 80; i++) { const x = rand(-150, 150), z = rand(-398, -350); if (nearGap(x) && z < -380) continue; crushable(x, z, 'hedgehog'); }
  for (let i = 0; i < 40; i++) { const x = rand(-150, 150), z = rand(-392, -366); if (nearGap(x) && z < -380) continue; crushable(x, z, 'tooth'); }
  for (const z of [-372, -388]) for (let x = -150; x < 150; x += rand(16, 26)) if (!nearGap(x) && Math.random() < 0.75) crushable(x, z, 'wire', { len: rand(8, 12) });
  for (const [x, z, r] of [[-60, -378, 0.4], [124, -380, -0.3], [-118, -384, 0.9], [56, -356, 2.8]]) acvWreck(x, z, r);
  landingDressing({ xMin: -200, xMax: 200, zWater: -345, zWall: -400, smokeZ: -430 });
  // seawall ladders (1950)
  G.ladders = [-110, -60, 4, 112].map((x) => { const y0 = G.groundAt(x, -399.6); for (const s of [-0.35, 0.35]) addMesh(boxGeo(0.08, 5.6, 0.08), MT.rust(), x + s, (y0 + 4.9) / 2, -400.8, { rot: [0.32, 0, 0] }); for (let k = 0; k < 9; k++) addMesh(boxGeo(0.74, 0.05, 0.05), MT.rust(), x, y0 + 0.4 + k * 0.52, -400.1 - k * 0.17); return x; });
  { const w = makeBoat(); w.position.set(-22, G.groundAt(-22, -385) - 0.3, -385.5); w.rotation.set(0.05, 0.35, 0.12); w.traverse((o) => { if (o.isMesh) o.material = MT.burnt(); }); G.world.add(w); addCollider(-24.5, -1, -391, -19.5, 2, -380); addEmitter(v3(-22, 1.5, -385), 'smoke', 0.7, 2); }
  // bunkers on top of wall
  for (const [bx] of [[-12], [52]]) { room(bx, -412, 7, 5, 2.4, [{ side: 's', at: 0, w: 5, y0: 1.2, y1: 1.8 }, { side: 'n', at: 0, w: 1.2 }], { y: 3.6, mat: mat('bunker', { map: 'concrete', color: 0x7a786e }), roofMat: mat('bunker', {}) }); }
  // port: four vehicle lanes run inland from the breaches and two cross roads join them; everything between is container stacks one to three high
  const LANES = G.breachX, XR = [-470, -540];
  const open = (x, z) => LANES.some((l) => Math.abs(x - l) < 8.5) || XR.some((r) => Math.abs(z - r) < 7.5) || (x > -33 && x < 16 && z < -476 && z > -550) || Math.hypot(x + 120, z + 560) < 30 || (Math.abs(x) > 106 && z < -574);
  const cols = [0x8a3b2a, 0x2a4a6a, 0x3a5a3a, 0x9a7a2a, 0x5a5a5a, 0x7a2a2a, 0x2a6a6a];
  G.portSpots = [];
  for (let z = -431; z > -590; z -= 6.7) { const zi = Math.round((-431 - z) / 6.7);
    for (let x = -150; x <= 150; x += 3.0) { const xi = Math.round((x + 150) / 3);
      if (open(x, z)) continue;
      if (xi % 5 === 0 || zi % 4 === 3) { if (Math.random() < 0.3) G.portSpots.push(v3(x, 0, z)); continue; } // alleys between the blocks
      if (Math.random() < 0.16) continue;
      const n = Math.random() < 0.3 ? 1 : Math.random() < 0.6 ? 2 : 3; const col = pick(cols);
      for (let k = 0; k < n; k++) { const c = k ? pick(cols) : col; addBox(x + rand(-0.06, 0.06), 3.6 + k * 2.6, z + rand(-0.15, 0.15), 2.44, 2.6, 6.1, mat('cont' + c, { color: c, map: 'container', rough: 0.7, metal: 0.2 }), { tile: 2.6, collide: false }); }
      addCollider(x - 1.22, 3.6, z - 3.05, x + 1.22, 3.6 + n * 2.6, z + 3.05);
      if (Math.random() < 0.25) G.covers.push(v3(x, 0, z + 3.7));
    } }
  for (const l of LANES) for (let z = -428; z > -588; z -= 11) G.portSpots.push(v3(l + (Math.random() < 0.5 ? -7 : 7), 0, z));
  for (const r of XR) for (let x = -140; x < 140; x += 12) G.portSpots.push(v3(x, 0, r + rand(-3, 3)));
  // jersey barriers along the lane edges, sandbag nests at the corners of the cross roads
  for (const l of LANES) for (const z of l === 24 ? [-446, -480, -507, -566] : [-446, -500, -566]) { jersey(l + (l === 24 ? -6.6 : Math.random() < 0.5 ? -6.6 : 6.6), z, 5, Math.PI / 2); }
  G.portNests = [[-30, -463], [31, -490], [31, -463], [77, -477], [-43, -533], [31, -556], [31, -533], [-77, -547]];
  for (const [x, z] of G.portNests) sandbagRing(x, z, 2.4, 0);
  // gantry cranes straddle the outer lanes; the one by our lane is the one that comes down
  for (const x of [-84, 84]) { const y = 3.6; for (const s of [-1, 1]) { addBox(x + s * 6, y, -520, 1.2, 34, 1.2, mat('crane', { color: 0xb88a2a, metal: 0.4, rough: 0.5 })); addBox(x + s * 6, y, -505, 1.2, 34, 1.2, mat('crane', {})); } addBox(x, y + 34, -512, 14, 2, 60, mat('crane', {}), { collide: false }); }
  { const cm = mat('crane', { color: 0xb88a2a, metal: 0.4, rough: 0.5 }); const cr = new THREE.Group(); cr.position.set(8, 3.6, -512); G.world.add(cr);
    for (const sx of [-6, 6]) for (const sz of [-8, 7]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 34, 1.2), cm); l.position.set(sx, 17, sz); l.castShadow = true; cr.add(l); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 60), cm); beam.position.set(0, 35, 0); cr.add(beam); const cab = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 5), mat('cranecab', { color: 0x8a8a84 })); cab.position.set(0, 32.5, -4); cr.add(cab);
    for (let i = 0; i < 4; i++) { const br = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 16), cm); br.position.set(i < 2 ? -6 : 6, 12 + (i % 2) * 10, 0); br.rotation.x = 0.9 * (i % 2 ? 1 : -1); cr.add(br); }
    G.crane0 = cr; G.crane0Cols = []; for (const sx of [-6, 6]) for (const sz of [-8, 7]) G.crane0Cols.push(addCollider(8 + sx - 0.6, 3.6, -512 + sz - 0.6, 8 + sx + 0.6, 37.6, -512 + sz + 0.6)); }
  G.fuelTanks = [[-120, -548], [-104, -566], [-138, -570]].map(([x, z]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 11, 24), mat('fueltank', { color: 0xd8d4c8, rough: 0.5, metal: 0.3 })); m.position.set(x, 3.6 + 5.5, z); m.castShadow = true; G.world.add(m); const col = addCollider(x - 7, 3.6, z - 7, x + 7, 14.6, z + 7); const top = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.2, 0.4, 24), MT.metal()); top.position.set(x, 14.8, z); G.world.add(top); return { m, top, x, z, col }; });
  { const x = 22, z = -604; addBox(x, 3.6, z, 7, 26, 7, mat('tower', { map: 'concrete', color: 0xb0aca0 }), { tile: 3 }); addBox(x, 29.6, z, 12, 4.5, 12, mat('towerglass', { color: 0x30485a, rough: 0.15, metal: 0.6 })); addBox(x, 34.1, z, 13, 0.6, 13, MT.concreteD()); signBoard(x, 25, z + 3.6, '인천항 관제탑', { w: 6, bg: '#2a4a6a', size: 52 }); G.portTower = v3(x, 34.7, z); }
  for (const x of [-140, 140]) building(x, -600, 60, 40, 18, { hue: 210, lit: 0, broken: 0.3, y: 3.6 });
  // a ruined waterfront town just behind the port, close enough to loom over the beach
  for (let i = 0; i < 16; i++) { const x = rand(-260, 260), z = rand(-660, -620); building(x, z, rand(20, 34), rand(16, 26), rand(18, 42), { hue: pick([30, 40, 200]), lit: 0, broken: 0.6, ruin: Math.random() < 0.5, fire: Math.random() < 0.4 ? 2 : 0, y: 3.6 }); }
  skyline(0, -900, 200, 30, 30, 120, 0x4a4f56, 0.03);
  for (let i = 0; i < 6; i++) addEmitter(v3(rand(-200, 200), 6, rand(-650, -450)), 'smoke', 3, 1.5);
}
/* ---------------- Goseong (world B) ---------------- */
function goseongGround(x, z) {
  if (z > -300) return -1.5 - (z + 300) * 0.06;
  let y = lerp(-1.5, 1.5, clamp((-300 - z) / 40, 0, 1));
  if (z < -330 && z > -380) y += Math.max(0, Math.sin(x * 0.09) * 1.6 + Math.sin(x * 0.03 + z * 0.1) * 1.4);
  if (z < -380) y = 2 + Math.sin(x * 0.02) * 0.5;
  if (Math.abs(x) < 8 && z < -455) y -= 3 * smooth(clamp((8 - Math.abs(x)) / 4, 0, 1));
  if (z < -520) y += (-520 - z) * 0.25;
  { const hd = Math.hypot(x - 61, (z + 386) * 1.25); if (hd < 36) y += 6.5 * smooth(1 - hd / 36); }
  { const lx = Math.max(0, Math.abs(x + 235) - 85), lz = Math.max(0, Math.abs(z + 478) - 22); const ld = Math.hypot(lx, lz); if (ld < 14) y = lerp(y, 0.6, smooth(1 - ld / 14)); }
  return y;
}
function buildGoseong() {
  G.groundAt = goseongGround;
  buildTerrain(1400, 220, 'sand', 6, 0xc8c0a8, 0, -100);
  waterPlane(0, 300, 1600, 1250, -0.3, 0x2c4a58, true); G.waterY = -0.3;
  buildMountains(800, 30, 0x4e5a4a, 120, 260, true);
  for (let i = 0; i < 60; i++) { const x = rand(-300, 300), z = rand(-640, -500); pine(x, z, rand(1, 1.8)); }
  // dunes vegetation & bunker cluster target
  for (const [x, z] of [[55, -372], [66, -378], [60, -386]]) room(x, z, 5, 4, 2, [{ side: 's', at: 0, w: 3, y0: 1, y1: 1.6 }, { side: 'n', at: 0, w: 1 }], { mat: mat('bunker', { map: 'concrete', color: 0x7a786e }), roofMat: mat('bunker', {}) });
  for (let i = 0; i < 12; i++) sandbags(rand(-80, 80), rand(-375, -345), rand(4, 7), rand(-0.5, 0.5));
  // fortified coastal town: burnt-out concrete blocks with machine-gun nests between them
  const blocks = [[-48, -402, 16, 12, 12], [-22, -414, 12, 10, 9], [28, -416, 14, 12, 14], [52, -400, 12, 10, 8], [-62, -428, 18, 12, 16], [74, -428, 14, 14, 11], [-14, -440, 16, 10, 10], [38, -442, 18, 12, 13], [6, -404, 8, 8, 6]];
  for (const [x, z, w, d, h] of blocks) building(x, z, w, d, h, { hue: pick([30, 40, 200]), lit: 0, broken: 0.6, ruin: Math.random() < 0.6, fire: pick([1, 2, 2]) });
  G.nests = [[-30, -398], [16, -398], [62, -414], [-4, -426]];
  for (const [x, z] of G.nests) sandbagRing(x, z, 2.2, 0);
  // obstacle belt from the surf to the dunes; the Marine tanks and amphibians roll straight through it
  const lanes = [0, -60, -35, 30, 55, 85, -90]; const clear = (x, z) => z > -322 && lanes.some((l) => Math.abs(x - l) < 5);
  for (let i = 0; i < 70; i++) { const x = rand(-150, 150), z = rand(-340, -306); if (!clear(x, z)) crushable(x, z, 'hedgehog'); }
  for (let i = 0; i < 50; i++) { const x = rand(-150, 150), z = rand(-338, -318); if (!clear(x, z)) crushable(x, z, 'tetra'); }
  for (let i = 0; i < 26; i++) { const x = rand(-150, 150), z = rand(-338, -326); crushable(x, z, 'tooth'); }
  for (const z of [-334, -342]) for (let x = -140; x < 140; x += rand(15, 24)) if (Math.random() < 0.8) crushable(x, z, 'wire', { len: rand(8, 12) });
  landingDressing({ xMin: -180, xMax: 200, zWater: -316, zWall: -346, smokeZ: -420, style: 'usmc' });
  for (const [x, z, r] of [[-76, -324, 0.4], [112, -322, -0.5], [20, -312, 2.6]]) acvWreck(x, z, r);
  buildBattery();
  G.trench = duneTrench(-100, 36, -366);
  // 화진포 lagoon and the ridge behind the town
  addMesh(boxGeo(196, 0.05, 66, 1), mat('lagoon', { color: 0x3a5a66, rough: 0.12, metal: 0.5 }), -235, 1.5, -478, { cast: false });
  for (let i = 0; i < 40; i++) { const x = rand(-330, -140), z = pick([-444, -512]) + rand(-3, 3); addMesh(boxGeo(0.1, rand(1, 1.8), 0.1), mat('reed', { color: 0x8a7e52 }), x, G.groundAt(x, z) + 0.6, z, { cast: false }); }
  // the fire-support destroyer, off the right flank of the boat lanes, broadside to the beach
  { const d = makeShip(150, 18, 12); d.position.set(200, 0, -150); d.rotation.y = Math.PI / 2; G.world.add(d); G.navalShip = d; G.navalGun = v3(200 - 50, 10, -150); }
  const hs = [];
  for (const [x, z] of hs) house(x, z, rand(8, 10), rand(6, 7), { roofMat: MT.roof(), openings: [{ side: 's', at: 0, w: 1.1 }, { side: 'n', at: 0, w: 1.1 }, { side: 'e', at: 0, w: 1.2, y0: 1, y1: 2 }, { side: 'w', at: 0, w: 1.2, y0: 1, y1: 2 }] });
  // route 7 along x at z=-480 with bridge over creek at x=0
  roadStrip(0, -480, 10, 900, Math.PI / 2, 2.05);
  addBox(0, 1.3, -480, 18, 0.8, 11, MT.concreteD(), { tile: 2 });
  for (const s of [-1, 1]) addBox(0, 2.1, -480 + s * 5.4, 18, 0.9, 0.3, MT.metal(), { bullet: false });
  addMesh(boxGeo(13, 0.05, 140, 1), mat('creek', { color: 0x30464e, rough: 0.15, metal: 0.45 }), 0, -0.45, -500, { cast: false });
  { const conc = mat('brconc', { map: 'concrete', color: 0x8e8a80 }), steel = MT.metal();
    for (const z of [-484.2, -479.9, -475.8]) addMesh(boxGeo(18, 0.9, 0.45), steel, 0, 0.45, z); // girders
    for (const x of [-4.5, 4.5]) { addMesh(boxGeo(1.3, 2.4, 10), conc, x, -0.4, -480); addMesh(boxGeo(1.8, 0.5, 11), conc, x, 0.9, -480); } // piers and caps
    for (const x of [-9.4, 9.4]) addMesh(boxGeo(1.2, 3.6, 13), conc, x, 0.4, -480); // abutments
    for (const sz of [-1, 1]) for (let x = -8.5; x <= 8.5; x += 1.7) addMesh(boxGeo(0.12, 0.9, 0.12), steel, x, 2.05, -480 + sz * 5.4, { cast: false });
    for (const x of [-8.6, 8.6]) { addMesh(boxGeo(0.18, 6, 0.18), steel, x, 4.7, -485.2); addMesh(boxGeo(1.6, 0.12, 0.25), steel, x - 0.7 * Math.sign(x), 7.7, -485.2); }
    const rock = mat('creekrock', { color: 0x5e5a52, rough: 1 }); for (let i = 0; i < 26; i++) { const z = -500 + rand(-60, 60), x = pick([-1, 1]) * rand(5.6, 7.2); addMesh(new THREE.DodecahedronGeometry(rand(0.4, 1.1), 0), rock, x, G.groundAt(x, z) + 0.1, z, { rot: [rand(0, 3), rand(0, 3), 0] }); }
    signBoard(10.5, 2.6, -486.5, '7 · 북천교', { w: 3.2, bg: '#1d4f8a', size: 44 }); }
  for (const x of [-30, 30]) { jersey(x, -470, 6, 0); }
  sandbags(-12, -470, 5, 0); sandbags(12, -470, 5, 0);
}

/* every soldier on the beach runs his own line, obstacle to obstacle, instead of all piling behind one */
async function beachRun(a, endZ = -399) {
  const lane = clamp(a.pos.x + rand(-14, 14), -120, 130); let z = a.pos.z;
  while (a.alive && z > endZ + 6) {
    z = Math.max(endZ, z - rand(9, 15)); const tx = clamp(lane + rand(-5, 5), -140, 140);
    const cov = G.covers.filter((c) => Math.abs(c.z - z) < 6 && Math.abs(c.x - tx) < 8).sort((p, q) => Math.abs(p.x - tx) - Math.abs(q.x - tx))[0];
    a.goTo = cov ? cov.clone() : v3(tx, 0, z); a.o.speed = 4.6; a.wantCrouch = false;
    const t0 = G.time; await new Promise((res) => { const iv = () => { if (!a.alive || !a.goTo || a.pos.distanceTo(a.goTo) < 1.6 || G.time - t0 > 9) res(); else setGameTimeout(iv, 0.2); }; iv(); });
    if (!a.alive) return; a.goTo = null; a.wantCrouch = true; await new Promise((res) => setGameTimeout(res, rand(1.2, 3)));
  }
  if (a.alive) { a.goTo = v3(clamp(a.pos.x, -140, 140), 0, endZ); a.wantCrouch = true; }
}
/* pinned on the beach: every man at the cover line ducks, pops up for a burst, ducks again; nobody goes forward */
function beachPin(zFront, zBack) {
  const u = (dt) => { if (u.done) { for (const a of G.actors) if (a._pk) { a._pk = null; a.noShoot = !!a.o.noShoot; } return true; }
    for (const a of G.actors) { if (!a.alive || a.team !== 'ally' || a.o.passive || a.leading || a.route) continue; if (a.pos.z > zBack || a.pos.z < zFront) continue;
      if (!a._pk) a._pk = { t: rand(0, 2), up: false };
      const k = a._pk; k.t -= dt; if (k.t <= 0) { k.up = !k.up; k.t = k.up ? rand(1.1, 2.2) : rand(1.6, 3.6); }
      if (a.goTo || (a.goal && a.pos.distanceTo(a.goal) > 1.5)) continue; a.wantCrouch = !k.up; a.noShoot = !k.up; } };
  G.updaters.push(u); return u;
}
function coverNear(x, z, r = 4.5) { let best = null, bd = r; for (const c of G.covers) { const d = Math.hypot(c.x - x, c.z - z); if (d < bd) { bd = d; best = c; } } return best ? v3(best.x, 0, best.z) : v3(x, 0, z); }
/* a squad member bounds along his own line beside the leader, cover to cover */
function boundBeside(S, key, leaderKey, legs) {
  const a = S.sq[key]; if (!a) return () => {}; a.follow = null; a.hold = true; let i = -1;
  const u = S.every(0.25, () => { const L = S.sq[leaderKey]; if (!a.alive || !L) return true;
    let n = -1; legs.forEach(([zt], k) => { if (L.pos.z <= zt + 2) n = k; });
    if (n > i) { i = n; const [, x, z] = legs[n]; const c = coverNear(x, z); S.later(rand(0.2, 1.2), () => { a.goal = c; a.home = c.clone(); a.wantCrouch = false; a.noShoot = false; a.o.speed = 4.4; }); }
    if (a.goal && a.pos.distanceTo(a.goal) < 1.4 && !a._pk) a.wantCrouch = true; });
  return u;
}
/* ---------------- Incheon: the landing force goes through four breaches and up the lanes ---------------- */
const IN_SLOTS = [[-9, -417], [9, -417]]; // two ACVs park either side of each breach
const IN_PL = [-446, -472, -505, -538, -570]; // phase lines the armour works up to, lane by lane
function inTank(x, z, path) { return new Vehicle('tank', x, z, { team: 'ally', armed: true, invuln: true, speed: 4.2, path, color: 0x4f5539, reload: 5, range: 170, accurate: true, yieldPeople: false, yFn: G.inY }); }
function inAcvAt(x, z, n) { const a = makeACV(0x5b6150, n); a.root.position.set(x, G.inY(x, z), z); G.world.add(a.root); a.state = 'parked'; return a; }
function inOpenGap(i, fx = true, by = null) {
  const w = G.gapWalls[i]; if (!w || !w.parent) return; const gx = G.breachX[i];
  if (by && by.alive && by.m.turret) { by.m.turret.rotation.y = 0; by.m.barrel.rotation.x = 0.05; const mz = by.m.muzzle.getWorldPosition(v3()); FX.muzzle(mz, v3(0, 0, -1), 5); SFX.shot('cannon', mz); flashLight(mz, 0xffa050, 40, 40, 0.2); }
  G.world.remove(w); const c = w.userData.col; const ci = G.colliders.indexOf(c); if (ci >= 0) G.colliders.splice(ci, 1);
  rubble(gx - 5.6, -400.5, 1); rubble(gx + 5.6, -400.5, 1);
  if (fx) { explode(v3(gx, 2.5, -403.5), { noPlayer: true, size: 2.5, dmg: 0, vdmg: 0 }); for (let k = 0; k < 26; k++) particle({ x: gx + rand(-5, 5), y: rand(1, 4), z: -403 + rand(-1, 1), vx: rand(-6, 6), vy: rand(2, 9), vz: rand(2, 8), life: rand(1, 2), size: rand(0.2, 0.5), alpha: 1, color: [0.55, 0.53, 0.5], grav: 14, drag: 0.4 }); }
}
/* landed ACVs (meshes) drive a fixed list of points; the crusher sees them as moving */
function inAcvDrive(a, pts, delay = 0, sp = 4.2) { setGameTimeout(() => { a.rpts = pts.map(([x, z]) => v3(x, 0, z)); a.ri = 0; a.state = 'drive'; a.moving = true; a.dsp = sp; }, delay); }
function inAcvDriver() {
  G.updaters.push((dt) => { if (G.mode !== 'play') return true;
    for (const a of G.acvs || []) { if (a.state !== 'drive' || a.sunk) continue; const r = a.root, p = r.position; const w = a.rpts[a.ri];
      if (!w) { a.state = 'parked'; a.moving = false; continue; }
      const dx = w.x - p.x, dz = w.z - p.z; if (Math.hypot(dx, dz) < 1.3) { a.ri++; continue; }
      { const fx = -Math.sin(r.rotation.y), fz = -Math.cos(r.rotation.y); let blocked = false;
        const others = [...(G.acvs || []).filter((o) => o !== a && !o.sunk).map((o) => o.root.position), ...G.vehicles.filter((v) => v.alive && v.team === 'ally' && !v.air).map((v) => v.pos)];
        for (const q of others) { const ox = q.x - p.x, oz = q.z - p.z, d = Math.hypot(ox, oz); if (d < 11 && (ox * fx + oz * fz) > 0.5 * d) { blocked = true; break; } }
        if (blocked && (a.waitT = (a.waitT || 0) + dt) < 6) { a.cs = Math.max(0, (a.cs || 0) - 4 * dt); continue; } if (!blocked) a.waitT = 0; }
      const want = Math.atan2(-dx, -dz); r.rotation.y += clamp(angDiff(r.rotation.y, want), -1.1 * dt, 1.1 * dt); const al = Math.max(0, Math.cos(angDiff(r.rotation.y, want)));
      a.cs = Math.min(a.dsp * (0.25 + 0.75 * al), (a.cs || 0) + 1.8 * dt); const sp = a.cs; p.x -= Math.sin(r.rotation.y) * sp * dt; p.z -= Math.cos(r.rotation.y) * sp * dt; p.y = G.inY(p.x, p.z); r.rotation.x = 0; r.rotation.z = 0;
      for (const wh of a.wheels) wh.rotation.x -= sp * dt / 0.6; } });
}
/* the force drawn up behind the wall: from the beach if we played it, otherwise placed there */
function inStageFresh() {
  const st = { token: G.token, tanks: [], slots: [] }; G.acvs = [];
  G.breachX.forEach((gx, i) => {
    st.tanks[i] = [inTank(gx, -426), inTank(gx + 10, -387)];
    st.slots[i] = IN_SLOTS.map(([sx, sz], k) => { const a = inAcvAt(gx + sx, sz, `3-${String(i * 2 + k + 1).padStart(2, '0')}`); G.acvs.push(a); return a; });
  });
  G.inStage = st; return st;
}
/* suppressive fire: with nothing in sight the armour shells where the enemy is likely to be, a little ahead of itself */
function inSuppress(v) {
  if (v._sup && G.time < v._supT && v._sup.alive) return v._sup;
  const fr = aliveEnemies().filter((e) => e.pos.z < v.pos.z - 14 && e.pos.z > v.pos.z - 110 && Math.abs(e.pos.x - v.pos.x) < 40);
  const p = fr.length ? pick(fr).pos.clone().setY(4.6) : v3(v.pos.x + rand(-18, 18), 5, v.pos.z - rand(40, 80));
  v._sup = { alive: true, isVehicle: true, pos: p }; v._supT = G.time + rand(4, 7); return v._sup;
}
/* ========== MISSION 9 「작전명 쌍룡-인천」 ========== */