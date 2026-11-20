const PY_DAWN = { sky: [0x4a5468, 0x9a8a84, 0xc09a78], glow: 0xffa060, glowDir: [1, 0.06, -0.2], fog: 0x7a7a80, fogD: 0.0065, hemi: [0xb8c0d4, 0x4a4a4c, 0.9], sun: [0xffb888, 0.75], sunDir: [1, 0.2, -0.2], stars: false, night: false, exposure: 1.15, viewDist: 120 };
const PY = { south: 14, north: -186, quay: -200, sq0: -640, station: -790, pont: 62 };
function pyGround(x, z) {
  if (z > PY.south + 6) return 0.2;
  if (z < PY.north - 4) return 0.8;
  const ks = smooth(clamp((z - PY.south + 2) / 8, 0, 1)), kn = smooth(clamp((PY.north + 4 - z) / 10, 0, 1));
  return -4 + ks * 4.2 + kn * 4.8;
}
function pyBlock(x, z, w, d, h, o = {}) { building(x, z, w, d, h, Object.assign({ hue: pick([40, 30, 200]), lit: 0.03, broken: 0.45 }, o)); }
function buildPyongyang() {
  G.groundAt = pyGround;
  buildTerrain(1600, 220, 'concrete', 6, 0x8a8a86, 0, -380);
  waterPlane(0, (PY.south + PY.north) / 2, 1600, PY.south - PY.north + 10, -1.0, 0x1e2a30, true);
  // south bank: our side, low warehouses and the boat ramps
  for (let i = 0; i < 18; i++) pyBlock(rand(-300, 300), rand(60, 160), rand(20, 40), rand(14, 26), rand(6, 14), { lit: 0.01 });
  // north quay: promenade, rails, trees, the old gate
  roadStrip(0, -204, 16, 600, Math.PI / 2);
  for (let x = -280; x < 280; x += 3) if (Math.random() < 0.85) addBox(x, 0.8, PY.north - 3.2, 2.6, 0.9, 0.1, MT.metal(), { collide: false });
  for (let x = -260; x < 260; x += 14) { if (Math.abs(x) < 20 || Math.abs(x - PY.pont) < 10) continue; addBox(x, 0.8, -214, 0.3, 3, 0.3, mat('trunk', { color: 0x3a2e24 }), { collide: false }); addMesh(new THREE.SphereGeometry(2, 8, 6), mat('treeg', { color: 0x3e4a32, rough: 1 }), x, 4.6, -214); }
  tradGate(-74, -226, 1.1, 0);
  signBoard(-74, 4.2, -219.5, '대동문', { w: 5, bg: '#5a2a1a', size: 70 });
  // the defensive line on the quay
  for (let x = -60; x <= 60; x += 12) sandbags(x + rand(-1, 1), -206, 7, 0);
  for (const x of [-48, 0, 48]) sandbagRing(x, -212, 2.3, Math.PI);
  // the avenue north to the station
  roadStrip(0, (PY.quay + PY.sq0) / 2 - 10, 30, PY.sq0 - PY.quay - 20);
  for (const sx of [-1, 1]) roadStrip(sx * 17.5, (PY.quay + PY.sq0) / 2 - 10, 5, PY.sq0 - PY.quay - 20, 0, 1.0);
  for (const cz of [-330, -480]) roadStrip(0, cz, 220, 20, Math.PI / 2);
  const segs = [[-218, -318], [-342, -468], [-492, -630]];
  for (const [z0, z1] of segs) for (const sx of [-1, 1]) {
    let z = z0; while (z > z1 + 10) { const d = Math.min(rand(30, 46), z - z1); const w = rand(22, 30); pyBlock(sx * (20 + w / 2), z - d / 2, w, d - 3, rand(18, 48), { fire: Math.random() < 0.35 ? 1 : 0 }); pyBlock(sx * (52 + rand(10, 20)), z - d / 2, 26, d - 3, rand(30, 70)); z -= d; }
  }
  for (const cz of [-330, -480]) for (const sx of [-1, 1]) pyBlock(sx * 120, cz, 40, 30, rand(20, 40));
  // 평양역 square and the station
  roadStrip(0, (PY.sq0 + PY.station) / 2 + 10, 150, PY.sq0 - PY.station + 20, 0, 0.82);
  for (const sx of [-1, 1]) { pyBlock(sx * 100, -690, 40, 90, rand(26, 40), { hue: 40 }); pyBlock(sx * 104, -620, 40, 26, 34, { hue: 40 }); }
  const stM = mat('station', { color: 0xc8bea4, rough: 0.8 });
  addBox(0, 0.8, PY.station, 150, 20, 34, stM, { tile: 6 });
  addBox(0, 0.8, PY.station + 2, 30, 40, 26, stM, { tile: 3 });
  addBox(0, 40.8, PY.station + 2, 18, 8, 18, mat('stroof', { color: 0x6a7a6a, rough: 0.6, metal: 0.3 }));
  for (let x = -66; x <= 66; x += 6) if (Math.abs(x) > 16) addBox(x, 4, PY.station + 17.2, 3.4, 10, 0.3, mat('stwin', { color: 0x2a3036, metal: 0.4, rough: 0.3 }), { collide: false });
  signBoard(0, 30, PY.station + 15.2, '평 양', { w: 16, bg: '#8a1a1a', size: 84 });
  const clk = new THREE.Mesh(new THREE.CircleGeometry(2.6, 24), mat('clock', { color: 0xf0ead8, emissive: 0x403a30 })); clk.position.set(0, 36, PY.station + 15.1); G.world.add(clk);
  // wrecks, barricades, rubble in the square and the avenue
  for (let i = 0; i < 30; i++) { const z = rand(PY.station + 40, PY.quay - 20); let x = rand(-14, 14); if (z > PY.sq0 - 6) x = Math.random() < 0.3 ? rand(-1.2, 1.2) : pick([-1, 1]) * rand(12.6, 14); /* the avenue's two armour lanes (x ±5..±11) stay clear: nothing for a tank to drive through */ Math.random() < 0.55 ? carProp(x, z, rand(0, 3), pick([0x4a5560, 0x6a2a2a, 0x2a3a5a]), true, Math.random() < 0.3) : rubble(x, z, rand(0.8, 1.4)); }
  for (const z of [-300, -450, -600]) { jersey(0, z, 4, 0); jersey(-13.4, z - 6, 4, Math.PI / 2); jersey(13.4, z - 6, 4, Math.PI / 2); } // pushed aside to the median and the kerbs
  for (let i = 0; i < 8; i++) tankWreck(rand(-50, 50), rand(PY.station + 50, PY.sq0 - 10), rand(0, 6), Math.random() < 0.5);
  for (let i = 0; i < 22; i++) { const p = v3(pick([-1, 1]) * rand(20, 40), rand(8, 30), rand(-230, -720)); addEmitter(p, 'fire', 1.1, 12); addEmitter(p.clone().add(v3(0, 6, 0)), 'smoke', 1.4, 2); }
  buildMountains(1000, 26, 0x2e3438, 60, 140, false, 0, -350);
}
/* pontoon segments: built across the river one at a time */
function pontoonSeg(i) {
  const z = PY.south - 2 - i * 10; if (z < PY.north - 2) return null;
  const m = addBox(PY.pont, -1.1, z, 9, 0.55, 9.8, mat('pont', { color: 0x4f5540, rough: 0.7, metal: 0.4 }), { collide: false, dynamic: true });
  addBox(PY.pont - 4.6, -0.55, z, 0.2, 0.6, 9.8, MT.metal(), { collide: false, dynamic: true }); addBox(PY.pont + 4.6, -0.55, z, 0.2, 0.6, 9.8, MT.metal(), { collide: false, dynamic: true });
  FX.splash(v3(PY.pont, -0.8, z), 2); return m;
}
const onPontoon = (x, z) => (Math.abs(x - PY.pont) < 6 && z < PY.south + 4 && z > PY.north - 6 ? Math.max(-0.5, G.groundAt(x, z)) : G.groundAt(x, z));
/* enemy rocket artillery */
function mlrsBarrage(S, n = 10, o = {}) {
  if (G.cut || G.mode !== 'play') return;
  S.sayBg(pick(['윤하린 중사', '리선우 병장']), pick(['다연장 로켓! 엎드려!', '로켓 들어온다! 머리 숙여!']), { dur: 2 });
  SFX.incoming && SFX.incoming(P.pos);
  for (let i = 0; i < n; i++) { const a = rand(0, Math.PI * 2), r = rand(o.rmin ?? 10, o.rmax ?? 32); S.arty(P.pos.x + Math.cos(a) * r, P.pos.z + Math.sin(a) * r, { delay: 1.6 + i * 0.22, dmg: o.dmg ?? 55 }); }
}
function makeMLRS(x, z, yaw = 0) {
  const v = new Vehicle('truck', x, z, { armed: false, speed: 0, hp: 320, color: 0x5a5a40 }); v.yaw = yaw; v.m.root.rotation.y = yaw;
  const L = new THREE.Group(); L.position.set(0, 2.2, 1.6); L.rotation.x = -0.45; v.m.root.add(L);
  const tm = mat('mlrs', { color: 0x4a4c38, rough: 0.7 }); for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 8), tm); t.rotation.x = Math.PI / 2; t.position.set(-0.5 + c * 0.33, r * 0.3, 0); L.add(t); }
  return v;
}

/* air cover over the armoured push: pairs of jets work ahead of the tanks, and anyone the tanks have rolled past is bombed where he stands.
   front() = z of the leading tank (the push runs toward -z). no bomb ever touches our men, our vehicles or an objective vehicle */
function pyAirCover(S, arm, o = {}) {
  const front = () => { let z = 1e9; for (const v of arm) if (v.alive) z = Math.min(z, v.pos.z); return z; };
  const marked = new Set(); let runs = 0;
  const strike = (targets, ahead) => {
    const pts = targets.slice(0, ahead ? 5 : 6).map((a) => { marked.add(a); return [a.pos.x, a.pos.z, a.pos.y > G.groundAt(a.pos.x, a.pos.z) + 3 ? a.pos.y + 0.6 : undefined]; });
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cz = pts.reduce((s, p) => s + p[1], 0) / pts.length, sd = Math.random() < 0.5 ? -1 : 1;
    const from = [cx - sd * 700, rand(70, 95), cz + rand(-40, 40)], to = [cx + sd * 700, rand(80, 110), cz + rand(-40, 40)];
    jetPass(from, to, { speed: 260, bombs: pts, noPlayer: true, noAlly: true, vdmg: 0, dmg: 400, src: null });
    S.later(0.4, () => jetPass([from[0], from[1] + 8, from[2] + 14], [to[0], to[1] + 8, to[2] + 14], { speed: 260 }));
    // whoever the blast missed is still caught by the stick: nobody behind the line walks away
    S.later(4.2, () => { for (const a of targets) if (a.alive && !ahead) { FX.dust(a.pos.clone(), 6, [0.4, 0.37, 0.33], 0.6); a.hurt(999, null); } });
    if (runs++ % 4 === 0) S.sayBg(pick(['리선우 병장', '한지운 하사', '윤하린 중사']), pick(['공군 들어온다!', '폭격 들어갑니다!', '저것 봐라, 다 날아간다!', '하늘이 우리 편이다!']), { dur: 1.8 });
  };
  const behind = S.every(2.2, () => { const fz = front(); if (fz > 1e8) return;
    const t = G.actors.filter((a) => a.alive && a.team === 'enemy' && !marked.has(a) && a.pos.z > fz + 4 && (o.keep ? !o.keep(a) : true));
    if (t.length) strike(t.sort((a, b) => b.pos.z - a.pos.z), false); });
  const ahead = S.every(o.every ?? 8, () => { const fz = front(); if (fz > 1e8) return;
    const t = G.actors.filter((a) => a.alive && a.team === 'enemy' && !marked.has(a) && a.pos.z < fz - 25 && a.pos.z > fz - 130 && (o.keep ? !o.keep(a) : true));
    if (t.length) { const c = pick(t); strike(t.filter((a) => a.pos.distanceTo(c.pos) < 22), true); } });
  // a tank never stops for a man in its way: he goes under it
  const crush = S.every(0.1, () => { for (const v of arm) { if (!v.alive || (v.cs || 0) < 0.5) continue; const fx = -Math.sin(v.yaw), fz = -Math.cos(v.yaw);
    for (const a of G.actors) { if (!a.alive || a.team !== 'enemy') continue; const rx = a.pos.x - v.pos.x, rz = a.pos.z - v.pos.z; if (Math.abs(rx * fx + rz * fz) < v.size[2] + 0.4 && Math.abs(rx * fz - rz * fx) < v.size[0] + 0.3) { FX.blood(a.chest(v3())); a.hurt(999, null); } } } });
  return { front, stop() { S.stop(behind); S.stop(ahead); S.stop(crush); } };
}

/* ========== MISSION 12 「평양」 ========== */
defMission({
  id: 'm10b', act: '3막 · 반격', num: '미션 13', title: '평양',
  dateText: '2032년 4월 3일 04:10', dateShort: '2032.04.03', place: '평양 · 대동강 → 평양역', placeShort: '평양', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: { sky: [0x0e1626, 0x26324a, 0x3a3e4c], glow: 0xff7040, glowDir: [0, 0.05, -1], fog: 0x262e3c, fogD: 0.009, hemi: [0x9aa8c8, 0x2a2c34, 0.78], sun: [0xa8b8e0, 0.45], sunDir: [-0.3, 1, -0.5], stars: true, night: true, exposure: 1.4, snow: 0, viewDist: 80, battle: 0.8, flashes: 0.4, flashDir: [0, -1], windSnd: 0.3 },
  loadout: { weapons: ['rifle', 'sniper', 'pistol'], nades: 4 },
  bounds: [-90, PY.station + 18, 100, 90],
  hitMul: 0.85,
  build(S) {
    buildPyongyang();
    squad(S, [
      { key: 'park', name: '박도현 중위', x: -3, z: 40 }, { key: 'lee', name: '리선우 병장', x: 3, z: 40 },
      { key: 'yoon', name: '윤하린 중사', x: -3, z: 44 }, { key: 'han', name: '한지운 하사', x: 3, z: 44 },
    ]);
  },
  phases: [
    /* 1. 대동강 도하 */
    {
      setup(S) { S.player(0, 36, 0); },
      async run(S) {
        S.nvg(true);
        for (const k of ['park', 'lee', 'yoon', 'han']) { const a = S.sq[k]; if (a) a.remove(); }
        const mine = makeBoat(); G.world.add(mine); mine.position.set(0, -0.9, PY.south + 30);
        for (const [x, z] of [[-1.1, -4.1], [0, -4.2], [1.1, -4.0], [-1.2, -3.0], [1.2, -3.0], [0, -1.9], [-1.2, -0.9], [1.2, -0.9], [-1.1, 0.4]]) { const m = makeSoldierMesh('rok'); m.root.position.set(x, 0, z); mine.add(m.root); m.root.userData.soldier = true; }
        const boats = []; for (const x of [-120, -90, -60, -32, 30, 58, 88, 118, -150, 150]) { const b = makeBoat(); b.position.set(x + rand(-4, 4), -0.9, PY.south + 30 + rand(-8, 14)); G.world.add(b); boats.push(b); for (let i = 0; i < 6; i++) { const m = makeSoldierMesh('rok'); m.root.position.set(rand(-1.2, 1.2), 0, rand(-3.5, 1)); b.add(m.root); m.root.userData.soldier = true; } }
        // the quay is held
        for (let i = 0; i < 20; i++) enemy(rand(-70, 70), -206 - rand(0, 4), { tag: 'quay', hold: true, view: 170, crouch: Math.random() < 0.6, kind: Math.random() < 0.25 ? 'heavy' : 'rifle' });
        for (const x of [-48, 0, 48]) for (let k = 0; k < 2; k++) enemy(x - 0.8 + k * 1.6, -212, { tag: 'quay', kind: 'heavy', hold: true, view: 170, hp: 240 });
        P.ride = { obj: mine, off: [0, 0.2, 1.2] }; P.noFire = false; P.yawLim = [0, 1.7];
        G.hitMul = 0.5; const regen = S.every(0.5, () => { if (P.alive && P.hp < 100 && G.time - P.lastHit > 2) P.hp = Math.min(100, P.hp + 6); });
        const eng = makeLoop('engine'); eng.set(0.25, 0, 48);
        let bt = 0; const stopZ = PY.north + 9;
        G.updaters.push((dt) => { if (G.mode !== 'play') return true; bt += dt;
          const sp = mine.position.z > stopZ ? 7 : 0; mine.position.z -= sp * dt; mine.position.y = -0.9 + Math.sin(bt * 1.4) * 0.18; mine.rotation.z = Math.sin(bt * 0.9) * 0.04;
          for (const b of boats) { if (b.userData.sunk) continue; b.position.z -= (b.position.z > stopZ ? 7 * (b.userData.k ??= rand(0.95, 1.05)) : 0) * dt; b.position.y = -0.9 + Math.sin(bt * 1.4 + b.position.x) * 0.18; if (Math.random() < 0.15) particle({ x: b.position.x + rand(-2, 2), y: -0.6, z: b.position.z - 5, vy: rand(1, 2), life: 0.8, size: 0.4, size1: 1.2, alpha: 0.4, color: [0.7, 0.75, 0.78], grav: 4 }); }
        });
        // flares and fire from the quay
        illumFlare(-30, -120); S.later(9, () => illumFlare(40, -160)); S.later(20, () => illumFlare(-10, -190)); S.later(30, () => illumFlare(30, -200));
        const mg = S.every(0.1, () => { const from = v3(rand(-60, 60), 2.4, -212); const to = v3(mine.position.x + rand(-40, 40), rand(-0.8, 2), mine.position.z + rand(-20, 30)); tracer(from, to, Math.random() < 0.5 ? [1, 0.5, 0.3] : [0.5, 1, 0.4], 420); if (Math.random() < 0.25) FX.splash(to, 0.2); });
        const geysers = S.every(0.7, () => { const p = v3(mine.position.x + rand(-60, 60), -1, mine.position.z + rand(-60, 20)); FX.splash(p, rand(2, 4)); SFX.explosion(p, 0.7); if (p.distanceTo(mine.position) < 20) G.shake += 0.3; });
        await S.say('박도현 중위', '대동강이다. 건너편 강둑까지 200미터. 고개 들지 말고, 쏠 수 있으면 쏴라.', { dur: 3.6 });
        S.obj('대동강 도하 — 강둑의 적을 제압하라'); S.hint('보트 위에서도 사격할 수 있어요 · <kbd>N</kbd> 야간투시경', 5);
        await S.until(() => mine.position.z < -40);
        S.radio('포병 통제', '연막 차장 들어간다. 강 중앙.', { dur: 2.4 });
        for (let i = 0; i < 10; i++) S.later(1 + i * 0.25, () => { const p = v3(-140 + i * 30 + rand(-6, 6), -0.5, -150 + rand(-10, 10)); explode(p, { noPlayer: true, dmg: 0, vdmg: 0, size: 0.6, water: true }); addEmitter(p.clone().add(v3(0, 2, 0)), 'smoke', 3.2, 4, 40); });
        await S.until(() => mine.position.z < -90);
        const victim = boats.find((b) => Math.abs(b.position.x - 30) < 8) || boats[0];
        explode(victim.position.clone().add(v3(0, 1, 0)), { noPlayer: true, size: 2.2, dmg: 0, vdmg: 0 }); victim.userData.sunk = true; addEmitter(victim.position.clone().add(v3(0, 1, 0)), 'fire', 1.4, 20, 14);
        S.tween(5, (k) => { victim.position.y = -0.9 - k * 3; victim.rotation.x = k * 0.7; }); G.shake += 0.5;
        S.sayBg('리선우 병장', '옆 보트 맞았슴다!', { dur: 2 });
        S.later(5, () => { const v2 = boats.find((b) => !b.userData.sunk && Math.abs(b.position.x + 90) < 8); if (!v2) return; explode(v2.position.clone().add(v3(0, 1, 0)), { noPlayer: true, size: 2, dmg: 0, vdmg: 0 }); v2.userData.sunk = true; S.tween(5, (k) => { v2.position.y = -0.9 - k * 3; v2.rotation.z = k * 0.8; }); });
        await S.until(() => mine.position.z <= stopZ + 0.5);
        S.say('보트 조타수', '접안! 내려, 내려!', { dur: 1.6 });
        await S.wait(0.8); const ramp = mine.userData.ramp; if (ramp) await S.tween(0.6, (k) => { ramp.rotation.x = -k * 1.45; }, (t) => t * t);
        S.stop(mg); S.stop(geysers); eng.stop(); S.stop(regen); G.hitMul = 1;
        P.ride = null; P.yawLim = null;
        for (const c of [...mine.children]) if (c.userData.soldier) mine.remove(c);
        S.player(mine.position.x, mine.position.z - 7, 0, 0);
        squad(S, [{ key: 'park', name: '박도현 중위', x: mine.position.x - 1, z: mine.position.z - 6 }, { key: 'lee', name: '리선우 병장', x: mine.position.x + 1.4, z: mine.position.z - 5 }, { key: 'yoon', name: '윤하린 중사', x: mine.position.x - 1.8, z: mine.position.z - 4 }, { key: 'han', name: '한지운 하사', x: mine.position.x + 2, z: mine.position.z - 3.5 }]);
        const men = []; for (const b of boats) { if (b.userData.sunk) continue; b.children.filter((c) => c.userData.soldier).forEach((c) => b.remove(c)); for (let i = 0; i < 4; i++) men.push(ally(b.position.x + rand(-1.5, 1.5), b.position.z - 7 - i, { hp: 120 })); }
        men.forEach((a) => { a.goTo = v3(a.pos.x * 0.6 + rand(-4, 4), 0, -200 + rand(-2, 2)); });
        S.later(1.2, () => { for (const a of men.slice(0, 5)) { if (!a.alive) continue; FX.blood(a.chest(v3())); a.die(); } });
        G.pyMen = men;
        const pr = S.pressure({ from: [[-60, -250], [60, -250], [0, -260], [-100, -230], [100, -230]], to: () => [rand(-60, 60), -208], tag: 'quay', max: 18, every: 1.4, heavy: 0.2, view: 140 });
        await S.lead('park', [
          [mine.position.x - 4, PY.north - 6, { run: true, say: ['박도현 중위', '강둑으로! 모래주머니까지 뛰어!'], bg: true }],
          [-6, -203, { fight: 'quay', leave: 8, crouch: true }],
        ], { follow: ['lee', 'yoon', 'han'], label: '강둑 진지 돌파', call: '서한준! 물가에 있으면 죽는다!' });
        pr.stop();
        await S.killAll('quay', 3);
      },
    },
    /* 2. 교두보 사수 — 부교 가설 */
    {
      setup(S) { S.player(-4, -206, 0); },
      async run(S) {
        squad(S, [{ key: 'park', name: '박도현 중위', x: -8, z: -205 }, { key: 'lee', name: '리선우 병장', x: 0, z: -206 }, { key: 'yoon', name: '윤하린 중사', x: 6, z: -205 }, { key: 'han', name: '한지운 하사', x: 12, z: -206 }]);
        for (const k of ['park', 'lee', 'yoon', 'han']) { const a = S.sq[k]; if (a) { a.hold = true; a.home = a.pos.clone(); } }
        if (!G.pyMen) { G.pyMen = []; for (let i = 0; i < 16; i++) G.pyMen.push(ally(rand(-60, 60), -205 + rand(-2, 1), { hp: 120 })); }
        for (const a of G.pyMen) if (a.alive) { a.goTo = v3(clamp(a.pos.x, -70, 90), 0, -207 + rand(-1, 1)); a.hold = true; }
        S.station([-14, -201], 'RPG 상자', () => { giveWeapon('rpg', true); P.ammo.rpg.res = Math.max(P.ammo.rpg.res, 4); }, 2.2);
        { const y = G.groundAt(-14, -201); addBox(-14, y, -201, 1.4, 0.6, 0.8, mat('ammobox', { color: 0x4e5638 })); }
        await S.radio('공병대', '여기는 공병. 부교 가설 시작한다. 12분… 아니, 2분만 버텨 줘라!', { dur: 3.2 });
        await S.say('박도현 중위', '들었지! 공병이 다리 놓을 때까지 이 강둑을 지킨다!', { dur: 2.8 });
        S.hint('RPG 상자는 강둑 왼쪽 · 적 장갑차가 나오면 쓰세요', 5);
        let prog = 0, seg = 0; const DUR = 110;
        S.clock('부교 가설', '0%');
        const pr = S.pressure({ from: [[-60, -330], [60, -330], [0, -340], [-110, -300], [110, -300], [-40, -480], [40, -480]], to: () => [rand(-40, 40), rand(-226, -246)], tag: 'bh', max: 18, every: 1.0, heavy: 0.22, rush: 0.3, view: 120 });
        const pg = S.every(0.25, () => { prog = Math.min(100, prog + 25 / DUR); S.clock('부교 가설', Math.floor(prog) + '%'); while (seg < prog / 5) { pontoonSeg(seg); seg++; } S.obj(`교두보 사수 — 부교 가설 ${Math.floor(prog)}%`); });
        S.later(18, () => S.threat('bmp', { x: -6, z: -400, path: [[-6, -300], [-4, -250]], line: '적 BMP! 대로에서 내려옵니다!' }));
        S.later(30, () => mlrsBarrage(S, 10));
        S.later(52, () => { S.radio('공병대', '절반 넘었다! 계속 막아 줘!', { dur: 2.4 }); });
        S.later(62, () => S.threat('bmp', { x: 90, z: -330, path: [[30, -330], [14, -280], [10, -250]], line: '오른쪽 교차로! BMP 한 대 더!' }));
        S.later(72, () => mlrsBarrage(S, 12));
        S.later(96, () => mlrsBarrage(S, 8));
        S.later(40, () => S.sayBg('윤하린 중사', '적 보병, 대로에서 몰려옵니다!', { dur: 2.2 }));
        await S.until(() => prog >= 100);
        S.stop(pg); S.clock(null); pr.stop();
        for (let i = seg; i < 22; i++) pontoonSeg(i);
        await S.radio('공병대', '부교 완성! 기갑 넘어간다!', { dur: 2.4 });
        for (const a of aliveEnemies('bh')) if (hiddenFromView(a.pos)) a.remove();
        await S.killAll('bh', 4);
      },
    },
    /* 3. 새벽 — 기갑 도하 */
    {
      setup(S) { S.player(-4, -206, 0); },
      async run(S) {
        for (const a of aliveEnemies()) a.remove();
        S.env(PY_DAWN);
        S.nvg(false); G.nvg = false;
        G.pyArmor = [];
        await S.cut(async () => {
          await S.cam(v3(PY.pont - 30, 9, -228), v3(PY.pont, 0, -100), 0); S.camFov(55);
          for (let i = 0; i < 4; i++) { const tp = i % 2 ? 'k21' : 'tank'; const v = tp === 'k21' ? new Vehicle('bmp', PY.pont, PY.south + 20 + i * 18, { team: 'ally', armed: false, invuln: true, speed: 9, yFn: onPontoon, path: [[PY.pont, -215], [PY.pont - 20 - i * 12, -228]] }) : new Vehicle('tank', PY.pont, PY.south + 20 + i * 18, { team: 'ally', armed: false, invuln: true, speed: 9, yFn: onPontoon, color: 0x4f5539, path: [[PY.pont, -215], [PY.pont - 20 - i * 12, -228]] }); v.yaw = 0; v.m.root.rotation.y = 0; G.pyArmor.push(v); }
          for (let i = 0; i < 4; i++) new Vehicle('aheli', -100 + i * 60, 260, { team: 'ally', armed: false, invuln: true, path: [[-100 + i * 60, 40, 0], [-80 + i * 50, 45, -500], [-60 + i * 40, 60, -1300]], speed: 34 });
          await S.say('공병대', '부교 이상 무! 전차 진입!', { radio: true, dur: 2.4 });
          await S.cam(v3(PY.pont - 22, 6, -222), v3(PY.pont, 1, -150), 7, (t) => t);
          await S.say('박도현 중위', '날 밝았다. 이제 우리 차례다. 평양역까지 밀어붙인다!', { dur: 3.2 });
        });
        for (const v of G.pyArmor) v.remove();
      },
    },
    /* 4. 대로 진격 */
    {
      setup(S) { S.env(PY_DAWN); S.nvg(false); S.player(0, -224, 0); },
      async run(S) {
        squad(S, [{ key: 'park', name: '박도현 중위', x: -2, z: -228 }, { key: 'lee', name: '리선우 병장', x: 3, z: -226 }, { key: 'yoon', name: '윤하린 중사', x: -4, z: -224 }, { key: 'han', name: '한지운 하사', x: 5, z: -223 }]);
        const inf = []; for (let i = 0; i < 12; i++) inf.push(ally(rand(-12, 12), -215 + i * 0.8, { hp: 160 }));
        inf.forEach((a, i) => { a.follow = { leader: S.sq.park, back: 6 + (i >> 1) * 2, side: i % 2 ? 4 + (i % 3) : -4 - (i % 3) }; });
        gunship(S);
        const arm = S.armorPush([
          { type: 'tank', x: -8, z: -232, path: [[-8, -400], [-8, PY.sq0 + 12]], speed: 5 },
          { type: 'k21', x: 8, z: -228, path: [[8, -420], [8, PY.sq0 + 16]], speed: 5, rpg: true, sam: true },
          { type: 'tank', x: 8, z: -250, path: [[8, -400], [9, PY.sq0 + 30]], speed: 5 },
          { type: 'k21', x: -8, z: -252, path: [[-8, -420], [-8, PY.sq0 + 28]], speed: 5, rpg: true },
        ], { lead: 1e9 }); // the armour does not wait for anyone: it rolls to the square at its own pace
        for (const v of arm) v.o.noDetour = true;
        const air = pyAirCover(S, arm); S.later(3, () => S.radio('항공 통제', '매 편대 상공 진입. 전차 앞길은 우리가 쓸어 준다. 전차 지나간 자리엔 아무것도 안 남긴다.', { dur: 3.4 }));
        const pastTanks = (z) => () => air.front() < z - 10; // the infantry stays behind the hulls
        for (let i = 0; i < 24; i++) enemy(pick([-1, 1]) * rand(6, 16), rand(-520, -280), { tag: 'ave', view: 100, crouch: Math.random() < 0.5, kind: Math.random() < 0.25 ? 'heavy' : 'rifle' });
        for (const [sx, z, h] of [[-1, -300, 22], [1, -380, 28], [-1, -430, 26], [1, -520, 32], [-1, -580, 24]]) { const a = enemy(sx * 20.6, z, { tag: 'snip', hold: true, view: 220, acc: 1.4, y: h, yaw: sx < 0 ? -Math.PI / 2 : Math.PI / 2 }); a.marked = true; addBox(sx * 19.2, h - 0.3, z, 2.6, 0.3, 3.4, MT.concreteD()); addBox(sx * 18.0, h, z, 0.15, 1.0, 3.4, MT.metal(), { bullet: false }); }
        const pr = S.pressure({ from: [[-90, -330], [90, -330], [-90, -480], [90, -480], [0, -620]], to: () => [rand(-14, 14), P.pos.z - rand(35, 70)], tag: 'ave', max: 16, every: 0.9, heavy: 0.25, rush: 0.25 });
        S.later(6, () => S.sayBg('윤하린 중사', '고층 창가에 저격수! 표시합니다!', { dur: 2.4 }));
        // two gunships of theirs
        S.later(46, async () => { await S.threat('heli', { x: -300, z: -700, path: [[-40, 40, -560], [40, 36, -420], [10, 42, -300], [-30, 38, -480]], line: '적 공격헬기 두 대! K21 뒤에서 대공미사일 꺼내십시오!' }); });
        S.later(52, () => { const h = new Vehicle('aheli', 300, -760, { path: [[40, 44, -600], [-30, 38, -460], [20, 40, -360]], loop: true, speed: 22, armed: true, hp: 520 }); G.pyHeli2 = h; const mk = S.every(0.25, () => { if (!h.alive) { S.sayBg('윤하린 중사', '두 번째 헬기 격추!', { dur: 1.8 }); return true; } if (!G.threatV) G.objPos = h.pos.clone(); }); });
        await S.lead('park', [
          [4, -270, { run: true, say: ['박도현 중위', '멈추지 마라! 전차 뒤에 붙어서 쏘면서 간다!'], bg: true, until: pastTanks(-270) }],
          [6, -320, { run: true, until: pastTanks(-320) }], [5, -390, { run: true, until: pastTanks(-390) }],
          [6, -450, { run: true, until: pastTanks(-450) }],
        ], { follow: ['lee', 'yoon', 'han'], label: '대로를 따라 평양역 방향으로', call: '서한준! 붙어라!' });
        // the rocket launcher that has been shelling the bridgehead
        G.strikeMode = 'arty'; S.give('desig');
        const ml = makeMLRS(62, -486, -Math.PI / 2);
        const barr = S.every(16, () => { if (!ml.alive) return true; mlrsBarrage(S, 8, { rmin: 12 }); });
        await S.radio('윤하린 중사', '다연장 발사대 확인! 오른쪽 교차로 안쪽입니다!', { dur: 2.4 });
        await S.say('박도현 중위', '서한준! 표적지시기로 찍어라! 사단 포병 불러!', { dur: 2.6 });
        S.hint('<kbd>4</kbd> 표적지시기 · 발사대를 조준하고 <kbd>좌클릭</kbd> — 포병 사격', 6);
        S.obj('다연장 발사대에 포병 사격 유도', ml.pos.clone().add(v3(0, 3, 0)));
        const mk = S.every(0.25, () => { if (ml.alive) G.objPos = ml.pos.clone().add(v3(0, 3, 0)); });
        await S.until(() => !ml.alive);
        S.stop(mk); S.stop(barr);
        await S.radio('사단 포병', '효력사 확인. 발사대 소멸.', { dur: 2.2 });
        await S.lead('park', [[6, -520, { run: true, until: pastTanks(-520) }], [5, -580, { run: true, until: pastTanks(-580) }], [4, PY.sq0 + 30, { run: true }]], { follow: ['lee', 'yoon', 'han'], label: '평양역 광장 앞까지 진격', call: '서한준! 거의 다 왔다!' });
        pr.stop(); air.stop();
        if (G.pyHeli2 && G.pyHeli2.alive) await S.until(() => !G.pyHeli2.alive);
        G.strikeMode = null;
      },
    },
    /* 5. 평양역 광장 */
    {
      setup(S) { S.env(PY_DAWN); S.nvg(false); S.player(0, PY.sq0 + 28, 0); },
      async run(S) {
        squad(S, [{ key: 'park', name: '박도현 중위', x: -3, z: PY.sq0 + 24 }, { key: 'lee', name: '리선우 병장', x: 3, z: PY.sq0 + 26 }, { key: 'yoon', name: '윤하린 중사', x: -6, z: PY.sq0 + 28 }, { key: 'han', name: '한지운 하사', x: 6, z: PY.sq0 + 29 }]);
        const SQ = PY.sq0;
        const arm = S.armorPush([
          { type: 'tank', x: -8, z: SQ + 40, path: [[-10, SQ + 14]], speed: 4 },
          { type: 'k21', x: 8, z: SQ + 36, path: [[10, SQ + 12]], speed: 4, rpg: true, sam: true },
        ], { lead: 8 });
        G.armorHold = true;
        const air = pyAirCover(S, arm, { every: 10 });
        // the square: nests, armour, and men pouring out of the station
        for (const [x, z] of [[-30, SQ - 40], [0, SQ - 52], [30, SQ - 40], [-50, SQ - 80], [50, SQ - 80]]) { sandbagRing(x, z, 2.3, 0); for (let k = 0; k < 2; k++) enemy(x - 0.8 + k * 1.6, z, { tag: 'sq', kind: 'heavy', hold: true, view: 150, hp: 280 }); }
        for (let i = 0; i < 26; i++) enemy(rand(-60, 60), rand(SQ - 110, SQ - 20), { tag: 'sq', view: 120, crouch: Math.random() < 0.5, kind: Math.random() < 0.3 ? 'heavy' : 'rifle', hold: Math.random() < 0.4 });
        const pr = S.pressure({ from: [[-60, PY.station + 20], [0, PY.station + 20], [60, PY.station + 20], [-90, SQ - 60], [90, SQ - 60]], to: () => [rand(-50, 50), rand(SQ - 90, SQ - 30)], tag: 'sq', max: 26, every: 0.8, heavy: 0.3, rush: 0.3, view: 140 });
        const dug = [[-24, SQ - 70], [24, SQ - 74]].map(([x, z]) => { sandbagRing(x, z + 4, 4.2, Math.PI); return new Vehicle('tank', x, z, { path: [[x, z + 2]], speed: 1, reload: 6, hp: 620 }); });
        G.strikeMode = 'air'; S.give('desig');
        await S.say('박도현 중위', '평양역이다! 광장에 전차가 묻혀 있다! 서한준, 공군 불러라!', { dur: 3 });
        S.obj('표적지시기로 광장 전차 공습 (0/2)');
        G.bossMusic = true; G.musicMin = 0.8;
        const mk1 = S.every(0.25, () => { const t = dug.find((v) => v.alive); G.objPos = t ? t.pos.clone().add(v3(0, 3, 0)) : null; S.obj(`표적지시기로 광장 전차 공습 (${dug.filter((v) => !v.alive).length}/2)`); });
        S.later(20, () => mlrsBarrage(S, 6, { rmin: 14 }));
        await S.until(() => dug.every((v) => !v.alive)); S.stop(mk1);
        await S.say('리선우 병장', '전차 둘 박살났슴다!', { dur: 1.8 });
        // their counterattack: BMPs out of the station's flanks
        G.armorHold = false;
        await S.radio('윤하린 중사', '역 양쪽에서 BMP 세 대! 돌격해 옵니다!', { dur: 2.4 });
        S.hint('K21 뒤에서 RPG를 꺼내세요 — 아군 전차도 함께 사격해요', 5);
        const bmps = [[-80, PY.station + 30, -20], [80, PY.station + 30, 20], [0, PY.station + 26, 0]].map(([x, z, tx], i) => new Vehicle('bmp', x, z, { path: [[tx, SQ - 60], [tx * 0.5, SQ - 20]], speed: 4.2, hp: 380 }));
        S.obj('적 BMP 격파 (0/3)');
        const mk2 = S.every(0.25, () => { const t = bmps.find((v) => v.alive); G.objPos = t ? t.pos.clone().add(v3(0, 2.5, 0)) : null; S.obj(`적 BMP 격파 (${bmps.filter((v) => !v.alive).length}/3)`); });
        await S.until(() => bmps.every((v) => !v.alive)); S.stop(mk2);
        // the last of their armour, and everyone converges
        await S.radio('사령부', '전 부대, 평양역으로! 1여단 동쪽에서, 해병 서쪽에서 진입한다!', { dur: 3 });
        const last = [[-14, PY.station + 26], [16, PY.station + 28]].map(([x, z]) => new Vehicle('tank', x, z, { path: [[x, SQ - 50]], speed: 2.6, hp: 640, reload: 7 }));
        for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) S.later(3 + i * 2.5, () => { const v = i === 1 ? new Vehicle('tank', sx * 140, SQ - 40 - i * 10, { team: 'ally', armed: true, invuln: true, speed: 6, path: [[sx * 60, SQ - 40 - i * 10], [sx * 30, SQ - 60 - i * 8]], color: 0x4f5539, reload: 5, range: 170, accurate: true, yieldPeople: false }) : S.allyBMP(sx * 140, SQ - 40 - i * 10, sx < 0 ? Math.PI / 2 : -Math.PI / 2, { invuln: true, speed: 6, path: [[sx * 60, SQ - 40 - i * 10], [sx * 34, SQ - 56 - i * 8]], sam: false, rpg: false }); v.o.yieldPeople = false; });
        for (const sx of [-1, 1]) for (let i = 0; i < 10; i++) S.later(5 + i * 0.8, () => { const a = ally(sx * 120, SQ - 50 + rand(-10, 10), { hp: 180 }); a.goTo = v3(sx * rand(20, 50), 0, rand(SQ - 90, SQ - 40)); });
        S.later(4, () => { S.radio('항공 통제', '역 전면에 폭탄 투하. 고개 숙여라.', { dur: 2.4 }); for (let i = 0; i < 3; i++) S.later(i * 0.7, () => jetPass([-700, 80, PY.station + 30 - i * 6], [700, 90, PY.station + 30 - i * 6], { speed: 280, bombs: [[-50 + i * 30, PY.station + 26], [10 + i * 20, PY.station + 28]], noPlayer: true, src: PT })); });
        S.obj('적 전차 격파 (0/2)');
        const mk3 = S.every(0.25, () => { const t = last.find((v) => v.alive); G.objPos = t ? t.pos.clone().add(v3(0, 3, 0)) : null; S.obj(`적 전차 격파 (${last.filter((v) => !v.alive).length}/2)`); });
        await S.until(() => last.every((v) => !v.alive)); S.stop(mk3);
        pr.stop(); G.strikeMode = null; air.stop();
        await S.say('박도현 중위', '쓸어버려! 광장 확보한다!', { dur: 2 });
        const t0 = G.time;
        const sweep = S.every(1.2, () => { const en = aliveEnemies('sq'); if (!en.length) return true; const a = pick(en); if (a.pos.distanceTo(P.pos) > 25 || G.time - t0 > 20) { const from = a.pos.clone().add(v3(rand(-20, 20), 3, rand(15, 30))); for (let q = 0; q < 4; q++) tracer(from, a.chest(v3()), [1, 0.6, 0.3], 400); SFX.shot('mg', a.pos); a.hurt(999, null); } });
        await S.until(() => aliveEnemies('sq').length === 0 || G.time - t0 > 45);
        S.stop(sweep); for (const a of aliveEnemies()) a.remove();
        G.bossMusic = null; G.musicMin = 0;
        await S.cut(async () => {
          const roofY = 0.8 + 48; const g0 = G.groundAt; G.groundAt = () => roofY; const fp = flagPole(0, PY.station + 2, 8, 'kr'); G.groundAt = g0;
          await S.cam(v3(10, 3, SQ - 30), v3(0, 46, PY.station), 0); S.camFov(48);
          S.music('sad');
          await S.cam(v3(4, 4, SQ - 40), v3(0, 50, PY.station), 6, (t) => t);
          await S.say('서한준', '…올라갔습니다. 평양역 위에.', { dur: 2.6 });
          await S.say('윤하린 중사', '소대장님. 볼코프 부대, 두만강 국경으로 퇴각 중입니다.', { dur: 3.2 });
          await S.say('박도현 중위', '끝은 거기서 낸다.', { dur: 2.8 });
          await S.fade(1, 2.5);
        });
      },
    },
  ],
});

/* ========== MISSION 13 「해빙」 ========== */