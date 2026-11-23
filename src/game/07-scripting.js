/* ---------------- scripting ---------------- */
const gameTimeouts = [];
function setGameTimeout(fn, sec) { gameTimeouts.push({ t: G.time + sec, fn, tok: G.token }); }
function abortScripts() {
  for (const w of G.waiters) w.rej(new Abort()); for (const c of G.conds) c.rej(new Abort()); G.waiters = []; G.conds = []; gameTimeouts.length = 0;
}
function updateScripts() {
  for (let i = G.waiters.length - 1; i >= 0; i--) { const w = G.waiters[i]; if (G.time >= w.t) { G.waiters.splice(i, 1); w.res(); } }
  for (let i = G.conds.length - 1; i >= 0; i--) { const c = G.conds[i]; let ok = false; try { ok = c.fn(); } catch (e) { ok = false; } if (ok) { G.conds.splice(i, 1); c.res(); } }
  for (let i = gameTimeouts.length - 1; i >= 0; i--) { const t = gameTimeouts[i]; if (t.tok !== G.token) { gameTimeouts.splice(i, 1); continue; } if (G.time >= t.t) { gameTimeouts.splice(i, 1); t.fn(); } }
}
function makeS() {
  const tok = G.token;
  const S = {
    wait: (s) => new Promise((res, rej) => G.waiters.push({ t: G.time + s, res, rej })),
    until: (fn) => new Promise((res, rej) => G.conds.push({ fn, res, rej })),
    later: (sec, fn) => setGameTimeout(fn, sec),
    async say(who, text, o = {}) { const dur = o.dur ?? clamp(1.4 + text.length * 0.075, 2.2, 7); subtitle(who, text, dur, o.radio); await S.wait(o.wait ?? dur); },
    sayBg(who, text, o = {}) { const dur = o.dur ?? clamp(1.4 + text.length * 0.075, 2.2, 7); subtitle(who, text, dur, o.radio); },
    radio(who, text, o = {}) { return S.say(who, text, Object.assign({ radio: true }, o)); },
    obj(text, pos) { setObjective(text); G.objPos = pos ? (pos.isVector3 ? pos.clone() : v3(pos[0], G.groundAt(pos[0], pos[1]), pos[1])) : null; },
    mark(pos) { G.objPos = pos ? (pos.isVector3 ? pos.clone() : v3(pos[0], G.groundAt(pos[0], pos[1]), pos[1])) : null; },
    hint, toast,
    async reach(pos, r = 3, text) { if (text) S.obj(text, pos); const p = pos.isVector3 ? pos : v3(pos[0], 0, pos[1]); await S.until(() => Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < r); },
    async killAll(tag, leave = 0) { await S.until(() => aliveEnemies(tag).length <= leave); },
    use(pos, label, r = 2.4, o = {}) { const p = pos.isVector3 ? pos : v3(pos[0], (o.y ?? G.groundAt(pos[0], pos[1]) + 1), pos[1]); tut('use', `노란 마름모 위치로 가서 <kbd>F</kbd>를 누르세요 — <b>${label}</b>`, p, 12); return new Promise((res, rej) => { const it = { pos: p, label, r, res, onUse: o.onUse }; G.interactables.push(it); G.waiters.push({ t: 1e12, res() {}, rej }); }); },
    /* a quiet moment: walk up to a squadmate and press F to talk. lines: [['them'|'me'|name, text, dur?], ...] */
    chat(key, lines, o = {}) {
      const a = typeof key === 'string' ? S.sq[key] : key; if (!a || !a.alive) return null;
      tut('chat', '쉬는 틈엔 분대원에게 다가가 <kbd>F</kbd> — <b>대화하기</b>. 꼭 안 해도 되지만, 그들의 이야기를 들을 수 있어요.', a.eye(v3()), 8);
      const it = { pos: a.eye(v3()).clone(), label: o.label || (a.name.split(' ')[0] + '와 이야기하기'), r: 2.8, once: false }; let done = false;
      const drop = () => { done = true; const i = G.interactables.indexOf(it); if (i >= 0) G.interactables.splice(i, 1); };
      it.onUse = async () => { drop(); const hold = a.hold, fol = a.follow; a.faceYaw = Math.atan2(-(P.pos.x - a.pos.x), -(P.pos.z - a.pos.z));
        for (const [w, t, d] of lines) await S.say(w === 'me' ? playerIdentity().name : w === 'them' ? a.name : w, t, { dur: d || Math.max(2.2, t.length * 0.09) });
        a.faceYaw = null; G.chats = (G.chats || 0) + 1; if (o.then) o.then(); };
      G.interactables.push(it); S.every(0.1, () => { if (done) return true; if (!a.alive) { drop(); return true; } it.pos.copy(a.eye(v3())); });
      it.stop = drop; return it;
    },
    station(pos, label, onUse, r = 2.4) { const p = pos.isVector3 ? pos : v3(pos[0], G.groundAt(pos[0], pos[1]) + 1, pos[1]); if (label !== '탄약 보급') tut('st:' + label, `노란 마름모 위치에서 <kbd>F</kbd> — <b>${label}</b>. 필요할 때마다 다시 꺼낼 수 있어요.`, p, 10); const it = { pos: p, label, r, onUse, once: false }; G.interactables.push(it); return it; },
    give(id, ammo) { giveWeapon(id, true, ammo); }, take: takeWeapon,
    player(x, z, yaw = 0, y) { setPlayer(x, z, yaw, y); },
    async timer(sec, label, fmt) { G.timerEnd = G.time + sec; G.timerLabel = label; G.timerFmt = fmt; await S.wait(sec); G.timerEnd = null; },
    stopTimer() { G.timerEnd = null; },
    async wave(o) {
      const out = []; const n = o.n ?? 6;
      const seen = (p) => { const pt = v3(p[0], G.groundAt(p[0], p[1]) + 1.5, p[1]); const dv = pt.clone().sub(P.eyePos); if (dv.length() > 140) return false; const f = v3(-Math.sin(P.yaw), 0, -Math.cos(P.yaw)); if (dv.clone().setY(0).normalize().dot(f) < 0.25) return false; return hasLOS(P.eyePos, pt); };
      for (let i = 0; i < n; i++) {
        const hidden = o.from.filter((p) => !seen(p)); const sp = hidden.length ? pick(hidden) : o.from.reduce((a, b) => (Math.hypot(b[0] - P.pos.x, b[1] - P.pos.z) > Math.hypot(a[0] - P.pos.x, a[1] - P.pos.z) ? b : a)); const heavy = Math.random() < (o.heavy ?? 0.1);
        const a = enemy(sp[0] + rand(-2, 2), sp[1] + rand(-2, 2), { tag: o.tag ?? 'wave', kind: heavy ? 'heavy' : 'rifle', rush: Math.random() < (o.rush ?? 0.15), goTo: o.to ? (typeof o.to === 'function' ? o.to() : pick(Array.isArray(o.to[0]) ? o.to : [o.to])) : [P.pos.x + rand(-8, 8), P.pos.z + rand(-8, 8)], view: o.view ?? 90, acc: o.acc ?? 1 });
        out.push(a); await S.wait(o.interval ?? 0.6);
      }
      return out;
    },
    explode(pos, o = {}) { explode(pos.isVector3 ? pos : v3(pos[0], pos[1], pos[2]), o); },
    shake(a) { G.shake += a; },
    async slowmo(scale, dur) { G.timeScale = scale; await S.wait(dur * scale); G.timeScale = 1; },
    async fade(to, dur = 1) { const f = $('fade'); f.style.transition = `opacity ${dur}s`; f.style.opacity = to; await S.wait(dur); },
    /* end credits: the title, then the names of the dead */
    async credits() {
      const c = $('credits'); const fallen = (store.get('tumen_fallen', []) || []).slice();
      while (fallen.length < 60) fallen.push(randSoldierName(Math.random() < 0.2 ? 'usmc' : 'rok'));
      const named = [['최민석 병장', '2032. 1. 1 · 두만강 제3초소'], ['강태현 상사', '2032. 4. 9 · 두만강 부교']];
      c.querySelector('.cr-list').innerHTML = named.map(([n, w]) => `<div class="cr-named">${n}<small>${w}</small></div>`).join('') + '<div class="cr-sep"></div>' + fallen.map((n) => `<div>${n}</div>`).join('');
      c.hidden = false; void c.offsetWidth; c.classList.add('on'); playMusic('sad');
      const roll = c.querySelector('.cr-roll'); const H = roll.scrollHeight;
      // the roll runs on real time (a pause or a lost mouse lock cannot freeze it); F or the button doubles it, Space held or the button skips it
      G.inCredits = true; G.creditsDone = false; G.creditFast = false; G.creditSkip = false; if (document.pointerLockElement) document.exitPointerLock();
      const fastB = c.querySelector('.cr-fast'), skipB = c.querySelector('.cr-skip');
      fastB.onclick = () => { G.creditFast = !G.creditFast; fastB.classList.toggle('on', G.creditFast); }; skipB.onclick = () => { G.creditSkip = true; };
      fastB.classList.remove('on'); c.querySelector('.cr-ctl').hidden = false;
      const onKey = (e) => { if (e.code === 'KeyF') { G.creditFast = !G.creditFast; fastB.classList.toggle('on', G.creditFast); } }; addEventListener('keydown', onKey);
      await new Promise((res) => { let y = innerHeight, last = performance.now(), delay = 4.5;
        const step = (now) => { const dt = Math.min(0.1, (now - last) / 1000); last = now; const k = G.creditFast ? 2 : 1;
          if (G.creditSkip || G.mode === 'menu') { res(); return; }
          delay -= dt * k; if (delay <= 0) y -= 55 * dt * k; roll.style.transition = 'none'; roll.style.transform = `translateY(${y}px)`;
          if (y < -H) { res(); return; } requestAnimationFrame(step); };
        requestAnimationFrame(step); });
      removeEventListener('keydown', onKey); c.querySelector('.cr-ctl').hidden = true;
      const realWait = (sec) => new Promise((r) => { const t0 = performance.now(); const f = () => { if (G.creditSkip || performance.now() - t0 > sec * 1000) r(); else requestAnimationFrame(f); }; requestAnimationFrame(f); });
      c.querySelector('.cr-end').classList.add('on'); await realWait(G.creditSkip ? 0.8 : 4.5);
      c.classList.remove('on'); await realWait(1); c.hidden = true; c.querySelector('.cr-end').classList.remove('on'); G.creditsDone = true; // inCredits stays on until the mission closes, so a lost mouse lock cannot pause the last card
      if (G.paused) { G.paused = false; hideScreens(); }
    },
    async black(lines, dur = 3) { const b = $('blacktext'); b.innerHTML = lines.map((l) => `<div>${l}</div>`).join(''); b.classList.add('on'); await S.wait(dur); b.classList.remove('on'); await S.wait(0.6); },
    async cut(fn, o = {}) {
      G.cut = { pos: camera.position.clone(), look: camera.position.clone().add(camera.getWorldDirection(v3())), skippable: false, roll: 0, fov: camera.fov };
      document.body.classList.add('cine'); P.god = true;
      try { await fn(); } finally { if (G.token === tok) { G.cut = null; document.body.classList.remove('cine'); P.god = false; } }
    },
    cam(pos, look, dur = 0, ease = smooth) {
      const C = G.cut; if (!C) return Promise.resolve(); const p0 = C.pos.clone(), l0 = C.look.clone(); const p1 = pos.isVector3 ? pos.clone() : v3(...pos), l1 = look.isVector3 ? look.clone() : v3(...look);
      if (!dur) { C.pos.copy(p1); C.look.copy(l1); return Promise.resolve(); }
      let t = 0; return new Promise((res) => { G.updaters.push((dt) => { t += dt; const k = ease(clamp(t / dur, 0, 1)); C.pos.lerpVectors(p0, p1, k); C.look.lerpVectors(l0, l1, k); if (t >= dur) { res(); return true; } }); });
    },
    camFov(f) { if (G.cut) G.cut.fov = f; },
    tween(dur, fn, ease = smooth) { let t = 0; return new Promise((res) => { G.updaters.push((dt) => { t += dt; const k = clamp(t / dur, 0, 1); fn(ease(k), dt); if (t >= dur) { res(); return true; } }); }); },
    every(sec, fn) { let acc = 0; const u = (dt) => { if (G.token !== tok) return true; acc += dt; if (acc >= sec) { acc = 0; return fn() === true; } }; G.updaters.push(u); return u; },
    stop(u) { const i = G.updaters.indexOf(u); if (i >= 0) G.updaters.splice(i, 1); },
    checkpoint() { toast('체크포인트'); },
    /* a checkpoint inside a phase: retrying resumes from step n of the same phase */
    cp(n) { const key = G.missionIdx + ':' + G.phaseI; const had = G.cpSub && G.cpSub.key === key ? G.cpSub.v : 0; G.cpSub = { key, v: n }; if (n > had) toast('체크포인트'); },
    cpGet() { return G.cpSub && G.cpSub.key === G.missionIdx + ':' + G.phaseI ? G.cpSub.v : 0; },
    ammoCrate(x, z) { const y = G.groundAt(x, z); tut('ammo', '<b>탄약 상자</b>(노란 마름모)에서 <kbd>F</kbd> — 탄약과 수류탄이 가득 차요.', v3(x, y + 0.8, z), 8); addBox(x, y, z, 1.2, 0.6, 0.7, mat('ammobox', { color: 0x4e5638 }), { dynamic: true }); addBox(x, y + 0.6, z, 0.3, 0.05, 0.5, mat('ammotxt', { color: 0xd8c47a }), { dynamic: true, collide: false }); return S.station(v3(x, y + 0.8, z), '탄약 보급', () => refillAmmo(), 2.2); },
    pickupWeapon(x, z, id, label, rot = 0) {
      const y = G.groundAt(x, z); const grp = new THREE.Group(); const m = mat('pickw', { color: 0x4a4e3a });
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8), m); tube.rotation.z = Math.PI / 2; grp.add(tube); grp.position.set(x, y + 0.12, z); grp.rotation.y = rot; G.world.add(grp);
      const glow = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 24), new THREE.MeshBasicMaterial({ color: 0xf0b43c, transparent: true, opacity: 0.5, side: THREE.DoubleSide })); glow.rotation.x = -Math.PI / 2; glow.position.set(x, y + 0.03, z); G.world.add(glow);
      tut('pickup', `바닥의 무기(노란 마름모)에 다가가 <kbd>F</kbd>로 주우세요 — <b>${label}</b>`, v3(x, y + 0.3, z), 10);
      return S.use(v3(x, y + 0.3, z), label, 2.4, { onUse: () => { G.world.remove(grp); G.world.remove(glow); giveWeapon(id, true); } });
    },
    nvg(on) { G.nvgAvail = on; if (!on) G.nvg = false; if (on) tut('nvg', '<kbd>N</kbd> 야간투시경 켜기/끄기 — 어두울 땐 켜세요.', null, 7); },
    /* Call-of-Duty style "follow the leader": the leader walks a route, waits for the player, followers trail the leader.
       route: [[x, z, {crouch, run, wait, say:[who,text], until:fn, fight:tag, leave, fn:async}], ...] */
    async lead(key, route, o = {}) {
      const L = S.sq[key]; if (!L) return;
      tut('lead', '노란 마름모가 붙은 <b>분대장</b>을 따라가세요. 너무 멀어지면 기다려 줘요.', null, 7);
      L.follow = null; L.route = null; L.goTo = null; L.leading = true; L.hold = false; L.trail = [L.pos.clone()];
      const slots = [[2.4, -1.5], [2.4, 1.5], [4.8, -1.8], [4.8, 1.8], [7.2, -1], [7.2, 1]];
      (o.follow || []).forEach((k, i) => { const f = S.sq[k]; if (f && f !== L) { const sl = slots[i % slots.length]; f.route = null; f.goTo = null; f.follow = { leader: L, back: sl[0], side: sl[1] }; f.hold = false; f.state = f.state === 'combat' ? f.state : 'idle'; } });
      if (o.label) setObjective(o.label);
      let lastCall = G.time, farT0 = null; G.sqMarks = null; L.lastDir = null; L.playerLag = 0; L.playerAhead = 0;
      const mark = S.every(0.15, () => { if (!L.leading) return; G.objPos = L.pos.clone().add(v3(0, 1.4, 0));
        /* how far the player is behind the leader along the way we are going: being ahead of him (or level, off to one side) never counts as lagging */
        const px = P.pos.x - L.pos.x, pz = P.pos.z - L.pos.z, dist = Math.hypot(px, pz), dr = L.lastDir; const ahead = dr ? px * dr[0] + pz * dr[1] : 0;
        const lag = ahead >= 0 ? Math.max(0, Math.sqrt(Math.max(0, dist * dist - ahead * ahead)) - 9) : dist; L.playerLag = lag; L.playerAhead = ahead;
        // dropped back: diamonds over the squad and a hint right away, a shout if it goes on; all gone once he is back with them
        const wd = o.waitDist || 14;
        if (lag > wd - 2) { if (farT0 === null) farT0 = G.time; const ft = G.time - farT0;
          if (ft > 1.5 && !G.sqMarks) { G.sqMarks = [L, ...(o.follow || []).map((k) => S.sq[k])].filter((a) => a && a.alive); hint('분대원들을 따라가세요!', 5); }
          if (ft > 6 && G.time - lastCall > 11) { lastCall = G.time; subtitle(L.name, playerIdentity().name + '! 빨리 와!', 2.2); } }
        else if (lag < 7) { farT0 = null; G.sqMarks = null; } });
      for (const wp of route) {
        const [x, z, opt = {}] = wp; L.goal = v3(x, 0, z); L.routeGoal = L.goal.clone(); L.wantCrouch = !!opt.crouch; L.leadSpeed = opt.run ? 5.6 : opt.crouch ? 2.6 : 4.2;
        let bestD = 1e9, bestT = G.time; const base = L.leadSpeed, wd = opt.waitDist || o.waitDist || 14; L.leadSpeed = Math.max(base, L.curLead || 0);
        await S.until(() => {
          let dx = x - L.pos.x, dz = z - L.pos.z, dl = Math.hypot(dx, dz); if (dl > 2) L.lastDir = [dx / dl, dz / dl];
          const lag = L.playerLag || 0, ahead = L.playerAhead || 0; const far = lag > wd; L.pausedForPlayer = far;
          // never slower than the player when he keeps up or runs ahead (a hair faster, so he is never left waiting); ease off as he drops back
          const pv = Math.min(7.4, (P.speed || 0) + 0.35); let tgt;
          if (ahead > 3) tgt = Math.max(base * 1.25, pv); else if (lag < 6) tgt = Math.max(base, pv); else tgt = base * Math.max(0.35, (wd - lag) / (wd - 6));
          L.curLead = (L.curLead || base) + (tgt - (L.curLead || base)) * 0.12; L.leadSpeed = L.curLead;
          const d = Math.hypot(L.pos.x - x, L.pos.z - z);
          if (!L.goal || (Math.hypot(L.goal.x - x, L.goal.z - z) > 0.1 && L.pos.distanceTo(L.goal) < 1.2)) L.goal = v3(x, 0, z); // stuck-detours must not replace the route
          if (d < bestD - 0.2) { bestD = d; bestT = G.time; }
          if (!far && G.time - bestT > 3 && d < 6) return true; // blocked near the point: good enough
          if (!far && G.time - bestT > 6) { L.pos.lerp(v3(x, L.pos.y, z), 0.02); }
          return d < 1.3;
        });
        L.pausedForPlayer = false;
        if (opt.say) { if (opt.bg) S.sayBg(opt.say[0], opt.say[1]); else await S.say(opt.say[0], opt.say[1], { radio: opt.radio }); }
        if (opt.until) await S.until(opt.until);
        // clear the area, but never stall: after a while the leader pushes on as long as nobody is right on top of us
        if (opt.fight !== undefined) { const t0 = G.time, cap = opt.fightMax ?? o.fightMax ?? 30; await S.until(() => aliveEnemies(opt.fight).length <= (opt.leave || 0) || G.time - t0 > cap); }
        if (opt.fn) await opt.fn();
        if (opt.wait) await S.wait(opt.wait);
      }
      S.stop(mark); L.leading = false; L.goal = null; L.routeGoal = null; L.home = L.pos.clone(); G.sqMarks = null; L.curLead = 0; L.leadSpeed = 0;
    },
    /* a fixed route for one soldier: [[x, z, {run, wait, crouch:false, until}], ...]; resolves when he has walked it */
    route(who, pts, o = {}) {
      const a = typeof who === 'string' ? S.sq[who] : who; if (!a || !a.alive) return Promise.resolve();
      a.follow = null; a.leading = false; a.goTo = null; a.hold = true;
      return new Promise((res) => { a.route = { pts: pts.map((p) => Array.isArray(p) ? Object.assign({ x: p[0], z: p[1] }, p[2] || {}) : p), i: 0, waitT: 0, done: res }; });
    },
    pressure(o) { return makePressure(o); },
    /* one big threat: announced on the radio, the player deals with it */
    async threat(kind, o = {}) {
      tut('th_' + (kind === 'heli' ? 'heli' : kind === 'mg' ? 'mg' : P.weapons.includes('km19') ? 'armor_heli' : 'armor'), kind === 'heli' ? '<b>적 헬기!</b> 대공미사일을 꺼내(장갑차 뒤 노란 마름모 · <kbd>F</kbd>) <kbd>우클릭</kbd>으로 겨누고 LOCK 되면 <kbd>좌클릭</kbd>. 도어건·기관총으로도 떨굴 수 있어요.' : kind === 'mg' ? '<b>기관총 진지</b> — 정면으로 가지 말고 표적지시기나 수류탄으로.' : (P.weapons.includes('km19') ? '<b>적 장갑차!</b> 노란 마름모를 노리고 기관총을 계속 퍼부으세요. 아군 전차도 함께 쏴요.' : '<b>적 장갑차!</b> 총알은 안 들어가요. RPG·로켓으로 노란 마름모를 노리세요. 아군 전차도 함께 쏴요.'), null, 9);
      const who = o.who || '윤하린 중사';
      const lines = { heli: ['공격 헬기 접근! 대공미사일 꺼내십시오!', '적 헬기! 하늘입니다!'], bmp: ['적 BMP 접근! RPG 준비하십시오!', '적 장갑차입니다! 대전차 화기!'], tank: ['적 전차! 로켓으로 잡아야 합니다!', '전차 접근 중입니다!'], mg: ['기관총 진지! 표적지시기로 찍으십시오!', '적 기관총 진지입니다!'] }[kind];
      S.radio(who, o.line || pick(lines), { dur: 2.6 });
      let v;
      if (kind === 'heli') v = new Vehicle('aheli', o.x ?? -300, o.z ?? -300, { path: o.path, loop: true, speed: o.speed ?? 22, armed: true, hp: o.hp ?? 520 });
      else if (kind === 'bmp' || kind === 'tank') v = new Vehicle(kind, o.x, o.z, { path: o.path, speed: kind === 'tank' ? 3 : 4.2, hp: o.hp, reload: o.reload, yFn: o.yFn });
      if (v) { G.threatV = v; if (o.mark !== false) { const mk = S.every(0.2, () => { if (!v.alive) return; const noAT = (kind === 'bmp' || kind === 'tank') && G.atBox && !['rpg', 'atgm'].some((w) => P.weapons.includes(w)); G.objPos = noAT ? G.atBox.clone() : v.pos.clone().add(v3(0, 2, 0)); }); await S.until(() => !v.alive || (o.timeout && 0)); S.stop(mk); } else await S.until(() => !v.alive); }
      G.threatV = null; if (o.done !== false) S.sayBg(who, pick(['격파 확인!', '처리했습니다!', '좋습니다, 제거됐습니다!']), { dur: 1.8 });
      return v;
    },
    /* an armoured push: vehicles crawl forward along their lanes ahead of the infantry, never outrunning the player,
       and the ground right behind each hull becomes cover the soldiers use */
    armorPush(list, o = {}) {
      const dir = o.dir ?? -1, lead = o.lead ?? 14; const out = [];
      const owner = {}; /* a vehicle already on the field can be handed a new push (d.v): it drives on from where it is instead of a fresh one appearing */
      for (const d of list) {
        if (d.v && d.v.alive) { const v = d.v; v.path = (d.path || []).map((p) => v3(p[0], 0, p[1])); v.pi = 0; v.speed = d.speed ?? 2.6; v.stopped = false; v.pushBy = owner;
          if (!v.covers) { const cov = [v3(), v3(), v3()]; G.covers.push(...cov); v.covers = cov; } out.push(v); continue; }
        const v = d.type === 'k21' ? S.allyBMP(d.x, d.z, d.yaw ?? (dir < 0 ? 0 : Math.PI), { invuln: true, speed: d.speed ?? 2.6, path: d.path, sam: !!d.sam, rpg: !!d.rpg })
          : new Vehicle(d.type, d.x, d.z, { team: 'ally', armed: true, invuln: true, speed: d.speed ?? 2.6, path: d.path, color: d.color, reload: 6, range: 170, accurate: true, yieldPeople: false, yaw: d.yaw ?? (dir < 0 ? 0 : Math.PI) });
        v.yaw = d.yaw ?? (dir < 0 ? 0 : Math.PI); v.m.root.rotation.y = v.yaw; if (d.type === 'k21') { v.o.yieldPeople = false; v.o.reload = 3; }
        const cov = [v3(), v3(), v3()]; G.covers.push(...cov); v.covers = cov; v.pushBy = owner; out.push(v);
      }
      S.every(0.3, () => { for (const v of out) { if (!v.alive || v.pushBy !== owner) continue; const ahead = (v.pos.z - P.pos.z) * dir; v.stopped = !G.armorFree && (ahead > lead || !!G.armorHold); const bx = Math.sin(v.yaw), bz = Math.cos(v.yaw); v.covers[0].set(v.pos.x + bx * 6.5, 0, v.pos.z + bz * 6.5); v.covers[1].set(v.pos.x + bx * 5.5 + bz * 2.6, 0, v.pos.z + bz * 5.5 - bx * 2.6); v.covers[2].set(v.pos.x + bx * 5.5 - bz * 2.6, 0, v.pos.z + bz * 5.5 + bx * 2.6); } });
      return out;
    },
    /* friendly IFV with launchers stowed in the back */
    allyBMP(x, z, yaw = 0, o = {}) {
      const v = new Vehicle('bmp', x, z, { team: 'ally', k808: !!o.k808, real: !!o.real, yaw, path: o.path, speed: o.speed ?? 4, armed: o.armed ?? true, hp: o.hp ?? 2000, invuln: o.invuln, accurate: true, reload: 3, yieldPeople: false });
      v.yaw = yaw; v.m.root.rotation.y = yaw;
      const rear = () => v.pos.clone().add(v3(Math.sin(v.yaw) * 6.0, 1.1, Math.cos(v.yaw) * 6.0));
      if (o.sam !== false) { const it = S.station(rear(), '대공미사일 꺼내기', () => { giveWeapon('sam', true); P.ammo.sam.res = Math.max(P.ammo.sam.res, 2); P.ammo.sam.mag = 1; }, 2.2); v.samIt = it; }
      if (o.rpg !== false) { const it = S.station(rear().add(v3(Math.cos(v.yaw) * 1.2, 0, -Math.sin(v.yaw) * 1.2)), 'RPG 꺼내기', () => { giveWeapon('rpg', true); P.ammo.rpg.res = Math.max(P.ammo.rpg.res, 3); }, 2.2); v.rpgIt = it; }
      S.every(0.3, () => { if (v.samIt) v.samIt.pos.copy(rear()); if (v.rpgIt) v.rpgIt.pos.copy(rear().add(v3(Math.cos(v.yaw) * 1.2, 0, -Math.sin(v.yaw) * 1.2))); if (!v.alive) { if (v.samIt) v.samIt.disabled = true; if (v.rpgIt) v.rpgIt.disabled = true; return true; } });
      return v;
    },
    stopLead(key) { const L = S.sq[key]; if (L) { L.leading = false; L.goal = null; } },
    clock(label, text) { if (text == null) { G.timerText = null; hud.timer.hidden = true; return; } G.timerText = text; hud.timer.hidden = false; hud.timer.innerHTML = (label ? `<small>${label}</small>` : '') + text; },
    async white(dur = 1.2) { const f = hud.white; f.style.transition = 'none'; f.style.opacity = 1; void f.offsetWidth; f.style.transition = `opacity ${dur}s`; f.style.opacity = 0; },
    blur(px, dur = 0) { canvas.style.transition = `filter ${dur}s`; canvas.style.filter = px ? `blur(${px}px)` : ''; },
    flashlight(on) { flashlight.intensity = on ? 18 : 0; },
    fail(reason) { failMission(reason); },
    async rebuild(key) { await rebuildWorld(G.mission, key, S); },
    arty(x, z, o = {}) { const t = v3(x, G.groundAt(x, z), z); setGameTimeout(() => new Proj('mortar', t.clone().add(v3(rand(-4, 4), 110, rand(-4, 4))), v3(rand(-2, 2), -50, rand(-2, 2)), { target: t, dmg: o.dmg, noAlly: o.noAlly }), o.delay ?? 0); },
    sq: {},
    music: playMusic, stopMusic,
    env(e) { applyEnv(Object.assign({}, G.env, e)); },
  };
  return S;
}
