/* ================= 노량진역, from the street photo and the aerial map =================
   The street building stands on the forecourt beside 노량진로: cream ceramic tile, a green-glazed stair tower with the name on top,
   a double-height lobby inside with one long stair up. From its first floor the concourse runs west over all four double tracks,
   and a stair drops from its south side onto each platform — the last of them onto the low side platform along the westmost line,
   the only low-level platform at 노량진 (the 경부선 one).
   Game frame: the street is x ≈ 0 (north is -z), the railway corridor x -111.5 … -175.5, the platforms z 230 … 420.
   The roof, the wall panels and the floor over the tracks are kept as separate pieces (NY.roof / NY.wall / NY.floor) so 「남쪽으로」 can bring them down. */
const NY = { z0: 342, z1: 372, xE: -46, xW: -176, lobW: -80, FY: 8.6, RY: 13.6, stairX: [-57, -77], stairZ: [342.6, 348.2], platStairs: [[-128.5, 1.7], [-143.5, 1.7], [-158.5, 1.7], [-172.6, 1.2]], gateX: -88, roof: [], wall: [], floor: [] };
function hgNoryangjin() {
  NY.roof = []; NY.wall = []; NY.floor = [];
  const tile = hgMat('nyTile', { color: 0xe6e1d6, map: 'concrete', rough: 0.7 }), tileD = hgMat('nyTileD', { color: 0xcfc8ba, map: 'concrete', rough: 0.75 });
  const green = hgMat('nyGreen', { color: 0x3f9a7a, rough: 0.12, metal: 0.35, transparent: true, opacity: 0.72 }), glass = hgMat('nyGlass', { color: 0x8ea8b2, rough: 0.08, metal: 0.3, transparent: true, opacity: 0.4 });
  const steel = hgMat('nySteel', { color: 0x5a6066, rough: 0.45, metal: 0.6 }), floorM = hgMat('nyFloor', { color: 0xb9b3a8, map: 'concrete', rough: 0.8 }), ceil = hgMat('nyCeil', { color: 0xd8d6d0, rough: 0.9 });
  const stepM = hgMat('nyStep', { color: 0x9c968c, map: 'concrete', rough: 0.85 }), nose = hgMat('nyNose', { color: 0xc8a030, rough: 0.6 }), dark = hgMat('nyDark', { color: 0x1d2226, rough: 0.6 });
  const lamp = basicMat('nyLamp', 0xfff4e0);
  // a box from corner to corner: static (merged) unless dyn, with a collider unless col === false
  const B = (x0, x1, y0, y1, z0, z1, m, o = {}) => { const me = hgMesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, { dyn: o.dyn, cast: o.cast });
    if (o.col !== false) me.userData.col = addCollider(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1), {}); return me; };
  const { z0, z1, xE, xW, lobW, FY, RY } = NY, y0r = HR.deck;

  // ---- the lobby: a double-height hall, the door facing the street, one long stair up the north wall ----
  B(xE - 0.4, xE, 0, 3.4, z0, 351, tile); B(xE - 0.4, xE, 0, 3.4, 359, z1, tile); B(xE - 0.4, xE, 3.4, FY - 0.5, z0, z1, tile); // east front: the door 351–359
  B(xE - 0.05, xE + 0.02, 0.4, 3.2, 351.2, 358.8, glass, { col: false }); // the glass doors stand open
  B(lobW, xE, 0, FY - 0.5, z0, z0 + 0.4, tile); B(lobW, xE, 0, FY - 0.5, z1 - 0.4, z1, tile); B(lobW, lobW + 0.4, 0, FY - 0.5, z0, z1, tileD);
  B(xE + 0.6, lobW - 0.6, 0.04, 0.12, z0, z1, floorM, { col: false });
  for (let i = 0; i < 6; i++) B(-52.2 - i * 4.5, -51.8 - i * 4.5, FY - 0.64, FY - 0.6, 353, 369, lamp, { col: false, cast: false });
  // ticket machines and a closed kiosk along the south wall; a fallen sign
  for (let i = 0; i < 4; i++) B(-52 - i * 1.6, -50.8 - i * 1.6, 0, 1.8, z1 - 1.2, z1 - 0.4, steel);
  B(-72, -66, 0, 2.6, z1 - 4.4, z1 - 0.4, tileD);
  // the stair: 50 risers of 0.172 m on 0.38 m treads, from the lobby floor at x -57 up to the first floor at x -76
  { const [sx0, sx1] = NY.stairX, [sz0, sz1] = NY.stairZ, n = 50, run = (sx0 - sx1) / n, rise = FY / n;
    for (let i = 0; i < n; i++) { const xa = sx0 - i * run, h = (i + 1) * rise; B(xa - run, xa, 0, h, sz0, sz1, stepM, { cast: false }); B(xa - run, xa - run + 0.05, h - 0.01, h + 0.004, sz0, sz1, nose, { col: false, cast: false }); }
    B(sx1, sx0, 0, FY, sz1, sz1 + 0.15, glass, { col: false }); // glass balustrade on the open side, rising with the stair
    for (let i = 0; i <= 10; i++) { const x = sx0 - i * (sx0 - sx1) / 10, h = FY * i / 10; B(x - 0.04, x + 0.04, h, h + 1.0, sz1 + 0.02, sz1 + 0.1, steel, { col: false, cast: false }); }
    B(sx1, sx0, 0, 0.001, sz1, sz1 + 0.15, steel, { col: false }); // (keeps the balustrade grounded visually)
    // a handrail you cannot step through: a thin collider along the balustrade, as high as the step beside it
    for (let i = 0; i < n; i += 5) { const xa = sx0 - i * run; B(xa - run * 5, xa, 0, (i + 5) * rise + 1.0, sz1 + 0.02, sz1 + 0.14, steel, { cast: false }).visible = false; } }

  // ---- the first floor: the concourse slab over the lobby, the forecourt and all the tracks ----
  { const [sx0, sx1] = NY.stairX, [sz0, sz1] = NY.stairZ;
    B(xE, lobW, FY - 0.5, FY, sz1 + 0.15, z1, floorM); B(xE, sx0, FY - 0.5, FY, z0, sz1 + 0.15, floorM); B(sx1, lobW, FY - 0.5, FY, z0, sz1 + 0.15, floorM);
    // the stairwell's guard rail on the first floor
    B(sx1, sx0, FY, FY + 1.05, sz1 + 0.15, sz1 + 0.3, glass); B(sx0, sx0 + 0.15, FY, FY + 1.05, z0, sz1 + 0.3, glass);
    // west of the lobby wall the floor is laid in 6 m bays: over the forecourt they stay, over the tracks they can fall
    for (let x = lobW; x > xW + 0.01; x -= 6) { const xb = Math.max(xW, x - 6), over = x <= -111.5; const me = B(xb, x, FY - 0.5, FY, z0, z1, floorM, { dyn: over });
      if (over) { NY.floor.push(me); const c = new THREE.Mesh(new THREE.BoxGeometry(x - xb, 0.12, z1 - z0 - 0.8), ceil); c.position.set(0, -0.31, 0); me.add(c); } // the ceiling goes down with its bay
      else B(xb, x, FY - 0.62, FY - 0.5, z0 + 0.4, z1 - 0.4, ceil, { col: false }); }
    // under-floor beams and the columns: on the forecourt, on the railway walls, on each island platform's centre line
    for (const x of [-95, -111.5, -128.5, -143.5, -158.5, xW + 0.6]) for (const z of [z0 + 2, z1 - 2]) B(x - 0.45, x + 0.45, x < -111 && x > -170 ? y0r + 1.1 : 0, FY - 0.6, z - 0.45, z + 0.45, tileD); }

  // ---- concourse walls (glazed band between tiled spandrels), roof in 6 m panels ----
  const gaps = NY.platStairs.map(([x]) => x);
  for (let x = xE; x > xW + 0.01; x -= 6) { const xb = Math.max(xW, x - 6), over = x <= -111.5;
    // north wall: tiled base, glazing, tiled top
    for (const [y0, y1, m] of [[FY, FY + 1.1, tile], [FY + 1.1, RY - 1.2, glass], [RY - 1.2, RY, tile]]) { const w = B(xb, x, y0, y1, z0 - 0.4, z0, m, { dyn: true, col: m !== glass || y0 < FY + 1.2 }); NY.wall.push(w); }
    if (m7wallOpen(gaps, xb, x)) { // south wall with the stair openings (3.4 m, full height of the door)
      for (const [a, b] of m7wallSplit(gaps, xb, x)) for (const [y0, y1, m] of [[FY, FY + 1.1, tile], [FY + 1.1, RY - 1.2, glass], [RY - 1.2, RY, tile]]) NY.wall.push(B(a, b, y0, y1, z1, z1 + 0.4, m, { dyn: true }));
      for (const g of gaps) if (g < x && g > xb) NY.wall.push(B(g - 1.7, g + 1.7, FY + 3.2, RY, z1, z1 + 0.4, tile, { dyn: true })); }
    else for (const [y0, y1, m] of [[FY, FY + 1.1, tile], [FY + 1.1, RY - 1.2, glass], [RY - 1.2, RY, tile]]) NY.wall.push(B(xb, x, y0, y1, z1, z1 + 0.4, m, { dyn: true }));
    const r = B(xb, x, RY, RY + 0.6, z0 - 0.4, z1 + 0.4, tileD, { dyn: true, col: false }); NY.roof.push(r);
    for (let k = 0; k < 2; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, z1 - z0 - 8), lamp); l.position.set(xb + 1.575 + k * 3 - (xb + x) / 2, -0.375, 0); l.userData.lamp = true; r.add(l); } } // the lamps hang from their roof bay
  B(xW - 0.4, xW, FY, RY, z0, z1, tile, { dyn: true }); B(xE - 0.4, xE, FY, RY, z0, z1, tile);
  // ticket gates across the concourse: grey cabinets with 0.9 m lanes, one 2.4 m wide gate at z 360 on the way through
  for (let z = z0 + 1.2; z < z1 - 1; z += 1.5) { if (z > 358.4 && z < 361.6) continue; B(NY.gateX - 0.9, NY.gateX + 0.9, FY, FY + 1.0, z, z + 0.3, steel); B(NY.gateX - 0.6, NY.gateX - 0.3, FY + 1.0, FY + 1.03, z + 0.05, z + 0.25, basicMat('nyGateG', 0x30d070), { col: false, cast: false }); }
  // the line boards over each stair: blue 1호선 on white
  for (const [x] of NY.platStairs) signBoard(x, RY - 2.2, z1 - 0.6, x < -170 ? '6  경부선 · 장항선' : x < -150 ? '4·5  1호선 하행' : x < -135 ? '2·3  1호선 상행' : '1  1호선 급행', { w: 3.2, bg: '#1d4f8a', size: 44, ry: Math.PI });

  // ---- the stairs down from the concourse's south side onto the platforms (the last one onto the low platform) ----
  for (const [x, top] of NY.platStairs) { const ytop = y0r + top, n = Math.round((FY - ytop) / 0.172), run = 0.3, rise = (FY - ytop) / n, w = x < -170 ? 2.6 : 2.8;
    for (let i = 0; i < n; i++) { const za = z1 + 0.4 + i * run, h = FY - (i + 1) * rise; B(x - w / 2, x + w / 2, ytop, h + rise, za, za + run, stepM, { cast: false }); B(x - w / 2, x + w / 2, h + rise - 0.004, h + rise + 0.008, za, za + 0.05, nose, { col: false, cast: false }); }
    B(x - w / 2 - 0.3, x + w / 2 + 0.3, FY - 0.5, FY, z1 - 0.2, z1 + 0.45, floorM, { cast: false }); // the landing through the wall opening, so the floor runs straight onto the top step
    const zEnd = z1 + 0.4 + n * run;
    for (const s of [-1, 1]) { B(x + s * (w / 2 + 0.05) - 0.04, x + s * (w / 2 + 0.05) + 0.04, ytop, ytop + 1, zEnd - 0.1, zEnd, steel, { col: false });
      for (let i = 0; i < n; i += 4) { const za = z1 + 0.4 + i * run, h = FY - i * rise; B(x + s * (w / 2 + 0.05) - 0.06, x + s * (w / 2 + 0.05) + 0.06, h - 4 * rise, h + 1.0, za, za + 4 * run, glass, { cast: false }); } }
    B(x - w / 2 - 0.3, x + w / 2 + 0.3, FY + 2.6, FY + 2.75, z1 + 0.4, zEnd, hgMat('nyStairRoof', { color: 0x7a8288, rough: 0.5, metal: 0.4 }), { col: false }); }

  // ---- outside: the green-glazed stair tower on the street front with the name on top, the exterior stair, the forecourt furniture ----
  { const tx0 = xE + 0.4, tx1 = xE + 7, tz0 = 360.5, tz1 = 368.5;
    B(tx0, tx1, 0, 16.2, tz0, tz0 + 0.3, tile); B(tx0, tx1, 0, 16.2, tz1 - 0.3, tz1, tile);
    B(tx1 - 0.15, tx1, 0, 14.6, tz0 + 0.3, tz1 - 0.3, green, { col: true }); B(tx0, tx1, 14.6, 16.2, tz0, tz1, tile);
    for (let y = 2.4; y < 14.6; y += 2.4) B(tx1 - 0.2, tx1 + 0.02, y - 0.06, y + 0.06, tz0 + 0.3, tz1 - 0.3, hgMat('nyMull', { color: 0xdedad2, rough: 0.6 }), { col: false });
    for (let z = tz0 + 2; z < tz1 - 0.5; z += 2) B(tx1 - 0.2, tx1 + 0.02, 0, 14.6, z - 0.05, z + 0.05, hgMat('nyMull', { color: 0xdedad2, rough: 0.6 }), { col: false });
    signBoard(tx1 + 0.06, 15.4, (tz0 + tz1) / 2, '노량진역', { w: 6.4, bg: '#e8e4dc', fg: '#2a2a2a', size: 72, ry: Math.PI / 2 });
    // the exterior stair to the first-floor deck on the street side (closed off with a shutter)
    B(xE + 0.4, xE + 3.4, 0, 0.9, 343, 356, tileD); B(xE + 0.4, xE + 3.4, 3.4, 3.7, 343, 351, tileD, { col: false });
    for (let i = 0; i < 6; i++) B(xE + 4 + i * 1.9, xE + 4.12 + i * 1.9, 0, 1.0, 344, 352, steel); // bike rack rails
    B(xE + 3.6, xE + 15, 0, 0.12, 343.5, 352.5, dark, { col: false, cast: false }); }
  // the concourse also reads from the far side of the tracks: its name on the west end
  signBoard(xW - 0.5, RY - 1.8, (z0 + z1) / 2, 'NORYANGJIN', { w: 9, bg: '#e8e4dc', fg: '#2a2a2a', size: 60, ry: -Math.PI / 2 });

  // ---- the street around it: 노량진 학원가 across 노량진로, low shops at the forecourt's ends ----
  for (const [x, z, w, d, h] of [[-72, 228, 40, 18, 13], [-68, 440, 44, 22, 16], [-100, 440, 18, 22, 10]]) hgBuilding(x, z, w, d, h, 'mid', { shops: true, v: randi(0, 3) });
  { let z = 214; while (z < 470) { const d = rand(20, 34); hgBuilding(38, z + d / 2, 24, d - 4, rand(22, 48), pick(['mid', 'glass', 'mid']), { shops: true, v: randi(0, 3) }); z += d; } }
  { let z = 210; while (z < 470) { const d = rand(26, 40); hgBuilding(72, z + d / 2, 34, d - 6, rand(30, 62), pick(['apt', 'mid', 'glass']), { v: randi(0, 3) }); z += d; } }
  { let z = 216; while (z < 470) { const d = rand(30, 46); hgBuilding(112, z + d / 2, 36, d - 8, rand(24, 70), pick(['apt', 'mid']), { v: randi(0, 3), bare: true }); z += d; } }
  // 학원 banners on the street-facing fronts
  const names = ['메가 공무원', '9급 합격', '경찰학원', '임용 전문', '노량진 컵밥', '고시원', '독서실 24시', '한국사 특강'];
  { let i = 0; for (let z = 226; z < 462; z += 19) signBoard(25.6, rand(6, 14), z, names[i++ % names.length], { w: 5.2, bg: pick(['#c8202a', '#1d4f8a', '#2a7a3a', '#e0a020']), size: 50, ry: -Math.PI / 2 }); }
}
function m7wallOpen(gaps, a, b) { return gaps.some((g) => g + 1.7 > a && g - 1.7 < b); }
function m7wallSplit(gaps, a, b) { let segs = [[a, b]]; for (const g of gaps) { const n = []; for (const [s, e] of segs) { if (g + 1.7 <= s || g - 1.7 >= e) n.push([s, e]); else { if (g - 1.7 > s) n.push([s, g - 1.7]); if (g + 1.7 < e) n.push([g + 1.7, e]); } } segs = n; } return segs.filter(([s, e]) => e - s > 0.05); }
