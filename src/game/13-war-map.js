/* ---------------- the war map: one drawing used on the Pyeongtaek screen and in the between-mission briefings ---------------- */
const KMAP = {
  land: [[124.4, 40], [126, 41.2], [128.1, 41.9], [129.2, 42.3], [130, 42.95], [130.7, 42.3], [129.8, 41.8], [129.2, 40.7], [128, 40], [127.4, 39.4], [128.4, 38.5], [129.4, 37], [129.6, 35.9], [129, 35.05], [127.7, 34.7], [126.4, 34.4], [126.5, 35.4], [126.3, 36.6], [126.7, 37.4], [125.2, 37.9], [124.8, 38.1], [125.3, 38.8], [124.8, 39.6]],
  city: { seoul: [126.98, 37.56, '서울'], incheon: [126.6, 37.45, '인천', -58, 6], goseong: [128.47, 38.38, '고성'], pyeong: [127.0, 36.99, '평택', 12, 24], pyongyang: [125.75, 39.03, '평양'], hoeryong: [129.75, 42.44, '회령'], chuncheon: [127.73, 37.88, '춘천'], busan: [129.07, 35.18, '부산'] },
  // front lines, west to east
  front: {
    seoulN: [[125.6, 37.8], [126.6, 37.78], [126.95, 37.73], [127.3, 37.8], [127.73, 37.83], [128.4, 37.95], [128.9, 38.02], [129.3, 37.95]],
    seoulS: [[125.8, 37.34], [126.6, 37.37], [126.95, 37.43], [127.2, 37.42], [127.6, 37.33], [128.3, 37.25], [129.0, 37.2], [129.7, 37.12]],
  },
};
function koreaMap(g, st) {
  const W = 1024, H = 640; const vw = st.view || { lo: 127.55, la: 38.7, z: 1.1 }; const X = (lo) => W / 2 + (lo - vw.lo) * 49 * vw.z, Y = (la) => H / 2 - (la - vw.la) * 62 * vw.z;
  g.fillStyle = '#0b1622'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(120,170,220,.08)'; g.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const landPath = () => { g.beginPath(); KMAP.land.forEach(([a, b], i) => (i ? g.lineTo(X(a), Y(b)) : g.moveTo(X(a), Y(b)))); g.closePath(); };
  landPath(); g.fillStyle = '#2d4a3a'; g.fill(); g.strokeStyle = '#9fc2a8'; g.lineWidth = 3; g.stroke();
  const fr = st.front && KMAP.front[st.front];
  if (fr && (st.occ ?? 1) > 0) { const k = st.occ ?? 1;
    g.save(); landPath(); g.clip(); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, Y(fr[0][1])); for (const [a, b] of fr) g.lineTo(X(a), Y(b)); g.lineTo(W, Y(fr[fr.length - 1][1])); g.lineTo(W, 0); g.closePath(); g.fillStyle = `rgba(200,40,40,${0.42 * k})`; g.fill();
    g.strokeStyle = `rgba(255,96,96,${k})`; g.setLineDash([12, 8]); g.lineWidth = 4; g.beginPath(); fr.forEach(([a, b], i) => (i ? g.lineTo(X(a), Y(b)) : g.moveTo(X(a), Y(b)))); g.stroke(); g.setLineDash([]); g.restore();
    if (st.frontLabel) { g.fillStyle = `rgba(255,140,140,${k})`; g.font = 'bold 20px "Noto Sans KR",sans-serif'; g.fillText(st.frontLabel, X(st.frontAt ? st.frontAt[0] : 127.9), Y(st.frontAt ? st.frontAt[1] : fr[3][1]) + 26); }
    if (st.occLabel) { g.fillStyle = `rgba(255,200,200,${0.9 * k})`; g.font = 'bold 26px "Noto Sans KR",sans-serif'; g.fillText(st.occLabel, X(st.occAt ? st.occAt[0] : 126.6), Y(st.occAt ? st.occAt[1] : 40.4)); } }
  for (const ar of st.arrows || []) { const k = ar.k ?? 1; if (k <= 0) continue; const ax = X(ar.a[0]), ay = Y(ar.a[1]), bx = X(ar.b[0]), by = Y(ar.b[1]); const ex = ax + (bx - ax) * k, ey = ay + (by - ay) * k;
    g.strokeStyle = ar.col; g.lineWidth = ar.w || 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey); g.stroke(); const an = Math.atan2(ey - ay, ex - ax); g.fillStyle = ar.col; g.beginPath(); g.moveTo(ex + Math.cos(an) * 18, ey + Math.sin(an) * 18); g.lineTo(ex + Math.cos(an + 2.4) * 18, ey + Math.sin(an + 2.4) * 18); g.lineTo(ex + Math.cos(an - 2.4) * 18, ey + Math.sin(an - 2.4) * 18); g.fill();
    if (ar.label && k > 0.6) { g.fillStyle = ar.col; g.font = 'bold 20px "Noto Sans KR",sans-serif'; g.fillText(ar.label, (ax + bx) / 2 + (ar.lx ?? 14), (ay + by) / 2 + (ar.ly ?? 0)); } }
  if (st.ring) { const c = KMAP.city[st.ring.at || 'seoul']; g.strokeStyle = `rgba(255,220,90,${st.ring.k ?? 1})`; g.lineWidth = 4; g.beginPath(); g.arc(X(c[0]), Y(c[1]), 34 + Math.sin(performance.now() / 200) * 4, 0, TAU); g.stroke(); }
  for (const key of st.cities || ['seoul', 'incheon', 'goseong', 'pyeong']) { const c = KMAP.city[key]; if (!c) continue; const hot = st.hot === key; g.fillStyle = hot ? '#ffd860' : '#fff'; g.beginPath(); g.arc(X(c[0]), Y(c[1]), hot ? 9 : 6, 0, TAU); g.fill(); g.font = `bold ${hot ? 28 : 24}px "Noto Sans KR",sans-serif`; g.fillText(c[2], X(c[0]) + (c[3] ?? 12), Y(c[1]) + (c[4] ?? -8)); }
  if (st.title) { g.fillStyle = '#e8e2d0'; g.font = 'bold 40px "Noto Sans KR",sans-serif'; g.fillText(st.title, 30, 60); }
  if (st.sub) { g.font = '22px "Noto Sans KR",sans-serif'; g.fillStyle = '#b8c4cc'; g.fillText(st.sub, 30, 96); }
  for (const lb of st.labels || []) { g.fillStyle = lb.col || '#e8e2d0'; g.font = `bold ${lb.size || 22}px "Noto Sans KR",sans-serif`; g.fillText(lb.text, X(lb.at[0]), Y(lb.at[1])); }
}
/* between-mission briefing: the war map with narration lines. Runs as a cutscene, so it can be skipped. */
async function runBrief(S, o) {
  const el = $('brief'), cv = $('briefMap'), tx = $('briefText'); if (!el) return;
  const g = cv.getContext('2d'); const st = Object.assign({}, o.map); let alive = true;
  const loop = () => { if (!alive) return; koreaMap(g, st); requestAnimationFrame(loop); }; loop();
  tx.innerHTML = `<div class="bf-kicker">${o.kicker || '상황 브리핑'}</div><div class="bf-title">${o.title || ''}</div>`;
  el.hidden = false; void el.offsetWidth; el.classList.add('on');
  await S.cut(async () => {
    await S.wait(0.8);
    for (const ln of o.lines) {
      if (ln.map) { const { view, ...rest } = ln.map; Object.assign(st, rest);
        if (view) { const v0 = Object.assign({ lo: 127.55, la: 38.7, z: 1.1 }, st.view); S.tween(ln.viewT || 1.8, (k) => { st.view = { lo: lerp(v0.lo, view.lo, k), la: lerp(v0.la, view.la, k), z: lerp(v0.z, view.z, k) }; }); } }
      if (ln.grow) await S.tween(ln.growT || 1.6, (k) => { for (const i of ln.grow) if (st.arrows[i]) st.arrows[i].k = k; if (ln.fade) st.occ = k; });
      const d = document.createElement('div'); d.className = 'bf-line'; d.textContent = ln.t; tx.appendChild(d); void d.offsetWidth; d.classList.add('on');
      await S.wait(ln.d || Math.max(2.6, ln.t.length * 0.085));
    }
    await S.wait(1.2);
  });
  el.classList.remove('on'); await S.wait(0.5); el.hidden = true; alive = false;
}
/* a full-screen video in place of a briefing: black, then the picture cuts in; the last stretch fades out, then black holds before the mission.
   The hosted build plays media/<file>; the artifact carries the file inline (window.__MEDIA). Skippable like any cutscene. */
async function runVideo(S, file, o = {}) {
  const black0 = o.black ?? 1.4, fadeT = o.fade ?? 2, hold = o.hold ?? 4;
  const el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0;z-index:70;background:#000';
  const v = document.createElement('video'); v.src = (window.__MEDIA && window.__MEDIA[file]) || 'media/' + file; v.preload = 'auto'; v.playsInline = true;
  v.style.cssText = 'width:100%;height:100%;object-fit:contain;opacity:0'; el.appendChild(v); document.body.appendChild(el);
  const vol = () => (typeof SET !== 'undefined' && SET.vol != null ? Math.min(1, SET.vol) : 1);
  if (AU.master) AU.master.gain.setTargetAtTime(0, AU.ctx.currentTime, 0.2); // the battle outside goes quiet under the broadcast
  let done = false, raf = 0;
  const tick = () => { if (done) return; raf = requestAnimationFrame(tick); if (G.ffwd) { v.pause(); return; }
    const left = (v.duration || 1e9) - v.currentTime, k = clamp(left / fadeT, 0, 1);
    if (v.currentTime > 0) { v.style.opacity = k; v.volume = vol() * k; } };
  await S.cut(async () => {
    await S.wait(black0);
    if (!G.ffwd) {
      v.volume = vol(); v.style.opacity = 1; // cut straight in, no fade
      const ended = new Promise((res) => { v.onended = res; v.onerror = res; setTimeout(res, ((v.duration || 120) + 5) * 1000); });
      let fin = false;
      v.play().catch(() => { v.muted = true; v.play().catch(() => (fin = true)); }); // nothing can play it: go straight on
      raf = requestAnimationFrame(tick);
      ended.then(() => (fin = true));
      await S.until(() => fin || G.ffwd || G.testMode); // the autopilot steps game time far faster than a film plays: it skips the film
      v.style.opacity = 0;
    }
    await S.wait(hold);
  });
  done = true; cancelAnimationFrame(raf); v.pause(); v.removeAttribute('src'); v.load(); el.remove();
  if (AU.master && !G.ffwd) AU.master.gain.setTargetAtTime(SET.vol, AU.ctx.currentTime, 0.4);
}
const SKIP_HOLD = 2;
function skipTick(raw) {
  const el = $('skipUI'); if (!el) return;
  const can = (G.mode === 'play' && G.cut && !G.ffwd && !G.paused) || G.mode === 'news' || (G.inCredits && !G.creditsDone);
  if (!can) { G.skipHold = 0; el.classList.remove('on', 'hold'); return; }
  if (!G.skipShownFor || G.skipShownFor !== (G.cut || (G.inCredits ? 'cr' : 'news'))) { G.skipShownFor = G.cut || (G.inCredits ? 'cr' : 'news'); G.skipHintT = 4; }
  G.skipHintT = Math.max(0, (G.skipHintT || 0) - raw);
  if (K.Space) G.skipHold = (G.skipHold || 0) + raw; else G.skipHold = 0;
  el.classList.toggle('on', G.skipHintT > 0 || G.skipHold > 0); el.classList.toggle('hold', G.skipHold > 0);
  el.style.setProperty('--k', Math.min(1, (G.skipHold || 0) / SKIP_HOLD));
  if (G.skipHold >= SKIP_HOLD) { G.skipHold = 0; el.classList.remove('on', 'hold'); if (G.inCredits) G.creditSkip = true; else if (G.mode === 'news') { if (G.newsFinish) G.newsFinish(); } else startFfwd(); }
}
function startFfwd() {
  G.ffwd = true; G.ffwdFrames = 0; const b = $('skipBlack'); if (b) b.classList.add('on');
  if (AU.master) AU.master.gain.setTargetAtTime(0, AU.ctx.currentTime, 0.05); hud.subs.innerHTML = '';
}
function endFfwd() {
  G.ffwd = false; const b = $('skipBlack'); if (b) setTimeout(() => b.classList.remove('on'), 60);
  if (AU.master) AU.master.gain.setTargetAtTime(SET.vol, AU.ctx.currentTime, 0.3); hud.subs.innerHTML = '';
}
function loop(now) {
  requestAnimationFrame(loop);
  const raw = (now - last) / 1000; const rdt = Math.min(0.05, raw); last = now;
  fpsEl.n++; fpsEl.t += raw; if (fpsEl.t > 1) { fpsEl.v = fpsEl.n / fpsEl.t; fpsEl.n = 0; fpsEl.t = 0; }
  skipTick(raw);
  if (G.mode === 'play' && !G.paused) {
    if (G.ffwd) { // a skipped cutscene plays out at speed behind a black screen, so every script still ends where it should
      const t0 = performance.now(); let n = 0; while (G.cut && G.mode === 'play' && n < 600 && performance.now() - t0 < 60) { G.time += 1 / 30; tick(1 / 30, 1 / 30); n++; }
      if (!G.cut || G.mode !== 'play' || ++G.ffwdFrames > 900) endFfwd();
    } else { const dt = rdt * G.timeScale; G.time += dt; tick(dt, rdt); }
  }
  else if (G.mode === 'menu' || G.mode === 'done') { if (G.mode === 'menu') menuTick(rdt); else { G.time += rdt; updateParticles(rdt); updateEmitters(rdt); updateSnow(rdt); } sky.position.copy(camera.position); stars.position.copy(camera.position); }
  if (G.ffwd) return; // nothing to see behind the black while a skipped cutscene runs out
  renderFrame(G.mode === 'play' && VM.root.visible);
}
