function gunship(S) {
  const h = new Vehicle('aheli', 0, 700, { team: 'ally', armed: false, invuln: true, y: 40, speed: 20 });
  let t = 0, cd = 2; const rotor = h.snd;
  G.updaters.push((dt) => { if (!h.alive || G.mode !== 'play') return true; t += dt; const L = G.actors.find((a) => a.leading) || { pos: P.pos };
    const want = v3(Math.sin(t * 0.25) * 18, 32 + Math.sin(t * 0.4) * 3, L.pos.z - 55); h.pos.lerp(want, Math.min(1, dt * 0.6)); h.yaw = Math.PI * 0 + Math.sin(t * 0.3) * 0.2; h.m.root.position.copy(h.pos); h.m.root.rotation.y = h.yaw;
    cd -= dt; if (cd > 0) return; cd = rand(2.2, 3.5);
    const tg = G.actors.filter((a) => a.alive && a.team === 'enemy' && a.pos.distanceTo(h.pos) < 90 && a.pos.z < L.pos.z - 10); if (!tg.length) return; const a = pick(tg);
    for (let i = 0; i < 12; i++) setGameTimeout(() => { const to = a.pos.clone().add(v3(rand(-2.5, 2.5), rand(0, 1), rand(-2.5, 2.5))); tracer(h.pos.clone().add(v3(0, -1.5, -2)), to, [1, 0.6, 0.3], 300); FX.dust(to, 4, [0.6, 0.58, 0.55], 0.4); SFX.shot('mg', h.pos); if (i === 11 && a.alive && Math.random() < 0.6) a.hurt(999, null); }, i * 0.07);
  });
  S.later(4, () => S.radio('바이퍼 1-1', '여기는 바이퍼 1-1, 상공 엄호 들어간다. 앞길 터준다.', { dur: 3 }));
  return h;
}
function followAll(S) { const L = S.sq.park; (G.m10allies || []).forEach((a, i) => { a.follow = { leader: L, back: 9 + (i >> 1) * 2.2, side: i % 2 ? 3 + (i % 4) : -3 - (i % 4) }; }); }
/* 북쪽으로: our helicopter (steered by hand, the player on its left door gun) and the armoured column below; z0 = where they start */
const squadSay = (k, line, d) => subtitle({ park: '박도현 중위', lee: '리선우 병장', yoon: '윤하린 중사', han: '한지운 하사' }[k], line, d || 2.4);
/* 북쪽으로 flies the real road north: 한강대교 → 용산 → 삼각지 → 서울역 → 숭례문 → 시청 → 세종대로 → 광화문 (the same map as 「남쪽으로」) */
function srPathN(x, z0, z1, step = 12) { const out = []; for (let z = z0; z > z1; z -= step) out.push(v3(RX(x, z), 0, z)); out.push(v3(RX(x, z1), 0, z1)); return out; }
function roofAt(x, z, r = 0) { let top = 0; for (const c of G.colliders) { if (c.max.y < 6 || c.max.y > 400) continue; if (x > c.min.x - r && x < c.max.x + r && z > c.min.z - r && z < c.max.z + r) top = Math.max(top, c.max.y); } return top; }
/* the inside of the transport helicopter: floor, ceiling, walls (drawn from the inside), the open left door, benches with the squad, cockpit bulkhead, a dim cabin light */
/* the gunner's seat of a KUH-1 수리온: we sit front right. The outer fuselage is hidden while we are inside it and a proper cockpit is drawn
   instead: instrument panel with four lit displays under a glare shield, slim windscreen pillars, overhead console, centre console, the
   right door frame, the pilot on the left. The K-M19 pod under the right side of the nose turns with our aim. (local units; the heli is scaled 1.5) */
function heliCabin(H) {
  const g = new THREE.Group(); H.m.root.add(g);
  const body = H.m.root.children[0];
  G.updaters.push(() => { if (!H.alive) return true; if (body) body.visible = !(P.ride && P.ride.obj === H.m.root); });
  const M = (c, r = 0.8, m = 0.1) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const shell = M(0x8a908a, 0.85), shellD = M(0x646a64, 0.85), panel = M(0x3e4244, 0.6, 0.15), black = M(0x26282a, 0.7), frame = M(0x50564f, 0.6, 0.3), seat = M(0x3a4038, 0.95), metal = M(0x8a8e8c, 0.4, 0.6);
  const glass = new THREE.MeshStandardMaterial({ color: 0x9ab0b8, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.08, depthWrite: false });
  const B = (w, h, d, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); g.add(me); return me; };
  const C = (r0, r1, h, m, x, y, z, rx = 0, rz = 0) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, 12), m); me.position.set(x, y, z); me.rotation.set(rx, 0, rz); g.add(me); return me; };
  const FL = -1.32, ZP = -2.95; // floor (seated: the eye sits ~1.2 m above it), the face of the instrument panel
  // floor, the cockpit side walls below the windows, the back wall behind the seats (with the opening into the cabin)
  B(1.95, 0.05, 2.2, black, 0, FL - 0.02, -2.4);
  for (const s of [-1, 1]) { if (s < 0) B(0.06, 0.55, 1.4, shell, s * 0.97, FL + 0.27, -2.35); else { B(0.06, 0.14, 1.4, shell, 0.97, FL + 0.07, -2.35); const lw = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.42), glass); lw.position.set(0.985, FL + 0.35, -2.4); lw.rotation.y = Math.PI / 2; g.add(lw); } B(0.06, 0.06, 1.4, frame, s * 0.97, FL + 0.56, -2.35); } // the right side has a low window: the gun pod below shows through it
  B(0.62, 1.7, 0.06, shellD, -0.67, FL + 0.85, -1.62); B(0.62, 1.7, 0.06, shellD, 0.67, FL + 0.85, -1.62); B(0.75, 0.4, 0.06, shellD, 0, FL + 1.5, -1.62);
  // instrument panel: angled face, glare shield on top, four displays, rows of switches and lamps
  B(1.75, 0.5, 0.18, panel, 0, FL + 0.62, ZP, -0.35); B(1.8, 0.04, 0.16, black, 0, FL + 0.89, ZP - 0.06, 0.12);
  const mfd = (draw) => { const t = canvasTex(128, 104, draw); return new THREE.MeshBasicMaterial({ map: t, toneMapped: false }); };
  const map = mfd((c, w, h) => { c.fillStyle = '#05140c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2acb6a'; c.lineWidth = 1; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, i * 20); c.lineTo(w, i * 20 + 10); c.stroke(); } c.strokeStyle = '#66e0ff'; c.lineWidth = 3; c.beginPath(); c.moveTo(60, h); c.lineTo(66, 0); c.stroke(); c.fillStyle = '#ffd040'; c.beginPath(); c.moveTo(64, 60); c.lineTo(58, 72); c.lineTo(70, 72); c.fill(); });
  const adi = mfd((c, w, h) => { c.fillStyle = '#3a6ab0'; c.fillRect(0, 0, w, h / 2 + 6); c.fillStyle = '#7a5530'; c.fillRect(0, h / 2 + 6, w, h); c.strokeStyle = '#fff'; c.lineWidth = 2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(44, h / 2 + 6 + i * 14); c.lineTo(84, h / 2 + 6 + i * 14); c.stroke(); } c.strokeStyle = '#ffd040'; c.lineWidth = 4; c.beginPath(); c.moveTo(30, h / 2 + 6); c.lineTo(54, h / 2 + 6); c.moveTo(74, h / 2 + 6); c.lineTo(98, h / 2 + 6); c.stroke(); c.fillStyle = '#0c0c0c'; c.fillRect(0, 0, 22, h); c.fillRect(w - 22, 0, 22, h); c.fillStyle = '#2acb6a'; c.font = '11px monospace'; c.fillText('120', 1, 56); c.fillText('1250', w - 22, 56); });
  const eng = mfd((c, w, h) => { c.fillStyle = '#050a08'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const v = [0.78, 0.74, 0.62, 0.9][i]; c.fillStyle = '#1a3a24'; c.fillRect(12 + i * 28, 14, 16, 70); c.fillStyle = i === 3 ? '#e0c040' : '#2acb6a'; c.fillRect(12 + i * 28, 14 + 70 * (1 - v), 16, 70 * v); } c.fillStyle = '#9ad8b0'; c.font = '10px monospace'; c.fillText('TQ  T45  NG  NR', 8, 98); });
  const wpn = mfd((c, w, h) => { c.fillStyle = '#060806'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2acb6a'; c.lineWidth = 2; c.strokeRect(14, 14, 100, 60); c.fillStyle = '#2acb6a'; c.font = 'bold 13px monospace'; c.fillText('K-M19', 38, 36); c.fillText('ARM', 48, 56); c.fillStyle = '#ffd040'; c.fillText('RDY 999', 30, 94); });
  [[-0.62, adi], [-0.25, map], [0.25, wpn], [0.62, eng]].forEach(([x, m]) => { const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.23), m); sc.position.set(x, FL + 0.66, ZP + 0.1); sc.rotation.x = -0.35; g.add(sc); B(0.32, 0.27, 0.02, black, x, FL + 0.66, ZP + 0.085, -0.35); });
  const lampG = new THREE.MeshBasicMaterial({ color: 0x40ff90, toneMapped: false }), lampA = new THREE.MeshBasicMaterial({ color: 0xffb030, toneMapped: false });
  for (let i = 0; i < 14; i++) B(0.035, 0.022, 0.01, i % 5 === 0 ? lampA : lampG, -0.7 + i * 0.105, FL + 0.43, ZP + 0.17, -0.35);
  // centre console between the seats: radio stack with lit keys
  B(0.32, 0.5, 1.0, panel, 0, FL + 0.25, -2.35, 0); B(0.3, 0.02, 0.9, black, 0, FL + 0.51, -2.35);
  for (let i = 0; i < 18; i++) B(0.04, 0.012, 0.035, i % 4 ? lampG : lampA, -0.09 + (i % 3) * 0.09, FL + 0.525, -2.75 + Math.floor(i / 3) * 0.13);
  // windscreen: two big panes and the chin windows, held by thin pillars; the roof and overhead console
  for (const s of [-1, 1]) {
    B(0.05, 0.05, 0.95, frame, s * 0.92, FL + 1.45, -2.5, 0.0); // roof edge
    C(0.028, 0.028, 1.05, frame, s * 0.92, FL + 1.18, -3.02, 0.55, 0); // A-pillar
    C(0.028, 0.028, 0.95, frame, s * 0.97, FL + 1.05, -1.78, 0, 0); // door post
    const wp = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.9), glass); wp.position.set(s * 0.46, FL + 1.2, -3.08); wp.rotation.x = 0.5; g.add(wp);
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.85), glass); sp.position.set(s * 0.985, FL + 1.0, -2.4); sp.rotation.y = s * Math.PI / 2; g.add(sp);
  }
  C(0.022, 0.022, 0.95, frame, 0, FL + 1.18, -3.04, 0.52, 0); // centre post
  B(1.9, 0.05, 1.0, shell, 0, FL + 1.5, -2.2); B(0.42, 0.12, 0.85, panel, 0, FL + 1.42, -2.25);
  for (let i = 0; i < 12; i++) B(0.05, 0.02, 0.04, i % 6 ? black : lampA, -0.13 + (i % 4) * 0.085, FL + 1.355, -2.55 + Math.floor(i / 4) * 0.25);
  B(1.6, 0.03, 0.03, frame, 0, FL + 1.46, -2.78); // windscreen header
  // our seat (just behind the camera) and the pilot's, with the pilot in it and his controls
  for (const sx of [-0.45, 0.45]) { B(0.5, 0.08, 0.5, seat, sx, FL + 0.38, -2.0); B(0.5, 0.8, 0.1, seat, sx, FL + 0.8, -1.72); }
  C(0.018, 0.018, 0.5, metal, -0.45, FL + 0.38, -2.45, 0.2, 0); B(0.06, 0.08, 0.05, black, -0.45, FL + 0.64, -2.5);
  { const m = makeSoldierMesh('rok'); m.root.scale.setScalar(1 / 1.5); m.root.position.set(-0.45, FL + 0.05, -2.05); m.root.rotation.y = 0; poseSoldier(m, { crouch: 1, aim: 0, moving: false }, 1); g.add(m.root); }
  // a soft cabin light so the cockpit reads in the shade of the rotor
  const lamp = new THREE.PointLight(0xfff0dc, 3.2, 3.2, 1.4); lamp.position.set(0.3, FL + 1.3, -2.05); g.add(lamp); const lamp2 = new THREE.PointLight(0xd8e8ff, 1.4, 2.2, 1.5); lamp2.position.set(-0.3, FL + 0.95, -2.5); g.add(lamp2);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  // the K-M19 pod, out under the right side of the nose: a pivot that turns to where we aim
  { const pod = new THREE.Group(); pod.position.set(1.12, FL + 0.02, -2.6); pod.rotation.order = 'YXZ'; H.m.root.add(pod);
    const gm = new THREE.MeshStandardMaterial({ color: 0x2a2c2e, metalness: 0.6, roughness: 0.4 });
    const mount = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.14), gm); mount.position.y = 0.12; pod.add(mount);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.8), gm); body.position.z = -0.1; pod.add(body);
    for (const dx of [-0.05, 0.05]) { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 8), gm); br.rotation.x = Math.PI / 2; br.position.set(dx, 0, -0.95); pod.add(br); }
    const fs = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 10), gm); fs.rotation.x = Math.PI / 2; fs.position.z = -1.42; pod.add(fs);
    H.gunPod = pod; G.gunCamPod = pod; G.gunCamCockpit = g;
    const inv = new THREE.Matrix4(), d = v3(), q = new THREE.Quaternion();
    G.updaters.push((dt) => { if (!H.alive) return true; if (!(P.ride && P.ride.obj === H.m.root)) return;
      // aim direction in the helicopter's frame -> yaw/pitch of the pod (it can't turn into the fuselage or point far up)
      camera.getWorldDirection(d); H.m.root.updateMatrixWorld(); q.setFromRotationMatrix(inv.extractRotation(H.m.root.matrixWorld)).invert(); d.applyQuaternion(q);
      const yaw = clamp(Math.atan2(-d.x, -d.z), -1.4, 0.9), pitch = clamp(Math.asin(clamp(d.y, -1, 1)), -1.1, 0.25);
      pod.rotation.y += angDiff(pod.rotation.y, yaw) * Math.min(1, dt * 14); pod.rotation.x += (pitch - pod.rotation.x) * Math.min(1, dt * 14); }); }
  return g;
}
function m11Air(S, z0) {
  // our helicopter flies nose-first up the avenue, a little behind the lead tanks and well above them; smooth, no rolling or bobbing.
  // we sit in the right cockpit seat on the K-M19
  const H = new Vehicle('heli', srx(z0), z0 + 40, { team: 'ally', armed: false, invuln: true, speed: 0, bob: false }); H.m.root.scale.setScalar(1.5);
  heliCabin(H);
  G.heliT = { z: z0, follow: true, alt: 24 };
  const heading = (z) => { const fx = srx(z - 8) - srx(z + 8); return Math.atan2(-fx, 16); };
  let vx = 0, vz = 0; H.yaw = heading(H.pos.z);
  G.extMuzzle = () => H.gunPod ? H.gunPod.localToWorld(v3(0, 0, -1.3)) : H.pos.clone();
  G.updaters.push((dt) => { if (!H.alive || G.mode !== 'play') return true; const T = G.heliT;
    const tx = T.x ?? srx(H.pos.z), tz = T.z, ty = T.y ?? T.alt;
    vz = lerp(vz, clamp((tz - H.pos.z) * 0.5, -11, 11), Math.min(1, dt * 1.0)); vx = lerp(vx, clamp((tx - H.pos.x) * 0.5, -5, 5), Math.min(1, dt * 1.0));
    H.pos.z += vz * dt; H.pos.x += vx * dt; H.pos.y = lerp(H.pos.y, ty, Math.min(1, dt * 0.8)); H.vel.set(0, 0, 0);
    const wantYaw = T.yaw ?? heading(H.pos.z); H.yaw += angDiff(H.yaw, wantYaw) * Math.min(1, dt * 0.8);
    H.m.root.position.copy(H.pos); H.m.root.rotation.set(Math.max(-0.08, vz * 0.004), H.yaw, 0); // a slight, steady nose-down while moving forward
    if (P.ride && P.ride.obj === H.m.root) P.yawLim = [H.yaw, 1.25]; });
  P.ride = { obj: H.m.root, off: [0.45, -1.3, -2.2] }; // seated: eye ~1.1 (local) over the cabin floor, level with the pilot beside us P.yaw = H.yaw; P.pitch = -0.3; P.noFire = false;
  for (const w of ['rifle', 'sniper', 'pistol', 'heligl']) S.take(w); S.give('km19');
  G.hitMul = 0.35; G.heliRegen = S.every(0.5, () => { if (P.alive && P.hp < 100 && G.time - P.lastHit > 2) P.hp = Math.min(100, P.hp + 6); });
  // the armoured column below
  const colV = [];
  const addT = (x, z, k21) => { const v = k21 ? S.allyBMP(RX(x, z), z, 0, { invuln: true, speed: 9, sam: false, rpg: false }) : new Vehicle('tank', RX(x, z), z, { team: 'ally', armed: true, invuln: true, speed: 9, reload: 5, range: 120, accurate: true, color: 0x4f5539, yieldPeople: false });
    v.o.yieldPeople = false; v.o.yFn = routeY; v.path = srPathN(x, z - 4, -120); v.pi = 0; v.rank = colV.length; colV.push(v); return v; };
  addT(-5, z0); addT(5, z0 + 14, true); addT(-5, z0 + 28, true); addT(5, z0 + 42); addT(-5, z0 + 56, true);
  G.colStop = z0 - 60; G.colV = colV; G.m11H = H;
  S.every(0.25, () => { for (const v of colV) if (v.alive) v.stopped = v.pos.z < G.colStop + v.rank * 15; const al = colV.filter((v) => v.alive); G.colFront = al.length ? Math.min(...al.map((v) => v.pos.z)) : G.colStop; if (G.heliT.follow) G.heliT.z = G.colFront + 30; });
}
/* a stretch of the advance: the column halts short of the position until the guns have worked it over (or long enough has passed), then the tanks finish it */
async function m11Seg(S, stopZ, tag, label, cap = 24) {
  G.colStop = stopZ; S.obj(label); const t0 = G.time;
  await S.until(() => (aliveEnemies(tag).length <= 1 && G.colFront < stopZ + 25) || G.time - t0 > cap);
  for (const a of aliveEnemies(tag)) S.later(rand(0.2, 1.6), () => { if (!a.alive) return; const sh = (G.colV || []).find((v) => v.alive); if (sh) { const from = sh.pos.clone().add(v3(0, 3, 0)); for (let q = 0; q < 5; q++) tracer(from, a.chest(v3()), [1, 0.6, 0.3], 420); SFX.shot('mg', a.pos); } a.hurt(999, null); });
}
function m11Men(tag, n, z0, z1, o = {}) { for (let i = 0; i < n; i++) { const z = rand(z1, z0); enemy(RX(pick([-1, 1]) * rand(3, o.w ?? 16), z), z, { tag, view: 140, kind: Math.random() < 0.3 ? 'heavy' : 'rifle', crouch: Math.random() < 0.4, hold: Math.random() < 0.5 }); } }
function m11Roof(tag, pts, marked) { for (const [x0, z] of pts) { const x = RX(x0, z), y = roofAt(x, z); if (!y) continue; const a = enemy(x, z, { tag, hold: true, view: 200, acc: 1.3, y, kind: 'heavy' }); if (marked) a.marked = true; } }

/* ========== MISSION 11 「북쪽으로」 ========== */
defMission({
  id: 'm10', act: '3막 · 반격', num: '미션 12', title: '북쪽으로',
  dateText: '2032년 3월 28일 06:30', dateShort: '2032.03.28', place: '서울 · 한강대교 → 서울역 → 광화문', placeShort: '서울 탈환', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: { sky: [0x7b8ea4, 0xc0bcb0, 0xd0c4b0], glow: 0xffd2a0, glowDir: [0.7, 0.12, 0.3], fog: 0xbcbab4, fogD: 0.0011, hemi: [0xd4dae2, 0x5a5650, 0.95], sun: [0xfff0dc, 1.35], sunDir: [0.75, 0.55, 0.35], exposure: 1.0, viewDist: 900, battle: 0.5, flashes: 0.08, windSnd: 0.25 },
  loadout: { weapons: ['rifle', 'sniper', 'pistol'], nades: 4 },
  bounds: [-3600, -7400, 1400, 600],
  build(S) { hgCity({ stationDown: true, gate: 'charred' }); },
  phases: [
    /* the ride: 한강대교 → 한강대로 → 서울역 → 숭례문 → 시청 → 광화문, then down onto the plaza */
    {
      setup(S) { S.player(-30, 120, 0); },
      async run(S) {
        await hgFlight(S, { story: true });
        await S.radio('박도현 중위', '광장 확보! 독수리 2-1, 내려 줘!', { dur: 2.4 });
        G.hitMul = 1;
        const T = RT.total, LQ = HQ0 + T - 300, land = rtAt(T - 300, -30), Y = land.yaw;
        await S.cut(async () => {
          for (const a of aliveEnemies()) a.remove(); for (const v of G.vehicles) if (v.alive && v.team === 'enemy') { v.remove(); v.alive = false; }
          G.heliT.follow = false; G.heliT.z = -LQ; G.heliT.x = -30; G.heliT.land = true; G.heliT.alt = 24;
          const H = G.m11H; H.q = LQ + 60; H.d = -30; H.pos.y = 26;
          const c0 = rtAt(T - 360, -75); await S.cam(v3(c0.x, 8, c0.z), v3(land.x, 10, land.z), 0); S.camFov(55);
          await S.tween(6, (k) => { G.heliT.alt = lerp(24, 2.4, k); });
          P.ride = null; P.yawLim = null; S.take('km19'); G.extMuzzle = null; S.give('rifle');
          const pp = rtAt(T - 296, -24); S.player(pp.x, pp.z, Y);
          const sq = (s, d) => rtAt(T - 300 + s, d);
          squad(S, [['park', '박도현 중위', 2, -22], ['lee', '리선우 병장', -2, -19], ['yoon', '윤하린 중사', -3, -25], ['han', '한지운 하사', 3, -18]].map(([key, name, s, d]) => { const p = sq(s, d); return { key, name, x: p.x, z: p.z }; }));
          const f = rtAt(T - 150, -52); const fp = flagPole(f.x, f.z, 12, 'kr'); const top = fp.position.y; fp.position.y = G.groundAt(f.x, f.z) + 1.6;
          for (let i = 0; i < 18; i++) S.later(i * 0.4, () => { const a = rtAt(T - 260 + rand(-10, 10), pick([-1, 1]) * rand(24, 30)), b = rtAt(T - 160 + rand(-8, 8), -52 + rand(-8, 8)); civ(a.x, a.z, { goTo: [b.x, b.z], speed: 1.6 }); });
          const cA = rtAt(T - 200, -20); await S.cam(v3(cA.x, 2, cA.z), v3(f.x, 6, f.z), 0);
          S.music('sad');
          await S.tween(7, (k) => { fp.position.y = lerp(G.groundAt(f.x, f.z) + 1.6, top, k); });
          const cB = rtAt(T - 215, -10); await S.cam(v3(cB.x, 4, cB.z), v3(f.x, 2, f.z), 4);
          await S.say('서한준', '사람들이… 나옵니다.', { dur: 2.5 });
          await S.say('리선우 병장', '어마이도 어디메서 이 깃발 보고 계실 검다.', { dur: 3 });
          await S.say('한지운 하사', '서한준. 약속 기억하지? 작전 끝나면 노량진부터 간다. 분대 전원.', { dur: 3.4 });
          await S.say('서한준', '…예, 하사님.', { dur: 2 });
          await S.say('윤하린 중사', '소대장님, 드론에 잡혔습니다. 볼코프 부대, 북쪽으로 빠지고 있습니다.', { dur: 3.5 });
          await S.say('박도현 중위', '어디로?', { dur: 1.4 });
          await S.say('윤하린 중사', '평양 방향입니다. 대동강에 방어선을 치고 있습니다.', { dur: 3 });
          await S.say('박도현 중위', '평양부터 되찾는다. 그다음이 두만강이다.', { dur: 3.2 });
          await S.fade(1, 2.5);
        });
      },
    },
  ],
});

/* ---------------- 평양 (world for 「평양」) ---------------- */