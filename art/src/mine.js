// Ore Heroes: the mine, forked from Blacksmith Battles' splat/art/toy-mine.js, now in the detailed splat look: fine splats,
// stone with grain and cracks, timber grain, pebbles, stalactites, crates and a barrel, damp moss, lantern beams and a low haze.
// Each mine hero is its own layer, picked with OH_LAYER (miner, boss, pros, cart, phantom, blast, lamp, time, heap; none = the
// empty cave; all = everyone at once, for a preview). The heroes are sculpted from art/src/heroes.js.
// The ore cart is the Carter's, drawn at OH_Z along the rails, rolling OH_DIR (in = empty, out = full);
// OH_NOBODY=1 draws it empty and parked, with no Carter, for before he is hired.
// Knobs (defaults are the shipped look): HD (splat size), TEX, PROPS, ATMOS (0 turns each off), LIGHT, AO, DITHER, MIST, BEAM.
// The swing clip: ready 0-1 s (pick raised, waiting for a tap), strike 1-1.12 (lands at 1.12), recover 1.12-1.5 (back up to ready).
// Render it at --px 1: tools/render.js does.
const HEROES = require('./heroes.js');
module.exports = ({ makeBuilder, makeSculpt, KIT: K }) => {
  const PAL = [
    0x070605, 0x14100e, 0x211a16, 0x30261f, 0x42352b, 0x584738, 0x725d4a, // 0-6 cave stone (umber)
    0x2a1a10, 0x4a2e1a, 0x6e4628, 0x946238, // 7-10 timber
    0xff9a30, 0xffd060, 0xfff2c0, // 11-13 lantern light
    0x0c1820, 0x1a3040, 0x346078, 0x8ac0d8, // 14-17 water
    0x5a2a14, 0x9a4a22, 0xd88038, 0xf0b070, // 18-21 copper ore
    0x1e3e32, 0x2e6450, 0x4a8a6c, // 22-24 miner's green tunic
    0x2a1e18, 0x4a3628, // 25-26 trousers, boots
    0xd8a07a, // 27 skin
    0x8a6020, 0xc89838, // 28-29 brass helmet
    0x2a2e36, 0x5a606a, 0x9aa2b0, // 30-32 iron (pick head, rails, cart bands)
    0x6a4428, 0x9a6634, 0xc8904a, // 33-35 lantern-lit stone
    0x1e7a70, 0x5ae0c8, 0xc8fff4, // 36-38 phantom glow
    0x5a1010, 0xa82a1c, 0xe04a30, // 39-41 dynamite and bandana red
    0x1e2e4a, 0x2e4a78, 0x4a6ea8, // 42-44 the Prospector's blue shirt
    0x5a4210, 0x8a6a20, 0xc09a38, // 45-47 the Lamplighter's mustard coat
    0x24242a, 0x3c3c46, 0x60606e, 0xd8d0c0, // 48-51 the Foreman's grey suit and white shirt
    0x7a4ad8, 0xb89aff, 0xf0e8ff, // 52-54 time glow (sand, hourglass light)
    0x1a1430, 0x2e2450, 0x4a3a7a, // 55-57 the Time Miner's robe
    0x1c1512, 0x3a2c22, 0x52402e, 0x8a5e3a, 0xb07c4c, 0xe0b078, 0x0f0b09, // 58-64 more stone steps (HD)
    0x5a3a20, 0xb07a44, // 65-66 more timber steps
    0xffd0a0, // 67 ore sparkle
    0x3a2a20, 0xffc880, 0x24302e, 0x3e5a50, // 68 haze, 69 lantern beam, 70-71 damp moss
    ...HEROES.COLOURS // 72 on: the heroes' own colours (art/src/heroes.js)
  ];
  function build(seed) {
    const env = (typeof process !== 'undefined' && process.env) || {};
    const B = makeBuilder(seed, PAL);
    const S = K.sculpt(makeSculpt(B));
    const tags = K.deform.tags(S);
    const HD = +(env.HD || 0.5); // splat size: 0.5 = the detailed look
    for (const m of ['lathe', 'rock', 'box', 'tube', 'ball', 'extrude']) { const f = S[m].bind(S); S[m] = (...a) => { const o = a[a.length - 1]; if (o && typeof o === 'object' && !Array.isArray(o) && 'res' in o) a[a.length - 1] = {...o, res: o.res * HD}; return f(...a) } }
    S.sun = B.norm([0.3, 0.5, 0.8]);
    S.res = 0.08 * HD;
    S.amb = 0.025;
    S.sky = 0.02; // nearly black: the lanterns do the lighting
    const ROCK = { r: [0, 0, 1, 2, 33, 34, 35] };
    const FLOOR = { r: [0, 1, 2, 33, 34, 35] };
    const WOOD = { r: [7, 8, 9, 10] };
    const IRON = { r: [0, 30, 31, 32] };
    const LAMP = { r: [11, 12, 13], em: true };
    const WATER = { r: [14, 15, 16] };
    const ORE = { r: [18, 19, 20, 21] };
    const TEX = env.TEX !== '0', PROPS = env.PROPS !== '0', ATMOS = env.ATMOS !== '0';
    if (TEX) {
      // stone with grain: smooth noise shifts each dab up or down its ramp, and the cracks between voronoi cells run darker
      const cracks = K.tex.range(K.tex.voronoi(1.8, { out: 'edge' }), 0, 1, -0.22, 0.06);
      const n = (x, y, z, f) => B.n3(x * f, y * f, z * f) - 0.5;
      Object.assign(ROCK, { r: [64, 0, 1, 58, 2, 59, 3, 33, 60, 34, 61, 35, 62], mod: (x, y, z) => 0.35 * n(x, y, z, 1.3) + 0.15 * n(x, y, z, 5) + cracks(x, y, z) });
      Object.assign(FLOOR, { r: [64, 0, 1, 58, 2, 59, 33, 60, 34, 61, 35], mod: (x, y, z) => 0.3 * n(x, y, z, 2.2) + 0.2 * n(x, y, z, 9) });
      Object.assign(WOOD, { r: [7, 8, 65, 9, 10, 66], mod: K.tex.range(K.tex.wave(9, { warp: 0.4 }), 0, 1, -0.2, 0.15) });
      Object.assign(ORE, { r: [18, 19, 20, 21, 67], mod: (x, y, z) => 0.3 * n(x, y, z, 6) });
    }
    const R = 5.2, RI = 4.6, H = 6.5;
    // every light goes in before the first bake: a bake shades with the lights it has at the time
    const LAMPS = [[-0.95, 0.8], [0.75, 0.8]].map(([a]) => [Math.sin(a) * (RI - 0.55), 2.3, -Math.cos(a) * (RI - 0.55)]);
    LAMPS.push([-0.9, 2.0, -RI + 0.15]);
    const LK = +(env.LIGHT || 1.6);
    for (const [x, y, z] of LAMPS) S.lights.push({ p: [x, y - 0.6, z + 0.35], r: 3.0 * Math.sqrt(LK), s: 1.5 * LK });
    S.lights.push({ p: [2.65, 1.7, 1.0], r: 3.2 * Math.sqrt(LK), s: 1.8 * LK }, { p: [1.0, 1.5, 1.3], r: 1.5, s: 0.6 * LK }); // the lantern on a post by the boulder; a little light on the miner

    // OH_PORTRAIT=1: no cave at all, just the hero (and the things that are his), lit softly from the front: for the portrait icons
    const PORTRAIT = env.OH_PORTRAIT === '1', OX = 1.7, OZ = 0.6;
    if (PORTRAIT) { S.amb = 0.3; S.sky = 0.25; }
    if (!PORTRAIT) {
    // ---- floor and a rock dome, front half cut away ----
    S.lathe([0, -0.5, 0], 0.5, R + 0.3, FLOOR, { res: 0.1 });
    S.bake(); // the floor keeps its front half
    S.lathe([0, 0, 0], H, t => R * Math.sqrt(Math.max(0.02, 1 - Math.pow(t, 2.2))), ROCK, { res: 0.1 });
    S.lathe([0, -0.1, 0], H - 0.5, t => RI * Math.sqrt(Math.max(0.02, 1 - Math.pow(t, 2.2))), ROCK, { neg: true });
    S.box([0, H / 2, R], [R + 1, H / 2 + 1, R], ROCK, { neg: true });
    // the tunnel mouth at the back
    const arch = (w, h) => { const p = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); p.push([Math.cos(a) * w, h + Math.sin(a) * w]); } p.push([-w, 0], [w, 0]); return p; };
    S.extrude([arch(0.8, 1.1)], [-0.9, 0, -RI], 2.4, ROCK, { neg: true });
    S.bake();
    // boulders along the foot of the wall, so the cave reads as rock not plaster
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI * 0.5 + Math.PI * (i / 15) + 0.08 * Math.sin(i * 3.1);
      if (Math.abs(a + 0.19) < 0.2) continue; // keep the tunnel clear
      const rr = RI - 0.15, sz = 0.35 + 0.25 * K.hash(i, 3);
      S.rock([Math.sin(a) * rr, sz * 0.45, -Math.cos(a) * rr], sz, ROCK, { res: 0.07 });
    }
    // a few ledges up the wall
    for (const [a, y, sz] of [[-1.05, 2.4, 0.5], [0.9, 3.1, 0.45], [1.25, 1.6, 0.55], [-1.3, 3.6, 0.4]])
      S.rock([Math.sin(a) * (RI - 0.1), y, -Math.cos(a) * (RI - 0.1)], sz, ROCK, { res: 0.07 });
    S.bake();

    // ---- timber in the tunnel mouth and two frames against the wall ----
    const frame = (x, z, rot, w, h) => {
      const c = Math.cos(rot), s = Math.sin(rot), at = (dx, y) => [x + c * dx, y, z + s * dx];
      for (const sd of [-1, 1]) S.box(at(sd * w, h / 2), [0.1, h / 2, 0.1], WOOD, { res: 0.04 });
      S.tube([at(-w - 0.15, h), at(w + 0.15, h)], 0.11, 0.11, WOOD, { res: 0.04 });
      return at;
    };
    frame(-0.9, -RI + 0.15, 0, 0.85, 2.0);
    const lampAt = [];
    for (const [a, w] of [[-0.95, 0.8], [0.75, 0.8]]) {
      const x = Math.sin(a) * (RI - 0.55), z = -Math.cos(a) * (RI - 0.55);
      const at = frame(x, z, a, w, 2.3);
      lampAt.push(at(0, 2.3));
    }
    // lanterns hanging from the frames and one from a hook in the tunnel
    lampAt.push([-0.9, 2.0, -RI + 0.15]);
    for (const [x, y, z] of lampAt) {
      S.tube([[x, y - 0.1, z + 0.12], [x, y - 0.35, z + 0.12]], 0.012, 0.012, IRON, { res: 0.01 });
      S.box([x, y - 0.38, z + 0.12], [0.09, 0.025, 0.09], IRON, { res: 0.015 });
      S.box([x, y - 0.68, z + 0.12], [0.1, 0.025, 0.1], IRON, { res: 0.015 });
      S.box([x, y - 0.53, z + 0.12], [0.07, 0.13, 0.07], LAMP, { res: 0.015 });
    }

    // ---- rails out of the tunnel, and an ore cart ----
    for (const sd of [-1, 1]) S.tube([[-0.9 + sd * 0.38, 0.04, -RI - 0.5], [-0.9 + sd * 0.38, 0.04, 1.5]], 0.03, 0.03, IRON, { res: 0.02 });
    for (let i = 0; i < 9; i++) S.box([-0.9, 0.02, -RI + 0.1 + i * 0.66], [0.55, 0.03, 0.07], WOOD, { res: 0.025 });
    // ---- a copper vein in the right wall ----
    for (let i = 0; i < 6; i++) {
      const a = 0.45 + 0.07 * i, y = 0.9 + 0.3 * i + 0.15 * Math.sin(i * 2.3);
      const rr = RI * Math.sqrt(Math.max(0.02, 1 - Math.pow(y / (H - 0.5), 2.2))) - 0.02;
      S.rock([Math.sin(a) * rr, y, -Math.cos(a) * rr], 0.16 + 0.06 * K.hash(i, 9), ORE, { res: 0.03 });
    }

    // a lantern on a post beside the boulder, so the miner works in its pool of light
    S.box([3.15, 1.15, 1.0], [0.06, 1.15, 0.06], WOOD, { res: 0.03 });
    S.box([2.97, 2.3, 1.0], [0.24, 0.04, 0.04], WOOD, { res: 0.025 });
    S.box([2.75, 2.12, 1.0], [0.06, 0.018, 0.06], IRON, { res: 0.012 });
    S.box([2.75, 1.9, 1.0], [0.07, 0.018, 0.07], IRON, { res: 0.012 });
    S.box([2.75, 2.01, 1.0], [0.05, 0.09, 0.05], LAMP, { res: 0.012 });
    S.tube([[2.75, 2.13, 1.0], [2.75, 2.28, 1.0]], 0.01, 0.01, IRON, { res: 0.01 });
    // ---- the ore boulder the miner works ----
    
    S.rock([OX, 0.35, OZ], 0.5, ROCK, { res: 0.04 });
    for (const [dx, dy, dz, s] of [[-0.32, 0.45, 0.25, 0.17], [-0.1, 0.72, 0.15, 0.15], [0.15, 0.55, 0.38, 0.16], [-0.38, 0.2, 0.35, 0.13], [0.3, 0.3, 0.42, 0.12]])
      S.rock([OX + dx, dy, OZ + dz], s, ORE, { res: 0.025 });
    if (PROPS) {
      const h = (i, k) => K.hash(i, k);
      // pebbles and chips all over the floor, thicker toward the walls
      for (let i = 0; i < 260; i++) {
        const a = -Math.PI * 0.55 + Math.PI * 1.1 * h(i, 21), rr = RI * Math.sqrt(0.15 + 0.85 * h(i, 22)), x = Math.sin(a) * rr, z = -Math.cos(a) * rr;
        if (Math.abs(x + 0.9) < 0.75 && z > -RI) continue; // keep the rails clear
        const sz = 0.025 + 0.06 * h(i, 23) * h(i, 24) * (0.6 + rr / RI);
        S.rock([x, sz * 0.4, z], sz, h(i, 25) < 0.12 ? ORE : ROCK, { res: 0.012 });
      }
      // stalactites hanging from the roof
      for (let i = 0; i < 22; i++) {
        const y = 3.9 + 1.6 * h(i, 31), a = -1.35 + 2.7 * h(i, 32);
        const rr = RI * Math.sqrt(Math.max(0.02, 1 - Math.pow(y / (H - 0.5), 2.2))) - 0.15, len = 0.25 + 0.6 * h(i, 33);
        const top = [Math.sin(a) * rr, y + 0.1, -Math.cos(a) * rr];
        S.tube([top, [top[0] * 0.97, y - len, top[2] * 0.97]], 0.09 + 0.06 * h(i, 34), 0.008, ROCK, { res: 0.02 });
      }
      // crates and a barrel by the left frame, planks leaning on the wall
      const crate = (x, z, s, r) => { S.box([x, s, z], [s, s, s], WOOD, { res: 0.02, ax: B.frame(r, 0, 0), rd: 0.01 });
        for (const dy of [-0.6, 0, 0.6]) S.box([x, s + dy * s, z + s + 0.005], [s * 1.02, 0.025, 0.012], { r: [7, 8, 65] }, { res: 0.012, ax: B.frame(r, 0, 0) }) };
      crate(-2.45, -2.6, 0.22, 0.3); crate(-2.15, -2.75, 0.17, -0.2); crate(-2.35, -2.65, 0.15, 0.6);
      S.lathe([2.15, 0, -2.4], 0.62, t => 0.2 + 0.035 * Math.sin(t * Math.PI), WOOD, { res: 0.016 });
      for (const dy of [0.1, 0.52]) S.lathe([2.15, dy, -2.4], 0.035, t => 0.22 + 0.035 * Math.sin((dy / 0.62) * Math.PI), IRON, { res: 0.01 });
      for (let i = 0; i < 3; i++) S.box([-3.95 + i * 0.13, 0.9, -1.75 + i * 0.05], [0.05, 0.9, 0.012], WOOD, { res: 0.014, ax: B.frame(0.5, 0, 0.18) });
      // spilled ore beside the rails and a puddle under the tunnel mouth
      for (let i = 0; i < 14; i++) S.rock([-1.95 + 0.5 * h(i, 41), 0.05, 0.6 + 0.9 * h(i, 42)], 0.04 + 0.05 * h(i, 43), ORE, { res: 0.012 });
      S.ball([-0.2, 0.0, -3.4], [0.55, 0.012, 0.3], WATER, { res: 0.02 });
      // damp moss in the cracks low on the wall
      S.bake();
      S.cover({ r: [64, 70, 71] }, { up: 0.75, thick: 0.03, where: (x, y, z) => y < 1.2 && Math.hypot(x, z) > RI - 0.8 && B.n3(x * 2.5, y * 2.5, z * 2.5) > 0.7 });
    }
    S.bake();


    // ---- the air: a low haze, beams under every lantern, glints on the copper. Made before any hero so that every layer draws
    // exactly the same air (the builder's random numbers are used in order), and held still so it matches the background at any t ----
    if (ATMOS) {
      const still = f => (...a) => f(...a.slice(0, -1), { em: true, nd: true });
      const stick = B.stick, axial = B.axial;
      B.stick = still(stick); B.axial = (...a) => axial(...a.slice(0, -1), { nd: true });
      K.mist(B, { rad: RI, y: 0.15, depth: 0.5, n: 140, cols: [68, 2], a: +(env.MIST || 0.05), size: [0.5, 1.1], drift: 0, where: (x, z) => Math.hypot(x, z) < RI - 0.3 });
      for (const [x, y, z] of LAMPS) K.shafts(B, { from: [x, y - 0.45, z + 0.12], dir: [0, -1, 0.12], len: 1.9, r: 0.38, n: 8, col: 69, a: +(env.BEAM || 0.16) });
      K.shafts(B, { from: [2.75, 1.9, 1.0], dir: [-0.2, -1, -0.1], len: 1.8, r: 0.45, n: 8, col: 69, a: +(env.BEAM || 0.16) });
      B.stick = stick; B.axial = axial;
      for (let i = 0; i < 9; i++) K.glint(B, [1.2 + 0.4 * K.hash(i, 51), 0.4 + 0.5 * K.hash(i, 52), 0.85 + 0.2 * K.hash(i, 53)], [0.3, 1, 0], 0.06, 67);
    }
    } // the cave

    // =================== the mine heroes ===================
    // OH_LAYER picks the one hero drawn in this render (none = the empty cave, the background). Every render keeps the
    // same lights and the same scenery, so a hero's cut-out is just the pixels that differ from the background.
    // Thin, wiry people with faces, fur beards and clothes with weave; each keeps the tags and pivots its clip drives.
    const ease = x => x * x * (3 - 2 * x);
    const tn = (axis, deg) => K.M.rot(axis, (deg * Math.PI) / 180); // a turn about an axis, for pose.turn
    const C = HEROES.palette(72), HB = HEROES(S, K, B, C), Mt = HB.M;
    const SK = Mt.skin(C.skin), flat = Mt.flat, glow = Mt.glow;
    const LEATH = Mt.leather(C.leather), BRASS = Mt.metal(C.brass), IRONM = Mt.metal(C.iron);
    const layer = env.OH_LAYER || '', all = layer === 'all';
    const on = k => all || layer === k;
    const parts = {};
    let pose = null;
    // braces over the shoulders, front and back, buttoned at the waist
    const braces = (F, bd, m, btn) => { for (const s of [-1, 1]) {
      HB.tube(F, [[s * 0.05, bd.hip + 0.06, 0.09], [s * 0.055, bd.ch - 0.07, 0.092], [s * 0.07, bd.ch + 0.075, 0.045], [s * 0.07, bd.ch + 0.08, -0.05], [s * 0.05, bd.ch - 0.07, -0.085], [s * 0.045, bd.hip + 0.06, -0.08]], 0.011, 0.011, m, 'body', 0.005);
      HB.box(F, [s * 0.05, bd.hip + 0.07, 0.095], [0.01, 0.009, 0.008], btn || BRASS, 'body', 0.003);
    } };
    // a knotted neckerchief
    const kerchief = (F, bd, m, tag = 'body') => {
      HB.ball(F, [0, bd.ch + 0.085, bd.lean + 0.01], [0.062, 0.028, 0.06], m, tag, 0.004);
      HB.tube(F, [[0, bd.ch + 0.07, bd.lean + 0.06], [0.005, bd.ch + 0.0, bd.lean + 0.1], [0, bd.ch - 0.05, bd.lean + 0.098]], 0.03, 0.006, m, tag, 0.004);
    };

    // ---- you, the Miner: a thin old miner at the boulder. Brass helmet and lamp, a bushy ginger beard, green shirt with the
    // sleeves rolled, braces, a leather apron with a chisel in the pocket, a coil of rope at his hip. Built in the strike pose ----
    if (on('miner')) {
      const F = HB.rig(OX - 0.95, OZ + 0.15, [1, 0]);
      const shirt = Mt.cloth(C.shirt);
      const bd = HB.body(F, { shirt, trous: Mt.cloth(C.trous, 0.2), boot: Mt.leather(C.boot), skin: SK, belt: LEATH, buckle: BRASS });
      const hd = HB.head(F, bd.head, { skin: SK, beard: 'full', nose: 'round' });
      HB.hats.helmet(F, hd.top, 'body');
      for (const s of [-1, 1]) HB.tube(F, [[s * 0.125, hd.top[1] - 0.02, bd.head[2]], [s * 0.11, bd.head[1] - 0.065, bd.head[2] + 0.04], [s * 0.07, bd.head[1] - 0.135, bd.head[2] + 0.06]], 0.008, 0.008, LEATH, 'body', 0.004); // chin strap
      braces(F, bd, LEATH);
      HB.box(F, [0, 0.54, 0.1], [0.075, 0.15, 0.009], LEATH, 'body', 0.005, null, 0.008); // the apron
      HB.box(F, [0, 0.39, 0.095], [0.072, 0.008, 0.01], flat([C.leather[0]]), 'body', 0.004); // its worn hem
      HB.box(F, [0.04, 0.58, 0.112], [0.03, 0.032, 0.009], flat(C.leather.slice(0, 2)), 'body', 0.004, null, 0.006); // a pocket
      HB.tube(F, [[0.03, 0.6, 0.122], [0.038, 0.66, 0.122]], 0.005, 0.005, IRONM, 'body', 0.003); // a chisel in it
      HB.box(F, [-0.11, 0.64, 0.03], [0.025, 0.04, 0.045], LEATH, 'body', 0.005, null, 0.012); // a pouch
      for (let i = 0; i < 3; i++) HB.tube(F, [[-0.11, 0.6 - i * 0.025, -0.07], [-0.13, 0.58 - i * 0.025, -0.01], [-0.11, 0.6 - i * 0.025, 0.04]], 0.011, 0.011, flat(C.rope), 'body', 0.004); // rope
      // both hands on the haft, the point in the ore
      const SR = bd.sh(1), SL = bd.sh(-1), hR = [0.05, 0.79, 0.31], hL = [-0.03, 0.78, 0.21];
      const ao = { tag: 'arm', sleeve: shirt, rolled: true, cuff: flat(C.shirt.slice(1, 4)), skin: SK };
      HB.arm(F, SR, HB.elbow(SR, hR, [0.05, -0.06, -0.05]), hR, ao);
      HB.arm(F, SL, HB.elbow(SL, hL, [-0.05, -0.07, -0.03]), hL, ao);
      HB.pick(F, [0.01, 0.79, 0.12], [0.03, 0.6, 0.65], { tag: 'arm' });
      parts.body = { pivot: F.P(0, 0.2, 0), slices: 4 }; parts.arm = { pivot: F.P(0, bd.ch + 0.05, 0), parent: 'body', slices: 2 };
      pose = swingPose('arm', 'body');
    }

    // ---- the Prospector: an old hand at a rock of his own under the left frame. A battered wide hat with a feather, a long grey
    // beard, squinting from years of looking for colour; denim shirt, red neckerchief, leather vest, a satchel, a gold pan on his back ----
    const PRX = -3.35, PRZ = -1.0;
    if (on('pros')) {
      const rx = PRX + 0.9, rz = PRZ - 0.05;
      S.rock([rx, 0.3, rz], 0.42, ROCK, { res: 0.04 });
      for (const [dx, dy, dz, s] of [[-0.25, 0.4, 0.22, 0.14], [-0.05, 0.6, 0.15, 0.13], [0.12, 0.42, 0.3, 0.13], [-0.3, 0.18, 0.3, 0.11]])
        S.rock([rx + dx, dy, rz + dz], s, ORE, { res: 0.025 });
      S.bake();
      const F = HB.rig(PRX, PRZ, [1, 0]);
      const shirt = Mt.cloth(C.denim, 0.22);
      const bd = HB.body(F, { shirt, trous: Mt.cloth(C.tweed, 0.25), boot: Mt.leather(C.boot), skin: SK, belt: LEATH, buckle: BRASS });
      const hd = HB.head(F, bd.head, { skin: SK, beard: 'long', beardRamp: C.grey, brow: C.grey.slice(1), eyes: 'squint', nose: 'hook' });
      HB.hats.brim(F, hd.top, 'body');
      kerchief(F, bd, Mt.cloth(C.red, 0.2));
      for (const s of [-1, 1]) HB.box(F, [s * 0.058, bd.ch - 0.08, 0.088], [0.042, 0.13, 0.012], LEATH, 'body', 0.004, null, 0.01); // vest fronts
      for (const y of [0.04, -0.04, -0.12]) HB.ball(F, [0.022, bd.ch + y, 0.1], 0.008, BRASS, 'body', 0.002); // vest buttons
      HB.tube(F, [[0.1, bd.ch + 0.06, 0.06], [0, bd.ch - 0.1, 0.105], [-0.1, bd.hip + 0.02, 0.05]], 0.012, 0.012, LEATH, 'body', 0.004); // satchel strap
      HB.box(F, [-0.12, bd.hip - 0.02, 0.0], [0.03, 0.06, 0.07], LEATH, 'body', 0.005, null, 0.012); // the satchel
      HB.box(F, [-0.125, bd.hip + 0.03, 0.0], [0.034, 0.02, 0.072], flat(C.leather.slice(1, 3)), 'body', 0.004, null, 0.01); // its flap
      HB.ball(F, [0, bd.ch - 0.06, -0.135], [0.13, 0.13, 0.018], BRASS, 'body', 0.004); // a gold pan slung on his back
      HB.torus(F, [0, bd.ch - 0.06, -0.15], 0.01, 0.006, flat(C.brass.slice(2)), 'body', 0.002);
      const SR = bd.sh(1), SL = bd.sh(-1), hR = [0.0, 0.725, 0.3], hL = [-0.04, 0.72, 0.2];
      const ao = { tag: 'arm', sleeve: shirt, cuff: flat(C.denim.slice(2)), skin: SK };
      HB.arm(F, SR, HB.elbow(SR, hR, [0.05, -0.06, -0.05]), hR, ao);
      HB.arm(F, SL, HB.elbow(SL, hL, [-0.05, -0.07, -0.03]), hL, ao);
      HB.pick(F, [-0.03, 0.73, 0.12], [-0.07, 0.52, 0.62], { tag: 'arm' });
      parts.body = { pivot: F.P(0, 0.2, 0), slices: 4 }; parts.arm = { pivot: F.P(0, bd.ch + 0.05, 0), parent: 'body', slices: 2 };
      pose = swingPose('arm', 'body');
    }

    // ---- the Carter and the ore cart. OH_Z = where on the rails, OH_DIR = in|out. Tweed flat cap, mutton chops, a collarless shirt
    // with the sleeves rolled, red braces, leather gloves, a rag in his back pocket; he walks beside the rails, a hand on the rim ----
    if (layer === 'cart' || all) {
      const CZ = +(env.OH_Z || -2.9), out = env.OH_DIR !== 'in', full = out;
      const CX = -0.9;
      S.box([CX, 0.55, CZ], [0.45, 0.3, 0.6], WOOD, { res: 0.04, rd: 0.03, tag: 'cart' });
      S.box([CX, 0.7, CZ], [0.38, 0.2, 0.53], WOOD, { neg: true });
      for (const dz of [-0.45, 0.45]) S.box([CX, 0.55, CZ + dz], [0.47, 0.32, 0.03], IRON, { res: 0.02, tag: 'cart' });
      for (const dz of [-0.4, 0.4]) for (const sd of [-1, 1]) S.lathe([CX + sd * 0.44, 0.17, CZ + dz], 0.06, 0.13, IRON, { res: 0.02, ax: [[0, 1, 0], [1, 0, 0], [0, 0, 1]], tag: 'cart' });
      for (const dz of [-0.3, 0, 0.3]) for (const sd of [-1, 1]) S.ball([CX + sd * 0.47, 0.7, CZ + dz], 0.022, IRON, { res: 0.01, tag: 'cart' }); // rivets
      if (full) for (let i = 0; i < 6; i++) S.rock([CX - 0.25 + (i % 3) * 0.25, 0.85 + 0.05 * (i % 2), CZ - 0.3 + Math.floor(i / 3) * 0.4], 0.18, ORE, { res: 0.03, tag: 'cart' });
      if (env.OH_NOBODY === '1') { S.bake(); } else {
        const f = out ? [0, 1] : [0, -1], hs = out ? -1 : 1; // hs: the side the cart is on
        const F = HB.rig(CX - 0.78, CZ + (out ? -0.15 : 0.15), f);
        const shirt = Mt.cloth(C.grey.slice(1), 0.15), glove = Mt.leather(C.leather.slice(1));
        const bd = HB.body(F, { shirt, trous: Mt.cloth(C.tweed, 0.3), boot: Mt.leather(C.boot), skin: SK, belt: LEATH, buckle: IRONM, legTags: ['legL', 'legR'] });
        const hd = HB.head(F, bd.head, { skin: SK, beard: 'mutton', beardRamp: C.dark, brow: C.dark, nose: 'round', tash: 'droop' });
        HB.hats.cap(F, hd.top, 'body');
        braces(F, bd, Mt.cloth(C.red, 0.15));
        HB.box(F, [0.06, bd.hip - 0.03, -0.085], [0.03, 0.045, 0.01], Mt.cloth(C.red, 0.3), 'body', 0.004); // a rag in his back pocket
        const ao = { sleeve: shirt, rolled: true, cuff: flat(C.grey.slice(2)), skin: SK, glove };
        const sr = bd.sh(-hs), rim = [-0.4 * hs, 0.86, 0.05];
        HB.arm(F, sr, HB.elbow(sr, rim, [-0.03 * hs, -0.08, -0.02]), rim, { ...ao, tag: 'body' }); // a hand on the rim
        const sb = bd.sh(hs), hb = [0.16 * hs, 0.7, 0.0];
        HB.arm(F, sb, HB.elbow(sb, hb, [0.03 * hs, 0, -0.02]), hb, { ...ao, tag: 'armB', grip: false });
        parts.legL = { pivot: F.P(-0.065, bd.hip, 0), slices: 2 }; parts.legR = { pivot: F.P(0.065, bd.hip, 0), slices: 2 };
        parts.armB = { pivot: F.P(...sb), slices: 2 };
        // a two-step walk: one stride per second of clip time
        pose = (t, dt, pup) => { const w = Math.sin(t * Math.PI * 2) * 22; const ax = out ? 1 : -1;
          pup.pose.legL = { rot: [w * ax, 0, 0] }; pup.pose.legR = { rot: [-w * ax, 0, 0] }; pup.pose.armB = { rot: [-w * 0.8 * ax, 0, 0] }; };
      }
    }

    // ---- the Phantom Pick: the ghost of an old miner, still working the copper vein in the right wall. A hooded wraith with a
    // drooping spectral beard, two lamp-bright eyes and a tail of mist where his legs were; shackles and a broken chain on his wrists.
    // His pick glows, with runes down the haft and wisps streaming off the head. The pick turns about the grip in his hands ----
    if (on('phantom')) {
      const va = 0.6, vy = 1.55, rr = RI * Math.sqrt(Math.max(0.02, 1 - Math.pow(vy / (H - 0.5), 2.2)));
      const V = [Math.sin(va) * rr, vy, -Math.cos(va) * rr]; // the vein, where the point lands
      const n3 = (x, y, z, f) => B.n3(x * f, y * f, z * f) - 0.5;
      let GH = { r: C.ghost.slice(1), em: true, mod: (x, y, z) => 0.35 * n3(x, y, z, 7) };
      const GHB = { r: C.ghost.slice(1), em: true }, GHW = { r: C.ghost.slice(2), em: true }, VOID = { r: [C.black[0], C.ghost[0]] };
      // the pick, drawn side-on to the camera so it reads as a pickaxe: the haft rises from the grip (lower left), the head crosses
      // its top, and in the strike pose its point is in the vein
      const Z = 0.3, at = (x, y, z = Z) => [V[0] + x, V[1] + y, V[2] + z];
      const d = [0.62, 0.78], p = [0.78, -0.62]; // up the haft; across it, toward the point
      const T = at(-p[0] * 0.5, -p[1] * 0.5), G = at(-p[0] * 0.5 - d[0] * 0.95, -p[1] * 0.5 - d[1] * 0.95);
      const along = u => G.map((v, i) => v + (T[i] - v) * u);
      S.tube([G, T.map((v, i) => v + [d[0] * 0.08, d[1] * 0.08, 0][i])], 0.03, 0.026, GH, { tag: 'pick', res: 0.006 }); // the haft
      for (const u of [0.3, 0.42, 0.54, 0.66, 0.78]) S.ball(along(u).map((v, i) => v + [0, 0, 0.027][i]), 0.011, GHW, { tag: 'pick', res: 0.003 }); // runes
      for (const u of [0.05, 0.18]) S.torus(along(u), 0.032, 0.008, GHB, { tag: 'pick', res: 0.003, ax: [[p[0], p[1], 0], [d[0], d[1], 0], [0, 0, 1]] }); // bindings
      S.tube([T, at(-p[0] * 0.25 + d[0] * 0.03, -p[1] * 0.25 + d[1] * 0.03), at(-0.02, 0.0, 0.08)], t => 0.06 * (1 - t) + 0.004, null, GH, { tag: 'pick', res: 0.005 }); // the point, curving into the vein
      S.tube([T, at(-p[0] * 0.75 + d[0] * 0.04, -p[1] * 0.75 + d[1] * 0.04), at(-p[0] * 0.98, -p[1] * 0.98)], t => 0.06 - 0.02 * t, null, GH, { tag: 'pick', res: 0.005 }); // the flat back
      S.box(T, [0.07, 0.075, 0.06], GHB, { tag: 'pick', res: 0.004, rd: 0.02, ax: [[p[0], p[1], 0], [d[0], d[1], 0], [0, 0, 1]] }); // the eye of the head
      S.ball(T.map((v, i) => v + [0, 0, 0.06][i]), 0.02, GHW, { tag: 'pick', res: 0.003 });
      for (let i = 0; i < 6; i++) { const k = (i + 1) / 7, b = at(-p[0] * 0.98 - d[0] * 0.08 * k - 0.12 * k, -p[1] * 0.98 + 0.1 * k + 0.05 * Math.sin(i * 2.1), Z - 0.04 * i);
        S.ball(b, 0.035 * (1 - k) + 0.008, GHB, { tag: 'pick', res: 0.004 }); } // wisps streaming off the back of the head
      // the wraith, floating to the left of the grip and facing the vein
      const F = HB.rig(G[0] - 0.42, G[2] - 0.04, [0.55, 0.85]), Y0 = G[1] + 0.12, P = (a, y, b) => [a, Y0 + y, b];
      // dark and deep in the tail, brighter toward the hood; a mottle of mist all over
      GH = { r: C.ghost.slice(0, 3), em: true, mod: (x, y, z) => 0.45 * n3(x, y, z, 6) + 0.9 * (y - Y0 - 0.1) };
      const gt = 'ghost', R = 0.005;
      HB.tube(F, [P(0, 0.08, 0), P(0, -0.18, -0.03), P(0.02, -0.42, -0.12), P(-0.03, -0.62, -0.3), P(0.02, -0.7, -0.5), P(0.06, -0.66, -0.62)], t => 0.15 * (1 - t) * (1 - t) + 0.008, null, GH, gt, R); // the robe, ending in a tail
      for (let i = 0; i < 7; i++) { const a = -0.12 + 0.04 * i, l = 0.08 + 0.06 * K.hash(i, 61);
        HB.tube(F, [P(a, -0.12, 0.05 - Math.abs(a) * 0.4), P(a * 1.2, -0.12 - l, 0.02 - Math.abs(a) * 0.4)], 0.022, 0.003, GH, gt, R); } // ragged hem
      HB.ball(F, P(0, 0.1, 0), [0.16, 0.1, 0.12], GH, gt, R); // shoulders
      HB.tube(F, [P(0, 0.14, -0.02), P(0, 0.32, 0), P(0, 0.44, -0.08), P(0, 0.5, -0.18)], t => 0.135 * (1 - t * t) + 0.01, null, GH, gt, R); // the hood, its point flopping back
      HB.ball(F, P(0, 0.29, 0.075), [0.095, 0.11, 0.065], VOID, gt, R); // the dark inside the hood
      for (const s of [-1, 1]) { HB.ball(F, P(s * 0.038, 0.31, 0.125), [0.026, 0.017, 0.012], GHW, gt, 0.002); HB.ball(F, P(s * 0.038, 0.312, 0.135), [0.012, 0.008, 0.006], { r: [C.ghost[3]], em: true }, gt, 0.0015) } // eyes
      for (let i = 0; i < 5; i++) { const a = -0.04 + 0.02 * i; HB.tube(F, [P(a, 0.25, 0.11), P(a * 1.3, 0.12, 0.13), P(a * 1.6 + 0.01 * Math.sin(i), 0.0 - 0.04 * K.hash(i, 62), 0.11)], 0.012, 0.003, GHB, gt, 0.003) } // a drooping beard of mist
      // spectral arms out to the grip; the hands close on the haft (in the pick's part, so they stay on it)
      const o0 = F.P(0, 0, 0), dG = [G[0] - o0[0], G[2] - o0[2]];
      const gLocal = [dG[0] * F.side[0] + dG[1] * F.side[2], G[1] - Y0, dG[0] * F.fwd[0] + dG[1] * F.fwd[2]];
      const grp = P(...gLocal), grp2 = P(gLocal[0] + 0.02, gLocal[1] + 0.04, gLocal[2] + 0.01);
      for (const [s, h] of [[-1, grp], [1, grp2]]) {
        const sh = P(s * 0.13, 0.1, 0);
        HB.tube(F, [sh, [(sh[0] + h[0]) / 2, (sh[1] + h[1]) / 2 - 0.06, (sh[2] + h[2]) / 2], h], 0.045, 0.022, GH, gt, R);
        HB.torus(F, HB.lerp(sh, h, 0.82), 0.026, 0.008, IRONM, gt, 0.003); // a shackle
      }
      for (let i = 0; i < 4; i++) HB.torus(F, [grp[0] - 0.01, grp[1] - 0.06 - i * 0.035, grp[2] - 0.03], 0.016, 0.005, IRONM, gt, 0.002); // its broken chain
      S.ball(G, 0.035, GHB, { tag: 'pick', res: 0.004 });
      S.ball(along(0.13), 0.035, GHB, { tag: 'pick', res: 0.004 });
      parts.pick = { pivot: G, slices: 3 }; parts.ghost = { pivot: F.P(0, Y0, 0), slices: 2 };
      // ready = swung back up over the grip; strike drives the point into the vein. He bobs as he floats, and leans into the blow
      pose = (t, dt, pup) => { let lift, bob = 0;
        if (t < 1) { bob = Math.sin(t * Math.PI * 2); lift = 1 + 0.05 * bob; }
        else if (t < 1.12) { const k = (t - 1) / 0.12; lift = 1 - k * k; }
        else { const k = Math.min(1, (t - 1.12) / 0.38); lift = ease(k); }
        pup.pose.pick = { pos: [0, 0.04 * bob, 0], turn: tn([0, 0, 1], lift * 70) };
        pup.pose.ghost = { pos: [0.03 * (1 - lift), 0.04 * bob, 0] }; };
    }

    // ---- the Blaster: crouched by a bundle of dynamite at the foot of a rock pile on the right. Red bandana with his goggles
    // pushed up, singed eyebrows, soot on his cheeks, a scorched leather vest over a grey shirt, a bandolier of sticks ----
    const BX = 4.75, BZ = 1.55;
    if (on('blast')) {
      S.rock([BX + 0.45, 0.4, BZ - 0.35], 0.55, ROCK, { res: 0.04 });
      S.rock([BX + 0.1, 0.25, BZ - 0.1], 0.32, ROCK, { res: 0.04 });
      for (const [dx, dy, dz, s] of [[0.2, 0.55, 0.05, 0.14], [0.45, 0.75, -0.1, 0.13], [0.0, 0.32, 0.15, 0.12], [0.6, 0.35, 0.0, 0.12]])
        S.rock([BX + dx, dy, BZ - 0.3 + dz + 0.25], s, ORE, { res: 0.025 });
      const DX = BX - 0.6, DZ = BZ + 0.15, DYN = Mt.cloth(C.red, 0.15);
      for (const k of [-1, 0, 1]) S.tube([[DX - 0.16, 0.05 + (k === 0 ? 0.07 : 0), DZ + k * 0.06], [DX + 0.16, 0.05 + (k === 0 ? 0.07 : 0), DZ + k * 0.06]], 0.045, 0.045, DYN, { res: 0.008 });
      S.box([DX, 0.08, DZ], [0.02, 0.07, 0.12], flat(C.rope), { res: 0.006 }); // the string
      S.tube([[DX - 0.17, 0.12, DZ], [DX - 0.3, 0.06, DZ + 0.12], [DX - 0.45, 0.02, DZ + 0.1]], 0.008, 0.008, { r: [2, 3] }, { res: 0.005 }); // the fuse
      S.bake();
      const F = HB.rig(BX - 1.3, BZ + 0.2, [0.95, 0.3]);
      const shirt = Mt.cloth(C.grey.slice(0, 3), 0.25), vest = Mt.leather(C.leather);
      const bd = HB.body(F, { shirt, trous: Mt.cloth(C.trous, 0.2), boot: Mt.leather(C.boot), skin: SK, belt: LEATH, buckle: IRONM, crouch: 1 });
      const hd = HB.head(F, bd.head, { skin: SK, beard: 'goatee', beardRamp: C.dark, brow: C.grey.slice(0, 2), nose: 'long', tash: 'handlebar' });
      HB.hats.bandana(F, hd.top, 'body');
      for (const [a, y, b] of [[0.07, -0.02, 0.1], [-0.08, -0.05, 0.09], [0.05, -0.1, 0.1]]) HB.ball(F, hd.at(a, y, b), 0.016, flat([C.black[0], C.black[1]]), 'body', 0.003); // soot
      const L = bd.lean;
      for (const s of [-1, 1]) HB.box(F, [s * 0.058, bd.ch - 0.06, L + 0.088], [0.042, 0.12, 0.012], vest, 'body', 0.004, null, 0.01); // the vest
      HB.ball(F, [0.06, bd.ch - 0.1, L + 0.1], 0.02, flat([C.black[0], C.leather[0]]), 'body', 0.003); // a scorch mark
      HB.tube(F, [[-0.1, bd.ch + 0.07, L + 0.05], [0, bd.ch - 0.06, L + 0.108], [0.1, bd.hip + 0.06, L * 0.5 + 0.06]], 0.014, 0.014, LEATH, 'body', 0.004); // the bandolier
      for (let i = 0; i < 4; i++) { const u = 0.2 + 0.2 * i, c = [-0.1 + 0.2 * u, bd.ch + 0.07 - (bd.ch + 0.01 - bd.hip) * u, L * (1 - 0.5 * u) + 0.06 + 0.06 * Math.sin(u * Math.PI)];
        HB.tube(F, [[c[0], c[1] + 0.035, c[2] + 0.012], [c[0], c[1] - 0.035, c[2] + 0.012]], 0.013, 0.013, DYN, 'body', 0.003); } // sticks in it
      const SL = bd.sh(-1), SR = bd.sh(1), hL = [-0.09, bd.hip + 0.12, 0.38], hR = [0.09, bd.hip + 0.12, 0.38];
      const ao = { sleeve: shirt, rolled: true, cuff: flat(C.grey.slice(1, 3)), skin: SK, grip: false };
      HB.arm(F, SL, HB.elbow(SL, hL, [-0.05, 0.02, 0]), hL, { ...ao, tag: 'armL' });
      HB.arm(F, SR, HB.elbow(SR, hR, [0.05, 0.02, 0]), hR, { ...ao, tag: 'armR' });
      HB.tube(F, [[0.09, bd.hip + 0.1, 0.4], [0.1, bd.hip + 0.17, 0.44]], 0.005, 0.005, Mt.wood(C.wood), 'armR', 0.002); // a match
      HB.ball(F, [0.1, bd.hip + 0.185, 0.445], [0.011, 0.016, 0.011], glow(C.lamp), 'armR', 0.002); // lit
      parts.body = { pivot: F.P(0, 0.1, 0), slices: 3 }; parts.armL = { pivot: F.P(...SL), parent: 'body', slices: 2 }; parts.armR = { pivot: F.P(...SR), parent: 'body', slices: 2 };
      const side = F.side;
      // clip: waiting 0-1 (a small rock on his heels), duck 1-1.6 (leans back, hands to his ears and down again)
      pose = (t, dt, pup) => { let d = 0, b = Math.sin(t * Math.PI * 2);
        if (t >= 1) { const k = Math.min(1, (t - 1) / 0.6); d = k < 0.3 ? ease(k / 0.3) : k < 0.7 ? 1 : 1 - ease((k - 0.7) / 0.3); b = 0; }
        pup.pose.body = { turn: tn(side, -d * 14 + b * 2) };
        pup.pose.armL = { turn: tn(side, -d * 150) }; pup.pose.armR = { turn: tn(side, -d * 150) }; };
    }

    // ---- the Lamplighter: under the right frame's lantern with his lighting pole. A tall black hat with a candle stub in the band,
    // round brass spectacles, a long nose and a grey goatee; a mustard frock coat with brass buttons, and an oil can in his other hand ----
    if (on('lamp')) {
      const a = 0.75, rr = RI - 0.55, LX = Math.sin(a) * rr - 0.15, LZ = -Math.cos(a) * rr + 0.75;
      const F = HB.rig(LX, LZ, [0, 1]);
      const coat = Mt.cloth(C.mustard, 0.2);
      const bd = HB.body(F, { shirt: coat, trous: Mt.cloth(C.black, 0.15), boot: Mt.leather(C.boot), skin: SK, belt: Mt.leather(C.leather), buckle: BRASS });
      const hd = HB.head(F, bd.head, { skin: SK, beard: 'goatee', beardRamp: C.grey, brow: C.grey.slice(1), eyes: 'glasses', nose: 'long', hair: 'tuft', hairRamp: C.grey });
      HB.hats.tophat(F, hd.top, 'body');
      HB.lathe(F, [0, 0.3, 0], 0.4, t => 0.118 - 0.02 * t, coat, 'body', 0.006); // the coat's long skirts
      HB.box(F, [0, 0.5, 0.11], [0.008, 0.2, 0.01], flat(C.mustard.slice(0, 2)), 'body', 0.003); // its opening
      for (const y of [0.04, -0.06, -0.16, -0.26]) HB.ball(F, [0.03, bd.ch + y, 0.102], 0.011, BRASS, 'body', 0.002); // brass buttons
      for (const s of [-1, 1]) HB.box(F, [s * 0.05, bd.ch + 0.02, 0.098], [0.035, 0.07, 0.01], flat(C.mustard.slice(2)), 'body', 0.003, null, 0.01); // lapels
      kerchief(F, bd, Mt.cloth(C.waist, 0.15));
      // the oil can in his left hand, hanging
      const SL = bd.sh(-1), hL = [-0.17, 0.72, 0.03];
      HB.arm(F, SL, HB.elbow(SL, hL, [-0.04, 0, -0.02]), hL, { tag: 'body', sleeve: coat, cuff: flat(C.mustard.slice(2)), skin: SK, grip: false });
      HB.lathe(F, [-0.17, 0.56, 0.04], 0.12, t => 0.045 - 0.015 * t, BRASS, 'body', 0.004);
      HB.tube(F, [[-0.17, 0.66, 0.06], [-0.17, 0.7, 0.13]], 0.006, 0.004, BRASS, 'body', 0.002); // its spout
      // the pole: the hand that holds it lifts it to the lantern on the reach
      const SR = bd.sh(1), hR = [0.21, 0.85, 0.15];
      HB.arm(F, SR, HB.elbow(SR, hR, [0.06, -0.04, -0.03]), hR, { tag: 'arm', sleeve: coat, cuff: flat(C.mustard.slice(2)), skin: SK });
      HB.tube(F, [[0.22, 0.5, 0.16], [0.24, 2.0, 0.2]], 0.014, 0.014, Mt.wood(C.wood), 'arm', 0.004);
      HB.tube(F, [[0.24, 1.98, 0.2], [0.245, 2.06, 0.25], [0.25, 2.04, 0.3]], 0.007, 0.004, BRASS, 'arm', 0.003); // its hook
      HB.tube(F, [[0.24, 1.98, 0.2], [0.24, 2.05, 0.19]], 0.006, 0.006, flat(C.wax), 'arm', 0.002); // the taper
      HB.ball(F, [0.24, 2.07, 0.19], [0.012, 0.022, 0.012], glow(C.lamp), 'arm', 0.002); // its flame
      parts.body = { pivot: F.P(0, 0.2, 0), slices: 3 }; parts.arm = { pivot: F.P(...SR), parent: 'body', slices: 2 };
      const side = F.side;
      // clip: idle 0-1 (leaning on the pole), reach 1-2 (lifts the taper to the lantern and back)
      pose = (t, dt, pup) => { let r = 0; const b = Math.sin(t * Math.PI * 2);
        if (t >= 1) { const k = Math.min(1, t - 1); r = k < 0.35 ? ease(k / 0.35) : k < 0.65 ? 1 : 1 - ease((k - 0.65) / 0.35); }
        pup.pose.body = { turn: tn(side, b * 1.5 - r * 4) }; pup.pose.arm = { pos: [0, r * 0.32, 0] }; };
    }

    // ---- the Foreman: left of the rails with his pocket watch, facing the Miner. A lean, stiff man in a black suit, burgundy
    // waistcoat and red tie, a bowler, a waxed handlebar moustache, a whistle on a chain. On the call he points at the boulder ----
    if (on('boss')) {
      const F = HB.rig(-2.25, 0.55, [0.9, 0.35]);
      const suit = Mt.cloth(C.black, 0.12);
      const bd = HB.body(F, { shirt: suit, trous: Mt.cloth(C.black, 0.1), boot: flat(C.black), skin: SK, belt: null });
      const hd = HB.head(F, bd.head, { skin: SK, beard: 'none', tash: 'handlebar', beardRamp: C.dark, brow: C.dark, nose: 'long' });
      HB.hats.bowler(F, hd.top, 'body');
      HB.box(F, [0, bd.ch - 0.06, 0.088], [0.055, 0.13, 0.014], Mt.cloth(C.waist, 0.1), 'body', 0.004, null, 0.012); // the waistcoat
      HB.box(F, [0, bd.ch + 0.04, 0.1], [0.022, 0.05, 0.008], flat(C.grey.slice(2)), 'body', 0.003); // shirt front
      HB.tube(F, [[0, bd.ch + 0.08, 0.102], [0, bd.ch - 0.02, 0.108]], 0.012, 0.007, flat(C.red.slice(1)), 'body', 0.003); // tie
      for (const s of [-1, 1]) HB.box(F, [s * 0.045, bd.ch + 0.035, 0.1], [0.028, 0.065, 0.01], flat(C.black.slice(1)), 'body', 0.003, null, 0.01); // lapels
      for (const y of [-0.06, -0.12, -0.18]) HB.ball(F, [0, bd.ch + y, 0.104], 0.007, BRASS, 'body', 0.002); // waistcoat buttons
      HB.tube(F, [[-0.05, bd.ch - 0.13, 0.104], [0, bd.ch - 0.16, 0.108], [0.06, bd.ch - 0.12, 0.104]], 0.004, 0.004, BRASS, 'body', 0.002); // watch chain
      HB.tube(F, [[-0.04, bd.ch + 0.08, 0.07], [-0.03, bd.ch - 0.02, 0.105]], 0.003, 0.003, flat(C.grey.slice(2)), 'body', 0.002); // whistle lanyard
      HB.tube(F, [[-0.03, bd.ch - 0.02, 0.11], [-0.025, bd.ch - 0.06, 0.112]], 0.009, 0.008, BRASS, 'body', 0.002); // the whistle
      for (const s of [-1, 1]) HB.box(F, [s * 0.05, bd.hip - 0.04, -0.07], [0.045, 0.12, 0.01], suit, 'body', 0.004, null, 0.01); // coat tails
      // the watch hand stays by his middle
      const SR = bd.sh(1), hR = [0.06, 0.82, 0.16];
      HB.arm(F, SR, HB.elbow(SR, hR, [0.06, -0.02, -0.03]), hR, { tag: 'body', sleeve: suit, cuff: flat(C.grey.slice(2)), skin: SK, grip: false });
      HB.ball(F, [0.05, 0.84, 0.19], [0.032, 0.032, 0.012], BRASS, 'body', 0.003); // the watch
      HB.ball(F, [0.05, 0.84, 0.2], [0.024, 0.024, 0.006], flat(C.grey.slice(3)), 'body', 0.002); // its face
      // the other arm comes up on the call, a finger out at the boulder
      const SL = bd.sh(-1), hL = [-0.17, 0.74, 0.04];
      HB.arm(F, SL, HB.elbow(SL, hL, [-0.03, 0, -0.02]), hL, { tag: 'arm', sleeve: suit, cuff: flat(C.grey.slice(2)), skin: SK, grip: false });
      HB.tube(F, [[-0.17, 0.72, 0.05], [-0.17, 0.66, 0.07]], 0.009, 0.007, SK, 'arm', 0.002); // the pointing finger
      parts.body = { pivot: F.P(0, 0.2, 0), slices: 3 }; parts.arm = { pivot: F.P(...SL), parent: 'body', slices: 2 };
      const side = F.side;
      // clip: idle 0-1 (rocks on his heels), call 1-1.5 (arm up to point, a lean, and back down)
      pose = (t, dt, pup) => { let c = 0; const b = Math.sin(t * Math.PI * 2);
        if (t >= 1) { const k = Math.min(1, (t - 1) / 0.5); c = k < 0.25 ? ease(k / 0.25) : k < 0.6 ? 1 : 1 - ease((k - 0.6) / 0.4); }
        pup.pose.body = { turn: tn(side, b * 1.5 + c * 5) }; pup.pose.arm = { turn: tn(side, -c * 110) }; };
    }

    // ---- the Time Miner: an ancient wizard of a miner floating in the dark by the right wall. A bent pointed hat with stars, a long
    // white beard and hair, a starry robe whose hem trails off into the dark, pocket watches hanging from his belt, and the
    // glowing hourglass in both hands. He speeds up every timed thing in the mine; now and then he turns the hourglass over ----
    if (on('time')) {
      const X = 3.95, Z = -0.15, Y = 1.3;
      const F0 = HB.rig(X, Z, [0, 1]), F = { ...F0, P: (a, y, b) => F0.P(a, y + Y - 0.5, b) }; // his own frame, lifted off the floor
      const robe = Mt.cloth(C.robe, 0.2), TIME = glow(C.time), gt = 'body';
      HB.lathe(F, [0, 0.08, 0], 0.62, t => 0.17 - 0.08 * t, robe, gt, 0.006); // the robe
      for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, r = 0.16, l = 0.12 + 0.14 * K.hash(i, 71);
        HB.tube(F, [[Math.sin(a) * r, 0.12, Math.cos(a) * r], [Math.sin(a) * r * 0.8, 0.1 - l, Math.cos(a) * r * 0.8 - 0.03]], 0.05, 0.004, robe, gt, 0.005); } // the hem, trailing off
      HB.lathe(F, [0, 0.3, 0], 0.03, 0.13, flat(C.brass.slice(1)), gt, 0.003); // a brass belt
      for (const [a, l] of [[-0.09, 0.1], [0.0, 0.14], [0.1, 0.08]]) { const z = Math.sqrt(Math.max(0, 0.145 * 0.145 - a * a));
        HB.tube(F, [[a, 0.3, z], [a, 0.3 - l, z + 0.01]], 0.003, 0.003, BRASS, gt, 0.002);
        HB.ball(F, [a, 0.3 - l - 0.02, z + 0.012], [0.024, 0.024, 0.01], BRASS, gt, 0.003); HB.ball(F, [a, 0.3 - l - 0.02, z + 0.02], [0.017, 0.017, 0.004], flat(C.grey.slice(3)), gt, 0.002); } // pocket watches
      for (let i = 0; i < 10; i++) { const a = -1.1 + 2.2 * K.hash(i, 72), y = 0.12 + 0.5 * K.hash(i, 73), r = 0.172 - 0.08 * ((y - 0.08) / 0.62);
        HB.ball(F, [Math.sin(a) * r, y, Math.cos(a) * r], 0.008, glow(C.time.slice(1)), gt, 0.002); } // stars on the robe
      HB.ball(F, [0, 0.66, 0], [0.13, 0.08, 0.09], robe, gt, 0.006); // shoulders
      HB.tube(F, [[0, 0.68, 0], [0, 0.78, 0.01]], 0.036, 0.036, SK, gt, 0.004); // neck
      const hd = HB.head(F, [0, 0.9, 0.02], { skin: SK, beard: 'long', beardRamp: C.grey, brow: C.grey.slice(1), eyes: 'squint', nose: 'long', hair: 'long', hairRamp: C.grey, furLen: 0.03 });
      HB.hats.wizard(F, hd.top, gt);
      // wide sleeves reaching forward to the hourglass
      const HG = [0, 0.42, 0.24];
      for (const s of [-1, 1]) { const sh = [s * 0.14, 0.64, 0], hn = [s * 0.075, 0.42, 0.2];
        HB.tube(F, [sh, [s * 0.15, 0.52, 0.08], hn], t => 0.04 + 0.03 * t, null, robe, gt, 0.005);
        HB.ball(F, [s * 0.07, 0.42, 0.22], [0.028, 0.034, 0.028], SK, gt, 0.003); }
      // the hourglass: two glowing bulbs, falling sand, and a brass frame
      for (const dy of [-0.1, 0.1]) HB.ball(F, [HG[0], HG[1] + dy, HG[2]], [0.065, 0.085, 0.065], TIME, 'glass', 0.003);
      HB.tube(F, [[HG[0], HG[1] + 0.03, HG[2]], [HG[0], HG[1] - 0.06, HG[2]]], 0.006, 0.006, glow(C.time.slice(2)), 'glass', 0.002);
      for (const dy of [-0.2, 0.2]) HB.box(F, [HG[0], HG[1] + dy, HG[2]], [0.088, 0.014, 0.088], BRASS, 'glass', 0.003, null, 0.01);
      for (const sa of [-1, 1]) for (const sb of [-1, 1]) HB.tube(F, [[HG[0] + sa * 0.075, HG[1] - 0.2, HG[2] + sb * 0.075], [HG[0] + sa * 0.075, HG[1] + 0.2, HG[2] + sb * 0.075]], 0.007, 0.007, BRASS, 'glass', 0.002);
      parts.body = { pivot: F.P(0, 0, 0), slices: 3 }; parts.glass = { pivot: F.P(...HG), parent: 'body', slices: 1 };
      // clip: idle 0-1 (a slow float), turn 1-1.6 (turns the hourglass over)
      pose = (t, dt, pup) => { const b = Math.sin(t * Math.PI * 2); let r = 0;
        if (t >= 1) r = ease(Math.min(1, (t - 1) / 0.6));
        pup.pose.body = { pos: [0, 0.05 * b, 0] }; pup.pose.glass = { turn: tn([0, 0, 1], r * 180) }; };
    }

    // ---- the heap the Carter tips each load onto, beside the end of the rails ----
    if (on('heap')) {
      for (const [dx, dz, sz] of [[0, 0, 0.2], [0.2, 0.1, 0.16], [-0.18, 0.08, 0.15], [0.05, -0.15, 0.15], [0.02, 0.05, 0.13]])
        S.rock([-1.7 + dx, sz * 0.6 + (sz < 0.14 ? 0.18 : 0), 1.55 + dz], sz, ORE, { res: 0.025 });
    }

    function swingPose(arm, body) {
      return (t, dt, pup) => {
        let lift, squash = 0, breathe = 0;
        if (t < 1) { breathe = Math.sin(t * Math.PI * 2); lift = 1 + 0.04 * breathe; }
        else if (t < 1.12) { const k = (t - 1) / 0.12; lift = 1 - k * k; if (k > 0.9) squash = 1; }
        else { const k = Math.min(1, (t - 1.12) / 0.38); lift = ease(k); squash = Math.max(0, 1 - k * 3); }
        pup.pose[arm] = { rot: [0, 0, lift * 120] };
        pup.pose[body] = { rot: [0, 0, Math.max(0, lift) * 6 - squash * 4], scale: [1 + 0.04 * squash, 1 - 0.05 * squash + 0.012 * breathe, 1 + 0.04 * squash] };
      };
    }
    S.bake();

    const W = B.finish({ cam: { target: [0, 2.2, -0.4], dist: 16.5, pitch: 0.3, yaw: 0 }, detail: +(env.DETAIL || 26), dither: +(env.DITHER || 0.25), ao: { k: +(env.AO || 0.55), range: 0.7 }, radius: 7 });
    if (pose && !all) {
      const P2 = {};
      for (const [k, v] of Object.entries(parts)) P2[k] = { ...v, ids: tags[k] };
      K.puppet(W, { parts: P2, pose });
    }
    return W;
  }
  return { id: 'oh-mine', name: 'Ore Heroes mine', seed: 7, build };
};
