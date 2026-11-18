// The landscape: terrain with a riverbed, water, rocks, groves, berry bushes and gold mines.
import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const mergeBufferGeometries = (g, groups) => BufferGeometryUtils.mergeBufferGeometries(g, groups);
import { T } from '../sim/map.js';
import { TILE } from './art.js';
import { rng } from '../sim/rng.js';

const lin = c => new THREE.Color(c).convertSRGBToLinear();

export function toWorld(size, tx, ty) { return [(tx - size / 2) * TILE, (ty - size / 2) * TILE]; }

function grassTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), r = rng(11);
  g.fillStyle = '#7fb24f'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 30; i++) { const x = r() * 256, y = r() * 256, rad = 20 + r() * 60, col = r() < 0.5 ? '90,140,50' : '170,205,110'; const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${col},0.35)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  g.lineWidth = 1.2;
  for (let i = 0; i < 5000; i++) { const x = r() * 256, y = r() * 256, l = 2 + r() * 4; g.strokeStyle = ['rgba(80,130,45,.55)', 'rgba(185,215,120,.5)', 'rgba(120,170,70,.5)'][(r() * 3) | 0]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 2, y - l); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  return t;
}

function waterTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = rng(5);
  g.fillStyle = '#3b8fc8'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 70; i++) { const x = r() * 128, y = r() * 128, l = 10 + r() * 22; g.strokeStyle = r() < 0.6 ? 'rgba(190,235,255,.55)' : 'rgba(20,70,120,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding;
  return t;
}

export function buildTerrain(world) {
  const { size, terrain } = world.map, group = new THREE.Group(), r = rng(3);
  const W = size * TILE;
  const at = (x, y) => (x < 0 || y < 0 || x >= size || y >= size ? T.GRASS : terrain[y * size + x]);
  // Ground: one vertex per tile corner; corners next to water dip into a riverbed.
  const geo = new THREE.PlaneGeometry(W, W, size, size);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3);
  const grassA = lin('#ffffff'), bed = lin('#8a7a5a'), sand = lin('#d8c99a'), ford = lin('#b9b08a');
  for (let i = 0; i < pos.count; i++) {
    const cx = Math.round(pos.getX(i) / TILE + size / 2), cy = Math.round(pos.getZ(i) / TILE + size / 2);
    let water = 0, fords = 0;
    for (const [dx, dy] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) { const t = at(cx + dx, cy + dy); if (t === T.WATER) water++; if (t === T.FORD) fords++; }
    let h = 0, col = grassA.clone();
    if (water + fords >= 1) { h = water >= 2 ? -0.45 : -0.18; col = water ? bed.clone() : ford.clone(); }
    else { let near = false; for (let dy = -2; dy <= 1; dy++) for (let dx = -2; dx <= 1; dx++) { const t = at(cx + dx, cy + dy); if (t === T.WATER || t === T.FORD) near = true; } if (near) col.lerp(sand, 0.45); }
    const n = (r() - 0.5) * 0.06; col.offsetHSL(0, 0, n);
    pos.setY(i, h + (h === 0 ? (r() - 0.5) * 0.04 : 0));
    cols[i * 3] = col.r; cols[i * 3 + 1] = col.g; cols[i * 3 + 2] = col.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  const gt = grassTexture(); gt.repeat.set(size / 4, size / 4);
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: gt, vertexColors: true, roughness: 0.95 }));
  ground.receiveShadow = true; ground.name = 'ground';
  group.add(ground);

  // The map edge: a slab of earth, like the concept dioramas.
  // Its top is left open: a lid would sit above the riverbed and hide the river.
  const side = new THREE.Mesh(new THREE.BoxGeometry(W, 1.6, W), [0, 1, 2, 3, 4, 5].map(i => (i === 2 ? new THREE.MeshBasicMaterial({ visible: false }) : new THREE.MeshStandardMaterial({ color: lin('#6b4b2e'), roughness: 1 }))));
  side.position.y = -0.82; group.add(side);

  // Water over the riverbed, with a gentle current.
  const wt = waterTexture(); wt.repeat.set(size / 3, size / 3);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(W, W), new THREE.MeshStandardMaterial({ map: wt, transparent: true, opacity: 0.82, roughness: 0.15, metalness: 0.1 }));
  water.rotation.x = -Math.PI / 2; water.position.y = -0.1; water.receiveShadow = true;
  group.add(water);

  // Stepping stones on the fords and rocky outcrops.
  const stones = [], rocks = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const [wx, wz] = toWorld(size, x + 0.5, y + 0.5);
    if (terrain[y * size + x] === T.FORD && r() < 0.35) { const g = new THREE.DodecahedronGeometry(0.18 + r() * 0.12, 0); g.scale(1, 0.45, 1); g.translate(wx + (r() - 0.5), -0.12, wz + (r() - 0.5)); stones.push(g); }
    if (terrain[y * size + x] === T.ROCK) for (let k = 0; k < 3; k++) { const g = new THREE.DodecahedronGeometry(0.45 + r() * 0.35, 0); g.scale(1, 0.6 + r() * 0.5, 1); g.rotateY(r() * 6); g.translate(wx + (r() - 0.5) * 0.8, 0.25, wz + (r() - 0.5) * 0.8); rocks.push(g); }
  }
  const stoneMat = new THREE.MeshStandardMaterial({ color: lin('#9a968c'), roughness: 0.9, flatShading: true });
  for (const list of [stones, rocks]) if (list.length) { const m = new THREE.Mesh(mergeBufferGeometries(list.map(g => (g.index ? g.toNonIndexed() : g))), stoneMat); m.castShadow = m.receiveShadow = true; group.add(m); }

  // Wild flowers for texture.
  const fl = [];
  for (let i = 0; i < Math.round(260 * size * size / 2304); i++) { const x = Math.floor(r() * size), y = Math.floor(r() * size); if (terrain[y * size + x] !== T.GRASS || world.occ[y * size + x]) continue; const [wx, wz] = toWorld(size, x + r(), y + r()); const g = new THREE.SphereGeometry(0.05, 4, 3); g.translate(wx, 0.05, wz); const c = lin(['#fff4c0', '#f2a0c0', '#c8b0ff', '#ffffff'][(r() * 4) | 0]); const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let k = 0; k < n; k++) { a[k * 3] = c.r; a[k * 3 + 1] = c.g; a[k * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); fl.push(g.toNonIndexed()); }
  if (fl.length) group.add(new THREE.Mesh(mergeBufferGeometries(fl), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 })));

  return { group, water: wt, ground };
}

// Merges coloured parts into one geometry with vertex colours, for instancing.
export function coloured(parts) {
  return mergeBufferGeometries(parts.map(([g, color]) => {
    const n = g.index ? g.toNonIndexed() : g;
    const c = lin(color), a = new Float32Array(n.attributes.position.count * 3);
    for (let i = 0; i < n.attributes.position.count; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
    n.setAttribute('color', new THREE.BufferAttribute(a, 3));
    for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'color'].includes(k)) n.deleteAttribute(k);
    return n;
  }));
}

// Trees, berry bushes and gold mines, kept in step with the simulation's resource nodes.
export class Resources {
  constructor(world, scene) {
    this.world = world; this.scene = scene; this.slots = new Map();
    const r = rng(17), size = world.size;
    const pine = coloured([[cyl(0.1, 0.16, 0.9, 0.45), '#6b4a2c'], [cone(0.75, 1.1, 1.25), '#2f6b36'], [cone(0.58, 0.95, 1.85), '#3a7d3f'], [cone(0.38, 0.75, 2.4), '#4a9050']]);
    const oak = coloured([[cyl(0.11, 0.17, 1.0, 0.5), '#6b4a2c'], [ico(0.72, 1.55), '#3f7a38'], [ico(0.5, 1.95, 0.32, 0.18), '#4a8a3e'], [ico(0.45, 1.5, -0.35, -0.2), '#356b30']]);
    const bush = coloured([[ico(0.42, 0.32), '#3f7a36'], ...[[0.2, 0.45, 0.25], [-0.25, 0.4, 0.1], [0.05, 0.55, -0.25], [0.3, 0.3, -0.15], [-0.15, 0.3, 0.3]].map(([x, y, z]) => [ball(0.08, x, y, z), '#c8304a'])]);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true });
    const trees = [...world.resources('tree')], bushes = [...world.resources('berries')];
    const make = (geo, n) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, n)); m.castShadow = m.receiveShadow = true; m.count = n; scene.add(m); return m; };
    const pines = trees.filter((_, i) => i % 3 !== 0), oaks = trees.filter((_, i) => i % 3 === 0);
    const pm = make(pine, pines.length), om = make(oak, oaks.length), bm = make(bush, bushes.length);
    const dummy = new THREE.Object3D();
    const set = (mesh, list, scaleBase) => list.forEach((e, i) => {
      const [wx, wz] = toWorld(size, e.x + 0.5 + (r() - 0.5) * 0.3, e.y + 0.5 + (r() - 0.5) * 0.3);
      dummy.position.set(wx, 0, wz); dummy.rotation.set(0, r() * 6.28, 0); const s = scaleBase * (0.85 + r() * 0.35); dummy.scale.set(s, s, s); dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix); this.slots.set(e.id, { mesh, i });
    });
    set(pm, pines, 1); set(om, oaks, 1); set(bm, bushes, 1);
    for (const m of [pm, om, bm]) m.instanceMatrix.needsUpdate = true;
    // Gold mines: rock heaps with glinting gold.
    const rockM = new THREE.MeshStandardMaterial({ color: lin('#8d877c'), roughness: 0.9, flatShading: true });
    const goldM = new THREE.MeshStandardMaterial({ color: lin('#f2c040'), emissive: lin('#8a5a00'), emissiveIntensity: 0.6, metalness: 0.8, roughness: 0.3, flatShading: true });
    for (const g of world.resources('gold')) {
      const grp = new THREE.Group();
      const [wx, wz] = toWorld(size, g.x + g.w / 2, g.y + g.h / 2);
      grp.position.set(wx, 0, wz);
      for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + r() * 0.5, 0), rockM); m.position.set((r() - 0.5) * 1.8, 0.3 + r() * 0.3, (r() - 0.5) * 1.8); m.scale.y = 0.7; m.castShadow = m.receiveShadow = true; grp.add(m); }
      for (let k = 0; k < 9; k++) { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.16 + r() * 0.12, 0), goldM); m.position.set((r() - 0.5) * 1.7, 0.45 + r() * 0.6, (r() - 0.5) * 1.7); m.rotation.set(r(), r(), r()); grp.add(m); }
      scene.add(grp);
      this.slots.set(g.id, { group: grp });
    }
  }

  remove(id) {
    const s = this.slots.get(id);
    if (!s) return;
    if (s.group) this.scene.remove(s.group);
    else { const m = new THREE.Matrix4().makeScale(0, 0, 0); s.mesh.setMatrixAt(s.i, m); s.mesh.instanceMatrix.needsUpdate = true; }
    this.slots.delete(id);
  }
}

function cyl(rt, rb, h, y) { const g = new THREE.CylinderGeometry(rt, rb, h, 6); g.translate(0, y, 0); return g; }
function cone(r, h, y) { const g = new THREE.ConeGeometry(r, h, 7); g.translate(0, y, 0); return g; }
function ico(r, y, x = 0, z = 0) { const g = new THREE.IcosahedronGeometry(r, 0); g.translate(x, y, z); return g; }
function ball(r, x, y, z) { const g = new THREE.SphereGeometry(r, 6, 4); g.translate(x, y, z); return g; }
