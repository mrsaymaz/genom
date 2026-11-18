// The wild creatures (wolves, boars, the cave bear and the stone troll), and the harmless life of
// the valley that is only for show: deer and rabbits that graze and run from anyone who comes
// close, butterflies over the gardens and eagles circling the peaks.
import * as THREE from 'three';
import { T } from '../sim/map.js';

const lin = c => new THREE.Color(c).convertSRGBToLinear();
const mats = new Map();
const mat = (c, o = {}) => { const k = c + JSON.stringify(o); if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color: lin(c), roughness: 0.85, flatShading: true, ...o })); return mats.get(k); };
const mesh = (geo, c, x = 0, y = 0, z = 0, o) => { const m = new THREE.Mesh(geo, mat(c, o)); m.position.set(x, y, z); m.castShadow = true; return m; };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const ball = (r, ws = 7, hs = 5) => new THREE.SphereGeometry(r, ws, hs);

// A four-legged animal. Legs hang from pivots so they can swing. Facing +x.
function beast({ len, h, wid, body, belly, head, legs, legH, legR = 0.05, extra, round = false }) {
  const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig);
  const torso = round ? mesh(new THREE.IcosahedronGeometry(0.5, 1), body, 0, legH + h / 2, 0) : mesh(box(len, h, wid), body, 0, legH + h / 2, 0);
  if (round) torso.scale.set(len, h * 1.15, wid);
  rig.add(torso);
  if (belly) rig.add(mesh(round ? new THREE.IcosahedronGeometry(0.5, 1).scale(len * 0.8, h * 0.5, wid * 0.8) : box(len * 0.8, h * 0.3, wid * 0.85), belly, 0, legH + h * (round ? 0.25 : 0.12), 0));
  const hd = new THREE.Group(); hd.position.set(len / 2 + head.size * (round ? 0.05 : 0.3), legH + h * 0.75, 0); rig.add(hd);
  hd.add(round ? mesh(new THREE.IcosahedronGeometry(head.size * 0.62, 1), head.color, 0, 0, 0) : mesh(box(head.size * 1.1, head.size, head.size * 0.95), head.color, 0, 0, 0));
  const leg = [];
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const p = new THREE.Group(); p.position.set(sx * len * 0.36, legH, sz * wid * 0.32); rig.add(p);
    p.add(mesh(new THREE.CylinderGeometry(legR, legR * 0.85, legH, 5), legs, 0, -legH / 2, 0)); leg.push(p);
  }
  extra?.(rig, hd);
  return { g, rig, head: hd, legs: leg };
}

const MAKE = {
  wolf() {
    const b = beast({ len: 0.8, h: 0.3, wid: 0.28, body: '#6f6a64', belly: '#b8b0a4', head: { size: 0.24, color: '#6f6a64' }, legs: '#5a5550', legH: 0.3, extra: (rig, hd) => {
      hd.add(mesh(box(0.2, 0.11, 0.12), '#8a847c', 0.18, -0.05, 0));
      hd.add(mesh(box(0.05, 0.05, 0.06), '#1a1714', 0.29, -0.02, 0));
      for (const z of [-0.07, 0.07]) hd.add(mesh(new THREE.ConeGeometry(0.045, 0.13, 4), '#5a5550', -0.03, 0.16, z));
      for (const z of [-0.07, 0.07]) hd.add(mesh(box(0.02, 0.03, 0.03), '#ffcf40', 0.13, 0.04, z, { emissive: lin('#ffb020'), emissiveIntensity: 0.8 }));
      const tail = mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.42, 5), '#5f5a54', -0.52, 0.55, 0); tail.rotation.z = 1.0; rig.add(tail);
    } });
    return b;
  },
  boar() {
    return beast({ round: true, len: 0.85, h: 0.42, wid: 0.46, body: '#5a3f2a', belly: '#4a3322', head: { size: 0.3, color: '#4f3726' }, legs: '#3a2a1c', legH: 0.18, legR: 0.06, extra: (rig, hd) => {
      hd.add(mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.14, 6), '#c08a78', 0.2, -0.05, 0)).rotation.z = Math.PI / 2;
      for (const z of [-0.09, 0.09]) { const t = mesh(new THREE.ConeGeometry(0.025, 0.16, 4), '#f4ecd8', 0.18, 0.02, z); t.rotation.z = -0.6; hd.add(t); }
      for (const z of [-0.09, 0.09]) hd.add(mesh(new THREE.ConeGeometry(0.05, 0.1, 4), '#3a2a1c', -0.06, 0.18, z));
      rig.add(mesh(box(0.6, 0.08, 0.06), '#2a1e14', 0.05, 0.64, 0)); // bristles
    } });
  },
  bear() {
    return beast({ round: true, len: 1.35, h: 0.72, wid: 0.78, body: '#5e3e24', belly: '#4a301c', head: { size: 0.44, color: '#5e3e24' }, legs: '#4a301c', legH: 0.36, legR: 0.12, extra: (rig, hd) => {
      hd.add(mesh(box(0.2, 0.18, 0.22), '#8a6a4a', 0.28, -0.08, 0));
      hd.add(mesh(box(0.06, 0.06, 0.08), '#1a1410', 0.39, -0.03, 0));
      for (const z of [-0.17, 0.17]) hd.add(mesh(ball(0.08), '#4a301c', -0.05, 0.24, z));
      rig.add(mesh(new THREE.IcosahedronGeometry(0.34, 1), '#674528', 0.28, 0.98, 0)); // the shoulder hump
      for (const z of [-0.2, 0.2]) for (const sx of [0.45, -0.45]) rig.add(mesh(box(0.2, 0.06, 0.18), '#3a2616', sx + 0.04, 0.03, z)); // paws
    } });
  },
  troll() {
    const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig);
    const skin = '#7d8a74', dark = '#5e6a58', moss = '#5f8a3a';
    const legs = [];
    for (const z of [-0.28, 0.28]) { const p = new THREE.Group(); p.position.set(0, 0.8, z); rig.add(p); p.add(mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.8, 6), dark, 0, -0.4, 0)); p.add(mesh(box(0.42, 0.14, 0.28), dark, 0.08, -0.78, 0)); legs.push(p); }
    rig.add(mesh(box(0.66, 0.34, 0.78), '#6a5a3e', 0, 0.9, 0)); // loincloth
    const chest = mesh(new THREE.DodecahedronGeometry(0.62, 0), skin, 0.05, 1.45, 0); chest.scale.set(0.9, 1, 1.05); rig.add(chest);
    rig.add(mesh(new THREE.DodecahedronGeometry(0.2, 0), moss, -0.25, 1.9, 0.25));
    rig.add(mesh(new THREE.DodecahedronGeometry(0.14, 0), moss, -0.3, 1.6, -0.35));
    const head = new THREE.Group(); head.position.set(0.32, 2.0, 0); rig.add(head);
    head.add(mesh(new THREE.DodecahedronGeometry(0.28, 0), skin));
    head.add(mesh(box(0.14, 0.18, 0.12), dark, 0.25, -0.02, 0)); // nose
    for (const z of [-0.1, 0.1]) head.add(mesh(ball(0.04, 5, 4), '#ffd040', 0.22, 0.08, z, { emissive: lin('#ffb020'), emissiveIntensity: 1 }));
    for (const z of [-0.1, 0.1]) { const t = mesh(new THREE.ConeGeometry(0.03, 0.12, 4), '#f0e8d0', 0.26, -0.15, z); head.add(t); }
    const arms = [];
    for (const z of [-0.62, 0.62]) {
      const p = new THREE.Group(); p.position.set(0.05, 1.75, z); rig.add(p);
      p.add(mesh(new THREE.CylinderGeometry(0.13, 0.16, 1.0, 6), skin, 0, -0.5, 0));
      p.add(mesh(new THREE.DodecahedronGeometry(0.17, 0), dark, 0, -1.05, 0));
      arms.push(p);
    }
    // The club, in the right hand.
    const club = new THREE.Group(); club.position.set(0, -1.05, 0); arms[1].add(club);
    const shaft = mesh(new THREE.CylinderGeometry(0.07, 0.11, 1.1, 6), '#6b4a2c', 0.45, 0, 0); shaft.rotation.z = -Math.PI / 2 + 0.3; club.add(shaft);
    club.add(mesh(new THREE.DodecahedronGeometry(0.24, 0), '#5a3c22', 0.95, 0.15, 0));
    // The z's of a sleeping troll.
    const zz = new THREE.Group(); zz.position.set(0.5, 2.3, 0);
    const zc = document.createElement('canvas'); zc.width = zc.height = 64; const x = zc.getContext('2d'); x.font = '900 54px sans-serif'; x.fillStyle = '#dff0ff'; x.strokeStyle = '#1e2a4a'; x.lineWidth = 9; x.strokeText('z', 16, 48); x.fillText('z', 16, 48);
    const zt = new THREE.CanvasTexture(zc);
    for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: zt, transparent: true, depthWrite: false, depthTest: false })); s.renderOrder = 12; s.scale.setScalar(0.45 + i * 0.15); zz.add(s); }
    g.add(zz);
    return { g, rig, head, legs, arms, zz, biped: true };
  },
};
const SCALE = { wolf: 1.1, boar: 1.05, bear: 1.15, troll: 1.15 };

// A small health bar over a hurt creature.
function bar() {
  const g = new THREE.Group();
  const back = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.12), new THREE.MeshBasicMaterial({ color: 0x2a1a10, depthTest: false, transparent: true, opacity: 0.85 }));
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.08), new THREE.MeshBasicMaterial({ color: 0xff8a30, depthTest: false }));
  fill.position.z = 0.001; back.renderOrder = fill.renderOrder = 10;
  g.add(back, fill); g.visible = false;
  return { g, fill };
}

export class Wildlife {
  constructor(world, scene, toWorld) {
    this.world = world; this.scene = scene; this.toWorld = toWorld;
    this.views = new Map();
    this.ambient = [];
    this.spawnAmbient();
  }

  view(e) {
    let v = this.views.get(e.id);
    if (v) return v;
    v = MAKE[e.kind]();
    v.g.scale.setScalar(SCALE[e.kind]);
    v.hp = bar(); v.hp.g.position.y = e.kind === 'troll' ? 3.0 : e.kind === 'bear' ? 1.7 : 1.1; v.g.add(v.hp.g);
    this.scene.add(v.g); this.views.set(e.id, v);
    return v;
  }

  remove(id) {
    const v = this.views.get(id);
    if (!v) return null;
    this.scene.remove(v.g); this.views.delete(id);
    return v.g.position;
  }

  update(alpha, time, dt, cam) {
    const w = this.world;
    for (const e of w.ents.values()) {
      if (e.cat !== 'wild') continue;
      const v = this.view(e);
      const x = e.px + (e.x - e.px) * alpha, y = e.py + (e.y - e.py) * alpha, [wx, wz] = this.toWorld(x, y);
      const moving = Math.hypot(e.x - e.px, e.y - e.py) > 0.004;
      v.g.position.set(wx, 0, wz);
      // Face the way it is going (models face +x; the world's y is the view's z).
      const want = -e.facing;
      let da = want - v.g.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da));
      v.g.rotation.y += da * Math.min(1, dt * 10);
      const ph = time * (e.kind === 'troll' ? 6 : 11) + e.id;
      v.legs.forEach((p, i) => { p.rotation.z = moving ? Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.6 : 0; });
      const strike = e.work > 0 ? Math.sin((1 - e.work / 0.4) * Math.PI) : 0;
      if (v.biped) {
        // The troll: asleep it slumps forward and its z's drift up; awake it swings its club.
        const sleep = e.asleep ? 1 : 0;
        // Asleep it sits on the ground, legs out in front, chin on its chest.
        v.rig.rotation.z = -0.25 * sleep; v.rig.position.y = -0.62 * sleep;
        if (sleep) v.legs.forEach(p => { p.rotation.z = 1.35; });
        v.head.rotation.z = -0.5 * sleep;
        v.arms[1].rotation.z = sleep ? 0.6 : 0.3 + strike * 1.9;
        v.arms[0].rotation.z = sleep ? 0.6 : (moving ? Math.sin(ph) * 0.4 : 0.15);
        v.zz.visible = !!e.asleep;
        if (e.asleep) v.zz.children.forEach((s, i) => { const k = (time * 0.5 + i / 3) % 1; s.position.set(k * 0.5, k * 1.2, 0); s.material.opacity = k < 0.65 ? 1 : (1 - k) / 0.35; });
        v.rig.position.x = 0;
      } else {
        v.rig.position.y = moving ? Math.abs(Math.sin(ph)) * 0.04 : Math.sin(time * 1.5 + e.id) * 0.01;
        v.rig.position.x = strike * 0.25;
        v.head.rotation.z = -strike * 0.5 + (moving ? 0 : Math.sin(time * 0.7 + e.id) * 0.15);
      }
      // Health bar, turned to the camera.
      v.hp.g.visible = e.hp < e.maxHp;
      if (v.hp.g.visible) { v.hp.fill.scale.x = Math.max(0.01, e.hp / e.maxHp); v.hp.fill.position.x = -0.43 * (1 - e.hp / e.maxHp); v.hp.g.quaternion.copy(v.g.quaternion).invert().multiply(cam.quaternion); }
    }
    this.updateAmbient(time, dt);
  }

  // ---------- the valley's harmless life (render only) ----------
  spawnAmbient() {
    const w = this.world, S = w.size;
    if (S < 90) return; // only the arena maps
    const open = (x, y) => x >= 1 && y >= 1 && x < S - 1 && y < S - 1 && !w.blocked(Math.floor(x), Math.floor(y)) && w.terrainAt(Math.floor(x), Math.floor(y)) !== T.WATER;
    let seed = 41; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const herd = (kind, n, cx, cy) => { for (let i = 0; i < n; i++) { const x = cx + (rnd() - 0.5) * 3, y = cy + (rnd() - 0.5) * 3; if (open(x, y)) this.addCritter(kind, x, y); } };
    // Deer and rabbits on quiet meadows, away from the bases.
    for (let i = 0, made = 0; i < 200 && made < 8; i++) {
      const x = 4 + rnd() * (S - 8), y = 4 + rnd() * (S - 8);
      const far = w.map.bases.every(b => Math.hypot(b.x - x, b.y - y) > 18) && (w.map.lairs || []).every(L => Math.hypot(L.x - x, L.y - y) > 9);
      if (!far || !open(x, y)) continue;
      herd(made % 2 ? 'rabbit' : 'deer', made % 2 ? 3 : 3, x, y); made++;
    }
    // Butterflies over the garden lawns.
    for (let y = 0; y < S; y += 3) for (let x = 0; x < S; x += 3) if (w.terrainAt(x, y) === T.GARDEN && rnd() < 0.7) this.addCritter('butterfly', x + 0.5, y + 0.5);
    // Eagles circle the highest ranges.
    let peaks = 0;
    for (let y = 2; y < S && peaks < 4; y += 9) for (let x = 2; x < S && peaks < 4; x += 9) if (w.terrainAt(x, y) === T.MOUNT && rnd() < 0.5) { this.addCritter('eagle', x, y); peaks++; }
  }
  addCritter(kind, x, y) {
    const g = new THREE.Group();
    if (kind === 'deer') {
      const b = beast({ len: 0.62, h: 0.26, wid: 0.22, body: '#b07a46', belly: '#efe0c8', head: { size: 0.17, color: '#b07a46' }, legs: '#8a5a34', legH: 0.38, legR: 0.03, extra: (rig, hd) => {
        for (const z of [-0.05, 0.05]) { const a = mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.22, 4), '#e8d8b0', 0, 0.17, z); a.rotation.x = z * 6; hd.add(a); }
        rig.add(mesh(box(0.08, 0.08, 0.1), '#ffffff', -0.33, 0.6, 0));
      } });
      g.add(b.g); Object.assign(g.userData, b);
    } else if (kind === 'rabbit') {
      g.add(mesh(ball(0.11), '#b8a48a', 0, 0.12, 0), mesh(ball(0.07), '#b8a48a', 0.1, 0.2, 0), mesh(ball(0.04, 5, 4), '#ffffff', -0.11, 0.14, 0));
      for (const z of [-0.025, 0.025]) g.add(mesh(box(0.025, 0.12, 0.035), '#a8947a', 0.09, 0.32, z));
    } else if (kind === 'butterfly') {
      const c = ['#ffd34a', '#ff8ac0', '#9ad0ff', '#ffffff'][(x * 7 + y * 3 | 0) % 4];
      for (const s of [-1, 1]) { const wing = mesh(new THREE.PlaneGeometry(0.14, 0.1), c, 0, 0, s * 0.07, { side: THREE.DoubleSide }); wing.rotation.x = -Math.PI / 2; g.add(wing); }
    } else if (kind === 'eagle') {
      g.add(mesh(box(0.3, 0.08, 0.1), '#4a3a2a'), mesh(box(0.06, 0.04, 0.9), '#5a4632'), mesh(box(0.08, 0.06, 0.08), '#f0ece0', 0.17, 0.02, 0));
    }
    g.traverse(o => { if (o.isMesh) o.castShadow = kind !== 'butterfly'; });
    this.scene.add(g);
    this.ambient.push({ kind, g, x, y, hx: x, hy: y, tx: x, ty: y, wait: Math.random() * 3, run: 0, ph: Math.random() * 6 });
  }
  updateAmbient(time, dt) {
    const w = this.world;
    const open = (x, y) => !w.blocked(Math.floor(x), Math.floor(y));
    for (const a of this.ambient) {
      if (a.kind === 'eagle') {
        const ang = time * 0.25 + a.ph, [wx, wz] = this.toWorld(a.hx + Math.cos(ang) * 5, a.hy + Math.sin(ang) * 5);
        a.g.position.set(wx, 7 + Math.sin(time * 0.6 + a.ph) * 0.5, wz); a.g.rotation.y = -ang; a.g.rotation.x = -0.3;
        continue;
      }
      if (a.kind === 'butterfly') {
        const [wx, wz] = this.toWorld(a.hx + Math.sin(time * 0.7 + a.ph) * 1.5, a.hy + Math.cos(time * 0.5 + a.ph * 2) * 1.2);
        a.g.position.set(wx, 0.6 + Math.sin(time * 3 + a.ph) * 0.15, wz);
        a.g.children.forEach((c, i) => { c.rotation.x = -Math.PI / 2 + (i ? 1 : -1) * Math.sin(time * 18 + a.ph) * 0.9; });
        continue;
      }
      // Grazers: run from any unit or wild creature close by, otherwise amble about home.
      let fx = 0, fy = 0, near = false;
      for (const e of w.ents.values()) {
        if (e.cat !== 'unit' && e.cat !== 'wild') continue;
        const d = Math.hypot(e.x - a.x, e.y - a.y);
        if (d < 3.2) { near = true; fx += (a.x - e.x) / (d || 1); fy += (a.y - e.y) / (d || 1); }
      }
      if (near) { const d = Math.hypot(fx, fy) || 1; const tx = a.x + (fx / d) * 4, ty = a.y + (fy / d) * 4; if (open(tx, ty)) { a.tx = tx; a.ty = ty; } a.run = 2; a.wait = 0; }
      a.run -= dt;
      const dx = a.tx - a.x, dy = a.ty - a.y, dd = Math.hypot(dx, dy);
      const speed = a.run > 0 ? (a.kind === 'deer' ? 3.2 : 2.6) : (a.kind === 'deer' ? 0.5 : 0.7);
      let moving = false;
      if (dd > 0.05) {
        const st = Math.min(dd, speed * dt), nx = a.x + (dx / dd) * st, ny = a.y + (dy / dd) * st;
        if (open(nx, ny)) { a.x = nx; a.y = ny; moving = true; a.face = Math.atan2(dy, dx); } else { a.tx = a.x; a.ty = a.y; }
      } else if ((a.wait -= dt) <= 0) {
        a.wait = 2 + Math.random() * 5;
        const tx = a.hx + (Math.random() - 0.5) * 6, ty = a.hy + (Math.random() - 0.5) * 6;
        if (open(tx, ty)) { a.tx = tx; a.ty = ty; }
      }
      const [wx, wz] = this.toWorld(a.x, a.y);
      const hop = a.kind === 'rabbit' && moving ? Math.abs(Math.sin(time * 12 + a.ph)) * 0.12 : 0;
      a.g.position.set(wx, hop, wz);
      if (a.face !== undefined) a.g.rotation.y = -a.face;
      const u = a.g.userData;
      if (u.legs) u.legs.forEach((p, i) => { p.rotation.z = moving ? Math.sin(time * (a.run > 0 ? 16 : 7) + (i % 2 ? Math.PI : 0)) * 0.6 : 0; });
      if (u.head) u.head.rotation.z = moving ? 0 : -0.7 + Math.sin(time * 0.8 + a.ph) * 0.1; // grazing
    }
  }
}

