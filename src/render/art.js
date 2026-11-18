// Bridges the concept-page models (window.GenomArt, generated from docs/concepts/) into the
// game, and "bakes" each building so it draws cheaply on phones: parts that never move are
// merged into a few meshes per material; moving parts (flames, sails, wind roses) stay live.
import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
const mergeBufferGeometries = (g, groups) => BufferGeometryUtils.mergeBufferGeometries(g, groups);
import { CONFIG } from '../config.js';

export const TILE = 1.5;
let LIB = null;

export function artLibrary() {
  if (LIB) return LIB;
  const G = window.GenomArt;
  if (!G || !G.buildings || !G.townCenters) throw new Error('The art scripts did not load.');
  const bld = G.buildings(THREE), tcs = G.townCenters(THREE);
  // In the game the map is the ground, so the display slabs of the concept pages go.
  for (const B of [bld.B, tcs.B]) for (const k of ['slab', 'base', 'slabWater']) B.prototype[k] = function () {};
  LIB = { bld, tcs };
  return LIB;
}

// Concept-page table index for each building role.
const ROLE_INDEX = { house: 0, farm: 1, storehouse: 2, barracks: 3, watchtower: 4 };
// The concept dioramas are drawn on slabs of these sizes; scale them to the game footprint.
const SLAB = { 2: 3.2, 3: 4.2, 4: 6.0 };

function sceneFor(team, type, age = 'dark') {
  const lib = artLibrary(), nat = CONFIG.teams[team].art;
  if (age === 'mythic') {
    if (type === 'towncenter') return { fn: (lib.tcs.MYTHNEW && lib.tcs.MYTHNEW[nat]) || lib.tcs.MYTHIC[nat], B: lib.tcs.B };
    return { fn: lib.bld.MYTHB[nat][ROLE_INDEX[type]], B: lib.bld.B };
  }
  if (type === 'towncenter') return { fn: lib.tcs.DARKNEW[nat] || lib.tcs.SCENES[nat], B: lib.tcs.B };
  const table = (lib.bld.NEWB && lib.bld.NEWB[nat]) || lib.bld.DARK[nat];
  return { fn: table[ROLE_INDEX[type]], B: lib.bld.B };
}

const sigCache = new WeakMap();
let sigN = 0;
function matSig(m) {
  if (sigCache.has(m)) return sigCache.get(m);
  const s = [m.type, m.color?.getHex(), m.emissive?.getHex(), m.emissiveIntensity, m.roughness, m.metalness, m.map ? m.map.uuid : 0,
    m.transparent, m.opacity, m.side, m.flatShading, m.alphaTest, m.depthWrite, m.vertexColors].join('|');
  sigCache.set(m, s); void sigN;
  return s;
}

function snapshot(meshes) {
  return meshes.map(o => ({
    m: o.matrixWorld.clone(), vis: o.visible,
    mat: Array.isArray(o.material) ? '' : [o.material.emissiveIntensity, o.material.opacity, o.material.map?.offset.x, o.material.map?.offset.y, o.scale.x].join(','),
  }));
}

function prepGeometry(o) {
  let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
  g.clearGroups();
  g.applyMatrix4(o.matrixWorld);
  return g;
}

// Builds one building for a team and returns { group, fx, height }.
export function makeBuilding(team, type, age = 'dark') {
  const { fn, B } = sceneFor(team, type, age);
  const root = new THREE.Group();
  const holder = new THREE.Group();
  root.add(holder);
  const b = new B(holder);
  fn(b);
  const fx = b.fx;
  fx.forEach(f => f(0, 0));
  holder.updateMatrixWorld(true);

  // Drop point lights (glow comes from emissive materials) and anything lying flat on the ground.
  const drop = [];
  holder.traverse(o => {
    if (o.isLight) drop.push(o);
    else if (o.isMesh) { const bb = new THREE.Box3().setFromObject(o); if (bb.max.y < 0.03) drop.push(o); }
  });
  for (const o of drop) o.parent?.remove(o);

  // Find the moving parts by running the animations at two other moments.
  const meshes = [];
  holder.traverse(o => { if (o.isMesh) meshes.push(o); });
  const a = snapshot(meshes);
  fx.forEach(f => f(1.37, 0.11)); holder.updateMatrixWorld(true);
  const c = snapshot(meshes);
  fx.forEach(f => f(2.91, 0.13)); holder.updateMatrixWorld(true);
  const d = snapshot(meshes);
  fx.forEach(f => f(0, 0)); holder.updateMatrixWorld(true);
  const moving = new Set();
  meshes.forEach((o, i) => { if (!a[i].m.equals(c[i].m) || !a[i].m.equals(d[i].m) || a[i].mat !== c[i].mat || a[i].mat !== d[i].mat) moving.add(o); });
  // Very busy animations (for example swaying wheat) are frozen so the farm stays cheap.
  const freeze = moving.size > 70;

  const groups = new Map();
  for (const o of meshes) {
    if ((!freeze && moving.has(o)) || Array.isArray(o.material) || o.isInstancedMesh || !o.geometry?.attributes?.position) continue;
    const s = matSig(o.material);
    if (!groups.has(s)) groups.set(s, { mat: o.material, geos: [] });
    groups.get(s).geos.push(prepGeometry(o));
    o.parent.remove(o);
  }
  const baked = new THREE.Group();
  for (const { mat, geos } of groups.values()) {
    const g = geos.length === 1 ? geos[0] : mergeBufferGeometries(geos, false);
    if (!g) continue;
    const m = new THREE.Mesh(g, mat);
    m.castShadow = true; m.receiveShadow = true;
    baked.add(m);
  }
  holder.add(baked);
  const box = new THREE.Box3().setFromObject(holder);
  const size = CONFIG.buildings[type].size, k = (size * TILE) / SLAB[size];
  holder.scale.setScalar(k);
  return { group: root, holder, fx: freeze ? [] : fx, height: (box.max.y || 2) * k };
}
