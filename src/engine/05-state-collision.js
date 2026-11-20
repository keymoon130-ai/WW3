/* ---------------- game state ---------------- */
const G = {
  mode: 'menu', paused: false, time: 0, timeScale: 1, token: 0,
  world: null, staticRoot: null,
  colliders: [], dyn: [], covers: [],
  actors: [], vehicles: [], projs: [], props: [], emitters: [], updaters: [], interactables: [],
  waiters: [], conds: [],
  env: {}, mission: null, phaseI: 0,
  groundAt: () => 0, waterY: -999,
  stats: { kills: 0, heads: 0, shots: 0, hits: 0, t0: 0 },
  cut: null, shake: 0, objPos: null,
};
function newWorld() {
  if (G.world) {
    G.world.traverse((o) => { if (o.geometry && !o.geometry.userData.keep) o.geometry.dispose(); });
    scene.remove(G.world);
  }
  G.world = new THREE.Group(); scene.add(G.world); lampLight.intensity = 0;
  G.staticRoot = new THREE.Group(); G.world.add(G.staticRoot);
  Object.assign(G, { colliders: [], dyn: [], covers: [], actors: [], vehicles: [], projs: [], props: [], emitters: [], updaters: [], interactables: [], groundAt: () => 0, waterY: -999, objPos: null });
  clearParticles();
}

/* colliders */
function addCollider(minX, minY, minZ, maxX, maxY, maxZ, o = {}) {
  const c = { min: { x: minX, y: minY, z: minZ }, max: { x: maxX, y: maxY, z: maxZ }, bullet: o.bullet ?? true, move: o.move ?? true, ref: o.ref || null };
  (o.dyn ? G.dyn : G.colliders).push(c); return c;
}
function setColliderFromBox(c, cx, cy, cz, hx, hy, hz) { c.min.x = cx - hx; c.min.y = cy - hy; c.min.z = cz - hz; c.max.x = cx + hx; c.max.y = cy + hy; c.max.z = cz + hz; }

/* box placed with its bottom at y */
function addBox(x, y, z, w, h, d, material, o = {}) {
  const m = new THREE.Mesh(boxGeo(w, h, d, o.tile || 0), material);
  m.position.set(x, y + h / 2, z); m.rotation.y = o.rotY || 0;
  m.castShadow = o.cast ?? true; m.receiveShadow = o.receive ?? true;
  (o.parent || (o.dynamic ? G.world : G.staticRoot)).add(m);
  if (o.collide ?? true) {
    const r = o.rotY || 0; const cs = Math.abs(Math.cos(r)), sn = Math.abs(Math.sin(r));
    const hw = (w * cs + d * sn) / 2, hd = (w * sn + d * cs) / 2;
    m.userData.col = addCollider(x - hw, y, z - hd, x + hw, y + h, z + hd, o);
  }
  if (o.cover) G.covers.push(v3(x, y, z));
  return m;
}
function addMesh(geo, material, x, y, z, o = {}) {
  const m = new THREE.Mesh(geo, material); m.position.set(x, y, z);
  if (o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
  if (o.scale) m.scale.setScalar(o.scale);
  m.castShadow = o.cast ?? true; m.receiveShadow = o.receive ?? true;
  (o.parent || (o.dynamic ? G.world : G.staticRoot)).add(m); return m;
}

/* merge static geometry per material to cut draw calls */
function mergeStatic() {
  const groups = new Map();
  G.staticRoot.updateMatrixWorld(true);
  G.staticRoot.traverse((o) => {
    if (!o.isMesh) return;
    const key = o.material.uuid + (o.castShadow ? 'c' : '') + (o.receiveShadow ? 'r' : '');
    if (!groups.has(key)) groups.set(key, { mat: o.material, cast: o.castShadow, rec: o.receiveShadow, geos: [] });
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(o.matrixWorld); groups.get(key).geos.push(g);
    o.geometry.dispose();
  });
  G.world.remove(G.staticRoot);
  for (const grp of groups.values()) {
    let n = 0; for (const g of grp.geos) n += g.attributes.position.count;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    let o3 = 0, o2 = 0;
    for (const g of grp.geos) {
      pos.set(g.attributes.position.array, o3); nor.set(g.attributes.normal.array, o3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array, o2);
      o3 += g.attributes.position.count * 3; o2 += g.attributes.position.count * 2; g.dispose();
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); bg.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); bg.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    bg.computeBoundingSphere();
    const m = new THREE.Mesh(bg, grp.mat); m.castShadow = grp.cast; m.receiveShadow = grp.rec; G.world.add(m);
  }
  G.staticRoot = new THREE.Group(); G.world.add(G.staticRoot);
}

/* ---------------- collision math ---------------- */
function rayAABB(ox, oy, oz, dx, dy, dz, c, maxT) {
  let tmin = 0, tmax = maxT;
  const bmin = c.min, bmax = c.max;
  for (let a = 0; a < 3; a++) {
    const o = a === 0 ? ox : a === 1 ? oy : oz, d = a === 0 ? dx : a === 1 ? dy : dz;
    const lo = a === 0 ? bmin.x : a === 1 ? bmin.y : bmin.z, hi = a === 0 ? bmax.x : a === 1 ? bmax.y : bmax.z;
    if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) return -1; }
    else { let t1 = (lo - o) / d, t2 = (hi - o) / d; if (t1 > t2) { const s = t1; t1 = t2; t2 = s; } if (t1 > tmin) tmin = t1; if (t2 < tmax) tmax = t2; if (tmin > tmax) return -1; }
  }
  return tmin;
}
function raySphere(ox, oy, oz, dx, dy, dz, cx, cy, cz, r) {
  const lx = cx - ox, ly = cy - oy, lz = cz - oz; const tca = lx * dx + ly * dy + lz * dz; if (tca < 0) return -1;
  const d2 = lx * lx + ly * ly + lz * lz - tca * tca; if (d2 > r * r) return -1; return tca - Math.sqrt(r * r - d2);
}
/* world-only raycast. returns distance to first hit (or maxT) and normal axis */
const _hitN = v3();
function rayWorld(o, d, maxT, ignoreDyn = false, skip = null) {
  let best = maxT, bestC = null;
  const lists = ignoreDyn ? [G.colliders] : [G.colliders, G.dyn];
  for (const L of lists) for (const c of L) {
    if (!c.bullet) continue;
    if (skip && c.ref && skip.includes(c.ref)) continue;
    const t = rayAABB(o.x, o.y, o.z, d.x, d.y, d.z, c, best);
    if (t >= 0 && t < best) { best = t; bestC = c; }
  }
  // ground (heightfield) march
  if (d.y < 0 || G.groundAt !== flatGround) {
    const step = 1.5; for (let t = 0; t < best; t += step) {
      const x = o.x + d.x * t, y = o.y + d.y * t, z = o.z + d.z * t;
      if (y < G.groundAt(x, z)) { let a = t - step, b = t; for (let i = 0; i < 6; i++) { const m = (a + b) / 2; if (o.y + d.y * m < G.groundAt(o.x + d.x * m, o.z + d.z * m)) b = m; else a = m; } best = b; bestC = 'ground'; break; }
    }
  }
  if (bestC && bestC !== 'ground') {
    const px = o.x + d.x * best, py = o.y + d.y * best, pz = o.z + d.z * best; const c = bestC; const e = 0.02;
    _hitN.set(0, 0, 0);
    if (Math.abs(px - c.min.x) < e) _hitN.x = -1; else if (Math.abs(px - c.max.x) < e) _hitN.x = 1;
    else if (Math.abs(pz - c.min.z) < e) _hitN.z = -1; else if (Math.abs(pz - c.max.z) < e) _hitN.z = 1;
    else _hitN.y = 1;
  } else _hitN.set(0, 1, 0);
  return { t: best, c: bestC, n: _hitN };
}
function flatGround() { return 0; }
const _los = v3(), _losd = v3();
function hasLOS(a, b, skip) {
  _losd.subVectors(b, a); const L = _losd.length(); if (L < 0.01) return true; _losd.divideScalar(L);
  const r = rayWorld(a, _losd, L - 0.3, false, skip); return r.c === null;
}

/* circle-vs-AABB slide movement (XZ), returns true if blocked */
function moveCircle(pos, dx, dz, rad, feetY, height, maxPush = 0) {
  let blocked = false;
  const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / 0.25) || 1;
  for (let s = 0; s < steps; s++) {
    pos.x += dx / steps; pos.z += dz / steps;
    for (const L of [G.colliders, G.dyn]) for (const c of L) {
      if (!c.move) continue;
      if (c.max.y <= feetY + 0.55 || c.min.y >= feetY + height) continue;
      const nx = clamp(pos.x, c.min.x, c.max.x), nz = clamp(pos.z, c.min.z, c.max.z);
      let ddx = pos.x - nx, ddz = pos.z - nz; const d2 = ddx * ddx + ddz * ddz;
      if (d2 < rad * rad) {
        blocked = true;
        if (d2 > 1e-8) { const d = Math.sqrt(d2); let tx = nx + ddx / d * rad, tz = nz + ddz / d * rad; if (maxPush) { const px = tx - pos.x, pz = tz - pos.z, pl2 = Math.hypot(px, pz); if (pl2 > maxPush) { tx = pos.x + px / pl2 * maxPush; tz = pos.z + pz / pl2 * maxPush; } } pos.x = tx; pos.z = tz; }
        else { // inside: push out along the shortest axis (gradually when maxPush is set)
          const pl = pos.x - c.min.x, pr = c.max.x - pos.x, pb = pos.z - c.min.z, pf = c.max.z - pos.z; const m = Math.min(pl, pr, pb, pf);
          const k = maxPush ? Math.min(maxPush, m + rad) : m + rad;
          if (m === pl) pos.x -= k; else if (m === pr) pos.x += k; else if (m === pb) pos.z -= k; else pos.z += k;
        }
      }
    }
  }
  return blocked;
}
/* is a straight walk of length len along dir free of blocking colliders? (checks at knee and chest height) */
function probeFree(pos, dx, dz, len, feetY) {
  for (const hy of [0.7, 1.4]) { const oy = feetY + hy;
    for (const L of [G.colliders, G.dyn]) for (const c of L) {
      if (!c.move || c.max.y <= feetY + 0.55 || c.min.y >= feetY + 1.8) continue;
      const t = rayAABB(pos.x, oy, pos.z, dx, 0, dz, { min: { x: c.min.x - 0.3, y: c.min.y, z: c.min.z - 0.3 }, max: { x: c.max.x + 0.3, y: c.max.y, z: c.max.z + 0.3 } }, len);
      /* a step further along a stair is not a wall: its top only has to clear the climb a walker makes getting there (≈30° flight + one riser) */
      if (t >= 0 && t < len && (t < 0.6 || c.max.y > feetY + 0.55 + t * 0.62)) return false;
    } }
  return true;
}
function floorAt(x, z, feetY, rad = 0.25) {
  let y = G.groundAt(x, z);
  for (const L of [G.colliders, G.dyn]) for (const c of L) {
    if (!c.move) continue;
    if (x < c.min.x - rad * 0.5 || x > c.max.x + rad * 0.5 || z < c.min.z - rad * 0.5 || z > c.max.z + rad * 0.5) continue;
    if (c.max.y <= feetY + 0.6 && c.max.y > y) y = c.max.y;
  }
  return y;
}
