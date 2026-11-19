const BRIEF = { x: -40, z: 70, w: 26, d: 20 };
function buildBase() {
  G.groundAt = (x, z) => Math.sin(x * 0.008) * 0.3 + Math.cos(z * 0.01) * 0.2;
  buildTerrain(1000, 140, 'grass', 8, 0xc8c8c0);
  buildMountains(700, 30, 0x5a6250, 40, 110, false);
  // runway + taxiway, jets on the apron
  addMesh(boxGeo(700, 0.05, 46, 1), mat('runway', { map: 'asphalt', color: 0x9a9a9a }), 0, 0.03, -160, { cast: false });
  for (let x = -330; x < 330; x += 26) addMesh(boxGeo(14, 0.06, 1.2, 1), basicMat('rwline', 0xd8d4c8), x, 0.06, -160, { cast: false });
  addMesh(boxGeo(500, 0.05, 30, 1), mat('apron', { map: 'concrete', color: 0xa8a8a4 }), 0, 0.03, -112, { cast: false });
  for (let i = 0; i < 6; i++) { const j = makeJetMesh(i % 2 ? 0x6e747a : 0x5e6a74); j.root.position.set(-200 + i * 28, 2.0, -112); j.root.rotation.y = Math.PI; G.world.add(j.root); addCollider(-206 + i * 28, 0, -120, -194 + i * 28, 3, -104); }
  // hangars (big, open)
  for (const x of [-120, -55, 55, 120]) { room(x, -78, 44, 30, 16, [{ side: 'n', at: 0, w: 36, y1: 14 }], { mat: MT.metal(), roofMat: MT.rust(), floor: true, tile: 3 }); signBoard(x, 14.5, -93.3, `HANGAR ${x < 0 ? (x < -100 ? 1 : 2) : x < 100 ? 3 : 4}`, { w: 8, bg: '#333' }); }
  // control tower
  addBox(190, 0, -100, 8, 22, 8, MT.concrete(), { tile: 3 }); addBox(190, 22, -100, 12, 5, 12, mat('towerg', { color: 0x2a3a46, rough: 0.15, metal: 0.6 })); addBox(190, 27, -100, 13, 0.6, 13, MT.concreteD());
  // tent city: big walk-in tents, all at least briefing size
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) tent(-150 + c * 34, 10 + r * 30, 22, 16, 0);
  tent(BRIEF.x, BRIEF.z, BRIEF.w, BRIEF.d, -Math.PI / 2, { h: 4.2, roof: 3.2 });
  signBoard(BRIEF.x + BRIEF.d / 2 + 0.3, 5.4, BRIEF.z, '작전 브리핑실', { ry: Math.PI / 2, w: 5, bg: '#2a3a26' });
  // motor pool: tanks, IFVs, trucks in neat rows
  for (let i = 0; i < 8; i++) parkedTank(66 + (i % 4) * 15, 10 + Math.floor(i / 4) * 20, Math.PI, 0x4f5539);
  for (let i = 0; i < 6; i++) { const b = makeK21Mesh(); b.root.position.set(136 + (i % 3) * 13, G.groundAt(130, 10), 10 + Math.floor(i / 3) * 20); b.root.rotation.y = Math.PI; G.world.add(b.root); addCollider(b.root.position.x - 2.6, 0, b.root.position.z - 5.2, b.root.position.x + 2.6, 3.6, b.root.position.z + 5.2); }
  for (let i = 0; i < 8; i++) truckProp(-170 + i * 9, 75, 0, 0x4d5340);
  for (let i = 0; i < 6; i++) parkedHeli(-210 + i * 26, -40, 0, i % 2 === 1);
  for (let i = 0; i < 4; i++) addMesh(new THREE.CylinderGeometry(9, 9, 0.06, 24), mat('hpad', { color: 0x6a6a64 }), -210 + i * 52, 0.04, -40, { cast: false });
  // flags, floodlights, guard towers, perimeter
  for (const [x, k] of [[-14, 'kr'], [-2, 'blue'], [10, 'kr']]) flagPole(x, 52, 14, k);
  for (let i = 0; i < 10; i++) { const x = -200 + i * 44, z = i % 2 ? 100 : -128; addBox(x, 0, z, 0.3, 12, 0.3, MT.metal(), { collide: true }); addMesh(boxGeo(2, 0.8, 0.6, 1), basicMat('flood', 0xfff6e0), x, 12, z, { cast: false }); }
  for (const [x, z] of [[-240, -190], [240, -190], [-240, 130], [240, 130]]) { addBox(x, 0, z, 4, 8, 4, MT.wood(), { tile: 2 }); addBox(x, 8, z, 5, 2.4, 5, MT.sandbag(), { tile: 1 }); addBox(x, 10.4, z, 5.6, 0.3, 5.6, MT.rust()); }
  fence(-250, -195, 250, -195, 3); fence(-250, 140, 250, 140, 3); fence(-250, -195, -250, 140, 3); fence(250, -195, 250, 140, 3);
  for (let i = 0; i < 24; i++) sandbags(rand(-200, 200), rand(-60, 120), rand(4, 8), rand(0, 3));
}
/* animated operations map for the briefing screen */
const ADV = () => [{ a: [124.9, 40.25], b: [126.9, 37.8], col: '#ff5a4a', w: 10, label: '중국군', lx: -96 }, { a: [129.9, 42.5], b: [127.85, 37.95], col: '#ff5a4a', w: 10, label: '러시아군', lx: 18 }];
function makeOpsMap() {
  const W = 1024, H = 640; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const S_ = { adv: 0, occ: 0, land: 0, push: 0, un: 0, ring: 0 };
  const P_ = { seoul: [126.98, 37.56], incheon: [126.6, 37.45], goseong: [128.47, 38.38], pyeong: [127.0, 36.99], road7: [128.6, 37.6] };
  const draw = () => {
    const adv = ADV(); adv.forEach((a) => (a.k = S_.adv * (1 - S_.land * 0.6)));
    koreaMap(g, { front: S_.occ > 0 ? 'seoulS' : null, occ: S_.occ, frontLabel: '현 전선 · 서울–경기 경계', occLabel: S_.land > 0 ? '' : '적 점령 지역',
      arrows: [...adv,
        { a: [125.2, 37.1], b: P_.incheon, k: S_.land, col: '#4aa3ff', w: 12 }, { a: [129.6, 38.6], b: P_.goseong, k: S_.land, col: '#4aa3ff', w: 12 },
        { a: P_.incheon, b: P_.seoul, k: S_.push, col: '#4aa3ff', w: 9 }, { a: P_.goseong, b: P_.road7, k: S_.push, col: '#4aa3ff', w: 9 },
        { a: P_.pyeong, b: [127.0, 37.4], k: S_.un, col: '#7fd6ff', w: 9, label: 'UN군 북진', lx: -118, ly: 10 }],
      ring: S_.ring > 0 ? { k: S_.ring } : null, cities: ['seoul', 'incheon', 'goseong', 'pyeong'], view: { lo: 127.6, la: 38.55, z: 1.75 }, occAt: [126.4, 39.6], frontAt: [128.15, 37.22],
      title: '작전명 쌍룡(雙龍)', sub: 'D-DAY 2032. 03. 15  05:00' });
    t.needsUpdate = true;
  };
  draw();
  return { tex: t, S: S_, draw };
}
defMission({
  id: 'm8', act: '2막 · 대후퇴', num: '미션 8', title: '잠룡(潛龍)',
  dateText: '2032년 3월 10일 07:00', dateShort: '2032.03.10', place: '평택 연합군 기지', placeShort: '평택 기지', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: { sky: [0x6a8098, 0xb8b0a0, 0xc8b8a0], glow: 0xf0c080, glowDir: [1, 0.08, 0.2], fog: 0xb0aca4, fogD: 0.003, hemi: [0xd8dce4, 0x5a5448, 0.9], sun: [0xffe0c0, 1.1], sunDir: [1, 0.4, 0.3], snow: 0, viewDist: 140, battle: 0, windSnd: 0.25, exposure: 1 },
  loadout: { weapons: ['rifle', 'pistol'], nades: 0, noFire: true },
  bounds: [-245, -190, 245, 135],
  nades: false,
  build(S) {
    buildBase();
    // the base is alive: troops drilling, walking, mechanics at the vehicles
    for (let i = 0; i < 40; i++) { const a = ally(rand(-180, 180), rand(-60, 110), { passive: true, noShoot: true, style: Math.random() < 0.35 ? 'usmc' : 'rok' }); a.patrol = [a.pos.clone(), a.pos.clone().add(v3(rand(-25, 25), 0, rand(-25, 25)))]; }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) { const a = ally(20 + c * 2, 88 + r * 2.2, { passive: true, noShoot: true }); a.patrol = [a.pos.clone(), a.pos.clone().add(v3(0, 0, -30))]; a.speed = 1.6; }
    squad(S, [
      { key: 'lee', name: '리선우 병장', x: 182, z: 60, yaw: Math.PI / 2 },
      { key: 'yoon', name: '윤하린 중사', x: 184, z: 64, yaw: Math.PI / 2 },
      { key: 'han', name: '한지운 하사', x: 186, z: 58, yaw: Math.PI / 2 },
    ]);
    // inside the briefing tent: rows of seated troops, a big screen
    const map = makeOpsMap(); G.opsMap = map;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 4.5), new THREE.MeshBasicMaterial({ map: map.tex, toneMapped: false, fog: false })); scr.position.set(BRIEF.x - BRIEF.d / 2 + 0.5, G.groundAt(BRIEF.x, BRIEF.z) + 2.5, BRIEF.z); // in front of the frame, not inside it
    { const sl = new THREE.PointLight(0x9ab8d8, 6, 14, 1.6); sl.position.set(BRIEF.x - BRIEF.d / 2 + 2.5, G.groundAt(BRIEF.x, BRIEF.z) + 2.6, BRIEF.z); G.world.add(sl); } scr.rotation.y = Math.PI / 2; G.world.add(scr);
    addBox(BRIEF.x - BRIEF.d / 2 + 0.3, G.groundAt(BRIEF.x, BRIEF.z), BRIEF.z, 0.3, 5, 8, mat('scrframe', { color: 0x1a1a1a }), { collide: false });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { const x = BRIEF.x - 3 + r * 2.2, z = BRIEF.z - 7 + c * 2.3; if (Math.abs(z - BRIEF.z) < 1.2) continue; const a = ally(x, z, { passive: true, noShoot: true, unarmed: true, style: c % 3 === 0 ? 'usmc' : 'rok' }); a.yaw = Math.PI / 2; a.wantCrouch = true; a.faceYaw = Math.PI / 2; }
  },
  phases: [
    {
      setup(S) { S.player(186, 62, Math.PI / 2); },
      async run(S) {
        S.fade(1, 0);
        await runBrief(S, { kicker: '한 달 뒤 · 2032년 3월', title: '평택', map: { front: 'seoulS', occ: 0, arrows: ADV(), cities: ['pyongyang', 'seoul', 'incheon', 'pyeong', 'busan'], hot: 'seoul', occLabel: '적 점령 지역', frontLabel: '현 전선 · 서울–경기 경계' }, lines: [
          { t: '2월 11일, 서울 함락.' },
          { t: '중·러 연합군은 한강을 넘었지만, 서울과 경기도 경계에서 멈춰 섰다.', grow: [], fade: true, growT: 1.6, map: { view: { lo: 127.3, la: 37.55, z: 3.2 }, frontAt: [127.6, 37.36], occAt: [126.75, 37.95] } },
          { t: '한국군은 그 바로 아래에서 한 달째 전선을 붙잡고 있다.' },
          { t: '그사이 미군과 UN군이 평택으로 모여들었다.', map: { hot: 'pyeong', labels: [{ at: [127.15, 36.93], text: '연합군 집결', col: '#7fd6ff' }] } },
          { t: '이제, 반격을 준비한다.' }] });
        S.fade(0, 1.5);
        // fighters launching off the runway
        const launch = S.every(14, () => jetPass([300, 2, -160], [-500, 120, -160], { speed: 120 }));
        S.later(3, () => new Vehicle('heli', 300, 200, { team: 'ally', armed: false, invuln: true, path: [[100, 40, 0], [-150, 35, -40], [-400, 60, -100]], speed: 30 }));
        await S.say('서한준', '(평택. 남은 군대가 전부 여기 모였다.)', { dur: 3 });
        // a breather before the briefing: the squad, one by one
        let go = false;
        const cY = S.chat('yoon', [['them', '서한준. 손 줘 봐.'], ['them', '…이제 안 떠네. 회령에선 탄창도 제대로 못 끼우더니.'], ['me', '중사님이 무전으로 계속 불러 주셔서 그렇습니다.'], ['them', '그게 내 일이야. 넌 살아 있는 게 네 일이고.']]);
        const cH = S.chat('han', [['them', '어머니 소식은 있냐?'], ['me', '…아직 없습니다. 서울 빠지기 전날 통화한 게 마지막입니다.'], ['them', '서울 다시 들어가면 제일 먼저 찾으러 가자. 분대 전원 데리고.'], ['me', '…감사합니다, 하사님.'], ['them', '감사는 찾고 나서 해라.']]);
        S.chat('lee', [['them', '한준아, 평택은 처음이니?'], ['me', '예. 훈련소 말고 남쪽 부대는 처음입니다.'], ['them', '내레 통일 전엔 평택이 지도에만 있는 덴 줄 알았지비.'], ['them', '…우리 어마이도 어디메 이런 데 계시겠지비. 가자, 브리핑 늦갔다.']], { label: '리선우와 이야기하기 · 브리핑으로 출발', then: () => { go = true; } });
        S.obj('분대원들과 이야기하기 · 준비되면 리선우 병장에게', S.sq.lee.pos.clone().add(v3(0, 1.6, 0)));
        { const t0 = G.time; await S.until(() => go || G.time - t0 > 75); }
        await S.lead('lee', [
          [150, 60, { say: ['리선우 병장', '미군 들어오면서 기지가 두 배 됐슴다.'], bg: true }],
          [100, 50], [60, 54, { say: ['서한준', '저기 K2 좀 보십시오… 전부 새 겁니다!'], bg: true }],
          [20, 60], [-10, 66, { say: ['윤하린 중사', '브리핑은 저 천막입니다. 다들 모였습니다.'], bg: true }],
          [-24, 70],
        ], { follow: ['yoon', 'han'], label: '리선우 병장을 따라 브리핑 천막으로', call: '한준아! 이짝이다!' });
        S.stop(launch); for (const c of [cY, cH]) if (c) c.stop();
        placeSq(S, 'lee', BRIEF.x + 6, BRIEF.z + 6); placeSq(S, 'yoon', BRIEF.x + 6, BRIEF.z - 6); placeSq(S, 'han', BRIEF.x + 7.5, BRIEF.z + 4);
        const my = ally(BRIEF.x - BRIEF.d / 2 + 2.2, BRIEF.z + 4.2, { passive: true, noShoot: true, style: 'usmc', unarmed: true }); my.name = '마이어스 대령'; my.yaw = -Math.PI / 2; my.faceYaw = -Math.PI / 2;
        await S.reach([BRIEF.x + 5, BRIEF.z], 3, '브리핑 천막 안으로');
        const M = G.opsMap; const anim = (key, dur) => S.tween(dur, (k) => { M.S[key] = k; M.draw(); });
        const redraw = S.every(0.1, () => M.draw());
        await S.cut(async () => {
          const gy = G.groundAt(BRIEF.x, BRIEF.z);
          await S.cam(v3(BRIEF.x + 7, gy + 1.8, BRIEF.z - 1.5), v3(BRIEF.x - BRIEF.d / 2, gy + 2.4, BRIEF.z + 1), 0);
          await S.say('마이어스 대령', '좋은 아침이다. 길게 말하지 않겠다.');
          anim('adv', 2.4);
          await S.say('마이어스 대령', '1월 1일, 중·러 연합군이 두만강과 압록강을 넘었다. 두 달 만에 서울까지 내려왔다.', { dur: 4.4 });
          anim('occ', 2);
          await S.say('마이어스 대령', '지금 전선은 여기, 서울과 경기도 경계다. 한국군이 한 달째 붙잡고 있다.', { dur: 4.2 });
          await S.say('마이어스 대령', '적은 서울까지 내려오면서 보급선을 길게 늘였다. 그게 놈들의 약점이다.', { dur: 4 });
          await S.cam(v3(BRIEF.x + 3, gy + 2.2, BRIEF.z), v3(BRIEF.x - BRIEF.d / 2, gy + 2.6, BRIEF.z), 1.4);
          anim('land', 2.2);
          await S.say('마이어스 대령', '작전명 쌍룡. 3월 15일 05시, 서해 인천과 동해 고성에 동시 상륙한다.', { dur: 4.2 });
          anim('push', 2.6);
          await S.say('마이어스 대령', '인천 상륙군은 곧장 서울로 진격한다. 고성 상륙군은 7번 국도로 내려오는 적 보급로를 끊는다.', { dur: 4.6 });
          anim('un', 2.2);
          await S.say('마이어스 대령', '같은 시각, 남쪽에선 UN군이 이곳 평택에서 치고 올라간다.', { dur: 4 });
          anim('ring', 1);
          await S.say('마이어스 대령', '세 방향에서 서울을 조인다. 남쪽에 내려온 놈들은 전부 독 안에 든다.', { dur: 4.2 });
          await S.cam(v3(BRIEF.x + 7, gy + 1.7, BRIEF.z - 1.5), v3(BRIEF.x - BRIEF.d / 2, gy + 2.0, BRIEF.z + 4), 1.2);
          await S.say('마이어스 대령', '한국군 3분대는 인천 1파로 간다. 질문 있나?', { dur: 3 });
          await S.wait(1.2);
          await S.say('마이어스 대령', '좋아. 전원 전투 준비한다.', { dur: 2.4 });
          await S.cam(v3(BRIEF.x - BRIEF.d / 2 + 2.6, gy + 2.2, BRIEF.z - 5), v3(BRIEF.x + 6, gy + 1.2, BRIEF.z + 2), 0.9);
          await S.say('전원', '예, 알겠습니다!', { dur: 2.6 });
          await S.fade(1, 2.5);
        });
        S.stop(redraw);
      },
    },
  ],
});

/* ================= 「남쪽으로」: the city falling around the evacuation =================
   squads that move together; formations of jets on separate corridors; Il-76s low over the city dropping sticks of paratroopers who
   gather on the ground and come on as a squad; the MW2-dusk sky (smoke overcast lit orange from below, fire on the horizon, plumes
   a kilometre high); shells and bombs; nobody pops in or out of existence where you can see it */