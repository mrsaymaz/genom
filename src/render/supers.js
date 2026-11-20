// The superweapons on the map: the Great Tempest's cyclone, the Moonfall Tide's wave and its
// flood, the phoenix in flight and its blaze, and the Great Quake's rift and the ridge it raises.
// Everything follows the simulation's state (world.supers, floods, ridges), so a loaded match
// shows what is still going on.
import * as THREE from 'three';
import { TILE } from './art.js';

const lin = c => new THREE.Color(c).convertSRGBToLinear();

export class SuperFx {
  constructor(view) {
    this.v = view; this.scene = view.scene;
    this.live = new Map(); // weapon in use -> its visuals
    this.floods = new Map(); this.ridges = new Map(); this.rifts = []; this.blazes = new Map(); this.balls = [];
    this.flameMats = ['#e8400a', '#ff6a14', '#ffa020'].map(c => new THREE.MeshBasicMaterial({ color: lin(c), transparent: true, opacity: 0.8, depthWrite: false }));
    this.windMat = new THREE.MeshStandardMaterial({ color: lin('#aeb8cc'), emissive: lin('#5a6a90'), emissiveIntensity: 0.3, transparent: true, opacity: 0.62, depthWrite: false, side: THREE.DoubleSide, flatShading: true });
    this.waveMat = new THREE.MeshStandardMaterial({ color: lin('#4aa8e8'), emissive: lin('#1a5a9a'), emissiveIntensity: 0.4, transparent: true, opacity: 0.82, roughness: 0.15, flatShading: true });
    this.foamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, flatShading: true });
    this.floodMat = new THREE.MeshBasicMaterial({ color: lin('#5ab4f0'), transparent: true, opacity: 0.35, depthWrite: false });
    this.rockMat = new THREE.MeshStandardMaterial({ color: lin('#7d7466'), roughness: 0.95, flatShading: true });
    this.runeMat = new THREE.MeshBasicMaterial({ color: lin('#7cffa8'), transparent: true, opacity: 0.9, depthWrite: false });
  }
  w() { return this.v.world; }
  at(x, y) { return this.v.toWorld(x, y); }

  // ---- one look per weapon ----
  tempest() {
    const g = new THREE.Group();
    for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.5 + k * 0.55, 0.25 + k * 0.45, 1.6, 12, 1, true), this.windMat); c.position.y = 0.8 + k * 1.45; g.add(c); }
    const debris = [];
    for (let k = 0; k < 14; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.2), new THREE.MeshStandardMaterial({ color: lin(k % 3 ? '#6b4a2c' : '#3f7a34'), flatShading: true })); g.add(d); debris.push({ d, a: k * 0.9, r: 0.6 + (k % 5) * 0.35, y: 0.4 + (k % 7) * 0.7 }); }
    return { g, debris, kind: 'tempest' };
  }
  wave(s) {
    const g = new THREE.Group(), span = s.half * 2 * TILE;
    // Local x is the way the wave travels; z runs along its front.
    const wall = new THREE.Group(); g.add(wall);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.7, span), this.waveMat); body.position.y = 0.85; wall.add(body);
    const curl = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, span, 12), this.waveMat); curl.rotation.x = Math.PI / 2; curl.position.set(0.25, 1.7, 0); wall.add(curl);
    const crest = [];
    for (let k = 0; k < 16; k++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), this.foamMat); f.position.set(0, 1.0, -span / 2 + (k + 0.5) * span / 16); g.add(f); crest.push(f); }
    g.rotation.y = -Math.atan2(s.dy, s.dx);
    return { g, wall, crest, kind: 'tide' };
  }
  phoenix() {
    const g = new THREE.Group();
    const fire = new THREE.MeshStandardMaterial({ color: lin('#ffb060'), emissive: lin('#ff5a10'), emissiveIntensity: 1.6, flatShading: true });
    const gold = new THREE.MeshStandardMaterial({ color: lin('#ffd060'), emissive: lin('#ff9a10'), emissiveIntensity: 0.9, metalness: 0.5, roughness: 0.3, flatShading: true });
    g.scale.setScalar(2.2);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), fire); body.scale.set(1.6, 0.8, 0.8); g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), gold); head.position.set(0.75, 0.2, 0); g.add(head);
    const wings = [];
    for (const s of [-1, 1]) { const wg = new THREE.Group(); wg.position.set(0, 0.1, s * 0.3); g.add(wg); for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.9 - k * 0.25, 4), k % 2 ? gold : fire); f.rotation.x = s * Math.PI / 2; f.position.set(-0.25 * k, 0, s * (0.9 - k * 0.1)); wg.add(f); } wings.push([wg, s]); }
    for (let k = 0; k < 3; k++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.4, 4), k === 1 ? gold : fire); t.rotation.z = Math.PI / 2; t.position.set(-1.2, 0, (k - 1) * 0.2); g.add(t); }
    return { g, wings, kind: 'phoenix' };
  }

  // ---- events ----
  fired(ev) {
    const v = this.v;
    if (ev.kind === 'quake') {
      // The rift: a glowing crack along the line, with a shake and dust.
      const [ax, az] = this.at(ev.x - ev.dx * 5.5, ev.y - ev.dy * 5.5), [bx, bz] = this.at(ev.x + ev.dx * 5.5, ev.y + ev.dy * 5.5);
      const len = Math.hypot(bx - ax, bz - az), m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.35), this.runeMat.clone());
      m.position.set((ax + bx) / 2, 0.06, (az + bz) / 2); m.rotation.y = -Math.atan2(bz - az, bx - ax); this.scene.add(m);
      this.rifts.push({ m, t: 0 });
      for (let k = 0; k <= 6; k++) v.dust({ x: ax + (bx - ax) * k / 6, z: az + (bz - az) * k / 6 }, 3, 1.2);
      v.shake = 0.8;
    }
    if (ev.kind === 'tempest') v.shake = 0.3;
    if (ev.kind === 'tide') v.shake = 0.4;
  }
  burst(ev) {
    const v = this.v, [x, z] = this.at(ev.x, ev.y);
    v.magic.emit('fire', x, z, { n: 160, radius: 2.4, speed: 3, life: 1.8, size: 1.5 });
    // A fireball that swells and fades.
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: lin('#ffb040'), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    ball.position.set(x, 0.5, z); this.scene.add(ball); this.balls.push({ m: ball, t: 0 });
    v.magic.ring(x, z, { color: '#ffb040', from: 0.3, to: 3.2 * TILE, time: 0.7, width: 0.3, solid: true });
    v.dust({ x, z }, 10, 3);
    v.shake = 1;
  }
  ridge(tiles) {
    const w = this.w(), key = tiles.join(','), g = new THREE.Group(), geos = [];
    let seed = tiles[0] || 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (const i of tiles) {
      const [x, z] = this.at(i % w.size + 0.5, Math.floor(i / w.size) + 0.5);
      for (let k = 0; k < 2; k++) { const d = new THREE.DodecahedronGeometry(0.55 + rnd() * 0.35, 0); d.scale(1, 1.1 + rnd() * 0.8, 1); d.translate(x + (rnd() - 0.5) * 0.6, 0.45, z + (rnd() - 0.5) * 0.6); geos.push(d); }
    }
    for (const d of geos) { const m = new THREE.Mesh(d, this.rockMat); m.castShadow = m.receiveShadow = true; g.add(m); }
    g.position.y = -1.6; this.scene.add(g);
    this.ridges.set(key, { g, t: 0, sink: false });
  }

  update(dt, time) {
    const w = this.w(), v = this.v, seen = new Set();
    for (const s of w.supers || []) {
      seen.add(s);
      let fx = this.live.get(s);
      if (!fx) {
        fx = s.kind === 'tempest' ? this.tempest() : s.kind === 'tide' ? this.wave(s) : s.kind === 'phoenix' ? this.phoenix() : null;
        if (!fx) continue;
        this.scene.add(fx.g); this.live.set(s, fx);
      }
      const k = Math.min(1, s.t / s.dur);
      if (fx.kind === 'tempest') {
        const [x, z] = this.at(s.cx, s.cy), grow = Math.min(1, s.t / 1.2, (s.dur - s.t) / 1.2);
        fx.g.position.set(x, 0, z); fx.g.scale.setScalar(1.3 * grow); fx.g.rotation.y = time * 5;
        fx.debris.forEach(d => { const a = d.a + time * 4; d.d.position.set(Math.cos(a) * d.r * (1 + d.y * 0.25), d.y + Math.sin(time * 3 + d.a) * 0.2, Math.sin(a) * d.r * (1 + d.y * 0.25)); d.d.rotation.set(time * 5, time * 3, 0); });
        if (Math.random() < dt * 20) v.magic.emit('air', x, z, { n: 3, radius: 1.5, speed: 1.8, life: 0.8, size: 1 });
      }
      if (fx.kind === 'tide') {
        const front = -s.len / 2 + k * s.len, [x, z] = this.at(s.x + s.dx * front, s.y + s.dy * front), rise = Math.sin(k * Math.PI);
        fx.g.position.set(x, 0, z); fx.wall.scale.set(1, 0.25 + rise * 0.9, 1);
        fx.crest.forEach((f, i) => { f.position.y = (0.25 + rise * 0.9) * 2.2 + Math.sin(time * 9 + i) * 0.12; f.position.x = 0.45 + Math.sin(time * 5 + i) * 0.15; });
        if (Math.random() < dt * 25) v.magic.emit('water', x, z, { n: 4, radius: s.half * TILE * 0.8, speed: 1.2, life: 0.8, size: 1 });
      }
      if (fx.kind === 'phoenix') {
        const px = s.x0 + (s.x - s.x0) * k, py = s.y0 + (s.y - s.y0) * k, [x, z] = this.at(px, py);
        fx.g.position.set(x, 1.5 + Math.sin(k * Math.PI) * 4.5 - k * 1.2, z);
        fx.g.rotation.set(0, -Math.atan2(s.dy, s.dx), Math.cos(k * Math.PI) * 0.6 - 0.2);
        fx.wings.forEach(([wg, sd]) => { wg.rotation.x = sd * Math.sin(time * 12) * 0.6; });
        v.magic.emit('fire', x, z, { n: 4, y: fx.g.position.y, radius: 0.4, speed: 0.6, life: 0.9, size: 1.2 });
      }
    }
    for (const [s, fx] of this.live) if (!seen.has(s)) { this.scene.remove(fx.g); this.live.delete(s); }
    // The flood: shallow water that fades out.
    const fseen = new Set();
    for (const f of w.floods || []) {
      fseen.add(f);
      let m = this.floods.get(f);
      if (!m) { m = new THREE.Mesh(new THREE.CircleGeometry(f.r * TILE, 28).rotateX(-Math.PI / 2), this.floodMat.clone()); const [x, z] = this.at(f.x, f.y); m.position.set(x, 0.05, z); this.scene.add(m); this.floods.set(f, m); }
      m.material.opacity = 0.38 * Math.min(1, f.t / 4) * (0.85 + Math.sin(time * 2) * 0.15);
    }
    for (const [f, m] of this.floods) if (!fseen.has(f)) { this.scene.remove(m); this.floods.delete(f); }
    // Ridges: rise when they appear, sink when they end; a loaded match rebuilds standing ones.
    const rkeys = new Set((w.ridges || []).map(r => r.tiles.join(',')));
    for (const r of w.ridges || []) if (!this.ridges.has(r.tiles.join(','))) this.ridge(r.tiles);
    for (const [key, r] of this.ridges) {
      if (!r.sink && !rkeys.has(key)) { r.sink = true; r.t = 0; }
      r.t += dt;
      r.g.position.y = r.sink ? -Math.min(1.6, r.t * 1.6) : -1.6 + Math.min(1, r.t / 0.6) * 1.6;
      if (r.sink && r.t > 1) { this.scene.remove(r.g); this.ridges.delete(key); }
    }
    // Burning ground (the phoenix's trail and blaze, and molten siege shot): flickering flames.
    const bseen = new Set();
    for (const b of w.burns || []) {
      bseen.add(b);
      let f = this.blazes.get(b);
      if (!f) {
        const g = new THREE.Group(), [x, z] = this.at(b.x, b.y), n = Math.round(3 + b.r * b.r * 2.5), flames = [];
        for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * b.r * TILE * 0.85, h = 0.5 + Math.random() * 0.9; const m = new THREE.Mesh(new THREE.ConeGeometry(0.16 + Math.random() * 0.14, h, 5), this.flameMats[k % 3]); m.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); g.add(m); flames.push([m, Math.random() * 6]); }
        const glow = new THREE.Mesh(new THREE.CircleGeometry(b.r * TILE, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: lin('#3a1a0a'), transparent: true, opacity: 0.45, depthWrite: false }));
        glow.position.y = 0.04; g.add(glow);
        g.position.set(x, 0, z); this.scene.add(g); f = { g, flames, glow }; this.blazes.set(b, f);
      }
      const fade = Math.min(1, b.t / 2);
      f.flames.forEach(([m, ph]) => m.scale.set(fade, fade * (0.75 + Math.sin(time * 9 + ph) * 0.3), fade));
      f.glow.material.opacity = 0.45 * fade;
    }
    for (const [b, f] of this.blazes) if (!bseen.has(b)) { this.scene.remove(f.g); this.blazes.delete(b); }
    this.balls = this.balls.filter(b => { b.t += dt; const k = b.t / 1.1; b.m.scale.setScalar(0.5 + k * 4.2); b.m.material.opacity = 0.9 * (1 - k); if (k >= 1) { this.scene.remove(b.m); return false; } return true; });
    this.rifts = this.rifts.filter(r => { r.t += dt; r.m.material.opacity = 0.9 * Math.max(0, 1 - r.t / 2.5); if (r.t > 2.5) { this.scene.remove(r.m); return false; } return true; });
  }
}
