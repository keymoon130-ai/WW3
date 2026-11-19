/* ---------- the whole city as one build, shared by the sample and the two Seoul missions ---------- */
function hgCity(o = {}) {
  G.groundAt = hgGround; G.waterY = HG.water;
  hgRiver(); hgYeouido(); hgBridge(); hgAvenue(); hgBlocks(); hgYongsan(); hgRoute(); hgSeoulStation(); hgSungnyemun(); hgCityHall(); hgGwanghwamun(); hg63(o.tower63 || 'charred');
  if (o.war !== false) hgWar();
  if (o.stationDown) hgStationFall(true);
  if (o.gate) hgGateFire(o.gate);
  hgRealism();
}
/* 숭례문 on fire ('burn') or a month later, black and still smoking ('charred') */
function hgGateFire(level) {
  const g = RT.gatePos; if (!g) return;
  if (level === 'burn') { for (const [dx, dz, y, s] of [[-7, 7, 21, 5], [6, 7.5, 20, 5], [0, 5, 27, 6], [-12, 8, 16, 4], [11, 8.5, 16, 4], [0, 0, 31, 6], [-5, -6, 26, 5], [7, -6.5, 22, 4.5]]) { addEmitter(v3(g.x + dx, y, g.z + dz), 'fire', s, 40); } addEmitter(v3(g.x, 28, g.z), 'smoke', 7, 4); addEmitter(v3(g.x + 4, 30, g.z - 2), 'smoke', 6, 3);
    const l = new THREE.PointLight(0xff7a30, 60, 90, 1.6); l.position.set(g.x, 22, g.z + 6); G.world.add(l);
    // flame sheets on the roofs (they read from any distance; the particles add the movement up close)
    const ft = canvasTex(128, 256, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const gr = c.createRadialGradient(w / 2, h * 0.78, 4, w / 2, h * 0.6, h * 0.55); gr.addColorStop(0, 'rgba(255,240,180,1)'); gr.addColorStop(0.35, 'rgba(255,150,40,.9)'); gr.addColorStop(0.75, 'rgba(200,50,10,.45)'); gr.addColorStop(1, 'rgba(120,20,0,0)'); c.fillStyle = gr; c.beginPath(); c.moveTo(w * 0.15, h); c.quadraticCurveTo(w * (0.1 + i * 0.1), h * 0.4, w / 2 + rand(-20, 20), 0); c.quadraticCurveTo(w * (0.9 - i * 0.1), h * 0.4, w * 0.85, h); c.fill(); } });
    const fm = new THREE.MeshBasicMaterial({ map: ft, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, fog: false });
    const fl = []; for (const [dx, dz, y, s] of [[-7, 6, 18, 9], [6, 6.5, 18, 8], [0, 3, 24, 11], [-11, 7, 14, 6], [10, 7.5, 14, 6], [0, -1, 27, 9], [-5, -5, 22, 8], [6, -5.5, 20, 7]]) for (let k = 0; k < 2; k++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(s * 0.6, s), fm); m.position.set(g.x + dx, y + s * 0.45, g.z + dz); m.rotation.y = k * Math.PI / 2 + rand(0, 1); G.world.add(m); fl.push([m, rand(0, TAU), s]); }
    G.updaters.push((dt) => { if (G.mode !== 'play') return; for (const [m, ph, s] of fl) { const k = 1 + 0.18 * Math.sin(G.time * 9 + ph) + 0.1 * Math.sin(G.time * 23 + ph * 2); m.scale.set(1 + 0.1 * Math.sin(G.time * 7 + ph), k, 1); m.lookAt(camera.position.x, m.position.y, camera.position.z); m.rotateY(ph * 0.3); } l.intensity = 50 + 15 * Math.sin(G.time * 11); }); }
  else addEmitter(v3(g.x, 24, g.z), 'smoke', 2.2, 1);
}
/* the highest solid thing within r of (x, z), and the highest along a line: aircraft keep above these */
function hgTop(x, z, r) { let m = 0; for (const c of G.colliders) if (c.max.y > m && c.max.x > x - r && c.min.x < x + r && c.max.z > z - r && c.min.z < z + r) m = c.max.y; return m; }
function hgTopLine(a, b, r) { const L = Math.hypot(b.x - a.x, b.z - a.z), n = Math.max(1, Math.ceil(L / 12)); let m = 0; for (let i = 0; i <= n; i++) { const t = i / n; m = Math.max(m, hgTop(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, r)); } return m; }
/* ---------- the whole ride as one line: q = metres along it from the 노량진 end. Up to 삼각지 it is the straight 한강대로 (x = d, z = -q);
   after that it is the real route (rtAt). zq(s) gives the "z-equivalent" (-q) of a point s metres along the route, so the old
   z-based logic (colFront < z, colStop) carries on unchanged past the bends ---------- */
const HQ0 = 2160;
function hgPath(q, d = 0) { if (q <= HQ0) return { x: d, z: -q, yaw: 0 }; return rtAt(q - HQ0, d); }
function hgQ(p, hint) { if (p.z > -HQ0) return -p.z; rtInit(); const n = RT.X.length; let a = 0, b = n - 1, step = 6; if (hint > HQ0) { a = Math.max(0, Math.floor(hint - HQ0) - 120); b = Math.min(n - 1, a + 400); step = 1; }
  let best = 1e18, bi = a; for (let i = a; i <= b; i += step) { const d = (RT.X[i] - p.x) ** 2 + (RT.Z[i] - p.z) ** 2; if (d < best) { best = d; bi = i; } } return HQ0 + bi; }
function zq(s) { return -(HQ0 + s); }