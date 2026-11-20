// The forge in live 3D: KayKit models (CC0, Kay Lousberg) with KayKit's own animations, drawn by three.js under the game's 2D canvas.
// The game keeps running its forge logic; this only draws. If WebGL or the models fail, the game keeps its 2D forge.
import * as THREE from 'three';
import {GLTFLoader} from './lib/addons/loaders/GLTFLoader.js';

const W = 480, H = 210;
const BASE = window.OH_MODELS || 'models/';
const loader = new GLTFLoader();
// the Claude copy can't serve .glb files, so there each model comes as base64 inside a .json file
async function load(name) {
  if (window.OH_MODELS_JSON) {
    const {glb} = await (await fetch(BASE + name + '.json')).json();
    const bin = Uint8Array.from(atob(glb), c => c.charCodeAt(0)).buffer;
    return new Promise((ok, bad) => loader.parse(bin, '', ok, bad));
  }
  return new Promise((ok, bad) => loader.load(BASE + name + '.glb', ok, undefined, bad));
}
const shadows = o => o.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true } });

export async function start(scene2d) {
  const canvas = document.createElement('canvas');
  canvas.id = 'gl';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;image-rendering:auto';
  scene2d.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0807);
  // the same framing as the game's other scenes: a 50 mm lens across the width
  const cam = new THREE.PerspectiveCamera(30, W / H, .1, 100);
  cam.fov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(19.8)) / (W / H)) * 180 / Math.PI;
  const CAM = new THREE.Vector3(0, 5.2, 17), LOOK = new THREE.Vector3(0, 2.1, -0.6);
  cam.position.copy(CAM); cam.lookAt(LOOK); cam.updateProjectionMatrix(); cam.updateMatrixWorld();

  // lights: a warm furnace glow, lamps over each workplace, a cool fill and one shadow-casting key
  scene.add(new THREE.HemisphereLight(0x8a8a9a, 0x20160f, .45));
  const key = new THREE.DirectionalLight(0xffe2c4, .9); key.position.set(3, 9, 7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {left: -9, right: 9, top: 6, bottom: -6, near: 1, far: 30}); key.shadow.bias = -.0005; scene.add(key);
  const furnace = new THREE.PointLight(0xff7a2a, 34, 6.5, 1.8); furnace.position.set(-1.2, 1.0, -2.2); scene.add(furnace);
  for (const [x, z, i] of [[1.2, .4, 9], [-4.6, 0, 8], [4.3, -2.8, 6]]) { const l = new THREE.PointLight(0xffb070, i, 7, 1.6); l.position.set(x, 2.7, z); scene.add(l) }
  const flash = new THREE.PointLight(0xffc070, 0, 4, 2); flash.position.set(1.3, 1.2, -.1); scene.add(flash); // the strike's flash

  // the room: flagstones, stone walls and timber, as instanced blocks
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647 })();
  function blocks(list, col, rough = 1) {
    const g = new THREE.BoxGeometry(1, 1, 1), m = new THREE.MeshStandardMaterial({roughness: rough});
    const im = new THREE.InstancedMesh(g, m, list.length), o = new THREE.Object3D(), c = new THREE.Color();
    list.forEach(([p, s, cc], i) => { o.position.set(...p); o.scale.set(...s); o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, c.setRGB(...(cc || col))) });
    im.castShadow = true; im.receiveShadow = true; scene.add(im); return im
  }
  const floor = [], wall = [], wood = [];
  for (let ix = -7; ix < 8; ix++) for (let iy = -3; iy < 5; iy++) { const k = .85 + rnd() * .3, b = (ix * 7 + iy * 3) % 3 ? [.16, .13, .11] : [.20, .16, .13]; floor.push([[ix + (iy % 2 ? .5 : 0), -.05, -iy], [.96, .1, .96], b.map(v => v * k)]) }
  for (let iz = 0; iz < 8; iz++) for (let ix = -8; ix < 9; ix++) { const k = .85 + rnd() * .3, b = (ix + iz) % 3 ? [.20, .17, .15] : [.26, .22, .19]; wall.push([[ix * 1.1 + (iz % 2) * .55, .35 + iz * .72, -4.6], [1.06, .68, .6], b.map(v => v * k)]) }
  for (const sx of [-8.2, 8.2]) for (let iz = 0; iz < 6; iz++) for (let iy = -3; iy < 5; iy++) { const k = .85 + rnd() * .3, b = (iy + iz) % 3 ? [.20, .17, .15] : [.26, .22, .19]; wall.push([[sx, .35 + iz * .72, -(iy * 1.1 + (iz % 2) * .55)], [.6, .68, 1.06], b.map(v => v * k)]) }
  for (const x of [-5.5, 0, 5.5]) wood.push([[x, 2.2, -4.15], [.3, 4.4, .3]]);
  wood.push([[0, 4.25, -4.15], [16, .32, .32]]);
  // the weapon rack on the back wall, and the work table by the grindstone
  wood.push([[4.3, 1.9, -4.05], [2.6, .18, .15], [.42, .25, .13]], [[4.3, .9, -4.05], [2.6, .18, .15], [.42, .25, .13]], [[3.1, 1.1, -4.0], [.16, 2.2, .16]], [[5.5, 1.1, -4.0], [.16, 2.2, .16]]);
  wood.push([[-6.4, .85, -1.6], [1.3, .1, .8], [.42, .25, .13]]);
  for (const dx of [-.55, .55]) for (const dy of [-.32, .32]) wood.push([[-6.4 + dx, .4, -1.6 - dy], [.1, .8, .1]]);
  blocks(floor, [.16, .13, .11]); blocks(wall, [.2, .17, .15]); blocks(wood, [.33, .19, .10], .9);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({color: 0x1a120d, roughness: 1})); f.rotation.x = -Math.PI / 2; f.position.y = -.12; f.receiveShadow = true; scene.add(f) }

  const names = ['furnace_forge', 'anvil', 'bucket_metal', 'tongs', 'grindstone', 'rocks', 'rocks_gold', 'Copper_Bar', 'sword_A', 'hammer', 'Barbarian', 'Knight', 'Engineer', 'Druid', 'anim_tools', 'anim_general'];
  const G = Object.fromEntries((await Promise.all(names.map(load))).map((g, i) => [names[i], g]));
  const clips = [...G.anim_tools.animations, ...G.anim_general.animations], clip = n => clips.find(c => c.name === n);
  function prop(name, pos, s = 1, rot = [0, 0, 0]) { const o = G[name].scene.clone(); o.position.set(...pos); o.scale.setScalar(s); o.rotation.set(...rot); shadows(o); scene.add(o); return o }
  prop('furnace_forge', [-1.2, 0, -3.1]);
  scene.traverse(n => { if (n.isMesh && n.material && /glow/i.test(n.material.name)) { n.material = n.material.clone(); n.material.emissive = new THREE.Color(0xff8a30); n.material.emissiveIntensity = 2.2; n.castShadow = false } });
  prop('anvil', [1.2, 0, -.6], .8);
  prop('bucket_metal', [2.6, 0, -1.6], .7);
  prop('tongs', [2.15, .72, -.35], .7, [0, Math.PI / 2, 0]);
  prop('rocks', [-7, 0, -3.4], .9); prop('rocks_gold', [7, 0, -3.3], .8);
  prop('Copper_Bar', [2.9, 0, -3.5]); prop('Copper_Bar', [3.2, .2, -3.6], 1, [0, .35, 0]);
  prop('sword_A', [-6.4, .93, -1.6], .9, [-Math.PI / 2, 0, Math.PI / 2]);
  // the hot blank on the anvil
  const blank = new THREE.Mesh(new THREE.BoxGeometry(.7, .06, .14), new THREE.MeshStandardMaterial({color: 0x501808, emissive: 0xff6a20, emissiveIntensity: 2.4}));
  blank.position.set(1.15, .66, -.5); blank.visible = false; scene.add(blank);
  const blankLight = new THREE.PointLight(0xff6a20, 0, 2.5, 2); blankLight.position.set(1.2, 1.0, -.2); scene.add(blankLight);

  // the rack: your best weapon of each kind. Only swords and hammers have KayKit models; the rest are simple shapes for now.
  const steel = new THREE.MeshStandardMaterial({color: 0xb8c0c8, metalness: .6, roughness: .4}), haft = new THREE.MeshStandardMaterial({color: 0x5a3a20, roughness: .9});
  function shape(w) {
    const g = new THREE.Group(), m = (geo, mat, p, r) => { const o = new THREE.Mesh(geo, mat); o.position.set(...p); if (r) o.rotation.set(...r); g.add(o) };
    if (w === 'axe') { m(new THREE.CylinderGeometry(.04, .04, 1.3), haft, [0, .65, 0]); m(new THREE.BoxGeometry(.38, .3, .05), steel, [.16, 1.15, 0]) }
    if (w === 'spear') { m(new THREE.CylinderGeometry(.03, .03, 1.7), haft, [0, .85, 0]); m(new THREE.ConeGeometry(.08, .32, 6), steel, [0, 1.85, 0]) }
    if (w === 'shield') { m(new THREE.CylinderGeometry(.45, .45, .08, 20), steel, [0, .9, 0], [Math.PI / 2, 0, 0]); m(new THREE.CylinderGeometry(.36, .36, .1, 20), haft, [0, .9, .01], [Math.PI / 2, 0, 0]) }
    shadows(g); return g
  }
  const RACK = {sword: 3.6, axe: 4.05, spear: 4.5, shield: 4.95, hammer: 5.3}, rack = {};
  for (const [w, x] of Object.entries(RACK)) {
    const o = w === 'sword' ? G.sword_A.scene.clone() : w === 'hammer' ? G.hammer.scene.clone() : shape(w);
    if (w === 'sword') { o.scale.setScalar(.95); o.position.set(x, .45, -3.85) } else if (w === 'hammer') { o.scale.setScalar(1.1); o.position.set(x, .3, -3.85) } else o.position.set(x, .1, -3.8);
    shadows(o); o.visible = false; scene.add(o); rack[w] = o
  }

  // the characters, on KayKit's shared rig
  function hero(file, pos, rotY, held, heldS = 1) {
    const root = G[file].scene; root.position.set(...pos); root.rotation.y = rotY;
    root.traverse(n => { if (/^Icosphere/.test(n.name)) n.visible = false }); shadows(root); scene.add(root);
    if (held) { const h = G[held].scene.clone(); h.scale.setScalar(heldS); shadows(h); root.getObjectByName('handslotr').add(h) }
    return {root, mix: new THREE.AnimationMixer(root)}
  }
  // the Blacksmith: a raised hammer while a blank is hot, then a swing that lands on the anvil
  const smith = hero('Barbarian', [.45, 0, -1.0], Math.PI / 2, 'hammer');
  const HIT = 1.567, TOP = 1.2, NEXT_TOP = 2.53; // in the Hammering clip: the hammer is up at 1.2 s and lands at 1.567 s
  const hammerClip = clip('Hammering'), swings = [smith.mix.clipAction(hammerClip), smith.mix.clipAction(hammerClip.clone())];
  const sIdle = smith.mix.clipAction(clip('Idle_A'));
  for (const a of swings) { a.setLoop(THREE.LoopRepeat); a.enabled = true; a.setEffectiveWeight(0); a.play() }
  sIdle.play();
  let cur = 0, ready = false, onHit = null, hitT = 0, fadeDir = 0;
  function setReady(on) {
    if (on === ready) return; ready = on; const a = swings[cur];
    if (on) { a.time = TOP; a.timeScale = 0; a.setEffectiveWeight(1); a.crossFadeFrom(sIdle, .25, false); }
    else { if (onHit) { onHit(); onHit = null } sIdle.reset().play(); sIdle.crossFadeFrom(a, .35, false) }
  }
  function strike(cb) {
    if (!ready) setReady(true);
    const old = swings[cur]; cur ^= 1; const a = swings[cur];
    a.reset(); a.play(); a.time = TOP + .02; a.timeScale = 2.6; a.setEffectiveWeight(1); a.crossFadeFrom(old, .07, false);
    if (onHit) onHit(); onHit = cb; hitT = 0
  }
  function smithStep(dt) {
    const a = swings[cur];
    if (ready && a.timeScale > 0) {
      if (onHit && a.time >= HIT) { onHit(); onHit = null; flash.intensity = 14 }
      if (a.time >= HIT) a.timeScale = 1.5;
      if (a.time >= NEXT_TOP) { a.time = TOP; a.timeScale = 0 }
    }
    flash.intensity = Math.max(0, flash.intensity - dt * 70);
  }

  // the station smiths: the Swordsmith hones at the grindstone and stops now and then to look the blade over
  const STN = {
    sword: {file: 'Knight', pos: [-4.4, 0, -1.75], rot: 0, held: 'sword_A', s: .6, work: 'Sawing', alt: 'Holding_A', prop: () => prop('grindstone', [-4.4, 0, -.6], .8)},
    axe: {file: 'Engineer', pos: [6.3, 0, -1.2], rot: -Math.PI / 2, work: 'Working_A', alt: 'Working_C', prop: () => prop('anvil', [5.4, 0, -1.2], .7)},
    spear: {file: 'Druid', pos: [-2.8, 0, -.2], rot: Math.PI / 2, work: 'Working_B', alt: 'Holding_A', prop: () => prop('anvil', [-1.9, 0, -.2], .7)},
    shield: {file: 'Knight', pos: [3.4, 0, .6], rot: -Math.PI / 2, work: 'Working_C', alt: 'Holding_A', prop: () => prop('anvil', [2.6, 0, .6], .7)},
    hammer: {file: 'Barbarian', pos: [-6.6, 0, .4], rot: Math.PI / 2, work: 'Working_A', alt: 'Working_B', prop: () => prop('anvil', [-5.7, 0, .4], .7)},
  };
  const st = {}, used = new Set(['Barbarian']);
  for (const [w, d] of Object.entries(STN)) {
    // a model used twice (a second Knight or Barbarian) needs its own copy
    if (used.has(d.file)) G[d.file] = await load(d.file); used.add(d.file);
    const h = hero(d.file, d.pos, d.rot, d.held, d.s);
    st[w] = {h, d, propObj: d.prop(), work: h.mix.clipAction(clip(d.work)), alt: h.mix.clipAction(clip(d.alt)), altT: 0};
    st[w].work.play()
  }
  function act(w, kind) {
    const s = st[w]; if (!s || !s.h.root.visible) return;
    s.alt.reset().play(); s.alt.crossFadeFrom(s.work, .3, false); s.altT = kind === 'study' ? 2.6 : 1.6
  }

  const v = new THREE.Vector3();
  function proj(x, y, z) { v.set(x, y, z).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H] }
  // where the game draws its 2D effects over the 3D scene
  const anchors = {hit: proj(1.22, .7, -.49), pop: proj(1.2, 1.9, -.5), sign: {}, rack: {}};
  for (const [w, d] of Object.entries(STN)) anchors.sign[w] = proj(d.pos[0], 0, d.pos[2]);
  for (const [w, x] of Object.entries(RACK)) anchors.rack[w] = proj(x, 1.3, -3.8);

  const resize = () => { const r = canvas.getBoundingClientRect(); if (r.width) renderer.setSize(r.width, r.height, false) };
  new ResizeObserver(resize).observe(scene2d); resize();
  let shown = false, t = 0;
  return {
    anchors, strike, act, _dbg: {scene, cam, smith, swings, THREE},
    // ox: the scene's offset in 480-wide units while the places slide; st: what the game shows this frame
    render(dt, ox, s) {
      t += dt;
      if (!shown) { canvas.style.display = ''; shown = true; resize() }
      canvas.style.transform = ox ? `translateX(${ox / W * 100}%)` : '';
      setReady(!!s.hot); blank.visible = !!s.hot; blankLight.intensity = s.hot ? 5 + Math.sin(t * 6) : 0;
      for (const [w, d] of Object.entries(st)) {
        const open = !!s.open[w], hired = !!s.hired[w]; d.propObj.visible = open; d.h.root.visible = open && hired;
        if (d.altT > 0 && (d.altT -= dt) <= 0) { d.work.reset().play(); d.work.crossFadeFrom(d.alt, .3, false) }
        if (d.h.root.visible) d.h.mix.update(dt)
      }
      for (const w in rack) rack[w].visible = !!s.best[w];
      smithStep(dt); smith.mix.update(dt);
      furnace.intensity = 40 + 6 * Math.sin(t * 11) + 4 * Math.sin(t * 27);
      cam.position.set(CAM.x + (s.shake ? (Math.random() - .5) * .25 * s.shake : 0), CAM.y + (s.shake ? (Math.random() - .5) * .25 * s.shake : 0), CAM.z);
      renderer.render(scene, cam)
    },
    hide() { if (shown) { canvas.style.display = 'none'; shown = false } }
  }
}
