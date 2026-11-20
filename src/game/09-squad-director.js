/* ---------------- squad chatter + enemy shouts ---------------- */
const CLOCK = (ang) => { let h = Math.round(ang / (Math.PI / 6)); h = ((h % 12) + 12) % 12; return h === 0 ? 12 : h; };
function playerIdentity() { const m = G.mission || {}; return { name: m.whoShort || '서한준', rank: rankOf(m.who || '') }; }
/* ---------------- the squad looks after the rookie: praise, worry, cover fire, a spare magazine ---------------- */
const VOICE = {
  강태현: { praise: ['좋아.', '잘 쐈다, 막내.', '그렇지. 침착하게.'], head: ['…한 방이군. 좋다.'], multi: ['혼자 다 잡을 셈이냐. 잘했다.'], worry: ['서한준! 머리 숙여!', '막내 맞았다! 엄호해!'], ammo: ['막내, 탄창 받아라.'] },
  한지운: { praise: ['나이스, 한준아!', '잘했다! 그대로 가!', '좋아, 막내!', '봤다! 잘 맞혔다!'], head: ['머리! 한 방이다!', '헤드샷! 잘했다, 한준아!'], multi: ['혼자 다 잡네! 좋아!', '한준이 오늘 날아다닌다!'], worry: ['한준아! 괜찮냐! 엄폐해!', '막내 맞았다! 내가 엄호한다, 빠져!', '서한준! 내 뒤로 붙어!'], ammo: ['한준아, 탄창 받아!', '막내, 탄 떨어졌지? 이거 써!'] },
  리선우: { praise: ['오, 한준이 제법이구나!', '잘 맞혔다이!', '하나 더 잡으라우!'], head: ['머리 맞췄다! 저 녀석 보라우!'], multi: ['야, 우리 몫도 좀 남기라우!'], worry: ['한준아! 뒤로 빠지라우, 내레 막갔어!', '한준이 맞았다! 엄호하라우!'], ammo: ['한준아, 받으라우! 아껴 쓰라!'] },
  윤하린: { praise: ['명중 확인.', '적 하나 감소. 잘했어.', '확인했어, 한준아.'], head: ['헤드샷 확인. 침착하네.'], multi: ['세 명 연속 확인. 잘하고 있어.'], worry: ['서한준, 엄폐부터! 출혈 확인해!', '한준아! 고개 숙여!'], ammo: ['탄창 하나 던진다, 받아!'] },
  박도현: { praise: ['좋다, 서한준!', '그렇게 하는 거다!'], head: ['명사수 났네!'], multi: ['3분대 막내 대단하다!'], worry: ['서한준 맞았다! 엄호 사격!', '서한준! 엄폐해라!'], ammo: ['서한준, 탄 받아라!'] },
};
const voiceOf = (a) => VOICE[Object.keys(VOICE).find((k) => a.name && a.name.startsWith(k))];
function nearSquad(r) { const me = (G.mission || {}).whoShort; return G.actors.filter((a) => a.alive && a.team === 'ally' && !a.passive && a.name && voiceOf(a) && !a.name.startsWith(me || '-') && a.pos.distanceTo(P.pos) < r).sort((a, b) => (a.name.startsWith('한지운') ? -1 : 0) - (b.name.startsWith('한지운') ? -1 : 0) || a.pos.distanceTo(P.pos) - b.pos.distanceTo(P.pos)); }
function squadReact(kind) {
  if (G.cut || !P.alive || G.noChatter || G.mission?.id === 'p') return false;
  if (G.time - (G.lastSubT ?? -99) < 2.2) return false;
  const sq = nearSquad(kind === 'worry' ? 35 : 28); if (!sq.length) return false;
  const a = kind === 'worry' || kind === 'ammo' ? sq[0] : pick(sq.slice(0, 3)); const v = voiceOf(a); if (!v || !v[kind]) return false;
  subtitle(a.name, pick(v[kind]), 2); G.chatT = Math.max(G.chatT || 0, 4); return a;
}
function squadOnKill(head) {
  const t = G.time; G.killTimes = (G.killTimes || []).filter((k) => t - k < 4); G.killTimes.push(t);
  if (G.killTimes.length >= 3 && t - (G.multiT ?? -99) > 14) { if (squadReact('multi')) { G.multiT = t; G.praiseT = t; } return; }
  if (head && t - (G.praiseT ?? -99) > 9 && Math.random() < 0.6) { if (squadReact('head')) G.praiseT = t; return; }
  if (t - (G.praiseT ?? -99) > 16 && Math.random() < 0.35) { if (squadReact('praise')) G.praiseT = t; }
}
function squadCareTick(dt) {
  if (G.mode !== 'play' || G.cut || !P.alive || G.mission?.id === 'p' || G.mission?.id === 'ep') return;
  // hurt badly: someone shouts for him and lays down covering fire on whoever is shooting at him
  if (P.hp < 45 && G.time - P.lastHit < 0.6 && G.time - (G.worryT ?? -99) > 18) {
    const a = squadReact('worry'); if (a) { G.worryT = G.time;
      for (const e of G.actors) if (e.alive && e.team === 'enemy' && e.state === 'combat' && e.pos.distanceTo(P.pos) < 70) { e.supp = Math.max(e.supp || 0, 1.4); if (e.target && e.target.isPlayer && Math.random() < 0.5) e.target = a; }
      a.fireCd = 0; } }
  // running dry: a squadmate tosses him a magazine
  const id = typeof curId === 'function' ? curId() : null, w = id && WD[id], st = id && P.ammo[id];
  if (w && st && w.mag && !w.heavy && !w.noAmmo && !w.mounted && st.res < w.mag && G.time - (G.ammoT ?? -99) > 40) {
    const a = squadReact('ammo'); if (a) { G.ammoT = G.time; st.res += w.mag * 2; toast('+ 탄창 2개 (' + a.name.split(' ')[0] + ')'); SFX.click(); } }
}
function chatterTick(dt) {
  if (G.cut || !P.alive || G.noChatter) return;
  G.chatT = (G.chatT ?? 4) - dt;
  // enemy shouts
  G.shoutT = (G.shoutT ?? 2) - dt;
  if (G.shoutT <= 0) { G.shoutT = rand(1.6, 3.4); const cand = G.actors.filter((a) => a.alive && a.team === 'enemy' && a.state === 'combat' && a.pos.distanceTo(P.pos) < 45); if (cand.length) { const a = pick(cand); SFX.shout(a.pos); floatText(a.pos.clone().add(v3(0, 2.2, 0)), pick(a.style === 'enemy2' ? ['Вперёд!', 'Огонь!', 'Прикрой!', 'Там!', 'Давай, давай!'] : ['冲啊!', '快! 快!', '掩护!', '在那边!', '开火!'])); } }
  if (G.chatT > 0 || G.time - (G.lastSubT ?? -99) < 3.5) return;
  const me = playerIdentity();
  const sq = G.actors.filter((a) => a.alive && a.team === 'ally' && a.name && a.pos.distanceTo(P.pos) < 22 && !a.passive);
  if (!sq.length) { G.chatT = 3; return; }
  const sp = pick(sq.filter((a) => a.hero).concat(sq.filter((a) => a.hero)).concat(sq));
  const sup = rankOf(sp.name) > me.rank, rkName = RANK_ORDER[me.rank] || '';
  const foes = G.actors.filter((a) => a.alive && a.team === 'enemy' && a.state === 'combat' && a.pos.distanceTo(P.pos) < 70);
  let line = null;
  if (P.hp < 40 && Math.random() < 0.6 && G.time - (G.worryT ?? -99) > 8) line = sup ? pick([`${me.name}, 엄폐해라!`, `${me.name}! 머리 숙여라!`, `${me.name}, 뒤로 빠져라!`]) : pick([`${rkName}님, 엄폐하십시오!`, `${rkName}님! 다치셨습니까!`]);
  else if (foes.length) {
    const f = pick(foes); const ang = Math.atan2(-(f.pos.x - P.pos.x), -(f.pos.z - P.pos.z)); const h = CLOCK(-(ang - P.yaw));
    const r = Math.random();
    if (r < 0.4) line = sup ? pick([`${me.name}! ${h}시 방향!`, `${h}시 방향 적이다! 쏴라!`, `${me.name}, ${h}시 방향 제압해라!`]) : pick([`${h}시 방향 적입니다!`, `${rkName}님, ${h}시 방향입니다!`]);
    else if (r < 0.6) line = pick(['재장전!', '탄창 교체!', '엄호 바란다!']);
    else if (r < 0.8) line = sup ? pick(['밀어붙여라!', '엄호한다, 이동해라!', '사격 유지해라!', '물러서지 마라!']) : pick(['엄호하겠습니다!', '제압 사격합니다!', '이동합니다!']);
    else if (foes.length > 8) line = pick(['적이 너무 많다!', '끝이 없습니다!', '계속 몰려온다!']);
  } else if (Math.random() < 0.25 && !(G.mission && G.mission.loadout && G.mission.loadout.noFire) && aliveEnemies().some((e) => e.pos.distanceTo(P.pos) < 160)) line = sup ? pick(['주변 경계해라.', '탄약 확인해라.', '정신 바짝 차려라.']) : pick(['이상 없습니다.', '주변 깨끗합니다.']);
  if (line) { subtitle(sp.name, line, 1.9); G.chatT = rand(6, 10); } else G.chatT = rand(3, 5);
}
function floatText(pos, text) {
  const box = $('shouts'); if (!box) return; const sc = projectToScreen(pos); if (sc.behind) return;
  const e = document.createElement('div'); e.className = 'shout'; e.textContent = text; e.style.transform = `translate(${sc.x}px,${sc.y}px)`; box.appendChild(e); setTimeout(() => e.remove(), 1400);
}
/* ---------------- battle director: endless pressure + one big threat at a time ---------------- */
function makePressure(o) {
  const h = { on: true, max: o.max ?? 10, tag: o.tag ?? 'pr', spawned: 0 };
  const tick = setGameEvery(o.every ?? 1.4, () => {
    if (!h.on) return true;
    if (aliveEnemies(h.tag).length >= h.max) return;
    const ok = o.from.filter((p) => { const pt = v3(p[0], G.groundAt(p[0], p[1]) + 1.5, p[1]); return hiddenFromView(pt) || !hasLOS(P.eyePos, pt); }); const sp = pick(ok.length ? ok : o.from);
    const to = typeof o.to === 'function' ? o.to() : pick(o.to);
    enemy(sp[0] + rand(-2, 2), sp[1] + rand(-2, 2), { tag: h.tag, kind: Math.random() < (o.heavy ?? 0.12) ? 'heavy' : 'rifle', rush: Math.random() < (o.rush ?? 0.15), goTo: [to[0] + rand(-3, 3), to[1] + rand(-3, 3)], view: o.view ?? 90, acc: o.acc ?? 1, style: o.style });
    h.spawned++;
  });
  h.stop = () => { h.on = false; }; h.set = (n) => { h.max = n; };
  return h;
}
function setGameEvery(sec, fn) { const t = { dead: false }; const run = () => { if (t.dead) return; if (fn() === true) { t.dead = true; return; } setGameTimeout(run, sec); }; setGameTimeout(run, sec); return t; }

async function startMission(idx, phase = 0, keepSub = false) {
  const m = MISSIONS[idx]; if (!m) return;
  lockPointer(); initAudio(); stopMusic();
  abortScripts(); G.token++; const tok = G.token;
  if (m.id === 'p' && phase === 0) { try { store.set('tumen_fallen', []); } catch (e) {} }
  if (m.id === 'p' && phase === 0 && !G.testMode && !window.__skipNews) { hideScreens(); await playNews(); if (tok !== G.token) return; }
  if (!keepSub || !G.cpSub || G.cpSub.key !== idx + ':' + phase) G.cpSub = null;
  G.mission = m; G.missionIdx = idx; G.phaseI = phase;
  if (G.ffwd) endFfwd(); if (G.onLeave) { G.onLeave(); G.onLeave = null; } if (G.envReset) { G.envReset(); G.envReset = null; } G.realism = false; G.skipHold = 0; G.sqMarks = null; G.gunCam = false; G.beatFov = 0; G.gunCamPod = null; G.gunCamCockpit = null; G.atBox = null; G.worryT = G.ammoT = G.praiseT = G.multiT = -99; G.killTimes = []; G.chats = 0; G.inCredits = false; { const cr = $('credits'); if (cr) { cr.hidden = true; cr.classList.remove('on'); } }
  G.strikeMode = null; G.m7war = null; G.m7radio = null; G.m7squads = null; G.m7sqOn = false; G.m7sky = false; G.smash = null; G.ridersName = null; G.armorFree = false; G.armorHold = false; G.seoulCollapse = null; G.crush = []; G.crushOn = false; G.crushers = [];
  for (const v of AU.jets || []) v.stop(); AU.jets = [];
  G.tutShown = {}; TUT.q = []; TUT.cur = null; G.tutPos = null; { const el = $('tut'); if (el) el.classList.remove('on'); }
  if (idx === 0 && phase === 0) setTimeout(() => tut('marker', '화면의 <b>노란 마름모 ◆</b>를 따라가세요! 지금 가야 할 곳, 노려야 할 목표를 항상 가리켜요. 처음 나오는 기능은 이 노란 창이 하나씩 알려 줄 거예요.', null, 9), 0);
  hideScreens(); $('loading').hidden = false; $('loadTitle').textContent = m.title; $('loadSub').textContent = `${m.num} · ${m.place}`;
  await new Promise((r) => setTimeout(r, 60));
  newWorld(); G.trail = []; G.allyStyle = m.allyStyle || 'rok';
  applyEnv(m.env);
  G.onExplode = null; G.stealth = !!m.stealth; G.hitMul = m.hitMul ?? 1; G.enemyNades = m.nades !== false; G.nvg = false; G.nvgAvail = false; G.markAll = false; G.mmScale = m.mmScale || 1.4; G.mmExtra = null; G.timerEnd = null; G.timerText = null; G.navalCd = 0; G.navalMark = null; G.onDeck = null; G.cut = null; G.shake = 0; G.ringT = 0;
  document.body.classList.remove('cine');
  resetPlayer(m.loadout || {});
  P.bounds = m.bounds || null; P.yawLim = null; P.pitchLim = null; P.locked = false; P.hideVM = false;
  G.time = 0; G.timeScale = 1; G.airMode = false; G.navalShip = null; G.navalGun = null; G.bossMusic = null; G.musicMin = 0; G.noMusic = false; G.mInt = 0;
  if (phase === 0) G.stats = { kills: 0, heads: 0, shots: 0, hits: 0, t0: 0 };
  const S = makeS(); G.S = S;
  const wkey = m.phases[phase].world || 'A'; G.worldKey = wkey;
  if (wkey !== 'A') { const W = m.worlds[wkey]; G.allyStyle = W.allyStyle || G.allyStyle; applyEnv(W.env || m.env); resetPlayer(W.loadout || m.loadout || {}); W.build(S); }
  else m.build(S);
  mergeStatic(); applyRealism();
  flashlight.intensity = 0; canvas.style.filter = ''; canvas.style.transition = ''; hud.white.style.opacity = 0;
  setObjective(''); hud.subs.innerHTML = ''; $('fade').style.transition = 'none'; $('fade').style.opacity = phase === 0 && m.card !== false ? 1 : 0;
  if (AU.wind) AU.wind.set((G.env.windSnd ?? 0.4) * 0.35);
  $('loading').hidden = true; $('hud').hidden = false;
  G.mode = 'play'; G.paused = false;
  lockPointer();
  try {
    const ph0 = m.phases[phase];
    if (ph0.setup) ph0.setup(S);
    if (phase === 0 && m.introVideo) await runVideo(S, m.introVideo.file, m.introVideo); // the opening film comes before everything, the title card included
    if (phase === 0 && m.card !== false) await missionCard(S, m);
    else if (phase > 0) toast('체크포인트');
    for (let i = phase; i < m.phases.length; i++) {
      const ph = m.phases[i];
      if (i > phase) { G.phaseI = i; if ((ph.world || 'A') !== G.worldKey) await rebuildWorld(m, ph.world || 'A', S); else S.checkpoint(); }
      await m.phases[i].run(S);
    }
    if (G.token === tok) missionComplete();
  } catch (e) {
    if (!(e instanceof Abort)) { console.error(e); window.__err = String(e && e.stack || e); }
  }
}
async function missionCard(S, m) {
  const c = $('card'); c.hidden = false;
  const lines = [m.title, m.dateText, m.place, m.who, m.foeText ? '적 · ' + m.foeText : ''];
  const els = [$('cardTitle'), $('cardDate'), $('cardPlace'), $('cardWho'), $('cardFoe')];
  els.forEach((e) => (e.textContent = ''));
  $('cardNum').textContent = m.num;
  P.frozen = true;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i] || '';
    for (let k = 0; k <= L.length; k++) { els[i].textContent = L.slice(0, k); if (k % 2 === 0 && k) SFX.type(); await S.wait(i === 0 ? 0.06 : 0.035); }
    await S.wait(0.25);
  }
  await S.wait(1.6);
  c.classList.add('out'); S.fade(0, 2.2); await S.wait(0.8); c.hidden = true; c.classList.remove('out');
  P.frozen = false;
}
function missionComplete() {
  G.inCredits = false;
  G.mode = 'done'; if (document.pointerLockElement) document.exitPointerLock();
  const m = G.mission; progress[m.id] = true; store.set('tumen_prog', progress);
  const s = G.stats; const acc = s.shots ? Math.round(s.hits / s.shots * 100) : 0;
  $('doneTitle').textContent = m.title; $('doneNum').textContent = m.num;
  $('doneStats').innerHTML = `<div><span>사살</span><b>${s.kills}</b></div><div><span>헤드샷</span><b>${s.heads}</b></div><div><span>명중률</span><b>${acc}%</b></div><div><span>난이도</span><b>${DIFF[SET.diff].name}</b></div>`;
  const next = MISSIONS[G.missionIdx + 1];
  $('btnNext').hidden = !next || !!next.hidden; if (next) $('btnNext').textContent = `다음 · ${next.title}`;
  $('hud').hidden = true; showScreen('done'); stopMusic(); playMusic('sad');
}