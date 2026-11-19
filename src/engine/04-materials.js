/* ---------------- textures & materials ---------------- */
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4; return t;
}
function noiseFill(g, w, h, base, vary, n = 4000, sz = 3) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const v = rand(-vary, vary); g.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; g.fillRect(rand(0, w), rand(0, h), rand(1, sz), rand(1, sz)); }
}
const TX = {};
function tex(name) {
  if (TX[name]) return TX[name];
  let t;
  switch (name) {
    case 'snow': t = canvasTex(512, 512, (g, w, h) => { noiseFill(g, w, h, '#e2e7ed', 0.05, 16000, 3); for (let i = 0; i < 70; i++) { const x = rand(0, w), y = rand(0, h), r = rand(20, 90); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rand(0, 1) < 0.5 ? '170,182,200' : '255,255,255'},${rand(0.08, 0.2)})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } g.strokeStyle = 'rgba(150,165,185,.08)'; for (let i = 0; i < 24; i++) { g.lineWidth = rand(1, 3); g.beginPath(); const y = rand(0, h); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + rand(-30, 30), w * 0.7, y + rand(-30, 30), w, y + rand(-20, 20)); g.stroke(); } }); break;
    case 'snowdirt': t = canvasTex(512, 512, (g, w, h) => { noiseFill(g, w, h, '#cfd3d6', 0.07, 12000, 4); for (let i = 0; i < 70; i++) { const x = rand(0, w), y = rand(0, h), r = rand(14, 50); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${randi(80, 100)},${randi(72, 88)},${randi(62, 76)},${rand(0.12, 0.3)})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } g.strokeStyle = 'rgba(60,54,46,.16)'; for (let i = 0; i < 4; i++) { g.lineWidth = rand(6, 12); g.beginPath(); const x = rand(0, w); g.moveTo(x, 0); g.lineTo(x + rand(-30, 30), h); g.stroke(); } }); break;
    case 'dirt': t = canvasTex(512, 512, (g, w, h) => { noiseFill(g, w, h, '#5f5446', 0.1, 20000, 3); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${randi(110, 150)},${randi(100, 135)},${randi(85, 115)},${rand(0.3, 0.7)})`; const r = rand(1, 3.5); g.beginPath(); g.arc(rand(0, w), rand(0, h), r, 0, TAU); g.fill(); g.fillStyle = 'rgba(20,16,12,.35)'; g.fillRect(rand(0, w), rand(0, h), r, r * 0.6); } for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(40,34,28,${rand(0.1, 0.25)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(20, 70), rand(10, 30), rand(0, 3), 0, TAU); g.fill(); } }); break;
    case 'grass': t = canvasTex(512, 512, (g, w, h) => { noiseFill(g, w, h, '#4e5a3a', 0.1, 16000, 3); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(${randi(80, 110)},${randi(76, 96)},${randi(54, 70)},${rand(0.2, 0.45)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(10, 50), rand(6, 26), rand(0, 3), 0, TAU); g.fill(); } for (let i = 0; i < 5000; i++) { const x = rand(0, w), y = rand(0, h); g.strokeStyle = `rgba(${randi(60, 120)},${randi(80, 120)},${randi(40, 70)},${rand(0.25, 0.6)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rand(-2, 2), y - rand(3, 8)); g.stroke(); } }); break;
    case 'sand': t = canvasTex(512, 512, (g, w, h) => { noiseFill(g, w, h, '#b5a582', 0.07, 20000, 2); g.strokeStyle = 'rgba(120,104,76,.18)'; for (let y = 0; y < h; y += rand(10, 22)) { g.lineWidth = rand(1, 3); g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.03 + y) * 4); g.stroke(); } }); break;
    case 'concrete': t = canvasTex(512, 512, (g, w, h) => { noiseFill(g, w, h, '#8c8b86', 0.07, 18000, 2); for (let i = 0; i < 26; i++) { const x = rand(0, w); const gr = g.createLinearGradient(x, 0, x + rand(8, 26), 0); gr.addColorStop(0, 'rgba(50,48,44,0)'); gr.addColorStop(0.5, `rgba(50,48,44,${rand(0.05, 0.15)})`); gr.addColorStop(1, 'rgba(50,48,44,0)'); g.fillStyle = gr; g.fillRect(x, rand(0, h * 0.5), 26, rand(80, h)); } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${rand(0, 1) < 0.5 ? '60,58,54' : '170,168,160'},${rand(0.04, 0.1)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(10, 60), rand(6, 30), rand(0, 3), 0, TAU); g.fill(); } g.fillStyle = 'rgba(30,30,28,.3)'; for (let y = 0; y < h; y += 128) g.fillRect(0, y, w, 2); for (let x = 0; x < w; x += 256) g.fillRect(x, 0, 2, h); g.strokeStyle = 'rgba(20,20,20,.35)'; for (let i = 0; i < 7; i++) { g.lineWidth = rand(0.8, 1.6); g.beginPath(); let x = rand(0, w), y = rand(0, h); g.moveTo(x, y); for (let k = 0; k < 7; k++) { x += rand(-22, 22); y += rand(-22, 22); g.lineTo(x, y); } g.stroke(); } }); break;
    case 'asphalt': t = canvasTex(512, 512, (g, w, h) => { noiseFill(g, w, h, '#3d3e40', 0.09, 26000, 2); for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${randi(120, 170)},${randi(120, 165)},${randi(115, 155)},${rand(0.12, 0.35)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 2.2), rand(1, 2.2)); } for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(20,20,22,${rand(0.06, 0.16)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(30, 100), rand(12, 45), rand(0, 3), 0, TAU); g.fill(); } g.strokeStyle = 'rgba(12,12,14,.6)'; for (let i = 0; i < 6; i++) { g.lineWidth = rand(0.8, 2); g.beginPath(); let x = rand(0, w), y = rand(0, h); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += rand(-18, 18); y += rand(-18, 18); g.lineTo(x, y); } g.stroke(); } }); break;
    case 'road': t = canvasTex(512, 1024, (g, w, h) => { noiseFill(g, w, h, '#3c3d3f', 0.09, 40000, 2); for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${randi(120, 170)},${randi(120, 165)},${randi(115, 155)},${rand(0.12, 0.3)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 2.2), rand(1, 2.2)); } for (const x of [w * 0.25, w * 0.75]) { g.fillStyle = 'rgba(10,10,12,.22)'; g.fillRect(x - 40, 0, 26, h); g.fillRect(x + 14, 0, 26, h); } g.strokeStyle = 'rgba(12,12,14,.55)'; for (let i = 0; i < 8; i++) { g.lineWidth = rand(0.8, 2); g.beginPath(); let x = rand(0, w), y = rand(0, h); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += rand(-18, 18); y += rand(-18, 18); g.lineTo(x, y); } g.stroke(); } const paint = (x, y, ww, hh, c) => { g.fillStyle = c; g.fillRect(x, y, ww, hh); for (let i = 0; i < ww * hh / 6; i++) { g.fillStyle = 'rgba(60,60,62,.5)'; g.fillRect(x + rand(0, ww), y + rand(0, hh), rand(1, 3), rand(1, 3)); } }; paint(w / 2 - 12, 0, 8, h, '#c9b45a'); paint(w / 2 + 4, 0, 8, h, '#c9b45a'); for (let y = 0; y < h; y += 128) { paint(w * 0.25 - 4, y, 8, 68, 'rgba(225,225,222,.85)'); paint(w * 0.75 - 4, y, 8, 68, 'rgba(225,225,222,.85)'); } }); break;
    case 'wood': t = canvasTex(256, 256, (g, w, h) => { noiseFill(g, w, h, '#6b5238', 0.08, 3000, 2); for (let y = 0; y < h; y += 32) { g.fillStyle = `rgba(${randi(80, 120)},${randi(60, 90)},${randi(40, 60)},.35)`; g.fillRect(0, y, w, 32); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, y, w, 2); g.strokeStyle = 'rgba(40,26,16,.35)'; for (let k = 0; k < 5; k++) { g.lineWidth = 1; g.beginPath(); const yy = y + rand(4, 28); g.moveTo(0, yy); for (let x = 0; x <= w; x += 16) g.lineTo(x, yy + Math.sin(x * 0.05 + k) * 1.5); g.stroke(); } for (let k = 0; k < 2; k++) { g.fillStyle = 'rgba(30,20,12,.5)'; g.beginPath(); g.ellipse(rand(0, w), y + 16, rand(2, 5), rand(1.5, 3), 0, 0, TAU); g.fill(); } } }); break;
    case 'sandbag': t = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#8a7c5c'; g.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) { const x = c * 64 + (r % 2) * 32, y = r * 32; g.fillStyle = `hsl(42,${rand(18, 26)}%,${rand(38, 46)}%)`; g.beginPath(); g.roundRect(x + 2, y + 2, 60, 28, 10); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.stroke(); } }); break;
    case 'metal': t = canvasTex(256, 256, (g, w, h) => { noiseFill(g, w, h, '#6a6e6c', 0.05, 5000, 2); g.strokeStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 120; i++) { g.lineWidth = 1; g.beginPath(); const y = rand(0, h); g.moveTo(0, y); g.lineTo(w, y + rand(-3, 3)); g.stroke(); } for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(90,60,40,${rand(0.08, 0.2)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(4, 20), rand(3, 12), rand(0, 3), 0, TAU); g.fill(); } g.fillStyle = 'rgba(0,0,0,.35)'; for (let x = 0; x < w; x += 128) g.fillRect(x, 0, 2, h); for (let y = 8; y < h; y += 32) for (let x = 8; x < w; x += 128) { g.beginPath(); g.arc(x, y, 2, 0, TAU); g.fill(); } }); break;
    case 'rust': t = canvasTex(256, 256, (g, w, h) => { noiseFill(g, w, h, '#4a3a30', 0.1, 6000, 3); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${randi(110, 150)},${randi(60, 80)},${randi(30, 45)},${rand(0.15, 0.4)})`; g.beginPath(); g.ellipse(rand(0, w), rand(0, h), rand(4, 26), rand(3, 14), rand(0, 3), 0, TAU); g.fill(); } for (let i = 0; i < 20; i++) { const x = rand(0, w); g.fillStyle = 'rgba(70,40,24,.25)'; g.fillRect(x, rand(0, h * 0.5), rand(2, 5), rand(30, 120)); } }); break;
    case 'container': t = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#888'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { g.fillStyle = x % 16 ? 'rgba(0,0,0,.25)' : 'rgba(255,255,255,.12)'; g.fillRect(x, 0, 4, h); } }); break;
    case 'ice': t = canvasTex(256, 256, (g, w, h) => { noiseFill(g, w, h, '#b9cad6', 0.06, 3000, 6); g.strokeStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 18; i++) { g.beginPath(); let x = rand(0, w), y = rand(0, h); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += rand(-40, 40); y += rand(-40, 40); g.lineTo(x, y); } g.stroke(); } }); break;
    case 'brick': t = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#4a3a34'; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) { const x = c * 32 + (r % 2) * 16 + 1.5, y = r * 16 + 1.5; g.fillStyle = `hsl(${randi(8, 18)},${rand(25, 42)}%,${rand(27, 40)}%)`; g.fillRect(x, y, 29, 13); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x, y, 29, 2); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, y + 11, 29, 2); for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(0,0,0,${rand(0.05, 0.2)})`; g.fillRect(x + rand(0, 27), y + rand(0, 11), rand(1, 3), rand(1, 2)); } } for (let i = 0; i < 3; i++) { const x = rand(0, w); const gr = g.createLinearGradient(x, 0, x + 18, 0); gr.addColorStop(0, 'rgba(20,16,14,0)'); gr.addColorStop(0.5, 'rgba(20,16,14,.18)'); gr.addColorStop(1, 'rgba(20,16,14,0)'); g.fillStyle = gr; g.fillRect(x, 0, 18, h); } }); break;
    case 'tent': t = canvasTex(128, 128, (g, w, h) => noiseFill(g, w, h, '#5d6146', 0.06, 1500, 3)); break;
    case 'rok': t = camoTex(['#5b6142', '#3f4430', '#77704f', '#2c2f22']); break;
    case 'usmc': t = camoTex(['#8b7a58', '#6a5c41', '#a9976f', '#4e4532']); break;
    case 'enemy': t = camoTex(['#8b9198', '#6c7178', '#b7bcc0', '#4b5057']); break;
    case 'enemy2': t = camoTex(['#6f7560', '#565b4a', '#8a8d78', '#3e4236']); break;
    default:
      if (name.startsWith('facade')) {
        const [, hue, lit, broken] = name.split(':');
        t = canvasTex(128, 128, (g, w, h) => {
          noiseFill(g, w, h, `hsl(${hue},${8}%,${46}%)`, 0.07, 1200, 3);
          g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h - 10, w, 4);
          for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
            const x = 12 + i * 64, y = 18 + j * 64; const r = Math.random();
            let col = '#1d2228';
            if (r < +lit) col = `hsl(${rand(20, 40)},90%,${rand(45, 60)}%)`;
            else if (r < +lit + +broken) col = '#060707';
            g.fillStyle = '#2c2c2a'; g.fillRect(x - 3, y - 3, 46, 38);
            g.fillStyle = col; g.fillRect(x, y, 40, 32);
            if (col === '#1d2228') { g.fillStyle = 'rgba(150,170,190,.18)'; g.fillRect(x, y, 18, 32); }
            if (r >= +lit && r < +lit + +broken) { g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(x + 20, y + 4, 26, 18, 0, 0, TAU); g.fill(); }
          }
        });
      } else t = canvasTex(4, 4, (g) => { g.fillStyle = '#888'; g.fillRect(0, 0, 4, 4); });
  }
  TX[name] = t; return t;
}
function camoTex(cols) {
  return canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = cols[0]; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.fillStyle = cols[randi(1, cols.length - 1)]; const s = pick([2, 3, 4]); g.fillRect(randi(0, 31) * 2, randi(0, 31) * 2, s, s); }
  });
}
const MATS = {};
function mat(key, o = {}) {
  if (MATS[key]) return MATS[key];
  const p = { color: o.color ?? 0xffffff, roughness: o.rough ?? 0.9, metalness: o.metal ?? 0 };
  if (o.map) p.map = tex(o.map);
  if (o.emissive) { p.emissive = new THREE.Color(o.emissive); p.emissiveIntensity = o.ei ?? 1; }
  if (o.transparent) { p.transparent = true; p.opacity = o.opacity ?? 1; p.depthWrite = o.depthWrite ?? false; }
  if (o.side) p.side = o.side;
  MATS[key] = new THREE.MeshStandardMaterial(p);
  return MATS[key];
}
const basicMat = (key, color, o = {}) => MATS[key] || (MATS[key] = new THREE.MeshBasicMaterial(Object.assign({ color }, o)));

/* ---------------- geometry helpers ---------------- */
function boxGeo(w, h, d, tile = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (tile) {
    const uv = g.attributes.uv; const spans = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * spans[f][0] / tile, uv.getY(k) * spans[f][1] / tile); }
  }
  return g;
}
