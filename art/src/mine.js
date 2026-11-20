// Ore Heroes: the mine, forked from Blacksmith Battles' splat/art/toy-mine.js (same cave, same lights, same miner).
// A cut-away cavern: a rock dome, timber frames with hanging lanterns, a tunnel mouth with rails, puddles, a copper vein.
// Each mine hero is its own layer, picked with OH_LAYER (miner, boss, pros, cart, phantom, blast, lamp, time; none = the empty cave).
// The ore cart is no longer scenery: it is the Carter's, drawn at OH_Z along the rails, rolling OH_DIR (in = empty, out = full);
// OH_NOBODY=1 draws it empty and parked, with no Carter, for before he is hired.
// Environment variables pick what is drawn (for the toy's sprite layers): TOY_WORKER=0 parks the miner out of view.
// The clip: ready 0-1 s (pick raised over his shoulder, waiting for a tap), strike 1-1.12 (lands at 1.12), recover 1.12-1.5 (back up to ready).
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
    0x1a1430, 0x2e2450, 0x4a3a7a // 55-57 the Time Miner's robe
  ];
  function build(seed) {
    const env = (typeof process !== 'undefined' && process.env) || {};
    const B = makeBuilder(seed, PAL);
    const S = K.sculpt(makeSculpt(B));
    const tags = K.deform.tags(S);
    S.sun = B.norm([0.3, 0.5, 0.8]);
    S.res = 0.08;
    S.amb = 0.025;
    S.sky = 0.02; // nearly black: the lanterns do the lighting
    const ROCK = { r: [0, 0, 1, 2, 33, 34, 35] };
    const FLOOR = { r: [0, 1, 2, 33, 34, 35] };
    const WOOD = { r: [7, 8, 9, 10] };
    const IRON = { r: [0, 30, 31, 32] };
    const LAMP = { r: [11, 12, 13], em: true };
    const WATER = { r: [14, 15, 16] };
    const ORE = { r: [18, 19, 20, 21] };
    const R = 5.2, RI = 4.6, H = 6.5;
    // every light goes in before the first bake: a bake shades with the lights it has at the time
    const LAMPS = [[-0.95, 0.8], [0.75, 0.8]].map(([a]) => [Math.sin(a) * (RI - 0.55), 2.3, -Math.cos(a) * (RI - 0.55)]);
    LAMPS.push([-0.9, 2.0, -RI + 0.15]);
    for (const [x, y, z] of LAMPS) S.lights.push({ p: [x, y - 0.6, z + 0.35], r: 3.0, s: 1.5 });
    S.lights.push({ p: [2.65, 1.7, 1.0], r: 3.2, s: 1.8 }, { p: [1.0, 1.5, 1.3], r: 1.5, s: 0.6 }); // the lantern on a post by the boulder; a little light on the miner

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

    // ---- puddles on the floor: flat water with a pale glint ----
    for (const [x, z, rx, rz] of [[2.6, 1.7, 0.55, 0.3], [-2.4, 0.9, 0.42, 0.26], [0.3, 1.9, 0.32, 0.18], [-1.7, 2.5, 0.5, 0.22], [0.9, -1.9, 0.35, 0.2]]) {
      S.lathe([x, 0, z], 0.03, rx, { r: [14, 15, 16] }, { res: 0.025 });
      S.lathe([x + rz * 0.6, 0, z - rz * 0.4], 0.03, rz * 0.9, { r: [14, 15, 16] }, { res: 0.025 });
      S.box([x + rx * 0.2, 0.035, z - rz * 0.2], [rx * 0.3, 0.006, 0.012], { r: [17] }, { res: 0.012 }); // glint
    }

    // a lantern on a post beside the boulder, so the miner works in its pool of light
    S.box([3.15, 1.15, 1.0], [0.06, 1.15, 0.06], WOOD, { res: 0.03 });
    S.box([2.97, 2.3, 1.0], [0.24, 0.04, 0.04], WOOD, { res: 0.025 });
    S.box([2.75, 2.12, 1.0], [0.06, 0.018, 0.06], IRON, { res: 0.012 });
    S.box([2.75, 1.9, 1.0], [0.07, 0.018, 0.07], IRON, { res: 0.012 });
    S.box([2.75, 2.01, 1.0], [0.05, 0.09, 0.05], LAMP, { res: 0.012 });
    S.tube([[2.75, 2.13, 1.0], [2.75, 2.28, 1.0]], 0.01, 0.01, IRON, { res: 0.01 });
    // ---- the ore boulder the miner works ----
    const OX = 1.7, OZ = 0.6;
    S.rock([OX, 0.35, OZ], 0.5, ROCK, { res: 0.04 });
    for (const [dx, dy, dz, s] of [[-0.32, 0.45, 0.25, 0.17], [-0.1, 0.72, 0.15, 0.15], [0.15, 0.55, 0.38, 0.16], [-0.38, 0.2, 0.35, 0.13], [0.3, 0.3, 0.42, 0.12]])
      S.rock([OX + dx, dy, OZ + dz], s, ORE, { res: 0.025 });
    S.bake();


    // =================== the mine heroes ===================
    // OH_LAYER picks the one hero drawn in this render (none = the empty cave, the background). Every render keeps the
    // same lights and the same scenery, so a hero's cut-out is just the pixels that differ from the background.
    const ease = x => x * x * (3 - 2 * x);
    const tn = (axis, deg) => K.M.rot(axis, (deg * Math.PI) / 180); // a turn about an axis, for pose.turn
    const TUNIC = { r: [22, 23, 24] }, PANTS = { r: [0, 25] }, BOOT = { r: [0, 25, 26] }, SKIN = { r: [27] };
    const BRASS = { r: [28, 29] }, LEATHER = { r: [7, 8, 9] };
    const BLUE = { r: [42, 43, 44] }, MUSTARD = { r: [45, 46, 47] }, RED = { r: [39, 40, 41] }, VEST = { r: [7, 8, 25] };
    const GHOST = { r: [36, 37, 38], em: true };
    // a local frame for a figure standing at (x, z) and facing `f` (a unit vector on the floor): P(side, up, forward)
    const frameAt = (x, z, f) => { const s = [f[1], -f[0]]; return (a, y, b) => [x + s[0] * a + f[0] * b, y, z + s[1] * a + f[1] * b]; };
    // a slim worker in the miner's proportions; returns where the shoulders are
    function person(P, o) {
      const tag = o.tag || 'body', crouch = o.crouch || 0, legs = o.legs !== false;
      const hip = 0.6 - crouch * 0.3;
      if (legs) {
        if (crouch) {
          for (const d of [-0.08, 0.08]) {
            S.tube([P(d, hip, 0), P(d, 0.28, 0.24)], 0.05, 0.05, o.pants || PANTS, { tag, res: 0.012 }); // thigh, knee forward
            S.tube([P(d, 0.28, 0.24), P(d, 0.08, d > 0 ? 0.05 : 0.1)], 0.045, 0.045, o.pants || PANTS, { tag, res: 0.012 });
            S.box(P(d, 0.06, d > 0 ? 0.08 : 0.13), [0.08, 0.035, 0.055], BOOT, { tag, res: 0.012 });
          }
        } else for (const [d, lt] of [[-0.07, 'legL'], [0.07, 'legR']]) {
          const lg = o.walk ? lt : tag;
          S.tube([P(d, 0.2, 0), P(d, 0.6, 0)], 0.045, 0.05, o.pants || PANTS, { tag: lg, res: 0.012 });
          S.box(P(d, 0.22, 0.04), [0.08, 0.035, 0.055], BOOT, { tag: lg, res: 0.012 });
        }
      }
      const lean = crouch * 0.12;
      S.tube([P(0, hip - 0.02, 0), P(0, hip + 0.43, lean)], 0.12, 0.12, o.coat || TUNIC, { tag, res: 0.014 });
      if (o.long) S.lathe(P(0, hip - 0.35, lean * 0.3), 0.42, t => 0.15 - 0.03 * t, o.coat, { tag, res: 0.014 }); // a long coat skirt
      S.box(P(0, hip + 0.05, 0), [0.13, 0.03, 0.07], o.belt || { r: [7, 8] }, { tag, res: 0.01 });
      const head = P(0, hip + 0.58, lean * 1.4);
      S.ball(head, 0.1, SKIN, { tag, res: 0.012 });
      return { sh: P(0, hip + 0.4, lean), head, hip };
    }
    const layer = env.OH_LAYER || '';
    const parts = {};
    let pose = null;

    // ---- you, the Miner: the Blacksmith Battles miner at the boulder (unchanged) ----
    if (layer === 'miner') {
      const hx = OX - 0.95, hz = OZ + 0.15;
      const P = (x, y, z) => [hx + z, y, hz - x];
      for (const d of [-0.07, 0.07]) S.tube([P(d, 0.2, 0), P(d, 0.6, 0)], 0.045, 0.05, PANTS, { tag: 'body', res: 0.012 });
      for (const d of [-0.07, 0.07]) S.box(P(d, 0.22, 0.04), [0.08, 0.035, 0.055], BOOT, { tag: 'body', res: 0.012 });
      S.tube([P(0, 0.58, 0), P(0, 1.03, 0)], 0.12, 0.12, TUNIC, { tag: 'body', res: 0.014 });
      S.box(P(0, 0.64, 0), [0.07, 0.03, 0.13], { r: [7, 8] }, { tag: 'body', res: 0.01 });
      S.ball(P(0, 1.18, 0), 0.1, SKIN, { tag: 'body', res: 0.012 });
      S.ball(P(0, 1.23, 0), [0.115, 0.07, 0.115], BRASS, { tag: 'body', res: 0.012 });
      S.lathe(P(0, 1.2, 0), 0.015, 0.14, BRASS, { tag: 'body', res: 0.01 });
      S.ball(P(0, 1.25, 0.11), 0.03, LAMP, { tag: 'body', res: 0.01 });
      S.box(P(-0.05, 0.85, -0.13), [0.09, 0.12, 0.05], { r: [8, 9] }, { tag: 'body', res: 0.012, rd: 0.02 });
      S.tube([P(-0.15, 1.0, 0), P(-0.15, 0.7, 0.05)], 0.035, 0.035, TUNIC, { tag: 'body', res: 0.012 });
      const SH = P(0.12, 1.0, 0), HAND = P(0.08, 0.82, 0.32), TIP = [OX - 0.3, 0.6, OZ + 0.12];
      S.tube([SH, HAND], 0.035, 0.035, TUNIC, { tag: 'arm', res: 0.012 });
      S.tube([P(0.08, 0.78, 0.22), TIP.map((v, i) => v + [0.0, 0.18, 0][i])], 0.018, 0.018, WOOD, { tag: 'arm', res: 0.01 });
      const HEAD = [TIP[0], TIP[1] + 0.2, TIP[2]];
      S.tube([[HEAD[0] - 0.02, HEAD[1] + 0.2, HEAD[2]], [HEAD[0] + 0.02, HEAD[1] + 0.02, HEAD[2]]], 0.035, 0.03, IRON, { tag: 'arm', res: 0.01 });
      S.tube([[HEAD[0] + 0.02, HEAD[1] + 0.02, HEAD[2]], [TIP[0] + 0.06, TIP[1] - 0.02, TIP[2]]], 0.03, 0.006, IRON, { tag: 'arm', res: 0.01 });
      parts.body = { pivot: P(0, 0.2, 0), slices: 4 }; parts.arm = { pivot: SH, parent: 'body', slices: 2 };
      pose = swingPose('arm', 'body', [0, 0, 1]);
    }

    // ---- the Prospector: a second pick at a rock of his own under the left frame; wide hat, blue shirt, grey beard ----
    const PRX = -3.35, PRZ = -1.0; // where he stands; his rock is just to his right
    if (layer === 'pros') {
      const rx = PRX + 0.9, rz = PRZ - 0.05;
      S.rock([rx, 0.3, rz], 0.42, ROCK, { res: 0.04 });
      for (const [dx, dy, dz, s] of [[-0.25, 0.4, 0.22, 0.14], [-0.05, 0.6, 0.15, 0.13], [0.12, 0.42, 0.3, 0.13], [-0.3, 0.18, 0.3, 0.11]])
        S.rock([rx + dx, dy, rz + dz], s, ORE, { res: 0.025 });
      S.bake();
      const P = (x, y, z) => [PRX + z, y, PRZ - x];
      const me = person(P, { coat: BLUE, pants: PANTS });
      S.lathe(P(0, 1.24, 0), 0.02, 0.2, LEATHER, { tag: 'body', res: 0.01 }); // wide brim
      S.lathe(P(0, 1.25, 0), 0.1, 0.1, LEATHER, { tag: 'body', res: 0.01 }); // crown
      S.ball(P(0, 1.1, 0.07), [0.07, 0.06, 0.05], { r: [5, 6] }, { tag: 'body', res: 0.01 }); // beard
      S.tube([P(-0.15, 1.0, 0), P(-0.15, 0.7, 0.05)], 0.035, 0.035, BLUE, { tag: 'body', res: 0.012 });
      const SH = P(0.12, 1.0, 0), HAND = P(0.08, 0.82, 0.32), TIP = [rx - 0.28, 0.52, rz + 0.12];
      S.tube([SH, HAND], 0.035, 0.035, BLUE, { tag: 'arm', res: 0.012 });
      S.tube([P(0.08, 0.78, 0.22), [TIP[0], TIP[1] + 0.18, TIP[2]]], 0.018, 0.018, WOOD, { tag: 'arm', res: 0.01 });
      const HD = [TIP[0], TIP[1] + 0.2, TIP[2]];
      S.tube([[HD[0] - 0.02, HD[1] + 0.2, HD[2]], [HD[0] + 0.02, HD[1] + 0.02, HD[2]]], 0.035, 0.03, IRON, { tag: 'arm', res: 0.01 });
      S.tube([[HD[0] + 0.02, HD[1] + 0.02, HD[2]], [TIP[0] + 0.06, TIP[1] - 0.02, TIP[2]]], 0.03, 0.006, IRON, { tag: 'arm', res: 0.01 });
      parts.body = { pivot: P(0, 0.2, 0), slices: 4 }; parts.arm = { pivot: SH, parent: 'body', slices: 2 };
      pose = swingPose('arm', 'body', [0, 0, 1]);
    }

    // ---- the Carter and the ore cart (the cart that used to sit on the rails). OH_Z = where on the rails, OH_DIR = in|out ----
    if (layer === 'cart') {
      const CZ = +(env.OH_Z || -2.9), out = env.OH_DIR !== 'in', full = out;
      const CX = -0.9;
      S.box([CX, 0.55, CZ], [0.45, 0.3, 0.6], WOOD, { res: 0.04, rd: 0.03, tag: 'cart' });
      S.box([CX, 0.7, CZ], [0.38, 0.2, 0.53], WOOD, { neg: true });
      for (const dz of [-0.45, 0.45]) S.box([CX, 0.55, CZ + dz], [0.47, 0.32, 0.03], IRON, { res: 0.02, tag: 'cart' });
      for (const dz of [-0.4, 0.4]) for (const sd of [-1, 1]) S.lathe([CX + sd * 0.44, 0.17, CZ + dz], 0.06, 0.13, IRON, { res: 0.02, ax: [[0, 1, 0], [1, 0, 0], [0, 0, 1]], tag: 'cart' });
      if (full) for (let i = 0; i < 6; i++) S.rock([CX - 0.25 + (i % 3) * 0.25, 0.85 + 0.05 * (i % 2), CZ - 0.3 + Math.floor(i / 3) * 0.4], 0.18, ORE, { res: 0.03, tag: 'cart' });
      if (env.OH_NOBODY === '1') { S.bake(); } else {
      // he walks beside the rails on the right, one hand on the cart's rim, facing the way it rolls
      const f = out ? [0, 1] : [0, -1];
      const P = frameAt(CX - 0.78, CZ + (out ? -0.15 : 0.15), f), hs = out ? -1 : 1; // hs: the side the cart is on
      const me = person(P, { coat: { r: [8, 9, 10] }, pants: PANTS, walk: true });
      S.ball(P(0, 1.2, 0.0), [0.11, 0.05, 0.11], { r: [25, 26] }, { tag: 'body', res: 0.012 }); // flat cap
      S.box(P(0, 1.18, 0.1), [0.08, 0.012, 0.05], { r: [25, 26] }, { tag: 'body', res: 0.01 }); // its peak
      S.tube([P(-0.15 * hs, 1.0, 0), P(-0.42 * hs, 0.88, 0.05)], 0.035, 0.035, { r: [8, 9, 10] }, { tag: 'body', res: 0.012 }); // hand on the rim
      S.tube([P(0.15 * hs, 1.0, 0), P(0.17 * hs, 0.72, 0.0)], 0.035, 0.035, { r: [8, 9, 10] }, { tag: 'armB', res: 0.012 });
      parts.legL = { pivot: P(-0.07, 0.6, 0), slices: 2 }; parts.legR = { pivot: P(0.07, 0.6, 0), slices: 2 };
      parts.armB = { pivot: P(0.15 * hs, 1.0, 0), slices: 2 };
      // a two-step walk: one stride per second of clip time
      pose = (t, dt, pup) => { const w = Math.sin(t * Math.PI * 2) * 22; const ax = out ? 1 : -1;
        pup.pose.legL = { rot: [w * ax, 0, 0] }; pup.pose.legR = { rot: [-w * ax, 0, 0] }; pup.pose.armB = { rot: [-w * 0.8 * ax, 0, 0] }; };
      }
    }

    // ---- the Phantom Pick: a ghostly pickaxe over the copper vein in the right wall, striking point-first ----
    if (layer === 'phantom') {
      const va = 0.6, vy = 1.55, rr = RI * Math.sqrt(Math.max(0.02, 1 - Math.pow(vy / (H - 0.5), 2.2)));
      const V = [Math.sin(va) * rr, vy, -Math.cos(va) * rr]; // the vein, where the point lands
      // drawn side-on to the camera so it reads as a pickaxe: the haft rises from the grip (lower left), the head crosses its top,
      // and in the strike pose the head's point is in the vein. The grip is the pivot; it swings about the camera's line of sight.
      const Z = 0.3, at = (x, y, z = Z) => [V[0] + x, V[1] + y, V[2] + z];
      const d = [0.62, 0.78], p = [0.78, -0.62]; // up the haft; across it, toward the point
      const T = at(-p[0] * 0.5, -p[1] * 0.5), G = at(-p[0] * 0.5 - d[0] * 0.95, -p[1] * 0.5 - d[1] * 0.95);
      const GRIP = G;
      S.tube([G, T.map((v, i) => v + [d[0] * 0.08, d[1] * 0.08, 0][i])], 0.045, 0.04, GHOST, { tag: 'pick', res: 0.012 }); // the haft
      S.tube([T, at(-0.02, 0.0, 0.08)], 0.07, 0.008, GHOST, { tag: 'pick', res: 0.012 }); // the point, into the vein
      S.tube([T, at(-p[0] * 0.92, -p[1] * 0.92)], 0.07, 0.03, GHOST, { tag: 'pick', res: 0.012 }); // the flat back of the head
      S.ball(T, 0.075, GHOST, { tag: 'pick', res: 0.012 }); // the eye where the head meets the haft
      parts.pick = { pivot: GRIP, slices: 3 };
      // ready = swung back up over the grip; strike drives the point into the vein
      pose = (t, dt, pup) => { let lift, bob = 0;
        if (t < 1) { bob = Math.sin(t * Math.PI * 2); lift = 1 + 0.05 * bob; }
        else if (t < 1.12) { const k = (t - 1) / 0.12; lift = 1 - k * k; }
        else { const k = Math.min(1, (t - 1.12) / 0.38); lift = ease(k); }
        pup.pose.pick = { pos: [0, 0.04 * bob, 0], turn: tn([0, 0, 1], lift * 70) }; };
    }

    // ---- the Blaster: crouched on the floor by a bundle of dynamite at the foot of a rock pile on the right ----
    const BX = 4.75, BZ = 1.55;
    if (layer === 'blast') {
      S.rock([BX + 0.45, 0.4, BZ - 0.35], 0.55, ROCK, { res: 0.04 });
      S.rock([BX + 0.1, 0.25, BZ - 0.1], 0.32, ROCK, { res: 0.04 });
      for (const [dx, dy, dz, s] of [[0.2, 0.55, 0.05, 0.14], [0.45, 0.75, -0.1, 0.13], [0.0, 0.32, 0.15, 0.12], [0.6, 0.35, 0.0, 0.12]])
        S.rock([BX + dx, dy, BZ - 0.3 + dz + 0.25], s, ORE, { res: 0.025 });
      // three red sticks tied with string, lying in front of the rocks
      const DX = BX - 0.6, DZ = BZ + 0.15;
      for (const k of [-1, 0, 1]) S.tube([[DX - 0.16, 0.05 + (k === 0 ? 0.07 : 0), DZ + k * 0.06], [DX + 0.16, 0.05 + (k === 0 ? 0.07 : 0), DZ + k * 0.06]], 0.045, 0.045, RED, { res: 0.01 });
      S.box([DX, 0.08, DZ], [0.02, 0.07, 0.12], { r: [21] }, { res: 0.008 }); // the string
      S.tube([[DX - 0.17, 0.12, DZ], [DX - 0.3, 0.06, DZ + 0.12]], 0.008, 0.008, { r: [2, 3] }, { res: 0.006 }); // start of the fuse
      S.bake();
      // he squats a little way off, facing the bundle, red bandana and a brown vest
      const f = [-0.55, 0.835]; // toward the camera-left, half turned to the bundle
      const fl = Math.hypot(f[0], f[1]), F = [ -0.5, 0.866 ];
      const P = frameAt(BX - 1.3, BZ + 0.2, [0.95, 0.3]);
      const me = person(P, { coat: VEST, pants: PANTS, crouch: 1 });
      S.ball(P(0, me.hip + 0.63, 0.15 * 0.12 * 1.4), [0.11, 0.06, 0.11], RED, { tag: 'body', res: 0.012 }); // bandana
      S.tube([P(0, me.hip + 0.64, -0.1), P(0.04, me.hip + 0.5, -0.2)], 0.02, 0.012, RED, { tag: 'body', res: 0.008 }); // its tail
      // arms: reach toward the bundle while waiting; on the duck they come up over the ears
      const SHL = P(-0.14, me.hip + 0.4, 0.12), SHR = P(0.14, me.hip + 0.4, 0.12);
      S.tube([SHL, P(-0.1, me.hip + 0.12, 0.36)], 0.035, 0.035, VEST, { tag: 'armL', res: 0.012 });
      S.tube([SHR, P(0.1, me.hip + 0.12, 0.36)], 0.035, 0.035, VEST, { tag: 'armR', res: 0.012 });
      S.ball(P(-0.1, me.hip + 0.1, 0.38), 0.035, SKIN, { tag: 'armL', res: 0.01 });
      S.ball(P(0.1, me.hip + 0.1, 0.38), 0.035, SKIN, { tag: 'armR', res: 0.01 });
      parts.body = { pivot: P(0, 0.1, 0), slices: 3 }; parts.armL = { pivot: SHL, parent: 'body', slices: 2 }; parts.armR = { pivot: SHR, parent: 'body', slices: 2 };
      const side = (() => { const s = P(1, 0, 0), o = P(0, 0, 0); return [s[0] - o[0], 0, s[2] - o[2]]; })();
      // clip: waiting 0-1 (a small rock on his heels), duck 1-1.6 (leans back, hands to his ears and down again)
      pose = (t, dt, pup) => { let d = 0, b = Math.sin(t * Math.PI * 2);
        if (t >= 1) { const k = Math.min(1, (t - 1) / 0.6); d = k < 0.3 ? ease(k / 0.3) : k < 0.7 ? 1 : 1 - ease((k - 0.7) / 0.3); b = 0; }
        pup.pose.body = { turn: tn(side, -d * 14 + b * 2) };
        pup.pose.armL = { turn: tn(side, -d * 150) }; pup.pose.armR = { turn: tn(side, -d * 150) }; };
    }

    // ---- the Lamplighter: under the right frame's lantern with a long lighting pole; mustard coat, tall hat ----
    if (layer === 'lamp') {
      const a = 0.75, rr = RI - 0.55, LX = Math.sin(a) * rr - 0.15, LZ = -Math.cos(a) * rr + 0.75;
      const P = frameAt(LX, LZ, [0, 1]);
      const me = person(P, { coat: MUSTARD, pants: PANTS, long: true });
      S.lathe(P(0, 1.22, 0), 0.015, 0.14, { r: [0, 25] }, { tag: 'body', res: 0.01 });
      S.lathe(P(0, 1.23, 0), 0.2, 0.09, { r: [0, 25] }, { tag: 'body', res: 0.01 }); // tall hat
      S.tube([P(-0.15, 1.0, 0), P(-0.17, 0.72, 0.03)], 0.035, 0.035, MUSTARD, { tag: 'body', res: 0.012 });
      const SH = P(0.15, 1.0, 0);
      S.tube([SH, P(0.2, 0.85, 0.15)], 0.035, 0.035, MUSTARD, { tag: 'arm', res: 0.012 });
      S.tube([P(0.22, 0.5, 0.16), P(0.24, 2.0, 0.2)], 0.022, 0.022, WOOD, { tag: 'arm', res: 0.008 }); // the pole
      S.tube([P(0.24, 2.0, 0.2), P(0.24, 2.08, 0.26)], 0.012, 0.008, IRON, { tag: 'arm', res: 0.006 }); // its hook
      S.ball(P(0.24, 2.0, 0.2), 0.025, LAMP, { tag: 'arm', res: 0.006 }); // the taper's flame
      parts.body = { pivot: P(0, 0.2, 0), slices: 3 }; parts.arm = { pivot: SH, parent: 'body', slices: 2 };
      const side = (() => { const s = P(1, 0, 0), o = P(0, 0, 0); return [s[0] - o[0], 0, s[2] - o[2]]; })();
      // clip: idle 0-1 (leaning on the pole), reach 1-2 (lifts the taper to the lantern and back)
      pose = (t, dt, pup) => { let r = 0; const b = Math.sin(t * Math.PI * 2);
        if (t >= 1) { const k = Math.min(1, t - 1); r = k < 0.35 ? ease(k / 0.35) : k < 0.65 ? 1 : 1 - ease((k - 0.65) / 0.35); }
        pup.pose.body = { turn: tn(side, b * 1.5 - r * 4) }; pup.pose.arm = { pos: [0, r * 0.32, 0] }; };
    }

    // ---- the Foreman: a stout boss in a grey suit and bowler hat, left of the rails with his pocket watch, facing the Miner.
    // Every so often he blows his whistle and points at the boulder, and the Miner swings (even when you aren't tapping) ----
    if (layer === 'boss') {
      const SUIT = { r: [48, 49, 50] };
      const P = frameAt(-2.25, 0.55, [0.92, -0.4]);
      const me = person(P, { coat: SUIT, pants: { r: [48, 49] } });
      S.ball(P(0, 0.85, 0.05), [0.15, 0.17, 0.14], SUIT, { tag: 'body', res: 0.012 }); // a round middle
      S.box(P(0, 0.98, 0.1), [0.035, 0.12, 0.02], { r: [51] }, { tag: 'body', res: 0.008 }); // shirt front
      S.tube([P(-0.06, 0.8, 0.14), P(0.06, 0.84, 0.14)], 0.008, 0.008, { r: [28, 29] }, { tag: 'body', res: 0.006 }); // watch chain
      S.lathe(P(0, 1.22, 0), 0.015, 0.15, { r: [0, 48] }, { tag: 'body', res: 0.01 }); // bowler brim
      S.ball(P(0, 1.25, 0), [0.11, 0.09, 0.11], { r: [0, 48] }, { tag: 'body', res: 0.012 }); // bowler crown
      S.box(P(0, 1.12, 0.09), [0.06, 0.012, 0.02], { r: [5, 6] }, { tag: 'body', res: 0.008 }); // moustache
      // the watch hand stays by his middle; the other arm comes up to point at the boulder on the call
      S.tube([P(0.16, 1.0, 0), P(0.08, 0.82, 0.16)], 0.038, 0.038, SUIT, { tag: 'body', res: 0.012 });
      S.ball(P(0.07, 0.8, 0.18), 0.035, { r: [28, 29] }, { tag: 'body', res: 0.008 }); // the watch
      const SH = P(-0.16, 1.0, 0);
      S.tube([SH, P(-0.2, 0.74, 0.04)], 0.038, 0.038, SUIT, { tag: 'arm', res: 0.012 });
      S.ball(P(-0.2, 0.72, 0.05), 0.035, SKIN, { tag: 'arm', res: 0.008 });
      parts.body = { pivot: P(0, 0.2, 0), slices: 3 }; parts.arm = { pivot: SH, parent: 'body', slices: 2 };
      const side = (() => { const s2 = P(1, 0, 0), o = P(0, 0, 0); return [s2[0] - o[0], 0, s2[2] - o[2]]; })();
      // clip: idle 0-1 (rocks on his heels), call 1-1.5 (arm up to point, a lean, and back down)
      pose = (t, dt, pup) => { let c = 0; const b = Math.sin(t * Math.PI * 2);
        if (t >= 1) { const k = Math.min(1, (t - 1) / 0.5); c = k < 0.25 ? ease(k / 0.25) : k < 0.6 ? 1 : 1 - ease((k - 0.6) / 0.4); }
        pup.pose.body = { turn: tn(side, b * 1.5 + c * 5) }; pup.pose.arm = { turn: tn(side, -c * 110) }; };
    }

    // ---- the Time Miner: a robed old figure floating in the dark by the right wall, holding a glowing hourglass.
    // He speeds up every timed thing in the mine; now and then he turns the hourglass over ----
    if (layer === 'time') {
      const ROBE = { r: [55, 56, 57] }, TIME = { r: [52, 53, 54], em: true };
      const X = 3.95, Z = -0.15, Y = 1.3;
      const P = (sx, y, f) => [X + sx, Y + y, Z + f];
      S.lathe(P(0, -0.15, 0), 0.75, t => 0.2 - 0.09 * t, ROBE, { tag: 'body', res: 0.014 }); // the robe, hem floating free
      S.ball(P(0, 0.72, 0.02), 0.1, SKIN, { tag: 'body', res: 0.012 });
      S.ball(P(0, 0.66, 0.08), [0.08, 0.1, 0.05], { r: [53, 54] }, { tag: 'body', res: 0.01 }); // a long pale beard
      S.lathe(P(0, 0.76, 0), 0.32, t => 0.13 * (1 - t), ROBE, { tag: 'body', res: 0.01 }); // pointed hood
      for (const sd of [-1, 1]) S.tube([P(sd * 0.15, 0.5, 0), P(sd * 0.09, 0.32, 0.16)], 0.04, 0.045, ROBE, { tag: 'body', res: 0.012 }); // arms forward
      // the hourglass in both hands: two glowing bulbs and a frame
      const HG = P(0, 0.32, 0.22);
      for (const dy of [-0.1, 0.1]) S.ball([HG[0], HG[1] + dy, HG[2]], [0.075, 0.09, 0.075], TIME, { tag: 'glass', res: 0.008 });
      for (const dy of [-0.2, 0.2]) S.box([HG[0], HG[1] + dy, HG[2]], [0.095, 0.015, 0.095], { r: [28, 29] }, { tag: 'glass', res: 0.008 });
      for (const sd of [-1, 1]) S.tube([[HG[0] + sd * 0.085, HG[1] - 0.2, HG[2]], [HG[0] + sd * 0.085, HG[1] + 0.2, HG[2]]], 0.008, 0.008, { r: [28, 29] }, { tag: 'glass', res: 0.006 });
      parts.body = { pivot: P(0, 0, 0), slices: 3 }; parts.glass = { pivot: HG, parent: 'body', slices: 1 };
      // clip: idle 0-1 (a slow float), turn 1-1.6 (turns the hourglass over)
      pose = (t, dt, pup) => { const b = Math.sin(t * Math.PI * 2); let r = 0;
        if (t >= 1) r = ease(Math.min(1, (t - 1) / 0.6));
        pup.pose.body = { pos: [0, 0.05 * b, 0] }; pup.pose.glass = { turn: tn([0, 0, 1], r * 180) }; };
    }

    // ---- the heap the Carter tips each load onto, beside the end of the rails ----
    if (layer === 'heap') {
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

    const W = B.finish({ cam: { target: [0, 2.2, -0.4], dist: 16.5, pitch: 0.3, yaw: 0 }, detail: 26, dither: 0, radius: 7 });
    if (pose) {
      const P2 = {};
      for (const [k, v] of Object.entries(parts)) P2[k] = { ...v, ids: tags[k] };
      K.puppet(W, { parts: P2, pose });
    }
    return W;
  }
  return { id: 'oh-mine', name: 'Ore Heroes mine', seed: 7, build };
};
