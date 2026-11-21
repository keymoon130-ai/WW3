/* autopilot regression: plays whole missions with the bot and prints the subtitle log + errors.
   LIST='[7,9,10]' node tools/autoplay.cjs        (indices, or ids: LIST='["m9","m9b"]') */
const { open, start } = require('./_launch.cjs');
(async () => {
  const { browser, page } = await open();
  const errs = []; page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ERR_FAILED')) errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push('PAGEERR: ' + e.message + ' | ' + (e.stack || '').split('\n').slice(1, 3).join(' ')));
  for (const mi of JSON.parse(process.env.LIST || '[0]')) {
    await start(page, mi, +(process.env.PH || 0)); const t0 = Date.now();
    await page.evaluate(() => { window.__subs = []; __T.ev("{const o=subtitle; subtitle=(w,t,d,r)=>{window.__subs.push(G.time.toFixed(0)+' '+w+': '+t+' hp'+P.hp.toFixed(0)); return o(w,t,d,r);};}"); });
    const log = await page.evaluate(() => __T.auto(60000)); log.push(...(await page.evaluate(() => window.__subs)));
    const info = await page.evaluate(() => ({ err: window.__err, mode: __T.G.mode, t: __T.G.time.toFixed(0), phase: __T.G.phaseI }));
    console.log(`== mission ${mi}: ${JSON.stringify(info)} (${((Date.now() - t0) / 1000).toFixed(0)}s)`); // mode "done" = cleared
    console.log('   ' + log.join('\n   '));
  }
  console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 30).join('\n'));
  await browser.close();
})();
