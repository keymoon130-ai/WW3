/* ---------------- menus ---------------- */
const SCREENS = ['menu', 'campaign', 'settings', 'controls', 'pause', 'intel', 'fail', 'done'];
function hideScreens() { for (const s of SCREENS) $(s).hidden = true; }
function showScreen(id) { hideScreens(); $(id).hidden = false; }
let menuStack = [];
function openScreen(id) { menuStack.push(SCREENS.find((s) => !$(s).hidden) || 'menu'); showScreen(id); SFX.ui(); }
function menuBack() { const prev = menuStack.pop() || 'menu'; showScreen(prev); }
function toMenu() {
  abortScripts(); G.token++; G.mode = 'menu'; stopAllSounds(); G.paused = false; $('hud').hidden = true; document.body.classList.remove('cine'); G.nvg = false; canvas.classList.remove('nvg'); $('nvg').hidden = true;
  if (document.pointerLockElement) document.exitPointerLock();
  buildMenuScene(); menuStack = []; showScreen('menu'); $('fade').style.opacity = 0;
  if (AU.ctx) playMusic('title');
  if (G.onLeave) { G.onLeave(); G.onLeave = null; } if (G.envReset) { G.envReset(); G.envReset = null; } G.realism = false; if (G.onMenu) G.onMenu();
}
function showMissionDetail(i) {
  const m = MISSIONS[i]; let d = $('mDetail'); if (!d) { d = document.createElement('div'); d.id = 'mDetail'; $('campaign').appendChild(d); }
  d.innerHTML = `<div class="md-box"><div class="eyebrow">${m.act} · ${m.num}</div><h2>${m.title}</h2>
    <p class="md-desc">${m.desc || '작전 설명 준비 중'}</p>
    <dl class="md-meta"><dt>일시</dt><dd>${m.dateText}</dd><dt>장소</dt><dd>${m.place}</dd><dt>인물</dt><dd>${m.who}</dd>${m.foeText ? `<dt>적</dt><dd>${m.foeText}</dd>` : ''}</dl>
    <div class="md-btns"><button class="md-go">작전 시작</button><button class="back md-close">닫기</button></div></div>`;
  d.hidden = false; d.querySelector('.md-go').onclick = () => { SFX.uiOk(); d.hidden = true; startMission(i); };
  d.querySelector('.md-close').onclick = () => { d.hidden = true; }; d.onclick = (e) => { if (e.target === d) d.hidden = true; };
}
function buildCampaignList() {
  const box = $('missionList'); box.innerHTML = '';
  let act = null;
  MISSIONS.forEach((m, i) => {
    if (m.hidden) return;
    if (m.act !== act) { act = m.act; const h = document.createElement('h3'); h.textContent = m.act; box.appendChild(h); }
    const b = document.createElement('button'); b.className = 'mrow' + (progress[m.id] ? ' done' : '');
    b.innerHTML = `<span class="mnum">${m.num}</span><span class="mtitle">${m.title}</span><span class="mmeta">${m.dateShort} · ${m.placeShort || m.place}</span><span class="mwho">${m.whoShort || ''}</span>`;
    b.onclick = () => { SFX.uiOk(); showMissionDetail(i); };
    box.appendChild(b);
  });
}
function bindMenus() {
  $('btnStart').onclick = () => { initAudio(); const i = MISSIONS.findIndex((m) => !progress[m.id]); startMission(i < 0 ? 0 : i); };
  $('btnStart').textContent = Object.keys(progress).length ? '이어하기' : '캠페인 시작';
  $('btnMissions').onclick = () => { initAudio(); buildCampaignList(); openScreen('campaign'); };
  $('btnSettings').onclick = () => { initAudio(); openScreen('settings'); };
  $('btnControls').onclick = () => { initAudio(); openScreen('controls'); };
  document.querySelectorAll('[data-back]').forEach((b) => (b.onclick = () => { SFX.ui(); menuBack(); }));
  $('btnResume').onclick = () => resume();
  $('btnRestartCp').onclick = () => startMission(G.missionIdx, G.phaseI, true);
  $('btnRestart').onclick = () => startMission(G.missionIdx, 0);
  $('btnPauseSettings').onclick = () => openScreen('settings');
  $('btnIntel').onclick = () => { renderIntel(); openScreen('intel'); };
  $('btnQuit').onclick = () => toMenu();
  $('btnRetry').onclick = () => startMission(G.missionIdx, G.phaseI, true);
  $('btnRetryStart').onclick = () => startMission(G.missionIdx, 0);
  $('btnFailQuit').onclick = () => toMenu();
  $('btnNext').onclick = () => startMission(G.missionIdx + 1);
  $('btnDoneMenu').onclick = () => toMenu();
  // settings
  const bind = (id, key, fmt, after) => { const el = $(id), out = $(id + 'V'); el.value = SET[key]; const show = () => (out.textContent = fmt(SET[key])); show(); el.oninput = () => { SET[key] = +el.value; show(); store.set('tumen_set', SET); if (after) after(); }; };
  bind('setSens', 'sens', (v) => v.toFixed(2));
  bind('setVol', 'vol', (v) => Math.round(v * 100) + '%', setVolumes);
  bind('setMusic', 'music', (v) => Math.round(v * 100) + '%', setVolumes);
  bind('setBright', 'bright', (v) => Math.round(v * 100) + '%', () => { renderer.toneMappingExposure = (G.env.exposure || 1) * 1.12 * SET.bright; });
  bind('setFov', 'fov', (v) => v + '°', () => { if (G.mode !== 'play') { camera.fov = SET.fov; camera.updateProjectionMatrix(); } });
  const seg = (id, key, vals) => { const box = $(id); box.querySelectorAll('button').forEach((b, i) => { b.classList.toggle('on', String(SET[key]) === String(vals[i])); b.onclick = () => { SET[key] = vals[i]; store.set('tumen_set', SET); box.querySelectorAll('button').forEach((x, j) => x.classList.toggle('on', j === i)); if (key === 'quality') applyQuality(); SFX.ui(); }; }); };
  seg('setDiff', 'diff', [0, 1, 2]); seg('setQual', 'quality', ['low', 'high', 'ultra']); seg('setAds', 'adsToggle', [true, false]); seg('setDot', 'xdot', [true, false]); seg('setSpark', 'sparks', [true, false]);
  bind('setXh', 'xhair', (v) => (v <= 0.01 ? '끔' : v.toFixed(2)));
  bind('setRdot', 'rdot', (v) => v.toFixed(2), () => { if (VM.dot) VM.dot.scale.setScalar(0.25 + 1.25 * SET.rdot); });
  $('btnReset').onclick = () => { progress = {}; store.set('tumen_prog', progress); buildCampaignList(); $('btnStart').textContent = '캠페인 시작'; };
}

/* ---------------- menu backdrop scene ---------------- */
function buildMenuScene() {
  newWorld();
  applyEnv({ sky: [0x05080d, 0x141a24, 0x1a1e24], glow: 0x5a2a10, glowDir: [0.2, 0.05, -1], fog: 0x131820, fogD: 0.011, hemi: [0x6a7a90, 0x101010, 0.35], sun: [0x8090b0, 0.35], sunDir: [-0.3, 1, -0.4], stars: true, snow: 0.6, exposure: 1.05 });
  G.groundAt = (x, z) => { const r = z < -20 && z > -70 ? -1.2 * smooth(clamp((-20 - z) / 6, 0, 1)) * smooth(clamp((z + 70) / 6, 0, 1)) : 0; return r + (z > -18 ? Math.sin(x * 0.05) * 0.4 : 0); };
  buildTerrain(500, 120, 'snow', 8);
  addMesh(new THREE.PlaneGeometry(500, 46).rotateX(-Math.PI / 2), mat('ice', { map: 'ice', rough: 0.3, metal: 0.1 }), 0, -0.95, -45, { cast: false });
  buildMountains(600, 30);
  guardPost(-6, -12);
  sandbags(4, -15, 6, 0.1); sandbags(10, -14, 5, -0.3);
  wire(-30, -18, 30, -18);
  for (let i = 0; i < 18; i++) pine(rand(-80, 80), rand(5, 60), rand(0.8, 1.4));
  for (let i = 0; i < 14; i++) pine(rand(-160, 160), rand(-130, -85), rand(1, 1.6));
  for (let i = 0; i < 4; i++) addEmitter(v3(rand(-140, 140), 0, rand(-140, -100)), 'fire', 3, 12);
  for (let i = 0; i < 4; i++) addEmitter(v3(rand(-140, 140), 4, rand(-140, -100)), 'smoke', 3, 1.5);
  mergeStatic();
  G.menuT = 0;
}
function menuTick(dt) {
  G.menuT += dt; const t = G.menuT * 0.03;
  camera.position.set(Math.sin(t) * 6 + 2, 2.4, 6 + Math.cos(t) * 2);
  camera.lookAt(Math.sin(t * 0.7) * 20, 1.5, -90);
  if (camera.fov !== SET.fov) { camera.fov = SET.fov; camera.updateProjectionMatrix(); updateParticleScale(); }
  if (Math.random() < dt * 0.5) { const p = v3(rand(-200, 200), rand(2, 30), rand(-260, -160)); for (let i = 0; i < 3; i++) particle({ add: true, x: p.x, y: p.y, z: p.z, life: 0.25, size: rand(15, 35), alpha: 0.7, color: [1, 0.6, 0.3] }); flashLight(p, 0xff9040, 40, 200, 0.3); if (AU.ctx) SFX.boomFar(p); }
  updateParticles(dt); updateEmitters(dt); updateSnow(dt); updateLights(dt);
}

/* ---------------- ambient battle ---------------- */
function ambientBattle(dt) {
  const E = G.env;
  if (E.flashes && Math.random() < dt * E.flashes) {
    const a = rand(0, TAU); const p = E.flashDir ? v3(P.pos.x + E.flashDir[0] * rand(200, 400) + rand(-150, 150), rand(0, 20), P.pos.z + E.flashDir[1] * rand(200, 400) + rand(-150, 150)) : v3(P.pos.x + Math.cos(a) * rand(250, 500), rand(0, 20), P.pos.z + Math.sin(a) * rand(250, 500));
    for (let i = 0; i < 3; i++) particle({ add: true, x: p.x, y: p.y + 5, z: p.z, life: 0.3, size: rand(20, 40), alpha: 0.8, color: [1, 0.6, 0.3] });
    SFX.boomFar(p);
  }
  // the whole front is fighting: distant bursts from every direction, mid-range fire, tracers in the sky
  const bat = (E.battle || 0) * 2.6 * (G.cut ? 0.6 : 1);
  if (bat && Math.random() < dt * bat) {
    const a = rand(0, TAU); const far = Math.random() < 0.6; const p = v3(P.pos.x + Math.cos(a) * (far ? rand(150, 380) : rand(70, 140)), 2, P.pos.z + Math.sin(a) * (far ? rand(150, 380) : rand(70, 140)));
    const mg = Math.random() < 0.35, n = mg ? randi(8, 20) : randi(3, 10), gap = mg ? rand(0.07, 0.1) : rand(0.1, 0.25);
    for (let i = 0; i < n; i++) setGameTimeout(() => SFX.shot(mg ? 'mg' : Math.random() < 0.5 ? 'enemy' : 'rifle', p), i * gap + rand(0, 0.03));
    if (!far && Math.random() < 0.5 && !G.cut) { const to = v3(P.pos.x + Math.cos(a + rand(1, 2)) * rand(60, 160), rand(8, 40), P.pos.z + Math.sin(a + rand(1, 2)) * rand(60, 160)); for (let i = 0; i < Math.min(n, 6); i++) setGameTimeout(() => tracer(p.clone().add(v3(0, rand(0, 3), 0)), to.clone().add(v3(rand(-8, 8), rand(-4, 4), rand(-8, 8))), Math.random() < 0.5 ? [1, 0.45, 0.3] : [0.5, 1, 0.5], 280), i * gap); }
  }
  if (bat && Math.random() < dt * bat * 0.15) { const a = rand(0, TAU); SFX.boomFar(v3(P.pos.x + Math.cos(a) * rand(200, 500), 0, P.pos.z + Math.sin(a) * rand(200, 500))); }
}
