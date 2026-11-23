/* ========== 「북쪽으로」: the plan ==========
   From 노량진역 (still the ruin we left it) the helicopter covers the armoured column north. Their infantry is everywhere, but the
   minigun and our aircraft are more. The net is full of other units taking the city back, and on the way we see it happen: our squads
   going into 용산역, 서울역, the 남대문 market and 시청, a flag going up on each. At 광화문 the column stops, the squad gets down
   from the K808s, the people who sat out the occupation in the 광화문역 shelter come up, and 서한준 carries the flag from the
   station's memorial hall to the pole in front of the gate and raises it himself. */
const M10RADIO = {
  n1: ['합동참모본부', '전 제대 수신하라! 서부 주공 제대가 신월IC와 영등포 축선을 돌파해 한강대교 도하 단계에 진입했다! 동시에 동해안 고성 상륙제대가 인제와 양구를 장악하고 적의 동부 보급로와 퇴로를 차단했다! 전 전선은 작전 계획에 따라 총공세를 유지하기 바란다, 이상!'],
  n2: ['고성 상륙기동부대', '여기는 동해안 고성 상륙제대! 진부령과 미시령 축선을 돌파하고 춘천 및 가평 방면으로 진격 중이다! 서울 방면으로 증원되던 적 동부전선 예비대의 이동 경로를 차단했다! 계속 서진하여 포위망을 형성하겠다, 이상!'],
  n3: ['공군작전사령부', '전 지상군 제대에 알린다! 서해안과 동해안 방공망이 동시에 무력화되면서 현 시간부로 수도권 상공의 제공권을 아군이 장악했다! 근접항공지원(CAS) 편대가 한강 상공에 진입했으니 전방 유도반은 적 요새화 진지 좌표를 지시하기 바란다, 이상!'],
  n4: ['수도기계화보병사단', '여기는 맹호부대! 경부축선을 돌파해 강남 일대 적 저지선을 격멸했다! 현재 온전한 상태로 확보된 영동대교와 성수대교 남단 진입로를 장악하고 도하를 개시했다! 한강대교 도하 제대와 연계하여 강북 도심을 양면에서 포위하겠다, 이상!'],
  n5: ['해병대 제1사단', '여기는 해병 1사단 선봉대대! 김포 축선을 돌파해 행주대교와 가양대교를 도하했다! 적이 상암과 수색 일대에 구축한 콘크리트 벙커와 대전차 장애물을 돌파 중이다! 내부순환로를 장악해 적의 서북부 퇴로를 차단하겠다, 이상!'],
  n6: ['포병여단 화력지휘소', '남부 전선 전 포병대대에 하달한다! 공중 정찰 자산과 관측반의 연동이 완료되었다! 적이 용산과 남산 일대에 구축한 야전 포병 진지와 지휘 벙커 좌표가 실시간으로 수신되고 있다! 한강 도하 제대를 엄호하기 위해 전 포대 일제 사격을 개시하라, 이상!'],
  n7: ['한강 도하 공병단', '공병단에서 보고한다! 파괴된 마포대교와 양화대교 구간 대신, 온전히 보존된 서강대교와 월드컵대교 북단 진입로의 적 지뢰밭 및 대전차 방벽 제거 작업이 완료되었다! 후속 기갑 제대는 즉시 교량을 통과하여 강북으로 진출하라, 이상!'],
  n8: ['철도수송지원단', '철도수송단에서 보고한다! 한강철교와 마곡철교, 잠실철교 선로에 대한 공병대의 안전 점검이 완료되었다! 탄약과 중장비를 실은 군용 화물열차가 즉시 한강을 건너 강북 전선으로 추진될 예정이다! 각 사단 군수참모부는 보급 수령을 준비하기 바란다, 이상!'],
  n9: ['제2신속대응사단', '여기는 2신속대응사단 선봉연대! 천호대교와 광진교를 도하하여 아차산과 구리 방면 외곽 순환도로를 차단했다! 강북 동부 지역에 주둔하던 적 예비대 병력이 북쪽으로 퇴각을 시도하고 있다! 화력을 집중하여 저지하겠다, 이상!'],
  n10: ['제30기갑여단', '여기는 30기갑여단! 원효대교를 통과하여 용산역과 삼각지 일대 적 방어선을 돌파했다! 요새화된 건물 내부에서 저항하던 점령군 수비대의 방어선이 붕괴되었다! 한강대로 축선을 따라 북진을 계속하겠다, 이상!'],
  n11: ['제1공수특전여단', '여기는 제1공수특전여단! 한강 이남에서 헬기 강습으로 잠실대교와 올림픽대교 북단 교두보를 확보했다! 적이 교량 폭파를 위해 설치한 기폭 장치를 해체 완료했다! 후속 기계화 부대는 지체 없이 교량을 통과하기 바란다, 이상!'],
  n12: ['전자전 지원대', '적 지휘통신망에 대규모 통신 두절 및 혼선이 식별되었다! 감청 결과, 한강 방어선이 다수의 교량을 통해 동시에 돌파당하고 고성 상륙군까지 배후를 차단하자 중공군과 러시아군 지휘부 간 협조 체계가 마비된 것으로 판단된다! 전 제대는 공세를 강화하라, 이상!'],
  n13: ['방공여단 관제소', '여기는 방공관제소! 고성 상륙군의 공습으로 철원과 원산 일대 적 전술항공기 기지가 무력화되었다! 서울 상공에서 활동하던 적 공격헬기 편대가 교전을 중단하고 북쪽으로 이탈 중이다! 지상군은 계획된 진격 속도를 유지하라, 이상!'],
  n14: ['국군수도병원 의무후송단', '의무후송단에서 보고한다! 한강 교량 통제선 확보로 북진 중인 공격 제대의 중상자 후송 경로가 개통되었다! 대형 수송헬기 편대가 여의도와 이촌 한강공원 일대로 진입 중이다! 지상군은 착륙지 주변 경계를 지원하기 바란다, 이상!'],
  n15: ['7군단 전술지휘소', '전 서울 수복 작전 제대에 하달한다! 고성 상륙제대와 한강 도하 주공 제대가 각각 동부 및 남부 포위망을 형성하여 포천과 의정부 축선으로 진출 중이다! 서울 시내 점령군 주력의 북상 퇴로는 차단되었다! 각 제대는 계획된 진격로를 따라 목표 지점을 점령하기 바란다, 이상!'],
};
/* the net: n1 first; calls about a place go out while the column is near it (용산 n10, the river crossings early, 한강철교 n8 on the bridge);
   the rest fill the gaps, 20–30 s apart, never over a cutscene */
function m10RadioNet(S) {
  const near = (z0, z1) => () => G.colFront < z0 && G.colFront > z1, past = (z) => () => G.colFront < z;
  const it = (id, o = {}) => Object.assign({ id, tab: M10RADIO }, o);
  m7RadioNet(S, [it('n1', { when: () => true }), it('n8', { when: near(-200, -1100), gone: past(-1300) }), it('n3', { when: near(-400, -1400) }), it('n10', { when: near(-1400, zq(RT.V[0] + 200)), gone: past(zq(RT.V[0] + 700)) }),
    it('n6', { when: near(-1200, zq(RT.V[0] + 600)) }), it('n7'), it('n4'), it('n5'), it('n11'), it('n2'), it('n12'), it('n9'), it('n13'), it('n14'), it('n15')]);
}

/* the tallest roof within r of (x, z): where a flag goes up */
function m10Roof(x, z, r) { let best = null; for (const c of G.colliders) { if (c.max.y < 8 || c.max.x - c.min.x < 8 || c.max.z - c.min.z < 8) continue; const cx = (c.min.x + c.max.x) / 2, cz = (c.min.z + c.max.z) / 2; if (Math.hypot(cx - x, cz - z) > r) continue; if (!best || c.max.y > best.max.y) best = c; } return best ? v3((best.min.x + best.max.x) / 2, best.max.y, (best.min.z + best.max.z) / 2) : v3(x, 12, z); }
/* a flag going up on a roof: the pole is raised from the parapet, the flag climbs it */
function m10RoofFlag(p) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 7, 6), MT.metal()); pole.position.set(p.x, p.y + 3.5, p.z); pole.scale.y = 0.01; G.world.add(pole);
  const fg = new THREE.PlaneGeometry(2.4, 1.6, 12, 6); fg.translate(1.2, 0, 0); const fm = new THREE.MeshStandardMaterial({ map: canvasTex(240, 160, (g, w, h) => drawFlag(g, w, h, 'kr')), side: THREE.DoubleSide, roughness: 0.9 });
  const f = new THREE.Mesh(fg, fm); f.position.set(p.x + 0.07, p.y + 0.6, p.z); f.visible = false; G.world.add(f); const base = fg.attributes.position.array.slice(); let t = 0;
  G.updaters.push((dt) => { t += dt; pole.scale.y = Math.min(1, t / 1.5); pole.position.y = p.y + 3.5 * pole.scale.y; if (t > 1.5) { f.visible = true; f.position.y = Math.min(p.y + 6.1, p.y + 0.6 + (t - 1.5) * 1.2); }
    const a = fg.attributes.position; for (let i = 0; i < a.count; i++) { const bx = base[i * 3]; a.setZ(i, Math.sin(bx * 2.2 - G.time * 5) * 0.12 * bx); } a.needsUpdate = true; if (G.mode !== 'play') return true; });
}
/* our squads take a building back: a handful of theirs at its door, a squad of ours coming up the pavement at them; when it is over the flag goes up on the roof */
function m10Retake(S, at, door, o) {
  const tag = 'rt' + o.key, n = 6;
  for (let i = 0; i < n; i++) enemy(door.x + rand(-6, 6), door.z + rand(-6, 6), { tag, view: 90, hold: true, kind: Math.random() < 0.3 ? 'heavy' : 'rifle', crouch: Math.random() < 0.5 });
  const sq = []; for (let i = 0; i < 7; i++) { const a = ally(at.x + rand(-3, 3), at.z + rand(-3, 3), { hp: 400 }); a.goTo = door.clone().add(v3(rand(-3, 3), 0, rand(-3, 3))); a.speed = 4.6; sq.push(a); }
  S.later(o.late ?? 2, () => { if (o.call) S.radio(o.call[0], o.call[1], { dur: 3.2 }); });
  S.later(16, () => { for (const a of aliveEnemies(tag)) a.hurt(9999, sq[0] || PT); });
  S.later(18, () => { m10RoofFlag(m10Roof(o.roof.x, o.roof.z, o.r ?? 45)); if (o.done) S.radio(o.done[0], o.done[1], { dur: 3 }); });
}
function m10Retakes(S) {
  const V = RT.V, SS = RT.sSta, w = (s, d) => { const p = rtAt(s, d); return v3(p.x, 0, p.z); };
  hgWhen(S, -1480, () => m10Retake(S, v3(-60, 0, -1620), v3(-112, 0, -1655), { key: 'ys', roof: v3(-180, 0, -1660), r: 70,
    call: ['30기갑 3중대', '용산역 진입한다! 엄호 바람!'], done: ['30기갑 3중대', '용산역 확보! 옥상에 태극기 올렸다!'] }));
  hgWhen(S, zq(SS - 380), () => { const st = RT.spots.ss; m10Retake(S, w(SS - 120, -26), v3(st[0], 0, st[1]), { key: 'ss', roof: v3(st[0], 0, st[1]), r: 60,
    call: ['5사단 수색대', '서울역 구역사로 들어간다!'], done: ['5사단 수색대', '서울역 확보! 문화역서울 지붕에 깃발 올렸다!'] }); });
  hgWhen(S, zq(V[3] - 480), () => m10Retake(S, w(V[3] - 200, 26), w(V[3] - 120, 62), { key: 'nd', roof: w(V[3] - 120, 80), r: 50,
    call: ['해병 1연대', '남대문시장 쪽 건물, 소탕 들어간다!'], done: ['해병 1연대', '남대문시장 확보! 숭례문 동쪽 막았다!'] }));
  hgWhen(S, zq(V[4] - 220), () => m10Retake(S, w(V[4] + 80, 24), w(V[4] + 145, 60), { key: 'sc', roof: w(V[4] + 175, 130), r: 45,
    call: ['수방사 특임대', '시청 본관 진입! 서울광장 정리 바란다!'], done: ['수방사 특임대', '서울시청 확보했다! 깃발 올린다!'] }));
}
/* close air support whenever their infantry bunches up ahead of the column: a pair runs in down the road, guns, and the bombs follow */
function m10CAS(S) {
  const calls = [['공군 CAS 편대', '근접항공지원 진입! 좌표 확인, 기총 소사 들어간다!'], ['전방항공통제관', '적 보병 밀집, 위험근접! 지금 들어간다, 고개 숙여!'], ['독사 편대', '독사 1, 표적 확인. 투하!'], ['공군 CAS 편대', '2번기 진입. 한강대로 서측 건물 앞, 쓸어버린다!']];
  let k = 0;
  S.every(26, () => { if (G.mode !== 'play' || G.cut || G.colFront === undefined) return; const front = -G.colFront;
    const tgt = aliveEnemies().filter((a) => { const q = hgQ(a.pos, front); return q > front + 60 && q < front + 380; }); if (tgt.length < 6) return;
    const c0 = pick(tgt).pos, close = tgt.filter((a) => a.pos.distanceTo(c0) < 30); if (close.length < 4) return;
    const c = close.reduce((s, a) => s.add(a.pos), v3()).multiplyScalar(1 / close.length); c.y = 0;
    S.radio(calls[k % calls.length][0], calls[k % calls.length][1], { dur: 3 }); k++;
    const t = hgStrafe(S, c, { n: 2, d: 0 }); setGameTimeout(() => { for (let i = 0; i < 4; i++) explode(v3(c.x + rand(-10, 10), 0.4, c.z + rand(-10, 10)), { noPlayer: true, size: 2.6, dmg: 400, vdmg: 300, radius: 10 }); G.shake += 0.4; }, t + 0.6); });
}

/* ---------- 광화문: down onto the plaza, the squad off the K808s, the shelter, the memorial hall, the flag ---------- */
function m10Gwanghwamun() {
  const T = RT.total, s0 = RT.V[4] + 690, at = (s, d) => rtAt(s, d), Y = rtAt(T - 20).yaw, F = {};
  const stone = mat('ghExit', { color: 0x8e8a84, rough: 0.8 }), steel = mat('ghSteel', { color: 0x4c5258, rough: 0.5, metal: 0.6 }), glass = mat('ghGlass', { color: 0x9ab0b8, rough: 0.08, metal: 0.3, transparent: true, opacity: 0.4 });
  const grp = (s, d) => { const q = at(s, d); const g = new THREE.Group(); g.position.set(q.x, 0.3, q.z); g.rotation.y = Y; G.world.add(g); return g; };
  const put = (g, w, h, d, m, x, y, z) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; g.add(me); return me; };
  const solid = (g, w, h, d, x, z) => { const p = g.localToWorld(v3(x, 0, z)), c = Math.abs(Math.cos(Y)), s = Math.abs(Math.sin(Y)), hx = (w * c + d * s) / 2, hz = (w * s + d * c) / 2; addCollider(p.x - hx, 0, p.z - hz, p.x + hx, h + 0.3, p.z + hz, {}); };
  // the pole in front of the gate, its halyard waiting
  { const q = at(T - 70, -36); F.poleBase /* 10 m further out than before: clear of the plaza's trees (nearest trunk ~12 m), so the flag flies free */ = v3(q.x, 0, q.z); F.poleH = 14;
    addBox(q.x, 0, q.z, 1.6, 0.6, 1.6, mat('ghPoleB', { color: 0xc8c2b6, rough: 0.8 })); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, F.poleH, 10), MT.metal()); pole.position.set(q.x, 0.6 + F.poleH / 2, q.z); pole.castShadow = true; G.world.add(pole);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), mat('ghGoldB', { color: 0xd8b040, metal: 0.7, rough: 0.3 })); ball.position.set(q.x, 0.6 + F.poleH + 0.1, q.z); G.world.add(ball);
    const fg = new THREE.PlaneGeometry(2.7, 1.8, 14, 7); fg.translate(1.35, 0, 0); const fm = new THREE.MeshStandardMaterial({ map: canvasTex(270, 180, (c, w, h) => drawFlag(c, w, h, 'kr')), side: THREE.DoubleSide, roughness: 0.9 });
    F.flag = new THREE.Mesh(fg, fm); F.flag.position.set(q.x + 0.1, 1.6, q.z); F.flag.visible = false; G.world.add(F.flag); const base = fg.attributes.position.array.slice();
    G.updaters.push(() => { if (!F.flag.visible) return; const a = fg.attributes.position, k = Math.min(1, (F.flag.position.y - 1.6) / 6); for (let i = 0; i < a.count; i++) { const bx = base[i * 3]; a.setZ(i, Math.sin(bx * 2.2 - G.time * 4.5) * (0.04 + 0.12 * k) * bx); a.setY(i, base[i * 3 + 1] - (1 - k) * 0.35 * bx * bx); } a.needsUpdate = true; fg.computeVertexNormals(); }); }
  return F;
}
/* 「북쪽으로」 only, for the developer: Ctrl + O + P turns an admin mode on or off (nothing on screen says it exists).
   In admin mode T jumps ahead: during the ride it finishes the current stretch (as the sample's T does); on foot it puts you on the current objective. */
addEventListener('keydown', (e) => {
  if (!G.mission || G.mission.id !== 'm10') return;
  /* Ctrl + O + P itself is handled for every mission in game/14-workshop.js */
  if (!G.admin || e.code !== 'KeyT' || e.repeat || G.mode !== 'play' || G.paused || G.cut) return;
  if (P.ride && G.hgSkip) { G.hgSkip(e); return; }
  const o = G.objPos; if (!o) return; for (const a of G.actors) if (a.alive && a.team === 'enemy') a.hurt(99999, PT);
  P.pos.set(o.x + 0.4, floorAt(o.x + 0.4, o.z + 0.4, (o.y ?? 0) + 2), o.z + 0.4); P.vel.set(0, 0, 0); toast('다음 지점으로 이동');
}, true);

