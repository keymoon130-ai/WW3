/* ---------- the route north of 신용산: straight legs joined by easy curves (real bearings, 한강대로 → 세종대로) ----------
   game yaw: 0 runs up -z like the avenue so far; + turns left (west). Real bearing b → yaw = 34° - b. */
const RT = { z0: -2160, R: 140, legs: [[320, 1.5, '삼각지'], [1100, 39, '숙대입구'], [955, 30, '서울역'], [896, 19, '숭례문'], [430, 17, '시청'], [1280, 34, '광화문']] };
function rtInit() {
  if (RT.X) return;
  const L = RT.legs, hs = L.map((l) => l[1] * Math.PI / 180), V = []; let acc = 0; for (const l of L) { acc += l[0]; V.push(acc); }
  RT.total = acc; RT.V = V; RT.junc0 = V[0]; RT.sSta = V[2] + 250; // the old station stands 250 m north of the 4호선 platforms where the avenue bends toward 숭례문
  const head = (s) => { let h = hs[0]; for (let i = 0; i < L.length - 1; i++) { const w = Math.max(24, RT.R * Math.abs(hs[i + 1] - hs[i])), a = V[i] - w / 2; if (s >= a + w) { h = hs[i + 1]; continue; } if (s > a) h = hs[i] + (hs[i + 1] - hs[i]) * (s - a) / w; break; } return h; };
  const n = Math.ceil(acc) + 1; RT.X = new Float32Array(n); RT.Z = new Float32Array(n); RT.Y = new Float32Array(n);
  let x = 0, z = RT.z0; for (let i = 0; i < n; i++) { const h = head(i); RT.X[i] = x; RT.Z[i] = z; RT.Y[i] = h; const hm = head(i + 0.5); x -= Math.sin(hm); z -= Math.cos(hm); }
}
/* a point s metres along the route, d metres to its right (east, at first); yaw is the heading there */
function rtAt(s, d = 0) {
  rtInit(); if (s < 0) return { x: d, z: RT.z0 - s, yaw: 0 };
  if (s > RT.X.length - 1.001) { const e = rtAt(RT.X.length - 1.001), k = s - (RT.X.length - 1.001); return { x: e.x - Math.sin(e.yaw) * k + Math.cos(e.yaw) * d, z: e.z - Math.cos(e.yaw) * k - Math.sin(e.yaw) * d, yaw: e.yaw }; }
  const f = Math.min(s, RT.X.length - 1.001), i = Math.floor(f), t = f - i; const x = RT.X[i] + (RT.X[i + 1] - RT.X[i]) * t, z = RT.Z[i] + (RT.Z[i + 1] - RT.Z[i]) * t, yaw = RT.Y[i] + (RT.Y[i + 1] - RT.Y[i]) * t;
  return { x: x + Math.cos(yaw) * d, z: z - Math.sin(yaw) * d, yaw };
}
function hgBars(list, w, m, o = {}) { // list: [ax, ay, az, bx, by, bz]; boxes stretched between the two points
  if (!list.length) return; const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), m, list.length); const d = new THREE.Object3D(), a = v3(), b = v3();
  list.forEach((L, i) => { a.set(L[0], L[1], L[2]); b.set(L[3], L[4], L[5]); d.position.copy(a).add(b).multiplyScalar(0.5); d.scale.set(L[6] ?? w, L[7] ?? w, a.distanceTo(b) + (L[8] ?? 0)); d.lookAt(b); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
  im.castShadow = o.cast ?? true; im.receiveShadow = true; (HGR || G.world).add(im); return im;
}
function hgRailway() {
  if (!HRT) hrBuild();
  const steel = hgMat('rsteel', { color: 0x4f5a5e, rough: 0.6, metal: 0.45 }), steelD = hgMat('rsteelD', { color: 0x3c4448, rough: 0.65, metal: 0.4 }), conc = hgMat('pier', { color: 0xa9a7a1, map: 'concrete', rough: 0.95 });
  const ballast = hgMat('ballast', { color: 0x7a746a, map: 'concrete', rough: 1 }), sleeperM = hgMat('sleeper', { color: 0x8c8a84, rough: 0.9 }), railM = hgMat('rail', { color: 0x6a6460, rough: 0.35, metal: 0.8 });
  const y0 = HR.deck, H = 9.2, half = 5.6;
  const bars = [], chords = [], laterals = [], gird = [];
  for (const x of HR.xs) {
    // the ten truss spans: two Warren trusses per bridge, portal and top bracing, floor beams
    for (let k = 0; k < 10; k++) { const za = HR.z0 - k * 62.5, zb = za - 62.5, pl = 62.5 / 7;
      for (const s of [-1, 1]) { const xs = x + s * half;
        chords.push([xs, y0, za, xs, y0, zb, 0.55, 0.7]); chords.push([xs, y0 + H, za - pl / 2, xs, y0 + H, zb + pl / 2, 0.6, 0.6]);
        for (let p = 0; p < 7; p++) { const zl = za - p * pl, zr = zl - pl, zt = zl - pl / 2; bars.push([xs, y0, zl, xs, y0 + H, zt]); bars.push([xs, y0 + H, zt, xs, y0, zr]); }
      }
      for (let p = 0; p < 7; p++) { const zt = za - p * pl - pl / 2; laterals.push([x - half, y0 + H, zt, x + half, y0 + H, zt]); if (p < 6) { const zn = zt - pl; laterals.push([x - half, y0 + H, zt, x + half, y0 + H, zn]); } }
      for (let p = 0; p <= 7; p++) laterals.push([x - half, y0 - 0.3, za - p * pl, x + half, y0 - 0.3, za - p * pl, 0.4, 0.8]);
      // pier under each joint: masonry with rounded cutwaters
      { const yb = HG.water - 4, yt = y0 - 1.05, ph = yt - yb, pc = (yt + yb) / 2; hgMesh(new THREE.BoxGeometry(12.5, ph, 3.4), conc, x, pc, za); for (const s of [-1, 1]) { hgMesh(new THREE.CylinderGeometry(1.7, 1.7, ph, 14), conc, x + s * 6.25, pc, za); hgMesh(new THREE.BoxGeometry(1.2, 0.4, 1.4), steelD, x + s * half, yt + 0.2, za); } hgMesh(new THREE.BoxGeometry(13.2, 0.5, 3.8), conc, x, yt - 0.25, za); }
    }
    // the plate-girder spans on to the north bank: two deep girders, floor, piers every ~23 m
    for (const s of [-1, 1]) gird.push([x + s * 2.6, y0 - 1.2, HR.zT, x + s * 2.6, y0 - 1.2, HR.z1, 0.35, 2.4]);
    for (let z = HR.zT; z >= HR.z1; z -= 485 / 21) { const base = hgGround(x, z) > -10.5 ? hgGround(x, z) : HG.water - 3; hgMesh(new THREE.BoxGeometry(8.5, y0 - 2.4 - base, 2.6), conc, x, (y0 - 2.4 + base) / 2, z); }
    // deck slab across the whole bridge
    hgMesh(new THREE.BoxGeometry(10.4, 0.5, HR.z0 - HR.z1), steelD, x, y0 - 0.55, (HR.z0 + HR.z1) / 2, { cast: false });
  }
  hgBars(bars, 0.42, steel); hgBars(chords, 1, steel); hgBars(laterals, 0.28, steel, { cast: false }); hgBars(gird, 1, steelD);
  // track: ballast, sleepers every 0.6 m, rails — on the bridges and on the approaches into the stations.
  // north of 강변북로 the line swings away from 한강대로 (hrOff) so that it runs in under 용산역, 250–290 m west of the avenue
  const tracks = []; for (const x of HR.xs) for (const t of [-2.05, 2.05]) tracks.push(x + t);
  const zs = [HR.south, HRB.z]; for (let z = HRB.z - 20; z > HR.north; z -= 20) zs.push(z); zs.push(HR.north);
  const along = (fn) => { for (let i = 0; i < zs.length - 1; i++) fn(zs[i], zs[i + 1], hrOff(zs[i]), hrOff(zs[i + 1])); };
  const slp = [], rails = [], ball = [];
  for (const tx of tracks) {
    along((za, zb, oa, ob) => { ball.push([hrX(tx, za), y0 - 0.15, za, hrX(tx, zb), y0 - 0.15, zb, 3.2, 0.3, 0.3]); for (const r of [-0.75, 0.75]) rails.push([hrX(tx + r, za), y0 + 0.24, za, hrX(tx + r, zb), y0 + 0.24, zb, 0.07, 0.16, 0.02]); });
    for (let z = HR.south; z > HR.north; z -= 0.6) slp.push([hrX(tx, z), y0 + 0.07, z, hrYaw(z)]);
  }
  hgBars(ball, 1, ballast, { cast: false }); hgInst(new THREE.BoxGeometry(2.4, 0.16, 0.24), sleeperM, slp, { cast: false }); hgBars(rails, 1, railM, { cast: false });
  // catenary: masts (on the trusses the wires hang from the portals), contact and messenger wires over every track
  const masts = [], arms = [], wires = [];
  for (let z = HR.south - 10; z > HR.north; z -= 50) { const onTruss = z < HR.z0 && z > HR.zT; if (onTruss) continue; const o = hrOff(z);
    for (const x of HR.xs) { masts.push([hrX(x - half - 0.4, z), y0 + 4, z]); arms.push([hrX(x - half - 0.4, z), y0 + 7.4, z, hrX(x + half - 0.4, z), y0 + 7.4, z]); } }
  for (const tx of tracks) along((za, zb, oa, ob) => { wires.push([hrX(tx, za), y0 + 5.6, za, hrX(tx, zb), y0 + 5.6, zb, 0.03, 0.03]); wires.push([hrX(tx, za), y0 + 6.9, za, hrX(tx, zb), y0 + 6.9, zb, 0.025, 0.025]); });
  hgInst(new THREE.BoxGeometry(0.35, 8, 0.35), steelD, masts); hgBars(arms, 0.22, steelD); hgBars(wires, 1, hgMat('wire', { color: 0x2a2826, rough: 0.5, metal: 0.6 }), { cast: false });
  // embankments carrying the line through the city on either side, with a wall on each flank
  { const bed = hgMat('railbed', { color: 0x8a8478, map: 'concrete' }), emb = [], walls = [];
    emb.push([-143.5, (y0 + 0.3) / 2 - 0.3, HR.south, -143.5, (y0 + 0.3) / 2 - 0.3, HR.z0, 64, y0 + 0.3]);
    for (const sx of [-1, 1]) { walls.push([-143.5 + sx * 32, 1.1, HR.south, -143.5 + sx * 32, 1.1, HR.z0, 0.4, 2.2]); addCollider(-143.5 + sx * 32 - 0.2, 0, HR.z0, -143.5 + sx * 32 + 0.2, 2.2, HR.south, {}); }
    const zn = [HR.z1]; for (const z of zs) if (z < HR.z1) zn.push(z);
    for (let i = 0; i < zn.length - 1; i++) { const za = zn[i], zb = zn[i + 1], oa = hrOff(za), ob = hrOff(zb);
      emb.push([hrX(-143.5, za), (y0 + 0.3) / 2 - 0.3, za, hrX(-143.5, zb), (y0 + 0.3) / 2 - 0.3, zb, 64, y0 + 0.3, 0.6]);
      for (const sx of [-1, 1]) walls.push([hrX(-143.5 + sx * 32, za), 1.1, za, hrX(-143.5 + sx * 32, zb), 1.1, zb, 0.4, 2.2, 0.4]); }
    for (let z = HR.z1; z > HR.north; z -= 6) for (const sx of [-1, 1]) { const a = hrX(-143.5 + sx * 32, z), b = hrX(-143.5 + sx * 32, z - 6); addCollider(Math.min(a, b) - 0.2, 0, z - 6, Math.max(a, b) + 0.2, 2.2, z, {}); }
    hgBars(emb, 1, bed, { cast: false }); hgBars(walls, 1, conc); }
  // 노량진역 and 용산역: island platforms between the lines, canopies (용산역's run on in under the station building)
  const plat = hgMat('rplat', { color: 0xb8b2a6, map: 'concrete' }), roofM = hgMat('rroof', { color: 0x9aa0a4, rough: 0.5, metal: 0.4 }), col = hgMat('rcol', { color: 0x6a7074, rough: 0.5, metal: 0.5 });
  { const pl = [], rf = [], cols = [], pr = [];
    // 노량진: four double tracks; island platforms in the three gaps between them (7.6 m, high-level), and along the westmost track —
    // the line farthest from the street — the one low-level side platform, the 경부선 one. Nothing on a platform comes within 1.65 m of a track centre.
    // 용산 keeps its platforms on the line centres. The canopies stop where the 노량진 concourse and its stairs come down (z 336–394).
    const lay = { ny: [[-128.5, 7.6, 1.1], [-143.5, 7.6, 1.1], [-158.5, 7.6, 1.1], [-172.6, 5.8, 0.6]], ys: HR.xs.map((x) => [x, 3.4, 1.1]) };
    for (const [z0, z1, key] of [[420, 230, 'ny'], [-1600, -1880, 'ys']]) { for (let z = z0; z > z1; z -= 20) { const za = z, zb = Math.max(z - 20, z1);
        for (const [x, w, top] of lay[key]) { pl.push([hrX(x, za), y0 + top / 2, za, hrX(x, zb), y0 + top / 2, zb, w, top]);
          if (za < z0 - 10 && zb > z1 + 10 && !(key === 'ny' && za > 336 && zb < 394)) { const rw = Math.min(5.5, w - 0.6); rf.push([hrX(x, za), y0 + top + 3.5, za, hrX(x, zb), y0 + top + 3.5, zb, rw, 0.15]);
            // the steel under the roof sheet: a spine girder and cross purlins every 2.5 m
            rf.push([hrX(x, za), y0 + top + 3.25, za, hrX(x, zb), y0 + top + 3.25, zb, 0.3, 0.4]); for (let zz = za; zz > zb; zz -= 2.5) { const xc = hrX(x, zz); pr.push([xc - rw / 2, y0 + top + 3.35, zz, xc + rw / 2, y0 + top + 3.35, zz, 0.12, 0.22]); } } } }
      for (let z = z1 + 12; z < z0 - 12; z += 14) for (const [x, , top] of lay[key]) if (!(key === 'ny' && z > 336 && z < 394)) cols.push([hrX(x, z), y0 + top + 1.75, z]); }
    hgBars(pl, 1, plat, { cast: false }); hgBars(rf, 1, roofM); hgBars(pr, 1, col, { cast: false }); hgInst(new THREE.CylinderGeometry(0.14, 0.14, 3.5, 8), col, cols, { cast: false });
    // the platforms are solid: you can stand on them and climb onto them only where a person could
    for (const [x, w, top] of lay.ny) addCollider(x - w / 2, 0, 230, x + w / 2, y0 + top, 420, {}); }
  // trains removed (quality) — hgTrain(); hgMugunghwa();
}
/* Korail 312000-series EMU (1호선), ten cars of 19.5 m, stopped on the second bridge: unpainted stainless with the navy/sky-blue band,
   four doors a side, roof air-conditioners, single-arm pantographs on the motor cars. Two cars in the middle burnt out, one off its bogies. */
function hgTrain() {
  const tx = HR.xs[1] - 2.05, zFront = -612, L = 19.5, gap = 0.9, ry = HR.deck + 0.24;
  const ss = hgMat('sts', { color: 0xc6c9cb, rough: 0.32, metal: 0.75 }), ssD = hgMat('stsD', { color: 0x9a9ea0, rough: 0.4, metal: 0.7 });
  const navy = hgMat('navy', { color: 0x16357a, rough: 0.5 }), sky = hgMat('sky', { color: 0x38a6e0, rough: 0.5 }), glassM = hgMat('tglass', { color: 0x1c2428, rough: 0.12, metal: 0.4 });
  const burnt = hgMat('burnt', { color: 0x26221e, rough: 1 }), rust = hgMat('rustT', { color: 0x5a3a26, rough: 1 }), under = hgMat('under', { color: 0x2a2b2c, rough: 0.8, metal: 0.3 }), bog = hgMat('bogie', { color: 0x333436, rough: 0.6, metal: 0.5 });
  const facesT = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#111'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffb030'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center'; g.fillText('1  신창', w / 2, 44); });
  const destM = new THREE.MeshBasicMaterial({ map: facesT, toneMapped: false });
  const doorsX = [-6.9, -2.3, 2.3, 6.9]; // door centres along the car (4 a side, ~1.3 m wide)
  for (let c = 0; c < 10; c++) {
    const z = zFront - c * (L + gap) - L / 2, cab = c === 0 || c === 9, motor = [1, 2, 4, 7, 8].includes(c), wreck = c === 4 || c === 5, tilt = c === 5;
    const grp = new THREE.Group(); grp.position.set(tx, ry, z); if (tilt) { grp.rotation.z = 0.09; grp.position.x += 0.35; grp.position.y -= 0.25; } G.world.add(grp);
    const B = (w, h, d, m, x, y, zz, rx = 0) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, zz); me.rotation.x = rx; me.castShadow = true; me.receiveShadow = true; grp.add(me); return me; };
    const skin = wreck ? burnt : ss;
    // body: floor at 1.15 m above the rail, 3.12 m wide, roof at 3.8 m; a slight tumblehome is left out, the corrugated lower side is a darker strip
    B(3.12, 2.3, L, skin, 0, 1.15 + 1.15, 0); B(3.0, 0.35, L - 0.2, wreck ? burnt : ssD, 0, 3.62, 0);
    if (!wreck) for (const sx of [-1, 1]) { B(0.02, 0.5, L - 0.3, ssD, sx * 1.565, 1.55, 0); }
    // windows band and doors on both sides
    for (const sx of [-1, 1]) {
      for (let k = 0; k < 5; k++) { const zz = -8.9 + k * 4.55 + (k === 0 ? 0.4 : 0) - (k === 4 ? 0.4 : 0); if (k === 0 && cab) continue; B(0.03, 0.95, 2.4, wreck ? hgMat('hole', { color: 0x050505 }) : glassM, sx * 1.57, 2.55, zz); }
      for (const dz of doorsX) { B(0.04, 1.95, 1.3, wreck ? rust : ssD, sx * 1.575, 2.15, dz); B(0.045, 0.8, 0.5, wreck ? hgMat('hole', { color: 0x050505 }) : glassM, sx * 1.578, 2.6, dz - 0.3); B(0.045, 0.8, 0.5, wreck ? hgMat('hole', { color: 0x050505 }) : glassM, sx * 1.578, 2.6, dz + 0.3);
        if (!wreck) { B(0.05, 1.95, 0.08, sky, sx * 1.58, 2.15, dz - 0.66); B(0.05, 1.95, 0.08, sky, sx * 1.58, 2.15, dz + 0.66); } }
      if (!wreck) { B(0.03, 0.12, L - 0.3, navy, sx * 1.572, 1.92, 0); B(0.03, 0.07, L - 0.3, sky, sx * 1.572, 1.8, 0); }
    }
    // roof: two air-conditioning units, a pantograph on motor cars (raised to the wire)
    if (!wreck) { for (const dz of [-5.5, 5.5]) B(2.2, 0.38, 3.6, ssD, 0, 3.98, dz); }
    if (motor && !wreck) { B(1.4, 0.12, 1.2, under, 0, 3.86, 0); const arm = B(0.08, 0.08, 2.1, under, 0, 4.7, 0.2, -0.9); const arm2 = B(0.06, 0.06, 1.9, under, 0, 5.4, -0.5, 0.7); B(1.6, 0.08, 0.12, metal_(), 0, 5.6 - 0.38 + 0.4, -0.9); void arm; void arm2; }
    // underframe equipment and two bogies (four wheels each) sitting on the rails
    B(2.6, 0.55, L - 6, under, 0, 0.85, 0);
    for (const bz of [-L / 2 + 2.6, L / 2 - 2.6]) { B(2.3, 0.45, 2.6, bog, 0, 0.55, bz); for (const wz of [-1.05, 1.05]) for (const wx of [-0.75, 0.75]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.14, 16), bog); wh.rotation.z = Math.PI / 2; wh.position.set(wx, 0.43, bz + wz); grp.add(wh); } }
    // gangway bellows to the next car
    if (c < 9) B(1.6, 2.2, gap + 0.2, under, 0, 2.3, -L / 2 - gap / 2);
    // cab: raked front, black glazed upper face, slanted headlight strips, destination display
    if (cab) { const f = c === 0 ? -1 : 1, fz = f * L / 2;
      B(3.12, 1.2, 0.5, ss, 0, 1.75, fz + f * 0.2); B(3.1, 1.55, 0.35, glassM, 0, 2.95, fz + f * 0.12, f * -0.18);
      for (const sx of [-1, 1]) { const hl = B(0.7, 0.1, 0.06, hgMat('hlamp', { color: 0xfff6e0, emissive: 0xfff0c0, ei: 1.2 }), sx * 0.95, 1.95, fz + f * 0.47); hl.rotation.z = sx * 0.18; }
      B(3.12, 0.12, 0.06, navy, 0, 1.55, fz + f * 0.46); B(3.12, 0.07, 0.06, sky, 0, 1.43, fz + f * 0.46);
      const dm = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.3), destM); dm.position.set(0, 3.45, fz + f * 0.31); if (f > 0) dm.rotation.y = Math.PI; grp.add(dm); }
    if (wreck) { addEmitter(v3(tx, ry + 3.6, z), 'smoke', c === 4 ? 2.4 : 1.6, 2); if (c === 4) addEmitter(v3(tx + 1.2, ry + 2.2, z + 3), 'fire', 1, 10); }
  }
  function metal_() { return hgMat('pantoH', { color: 0x8a8c8e, rough: 0.35, metal: 0.8 }); }
}

/* 무궁화호 on the third bridge, abandoned heading south: a Korail 7400-class diesel (GT26CW-2 family: hood unit, 20.8 m, 3.13 m wide,
   4.25 m high, two three-axle trucks), the generator car behind it, six coaches. Engine and generator car intact; the last two coaches burnt,
   the very last one off the rails. */
function hgMugunghwa() {
  const tx = HR.xs[2] - 2.05, ry = HR.deck + 0.24, zLoco = -600;
  const wht = hgMat('mgW', { color: 0xe2e4e2, rough: 0.55, metal: 0.15 }), blue = hgMat('mgB', { color: 0x1d4c9c, rough: 0.5, metal: 0.15 }), red = hgMat('mgR', { color: 0xc8302a, rough: 0.5 });
  const grey = hgMat('mgG', { color: 0x5a5e62, rough: 0.6, metal: 0.3 }), dark = hgMat('mgD', { color: 0x252729, rough: 0.7, metal: 0.3 }), glassM = hgMat('tglass', { color: 0x1c2428, rough: 0.12, metal: 0.4 });
  const burnt = hgMat('burnt', { color: 0x26221e, rough: 1 }), hole = hgMat('hole', { color: 0x050505 }), rail = hgMat('handrail', { color: 0xd8c040, rough: 0.5, metal: 0.4 });
  const mkGrp = (z, tilt = 0) => { const g = new THREE.Group(); g.position.set(tx, ry, z); if (tilt) { g.rotation.z = tilt; g.rotation.y = tilt * 0.6; g.position.x -= 0.5; g.position.y -= 0.3; } G.world.add(g); return g; };
  const box = (g, w, h, d, m, x, y, z, rx = 0, ry_ = 0, rz = 0) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.rotation.set(rx, ry_, rz); me.castShadow = true; me.receiveShadow = true; g.add(me); return me; };
  const cyl = (g, r, h, m, x, y, z, rz = 0, rx = 0) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), m); me.position.set(x, y, z); me.rotation.set(rx, 0, rz); me.castShadow = true; g.add(me); return me; };
  const truck = (g, z, axles) => { box(g, 2.5, 0.55, axles === 3 ? 4.1 : 2.6, dark, 0, 0.62, z); for (let a = 0; a < axles; a++) { const az = z + (a - (axles - 1) / 2) * (axles === 3 ? 1.75 : 2.1); for (const sx of [-0.75, 0.75]) cyl(g, 0.5, 0.14, dark, sx, 0.5, az, Math.PI / 2); } };
  // --- the locomotive (Korail livery as on 7467/7480): red cab and end caps with a white band over blue; light grey long hood with a blue
  //     roof; blue frame, walkway rails and pilots with yellow-black hazard stripes; dark trucks and fuel tank. Front (short hood) to the south, +z ---
  { const g = mkGrp(zLoco), L = 20.8;
    const R_ = hgMat('k7R', { color: 0xd8382c, rough: 0.5, metal: 0.1 }), W_ = hgMat('k7W', { color: 0xeeeeea, rough: 0.5 }), B_ = hgMat('k7B', { color: 0x2456b4, rough: 0.5, metal: 0.1 });
    const S_ = hgMat('k7S', { color: 0xb9bec2, rough: 0.45, metal: 0.35 }), Y_ = hgMat('k7Y', { color: 0xf0b020, rough: 0.6 }), K_ = hgMat('k7K', { color: 0x1c1d1e, rough: 0.7, metal: 0.3 });
    // frame and walkway: blue sill all the way round
    box(g, 3.13, 0.42, L - 1.0, B_, 0, 1.12, 0); box(g, 3.0, 0.12, L - 1.0, K_, 0, 1.39, 0);
    // fuel tank between the trucks, the two three-axle trucks
    { const ft = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 6.2, 18), K_); ft.rotation.x = Math.PI / 2; ft.scale.x = 1.5; ft.position.set(0, 0.62, 0); g.add(ft); }
    truck(g, 6.6, 3); truck(g, -6.6, 3);
    // long hood: grey body, blue roof cap, louvred engine-room doors, radiator fans and the exhaust on top
    box(g, 2.3, 2.15, 15.1, S_, 0, 2.55, -1.15); box(g, 2.32, 0.42, 15.1, B_, 0, 3.82, -1.15);
    for (const sx of [-1, 1]) for (let i = 0; i < 8; i++) { box(g, 0.025, 1.5, 1.05, hgMat('k7S2', { color: 0xa6abb0, rough: 0.5, metal: 0.3 }), sx * 1.165, 2.45, -7.9 + i * 1.35); for (let k = 0; k < 5; k++) box(g, 0.03, 0.04, 0.9, K_, sx * 1.17, 2.0 + k * 0.22, -7.9 + i * 1.35); }
    for (let i = 0; i < 3; i++) { cyl(g, 0.58, 0.1, K_, 0, 4.06, -7.4 + i * 1.6); cyl(g, 0.6, 0.04, S_, 0, 4.12, -7.4 + i * 1.6); }
    box(g, 0.7, 0.35, 0.9, K_, 0, 4.15, -1.4);
    // rear end of the long hood: red cap, white band, blue below, number board, lamps
    { const cap = new THREE.Mesh(sideExtrude([[-10.0, 2.68], [-10.0, 3.55], [-9.55, 3.97], [-8.7, 3.97], [-8.7, 2.68]], 2.32, 0.03), R_); cap.castShadow = true; g.add(cap); } box(g, 2.33, 0.4, 1.31, W_, 0, 2.48, -9.35); box(g, 2.32, 0.8, 1.3, B_, 0, 1.88, -9.35);
    for (const sx of [-0.6, 0.6]) box(g, 0.5, 0.18, 0.04, K_, sx, 3.76, -9.8, 0.94); cyl(g, 0.11, 0.06, hgMat('hlamp', { color: 0xfff6e0, emissive: 0xfff0c0, ei: 1.2 }), 0, 3.76, -9.8, 0, -Math.PI / 2 + 0.94);
    // cab at the very front, full width and flat-faced (no short hood): blue lower, white band, red upper with two front and two corner windows;
    // number boards either side of the stacked headlights along the top edge, horns on the roof
    box(g, 3.05, 0.85, 3.0, B_, 0, 1.875, 7.9); box(g, 3.06, 0.42, 3.01, W_, 0, 2.51, 7.9); { const cab = new THREE.Mesh(sideExtrude([[9.4, 2.72], [9.4, 3.8], [8.8, 4.22], [6.4, 4.22], [6.4, 2.72]], 3.05, 0.03), R_); cab.castShadow = true; g.add(cab); } // red upper cab: the top of the face slopes back to the roof
    for (const sx of [-0.48, 0.48]) box(g, 0.82, 0.55, 0.04, glassM, sx, 3.42, 9.46);
    for (const sx of [-1, 1]) { box(g, 0.36, 0.55, 0.04, glassM, sx * 1.3, 3.42, 9.46); box(g, 0.04, 0.55, 0.9, glassM, sx * 1.56, 3.42, 8.6); }
    // number boards and the stacked headlights sit on that sloped band
    for (const sx of [-0.72, 0.72]) box(g, 0.55, 0.2, 0.05, K_, sx, 4.05, 9.17, -0.94);
    for (const dz of [0, -0.22]) cyl(g, 0.1, 0.06, hgMat('hlamp', { color: 0xfff6e0, emissive: 0xfff0c0, ei: 1.2 }), 0, 4.0 - dz * 0.7, 9.19 + dz, 0, Math.PI / 2 - 0.94);
    box(g, 0.9, 0.22, 0.35, R_, 0, 4.25, 8.9); for (const sx of [-0.25, 0, 0.25]) cyl(g, 0.08, 0.3, K_, sx, 4.45, 8.9, Math.PI / 2);
    for (const sx of [-0.8, 0.8]) box(g, 0.2, 0.14, 0.04, hgMat('mkLamp', { color: 0xfff0d0, emissive: 0x806040, ei: 0.6 }), sx, 2.0, 9.43);
    // pilots front and rear: blue with a yellow-black hazard strip, coupler, hoses
    for (const f of [1, -1]) { const pz = f * (L / 2 - 0.15); box(g, 3.1, 0.7, 0.25, B_, 0, 0.95, pz); for (let k = 0; k < 8; k++) box(g, 0.36, 0.2, 0.04, k % 2 ? K_ : Y_, -1.3 + k * 0.37, 0.7, pz + f * 0.14); box(g, 0.35, 0.3, 0.5, K_, 0, 1.05, pz + f * 0.3); }
    // walkway handrails and stanchions (blue), steps at the corners
    for (const sx of [-1, 1]) { box(g, 0.05, 0.05, L - 2.6, B_, sx * 1.5, 2.35, -1.6); for (let i = 0; i < 9; i++) box(g, 0.045, 0.95, 0.045, B_, sx * 1.5, 1.9, -9.6 + i * 2.15); for (const f of [1, -1]) box(g, 0.6, 0.06, 0.4, K_, sx * 1.25, 0.65, f * (L / 2 - 0.6)); }
    for (const f of [1, -1]) box(g, 3.0, 0.05, 0.05, B_, 0, 2.35, f * (L / 2 - 0.4));
  }
  // --- generator car and six coaches, 23.5 m each ---
  const CL = 23.5, gap = 0.9; let z = zLoco - 20.8 / 2 - gap - CL / 2;
  for (let c = 0; c < 7; c++, z -= CL + gap) {
    const gen = c === 0, wreck = c >= 5, off = c === 6;
    const g = mkGrp(z, off ? 0.13 : 0); const skin = wreck ? burnt : wht;
    box(g, 3.2, 2.75, CL, skin, 0, 2.55, 0); // body, floor at ~1.2 m
    { const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, CL, 18, 1, false, -Math.PI / 2, Math.PI), wreck ? burnt : hgMat('mgRoof', { color: 0x8a8e90, rough: 0.6, metal: 0.3 })); roof.rotation.x = Math.PI / 2; roof.scale.set(1, 1, 0.22); roof.position.y = 3.92; roof.castShadow = true; g.add(roof); }
    if (!wreck) for (const sx of [-1, 1]) { box(g, 0.03, 0.14, CL - 0.4, red, sx * 1.605, 1.92, 0); box(g, 0.03, 0.05, CL - 0.4, blue, sx * 1.605, 1.79, 0); }
    if (gen) { for (const sx of [-1, 1]) { for (let i = 0; i < 7; i++) box(g, 0.04, 1.2, 1.8, grey, sx * 1.61, 2.6, -8.4 + i * 2.8); box(g, 0.04, 0.5, 0.9, glassM, sx * 1.61, 3.1, 10.2); }
      for (const dz of [-6, 0, 6]) { cyl(g, 0.22, 0.6, dark, 0, 4.15, dz); } box(g, 2.0, 0.3, 4, grey, 0, 4.0, 3); }
    else for (const sx of [-1, 1]) {
      for (let i = 0; i < 14; i++) box(g, 0.035, 0.85, 1.05, wreck ? hole : glassM, sx * 1.61, 2.75, -8.6 + i * 1.32);
      for (const dz of [-CL / 2 + 1.0, CL / 2 - 1.0]) { const open = !wreck && Math.random() < 0.6; box(g, 0.05, 1.95, 0.85, open ? hole : (wreck ? burnt : hgMat('mgDoor', { color: 0xb8bcbc, rough: 0.5, metal: 0.3 })), sx * 1.61, 2.2, dz); }
    }
    box(g, 2.6, 0.5, CL - 5, dark, 0, 0.95, 0); // underframe
    truck(g, CL / 2 - 3, 2); truck(g, -CL / 2 + 3, 2);
    if (c < 6) box(g, 1.5, 2.2, gap + 0.2, dark, 0, 2.4, -CL / 2 - gap / 2);
    if (wreck) { addEmitter(v3(tx, ry + 4, z), 'smoke', c === 5 ? 2 : 1.4, 2); if (c === 6) addEmitter(v3(tx - 1.4, ry + 2.5, z - 4), 'fire', 1, 8); }
  }
  // what the passengers left behind beside the train: suitcases and bags along the track
  const bagM = [hgMat('bag1', { color: 0x2a3a5a, rough: 0.8 }), hgMat('bag2', { color: 0x6a2a2a, rough: 0.8 }), hgMat('bag3', { color: 0x3a3a34, rough: 0.9 })];
  for (let i = 0; i < 26; i++) { const bz = rand(-790, -620), bx = tx + pick([-1, 1]) * rand(1.9, 2.6); hgMesh(new THREE.BoxGeometry(rand(0.35, 0.6), rand(0.25, 0.5), rand(0.45, 0.75)), pick(bagM), bx, ry + 0.25, bz, { ry: rand(0, TAU), dyn: true }); }
}
