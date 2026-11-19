/* ---------------- particles ---------------- */
const PMAX = 5000;
function makePSystem(additive) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(PMAX * 3), col = new Float32Array(PMAX * 3), size = new Float32Array(PMAX), alpha = new Float32Array(PMAX);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('pcolor', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  geo.boundingSphere = new THREE.Sphere(v3(), 1e6);
  geo.userData.keep = true;
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: { uScale: { value: 500 }, fogColor: { value: new THREE.Color() }, fogDensity: { value: 0 } },
    vertexShader: `attribute float size; attribute float alpha; attribute vec3 pcolor; uniform float uScale;
      varying float vA; varying vec3 vC; varying float vD;
      void main(){ vA=alpha; vC=pcolor; vec4 mv=modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_PointSize=min(size*uScale/max(-mv.z,0.1), 900.0); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 fogColor; uniform float fogDensity; varying float vA; varying vec3 vC; varying float vD;
      void main(){ vec2 p=gl_PointCoord-0.5; float d=length(p); if(d>0.5) discard;
        float a=vA*smoothstep(0.5,${additive ? '0.0' : '0.15'},d); float f=1.0-exp(-fogDensity*fogDensity*vD*vD);
        ${additive ? 'gl_FragColor=vec4(vC*a*(1.0-f),1.0);' : 'gl_FragColor=vec4(mix(vC,fogColor,f),a);'} }`,
  });
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false; pts.renderOrder = additive ? 5 : 4;
  scene.add(pts);
  return { pts, geo, mat: m, pos, col, size, alpha, n: 0,
    d: { vx: new Float32Array(PMAX), vy: new Float32Array(PMAX), vz: new Float32Array(PMAX), age: new Float32Array(PMAX), life: new Float32Array(PMAX), s0: new Float32Array(PMAX), s1: new Float32Array(PMAX), a0: new Float32Array(PMAX), grav: new Float32Array(PMAX), drag: new Float32Array(PMAX), c0: new Float32Array(PMAX * 3), c1: new Float32Array(PMAX * 3) }, head: 0 };
}
const PS = { add: makePSystem(true), norm: makePSystem(false) };
function updateParticleScale() {
  const s = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  PS.add.mat.uniforms.uScale.value = PS.norm.mat.uniforms.uScale.value = s;
}
function clearParticles() { for (const s of [PS.add, PS.norm]) { s.d.life.fill(0); s.alpha.fill(0); } }
/* spawn one particle. o: {x,y,z,vx,vy,vz,life,size,size1,alpha,color,color1,grav,drag,add} */
function particle(o) {
  const S = o.add ? PS.add : PS.norm; const i = S.head; S.head = (S.head + 1) % PMAX; const d = S.d;
  S.pos[i * 3] = o.x; S.pos[i * 3 + 1] = o.y; S.pos[i * 3 + 2] = o.z;
  d.vx[i] = o.vx || 0; d.vy[i] = o.vy || 0; d.vz[i] = o.vz || 0; d.age[i] = 0; d.life[i] = o.life || 1;
  d.s0[i] = o.size || 0.3; d.s1[i] = o.size1 ?? d.s0[i]; d.a0[i] = o.alpha ?? 1; d.grav[i] = o.grav || 0; d.drag[i] = o.drag ?? 0.5;
  const c0 = o.color || [1, 1, 1], c1 = o.color1 || c0;
  d.c0[i * 3] = c0[0]; d.c0[i * 3 + 1] = c0[1]; d.c0[i * 3 + 2] = c0[2]; d.c1[i * 3] = c1[0]; d.c1[i * 3 + 1] = c1[1]; d.c1[i * 3 + 2] = c1[2];
}
function updateParticles(dt) {
  for (const S of [PS.add, PS.norm]) {
    const d = S.d;
    for (let i = 0; i < PMAX; i++) {
      if (d.life[i] <= 0) continue;
      d.age[i] += dt; const k = d.age[i] / d.life[i];
      if (k >= 1) { d.life[i] = 0; S.alpha[i] = 0; continue; }
      const dr = Math.exp(-d.drag[i] * dt);
      d.vx[i] *= dr; d.vz[i] *= dr; d.vy[i] = d.vy[i] * dr - d.grav[i] * dt;
      S.pos[i * 3] += d.vx[i] * dt; S.pos[i * 3 + 1] += d.vy[i] * dt; S.pos[i * 3 + 2] += d.vz[i] * dt;
      S.size[i] = lerp(d.s0[i], d.s1[i], k);
      S.alpha[i] = d.a0[i] * (k < 0.1 ? k / 0.1 : 1 - (k - 0.1) / 0.9);
      for (let c = 0; c < 3; c++) S.col[i * 3 + c] = lerp(d.c0[i * 3 + c], d.c1[i * 3 + c], k);
    }
    for (const a of ['position', 'pcolor', 'size', 'alpha']) S.geo.attributes[a].needsUpdate = true;
  }
}
/* effect presets */
const FX = {
  dust(p, n = 6, col = [0.55, 0.5, 0.45], s = 0.25) { for (let i = 0; i < n; i++) particle({ x: p.x, y: p.y, z: p.z, vx: rand(-1, 1), vy: rand(0.5, 2.5), vz: rand(-1, 1), life: rand(0.4, 0.9), size: s, size1: s * 4, alpha: 0.6, color: col, grav: 2, drag: 2 }); },
  sparks(p, n = 6) { if (SET.sparks === false) return; for (let i = 0; i < n; i++) particle({ add: true, x: p.x, y: p.y, z: p.z, vx: rand(-4, 4), vy: rand(1, 5), vz: rand(-4, 4), life: rand(0.15, 0.4), size: 0.06, alpha: 1, color: [1, 0.8, 0.4], color1: [1, 0.3, 0.05], grav: 12, drag: 1 }); },
  blood(p) { for (let i = 0; i < 6; i++) particle({ x: p.x, y: p.y, z: p.z, vx: rand(-1.2, 1.2), vy: rand(-0.2, 1.5), vz: rand(-1.2, 1.2), life: rand(0.3, 0.6), size: 0.12, size1: 0.35, alpha: 0.8, color: [0.4, 0.03, 0.03], grav: 6, drag: 3 }); },
  snowPuff(p) { for (let i = 0; i < 8; i++) particle({ x: p.x, y: p.y, z: p.z, vx: rand(-1, 1), vy: rand(1, 3), vz: rand(-1, 1), life: rand(0.5, 1.1), size: 0.2, size1: 0.7, alpha: 0.7, color: [0.92, 0.94, 0.97], grav: 3, drag: 2 }); },
  splash(p, big = 1) { for (let i = 0; i < 14 * big; i++) particle({ x: p.x + rand(-0.5, 0.5) * big, y: p.y, z: p.z + rand(-0.5, 0.5) * big, vx: rand(-2, 2) * big, vy: rand(3, 9) * Math.sqrt(big), vz: rand(-2, 2) * big, life: rand(0.6, 1.4), size: 0.3 * big, size1: 1 * big, alpha: 0.7, color: [0.8, 0.86, 0.9], grav: 9, drag: 0.5 }); },
  muzzle(p, dir, big = 1) { if (SET.sparks === false) return;
    for (let i = 0; i < 4; i++) { const k = rand(0.1, 0.7); particle({ add: true, x: p.x + dir.x * k * 0.4 * big, y: p.y + dir.y * k * 0.4 * big, z: p.z + dir.z * k * 0.4 * big, life: 0.05, size: 0.25 * big * (1 - k * 0.6), alpha: 1, color: [1, 0.75, 0.35] }); }
    particle({ x: p.x, y: p.y, z: p.z, vx: dir.x * 2, vy: 0.4, vz: dir.z * 2, life: 0.6, size: 0.15 * big, size1: 0.6 * big, alpha: 0.25, color: [0.7, 0.7, 0.7], drag: 2 });
  },
  explosion(p, s = 1) {
    for (let i = 0; i < 26 * s; i++) particle({ add: true, x: p.x, y: p.y + 0.5, z: p.z, vx: rand(-6, 6) * s, vy: rand(1, 9) * s, vz: rand(-6, 6) * s, life: rand(0.25, 0.7), size: rand(1, 2.5) * s, size1: rand(2, 4) * s, alpha: 1, color: [1, 0.85, 0.5], color1: [0.9, 0.25, 0.05], drag: 4 });
    for (let i = 0; i < 22 * s; i++) particle({ x: p.x + rand(-1, 1) * s, y: p.y + rand(0, 1.5) * s, z: p.z + rand(-1, 1) * s, vx: rand(-3, 3) * s, vy: rand(1, 6) * s, vz: rand(-3, 3) * s, life: rand(2.5, 5), size: rand(1.5, 3) * s, size1: rand(5, 9) * s, alpha: 0.75, color: [0.22, 0.2, 0.19], color1: [0.42, 0.41, 0.4], drag: 1.6, grav: -0.4 });
    for (let i = 0; i < 18 * s; i++) particle({ x: p.x, y: p.y + 0.3, z: p.z, vx: rand(-10, 10) * s, vy: rand(5, 16) * s, vz: rand(-10, 10) * s, life: rand(1, 2), size: rand(0.1, 0.3) * s, alpha: 1, color: [0.15, 0.13, 0.12], grav: 18, drag: 0.3 });
    for (let i = 0; i < 16 * s; i++) particle({ add: true, x: p.x, y: p.y + 0.4, z: p.z, vx: rand(-14, 14) * s, vy: rand(4, 14) * s, vz: rand(-14, 14) * s, life: rand(0.4, 1.1), size: 0.12, alpha: 1, color: [1, 0.7, 0.3], color1: [1, 0.2, 0], grav: 14, drag: 0.6 });
  },
  smokeTrail(p, s = 1) { particle({ x: p.x, y: p.y, z: p.z, vx: rand(-0.3, 0.3), vy: rand(0.2, 0.6), vz: rand(-0.3, 0.3), life: rand(1.2, 2.2), size: 0.25 * s, size1: 1.4 * s, alpha: 0.45, color: [0.75, 0.75, 0.74], drag: 1.2 }); particle({ add: true, x: p.x, y: p.y, z: p.z, life: 0.08, size: 0.35 * s, color: [1, 0.7, 0.3] }); },
  fire(p, s = 1) {
    particle({ add: true, x: p.x + rand(-0.6, 0.6) * s, y: p.y + rand(0, 0.4), z: p.z + rand(-0.6, 0.6) * s, vy: rand(1.5, 3.5) * s, life: rand(0.4, 0.9), size: rand(0.6, 1.2) * s, size1: 0.2, alpha: 0.9, color: [1, 0.6, 0.2], color1: [0.8, 0.15, 0.02], drag: 1 });
    if (Math.random() < 0.5) particle({ x: p.x + rand(-0.4, 0.4) * s, y: p.y + 1.2 * s, z: p.z + rand(-0.4, 0.4) * s, vx: rand(-0.4, 0.4) + (G.env.wind || 0) * 0.3, vy: rand(1.5, 3) * s, vz: rand(-0.4, 0.4), life: rand(3, 6), size: 0.8 * s, size1: 5 * s, alpha: 0.55, color: [0.12, 0.11, 0.1], color1: [0.3, 0.29, 0.28], drag: 0.6, grav: -0.2 });
  },
  flare(p) { particle({ add: true, x: p.x, y: p.y, z: p.z, life: 0.12, size: 1.2, alpha: 1, color: [1, 0.3, 0.25] }); },
  firework(p, col, sc = 1) {
    const c = col || pick([[1, 0.4, 0.3], [1, 0.85, 0.4], [0.5, 0.8, 1], [0.6, 1, 0.6], [1, 0.5, 0.9]]);
    const n = sc > 1 ? 140 : 90;
    for (let i = 0; i < n; i++) { const t = rand(0, TAU), ph = Math.acos(rand(-1, 1)), sp = rand(9, 13) * sc; particle({ add: true, x: p.x, y: p.y, z: p.z, vx: Math.cos(t) * Math.sin(ph) * sp, vy: Math.cos(ph) * sp, vz: Math.sin(t) * Math.sin(ph) * sp, life: rand(1.4, 2.4), size: 0.55 * sc, size1: 0.2 * sc, alpha: 1, color: c, color1: [c[0] * 0.6, c[1] * 0.3, c[2] * 0.2], grav: 3 * Math.sqrt(sc), drag: 1.4 }); }
    if (sc > 1) for (let i = 0; i < 6; i++) particle({ add: true, x: p.x, y: p.y, z: p.z, life: 0.35, size: 6 * sc, size1: 2 * sc, alpha: 0.8, color: [1, 0.95, 0.85] });
  },
};
/* continuous emitters */
function addEmitter(pos, kind, scale = 1, rate = 30, life = Infinity) { const e = { pos: pos.clone(), kind, scale, rate, life, acc: 0 }; G.emitters.push(e); return e; }
function updateEmitters(dt) {
  for (let i = G.emitters.length - 1; i >= 0; i--) {
    const e = G.emitters[i]; e.life -= dt; if (e.life <= 0) { G.emitters.splice(i, 1); continue; }
    if (e.pos.distanceToSquared(camera.position) > 400 * 400) continue;
    e.acc += e.rate * dt;
    while (e.acc >= 1) { e.acc--; if (e.kind === 'fire') FX.fire(e.pos, e.scale); else if (e.kind === 'smoke') particle({ x: e.pos.x + rand(-1, 1) * e.scale, y: e.pos.y, z: e.pos.z + rand(-1, 1) * e.scale, vx: (G.env.wind || 0.5) * 0.6 + rand(-0.3, 0.3), vy: rand(1.5, 3), vz: rand(-0.3, 0.3), life: rand(6, 10), size: 2 * e.scale, size1: 9 * e.scale, alpha: 0.5, color: [0.16, 0.15, 0.15], color1: [0.36, 0.35, 0.35], drag: 0.3, grav: -0.1 }); else if (e.kind === 'steam') particle({ x: e.pos.x, y: e.pos.y, z: e.pos.z, vy: 0.8, vx: rand(-0.2, 0.2), life: 3, size: 0.5, size1: 2.5, alpha: 0.2, color: [0.9, 0.9, 0.9], drag: 0.5 }); }
  }
}

/* snow / ash weather */
const SNOWN = 5000;
const snowGeo = new THREE.BufferGeometry();
const snowPos = new Float32Array(SNOWN * 3);
for (let i = 0; i < SNOWN; i++) { snowPos[i * 3] = rand(-45, 45); snowPos[i * 3 + 1] = rand(-5, 30); snowPos[i * 3 + 2] = rand(-45, 45); }
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3).setUsage(THREE.DynamicDrawUsage));
snowGeo.userData.keep = true;
const snowDot = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.11, map: snowDot, transparent: true, opacity: 0.9, depthWrite: false });
const snow = new THREE.Points(snowGeo, snowMat); snow.frustumCulled = false; scene.add(snow);
function updateSnow(dt) {
  const amt = G.env.snow || 0; snow.visible = amt > 0; if (!snow.visible) return;
  const n = Math.floor(SNOWN * Math.min(1, amt)); snowGeo.setDrawRange(0, n);
  const fall = G.env.snowFall || 1.3, wind = G.env.wind || 0.5; const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
  for (let i = 0; i < n; i++) {
    let x = snowPos[i * 3] + (wind + Math.sin(G.time * 0.7 + i) * 0.3) * dt, y = snowPos[i * 3 + 1] - fall * dt * (0.7 + (i % 7) * 0.08), z = snowPos[i * 3 + 2] + Math.cos(G.time * 0.5 + i) * 0.2 * dt;
    if (y < cy - 6) y += 34; if (y > cy + 28) y -= 34;
    if (x < cx - 45) x += 90; if (x > cx + 45) x -= 90; if (z < cz - 45) z += 90; if (z > cz + 45) z -= 90;
    snowPos[i * 3] = x; snowPos[i * 3 + 1] = y; snowPos[i * 3 + 2] = z;
  }
  snowGeo.attributes.position.needsUpdate = true;
}
