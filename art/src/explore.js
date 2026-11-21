// Ore Heroes: Explore, a tunnel running deeper into the cave, where the army fights. Same ink style, lights and camera as the camp.
// OH_LAYER picks what is drawn (none = the empty tunnel, the background):
//   u-sword|u-axe|u-spear|u-shield|u-hammer   one of your heroes, facing right, at the front of your line
//   e-sword|e-axe|e-spear|e-shield|e-hammer   a cave ghoul with that weapon, facing left, at the front of theirs
//   w-...                                     the Warden (copper armour) with that weapon
//   clip for all of them: idle 0-1, hit 1-1.4 (swing), fall 2-2.6 (topples and stays down), walk 3-4 (a loop of two strides)
//   the game draws the same frames shifted sideways for the other places in each line
const ease = x => x * x * (3 - 2 * x);
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

    const UX = -0.55, EX = 0.75, FZ = 1.2; // where the front fighter of each side stands
    // ---- lights: lanterns along the tunnel, dimmer toward the right (deeper) ----
    S.lights.push({ p: [-3.2, 2.0, -0.6], r: 3.6, s: 1.6 }, { p: [0.2, 2.1, -0.9], r: 3.4, s: 1.3 }, { p: [3.4, 1.9, -0.7], r: 2.6, s: 0.6 });
    S.lights.push({ p: [0.1, 1.5, FZ + 1.2], r: 3.2, s: 0.8 }); // on the fighters

    // ---- a tunnel running across the screen: floor, a back wall of rock, a low roof, the front cut away ----
    S.box([0, -0.25, 0], [6.5, 0.25, 3.2], FLOOR, { res: 0.1 });
    S.bake();
    S.box([0, 2.0, -2.2], [6.5, 2.2, 0.6], ROCK, { res: 0.1 });
    S.box([0, 4.0, -0.6], [6.5, 0.4, 2.2], ROCK, { res: 0.1 });
    S.bake();
    for (let i = 0; i < 22; i++) { // rocks along the foot of the back wall and on the floor
      const x = -6 + i * 0.58 + 0.2 * Math.sin(i * 2.3), sz = 0.3 + 0.25 * K.hash(i, 5);
      S.rock([x, sz * 0.4, -1.45 + 0.15 * Math.sin(i * 1.7)], sz, ROCK, { res: 0.07 });
    }
    for (let i = 0; i < 12; i++) { // stalactites
      const x = -5.5 + i * 1.0 + 0.3 * Math.sin(i * 3.1), l = 0.3 + 0.5 * K.hash(i, 9);
      S.tube([[x, 3.65, -1.0 + 0.6 * Math.sin(i)], [x, 3.65 - l, -1.0 + 0.6 * Math.sin(i)]], 0.13, 0.01, ROCK, { res: 0.04 });
    }
    for (const [x, z] of [[-4.6, 2.2], [3.9, 2.4], [-1.8, 2.5]]) S.rock([x, 0.15, z], 0.28, ROCK, { res: 0.05 });
    S.bake();
    // timber props and lanterns on the back wall
    for (const x of [-3.2, 0.2, 3.4]) {
      for (const sd of [-0.55, 0.55]) S.box([x + sd, 1.6, -1.4], [0.08, 1.6, 0.08], WOOD, { res: 0.04 });
      S.box([x, 3.2, -1.4], [0.75, 0.09, 0.1], WOOD, { res: 0.04 });
      S.box([x, 2.1, -1.25], [0.06, 0.13, 0.06], FIRE, { res: 0.012 });
      S.box([x, 2.27, -1.25], [0.07, 0.02, 0.07], IRON, { res: 0.012 });
    }
    S.bake();

    // =================== layers ===================
    const parts = {};
    let pose = null;
    const SKIN = { r: [27] }, PANTS = { r: [0, 25] }, BOOT = { r: [0, 25, 26] };
    const OUTFIT = {
      sword:  { coat: { r: [42, 43, 44] }, hat: 'helm', cape: { r: [39, 40] } },
      axe:    { coat: { r: [22, 23, 24] }, hat: 'band', wide: 0.14 },
      spear:  { coat: { r: [45, 46, 47] }, hat: 'cap' },
      shield: { coat: { r: [48, 49, 50] }, hat: 'helm' },
      hammer: { coat: { r: [55, 56, 57] }, hat: 'hood', wide: 0.15 },
      bow:    { coat: { r: [7, 8, 9, 10] }, hat: 'hood', hood: { r: [22, 23, 24] }, wide: 0.11 }
    };
    const FOE = { coat: { r: [2, 3, 4, 5] }, hood: { r: [39, 61] }, skin: { r: [22, 23, 24] } };
    const WARDEN = { coat: { r: [18, 19, 20] }, hood: { r: [18, 19] }, skin: { r: [22, 23, 24] }, wide: 0.16 };
    const m = layer.match(/^(u|e|w)-(\w+)$/);
    if (m) {
      const side = m[1], w = m[2], dir = side === 'u' ? 1 : -1, X = side === 'u' ? UX : EX;
      const o = side === 'u' ? OUTFIT[w] : side === 'w' ? WARDEN : FOE, tag = 'body', wide = o.wide || 0.12;
      const P = (s, y, f) => [X + dir * f, y, FZ + s]; // s toward the camera, f toward the enemy
      [-0.07, 0.07].forEach((d, li) => { // the legs are their own parts so they can walk
        const lt = 'leg' + li;
        S.tube([P(d, 0.2, 0), P(d, 0.6, 0)], 0.045, 0.05, PANTS, { tag: lt, res: 0.012 });
        S.box(P(d, 0.22, 0.04), [0.08, 0.035, 0.05], BOOT, { tag: lt, res: 0.012 });
        parts[lt] = { pivot: P(d, 0.6, 0), parent: 'body', slices: 2 };
      });
      S.tube([P(0, 0.58, 0), P(0, 1.03, 0)], wide, wide, o.coat, { tag, res: 0.014 });
      S.box(P(0, 0.64, 0), [wide + 0.01, 0.03, wide + 0.01], { r: [7, 8] }, { tag, res: 0.01 });
      if (o.cape) S.box(P(0, 0.78, -0.13), [0.02, 0.28, 0.12], o.cape, { tag, res: 0.01 });
      S.ball(P(0, 1.18, 0), 0.1, o.skin || SKIN, { tag, res: 0.012 });
      if (o.hood && side !== 'u') { S.lathe(P(0, 1.1, -0.03), 0.3, t => 0.135 * (1 - t * 0.8), o.hood, { tag, res: 0.01 }); S.ball(P(0.04, 1.19, 0.09), 0.018, { r: [62, 63], em: true }, { tag, res: 0.006 }); }
      if (o.hat === 'helm') { S.ball(P(0, 1.25, -0.025), [0.105, 0.07, 0.112], { r: [30, 31, 32] }, { tag, res: 0.01 }); S.lathe(P(0, 1.235, -0.01), 0.015, 0.13, { r: [30, 31, 32] }, { tag, res: 0.008 }); }
      if (o.hat === 'band') S.lathe(P(0, 1.2, 0), 0.04, 0.105, { r: [39, 40] }, { tag, res: 0.008 });
      if (o.hat === 'cap') S.ball(P(0, 1.26, -0.02), [0.11, 0.05, 0.11], { r: [45, 46] }, { tag, res: 0.01 });
      if (o.hat === 'hood') S.lathe(P(0, 1.12, -0.05), 0.28, t => 0.13 * (1 - t * 0.85), side === 'u' && o.hood ? o.hood : o.coat, { tag, res: 0.01 });
      S.tube([P(-0.15, 1.0, 0), P(-0.17, 0.7, 0.05)], 0.035, 0.035, o.coat, { tag, res: 0.012 }); // far arm
      if (w === 'shield') { S.lathe(P(-0.19, 0.78, 0.16), 0.04, 0.2, STEEL, { tag, res: 0.008, ax: [[0, 0, 1], [1, 0, 0], [0, 1, 0]].map(v => [dir * v[0], v[1], v[2]]) }); }
      // the weapon arm (near the camera): shoulder to hand, the weapon pointing up and forward
      const SH = P(0.15, 1.0, 0), HAND = P(0.18, 0.8, 0.22);
      S.tube([SH, HAND], 0.035, 0.035, o.coat, { tag: 'arm', res: 0.012 });
      const up = (a, b) => [HAND[0] + dir * a, HAND[1] + b, HAND[2] + 0.02];
      const BL = side === 'u' ? STEEL : IRON;
      if (w === 'sword') { S.box(up(0, -0.02), [0.06, 0.015, 0.02], BRASS, { tag: 'arm', res: 0.008 }); S.tube([up(0, 0), up(0.12, 0.5)], 0.022, 0.012, BL, { tag: 'arm', res: 0.008 }); }
      if (w === 'axe') { S.tube([up(-0.02, -0.1), up(0.06, 0.5)], 0.02, 0.02, WOOD, { tag: 'arm', res: 0.008 }); S.box(up(0.12, 0.42), [0.07, 0.09, 0.015], BL, { tag: 'arm', res: 0.008 }); }
      if (w === 'spear') { S.tube([up(-0.3, -0.12), up(0.5, 0.22)], 0.016, 0.016, WOOD, { tag: 'arm', res: 0.008 }); S.tube([up(0.5, 0.22), up(0.68, 0.3)], 0.035, 0.004, BL, { tag: 'arm', res: 0.008 }); }
      if (w === 'shield') { S.tube([up(0, 0), up(0.1, 0.35)], 0.018, 0.01, BL, { tag: 'arm', res: 0.008 }); }
      if (w === 'bow') { // held out toward the foe, string toward the archer; a quiver on the back
        const bow = [up(0.08, -0.32), up(0.15, -0.16), up(0.17, 0), up(0.15, 0.16), up(0.08, 0.32)];
        S.tube(bow.slice(0, 3), 0.012, 0.018, WOOD, { tag: 'arm', res: 0.006 }); S.tube(bow.slice(2), 0.018, 0.012, WOOD, { tag: 'arm', res: 0.006 });
        S.tube([bow[0], bow[4]], 0.004, 0.004, { r: [50, 51] }, { tag: 'arm', res: 0.004 });
        S.tube([P(-0.1, 0.75, -0.12), P(-0.04, 1.12, -0.16)], 0.045, 0.05, { r: [7, 8, 9] }, { tag, res: 0.01 });
        for (let i = 0; i < 3; i++) S.box(P(-0.03 + i * 0.02, 1.17, -0.17), [0.006, 0.04, 0.015], { r: [39, 40] }, { tag, res: 0.006 }); }
      if (w === 'hammer') { S.tube([up(-0.02, -0.1), up(0.06, 0.5)], 0.022, 0.022, WOOD, { tag: 'arm', res: 0.008 }); S.box(up(0.07, 0.5), [0.12, 0.07, 0.07], BL, { tag: 'arm', res: 0.008 }); }
      parts.body = { pivot: P(0, 0.2, 0), slices: 4 };
      parts.arm = { pivot: SH, parent: 'body', slices: 2 };
      // clip: idle 0-1 (breathing, weapon ready), hit 1-1.4 (raise, strike forward, recover), fall 2-2.6 (topples backward and stays down)
      pose = (t, dt, pup) => {
        if (t < 1) { const b = Math.sin(t * Math.PI * 2); pup.pose.body = { rot: [0, 0, dir * b * 1] }; pup.pose.arm = { rot: [0, 0, dir * 10 * b] }; }
        else if (t < 2 && w === 'bow') { const k = Math.min(1, (t - 1) / 0.4), d = k < 0.6 ? ease(k / 0.6) : 1 - ease((k - 0.6) / 0.4); // draw, loose, settle
          pup.pose.arm = { rot: [0, 0, dir * 14 * d] }; pup.pose.body = { rot: [0, 0, -dir * 5 * d] }; }
        else if (t < 2) { const k = Math.min(1, (t - 1) / 0.4), a = k < 0.35 ? ease(k / 0.35) * 50 : k < 0.55 ? 50 - ease((k - 0.35) / 0.2) * 130 : -80 + ease((k - 0.55) / 0.45) * 80;
          pup.pose.arm = { rot: [0, 0, dir * a] }; pup.pose.body = { rot: [0, 0, -dir * (k > 0.35 && k < 0.8 ? 8 : 0)] }; }
        else if (t >= 3) { const c = Math.sin((t - 3) * Math.PI * 4), u = Math.abs(Math.cos((t - 3) * Math.PI * 4)); // walk: two strides a second
          pup.pose.leg0 = { rot: [0, 0, dir * 28 * c] }; pup.pose.leg1 = { rot: [0, 0, -dir * 28 * c] };
          pup.pose.body = { rot: [0, 0, -dir * 3], scale: [1, 1 + 0.02 * u, 1] }; pup.pose.arm = { rot: [0, 0, dir * (8 - 14 * c)] }; }
        else { const k = Math.min(1, (t - 2) / 0.6); pup.pose.body = { rot: [0, 0, dir * 82 * ease(k)] }; pup.pose.arm = { rot: [0, 0, dir * 20 * k] }; }
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
  return { id: 'oh-explore', name: 'Ore Heroes explore', seed: 17, build };
};
