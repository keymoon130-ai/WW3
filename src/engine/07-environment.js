/* ---------------- environment ---------------- */
function applyEnv(e) {
  G.env = Object.assign({ sky: [0x0a0f16, 0x1c2430, 0x262c33], glow: 0x000000, glowDir: [0, 0.1, -1], fog: 0x1c2228, fogD: 0.012, hemi: [0x8090a8, 0x202020, 0.35], sun: [0x9fb0c8, 0.5], sunDir: [-0.4, 1, 0.3], exposure: 1, stars: false, snow: 0, wind: 0.5, viewDist: 70, flashes: 0, battle: 0.3, windSnd: 0.4 }, e);
  const E = G.env;
  skyMat.uniforms.top.value.set(E.sky[0]); skyMat.uniforms.mid.value.set(E.sky[1]); skyMat.uniforms.bot.value.set(E.sky[2]);
  skyMat.uniforms.glowCol.value.set(E.glow); skyMat.uniforms.glowDir.value.set(...E.glowDir).normalize();
  scene.fog = new THREE.FogExp2(E.fog, E.fogD);
  for (const s of [PS.add, PS.norm]) { s.mat.uniforms.fogColor.value.set(E.fog); s.mat.uniforms.fogDensity.value = E.fogD; }
  hemi.color.set(E.hemi[0]); hemi.groundColor.set(E.hemi[1]); hemi.intensity = Math.max(E.hemi[2] * 1.35, E.night ? 0.8 : 0.75); G.hemiBase = hemi.intensity; G.hemiGround = hemi.groundColor.clone();
  sun.color.set(E.sun[0]); sun.intensity = E.sun[1];
  renderer.toneMappingExposure = E.exposure * 1.12;
  stars.visible = !!E.stars;
  vmHemi.color.set(E.hemi[0]); vmHemi.intensity = 0.6 + E.hemi[2] * 1.4; vmDir.color.set(E.sun[0]); vmDir.intensity = 0.4 + E.sun[1] * 1.2;
  snowMat.color.set(E.ash ? 0x9a9a9a : 0xffffff); snowMat.size = E.ash ? 0.09 : (E.snow > 1 ? 0.15 : 0.11);
}

/* terrain from heightfield */
function buildTerrain(size, seg, texName, tile = 8, colorTint = 0xffffff, cx = 0, cz = 0) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + cx, z = p.getZ(i) + cz; p.setX(i, x); p.setZ(i, z); p.setY(i, G.groundAt(x, z)); uv.setXY(i, x / tile, z / tile); }
  g.computeVertexNormals();
  // walk on exactly what is drawn: sample the same triangles the mesh uses (no sinking into slopes the grid smooths over)
  { const orig = G.groundAt, n = seg + 1, cell = size / seg, x0 = cx - size / 2, z0 = cz - size / 2, H = new Float32Array(n * n);
    for (let i = 0; i < p.count; i++) H[i] = p.getY(i);
    const zi = (iz) => (iz); // PlaneGeometry rows run from +y to -y, which after the rotation is -z to +z
    G.groundAt = (x, z) => {
      const fx = (x - x0) / cell, fz = (z - z0) / cell; if (fx < 0 || fz < 0 || fx >= seg || fz >= seg) return orig(x, z);
      const ix = Math.floor(fx), iz = Math.floor(fz), u = fx - ix, v = fz - iz;
      const a = H[ix + n * zi(iz)], d = H[ix + 1 + n * zi(iz)], b = H[ix + n * zi(iz + 1)], c = H[ix + 1 + n * zi(iz + 1)];
      return u + v <= 1 ? a + (d - a) * u + (b - a) * v : c + (b - c) * (1 - u) + (d - c) * (1 - v);
    };
    G.groundAnalytic = orig; }
  const m = new THREE.Mesh(g, mat('terrain_' + texName + colorTint, { map: texName, color: colorTint }));
  m.receiveShadow = true; G.world.add(m); return m;
}
/* distant mountains ring */
function buildMountains(r = 700, n = 40, col = 0x9aa3ad, hmin = 60, hmax = 180, snowcap = true, cx = 0, cz = 0) {
  const m1 = mat('mtn' + col, { color: col, rough: 1 }); const m2 = mat('mtnsnow', { color: 0xe6ebf0, rough: 1 });
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rand(-0.05, 0.05), rr = r * rand(0.85, 1.15), h = rand(hmin, hmax), w = rand(120, 240);
    const geo = new THREE.ConeGeometry(w, h, 6, 1); const mm = new THREE.Mesh(geo, m1);
    mm.position.set(cx + Math.cos(a) * rr, h / 2 - 8, cz + Math.sin(a) * rr); mm.rotation.y = rand(0, TAU); mm.castShadow = false; G.world.add(mm);
    if (snowcap) { const cap = new THREE.Mesh(new THREE.ConeGeometry(w * 0.36, h * 0.36, 6, 1), m2); cap.position.set(mm.position.x, h - 8 - h * 0.18 + 0.5, mm.position.z); cap.rotation.y = mm.rotation.y; G.world.add(cap); }
  }
}
