// Units on the map: each nation's own models, drawn as instanced meshes (a lit one and a glow one
// per type and team), plus the loads workers carry and the selection rings.
import * as THREE from 'three';
import { coloured } from './terrain.js';
import { unitKit, DARK_UNITS, MYTHIC_UNITS } from './unit-models.js';
import { UNIT_TYPES, TYPE_LINE } from '../sim/units.js';

const box = (w, h, d, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return g; };
const cyl = (rt, rb, h, x, y, z, rx = 0, rz = 0) => { const g = new THREE.CylinderGeometry(rt, rb, h, 7); g.rotateX(rx); g.rotateZ(rz); g.translate(x, y, z); return g; };
const sph = (r, x, y, z) => { const g = new THREE.SphereGeometry(r, 8, 6); g.translate(x, y, z); return g; };
const cone = (r, h, x, y, z, rx = 0) => { const g = new THREE.ConeGeometry(r, h, 6); g.rotateX(rx); g.translate(x, y, z); return g; };

const CARRY = {
  lumber: () => coloured([[cyl(0.06, 0.06, 0.45, 0, 0, 0, 0, Math.PI / 2), '#8a5a32'], [cyl(0.06, 0.06, 0.45, 0, 0.1, 0.05, 0, Math.PI / 2), '#7a4a28']]),
  gold: () => coloured([[box(0.22, 0.14, 0.18, 0, 0, 0), '#6b4a2c'], [new THREE.OctahedronGeometry(0.09, 0).translate(0, 0.1, 0), '#f2c040']]),
  food: () => coloured([[cyl(0.13, 0.1, 0.14, 0, 0, 0), '#b08848'], [new THREE.SphereGeometry(0.06, 5, 4).translate(0.03, 0.08, 0), '#c8304a'], [new THREE.SphereGeometry(0.06, 5, 4).translate(-0.05, 0.08, 0.03), '#d84a3a']]),
};

export class UnitMeshes {
  constructor(scene, teams) {
    this.scene = scene; this.teams = teams;
    this.mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, flatShading: true });
    this.glowMat = new THREE.MeshBasicMaterial({ vertexColors: true });
    // Each nation's own models per age (src/render/unit-models.js): a lit and a glow mesh per type.
    this.meshes = new Map();
    teams.forEach((t, i) => this.prepare(i, t.age || 'dark'));
    this.carry = Object.fromEntries(Object.entries(CARRY).map(([k, f]) => [k, this.inst(f(), 80)]));
    this.ring = new THREE.InstancedMesh(new THREE.RingGeometry(0.36, 0.46, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ vertexColors: false, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }), 200);
    this.ring.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(200 * 3), 3);
    this.ring.count = 0; this.ring.renderOrder = 2;
    scene.add(this.ring);
    this.d = new THREE.Object3D();
  }
  // Builds a team's unit meshes for an age (once).
  prepare(team, age) {
    const sets = { dark: DARK_UNITS, mythic: MYTHIC_UNITS }, art = this.teams[team].nation.art;
    for (const type of UNIT_TYPES) {
      const key = `${type}${team}${age}`;
      if (this.meshes.has(key)) continue;
      const k = unitKit(THREE, { detail: 0.55 });
      sets[age][art][TYPE_LINE[type]](k);
      const { lit, glow } = k.build();
      this.meshes.set(key, { lit: this.inst(lit, 80), glow: glow ? this.inst(glow, 80, this.glowMat, false) : null });
    }
  }
  inst(geo, n, mat = this.mat, shadow = true) { const m = new THREE.InstancedMesh(geo, mat, n); m.castShadow = shadow; m.count = 0; m.frustumCulled = false; this.scene.add(m); return m; }

  // Places every unit: interpolated position, facing, a walking bob and a working swing.
  // look (during an age-up): { age: Map(id -> age still shown), pop: Map(id -> 0..1 flash) }.
  update(world, alpha, time, toWorld, look) {
    const carryN = { lumber: 0, gold: 0, food: 0 }, d = this.d;
    for (const m of this.meshes.values()) { m.lit.count = 0; if (m.glow) m.glow.count = 0; }
    for (const u of world.units()) {
      const age = look?.age.get(u.id) || world.teams[u.team].age || 'dark';
      let m = this.meshes.get(u.type + u.team + age);
      if (!m) { this.prepare(u.team, age); m = this.meshes.get(u.type + u.team + age); }
      if (!m || m.lit.count >= 80) continue;
      const pop = look?.pop.get(u.id) || 0;
      const x = u.px + (u.x - u.px) * alpha, y = u.py + (u.y - u.py) * alpha;
      const [wx, wz] = toWorld(x, y);
      const moving = u.path && u.path.length;
      const bob = moving ? Math.abs(Math.sin(time * (u.boost > 0 ? 13 : 9) + u.id)) * 0.06 : 0;
      const swing = (!moving && u.order && ['gather', 'build'].includes(u.order.type)) ? Math.sin(u.work * Math.PI * 2) * 0.35 : (u.cd > 0 && u.work > 0 && !moving ? Math.max(0, u.cd / 1.3) * 0.4 : 0);
      d.position.set(wx, bob + pop * 0.25, wz); d.rotation.set(swing * 0.6, Math.atan2(Math.cos(u.facing), Math.sin(u.facing)) + pop * 6.28, 0, 'YXZ'); d.scale.setScalar(1.05 * (1 + pop * 0.35)); d.updateMatrix();
      m.lit.setMatrixAt(m.lit.count++, d.matrix);
      if (m.glow) m.glow.setMatrixAt(m.glow.count++, d.matrix);
      if (u.carry && u.carry.amt > 1 && this.carry[u.carry.type]) {
        const c = this.carry[u.carry.type];
        d.position.set(wx, 1.32 + bob, wz); // carried loads ride on top, easy to see d.rotation.set(0, Math.atan2(Math.cos(u.facing), Math.sin(u.facing)), 0); d.scale.setScalar(1); d.updateMatrix();
        c.setMatrixAt(carryN[u.carry.type]++, d.matrix);
      }
    }
    for (const m of this.meshes.values()) { m.lit.instanceMatrix.needsUpdate = true; if (m.glow) m.glow.instanceMatrix.needsUpdate = true; }
    for (const [k, c] of Object.entries(this.carry)) { c.count = carryN[k]; c.instanceMatrix.needsUpdate = true; }
  }

  rings(list) {
    const d = this.d, col = new THREE.Color();
    this.ring.count = Math.min(list.length, 200);
    list.slice(0, 200).forEach(([wx, wz, r, color], i) => { d.position.set(wx, 0.04, wz); d.rotation.set(0, 0, 0); d.scale.setScalar(r); d.updateMatrix(); this.ring.setMatrixAt(i, d.matrix); col.set(color); this.ring.setColorAt(i, col); });
    this.ring.instanceMatrix.needsUpdate = true;
    if (this.ring.instanceColor) this.ring.instanceColor.needsUpdate = true;
  }
}
