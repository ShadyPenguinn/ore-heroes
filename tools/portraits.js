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
// the weapon icons (art/icons/w-<kind>.png, 160x160) from the rack weapons in art/src/forge.js: each drawn alone, upright, then
// turned to lie corner to corner (the shield stays round)
const RACK = { sword: -0.76, axe: -0.38, spear: 0, shield: 0.38, hammer: 0.76 }, RZ = -Math.sqrt(4.6 * 4.6 - 3.25 * 3.25) + 0.24;
const WY = { sword: 1.62, axe: 1.7, spear: 1.85, shield: 1.63, hammer: 1.7 }, WZ = { sword: 9, axe: 11, spear: 6.5, shield: 13, hammer: 11 };
for (const [k, c] of Object.entries(RACK)) {
  if (only.length && !only.includes('w-' + k)) continue;
  const tall = k !== 'shield', w = tall ? 100 : 160, h = tall ? 226 : 160;
  const view = ['--t', '0', '--clean', '--tone', 'off', '--px', '1', '--w', String(w), '--h', String(h), '--zoom', String(WZ[k]), '--target', [2.2 + c, WY[k], RZ].join(','), '--yaw', '0', '--pitch', '0'];
  const env = l => ({ ...process.env, OH_PORTRAIT: '1', ATMOS: '0', OH_LAYER: l, PAMB: '0.1', PSKY: '0.12' });
  const SC = path.join(ROOT, 'art', 'src', 'forge.js');
  execFileSync('node', [CLI, 'render', SC, ...view, '--out', path.join(tmp, 'w-' + k + '.png')], { env: env('w-' + k), stdio: 'ignore' });
  execFileSync('node', [CLI, 'render', SC, ...view, '--out', path.join(tmp, 'w-' + k + '-bg.png')], { env: env('none'), stdio: 'ignore' });
  execFileSync('python3', ['-c', `
import numpy as np, sys
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')); b = np.asarray(Image.open(sys.argv[2]).convert('RGB'))
m = (np.abs(a.astype(int) - b.astype(int)).sum(2) > 0)
im = Image.fromarray(np.dstack([a, (m * 255).astype(np.uint8)]), 'RGBA')
if sys.argv[4] == '1': im = im.rotate(-45, resample=Image.NEAREST, expand=True)
bb = im.getbbox(); im = im.crop(bb); s = 150 / max(im.size)
if s < 1: im = im.resize((max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))), Image.NEAREST)
o = Image.new('RGBA', (160, 160)); o.paste(im, ((160 - im.size[0]) // 2, (160 - im.size[1]) // 2)); o.save(sys.argv[3], optimize=True)`,
    path.join(tmp, 'w-' + k + '.png'), path.join(tmp, 'w-' + k + '-bg.png'), path.join(ROOT, 'art', 'icons', 'w-' + k + '.png'), tall ? '1' : '0']);
  console.log('w-' + k);
}
