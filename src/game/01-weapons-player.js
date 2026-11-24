/* =========================================================
   player, weapons, viewmodel, HUD, scripting, menus, loop
   ========================================================= */

/* ---------------- weapons ---------------- */
const WD = {
  rifle: { name: 'K-34 소총', mag: 30, res: 210, rpm: 720, auto: true, dmg: 34, head: 3.2, sh: 0.032, sa: 0.0025, rec: 0.0105, recH: 0.0055, adsFov: 52, reload: 2.1, snd: 'rifle', vm: 'rifle' },
  rifleSD: { name: 'K-34 SD 소음기', mag: 30, res: 150, rpm: 680, auto: true, dmg: 34, head: 3.5, sh: 0.03, sa: 0.0025, rec: 0.008, recH: 0.004, adsFov: 52, reload: 2.1, snd: 'sd', vm: 'rifle', quiet: true, sup: true },
  usrifle: { name: 'M-27 소총', mag: 30, res: 240, rpm: 760, auto: true, dmg: 33, head: 3.2, sh: 0.032, sa: 0.0025, rec: 0.0105, recH: 0.006, adsFov: 50, reload: 2.2, snd: 'rifle', vm: 'rifle' },
  pistol: { name: 'K-17 권총', mag: 12, res: 60, rpm: 450, auto: false, dmg: 30, head: 3, sh: 0.04, sa: 0.006, rec: 0.022, recH: 0.006, adsFov: 62, reload: 1.5, snd: 'pistol', vm: 'pistol' },
  rpg: { name: 'PZ-9 대전차 로켓', mag: 1, res: 2, rpm: 50, auto: false, proj: 'rocket', adsFov: 46, reload: 2.8, snd: 'rpg', vm: 'rpg', heavy: true },
  atgm: { name: 'K-AT 유도미사일', mag: 1, res: 6, rpm: 30, auto: false, proj: 'missile', adsFov: 28, reload: 3.4, snd: 'rpg', vm: 'atgm', heavy: true, overlay: 'atgm' },
  none: { name: '', noFire: true, noAmmo: true, vm: 'none', adsFov: 70 },
  binoc: { name: '쌍안경', noFire: true, adsFov: 14, vm: 'binoc', overlay: 'binoc' },
  desig: { name: 'LD-1 표적지시기', noFire: false, special: 'naval', adsFov: 16, vm: 'binoc', overlay: 'desig', mag: 1, res: 0, noAmmo: true },
  sniper: { name: 'K-S01 저격총', mag: 5, res: 30, rpm: 46, auto: false, dmg: 160, head: 3, sh: 0.06, sa: 0.0003, rec: 0.045, recH: 0.006, adsFov: 11, reload: 3.2, snd: 'sniper', vm: 'sniper', overlay: 'scope', bolt: 1.05 },
  sam: { name: 'K-SAM 휴대용 대공미사일', mag: 1, res: 1, rpm: 30, auto: false, proj: 'sam', adsFov: 34, reload: 4, snd: 'rpg', vm: 'sam', heavy: true, overlay: 'sam' },
  m134: { name: 'M134 미니건', mag: 9999, res: 9999, rpm: 3000, auto: true, dmg: 46, head: 2, sh: 0.016, sa: 0.008, rec: 0.0008, recH: 0.0012, adsFov: 50, snd: 'mg', vm: 'none', mounted: true, infinite: true, hmg: true, extMuzzle: true },
  km19: { name: 'K-M19 헬기 기관총', mag: 999, res: 9999, rpm: 1000, auto: true, dmg: 50, head: 2, sh: 0.012, sa: 0.006, rec: 0.0012, recH: 0.0018, adsFov: 50, snd: 'mg', vm: 'none', mounted: true, infinite: true, hmg: true, extMuzzle: true },
  heligl: { name: 'K4 고속유탄발사기', mag: 99, res: 9999, rpm: 330, auto: true, proj: 'gl', adsFov: 45, snd: 'gl', vm: 'pintle', mounted: true, infinite: true },
  doorgun: { name: 'M60D 도어건', mag: 300, res: 9999, rpm: 750, auto: true, dmg: 60, head: 2, sh: 0.018, sa: 0.012, rec: 0.003, recH: 0.004, adsFov: 45, reload: 3, snd: 'mg', vm: 'pintle', mounted: true },
  hrocket: { name: '70mm 로켓 포드', mag: 4, res: 60, rpm: 150, auto: false, proj: 'rocket', adsFov: 40, reload: 2.5, snd: 'rpg', vm: 'none', mounted: true },
  k21mg: { name: 'K6 중기관총 (K808)', mag: 200, res: 9999, rpm: 600, auto: true, dmg: 55, head: 2, sh: 0.016, sa: 0.01, rec: 0.0035, recH: 0.004, adsFov: 50, reload: 3, snd: 'mg', vm: 'pintle', mounted: true },
  acvmg: { name: 'M2 중기관총 (ACV 원격무장)', mag: 200, res: 9999, rpm: 600, auto: true, dmg: 55, head: 2, sh: 0.016, sa: 0.01, rec: 0.0035, recH: 0.004, adsFov: 50, reload: 3, snd: 'mg', vm: 'pintle', mounted: true },
  aa: { name: '20mm 대공포', mag: 400, res: 9999, rpm: 900, auto: true, proj: 'flak', adsFov: 55, vm: 'aa', mounted: true, rec: 0.003, recH: 0.004, sh: 0.012, sa: 0.008 },
};

/* ---------------- player ---------------- */
const P = {
  pos: v3(), vel: v3(), yaw: 0, pitch: 0, hp: 100, alive: true, lastHit: -9, crouch: 0, crouchOn: false, ads: 0, sprintK: 0, sprinting: false,
  onGround: true, weapons: [], cur: 0, ammo: {}, nades: 0, reloadT: 0, reloadDur: 0, switchT: 0, fireCd: 0, kick: 0, bob: 0, stepD: 0,
  frozen: false, ride: null, noFire: false, noSprint: false, speedMul: 1, speed: 0, swayX: 0, swayY: 0, punchP: 0, punchY: 0,
  eyePos: v3(), chestPos: v3(), throwT: 0, meleeT: 0, god: false, inWater: false, fireLatch: false, sprintBlock: 0, ghost: false,
};
const K = {}, MS = { l: false, r: false, dx: 0, dy: 0 };
const curW = () => WD[P.weapons[P.cur]] || WD.rifle;
const curId = () => P.weapons[P.cur];

function resetPlayer(lo = {}) {
  Object.assign(P, { hp: 100, alive: true, lastHit: -9, crouch: 0, crouchOn: false, ads: 0, sprintK: 0, reloadT: 0, switchT: 0, fireCd: 0, kick: 0, frozen: false, ride: null, noFire: !!lo.noFire, noSprint: false, speedMul: 1, god: false, ghost: false, throwT: 0, meleeT: 0, pitch: 0, punchP: 0, punchY: 0, adsOn: false });
  P.vel.set(0, 0, 0);
  P.weapons = (lo.weapons || ['rifle', 'pistol']).slice(); P.cur = 0; P.ammo = {};
  if (typeof tut === 'function') for (const w of P.weapons) if (TUTW[w]) setTimeout(() => tut('w_' + w, TUTW[w], null, 9), 0);
  for (const id of P.weapons) P.ammo[id] = { mag: WD[id].mag ?? 0, res: (lo.res && lo.res[id]) ?? WD[id].res ?? 0 };
  P.nades = lo.nades ?? 3;
  buildViewmodel();
  P.cam = { ...(lo.cam || {}) };
}
function trailPoint(back) { const T = G.trail || []; let acc = 0, prev = P.pos; for (let i = T.length - 1; i >= 0; i--) { acc += prev.distanceTo(T[i]); if (acc >= back) return T[i]; prev = T[i]; } return T[0] || P.pos; }
function hiddenFromView(p) { const v = p.clone().add(v3(0, 1, 0)).project(camera); return v.z > 1 || Math.abs(v.x) > 1.15 || Math.abs(v.y) > 1.15 || p.distanceTo(camera.position) > 70; }
function screenHidden() { return !!G.cut || +($('fade').style.opacity || 0) > 0.8 || $('blacktext').classList.contains('on') || !$('loading').hidden; }