// Unit models: small low-poly figures in team colours, drawn as one instanced mesh per type and team.
import * as THREE from 'three';
import { coloured } from './terrain.js';

const box = (w, h, d, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return g; };
const cyl = (rt, rb, h, x, y, z, rx = 0, rz = 0) => { const g = new THREE.CylinderGeometry(rt, rb, h, 7); g.rotateX(rx); g.rotateZ(rz); g.translate(x, y, z); return g; };
const sph = (r, x, y, z) => { const g = new THREE.SphereGeometry(r, 8, 6); g.translate(x, y, z); return g; };
const cone = (r, h, x, y, z, rx = 0) => { const g = new THREE.ConeGeometry(r, h, 6); g.rotateX(rx); g.translate(x, y, z); return g; };

const SKIN = '#e6b994', HAIR = '#4a3020', LEG = '#4a3a2c', WOOD = '#7a5432', IRON = '#9aa0a8';

export function unitGeometry(type, color, dark) {
  const common = [
    [cyl(0.07, 0.07, 0.36, -0.08, 0.18, 0), LEG], [cyl(0.07, 0.07, 0.36, 0.08, 0.18, 0), LEG],
    [cyl(0.17, 0.2, 0.42, 0, 0.57, 0), color], [box(0.42, 0.06, 0.24, 0, 0.42, 0), dark],
    [sph(0.13, 0, 0.92, 0), SKIN], [sph(0.135, 0, 0.97, -0.02), HAIR],
    [cyl(0.05, 0.05, 0.34, -0.22, 0.6, 0.02, 0, 0.25), color], [cyl(0.05, 0.05, 0.34, 0.22, 0.6, 0.02, 0, -0.25), color],
  ];
  if (type === 'worker') return coloured([...common, [cyl(0.025, 0.025, 0.55, 0.3, 0.55, 0.12, 0.5), WOOD], [box(0.16, 0.08, 0.04, 0.3, 0.8, 0.24), IRON], [cyl(0.2, 0.22, 0.05, 0, 1.05, 0), '#d8b878'], [cone(0.13, 0.12, 0, 1.12, 0), '#d8b878']]);
  if (type === 'spearman') return coloured([...common, [cyl(0.022, 0.022, 1.5, 0.28, 0.85, 0.05), WOOD], [cone(0.05, 0.18, 0.28, 1.65, 0.05), IRON], [cyl(0.2, 0.2, 0.05, -0.28, 0.6, 0.12, Math.PI / 2), dark], [cyl(0.08, 0.08, 0.06, -0.28, 0.6, 0.15, Math.PI / 2), color], [sph(0.145, 0, 0.99, 0), IRON], [cone(0.04, 0.12, 0, 1.15, 0), color]]);
  return coloured([...common, [cyl(0.018, 0.018, 0.9, -0.26, 0.7, 0.1, 0, 0), WOOD], [box(0.03, 0.9, 0.03, -0.18, 0.7, 0.18), '#c8b890'], [cyl(0.07, 0.07, 0.4, 0.12, 0.7, -0.17, 0.3), '#6b4a2c'], [cone(0.17, 0.3, 0, 1.06, -0.02), dark]]);
}

const CARRY = {
  lumber: () => coloured([[cyl(0.06, 0.06, 0.45, 0, 0, 0, 0, Math.PI / 2), '#8a5a32'], [cyl(0.06, 0.06, 0.45, 0, 0.1, 0.05, 0, Math.PI / 2), '#7a4a28']]),
  gold: () => coloured([[box(0.22, 0.14, 0.18, 0, 0, 0), '#6b4a2c'], [new THREE.OctahedronGeometry(0.09, 0).translate(0, 0.1, 0), '#f2c040']]),
  food: () => coloured([[cyl(0.13, 0.1, 0.14, 0, 0, 0), '#b08848'], [new THREE.SphereGeometry(0.06, 5, 4).translate(0.03, 0.08, 0), '#c8304a'], [new THREE.SphereGeometry(0.06, 5, 4).translate(-0.05, 0.08, 0.03), '#d84a3a']]),
};

export class UnitMeshes {
  constructor(scene, teams) {
    this.scene = scene;
    this.mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, flatShading: true });
    this.meshes = new Map();
    teams.forEach((t, i) => { for (const type of ['worker', 'spearman', 'archer']) this.meshes.set(type + i, this.inst(unitGeometry(type, t.nation.color, t.nation.dark), 80)); });
    this.carry = Object.fromEntries(Object.entries(CARRY).map(([k, f]) => [k, this.inst(f(), 80)]));
    this.ring = new THREE.InstancedMesh(new THREE.RingGeometry(0.36, 0.46, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ vertexColors: false, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }), 200);
    this.ring.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(200 * 3), 3);
    this.ring.count = 0; this.ring.renderOrder = 2;
    scene.add(this.ring);
    this.d = new THREE.Object3D();
  }
  inst(geo, n) { const m = new THREE.InstancedMesh(geo, this.mat, n); m.castShadow = true; m.count = 0; m.frustumCulled = false; this.scene.add(m); return m; }

  // Places every unit: interpolated position, facing, a walking bob and a working swing.
  update(world, alpha, time, toWorld) {
    const counts = new Map(), carryN = { lumber: 0, gold: 0, food: 0 }, d = this.d;
    for (const m of this.meshes.values()) m.count = 0;
    for (const u of world.units()) {
      const key = u.type + u.team, m = this.meshes.get(key);
      if (!m || m.count >= 80) continue;
      const x = u.px + (u.x - u.px) * alpha, y = u.py + (u.y - u.py) * alpha;
      const [wx, wz] = toWorld(x, y);
      const moving = u.path && u.path.length;
      const bob = moving ? Math.abs(Math.sin(time * 9 + u.id)) * 0.06 : 0;
      const swing = (!moving && u.order && ['gather', 'build'].includes(u.order.type)) ? Math.sin(u.work * Math.PI * 2) * 0.35 : (u.cd > 0 && u.work > 0 && !moving ? Math.max(0, u.cd / 1.3) * 0.4 : 0);
      const scale = u.team === 0 ? 1.1 : 1.05;
      d.position.set(wx, bob, wz); d.rotation.set(swing, Math.atan2(Math.cos(u.facing), Math.sin(u.facing)), 0, 'YXZ'); d.scale.setScalar(scale); d.updateMatrix();
      m.setMatrixAt(m.count++, d.matrix);
      if (u.carry && u.carry.amt > 1 && this.carry[u.carry.type]) {
        const c = this.carry[u.carry.type];
        d.position.set(wx - Math.cos(u.facing) * 0.18, 0.75 + bob, wz - Math.sin(u.facing) * 0.18); d.rotation.set(0, Math.atan2(Math.cos(u.facing), Math.sin(u.facing)), 0); d.scale.setScalar(1); d.updateMatrix();
        c.setMatrixAt(carryN[u.carry.type]++, d.matrix);
      }
      counts.set(key, m.count);
    }
    for (const m of this.meshes.values()) m.instanceMatrix.needsUpdate = true;
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
