// m10a 「수도」 (MI=11 PH=0): the real 경인고속도로, the 신월IC ramp line, the follow-on column arriving, 63빌딩 — with PRE=probe below
// the probe logs "PROBE pen …" whenever a ground vehicle's hull overlaps anything solid (walls, barriers, wrecks, buildings)
module.exports = [
  { name: 'xway', when: `G.phaseI === 0 && P.ride && P.pos.z < -140`, cam: null },
  { name: 'rampline', when: `G.phaseI === 1 && P.pos.z < -800`, cam: `[34, 22, -820, -4, 2, -960]`, fov: 60 },
  { name: 'arrive', when: `G.phaseI === 4 && G.vehicles.some((v) => v.type === 'bmp' && v.team === 'ally' && (v.cs || 0) > 5 && v.pos.z > -1440 + 60 && v.pos.z < -1440 + 140)`, cam: `[5, 2.2, -1440 + 8, -6, 2, -1440 + 120]`, fov: 60 },
  { name: 'roadend', when: `G.phaseI === 4 && G.cut && scene.fog.density < 0.002`, cam: `[-110, 38, -2620, -222, 0, -2760]`, fov: 60 },
  { name: 'end63', when: `G.phaseI === 4 && G.cut && scene.fog.density < 0.002`, cam: null },
];
module.exports.probe = `G.__pen = {}; G.updaters.push(() => { for (const v of G.vehicles) { if (v.air || !v.size || !v.alive) continue; const fx = -Math.sin(v.yaw), fz = -Math.cos(v.yaw), rx = -fz, rz = fx;
  for (const a of [-0.9, 0, 0.9]) for (const b of [-0.85, 0, 0.85]) { const px = v.pos.x + fx * v.size[2] * a + rx * v.size[0] * b, pz = v.pos.z + fz * v.size[2] * a + rz * v.size[0] * b, gy = G.groundAt(px, pz);
    for (const c of G.colliders) { if (px < c.min.x + 0.15 || px > c.max.x - 0.15 || pz < c.min.z + 0.15 || pz > c.max.z - 0.15 || c.max.y < gy + 0.5 || c.min.y > gy + 2) continue;
      const k = v.type + v.team + '@' + c.min.x.toFixed(0) + ',' + c.min.z.toFixed(0); if (G.__pen[k]) continue; G.__pen[k] = 1;
      console.log('PROBE pen ph' + G.phaseI + ' ' + v.type + ' ' + v.team + ' at ' + v.pos.x.toFixed(1) + ',' + v.pos.z.toFixed(1) + ' box ' + [c.min.x, c.min.y, c.min.z, c.max.x, c.max.y, c.max.z].map((n) => n.toFixed(1)).join(',')); } } } });`;
