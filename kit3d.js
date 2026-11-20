// Shared pieces for the live 3D scenes (forge3d.js, mine3d.js): model loading, the stage (a WebGL canvas under the game's 2D canvas)
// and Rig, which poses a KayKit character from the game's own clip clocks.
import * as THREE from 'three';
import {GLTFLoader} from './lib/addons/loaders/GLTFLoader.js';

export const W = 480, H = 210;
const BASE = window.OH_MODELS || 'models/';
const loader = new GLTFLoader();
// the Claude copy can't serve .glb files, so there each model comes as base64 inside a .json file
export async function load(name) {
  if (window.OH_MODELS_JSON) {
    const {glb} = await (await fetch(BASE + name + '.json')).json();
    const bin = Uint8Array.from(atob(glb), c => c.charCodeAt(0)).buffer;
    return new Promise((ok, bad) => loader.parse(bin, '', ok, bad));
  }
  return new Promise((ok, bad) => loader.load(BASE + name + '.glb', ok, undefined, bad));
}
export const loadAll = async names => Object.fromEntries((await Promise.all(names.map(load))).map((g, i) => [names[i], g]));
export const shadows = o => o.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true } });

// a canvas under the 2D one, the renderer, and the camera every scene shares: a 50 mm lens across the width
export function stage(scene2d, id) {
  const canvas = document.createElement('canvas');
  canvas.id = id;
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;image-rendering:auto';
  scene2d.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0807);
  const cam = new THREE.PerspectiveCamera(30, W / H, .1, 100);
  cam.fov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(19.8)) / (W / H)) * 180 / Math.PI;
  const CAM = new THREE.Vector3(0, 5.2, 17), LOOK = new THREE.Vector3(0, 2.1, -0.6);
  cam.position.copy(CAM); cam.lookAt(LOOK); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  const v = new THREE.Vector3();
  const proj = (x, y, z) => { v.set(x, y, z).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H] };
  const resize = () => { const r = canvas.getBoundingClientRect(); if (r.width) renderer.setSize(r.width, r.height, false) };
  new ResizeObserver(resize).observe(scene2d); resize();
  let shown = false;
  return {
    canvas, renderer, scene, cam, proj,
    // ox: the scene's offset in 480-wide units while the places slide; shake: the game's shake timer
    draw(ox, shake) {
      if (!shown) { canvas.style.display = ''; shown = true; resize() }
      canvas.style.transform = ox ? `translateX(${ox / W * 100}%)` : '';
      const j = shake ? .25 * shake : 0;
      cam.position.set(CAM.x + (Math.random() - .5) * j, CAM.y + (Math.random() - .5) * j, CAM.z);
      renderer.render(scene, cam)
    },
    hide() { if (shown) { canvas.style.display = 'none'; shown = false } }
  }
}

// a character placed in the scene, with an optional tool in the right hand and an optional tint
export function character(scene, gltf, pos, rotY, held, heldS = 1, tint) {
  const root = gltf.scene; root.position.set(...pos); root.rotation.y = rotY;
  root.traverse(n => {
    if (/^Icosphere/.test(n.name)) n.visible = false;
    if (tint && n.isMesh) { n.material = n.material.clone(); n.material.color.multiply(new THREE.Color(tint)) }
  });
  shadows(root); scene.add(root);
  if (held) { const h = held.clone(); h.scale.setScalar(heldS); shadows(h); root.getObjectByName('handslotr').add(h) }
  return root
}

// Rig: the game says which clip and which moment to show; Rig blends between them over a short fade
export class Rig {
  constructor(root, clips) { this.mix = new THREE.AnimationMixer(root); this.clips = clips; this.acts = {}; this.target = null }
  act(key, name) {
    let a = this.acts[key];
    if (!a) {
      const c = this.clips.find(c => c.name === name), dup = Object.values(this.acts).some(x => x.getClip() === c);
      a = this.mix.clipAction(dup ? c.clone() : c); a.play(); a.timeScale = 0; a.w = 0; a.setEffectiveWeight(0); this.acts[key] = a
    }
    return a
  }
  // show clip `name` at `time` seconds, under the name `key` (each key fades on its own)
  pose(key, name, time, fade = .12) {
    const a = this.act(key, name); a.time = time;
    if (this.target === null) a.w = 1;
    this.target = key; this.fade = fade
  }
  update(dt) {
    for (const [k, a] of Object.entries(this.acts)) {
      a.w = Math.max(0, Math.min(1, a.w + (k === this.target ? 1 : -1) * dt / this.fade));
      a.setEffectiveWeight(a.w)
    }
    this.mix.update(0)
  }
}
