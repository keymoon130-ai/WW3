function buildFactory() {
  G.groundAt = (x, z) => Math.sin(x * 0.015) * 0.5 + Math.cos(z * 0.02) * 0.4;
  buildTerrain(600, 120, 'snowdirt', 8);
  buildMountains(600, 30, 0x5a626c, 60, 140);
  // perimeter fence with gates (south gate x=0,z=60 ; west gate x=-70,z=10)
  fence(-70, 60, -6, 60, 3); fence(6, 60, 70, 60, 3); fence(70, -70, 70, 60, 3); fence(-70, -70, 70, -70, 3); fence(-70, -70, -70, 4, 3); fence(-70, 16, -70, 60, 3);
  // main hall (enterable) center (10,-20) size 44x26
  room(10, -20, 44, 26, 9, [{ side: 's', at: -12, w: 4, y1: 4 }, { side: 'w', at: 6, w: 3, y1: 3.2 }, { side: 'n', at: 14, w: 3, y1: 3.2 }], { mat: MT.brick(), roofMat: MT.rust(), floor: true, tile: 3 });
  // machinery inside
  for (let i = 0; i < 5; i++) { addBox(-6 + i * 7, G.groundAt(0, -26), -26, 4, 2.5, 3, MT.rust(), { tile: 2 }); G.covers.push(v3(-6 + i * 7, 0, -23)); }
  for (let i = 0; i < 4; i++) crate(-4 + i * 8, -12 + rand(-1, 1), 1.2, rand(0, 1));
  // command room at east end inside hall
  room(26, -16, 9, 8, 3, [{ side: 'w', at: 1, w: 1.2 }, { side: 's', at: 0, w: 2, y0: 1, y1: 2 }], { floor: true, mat: MT.concrete() });
  addBox(27, G.groundAt(27, -17), -17.5, 3, 0.85, 1.4, MT.wood(), { dynamic: true });
  for (let i = 0; i < 3; i++) glow(25 + i * 2, G.groundAt(26, -16) + 2.8, -16, 0xffe0a0, 1.6);
  addBox(29.8, G.groundAt(30, -16) + 1, -16, 0.1, 1.4, 2.6, mat('mapboard', { color: 0x9a9888 }), { dynamic: true, collide: false });
  // other warehouses
  room(-40, -40, 18, 14, 6, [{ side: 'e', at: 0, w: 3, y1: 3.4 }, { side: 'n', at: 0, w: 2, y1: 2.6 }], { mat: MT.brick(), roofMat: MT.rust(), tile: 3 });
  room(-40, 30, 16, 12, 6, [{ side: 'e', at: 0, w: 3, y1: 3.4 }], { mat: MT.brick(), roofMat: MT.rust(), tile: 3 });
  room(45, 30, 14, 12, 5, [{ side: 'w', at: 0, w: 3, y1: 3.4 }], { mat: MT.concrete(), roofMat: MT.rust() });
  building(48, -45, 16, 14, 14, { hue: 30, lit: 0, broken: 0.6 });
  // chimney
  addMesh(new THREE.CylinderGeometry(1.4, 2, 34, 10), MT.brick(), -55, 17, -60);
  for (let i = 0; i < 10; i++) container(rand(-60, 60), rand(-60, 50), pick([0, Math.PI / 2]), pick([0x5a3a2a, 0x3a4a5a, 0x4a4a3a]));
  for (let i = 0; i < 8; i++) truckProp(rand(-50, 50), rand(0, 45), rand(0, 3), 0x5c6156);
  for (let i = 0; i < 6; i++) barrel(rand(-30, 30), rand(10, 50));
  for (let i = 0; i < 10; i++) glow(rand(-60, 60), 3, rand(-60, 50), 0xffb060, 1.2);
}

/* ========== MISSION 4 「늑대의 이름」 ========== */
defMission({
  id: 'm4', act: '1막 · 국경 붕괴', num: '미션 4', title: '늑대의 이름', stealth: true,
  dateText: '2032년 1월 5일 02:10', dateShort: '2032.01.05', place: '무산 인근 · 적 전방 지휘소 (폐공장)', placeShort: '적 전방 지휘소', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: Object.assign({}, ENV.nightSnow, { snow: 0.3, exposure: 1.0, viewDist: 28, hemi: [0x4a5870, 0x080808, 0.22], sun: [0x6a7898, 0.15] }),
  loadout: { weapons: ['rifleSD', 'pistol'], nades: 2 },
  bounds: [-90, -80, 90, 100],
  nades: false,
  build(S) {
    buildFactory();
    const patrolDefs = [
      [[-20, 40], [20, 40]], [[30, 10], [30, 45]], [[-30, 5], [-30, 45]], [[-10, -45], [30, -45]], [[55, -10], [55, 40]], [[-55, -10], [-55, 40]],
    ];
    patrolDefs.forEach((p, i) => enemy(p[0][0], p[0][1], { patrol: p, tag: 'g', view: 22 }));
    for (const [x, z, k] of [[-14, -14, 0], [2, -18, 0], [14, -24, 1], [20, -12, 0], [24, -18, 0], [28, -14, 2], [-8, 52, 0], [6, 50, 0]]) enemy(x, z, { tag: 'g', view: 20, kind: k === 1 ? 'heavy' : k === 2 ? 'officer' : 'rifle', yaw: rand(0, TAU) });
    squad(S, [
      { key: 'kang', name: '강태현 상사', x: -3, z: 92, follow: [-2.2, 2.5] },
      { key: 'lee', name: '리선우 병장', x: 3, z: 93, follow: [2.4, 3] },
    ]);
    for (const k of ['kang', 'lee']) S.sq[k].noShoot = true;
    // Volkov's unit banner: grey wolf head on red
    { const t = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7a1414'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8d4c8'; g.beginPath(); g.moveTo(70, 70); g.lineTo(100, 120); g.lineTo(156, 120); g.lineTo(186, 70); g.lineTo(175, 150); g.lineTo(128, 210); g.lineTo(81, 150); g.closePath(); g.fill(); g.fillStyle = '#7a1414'; g.fillRect(104, 140, 14, 8); g.fillRect(138, 140, 14, 8); g.fillStyle = '#d8d4c8'; g.font = 'bold 24px serif'; g.fillText('III', 112, 245); });
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: 0.9 })); pl.position.set(-8, G.groundAt(-8, -7) + 2.2, -7); pl.rotation.y = 0.5; G.world.add(pl); addBox(-8, G.groundAt(-8, -7), -7.05, 0.08, 3, 0.08, MT.metal(), { collide: false }); }
  },
  phases: [
    {
      setup(S) { S.player(0, 88, 0); P.crouchOn = true; },
      async run(S) {
        S.nvg(true); S.hint('<kbd>N</kbd> 야간투시경 켜기/끄기', 6);
        await S.say('강태현 상사', '저 폐공장이 놈들 전방 지휘소다. 들어가서 작전 문서를 들고 나온다.');
        await S.say('강태현 상사', '한지운이랑 윤하린은 능선에서 엄호한다. 서한준, 넌 나랑 들어간다. 몸 작은 놈이 잠입엔 낫다.', { dur: 4 });
        await S.say('리선우 병장', '상사님, 회령 칠 때 무전에서 자꾸 나오던 그 이름… 볼코프 말임다.', { dur: 3.2 });
        await S.say('강태현 상사', '러시아 제3전차사단장 볼코프 대령. 놈들 사이에선 \'늑대\'로 불린다.', { dur: 3.4 });
        await S.say('강태현 상사', '두만강 다리, 회령 광장, 전부 그놈 작전이다. 어디로 가는지 알아내야 한다.', { dur: 3.4 });
        await S.radio('윤하린 중사', '드론 띄웠습니다. 적 위치 표시합니다. 30초 유지됩니다.');
        G.markAll = true; S.later(30, () => { G.markAll = false; });
        S.hint('<kbd>N</kbd> 야간투시경 · 소음기 총성은 멀리 들리지 않아요 · 적 머리 위 <b>?</b> 게이지에 주의', 7);
        let loud = false;
        for (const a of aliveEnemies('g')) a.o.onAlert = () => { if (!loud) { loud = true; S.sayBg('강태현 상사', '발각됐다! 쓸어버려!', { dur: 2.5 }); for (const k of ['kang', 'lee']) S.sq[k].noShoot = false; } };
        await S.lead('kang', [
          [0, 72, { crouch: true }],
          [0, 59, { crouch: true, say: ['강태현 상사', '정지. …순찰 지나간다. 이동.'], bg: true, wait: 2.5 }],
          [-11, 45, { crouch: true }], [-14, 20, { crouch: true }], [-6, 0, { crouch: true }],
          [-6, -4, { crouch: true, say: ['리선우 병장', '벽에 늑대 문장임다… 볼코프 부대 맞슴다.'], bg: true }],
          [-2, -10, { crouch: true, say: ['윤하린 중사', '동쪽 끝 작은 방에 불이 켜져 있습니다. 거기가 볼코프 참모부 지휘실입니다.'], bg: true, radio: true }],
          [9, -14, { crouch: true }], [19.6, -15, { crouch: true, say: ['강태현 상사', '안에 아무도 없다. 서한준, 문서 챙겨라.'], bg: true }],
        ], { follow: ['lee'], label: '강태현 상사를 따라 잠입', call: '서한준, 붙어라.' });
        S.obj('지휘실에서 작전 문서 확보', v3(27, G.groundAt(27, -17) + 1, -17.5));
        await S.use(v3(27, G.groundAt(27, -17) + 1, -17.5), '작전 문서 챙기기', 2.6);
        S.obj('');
        await S.cut(async () => {
          await S.cam(camera.position.clone(), v3(27, G.groundAt(27, -17) + 0.9, -17.5), 0);
          SFX.radio();
          await S.say('무전 · 볼코프 대령', '…제3전차사단 전 부대에 알린다. 일정에 변경은 없다.', { dur: 3.5 });
          await S.say('무전 · 볼코프 대령', '청진은 목표가 아니다. 남쪽으로 계속 내려간다.', { dur: 3.5 });
          await S.say('무전 · 볼코프 대령', '열흘 안에 서울이다. 볼코프, 이상.', { dur: 3.5 });
          await S.say('강태현 상사', '…볼코프. 이놈이 머리다.', { dur: 2.5 });
          await S.say('리선우 병장', '서울이라니… 미친 놈들임다.', { dur: 2.5 });
          await S.say('강태현 상사', '이 문서, 반드시 사령부에 넘긴다. 늑대가 어디로 가는지 아는 건 지금 우리뿐이다.', { dur: 3.6 });
        });
      },
    },
    {
      setup(S) { S.player(24, -16, Math.PI / 2); S.nvg(true); },
      async run(S) {
        for (const k of ['kang', 'lee']) S.sq[k].noShoot = false;
        await S.wait(0.5);
        // alarm + flares
        const alarm = S.every(1.2, () => { tone({ dur: 0.6, f: 620, f2: 880, type: 'square', gain: 0.05, wet: 0.5 }); });
        for (let i = 0; i < 4; i++) S.later(i * 2, () => { const p = v3(rand(-40, 40), 50, rand(-30, 40)); let t = 0; G.updaters.push((dt) => { t += dt; p.y -= dt * 1.5; FX.flare(p); flashLight(p, 0xff4030, 40, 90, 0.08); return t > 14; }); });
        S.hint('조명탄 아래에서는 야간투시경을 끄는 게 좋아요', 5);
        alertEnemies(300);
        await S.say('강태현 상사', '리선우! 서한준 데리고 서쪽 쪽문으로 가라! 내가 차 끌고 온다!', { dur: 3 });
        const kang = S.sq.kang; kang.follow = null; kang.leading = false; kang.leadSpeed = 5.5; kang.hold = true; kang.goal = v3(-11, 0, -14);
        S.later(5, () => { if (hiddenFromView(kang.pos)) kang.remove(); else S.later(3, () => kang.remove()); });
        S.later(3, () => S.wave({ n: 6, from: [[0, 58], [40, 58]], to: [[-20, 0], [-40, 10]], tag: 'x', interval: 0.8 }));
        S.later(14, () => S.wave({ n: 5, from: [[60, -60], [-40, -65]], to: [[-50, 10]], tag: 'x', interval: 0.8, heavy: 0.2 }));
        await S.lead('lee', [
          [16, -15, { run: true }], [0, -14, { run: true }], [-11, -14, { run: true }], [-30, 0, { run: true }], [-48, 8, { run: true }], [-61, 10, { say: ['리선우 병장', '쪽문 잠겼슴다! 상사님!'], bg: true }],
        ], { label: '리선우 병장을 따라 서쪽 쪽문으로', call: '서한준! 이짝이다, 날래!', waitDist: 16 });
        S.stop(alarm);
        await S.radio('강태현 상사', '비켜라! 문 뚫는다!');
        const tr = new Vehicle('truck', -110, 10, { team: 'ally', armed: false, invuln: true, yieldPeople: false, path: [[-72, 10], [-66, 10]], speed: 14, color: 0x4d5340, onArrive: () => {} });
        S.later(0.4, () => { explode(v3(-70, 1, 10), { noPlayer: true, dmg: 0, size: 0.6 }); });
        await S.until(() => tr.pi >= 2);
        S.obj('트럭에 탑승', [-66, 10]);
        await S.reach(tr.pos, 4.5);
        await S.fade(1, 0.8);
        await S.say('강태현 상사', '문서 챙겼나? 간다!', { dur: 2 });
        S.nvg(false);
      },
    },
  ],
});

/* ---------------- mountain pass ---------------- */