// The mine and forge heroes' portrait icons (art/icons/h-<hero>.png) from the splat sculpts in art/src/mine.js: each hero alone (OH_PORTRAIT=1,
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
  time: ['time', [3.95, 1.55, -0.12], 0.25, 10, 0.5],
  // the forge heroes (art/src/forge.js)
  smith: ['smith', [0.56, 1.1, 0.52], 1.0, 12, 1.12, null, 'forge'],
  swordsmith: ['sword', [-2.32, 1.1, -1.98], 1.0, 12, 0.5, null, 'forge'],
  axesmith: ['axe', [3.52, 1.1, -0.88], -1.0, 12, 1.12, null, 'forge'],
  spearwright: ['spear', [-3.62, 1.1, -0.23], 1.0, 12, 1.12, null, 'forge'],
  shieldwright: ['shield', [3.32, 1.1, 1.07], -1.0, 12, 1.12, null, 'forge'],
  hammersmith: ['hammer', [-2.27, 1.1, 1.07], 1.0, 12, 1.12, null, 'forge']
};
const only = process.argv.slice(2);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oh-portraits-'));
for (const [key, [layer, T, yaw, zoom, t, extra, scene]] of Object.entries(P)) {
  const SC = path.join(ROOT, 'art', 'src', (scene || 'mine') + '.js');
  if (only.length && !only.includes(key)) continue;
  const view = ['--t', String(t), '--clean', '--tone', 'off', '--px', '1', '--w', String(W), '--h', String(H), '--zoom', String(zoom), '--target', T.join(','), '--yaw', String(yaw), '--pitch', '0.12'];
  const env = l => ({ ...process.env, OH_PORTRAIT: '1', ATMOS: '0', OH_LAYER: l, ...(extra || {}) });
  execFileSync('node', [path.join(__dirname, 'multi.js'), SC, tmp, key, ...view], { env: { ...env(layer), INK_STUDIO: CLI }, stdio: 'ignore' });
  execFileSync('node', [CLI, 'render', SC, ...view, '--out', path.join(tmp, key + '-bg.png')], { env: env('none'), stdio: 'ignore' });
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
// the weapon icons (art/icons/w-<kind>.png, 160x160) from art/src/weapons.js, each weapon sculpted alone at icon scale and laid
// corner to corner (the shield faces front). A wide first render finds where the weapon sits; the second fills the icon with it.
for (const k of ['sword', 'axe', 'spear', 'shield', 'hammer']) {
  if (only.length && !only.includes('w-' + k)) continue;
  const SC = path.join(ROOT, 'art', 'src', 'weapons.js'), env = l => ({ ...process.env, OH_LAYER: l });
  const shot = (zoom, T, out, l) => execFileSync('node', [CLI, 'render', SC, '--t', '0', '--clean', '--tone', 'off', '--px', '1', '--w', '160', '--h', '160',
    '--zoom', String(zoom), '--target', T.join(','), '--yaw', '0', '--pitch', '0', '--out', out], { env: env(l), stdio: 'ignore' });
  const cut = `
import numpy as np, sys
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int); b = np.asarray(Image.open(sys.argv[2]).convert('RGB')).astype(int)
m = np.abs(a - b).sum(2) > 0
ys, xs = np.nonzero(m)
print(xs.min(), xs.max(), ys.min(), ys.max())
if len(sys.argv) > 3: Image.fromarray(np.dstack([a, m * 255]).astype(np.uint8), 'RGBA').save(sys.argv[3], optimize=True)`;
  const f = n => path.join(tmp, 'w-' + k + n + '.png');
  const Z0 = 1.2; shot(Z0, [0, 0, 0], f('a'), k); shot(Z0, [0, 0, 0], f('ab'), 'none');
  const [x0, x1, y0, y1] = execFileSync('python3', ['-c', cut, f('a'), f('ab')]).toString().trim().split(/\s+/).map(Number);
  // pixels per unit at Z0, from the canvas: the first shot shows 160 px; the fit grows the zoom so the weapon spans 150 px
  const span = Math.max(x1 - x0 + 1, y1 - y0 + 1), Z = (Z0 * 150) / span;
  const cx = (x0 + x1 + 1) / 2 - 80, cy = (y0 + y1 + 1) / 2 - 80;
  // find the world units per pixel at Z0 with a second probe (zoom is linear in scale)
  shot(Z0, [0.1, 0, 0], f('p'), k);
  const [px0] = execFileSync('python3', ['-c', cut, f('p'), f('ab')]).toString().trim().split(/\s+/).map(Number);
  const upp = 0.1 / (x0 - px0 || 1);
  const T = [cx * upp, -cy * upp, 0];
  shot(Z, T, f(''), k); shot(Z, T, f('b'), 'none');
  execFileSync('python3', ['-c', cut, f(''), f('b'), path.join(ROOT, 'art', 'icons', 'w-' + k + '.png')]);
  console.log('w-' + k, Z.toFixed(2));
}
