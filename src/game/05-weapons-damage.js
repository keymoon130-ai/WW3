/* ---------------- weapons update ---------------- */
function updateWeapon(dt) {
  const w = curW(), id = curId(); const st = P.ammo[id] || { mag: 0, res: 0 };
  const ctl = !G.cut && !P.frozen && P.alive;
  P.fireCd -= dt; P.kick = damp(P.kick, 0, 14, dt); if (P.boltT > 0) { P.boltT -= dt; if (P.boltT <= 0) SFX.click(); }
  // switching
  if (P.switchT > 0) { P.switchT -= dt; if (P.switchT < 0.22 && P.nextW !== undefined && P.nextW !== null) { P.cur = P.nextW; P.nextW = null; buildViewmodel(); } }
  // reload
  if (P.reloadT > 0) { P.reloadT -= dt; if (P.reloadT <= 0) { const need = (w.mag ?? 0) - st.mag; const take = Math.min(need, st.res); st.mag += take; if (st.res < 9000) st.res -= take; } }
  if (P.throwT > 0) { P.throwT -= dt; if (P.throwT < 0.28 && !P.thrown) { P.thrown = true; const d = v3(); camera.getWorldDirection(d); const from = camera.position.clone().addScaledVector(d, 0.5).add(v3(0, -0.1, 0)); new Proj('grenade', from, d.multiplyScalar(16).add(v3(0, 3.2, 0)).add(P.vel.clone().multiplyScalar(0.6)), { team: 'player', owner: PT }); } }
  if (P.meleeT > 0) P.meleeT -= dt;
  // ADS
  const canAds = ctl && !P.sprinting && P.reloadT <= 0 && P.switchT <= 0 && P.throwT <= 0 && P.meleeT <= 0;
  if (SET.adsToggle && P.adsOn && (P.reloadT > 0 || P.switchT > 0 || P.throwT > 0 || P.meleeT > 0 || !ctl)) P.adsOn = false;
  const adsT = ((SET.adsToggle ? P.adsOn : MS.r) && canAds) || (w.mounted && ctl) ? 1 : 0;
  P.ads = damp(P.ads, adsT, w.heavy ? 10 : 14, dt); if (Math.abs(P.ads - adsT) < 0.003) P.ads = adsT;
  // SAM lock-on: keep an aircraft inside the seeker circle
  if (id === 'sam' && P.ads > 0.8 && ctl && (st.mag > 0)) {
    camera.getWorldDirection(_d); let best = null, bd = 0.07;
    for (const v of G.vehicles) { if (!v.alive || !v.air || v.team !== 'enemy') continue; const dv = v3().subVectors(v.pos, camera.position); const L = dv.length(); if (L > 700) continue; const ang = Math.acos(clamp(dv.normalize().dot(_d), -1, 1)); if (ang < bd) { bd = ang; best = v; } }
    if (best && (!P.lockTgt || P.lockTgt === best || !P.lockTgt.alive)) { if (P.lockSeek !== best) { P.lockSeek = best; P.lockT = 0; } P.lockT += dt; G.beepT = (G.beepT || 0) - dt; if (G.beepT <= 0) { G.beepT = P.lockT > 1.2 ? 0.08 : 0.22; tone({ dur: 0.07, f: P.lockT > 1.2 ? 1760 : 1100, type: 'square', gain: 0.05, wet: 0 }); } if (P.lockT > 1.2) P.lockTgt = best; }
    else { P.lockT = Math.max(0, (P.lockT || 0) - dt * 2); if (P.lockT <= 0) { P.lockTgt = null; P.lockSeek = null; } }
  } else { P.lockT = 0; P.lockTgt = null; P.lockSeek = null; }
  // fire
  if (ctl && MS.l && !P.noFire && !w.noFire) {
    if (P.sprinting) { P.sprintBlock = 0.3; }
    else if (P.fireCd <= 0 && P.reloadT <= 0 && P.switchT <= 0 && P.throwT <= 0 && P.meleeT <= 0 && P.sprintK < 0.35 && (w.auto || !P.fireLatch)) {
      P.fireLatch = true;
      if (w.special === 'naval') fireDesignator();
      else if (st.mag <= 0) { SFX.click(); P.fireCd = 0.25; if (st.res > 0) startReload(); }
      else fireWeapon(w, st);
    }
  }
  if (ctl && st.mag <= 0 && st.res > 0 && P.reloadT <= 0 && !w.noFire && !w.noAmmo && P.fireCd <= 0 && P.switchT <= 0) startReload();
  // viewmodel pose
  const ads = P.ads, sp = P.sprintK;
  const hip = w.vm === 'aa' ? [0, -0.05, 0] : w.vm === 'pintle' ? [0, -0.2, -0.05] : w.heavy ? [0.17, -0.13, -0.3] : w.vm === 'binoc' ? [0.0, -0.13, -0.3] : w.vm === 'pistol' ? [0.14, -0.15, -0.38] : [0.135, -0.15, -0.4];
  const adsP = [-VM.sx, -VM.sy, -0.24 - VM.sz];
  let px = lerp(hip[0], adsP[0], ads), py = lerp(hip[1], adsP[1], ads), pz = lerp(hip[2], adsP[2], ads);
  let rx = 0, ry = 0, rz = 0;
  // sprint pose
  px = lerp(px, 0.1, sp); py = lerp(py, -0.2, sp); pz = lerp(pz, -0.26, sp); rx += -0.35 * sp; ry += 0.75 * sp; rz += 0.25 * sp;
  // bob
  const bobA = Math.min(P.speed / 4.4, 1.6) * (1 - ads * 0.9);
  px += Math.sin(P.bob) * 0.012 * bobA * (1 + sp); py += -Math.abs(Math.cos(P.bob)) * 0.012 * bobA * (1 + sp * 1.2);
  rz += Math.sin(P.bob) * 0.04 * bobA * sp;
  // idle breathing
  py += Math.sin(G.time * 1.6) * 0.0025 * (1 - ads * 0.8); px += Math.cos(G.time * 0.8) * 0.0015 * (1 - ads * 0.8);
  // sway
  px -= P.swayX * 0.2 * (1 - ads * 0.7); py += P.swayY * 0.2 * (1 - ads * 0.7); ry += P.swayX * 0.6 * (1 - ads * 0.7); rx += P.swayY * 0.5 * (1 - ads * 0.7);
  py += (P.landY || 0) * 0.35 * (1 - ads * 0.6); rx += (P.landY || 0) * 0.5 * (1 - ads * 0.6); /* the landing dips the gun a beat behind the view */
  // kick
  pz += P.kick * 0.05 * (1 - ads * 0.5); rx += P.kick * 0.09 * (1 - ads * 0.7);
  // crouch tilt
  rz += P.crouch * 0.03 * (1 - ads);
  // reload anim
  const lhT = VM.lh0 ? _lh.copy(VM.lh0) : null;
  if (P.reloadT > 0) {
    const k = 1 - P.reloadT / P.reloadDur, empty = P.reloadEmpty;
    // gun tilts toward the support hand, then back
    const tilt = smooth(clamp(k / 0.12, 0, 1)) * (1 - smooth(clamp((k - 0.86) / 0.14, 0, 1)));
    rx += -0.22 * tilt; rz += 0.5 * tilt; py -= 0.04 * tilt; px -= 0.02 * tilt; ry += 0.12 * tilt;
    if (VM.mag && VM.magHome && lhT && (w.vm === 'rifle' || w.vm === 'pistol' || w.vm === 'sniper')) {
      const mh = VM.magHome, under = _lh2.set(mh.x - 0.01, mh.y - 0.06, mh.z + 0.02), low = _lh3.set(mh.x - 0.08, mh.y - 0.42, mh.z + 0.18);
      const seg = (a, b) => smooth(clamp((k - a) / (b - a), 0, 1));
      // 0-.14 hand to mag · .14-.3 pull & drop · .3-.48 fetch new · .48-.64 insert · .64-.7 slap · .7-.86 charge (empty) / return
      if (k < 0.14) lhT.lerp(under, seg(0, 0.14));
      else if (k < 0.3) { lhT.copy(under).lerp(low, seg(0.14, 0.3)); VM.mag.position.copy(mh).add(_lh4.set(-0.01, -0.42 * seg(0.14, 0.3), 0.18 * seg(0.14, 0.3))); VM.mag.rotation.x = VM.magRot + 0.6 * seg(0.14, 0.3); }
      else if (k < 0.48) { lhT.copy(low); VM.mag.visible = k > 0.38; VM.mag.position.copy(mh).add(_lh4.set(-0.07, -0.36, 0.16)); VM.mag.rotation.x = VM.magRot + 0.3; }
      else if (k < 0.64) { const q = seg(0.48, 0.64); lhT.copy(low).lerp(under, q); VM.mag.visible = true; VM.mag.position.copy(mh).add(_lh4.set(-0.07 * (1 - q), -0.36 * (1 - q) - 0.02 * Math.sin(q * Math.PI), 0.16 * (1 - q))); VM.mag.rotation.x = VM.magRot + 0.3 * (1 - q); }
      else if (k < 0.7) { lhT.copy(under).add(_lh4.set(0, 0.03 * Math.sin(seg(0.64, 0.7) * Math.PI), 0)); VM.mag.position.copy(mh); VM.mag.rotation.x = VM.magRot; if (!P.slapped) { P.slapped = true; P.kick = Math.min(1, P.kick + 0.5); SFX.click(); } }
      else { VM.mag.position.copy(mh); VM.mag.rotation.x = VM.magRot;
        if (empty && w.vm !== 'sniper') { const cp = _lh2.set(w.vm === 'pistol' ? 0 : -0.05, w.vm === 'pistol' ? 0.05 : 0.04, w.vm === 'pistol' ? 0.06 : 0.08); const q1 = seg(0.7, 0.78), q2 = seg(0.78, 0.84), q3 = seg(0.84, 1); lhT.copy(under).lerp(cp, q1); lhT.z += 0.07 * q2 * (1 - q3); if (q3 > 0) lhT.copy(cp).lerp(VM.lh0, q3); if (q2 > 0.9 && !P.racked) { P.racked = true; SFX.click(); } }
        else lhT.copy(under).lerp(VM.lh0, seg(0.7, 0.9)); }
    }
    if (VM.mag && w.vm === 'rpg') { VM.mag.visible = k > 0.5; if (lhT) { const q = clamp((k - 0.15) / 0.35, 0, 1); lhT.lerp(_lh2.set(0.05, -0.35, -0.7), Math.sin(q * Math.PI) * (k < 0.5 ? 1 : 0)); if (k > 0.5) { const q2 = smooth(clamp((k - 0.5) / 0.3, 0, 1)); VM.mag.position.set(0, -0.25 * (1 - q2), -0.74 - 0.15 * (1 - q2)); lhT.copy(_lh2.set(0.02, -0.08, -0.74)).lerp(VM.lh0, smooth(clamp((k - 0.8) / 0.2, 0, 1))); } } }
  } else { P.slapped = false; P.racked = false; if (VM.mag) { VM.mag.visible = w.vm === 'rpg' ? st.mag > 0 : true; if (VM.magHome) { VM.mag.position.copy(VM.magHome); VM.mag.rotation.x = VM.magRot; } else if (w.vm === 'rpg') VM.mag.position.set(0, 0, -0.74); } }
  // bolt action cycling after each shot
  if (VM.bolt) { const bk = P.boltT > 0 ? 1 - P.boltT / (w.bolt || 1) : 1; const pull = bk < 0.25 ? 0 : bk < 0.75 ? Math.sin((bk - 0.25) / 0.5 * Math.PI) : 0; VM.bolt.position.z = 0.08 + 0.09 * pull; VM.bolt.rotation.z = -1.2 * Math.min(1, Math.sin(Math.min(1, bk / 0.8) * Math.PI) * 1.6) * (P.boltT > 0 ? 1 : 0); if (P.boltT > 0) { rz += 0.12 * Math.sin(bk * Math.PI); py -= 0.02 * Math.sin(bk * Math.PI); } }
  if (VM.larm && lhT) { const d = _lh2.subVectors(lhT, VM.ls); const L = d.length(); VM.larm.position.copy(VM.ls).add(lhT).multiplyScalar(0.5); VM.larm.quaternion.setFromUnitVectors(_lh3.set(0, 0, 1), d.normalize()); VM.larm.scale.z = L / VM.larmL; VM.lhand.position.copy(lhT); }
  if (P.switchT > 0) { const k = P.switchT > 0.22 ? (0.45 - P.switchT) / 0.23 : P.switchT / 0.22; py -= 0.35 * smooth(clamp(k, 0, 1)); rx -= 0.6 * smooth(clamp(k, 0, 1)); }
  if (P.throwT > 0) { const k = 1 - P.throwT / 0.7; const e = Math.sin(k * Math.PI); py -= 0.25 * e; rx -= 0.5 * e; }
  if (P.meleeT > 0) { const k = 1 - P.meleeT / 0.45; const e = Math.sin(k * Math.PI); px -= 0.12 * e; pz -= 0.15 * e; ry += 0.9 * e; rz -= 0.4 * e; }
  if (w.heavy) { pz += 0.06 * (1 - ads); }
  VM.root.position.set(px, py, pz); VM.root.rotation.set(rx, ry, rz);
  const overlay = w.overlay && ads > 0.85;
  VM.root.visible = !G.cut && P.alive && !overlay && !P.hideVM;
  vmFlash.intensity = damp(vmFlash.intensity, 0, 30, dt);
}
const _d = v3(), _o = v3(), _lh = v3(), _lh2 = v3(), _lh3 = v3(), _lh4 = v3();
function fireWeapon(w, st) {
  st.mag--; if (w.infinite) st.mag = w.mag; P.fireCd = 60 / w.rpm; G.stats.shots++;
  camera.getWorldDirection(_d);
  const mz = VM.muzzle.getWorldPosition(v3()); // in vm space; we need world muzzle approx
  const worldMz = camera.position.clone().addScaledVector(_d, 0.9).add(_r.clone().multiplyScalar(0.12 * (1 - P.ads))).add(v3(0, -0.12 * (1 - P.ads), 0));
  if (w.extMuzzle && G.extMuzzle) worldMz.copy(G.extMuzzle());
  if (w.proj) {
    if (w.proj === 'sam') {
      // heat seeker: locked target first, otherwise whatever enemy aircraft is closest to where it was pointed; it re-acquires if its target dies
      const dir = _d.clone(); const from = camera.position.clone().addScaledVector(dir, 0.9).add(v3(0, -0.1, 0));
      const seek = (pos, fwd, maxAng) => { let best = null, bs = 1e9; for (const v of G.vehicles) { if (!v.alive || !v.air || v.team !== 'enemy') continue; const dv = v3().subVectors(v.pos, pos); const L = dv.length(); if (L > 900) continue; const ang = Math.acos(clamp(dv.normalize().dot(fwd), -1, 1)); if (ang > maxAng) continue; const sc = ang * 200 + L * 0.2; if (sc < bs) { bs = sc; best = v; } } return best; };
      let tgt = (P.lockTgt && P.lockTgt.alive && P.lockTgt) || (P.lockSeek && P.lockSeek.alive && P.lockSeek) || seek(camera.position, dir, 1.1);
      let pr = null;
      pr = new Proj('missile', from, dir.clone().multiplyScalar(30), { team: 'player', owner: PT, turn: 7, accel: 70, vmax: 130, prox: 6,
        guide: () => { if (!tgt || !tgt.alive) tgt = seek(pr.pos, pr.vel.clone().normalize(), 1.6); if (!tgt) return null; const lead = tgt.vel ? tgt.vel.clone().multiplyScalar(Math.min(1.5, pr.pos.distanceTo(tgt.pos) / Math.max(30, pr.vel.length()))) : v3(); return tgt.pos.clone().add(lead); } });
      SFX.shot('rpg'); P.kick = 1; G.shake += 0.2; P.lockT = 0; P.lockTgt = null; FX.muzzle(worldMz, _d, 1.4); return;
    }
    let speed = w.proj === 'gl' ? 95 : w.proj === 'rocket' ? 75 : w.proj === 'missile' ? 32 : 420;
    const dir = _d.clone(); if (w.proj === 'flak') { dir.x += rand(-1, 1) * w.sa; dir.y += rand(-1, 1) * w.sa; dir.z += rand(-1, 1) * w.sa; dir.normalize(); }
    const from = camera.position.clone().addScaledVector(dir, w.proj === 'flak' ? 2.2 : 0.8).add(v3(0, -0.15, 0));
    const pr = new Proj(w.proj, from, dir.multiplyScalar(speed), { team: 'player', owner: PT, fuse: w.proj === 'flak' ? rand(0.6, 1.6) : undefined, guide: w.proj === 'missile' ? missileGuide : null });
    if (w.proj === 'flak') { tracer(from, from.clone().add(pr.vel.clone().multiplyScalar(0.25)), [1, 0.8, 0.4], 420); SFX.shot('flak'); P.kick = 0.4; G.shake += 0.03; }
    else { SFX.shot('rpg'); P.kick = 1; G.shake += 0.25; for (let i = 0; i < 18; i++) particle({ x: camera.position.x - _d.x * 1.2, y: camera.position.y, z: camera.position.z - _d.z * 1.2, vx: -_d.x * rand(4, 10) + rand(-1, 1), vy: rand(0, 1.5), vz: -_d.z * rand(4, 10) + rand(-1, 1), life: rand(1, 2), size: 0.6, size1: 2.5, alpha: 0.5, color: [0.75, 0.74, 0.72], drag: 2 }); }
    FX.muzzle(worldMz, _d, 1.4); flashLight(worldMz, 0xffa050, 10, 10, 0.06);
    P.punchP += (w.rec || 0.03) * 0.5;
    alertEnemies(60);
    return;
  }
  // hitscan
  const moveSpread = Math.min(P.speed / 4.4, 1.4) * 0.02 * (1 - P.ads * 0.8);
  const spread = lerp(w.sh, w.sa, P.ads) + moveSpread + (P.onGround ? 0 : 0.04) - P.crouch * 0.005;
  const a = rand(0, TAU), r = Math.sqrt(Math.random()) * spread;
  const dir = _d.clone().addScaledVector(_r, Math.cos(a) * r).addScaledVector(camera.up.clone().applyQuaternion(camera.quaternion), Math.sin(a) * r).normalize();
  G.hmgShot = !!w.hmg; const hit = hitscan(camera.position, dir, 400, w.dmg, w.head ?? 3, PT); G.hmgShot = false;
  tracer(worldMz, hit.point, [1, 0.8, 0.45], 500);
  FX.muzzle(worldMz, _d, w.sup ? 0.3 : 1);
  if (!w.sup && SET.sparks !== false) { flashLight(worldMz, 0xffaa50, 6, 9, 0.05); vmFlash.intensity = 3; }
  SFX.shot(w.snd); G.pShotT = G.time; if (w.bolt) { P.boltT = w.bolt; P.fireCd = Math.max(P.fireCd, w.bolt); if (SET.adsToggle) P.adsOn = P.adsOn; }
  // recoil
  const recK = (1 - P.ads * 0.35) * (1 - P.crouch * 0.2);
  P.pitch += w.rec * recK; P.yaw += rand(-1, 1.2) * w.recH * recK;
  P.punchP += w.rec * 0.6; P.kick = Math.min(1, P.kick + 0.6);
  if (!w.quiet) alertEnemies(55); else alertEnemies(6);
}
function missionMuzzle() { return camera.position; }
function missileGuide() { if (!(P.ads > 0.5 && curId() === 'atgm')) return null; const d = v3(); camera.getWorldDirection(d); const r = rayWorld(camera.position, d, 600); return camera.position.clone().addScaledVector(d, Math.max(r.t, 20)); }
/* a flat naval shot would bury itself in a hill between the ship and the mark: lob it just high enough to clear the ground on the way */
function navalFlight(from, tp, g) {
  for (let T = 2.4; T <= 6.01; T += 0.4) { let ok = true; const vy = (tp.y - from.y + 0.5 * g * T * T) / T;
    let px = from.x, py = from.y, pz = from.z;
    for (let i = 1; i <= 48 && ok; i++) { const t = (T * i) / 48, k = i / 48, x = lerp(from.x, tp.x, k), z = lerp(from.z, tp.z, k), y = from.y + vy * t - 0.5 * g * t * t;
      const near = Math.hypot(x - tp.x, z - tp.z) < 6; if (!near && y < G.groundAt(x, z) + 2) ok = false;
      else if (!near) { const d = v3(x - px, y - py, z - pz), L = d.length(); d.divideScalar(L); const r = rayWorld(v3(px, py, pz), d, L); if (r.c && r.t < L) ok = false; } // anything solid short of the last few metres stops the shell
      px = x; py = y; pz = z; }
    if (ok) return T; }
  return 0;
}
/* the ship's guns: four rounds on the mark */
function navalSalvo(at) {
    for (let i = 0; i < 4; i++) setGameTimeout(() => { const tp = at.clone().add(v3(rand(-4, 4), 0, rand(-4, 4))); const from = G.navalGun.clone().add(v3(rand(-6, 6), 0, 0)), gch = 4, T = navalFlight(from, tp, gch);
      if (T) { const vel = v3((tp.x - from.x) / T, (tp.y - from.y + 0.5 * gch * T * T) / T, (tp.z - from.z) / T); new Proj('naval', from, vel, { target: tp, src: PT, life: T + 3 }); }
      else { /* masked by a ridge: high-angle fire — the shell comes down steeply from the ship's side of the sky */ const b = v3(from.x - tp.x, 0, from.z - tp.z).normalize(), top = tp.clone().addScaledVector(b, 55).add(v3(0, 210, 0)); new Proj('naval', top, v3().subVectors(tp, top).normalize().multiplyScalar(150), { target: tp, src: PT, life: 6 }); } for (let k = 0; k < 4; k++) particle({ add: true, x: from.x, y: from.y, z: from.z, life: 0.3, size: rand(10, 18), color: [1, 0.7, 0.4] }); for (let k = 0; k < 12; k++) particle({ x: from.x, y: from.y, z: from.z, vx: rand(-4, 4), vy: rand(0, 3), vz: rand(-4, 4), life: rand(1.5, 3), size: 2, size1: 7, alpha: 0.4, color: [0.7, 0.7, 0.7], drag: 1.5 }); flashLight(from, 0xffa050, 80, 200, 0.2); SFX.shot('cannon', from); }, 2.4 + i * 0.45);
}
/* who answers the designator in this mission: the ship's guns, aircraft or the artillery — every message names the right one */
function desigSupport() {
  if (G.airMode || G.strikeMode === 'air') return { kind: 'air', wait: '다음 공격 편대 진입까지', ready: '공격 가능', reload: '편대 진입' };
  if (G.strikeMode === 'arty') return { kind: 'arty', wait: '포병 재장전 중…', ready: '사격 준비', reload: '재장전' };
  return { kind: 'naval', wait: '함포 재장전 중…', ready: '사격 준비', reload: '재장전' };
}
function fireDesignator() {
  if (P.ads < 0.8) { hint('우클릭으로 조준한 뒤 표적을 지정하세요', 2); return; }
  if ((G.navalCd || 0) > G.time) { hint(`${desigSupport().wait} ${Math.ceil(G.navalCd - G.time)}초`, 1.5); return; }
  const d = v3(); camera.getWorldDirection(d); const r = rayWorld(camera.position, d, 700); if (!r.c) { hint('표적을 지정할 수 없어요', 1.5); return; }
  const at = camera.position.clone().addScaledVector(d, r.t);
  G.navalCd = G.time + (WD.desig.cooldown || 14); SFX.radio();
  if (desigSupport().kind === 'naval') subtitle('함포 통제', G.navalShip ? '좌표 수신. 함포 사격 개시!' : '좌표 수신. 사격 개시, 탄착까지 5초.', 3, true);
  G.navalMark = { pos: at.clone(), t: G.time + 5.5 };
  if (G.airMode) {
    subtitle('항공 통제', '좌표 수신. 이글 2-1, 공격 진입한다.', 3, true); G.navalCd = G.time + 10;
    const yaw = Math.atan2(at.x - camera.position.x, at.z - camera.position.z);
    const dx = Math.sin(yaw), dz = Math.cos(yaw);
    setGameTimeout(() => jetPass([at.x - dx * 900, 70, at.z - dz * 900], [at.x + dx * 900, 110, at.z + dz * 900], { speed: 280, bombs: [[at.x - dx * 4, at.z - dz * 4], [at.x, at.z], [at.x + dx * 4, at.z + dz * 4]], src: PT, dmg: 300, vdmg: 900 }), 1.2);
    return;
  }
  if (G.strikeMode === 'air') { // close air support: a pair of jets runs in over the mark
    subtitle('항공 통제', '표적 확인. 바이퍼 편대 투하 진입, 4초.', 2.6, true); G.navalMark = { pos: at.clone(), t: G.time + 4.5 };
    setGameTimeout(() => { const dx = rand(-1, 1) > 0 ? 1 : -1; for (let k = 0; k < 2; k++) setGameTimeout(() => jetPass([at.x - dx * 700, 90, at.z + rand(-40, 40)], [at.x + dx * 700, 110, at.z + rand(-40, 40)], { speed: 300, bombs: [[at.x + rand(-4, 4), at.z + rand(-4, 4)], [at.x + rand(-8, 8), at.z + rand(-8, 8)]], dmg: 400, vdmg: 700, noPlayer: true, src: PT }), k * 0.5); }, 1.2);
    return;
  }
  if (G.strikeMode === 'arty') { // division artillery: a sheaf of shells on the mark
    subtitle('포병 통제', '좌표 수신. 효력사, 탄착 6초.', 2.6, true); G.navalMark = { pos: at.clone(), t: G.time + 6.5 };
    for (let i = 0; i < 8; i++) setGameTimeout(() => { const tp = at.clone().add(v3(rand(-8, 8), 0, rand(-8, 8))); new Proj('naval', tp.clone().add(v3(rand(-6, 6), 160, rand(-6, 6))), v3(rand(-2, 2), -150, rand(-2, 2)), { target: tp, src: PT }); }, 3.6 + i * 0.25);
    return;
  }
  if (G.navalShip && G.navalGun) navalSalvo(at);
  else
  for (let i = 0; i < 4; i++) setGameTimeout(() => { const tp = at.clone().add(v3(rand(-5, 5), 0, rand(-5, 5))); new Proj('naval', tp.clone().add(v3(-60, 260, 120)), v3(60, -260, -120).normalize().multiplyScalar(140), { target: tp, src: PT }); }, 3 + i * 0.5);
}
function startReload() {
  const w = curW(), st = P.ammo[curId()]; if (!st || w.noFire || w.noAmmo) return;
  if (P.reloadT > 0 || st.mag >= (w.mag ?? 0) || st.res <= 0 || P.switchT > 0) return;
  P.reloadEmpty = st.mag <= 0; P.reloadT = P.reloadDur = (w.reload ?? 2) + (P.reloadEmpty && !w.bolt && w.vm !== 'rpg' ? 0.45 : 0); P.slapped = P.racked = false; SFX.reload(w.vm === 'pistol' ? 'pistol' : w.vm); P.sprintBlock = 0;
}
function throwGrenade() { if (P.nades <= 0 || P.throwT > 0 || P.reloadT > 0 || P.switchT > 0 || curW().mounted) return; P.nades--; P.throwT = 0.7; P.thrown = false; SFX.pin(); }
function melee() {
  if (P.meleeT > 0 || curW().mounted) return; P.meleeT = 0.45; SFX.melee(); P.reloadT = 0;
  camera.getWorldDirection(_d);
  for (const a of G.actors) { if (!a.alive || a.team !== 'enemy') continue; const dv = v3().subVectors(a.chest(v3()), P.eyePos); const d = dv.length(); if (d < 2.3 && dv.normalize().dot(_d) > 0.55) { a.hurt(999, PT, false); FX.blood(a.chest(v3())); showHit(true); break; } }
}
function interact() {
  const it = G.focusIt; if (!it) return;
  SFX.uiOk();
  if (it.once !== false) { const i = G.interactables.indexOf(it); if (i >= 0) G.interactables.splice(i, 1); }
  if (it.onUse) it.onUse(); if (it.res) it.res();
}
function alertEnemies(r) { for (const a of G.actors) if (a.alive && a.team === 'enemy' && a.state !== 'combat' && a.pos.distanceTo(P.pos) < r) { a.state = 'combat'; a.knownPos = P.pos.clone(); a.repath = rand(0, 0.6); if (a.o.onAlert) a.o.onAlert(a); } }

/* hitscan for player bullets */
/* friendly armour never stops the player's own rounds (its box collider is far bigger than the hull, and you may be riding on it) */
function playerSkip() { return G.vehicles.filter((v) => v.alive && v.team === 'ally' && !v.air); }
function hitscan(o, d, maxT, dmg, headMul, src) {
  const r = rayWorld(o, d, maxT, false, src === PT ? playerSkip() : null); let best = r.t, what = r.c, head = false, actor = null;
  for (const a of G.actors) {
    if (!a.alive || a.team !== 'enemy') continue;
    const hy = a.pos.y + a.h - 0.12;
    let t = raySphere(o.x, o.y, o.z, d.x, d.y, d.z, a.pos.x, hy, a.pos.z, 0.17);
    if (t >= 0 && t < best) { best = t; actor = a; head = true; what = null; }
    const bh = a.h - 0.3;
    const box = { min: { x: a.pos.x - 0.27, y: a.pos.y, z: a.pos.z - 0.27 }, max: { x: a.pos.x + 0.27, y: a.pos.y + bh, z: a.pos.z + 0.27 } };
    t = rayAABB(o.x, o.y, o.z, d.x, d.y, d.z, box, best);
    if (t >= 0 && t < best) { best = t; actor = a; head = false; what = null; }
  }
  for (const v of G.vehicles) if (v.alive && v.air) { const t = raySphere(o.x, o.y, o.z, d.x, d.y, d.z, v.pos.x, v.pos.y, v.pos.z, v.type === 'drone' ? 1.6 : 2.6); if (t >= 0 && t < best) { best = t; what = { ref: v }; actor = null; } }
  const point = o.clone().addScaledVector(d, best);
  if (src === PT) for (const a of G.actors) { if (!a.alive || a.team !== 'enemy' || a === actor) continue; const c = a.chest(v3()); const toA = c.sub(o); const along = toA.dot(d); if (along < 0 || along > best + 1) continue; if (toA.addScaledVector(d, -along).length() < 2.2) a.supp = Math.min(2, (a.supp || 0) + 0.45); }
  if (actor) {
    G.stats.hits++;
    actor.hurt(dmg * (head ? headMul : 1) * (best > 120 ? 0.8 : 1), src, head);
    FX.blood(point); showHit(!actor.alive, head && !actor.alive); if (head && !actor.alive) SFX.head(); else SFX.hit();
  } else if (what && what.ref) {
    const v = what.ref; if (v.isVehicle) { v.hurt(dmg, G.hmgShot ? 'hmg' : 'bullet', src); FX.sparks(point, 5); SFX.metal(point); if (v.type === 'truck' || v.air) showHit(false); }
  } else if (what) {
    if (what === 'ground') { if (G.env.snow || G.env.snowGround) FX.snowPuff(point); else FX.dust(point, 6); }
    else { FX.dust(point, 5, [0.55, 0.53, 0.5], 0.15); FX.sparks(point, 2); }
    SFX.impact(point);
  } else if (G.waterY > -900 && d.y < 0) { const t = (G.waterY - o.y) / d.y; if (t > 0 && t < maxT) { const wp = o.clone().addScaledVector(d, t); FX.splash(wp, 0.2); return { point: wp }; } }
  return { point };
}

/* ---------------- damage / death ---------------- */
function damagePlayer(dmg, from, explosive = false) {
  if (!P.alive || P.god || G.cut) return;
  P.hp -= dmg; P.lastHit = G.time; G.shake += explosive ? 0.4 : 0.12; P.punchP += rand(-0.02, 0.02); P.punchY += rand(-0.02, 0.02);
  SFX.hurt(); dmgIndicator(from);
  if (P.hp <= 0) { P.hp = 0; playerDie(); }
}
function playerDie() {
  P.alive = false; P.deadT = 0; MS.l = MS.r = false; G.nvg = false;
  setTimeout(() => { if (G.mode !== 'play') return; G.paused = true; showScreen('fail'); $('failHead').textContent = '전사했습니다'; $('failTip').textContent = pick(FAIL_TIPS); if (document.pointerLockElement) document.exitPointerLock(); }, 1800);
}
const FAIL_TIPS = [
  '엄폐물 뒤에서 앉으면(C) 적에게 덜 노출돼요.',
  '체력은 피격 후 잠시 피하면 자동으로 회복돼요.',
  '적이 쏠 때 미니맵에 붉은 점으로 표시돼요.',
  '전차는 소총으로 부술 수 없어요. 대전차 화기를 찾으세요.',
  '정조준(우클릭)하면 탄이 훨씬 정확해져요.',
  '쓰러진 적 위를 지나가면 탄약을 주울 수 있어요.',
  '수류탄(G)으로 엄폐한 적을 몰아내세요.',
];
