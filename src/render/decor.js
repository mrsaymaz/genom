// The arena's ornaments: palms around the oasis, the walled garden (hedges, cypresses, flower beds
// and a fountain), the ruined shrine (pillars and a statue), standing stones, and the lairs of the
// wild creatures. All of it is static, so it is merged into a few meshes.
import * as THREE from 'three';
import { TILE } from './art.js';
import { toWorld, coloured } from './terrain.js';
import { rng } from '../sim/rng.js';

const box = (w, h, d, x = 0, y = 0, z = 0) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const cyl = (rt, rb, h, x = 0, y = 0, z = 0, seg = 7) => new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z);
const cone = (r, h, x = 0, y = 0, z = 0, seg = 7) => new THREE.ConeGeometry(r, h, seg).translate(x, y, z);
const ico = (r, x = 0, y = 0, z = 0) => new THREE.IcosahedronGeometry(r, 0).translate(x, y, z);
const dodec = (r, x = 0, y = 0, z = 0) => new THREE.DodecahedronGeometry(r, 0).translate(x, y, z);

// Each piece: a list of [geometry, colour], built around (0, 0) with y up, about one tile wide.
const PIECES = {
  palm(r) {
    const out = [], lean = 0.25 + r() * 0.2;
    let x = 0, y = 0;
    for (let i = 0; i < 6; i++) { const g = cyl(0.09 - i * 0.006, 0.11 - i * 0.006, 0.42, x, y + 0.21, 0, 6); g.rotateZ(-lean * 0.15); out.push([g, i % 2 ? '#8a6a44' : '#7a5c3a']); x += lean * 0.12 * (1 + i * 0.25); y += 0.4; }
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2, leaf = box(0.9, 0.04, 0.22, 0.45, 0, 0);
      leaf.rotateZ(-0.45 - r() * 0.2); leaf.rotateY(a); leaf.translate(x, y + 0.05, 0);
      out.push([leaf, k % 2 ? '#3f9a3c' : '#4fae46']);
    }
    for (let k = 0; k < 3; k++) out.push([new THREE.SphereGeometry(0.07, 5, 4).translate(x + Math.cos(k * 2.1) * 0.1, y - 0.08, Math.sin(k * 2.1) * 0.1), '#6b4a22']);
    return out;
  },
  pillar(r) {
    return [[box(0.62, 0.16, 0.62, 0, 0.08), '#bdb4a0'], [cyl(0.2, 0.23, 1.9, 0, 1.1, 0, 10), '#d8d0bc'], [box(0.56, 0.16, 0.56, 0, 2.1), '#c8bfaa'], [dodec(0.14, 0.12, 2.22, 0.1), '#7ca052']];
  },
  broken(r) {
    const drum = cyl(0.2, 0.2, 0.7, 0, 0, 0, 10); drum.rotateZ(Math.PI / 2); drum.translate(0.55, 0.2, 0.3);
    return [[box(0.62, 0.16, 0.62, 0, 0.08), '#bdb4a0'], [cyl(0.2, 0.23, 0.75, 0, 0.52, 0, 10), '#d8d0bc'], [drum, '#cfc6b2'], [dodec(0.16, -0.2, 0.05, 0.3), '#7ca052']];
  },
  statue() {
    const arm = cyl(0.06, 0.07, 0.6, 0.18, 1.75, 0, 6); arm.rotateZ(-0.5);
    return [[box(0.8, 0.5, 0.8, 0, 0.25), '#a89f8a'], [cyl(0.2, 0.28, 0.9, 0, 0.95, 0, 8), '#c9c1ab'], [new THREE.SphereGeometry(0.17, 8, 6).translate(0, 1.55, 0), '#c9c1ab'], [arm, '#c9c1ab'], [dodec(0.18, -0.25, 0.55, 0.3), '#6f9a48'], [dodec(0.12, 0.2, 1.1, 0.15), '#7ca052']];
  },
  hedge(r) {
    return [[box(TILE * 1.02, 0.75, 0.6, 0, 0.38), '#3f7a34'], [box(TILE * 0.9, 0.12, 0.5, 0, 0.8), '#4b8a3c'], ...[0, 1, 2].map(i => [ico(0.12, -0.45 + i * 0.45, 0.82, (r() - 0.5) * 0.3), i === 1 ? '#f2a0c0' : '#fff4c0'])];
  },
  cypress() { return [[cyl(0.07, 0.09, 0.4, 0, 0.2, 0, 5), '#6b4a2c'], [cone(0.35, 2.2, 0, 1.3, 0, 7), '#2f5f34'], [cone(0.26, 1.4, 0, 1.75, 0, 7), '#3a7040']]; },
  fountain() {
    return [
      [cyl(0.72, 0.78, 0.38, 0, 0.19, 0, 8), '#c8bfaa'], [cyl(0.6, 0.6, 0.04, 0, 0.36, 0, 8), '#5fb0e0'],
      [cyl(0.1, 0.14, 0.8, 0, 0.6, 0, 8), '#d8d0bc'], [cyl(0.32, 0.14, 0.14, 0, 1.0, 0, 8), '#d8d0bc'], [cyl(0.27, 0.27, 0.03, 0, 1.07, 0, 8), '#7cc8f0'],
      [cone(0.07, 0.3, 0, 1.24, 0, 6), '#bfe6ff'],
    ];
  },
  bed(r) {
    const out = [[box(TILE * 0.9, 0.12, TILE * 0.55, 0, 0.06), '#6b4a2c']];
    const cols = ['#f2508a', '#ffd34a', '#c070f0', '#ffffff', '#ff8a3a'];
    for (let i = 0; i < 12; i++) out.push([ico(0.08, (r() - 0.5) * TILE * 0.8, 0.2, (r() - 0.5) * TILE * 0.45), cols[(r() * cols.length) | 0]]);
    return out;
  },
  stone(r) { const g = box(0.5, 1.7, 0.32, 0, 0.85); g.rotateZ((r() - 0.5) * 0.15); return [[g, '#8e8a82'], [dodec(0.12, 0.12, 1.5, 0.12), '#7ca052']]; },
  altar() { return [[box(0.3, 0.45, 0.6, -0.35, 0.22), '#8e8a82'], [box(0.3, 0.45, 0.6, 0.35, 0.22), '#8e8a82'], [box(1.2, 0.16, 0.8, 0, 0.52), '#a29e94']]; },
  den(r) {
    const out = [];
    for (let i = 0; i < 6; i++) out.push([dodec(0.35 + r() * 0.3, (r() - 0.5) * 1.1, 0.25 + r() * 0.3, -0.2 - r() * 0.3), '#857c6e']);
    const mouth = new THREE.CircleGeometry(0.38, 8, 0, Math.PI).translate(0, 0.02, 0.18); out.push([mouth, '#1e1a16']);
    out.push([box(0.5, 0.02, 0.3, 0.3, 0.01, 0.6), '#c8b89a']); // bones
    return out;
  },
  cave(r) {
    const out = [];
    for (let i = 0; i < 9; i++) out.push([dodec(0.5 + r() * 0.4, (r() - 0.5) * 1.8, 0.35 + r() * 0.5, -0.3 - r() * 0.5), '#7a7264']);
    out.push([new THREE.CircleGeometry(0.6, 10, 0, Math.PI).translate(0, 0.02, 0.25), '#16120e']);
    return out;
  },
  wallow(r) {
    const mud = new THREE.CircleGeometry(1.1, 10).rotateX(-Math.PI / 2).translate(0, 0.04, 0); mud.scale(1, 1, 0.7);
    const out = [[mud, '#6e5034']];
    for (let i = 0; i < 6; i++) { const a = r() * 6.28; out.push([cone(0.03, 0.5, Math.cos(a) * 1.05, 0.25, Math.sin(a) * 0.75, 4), '#5f8a3a']); }
    return out;
  },
};

export function buildDecor(world) {
  const list = world.map.decor || [], group = new THREE.Group();
  if (!list.length) return group;
  const r = rng(29), parts = [];
  for (const d of list) {
    const make = PIECES[d.kind];
    if (!make) continue;
    const [wx, wz] = toWorld(world.size, d.x, d.y);
    for (const [g, c] of make(r)) { g.scale(d.s, d.s, d.s); g.rotateY(-d.a); g.translate(wx, 0, wz); parts.push([g, c]); }
  }
  const geo = coloured(parts);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85, side: THREE.DoubleSide }));
  mesh.castShadow = mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

