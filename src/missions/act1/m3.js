function buildVillage(o = {}) {
  G.groundAt = (x, z) => Math.sin(x * 0.02) * 1.2 + Math.cos(z * 0.025) * 1 + (Math.abs(x) > 70 ? (Math.abs(x) - 70) * 0.18 : 0);
  buildTerrain(600, 140, 'snow', 8);
  buildMountains(600, 34, 0x8a929c, 80, 170);
  for (let i = 0; i < 60; i++) { const x = pick([-1, 1]) * rand(75, 200), z = rand(-200, 150); pine(x, z, rand(1, 1.7)); }
  for (let i = 0; i < 16; i++) bareTree(rand(-60, 60), rand(-150, 100), rand(0.8, 1.2));
  // lane
  addMesh(boxGeo(6, 0.05, 260, 1), mat('lane', { map: 'snowdirt' }), 0, 0.03, -30, { cast: false });
  const houses = [[-20, -40], [-22, -5], [-20, 30], [20, -60], [22, -22], [20, 15], [-24, -80], [24, -95], [-45, -20], [45, 5]];
  for (const [x, z] of houses) house(x, z, rand(8, 10), rand(6, 7), { openings: [{ side: x < 0 ? 'e' : 'w', at: 0, w: 1.1 }, { side: 's', at: -1.5, w: 1.2, y0: 1, y1: 2 }, { side: 'n', at: 1.5, w: 1.2, y0: 1, y1: 2 }] });
  for (const [x, z] of houses) { fence(x - 6, z + 6, x + 6, z + 6, 1.2); }
  for (let i = 0; i < 12; i++) crate(rand(-30, 30), rand(-100, 50), rand(0.8, 1.1), rand(0, 3));
}

/* ========== MISSION 3 「식은 밥상」 ========== */
defMission({
  id: 'm3', act: '1막 · 국경 붕괴', num: '미션 3', title: '식은 밥상', stealth: true,
  dateText: '2032년 1월 3일 16:50', dateShort: '2032.01.03', place: '회령 남쪽 · 리선우의 고향 마을', placeShort: '선우의 고향 마을', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: ENV.dusk, loadout: { weapons: ['rifle', 'pistol'], nades: 3 },
  bounds: [-70, -150, 70, 90],
  build(S) {
    buildVillage();
    // inside seon-woo's house: table with bowls
    const hx = -20, hz = -40, y = G.groundAt(hx, hz);
    addBox(hx - 1, y, hz, 1.6, 0.35, 0.9, MT.wood(), { dynamic: true, collide: false });
    for (let i = 0; i < 4; i++) addMesh(new THREE.CylinderGeometry(0.1, 0.07, 0.08, 10), mat('bowl', { color: 0xd8d2c4 }), hx - 1.5 + i * 0.32, y + 0.39, hz + rand(-0.2, 0.2), { dynamic: true });
    addBox(hx - 0.6, y + 0.36, hz + 0.25, 0.18, 0.005, 0.12, basicMat('note', 0xece4d0), { dynamic: true, collide: false, cast: false });
    // enemy patrols
    enemy(-6, -10, { patrol: [[-6, -10], [6, -10], [6, -50], [-6, -50]], tag: 'p' });
    enemy(-4, -12, { patrol: [[-4, -12], [8, -12], [8, -52], [-4, -52]], tag: 'p' });
    enemy(30, -40, { patrol: [[30, -40], [30, 0]], tag: 'p' });
    enemy(-35, -60, { patrol: [[-35, -60], [-35, -20]], tag: 'p' });
    enemy(10, -75, { tag: 'p', crouch: true }); enemy(-10, -78, { tag: 'p' });
    truckProp(8, -70, 0.2, 0x5c6156);
    squad(S, [
      { key: 'kang', name: '강태현 상사', x: -2, z: 75, follow: [-2.2, 2.5] },
      { key: 'lee', name: '리선우 병장', x: 2, z: 76, follow: [2.4, 3] },
      { key: 'yoon', name: '윤하린 중사', x: -3, z: 79, follow: [-3.5, 5] },
      { key: 'han', name: '한지운 하사', x: 3, z: 80, follow: [3.5, 5.5] },
    ]);
    for (const k of ['kang', 'lee', 'yoon', 'han']) S.sq[k].noShoot = true;
  },
  phases: [
    {
      setup(S) { S.player(0, 72, 0); P.crouchOn = true; },
      async run(S) {
        await S.say('강태현 상사', '후퇴로가 리 병장 고향 마을을 지난다. 30분 준다. 그 이상은 안 된다.');
        await S.say('리선우 병장', '…고맙슴다, 상사님.');
        await S.say('강태현 상사', '마을에 적 순찰조가 있다. 조용히 간다. 먼저 쏘지 마라. 나 따라와.');
        S.hint('<kbd>C</kbd> 앉아서 이동하면 덜 들켜요 · 적 머리 위 <b>?</b> 게이지가 다 차면 발각돼요', 7);
        let alerted = false;
        for (const a of aliveEnemies('p')) a.o.onAlert = () => { if (!alerted) { alerted = true; S.sayBg('강태현 상사', '들켰다! 사격 개시!', { dur: 2.5 }); for (const k of ['kang', 'lee', 'yoon', 'han']) S.sq[k].noShoot = false; } };
        await S.lead('kang', [
          [-4, 58, { crouch: true }],
          [-30, 46, { crouch: true, say: ['강태현 상사', '집 뒤로 붙는다.'], bg: true }],
          [-32, 18, { crouch: true }],
          [-33, -12, { crouch: true, say: ['윤하린 중사', '큰길 순찰조 두 명, 남쪽으로 이동 중입니다.'], bg: true }],
          [-31, -29, { crouch: true, say: ['강태현 상사', '정지. …지금이다, 이동.'], bg: true, wait: 2 }],
          [-13, -45, { crouch: true }],
        ], { follow: ['lee', 'yoon', 'han'], label: '강태현 상사를 따라가라', call: '서한준, 붙어라!' });
        if (!alerted) await S.say('윤하린 중사', '순찰조, 아직 저희를 못 봤습니다.', { dur: 2 });
        for (const [k, x, z] of [['kang', -12.5, -37.5], ['yoon', -12, -43.5], ['han', -10.5, -40.5]]) { const a = S.sq[k]; a.follow = null; holdAt(a, x, z); a.wantCrouch = true; }
        const lee = S.sq.lee; lee.follow = null; lee.leadSpeed = 5; lee.goal = v3(-18.6, 0, -39.4); lee.hold = true;
        await S.say('리선우 병장', '어마이! 아바이!', { dur: 1.6 });
        S.obj('선우를 따라 집 안 확인', v3(-20.6, G.groundAt(-20, -40) + 0.5, -39.75));
        await S.use(v3(-20.6, G.groundAt(-20, -40) + 0.5, -39.75), '식탁 살펴보기', 2.4);
        S.obj('');
        await S.say('리선우 병장', '어마이… 아바이…', { dur: 2.5 });
        await S.say('리선우 병장', '밥이… 그대로 있슴다. 숟가락도 안 대셨슴다.', { dur: 3 });
        await S.black(['"남쪽으로 간다."', '"선우야, 살아만 있어라."'], 4.5);
        await S.wait(0.8);
        await S.say('리선우 병장', '살아 계심다. 남쪽으로 가셨슴다.', { dur: 3 });
        await S.say('강태현 상사', '그럼 우리도 남쪽으로 간다. 거기서 만나면 된다.');
      },
    },
    {
      setup(S) { S.player(-17, -40, Math.PI / 2); for (const k of ['kang', 'lee', 'yoon', 'han']) S.sq[k].noShoot = false; },
      async run(S) {
        for (const k of ['kang', 'lee', 'yoon', 'han']) S.sq[k].noShoot = false;
        SFX.radio(); await S.wait(0.5);
        await S.say('윤하린 중사', '북쪽에서 트럭 접근! 수색조입니다, 이쪽으로 옵니다!');
        let unloaded = false;
        const unload = (v) => { if (unloaded) return; unloaded = true; for (let i = 0; i < 8; i++) enemy(v.pos.x + rand(-3, 3), v.pos.z + 3 + rand(0, 3), { tag: 'q', goTo: [-15 + rand(-6, 6), -40 + rand(-6, 6)] }); };
        const tr = new Vehicle('truck', 0, -150, { path: [[0, -90], [0, -62]], speed: 9, armed: false, onArrive: unload, onDeath: unload });
        for (const a of aliveEnemies('p')) { a.state = 'combat'; a.knownPos = P.pos.clone(); }
        for (const k of ['kang', 'yoon', 'han', 'lee']) { const a = S.sq[k]; a.hold = false; a.wantCrouch = false; }
        S.obj('수색조 격퇴');
        await S.until(() => unloaded);
        await S.wait(2);
        await S.killAll('q', 2); await S.killAll('p', 1);
        await S.say('강태현 상사', '더 몰려오기 전에 빠진다! 남쪽 출구로! 따라와!');
        S.later(6, () => { for (let i = 0; i < 5; i++) enemy(rand(-10, 10), -110 + rand(-5, 5), { tag: 'r', goTo: [0, 0] }); });
        await S.lead('kang', [
          [-10, -30, { run: true }], [-9, 0, { run: true }], [-9, 30, { run: true }], [-5, 50, { run: true }], [0, 70, { run: true }],
        ], { follow: ['lee', 'yoon', 'han'], label: '강태현 상사를 따라 마을 남쪽 출구로', call: '뛰어! 멈추지 마!', waitDist: 16 });
        await S.cut(async () => {
          const lee = S.sq.lee; lee.follow = null; lee.goal = null; lee.pos.set(1.5, G.groundAt(1.5, 78), 78); lee.wantCrouch = true; lee.yaw = Math.PI;
          const han = S.sq.han; han.follow = null; han.goal = null; han.pos.set(2.6, G.groundAt(2.6, 78.4), 78.4); han.wantCrouch = true; han.yaw = Math.PI;
          for (const a of aliveEnemies()) a.remove();
          await S.cam(v3(-2, G.groundAt(-2, 82) + 1.4, 82.5), v3(2, G.groundAt(2, 78) + 0.8, 78), 0);
          await S.cam(v3(-0.5, G.groundAt(0, 81) + 1.2, 81.5), v3(2, G.groundAt(2, 78) + 0.8, 78), 6, (t) => t);
          await S.say('리선우 병장', '……', { dur: 2 });
          await S.say('한지운 하사', '…', { dur: 1.5 });
          await S.wait(1.5);
          await S.fade(1, 2);
        });
      },
    },
  ],
});

/* ---------------- factory ---------------- */