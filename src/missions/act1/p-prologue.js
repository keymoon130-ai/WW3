defMission({
  id: 'p', act: '1막 · 국경 붕괴', num: '프롤로그', title: '0시',
  dateText: '2031년 12월 31일 23:52', dateShort: '2031.12.31', place: '두만강 제3초소', who: '서한준 이병 · 제12국경수비대', whoShort: '서한준',
  env: ENV.nightSnow, loadout: { weapons: ['rifle'], nades: 0, noFire: true },
  bounds: [-40, -36, 40, 10],
  build(S) {
    buildTumen();
    guardPost(0, -33);
    sandbags(-9, -36, 6, 0); sandbags(9, -36, 6, 0); sandbags(-14, -33, 4, Math.PI / 2); sandbags(14, -33, 4, Math.PI / 2);
    addBox(0, 0, -30.2, 0.1, 0.1, 0.1, MT.dark(), { collide: false });
    lampLight.position.set(0, 2.1, -33); lampLight.intensity = 5;
    addMesh(bg(0.25, 0.08, 0.25), basicMat('lampw', 0xffe0a0), 0, G.groundAt(0, -33) + 2.42, -33, { cast: false });
    // distant bridge silhouette
    buildBridge(150);
    for (let i = 0; i < 4; i++) glow(150 + (i % 2 ? 4 : -4), 1.4, -40 - i * 18, 0xffd080, 2.5);
    // distant south village lights
    for (let i = 0; i < 30; i++) glow(rand(-200, 200), rand(1, 8), rand(180, 260), pick([0xffc070, 0xffe0a0]), rand(1.5, 3));
    // the ground around the post: frozen scrub, dry grass, a few trees (patrol path kept clear)
    scatterVeg(-40, -36, 40, 10, 140, [[-16, -38, 16, -29]], { tree: 0.15 });
    for (let x = -38; x < 38; x += 4) { if (Math.abs(x) < 16) continue; grassTuft(x + rand(-1, 1), -37.5 + rand(-0.6, 0.6), 1.2); }
    squad(S, [{ key: 'choi', name: '최민석 병장', x: -0.9, z: -33.6, yaw: Math.atan2(-1.5, -1.2), o: { passive: true, noShoot: true } }]);
  },
  phases: [
    {
      setup(S) { S.player(0.6, -32.4, 0); },
      async run(S) {
        S.clock('', '23:52');
        S.hint('<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 이동 · 마우스로 둘러보기', 5);
        await S.say('최민석 병장', '서한준, 올해 마지막 근무다. 정신 차려라.');
        await S.say('최민석 병장', '자정 전에 순찰 한 바퀴 돌고 와. 동쪽 진지부터.');
        await S.reach([12, -34.5], 2.5, '동쪽 경계 진지 확인');
        S.hint('<kbd>Shift</kbd> 누르고 있는 동안 달리기', 4);
        S.clock('', '23:55');
        await S.reach([-12, -34.5], 2.5, '서쪽 경계 진지 확인');
        S.hint('<kbd>C</kbd> 앉기 · <kbd>Space</kbd> 점프', 4);
        await S.reach([0.4, -32.6], 1.6, '초소로 복귀');
        S.obj('');
        S.clock('', '23:59');
        await S.say('최민석 병장', '추운데 고생했다. 컵라면 물 올려놨다.');
        await S.say('서한준', '병장님, 저 전역까지 딱 육백 일 남았습니다.');
        await S.say('최민석 병장', '그런 건 세는 거 아니다. 자, 곧 넘어간다.');
        // countdown
        for (let i = 10; i >= 1; i--) { S.clock('2031년 12월 31일', `23:59:${String(60 - i).padStart(2, '0')}`); if (i <= 5) S.sayBg('최민석 병장', String(i), { dur: 0.9 }); await S.wait(1); }
        S.clock('2032년 1월 1일', '00:00:00');
        for (let i = 0; i < 8; i++) S.later(i * 0.45, () => firework(rand(-140, 140), rand(200, 260), rand(55, 85)));
        const fw = S.every(1.1, () => firework(rand(-160, 160), rand(190, 270), rand(50, 90)));
        await S.say('최민석 병장', '새해 복 많이 받아라, 서한준.');
        await S.say('서한준', '병장님도 새해 복 많이 받으십시오. …서울은 지금 통일 첫 새해라고 불꽃놀이 한답니다.', { dur: 3.4 });
        S.clock('', '00:04');
        await S.wait(1);
        S.give('binoc');
        S.obj('쌍안경으로 강 건너편 관측');
        S.hint('<kbd>우클릭</kbd> 쌍안경 보기 · 북쪽 강 건너를 살펴보세요', 6);
        const cars = convoyLights(-150, -260, 300, 22, 7);
        convoyLights(-175, 320, -280, 18, 6); convoyLights(-200, -300, 300, 14, 5);
        await S.until(() => P.ads > 0.9 && camera.getWorldDirection(v3()).z < -0.85);
        await S.wait(2.5);
        await S.say('서한준', '…병장님. 강 건너에 차량 불빛이 계속 움직입니다.', { dur: 3 });
        await S.say('최민석 병장', '이 시간에? 어디 봐.', { dur: 2 });
        moveSq(S, 'choi', 0.6, -33.9);
        await S.say('최민석 병장', '…상황실, 여기 제3초소. 강 건너 차량 다수, 동쪽으로 이동 중.', { radio: true });
        await S.say('상황실', '제3초소, 확인한다. 계속 관측하라.', { radio: true });
        S.stop(fw); S.obj('');
        await S.wait(2.5);
        SFX.radio();
        await S.say('사령부', '전 부대에 알린다. 국경 인근 영공에 미확인 항공기 50대 가량 감지된다. 확인 바란다.', { radio: true, dur: 4.2 });
        await S.say('최민석 병장', '…오십 대?', { dur: 1.6 });
        // fighters stream south overhead: they are not here for us
        for (let i = 0; i < 9; i++) S.later(0.4 + i * 0.55, () => { const x = rand(-140, 140); jetPass([x, rand(70, 110), -700], [x + rand(-80, 80), rand(70, 110), 900], { speed: 210, color: 0x50565c }); });
        await S.wait(1.6);
        await S.say('서한준', '전투기입니다… 남쪽으로 갑니다!', { dur: 2.2 });
        await S.wait(1.5);
        // artillery flashes on north bank
        const flashes = S.every(0.25, () => { const p = v3(rand(-150, 250), rand(-2, 6) + 8, rand(-190, -150)); for (let i = 0; i < 3; i++) particle({ add: true, x: p.x, y: p.y, z: p.z, life: 0.25, size: rand(10, 22), alpha: 0.9, color: [1, 0.65, 0.3] }); flashLight(p, 0xff9040, 40, 160, 0.25); SFX.boomFar(p); });
        await S.wait(1.2);
        await S.say('서한준', '저거… 축포가 아닌 것 같습니다.', { dur: 2 });
        await S.say('최민석 병장', '포격이다! 엎드려!', { dur: 1.6 });
        S.arty(40, -10); S.arty(-35, 5, { delay: 0.6 }); S.arty(70, -30, { delay: 1.1 });
        S.later(0.4, () => S.radio('사령부', '전 부대! 중국군 포격 개시! 두만강 전 구간에서 중국 인민해방군 도하 시작, 영공 침범 항공기는 러시아 공군으로 확인! 중·러 연합군 침공이다!', { dur: 5.2 }));
        await S.wait(2.2);
        S.arty(-20, -15); S.arty(25, -5, { delay: 0.5 }); S.arty(8, 4, { delay: 1.2 });
        await S.wait(2.8);
        await S.cut(async () => {
          await S.cam(camera.position.clone(), camera.position.clone().add(v3(0.2, 0.3, -5)), 0);
          S.sayBg('최민석 병장', '서한준!', { dur: 1.5 });
          await S.wait(0.6);
          S.explode([1, 0.5, -33.5], { noPlayer: true, radius: 6, dmg: 0, size: 2.2 });
          S.white(1.5); S.shake(1.6);
          await S.cam(camera.position.clone().add(v3(0.3, -1.1, 0.6)), camera.position.clone().add(v3(2, 2.5, -4)), 0.6);
          await S.fade(1, 0.5);
        });
        S.stop(flashes); S.clock();
        await S.wait(1.5);
      },
    },
  ],
});

/* ========== MISSION 1 「배수진」 ========== */