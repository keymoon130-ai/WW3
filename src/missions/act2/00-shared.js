/* =========================================================
   ACT 2 「대후퇴」
   ========================================================= */
function parkedTank(x, z, rot = 0, col = 0x4f5539, apc = false) { const t = makeTankMesh(col, apc); t.root.position.set(x, G.groundAt(x, z), z); t.root.rotation.y = rot; G.staticRoot.add(t.root); const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot)); const hx = (1.8 * c + 3.5 * s) * VSCALE, hz = (1.8 * s + 3.5 * c) * VSCALE; addCollider(x - hx, G.groundAt(x, z), z - hz, x + hx, G.groundAt(x, z) + 2.6 * VSCALE, z + hz); G.covers.push(v3(x + hx + 1, 0, z), v3(x - hx - 1, 0, z)); return t; }
function parkedHeli(x, z, rot = 0, attack = false) { const h = makeHeliMesh(0x3e4336, attack); h.root.position.set(x, G.groundAt(x, z) + 1.3, z); h.root.rotation.y = rot; G.world.add(h.root); addCollider(x - 1.4, 0, z - 4, x + 1.4, 2.6, z + 4); return h; }
function corridor(x0, z0, x1, z1, w = 5, h = 4, m) {
  const y = G.groundAt((x0 + x1) / 2, (z0 + z1) / 2); m = m || mat('rock', { map: 'concrete', color: 0x5a554e });
  if (x0 === x1) { const L = Math.abs(z1 - z0), cz = (z0 + z1) / 2; addBox(x0 - w / 2, y, cz, 0.6, h, L, m, { tile: 2 }); addBox(x0 + w / 2, y, cz, 0.6, h, L, m, { tile: 2 }); addBox(x0, y + h, cz, w + 1.2, 0.6, L, m, { tile: 2 }); }
  else { const L = Math.abs(x1 - x0), cx = (x0 + x1) / 2; addBox(cx, y, z0 - w / 2, L, h, 0.6, m, { tile: 2 }); addBox(cx, y, z0 + w / 2, L, h, 0.6, m, { tile: 2 }); addBox(cx, y + h, z0, L, 0.6, w + 1.2, m, { tile: 2 }); }
  // timber supports + lamps
  const n = Math.floor(Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0)) / 8);
  for (let i = 1; i < n; i++) { const t = i / n; const x = lerp(x0, x1, t), z = lerp(z0, z1, t); if (x0 === x1) { addBox(x - w / 2 + 0.4, y, z, 0.25, h, 0.25, MT.wood(), { collide: false }); addBox(x + w / 2 - 0.4, y, z, 0.25, h, 0.25, MT.wood(), { collide: false }); addBox(x, y + h - 0.3, z, w, 0.25, 0.25, MT.wood(), { collide: false }); } else { addBox(x, y, z - w / 2 + 0.4, 0.25, h, 0.25, MT.wood(), { collide: false }); addBox(x, y, z + w / 2 - 0.4, 0.25, h, 0.25, MT.wood(), { collide: false }); addBox(x, y + h - 0.3, z, 0.25, 0.25, w, MT.wood(), { collide: false }); } if (i % 2) glow(x, y + h - 0.5, z, 0xffb060, 0.8); }
}

/* ========== MISSION 6 「공백」 ========== */