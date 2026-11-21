/* scripted screenshots: fast-forwards a mission with the bot until each shot's condition holds, then frames it.
   MI=12 PH=0 SHOTS=tools/examples/shots.js node tools/shots.cjs      → shots/<name>.png, log in shots/shots.log
   a shot: { name, when: 'JS condition evaluated in the game', cam: 'JS returning [ex,ey,ez, tx,ty,tz]' or null (player view), fov }
   env: CHUNK (bot steps between checks, 120), FAST (use 600-step chunks until G.time > FAST), PRE (JS run once after load), WALL (seconds, 600).
   console lines starting with PROBE are copied to the log — handy for numeric checks. */
const fs = require('fs'), path = require('path');
const { open, start, ROOT } = require('./_launch.cjs');
const OUTD = path.join(ROOT, 'shots'); fs.mkdirSync(OUTD, { recursive: true });
const LOG = process.env.OUT || path.join(OUTD, 'shots.log'); const w = (s) => { fs.appendFileSync(LOG, s + '\n'); console.log(s); };
const SHOTS = require(path.resolve(process.env.SHOTS));
(async () => {
  const { browser, page } = await open();
  setTimeout(() => { w('WALL TIMEOUT'); browser.close().finally(() => process.exit(2)); }, +(process.env.WALL || 600) * 1000);
  page.on('pageerror', (e) => w('PAGEERR ' + e.message)); page.on('console', (m) => { const t = m.text(); if (t.startsWith('PROBE') || m.type() === 'error') w(t.slice(0, 600)); });
  await start(page, process.env.MI || 7, +(process.env.PH || 0));
  if (process.env.PRE) await page.evaluate((js) => __T.ev(js), process.env.PRE);
  for (const s of SHOTS) {
    let ok = false;
    for (let k = 0; k < 400 && !ok; k++) { ok = await page.evaluate((c) => __T.ev(`!!(${c})`), s.when); if (!ok) { const st = await page.evaluate(([ch, fast]) => __T.auto(__T.G.time < fast ? 600 : ch).then(() => __T.G.mode), [+(process.env.CHUNK || 120), +(process.env.FAST || 0)]); if (st !== 'play') break; } }
    if (!ok) { w('skip ' + s.name); continue; }
    const t = await page.evaluate((s) => __T.ev(`{ window.__oc = G.cut; const c = ${s.cam || 'null'}; if (c) G.cut = { pos: v3(c[0], c[1], c[2]), look: v3(c[3], c[4], c[5]), fov: ${s.fov || 55}, roll: 0, skippable: false, noAO: false }; G.time|0 }`), s);
    await page.evaluate(() => __T.ev(`SET.quality='high'; applyQuality();`));
    for (let i = 0; i < 3; i++) await page.evaluate(() => { __T.G.time += 1 / 30; __T.tickFn(1 / 30, 1 / 30); });
    await page.evaluate(() => { for (const id of ['card', 'hud']) { const e = document.getElementById(id); if (e) e.hidden = true; } const f = document.getElementById('fade'); f.style.transition = 'none'; f.style.opacity = 0; __T.tickFn(1 / 30, 1 / 30); });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTD, s.name + '.png'), timeout: 120000 });
    await page.evaluate(() => { __T.G.cut = window.__oc; const h = document.getElementById('hud'); if (h) h.hidden = false; __T.ev(`SET.quality='low'; applyQuality();`); });
    w('shot ' + s.name + ' t=' + t);
  }
  await browser.close(); w('END'); process.exit(0);
})().catch((e) => { w('ERR ' + e.message); process.exit(1); });
