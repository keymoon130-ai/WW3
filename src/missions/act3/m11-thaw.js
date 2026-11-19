defMission({
  id: 'm11', act: '3막 · 반격', num: '미션 14', title: '해빙(解氷)',
  dateText: '2032년 4월 9일 05:40', dateShort: '2032.04.09', place: '두만강 · 국경 다리 터', placeShort: '두만강', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: { sky: [0x58626e, 0x8a9096, 0x969a9c], glow: 0xd8b090, glowDir: [1, 0.1, 0.3], fog: 0x868c90, fogD: 0.009, hemi: [0xb8c0c8, 0x4a4842, 0.85], sun: [0xf0e4d4, 0.7], sunDir: [0.7, 0.6, 0.3], snow: 0, viewDist: 90, battle: 0.2, windSnd: 0.4 },
  loadout: { weapons: ['rifle', 'pistol'], nades: 4 },
  bounds: [-80, -104, 220, 60],
  build(S) {
    buildTumen({ thaw: true, ramps: true, noFence: true });
    // ruined bridge stubs
    // the old bridge's piers stand a little downstream of the pontoon line, clear of it
    addBox(136, -6, -58, 6, 5, 2.4, MT.concrete(), { tile: 2 }); addBox(136, -6, -86, 6, 4, 2.4, MT.concrete(), { tile: 2 });
    addBox(136, -0.8, -36, 10, 0.8, 4, MT.concreteD(), { tile: 2, collide: false });
    // pontoon bridge
    const pons = [];
    for (let i = 0; i < 9; i++) { const z = -44 - i * 6.6; const g = new THREE.Group(); g.position.set(150, -5.6, z); G.world.add(g); const d = new THREE.Mesh(boxGeo(5, 0.5, 6.4, 2), mat('pontoon', { color: 0x5a5e52, rough: 0.8 })); d.position.y = 0.3; d.castShadow = d.receiveShadow = true; g.add(d); const col = addCollider(147.5, -5.6, z - 3.2, 152.5, -5.05, z + 3.2, { dyn: true }); pons.push({ g, col }); }
    G.pons = pons;
    G.updaters.push(() => { for (let i = 0; i < pons.length; i++) if (!pons[i].sunk) pons[i].g.position.y = -5.6 + Math.sin(G.time * 1.2 + i) * 0.05; });
    // enemy HQ compound around (120..170, -10..-30)
    room(115, -18, 14, 10, 3.4, [{ side: 'w', at: 0, w: 1.4 }, { side: 'e', at: 2, w: 1.2 }, { side: 's', at: -3, w: 1.6, y0: 1, y1: 2 }], { floor: true, mat: mat('hq', { map: 'concrete', color: 0x8a8678 }) });
    room(132, -10, 10, 8, 3.4, [{ side: 'w', at: 0, w: 1.2 }, { side: 'n', at: 0, w: 1.4 }], { floor: true, mat: mat('hq', {}) });
    room(130, -26, 10, 8, 3.4, [{ side: 'w', at: 1, w: 1.2 }, { side: 's', at: 0, w: 1.4 }], { floor: true, mat: mat('hq', {}) });
    addBox(130, 0, -27, 3, 0.8, 1.4, MT.wood(), { dynamic: true }); for (let i = 0; i < 3; i++) addBox(129 + i, 0.8, -27, 0.2, 0.25, 0.3, mat('radio', { color: 0x3a3a34 }), { dynamic: true, collide: false });
    for (const x of [100, 145, 170]) sandbagRing(x, -6, 2.6, Math.PI);
    sandbags(60, -5, 8, 0.2); sandbags(80, 10, 6, -0.3); sandbags(40, 8, 6, 0); rubble(70, -12, 1.2); rubble(90, 18, 1); tankWreck(55, 20, 2, true); truckProp(160, 0, 0.3, 0x5c6156); truckProp(176, -12, -0.4, 0x5c6156, true);
    for (let i = 0; i < 20; i++) bareTree(rand(-70, 220), rand(10, 60), rand(0.8, 1.3));
    squad(S, [
      { key: 'park', name: '박도현 중위', x: -58, z: 4 },
      { key: 'lee', name: '리선우 병장', x: -60, z: 2, follow: [-2.2, 2.5] },
      { key: 'yoon', name: '윤하린 중사', x: -60, z: 6, follow: [2.4, 3] },
      { key: 'han', name: '한지운 하사', x: -63, z: 4, follow: [3.5, 5.5] },
      { key: 'cole', name: '에단 콜 하사', x: -40, z: 10, o: { style: 'usmc', passive: true } },
      { key: 'reyes', name: '레예스 상병', x: -42, z: 13, o: { style: 'usmc', passive: true } },
    ]);
  },
  phases: [
    {
      setup(S) { S.player(-62, 0, -Math.PI / 2); },
      async run(S) {
        await S.say('윤하린 중사', '강이 녹았습니다. 석 달 전엔 저 위를 걸어서 넘어왔는데 말입니다.');
        // last quiet minutes before the final fight
        const chats = [
          S.chat('han', [['them', '석 달 전 그 강이다. 기억나냐?'], ['me', '다리 폭약 스위치 누르던 손이 아직도 기억납니다.'], ['them', '이번엔 끝내러 왔다. 그리고 다 같이 돌아간다.']]),
          S.chat('lee', [['them', '여기서 회령까지 반나절이다. 끝나면 집에 한번 들러 보갔어.'], ['me', '저도 따라가도 됩니까?'], ['them', '…기래. 밥은 내레 한다. 이번엔 따뜻한 걸로.']]),
          S.chat('yoon', [['them', '한준아, 전쟁 끝나면 뭐 할 거야?'], ['me', '…전역할 때까지 초소 서야죠.'], ['them', '그 다음 말이야.'], ['me', '어머니랑 불꽃놀이 보러 가겠습니다. 새해에 못 본 거.'], ['them', '좋네. 그거 꼭 해.']]),
        ];
        S.obj('미 해병대와 합류', S.sq.cole.pos);
        await S.reach(S.sq.cole.pos, 4);
        for (const c of chats) if (c) c.stop();
        S.sq.cole.yaw = Math.PI / 2;
        await S.say('에단 콜 하사', '한 하사? 동해에서 올라왔습니다. 이번엔 같이 갑니다.');
        await S.say('한지운 하사', '말씀 많이 들었습니다. 고성 다리.');
        await S.say('에단 콜 하사', '인천 방파제 얘기는 우리 쪽에도 다 퍼졌습니다.');
        for (const k of ['cole', 'reyes']) { S.sq[k].passive = false; }
        await S.radio('윤하린 중사', '강변 건물이 적 지휘본부입니다. 볼코프 신호, 거기서 잡힙니다.');
        await S.say('박도현 중위', '한미 합동으로 들어간다. 콜 하사 팀은 우측 강둑, 우린 좌측 모래주머니 따라간다!', { dur: 3.4 });
        for (let i = 0; i < 8; i++) enemy(rand(40, 95), rand(-30, 20), { tag: 'f1', kind: Math.random() < 0.2 ? 'heavy' : 'rifle', view: 80, hold: Math.random() < 0.4 });
        for (let i = 0; i < 8; i++) enemy(rand(95, 180), rand(-30, 20), { tag: 'f2', kind: Math.random() < 0.2 ? 'heavy' : 'rifle', view: 80, hold: Math.random() < 0.4 });
        S.sq.cole.follow = { leader: S.sq.park, back: 3, side: 6 }; S.sq.reyes.follow = { leader: S.sq.park, back: 5, side: 7 };
        await S.lead('park', [
          [-30, 6], [10, 6, { run: true }], [38, 6, { crouch: true }], [58, -2, { crouch: true, fight: 'f1', leave: 2, say: ['박도현 중위', '모래주머니 뒤! 사격!'], bg: true }],
          [78, 8, { run: true }], [88, -10, { crouch: true, fight: 'f2', leave: 4 }], [102, -16],
        ], { follow: ['lee', 'yoon', 'han'], label: '박도현 중위를 따라 강변 지휘본부로', call: '서한준! 이쪽이다!' });
        await S.killAll('f1', 0);
      },
    },
    {
      setup(S) { S.player(100, -16, -Math.PI / 2); },
      async run(S) {
        await S.say('박도현 중위', '서쪽 문으로 진입한다. 서한준, 나랑 들어간다. 리선우 후방 맡아라!', { dur: 3 });
        S.obj('박도현 중위와 함께 지휘본부 내부 제압', [130, -26]);
        S.lead('park', [[106, -18], [110, -18, { crouch: true }], [116, -18, { fight: 'hq', leave: 4 }], [122, -16], [125, -14, { fight: 'hq', leave: 0 }], [130, -14]], { follow: ['lee', 'yoon'], call: '서한준! 붙어라!' });
        for (const [x, z] of [[113, -16], [118, -20], [132, -9], [129, -11], [128, -25], [133, -27]]) enemy(x, z, { tag: 'hq', view: 25, kind: 'rifle', crouch: Math.random() < 0.5 });
        enemy(116, -21, { tag: 'hq', kind: 'officer', view: 25 });
        await S.killAll('hq');
        S.stopLead('park');
        S.obj('지휘실 확인', [130, -25]);
        await S.reach([130, -25], 3);
        await S.say('리선우 병장', '없슴다! 의자가 아직 따뜻함다!');
        SFX.radio(); await S.wait(0.4);
        await S.say('무전 · 볼코프 대령', '…전 부대, 부교로 철수한다. 국경 너머에서 재집결.', { dur: 3.5 });
        await S.say('윤하린 중사', '부교! 볼코프가 지휘 전차로 강을 건너려 합니다!');
      },
    },
    {
      setup(S) { S.player(130, -22, -Math.PI / 2); },
      async run(S) {
        const yFn = (x, z) => Math.max(G.groundAt(x, z), (Math.abs(x - 150) < 4 && z < -40 && z > -106) ? -5.05 : -99);
        const vt = new Vehicle('tank', 172, -6, { command: true, path: [[156, -14], [150, -26], [150, -44], [150, -104], [150, -122], [150, -170]], speed: 3.2, hp: 640, reload: 7, yFn, color: 0x4a4e48, onArrive: () => S.fail('볼코프가 국경을 넘어 탈출했어요.'), onHurt: (v) => { if (v.hp <= 200 && !v.disabled) { v.hp = 200; v.disabled = true; v.invuln = true; v.stopped = true; v.armed = false; if (v.snd) v.snd.stop(); addEmitter(v.pos.clone().add(v3(0, 3.4, 2.2)), 'smoke', 1.2, 4); addEmitter(v.pos.clone().add(v3(0, 2.3, 3.4)), 'fire', 0.6, 10, 40); } } });
        await S.say('박도현 중위', '놓치면 끝이다! 전원 부교 쪽으로!', { dur: 2.2 });
        await S.say('한지운 하사', '서한준! 이거 받아라!');
        const han = S.sq.han; han.follow = null; han.goal = null; han.route = null; han.pos.set(P.pos.x + 2, P.pos.y, P.pos.z + 1); han.faceYaw = Math.atan2(-(P.pos.x - han.pos.x), -(P.pos.z - han.pos.z));
        S.obj('한지운 하사에게 로켓 받기', han.pos.clone().add(v3(0, 1.2, 0))); const hanMk = S.every(0.15, () => { G.objPos = han.pos.clone().add(v3(0, 1.2, 0)); });
        await S.use(han.eye(v3()), '한지운 하사에게 로켓 받기', 3);
        S.stop(hanMk);
        S.give('rpg', 3);
        await S.say('한지운 하사', '처음 그 다리처럼. 꼭 맞혀라, 막내!');
        han.follow = { offset: [3.5, 5.5] };
        S.obj('볼코프의 지휘 전차를 격파하라', vt.pos);
        S.every(0.2, () => { if (vt.alive) G.objPos = vt.pos.clone(); });
        for (let i = 0; i < 6; i++) enemy(rand(140, 170), rand(-30, -10), { tag: 'esc', view: 70 });
        await S.until(() => vt.disabled || !vt.alive);
        await S.say('리선우 병장', '궤도 끊었슴다! 전차 멈췄슴다!', { dur: 2.2 });
        await S.say('박도현 중위', '서한준! 올라가라! 볼코프는 산 채로 못 보낸다!', { dur: 2.6 });
        for (const a of aliveEnemies('esc')) a.die();
        // the tank fills the pontoon, so it is climbed from the back deck: get to its tail, then up onto the turret
        const bx = Math.sin(vt.yaw), bz = Math.cos(vt.yaw);
        const tail = vt.pos.clone().add(v3(bx * 6.2, 1.5, bz * 6.2));
        S.obj('볼코프의 전차에 올라 해치를 열어라', tail);
        await S.use(tail, '전차 위로 올라가 해치 열기', 4.0);
        { P.locked = true; const p0 = P.pos.clone(), deck = vt.pos.clone().add(v3(bx * 3.4, 2.3, bz * 3.4)), top = vt.pos.clone().add(v3(bx * 0.9, 3.0, bz * 0.9)); SFX.metal(deck);
          await S.tween(0.7, (k) => { P.pos.lerpVectors(p0, deck, k); P.pos.y += Math.sin(k * Math.PI) * 0.6; P.vel.set(0, 0, 0); });
          SFX.metal(top); await S.tween(0.6, (k) => { P.pos.lerpVectors(deck, top, k); P.vel.set(0, 0, 0); }); P.locked = false; }
        G.objPos = null;
        await S.cut(async () => {
          // inside the turret: cramped, red light, the wolf looking up
          const base = vt.pos.clone(); vt.m.root.visible = false;
          const room = new THREE.Group(); room.position.copy(base).add(v3(0, 200, 0)); G.world.add(room);
          const wall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 3.0), new THREE.MeshStandardMaterial({ color: 0x2a2c26, roughness: 0.9, side: THREE.BackSide })); wall.position.y = 1.1; room.add(wall);
          for (let i = 0; i < 8; i++) { const pnl = new THREE.Mesh(new THREE.BoxGeometry(rand(0.2, 0.5), rand(0.15, 0.35), 0.05), mat('tpanel', { color: 0x3a3c34 })); pnl.position.set(rand(-1.1, 1.1), rand(0.6, 1.6), -1.45); room.add(pnl); const led = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), basicMat(pick(['led1', 'led2']), pick([0x40ff60, 0xffb030]))); led.position.copy(pnl.position).add(v3(rand(-0.1, 0.1), 0, 0.04)); room.add(led); }
          const red = new THREE.PointLight(0xff3020, 1.4, 5, 1.5); red.position.set(1.0, 1.9, -1.2); room.add(red);
          const hatchLight = new THREE.SpotLight(0xdde6ff, 3.5, 8, 0.6, 0.8); hatchLight.position.set(0, 3.5, 0); hatchLight.target.position.set(0, 0, 0); room.add(hatchLight); room.add(hatchLight.target);
          const wolf = makeSoldierMesh('enemy2', { unarmed: true }); wolf.root.position.set(0, -0.25, -0.5); wolf.root.rotation.y = Math.PI; wolf.legL.visible = wolf.legR.visible = false; room.add(wolf.root);
          const coat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.32), mat('greatcoat', { color: 0x3c3a34 })); coat.position.set(0, 0.3, 0); wolf.torso.add(coat);
          const pistol = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.18), mat('gunM', { color: 0x1a1b1c })); pistol.position.set(0, -0.32, -0.08); wolf.elR.add(pistol);
          wolf.head.rotation.x = 0.75; wolf.armR.rotation.set(0.2, 0, 0.1); wolf.elR.rotation.set(0.3, 0, 0);
          const eye = room.position.clone().add(v3(0, 2.0, 0.55));
          await S.cam(eye, room.position.clone().add(v3(0, 0.95, -0.5)), 0);
          SFX.metal(eye); await S.wait(0.8);
          await S.say('볼코프 대령', '…Волк не встаёт на колени.', { dur: 2.4 });
          await S.say('볼코프 대령', '(늑대는 무릎 꿇지 않는다.)', { dur: 2.2 });
          S.tween(0.9, (k) => { wolf.armR.rotation.x = 0.2 + k * 1.9; wolf.elR.rotation.x = 0.3 - k * 0.2; });
          await S.wait(0.7);
          G.timeScale = 0.3;
          flashLight(eye.clone().add(v3(0.15, -0.3, 0)), 0xffc070, 30, 10, 0.12); SFX.shot('pistol'); G.shake += 0.3;
          await S.wait(0.12);
          FX.blood(room.position.clone().add(v3(0, 1.15, -0.2)));
          S.tween(1.2, (k) => { wolf.head.rotation.x = 0.75 - k * 1.3; wolf.torso.rotation.x = k * 0.5; wolf.armR.rotation.x = 2.1 - k * 2.0; });
          await S.wait(1.4); G.timeScale = 1;
          await S.wait(1.2);
          await S.cam(v3(144, G.groundAt(144, -24) + 3, -24), base.clone().add(v3(0, 1.5, 0)), 0);
          vt.m.root.visible = true; G.world.remove(room);
          await S.say('한지운 하사', '…늑대는 끝났다.', { dur: 2.5 });
        });
      },
    },
    {
      setup(S) { S.player(140, -24, Math.PI); },
      async run(S) {
        await S.radio('윤하린 중사', '북쪽 강변에 적 증원! 트럭과 장갑차, 부교로 내려옵니다!');
        for (let i = 0; i < 4; i++) new Vehicle(i % 2 ? 'apc' : 'truck', 150 + rand(-4, 4), -200 - i * 20, { path: [[150, -130], [150, -122]], speed: 5, hp: 400, mg: true });
        S.wave({ n: 10, from: [[140, -150], [160, -150]], to: [[150, -110]], tag: 'n', interval: 0.6 });
        S.obj('부교를 사수하라');
        await S.wait(4);
        S.sayBg('윤하린 중사', '서쪽에서 아군 차량! 공병대 트럭입니다!', { dur: 2.6 });
        const etr = new Vehicle('truck', -60, 8, { team: 'ally', armed: false, invuln: true, speed: 10, path: [[40, 8], [110, 4], [124, 2]], color: 0x4f5539, yieldPeople: false });
        const et0 = G.time; await S.until(() => etr.pi >= 3 || G.time - et0 > 22);
        if (etr.pi < 3) { etr.pos.set(124, G.groundAt(124, 2), 2); etr.m.root.position.copy(etr.pos); etr.pi = 3; }
        await S.wait(0.8);
        const kangA = ally(115.5, 2.2, { hero: true, passive: true, noShoot: true }); kangA.name = '강태현 상사'; injure(kangA, { head: false });
        const pk = new THREE.Mesh(boxGeo(0.4, 0.5, 0.25), mat('charge', { color: 0x4a4636 })); pk.position.set(0, 0.4, 0.2); kangA.m.torso.add(pk);
        const engs = [ally(115.5, 4.6, { passive: true, noShoot: true }), ally(116, -0.4, { passive: true, noShoot: true })];
        for (const e of engs) { const b = new THREE.Mesh(boxGeo(0.45, 0.3, 0.3), mat('ammo', { color: 0x4a5236 })); b.position.set(0, 0.25, -0.35); e.m.torso.add(b); e.goal = v3(140, 0, -30); }
        // Kang walks up to his squad leader, with the rookie standing by
        const jiA = (S.sq.han && S.sq.han.alive) ? S.sq.han : null; if (jiA) { jiA.follow = null; jiA.route = null; jiA.goTo = null; jiA.leading = false; jiA.hold = true; jiA.goal = v3(P.pos.x + 1.6, 0, P.pos.z - 1.2); }
        const meet = () => (jiA ? jiA.pos : P.pos);
        kangA.goal = v3(meet().x - 2, 0, meet().z + 2);
        const kt0 = G.time; await S.until(() => kangA.pos.distanceTo(meet()) < 3.5 || G.time - kt0 > 15);
        kangA.goal = null; kangA.faceYaw = Math.atan2(-(meet().x - kangA.pos.x), -(meet().z - kangA.pos.z)); if (jiA) jiA.faceYaw = Math.atan2(-(kangA.pos.x - jiA.pos.x), -(kangA.pos.z - jiA.pos.z));
        await S.say('강태현 상사', '지운아.');
        await S.say('한지운 하사', '상사님? 여긴 어떻게…');
        await S.say('강태현 상사', '공병대 따라왔다. 부교는 내가 맡는다. 너희는 물러나라.');
        await S.say('한지운 하사', '상사님, 안 됩니다! 저희가…');
        await S.say('강태현 상사', '명령이다, 분대장. …애들 데리고 가.');
        kangA.faceYaw = Math.atan2(-(P.pos.x - kangA.pos.x), -(P.pos.z - kangA.pos.z));
        await S.say('강태현 상사', '서한준. 전역까지 며칠 남았냐.');
        await S.say('서한준', '…오백 일 남았습니다.');
        await S.say('강태현 상사', '그럼 살아서 나가라. 꼭.');
        kangA.goal = v3(150, 0, -38); kangA.speed = 2.6;
        await S.wait(2.5);
        await S.cut(async () => {
          kangA.remove(); for (const e of engs) e.remove();
          for (const a of aliveEnemies()) if (a.pos.z > -100) a.remove();
          const kang = ally(150, -38, { hero: true, passive: true, noShoot: true }); kang.name = '강태현 상사'; injure(kang, { head: false }); kang.goal = v3(150, 0, -74); kang.speed = 3.2;
          const pack = new THREE.Mesh(boxGeo(0.4, 0.5, 0.25), mat('charge', {})); pack.position.set(0, 0.4, 0.2); kang.m.torso.add(pack);
          await S.cam(v3(136, 2, -30), v3(150, -4, -60), 0);
          await S.cam(v3(140, 1, -36), v3(150, -5, -74), 5);
          await S.say('강태현 상사', '새해 첫날 생각나냐. …그날 너 끌어낸 거, 후회 안 한다.', { dur: 4, radio: true });
          await S.wait(1);
          G.timeScale = 0.35;
          for (let i = 0; i < G.pons.length; i++) S.later(i * 0.12, () => { const p = G.pons[i]; explode(p.g.position.clone().add(v3(0, 0.5, 0)), { noPlayer: true, size: 2.2, dmg: 0, vdmg: 900, water: Math.random() < 0.4 }); p.sunk = true; removeCols([p.col]); tweenObj(p.g, { p: [p.g.position.x + rand(-2, 2), -8, p.g.position.z], r: [rand(-0.6, 0.6), rand(-0.5, 0.5), rand(-0.6, 0.6)] }, 3); });
          kang.remove();
          for (const v of G.vehicles) if (v.alive && v.team === 'enemy') v.die();
          await S.wait(1.6); G.timeScale = 1;
          await S.cam(v3(120, 6, -24), v3(150, -5, -80), 6, (t) => t);
          S.env({ snow: 0.35, snowFall: 0.8 });
          await S.say('한지운 하사', '…상사님?', { dur: 3, radio: true });
          await S.wait(2.5);
          await S.say('서한준', '……', { dur: 2 });
          await S.say('리선우 병장', '…눈이 옴다. 사월인데.', { dur: 3 });
          await S.fade(1, 3);
        });
      },
    },
  ],
});

/* ========== EPILOGUE 「이상 무」 ========== */