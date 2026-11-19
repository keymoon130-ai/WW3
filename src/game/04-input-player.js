/* ---------------- input ---------------- */
const isLocked = () => document.pointerLockElement === canvas;
const lockSupported = !!canvas.requestPointerLock;
/* must be called synchronously inside a click handler; retried on every click */
function lockPointer() {
  if (!lockSupported || isLocked()) return;
  try { const r = canvas.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {}
}
function setAds(on) { P.adsOn = !!on; }
addEventListener('keydown', (e) => {
  if (e.repeat && !['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) { K[e.code] = true; return; }
  K[e.code] = true;
  if (G.mode !== 'play') { if (e.code === 'Escape' && G.mode === 'menu') menuBack(); return; }
  if (e.code === 'Escape') { if (G.paused) resume(); else if (!isLocked()) pauseGame(); return; }
  if (G.paused || !P.alive) return;
  if (e.code === 'Tab' || e.code === 'Space') e.preventDefault();
  if (G.cut) return;
  if (P.frozen) return;
  if (e.code === 'KeyR') { startReload(); }
  if (e.code === 'KeyG') throwGrenade();
  if (e.code === 'KeyV') melee();
  if (e.code === 'KeyF') interact();
  if (e.code === 'KeyC') P.crouchOn = !P.crouchOn;
  if (e.code === 'KeyN' && G.nvgAvail) { G.nvg = !G.nvg; SFX.click(); }
  if (e.code === 'KeyH' && G.gunCamPod && P.ride && ['km19', 'm134'].includes(curId())) { G.gunCam = !G.gunCam; SFX.click(); }
  if (e.code.startsWith('Digit')) { const i = +e.code.slice(5) - 1; if (i >= 0 && i < P.weapons.length) switchTo(i); }
  if (e.code === 'KeyQ' || e.code === 'KeyX') { if (P.weapons.length > 1) switchTo((P.cur + 1) % P.weapons.length); }
});
addEventListener('keyup', (e) => { K[e.code] = false; });
addEventListener('blur', () => { for (const k in K) K[k] = false; MS.l = MS.r = false; });
function onPlayMouseDown(e) {
  if (G.mode !== 'play' || G.paused) return;
  if (lockSupported && !isLocked()) { lockPointer(); return; }
  if (e.button === 0) MS.l = true;
  if (e.button === 2) { MS.r = true; if (SET.adsToggle) setAds(!P.adsOn); }
}
canvas.addEventListener('mousedown', onPlayMouseDown);
$('clickLock').addEventListener('mousedown', (e) => { e.preventDefault(); lockPointer(); });
addEventListener('mouseup', (e) => { if (e.button === 0) { MS.l = false; P.fireLatch = false; } if (e.button === 2) MS.r = false; });
addEventListener('contextmenu', (e) => { if (G.mode === 'play') e.preventDefault(); });
addEventListener('mousemove', (e) => { if (G.mode !== 'play' || G.paused) return; if (lockSupported && !isLocked()) return; MS.dx += e.movementX || 0; MS.dy += e.movementY || 0; });
addEventListener('wheel', (e) => { if (G.mode !== 'play' || G.paused || P.frozen || P.weapons.length < 2) return; switchTo((P.cur + (e.deltaY > 0 ? 1 : P.weapons.length - 1)) % P.weapons.length); }, { passive: true });
document.addEventListener('pointerlockchange', () => {
  const locked = isLocked(); document.body.classList.toggle('locked', locked);
  if (!locked && G.mode === 'play' && !G.paused && P.alive) pauseGame();
});
function updateLockPrompt() { $('clickLock').hidden = !(lockSupported && G.mode === 'play' && !G.paused && P.alive && !isLocked() && !G.testMode); }

/* ---------------- player update ---------------- */
const _f = v3(), _r = v3();
function updatePlayer(dt) {
  // mouse look
  const w = curW(); const baseFov = SET.fov;
  const sensK = 0.0021 * SET.sens * (camera.fov / baseFov);
  if (!G.cut && P.alive) {
    P.yaw -= MS.dx * sensK; P.pitch -= MS.dy * sensK; P.pitch = clamp(P.pitch, -1.5, 1.5);
    if (P.yawLim) { const c = P.yawLim; P.yaw = c[0] + clamp(angDiff(c[0], P.yaw), -c[1], c[1]); }
    if (P.pitchLim) P.pitch = clamp(P.pitch, P.pitchLim[0], P.pitchLim[1]);
  }
  P.swayX = damp(P.swayX, clamp(MS.dx * 0.002, -0.06, 0.06), 10, dt); P.swayY = damp(P.swayY, clamp(MS.dy * 0.002, -0.06, 0.06), 10, dt);
  MS.dx = MS.dy = 0;
  if (!P.alive) { P.deadT = (P.deadT || 0) + dt; camera.position.set(P.pos.x, P.pos.y + Math.max(0.25, 1.6 - P.deadT * 2), P.pos.z); camera.rotation.set(P.pitch, P.yaw, Math.min(P.deadT, 1) * 0.6); return; }
  const ctl = !G.cut && !P.frozen;
  // movement
  let fx = 0, fz = 0;
  if (ctl && !P.locked) { if (K.KeyW) fz += 1; if (K.KeyS) fz -= 1; if (K.KeyA) fx -= 1; if (K.KeyD) fx += 1; }
  const len = Math.hypot(fx, fz); if (len > 0) { fx /= len; fz /= len; }
  const wantSprint = ctl && K.ShiftLeft && fz > 0.5 && !P.noSprint && P.sprintBlock <= 0 && P.throwT <= 0 && !w.mounted;
  if (wantSprint && P.crouchOn) P.crouchOn = false;
  const adsWant = SET.adsToggle ? P.adsOn : MS.r;
  if (wantSprint && P.adsOn) P.adsOn = false;
  P.sprinting = wantSprint && !adsWant;
  P.sprintBlock -= dt;
  P.sprintK = damp(P.sprintK, P.sprinting ? 1 : 0, 9, dt);
  P.crouch = damp(P.crouch, P.crouchOn ? 1 : 0, 10, dt);
  let spd = 4.4 * P.speedMul;
  if (P.sprinting) spd *= 1.6; if (P.crouch > 0.5) spd *= 0.55; spd *= 1 - P.ads * 0.42; if (w.heavy) spd *= 0.9;
  if (P.inWater) spd *= 0.55;
  _f.set(-Math.sin(P.yaw), 0, -Math.cos(P.yaw)); _r.set(Math.cos(P.yaw), 0, -Math.sin(P.yaw));
  const tvx = (_f.x * fz + _r.x * fx) * spd, tvz = (_f.z * fz + _r.z * fx) * spd;
  const acc = P.onGround ? 12 : 3;
  P.vel.x = damp(P.vel.x, tvx, acc, dt); P.vel.z = damp(P.vel.z, tvz, acc, dt);
  if (P.ride) {
    const R = P.ride; const o = R.obj; o.updateMatrixWorld(); const wp = v3(R.off[0], R.off[1], R.off[2]).applyMatrix4(o.matrixWorld);
    if (R.free) { R.lx = clamp((R.lx || 0) + P.vel.x * dt * 0.3, -R.free[0], R.free[0]); R.lz = clamp((R.lz || 0) + P.vel.z * dt * 0.3, -R.free[1], R.free[1]); }
    P.pos.copy(wp); P.onGround = true; P.speed = Math.hypot(P.vel.x, P.vel.z) * 0.3;
  } else {
    const h = lerp(1.8, 1.2, P.crouch);
    moveCircle(P.pos, P.vel.x * dt, P.vel.z * dt, 0.35, P.pos.y, h);
    if (P.bounds) { const b = P.bounds; P.pos.x = clamp(P.pos.x, b[0], b[2]); P.pos.z = clamp(P.pos.z, b[1], b[3]); }
    const fl = floorAt(P.pos.x, P.pos.z, P.pos.y);
    if (ctl && K.Space && P.onGround && P.crouch < 0.5 && !P.locked) { P.vel.y = 3.4; P.onGround = false; }
    P.vel.y -= 15 * dt; P.pos.y += P.vel.y * dt;
    if (P.pos.y <= fl) { if (!P.onGround && P.vel.y < -6) { G.shake += 0.08; SFX.step(G.env.snow); } P.pos.y = fl; P.vel.y = 0; P.onGround = true; }
    else if (P.pos.y - fl > 0.4) P.onGround = false;
    else if (P.vel.y <= 0) { P.pos.y = damp(P.pos.y, fl, 20, dt); P.onGround = true; }
    P.speed = Math.hypot(P.vel.x, P.vel.z);
  }
  // breadcrumb trail of where the player has walked (used by followers so they never cut through walls)
  if (!G.trail) G.trail = [];
  const lt = G.trail[G.trail.length - 1]; if (!lt || lt.distanceToSquared(P.pos) > 0.64) { G.trail.push(P.pos.clone()); if (G.trail.length > 400) G.trail.shift(); }
  P.inWater = G.waterY > -900 && P.pos.y < G.waterY - 0.3 && !(G.onDeck && G.onDeck(P.pos));
  // footsteps
  if (P.onGround && P.speed > 1) { P.stepD += P.speed * dt; if (P.stepD > (P.sprinting ? 2.1 : 1.7)) { P.stepD = 0; SFX.step(!!G.env.snowGround || !!G.env.snow); } }
  // regen
  if (G.time - P.lastHit > 4.5 && P.hp < 100) P.hp = Math.min(100, P.hp + 28 * dt);
  // camera
  const eyeH = lerp(1.62, 1.0, P.crouch);
  P.bob += dt * P.speed * (P.sprinting ? 1.45 : 1.75) * (P.onGround ? 1 : 0);
  const bobA = Math.min(P.speed / 4.4, 1.6) * (1 - P.ads * 0.85);
  const bx = Math.sin(P.bob) * 0.035 * bobA, by = Math.abs(Math.cos(P.bob)) * 0.05 * bobA * (P.sprinting ? 1.6 : 1);
  P.eyePos.set(P.pos.x, P.pos.y + eyeH, P.pos.z); P.chestPos.set(P.pos.x, P.pos.y + eyeH - 0.45, P.pos.z);
  const sh = Math.min(G.shake, 1.5); G.shake = Math.max(0, G.shake - dt * 1.8);
  camera.position.set(P.pos.x + _r.x * bx + rand(-1, 1) * sh * 0.06, P.pos.y + eyeH + by + rand(-1, 1) * sh * 0.06, P.pos.z + _r.z * bx);
  // the gun camera (H): look from just ahead of the K-M19's muzzle instead of from the seat
  { const on = !!(G.gunCam && G.gunCamPod && P.ride && ['km19', 'm134'].includes(curId()) && !G.cut); if (!on && G.gunCam && (!P.ride || curId() !== 'km19')) G.gunCam = false;
    if (on) { G.gunCamPod.updateMatrixWorld(); G.gunCamPod.localToWorld(camera.position.set(0, -0.32, -1.7)); camera.position.x += rand(-1, 1) * sh * 0.03; camera.position.y += rand(-1, 1) * sh * 0.03; }
    if (G.gunCamCockpit) G.gunCamCockpit.visible = !on; document.body.classList.toggle('guncam', on); }
  P.punchP = damp(P.punchP, 0, 12, dt); P.punchY = damp(P.punchY, 0, 12, dt);
  const roll = (-fx * 0.012 * (P.sprinting ? 1.8 : 1)) + Math.sin(P.bob) * 0.006 * bobA * (P.sprinting ? 2 : 1);
  P.roll = damp(P.roll || 0, roll, 6, dt);
  camera.rotation.set(P.pitch + P.punchP + rand(-1, 1) * sh * 0.01, P.yaw + P.punchY + rand(-1, 1) * sh * 0.01, P.roll);
  // FOV: base / sprint widen / ADS narrow — smooth
  let tf = baseFov + (P.cam?.fovAdd || 0);
  if (P.sprinting) tf = baseFov + 11;
  tf = lerp(tf, w.adsFov ?? 55, P.ads); if (G.gunCam) tf = 32; if (G.beatFov) tf = Math.min(tf, G.beatFov);
  const nf = damp(camera.fov, tf, P.sprinting || P.sprintK > 0.05 ? 6 : 10, dt);
  if (Math.abs(nf - camera.fov) > 0.01) { camera.fov = nf; camera.updateProjectionMatrix(); updateParticleScale(); }
}
