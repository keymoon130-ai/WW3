function m7Squad(center, n, o = {}) {
  const sp = o.spread ?? 2.6, m = [];
  for (let i = 0; i < n; i++) { const a = rand(0, TAU), r = Math.sqrt(Math.random()) * sp, x = center.x + Math.cos(a) * r, z = center.z + Math.sin(a) * r;
    const e = enemy(x, z, { tag: o.tag || 'sq', hold: !!o.hold, view: 130, acc: 0.5 }); if (!o.hold) { e.state = 'combat'; e.knownPos = (o.dest || P.pos).clone(); } m.push(e); }
  const sq = { m, dest: o.dest || null, free: o.free ?? 0, tag: o.tag || 'sq', hold: !!o.hold, t0: G.time, keepT: G.time + (o.keep || 0) }; (G.m7squads = G.m7squads || []).push(sq); m7SquadDriver(); return sq;
}
function m7SquadDriver() {
  if (G.m7sqOn) return; G.m7sqOn = true; let acc = 0;
  G.updaters.push((dt) => { if (G.mode !== 'play') return; acc += dt; if (acc < 0.8) return; acc = 0; const L = G.m7squads || [];
    for (let k = L.length - 1; k >= 0; k--) { const sq = L[k], al = sq.m.filter((a) => a.alive); if (!al.length && (!sq.rally || sq.landed >= (sq.size || 0))) { L.splice(k, 1); continue; } if (!al.length) continue;
      if (!(G.time < sq.keepT) && al.every((a) => a.pos.distanceTo(P.pos) > 420 && hiddenFromView(a.pos))) { al.forEach((a) => a.remove()); L.splice(k, 1); continue; }
      if (sq.hold || sq.loose) continue;
      const lead = al[0];
      if (sq.rally && !sq.gathered) { if (G.time - sq.t0 > (sq.gatherT || 12) || al.every((a) => a.pos.distanceTo(sq.rally) < 7)) sq.gathered = true;
        al.forEach((a, i) => { a.state = 'combat'; a.knownPos = P.pos.clone(); a.goal = sq.rally.clone().add(v3(Math.cos(i * 2.4) * 2.2, 0, Math.sin(i * 2.4) * 2.2)); a.repath = 3; a.wantCrouch = true; }); continue; }
      const tgt = sq.dest || P.pos, dl = lead.pos.distanceTo(tgt); if (sq.free && dl < sq.free) { sq.loose = true; continue; }
      const dir = v3().subVectors(tgt, lead.pos).setY(0).normalize(), perp = v3(-dir.z, 0, dir.x);
      lead.state = 'combat'; lead.knownPos = P.pos.clone(); lead.goal = lead.pos.clone().addScaledVector(dir, Math.min(dl, 16)); lead.repath = 3;
      al.forEach((a, i) => { if (!i) return; const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1; a.state = 'combat'; a.knownPos = P.pos.clone(); a.goal = lead.goal.clone().addScaledVector(dir, -row * 2.8).addScaledVector(perp, side * row * 2.3); a.repath = 3; a.wantCrouch = false; }); } });
}
/* a formation pass: V of three, echelon of four, or a pair; one straight line at one height; the lead may bomb a point */
function m7Formation(o) {
  const n = o.n || 3, A = o.from, B = o.to, dir = v3().subVectors(B, A).setY(0).normalize(), perp = v3(-dir.z, 0, dir.x), alt = o.alt;
  for (let k = 0; k < n; k++) { let back, side; if (o.kind === 'E') { back = k * 38; side = k * 30; } else { back = Math.ceil(k / 2) * 42; side = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 34; }
    const a = A.clone().addScaledVector(dir, -back).addScaledVector(perp, side), b = B.clone().addScaledVector(dir, -back).addScaledVector(perp, side);
    jetPass([a.x, alt + k * 3, a.z], [b.x, alt + k * 3 + 10, b.z], { speed: o.speed || 225, bombs: k === 0 ? (o.bombs || []) : (o.wingBombs || []).map(([x, z]) => [x + perp.x * side, z + perp.z * side]), noPlayer: true, dmg: 0, vdmg: 0 }); }
}
function m7Sky() {
  if (G.m7sky) return; G.m7sky = true;
  // the overcast of smoke: dense and dark overhead, thinning and lit orange-red from the burning city toward the horizon
  // painted opaque over a base gradient: a texture with soft alpha everywhere shows every texel as a faint grid when it is magnified this much
  const tex = canvasTex(1024, 512, (c, w, h) => { const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, 'rgb(18,13,12)'); bg.addColorStop(0.5, 'rgb(36,21,17)'); bg.addColorStop(0.85, 'rgb(92,40,24)'); bg.addColorStop(1, 'rgb(150,66,34)'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1700; i++) { const v = Math.pow(Math.random(), 1.25) * 0.94, y = v * h, r = rand(22, 80) * (1 - v * 0.45), lit = Math.pow(v, 2.0), R = 30 + lit * 170, Gc = 22 + lit * 62, B = 20 + lit * 22, a = (0.12 + 0.2 * (1 - v)) * rand(0.6, 1.1), x0 = rand(0, w);
      for (const x of [x0, x0 - w, x0 + w]) { if (x < -r || x > w + r) continue; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${R | 0},${Gc | 0},${B | 0},${a})`); g.addColorStop(1, `rgba(${R | 0},${Gc | 0},${B | 0},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); } } undither(c, w, h, 2); });
  tex.wrapS = THREE.RepeatWrapping;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(2600, 48, 20, 0, TAU, 0, Math.PI * 0.52), new THREE.MeshBasicMaterial({ map: tex, depthWrite: false, fog: false, side: THREE.BackSide }));
  dome.renderOrder = -9; G.world.add(dome);
  const gt = canvasTex(8, 256, (c, w, h) => { const g = c.createLinearGradient(0, h, 0, 0); g.addColorStop(0, 'rgba(255,140,50,.75)'); g.addColorStop(0.25, 'rgba(240,90,30,.45)'); g.addColorStop(0.6, 'rgba(180,50,20,.12)'); g.addColorStop(1, 'rgba(120,30,10,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); undither(c, w, h, 2); });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(2350, 2350, 300, 64, 1, true), new THREE.MeshBasicMaterial({ map: gt, transparent: true, depthWrite: false, fog: false, side: THREE.BackSide, blending: THREE.AdditiveBlending }));
  band.renderOrder = -8; G.world.add(band);
  G.updaters.push((dt) => { dome.position.set(camera.position.x, 0, camera.position.z); dome.rotation.y += dt * 0.0025; band.position.set(camera.position.x, 70, camera.position.z); band.material.opacity = 0.9 + 0.1 * Math.sin(G.time * 1.7); });
  // plumes a kilometre and more high over the burning districts, their feet glowing
  const glowT = canvasTex(128, 64, (c, w, h) => { const g = c.createRadialGradient(w / 2, h, 0, w / 2, h, w / 2); g.addColorStop(0, 'rgba(255,170,70,.9)'); g.addColorStop(0.5, 'rgba(240,90,30,.4)'); g.addColorStop(1, 'rgba(200,60,20,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  for (let k = 0; k < 8; k++) { const q = rand(-300, M7.q0 + 200), d = pick([-1, 1]) * rand(950, 1800), p = hgPath(q, d);
    hgSmokeCol(v3(p.x, 0, p.z), { h: rand(1300, 1700), r: rand(120, 175), period: rand(70, 100), drift: [0.12, -0.08], color: new THREE.Color(0x3c2418), op: 0.85, fog: false });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); s.scale.set(520, 200, 1); s.position.set(p.x, 70, p.z); G.world.add(s); }
}
function m7War(S) {
  if (G.m7war) return; const W = G.m7war = { fight: true, recent: [] };
  m7Sky();
  const tall = G.colliders.filter((c) => c.max.y > 18 && (c.max.x - c.min.x) > 10 && (c.max.z - c.min.z) > 10);
  for (let i = 0; i < 150 && tall.length; i++) { const c = pick(tall), p = v3((c.min.x + c.max.x) / 2 + rand(-4, 4), c.max.y, (c.min.z + c.max.z) / 2 + rand(-4, 4)); if (Math.random() < 0.7) addEmitter(p, 'fire', rand(1.1, 2.2), 12); addEmitter(p.clone().add(v3(0, 2, 0)), 'smoke', rand(2.2, 3.6), 2); }
  for (let i = 0; i < 24 && tall.length; i++) { const c = pick(tall); hgSmokeCol(v3((c.min.x + c.max.x) / 2, c.max.y, (c.min.z + c.max.z) / 2), { h: rand(280, 560), r: rand(24, 42), period: rand(30, 46), drift: [0.42, -0.24], color: new THREE.Color(0x24180f), op: 0.85, fog: true }); }
  const far = (r0, r1) => { const a = rand(0, TAU), r = rand(r0, r1); return v3(P.pos.x + Math.sin(a) * r, 0, P.pos.z + Math.cos(a) * r); };
  const blast = (p, size) => { p.y = G.groundAt(p.x, p.z) + 0.5; explode(p, { noPlayer: true, size, dmg: 0, vdmg: 0, radius: 1 }); if (p.distanceTo(P.pos) > 120 || Math.random() < 0.3) addEmitter(p.clone().add(v3(0, 2, 0)), 'smoke', rand(1.8, 3), 1.5, 16); };
  // flight corridors: each its own heading and height band, never reused back to back, so formations never cross each other
  const COR = [0.35, 1.3, 2.25, 3.45, 4.4, 5.5].map((h, i) => ({ h, alt: 150 + i * 30 }));
  const fwd = () => { const v = M7.conv && P.ride ? v3(Math.sin(G.bmps[4].yaw) * -1, 0, Math.cos(G.bmps[4].yaw) * -1) : v3(0, 0, 0); return v; };
  const pickCor = () => { const free = COR.filter((c) => !W.recent.includes(c)); const c = pick(free.length ? free : COR); W.recent.push(c); if (W.recent.length > 3) W.recent.shift(); return c; };
  const flight = () => { const c0 = fwd(), cor = pickCor(), c = P.pos.clone().addScaledVector(c0, rand(150, 380)).add(v3(rand(-250, 250), 0, rand(-250, 250))), L = 1700;
    const A = v3(c.x - Math.sin(cor.h) * L, 0, c.z - Math.cos(cor.h) * L), B = v3(c.x + Math.sin(cor.h) * L, 0, c.z + Math.cos(cor.h) * L), alt = Math.max(cor.alt, hgTopLine(A, B, 60) + 45);
    const bombs = Math.random() < 0.5 && c.distanceTo(P.pos) > 260 ? [[c.x, c.z]] : []; const r = Math.random(); m7Formation({ from: A, to: B, alt, n: r < 0.5 ? 3 : r < 0.8 ? 4 : 2, kind: r < 0.5 ? 'V' : 'E', bombs, wingBombs: bombs.length ? [[c.x, c.z]] : [] }); };
  const paras = [];
  const transport = () => { if (!W.fight || aliveEnemies('para').length > 34) return; const cor = pickCor(), c = P.pos.clone().addScaledVector(fwd(), rand(180, 360)).add(v3(rand(-180, 180), 0, rand(-180, 180)));
    if (G.groundAt(c.x, c.z) < -2 || (c.z > -1010 && c.z < 60 && Math.abs(c.x) < 700)) return; // never over the river
    const L = 1500, sp = 78, A = v3(c.x - Math.sin(cor.h) * L, 0, c.z - Math.cos(cor.h) * L), B = v3(c.x + Math.sin(cor.h) * L, 0, c.z + Math.cos(cor.h) * L), alt = Math.max(150, hgTopLine(A, B, 90) + 70);
    const m = makeTransportMesh(), root = m.root; A.y = alt; B.y = alt; root.position.copy(A); root.lookAt(B); root.rotateY(Math.PI); G.world.add(root); const voice = jetVoice(); let t = 0, dropped = 0, crates = 0; const stick = { m: [], rally: null, t0: 0, tag: 'para', size: randi(12, 16), landed: 0, gatherT: 16 };
    // the escort goes in first: a strike flight down the same line ~10 s ahead of the transport, bombing the drop zone clear
    { const dir = v3().subVectors(B, A).normalize(), tArr = L / sp, jetT = 1700 / 225, lead = Math.max(0.5, tArr - 10 - jetT), side = v3(-dir.z, 0, dir.x);
      setGameTimeout(() => { if (G.mode !== 'play') return; const a = c.clone().addScaledVector(dir, -1700), b = c.clone().addScaledVector(dir, 1700), safe = c.distanceTo(P.pos) > 150;
        const bombs = safe ? [[c.x + dir.x * 20, c.z + dir.z * 20]] : [], wing = safe ? [[c.x - dir.x * 30 + side.x * 25, c.z - dir.z * 30 + side.z * 25], [c.x + dir.x * 50 - side.x * 25, c.z + dir.z * 50 - side.z * 25]] : [];
        m7Formation({ from: a, to: b, alt: alt + 25, n: pick([2, 3, 4]), kind: 'V', bombs, wingBombs: wing }); }, lead); }
    G.updaters.push((dt) => { if (G.mode !== 'play') { G.world.remove(root); voice.stop(); return true; } t += dt; const k = (t * sp) / (L * 2); root.position.lerpVectors(A, B, k); voice.update(root.position, dt);
      // the stick: out of both side doors together, a pair every quarter second (about 20 m between pairs), then two bundles off the ramp
      const along = t * sp - L, t0 = (L - 40) / sp;
      if (dropped < stick.size && t > t0 + Math.floor(dropped / 2) / 4) { const tail = root.localToWorld(m.root.userData.tail.clone().add(v3((dropped % 2 ? 1 : -1) * 1.9, 0.4, -3))); const dv = v3().subVectors(B, A).normalize(), sd = dropped % 2 ? 1 : -1; paras.push({ g: m7Para(tail.x, tail.y, tail.z), v: dv.clone().multiplyScalar(sp * rand(0.76, 0.84)).add(v3(-dv.z, 0, dv.x).multiplyScalar(sd * rand(11, 14))), t: 0, stick }); dropped++; } // out of each side door and away from the fuselage, so a pair's canopies open well clear of each other
      else if (dropped >= stick.size && crates < 2 && t > t0 + stick.size / 8 + 0.6 + crates * 0.7) { const tail = root.localToWorld(m.root.userData.tail.clone()); paras.push({ g: m7CrateChute(tail.x, tail.y, tail.z), v: v3().subVectors(B, A).normalize().multiplyScalar(sp * 0.7), t: 0, stick, crate: true }); crates++; }
      if (k >= 1) { G.world.remove(root); voice.stop(); return true; } }); };
  let tJet = 4, tAA = 0.5, tBoom = 1.5, tShell = 3, tTr = 6;
  G.updaters.push((dt) => {
    if (G.mode !== 'play') return; if (W.off) return true;
    if ((tJet -= dt) <= 0) { tJet = rand(16, 24); flight(); } // most jets now fly as the transports' strike escort; a few free sweeps between
    if ((tTr -= dt) <= 0) { tTr = rand(13, 18); transport(); }
    if ((tAA -= dt) <= 0) { tAA = rand(0.5, 1.3); const g = far(300, 900), top = g.clone().add(v3(rand(-200, 200), rand(380, 700), rand(-200, 200))); g.y = G.groundAt(g.x, g.z) + 2; for (let i = 0; i < 4; i++) setGameTimeout(() => tracer(g.clone(), top.clone().add(v3(rand(-20, 20), rand(-20, 20), rand(-20, 20))), [1, 0.55, 0.25], 520), i * 0.09); }
    if ((tBoom -= dt) <= 0) { tBoom = rand(1.2, 3.2); blast(far(220, 900), rand(3, 5)); }
    if (W.fight && (tShell -= dt) <= 0) { tShell = rand(2, 4.5); const p = far(26, 75); SFX.whistle(p); setGameTimeout(() => { blast(p, rand(2.5, 3.6)); if (p.distanceTo(P.pos) < 45) G.shake += 0.25; }, 1.1); }
    // paratroopers: out of the ramp at the transport's speed, a second of fall, the canopy opens, a drift down; on the ground they shed it and form up
    for (let i = paras.length - 1; i >= 0; i--) { const q = paras[i], g = q.g; q.t += dt; q.v.multiplyScalar(Math.exp(-dt * 1.8)); const wind = v3(1.6, 0, 0.4);
      const vy = q.t < 1.3 ? -9.8 * q.t : q.crate ? -7.2 : -5.6; g.position.x += (q.v.x + wind.x) * dt; g.position.z += (q.v.z + wind.z) * dt; g.position.y += vy * dt;
      const can = g.userData.can; can.scale.setScalar(Math.min(1, Math.max(0.05, (q.t - 1.1) * 1.4)) * (can.userData.big ? 1.35 : 1)); can.scale.y *= 0.55; g.rotation.z = Math.sin(q.t * 0.9) * 0.12; g.rotation.x = Math.sin(q.t * 0.7) * 0.08;
      const x = g.position.x, z = g.position.z; let gy = G.groundAt(x, z); const roof = G.colliders.find((c) => x > c.min.x && x < c.max.x && z > c.min.z && z < c.max.z && c.max.y > 3); if (roof) gy = roof.max.y;
      if (g.position.y > gy + 0.2) continue;
      paras.splice(i, 1); g.position.y = gy; g.rotation.set(0, g.rotation.y, 0);
      if (q.crate) { can.position.set(rand(2.5, 4.5), 0.25, rand(-1, 1)); can.scale.set(1.3, 0.08, 0.9); can.rotation.set(0, rand(0, TAU), 0); for (const l of g.userData.lines) l.visible = false;
        if (!roof) { g.userData.body.visible = false; smashProp('crate', x, z, g.rotation.y); } FX.dust(v3(x, gy + 0.3, z), 6, [0.5, 0.47, 0.42], 0.5); (W.canopies = W.canopies || []).push(g); continue; }
      q.stick.landed++;
      // the canopy collapses beside him and stays there
      can.position.set(rand(2, 4), 0.25, rand(-1, 1)); can.scale.set(1, 0.08, 0.7); can.rotation.set(0, rand(0, TAU), 0); for (const l of g.userData.lines) l.visible = false;
      if (!roof && aliveEnemies('para').length < 30) { g.userData.body.visible = false; const e = enemy(x, z, { tag: 'para', view: 130, acc: 0.5 }); e.knownPos = P.pos.clone();
        if (!q.stick.rally) { q.stick.rally = v3(x, 0, z); q.stick.t0 = G.time; (G.m7squads = G.m7squads || []).push(q.stick); m7SquadDriver(); } q.stick.m.push(e); }
      (W.canopies = W.canopies || []).push(g); }
    if (W.canopies) for (let i = W.canopies.length - 1; i >= 0; i--) { const g = W.canopies[i]; if (g.position.distanceTo(P.pos) > 700 && hiddenFromView(g.position)) { G.world.remove(g); W.canopies.splice(i, 1); } }
  });
}
const PARA_CAN = new THREE.SphereGeometry(3.6, 14, 5, 0, TAU, 0, Math.PI / 2.3);
/* a supply bundle under a cargo chute: the same box that lands (see smashProp 'crate'), a bigger pale canopy on four risers */
function m7CrateChute(x, y, z) {
  const g = new THREE.Group(), cm = mat('cargoC', { color: 0xb8b49c, rough: 0.9, side: THREE.DoubleSide }), lm = mat('paraL', { color: 0x2a2a26, rough: 1 });
  const can = new THREE.Mesh(PARA_CAN, cm); can.position.y = 7.4; can.scale.set(0.05, 0.03, 0.05); g.add(can); const lines = [];
  for (const [a, b] of [[2.8, 2.8], [-2.8, 2.8], [2.8, -2.8], [-2.8, -2.8]]) { const L = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 3), lm), A = v3(a * 1.1, 7.2, b * 1.1), B = v3(0, 1.1, 0); L.position.copy(A).add(B).multiplyScalar(0.5); L.scale.y = A.distanceTo(B); L.quaternion.setFromUnitVectors(v3(0, 1, 0), A.clone().sub(B).normalize()); g.add(L); lines.push(L); }
  const box = new THREE.Group(); const add = (geo, m, px, py, pz) => { const me = new THREE.Mesh(geo, m); me.position.set(px, py, pz); me.castShadow = true; box.add(me); };
  add(new THREE.BoxGeometry(1.3, 0.12, 1.3), MT.wood(), 0, 0.06, 0); add(new THREE.BoxGeometry(1.2, 0.95, 1.2), mat('ply', { color: 0x8a7a58, rough: 0.85 }), 0, 0.6, 0);
  for (const sx of [-0.32, 0.32]) add(new THREE.BoxGeometry(0.06, 0.97, 1.22), mat('strap', { color: 0x3b3f2e, rough: 0.9 }), sx, 0.6, 0);
  g.add(box); g.userData = { can, lines, body: box }; g.position.set(x, y, z); g.rotation.y = rand(0, TAU); G.world.add(g); g.userData.can.userData.big = true; return g;
}
function m7Para(x, y, z) {
  const g = new THREE.Group(), cm = mat('paraC', { color: 0x6c6e58, rough: 0.9, side: THREE.DoubleSide }), lm = mat('paraL', { color: 0x2a2a26, rough: 1 });
  const can = new THREE.Mesh(PARA_CAN, cm); can.position.y = 6.2; can.scale.set(0.05, 0.03, 0.05); g.add(can); const lines = [];
  for (const [a, b] of [[2.5, 2.5], [-2.5, 2.5], [2.5, -2.5], [-2.5, -2.5]]) { const L = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 3), lm), A = v3(a * 0.9, 6.0, b * 0.9), B = v3(0, 1.7, 0); L.position.copy(A).add(B).multiplyScalar(0.5); L.scale.y = A.distanceTo(B); L.quaternion.setFromUnitVectors(v3(0, 1, 0), A.clone().sub(B).normalize()); g.add(L); lines.push(L); }
  const body = makeSoldierMesh(foeStyle()); poseSoldier(body, { moving: false, speed: 0, crouch: 0, aim: 0, walk: 0, pitch: 0 }, 1); g.add(body.root);
  g.userData = { can, lines, body: body.root }; g.position.set(x, y, z); g.rotation.y = rand(0, TAU); G.world.add(g); return g;
}
/* leaving 광화문: the line north breaks — a barrage walks onto the barricade we just left, squads pour down the avenue, a pair of jets
   rakes the column, a building beside the road takes a bomb; the people left behind scatter into the side streets */
function m7Departure(S, mine) {
  const { L } = M7;
  for (const a of G.actors) if (a.alive && a.team === 'civ') { const q = hgQ(a.pos, M7.q0 - 100), s = a.pos.x - hgPath(q, 0).x > 0 ? 1 : -1, t = hgPath(q + rand(40, 140), s * 21); a.goTo = v3(t.x, 0, t.z); a.o.then = null; a.waitT = 0; a.o.vanish = 'hidden'; a.o.speed = rand(6, 7.2); }
  for (let i = 0; i < 10; i++) S.later(0.4 + i * 0.35, () => { const q = L(rand(-18, 18), rand(-60, 0)), p = v3(q.x, 0.5, q.z); SFX.whistle(p); S.later(0.9, () => { explode(v3(p.x, 0.5, p.z), { noPlayer: true, size: 3.4, dmg: 0, vdmg: 0, radius: 1 }); addEmitter(v3(p.x, 1, p.z), 'fire', 1.0, 12, 16); if (Math.random() < 0.4) addEmitter(v3(p.x, 2, p.z), 'smoke', 1.8, 1.5, 14); G.shake += 0.2; }); });
  for (const [x, z, d] of [[-10, -130, 1], [12, -150, 3.5]]) S.later(d, () => { const c = L(x, z), dst = L(0, 40); m7Squad(v3(c.x, 0, c.z), 7, { dest: v3(dst.x, 0, dst.z), free: 30, tag: 'dep' }); });
  S.later(6, () => { hgStrafe(S, mine.pos.clone(), { n: 2 }); S.later(0.6, () => S.say('리선우 병장', '서한준! 엎드리라우!', { dur: 1.8 })); });
  for (const [x, z, d] of [[-34, 40, 2.5], [34, 90, 4.5], [-34, 150, 7]]) S.later(d, () => { const p = L(x, z); for (let k = 0; k < 3; k++) S.later(k * 0.25, () => { const q = v3(p.x + rand(-4, 4), rand(8, 26), p.z + rand(-6, 6)); explode(q, { noPlayer: true, size: 4.5, dmg: 0, vdmg: 0, radius: 1 }); addEmitter(q, 'fire', 2, 18, 60); addEmitter(q.clone().add(v3(0, 4, 0)), 'smoke', 3.5, 2, 90); }); G.shake += 0.5; });
  if (G.m7war) G.m7war.recent = []; 
}
/* the squad rides on our K21's deck: kneeling, rifles up, one watching each side and one the rear */
function m7Riders(mine) {
  if (mine.riders) return; G.ridersName = '한지운 하사'; const sc = 1 / (mine.m.root.scale.x || 1);
  mine.riders = [['lee', '리선우 병장', -0.85, 0.55, Math.PI / 2], ['yoon', '윤하린 중사', 0.85, 0.85, -Math.PI / 2], ['han', '한지운 하사', 0.7, 3.0, Math.PI]].map(([key, name, x, z, ry]) => {
    const m = makeSoldierMesh(G.allyStyle || 'rok'); for (let i = 0; i < 12; i++) poseSoldier(m, { moving: false, speed: 0, crouch: 1, aim: 0.7, walk: 0, pitch: 0 }, 0.2);
    m.root.scale.setScalar(sc); m.root.position.set(x, 1.55, z); m.root.rotation.y = ry; mine.m.root.add(m.root); return [key, name, m]; });
}
function m7Dismount(mine) { if (!mine.riders) m7Riders(mine); const out = mine.riders.map(([key, name, m]) => { const p = m.root.getWorldPosition(v3()); mine.m.root.remove(m.root); return [key, name, p]; }); mine.riders = null; G.ridersName = null; return out; }
/* 서울역: a V of three comes in low from the north along the station, releases retarded bombs over the KTX hall, and breaks hard west,
   climbing; the bombs go in and the south half of the station comes down */
function m7StationStrike(S) {
  const V = 210, sA = 1500, sT = -40, Rt = 430, d0 = -110, alt = Math.max(58, hgTopLine(ssW(d0, 0, sA), ssW(d0, 0, -300), 34) + 20);
  const jets = [[0, 0], [-34, 42], [34, 42]].map(([dd, back], k) => { const j = makeJetMesh(); G.world.add(j.root); return { j, dd, back, voice: jetVoice(), bombs: 0, k }; });
  let t = 0, hit = false; const bombs = [];
  const at = (tt, dd, back) => { const s0 = sA + back - V * tt; if (s0 > sT) return [s0, d0 + dd, alt]; const th = (sT - s0) / Rt; return [sT - Rt * Math.sin(th), d0 + dd - Rt * (1 - Math.cos(th)), alt + (sT - s0) * 0.22]; };
  G.updaters.push((dt) => { if (G.mode !== 'play') { for (const o of jets) { G.world.remove(o.j.root); o.voice.stop(); } return true; } t += dt;
    for (const o of jets) { const [s, d, y] = at(t, o.dd, o.back), [s2, d2, y2] = at(t + 0.05, o.dd, o.back), P0 = ssW(d, y, s), P1 = ssW(d2, y2, s2); o.j.root.position.copy(P0); o.j.root.lookAt(P1); o.j.root.rotateY(Math.PI);
      const turning = s < sT ? Math.min(1, (sT - s) / 120) : 0; o.j.root.rotateZ(-1.15 * turning); o.voice.update(P0, dt);
      if (o.bombs < 2 && s < 175 - o.bombs * 18 && s > sT) { o.bombs++; bombs.push({ p: P0.clone().add(v3(0, -1.5, 0)), v: v3().subVectors(P1, P0).multiplyScalar(1 / 0.05 * 0.95), t: 0 }); SFX.metal(P0); } }
    for (let i = bombs.length - 1; i >= 0; i--) { const b = bombs[i]; b.t += dt; b.v.x *= Math.exp(-1.6 * dt); b.v.z *= Math.exp(-1.6 * dt); b.v.y -= 9.8 * dt; b.p.addScaledVector(b.v, dt);
      if (!b.m) { b.m = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.2, 8), mat('bombM', { color: 0x4a4e44, rough: 0.6 })); G.world.add(b.m); } b.m.position.copy(b.p); b.m.quaternion.setFromUnitVectors(v3(0, 1, 0), b.v.clone().normalize());
      const gy = Math.max(G.groundAt(b.p.x, b.p.z), (G.colliders.find((c) => b.p.x > c.min.x && b.p.x < c.max.x && b.p.z > c.min.z && b.p.z < c.max.z) || { max: { y: 0 } }).max.y);
      if (b.p.y <= gy + 0.5) { G.world.remove(b.m); bombs.splice(i, 1); explode(b.p.clone(), { noPlayer: true, size: 7, dmg: 0, vdmg: 0, radius: 1 }); addEmitter(b.p.clone().add(v3(0, 3, 0)), 'smoke', 4, 2, 40); G.shake += 0.6;
        if (!hit) { hit = true; hgStationFall(false); S.later(2.6, () => S.say('한지운 하사', '이 개새끼들… 어디까지 부수려는 거야?', { dur: 3 })); } } }
    if (t > 16) { for (const o of jets) { G.world.remove(o.j.root); o.voice.stop(); } return true; } });
}
/* the engineers on 한강대교: mining the northbound deck and wiring it off while we cross on the southbound one, then closing the
   southbound deck behind the last vehicle — the reason nothing follows us south */
function m7Engineers(S, mine) {
  const mineG = new THREE.CylinderGeometry(0.17, 0.17, 0.09, 12), mineM = mat('atmine', { color: 0x4a5236, rough: 0.7 }), crateM = MT.wood ? MT.wood() : mat('crate', { color: 0x6a5a3c });
  const wireG = new THREE.TorusGeometry(0.42, 0.018, 4, 14), wireM = mat('wire', { color: 0x6a6a68, rough: 0.5, metal: 0.6 });
  const site = (z, x0, x1, n0) => { const mines = []; for (let r = 0; r < 2; r++) for (let x = x0; x <= x1; x += 1.3) mines.push([x + (r % 2) * 0.65, 0.05, z + r * 2.4]);
    const shown = []; const im = new THREE.InstancedMesh(mineG, mineM, mines.length); const d = new THREE.Object3D(); mines.forEach((p, i) => { d.position.set(p[0], p[1], p[2]); d.scale.setScalar(i < n0 ? 1 : 0); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }); im.castShadow = true; G.world.add(im);
    let k = n0; S.every(0.7, () => { if (k >= mines.length) return true; if (P.pos.distanceTo(v3(mines[k][0], 0, mines[k][2])) > 300) return; d.position.set(mines[k][0], 0.05, mines[k][2]); d.scale.setScalar(1); d.updateMatrix(); im.setMatrixAt(k, d.matrix); im.instanceMatrix.needsUpdate = true; k++; });
    const wire = []; for (let x = x0 - 0.5; x <= x1 + 0.5; x += 0.45) wire.push([x, 0.45, z - 5, 0, 0, Math.PI / 2]); hgInst(wireG, wireM, wire, { cast: false });
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.45, 0.6), crateM); b.position.set(x1 + 1.2 + (i % 2) * 0.95, 0.23 + Math.floor(i / 2) * 0.46, z + 3); b.castShadow = true; G.world.add(b); }
    const men = []; for (let i = 0; i < 3; i++) { const a = ally(rand(x0, x1), z + rand(0.5, 2.5), { hold: true, passive: true, noShoot: true, hp: 300 }); a.wantCrouch = true; a.yaw = rand(-1, 1); men.push(a); }
    return men; };
  // the northbound deck (x > 0), from the north end south: mines, wire, crates, three men at each
  const crews = [[-880, 14], [-640, 10], [-400, 6], [-170, 4]].map(([z, n0]) => site(z, 2.5, 15, n0));
  // illumination flares: the engineers light the deck for themselves and for the column while it crosses in the dusk
  { const men = crews.flat(); let next = 0, k = 0;
    S.every(0.5, () => { if (G.mode !== 'play' || mine.pos.z > 40) return true; if (mine.pos.z < -1300 || G.time < next) return;
      const live = men.filter((a) => a.alive); if (!live.length) return true;
      const near = live.filter((a) => Math.abs(a.pos.z - mine.pos.z - 60) < 260); const a = (near.length ? near : live)[k++ % (near.length || live.length)];
      if (m7IllumFlare(a)) next = G.time + rand(11, 15); else next = G.time + 2; }); }
  { const t = new Vehicle('truck', 12.5, -860, { team: 'ally', armed: false, invuln: true, speed: 0, color: 0x4d5340 }); t.yaw = Math.PI; t.m.root.rotation.y = t.yaw; t.syncCol(); }
  // the southbound deck: a team waits at the south end and closes it behind the last of the column
  const wait = []; for (let i = 0; i < 4; i++) { const a = ally(-21, 58 + i * 2.2, { hold: true, passive: true, noShoot: true, hp: 300 }); a.yaw = -Math.PI / 2; wait.push(a); }
  S.until(() => (M7.conv || []).every((v) => !v.alive || v.pos.z > 60)).then(() => { wait.forEach((a, i) => { a.hold = false; a.goal = v3(-15 + i * 3.6, 0, 50 + (i % 2) * 2); a.wantCrouch = true; a.state = 'idle'; }); S.later(2.5, () => site(52, -16, -2, 0)); });
}
/* a hand-held parachute illumination rocket: fired up from the deck, it bursts ~140 m up, the candle hangs under its chute
   drifting down at ~2.5 m/s and swinging, burning white for about half a minute and lighting the bridge below */
function m7IllumFlare(a) {
  const L = holdLight(); if (!L) return false;
  const p0 = v3(a.pos.x, a.pos.y + 1.6, a.pos.z), top = v3(p0.x + rand(-8, 8), rand(130, 150), p0.z + rand(10, 30)), p = p0.clone();
  a.yaw = Math.atan2(-(top.x - p0.x), -(top.z - p0.z)); SFX.flareLaunch(p0); FX.sparks(p0, 8);
  const g = glow(p0.x, p0.y, p0.z, 0xffe2b0, 1.2); let t = 0, lit = false, burn = rand(30, 36), sway = rand(0, TAU), drift = v3(rand(0.6, 1.2), 0, rand(-0.5, 0.5));
  L.color.set(0xfff2dc); L.decay = 0; L.distance = 520; L.intensity = 0;
  G.updaters.push((dt) => {
    if (G.mode !== 'play' && G.mode !== 'cut') { G.world.remove(g); releaseLight(L); return true; }
    t += dt;
    if (!lit) { // the motor: 2.2 s to the top, sparks and a thin smoke line behind it
      const k = Math.min(1, t / 2.2), e = 1 - Math.pow(1 - k, 1.6); p.lerpVectors(p0, top, e); g.position.copy(p);
      particle({ x: p.x, y: p.y, z: p.z, vx: rand(-1, 1), vy: rand(-3, -1), vz: rand(-1, 1), life: rand(0.3, 0.6), size: 0.35, size1: 0.1, alpha: 0.9, color: [1, 0.75, 0.4], add: true, grav: 4 });
      if (Math.random() < 0.6) particle({ x: p.x, y: p.y, z: p.z, vy: 0.2, life: 3, size: 0.6, size1: 2.2, alpha: 0.22, color: [0.75, 0.72, 0.68] });
      if (k >= 1) { lit = true; t = 0; SFX.flarePop(p); g.scale.setScalar(10); for (let i = 0; i < 14; i++) particle({ x: p.x, y: p.y, z: p.z, vx: rand(-6, 6), vy: rand(-4, 4), vz: rand(-6, 6), life: rand(0.4, 0.9), size: 0.5, size1: 0.1, alpha: 1, color: [1, 0.95, 0.8], add: true, grav: 6 }); }
      return;
    }
    // under the chute: sinking, drifting downwind, swinging; the candle flickers, smokes, drips sparks
    const f = t < 0.8 ? t / 0.8 : t > burn - 3 ? Math.max(0, (burn - t) / 3) : 1;
    p.y -= 2.5 * dt; p.x += drift.x * dt; p.z += drift.z * dt;
    const sx = Math.sin(t * 1.3 + sway) * 1.6, sz = Math.cos(t * 0.9 + sway) * 1.1; g.position.set(p.x + sx, p.y, p.z + sz);
    const fl = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.3) + rand(-0.05, 0.05);
    g.scale.setScalar((15 + 3 * fl) * f + 0.01); g.material.opacity = f;
    L.position.copy(g.position); L.intensity = 2.2 * fl * f;
    if (Math.random() < 0.7) particle({ x: g.position.x, y: g.position.y + 0.4, z: g.position.z, vx: drift.x * 0.5, vy: 0.6, vz: drift.z * 0.5, life: 6, size: 1.2, size1: 5, alpha: 0.16 * f, color: [0.82, 0.8, 0.77] });
    if (Math.random() < 0.15) particle({ x: g.position.x, y: g.position.y, z: g.position.z, vx: rand(-0.5, 0.5), vy: -1, vz: rand(-0.5, 0.5), life: 1.4, size: 0.25, size1: 0.05, alpha: 1, color: [1, 0.85, 0.55], add: true, grav: 9.8 });
    if (t >= burn || p.y < 15) { G.world.remove(g); releaseLight(L); return true; }
  });
  return true;
}
/* 시청역 under attack: three street exits (two on the 서울광장 kerb, one by 대한문), sandbagged by a few of ours; four enemy squads
   come across the plaza and out of 덕수궁 at them as the column goes by */
function m7CityHallStation(S) {
  const V4 = RT.V[4], at = (s, d) => rtAt(V4 + s, d);
  const exits = [[110, 25.5, 1], [190, 25.5, 1], [150, -25.5, -1]].map(([s, d, side]) => { const p = at(s, d); m7SubwayExit(p.x, p.z, p.yaw, side); return { p: v3(p.x, 0, p.z), side, yaw: p.yaw }; });
  // the defenders: crouched behind sandbags at the top of the stairs
  for (const [k, n] of [[0, 4], [2, 3]]) { const e = exits[k]; for (let i = 0; i < n; i++) { const a = at(k === 0 ? 98 + i * 2.6 : 138.5 + i * 2.6, e.side * 28.5); smashProp('bags', a.x, a.z, e.yaw);
      const b = at(k === 0 ? 98 + i * 2.6 : 138.5 + i * 2.6, e.side * 27.2); const s = ally(b.x, b.z, { hold: true, hp: 160 }); s.wantCrouch = true; } }
  // the attackers: two squads over the plaza lawn, one along the 시청 front, one out of the palace gate
  const sq = [[[130, 95], 0], [[175, 110], 1], [[205, 60], 1], [[150, -62], 2]];
  for (const [[s, d], k] of sq) { const c = at(s, d); m7Squad(v3(c.x, 0, c.z), randi(8, 9), { dest: exits[k].p.clone(), free: 12, tag: 'sch', spread: 3, keep: 90 }); }
  // smoke over the plaza, fire in a 시청 window, tracer both ways
  for (let i = 0; i < 3; i++) { const p = at(rand(120, 190), rand(40, 90)); addEmitter(v3(p.x, 0.5, p.z), 'smoke', 1.6, 2, 60); }
  S.later(3, () => S.say('한지운 하사', '서한준! 시청역 입구, 적 분대가 밀고 들어간다! 쏴!', { dur: 2.6 }));
}
/* a 시청역 street exit: granite parapet round the stairwell, a glass canopy on steel posts, the round line-number signs on a pole */
function m7SubwayExit(x, z, yaw, side) {
  const g = new THREE.Group(); g.position.set(x, G.groundAt(x, z), z); g.rotation.y = yaw; G.world.add(g);
  const add = (geo, m, px, py, pz) => { const me = new THREE.Mesh(geo, m); me.position.set(px, py, pz); me.castShadow = me.receiveShadow = true; g.add(me); return me; };
  const gran = mat('exitGran', { color: 0x8e8a84, rough: 0.8 }), steel = mat('exitSteel', { color: 0x4c5258, rough: 0.5, metal: 0.6 }), glass = mat('exitGlass', { color: 0x7a909a, rough: 0.1, metal: 0.3, transparent: true, opacity: 0.45 });
  add(new THREE.BoxGeometry(0.3, 1.0, 7), gran, -1.75, 0.5, 0); add(new THREE.BoxGeometry(0.3, 1.0, 7), gran, 1.75, 0.5, 0); add(new THREE.BoxGeometry(3.8, 1.0, 0.3), gran, 0, 0.5, -3.5); // stairwell parapet, open at +z
  add(new THREE.BoxGeometry(3.2, 0.12, 6.4), mat('exitDark', { color: 0x1a1c1e, rough: 1 }), 0, 0.06, 0.2); // the stairs dropping into the dark
  for (const [px, pz] of [[-1.75, -3.3], [1.75, -3.3], [-1.75, 3.3], [1.75, 3.3]]) add(new THREE.BoxGeometry(0.12, 2.9, 0.12), steel, px, 1.45, pz);
  add(new THREE.BoxGeometry(4.0, 0.08, 7.4), glass, 0, 2.95, 0); add(new THREE.BoxGeometry(4.0, 0.14, 0.14), steel, 0, 2.9, -3.6); add(new THREE.BoxGeometry(4.0, 0.14, 0.14), steel, 0, 2.9, 3.6);
  const pole = add(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 8), steel, 2.3, 1.6, 3.4);
  for (const [col, y] of [[0x0052a4, 2.95], [0x00a84d, 2.45]]) { const d = add(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 18), mat('line' + col, { color: col, rough: 0.5 }), 2.3, y, 3.4); d.rotation.x = Math.PI / 2; }
  const c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw)), hx = 2.0 * c + 3.6 * s, hz = 2.0 * s + 3.6 * c; addCollider(x - hx, g.position.y, z - hz, x + hx, g.position.y + 1.0, z + hz);
}
