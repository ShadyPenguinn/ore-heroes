// Ore Heroes: the mine heroes' bodies, sculpted for the detailed splat look. Thin, wiry people with real faces (eyes with a glint,
// brows, a nose, ears), fur beards, and clothes with weave and grain. Each hero in mine.js is built from these parts and keeps
// its own tags and pivots, so its clip (swing, call, duck, reach, turn, walk) still drives it.
//
// Everything is placed in a figure's own frame: F.P(a, y, b) turns local (a = toward the figure's pick side, y = up,
// b = forward, the way it faces) into the world. Ellipsoids and boxes are turned with F.ax so they face the same way.
// C holds the palette indices (see COLOURS and palette() at the bottom).
module.exports = (S, K, B, C) => {
  const n3 = (x, y, z, f) => B.n3(x * f, y * f, z * f) - 0.5;
  const mat = (r, mod) => (mod ? { r, mod } : { r });
  const weave = (r, k = 0.18, f = 10) => mat(r, (x, y, z) => k * n3(x, y, z, f));
  const M = {
    skin: r => weave(r, 0.1, 14),
    cloth: (r, k) => weave(r, k || 0.18, 10),
    leather: r => weave(r, 0.25, 16),
    metal: r => weave(r, 0.15, 14),
    wood: r => mat(r, K.tex.range(K.tex.wave(26, { warp: 0.5 }), 0, 1, -0.2, 0.15)),
    fur: (r, o) => K.look.fur(r, { still: true, len: 0.025, comb: [0, -1, 0.3], lay: 0.8, droop: 0.4, clump: 0.7, rim: [r[r.length - 1]], ...(o || {}) }),
    glow: r => ({ r, em: true }),
    flat: r => ({ r })
  };

  // a figure standing at (x, z), facing f = [fx, fz] on the floor
  function rig(x, z, f) {
    const l = Math.hypot(f[0], f[1]), fx = f[0] / l, fz = f[1] / l, sx = fz, sz = -fx;
    const P = (a, y, b) => [x + sx * a + fx * b, y, z + sz * a + fz * b];
    const ax = [[sx, 0, sz], [0, 1, 0], [fx, 0, fz]];
    return { P, ax, side: [sx, 0, sz], fwd: [fx, 0, fz], at: [x, z] };
  }
  // the parts, in a figure's frame
  const opt = (F, tag, res, g, extra) => ({ tag, res, ax: F.ax, ...(g || {}), ...(extra || {}) });
  const ball = (F, p, r, m, tag, res, g) => S.ball(F.P(...p), r, m, opt(F, tag, res, g));
  const box = (F, p, h, m, tag, res, g, rd) => S.box(F.P(...p), h, m, opt(F, tag, res, g, { rd: rd || 0 }));
  const tube = (F, pts, r0, r1, m, tag, res, g) => S.tube(pts.map(p => F.P(...p)), r0, r1, m, { tag, res, ...(g || {}) });
  const lathe = (F, p, h, rf, m, tag, res) => S.lathe(F.P(...p), h, rf, m, { tag, res });
  const torus = (F, p, R, r, m, tag, res) => S.torus(F.P(...p), R, r, m, { tag, res });

  // ---- a thin body: legs (standing, walking or crouched), narrow hips and chest, bony shoulders, a thin neck.
  // o: tag, legTags [l, r] (walking: each leg its own part), crouch, shirt, trous, boot, belt, buckle; returns where things are
  function body(F, o) {
    const tag = o.tag || 'body', G = S.grp(0.045), crouch = o.crouch || 0;
    const TR = o.trous, BO = o.boot;
    const hip = 0.66 - crouch * 0.3;
    for (const s of [-1, 1]) {
      const lt = o.legTags ? o.legTags[s < 0 ? 0 : 1] : tag, fx = s * 0.065;
      if (crouch) {
        const knee = [fx * 1.3, 0.34, 0.26], foot = [fx, 0.05, s > 0 ? 0.08 : 0.13];
        tube(F, [[fx * 0.9, hip, 0], knee], 0.042, 0.04, TR, lt, 0.006, G);
        tube(F, [knee, [foot[0], 0.16, foot[2] - 0.02]], 0.04, 0.036, TR, lt, 0.006);
        boot(F, foot, BO, lt);
      } else {
        tube(F, [[fx, 0.2, -0.005], [fx * 0.95, 0.4, 0.03], [fx * 0.85, hip - 0.02, 0]], 0.036, 0.046, TR, lt, 0.006, G);
        boot(F, [fx, 0, 0], BO, lt);
      }
    }
    ball(F, [0, hip, 0], [0.1, 0.08, 0.075], TR, tag, 0.007, G);
    const ch = hip + 0.31, lean = crouch * 0.1;
    tube(F, [[0, hip + 0.03, 0], [0, hip + 0.2, 0.01 + lean * 0.5], [0, ch, -0.005 + lean]], 0.085, 0.1, o.shirt, tag, 0.007, G);
    ball(F, [0, ch, lean], [0.115, 0.08, 0.08], o.shirt, tag, 0.007, G);
    for (const s of [-1, 1]) ball(F, [s * 0.11, ch + 0.055, lean - 0.005], [0.05, 0.04, 0.05], o.shirt, tag, 0.006, G);
    if (o.belt) { lathe(F, [0, hip + 0.01, 0], 0.04, 0.098, o.belt, tag, 0.005); if (o.buckle) box(F, [0, hip + 0.03, 0.098], [0.025, 0.022, 0.01], o.buckle, tag, 0.004, null, 0.005) }
    const neckTop = [0, ch + 0.16, lean + 0.015];
    tube(F, [[0, ch + 0.06, lean], neckTop], 0.038, 0.04, o.skin, tag, 0.005);
    return { hip, ch, lean, sh: s => [s * 0.13, ch + 0.05, lean], head: [0, ch + 0.27, lean + 0.01], tag };
  }
  function boot(F, at, m, tag) {
    const [x, , z] = at, y = at[1] || 0;
    box(F, [x, y + 0.025, z + 0.035], [0.042, 0.025, 0.085], M.flat([m.r[0]]), tag, 0.006, null, 0.015);
    ball(F, [x, y + 0.06, z + 0.075], [0.042, 0.04, 0.055], m, tag, 0.006);
    lathe(F, [x, y + 0.04, z - 0.005], 0.16, t => 0.045 - 0.008 * t, m, tag, 0.006);
    lathe(F, [x, y + 0.185, z - 0.005], 0.03, 0.05, M.flat(m.r.slice(1, 3)), tag, 0.005);
  }

  // ---- a face: skull, a long jaw, ears, eyes with a glint, brows, a nose, and the hair and beard asked for.
  // o: skin, cheek, eyes ('open' | 'squint' | 'glasses'), brow ramp, beard ('full' | 'long' | 'goatee' | 'mutton' | 'none'), beardRamp,
  //    tash ('droop' | 'handlebar' | 'none'), hair ('none' | 'tuft' | 'long'), nose ('round' | 'long' | 'hook')
  function head(F, H, o) {
    const tag = o.tag || 'body', G = S.grp(0.03), [hx, hy, hz] = H, SK = o.skin;
    const at = (a, y, b) => [hx + a, hy + y, hz + b];
    ball(F, at(0, 0, 0), [0.12, 0.13, 0.12], SK, tag, 0.006, G);
    ball(F, at(0, -0.075, 0.04), [0.088, 0.075, 0.088], SK, tag, 0.006, G);
    for (const s of [-1, 1]) {
      ball(F, at(s * 0.062, -0.03, 0.08), [0.03, 0.024, 0.025], SK, tag, 0.004, G); // cheekbones
      ball(F, at(s * 0.122, -0.015, -0.01), [0.02, 0.034, 0.024], SK, tag, 0.004, G); // ears
      if (o.eyes === 'squint') tube(F, [at(s * 0.065, 0.003, 0.112), at(s * 0.025, 0.003, 0.12)], 0.007, 0.007, M.flat(C.eye), tag, 0.002);
      else {
        ball(F, at(s * 0.045, 0.003, 0.107), [0.021, 0.019, 0.01], M.flat([C.grey[2], C.grey[3]]), tag, 0.002); // the white of the eye
        ball(F, at(s * 0.045, 0.003, 0.112), [0.016, 0.019, 0.01], M.flat(C.eye), tag, 0.002);
        ball(F, at(s * 0.04, 0.01, 0.121), 0.005, M.flat([C.eyeLight]), tag, 0.0015);
      }
      const br = o.brow || C.beard.slice(0, 3);
      tube(F, [at(s * 0.08, 0.035, 0.088), at(s * 0.018, 0.042, 0.116)], 0.017, 0.012, M.flat(br), tag, 0.004);
      if (o.eyes === 'glasses') { torus(F, at(s * 0.045, 0.003, 0.125), 0.027, 0.004, M.metal(C.brass), tag, 0.002) }
    }
    if (o.eyes === 'glasses') tube(F, [at(-0.018, 0.006, 0.128), at(0.018, 0.006, 0.128)], 0.003, 0.003, M.metal(C.brass), tag, 0.002);
    const nose = o.nose || 'round';
    if (nose === 'round') ball(F, at(0, -0.035, 0.112), [0.028, 0.03, 0.028], SK, tag, 0.004, G);
    else if (nose === 'long') tube(F, [at(0, 0.0, 0.11), at(0, -0.045, 0.15)], 0.016, 0.014, SK, tag, 0.004, G);
    else tube(F, [at(0, 0.0, 0.11), at(0, -0.02, 0.15), at(0, -0.05, 0.14)], 0.017, 0.012, SK, tag, 0.004, G);
    ball(F, at(0, -0.085, 0.105), [0.024, 0.01, 0.01], M.flat([C.cheek[0]]), tag, 0.003); // mouth
    const BR = o.beardRamp || C.beard.slice(0, 4), FUR = M.fur(BR, o.furLen ? { len: o.furLen } : null), beard = o.beard || 'none';
    if (beard === 'full' || beard === 'long') {
      ball(F, at(0, -0.135, 0.08), [0.092, 0.075, 0.065], FUR, tag, 0.006);
      ball(F, at(0, -0.2, 0.09), [0.07, 0.07, 0.05], FUR, tag, 0.006);
      for (const s of [-1, 1]) ball(F, at(s * 0.09, -0.075, 0.04), [0.032, 0.055, 0.045], FUR, tag, 0.006);
      if (beard === 'long') { ball(F, at(0, -0.3, 0.09), [0.06, 0.09, 0.045], FUR, tag, 0.006); ball(F, at(0, -0.4, 0.08), [0.04, 0.07, 0.035], FUR, tag, 0.006) }
    } else if (beard === 'goatee') ball(F, at(0, -0.15, 0.09), [0.035, 0.05, 0.035], FUR, tag, 0.005);
    else if (beard === 'mutton') for (const s of [-1, 1]) ball(F, at(s * 0.085, -0.08, 0.05), [0.035, 0.06, 0.05], FUR, tag, 0.005);
    const tash = o.tash || (beard === 'full' || beard === 'long' ? 'droop' : 'none');
    for (const s of [-1, 1]) {
      if (tash === 'droop') tube(F, [at(s * 0.005, -0.055, 0.125), at(s * 0.05, -0.065, 0.115), at(s * 0.075, -0.105, 0.095)], 0.018, 0.01, FUR, tag, 0.004);
      if (tash === 'handlebar') tube(F, [at(s * 0.005, -0.058, 0.125), at(s * 0.06, -0.065, 0.115), at(s * 0.095, -0.045, 0.1), at(s * 0.1, -0.02, 0.095)], 0.016, 0.006, M.flat(BR.slice(0, 3)), tag, 0.003);
    }
    const hair = o.hair || 'none', HR = o.hairRamp || BR;
    if (hair === 'tuft') for (const s of [-1, 1]) ball(F, at(s * 0.11, 0.03, -0.04), [0.03, 0.05, 0.06], M.fur(HR), tag, 0.005);
    if (hair === 'long') ball(F, at(0, -0.02, -0.06), [0.12, 0.13, 0.08], M.fur(HR, { len: 0.04 }), tag, 0.006);
    return { top: at(0, 0.11, 0), brow: at(0, 0.05, 0.1), chin: at(0, -0.15, 0.1), at };
  }

  // ---- an arm from the shoulder, through the elbow, to a hand: sleeve, an optional rolled cuff, bare forearm or full sleeve, and a hand
  function arm(F, sh, el, hand, o) {
    const tag = o.tag, G = S.grp(0.012);
    tube(F, [sh, el], 0.036, 0.032, o.sleeve, tag, 0.006);
    if (o.rolled) { lathe(F, [el[0], el[1] - 0.03, el[2]], 0.04, 0.04, o.cuff || o.sleeve, tag, 0.005); tube(F, [el, hand], 0.028, 0.022, o.skin, tag, 0.005) }
    else { tube(F, [el, hand], 0.032, 0.03, o.sleeve, tag, 0.005); if (o.cuff) ball(F, lerp(el, hand, 0.85), [0.035, 0.035, 0.035], o.cuff, tag, 0.004) }
    ball(F, hand, o.glove ? [0.036, 0.04, 0.036] : [0.03, 0.036, 0.03], o.glove || o.skin, tag, 0.005, G);
    if (o.grip !== false) ball(F, [hand[0], hand[1] + 0.028, hand[2] + 0.02], 0.014, o.glove || o.skin, tag, 0.004, G);
    return hand;
  }
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const elbow = (sh, hand, out) => { const m = lerp(sh, hand, 0.5); return [m[0] + out[0], m[1] + out[1], m[2] + out[2]] };

  // ---- a pickaxe: haft from the grip to the head, the head across it with a point at `tip` and a flat back
  function pick(F, grip, tip, o) {
    const tag = o.tag, head = [tip[0], tip[1] + 0.2, tip[2]], back = [tip[0] - 0.02, tip[1] + 0.4, tip[2]];
    tube(F, [grip, [head[0], head[1] - 0.02, head[2]]], 0.016, 0.019, o.wood || M.wood(C.wood), tag, 0.005);
    ball(F, grip, 0.02, o.wood || M.wood(C.wood), tag, 0.005);
    box(F, head, [0.034, 0.04, 0.034], o.eye || M.metal(C.iron), tag, 0.004, null, 0.008);
    tube(F, [head, [back[0], back[1] - 0.06, back[2]], back], 0.03, 0.014, o.iron || M.metal(C.iron), tag, 0.004);
    tube(F, [head, lerp(head, tip, 0.5), tip], 0.03, 0.005, o.iron || M.metal(C.iron), tag, 0.004);
    ball(F, tip, 0.008, o.tipM || M.flat([C.iron[3]]), tag, 0.003);
    return head;
  }

  // ---- hats
  const hats = {
    helmet(F, top, tag) { const [x, y, z] = top; // the Miner's brass helmet and lamp
      lathe(F, [x, y - 0.02, z], 0.11, t => 0.138 * Math.sqrt(Math.max(0, 1 - t * t)), M.metal(C.brass), tag, 0.006);
      torus(F, [x, y - 0.015, z], 0.142, 0.016, M.metal(C.brass), tag, 0.005);
      lathe(F, [x, y - 0.01, z], 0.012, 0.15, M.flat(C.brass.slice(0, 2)), tag, 0.005);
      tube(F, [[x, y + 0.05, z - 0.13], [x, y + 0.09, z], [x, y + 0.06, z + 0.13]], 0.012, 0.012, M.flat(C.brass.slice(2)), tag, 0.004);
      lathe(F, [x, y + 0.01, z + 0.12], 0.05, 0.034, M.metal(C.iron), tag, 0.004);
      ball(F, [x, y + 0.035, z + 0.16], [0.026, 0.026, 0.012], M.glow(C.lamp), tag, 0.003) },
    brim(F, top, tag) { const [x, y, z] = top; // the Prospector's battered wide hat with a feather in the band
      lathe(F, [x, y - 0.03, z], 0.018, t => 0.21, M.leather(C.hat), tag, 0.006);
      lathe(F, [x, y - 0.02, z], 0.12, t => 0.12 - 0.025 * t, M.leather(C.hat), tag, 0.006);
      lathe(F, [x, y - 0.015, z], 0.025, 0.123, M.flat(C.band), tag, 0.004);
      tube(F, [[x + 0.1, y, z - 0.03], [x + 0.15, y + 0.12, z - 0.08], [x + 0.17, y + 0.2, z - 0.14]], 0.012, 0.004, M.flat(C.feather), tag, 0.003) },
    cap(F, top, tag) { const [x, y, z] = top; // the Carter's tweed flat cap
      ball(F, [x, y - 0.03, z - 0.01], [0.13, 0.05, 0.13], M.cloth(C.tweed, 0.3), tag, 0.006);
      box(F, [x, y - 0.045, z + 0.12], [0.085, 0.01, 0.05], M.cloth(C.tweed, 0.3), tag, 0.005, null, 0.008);
      ball(F, [x, y + 0.012, z - 0.01], 0.012, M.flat(C.tweed.slice(0, 2)), tag, 0.003) },
    bowler(F, top, tag) { const [x, y, z] = top; // the Foreman's bowler
      lathe(F, [x, y - 0.035, z], 0.016, 0.155, M.flat([C.black[0], C.black[1]]), tag, 0.005);
      ball(F, [x, y + 0.0, z], [0.118, 0.1, 0.118], M.cloth(C.black, 0.1), tag, 0.006);
      lathe(F, [x, y - 0.03, z], 0.025, 0.12, M.flat(C.band), tag, 0.004) },
    tophat(F, top, tag) { const [x, y, z] = top; // the Lamplighter's tall hat with a candle stub in the band
      lathe(F, [x, y - 0.035, z], 0.016, 0.15, M.flat([C.black[0], C.black[1]]), tag, 0.005);
      lathe(F, [x, y - 0.03, z], 0.24, t => 0.1 + 0.012 * t, M.cloth(C.black, 0.1), tag, 0.006);
      lathe(F, [x, y - 0.025, z], 0.035, 0.104, M.flat(C.mustard), tag, 0.004);
      lathe(F, [x + 0.08, y - 0.02, z + 0.06], 0.07, 0.014, M.flat(C.wax), tag, 0.003);
      ball(F, [x + 0.08, y + 0.065, z + 0.06], [0.01, 0.018, 0.01], M.glow(C.lamp), tag, 0.002) },
    bandana(F, top, tag) { const [x, y, z] = top; // the Blaster's red bandana, goggles pushed up on it
      ball(F, [x, y - 0.03, z - 0.005], [0.128, 0.07, 0.128], M.cloth(C.red, 0.25), tag, 0.006);
      tube(F, [[x, y - 0.06, z - 0.12], [x + 0.04, y - 0.12, z - 0.2], [x + 0.03, y - 0.2, z - 0.2]], 0.022, 0.01, M.cloth(C.red, 0.25), tag, 0.004);
      lathe(F, [x, y - 0.055, z], 0.025, 0.129, M.leather(C.leather), tag, 0.004);
      for (const s of [-1, 1]) { lathe(F, [x + s * 0.045, y - 0.05, z + 0.1], 0.03, 0.027, M.metal(C.brass), tag, 0.003); ball(F, [x + s * 0.045, y - 0.035, z + 0.125], [0.022, 0.022, 0.006], M.glow(C.lens), tag, 0.002) } },
    wizard(F, top, tag) { const [x, y, z] = top; // the Time Miner's pointed hat, a little bent, with stars
      lathe(F, [x, y - 0.04, z], 0.016, 0.19, M.cloth(C.robe, 0.15), tag, 0.006);
      tube(F, [[x, y - 0.03, z], [x, y + 0.15, z - 0.01], [x - 0.02, y + 0.3, z - 0.05], [x - 0.08, y + 0.38, z - 0.1]], 0.12, 0.008, M.cloth(C.robe, 0.15), tag, 0.006);
      lathe(F, [x, y - 0.025, z], 0.03, 0.121, M.flat(C.brass.slice(1)), tag, 0.004);
      for (const [a, h, b] of [[0.05, 0.1, 0.08], [-0.06, 0.18, 0.05], [0.02, 0.26, -0.02]]) ball(F, [x + a, y + h, z + b], 0.012, M.glow(C.time.slice(1)), tag, 0.002) }
  };

  return { M, rig, body, head, arm, elbow, pick, hats, ball, box, tube, lathe, torus, lerp };
};

// the heroes' own colours, appended to the mine's palette at `base`
module.exports.COLOURS = [
  0x4a2618, 0x7a4430, 0xa8684a, 0xd09070, 0xf0b890, // 0 skin
  0x6a2a22, 0xa84838, 0xd87058, // 5 cheek
  0x3a1c0e, 0x6a3418, 0x9a5226, 0xc87a3a, 0xe8a860, // 8 ginger beard
  0x0f2018, 0x1e3e32, 0x2e6450, 0x4a8a6c, 0x7ab898, // 13 green shirt
  0x1a120e, 0x2a1e18, 0x45342a, 0x65503e, // 18 trousers
  0x24160c, 0x4a2c16, 0x74482a, 0xa06a3e, // 22 leather
  0x120c0a, 0x2a1c14, 0x4a3424, 0x6a4c34, // 26 boots
  0x4a3410, 0x8a6020, 0xc89838, 0xf0d070, // 30 brass
  0x1a1c22, 0x3a3e46, 0x6a707a, 0xb0b8c4, // 34 iron
  0x2a1a10, 0x4a2e1a, 0x6e4628, 0x946238, 0xc08a50, // 38 ash wood
  0xff9a30, 0xffd060, 0xfff2c0, // 43 lamp
  0x100808, 0xfff4e0, // 46 eye, 47 glint
  0x6a5a3a, 0x9a8656, 0xc8b47a, // 48 rope
  0x3a3430, 0x6a625a, 0xa8a098, 0xd8d2c8, // 51 grey-white hair
  0x14161e, 0x24283a, 0x3a4058, 0x5a6280, // 55 black cloth (suits, hats)
  0x101e3a, 0x1e3460, 0x34548a, 0x5a7cb0, // 59 denim blue
  0x3a0a0a, 0x6a1414, 0xa82a1c, 0xe04a30, // 63 red
  0x2a2214, 0x4a3e26, 0x6e5e3c, 0x9a8656, // 67 tweed
  0x5a4210, 0x8a6a20, 0xc09a38, 0xe8c868, // 71 mustard
  0x1a1430, 0x2e2450, 0x4a3a7a, 0x6e5aa8, // 75 robe
  0x7a4ad8, 0xb89aff, 0xf0e8ff, // 79 time glow
  0x2a0e14, 0x541a28, 0x8a2c40, // 82 waistcoat burgundy
  0xe8e0d0, 0xfff8ec, // 85 wax, 86 feather tip
  0x1e7a70, 0x5ae0c8, 0xc8fff4, 0x0a3a36, // 87 phantom glow
  0x9ac8e0, 0xe0f4ff, // 91 lens
  0x2a1810, 0x4a3020, 0x6e4a32, // 93 dark hair
  0x3a2010, 0x6a4026, 0x96633e, 0xbc8858, 0xdcab78, // 96 tan skin
  0x1a0c06, 0x341a0e, 0x55301c, 0x7a4a2e, 0x9c6a48, // 101 deep brown skin
  0x2a140a, 0x4e2a16, 0x784626, 0x9e663c, 0xc08a5a, // 106 brown skin
  0x7a5236, 0xa87a52, 0xd0a074, 0xe8c094, 0xf8dcb8, // 111 light warm skin
  0x08080a, 0x141418, 0x24242a, 0x3a3a42 // 116 black hair
];
module.exports.palette = b => {
  const r = (a, n) => [...Array(n)].map((_, i) => b + a + i);
  return { skin: r(0, 5), cheek: r(5, 3), beard: r(8, 5), shirt: r(13, 5), trous: r(18, 4), leather: r(22, 4), boot: r(26, 4), brass: r(30, 4),
    iron: r(34, 4), wood: r(38, 5), lamp: r(43, 3), eye: [b + 46], eyeLight: b + 47, rope: r(48, 3), grey: r(51, 4), black: r(55, 4),
    denim: r(59, 4), red: r(63, 4), tweed: r(67, 4), mustard: r(71, 4), robe: r(75, 4), time: r(79, 3), waist: r(82, 3), wax: [b + 85, b + 86],
    feather: [b + 85, b + 86], ghost: [b + 90, b + 87, b + 88, b + 89], lens: r(91, 2), dark: r(93, 3), hat: r(22, 4), band: r(63, 3),
    tan: r(96, 5), deep: r(101, 5), brown: r(106, 5), warm: r(111, 5), hairBlack: r(116, 4) };
};
