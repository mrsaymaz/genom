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
  tempest(s) {
    // The storm: a dark ring of cloud over the circle, a swirl on the ground, and a cyclone that
    // roams inside it.
    const g = new THREE.Group(), R = s.r * TILE, storm = new THREE.Group(); g.add(storm);
    const cloudMat = new THREE.MeshStandardMaterial({ color: lin('#a8b2c6'), emissive: lin('#3a4460'), emissiveIntensity: 0.35, transparent: true, opacity: 0.62, roughness: 1, depthWrite: false });
    for (let k = 0; k < 26; k++) { const a = k / 26 * Math.PI * 2, rr = R * (0.8 + (k % 3) * 0.1); const c = new THREE.Mesh(new THREE.SphereGeometry(0.9 + (k % 2) * 0.35, 12, 8), cloudMat); c.position.set(Math.cos(a) * rr, 7.6 + (k % 3) * 0.35, Math.sin(a) * rr); c.scale.set(1.7, 0.55, 1.3); storm.add(c); }
    const swirl = new THREE.Mesh(new THREE.RingGeometry(R * 0.2, R, 48, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: lin('#d8e4f4'), transparent: true, opacity: 0.18, depthWrite: false })); swirl.position.y = 0.06; g.add(swirl);
    const cyc = new THREE.Group(); g.add(cyc);
    for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.5 + k * 0.6, 0.25 + k * 0.5, 1.7, 12, 1, true), this.windMat); c.position.y = 0.85 + k * 1.55; cyc.add(c); }
    const debris = [];
    for (let k = 0; k < 16; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.24), new THREE.MeshStandardMaterial({ color: lin(k % 3 ? '#6b4a2c' : '#3f7a34'), flatShading: true })); cyc.add(d); debris.push({ d, a: k * 0.9, r: 0.6 + (k % 5) * 0.4, y: 0.4 + (k % 7) * 0.8 }); }
    cyc.scale.setScalar(1.4);
    return { g, storm, cyc, swirl, debris, kind: 'tempest' };
  }
  wave(s) {
    // A ring wave: an open wall of water that grows from the middle out to the edge.
    const g = new THREE.Group();
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48, 1, true), this.waveMat); wall.position.y = 0.5; g.add(wall);
    const foam = [];
    for (let k = 0; k < 30; k++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), this.foamMat); g.add(f); foam.push(f); }
    const column = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 9, 20, 1, true), this.waveMat); column.position.y = 4.5; g.add(column);
    return { g, wall, foam, column, kind: 'tide' };
  }
  phoenix() {
    const g = new THREE.Group();
    const fire = new THREE.MeshStandardMaterial({ color: lin('#ffb060'), emissive: lin('#ff5a10'), emissiveIntensity: 1.6, flatShading: true });
    const gold = new THREE.MeshStandardMaterial({ color: lin('#ffd060'), emissive: lin('#ff9a10'), emissiveIntensity: 0.9, metalness: 0.5, roughness: 0.3, flatShading: true });
    g.scale.setScalar(2.4);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), fire); body.scale.set(1.6, 0.8, 0.8); g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), gold); head.position.set(0.75, 0.2, 0); g.add(head);
    const wings = [];
    for (const s of [-1, 1]) { const wg = new THREE.Group(); wg.position.set(0, 0.1, s * 0.3); g.add(wg); for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.9 - k * 0.25, 4), k % 2 ? gold : fire); f.rotation.x = s * Math.PI / 2; f.position.set(-0.25 * k, 0, s * (0.9 - k * 0.1)); wg.add(f); } wings.push([wg, s]); }
    for (let k = 0; k < 3; k++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.4, 4), k === 1 ? gold : fire); t.rotation.z = Math.PI / 2; t.position.set(-1.2, 0, (k - 1) * 0.2); g.add(t); }
    return { g, wings, kind: 'phoenix' };
  }

  // ---- aiming: the circle the player is about to strike ----
  preview(x, y, r, color) {
    if (!this.aim) {
      const g = new THREE.Group();
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false }));
      const rim = new THREE.Mesh(new THREE.RingGeometry(0.95, 1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }));
      disc.position.y = 0.07; rim.position.y = 0.08; disc.renderOrder = rim.renderOrder = 5; g.add(disc, rim); this.scene.add(g);
      this.aim = { g, disc, rim };
    }
    const [wx, wz] = this.at(x, y);
    this.aim.g.position.set(wx, 0, wz); this.aim.g.scale.set(r * TILE, 1, r * TILE); this.aim.g.visible = true;
    this.aim.disc.material.color.set(lin(color)); this.aim.rim.material.color.set(lin(color));
  }
  clearPreview() { if (this.aim) this.aim.g.visible = false; }

  // ---- events ----
  fired(ev) {
    const v = this.v, R = (ev.r || 6) * TILE, [cx, cz] = this.at(ev.x, ev.y);
    if (ev.kind === 'quake') {
      // The rift: a glowing ring with cracks running in from it, a big shake and dust.
      const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.14, 6, 64).rotateX(Math.PI / 2), this.runeMat.clone()); ring.position.set(cx, 0.08, cz); this.scene.add(ring); this.rifts.push({ m: ring, t: 0 });
      for (let k = 0; k < 10; k++) {
        const a = k / 10 * Math.PI * 2 + 0.2, m = new THREE.Mesh(new THREE.BoxGeometry(R * 0.85, 0.08, 0.22), this.runeMat.clone());
        m.position.set(cx + Math.cos(a) * R * 0.5, 0.07, cz + Math.sin(a) * R * 0.5); m.rotation.y = -a; this.scene.add(m); this.rifts.push({ m, t: 0 });
      }
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; v.dust({ x: cx + Math.cos(a) * R, z: cz + Math.sin(a) * R }, 3, 1.4); }
      v.shake = 1.2;
    }
    if (ev.kind === 'tempest') v.shake = 0.5;
    if (ev.kind === 'tide') v.shake = 0.7;
  }
  shock(ev) {
    const v = this.v, [cx, cz] = this.at(ev.x, ev.y);
    v.shake = Math.max(v.shake, 0.6);
    v.magic.ring(cx, cz, { color: '#9affb8', from: 0.5, to: ev.r * TILE, time: 0.6, width: 0.2, solid: true });
    for (let k = 0; k < 6; k++) v.dust({ x: cx + (Math.random() - 0.5) * ev.r * TILE * 1.4, z: cz + (Math.random() - 0.5) * ev.r * TILE * 1.4 }, 2, 1.2);
  }
  burst(ev) {
    const v = this.v, [x, z] = this.at(ev.x, ev.y), R = (ev.r || 6) * TILE;
    v.magic.emit('fire', x, z, { n: 220, radius: R * 0.8, speed: 3.5, life: 1.8, size: 1.6 });
    // A fireball that swells over the whole circle and fades.
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: lin('#ffb040'), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    ball.position.set(x, 0.5, z); this.scene.add(ball); this.balls.push({ m: ball, t: 0, R });
    v.magic.ring(x, z, { color: '#ffb040', from: 0.3, to: R, time: 0.7, width: 0.4, solid: true });
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; v.dust({ x: x + Math.cos(a) * R * 0.7, z: z + Math.sin(a) * R * 0.7 }, 3, 2); }
    v.shake = 1.3;
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
        fx = s.kind === 'tempest' ? this.tempest(s) : s.kind === 'tide' ? this.wave(s) : s.kind === 'phoenix' ? this.phoenix() : null;
        if (!fx) continue;
        this.scene.add(fx.g); this.live.set(s, fx);
      }
      const k = Math.min(1, s.t / s.dur);
      if (fx.kind === 'tempest') {
        const [x, z] = this.at(s.x, s.y), [qx, qz] = this.at(s.cx, s.cy), grow = Math.max(0.01, Math.min(1, s.t / 1.2, (s.dur - s.t) / 1.2));
        fx.g.position.set(x, 0, z); fx.storm.rotation.y = time * 0.6; fx.storm.scale.set(1, grow, 1); fx.swirl.rotation.y = -time * 1.5; fx.swirl.material.opacity = 0.18 * grow;
        fx.cyc.position.set(qx - x, 0, qz - z); fx.cyc.scale.setScalar(1.4 * grow); fx.cyc.rotation.y = time * 5;
        fx.debris.forEach(d => { const a = d.a + time * 4; d.d.position.set(Math.cos(a) * d.r * (1 + d.y * 0.25), d.y + Math.sin(time * 3 + d.a) * 0.2, Math.sin(a) * d.r * (1 + d.y * 0.25)); d.d.rotation.set(time * 5, time * 3, 0); });
        if (Math.random() < dt * 30) v.magic.emit('air', x, z, { n: 4, radius: s.r * TILE * 0.9, speed: 2, life: 0.8, size: 1 });
        if (Math.random() < dt * 1.5) { const a = Math.random() * 6.28, rr = Math.random() * s.r * TILE; v.magic.ring(x + Math.cos(a) * rr, z + Math.sin(a) * rr, { color: '#fff4b0', from: 0.1, to: 1.2, time: 0.25, width: 0.15, solid: true }); }
      }
      if (fx.kind === 'tide') {
        const [x, z] = this.at(s.x, s.y), front = (0.5 + k * (s.r + 0.5)) * TILE, rise = Math.sin(Math.min(1, k * 1.15) * Math.PI);
        fx.g.position.set(x, 0, z);
        fx.wall.scale.set(front, 0.3 + rise * 2.2, front); fx.wall.position.y = (0.3 + rise * 2.2) / 2;
        fx.foam.forEach((f, i) => { const a = i / fx.foam.length * Math.PI * 2 + time * 0.3; f.position.set(Math.cos(a) * front, 0.3 + rise * 2.2 + Math.sin(time * 9 + i) * 0.12, Math.sin(a) * front); });
        // The sea crashes down in the middle first.
        fx.column.visible = s.t < 0.7; fx.column.position.y = 4.5 - s.t * 6; fx.column.scale.set(1, Math.max(0.05, 1 - s.t / 0.7), 1);
        if (Math.random() < dt * 30) v.magic.emit('water', x, z, { n: 6, radius: front, speed: 1.4, life: 0.8, size: 1.1 });
      }
      if (fx.kind === 'phoenix') {
        const px = s.x0 + (s.x - s.x0) * k, py = s.y0 + (s.y - s.y0) * k, [x, z] = this.at(px, py);
        fx.g.position.set(x, 1.5 + Math.sin(k * Math.PI) * 4.5 - k * 1.2, z);
        fx.g.rotation.set(0, -Math.atan2(s.y - s.y0, s.x - s.x0), Math.cos(k * Math.PI) * 0.6 - 0.2);
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
    this.balls = this.balls.filter(b => { b.t += dt; const k = b.t / 1.1; b.m.scale.setScalar(0.5 + k * (b.R || 6)); b.m.material.opacity = 0.9 * (1 - k); if (k >= 1) { this.scene.remove(b.m); return false; } return true; });
    this.rifts = this.rifts.filter(r => { r.t += dt; r.m.material.opacity = 0.9 * Math.max(0, 1 - r.t / 4); if (r.t > 4) { this.scene.remove(r.m); return false; } return true; });
  }
}
