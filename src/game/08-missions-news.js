/* ---------------- missions runtime ---------------- */
const MISSIONS = [];
/* who we are fighting, mission by mission: cn = Chinese PLA, ru = Russian forces, mix = both */
const FOES = {
  p: ['mix', '중·러 연합군 — 중국 인민해방군 북부전구 · 러시아 동부군관구'], m1: ['cn', '중국 인민해방군 북부전구 제78집단군'], m2: ['cn', '중국 인민해방군 제78집단군 기계화보병'],
  m3: ['cn', '중국 인민해방군 점령 부대'], m4: ['ru', '러시아 지상군 제3전차사단 전방 지휘소'], m5: ['ru', '러시아 지상군 제3전차사단'], m6: ['mix', '중·러 연합군 추격 부대'],
  m7: ['mix', '중·러 연합군 서울 진입 부대'], m9: ['cn', '중국 인민해방군 서해안 방어 부대'], m9b: ['ru', '러시아 태평양함대 해군보병'], m10a: ['cn', '중국 인민해방군 수도권 점령 부대'],
  m10: ['cn', '중국 인민해방군 서울 방어 부대'], m10b: ['mix', '중·러 연합군 평양 방어 사령부'], m11: ['mix', '중·러 연합군 잔존 부대'],
};
/* one line per mission for the mission select screen */
const DESC = {
  p: '통일 이후 첫 새해에 모두가 들뜬 사이 북쪽에서는 새로운 혼란이 시작되려 하고 있습니다.',
  m1: '공격은 시작됐고, 국경수비대는 다리를 폭파시켜 진격을 지연시키기로 합니다.',
  m2: '적군의 남하가 시작됩니다.',
  m3: '리선우 병장의 마을엔 식은 밥과 편지뿐이었습니다.',
  m4: '침공의 배후가 드러나기 시작합니다.',
  m5: '국군은 서서히 밀려납니다. 막아보지만 끝은 후퇴뿐입니다.',
  m6: '적군은 끊이지 않습니다. 부상자가 발생해 후퇴를 결정합니다.',
  m7: '대비되지 않은 전쟁에는 패배와 함락뿐이었습니다.',
  m8: '연합군이 반격을 준비합니다.',
  m9: '역사는 되풀이되었고, 연합군은 총력을 다합니다.',
  m9b: '연합군이 세찬 파도와 강한 공세를 뚫어내기로 합니다.',
  m10a: '국군이 한달 전 잃어버린 곳을 다시 뺏어내기로 합니다.',
  m10: '반격은 시작되었고, 놈들은 포위되었습니다.',
  m10b: '기세를 되찾은 연합군은 통일대한의 두번째 수도까지 진격합니다.',
  m11: '4달 전 이곳에서 시작된 일을 이곳에서 끝냅니다.',
  ep: '통일대한은 평화를 되찾았습니다.',
};
function defMission(m) { const f = FOES[m.id]; if (f) { m.foe = m.foe || f[0]; m.foeText = m.foeText || f[1]; } if (DESC[m.id]) m.desc = m.desc || DESC[m.id]; MISSIONS.push(m); }
function foeStyle() { const f = (G.mission && G.mission.foe) || 'mix'; return f === 'cn' ? 'enemy' : f === 'ru' ? 'enemy2' : (Math.random() < 0.5 ? 'enemy' : 'enemy2'); }
let progress = store.get('tumen_prog', {});

/* ---------- opening news broadcast: a studio built in the 3D scene ---------- */
const NEWS_LINES = ['한반도가 민주주의 국가로 통일된 지 3개월째입니다.', '정부는 북측 지역의 중·러 합작 항만과 광산 사업권을 동결하고, 한미연합사령부의 작전 구역을 압록강·두만강 국경선까지 확대했습니다.', '중국과 러시아는 "완충지대를 없애고 동맹군을 국경 앞까지 끌어들인 명백한 위협"이라며 강하게 반발하고 있습니다.', '여기에 베이징으로 도피한 구 북한 지도부는 「임시 망명정부」 수립을 선포하고, 우호조약에 따른 군사 지원을 공식 요청했습니다.', '중·러 양국은 "한국이 북한의 핵무기를 불법 탈취했다"고 주장하며 두만강과 압록강 건너편에 병력을 대규모로 집결시키고 있지만,', '정부는 "통상적인 동계 훈련"이라며 아직 어떠한 조치도 취하지 않고 있습니다.', '한편 정부는…'];
const NEWS_TICK = ['中·러, 두만강·압록강 건너편 병력 집결… 국방부 "통상 훈련"', '러시아 동부군관구 대규모 동계 기동 돌입', '北 구 지도부, 베이징서 「임시 망명정부」 선포', '中·러 "韓, 北 핵무기 불법 탈취" 주장… 국방부 "사실무근"', '정부, 나선·청진항 中·러 사업권 동결', '코스피, 통일 기대감에 사상 최고치', '서울–평양 고속철 내년 3월 착공', '기상청 "새해 첫날 전국 강추위"', '유엔 안보리, 한반도 정세 긴급 협의', '국경수비대 1기 수료식 거행', '정부 "연말 국경 지역 여행 자제" 권고'];
function buildStudio() {
  newWorld(); G.groundAt = () => 0;
  applyEnv({ sky: [0x05080f, 0x0a1220, 0x0a1220], fog: 0x0a1220, fogD: 0.001, hemi: [0x9fb4d8, 0x20242c, 0.7], sun: [0xfff0e0, 1.3], sunDir: [0.3, 0.8, 1], snow: 0, exposure: 1.05, stars: false });
  const W = G.world, add = (geo, m, x, y, z) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); W.add(me); return me; };
  add(new THREE.BoxGeometry(40, 0.1, 30), mat('stfloor', { color: 0x0c1424, rough: 0.25, metal: 0.4 }), 0, -0.05, 0);
  // curved LED wall
  const wallTex = canvasTex(1024, 384, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#0d2a5c'); gr.addColorStop(1, '#091634'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,170,255,.12)'; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    // peninsula + arrows on the right half
    const pts = [[124.4, 40], [126, 41.2], [128.1, 41.9], [129.2, 42.3], [130, 42.95], [130.7, 42.3], [129.8, 41.8], [129.2, 40.7], [128, 40], [127.4, 39.4], [128.4, 38.5], [129.4, 37], [129.6, 35.9], [129, 35.05], [127.7, 34.7], [126.4, 34.4], [126.5, 35.4], [126.3, 36.6], [126.7, 37.4], [125.2, 37.9], [124.8, 38.1], [125.3, 38.8], [124.8, 39.6]];
    const X = (lo) => 640 + (lo - 124) * 0.79 * 30, Y = (la) => 20 + (43.2 - la) * 30;
    g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(X(a), Y(b)) : g.moveTo(X(a), Y(b)))); g.closePath(); g.fillStyle = '#3f6fb8'; g.fill(); g.strokeStyle = '#9fc2ff'; g.lineWidth = 3; g.stroke();
    g.strokeStyle = '#ff5050'; g.lineWidth = 6; g.setLineDash([12, 10]); for (const [x0, y0, x1, y1] of [[600, 0, 655, 90], [720, -10, 735, 70], [860, 0, 805, 50]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.setLineDash([]); g.fillStyle = '#ff5050'; g.font = 'bold 26px sans-serif'; g.fillText('中', 560, 50); g.fillText('RU', 880, 40);
    g.fillStyle = '#eaf2ff'; g.font = 'bold 54px "Noto Sans KR",sans-serif'; g.fillText('통일 한국,', 70, 150); g.fillText('국경의 긴장', 70, 220); g.font = '28px "Noto Sans KR",sans-serif'; g.fillStyle = '#9fc2ff'; g.fillText('KBN 뉴스 9 · 특별 기획', 70, 280);
  });
  wallTex.wrapS = THREE.RepeatWrapping; wallTex.repeat.x = -1; const lg = new THREE.CylinderGeometry(12, 12, 5.2, 48, 1, true, -0.6, 1.2); const led = new THREE.Mesh(lg, new THREE.MeshBasicMaterial({ map: wallTex, side: THREE.BackSide })); led.position.set(0, 2.9, -6.5); W.add(led); add(new THREE.BoxGeometry(30, 0.4, 14), mat('stceil', { color: 0x070b14 }), 0, 4.9, 0);
  for (const x of [-7, 7]) add(new THREE.BoxGeometry(0.15, 5, 0.15), basicMat('stlight', 0x5f9bff), x, 2.5, -2.5);
  // desk
  add(new THREE.BoxGeometry(3.4, 0.08, 1.1), mat('desktop', { color: 0xe6ebf2, rough: 0.2, metal: 0.2 }), 0, 0.78, -1.0);
  const front = add(new THREE.BoxGeometry(3.3, 0.76, 0.06), mat('deskfr', { color: 0x123060, rough: 0.4 }), 0, 0.38, -1.55);
  add(new THREE.BoxGeometry(1.1, 0.22, 0.02), basicMat('desklogo', 0x2f7bff), 0, 0.48, -1.59);
  add(new THREE.BoxGeometry(0.3, 0.02, 0.22), mat('paper', { color: 0xf4f4ee }), 0.35, 0.83, -1.15);
  // the anchor: dark suit, white shirt, tie
  const an = makeSoldierMesh('rok', { civ: 0x2c3850, unarmed: true }); an.root.position.set(0, -0.12, -0.45); W.add(an.root);
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.02), mat('tie', { color: 0x9a1c2a })); tie.position.set(0, 0.42, -0.13); an.torso.add(tie);
  const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), mat('shirt', { color: 0xf0f0ea })); shirt.position.set(0, 0.5, -0.125); an.torso.add(shirt);
  an.legL.visible = an.legR.visible = false;
  G.anchor = an;
  camera.fov = 34; camera.updateProjectionMatrix();
}
function playNews() {
  return new Promise((resolve) => {
    buildStudio(); G.mode = 'news';
    const N = $('news'); N.hidden = false; void N.offsetWidth; N.classList.add('on');
    $('nTick').textContent = NEWS_TICK.concat(NEWS_TICK).join('    ·    '); $('nFade').style.opacity = 0; $('nCC').textContent = '';
    if (AU.ctx) { [72, 76, 79, 84].forEach((n, k) => tone({ t: k * 0.12, dur: 1.6, f: 440 * Math.pow(2, (n - 69) / 12), type: 'triangle', gain: 0.07, att: 0.01, wet: 0.5, dest: AU.music })); tone({ dur: 2, f: 110, type: 'sine', gain: 0.1, att: 0.02, wet: 0.3, dest: AU.music }); }
    let done = false, i = -1, timer = null; const t0 = performance.now();
    const anim = () => { if (done) return; const t = (performance.now() - t0) / 1000; const an = G.anchor;
      camera.position.set(Math.sin(t * 0.05) * 0.3, 1.32, -4.6 + Math.min(t, 30) * 0.035); camera.lookAt(0, 1.18, 0);
      if (an) { const talk = $('nCC').textContent ? 1 : 0; an.head.rotation.x = Math.sin(t * 3.1) * 0.035 * talk - 0.04; an.head.rotation.y = Math.sin(t * 0.7) * 0.08; an.torso.rotation.y = Math.sin(t * 0.45) * 0.03;
        an.armR.rotation.set(0.35 + Math.sin(t * 1.3) * 0.06 * talk, 0, 0.12); an.armL.rotation.set(0.35, 0, -0.12); an.elR.rotation.set(1.05 + Math.sin(t * 2.1) * 0.12 * talk, 0, 0); an.elL.rotation.set(1.05, 0, 0); }
      requestAnimationFrame(anim); };
    anim();
    const finish = () => { if (done) return; done = true; clearTimeout(timer); removeEventListener('keydown', onKey, true); N.removeEventListener('pointerdown', onKey); $('nFade').style.opacity = 1; setTimeout(() => { N.classList.remove('on'); N.hidden = true; G.mode = 'loading'; resolve(); }, 2700); };
    const next = () => { i++; if (i >= NEWS_LINES.length) { finish(); return; } const cc = $('nCC'); cc.style.opacity = 0; setTimeout(() => { if (!done) { cc.textContent = NEWS_LINES[i]; cc.style.opacity = 1; } }, 250);
      if (i === NEWS_LINES.length - 1) { setTimeout(() => { if (!done) finish(); }, 1600); return; }
      timer = setTimeout(next, 1400 + NEWS_LINES[i].length * 85); };
    const onKey = (e) => { if (e.code === 'Space') e.preventDefault(); };
    G.newsFinish = finish;
    addEventListener('keydown', onKey, true); N.addEventListener('pointerdown', onKey);
    setTimeout(next, 1500);
  });
}
