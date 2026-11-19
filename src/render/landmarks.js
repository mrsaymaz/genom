// The landmarks that move or glow: waterfalls with foam and mist, the sky shard floating over the
// standing stones, glowing crystals at the foot of the mountains, and the two kinds of ancient
// wonder (Sun Obelisk and Moonwell) with a capture ring in their owner's colour.
import * as THREE from 'three';
import { TILE } from './art.js';
import { toWorld } from './terrain.js';
import { CAPTURE_R } from '../sim/wonders.js';

const lin = c => new THREE.Color(c).convertSRGBToLinear();
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: 0.85, flatShading: true, ...o });
const add = (g, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };

// Falling water: soft vertical streaks, scrolled every frame.
function fallTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#9fd4f2'; g.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 60; i++) { const x = Math.random() * 64, w = 1 + Math.random() * 3, y = Math.random() * 128, h = 20 + Math.random() * 60; g.fillStyle = Math.random() < 0.6 ? 'rgba(255,255,255,0.75)' : 'rgba(60,130,190,0.45)'; g.fillRect(x, y, w, h); g.fillRect(x, y - 128, w, h); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding;
  return t;
}
function softDot() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export class Landmarks {
  constructor(world, scene) {
    this.world = world; this.scene = scene; this.anim = [];
    this.fallTex = fallTexture(); this.dot = softDot();
    const size = world.size;
    const crystals = [];
    for (const d of world.map.decor || []) {
      const [wx, wz] = toWorld(size, d.x, d.y);
      if (d.kind === 'falls') this.falls(wx, wz, d.a, d.s);
      if (d.kind === 'shard') this.shard(wx, wz);
      if (d.kind === 'crystal') crystals.push([wx, wz, d.s, d.a]);
      if (d.kind === 'ring') this.fireflies(wx, wz);
    }
    if (crystals.length) this.crystals(crystals);
    this.wonders = (world.wonders || []).map(o => this.wonder(o));
  }

  // A waterfall pouring towards local +x, from a lip in the cliff down into the water below.
  falls(wx, wz, a, s) {
    const g = new THREE.Group(); g.position.set(wx, 0, wz); g.rotation.y = -a; g.scale.setScalar(s); this.scene.add(g);
    const H = 3.1, W = 2.4, segs = 10;
    const geo = new THREE.PlaneGeometry(W, H, 1, segs), pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const t = 1 - (pos.getY(i) + H / 2) / H; // 0 at the top, 1 at the bottom
      pos.setXYZ(i, -1.1 + 1.0 * t * t, (1 - t) * H - 0.15, pos.getX(i) * (1 + t * 0.25));
    }
    geo.computeVertexNormals();
    const tex = this.fallTex.clone(); tex.needsUpdate = true; tex.repeat.set(1.4, 1.2);
    const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0.9, roughness: 0.2, emissive: lin('#3a6a8a'), emissiveIntensity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    const sheet = new THREE.Mesh(geo, mat); sheet.renderOrder = 2; g.add(sheet);
    // Rocks framing the lip, and the pool of foam below.
    const rock = std('#7a7264');
    for (const z of [-1, 1]) for (let k = 0; k < 3; k++) add(g, new THREE.DodecahedronGeometry(0.45 + k * 0.1, 0), rock, -1.2 + k * 0.35, H - 0.4 - k * 1.0, z * (W / 2 + 0.35 + k * 0.08));
    add(g, new THREE.BoxGeometry(0.7, 0.3, W + 0.6), rock, -1.25, H - 0.05, 0);
    const foamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 0.6, flatShading: true });
    const foam = [];
    for (let k = 0; k < 8; k++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + Math.random() * 0.18, 0), foamMat); f.position.set(-0.1 + Math.random() * 0.7, -0.05, (Math.random() - 0.5) * W * 1.1); g.add(f); foam.push(f); }
    const mist = [];
    for (let k = 0; k < 7; k++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, transparent: true, depthWrite: false, opacity: 0.5 })); g.add(m); mist.push({ m, ph: k / 7, z: (Math.random() - 0.5) * W }); }
    this.anim.push(time => {
      tex.offset.y = time * 1.4;
      foam.forEach((f, i) => f.scale.setScalar(0.8 + Math.sin(time * 5 + i * 1.7) * 0.25));
      for (const p of mist) { const k = (time * 0.35 + p.ph) % 1; p.m.position.set(0.2 + k * 0.6, 0.1 + k * 1.6, p.z); p.m.scale.setScalar(0.6 + k * 1.4); p.m.material.opacity = 0.45 * (1 - k); }
    });
  }

  // The sky shard: a great crystal turning slowly in the air, with stones circling it.
  shard(wx, wz) {
    const g = new THREE.Group(); g.position.set(wx, 0, wz); this.scene.add(g);
    const glow = new THREE.MeshStandardMaterial({ color: lin('#9be8ff'), emissive: lin('#4aa8ff'), emissiveIntensity: 1.1, roughness: 0.2, flatShading: true, transparent: true, opacity: 0.92 });
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), glow); core.scale.y = 2; g.add(core);
    const small = [];
    for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), glow); m.scale.y = 1.8; g.add(m); small.push(m); }
    const rock = std('#7d776c'), rocks = [];
    for (let k = 0; k < 5; k++) { const m = add(g, new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.14, 0), rock); rocks.push(m); }
    const halo = new THREE.Mesh(new THREE.RingGeometry(1.2, 2.2, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: lin('#7fd0ff'), transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.position.y = 0.05; g.add(halo);
    this.anim.push(time => {
      core.position.y = 3.2 + Math.sin(time * 1.2) * 0.25; core.rotation.y = time * 0.6;
      small.forEach((m, i) => { const a = time * 0.9 + i * 2.1; m.position.set(Math.cos(a) * 1.0, 3.2 + Math.sin(time * 1.7 + i) * 0.4, Math.sin(a) * 1.0); m.rotation.y = -a; });
      rocks.forEach((m, i) => { const a = -time * 0.45 + i * 1.26; m.position.set(Math.cos(a) * 1.7, 2.6 + Math.sin(time + i) * 0.3, Math.sin(a) * 1.7); m.rotation.set(time + i, time * 0.7, 0); });
      halo.material.opacity = 0.2 + Math.sin(time * 1.2) * 0.08;
    });
  }

  // Fireflies drifting over a fairy ring.
  fireflies(wx, wz) {
    const flies = [];
    for (let k = 0; k < 7; k++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color: lin('#e8ff9a'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.scale.setScalar(0.28); this.scene.add(m); flies.push({ m, ph: Math.random() * 6.28, r: 0.4 + Math.random() * 1.1 }); }
    this.anim.push(time => flies.forEach(f => { const a = time * 0.4 + f.ph; f.m.position.set(wx + Math.cos(a) * f.r, 0.5 + Math.sin(time * 1.3 + f.ph) * 0.3, wz + Math.sin(a * 1.3) * f.r); f.m.material.opacity = 0.5 + Math.sin(time * 4 + f.ph * 3) * 0.45; }));
  }

  crystals(list) {
    const mat = new THREE.MeshStandardMaterial({ color: lin('#c8a0ff'), emissive: lin('#8a4af0'), emissiveIntensity: 0.7, roughness: 0.25, flatShading: true });
    const g = new THREE.Group(); this.scene.add(g);
    for (const [wx, wz, s, a] of list) {
      for (let k = 0; k < 5; k++) {
        const m = add(g, new THREE.OctahedronGeometry(0.22, 0), mat, wx + Math.cos(k * 1.3 + a) * 0.3 * (k ? 1 : 0), 0.3, wz + Math.sin(k * 1.3 + a) * 0.3 * (k ? 1 : 0));
        m.scale.set(s, s * (2.6 - k * 0.3), s); m.rotation.set(k ? (Math.cos(k * 2 + a)) * 0.4 : 0, a + k, k ? Math.sin(k * 2 + a) * 0.4 : 0);
        m.position.y = 0.3 * s * (2.6 - k * 0.3);
      }
    }
    this.anim.push(time => { mat.emissiveIntensity = 0.55 + Math.sin(time * 1.6) * 0.2; });
  }

  // ---------- the capturable wonders ----------
  wonder(o) {
    const [wx, wz] = toWorld(this.world.size, o.x, o.y);
    const g = new THREE.Group(); g.position.set(wx, 0, wz); this.scene.add(g);
    const v = { g, o, glowMats: [] };
    const stone = std('#cfc5ad'), stone2 = std('#b4aa92');
    if (o.kind === 'obelisk') {
      add(g, new THREE.BoxGeometry(2.8, 0.3, 2.8), stone2, 0, 0.15);
      add(g, new THREE.BoxGeometry(2.2, 0.3, 2.2), stone, 0, 0.45);
      add(g, new THREE.BoxGeometry(1.5, 0.35, 1.5), stone2, 0, 0.77);
      const shaft = add(g, new THREE.CylinderGeometry(0.34, 0.55, 4.4, 4), stone, 0, 3.15); shaft.rotation.y = Math.PI / 4;
      const gold = new THREE.MeshStandardMaterial({ color: lin('#f2c040'), emissive: lin('#c08000'), emissiveIntensity: 0.3, metalness: 0.7, roughness: 0.3, flatShading: true });
      const cap = add(g, new THREE.ConeGeometry(0.5, 0.8, 4), gold, 0, 5.75); cap.rotation.y = Math.PI / 4;
      const rune = new THREE.MeshStandardMaterial({ color: lin('#ffe08a'), emissive: lin('#ffb020'), emissiveIntensity: 0.2 });
      for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) { const a = (k / 4) * Math.PI * 2; const m = add(g, new THREE.BoxGeometry(0.06, 0.32, 0.22), rune, Math.cos(a) * (0.47 - j * 0.04), 1.9 + j * 1.0, Math.sin(a) * (0.47 - j * 0.04)); m.rotation.y = -a; m.castShadow = false; }
      const sun = new THREE.Group(); sun.position.y = 7.0; g.add(sun);
      add(sun, new THREE.SphereGeometry(0.32, 12, 8), gold);
      const rays = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 16), gold); sun.add(rays);
      for (let k = 0; k < 8; k++) { const ray = add(sun, new THREE.ConeGeometry(0.07, 0.35, 4), gold); const a = (k / 8) * Math.PI * 2; ray.position.set(Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0); ray.rotation.z = a - Math.PI / 2; }
      v.sun = sun; v.glowMats.push(gold, rune);
    } else {
      // The Moonwell: a round well of glowing water on stepped rings, under four arches and a
      // crescent moon, with a shaft of moonlight rising from it while it is held.
      g.scale.setScalar(1.3);
      add(g, new THREE.CylinderGeometry(2.0, 2.1, 0.2, 14), stone2, 0, 0.1);
      add(g, new THREE.CylinderGeometry(1.5, 1.6, 0.25, 12), stone2, 0, 0.32);
      add(g, new THREE.CylinderGeometry(1.0, 1.1, 0.7, 12, 1, true), stone, 0, 0.55).material.side = THREE.DoubleSide;
      add(g, new THREE.TorusGeometry(1.05, 0.12, 6, 16).rotateX(Math.PI / 2), stone, 0, 0.9);
      const water = new THREE.MeshStandardMaterial({ color: lin('#bfe6ff'), emissive: lin('#5aa0ff'), emissiveIntensity: 0.4, roughness: 0.1 });
      add(g, new THREE.CircleGeometry(0.95, 16).rotateX(-Math.PI / 2), water, 0, 0.75).castShadow = false;
      for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + Math.PI / 4; add(g, new THREE.CylinderGeometry(0.12, 0.15, 2.6, 6), stone, Math.cos(a) * 1.3, 1.3, Math.sin(a) * 1.3); }
      for (let k = 0; k < 2; k++) { const arch = add(g, new THREE.TorusGeometry(1.3, 0.16, 6, 14, Math.PI), stone2, 0, 2.6, 0); arch.rotation.y = Math.PI / 4 + k * Math.PI / 2; arch.scale.set(1.0, 0.6, 1); }
      const moonMat = new THREE.MeshStandardMaterial({ color: lin('#e8f0ff'), emissive: lin('#8ab0ff'), emissiveIntensity: 0.3, roughness: 0.4, flatShading: true });
      const moon = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.17, 6, 16, Math.PI * 1.25), moonMat); moon.position.y = 4.0; moon.rotation.z = -0.4; g.add(moon);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, 6, 12, 1, true), new THREE.MeshBasicMaterial({ color: lin('#bcd8ff'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); beam.position.y = 3.8; g.add(beam); v.beam = beam;
      const motes = [];
      for (let k = 0; k < 8; k++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color: lin('#bcd8ff'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); m.scale.setScalar(0.3); g.add(m); motes.push({ m, ph: k / 8 }); }
      v.moon = moon; v.motes = motes; v.glowMats.push(water, moonMat);
    }
    // The capture ring on the ground: faint when nobody holds it, in the owner's colour when held;
    // an inner arc fills while soldiers capture it.
    const R = CAPTURE_R * TILE;
    v.ring = new THREE.Mesh(new THREE.RingGeometry(R - 0.18, R, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false }));
    v.ring.position.y = 0.06; g.add(v.ring);
    v.arcMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide });
    v.arc = new THREE.Mesh(new THREE.RingGeometry(R - 0.5, R - 0.24, 48, 1, 0, 0.001).rotateX(-Math.PI / 2), v.arcMat); v.arc.position.y = 0.07; g.add(v.arc);
    v.arcP = 0;
    return v;
  }

  update(time) {
    for (const f of this.anim) f(time);
    const w = this.world, R = CAPTURE_R * TILE;
    for (const v of this.wonders) {
      const o = (w.wonders || [])[v.o.i] || v.o, owned = o.owner !== null;
      const color = owned ? w.teams[o.owner].nation.color : '#fff4d0';
      v.ring.material.color.set(lin(color)); v.ring.material.opacity = owned ? 0.7 : 0.3;
      // The arc shows capture progress toward whichever side is ahead.
      const p = Math.abs(o.p), lean = o.p >= 0 ? 0 : 1;
      if (Math.abs(p - v.arcP) > 0.01) { v.arc.geometry.dispose(); v.arc.geometry = new THREE.RingGeometry(R - 0.5, R - 0.24, 48, 1, Math.PI / 2, Math.max(0.001, p * Math.PI * 2)).rotateX(-Math.PI / 2); v.arcP = p; }
      v.arc.visible = p > 0.01 && !(owned && p >= 0.999);
      v.arcMat.color.set(lin(w.teams[lean].nation.color));
      for (const m of v.glowMats) m.emissiveIntensity = owned ? 0.8 + Math.sin(time * 2) * 0.2 : 0.2;
      if (v.sun) { v.sun.rotation.z = time * (owned ? 0.8 : 0.15); v.sun.position.y = 7.0 + Math.sin(time * 1.3) * 0.15; }
      if (v.moon) v.moon.position.y = 4.0 + Math.sin(time * 1.1) * 0.12;
      if (v.beam) v.beam.material.opacity = owned ? 0.16 + Math.sin(time * 1.5) * 0.05 : 0;
      if (v.motes) v.motes.forEach(({ m, ph }) => { const k = (time * 0.3 + ph) % 1, a = ph * 6.28 + time * 0.5; m.position.set(Math.cos(a) * 0.7, 0.8 + k * 2.6, Math.sin(a) * 0.7); m.material.opacity = owned ? 0.9 * (1 - k) : 0.25 * (1 - k); });
    }
  }
}
