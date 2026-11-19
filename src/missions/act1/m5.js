function passGround() {
  return (x, z) => {
    const side = Math.max(0, Math.abs(x) - 70) * 0.35; const ridge = z < -200 ? (-z - 200) * 0.12 : 0;
    return side + ridge + Math.sin(x * 0.04) * 0.8 + Math.sin(z * 0.03) * 0.8 - (z > 6 && z < 10 && Math.abs(x) < 64 ? 1.4 * Math.sin((z - 6) / 4 * Math.PI) : 0);
  };
}

/* ========== MISSION 5 「철의 겨울」 ========== */
defMission({
  id: 'm5', act: '1막 · 국경 붕괴', num: '미션 5', title: '철의 겨울',
  dateText: '2032년 1월 7일 09:30', dateShort: '2032.01.07', place: '무산 방면 고개 방어선', placeShort: '무산 고개', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: ENV.blizzard, loadout: { weapons: ['rifle', 'pistol'], nades: 4 },
  bounds: [-70, -40, 70, 140],
  build(S) {
    G.groundAt = passGround();
    buildTerrain(700, 160, 'snow', 8, 0xffffff, 0, -100);
    buildMountains(500, 30, 0xb8c0c8, 100, 220);
    roadStrip(0, -185, 10, 330, 0);
    // trench line along z=8 (sunken) with sandbags on north lip z=4
    for (let x = -60; x <= 60; x += 7) sandbags(x, 4.2, 6.6, 0, 1.0);
    for (const x of [-40, 0, 40]) sandbagRing(x, 16, 2.4, -Math.PI / 2);
    room(0, 26, 8, 6, 2.6, [{ side: 'n', at: 0, w: 1.4 }], { floor: true, roofMat: MT.sandbag() });
    S.ammoCrate(-6, 12); S.ammoCrate(18, 12);
    // field obstacles
    for (let i = 0; i < 14; i++) { const x = rand(-60, 60), z = rand(-150, -20); if ([-17, 16, -40, 37, 0, 24].some((l) => Math.abs(x - l) < 7)) continue; Math.random() < 0.5 ? tankWreck(x, z, rand(0, 3), Math.random() < 0.4) : rubble(x, z, rand(1, 1.5)); }
    for (let i = 0; i < 40; i++) pine(pick([-1, 1]) * rand(70, 160), rand(-250, 120), rand(1, 1.8));
    wire(-60, -8, -10, -8); wire(10, -8, 60, -8);
    squad(S, [
      { key: 'kang', name: '강태현 상사', x: -4, z: 6.5, o: { hold: true } },
      { key: 'lee', name: '리선우 병장', x: 8, z: 6.5, o: { hold: true } },
      { key: 'yoon', name: '윤하린 중사', x: -12, z: 6.5, o: { hold: true } },
      { key: 'han', name: '한지운 하사', x: 14, z: 6.5, o: { hold: true } },
    ]);
    for (let x = -56; x <= 56; x += 9) if (Math.abs(x) > 16) ally(x, 6.6, { hold: true, hp: 160 });
  },
  phases: [
    {
      setup(S) { S.player(2, 7, 0); },
      async run(S) {
        await S.say('강태현 상사', '이 고개가 뚫리면 무산까지 막을 데가 없다.');
        await S.say('윤하린 중사', '눈보라 때문에 드론이 안 뜹니다. 눈으로 봐야 합니다.');
        S.obj('고개 방어선 사수');
        await S.wait(5);
        // silence, then the whole valley starts to rumble
        const rumble = makeLoop('engine'); rumble.set(0.05, 0, 30); S.tween(7, (k) => rumble.set(0.05 + k * 0.6, 0, 30 + k * 18));
        await S.say('윤하린 중사', '…엔진 소리입니다. 하나가 아닙니다.', { dur: 2.4 });
        await S.wait(2.5);
        for (let i = 0; i < 3; i++) S.later(i * 0.7, () => new Vehicle('aheli', -60 + i * 50, -500, { path: [[-60 + i * 50, 45, -120], [-50 + i * 50, 40, 60], [-40 + i * 50, 60, 500]], speed: 38, armed: false, hp: 9999, invuln: true }));
        S.later(1.5, () => jetPass([-30, 90, -700], [10, 70, 700], { bombs: [[-45, -2], [-20, -4], [25, -3], [50, -1]], noPlayer: true, speed: 220 }));
        S.later(2.0, () => jetPass([30, 95, -720], [60, 75, 680], { bombs: [[10, -6], [38, 0]], noPlayer: true, speed: 220 }));
        await S.say('강태현 상사', '공습이다! 참호에 붙어라!', { dur: 2 });
        await S.wait(5);
        // the jets come back around high and leave
        S.later(1, () => jetPass([700, 160, 200], [-700, 140, -300], { speed: 200 })); S.later(1.6, () => jetPass([720, 170, 240], [-680, 150, -260], { speed: 200 }));
        await S.radio('사령부', '고개 방어선, 적 기계화 보병 대대 규모 접근 중. 버텨라!', { dur: 3 });
        rumble.stop();
        // then the ground assault never lets up
        const F = [[-40, -160], [0, -170], [40, -160], [-20, -150], [20, -150], [-60, -140], [60, -140]];
        const pr = S.pressure({ from: F, to: [[-30, -6], [0, -6], [30, -6], [-15, -12], [15, -12], [-45, -10], [45, -10]], tag: 'i', max: 14, every: 0.9, heavy: 0.18, rush: 0.2, view: 60 });
        S.later(18, () => pr.set(18));
        await S.wait(14);
        // rockets in the trench, right behind the player — marked until he has them
        { const bx = 6, bz = 9.4, by = G.groundAt(bx, bz); addBox(bx, by, bz, 1.4, 0.5, 0.6, mat('rpgbox', { color: 0x3c4430 }), { dynamic: true });
          S.station(v3(bx, by + 0.8, bz), '대전차 로켓 챙기기', () => { giveWeapon('rpg', true); if (P.ammo.rpg) P.ammo.rpg.res = Math.max(P.ammo.rpg.res, 4); G.atBox = null; }, 2.4);
          G.atBox = v3(bx, by + 1.2, bz); }
        S.sayBg('강태현 상사', '서한준! 참호 안 상자에 로켓 있다! 챙겨 둬!', { dur: 2.6 });
        S.hint('참호 안 상자(노란 마름모)에서 대전차 로켓을 챙기세요 <kbd>F</kbd>', 6);
        await S.wait(2);
        await S.threat('bmp', { x: -10, z: -230, path: [[-10, -110], [-6, -40]], who: '리선우 병장', line: '적 BMP! 정면임다!' }).catch(() => {});
        await S.wait(14);
        pr.stop(); await S.until(() => aliveEnemies('i').length <= 3);
        await S.say('리선우 병장', '보병 물러감다!');
        await S.say('윤하린 중사', '아닙니다… 엔진 소리. 전차입니다!');
      },
    },
    {
      setup(S) { S.player(2, 7, 0); },
      async run(S) {
        await S.say('강태현 상사', '서한준! 뒤쪽 벙커에 유도미사일 있다! 꺼내 와!');
        S.obj('벙커에서 유도미사일 챙기기', [0, 24]);
        await S.use([0, 25], 'K-AT 유도미사일 챙기기', 3, { y: G.groundAt(0, 25) + 1 });
        S.give('atgm');
        S.hint('<kbd>우클릭</kbd> 조준을 유지하면 미사일이 조준점을 따라가요', 7);
        const tanks = [];
        const mk = (x, z, path) => { const t = new Vehicle('tank', x, z, { path, speed: 3.2, reload: 9, range: 100 }); tanks.push(t); return t; };
        mk(-20, -260, [[-20, -120], [-15, -40]]); mk(20, -280, [[18, -130], [15, -45]]);
        new Vehicle('apc', 0, -240, { path: [[0, -100], [0, -50]], speed: 4 });
        S.later(25, () => { mk(-45, -270, [[-40, -140], [-35, -50]]); mk(42, -280, [[40, -140], [32, -55]]); new Vehicle('apc', 30, -260, { path: [[25, -110], [20, -60]], speed: 4 }); });
        S.later(10, () => S.wave({ n: 8, from: [[-30, -170], [30, -170]], to: [[-20, -10], [20, -10]], tag: 'ti', interval: 0.7 }));
        let killed = 0; const need = 4;
        S.obj(`적 전차 격파 (0/${need})`);
        await S.until(() => { const k = tanks.filter((t) => !t.alive).length; if (k !== killed) { killed = k; S.obj(`적 전차 격파 (${k}/${need})`); } return k >= need; });
        await S.say('한지운 하사', '네 대 다 잡았다! 잘했다, 서한준!');
      },
    },
    {
      setup(S) { S.player(2, 7, 0); S.give('atgm'); },
      async run(S) {
        await S.say('윤하린 중사', '…저기, 능선 위. 한 대 더 있습니다. 안테나가 잔뜩 달린 놈입니다.');
        const cmd = new Vehicle('tank', 0, -330, { command: true, path: [[0, -300]], speed: 2, hp: 99999, invuln: true, armed: false, color: 0x4a4e48 });
        await S.say('강태현 상사', '지휘 전차다. 볼코프 그놈이 직접 왔구만.');
        S.obj('포격을 버텨라');
        const pound = S.every(1.4, () => { const x = rand(-50, 50), z = rand(-4, 30); S.arty(x, z, { dmg: 130 }); });
        S.later(4, () => S.wave({ n: 10, from: [[-30, -60], [30, -60], [0, -70]], to: [[-6, 5], [6, 5], [0, 8]], tag: 'f', rush: 0.6, interval: 0.4 }));
        await S.wait(10);
        await S.killAll('f', 3);
        S.stop(pound);
        await S.cut(async () => {
          const kang = S.sq.kang; kang.hold = true; kang.pos.set(-3, kang.pos.y, 8); kang.yaw = 0;
          const e1 = enemy(-1, 4.8, { rush: true, noShoot: true, passive: true }); e1.yaw = Math.PI;
          await S.cam(v3(-8, G.groundAt(-8, 10) + 1.4, 11), v3(-2, G.groundAt(-2, 7) + 1, 6.5), 0);
          await S.say('강태현 상사', '참호에 놈들이 들어왔다! 엎드려!', { dur: 2 });
          kang.m.armR.rotation.x = -2.6; await S.wait(0.5);
          S.explode([-1.5, G.groundAt(-1.5, 6) + 0.3, 6], { noPlayer: true, size: 1.5, dmg: 0 }); e1.die(); kang.wantCrouch = true; kang.downT = 999; kang.m.armR.rotation.x = -1.0;
          await S.cam(v3(-6, G.groundAt(-6, 10) + 1.1, 10.5), v3(-3, G.groundAt(-3, 8) + 0.6, 8), 2);
          await S.say('윤하린 중사', '상사님! 상사님!', { dur: 2 });
          await S.say('강태현 상사', '…괜찮다… 다리만… 젠장.', { dur: 2.5 });
          await S.say('무전 · 사령부', '북부 방어선 붕괴. 전 부대 후퇴하라. 반복한다, 후퇴하라.', { radio: true, dur: 4 });
        });
        for (const a of aliveEnemies()) if (a.pos.z > -40) a.die();
        await S.say('리선우 병장', '제가 상사님 업겠슴다! 소대장님, 날래 앞장서 주시오!');
        S.obj('후방 집결지로 후퇴', [0, 120]);
        followMode(S, ['lee', 'yoon', 'han']);
        S.sq.kang.downT = 0; S.sq.kang.follow = { offset: [2.4, 3.2] }; S.sq.kang.hold = false;
        const pound2 = S.every(1.8, () => { S.arty(P.pos.x + rand(-30, 30), P.pos.z + rand(-40, -15), { dmg: 120 }); });
        await S.reach([0, 120], 6);
        S.stop(pound2);
        await S.fade(1, 1.5);
      },
    },
  ],
});
