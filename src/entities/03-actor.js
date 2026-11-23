/* ---------------- actors ---------------- */
const _v = v3(), _w = v3(), _u = v3(), _sw = v3(), _su = v3(), _md = v3(); const _limpE = new THREE.Euler();
class Actor {
  constructor(team, x, z, o = {}) {
    this.team = team; this.o = o;
    this.pos = v3(x, 0, z); this.pos.y = o.y ?? floorAt(x, z, G.groundAt(x, z) + 0.2);
    this.yaw = o.yaw ?? 0; this.alive = true; this.name = o.name || null; this.hero = !!o.hero;
    this.kind = o.kind || 'rifle';
    this.hp = this.maxHp = o.hp ?? (this.kind === 'heavy' ? 220 : this.kind === 'officer' ? 140 : 100);
    this.speed = o.speed ?? (team === 'enemy' ? 3.3 : 3.7);
    this.state = o.state || (team === 'civ' ? 'flee' : 'idle');
    this.tag = o.tag || ''; this.acc = o.acc ?? 1;
    this.goal = null; this.goTo = o.goTo ? v3(o.goTo[0], 0, o.goTo[1]) : null;
    this.target = null; this.knownPos = null;
    this.fireCd = rand(0.6, 1.8); this.burst = 0; this.repath = rand(1, 3); this.losT = 0; this.sees = false;
    this.lastFire = -9; this.stuck = 0; this.lastPos = this.pos.clone(); this.walk = 0; this.crouch = 0; this.wantCrouch = false;
    this.deadT = 0; this.view = o.view ?? G.env.viewDist ?? 70; this.rush = !!o.rush; this.hold = !!o.hold;
    this.follow = o.follow || null; this.home = this.pos.clone(); this.patrol = o.patrol ? o.patrol.map((p) => v3(p[0], 0, p[1])) : null; this.patI = 0;
    this.invuln = !!o.invuln; this.downT = 0; this.passive = !!o.passive; this.noShoot = !!o.noShoot;
    this.ammo = team === 'enemy'; this.nadeCd = rand(8, 16);
    const style = team === 'enemy' && !o.keepStyle && (!o.style || o.style.startsWith('enemy')) ? foeStyle() : (o.style || (team === 'civ' ? 'rok' : (G.allyStyle || 'rok')));  this.style = style;
    this.m = makeSoldierMesh(style, { civ: team === 'civ' ? (o.color || pick([0x6b3b33, 0x2f4a6b, 0x7a6a50, 0x3d5a45, 0x5a4a6a])) : null, unarmed: team === 'civ' || o.unarmed, heavy: this.kind === 'heavy', armband: team === 'enemy' });
    this.m.root.position.copy(this.pos); this.m.root.rotation.y = this.yaw; G.world.add(this.m.root);
    if (o.crouch) this.wantCrouch = true;
    G.actors.push(this);
  }
  get h() { return lerp(1.78, 1.2, this.crouch); }
  eye(out = v3()) { return out.set(this.pos.x, this.pos.y + this.h - 0.15, this.pos.z); }
  chest(out = v3()) { return out.set(this.pos.x, this.pos.y + this.h * 0.68, this.pos.z); }
  hurt(dmg, src, head = false) {
    if (!this.alive) return;
    if (this.invuln && !this.hero) return;
    this.hp -= dmg;
    this.flinch = 1; this.flinchDir = Math.random() < 0.5 ? -1 : 1;
    if (this.alive && Math.random() < 0.5 && this.team === 'enemy') { this.wantCrouch = true; this.repath = Math.min(this.repath, 0.4); }
    if (this.state !== 'combat' && this.team !== 'civ') { this.state = 'combat'; this.repath = 0; }
    if (src && src.pos) { this.knownPos = src.pos.clone(); if (src.alive !== false) this.target = src; }
    if (this.hp <= 0) {
      if (this.hero || this.invuln) { this.hp = 1; this.downT = 3; this.wantCrouch = true; return; }
      this.die(src, head);
    }
  }
  die(src, head) {
    this.killer = src;
    this.alive = false; this.deadT = 0; this.diedAt = G.time; onActorDeath(this, src); this.fallDir = Math.random() < 0.5 ? -1 : 1; this.deathKind = head ? (Math.random() < 0.6 ? 0 : 2) : randi(0, 3); if (this.m.gun) { this.m.gun.visible = this.deathKind !== 3 || Math.random() < 0.5; }
    this.fall = rand(0.9, 1.3) * (Math.random() < 0.7 ? -1 : 1);
    if (this.team === 'enemy' && src === PT) onEnemyKilledByPlayer(this, head);
    if (this.o.onDeath) this.o.onDeath(this);
  }
  remove() { G.world.remove(this.m.root); const i = G.actors.indexOf(this); if (i >= 0) G.actors.splice(i, 1); }
  visibleTargets() {
    const out = [];
    if (this.team === 'enemy') {
      if (P.alive && !P.ghost) out.push(PT);
      for (const a of G.actors) if (a.alive && a.team === 'ally' && !a.ignored) out.push(a);
      for (const v of G.vehicles) if (v.alive && v.team === 'ally' && !v.air && (v.targetable || this.kind === 'heavy') && v.type !== 'bus') out.push(v); // heavies also open up on our armour
    } else if (this.team === 'ally') {
      for (const a of G.actors) if (a.alive && a.team === 'enemy') out.push(a);
    }
    return out;
  }
  think() {
    // choose target
    const list = this.visibleTargets(); const eye = this.eye(_v);
    let best = null, bd = 1e9;
    for (const t of list) {
      const tp = t.isPlayer ? P.eyePos : (t.isVehicle ? t.pos : t.chest(_u));
      const d = eye.distanceTo(tp);
      let range = this.view; if (t.isPlayer && P.crouch > 0.5 && this.state !== 'combat') range *= 0.6;
      if (G.env.night && t.isPlayer && this.state !== 'combat') range *= 0.55;
      if (d > range) continue;
      // facing cone when not alert
      if (this.state !== 'combat' && d > 8) { const a = Math.atan2(-(tp.x - this.pos.x), -(tp.z - this.pos.z)); if (Math.abs(angDiff(this.yaw, a)) > 1.2) continue; }
      if (!hasLOS(eye, tp)) continue;
      // spread the fire: only some soldiers go looking for the player, the rest take whoever is nearest (allies, our vehicles)
      if (this.prefP === undefined) this.prefP = this.team === 'enemy' && Math.random() < 0.35;
      const w = t.isPlayer ? d * (this.prefP ? 0.85 : 1.35) : t.isVehicle ? d * 1.1 : d; if (w < bd) { bd = w; best = t; }
    }
    const now = G.time, tdt = Math.min(0.6, now - (this.lastThink ?? now)); this.lastThink = now;
    // stealth missions: the player is noticed gradually (suspicion meter) instead of instantly
    if (G.stealth && this.team === 'enemy' && this.state !== 'combat') {
      if (best && best.isPlayer) {
        const d = eye.distanceTo(P.eyePos); let rate = clamp(1.6 - d / (this.view * 0.9), 0.15, 1.6) * (P.crouch > 0.5 ? 0.45 : 1) * (P.speed > 3 ? 1.6 : P.speed > 0.5 ? 1 : 0.6) * (d < 5 ? 3 : 1);
        this.sus = Math.min(1, (this.sus || 0) + rate * tdt * 0.9); this.susPos = P.pos.clone();
        if (this.sus >= 1) { this.sus = 1; this.target = PT; this.knownPos = P.pos.clone(); this.state = 'combat'; this.repath = 0; this.sees = true; alertNear(this, 22); if (this.o.onAlert) this.o.onAlert(this); }
        else { this.sees = false; this.goal = null; this.investigate = this.sus > 0.45 ? this.susPos : null; }
        return;
      }
      this.sus = Math.max(0, (this.sus || 0) - tdt * 0.25); if (this.sus < 0.2) this.investigate = null; this.sees = false;
      if (best) { this.target = best; this.knownPos = best.pos.clone(); this.state = 'combat'; this.repath = 0; this.sees = true; alertNear(this, 22); if (this.o.onAlert) this.o.onAlert(this); }
      return;
    }
    this.sees = !!best;
    if (best) { this.target = best; this.knownPos = (best.isPlayer ? P.pos : best.pos).clone(); if (this.state !== 'combat') { this.state = 'combat'; this.repath = 0; if (this.team === 'enemy') { if (G.stealth) alertNear(this, 22); if (this.o.onAlert) this.o.onAlert(this); } } }
  }
  pickGoal() {
    const tgt = this.knownPos; if (!tgt) return;
    const dT = this.pos.distanceTo(tgt);
    if (this.rush) { this.goal = tgt.clone().add(v3(rand(-3, 3), 0, rand(-3, 3))); this.wantCrouch = false; return; }
    const pref = this.kind === 'heavy' ? 22 : this.team === 'ally' ? 18 : rand(14, 30);
    let best = null, bs = -1e9;
    for (const c of G.covers) {
      const dd = c.distanceTo(this.pos); if (dd > 22 || dd < 1) continue;
      const dt2 = c.distanceTo(tgt); if (dt2 < 6) continue;
      let taken = false; for (const a of G.actors) if (a !== this && a.alive && a.goal && a.goal.distanceToSquared(c) < 1.5) { taken = true; break; }
      if (taken) continue;
      const s = -Math.abs(dt2 - pref) - dd * 0.6 + rand(0, 6); if (s > bs) { bs = s; best = c; }
    }
    if (best && Math.random() < 0.85) { this.goal = best.clone().add(v3(rand(-0.4, 0.4), 0, rand(-0.4, 0.4))); this.wantCrouch = Math.random() < 0.7; }
    else {
      _w.subVectors(this.pos, tgt).setY(0).normalize(); const side = v3(-_w.z, 0, _w.x).multiplyScalar(rand(-8, 8));
      this.goal = tgt.clone().addScaledVector(_w, clamp(dT, pref * 0.7, pref)).add(side); this.wantCrouch = Math.random() < 0.4;
    }
  }
  update(dt) {
    const m = this.m;
    if (!this.alive) {
      this.deadT += dt;
      const v = this.deathKind ?? 0;
      if (v === 2) { // crumple: knees buckle first, then topple sideways
        const k1 = clamp(this.deadT / 0.35, 0, 1), k2 = clamp((this.deadT - 0.3) / 0.5, 0, 1);
        poseSoldier(m, { moving: false, crouch: k1, aim: 0, skipIK: true }, dt);
        m.root.rotation.z = smooth(k2) * 1.45 * this.fallDir; m.root.rotation.x = smooth(k2) * 0.3; m.root.position.y = this.pos.y - smooth(k2) * 0.25;
      } else if (v === 3) { // spin and drop
        const k = clamp(this.deadT / 0.7, 0, 1); m.root.rotation.y = this.yaw + smooth(k) * 2.2 * this.fallDir; m.root.rotation.x = smooth(clamp((this.deadT - 0.2) / 0.5, 0, 1)) * this.fall * 1.5;
        poseSoldier(m, { moving: false, crouch: 0, aim: 0, skipIK: true }, dt);
      } else { // straight back / forward, arms flung
        const k = clamp(this.deadT / (this.blast ? 0.45 : 0.6), 0, 1);
        m.root.rotation.x = smooth(k) * this.fall * 1.5; m.root.position.y = this.pos.y - smooth(k) * 0.08;
        if (this.blast) { const kk = clamp(this.deadT / 0.45, 0, 1); m.root.position.x = this.pos.x + this.blast.x * Math.sin(kk * Math.PI * 0.5) * 2.2; m.root.position.z = this.pos.z + this.blast.z * Math.sin(kk * Math.PI * 0.5) * 2.2; m.root.position.y = this.pos.y + Math.sin(kk * Math.PI) * 0.9 - smooth(kk) * 0.08; }
        poseSoldier(m, { moving: false, crouch: 0, aim: 0, skipIK: true }, dt);
        m.armR.rotation.set(0, 0, 0); m.armR.quaternion.slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(2.4 * Math.sign(-this.fall), 0, 0.6)), Math.min(1, dt * 6));
        m.armL.quaternion.slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(2.2 * Math.sign(-this.fall), 0, -0.6)), Math.min(1, dt * 6));
      }
      if (this.deadT > 40 && this.team !== 'ally') this.remove();
      if (this.ammo && P.alive && this.deadT > 0.5 && this.pos.distanceToSquared(P.pos) < 2.6) { this.ammo = false; giveAmmoPickup(); }
      return;
    }
    if (this.downT > 0) { this.downT -= dt; if (this.downT <= 0) { this.hp = this.maxHp; } }
    this.supp = Math.max(0, (this.supp || 0) - dt * 0.5); if (this.supp > 0.8 && this.team === 'enemy' && !this.rush) this.wantCrouch = true;
    // perception
    this.losT -= dt; if (this.losT <= 0 && this.team !== 'civ' && !this.passive) { this.losT = rand(0.2, 0.4); this.think(); }
    let moveDir = null, speed = this.speed, faceYaw = null;
    if (this.leading) {
      const lt = this.trail[this.trail.length - 1]; if (lt.distanceToSquared(this.pos) > 0.5) { this.trail.push(this.pos.clone()); if (this.trail.length > 300) this.trail.shift(); }
      if (this.pausedForPlayer) { faceYaw = Math.atan2(-(P.pos.x - this.pos.x), -(P.pos.z - this.pos.z)); }
      else if (this.goal && Math.hypot(this.goal.x - this.pos.x, this.goal.z - this.pos.z) > 0.9) { moveDir = _md.set(this.goal.x - this.pos.x, 0, this.goal.z - this.pos.z).normalize(); speed = this.leadSpeed || 3.4; }
      // shoot while moving / waiting if an enemy is visible
      this.fireCd -= dt;
      if (this.sees && this.target && this.target.alive !== false && this.fireCd <= 0 && !this.noShoot) { if (this.burst <= 0) this.burst = randi(2, 4); this.shoot(this.target); this.burst--; this.fireCd = this.burst > 0 ? 0.13 : rand(0.9, 1.8); }
      if (this.sees && this.target && !moveDir) { const tp = this.target.isPlayer ? P.pos : this.target.pos; faceYaw = Math.atan2(-(tp.x - this.pos.x), -(tp.z - this.pos.z)); }
    } else if (this.team === 'ally' && (this.route || this.goTo || (this.follow && this.follow.leader))) {
      // scripted movement wins over picking cover: walk the given route (or the leader's trail), shoot what is seen, stop and crouch at the stops
      let gx = null, gz = null, run = false;
      if (this.route) {
        const r = this.route, w = r.pts[r.i];
        if (!w) { this.route = null; this.home = this.pos.clone(); this.goal = null; if (r.done) r.done(); }
        else if (r.waitT > 0) { // holding at a stop: crouched behind the cover, up to shoot when there is something to shoot
          r.waitT -= dt; this.wantCrouch = w.crouch !== false && !(this.sees && this.target);
          if (r.waitT <= 0) { if (!w.until || w.until()) { r.i++; r.waitT = 0; } else r.waitT = 0.25; }
        } else {
          const d = Math.hypot(w.x - this.pos.x, w.z - this.pos.z);
          if (r.bi !== r.i) { r.bi = r.i; r.bd = d; r.bt = G.time; }
          if (d < r.bd - 0.3) { r.bd = d; r.bt = G.time; }
          if (d < 0.9 || (G.time - r.bt > 3 && d < 4)) { if (w.wait || w.until) r.waitT = w.wait || 0.25; else r.i++; }
          else { if (G.time - r.bt > 6) this.pos.lerp(v3(w.x, this.pos.y, w.z), 0.04); gx = w.x; gz = w.z; run = !!w.run; this.wantCrouch = false; }
        }
      } else if (this.goTo) {
        if (this.pos.distanceTo(this.goTo) < 1.5) { this.goTo = null; this.home = this.pos.clone(); }
        else { gx = this.goTo.x; gz = this.goTo.z; run = true; }
      } else {
        const f = this.follow, Lr = f.leader; const T = Lr.trail || [Lr.pos]; let acc = 0, prev = Lr.pos, tp = T[0], ti = 0;
        for (let i = T.length - 1; i >= 0; i--) { acc += prev.distanceTo(T[i]); prev = T[i]; if (acc >= (f.back || 3)) { tp = T[i]; ti = i; break; } }
        const nx = T[Math.min(ti + 1, T.length - 1)], tx = (nx.x - tp.x) || -Math.sin(Lr.yaw), tz = (nx.z - tp.z) || -Math.cos(Lr.yaw), tl = Math.hypot(tx, tz) || 1;
        const sd = f.side || 0; const fx = tp.x - (tz / tl) * sd, fz = tp.z + (tx / tl) * sd;
        if (Math.hypot(fx - this.pos.x, fz - this.pos.z) > 1.2) { gx = fx; gz = fz; run = Lr.leadSpeed > 4.5 || Math.hypot(fx - this.pos.x, fz - this.pos.z) > 6; }
        else this.wantCrouch = !!Lr.wantCrouch || (!(this.sees && this.target) && !Lr.goal);
      }
      if (gx !== null) { moveDir = _md.set(gx - this.pos.x, 0, gz - this.pos.z).normalize(); speed = run ? Math.max(this.speed, 5.2) : this.speed; if (this.follow && this.follow.leader && this.follow.leader.leading) { const gd = Math.hypot(gx - this.pos.x, gz - this.pos.z); speed = Math.max(speed, Math.min(7.8, (this.follow.leader.leadSpeed || 0) + (gd > 3 ? 0.6 : 0))); } }
      this.fireCd -= dt;
      if (!this.noShoot && this.sees && this.target && this.target.alive !== false && this.fireCd <= 0 && this.downT <= 0) { if (this.burst <= 0) this.burst = this.kind === 'heavy' ? randi(5, 9) : randi(2, 4); this.shoot(this.target); this.burst--; this.fireCd = this.burst > 0 ? (this.kind === 'heavy' ? 0.09 : 0.13) : rand(0.9, 1.9); }
      if (this.sees && this.target && (!moveDir || !run)) { const tp = this.target.isPlayer ? P.pos : this.target.pos; faceYaw = Math.atan2(-(tp.x - this.pos.x), -(tp.z - this.pos.z)); }
    } else
    if (this.team === 'civ') {
      if (this.waitT > 0) { this.waitT -= dt; this.wantCrouch = false; this.jig = (this.jig || 0) - dt; if (this.jig <= 0) { this.jig = rand(0.3, 0.9); this.jigDir = Math.random() < 0.55 ? v3(rand(-1, 1), 0, rand(-1, 1)).normalize() : null; this.lookYaw = rand(-Math.PI, Math.PI); }
        if (this.jigDir) { moveDir = _md.copy(this.jigDir); speed = 0.9; } faceYaw = this.lookYaw; }
      else if (this.goTo) { if (this.pos.distanceTo(this.goTo) < 1.3 || this.forceArrive) { this.forceArrive = false;
          if (this.o.then) { this.goTo = v3(this.o.then[0], 0, this.o.then[1]); this.o.then = null; this.waitT = this.o.wait ?? 0; }
          else if (this.o.vanish === 'hidden') { const d = this.pos.distanceTo(camera.position), dir = _md.subVectors(this.pos, camera.position).normalize(), fw = camera.getWorldDirection(v3()); if (d > 150 || (d > 30 && dir.dot(fw) < 0.15)) { this.remove(); return; } this.wantCrouch = true; }
          else if (this.o.vanish) { if (this.o.onRemove) this.o.onRemove(); this.remove(); return; } else this.goTo = null; }
        else { moveDir = _md.subVectors(this.goTo, this.pos).setY(0).normalize(); speed = this.o.speed || 4.2; } }
    } else if (this.state === 'combat' && !this.passive) {
      this.repath -= dt;
      if (this.repath <= 0) { this.repath = this.rush ? 1 : rand(4, 9); if (!this.hold) this.pickGoal(); }
      if (this.goal && this.pos.distanceTo(this.goal) > 0.8) { moveDir = _md.subVectors(this.goal, this.pos).setY(0).normalize(); }
      if (this.target && (this.target.alive === false)) { this.target = null; this.repath = 0; }
      if (this.target && this.sees) { const tp = this.target.isPlayer ? P.pos : this.target.pos; faceYaw = Math.atan2(-(tp.x - this.pos.x), -(tp.z - this.pos.z)); }
      // fire
      this.fireCd -= dt;
      if (!this.noShoot && this.sees && this.target && this.fireCd <= 0 && this.downT <= 0) {
        if (this.burst <= 0) this.burst = this.kind === 'heavy' ? randi(6, 12) : randi(2, 5);
        this.shoot(this.target); this.burst--;
        this.fireCd = this.burst > 0 ? (this.kind === 'heavy' ? 0.09 : 0.13) : rand(0.8, 2.0) * (this.team === 'ally' ? 1.1 : 1) * (1 + (this.supp || 0) * 1.2);
      }
      // grenade
      if (this.team === 'enemy' && !this.sees && this.knownPos && G.enemyNades !== false) {
        this.nadeCd -= dt;
        if (this.nadeCd <= 0) { this.nadeCd = rand(14, 26); const d = this.pos.distanceTo(P.pos); if (d < 26 && d > 7 && Math.random() < 0.55) this.throwNade(P.pos); }
      }
      if (moveDir) speed = this.speed * (this.rush ? 1.15 : 1);
    } else if (this.investigate && this.team === 'enemy') {
      const ip = this.investigate; faceYaw = Math.atan2(-(ip.x - this.pos.x), -(ip.z - this.pos.z));
      if (this.sus > 0.7 && this.pos.distanceTo(ip) > 3) { moveDir = _md.subVectors(ip, this.pos).setY(0).normalize(); speed = 1.6; }
    } else if (this.goTo) {
      // advancing toward an area
      if (this.pos.distanceTo(this.goTo) < 3) { this.goTo = null; if (this.o.alertOnArrive !== false) { this.state = 'combat'; this.knownPos = P.pos.clone(); this.repath = 0; } }
      else { moveDir = _md.subVectors(this.goTo, this.pos).setY(0).normalize(); speed = this.speed; }
    } else if (this.follow) {
      const f = this.follow; const off = f.offset || [2, 3];
      let gx, gz;
      if (f.leader) { // formation slot along the leader's own path: never cut corners, never bunch up
        const Lr = f.leader; const T = Lr.trail || [Lr.pos]; let acc = 0, prev = Lr.pos, tp = T[0], ti = 0; for (let i = T.length - 1; i >= 0; i--) { acc += prev.distanceTo(T[i]); prev = T[i]; if (acc >= (f.back || 3)) { tp = T[i]; ti = i; break; } }
        const nx = T[Math.min(ti + 1, T.length - 1)], tx = (nx.x - tp.x) || -Math.sin(Lr.yaw), tz = (nx.z - tp.z) || -Math.cos(Lr.yaw), tl = Math.hypot(tx, tz) || 1;
        const sd = f.side || 0; gx = tp.x - (tz / tl) * sd; gz = tp.z + (tx / tl) * sd;
        if (!probeFree(_u.set(tp.x, this.pos.y, tp.z), gx - tp.x, gz - tp.z, Math.abs(sd) + 0.3, this.pos.y)) { gx = tp.x; gz = tp.z; } }
      else { const tp = trailPoint(f.trail ?? Math.hypot(off[0], off[1]) + 1); const side = off[0] > 0 ? 0.9 : -0.9; gx = tp.x + Math.cos(P.yaw) * side; gz = tp.z - Math.sin(P.yaw) * side; }
      _u.set(gx, 0, gz); const d = Math.hypot(gx - this.pos.x, gz - this.pos.z);
      if (d > 1.2) { moveDir = _md.set(gx - this.pos.x, 0, gz - this.pos.z).normalize(); speed = d > 4 ? 5.6 : d > 2 ? 4.4 : 3; }
      // never left far behind: catch up out of sight
      if (d > 24 && this.hero && hiddenFromView(this.pos) && hiddenFromView(v3(gx, this.pos.y, gz))) { this.pos.set(gx, floorAt(gx, gz, G.groundAt(gx, gz) + 0.3), gz); this.lastPos.copy(this.pos); }
    } else if (this.patrol) {
      const p = this.patrol[this.patI]; if (this.pos.distanceTo(p) < 1) this.patI = (this.patI + 1) % this.patrol.length;
      moveDir = _md.subVectors(p, this.pos).setY(0).normalize(); speed = 1.5;
    } else if (this.goal) {
      if (this.pos.distanceTo(this.goal) > 0.8) moveDir = _md.subVectors(this.goal, this.pos).setY(0).normalize(); else this.goal = null;
    }
    // ally in combat but enemies all dead: reset
    if (this.state === 'combat' && this.team === 'ally' && (!this.target || !this.target.alive) && !this.sees) { this.idleT = (this.idleT || 0) + dt; if (this.idleT > 3) { this.state = 'idle'; this.idleT = 0; if (this.follow) this.goal = null; } } else this.idleT = 0;
    // movement
    let moving = false;
    if (moveDir) {
      const before = _u.copy(this.pos);
      const sp = speed * (this.crouch > 0.5 ? 0.6 : 1);
      // steering: if the straight line ahead is blocked, look for the nearest free heading
      this.steerT = (this.steerT || 0) - dt;
      if (this.steerT <= 0) { this.steerT = 0.25; this.steer = null;
        if (!probeFree(this.pos, moveDir.x, moveDir.z, 2.2, this.pos.y)) { const base = Math.atan2(moveDir.x, moveDir.z); const side = this.steerSide || (Math.random() < 0.5 ? 1 : -1);
          for (const a of [0.5, -0.5, 1.0, -1.0, 1.5, -1.5, 2.1, -2.1]) { const ang = base + a * side; const sx = Math.sin(ang), sz = Math.cos(ang); if (probeFree(this.pos, sx, sz, 2.2, this.pos.y)) { this.steer = v3(sx, 0, sz); this.steerSide = Math.sign(a * side) || 1; break; } } } }
      if (this.steer) moveDir = _md.copy(this.steer);
      /* momentum: the body carries its speed and swings round a turn in an arc, slowing for a sharp one, instead of snapping to a new heading */
      { const vx = this.mvx || 0, vz = this.mvz || 0, cv = Math.hypot(vx, vz); let tsp = sp;
        if (cv > 0.6) { const cosA = (vx * moveDir.x + vz * moveDir.z) / cv; tsp = sp * clamp(0.45 + 0.55 * cosA, 0.3, 1); }
        const k = Math.min(1, dt * (tsp > cv ? 5.5 : 8)); this.mvx = vx + (moveDir.x * tsp - vx) * k; this.mvz = vz + (moveDir.z * tsp - vz) * k; }
      moveCircle(this.pos, this.mvx * dt, this.mvz * dt, 0.32, this.pos.y, 1.7, 0.12);
      moving = true;
      const moved = this.pos.distanceTo(this.lastPos);
      this.stuck += dt; if (this.stuck > 1) { if (moved < 0.35) { if (this.leading && this.routeGoal) { const d = _w.subVectors(this.routeGoal, this.pos).setY(0).normalize(); this.detSide = -(this.detSide || 1); this.goal = this.pos.clone().add(v3(-d.z * this.detSide * 3 + d.x * 1.2, 0, d.x * this.detSide * 3 + d.z * 1.2)); } else { const a = rand(0, TAU); this.goal = this.pos.clone().add(v3(Math.cos(a) * 4, 0, Math.sin(a) * 4)); } if (this.goTo && this.team === 'civ') { if (this.pos.distanceTo(this.goTo) < 6.5) this.forceArrive = true; } else if (this.goTo && Math.random() < 0.3) this.goTo = null; } this.stuck = 0; this.lastPos.copy(this.pos); }
      if (faceYaw === null) faceYaw = Math.hypot(this.mvx, this.mvz) > 0.4 ? Math.atan2(-this.mvx, -this.mvz) : Math.atan2(-moveDir.x, -moveDir.z);
      this.wantCrouchNow = false;
    }
    if (!moveDir) { /* coming to a stop: a step or two to bleed off the speed, not a dead halt */
      const cv = Math.hypot(this.mvx || 0, this.mvz || 0);
      if (cv > 0.15) { const k = Math.max(0, 1 - dt * 7); this.mvx *= k; this.mvz *= k; moveCircle(this.pos, this.mvx * dt, this.mvz * dt, 0.32, this.pos.y, 1.7, 0.06); moving = cv > 0.9; if (moving) speed = cv; }
      else { this.mvx = this.mvz = 0; moveCircle(this.pos, 0, 0, 0.32, this.pos.y, 1.7, 0.06); } }
    { const fy = floorAt(this.pos.x, this.pos.z, this.pos.y + 0.5); const dy = fy - this.pos.y; this.pos.y = Math.abs(dy) > 3 ? fy : damp(this.pos.y, fy, dy > 0 ? 16 : 10, dt); }
    if (faceYaw === null && !moveDir && this.faceYaw != null && this.state !== 'combat') faceYaw = this.faceYaw;
    if (faceYaw !== null) { const dd = angDiff(this.yaw, faceYaw) * Math.min(1, dt * 8), cap = (moving ? 4.2 : 6.5) * dt; this.yaw += clamp(dd, -cap, cap); } /* a turn takes a moment, never a snap */
    const cr = (!moving && (this.wantCrouch || this.downT > 0)) ? 1 : 0;
    this.crouch = damp(this.crouch, cr, 8, dt);
    // animate
    if (moving) this.walk += dt * speed * 2.0;
    this.flinch = Math.max(0, (this.flinch || 0) - dt * 4);
    if (this.recoilT > 0) this.recoilT -= dt;
    let pitch = 0; if (this.target && this.sees) { const tp = this.target.isPlayer ? P.eyePos : this.target.isVehicle ? this.target.pos : this.target.chest(_u); const ey = this.pos.y + 1.45; pitch = Math.atan2(tp.y - ey, Math.hypot(tp.x - this.pos.x, tp.z - this.pos.z)); }
    const near = this.pos.distanceToSquared(camera.position) < 90 * 90;
    poseSoldier(m, { moving, speed: moving ? speed : 0, crouch: this.crouch, aim: (this.state === 'combat' && this.sees && !moving) || this.aimHold ? 1 : (this.state === 'combat' ? 0.35 : 0), walk: this.walk, pitch, sprint: moving && speed > 4.6 && this.state !== 'combat', flinch: this.flinch * (this.flinchDir || 1), recoil: this.recoilT > 0 ? 1 : 0, skipIK: !near }, dt);
    if (this.crutch) { m.armL.quaternion.setFromEuler(_limpE.set(0.08, 0, -0.22)); m.elL.quaternion.setFromEuler(_limpE.set(-0.15, 0, 0)); this.crutch.rotation.x = moving ? Math.sin(this.walk) * 0.32 : 0; m.legR.rotation.x *= 0.35; m.kneeR.rotation.x *= 0.4; m.hips.rotation.z = moving ? Math.max(0, Math.sin(this.walk)) * 0.07 : 0.03; }
    m.root.position.copy(this.pos); m.root.rotation.y = this.yaw;
  }
  throwNade(tp) {
    const from = this.eye(v3()); const to = tp.clone().add(v3(rand(-2.5, 2.5), 0, rand(-2.5, 2.5)));
    const d = Math.hypot(to.x - from.x, to.z - from.z); const tt = clamp(d / 14, 0.6, 1.8);
    const vel = v3((to.x - from.x) / tt, (to.y - from.y) / tt + 0.5 * 9.8 * tt, (to.z - from.z) / tt);
    new Proj('grenade', from, vel, { owner: this, team: this.team });
    if (this.team === 'enemy' && to.distanceTo(P.pos) < 14) { const hero = G.actors.find((x) => x.alive && x.hero && x.team === 'ally' && x.name); const who = hero ? hero.name : G.ridersName; if (who) subtitle(who, '수류탄!', 1.6); }
  }
  shoot(t) {
    const m = this.m; m.muzzle.getWorldPosition(_sw);
    const tp = t.isPlayer ? (Math.random() < 0.2 ? P.eyePos.clone() : P.chestPos.clone()) : t.isVehicle ? t.pos.clone().setY(t.pos.y + 1) : t.chest(v3());
    const dist = _sw.distanceTo(tp);
    let spread = (this.team === 'enemy' ? 0.05 / DIFF[SET.diff].acc : 0.045) / this.acc * (this.kind === 'heavy' ? 1.35 : 1);
    if (t.isPlayer) { spread *= 1 + Math.min(P.speed / 4.4, 1.5) * 0.55; spread /= (G.hitMul ?? 1); }
    spread *= 1 + (this.supp || 0) * 0.8; spread += Math.min(0.02, dist * 0.00015);
    const dir = _su.subVectors(tp, _sw).normalize();
    const gx = (Math.random() + Math.random() + Math.random() - 1.5) * spread, gy = (Math.random() + Math.random() + Math.random() - 1.5) * spread;
    const right = v3(-dir.z, 0, dir.x).normalize(), up = v3().crossVectors(right, dir);
    dir.addScaledVector(right, gx).addScaledVector(up, gy).normalize();
    const R = rayWorld(_sw, dir, 320); let best = R.t, hitWho = null, hitHead = false;
    // the player
    if (this.team === 'enemy' && P.alive && !P.ghost) {
      const hh = lerp(1.8, 1.2, P.crouch);
      let t1 = raySphere(_sw.x, _sw.y, _sw.z, dir.x, dir.y, dir.z, P.pos.x, P.pos.y + hh - 0.12, P.pos.z, 0.17);
      if (t1 >= 0 && t1 < best) { best = t1; hitWho = PT; hitHead = true; }
      t1 = rayAABB(_sw.x, _sw.y, _sw.z, dir.x, dir.y, dir.z, { min: { x: P.pos.x - 0.28, y: P.pos.y, z: P.pos.z - 0.28 }, max: { x: P.pos.x + 0.28, y: P.pos.y + hh - 0.3, z: P.pos.z + 0.28 } }, best);
      if (t1 >= 0 && t1 < best) { best = t1; hitWho = PT; hitHead = false; }
    }
    // soldiers of the opposing side
    for (const a of G.actors) {
      if (!a.alive || a === this || a.team === this.team || a.team === 'civ') continue;
      if (Math.abs(a.pos.x - _sw.x) > best + 1 && Math.abs(a.pos.z - _sw.z) > best + 1) continue;
      const bh = a.h - 0.3;
      const t1 = rayAABB(_sw.x, _sw.y, _sw.z, dir.x, dir.y, dir.z, { min: { x: a.pos.x - 0.27, y: a.pos.y, z: a.pos.z - 0.27 }, max: { x: a.pos.x + 0.27, y: a.pos.y + bh + 0.3, z: a.pos.z + 0.27 } }, best);
      if (t1 >= 0 && t1 < best) { best = t1; hitWho = a; }
    }
    const stop = _sw.clone().addScaledVector(dir, Math.min(best, 320));
    if (hitWho === PT) damagePlayer((this.kind === 'heavy' ? 11 : 9) * (hitHead ? 1.6 : 1) * DIFF[SET.diff].dmg, this.pos);
    else if (hitWho) { hitWho.hurt(this.team === 'ally' ? (this.hero ? 30 : 22) : 26, this); FX.blood(stop); if (hitWho.alive === false && Math.random() < 0.5) FX.blood(stop); }
    else if (R.c) { FX.dust(stop, 3, G.env.snow ? [0.85, 0.87, 0.9] : [0.5, 0.47, 0.42], 0.12); if (R.c !== 'ground') FX.sparks(stop, 1); }
    // near misses on the player: crack, whiz and suppression
    if (this.team === 'enemy' && hitWho !== PT && P.alive) {
      const toP = v3().subVectors(P.eyePos, _sw); const along = toP.dot(dir);
      if (along > 0 && along < best + 2) { const miss = toP.addScaledVector(dir, -along).length(); if (miss < 2.6) { G.supp = Math.min(1.2, (G.supp || 0) + (2.6 - miss) * 0.08); const sp = spatial(_sw.clone().addScaledVector(dir, along)); if (miss < 1.4) SFX.crack(sp.pan); else if (Math.random() < 0.6) SFX.whiz(sp.pan); } }
    }
    tracer(_sw, stop, this.team === 'enemy' ? [1, 0.55, 0.35] : [1, 0.85, 0.5]);
    FX.muzzle(_sw, dir, 0.9); if (Math.random() < (G.env.night || G.env.snow > 1 ? 0.6 : 0.25)) flashLight(_sw, 0xffa040, G.env.snow > 1 ? 8 : 4, G.env.snow > 1 ? 14 : 8, 0.06);
    if (G.env.snow > 1 || G.env.night) particle({ add: true, x: _sw.x, y: _sw.y, z: _sw.z, life: 0.06, size: 0.9, color: [1, 0.7, 0.35] });
    SFX.shot(this.kind === 'heavy' ? 'mg' : this.team === 'enemy' ? 'enemy' : 'rifle', _sw.clone());
    this.lastFire = G.time; this.recoilT = 0.06;
  }
}
/* player pseudo-target */
const PT = { isPlayer: true, get pos() { return P.pos; }, get alive() { return P.alive; } };
