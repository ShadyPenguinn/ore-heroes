// Draws several moments of one scene with a single build: ink-studio's `sheet` command, with each moment saved as its own PNG
// instead of laid out on a sheet. Usage: node tools/multi.js <scene.js> <out dir> <name,name,...> --t <t,t,...> [view options]
// (render.js runs it; INK_STUDIO is the path to ink-studio's cli/ink-studio.js)
const path = require('path');
const CLI = process.env.INK_STUDIO;
const R = require(path.join(path.dirname(CLI), 'render.js')), PNG = require(path.join(path.dirname(CLI), 'png.js'));
const [scene, out, names, ...rest] = process.argv.slice(2);
const N = names.split(',');
R.grid = imgs => { imgs.forEach((im, i) => PNG.write(path.join(out, N[i] + '.png'), im.w, im.h, im.rgb)); return imgs[0]; };
process.argv = [process.argv[0], CLI, 'sheet', scene, ...rest, '--out', path.join(out, '_sheet-' + N[0] + '.png')];
require(CLI);
