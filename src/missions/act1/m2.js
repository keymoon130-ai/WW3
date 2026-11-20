function buildCity(o = {}) {
  G.groundAt = (x, z) => Math.sin(x * 0.01) * 0.3 + Math.sin(z * 0.013) * 0.3;
  buildTerrain(700, 140, o.snow === false ? 'concrete' : 'snowdirt', 6);
  buildMountains(650, 30, 0x8c949c, 70, 160);
  // main street x=0 (N-S), cross streets z=-100, -40, 20
  roadStrip(0, -60, 16, 360); roadStrip(0, -100, 16, 260, Math.PI / 2); roadStrip(0, -40, 14, 260, Math.PI / 2); roadStrip(0, 20, 14, 260, Math.PI / 2);
  const blocks = [];
  for (const bx of [-1, 1]) for (const [z0, z1] of [[-170, -110], [-90, -50], [-30, 10], [30, 80]]) for (const [x0, x1] of [[10, 52], [62, 110]]) {
    const xa = bx * x0, xb = bx * x1, cx = (xa + xb) / 2, cz = (z0 + z1) / 2, w = Math.abs(xb - xa), d = z1 - z0;
    blocks.push([cx, cz, w, d]);
  }
  for (const [cx, cz, w, d] of blocks) {
    // 2-3 buildings per block, leaving alleys
    const n = w > 40 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const bw = w / n - 6, bxx = cx - w / 2 + (i + 0.5) * (w / n); const bd = d - 8;
      const h = rand(9, 22); const ruin = Math.random() < 0.35;
      building(bxx, cz, bw, bd, h, { ruin, fire: Math.random() < 0.3 ? (Math.random() < 0.4 ? 2 : 1) : 0, snowRoof: o.snow !== false, lit: 0.02, broken: 0.4 });
    }
  }
}
function cityProps() {
  for (let i = 0; i < 26; i++) { const x = pick([-1, 1]) * rand(3, 7.5), z = rand(-170, 70); if (Math.abs(z) < 14) continue; if (Math.random() < 0.5) carProp(x, z, rand(-0.3, 0.3) + (Math.random() < 0.5 ? 0 : Math.PI), pick([0x4a5560, 0x6a2a2a, 0x2a3a5a, 0x777777, 0x2d2d2d]), Math.random() < 0.5, Math.random() < 0.2); else rubble(x, z, rand(0.7, 1.2)); }
  for (let i = 0; i < 16; i++) { const x = rand(-110, 110), z = pick([-100, -40, 20]) + rand(-5, 5); if (Math.abs(x) < 12) continue; if (Math.random() < 0.6) carProp(x, z, Math.PI / 2 + rand(-0.3, 0.3), pick([0x4a5560, 0x6a2a2a, 0x2a3a5a]), Math.random() < 0.6); else rubble(x, z); }
  for (let z = -160; z < 80; z += 22) { lampPost(-8.6, z, Math.random() < 0.3); lampPost(8.6, z + 11, Math.random() < 0.3); }
}

/* ---- set-piece helpers for the siege ---- */
// fast jet pass: flies a straight line, drops bombs on targets it crosses
function jetPass(from, to, o = {}) {
  const j = makeJetMesh(o.color); const a = v3(...from), b = v3(...to); j.root.position.copy(a); j.root.lookAt(b); j.root.rotateY(Math.PI); G.world.add(j.root);
  const L = a.distanceTo(b), sp = o.speed ?? 150; let t = 0, roared = false;
  for (const [bx, bz, by] of o.bombs || []) { // time when the jet is over the target, plus fall time
    const k = clamp(((bx - a.x) * (b.x - a.x) + (bz - a.z) * (b.z - a.z)) / (L * L), 0, 1);
    setGameTimeout(() => { const p = v3(bx, by ?? G.groundAt(bx, bz) + 0.5, bz); SFX.whistle(p); setGameTimeout(() => { explode(p, { radius: 9, dmg: o.dmg ?? 220, vdmg: o.vdmg ?? 400, size: 2.6, noPlayer: !!o.noPlayer, noAlly: !!o.noAlly, src: o.src || null }); addEmitter(p.clone().add(v3(0, 1, 0)), 'fire', 1.2, 18, 40); addEmitter(p.clone().add(v3(0, 3, 0)), 'smoke', 1, 2, 60); }, 0.9); }, (k * L) / sp + 0.3);
  }
  G.updaters.push((dt) => {
    t += dt; const k = Math.min(1, (t * sp) / L); j.root.position.lerpVectors(a, b, k);
    if (!roared && j.root.position.distanceTo(P.pos) < 1200) { roared = true; j.voice = jetVoice(); }
    if (j.voice) j.voice.update(j.root.position, dt);
    if (Math.random() < 0.6) particle({ x: j.root.position.x, y: j.root.position.y, z: j.root.position.z, life: 0.6, size: 1.5, size1: 3, alpha: 0.15, color: [0.8, 0.8, 0.8] });
    if (k >= 1 || G.mode !== 'play') { G.world.remove(j.root); if (j.voice) j.voice.stop(); return true; }
  });
  return j;
}
// parachute illumination flare drifting down over the street
function illumFlare(x, z) {
  const y0 = 70; const g = glow(x, y0, z, 0xfff0c8, 4); let y = y0, t = 0; SFX.shot('pistol', v3(x, 2, z + 20));
  G.updaters.push((dt) => { t += dt; y -= dt * 2.2; g.position.set(x + Math.sin(t * 0.7) * 2, y, z); if (Math.random() < 0.5) particle({ x: g.position.x, y: g.position.y, z: g.position.z, vy: 0.4, life: 2.5, size: 0.8, size1: 2.4, alpha: 0.25, color: [0.85, 0.85, 0.82] }); if (t % 0.5 < dt) flashLight(g.position, 0xfff0d0, 14, 90, 0.55); if (y < 8) { g.visible = false; G.world.remove(g); return true; } });
}

/* ========== MISSION 2 「잿빛 여섯 시간」 ========== */
defMission({
  id: 'm2', act: '1막 · 국경 붕괴', num: '미션 2', title: '잿빛 여섯 시간',
  dateText: '2032년 1월 2일 06:40', dateShort: '2032.01.02', place: '함경북도 회령 시가지', placeShort: '회령 시가지', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: Object.assign({}, ENV.overcast, { snow: 0.35, ash: false, fogD: 0.008, viewDist: 110, exposure: 1.12, battle: 0.45 }),
  loadout: { weapons: ['rifle', 'sniper', 'pistol'], nades: 4 },
  bounds: [-105, -160, 105, 75],
  build(S) {
    buildCity();
    cityProps();
    // defensive plaza at z=0
    for (const x of [-12, -4, 4, 12]) sandbags(x, -10, 6, 0);
    sandbags(-17, -5, 6, Math.PI / 2); sandbags(17, -5, 6, Math.PI / 2);
    jersey(-6, -18, 5, 0.2); jersey(7, -20, 5, -0.2); jersey(0, -28, 6, 0);
    sandbagRing(-25, -32, 2.6, Math.PI / 2); sandbagRing(26, -32, 2.6, Math.PI / 2);
    room(-14, 12, 8, 6, 3, [{ side: 'n', at: 0, w: 1.4 }, { side: 'e', at: 0, w: 1.2, y0: 1, y1: 1.9 }], { floor: true });
    // command post: two more storeys on top of the ground-floor room, built as one group so it can come down
    { const cp = new THREE.Group(); cp.position.set(-14, G.groundAt(-14, 12) + 3, 12); G.world.add(cp); const wm = MT.concrete(), dk = mat('cpwin', { color: 0x1a1c1e, rough: 0.3 });
      for (let f = 0; f < 2; f++) { const y = f * 3; const sl = new THREE.Mesh(boxGeo(8.4, 0.3, 6.4), wm); sl.position.y = y; cp.add(sl);
        for (const [w, d, x, z] of [[8.4, 0.25, 0, -3.1], [8.4, 0.25, 0, 3.1], [0.25, 6.4, -4.1, 0], [0.25, 6.4, 4.1, 0]]) { const wl = new THREE.Mesh(boxGeo(w, 2.7, d), wm); wl.position.set(x, y + 1.5, z); wl.castShadow = true; cp.add(wl); }
        for (let i = 0; i < 3; i++) { const wn = new THREE.Mesh(boxGeo(1.2, 1.1, 0.3), dk); wn.position.set(-2.6 + i * 2.6, y + 1.7, -3.15); cp.add(wn); } }
      const rf = new THREE.Mesh(boxGeo(8.6, 0.35, 6.6), MT.concreteD()); rf.position.y = 6; cp.add(rf);
      for (let i = 0; i < 2; i++) { const an = new THREE.Mesh(boxGeo(0.06, 4, 0.06), MT.metal()); an.position.set(-2 + i * 3, 8, 1); cp.add(an); }
      G.cmdPost = cp; }
    tent(14, 12, 5, 6, 0);
    S.ammoCrate(-4, 6);
    G.plazaFlag = flagPole(-20, 2, 8, 'kr');
    // rubble where han-jun is trapped
    rubble(30, -44, 1.4); rubble(33, -46, 1);
    // fires along the approach so attackers are silhouetted
    for (const [x, z] of [[-9, -58], [10, -66], [-24, -42], [26, -45], [-6, -88], [40, -38], [-42, -40]]) { addEmitter(v3(x, 0.6, z), 'fire', 0.8, 12); glow(x, 1.2, z, 0xff8a3a, 2.4); }
    squad(S, [
      { key: 'kang', name: '강태현 상사', x: -2, z: -6, yaw: 0, o: { hold: true, crouch: true } },
      { key: 'lee', name: '리선우 병장', x: 6, z: -7, yaw: 0, o: { hold: true, crouch: true } },
      { key: 'yoon', name: '윤하린 중사', x: -10, z: -7, yaw: 0, o: { hold: true, crouch: true } },
      { key: 'han', name: '한지운 하사', x: 2, z: -8, yaw: 0, o: { hold: true, crouch: true } },
    ]);
    G.m2allies = [];
    for (const [x, z] of [[-15, -7], [12, -8], [-24, -29], [25, -29], [-8, -8], [16, -6]]) { const a = ally(x, z, { hold: true, hp: 200 }); a.wantCrouch = true; G.m2allies.push(a); }
  },
  phases: [
    {
      setup(S) { S.player(0, -2, 0); },
      async run(S) {
        S.clock('작전 시각', '06:40');
        await S.say('강태현 상사', '자, 들어라. 다리는 무너졌지만 놈들은 얼음 위로 부교를 깔고 넘어오고 있다.');
        await S.say('강태현 상사', '증원군이 올 때까지 이 광장을 지킨다. 여섯 시간이다.');
        await S.say('윤하린 중사', '드론 띄웠습니다. 북쪽 큰길과 양쪽 골목으로 보병 접근 중입니다.');
        await S.say('리선우 병장', '회령은 제 고향 바로 옆임다. 여긴 한 발짝도 못 내줍꾸마.');
        await S.say('윤하린 중사', '…통일 석 달 만입니다. 완충지대가 사라지고 우리랑 미군이 국경에 붙으니까, 베이징이랑 모스크바가 그걸 못 참은 겁니다.', { dur: 4.6 });
        await S.say('강태현 상사', '이유는 나중에 따진다. 서한준.');
        await S.say('강태현 상사', '다리 날린 거 들었다. 그 다리에서 너 끌어낸 게 우리 분대다. 오늘부터 너도 3분대다.', { dur: 3.8 });
        await S.say('한지운 하사', '막내, 내 옆에만 붙어 있어라. 머리 들지 말고.', { dur: 3 });
        await S.say('서한준', '…예, 알겠습니다.', { dur: 2 });
      },
    },
    {
      setup(S) { S.player(0, -4, 0); },
      async run(S) {
        // attackers come out of the side streets and alleys 40-80 m out, not from the far end of the avenue
        const ALLEY = [[-9, -96], [9, -98], [-62, -40], [62, -42], [-70, -38], [70, -36], [-32, -104], [32, -104]];
        const NEAR = [[-8, -48], [8, -52], [-18, -44], [18, -46], [0, -60], [-12, -70], [12, -72], [-28, -40], [28, -40]];
        const roofs = [[-20.5, -70], [20.5, -70], [-41.5, -70], [41.5, -70], [-20.5, -130], [20.5, -130]].map(([x, z]) => [x, z, floorAt(x, z, 60)]).filter((r) => r[2] > 6);
        const roofMen = (n, tag) => { for (let i = 0; i < n && roofs.length; i++) { const [x, z, y] = pick(roofs); enemy(x + rand(-3, 3), z + 6 + rand(-1, 1), { tag, y, hold: true, view: 120, crouch: Math.random() < 0.5 }); } };
        const mortars = (sec) => { const m = S.every(2.6, () => { const a = rand(0, TAU), d = rand(10, 26); S.arty(P.pos.x + Math.cos(a) * d, P.pos.z + Math.sin(a) * d - 6); }); S.later(sec, () => S.stop(m)); };
        let rpgB = false; const rpgBox = () => { if (rpgB) return; rpgB = true; addBox(4, G.groundAt(4, 6), 6, 1.4, 0.5, 0.6, mat('rpgbox', { color: 0x3c4430 }), { dynamic: true }); S.station(v3(4, G.groundAt(4, 6) + 0.8, 6), '대전차 로켓 챙기기', () => { giveWeapon('rpg', true); if (P.ammo.rpg) P.ammo.rpg.res = Math.max(P.ammo.rpg.res, 3); }, 2.2); S.hint('광장 상자에서 대전차 로켓을 챙기세요 <kbd>F</kbd> · 노란 마름모', 5); G.atBox = v3(4, G.groundAt(4, 6) + 1.2, 6); };
        const armour = (type, x, z, path, o = {}) => new Vehicle(type, x, z, Object.assign({ path, speed: type === 'tank' ? 3 : 4.2, tag: 'arm' }, o));
        const clearWave = (tag, left = 3) => S.until(() => aliveEnemies(tag).length <= left && !G.vehicles.some((v) => v.alive && v.team === 'enemy' && !v.air && v.type !== 'truck'));
        // no waves: the attack just keeps coming, and grows by the hour
        const pr = S.pressure({ from: ALLEY, to: NEAR, tag: 'w', max: 7, every: 1.3, heavy: 0.12, rush: 0.12 });
        const hourT = 22; const hours = ['07:00', '08:00', '09:00', '10:00', '11:00'];
        S.obj('회령 광장 사수');
        S.hint('적은 양쪽 골목과 옥상에서 나와요 · 쓰러진 적 위를 지나가면 탄약 · 광장 탄약 상자 <kbd>F</kbd>', 6);
        const start = S.cpGet();
        if (start > 0) { S.clock('사수 시간', hours[Math.min(start, 4)] || '12:00'); S.sayBg('강태현 상사', '다시 한번! 진지 지켜라!', { dur: 2 }); }
        if (start >= 3) rpgBox();
        for (let i = start; i < 5; i++) {
          S.cp(i);
          S.clock('사수 시간', hours[i]); pr.set(7 + i * 2);
          if (i === 0) { illumFlare(-6, -70); S.later(9, () => illumFlare(10, -55)); await S.wait(hourT); }
          if (i === 1) { roofMen(4, 'w'); mortars(40); S.sayBg('윤하린 중사', '옥상! 북쪽 건물 옥상에 저격수입니다!', { dur: 2.6 }); await S.wait(hourT); }
          if (i === 2) {
            rpgBox(); await S.threat('bmp', { x: -3, z: -190, path: [[-3, -110], [-4, -62]], line: '장갑차! BMP 한 대, 북쪽 큰길입니다!' });
            await S.say('한지운 하사', '서한준, 괜찮냐? 손 떨리는 건 다 똑같다. 숨 쉬고, 다시 쏴.', { dur: 3.4 });
          }
          if (i === 3) {
            roofMen(3, 'w');
            const heliP = S.threat('heli', { x: -260, z: -220, path: [[-60, 38, -110], [40, 34, -60], [70, 40, 30], [-40, 36, 20], [-70, 38, -80], [60, 40, -120]], line: '공격 헬기 접근! 엄폐하십시오!' });
            S.later(6, async () => {
              S.sayBg('강태현 상사', '아군 전차다! K2 들어온다!', { dur: 2.4 });
              const k2 = new Vehicle('tank', 0, 70, { team: 'ally', path: [[0, 20], [0, -4]], speed: 4, color: 0x4f5539, accurate: true, reload: 7, hp: 900, yieldPeople: false });
              await S.wait(22);
              if (k2.alive) { const from = v3(-40, 40, -60); new Proj('missile', from, v3().subVectors(k2.pos.clone().add(v3(0, 1, 0)), from).normalize().multiplyScalar(80), { team: 'enemy' }); await S.wait(1.4); if (k2.alive) k2.die(); }
              S.sayBg('리선우 병장', 'K2 당했슴다!', { dur: 2 });
            });
            await heliP; await S.wait(3);
          }
          if (i === 4) {
            rpgBox(); roofMen(4, 'w'); mortars(50);
            S.sayBg('윤하린 중사', '고속 접근, 전투기입니다!', { dur: 2.2 });
            jetPass([-500, 110, -70], [500, 90, -70], { bombs: [[-20, -70], [22, -72]], noPlayer: true });
            S.later(14, () => jetPass([480, 120, -130], [-480, 100, 20], { bombs: [[30, -95], [-10, -45]], noPlayer: true }));
            await S.wait(6);
            await S.threat('tank', { x: 0, z: -210, path: [[0, -120], [0, -80]], hp: 560, reload: 9, who: '강태현 상사', line: '전차다! 로켓 가진 놈 앞으로!' });
          }
        }
        pr.stop();
        // ---- 12:00 — everything they have ----
        S.cp(5);
        S.clock('사수 시간', '12:00');
        await S.radio('윤하린 중사', '북쪽에서 전차 셋, 장갑차 셋, 헬기 둘! 보병은… 셀 수가 없습니다!', { dur: 3.4 });
        await S.radio('사령부', '3분대, 증원군은 아직 남쪽 30킬로미터다. 최대한 버텨라.', { dur: 3 });
        S.obj('최후의 공세 — 버텨라');
        G.bossMusic = true;
        for (let k = 0; k < 3; k++) S.later(k * 7, () => armour('tank', [-5, 5, 0][k], -200 - k * 15, [[[-5, 5, 0][k], -120], [[-5, 5, 0][k] * 1.4, -62 - k * 6]], { reload: 9, hp: 600 }));
        for (let k = 0; k < 3; k++) S.later(4 + k * 8, () => armour('bmp', [-40, 40, 0][k], -200, [[[-40, 40, 0][k], -110], [[-14, 14, -3][k], -58]]));
        for (let k = 0; k < 2; k++) S.later(10 + k * 12, () => new Vehicle('aheli', k ? 300 : -300, -260, { path: [[k ? 60 : -60, 40, -120], [k ? -40 : 40, 36, -40], [k ? 70 : -70, 40, 10], [k ? -60 : 60, 38, -90]], loop: true, speed: 22, armed: true, hp: 520 }));
        S.later(20, () => jetPass([-500, 100, -110], [500, 90, -20], { bombs: [[-30, -100], [0, -80], [25, -50]], noPlayer: true }));
        const final = S.every(1.2, () => { if (aliveEnemies('fin').length < 22) S.wave({ n: 3, from: ALLEY, to: NEAR.concat([[-6, -30], [6, -32], [0, -36]]), tag: 'fin', heavy: 0.25, rush: 0.3, interval: 0.4 }); });
        S.later(20, () => { for (const a of G.m2allies) if (a.alive && Math.random() < 0.6) a.die(); });
        await S.timer(45, '증원군 도착까지');
        S.stop(final);
        // ---- the city falls ----
        await S.say('강태현 상사', '공세가 너무 거세다! 철수해! 회령을 포기한다!', { dur: 2.8 });
        S.later(1, () => {
          explode(v3(-14, G.groundAt(-14, 12) + 4, 9), { noPlayer: true, size: 3, radius: 6, dmg: 0, vdmg: 0 });
          const cp = G.cmdPost; tweenObj(cp, { p: [cp.position.x + 1, cp.position.y - 7, cp.position.z + 1], r: [0.25, 0.1, -0.2] }, 2.2, (t) => t * t);
          for (let i = 0; i < 4; i++) S.later(i * 0.4, () => FX.dust(v3(-14 + rand(-4, 4), G.groundAt(-14, 12) + 2, 12 + rand(-3, 3)), 40, [0.62, 0.6, 0.56], 3));
          S.later(2.3, () => { rubble(-14, 12, 1.6); rubble(-10, 15, 1.1); addEmitter(v3(-14, 2, 12), 'smoke', 1.4, 3, 120); });
          S.shake(1.2); S.sayBg('리선우 병장', '지휘소 무너짐다!', { dur: 2 });
        });
        followMode(S, ['kang', 'lee', 'yoon', 'han']);
        const tr1 = truckProp(-3, 60, 0, 0x4d5340); truckProp(5, 64, 0.1, 0x4d5340);
        const shelling = S.every(1.4, () => { const a = rand(0, TAU), d = rand(9, 22); S.arty(P.pos.x + Math.cos(a) * d, P.pos.z + Math.sin(a) * d, { dmg: 60 }); });
        S.later(4, () => jetPass([500, 90, 40], [-500, 80, -10], { bombs: [[18, 30], [-25, 22], [0, -20]], noPlayer: true }));
        // everyone runs for the trucks; not everyone makes it
        const runners = G.m2allies.filter((a) => a.alive); runners.forEach((a, k) => { a.hold = false; a.follow = null; a.state = 'idle'; a.goal = v3(rand(-6, 6), 0, 50 + k); a.speed = 5.4; });
        S.later(3, () => { const a = runners[0]; if (a && a.alive) { explode(a.pos.clone().add(v3(0.5, 0.3, 0)), { noPlayer: true, size: 1.6, radius: 4, dmg: 500, vdmg: 0 }); } });
        S.later(7, () => { const a = runners[2]; if (a && a.alive) { a.hurt(999); } });
        S.later(10, () => { const a = runners[4]; if (a && a.alive) { explode(a.pos.clone(), { noPlayer: true, size: 1.4, radius: 3, dmg: 500, vdmg: 0 }); } });
        await S.reach([0, 55], 5, '남쪽 후퇴 트럭으로 뛰어라');
        S.stop(shelling); G.bossMusic = null;
        for (const v of G.vehicles) if (v.alive && v.team === 'enemy') v.stopped = true;
        // looking back from the truck bed
        await S.cut(async () => {
          for (const a of aliveEnemies()) if (a.pos.z > -30) a.remove();
          const fp = flagPole(-20, -4, 9, 'enemy'); const yTop = fp.position.y; fp.position.y = G.groundAt(-20, -4) + 1.5;
          for (let i = 0; i < 6; i++) { const a = enemy(-20 + rand(-6, 6), -4 + rand(-5, 5), { passive: true, noShoot: true }); a.state = 'idle'; }
          if (G.plazaFlag) G.plazaFlag.visible = false;
          const tk = new Vehicle('truck', -1.5, 24, { team: 'ally', armed: false, invuln: true, speed: 3, path: [[-1.5, 160]], yieldPeople: false, collide: false });
          const look = v3(-18, 5.5, -4);
          await S.cam(tk.pos.clone().add(v3(0.6, 2.3, -3.9)), look, 0);
          S.music('sad');
          const t0 = G.time;
          G.updaters.push(() => { if (!G.cut) return true; const k = G.time - t0; G.cut.pos.copy(tk.pos).add(v3(0.6, 2.3 + Math.sin(k * 9) * 0.03, -3.9)); G.cut.look.copy(look); });
          await S.tween(6, (k) => { fp.position.y = lerp(G.groundAt(-20, -4) + 1.5, yTop, k); });
          await S.say('리선우 병장', '…회령이 넘어갔슴다.', { dur: 3.2 });
          await S.say('강태현 상사', '…', { dur: 1.6 });
          await S.fade(1, 2.2);
        });
      },
    },
  ],
});

/* ---------------- village ---------------- */