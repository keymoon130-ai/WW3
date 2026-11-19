/* ---------------- HUD ---------------- */
const hud = { xh: $('xh'), mag: $('mag'), res: $('res'), wname: $('wname'), nades: $('nades'), obj: $('objText'), objBox: $('obj'), subs: $('subs'), prompt: $('prompt'), marker: $('marker'), vig: $('dmgvig'), mm: $('minimap'), ally: $('allyname'), kf: $('killfeed'), timer: $('timer'), hitm: $('hitm'), hint: $('hint'), cp: $('cpmsg'), dirs: $('dmgdirs'), binoc: $('binoc'), nvg: $('nvg'), ring: $('ringfx'), white: $('flash') };
const mmx = hud.mm.getContext('2d');
/* two subtitle lanes: the radio line above, what someone near you says below. A new line replaces only the line in its own lane,
   so a radio call is never cut off by a squadmate talking over it (and the other way round) */
const SUBT = { radio: null, say: null };
function subtitle(who, text, dur = 3, radio = false) { G.lastSubT = G.time;
  if (radio) SFX.radio();
  const kind = radio ? 'radio' : 'say'; let slot = hud.subs.querySelector('.slot-' + kind);
  if (!slot) { slot = document.createElement('div'); slot.className = 'slot slot-' + kind; if (radio) hud.subs.prepend(slot); else hud.subs.appendChild(slot); }
  // speech replaces speech; radio calls stack (two at most): a long net call stays up while a short callout comes in under it
  if (!radio) slot.innerHTML = ''; else { for (const o of [...slot.children]) if (o.firstChild && o.firstChild.classList.contains('out')) o.remove(); while (slot.children.length >= 2) slot.firstChild.remove(); }
  const d = document.createElement('div'); d.className = 'sub' + (radio ? ' radio' : '');
  if (who) { const b = document.createElement('b'); b.textContent = who; d.appendChild(b); }
  const s = document.createElement('span'); s.textContent = text; d.appendChild(s);
  const line = document.createElement('div'); line.appendChild(d); slot.appendChild(line);
  const kill = () => { d.classList.add('out'); setTimeout(() => line.remove(), 600); };
  if (radio) setTimeout(kill, dur * 1000 / Math.max(G.timeScale, 0.3)); else { clearTimeout(SUBT.say); SUBT.say = setTimeout(kill, dur * 1000 / Math.max(G.timeScale, 0.3)); }
}
function setObjective(text) { hud.obj.textContent = text || ''; hud.objBox.hidden = !text; if (text) { hud.objBox.classList.remove('flash'); void hud.objBox.offsetWidth; hud.objBox.classList.add('flash'); SFX.objective(); } }
let hintT = null;
function hint(text, dur = 4) { hud.hint.innerHTML = text; hud.hint.classList.add('on'); clearTimeout(hintT); hintT = setTimeout(() => hud.hint.classList.remove('on'), dur * 1000); }
function toast(text) { hud.cp.textContent = text; hud.cp.classList.remove('on'); void hud.cp.offsetWidth; hud.cp.classList.add('on'); }
let hitmT = null;
function showHit(kill, head) { hud.hitm.className = 'on' + (kill ? ' kill' : '') + (head ? ' head' : ''); clearTimeout(hitmT); hitmT = setTimeout(() => (hud.hitm.className = ''), kill ? 260 : 140); }
function addKillFeed(text, head) {
  const d = document.createElement('div'); d.className = 'kf' + (head ? ' head' : ''); d.textContent = text; hud.kf.prepend(d);
  while (hud.kf.children.length > 5) hud.kf.lastChild.remove(); setTimeout(() => d.classList.add('out'), 3500); setTimeout(() => d.remove(), 4200);
}
function onEnemyKilledByPlayer(a, head) {
  G.stats.kills++; if (head) G.stats.heads++; squadOnKill(head);
  addKillFeed((head ? '헤드샷  ' : '') + (a.kind === 'heavy' ? '적 기관총 사수 사살' : a.kind === 'officer' ? '적 장교 사살' : '적 소총수 사살'), head);
}
function giveAmmoPickup() {
  let any = false;
  for (const id of P.weapons) { const w = WD[id]; if (!w.mag || w.heavy || w.noAmmo || w.mounted) continue; const cap = (w.res ?? 0) * 1.3; if (P.ammo[id].res < cap) { P.ammo[id].res = Math.min(cap, P.ammo[id].res + Math.ceil(w.mag * 0.8)); any = true; } }
  if (any) { toast('+ 탄약'); SFX.click(); }
}
function refillAmmo() { for (const id of P.weapons) { const w = WD[id]; if (w.noAmmo) continue; P.ammo[id].res = Math.max(P.ammo[id].res, w.res ?? 0); } P.nades = Math.max(P.nades, 4); toast('탄약 보급 완료'); }
const dirEls = [];
for (let i = 0; i < 4; i++) { const e = document.createElement('i'); hud.dirs.appendChild(e); dirEls.push({ e, t: 0 }); }
let dirI = 0;
function dmgIndicator(from) {
  if (!from) return; const dx = from.x - P.pos.x, dz = from.z - P.pos.z;
  const fwd = -Math.sin(P.yaw) * dx + -Math.cos(P.yaw) * dz, right = Math.cos(P.yaw) * dx + -Math.sin(P.yaw) * dz;
  const a = Math.atan2(right, fwd); const D = dirEls[dirI++ % 4]; D.e.style.transform = `rotate(${a}rad)`; D.t = 1.2; D.e.style.opacity = 1;
}
const _pv = v3();
function projectToScreen(p) { _pv.copy(p).project(camera); const behind = _pv.z > 1; let x = (_pv.x * 0.5 + 0.5) * innerWidth, y = (-_pv.y * 0.5 + 0.5) * innerHeight; if (behind) { x = innerWidth - x; y = innerHeight - 20; } return { x, y, behind }; }
/* always 3–4 enemies on the player: if fewer are aiming at us, the nearest ones that can see us switch to us; if many more, the far extras go back to the allies */
function aggroTick(dt) {
  G.aggroT = (G.aggroT || 0) - dt; if (G.aggroT > 0 || G.cut || !P.alive) return; G.aggroT = 0.5;
  const en = G.actors.filter((a) => a.alive && a.team === 'enemy' && !a.noShoot && !a.o.passive && a.pos.distanceTo(P.pos) < (a.view || 120));
  if (!en.length) return;
  const onMe = en.filter((a) => a.target && a.target.isPlayer && a.sees);
  const want = Math.min(en.length, onMe.length >= 4 ? onMe.length : 3 + (Math.random() < 0.5 ? 1 : 0));
  if (onMe.length < want) {
    const cand = en.filter((a) => !(a.target && a.target.isPlayer)).sort((a, b) => a.pos.distanceTo(P.pos) - b.pos.distanceTo(P.pos));
    for (const a of cand) { if (onMe.length >= want) break; if (!hasLOS(a.eye(v3()), P.eyePos)) continue; a.prefP = true; a.target = PT; a.knownPos = P.pos.clone(); a.state = 'combat'; a.sees = true; onMe.push(a); }
  } else if (onMe.length > 5) {
    onMe.sort((a, b) => b.pos.distanceTo(P.pos) - a.pos.distanceTo(P.pos));
    for (const a of onMe.slice(0, onMe.length - 5)) if (a.pos.distanceTo(P.pos) > 20) a.prefP = false;
  }
}
function updateHUD(dt) {
  tutTick(dt); aggroTick(dt);
  const w = curW(), st = P.ammo[curId()] || { mag: 0, res: 0 };
  hud.wname.textContent = w.name;
  if (w.noFire || w.noAmmo) { hud.mag.textContent = ''; hud.res.textContent = w.special === 'naval' ? ((G.navalCd || 0) > G.time ? `재장전 ${Math.ceil(G.navalCd - G.time)}s` : '사격 준비') : ''; }
  else { hud.mag.textContent = st.mag; hud.res.textContent = st.res > 9000 ? '/ ∞' : '/ ' + st.res; hud.mag.classList.toggle('low', st.mag <= Math.ceil((w.mag ?? 1) * 0.25)); }
  hud.nades.textContent = '●'.repeat(Math.min(P.nades, 6));
  // crosshair spread
  const spread = (lerp(w.sh ?? 0.03, w.sa ?? 0, P.ads) + Math.min(P.speed / 4.4, 1.4) * 0.02 * (1 - P.ads)) * innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  const xk = SET.xhair ?? 0.5; hud.xh.style.setProperty('--s', Math.max(1.5 + 4 * xk, spread * (0.45 + 0.55 * xk)) + 'px'); hud.xh.style.setProperty('--L', (2 + 8 * xk) + 'px'); hud.xh.style.setProperty('--T', (1 + xk) + 'px'); hud.xh.classList.toggle('nodot', !(SET.xdot ?? true));
  hud.xh.style.opacity = (xk <= 0.01 || P.ads > 0.5 || P.sprintK > 0.5 || G.cut || !P.alive || w.vm === 'binoc') ? 0 : 1;
  // mounted guns with no weapon model in view (the helicopter's K-M19, rocket pods) get a gunsight reticle instead
  { const gs = $('gsight'); if (gs) gs.classList.toggle('on', !!(w.mounted && w.vm === 'none' && !G.cut && P.alive)); }
  updateLockPrompt();
  hud.xh.classList.toggle('ally', !!G.aimAlly);
  // damage vignette
  const k = clamp(1 - P.hp / 100, 0, 1); hud.vig.style.opacity = (k * 1.1).toFixed(3);
  if (P.hp < 35 && P.alive) { G.hbT = (G.hbT || 0) - dt; if (G.hbT <= 0) { G.hbT = 0.9; SFX.heartbeat(); } }
  for (const D of dirEls) { if (D.t > 0) { D.t -= dt; D.e.style.opacity = clamp(D.t, 0, 1); } }
  // SAM seeker box
  { const lb = $('lockBox'); const t = P.lockSeek; if (t && t.alive && curId() === 'sam' && P.ads > 0.8) { const sc = projectToScreen(t.pos); lb.hidden = false; lb.style.transform = `translate(${sc.x}px,${sc.y}px)`; lb.classList.toggle('locked', !!P.lockTgt); lb.textContent = P.lockTgt ? 'LOCK' : ''; } else lb.hidden = true; }
  // overlays
  const ov = (w.overlay && P.ads > 0.85 && !G.cut) ? w.overlay : '';
  hud.binoc.className = ov ? 'on ' + ov : '';
  $('binocFx').className = (ov === 'binoc' || ov === 'desig') ? 'on ' + ov : '';
  // grenade warnings
  let ni = 0; const nb = $('nadeIcons');
  for (const pr of G.projs) { if (pr.kind !== 'grenade' || pr.team === 'player' || !pr.alive) continue; const d = pr.pos.distanceTo(P.pos); if (d > 13) continue;
    let el = nb.children[ni]; if (!el) { el = document.createElement('div'); el.className = 'nade'; el.textContent = '💣'; nb.appendChild(el); } el.hidden = false;
    const sc = projectToScreen(pr.pos); const m2 = 50; el.style.transform = `translate(${clamp(sc.x, m2, innerWidth - m2)}px,${clamp(sc.y, m2, innerHeight - m2)}px)`; el.style.opacity = d < 8 ? 1 : 0.6; ni++; }
  for (let k = ni; k < nb.children.length; k++) nb.children[k].hidden = true;
  // stealth suspicion markers above enemy heads
  { let si = 0; const sb = $('susIcons');
    if (G.stealth && !G.cut) for (const a of G.actors) { if (!a.alive || a.team !== 'enemy' || !(a.sus > 0.04) || (a.state === 'combat' && G.time - (a.alertT || (a.alertT = G.time)) > 1.5)) continue; const sc = projectToScreen(a.pos.clone().add(v3(0, 2.25, 0))); if (sc.behind) continue;
      let el = sb.children[si]; if (!el) { el = document.createElement('div'); el.className = 'sus'; el.innerHTML = '<i></i><b>?</b>'; sb.appendChild(el); } el.hidden = false;
      const full = a.state === 'combat'; el.classList.toggle('full', full); el.querySelector('b').textContent = full ? '!' : '?'; el.querySelector('i').style.height = Math.round((full ? 1 : a.sus) * 100) + '%';
      el.style.transform = `translate(${sc.x}px,${sc.y}px)`; si++; }
    for (let k = si; k < sb.children.length; k++) sb.children[k].hidden = true; }
  // suppression
  G.supp = Math.max(0, (G.supp || 0) - dt * 0.6); $('suppress').style.opacity = Math.min(0.85, G.supp).toFixed(2);
  hud.nvg.hidden = !G.nvg; canvas.classList.toggle('nvg', !!G.nvg);
  const under = G.waterY > -900 && camera.position.y < G.waterY + 0.05 && !(G.onDeck && G.onDeck(camera.position)); $('underwater').style.opacity = under ? 1 : 0;
  if (G.ringT > 0) { G.ringT -= dt; hud.ring.style.opacity = clamp(G.ringT / 2.5, 0, 0.8); if (!G.ringSnd) { SFX.ring(2.5); G.ringSnd = true; } } else { hud.ring.style.opacity = 0; G.ringSnd = false; }
  // interactables focus
  G.focusIt = null; let bd = 99;
  if (!G.cut && P.alive && !P.frozen) {
    camera.getWorldDirection(_d);
    for (const it of G.interactables) { if (it.disabled) continue; const dv = v3().subVectors(it.pos, P.eyePos); const d = dv.length(); if (d > it.r) continue; const dot = dv.normalize().dot(_d); if (dot < (d < 1.2 ? 0.2 : 0.75)) continue; if (d < bd) { bd = d; G.focusIt = it; } }
  }
  if (G.focusIt) { hud.prompt.hidden = false; hud.prompt.innerHTML = `<kbd>F</kbd> ${G.focusIt.label}`; } else hud.prompt.hidden = true;
  // ally name under crosshair
  G.aimAlly = null;
  G.aimDead = null;
  if (!G.cut) { camera.getWorldDirection(_d); for (const a of G.actors) { if (a.team !== 'ally') continue; if (!a.alive) { if (G.aimDead || !a.name) continue; const c = v3(a.pos.x, a.pos.y + 0.25, a.pos.z); const dv = c.sub(P.eyePos); const d = dv.length(); if (d < 9 && dv.normalize().dot(_d) > 1 - 0.35 / d) G.aimDead = a; continue; } const c = a.chest(v3()); const dv = c.sub(P.eyePos); const d = dv.length(); if (d > 40) continue; if (dv.normalize().dot(_d) > 1 - 0.18 / d) { G.aimAlly = a; break; } } }
  hud.ally.textContent = G.aimAlly ? (G.aimAlly.name || (G.allyStyle === 'usmc' ? '미 해병' : '아군')) : G.aimDead ? G.aimDead.name + ' (전사)' : '';
  hud.ally.classList.toggle('dead', !G.aimAlly && !!G.aimDead);
  // waypoint
  if (G.objPos && !G.cut) {
    const s = projectToScreen(G.objPos.clone().add(v3(0, 1.2, 0)));
    const m = 40; const x = clamp(s.x, m, innerWidth - m), y = clamp(s.y, m + 40, innerHeight - m - 60);
    hud.marker.hidden = false; hud.marker.style.transform = `translate(${x}px,${y}px)`;
    hud.marker.querySelector('span').textContent = Math.round(G.objPos.distanceTo(P.pos)) + 'm';
  } else hud.marker.hidden = true;
  if (G.tutPos && !G.cut) { const s2 = projectToScreen(G.tutPos.clone().add(v3(0, 0.6, 0))); const m2 = 40; const tm = $('tmark'); tm.hidden = false; tm.style.transform = `translate(${clamp(s2.x, m2, innerWidth - m2)}px,${clamp(s2.y, m2 + 40, innerHeight - m2 - 60)}px)`; tm.querySelector('span').textContent = '여기! ' + Math.round(G.tutPos.distanceTo(P.pos)) + 'm'; } else $('tmark').hidden = true;
  { const ms = (G.sqMarks && !G.cut) ? G.sqMarks.filter((a) => a.alive) : []; G.sqEls = G.sqEls || [];
    while (G.sqEls.length < ms.length) { const e = document.createElement('div'); e.className = 'sqm'; e.innerHTML = '<i></i>'; $('hud').appendChild(e); G.sqEls.push(e); }
    G.sqEls.forEach((e, i) => { const a = ms[i]; if (!a) { e.hidden = true; return; } const s3 = projectToScreen(a.pos.clone().add(v3(0, 2.3, 0))); e.hidden = false; e.style.transform = `translate(${clamp(s3.x, 30, innerWidth - 30)}px,${clamp(s3.y, 70, innerHeight - 80)}px)`; }); }
  if (G.navalMark && G.navalMark.t > G.time) { /* show strike marker */ const s = projectToScreen(G.navalMark.pos); hud.strike.hidden = s.behind; hud.strike.style.transform = `translate(${s.x}px,${s.y}px)`; } else hud.strike.hidden = true;
  if (G.timerEnd) { const r = Math.max(0, G.timerEnd - G.time); hud.timer.hidden = false; hud.timer.innerHTML = (G.timerLabel ? `<small>${G.timerLabel}</small>` : '') + (G.timerFmt ? G.timerFmt(r) : `${Math.floor(r / 60)}:${String(Math.floor(r % 60)).padStart(2, '0')}`); } else if (!G.timerText) hud.timer.hidden = true;
  drawMinimap();
}
hud.strike = $('strike');
function drawMinimap() {
  const c = mmx, W = 180, R = 86, scale = G.mmScale || 1.4;
  c.clearRect(0, 0, W, W); c.save(); c.translate(W / 2, W / 2);
  c.beginPath(); c.arc(0, 0, R, 0, TAU); c.clip();
  c.fillStyle = 'rgba(14,17,15,.62)'; c.fillRect(-R, -R, 2 * R, 2 * R);
  const cy = Math.cos(P.yaw), sy = Math.sin(P.yaw);
  const tr = (x, z) => { const dx = x - P.pos.x, dz = z - P.pos.z; return [(dx * cy - dz * sy) * scale, (dx * sy + dz * cy) * scale]; };
  c.fillStyle = 'rgba(160,165,155,.28)';
  for (const col of G.colliders) {
    if (col.max.y - col.min.y < 1.6 || col.min.y > P.pos.y + 4) continue;
    const mx = (col.min.x + col.max.x) / 2, mz = (col.min.z + col.max.z) / 2; if (Math.abs(mx - P.pos.x) > 100 || Math.abs(mz - P.pos.z) > 100) continue;
    const pts = [tr(col.min.x, col.min.z), tr(col.max.x, col.min.z), tr(col.max.x, col.max.z), tr(col.min.x, col.max.z)];
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < 4; i++) c.lineTo(pts[i][0], pts[i][1]); c.fill();
  }
  if (G.mmExtra) G.mmExtra(c, tr);
  for (const v of G.vehicles) { if (!v.alive || v.type === 'car') continue; if (v.team === 'enemy' && !(G.time - (v.lastFire || -9) < 4 || v.pos.distanceTo(P.pos) < 40 || G.markAll)) continue; const [x, y] = tr(v.pos.x, v.pos.z); c.fillStyle = v.team === 'enemy' ? '#e0483a' : '#7fc66b'; c.fillRect(x - 4, y - 4, 8, 8); }
  for (const a of G.actors) {
    if (!a.alive) continue; const [x, y] = tr(a.pos.x, a.pos.z);
    if (a.team === 'enemy') { if (!(G.time - a.lastFire < 2.5 || a.pos.distanceTo(P.pos) < 9 || G.markAll || a.marked)) continue; c.fillStyle = '#e0483a'; }
    else if (a.team === 'ally') c.fillStyle = a.hero ? '#c9f0a8' : '#7fc66b'; else c.fillStyle = '#d8d2c0';
    c.beginPath(); c.arc(x, y, a.hero ? 3.4 : 2.6, 0, TAU); c.fill();
  }
  if (G.objPos) { const [x, y] = tr(G.objPos.x, G.objPos.z); const d = Math.hypot(x, y); const k = d > R - 8 ? (R - 8) / d : 1; c.fillStyle = '#f0b43c'; c.beginPath(); const X = x * k, Y = y * k; c.moveTo(X, Y - 6); c.lineTo(X + 5, Y); c.lineTo(X, Y + 6); c.lineTo(X - 5, Y); c.fill(); }
  c.restore();
  c.fillStyle = '#f2efe6'; c.beginPath(); c.moveTo(W / 2, W / 2 - 7); c.lineTo(W / 2 + 5, W / 2 + 5); c.lineTo(W / 2, W / 2 + 2); c.lineTo(W / 2 - 5, W / 2 + 5); c.fill();
  c.strokeStyle = 'rgba(242,239,230,.35)'; c.lineWidth = 1.5; c.beginPath(); c.arc(W / 2, W / 2, R, 0, TAU); c.stroke();
  // north tick
  const nd = tr(P.pos.x, P.pos.z - 1); const nl = Math.hypot(nd[0], nd[1]) || 1;
  c.fillStyle = '#f0b43c'; c.font = '600 11px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', W / 2 + nd[0] / nl * R * 0.84, W / 2 + nd[1] / nl * R * 0.84);
}
