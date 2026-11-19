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
  // An old stone bridge across the river (local x runs across, from bank to bank).
  bridge(r) {
    const out = [], L = TILE * 7.6, W = TILE * 2.3, stone = ['#b8ae98', '#a89e88', '#c4baa4'];
    out.push([box(L, 0.16, W, 0, 0.04), '#b0a68f']);
    for (let i = 0; i < 12; i++) out.push([box(L / 12 - 0.04, 0.03, W - 0.1, -L / 2 + (i + 0.5) * (L / 12), 0.135), stone[i % 3]]);
    for (const z of [-1, 1]) {
      for (let i = 0; i < 9; i++) { const x = -L / 2 + (i + 0.5) * (L / 9); out.push([box(L / 9 - 0.12, 0.42, 0.22, x, 0.33, z * (W / 2 - 0.11)), stone[(i + 1) % 3]]); }
      for (const x of [-L / 2 + 0.2, L / 2 - 0.2]) { out.push([box(0.4, 1.1, 0.4, x, 0.55, z * (W / 2 - 0.11)), '#9a9080']); out.push([new THREE.SphereGeometry(0.18, 7, 5).translate(x, 1.2, z * (W / 2 - 0.11)), '#c8bfaa']); }
    }
    // Arches and piers standing in the water.
    for (const x of [-L * 0.2, L * 0.2]) { out.push([box(0.7, 1.0, W - 0.2, x, -0.45, 0), '#8e8574']); out.push([box(1.0, 0.25, W, x, -0.05, 0), '#a29884']); }
    return out;
  },
  // One of the Twin Kings: a giant crowned statue, a hand raised to warn travellers off,
  // the other on a sword planted in the river. Faces local +x.
  king() {
    const st = '#a59d8b', st2 = '#b8b09c', moss = '#6f9a48';
    const out = [[box(2.2, 1.0, 2.0, 0, 0.2), '#8e8676'], [box(1.8, 0.4, 1.6, 0, 0.9), st]];
    out.push([cyl(0.62, 1.0, 3.6, 0, 2.9, 0, 8), st]); // the robe
    out.push([box(1.1, 0.55, 1.9, 0, 4.85), st2]); // shoulders
    out.push([new THREE.SphereGeometry(0.5, 9, 7).translate(0.05, 5.55, 0), st2]);
    out.push([box(0.28, 0.5, 0.5, 0.42, 5.3, 0), st]); // beard
    out.push([cyl(0.48, 0.44, 0.3, 0.05, 6.0, 0, 10), '#c9b77a']); // crown
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; out.push([cone(0.09, 0.32, 0.05 + Math.cos(a) * 0.4, 6.3, Math.sin(a) * 0.4, 4), '#c9b77a']); }
    const arm = cyl(0.2, 0.24, 1.9, 0, 0, 0, 6); arm.rotateZ(-1.15); arm.translate(0.75, 5.35, -0.85); out.push([arm, st]);
    out.push([box(0.22, 0.6, 0.45, 1.6, 5.95, -0.85), st2]); // the raised hand
    out.push([box(0.12, 3.6, 0.42, 1.25, 1.95, 0.75), '#9a958a']); // sword blade, point down
    out.push([box(0.2, 0.18, 1.1, 1.25, 3.85, 0.75), st2]); // crossguard
    out.push([cyl(0.08, 0.08, 0.6, 1.25, 4.2, 0.75, 6), st]);
    const fore = cyl(0.18, 0.2, 1.4, 0, 0, 0, 6); fore.rotateZ(-0.7); fore.translate(0.7, 4.3, 0.75); out.push([fore, st]);
    for (const [x, y, z, rr] of [[-0.5, 1.6, 0.6, 0.3], [0.3, 4.9, -0.7, 0.22], [-0.2, 3.0, -0.8, 0.25], [0.9, 0.9, 0.4, 0.3]]) out.push([dodec(rr, x, y, z), moss]);
    return out;
  },
  // A dragon's skeleton: skull at local +x, ribs arching over the spine, wings spread flat.
  dragon(r) {
    const bone = '#e9e0c9', bone2 = '#d8cdb2', dark = '#2a2620', out = [];
    const spine = x => Math.sin(x * 0.45) * 0.5;
    for (let i = 0; i < 26; i++) { const x = 4.4 - i * 0.45, k = 1 - i / 34; out.push([box(0.38 * k, 0.32 * k, 0.4 * k, x, 0.2, spine(x)), i % 2 ? bone : bone2]); out.push([cone(0.07 * k, 0.35 * k, x, 0.48 * k, spine(x), 4), bone2]); }
    for (let i = 0; i < 7; i++) { const x = 3.0 - i * 0.55, rr = 1.25 - Math.abs(i - 2) * 0.13; const rib = new THREE.TorusGeometry(rr, 0.11, 5, 12, Math.PI); rib.rotateY(Math.PI / 2); rib.rotateZ(0.25); rib.translate(x, 0.05, spine(x)); out.push([rib, i % 2 ? bone : bone2]); }
    // The skull, with horns sweeping back.
    { const c = cone(0.55, 2.0, 0, 0, 0, 6); c.rotateZ(-Math.PI / 2); c.scale(1, 0.75, 1); c.translate(6.2, 0.55, spine(5.3)); out.push([c, bone]); } // the long snout
    out.push([new THREE.DodecahedronGeometry(0.75, 1).scale(1, 0.8, 0.85).translate(5.1, 0.6, spine(5.3)), bone]); // the cranium
    { const j = cone(0.4, 1.9, 0, 0, 0, 5); j.rotateZ(-Math.PI / 2 - 0.12); j.scale(1, 0.4, 0.9); j.translate(6.0, 0.12, spine(5.3)); out.push([j, bone2]); } // the jaw
    for (const z of [-0.28, 0.28]) {
      out.push([new THREE.SphereGeometry(0.17, 6, 5).translate(5.45, 0.78, spine(5.3) + z * 0.55), dark]);
      const h = cone(0.2, 1.8, 0, 0, 0, 5); h.rotateZ(Math.PI / 2 + 0.35); h.rotateY(z * 0.5); h.translate(4.0, 1.15, spine(5.3) + z * 0.75); out.push([h, '#cfc3a4']);
      for (let k = 0; k < 5; k++) out.push([cone(0.06, 0.28, 5.6 + k * 0.28, 0.32, spine(5.3) + z * 0.32, 4), '#f6f0e0']);
    }
    // Wings: long finger bones fanned out on the ground.
    for (const z of [-1, 1]) {
      // The wing: an arm bone out to the side, then four long fingers fanning back.
      const arm = cyl(0.12, 0.15, 2.4, 0, 0, 0, 5); arm.rotateX(Math.PI / 2); arm.translate(2.3, 0.14, z * 2.0); out.push([arm, bone2]);
      for (let k = 0; k < 4; k++) {
        const len = 3.2 - k * 0.35, ang = 0.35 + k * 0.38, f = cyl(0.06, 0.09, len, 0, 0, 0, 4);
        f.rotateZ(Math.PI / 2); f.rotateY(z * ang); f.translate(2.3 - Math.cos(ang) * len / 2, 0.12, z * (3.2 + Math.sin(ang) * len / 2)); out.push([f, bone]);
      }
    }
    for (let i = 0; i < 4; i++) { const x = -0.8 - i * 0.9; out.push([box(0.5, 0.12, 0.12, x, 0.08, spine(x) + (i % 2 ? 0.6 : -0.6)), bone2]); }
    return out;
  },
  // The broken gate of the old kings: two great pillars and half a lintel, the rest fallen.
  gate(r) {
    const st = '#9e9686', st2 = '#b4ac9a', out = [], half = TILE * 2.4;
    for (const s2 of [-1, 1]) {
      out.push([box(1.2, 0.4, 1.2, s2 * half, 0.2), '#8a8272']);
      out.push([box(0.9, 4.4, 0.9, s2 * half, 2.6), st]);
      for (let k = 0; k < 4; k++) out.push([box(0.96, 0.08, 0.96, s2 * half, 1.1 + k * 1.0), st2]);
    }
    out.push([box(half + 1.4, 0.7, 1.1, -half / 2 + 0.2, 5.15), st2]);
    out.push([box(0.6, 0.5, 0.2, -0.3, 5.15, 0.6), '#c9b77a']); // the carved keystone
    const fallen = box(2.2, 0.65, 1.0, 0, 0, 0); fallen.rotateY(0.6); fallen.rotateZ(0.2); fallen.translate(half * 0.55, 0.35, 1.6); out.push([fallen, st2]);
    out.push([dodec(0.35, half * 0.2, 0.2, -1.4), st]);
    out.push([dodec(0.3, -half - 0.6, 0.3, 0.6), '#6f9a48']);
    return out;
  },
  // A fairy ring: mushrooms in a circle on a little lawn.
  ring(r) {
    const out = [];
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + r() * 0.2, rr = 1.45 + r() * 0.2, x = Math.cos(a) * rr, z = Math.sin(a) * rr, s2 = 0.7 + r() * 0.5;
      out.push([cyl(0.05 * s2, 0.06 * s2, 0.22 * s2, x, 0.11 * s2, z, 5), '#f2ead8']);
      out.push([new THREE.SphereGeometry(0.14 * s2, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(x, 0.2 * s2, z), i % 3 ? '#d8303a' : '#8a5ad0']);
    }
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

