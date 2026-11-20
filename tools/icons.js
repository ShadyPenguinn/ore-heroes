// node tools/icons.js  (serve the repo on :8765 first). Saves art/icons/*.png from tools/icons.html.
const {chromium} = require('playwright'), fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader']}), p = await b.newPage();
  p.on('pageerror', e => console.log(e.message));
  await p.goto('http://localhost:8765/tools/icons.html'); await p.waitForFunction(() => window.ICONS, null, {timeout: 180000});
  const out = await p.evaluate(() => window.ICONS), dir = path.join(__dirname, '../art/icons');
  for (const [k, url] of Object.entries(out)) fs.writeFileSync(path.join(dir, k + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log(Object.keys(out).join(' ')); await b.close()
})();
