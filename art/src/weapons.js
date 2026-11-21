// Ore Heroes: the weapon icons (art/icons/w-<kind>.png), each weapon sculpted on its own at icon scale in the detailed splat look:
// bevelled steel that catches a warm key light down one facet and stays cool on the other, a bright honed edge, brass fittings,
// wrapped leather grips, grained wood, rivets and a gem or two. Everything is modelled upright (the weapon's length along local y)
// and then turned to lie corner to corner, blade or head toward the top right; the shield faces the camera.
// OH_LAYER picks the weapon: sword | axe | spear | shield | hammer (none = nothing, the empty background for the cut-out).
// Rendered by tools/portraits.js (--ortho, --px 1, 160x160).
module.exports = ({ makeBuilder, makeSculpt, KIT: K }) => {
  const PAL = [
    0x0c0d11, 0x1a1d24, 0x2a2f3a, 0x3e4552, 0x58606e, 0x76808e, 0x98a2b0, 0xbcc5d0, 0xdde3ea, 0xf6f9fc, // 0-9 steel
    0x2e1a06, 0x5a3a10, 0x8a6020, 0xb88a34, 0xdcb450, 0xf6e08a, // 10-15 brass
    0x1e1008, 0x341c0e, 0x4e2c16, 0x6c4022, 0x8c5830, 0xac7442, // 16-21 wood
    0x160c08, 0x2c1810, 0x46281a, 0x643a24, 0x84502e, // 22-26 leather
    0x30060c, 0x6a1018, 0xa82030, 0xe04454, 0xff9aa0, // 27-31 ruby
    0x081830, 0x12346a, 0x2a5aa8, 0x5a90e0, 0xb0d4ff, // 32-36 sapphire
    0x3a0c0c, 0x701818, 0xa82a22, 0xd04a34, // 37-40 red cloth
    0x1a3a5a, 0x2a5a8a, 0x3a7ab0, // 41-43 painted blue
    0x050505 // 44
  ];
  function build(seed) {
    const env = (typeof process !== 'undefined' && process.env) || {};
    const layer = env.OH_LAYER || '';
    const B = makeBuilder(seed, PAL);
    const S = K.sculpt(makeSculpt(B));
    S.sun = B.norm([-0.45, 0.55, 0.75]);
    S.res = 0.01;
    S.amb = +(env.PAMB || 0.16);
    S.sky = +(env.PSKY || 0.14);
    const n = (x, y, z, f) => B.n3(x * f, y * f, z * f) - 0.5;
    const STEEL = { r: [1, 2, 3, 4, 5, 6, 7, 8], mod: (x, y, z) => 0.025 * n(x, y, z, 30) };
    const DSTEEL = { r: [0, 1, 2, 3, 4] };
    const EDGE = { r: [5, 6, 7, 8, 9] };
    const BRASS = { r: [10, 11, 12, 13, 14, 15] };
    // wood grain runs along the haft (or down the shield's planks): it varies across the grain only, wavering a little
    const acrossX = layer === 'shield' ? [1, 0] : [Math.SQRT1_2, -Math.SQRT1_2];
    const WOOD = { r: [16, 17, 18, 19, 20, 21], mod: (x, y, z) => { const u = x * acrossX[0] + y * acrossX[1], v = x * -acrossX[1] + y * acrossX[0]; return 0.14 * Math.sin(u * 150 + 3 * n(u, v * 0.15, z, 8)) + 0.12 * n(u, v, z, 22) - 0.02; } };
    const LEATHER = { r: [22, 23, 24, 25, 26], mod: (x, y, z) => 0.2 * n(x, y, z, 50) };
    const RUBY = { r: [27, 28, 29, 30, 31] };
    const SAPH = { r: [32, 33, 34, 35, 36] };
    const CLOTH = { r: [37, 38, 39, 40], mod: (x, y, z) => 0.15 * n(x, y, z, 60) };
    const PAINT = { r: [1, 41, 42, 43], mod: (x, y, z) => 0.12 * n(x, y, z, 30) };
    S.lights.push({ p: [-0.6, 0.8, 1.2], r: 3.0, s: 0.5 });

    // the icon frame: local (x across, y along the weapon, z toward the camera), turned by `roll` about the view axis
    const roll = layer === 'shield' ? 0 : -Math.PI / 4;
    const rz = v => [v[0] * Math.cos(roll) - v[1] * Math.sin(roll), v[0] * Math.sin(roll) + v[1] * Math.cos(roll), v[2]];
    const ry = (v, a) => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
    const P = p => rz(p);
    const AX = (yaw = 0) => [rz(ry([1, 0, 0], yaw)), rz(ry([0, 1, 0], yaw)), rz(ry([0, 0, 1], yaw))];
    const box = (c, h, m, o = {}) => S.box(P(c), h, m, { res: 0.004, ...o, ax: AX(o.yaw || 0) });
    const ball = (c, r, m, res = 0.004) => S.ball(P(c), r, m, { res });
    const tube = (pts, r0, r1, m, res = 0.004) => S.tube(pts.map(P), r0, r1, m, { res });
    const lathe = (c, h, r, m, res = 0.004) => S.lathe(P(c), h, r, m, { res, ax: AX() });
    // a flat plate cut to `poly` (local x, y) at local origin `c`, `d` thick toward the camera, optionally turned about its own y
    const plate = (poly, c, d, m, yaw = 0, res = 0.004) => S.extrude([poly], P(c), d, m, { res, ax: AX(yaw) });
    // a bevelled blade: two plates meeting along the midline (x = 0), each turned so its face looks out to its own side
    const bevel = (half, c, d, m, tilt = 0.45) => {
      plate(half.map(([x, y]) => [x, y]), c, d, m, -tilt);
      plate(half.map(([x, y]) => [-x, y]), c, d, m, tilt);
    };
    const wrap = (y0, y1, r, m, bands, bm) => { // a grip wound with strips
      lathe([0, y0, 0], y1 - y0, r, m);
      for (let i = 0; i < bands; i++) { const y = y0 + ((i + 0.5) * (y1 - y0)) / bands; tube([[-r * 1.05, y - 0.012, 0], [r * 1.05, y + 0.012, 0]], r * 0.28, r * 0.28, bm || m, 0.003); }
    };

    if (layer === 'sword') {
      // a long straight blade with a ridge and a fuller, a curled brass guard with a ruby, a leather grip, a faceted pommel
      const half = [[0, -0.2], [0.05, -0.2], [0.05, 0.3], [0.042, 0.5], [0, 0.6]];
      bevel(half, [0, 0, -0.006], 0.012, STEEL, 0.75);
      bevel([[0, -0.2], [0.012, -0.2], [0.012, 0.3], [0, 0.42]], [0, 0, 0.0075], 0.002, DSTEEL, 0.4); // the fuller
      for (const s of [-1, 1]) plate([[0.04, -0.19], [0.052, -0.19], [0.052, 0.3], [0.044, 0.5], [0.004, 0.595], [0.036, 0.49], [0.04, 0.3]].map(([x, y]) => [s * x, y]), [0, 0, -0.004], 0.008, EDGE, -s * 0.5, 0.003); // honed edges
      box([0, -0.225, 0], [0.13, 0.022, 0.026], BRASS, { rd: 0.015 });
      for (const s of [-1, 1]) { ball([s * 0.14, -0.215, 0], 0.03, BRASS); ball([s * 0.155, -0.19, 0], 0.018, BRASS); }
      ball([0, -0.225, 0.022], 0.022, RUBY, 0.003);
      wrap(-0.42, -0.25, 0.026, LEATHER, 6, { r: [23, 24, 25] });
      lathe([0, -0.27, 0], 0.025, 0.032, BRASS); lathe([0, -0.44, 0], 0.025, 0.032, BRASS);
      lathe([0, -0.53, 0], 0.09, t => 0.02 + 0.03 * Math.sin(Math.PI * t), BRASS, 0.003);
      ball([0, -0.485, 0.03], 0.014, RUBY, 0.003);
    } else if (layer === 'axe') {
      // a bearded axe: a grained haft with an iron cap and a leather grip, a forged head with a bright curved edge and rivets
      lathe([0, -0.42, 0], 0.88, t => 0.032 - 0.006 * t, WOOD);
      wrap(-0.38, -0.18, 0.036, LEATHER, 6, { r: [23, 24, 25] });
      lathe([0, -0.46, 0], 0.06, 0.038, DSTEEL); ball([0, -0.46, 0], 0.032, DSTEEL);
      const head = [[-0.04, 0.24], [0.05, 0.25], [0.16, 0.34], [0.24, 0.39], [0.28, 0.3], [0.28, 0.1], [0.25, -0.02], [0.18, 0.02], [0.08, 0.1], [0.05, 0.12], [-0.04, 0.12]];
      plate(head, [0, 0, -0.016], 0.032, STEEL, -0.18);
      plate([[0.24, 0.39], [0.29, 0.31], [0.29, 0.09], [0.25, -0.02], [0.23, 0.01], [0.26, 0.1], [0.26, 0.3], [0.21, 0.37]], [0, 0, -0.01], 0.022, EDGE, -0.5);
      box([-0.06, 0.18, 0], [0.04, 0.07, 0.04], DSTEEL, { rd: 0.012 }); // the poll behind the haft
      box([0.0, 0.18, 0], [0.045, 0.075, 0.042], STEEL, { rd: 0.01 }); // the eye around the haft
      for (const y of [0.15, 0.21]) ball([0.02, y, 0.04], 0.011, BRASS, 0.003);
      lathe([0, 0.25, 0], 0.05, 0.026, WOOD); // haft top through the eye
    } else if (layer === 'spear') {
      // a leaf-bladed spear: ash shaft, brass socket with bands, a red pennant tied under the head, an iron butt spike
      lathe([0, -0.5, 0], 0.95, 0.02, WOOD);
      wrap(-0.05, 0.1, 0.024, LEATHER, 5, { r: [23, 24, 25] });
      lathe([0, 0.44, 0], 0.1, t => 0.024 - 0.008 * t, BRASS);
      for (const y of [0.46, 0.52]) lathe([0, y, 0], 0.012, 0.027, { r: [11, 12, 13] });
      const half = [[0, 0.52], [0.025, 0.55], [0.06, 0.66], [0.055, 0.76], [0, 0.9]];
      bevel(half, [0, 0, -0.006], 0.012, STEEL, 0.55);
      for (const s of [-1, 1]) plate(s > 0 ? [[0.052, 0.62], [0.062, 0.66], [0.057, 0.76], [0.0, 0.9], [0.05, 0.75]] : [[-0.052, 0.62], [-0.05, 0.75], [0.0, 0.9], [-0.057, 0.76], [-0.062, 0.66]], [0, 0, -0.004], 0.008, EDGE, -s * 0.55, 0.003);
      // the pennant, hanging down from just under the socket
      plate([[0.02, 0.42], [0.16, 0.37], [0.12, 0.31], [0.18, 0.24], [0.02, 0.3]], [0, 0, -0.004], 0.008, CLOTH, -0.2, 0.003);
      lathe([0, -0.54, 0], 0.06, t => 0.02 * (1 - t * 0.6), DSTEEL);
    } else if (layer === 'shield') {
      // a round shield face on: planks under a painted ring, a riveted steel rim and a domed brass boss
      const RR = 0.46, cut = t => Math.sqrt(Math.max(0, RR * RR - t * t));
      for (let i = -3; i <= 3; i++) {
        const x = i * 0.13, h = cut(Math.min(Math.abs(x) + 0.06, RR - 0.01));
        S.box([x, 0, -0.01], [0.059, h, 0.03], WOOD, { res: 0.004, rd: 0.01 });
      }
      S.lathe([0, 0, -0.05], 0.03, t => 0.44, { r: [16, 17] }, { res: 0.004, ax: [[1, 0, 0], [0, 0, 1], [0, 1, 0]] }); // dark backing in the plank gaps
      for (let i = 0; i < 64; i++) { const a0 = (i / 64) * Math.PI * 2, a1 = ((i + 1.1) / 64) * Math.PI * 2, r = 0.365; S.tube([[r * Math.cos(a0), r * Math.sin(a0), 0.02], [r * Math.cos(a1), r * Math.sin(a1), 0.02]], 0.035, 0.035, PAINT, { res: 0.004 }); } // a painted ring
      // the rim: a ring of short steel segments
      for (let i = 0; i < 48; i++) { const a0 = (i / 48) * Math.PI * 2, a1 = ((i + 1.1) / 48) * Math.PI * 2; S.tube([[RR * Math.cos(a0), RR * Math.sin(a0), 0.0], [RR * Math.cos(a1), RR * Math.sin(a1), 0.0]], 0.032, 0.032, STEEL, { res: 0.004 }); }
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.26; S.ball([0.405 * Math.cos(a) * 0.98, 0.405 * Math.sin(a) * 0.98, 0.035], 0.014, BRASS, { res: 0.003 }); }
      S.lathe([0, 0, 0.02], 0.025, t => 0.135, DSTEEL, { res: 0.004, ax: [[1, 0, 0], [0, 0, 1], [0, 1, 0]] });
      S.ball([0, 0, 0.035], 0.12, BRASS, { res: 0.004 });
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; S.ball([0.135 * Math.cos(a), 0.135 * Math.sin(a), 0.05], 0.011, DSTEEL, { res: 0.003 }); }
    } else if (layer === 'hammer') {
      // a warhammer: square face, a back spike, brass bands round the head with a sapphire, langets down the haft, wrapped grip
      lathe([0, -0.4, 0], 0.78, 0.028, WOOD);
      wrap(-0.36, -0.14, 0.034, LEATHER, 7, { r: [23, 24, 25] });
      lathe([0, -0.44, 0], 0.05, t => 0.036 - 0.012 * t, BRASS);
      box([0, 0.3, 0], [0.1, 0.075, 0.07], STEEL, { rd: 0.012 }); // the block of the head
      box([0.13, 0.3, 0], [0.035, 0.085, 0.08], STEEL, { rd: 0.01 }); // the striking face, a little proud
      box([0.168, 0.3, 0], [0.006, 0.075, 0.07], EDGE, { res: 0.003, rd: 0.004 });
      plate([[-0.1, 0.25], [-0.1, 0.35], [-0.28, 0.3]], [0, 0, -0.025], 0.05, STEEL, 0.0); // the back spike
      for (const x of [-0.06, 0.06]) box([x, 0.3, 0], [0.012, 0.082, 0.076], BRASS, { res: 0.003, rd: 0.004 });
      ball([0, 0.3, 0.075], 0.022, SAPH, 0.003);
      box([0, 0.395, 0], [0.03, 0.025, 0.03], DSTEEL, { rd: 0.008 }); // the top cap
      for (const s of [-1, 1]) box([s * 0.03, 0.12, 0], [0.006, 0.12, 0.012], DSTEEL, { res: 0.003 }); // langets
      for (const y of [0.05, 0.17]) ball([0, y, 0.03], 0.009, BRASS, 0.003);
    }
    S.bake();
    return B.finish({ cam: { target: [0, 0, 0], dist: 4, pitch: 0, yaw: 0 }, detail: +(env.DETAIL || 26), dither: 0, ao: { k: 0.35, range: 0.1 }, radius: 1.2 });
  }
  return { id: 'oh-weapons', name: 'Ore Heroes weapon icons', seed: 5, build };
};
