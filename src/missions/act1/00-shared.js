/* =========================================================
   shared mission helpers + ACT 1 「국경 붕괴」
   ========================================================= */
const ENV = {
  nightSnow: { sky: [0x03060b, 0x0e141d, 0x141a22], fog: 0x10151c, fogD: 0.016, hemi: [0x6a7c9e, 0x10121a, 0.42], sun: [0x8a9cc0, 0.3], sunDir: [-0.3, 1, -0.5], stars: true, snow: 0.7, night: true, exposure: 1.2, viewDist: 45, snowGround: true, battle: 0, windSnd: 0.5 },
  overcast: { sky: [0x6b737c, 0x949ba2, 0xa2a7ab], fog: 0x9aa0a6, fogD: 0.011, hemi: [0xc6ced6, 0x5c5c58, 0.95], sun: [0xe2e8f0, 0.75], sunDir: [-0.5, 1, 0.3], snow: 0.45, snowGround: true, viewDist: 85, battle: 0.25, flashes: 0.08, windSnd: 0.4 },
  dusk: { sky: [0x2a2e3e, 0x6a5a5a, 0x7a6658], glow: 0xd06a30, glowDir: [-1, 0.05, 0.2], fog: 0x5a5458, fogD: 0.014, hemi: [0x8a8aa0, 0x302820, 0.6], sun: [0xff9a60, 0.7], sunDir: [-1, 0.25, 0.2], snow: 0.25, snowGround: true, viewDist: 50, exposure: 1.05, battle: 0.1, windSnd: 0.3 },
  blizzard: { sky: [0x8a9098, 0xa6abb0, 0xb0b4b8], fog: 0xaeb3b8, fogD: 0.026, hemi: [0xd0d6dc, 0x6a6a68, 1.0], sun: [0xe8eef4, 0.45], sunDir: [-0.4, 1, 0.5], snow: 1.8, snowFall: 3, wind: 7, snowGround: true, viewDist: 42, windSnd: 1.4, battle: 0.15 },
};
let GLOWTEX = null;
function glow(x, y, z, color = 0xffd890, size = 1.5, parent) {
  if (!GLOWTEX) GLOWTEX = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOWTEX, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  s.position.set(x, y, z); s.scale.setScalar(size); (parent || G.world).add(s); return s;
}
function firework(x, z, h = 70, col, sc = 1) {
  const p = v3(x, G.groundAt(x, z) + 2, z); const top = h + rand(-10, 10); let t = 0; const T = rand(1.3, 1.8);
  SFX.whistle(p);
  G.updaters.push((dt) => { t += dt; const k = t / T; const y = p.y + (top - p.y) * Math.sin(k * Math.PI / 2); particle({ add: true, x: p.x + Math.sin(t * 9) * 0.2, y, z: p.z, life: 0.5, size: 0.4 * sc, size1: 0.1 * sc, alpha: 0.9, color: [1, 0.8, 0.5] }); if (k >= 1) { const b = v3(p.x, y, p.z); FX.firework(b, col, sc); flashLight(b, 0xffd0a0, 25 * sc, 160 * sc, 0.6); SFX.crackle(b); SFX.boomFar(b); return true; } });
}
function convoyLights(z, from, to, n, speed = 6) {
  const cars = [];
  for (let i = 0; i < n; i++) {
    const g = new THREE.Group(); const x = from + i * 14 * Math.sign(to - from) * -1; g.position.set(x, G.groundAt(x, z), z); G.world.add(g);
    const body = new THREE.Mesh(boxGeo(2.4, 2.2, 6), mat('convoy', { color: 0x1a1c1e })); body.position.y = 1.4; body.rotation.y = Math.PI / 2; g.add(body);
    const dir = Math.sign(to - from);
    glow(dir * 3.1, 1.1, 0.8, 0xfff0c0, 4.5, g); glow(dir * 3.1, 1.1, -0.8, 0xfff0c0, 4.5, g); if (i % 3 === 0) { const L = new THREE.PointLight(0xfff0c0, 30, 26, 1.6); L.position.set(dir * 6, 1.2, 0); g.add(L); }
    cars.push(g);
  }
  G.updaters.push((dt) => { for (const g of cars) { g.position.x += Math.sign(to - from) * speed * dt; g.position.y = G.groundAt(g.position.x, z); } });
  return cars;
}
function squad(S, list) {
  for (const s of list) {
    const ex = S.sq[s.key];
    if (ex && ex.alive && G.actors.includes(ex)) { placeSq(S, s.key, s.x, s.z, s.yaw ?? ex.yaw); if (s.follow) ex.follow = { offset: s.follow }; continue; }
    const a = ally(s.x, s.z, Object.assign({ hero: true, follow: s.follow ? { offset: s.follow } : null, yaw: s.yaw ?? 0 }, s.o || {})); a.name = s.name; S.sq[s.key] = a;
  }
}
/* move a squad member: warp only while nobody can see it, otherwise walk there */
function placeSq(S, key, x, z, yaw = 0) {
  const a = S.sq[key]; if (!a) return;
  if (screenHidden() || (hiddenFromView(a.pos) && hiddenFromView(v3(x, a.pos.y, z)))) { a.pos.set(x, floorAt(x, z, G.groundAt(x, z) + 0.2), z); a.yaw = yaw; a.goal = null; a.home = a.pos.clone(); a.lastPos.copy(a.pos); }
  else { a.follow = null; a.goal = v3(x, 0, z); a.state = 'idle'; a.faceYaw = yaw; }
}
function followMode(S, keys, on = true) { const offs = [[-2.2, 2.5], [2.4, 3], [-3.5, 5], [3.5, 5.5], [0, 6]]; keys.forEach((k, i) => { const a = S.sq[k]; if (a) { a.follow = on ? { offset: offs[i % offs.length], trail: 3 + i * 2 } : null; if (on) a.hold = false; a.state = "idle"; a.goal = null; } }); }
function moveSq(S, key, x, z) { const a = S.sq[key]; if (!a) return; a.follow = null; a.goal = v3(x, 0, z); a.state = 'idle'; }
function holdAt(a, x, z) { a.follow = null; a.goal = v3(x, 0, z); a.hold = true; a.home = v3(x, 0, z); }

/* ---------------- Tumen river map ---------------- */
function tumenGround(o = {}) {
  return (x, z) => {
    const s1 = smooth(clamp((-z - 39) / 6, 0, 1)), s2 = smooth(clamp((z + 101) / 6, 0, 1));
    let y = -6 * Math.min(s1, s2);
    const away = clamp((Math.abs(z + 70) - 31) / 30, 0, 1);
    y += (Math.sin(x * 0.03) * 0.6 + Math.sin(z * 0.05 + x * 0.013) * 0.5) * away;
    if (z < -150) y += smooth(clamp((-z - 150) / 120, 0, 1)) * 14 * (0.6 + 0.4 * Math.sin(x * 0.02));
    if (o.ramps) {
      const k = 1 - smooth(clamp((Math.abs(x - 150) - 5) / 4, 0, 1));
      if (k > 0) { const r = -6 * Math.min(clamp((-z - 22) / 20, 0, 1), clamp((z + 118) / 20, 0, 1)); y = lerp(y, Math.min(y, r), k); }
    }
    return y;
  };
}
function buildTumen(o = {}) {
  G.groundAt = tumenGround(o);
  buildTerrain(900, 200, o.thaw ? 'snowdirt' : 'snow', 8, 0xffffff, 60, -60);
  if (o.thaw) {
    waterPlane(60, -70, 900, 60, -5.6, 0x26343a); G.waterY = -5.6;
    const floes = [];
    for (let i = 0; i < 40; i++) { const f = addMesh(boxGeo(rand(2, 7), 0.4, rand(2, 6), 2), mat('floe', { map: 'ice', color: 0xdfe8ee }), rand(-250, 350), -5.55, rand(-92, -48), { dynamic: true, rot: [0, rand(0, 3), 0], cast: false }); f.userData.sp = rand(0.8, 1.6); floes.push(f); }
    G.updaters.push((dt) => { for (const f of floes) { f.position.x += f.userData.sp * dt; f.rotation.y += dt * 0.02; if (f.position.x > 360) f.position.x = -260; f.position.y = -5.55 + Math.sin(G.time + f.position.x) * 0.04; } });
  } else addMesh(new THREE.PlaneGeometry(900, 60).rotateX(-Math.PI / 2), mat('ice', { map: 'ice', rough: 0.35, metal: 0.05 }), 60, -5.93, -70, { cast: false, dynamic: true });
  buildMountains(720, 40);
  for (let i = 0; i < 110; i++) { const x = rand(-300, 420), z = rand(-260, -110); if (Math.abs(x - 150) < 14 && z > -170) continue; pine(x, z, rand(1, 1.9), !o.thaw); }
  for (let i = 0; i < 50; i++) { const x = rand(-260, 420), z = rand(-10, 160); if (Math.abs(x) < 25 && z < 20) continue; if (Math.abs(x - 150) < 30 && z < 10) continue; pine(x, z, rand(0.9, 1.6), !o.thaw); }
  if (!o.noFence) { for (let x = -100; x < 135; x += 20) { fence(x, -37.6, x + 20, -37.6, 2.2); } }
}
/* bridge spanning the gorge at x, deck y=0. returns parts for collapse */
function buildBridge(x = 150) {
  const zs = [-38, -58, -72, -86, -102]; const segs = [];
  const deckM = MT.concreteD(), railM = MT.metal();
  for (let i = 0; i < 4; i++) {
    const z0 = zs[i], z1 = zs[i + 1], L = z0 - z1, cz = (z0 + z1) / 2;
    const g = new THREE.Group(); g.position.set(x, 0, cz); G.world.add(g);
    const d = new THREE.Mesh(boxGeo(10, 0.8, L, 3), deckM); d.position.y = -0.4; d.castShadow = d.receiveShadow = true; g.add(d);
    for (const s of [-1, 1]) { const r = new THREE.Mesh(boxGeo(0.2, 1.1, L, 1), railM); r.position.set(s * 4.9, 0.55, 0); g.add(r); }
    const col = addCollider(x - 5, -0.8, z1, x + 5, 0, z0, { dyn: true });
    const rl = addCollider(x - 5.1, 0, z1, x - 4.8, 1.1, z0, { dyn: true, bullet: false }), rr = addCollider(x + 4.8, 0, z1, x + 5.1, 1.1, z0, { dyn: true, bullet: false });
    segs.push({ g, cols: [col, rl, rr], z0, z1 });
  }
  const piers = [];
  for (const z of [-58, -72, -86]) { const p = new THREE.Mesh(boxGeo(6, 5.6, 2.4, 2), MT.concrete()); p.position.set(x, -3.6, z); p.castShadow = true; G.world.add(p); piers.push(p); addCollider(x - 3, -6.5, z - 1.2, x + 3, -0.8, z + 1.2, { dyn: true }); }
  return { segs, piers, x };
}
function removeCols(cols) { for (const c of cols) { const i = G.dyn.indexOf(c); if (i >= 0) G.dyn.splice(i, 1); } }
function onBridgeY(br) { return (x, z) => { for (const s of br.segs) if (!s.down && z <= s.z0 && z >= s.z1 && Math.abs(x - br.x) < 5) return 0; return G.groundAt(x, z); }; }

/* ========== PROLOGUE 「0시」 ========== */