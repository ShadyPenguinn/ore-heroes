// node tools/icons.js  (serve the repo on :8765 first). Saves art/icons/*.png from tools/icons.html (the forge smiths and weapons;
// the mine heroes' portraits are made by tools/portraits.js).
const {chromium} = require('playwright'), fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader']}), p = await b.newPage();
  p.on('pageerror', e => console.log(e.message));
  await p.goto('http://localhost:8765/tools/icons.html'); await p.waitForFunction(() => window.ICONS, null, {timeout: 180000});
  const out = await p.evaluate(() => window.ICONS), dir = path.join(__dirname, '../art/icons');
  // the mine heroes' portraits come from their splat sculpts now (tools/portraits.js), so those are left alone here
  const SPLAT = new Set(['miner', 'prospector', 'carter', 'phantom', 'blaster', 'lamp', 'foreman', 'time', 'smith', 'swordsmith', 'axesmith', 'spearwright', 'shieldwright', 'hammersmith'].map(k => 'h-' + k));
  for (const [k, url] of Object.entries(out)) if (!SPLAT.has(k)) fs.writeFileSync(path.join(dir, k + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log(Object.keys(out).join(' ')); await b.close()
})();
