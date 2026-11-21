// The mine heroes' portrait icons (art/icons/h-<hero>.png) from the splat sculpts in art/src/mine.js: each hero alone (OH_PORTRAIT=1,
// no cave), close up on head and shoulders, cut out against an empty render of the same view; h-<hero>.slots.png marks the colours
// a player can change (see tools/multi.js).
// Usage: node tools/portraits.js [hero ...]   (INK_STUDIO as for render.js; needs python3 with numpy and PIL)
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.join(__dirname, '..');
const CLI = process.env.INK_STUDIO || path.join(ROOT, '..', 'blacksmith-battles', 'forge-splat-test', 'addons', 'splats', 'tools', 'ink-studio', 'cli', 'ink-studio.js');
const W = 176, H = 224; // twice the 88x112 the cards were made for: crisp on a phone
// icon: [layer, target x,y,z (between chin and chest), yaw (toward the face, a little to the camera's side), zoom, t (pose), extra env]
const P = {
  miner: ['miner', [0.78, 1.1, 0.78], 1.0, 12, 1.12],
  prospector: ['pros', [-3.32, 1.1, -0.98], 1.0, 12, 1.12],
  carter: ['cart', [-1.68, 1.1, 0.07], 0.35, 12, 0, { OH_Z: '0.2', OH_DIR: 'out' }],
  phantom: ['phantom', [2.55, 1.12, 0.74], -1.0, 9, 0.5],
  blaster: ['blast', [3.56, 0.84, 1.8], 1.0, 12, 0.5],
  lamp: ['lamp', [2.61, 1.14, -2.19], 0.3, 12, 0.5],
  foreman: ['boss', [-2.22, 1.1, 0.56], 0.9, 12, 0.5],
  time: ['time', [3.95, 1.55, -0.12], 0.25, 10, 0.5]
};
const only = process.argv.slice(2);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oh-portraits-'));
for (const [key, [layer, T, yaw, zoom, t, extra]] of Object.entries(P)) {
  if (only.length && !only.includes(key)) continue;
  const view = ['--t', String(t), '--clean', '--tone', 'off', '--px', '1', '--w', String(W), '--h', String(H), '--zoom', String(zoom), '--target', T.join(','), '--yaw', String(yaw), '--pitch', '0.12'];
  const env = l => ({ ...process.env, OH_PORTRAIT: '1', ATMOS: '0', OH_LAYER: l, ...(extra || {}) });
  execFileSync('node', [path.join(__dirname, 'multi.js'), path.join(ROOT, 'art', 'src', 'mine.js'), tmp, key, ...view], { env: { ...env(layer), INK_STUDIO: CLI }, stdio: 'ignore' });
  execFileSync('node', [CLI, 'render', path.join(ROOT, 'art', 'src', 'mine.js'), ...view, '--out', path.join(tmp, key + '-bg.png')], { env: env('none'), stdio: 'ignore' });
  execFileSync('python3', ['-c', `
import numpy as np, sys
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')); b = np.asarray(Image.open(sys.argv[2]).convert('RGB'))
m = (np.abs(a.astype(int) - b.astype(int)).sum(2) > 0)
o = np.dstack([a, (m * 255).astype(np.uint8)])
Image.fromarray(o, 'RGBA').save(sys.argv[3], optimize=True)
import os
if os.path.exists(sys.argv[4]):
    s = np.asarray(Image.open(sys.argv[4]).convert('RGB'))[..., 0] * m
    Image.fromarray(s.astype(np.uint8), 'L').save(sys.argv[5], optimize=True)`, path.join(tmp, key + '.png'), path.join(tmp, key + '-bg.png'), path.join(ROOT, 'art', 'icons', 'h-' + key + '.png'), path.join(tmp, key + '.slots.png'), path.join(ROOT, 'art', 'icons', 'h-' + key + '.slots.png')]);
  console.log('h-' + key);
}
