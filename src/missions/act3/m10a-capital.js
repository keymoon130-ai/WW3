function ambushRun(S, ride, groups, o = {}) {
  tut('amb', '<b>매복!</b> 방향을 외치면 그쪽을 쏘세요. 한 명이라도 쓰러뜨리면 뒤 차량이 나머지를 처리해요. 아무도 못 맞추면 <b>대전차병이 RPG를 쏴요!</b>', null, 9);
  const dir = o.dir ?? -1; const st = groups.map(() => ({ on: false, done: false, men: [] }));
  const side = (x) => (x - ride.pos.x) * -dir > 6 ? '우측' : (x - ride.pos.x) * -dir < -6 ? '좌측' : '정면';
  return S.every(0.25, () => {
    if (!ride.alive && ride.alive !== undefined) return true;
    groups.forEach((g, i) => {
      const s = st[i]; const ahead = (g.z - ride.pos.z) * dir;
      if (!s.on && ahead < (o.spawnAt ?? 140) && ahead > 20) {
        s.on = true;
        for (let k = 0; k < g.n; k++) { const gw = g.w ?? 4; const a = enemy(g.x + rand(-gw, gw), g.z + rand(-3, 3), { tag: 'amb' + i, hold: true, view: 160, y: g.y, crouch: Math.random() < 0.4, kind: k === 0 ? 'heavy' : 'rifle' }); s.men.push(a); }
        const at = s.men[s.men.length - 1]; at.isAT = true; const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), mat('rpgc', { color: 0x4a4e3a })); tube.rotation.x = Math.PI / 2; tube.position.set(0.12, 0.62, 0.05); at.m.torso.add(tube);
        S.sayBg(pick(['윤하린 중사', '리선우 병장', '한지운 하사']), `${g.y ? '고가도로 위' : '전방 ' + side(g.x)}! 매복이다!${g.n >= 5 ? ' 다수다!' : ''}`, { dur: 2 });
      }
      if (s.on && !s.done && ahead < -10) {
        s.done = true;
        const byMe = s.men.filter((a) => !a.alive && a.killer === PT).length;
        const left = s.men.filter((a) => a.alive);
        if (byMe > 0 || !left.length) { // the vehicles behind mop up
          left.forEach((a, k) => S.later(0.4 + k * 0.35, () => { if (!a.alive) return; const from = ride.pos.clone().add(v3(rand(-10, 10), 3, -dir * rand(18, 30))); for (let q = 0; q < 5; q++) tracer(from, a.chest(v3()).add(v3(rand(-0.3, 0.3), rand(-0.3, 0.3), 0)), [1, 0.6, 0.3], 400); SFX.shot('mg', a.pos); a.hurt(999, null); }));
          if (left.length) S.sayBg('박도현 중위', pick(['뒤에서 처리한다! 앞만 봐라!', '좋다, 나머지는 후속 차량이 쓸어버린다!']), { dur: 2 });
        } else { // nobody shot at them: the AT man gets his shot off
          const at = left.find((a) => a.isAT) || left[0];
          S.sayBg(pick(['리선우 병장', '윤하린 중사']), '대전차병! 쏴라, 쏴!', { dur: 1.6 });
          S.later(0.8, () => { if (!at.alive) return; const from = at.eye(v3()); const to = ride.pos.clone().add(v3(rand(-1.5, 1.5), 2.2, 0)); const pr = new Proj('rocket', from, to.clone().sub(from).normalize().multiplyScalar(70), { team: 'enemy', owner: at }); SFX.shot('rpg', from);
            S.later(Math.max(0.2, from.distanceTo(to) / 70), () => { if (pr.alive) pr.kill(); explode(to, { noPlayer: true, size: 1.8, radius: 3, dmg: 0, vdmg: 0 }); damagePlayer(o.hit ?? 34, to, true); G.shake += 0.9; SFX.ring && SFX.ring(2); }); });
          S.later(6, () => { for (const a of left) if (a.alive) a.remove(); });
        }
      }
    });
  });
}

/* ---------------- 경인고속도로 (world for 「수도」) ---------------- */
const GI = { start: 60, collapse: -600, toll: -900, apt0: -1050, bank: -1440, // bank: 신월IC, where the 경인고속도로 becomes 국회대로
  rt: [[0, -1440], [0, -1950], [170, -2280], [20, -2500], [-170, -2690]], sx: 125, sz0: -2240, sz1: -3300, han: -260 }; // 샛강 (x = sx, and its mouth along z = sz0), 한강 north of x = han
function gyeonginGround(x, z) {
  const ax = Math.abs(x); let y = ax < 16 ? 0 : -Math.min(2.2, (ax - 16) * 0.16) + Math.sin(x * 0.05 + z * 0.02) * 0.2 * clamp((ax - 30) / 20, 0, 1);
  if (z > GI.bank + 30) return y;
  // past 신월IC: flat city along 국회대로; 샛강 cuts across before 여의도, the 한강 runs north of it
  const kc = smooth(clamp((GI.bank + 30 - z) / 40, 0, 1)); let g = lerp(y, 0, kc);
  if (giRoadDist(x, z) > 15) { const sx = Math.abs(x - GI.sx) < 12 && z < GI.sz0 + 12 && z > GI.sz1, sz = Math.abs(z - GI.sz0) < 12 && x > GI.han && x < GI.sx + 12;
    if (sx || sz) g = Math.min(g, -3.2); else { const e = Math.min(sx ? 0 : Math.max(0, Math.abs(x - GI.sx) - 12), Math.max(0, Math.abs(z - GI.sz0) - 12)); if (z < GI.sz0 + 30 && e < 8 && (Math.abs(x - GI.sx) < 20 || Math.abs(z - GI.sz0) < 20)) g = Math.min(g, -3.2 * (1 - e / 8)); } }
  if (x < GI.han + 20 && z < -1700) g = Math.min(g, lerp(0, -9, smooth(clamp((GI.han + 20 - x) / 26, 0, 1)) * smooth(clamp((x - GI.han + 540) / 30, 0, 1)))); // the 한강, ~500 m across
  return g;
}
/* 국회대로: 신월IC → 목동 → 영등포 → 여의도 (the road the column takes on into Seoul; the 경인고속도로 itself ends at 신월IC) */
function giRoadDist(x, z) { let d = 1e9; const R = GI.rt; for (let i = 0; i < R.length - 1; i++) { const [ax, az] = R[i], [bx, bz] = R[i + 1], vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz, t = clamp(((x - ax) * vx + (z - az) * vz) / L2, 0, 1); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); } return d; }
/* a point along the route, d metres from 신월IC, lat metres to the right of the centre line */
function giAt(d, lat = 0) { const R = GI.rt; for (let i = 0; i < R.length - 1; i++) { const [ax, az] = R[i], [bx, bz] = R[i + 1], L = Math.hypot(bx - ax, bz - az); if (d <= L || i === R.length - 2) { const t = Math.min(d, L) / L, fx = (bx - ax) / L, fz = (bz - az) / L; return v3(ax + (bx - ax) * t - fz * lat, 0, az + (bz - az) * t + fx * lat); } d -= L; } }
function giLen() { let L = 0; for (let i = 0; i < GI.rt.length - 1; i++) L += Math.hypot(GI.rt[i + 1][0] - GI.rt[i][0], GI.rt[i + 1][1] - GI.rt[i][1]); return L; }
function overpass(z, o = {}) {
  const deck = MT.concreteD();
  if (!o.broken) { addBox(0, 6.6, z, 110, 1.2, 12, deck, { tile: 4 }); for (const sx of [-1, 1]) { addBox(sx * 55, 7.8, z - 5.6, 0.2, 1.1, 0.2, MT.metal(), { collide: false }); addBox(0, 7.8, z + sx * 5.8, 110, 1.0, 0.3, MT.metal(), { bullet: false }); } }
  for (const px of [-22, 22, 0]) addBox(px, 0, z, 2.2, 6.6, 6, MT.concrete(), { tile: 2 });
  for (const sx of [-1, 1]) { addBox(sx * 70, 0, z, 30, 7.8, 14, MT.concrete(), { tile: 3 }); }
}
function hwSign(z, text, sub, x = 0) {
  for (const sx of [-1, 1]) addBox(x + sx * 16.4, 0, z, 0.35, 7.6, 0.35, MT.metal(), { collide: true }); // the posts stand off the carriageways, the gantry spans them
  addBox(x, 7.2, z, 33.2, 0.3, 0.3, MT.metal(), { collide: false });
  signBoard(x, 6.2, z + 0.3, text, { w: 9, bg: '#1e6a3c', sub, size: 58 });
}
function buildGyeongin() {
  G.groundAt = gyeonginGround;
  buildTerrain(3800, 380, 'snowdirt', 6, 0xb0aa98, 0, -1300);
  buildMountains(2300, 34, 0x5a6252, 80, 200, false, 0, -1300);
  const rc = (70 + GI.bank) / 2, rl = 70 - GI.bank; roadStrip(-8, rc, 14, rl); roadStrip(8, rc, 14, rl);
  addBox(0, 0, rc, 0.7, 0.95, rl, MT.concrete(), { tile: 3 });
  const wallM = mat('noisewall', { color: 0x6a7a70, rough: 0.6, metal: 0.2 });
  for (const sx of [-1, 1]) for (let z = 40; z > GI.bank; z -= 22) { if (Math.abs(z - 11 - GI.toll) < 34) continue; addBox(sx * 17, 0, z - 11, 0.4, 4.6, 22.2, wallM, { tile: 2 }); } // continuous noise walls: nobody hides beside the road
  for (const z of [-150, -380, -820, -1100, -1300]) overpass(z);
  // collapsed overpass: the left half dropped onto the road, a gap stays open on the right lane
  overpass(GI.collapse, { broken: true });
  addBox(-8, 3.2, GI.collapse, 26, 1.2, 12, MT.concreteD(), { tile: 3, rotY: 0.08 }); addMesh(boxGeo(30, 1.2, 12, 3), MT.concreteD(), -30, 4.6, GI.collapse, { rot: [0, 0, 0.3] }); addMesh(boxGeo(30, 1.2, 12, 3), MT.concreteD(), 34, 6.2, GI.collapse, { rot: [0, 0, -0.06] });
  for (let i = 0; i < 6; i++) rubble(rand(-14, 2), GI.collapse + rand(-8, 8), rand(1, 1.6));
  // 부천 요금소
  addBox(0, 6.6, GI.toll, 76, 0.7, 20, mat('tollroof', { color: 0x2f5a8a, rough: 0.5, metal: 0.3 }), { collide: false, tile: 4 });
  for (let x = -32; x <= 32; x += 8) { addBox(x, 0, GI.toll, 2.2, 2.8, 5, mat('booth', { color: 0xd8d4c8 }), { tile: 1 }); addBox(x, 0.0, GI.toll, 0.5, 6.6, 0.5, MT.metal(), { collide: false }); }
  signBoard(0, 7.7, GI.toll + 10.2, '부천 요금소', { w: 12, bg: '#2f5a8a', sub: 'BUCHEON TOLLGATE' });
  // signs along the way
  hwSign(0, '서울 25km', '부평 · 부천'); hwSign(-480, '부천 IC 1km', '중동 · 상동'); hwSign(-1000, '신월 IC 2km', '서울 양천구'); hwSign(-1240, '서울 →', '여의도 · 목동');
  // burnt wrecks on the shoulders and in the lanes
  for (let i = 0; i < 46; i++) { const z = rand(GI.bank + 30, 20), x = pick([-1, 1]) * rand(12, 15.5); if (Math.abs(z - GI.toll) < 20 || Math.abs(z - GI.collapse) < 16) continue; Math.random() < 0.7 ? carProp(x, z, rand(-0.4, 0.4) + (Math.random() < 0.5 ? 0 : Math.PI), pick([0x4a5560, 0x6a2a2a, 0x2a3a5a, 0x777777]), true, Math.random() < 0.25) : truckProp(x, z, rand(-0.2, 0.2), 0x4d4a40, true); }
  for (const [x, z] of [[11, -235], [-11, -300], [-11, -455], [11, -515]]) { carProp(x + 2, z - 4, 0.3, 0x4a5560, true); carProp(x - 2, z + 3, -0.5, 0x6a2a2a, true, true); }
  for (let i = 0; i < 6; i++) tankWreck(pick([-1, 1]) * rand(26, 40), rand(GI.bank + 60, -100), rand(0, 3), Math.random() < 0.5);
  // the outskirts: low warehouses early, apartment blocks closing in towards Seoul
  for (let z = 20; z > GI.apt0; z -= rand(40, 70)) for (const sx of [-1, 1]) if (Math.random() < 0.7) building(sx * rand(48, 90), z, rand(20, 40), rand(16, 30), rand(6, 14), { hue: pick([30, 40, 200]), lit: 0.02, broken: 0.4, fire: Math.random() < 0.25 ? 1 : 0 });
  for (let z = GI.apt0; z > GI.bank + 40; z -= rand(34, 46)) for (const sx of [-1, 1]) { building(sx * rand(54, 57), z, 40, 14, rand(36, 58), { hue: pick([200, 210, 40]), lit: 0.04, broken: 0.5, fire: Math.random() < 0.35 ? 2 : 0 }); if (Math.random() < 0.6) building(sx * rand(30, 34), z + 12, 12, 10, rand(6, 10), { hue: 30, lit: 0.05, broken: 0.6, fire: Math.random() < 0.3 ? 1 : 0 }); }
  buildGukhoe();
}

/* 신월IC → 국회대로 → 영등포 → 샛강 → 여의도 */
function buildGukhoe() {
  const R = GI.rt;
  // the road: two carriageways and a median on every leg, a patch at each bend
  for (let i = 0; i < R.length - 1; i++) { const [ax, az] = R[i], [bx, bz] = R[i + 1], L = Math.hypot(bx - ax, bz - az), rot = Math.atan2(bx - ax, bz - az), cx = (ax + bx) / 2, cz = (az + bz) / 2, fx = (bx - ax) / L, fz = (bz - az) / L;
    for (const sd of [-1, 1]) roadStrip(cx - fz * sd * 8, cz + fx * sd * 8, 14, L + 14, rot);
    addBox(cx, 0, cz, 0.7, 0.9, L - 18, MT.concrete(), { tile: 3, rotY: rot, collide: false });
    for (const sd of [-1, 1]) addBox(cx - fz * sd * 26, -0.03, cz + fx * sd * 26, 22, 0.06, L + 22, MT.concrete(), { tile: 4, rotY: rot, collide: false, cast: false }); } // pavements and forecourts: this is a city, not a field
  addBox(-70, -0.03, -2780, 330, 0.06, 1010, MT.concrete(), { tile: 5, collide: false, cast: false }); // 여의도
  // 신월IC: the ramps peel off left and right where the expressway ends
  for (const sd of [-1, 1]) { roadStrip(sd * 24, GI.bank - 40, 8, 90, sd * 0.35); }
  hwSign(GI.bank + 30, '신월 IC', '국회대로 · 여의도 →'); hwSign(GI.bank - 160, '국회대로', '목동 · 여의도 6km');
  // street furniture along the boulevard: lamps, wrecks, a few barricades
  const L = giLen();
  for (let d = 20; d < L - 10; d += 34) for (const sd of [-1, 1]) { const p = giAt(d, sd * 16.5); addBox(p.x, 0, p.z, 0.25, 9, 0.25, MT.metal(), { collide: false }); }
  for (let i = 0; i < 40; i++) { const d = rand(30, L - 40), p = giAt(d, pick([-1, 1]) * rand(15, 18)); carProp(p.x, p.z, rand(0, 6.28), pick([0x4a5560, 0x6a2a2a, 0x2a3a5a, 0x777777]), true, Math.random() < 0.2); }
  for (let i = 0; i < 4; i++) { const p = giAt(rand(80, L - 200), pick([-1, 1]) * rand(30, 45)); tankWreck(p.x, p.z, rand(0, 3), Math.random() < 0.5); }
  // blocks either side: 목동's apartment towers, then 영등포's low streets, then 여의도's offices
  const E = giAt(giLen()), to63 = (x, z) => { const vx = 70 - E.x, vz = -2960 - E.z, t = clamp(((x - E.x) * vx + (z - E.z) * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(x - E.x - vx * t, z - E.z - vz * t); };
  const free = (x, z, r) => !(x < E.x + 60 && Math.abs(z - E.z) < 110 + r) && to63(x, z) > 26 + r && giRoadDist(x, z) > 24 + r && !(Math.abs(x - GI.sx) < 22 + r && z < GI.sz0 + 22 + r) && !(Math.abs(z - GI.sz0) < 22 + r && x < GI.sx + 22 + r && x > GI.han - 10) && x > GI.han + 30 + r;
  const placed = []; const put = (x, z, w, d, h, o) => { const r = Math.max(w, d) / 2; if (!free(x, z, r) || placed.some(([px, pz, pr]) => Math.hypot(px - x, pz - z) < pr + r + 4)) return false; placed.push([x, z, r]); building(x, z, w, d, h, o); return true; };
  for (let d = 0; d < L; d += 9) for (const sd of [-1, 1]) { const p = giAt(d, sd * rand(36, 150)), zone = d < 520 ? 'mok' : d < 880 ? 'ydp' : 'yeo';
    if (zone === 'mok') put(p.x, p.z, rand(14, 18), rand(36, 46), rand(40, 58), { hue: pick([200, 210, 40]), lit: 0.04, broken: 0.5, fire: Math.random() < 0.3 ? 2 : 0 });
    else if (zone === 'ydp') put(p.x, p.z, rand(16, 30), rand(16, 30), rand(8, 22), { hue: pick([30, 20, 40]), lit: 0.03, broken: 0.5, fire: Math.random() < 0.3 ? 1 : 0 });
    else put(p.x, p.z, rand(24, 36), rand(24, 36), rand(50, 110), { hue: pick([210, 200]), lit: 0.05, broken: 0.35, fire: Math.random() < 0.3 ? 2 : 0 }); }
  for (let i = 0; i < 70; i++) put(rand(-230, 95), rand(-2290, -3280), rand(24, 36), rand(24, 36), rand(45, 120), { hue: pick([210, 200]), lit: 0.05, broken: 0.35, fire: Math.random() < 0.3 ? 2 : 0 }); // 여의도's towers
  // 샛강 and its bridge, the 한강 to the north
  waterPlane(GI.sx, (GI.sz0 + GI.sz1) / 2, 20, GI.sz0 - GI.sz1, -2.2, 0x34464e, false); waterPlane((GI.han + GI.sx) / 2, GI.sz0, GI.sx - GI.han, 20, -2.2, 0x34464e, false);
  waterPlane(GI.han - 255, -2600, 530, 1800, -3, 0x34464e, true);
  { const t = (R[2][0] - GI.sx) / (R[2][0] - R[3][0]), bx = lerp(R[2][0], R[3][0], t), bz = lerp(R[2][1], R[3][1], t), rot = Math.atan2(R[3][0] - R[2][0], R[3][1] - R[2][1]), fx = Math.sin(rot), fz = Math.cos(rot);
    for (const sd of [-1, 1]) { const x = bx - fz * sd * 15.6, z = bz + fx * sd * 15.6; addBox(x, -0.2, z, 0.5, 1.4, 40, MT.concrete(), { rotY: rot, tile: 2, collide: false }); addBox(x, -3.4, z, 1.2, 3.2, 40, MT.concreteD(), { rotY: rot, tile: 2, collide: false }); }
    signBoard(bx - fz * 15.6 - fx * 22, 3.2, bz + fx * 15.6 - fz * 22, '여의2교', { w: 5, bg: '#1e3a5a', sub: '샛강' }); }
  // roadside boards on the bends (facing the column)
  for (const [d, t, sub] of [[560, '영등포 · 여의도', '여의도 2km'], [900, '여의도', '국회의사당 · 63빌딩']]) { const p = giAt(d, 19), q = giAt(d - 5, 19), ry = Math.atan2(q.x - p.x, q.z - p.z); addBox(p.x, 0, p.z, 0.3, 5.2, 0.3, MT.metal(), { collide: false }); signBoard(p.x, 5.4, p.z, t, { w: 7, bg: '#1e6a3c', sub, ry }); }
  // 여의도: 국회의사당's dome to the west, 63빌딩 gold at the far end, the city across the river burning
  { const x = -150, z = -2470; addBox(x, 0, z, 70, 22, 52, mat('assembly', { map: 'concrete', color: 0xd8d4c8 }), { tile: 6 }); const dome = new THREE.Mesh(new THREE.SphereGeometry(18, 24, 12, 0, TAU, 0, Math.PI / 2), mat('domeg', { color: 0x5a7a6a, rough: 0.5, metal: 0.4 })); dome.position.set(x, 22, z); dome.castShadow = true; G.world.add(dome);
    for (let i = -3; i <= 3; i++) addBox(x + i * 9, 0, z - 27, 1.6, 20, 1.6, MT.concrete(), { collide: false }); }
  addBox(70, 0, -2960, 34, 160, 26, mat('gold63b', { color: 0xd8aa48, rough: 0.35, metal: 0.25, emissive: 0x4a3008 }), { collide: false }); // 63빌딩: gold glass catching the fires
  for (let i = 0; i < 70; i++) { const x = rand(-1000, -800), z = rand(-2200, -3300); building(x, z, rand(20, 40), rand(20, 40), rand(40, 140), { hue: 210, lit: 0.06, broken: 0.3, fire: Math.random() < 0.4 ? 2 : 0 }); }
  for (let i = 0; i < 14; i++) addEmitter(v3(rand(-1000, -800), rand(30, 90), rand(-2300, -3200)), 'smoke', 4, 1.5); for (let i = 0; i < 10; i++) addEmitter(v3(rand(-990, -810), rand(2, 30), rand(-2400, -3100)), 'fire', 3, 18);
}

/* ========== MISSION 10 「수도」 ========== */
defMission({
  id: 'm10a', act: '3막 · 반격', num: '미션 11', title: '수도',
  dateText: '2032년 3월 20일 05:30', dateShort: '2032.03.20', place: '경인고속도로 · 서인천IC → 신월IC → 국회대로 → 여의도', placeShort: '경인고속도로', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: { sky: [0x2a3448, 0x8a8078, 0xa89070], glow: 0xffa060, glowDir: [0, 0.08, -1], fog: 0x8a8680, fogD: 0.0042, hemi: [0xc0c4cc, 0x504a44, 0.85], sun: [0xffc090, 0.9], sunDir: [0.1, 0.3, -1], snow: 0, viewDist: 140, battle: 0.7, flashes: 0.25, flashDir: [0, -1], windSnd: 0.25 },
  loadout: { weapons: ['rifle', 'sniper', 'pistol'], nades: 4 },
  bounds: [-60, GI.bank - 40, 60, 90],
  hitMul: 0.85,
  build(S) {
    buildGyeongin();
    squad(S, [
      { key: 'park', name: '박도현 중위', x: -4, z: 52 }, { key: 'lee', name: '리선우 병장', x: 4, z: 52 },
      { key: 'yoon', name: '윤하린 중사', x: -4, z: 56 }, { key: 'han', name: '한지운 하사', x: 4, z: 56 },
    ]);
  },
  phases: [
    /* 1. 서인천IC → 고속도로 질주 */
    {
      setup(S) { S.player(-8, 44, 0); },
      async run(S) {
        const col = [];
        const add = (type, x, z) => { const v = type === 'k808' ? S.allyBMP(x, z, 0, { k808: true, invuln: true, speed: 0, sam: false, rpg: false }) : new Vehicle('tank', x, z, { team: 'ally', armed: true, invuln: true, speed: 0, reload: 5, range: 170, accurate: true, yieldPeople: false }); v.o.yieldPeople = false; col.push(v); return v; };
        add('tank', -8, 10); const mine = add('k808', -8, 28); add('k808', 8, 18); add('tank', 8, 0); const doomed = add('k808', 8, -16); add('k808', -8, -8); add('tank', -8, 46); add('k808', 8, 40);
        doomed.invuln = false;
        await S.say('박도현 중위', '인천에서 서울까지 30킬로미터다. 오늘 안에 끝을 본다. 전원 탑승!', { dur: 3.2 });
        await S.say('한지운 하사', '서한준, 해치 기관총 잡아라. 매복은 고가 위랑 갓길이다.', { dur: 3 });
        for (const k of ['park', 'lee', 'yoon', 'han']) { const a = S.sq[k]; if (a) a.remove(); }
        S.give('k21mg'); giveWeapon('sam', false); P.ammo.sam.res = 2;
        P.ride = { obj: mine.m.root, off: [0.45, 2.05, 1.0] }; P.yaw = 0; P.pitch = -0.05; P.noFire = false;
        // the column rolls out of 서인천IC; the long drive east is skipped
        for (const v of col) { v.path = [v3(v.pos.x, 0, GI.collapse + 42 + (v.pos.z - 10) * 0.6)]; v.pi = 0; v.speed = 5; }
        S.obj('경인고속도로 · 서울 방향 출발');
        await S.wait(7);
        await S.fade(1, 1.2); for (const v of col) v.stopped = true;
        await S.black(['40분 후', '경인고속도로 · 부천 통과, 신월IC 3km 전'], 3.4);
        for (const v of col) { v.stopped = false; v.speed = 9; }
        S.fade(0, 1.2);
        await S.radio('박도현 중위', '신월IC 3킬로미터 전. 여기서부턴 놈들 구역이다. 눈 똑바로 떠라!', { dur: 3 });
        S.obj('경인고속도로 돌파 — 매복을 제압하라');
        S.hint('K808 해치 기관총 · 매복조를 하나라도 쓰러뜨리면 후속 차량이 처리해요 · <kbd>2</kbd> 대공미사일', 7);
        G.hitMul = 0.6; const regen = S.every(0.5, () => { if (P.alive && P.hp < 100 && G.time - P.lastHit > 2.5) P.hp = Math.min(100, P.hp + 5); });
        const amb = ambushRun(S, mine, [
          { x: -10, z: -150, y: 7.8, n: 5, w: 10 }, { x: 11, z: -235, n: 4, w: 3 }, { x: -11, z: -300, n: 5, w: 3 },
          { x: 8, z: -380, y: 7.8, n: 6, w: 10 }, { x: -11, z: -455, n: 4, w: 3 }, { x: 11, z: -515, n: 5, w: 3 },
        ]);
        S.later(14, () => S.radio('사령부', '고성 상륙부대, 춘천 통과. 동부 축선 순조롭다.', { dur: 3 }));
        S.later(26, () => S.threat('heli', { x: 260, z: -500, path: [[60, 40, -260], [-30, 34, -120], [-60, 40, -300], [40, 38, -420]], line: '공격 헬기! 대공미사일로 잡으십시오!' }));
        S.later(40, () => { if (!doomed.alive) return; const from = doomed.pos.clone().add(v3(-40, 8, -80)); new Proj('missile', from, v3().subVectors(doomed.pos.clone().add(v3(0, 2, 0)), from).normalize().multiplyScalar(80), { team: 'enemy' }); S.later(1.2, () => { if (doomed.alive) doomed.die(); S.radio('윤하린 중사', '4호차 피격! 대전차미사일입니다!', { dur: 2.4 }); }); });
        await S.until(() => mine.pi >= mine.path.length || mine.pos.z < GI.collapse + 60);
        S.stop(amb); S.stop(regen); G.hitMul = 1;
        await S.radio('박도현 중위', '고가도로가 무너졌다! 전원 하차! 도보로 간다!', { dur: 2.6 });
        P.ride = null; S.take('k21mg');
        for (const a of aliveEnemies()) if (a.tag.startsWith('amb')) a.remove();
      },
    },
    /* 2. 무너진 고가도로 → 요금소 앞까지 도보 진격 */
    {
      setup(S) { S.player(-4, GI.collapse + 40, 0); },
      async run(S) {
        squad(S, [{ key: 'park', name: '박도현 중위', x: 2, z: GI.collapse + 44 }, { key: 'lee', name: '리선우 병장', x: -2, z: GI.collapse + 46 }, { key: 'yoon', name: '윤하린 중사', x: 4, z: GI.collapse + 47 }, { key: 'han', name: '한지운 하사', x: 0, z: GI.collapse + 49 }]);
        const inf = []; for (let i = 0; i < 12; i++) inf.push(ally(rand(-12, 12), GI.collapse + 50 + i * 1.5, { hp: 150 }));
        inf.forEach((a, i) => { a.follow = { leader: S.sq.park, back: 7 + (i >> 1) * 2, side: i % 2 ? 4 : -4 }; });
        S.armorPush([
          { type: 'k21', x: 10, z: GI.collapse + 30, path: [[10, GI.collapse - 20], [9, GI.toll + 80], [8, GI.toll + 40]], speed: 4.5 },
          { type: 'tank', x: 10, z: GI.collapse + 52, path: [[11, GI.collapse - 30], [12, GI.toll + 60]], speed: 4.5 },
          { type: 'k21', x: 10, z: GI.collapse + 72, path: [[10, GI.collapse - 10], [-6, GI.toll + 70], [-8, GI.toll + 45]], speed: 4.5, rpg: true },
        ], { lead: 18 });
        const pr = S.pressure({ from: [[-10, GI.collapse - 120], [10, GI.collapse - 130], [-8, GI.toll + 60], [8, GI.toll + 50], [0, GI.toll - 40]], to: () => [rand(-14, 14), Math.min(P.pos.z - rand(30, 60), GI.toll + 30)], tag: 'gi', max: 14, every: 1.0, heavy: 0.2 });
        S.later(4, () => S.radio('사령부', '고성 상륙부대, 남양주 진입! 서울 동쪽 퇴로를 막았다!', { dur: 3.2 }));
        S.later(20, () => S.threat('bmp', { x: -6, z: GI.toll - 60, path: [[-6, GI.toll + 10], [-4, GI.toll + 60]], line: '적 BMP! 요금소 쪽에서 나옵니다!' }));
        await S.lead('park', [
          [10, GI.collapse + 8, { run: true, say: ['박도현 중위', '오른쪽 차선으로! 장갑차 뒤에 붙어라!'], bg: true }],
          [10, GI.collapse - 40, { run: true }], [8, GI.collapse - 110, { fight: 'gi', leave: 10, fightMax: 15 }],
          [6, GI.collapse - 190, { run: true }], [4, GI.toll + 60, { fight: 'gi', leave: 8 }],
        ], { follow: ['lee', 'yoon', 'han'], label: '박도현 중위를 따라 부천 요금소로', call: '서한준! 빨리 붙어라!' });
        pr.stop();
      },
    },
    /* 3. 부천 요금소 — 공습으로 돌파 */
    {
      setup(S) { S.player(4, GI.toll + 56, 0); },
      async run(S) {
        squad(S, [{ key: 'park', name: '박도현 중위', x: 0, z: GI.toll + 60 }, { key: 'lee', name: '리선우 병장', x: -3, z: GI.toll + 62 }, { key: 'yoon', name: '윤하린 중사', x: 3, z: GI.toll + 62 }, { key: 'han', name: '한지운 하사', x: 6, z: GI.toll + 63 }]);
        G.armorHold = true; G.strikeMode = 'air'; S.give('desig');
        const tanks = [[-14, GI.toll - 30], [16, GI.toll - 36]].map(([x, z]) => { sandbagRing(x, z + 4, 4.2, Math.PI); return new Vehicle('tank', x, z, { path: [[x, z + 2]], speed: 1, reload: 6, hp: 600 }); });
        const nests = [[-12, GI.toll - 6], [0, GI.toll - 12], [12, GI.toll - 6]];
        const nestMen = nests.map(([x, z]) => { sandbagRing(x, z, 2.2, Math.PI); return [0, 1].map((k) => enemy(x - 0.8 + k * 1.6, z, { tag: 'toll', kind: k ? 'heavy' : 'rifle', hold: true, view: 150, hp: 260 })); }).flat();
        for (let i = 0; i < 14; i++) enemy(rand(-15, 15), GI.toll - rand(4, 40), { tag: 'toll', view: 110, crouch: Math.random() < 0.5 });
        const pr = S.pressure({ from: [[-12, GI.toll - 90], [12, GI.toll - 90], [0, GI.toll - 120]], to: () => [rand(-15, 15), GI.toll - rand(5, 30)], tag: 'toll', max: 16, every: 1.1, heavy: 0.25 });
        await S.say('박도현 중위', '요금소에 전차 둘이 묻혀 있다! 서한준, 표적지시기! 공군 불러라!', { dur: 3 });
        S.hint('<kbd>4</kbd> 표적지시기 · 조준 후 <kbd>좌클릭</kbd> 공습 요청', 6);
        S.obj('표적지시기로 요금소 전차 공습 (0/2)');
        const mk = S.every(0.25, () => { const t = tanks.find((v) => v.alive); G.objPos = t ? t.pos.clone().add(v3(0, 3, 0)) : null; S.obj(`표적지시기로 요금소 전차 공습 (${tanks.filter((v) => !v.alive).length}/2)`); });
        await S.until(() => tanks.every((v) => !v.alive));
        S.stop(mk);
        S.radio('항공 통제', '요금소 진지 일대, 한 번 더 쓸어준다. 머리 숙여라.', { dur: 2.6 });
        jetPass([-600, 90, GI.toll - 10], [600, 100, GI.toll - 10], { speed: 280, bombs: nests.map(([x, z]) => [x, z]), noPlayer: true, src: PT, dmg: 600 });
        await S.wait(3.5);
        for (const a of nestMen) if (a.alive) a.hurt(9999, PT);
        await S.say('박도현 중위', '전차 날아갔다! 요금소 돌파! 전원 돌격!', { dur: 2.4 });
        G.armorHold = false;
        await S.lead('park', [[4, GI.toll + 20, { run: true }], [4, GI.toll + 4, { fight: 'toll', leave: 8, crouch: true, fightMax: 12 }], [4, GI.toll - 12, { run: true }], [4, GI.toll - 40, { run: true }]], { follow: ['lee', 'yoon', 'han'], label: '요금소 돌파', call: '서한준! 돌격이다!' });
        pr.stop();
        { const t0 = G.time; await S.until(() => aliveEnemies('toll').length <= 4 || G.time - t0 > 12); for (const a of aliveEnemies('toll')) if (hiddenFromView(a.pos) || a.pos.z > P.pos.z + 10) a.remove(); }
        G.strikeMode = null;
      },
    },
    /* 4. 신월IC — 아파트 시가전 */
    {
      setup(S) { S.player(0, GI.toll - 50, 0); },
      async run(S) {
        squad(S, [{ key: 'park', name: '박도현 중위', x: 2, z: GI.toll - 54 }, { key: 'lee', name: '리선우 병장', x: -2, z: GI.toll - 52 }, { key: 'yoon', name: '윤하린 중사', x: 4, z: GI.toll - 51 }, { key: 'han', name: '한지운 하사', x: 0, z: GI.toll - 49 }]);
        S.armorPush([
          { type: 'tank', x: -8, z: GI.toll - 40, path: [[-8, GI.apt0 - 100], [-8, GI.bank + 60]], speed: 5 },
          { type: 'k21', x: 8, z: GI.toll - 30, path: [[8, GI.apt0 - 120], [8, GI.bank + 50]], speed: 5, rpg: true, sam: true },
          { type: 'k21', x: -8, z: GI.toll - 64, path: [[-8, GI.apt0 - 80], [-6, GI.bank + 70]], speed: 5 },
          { type: 'tank', x: 8, z: GI.toll - 70, path: [[8, GI.apt0 - 90], [8, GI.bank + 80]], speed: 5 },
        ], { lead: 18 });
        for (let i = 0; i < 26; i++) enemy(pick([-1, 1]) * rand(3, 15), rand(GI.bank + 60, GI.apt0 + 10), { tag: 'apt', view: 100, crouch: Math.random() < 0.5, kind: Math.random() < 0.2 ? 'heavy' : 'rifle' });
        for (const [x, z, h] of [[-1, GI.apt0 - 50, 24], [1, GI.apt0 - 120, 30], [-1, GI.apt0 - 190, 21], [1, GI.apt0 - 255, 33], [-1, GI.apt0 - 320, 27]]) { building(x * 53, z, 40, 12, h + 9, { hue: 210, lit: 0.04, broken: 0.6 }); addBox(x * 32, h - 0.3, z, 2.2, 0.3, 3.4, MT.concreteD()); addBox(x * 30.95, h, z, 0.15, 1.0, 3.4, MT.metal(), { bullet: false }); const a = enemy(x * 31.8, z, { tag: 'snip', hold: true, view: 220, acc: 1.4, y: h, yaw: x < 0 ? -Math.PI / 2 : Math.PI / 2 }); a.marked = true; }
        const pr = S.pressure({ from: [[-12, GI.apt0 - 150], [12, GI.apt0 - 200], [-12, GI.apt0 - 300], [12, GI.apt0 - 340]], to: () => [rand(-14, 14), P.pos.z - rand(40, 80)], tag: 'apt', max: 14, every: 1.0, heavy: 0.2 });
        await S.say('윤하린 중사', '아파트 창문에 저격수! 높은 층입니다!', { dur: 2.4 });
        S.hint('<kbd>2</kbd> K-S01 저격총으로 창가 저격수를 노리세요', 5);
        S.later(8, () => S.radio('UN군 사령부', 'UN군 선두, 수원 통과. 서울 남쪽으로 북상 중이다.', { dur: 3 }));
        S.later(30, () => S.radio('해병 2연대', '김포공항 확보! 활주로 장악했다!', { dur: 3 }));
        S.later(22, () => S.threat('bmp', { x: 70, z: GI.apt0 - 200, path: [[24, GI.apt0 - 200], [10, GI.apt0 - 230]], line: '오른쪽 옆길! 적 BMP 매복입니다!' }));
        await S.lead('park', [
          [6, GI.apt0 - 20, { run: true, say: ['박도현 중위', '신월IC다! 속도 늦추지 마라!'], bg: true }],
          [8, GI.apt0 - 110, { fight: 'apt', leave: 10, crouch: true, fightMax: 15 }], [6, GI.apt0 - 220, { run: true }],
          [8, GI.apt0 - 290, { fight: 'apt', leave: 5, fightMax: 15 }], [4, GI.bank + 30, { run: true }], [2, GI.bank + 14, { run: true }],
        ], { follow: ['lee', 'yoon', 'han'], label: '박도현 중위를 따라 신월IC 돌파', call: '서한준! 뒤처지지 마라!' });
        pr.stop();
        for (const a of aliveEnemies()) if (a.pos.z > GI.bank + 30 || hiddenFromView(a.pos)) a.remove();
        await S.say('박도현 중위', '신월IC 확보! 고속도로는 여기까지다. 국회대로 타고 여의도까지 밀고 간다! 전원 탑승!', { dur: 3.4 });
      },
    },
    /* 5. 국회대로 → 목동 → 영등포 → 샛강 → 여의도 (차량 돌파) */
    {
      setup(S) { S.player(2, GI.bank + 14, 0); },
      async run(S) {
        P.bounds = null;
        await S.fade(1, 0.8);
        for (const v of [...G.vehicles]) if (v.team === 'ally' && !v.air) v.remove(); // the push armour is folded into the new column
        for (const k of ['park', 'lee', 'yoon', 'han']) { const a = S.sq[k]; if (a) a.remove(); }
        const L = giLen(), lane = (lat, from) => { const pts = [v3(lat, 0, from)]; for (let d = 10; d < L; d += 12) pts.push(giAt(d, lat)); pts.push(giAt(L, lat)); return pts; };
        const col = [];
        const add = (type, lat, z, stopAt) => { const v = type === 'k808' ? S.allyBMP(lat, z, 0, { k808: true, invuln: true, speed: 0, sam: false, rpg: false }) : new Vehicle('tank', lat, z, { team: 'ally', armed: true, invuln: true, speed: 0, reload: 5, range: 170, accurate: true, yieldPeople: false });
          v.o.yieldPeople = false; v.o.noDetour = true; v.path = lane(lat, z - 6).filter((p, k, a) => k < a.length - stopAt); v.pi = 0; v.speed = 9; v.stopped = true; col.push(v); return v; };
        add('tank', -8, GI.bank + 4, 0); const mine = add('k808', -8, GI.bank + 26, 2); add('k808', 8, GI.bank + 12, 1); add('tank', 8, GI.bank + 34, 3); add('k808', -8, GI.bank + 48, 4); add('k808', 8, GI.bank + 58, 5);
        S.give('k21mg'); P.ride = { obj: mine.m.root, off: [0.45, 2.05, 1.0] }; P.yaw = 0; P.pitch = -0.05; P.noFire = false;
        S.fade(0, 1.2); for (const v of col) v.stopped = false;
        await S.radio('박도현 중위', '국회대로다! 목동 지나 영등포, 여의도까지 멈추지 않는다!', { dur: 3 });
        S.obj('국회대로 돌파 — 여의도로');
        G.hitMul = 0.6; const regen = S.every(0.5, () => { if (P.alive && P.hp < 100 && G.time - P.lastHit > 2.5) P.hp = Math.min(100, P.hp + 5); });
        const grp = (d, sd, n) => { const p = giAt(d, sd * 13); return { x: p.x, z: p.z, n, w: 3 }; };
        const amb = ambushRun(S, mine, [grp(150, 1, 4), grp(290, -1, 5), grp(430, 1, 4), grp(600, -1, 5), grp(760, 1, 4), grp(1040, -1, 5), grp(1150, 1, 4)]);
        const passed = (d) => () => { const p = giAt(d); return Math.hypot(mine.pos.x - p.x, mine.pos.z - p.z) < 14; };
        S.later(10, () => S.radio('사령부', '해병 2연대, 김포공항에서 강서로 진입. 우측 방호는 해병이 맡는다.', { dur: 3 }));
        S.until(passed(330)).then(() => S.sayBg('리선우 병장', '양쪽 다 아파트입네다… 목동이야요. 창문 조심하라우!', { dur: 2.6 }));
        S.until(passed(520)).then(() => S.sayBg('윤하린 중사', '영등포 진입! 여의도까지 1킬로미터!', { dur: 2.4 }));
        S.until(passed(640)).then(() => S.threat('heli', { x: 300, z: -2500, path: [[160, 40, -2350], [60, 36, -2200], [-40, 40, -2380]], line: '공격 헬기! 영등포 상공입니다!' }));
        S.until(passed(840)).then(() => S.sayBg('한지운 하사', '여의2교! 샛강 건넌다! 다리 위에서 서지 마라!', { dur: 2.4 }));
        await S.until(() => mine.pi >= mine.path.length || passed(L - 30)());
        S.stop(amb); S.stop(regen); G.hitMul = 1;
        for (const a of aliveEnemies()) if (hiddenFromView(a.pos) || a.pos.distanceTo(P.pos) > 60) a.remove();
        await S.say('박도현 중위', '여의도다! 정지! 주변 확보!', { dur: 2.4 });
        await S.cut(async () => {
          const fd = scene.fog.density; scene.fog.density = 0.0012; // the morning haze lifts enough to see across the river
          const e = giAt(L); await S.cam(v3(e.x + 8, 6, e.z + 12), v3(70, 80, -2960), 0); S.camFov(55);
          S.music('sad');
          await S.radio('수도방위사령부', '양방향 상륙 성공 확인. 1군단은 한강대교, 원효대교로 진격하여 용산부근을 탈환한뒤 계속 진격하라!', { dur: 5 });
          S.cam(v3(e.x - 20, 8, e.z + 4), v3(-1000, 40, -2780), 7, (t) => t * t * (3 - 2 * t)); // from 63빌딩 round to the river and the city across it
          await S.say('윤하린 중사', '…여의도입니다. 강 건너가 용산입니다.', { dur: 3 });
          await S.say('서한준', '서울이… 아직 불타고 있습니다.', { dur: 2.8 });
          await S.say('박도현 중위', '오늘은 여기까지다. 내일 새벽, 노량진으로 내려가 한강대교를 건넌다.', { dur: 3.6 });
          await S.fade(1, 2.5); scene.fog.density = fd;
        });
      },
    },
  ],
});

/* friendly gunship: hangs ahead of the squad and rakes the street with its gun, but leaves plenty for us */