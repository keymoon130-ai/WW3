/* ---------------- tutorial: the first time something appears (and in that same mission when replayed) a yellow panel says what to do,
   and anything with a place gets its own pulsing yellow diamond ---------------- */
const TUTW = {
  sniper: '<b>K-S01 저격총</b> <kbd>2</kbd> — <kbd>우클릭</kbd> 스코프 조준 → <kbd>좌클릭</kbd> 한 발. 쏠 때마다 볼트를 당겨요. 멀리 있는 적·옥상 저격수에게 쓰세요.',
  rpg: '<b>대전차 로켓</b> — 전차·장갑차는 총으로 안 돼요. <kbd>우클릭</kbd> 조준 → <kbd>좌클릭</kbd> 발사. 로켓은 살짝 떨어지니 조금 위를 노리세요.',
  sam: '<b>대공미사일</b> — <kbd>우클릭</kbd>으로 헬기를 계속 겨누면 삐- 소리와 함께 <b>LOCK</b> → <kbd>좌클릭</kbd> 발사. 대충 겨눠도 따라가요.',
  desig: '<b>표적지시기</b> — <kbd>우클릭</kbd>으로 들여다보고, 노란 마름모 목표를 가운데 둔 채 <kbd>좌클릭</kbd>. 지원 사격이 떨어져요. 한 번 쓰면 잠깐 재충전돼요.',
  binoc: '<b>쌍안경</b> — <kbd>우클릭</kbd>으로 확대해서 살펴보세요.',
  atgm: '<b>유도미사일</b> — <kbd>우클릭</kbd>으로 조준한 채로 있으면 미사일이 조준점을 따라가요. 맞을 때까지 계속 겨누세요.',
  k21mg: '<b>K808 백호 · K6 중기관총</b> — 마우스로 겨누고 <kbd>좌클릭</kbd>을 누르고 있으면 연사. 탄은 무제한이에요.',
  acvmg: '<b>ACV 기관총</b> — 마우스로 겨누고 <kbd>좌클릭</kbd>을 누르고 있으면 연사. 탄은 무제한이에요.',
  doorgun: '<b>도어건</b> — 마우스로 겨누고 <kbd>좌클릭</kbd> 연사. 아래 아군 행렬 앞의 적을 쓸어주세요.',
  km19: '<b>K-M19 헬기 기관총</b> — <kbd>H</kbd> 기총 카메라 전환. 조종석 옆 사수석이에요. 마우스로 겨누고 <kbd>좌클릭</kbd>을 누르고 있으면 분당 1000발로 쏟아져요. 재장전 없음. 보병과 BMP 같은 경장갑은 녹이지만 <b>전차는 아군 전차가</b> 상대해요.',
  heligl: '<b>K4 고속유탄발사기</b> — 마우스로 겨누고 <kbd>좌클릭</kbd>을 누르고 있으면 유탄 연사. 재장전 없이 계속 쏴요. 유탄은 포물선으로 떨어지니 살짝 앞쪽을 노리세요. 장갑차도 몇 발이면 터져요.',
  hrocket: '<b>로켓 포드</b> <kbd>2</kbd> — 장갑차·대공포는 로켓으로. <kbd>1</kbd>로 도어건 복귀.',
};
const TUT = { q: [], cur: null, seen: (() => { try { return JSON.parse(localStorage.getItem('tumen_tut2') || '{}'); } catch (e) { return {}; } })() };
function tut(key, html, pos, dur = 8) {
  if (!G.mission || G.testMode === 'notut') return;
  G.tutShown = G.tutShown || {}; if (G.tutShown[key]) return;
  const first = TUT.seen[key]; if (first !== undefined && first !== G.mission.id) return; // only where it first appeared
  if (first === undefined) { TUT.seen[key] = G.mission.id; try { localStorage.setItem('tumen_tut2', JSON.stringify(TUT.seen)); } catch (e) {} }
  G.tutShown[key] = true; TUT.q.push({ html, pos, dur });
}
function tutTick(dt) {
  const el = $('tut');
  if (TUT.cur) { TUT.cur.t -= dt; const near = TUT.cur.pos && TUT.cur.pos.distanceTo(P.pos) < 3.2; if (TUT.cur.t <= 0 || (near && TUT.cur.t < TUT.cur.dur - 2)) { TUT.cur = null; G.tutPos = null; el.classList.remove('on'); } }
  if (!TUT.cur && TUT.q.length && !G.cut && !screenHidden()) { TUT.cur = TUT.q.shift(); TUT.cur.t = TUT.cur.dur; el.querySelector('p').innerHTML = TUT.cur.html; el.classList.add('on'); G.tutPos = TUT.cur.pos ? TUT.cur.pos.clone() : null; SFX.uiOk && SFX.uiOk(); }
  if (G.cut && TUT.cur) { el.classList.remove('on'); } else if (TUT.cur) el.classList.add('on');
  el.classList.toggle('dim', !!(P.lastHit && G.time - P.lastHit < 2.5));
  // things the player notices for the first time
  if (G.objPos && !G.cut) tut('marker', '<b>노란 마름모 ◆</b>를 따라가세요! 지금 가야 할 곳, 노려야 할 목표를 항상 가리켜요. 화면 밖이면 가장자리에, 미니맵에도 떠요.', null, 8);
  if (P.ride && !G.cut) tut('ride', '탑승 중이에요. 마우스로 둘러보고 <kbd>좌클릭</kbd>으로 사격하세요. 움직이는 건 차량이 알아서 해요.', null, 7);
  if (!G.cut && G.actors.some((a) => a.alive && a.team === 'enemy' && a.state === 'combat' && a.pos.distanceTo(P.pos) < 60)) tut('combat', '<kbd>우클릭</kbd> 정조준 · <kbd>좌클릭</kbd> 사격 · <kbd>R</kbd> 재장전 · <kbd>G</kbd> 수류탄 · <kbd>C</kbd> 앉아서 엄폐 · <kbd>Shift</kbd> 달리기 · 쓰러진 적 위를 지나가면 탄약을 주워요.', null, 9);
}
function giveWeapon(id, select = true, ammo) {
  if (TUTW[id]) tut('w_' + id, TUTW[id], null, 9);
  if (!P.weapons.includes(id)) { P.weapons.push(id); P.ammo[id] = { mag: WD[id].mag ?? 0, res: ammo ?? WD[id].res ?? 0 }; }
  else if (ammo !== undefined) P.ammo[id].res = ammo;
  if (select) switchTo(P.weapons.indexOf(id));
}
function takeWeapon(id) { const i = P.weapons.indexOf(id); if (i < 0) return; P.weapons.splice(i, 1); if (P.cur > i) P.cur--; P.cur = Math.max(0, Math.min(P.cur, P.weapons.length - 1)); P.nextW = null; P.switchT = 0; buildViewmodel(); }
function switchTo(i) { if (i < 0 || i >= P.weapons.length || (i === P.cur && VM.id === curId())) return; P.nextW = i; P.switchT = 0.45; P.reloadT = 0; }
function setPlayer(x, z, yaw = 0, y) { P.pos.set(x, y ?? floorAt(x, z, 100), z); if (y === undefined) P.pos.y = G.groundAt(x, z); P.pos.y = floorAt(x, z, P.pos.y + 0.5); P.yaw = yaw; P.pitch = 0; P.vel.set(0, 0, 0); }
