// Renders every frame of the mine with ink-studio, into tools/frames/ (not committed); then `python3 tools/pack.py` packs
// them into art/mine.png + art/mine.json. Ink-studio lives in the Blacksmith Battles repo (forge-splat-test/addons/splats/
// tools/ink-studio); point INK_STUDIO at its cli/ink-studio.js, or keep a blacksmith-battles clone next to this repo.
// Usage: node tools/render.js mine|forge|camp|explore   (then python3 tools/pack.py the same; camp: tools/split.py first)
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CLI = process.env.INK_STUDIO || path.join(ROOT, '..', 'blacksmith-battles', 'forge-splat-test', 'addons', 'splats', 'tools', 'ink-studio', 'cli', 'ink-studio.js');
const WHICH = process.argv[2] || 'mine';
const OUT = path.join(__dirname, 'frames', WHICH);
// the mine is drawn in the detailed splat look at full size (px 1; the game draws it at half scale); the rest at px 2
const VIEW = ['--clean', '--px', ['mine', 'forge', 'camp'].includes(WHICH) ? '1' : '2', '--tone', 'off', '--zoom', '2.6', '--target', '0.7,0.95,0.3', '--w', '960', '--h', '420'];
const steps = (a, b, n) => [...Array(n)].map((_, i) => +(a + ((b - a) * i) / n).toFixed(4));
const SWING = { idle: steps(0, 1, 12), strike: [1.0, 1.04, 1.075, 1.1, 1.12], recover: [1.15, 1.2, 1.26, 1.32, 1.38, 1.44] };
// the station smiths: their own work loop, the finishing strike, and a moment of their own (art/src/forge.js workPose)
const WORK = { idle: steps(0, 2, 24), strike: [2.0, 2.04, 2.075, 2.1, 2.12], recover: [2.15, 2.2, 2.26, 2.32, 2.38, 2.44], study: steps(3, 5, 20) };
const jobs = [{ name: 'bg', env: { OH_LAYER: 'none' }, t: 0 }];
const layout = { heroes: {} };
function clips(HEROES) {
  for (const [h, segs] of Object.entries(HEROES)) {
    layout.heroes[h] = {};
    for (const [seg, ts] of Object.entries(segs)) {
      layout.heroes[h][seg] = { t: ts, f: ts.map((_, i) => `${h}-${seg}-${i}`) };
      ts.forEach((t, i) => jobs.push({ name: `${h}-${seg}-${i}`, env: { OH_LAYER: h }, t }));
    }
  }
}
if (WHICH === 'mine') {
  // each hero's clips (seconds of its pose(t) in art/src/mine.js)
  clips({
    miner: SWING, pros: SWING, phantom: SWING,
    boss: { idle: steps(0, 1, 12), call: steps(1, 1.5, 10) },
    blast: { idle: steps(0, 1, 12), duck: steps(1, 1.6, 12) },
    lamp: { idle: steps(0, 1, 12), reach: steps(1, 2, 16) },
    time: { idle: steps(0, 1, 12), turn: steps(1, 1.6, 10) },
    heap: { idle: [0] }
  });
  // the Carter and his cart along the rails: z from deep in the tunnel to the end of the rails, rolling out (full) or in (empty)
  const CART_Z = steps(-6.2, 0.9, 16).concat([0.9]);
  layout.cart = { z: CART_Z, out: [], in: [] };
  jobs.push({ name: 'cart-parked', env: { OH_LAYER: 'cart', OH_DIR: 'in', OH_Z: '-2.9', OH_NOBODY: '1' }, t: 0 });
  for (const dir of ['out', 'in'])
    CART_Z.forEach((z, i) => { const n = `cart-${dir}-${i}`; layout.cart[dir].push(n); jobs.push({ name: n, env: { OH_LAYER: 'cart', OH_DIR: dir, OH_Z: String(z) }, t: (i % 4) * 0.25 }); });
} else if (WHICH === 'camp') {
  // art/src/camp.js: the fire's loop, and every body and head layer once at each of its two sets of spots (python3 tools/split.py camp
  // then cuts each into one sprite per spot, before pack.py)
  clips({ fire: { idle: steps(0, 1, 12) } });
  for (const set of ['a', 'b']) {
    for (const o of ['none', 'sword', 'bow', 'axe', 'spear', 'shield', 'hammer']) jobs.push({ name: `b-${o}-${set}`, env: { OH_LAYER: `b-${o}-${set}` }, t: 0 });
    for (const f of ['fem', 'male', 'beard']) for (const h of ['short', 'long', 'braid', 'bun', 'bald']) jobs.push({ name: `h-${f}-${h}-${set}`, env: { OH_LAYER: `h-${f}-${h}-${set}` }, t: 0 });
  }
} else if (WHICH === 'explore') {
  // art/src/explore.js: your heroes facing right, the cave ghouls and the Warden facing left; idle, a swing, and a fall
  const H = {}, FIGHT = { idle: steps(0, 1, 8), hit: steps(1, 1.4, 6).concat([1.4]), fall: steps(2, 2.6, 6).concat([2.6]), walk: steps(3, 4, 8) };
  for (const w of ['sword', 'axe', 'spear', 'shield', 'hammer']) { H['u-' + w] = FIGHT; H['e-' + w] = FIGHT; }
  H['u-bow'] = FIGHT; // only your heroes carry bows
  for (const w of ['sword', 'axe', 'spear', 'hammer']) H['w-' + w] = FIGHT;
  clips(H);
} else {
  // art/src/forge.js: the Blacksmith, the five smiths and the Bowyer swing like the mine's picks; the fire loops
  clips({
    smith: SWING, sword: { idle: steps(0, 2, 24), study: steps(2, 4, 20) }, axe: WORK, spear: WORK, shield: WORK, hammer: WORK, bow: { idle: steps(0, 2, 24), study: steps(2, 4, 20) },
    fire: { idle: steps(0, 1, 12) }
  });
  for (const k of ['st-sword', 'st-axe', 'st-spear', 'st-shield', 'st-hammer', 'st-bow', 'w-sword', 'w-axe', 'w-spear', 'w-shield', 'w-hammer', 'w-bow'])
    jobs.push({ name: k, env: { OH_LAYER: k }, t: 0 });
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'jobs.json'), JSON.stringify({ ...layout, jobs: jobs.map(j => j.name) }));
// frames that share a layer's settings are drawn by one process (tools/multi.js), so the scene is built once for all of them
const groups = [];
for (const j of jobs) {
  const key = JSON.stringify(j.env);
  let g = groups.find(q => q.key === key);
  if (!g) groups.push((g = { key, env: j.env, names: [], ts: [] }));
  g.names.push(j.name); g.ts.push(j.t);
}
// ONLY=layer,layer re-renders just those layers (the rest of the frames stay as they are)
if (process.env.ONLY) { const keep = process.env.ONLY.split(','); for (let i = groups.length - 1; i >= 0; i--) if (!keep.includes(groups[i].env.OH_LAYER)) groups.splice(i, 1); }
groups.sort((a, b) => b.names.length - a.names.length);
let next = 0, running = 0, done = 0, failed = 0;
const N = Math.max(2, require('os').cpus().length);
const SCENE = path.join(ROOT, 'art', 'src', WHICH + '.js');
(function run() {
  while (running < N && next < groups.length) {
    const g = groups[next++];
    running++;
    const p = spawn('node', [path.join(__dirname, 'multi.js'), SCENE, OUT, g.names.join(','), '--t', g.ts.join(','), ...VIEW], { env: { ...process.env, ...g.env, INK_STUDIO: CLI }, stdio: 'ignore' });
    p.on('exit', code => {
      running--; done++;
      if (code) { failed++; console.error('failed', g.names[0], '...'); }
      else console.log(`${done}/${groups.length}`, g.names[0], g.names.length);
      if (done === groups.length) console.log(`${WHICH}: ${jobs.length} frames in ${groups.length} builds${failed ? `, ${failed} failed` : ''}`);
      run();
    });
  }
})();
