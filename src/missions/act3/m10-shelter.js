/* ========== 광화문역 대피소 (「북쪽으로」 finale) ==========
   A 5호선 street entrance on the west side of the plaza, closed by a steel blast door. Behind it the stair drops in two flights to the
   concourse 9 m down; along the passage, the station's small memorial room (기념관) with the flag in its case; at the end a second
   blast door, and behind that the shelter hall where people have lived for six weeks — lying on blankets, sitting against the walls,
   curled up, crying. When the last door opens they get up, cheer, and run for the stairs and the daylight.
   The collision world is boxes on the world axes, so the whole thing is laid out on the axes too (the plaza runs at 34°; the entrance
   kiosk sits square to the compass, as plenty of real ones do). Ground can't normally go below 0: activate() turns this footprint
   into a deep pit (G.groundAt) under a walkable lid, with the stairwell left open; the lid and stairwell surfaces are cut out of the
   plaza paving in the shader. */
function m10Shelter() {
  const E = rtAt(RT.V[4] + 795, -62), ex = E.x, ez = E.z, D = { ex, ez, FL: -9, CL: -4.6 };
  const TOP = 0.3; // the plaza surface
  const gran = mat('shGran', { color: 0x8a8680, rough: 0.8 }), wallM = mat('shWall', { color: 0x9a968c, map: 'concrete', rough: 0.9 }), floorM = mat('shFloor', { color: 0x6e6a62, map: 'concrete', rough: 0.95 });
  const ceilM = mat('shCeil', { color: 0x5a5852, rough: 1 }), steel = mat('shSteel', { color: 0x4a5056, rough: 0.45, metal: 0.65 }), stepM = mat('shStep', { color: 0x7c786e, map: 'concrete', rough: 0.9 }), nose = mat('shNose', { color: 0xb89a30, rough: 0.6 });
  const lamp = basicMat('shLamp', 0xf2ecd8), lampDim = basicMat('shLampDim', 0x8a8470), red = basicMat('shRed', 0xff3020), glass = mat('shGlass', { color: 0x9ab0b8, rough: 0.06, metal: 0.3, transparent: true, opacity: 0.35 });
  const B = (x0, x1, y0, y1, z0, z1, m, o = {}) => { const me = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); me.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); me.castShadow = o.cast ?? true; me.receiveShadow = true; G.world.add(me);
    if (o.col !== false) me.userData.col = addCollider(x0, y0, z0, x1, y1, z1, {}); return me; };
  const X = (a) => ex + a, Z = (b) => ez + b; // local offsets: +x east, -z north (into the ground)
  // ---- the street kiosk: granite walls on three sides, a glass canopy, the blast door across the open (south) side ----
  B(X(-2.6), X(-2.2), 0, 3.3, Z(-5.2), Z(4.4), gran); B(X(2.2), X(2.6), 0, 3.3, Z(-5.2), Z(4.4), gran); B(X(-2.6), X(2.6), -0.8, 3.3, Z(-5.6), Z(-5.2), gran);
  B(X(-2.8), X(2.8), 3.3, 3.45, Z(-5.8), Z(4.8), steel, { col: false }); B(X(-2.6), X(2.6), 3.45, 3.5, Z(-5.6), Z(4.6), glass, { col: false, cast: false });
  D.door1 = B(X(-2.2), X(2.2), TOP, 3.2, Z(4.0), Z(4.25), steel); D.door1Pos = v3(X(0), 1.2, Z(5.4));
  B(X(-2.3), X(2.3), 3.0, 3.42, Z(3.85), Z(4.45), steel, { col: false }); // the shutter's roll housing under the canopy
  for (let i = 0; i < 5; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.05, 0.05), mat('shRib', { color: 0x3c4246, rough: 0.5, metal: 0.6 })); r.position.set(0, -1.25 + i * 0.6, 0.15); D.door1.add(r); } // the door's ribs, fixed to it
  { const s = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), new THREE.MeshStandardMaterial({ map: canvasTex(256, 70, (c, w, h) => { c.fillStyle = '#8a3fa8'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText('5  광화문역', w / 2, 48); }), emissive: 0xffffff, emissiveIntensity: 0.25 })); s.position.set(X(0), 3.85, Z(4.81)); G.world.add(s); }
  { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshStandardMaterial({ map: canvasTex(160, 100, (c, w, h) => { c.fillStyle = '#e8d020'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = 'bold 22px sans-serif'; c.textAlign = 'center'; c.fillText('민방위 대피소', w / 2, 40); c.font = '16px sans-serif'; c.fillText('CIVIL DEFENSE SHELTER', w / 2, 70); }) })); s.position.set(X(2.62), 2.2, Z(2)); s.rotation.y = Math.PI / 2; G.world.add(s); }
  // ---- flight 1: under the kiosk, from the plaza down to a landing 4.5 m down; flight 2 on north to the concourse ----
  const flight = (z0, y0, y1, n, x0, x1) => { const rise = (y0 - y1) / n; for (let i = 0; i < n; i++) { const za = z0 - (i + 1) * 0.3, h = y0 - (i + 1) * rise; B(x0, x1, D.FL - 0.5, h, za, za + 0.3, stepM, { cast: false }); B(x0, x1, h - 0.005, h + 0.01, za + 0.25, za + 0.3, nose, { col: false, cast: false }); } return z0 - n * 0.3; };
  const zL1 = flight(Z(3.9), TOP, -4.5, 26, X(-1.9), X(1.9)); D.stairTop = v3(X(0), TOP, Z(3.4));
  B(X(-1.9), X(1.9), D.FL - 0.5, -4.5, zL1 - 2.2, zL1, floorM, { cast: false }); const zF2 = zL1 - 2.2; D.landing = v3(X(0), -4.5, zL1 - 1.1);
  const zC = flight(zF2, -4.5, D.FL, 26, X(-1.9), X(1.9)); D.stairFoot = v3(X(0), D.FL, zC - 1);
  // the stairwell's walls and ceiling, down into the ground (the plaza is above the ceiling from flight 2 on)
  for (const s of [-1, 1]) B(X(s * 2.2) - 0.2, X(s * 2.2) + 0.2, D.FL - 0.5, 0, zC, Z(4.2), wallM, { cast: false });
  B(X(-2.4), X(2.4), D.FL - 0.5, 0, Z(4.2), Z(4.6), wallM, { cast: false }); // under the door sill
  B(X(-2.4), X(2.4), -0.6, 0.25, zC, Z(-5.2), ceilM, { col: false, cast: false });
  for (let z = Z(-6); z > zC; z -= 4) B(X(-0.3), X(0.3), -0.64, -0.6, z - 1.2, z, lampDim, { col: false, cast: false });
  // ---- the passage north to the shelter, 6 m wide, 4.4 m high; the memorial room opens off its east side ----
  const c0 = zC, c1 = zC - 14; D.c0 = c0; D.c1 = c1;
  B(X(-3), X(3), D.FL - 0.5, D.FL, c1, c0, floorM, { cast: false }); B(X(-3.2), X(3.2), D.CL, D.CL + 0.4, c1, c0 + 0.2, ceilM, { col: false, cast: false });
  B(X(-3.4), X(-3), D.FL, D.CL, c1, c0, wallM); B(X(3), X(3.4), D.FL, D.CL, c0 - 4, c0, wallM); B(X(3), X(3.4), D.FL, D.CL, c1, c0 - 7.5, wallM);
  B(X(-3.4), X(-1.9), D.FL, D.CL, c0 - 0.2, c0 + 0.2, wallM); B(X(1.9), X(3.4), D.FL, D.CL, c0 - 0.2, c0 + 0.2, wallM); // the head of the passage either side of the stair foot
  for (let z = c0 - 2; z > c1; z -= 4) B(X(-0.25), X(0.25), D.CL - 0.05, D.CL, z - 1.4, z, Math.random() < 0.3 ? lampDim : lamp, { col: false, cast: false });
  B(X(-3), X(-2.98), D.FL + 1.8, D.FL + 2.6, c0 - 9, c0 - 5, new THREE.MeshStandardMaterial({ map: canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#e8e6e0'; c.fillRect(0, 0, w, h); c.fillStyle = '#8a3fa8'; c.fillRect(0, 0, 10, h); c.fillStyle = '#222'; c.font = 'bold 26px sans-serif'; c.fillText('5호선 광화문역 · 대피소 →', 22, 42); }) }), { col: false });
  // the memorial room: plaques, photos, and the case
  { const m0 = c0 - 4, m1 = c0 - 7.5, r0 = X(3.4), r1 = X(10);
    B(r0, r1, D.FL - 0.5, D.FL, m1 - 3, m0 + 3, floorM, { cast: false }); B(r0, r1 + 0.4, D.CL, D.CL + 0.4, m1 - 3.4, m0 + 3.4, ceilM, { col: false, cast: false });
    B(r1, r1 + 0.4, D.FL, D.CL, m1 - 3, m0 + 3, wallM); B(r0, r1, D.FL, D.CL, m0 + 2.6, m0 + 3, wallM); B(r0, r1, D.FL, D.CL, m1 - 3, m1 - 2.6, wallM); B(X(3), r0, D.FL, D.CL, m0, m0 + 3, wallM); B(X(3), r0, D.FL, D.CL, m1 - 3, m1, wallM);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.6), new THREE.MeshStandardMaterial({ map: canvasTex(384, 58, (c, w, h) => { c.fillStyle = '#1b2a3a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8e4dc'; c.font = 'bold 34px sans-serif'; c.textAlign = 'center'; c.fillText('광화문역 기념관', w / 2, 42); }), emissive: 0xffffff, emissiveIntensity: 0.2 }));
    label.position.set(r1 - 0.02, D.FL + 3.4, (m0 + m1) / 2); label.rotation.y = -Math.PI / 2; G.world.add(label);
    for (let i = 0; i < 4; i++) { const ph = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.8), mat('shPhoto' + i, { color: [0x6a6258, 0x7a7268, 0x5a5650, 0x807a70][i], rough: 0.9 })); ph.position.set(r1 - 0.02, D.FL + 1.9, m1 - 2 + i * 1.6); ph.rotation.y = -Math.PI / 2; G.world.add(ph); }
    B(r1 - 1.6, r1 - 0.6, D.FL, D.FL + 1.0, (m0 + m1) / 2 - 0.8, (m0 + m1) / 2 + 0.8, mat('shCase', { color: 0x3a3028, rough: 0.6 })); B(r1 - 1.55, r1 - 0.65, D.FL + 1.0, D.FL + 1.6, (m0 + m1) / 2 - 0.75, (m0 + m1) / 2 + 0.75, glass, { col: false });
    D.caseFlag = B(r1 - 1.4, r1 - 0.8, D.FL + 1.02, D.FL + 1.14, (m0 + m1) / 2 - 0.45, (m0 + m1) / 2 + 0.45, new THREE.MeshStandardMaterial({ map: canvasTex(120, 80, (c, w, h) => drawFlag(c, w, h, 'kr')), roughness: 0.9 }), { col: false });
    D.casePos = v3(r1 - 2.4, D.FL + 1.2, (m0 + m1) / 2);
    for (let z = m1 - 2; z < m0 + 2; z += 2.5) B(X(6) - 0.2, X(6) + 0.2, D.CL - 0.05, D.CL, z, z + 1.4, lamp, { col: false, cast: false }); }
  // ---- the second blast door and the shelter hall: 24 m across, 22 m deep, columns in two rows ----
  const h0 = c1, h1 = c1 - 22; D.h0 = h0; D.h1 = h1;
  D.door2 = B(X(-3), X(3), D.FL, D.FL + 3.4, h0 - 0.1, h0 + 0.25, steel); D.door2Pos = v3(X(0), D.FL + 1.2, h0 + 1.6);
  B(X(-3.1), X(3.1), D.FL + 3.2, D.FL + 3.6, h0 - 0.15, h0 + 0.45, steel, { col: false }); // its roll housing
  B(X(-3), X(3), D.FL + 3.4, D.CL, h0 - 0.1, h0 + 0.25, wallM);
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.05, 0.05), mat('shRib', { color: 0x3c4246, rough: 0.5, metal: 0.6 })); r.position.set(0, -1.28 + i * 0.5, 0.2); D.door2.add(r); }
  B(X(-12), X(12), D.FL - 0.5, D.FL, h1, h0, floorM, { cast: false }); B(X(-12.4), X(12.4), D.CL, D.CL + 0.4, h1 - 0.4, h0 + 0.3, ceilM, { col: false, cast: false });
  B(X(-12.4), X(-12), D.FL, D.CL, h1, h0, wallM); B(X(12), X(12.4), D.FL, D.CL, h1, h0, wallM); B(X(-12.4), X(12.4), D.FL, D.CL, h1 - 0.4, h1, wallM);
  B(X(-12.4), X(-3), D.FL, D.CL, h0 - 0.1, h0 + 0.3, wallM); B(X(3), X(12.4), D.FL, D.CL, h0 - 0.1, h0 + 0.3, wallM);
  for (const x of [-5, 5]) for (let z = h0 - 5; z > h1 + 2; z -= 6) B(X(x) - 0.4, X(x) + 0.4, D.FL, D.CL, z - 0.4, z + 0.4, mat('shCol', { color: 0xb4ae9e, rough: 0.8 }));
  for (const x of [-8.5, 0, 8.5]) for (let z = h0 - 3; z > h1 + 1; z -= 5) B(X(x) - 0.2, X(x) + 0.2, D.CL - 0.05, D.CL, z - 1.4, z, Math.random() < 0.4 ? lampDim : lamp, { col: false, cast: false });
  for (const [x, z] of [[-11.8, h0 - 1], [11.8, h1 + 1]]) B(X(x) - 0.1, X(x) + 0.1, D.CL - 0.6, D.CL - 0.3, Z(0) + z - ez - 0.3, Z(0) + z - ez + 0.3, red, { col: false, cast: false });
  // six weeks of living down here: blankets and mats, water, boxes, bags along the walls
  const blanket = [0x6a3a3a, 0x3a4a6a, 0x5a5a3a, 0x7a6a50, 0x4a3a5a, 0x3a5a4a], spots = [];
  for (let i = 0; i < 46; i++) { let x, z, k = 0; do { x = rand(-11, 11); z = rand(h1 + 1.5, h0 - 2.5); k++; } while (k < 20 && (Math.abs(x) < 1.6 || spots.some(([a, b]) => Math.hypot(a - x, b - z) < 1.6) || ([-5, 5].some((cx) => Math.abs(x - cx) < 1.1)))); spots.push([x, z]); }
  D.spots = spots.map(([x, z]) => v3(X(x), D.FL, z));
  for (const [x, z] of spots) { const b = new THREE.Mesh(new THREE.BoxGeometry(rand(1.0, 1.4), 0.04, rand(1.8, 2.2)), mat('shBl' + (Math.abs(Math.round(x * 7 + z)) % 6), { color: pick(blanket), rough: 1 })); b.position.set(X(x), D.FL + 0.03, z); b.rotation.y = rand(-0.4, 0.4); G.world.add(b); }
  for (let i = 0; i < 30; i++) { const w = Math.random() < 0.5, x = pick([-1, 1]) * rand(10.6, 11.6), z = rand(h1 + 1, h0 - 1); B(X(x) - 0.3, X(x) + 0.3, D.FL, D.FL + (w ? 0.35 : 0.5), z - 0.25, z + 0.25, w ? mat('shWater', { color: 0x8ab8d8, rough: 0.2, transparent: true, opacity: 0.8 }) : mat('shBox', { color: 0x9a8058, rough: 0.9 }), { col: false }); }
  // ---- the people, posed: each a soldier-rig in civilian clothes, held in one of five postures ----
  D.people = [];
  for (const p of D.spots) { const kind = pick(['lie', 'lie', 'sit', 'sit', 'curl', 'cry', 'cry', 'kneel']); const m = makeSoldierMesh('rok', { civ: pick([0x6b3b33, 0x2f4a6b, 0x7a6a50, 0x3d5a45, 0x5a4a6a, 0x4a4a4a, 0x8a6a5a]), unarmed: true });
    m.root.position.copy(p); m.root.rotation.y = rand(0, TAU); G.world.add(m.root); const o = { m, kind, ph: rand(0, TAU), p: p.clone() }; m7ShPose(o, 0); D.people.push(o); }
  G.updaters.push((dt) => { if (!D.people.length || G.mode !== 'play') return; const near = P.pos.y < -1 || P.pos.distanceTo(D.people[0].p) < 30; for (const o of D.people) { if (o.done) continue; o.m.root.visible = near; if (near) m7ShPose(o, dt); } });
  // the pit under the plaza: activate() makes it real for everything that walks
  const pit = { x0: X(-12.6), x1: X(12.6), z0: Math.min(h1, Z(-5.6)) - 0.6, z1: Z(4.6) }, hole = { x0: X(-1.9), x1: X(1.9), z0: zL1 + 0.01, z1: Z(4.0) };
  D.activate = () => { if (D.on) return; D.on = true; const g0 = G.groundAt; G.groundAt = (x, z) => (x > pit.x0 && x < pit.x1 && z > pit.z0 && z < pit.z1 ? D.FL - 0.5 : g0(x, z));
    // the lid: the plaza over the pit, everywhere but the open stairwell inside the kiosk
    for (const [a, b, c, d] of [[pit.x0, pit.x1, pit.z0, hole.z0], [pit.x0, pit.x1, hole.z1, pit.z1], [pit.x0, hole.x0, hole.z0, hole.z1], [hole.x1, pit.x1, hole.z0, hole.z1]]) addCollider(a, -0.5, c, b, TOP, d, {}); };
  m10CutPlaza(hole);
  return D;
}
/* the people's postures; t advances their breathing and crying */
function m7ShPose(o, dt) {
  const m = o.m; o.ph += dt; const ph = o.ph;
  if (o.cheer) { // getting up: from lying, sitting or curled, onto their feet, turning toward the door
    if (o.rx0 === undefined) { o.rx0 = m.root.rotation.x; o.y0 = m.root.position.y; o.yaw0 = m.root.rotation.y; }
    const k = Math.min(1, o.cheer += dt * (o.kind === 'lie' ? 1.1 : 1.8)), e = k * k * (3 - 2 * k); poseSoldier(m, { moving: false, speed: 0, crouch: 1 - e, aim: 0, walk: 0, pitch: 0 }, 1);
    m.root.rotation.x = o.rx0 * (1 - e); m.root.position.y = o.y0 + (o.p.y - o.y0) * e; m.root.rotation.y = o.yaw0 + angDiff(o.yaw0, o.face ?? o.yaw0) * e; return; }
  if (o.kind === 'lie') { poseSoldier(m, { moving: false, speed: 0, crouch: 0, aim: 0, walk: 0, pitch: 0 }, 1); m.root.rotation.x = -Math.PI / 2; m.root.position.y = o.p.y + 0.22 + Math.sin(ph * 1.4) * 0.008; }
  else if (o.kind === 'sit') { poseSoldier(m, { moving: false, speed: 0, crouch: 1, aim: 0, walk: 0, pitch: -0.2 }, 1); m.root.rotation.x = 0.12; m.root.position.y = o.p.y - 0.35; }
  else if (o.kind === 'curl') { poseSoldier(m, { moving: false, speed: 0, crouch: 1, aim: 0, walk: 0, pitch: 0.7 }, 1); m.root.rotation.x = 0.35; m.root.position.y = o.p.y - 0.42; if (m.armR) m.armR.rotation.set(-0.9, 0, 0.5); if (m.armL) m.armL.rotation.set(-0.9, 0, -0.5); }
  else if (o.kind === 'kneel') { poseSoldier(m, { moving: false, speed: 0, crouch: 0.85, aim: 0, walk: 0, pitch: 0.5 }, 1); m.root.rotation.x = 0.15; m.root.position.y = o.p.y - 0.25; }
  else { // crying: hunched, face in the hands, shoulders shaking
    poseSoldier(m, { moving: false, speed: 0, crouch: 0.9, aim: 0, walk: 0, pitch: 0.8 }, 1); m.root.rotation.x = 0.3 + Math.sin(ph * 11) * 0.025; m.root.position.y = o.p.y - 0.3 + Math.sin(ph * 11) * 0.012;
    if (m.armR) m.armR.rotation.set(-1.9, 0, 0.6); if (m.armL) m.armL.rotation.set(-1.9, 0, -0.6); }
}
/* the plaza paving and the ground under the kiosk are cut away in their shaders so the stairwell shows from above */
function m10CutPlaza(hole) {
  const rc = new THREE.Raycaster(), mats = new Set(); rc.camera = camera; G.staticRoot.updateMatrixWorld(true); G.world.updateMatrixWorld(true); // sprites need the camera; nothing has been rendered yet, so bring the world matrices up to date
  for (const [u, v] of [[0.5, 0.5], [0.2, 0.2], [0.8, 0.8], [0.2, 0.8], [0.8, 0.2]]) { const x = hole.x0 + (hole.x1 - hole.x0) * u, z = hole.z0 + (hole.z1 - hole.z0) * v; rc.set(v3(x, 40, z), v3(0, -1, 0));
    for (const h of rc.intersectObjects([G.staticRoot, G.world], true)) { if (h.point.y > 1 || h.point.y < -1.5 || !h.object.isMesh) continue; (Array.isArray(h.object.material) ? h.object.material : [h.object.material]).forEach((m) => mats.add(m)); } }
  for (const m of mats) { if (m.userData.holeCut) continue; m.userData.holeCut = true; const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => '';
    m.onBeforeCompile = (s, r) => { if (prev) prev(s, r);
      s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vHoleW;').replace('#include <project_vertex>', '#include <project_vertex>\nvHoleW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vHoleW;`).replace('void main() {', `void main() {\nif (vHoleW.x > ${hole.x0.toFixed(2)} && vHoleW.x < ${hole.x1.toFixed(2)} && vHoleW.z > ${hole.z0.toFixed(2)} && vHoleW.z < ${hole.z1.toFixed(2)} && vHoleW.y > -1.5) discard;`); };
    m.customProgramCacheKey = () => prevKey() + '|hole'; m.needsUpdate = true; }
}
