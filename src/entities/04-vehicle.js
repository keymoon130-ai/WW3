/* ---------------- vehicles ---------------- */
function makeDroneMesh() {
  const m = mat('drone', { color: 0x5a5f63, rough: 0.6 });
  const root = new THREE.Group(); part(root, 0.5, 0.4, 3.2, m, 0, 0, 0);
  const wing = new THREE.Mesh(new THREE.BufferGeometry(), m);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -1.2, -2.4, 0, 1.4, 2.4, 0, 1.4], 3)); g.computeVertexNormals();
  const w = new THREE.Mesh(g, mat('droneW', { color: 0x5a5f63, side: THREE.DoubleSide })); root.add(w);
  const light = new THREE.Mesh(bg(0.12, 0.12, 0.12), basicMat('dronelight', 0xff3020)); light.position.set(0, -0.25, 1.4); root.add(light);
  return { root };
}

class Vehicle {
  constructor(type, x, z, o = {}) {
    this.type = type; this.o = o; this.isVehicle = true; this.team = o.team || 'enemy';
    this.pos = v3(x, o.y ?? 0, z); this.yaw = o.yaw ?? 0; this.alive = true;
    this.hp = this.maxHp = o.hp ?? { acv: 400, tank: 600, apc: 320, truck: 180, heli: 600, aheli: 500, drone: 30, bmp: 380, car: 1e9, bus: 1e9, jeep: 150 }[type] ?? 300;
    this.path = o.path ? o.path.map((p) => (p.length === 3 ? v3(p[0], p[1], p[2]) : v3(p[0], 0, p[1]))) : null; this.pi = 0;
    this.speed = o.speed ?? (type === 'heli' || type === 'aheli' ? 22 : type === 'drone' ? 34 : 5);
    this.fireCd = rand(2, 4); this.mgCd = rand(1, 3); this.burst = 0; this.armed = o.armed ?? (this.team === 'enemy'); this.targetable = o.targetable ?? false;
    this.invuln = !!o.invuln; this.vel = v3();
    let mesh;
    if (type === 'tank' && o.k2) { mesh = makeK2Mesh(); this.size = [1.8, 1.25, 3.75]; }
    else if (type === 'tank') { mesh = makeTankMesh(o.color ?? (this.team === 'enemy' ? 0x6a6e66 : 0x4f5539), false, { command: o.command, style: this.team === 'ally' ? 'ally' : undefined }); this.size = [1.9, 1.4, 3.5]; }
    else if (type === 'apc') { mesh = makeTankMesh(o.color ?? (this.team === 'enemy' ? 0x6d716a : 0x4f5539), true); this.size = [1.5, 1.4, 3.3]; }
    else if (type === 'bmp') { mesh = this.team === 'ally' ? (o.k808 ? makeK808Mesh(undefined, !!o.real) : makeK21Mesh()) : makeBMPMesh(o.color ?? 0x6a6e5c); this.size = o.k808 ? (o.real ? [1.45, 1.1, 3.7] : [1.45, 1.4, 3.55]) : [1.6, 1.25, 3.45]; }
    else if (type === 'acv') { mesh = o.acvMesh || makeACV(o.color ?? 0x5b6150, o.num || ''); this.size = [1.55 / VSCALE, 1.3 / VSCALE, 4.6 / VSCALE]; }
    else if (type === 'truck') { mesh = makeTruckMesh(o.color ?? (this.team === 'enemy' ? 0x5c6156 : 0x4d5340)); this.size = [1.25, 1.5, 3.2]; }
    else if (type === 'heli' || type === 'aheli') { mesh = makeHeliMesh(o.color ?? (this.team === 'enemy' ? 0x50555a : 0x3e4336), type === 'aheli', !!o.openDoor); this.size = [1.4, 1.2, 4]; this.air = true; }
    else if (type === 'drone') { mesh = makeDroneMesh(); this.size = [1.2, 0.4, 1.5]; this.air = true; }
    else if (type === 'bus') { mesh = makeBusMesh(o.color ?? 0x2f6a46); this.size = [1.3, 1.6, 5.5]; }
    else mesh = { root: o.mesh || new THREE.Group() };
    // real-size meshes keep their sizes; o.scale resizes a VSCALE mesh to a given scale (real scale ≈ 1.05)
    if (o.scale && mesh.root) { mesh.root.scale.setScalar(o.scale); if (this.size) this.size = this.size.map((v) => v * o.scale); }
    else if (!this.air && this.size && type !== 'drone' && !o.k2 && !o.real) this.size = this.size.map((v) => v * VSCALE);
    if (this.team === 'enemy' && type !== 'drone' && type !== 'car' && type !== 'bus' && !o.noMark) { // national markings on both flanks
      const ru = foeStyle() === 'enemy2'; const sc = mesh.root.scale.x || 1; const bb = new THREE.Box3(), tb = new THREE.Box3(); mesh.root.updateMatrixWorld(true);
      mesh.root.traverse((c) => { if (!c.isMesh) return; tb.setFromObject(c); const sx = tb.max.x - tb.min.x, sz = tb.max.z - tb.min.z; if (sx < 0.35 && sz < 0.35) return; bb.union(tb); }); // ignore antennas and other thin bits
      const H = (bb.max.y - bb.min.y) / sc, lowX = []; mesh.root.traverse((c) => { if (!c.isMesh) return; tb.setFromObject(c); if ((tb.min.y + tb.max.y) / 2 < bb.min.y + (bb.max.y - bb.min.y) * 0.5) lowX.push(Math.max(Math.abs(tb.max.x), Math.abs(tb.min.x))); });
      const hx = (this.air && lowX.length ? Math.max(...lowX) : Math.max(Math.abs(bb.max.x), Math.abs(bb.min.x))) / sc + 0.04, y = bb.min.y / sc + H * (this.air ? 0.5 : 0.36), s0 = Math.min(0.85, H * 0.24);
      for (const sx of [-1, 1]) { const d = new THREE.Mesh(INSIG.plane, ru ? INSIG.ru() : INSIG.star()); d.position.set(sx * (this.air ? hx * 1.02 : hx), y, this.air ? 0.4 : 0.6); d.rotation.y = sx * Math.PI / 2; d.scale.set(ru ? s0 * 1.05 : s0, ru ? s0 * 0.7 : s0, 1); mesh.root.add(d); } }
    this.m = mesh; mesh.root.position.copy(this.pos); mesh.root.rotation.y = this.yaw; G.world.add(mesh.root);
    mesh.root.traverse((c) => { if (c.isMesh) c.castShadow = true; });
    if (!this.air && o.collide !== false) this.col = addCollider(0, 0, 0, 0, 0, 0, { dyn: true, ref: this });
    if (!this.air) this.pos.y = o.y ?? G.groundAt(x, z);
    this.syncCol();
    if (type === 'tank' || type === 'apc' || type === 'bmp' || type === 'acv' || type === 'truck' || type === 'bus') this.snd = makeLoop('engine');
    if (this.air && type !== 'drone') this.snd = makeLoop('rotor');
    if (type === 'drone') this.snd = makeLoop('engine');
    G.vehicles.push(this);
  }
  /* two ground vehicles can never share space: sample this hull at nose, middle and tail; any sample inside another hull pushes the
     two apart along the shallower axis; smashable props in the way are knocked aside */
  /* two waypoints beside an obstacle: level with its rear, then past its front. At speed the first is put far enough ahead for an
     easy lane change; the old waypoints the detour carries us past are dropped, or we would turn back for them and circle */
  planDetour(blk, bf, bl, fx, fz, early) {
    const off = this.size[0] + blk.eL + 1.8 + Math.min(4, this.detours - 1), f1 = early ? -(blk.eF + this.size[2] * 0.4) : Math.max(-(blk.eF + this.size[2] * 0.6), -bf + 4), f2 = blk.eF + this.size[2] + (early ? 6 : 2);
    // the lane we would swing into must be clear from just behind us to past the obstacle (at speed this is a lane change, not a crawl)
    const clear = (sd) => { const px = -fz * sd, pz = fx * sd, tx = blk.pos.x + px * off, tz = blk.pos.z + pz * off, tl = (tx - this.pos.x) * fz - (tz - this.pos.z) * fx;
      for (const v of G.vehicles) { if (v === this || v === blk || v.air || !v.size || v.type === 'drone' || (!v.alive && v.pos.y > 3)) continue; const rx = v.pos.x - this.pos.x, rz = v.pos.z - this.pos.z, f = rx * fx + rz * fz;
        if (f < -(this.size[2] + v.size[2] + (early ? 8 : 2)) || f > bf + f2 + v.size[2] + 4) continue; const lat = rx * fz - rz * fx; if (Math.abs(lat - tl) < this.size[0] + Math.max(v.size[0], v.size[2] * 0.5) + 0.8) return false; }
      return !this.wallOn(this.pos.x, this.pos.z, tx + fx * f1, tz + fz * f1) && !this.wallOn(tx + fx * f1, tz + fz * f1, tx + fx * f2, tz + fz * f2); };
    // a side that runs into a wall, a container stack or a building is never taken, however clear of traffic it is
    const solid = (sd) => { const tx = blk.pos.x - fz * sd * off, tz = blk.pos.z + fx * sd * off; return this.wallOn(this.pos.x, this.pos.z, tx + fx * f1, tz + fz * f1) || this.wallOn(tx + fx * f1, tz + fz * f1, tx + fx * f2, tz + fz * f2); };
    let side = (bl > 0 ? -1 : 1) * (this.detours % 2 ? 1 : -1); if (!clear(side)) { if (clear(-side)) side = -side; else if (early) return false; else if (solid(side)) { if (solid(-side)) return false; side = -side; } }
    const px = -fz * side, pz = fx * side;
    const a1 = v3(blk.pos.x + px * off + fx * f1, 0, blk.pos.z + pz * off + fz * f1), a2 = v3(blk.pos.x + px * off + fx * f2, 0, blk.pos.z + pz * off + fz * f2);
    let j = this.pi; while (j < this.path.length - 1 && j - this.pi < 12) { const q = this.path[j], dx = q.x - blk.pos.x, dz = q.z - blk.pos.z; if (dx * fx + dz * fz < f2 && dx * dx + dz * dz < (f2 + 25) ** 2) j++; else break; }
    this.path.splice(this.pi, j - this.pi, a1, a2); return true;
  }
  /* does the strip a hull sweeps from (ax,az) to (bx,bz) cross anything solid and tall (walls, container stacks, buildings)? */
  wallOn(ax, az, bx, bz) {
    const hw = this.size[0] + 0.25, x0 = Math.min(ax, bx) - hw, x1 = Math.max(ax, bx) + hw, z0 = Math.min(az, bz) - hw, z1 = Math.max(az, bz) + hw, L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 1.2));
    for (const c of G.colliders) { if (c.max.x < x0 || c.min.x > x1 || c.max.z < z0 || c.min.z > z1) continue;
      for (let i = 0; i <= n; i++) { const x = ax + (bx - ax) * i / n, z = az + (bz - az) * i / n; if (x + hw < c.min.x || x - hw > c.max.x || z + hw < c.min.z || z - hw > c.max.z) continue;
        const gy = G.groundAt(x, z); if (c.max.y > gy + 1.2 && c.min.y < gy + 2.2) return true; } }
    return false;
  }
  unoverlap() {
    const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw), L = Math.max(0, this.size[2] - this.size[0]), w = this.size[0] * 0.85;
    for (const v of G.vehicles) { if (v === this || v.air || !v.size || v.type === 'drone' || (!v.alive && v.pos.y > 3)) continue; const shove = !v.alive && this.type === 'tank';
      const dx0 = this.pos.x - v.pos.x, dz0 = this.pos.z - v.pos.z; if (dx0 * dx0 + dz0 * dz0 > (this.size[2] + v.size[2] + 2) ** 2) continue;
      const vf = [-Math.sin(v.yaw), -Math.cos(v.yaw)], vr = [-vf[1], vf[0]];
      for (const k of [-1, 0, 1]) { const px = this.pos.x + fx * L * k, pz = this.pos.z + fz * L * k, a = (px - v.pos.x) * vf[0] + (pz - v.pos.z) * vf[1], b = (px - v.pos.x) * vr[0] + (pz - v.pos.z) * vr[1];
        const pa = v.size[2] + w - Math.abs(a), pb = v.size[0] + w - Math.abs(b); if (pa <= 0 || pb <= 0) continue; if (v === this.avoid) this.avoid = null; // touching what we meant to pass: brake for it again
        let mx, mz;
        // a tank meeting a wreck shoves it off its line sideways (and twists it a little) rather than bulldozing it down the road
        if (shove) { const sx = -fz, sz = fx, sd = Math.sign((v.pos.x - this.pos.x) * sx + (v.pos.z - this.pos.z) * sz) || 1, m = Math.min(pa, pb, 0.06);
          v.pos.x += sx * sd * m; v.pos.z += sz * sd * m; v.yaw += sd * m * 0.08 * (a > 0 ? 1 : -1); v.m.root.rotation.y = v.yaw; this.cs = (this.cs || 0) * 0.985; v.m.root.position.copy(v.pos); v.syncCol();
          if (Math.random() < 0.04) FX.dust(v.pos.clone().add(v3(rand(-1, 1), 0.5, rand(-1, 1))), 3, [0.4, 0.38, 0.35], 0.5); if (Math.random() < 0.01) SFX.impact?.(v.pos); continue; }
        if (pa < pb) { const s = Math.sign(a) || 1; mx = vf[0] * pa * s; mz = vf[1] * pa * s; } else { const s = Math.sign(b) || 1; mx = vr[0] * pb * s; mz = vr[1] * pb * s; }
        const share = shove ? 0.1 : !v.alive || v.o.anchor || v.invuln && !this.invuln ? 1 : this.o.anchor ? 0 : 0.5; this.pos.x += mx * share; this.pos.z += mz * share; v.pos.x -= mx * (1 - share); v.pos.z -= mz * (1 - share);
        const ahead = (v.pos.x - this.pos.x) * fx + (v.pos.z - this.pos.z) * fz > this.size[2] * 0.5; this.cs = (this.cs || 0) * (shove ? 0.985 : ahead ? 0.6 : 0.96); /* nose-on stops us; a scrape along a side only slows us */ v.cs = (v.cs || 0) * 0.8; if (shove && Math.random() < 0.04) FX.dust(v.pos.clone().add(v3(rand(-1, 1), 0.5, rand(-1, 1))), 3, [0.4, 0.38, 0.35], 0.5); v.m.root.position.copy(v.pos); v.syncCol(); } }
    if (G.smash && (this.cs || 0) > 0.8) for (const s of G.smash) { if (s.hit) continue; const dx = s.x - this.pos.x, dz = s.z - this.pos.z; if (dx * dx + dz * dz > (this.size[2] + s.r + 1) ** 2) continue;
      const a = dx * fx + dz * fz, b = Math.abs(dx * fz - dz * fx); if (a > -this.size[2] * 0.5 && a < this.size[2] + s.r && b < this.size[0] + s.r) smashIt(s, this); }
  }
  syncCol() {
    if (!this.col) return; const [hx, hy, hz] = this.size; const c = Math.abs(Math.cos(this.yaw)), s = Math.abs(Math.sin(this.yaw));
    setColliderFromBox(this.col, this.pos.x, this.pos.y + hy, this.pos.z, hx * c + hz * s, hy, hx * s + hz * c);
  }
  hurt(dmg, kind, src) {
    if (!this.alive || this.invuln) return;
    if (kind === 'hmg') { if (this.type === 'tank' || this.type === 'bus') return; dmg *= this.type === 'bmp' || this.type === 'apc' ? 0.3 : this.air ? 0.6 : 1; }
    if (kind === 'bullet') { if (this.type === 'tank' || this.type === 'apc' || this.type === 'bmp' || this.type === 'acv' || this.type === 'bus') return; dmg *= this.air ? 0.35 : 0.5; }
    this.hp -= dmg; if (this.o.onHurt) this.o.onHurt(this, dmg, kind);
    if (this.hp <= 0) this.die(src);
  }
  die(src) {
    this.alive = false; this.cs = 0; this.diedAt = G.time;
    explode(this.pos.clone().add(v3(0, 1.2, 0)), { radius: 7, dmg: 120, vdmg: 0, size: this.type === 'drone' ? 0.7 : 1.6, src: this });
    if (this.type !== 'drone') addEmitter(this.pos.clone().add(v3(0, 1.5, 0)), 'fire', 1.3, 25, this.air ? 2 : 90);
    if (this.type !== 'drone' && !this.air) addEmitter(this.pos.clone().add(v3(0, 2.5, 0)), 'smoke', 0.8, 3, 120);
    const burnt = mat('burnt', { color: 0x1d1b19, rough: 1 });
    this.m.root.traverse((c) => { if (!c.isMesh) return; if (c.material.transparent) { c.visible = false; return; } if (c.material !== basicMat('dronelight', 0xff3020)) c.material = burnt; });
    if (this.m.turret && (this.type === 'tank' || this.type === 'bmp')) { this.m.turret.position.y += 0.4; this.m.turret.rotation.z = rand(-0.3, 0.3); this.m.turret.rotation.y += rand(-0.5, 0.5); }
    if (this.snd) this.snd.stop();
    if (this.air) { this.falling = true; this.vel.set(rand(-4, 4), -2, rand(-4, 4)); }
    if (src === PT || src === 'player') { addKillFeed(this.type === 'tank' ? '전차 격파' : this.type === 'apc' || this.type === 'bmp' ? '장갑차 격파' : this.type === 'drone' ? '드론 격추' : this.air ? '헬기 격추' : '차량 파괴'); G.stats.kills++; }
    if (this.o.onDeath) this.o.onDeath(this);
  }
  remove() { G.world.remove(this.m.root); if (this.col) { const i = G.dyn.indexOf(this.col); if (i >= 0) G.dyn.splice(i, 1); } if (this.snd) this.snd.stop(); const i = G.vehicles.indexOf(this); if (i >= 0) G.vehicles.splice(i, 1); }
  findTarget() {
    if (this.o.target === 'player') return P.alive ? PT : null;
    const rng = this.o.range || (this.team === 'enemy' && !this.air ? 85 : 160); let best = null, bd = rng, blind = null, blindD = 1e9; const from = this.pos.clone().add(v3(0, this.air ? -1 : 3.4, 0));
    const allyV = G.vehicles.filter((v) => v.alive && v.team === 'ally' && !v.air && v.type !== 'bus' && v.type !== 'truck');
    const cand = this.o.target === 'veh' ? allyV : this.o.target === 'allies' ? [...G.actors.filter((a) => a.alive && a.team === 'ally' && !a.hero), ...allyV] : this.team === 'enemy' ? [PT, ...G.actors.filter((a) => a.alive && a.team === 'ally'), ...allyV] : G.actors.filter((a) => a.alive && a.team === 'enemy').concat(G.vehicles.filter((v) => v.alive && v.team === 'enemy' && !v.air));
    for (const t of cand) {
      if (t.isPlayer && !P.alive) continue;
      const tp = t.isPlayer ? P.eyePos : t.isVehicle ? t.pos.clone().setY(t.pos.y + 2.2) : t.chest(v3());
      let d = from.distanceTo(tp); if (t.isPlayer) d *= 0.7; if (t.isVehicle && (this.type === "tank" || this.type === "bmp")) d *= 0.55;
      if (d < bd) { if (hasLOS(from, tp, [this, t])) { bd = d; best = t; } else if (!blind || d < blindD) { blind = t; blindD = d; } }
    }
    // nothing in sight: keep shelling the nearest known position (armour does not sit quietly behind cover)
    this.tgtBlind = !best && !!blind && blindD < rng * 0.7;
    return best || (this.tgtBlind ? blind : null) || (this.o.suppress && this.team === 'ally' ? this.o.suppress(this) : null);
  }
  update(dt) {
    const m = this.m;
    if (!this.alive) {
      if (this.falling) { this.vel.y -= 9.8 * dt; this.pos.addScaledVector(this.vel, dt); m.root.rotation.y += dt * 3; const gy = G.groundAt(this.pos.x, this.pos.z); if (this.pos.y <= gy + 0.5) { this.pos.y = gy + 0.5; this.falling = false; if (this.type !== 'drone') { explode(this.pos.clone(), { radius: 8, dmg: 80, size: 1.8 }); addEmitter(this.pos.clone().add(v3(0, 1, 0)), 'fire', 1.4, 25, 60); addEmitter(this.pos.clone().add(v3(0, 2, 0)), 'smoke', 1, 3, 90); } else this.remove(); } m.root.position.copy(this.pos); }
      return;
    }
    // path follow
    let moving = false;
    if (this.path && this.pi < this.path.length && !this.stopped) {
      const p = this.path[this.pi]; const dx = p.x - this.pos.x, dz = p.z - this.pos.z; const dy = this.air ? p.y - this.pos.y : 0; const d = Math.hypot(dx, dz, dy);
      if (d < (this.air ? 4 : 2)) { this.pi++; if (this.pi >= this.path.length) { if (this.o.loop) this.pi = 0; else if (this.o.onArrive) this.o.onArrive(this); } }
      else {
        if (!this.air && this.o.yieldPeople !== false) { const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw); let block = false; const reach = this.size[2] + 2.5;
          for (const a of G.actors) { if (!a.alive || this.team === 'enemy' || (a.team !== 'civ' && !a.hero)) continue; const rx = a.pos.x - this.pos.x, rz = a.pos.z - this.pos.z; const f = rx * fx + rz * fz; if (f > 0 && f < reach && Math.abs(rx * fz - rz * fx) < this.size[0] + 0.8) { block = true; break; } }
          if (this.team === 'ally') { const rx = P.pos.x - this.pos.x, rz = P.pos.z - this.pos.z; const f = rx * fx + rz * fz; if (f > 0 && f < reach && Math.abs(rx * fz - rz * fx) < this.size[0] + 0.8) block = true; }
          if (block) { this.yieldT = (this.yieldT || 0) + dt; if (this.yieldT > 2.5) { block = false; if (this.yieldT > 4.5) this.yieldT = 0; } } else this.yieldT = 0;
          this.yielding = block; }
        if (!this.yielding || this.air) {
        const want = Math.atan2(-dx, -dz); const turn = this.air ? 1.2 : this.type === 'tank' ? 0.6 : 1.0;
        this.yaw += clamp(angDiff(this.yaw, want), -turn * dt, turn * dt);
        const align = Math.max(0, Math.cos(angDiff(this.yaw, want)));
        // speed builds up and bleeds off: no vehicle jumps to full speed or stops dead
        let want2 = this.speed * (this.air ? 1 : 0.3 + 0.7 * align);
        // never circle a waypoint: a point inside the turning circle gets approached slowly enough to turn onto it
        if (!this.air) { const ad = Math.abs(angDiff(this.yaw, Math.atan2(-dx, -dz))), tr = this.type === 'tank' ? 0.6 : 1.0; if (ad > 0.35) want2 = Math.min(want2, Math.max(0.8, tr * d * 0.45 / Math.max(0.3, Math.sin(Math.min(ad, 1.57))))); }
        const acc = this.o.acc ?? (this.air ? 3.5 : this.type === 'tank' ? 1.4 : this.type === 'truck' || this.type === 'jeep' || this.type === 'car' ? 2.6 : 2.0);
        if (this.pi === this.path.length - 1 && !this.o.loop) want2 = Math.min(want2, Math.sqrt(2 * acc * 1.4 * Math.max(0, d - 1.5)) + 0.4);
        // every ground vehicle keeps its distance: it brakes for whatever is in front of it in its path and never drives through it
        if (!this.air && this.size) { const fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw); let lim = 1e9, blk = null, bf = 0, bl = 0;
          if (this.avoid && this.pi > this.avoidIdx) this.avoid = null;
          for (const v of G.vehicles) { if (v === this || v === this.avoid || v.air || !v.size || v.type === 'drone' || (!v.alive && v.pos.y > 3)) continue; const rx = v.pos.x - this.pos.x, rz = v.pos.z - this.pos.z, f = rx * fx + rz * fz; if (f <= 0) continue;
            const vx = -Math.sin(v.yaw), vz = -Math.cos(v.yaw), cf = Math.abs(fx * vx + fz * vz), cr = Math.abs(fz * vx - fx * vz), eF = cf * v.size[2] + cr * v.size[0], eL = cr * v.size[2] + cf * v.size[0];
            const lat = rx * fz - rz * fx; if (Math.abs(lat) > this.size[0] + eL + 0.5) continue; const gap = f - this.size[2] - eF, vs = (v.cs || 0) * cf;
            let l = gap < 2.5 ? 0 : gap < 16 ? Math.max(0, vs + (gap - 7) * 0.45) : 1e9; if (!v.alive && this.type === 'tank') l = Math.max(l, v.type === 'tank' ? 1.5 : 2.2); if (l < lim) { lim = l; blk = v; bf = f; bl = lat; blk.eF = eF; blk.eL = eL; } }
          // a wreck or a parked vehicle seen in time: change lanes round it at speed instead of stopping behind it first
          const still = blk && ((!blk.alive && G.time - (blk.diedAt ?? -99) > 3.5) || (blk.alive && (blk.cs || 0) < 0.3 && !(blk.path && blk.pi < blk.path.length && !blk.o.anchor)));
          if (still && !this.o.noDetour && this.pi < this.path.length - 2 && bf - this.size[2] - blk.eF < Math.max(18, this.cs * 2.6) && bf - this.size[2] - blk.eF > 3) {
            const n0 = this.detBlk === blk ? (this.detours || 0) + 1 : 1, d0 = this.detours; this.detours = n0;
            if (this.planDetour(blk, bf, bl, fx, fz, true)) { this.detBlk = blk; this.avoid = blk; this.avoidIdx = this.pi + 1; lim = 1e9; } else this.detours = d0; }
          want2 = Math.min(want2, lim); this.blkBy = lim < 0.3 ? blk : null; const vid = (v) => v.vid ??= ++Vehicle.n;
          // held up by something standing still: if the goal is no further than it, this is as far as we go; otherwise drive round it
          // two vehicles stuck nose to nose: the older one waits, the newer one drives round. something that still has somewhere to go gets a few seconds before we go round it
          const moving = blk && blk.alive && blk.path && blk.pi < blk.path.length && !blk.o.anchor, yieldTo = moving && blk.blkBy === this && vid(this) < vid(blk);
          if (blk && lim < 0.3 && (blk.cs || 0) < 0.3 && !this.o.noDetour && !yieldTo) { this.heldT = (this.heldT || 0) + dt;
            if (this.heldT > (moving ? 4 : 1.2)) { this.heldT = 0; const last = this.path[this.path.length - 1], dl = Math.hypot(last.x - this.pos.x, last.z - this.pos.z);
              this.detours = this.detBlk === blk ? (this.detours || 0) + 1 : 1; this.detBlk = blk;
              if ((this.pi >= this.path.length - 1 && dl < bf + blk.eF) || (this.detours > 4 && dl < 60)) { this.pi = this.path.length; if (this.o.onArrive) this.o.onArrive(this); }
              else this.planDetour(blk, bf, bl, fx, fz, false); } } else this.heldT = 0; }
        this.cs = this.cs ?? 0; this.cs = want2 > this.cs ? Math.min(want2, this.cs + acc * dt) : Math.max(want2, this.cs - acc * 2 * dt);
        const sp = this.cs;
        if (this.air) { this.vel.set(dx / d * sp, dy / d * sp, dz / d * sp); this.pos.addScaledVector(this.vel, dt); }
        else { this.pos.x -= Math.sin(this.yaw) * sp * dt; this.pos.z -= Math.cos(this.yaw) * sp * dt; }
        moving = true; }
      }
    } else if (this.air) this.vel.multiplyScalar(0.95);
    if (!moving) this.cs = Math.max(0, (this.cs || 0) - (this.air ? 3.5 : 3) * dt);
    if (!this.air && this.size && this.type !== 'drone') this.unoverlap();
    if (!this.air) { const gy = this.o.yFn ? this.o.yFn(this.pos.x, this.pos.z) : (this.o.y ?? G.groundAt(this.pos.x, this.pos.z)); this.pos.y = gy; }
    if (m.wheels && this.lastP) { const dd = Math.hypot(this.pos.x - this.lastP.x, this.pos.z - this.lastP.z); if (dd > 0.0001) for (const w of m.wheels) w.rotation.x -= dd / w.userData.r; }
    this.lastP = this.lastP || v3(); this.lastP.copy(this.pos);
    if (m.details) { const near = this.pos.distanceToSquared(camera.position) < 120 * 120; for (const d of m.details) d.visible = near; }
    m.root.position.copy(this.pos); m.root.rotation.y = this.yaw;
    if (this.air && this.type !== 'drone') { m.root.rotation.x = clamp(-this.vel.length() * 0.012, -0.25, 0.1); m.rotor.rotation.y += dt * 28; m.tail.rotation.x += dt * 40; if (this.o.bob !== false) m.root.position.y += Math.sin(G.time * 1.3 + this.pos.x) * 0.25; }
    this.syncCol();
    if (this.snd) this.snd.at(this.pos, this.air ? 70 : 30, this.type === 'drone' ? 0.25 : this.air ? 1.2 : 0.7, this.type === 'drone' ? 140 : moving ? 46 : 34);
    // drone kamikaze
    if (this.type === 'drone' && this.o.dive) {
      const t = this.o.dive; if (this.pos.distanceTo(t) < 4) { this.alive = false; explode(this.pos.clone(), { radius: 9, dmg: 160, size: 1.5 }); this.remove(); if (this.o.onImpact) this.o.onImpact(this); return; }
      if (!this.path || this.pi >= this.path.length) { const d = v3().subVectors(t, this.pos).normalize(); this.vel.lerp(d.multiplyScalar(this.speed), 0.05); this.pos.addScaledVector(this.vel, dt); this.yaw = Math.atan2(-this.vel.x, -this.vel.z); }
    }
    // weapons
    if (!this.armed) return;
    this.thinkT = (this.thinkT || 0) - dt; if (this.thinkT <= 0) { this.thinkT = 0.4; this.tgt = this.findTarget(); }
    const t = this.tgt; if (!t || t.alive === false) return;
    const tp = t.isPlayer ? P.chestPos : t.isVehicle ? t.pos.clone().setY(t.pos.y + 1.2) : t.chest(v3());
    if (m.turret) {
      const wp = m.turret.getWorldPosition(v3()); const want = Math.atan2(-(tp.x - wp.x), -(tp.z - wp.z)) - this.yaw;
      const cur = m.turret.rotation.y; const dd = angDiff(cur, want); m.turret.rotation.y = cur + clamp(dd, -0.7 * dt, 0.7 * dt);
      const pitch = Math.atan2(tp.y - wp.y, Math.hypot(tp.x - wp.x, tp.z - wp.z)); m.barrel.rotation.x = damp(m.barrel.rotation.x, pitch, 3, dt);
      this.fireCd -= dt;
      if (this.type === 'tank' && this.fireCd <= 0 && Math.abs(dd) < 0.06) {
        this.fireCd = this.o.reload ?? rand(6, 9);
        const mz = m.muzzle.getWorldPosition(v3()); const dir = v3().subVectors(tp, mz); const L = dir.length(); dir.normalize();
        const miss = (this.o.accurate ? 1 : (t.isPlayer ? 3.5 : 2)) * (this.tgtBlind ? 2.2 : 1); dir.x += rand(-1, 1) * miss / L; dir.y += rand(-0.5, 1) * miss / L; dir.z += rand(-1, 1) * miss / L; dir.normalize();
        new Proj('shell', mz, dir.multiplyScalar(160), { team: this.team, owner: this });
        FX.muzzle(mz, dir.clone().normalize(), 5); flashLight(mz, 0xffb060, 40, 40, 0.15); SFX.shot('cannon', mz);
        for (let i = 0; i < 20; i++) particle({ x: mz.x, y: mz.y, z: mz.z, vx: rand(-4, 4), vy: rand(0, 2), vz: rand(-4, 4), life: rand(1, 2.5), size: 1, size1: 4, alpha: 0.4, color: [0.7, 0.68, 0.64], drag: 2 });
        m.barrel.position.z = -1.0; this.kick = 0.4;
        if (t.isPlayer) G.shake += 0.15;
      }
      if ((this.type === 'bmp' || this.type === 'acv') && this.fireCd <= 0 && Math.abs(dd) < 0.1) { // 30 mm bursts / .50 cal from the RWS
        if (!(this.acBurst > 0)) this.acBurst = randi(4, 7);
        this.acBurst--; this.fireCd = this.acBurst > 0 ? 0.28 : (this.o.reload ?? rand(2.5, 4));
        const mz = m.muzzle.getWorldPosition(v3()); const dir = v3().subVectors(tp, mz); const L = dir.length(); dir.normalize();
        const miss = t.isPlayer ? 2.6 : 1.5; dir.x += rand(-1, 1) * miss / L; dir.y += rand(-0.4, 0.8) * miss / L; dir.z += rand(-1, 1) * miss / L; dir.normalize();
        new Proj('ac', mz, dir.multiplyScalar(220), { team: this.team, owner: this });
        FX.muzzle(mz, dir.clone().normalize(), 1.6); flashLight(mz, 0xffb060, 14, 20, 0.06); SFX.shot('mg', mz); tracer(mz, mz.clone().addScaledVector(dir, 6), [1, 0.6, 0.3], 220);
        if (this.type === 'bmp' && !this.o.k808) { m.barrel.position.z = -0.85; this.kick = 0.12; }
      }
      if (this.kick > 0 && this.type !== 'acv') { this.kick -= dt; m.barrel.position.z = this.type === 'bmp' ? lerp(-0.95, -0.85, this.kick / 0.12) : lerp(-1.4, -1.0, this.kick / 0.4); }
    }
    // machine gun
    if (this.type !== 'truck' && this.type !== 'drone' && this.o.mg !== false && !this.tgtBlind) {
      this.mgCd -= dt;
      if (this.mgCd <= 0) {
        if (this.burst <= 0) this.burst = randi(6, 14);
        this.burst--; this.mgCd = this.burst > 0 ? 0.1 : rand(1.5, 3);
        const from = this.m.muzzle ? this.m.turret.getWorldPosition(v3()).add(v3(0, 0.6, 0)) : this.pos.clone().add(v3(0, -0.8, -3).applyAxisAngle(v3(0, 1, 0), this.yaw));
        const d = from.distanceTo(tp); let ch = 0.18 * DIFF[SET.diff].acc * clamp(1.2 - d / 80, 0.15, 1);
        if (t.isPlayer) { if (P.speed > 3) ch *= 0.6; if (!hasLOS(from, P.chestPos, [this])) ch *= 0.25; ch *= (G.hitMul ?? 1); }
        const hit = Math.random() < ch; const end = tp.clone(); if (!hit) end.add(v3(rand(-2, 2), rand(-0.8, 1.5), rand(-2, 2)));
        const dir = v3().subVectors(end, from).normalize(); const r = rayWorld(from, dir, from.distanceTo(end) + (hit ? 0 : 15), false, [this, t]);
        const stop = from.clone().addScaledVector(dir, r.t);
        if (hit && r.t >= from.distanceTo(end) - 0.6) { if (t.isPlayer) damagePlayer(9 * DIFF[SET.diff].dmg, this.pos); else if (!t.isVehicle) t.hurt(30, this); }
        else if (r.c) FX.dust(stop, 3, G.env.snow ? [0.85, 0.87, 0.9] : [0.5, 0.47, 0.42], 0.15);
        tracer(from, stop, [1, 0.5, 0.3], 450); SFX.shot('mg', from); FX.muzzle(from, dir, 0.9);
        this.lastFire = G.time;
      }
    }
  }
}
function makeBusMesh(col) {
  /* a Seoul low-floor city bus: coloured skirt and body, white roof band and roof pod, a black glazed band with slim pillars,
     a big raked windscreen under an orange LED destination board, two doors on the kerb side, deep wheel arches, mirrors, lamps */
  const body = mat('bus' + col, { color: col, rough: 0.42, metal: 0.25 }), white = mat('busW', { color: 0xecece8, rough: 0.45, metal: 0.2 }), gl = mat('busGl', { color: 0x141a20, rough: 0.06, metal: 0.65 });
  const dk = mat('vehdk', { color: 0x1c1d1c }), tyre = mat('busTyre', { color: 0x161616, rough: 0.85 }), hub = mat('busHub', { color: 0xb8bcc0, rough: 0.35, metal: 0.6 });
  const led = mat('busLED', { color: 0x1a1406, emissive: 0xffa020, ei: 1.3 }), lamp = mat('busLamp', { color: 0xf2f2ea, emissive: 0xfff2d0, ei: 0.5 }), tail = mat('busTail', { color: 0x8a1810, emissive: 0x500000, ei: 1 });
  const root = new THREE.Group(), add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); me.castShadow = true; root.add(me); return me; };
  const RB = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, r);
  add(RB(2.5, 1.35, 11, 0.12), body, 0, 1.05, 0);                                   // skirt to the window line
  add(RB(2.48, 1.15, 10.9, 0.16), white, 0, 2.3, 0.02);                              // upper body, white
  add(RB(2.36, 0.22, 10.6, 0.1), white, 0, 2.95, 0.05);                              // roof
  add(RB(1.9, 0.42, 4.2, 0.14), white, 0, 3.22, 1.2); add(RB(1.6, 0.3, 1.6, 0.1), white, 0, 3.1, -3.2);   // roof pod (gas tanks, A/C), a vent
  add(new THREE.BoxGeometry(2.53, 0.12, 10.9), body, 0, 1.72, 0);                     // colour line under the glazing
  // glazing: one dark band on each side, pillars over it; windscreen, rear window
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.04, 0.95, 9.2), gl, s * 1.255, 2.28, 0.6); for (let z = -3.6; z <= 5; z += 1.32) add(new THREE.BoxGeometry(0.05, 0.95, 0.09), white, s * 1.262, 2.28, z); }
  add(new THREE.BoxGeometry(2.3, 1.75, 0.05), gl, 0, 1.95, -5.48, -0.07); add(new THREE.BoxGeometry(2.2, 0.32, 0.06), led, 0, 3.0, -5.5);
  add(new THREE.BoxGeometry(0.5, 0.18, 0.04), led, -1.0, 2.9, 5.0 + 0.47);                                   // route number at the back
  add(new THREE.BoxGeometry(2.0, 0.8, 0.05), gl, 0, 2.35, 5.49); add(new THREE.BoxGeometry(0.42, 0.22, 0.6), led, 1.262, 2.6, -4.2); // side LED by the door
  // doors (kerb side, +x): front and middle, glass in a dark frame
  for (const [z0, z1] of [[-5.1, -3.95], [0.3, 1.55]]) { add(new THREE.BoxGeometry(0.05, 2.3, z1 - z0), dk, 1.255, 1.55, (z0 + z1) / 2); add(new THREE.BoxGeometry(0.06, 2.1, (z1 - z0) / 2 - 0.08), gl, 1.27, 1.6, z0 + (z1 - z0) / 4); add(new THREE.BoxGeometry(0.06, 2.1, (z1 - z0) / 2 - 0.08), gl, 1.27, 1.6, z1 - (z1 - z0) / 4); }
  // bumpers, lamps, plate, mirrors
  add(RB(2.52, 0.4, 0.3, 0.08), dk, 0, 0.55, -5.42); add(RB(2.52, 0.4, 0.3, 0.08), dk, 0, 0.55, 5.42);
  for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.42, 0.2, 0.05), lamp, s * 0.92, 0.9, -5.52); add(new THREE.BoxGeometry(0.3, 0.5, 0.05), tail, s * 1.05, 1.2, 5.52);
    add(new THREE.BoxGeometry(0.06, 0.06, 0.5), dk, s * 1.35, 2.75, -5.55, 0, s * 0.4); add(RB(0.12, 0.42, 0.26, 0.04), dk, s * 1.55, 2.5, -5.75); }
  add(new THREE.BoxGeometry(0.52, 0.12, 0.04), white, 0, 0.6, -5.58);
  // wheels in deep arches
  const wg = new THREE.CylinderGeometry(0.5, 0.5, 0.32, 18), hg = new THREE.CylinderGeometry(0.28, 0.28, 0.34, 12);
  for (const s of [-1, 1]) for (const z of [-3.4, 3.15]) { const w = add(wg, tyre, s * 1.1, 0.5, z, 0, 0, Math.PI / 2); const h = add(hg, hub, s * 1.12, 0.5, z, 0, 0, Math.PI / 2); add(new THREE.BoxGeometry(0.06, 0.55, 1.3), dk, s * 1.255, 1.05, z); }
  root.scale.setScalar(VSCALE);
  return { root };
}
