/* ---------------- projectiles ---------------- */
const PROJ_MESH = {
  rocket: (() => { const g = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6); g.rotateX(Math.PI / 2); g.userData.keep = true; return g; })(),
  grenade: (() => { const g = new THREE.SphereGeometry(0.06, 8, 6); g.scale(1, 1.3, 1); g.userData.keep = true; return g; })(),
};
class Proj {
  constructor(kind, pos, vel, o = {}) {
    this.kind = kind; this.pos = pos.clone(); this.vel = vel.clone(); this.o = o; this.team = o.team || 'player'; this.owner = o.owner || null;
    this.age = 0; this.alive = true;
    this.life = o.life ?? { rocket: 6, shell: 3, grenade: o.fuse ?? 2.8, gl: 5, flak: 1.8, missile: 10, naval: 6, mortar: 8 }[kind] ?? 5;
    if (kind === 'rocket' || kind === 'missile') { this.mesh = new THREE.Mesh(PROJ_MESH.rocket, mat('gunM', { color: 0x1a1b1c })); G.world.add(this.mesh); }
    if (kind === 'gl') { this.mesh = new THREE.Mesh(PROJ_MESH.grenade, mat('glround', { color: 0x6a6a3a })); G.world.add(this.mesh); }
    if (kind === 'grenade') { this.mesh = new THREE.Mesh(PROJ_MESH.grenade, mat('nade', { color: 0x3a4030 })); G.world.add(this.mesh); this.spin = v3(rand(-8, 8), rand(-8, 8), rand(-8, 8)); }
    if (kind === 'naval' || kind === 'mortar') SFX.incoming(o.target || pos);
    G.projs.push(this);
  }
  kill() { this.alive = false; if (this.mesh) G.world.remove(this.mesh); }
  boom(at, water = false) {
    const k = this.kind; this.kill();
    if (k === 'rocket') explode(at, { radius: 5.5, dmg: 250, vdmg: 320, size: 1.1, src: this.team === 'player' ? PT : this.owner, water });
    else if (k === 'missile') explode(at, { radius: 6, dmg: 250, vdmg: 900, size: 1.4, src: PT, water });
    else if (k === 'shell') explode(at, { radius: 5, dmg: 140, vdmg: 150, size: 1.2, src: this.owner, water });
    else if (k === 'ac') explode(at, { radius: 2.6, dmg: 55, vdmg: 25, size: 0.55, src: this.owner, water, noShake: true });
    else if (k === 'grenade') explode(at, { radius: 7, dmg: 230, vdmg: 80, size: 0.9, src: this.team === 'player' ? PT : this.owner, water });
    else if (k === 'naval') explode(at, { radius: 12, dmg: 400, vdmg: 900, size: 2.6, src: this.o.src || null, water });
    else if (k === 'gl') explode(at, { radius: 4.5, dmg: 220, vdmg: 230, size: 0.9, src: PT, noPlayer: true, noAlly: true, water });
    else if (k === 'mortar') explode(at, { radius: 8, dmg: this.o.dmg ?? 160, vdmg: 200, size: 1.6, src: null, water, noAlly: !!this.o.noAlly });
    else if (k === 'flak') { FX.explosion(at, 0.3); SFX.explosion(at, 0.3); for (const v of G.vehicles) if (v.alive && v.air && v.pos.distanceTo(at) < 6) v.hurt(60, 'explosive', PT); }
  }
  update(dt) {
    this.age += dt; if (this.age > this.life) { if (this.kind === 'grenade') this.boom(this.pos.clone()); else this.kill(); return; }
    const prev = this.pos.clone();
    if (this.kind === 'grenade') {
      this.vel.y -= 9.8 * dt; this.pos.addScaledVector(this.vel, dt);
      const gy = floorAt(this.pos.x, this.pos.z, this.pos.y + 0.3, 0.05);
      if (this.pos.y < gy + 0.06) { this.pos.y = gy + 0.06; this.vel.y = Math.abs(this.vel.y) * 0.3; this.vel.x *= 0.6; this.vel.z *= 0.6; if (Math.abs(this.vel.y) > 1) SFX.metal(this.pos); }
      // wall bounce
      for (const c of G.colliders) { if (this.pos.x > c.min.x && this.pos.x < c.max.x && this.pos.z > c.min.z && this.pos.z < c.max.z && this.pos.y > c.min.y && this.pos.y < c.max.y - 0.1) { if (prev.x <= c.min.x || prev.x >= c.max.x) this.vel.x *= -0.4; else this.vel.z *= -0.4; this.pos.x = prev.x; this.pos.z = prev.z; } }
      this.mesh.position.copy(this.pos); this.mesh.rotation.x += this.spin.x * dt; this.mesh.rotation.z += this.spin.z * dt;
      return;
    }
    if (this.kind === 'missile' && this.o.guide) {
      const aim = this.o.guide(); if (aim) { const want = v3().subVectors(aim, this.pos).normalize(); const sp = this.vel.length(); const cur = this.vel.clone().normalize(); cur.lerp(want, Math.min(1, dt * (this.o.turn || 3))).normalize(); this.vel.copy(cur.multiplyScalar(Math.min(sp + dt * (this.o.accel || 30), this.o.vmax || 70))); if (this.o.prox === true && this.pos.distanceTo(aim) < 4.5) { this.boom(this.pos.clone()); return; } }
    }
    if (this.o.prox) for (const v of G.vehicles) if (v.alive && v.air && (this.team === 'enemy' ? v.team !== 'enemy' : v.team === 'enemy') && v.pos.distanceTo(this.pos) < this.o.prox) { v.hurt(900, 'explosive', this.team === 'player' ? PT : this.owner); this.boom(this.pos.clone()); return; }
    if (this.kind === 'rocket') this.vel.y -= 1.2 * dt;
    if (this.kind === 'gl') { this.vel.y -= 9.8 * dt; if (Math.random() < 0.5) particle({ add: true, x: this.pos.x, y: this.pos.y, z: this.pos.z, life: 0.06, size: 0.18, color: [1, 0.75, 0.4] }); }
    if (this.kind === 'naval' || this.kind === 'mortar') this.vel.y -= (this.kind === 'mortar' ? 9.8 : 4) * dt;
    this.pos.addScaledVector(this.vel, dt);
    if (this.mesh) { this.mesh.position.copy(this.pos); this.mesh.lookAt(this.pos.clone().add(this.vel)); }
    if (this.kind === 'rocket' || this.kind === 'missile') { FX.smokeTrail(this.pos, 1); if (Math.random() < 0.5) flashLight(this.pos, 0xff9040, 3, 8, 0.05); }
    if (this.kind === 'shell') particle({ add: true, x: this.pos.x, y: this.pos.y, z: this.pos.z, life: 0.05, size: 0.5, color: [1, 0.6, 0.3] });
    if (this.kind === 'naval' || this.kind === 'mortar') { if (this.age > 0.3) particle({ add: true, x: this.pos.x, y: this.pos.y, z: this.pos.z, life: 0.08, size: 0.6, color: [1, 0.5, 0.2] }); }
    if (this.kind === 'flak') { particle({ add: true, x: this.pos.x, y: this.pos.y, z: this.pos.z, life: 0.04, size: 0.25, color: [1, 0.8, 0.4] }); for (const v of G.vehicles) if (v.alive && v.air && v.pos.distanceTo(this.pos) < 4.5) { this.boom(this.pos.clone()); return; } if (this.age > (this.o.fuse ?? 1.4)) { this.boom(this.pos.clone()); return; } }
    // collision along segment
    const seg = v3().subVectors(this.pos, prev); const L = seg.length(); if (L < 1e-5) return; seg.divideScalar(L);
    // water
    if (G.waterY > -900 && this.pos.y < G.waterY && prev.y >= G.waterY && !G.onDeck?.(this.pos)) { const t = (prev.y - G.waterY) / (prev.y - this.pos.y); this.boom(prev.clone().lerp(this.pos, t), true); return; }
    const r = rayWorld(prev, seg, L, false, this.team === 'player' && this.age < 0.6 ? playerSkip() : null);
    let hitT = r.c ? r.t : Infinity;
    if (r.c && r.c.ref && r.c.ref === this.owner) hitT = Infinity;
    // actors
    if (this.kind !== 'flak' && this.kind !== 'naval' && this.kind !== 'mortar') {
      for (const a of G.actors) { if (!a.alive || a === this.owner || a.team === this.team || a.team === 'civ') continue; const c = a.chest(v3()); const t = v3().subVectors(c, prev).dot(seg); if (t < 0 || t > L) continue; const cp = prev.clone().addScaledVector(seg, t); if (cp.distanceTo(c) < 0.55 && t < hitT) hitT = t; }
      if (this.team !== 'player' && this.team !== 'ally') { const t = v3().subVectors(P.chestPos, prev).dot(seg); if (t >= 0 && t <= L && prev.clone().addScaledVector(seg, t).distanceTo(P.chestPos) < 0.7 && t < hitT) hitT = t; }
      for (const v of G.vehicles) if (v.alive && v.air && v !== this.owner) { const t = v3().subVectors(v.pos, prev).dot(seg); if (t >= 0 && t <= L && prev.clone().addScaledVector(seg, t).distanceTo(v.pos) < 2.5 && t < hitT) hitT = t; }
    }
    if (hitT < Infinity) this.boom(prev.clone().addScaledVector(seg, Math.max(0, hitT - 0.1)));
  }
}
function updateProjs(dt) { for (let i = G.projs.length - 1; i >= 0; i--) { const p = G.projs[i]; if (p.alive) p.update(dt); if (!p.alive) G.projs.splice(i, 1); } }

/* ---------------- explosion ---------------- */
function explode(pos, o = {}) {
  const r = o.radius ?? 6, dmg = o.dmg ?? 200, vd = o.vdmg ?? dmg, s = o.size ?? 1;
  if (G.onExplode) G.onExplode(pos, o);
  if (o.water) { FX.splash(pos, 2.2 * s); FX.explosion(pos, s * 0.4); SFX.explosion(pos, s * 0.8, o.delayed !== false); }
  else {
    FX.explosion(pos, s);
    const gy = G.groundAt(pos.x, pos.z); if (pos.y - gy < 1.5) { if (G.env.snow || G.env.snowGround) FX.snowPuff(pos); FX.dust(pos, 10, [0.4, 0.37, 0.33], 0.6 * s); }
    SFX.explosion(pos, s, o.delayed !== false);
  }
  flashLight(pos.clone().add(v3(0, 1.5, 0)), 0xffa050, 60 * s, 30 * s, 0.6);
  for (const a of G.actors) {
    if (!a.alive || a.team === 'civ' || (a.hero) || (o.noAlly && a.team === 'ally')) continue;
    const d = a.pos.distanceTo(pos); if (d < r) { const k = 1 - d / r; const was = a.alive; a.hurt(dmg * k * (a.team === 'ally' && !o.ff ? 0.4 : 1), o.src || null); if (was && !a.alive) { a.deathKind = 0; const bd = v3(a.pos.x - pos.x, 0, a.pos.z - pos.z).normalize(); a.blast = bd; const fwd = v3(-Math.sin(a.yaw), 0, -Math.cos(a.yaw)); a.fall = bd.dot(fwd) > 0 ? 1 : -1; if (k > 0.35 && Math.random() < 0.55) igniteBody(a); } }
  }
  for (const v of G.vehicles) { if (!v.alive || v === o.src || (o.noAlly && v.team === 'ally')) continue; const d = v.pos.distanceTo(pos) - Math.max(v.size?.[0] || 1, 1); if (d < r) v.hurt(vd * clamp(1 - d / r, 0.3, 1), 'explosive', o.src); }
  if (P.alive && !o.noPlayer) {
    const d = P.pos.distanceTo(pos);
    if (d < r) { const k = 1 - d / r; damagePlayer(dmg * k * 0.75 * (o.src === PT ? 1 : DIFF[SET.diff].dmg * 0.9), pos, true); }
    G.shake += clamp(1.6 * s - d / 30, 0, 1.6);
    if (d < 9) { G.ringT = 2.5; }
  }
}
