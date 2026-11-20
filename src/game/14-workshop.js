/* ---------------- workshop (developer only) ----------------
   Ctrl + O + P toggles admin mode in any mission or the title screen (nothing on screen advertises it); in admin mode F2 opens the workshop:
   - 모델: every vehicle / aircraft / ship / soldier model, part by part — move, turn, scale, recolour, hide
   - 재질: every named material — colour, roughness, metal, glow, opacity, texture; click anything in the world to pick its material
   - 텍스처: every drawn texture — hue, saturation, brightness, contrast, blur, tiling, or a replacement image
   Edits are saved in this browser at once; "값 복사" gives the JSON to bake into ART_BAKED (engine/04b-art.js). */

/* every model builder, wrapped so its parts are numbered and the overrides applied (the index lists say which arguments change the build) */
makeTankMesh = artWrapModel('makeTankMesh', makeTankMesh, [1, 2]); makeBMPMesh = artWrapModel('makeBMPMesh', makeBMPMesh); makeK21Mesh = artWrapModel('makeK21Mesh', makeK21Mesh);
makeK808Mesh = artWrapModel('makeK808Mesh', makeK808Mesh, [1]); makeK2Mesh = artWrapModel('makeK2Mesh', makeK2Mesh); makeJetMesh = artWrapModel('makeJetMesh', makeJetMesh);
makeAPCMesh = artWrapModel('makeAPCMesh', makeAPCMesh, [1]); makeTruckMesh = artWrapModel('makeTruckMesh', makeTruckMesh); makeHeliMesh = artWrapModel('makeHeliMesh', makeHeliMesh, [1, 2]);
makeBoat = artWrapModel('makeBoat', makeBoat); makeHover = artWrapModel('makeHover', makeHover); makeAAV = artWrapModel('makeAAV', makeAAV); makeShip = artWrapModel('makeShip', makeShip, [0, 1, 2]);
makeDestroyer = artWrapModel('makeDestroyer', makeDestroyer); makeLHD = artWrapModel('makeLHD', makeLHD); makeACV = artWrapModel('makeACV', makeACV);
makeTransportMesh = artWrapModel('makeTransportMesh', makeTransportMesh); makeLocoMesh = artWrapModel('makeLocoMesh', makeLocoMesh); makeCoachMesh = artWrapModel('makeCoachMesh', makeCoachMesh, [0]);
makeDroneMesh = artWrapModel('makeDroneMesh', makeDroneMesh); makeBusMesh = artWrapModel('makeBusMesh', makeBusMesh); makeSoldierMesh = artWrapModel('makeSoldierMesh', makeSoldierMesh, [0, 1]);
makeOsprey = artWrapModel('makeOsprey', makeOsprey); makeTrainCar = artWrapModel('makeTrainCar', makeTrainCar, [0]);
const WS_FN = { makeTankMesh, makeBMPMesh, makeK21Mesh, makeK808Mesh, makeK2Mesh, makeJetMesh, makeAPCMesh, makeTruckMesh, makeHeliMesh, makeBoat, makeHover, makeAAV, makeShip, makeDestroyer, makeLHD, makeACV, makeTransportMesh, makeLocoMesh, makeCoachMesh, makeDroneMesh, makeBusMesh, makeSoldierMesh, makeOsprey, makeTrainCar };
const WS_MODELS = [
  ['K2 전차', 'makeK2Mesh', []], ['아군 전차', 'makeTankMesh', [0x4f5539, false, { style: 'ally' }]], ['적 전차', 'makeTankMesh', [0x6a6e66]], ['적 장갑차 (궤도)', 'makeTankMesh', [0x6d716a, true]],
  ['적 BMP', 'makeBMPMesh', [0x6a6e5c]], ['K21 보병전투차', 'makeK21Mesh', []], ['K808 차륜형', 'makeK808Mesh', []], ['K808 (실사형)', 'makeK808Mesh', [undefined, true]], ['트럭', 'makeTruckMesh', []], ['버스', 'makeBusMesh', [0x2f6a46]],
  ['수송 헬기', 'makeHeliMesh', [0x3e4336]], ['수송 헬기 (문 열림)', 'makeHeliMesh', [0x3e4336, false, true]], ['공격 헬기', 'makeHeliMesh', [0x3e4336, true]], ['전투기', 'makeJetMesh', []], ['수송기', 'makeTransportMesh', []], ['오스프리', 'makeOsprey', []], ['드론', 'makeDroneMesh', []],
  ['상륙 보트', 'makeBoat', []], ['공기부양정', 'makeHover', []], ['AAV', 'makeAAV', []], ['ACV 상륙장갑차', 'makeACV', [0x5b6150, 'B-24']], ['상륙함 (150m)', 'makeShip', [150, 18, 12]], ['소형 함정 (60m)', 'makeShip', [60, 10, 6]], ['세종대왕함', 'makeDestroyer', ['991']], ['강습상륙함', 'makeLHD', []],
  ['기관차', 'makeLocoMesh', []], ['객차', 'makeCoachMesh', []], ['전동차', 'makeTrainCar', [20, 0x2a5a8a]],
  ['국군 병사', 'makeSoldierMesh', ['rok']], ['미 해병', 'makeSoldierMesh', ['usmc']], ['적군 (회색)', 'makeSoldierMesh', ['enemy']], ['적군 (녹색)', 'makeSoldierMesh', ['enemy2']], ['민간인', 'makeSoldierMesh', ['rok', { civ: 0x2c3850, unarmed: true }]],
];
const WS_TEXNAMES = ['snow', 'snowdirt', 'dirt', 'grass', 'sand', 'concrete', 'asphalt', 'road', 'wood', 'sandbag', 'metal', 'rust', 'container', 'ice', 'brick', 'tent', 'rok', 'usmc', 'enemy', 'enemy2'];
const WS_TEXLABEL = { snow: '눈', snowdirt: '눈 섞인 흙', dirt: '흙', grass: '풀밭', sand: '모래', concrete: '콘크리트', asphalt: '아스팔트', road: '도로', wood: '나무', sandbag: '모래주머니', metal: '금속', rust: '녹슨 철', container: '컨테이너', ice: '얼음', brick: '벽돌', tent: '천막', rok: '국군 위장무늬', usmc: '해병 위장무늬', enemy: '적 위장무늬 (회색)', enemy2: '적 위장무늬 (녹색)', facade: '건물 외벽 (전체)' };

const WS = { open: false, tab: 'model', local: null, sel: null, keys: {}, drag: null, orb: { yaw: 0.8, pitch: 0.35, dist: 12, t: new THREE.Vector3(0, 1.5, 0) }, fly: { yaw: 0, pitch: 0 } };
function wsLocal() { if (!WS.local) { WS.local = store.get('ww3_art', null) || {}; for (const k of ['tex', 'mat', 'model']) WS.local[k] = WS.local[k] || {}; } return WS.local; }
function wsSave() { store.set('ww3_art', WS.local); artReload(); }

/* ---- the screen ---- */
function wsBuild() {
  if (WS.el) return;
  const st = document.createElement('style'); st.textContent = `
#ws{position:fixed;inset:0;z-index:9000;pointer-events:none;font:13px/1.45 system-ui,'Malgun Gothic',sans-serif;color:#dfe3e6}
#ws[hidden]{display:none}
body.wsOn #hud,body.wsOn #clickLock{visibility:hidden!important}
#wsView{position:absolute;inset:0 380px 0 0;pointer-events:auto;cursor:crosshair}
#wsPanel{position:absolute;top:0;right:0;bottom:0;width:380px;pointer-events:auto;background:rgba(18,20,23,.95);border-left:1px solid #343a40;display:flex;flex-direction:column}
#wsPanel header{padding:10px 12px 0;display:flex;flex-direction:column;gap:8px;border-bottom:1px solid #2c3136}
#wsPanel .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
#wsPanel h3{margin:0;font-size:15px;letter-spacing:.04em}
#wsTabs{display:flex;gap:2px}
#wsTabs button{flex:1;border-radius:6px 6px 0 0;border-bottom:none}
#wsTabs button.on{background:#c9a227;color:#111;border-color:#c9a227}
#wsBody{flex:1;overflow:auto;padding:10px 12px 16px;display:flex;flex-direction:column;gap:10px}
#ws button{background:#2a2f35;color:#dfe3e6;border:1px solid #3b4249;border-radius:6px;padding:5px 9px;font:inherit;cursor:pointer}
#ws button:hover{background:#353b42}
#ws button.warn{border-color:#8a3a30}
#ws select,#ws input[type=text],#ws input[type=number],#ws textarea{background:#101215;color:#e6e9eb;border:1px solid #3b4249;border-radius:5px;padding:4px 6px;font:inherit}
#ws input[type=number]{width:74px}
#ws select{width:100%}
#ws .note{color:#8d969e;font-size:12px}
#ws .grid3{display:grid;grid-template-columns:42px 1fr 1fr 1fr;gap:4px 6px;align-items:center}
#ws .grid2{display:grid;grid-template-columns:78px 1fr 46px;gap:5px 8px;align-items:center}
#ws .grid2 output{text-align:right;color:#aab2b9;font-variant-numeric:tabular-nums}
#ws input[type=range]{width:100%}
#ws input[type=color]{width:46px;height:26px;padding:0;border:1px solid #3b4249;background:none}
#wsParts{max-height:260px;overflow:auto;border:1px solid #2c3136;border-radius:6px}
#wsParts div{padding:2px 8px;cursor:pointer;white-space:nowrap;font-size:12px}
#wsParts div:hover{background:#262b30}
#wsParts div.on{background:#c9a227;color:#111}
#wsParts div.hid{opacity:.45}
#wsSel{border:1px solid #2c3136;border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:8px}
#wsPrev{width:100%;aspect-ratio:1;image-rendering:pixelated;border:1px solid #2c3136;border-radius:6px;background:#000}
#wsModal{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;pointer-events:auto}
#wsModal[hidden]{display:none}
#wsModal>div{width:min(640px,90vw);background:#16191c;border:1px solid #3b4249;border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px}
#wsModal textarea{height:300px;font:12px/1.4 ui-monospace,monospace}
#wsHelp{position:absolute;left:12px;bottom:12px;pointer-events:none;background:rgba(0,0,0,.55);padding:6px 10px;border-radius:6px;font-size:12px;color:#cfd5da}`;
  document.head.appendChild(st);
  const el = document.createElement('div'); el.id = 'ws'; el.hidden = true;
  el.innerHTML = `<div id="wsView"></div><div id="wsHelp"></div>
<div id="wsPanel"><header>
  <div class="row" style="justify-content:space-between"><h3>작업실</h3><button id="wsClose">닫기 (F2)</button></div>
  <div class="row"><button id="wsCopy">값 복사</button><button id="wsPaste">값 붙여넣기</button><button id="wsWipe" class="warn">전체 초기화</button></div>
  <div id="wsTabs"><button data-t="model">모델</button><button data-t="mat">재질</button><button data-t="tex">텍스처</button></div>
</header><div id="wsBody"></div></div>
<div id="wsModal" hidden><div><b id="wsMT"></b><textarea id="wsMX" spellcheck="false"></textarea><div class="row"><button id="wsMOk">적용</button><button id="wsMNo">닫기</button><span class="note" id="wsMN"></span></div></div></div>`;
  document.body.appendChild(el); WS.el = el;
  $('wsClose').onclick = wsClose;
  el.querySelectorAll('#wsTabs button').forEach((b) => (b.onclick = () => wsTab(b.dataset.t)));
  $('wsCopy').onclick = wsCopy; $('wsPaste').onclick = () => wsModal('붙여넣기 — 복사해 둔 값을 넣고 적용', '', true);
  $('wsWipe').onclick = () => { const b = $('wsWipe'); if (!b.dataset.arm) { b.dataset.arm = 1; b.textContent = '한 번 더 누르면 초기화'; setTimeout(() => { delete b.dataset.arm; b.textContent = '전체 초기화'; }, 3000); return; } delete b.dataset.arm; b.textContent = '전체 초기화'; WS.local = { tex: {}, mat: {}, model: {} }; wsSave(); wsReapplyAll(); wsTab(WS.tab); toast('작업실 값 초기화'); };
  $('wsMNo').onclick = () => ($('wsModal').hidden = true);
  $('wsMOk').onclick = () => { try { const j = JSON.parse($('wsMX').value); WS.local = { tex: j.tex || {}, mat: j.mat || {}, model: j.model || {} }; wsSave(); wsReapplyAll(); $('wsModal').hidden = true; wsTab(WS.tab); toast('값 적용'); } catch (e) { $('wsMN').textContent = 'JSON 형식이 아니에요: ' + e.message; } };
  const v = $('wsView');
  v.addEventListener('pointerdown', wsDown); v.addEventListener('pointermove', wsMove); v.addEventListener('pointerup', wsUp); v.addEventListener('pointercancel', wsUp);
  v.addEventListener('wheel', (e) => { e.preventDefault(); if (WS.tab === 'model') { WS.orb.dist = clamp(WS.orb.dist * Math.exp(e.deltaY * 0.0012), 0.5, 600); } else { WS.flySpeed = clamp((WS.flySpeed || 12) * Math.exp(-e.deltaY * 0.001), 1, 300); wsHelp(); } }, { passive: false });
  v.addEventListener('contextmenu', (e) => e.preventDefault());
}
function wsModal(title, text, editable) { $('wsMT').textContent = title; $('wsMX').value = text; $('wsMX').readOnly = !editable; $('wsMOk').hidden = !editable; $('wsMN').textContent = ''; $('wsModal').hidden = false; $('wsMX').focus(); $('wsMX').select(); }
function wsCopy() {
  const txt = JSON.stringify({ tex: ART.tex, mat: ART.mat, model: ART.model });
  const done = () => toast('작업실 값을 복사했어요');
  try { navigator.clipboard.writeText(txt).then(done, () => wsModal('값 복사 — 아래 내용을 전부 복사해서 보내 주세요', txt, false)); } catch (e) { wsModal('값 복사 — 아래 내용을 전부 복사해서 보내 주세요', txt, false); }
}
function wsHelp() {
  $('wsHelp').innerHTML = WS.tab === 'model' ? '좌드래그 회전 · 우드래그 이동 · 휠 확대 · 클릭 부품 선택 (Shift+클릭: 상위 묶음)<br>선택 부품: 화살표 X/Z · PgUp/PgDn Y · Shift 미세 · Delete 숨기기'
    : `클릭 ${WS.tab === 'mat' ? '그 물체의 재질 선택' : '그 물체의 텍스처 선택'} · 우드래그 둘러보기 · WASD/QE 이동 · 휠 속도 (${(WS.flySpeed || 12).toFixed(0)} m/s)`;
}

/* ---- open / close ---- */
function wsOpen() {
  wsBuild(); wsLocal(); WS.open = true; WS.el.hidden = false;
  WS.wasPaused = G.paused; if (G.mode === 'play') G.paused = true;
  if (document.pointerLockElement) document.exitPointerLock();
  WS.camSave = { p: camera.position.clone(), q: camera.quaternion.clone(), fov: camera.fov };
  const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ'); WS.fly.yaw = e.y; WS.fly.pitch = e.x;
  document.body.classList.add('wsOn'); wsTab(WS.tab); WS.tPrev = 0; cancelAnimationFrame(WS.raf); WS.raf = requestAnimationFrame(wsFrame);
}
function wsClose() {
  WS.open = false; WS.el.hidden = true; document.body.classList.remove('wsOn'); WS.keys = {};
  if (WS.root) { WS.scene.remove(WS.root); WS.root = null; } wsSelect(null);
  if (G.mode !== 'play') { camera.position.copy(WS.camSave.p); camera.quaternion.copy(WS.camSave.q); }
  if (G.mode === 'play') { G.paused = WS.wasPaused; if (!G.paused) lockPointer(); }
}
function wsTab(t) {
  WS.tab = t; WS.el.querySelectorAll('#wsTabs button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
  if (t !== 'model' && WS.root) { WS.scene.remove(WS.root); WS.root = null; wsSelect(null); }
  $('wsBody').innerHTML = ''; wsHelp();
  if (t === 'model') wsModelTab(); else if (t === 'mat') wsMatTab(); else wsTexTab();
}
function wsReapplyAll() {
  for (const [n, t] of Object.entries(TX)) { artTexReset(t); artTex(n, t); }
  for (const [k, m] of Object.entries(MATS)) { artMatReset(m); artMat(k, m); }
}

/* ---- per-frame: cameras, fly controls, the selection box ---- */
function wsFrame(now) {
  if (!WS.open) return; WS.raf = requestAnimationFrame(wsFrame);
  const dt = Math.min(0.05, (now - (WS.tPrev || now)) / 1000); WS.tPrev = now;
  if (WS.tab === 'model') {
    const o = WS.orb; WS.cam.aspect = WS.vw() / innerHeight; WS.cam.updateProjectionMatrix();
    WS.cam.position.set(o.t.x + Math.sin(o.yaw) * Math.cos(o.pitch) * o.dist, o.t.y + Math.sin(o.pitch) * o.dist, o.t.z + Math.cos(o.yaw) * Math.cos(o.pitch) * o.dist); WS.cam.lookAt(o.t);
    if (WS.box) WS.box.update(); wsNudge(dt);
  } else {
    camera.quaternion.setFromEuler(new THREE.Euler(WS.fly.pitch, WS.fly.yaw, 0, 'YXZ'));
    const k = WS.keys, sp = (WS.flySpeed || 12) * (k.ShiftLeft || k.ShiftRight ? 3 : 1) * dt, f = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), r = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    if (k.KeyW) camera.position.addScaledVector(f, sp); if (k.KeyS) camera.position.addScaledVector(f, -sp);
    if (k.KeyD) camera.position.addScaledVector(r, sp); if (k.KeyA) camera.position.addScaledVector(r, -sp);
    if (k.KeyE) camera.position.y += sp; if (k.KeyQ) camera.position.y -= sp;
    if (sky) sky.position.copy(camera.position);
  }
}
WS.vw = () => Math.max(200, innerWidth - 380);
/* the game loop renders our model scene instead of the world while the model tab is up */
{ const rf0 = renderFrame;
  renderFrame = function (vm) {
    if (WS.open && WS.tab === 'model' && WS.scene) { renderer.setViewport(0, 0, WS.vw(), innerHeight); renderer.setScissor(0, 0, WS.vw(), innerHeight); renderer.setScissorTest(true); renderer.clear(); renderer.render(WS.scene, WS.cam); renderer.setScissorTest(false); renderer.setViewport(0, 0, innerWidth, innerHeight); return; }
    rf0(WS.open ? false : vm);
  }; }

/* ---- mouse ---- */
function wsDown(e) { WS.drag = { x: e.clientX, y: e.clientY, b: e.button, moved: 0, shift: e.shiftKey }; e.currentTarget.setPointerCapture(e.pointerId); }
function wsMove(e) {
  const d = WS.drag; if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y; d.x = e.clientX; d.y = e.clientY; d.moved += Math.abs(dx) + Math.abs(dy);
  if (WS.tab === 'model') {
    const o = WS.orb;
    if (d.b === 0) { o.yaw -= dx * 0.006; o.pitch = clamp(o.pitch + dy * 0.006, -1.5, 1.5); }
    else { const s = o.dist * 0.0016, r = new THREE.Vector3(Math.cos(o.yaw), 0, -Math.sin(o.yaw)); o.t.addScaledVector(r, -dx * s); o.t.y += dy * s; }
  } else if (d.b === 2 || d.b === 1) { WS.fly.yaw -= dx * 0.004; WS.fly.pitch = clamp(WS.fly.pitch - dy * 0.004, -1.5, 1.5); }
}
function wsUp(e) {
  const d = WS.drag; WS.drag = null; if (!d || d.moved > 5 || d.b !== 0) return;
  const r = $('wsView').getBoundingClientRect(), ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  const rc = new THREE.Raycaster();
  if (WS.tab === 'model') {
    if (!WS.root) return; rc.setFromCamera(ndc, WS.cam);
    const h = rc.intersectObject(WS.root, true).find((x) => x.object.visible && x.object.userData.pid != null); if (!h) { wsSelect(null); return; }
    let o = h.object; if (d.shift) { while (o.parent && o.parent !== WS.root && o.parent.userData.pid == null) o = o.parent; if (o.parent && o.parent !== WS.root && o.parent.userData.pid != null) o = o.parent; }
    wsSelect(o);
  } else {
    rc.setFromCamera(ndc, camera); rc.camera = camera;
    const h = rc.intersectObjects([scene], true).find((x) => x.object.isMesh && x.object.visible && x.object.material && !x.object.userData.noPick); if (!h) return;
    let m = Array.isArray(h.object.material) ? h.object.material[h.face?.materialIndex || 0] : h.object.material; if (m.userData.src) m = m.userData.src;
    const key = Object.keys(MATS).find((k) => MATS[k] === m);
    if (WS.tab === 'mat') { if (key) wsPickMat(key); else toast('이름 없는 재질이라 편집할 수 없어요'); }
    else { const tn = m.map && Object.keys(TX).find((n) => TX[n] === m.map); if (tn) wsPickTex(tn.startsWith('facade') ? 'facade' : tn); else toast('그 물체엔 편집할 수 있는 텍스처가 없어요'); }
  }
}

/* ---- keys: the workshop takes the keyboard while it is open ---- */
addEventListener('keydown', (e) => {
  if (e.ctrlKey && (e.code === 'KeyO' || e.code === 'KeyP')) { e.preventDefault(); if ((e.code === 'KeyP' && K.KeyO) || (e.code === 'KeyO' && K.KeyP)) { G.admin = !G.admin; toast(G.admin ? '관리자 모드 · F2 작업실' : '관리자 모드 해제'); if (!G.admin && WS.open) wsClose(); } return; }
  if (e.code === 'F2' && G.admin) { e.preventDefault(); e.stopImmediatePropagation(); if (WS.open) wsClose(); else wsOpen(); return; }
  if (!WS.open) return;
  e.stopImmediatePropagation();
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '') && document.activeElement.type !== 'range' && document.activeElement.type !== 'checkbox';
  if (e.code === 'Escape') { if (!$('wsModal').hidden) $('wsModal').hidden = true; else wsClose(); return; }
  if (typing) return;
  WS.keys[e.code] = true;
  if (WS.tab === 'model' && WS.sel) { if (e.code === 'Delete') { WS.selHide.checked = !WS.selHide.checked; WS.selHide.onchange(); } if (/Arrow|Page/.test(e.code)) e.preventDefault(); }
}, true);
addEventListener('keyup', (e) => { if (!WS.open) return; WS.keys[e.code] = false; if (WS.tab === 'model' && WS.sel && /Arrow|Page/.test(e.code)) wsPartCommit(); e.stopImmediatePropagation(); }, true);
function wsNudge(dt) {
  const o = WS.sel, k = WS.keys; if (!o) return; const sp = (k.ShiftLeft || k.ShiftRight ? 0.06 : 0.6) * dt; let ch = false;
  if (k.ArrowLeft) { o.position.x -= sp; ch = true; } if (k.ArrowRight) { o.position.x += sp; ch = true; }
  if (k.ArrowUp) { o.position.z -= sp; ch = true; } if (k.ArrowDown) { o.position.z += sp; ch = true; }
  if (k.PageUp) { o.position.y += sp; ch = true; } if (k.PageDown) { o.position.y -= sp; ch = true; }
  if (ch) wsFields();
}

/* ================= 모델 ================= */
function wsModelTab() {
  if (!WS.scene) {
    WS.scene = new THREE.Scene(); WS.scene.background = new THREE.Color(0x30353b);
    WS.scene.add(new THREE.HemisphereLight(0xdfe6ee, 0x3a3630, 1.1)); const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(6, 10, 4); WS.scene.add(dl); const dl2 = new THREE.DirectionalLight(0xaebbd0, 0.5); dl2.position.set(-6, 4, -6); WS.scene.add(dl2);
    const gr = new THREE.GridHelper(40, 40, 0x6a737c, 0x464d55); WS.scene.add(gr);
    WS.cam = new THREE.PerspectiveCamera(40, 1, 0.05, 3000);
  }
  const b = $('wsBody'); const seen = Object.keys(ART_SEEN).filter((k) => !WS_MODELS.some(([, n, a]) => n + artSigFor(n, a) === k));
  b.innerHTML = `<select id="wsMSel">${WS_MODELS.map(([l, n, a], i) => `<option value="s${i}">${l}</option>`).join('')}${seen.length ? '<optgroup label="이번 판에서 만들어진 다른 변형">' + seen.map((k, i) => `<option value="k${i}">${k.replace(/</g, '&lt;')}</option>`).join('') + '</optgroup>' : ''}</select>
<div class="row"><button id="wsMReset" class="warn">이 모델 초기화</button><span class="note" id="wsMInfo"></span></div>
<div id="wsParts"></div><div id="wsSel"><span class="note">부품을 고르세요 — 화면에서 클릭하거나 위 목록에서</span></div>
<div class="note">게임 속 모델은 새로 만들어질 때 반영돼요 (미션 재시작 · 다음 등장).</div>`;
  WS.seenList = seen; const sel = $('wsMSel'); if (WS.modelVal) sel.value = WS.modelVal; sel.onchange = () => { WS.modelVal = sel.value; wsLoadModel(); };
  $('wsMReset').onclick = () => { const L = wsLocal(); if (!WS.mkey) return; L.model[WS.mkey] = Object.fromEntries(Object.keys(ART.model[WS.mkey] || {}).map((p) => [p, null])); wsSave(); wsLoadModel(); };
  WS.modelVal = sel.value; wsLoadModel();
}
function artSigFor(n, a) { const idx = { makeTankMesh: [1, 2], makeK808Mesh: [1], makeAPCMesh: [1], makeHeliMesh: [1, 2], makeShip: [0, 1, 2], makeCoachMesh: [0], makeSoldierMesh: [0, 1], makeTrainCar: [0] }[n] || []; return artSig(a, idx); }
function wsLoadModel() {
  if (WS.root) { WS.scene.remove(WS.root); WS.root = null; } wsSelect(null);
  const v = WS.modelVal || 's0'; let name, args;
  if (v[0] === 's') [, name, args] = WS_MODELS[+v.slice(1)]; else ({ name, args } = ART_SEEN[WS.seenList[+v.slice(1)]] || {}); if (!name) return;
  G.wsNoMerge = true; let r; try { r = WS_FN[name](...args); } catch (e) { console.error(e); toast('모델을 만들 수 없어요: ' + e.message); } finally { G.wsNoMerge = false; }
  if (!r) return; const root = r.root || r; if (root.parent) root.parent.remove(root);
  root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); WS.root = root; WS.scene.add(root); WS.mkey = name + artSigFor(name, args);
  const bb = new THREE.Box3().setFromObject(root), c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3()).length();
  WS.orb.t.copy(c); WS.orb.dist = Math.max(2, sz * 1.15); WS.orb.pitch = 0.32;
  WS.parts = []; root.traverse((o) => { if (o.userData.pid != null && o.userData.mkey === WS.mkey) WS.parts.push(o); }); WS.parts.sort((a, b) => a.userData.pid - b.userData.pid);
  $('wsMInfo').textContent = `부품 ${WS.parts.length}개`; wsPartList();
}
const WS_GEO = { BoxGeometry: '상자', CylinderGeometry: '원통', SphereGeometry: '구', ExtrudeGeometry: '판', ConeGeometry: '원뿔', TorusGeometry: '고리', PlaneGeometry: '평면', CircleGeometry: '원판', CapsuleGeometry: '캡슐', LatheGeometry: '회전체', BufferGeometry: '형상' };
function wsPartName(o) {
  if (!o.isMesh) return `묶음 (${o.children.length})`;
  const m = o.userData.base?.m || o.material, key = Object.keys(MATS).find((k) => MATS[k] === m);
  return (WS_GEO[o.geometry?.type] || o.geometry?.type || '부품') + (key ? ' · ' + key : '');
}
function wsPartList() {
  const box = $('wsParts'); if (!box) return; box.innerHTML = '';
  for (const o of WS.parts) { let d = 0, p = o.parent; while (p && p !== WS.root) { d++; p = p.parent; }
    const r = document.createElement('div'); r.textContent = `${'  '.repeat(d)}#${o.userData.pid} ${wsPartName(o)}`; r.className = (o === WS.sel ? 'on ' : '') + (o.visible ? '' : 'hid'); r.onclick = () => wsSelect(o); o.userData.row = r; box.appendChild(r); }
}
function wsSelect(o) {
  if (WS.box) { WS.scene?.remove(WS.box); WS.box = null; }
  if (WS.sel?.userData.row) WS.sel.userData.row.classList.remove('on');
  WS.sel = o; const box = $('wsSel'); if (!box) return;
  if (!o) { box.innerHTML = '<span class="note">부품을 고르세요 — 화면에서 클릭하거나 위 목록에서</span>'; return; }
  WS.box = new THREE.BoxHelper(o, 0xffd400); WS.box.material.depthTest = false; WS.box.renderOrder = 999; WS.scene.add(WS.box);
  if (o.userData.row) { o.userData.row.classList.add('on'); o.userData.row.scrollIntoView({ block: 'nearest' }); }
  const ax = ['X', 'Y', 'Z'];
  box.innerHTML = `<b>#${o.userData.pid} ${wsPartName(o)}</b>
<div class="grid3"><span>위치</span>${ax.map((a, i) => `<input type="number" step="0.01" data-f="p" data-i="${i}">`).join('')}
<span>회전°</span>${ax.map((a, i) => `<input type="number" step="1" data-f="r" data-i="${i}">`).join('')}
<span>크기</span>${ax.map((a, i) => `<input type="number" step="0.01" data-f="s" data-i="${i}">`).join('')}</div>
<div class="row"><span>${o.isMesh ? '색' : ''}</span>${o.isMesh ? '<input type="color" id="wsPC"><button id="wsPCR">원래 색</button>' : ''}<label style="margin-left:auto"><input type="checkbox" id="wsPH"> 숨기기</label></div>
<div class="row"><button id="wsPR" class="warn">이 부품 초기화</button><span class="note">X 좌우 · Y 위아래 · Z 앞뒤</span></div>`;
  box.querySelectorAll('input[data-f]').forEach((inp) => (inp.oninput = () => { const v = +inp.value; if (!isFinite(v)) return; const i = +inp.dataset.i;
    if (inp.dataset.f === 'p') o.position.setComponent(i, v); else if (inp.dataset.f === 'r') { const e = o.rotation; if (i === 0) e.x = v * Math.PI / 180; else if (i === 1) e.y = v * Math.PI / 180; else e.z = v * Math.PI / 180; } else o.scale.setComponent(i, v || 0.001);
    wsPartCommit(); }));
  if (o.isMesh) { const pc = $('wsPC'); pc.value = '#' + (o.material.color ? o.material.color.getHexString() : 'ffffff'); pc.oninput = () => { const b = o.userData.base; if (b?.m?.color) { o.material = artColorMat(b.m, parseInt(pc.value.slice(1), 16)); wsPartCommit(); } };
    $('wsPCR').onclick = () => { const b = o.userData.base; if (b?.m) { o.material = b.m; pc.value = '#' + b.m.color.getHexString(); wsPartCommit(); } }; }
  WS.selHide = $('wsPH'); WS.selHide.checked = !o.visible; WS.selHide.onchange = () => { o.visible = !WS.selHide.checked; o.userData.row?.classList.toggle('hid', !o.visible); wsPartCommit(); };
  $('wsPR').onclick = () => { artPartApply(o, {}); wsSelect(o); wsPartCommit(); };
  wsFields();
}
function wsFields() {
  const o = WS.sel, box = $('wsSel'); if (!o || !box) return;
  box.querySelectorAll('input[data-f]').forEach((inp) => { if (document.activeElement === inp) return; const i = +inp.dataset.i;
    inp.value = inp.dataset.f === 'p' ? o.position.getComponent(i).toFixed(3) : inp.dataset.f === 'r' ? (([o.rotation.x, o.rotation.y, o.rotation.z][i]) * 180 / Math.PI).toFixed(1) : o.scale.getComponent(i).toFixed(3); });
}
/* store the part as differences from how the code builds it */
function wsPartCommit() {
  const o = WS.sel; if (!o || !o.userData.base) return; const b = o.userData.base, L = wsLocal(), ov = {};
  const dp = o.position.toArray().map((v, i) => +(v - b.p[i]).toFixed(4)); if (dp.some((v) => Math.abs(v) > 1e-4)) ov.p = dp;
  const dr = [o.rotation.x - b.r[0], o.rotation.y - b.r[1], o.rotation.z - b.r[2]].map((v) => +v.toFixed(4)); if (dr.some((v) => Math.abs(v) > 1e-4)) ov.r = dr;
  const ds = o.scale.toArray().map((v, i) => +(v / (b.s[i] || 1)).toFixed(4)); if (ds.some((v) => Math.abs(v - 1) > 1e-4)) ov.s = ds;
  if (o.isMesh && b.m && o.material !== b.m && o.material.color) ov.c = o.material.color.getHex();
  if (!o.visible && b.v) ov.hide = 1;
  L.model[WS.mkey] = L.model[WS.mkey] || {}; L.model[WS.mkey][o.userData.pid] = Object.keys(ov).length ? ov : null; wsSave(); WS.box?.update();
}

/* ================= 재질 ================= */
function wsMatTab() {
  const b = $('wsBody');
  b.innerHTML = `<input type="text" id="wsMF" placeholder="재질 이름 검색"><select id="wsML" size="12"></select>
<div id="wsMEd"><span class="note">재질을 고르세요 — 화면에서 물체를 클릭하거나 위 목록에서</span></div>
<div class="note">재질은 같은 재질을 쓰는 모든 물체에 바로 반영돼요.</div>`;
  const fill = () => { const q = $('wsMF').value.trim().toLowerCase(); $('wsML').innerHTML = Object.keys(MATS).sort().filter((k) => !q || k.toLowerCase().includes(q)).map((k) => `<option value="${k}"${k === WS.matKey ? ' selected' : ''}>${k}${ART.mat[k] ? ' ●' : ''}</option>`).join(''); };
  $('wsMF').oninput = fill; fill(); $('wsML').onchange = () => wsPickMat($('wsML').value);
  if (WS.matKey && MATS[WS.matKey]) wsPickMat(WS.matKey);
}
const wsHex = (n) => '#' + (n >>> 0).toString(16).padStart(6, '0');
function wsSlider(id, label, min, max, step, val, fmt = (v) => (+v).toFixed(2)) { return `<label for="${id}">${label}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><output id="${id}o">${fmt(val)}</output>`; }
function wsPickMat(key) {
  WS.matKey = key; const m = MATS[key], ed = $('wsMEd'); if (!m || !ed) return; if ($('wsML')) $('wsML').value = key;
  const std = 'roughness' in m, texs = [...new Set([...WS_TEXNAMES, ...Object.keys(TX).filter((n) => !n.startsWith('facade'))])];
  ed.innerHTML = `<b>${key}</b><div class="grid2">
<label>색</label><input type="color" id="wsC" value="${wsHex(m.color ? m.color.getHex() : 0xffffff)}"><span></span>
${std ? wsSlider('wsR', '거칠기', 0, 1, 0.01, m.roughness) + wsSlider('wsMe', '금속성', 0, 1, 0.01, m.metalness) + `<label>발광색</label><input type="color" id="wsE" value="${wsHex(m.emissive ? m.emissive.getHex() : 0)}"><span></span>` + wsSlider('wsEi', '발광 세기', 0, 6, 0.05, m.emissiveIntensity ?? 1) : ''}
${wsSlider('wsO', '불투명도', 0, 1, 0.01, m.opacity)}
${std ? `<label>텍스처</label><select id="wsT" style="grid-column:span 2"><option value="">없음</option>${texs.map((n) => `<option value="${n}"${m.userData.mapName === n ? ' selected' : ''}>${WS_TEXLABEL[n] || n}</option>`).join('')}${m.userData.mapName && !texs.includes(m.userData.mapName) ? `<option selected value="${m.userData.mapName}">${m.userData.mapName}</option>` : ''}</select>` : ''}
</div><div class="row"><button id="wsMR" class="warn">이 재질 초기화</button>${m.userData.mapName ? '<button id="wsMTx">이 재질의 텍스처 편집 →</button>' : ''}</div>`;
  const commit = () => { const ov = { color: parseInt($('wsC').value.slice(1), 16), opacity: +$('wsO').value };
    if (std) Object.assign(ov, { rough: +$('wsR').value, metal: +$('wsMe').value, emissive: parseInt($('wsE').value.slice(1), 16), ei: +$('wsEi').value, map: $('wsT').value || null });
    artMatApply(m, ov); const L = wsLocal(); L.mat[key] = ov; wsSave(); };
  ed.querySelectorAll('input,select').forEach((el) => (el.oninput = el.onchange = () => { const o = $(el.id + 'o'); if (o) o.textContent = (+el.value).toFixed(2); commit(); }));
  $('wsMR').onclick = () => { const L = wsLocal(); L.mat[key] = null; wsSave(); artMatReset(m); artMat(key, m); wsPickMat(key); };
  if ($('wsMTx')) $('wsMTx').onclick = () => { const n = m.userData.mapName; wsTab('tex'); wsPickTex(n.startsWith('facade') ? 'facade' : n); };
}

/* ================= 텍스처 ================= */
function wsTexTab() {
  const names = [...new Set([...WS_TEXNAMES, ...Object.keys(TX).filter((n) => !n.startsWith('facade'))])], hasF = Object.keys(TX).some((n) => n.startsWith('facade'));
  $('wsBody').innerHTML = `<select id="wsTL" size="10">${(hasF ? ['facade'] : []).concat(names).map((n) => `<option value="${n}">${WS_TEXLABEL[n] || n}${ART.tex[n] ? ' ●' : ''}${TX[n] || n === 'facade' ? '' : ' (이번 판엔 안 쓰임)'}</option>`).join('')}</select>
<div id="wsTEd"><span class="note">텍스처를 고르세요 — 화면에서 물체를 클릭하거나 위 목록에서</span></div>`;
  $('wsTL').onchange = () => wsPickTex($('wsTL').value);
  if (WS.texName) wsPickTex(WS.texName);
}
function wsTexTargets(name) { if (name === 'facade') return Object.keys(TX).filter((n) => n.startsWith('facade')).map((n) => TX[n]); return [TX[name] || tex(name)]; }
function wsPickTex(name) {
  WS.texName = name; if ($('wsTL')) $('wsTL').value = name; const ed = $('wsTEd'); if (!ed) return;
  const ov = Object.assign({ h: 0, s: 100, b: 100, c: 100, blur: 0, rep: 1 }, ART.tex[name] || {});
  ed.innerHTML = `<b>${WS_TEXLABEL[name] || name}</b><canvas id="wsPrev" width="256" height="256"></canvas><div class="grid2">
${wsSlider('wsTh', '색조', -180, 180, 1, ov.h, (v) => (+v).toFixed(0) + '°')}${wsSlider('wsTs', '채도', 0, 300, 1, ov.s, (v) => (+v).toFixed(0) + '%')}
${wsSlider('wsTb', '밝기', 0, 300, 1, ov.b, (v) => (+v).toFixed(0) + '%')}${wsSlider('wsTc', '대비', 0, 300, 1, ov.c, (v) => (+v).toFixed(0) + '%')}
${wsSlider('wsTbl', '흐림', 0, 8, 0.25, ov.blur, (v) => (+v).toFixed(2))}${wsSlider('wsTr', '반복 배율', 0.25, 8, 0.05, ov.rep, (v) => '×' + (+v).toFixed(2))}
</div><div class="row"><label><button id="wsTI" type="button">이미지로 교체…</button></label><input type="file" id="wsTF" accept="image/*" hidden>${ov.img ? '<button id="wsTX">이미지 빼기</button>' : ''}<button id="wsTR" class="warn">이 텍스처 초기화</button></div>
<div class="note">반복 배율은 큰 값일수록 무늬가 잘게 반복돼요. 교체 이미지는 512px로 줄여서 저장돼요.</div>`;
  const prev = () => { const t = wsTexTargets(name)[0]; const c = $('wsPrev'); if (!t || !c) return; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 256, 256); for (const x of [0, 128]) for (const y of [0, 128]) g.drawImage(t.image, x, y, 128, 128); };
  const commit = (extra = {}) => { const L = wsLocal(), img = 'img' in extra ? extra.img : (ART.tex[name] || {}).img;
    const cur = { h: +$('wsTh').value, s: +$('wsTs').value, b: +$('wsTb').value, c: +$('wsTc').value, blur: +$('wsTbl').value, rep: +$('wsTr').value, img: img || null };
    L.tex[name] = cur; wsSave(); for (const t of wsTexTargets(name)) artTexApply(t, cur); setTimeout(prev, 80); };
  ed.querySelectorAll('input[type=range]').forEach((el) => (el.oninput = () => { const o = $(el.id + 'o'); if (o) o.textContent = el.id === 'wsTh' ? (+el.value).toFixed(0) + '°' : /wsT[sbc]$/.test(el.id) ? (+el.value).toFixed(0) + '%' : el.id === 'wsTr' ? '×' + (+el.value).toFixed(2) : (+el.value).toFixed(2); commit(); }));
  $('wsTI').onclick = () => $('wsTF').click();
  $('wsTF').onchange = () => { const f = $('wsTF').files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 512 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const url = /png|gif|webp/.test(f.type) ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.86); commit({ img: url }); wsPickTex(name); }; im.src = rd.result; }; rd.readAsDataURL(f); };
  if ($('wsTX')) $('wsTX').onclick = () => { commit({ img: null }); wsPickTex(name); };
  $('wsTR').onclick = () => { const L = wsLocal(); L.tex[name] = null; wsSave(); for (const t of wsTexTargets(name)) artTexReset(t); wsPickTex(name); };
  prev();
}
