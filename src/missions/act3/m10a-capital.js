function ambushRun(S, ride, groups, o = {}) {
  tut('amb', '<b>매복!</b> 방향을 외치면 그쪽을 쏘세요. 한 명이라도 쓰러뜨리면 뒤 차량이 나머지를 처리해요. 아무도 못 맞추면 <b>대전차병이 RPG를 쏴요!</b>', null, 9);
  const dir = o.dir ?? -1; const st = groups.map(() => ({ on: false, done: false, men: [] }));
  const side = (x) => (x - ride.pos.x) * -dir > 6 ? '우측' : (x - ride.pos.x) * -dir < -6 ? '좌측' : '정면';
  return S.every(0.25, () => {
    if (!ride.alive && ride.alive !== undefined) return true;
    groups.forEach((g, i) => {
      const s = st[i]; const ahead = (g.z - ride.pos.z) * dir;
      // the team is already lying up behind its cover well beyond the haze: nobody blinks into being in front of the column
      if (!s.on && ahead < (o.spawnAt ?? 250) && ahead > 20) {
        s.on = true;
        for (let k = 0; k < g.n; k++) { const gw = g.w ?? 4; const a = enemy(g.x + rand(-gw, gw), g.z + rand(-3, 3), { tag: 'amb' + i, hold: true, view: 160, y: g.y, crouch: true, kind: k === 0 ? 'heavy' : 'rifle' }); s.men.push(a); }
        const at = s.men[s.men.length - 1]; at.isAT = true; const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), mat('rpgc', { color: 0x4a4e3a })); tube.rotation.x = Math.PI / 2; tube.position.set(0.12, 0.62, 0.05); at.m.torso.add(tube);
      }
      if (s.on && !s.called && ahead < 140) { s.called = true; S.sayBg(pick(['윤하린 중사', '리선우 병장', '한지운 하사']), `${g.y ? '고가도로 위' : '전방 ' + side(g.x)}! 매복이다!${g.n >= 5 ? ' 다수다!' : ''}`, { dur: 2 }); }
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
          S.later(6, () => { for (const a of left) if (a.alive && hiddenFromView(a.pos)) a.remove(); });
        }
      }
    });
  });
}

/* ---------------- 경인고속도로 (world for 「수도」) ----------------
   서인천IC → 부평IC → 서운JCT → 부천IC → 신월IC, 13.4 km, 왕복 8차로. The only tollgate (인천요금소) is at the Incheon end, so there is none
   on our stretch: the enemy line is dug in where the 신월IC ramps peel off towards the 남부순환로 overpass.
   cross-section (each carriageway, from the median out): F-type median barrier with an anti-glare screen | 0.6 m inner shoulder |
   yellow edge line | 4 lanes × 3.5 m, white dashes | white edge line | 2.6 m shoulder | W-beam guardrail | noise wall (steel lower panels, clear upper) */
const GI = { start: 60, collapse: -600, ramp: -900, apt0: -1050, bank: -1440, // ramp: 신월IC, where its ramps peel off; bank: the end of the 경인고속도로, where it becomes 국회대로
  rt: [[0, -1440], [0, -1950], [170, -2280], [20, -2500], [-170, -2690]], sx: 125, sz0: -2240, sz1: -3300, han: -260, // 샛강 (x = sx, and its mouth along z = sz0), 한강 north of x = han
  nb: -1100, rail: 17.4, wall: 18.4, gapZ: -1252, xo0: -750, xo1: -812, // xo: the median crossover
  rv: -222, rv0: -2240, rv1: -3300, x63: 70, z63: -2960 }; // rv: the riverside road along the 한강 (x = rv, from z = rv0 to rv1); 63빌딩 // nb: the 남부순환로 overpass; gapZ: a stretch of noise wall blown open (the side street the BMP uses)
GI.amb5 = [[150, 1, 4], [290, -1, 5], [430, 1, 4], [600, -1, 5], [760, 1, 4], [1040, -1, 5], [1150, 1, 4]]; // 국회대로 ambushes: [distance, side, men]
GI.snipers = [[-1, -1125, 24], [1, -1170, 30], [-1, -1240, 21], [1, -1305, 33], [-1, -1370, 27]];
/* the 신월IC ramps: |x| of the ramp's centre line and its height, from where it leaves the carriageway (z = ramp + 40) up to the overpass deck */
function giRampX(z) { return 19 + 25 * smooth(clamp((GI.ramp + 40 - z) / 160, 0, 1)); }
function giRampH(z) { return 7.8 * smooth(clamp((GI.ramp - 40 - z) / 154, 0, 1)); }
const giOnRamp = (z) => z < GI.ramp + 46 && z > GI.nb + 6;
function gyeonginGround(x, z) {
  const ax = Math.abs(x); let y = ax < 19.5 ? 0 : -Math.min(2.2, (ax - 19.5) * 0.16) + Math.sin(x * 0.05 + z * 0.02) * 0.2 * clamp((ax - 30) / 20, 0, 1);
  if (giOnRamp(z)) { const d = Math.abs(ax - giRampX(z)), h = giRampH(z); if (d < 4.4) y = Math.max(y, h); else if (d < 13) y = Math.max(y, lerp(h, y, smooth((d - 4.4) / 8.6))); } // the ramp on its embankment
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
/* expressway carriageway paint: 17.2 m across from the median (u = 0) out to the guardrail, 20 m along */
function giXwayTex() {
  if (TX.xway) return; TX.xway = canvasTex(512, 1024, (g, w, h) => {
    const M = w / 17.2, px = (m) => (m - 0.4) * M; noiseFill(g, w, h, '#3b3c3e', 0.08, 42000, 2);
    for (let i = 0; i < 4200; i++) { g.fillStyle = `rgba(${randi(120, 170)},${randi(120, 165)},${randi(115, 155)},${rand(0.1, 0.28)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 2.2), rand(1, 2.2)); }
    g.fillStyle = 'rgba(150,150,150,.10)'; g.fillRect(px(15.0), 0, w - px(15.0), h); g.fillRect(0, 0, px(1.0), h); // shoulders: older, paler asphalt
    for (const c of [2.75, 6.25, 9.75, 13.25]) for (const o of [-0.9, 0.9]) { g.fillStyle = 'rgba(14,14,16,.16)'; g.fillRect(px(c + o) - 12, 0, 24, h); } // wheel tracks polished dark in every lane
    g.strokeStyle = 'rgba(12,12,14,.5)'; for (let i = 0; i < 9; i++) { g.lineWidth = rand(0.8, 2); g.beginPath(); let x = rand(0, w), y = rand(0, h); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += rand(-18, 18); y += rand(-18, 18); g.lineTo(x, y); } g.stroke(); }
    const paint = (x0, y0, ww, hh, c) => { g.fillStyle = c; g.fillRect(x0, y0, ww, hh); for (let i = 0; i < ww * hh / 7; i++) { g.fillStyle = 'rgba(58,58,60,.55)'; g.fillRect(x0 + rand(0, ww), y0 + rand(0, hh), rand(1, 2.5), rand(1, 2.5)); } };
    paint(px(1.0) - 2, 0, 0.15 * M, h, '#d8b23a'); // yellow line along the median side
    for (const c of [4.5, 8.0, 11.5]) paint(px(c) - 2, h * 0.1, 0.15 * M, 8 * (h / 20), '#e4e4de'); // lane lines: 8 m paint, 12 m gap
    paint(px(15.0) - 3, 0, 0.2 * M, h, '#e4e4de'); // edge line at the shoulder
  });
}
function overpass(z, o = {}) {
  const deck = MT.concreteD();
  if (!o.broken) { addBox(0, 6.6, z, 110, 1.2, 12, deck, { tile: 4 });
    for (const gx of [-4, 0, 4]) addBox(0, 5.75, z + gx, 110, 0.85, 0.7, MT.concrete(), { collide: false, tile: 4 }); // girders under the deck
    for (const sz of [-1, 1]) { // concrete parapets with a rail on top; the 남부순환로 deck leaves room where the 신월IC ramps come up onto it
      const segs = o.gaps ? [[-55, -48.6], [-39.4, 39.4], [48.6, 55]] : [[-55, 55]];
      for (const [a, b] of segs) { addBox((a + b) / 2, 7.8, z + sz * 5.75, b - a, 0.85, 0.35, MT.concrete(), { tile: 2 }); addBox((a + b) / 2, 8.65, z + sz * 5.75, b - a, 0.08, 0.1, MT.metal(), { collide: false }); } } }
  for (const px of [-22, 22, 0]) { addBox(px, 0, z, 2.2, 5.2, 2.2, MT.concrete(), { tile: 2 }); if (!o.broken) addBox(px, 5.2, z, 3.4, 0.55, 9.5, MT.concrete(), { collide: false, tile: 2 }); } // piers and their caps
  for (const sx of [-1, 1]) { addBox(sx * 70, 0, z, 30, 7.8, 14, MT.concrete(), { tile: 3 }); }
}
function hwSign(z, text, sub, x = 0) {
  // 문형식 gantry: two posts behind the guardrails, a twin-chord truss across, the green board over the lanes
  for (const sx of [-1, 1]) { addBox(x + sx * 17.95, 0, z, 0.4, 8.4, 0.4, MT.metal(), { collide: true }); addBox(x + sx * 17.95, 0, z, 0.9, 0.3, 0.9, MT.concrete(), { collide: false }); }
  for (const y of [7.25, 8.05]) addBox(x, y, z, 36.3, 0.18, 0.18, MT.metal(), { collide: false });
  for (let k = -17; k <= 17; k += 2) addBox(x + k, 7.25, z, 0.08, 0.8, 0.08, MT.metal(), { collide: false });
  signBoard(x + 8, 6.4, z + 0.3, text, { w: 9, bg: '#1e6a3c', sub, size: 58 });
  addBox(x + 8, 5.24, z + 0.18, 9.2, 2.34, 0.1, mat('signback', { color: 0x5c6066, rough: 0.6, metal: 0.4 }), { collide: false }); // the plain back of the board (seen from Seoul's side)
}
/* a W-beam guardrail between two points (posts every 4 m), following the ground */
function giRail(x0, z0, x1, z1) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 4)), rm = mat('wbeam', { color: 0xa8acae, rough: 0.45, metal: 0.55 });
  for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), z = lerp(z0, z1, i / n); addBox(x, G.groundAt(x, z), z, 0.15, 0.82, 0.15, MT.metal(), { collide: false }); }
  for (let i = 0; i < n; i++) { const xa = lerp(x0, x1, i / n), za = lerp(z0, z1, i / n), xb = lerp(x0, x1, (i + 1) / n), zb = lerp(z0, z1, (i + 1) / n), ya = G.groundAt(xa, za), yb = G.groundAt(xb, zb);
    addMesh(boxGeo(0.08, 0.32, Math.hypot(xb - xa, zb - za) + 0.1), rm, (xa + xb) / 2, (ya + yb) / 2 + 0.62, (za + zb) / 2, { rot: [0, Math.atan2(xb - xa, zb - za), 0] }); }
}
/* low factory sheds of the 부천 industrial belt: sawtooth roofs */
function giFactory(x, z, w, d) {
  building(x, z, w, d, rand(6, 9), { hue: pick([30, 40]), lit: 0.01, broken: 0.5, fire: Math.random() < 0.2 ? 1 : 0 });
  const y = G.groundAt(x, z), h = 7.5, rm = mat('sawroof', { color: 0x6a6c68, rough: 0.7, metal: 0.3 });
  for (let k = -w / 2 + 3; k < w / 2 - 1; k += 6) addMesh(boxGeo(6.4, 0.2, d, 1), rm, x + k, y + h + 1.2, z, { rot: [0, 0, 0.45] });
}
/* nothing is built where the ramps, the overpass abutments or the blown side street have to be */
function giSiteFree(x, z, w, d) {
  const x0 = Math.abs(x) - w / 2, z0 = z - d / 2, z1 = z + d / 2;
  if (z0 < GI.ramp + 50 && z1 > GI.nb - 14 && x0 < 60) return false;
  for (const oz of [-150, -380, -820, GI.nb, -1300]) if (z0 < oz + 9 && z1 > oz - 9 && x0 < 87) return false;
  if (x > 0 && z0 < GI.gapZ + 28 && z1 > GI.gapZ - 28) return false;
  for (const [sx, sz] of GI.snipers) if (Math.sign(x) === sx && z0 < sz + 14 && z1 > sz - 14 && x0 < 80) return false;
  return true;
}
function buildGyeongin() {
  G.groundAt = gyeonginGround;
  buildTerrain(3800, 380, 'snowdirt', 6, 0xb0aa98, 0, -1300);
  buildMountains(2300, 34, 0x5a6252, 80, 200, false, 0, -1300);
  giXwayTex(); const xw = mat('xway', { map: 'xway' });
  const rc = (70 + GI.bank) / 2, rl = 70 - GI.bank; roadStrip(9.0, rc, 17.2, rl, 0, undefined, { mat: xw }); roadStrip(-9.0, rc, 17.2, rl, Math.PI, undefined, { mat: xw });
  // F-type median barrier (one collider), the anti-glare screen on it, and twin-arm lamp posts every 50 m
  // ...broken by one 중앙분리대 개구부 (the crossover where the removable barrier sections are lifted out), which the armour uses past the collapse
  for (const [za, zb] of [[70, GI.xo0], [GI.xo1, GI.bank]]) { const c = (za + zb) / 2, l = za - zb;
    addBox(0, 0, c, 0.7, 0.95, l, MT.concrete(), { tile: 3 }); addBox(0, 0, c, 0.95, 0.28, l, MT.concrete(), { tile: 3, collide: false });
    addBox(0, 0.95, c, 0.06, 0.62, l, mat('glare', { color: 0x3c5a44, rough: 0.8 }), { collide: false, cast: false }); }
  for (const s of [-1, 1]) addBox(s * 16.2, 0, (GI.xo0 + GI.xo1) / 2 + s * 8, 0.7, 0.95, 6, MT.concrete(), { tile: 2 }); // two of the lifted sections, left on the shoulders
  const lampM = mat('lamphead', { color: 0x2a2c2e, rough: 0.5, metal: 0.5 });
  for (let z = 30; z > GI.bank; z -= 50) { if (z < GI.xo0 + 4 && z > GI.xo1 - 4) continue; addBox(0, 0.95, z, 0.26, 9.4, 0.26, MT.metal(), { collide: false }); for (const s of [-1, 1]) { addBox(s * 1.6, 10.2, z, 3.2, 0.12, 0.12, MT.metal(), { collide: false }); addBox(s * 3.25, 10.0, z, 0.75, 0.2, 0.36, lampM, { collide: false }); } }
  // guardrails at the shoulder's edge (open where the ramps leave) and the noise walls behind them (open beside the ramps and at the blown gap)
  for (const sx of [-1, 1]) { for (const [a, b] of sx > 0 ? [[60, GI.ramp + 46], [GI.ramp - 14, GI.gapZ + 16], [GI.gapZ - 16, GI.bank]] : [[60, GI.ramp + 46], [GI.ramp - 14, GI.bank]]) giRail(sx * GI.rail, a, sx * GI.rail, b); }
  const wallLo = mat('noisewall', { color: 0x6a7a70, rough: 0.6, metal: 0.2 }), wallHi = mat('noiseclear', { color: 0x9db4bc, rough: 0.1, metal: 0.1, transparent: true, opacity: 0.32 });
  for (const sx of [-1, 1]) for (let z = 40; z > GI.bank; z -= 22) { const c = z - 11; if (c < GI.ramp + 60 && c > GI.nb - 16) continue; if (sx > 0 && Math.abs(c - GI.gapZ) < 18) continue;
    addBox(sx * GI.wall, 0, c, 0.4, 4.6, 22.2, wallLo, { tile: 2, cast: false });
    addBox(sx * (GI.wall + 0.01), 1.7, c, 0.12, 2.9, 22.0, wallHi, { collide: false, cast: false }); // the clear upper panels (the lower box is the collider for the whole height)
    for (let k = -2; k <= 2; k++) addBox(sx * (GI.wall - 0.1), 0, c + k * 4.4, 0.22, 4.8, 0.22, MT.metal(), { collide: false }); } // H-section posts
  // the blown gap: rubble and torn panels where the BMP comes through from the side street
  for (let i = 0; i < 4; i++) rubble(GI.wall + rand(-0.5, 3), GI.gapZ + pick([-1, 1]) * rand(12, 17), rand(0.6, 1.0)); // heaped to either side: the way through stays clear
  for (let i = 0; i < 3; i++) addMesh(boxGeo(0.4, rand(1, 2.4), rand(3, 6), 2), wallLo, GI.wall + rand(1, 4), 0.4, GI.gapZ + pick([-1, 1]) * rand(13, 17), { rot: [rand(-0.3, 0.3), rand(-1, 1), rand(1.1, 1.5)] });
  for (const z of [-150, -380, -820, -1300]) overpass(z);
  overpass(GI.nb, { gaps: true }); // the 남부순환로, which the 신월IC ramps climb up to
  // the 신월IC ramps on their embankments: exit on the right, the opposite carriageway's entry on the left
  for (const sx of [-1, 1]) { roadRibbon((z) => sx * giRampX(z), () => 8, GI.nb + 6, GI.ramp + 46, { lift: 0.07 });
    const pts = []; for (let z = GI.ramp + 30; z >= GI.nb + 6; z -= 8) pts.push(z);
    for (let i = 0; i < pts.length - 1; i++) { giRail(sx * (giRampX(pts[i]) + 4.4), pts[i], sx * (giRampX(pts[i + 1]) + 4.4), pts[i + 1]); if (pts[i] < GI.ramp - 10) giRail(sx * (giRampX(pts[i]) - 4.4), pts[i], sx * (giRampX(pts[i + 1]) - 4.4), pts[i + 1]); } }
  // collapsed overpass: the left half dropped onto the road, a gap stays open on the right lane; rebar hangs out of the broken edges
  overpass(GI.collapse, { broken: true });
  addBox(-8, 3.2, GI.collapse, 26, 1.2, 12, MT.concreteD(), { tile: 3, rotY: 0.08 }); addMesh(boxGeo(30, 1.2, 12, 3), MT.concreteD(), -30, 4.6, GI.collapse, { rot: [0, 0, 0.3] }); addMesh(boxGeo(30, 1.2, 12, 3), MT.concreteD(), 34, 6.2, GI.collapse, { rot: [0, 0, -0.06] });
  { const rb = new THREE.CylinderGeometry(0.025, 0.025, 1, 4); for (const [ex, ey] of [[19, 6.6], [5, 4.0], [-45, 2.6]]) for (let i = 0; i < 26; i++) { const L = rand(0.8, 2.6), m = addMesh(rb, MT.rust(), ex + rand(-0.6, 0.6) * Math.sign(ex || 1), ey + rand(-0.4, 0.6), GI.collapse + rand(-5.6, 5.6), { rot: [rand(-0.5, 0.5), 0, Math.PI / 2 + rand(-0.6, 0.6)] }); m.scale.y = L; } }
  for (let i = 0; i < 6; i++) rubble(rand(-14, 2), GI.collapse + rand(-8, 8), rand(1, 1.6));
  // the enemy line at the 신월IC ramps: jersey barriers across the carriageways, a burnt car slewed across each shoulder; the two lanes the armour needs stay open
  for (const [a, b] of [[-17, -11.8], [-4.2, -0.5], [0.5, 4.2], [11.8, 17]]) jersey((a + b) / 2, GI.ramp + 2, b - a, 0);
  carProp(-14.4, GI.ramp + 6, Math.PI / 2 + 0.2, 0x4a5560, true, true); carProp(14.4, GI.ramp + 7, Math.PI / 2 - 0.15, 0x777777, true);
  // signs along the way (after the time skip we are past 부천IC, closing on 신월IC)
  hwSign(0, '신월 IC 13km', '부평 · 부천 · 서울'); hwSign(-480, '신월 IC 2km', '남부순환로 · 김포공항'); hwSign(-780, '신월 IC 1km', '남부순환로 · 김포공항');
  hwSign(GI.ramp + 52, '신월 IC 출구', '남부순환로 ↗'); hwSign(-1240, '서울 →', '국회대로 · 여의도 · 목동');
  // burnt wrecks on the shoulders only (the lanes stay drivable), and the cover the enemy uses: pairs ahead of each roadside ambush, two trucks past the collapse
  for (let i = 0; i < 46; i++) { const z = rand(GI.bank + 30, 20), x = pick([-1, 1]) * rand(13.4, 16.0); if (Math.abs(z - GI.ramp) < 30 || (z > GI.collapse - 16 && z < GI.collapse + 70) || (x > 0 && Math.abs(z - GI.gapZ) < 20)) continue; Math.random() < 0.7 ? carProp(x, z, rand(-0.25, 0.25) + (Math.random() < 0.5 ? 0 : Math.PI), pick([0x4a5560, 0x6a2a2a, 0x2a3a5a, 0x777777]), true, Math.random() < 0.25) : truckProp(Math.sign(x) * 15.4, z, rand(-0.1, 0.1), 0x4d4a40, true); }
  for (const [x, z] of [[14, -235], [-14, -300], [-14, -455], [14, -515]]) { carProp(Math.sign(x) * 14.2, z + 6, 0.35 * Math.sign(x), 0x4a5560, true); carProp(Math.sign(x) * 16.2, z + 9.5, -0.2, 0x6a2a2a, true, true); }
  for (const [x, z] of [[-15.8, -712], [-15.6, -716.5], [15.8, -724], [15.6, -728.5]]) carProp(x, z, rand(-0.12, 0.12), pick([0x4a5560, 0x777777]), true);
  for (let i = 0; i < 6; i++) { const x = pick([-1, 1]) * rand(30, 44), z = rand(GI.bank + 60, -100); if (giSiteFree(x, z, 8, 8)) tankWreck(x, z, rand(0, 3), Math.random() < 0.5); }
  // the outskirts: 부천's factory belt early, apartment blocks closing in towards Seoul
  for (let z = 20; z > GI.apt0; z -= rand(40, 70)) for (const sx of [-1, 1]) if (Math.random() < 0.7) { const x = sx * rand(48, 90), w = rand(20, 40), d = rand(16, 30); if (!giSiteFree(x, z, w, d)) continue;
    if (Math.random() < 0.45) giFactory(x, z, w, d); else building(x, z, w, d, rand(6, 14), { hue: pick([30, 40, 200]), lit: 0.02, broken: 0.4, fire: Math.random() < 0.25 ? 1 : 0 }); }
  for (let z = GI.apt0; z > GI.bank + 40; z -= rand(34, 46)) for (const sx of [-1, 1]) { const x = sx * rand(54, 57); if (giSiteFree(x, z, 40, 14)) building(x, z, 40, 14, rand(36, 58), { hue: pick([200, 210, 40]), lit: 0.04, broken: 0.5, fire: Math.random() < 0.35 ? 2 : 0 }); const x2 = sx * rand(30, 34); if (Math.random() < 0.6 && giSiteFree(x2, z + 12, 12, 10)) building(x2, z + 12, 12, 10, rand(6, 10), { hue: 30, lit: 0.05, broken: 0.6, fire: Math.random() < 0.3 ? 1 : 0 }); }
  // the apartment blocks the snipers hold, built with the world (not when the fight starts)
  for (const [x, z, h] of GI.snipers) { building(x * 53, z, 40, 12, h + 9, { hue: 210, lit: 0.04, broken: 0.6 }); addBox(x * 32, h - 0.3, z, 2.2, 0.3, 3.4, MT.concreteD()); addBox(x * 30.95, h, z, 0.15, 1.0, 3.4, MT.metal(), { bullet: false }); }
  buildGukhoe();
  giTrees();
}
/* 신월IC's planting: clumps of pine and bare March broadleaves on the embankments round the ramps, and where the expressway
   runs out into 국회대로. Nothing goes on a carriageway, a ramp, the blown gap, or within 2 m of anything solid (walls, wrecks, buildings) */
function giTrees() {
  const placed = [], ramps2 = [-1, 1].map((sd) => { const c = v3(sd * 24, 0, GI.bank - 40), d = v3(Math.sin(sd * 0.35), 0, Math.cos(sd * 0.35)); return [c, d]; });
  const ok = (x, z) => { const ax = Math.abs(x);
    if (z > GI.bank + 30 && ax < 20) return false; // the expressway and its noise walls
    if (z <= GI.bank + 30 && giRoadDist(x, z) < 19) return false; // 국회대로 and its pavement edge
    if (giOnRamp(z) && Math.abs(ax - giRampX(z)) < 6.5) return false; // the 신월IC ramps
    for (const [c, d] of ramps2) { const rx = x - c.x, rz = z - c.z, t = clamp(rx * d.x + rz * d.z, -45, 45); if (Math.hypot(rx - d.x * t, rz - d.z * t) < 7) return false; } // the end-of-expressway ramps
    if (x > 0 && Math.abs(z - GI.gapZ) < 26) return false; // the side street the BMP comes down
    if (placed.some(([px, pz]) => Math.hypot(px - x, pz - z) < 3.6)) return false;
    const gy = G.groundAt(x, z); for (const c of G.colliders) if (x > c.min.x - 2 && x < c.max.x + 2 && z > c.min.z - 2 && z < c.max.z + 2 && c.max.y > gy + 0.5 && c.min.y < gy + 6) return false;
    return true; };
  const zones = [[20, 60, GI.ramp + 90, GI.nb - 50, 55], [20, 33, GI.nb - 50, GI.bank + 30, 34], [20, 35, GI.bank + 30, GI.bank - 200, 30]]; // [|x| from, to, z from, to, clumps per side]
  for (const [xa, xb, za, zb, n] of zones) for (const sd of [-1, 1]) for (let k = 0; k < n; k++) {
    const cx = sd * rand(xa, xb), cz = rand(zb, za), pineClump = Math.random() < 0.4;
    for (let i = 0, m = randi(5, 10); i < m; i++) { const x = cx + rand(-7, 7), z = cz + rand(-8, 8); if (Math.abs(x) < xa || Math.abs(x) > xb + 4 || !ok(x, z)) continue; placed.push([x, z]);
      if (pineClump || Math.random() < 0.15) pine(x, z, rand(1.2, 1.8), false); else bareTree(x, z, rand(1.2, 1.7)); } // tall enough to show over the noise walls
    for (let i = 0; i < 4; i++) { const x = cx + rand(-7, 7), z = cz + rand(-8, 8); if (Math.abs(x) > xa && ok(x, z)) shrub(x, z, rand(0.7, 1.2), false); } }
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
  // the road does not just stop: the last leg runs on to a T with the riverside road (여의서로), which carries on along the 한강 both ways
  { const [ax, az] = R[R.length - 2], [bx, bz] = R[R.length - 1], l = Math.hypot(bx - ax, bz - az), fx = (bx - ax) / l, fz = (bz - az) / l, rot = Math.atan2(fx, fz), ext = Math.abs((GI.rv - bx) / fx) - 8;
    for (const sd of [-1, 1]) roadStrip(bx + fx * ext / 2 - fz * sd * 8, bz + fz * ext / 2 + fx * sd * 8, 14, ext + 8, rot);
    addBox(bx + fx * (ext / 2 - 4), 0, bz + fz * (ext / 2 - 4), 0.7, 0.9, ext - 14, MT.concrete(), { tile: 3, rotY: rot, collide: false });
    for (const sd of [-1, 1]) roadStrip(GI.rv + sd * 4.6, (GI.rv0 + GI.rv1) / 2, 9, GI.rv0 - GI.rv1, 0, 0.03); // a touch higher than the leg's end, so the two never flicker where they meet
    addBox(GI.rv - 9.7, 0, (GI.rv0 + GI.rv1) / 2, 0.3, 0.9, GI.rv0 - GI.rv1, MT.metal(), { collide: false }); // rail on the river kerb
    for (let z = GI.rv0 - 20; z > GI.rv1; z -= 36) addBox(GI.rv + 10.5, 0, z, 0.25, 9, 0.25, MT.metal(), { collide: false }); // lamps on the city side
    signBoard(bx + fx * (ext - 14) + fz * 19, 5.4, bz + fz * (ext - 14) - fx * 19, '여의서로', { w: 6, bg: '#1e6a3c', sub: '← 마포대교 · 국회의사당 →', ry: rot + Math.PI }); }
  // 신월IC: the ramps peel off left and right where the expressway ends
  for (const sd of [-1, 1]) { roadStrip(sd * 24, GI.bank - 40, 8, 90, sd * 0.35); }
  hwSign(GI.bank + 30, '신월 IC', '국회대로 · 여의도 →'); hwSign(GI.bank - 160, '국회대로', '목동 · 여의도 6km');
  // street furniture along the boulevard: lamps, wrecks (on the pavement edge, never in the lanes), cover for each ambush
  const L = giLen();
  for (let d = 20; d < L - 10; d += 34) for (const sd of [-1, 1]) { const p = giAt(d, sd * 16.5); addBox(p.x, 0, p.z, 0.25, 9, 0.25, MT.metal(), { collide: false }); }
  for (let i = 0; i < 40; i++) { const d = rand(30, L - 40), p = giAt(d, pick([-1, 1]) * rand(15.5, 18)); carProp(p.x, p.z, rand(0, 6.28), pick([0x4a5560, 0x6a2a2a, 0x2a3a5a, 0x777777]), true, Math.random() < 0.2); }
  for (const [d, sd] of GI.amb5) { const a = giAt(d - 5, sd * 16.4), b = giAt(d - 8.5, sd * 18.6), q = giAt(d - 4, sd * 16.4), ry = Math.atan2(q.x - a.x, q.z - a.z); carProp(a.x, a.z, ry + 0.3 * sd, 0x4a5560, true); carProp(b.x, b.z, ry - 0.2 * sd, 0x6a2a2a, true, true); }
  for (let i = 0; i < 4; i++) { const p = giAt(rand(80, L - 200), pick([-1, 1]) * rand(30, 45)); tankWreck(p.x, p.z, rand(0, 3), Math.random() < 0.5); }
  // blocks either side: 목동's apartment towers, then 영등포's low streets, then 여의도's offices
  const E = giAt(giLen()), to63 = (x, z) => { const vx = 70 - E.x, vz = -2960 - E.z, t = clamp(((x - E.x) * vx + (z - E.z) * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(x - E.x - vx * t, z - E.z - vz * t); };
  const free = (x, z, r) => Math.abs(x - GI.rv) > 16 + r && Math.hypot(x - GI.x63, z - GI.z63) > 80 + r && !(x < E.x + 60 && Math.abs(z - E.z) < 110 + r) && to63(x, z) > 30 + r && giRoadDist(x, z) > 24 + r && !(Math.abs(x - GI.sx) < 22 + r && z < GI.sz0 + 22 + r) && !(Math.abs(z - GI.sz0) < 22 + r && x < GI.sx + 22 + r && x > GI.han - 10) && x > GI.han + 30 + r;
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
  hg63('charred', { x: GI.x63, z: GI.z63, yaw: -2.29, metal: 0.2 }); // 63빌딩: the same model as the 한강대로 missions, a month after the fires (its broad gold face turned to us)
  for (let i = 0; i < 70; i++) { const x = rand(-1000, -800), z = rand(-2200, -3300); building(x, z, rand(20, 40), rand(20, 40), rand(40, 140), { hue: 210, lit: 0.06, broken: 0.3, fire: Math.random() < 0.4 ? 2 : 0 }); }
  for (let i = 0; i < 14; i++) addEmitter(v3(rand(-1000, -800), rand(30, 90), rand(-2300, -3200)), 'smoke', 4, 1.5); for (let i = 0; i < 10; i++) addEmitter(v3(rand(-990, -810), rand(2, 30), rand(-2400, -3100)), 'fire', 3, 18);
}

/* ---------------- arrivals, boarding, dismounting: nothing pops in, nobody teleports ---------------- */
/* headlamps and a dust trail on a vehicle coming up out of the haze */
function giArrivalFX(v) {
  const r = v.m.root, sc = r.scale.x || 1, hx = v.size[0] / sc * 0.62, fz = -v.size[2] / sc - 0.03, hy = v.size[1] / sc * 0.85, lm = basicMat('gihead', 0xfff0c0);
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.06), lm); l.position.set(s * hx, hy, fz); r.add(l); }
  G.updaters.push(() => { if (!v.alive || !v.m.root.parent) return true; if ((v.cs || 0) > 2.5 && Math.random() < 0.5) FX.dust(v.pos.clone().add(v3(Math.sin(v.yaw) * v.size[2] + rand(-1, 1), 0.4, Math.cos(v.yaw) * v.size[2] + rand(-1, 1))), 2, [0.56, 0.52, 0.46], 1.1); });
}
/* the RPG and SAM stowed in the back of a K808 (same as S.allyBMP's), for a vehicle that was built without them */
function giKit(S, v, sam = true) {
  const rear = () => v.pos.clone().add(v3(Math.sin(v.yaw) * 6.0, 1.1, Math.cos(v.yaw) * 6.0)), side = () => rear().add(v3(Math.cos(v.yaw) * 1.2, 0, -Math.sin(v.yaw) * 1.2));
  const rp = S.station(side(), 'RPG 꺼내기', () => { giveWeapon('rpg', true); P.ammo.rpg.res = Math.max(P.ammo.rpg.res, 3); }, 2.2);
  const sa = sam ? S.station(rear(), '대공미사일 꺼내기', () => { giveWeapon('sam', true); P.ammo.sam.res = Math.max(P.ammo.sam.res, 2); P.ammo.sam.mag = 1; }, 2.2) : null;
  S.every(0.3, () => { rp.pos.copy(side()); if (sa) sa.pos.copy(rear()); if (!v.alive) { rp.disabled = true; if (sa) sa.disabled = true; return true; } });
}
const giRear = (v, back = 1.6) => v.pos.clone().add(v3(Math.sin(v.yaw) * (v.size[2] + back), 0, Math.cos(v.yaw) * (v.size[2] + back)));
/* climb in at the rear hatch: walk up to it, the view rises to the cupola, the hatch clangs shut, the engine note picks up */
async function giBoard(S, v, off, label = '탑승 — K808 후방 해치로') {
  S.obj(label, giRear(v)); const mk = S.every(0.15, () => { G.objPos = giRear(v).add(v3(0, 1.2, 0)); });
  await S.until(() => { const p = giRear(v); return Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < 2.6; });
  S.stop(mk); G.objPos = null;
  await S.cut(async () => {
    v.m.root.updateMatrixWorld(); const seat = v3(off[0], off[1], off[2]).applyMatrix4(v.m.root.matrixWorld), fwd = v3(-Math.sin(v.yaw), 0, -Math.cos(v.yaw));
    const mid = giRear(v, 0.4).add(v3(0, 1.9, 0));
    await S.cam(mid, mid.clone().addScaledVector(fwd, 10), 0.6); SFX.metal(mid);
    await S.cam(seat.clone().add(v3(0, 1.62, 0)), seat.clone().add(v3(0, 1.4, 0)).addScaledVector(fwd, 14), 0.9);
    SFX.impact(seat); SFX.metal(seat); G.shake += 0.3;
  });
  P.ride = { obj: v.m.root, off }; P.yaw = v.yaw; P.pitch = -0.05; P.noFire = false;
}
/* climb out of the back: the view drops from the cupola to the road behind the hull */
async function giDismount(S, v) {
  const out = giRear(v, 1.2); out.y = G.groundAt(out.x, out.z);
  await S.cut(async () => { const back = v3(Math.sin(v.yaw), 0, Math.cos(v.yaw)); SFX.metal(out); await S.cam(out.clone().add(v3(0, 1.62, 0)), out.clone().add(v3(0, 1.5, 0)).addScaledVector(back, -12), 0.9); });
  P.ride = null; setPlayer(out.x, out.z, v.yaw); P.vel.set(0, 0, 0);
}
/* soldiers climbing into the back of a vehicle: walk to the hatch, then they are inside */
function giEmbark(S, a, v) { if (!a || !a.alive) return; S.route(a, [[giRear(v).x, giRear(v).z, { run: true }]]).then(() => { if (a.alive) { SFX.metal(a.pos); a.remove(); } }); S.later(14, () => { if (a.alive && hiddenFromView(a.pos)) a.remove(); }); }
/* the 신월IC line: dug-in tanks on the ramps, MG nests behind the jersey barriers, riflemen. Put in place well before anyone can see it */
function giDefenders() {
  if (G.m10aDef && G.m10aDef.tok === G.token) return G.m10aDef;
  const tanks = [-1, 1].map((sx) => { const z = GI.ramp - 85, x = sx * giRampX(z); sandbagRing(x, z + 5, 4.2, -Math.PI / 2); return new Vehicle('tank', x, z, { yaw: Math.PI, path: [[x, z + 1.5]], speed: 1, reload: 6, hp: 600, invuln: true }); });
  const nests = [[-14.6, GI.ramp - 6, 2.0], [-2.3, GI.ramp - 9, 1.7], [14.6, GI.ramp - 6, 2.0]];
  const nestMen = nests.map(([x, z, r]) => { sandbagRing(x, z, r, -Math.PI / 2); return [0, 1].map((k) => enemy(x - 0.6 + k * 1.2, z, { tag: 'ramp', kind: k ? 'heavy' : 'rifle', hold: true, view: 150, hp: 260 })); }).flat();
  for (let i = 0; i < 14; i++) { const x = pick([rand(-15.5, -12.5), rand(-9.5, -6.5), rand(6.5, 9.5), rand(12.5, 15.5)]); enemy(x, GI.ramp - rand(6, 40), { tag: 'ramp', view: 110, crouch: Math.random() < 0.5 }); }
  return (G.m10aDef = { tok: G.token, tanks, nests, nestMen });
}
/* the 신월IC apartments: riflemen along the carriageways and the window snipers, in place before the line at the ramps falls */
function giAptDefenders() {
  if (G.m10aApt === G.token) return; G.m10aApt = G.token;
  for (let i = 0; i < 26; i++) enemy(pick([-1, 1]) * rand(3, 15), rand(GI.bank + 60, GI.apt0 + 10), { tag: 'apt', view: 100, crouch: Math.random() < 0.5, kind: Math.random() < 0.2 ? 'heavy' : 'rifle' });
  for (const [x, z, h] of GI.snipers) { const a = enemy(x * 31.8, z, { tag: 'snip', hold: true, view: 220, acc: 1.4, y: h, yaw: x < 0 ? -Math.PI / 2 : Math.PI / 2 }); a.marked = true; }
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
    buildGyeongin(); G.m10aCol = null; G.m10aPush = null; G.vehWalls = true; // no hull ever ends up inside a noise wall, pier or building here
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
        doomed.invuln = false; G.m10aCol = col;
        await S.say('박도현 중위', '인천에서 서울까지 30킬로미터다. 오늘 안에 끝을 본다. 전원 탑승!', { dur: 3.2 });
        // the squad climbs in: 박도현 and 윤하린 with us, 리선우 and 한지운 into the K808 across the road
        giEmbark(S, S.sq.park, mine); giEmbark(S, S.sq.yoon, mine); giEmbark(S, S.sq.lee, col[7]); giEmbark(S, S.sq.han, col[7]);
        S.sayBg('한지운 하사', '서한준, 해치 기관총 잡아라. 매복은 고가 위랑 갓길이다.', { dur: 3 });
        await giBoard(S, mine, [0.45, 2.05, 1.0]);
        for (const k of ['park', 'lee', 'yoon', 'han']) { const a = S.sq[k]; if (a && a.alive && hiddenFromView(a.pos)) a.remove(); }
        S.give('k21mg'); giveWeapon('sam', false); P.ammo.sam.res = 2;
        // the column rolls out of 서인천IC; the long drive east is skipped
        for (const v of col) { v.path = [v3(v.pos.x, 0, GI.collapse + 42 + (v.pos.z - 10) * 0.6)]; v.pi = 0; v.speed = 5; }
        S.obj('경인고속도로 · 서울 방향 출발');
        await S.wait(7);
        await S.fade(1, 1.2); for (const v of col) v.stopped = true;
        for (const k of ['park', 'lee', 'yoon', 'han']) { const a = S.sq[k]; if (a && a.alive) a.remove(); }
        await S.black(['40분 후', '경인고속도로 · 부천 통과, 신월IC 3km 전'], 3.4);
        for (const v of col) { v.stopped = false; v.speed = 9; }
        S.fade(0, 1.2);
        await S.radio('박도현 중위', '신월IC 3킬로미터 전. 여기서부턴 놈들 구역이다. 눈 똑바로 떠라!', { dur: 3 });
        S.obj('경인고속도로 돌파 — 매복을 제압하라');
        S.hint('K808 해치 기관총 · 매복조를 하나라도 쓰러뜨리면 후속 차량이 처리해요 · <kbd>2</kbd> 대공미사일', 7);
        G.hitMul = 0.6; const regen = S.every(0.5, () => { if (P.alive && P.hp < 100 && G.time - P.lastHit > 2.5) P.hp = Math.min(100, P.hp + 5); });
        const amb = ambushRun(S, mine, [
          { x: -10, z: -150, y: 7.8, n: 5, w: 10 }, { x: 14.6, z: -235, n: 4, w: 1.4 }, { x: -14.6, z: -300, n: 5, w: 1.4 },
          { x: 8, z: -380, y: 7.8, n: 6, w: 10 }, { x: -14.6, z: -455, n: 4, w: 1.4 }, { x: 14.6, z: -515, n: 5, w: 1.4 },
        ]);
        S.later(14, () => S.radio('사령부', '고성 상륙부대, 춘천 통과. 동부 축선 순조롭다.', { dur: 3 }));
        S.later(26, () => S.threat('heli', { x: 260, z: -500, path: [[60, 40, -260], [-30, 34, -120], [-60, 40, -300], [40, 38, -420]], line: '공격 헬기! 대공미사일로 잡으십시오!' }));
        S.later(40, () => { if (!doomed.alive) return; const from = doomed.pos.clone().add(v3(-40, 8, -80)); new Proj('missile', from, v3().subVectors(doomed.pos.clone().add(v3(0, 2, 0)), from).normalize().multiplyScalar(80), { team: 'enemy' }); S.later(1.2, () => { if (doomed.alive) { doomed.die(); const x0 = doomed.pos.x, y0 = doomed.yaw, z0 = doomed.pos.z, v0 = doomed.cs || 6; S.tween(1.6, (k) => { doomed.pos.x = lerp(x0, 14.6, k); doomed.pos.z = z0 - v0 * 1.6 * (k - k * k / 2); doomed.yaw = y0 - 0.3 * k; doomed.m.root.position.copy(doomed.pos); doomed.m.root.rotation.y = doomed.yaw; doomed.syncCol(); }, (t) => 1 - (1 - t) * (1 - t)); } /* the driver loses it: the burning hull slews onto the shoulder and stops, clear of the lane */ S.radio('윤하린 중사', '4호차 피격! 대전차미사일입니다!', { dur: 2.4 }); }); });
        await S.until(() => mine.pi >= mine.path.length || mine.pos.z < GI.collapse + 60);
        S.stop(amb); S.stop(regen); G.hitMul = 1;
        await S.until(() => (mine.cs || 0) < 0.4);
        await S.radio('박도현 중위', '고가도로가 무너졌다! 전원 하차! 도보로 간다!', { dur: 2.6 });
        S.take('k21mg'); await giDismount(S, mine);
        for (const a of aliveEnemies()) if (a.tag.startsWith('amb') && hiddenFromView(a.pos)) a.remove();
      },
    },
    /* 2. 무너진 고가도로 → 신월IC 램프 앞까지 도보 진격 */
    {
      setup(S) { S.player(-4, GI.collapse + 40, 0); },
      async run(S) {
        // everyone comes out of the back of the vehicles they rode in (a restart from here starts with them already out)
        const col = (G.m10aCol || []).filter((v) => v.alive), byIdx = (i) => G.m10aCol && G.m10aCol[i] && G.m10aCol[i].alive ? G.m10aCol[i] : null;
        const mine = byIdx(1), other = byIdx(7), at = (v, dx, dz) => v ? giRear(v).add(v3(dx, 0, 0)) : v3(dx, 0, GI.collapse + 46 + dz);
        { const p = at(mine, -0.8, 0), q = at(mine, 0.8, 2), r = at(other, -0.8, 1), s = at(other, 0.8, 3);
          squad(S, [{ key: 'park', name: '박도현 중위', x: p.x, z: p.z }, { key: 'yoon', name: '윤하린 중사', x: q.x, z: q.z }, { key: 'lee', name: '리선우 병장', x: r.x, z: r.z }, { key: 'han', name: '한지운 하사', x: s.x, z: s.z }]); }
        const ifv = col.filter((v) => v.type === 'bmp'), inf = [];
        for (let i = 0; i < 12; i++) { const v = ifv.length ? ifv[i % ifv.length] : null, p = v ? giRear(v, 1.2 + (i / ifv.length | 0) * 0.9).add(v3(rand(-0.8, 0.8), 0, 0)) : v3(rand(-12, 12), 0, GI.collapse + 50 + i * 1.5);
          S.later(v ? 0.35 * i : 0, () => { const a = ally(p.x, p.z, { hp: 150 }); a.follow = { leader: S.sq.park, back: 7 + (i >> 1) * 2, side: i % 2 ? 4 : -4 }; inf.push(a); if (v) SFX.metal(p); }); }
        giDefenders(); // the line at the ramps is manned long before we get there
        // the column's armour pushes on with us through the gap the collapse left on the right
        const push = S.armorPush([
          { type: 'tank', v: byIdx(3), x: 10, z: GI.collapse + 70, path: [[9, GI.collapse + 20], [8.5, GI.collapse - 10], [8.5, GI.collapse - 40], [8.5, GI.ramp + 80], [8, GI.ramp + 40]], speed: 4.5 },
          { type: 'k21', v: byIdx(2), x: 10, z: GI.collapse + 90, path: [[9, GI.collapse + 26], [8.5, GI.collapse - 20], [8.5, GI.ramp + 60]], speed: 4.5 },
          { type: 'k21', v: byIdx(7), x: 10, z: GI.collapse + 110, path: [[9, GI.collapse + 32], [8.5, GI.collapse - 30], [8.5, GI.xo0 + 5], [-7, GI.xo1 - 3], [-8, GI.ramp + 45]], speed: 4.5, rpg: true }, // across through the crossover
        ], { lead: 18 });
        if (byIdx(7)) giKit(S, byIdx(7), false);
        G.m10aPush = push;
        const pr = S.pressure({ from: [[-22, -826], [22, -826], [-15, -720], [15, -732], [-14, GI.ramp - 20], [14, GI.ramp - 20]], ahead: 30, to: () => [rand(-14, 14), Math.min(P.pos.z - rand(30, 60), GI.ramp + 30)], tag: 'gi', max: 14, every: 1.0, heavy: 0.2 });
        S.later(4, () => S.radio('사령부', '고성 상륙부대, 남양주 진입! 서울 동쪽 퇴로를 막았다!', { dur: 3.2 }));
        S.later(20, () => S.threat('bmp', { x: -8, z: GI.ramp - 60, path: [[-8, GI.ramp + 10], [-13.2, GI.ramp + 40]], line: '적 BMP! 신월IC 램프 쪽에서 나옵니다!' }));
        await S.lead('park', [
          [10, GI.collapse + 8, { run: true, say: ['박도현 중위', '오른쪽 차선으로! 장갑차 뒤에 붙어라!'], bg: true }],
          [10, GI.collapse - 40, { run: true }], [8, GI.collapse - 110, { fight: 'gi', leave: 10, fightMax: 15 }],
          [6, GI.collapse - 190, { run: true }], [4, GI.ramp + 60, { fight: 'gi', leave: 8 }],
        ], { follow: ['lee', 'yoon', 'han'], label: '박도현 중위를 따라 신월IC 램프로', call: '서한준! 빨리 붙어라!' });
        pr.stop();
      },
    },
    /* 3. 신월IC 램프 저지선 — 공습으로 돌파 */
    {
      setup(S) { S.player(4, GI.ramp + 56, 0); },
      async run(S) {
        squad(S, [{ key: 'park', name: '박도현 중위', x: 0, z: GI.ramp + 60 }, { key: 'lee', name: '리선우 병장', x: -3, z: GI.ramp + 62 }, { key: 'yoon', name: '윤하린 중사', x: 3, z: GI.ramp + 62 }, { key: 'han', name: '한지운 하사', x: 6, z: GI.ramp + 63 }]);
        G.armorHold = true; G.strikeMode = 'air'; S.give('desig');
        const D = giDefenders(), tanks = D.tanks, nests = D.nests, nestMen = D.nestMen; for (const v of tanks) v.invuln = false;
        giAptDefenders(); // the apartments past the IC fill up now, out of sight 200 m on
        const pr = S.pressure({ from: [[-22, GI.nb - 8], [22, GI.nb - 8], [-41, GI.ramp - 140], [41, GI.ramp - 140], [-12, GI.nb + 30], [12, GI.nb + 30]], ahead: 25, to: () => [rand(-15, 15), GI.ramp - rand(5, 30)], tag: 'ramp', max: 16, every: 1.1, heavy: 0.25 });
        await S.say('박도현 중위', '램프 위에 전차 둘이 묻혀 있다! 서한준, 표적지시기! 공군 불러라!', { dur: 3 });
        S.hint('<kbd>4</kbd> 표적지시기 · 조준 후 <kbd>좌클릭</kbd> 공습 요청', 6);
        S.obj('표적지시기로 램프 위 전차 공습 (0/2)');
        const mk = S.every(0.25, () => { const t = tanks.find((v) => v.alive); G.objPos = t ? t.pos.clone().add(v3(0, 3, 0)) : null; S.obj(`표적지시기로 램프 위 전차 공습 (${tanks.filter((v) => !v.alive).length}/2)`); });
        await S.until(() => tanks.every((v) => !v.alive));
        S.stop(mk);
        S.radio('항공 통제', '램프 진지 일대, 한 번 더 쓸어준다. 머리 숙여라.', { dur: 2.6 });
        jetPass([-600, 90, GI.ramp - 10], [600, 100, GI.ramp - 10], { speed: 280, bombs: nests.map(([x, z]) => [x, z]), noPlayer: true, src: PT, dmg: 600 });
        await S.wait(3.5);
        for (const a of nestMen) if (a.alive) a.hurt(9999, PT);
        await S.say('박도현 중위', '전차 날아갔다! 저지선 돌파! 전원 돌격!', { dur: 2.4 });
        G.armorHold = false;
        await S.lead('park', [[8, GI.ramp + 20, { run: true }], [8, GI.ramp + 6, { fight: 'ramp', leave: 8, crouch: true, fightMax: 12 }], [8, GI.ramp - 12, { run: true }], [5, GI.ramp - 40, { run: true }]], { follow: ['lee', 'yoon', 'han'], label: '신월IC 저지선 돌파', call: '서한준! 돌격이다!' });
        pr.stop();
        { const t0 = G.time; await S.until(() => aliveEnemies('ramp').length <= 4 || G.time - t0 > 12); for (const a of aliveEnemies('ramp')) if (hiddenFromView(a.pos)) a.remove(); }
        G.strikeMode = null;
      },
    },
    /* 4. 신월IC — 아파트 시가전 */
    {
      setup(S) { S.player(0, GI.ramp - 50, 0); },
      async run(S) {
        squad(S, [{ key: 'park', name: '박도현 중위', x: 2, z: GI.ramp - 54 }, { key: 'lee', name: '리선우 병장', x: -2, z: GI.ramp - 52 }, { key: 'yoon', name: '윤하린 중사', x: 4, z: GI.ramp - 51 }, { key: 'han', name: '한지운 하사', x: 0, z: GI.ramp - 49 }]);
        // the same armour drives on through the gaps in the barrier line (a restart brings it up from behind us, out of sight)
        const pv = (G.m10aPush || []).filter((v) => v.alive), pick3 = (i) => pv[i] || null;
        const push = S.armorPush([
          { type: 'tank', v: pick3(0), x: 8, z: GI.ramp + 60, path: [[8, GI.ramp + 20], [8, GI.ramp - 20], [8, GI.apt0 - 100], [8, GI.bank + 60]], speed: 5 }, // each stays on its own carriageway: nobody drives over the median
          { type: 'k21', v: pick3(1), x: 8, z: GI.ramp + 80, path: [[9, GI.ramp + 30], [8, GI.ramp - 20], [8, GI.apt0 - 120], [8, GI.bank + 80]], speed: 5, rpg: true, sam: true },
          { type: 'k21', v: pick3(2), x: -8, z: GI.ramp + 84, path: [[-8, GI.ramp + 24], [-8, GI.ramp - 30], [-8, GI.apt0 - 80], [-8, GI.bank + 70]], speed: 5 },
        ], { lead: 18 });
        G.m10aPush = push;
        giAptDefenders();
        const pr = S.pressure({ from: [[-12, GI.apt0 - 150], [12, GI.apt0 - 200], [-12, GI.apt0 - 300], [12, GI.apt0 - 340], [-22, -1304], [22, -1304]], ahead: 30, to: () => [rand(-14, 14), P.pos.z - rand(40, 80)], tag: 'apt', max: 14, every: 1.0, heavy: 0.2 });
        await S.say('윤하린 중사', '아파트 창문에 저격수! 높은 층입니다!', { dur: 2.4 });
        S.hint('<kbd>2</kbd> K-S01 저격총으로 창가 저격수를 노리세요', 5);
        S.later(8, () => S.radio('UN군 사령부', 'UN군 선두, 수원 통과. 서울 남쪽으로 북상 중이다.', { dur: 3 }));
        S.later(30, () => S.radio('해병 2연대', '김포공항 확보! 활주로 장악했다!', { dur: 3 }));
        S.later(22, () => S.threat('bmp', { x: 70, z: GI.gapZ, path: [[24, GI.gapZ], [14, GI.gapZ - 12]], line: '오른쪽 옆길! 적 BMP 매복입니다!' }));
        await S.lead('park', [
          [6, GI.apt0 - 20, { run: true, say: ['박도현 중위', '신월IC다! 속도 늦추지 마라!'], bg: true }],
          [8, GI.apt0 - 110, { fight: 'apt', leave: 10, crouch: true, fightMax: 15 }], [6, GI.apt0 - 220, { run: true }],
          [8, GI.apt0 - 290, { fight: 'apt', leave: 5, fightMax: 15 }], [4, GI.bank + 30, { run: true }], [2, GI.bank + 14, { run: true }],
        ], { follow: ['lee', 'yoon', 'han'], label: '박도현 중위를 따라 신월IC 돌파', call: '서한준! 뒤처지지 마라!' });
        pr.stop();
        for (const a of aliveEnemies()) if (hiddenFromView(a.pos)) a.remove(); else { a.hold = true; a.goTo = null; } // stragglers in sight stay where they are: nobody runs after the column
        await S.say('박도현 중위', '신월IC 확보! 고속도로는 여기까지다. 국회대로 타고 여의도까지 밀고 간다! 전원 탑승!', { dur: 3.4 });
      },
    },
    /* 5. 국회대로 → 목동 → 영등포 → 샛강 → 여의도 (차량 돌파) */
    {
      setup(S) { S.player(2, GI.bank + 14, 0); },
      async run(S) {
        P.bounds = null; G.armorFree = true;
        const L = giLen(), lane = (lat, z0) => { const pts = [v3(lat, 0, z0)]; for (let d = Math.max(10, GI.bank - z0 + 6); d < L; d += 12) pts.push(giAt(d, lat)); pts.push(giAt(L, lat)); return pts; };
        // the IC armour pulls forward to lead; the follow-on K808 element drives up the expressway behind us, lamps on, and pulls in
        const head = (G.m10aPush || []).filter((v) => v.alive);
        if (!head.length) { head.push(new Vehicle('tank', -8, GI.bank - 8, { team: 'ally', armed: true, invuln: true, speed: 0, reload: 5, range: 170, accurate: true, yieldPeople: false }), S.allyBMP(8, GI.bank - 24, 0, { k808: true, invuln: true, speed: 0, sam: false, rpg: false })); }
        { const n = {}; head.sort((a, b) => a.pos.z - b.pos.z).forEach((v) => { const lat = v.pos.x < 0 ? -8 : 8, j = n[lat] = (n[lat] ?? -1) + 1; v.path = [v3(lat, 0, GI.bank - 8 - j * 18)]; v.pi = 0; v.speed = 4.5; v.stopped = false; v.o.noDetour = false; }); }
        // the riflemen who came up the road with us step off onto the shoulders, out of the lanes
        for (const a of G.actors) if (a.alive && a.team === 'ally' && !Object.values(S.sq).includes(a)) S.route(a, [[Math.sign(a.pos.x || 1) * rand(14.2, 16.2), a.pos.z + rand(-2, 2)]]);
        const slots = [[-8, 30], [8, 22], [-8, 48], [8, 40]], arr = slots.map(([lat, dz], i) => { const v = S.allyBMP(lat, GI.bank + 250 + i * 22, 0, { k808: true, invuln: true, speed: 11, sam: false, rpg: false, path: [[lat, GI.bank + 90], [lat, GI.bank + dz]] }); v.o.yieldPeople = true; giArrivalFX(v); return v; });
        const mine = arr[0];
        S.radio('사령부', '후속 제대 신월IC 도착. 탑승 차량 접근 중.', { dur: 2.8 });
        S.obj('후속 K808 제대 대기');
        { const t0 = G.time; await S.until(() => arr.every((v) => v.pi >= v.path.length && (v.cs || 0) < 0.3) || G.time - t0 > 40); }
        for (const k of ['park', 'yoon']) giEmbark(S, S.sq[k], mine); for (const k of ['lee', 'han']) giEmbark(S, S.sq[k], arr[1]);
        await giBoard(S, mine, [0.45, 2.05, 1.0]); S.give('k21mg');
        for (const k of ['park', 'lee', 'yoon', 'han']) { const a = S.sq[k]; if (a && a.alive && hiddenFromView(a.pos)) a.remove(); }
        const col = [...head, ...arr].sort((a, b) => a.pos.z - b.pos.z);
        col.forEach((v, k) => { const lat = v.pos.x < 0 ? -8 : 8; v.path = lane(lat, v.pos.z - 6).filter((p, j, a) => j < a.length - k); v.pi = 0; v.speed = 9; v.o.noDetour = true; v.o.yieldPeople = false; v.stopped = false; });
        G.shake += 0.2;
        await S.radio('박도현 중위', '국회대로다! 목동 지나 영등포, 여의도까지 멈추지 않는다!', { dur: 3 });
        for (const k of ['park', 'lee', 'yoon', 'han']) { const a = S.sq[k]; if (a && a.alive) a.remove(); }
        S.obj('국회대로 돌파 — 여의도로');
        G.hitMul = 0.6; const regen = S.every(0.5, () => { if (P.alive && P.hp < 100 && G.time - P.lastHit > 2.5) P.hp = Math.min(100, P.hp + 5); });
        const amb = ambushRun(S, mine, GI.amb5.map(([d, sd, n]) => { const p = giAt(d, sd * 17.6); return { x: p.x, z: p.z, n, w: 1.4 }; }));
        const passed = (d) => () => { const p = giAt(d); return Math.hypot(mine.pos.x - p.x, mine.pos.z - p.z) < 14; };
        S.later(10, () => S.radio('사령부', '해병 2연대, 김포공항에서 강서로 진입. 우측 방호는 해병이 맡는다.', { dur: 3 }));
        S.until(passed(330)).then(() => S.sayBg('리선우 병장', '양쪽 다 아파트입네다… 목동이야요. 창문 조심하라우!', { dur: 2.6 }));
        S.until(passed(520)).then(() => S.sayBg('윤하린 중사', '영등포 진입! 여의도까지 1킬로미터!', { dur: 2.4 }));
        S.until(passed(640)).then(() => S.threat('heli', { x: 300, z: -2500, path: [[160, 40, -2350], [60, 36, -2200], [-40, 40, -2380]], line: '공격 헬기! 영등포 상공입니다!' }));
        S.until(passed(840)).then(() => S.sayBg('한지운 하사', '여의2교! 샛강 건넌다! 다리 위에서 서지 마라!', { dur: 2.4 }));
        await S.until(() => mine.pi >= mine.path.length || passed(L - 30)());
        S.stop(amb); S.stop(regen); G.hitMul = 1; G.armorFree = false;
        for (const a of aliveEnemies()) if (hiddenFromView(a.pos)) a.remove();
        await S.say('박도현 중위', '여의도다! 정지! 주변 확보!', { dur: 2.4 });
        await S.cut(async () => {
          const fd = scene.fog.density; scene.fog.density = 0.0012; // the morning haze lifts enough to see across the river
          const e = giAt(L); await S.cam(v3(e.x + 8, 6, e.z + 12), v3(GI.x63, 120, GI.z63), 0); S.camFov(55);
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