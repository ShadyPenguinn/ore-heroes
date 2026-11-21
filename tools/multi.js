// Draws several moments of one scene with a single build: ink-studio's `sheet` command, with each moment saved as its own PNG
// instead of laid out on a sheet. Usage: node tools/multi.js <scene.js> <out dir> <name,name,...> --t <t,t,...> [view options]
// (render.js and portraits.js run it; INK_STUDIO is the path to ink-studio's cli/ink-studio.js)
//
// A scene that marks colours the player can change (world.ohSlots: { skin, hair, a, b } -> the RGB of each ramp, and world.ohFirst:
// the first splat they can be on) gets a second drawing of every moment with those ramps swapped for vivid key colours. Wherever the
// two drawings differ is where that slot shows, so <name>.slots.png marks each pixel with its slot (red = 60 x 1..4, 0 = none), and
// slots-<layer>.json keeps the ramps the game swaps from.
const path = require('path'), fs = require('fs');
const CLI = process.env.INK_STUDIO;
const R = require(path.join(path.dirname(CLI), 'render.js')), PNG = require(path.join(path.dirname(CLI), 'png.js'));
const [scene, out, names, ...rest] = process.argv.slice(2);
const N = names.split(',');
const SLOT = ['skin', 'hair', 'a', 'b'];
// key ramps: one vivid family per slot, a step for each shade
const keyOf = (s, j, n) => { const L = Math.round(70 + (185 * j) / Math.max(1, n - 1)); return [[L, 0, L], [0, L, 0], [0, L, L], [L, L, 0]][s]; };
const pack = c => c[0] | (c[1] << 8) | (c[2] << 16); // the builder keeps a splat's colour as r + g*256 + b*65536
const keys = [];
const render = R.render, renders = [];
R.render = (w, o) => {
  const im = render(w, o);
  if (!w.ohSlots || o.samples) return im;
  // swap the slots' colours for key colours on the heroes' splats, draw again, and put them back
  const swap = new Map(), pal = w.pal;
  if (!keys.length) SLOT.forEach((s, si) => (w.ohSlots[s] || []).forEach((hex, j, all) => {
    const k = keyOf(si, j, all.length); keys.push({ si, k });
    swap.set(pack([(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]), pack(k));
  }));
  else SLOT.forEach((s, si) => (w.ohSlots[s] || []).forEach((hex, j, all) => swap.set(pack([(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]), pack(keyOf(si, j, all.length)))));
  const bufs = [w.data, w.rest].filter((b, i, a) => b && a.indexOf(b) === i), saved = [];
  for (const d of bufs) for (let q = (w.ohFirst || 0) * 16; q < d.length; q += 16) { const c = swap.get(d[q + 7]); if (c !== undefined) { saved.push([d, q, d[q + 7]]); d[q + 7] = c; } }
  w.pal = pal.concat(keys.map(({ k }) => (k[0] << 16) | (k[1] << 8) | k[2]));
  const km = render(w, o);
  w.pal = pal;
  for (const [d, q, c] of saved) d[q + 7] = c;
  renders.push(km);
  return im;
};
R.grid = imgs => {
  imgs.forEach((im, i) => {
    PNG.write(path.join(out, N[i] + '.png'), im.w, im.h, im.rgb);
    const km = renders[i];
    if (!km) return;
    const m = new Uint8Array(im.rgb.length);
    for (let p = 0; p < im.rgb.length; p += 3) {
      if (im.rgb[p] === km.rgb[p] && im.rgb[p + 1] === km.rgb[p + 1] && im.rgb[p + 2] === km.rgb[p + 2]) continue;
      let best = 0, bd = 1e9; // the slot whose key colours this pixel came out nearest
      for (const { si, k } of keys) { const d = (km.rgb[p] - k[0]) ** 2 + (km.rgb[p + 1] - k[1]) ** 2 + (km.rgb[p + 2] - k[2]) ** 2; if (d < bd) { bd = d; best = si + 1; } }
      m[p] = best * 60;
    }
    PNG.write(path.join(out, N[i] + '.slots.png'), im.w, im.h, m);
  });
  if (renders.length && process.env.OH_LAYER) {
    const w = lastWorld;
    fs.writeFileSync(path.join(out, 'slots-' + process.env.OH_LAYER + '.json'), JSON.stringify(Object.fromEntries(Object.entries(w.ohSlots).map(([k, v]) => [k, v.map(h => '#' + h.toString(16).padStart(6, '0'))]))));
  }
  return imgs[0];
};
let lastWorld = null;
const r2 = R.render; R.render = (w, o) => { lastWorld = w; return r2(w, o); };
process.argv = [process.argv[0], CLI, 'sheet', scene, ...rest, '--out', path.join(out, '_sheet-' + N[0] + '.png')];
require(CLI);
