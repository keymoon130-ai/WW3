defMission({
  id: 'm9b', act: '3막 · 반격', num: '미션 10', title: '작전명 쌍룡-고성',
  dateText: '2032년 3월 15일 04:40', dateShort: '2032.03.15', place: '동해 · 강원도 고성 해안', placeShort: '고성', who: '에단 콜 하사 · 미 해병대', whoShort: '에단 콜',
  env: { sky: [0x3a4250, 0x7c8088, 0x989490], glow: 0xe0b080, glowDir: [0, 0.06, 1], fog: 0x7c8088, fogD: 0.0045, hemi: [0xa8b0bc, 0x484846, 0.72], sun: [0xf0d0b0, 0.6], sunDir: [0.1, 0.3, 1], snow: 0, viewDist: 120, battle: 0.4, windSnd: 0.6 },
  allyStyle: 'usmc', loadout: { weapons: ['usrifle', 'pistol'], nades: 4 },
  build(S) { buildGoseong(); },
  phases: [
    {
      setup(S) { S.player(0, 150, 0, 1.5); },
      async run(S) {
        S.fade(0, 2);
        // US Marine ACVs; we ride up in the roof hatch of ours
        const myAcv = makeACV(0x6a6448, 'B-24'); const aav = myAcv.root; aav.position.set(0, -0.3, 150); G.world.add(aav);
        const others = []; for (const [x, n] of [[-60, 'B-21'], [-35, 'B-22'], [30, 'B-25'], [55, 'B-26'], [85, 'B-27'], [-90, 'B-20']]) { const a = makeACV(0x6a6448, n).root; a.position.set(x, -0.3, 150 + rand(-10, 15)); G.world.add(a); others.push(a); }
        // the LCACs with the tanks come in behind the first wave
        const gHov = [-52, 38, 96].map((x, i) => { const h = makeHover(); h.position.set(x, 0.2, 230 + i * 14); G.world.add(h); return h; }); G.gHov = { list: gHov, token: G.token };
        G.updaters.push((dt) => { if (G.mode !== 'play') return true; for (const h of gHov) { const hp = h.position; if (hp.z > -306) { h.cs = lerp(h.cs ?? 0, Math.min(10.5, (hp.z + 306) * 0.7 + 0.3), Math.min(1, dt * 0.5)); hp.z -= h.cs * dt; hp.y = hp.z > -300 ? 0.2 + Math.sin(G.time * 2 + hp.x) * 0.1 : Math.max(0.2, G.groundAt(hp.x, hp.z) + 0.3); if (Math.random() < 0.4) particle({ x: hp.x + rand(-6, 6), y: 0.5, z: hp.z + rand(-12, 12), vx: rand(-4, 4), vy: rand(1, 3), vz: rand(2, 6), life: 1.4, size: 0.8, size1: 3, alpha: 0.45, color: [0.86, 0.9, 0.93], grav: 2 }); } h.userData.fan0.rotation.z += dt * 30; h.userData.fan1.rotation.z += dt * 30; } });
        const dds = []; for (const [x, z] of [[-140, 260], [60, 300], [220, 240]]) { const d = makeShip(150, 18, 12); d.position.set(x, 0, z); d.rotation.y = Math.PI / 2 + rand(-0.2, 0.2); G.world.add(d); dds.push(d); }
        const navalFire = S.every(0.9, () => { const d = pick(dds); const p = d.position.clone().add(v3(rand(-40, 40), 9, 0)); for (let i = 0; i < 3; i++) particle({ add: true, x: p.x, y: p.y, z: p.z, life: 0.3, size: rand(18, 34), color: [1, 0.7, 0.4] }); flashLight(p, 0xffa050, 60, 220, 0.2); SFX.shot('cannon', p); G.shake += 0.05; const t = v3(rand(-150, 150), 3, rand(-560, -440)); S.later(rand(2, 3.5), () => explode(t, { noPlayer: true, size: 2.4, dmg: 0, vdmg: 0 })); });
        G.navalFire = navalFire;
        P.ride = { obj: aav, off: [-0.25, 1.32, 1.0] }; if (myAcv.turret) myAcv.turret.position.x = 1.05; P.locked = true; P.noFire = true; P.yawLim = [0, 1.8];
        const sea = makeLoop('sea'); sea.set(0.3); const eng = makeLoop('engine'); eng.set(0.35, 0, 42); G.seaB = sea;
        let t = 0;
        G.updaters.push((dt) => { t += dt; const ground = G.groundAt(aav.position.x, aav.position.z - 3); const onLand = ground > -0.9; aav.cs = lerp(aav.cs ?? 0, aav.position.z > -318 ? (onLand ? 5 : 8) : 0, Math.min(1, dt * 0.7)); if (aav.position.z < -318 && aav.cs < 0.2) aav.cs = 0; const sp = aav.cs; aav.position.z -= sp * dt; const swellK = clamp((aav.position.z + 330) / 120, 0.3, 1); aav.position.y = onLand ? ground + 0.2 : -0.3 + (Math.sin(t * 1.4) * 0.45 + Math.sin(t * 2.3 + 1) * 0.2) * swellK; aav.rotation.x = onLand ? -0.08 : (Math.sin(t * 1.2) * 0.09 + Math.sin(t * 2.7) * 0.03) * swellK; aav.rotation.z = onLand ? 0 : Math.sin(t * 0.9 + 0.5) * 0.06 * swellK; if (!onLand && Math.sin(t * 1.2) > 0.97 && Math.random() < 0.3) { for (let i = 0; i < 14; i++) particle({ x: aav.position.x + rand(-2, 2), y: 0.8, z: aav.position.z - 4.2, vx: rand(-2, 2), vy: rand(3, 6), vz: rand(1, 4), life: 1.1, size: 0.6, size1: 2, alpha: 0.6, color: [0.88, 0.92, 0.94], grav: 7 }); G.shake += 0.08; } if (!onLand && Math.random() < 0.6) particle({ x: aav.position.x + rand(-1.5, 1.5), y: 0.2, z: aav.position.z - 4.5, vx: rand(-1, 1), vy: rand(1, 2.5), vz: rand(-1, 0.5), life: 1, size: 0.4, size1: 1.2, alpha: 0.5, color: [0.85, 0.9, 0.92], grav: 4 }); for (const o of others) { o.cs = lerp(o.cs ?? 0, o.position.z > -315 ? 8 : 0, Math.min(1, dt * 0.7)); o.position.z -= o.cs * dt; o.position.y = G.groundAt(o.position.x, o.position.z - 3) > -0.9 ? G.groundAt(o.position.x, o.position.z - 3) + 0.2 : -0.3 + Math.sin(t * 1.4 + o.position.x) * 0.2; } if (aav.position.z <= -318) return true; });
        // the destroyer sails in with the boats on the right flank, stops short of the surf and swings broadside to fire
        if (G.navalShip) { const d = G.navalShip; d.position.set(200, 0, 260); d.rotation.y = 0; G.navalGun = null;
          S.tween(46, (k) => { d.position.z = lerp(260, -150, k); }, (t) => 1 - Math.pow(1 - t, 2)).then(async () => { S.radio('구축함 존 핀', '존 핀, 사격 위치 도착. 좌현으로 선회, 함포 사격 준비.', { dur: 3 }); await S.tween(9, (k) => { d.rotation.y = k * Math.PI / 2; }); G.navalGun = v3(200 - 50, 10, -150); }); }
        // the hillside battery fires on the boats; Cobras and Ospreys go in over the top
        const bat = S.every(3.4, () => batteryFire(v3(aav.position.x + rand(-40, 40), -0.2, aav.position.z + rand(-50, 10))));
        G.batFire = bat;
        S.later(2, () => { airPass('cobra', [-30, 40, 320], [-40, 30, -700], { rockets: [[-20, -366], [10, -360]] }); airPass('cobra', [18, 42, 340], [10, 32, -700], { rockets: [[30, -368]] }); S.radio('바이퍼 2-1', '바이퍼 2-1, 해안선 사구 로켓 사격. 머리 숙여라, 블루 투.', { dur: 3 }); });
        S.later(16, () => { for (const [x, d] of [[-110, 0], [-80, 30], [-140, 50]]) airPass('osprey', [x, 70, 420 + d], [x - 60, 75, -900 + d]); S.radio('오스프리 편대', '레드 플라이트, 내륙 강하 지점으로 이동. 7번 국도 북쪽.', { dur: 3 }); });
        S.later(28, () => jetPass([-400, 120, 200], [500, 140, -900]));
        await S.say('로페즈 중위', '블루 투, 상륙 2분 전! 내리면 나만 본다. 사구까지 멈추지 마라!', { dur: 3.4 });
        await S.say('레예스 상병', '하사님, 저 배들 해안 코앞까지 들어왔습니다.', { dur: 3 });
        await S.say('에단 콜', '동해는 물이 깊어. 그래서 우리가 여기 온 거다.', { dur: 3.2 });
        await S.say('밀러 일병', '이 동네 이름이 뭐였습니까?', { dur: 2.2 });
        await S.say('에단 콜', '고성. 내가 근무했던 데서 멀지 않아.', { dur: 3 });
        const shore = S.every(0.7, () => { const p = v3(aav.position.x + rand(-50, 50), 0, aav.position.z + rand(-70, 20)); FX.splash(p, rand(2, 4)); SFX.explosion(p, 0.6); if (p.distanceTo(aav.position) < 20) G.shake += 0.25; });
        S.later(60, () => S.stop(shore));
        const mg = S.every(0.1, () => { const from = v3(rand(-40, 80), 4, -380); const to = v3(aav.position.x + rand(-10, 10), rand(0, 3), aav.position.z + rand(-20, 10)); tracer(from, to, [1, 0.5, 0.3], 450); });
        await S.until(() => aav.position.z < -300);
        S.say('로페즈 중위', '해치 연다! 전원 하차!', { dur: 2 });
        await S.until(() => aav.position.z <= -318);
        S.stop(mg); eng.stop();
        P.ride = null; P.locked = false; P.noFire = false; P.yawLim = null;
        S.player(aav.position.x + 2.5, aav.position.z - 5, 0);
      },
    },
    {
      setup(S) { S.player(2, -324, 0); },
      async run(S) {
        squad(S, [
          { key: 'lopez', name: '로페즈 중위', x: P.pos.x + 1, z: P.pos.z - 2, o: { style: 'usmc' } },
          { key: 'reyes', name: '레예스 상병', x: P.pos.x - 2, z: P.pos.z + 1, o: { style: 'usmc', kind: 'heavy' } },
          { key: 'miller', name: '밀러 일병', x: P.pos.x + 2, z: P.pos.z + 1, o: { style: 'usmc' } },
          { key: 'brooks', name: '브룩스 하사', x: P.pos.x - 1, z: P.pos.z + 2.5, o: { style: 'usmc' } },
        ]);
        for (let i = 0; i < 16; i++) { const a = ally(rand(-70, 90), rand(-325, -312), { style: 'usmc', hp: 120 }); beachRun(a, -346); }
        // LCACs beach alongside the AAVs and put Marine tanks ashore
        const gHov = (G.gHov && G.gHov.token === G.token ? G.gHov.list : [-52, 38, 96].map((x) => { const h = makeHover(); h.position.x = x; G.world.add(h); return h; })).map((h) => { h.position.set(h.position.x, G.groundAt(h.position.x, -306) + 0.3, -306); for (const t of h.userData.tanks || []) t.root.visible = false; if (h.userData.ramp) h.userData.ramp.rotation.x = -1.2; return h; });
        G.goseongTanks = [[-52, -44], [38, 30], [96, 84]].flatMap(([hx, tx]) => [-2.6, 2.6].map((dx) => [hx + dx, tx + dx * 2.4])).map(([hx, tx]) => new Vehicle('tank', hx, -308, { team: 'ally', armed: true, invuln: true, speed: 3, path: [[tx, -330], [tx, -342]], color: 0x8c7d5a, reload: 5, range: 170, accurate: true, yieldPeople: false }));
        S.later(4, () => S.radio('블루 탱크', '여기는 블루 탱크, 상륙 완료. 사구 뒤 진지 제압 들어간다!', { dur: 3 }));
        for (let i = 0; i < 24; i++) enemy(rand(-80, 100), rand(-375, -350), { tag: 'd', view: 90, crouch: Math.random() < 0.5, kind: Math.random() < 0.2 ? 'heavy' : 'rifle' });
        const dunePr = S.pressure({ from: [[-90, -420], [-30, -430], [40, -430], [100, -420]], to: () => [rand(-70, 90), rand(-372, -352)], tag: 'd', max: 18, every: 1.1, heavy: 0.2, style: 'enemy2' });
        for (const [x, z] of [[55, -373], [66, -379], [60, -387], [57, -375]]) enemy(x, z, { tag: 'bat', kind: 'rifle', hold: true, view: 140, hp: 160 });
        // men in the zig-zag trench, and the beach under mortar fire behind us
        (G.trench || []).forEach(([x, z], i) => { if (i % 2) enemy(x + rand(-2, 2), z, { tag: 'd', hold: true, crouch: true, view: 110, kind: i % 6 === 1 ? 'heavy' : 'rifle' }); });
        if (G.batFire) S.stop(G.batFire); G.batFire = S.every(3.6, () => batteryFire(v3(rand(-80, 100), -0.2, rand(-300, -260))));
        const beachArty = S.every(4.5, () => { const x = P.pos.x + rand(-35, 35), z = P.pos.z + rand(8, 30); S.arty(x, z, { dmg: 18, delay: 0.2, noAlly: true }); });
        S.later(70, () => S.stop(beachArty));
        S.obj('로페즈 중위를 따라 사구로');
        await S.lead('lopez', [
          [4, -336, { run: true, say: ['로페즈 중위', '사구 뒤로! 고개 숙여!'], bg: true }],
          [6, -344, { crouch: true }],
        ], { follow: ['reyes', 'miller', 'brooks'], label: '로페즈 중위를 따라 사구로', call: '에단 콜! 붙어라!' });
        // Reyes sets up the MG on the dune crest, Miller works forward with grenades
        moveSq(S, 'reyes', 1, -345); S.sq.reyes.hold = true; S.sq.reyes.wantCrouch = true;
        S.sayBg('레예스 상병', '기관총 거치! 사구 앞 제압합니다!', { dur: 2.4 });
        S.later(5, () => { const m = S.sq.miller; if (m && m.alive) { S.sayBg('밀러 일병', '수류탄 던집니다!', { dur: 1.8 }); const t = aliveEnemies('d').sort((a, b) => a.pos.distanceTo(m.pos) - b.pos.distanceTo(m.pos))[0]; if (t) S.later(1.2, () => explode(t.pos.clone().setY(t.pos.y + 0.3), { noPlayer: true, size: 1.2, radius: 4, dmg: 200 })); } });
        S.obj('사구 지대 적 소탕');
        await S.say('로페즈 중위', '사구 뒤에 놈들이다! 사격 개시!');
        await S.wait(8);
        await S.say('레예스 상병', '중위님! 오른쪽 언덕 위 해안포! 상륙정을 계속 때리고 있습니다!');
        // the forward observer goes up to lase the battery and is shot off the crest; his designator is ours now
        await S.say('로페즈 중위', '브룩스! 해안포 좌표 따라! 함포로 날려버린다!', { dur: 2.6 });
        const br = S.sq.brooks; let bp = v3(10, 0, -347);
        if (br && br.alive) {
          br.follow = null; br.goal = v3(10, 0, -347); br.hold = true; br.noShoot = true;
          const dsg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.32), MT.metal()); dsg.position.set(0.12, 0.2, -0.35); br.m.torso.add(dsg);
          { const t0 = G.time; await S.until(() => !br.alive || br.pos.distanceTo(br.goal) < 1.6 || G.time - t0 > 8); } br.wantCrouch = false; br.faceYaw = Math.atan2(-(61 - br.pos.x), -(-384 - br.pos.z));
          await S.sayBg('브룩스 하사', '레이저 조사 중… 거리 사백…', { dur: 2.2 }); await S.wait(2.2);
          const from = v3(58, G.groundAt(58, -392) + 2, -392); tracer(from, br.chest(v3()), [1, 0.6, 0.35], 600); SFX.shot('sniper', from);
          bp = br.pos.clone(); if (br.alive) FX.blood(br.chest(v3())); br.hero = false; br.invuln = false; br.die(); delete S.sq.brooks;
        }
        await S.say('로페즈 중위', '브룩스! …저격수다! 엎드려! 에단 콜, 브룩스 지시기 주워! 네가 찍어라!', { dur: 3.4 });
        S.obj('브룩스 하사의 표적지시기 줍기', bp.clone().add(v3(0, 0.4, 0)));
        await S.pickupWeapon(bp.x + 0.6, bp.z, 'desig', 'LD-1 표적지시기', 0.4);
        S.obj('표적지시기로 언덕 위 해안 포대에 함포 사격 요청', v3(61, G.groundAt(61, -384) + 3, -384));
        S.hint('<kbd>3</kbd> 표적지시기 · <kbd>우클릭</kbd> 조준 · <kbd>좌클릭</kbd> 사격 요청', 7);
        G.objPos = v3(61, G.groundAt(61, -384) + 3, -384);
        let hit = false; G.onExplode = (pos, o) => { if (Math.hypot(pos.x - 61, pos.z + 382) < 18 && o.src === PT && o.radius >= 10) hit = true; };
        await S.until(() => hit);
        await S.wait(2.5);
        for (const a of aliveEnemies('bat')) a.die(PT);
        G.onExplode = null;
        batteryDestroyed(); if (G.batFire) { S.stop(G.batFire); G.batFire = null; } S.stop(beachArty);
        await S.say('함포 통제', '표적 소멸 확인. 좋은 사격이었다, 해병.', { radio: true });
        dunePr.stop();
        await S.killAll('d', 2);
        S.sq.reyes.hold = false;
        await S.radio('한국 해병대', '미 해병, 여기는 한국 해병대 2중대. 서쪽에서 합류하겠습니다!');
        const krm = []; for (let i = 0; i < 8; i++) krm.push(ally(rand(-70, -50), rand(-372, -360), { style: 'rok', hp: 140 }));
        for (let i = 0; i < 30; i++) enemy(rand(-80, 90), rand(-450, -400), { tag: 'v', kind: Math.random() < 0.2 ? 'heavy' : 'rifle', view: 75, crouch: Math.random() < 0.4, style: Math.random() < 0.5 ? 'enemy2' : undefined });
        const townPr = S.pressure({ from: [[-100, -470], [-40, -475], [40, -475], [100, -470]], to: () => [rand(-60, 70), rand(-440, -405)], tag: 'v', max: 16, every: 1.3, heavy: 0.2, style: 'enemy2' });
        S.later(5, () => S.threat('tank', { x: -120, z: -480, path: [[-60, -470], [-30, -440]], hp: 600, reload: 7, who: '레예스 상병', line: '적 전차! 시가지 서쪽입니다!' }));
        const nestMen = G.nests.map(([x, z], n) => [0, 1].map((k) => enemy(x - 0.8 + k * 1.6, z, { tag: 'nest' + n, kind: k ? 'heavy' : 'rifle', hold: true, view: 140, hp: 400, acc: 1.2 })));
        await S.lead('lopez', [[8, -362, { run: true }], [12, -376, { crouch: true }]], { follow: ['reyes', 'miller'], label: '로페즈 중위를 따라 시가지 앞 사구로', call: '에단 콜! 붙어라!' });
        await S.say('로페즈 중위', '건물 사이 기관총 진지가 넷이다! 에단 콜, 하나씩 찍어라! 함포가 처리한다!', { dur: 3.4 });
        S.give('desig');
        let left = G.nests.length; S.obj(`표적지시기로 기관총 진지 지정 (0/${G.nests.length})`);
        const dead = new Set();
        G.onExplode = (pos, o) => { if (o.src !== PT || o.radius < 10) return; G.nests.forEach(([x, z], n) => { if (!dead.has(n) && Math.hypot(pos.x - x, pos.z - z) < 12) { dead.add(n); for (const a of nestMen[n]) if (a.alive) a.die(PT); left--; S.obj(`표적지시기로 기관총 진지 지정 (${G.nests.length - left}/${G.nests.length})`); S.sayBg('함포 통제', pick(['표적 소멸.', '명중 확인. 다음 표적.', '진지 제거 확인.']), { radio: true, dur: 1.8 }); } }); };
        const mk = S.every(0.3, () => { const n = G.nests.findIndex((_, k) => !dead.has(k)); G.objPos = n >= 0 ? v3(G.nests[n][0], G.groundAt(G.nests[n][0], G.nests[n][1]) + 1.5, G.nests[n][1]) : null; });
        await S.until(() => left <= 0);
        S.stop(mk); G.onExplode = null;
        await S.say('로페즈 중위', '진지 전부 날아갔다! 시가지로 들어간다! 한국 해병은 왼쪽 건물, 우리가 오른쪽이다!', { dur: 3.4 });
        krm.forEach((a, i) => { a.goTo = v3(-50 + (i >> 1) * 12, 0, -404 - (i % 2) * 6); });
        S.later(3, () => { const tg = aliveEnemies('v').slice(0, 3).map((e) => [e.pos.x, e.pos.z]); airPass('cobra', [-60, 36, -150], [-20, 30, -900], { rockets: tg.length ? tg : [[-20, -430]] }); S.radio('바이퍼 2-1', '바이퍼 2-1, 시가지 진입로 정리한다.', { dur: 2.6 }); });
        // armour leads into the town; everyone moves behind the hulls
        S.armorPush([
          { type: 'k21', x: -35, z: -360, path: [[-35, -392], [-35, -420], [-33, -446]] },
          { type: 'k21', x: 15, z: -362, path: [[15, -392], [15, -420], [14, -448]], rpg: true },
          { type: 'tank', x: 62, z: -358, path: [[62, -392], [62, -420], [60, -446]], color: 0x8c7d5a },
          { type: 'tank', x: -10, z: -352, path: [[-8, -380], [-4, -392]], color: 0x8c7d5a },
          { type: 'k21', x: 40, z: -350, path: [[40, -380], [44, -392]] },
        ], { lead: 14 });
        if (G.goseongTanks) G.goseongTanks.forEach((t) => { t.armed = true; });
        await S.lead('lopez', [
          [16, -378, { run: true, say: ['로페즈 중위', '장갑차 뒤로! 붙어서 간다!'], bg: true }], [16, -398, { fight: 'v', leave: 14, crouch: true }],
          [16, -424, { fight: 'v', leave: 6, crouch: true }], [12, -446, { fight: 'v', leave: 2 }],
        ], { follow: ['reyes', 'miller'], label: '로페즈 중위를 따라 시가지 소탕', call: '에단 콜! 따라와라!' });
        townPr.stop();
        await S.killAll('v', 2);
        await S.say('한국 해병대 소대장', '반갑습니다, 콜 하사. 영어가 짧습니다.', { dur: 3 });
        await S.say('에단 콜', '괜찮습니다. 저도 한국어 조금 합니다. 7번 국도, 함께 가겠습니다.', { dur: 3.5 });
        await S.say('로페즈 중위', '좋다. 교량으로 이동!', { dur: 2 });
      },
    },
    {
      setup(S) { S.player(0, -460, 0); squad(S, [{ key: 'lopez', name: '로페즈 중위', x: 1, z: -462, o: { style: 'usmc' } }, { key: 'reyes', name: '레예스 상병', x: -3, z: -458, o: { style: 'usmc', kind: 'heavy' } }, { key: 'miller', name: '밀러 일병', x: 3, z: -458, o: { style: 'usmc' } }]); },
      async run(S) {
        if (S.cpGet() < 1) {
        for (let i = 0; i < 14; i++) enemy(rand(-35, 35), rand(-495, -476), { tag: 'br', view: 75, kind: Math.random() < 0.25 ? 'heavy' : 'rifle' });
        await S.lead('lopez', [[0, -466, { crouch: true }], [-2, -472, { fight: 'br', leave: 1 }]], { follow: ['reyes', 'miller'], label: '로페즈 중위를 따라 7번 국도 교량 확보', call: '에단 콜! 다리로 와라!' });
        await S.killAll('br', 1);
        await S.say('로페즈 중위', '다리 확보. 레예스, 다리 서쪽 끝에 기관총! 밀러는 남쪽 난간!', { dur: 3 });
        moveSq(S, 'reyes', -8, -474); moveSq(S, 'miller', 4, -468); moveSq(S, 'lopez', -2, -470);
        await S.say('에단 콜', '북쪽에서 내려오는 보급 차량, 여기서 전부 끊는다.');
        S.ammoCrate(-6, -466);
        let killed = 0; const need = 5; const trucks = [];
        S.obj(`적 보급 차량 격파 (0/${need})`);
        const send = (i) => { const tz = -480 + (i % 2 ? 2.5 : -2.5); const tr = new Vehicle('truck', 420 + i * 26, tz, { path: [[60, tz], [-300, tz]], speed: 9, armed: false, hp: 160, yFn: (x, z) => Math.abs(x) < 9 ? 2.1 : G.groundAt(x, z), onDeath: () => { killed++; S.obj(`적 보급 차량 격파 (${Math.min(killed, need)}/${need})`); }, onHurt: (v) => { if (!v.unloaded && v.hp < 100) { v.unloaded = true; v.stopped = true; for (let k = 0; k < 3; k++) enemy(v.pos.x + rand(-2, 2), v.pos.z + 3, { tag: 'cv', goTo: [rand(-10, 10), -470] }); } } }); trucks.push(tr); };
        for (let i = 0; i < need; i++) S.later(i * 6, () => send(i));
        S.later(12, () => new Vehicle('bmp', 380, -480, { path: [[40, -480]], speed: 6, yFn: (x, z) => G.groundAt(x, z) }));
        await S.until(() => killed >= need || trucks.some((t) => t.alive && t.pos.x < -120));
        if (killed < need) { await S.wait(0.5); if (trucks.some((t) => t.alive && t.pos.x < -120)) { S.fail('적 보급 차량이 교량을 통과했어요. 차량을 다리 앞에서 막으세요.'); await S.wait(999); } }
        await S.killAll('cv', 2);
        S.cp(1);
        } else { moveSq(S, 'reyes', -8, -474); moveSq(S, 'miller', 4, -468); moveSq(S, 'lopez', -2, -470); }
        // finale: an armoured column tries to force the bridge
        await S.say('레예스 상병', '동쪽! 기갑 종대입니다! BMP 둘, 전차 하나! 보병 하차 중!', { dur: 3 });
        await S.say('로페즈 중위', '다리 못 넘기게 막아! 에단 콜, 노획한 로켓 써라! 바이퍼 불러놨다!', { dur: 3.2 });
        const gotAT = S.pickupWeapon(-4, -463, 'rpg', '노획 대전차 로켓', 0.5); S.ammoCrate(4, -464);
        const yF = (x, z) => Math.abs(x) < 9 ? 2.1 : G.groundAt(x, z);
        const col = [
          new Vehicle('bmp', 260, -481, { path: [[70, -481], [34, -481]], speed: 7, hp: 420, yFn: yF }),
          new Vehicle('tank', 300, -479, { path: [[130, -479], [98, -479]], speed: 5, hp: 700, reload: 8, yFn: yF }),
          new Vehicle('bmp', 340, -482, { path: [[110, -482], [72, -482]], speed: 7, hp: 420, yFn: yF }),
        ];
        S.obj('다리 옆 노획 대전차 로켓 줍기', v3(-4, G.groundAt(-4, -463) + 0.5, -463));
        gotAT.then(() => S.obj('7번 국도 교량 사수 · 적 기갑 종대 저지', v3(80, 4, -480)));
        const fin = S.every(1.4, () => { if (aliveEnemies('fin').length < 12) { const x = rand(60, 130); enemy(x, -480 + rand(-14, 14), { tag: 'fin', view: 90, kind: Math.random() < 0.3 ? 'heavy' : 'rifle' }); } });
        const finArty = S.every(5, () => { const x = rand(-12, 12), z = rand(-492, -468); S.arty(x, z, { dmg: 15, delay: 0.15, noAlly: true }); });
        S.later(22, () => { S.radio('바이퍼 2-1', '바이퍼 2-1, 교량 동쪽 차량 종대 확인. 로켓 사격 들어간다!', { dur: 3 }); airPass('cobra', [-160, 34, -440], [520, 30, -520], { rockets: col, vdmg: 900 }); S.later(1.2, () => airPass('cobra', [-170, 38, -500], [520, 34, -450], { rockets: col, vdmg: 900 })); });
        S.later(40, () => { jetPass([-300, 90, -420], [700, 110, -540], { bombs: [[140, -480], [180, -478], [220, -482]], noPlayer: true }); for (const v of col) if (v.alive) explode(v.pos.clone(), { radius: 6, dmg: 200, vdmg: 9999, size: 2.4, noPlayer: true }); });
        await S.until(() => col.every((v) => !v.alive));
        S.stop(fin); S.stop(finArty);
        await S.say('레예스 상병', '종대 전멸! 다리 건너온 놈 없습니다!', { dur: 2.4 });
        await S.killAll('fin', 3);
        S.later(1, () => { for (const [x, d] of [[-60, 0], [-30, 40], [-90, 60]]) airPass('osprey', [x, 60, -200 - d], [x + 40, 70, -1100 - d], { tilt: 0.9 }); });
        await S.say('로페즈 중위', '레드 플라이트가 북쪽에 내렸다. 이제 국도는 우리 거다.', { dur: 3 });
        await S.radio('로페즈 중위', '여기는 블루 투. 7번 국도 차단. 동해 확보했습니다.');
        await S.radio('사령부', '블루 투, 수고했다. 작전 성공. 전 부대, 서울로 진격하라. 사령부 이상.', { dur: 4 });
        if (G.navalFire) S.stop(G.navalFire); if (G.seaB) G.seaB.stop();
        await S.fade(1, 2);
      },
    },
  ],
});

/* =====================================================================
   shared: ambush groups along a vehicle run
   kill at least one and the column behind finishes them; ignore them and their AT man fires
   ===================================================================== */