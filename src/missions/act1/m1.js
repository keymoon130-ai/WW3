defMission({
  id: 'm1', act: '1막 · 국경 붕괴', num: '미션 1', title: '배수진',
  dateText: '2032년 1월 1일 00:20', dateShort: '2032.01.01', place: '두만강 국경 다리 일대', placeShort: '국경 다리', who: '서한준 이병 · 제12국경수비대', whoShort: '서한준',
  env: Object.assign({}, ENV.nightSnow, { flashes: 0.6, flashDir: [0, -1], battle: 0.5, exposure: 1.3, viewDist: 55 }),
  loadout: { weapons: ['none'], nades: 2 },
  bounds: [-30, -100, 200, 20],
  build(S) {
    buildTumen();
    // ruined post
    room(0, -33, 3.4, 3.4, 1.4, [{ side: 's', at: 0.6, w: 0.95 }], { roof: false, floor: true });
    rubble(1.5, -31, 1); addEmitter(v3(0, 0.8, -33), 'fire', 0.6, 12); addEmitter(v3(0, 1.5, -33), 'smoke', 0.5, 2);
    // trench line to bridge
    for (let x = 18; x < 140; x += 16) { sandbags(x, -34, 6, 0); if (Math.random() < 0.6) sandbags(x + 6, -29, 4, 0.4); }
    sandbagRing(60, -26, 2.6, Math.PI / 2); sandbagRing(110, -27, 2.6, Math.PI / 2);
    rubble(35, -24, 1.2); rubble(88, -22, 1); carProp(75, -15, 0.3, 0x3c4a3a, true, true);
    // bridge + south checkpoint
    const br = buildBridge(150); G.br = br;
    // demolition charges: hidden until the engineers place them; index 0 is the big one the player must hit
    G.charges = [];
    for (const [cx, cy, cz, big] of [[150, -2.2, -56.6, 1], [147.6, -1.9, -56.7], [152.4, -1.9, -56.7], [148, -2.3, -70.6], [152, -2.3, -70.6], [150, -2.2, -84.6]]) {
      const ch = new THREE.Mesh(boxGeo(big ? 1.4 : 0.7, big ? 0.8 : 0.5, 0.5), mat('charge', { color: 0x4a3a2a })); ch.position.set(cx, cy, cz); ch.visible = false; G.world.add(ch);
      const lt = glow(cx, cy + 0.6, cz + 0.4, 0xff2010, big ? 0.8 : 0.5); lt.visible = false;
      const rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([v3(cx < 150 ? 145.2 : cx > 150 ? 154.8 : 145.2, 1.0, cz + 1.6), v3(cx, cy + 0.4, cz + 0.3)]), new THREE.LineBasicMaterial({ color: 0xc8b890 })); rope.visible = false; G.world.add(rope);
      G.charges.push({ ch, lt, rope, on: false, ph: rand(0, 6) });
    }
    G.chargeOn = (n) => { G.charges.forEach((c, i) => { const on = i < n; c.on = on; c.ch.visible = on; c.rope.visible = on; if (!on) c.lt.visible = false; }); G.wireN = n; if (G.wire) G.wire.geometry.setDrawRange(0, Math.max(0, Math.min(G.wirePts, 2 + n * 2))); };
    G.chargeLight = G.charges[0].lt;
    // detonation cord: pier -> along the deck -> to the plunger next to Moon
    const wp = [v3(150, -1.8, -56.4), v3(150.4, 0.05, -52), v3(150.8, 0.05, -46), v3(151.2, 0.05, -40), v3(151.8, G.groundAt(151.8, -36) + 0.05, -36), v3(152.2, G.groundAt(152.2, -32) + 0.05, -32), v3(152.5, G.groundAt(152.5, -29) + 0.05, -29), v3(152.6, G.groundAt(152.6, -27.6) + 0.3, -27.6)];
    G.wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wp), new THREE.LineBasicMaterial({ color: 0x202020 })); G.wirePts = wp.length; G.world.add(G.wire); G.wire.geometry.setDrawRange(0, 0);
    const spool = addBox(151.2, 0, -40.4, 0.5, 0.5, 0.5, mat('spool', { color: 0x6a5232 }), { dynamic: true, collide: false });
    // plunger
    addBox(152.6, G.groundAt(152.6, -27.6), -27.6, 0.45, 0.35, 0.3, mat('plunger', { color: 0x3a3a30 }), { dynamic: true, collide: false });
    G.plungerT = addBox(152.6, G.groundAt(152.6, -27.6) + 0.35, -27.6, 0.06, 0.32, 0.06, MT.metal(), { dynamic: true, collide: false });
    G.updaters.push(() => { for (const c of G.charges) if (c.on) c.lt.visible = Math.sin(G.time * 8 + c.ph) > 0; });
    jersey(142, -32, 5, 0); jersey(158, -32, 5, 0); sandbags(144, -27, 5, 0.2); sandbags(157, -27, 5, -0.2);
    addBox(150, 0, -33.5, 7, 0.15, 0.15, mat('barrier', { color: 0xc8a030 }), { collide: false });
    room(166, -26, 6, 5, 2.8, [{ side: 'w', at: 0, w: 1.2 }, { side: 'n', at: 0, w: 2, y0: 1, y1: 1.8 }], { floor: true });
    truckProp(136, -18, 0.2, 0x4d5340); truckProp(162, -12, -0.4, 0x4d5340, true); addEmitter(v3(162, 2, -12), 'fire', 0.8, 15);
    lampPost(144, -36); lampPost(156, -36, true);
    for (let i = 0; i < 6; i++) glow(rand(120, 180), rand(0.5, 2), rand(-30, -10), 0xff8040, 1.5);
    G.envFire = addEmitter(v3(120, 1, -20), 'smoke', 1, 1.5);
    // scrub and trees everywhere except the retreat route and the bridgehead
    scatterVeg(-30, -26, 200, 20, 260, [[-6, -40, 160, -22], [128, -46, 186, -4], [60, -32, 120, -18]], { tree: 0.18 });
    squad(S, [{ key: 'moon', name: '문재혁 중사', x: 153.2, z: -28.2, yaw: 0.6, o: { invuln: true, hold: true, crouch: true } }]); S.sq.moon.wantCrouch = true;
    for (const [x, z] of [[143, -30], [157, -30], [146, -26], [154, -26]]) { const a = ally(x, z, { hold: true, crouch: true, hp: 160 }); a.wantCrouch = true; }
    // dead choi + rifle
    const choi = ally(1.2, -31.5, {}); choi.die(); choi.deadT = 5; choi.fall = -1.4;
  },
  phases: [
    {
      setup(S) { S.player(-0.6, -32, Math.PI * 0.5); P.crouchOn = true; },
      async run(S) {
        S.blur(8); S.fade(1, 0); SFX.ring(7);
        await S.wait(0.5); S.fade(0, 4); S.blur(0, 5);
        await S.wait(1.5);
        await S.say('서한준', '…병장님? 최 병장님!', { dur: 2.5 });
        S.later(0.3, () => S.arty(-20, -5)); S.later(2, () => S.arty(30, -12));
        await S.use([1.4, -31.6], '최민석 병장의 소총 줍기', 2.6, { y: 0.5 });
        S.take('none'); S.give('rifle');
        P.crouchOn = false;
        await S.radio('상황실', '전 초소에 알린다! 적이 강을 건너고 있다! 국경 다리 남단으로 집결하라!');
        S.obj('국경 다리 남단으로 후퇴', [150, -30]);
        S.hint('적이 쏘면 미니맵에 붉게 표시돼요 · <kbd>우클릭</kbd> 정조준', 5);
        // enemies climbing from the ice along the route
        const g1 = [[40, -52], [44, -55], [36, -56]].map(([x, z]) => enemy(x, z, { goTo: [42, -30], tag: 'r' }));
        const amb = S.every(3.5, () => { const a = rand(0, TAU), d = rand(20, 45); S.arty(P.pos.x + Math.cos(a) * d, P.pos.z + Math.sin(a) * d); });
        await S.until(() => P.pos.x > 55 || aliveEnemies('r').length === 0);
        [[86, -56], [92, -54], [80, -58], [96, -60]].forEach(([x, z], i) => enemy(x, z, { goTo: [88, -32], tag: 'r2', kind: i === 0 ? 'heavy' : 'rifle' }));
        for (const [x, z] of [[70, -22], [76, -25]]) { const a = ally(x, z, { hp: 80 }); a.goal = v3(140, 0, -26); }
        await S.until(() => P.pos.x > 125 || (aliveEnemies('r2').length === 0 && P.pos.x > 90));
        await S.reach([150, -30], 6, '국경 다리 남단으로 후퇴');
        S.stop(amb);
      },
    },
    {
      setup(S) { S.player(148, -24, 0); S.take('none'); S.give('rifle'); },
      async run(S) {
        S.obj('');
        await S.say('문재혁 중사', '이병! 살아 있었구나. 다리에 폭약 설치 중이다!');
        await S.say('문재혁 중사', '설치 끝날 때까지 다리 위로 아무도 못 건너오게 해!');
        S.obj('공병대가 폭약을 설치하는 동안 다리 사수', [150, -45]);
        const fromDeck = [[148, -98], [152, -96], [146, -94], [154, -99]], fromIce = [[130, -70], [170, -72], [125, -60], [175, -65]];
        const timerP = S.timer(100, '폭약 설치 중');
        // engineers ferry charges from the truck to the piers, rope down, lay the cord back
        let placed = 0; const NEED = G.charges.length; const t0 = G.time;
        const setCount = () => { G.chargeOn(placed); S.obj(`공병대가 폭약을 설치하는 동안 다리 사수 (폭약 ${placed}/${NEED})`, [150, -45]); };
        setCount();
        const engs = [];
        for (let i = 0; i < 5; i++) { const e = ally(137 + i * 0.9, -20.5 - (i % 2), { passive: true, noShoot: true, unarmed: true, hp: 120 }); e.name = '공병'; const bx = new THREE.Mesh(boxGeo(0.42, 0.3, 0.3), mat('charge', { color: 0x4a3a2a })); bx.position.set(0, 0.22, -0.32); e.m.torso.add(bx); e.box = bx; engs.push(e); }
        const sites = [[147.2, -54.5], [152.8, -54.5], [147.2, -54.5], [147.4, -68.5], [152.6, -68.5], [150.6, -82.5]];
        let nextSite = 0;
        const trip = async (e, delay) => {
          await S.wait(delay);
          while (e.alive && nextSite < sites.length) {
            const site = sites[nextSite++]; e.box.visible = true; e.goal = v3(site[0], 0, site[1]); e.speed = 4.2;
            await S.until(() => !e.alive || Math.hypot(e.pos.x - site[0], e.pos.z - site[1]) < 1.6);
            if (!e.alive) { nextSite = Math.min(nextSite, sites.indexOf(site)); break; }
            e.wantCrouch = true; e.goal = null; await S.wait(5); await S.until(() => !e.alive || G.time - t0 > 12 + placed * 14); if (!e.alive) break;
            e.box.visible = false; e.wantCrouch = false; placed = Math.min(NEED, placed + 1); setCount(); SFX.click();
            e.goal = v3(137 + rand(-1, 2), 0, -21 + rand(-1, 1));
            await S.until(() => !e.alive || e.pos.distanceTo(e.goal || e.pos) < 2);
            await S.wait(rand(1, 2.5));
          }
        };
        engs.forEach((e, i) => trip(e, i * 3.2));
        // shells catch two of them on the deck
        S.later(28, () => { const e = engs.find((x) => x.alive && x.pos.z < -40); if (e) { explode(e.pos.clone().add(v3(rand(-1, 1), 0.3, rand(-1, 1))), { noPlayer: true, size: 1.6, radius: 4, dmg: 400, vdmg: 0 }); S.sayBg('문재혁 중사', '공병 쓰러졌다! 다음 조, 이어서 가!', { dur: 2.6 }); } });
        S.later(62, () => { const e = engs.find((x) => x.alive && x.pos.z < -40); if (e) explode(e.pos.clone().add(v3(rand(-1, 1), 0.3, rand(-1, 1))), { noPlayer: true, size: 1.6, radius: 4, dmg: 400, vdmg: 0 }); });
        // never stall: the clock guarantees progress even if every engineer is down
        const ensure = S.every(1, () => { const want = Math.floor(clamp((G.time - t0) / 95, 0, 1) * NEED); if (placed < want - 1) { placed = want - 1; setCount(); } });
        const spawn = async () => {
          await S.wave({ n: 6, from: fromDeck, to: [[148, -44], [152, -44], [150, -50]], tag: 'b', interval: 0.9, view: 70 });
          await S.wait(10);
          await S.wave({ n: 5, from: fromIce, to: [[140, -35], [160, -35]], tag: 'b', interval: 1, heavy: 0.2 });
          await S.wait(12);
          await S.wave({ n: 8, from: fromDeck, to: [[148, -44], [152, -40]], tag: 'b', interval: 0.7, heavy: 0.15, rush: 0.3 });
          await S.wait(10);
          await S.wave({ n: 6, from: fromIce.concat(fromDeck), to: [[145, -36], [155, -36]], tag: 'b', interval: 0.8 });
        };
        spawn();
        S.later(36, () => S.sayBg('문재혁 중사', '첫 번째 교각 완료! 계속 막아라!', { dur: 3 }));
        S.later(70, () => S.sayBg('문재혁 중사', '기폭선 연결 중이다! 조금만 더 버텨라!', { dur: 3 }));
        await timerP;
        S.stop(ensure); placed = NEED; setCount();
        for (const e of engs) if (e.alive) { e.goal = v3(140 + rand(-3, 3), 0, -20 + rand(-2, 2)); e.box.visible = false; }
        S.ammoCrate(146, -22);
      },
    },
    {
      setup(S) { S.player(148, -27, 0); S.take('none'); S.give('rifle'); S.ammoCrate(146, -22); G.chargeOn(G.charges.length); },
      async run(S) {
        await S.say('문재혁 중사', '설치 완료! 전원 다리에서 물러나라! 기폭한다!');
        await S.wait(1);
        S.sayBg('문재혁 중사', '…3, 2, 1, 기폭!', { dur: 2 }); await S.wait(2.2);
        if (G.plungerT) tweenObj(G.plungerT, { p: [G.plungerT.position.x, G.plungerT.position.y - 0.22, G.plungerT.position.z] }, 0.15);
        SFX.click(); await S.wait(0.4); SFX.click();
        S.arty(151, -38.5);
        S.later(0.9, () => { if (G.wire) G.wire.geometry.setDrawRange(0, 3); });
        await S.wait(1.6);
        await S.say('문재혁 중사', '기폭선이 끊어졌다! 포격에 선이 나갔다!');
        // armour pours onto the bridge: one at a time, more queued on the north bank
        const br = G.br, yFn = onBridgeY(br);
        const tanks = [];
        const tankAt = (z, path, o = {}) => { const t = new Vehicle('tank', 150, z, Object.assign({ path, speed: 3, yFn, reload: 8, hp: 560 }, o)); tanks.push(t); return t; };
        const t1 = tankAt(-150, [[150, -110], [150, -68]]);
        tankAt(-175, [[150, -122]], { reload: 99 }); tankAt(-190, [[150, -136]], { reload: 99 }); tankAt(-205, [[150, -150]], { reload: 99 });
        for (const [x, z] of [[148, -112], [153, -115], [146, -118], [155, -120], [150, -124]]) enemy(x, z, { goTo: [150, -50], tag: 'c' });
        await S.say('문재혁 중사', '전차다! 저기 쓰러진 대전차병, 로켓 챙겨라!');
        const rpgP = S.pickupWeapon(143, -29, 'rpg', 'PZ-9 대전차 로켓 줍기', 0.5);
        S.obj('쓰러진 대전차병의 로켓을 주워라', [143, -29]);
        const dead = ally(143.5, -30.2, {}); dead.die(); dead.deadT = 5;
        await rpgP;
        // rocket crate at the south end
        addBox(141.5, G.groundAt(141.5, -26), -26, 1.3, 0.5, 0.6, mat('rktbox', { color: 0x3e4a32 }), { dynamic: true });
        S.station(v3(141.5, G.groundAt(141.5, -26) + 0.7, -26), '로켓 보급', () => { if (P.ammo.rpg) { P.ammo.rpg.res = Math.max(P.ammo.rpg.res, 3); toast('로켓 보급'); } }, 1.6);
        S.obj('전차를 막아라', t1.pos);
        S.hint('<kbd>F</kbd> 남단 로켓 상자에서 보급 · 전차는 로켓 두 발', 6);
        let hit = false, told = false;
        G.onExplode = (pos) => { if (pos.distanceTo(v3(150, -2.2, -56.6)) < 4.5) hit = true; };
        const tellPier = async () => { if (told) return; told = true; await S.say('문재혁 중사', '끝이 없다! 교각을 날려야 한다!', { dur: 2.4 }); await S.say('문재혁 중사', '저 빨간 불빛! 첫 번째 교각 폭약을 직접 맞혀라!', { dur: 3 }); S.obj('로켓으로 교각의 폭약(붉은 불빛)을 맞혀라', v3(150, -2.2, -56.6)); S.hint('절벽 끝에 붙어서 다리 아래 첫 번째 교각을 조준하세요', 6); };
        const mark = S.every(0.3, () => { if (!told) { const lead = tanks.find((t) => t.alive && t.pos.z > -130); if (lead) G.objPos = lead.pos.clone().add(v3(0, 2, 0)); } });
        // when a tank dies the next one pushes up behind its wreck
        const pusher = S.every(0.5, () => { if (hit) return; const front = tanks.filter((t) => t.alive).sort((a, b) => b.pos.z - a.pos.z)[0]; const wrecks = tanks.filter((t) => !t.alive && t.pos.z > -100); if (front && wrecks.length && !front.pushing) { front.pushing = true; front.o.reload = 8; front.path = [v3(150, 0, Math.min(-82, wrecks[0].pos.z - 9))]; front.pi = 0; S.sayBg('문재혁 중사', '다음 놈 온다!', { dur: 1.8 }); tellPier(); } });
        S.later(45, () => tellPier());
        const nag = S.every(9, () => { if (!hit) { if (P.ammo.rpg && P.ammo.rpg.mag + P.ammo.rpg.res <= 0) { P.ammo.rpg.res = 2; toast('+ 로켓 2발'); } } });
        await S.until(() => hit);
        S.stop(nag); S.stop(mark); S.stop(pusher); G.onExplode = null; for (const c of G.charges) { c.on = false; c.lt.visible = false; } G.chargeLight = null;
        const tank = t1;
        // collapse
        await S.cut(async () => {
          G.timeScale = 0.28; S.obj('');
          await S.cam(v3(132, 3, -33), v3(150, -2, -65), 0);
          S.explode([150, -2.2, -57], { noPlayer: true, size: 3, radius: 8, dmg: 0, vdmg: 0 });
          S.later(0.15, () => S.explode([150, -1, -64], { noPlayer: true, size: 2.4, dmg: 0, vdmg: 0 }));
          for (let i = 0; i < 3; i++) { const s = br.segs[i]; s.down = true; removeCols(s.cols); }
          const fall = (g, rx, rz, dy, delay) => S.later(delay, () => tweenObj(g, { p: [g.position.x + rand(-1, 1), dy, g.position.z + rand(-1, 1)], r: [rx, 0, rz] }, 1.4, (t) => t * t));
          fall(br.segs[0].g, -0.5, 0.15, -6.5, 0.1); fall(br.segs[1].g, 0.4, -0.2, -6.8, 0.0); fall(br.segs[2].g, 0.3, 0.1, -5.2, 0.35);
          fall(br.piers[0], 0.5, 0.2, -6.5, 0.05);
          for (const tk of tanks) {
            if (tk.pos.z > -86) { // on the collapsing spans: everything goes into the river, wrecks included
              tk.stopped = true; const y0 = tk.pos.y, rz = rand(-0.4, 0.4); S.later(0.35, () => S.tween(1.6, (k) => { tk.o.yFn = () => y0 - 6.2 * k * k; tk.m.root.rotation.x = 0.5 * k; tk.m.root.rotation.z = rz * k; if (!tk.alive) { tk.pos.y = y0 - 6.2 * k * k; tk.m.root.position.y = tk.pos.y; } }));
              S.later(1.4, () => { if (tk.alive) tk.die(PT); FX.snowPuff(tk.pos); FX.dust(tk.pos, 30, [0.8, 0.82, 0.85], 2); });
            } else { tk.path = [v3(150, 0, Math.min(tk.pos.z, -92))]; tk.pi = 0; tk.o.reload = 99; S.later(2, () => { tk.stopped = true; }); }
          }
          for (const a of aliveEnemies()) if (a.pos.z < -40 && a.pos.z > -90) a.die();
          S.shake(1.2);
          await S.cam(v3(128, 5, -28), v3(150, -5, -68), 2.4);
          G.timeScale = 1;
          await S.wait(1.5);
          await S.say('문재혁 중사', '…무너졌다! 다리가 무너졌어!', { dur: 2.5 });
        });
        P.hp = 100;
        await S.say('문재혁 중사', '잘했다, 이병! 이제 놈들은 여길 못 건너…', { dur: 2.4, wait: 1.6 });
        S.arty(P.pos.x + 2, P.pos.z + 1);
        await S.wait(1.6);
        P.god = true; S.white(1); S.shake(1.5); SFX.ring(5);
        await S.fade(1, 0.4);
        await S.wait(2);
      },
    },
  ],
});

/* ---------------- Hoeryong city ---------------- */