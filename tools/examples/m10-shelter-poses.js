// m10 「북쪽으로」 (MI=12 PH=0): close-ups of the shelter's people (lying, curled up, crying), and the flagpole clear of the trees
// PRE: `P.god = true; P.pos.copy(G.m10Sh.people[0].p); G.m10Sh.activate && G.m10Sh.activate();`
/* the camera goes to whichever side of the person has the most open floor (no collider within the view line) */
const near = (kind) => `(() => { const os = G.m10Sh.people.filter((q) => q.kind === '${kind}'); let best = null;
  for (const o of os) for (let a = 0; a < 6.28; a += 0.5) { const p = o.p, e = v3(p.x + Math.sin(a) * 3.0, p.y + 1.5, p.z + Math.cos(a) * 3.0), t = v3(p.x, p.y + 0.4, p.z), d = t.clone().sub(e), L = d.length(); d.normalize();
    const r = rayWorld(e, d, L, false, []); if (!r.c || r.t > L - 0.6) { best = [e.x, e.y, e.z, t.x, t.y, t.z]; break; } if (best) break; }
  return best || [os[0].p.x + 3, os[0].p.y + 1.5, os[0].p.z, os[0].p.x, os[0].p.y + 0.4, os[0].p.z]; })()`;
module.exports = [
  { name: 'pose_lie', when: `G.time > 0.5 && G.m10Sh && G.m10Sh.people.length`, cam: near('lie'), fov: 50 },
  { name: 'pose_curl', when: `G.time > 0.5`, cam: near('curl'), fov: 50 },
  { name: 'pose_cry', when: `G.time > 0.5`, cam: near('cry'), fov: 50 },
  { name: 'flagpole', when: `G.time > 0.5`, cam: `(() => { const f = G.m10F.poleBase, c = rtAt(RT.total - 140, -40); return [c.x, 3, c.z, f.x, 8, f.z]; })()`, fov: 45 },
];
