// Ore Heroes: the heroes' camp, in the detailed splat look of the mine and the forge (same camera, lights style and scale).
// A rock chamber off the mine, lit by a campfire in a ring of stones: bedrolls, a lean-to of timber and canvas, crates, a kettle,
// a banner, and a dark passage at the back that leads deeper (where Explore goes). Up to six heroes gather round the fire, at six
// spots (SPOTS below): one sits on a log, one cross-legged on a blanket, four stand. Each spot has its own act (ACTS below), a 3 s loop.
// Each hero is two layers drawn one over the other, so any outfit goes with any face and hair:
//   b-<outfit>-<set>   the body, dressed for a weapon: none (traveller's garb) | sword (knight) | bow (rogue) | axe (berserker) |
//                      spear (pikeman) | shield (guardian) | hammer (forge brute), with the weapon worn or held
//   h-<face>-<hair>-<set>  the head: face fem | male | beard; hair short | long | braid | bun | bald
// <set> is a (spots 2, 4, 1) or b (spots 0, 5, 3): a build draws one layer at three spots far enough apart that tools/split.py can cut
// them into one sprite per spot (b-sword-0, h-fem-bun-3, ...). Colours a player can change (SLOTS): skin and hair, and the outfit's a/b.
//   fire     the campfire flames (clip: a 0-1 loop)
// Knobs as in the mine: HD, TEX, PROPS, ATMOS (0 turns each off), LIGHT, AO, DITHER, MIST. Render at --px 1 (tools/render.js does).
const HEROES = require('./heroes.js');
const WM = require('./weapon-models.js');
module.exports = ({ makeBuilder, makeSculpt, KIT: K }) => {
  const PAL = [
    0x070605, 0x14100e, 0x211a16, 0x30261f, 0x42352b, 0x584738, 0x725d4a, // 0-6 stone (umber)
    0x2a1a10, 0x4a2e1a, 0x6e4628, 0x946238, // 7-10 timber, leather
    0xff9a30, 0xffd060, 0xfff2c0, // 11-13 fire light
    0x0c1820, 0x1a3040, 0x346078, 0x8ac0d8, // 14-17 cold blue
    0x5a2a14, 0x9a4a22, 0xd88038, 0xf0b070, // 18-21 copper
    0x1e3e32, 0x2e6450, 0x4a8a6c, // 22-24 green
    0x2a1e18, 0x4a3628, // 25-26 dark cloth
    0xc8b898, // 27 canvas light
    0x8a6020, 0xc89838, // 28-29 brass
    0x2a2e36, 0x5a606a, 0x9aa2b0, // 30-32 iron
    0x6a4428, 0x9a6634, 0xc8904a, // 33-35 firelit stone
    0x3a0a0a, 0x6a1414, // 36-37 deep ember
    0x101010, // 38 charcoal
    0x5a1010, 0xa82a1c, 0xe04a30, // 39-41 red
    0x1e2e4a, 0x2e4a78, 0x4a6ea8, // 42-44 blue
    0x5a4210, 0x8a6a20, 0xc09a38, // 45-47 mustard
    0x24242a, 0x3c3c46, 0x60606e, 0xd8d0c0, // 48-51 grey, white
    0x26201c, 0x3a322c, 0x524840, // 52-54 soot
    0x4a3e2c, 0x6e5e44, 0x9a8a68, // 55-57 canvas
    0x1c1512, 0x3a2c22, 0x52402e, 0x8a5e3a, 0xb07c4c, 0xe0b078, 0x0f0b09, // 58-64 more stone steps (HD)
    0x5a3a20, 0xb07a44, // 65-66 more timber steps
    0xffd0a0, // 67 sparkle
    0x3a2a20, 0xffc880, 0x24302e, 0x3e5a50, // 68 haze, 69 lantern beam, 70-71 moss
    0x8a96a8, 0xc8d2de, 0xf4f8ff, // 72-74 bright steel
    0x7a1810, 0xc8321e, 0xff7a20, // 75-77 hot
    0x4a2a18, 0x2a1810, // 78-79 dark leather
    ...HEROES.COLOURS, // 80 on: the heroes' own colours (art/src/heroes.js)
    ...WM.COLOURS // then the weapons' (art/src/weapon-models.js), from WBASE
  ];
  const WBASE = 80 + HEROES.COLOURS.length;
  function build(seed) {
    const env = (typeof process !== 'undefined' && process.env) || {};
    const layer = env.OH_LAYER || '';
    const B = makeBuilder(seed, PAL);
    const S = K.sculpt(makeSculpt(B));
    const tags = K.deform.tags(S);
    const HD = +(env.HD || 0.5);
    for (const m of ['lathe', 'rock', 'box', 'tube', 'ball', 'extrude']) { const f = S[m].bind(S); S[m] = (...a) => { const o = a[a.length - 1]; if (o && typeof o === 'object' && !Array.isArray(o) && 'res' in o) a[a.length - 1] = { ...o, res: o.res * HD }; return f(...a) } }
    S.sun = B.norm([0.3, 0.5, 0.8]);
    S.res = 0.08 * HD;
    S.amb = 0.03;
    S.sky = 0.02;
    const n = (x, y, z, f) => B.n3(x * f, y * f, z * f) - 0.5;
    const TEX = env.TEX !== '0', PROPS = env.PROPS !== '0', ATMOS = env.ATMOS !== '0';
    const ROCK = { r: [0, 1, 2, 3, 33, 34, 35] };
    const FLOOR = { r: [0, 1, 2, 3, 33, 34] };
    const WOOD = { r: [7, 8, 9, 10] };
    const IRON = { r: [0, 30, 31, 32] };
    const SOOT = { r: [0, 52, 53, 54] };
    const FIRE = { r: [11, 12, 13], em: true };
    const HOT = { r: [75, 76, 77, 12], em: true };
    const EMBER = { r: [36, 37, 75, 76], em: true };
    const CHAR = { r: [38, 0, 52, 53] };
    const BRASS = { r: [28, 29] };
    const CANVAS = { r: [55, 56, 57, 27] };
    const MOSS = { r: [70, 71, 22] };
    if (TEX) {
      const cracks = K.tex.range(K.tex.voronoi(1.6, { out: 'edge' }), 0, 1, -0.22, 0.06);
      Object.assign(ROCK, { r: [64, 0, 1, 58, 2, 59, 3, 33, 60, 34, 61, 35, 62], mod: (x, y, z) => 0.35 * n(x, y, z, 1.1) + 0.18 * n(x, y, z, 5) + cracks(x, y, z) });
      Object.assign(FLOOR, { r: [64, 0, 1, 58, 2, 59, 33, 60, 34, 61], mod: (x, y, z) => 0.3 * n(x, y, z, 2.2) + 0.2 * n(x, y, z, 9) });
      Object.assign(WOOD, { r: [7, 8, 65, 9, 10, 66], mod: K.tex.range(K.tex.wave(9, { warp: 0.4 }), 0, 1, -0.2, 0.15) });
      Object.assign(IRON, { mod: (x, y, z) => 0.25 * n(x, y, z, 14) });
      Object.assign(SOOT, { mod: (x, y, z) => 0.35 * n(x, y, z, 5) });
      Object.assign(CHAR, { mod: (x, y, z) => 0.5 * n(x, y, z, 18) });
      Object.assign(CANVAS, { mod: (x, y, z) => 0.2 * n(x, y, z, 12) + 0.1 * n(x, y, z, 40) });
      Object.assign(MOSS, { mod: (x, y, z) => 0.4 * n(x, y, z, 20) });
    }
    const R = 5.2, RI = 4.6, H = 5.6;
    const FX = 0.6, FZ = 1.05; // the campfire
    // the six spots round the fire, in the order heroes join: [angle round the fire (180 = left, 270 = back), distance, seated]
    const SPOTS = [[232, 1.55, 'stand'], [308, 1.55, 'stand'], [196, 1.6, 'log'], [344, 1.5, 'floor'], [258, 1.85, 'stand'], [282, 1.85, 'stand']].map(([a, r, kind]) => {
      const t = (a * Math.PI) / 180, x = FX + r * Math.cos(t), z = FZ + r * Math.sin(t);
      return { x, z, kind, f: [FX - x, FZ - z] };
    });
    const LANTERN = [-2.9, -2.6];

    // ---- lights (all before the first bake) ----
    const LK = +(env.LIGHT || 1.6);
    S.lights.push({ p: [FX, 0.75, FZ], r: 5.2 * Math.sqrt(LK), s: 1.9 * LK }); // the campfire
    S.lights.push({ p: [FX, 1.9, FZ + 1.6], r: 3.0, s: 0.55 * LK }); // a little light on the faces round the fire
    S.lights.push({ p: [LANTERN[0] * 0.92, 2.0, LANTERN[1] * 0.92], r: 3.0 * Math.sqrt(LK), s: 1.0 * LK }); // a lantern by the passage

    // ---- floor and a rough rock chamber, front cut away, a passage leading deeper at the back right ----
    S.lathe([0, -0.5, 0], 0.5, R + 0.3, FLOOR, { res: 0.1 });
    S.bake();
    S.lathe([0, 0, 0], H, t => R * (1 - 0.1 * t), ROCK, { res: 0.1 });
    S.lathe([0, -0.1, 0], H + 0.2, t => RI * (1 - 0.12 * t * t), ROCK, { neg: true });
    S.box([0, H / 2, R], [R + 1, H / 2 + 1, R], ROCK, { neg: true });
    const PX = 2.3, pz = -Math.sqrt(RI * RI - PX * PX); // the passage
    S.lathe([PX, 0, pz], 2.3, t => 0.75 * Math.sqrt(Math.max(0, 1 - t * t * t)), ROCK, { neg: true, res: 0.05, ax: [[1, 0, 0], [0, 0, -1], [0, 1, 0]] });
    S.box([PX, 1.1, pz - 0.9], [0.8, 1.2, 0.6], ROCK, { neg: true });
    S.bake();
    // boulders along the foot of the wall and a few outcrops, so the chamber reads as cave and not a built hall
    for (let i = 0; i < 34; i++) {
      const a = -1.5 + (3.0 * i) / 34 + 0.04 * Math.sin(i * 3.7), rr = RI - 0.2 - 0.15 * K.hash(i, 3), x = Math.sin(a) * rr, z = -Math.cos(a) * rr;
      if (Math.abs(x - PX) < 0.95 && z < 0) continue;
      const sz = 0.25 + 0.35 * K.hash(i, 5);
      S.rock([x, sz * 0.35, z], sz, ROCK, { res: 0.04 });
    }
    for (let i = 0; i < 10; i++) {
      const a = -1.3 + (2.6 * i) / 10 + 0.1 * K.hash(i, 7), rr = RI - 0.1, y = 1.2 + 2.6 * K.hash(i, 8), x = Math.sin(a) * rr, z = -Math.cos(a) * rr;
      if (Math.abs(x - PX) < 1.1 && y < 2.6) continue;
      S.rock([x, y, z], 0.3 + 0.3 * K.hash(i, 9), ROCK, { res: 0.05 });
    }
    // timber props framing the passage, a lintel
    const postZ = x => -Math.sqrt(RI * RI - x * x) + 0.25;
    for (const s of [-1, 1]) S.box([PX + s * 0.82, 1.2, postZ(PX + s * 0.82)], [0.09, 1.2, 0.09], WOOD, { res: 0.03 });
    S.tube([[PX - 0.95, 2.42, postZ(PX - 0.82)], [PX + 0.95, 2.42, postZ(PX + 0.82)]], 0.1, 0.1, WOOD, { res: 0.03 });
    S.bake();
    // the lantern on a bracket by the passage
    { const [x, z] = LANTERN, a = Math.atan2(x, -z), wx = Math.sin(a) * (RI - 0.15), wz = -Math.cos(a) * (RI - 0.15), lx = Math.sin(a) * (RI - 0.45), lz = -Math.cos(a) * (RI - 0.45);
      S.tube([[wx, 2.55, wz], [lx, 2.55, lz]], 0.025, 0.025, IRON, { res: 0.01 });
      S.tube([[lx, 2.55, lz], [lx, 2.42, lz]], 0.01, 0.01, IRON, { res: 0.008 });
      S.box([lx, 2.38, lz], [0.08, 0.02, 0.08], IRON, { res: 0.012 });
      S.box([lx, 2.2, lz], [0.06, 0.15, 0.06], FIRE, { res: 0.012 });
      for (const s of [-1, 1]) for (const t of [-1, 1]) S.tube([[lx + s * 0.065, 2.05, lz + t * 0.065], [lx + s * 0.065, 2.37, lz + t * 0.065]], 0.008, 0.008, IRON, { res: 0.006 });
      S.box([lx, 2.02, lz], [0.08, 0.02, 0.08], IRON, { res: 0.012 }); }

    // ---- the campfire: a ring of stones, crossed logs burnt black at their middles, a bed of embers ----
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + 0.2 * K.hash(i, 21), r = 0.52;
      S.rock([FX + Math.cos(a) * r, 0.07, FZ + Math.sin(a) * r * 0.9], 0.1 + 0.04 * K.hash(i, 22), ROCK, { res: 0.015 }); }
    for (let i = 0; i < 14; i++) S.ball([FX + 0.3 * (K.hash(i, 31) - 0.5), 0.05, FZ + 0.3 * (K.hash(i, 32) - 0.5)], 0.06, i % 3 ? EMBER : HOT, { res: 0.012 });
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a);
      S.tube([[FX + c * 0.44, 0.06, FZ + s * 0.4], [FX + c * 0.12, 0.2, FZ + s * 0.11]], 0.055, 0.045, WOOD, { res: 0.012 });
      S.tube([[FX + c * 0.2, 0.17, FZ + s * 0.18], [FX + c * 0.06, 0.24, FZ + s * 0.05]], 0.048, 0.04, CHAR, { res: 0.01 }); }
    S.bake();

    if (PROPS) {
      // a log to sit on at spot 2, a blanket on the floor at spot 3
      { const sp = SPOTS[3], l = Math.hypot(...sp.f), fx = sp.f[0] / l, fz = sp.f[1] / l;
        S.box([sp.x + fx * 0.08, 0.012, sp.z + fz * 0.08], [0.36, 0.012, 0.3], { r: [42, 43, 44], mod: (x, y, z) => 0.25 * Math.sin((x * fz - z * fx) * 60) + 0.1 * n(x, y, z, 30) }, { res: 0.012, ax: [[fz, 0, -fx], [0, 1, 0], [fx, 0, fz]] }); }
      for (const i of [2]) { const sp = SPOTS[i], l = Math.hypot(...sp.f), fx = sp.f[0] / l, fz = sp.f[1] / l, sx = fz, sz = -fx, cx = sp.x - fx * 0.05, cz = sp.z - fz * 0.05;
        S.tube([[cx - sx * 0.5, 0.17, cz - sz * 0.5], [cx + sx * 0.5, 0.17, cz + sz * 0.5]], 0.17, 0.16, WOOD, { res: 0.015 });
        for (const e of [-1, 1]) S.lathe([cx + e * sx * 0.5, 0.17, cz + e * sz * 0.5], 0.015, 0.155, { r: [9, 10, 65, 66] }, { res: 0.008, ax: [[fx, 0, fz], [sx * e, 0, sz * e], [0, 1, 0]] }); }
      // a lean-to on the left: two poles and a slanted canvas, a bedroll and a pack under it
      const LX = -2.75, LZ = -1.55;
      for (const s of [-1, 1]) S.tube([[LX + s * 0.75, 0, LZ + 0.55], [LX + s * 0.75, 1.35, LZ + 0.5]], 0.035, 0.03, WOOD, { res: 0.01 });
      S.tube([[LX - 0.85, 1.35, LZ + 0.5], [LX + 0.85, 1.35, LZ + 0.5]], 0.03, 0.03, WOOD, { res: 0.01 });
      for (let i = 0; i < 18; i++) { const t = i / 17; S.box([LX, 1.35 - t * 1.3, LZ + 0.5 - t * 0.95], [0.8, 0.012, 0.085], CANVAS, { res: 0.012, ax: B.frame(0, 0.95, 0) }); }
      S.ball([LX - 0.2, 0.1, LZ + 0.3], [0.5, 0.09, 0.2], { r: [39, 40, 41] }, { res: 0.012 }); // a red bedroll laid out
      S.lathe([LX + 0.45, 0.0, LZ + 0.15], 0.38, t => 0.17 - 0.04 * t, CANVAS, { res: 0.012 }); // a pack
      S.tube([[LX + 0.33, 0.3, LZ + 0.28], [LX + 0.45, 0.42, LZ + 0.34], [LX + 0.57, 0.3, LZ + 0.28]], 0.012, 0.012, { r: [78, 79, 9] }, { res: 0.006 });
      // rolled bedrolls by the right wall, crates and a barrel, a coil of rope
      for (const [x, z, c] of [[3.55, -1.2, [42, 43, 44]], [3.75, -0.55, [45, 46, 47]], [3.35, -1.75, [22, 23, 24]]]) {
        S.tube([[x - 0.3, 0.13, z], [x + 0.3, 0.13, z + 0.05]], 0.13, 0.13, { r: c }, { res: 0.012 });
        for (const d of [-0.15, 0.15]) S.lathe([x + d, 0.13, z + 0.025], 0.03, 0.135, { r: [78, 79] }, { res: 0.006, ax: [[0, 1, 0], [1, 0, 0.08], [0, 0, 1]] }); }
      S.box([-3.6, 0.25, 0.6], [0.28, 0.25, 0.25], WOOD, { res: 0.015, rd: 0.01 });
      S.box([-3.5, 0.68, 0.55], [0.2, 0.18, 0.18], WOOD, { res: 0.015, rd: 0.01, ax: B.frame(0.3, 0, 0) });
      S.lathe([-3.15, 0, -0.35], 0.62, t => 0.21 + 0.03 * Math.sin(t * Math.PI), WOOD, { res: 0.014 });
      for (const dy of [0.08, 0.52]) S.lathe([-3.15, dy, -0.35], 0.03, 0.235, IRON, { res: 0.008 });
      for (let i = 0; i < 4; i++) S.torus([0.0 - 1.5, 0.03 + i * 0.03, -2.6], 0.2 - i * 0.02, 0.025, { r: [55, 56, 57] }, { res: 0.006 });
      // a kettle on a flat stone at the edge of the fire, and a few logs for the night
      S.rock([FX + 0.75, 0.06, FZ + 0.2], 0.14, ROCK, { res: 0.015 });
      S.lathe([FX + 0.75, 0.14, FZ + 0.2], 0.16, t => 0.1 * Math.sin(Math.PI * (0.15 + 0.7 * t)) + 0.02, { r: [0, 52, 53, 30] }, { res: 0.008 });
      S.tube([[FX + 0.69, 0.3, FZ + 0.2], [FX + 0.75, 0.38, FZ + 0.2], [FX + 0.81, 0.3, FZ + 0.2]], 0.008, 0.008, IRON, { res: 0.005 });
      for (let i = 0; i < 5; i++) S.tube([[0.9 + i * 0.03, 0.08 + (i % 2) * 0.13, -2.9 + (i > 2 ? 0.14 : 0) + 0.02 * i], [1.85 + i * 0.02, 0.08 + (i % 2) * 0.13, -2.75 + (i > 2 ? 0.14 : 0)]], 0.075, 0.07, WOOD, { res: 0.012 });
      // a banner on the back wall: the Ore Heroes' pick and hammer, crossed
      const BX = -0.6, bz = -Math.sqrt(RI * RI - BX * BX) + 0.35;
      S.tube([[BX - 0.6, 2.75, bz], [BX + 0.6, 2.75, bz]], 0.025, 0.025, WOOD, { res: 0.008 });
      S.box([BX, 2.2, bz + 0.02], [0.5, 0.55, 0.012], { r: [39, 40, 41] }, { res: 0.012 });
      for (let i = 0; i < 5; i++) S.box([BX - 0.4 + i * 0.2, 1.6, bz + 0.02], [0.1, 0.06, 0.012], { r: [39, 40] }, { res: 0.01, ax: B.frame(0, 0, i % 2 ? 0.5 : -0.5) });
      for (const s of [-1, 1]) { S.tube([[BX - s * 0.25, 1.85, bz + 0.04], [BX + s * 0.25, 2.5, bz + 0.04]], 0.02, 0.02, { r: [46, 47] }, { res: 0.006 });
        S.box([BX + s * 0.25, 2.5, bz + 0.045], [0.08, 0.045, 0.01], { r: [46, 47, 51] }, { res: 0.006, ax: B.frame(0, 0, -s * 0.9) }); }
      // moss and soot
      S.bake();
      S.cover(MOSS, { up: 0.6, thick: 0.015, where: (x, y, z) => y < 1.2 && y > 0.15 && z < 0.5 && Math.hypot(x, z) > RI - 0.7 && B.n3(x * 3, y * 3, z * 3) > 0.62 });
      S.cover({ r: [52, 53, 54] }, { up: 0.75, thick: 0.015, where: (x, y, z) => y < 0.1 && Math.hypot(x - FX, z - FZ) < 0.9 && B.n3(x * 4, y * 4, z * 4) > 0.45 });
    }
    S.bake();

    // ---- the air: a low haze, the lantern's beam, a warm glow over the fire, sparks rising. Held still, so every layer draws the
    // same air ----
    if (ATMOS) {
      const still = f => (...a) => f(...a.slice(0, -1), { em: true, nd: true });
      const stick = B.stick, axial = B.axial;
      B.stick = still(stick); B.axial = (...a) => axial(...a.slice(0, -1), { nd: true });
      K.mist(B, { rad: RI, y: 0.15, depth: 0.5, n: 110, cols: [68, 2], a: +(env.MIST || 0.05), size: [0.5, 1.1], drift: 0, where: (x, z) => Math.hypot(x, z) < RI - 0.3 });
      K.shafts(B, { from: [LANTERN[0] * 0.9, 2.0, LANTERN[1] * 0.9], dir: [0, -1, 0.1], len: 1.7, r: 0.35, n: 7, col: 69, a: 0.14 });
      K.shafts(B, { from: [FX, 0.3, FZ], dir: [0, 1, 0], len: 1.8, r: 0.5, n: 8, col: 69, a: 0.08 });
      B.stick = stick; B.axial = axial;
      for (let i = 0; i < 10; i++) K.glint(B, [FX + 0.5 * (K.hash(i, 41) - 0.5), 0.9 + 1.3 * K.hash(i, 42), FZ + 0.4 * (K.hash(i, 43) - 0.5)], [1, 0, 0], 0.04, 67);
    }

    // =================== the heroes ===================
    const C = HEROES.palette(80), HB = HEROES(S, K, B, C), Mt = HB.M, flat = Mt.flat;
    const BRASSM = Mt.metal(C.brass), IRONM = Mt.metal(C.iron), DLEATH = flat([78, 79, 8]);
    const MAIL = { r: [C.iron[0], C.iron[1], C.iron[2]], mod: (x, y, z) => 0.35 * n(x, y, z, 60) }; // chainmail: fine ringed iron
    // what a player can change: skin, hair (with brows and beard), and each outfit's two main colours
    const OUT = {
      none: { a: C.tweed, b: C.leather }, sword: { a: C.denim, b: C.red }, bow: { a: C.shirt, b: C.leather }, axe: { a: C.red, b: C.grey },
      spear: { a: C.mustard, b: C.waist }, shield: { a: C.robe, b: C.mustard }, hammer: { a: C.red, b: C.leather }
    };
    const SKIN = C.tan, HAIR = C.dark.concat([C.beard[3]]);
    let slots = null;
    const heroFirst = B.count();
    const parts = {};
    let pose = null;
    const mb = layer.match(/^b-(\w+)-([ab])$/), mh = layer.match(/^h-(fem|male|beard)-(short|long|braid|bun|bald)-([ab])$/);
    const setOf = s => (s === 'a' ? [2, 4, 1] : [0, 5, 3]); // every other spot round the fire, left to right, so no two overlap
    const frame = sp => HB.rig(sp.x, sp.z, sp.f);
    // a figure's hip, chest and lean, as HB.body works them out for the way it sits or stands
    const fig = i => { const k = SPOTS[i].kind, hip = k === 'floor' ? 0.16 : k === 'log' ? 0.36 : 0.66; return { hip, ch: hip + 0.31, lean: k === 'floor' ? 0.05 : k === 'log' ? 0.1 : 0 }; };
    const headAt = i => { const { ch, lean } = fig(i); return [0, ch + 0.27, lean + 0.01]; };
    const neckAt = i => { const { ch, lean } = fig(i); return [0, ch + 0.13, lean + 0.01]; };
    // anything drawn while `autoTag` is set joins that part (the weapons from weapon-models.js, which take no tag of their own)
    let autoTag = null;
    for (const m of ['lathe', 'rock', 'box', 'tube', 'ball', 'extrude', 'torus']) { const f = S[m].bind(S); S[m] = (...a) => { const o = a[a.length - 1];
      if (autoTag && o && typeof o === 'object' && !Array.isArray(o) && !o.tag && ('res' in o || 'ax' in o)) a[a.length - 1] = { ...o, tag: autoTag }; return f(...a) } }
    const wear = (F, k, p, s, roll, tag) => { autoTag = tag || null; WM.draw(S, B, k, { base: WBASE, at: F.P(...p), s, roll, resK: 2.4 }); autoTag = null; };

    // ---- what each hero does by the fire: one act for each spot, a 3 second loop. Each act gives the arms' rest (elbow and hand, by
    // side s = -1 | 1), its props (drawn into a part: 'body', 'f1' the +side forearm, 'f0' the other, 'p' a prop in the +side hand) and
    // the pose at time t: degrees about the figure's side axis (+ tips forward down), up axis (+ turns toward +side) and forward axis
    // (+ rolls the +side up), for the torso (about the hip), the head (about the neck), the upper arms u1/u0, the forearms f1/f0 and p.
    const sm = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
    const win = (t, a, b, c, d) => sm((t - a) / (b - a)) * (1 - sm((t - c) / (d - c)));
    const TAU = Math.PI * 2;
    const WOODM = Mt.wood(C.wood), LIGHTW = flat([C.wood[3], C.wood[4]]);
    const ACTS = [
      { // 0: a drink: the mug comes up, the head tips back, a long pull, and down again; the other hand on the hip
        arms: ({ ch: c }) => ({ 1: [[0.16, c - 0.2, 0.02], [0.13, c - 0.19, 0.19]], [-1]: [[-0.23, c - 0.15, -0.03], [-0.13, c - 0.32, 0.04]] }),
        props(F, P, h) { const q = h[1][1], m = [q[0] - 0.04, q[1] - 0.01, q[2] + 0.01];
          HB.lathe(F, [m[0], m[1] - 0.05, m[2]], 0.1, 0.034, WOODM, P('p'), 0.004);
          for (const y of [-0.035, 0.03]) HB.lathe(F, [m[0], m[1] + y, m[2]], 0.01, 0.037, flat(C.iron.slice(1, 3)), P('p'), 0.003);
          HB.lathe(F, [m[0], m[1] + 0.05, m[2]], 0.012, 0.03, flat([C.wax[0], C.wax[1]]), P('p'), 0.003); // the head on the ale
          HB.tube(F, [[m[0] + 0.03, m[1] + 0.03, m[2]], [m[0] + 0.058, m[1], m[2]], [m[0] + 0.03, m[1] - 0.03, m[2]]], 0.008, 0.008, WOODM, P('p'), 0.003); },
        pose(t) { const w = (TAU * t) / 3, u = win(t, 0.6, 1.1, 1.8, 2.3);
          return { torso: [-3 * u, 4 * Math.sin(w), 1.5 * Math.sin(w)], head: [-20 * u + 3 * Math.sin(2 * w) * (1 - u), 10 * Math.sin(w) * (1 - u), 0],
            u1: [-74 * u, -30 * u, 0], f1: [-55 * u, 0, 0], p: [64 * u, 0, 0], u0: [0, 0, 2 * Math.sin(w)] }; }
      },
      { // 1: warming the hands: palms out to the fire, a lean in, then a good rub
        arms: ({ ch: c }) => ({ 1: [[0.17, c - 0.16, 0.05], [0.07, c - 0.06, 0.28]], [-1]: [[-0.17, c - 0.16, 0.05], [-0.07, c - 0.06, 0.28]] }),
        pose(t) { const w = (TAU * t) / 3, lean = win(t, 0.1, 0.6, 1.1, 1.5), rub = win(t, 1.4, 1.7, 2.5, 2.8), o = Math.sin(TAU * 2 * t);
          return { torso: [7 * lean, 0, 1.5 * Math.sin(w)], head: [4 * lean + 6 * rub, 14 * Math.sin(w) * (1 - rub), 0],
            u1: [-12 * lean, 0, -4 * rub], u0: [-12 * lean, 0, 4 * rub], f1: [5 * rub * o, -7 * rub + 6 * rub * o, 0], f0: [-5 * rub * o, 7 * rub + 6 * rub * o, 0] }; }
      },
      { // 2: a tune on a lute, sitting on the log: strumming, the chords changing, the head nodding along
        arms: () => ({ 1: [[0.2, 0.52, 0.08], [0.09, 0.47, 0.27]], [-1]: [[-0.2, 0.5, 0.17], [-0.2, 0.64, 0.28]] }),
        props(F, P) { const T = P('body'), BOWL = Mt.wood([C.wood[0], C.wood[1], C.wood[2], C.wood[3]]), FACE = flat([C.wood[3], C.wood[4]]);
          HB.ball(F, [0.06, 0.46, 0.21], [0.11, 0.09, 0.05], BOWL, T, 0.004);
          HB.ball(F, [0.06, 0.46, 0.24], [0.1, 0.08, 0.018], FACE, T, 0.003);
          HB.ball(F, [0.05, 0.475, 0.26], [0.024, 0.024, 0.006], flat([C.black[0]]), T, 0.002); // the sound hole
          HB.box(F, [0.1, 0.43, 0.258], [0.03, 0.006, 0.006], flat(C.wood.slice(0, 2)), T, 0.002); // the bridge
          HB.tube(F, [[-0.02, 0.5, 0.24], [-0.26, 0.665, 0.25]], 0.017, 0.014, flat(C.wood.slice(0, 3)), T, 0.003); // the neck
          HB.tube(F, [[-0.26, 0.665, 0.25], [-0.31, 0.68, 0.2]], 0.016, 0.014, flat(C.wood.slice(0, 2)), T, 0.003); // the pegbox, bent back
          for (const k of [0.2, 0.5, 0.8]) HB.ball(F, HB.lerp([-0.26, 0.665, 0.25], [-0.31, 0.68, 0.2], k).map((v, j) => v + (j === 2 ? 0 : j === 0 ? 0.02 : 0.015)), 0.008, flat([C.wax[0]]), T, 0.002);
          HB.tube(F, [[0.1, 0.43, 0.265], [-0.26, 0.668, 0.264]], 0.0035, 0.0035, flat([C.wax[0], C.wax[1]]), T, 0.0015); },
        pose(t) { const w = (TAU * t) / 3, st = Math.sin(TAU * 2 * t), beat = Math.abs(Math.sin(Math.PI * 2 * t)), ch = [0, 7, -5][Math.floor(t) % 3];
          return { torso: [2, 0, 3 * Math.sin(TAU * t)], head: [6 + 7 * beat, -12 + 4 * Math.sin(w), 7 * Math.sin(TAU * t)],
            u1: [3 * st, 0, 0], f1: [12 * st, 0, 0], f0: [0, ch, 0], u0: [0, 0, ch * 0.3] }; }
      },
      { // 3: whittling, cross-legged on a blanket: three strokes of the knife along a stick, then a look at the work
        arms: ({ ch: c }) => ({ 1: [[0.17, c - 0.22, 0.06], [0.06, c - 0.2, 0.28]], [-1]: [[-0.17, c - 0.22, 0.08], [-0.06, c - 0.24, 0.27]] }),
        props(F, P, h) { const a = h[-1][1], k = h[1][1];
          HB.tube(F, [[a[0] - 0.02, a[1] - 0.01, a[2] - 0.02], [a[0] + 0.17, a[1] + 0.07, a[2] + 0.07]], 0.012, 0.009, LIGHTW, P('f0'), 0.003);
          HB.tube(F, [[k[0], k[1] - 0.01, k[2] + 0.01], [k[0] + 0.01, k[1] + 0.065, k[2] + 0.04]], 0.007, 0.002, flat([C.iron[2], C.iron[3]]), P('f1'), 0.002);
          for (let j = 0; j < 5; j++) HB.ball(F, [0.05 * Math.sin(j * 2.3) + 0.05, 0.04, 0.34 + 0.04 * Math.cos(j * 1.7)], [0.012, 0.006, 0.01], LIGHTW, null, 0.003); }, // shavings
        pose(t) { const ph = t % 1, out = t < 2 ? (ph < 0.35 ? sm(ph / 0.35) : 1 - sm((ph - 0.35) / 0.65)) : 0, look = win(t, 2.0, 2.3, 2.7, 3.0);
          return { torso: [7 - 5 * look, 0, 0], head: [20 - 14 * look, 4 * out, 5 * look], f1: [-8 * out, 24 * out, 0], f0: [-38 * look, -6 * look, 0], u0: [-10 * look, 0, 0] }; }
      },
      { // 4: telling a story: a sweep of the hand, arms thrown wide ("this big!"), then leaning in to tell the best part
        arms: ({ ch: c }) => ({ 1: [[0.17, c - 0.2, 0.01], [0.15, c - 0.13, 0.19]], [-1]: [[-0.16, c - 0.23, -0.01], [-0.16, c - 0.45, 0.03]] }),
        pose(t) { const g1 = win(t, 0, 0.4, 0.8, 1.1), g2 = win(t, 1.0, 1.35, 1.8, 2.15), g3 = win(t, 2.1, 2.4, 2.75, 3.0);
          return { torso: [-3 * g2 + 8 * g3, 6 * g1 - 4 * g3, 0], head: [-10 * g2 + 5 * g3, 18 * g1 - 16 * g3, 4 * g3],
            u1: [-25 * g1 - 35 * g2 - 12 * g3, 0, 25 * g1 + 45 * g2], f1: [-20 * g3, 25 * g1 - 15 * g3, 0], u0: [-35 * g2, 0, -45 * g2], f0: [-55 * g2, 0, 0] }; }
      },
      { // 5: roasting a sausage on a long stick held out over the flames, now and then lifting it to see if it's done
        arms: ({ ch: c }) => ({ 1: [[0.16, c - 0.22, 0.03], [0.06, c - 0.3, 0.2]], [-1]: [[-0.15, c - 0.22, 0.12], [0.055, c - 0.32, 0.32]] }),
        props(F, P, h, i) { const a = h[1][1], d = Math.hypot(...SPOTS[i].f) - 0.2, tip = [0, 0.6, d], dir = tip.map((v, j) => v - a[j]), l = Math.hypot(...dir), u = dir.map(v => v / l);
          HB.tube(F, [a.map((v, j) => v - u[j] * 0.1), tip], 0.011, 0.007, WOODM, P('f1'), 0.004);
          HB.tube(F, [tip.map((v, j) => v - u[j] * 0.13), tip.map((v, j) => v + u[j] * 0.01)], 0.024, 0.022, flat([C.red[0], C.red[1], 19, 20]), P('f1'), 0.004); },
        pose(t) { const w = (TAU * t) / 3, chk = win(t, 1.6, 2.0, 2.4, 2.8);
          return { torso: [-2 * chk, 3 * Math.sin(w), 2 * Math.sin(w)], head: [8 - 6 * chk, 6 * Math.sin(w) * (1 - chk), 0],
            u1: [-8 * chk, 0, 0], f1: [-7 * chk + 1.5 * Math.sin(TAU * t), 0, 0], u0: [-8 * chk, 0, 0], f0: [-7 * chk, 0, 0] }; }
      }
    ];
    const D = Math.PI / 180;
    const R3 = (F, r) => K.M.mul(K.M.rot(F.fwd, (r ? r[2] : 0) * D), K.M.mul(K.M.rot([0, 1, 0], (r ? r[1] : 0) * D), K.M.rot(F.side, (r ? r[0] : 0) * D)));
    // an arm in two parts, the upper arm (turning at the shoulder) and the forearm with the hand (turning at the elbow)
    const limb = (F, sh, el, hand, ut, ft, o) => {
      HB.tube(F, [sh, el], 0.036, 0.032, o.sleeve, ut, 0.006);
      HB.ball(F, el, o.rolled ? 0.04 : 0.033, o.rolled ? o.cuff || o.sleeve : o.sleeve, ut, 0.005);
      if (o.rolled) HB.tube(F, [el, hand], 0.028, 0.022, o.skin, ft, 0.005);
      else { HB.tube(F, [el, hand], 0.032, 0.03, o.sleeve, ft, 0.005); if (o.cuff) HB.ball(F, HB.lerp(el, hand, 0.85), [0.035, 0.035, 0.035], o.cuff, ft, 0.004); }
      HB.ball(F, hand, o.glove ? [0.036, 0.04, 0.036] : [0.03, 0.036, 0.03], o.glove || o.skin, ft, 0.005);
      HB.ball(F, [hand[0], hand[1] + 0.028, hand[2] + 0.02], 0.014, o.glove || o.skin, ft, 0.004);
    };
    const rigs = []; // what the puppet needs to move each hero drawn in this layer

    if (mb) {
      const k = mb[1], ramps = OUT[k];
      slots = { skin: SKIN, a: ramps.a, b: ramps.b };
      for (const i of setOf(mb[2])) {
        const sp = SPOTS[i], F = frame(sp), seat = sp.kind !== 'stand', SK = Mt.skin(SKIN), act = ACTS[i];
        const T = 'body' + i, P = p => p && p + '_' + i;
        const A = Mt.cloth(ramps.a, 0.2), Bm = k === 'axe' ? Mt.fur(ramps.b, { len: 0.03 }) : k === 'bow' || k === 'hammer' || k === 'none' ? Mt.leather(ramps.b) : Mt.cloth(ramps.b, 0.18);
        const shirt = k === 'sword' ? MAIL : A;
        const bd = HB.body(F, { tag: T, legTags: ['legs', 'legs'], shirt, trous: Mt.cloth(C.trous, 0.25), boot: Mt.leather(C.boot), skin: SK, belt: DLEATH, buckle: k === 'none' ? IRONM : BRASSM, crouch: sp.kind === 'log' ? 1 : 0, cross: sp.kind === 'floor' });
        const { hip, ch, lean } = bd, ar = act.arms(bd);
        const arms = (sleeve, o = {}) => { for (const s of [-1, 1]) { const j = s > 0 ? 1 : 0, sh = bd.sh(s);
          limb(F, sh, ar[s][0], ar[s][1], P('u' + j), P('f' + j), { sleeve, rolled: o.rolled, cuff: o.cuff || sleeve, skin: SK, glove: o.glove }); } };
        // a weapon too long to sit with stands planted beside the hero
        const plant = (w, s, y, roll) => wear(F, w, [-0.3, y, -0.04], s, roll);
        if (k === 'none') { // a traveller: a long tunic, a leather vest, a satchel on a strap, a walking cloak rolled on the shoulders
          HB.box(F, [0, hip - 0.08, 0.0], [0.105, 0.13, 0.085], A, T, 0.005, null, 0.02);
          HB.box(F, [0, ch - 0.05, 0.01], [0.1, 0.13, 0.085], Bm, T, 0.005, null, 0.02);
          HB.tube(F, [[-0.12, ch + 0.06, 0.05], [0.1, hip + 0.02, 0.07]], 0.009, 0.009, Bm, T, 0.003);
          HB.box(F, [0.12, hip - 0.02, 0.03], [0.03, 0.06, 0.07], Bm, T, 0.004, null, 0.01);
          HB.tube(F, [[-0.13, ch + 0.08, -0.02], [0, ch + 0.11, -0.07], [0.13, ch + 0.08, -0.02]], 0.04, 0.04, Mt.cloth(C.trous, 0.2), T, 0.005);
          arms(A, { rolled: true, cuff: A });
        } else if (k === 'sword') { // a knight: mail under a blue tabard with a brass-edged belt, steel shoulders, a red cape; the sword at the hip
          HB.box(F, [0, ch - 0.12, 0.0], [0.1, 0.3, 0.09], A, T, 0.005, null, 0.015);
          for (let y = 0; y < 3; y++) HB.box(F, [0, ch - 0.02 - y * 0.12, 0.093], [0.012, 0.05, 0.004], flat([C.brass[1], C.brass[2]]), T, 0.002);
          for (const s of [-1, 1]) HB.ball(F, [s * 0.13, ch + 0.07, lean], [0.065, 0.05, 0.065], Mt.metal(C.iron), T, 0.004);
          HB.box(F, [0, ch - 0.15 - (seat ? -0.15 : 0), -0.1], [0.12, seat ? 0.2 : 0.36, 0.012], Bm, T, 0.005, null, 0.015);
          arms(MAIL, { glove: Mt.leather(C.leather) });
          if (sp.kind === 'floor') wear(F, 'sword', [-0.3, 0.06, 0.05], 0.55, Math.PI / 2 + 0.1);
          else wear(F, 'sword', [-0.14, seat ? 0.36 : 0.5, 0.04], 0.55, Math.PI + 0.25, T);
        } else if (k === 'bow') { // a rogue: a green hooded cloak (the hood down on the shoulders), a laced leather jerkin, the bow and quiver on the back
          HB.box(F, [0, ch - 0.05, 0.01], [0.1, 0.15, 0.088], Bm, T, 0.005, null, 0.02);
          for (const y of [0.0, -0.07, -0.14]) HB.tube(F, [[-0.03, ch + y, 0.098], [0.03, ch + y + 0.015, 0.098]], 0.005, 0.005, flat([C.rope[1], C.rope[2]]), T, 0.002);
          HB.ball(F, [0, ch + 0.08, lean - 0.03], [0.17, 0.07, 0.13], A, T, 0.005);
          HB.box(F, [0, ch - 0.18 + (seat ? 0.1 : 0), -0.09], [0.13, seat ? 0.18 : 0.3, 0.015], A, T, 0.005, null, 0.015);
          HB.tube(F, [[0.1, hip, -0.13], [-0.07, ch + 0.14, -0.14]], 0.04, 0.045, Bm, T, 0.004);
          for (let j = 0; j < 4; j++) HB.box(F, [-0.09 + j * 0.022, ch + 0.21, -0.14], [0.006, 0.04, 0.016], flat([C.red[1], C.red[2]]), T, 0.003);
          arms(A, { cuff: Bm });
          wear(F, 'bow', [0.02, ch - 0.05, -0.16], 0.75, 0.55, T);
        } else if (k === 'axe') { // a berserker: a red tunic, a wolf-fur mantle over bare arms, leather wraps, the great axe over the back
          HB.box(F, [0, hip - 0.06, 0.0], [0.105, 0.13, 0.085], A, T, 0.005, null, 0.02);
          HB.ball(F, [0, ch + 0.06, lean - 0.01], [0.19, 0.085, 0.14], Bm, T, 0.006);
          arms(SK, { rolled: true, cuff: DLEATH });
          wear(F, 'axe', [0.04, ch - 0.02, -0.15], 0.75, -0.55, T);
        } else if (k === 'spear') { // a pikeman: a quilted mustard gambeson, a steel breastplate, a burgundy sash; the spear planted beside
          for (let y = 0; y < 5; y++) HB.lathe(F, [0, hip - 0.04 + y * 0.075, 0], 0.012, 0.105 + 0.006 * Math.sin(y), flat([ramps.a[0], ramps.a[1]]), T, 0.003);
          HB.ball(F, [0, ch - 0.02, lean + 0.035], [0.11, 0.11, 0.075], IRONM, T, 0.005);
          HB.tube(F, [[-0.11, ch + 0.05, 0.06], [0.09, hip, 0.08]], 0.025, 0.025, Bm, T, 0.004);
          HB.tube(F, [[0.09, hip, 0.08], [0.12, hip - 0.16, 0.08]], 0.02, 0.008, Bm, T, 0.004);
          arms(A, { cuff: A });
          plant('spear', 1.05, 0.58, 0.06);
        } else if (k === 'shield') { // a guardian: a long purple surcoat with mustard trim over mail, a steel gorget; the round shield on the back
          HB.box(F, [0, ch - 0.14, 0.0], [0.11, 0.34, 0.092], A, T, 0.005, null, 0.015);
          HB.box(F, [0, ch - 0.14, 0.094], [0.02, 0.32, 0.004], flat([ramps.b[1], ramps.b[2]]), T, 0.002);
          HB.lathe(F, [0, hip + 0.0, 0], 0.035, 0.11, Bm, T, 0.004);
          HB.lathe(F, [0, ch + 0.08, lean], 0.07, t => 0.075 - 0.02 * t, IRONM, T, 0.004);
          arms(MAIL, { glove: Mt.leather(C.leather) });
          wear(F, 'shield', [0, ch - 0.06, -0.15], 0.42, 0, T);
        } else if (k === 'hammer') { // a forge brute: a red shirt with the sleeves rolled, a heavy leather apron, gauntlets; the warhammer stood on its head
          HB.box(F, [0, ch - 0.04, 0.095], [0.085, 0.13, 0.01], Bm, T, 0.004, null, 0.008);
          HB.box(F, [0, hip - 0.12, 0.09], [0.1, 0.16, 0.012], Bm, T, 0.004, null, 0.01);
          for (const s of [-1, 1]) HB.tube(F, [[s * 0.065, ch + 0.08, 0.098], [s * 0.06, ch + 0.17, 0.0], [0, ch + 0.18, -0.06]], 0.008, 0.008, DLEATH, T, 0.003);
          arms(A, { rolled: true, cuff: A, glove: Mt.leather(C.leather) });
          plant('hammer', 0.7, 0.27, Math.PI - 0.1);
        }
        if (act.props) act.props(F, P, ar, i);
        const W = v => F.P(...v);
        rigs.push({ i, F, hip: W([0, hip, 0]), sh: { 1: W(bd.sh(1)), 0: W(bd.sh(-1)) }, el: { 1: W(ar[1][0]), 0: W(ar[-1][0]) }, hand: W(ar[1][1]) });
      }
      if (env.OH_STILL !== '1') {
        const D3 = rigs;
        pose = (t, dt, pup) => { for (const r of D3) { const q = ACTS[r.i].pose(t % 3), p = (k, v) => { pup.pose[k === 'body' ? 'body' + r.i : k + '_' + r.i] = v; };
          p('body', { turn: R3(r.F, q.torso) });
          for (const j of [1, 0]) { p('u' + j, { turn: R3(r.F, q['u' + j]) }); p('f' + j, { turn: R3(r.F, q['f' + j]) }); }
          p('p', { turn: R3(r.F, q.p) }); } };
        for (const r of rigs) { const i = r.i;
          parts['body' + i] = { pivot: r.hip, slices: 1 };
          for (const j of [1, 0]) { parts['u' + j + '_' + i] = { pivot: r.sh[j], parent: 'body' + i, slices: 1 };
            parts['f' + j + '_' + i] = { pivot: r.el[j], parent: 'u' + j + '_' + i, slices: 1 }; }
          parts['p_' + i] = { pivot: r.hand, parent: 'f1_' + i, slices: 1 }; } // (a part that drew nothing is dropped below, once the bake has tagged the splats)
      }
    }
    if (mh) {
      const [, face, hair, set] = mh;
      slots = { skin: SKIN, hair: HAIR };
      const HR = HAIR.slice(0, 3), FUR = o => Mt.fur(HR, o);
      for (const i of setOf(set)) {
        const sp = SPOTS[i], F = frame(sp), SK = Mt.skin(SKIN), H0 = headAt(i), tg = 'head' + i;
        // the neck too, so the head never floats over a collar
        HB.tube(F, [[0, H0[1] - 0.2, H0[2] - 0.01], [0, H0[1] - 0.1, H0[2]]], 0.038, 0.04, SK, tg, 0.005);
        const hd = HB.head(F, H0, { tag: tg, skin: SK, fem: face === 'fem', beard: face === 'beard' ? 'full' : 'none', tash: 'none', beardRamp: HAIR, brow: HR, nose: ['round', 'long', 'hook'][i % 3], hair: 'none' });
        const at = hd.at;
        if (hair !== 'bald') HB.ball(F, at(0, 0.05, -0.03), [0.128, 0.105, 0.125], FUR({ len: 0.012 }), tg, 0.005); // short hair, close to the skull
        if (hair === 'long') { for (const s of [-1, 1]) HB.ball(F, at(s * 0.105, -0.07, -0.03), [0.05, 0.13, 0.075], FUR({ len: 0.03 }), tg, 0.005);
          HB.ball(F, at(0, -0.08, -0.08), [0.125, 0.16, 0.07], FUR({ len: 0.03 }), tg, 0.006); }
        if (hair === 'braid') { const p = [at(0.1, -0.02, -0.03), at(0.12, -0.14, 0.0), at(0.11, -0.27, 0.06), at(0.09, -0.4, 0.09)];
          for (let j = 0; j < 7; j++) { const t = j / 6, q = p[Math.min(2, Math.floor(t * 3))], r = p[Math.min(3, Math.floor(t * 3) + 1)], u = t * 3 - Math.floor(t * 3);
            HB.ball(F, HB.lerp(q, r, Math.min(1, u)).map((v, m) => v + (m === 0 ? 0.008 * (j % 2 ? 1 : -1) : 0)), [0.028 - 0.002 * j, 0.03, 0.028 - 0.002 * j], FUR({ len: 0.012 }), tg, 0.004); }
          HB.lathe(F, [p[3][0], p[3][1] - 0.035, p[3][2]], 0.015, 0.02, flat([78, 79]), tg, 0.003); }
        if (hair === 'bun') { HB.ball(F, at(0, 0.11, -0.08), [0.065, 0.06, 0.06], FUR({ len: 0.015 }), tg, 0.005); HB.lathe(F, at(0, 0.075, -0.065), 0.015, 0.045, flat([78, 79]), tg, 0.003); }
        rigs.push({ i, F, hip: F.P(0, fig(i).hip, 0), neck: F.P(...neckAt(i)) });
      }
      if (env.OH_STILL !== '1') {
        // the head turns on the neck, and rides the torso's turn about the hip (the same turn the body layer gives it)
        pose = (t, dt, pup) => { for (const r of rigs) { const q = ACTS[r.i].pose(t % 3), Rt = R3(r.F, q.torso), L = K.M.mul(Rt, R3(r.F, q.head)), N = r.neck, Hp = r.hip;
          const m = K.M.app(Rt, N.map((v, j) => v - Hp[j])); pup.pose['head' + r.i] = { turn: L, pos: m.map((v, j) => v + Hp[j] - N[j]) }; } };
        for (const r of rigs) parts['head' + r.i] = { pivot: r.neck, slices: 1 };
      }
    }

    // ---- the campfire flames ----
    if (layer === 'fire') {
      const FL = [];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.5, x = FX + 0.16 * Math.cos(a), z = FZ + 0.12 * Math.sin(a), h = 0.26 + 0.16 * Math.sin(i * 1.9 + 1);
        S.tube([[x, 0.15, z], [x, 0.15 + h * 0.5, z], [x * 0.6 + FX * 0.4, 0.15 + h, z * 0.6 + FZ * 0.4]], 0.085, 0.006, { r: [75, 76, 77, 11], em: true }, { tag: 'f' + i, res: 0.01 });
        S.tube([[x, 0.13, z + 0.07], [x, 0.13 + h * 0.55, z + 0.07]], 0.05, 0.004, { r: [11, 12, 13], em: true }, { tag: 'f' + i, res: 0.008 });
        parts['f' + i] = { pivot: [x, 0.15, z], slices: 2 };
        FL.push(i);
      }
      pose = (t, dt, pup) => FL.forEach(i => { const a = i * 1.7, k = 1 + 0.25 * Math.sin(Math.PI * 2 * 2 * t + a) + 0.1 * Math.sin(Math.PI * 2 * 5 * t + a * 2);
        pup.pose['f' + i] = { scale: [1 - 0.3 * (k - 1), k, 1 - 0.3 * (k - 1)], rot: [0, 0, 8 * Math.sin(Math.PI * 2 * t + a)] }; });
    }
    S.bake();

    const W = B.finish({ cam: { target: [0, 2.2, -0.4], dist: 16.5, pitch: 0.3, yaw: 0 }, detail: +(env.DETAIL || 26), dither: +(env.DITHER || 0.25), ao: { k: +(env.AO || 0.55), range: 0.7 }, radius: 7 });
    if (slots) { W.ohSlots = {}; for (const [k, ids] of Object.entries(slots)) W.ohSlots[k] = ids.map(i => PAL[i]); W.ohFirst = heroFirst; }
    if (pose) {
      const P2 = {};
      for (const [k, v] of Object.entries(parts)) if (tags[k] && tags[k].length) P2[k] = { ...v, ids: tags[k] };
      K.puppet(W, { parts: P2, pose });
    }
    return W;
  }
  return { id: 'oh-camp', name: 'Ore Heroes camp', seed: 23, build };
};
