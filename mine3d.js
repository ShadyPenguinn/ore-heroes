// The mine in live 3D: a lantern-lit cave built in code around KayKit characters (CC0, Kay Lousberg) and KayKit's own animations.
// The game keeps every clock (swings, cart trips, blasts); each frame it tells this scene what each hero is doing, and the 3D heroes follow.
import * as THREE from 'three';
import {load, loadAll, shadows, stage, character, Rig} from './kit3d.js';

export async function start(scene2d) {
  const S3 = stage(scene2d, 'glm'), {scene, proj} = S3;
  scene.background = new THREE.Color(0x070605);
  const rnd = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647 })();
  const col = (r, g, b, k = 1) => new THREE.Color(r * k, g * k, b * k);

  // ---- the cave: a dome of rough rocks around a dirt floor, open to the front ----
  const RX = 7.4, RZ = 5.4, CZ = -.2;
  const wallZ = (x, y) => { const r = 1 - Math.pow(y / 8.5, 2) * .45, rx = RX * r, q = Math.max(0, 1 - (x / rx) ** 2); return CZ - RZ * r * Math.sqrt(q) };
  const TUN = {x0: -2.35, x1: -.85, top: 2.5}; // the tunnel mouth in the back wall
  const rocks = [];
  for (let iy = 0; iy < 16; iy++) { // rows high enough to fill a tall full view
    const y = iy * .72, r = 1 - Math.pow(y / 8.5, 2) * .45, rx = RX * r, rz = RZ * r;
    for (let a = Math.PI - .3; a < 2 * Math.PI + .3; a += .9 / (rx + rz) * 2) {
      const aa = a + (rnd() - .5) * .08, x = rx * Math.cos(aa), z = CZ + rz * Math.sin(aa);
      if (x > TUN.x0 - .1 && x < TUN.x1 + .1 && y < TUN.top && z < -3) continue;
      const s = (.75 + rnd() * .6) * Math.max(.45, 1 - y / 16);
      rocks.push({p: [x, y + (rnd() - .5) * .2, z - .35], s: [s * 1.1, s * .85, s], r: rnd() * 6, c: col(.2, .15, .11, .45 + rnd() * .4)})
    }
  }
  // rubble on the floor, mostly along the walls
  for (let i = 0; i < 70; i++) {
    const a = Math.PI + rnd() * Math.PI, f = .55 + rnd() * .4, x = RX * f * Math.cos(a) * 1.05, z = CZ + RZ * f * Math.sin(a);
    if (x > -4 && x < -.2 && z > -5) continue; // keep the rails clear
    const s = .12 + rnd() * .25; rocks.push({p: [x, s * .3, z], s: [s * 1.3, s, s], r: rnd() * 6, c: col(.22, .17, .12, .7 + rnd() * .5)})
  }
  for (let i = 0; i < 40; i++) { const x = (rnd() - .5) * 18, z = 3.2 + rnd() * 6, s = .1 + rnd() * .3; if (Math.abs(x + 3.2) < 1.2 && z < 4) continue; rocks.push({p: [x, s * .3, z], s: [s * 1.3, s, s], r: rnd() * 6, c: col(.22, .17, .12, .6 + rnd() * .5)}) }
  {
    const g = new THREE.IcosahedronGeometry(1, 0), m = new THREE.MeshStandardMaterial({roughness: 1, flatShading: true});
    const im = new THREE.InstancedMesh(g, m, rocks.length), o = new THREE.Object3D();
    rocks.forEach((k, i) => { o.position.set(...k.p); o.scale.set(...k.s); o.rotation.set(k.r, k.r * 1.7, k.r * .3); o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, k.c) });
    im.castShadow = true; im.receiveShadow = true; scene.add(im)
  }
  const box = (p, s, c, rough = .9, rot) => { const o = new THREE.Mesh(new THREE.BoxGeometry(...s), new THREE.MeshStandardMaterial({color: c, roughness: rough})); o.position.set(...p); if (rot) o.rotation.set(...rot); o.castShadow = o.receiveShadow = true; scene.add(o); return o };
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({color: 0x241a13, roughness: 1})); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; scene.add(f) }
  // the tunnel: a dark passage running back into the rock
  { const tz = wallZ(-1.6, 0); box([-1.6, 1.4, tz - 3.2], [2.0, .2, 6], 0x0c0907); box([-2.6, 1.2, tz - 3.2], [.2, 2.6, 6], 0x0c0907); box([-.6, 1.2, tz - 3.2], [.2, 2.6, 6], 0x0c0907); box([-1.6, 1.3, tz - 6.2], [2.2, 2.8, .2], 0x050403); box([-1.6, 2.6, tz - 3.2], [2.2, .2, 6], 0x0c0907) }
  const WOOD = 0x5a3a1e, WOOD2 = 0x6e4628;
  // timber frames: one over the tunnel mouth, one over the Prospector, one over the Lamplighter
  function frame(x0, x1, z, h) { box([x0, h / 2, z], [.22, h, .22], WOOD); box([x1, h / 2, z], [.22, h, .22], WOOD); box([(x0 + x1) / 2, h + .08, z], [x1 - x0 + .5, .24, .26], WOOD2) }
  const mouthZ = wallZ(-1.6, 0) + .25;
  frame(TUN.x0 - .1, TUN.x1 + .1, mouthZ, 2.45);
  frame(-6.2, -4.0, -3.2, 2.6);
  frame(1.3, 3.3, -3.6, 2.7);

  // the rails, from the heap at the front back into the tunnel
  const PATH = [new THREE.Vector3(-3.0, 0, 2.3), new THREE.Vector3(-1.6, 0, mouthZ + .6), new THREE.Vector3(-1.6, 0, mouthZ - 5)];
  const segs = [PATH[0].distanceTo(PATH[1]), PATH[1].distanceTo(PATH[2])], LEN = segs[0] + segs[1];
  const along = u => { let d = u * LEN; const i = d > segs[0] ? 1 : 0; if (i) d -= segs[0]; const a = PATH[i], b = PATH[i + 1]; return {p: a.clone().lerp(b, d / segs[i]), dir: b.clone().sub(a).normalize()} };
  const G = await loadAll(['Barbarian', 'Hiker', 'Farmer_A', 'Caveman', 'Engineer', 'Lorekeeper', 'Mage', 'pickaxe', 'rocks', 'rocks_gold', 'Copper_Nugget_Large', 'Copper_Nuggets', 'Copper_Bar',
    'train_tender_empty', 'tracks_straight', 'lantern_hanging', 'lantern_standing', 'post_lantern', 'dynamite', 'hourglass', 'bucket_pickaxes', 'crates_stacked', 'barrel_small',
    'anim_tools', 'anim_general', 'anim_move']);
  const clips = [...G.anim_tools.animations, ...G.anim_general.animations, ...G.anim_move.animations];
  const prop = (g, pos, s = 1, ry = 0, parent = scene) => { const o = g.scene.clone(); o.position.set(...pos); o.scale.setScalar(s); o.rotation.y = ry; shadows(o); parent.add(o); return o };

  // the rails: KayKit track pieces laid along the path, stretched a touch so each run ends on a whole piece
  for (let i = 0; i < 2; i++) {
    const a = PATH[i], b = PATH[i + 1], d = b.clone().sub(a), L = d.length(), n = Math.max(1, Math.round(L / 1.8)), ang = Math.atan2(d.x, d.z);
    for (let k = 0; k < n; k++) { const o = prop(G.tracks_straight, [0, 0, 0], 1.8, ang); o.scale.z = L / n; o.position.copy(a.clone().lerp(b, (k + .5) / n)); o.traverse(m => { if (m.isMesh) m.castShadow = false }) }
  }
  // odds and ends: a bucket of picks, crates and a barrel by the heap
  prop(G.bucket_pickaxes, [-6.1, 0, 1.3], .55, .6);
  prop(G.crates_stacked, [6.4, 0, -.6], .55, -.5);
  prop(G.barrel_small, [-6.3, 0, -.4], .6, 0);

  // the copper vein in the back wall, the Miner's boulder, the Prospector's rock and the ore heap
  const copper = new THREE.MeshStandardMaterial({color: 0xd88038, emissive: 0x4a1e08, roughness: .55, metalness: .3, flatShading: true});
  for (let i = 0; i < 16; i++) { const x = .3 + rnd() * 2.6, y = 1.3 + rnd() * 2.4, s = .14 + rnd() * .2, o = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), copper); o.position.set(x, y, wallZ(x, y) + .15); o.rotation.set(rnd() * 3, rnd() * 3, 0); scene.add(o) }
  prop(G.rocks_gold, [1.25, 0, -.4], 1.0, .4);
  prop(G.rocks, [-6.0, 0, -2.6], 1.1, 1.2);
  for (let i = 0; i < 9; i++) prop(G.Copper_Nugget_Large, [-4.3 + (rnd() - .5) * 1.1, rnd() * .12, 2.5 + (rnd() - .5) * .8], .8 + rnd() * .5, rnd() * 6);
  prop(G.Copper_Bar, [-4.9, 0, 1.6], 1, .5);

  // the cart, with its load of ore when it comes back full
  const cart = new THREE.Group(); scene.add(cart);
  prop(G.train_tender_empty, [0, 0, 0], 2, 0, cart);
  const load3 = prop(G.Copper_Nuggets, [0, .62, 0], .8, 0, cart);

  // the dynamite bundle and its fuse
  const DYN = new THREE.Vector3(5.4, 0, 1.6), FUSE0 = new THREE.Vector3(4.2, .03, 2.4);
  prop(G.dynamite, [DYN.x, 0, DYN.z], .28, .4);
  const fuse = new THREE.Mesh(new THREE.BoxGeometry(1, .025, .025), new THREE.MeshStandardMaterial({color: 0x4a3a2e})); scene.add(fuse);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), new THREE.MeshBasicMaterial({color: 0xfff2c0})); scene.add(spark);
  const sparkLight = new THREE.PointLight(0xffb050, 0, 2, 2); scene.add(sparkLight);
  const boom = new THREE.PointLight(0xffd090, 0, 9, 1.6); boom.position.set(5.3, 1.2, 1.8); scene.add(boom);

  // the lantern post by the boulder
  prop(G.post_lantern, [3.75, 0, -1.2], .8, -Math.PI / 2);
  // the hourglass on the Time Miner's ledge
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(2.2, .8, 1.4), new THREE.MeshStandardMaterial({color: 0x2a2018, roughness: 1, flatShading: true})); ledge.position.set(4.9, .4, -3.3); ledge.castShadow = ledge.receiveShadow = true; scene.add(ledge);
  const glass = new THREE.Group(); glass.position.set(5.6, .8, -3.1); scene.add(glass);
  { const g = prop(G.hourglass, [0, -.32, 0], .32, 0, glass); glass.position.y = .8 + .32 } // turns about its middle
  const timeLight = new THREE.PointLight(0xb89aff, 0, 4, 1.8); timeLight.position.set(5.2, 1.6, -2.6); scene.add(timeLight);

  // the light: a dim key for shadows, and the lanterns doing most of the work
  scene.add(new THREE.HemisphereLight(0x6a6a7a, 0x1a120c, .3));
  const key = new THREE.DirectionalLight(0xffd8b0, .35); key.position.set(3, 9, 7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {left: -9, right: 9, top: 7, bottom: -6, near: 1, far: 30}); key.shadow.bias = -.0005; scene.add(key);
  const POST = [3.45, 2.1, -1.2];
  const MOUTH = [-1.6, 2.15, mouthZ + .12]; // the Carter walks right under this one: keep it softer
  const LANTERNS = [[-5.1, 2.25, -3.05], MOUTH, [2.3, 2.35, -3.45], POST].map(p => {
    if (p !== POST) { const o = prop(G.lantern_hanging, [p[0], p[1] - .35, p[2]], .42); o.traverse(m => { if (m.isMesh) m.castShadow = false }) }
    const l = new THREE.PointLight(0xffb060, 8, 7, 1.6); l.position.set(p[0], p[1] - .2, p[2] + .4); l.k = p === MOUTH ? .55 : 1; scene.add(l); return l
  });
  { const n = new THREE.PointLight(0xffa860, 4, 12, 1.4); n.position.set(0, 2.5, 6.5); scene.add(n) } // a faint glow on the floor near the front
  const front = new THREE.PointLight(0xffc890, 6, 8, 1.5); front.position.set(.6, 2.6, 1.8); scene.add(front); // a little light on the Miner

  // ---- the heroes ----
  const tool = G.pickaxe.scene, lantern = G.lantern_standing.scene;
  const H = {
    miner: {root: character(scene, G.Barbarian, [0, 0, -.4], Math.PI / 2, tool)},
    pros: {root: character(scene, G.Hiker, [-5.0, 0, -2.5], -Math.PI / 2 - .2, tool)},
    boss: {root: character(scene, G.Farmer_A, [-3.8, 0, -.5], Math.PI / 2 - .2)},
    blast: {root: character(scene, G.Engineer, [4.5, 0, 1.4], Math.PI / 2 + .2, null)},
    lamp: {root: character(scene, G.Lorekeeper, [2.7, 0, -2.9], 0, lantern, .3)},
    time: {root: character(scene, G.Mage, [4.5, .8, -3.3], .2, null)},
    carter: {root: character(scene, G.Caveman, [0, 0, 0], 0, null)},
  };
  for (const h of Object.values(H)) h.rig = new Rig(h.root, clips);
  // the Phantom Pick: a ghostly pickaxe swinging at the vein on its own
  const ghost = new THREE.Group(); ghost.position.set(1.0, 2.4, wallZ(1, 2.4) + 1.0); scene.add(ghost);
  { const g = tool.clone(); g.traverse(n => { if (n.isMesh) n.material = new THREE.MeshStandardMaterial({color: 0x8affe0, emissive: 0x5ae0c8, emissiveIntensity: 1.4, transparent: true, opacity: .8}) }); g.scale.setScalar(1.6); g.position.set(0, -.4, 0); ghost.add(g) }
  const ghostLight = new THREE.PointLight(0x8affe0, 0, 3.5, 1.8); ghostLight.position.copy(ghost.position).add(new THREE.Vector3(0, 0, .6)); scene.add(ghostLight);

  // how each hero shows the game's clip: seg is the clip segment, k how far through it (0-1), c a running clock
  const PICK = (r, seg, k, c) => seg === 'strike' ? r.pose('strike', 'Pickaxing', 1.93 + .2 * k, .05) : seg === 'recover' ? r.pose('rec', 'Pickaxing', 1.2 + .4 * k, .07) : r.pose('ready', 'Pickaxing', 1.62 + .25 * (.5 + .5 * Math.sin(c * 2)), .15);
  const ONE = (idle, idleLen, act, from, len) => (r, seg, k, c) => seg === 'idle' ? r.pose('idle', idle, c % idleLen, .2) : r.pose('act', act, from + k * len, .12);
  const POSE = {miner: PICK, pros: PICK, boss: ONE('Idle_B', 2.13, 'Use_Item', .1, 1.0), blast: ONE('Idle_A', 1.07, 'PickUp', 0, .6), lamp: ONE('Holding_A', 1, 'Interact', 0, 1.3), time: ONE('Idle_B', 2.13, 'Use_Item', .1, 1.0)};

  const anchors = {
    miner: {pop: proj(1.2, 2.2, -.4), hit: proj(.95, .9, -.4)},
    pros: {pop: proj(-5.9, 2.1, -2.5), hit: proj(-5.8, .8, -2.5), sign: proj(-5.0, 0, -2.5)},
    phantom: {pop: proj(1.2, 3.6, ghost.position.z), hit: proj(1.2, 1.9, ghost.position.z - .4), sign: proj(1.0, 1.2, ghost.position.z), glow: proj(1.0, 2.2, ghost.position.z)},
    carter: {pop: proj(-4.3, 1.4, 2.5), hit: proj(-4.3, .4, 2.5), sign: proj(-3.6, 0, 2.6)},
    foreman: {sign: proj(-3.8, 0, -.5)},
    time: {sign: proj(4.6, .8, -3.3), glow: proj(5.2, 1.4, -3)},
    blaster: {pop: proj(5.4, 1.8, 1.6), hit: proj(5.4, .3, 1.6), sign: proj(4.5, 0, 1.4)},
    lamp: {sign: proj(2.7, 0, -2.9)},
  };
  let t = 0;
  const v = new THREE.Vector3();
  return {
    anchors,
    // s: {hired:{key:bool}, a:{key:{seg,k}}, cart: trip 0-1, lamp: Lamplighter level, fuse: 0-1, boomT, shake}
    render(dt, ox, s) {
      t += dt;
      for (const [k, h] of Object.entries(H)) {
        const on = k === 'miner' || !!s.hired[k]; h.root.visible = on; if (!on) continue;
        if (POSE[k]) { const a = s.a[k]; POSE[k](h.rig, a.seg, a.k, t + k.length) }
        h.rig.update(dt)
      }
      // the cart: in along the rails empty, a moment out of sight, back out full
      const p = s.cart, H2 = H.carter;
      if (p == null) { const o = along(0); cart.position.copy(o.p); cart.rotation.y = Math.atan2(o.dir.x, o.dir.z); load3.visible = false }
      else {
        const u = p < .42 ? p / .42 : p < .58 ? 1 : 1 - (p - .58) / .42, out = p >= .5, o = along(Math.min(1, u * 1.0));
        cart.position.copy(o.p); cart.rotation.y = Math.atan2(o.dir.x, o.dir.z); load3.visible = out; cart.visible = u < .97;
        const dir = out ? o.dir.clone().negate() : o.dir, moving = p < .42 || p > .58;
        H2.root.position.copy(o.p).addScaledVector(dir, -1.05); H2.root.rotation.y = Math.atan2(dir.x, dir.z); H2.root.visible = !!s.hired.carter && u < .9;
        H2.rig.pose(moving ? 'walk' : 'idle', moving ? 'Walking_A' : 'Idle_A', moving ? t % 1.07 : t % 1.07, .2); H2.rig.update(dt)
      }
      // the phantom pick: raised, a quick swing, back up
      { const a = s.a.phantom, ang = a.seg === 'strike' ? 1.1 - 1.9 * a.k : a.seg === 'recover' ? -.8 + 1.9 * a.k : 1.1 + .08 * Math.sin(t * 2);
        ghost.visible = !!s.hired.phantom; ghost.rotation.z = ang; ghost.position.y = 2.4 + .08 * Math.sin(t * 1.6); ghostLight.intensity = s.hired.phantom ? 3 + Math.sin(t * 3) : 0 }
      // the lanterns burn brighter with the Lamplighter's levels
      const L = s.lamp || 0; LANTERNS.forEach((l, i) => l.intensity = l.k * (7 + Math.min(8, L * .35)) * (1 + .06 * Math.sin(t * 2.3 + i * 1.7)));
      // the fuse burns down to the bundle, then the blast
      if (s.hired.blaster && s.fuse >= 0 && s.boomT > .5) {
        v.copy(FUSE0).lerp(DYN.clone().setY(.03), s.fuse); const d = DYN.clone().setY(.03).sub(v), L2 = d.length();
        fuse.visible = spark.visible = L2 > .02; fuse.scale.x = Math.max(.001, L2); fuse.position.copy(v).addScaledVector(d, .5); fuse.rotation.y = -Math.atan2(d.z, d.x);
        spark.position.copy(v); sparkLight.position.copy(v).setY(.3); sparkLight.intensity = 2 + Math.random() * 2
      } else { fuse.visible = spark.visible = false; sparkLight.intensity = 0 }
      boom.intensity = s.boomT < .4 ? 60 * (1 - s.boomT / .4) : 0;
      const tm = H.time.root.visible; glass.visible = tm; timeLight.intensity = tm ? 3 + (s.a.time.seg === 'turn' ? 4 : 0) + Math.sin(t * 1.5) : 0;
      if (tm && s.a.time.seg === 'turn') glass.rotation.z = Math.PI * s.a.time.k; else glass.rotation.z = 0;
      S3.draw(ox, s.shake)
    },
    hide: S3.hide,
    _dbg: {scene, H, THREE}
  }
}
