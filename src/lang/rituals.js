// The Wonders' rituals: the English tasks at a Celestial Wonder, staged in each nation's own way.
//   Tempest Hive     golden bees carry the words, each in a honeycomb cell, up into the hive; a
//                    storm gathers overhead with every verse
//   Moon Lighthouse  the words are stars; each one flies up and joins a constellation over the
//                    lighthouse, and the moon above grows brighter
//   Phoenix Forge    the words are glowing rune-ingots fed into the forge; flames rise round it
//                    and the phoenix's fire swells
//   Titan's Henge    the words are rune stones; each one lifts and joins a ring circling the titan,
//                    and the runes on the ground light up
// Used three ways (src/lang/jobs.js): the three-verse incantation before the superweapon strikes,
// one answer to feed a charging Wonder, and (with stones) raising the ward over the Town Center.
import * as THREE from 'three';
import { RIGHT, TOWARD } from './station.js';
import { ELEMENTS } from '../render/effects.js';

const lin = c => new THREE.Color(c).convertSRGBToLinear();
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: 0.6, flatShading: true, ...o });
const glow = (c, e, k = 1) => new THREE.MeshStandardMaterial({ color: lin(c), emissive: lin(e), emissiveIntensity: k, roughness: 0.4, flatShading: true });
const basic = (c, op = 1) => new THREE.MeshBasicMaterial({ color: lin(c), transparent: op < 1, opacity: op, depthWrite: op >= 1 });
const add = (g, geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; };

// The props, one look per nation.
const PROPS = {
  air() {
    const g = new THREE.Group(), bee = new THREE.Group(); bee.position.y = 1.35; g.add(bee);
    const body = add(bee, new THREE.SphereGeometry(0.26, 12, 9), glow('#ffd040', '#c88a10', 0.4)); body.scale.set(1.35, 1, 1);
    for (const x of [-0.08, 0.1]) { const r = add(bee, new THREE.TorusGeometry(0.235, 0.05, 5, 18), std('#2a2622')); r.rotation.y = Math.PI / 2; r.position.x = x; }
    add(bee, new THREE.SphereGeometry(0.14, 10, 8), std('#2a2622'), 0.36, 0.04, 0);
    const wings = [-1, 1].map(s => { const w = add(bee, new THREE.CircleGeometry(0.26, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }), -0.02, 0.22, s * 0.18); w.rotation.x = -Math.PI / 2; w.castShadow = false; return [w, s]; });
    const cell = add(g, new THREE.CylinderGeometry(0.28, 0.28, 0.3, 6), glow('#ffcf6a', '#ff9a10', 0.6), 0, 0.95, 0);
    bee.rotation.y = Math.PI / 4;
    g.userData = { bob: true, labelY: 2.0, wings };
    return g;
  },
  water() {
    const g = new THREE.Group();
    const star = add(g, new THREE.OctahedronGeometry(0.3, 0), glow('#f4fbff', '#8ac8ff', 1.8), 0, 1.3, 0); star.scale.y = 1.5; star.castShadow = false;
    for (let k = 0; k < 4; k++) { const r = add(g, new THREE.ConeGeometry(0.05, 0.42, 4), glow('#ffffff', '#bfe4ff', 1.5), Math.cos(k * Math.PI / 2) * 0.32, 1.3 + Math.sin(k * Math.PI / 2) * 0.32, 0); r.rotation.z = k * Math.PI / 2 - Math.PI / 2; r.castShadow = false; }
    const base = add(g, new THREE.CylinderGeometry(0.3, 0.38, 0.18, 12), std('#e8e2dc'), 0, 0.09, 0);
    add(g, new THREE.TorusGeometry(0.34, 0.03, 6, 20), std('#c8d0dc', { metalness: 0.6 }), 0, 0.2, 0).rotation.x = Math.PI / 2;
    void base;
    g.userData = { bob: true, labelY: 2.0, spin: star };
    return g;
  },
  fire() {
    const g = new THREE.Group();
    add(g, new THREE.BoxGeometry(0.75, 0.35, 0.45), std('#2e2626'), 0, 0.18, 0);
    add(g, new THREE.BoxGeometry(0.95, 0.12, 0.55), std('#3a3030'), 0, 0.41, 0);
    const ingot = add(g, new THREE.BoxGeometry(0.62, 0.22, 0.32), glow('#ffb060', '#ff5a10', 1.4), 0, 0.58, 0);
    add(g, new THREE.BoxGeometry(0.3, 0.03, 0.18), glow('#fff2b0', '#ffd040', 2), 0, 0.7, 0).castShadow = false;
    g.userData = { labelY: 1.35, heat: ingot };
    return g;
  },
  earth() {
    const g = new THREE.Group();
    const slab = add(g, new THREE.BoxGeometry(0.55, 1.15, 0.24), std('#8e9a8a'), 0, 0.58, 0); slab.rotation.z = 0.04;
    add(g, new THREE.BoxGeometry(0.08, 0.6, 0.02), glow('#c8ffd8', '#30e070', 1.6), 0, 0.62, 0.13).castShadow = false;
    add(g, new THREE.BoxGeometry(0.3, 0.06, 0.02), glow('#c8ffd8', '#30e070', 1.6), 0, 0.75, 0.13).castShadow = false;
    add(g, new THREE.DodecahedronGeometry(0.12, 0), std('#5f8a3a'), 0.18, 1.12, 0.05);
    g.rotation.y = Math.PI / 4;
    g.userData = { labelY: 1.6 };
    return g;
  },
};

// A ritual scene for the Wonder of the player's nation. power: 0 to 3 (one per verse).
export function ritual(game, { verses = 3 } = {}) {
  const art = game.world.teams[0].nation.art, E = ELEMENTS[art];
  const col = { air: '#ffd453', water: '#9fd8ff', fire: '#ff7a1f', earth: '#7cffa8' }[art];
  const R = {};
  const scene = {
    prop: () => { const o = PROPS[art](); o.scale.setScalar(1.35); o.userData.labelY *= 1.35; return o; },
    correct(st, p, k) {
      const v = st.g.view, top = st.focus.clone().setY(art === 'fire' ? 3.2 : 3.8);
      if (art === 'water' || art === 'earth') {
        // Stars and rune stones stay: they join the constellation or the stone ring.
        const n = st.it.kind === 'order' ? st.it.blocks.length : 1, slot = (R.placed = (R.placed || 0) + 1);
        const a = (slot / 9) * Math.PI * 2 + (art === 'water' ? 0.3 : 0), rad = art === 'water' ? 2.6 : 3.4;
        const to = new THREE.Vector3(Math.cos(a) * rad, art === 'water' ? 6.6 + Math.sin(slot * 1.7) * 0.5 : 3.4, Math.sin(a) * rad);
        const world = to.clone().add(st.focus);
        st.tween(p.obj, world, 0.75, { arc: 1.2, scale: art === 'water' ? 0.7 : 0.6, end: () => {
          p.obj.visible = false;
          const keep = p.obj.clone(); keep.scale.setScalar(art === 'water' ? 0.7 : 0.6); keep.position.copy(to); keep.visible = true; R.orbit.add(keep);
          if (art === 'water' && R.lastStar) { const a2 = R.lastStar, d = new THREE.Vector3().subVectors(to, a2), len = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 4), basic('#cfe8ff', 0.6)); m.position.copy(a2).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); R.orbit.add(m); }
          if (art === 'water') R.lastStar = to.clone().add(new THREE.Vector3(0, 0.9, 0));
          v.magic.emit(art, world.x, world.z, { n: 18, y: world.y, radius: 0.4, speed: 1, life: 1, size: 1, shape: 'star' });
        } });
        void n;
      } else {
        st.tween(p.obj, top, 0.7, { arc: 1.4, scale: 0.25, end: () => { p.obj.visible = false; v.magic.emit(art, st.focus.x, st.focus.z, { n: 26, y: top.y - 0.5, radius: 0.8, speed: 1.4, life: 1.1, size: 1, shape: art === 'air' ? 'star' : undefined }); } });
      }
      st.g.audio?.sfx(art === 'fire' ? 'flame' : art === 'air' ? 'gust' : art === 'water' ? 'splash' : 'roots', 0.35);
    },
    update(st, dt) {
      for (const p of st.props) {
        const u = p.obj.userData;
        if (u.wings) u.wings.forEach(([w, s]) => { w.rotation.x = -Math.PI / 2 + s * Math.sin(st.t * 40) * 0.6; });
        if (u.spin && !p.used) u.spin.rotation.y += dt * 2;
        if (u.heat) u.heat.material.emissiveIntensity = 1.2 + Math.sin(st.t * 4 + p.base.x) * 0.3;
      }
      if (!R.g) return;
      // The aura grows with every verse.
      R.shown += (R.power - R.shown) * Math.min(1, dt * 3);
      const k = R.shown / verses;
      R.ring.material.opacity = 0.25 + k * 0.6; R.ring.rotation.z += dt * (0.4 + k);
      R.beam.material.opacity = k * 0.35; R.beam.scale.set(0.6 + k * 0.6, 0.3 + k * 0.7, 0.6 + k * 0.6);
      R.orbit.rotation.y += dt * (art === 'earth' ? 0.6 : 0.15);
      if (R.extra) R.extra(st.t, k, dt);
    },
  };
  // The aura round the Wonder: a ring of light on the ground and a beam that grows verse by verse,
  // plus the nation's own sign of gathering power.
  const setup = st => {
    const g = new THREE.Group(); g.position.copy(st.focus); st.group.add(g);
    const ring = new THREE.Mesh(new THREE.RingGeometry(4.3, 4.8, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: lin(col), transparent: true, opacity: 0.25, depthWrite: false })); ring.position.y = 0.08; g.add(ring);
    const bgeo = new THREE.CylinderGeometry(1.4, 2.2, 14, 24, 1, true); bgeo.translate(0, 7, 0);
    const beam = new THREE.Mesh(bgeo, new THREE.MeshBasicMaterial({ color: lin(col), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); g.add(beam);
    const orbit = new THREE.Group(); g.add(orbit);
    Object.assign(R, { g, ring, beam, orbit, power: st.start || 0, shown: 0 });
    if (art === 'air') {
      // Storm clouds gather overhead, more with each verse, with flickers of lightning.
      const cm = new THREE.MeshStandardMaterial({ color: lin('#8a94a8'), emissive: lin('#2a3248'), emissiveIntensity: 0.3, transparent: true, opacity: 0.85, depthWrite: false });
      const clouds = [];
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, c = new THREE.Mesh(new THREE.SphereGeometry(0.7 + (i % 3) * 0.2, 10, 7), cm); c.position.set(Math.cos(a) * 3, 7.4 + (i % 2) * 0.3, Math.sin(a) * 3); c.scale.set(1.8, 0.7, 1.3); c.visible = false; orbit.add(c); clouds.push(c); }
      const bolt = new THREE.PointLight(lin('#fff4c0'), 0, 12, 2); bolt.position.y = 6; g.add(bolt);
      R.extra = (t, k) => { clouds.forEach((c, i) => { c.visible = i / clouds.length < k + 0.01; }); bolt.intensity = k >= 0.99 && Math.sin(t * 13) > 0.85 ? 4 : 0; };
    }
    if (art === 'water') {
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 14), new THREE.MeshStandardMaterial({ color: lin('#dce8f8'), emissive: lin('#8ab0ff'), emissiveIntensity: 0.2, roughness: 0.8 })); moon.position.y = 9; g.add(moon);
      R.extra = (t, k) => { moon.material.emissiveIntensity = 0.2 + k * 1.6; moon.scale.setScalar(0.8 + k * 0.5); };
    }
    if (art === 'fire') {
      const fm = [new THREE.MeshBasicMaterial({ color: lin('#ff6a14'), transparent: true, opacity: 0.85, depthWrite: false }), new THREE.MeshBasicMaterial({ color: lin('#ffb030'), transparent: true, opacity: 0.85, depthWrite: false })];
      const flames = [];
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, f = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.4, 5), fm[i % 2]); f.position.set(Math.cos(a) * 4.5, 0.7, Math.sin(a) * 4.5); g.add(f); flames.push([f, i]); }
      R.extra = (t, k) => flames.forEach(([f, i]) => { const s = 0.05 + k * (0.75 + Math.sin(t * 9 + i) * 0.3); f.scale.set(Math.max(0.05, k), s, Math.max(0.05, k)); f.position.y = s * 0.7; });
    }
    if (art === 'earth') {
      const runes = [];
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.7), new THREE.MeshBasicMaterial({ color: lin('#7cffa8'), transparent: true, opacity: 0, depthWrite: false })); m.position.set(Math.cos(a) * 3.9, 0.07, Math.sin(a) * 3.9); m.rotation.y = -a; g.add(m); runes.push(m); }
      R.extra = (t, k) => runes.forEach((m, i) => { m.material.opacity = i / runes.length < k ? 0.6 + Math.sin(t * 3 + i) * 0.3 : 0; });
    }
  };
  // A verse spoken: the power grows, with a burst and a chime.
  const verse = (st, i) => {
    R.power = Math.min(verses, i + 1);
    const v = st.g.view, f = st.focus;
    v.magic.emit(art, f.x, f.z, { n: 50, radius: 1.6, speed: 1.8, life: 1.4, size: 1.2, shape: 'star' });
    v.magic.ring(f.x, f.z, { color: col, from: 0.5, to: 4, time: 0.8, width: 0.15, solid: true });
    st.g.audio?.sfx('crown', 0.35);
    void E;
  };
  return { scene, setup, verse, color: col };
}

// The incantation's three verses, with what the coach says for each.
export const VERSES = [
  { name: 'Name the power', ask: 'Verse 1: name the power. Which word is it?' },
  { name: 'Speak the spell', ask: 'Verse 2: speak the spell. Tap the words in order!' },
  { name: 'Answer the Wonder', ask: 'Verse 3: the Wonder asks. Choose the right answer!' },
];
export { RIGHT, TOWARD };
