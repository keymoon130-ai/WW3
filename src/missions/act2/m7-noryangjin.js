/* ========== 「남쪽으로」 the end at 노량진역 ==========
   Off the K21, in through the street door, up the stair, along the concourse over the tracks while its roof comes down behind,
   down onto the low platform at the far end and onto the last car of the 무궁화호. The building (NY.*) is hgNoryangjin's. */

/* the evacuation train: five coaches and a diesel at the front (south), on the westmost line beside the low platform,
   the back of the last coach just past the foot of the platform stair; it runs in over 한강철교 in about 22 s */
function m7NyTrain() {
  const TX = -168.05, ty = HR.deck + 0.35, zLast = 397;
  G.train = []; const zf = [];
  for (let i = 0; i < 6; i++) { const car = makeCoachMesh(23.5); car.position.set(TX, ty, 0); G.world.add(car); G.train.push(car); zf.push(zLast + i * 24.6); }
  { const loco = makeLocoMesh(); loco.position.set(TX, ty, 0); G.world.add(loco); G.train.push(loco); zf.push(zLast + 5 * 24.6 + 22.6); }
  G.train.forEach((c, i) => (c.position.z = zf[i] - 1000));
  G.trainIn = false; let t = 0;
  G.updaters.push((dt) => { if (G.mode !== 'play') return; t += dt; const k = 1 - Math.pow(1 - Math.min(1, t / 22), 2.2); G.train.forEach((c, i) => { c.position.z = zf[i] - 1000 * (1 - k); }); if (t >= 22) { G.trainIn = true; return true; } });
}

/* the run through the station. stage(n) is called as the player reaches each point:
   1 inside the street door — a bomb on the forecourt brings the front down behind him;
   2 on the stair — plaster and dust coming out of the ceiling;
   3 on the concourse — the roof starts falling in, bay after bay, from the street end west at 4 m/s: stay ahead of it;
   4 on the platform — the last bays go; what is left of the concourse waits for the train to leave */
function m7NyRun(S) {
  const R = { st: 0, front: null, t0: 0, rubble: [], live: true };
  // the squad goes first: 한지운 leads, the other two on his heels; they hold at the door and the stair foot for the rookie, never on the concourse
  const lane = { han: 0, lee: -1.4, yoon: 1.4 };
  for (const k of ['han', 'lee', 'yoon']) { const a = S.sq[k]; if (!a) continue; const o = lane[k];
    a.follow = null; a.goal = null; a.hold = false; a.speed = 5.6; a.noShoot = true;
    const near = (x, z, r) => () => Math.hypot(P.pos.x - x, P.pos.z - z) < r;
    a.route = { i: 0, pts: [
      { x: -36, z: 355 + o, run: true }, { x: -50, z: 355 + o, run: true, until: near(-50, 355, 12) },
      { x: -56, z: 345.4 + o * 0.6, run: true, until: near(-56, 345, 9) }, { x: -79, z: 345.4 + o * 0.6, run: true },
      { x: -84, z: 360 + o * 0.4, run: true }, { x: -92, z: 360 + o * 0.4, run: true }, { x: -166, z: 366 + o, run: true },
      { x: -172.6 + o * 0.5, z: 371.5, run: true }, { x: -172.6 + o * 0.5, z: 385.5, run: true }, { x: -170.6, z: 388.2 + (o + 1.4) * 0.9, run: true } ],
      done: () => { a.wantCrouch = false; a.board = true; } }; }
  const lobbyFx = () => { const p = v3(rand(-76, -50), NY.FY - 0.7, rand(NY.z0 + 1, NY.z1 - 1)); for (let i = 0; i < 5; i++) particle({ x: p.x + rand(-0.4, 0.4), y: p.y, z: p.z + rand(-0.4, 0.4), vy: -rand(0.5, 2), life: rand(1.2, 2.2), size: 0.12, size1: 0.08, alpha: 0.9, color: [0.82, 0.8, 0.76], grav: 9.8 }); FX.dust(p, 4, [0.8, 0.78, 0.74], 0.6); };
  // squadmates who reached the door step aboard
  S.every(0.3, () => { if (!R.live) return true; for (const k of ['han', 'lee', 'yoon']) { const a = S.sq[k]; if (a && a.alive && a.board && G.trainIn) { a.remove(); S.sq[k] = null; } } });
  R.stage = (n) => {
    R.st = n;
    if (n === 1) { // the front of the building behind him
      explode(v3(-34, 0.8, 355), { noPlayer: true, size: 4.2, dmg: 0, vdmg: 0, radius: 1 }); G.shake += 0.7; SFX.explosion(v3(-34, 1, 355), 1.3);
      S.later(0.35, () => { m7NyRubble(-45.6, -39.5, 349.5, 360.5, 3.4, R); FX.dust(v3(-44, 1.5, 355), 30, [0.7, 0.68, 0.62], 1.6); addEmitter(v3(-42, 1, 355), 'smoke', 1.4, 3, 20); });
      S.later(0.8, () => S.say('윤하린 중사', '입구 무너졌어! 위로, 위로!', { dur: 2 }));
      const fx = S.every(0.6, () => { if (R.st > 3 || !R.live) return true; if (P.pos.x < -40 && P.pos.x > -82) lobbyFx(); });
    }
    if (n === 2) { S.later(0.5, () => { G.shake += 0.3; SFX.crackle(v3(-66, NY.FY, 352)); }); }
    if (n === 3) { // the roof goes, bay by bay, from the street end
      R.t0 = G.time + 2.5; S.later(0.6, () => S.say('한지운 하사', '지붕 내려앉는다! 뛰어! 멈추지 마!', { dur: 2.2 })); SFX.crackle(v3(-60, NY.FY + 4, 357));
      G.updaters.push(() => { if (!R.live || G.mode !== 'play') return true; if (G.time < R.t0) return; R.front = -58 - 4.0 * (G.time - R.t0);
        for (const r of NY.roof) { if (r.userData.fallen) continue; const x = r.position.x; if (x > R.front + 1.5) m7NyDropRoof(r, R); else if (!r.userData.warned && x > R.front - 7) { r.userData.warned = true; SFX.crackle(r.position); for (let i = 0; i < 8; i++) particle({ x: x + rand(-3, 3), y: NY.RY - 0.2, z: rand(NY.z0, NY.z1), vy: -1, life: 1.6, size: 0.1, size1: 0.07, alpha: 0.9, color: [0.8, 0.78, 0.74], grav: 9.8 }); } }
        if (P.alive && P.pos.y > NY.FY - 1.2 && P.pos.x > R.front + 1.2 && P.pos.z > NY.z0 && P.pos.z < NY.z1) failMission('무너지는 역사 지붕에 깔렸다 — 멈추지 말고 뛰어야 한다');
        if (R.front < NY.xW - 6) return true; });
    }
  };
  R.stop = () => { R.live = false; };
  return R;
}
/* a heap of broken tile and concrete, solid to walk into, its top a little lower than it looks */
function m7NyRubble(x0, x1, z0, z1, h, R, y0 = 0) {
  const m = mat('nyRub', { color: 0x9c958a, rough: 1 }), md = mat('nyRubD', { color: 0x5a554e, rough: 1 }), g = new THREE.Group(); G.world.add(g);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
  for (let i = 0; i < 26; i++) { const s = rand(0.4, 1.6), u = Math.random(), v = Math.random(), hh = h * (1 - Math.max(Math.abs(u - 0.5), Math.abs(v - 0.5)) * 1.4) * rand(0.5, 1);
    const b = new THREE.Mesh(new THREE.BoxGeometry(s * rand(0.8, 2.2), s * 0.5, s * rand(0.8, 1.6)), Math.random() < 0.3 ? md : m); b.position.set(x0 + u * w, y0 + Math.max(0.2, hh), z0 + v * d); b.rotation.set(rand(-0.6, 0.6), rand(0, TAU), rand(-0.6, 0.6)); b.castShadow = b.receiveShadow = true; g.add(b); }
  const c = addCollider(x0 + 0.3, y0, z0 + 0.3, x1 - 0.3, y0 + h * 0.85, z1 - 0.3, {}); if (R) R.rubble.push(c); g.userData.col = c; return g;
}
/* one roof bay comes down onto the concourse floor: it hangs a moment on one side, tears, drops; the walls either side go with it */
function m7NyDropRoof(r, R) {
  r.userData.fallen = true; const x = r.position.x, side = Math.random() < 0.5 ? 1 : -1; let vy = 0, t = 0, landed = false;
  for (const l of r.children) if (l.userData.lamp) l.visible = false; // the power goes with it
  G.updaters.push((dt) => { t += dt; if (t < 0.25) { r.rotation.x += side * dt * 0.25; return; } vy -= 9.8 * dt; r.position.y += vy * dt; r.rotation.x += side * dt * 0.18; r.rotation.z += dt * 0.05;
    if (!landed && r.position.y <= NY.FY + 0.6) { landed = true; r.position.y = NY.FY + 0.6; const p = v3(x, NY.FY + 1, (NY.z0 + NY.z1) / 2);
      FX.dust(p, 40, [0.72, 0.7, 0.65], 2.2); addEmitter(p, 'smoke', 2.2, 3, 14); if (Math.random() < 0.4) addEmitter(p.clone().add(v3(rand(-2, 2), 0, rand(-8, 8))), 'fire', 1.1, 10, 40);
      SFX.explosion(p, 0.7); G.shake += Math.max(0, 0.6 - P.pos.distanceTo(p) / 60);
      R.rubble.push(addCollider(x - 3, NY.FY, NY.z0, x + 3, NY.FY + 1.6, NY.z1, {})); r.userData.restCol = R.rubble[R.rubble.length - 1];
      for (const w of NY.wall) if (!w.userData.fallen && Math.abs(w.position.x - x) < 3.1) m7NyDropWall(w);
      return true; } });
}
function m7NyDropWall(w) {
  w.userData.fallen = true; if (w.userData.col) { const i = G.colliders.indexOf(w.userData.col); if (i >= 0) G.colliders.splice(i, 1); w.userData.col = null; }
  const out = w.position.z < (NY.z0 + NY.z1) / 2 ? -1 : 1; let vy = 0, vz = out * rand(0.5, 1.5);
  G.updaters.push((dt) => { vy -= 9.8 * dt; w.position.y += vy * dt; w.position.z += vz * dt; w.rotation.x += out * dt * 0.9; if (w.position.y < -2) { w.visible = false; return true; } });
}
/* after the train pulls out: the whole concourse over the tracks goes — floor bays, what is left of the roof, the walls — onto the rails */
function m7NyFallAll() {
  const pieces = [...NY.floor, ...NY.roof, ...NY.wall].filter((m) => m.position.x < -111 && m.visible).sort((a, b) => b.position.x - a.position.x);
  pieces.forEach((m, i) => setGameTimeout(() => {
    if (m.userData.col) { const k = G.colliders.indexOf(m.userData.col); if (k >= 0) G.colliders.splice(k, 1); m.userData.col = null; }
    if (m.userData.restCol) { const k = G.colliders.indexOf(m.userData.restCol); if (k >= 0) G.colliders.splice(k, 1); }
    let vy = -rand(0, 1), t = 0; const rx = rand(-0.4, 0.4), rz = rand(-0.25, 0.25), floorY = HR.deck + 0.6 + rand(0, 1.2);
    G.updaters.push((dt) => { t += dt; vy -= 9.8 * dt; m.position.y += vy * dt; m.rotation.x += rx * dt; m.rotation.z += rz * dt;
      if (m.position.y <= floorY) { m.position.y = floorY; if (Math.random() < 0.5) { const p = m.position.clone(); FX.dust(p, 30, [0.7, 0.68, 0.64], 2.4); addEmitter(p, 'smoke', 2.6, 3, 30); } return true; } });
    if (i % 4 === 0) SFX.explosion(m.position, 0.9);
  }, 0.12 * Math.floor(i / 2)));
}
