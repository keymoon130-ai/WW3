/* shared launcher for the test tools: local Playwright Chromium on this machine's GPU (set SOFTGL=1 on a machine without one) */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const three = fs.readFileSync(path.join(ROOT, 'node_modules/three/build/three.module.js'), 'utf8');
async function open({ width = 1280, height = 720, headless = process.env.SHOW ? false : true } = {}) {
  const args = process.env.SOFTGL ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=default'];
  args.push('--autoplay-policy=no-user-gesture-required');
  const browser = await chromium.launch({ headless, args, executablePath: process.env.CHROME || undefined });
  const page = await browser.newPage({ viewport: { width, height } });
  // the page imports three from a CDN: serve the local copy so tests run offline
  await page.route('**/*', (r) => { const u = r.request().url(); if (u.includes('three.module.js')) return r.fulfill({ body: three, contentType: 'application/javascript' }); if (u.startsWith('file:')) return r.continue(); return r.abort(); });
  await page.addInitScript((q) => { try { localStorage.setItem('tumen_set', JSON.stringify({ quality: q })); } catch (e) {} window.__skipNews = true; }, process.env.QUALITY || 'low');
  await page.goto('file://' + path.join(ROOT, 'dist', process.env.FILE || 'WW3.html'));
  await page.waitForFunction(() => window.__T, null, { timeout: 60000 });
  return { browser, page, ROOT };
}
/* mission by index or id ('m9b') */
async function start(page, mi, ph = 0) {
  await page.evaluate(([mi, ph]) => { window.__err = null; const i = typeof mi === 'string' && isNaN(+mi) ? __T.MISSIONS.findIndex((m) => m.id === mi) : +mi; __T.startMission(i, ph); }, [mi, ph]); // never await startMission: it hangs evaluate
  await page.waitForFunction(() => __T.G.mode === 'play' && document.getElementById('loading').hidden, null, { timeout: 240000 });
}
module.exports = { open, start, ROOT };
