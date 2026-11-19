defMission({
  id: 'm6', act: '2막 · 대후퇴', num: '미션 6', title: '공백', hitMul: 0.72,
  dateText: '2032년 1월 8일 14:20', dateShort: '2032.01.08', place: '무산 남쪽 산악지대 · 폐광산', placeShort: '폐광산', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: Object.assign({}, ENV.overcast, { snow: 0.6, fogD: 0.018, battle: 0.15, flashes: 0.05, sky: [0x7a8088, 0x9da3a9, 0xa8acb0] }),
  loadout: { weapons: ['rifle', 'pistol'], nades: 3 },
  bounds: [-90, -280, 120, 120],
  build(S) {
    G.groundAt = (x, z) => { let y = Math.sin(x * 0.03) * 2 + Math.cos(z * 0.025) * 1.5 + Math.max(0, Math.abs(x - 20) - 60) * 0.5; if (z < -50 && z > -190) y = lerp(y, 0, clamp((Math.abs(x - 25) < 45 ? 1 : 0), 0, 1)); return y; };
    buildTerrain(700, 160, 'snow', 8, 0xffffff, 20, -80);
    buildMountains(520, 30, 0xa0a8b0, 120, 240);
    // mountain mass over the mine (cosmetic)
    const rockM = mat('rockout', { map: 'snowdirt', color: 0xb8bcc0 });
    for (let i = 0; i < 26; i++) { const c = addMesh(new THREE.ConeGeometry(rand(18, 34), rand(28, 46), 7), rockM, rand(-15, 70), 6, rand(-178, -64), { rot: [0, rand(0, 3), 0], cast: true }); c.position.y = G.groundAt(c.position.x, c.position.z) + 8; }
    // tunnel: entrance (0,-58) → north to (0,-120) → east to (50,-120) → north to (50,-186)
    const rk = mat('rock', { map: 'concrete', color: 0x5a554e });
    const wallX = (x, z0, z1) => addBox(x, 0, (z0 + z1) / 2, 0.6, 4, Math.abs(z1 - z0), rk, { tile: 2 });
    const wallZ = (z, x0, x1) => addBox((x0 + x1) / 2, 0, z, Math.abs(x1 - x0), 4, 0.6, rk, { tile: 2 });
    wallX(-2.5, -58, -122.5); wallX(2.5, -58, -117.5);
    wallZ(-122.5, -2.5, 47.5); wallZ(-117.5, 2.5, 52.5); wallX(52.5, -117.5, -186); wallX(47.5, -122.5, -186);
    addBox(0, 4, -90, 6.2, 0.6, 65, rk, { tile: 2 }); addBox(25, 4, -120, 56, 0.6, 6.2, rk, { tile: 2 }); addBox(50, 4, -152, 6.2, 0.6, 68, rk, { tile: 2 });
    for (let z = -66; z > -116; z -= 9) { addBox(-2, 0, z, 0.25, 4, 0.25, MT.wood(), { collide: false }); addBox(2, 0, z, 0.25, 4, 0.25, MT.wood(), { collide: false }); addBox(0, 3.7, z, 5, 0.25, 0.25, MT.wood(), { collide: false }); glow(0, 3.4, z, 0xffb060, 0.7); }
    for (let x = 8; x < 46; x += 9) { addBox(x, 0, -119.5, 0.25, 4, 0.25, MT.wood(), { collide: false }); addBox(x, 3.7, -120, 0.25, 0.25, 5, MT.wood(), { collide: false }); glow(x, 3.4, -120, 0xffb060, 0.7); }
    for (let z = -128; z > -184; z -= 9) { addBox(48, 0, z, 0.25, 4, 0.25, MT.wood(), { collide: false }); addBox(52, 0, z, 0.25, 4, 0.25, MT.wood(), { collide: false }); addBox(50, 3.7, z, 5, 0.25, 0.25, MT.wood(), { collide: false }); glow(50, 3.4, z, 0xffb060, 0.7); }
    // entrance timber frame
    addBox(-2.7, G.groundAt(0, -56), -56, 0.4, 4.4, 0.4, MT.wood()); addBox(2.7, G.groundAt(0, -56), -56, 0.4, 4.4, 0.4, MT.wood()); addBox(0, G.groundAt(0, -56) + 4, -56, 6, 0.5, 0.5, MT.wood());
    // tunnel clutter
    for (const [x, z] of [[0, -80], [-1, -100], [20, -119], [35, -121], [50, -140], [49, -165]]) { crate(x + rand(-1, 1), z, 1, rand(0, 1)); }
    addBox(0, 0, -90, 1.4, 1.2, 2.6, MT.rust(), { tile: 1 }); addBox(50, 0, -150, 1.4, 1.2, 2.6, MT.rust(), { tile: 1 });
    // exit clearing, MG nest, LZ
    sandbagRing(50, -212, 3, Math.PI / 2); sandbags(42, -205, 5, 0.5); sandbags(58, -205, 5, -0.5);
    for (let i = 0; i < 40; i++) { const x = rand(-80, 120), z = rand(-280, 100); if (Math.abs(x - 25) < 40 && z < -40 && z > -200) continue; if (Math.abs(x - 50) < 20 && z < -200) continue; pine(x, z, rand(1, 1.8)); }
    for (let i = 0; i < 10; i++) rubble(rand(-40, 60), rand(-40, 90), rand(0.8, 1.4));
    addMesh(new THREE.CylinderGeometry(6, 6, 0.1, 24), mat('lz', { color: 0x9a8e70 }), 50, G.groundAt(50, -250) + 0.06, -250, { cast: false });
    // patrols on approach
    for (const [x, z, p] of [[-10, 20, [[-10, 20], [25, 20]]], [30, -20, [[30, -20], [30, 40]]], [-25, -30, [[-25, -30], [10, -30]]], [5, -45, null], [-5, -48, null]]) enemy(x, z, { tag: 'a', acc: 0.7, patrol: p, view: 55 });
    // tunnel enemies
    for (const [x, z] of [[0, -98], [20, -120], [50, -135], [51, -175]]) enemy(x, z, { tag: 't', acc: 0.75, view: 30, yaw: rand(0, TAU), crouch: Math.random() < 0.4 });
    // nest
    for (const [x, z, k] of [[50, -212, 'heavy'], [48.5, -213.5, 'rifle'], [51.5, -213.5, 'rifle'], [43, -207, 'rifle'], [57, -207, 'rifle']]) enemy(x, z, { tag: 'n', acc: 0.6, kind: k, hold: true, view: 80, yaw: 0, hp: k === 'heavy' ? 400 : 100 });
    squad(S, [
      { key: 'lee', name: '리선우 병장', x: 2, z: 103, follow: [2.4, 3] },
      { key: 'yoon', name: '윤하린 중사', x: -3, z: 105, follow: [-2.2, 2.5] },
      { key: 'han', name: '한지운 하사', x: 3, z: 107, follow: [3.5, 5.5] },
    ]);
    // stretcher with Kang carried by two medics following the player
    const st = new THREE.Group(); G.world.add(st);
    const bed = new THREE.Mesh(boxGeo(0.7, 0.1, 2.1), mat('stretch', { color: 0x4e5638 })); bed.position.y = 0.8; st.add(bed);
    const k = makeSoldierMesh('rok'); k.root.rotation.x = -Math.PI / 2; k.root.position.set(0, 0.95, 0.9); k.root.scale.setScalar(0.95); st.add(k.root);
    const m1 = makeSoldierMesh('rok', { unarmed: true }), m2 = makeSoldierMesh('rok', { unarmed: true }); st.add(m1.root, m2.root); m1.root.position.z = -1.3; m2.root.position.z = 1.3; m1.root.rotation.y = Math.PI;
    for (const m of [m1, m2]) { m.armL.rotation.x = -0.4; m.armR.rotation.x = -0.4; }
    st.position.set(0, G.groundAt(0, 108), 108);
    let wk = 0; G.stretcher = st; G.stretcherOn = true;
    G.updaters.push((dt) => { if (!G.stretcherOn) return; const tp = trailPoint(6); const tx = tp.x, tz = tp.z; const dx = tx - st.position.x, dz = tz - st.position.z; const d = Math.hypot(dx, dz); if (d > 1) { const sp = Math.min(d * 1.2, 5.5) * dt; st.position.x += dx / d * sp; st.position.z += dz / d * sp; st.rotation.y = Math.atan2(-dx, -dz); wk += sp * 2.4; } st.position.y = G.groundAt(st.position.x, st.position.z); for (const m of [m1, m2]) { m.legL.rotation.x = Math.sin(wk) * 0.6; m.legR.rotation.x = -Math.sin(wk) * 0.6; } });
    // tunnel darkness
    const inTunnel = () => (Math.abs(P.pos.x) < 3 && P.pos.z < -60 && P.pos.z > -123) || (P.pos.z < -117 && P.pos.z > -123 && P.pos.x > -3 && P.pos.x < 53) || (Math.abs(P.pos.x - 50) < 3 && P.pos.z < -117 && P.pos.z > -184);
    const base = { h: hemi.intensity, s: sun.intensity };
    G.updaters.push((dt) => { const inn = inTunnel(); hemi.intensity = damp(hemi.intensity, inn ? 0.06 : base.h, 4, dt); sun.intensity = damp(sun.intensity, inn ? 0 : base.s, 4, dt); flashlight.intensity = damp(flashlight.intensity, inn ? 22 : 0, 6, dt); });
  },
  phases: [
    {
      setup(S) { S.player(0, 100, 0); },
      async run(S) {
        // where the war stands: the coalition is through the whole north, the squad is cut off behind its lines
        S.fade(1, 0); await S.black(['개전 8일째 · 상황', '중·러 「연합 안정화 작전」 선포 — "한반도 비핵화와 합법 정권 복원"', '중국 인민해방군 북부전구 3개 집단군 — 두만강·압록강 전 구간 도하, 평양 방면 남하', '러시아 동부군관구 2개 군 — 동해안 축선 남하, 청진·함흥 함락', '통일 한국 북부 전역이 중·러 연합군에 넘어가고 있다', '3분대는 적 후방에 고립되었다'], 8); S.fade(0, 1.5);
        await S.say('윤하린 중사', '무전 전부 불통입니다. 사단도, 연대도 안 잡힙니다.');
        await S.say('리선우 병장', '고립된 거임다. 앞뒤로 전부 적임다.');
        await S.say('윤하린 중사', '드론은 한 번 띄울 수 있습니다. 적 위치 표시하겠습니다.');
        G.markAll = true; S.later(25, () => (G.markAll = false));
        await S.say('윤하린 중사', '북쪽 산 밑에 폐광산이 있습니다. 지도상으로는 산 반대편까지 뚫려 있습니다.');
        await S.say('리선우 병장', '첨병은 제가 서겠슴다. 소대장님, 따라오시오.');
        await S.lead('lee', [[-4, 72], [6, 40], [8, 10, { crouch: true }], [2, -22, { crouch: true }], [0, -52]], { follow: ['yoon', 'han'], label: '리선우 병장을 따라 폐광산 입구로', call: '소대장님, 이짝임다!' });
      },
    },
    {
      setup(S) { S.player(0, -50, 0); },
      async run(S) {
        await S.say('리선우 병장', '안이 어둡슴다. 바짝 붙어 오시오.');
        S.hint('갱도 안에서는 전등이 자동으로 켜져요', 4);
        await S.lead('lee', [[0, -66], [0, -92, { fight: 't', leave: 5 }], [0, -116, { fight: 't', leave: 4 }], [22, -120, { fight: 't', leave: 2 }], [48, -122], [50, -150, { fight: 't', leave: 1 }], [50, -178, { fight: 't', leave: 0 }], [50, -183]], { follow: ['yoon', 'han'], label: '리선우 병장을 따라 갱도 통과', call: '소대장님, 붙으십시오!' });
      },
    },
    {
      setup(S) { S.player(50, -182, 0); },
      async run(S) {
        S.obj('');
        await S.say('윤하린 중사', '출구 바로 앞에 기관총 진지! 엎드리십시오!');
        for (const a of aliveEnemies('n')) { a.state = 'combat'; a.knownPos = P.pos.clone(); }
        await S.say('리선우 병장', '저 진지 때매 한 발짝도 못 나감다!');
        S.obj('기관총 진지 제거 — 수류탄을 던져라', [50, -212]);
        S.hint('<kbd>G</kbd> 수류탄 · 진지 안쪽으로 던지세요', 6);
        if (P.nades < 2) P.nades = 2;
        S.later(12, () => { if (aliveEnemies('n').length) { S.sayBg('한지운 하사', '내가 엄호한다! 서한준, 지금 던져!', { dur: 3 }); } });
        let hanDid = false;
        await S.until(() => { const n = aliveEnemies('n'); if (!hanDid && G.time > 25 && n.length > 0) { hanDid = true; S.sayBg('한지운 하사', '수류탄 투척!', { dur: 2 }); const h = S.sq.han; new Proj('grenade', h.eye(v3()), v3((50 - h.pos.x) * 0.06, 7, -15), { team: 'ally', owner: h }); } return n.length === 0; });
        await S.say('한지운 하사', '진지 제거 확인! 막내, 잘 던졌다!');
        await S.say('윤하린 중사', '…잠깐, 잡혔습니다! 무전 잡힙니다!');
        await S.radio('항공구조대', '여기는 구조 헬기. 신호 확인했다. 착륙장 표시하라.');
        await S.lead('lee', [[50, -205], [48, -230], [50, -244]], { follow: ['yoon', 'han'], label: '헬기 착륙장으로 이동', call: '서한준, 착륙장이다! 날래 오라우!' });
        const heli = new Vehicle('heli', 50, -560, { team: 'ally', armed: false, path: [[50, 40, -420], [50, 18, -280], [50, 3, -258]], speed: 26, invuln: true });
        await S.until(() => heli.pi >= 3);
        await S.cut(async () => {
          G.stretcherOn = false; const st = G.stretcher; st.position.set(46, G.groundAt(46, -246), -246); st.rotation.y = 0.4;
          await S.cam(v3(40, G.groundAt(40, -240) + 1.7, -238), v3(46, G.groundAt(46, -246) + 1, -246), 0);
          await S.say('강태현 상사', '지운아.', { dur: 2 });
          await S.say('한지운 하사', '네, 상사님.', { dur: 2 });
          await S.say('강태현 상사', '무전기 받아라. …이제 네 분대다.', { dur: 3.2 });
          await S.say('강태현 상사', '애들 다 데리고 와. 하나도 빼놓지 말고.', { dur: 3.2 });
          await S.cam(v3(30, 25, -220), v3(50, 3, -258), 4);
          await S.say('윤하린 중사', '…방금 들어온 소식입니다. 평양 방어선도 뚫렸다고 합니다.', { dur: 3.5 });
          await S.fade(1, 2);
        });
      },
    },
  ],
});

/* ---------------- Seoul ---------------- */