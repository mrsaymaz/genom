// The age-up: the moment a nation enters its next age. For the student it is a short ceremony
// (about 7.5 s, tap to skip): the camera glides to the Town Center, the sky dims, the Town Center
// transforms in a burst of the nation's element, a shockwave rolls across the land and every
// building and unit takes its new form as the wave reaches it. For the rival, the same wave plays
// out on the map without stopping the game.
import { TILE, makeBuilding } from './render/art.js';
import { ELEMENTS } from './render/effects.js';
import { EMBLEMS } from './ui/icons.js';
import { CONFIG } from './config.js';

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = t => 1 - Math.pow(1 - t, 3);
const back = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const clamp = t => Math.max(0, Math.min(1, t));
const AGE_NUM = { dark: 1, mythic: 2, arcane: 3, celestial: 4 };

// Builds the next-age art of a team's buildings ahead of time (a few per frame during research).
export function prepareArts(game, team, age) {
  const store = game.agePrep || (game.agePrep = new Map());
  const key = game.world.teams[team].key;
  for (const b of game.world.buildings(team)) {
    const k = `${b.id}:${age}`;
    if (!store.has(k)) { store.set(k, makeBuilding(key, b.type, age)); return false; }
  }
  return true;
}

export class Ascension {
  constructor(game, team, age, { cinematic = true } = {}) {
    this.g = game; this.team = team; this.age = age; this.cinematic = cinematic;
    const w = game.world, v = game.view, t = w.teams[team];
    this.el = t.nation.art; this.E = ELEMENTS[this.el]; this.color = t.nation.color;
    this.t = 0; this.done = false; this.blocking = cinematic;
    const old = CONFIG.ages[CONFIG.ages.indexOf(age) - 1] || 'dark';
    this.tc = [...w.buildings(team)].find(b => b.type === 'towncenter');
    const [cx, cy] = this.tc ? w.center(this.tc) : [w.size / 2, w.size / 2];
    [this.ox, this.oz] = v.toWorld(cx, cy);
    this.t0 = cinematic ? 1.4 : 0.2; // when the Town Center transforms and the wave sets off
    // Buildings and units in order of distance from the Town Center: the wave reaches them in turn.
    const items = [];
    for (const b of w.buildings(team)) {
      if (!v.blds.has(b.id)) continue;
      const [bx, by] = w.center(b), [x, z] = v.toWorld(bx, by);
      items.push({ kind: 'bld', id: b.id, b, x, z, d: Math.hypot(x - this.ox, z - this.oz) });
    }
    v.unitLook = v.unitLook || { age: new Map(), pop: new Map() };
    for (const u of w.allUnits()) {
      if (u.team !== team) continue;
      v.unitLook.age.set(u.id, old);
      const [x, z] = v.toWorld(u.x, u.y);
      items.push({ kind: 'unit', id: u.id, x, z, d: Math.hypot(x - this.ox, z - this.oz) });
    }
    const far = Math.max(8, ...items.map(i => i.d));
    this.speed = far / (cinematic ? 3.6 : 3.2);
    for (const it of items) it.at = this.t0 + (it.id === this.tc?.id ? 0 : 0.25 + it.d / this.speed);
    this.items = items.sort((a, b) => a.at - b.at);
    this.anims = [];
    v.units.prepare(team, age);
    if (cinematic) this.begin();
  }

  // ---------- the cinematic frame: letterbox, title card, camera and light ----------
  begin() {
    const g = this.g, v = g.view;
    this.cam0 = { x: v.target.x, z: v.target.z, zoom: v.zoom };
    // Frame the Town Center a little below the middle, leaving the sky above for the title.
    const zoomTo = Math.max(10, Math.min(v.zoom, 22) * 0.72), up = zoomTo * 0.2 / Math.SQRT2;
    this.camTo = { x: this.ox - up, z: this.oz - up, zoom: zoomTo };
    this.light0 = { hemi: v.hemi.intensity, sun: v.sun.intensity, bg: v.scene.background.clone() };
    g.cancelPlacement?.(); g.hud.wheelAt = null; g.sel = [];
    const el = document.getElementById('ascend'), nat = g.world.teams[this.team].nation;
    el.style.setProperty('--tc', nat.color); el.style.setProperty('--td', nat.dark);
    el.querySelector('.emb').innerHTML = EMBLEMS[nat.art];
    el.querySelector('.k').textContent = `Age ${AGE_NUM[this.age]} of 4`;
    el.querySelector('h1').textContent = `The ${CONFIG.ageUp[this.age]?.name || this.age}`;
    el.querySelector('.s').textContent = `${nat.name} grows stronger!`;
    el.className = 'on';
    el.onpointerdown = e => { e.stopPropagation(); if (this.t > 0.6) this.skip(); };
    document.getElementById('app').classList.add('cinema');
    this.pillar = v.magic.pillar(this.ox, this.oz, { color: this.E.a, radius: 1.6, height: 26 });
    g.audio?.sfx('ascend');
  }

  update(dt) {
    if (this.done) return;
    this.t += dt;
    const t = this.t, g = this.g, v = g.view;
    if (this.cinematic) this.direct(t, dt);
    // The wave: buildings transform and units change as it reaches them.
    while (this.items.length && this.items[0].at <= t) this.reach(this.items.shift());
    this.anims = this.anims.filter(a => this.animate(a, dt));
    const pops = v.unitLook?.pop;
    if (pops) for (const [id, p] of pops) { const n = p - dt * 1.8; if (n <= 0) pops.delete(id); else pops.set(id, n); }
    const end = this.cinematic ? 7.6 : this.t0 + 4.6;
    if (t >= end && !this.items.length && !this.anims.length) this.finish();
  }

  direct(t, dt) {
    const g = this.g, v = g.view, el = document.getElementById('ascend');
    // Camera: glide in, then back to where the student was.
    const a = ease(clamp(t / 1.3)), b = ease(clamp((t - 6.2) / 1.2)), c0 = this.cam0, c1 = this.camTo;
    const lerp = (p, q, k) => p + (q - p) * k;
    const x = lerp(lerp(c0.x, c1.x, a), c0.x, b), z = lerp(lerp(c0.z, c1.z, a), c0.z, b), zoom = lerp(lerp(c0.zoom, c1.zoom, a), c0.zoom, b);
    v.target.set(x, 0, z); v.zoom = zoom; v.updateCamera();
    // Light: dusk while the power gathers, a flash, then a bright new day.
    const dim = clamp(t / 1.0) * (1 - clamp((t - 1.4) / 0.2)), flash = Math.exp(-Math.max(0, t - 1.4) * 3) * (t >= 1.4 ? 1 : 0), after = clamp((t - 1.6) / 2) * (1 - clamp((t - 6) / 1.5));
    const k = 1 - 0.42 * dim + 0.9 * flash + 0.15 * after;
    v.hemi.intensity = this.light0.hemi * k; v.sun.intensity = this.light0.sun * (k - 0.1 * dim);
    v.scene.background.copy(this.light0.bg).lerp(v.scene.background.clone().setRGB(0.12, 0.16, 0.32), dim * 0.55);
    if (v.scene.fog) v.scene.fog.color.copy(v.scene.background);
    // Power gathering at the Town Center: a vortex and a growing pillar of light.
    if (t < 1.5) {
      v.magic.emit(this.el, this.ox, this.oz, { n: Math.ceil(70 * dt), radius: 2.4, speed: 1.3, life: 1.6, size: 1.2 });
      this.pillar.opacity = 0.75 * clamp(t / 1.2); this.pillar.width = 0.3 + 0.7 * clamp(t / 1.3);
    } else {
      const k2 = clamp((t - 1.4) / 1.8);
      this.pillar.opacity = 0.7 * (1 - k2) * (1 - k2); this.pillar.width = 1 + k2 * 0.9;
    }
    if (!this.titled && t >= 1.45) {
      this.titled = true;
      el.classList.add('title', 'flash');
      g.audio?.speak(`Welcome to the ${CONFIG.ageUp[this.age]?.name || 'new age'}!`, true);
    }
    if (!this.out && t >= 6.9) { this.out = true; el.classList.add('out'); document.getElementById('app').classList.remove('cinema'); }
  }

  reach(it) {
    const g = this.g, v = g.view, w = g.world, big = it.id === this.tc?.id;
    if (it.kind === 'unit') {
      if (!w.get(it.id)) return;
      v.unitLook.age.delete(it.id); v.unitLook.pop.set(it.id, 1);
      if (this.onScreen(it)) { v.magic.emit(this.el, it.x, it.z, { n: 8, radius: 0.3, speed: 0.7, life: 0.9, size: 0.8 }); g.audio?.sfx('chime', 0.12); }
      return;
    }
    const b = w.get(it.id);
    if (!b || !v.blds.has(b.id)) return;
    if (big && this.cinematic) {
      // The Town Center: the big moment.
      v.magic.emit(this.el, it.x, it.z, { n: 160, radius: 2.2, speed: 2.2, life: 2.2, size: 1.5 });
      v.magic.emit(this.el, it.x, it.z, { n: 40, radius: 1.2, speed: 3, life: 1.8, size: 1.3, shape: 'star' });
      v.magic.ring(it.x, it.z, { color: this.E.b, from: 1, to: this.speed * 4.4, time: 3.4, width: 0.05 });
      setTimeout(() => !this.done && v.magic.ring(it.x, it.z, { color: this.E.a, from: 1, to: this.speed * 4, time: 3.2, width: 0.12 }), 220);
      g.audio?.sfx('crumble', 0.1);
    }
    const prepared = g.agePrep?.get(`${b.id}:${this.age}`);
    const small = Math.max(2, b.w);
    if (!b.built) { // still under construction: change at once, with a puff
      const r = v.swapArt(b, this.age, prepared);
      if (r) v.scene.remove(r.old.group);
      v.syncBuilding(b);
      return;
    }
    if (this.onScreen(it) || !this.cinematic) {
      v.magic.emit(this.el, it.x, it.z, { n: 18 + small * 8, radius: small * TILE * 0.35, speed: 1.2, life: 1.4, size: 1 });
      g.audio?.sfx('whoosh', 0.09);
    }
    const pillar = v.magic.pillar(it.x, it.z, { color: this.E.a, radius: small * TILE * 0.38, height: big ? 18 : 8 });
    const cur = v.blds.get(b.id).art;
    this.anims.push({ b, it, t: 0, old: cur, k0: cur.holder.scale.x, pillar, swapped: false, prepared, big });
  }

  // One building's transformation: the old form sinks into light, the new one rises from it.
  animate(a, dt) {
    const v = this.g.view, D = a.big ? 1.6 : 1.15, S = a.big ? 0.5 : 0.36;
    a.t += dt;
    const t = a.t;
    if (!this.g.world.get(a.b.id) || !v.blds.has(a.b.id)) { a.pillar.done = true; if (!a.swapped) v.scene.remove(a.old.group); return false; }
    if (t < S) {
      const e = easeOut(t / S);
      a.old.holder.scale.set(a.k0 * (1 + 0.12 * e), a.k0 * Math.max(0.02, 1 - e), a.k0 * (1 + 0.12 * e));
      a.old.group.position.x += (Math.random() - 0.5) * 0.04 * (1 - e);
    } else if (!a.swapped) {
      a.swapped = true;
      const r = v.swapArt(a.b, this.age, a.prepared);
      v.scene.remove(r.old.group);
      a.art = r.art; a.k1 = r.art.holder.scale.x;
      r.art.holder.scale.set(a.k1 * 0.85, a.k1 * 0.02, a.k1 * 0.85);
      if (this.onScreen(a.it)) v.magic.emit(this.el, a.it.x, a.it.z, { n: a.big ? 60 : 16, radius: 0.6, speed: a.big ? 2 : 1.4, life: 1.2, size: a.big ? 1.3 : 1, shape: 'star' });
    } else {
      const u = clamp((t - S) / (D - S));
      a.art.holder.scale.set(a.k1 * (0.85 + 0.15 * easeOut(u)), a.k1 * Math.max(0.02, back(u)), a.k1 * (0.85 + 0.15 * easeOut(u)));
    }
    // The pillar flares as the change happens, then fades.
    a.pillar.opacity = (t < S ? t / S : 1 - clamp((t - S) / (D - S + 0.3))) * (a.big ? 0.6 : 0.7);
    a.pillar.width = 0.6 + 0.6 * clamp(t / D);
    if (t >= D) { a.art.holder.scale.setScalar(a.k1); a.pillar.done = true; return false; }
    return true;
  }

  onScreen(it) { const v = this.g.view, [x, y] = v.screen(...v.toTile(it.x, it.z), 0.5); return x > -60 && y > -60 && x < v.w + 60 && y < v.h + 60; }

  // Tap to skip: everything takes its new form at once.
  skip() {
    if (this.done) return;
    for (const it of this.items) this.reach(it);
    this.items = [];
    for (const a of this.anims) { a.t = 99; this.animate(a, 0); if (!a.swapped) { a.swapped = true; const r = this.g.view.swapArt(a.b, this.age, a.prepared); if (r) { this.g.view.scene.remove(r.old.group); r.art.holder.scale.setScalar(r.art.holder.scale.x); } } a.pillar.done = true; }
    this.anims = [];
    this.finish();
  }

  finish() {
    if (this.done) return;
    this.done = true;
    const v = this.g.view;
    if (v.unitLook) { for (const [id] of [...v.unitLook.age]) if (this.g.world.get(id)?.team === this.team) v.unitLook.age.delete(id); if (!v.unitLook.age.size) v.unitLook = null; }
    if (this.cinematic) {
      const c = this.cam0; v.target.set(c.x, 0, c.z); v.zoom = c.zoom; v.updateCamera();
      v.hemi.intensity = this.light0.hemi; v.sun.intensity = this.light0.sun; v.scene.background.copy(this.light0.bg); if (v.scene.fog) v.scene.fog.color.copy(this.light0.bg);
      if (this.pillar) this.pillar.done = true;
      const el = document.getElementById('ascend');
      el.className = 'hidden'; el.onpointerdown = null;
      document.getElementById('app').classList.remove('cinema');
      this.g.hud.toast(`Welcome to the ${CONFIG.ageUp[this.age]?.name}! Your units and buildings are stronger.`);
    }
    if (this.g.agePrep) for (const k of [...this.g.agePrep.keys()]) if (k.endsWith(`:${this.age}`)) this.g.agePrep.delete(k);
  }
}
