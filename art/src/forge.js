// Ore Heroes: the forge, in the same ink style, lights and camera as the mine (art/src/mine.js).
// A cut-away stone hall: a great furnace in the back wall, the Blacksmith's anvil in the middle, a weapon rack on the back wall,
// and five little smithing stations (sword, axe, spear, shield, warhammer) that open one by one.
// OH_LAYER picks what is drawn (none = the empty hall, the background):
//   smith            you, the Blacksmith, at the anvil (clip: ready 0-1, strike 1-1.12, recover 1.12-1.5)
//   st-sword|st-axe|st-spear|st-shield|st-hammer   a station's bench and little anvil (drawn once the Blacksmith learns that weapon)
//   sword            the Swordsmith at his table (clip: hone 0-2, study 2-4)
//   axe|spear|shield|hammer               the smith who works that station (same clip as the Blacksmith)
//   w-sword|w-axe|w-spear|w-shield|w-hammer  one finished weapon hanging in its column of the rack
//   fire             the furnace flames (clip: a 0-1 loop)
module.exports = ({ makeBuilder, makeSculpt, KIT: K }) => {
  const PAL = [
    0x070605, 0x14100e, 0x211a16, 0x30261f, 0x42352b, 0x584738, 0x725d4a, // 0-6 stone (umber)
    0x2a1a10, 0x4a2e1a, 0x6e4628, 0x946238, // 7-10 timber, leather
    0xff9a30, 0xffd060, 0xfff2c0, // 11-13 fire light
    0x0c1820, 0x1a3040, 0x346078, 0x8ac0d8, // 14-17 (unused here; kept so indices match the mine)
    0x5a2a14, 0x9a4a22, 0xd88038, 0xf0b070, // 18-21 brick and copper
    0x1e3e32, 0x2e6450, 0x4a8a6c, // 22-24 green
    0x2a1e18, 0x4a3628, // 25-26 trousers, boots
    0xd8a07a, // 27 skin
    0x8a6020, 0xc89838, // 28-29 brass
    0x2a2e36, 0x5a606a, 0x9aa2b0, // 30-32 iron
    0x6a4428, 0x9a6634, 0xc8904a, // 33-35 firelit stone
    0x1e7a70, 0x5ae0c8, 0xc8fff4, // 36-38 (ghost; unused)
    0x5a1010, 0xa82a1c, 0xe04a30, // 39-41 red
    0x1e2e4a, 0x2e4a78, 0x4a6ea8, // 42-44 blue
    0x5a4210, 0x8a6a20, 0xc09a38, // 45-47 mustard
    0x24242a, 0x3c3c46, 0x60606e, 0xd8d0c0, // 48-51 grey, white
    0x7a4ad8, 0xb89aff, 0xf0e8ff, // 52-54 violet
    0x1a1430, 0x2e2450, 0x4a3a7a, // 55-57 robe
    0x8a96a8, 0xc8d2de, 0xf4f8ff, // 58-60 bright steel
    0x7a1810, 0xc8321e, 0xff7a20 // 61-63 hot metal
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
    const STONE = { r: [0, 1, 2, 3, 33, 34, 35] };
    const FLOOR = { r: [0, 1, 2, 3, 33, 34] };
    const BRICK = { r: [1, 18, 19, 33] };
    const WOOD = { r: [7, 8, 9, 10] };
    const IRON = { r: [0, 30, 31, 32] };
    const DARK = { r: [0, 30, 31] };
    const STEEL = { r: [31, 58, 59, 60] };
    const FIRE = { r: [11, 12, 13], em: true };
    const HOT = { r: [61, 62, 63, 12], em: true };
    const BRASS = { r: [28, 29] };
    const R = 5.2, RI = 4.6, H = 5.2;
    const wallZ = x => -Math.sqrt(Math.max(0, RI * RI - x * x));
    const FX = -0.6; // the furnace, in the back wall

    // ---- lights (all before the first bake) ----
    S.lights.push({ p: [FX, 0.9, wallZ(FX) + 1.6], r: 5.5, s: 3.0 }); // the furnace mouth
    S.lights.push({ p: [1.0, 1.6, 1.2], r: 2.4, s: 0.9 }); // over the anvil
    for (const [x, z] of [[-3.3, -1.0], [3.3, -0.6]]) S.lights.push({ p: [x, 2.0, z], r: 3.0, s: 1.3 }); // wall lanterns

    // ---- floor and a half-round stone hall, front cut away ----
    S.lathe([0, -0.5, 0], 0.5, R + 0.3, FLOOR, { res: 0.1 });
    S.bake();
    S.lathe([0, 0, 0], H, t => R * (1 - 0.06 * t), STONE, { res: 0.1 });
    S.lathe([0, -0.1, 0], H + 0.2, RI, STONE, { neg: true });
    S.box([0, H / 2, R], [R + 1, H / 2 + 1, R], STONE, { neg: true });
    S.bake();
    // flagstones: a few low slabs so the floor reads as worked stone
    for (let i = 0; i < 14; i++) {
      const x = -3.8 + (i % 5) * 1.9 + (Math.floor(i / 5) % 2) * 0.9, z = -2.2 + Math.floor(i / 5) * 1.5;
      if (Math.hypot(x, z) > RI - 0.4) continue;
      S.box([x, 0.0, z], [0.85, 0.02, 0.68], { r: [1, 2, 3] }, { res: 0.05 });
    }
    // timber posts and a beam around the wall
    for (const a of [-1.25, -0.62, 0.62, 1.25]) {
      const x = Math.sin(a) * (RI - 0.1), z = -Math.cos(a) * (RI - 0.1);
      S.box([x, H * 0.4, z], [0.12, H * 0.4, 0.12], WOOD, { res: 0.04 });
    }
    for (let i = 0; i < 24; i++) {
      const a0 = -1.4 + (2.8 * i) / 24, a1 = -1.4 + (2.8 * (i + 1)) / 24, rr = RI - 0.12;
      S.tube([[Math.sin(a0) * rr, H * 0.8, -Math.cos(a0) * rr], [Math.sin(a1) * rr, H * 0.8, -Math.cos(a1) * rr]], 0.1, 0.1, WOOD, { res: 0.04 });
    }
    // wall lanterns on brackets
    for (const [x, z] of [[-3.3, -1.0], [3.3, -0.6]]) {
      const a = Math.atan2(x, -z), wx = Math.sin(a) * (RI - 0.15), wz = -Math.cos(a) * (RI - 0.15);
      const lx = Math.sin(a) * (RI - 0.45), lz = -Math.cos(a) * (RI - 0.45);
      S.tube([[wx, 2.55, wz], [lx, 2.55, lz]], 0.025, 0.025, IRON, { res: 0.01 });
      S.box([lx, 2.38, lz], [0.07, 0.02, 0.07], IRON, { res: 0.012 });
      S.box([lx, 2.2, lz], [0.06, 0.15, 0.06], FIRE, { res: 0.012 });
      S.box([lx, 2.02, lz], [0.07, 0.02, 0.07], IRON, { res: 0.012 });
    }

    // ---- the furnace: a brick block in the back wall with an arched glowing mouth and a hood up into the dark ----
    const fz = wallZ(FX) + 0.55;
    S.box([FX, 1.25, fz], [1.05, 1.25, 0.7], { r: [0, 1, 2, 3] }, { res: 0.05, rd: 0.05 });
    const arch = (w, h) => { const p = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (i / 12); p.push([Math.cos(a) * w, h + Math.sin(a) * w]); } p.push([-w, 0], [w, 0]); return p; };
    S.extrude([arch(0.68, 0.5)], [FX, 0.3, fz + 0.86], 0.14, BRICK, {}); // a brick ring round the mouth
    S.extrude([arch(0.52, 0.5)], [FX, 0.3, fz + 0.9], 1.0, BRICK, { neg: true });
    S.box([FX, 0.75, fz + 0.0], [0.52, 0.48, 0.06], FIRE, { res: 0.03 }); // the white-hot back of the firebox
    S.box([FX, 0.24, fz + 0.88], [0.75, 0.06, 0.12], DARK, { res: 0.03 }); // the sill
    S.lathe([FX, 2.5, fz], 1.0, t => 0.98 - 0.68 * t, DARK, { res: 0.05 }); // the hood
    S.box([FX, 4.4, fz], [0.3, 1.0, 0.3], DARK, { res: 0.05 }); // the chimney
    for (const y of [2.52, 3.5]) S.lathe([FX, y, fz], 0.06, y < 3 ? 1.06 : 0.32, BRASS, { res: 0.02 });
    S.bake();
    // coals inside the mouth (the dancing flames are the fire layer)
    for (let i = 0; i < 7; i++) S.ball([FX - 0.4 + i * 0.13, 0.36, fz + 0.45 + 0.08 * Math.sin(i * 2.1)], 0.1, HOT, { res: 0.015 });

    // ---- the Blacksmith's anvil on a stump, a quench trough beside it ----
    const AX = 1.15, AZ = 0.55, AT = 0.78; // the anvil and the height of its face
    S.lathe([AX, 0, AZ], 0.42, 0.3, WOOD, { res: 0.03 });
    S.box([AX, 0.52, AZ], [0.14, 0.12, 0.2], IRON, { res: 0.015 });
    S.box([AX, AT - 0.08, AZ], [0.2, 0.08, 0.32], IRON, { res: 0.015, rd: 0.02 });
    S.tube([[AX, AT - 0.06, AZ + 0.32], [AX, AT - 0.1, AZ + 0.55]], 0.08, 0.01, IRON, { res: 0.012 }); // the horn
    S.box([AX + 0.75, 0.22, AZ - 0.55], [0.32, 0.22, 0.2], WOOD, { res: 0.03 });
    S.box([AX + 0.75, 0.43, AZ - 0.55], [0.27, 0.02, 0.15], { r: [14, 15] }, { res: 0.02 });

    // ---- the weapon rack on the back wall, right of the furnace: a board with five columns of pegs ----
    const RX = 2.2, RZ = wallZ(RX + 1.05) + 0.12;
    S.box([RX, 1.55, RZ], [0.95, 0.75, 0.05], WOOD, { res: 0.025 });
    S.box([RX, 2.33, RZ + 0.02], [1.02, 0.05, 0.08], WOOD, { res: 0.02 });
    S.box([RX, 0.78, RZ + 0.02], [1.02, 0.05, 0.08], WOOD, { res: 0.02 });
    for (const dx of [-0.85, 0.85]) S.box([RX + dx, 0.78, RZ - 0.02], [0.05, 0.78, 0.05], WOOD, { res: 0.02 }); // its legs
    const COLS = { sword: -0.76, axe: -0.38, spear: 0, shield: 0.38, hammer: 0.76 };
    for (const c of Object.values(COLS)) S.box([RX + c, 2.1, RZ + 0.08], [0.03, 0.03, 0.06], IRON, { res: 0.01 });

    S.bake();

    // =================== layers ===================
    const ease = x => x * x * (3 - 2 * x);
    const SKIN = { r: [27] }, PANTS = { r: [0, 25] }, BOOT = { r: [0, 25, 26] };
    const parts = {};
    let pose = null;
    // a figure at (X, Z) facing +x (dir 1) or -x (dir -1): P(side, up, forward)
    const facing = (X, Z, dir) => (s, y, f) => [X + dir * f, y, Z - dir * s];
    function person(P, o) {
      for (const d of [-0.07, 0.07]) {
        S.tube([P(d, 0.2, 0), P(d, 0.6, 0)], 0.045, 0.05, o.pants || PANTS, { tag: 'body', res: 0.012 });
        S.box(P(d, 0.22, 0.04), [0.055, 0.035, 0.08], BOOT, { tag: 'body', res: 0.012 });
      }
      const w = o.wide || 0.12;
      S.tube([P(0, 0.58, 0), P(0, 1.03, 0)], w, w, o.coat, { tag: 'body', res: 0.014 });
      if (o.apron) S.box(P(0, 0.72, 0.1), [0.11, 0.26, 0.03], o.apron, { tag: 'body', res: 0.01 });
      S.box(P(0, 0.64, 0), [0.13, 0.03, 0.13], { r: [7, 8] }, { tag: 'body', res: 0.01 });
      S.ball(P(0, 1.18, 0), 0.1, SKIN, { tag: 'body', res: 0.012 });
      S.tube([P(-0.15, 1.0, 0), P(-0.15, 0.7, 0.06)], 0.035, 0.035, o.coat, { tag: 'body', res: 0.012 }); // the off arm
      return P;
    }
    // the hammer arm: shoulder to hand, a haft, and a head that lands on the face at `land` (a point)
    function hammerArm(P, coat, land, big) {
      const SH = P(0.12, 1.0, 0), HAND = P(0.08, 0.82, 0.3);
      S.tube([SH, HAND], 0.035, 0.035, coat, { tag: 'arm', res: 0.012 });
      const hd = [land[0], land[1] + (big ? 0.09 : 0.07), land[2]];
      S.tube([P(0.08, 0.8, 0.22), hd], 0.018, 0.018, WOOD, { tag: 'arm', res: 0.01 });
      S.box(hd, big ? [0.07, 0.07, 0.11] : [0.055, 0.055, 0.085], IRON, { tag: 'arm', res: 0.01 });
      parts.body = { pivot: P(0, 0.2, 0), slices: 4 };
      parts.arm = { pivot: SH, parent: 'body', slices: 2 };
      return SH;
    }
    // ready = hammer raised over the shoulder; strike lands at 1.12; recover lifts it again (same timing as the mine's picks)
    function swingPose(dir) {
      return (t, dt, pup) => {
        let lift, squash = 0, breathe = 0;
        if (t < 1) { breathe = Math.sin(t * Math.PI * 2); lift = 1 + 0.04 * breathe; }
        else if (t < 1.12) { const k = (t - 1) / 0.12; lift = 1 - k * k; if (k > 0.9) squash = 1; }
        else { const k = Math.min(1, (t - 1.12) / 0.38); lift = ease(k); squash = Math.max(0, 1 - k * 3); }
        pup.pose.arm = { rot: [0, 0, dir * lift * 115] };
        pup.pose.body = { rot: [0, 0, dir * (Math.max(0, lift) * 5 - squash * 4)], scale: [1 + 0.04 * squash, 1 - 0.05 * squash + 0.012 * breathe, 1 + 0.04 * squash] };
      };
    }
    // a little anvil on a block, for a station
    function smallAnvil(at) {
      S.box([at[0], 0.2, at[2]], [0.13, 0.2, 0.13], WOOD, { res: 0.02 });
      S.box([at[0], 0.47, at[2]], [0.08, 0.07, 0.1], IRON, { res: 0.012 });
      S.box([at[0], 0.57, at[2]], [0.13, 0.04, 0.2], IRON, { res: 0.012, rd: 0.01 });
    }

    // ---- the weapons: each kind as a little model; `put(kind, at, hang)` places one ----
    function weapon(kind, at, o = {}) {
      const tag = o.tag, hot = o.hot, m = o.mat || STEEL;
      const blade = hot ? HOT : m;
      const x = at[0], y = at[1], z = at[2];
      if (o.lay) { // lying flat on an anvil face, pointing along z
        if (kind === 'sword') { S.box([x, y, z], [0.035, 0.012, 0.22], blade, { tag, res: 0.008 }); S.box([x, y, z - 0.25], [0.07, 0.015, 0.02], hot ? HOT : BRASS, { tag, res: 0.008 }); }
        else if (kind === 'axe') { S.box([x, y, z], [0.12, 0.014, 0.06], blade, { tag, res: 0.008 }); }
        else if (kind === 'spear') { S.box([x, y, z], [0.035, 0.012, 0.12], blade, { tag, res: 0.008 }); }
        else if (kind === 'shield') { S.lathe([x, y - 0.01, z], 0.025, 0.17, blade, { tag, res: 0.008 }); }
        else if (kind === 'hammer') { S.box([x, y + 0.03, z], [0.07, 0.06, 0.1], blade, { tag, res: 0.008 }); }
        return;
      }
      // hanging upright from a peg at `at`
      if (kind === 'sword') {
        S.box([x, y - 0.12, z], [0.035, 0.08, 0.02], WOOD, { tag, res: 0.008 }); // grip
        S.box([x, y - 0.22, z], [0.09, 0.02, 0.025], BRASS, { tag, res: 0.008 }); // guard
        S.box([x, y - 0.6, z], [0.04, 0.37, 0.012], m, { tag, res: 0.008 }); // blade
      } else if (kind === 'axe') {
        S.box([x, y - 0.4, z], [0.022, 0.4, 0.022], WOOD, { tag, res: 0.008 });
        S.box([x + 0.08, y - 0.14, z], [0.08, 0.1, 0.015], m, { tag, res: 0.008 });
      } else if (kind === 'spear') {
        S.box([x, y - 0.35, z], [0.018, 0.75, 0.018], WOOD, { tag, res: 0.008 });
        S.tube([[x, y + 0.4, z], [x, y + 0.62, z]], 0.045, 0.005, m, { tag, res: 0.008 });
      } else if (kind === 'shield') {
        S.lathe([x, y - 0.45, z - 0.01], 0.04, 0.2, m, { tag, res: 0.008, ax: [[1, 0, 0], [0, 0, 1], [0, 1, 0]] });
        S.ball([x, y - 0.45, z + 0.03], 0.05, BRASS, { tag, res: 0.008 });
      } else if (kind === 'hammer') {
        S.box([x, y - 0.4, z], [0.022, 0.4, 0.022], WOOD, { tag, res: 0.008 });
        S.box([x, y - 0.06, z], [0.12, 0.07, 0.06], m, { tag, res: 0.008 });
      }
    }

    // ---- you, the Blacksmith: leather apron, red shirt, at the anvil facing +x, a hot blade on the face ----
    if (layer === 'smith') {
      const P = person(facing(AX - 0.62, AZ - 0.05, 1), { coat: { r: [39, 40, 41] }, apron: { r: [7, 8, 9] }, wide: 0.13 });
      S.ball(P(0, 1.27, -0.02), [0.1, 0.05, 0.1], { r: [25, 26] }, { tag: 'body', res: 0.01 }); // short dark hair
      weapon('sword', [AX, AT + 0.012, AZ + 0.05], { lay: true, hot: true });
      hammerArm(P, { r: [39, 40, 41] }, [AX - 0.02, AT + 0.02, AZ], true);
      pose = swingPose(1);
    }

    // ---- the Swordsmith studies swords rather than hammering: a work table with a blade, an open book and a whetstone.
    // clip: idle 0-2 (hones the blade, two long strokes), study 2-4 (straightens up and turns to read his book, then back)
    function swordsmith(st, P, anv) {
      const top = 0.62, T = [anv[0] + 0.05, 0, anv[2]];
      if (layer === 'st-sword') {
        S.box([T[0], top - 0.03, T[2]], [0.24, 0.03, 0.42], WOOD, { res: 0.015 }); // the table top
        for (const dx of [-0.19, 0.19]) for (const dz of [-0.36, 0.36]) S.box([T[0] + dx, (top - 0.06) / 2, T[2] + dz], [0.025, (top - 0.06) / 2, 0.025], WOOD, { res: 0.012 });
        weapon('sword', [T[0] - 0.04, top + 0.012, T[2] + 0.08], { lay: true }); // the blade he's honing
        // an open book at the far end
        S.box([T[0] + 0.02, top + 0.012, T[2] - 0.3], [0.1, 0.012, 0.075], { r: [49, 50, 51] }, { res: 0.008 });
        S.box([T[0] + 0.02, top + 0.006, T[2] - 0.3], [0.11, 0.008, 0.085], { r: [39, 40] }, { res: 0.008 });
        // a finished blade leaning on the wall behind him
        for (const dz of [-0.05]) {
          const x = st.x - 0.32, z = st.z + dz;
          S.box([x, 0.42, z], [0.012, 0.36, 0.022], STEEL, { res: 0.008 });
          S.box([x, 0.8, z], [0.02, 0.02, 0.08], BRASS, { res: 0.008 });
          S.box([x, 0.9, z], [0.02, 0.08, 0.03], WOOD, { res: 0.008 });
        }
      }
      if (layer === 'sword') {
        person(P, { coat: st.coat, apron: { r: [7, 8] } });
        S.ball(P(0, 1.26, 0), [0.11, 0.06, 0.11], { r: [8, 9] }, { tag: 'body', res: 0.01 });
        const SH = P(0.12, 1.0, 0), HAND = P(0.02, 0.7, 0.42);
        S.tube([SH, HAND], 0.035, 0.035, st.coat, { tag: 'arm', res: 0.012 });
        S.box([HAND[0], top + 0.04, HAND[2]], [0.06, 0.025, 0.035], { r: [3, 4, 5] }, { tag: 'arm', res: 0.008 }); // the whetstone
        parts.body = { pivot: P(0, 0.2, 0), slices: 3 };
        parts.arm = { pivot: SH, parent: 'body', slices: 2 };
        pose = (t, dt, pup) => {
          if (t < 2) { // honing: the stone sweeps along the blade and back, twice
            const a = Math.sin(t * Math.PI * 2);
            pup.pose.arm = { rot: [0, 22 * a, 0] };
            pup.pose.body = { rot: [0, 4 * a, -6] };
          } else { // studying: straighten up and turn toward the book, read, then back to the blade
            const k = t - 2, e = k < 0.5 ? ease(k / 0.5) : k < 1.5 ? 1 : 1 - ease((k - 1.5) / 0.5);
            pup.pose.arm = { rot: [0, -10 * e, 0] };
            pup.pose.body = { rot: [0, 28 * e + 2 * Math.sin(k * 6) * (k > 0.5 && k < 1.5 ? 1 : 0), -6 * (1 - e)] };
          }
        };
      }
    }

    // ---- the five stations and their smiths (the Swordsmith stands where the Smelter used to) ----
    const ST = {
      sword:  { x: -2.35, z: -2.0, dir: 1, coat: { r: [42, 43, 44] }, hat: 'leather' },
      axe:    { x: 3.55, z: -0.9, dir: -1, coat: { r: [22, 23, 24] }, hat: 'cap' },
      spear:  { x: -3.65, z: -0.25, dir: 1, coat: { r: [45, 46, 47] }, hat: 'band' },
      shield: { x: 3.35, z: 1.05, dir: -1, coat: { r: [48, 49, 50] }, hat: 'helm' },
      hammer: { x: -2.3, z: 1.05, dir: 1, coat: { r: [55, 56, 57] }, hat: 'hood', wide: 0.15 }
    };
    for (const [k, st] of Object.entries(ST)) {
      const P = facing(st.x, st.z, st.dir), anv = P(0, 0, 0.55), top = 0.61;
      if (k === 'sword') { swordsmith(st, P, anv); continue; }
      if (layer === 'st-' + k) {
        smallAnvil(anv);
        weapon(k, [anv[0], top + 0.012, anv[2]], { lay: true, mat: IRON });
        // a work bench behind, with a finished one leaning on it
        const bench = [st.x + st.dir * 0.35, 0, st.z - 0.62];
        S.box([bench[0], 0.42, bench[2]], [0.28, 0.04, 0.2], WOOD, { res: 0.02 });
        for (const dx of [-0.22, 0.22]) S.box([bench[0] + dx, 0.2, bench[2]], [0.03, 0.2, 0.15], WOOD, { res: 0.015 });
      }
      if (layer === k) {
        person(P, { coat: st.coat, apron: { r: [7, 8] }, wide: st.wide });
        if (st.hat === 'leather') S.ball(P(0, 1.26, 0), [0.11, 0.06, 0.11], { r: [8, 9] }, { tag: 'body', res: 0.01 });
        if (st.hat === 'cap') S.ball(P(0, 1.25, 0), [0.11, 0.05, 0.11], { r: [22, 23] }, { tag: 'body', res: 0.01 });
        if (st.hat === 'band') S.lathe(P(0, 1.2, 0), 0.04, 0.105, { r: [39, 40] }, { tag: 'body', res: 0.008 });
        if (st.hat === 'helm') { S.ball(P(0, 1.24, 0), [0.115, 0.08, 0.115], IRON, { tag: 'body', res: 0.01 }); S.lathe(P(0, 1.2, 0), 0.015, 0.14, IRON, { tag: 'body', res: 0.008 }); }
        if (st.hat === 'hood') S.lathe(P(0, 1.12, -0.02), 0.28, t => 0.13 * (1 - t * 0.85), st.coat, { tag: 'body', res: 0.01 });
        hammerArm(P, st.coat, [anv[0], top + 0.02, anv[2]], k === 'hammer');
        pose = swingPose(st.dir);
      }
    }

    // ---- a finished weapon in its rack column ----
    if (layer.startsWith('w-')) { const k = layer.slice(2); weapon(k, [RX + COLS[k], 2.08, RZ + 0.12], {}); }

    // ---- the furnace flames ----
    const FL = [];
    if (layer === 'fire') {
      for (let i = 0; i < 5; i++) {
        const x = FX - 0.32 + i * 0.16, h = 0.22 + 0.12 * Math.sin(i * 1.9 + 1);
        S.tube([[x, 0.4, fz + 0.4], [x, 0.4 + h, fz + 0.4]], 0.09, 0.01, FIRE, { tag: 'f' + i, res: 0.012 });
        parts['f' + i] = { pivot: [x, 0.4, fz + 0.4], slices: 2 };
        FL.push(i);
      }
      pose = (t, dt, pup) => FL.forEach(i => { const a = i * 1.7, k = 1 + 0.25 * Math.sin(Math.PI * 2 * 2 * t + a) + 0.1 * Math.sin(Math.PI * 2 * 5 * t + a * 2);
        pup.pose['f' + i] = { scale: [1 - 0.3 * (k - 1), k, 1 - 0.3 * (k - 1)], rot: [0, 0, 8 * Math.sin(Math.PI * 2 * t + a)] }; });
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
  return { id: 'oh-forge', name: 'Ore Heroes forge', seed: 11, build };
};
