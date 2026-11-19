defMission({
  id: 'ep', act: '에필로그', num: '에필로그', title: '이상 무',
  dateText: '2032년 12월 31일 23:52', dateShort: '2032.12.31', place: '두만강 제3초소 (재건)', placeShort: '제3초소', who: '서한준 상병 · 제12국경수비대', whoShort: '서한준',
  env: Object.assign({}, ENV.nightSnow, { snow: 0.6, exposure: 1.25 }),
  loadout: { weapons: ['rifle'], nades: 0, noFire: true },
  bounds: [-40, -36, 40, 20],
  build(S) {
    buildTumen();
    guardPost(0, -33);
    sandbags(-9, -36, 6, 0); sandbags(9, -36, 6, 0);
    lampLight.position.set(0, 2.1, -33); lampLight.intensity = 5;
    addMesh(bg(0.25, 0.08, 0.25), basicMat('lampw', 0xffe0a0), 0, G.groundAt(0, -33) + 2.42, -33, { cast: false });
    // helmet on the ledge
    const hm = new THREE.Mesh(HELMG, mat('helmK', { color: 0x474c32, rough: 0.7 })); hm.position.set(0.9, G.groundAt(0.9, -34.2) + 1.12, -34.4); hm.scale.setScalar(1.15); G.world.add(hm); G.helmet = hm;
    // rebuilt bridge with lights
    buildBridge(150);
    for (let i = 0; i < 6; i++) { glow(146, 1.4, -42 - i * 11, 0xfff0c0, 2); glow(154, 1.4, -42 - i * 11, 0xfff0c0, 2); }
    for (let i = 0; i < 30; i++) glow(rand(-200, 200), rand(1, 8), rand(180, 260), pick([0xffc070, 0xffe0a0]), rand(1.5, 3));
    for (let i = 0; i < 24; i++) glow(rand(-250, 300), rand(1, 6), rand(-230, -180), pick([0xffc070, 0xffe0a0]), rand(1.5, 3));
    squad(S, [
      { key: 'ji', name: '한지운 중사', x: 6, z: 2, o: { passive: true, noShoot: true } },
      { key: 'lee', name: '리선우 하사', x: 9, z: 3, o: { passive: true, noShoot: true } },
    ]);
  },
  phases: [
    {
      setup(S) { S.player(0.4, -32.4, 0); },
      async run(S) {
        S.fade(1, 0);
        await runBrief(S, { kicker: '여덟 달 뒤 · 2032년 12월', title: '두만강', map: { cities: ['busan', 'pyeong', 'seoul', 'pyongyang', 'hoeryong'], hot: 'hoeryong', arrows: [
            { a: [127.0, 37.05], b: [126.98, 37.5], k: 0, col: '#4aa3ff', w: 10 }, { a: [126.98, 37.6], b: [125.8, 38.95], k: 0, col: '#4aa3ff', w: 10 }, { a: [125.9, 39.1], b: [129.5, 42.3], k: 0, col: '#4aa3ff', w: 10, label: '국경 회복', lx: -150, ly: -20 }] }, lines: [
          { t: '3월 15일 쌍룡 작전. 3월 28일 서울 탈환. 4월 3일 평양.', grow: [0, 1], growT: 2 },
          { t: '4월 9일, 두만강에서 마지막 부교가 끊겼다.', grow: [2], growT: 1.6 },
          { t: '5월, 중국과 러시아는 휴전 협정에 서명했다. 국경은 다시 두만강이 되었다.' },
          { t: '서한준은 제12국경수비대 제3초소로 돌아갔다.' },
          { t: '통일 후 두 번째 새해가 다가온다.' }] });
        S.fade(0, 1.5);
        S.clock('', '23:52');
        await S.wait(1.5);
        await S.say('서한준', '(일 년. 같은 초소, 같은 강. 이번엔 내가 선임이다.)', { dur: 4 });
        await S.say('서한준', '(새로 온 신병은 아까 교대했다. 춥다고 울상이었다.)', { dur: 4 });
        S.obj('초소 앞으로 나가 보기', [2, -28]);
        moveSq(S, 'ji', 2.5, -27); moveSq(S, 'lee', 4.5, -27.5);
        await S.reach([2, -29], 2.5);
        S.sq.ji.yaw = Math.atan2(-(P.pos.x - S.sq.ji.pos.x), -(P.pos.z - S.sq.ji.pos.z)); S.sq.lee.yaw = S.sq.ji.yaw;
        await S.say('한지운 중사', '서한준. 순찰 돌다가 들렀다.');
        await S.say('서한준', '중사님! 하사님! 여긴 어쩐 일로…');
        await S.say('리선우 하사', '새해는 여기서 넘기고 싶었지비. 다 같이.');
        S.clock('', '23:58');
        await S.wait(1);
        S.sayBg('', '(휴대폰 진동)', { dur: 2 });
        await S.wait(2);
        await S.say('리선우 하사', '…예, 어마이. 예. 초소에 있슴다. 일없슴다, 안 춥슴다.', { dur: 3.5 });
        await S.say('리선우 하사', '아바이도요? …예. 새해 복 많이 받으시오. 곧 내려가갔슴다.', { dur: 4 });
        await S.say('한지운 중사', '(선우는 2월에 부산에서 가족을 찾았다.)', { dur: 3.5 });
        S.obj('상황실에 정시 보고', v3(-0.9, G.groundAt(-1, -33) + 1, -34.3));
        await S.use(v3(-0.9, G.groundAt(-1, -33) + 1, -34.3), '무전기로 보고하기', 3);
        await S.say('서한준', '상황실, 여기 제3초소. 23시 59분 현재…', { radio: true, dur: 3 });
        await S.say('서한준', '이상 무.', { radio: true, dur: 2.5 });
        await S.say('상황실', '제3초소, 수신했다. …새해 복 많이 받아라.', { radio: true, dur: 3 });
        S.obj('');
        for (let i = 10; i >= 1; i--) { S.clock('2032년 12월 31일', `23:59:${String(60 - i).padStart(2, '0')}`); if (i <= 5) S.sayBg('', String(i), { dur: 0.9 }); await S.wait(1); }
        S.clock('2033년 1월 1일', '00:00:00');
        // the snow eases off and the whole far bank lights up: big bursts right across the river
        S.env({ fogD: 0.0042, snow: 0.2 });
        for (let i = 0; i < 12; i++) S.later(i * 0.35, () => firework(rand(-130, 150), rand(-190, -120), rand(55, 85), null, 3.4));
        S.every(0.7, () => firework(rand(-160, 180), rand(-200, -115), rand(50, 95), null, rand(2.8, 4)));
        S.every(1.4, () => firework(rand(-160, 160), rand(190, 270), rand(50, 90)));
        await S.wait(2);
        await S.say('서한준', '…강 건너에서도 쏩니다.', { dur: 2.5 });
        await S.say('한지운 중사', '이번엔 진짜 축포다.', { dur: 3 });
        await S.wait(1.5);
        await S.say('서한준', '(최 병장님. 새해 복 많이 받으십시오.)', { dur: 3.6 });
        await S.say('서한준', '(…전역까지, 이제 233일 남았습니다.)', { dur: 3.8 });
        S.sayBg('', '(문자 — 어머니: 한준아, 새해 복 많이 받아. 불꽃놀이 같이 못 봐서 아쉽다.)', { dur: 4 });
        await S.wait(4.2);
        await S.say('서한준', '(내년엔 꼭 같이 봐요, 어머니.)', { dur: 3.2 });
        await S.wait(1);
        S.sayBg('', '(휴대폰 알림 — 영상 메시지)', { dur: 2.2 });
        await S.wait(2.4);
        await S.say('에단 콜', 'Happy New Year.', { dur: 3 });
        await S.wait(1);
        await S.cut(async () => {
          const h = G.helmet.position; S.camFov(50);
          await S.cam(v3(h.x - 1.6, h.y + 0.3, h.z + 1.8), h.clone(), 0);
          await S.cam(v3(h.x - 0.9, h.y + 0.15, h.z + 1.0), h.clone().add(v3(0, 0.1, -3)), 8, (t) => t);
          await S.fade(1, 2.5);
        });
        S.clock();
        await S.credits();
        await S.black(['강태현 상사', '최민석 병장', '그리고 돌아오지 못한 모든 이들에게'], 5.5);
      },
    },
  ],
});
