/* ---------------- main loop ---------------- */
let last = performance.now();
const fpsEl = { n: 0, t: 0, v: 60 };
function musicTick(dt) {
  if (!AU.ctx) return;
  const want = G.mode === 'play' && !MUSIC.playing && !G.noMusic;
  if (!want) { if (DM.on) dmStop(); return; }
  if (!DM.on) { dmStart(); G.mInt = 0; G.mHi = false; G.mBoss = false; }
  G.mT = (G.mT || 0) - dt; if (G.mT > 0) return; G.mT = 0.25;
  let th = 0, boss = false;
  if (!G.cut) {
    for (const a of G.actors) if (a.alive && a.team === 'enemy' && a.state === 'combat') { const d = a.pos.distanceTo(P.pos); if (d < 90) th += (a.sees && a.target === PT ? 0.16 : 0.07) * (d < 40 ? 1 : 0.6); }
    for (const v of G.vehicles) if (v.alive && v.team === 'enemy' && (v.type === 'tank' || v.type === 'aheli' || (v.type === 'heli' && v.o.armed !== false)) && v.pos.distanceTo(P.pos) < 220) boss = true;
    th += (G.supp || 0) * 0.4 + (G.time - (G.pShotT ?? -99) < 2.5 ? 0.15 : 0);
  }
  if (G.bossMusic != null) boss = !!G.bossMusic;
  th = Math.max(clamp(th, 0, 1), G.musicMin || 0);
  G.mInt = th > G.mInt ? lerp(G.mInt, th, 0.5) : Math.max(th, G.mInt - 0.02);
  if (G.mInt > 0.6 && !G.mHi) { G.mHi = true; dmStinger('hit'); } else if (G.mInt < 0.25) G.mHi = false;
  if (boss && !G.mBoss) dmStinger('boss'); G.mBoss = boss;
  dmSet(G.mInt, boss);
}
function tick(dt, rdt) {
  updateScripts(); musicTick(rdt); chatterTick(dt); squadCareTick(dt);
  for (let i = G.updaters.length - 1; i >= 0; i--) { if (G.updaters[i](dt) === true) G.updaters.splice(i, 1); }
  updatePlayer(rdt * (G.timeScale < 1 ? Math.max(G.timeScale, 0.35) : 1));
  updateWeapon(dt);
  for (let i = G.actors.length - 1; i >= 0; i--) { const a = G.actors[i]; if (a) a.update(dt); }
  for (let i = G.vehicles.length - 1; i >= 0; i--) { const v = G.vehicles[i]; if (v) v.update(dt); }
  updateProjs(dt); updateEmitters(dt); updateParticles(dt); updateTracers(dt); updateSnow(dt); updateLights(dt); ambientBattle(dt);
  if (AU.wind) AU.wind.set((G.env.windSnd ?? 0.4) * 0.35 * (G.cut ? 0.6 : 1));
  G.expoK = lerp(G.expoK ?? 1, G.cut && G.cut.expo ? G.cut.expo : 1, Math.min(1, rdt * 2));
  renderer.toneMappingExposure = (G.env.exposure || 1) * 1.12 * (G.nvg ? 2.0 : 1) * (SET.bright ?? 1) * G.expoK;
  if (G.nvg !== G.nvgWas) { G.nvgWas = G.nvg; hemi.intensity = G.nvg ? Math.max(G.hemiBase * 3, 2.2) : G.hemiBase; if (G.nvg) hemi.groundColor.copy(hemi.color); else if (G.hemiGround) hemi.groundColor.copy(G.hemiGround); }
  if (G.cut) {
    const C = G.cut; camera.position.copy(C.pos); if (G.shake > 0) { camera.position.x += rand(-1, 1) * G.shake * 0.08; camera.position.y += rand(-1, 1) * G.shake * 0.08; G.shake = Math.max(0, G.shake - dt * 1.5); }
    if (!C.still) { const t = G.time; camera.position.x += Math.sin(t * 1.3) * 0.025 + Math.sin(t * 3.1) * 0.008; camera.position.y += Math.sin(t * 1.7 + 1) * 0.018 + Math.sin(t * 4.3) * 0.005; }
    camera.lookAt(C.look); camera.rotation.z += (C.roll || 0) + (C.still ? 0 : Math.sin(G.time * 0.9) * 0.006);
    if (Math.abs(camera.fov - C.fov) > 0.05) { camera.fov = damp(camera.fov, C.fov, 4, rdt); camera.updateProjectionMatrix(); updateParticleScale(); }
  }
  // shadows follow
  const sd = G.env.sunDir || [-0.4, 1, 0.3];
  sun.position.set(camera.position.x + sd[0] * 120, camera.position.y + sd[1] * 120, camera.position.z + sd[2] * 120); sun.target.position.copy(camera.position); sun.target.position.y = 0;
  sky.position.copy(camera.position); stars.position.copy(camera.position);
  updateHUD(rdt);
}
/* hold Space for two seconds to skip a cutscene or the opening news */