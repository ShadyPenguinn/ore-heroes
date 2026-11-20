// Renders every frame of the mine with ink-studio, into tools/frames/ (not committed); then `python3 tools/pack.py` packs
// them into art/mine.png + art/mine.json. Ink-studio lives in the Blacksmith Battles repo (forge-splat-test/addons/splats/
// tools/ink-studio); point INK_STUDIO at its cli/ink-studio.js, or keep a blacksmith-battles clone next to this repo.
// Usage: node tools/render.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CLI = process.env.INK_STUDIO || path.join(ROOT, '..', 'blacksmith-battles', 'forge-splat-test', 'addons', 'splats', 'tools', 'ink-studio', 'cli', 'ink-studio.js');
const OUT = path.join(__dirname, 'frames');
const VIEW = ['--clean', '--px', '2', '--tone', 'off', '--zoom', '2.6', '--target', '0.7,0.95,0.3', '--w', '960', '--h', '420'];
const steps = (a, b, n) => [...Array(n)].map((_, i) => +(a + ((b - a) * i) / n).toFixed(4));
// each hero's clips (seconds of its pose(t) in art/src/mine.js)
const SWING = { idle: steps(0, 1, 12), strike: [1.0, 1.04, 1.075, 1.1, 1.12], recover: [1.15, 1.2, 1.26, 1.32, 1.38, 1.44] };
const HEROES = {
  miner: SWING,
  pros: SWING,
  phantom: SWING,
  boss: { idle: steps(0, 1, 12), call: steps(1, 1.5, 10) },
  blast: { idle: steps(0, 1, 12), duck: steps(1, 1.6, 12) },
  lamp: { idle: steps(0, 1, 12), reach: steps(1, 2, 16) },
  time: { idle: steps(0, 1, 12), turn: steps(1, 1.6, 10) },
  heap: { idle: [0] }
};
// the Carter and his cart along the rails: z from deep in the tunnel to the end of the rails, rolling out (full) or in (empty)
const CART_Z = steps(-6.2, 0.9, 16).concat([0.9]);
const jobs = [{ name: 'bg', env: { OH_LAYER: 'none' }, t: 0 }];
const layout = { heroes: {}, cart: { z: CART_Z, out: [], in: [] } };
for (const [h, segs] of Object.entries(HEROES)) {
  layout.heroes[h] = {};
  for (const [seg, ts] of Object.entries(segs)) {
    layout.heroes[h][seg] = { t: ts, f: ts.map((_, i) => `${h}-${seg}-${i}`) };
    ts.forEach((t, i) => jobs.push({ name: `${h}-${seg}-${i}`, env: { OH_LAYER: h }, t }));
  }
}
jobs.push({ name: 'cart-parked', env: { OH_LAYER: 'cart', OH_DIR: 'in', OH_Z: '-2.9', OH_NOBODY: '1' }, t: 0 });
for (const dir of ['out', 'in'])
  CART_Z.forEach((z, i) => { const n = `cart-${dir}-${i}`; layout.cart[dir].push(n); jobs.push({ name: n, env: { OH_LAYER: 'cart', OH_DIR: dir, OH_Z: String(z) }, t: (i % 4) * 0.25 }); });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'jobs.json'), JSON.stringify({ ...layout, jobs: jobs.map(j => j.name) }));
let next = 0, running = 0, done = 0, failed = 0;
const N = Math.max(2, require('os').cpus().length);
const SCENE = path.join(ROOT, 'art', 'src', 'mine.js');
(function run() {
  while (running < N && next < jobs.length) {
    const j = jobs[next++];
    running++;
    const p = spawn('node', [CLI, 'render', SCENE, '--t', String(j.t), ...VIEW, '--out', path.join(OUT, j.name + '.png')], { env: { ...process.env, ...j.env }, stdio: 'ignore' });
    p.on('exit', code => {
      running--; done++;
      if (code) { failed++; console.error('failed', j.name); }
      if (done === jobs.length) console.log(`mine: ${done} frames${failed ? `, ${failed} failed` : ''}`);
      run();
    });
  }
})();
