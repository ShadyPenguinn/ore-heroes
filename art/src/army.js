// Ore Heroes: the army's camp, in the same ink style, lights and camera as the mine and the forge.
// A rock chamber off the mine: a campfire, bedrolls and a banner, and a dark passage at the back that leads deeper into the cave
// (where Explore will go). Heroes stand in a line in front of the fire.
// OH_LAYER picks what is drawn (none = the empty camp, the background):
//   hero-none|hero-sword|hero-axe|hero-spear|hero-shield|hero-hammer   a hero facing you, dressed for that weapon (clip: idle 0-1)
//     drawn at one spot (HX, HZ); the game draws the same frames shifted sideways for each place in the line
//   fire          the campfire flames (clip: a 0-1 loop)
module.exports = ({ makeBuilder, makeSculpt, KIT: K }) => {
  const PAL = [
    0x070605, 0x14100e, 0x211a16, 0x30261f, 0x42352b, 0x584738, 0x725d4a, // 0-6 stone (umber)
    0x2a1a10, 0x4a2e1a, 0x6e4628, 0x946238, // 7-10 timber, leather
    0xff9a30, 0xffd060, 0xfff2c0, // 11-13 fire light
    0x0c1820, 0x1a3040, 0x346078, 0x8ac0d8, // 14-17 cold blue
    0x5a2a14, 0x9a4a22, 0xd88038, 0xf0b070, // 18-21 copper
    0x1e3e32, 0x2e6450, 0x4a8a6c, // 22-24 green
    0x2a1e18, 0x4a3628, // 25-26 trousers, boots
    0xd8a07a, // 27 skin
    0x8a6020, 0xc89838, // 28-29 brass
    0x2a2e36, 0x5a606a, 0x9aa2b0, // 30-32 iron
    0x6a4428, 0x9a6634, 0xc8904a, // 33-35 firelit stone
    0x1e7a70, 0x5ae0c8, 0xc8fff4, // 36-38 (unused)
    0x5a1010, 0xa82a1c, 0xe04a30, // 39-41 red
    0x1e2e4a, 0x2e4a78, 0x4a6ea8, // 42-44 blue
    0x5a4210, 0x8a6a20, 0xc09a38, // 45-47 mustard
    0x24242a, 0x3c3c46, 0x60606e, 0xd8d0c0, // 48-51 grey, white
    0x7a4ad8, 0xb89aff, 0xf0e8ff, // 52-54 violet
    0x1a1430, 0x2e2450, 0x4a3a7a, // 55-57 robe
    0x8a96a8, 0xc8d2de, 0xf4f8ff, // 58-60 bright steel
    0x7a1810, 0xc8321e, 0xff7a20 // 61-63 hot
  ];
  function build(seed) {
    const env = (typeof process !== 'undefined' && process.env) || {};
    const layer = env.OH_LAYER || '';
    const B = makeBuilder(seed, PAL);
    const S = K.sculpt(makeSculpt(B));
    const tags = K.deform.tags(S);
    S.sun = B.norm([0.3, 0.5, 0.8]);
    S.res = 0.08;
    S.amb = 0.03;
    S.sky = 0.02;
    const ROCK = { r: [0, 0, 1, 2, 33, 34, 35] };
    const FLOOR = { r: [0, 1, 2, 33, 34, 35] };
    const WOOD = { r: [7, 8, 9, 10] };
    const IRON = { r: [0, 30, 31, 32] };
    const STEEL = { r: [31, 58, 59, 60] };
    const FIRE = { r: [11, 12, 13], em: true };
    const HOT = { r: [61, 62, 63, 12], em: true };
    const BRASS = { r: [28, 29] };
    const R = 5.2, RI = 4.6, H = 6.5;
    const CFX = -1.7, CFZ = 0.2; // the campfire
    const HX = 0.9, HZ = 1.0; // where the hero layer stands

    // ---- lights ----
    S.lights.push({ p: [CFX, 0.7, CFZ], r: 4.8, s: 2.6 }); // the campfire
    S.lights.push({ p: [HX + 0.4, 1.6, HZ + 1.0], r: 3.2, s: 0.9 }); // a little light on the line of heroes
    S.lights.push({ p: [2.9, 2.0, -1.4], r: 2.6, s: 1.1 }); // a lantern on the right

    // ---- floor and a rock dome, front half cut away, with a passage leading deeper at the back ----
    S.lathe([0, -0.5, 0], 0.5, R + 0.3, FLOOR, { res: 0.1 });
    S.bake();
    S.lathe([0, 0, 0], H, t => R * Math.sqrt(Math.max(0.02, 1 - Math.pow(t, 2.2))), ROCK, { res: 0.1 });
    S.lathe([0, -0.1, 0], H - 0.5, t => RI * Math.sqrt(Math.max(0.02, 1 - Math.pow(t, 2.2))), ROCK, { neg: true });
    S.box([0, H / 2, R], [R + 1, H / 2 + 1, R], ROCK, { neg: true });
    const arch = (w, h) => { const p = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); p.push([Math.cos(a) * w, h + Math.sin(a) * w]); } p.push([-w, 0], [w, 0]); return p; };
    const PX = 0.9; // the passage
    S.extrude([arch(1.0, 1.2)], [PX, 0, -RI], 3.0, ROCK, { neg: true });
    S.bake();
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI * 0.5 + Math.PI * (i / 15) + 0.08 * Math.sin(i * 3.1);
      if (Math.abs(a - 0.2) < 0.26) continue; // keep the passage clear
      const rr = RI - 0.15, sz = 0.35 + 0.25 * K.hash(i, 7);
      S.rock([Math.sin(a) * rr, sz * 0.45, -Math.cos(a) * rr], sz, ROCK, { res: 0.07 });
    }
    for (const [a, y, sz] of [[-1.0, 2.6, 0.5], [1.1, 3.0, 0.45], [-1.3, 1.5, 0.5]])
      S.rock([Math.sin(a) * (RI - 0.1), y, -Math.cos(a) * (RI - 0.1)], sz, ROCK, { res: 0.07 });
    S.bake();
    // a timber frame in the passage mouth, and a hanging lantern on the right
    for (const sd of [-1, 1]) S.box([PX + sd * 1.05, 1.1, -RI + 0.2], [0.1, 1.1, 0.1], WOOD, { res: 0.04 });
    S.tube([[PX - 1.2, 2.2, -RI + 0.2], [PX + 1.2, 2.2, -RI + 0.2]], 0.11, 0.11, WOOD, { res: 0.04 });
    S.box([PX + 1.45, 1.2, -RI + 0.45], [0.05, 0.5, 0.05], WOOD, { res: 0.02 }); // a signpost pointing in
    S.box([PX + 1.35, 1.6, -RI + 0.5], [0.3, 0.09, 0.03], WOOD, { res: 0.015 });
    const LX = 2.9, LZ = -1.4;
    S.box([LX, 1.1, LZ], [0.06, 1.1, 0.06], WOOD, { res: 0.03 });
    S.tube([[LX, 2.2, LZ], [LX - 0.35, 2.2, LZ]], 0.03, 0.03, IRON, { res: 0.01 });
    S.box([LX - 0.35, 1.95, LZ], [0.07, 0.13, 0.07], FIRE, { res: 0.012 });
    S.box([LX - 0.35, 2.1, LZ], [0.08, 0.02, 0.08], IRON, { res: 0.012 });

    // ---- the campfire: a ring of stones and crossed logs ----
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; S.rock([CFX + Math.cos(a) * 0.42, 0.08, CFZ + Math.sin(a) * 0.42], 0.13, { r: [1, 2, 3, 4] }, { res: 0.03 }); }
    for (const a of [0.4, -0.5, 1.6]) S.tube([[CFX - Math.cos(a) * 0.3, 0.08, CFZ - Math.sin(a) * 0.3], [CFX + Math.cos(a) * 0.3, 0.14, CFZ + Math.sin(a) * 0.3]], 0.05, 0.05, WOOD, { res: 0.015 });
    for (let i = 0; i < 5; i++) S.ball([CFX - 0.15 + i * 0.07, 0.1, CFZ + 0.05 * Math.sin(i * 2)], 0.06, HOT, { res: 0.012 });
    // a log to sit on, bedrolls by the right wall, a banner on a pole, a crate of supplies
    S.tube([[CFX - 0.7, 0.14, CFZ - 0.9], [CFX + 0.5, 0.14, CFZ - 1.1]], 0.14, 0.14, WOOD, { res: 0.03 });
    for (const [x, z, c] of [[2.6, 0.2, [42, 43]], [2.9, 1.0, [39, 40]]]) {
      S.box([x, 0.06, z], [0.32, 0.06, 0.55], { r: c }, { res: 0.03, rd: 0.04 });
      S.tube([[x - 0.3, 0.14, z - 0.48], [x + 0.3, 0.14, z - 0.48]], 0.1, 0.1, { r: [49, 50, 51] }, { res: 0.02 });
    }
    S.box([-3.0, 1.4, -1.4], [0.04, 1.4, 0.04], WOOD, { res: 0.02 });
    S.box([-2.75, 2.25, -1.4], [0.26, 0.5, 0.02], { r: [39, 40, 41] }, { res: 0.02 });
    S.ball([-2.75, 2.25, -1.37], 0.1, BRASS, { res: 0.01 });
    S.box([-3.3, 0.25, 0.6], [0.25, 0.25, 0.25], WOOD, { res: 0.03 });
    S.box([-3.25, 0.62, 0.55], [0.18, 0.12, 0.18], WOOD, { res: 0.03 });
    S.bake();

    // =================== layers ===================
    const parts = {};
    let pose = null;
    const SKIN = { r: [27] }, PANTS = { r: [0, 25] }, BOOT = { r: [0, 25, 26] };
    // facing the camera: P(side, up, forward), side +x, forward +z
    const P = (s, y, f) => [HX + s, y, HZ + f];
    const OUTFIT = {
      none:   { coat: { r: [7, 8, 9] }, hat: null },
      sword:  { coat: { r: [42, 43, 44] }, hat: 'helm', cape: { r: [39, 40] } },
      axe:    { coat: { r: [22, 23, 24] }, hat: 'band', wide: 0.14 },
      spear:  { coat: { r: [45, 46, 47] }, hat: 'cap' },
      shield: { coat: { r: [48, 49, 50] }, hat: 'helm' },
      hammer: { coat: { r: [55, 56, 57] }, hat: 'hood', wide: 0.15 }
    };
    const w = layer.startsWith('hero-') ? layer.slice(5) : null;
    if (w && OUTFIT[w]) {
      const o = OUTFIT[w], tag = 'body', wide = o.wide || 0.12;
      for (const d of [-0.08, 0.08]) {
        S.tube([P(d, 0.2, 0), P(d, 0.6, 0)], 0.045, 0.05, PANTS, { tag, res: 0.012 });
        S.box(P(d, 0.22, 0.04), [0.05, 0.035, 0.08], BOOT, { tag, res: 0.012 });
      }
      S.tube([P(0, 0.58, 0), P(0, 1.03, 0)], wide, wide, o.coat, { tag, res: 0.014 });
      S.box(P(0, 0.64, 0), [wide + 0.01, 0.03, wide + 0.01], { r: [7, 8] }, { tag, res: 0.01 }); // belt
      if (o.cape) S.box(P(0, 0.78, -0.12), [0.13, 0.28, 0.02], o.cape, { tag, res: 0.01 });
      S.ball(P(0, 1.18, 0), 0.1, SKIN, { tag, res: 0.012 });
      if (o.hat === 'helm') { S.ball(P(0, 1.25, -0.025), [0.112, 0.07, 0.105], { r: [30, 31, 32] }, { tag, res: 0.01 }); S.lathe(P(0, 1.235, -0.01), 0.015, 0.13, { r: [30, 31, 32] }, { tag, res: 0.008 }); }
      if (o.hat === 'band') S.lathe(P(0, 1.2, 0), 0.04, 0.105, { r: [39, 40] }, { tag, res: 0.008 });
      if (o.hat === 'cap') S.ball(P(0, 1.26, -0.02), [0.11, 0.05, 0.11], { r: [45, 46] }, { tag, res: 0.01 });
      if (o.hat === 'hood') S.lathe(P(0, 1.12, -0.05), 0.28, t => 0.13 * (1 - t * 0.85), o.coat, { tag, res: 0.01 });
      if (!o.hat) S.ball(P(0, 1.26, -0.01), [0.1, 0.05, 0.1], { r: [25, 26] }, { tag, res: 0.01 }); // hair
      // arms hang down; the right hand (on +x) holds the weapon upright at his side
      S.tube([P(-0.16, 1.0, 0), P(-0.19, 0.68, 0.02)], 0.035, 0.035, o.coat, { tag, res: 0.012 });
      S.tube([P(0.16, 1.0, 0), P(0.2, 0.7, 0.08)], 0.035, 0.035, o.coat, { tag, res: 0.012 });
      const h = P(0.21, 0.68, 0.1), x = h[0], y = h[1], z = h[2];
      if (w === 'sword') { S.box([x, y + 0.05, z], [0.02, 0.06, 0.02], WOOD, { tag, res: 0.008 }); S.box([x, y - 0.02, z], [0.02, 0.02, 0.08], BRASS, { tag, res: 0.008 }); S.box([x, y - 0.33, z], [0.012, 0.3, 0.035], STEEL, { tag, res: 0.008 }); }
      if (w === 'axe') { S.box([x, y - 0.15, z], [0.02, 0.4, 0.02], WOOD, { tag, res: 0.008 }); S.box([x, y + 0.18, z + 0.08], [0.015, 0.1, 0.08], STEEL, { tag, res: 0.008 }); }
      if (w === 'spear') { S.box([x, y + 0.15, z], [0.016, 0.75, 0.016], WOOD, { tag, res: 0.008 }); S.tube([[x, y + 0.9, z], [x, y + 1.08, z]], 0.04, 0.005, STEEL, { tag, res: 0.008 }); }
      if (w === 'shield') { S.lathe(P(-0.22, 0.72, 0.1), 0.04, 0.2, STEEL, { tag, res: 0.008, ax: [[1, 0, 0], [0, 0, 1], [0, 1, 0]] }); S.ball(P(-0.22, 0.72, 0.16), 0.05, BRASS, { tag, res: 0.008 }); }
      if (w === 'hammer') { S.box([x, y - 0.12, z], [0.022, 0.45, 0.022], WOOD, { tag, res: 0.008 }); S.box([x, y + 0.3, z], [0.07, 0.07, 0.12], STEEL, { tag, res: 0.008 }); }
      parts.body = { pivot: P(0, 0.2, 0), slices: 4 };
      pose = (t, dt, pup) => { const b = Math.sin(t * Math.PI * 2); pup.pose.body = { scale: [1, 1 + 0.012 * b, 1], rot: [0, 0, 0.8 * b] }; };
    }

    // ---- the campfire flames ----
    if (layer === 'fire') {
      for (let i = 0; i < 4; i++) {
        const x = CFX - 0.15 + i * 0.1, z = CFZ + 0.04 * Math.sin(i * 2.3), h = 0.25 + 0.1 * Math.sin(i * 1.9 + 1);
        S.tube([[x, 0.12, z], [x, 0.12 + h, z]], 0.08, 0.01, FIRE, { tag: 'f' + i, res: 0.012 });
        parts['f' + i] = { pivot: [x, 0.12, z], slices: 2 };
      }
      pose = (t, dt, pup) => { for (let i = 0; i < 4; i++) { const a = i * 1.7, k = 1 + 0.25 * Math.sin(Math.PI * 2 * 2 * t + a) + 0.1 * Math.sin(Math.PI * 2 * 5 * t + a * 2);
        pup.pose['f' + i] = { scale: [1 - 0.3 * (k - 1), k, 1 - 0.3 * (k - 1)], rot: [0, 0, 8 * Math.sin(Math.PI * 2 * t + a)] }; } };
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
  return { id: 'oh-army', name: 'Ore Heroes camp', seed: 13, build };
};
