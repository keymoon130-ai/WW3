defMission({
  id: 'm9', act: '3막 · 반격', num: '미션 9', title: '작전명 쌍룡-인천',
  dateText: '2032년 3월 15일 04:40', dateShort: '2032.03.15', place: '서해 · 인천항 상륙 해안', placeShort: '인천', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: { sky: [0x262c36, 0x5c6068, 0x76726e], glow: 0xc88a60, glowDir: [0.3, 0.02, 1], fog: 0x60646c, fogD: 0.005, hemi: [0x9aa2b0, 0x444444, 0.78], sun: [0xe0b090, 0.5], sunDir: [0.3, 0.2, 1], snow: 0, viewDist: 120, battle: 0.4, windSnd: 0.6, exposure: 1.25 },
  loadout: { weapons: ['rifle', 'pistol'], nades: 4 },
  build(S) { buildIncheon(); },
  phases: [
    /* --- 1부 서해 --- */
    {
      setup(S) { S.player(0, 200, 0, 0.4); },
      async run(S) {
        // ---- the fleet ----
        const LX = -20, LZ = 430; const lhd = makeLHD(); lhd.position.set(LX, 0, LZ); G.world.add(lhd); const STERN = LZ - lhd.userData.L / 2;
        for (let i = 0; i < 4; i++) S.later(6 + i * 7, () => new Vehicle('heli', -190 + rand(-20, 20), 300 - i * 15, { team: 'ally', armed: false, invuln: true, y: 18, path: [[-190, 30, 250], [-120 + i * 40, 40, 0], [-80 + i * 40, 50, -500], [-60 + i * 40, 60, -1200]], speed: 32 }));
        const dds = []; for (const [x, z] of [[-260, 720], [-140, 800], [140, 760], [280, 700], [420, 820]]) { const d = makeShip(150, 18, 12); d.position.set(x, 0, z); d.rotation.y = rand(-0.3, 0.3) + Math.PI / 2; G.world.add(d); dds.push(d); }
        const navalFire = S.every(0.6, () => { const d = pick(dds); const p = d.position.clone().add(v3(rand(-40, 40), 10, 0)); for (let i = 0; i < 3; i++) particle({ add: true, x: p.x, y: p.y, z: p.z, life: 0.3, size: rand(16, 30), color: [1, 0.7, 0.4] }); flashLight(p, 0xffa050, 60, 200, 0.2); SFX.shot('cannon', p); const t = v3(rand(-200, 200), 4, rand(-560, -410)); S.later(rand(2.5, 4), () => explode(t, { noPlayer: true, size: 2.5, dmg: 0, vdmg: 0 })); });
        // ---- the amphibians: twelve ACVs in two files inside the well deck; ours is third on the left ----
        const acvs = []; G.crushers = [];
        // four rows of three; each file drives straight out of the stern gate and keeps its line until the cut
        for (let i = 0; i < 12; i++) { const col = (i % 3) - 1, row = Math.floor(i / 3); const a = makeACV(0x5b6150, `${3}-${String(i + 1).padStart(2, '0')}`); a.root.position.set(LX + col * 6.6, -0.35, STERN + 9 + row * 11.5); G.world.add(a.root);
          a.beachLane = [-128, -96, -64, -36, -12, 6, 30, 54, 80, 104, 128, 150][i]; a.lane = LX + col * 6.6; a.state = 'dock'; a.t0 = row * 2.4 + (col + 1) * 0.3; a.sp = 0; a.moving = false; acvs.push(a); G.crushers.push(a); }
        const mine = acvs[4]; mine.mine = true; acvInterior(mine, 6);
        const HOVX = [67, 116, -50, -112]; /* in the gaps between the ACV lanes */ const hovers = HOVX.map((x, i) => { const h = makeHover(); h.position.set(x, 0, 260 + i * 18); G.world.add(h); return h; });
        const sea = makeLoop('sea'); sea.set(0.35);
        // one updater drives every amphibian: out of the dock, a nose-dip into the sea, out to its lane, across to the beach, up the sand
        let T = 0, go = false; const STOP = -362;
        G.updaters.push((dt) => { if (G.mode !== 'play') return true; T += dt; if (!go) return;
          for (const a of acvs) { if (a.sunk) continue; const r = a.root, p = r.position;
            if (a.state === 'dock') { if (T < a.t0) continue; a.state = 'exit'; a.moving = true; }
            if (a.state === 'exit') { a.sp = Math.min(6, a.sp + dt * 3); p.z -= a.sp * dt; if (p.z < STERN + 1) { a.state = 'drop'; a.dropT = 0; FX.splash(p.clone().add(v3(0, 0, -4)), 3); } }
            else if (a.state === 'drop') { a.dropT += dt; p.z -= a.sp * dt; const k = Math.min(1, a.dropT / 1.2); p.y = -0.35 - Math.sin(k * Math.PI) * 1.4; r.rotation.x = -Math.sin(k * Math.PI) * 0.22; if (Math.random() < 0.6) particle({ x: p.x + rand(-1.5, 1.5), y: 0.2, z: p.z - 4, vx: rand(-2, 2), vy: rand(2, 5), vz: rand(-3, 0), life: 1.1, size: 0.6, size1: 2, alpha: 0.6, color: [0.88, 0.92, 0.94], grav: 6 }); if (k >= 1) a.state = 'sea'; }
            else if (a.state === 'sea' || a.state === 'land') { const ground = G.groundAt(p.x, p.z); const onLand = ground > -0.2;
              a.sp = lerp(a.sp, a.state === 'land' ? 3.2 : (a === mine ? G.myAcvSpeed ?? 9 : 9), dt * 0.8);
              const dz = (a.state === 'land' ? a.landZ : STOP + rand(-0.2, 0.2)) - p.z; if (dz < -0.5) p.z -= a.sp * dt; else { a.moving = false; if (a.state !== 'land') { a.state = 'beached'; a.moving = false; } }
              p.x = lerp(p.x, a.lane, Math.min(1, dt * 0.25));
              p.y = onLand ? ground : -0.35 + Math.sin(T * 1.5 + a.lane) * 0.12; r.rotation.x = onLand ? Math.atan2(G.groundAt(p.x, p.z - 3) - G.groundAt(p.x, p.z + 3), 6) * -1 : Math.sin(T * 1.2 + a.lane) * 0.03; r.rotation.z = onLand ? 0 : Math.sin(T * 0.9 + a.lane) * 0.03;
              for (const w of a.wheels) w.rotation.x -= a.sp * dt / 0.62;
              if (!onLand && Math.random() < 0.35) particle({ x: p.x + rand(-1.5, 1.5), y: 0.1, z: p.z - 4.4, vx: rand(-1.5, 1.5), vy: rand(0.5, 2.2), vz: rand(-2, 0), life: 0.9, size: 0.4, size1: 1.4, alpha: 0.5, color: [0.86, 0.9, 0.92], grav: 4 }); } }
          for (const h of hovers) { const hp = h.position; h.cs = lerp(h.cs || 0, hp.z > -344 ? Math.min(9.5, (hp.z + 344) * 0.7 + 0.3) : 0, Math.min(1, dt * 0.6)); if (hp.z > -344 || h.cs > 0.05) hp.z = Math.max(-344, hp.z - h.cs * dt); hp.y = hp.z > -340 ? 0.2 + Math.sin(T * 2) * 0.1 : Math.max(0.2, G.groundAt(hp.x, hp.z) + 0.3); h.userData.fan0.rotation.z += dt * 30; h.userData.fan1.rotation.z += dt * 30; if (hp.z > -344 && Math.random() < 0.5) particle({ x: hp.x + rand(-4, 4), y: 0.5, z: hp.z + rand(-9, 9), vx: rand(-4, 4), vy: rand(1, 3), vz: rand(2, 6), life: 1.4, size: 0.8, size1: 3, alpha: 0.45, color: [0.86, 0.9, 0.93], grav: 2 }); }
        });
        // ---- cinematic: the stern gate, one by one into the sea, then the whole wave racing in ----
        S.fade(1, 0);
        await S.cut(async () => {
          G.cut.expo = 1.75; S.camFov(60);
          await S.cam(v3(LX + 1.5, 5.2, STERN + 68), v3(LX, 2.5, STERN - 20), 0); S.fade(0, 1.5);
          go = true;
          await S.say('마이어스 대령', '전 부대, 작전 개시. 쌍룡, 물에서 나온다.', { radio: true, dur: 3.2 });
          await S.cam(v3(LX - 1.5, 4.0, STERN + 40), v3(LX, 2, STERN - 30), 4, (t) => t);
          await S.cam(v3(LX + 26, 1.8, STERN - 22), v3(LX, 1.5, STERN + 2), 0); S.camFov(52);
          await S.say('상륙함 통제', '함미문 개방 완료. 1제대 출수, 출수, 출수!', { radio: true, dur: 3 });
          await S.cam(v3(LX + 22, 2.4, STERN - 34), v3(LX, 1, STERN - 8), 5, (t) => t);
          // the wave, already well on its way
          await S.fade(1, 0.5); T += 30;
          acvs.forEach((a, i) => { a.lane = a.beachLane; a.state = 'sea'; a.moving = true; a.sp = 9; a.root.position.set(a.lane, -0.35, 260 + (i % 3) * 8 + rand(-4, 4)); a.root.rotation.set(0, 0, 0); });
          hovers.forEach((h, i) => { h.position.set(HOVX[i], 0.2, 300 + i * 10); });
          for (let i = 0; i < 6; i++) { const b = makeShip(60, 10, 6); b.position.set(-260 + i * 100, 0, 330 + rand(-30, 30)); b.rotation.y = Math.PI / 2; G.world.add(b); }
          // Dokdo herself comes up past the wave, bow first, and the destroyer Sejong the Great runs in on the right, firing
          lhd.rotation.y = Math.PI; lhd.position.set(-185, 0, 763); if (lhd.userData.gate) lhd.userData.gate.rotation.x = 0;
          G.lhdRun = { v: 24 }; const lhdSnd = makeLoop('engine'); let horned = false;
          G.updaters.push((dt) => { if (G.mode !== 'play') { lhdSnd.stop(); return true; } const R = G.lhdRun; const p = lhd.position; if (p.z < -20) R.v = Math.max(0, R.v - dt * 5); p.z -= R.v * dt;
            lhdSnd.at(p.clone().add(v3(0, 0, -100)), 120, 1.4, 22);
            const bow = v3(p.x, 0.3, p.z - 148); if (R.v > 2 && Math.random() < 0.7) for (const sx of [-1, 1]) particle({ x: bow.x + sx * rand(2, 9), y: 0.4, z: bow.z + rand(0, 12), vx: sx * rand(3, 8), vy: rand(1.5, 4), vz: rand(0, 4), life: 1.6, size: 1.5, size1: 5, alpha: 0.55, color: [0.9, 0.93, 0.95], grav: 3 });
            if (!horned && p.z < 690) { horned = true; tone({ dur: 3.2, f: 82, type: 'sawtooth', gain: 0.18, att: 0.15, wet: 0.7 }); tone({ dur: 3.2, f: 123, type: 'sawtooth', gain: 0.1, att: 0.15, wet: 0.7 }); } });
          const sejong = makeDestroyer('991'); sejong.position.set(205, 0, 250); G.world.add(sejong); G.sejong = sejong; dds.push(sejong);
          const sjShot = (target) => { const gp = sejong.localToWorld(sejong.userData.gun.clone()); for (let i = 0; i < 4; i++) particle({ add: true, x: gp.x, y: gp.y, z: gp.z, vx: rand(-3, 3), vy: rand(0, 2), vz: rand(-8, -2), life: 0.3, size: rand(6, 12), color: [1, 0.72, 0.4] });
            for (let i = 0; i < 8; i++) particle({ x: gp.x, y: gp.y, z: gp.z, vx: rand(-2, 2), vy: rand(0.5, 2), vz: rand(-6, -1), life: 3, size: 2, size1: 7, alpha: 0.35, color: [0.75, 0.75, 0.72] }); flashLight(gp, 0xffa050, 60, 160, 0.2); SFX.shot('cannon', gp);
            if (target) S.later(2.6, () => explode(target, { noPlayer: true, size: 2.4, radius: 7, dmg: 150, vdmg: 0 })); };
          G.updaters.push((dt) => { if (G.mode !== 'play') return true; const p = sejong.position; if (p.z > -110) p.z -= 11 * dt; else if (sejong.rotation.y > -Math.PI / 2) sejong.rotation.y = Math.max(-Math.PI / 2, sejong.rotation.y - dt * 0.15); });
          const sejongFire = S.every(2.6, () => sjShot(v3(rand(-130, 150), 4.2, rand(-416, -406)))); G.sejongFire = sejongFire;
          S.fade(0, 0.6);
          // at the waterline among the left-hand boats, the assault ship's bow looming up behind them
          S.camFov(56); await S.cam(v3(-152, 3.2, 430), v3(-182, 20, 620), 0);
          S.later(0.6, () => S.say('상륙함 통제', '독도함, 증속. 제2제대 엄호 위치로.', { radio: true, dur: 2.8 }));
          await S.cam(v3(-150, 3.6, 392), v3(-190, 28, 470), 6.5, (t) => t);
          // the destroyer on the right flank, her gun firing
          await S.cam(v3(292, 14, 236), v3(205, 10, 168), 0); S.camFov(50);
          sjShot(null); S.later(1.4, () => S.say('구축함 세종대왕', '세종대왕, 해안 사격 개시. 방벽 상단 제압한다.', { radio: true, dur: 3 }));
          await S.cam(v3(286, 11, 168), v3(200, 10, 96), 4.5, (t) => t);
          await S.cam(v3(40, 30, 205), v3(0, 0, 60), 0); S.camFov(58);
          S.later(1.2, () => { for (let i = 0; i < 3; i++) S.later(i * 0.45, () => jetPass([-90 + i * 30, 40, 520], [-60 + i * 30, 60, -900], { speed: 260 })); });
          await S.cam(v3(10, 16, 95), v3(0, 2, -120), 6, (t) => t);
          await S.say('박도현 중위', '1소대! 램프 내려가면 나만 보고 뛴다! 방파제까지 멈추지 마라!', { radio: true, dur: 3.2 });
          await S.fade(1, 0.4);
        });
        { const ls = []; lhd.traverse((o) => { if (o.isLight) ls.push(o); }); for (const l of ls) l.parent.remove(l); }
        // ---- inside our ACV ----
        P.ride = { obj: mine.root, off: [-1.05, 0.3, 3.75] }; P.locked = true; P.noFire = true; P.yaw = Math.PI - 0.55; P.pitch = 0.04; P.hideVM = true; // on the bench by the ramp, the squad down both sides
        S.fade(0, 0.8);
        S.hint('상륙장갑차 안 · 마우스로 둘러보기', 4);
        const eng = makeLoop('engine'); eng.set(0.45, 0, 4);
        await S.say('리선우 병장', '…하느님, 부처님, 아무나 좀 들어주시오.', { dur: 2.8 });
        await S.say('서한준', '하사님, 손이 안 멈춥니다.', { dur: 2.4 });
        await S.say('한지운 하사', '괜찮다. 내 등만 보고 뛰어.', { dur: 2.6 });
        // up through the roof hatch: from here to the beach we see everything, the ship going past, the jets going in ahead of us
        await S.say('박도현 중위', '서한준! 해치 열고 바깥 봐라!', { dur: 2.2 });
        SFX.metal(mine.root.position.clone().add(v3(0, 2.4, 1)));
        if (mine.turret) mine.turret.position.x = 1.05; { const y0 = P.yaw; S.tween(1.0, (k) => { P.ride.off[0] = lerp(-1.05, -0.25, k); P.ride.off[1] = lerp(0.3, 1.32, k); P.ride.off[2] = lerp(3.75, 1.0, k); P.yaw = lerp(y0, 0.55, k); P.pitch = lerp(P.pitch, 0.02, k); }); }
        P.hideVM = false;
        G.bossMusic = true; G.musicMin = 0.7;
        // rounds rattling the hull, spray over the roof
        const ping = S.every(0.35, () => { if (Math.random() < 0.55) { SFX.metal(mine.root.position.clone().add(v3(rand(-1.5, 1.5), 2, rand(-3, 3)))); if (Math.random() < 0.2) G.shake += 0.08; } });
        const geysers = S.every(0.7, () => { const mp = mine.root.position; const p = v3(mp.x + rand(-60, 60), 0, mp.z + rand(-70, 20)); FX.splash(p, rand(2.5, 4.5)); SFX.explosion(p, 0.8); if (p.distanceTo(mp) < 22) { G.shake += 0.4; } });
        const mg = S.every(0.12, () => { const mp = mine.root.position; const from = v3(pick([-12, 52]) + rand(-2, 2), 5, -410); const to = v3(mp.x + rand(-14, 14), rand(0, 3), mp.z + rand(-25, 15)); tracer(from, to, [1, 0.5, 0.3], 450); if (Math.random() < 0.3) FX.splash(to, 0.2); });
        // the strike package: formations come in from behind us, low and fast, overtake the boats and hit the seawall before we get there
        await S.until(() => mine.root.position.z < -30);
        S.radio('항공 통제', '선제 타격 들어간다. 해안선에서 머리 숙여라.', { dur: 2.6 });
        const wave = (dx, delay) => S.later(delay, () => { const mp = mine.root.position;
          [[0, 0], [-34, 26], [34, 26], [-68, 52], [68, 52]].forEach(([ox, oz], j) => { const x = mp.x + dx + ox; const tx = [x - 30, x - 10, x + 10, x + 30].map((bx) => [bx + rand(-6, 6), -412 - rand(0, 30)]);
            jetPass([x, 85 + j * 3, mp.z + 520 + oz], [x + rand(-20, 20), 120, -1400], { speed: 230, bombs: tx, noPlayer: true, dmg: 0 }); }); });
        wave(0, 1.5); wave(-90, 7); wave(80, 12);
        await S.until(() => mine.root.position.z < -110);
        await S.say('박도현 중위', '방파제 위 적이다! 사격 개시!', { dur: 2 });
        P.noFire = false; P.locked = false;
        S.hint('해치 밖 · 방파제 위 적에게 사격할 수 있어요', 4);
        S.later(2, () => S.radio('상륙장갑차 3-06', '좌측 3-06, 피격! 침수된다!', { dur: 2.4 }));
        S.later(2.2, () => { const v = acvs[7]; v.sunk = true; v.moving = false; const vp = v.root.position.clone(); explode(vp.clone().add(v3(0, 2, 0)), { noPlayer: true, size: 2.6, dmg: 0, vdmg: 0 }); addEmitter(vp.clone().add(v3(0, 1, 0)), 'fire', 1.6, 20, 16); addEmitter(vp.clone().add(v3(0, 3, 0)), 'smoke', 2, 3, 30); S.tween(6, (k) => { v.root.position.y = -0.35 - k * 3.5; v.root.rotation.z = k * 0.6; }); G.shake += 0.6; });
        await S.until(() => mine.root.position.z < -290);
        await S.say('박도현 중위', '머리 숙여! 상륙한다! 램프 내려가면 바로 뛰어!', { dur: 2.4 });
        S.tween(0.6, (k) => { P.ride.off[0] = lerp(-0.25, 0, k); P.ride.off[1] = lerp(1.32, 0.05, k); P.ride.off[2] = lerp(1.0, 2.6, k); });
        P.yaw = Math.PI; P.noFire = true; P.hideVM = true;
        await S.until(() => mine.state === 'beached');
        G.shake += 0.6; SFX.metal(mine.root.position);
        await S.wait(0.6);
        const ramp = mine.ramp; await S.tween(0.9, (k) => { ramp.rotation.x = k * 1.32; }, (t) => t * t);
        if (mine.redLight) mine.redLight.intensity = 0;
        S.stop(ping); S.stop(mg); S.stop(geysers); eng.stop();
        G.bossMusic = null; G.musicMin = 0.5; S.later(20, () => { G.musicMin = 0; });
        // the squad pours out of the back
        const names = { park: '박도현 중위', lee: '리선우 병장', yoon: '윤하린 중사', han: '한지운 하사' };
        const mp = mine.root.position; const rearZ = mp.z + 6.5;
        if (mine.interior) mine.root.remove(mine.interior);
        P.ride = null; P.locked = false; P.noFire = false; P.hideVM = false;
        S.player(mp.x + 0.8, rearZ + 1.2, 0, 0); P.pos.y = G.groundAt(P.pos.x, P.pos.z);
        squad(S, [{ key: 'park', name: names.park, x: mp.x - 0.8, z: rearZ }, { key: 'lee', name: names.lee, x: mp.x + 2, z: rearZ + 0.6 }, { key: 'yoon', name: names.yoon, x: mp.x - 2, z: rearZ + 0.8 }, { key: 'han', name: names.han, x: mp.x + 0.4, z: rearZ + 2 }]);
        // every amphibian on the beach drops its ramp; the first men out are cut down; then the vehicles roll on up the sand as cover
        acvs.forEach((a, i) => { if (a.sunk || a === mine) return; S.later(rand(0.3, 2.4), () => { if (a.state !== 'beached') return; S.tween(0.9, (k) => { a.ramp.rotation.x = k * 1.32; }); const ap = a.root.position;
          const men = []; for (let k = 0; k < 4; k++) men.push(ally(ap.x + rand(-1.2, 1.2), ap.z + 7 + k, { hp: 90 }));
          S.later(rand(0.4, 1.4), () => { for (const m of men.slice(0, randi(0, 2))) { if (!m.alive) continue; FX.blood(m.chest(v3())); m.die(); } }); for (const m of men) beachRun(m, -384);
          S.later(rand(4, 7), async () => { SFX.metal(a.root.position); await S.tween(1.3, (k) => { a.ramp.rotation.x = 1.32 * (1 - k); }); }); }); }); // they stay at the waterline, ramps up, until the breaches are open
        S.later(3.6, async () => { SFX.metal(mine.root.position); await S.tween(1.3, (k) => { mine.ramp.rotation.x = 1.32 * (1 - k); }); });
        S.later(0.35, () => S.sayBg('박도현 중위', '나가! 나가! 엎드려서 장애물 뒤로!', { dur: 2.4 }));
        G.acvs = acvs;
        G.boats = { hovers, sea, navalFire, sejongFire: G.sejongFire, token: G.token };
      },
    },
    {
      setup(S) { S.player(0, -340, 0); },
      async run(S) {
        // enemy defenders
        for (const bx of [-12, 52]) for (let i = 0; i < 3; i++) enemy(bx - 1.5 + i * 1.5, i === 2 ? -413 : -411, { tag: 'bunker' + bx, kind: i === 1 ? 'heavy' : 'rifle', hold: true, view: 140, hp: i === 1 ? 300 : 120, acc: 1.1, y: 3.6 });
        for (let i = 0; i < 22; i++) enemy(rand(-110, 130), -409 + rand(-2, 0), { tag: 'wall', hold: true, view: 130, crouch: Math.random() < 0.6, y: 3.6, kind: Math.random() < 0.25 ? 'heavy' : 'rifle' });
        const wallPr = S.pressure({ from: [[-120, -440], [-60, -445], [0, -440], [60, -445], [120, -440], [160, -440]], to: () => [rand(-110, 130), -409], tag: 'wall', max: 24, every: 1.1, heavy: 0.25, view: 130 });
        G.wallPr = wallPr; inAcvDriver();
        const names = { park: '박도현 중위', lee: '리선우 병장', yoon: '윤하린 중사', han: '한지운 하사' };
        let st;
        if (S.cpGet() >= 1) {
          // checkpoint: the four breaches are open, the landing force is drawn up behind the wall, we are at our gap
          S.player(20, -396, 0);
          squad(S, [{ key: 'park', name: names.park, x: 22, z: -397 }, { key: 'lee', name: names.lee, x: 18, z: -396 }, { key: 'yoon', name: names.yoon, x: 25, z: -396 }, { key: 'han', name: names.han, x: 21, z: -394 }]);
          G.breachX.forEach((gx, i) => inOpenGap(i, false)); st = inStageFresh();
          for (let i = 0; i < 16; i++) { const gx = pick(G.breachX); ally(gx + rand(-8, 8), -419 + rand(-2, 2), { hp: 120, hold: true }); }
          wallPr.set(10); G.hitMul = 0.8;
        } else {
          squad(S, [
            { key: 'park', name: names.park, x: P.pos.x + 0.5, z: P.pos.z - 2.5 },
            { key: 'lee', name: names.lee, x: P.pos.x - 1.5, z: P.pos.z - 1 },
            { key: 'yoon', name: names.yoon, x: P.pos.x + 1.5, z: P.pos.z - 1 },
            { key: 'han', name: names.han, x: P.pos.x, z: P.pos.z + 1 },
          ]);
          for (let i = 0; i < 26; i++) { const a = ally(rand(-110, 120), rand(-346, -334), { hp: 90 }); beachRun(a, -384); }
          // LCACs at the waterline, two tanks off each; one of every pair drives up to its breach, the other covers it
          let hovers = G.boats && G.boats.hovers && G.boats.token === G.token ? G.boats.hovers.filter((h) => h.parent === G.world) : [];
          if (hovers.length < 4) { for (const h of hovers) G.world.remove(h); hovers = [67, 116, -50, -112].map((x) => { const h = makeHover(); h.position.set(x, Math.max(0.2, G.groundAt(x, -344) + 0.3), -344); G.world.add(h); return h; }); }
          for (const h of hovers) { h.position.z = -344; for (const t of h.userData.tanks || []) t.root.visible = false; if (h.userData.ramp) h.userData.ramp.rotation.x = -1.2; }
          const HG = { 67: 2, 116: 3, '-50': 1, '-112': 0 }; st = { token: G.token, tanks: [], slots: [] };
          for (const h of hovers) { const i = HG[Math.round(h.position.x)] ?? 2; const gx = G.breachX[i], hx = h.position.x;
            st.tanks[i] = [inTank(hx - 3, -344.5, [[hx - 3, -358], [hx - 3, -376], [gx, -376], [gx, -391]]), inTank(hx + 3, -344.5, [[hx + 3, -360], [hx + 3, -379], [gx + 10, -379], [gx + 10, -387]])]; }
          G.beachTanks = st.tanks.flat();
          S.later(1, () => S.radio('기갑 소대', '공기부양정 접안! 전차 하차, 각 돌파 지점으로 붙는다!', { dur: 3 }));
          G.hitMul = 0.7;
          // the beach under fire: shells you hear coming, aircraft tearing over, the radio net, one that lands far too close
          G.beachFx = [
            S.every(1.5, () => { if (G.cut) return; const an = rand(0, TAU), d = rand(12, 48); const x = P.pos.x + Math.cos(an) * d, z = clamp(P.pos.z + Math.sin(an) * d, -398, -338); if (z > -346) { SFX.incoming(v3(x, 0, z), 1.4); S.later(1.4, () => { FX.splash(v3(x, 0, z), rand(3, 5)); SFX.explosion(v3(x, 0, z), 1.1); }); } else S.arty(x, z, { dmg: 25, noAlly: true }); }),
            S.every(15, () => { const z = rand(-480, -430), d = Math.random() < 0.5 ? 1 : -1; jetPass([-700 * d, 55, z], [700 * d, 65, z - 40], { speed: 290, bombs: [[rand(-150, 150), -445], [rand(-150, 150), -475]], noPlayer: true, dmg: 0 }); }),
          ];
          for (const [t, who, line] of [[4, '해병 2대대', '2대대 상륙! 좌측 해변 확보 중!'], [11, '상륙함 통제', '2제대 출수 개시! 해안까지 4분!'], [20, '구축함 세종대왕', '함포 사격 연장한다. 방벽 후방 200.'], [33, '해병 2대대', '위생병! 위생병 어디 있어!']]) S.later(t, () => S.radio(who, line, { dur: 2.6 }));
          S.later(9, async () => {
            const p = P.pos.clone().add(v3(rand(-3, 3), 0, -6)); SFX.incoming(p, 1.1); await S.wait(1.1); explode(p, { noPlayer: true, size: 2.4, dmg: 0, vdmg: 0 }); FX.dust(p, 40, [0.6, 0.56, 0.5], 3);
            G.shake += 1.4; SFX.ring(4); S.blur(5, 0.05); G.timeScale = 0.3; P.punchP += 0.35; P.hp = Math.max(30, P.hp - 25);
            await new Promise((r) => setTimeout(r, 2400)); G.timeScale = 1; S.blur(0, 1.4);
            S.sayBg('박도현 중위', '서한준! 서한준! 정신 차려! 일어나서 뛰어!', { dur: 2.6 }); });
          // marines going up the seawall on ladders, the way it was done here in 1950: most are cut down at the top
          G.ladderFx = S.every(2.6, () => { const x = pick(G.ladders || [0]); const y0 = G.groundAt(x, -399.6); const m = makeSoldierMesh('rok'); m.root.position.set(x, y0, -399.4); m.root.rotation.y = 0; G.world.add(m.root);
            S.tween(2.4, (k) => { m.root.position.set(x, y0 + k * (4.9 - y0), -399.4 - k * 1.6); }, (t) => t).then(() => { G.world.remove(m.root); const a = ally(x, -406.5, { hp: 90 }); if (Math.random() < 0.75) { S.later(rand(0.2, 0.9), () => { if (!a.alive) return; for (let i = 0; i < 4; i++) tracer(v3(x + rand(-20, 20), 5, -416), a.pos.clone().add(v3(0, 1.2, 0)), [1, 0.5, 0.3], 450); FX.blood(a.chest(v3())); a.die(); }); } else a.goTo = v3(x + rand(-6, 6), 0, -414); }); });
          // beach choreography: MG team, medic with a wounded man, engineers with a bangalore
          ally(-14, -377, { hold: true, crouch: true, hp: 400, kind: 'heavy' }); ally(-12.6, -377.4, { hold: true, crouch: true, hp: 400 });
          const wounded = ally(-6, -369, {}); wounded.die(); wounded.deadT = 10; wounded.fall = 1.4;
          const medic = ally(-5.2, -368.2, { passive: true, noShoot: true, unarmed: true, hp: 999, invuln: true }); medic.wantCrouch = true; medic.name = '위생병';
          const eng1 = ally(32, -348, { passive: true, noShoot: true, hp: 999 }), eng2 = ally(33.5, -349, { passive: true, noShoot: true, hp: 999 });
          const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 8), MT.rust()); tube.rotation.x = Math.PI / 2; tube.position.set(0.15, 0.3, -0.6); eng1.m.torso.add(tube);
          S.later(3, () => { eng1.goTo = v3(25, 0, -398); eng2.goTo = v3(26.5, 0, -397); eng1.o.speed = eng2.o.speed = 4.6; S.sayBg('위생병', '버텨! 정신 차려!', { dur: 2.4 }); });
          S.hint('물속에서는 느려져요 · 박도현 중위를 따라 엄폐물 사이로', 5);
          // every man of the squad has his own line up the beach and his own covers on it; they move as the lieutenant moves
          const pz = (z) => () => !S.sq.park || S.sq.park.pos.z < z;
          for (const [x, z] of [[-5, -383.4], [-11, -383], [17, -385], [-8, -366], [9, -368], [-14, -369], [12, -383.2]]) crushable(x, z, 'tetra');
          let breached = false; const isBreached = () => breached;
          S.route('lee', [[-9, -356, { run: true }], [-8, -364.6, { wait: 1.5, until: pz(-362) }], [-6, -373, { run: true }], [-5, -381.6, { until: isBreached }]]);
          S.route('yoon', [[7, -357, { run: true }], [9, -366.6, { wait: 1.5, until: pz(-362) }], [12, -375, { run: true }], [17, -383.4, { until: isBreached }]]);
          S.route('han', [[-15, -357, { run: true }], [-14, -367.6, { wait: 2, until: pz(-364) }], [-12, -375, { run: true }], [-11, -381.4, { until: isBreached }]]);
          // the machine guns on the wall never stop until the armour opens it
          const mgFire = S.every(0.07, () => { const nx = pick([-12, 52]); const from = v3(nx + rand(-1, 1), 4.6, -411); const to = v3(rand(-80, 90), rand(0.2, 1.6), rand(-392, -350)); tracer(from, to, [1, 0.55, 0.3], 480); if (Math.random() < 0.15) FX.dust(to, 2, [0.6, 0.56, 0.5], 0.3); });
          let warned = 0;
          const exposed = S.every(0.25, () => { if (P.pos.z > -388 || P.pos.z < -404 || P.ride) return; const nx = P.pos.x < 20 ? -12 : 52; const from = v3(nx, 4.6, -411); tracer(from, P.pos.clone().add(v3(rand(-0.6, 0.6), 1.2, 0)), [1, 0.55, 0.3], 480);
            if (Math.random() < 0.55) damagePlayer(14, from); if (G.time - warned > 6) { warned = G.time; S.sayBg('박도현 중위', '서한준! 엎드려! 고개 들지 마! 길 뚫릴 때까지 기다려!', { dur: 2.6 }); } });
          await S.lead('park', [
            [-2, -357, { run: true, say: ['박도현 중위', '장애물 뒤로! 뛰어!'], bg: true }],
            [3, -369.6, { crouch: true, wait: 2.5, say: ['박도현 중위', '전차가 길 뚫기 전까지 내밀지 마! 엄폐물 뒤에서만 쏴!'], bg: true }],
            [12, -381.6, { crouch: true }],
          ], { follow: [], label: '박도현 중위를 따라 장애물 지대로', waitDist: 15 });
          const pin = beachPin(-392, -374);
          G.hitMul = 0.8;
          S.obj('전차가 방벽을 뚫을 때까지 엄폐물 뒤에서 사격');
          S.hint('엄폐물 뒤에서 <kbd>우클릭</kbd>으로 고개를 내밀어 방벽 위 적을 쏘세요 · 앞으로 나가면 기관총에 당해요', 6);
          await S.radio('윤하린 중사', '함포 지원 요청합니다! 방파제 상단, 좌표 전송합니다!', { dur: 3 });
          for (let i = 0; i < 6; i++) S.later(2 + i * 0.7, () => { const x = rand(-70, 90); explode(v3(x, 4.2, -409), { noPlayer: true, size: 2.2, radius: 7, dmg: 300, delayed: false }); });
          await S.until(() => !eng1.goTo || eng1.pos.distanceTo(v3(25, eng1.pos.y, -398)) < 3 || G.time > 200);
          explode(v3(25, 1.2, -399), { noPlayer: true, size: 1.4, dmg: 0, vdmg: 0 }); eng1.invuln = false; eng2.invuln = false; eng1.die(); eng2.die();
          await S.say('공병', '…파괴통 불발! 불발이다!', { dur: 2 });
          await S.say('박도현 중위', '전차! 방벽 쏴라! 길 뚫어!', { dur: 2.4 });
          S.obj('전차들이 방벽을 뚫을 때까지 버텨라');
          const ours = st.tanks[2] && st.tanks[2][0];
          { const t0 = G.time; await S.until(() => !ours || ours.pi >= 4 || G.time - t0 > 25); }
          await S.wait(1.5);
          inOpenGap(2, true, ours); S.stop(mgFire); S.stop(exposed);
          // the other three go within seconds of ours
          [[1, 1.6, '2번 돌파구 개방!'], [3, 3.0, '4번 돌파구 개방! 전차 진입한다!'], [0, 4.4, '1번 돌파구 열렸다!']].forEach(([i, t, line]) => S.later(t, () => { inOpenGap(i, true, st.tanks[i] && st.tanks[i][0]); S.radio('기갑 소대', line, { dur: 2.2 }); }));
          breached = true; pin.done = true;
          S.sayBg('박도현 중위', '뚫렸다! 전원 돌격! 돌파구로!', { dur: 2.4 });
          // everybody on the beach goes for the nearest breach, through it, and spreads out behind the wall
          for (const a of G.actors) if (a.alive && a.team === 'ally' && !a.hero && !a.o.passive && a.pos.z < -366 && a.pos.z > -396) {
            let gx = G.breachX[0]; for (const b of G.breachX) if (Math.abs(a.pos.x - b) < Math.abs(a.pos.x - gx)) gx = b;
            S.later(rand(0, 1.8), () => { if (a.alive) S.route(a, [[gx + rand(-3, 3), -395, { run: true }], [gx + rand(-2, 2), -409, { run: true }], [gx + rand(-8, 8), -419 + rand(-2, 2), { wait: 9999 }]]); });
          }
          // the armour follows: the breaching tank through first, then the ACVs, then the covering tank
          const order = G.breachX.map((_, i) => [1.0, 2.6, 4.0, 5.4][[2, 1, 3, 0].indexOf(i)]);
          G.breachX.forEach((gx, i) => { const [tA, tB] = st.tanks[i] || []; const d = order[i];
            if (tA) setGameTimeout(() => { tA.path = [v3(gx, 0, -398), v3(gx, 0, -412), v3(gx, 0, -426)]; tA.pi = 0; }, d);
          });
          const acvs = (G.acvs || []).filter((a) => !a.sunk); st.slots = G.breachX.map(() => [null, null]);
          const mineA = acvs.find((a) => a.mine); const left = acvs.filter((a) => a !== mineA).sort((p, q) => p.root.position.x - q.root.position.x);
          if (mineA) st.slots[2][0] = mineA;
          for (const a of left) { let best = null, bd = 1e9; G.breachX.forEach((gx, i) => st.slots[i].forEach((s, k) => { if (s) return; const d = Math.abs(a.root.position.x - gx); if (d < bd) { bd = d; best = [i, k]; } })); if (best) st.slots[best[0]][best[1]] = a; }
          st.slots.forEach((sl, i) => sl.forEach((a, k) => { if (!a) return; const gx = G.breachX[i], [sx, sz] = IN_SLOTS[k];
            const p0 = a.root.position; inAcvDrive(a, [[p0.x, -382], [gx + Math.sign(sx) * 2, -386], [gx, -397], [gx, -407], [gx + sx, sz + 3], [gx + sx, sz - 1]], order[i] + 4 + k * 3.5); }));
          S.cp(1);
        }
        G.inStage = st;
        for (const u of G.beachFx || []) S.stop(u); if (G.ladderFx) S.stop(G.ladderFx);
        await S.say('리선우 병장', '뚫렸슴다! 길 열렸슴다!');
        // through our breach, then the two bunkers on the wall: their crews still inside
        await S.lead('park', [[24, -396, { run: true }], [22, -410, { run: true }], [14, -419, { say: ['박도현 중위', '서한준, 리선우! 왼쪽 벙커 안을 쓸어라! 오른쪽은 우리가 간다!'] }]], { follow: ['lee', 'yoon', 'han'], label: '박도현 중위를 따라 돌파구로' });
        S.route('lee', [[2, -418, { run: true }], [-6, -418.5, { wait: 2, until: () => !aliveEnemies('bunker-12').length }], [9, -418, { wait: 9999 }]]);
        const back = () => !aliveEnemies('bunker52').length && !aliveEnemies('bunker-12').length;
        S.route('park', [[40, -410, { run: true }], [47, -418, { wait: 2, until: back }], [40, -410, { run: true }], [24, -409, { run: true }], [12, -421, { wait: 9999 }]]); S.route('yoon', [[40, -410, { run: true }], [49, -419.5, { wait: 2, until: back }], [40, -411, { run: true }], [24, -410, { run: true }], [10, -423, { wait: 9999 }]]); S.route('han', [[40, -410, { run: true }], [45, -419.5, { wait: 2, until: back }], [40, -409, { run: true }], [24, -408, { run: true }], [11, -419, { wait: 9999 }]]);
        S.later(14, () => { if (!aliveEnemies('bunker52').length) return; S.sayBg('박도현 중위', '수류탄! …오른쪽 벙커 정리 끝!', { dur: 2.4 }); explode(v3(52, 4.4, -412), { noPlayer: true, size: 1.2, radius: 3, dmg: 0, vdmg: 0 }); for (const a of aliveEnemies('bunker52')) a.die(); });
        S.obj('왼쪽 벙커 안의 적 소탕', v3(-12, 4.4, -417));
        S.hint('벙커 뒤쪽(항구 쪽) 문으로 들어가서 안에 있는 적을 처리하세요', 5);
        await S.killAll('bunker-12');
        await S.until(() => !aliveEnemies('bunker52').length);
        await S.wait(1);
        if (G.wallPr) G.wallPr.stop();
        await S.say('윤하린 중사', '벙커 둘 다 정리됐습니다!');
      },
    },
    {
      setup(S) { S.player(8, -417, 0); squad(S, [{ key: 'park', name: '박도현 중위', x: 12, z: -421 }, { key: 'lee', name: '리선우 병장', x: 9, z: -418 }, { key: 'yoon', name: '윤하린 중사', x: 10, z: -423 }, { key: 'han', name: '한지운 하사', x: 11, z: -419 }]); },
      async run(S) {
        // the force behind the wall, as Vehicles now: in every lane a tank leads, two ACVs, a tank behind
        const st = G.inStage && G.inStage.token === G.token ? G.inStage : inStageFresh();
        const cols = G.breachX.map((gx, i) => {
          const [tA0, tB0] = st.tanks[i] || []; const tA = tA0 && tA0.alive ? tA0 : inTank(gx, -426), tB = tB0 && tB0.alive ? tB0 : inTank(gx, -412);
          const acv = (st.slots[i] || [null, null]).map((a, k) => { if (!a) a = inAcvAt(gx + IN_SLOTS[k][0], IN_SLOTS[k][1], '3-' + (20 + i * 2 + k)); a.state = 'vehicle'; a.moving = false; if (a.ramp) a.ramp.rotation.x = 0; const p = a.root.position;
            return Object.assign(new Vehicle('acv', p.x, p.z, { team: 'ally', acvMesh: a, armed: true, invuln: true, speed: 4.2, accurate: true, reload: 2.4, yieldPeople: false, yFn: G.inY, yaw: a.root.rotation.y, suppress: inSuppress }), { acvM: a }); });
          for (const t of [tA, tB]) { t.o.suppress = inSuppress; t.o.yFn = G.inY; t.speed = 4.2; }
          return [tA, acv[0], acv[1], tB];
        });
        const mine = cols[2][1];
        let stage = -1, stageT = G.time;
        const advance = () => { stage = Math.min(IN_PL.length - 1, stage + 1); stageT = G.time; cols.forEach((col, i) => { const gx = G.breachX[i]; col.forEach((v, k) => { if (!v || !v.alive) return; v.path = [...(v.pos.z > -400 ? [v3(gx, 0, -397)] : []), v3(gx, 0, IN_PL[stage] + k * 13)]; v.pi = 0; v.stopped = false; }); }); };
        const headAt = () => cols[2][0] && cols[2][0].alive ? cols[2][0].pi >= cols[2][0].path.length : true;
        advance();
        // the beach allies take the lanes too, along the edges, a phase line behind the armour
        for (const a of G.actors) if (a.alive && a.team === 'ally' && !a.hero && !a.o.passive && a.pos.z < -404 && a.pos.z > -428) {
          let li = 0; G.breachX.forEach((b, i) => { if (Math.abs(a.pos.x - b) < Math.abs(a.pos.x - G.breachX[li])) li = i; }); const gx = G.breachX[li], side = a.pos.x < gx ? -1 : 1;
          S.route(a, IN_PL.map((pl, k) => [gx + side * (6.2 + rand(-0.6, 0.6)), pl + 16 + rand(0, 8), { run: true, until: () => stage > k }]));
        }
        // the defenders: in the lanes, the alleys and the nests at the cross roads, more coming down from the far end
        const ahead = G.portSpots.filter((p) => p.z < -440);
        for (let i = 0; i < 36; i++) { const p = pick(ahead); enemy(p.x + rand(-1, 1), p.z + rand(-1, 1), { tag: 'port', kind: Math.random() < 0.25 ? 'heavy' : 'rifle', view: 85, crouch: Math.random() < 0.4 }); }
        for (const [x, z] of G.portNests || []) for (let k = 0; k < 2; k++) enemy(x - 0.8 + k * 1.6, z, { tag: 'port', kind: k ? 'heavy' : 'rifle', hold: true, view: 140, hp: 200 });
        const far = G.portSpots.filter((p) => p.z < -575).map((p) => [p.x, p.z]);
        const portPr = S.pressure({ from: far.length ? far : [[0, -590]], to: () => { const zf = IN_PL[Math.min(stage + 1, IN_PL.length - 1)]; const c = G.portSpots.filter((p) => Math.abs(p.z - zf) < 14); const p = pick(c.length ? c : G.portSpots); return [p.x, p.z]; }, tag: 'port', max: 18, every: 1.3, heavy: 0.25 });
        await S.say('박도현 중위', '항만으로 밀고 들어간다! 전차 뒤에 붙어서 통로 가장자리로!', { dur: 3 });
        // our ACV carries the rockets
        const rear = () => mine.pos.clone().add(v3(Math.sin(mine.yaw) * 5.4, 1.1, Math.cos(mine.yaw) * 5.4));
        const rpgIt = S.station(rear(), 'RPG 꺼내기', () => { giveWeapon('rpg', true); P.ammo.rpg.res = Math.max(P.ammo.rpg.res, 3); }, 2.2);
        S.every(0.3, () => { rpgIt.pos.copy(rear()); });
        const counter = async () => {
          const eb = new Vehicle('bmp', -150, -540, { path: [[-60, -540], [-6, -536]], speed: 4.5, hp: 380, reload: 2.5, target: 'allies' });
          S.radio('윤하린 중사', '적 BMP 역습! 교차로 왼쪽입니다!', { dur: 2.6 });
          await S.say('박도현 중위', '서한준! 우리 ACV 뒤에 RPG 있다! 꺼내서 저놈 잡아라!', { dur: 3 });
          const mk = S.every(0.2, () => { if (eb.alive) G.objPos = eb.pos.clone().add(v3(0, 2, 0)); }); S.obj('ACV에서 RPG를 꺼내 적 BMP 격파');
          await S.until(() => !eb.alive); S.stop(mk); S.sayBg('윤하린 중사', '격파 확인!', { dur: 1.8 });
          await S.wait(4);
          await S.threat('tank', { x: 30, z: -610, path: [[30, -592]], hp: 600, reload: 7, line: '적 전차! 통로 끝, 관제탑 앞입니다!' });
        };
        // up our lane, cover to cover on the lane edges, never further than the armour in front
        // the left edge of our lane, jersey barrier to jersey barrier, a phase line behind the lead tank
        const W = (z, o = {}) => [17.8, z, Object.assign({ crouch: true, until: () => headAt() || G.time - stageT > 22, fn: async () => { advance(); } }, o)];
        await S.lead('park', [[16, -428, { run: true }], W(-440), W(-474, { fn: async () => { advance(); await counter(); } }), W(-501, { fn: async () => {} })], { follow: ['lee', 'yoon', 'han'], label: '박도현 중위를 따라 기갑과 함께 전진', waitDist: 16 });
        // then everyone mounts up and the column charges through to the control tower
        await S.say('박도현 중위', '이대로는 시간 없다! 전원 ACV 탑승! 관제탑까지 장갑차로 돌파한다!', { dur: 3 });
        mine.stopped = true; mine.path = null;
        rpgIt.disabled = true; const i0 = G.interactables.indexOf(rpgIt); if (i0 >= 0) G.interactables.splice(i0, 1);
        if (mine.acvM.ramp) await S.tween(0.9, (k) => { mine.acvM.ramp.rotation.x = k * 1.32; });
        S.obj('우리 ACV에 탑승', rear());
        await S.use(rear(), 'ACV 탑승', 2.8);
        for (const k of ['park', 'lee', 'yoon', 'han']) { const a = S.sq[k]; if (a) a.remove(); }
        portPr.stop(); if (mine.acvM.ramp) mine.acvM.ramp.rotation.x = 0;
        S.give('acvmg'); if (mine.m.turret) mine.m.turret.position.x = 1.05; mine.armed = false;
        P.ride = { obj: mine.m.root, off: [-0.25, 1.32, 1.0] }; P.yaw = mine.yaw; P.pitch = -0.05; P.noFire = false;
        G.hitMul = 0.55; const regen = S.every(0.5, () => { if (P.alive && P.hp < 100 && G.time - P.lastHit > 2.5) P.hp = Math.min(100, P.hp + 5); });
        /* our lane: whoever is in front of our ACV runs on ahead at the same speed and opens the way; whoever is behind holds where it is.
           Nobody swerves to the lane edges any more (the jersey barriers and the sandbag nests at the cross roads stand there) */
        const front = cols[2].filter((v) => v && v.alive && v !== mine && v.pos.z < mine.pos.z).sort((a, b) => a.pos.z - b.pos.z);
        front.forEach((v, k) => { v.path = [v3(24, 0, -592 + k * 12)]; /* short of the control tower (its face at z -600.5) */ v.pi = 0; v.speed = 7; v.stopped = false; v.o.noDetour = true; v.o.yieldPeople = false; });
        cols[2].forEach((v) => { if (v && v.alive && v !== mine && !front.includes(v)) v.stopped = true; });
        mine.stopped = true; S.later(3.5, () => { const endZ = front.length ? -592 + front.length * 12 : -586; mine.path = [v3(24, 0, -520), v3(24, 0, Math.min(-560, endZ + 10)), v3(24, 0, endZ)]; /* behind whoever led the way in */ mine.pi = 0; mine.speed = 7; mine.stopped = false; mine.o.yieldPeople = false; });
        cols.forEach((col, i) => { if (i === 2) return; col.forEach((v, k) => { if (!v || !v.alive) return; const gx = G.breachX[i]; v.path = [v3(gx, 0, -560 + k * 13), v3(gx, 0, -580 + k * 13)]; v.pi = 0; v.speed = 6; v.stopped = false; }); });
        G.armorFree = true;
        S.obj('ACV 원격무장 기관총으로 항만 돌파');
        S.hint('ACV 기관총 · 매복조를 하나라도 쓰러뜨리면 다른 장갑차가 처리해요', 5);
        const amb = ambushRun(S, mine, [{ x: 16.5, z: -528, n: 5 }, { x: 31.5, z: -546, n: 4 }, { x: 16.5, z: -562, n: 5 }, { x: 31.5, z: -578, n: 5 }], { spawnAt: 70 });
        // port set pieces: the gantry crane comes down beside the column and the fuel farm goes up
        const craneFall = async () => {
          const cr = G.crane0; if (!cr) return;
          S.sayBg('리선우 병장', 'RPG! 크레인 맞았다! 넘어온다, 날래 피하라우!', { dur: 2.2 });
          explode(v3(2, 12, -505), { noPlayer: true, size: 2, dmg: 0, vdmg: 0 });
          for (const c of G.crane0Cols || []) { const ci = G.colliders.indexOf(c); if (ci >= 0) G.colliders.splice(ci, 1); }
          await S.wait(0.5); SFX.metal(cr.position); G.shake += 0.3;
          await S.tween(3.2, (k) => { cr.rotation.z = k * 1.5; cr.position.y = 3.6 - 6.5 * k * k; }, (t) => t * t * t); addCollider(-30, 3.6, -542, -24, 6.5, -482);
          const imp = v3(-22, 4, -512); G.shake += 1.6; explode(imp, { noPlayer: true, size: 3, dmg: 0, vdmg: 0 }); SFX.explosion(imp);
          for (let i = 0; i < 40; i++) particle({ x: rand(-28, 4), y: 4.5, z: -512 + rand(-28, 28), vx: rand(-3, 3), vy: rand(2, 7), vz: rand(-3, 3), life: rand(2, 4), size: rand(2, 4), size1: rand(6, 9), color: [0.62, 0.58, 0.52], alpha: 0.6, grav: -0.3 });
          for (const e of aliveEnemies()) if (e.pos.x < 8 && e.pos.x > -32 && Math.abs(e.pos.z + 512) < 30) e.die();
          S.sayBg('박도현 중위', '크레인 쓰러졌다! 멈추지 마! 계속 밀어!', { dur: 2.4 });
        };
        const fuelBlast = () => {
          S.sayBg('윤하린 중사', '왼쪽 유류 탱크! 불붙었습니다!', { dur: 2.2 });
          G.fuelTanks.forEach((t, i) => S.later(0.4 + i * 0.8, () => {
            const p = v3(t.x, 12, t.z); explode(p, { noPlayer: true, size: 5, dmg: 0, vdmg: 0 }); SFX.explosion(p); G.shake += 0.9;
            for (let k = 0; k < 30; k++) particle({ add: true, x: t.x + rand(-6, 6), y: rand(8, 16), z: t.z + rand(-6, 6), vx: rand(-4, 4), vy: rand(6, 18), vz: rand(-4, 4), life: rand(1.4, 2.6), size: rand(4, 7), size1: rand(9, 14), color: [1, rand(0.45, 0.7), 0.2], grav: -1 });
            t.m.scale.y = 0.45; t.m.position.y = 3.6 + 2.5; t.m.material = mat('fueltankburnt', { color: 0x2a2622, rough: 1 }); t.top.visible = false; if (t.col) t.col.max.y = 3.6 + 5;
            addEmitter(v3(t.x, 9, t.z), 'fire', 4, 30); addEmitter(v3(t.x, 16, t.z), 'smoke', 6, 8);
          }));
        };
        let craneDown = false, fuelUp = false;
        const portSet = S.every(0.2, () => {
          const z = mine.pos.z;
          if (!craneDown && z < -497) { craneDown = true; craneFall(); }
          if (!fuelUp && z < -538) { fuelUp = true; fuelBlast(); }
        });
        await S.until(() => (mine.path && mine.pi >= mine.path.length) || mine.pos.z < -584);
        S.stop(amb); S.stop(portSet); S.stop(regen); G.hitMul = 1; G.armorFree = false;
        for (const a of aliveEnemies()) a.remove();
        await S.say('리선우 병장', '항만 확보! 관제탑까지 왔슴다!', { dur: 2.2 });
        P.ride = null; S.take('acvmg');
        // the flag goes up on the port control tower
        await S.cut(async () => {
          G.cut.expo = 1.5; const T = G.portTower; const px = T.x + 4.5, pz = T.z + 4.5;
          addBox(px, T.y - 0.3, pz, 0.14, 6.5, 0.14, MT.metal());
          const fg = new THREE.PlaneGeometry(2.6, 1.75, 12, 6); fg.translate(1.3, 0, 0);
          const fm = new THREE.MeshStandardMaterial({ map: canvasTex(240, 160, (g, w, h) => drawFlag(g, w, h, 'kr')), side: THREE.DoubleSide, roughness: 0.9 });
          const f = new THREE.Mesh(fg, fm); f.position.set(px + 0.08, T.y + 0.6, pz); G.world.add(f);
          const base = fg.attributes.position.array.slice();
          G.updaters.push(() => { const p = fg.attributes.position; for (let i = 0; i < p.count; i++) { const bx = base[i * 3]; p.setZ(i, Math.sin(bx * 2.2 - G.time * 6) * 0.14 * bx); } p.needsUpdate = true; fg.computeVertexNormals(); });
          const man = makeSoldierMesh('rok'); man.root.position.set(px - 0.8, T.y - 0.3, pz - 0.4); man.root.rotation.y = 2.4; G.world.add(man.root);
          for (let i = 0; i < 6; i++) { const m = makeSoldierMesh('rok'); m.root.position.set(T.x - 14 + rand(-6, 6), 3.6, T.z + 18 + rand(-4, 4)); m.root.rotation.y = Math.PI + rand(-0.4, 0.4); G.world.add(m.root); }
          await S.cam(v3(T.x - 26, 5.4, T.z + 34), v3(T.x, T.y + 1, T.z), 0);
          S.camFov(48);
          S.cam(v3(T.x - 12, 22, T.z + 18), v3(px, T.y + 3, pz), 7);
          await S.tween(5.5, (k) => { f.position.y = T.y + 0.6 + k * 5.1; }, (t) => t);
          await S.wait(1.6);
          S.camFov(70);
        });
        await S.radio('한지운 하사', '여기는 3분대. 서해 확보. 반복합니다, 서해 확보.');
        await S.radio('마이어스 대령', '잘했다. …동해 상황은?', { dur: 2.5 });
        if (G.boats) { S.stop(G.boats.navalFire); if (G.boats.sejongFire) S.stop(G.boats.sejongFire); G.boats.sea.stop(); }
        await S.fade(1, 1.2);
      },
    },
  ],
});

/* ========== MISSION 10 「작전명 쌍룡-고성」 ========== */