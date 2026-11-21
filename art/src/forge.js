// Ore Heroes: the forge, in the detailed splat look of the mine (art/src/mine.js): fine splats, stone with grain and cracks,
// timber grain, soot, a coal heap, bellows, tools on the walls, a haze and the furnace's glow. Same camera, lights style and scale
// as the mine; the heroes are sculpted from art/src/heroes.js, thin and detailed, and each is customisable (SLOTS below).
// A cut-away stone hall: a great furnace in the back wall, the Blacksmith's anvil in the middle, a weapon rack on the back wall,
// and five smithing stations (sword, axe, spear, shield, warhammer) that open one by one.
// OH_LAYER picks what is drawn (none = the empty hall, the background):
//   smith            you, the Blacksmith, at the anvil (clip: ready 0-1, strike 1-1.12, recover 1.12-1.5)
//   st-sword|st-axe|st-spear|st-shield|st-hammer   a station's bench and little anvil (drawn once the Blacksmith learns that weapon)
//   sword            the Swordsmith at his table (clip: hone 0-2, study 2-4)
//   axe|spear|shield|hammer               the smith who works that station (same clip as the Blacksmith)
//   w-sword|w-axe|w-spear|w-shield|w-hammer  one finished weapon hanging in its column of the rack
//   fire             the furnace flames (clip: a 0-1 loop)
// OH_PORTRAIT=1: no hall, just the hero, softly lit, for the portrait icons (tools/portraits.js).
// Knobs as in the mine: HD, TEX, PROPS, ATMOS (0 turns each off), LIGHT, AO, DITHER, MIST. Render at --px 1 (tools/render.js does).
const HEROES = require('./heroes.js');
const WM = require('./weapon-models.js'); // the finished weapons on the rack, the same sculpts as the weapon icons
module.exports = ({ makeBuilder, makeSculpt, KIT: K }) => {
  const PAL = [
    0x070605, 0x14100e, 0x211a16, 0x30261f, 0x42352b, 0x584738, 0x725d4a, // 0-6 stone (umber)
    0x2a1a10, 0x4a2e1a, 0x6e4628, 0x946238, // 7-10 timber, leather
    0xff9a30, 0xffd060, 0xfff2c0, // 11-13 fire light
    0x0c1820, 0x1a3040, 0x346078, 0x8ac0d8, // 14-17 quench water
    0x5a2a14, 0x9a4a22, 0xd88038, 0xf0b070, // 18-21 brick and copper
    0x1e3e32, 0x2e6450, 0x4a8a6c, // 22-24 green
    0x2a1e18, 0x4a3628, // 25-26 dark cloth
    0xd8a07a, // 27 skin (unused)
    0x8a6020, 0xc89838, // 28-29 brass
    0x2a2e36, 0x5a606a, 0x9aa2b0, // 30-32 iron
    0x6a4428, 0x9a6634, 0xc8904a, // 33-35 firelit stone
    0x3a0a0a, 0x6a1414, // 36-37 deep ember
    0x101010, // 38 coal
    0x5a1010, 0xa82a1c, 0xe04a30, // 39-41 red
    0x1e2e4a, 0x2e4a78, 0x4a6ea8, // 42-44 blue
    0x5a4210, 0x8a6a20, 0xc09a38, // 45-47 mustard
    0x24242a, 0x3c3c46, 0x60606e, 0xd8d0c0, // 48-51 grey, white
    0x26201c, 0x3a322c, 0x524840, // 52-54 soot
    0x1a1430, 0x2e2450, 0x4a3a7a, // 55-57 (unused)
    0x1c1512, 0x3a2c22, 0x52402e, 0x8a5e3a, 0xb07c4c, 0xe0b078, 0x0f0b09, // 58-64 more stone steps (HD)
    0x5a3a20, 0xb07a44, // 65-66 more timber steps
    0xffd0a0, // 67 sparkle
    0x3a2a20, 0xffc880, 0x24302e, 0x3e5a50, // 68 haze, 69 lantern beam, 70-71 (unused)
    0x8a96a8, 0xc8d2de, 0xf4f8ff, // 72-74 bright steel
    0x7a1810, 0xc8321e, 0xff7a20, // 75-77 hot metal
    0x4a2a18, 0x2a1810, // 78-79 dark leather
    ...HEROES.COLOURS, // 80 on: the heroes' own colours (art/src/heroes.js)
    ...WM.COLOURS.slice(0, 45) // then the weapons' (art/src/weapon-models.js), from WBASE: the first 45, as when the forge was drawn (the bow is drawn lite)
  ];
  const WBASE = 80 + HEROES.COLOURS.length;
  function build(seed) {
    const env = (typeof process !== 'undefined' && process.env) || {};
    const layer = env.OH_LAYER || '', all = layer === 'all', on = k => all || layer === k;
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
    const STONE = { r: [0, 1, 2, 3, 33, 34, 35] };
    const FLOOR = { r: [0, 1, 2, 3, 33, 34] };
    const FLAG = { r: [1, 2, 3, 33] };
    const BRICK = { r: [1, 18, 19, 33] };
    const WOOD = { r: [7, 8, 9, 10] };
    const IRON = { r: [0, 30, 31, 32] };
    const DARK = { r: [0, 30, 31] };
    const SOOT = { r: [0, 52, 53, 54] };
    const STEEL = { r: [31, 72, 73, 74] };
    const FIRE = { r: [11, 12, 13], em: true };
    const HOT = { r: [75, 76, 77, 12], em: true };
    const EMBER = { r: [36, 37, 75, 76], em: true };
    const COAL = { r: [38, 0, 52, 30] };
    const BRASS = { r: [28, 29] };
    const LEATHER = { r: [79, 78, 8, 9] };
    const WATER = { r: [14, 15, 16] };
    if (TEX) {
      const cracks = K.tex.range(K.tex.voronoi(1.6, { out: 'edge' }), 0, 1, -0.22, 0.06);
      Object.assign(STONE, { r: [64, 0, 1, 58, 2, 59, 3, 33, 60, 34, 61, 35, 62], mod: (x, y, z) => 0.3 * n(x, y, z, 1.4) + 0.15 * n(x, y, z, 6) + cracks(x, y, z) });
      Object.assign(FLOOR, { r: [64, 0, 1, 58, 2, 59, 33, 60, 34, 61], mod: (x, y, z) => 0.3 * n(x, y, z, 2.2) + 0.2 * n(x, y, z, 9) });
      Object.assign(FLAG, { r: [0, 1, 58, 2, 59, 3, 33, 60], mod: (x, y, z) => 0.35 * n(x, y, z, 3) + 0.2 * n(x, y, z, 12) });
      Object.assign(BRICK, { r: [64, 0, 1, 58, 18, 2, 19, 33], mod: (x, y, z) => 0.3 * n(x, y, z, 7) + 0.25 * K.tex.range(K.tex.voronoi(5, { out: 'edge' }), 0, 1, -1, 0.2)(x, y, z) });
      Object.assign(WOOD, { r: [7, 8, 65, 9, 10, 66], mod: K.tex.range(K.tex.wave(9, { warp: 0.4 }), 0, 1, -0.2, 0.15) });
      Object.assign(IRON, { mod: (x, y, z) => 0.25 * n(x, y, z, 14) });
      Object.assign(SOOT, { mod: (x, y, z) => 0.35 * n(x, y, z, 5) });
      Object.assign(COAL, { mod: (x, y, z) => 0.5 * n(x, y, z, 18) });
      Object.assign(LEATHER, { mod: (x, y, z) => 0.3 * n(x, y, z, 16) });
    }
    const R = 5.2, RI = 4.6, H = 5.2;
    const wallZ = x => -Math.sqrt(Math.max(0, RI * RI - x * x));
    const FX = -0.6, fz = wallZ(FX) + 0.55; // the furnace, in the back wall
    const AX = 1.15, AZ = 0.55, AT = 0.78; // the anvil and the height of its face
    const RX = 2.2, RZ = wallZ(RX + 1.05) + 0.12; // the weapon rack
    const COLS = { sword: -0.76, axe: -0.38, spear: 0, shield: 0.38, hammer: 0.76 };
    // the five stations: where each smith stands and which way he faces (+x or -x)
    const ST = { sword: { x: -2.35, z: -2.0, dir: 1 }, axe: { x: 3.55, z: -0.9, dir: -1 }, spear: { x: -3.65, z: -0.25, dir: 1 },
      shield: { x: 3.35, z: 1.05, dir: -1 }, hammer: { x: -2.3, z: 1.05, dir: 1 }, bow: { x: -0.95, z: 1.75, dir: 1 } };
    const LANTERNS = [[-3.3, -1.0], [3.3, -0.6]];

    // ---- lights (all before the first bake) ----
    const LK = +(env.LIGHT || 1.6);
    S.lights.push({ p: [FX, 0.6, fz + 1.2], r: 5.0 * Math.sqrt(LK), s: 1.6 * LK }); // the furnace mouth
    S.lights.push({ p: [AX - 0.3, 1.7, AZ + 1.3], r: 2.6, s: 0.8 * LK }); // over the anvil, lighting the Blacksmith's face
    for (const [x, z] of LANTERNS) S.lights.push({ p: [x * 0.92, 2.0, z * 0.92], r: 3.0 * Math.sqrt(LK), s: 1.2 * LK }); // wall lanterns

    const PORTRAIT = env.OH_PORTRAIT === '1';
    if (PORTRAIT) { S.amb = +(env.PAMB || 0.3); S.sky = +(env.PSKY || 0.25); }
    if (!PORTRAIT) {
    // ---- floor and a half-round stone hall, front cut away ----
    S.lathe([0, -0.5, 0], 0.5, R + 0.3, FLOOR, { res: 0.1 });
    S.bake();
    S.lathe([0, 0, 0], H, t => R * (1 - 0.06 * t), STONE, { res: 0.1 });
    S.lathe([0, -0.1, 0], H + 0.2, RI, STONE, { neg: true });
    S.box([0, H / 2, R], [R + 1, H / 2 + 1, R], STONE, { neg: true });
    S.bake();
    // the stones of the wall: blocks in courses, a little proud of the face, so the hall reads as built stone
    for (let c = 0; c < 7; c++) for (let i = 0; i < 26; i++) {
      const a = -1.45 + (2.9 * (i + (c % 2) * 0.5)) / 26, y = 0.32 + c * 0.62, rr = RI - 0.02;
      if (Math.abs(Math.sin(a) * rr - FX) < 1.25 && y < 3.2) continue; // the furnace
      if (Math.abs(Math.sin(a) * rr - RX) < 1.1 && y < 2.5) continue; // the rack
      S.box([Math.sin(a) * rr, y, -Math.cos(a) * rr], [0.27, 0.27, 0.05], STONE, { res: 0.03, ax: B.frame(-a, 0, 0), rd: 0.04 });
    }
    // flagstones, worn and uneven
    for (let i = 0; i < 26; i++) {
      const x = -4.0 + (i % 6) * 1.45 + (Math.floor(i / 6) % 2) * 0.7, z = -3.4 + Math.floor(i / 6) * 1.15;
      if (Math.hypot(x, z) > RI - 0.35) continue;
      S.box([x, 0.0, z], [0.66, 0.025, 0.52], FLAG, { res: 0.03, rd: 0.03, ax: B.frame(0.05 * Math.sin(i * 2.3), 0, 0) });
    }
    // timber posts and a beam around the wall
    for (const a of [-1.25, -0.62, 0.62, 1.25]) {
      const x = Math.sin(a) * (RI - 0.1), z = -Math.cos(a) * (RI - 0.1);
      S.box([x, H * 0.4, z], [0.12, H * 0.4, 0.12], WOOD, { res: 0.03 });
    }
    for (let i = 0; i < 24; i++) {
      const a0 = -1.4 + (2.8 * i) / 24, a1 = -1.4 + (2.8 * (i + 1)) / 24, rr = RI - 0.12;
      S.tube([[Math.sin(a0) * rr, H * 0.8, -Math.cos(a0) * rr], [Math.sin(a1) * rr, H * 0.8, -Math.cos(a1) * rr]], 0.1, 0.1, WOOD, { res: 0.03 });
    }
    // wall lanterns on brackets
    for (const [x, z] of LANTERNS) {
      const a = Math.atan2(x, -z), wx = Math.sin(a) * (RI - 0.15), wz = -Math.cos(a) * (RI - 0.15);
      const lx = Math.sin(a) * (RI - 0.45), lz = -Math.cos(a) * (RI - 0.45);
      S.tube([[wx, 2.55, wz], [lx, 2.55, lz]], 0.025, 0.025, IRON, { res: 0.01 });
      S.tube([[lx, 2.55, lz], [lx, 2.42, lz]], 0.01, 0.01, IRON, { res: 0.008 });
      S.box([lx, 2.38, lz], [0.08, 0.02, 0.08], IRON, { res: 0.012 });
      S.box([lx, 2.2, lz], [0.06, 0.15, 0.06], FIRE, { res: 0.012 });
      for (const s of [-1, 1]) for (const t of [-1, 1]) S.tube([[lx + s * 0.065, 2.05, lz + t * 0.065], [lx + s * 0.065, 2.37, lz + t * 0.065]], 0.008, 0.008, IRON, { res: 0.006 });
      S.box([lx, 2.02, lz], [0.08, 0.02, 0.08], IRON, { res: 0.012 });
    }

    // ---- the furnace: a brick block in the back wall with an arched glowing mouth, a soot-black hood and a chimney ----
    S.box([FX, 1.25, fz], [1.05, 1.25, 0.7], BRICK, { res: 0.04, rd: 0.05 });
    const arch = (w, h) => { const p = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); p.push([Math.cos(a) * w, h + Math.sin(a) * w]); } p.push([-w, 0], [w, 0]); return p; };
    S.extrude([arch(0.68, 0.5)], [FX, 0.3, fz + 0.86], 0.14, BRICK, {}); // a brick ring round the mouth
    S.extrude([arch(0.52, 0.5)], [FX, 0.3, fz + 0.9], 1.0, BRICK, { neg: true });
    S.box([FX, 0.75, fz + 0.0], [0.52, 0.48, 0.06], FIRE, { res: 0.025 }); // the white-hot back of the firebox
    S.box([FX, 0.24, fz + 0.88], [0.75, 0.06, 0.12], IRON, { res: 0.02 }); // the sill
    S.lathe([FX, 2.5, fz], 1.0, t => 0.98 - 0.68 * t, SOOT, { res: 0.04 }); // the hood
    S.box([FX, 4.4, fz], [0.3, 1.0, 0.3], SOOT, { res: 0.04 }); // the chimney
    for (const y of [2.52, 3.5]) S.lathe([FX, y, fz], 0.06, y < 3 ? 1.06 : 0.32, BRASS, { res: 0.015 });
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; S.ball([FX + Math.cos(a) * 1.0, 2.55, fz + Math.sin(a) * 1.0], 0.025, BRASS, { res: 0.008 }); } // rivets on the hood band
    S.bake();
    // coals inside the mouth (the dancing flames are the fire layer)
    for (let i = 0; i < 9; i++) S.ball([FX - 0.42 + i * 0.105, 0.36, fz + 0.45 + 0.08 * Math.sin(i * 2.1)], 0.085, HOT, { res: 0.012 });

    // ---- the Blacksmith's anvil on a stump, a quench trough beside it ----
    S.lathe([AX, 0, AZ], 0.42, t => 0.3 + 0.02 * Math.sin(t * 9), WOOD, { res: 0.02 });
    for (const y of [0.08, 0.34]) S.lathe([AX, y, AZ], 0.03, 0.315, IRON, { res: 0.01 });
    S.box([AX, 0.52, AZ], [0.14, 0.12, 0.2], IRON, { res: 0.012 });
    S.box([AX, AT - 0.08, AZ], [0.2, 0.08, 0.32], IRON, { res: 0.012, rd: 0.02 });
    S.box([AX, AT - 0.005, AZ], [0.19, 0.006, 0.3], { r: [31, 32, 72] }, { res: 0.008 }); // the polished face
    S.tube([[AX, AT - 0.06, AZ + 0.32], [AX, AT - 0.1, AZ + 0.55]], 0.08, 0.01, IRON, { res: 0.01 }); // the horn
    S.box([AX + 0.75, 0.22, AZ - 0.55], [0.32, 0.22, 0.2], WOOD, { res: 0.02 });
    for (const dx of [-0.29, 0.29]) S.box([AX + 0.75 + dx, 0.22, AZ - 0.55], [0.03, 0.23, 0.21], IRON, { res: 0.008 }); // its iron bands
    S.box([AX + 0.75, 0.43, AZ - 0.55], [0.27, 0.02, 0.15], WATER, { res: 0.015 });

    // ---- the weapon rack on the back wall, right of the furnace: a board with five columns of pegs ----
    S.box([RX, 1.55, RZ], [0.95, 0.75, 0.05], WOOD, { res: 0.02 });
    S.box([RX, 2.33, RZ + 0.02], [1.02, 0.05, 0.08], WOOD, { res: 0.015 });
    S.box([RX, 0.78, RZ + 0.02], [1.02, 0.05, 0.08], WOOD, { res: 0.015 });
    for (const dx of [-0.85, 0.85]) S.box([RX + dx, 0.78, RZ - 0.02], [0.05, 0.78, 0.05], WOOD, { res: 0.015 }); // its legs
    for (const c of Object.values(COLS)) S.box([RX + c, 2.1, RZ + 0.08], [0.03, 0.03, 0.06], IRON, { res: 0.008 });

    if (PROPS) {
      const h = (i, k) => K.hash(i, k);
      // a heap of coal by the furnace with a shovel in it, and a few lumps strewn about
      for (let i = 0; i < 46; i++) { const a = h(i, 1) * Math.PI, r = 0.55 * Math.sqrt(h(i, 2)), x = FX - 1.6 + Math.cos(a) * r, z = fz + 0.7 + Math.sin(a) * r * 0.7;
        S.rock([x, 0.05 + 0.3 * (1 - r / 0.55) * h(i, 3), z], 0.06 + 0.05 * h(i, 4), COAL, { res: 0.012 }); }
      S.tube([[FX - 1.5, 0.35, fz + 0.75], [FX - 1.2, 1.1, fz + 0.95]], 0.018, 0.018, WOOD, { res: 0.008 });
      S.box([FX - 1.56, 0.25, fz + 0.72], [0.1, 0.012, 0.13], IRON, { res: 0.008, ax: B.frame(0.3, 0.5, 0) });
      // the bellows beside the furnace, its nozzle into the brick
      const BW = [FX + 1.45, 0.55, fz + 0.75];
      S.ball(BW, [0.34, 0.12, 0.22], LEATHER, { res: 0.015 });
      for (const dy of [-0.1, 0.1]) S.box([BW[0], BW[1] + dy, BW[2]], [0.36, 0.02, 0.24], WOOD, { res: 0.01 });
      S.tube([[BW[0] - 0.34, BW[1], BW[2]], [FX + 0.95, 0.5, fz + 0.4]], 0.035, 0.02, IRON, { res: 0.008 });
      S.tube([[BW[0] + 0.32, BW[1] + 0.1, BW[2]], [BW[0] + 0.62, BW[1] + 0.28, BW[2]]], 0.02, 0.02, WOOD, { res: 0.008 });
      for (const s of [-1, 1]) S.box([BW[0], 0.2, BW[2] + s * 0.18], [0.03, 0.2, 0.03], WOOD, { res: 0.008 });
      // tools hung on the wall left of the furnace: tongs, hammers, a file
      const TW = -2.1, tz = wallZ(TW) + 0.06;
      S.box([TW, 2.0, tz], [0.6, 0.04, 0.03], WOOD, { res: 0.01 });
      for (let i = 0; i < 5; i++) { const x = TW - 0.48 + i * 0.24;
        if (i % 2) { S.tube([[x, 1.98, tz + 0.04], [x - 0.04, 1.45, tz + 0.04]], 0.012, 0.008, IRON, { res: 0.006 }); S.tube([[x, 1.98, tz + 0.04], [x + 0.04, 1.45, tz + 0.04]], 0.012, 0.008, IRON, { res: 0.006 }); }
        else { S.tube([[x, 1.98, tz + 0.04], [x, 1.55, tz + 0.04]], 0.016, 0.016, WOOD, { res: 0.006 }); S.box([x, 1.52, tz + 0.04], [0.06, 0.035, 0.035], IRON, { res: 0.006 }); } }
      // barrels and a crate of ore by the rack, iron bars leaning on the wall
      for (const [x, z, s] of [[3.75, -2.25, 1], [3.35, -2.65, 0.85]]) { S.lathe([x, 0, z], 0.6 * s, t => (0.2 + 0.03 * Math.sin(t * Math.PI)) * s, WOOD, { res: 0.014 });
        for (const dy of [0.08, 0.5]) S.lathe([x, dy * s, z], 0.03, (0.22 + 0.03 * Math.sin((dy / 0.6) * Math.PI)) * s, IRON, { res: 0.008 }); }
      S.box([1.05, 0.2, -3.6], [0.3, 0.2, 0.22], WOOD, { res: 0.015, rd: 0.01 });
      for (let i = 0; i < 9; i++) S.rock([0.88 + (i % 3) * 0.16, 0.42 + 0.04 * (i % 2), -3.72 + Math.floor(i / 3) * 0.13], 0.08, { r: [18, 19, 20, 21] }, { res: 0.012 });
      for (let i = 0; i < 4; i++) S.box([0.35 + i * 0.09, 0.55, -3.95], [0.03, 0.55, 0.03], IRON, { res: 0.008, ax: B.frame(0, 0, 0.12) });
      // soot up the wall over the furnace, and ash on the floor in front of it
      S.bake();
      S.cover(SOOT, { up: 0.8, thick: 0.02, where: (x, y, z) => Math.abs(x - FX) < 1.3 + 0.2 * y && y > 2.2 && z < -3.0 && B.n3(x * 2, y * 2, z * 2) > 0.45 });
      S.cover({ r: [52, 53, 54] }, { up: 0.75, thick: 0.015, where: (x, y, z) => y < 0.1 && Math.hypot(x - FX, z - fz - 1.2) < 1.0 && B.n3(x * 4, y * 4, z * 4) > 0.5 });
    }
    S.bake();

    // ---- the air: a low haze, beams under the lanterns, a warm glow off the furnace. Before any hero, and held still, so every
    // layer draws the same air ----
    if (ATMOS) {
      const still = f => (...a) => f(...a.slice(0, -1), { em: true, nd: true });
      const stick = B.stick, axial = B.axial;
      B.stick = still(stick); B.axial = (...a) => axial(...a.slice(0, -1), { nd: true });
      K.mist(B, { rad: RI, y: 0.15, depth: 0.5, n: 120, cols: [68, 2], a: +(env.MIST || 0.05), size: [0.5, 1.1], drift: 0, where: (x, z) => Math.hypot(x, z) < RI - 0.3 });
      for (const [x, z] of LANTERNS) K.shafts(B, { from: [x * 0.9, 2.0, z * 0.9], dir: [0, -1, 0.1], len: 1.7, r: 0.35, n: 7, col: 69, a: 0.14 });
      K.shafts(B, { from: [FX, 0.6, fz + 0.95], dir: [0, 0.15, 1], len: 1.6, r: 0.55, n: 8, col: 69, a: 0.12 });
      B.stick = stick; B.axial = axial;
      for (let i = 0; i < 6; i++) K.glint(B, [AX - 0.15 + 0.3 * K.hash(i, 51), AT + 0.002, AZ - 0.2 + 0.4 * K.hash(i, 52)], [1, 0, 0], 0.05, 67);
    }
    } // the hall

    // =================== the forge heroes ===================
    const ease = x => x * x * (3 - 2 * x);
    const C = HEROES.palette(80), HB = HEROES(S, K, B, C), Mt = HB.M, flat = Mt.flat;
    // the colours a player can change on each hero (as in the mine): ramps no other part of that hero uses
    const SLOTS = {
      smith: { skin: C.deep, hair: C.hairBlack, a: C.red, b: C.leather }, sword: { skin: C.tan, hair: C.grey, a: C.denim, b: C.waist },
      axe: { skin: C.skin, hair: C.beard, a: C.shirt, b: C.tweed }, spear: { skin: C.brown, hair: C.hairBlack, a: C.mustard, b: C.red },
      shield: { skin: C.warm, hair: C.dark, a: C.black, b: C.waist }, hammer: { skin: C.deep, hair: C.grey, a: C.robe, b: C.leather },
      bow: { skin: C.tan, hair: C.hairBlack, a: C.shirt, b: C.leather }
    };
    const heroFirst = B.count();
    const BRASSM = Mt.metal(C.brass), IRONM = Mt.metal(C.iron), WOODM = Mt.wood(C.wood);
    const DLEATH = flat([78, 79, 8]); // dark leather that no slot uses (straps, gloves)
    const parts = {};
    let pose = null;

    // a smithing hammer in the hand at `grip`, its head landing at `head` (the head's centre; the face points down)
    function hammer(F, grip, head, o = {}) {
      const tag = o.tag || 'arm', big = o.big;
      const back = HB.lerp(head, grip, -0.12);
      HB.tube(F, [grip, back], 0.014, big ? 0.02 : 0.016, o.wood || WOODM, tag, 0.004);
      HB.box(F, head, big ? [0.06, 0.075, 0.05] : [0.034, 0.05, 0.034], IRONM, tag, 0.004, null, 0.006);
      HB.box(F, [head[0], head[1] - (big ? 0.07 : 0.046), head[2]], big ? [0.062, 0.008, 0.052] : [0.036, 0.006, 0.036], flat([C.iron[3]]), tag, 0.003); // the bright striking face
      if (big) for (const s of [-1, 1]) HB.box(F, [head[0], head[1] + s * 0.04, head[2]], [0.065, 0.008, 0.055], BRASSM, tag, 0.003); // brass bands
      return head;
    }
    // a leather apron: bib, skirt and a pocket, with brass rivets
    function apron(F, bd, m, o = {}) {
      HB.box(F, [0, bd.ch - 0.04, 0.095], [0.08, 0.13, 0.01], m, 'body', 0.004, null, 0.008);
      HB.box(F, [0, bd.hip - 0.12, 0.09], [0.1, 0.16, 0.012], m, 'body', 0.004, null, 0.01);
      HB.box(F, [0.045, bd.hip - 0.05, 0.104], [0.035, 0.035, 0.008], m, 'body', 0.003, null, 0.006);
      for (const s of [-1, 1]) { HB.ball(F, [s * 0.065, bd.ch + 0.08, 0.098], 0.007, BRASSM, 'body', 0.002); HB.tube(F, [[s * 0.065, bd.ch + 0.08, 0.098], [s * 0.06, bd.ch + 0.17, 0.0], [0, bd.ch + 0.18, -0.06]], 0.008, 0.008, o.strap || DLEATH, 'body', 0.003); }
    }
    // the swing: hammer raised over the shoulder at rest, down onto the anvil at 1.12, back up (the mine's pick timing)
    function swingPose(dir, arm = 'arm', body = 'body') {
      return (t, dt, pup) => {
        let lift, squash = 0, breathe = 0;
        if (t < 1) { breathe = Math.sin(t * Math.PI * 2); lift = 1 + 0.04 * breathe; }
        else if (t < 1.12) { const k = (t - 1) / 0.12; lift = 1 - k * k; if (k > 0.9) squash = 1; }
        else { const k = Math.min(1, (t - 1.12) / 0.38); lift = ease(k); squash = Math.max(0, 1 - k * 3); }
        pup.pose[arm] = { rot: [0, 0, dir * lift * 115] };
        pup.pose[body] = { rot: [0, 0, dir * (Math.max(0, lift) * 5 - squash * 4)], scale: [1 + 0.04 * squash, 1 - 0.05 * squash + 0.012 * breathe, 1 + 0.04 * squash] };
      };
    }
    // the station smiths' own work: an idle loop 0-2 (each their own rhythm at the anvil), the strike and recover of swingPose at
    // 2-2.5 (when a weapon of theirs comes to be finished), and a little moment of their own at 3-5 (the game plays it now and then):
    //   axe     light quick taps, turning the head between them; then she straightens and wipes her brow
    //   spear   two measured blows, then a look; then she turns to the spear beside her, tips it to sight along it, and nods
    //   shield  tap-tap riveting with a pause; then she raises her shield and knocks on it
    //   hammer  one huge slow blow from high overhead; then he leans back and stretches, the hammer up high
    function workPose(k, dir) {
      const swing = swingPose(dir), tap = (p, a) => a * (p < 0.72 ? ease(p / 0.72) : 1 - ((p - 0.72) / 0.28) ** 2);
      const hold = (k, a, b) => (k < a ? ease(k / a) : k < b ? 1 : 1 - ease(Math.min(1, (k - b) / (2 - b))));
      return (t, dt, pup) => {
        if (t >= 2 && t < 3) { swing(t - 1, dt, pup); pup.pose.off = { rot: [0, 0, 0] }; return; }
        let A = 0, O = 0, Oy = 0, Br = 0, By = 0;
        if (t < 2) {
          if (k === 'axe') { const p = (t % 0.4) / 0.4; A = 12 + tap(p, 32); Oy = 10 * Math.sin(t * Math.PI); Br = 2; }
          else if (k === 'spear') { if (t < 1.2) { const p = (t % 0.6) / 0.6; A = 15 + tap(p, 70); Br = 2 + 3 * (p > 0.72 ? 1 : 0); } else { const e = Math.sin(((t - 1.2) / 0.8) * Math.PI); A = 15 + 20 * e; By = 14 * e; } }
          else if (k === 'shield') { const p = t % 1, q = p < 0.5 ? (p % 0.25) / 0.25 : 0; A = 18 + (p < 0.5 ? tap(q, 26) : 6 * Math.sin((p - 0.5) * Math.PI * 2)); Oy = 6 * Math.sin(t * Math.PI); }
          else { const p = t / 2; A = p < 0.75 ? 10 + 135 * ease(p / 0.75) : 145 * (1 - ((p - 0.75) / 0.25) ** 2); Br = p < 0.75 ? 6 * ease(p / 0.75) : -4; }
        } else {
          const q = Math.min(2, t - 3), e = hold(q, 0.5, 1.4);
          if (k === 'axe') { A = 20 + 90 * e; O = 115 * e; Br = -8 * e; }
          else if (k === 'spear') { const l = q > 0.6 && q < 1.2 ? Math.sin(((q - 0.6) / 0.6) * Math.PI) : 0; O = -14 * e + 8 * l; A = 25 + 30 * e; Br = -4 * e; By = 24 * e - 8 * l; }
          else if (k === 'shield') { const kn = q > 0.6 && q < 1.4 ? Math.abs(Math.sin(((q - 0.6) / 0.4) * Math.PI)) : 0; O = 85 * e; A = 40 + 50 * e - 25 * kn; By = -12 * e; }
          else { A = 160 * e; O = 150 * e; Br = -12 * e; }
        }
        pup.pose.arm = { rot: [0, 0, dir * A] }; pup.pose.off = { rot: [0, Oy, dir * O] };
        pup.pose.body = { rot: [0, By, dir * Br], scale: [1, 1 + 0.01 * Math.sin(t * Math.PI * 2), 1] };
      };
    }
    // a little anvil on a block, for a station
    function smallAnvil(at) {
      S.lathe([at[0], 0, at[2]], 0.34, 0.16, WOOD, { res: 0.014 });
      S.box([at[0], 0.42, at[2]], [0.07, 0.08, 0.1], IRON, { res: 0.01 });
      S.box([at[0], 0.55, at[2]], [0.12, 0.05, 0.19], IRON, { res: 0.01, rd: 0.01 });
      S.tube([[at[0], 0.56, at[2] + 0.19], [at[0], 0.54, at[2] + 0.32]], 0.045, 0.008, IRON, { res: 0.008 });
    }

    // ---- the weapons: each kind as a little model, lying on an anvil or hanging upright from a peg ----
    function weapon(kind, at, o = {}) {
      const tag = o.tag, hot = o.hot, m = o.mat || STEEL, blade = hot ? HOT : m;
      const [x, y, z] = at;
      if (o.lay) {
        if (kind === 'sword') { S.box([x, y, z], [0.035, 0.012, 0.22], blade, { tag, res: 0.006 }); S.tube([[x, y, z + 0.22], [x, y, z + 0.27]], 0.035, 0.004, blade, { tag, res: 0.005 }); S.box([x, y, z - 0.25], [0.07, 0.015, 0.02], hot ? HOT : BRASS, { tag, res: 0.006 }); }
        else if (kind === 'axe') { S.box([x, y, z], [0.12, 0.014, 0.06], blade, { tag, res: 0.006 }); }
        else if (kind === 'spear') { S.box([x, y, z], [0.035, 0.012, 0.12], blade, { tag, res: 0.006 }); }
        else if (kind === 'shield') { S.lathe([x, y - 0.01, z], 0.025, 0.17, blade, { tag, res: 0.006 }); }
        else if (kind === 'hammer') { S.box([x, y + 0.03, z], [0.07, 0.06, 0.1], blade, { tag, res: 0.006 }); }
        return;
      }
      if (kind === 'sword') {
        S.box([x, y - 0.12, z], [0.03, 0.08, 0.02], LEATHER, { tag, res: 0.006 }); // wrapped grip
        S.ball([x, y - 0.03, z], 0.03, BRASS, { tag, res: 0.006 }); // pommel
        S.box([x, y - 0.22, z], [0.09, 0.02, 0.025], BRASS, { tag, res: 0.006 }); // guard
        S.box([x, y - 0.6, z], [0.038, 0.37, 0.01], m, { tag, res: 0.006 }); // blade
        S.box([x, y - 0.55, z + 0.011], [0.006, 0.3, 0.002], { r: [74] }, { tag, res: 0.004 }); // its fuller
      } else if (kind === 'axe') {
        S.box([x, y - 0.4, z], [0.022, 0.4, 0.022], WOOD, { tag, res: 0.006 });
        S.extrude([[[0, -0.09], [0.15, -0.14], [0.17, 0], [0.15, 0.14], [0, 0.09]]], [x + 0.02, y - 0.14, z - 0.012], 0.024, m, { tag, res: 0.006, ax: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] });
      } else if (kind === 'spear') {
        S.box([x, y - 0.35, z], [0.018, 0.75, 0.018], WOOD, { tag, res: 0.006 });
        S.lathe([x, y + 0.38, z], 0.04, 0.025, BRASS, { tag, res: 0.005 });
        S.tube([[x, y + 0.42, z], [x, y + 0.64, z]], 0.045, 0.004, m, { tag, res: 0.006 });
      } else if (kind === 'shield') {
        S.lathe([x, y - 0.45, z - 0.03], 0.03, 0.215, m, { tag, res: 0.006, ax: [[1, 0, 0], [0, 0, 1], [0, 1, 0]] }); // the steel rim
        S.lathe([x, y - 0.45, z - 0.005], 0.035, 0.19, WOOD, { tag, res: 0.006, ax: [[1, 0, 0], [0, 0, 1], [0, 1, 0]] });
        S.ball([x, y - 0.45, z + 0.03], 0.05, BRASS, { tag, res: 0.006 });
      } else if (kind === 'hammer') {
        S.box([x, y - 0.4, z], [0.022, 0.4, 0.022], WOOD, { tag, res: 0.006 });
        S.box([x, y - 0.06, z], [0.12, 0.07, 0.06], m, { tag, res: 0.006 });
        for (const s of [-1, 1]) S.box([x + s * 0.08, y - 0.06, z], [0.008, 0.075, 0.065], BRASS, { tag, res: 0.004 });
      }
    }

    // ---- you, the Blacksmith: a broad-shouldered smith with a shaved head and a thick black beard, red shirt with the sleeves
    // rolled to the elbow, a heavy leather apron, gloves; tongs in the off hand hold the glowing blade on the anvil ----
    if (on('smith')) {
      const F = HB.rig(AX - 0.62, AZ - 0.05, [1, 0]), SK = Mt.skin(C.deep), shirt = Mt.cloth(C.red, 0.2);
      const bd = HB.body(F, { shirt, trous: Mt.cloth(C.black, 0.2), boot: Mt.leather(C.boot), skin: SK, belt: DLEATH, buckle: IRONM });
      const hd = HB.head(F, bd.head, { skin: SK, beard: 'goatee', tash: 'handlebar', beardRamp: C.hairBlack, brow: C.hairBlack, nose: 'round' });
      apron(F, bd, Mt.leather(C.leather));
      HB.tube(F, [[0.0, bd.ch + 0.04, bd.lean + 0.11], [0, bd.ch - 0.2, bd.lean + 0.12]], 0.004, 0.004, flat([C.brass[2]]), 'body', 0.002); // a brass chain of rivets on the bib
      weapon('sword', [AX, AT + 0.012, AZ + 0.05], { lay: true, hot: true, tag: 'body' });
      // tongs in the off hand, gripping the blade's tang
      const SL = bd.sh(-1), hL = [-0.13, 0.82, 0.38];
      HB.arm(F, SL, HB.elbow(SL, hL, [-0.05, -0.08, -0.02]), hL, { tag: 'body', sleeve: shirt, rolled: true, cuff: flat(C.red.slice(1, 3)), skin: SK, glove: Mt.leather(C.leather) });
      HB.tube(F, [hL, [-0.08, 0.8, 0.52], [-0.02, AT + 0.02, 0.58]], 0.008, 0.006, IRONM, 'body', 0.003);
      HB.tube(F, [hL, [-0.1, 0.79, 0.52], [-0.03, AT + 0.01, 0.6]], 0.008, 0.006, IRONM, 'body', 0.003);
      // the hammer arm, built in the strike pose
      const SR = bd.sh(1), hR = [0.06, 0.86, 0.3];
      HB.arm(F, SR, HB.elbow(SR, hR, [0.06, -0.08, -0.04]), hR, { tag: 'arm', sleeve: shirt, rolled: true, cuff: flat(C.red.slice(1, 3)), skin: SK, glove: Mt.leather(C.leather) });
      hammer(F, hR, [0.02, AT + 0.06, 0.62]);
      parts.body = { pivot: F.P(0, 0.2, 0), slices: 4 }; parts.arm = { pivot: F.P(...SR), parent: 'body', slices: 2 };
      pose = swingPose(1);
    }

    // ---- the Swordsmith: a careful old master who studies swords rather than hammering them. Long grey hair tied back, a long
    // drooping moustache, spectacles, a blue frock coat over a burgundy waistcoat. He hones a blade at his table with a whetstone,
    // and now and then straightens up to read his book. clip: idle 0-2 (two long strokes), study 2-4 ----
    const sw = ST.sword, swF = HB.rig(sw.x, sw.z, [sw.dir, 0]), swT = swF.P(0, 0, 0.55), swTop = 0.66;
    if (on('st-sword')) {
      const [tx, , tz] = swT;
      S.box([tx, swTop - 0.03, tz], [0.24, 0.03, 0.42], WOOD, { res: 0.012 });
      for (const dx of [-0.19, 0.19]) for (const dz of [-0.36, 0.36]) S.box([tx + dx, (swTop - 0.06) / 2, tz + dz], [0.025, (swTop - 0.06) / 2, 0.025], WOOD, { res: 0.01 });
      weapon('sword', [tx - 0.04, swTop + 0.012, tz + 0.08], { lay: true });
      S.box([tx + 0.02, swTop + 0.012, tz - 0.3], [0.1, 0.012, 0.075], { r: [49, 50, 51] }, { res: 0.006 }); // an open book
      S.box([tx + 0.02, swTop + 0.006, tz - 0.3], [0.11, 0.008, 0.085], { r: [39, 40] }, { res: 0.006 });
      S.lathe([tx + 0.12, swTop, tz - 0.12], 0.08, 0.025, { r: [49, 50, 51] }, { res: 0.005 }); // a candle
      S.ball([tx + 0.12, swTop + 0.1, tz - 0.12], [0.012, 0.022, 0.012], FIRE, { res: 0.004 });
      for (const dz of [-0.05, 0.12]) { const x = sw.x - 0.32, z = sw.z + dz; // finished blades leaning on the wall behind him
        S.box([x, 0.42, z], [0.012, 0.36, 0.022], STEEL, { res: 0.006 }); S.box([x, 0.8, z], [0.02, 0.02, 0.08], BRASS, { res: 0.006 }); S.box([x, 0.9, z], [0.02, 0.08, 0.03], LEATHER, { res: 0.006 }); }
    }
    if (on('sword')) {
      const F = swF, SK = Mt.skin(C.tan), coat = Mt.cloth(C.denim, 0.18);
      const bd = HB.body(F, { shirt: coat, trous: Mt.cloth(C.black, 0.2), boot: Mt.leather(C.boot), skin: SK, belt: DLEATH, buckle: BRASSM });
      const hd = HB.head(F, bd.head, { skin: SK, beard: 'none', tash: 'droop', beardRamp: C.grey, brow: C.grey.slice(1), eyes: 'glasses', nose: 'long', hair: 'long', hairRamp: C.grey });
      HB.tube(F, [[0, hd.top[1] - 0.06, bd.head[2] - 0.1], [0, hd.top[1] - 0.2, bd.head[2] - 0.15], [0, hd.top[1] - 0.34, bd.head[2] - 0.14]], 0.03, 0.012, Mt.fur(C.grey), 'body', 0.004); // the tail of hair
      HB.box(F, [0, bd.ch - 0.04, 0.088], [0.06, 0.12, 0.012], Mt.cloth(C.waist, 0.12), 'body', 0.004, null, 0.01); // the waistcoat
      for (const y of [0.02, -0.05, -0.12]) HB.ball(F, [0, bd.ch + y, 0.102], 0.007, BRASSM, 'body', 0.002);
      for (const s of [-1, 1]) HB.box(F, [s * 0.075, bd.hip - 0.12, 0.0], [0.035, 0.19, 0.09], coat, 'body', 0.005, null, 0.01); // the long coat skirts
      HB.box(F, [0, bd.hip - 0.12, -0.08], [0.1, 0.19, 0.015], coat, 'body', 0.005, null, 0.01);
      const SL = bd.sh(-1), hL = [-0.12, swTop + 0.03, 0.42]; // a hand steadying the blade
      HB.arm(F, SL, HB.elbow(SL, hL, [-0.05, -0.05, -0.04]), hL, { tag: 'body', sleeve: coat, cuff: flat(C.grey.slice(2)), skin: SK, grip: false });
      const SR = bd.sh(1), hR = [0.02, swTop + 0.05, 0.45];
      HB.arm(F, SR, HB.elbow(SR, hR, [0.06, -0.06, -0.05]), hR, { tag: 'arm', sleeve: coat, cuff: flat(C.grey.slice(2)), skin: SK, grip: false });
      HB.box(F, [0.02, swTop + 0.03, 0.45], [0.025, 0.015, 0.055], flat([52, 53, 54]), 'arm', 0.003); // the whetstone
      parts.body = { pivot: F.P(0, 0.2, 0), slices: 3 }; parts.arm = { pivot: F.P(...SR), parent: 'body', slices: 2 };
      pose = (t, dt, pup) => {
        if (t < 2) { const a = Math.sin(t * Math.PI * 2); pup.pose.arm = { rot: [0, 22 * a, 0] }; pup.pose.body = { rot: [0, 4 * a, -6] }; }
        else { const k = t - 2, e = k < 0.5 ? ease(k / 0.5) : k < 1.5 ? 1 : 1 - ease((k - 1.5) / 0.5);
          pup.pose.arm = { rot: [0, -10 * e, 0] }; pup.pose.body = { rot: [0, 28 * e + 2 * Math.sin(k * 6) * (k > 0.5 && k < 1.5 ? 1 : 0), -6 * (1 - e)] }; }
      };
    }

    // ---- the four station smiths, each with his own anvil, bench and look ----
    // a plaited braid from behind one ear (s = -1 | 1) over the shoulder and down the chest, tied off with a band
    const braid = (F, hd, s, ramp, band) => { const p = [hd.at(s * 0.1, -0.02, -0.03), hd.at(s * 0.12, -0.14, 0.0), hd.at(s * 0.11, -0.27, 0.06), hd.at(s * 0.09, -0.4, 0.09)];
      for (let i = 0; i < 7; i++) { const t = i / 6, q = p[Math.min(2, Math.floor(t * 3))], r = p[Math.min(3, Math.floor(t * 3) + 1)], k = t * 3 - Math.floor(t * 3);
        HB.ball(F, HB.lerp(q, r, Math.min(1, k)).map((v, j) => v + (j === 0 ? 0.008 * (i % 2 ? 1 : -1) : 0)), [0.028 - 0.002 * i, 0.03, 0.028 - 0.002 * i], Mt.fur(ramp, { len: 0.012 }), 'body', 0.004); }
      HB.lathe(F, [p[3][0], p[3][1] - 0.035, p[3][2]], 0.015, 0.02, band, 'body', 0.003); };
    const LOOKS = {
      // a freckled woodswoman of a smith: two long ginger braids, green shirt, tweed cap and trousers, a hatchet in her belt
      axe: { skin: C.skin, head: { fem: true, beard: 'none', tash: 'none', nose: 'round', hair: 'long', hairRamp: C.beard, brow: C.beard.slice(1, 4) }, shirt: C.shirt, trous: C.tweed,
        hat: (F, hd) => { HB.hats.cap(F, hd.top, 'body'); for (const s of [-1, 1]) braid(F, hd, s, C.beard, flat([78, 79])); },
        extra: (F, bd) => { HB.tube(F, [[-0.1, bd.hip + 0.05, 0.05], [-0.12, bd.hip - 0.2, 0.08]], 0.008, 0.008, WOODM, 'body', 0.003); HB.box(F, [-0.13, bd.hip + 0.04, 0.09], [0.008, 0.025, 0.035], IRONM, 'body', 0.003); } },
      // a young spear-maker: black hair in a high topknot with a long tail, a mustard tunic with a red sash and headband
      spear: { skin: C.brown, head: { fem: true, beard: 'none', tash: 'none', beardRamp: C.hairBlack, brow: C.hairBlack, nose: 'round', hair: 'long', hairRamp: C.hairBlack }, shirt: C.mustard, trous: C.black,
        hat: (F, hd) => { HB.lathe(F, [hd.top[0], hd.top[1] - 0.06, hd.top[2]], 0.03, 0.125, Mt.cloth(C.red, 0.2), 'body', 0.004); HB.ball(F, [hd.top[0], hd.top[1] + 0.02, hd.top[2] - 0.04], [0.045, 0.05, 0.045], Mt.fur(C.hairBlack), 'body', 0.004);
          HB.tube(F, [[hd.top[0], hd.top[1] + 0.04, hd.top[2] - 0.07], [hd.top[0], hd.top[1] - 0.08, hd.top[2] - 0.16], [hd.top[0], hd.top[1] - 0.3, hd.top[2] - 0.15]], 0.035, 0.012, Mt.fur(C.hairBlack, { len: 0.02 }), 'body', 0.004); },
        extra: (F, bd) => { HB.lathe(F, [0, bd.hip + 0.02, 0], 0.06, 0.104, Mt.cloth(C.red, 0.2), 'body', 0.004); HB.tube(F, [[0.08, bd.hip, 0.06], [0.1, bd.hip - 0.18, 0.07]], 0.02, 0.008, Mt.cloth(C.red, 0.2), 'body', 0.004); } },
      // a shield-maiden of a smith: a thick dark braid from under an iron half-helm, a padded black gambeson and a burgundy tabard
      shield: { skin: C.warm, head: { fem: true, beard: 'none', tash: 'none', beardRamp: C.dark, brow: C.dark, nose: 'long', hair: 'long', hairRamp: C.dark }, shirt: C.black, trous: C.black,
        hat: (F, hd) => { const [x, y, z] = hd.top; HB.lathe(F, [x, y - 0.06, z], 0.1, t => 0.13 * Math.sqrt(Math.max(0, 1 - t * t)), IRONM, 'body', 0.005); HB.lathe(F, [x, y - 0.065, z], 0.015, 0.135, flat([C.iron[1]]), 'body', 0.004); HB.box(F, [x, y - 0.1, z + 0.125], [0.012, 0.05, 0.01], IRONM, 'body', 0.003); for (const s of [-1, 1]) braid(F, hd, s, C.dark, IRONM); },
        extra: (F, bd) => { HB.box(F, [0, bd.ch - 0.12, 0.09], [0.075, 0.24, 0.008], Mt.cloth(C.waist, 0.15), 'body', 0.004, null, 0.01); HB.box(F, [0, bd.ch - 0.12, -0.085], [0.075, 0.24, 0.008], Mt.cloth(C.waist, 0.15), 'body', 0.004, null, 0.01); for (let i = 0; i < 4; i++) HB.lathe(F, [0, bd.hip + 0.05 + i * 0.06, 0], 0.006, 0.1, flat([C.black[0]]), 'body', 0.002); } },
      // an old giant of a hammer-smith in a hooded purple cloak, grey beard to his belt, leather bracers and a huge warhammer
      hammer: { skin: C.deep, head: { beard: 'long', beardRamp: C.grey, brow: C.grey.slice(1), eyes: 'squint', nose: 'round' }, shirt: C.robe, trous: C.black, big: true,
        hat: (F, hd, bd) => { const [x, y, z] = hd.at(0, 0, 0), cl = Mt.cloth(C.robe, 0.2); // a hood back off the face, and a cloak down his back
          HB.ball(F, [x, y + 0.02, z - 0.055], [0.142, 0.15, 0.13], cl, 'body', 0.005);
          HB.tube(F, [[x, y + 0.1, z - 0.12], [x, y + 0.02, z - 0.2], [x, y - 0.1, z - 0.19]], 0.05, 0.015, cl, 'body', 0.004);
          HB.box(F, [0, bd.ch - 0.12, -0.1], [0.13, 0.3, 0.015], cl, 'body', 0.005, null, 0.015);
          for (const s of [-1, 1]) HB.box(F, [s * 0.12, bd.ch + 0.02, -0.04], [0.035, 0.08, 0.07], cl, 'body', 0.005, null, 0.015); },
        extra: (F, bd) => { HB.box(F, [0, bd.hip - 0.12, 0.09], [0.1, 0.16, 0.012], Mt.leather(C.leather), 'body', 0.004, null, 0.01); } }
    };
    for (const [k, st] of Object.entries(ST)) {
      if (k === 'sword' || k === 'bow') continue;
      const F = HB.rig(st.x, st.z, [st.dir, 0]), anv = F.P(0, 0, 0.55), top = 0.6;
      if (on('st-' + k)) {
        smallAnvil(anv);
        weapon(k, [anv[0], top + 0.012, anv[2]], { lay: true, mat: IRON });
        const bench = [st.x + st.dir * 0.35, 0, st.z - 0.62];
        S.box([bench[0], 0.42, bench[2]], [0.28, 0.035, 0.2], WOOD, { res: 0.012 });
        for (const dx of [-0.22, 0.22]) S.box([bench[0] + dx, 0.2, bench[2]], [0.03, 0.2, 0.15], WOOD, { res: 0.01 });
        weapon(k, [bench[0] - 0.12, 0.48, bench[2]], { lay: true }); // a finished one on the bench
        S.lathe([bench[0] + 0.15, 0.455, bench[2] + 0.05], 0.12, 0.055, WOOD, { res: 0.008 }); // a bucket of rivets
        for (let i = 0; i < 5; i++) S.ball([bench[0] + 0.13 + 0.04 * K.hash(i, 81), 0.58, bench[2] + 0.03 + 0.04 * K.hash(i, 82)], 0.012, IRON, { res: 0.004 });
      }
      if (on(k)) {
        const L = LOOKS[k], SK = Mt.skin(L.skin), shirt = Mt.cloth(L.shirt, 0.2);
        const bd = HB.body(F, { shirt, trous: Mt.cloth(L.trous, 0.25), boot: Mt.leather(C.boot), skin: SK, belt: DLEATH, buckle: IRONM });
        const hd = HB.head(F, bd.head, { skin: SK, ...L.head });
        L.hat(F, hd, bd); if (L.extra) L.extra(F, bd);
        if (k !== 'hammer') apron(F, bd, flat([78, 79, 8, 9]));
        const SL = bd.sh(-1), hL = [-0.16, 0.7, 0.18];
        HB.arm(F, SL, HB.elbow(SL, hL, [-0.04, -0.06, 0]), hL, { tag: 'off', sleeve: shirt, rolled: k !== 'shield' && k !== 'hammer', cuff: shirt, skin: SK, glove: k === 'hammer' ? Mt.leather(C.leather) : null });
        const SR = bd.sh(1), hR = [0.05, 0.78, 0.3];
        HB.arm(F, SR, HB.elbow(SR, hR, [0.06, -0.06, -0.04]), hR, { tag: 'arm', sleeve: shirt, rolled: k !== 'shield' && k !== 'hammer', cuff: shirt, skin: SK, glove: k === 'hammer' ? Mt.leather(C.leather) : null });
        hammer(F, hR, [0.0, top + (L.big ? 0.09 : 0.065), 0.55], { big: L.big });
        // what the off hand holds: the Spearwright a finished spear planted beside her, the Shieldwright a shield on her forearm
        if (k === 'spear') { HB.tube(F, [[hL[0], 0.03, hL[2] - 0.02], [hL[0], 1.62, hL[2] + 0.02]], 0.014, 0.012, WOODM, 'off', 0.004);
          HB.lathe(F, [hL[0], 1.6, hL[2] + 0.02], 0.05, 0.02, BRASSM, 'off', 0.003);
          HB.tube(F, [[hL[0], 1.64, hL[2] + 0.02], [hL[0], 1.8, hL[2] + 0.025]], 0.032, 0.003, IRONM, 'off', 0.003);
          HB.tube(F, [[hL[0], 1.58, hL[2] + 0.02], [hL[0] - 0.02, 1.5, hL[2] + 0.1], [hL[0] - 0.01, 1.44, hL[2] + 0.12]], 0.02, 0.006, Mt.cloth(C.red, 0.2), 'off', 0.003); }
        if (k === 'shield') { const c = F.P(hL[0] - 0.05, hL[1] + 0.06, hL[2] - 0.02);
          S.lathe(c, 0.03, 0.2, { r: Mt.metal(C.iron).r }, { tag: 'off', res: 0.005, ax: [F.fwd, F.side.map(v => -v), [0, 1, 0]] });
          S.lathe(F.P(hL[0] - 0.03, hL[1] + 0.06, hL[2] - 0.02), 0.02, 0.17, Mt.cloth(C.waist, 0.15), { tag: 'off', res: 0.005, ax: [F.fwd, F.side.map(v => -v), [0, 1, 0]] });
          S.lathe(F.P(hL[0] - 0.015, hL[1] + 0.06, hL[2] - 0.02), 0.02, 0.06, { r: Mt.metal(C.brass).r }, { tag: 'off', res: 0.004, ax: [F.fwd, F.side.map(v => -v), [0, 1, 0]] }); }
        parts.body = { pivot: F.P(0, 0.2, 0), slices: 4 }; parts.arm = { pivot: F.P(...SR), parent: 'body', slices: 2 }; parts.off = { pivot: F.P(...SL), parent: 'body', slices: 2 };
        pose = workPose(k, st.dir);
      }
    }


    // ---- the Bowyer: a lean young woodsman in a moss-green hood and tunic, a leather jerkin and bracer, a quiver on his back.
    // He works an upright yew stave with a rasp, and now and then turns to sight down it. clip: idle 0-2 (four strokes), study 2-4.
    // Behind him a bench with staves, a pot of arrows and a finished bow leaning on it ----
    const bw = ST.bow, bwF = HB.rig(bw.x, bw.z, [bw.dir, 0]), stave = bwF.P(-0.02, 0, 0.3);
    if (on('st-bow')) {
      const bench = [bw.x + 0.25, 0, bw.z - 0.7];
      S.box([bench[0], 0.5, bench[2]], [0.42, 0.03, 0.16], WOOD, { res: 0.012 });
      for (const dx of [-0.36, 0.36]) for (const dz of [-0.12, 0.12]) S.box([bench[0] + dx, 0.24, bench[2] + dz], [0.025, 0.24, 0.025], WOOD, { res: 0.01 });
      for (let i = 0; i < 3; i++) S.tube([[bench[0] - 0.36, 0.545 + i * 0.012, bench[2] - 0.08 + i * 0.06], [bench[0] + 0.38, 0.545 + i * 0.012, bench[2] - 0.06 + i * 0.06]], 0.016, 0.012, WOOD, { res: 0.006 }); // rough staves
      S.lathe([bench[0] + 0.56, 0, bench[2] + 0.05], 0.3, t => 0.09 - 0.02 * t, { r: [18, 19, 20] }, { res: 0.008 }); // a clay pot of arrows
      for (let i = 0; i < 7; i++) { const a = i * 0.9, x = bench[0] + 0.56 + 0.04 * Math.cos(a), z = bench[2] + 0.05 + 0.04 * Math.sin(a), lx = 0.05 * Math.cos(a), lz = 0.05 * Math.sin(a);
        S.tube([[x, 0.2, z], [x + lx, 0.75, z + lz]], 0.006, 0.006, WOOD, { res: 0.004 });
        S.box([x + lx, 0.72, z + lz], [0.006, 0.04, 0.018], { r: [40, 41] }, { res: 0.004 }); }
      WM.draw(S, B, 'bow', { base: WBASE, at: [bench[0] + 0.5, 0.62, bench[2] + 0.2], s: 1.0, roll: -0.12, resK: +(env.WRES || 3), lite: true }); // a finished bow leaning on the bench
    }
    if (on('bow')) {
      const F = bwF, SK = Mt.skin(C.tan), tunic = Mt.cloth(C.shirt, 0.2), jerk = Mt.leather(C.leather);
      const bd = HB.body(F, { shirt: tunic, trous: Mt.cloth(C.trous, 0.25), boot: Mt.leather(C.boot), skin: SK, belt: jerk, buckle: BRASSM });
      const hd = HB.head(F, bd.head, { skin: SK, beard: 'goatee', tash: 'droop', beardRamp: C.hairBlack, brow: C.hairBlack, nose: 'long', hair: 'tuft', hairRamp: C.hairBlack });
      { const [x, y, z] = hd.at(0, 0, 0); // the hood, up, its point falling behind, and a short cape over the shoulders
        HB.ball(F, [x, y + 0.03, z - 0.06], [0.148, 0.16, 0.15], tunic, 'body', 0.005);
        HB.tube(F, [[x, y + 0.12, z - 0.1], [x, y + 0.06, z - 0.2], [x, y - 0.08, z - 0.24]], 0.05, 0.012, tunic, 'body', 0.004);
        HB.ball(F, [0, bd.ch + 0.06, bd.lean - 0.01], [0.16, 0.07, 0.12], tunic, 'body', 0.005); }
      HB.box(F, [0, bd.ch - 0.06, 0.0], [0.11, 0.15, 0.088], jerk, 'body', 0.005, null, 0.02); // the jerkin
      for (const y of [0.0, -0.07, -0.14]) HB.tube(F, [[-0.03, bd.ch + y, 0.09], [0.03, bd.ch + y + 0.015, 0.09]], 0.005, 0.005, flat([C.rope[1], C.rope[2]]), 'body', 0.002); // its lacing
      HB.box(F, [0, bd.hip - 0.1, 0.0], [0.105, 0.12, 0.08], tunic, 'body', 0.005, null, 0.02); // the tunic skirt
      // the quiver across his back, fletchings over the shoulder
      HB.tube(F, [[0.08, bd.hip - 0.05, -0.12], [-0.08, bd.ch + 0.12, -0.13]], 0.045, 0.05, jerk, 'body', 0.004);
      for (let i = 0; i < 4; i++) HB.box(F, [-0.09 + i * 0.022, bd.ch + 0.2, -0.13 + 0.012 * (i % 2)], [0.006, 0.04, 0.016], flat([C.red[1], C.red[2], C.red[3]]), 'body', 0.003);
      HB.tube(F, [[-0.12, bd.ch + 0.05, 0.06], [0.1, bd.hip, 0.07]], 0.008, 0.008, DLEATH, 'body', 0.003); // its strap
      // the left hand holds the stave upright, its foot on the floor; the right works it with a rasp
      const SL = bd.sh(-1), hL = [-0.02, 1.05, 0.3];
      HB.arm(F, SL, HB.elbow(SL, hL, [-0.08, -0.06, -0.04]), hL, { tag: 'body', sleeve: tunic, cuff: jerk, skin: SK });
      HB.tube(F, [[-0.02, 0.02, 0.3], [-0.02, 0.6, 0.31], [-0.02, 1.2, 0.3], [-0.02, 1.62, 0.27]], 0.013, 0.008, flat([C.wood[1], C.wood[2], C.wood[3], C.wood[4]]), 'body', 0.003);
      const SR = bd.sh(1), hR = [0.02, 0.8, 0.33];
      HB.arm(F, SR, HB.elbow(SR, hR, [0.07, -0.06, -0.05]), hR, { tag: 'arm', sleeve: tunic, cuff: jerk, skin: SK });
      HB.box(F, [0.0, 0.8, 0.33], [0.014, 0.06, 0.01], IRONM, 'arm', 0.003); // the rasp
      parts.body = { pivot: F.P(0, 0.2, 0), slices: 3 }; parts.arm = { pivot: F.P(...SR), parent: 'body', slices: 2 };
      pose = (t, dt, pup) => {
        if (t < 2) { const a = Math.sin(t * Math.PI * 4); pup.pose.arm = { rot: [0, 0, bw.dir * 14 * a] }; pup.pose.body = { rot: [0, 0, bw.dir * (2 + a)] }; }
        else { const k = t - 2, e = k < 0.5 ? ease(k / 0.5) : k < 1.5 ? 1 : 1 - ease((k - 1.5) / 0.5);
          pup.pose.arm = { rot: [0, 0, -bw.dir * 25 * e] }; pup.pose.body = { rot: [0, -22 * e, bw.dir * (2 - 6 * e)] }; }
      };
    }

    // ---- a finished weapon in its rack column ----
    // each hangs from its peg: the sword hilt up, the others head up, the shield flat to the board; sized as the old rack shapes
    const RACKW = { sword: [0.83, 1.64, Math.PI], axe: [0.85, 1.77, 0], spear: [1.2, 1.64, 0], shield: [0.5, 1.63, 0], hammer: [0.94, 1.7, 0] };
    // the bow hangs on its own peg on the wall right of the rack
    if (layer === 'w-bow') { const bx = RX + 1.2, bz = wallZ(bx) + 0.2;
      S.box([bx + 0.12, 1.95, bz - 0.06], [0.03, 0.03, 0.08], IRON, { res: 0.008 });
      WM.draw(S, B, 'bow', { base: WBASE, at: [bx, 1.55, bz], s: 0.85, roll: 0, resK: +(env.WRES || 3), lite: true }); }
    if (layer.startsWith('w-') && RACKW[layer.slice(2)]) { const k = layer.slice(2), [ws, wy, wr] = RACKW[k];
      WM.draw(S, B, k, { base: WBASE, at: [RX + COLS[k], wy, RZ + 0.12], s: ws, roll: wr, resK: +(env.WRES || 3) }); }

    // ---- the furnace flames ----
    if (on('fire')) {
      const FL = [];
      for (let i = 0; i < 7; i++) {
        const x = FX - 0.36 + i * 0.12, h = 0.24 + 0.12 * Math.sin(i * 1.9 + 1);
        S.tube([[x, 0.4, fz + 0.42], [x, 0.4 + h * 0.5, fz + 0.43], [x, 0.4 + h, fz + 0.42]], 0.075, 0.006, FIRE, { tag: 'f' + i, res: 0.01 });
        S.tube([[x, 0.4, fz + 0.45], [x, 0.4 + h * 0.6, fz + 0.45]], 0.04, 0.004, { r: [12, 13], em: true }, { tag: 'f' + i, res: 0.008 });
        parts['f' + i] = { pivot: [x, 0.4, fz + 0.42], slices: 2 };
        FL.push(i);
      }
      pose = (t, dt, pup) => FL.forEach(i => { const a = i * 1.7, k = 1 + 0.25 * Math.sin(Math.PI * 2 * 2 * t + a) + 0.1 * Math.sin(Math.PI * 2 * 5 * t + a * 2);
        pup.pose['f' + i] = { scale: [1 - 0.3 * (k - 1), k, 1 - 0.3 * (k - 1)], rot: [0, 0, 8 * Math.sin(Math.PI * 2 * t + a)] }; });
    }
    S.bake();

    const W = B.finish({ cam: { target: [0, 2.2, -0.4], dist: 16.5, pitch: 0.3, yaw: 0 }, detail: +(env.DETAIL || 26), dither: +(env.DITHER || 0.25), ao: { k: +(env.AO || 0.55), range: 0.7 }, radius: 7 });
    if (SLOTS[layer]) { W.ohSlots = {}; for (const [k, ids] of Object.entries(SLOTS[layer])) W.ohSlots[k] = ids.map(i => PAL[i]); W.ohFirst = heroFirst; }
    if (pose && !all) {
      const P2 = {};
      for (const [k, v] of Object.entries(parts)) P2[k] = { ...v, ids: tags[k] };
      K.puppet(W, { parts: P2, pose });
    }
    return W;
  }
  return { id: 'oh-forge', name: 'Ore Heroes forge', seed: 11, build };
};
