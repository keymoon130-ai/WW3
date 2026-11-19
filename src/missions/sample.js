/* ---------- the sample mission ---------- */
const HG_SPOTS = [['한강대교 남단 (노량진)', 0, 30], ['한강대교 아치 구간', 0, -210], ['한강철교', 0, -660, Math.PI / 2], ['노들섬', 0, -480], ['한강대교 북단', 0, -1000], ['한강대로 · 용산 센트럴파크 앞', 0, -1420], ['용산역 광장', -128, -1655, Math.PI / 2, -122], ['신용산역', 0, -1740], ['서울역 광장', 'ss'], ['숭례문', 'sr'], ['서울광장', 'sc'], ['광화문광장', 'gh']];
defMission({
  id: 'hg', hidden: true, act: '샘플', num: '샘플', title: '한강대로 1:1',
  dateText: '2032년 3월 28일 06:40', dateShort: '2032.03.28', place: '서울 · 한강대교 → 한강대로 → 서울역 → 광화문', placeShort: '한강대로→광화문', who: '서한준 이병 · 제12국경수비대 3분대', whoShort: '서한준',
  env: { sky: [0x7b8ea4, 0xc0bcb0, 0xd0c4b0], glow: 0xffd2a0, glowDir: [0.7, 0.12, 0.3], fog: 0xbcbab4, fogD: 0.0011, hemi: [0xd4dae2, 0x5a5650, 0.95], sun: [0xfff0dc, 1.35], sunDir: [0.75, 0.55, 0.35], exposure: 1.0, viewDist: 900 },
  loadout: { weapons: ['rifle', 'pistol'], nades: 4 },
  bounds: [-3600, -7400, 1400, 600],
  build(S) {
    newWorld(); G.groundAt = hgGround; G.waterY = HG.water;
    hgCity();
    G.m10allies = [];
  },
  phases: [
    /* the flight: 노량진 → over the arches → 노들섬 → 북단 → 한강대로 → 신용산 */
    {
      setup(S) { S.player(-30, 120, 0); },
      async run(S) {
        await hgFlight(S, { test: true });
        await S.fade(1, 1.5); await S.black(['샘플 끝', '한강대교 → 광화문 · 실제 비율'], 3.5);
        toMenu();
      },
    },
    /* walking around: no enemies, the column parked, press T to jump between landmarks */
    {
      setup(S) { S.player(-9, -560, 0); },
      async run(S) {
        S.fade(0, 1.2); S.give('rifle'); G.hitMul = 0;
        squad(S, [{ key: 'han', name: '한지운 하사', x: -7, z: -566 }, { key: 'lee', name: '리선우 병장', x: -11, z: -568 }, { key: 'yoon', name: '윤하린 중사', x: -5, z: -570 }]);
        for (const k of ['han', 'lee', 'yoon']) { const a = S.sq[k]; a.follow = { leader: { pos: P.pos, alive: true, isPlayer: true }, back: 4, side: k === 'lee' ? -3 : 3 }; }
        new Vehicle('tank', -6.5, -590, { team: 'ally', k2: true, armed: false, invuln: true, speed: 0 });
        S.allyBMP(-13, -610, 0, { k808: true, real: true, invuln: true, speed: 0, sam: false, rpg: false });
        new Vehicle('tank', 6.5, -640, { team: 'ally', k2: true, armed: false, invuln: true, speed: 0 }).yaw = Math.PI;
        S.obj('자유 관람 — 한강대교 · 노들섬 · 한강대로');
        S.hint('<kbd>T</kbd> 다음 장소로 이동 · <kbd>Shift</kbd> 달리기 · <kbd>ESC</kbd> 메뉴', 10);
        let spot = 3;
        const onKey = (e) => { if (e.code !== 'KeyT' || G.mode !== 'play' || G.paused) return; spot = (spot + 1) % HG_SPOTS.length; let [name, x, z, yaw] = HG_SPOTS[spot]; let px;
          if (typeof x === 'string') { [x, z, yaw] = RT.spots[x]; px = x; } else px = HG_SPOTS[spot][4] ?? (yaw ? -17 : x - 9); P.pos.set(px, hgGround(px, z), z); P.vel.set(0, 0, 0); P.yaw = yaw || 0; for (const k of ['han', 'lee', 'yoon']) { const a = S.sq[k]; if (a) { a.pos.set(x - 9 + rand(-3, 3), 0, z + rand(3, 6)); } } toast(name); };
        addEventListener('keydown', onKey); G.onLeave = () => removeEventListener('keydown', onKey);
        // keep out of the river: step back to the last dry spot
        const last = P.pos.clone(); S.every(0.05, () => { if (hgGround(P.pos.x, P.pos.z) <= HG.water + 0.5 && !(Math.abs(P.pos.x) <= HG.half && P.pos.z <= 46 && P.pos.z >= HG.N)) { P.pos.copy(last); P.vel.set(0, 0, 0); } else last.copy(P.pos); });
        await S.until(() => false);
      },
    },
  ],
});
/* the sample page boots straight into a small chooser */
function hgSampleMenu() {
  const idx = MISSIONS.findIndex((m) => m.id === 'hg'); if (idx < 0) return;
  const el = document.createElement('div'); el.id = 'hgMenu';
  el.innerHTML = `<div class="hg-card"><div class="hg-k">WW3 · 그래픽 샘플</div><h1>한강대로 1:1</h1>
    <p>한강대교 1,005 m(아치 7경간 · 노들섬 · 북측 거더교)와 한강대로를 실제 비율로 옮겼어요. K2·K808도 실제 크기예요.</p>
    <div class="hg-b"><button id="hgFly">헬기 미션 (약 4분)</button><button id="hgWalk">걸어서 둘러보기</button></div>
    <div class="hg-q">그래픽 <button data-q="high">높음 (기존)</button><button data-q="ultra">최고 (새 렌더링)</button></div></div>`;
  document.body.appendChild(el);
  const setQ = (q) => { SET.quality = q; store.set('tumen_set', SET); applyQuality(); el.querySelectorAll('[data-q]').forEach((b) => b.classList.toggle('on', b.dataset.q === q)); };
  if (!store.get('hg_q_set', false)) { setQ('ultra'); store.set('hg_q_set', true); } else setQ(SET.quality === 'low' ? 'high' : SET.quality);
  el.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => setQ(b.dataset.q)));
  const go = (ph) => { el.hidden = true; initAudio(); startMission(idx, ph); };
  $('hgFly').onclick = () => go(0); $('hgWalk').onclick = () => go(1);
  G.onMenu = () => { el.hidden = false; };
}
