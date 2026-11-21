// Ore Heroes: the weapon icons (art/icons/w-<kind>.png): each weapon from art/src/weapon-models.js alone, lit by a warm key light,
// turned to lie corner to corner, blade or head toward the top right (the shield faces the camera).
// OH_LAYER picks the weapon: sword | axe | spear | shield | hammer (none = nothing, the empty background for the cut-out).
// Rendered and framed by tools/portraits.js (--px 1, 160x160).
const WM = require('./weapon-models.js');
module.exports = ({ makeBuilder, makeSculpt, KIT: K }) => {
  const PAL = WM.COLOURS;
  function build(seed) {
    const env = (typeof process !== 'undefined' && process.env) || {};
    const layer = env.OH_LAYER || '';
    const B = makeBuilder(seed, PAL);
    const S = K.sculpt(makeSculpt(B));
    S.sun = B.norm([-0.45, 0.55, 0.75]);
    S.res = 0.01;
    S.amb = +(env.PAMB || 0.16);
    S.sky = +(env.PSKY || 0.14);
    S.lights.push({ p: [-0.6, 0.8, 1.2], r: 3.0, s: 0.5 });
    if (['sword', 'axe', 'spear', 'shield', 'hammer'].includes(layer)) WM.draw(S, B, layer, { roll: layer === 'shield' ? 0 : -Math.PI / 4 });
    S.bake();
    return B.finish({ cam: { target: [0, 0, 0], dist: 4, pitch: 0, yaw: 0 }, detail: +(env.DETAIL || 26), dither: 0, ao: { k: 0.35, range: 0.1 }, radius: 1.2 });
  }
  return { id: 'oh-weapons', name: 'Ore Heroes weapon icons', seed: 5, build };
};
