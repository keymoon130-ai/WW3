/* ---------- the helicopter ride: same cabin as 「북쪽으로」, flying the real road ---------- */
function hgAir(S, z0, gun = 'km19') {
  const H = new Vehicle('heli', -30, z0 + 50, { team: 'ally', armed: false, invuln: true, speed: 0, bob: false }); H.m.root.scale.setScalar(1.5);
  heliCabin(H); H.pos.y = 20; H.q = -(z0 + 50); H.d = -8; H.m.root.position.copy(H.pos);
  G.heliT = { z: z0, follow: true, alt: 20, x: 0 }; let clrT = 0, clr = 20, weave = 0, vy = 0;
  let vd = 0, vq = 0, roll = 0; H.yaw = 0;
  G.extMuzzle = () => H.gunPod ? H.gunPod.localToWorld(v3(0, 0, -1.3)) : H.pos.clone();
  G.updaters.push((dt) => { if (!H.alive || G.mode !== 'play') return true; const T = G.heliT;
    // along the road (q), swinging gently across it (d), never more than 8 m off the middle, so the rotor stays over the carriageway
    weave += dt; const td = T.x + (T.land ? 0 : 8 * Math.sin(weave * TAU / 46));
    clrT -= dt; if (clrT <= 0) { clrT = 0.3; clr = 0; for (const d of [0, 40, 80, 120, 160, 200]) { const p = hgPath(H.q + d, td); clr = Math.max(clr, hgTop(p.x, p.z, 10) + 9 - d * 0.1); } }
    const alt = T.land ? T.alt : Math.max(T.alt, clr);
    vq = lerp(vq, clamp((-T.z - H.q) * 0.5, -17, 17), Math.min(1, dt)); vd = lerp(vd, clamp((td - H.d) * 0.5, -4, 4), Math.min(1, dt));
    vy = lerp(vy, clamp((alt - H.pos.y) * 0.35, -1.6, 2.4), Math.min(1, dt * 0.7));
    H.q += vq * dt; H.d += vd * dt; const p = hgPath(H.q, H.d); H.pos.x = p.x; H.pos.z = p.z; H.pos.y += vy * dt; H.vel.set(0, 0, 0);
    H.yaw += angDiff(H.yaw, p.yaw + (T.yaw ?? 0)) * Math.min(1, dt * 0.8);
    H.m.root.position.copy(H.pos); roll = lerp(roll, (T.roll || 0) - vd * 0.02, Math.min(1, dt * 2.2)); H.m.root.rotation.set(Math.max(-0.08, vq * 0.004), H.yaw, roll);
    if (P.ride && P.ride.obj === H.m.root) P.yawLim = [H.yaw, 1.25]; });
  P.ride = { obj: H.m.root, off: [0.45, -1.3, -2.2] }; // seated: eye ~1.1 (local) over the cabin floor, level with the pilot beside us P.yaw = 0; P.pitch = -0.3; P.noFire = false;
  for (const w of ['rifle', 'sniper', 'pistol']) S.take(w); S.give(gun);
  G.hitMul = 0.35; S.every(0.5, () => { if (P.alive && P.hp < 100 && G.time - P.lastHit > 2) P.hp = Math.min(100, P.hp + 6); });
  // the column below: two K2s and two K808s on the northbound deck
  const colV = [];
  const add = (x, z, k2) => { const v = k2 ? new Vehicle('tank', x, z, { team: 'ally', k2: true, armed: true, invuln: true, speed: 11, reload: 5, range: 140, accurate: true })
      : S.allyBMP(x, z, 0, { k808: true, real: true, invuln: true, speed: 11, sam: false, rpg: false });
    v.o.yieldPeople = false; v.o.yFn = () => 0; v.lane = x; v.pathQ = []; v.path = [];
    for (let q = -z + 15; q < HQ0 + RT.total - 70; q += 12) { const p = hgPath(q, x); v.path.push(v3(p.x, 0, p.z)); v.pathQ.push(q); }
    v.pi = 0; v.q = -z; v.rank = colV.length; colV.push(v); return v; };
  rtInit(); add(-6.5, z0, true); add(-13, z0 + 18, false); add(-6.5, z0 + 36, true); add(-13, z0 + 54, false);
  G.colStop = z0 - 60; G.colV = colV; G.m11H = H;
  S.every(0.25, () => { for (const v of colV) if (v.alive) { v.q = hgQ(v.pos, v.q); v.stopped = -v.q < G.colStop + v.rank * 18; }
    const al = colV.filter((v) => v.alive); G.colFront = al.length ? Math.min(...al.map((v) => -v.q)) : G.colStop; if (G.heliT.follow) G.heliT.z = G.colFront + 55; });
}
/* drive on to the next fight (the column rolls without stopping), then fight it out there */
async function hgSeg(S, stopZ, tag, label, cap, travel) {
  G.colStop = stopZ; S.obj(travel); const t0 = G.time;
  // on the way there the column keeps rolling: small groups pop up at the roadside ~250 m ahead every couple of hundred metres
  let next = G.colFront - 60, n = 0; const tok = G.token;
  const spawner = () => { if (G.token !== tok || G.colStop !== stopZ) return true; if (G.colFront > next) return; const q = -G.colFront + rand(230, 290); if (-q < stopZ + 420) return true;
    next -= rand(130, 190); n++; const side = pick([-1, 1]);
    for (let i = 0, nn = Math.round(randi(5, 8) * (G.menMul || 1)); i < nn; i++) { const p = hgPath(q + rand(-25, 25), (Math.random() < 0.7 ? side : -side) * rand(14, 32)); enemy(p.x, p.z, { tag: 'roll', view: 170, kind: Math.random() < 0.35 ? 'heavy' : 'rifle', crouch: Math.random() < 0.5, hold: true }); }
    if (n % 3 === 0) { const p = hgPath(q + 30, side * 9), r = hgPath(q + 10, side * 9); new Vehicle('bmp', p.x, p.z, { team: 'enemy', path: [[r.x, r.z]], speed: 3, armed: true, range: 160, scale: 1.05 }); }
    if (n % 2 === 1) S.radio(pick(['윤하린 중사', '한지운 하사', '박도현 중위']), pick(['우측 건물 앞, 적 보병!', '좌측 상가에 적!', '전방 길가, 적 매복!', '골목에서 튀어나온다!']), { dur: 2 }); };
  G.updaters.push(() => spawner());
  await S.until(() => G.colFront < stopZ + 260 || G.time - t0 > 240); await m11Seg(S, stopZ, tag, label, cap);
}
/* put a column vehicle at q (after a skip), picking up its waypoints from there */
function hgColPlace(v, q) { const p = hgPath(q, v.lane); v.pos.set(p.x, 0, p.z); v.yaw = p.yaw; v.m.root.position.copy(v.pos); v.m.root.rotation.y = p.yaw; v.q = q; v.pi = Math.max(0, v.pathQ.findIndex((qq) => qq > q + 2)); }
/* infantry and vehicles placed along the ride: q range, d either side (or a fixed band) */
function hgMenQ(tag, n, s0, s1, o = {}) { n = Math.round(n * (G.menMul || 1)); for (let i = 0; i < n; i++) { const p = rtAt(rand(s0, s1), (o.d0 !== undefined) ? rand(o.d0, o.d1) : pick([-1, 1]) * rand(o.w0 ?? 2, o.w ?? 15)); enemy(p.x, p.z, { tag, view: 170, kind: Math.random() < 0.3 ? 'heavy' : 'rifle', crouch: Math.random() < 0.4, hold: true, y: o.y }); } }
function hgArmorQ(kind, s, d, o = {}) { const p = rtAt(s, d), q = rtAt(s - 20, d); return new Vehicle(kind, p.x, p.z, Object.assign({ team: 'enemy', path: [[q.x, q.z]], speed: 2.5, armed: true, range: 180, scale: 1.05 }, o)); }
function hgMen(tag, n, z0, z1, o = {}) { n = Math.round(n * (G.menMul || 1)); for (let i = 0; i < n; i++) { const z = rand(z1, z0), x = (o.x ?? 0) + pick([-1, 1]) * rand(o.w0 ?? 2, o.w ?? 15); enemy(x, z, { tag, view: 160, kind: Math.random() < 0.3 ? 'heavy' : 'rifle', crouch: Math.random() < 0.4, hold: true, y: o.y }); } }

/* ---------- set pieces: a near miss, and someone on our side gets there first ----------
   each one: the threat shows itself → lock tone and red edge, the view is drawn to it → a beat of slow motion → an ally kills it.
   the rest of the enemy holds fire while it plays, so the eye has one place to go. the helicopter is never actually hit. */
const HGB = { beep: 0 };
function hgWarn(text, at) {
  const el = $('hgWarn'), mk = $('hgMark'); if (HGB.beep) { clearInterval(HGB.beep); HGB.beep = 0; } HGB.at = at || null; if (!el) return;
  if (!text) { el.classList.remove('on'); if (mk) mk.classList.remove('on'); return; }
  if (mk && at) { mk.classList.add('on'); if (HGB.mkU !== G.token) { HGB.mkU = G.token; G.updaters.push(() => { // a red bracket that sits on the threat, with its range
      if (G.mode !== 'play') { mk.classList.remove('on'); HGB.mkU = 0; return true; }
      const p = HGB.at && HGB.at(); if (!p) { mk.style.display = 'none'; return; }
      const sc = projectToScreen(p); mk.style.display = sc.behind ? 'none' : ''; mk.style.left = clamp(sc.x, 30, innerWidth - 30) + 'px'; mk.style.top = clamp(sc.y, 30, innerHeight - 30) + 'px';
      mk.querySelector('span').textContent = Math.round(p.distanceTo(camera.position)) + 'm'; }); } }
  el.querySelector('b').textContent = text; el.classList.add('on');
  HGB.beep = setInterval(() => { if (G.mode !== 'play') { hgWarn(null); return; } if (!G.paused) tone({ f: 1320, dur: 0.07, type: 'square', gain: 0.07, wet: 0 }); }, 170);
}
function hgQuiet(on) {
  for (const a of G.actors) if (a.alive && a.team === 'enemy' && !a.beat) { if (on) { if (a._ns === undefined) { a._ns = a.noShoot; a.noShoot = true; } } else if (a._ns !== undefined) { a.noShoot = a._ns; delete a._ns; } }
  for (const v of G.vehicles) if (v.alive && v.team === 'enemy' && !v.beat) { if (on) { if (v._ar === undefined) { v._ar = v.armed; v.armed = false; } } else if (v._ar !== undefined) { v.armed = v._ar; delete v._ar; } }
}
function hgLook(p, k = 0.7) { // pull the view most of the way toward a point, smoothly
  const e = camera.position; const wy = Math.atan2(-(p.x - e.x), -(p.z - e.z)), wp = Math.atan2(p.y - e.y, Math.hypot(p.x - e.x, p.z - e.z));
  const dy = angDiff(P.yaw, wy) * k, dp = (wp - P.pitch) * k; let t = 0, done = 0;
  G.updaters.push((dt) => { t += dt; const s = Math.min(1, t / 0.45), e2 = s * s * (3 - 2 * s); P.yaw += dy * (e2 - done); P.pitch += dp * (e2 - done); done = e2; return s >= 1 || G.mode !== 'play'; });
}
function hgSlow(ms = 650, k = 0.3) { G.timeScale = k; clearTimeout(HGB.slow); HGB.slow = setTimeout(() => { G.timeScale = 1; }, ms); }
function hgEnd() { hgWarn(null); hgQuiet(false); G.heliT.roll = 0; G.beatFov = 0; }
/* fire when the column front passes z; a stretch already skipped past is left out */
function hgWhen(S, z, fn) { (async () => { await S.until(() => G.colFront < z); if (G.colFront < z - 170 || G.mode !== 'play') return; await fn(); })(); }
function hgGuard(v) { const h0 = v.hurt.bind(v); v.hurt = (d, k, src) => { if (src === PT || v.open) return h0(d, k, src); }; }
function hgTube(a) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1.5, 8), hgMat('tube', { color: 0x3c4232, rough: 0.8 })); t.rotation.x = Math.PI / 2; t.position.set(0.16, 0.34, 0.05); a.m.torso.add(t); }
function hgMuzzle(p, sz = 1.4) { for (let k = 0; k < 3; k++) particle({ add: true, x: p.x, y: p.y, z: p.z, life: 0.07, size: sz * rand(0.7, 1.2), color: [1, 0.72, 0.35] }); flashLight(p, 0xffa050, 30, 40, 0.12); }

/* A · 한강대교 아치: an enemy BMP turns its turret onto us — the lead K2 fires first */
function hgBeatA(S) {
  const v = new Vehicle('bmp', 4, -262, { team: 'enemy', armed: false, speed: 0, scale: 1.05 }); v.beat = true; v.yaw = Math.PI; v.m.root.rotation.y = Math.PI; hgGuard(v);
  G.updaters.push((dt) => { if (!v.alive) return true; const H = G.m11H, m = v.m; if (!m.turret || !v.aiming) return; const wp = m.turret.getWorldPosition(v3());
    const want = Math.atan2(-(H.pos.x - wp.x), -(H.pos.z - wp.z)) - v.yaw; m.turret.rotation.y += clamp(angDiff(m.turret.rotation.y, want), -0.9 * dt, 0.9 * dt);
    if (m.barrel) m.barrel.rotation.x = damp(m.barrel.rotation.x, Math.atan2(H.pos.y - wp.y, Math.hypot(H.pos.x - wp.x, H.pos.z - wp.z)), 2, dt); });
  hgWhen(S, -125, async () => {
    if (!v.alive) return; hgQuiet(true); v.aiming = true;
    S.radio('독수리 2-1', '아치 위 적 장갑차! 포탑이 우리 쪽으로 돈다!', { dur: 2.4 }); hgWarn('조준 경고', () => v.alive ? v.pos.clone().add(v3(0, 1.5, 0)) : null); hgLook(v.pos.clone().add(v3(0, 2, 0)), 0.85); G.beatFov = 30;
    await S.wait(2.3);
    if (!v.alive) { hgEnd(); S.radio('독수리 2-1', '좋아, 사수가 먼저 잡았다!', { dur: 2.2 }); return; }
    const k2 = (G.colV || []).filter((c) => c.alive && c.o.k2).sort((a, b) => a.pos.z - b.pos.z)[0];
    const from = k2 ? (k2.m.muzzle ? k2.m.muzzle.getWorldPosition(v3()) : k2.pos.clone().add(v3(0, 2.4, -6))) : v3(-6.5, 3, v.pos.z + 200);
    if (k2 && k2.m.turret) { const wp = k2.m.turret.getWorldPosition(v3()); k2.m.turret.rotation.y = Math.atan2(-(v.pos.x - wp.x), -(v.pos.z - wp.z)) - k2.yaw; }
    hgSlow(700); SFX.shot('cannon', from); hgMuzzle(from, 3); G.shake += 0.3;
    for (let k = 0; k < 14; k++) particle({ x: from.x, y: from.y, z: from.z, vx: rand(-3, 3), vy: rand(0, 2), vz: rand(-3, 3), life: rand(1, 2), size: 1.5, size1: 5, alpha: 0.35, color: [0.75, 0.74, 0.72], drag: 1.5 });
    const to = v.pos.clone().add(v3(0, 1.3, 0)); tracer(from, to, [1, 0.85, 0.55], 900);
    await S.wait(Math.max(0.12, from.distanceTo(to) / 900));
    explode(to, { noPlayer: true, size: 2.4, dmg: 300, vdmg: 0 }); v.open = true; v.hurt(999999, 'explosive', null); G.shake += 0.4;
    hgEnd(); S.radio('K2 1호', '목표 제거! 장갑차 격파!', { dur: 2.4 });
  });
}
/* B · 노들섬: a man stands up in the reeds with a launcher on his shoulder — our door gunner cuts him down */
function hgBeatB(S) {
  const x = 48, z = -458; const a = enemy(x, z, { tag: 'hgB', kind: 'heavy', hold: true, noShoot: true, view: 300, crouch: true }); a.beat = true; a.marked = true; a.wantCrouch = true; hgTube(a);
  hgWhen(S, -375, async () => {
    if (!a.alive) return; hgQuiet(true); a.wantCrouch = false; a.yaw = Math.atan2(-(G.m11H.pos.x - a.pos.x), -(G.m11H.pos.z - a.pos.z));
    S.radio('한지운 하사', '갈대밭! 휴대용 대공미사일! 우리를 노린다!', { dur: 2.4 }); hgWarn('미사일 조준 경고', () => a.alive ? a.chest(v3()) : null); hgLook(a.pos.clone().add(v3(0, 1.6, 0)), 0.9); G.beatFov = 24;
    await S.wait(1.7);
    if (!a.alive) { hgEnd(); S.radio('리선우 병장', '잡았다! 잘 쐈다이!', { dur: 2.2 }); return; }
    hgSlow(900, 0.25); const H = G.m11H;
    for (let n = 0; n < 9; n++) S.later(n * 0.06, () => { const from = H.pos.clone().add(v3(Math.sign(a.pos.x - H.pos.x) * 1.7, -0.7, -1.2)); const to = a.alive ? a.chest(v3()).add(v3(rand(-0.5, 0.5), rand(-0.4, 0.4), rand(-0.5, 0.5))) : a.pos.clone(); tracer(from, to, [1, 0.6, 0.3], 520); hgMuzzle(from, 0.8); SFX.shot('mg', from); if (n === 5 && a.alive) { a.hurt(9999, null); FX.blood(to); } });
    await S.wait(0.7); hgEnd(); S.radio('측면 사수', '사수 제압! 발사 전에 잡았다!', { dur: 2.4 });
  });
}
/* C · 북단: a missile is already in the air from 강변북로 — flares, a hard break, and it goes into the river */
function hgBeatC(S) {
  hgWhen(S, -880, async () => {
    const H = G.m11H; hgQuiet(true);
    const from = v3(64, -6, -990); SFX.shot('rpg', from); for (let k = 0; k < 20; k++) particle({ x: from.x, y: from.y, z: from.z, vx: rand(-4, 4), vy: rand(0, 3), vz: rand(-4, 4), life: rand(1.5, 3), size: 1.5, size1: 6, alpha: 0.4, color: [0.8, 0.8, 0.8], drag: 1.2 });
    let aim = () => H.pos.clone().add(v3(9, -4, 0)), phase = 0, flare = null, slowed = false;
    const pr = new Proj('missile', from, v3().subVectors(H.pos, from).normalize().multiplyScalar(55), { team: 'enemy', guide: () => aim(), turn: 2.4 });
    S.radio('윤하린 중사', '미사일 발사! 2시 방향, 아래쪽!', { dur: 2.2 }); hgWarn('미사일 경보', () => pr.alive ? pr.pos.clone() : null); hgLook(from.clone().add(v3(0, 8, 0)), 0.55);
    G.updaters.push((dt) => {
      if (!pr.alive || G.mode !== 'play') return true;
      const d = pr.pos.distanceTo(H.pos);
      if (phase === 0 && pr.age > 1.0) { phase = 1; // flares out, break left and down
        flare = H.pos.clone().add(v3(10, -10, 14)); G.heliT.roll = 0.42; G.heliT.x = -14; SFX.shot('pistol', H.pos);
        for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 8; i++) S.later(i * 0.07, () => { const p = H.pos.clone().add(v3(s * 1.8, -1.2, 1)); for (let q = 0; q < 3; q++) particle({ add: true, x: p.x, y: p.y, z: p.z, vx: s * rand(6, 12), vy: rand(-8, -2), vz: rand(3, 9), life: 2.2, size: 1.6, size1: 0.4, color: [1, 0.85, 0.55], grav: 5 }); flashLight(p, 0xffe0a0, 20, 30, 0.2); });
        S.radio('독수리 2-1', '플레어! 플레어! 회피 기동!', { dur: 2 }); aim = () => flare; S.later(0.45, () => { slowed = true; hgSlow(850, 0.25); SFX.whiz(0.5); }); }
      if (phase === 1) { flare.y -= dt * 6; if (pr.pos.distanceTo(flare) < 6 || pr.age > 3.2) { phase = 2; const w = v3(pr.pos.x + 15, HG.water, pr.pos.z + 10); aim = () => w; } }
      if (pr.pos.y < HG.water + 0.6) { const p = pr.pos.clone().setY(HG.water + 0.2); pr.kill(); explode(p, { water: true, noPlayer: true, size: 2.4, dmg: 0, vdmg: 0 });
        for (let i = 0; i < 70; i++) particle({ x: p.x + rand(-2, 2), y: p.y, z: p.z + rand(-2, 2), vx: rand(-3, 3), vy: rand(12, 28), vz: rand(-3, 3), life: rand(1.6, 3), size: rand(0.8, 1.6), size1: rand(3, 6), alpha: 0.75, color: [0.86, 0.9, 0.93], grav: 9.8, drag: 0.4 });
        G.shake += 0.5; return true; }
    });
    await S.until(() => !pr.alive); await S.wait(0.6);
    G.heliT.x = 0; hgEnd(); S.radio('독수리 2-1', '…빗나갔다. 강에 처박혔다. 계속 간다!', { dur: 2.6 });
  });
}
/* D · 한강대로: an RPG on the apartment roof — a jet comes in low over us and takes the roof off */
function hgBeatD(S) {
  const R = v3(42, 42.5, -1198); const a = enemy(R.x, R.z, { tag: 'hgD', kind: 'heavy', hold: true, noShoot: true, view: 300, y: R.y }); a.beat = true; a.marked = true; hgTube(a);
  const b = enemy(R.x + 3, R.z - 4, { tag: 'hgD', hold: true, noShoot: true, view: 300, y: R.y }); b.beat = true;
  hgWhen(S, -1110, async () => {
    const H = G.m11H; hgQuiet(true); if (a.alive) a.yaw = Math.atan2(-(H.pos.x - a.pos.x), -(H.pos.z - a.pos.z));
    S.radio('박도현 중위', '오른쪽 아파트 옥상, RPG! 헬기를 노린다!', { dur: 2.4 }); hgWarn('RPG 조준', () => a.alive ? a.chest(v3()) : null); hgLook(R.clone().add(v3(0, 1.5, 0)), 0.8); G.beatFov = 40;
    await S.wait(1.1); S.radio('이글 1-1', '이글 1-1, 옥상 확인. 기총 소사 들어간다!', { dur: 2.4 });
    // straight up the line of slabs, high enough to clear every roof on the way (its guns reach down to the target)
    const A = v3(R.x - 6, 0, H.pos.z + 520), B = v3(R.x - 6, 0, R.z - 900); A.y = B.y = Math.max(75, hgTopLine(A, B, 30) + 20);
    const sp = 240, j = jetPass([A.x, A.y, A.z], [B.x, B.y, B.z], { speed: sp }); const tHit = (A.z - R.z) / sp;
    let gun = 0; G.updaters.push((dt) => { if (!j.root.parent || G.mode !== 'play') return true; const d = j.root.position.distanceTo(R); const dh = Math.hypot(j.root.position.x - R.x, j.root.position.z - R.z); if (dh > 330 || j.root.position.z < R.z + 15) return j.root.position.z < R.z + 15;
      gun -= dt; if (gun <= 0) { gun = 0.045; const f = j.root.position.clone(); const t = R.clone().add(v3(rand(-6, 6), rand(0, 1), rand(-6, 6))); tracer(f, t, [1, 0.7, 0.35], 900); if (Math.random() < 0.35) { FX.dust(t, 3, [0.5, 0.48, 0.45], 0.5); SFX.impact ? SFX.impact(t) : 0; } } });
    S.later(Math.max(0.1, tHit - 0.9), () => { SFX.shot('mg', R); });
    S.later(Math.max(0.1, tHit - 0.35), () => hgSlow(800, 0.3));
    await S.wait(tHit);
    for (let i = 0; i < 3; i++) S.later(i * 0.12, () => explode(R.clone().add(v3(rand(-5, 5), 0.5, rand(-6, 6))), { noPlayer: true, size: 2.6, dmg: 400, vdmg: 0, radius: 10 }));
    hgRubble(R, 12); addEmitter(R.clone().add(v3(0, 1, 0)), 'fire', 1.6, 18, 60); addEmitter(R.clone().add(v3(0, 3, 0)), 'smoke', 2, 2, 120); G.shake += 0.6;
    await S.wait(0.6); for (const e of [a, b]) if (e.alive) e.hurt(9999, null);
    hgEnd(); S.radio('박도현 중위', '옥상 날아갔다! 고맙다, 이글!', { dur: 2.4 });
  });
}
/* a flight of jets strafing / bombing a point: n aircraft in echelon along the road, clear of every roof; resolves when the lead is overhead */
function hgStrafe(S, R, o = {}) {
  const n = o.n ?? 2, q = hgQ(R), sp = 230; const fromQ = q - 650, toQ = q + 700;
  const a0 = hgPath(fromQ, o.d ?? 0), b0 = hgPath(toQ, o.d ?? 0); const alt = Math.max(70, hgTopLine(v3(a0.x, 0, a0.z), v3(b0.x, 0, b0.z), 30) + 22);
  let lead = null;
  for (let k = 0; k < n; k++) { const off = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 26, back = k * 70, hy = alt + k * 6;
    const a = hgPath(fromQ - back, (o.d ?? 0) + off), b = hgPath(toQ - back, (o.d ?? 0) + off);
    const j = jetPass([a.x, hy, a.z], [b.x, hy + 30, b.z], { speed: sp }); if (!lead) lead = j;
    let gun = 0; G.updaters.push((dt) => { if (!j.root.parent || G.mode !== 'play') return true; const jp = j.root.position; const dh = Math.hypot(jp.x - R.x, jp.z - R.z), ahead = hgQ(jp, q) < q - 20;
      if (!ahead || dh > 360) return !ahead; gun -= dt; if (gun <= 0) { gun = 0.05; const t = R.clone().add(v3(rand(-7, 7), rand(0, 1), rand(-7, 7))); tracer(jp.clone(), t, [1, 0.7, 0.35], 900); if (Math.random() < 0.3) FX.dust(t, 3, [0.5, 0.48, 0.45], 0.5); } }); }
  S.later(Math.max(0.2, 650 / sp - 1.2), () => SFX.shot('mg', R));
  return 650 / sp;
}
/* the war going on around the ride: flights of jets across the sky, two gunships riding with us, bombing runs and AA fire on the skyline,
   fires and smoke on the roofs of the city */
function hgWarSky(S) {
  const H = G.m11H;
  // rooftop fires and smoke columns all over the city (only the ones within 400 m make particles)
  { const tall = G.colliders.filter((c) => c.max.y > 22 && (c.max.x - c.min.x) > 12 && (c.max.z - c.min.z) > 12); for (let i = 0; i < 60 && tall.length; i++) { const c = pick(tall);
      const p = v3((c.min.x + c.max.x) / 2 + rand(-4, 4), c.max.y, (c.min.z + c.max.z) / 2 + rand(-4, 4)); if (Math.random() < 0.5) addEmitter(p, 'fire', rand(0.8, 1.6), 10); addEmitter(p.clone().add(v3(0, 2, 0)), 'smoke', rand(1.6, 3), 2); } }
  // two gunships riding with us, ahead and to either side, shooting into the blocks
  for (const [dq, dd, h] of [[70, -12, 32], [-50, 12, 36]]) { // over the carriageway, above and ahead / behind us
    const W = new Vehicle('aheli', H.pos.x + dd, H.pos.z - dq, { team: 'ally', armed: false, invuln: true, speed: 0, bob: false }); let q = H.q + dq, gun = rand(2, 5), burst = 0, tgt = null, y = h;
    G.updaters.push((dt) => { if (!H.alive || G.mode !== 'play') return true;
      q = lerp(q, H.q + dq + Math.sin(G.time * 0.21 + dd) * 25, Math.min(1, dt * 0.6)); const p = hgPath(q, dd + Math.sin(G.time * 0.13 + dq) * 3);
      const want = Math.max(h, hgTop(p.x, p.z, 14) + 10); y = lerp(y, want, Math.min(1, dt * 0.5)); W.pos.set(p.x, y, p.z); W.vel.set(0, 0, 0); W.yaw = p.yaw; W.m.root.position.copy(W.pos); W.m.root.rotation.set(-0.08, p.yaw, Math.sin(G.time * 0.7 + dd) * 0.05);
      gun -= dt; if (gun <= 0 && burst <= 0) { const es = G.actors.filter((a) => a.alive && a.team === 'enemy' && !a.beat && a.pos.distanceTo(W.pos) < 220); tgt = es.length ? pick(es) : null; burst = tgt ? 1.2 : 0; gun = rand(3, 6); }
      if (burst > 0) { burst -= dt; if (tgt && Math.random() < dt * 14) { const f = W.pos.clone().add(v3(0, -1.2, 0)); const t = tgt.pos.clone().add(v3(rand(-1.5, 1.5), 1, rand(-1.5, 1.5))); tracer(f, t, [1, 0.75, 0.4], 700); if (Math.random() < 0.3) { SFX.shot('mg', f); FX.dust(t, 2, [0.5, 0.48, 0.45], 0.4); } if (tgt.alive && Math.random() < 0.04) tgt.hurt(9999, null); } } });
  }
  // flights of 2–4 jets crossing the city every few seconds, sometimes bombing something a few hundred metres off
  let nextJet = 4; const fly = () => { const hp = H.pos, ang = rand(0, TAU), L = 1600, n = randi(2, 4), c = v3(hp.x + rand(-400, 400), 0, hp.z - rand(100, 600));
    const a = v3(c.x - Math.sin(ang) * L, 0, c.z - Math.cos(ang) * L), b = v3(c.x + Math.sin(ang) * L, 0, c.z + Math.cos(ang) * L); const alt = Math.max(110, hgTopLine(a, b, 40) + 40);
    const bomb = Math.random() < 0.5; for (let k = 0; k < n; k++) { const side = v3(Math.cos(ang), 0, -Math.sin(ang)).multiplyScalar((k % 2 ? 1 : -1) * Math.ceil(k / 2) * 30), back = v3(Math.sin(ang), 0, Math.cos(ang)).multiplyScalar(-k * 60);
      const A = a.clone().add(side).add(back), B = b.clone().add(side).add(back); const bombs = []; if (bomb) { const t = c.clone().add(side); if (Math.hypot(t.x - hp.x, t.z - hp.z) > 220) bombs.push([t.x, t.z]); }
      jetPass([A.x, alt + k * 8, A.z], [B.x, alt + k * 8 + 20, B.z], { speed: rand(200, 240), bombs, noPlayer: true, dmg: 0, vdmg: 0 }); } };
  // enemy AA on the skyline: streams of tracers climbing into the sky; distant blasts and their flashes
  let nextAA = 2, nextBoom = 3;
  G.updaters.push((dt) => { if (!H.alive || G.mode !== 'play') return true; const hp = H.pos;
    nextJet -= dt; if (nextJet <= 0) { nextJet = rand(9, 16); fly(); }
    nextAA -= dt; if (nextAA <= 0) { nextAA = rand(3, 7); const ang = rand(0, TAU), r = rand(500, 900), f = v3(hp.x + Math.cos(ang) * r, 4, hp.z + Math.sin(ang) * r); const sw = rand(-0.4, 0.4);
      for (let i = 0; i < 18; i++) S.later(i * 0.08, () => { const t = f.clone().add(v3(Math.sin(sw + i * 0.03) * 160 + rand(-10, 10), rand(260, 380), rand(-20, 20))); tracer(f, t, [1, 0.45, 0.25], 420); }); }
    nextBoom -= dt; if (nextBoom <= 0) { nextBoom = rand(2.5, 6); const ang = rand(0, TAU), r = rand(260, 700), p = v3(hp.x + Math.cos(ang) * r, 0, hp.z + Math.sin(ang) * r); p.y = hgTop(p.x, p.z, 8);
      FX.explosion ? FX.explosion(p, 3) : particle({ add: true, x: p.x, y: p.y + 4, z: p.z, life: 0.5, size: 18, size1: 30, color: [1, 0.6, 0.3] }); flashLight(p.clone().add(v3(0, 6, 0)), 0xffa050, 400, 180, 0.25); SFX.explosion(p, 0.35);
      for (let k = 0; k < 10; k++) particle({ x: p.x, y: p.y + 3, z: p.z, vx: rand(-6, 6), vy: rand(4, 12), vz: rand(-6, 6), life: rand(2, 4), size: 4, size1: 14, alpha: 0.45, color: [0.3, 0.29, 0.28], drag: 0.8 }); } });
}
/* F · 서울역: an RPG team on 서울로7017, the walkway over the avenue — a pair of jets rakes the deck */
function hgBeatF(S) {
  const s = RT.sSta + 238; const R = rtAt(s, -28); R.y = 13.7; const Rv = v3(R.x, R.y, R.z);
  const a = enemy(Rv.x, Rv.z, { tag: 'hgF', kind: 'heavy', hold: true, noShoot: true, view: 300, y: Rv.y }); a.beat = true; a.marked = true; hgTube(a);
  const b = enemy(Rv.x + 2, Rv.z + 2, { tag: 'hgF', hold: true, noShoot: true, view: 300, y: Rv.y }); b.beat = true;
  hgWhen(S, zq(s - 230), async () => { const H = G.m11H; hgQuiet(true); if (a.alive) a.yaw = Math.atan2(-(H.pos.x - a.pos.x), -(H.pos.z - a.pos.z));
    S.radio('윤하린 중사', '서울로 위! 고가 위에 RPG 조준!', { dur: 2.4 }); hgWarn('RPG 조준', () => a.alive ? a.chest(v3()) : null); hgLook(Rv.clone().add(v3(0, 1.5, 0)), 0.8); G.beatFov = 38;
    await S.wait(1.0); if (!a.alive && !b.alive) { hgEnd(); S.radio('독수리 2-1', '좋아, 먼저 잡았다!', { dur: 2.2 }); return; }
    S.radio('이글 2-1', '이글 2-1, 편대 진입. 고가 위 표적 소사한다!', { dur: 2.4 }); const tHit = hgStrafe(S, Rv, { n: 2 });
    S.later(Math.max(0.1, tHit - 0.35), () => hgSlow(800, 0.3)); await S.wait(tHit);
    for (let i = 0; i < 3; i++) S.later(i * 0.1, () => explode(Rv.clone().add(v3(rand(-4, 4), 0.3, rand(-3, 3))), { noPlayer: true, size: 2.2, dmg: 400, vdmg: 0, radius: 8 }));
    await S.wait(0.4); for (const e of [a, b]) if (e.alive) e.hurt(9999, null); hgEnd(); S.radio('독수리 2-1', '고가 위 정리됐다. 고맙다, 이글!', { dur: 2.4 }); });
}
/* G · 숭례문: an armoured car noses out from behind the gate on the east road and swings its gun up — two gunships come over the wall with rockets */
function hgBeatG(S) {
  const s = RT.V[3] - 70, p = rtAt(s, 94), q2 = rtAt(s - 30, 94);
  const v = new Vehicle('bmp', p.x, p.z, { team: 'enemy', armed: false, speed: 0, scale: 1.05 }); v.beat = true; v.yaw = p.yaw + Math.PI; v.m.root.rotation.y = v.yaw; hgGuard(v);
  G.updaters.push((dt) => { if (!v.alive) return true; if (!v.aiming || !v.m.turret) return; const H = G.m11H, wp = v.m.turret.getWorldPosition(v3()); v.m.turret.rotation.y += clamp(angDiff(v.m.turret.rotation.y, Math.atan2(-(H.pos.x - wp.x), -(H.pos.z - wp.z)) - v.yaw), -0.9 * dt, 0.9 * dt); });
  hgWhen(S, zq(s - 200), async () => { if (!v.alive) return; const H = G.m11H; hgQuiet(true); v.aiming = true;
    S.radio('한지운 하사', '숭례문 뒤! 장갑차가 포를 올린다!', { dur: 2.4 }); hgWarn('조준 경고', () => v.alive ? v.pos.clone().add(v3(0, 1.5, 0)) : null); hgLook(v.pos.clone().add(v3(0, 2, 0)), 0.8); G.beatFov = 34;
    await S.wait(1.6); if (!v.alive) { hgEnd(); S.radio('독수리 2-1', '장갑차 격파! 좋은 사격이다!', { dur: 2.2 }); return; }
    S.radio('바이퍼 1-1', '바이퍼 1-1, 2번기와 함께 들어간다. 로켓 발사!', { dur: 2.4 }); v.open = true;
    for (const [dx, dl] of [[-30, 0], [30, 0.6]]) S.later(dl, () => { const a0 = hgPath(H.q - 120, dx), b0 = rtAt(s + 300, 94 + dx * 0.3); const y = Math.max(H.pos.y + 10, hgTopLine(v3(a0.x, 0, a0.z), v3(b0.x, 0, b0.z), 16) + 12); airPass('cobra', [a0.x, y, a0.z], [b0.x, y, b0.z], { speed: 64, rockets: [v], vdmg: 99999 }); });
    const t1 = G.time; await S.until(() => !v.alive || G.time - t1 > 9); if (v.alive) v.hurt(999999, 'explosive', null); hgSlow(600); hgEnd(); S.radio('독수리 2-1', '숭례문 앞 정리. 고맙다, 바이퍼!', { dur: 2.4 }); });
}
/* H · 서울광장: an AA gun dug in on the lawn opens up — knock it out, or a flight of three jets takes it and half the plaza with it */
function hgBeatH(S) {
  const s = RT.V[4] + 160, p = rtAt(s, 70);
  const v = new Vehicle('bmp', p.x, p.z, { team: 'enemy', armed: false, speed: 0, scale: 1.05 }); v.beat = true; v.hp = v.maxHp = 300; v.yaw = p.yaw + Math.PI; v.m.root.rotation.y = v.yaw; hgGuard(v);
  for (const k of [-1, 1]) sandbags(p.x + k * 4, p.z, 4, p.yaw, 1.2);
  hgWhen(S, zq(s - 230), async () => { if (!v.alive) return; const H = G.m11H; hgQuiet(true); let fire = true, t = 0, cd = 0;
    G.updaters.push((dt) => { if (!v.alive || !fire || G.mode !== 'play') return true; t += dt; cd -= dt; if (cd <= 0 && (t % 1.4) < 0.9) { cd = 0.07; const from = v.pos.clone().add(v3(0, 2.4, 0)); const side = Math.sin(t * 1.7) > 0 ? 1 : -1;
        const to = H.pos.clone().add(v3(side * rand(5, 10), rand(-2, 5), rand(-4, 4))); to.addScaledVector(v3().subVectors(to, from).normalize(), 120); tracer(from, to, [1, 0.5, 0.3], 700); hgMuzzle(from, 1); SFX.shot('mg', from); if (Math.random() < 0.3) SFX.whiz(side * 0.6); } });
    S.radio('독수리 2-1', '서울광장 대공포! 사수, 잡아!', { dur: 2.4 }); hgWarn('대공포 사격', () => v.alive ? v.pos.clone().add(v3(0, 1.5, 0)) : null); hgLook(v.pos.clone().add(v3(0, 2, 0)), 0.85); G.beatFov = 38; S.obj('서울광장 대공포 제압');
    const t0 = G.time; await S.until(() => !v.alive || G.time - t0 > 8);
    if (!v.alive) { fire = false; hgSlow(500); hgEnd(); S.radio('독수리 2-1', '대공포 격파! 좋은 사격이다!', { dur: 2.4 }); return; }
    S.radio('이글 3-1', '이글 3-1, 3기 편대. 광장 대공포 폭격한다!', { dur: 2.4 }); v.open = true; const R = v.pos.clone(); const tHit = hgStrafe(S, R, { n: 3, d: 30 });
    S.later(Math.max(0.1, tHit - 0.3), () => hgSlow(700, 0.3)); await S.wait(tHit + 0.3);
    for (let i = 0; i < 4; i++) S.later(i * 0.15, () => explode(R.clone().add(v3(rand(-8, 8), 0.4, rand(-8, 8))), { noPlayer: true, size: 2.6, dmg: 300, vdmg: 0, radius: 9 }));
    fire = false; if (v.alive) v.hurt(999999, 'explosive', null); addEmitter(R.clone().add(v3(0, 1, 0)), 'fire', 1.4, 14); hgEnd(); S.radio('독수리 2-1', '대공포 침묵. 광화문으로 간다!', { dur: 2.4 }); });
}
/* concrete from the roof edge spilling into the street; it stays there */
function hgRubble(R, n) {
  const m = hgMat('rubble', { color: 0x8c877e, rough: 1 });
  for (let i = 0; i < n; i++) { const s = rand(0.8, 2.6); const c = new THREE.Mesh(new THREE.BoxGeometry(s, s * rand(0.4, 0.9), s * rand(0.6, 1.2)), m); c.castShadow = true;
    c.position.set(R.x - rand(5, 9), R.y + rand(-2, 1), R.z + rand(-8, 8)); G.world.add(c); const vel = v3(rand(-9, -2), rand(1, 6), rand(-3, 3)), spin = v3(rand(-4, 4), rand(-4, 4), rand(-4, 4));
    G.updaters.push((dt) => { vel.y -= 9.8 * dt; c.position.addScaledVector(vel, dt); c.rotation.x += spin.x * dt; c.rotation.y += spin.y * dt; c.rotation.z += spin.z * dt;
      const gy = hgGround(c.position.x, c.position.z) + s * 0.25; if (c.position.y < gy) { c.position.y = gy; FX.dust(c.position, 6, [0.5, 0.48, 0.45], 1); SFX.explosion(c.position, 0.25); return true; } }); }
}
/* E · 신용산: a self-propelled AA gun opens up, tracers past the cockpit — kill it, or an attack helicopter does */
function hgBeatE(S) {
  const v = new Vehicle('bmp', 10, -2125, { team: 'enemy', armed: false, speed: 0, scale: 1.05 }); v.beat = true; v.yaw = Math.PI; v.m.root.rotation.y = Math.PI; v.hp = v.maxHp = 300; hgGuard(v);
  hgWhen(S, -1960, async () => {
    if (!v.alive) return; const H = G.m11H; hgQuiet(true); let fire = true, t = 0, cd = 0;
    G.updaters.push((dt) => { if (!v.alive || !fire || G.mode !== 'play') return true; t += dt; cd -= dt; const m = v.m;
      if (m.turret) { const wp = m.turret.getWorldPosition(v3()); m.turret.rotation.y += clamp(angDiff(m.turret.rotation.y, Math.atan2(-(H.pos.x - wp.x), -(H.pos.z - wp.z)) - v.yaw), -1.5 * dt, 1.5 * dt); if (m.barrel) m.barrel.rotation.x = damp(m.barrel.rotation.x, 0.25, 2, dt); }
      if (cd <= 0 && (t % 1.4) < 0.9) { cd = 0.07; const from = (m.turret ? m.turret.getWorldPosition(v3()) : v.pos.clone()).add(v3(0, 1.6, 0)); const side = Math.sin(t * 1.7) > 0 ? 1 : -1;
        const to = H.pos.clone().add(v3(side * rand(5, 10), rand(-2, 5), rand(-4, 4))); to.addScaledVector(v3().subVectors(to, from).normalize(), 120);
        tracer(from, to, [1, 0.5, 0.3], 700); hgMuzzle(from, 1); SFX.shot('mg', from); if (Math.random() < 0.3) SFX.whiz(side * 0.6); } });
    S.radio('독수리 2-1', '대공포! 12시 정면! 사수, 저놈 잡아!', { dur: 2.4 }); hgWarn('대공포 사격', () => v.alive ? v.pos.clone().add(v3(0, 1.5, 0)) : null); hgLook(v.pos.clone().add(v3(0, 2, 0)), 0.85); G.beatFov = 38; S.obj('대공포 제압');
    const t0 = G.time; await S.until(() => !v.alive || G.time - t0 > 8);
    if (!v.alive) { fire = false; hgSlow(500); hgEnd(); S.radio('독수리 2-1', '대공포 격파! 좋은 사격이다!', { dur: 2.4 }); return; }
    S.radio('바이퍼 2-2', '바이퍼 2-2, 대공포는 우리가 맡는다!', { dur: 2.4 }); v.open = true;
    { const a0 = v3(H.pos.x + 22, 0, H.pos.z + 70), b0 = v3(v.pos.x - 10, 0, v.pos.z - 260); const y = Math.max(H.pos.y + 4, hgTopLine(a0, b0, 20) + 15);
      airPass('cobra', [a0.x, y, a0.z], [b0.x, y, b0.z], { speed: 62, rockets: [v], vdmg: 99999 }); }
    const t1 = G.time; await S.until(() => !v.alive || G.time - t1 > 9); fire = false; v.open = true; if (v.alive) v.hurt(999999, 'explosive', null);
    hgSlow(600); hgEnd(); S.radio('독수리 2-1', '대공포 격파 확인. 고맙다, 바이퍼!', { dur: 2.4 });
  });
}

/* ---------- the ride north: 한강대교 → 한강대로 → 서울역 → 숭례문 → 시청 → 광화문, shared by the sample (test: T skips) and 「북쪽으로」 (story) ---------- */
async function hgFlight(S, o = {}) {
    hgAir(S, o.z0 ?? 150, o.gun);
    // test shortcut: T finishes the current stretch — the fight there is cleared and the column and the helicopter jump to where it halts; the mission logic runs as normal
    const skip = (e) => { if (e.code !== 'KeyT' || G.mode !== 'play' || G.paused || G.cut) return;
      for (const a of G.actors) if (a.alive && a.team === 'enemy') a.hurt(99999, PT);
      for (const v of G.vehicles) if (v.alive && v.team === 'enemy') v.hurt(999999, 'explosive', PT);
      for (const v of G.colV || []) if (v.alive) { const tq = -(G.colStop + v.rank * 18 + 2); if (v.q < tq) hgColPlace(v, tq); }
      const H = G.m11H; if (H) { const al = (G.colV || []).filter((v) => v.alive); const front = al.length ? Math.max(...al.map((v) => v.q)) : -G.colStop; H.q = front - 55; G.colFront = -front; G.heliT.z = G.colFront + 55; }
      toast('다음 구간으로 이동'); };
    G.hgSkip = skip; if (o.test) addEventListener('keydown', skip); G.onLeave = () => { removeEventListener('keydown', skip); hgWarn(null); clearTimeout(HGB.slow); G.timeScale = 1; };
    hgBeatA(S); hgBeatB(S); hgBeatC(S); hgBeatD(S); hgBeatE(S); hgBeatF(S); hgBeatG(S); hgBeatH(S); hgWarSky(S);
    if (o.test) S.hint('테스트용 · <kbd>T</kbd> 현재 구간 건너뛰기 · <kbd>H</kbd> 기총 카메라', 8); else S.hint('<kbd>H</kbd> 기총 카메라 · 마우스로 조준, <kbd>좌클릭</kbd> 사격', 6);
    S.fade(0, 1.5);
    if (o.story) { // 「북쪽으로」: the crossing we fled over six weeks ago
      await S.radio('수리온 2-1', '독수리 2-1, 한강대교 상공 진입. 사수, 사격 자유.', { dur: 3 });
      await S.say('한지운 하사', '한 달 반 전에 이 다리를 건너서 도망쳤다.', { dur: 2.6 });
      await S.say('박도현 중위', '이번엔 우리가 위에서 길을 연다. 서한준! 다리 위 바리케이드부터!', { dur: 3 });
    } else await S.radio('수리온 2-1', '독수리 2-1, 한강대교 남단 상공. 기갑 선두 교량 진입한다.', { dur: 3 });
    // arches: a barricade and a BMP
    hgMen('h1', 10, -200, -260, { w: 15 }); hgMen('h1', 4, -170, -230, { w0: 16, w: 24 }); const b1 = new Vehicle('bmp', 8, -280, { team: 'enemy', path: [[8, -250]], speed: 3, armed: true, range: 160, scale: 1.05 });
    await m11Seg(S, -150, 'h1', '한강대교 아치 구간 바리케이드 제압');
    // 노들섬: men on the island and on the deck, a tank on the bridge
    hgMen('h2', 7, -470, -540, { w: 15 }); for (let i = 0; i < 6; i++) enemy(rand(25, 110), rand(-460, -525), { tag: 'h2', view: 160, hold: true, kind: Math.random() < 0.4 ? 'heavy' : 'rifle' });
    const t2 = new Vehicle('tank', 7, -560, { team: 'enemy', path: [[7, -540]], speed: 2.5, armed: true, range: 180, scale: 1.05 });
    S.radio('윤하린 중사', '노들섬에 적 보병, 교량 위에 전차 한 대!', { dur: 2.6 });
    await m11Seg(S, -420, 'h2', '노들섬 적 진지 제압', 30);
    // 북단: under the bridge on 강변북로, the junction barricade, two BMPs
    hgMen('h3', 9, -1020, -1060, { w: 16 }); for (let i = 0; i < 5; i++) enemy(rand(-60, 60), rand(-960, -1000), { tag: 'h3', y: -7, view: 160, hold: true });
    for (const x of [-9, 10]) new Vehicle('bmp', x, -1080, { team: 'enemy', path: [[x, -1060]], speed: 2.5, armed: true, range: 160, scale: 1.05 });
    await m11Seg(S, -900, 'h3', '한강대교 북단 교차로 확보', 30);
    // 한강대로: rooftops of the apartment slabs, the street
    hgMen('h4', 10, -1300, -1500, { w: 16 }); hgMen('h4', 6, -1300, -1500, { w0: 20, w: 30 }); for (const [x, z, y] of [[42, -1106, 42.5], [90, -1300, 45.5], [36, -1440, 18.5]]) enemy(x, z, { tag: 'h4', y, view: 220, hold: true, kind: 'heavy', acc: 1.2 });
    S.radio('박도현 중위', '아파트 옥상! 오른쪽 옥상에 기관총이다!', { dur: 2.6 });
    await m11Seg(S, -1250, 'h4', '한강대로 · 옥상 기관총 제압', 30);
    // 용산역: the plaza and a tank in front of the station
    hgMen('h5', 10, -1680, -1760, { w: 16 }); for (let i = 0; i < 7; i++) enemy(rand(-88, -32), rand(-1640, -1570), { tag: 'h5', view: 160, hold: true });
    new Vehicle('tank', -9, -1790, { team: 'enemy', path: [[-9, -1760]], speed: 2.5, armed: true, range: 180, scale: 1.05 });
    await m11Seg(S, -1620, 'h5', '용산역 앞 적 전차 격파', 34);
    // 삼각지 → 남영 → 숙대입구: a barricade at the junction, men in the shops either side, a BMP by 남영
    const V = RT.V, SS = RT.sSta, T = RT.total;
    hgMenQ('h6', 10, V[0] + 520, V[0] + 680, { w: 16 }); hgMenQ('h6', 7, V[0] + 520, V[0] + 680, { w0: 22, w: 34 }); hgArmorQ('bmp', V[0] + 760, 8);
    for (let d = -14; d <= 14; d += 6.5) { const p = rtAt(V[0] + 700, d); if (Math.abs(d) > 1.5) jersey(p.x, p.z, 5.5, p.yaw + rand(-0.2, 0.2)); }
    S.radio('박도현 중위', '삼각지 통과. 남영 쪽에 적 바리케이드!', { dur: 2.6 });
    await hgSeg(S, zq(V[0] + 450), 'h6', '남영 · 바리케이드 돌파', 34, '남영 방향 진격');
    // 서울역: the forecourt, a tank on the avenue, men on the station steps
    hgMenQ('h7', 12, SS - 40, SS + 160, { d0: -70, d1: -30 }); hgMenQ('h7', 8, SS - 40, SS + 160, { w: 15 }); hgArmorQ('tank', SS + 120, 7); hgArmorQ('bmp', SS + 180, -8);
    S.radio('윤하린 중사', '서울역 광장에 적 보병 다수, 전차 한 대!', { dur: 2.6 }); if (o.story) S.later(4, () => S.sayBg('리선우 병장', '서울역… 무너진 그대로임다.', { dur: 2.4 }));
    await hgSeg(S, zq(SS - 120), 'h7', '서울역 광장 제압', 40, '서울역까지 진격');
    // 숭례문: men round the gate's park and on the east road, a tank at the junction
    hgMenQ('h8', 10, V[3] - 260, V[3] - 60, { d0: 30, d1: 100 }); hgMenQ('h8', 7, V[3] - 120, V[3] + 40, { w: 16 }); hgArmorQ('tank', V[3] + 30, -8);
    S.radio('박도현 중위', '숭례문이다. 문화재 쪽으로는 쏘지 마라!', { dur: 2.6 });
    await hgSeg(S, zq(V[3] - 300), 'h8', '숭례문 교차로 확보', 40, '숭례문까지 진격');
    // 시청: the plaza, 덕수궁's wall, the hotel corner
    hgMenQ('h9', 11, V[4] + 60, V[4] + 260, { d0: 30, d1: 120 }); hgMenQ('h9', 7, V[4] + 60, V[4] + 260, { d0: -34, d1: -22 }); hgArmorQ('bmp', V[4] + 240, 9);
    await hgSeg(S, zq(V[4] - 40), 'h9', '서울광장 · 시청 제압', 40, '시청까지 진격');
    // 광화문: the last stand across the plaza, two tanks and the men at the statues
    hgMenQ('h10', 18, V[4] + 700, T - 120, { d0: -75, d1: -20 }); hgMenQ('h10', 12, V[4] + 700, T - 120, { w: 16 }); hgArmorQ('tank', T - 160, -9); hgArmorQ('tank', T - 220, 9); hgArmorQ('bmp', T - 280, 12);
    S.radio('박도현 중위', '광화문 광장! 마지막이다, 전부 쓸어버려!', { dur: 2.6 });
    for (let i = 0; i < 2; i++) S.later(6 + i * 9, () => { const t = rtAt(T - 300 + i * 120, rand(-40, 40)); hgStrafe(S, v3(t.x, 0, t.z), { n: 2, d: 20 }); setGameTimeout(() => { for (let k = 0; k < 3; k++) explode(v3(t.x + rand(-10, 10), 0.4, t.z + rand(-10, 10)), { noPlayer: true, size: 2.4, dmg: 300, vdmg: 300, radius: 9 }); }, 650 / 230); });
    await hgSeg(S, zq(V[4] + 600), 'h10', '광화문 광장 탈환', 60, '세종대로 진격');
    G.colStop = zq(T - 120); S.obj('광화문까지 진격');
    { const t0 = G.time; await S.until(() => G.colFront < zq(T - 160) || G.time - t0 > 90); }
    if (!o.story) { await S.radio('박도현 중위', '광화문 도착. 서울 중심부 확보했다!', { dur: 2.8 }); await S.radio('독수리 2-1', '독수리 2-1, 광화문 상공. 임무 완료.', { dur: 2.6 }); }
}