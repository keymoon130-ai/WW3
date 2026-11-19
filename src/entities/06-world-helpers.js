/* ---------------- world helpers for missions ---------------- */
function enemy(x, z, o = {}) { return new Actor('enemy', x, z, o); }
function ally(x, z, o = {}) { const a = new Actor('ally', x, z, o); if (!a.name) a.name = randSoldierName(o.style || G.allyStyle); return a; }
/* every soldier gets a name, so the dead are people */
const SUR = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍', '유', '고', '문', '양', '손', '배', '백', '허', '노', '남'];
const GIV = ['도윤', '서준', '민준', '하준', '지호', '준우', '현우', '건우', '우진', '선우', '지훈', '승민', '태윤', '민재', '시우', '유찬', '은호', '재원', '동현', '성민', '준혁', '영호', '태민', '정우', '상훈', '경수', '진혁', '세진', '형준', '대현'];
const US_N = ['존슨', '가르시아', '데이비스', '로드리게스', '윌슨', '앤더슨', '토머스', '잭슨', '화이트', '해리스', '마틴', '톰슨', '클라크', '루이스', '워커', '홀', '영', '킹', '라이트', '스콧'];
const RANKS_K = ['이병', '일병', '일병', '상병', '상병', '병장', '병장', '하사'], RANKS_U = ['이병', '일병', '상병', '상병', '병장'];
/* random names never echo a named character's name (no 윤선우 next to 리선우) */
const CAST_GIV = ['지운', '도현', '선우', '하린', '한준'], CAST_US = ['콜', '로페즈', '레예스', '밀러', '브룩스'];
function randSoldierName(style) {
  const sq = Object.values((G.S && G.S.sq) || {}).map((a) => personOf(a.name));
  if (style === 'usmc') { const pool = US_N.filter((n) => !CAST_US.includes(n) && !sq.includes(n)); return pick(pool) + ' ' + pick(RANKS_U); }
  const taken = new Set([...CAST_GIV, ...sq.map((n) => n.slice(1))]); const g = pick(GIV.filter((x) => !taken.has(x))); return pick(SUR) + g + ' ' + pick(RANKS_K);
}
const RANK_ORDER = ['이병', '일병', '상병', '병장', '하사', '중사', '상사', '원사', '소위', '중위', '대위', '소령', '중령', '대령'];
function rankOf(name) { const t = (name || '').trim().split(/\s+/); for (let i = t.length - 1; i >= 0; i--) { const r = RANK_ORDER.indexOf(t[i]); if (r >= 0) return r; } return -1; }
function personOf(name) { return (name || '').trim().split(/\s+/)[0]; }
function vocative(given) { const c = given.charCodeAt(given.length - 1) - 0xac00; return given + (c >= 0 && c < 11172 && c % 28 ? '아' : '야'); }
function civ(x, z, o = {}) { return new Actor('civ', x, z, o); }

/* ---- what happens around a death: blood, fire, someone noticing ---- */
const POOLG = new THREE.CircleGeometry(1, 14); POOLG.rotateX(-Math.PI / 2); POOLG.userData.keep = true;
function onActorDeath(a, src) {
  if (a.team === 'civ' && !a.o.blood) return;
  setGameTimeout(() => {
    if (!a.m || !a.m.root.parent) return;
    const m = new THREE.Mesh(POOLG, new THREE.MeshStandardMaterial({ color: 0x3a0806, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false }));
    const y = floorAt(a.pos.x, a.pos.z, a.pos.y + 0.5) + 0.02; m.position.set(a.pos.x + rand(-0.3, 0.3), y, a.pos.z + rand(-0.3, 0.3)); m.scale.setScalar(0.05); G.world.add(m);
    G.pools = G.pools || []; G.pools.push(m); if (G.pools.length > 70) { const o = G.pools.shift(); G.world.remove(o); o.material.dispose(); }
    let t = 0; const R = rand(0.55, 0.95); G.updaters.push((dt) => { t += dt; m.scale.setScalar(Math.min(R, 0.05 + t * 0.12)); return t > 9; });
  }, 0.7);
  if (a.team === 'ally' && !a.hero && a.name && G.mode === 'play') { try { const L = store.get('tumen_fallen', []); if (L.length < 400 && !L.includes(a.name)) { L.push(a.name); store.set('tumen_fallen', L); } } catch (e) {} }
  if (a.team === 'ally' && !a.hero && G.mode === 'play' && !G.cut) allyDownLine(a);
}
function igniteBody(a) {
  const e = addEmitter(a.pos.clone().add(v3(0, 0.5, 0)), 'fire', 0.45, 14, rand(10, 16)); let t = 0;
  G.updaters.push((dt) => { t += dt; if (!a.m) return true; e.pos.copy(a.pos).add(v3(0, 0.4, 0)); if (t > 3 && !a.charred) { a.charred = true; a.m.root.traverse((c) => { if (c.isMesh) c.material = MT.burnt(); }); } return t > 16; });
  if (Math.random() < 0.5) setGameTimeout(() => SFX.scream && SFX.scream(a.pos), 0.2);
}
function allyDownLine(a) {
  if ((G.downCd || 0) > G.time) return; G.downCd = G.time + 7;
  const near = G.actors.filter((b) => b.alive && b.team === 'ally' && b !== a && b.pos.distanceTo(a.pos) < 30 && b.name).sort((x, y) => (y.hero ? 1 : 0) - (x.hero ? 1 : 0));
  const sp = near[0]; if (!sp) return;
  const full = personOf(a.name), given = full.length > 2 ? full.slice(1) : full, rk = (a.name.split(' ')[1] || '');
  const lines = rankOf(sp.name) > rankOf(a.name) ? [`${vocative(given)}!`, `${full}! 젠장!`, `${full} 쓰러졌다!`, `${vocative(given)}! 정신 차려!`] : [`${full} ${rk}님!`, `${rk}님이 당했습니다!`, `${full} ${rk}님 쓰러졌습니다!`];
  setGameTimeout(() => { if (sp.alive) subtitle(sp.name, pick(lines), 2); }, 0.6);
}
function alertNear(src, r) { for (const a of G.actors) { if (!a.alive || a.team !== 'enemy' || a === src || a.state === 'combat') continue; const d = a.pos.distanceTo(src.pos); if (d < r || (d < r * 2 && hasLOS(a.eye(v3()), src.eye(v3())))) { a.state = 'combat'; a.sus = 1; a.knownPos = (src.knownPos || P.pos).clone(); a.repath = rand(0.2, 1); } } }
function aliveEnemies(tag) { return G.actors.filter((a) => a.alive && a.team === 'enemy' && (!tag || a.tag === tag)); }
