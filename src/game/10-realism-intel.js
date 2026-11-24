/* the realism pass for every chapter (high / ultra): sky reflections into all materials, relief and gloss maps derived from each
   texture's own pattern, sharper and wider shadows on ultra; alpha-card foliage kept out of the AO pass. The sample does this in its build. */
function applyRealism() {
  if (SET.quality === 'low' || G.realism) return; G.realism = true;
  hgEnvironment();
  const seen = new Set(); for (const root of [G.staticRoot, G.world]) root.traverse((o) => { if (!o.isMesh) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m && !seen.has(m)) { seen.add(m); hgDetailMaterial(m); } }); if (o.material === HGTW) (G.noAO = G.noAO || []).push(o); });
}
async function rebuildWorld(m, key, S) {
  const W = key === 'A' ? { env: m.env, build: m.build, loadout: m.loadout, allyStyle: m.allyStyle } : m.worlds[key];
  if (G.envReset) { G.envReset(); G.envReset = null; } G.realism = false; G.noAO = null;
  newWorld(); G.worldKey = key; G.allyStyle = W.allyStyle || m.allyStyle || 'rok';
  applyEnv(W.env || m.env); resetPlayer(W.loadout || m.loadout || {}); P.bounds = W.bounds || null;
  G.markAll = false; G.mmExtra = null; G.objPos = null; G.onExplode = null; G.onDeck = null; G.navalShip = null; G.navalGun = null; flashlight.intensity = 0;
  W.build(S); mergeStatic(); applyRealism();
}
function failMission(reason) {
  if (G.mode !== 'play' || !P.alive) return;
  P.alive = false; P.deadT = 5; MS.l = MS.r = false;
  G.paused = true; showScreen('fail'); $('failHead').textContent = '작전 실패'; $('failTip').textContent = reason;
  if (document.pointerLockElement) document.exitPointerLock();
}
/* ---------------- pause → 작전 정보: who I am, who is with me, what is going on ---------------- */
const SITU = {
  p: '통일 후 첫 새해를 앞둔 밤. 두만강 건너편에 중·러 병력이 모여 있다는 뉴스가 돌지만, 정부는 "통상 훈련"이라고만 한다.',
  m1: '자정, 중·러 연합군이 두만강을 넘었다. 국경수비대는 국경 다리를 폭파해 적의 진격을 늦춰야 한다.',
  m2: '회령. 다리는 무너졌지만 적은 얼음 위로 부교를 깔고 넘어온다. 증원군이 올 때까지 광장을 지킨다.',
  m3: '회령이 넘어갔다. 후퇴로가 리선우 병장의 고향 마을을 지난다. 주어진 시간은 30분.',
  m4: '무전에 계속 나오던 이름, 볼코프. 그의 전방 지휘소(폐공장)에 잠입해 작전 문서를 빼 온다.',
  m5: '빼낸 문서대로 러시아 제3전차사단이 무산 고개로 온다. 고개 방어선을 지킨다.',
  m6: '고개도 넘어갔다. 강태현 상사가 크게 다쳤다. 적 후방에 고립된 3분대는 폐광산을 지나 구조 헬기를 부른다.',
  m7: '한 달 뒤. 적 선두가 서울 북쪽 끝에 왔다. 3분대는 시민 철수 버스 행렬을 노량진역까지 호위한다.',
  m8: '서울 함락 한 달 뒤. 전선은 서울–경기 경계에 멈춰 있다. 평택에 모인 연합군이 반격 작전을 듣는다.',
  m9: '작전명 쌍룡. 3분대는 인천 상륙 1파로 항만 방벽을 뚫고 들어간다.',
  m9b: '같은 시각 동해 고성. 미 해병대가 상륙해 7번 국도로 내려오는 적 보급로를 끊는다.',
  m10a: '인천을 확보했다. 경인고속도로를 따라 서울로 밀고 들어간다.',
  m10: '서울 탈환 작전. 한 달 반 전 도망치듯 건넌 한강대교를 다시 건너 광화문까지 간다.',
  m10b: '포위된 적이 북쪽으로 달아난다. 대동강을 건너 평양역까지 진격한다.',
  m11: '전쟁이 시작된 그 강. 볼코프가 마지막 부교로 두만강을 건너 도망치려 한다.',
  ep: '여덟 달 뒤. 휴전 협정이 맺어지고 국경은 다시 두만강이 되었다. 서한준은 제3초소로 돌아왔다.',
};
const BIOS = {
  '서한준': '제12국경수비대 막내. 전역까지 남은 날을 세는 게 버릇이다. 새해 첫날 두만강 다리를 폭파하고 쓰러진 걸 3분대가 끌어냈다.',
  '최민석': '제3초소 선임. 잔소리가 많지만 막내 새해 인사는 꼭 받아 준다.',
  '강태현': '3분대 선임 부사관. 말수 적고 무뚝뚝하지만 분대원을 한 명도 버리고 가지 않는다. 다리에서 서한준을 끌어낸 사람.',
  '한지운': '막내를 늘 자기 옆에 붙여 두는 사람. 1월 8일 강태현 상사에게서 무전기와 분대를 물려받았다.',
  '리선우': '회령 출신. 통일 전엔 북쪽 사람이었다. 고향 집 식탁엔 식은 밥과 편지만 남아 있었다.',
  '윤하린': '통신·드론 담당. 어떤 상황에서도 목소리가 흔들리지 않는다. 분대의 눈과 귀.',
  '박도현': '반격 작전부터 3분대를 지휘하는 소대장. 앞에서 뛰는 장교.',
  '에단 콜': '미 해병대 하사. 고성 상륙 1파. 3분대와는 마지막 두만강에서 만난다.',
  '로페즈': '미 해병대 소대장. 고성 상륙을 이끈다.', '레예스': '미 해병대 상병. 에단 콜의 사수 짝.', '밀러': '미 해병대 일병. 소대 막내.', '브룩스': '미 해병대 관측병. 레이저 표적지시기 담당.',
};
const FOE_BIO = { '볼코프': ['볼코프 대령', '러시아 제3전차사단장. 적군 사이에선 \'늑대\'로 불린다. 회령부터 무전에 계속 이름이 나왔다.'] };
function renderIntel() {
  const m = G.mission || {}; const mi = MISSIONS.indexOf(m);
  $('intelTitle').textContent = `${m.num || ''} · ${m.title || ''}`;
  const me = m.who || ''; const meName = (m.whoShort || '서한준');
  const seen = new Set([meName]); const people = [];
  const add = (full) => { const key = Object.keys(BIOS).find((k) => full.startsWith(k)); if (!key || seen.has(key)) return; seen.add(key); people.push([full, BIOS[key]]); };
  for (const a of Object.values((G.S && G.S.sq) || {})) if (a && a.alive && a.name) add(a.name);
  // people who matter to the story even when they are not on the field this time
  if (mi >= 2 && mi <= 13 && m.id !== 'm9b') { add('강태현 상사'); add('한지운 하사'); }
  if (mi <= 1) add('최민석 병장');
  const card = (n, rank, bio, cls = '') => `<div class="in-p ${cls}"><b>${n}</b><span>${rank}</span><p>${bio}</p></div>`;
  const myBio = BIOS[Object.keys(BIOS).find((k) => meName.startsWith(k))] || '';
  let html = `<div><h3>지금 상황</h3><div class="in-sit">${SITU[m.id] || m.desc || ''}</div><div class="in-meta">${m.dateText || ''} · ${m.place || ''}</div></div>`;
  if (m.id !== 'p') html += `<div class="in-bg">완충지대가 사라지고 한미동맹이 국경까지 올라오자, 중국과 러시아는 「연합 안정화 작전」을 내걸고 쳐들어왔다.</div>`;
  html += `<div><h3>나</h3><div class="in-people">${card(meName, me.replace(meName, '').replace(/^\s*/, ''), myBio, 'me')}</div></div>`;
  if (people.length) html += `<div><h3>분대 · 주요 인물</h3><div class="in-people">${people.map(([n, b]) => { const sp = n.split(' '); return card(sp.length > 1 ? sp.slice(0, -1).join(' ') : n, sp.length > 1 ? sp[sp.length - 1] : '', b); }).join('')}</div></div>`;
  const foes = [];
  if (m.foeText) foes.push(card('적', '', m.foeText));
  if (['m4', 'm5', 'm11'].includes(m.id)) foes.push(card(FOE_BIO['볼코프'][0], '적 지휘관', FOE_BIO['볼코프'][1]));
  if (foes.length) html += `<div><h3>적</h3><div class="in-people">${foes.join('')}</div></div>`;
  $('intelBody').innerHTML = html;
}
function pauseGame() { if (G.mode !== 'play' || G.paused || G.inCredits || G.inVideo) return; /* never under a film: the pause screen would sit hidden beneath it and the game would hang on black */ G.paused = true; showScreen('pause'); $('pauseTitle').textContent = G.mission ? G.mission.title : ''; MS.l = MS.r = false; }
function resume() { lockPointer(); hideScreens(); G.paused = false; }
