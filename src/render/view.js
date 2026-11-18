// The 3D view: renderer, isometric camera, lights, landscape, buildings, units and effects.
import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { TILE, makeBuilding } from './art.js';
import { buildTerrain, Resources } from './terrain.js';
import { UnitMeshes } from './units.js';
import { Effects } from './effects.js';

const DIR = new THREE.Vector3(1, 0.816, 1).normalize();
const lin = c => new THREE.Color(c).convertSRGBToLinear();

export class View {
  constructor(canvas, world, quality = 'high') {
    this.world = world; this.size = world.size;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: quality === 'high', powerPreference: 'high-performance' });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.background = lin('#9cc8e8');
    this.scene.fog = new THREE.Fog(this.scene.background, 60, 140);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    this.zoom = Math.min(innerWidth, innerHeight) < 500 ? 18 : 22; this.target = new THREE.Vector3();
    this.hemi = new THREE.HemisphereLight(lin('#dfeeff'), lin('#5a4630'), 0.7);
    this.scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(lin('#fff0d6'), 1.5);
    this.sun.castShadow = true;
    this.sun.shadow.bias = -0.0006; this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.sun, this.sun.target);
    const rim = new THREE.DirectionalLight(lin('#9fc4ff'), 0.35); rim.position.set(30, 25, -30); this.scene.add(rim);

    const t = buildTerrain(world);
    this.scene.add(t.group); this.waterTex = t.water; this.ground = t.ground;
    this.res = new Resources(world, this.scene);
    this.units = new UnitMeshes(this.scene, world.teams);
    this.magic = new Effects(this.scene);
    this.unitLook = null; // during an age-up: which units still wear their old form
    this.blds = new Map();
    this.fx = [];
    this.ghost = null;
    for (const b of world.buildings()) this.addBuilding(b);
    this.ray = new THREE.Raycaster(); this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.arrowMat = new THREE.MeshBasicMaterial({ color: lin('#3a2a1a') });
    this.arrowGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 4).rotateZ(Math.PI / 2);
    this.dustMat = new THREE.MeshBasicMaterial({ color: lin('#d8ccb0'), transparent: true, opacity: 0.6, depthWrite: false });
    this.makePointer();
    this.setQuality(quality);
  }

  // The tutorial pointer: a faceted purple arrow that spins and bobs over its target, with a
  // pulsing ring on the ground. Purple belongs to no team, building or terrain.
  makePointer() {
    const g = new THREE.Group();
    const gem = new THREE.MeshStandardMaterial({ color: lin('#9b5cff'), emissive: lin('#5a1fd1'), emissiveIntensity: 0.55, roughness: 0.35, metalness: 0.25, flatShading: true });
    const rim = new THREE.MeshStandardMaterial({ color: lin('#e7d7ff'), emissive: lin('#b48cff'), emissiveIntensity: 0.4, roughness: 0.3, flatShading: true });
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.62, 6), gem); head.rotation.x = Math.PI; head.position.y = 0.31;
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.08, 6), rim); collar.position.y = 0.64;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.62, 6), gem); shaft.position.y = 0.99;
    const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), rim); cap.position.y = 1.38; cap.scale.y = 0.7;
    const arrow = new THREE.Group(); arrow.add(head, collar, shaft, cap); arrow.scale.setScalar(1.35);
    arrow.traverse(o => { if (o.isMesh) { o.castShadow = true; o.renderOrder = 5; } });
    const ringMat = new THREE.MeshBasicMaterial({ color: lin('#a66bff'), transparent: true, opacity: 0.8, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 32).rotateX(-Math.PI / 2), ringMat); ring.renderOrder = 3;
    g.add(arrow, ring); g.visible = false;
    this.scene.add(g);
    this.pointer = { g, arrow, ring, ringMat, h: 1, t: 0 };
  }
  // Points at tile (tx, ty), hovering at height h above the ground; null hides it.
  setPointer(tx, ty, h = 1, size = 1) {
    const p = this.pointer;
    if (tx === null || tx === undefined) { p.g.visible = false; return; }
    const [x, z] = this.toWorld(tx, ty);
    p.g.position.set(x, 0, z); p.h = h; p.size = size; p.g.visible = true;
  }
  // Where the arrow's tip is on screen (for the guide's bubble).
  pointerScreen() {
    const p = this.pointer;
    if (!p.g.visible) return null;
    const v = new THREE.Vector3(p.g.position.x, p.arrow.position.y + 0.8, p.g.position.z).project(this.cam);
    return [(v.x + 1) / 2 * this.w, (1 - v.y) / 2 * this.h];
  }

  // Graphics quality: high (sharp, soft shadows), medium (lighter shadows, lower resolution on
  // sharp screens) or low (no shadows, one pixel per screen point) for older devices.
  setQuality(q) {
    const dpr = devicePixelRatio || 1, r = this.renderer;
    const shadows = q !== 'low', size = q === 'high' ? 2048 : 1024;
    r.setPixelRatio(q === 'high' ? Math.min(dpr, 2) : q === 'medium' ? Math.min(dpr, 1.5) : 1);
    if (this.quality !== undefined && (r.shadowMap.enabled !== shadows || this.sun.shadow.mapSize.x !== size)) {
      this.scene.traverse(o => { if (o.material) for (const m of [].concat(o.material)) m.needsUpdate = true; });
      this.sun.shadow.map?.dispose(); this.sun.shadow.map = null;
    }
    r.shadowMap.enabled = shadows; this.sun.castShadow = shadows;
    this.sun.shadow.mapSize.set(size, size);
    this.quality = q;
    if (this.w) this.resize(this.w, this.h);
  }

  toWorld(tx, ty) { return [(tx - this.size / 2) * TILE, (ty - this.size / 2) * TILE]; }
  toTile(wx, wz) { return [wx / TILE + this.size / 2, wz / TILE + this.size / 2]; }

  resize(w, h) {
    this.w = w; this.h = h;
    this.renderer.setSize(w, h, false);
    this.updateCamera();
  }
  // Zoom is the number of world units across the screen's shorter side, so a phone shows the
  // same scale held upright or sideways.
  get ppu() { return Math.min(this.w, this.h) / this.zoom; }
  updateCamera() {
    const vw = this.w / this.ppu, vh = this.h / this.ppu, v = Math.max(vw, vh);
    Object.assign(this.cam, { left: -vw / 2, right: vw / 2, top: vh / 2, bottom: -vh / 2 });
    this.cam.updateProjectionMatrix();
    const half = this.size * TILE / 2;
    this.target.x = Math.max(-half, Math.min(half, this.target.x));
    this.target.z = Math.max(-half, Math.min(half, this.target.z));
    this.cam.position.copy(this.target).addScaledVector(DIR, 60);
    this.cam.lookAt(this.target);
    const s = this.sun.shadow.camera, e = v * 0.9 + 6;
    Object.assign(s, { left: -e, right: e, top: e, bottom: -e, near: 1, far: 120 });
    s.updateProjectionMatrix();
    this.sun.position.copy(this.target).add(new THREE.Vector3(-14, 36, 26));
    this.sun.target.position.copy(this.target);
  }
  centerOn(tx, ty) { const [x, z] = this.toWorld(tx, ty); this.target.set(x, 0, z); this.updateCamera(); }
  pan(dxPx, dyPx) {
    const k = 1 / this.ppu;
    const right = new THREE.Vector3(1, 0, -1).normalize(), fwd = new THREE.Vector3(-1, 0, -1).normalize();
    this.target.addScaledVector(right, -dxPx * k).addScaledVector(fwd, dyPx * k / 0.6);
    this.updateCamera();
  }
  zoomBy(f) { this.zoom = Math.max(10, Math.min(40, this.zoom * f)); this.updateCamera(); }

  // Screen point -> fractional tile coordinates on the ground.
  pick(sx, sy) {
    const ndc = new THREE.Vector2(sx / this.w * 2 - 1, -(sy / this.h) * 2 + 1);
    this.ray.setFromCamera(ndc, this.cam);
    const p = new THREE.Vector3();
    if (!this.ray.ray.intersectPlane(this.plane, p)) return null;
    return this.toTile(p.x, p.z);
  }
  // Tile point -> screen pixels.
  screen(tx, ty, h = 0.6) {
    const [x, z] = this.toWorld(tx, ty), v = new THREE.Vector3(x, h, z).project(this.cam);
    return [(v.x + 1) / 2 * this.w, (1 - v.y) / 2 * this.h, v.z];
  }

  addBuilding(b) {
    if (this.blds.has(b.id)) return;
    const age = this.world.teams[b.team].age;
    const art = makeBuilding(this.world.teams[b.team].key, b.type, age);
    const [wx, wz] = this.toWorld(b.x + b.w / 2, b.y + b.h / 2);
    art.group.position.set(wx, 0, wz);
    const scaffold = this.makeScaffold(b.w * TILE, Math.max(1.4, art.height * 0.8));
    scaffold.visible = !b.built;
    art.group.add(scaffold);
    this.scene.add(art.group);
    this.blds.set(b.id, { art, scaffold, built: b.built, age });
    this.syncBuilding(b);
  }
  makeScaffold(w, h) {
    const g = new THREE.Group(), wood = new THREE.MeshStandardMaterial({ color: lin('#9a6a3a'), roughness: 0.9 });
    const half = w / 2 - 0.1;
    for (const [x, z] of [[-half, -half], [half, -half], [-half, half], [half, half]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, h, 0.1), wood); p.position.set(x, h / 2, z); g.add(p); }
    for (let k = 1; k <= 3; k++) for (const [x, z, rw, rd] of [[0, -half, w - 0.2, 0.07], [0, half, w - 0.2, 0.07], [-half, 0, 0.07, w - 0.2], [half, 0, 0.07, w - 0.2]]) { const r = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.07, rd), wood); r.position.set(x, h * k / 3.2, z); g.add(r); }
    const pad = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, w), new THREE.MeshStandardMaterial({ color: lin('#b89a6a'), roughness: 1 }));
    pad.position.y = 0.04; pad.receiveShadow = true; g.add(pad);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  syncBuilding(b) {
    const v = this.blds.get(b.id);
    if (!v) return;
    const p = b.built ? 1 : b.progress;
    v.art.holder.scale.y = v.art.holder.scale.x * Math.max(0.06, Math.pow(p, 0.8));
    v.scaffold.visible = !b.built;
  }
  // A building's model for any team, type and age (used by the age-up and the tests).
  makeArt(key, type, age) { return makeBuilding(key, type, age); }
  // Replaces a building's model with its form in another age (prepared art can be passed in).
  // Returns { old, art } so the age-up can animate the change.
  swapArt(b, age, art) {
    const v = this.blds.get(b.id);
    if (!v) return null;
    art = art || makeBuilding(this.world.teams[b.team].key, b.type, age);
    art.group.position.copy(v.art.group.position);
    const old = v.art;
    old.group.remove(v.scaffold);
    art.group.add(v.scaffold);
    this.scene.add(art.group);
    v.art = art; v.age = age;
    return { old, art };
  }

  removeEntity(ev) {
    if (ev.cat === 'res') { this.res.remove(ev.id); return; }
    if (ev.cat === 'bld') {
      const v = this.blds.get(ev.id);
      if (v) { this.scene.remove(v.art.group); this.blds.delete(ev.id); this.dust(v.art.group.position, 14, 2.5); }
    }
  }

  arrow(from, to) {
    const m = new THREE.Mesh(this.arrowGeo, this.arrowMat);
    this.scene.add(m);
    this.fx.push({ m, t: 0, dur: 0.35, from, to, kind: 'arrow' });
  }
  // A siege shot: a glowing ball (or a boulder) lobbed high from the engine to where it lands.
  shot(from, to, time, effect, age) {
    const late = age === 'celestial';
    const look = {
      gust: [new THREE.OctahedronGeometry(0.22, 0), late ? '#fff6cf' : '#ffe08a'],
      soak: [new THREE.SphereGeometry(0.2, 10, 8), late ? '#eef5ff' : '#5fd0ff'],
      lava: [new THREE.SphereGeometry(0.2, 10, 8), late ? '#ffe08a' : '#ff7a1f'],
      shatter: [new THREE.DodecahedronGeometry(0.22, 0), null],
    }[effect] || [new THREE.SphereGeometry(0.18, 8, 6), '#ffffff'];
    const mat = look[1] ? new THREE.MeshBasicMaterial({ color: lin(look[1]) }) : new THREE.MeshStandardMaterial({ color: lin('#8d877c'), flatShading: true, emissive: lin(late ? '#2fae68' : '#1a3a20'), emissiveIntensity: 0.6 });
    const m = new THREE.Mesh(look[0], mat);
    m.castShadow = true;
    this.scene.add(m);
    const el = { gust: 'air', soak: 'water', lava: 'fire', shatter: 'earth' }[effect];
    this.fx.push({ m, t: 0, dur: time, from, to, kind: 'shot', el, peak: 1.6 + Math.hypot(to[0] - from[0], to[1] - from[1]) * 0.18, trail: 0 });
  }
  dust(pos, n = 6, spread = 0.6) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.25 + Math.random() * 0.25, 6, 4), this.dustMat.clone());
      m.position.set(pos.x + (Math.random() - 0.5) * spread, 0.3, pos.z + (Math.random() - 0.5) * spread);
      this.scene.add(m);
      this.fx.push({ m, t: 0, dur: 1 + Math.random() * 0.6, kind: 'dust', vy: 0.6 + Math.random() * 0.8 });
    }
  }

  setGhost(type, x, y, ok, team) {
    if (!type) { if (this.ghost) { this.scene.remove(this.ghost.g); this.ghost = null; } return; }
    const size = CONFIG.buildings[type].size;
    if (!this.ghost || this.ghost.type !== type) {
      this.setGhost(null);
      const g = new THREE.Group();
      const art = makeBuilding(this.world.teams[team].key, type, this.world.teams[team].age);
      const ghostly = m => { const c = m.clone(); c.transparent = true; c.opacity = 0.55; return c; };
      art.group.traverse(o => { if (o.isMesh) { o.material = Array.isArray(o.material) ? o.material.map(ghostly) : ghostly(o.material); o.castShadow = false; } });
      g.add(art.group);
      const tiles = new THREE.Mesh(new THREE.PlaneGeometry(size * TILE, size * TILE).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x40ff80, transparent: true, opacity: 0.35, depthWrite: false }));
      tiles.position.y = 0.06; g.add(tiles);
      this.scene.add(g);
      this.ghost = { g, type, tiles, art };
    }
    const [wx, wz] = this.toWorld(x + size / 2, y + size / 2);
    this.ghost.g.position.set(wx, 0, wz);
    this.ghost.tiles.material.color.set(ok ? 0x40ff80 : 0xff4040);
  }

  render(alpha, time, dt, rings) {
    this.waterTex.offset.set(time * 0.02, time * 0.01);
    for (const v of this.blds.values()) for (const f of v.art.fx) f(time, dt);
    if (this.ghost) for (const f of this.ghost.art.fx) f(time, dt);
    const pt = this.pointer;
    if (pt.g.visible) {
      pt.arrow.position.y = pt.h + 0.25 + Math.abs(Math.sin(time * 3.2)) * 0.35;
      pt.arrow.rotation.y = time * 2.2;
      const k = (time * 0.9) % 1;
      pt.ring.scale.setScalar((pt.size || 1) * (0.8 + k * 0.6)); pt.ringMat.opacity = 0.85 * (1 - k);
    }
    this.units.update(this.world, alpha, time, (x, y) => this.toWorld(x, y), this.unitLook);
    this.magic.update(dt);
    this.units.rings(rings);
    this.fx = this.fx.filter(e => {
      e.t += dt;
      const k = e.t / e.dur;
      if (k >= 1) { this.scene.remove(e.m); return false; }
      if (e.kind === 'arrow') {
        const x = e.from[0] + (e.to[0] - e.from[0]) * k, z = e.from[1] + (e.to[1] - e.from[1]) * k;
        e.m.position.set(x, 0.9 + Math.sin(k * Math.PI) * 0.8, z);
        e.m.rotation.set(0, -Math.atan2(e.to[1] - e.from[1], e.to[0] - e.from[0]), (0.5 - k) * 1.2);
      } else if (e.kind === 'shot') {
        const x = e.from[0] + (e.to[0] - e.from[0]) * k, z = e.from[1] + (e.to[1] - e.from[1]) * k;
        e.m.position.set(x, 0.9 + Math.sin(k * Math.PI) * e.peak, z); e.m.rotation.set(time * 6, time * 4, 0);
        if (e.el && (e.trail -= dt) <= 0) { e.trail = 0.05; this.magic.emit(e.el, x, z, { n: 1, y: e.m.position.y - 0.1, radius: 0.05, speed: 0.15, life: 0.5, size: 0.7, up: 0.1 }); }
      } else { e.m.position.y += e.vy * dt; e.m.scale.setScalar(1 + k * 1.5); e.m.material.opacity = 0.6 * (1 - k); }
      return true;
    });
    this.renderer.render(this.scene, this.cam);
  }
}
