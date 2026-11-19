/* ---------------- boot ---------------- */
addEventListener('unhandledrejection', (e) => { if (e.reason instanceof Abort) e.preventDefault(); });
bindMenus();
resize();
addEventListener('resize', resize);
if (matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches) $('touchNote').hidden = false;
buildMenuScene();
addEventListener('pointerdown', () => { if (!AU.ctx) { initAudio(); } if (G.mode === 'menu') playMusic('title'); }, { once: false });
requestAnimationFrame(loop);
if (window.__SAMPLE) hgSampleMenu();
window.__T = { G, P, SET, MISSIONS, startMission, toMenu, camera, renderer, fps: () => fpsEl.v, aliveEnemies, WD, MS, explode, v3, giveWeapon };
/* test autopilot (dev only): advances the simulation without rendering */
window.__T.auto = async (maxSteps = 20000, dt = 1 / 30) => {
  G.testMode = true; const log = []; let lastObj = '';
  for (let i = 0; i < maxSteps; i++) {
    if (G.mode !== 'play') { log.push('MODE ' + G.mode + ' @' + G.time.toFixed(0)); break; }
    if (G.paused) { log.push('PAUSED @' + G.time.toFixed(0) + ' ' + $('failTip').textContent); break; }
    P.hp = 100; P.god = true;
    const o = $('objText').textContent; if (o !== lastObj) { lastObj = o; log.push(G.time.toFixed(0) + 's ' + o); }
    if (!G.cut && !P.ride) {
      if (G.interactables.length && i % 15 === 0) { const it = G.interactables.find((x) => x.once !== false) || null; if (it) { P.pos.set(it.pos.x, floorAt(it.pos.x, it.pos.z + 0.6, it.pos.y + 1), it.pos.z + 0.6); G.focusIt = it; interact(); } }
      else if (G.objPos && i % 10 === 0) { P.pos.set(G.objPos.x + 0.3, 0, G.objPos.z + 0.3); P.pos.y = floorAt(P.pos.x, P.pos.z, G.objPos.y + 2); }
      if (curId() === 'binoc') { MS.r = true; P.adsOn = true; P.yaw = 0; P.pitch = 0; } else { MS.r = false; P.adsOn = false; }
      if (G.onExplode && i % 60 === 0 && G.objPos) explode(G.objPos.clone(), { src: PT, radius: 12, noPlayer: true, dmg: 0, vdmg: 0 });
      if (i % 45 === 0) { for (const a of G.actors) if (a.alive && a.team === 'enemy') a.hurt(9999, PT); for (const v of G.vehicles) if (v.alive && v.team === 'enemy') v.hurt(99999, 'explosive', PT); }
    }
    G.time += dt; tick(dt, dt);
    for (let k = 0; k < 6; k++) await null;
  }
  return log;
};
window.__T.tickFn = tick; window.__T.ev = (code) => eval(code);
window.__T.walkTo = async (x, z, maxSec = 20) => {
  const dt = 1 / 30; G.testMode = true;
  for (let i = 0; i < maxSec / dt; i++) {
    const dx = x - P.pos.x, dz = z - P.pos.z; if (Math.hypot(dx, dz) < 1) break;
    P.yaw = Math.atan2(-dx, -dz); K.KeyW = true; P.hp = 100; P.god = true;
    G.time += dt; tick(dt, dt); for (let k = 0; k < 4; k++) await null;
  }
  K.KeyW = false; return P.pos.toArray().map((v) => +v.toFixed(2));
};
window.__T.openGap = () => { G.world.remove(G.gapWall); const c = G.gapWall.userData.col; const i = G.colliders.indexOf(c); if (i >= 0) G.colliders.splice(i, 1); };
