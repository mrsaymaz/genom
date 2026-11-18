// Genom (working title): the first playable slice. A Dark Age tutorial skirmish against one
// rival on Sunmeadow Vale, with no language tasks yet.
import { CONFIG, TEAM_IDS } from './config.js';
import { World } from './sim/world.js';
import { RivalAI } from './sim/ai.js';
import { View } from './render/view.js';
import { TILE, artLibrary } from './render/art.js';
import { Input } from './input.js';
import { HUD } from './ui/hud.js';
import { ICONS, EMBLEMS } from './ui/icons.js';
import { Tutorial } from './tutorial.js';
import { Audio } from './audio.js';
import { installGate } from './ui/install.js';

const STEP = 1 / 20;
const plural = (name, n) => (n === 1 || name.endsWith('s') ? name : name.endsWith('man') ? `${name.slice(0, -3)}men` : `${name}s`);
const $ = s => document.querySelector(s);
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode or full */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* private mode */ } },
};
const SAVE_KEY = 'genom.save';
const audio = new Audio();
const QUALITIES = ['high', 'medium', 'low'];
// The quality a device starts on when the setting is Auto: what worked last time, or a guess.
function autoQuality() {
  const last = store.get('genom.autoQuality', null);
  if (QUALITIES.includes(last)) return last;
  const weak = matchMedia('(pointer: coarse)').matches || (navigator.deviceMemory || 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4;
  return weak ? 'medium' : 'high';
}
function loadSave() { try { const d = JSON.parse(store.get(SAVE_KEY, 'null')); return d && d.v === 1 ? d : null; } catch { return null; } }

class Game {
  constructor({ team, pace }, saved = null) {
    this.audio = audio;
    if (saved) {
      // Continue a saved match.
      this.rivalKey = saved.rivalKey;
      this.world = World.load(saved.world);
      this.ai = new RivalAI(this.world, 1); this.ai.load(saved.ai);
    } else {
      const rivals = TEAM_IDS.filter(t => t !== team);
      this.rivalKey = rivals[Math.floor(Math.random() * rivals.length)];
      this.world = new World({ teams: [team, this.rivalKey], pace });
      this.ai = new RivalAI(this.world, 1);
    }
    const old = $('#view'), fresh = old.cloneNode(false); old.replaceWith(fresh); // a clean WebGL context each match
    this.canvas = fresh;
    this.qualitySetting = store.get('genom.quality', 'auto');
    this.view = new View(this.canvas, this.world, this.qualitySetting === 'auto' ? autoQuality() : this.qualitySetting);
    this.fps = { frames: 0, t: 0, checks: 0 };
    this.sel = []; this.placing = null; this.rallyMode = false; this.amoveMode = false; this.focus = null;
    this.paused = false; this.over = false; this.pings = [];
    this.calmFor = 0; this.raided = false; this.alertT = 0; this.saveT = 0; this.workT = 0;
    this.hudLayout = store.get('genom.hudLayout', 'corner');
    this.hud = new HUD($('#hud'), this);
    this.tutorial = new Tutorial(this);
    if (saved) { this.tutorial.i = saved.tutorial; this.raided = saved.raided; this.calmFor = saved.calmFor; }
    this.input = new Input(this.canvas, this);
    // Size the view to the canvas as it is actually shown. On iPhone, Safari's bars make the
    // visible area smaller than 100vh, which used to stretch the picture and shift every tap.
    this.onResize = () => { const r = this.canvas.getBoundingClientRect(); this.view.resize(Math.round(r.width), Math.round(r.height)); };
    window.visualViewport?.addEventListener('resize', this.onResize);
    addEventListener('resize', this.onResize); this.onResize();
    if (saved?.cam) { this.view.target.set(saved.cam.x, 0, saved.cam.z); this.view.zoom = saved.cam.zoom; this.view.updateCamera(); } else {
      const tc = this.home();
      this.view.centerOn(tc.x + 3, tc.y - 1);
    }
    this.acc = 0; this.last = performance.now(); this.time = 0;
    this.frame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.frame);
    // Save whenever the student leaves the page (another app, the tab closing, the screen locking).
    this.onHide = () => { if (document.visibilityState === 'hidden') { this.save(); if (!this.paused) this.togglePause(true); } };
    this.onPageHide = () => this.save();
    document.addEventListener('visibilitychange', this.onHide);
    addEventListener('pagehide', this.onPageHide);
    if (this.world.teams[0].bell) this.hud.bellAlert();
    const r = CONFIG.teams[this.rivalKey];
    this.hud.toast(saved ? 'Welcome back! Your match is just as you left it.' : `Your rival is ${r.name} (${r.element}).`);
  }

  // ---------- saving ----------
  save() {
    if (this.over) return;
    const v = this.view;
    store.set(SAVE_KEY, JSON.stringify({
      v: 1, savedAt: Date.now(), team: this.world.teams[0].key, rivalKey: this.rivalKey, pace: this.world.pace,
      world: this.world.save(), ai: this.ai.save(), tutorial: this.tutorial.i, raided: this.raided, calmFor: this.calmFor,
      cam: { x: v.target.x, z: v.target.z, zoom: v.zoom },
    }));
  }

  // ---------- graphics quality ----------
  setQuality(setting) {
    this.qualitySetting = setting;
    store.set('genom.quality', setting);
    this.view.setQuality(setting === 'auto' ? autoQuality() : setting);
    this.fps = { frames: 0, t: 0, checks: 0 };
  }
  // On Auto, a slow device steps down a level (after a warm-up), and remembers it for next time.
  watchFps(dt) {
    if (this.qualitySetting !== 'auto' || this.paused) return;
    const f = this.fps;
    f.frames++; f.t += dt;
    if (f.t < (f.checks ? 6 : 9)) return;
    const fps = f.frames / f.t;
    f.frames = 0; f.t = 0; f.checks++;
    const i = QUALITIES.indexOf(this.view.quality);
    if (fps < 26 && i < QUALITIES.length - 1) {
      const next = QUALITIES[i + 1];
      this.view.setQuality(next);
      store.set('genom.autoQuality', next);
      this.hud.toast(`Graphics set to ${next} so the game runs smoothly.`);
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    document.removeEventListener('visibilitychange', this.onHide);
    removeEventListener('pagehide', this.onPageHide);
    this.input.dispose();
    removeEventListener('resize', this.onResize);
    window.visualViewport?.removeEventListener('resize', this.onResize);
    this.view.renderer.dispose(); this.view.renderer.forceContextLoss();
    $('#hud').innerHTML = '';
  }

  home() { return [...this.world.buildings(0)].find(b => b.type === 'towncenter'); }

  // ---------- main loop ----------
  frame(now) {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.input.update(dt);
    if (!this.paused && !this.over) {
      this.acc += dt;
      while (this.acc >= STEP) {
        this.acc -= STEP;
        this.world.step(STEP);
        this.ai.update(STEP);
        this.events();
        this.watch(STEP);
      }
      this.tutorial.update(dt);
      this.saveT += dt;
      if (this.saveT > 20) { this.saveT = 0; this.save(); }
      this.workSounds(dt);
    }
    this.watchFps(dt);
    for (const b of this.world.buildings()) if (!b.built) this.view.syncBuilding(b);
    this.pings = this.pings.filter(p => (p.t -= dt / 3) > 0);
    this.sel = this.sel.filter(id => { const e = this.world.get(id); return e && !e.inside; });
    this.hud.update(dt);
    // Turning the phone: iOS reports the new size before the turn has finished, so check the
    // canvas size every frame and resize when it really changed.
    const cw = this.canvas.clientWidth, ch = this.canvas.clientHeight;
    if (cw && ch && (cw !== this.view.w || ch !== this.view.h)) this.view.resize(cw, ch);
    this.view.render(this.paused ? 0 : this.acc / STEP, this.time, dt, this.rings());
  }

  // Sim events become visuals and messages.
  events() {
    const w = this.world, v = this.view;
    for (const ev of w.drainEvents()) {
      if (ev.type === 'placed') v.addBuilding(w.get(ev.id));
      else if (ev.type === 'built') {
        const b = w.get(ev.id);
        if (b) { v.syncBuilding(b); if (b.team === 0) { this.hud.toast(`${CONFIG.buildings[b.type].name} complete.`); audio.sfx('built'); audio.say('built', b.type, true); } }
      } else if (ev.type === 'trained' && ev.team === 0) {
        const u = w.get(ev.id);
        if (u) { const n = w.def(0, u.type).name; audio.sfx('trained'); audio.speak(`${/^[AEIOU]/.test(n) ? 'An' : 'A'} ${n} is ready.`); }
      } else if (ev.type === 'deposit' && ev.team === 0) {
        const u = w.get(ev.id);
        if (u && this.onScreen1(u.x, u.y)) audio.sfx('deposit', 0.15);
        this.hud.gain(ev.kind, ev.amt);
      } else if (ev.type === 'removed') {
        v.removeEntity(ev);
        if (ev.cat === 'bld') audio.sfx('crumble', 0.3);
        if (ev.cat === 'bld' && ev.team === 0) this.hud.toast(`Your ${CONFIG.buildings[ev.kind].name} was destroyed.`, 'bad');
      } else if (ev.type === 'hit') {
        const a = w.get(ev.from), t = w.get(ev.to);
        if (!a || !t) continue;
        const [bx, by] = w.center(t);
        if (ev.ranged) { const [ax, ay] = w.center(a); v.arrow(v.toWorld(ax, ay), v.toWorld(bx, by)); }
        else if (t.cat === 'bld' && Math.random() < 0.3) { const [x, z] = v.toWorld(bx, by); v.dust({ x, z }, 2, t.w * TILE * 0.8); }
        if (this.onScreen1(bx, by)) audio.sfx(ev.ranged ? 'arrow' : 'clash', 0.09);
        if (t.team === 0 && a.team !== 0 && this.world.time - this.alertT > 20) {
          this.alertT = this.world.time;
          this.pings.push({ x: bx, y: by, t: 1 });
          if (!this.onScreen1(bx, by) || !this.hud.alertOn) {
            audio.sfx('alarm'); audio.say('underAttack', undefined, true);
            const workersHit = t.cat === 'unit' && t.type === 'worker';
            this.hud.alert('We are under attack!', [
              { label: 'Go there', icon: ICONS.army, act: () => this.view.centerOn(bx, by) },
              ...(workersHit || t.type === 'towncenter' ? [{ label: 'Ring the bell', icon: ICONS.bell, act: () => this.ringBell() }] : []),
            ], 'bad', 10);
          }
        }
      } else if (ev.type === 'wave' && ev.team !== 0) {
        // The rival's army has set off: warn early, while there is still time to get ready.
        const units = ev.ids.map(id => w.get(id)).filter(Boolean);
        if (!units.length) continue;
        const ax = units.reduce((s2, u) => s2 + u.x, 0) / units.length, ay = units.reduce((s2, u) => s2 + u.y, 0) / units.length;
        this.pings.push({ x: ax, y: ay, t: 1 });
        audio.sfx('alarm'); audio.say('wave', undefined, true);
        this.hud.alert(`Enemy army coming: ${units.length} soldiers!`, [
          { label: 'Show me', icon: ICONS.army, act: () => { const alive = units.filter(u => w.get(u.id)); if (alive[0]) this.view.centerOn(alive[0].x, alive[0].y); } },
          { label: 'Ring the bell', icon: ICONS.bell, act: () => this.ringBell() },
        ], 'bad', 14);
      } else if (ev.type === 'end') this.end(ev.winner === 0);
    }
  }

  // Tracks whether the rival's raid has reached the base and been beaten off (tutorial goal),
  // and suggests the all-clear once the danger has passed.
  watch(dt) {
    const tc = this.home();
    if (!tc) return;
    const [cx, cy] = this.world.center(tc);
    const near = [...this.world.units()].some(u => u.team !== 0 && u.type !== 'worker' && Math.hypot(u.x - cx, u.y - cy) < 15);
    if (near) { this.raided = true; this.calmFor = 0; } else this.calmFor += dt;
    if (this.world.teams[0].bell && this.calmFor > 6 && !this.safeHinted) { this.safeHinted = true; this.hud.bellAlert(true); }
  }

  // ---------- the Town bell ----------
  ringBell() {
    const n = this.world.ringBell(0);
    if (!n) { this.hud.toast('No workers are outside.'); return; }
    this.safeHinted = false;
    audio.sfx('bell'); audio.say('bell', undefined, true);
    this.sel = this.sel.filter(id => this.world.get(id)?.type !== 'worker');
    this.hud.bellAlert();
  }
  allClear() {
    this.world.allClear(0);
    audio.sfx('clear'); audio.say('allClear', undefined, true);
    this.hud.clearAlert();
  }

  onScreen1(tx, ty) { const [x, y] = this.view.screen(tx, ty, 0.5); return x > -40 && y > -40 && x < this.view.w + 40 && y < this.view.h + 40; }
  // Now and then, a working sound from a worker on screen: chopping, digging, picking, hammering.
  workSounds(dt) {
    this.workT -= dt;
    if (this.workT > 0) return;
    this.workT = 0.7 + Math.random() * 0.9;
    const busy = [...this.world.units()].filter(u => u.team === 0 && u.type === 'worker' && !(u.path && u.path.length) && (u.order?.type === 'gather' || u.order?.type === 'build') && this.onScreen1(u.x, u.y));
    if (!busy.length) return;
    const u = busy[Math.floor(Math.random() * busy.length)], t = this.world.get(u.order.target);
    if (!t || this.world.distTo(u, t) > 1.2) return;
    audio.sfx(u.order.type === 'build' ? 'hammer' : t.kind === 'tree' ? 'chop' : t.kind === 'gold' ? 'mine' : 'pick', 0.3);
  }

  rings() {
    const w = this.world, v = this.view, out = [];
    for (const id of this.sel) {
      const e = w.get(id);
      if (!e) continue;
      const col = e.team === 0 ? '#7dff9a' : e.team === undefined ? '#ffe08a' : '#ff6060';
      const [cx, cy] = w.center(e), [x, z] = v.toWorld(cx, cy);
      out.push([x, z, e.cat === 'unit' ? 1 : (e.w || 1) * TILE * 0.85, col]);
    }
    if (this.placing === null) for (const b of w.buildings(0)) if (this.sel.length === 1 && this.sel[0] === b.id && b.rally) { const [x, z] = v.toWorld(b.rally.x + 0.5, b.rally.y + 0.5); out.push([x, z, 0.7, '#ffffff']); }
    return out;
  }

  // ---------- picking ----------
  // Finds what is under a screen point: units first, then buildings, then resources.
  entityAt(sx, sy) {
    const w = this.world, v = this.view, ppu = v.ppu;
    let best = null, bs = 1;
    const test = (e, tx, ty, hgt, rad, bias) => {
      const [x, y] = v.screen(tx, ty, hgt), s = Math.hypot(x - sx, y - sy) / (rad * ppu) * bias;
      if (s < bs) { bs = s; best = e; }
    };
    const touch = Math.max(1, 22 / ppu);
    for (const u of w.units()) test(u, u.x, u.y, 0.55, Math.max(0.55, touch), 0.7);
    for (const b of w.buildings()) { const [cx, cy] = w.center(b); test(b, cx, cy, 0.9, b.w * TILE * 0.55, 1); }
    for (const r of w.resources()) { const [cx, cy] = w.center(r); test(r, cx, cy, r.kind === 'tree' ? 1.1 : 0.4, r.kind === 'gold' ? 1.4 : 0.7, 1.05); }
    return best;
  }

  // ---------- input actions ----------
  tap(sx, sy, dbl) {
    this.tutorial.acted();
    if (this.hud.wheelAt) { this.hud.wheelAt = null; return; } // a tap on the map closes the build wheel
    if (this.placing) {
      const tile = this.view.pick(sx, sy), p = this.placing, s = CONFIG.buildings[p.type].size;
      if (tile && tile[0] >= p.x && tile[0] < p.x + s && tile[1] >= p.y && tile[1] < p.y + s) this.confirmPlacement();
      else this.moveGhost(sx, sy);
      return;
    }
    const w = this.world, target = this.entityAt(sx, sy), tile = this.view.pick(sx, sy);
    if (this.rallyMode) {
      const rally = tile && { x: Math.floor(tile[0]), y: Math.floor(tile[1]), target: target && target.cat === 'res' ? target.id : (target?.cat === 'bld' && CONFIG.buildings[target.type].farm ? target.id : null) };
      if (rally) for (const id of this.sel) { const b = w.get(id); if (b?.cat === 'bld') b.rally = rally; }
      this.rallyMode = false;
      return;
    }
    if (this.amoveMode) {
      // Attack-move: walk there and fight everything met on the way.
      this.amoveMode = false;
      const ids = this.sel.filter(id => { const u = w.get(id); return u?.cat === 'unit' && u.team === 0; });
      if (target && target.team !== undefined && target.team !== 0) w.orderAttack(ids, target.id);
      else if (tile) w.orderAttackMove(ids, tile[0], tile[1]);
      if (tile) { const [x, z] = this.view.toWorld(tile[0], tile[1]); this.flag(x, z, '#ff6060'); }
      audio.sfx('order'); audio.say('attack');
      return;
    }
    const mine = this.sel.map(id => w.get(id)).filter(e => e && e.team === 0 && e.cat === 'unit');
    if (target && target.team === 0) {
      // Workers tapping their own unfinished building or a farm get to work instead of selecting it.
      const workers = mine.filter(u => u.type === 'worker');
      if (workers.length && target.cat === 'bld' && (!target.built || CONFIG.buildings[target.type].farm)) { this.order(mine, target, tile); return; }
      if (dbl) { this.selectAllOf(target); return; }
      this.focus = target.id;
      const closing = this.sel.length === 1 && this.sel[0] === target.id && target.cat === 'bld';
      this.sel = closing ? [] : [target.id];
      if (!closing) this.greet(target);
      return;
    }
    if (mine.length) { this.order(mine, target, tile); return; }
    this.sel = target ? [target.id] : [];
    if (target) audio.sfx('select');
  }
  // A selected unit answers in English.
  greet(e) {
    audio.sfx('select');
    if (e.cat === 'unit') audio.say(e.type === 'worker' ? 'selectWorker' : 'selectSoldier');
  }
  // Long-press: on a worker, open the build wheel; on anything else of yours, select all of that kind.
  longPress(sx, sy) {
    if (this.placing || this.rallyMode || this.amoveMode) return false;
    const t = this.entityAt(sx, sy);
    if (!t || t.team !== 0) return false;
    if (t.cat === 'unit' && t.type === 'worker') {
      if (!this.sel.includes(t.id)) this.sel = [t.id];
      this.hud.wheelAt = [t.x, t.y];
      return true;
    }
    this.selectAllOf(t);
    return true;
  }
  // Every built building of that type, or every unit of that type on screen.
  selectAllOf(t) {
    this.focus = t.id;
    if (t.cat === 'bld') {
      const all = [...this.world.buildings(0)].filter(b => b.type === t.type && (b.built || b.id === t.id)).map(b => b.id);
      this.sel = [t.id, ...all.filter(id => id !== t.id)];
      if (all.length > 1) this.hud.toast(`All ${all.length} ${plural(CONFIG.buildings[t.type].name, all.length)} selected.`);
    } else this.sel = this.onScreen(u => u.type === t.type);
    this.greet(t);
  }
  command(sx, sy) {
    if (this.placing) { this.cancelPlacement(); return; }
    const mine = this.sel.map(id => this.world.get(id)).filter(e => e && e.team === 0 && e.cat === 'unit');
    if (mine.length) this.order(mine, this.entityAt(sx, sy), this.view.pick(sx, sy));
  }
  order(units, target, tile) {
    if (!tile && !target) return;
    const [tx, ty] = target ? this.world.center(target) : tile;
    const what = this.world.command(units.map(u => u.id), target, tx, ty);
    if (!what) return;
    const [x, z] = this.view.toWorld(target ? tx : tile[0], target ? ty : tile[1]);
    this.flag(x, z, what === 'attack' ? '#ff6060' : '#ffffff');
    audio.sfx('order');
    const line = what === 'gather' ? (target.cat === 'bld' ? 'farm' : { tree: 'gatherLumber', gold: 'gatherGold', berries: 'gatherFood' }[target.kind]) : what === 'return' ? 'move' : what;
    audio.say(line);
  }
  flag(x, z, color) { this.view.dust({ x, z }, 3, 0.4); void color; }
  hover(sx, sy) { if (this.placing) this.moveGhost(sx, sy); }

  onScreen(filter) {
    const v = this.view, out = [];
    for (const u of this.world.units()) {
      if (u.team !== 0 || !filter(u)) continue;
      const [x, y] = v.screen(u.x, u.y, 0.5);
      if (x >= 0 && y >= 0 && x <= v.w && y <= v.h) out.push(u.id);
    }
    return out;
  }
  box(x0, y0, x1, y1) { this.boxRect = [Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1)]; this.hud.box(x0, y0, x1, y1); }
  endBox() { this.boxRect = null; this.hud.hideBox(); }
  finishBox() {
    const r = this.boxRect;
    this.endBox();
    if (!r) return;
    const v = this.view, inside = [];
    for (const u of this.world.units()) {
      if (u.team !== 0) continue;
      const [x, y] = v.screen(u.x, u.y, 0.5);
      if (x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]) inside.push(u);
    }
    // A box over soldiers and workers picks the soldiers.
    const soldiers = inside.filter(u => u.type !== 'worker');
    const pick = soldiers.length ? soldiers : inside;
    if (pick.length) this.sel = pick.map(u => u.id);
  }

  // ---------- placement ----------
  startPlacement(type) {
    const d = CONFIG.buildings[type], t = this.world.teams[0];
    if (!this.world.canAfford(0, d.cost)) { this.hud.toast(`Not enough: ${this.missing(d.cost)}.`, 'bad'); return; }
    const builders = this.sel.filter(id => this.world.get(id)?.type === 'worker');
    this.placing = { type, x: 0, y: 0, ok: false, builders };
    // The outline starts on open grass next to the builder (or mid-screen without one).
    const u = this.world.get(builders[0]);
    const from = u ? [u.x, u.y] : (this.view.pick(this.view.w / 2, this.view.h / 2) || [this.world.size / 2, this.world.size / 2]);
    const spot = this.freeSpot(type, from[0], from[1]);
    this.setGhostAt(spot[0], spot[1]);
    if (u) { const [sx, sy] = this.view.screen(spot[0], spot[1], 0); if (sx < 60 || sy < 60 || sx > this.view.w - 60 || sy > this.view.h - 60) this.view.centerOn(spot[0], spot[1]); }
    void t;
  }
  // The nearest spot (by the centre of the footprint) where the building fits.
  freeSpot(type, fx, fy) {
    const s = CONFIG.buildings[type].size;
    for (let r = 2; r < 14; r++) {
      let best = null, bd = 1e9;
      for (let y = Math.floor(fy - r - s); y <= fy + r; y++) for (let x = Math.floor(fx - r - s); x <= fx + r; x++) {
        if (!this.world.canPlace(0, type, x, y)) continue;
        const d = Math.hypot(x + s / 2 - fx, y + s / 2 - fy);
        if (d >= r - 1 && d < bd) { bd = d; best = [x + s / 2, y + s / 2]; }
      }
      if (best) return best;
    }
    return [fx, fy];
  }
  moveGhost(sx, sy) { const t = this.view.pick(sx, sy); if (t) this.setGhostAt(t[0], t[1]); }
  setGhostAt(tx, ty) {
    const p = this.placing, s = CONFIG.buildings[p.type].size;
    p.x = Math.max(0, Math.min(this.world.size - s, Math.floor(tx - s / 2 + 0.5)));
    p.y = Math.max(0, Math.min(this.world.size - s, Math.floor(ty - s / 2 + 0.5)));
    p.ok = this.world.canPlace(0, p.type, p.x, p.y);
    this.view.setGhost(p.type, p.x, p.y, p.ok, 0);
  }
  confirmPlacement() {
    const p = this.placing;
    if (!p) return;
    if (!p.ok) { this.hud.toast('You cannot build there. Pick open grass.', 'bad'); return; }
    const b = this.world.place(0, p.type, p.x, p.y, p.builders);
    if (!b) { this.hud.toast(`Not enough: ${this.missing(CONFIG.buildings[p.type].cost)}.`, 'bad'); return; }
    audio.sfx('place');
    if (p.builders.length) audio.say('build');
    this.events();
    this.cancelPlacement();
  }
  cancelPlacement() { this.placing = null; this.view.setGhost(null); }
  missing(cost) { this.hud.missing(cost); const r = this.world.teams[0].res; return Object.entries(cost).filter(([k, v]) => r[k] < v).map(([k, v]) => `${Math.ceil(v - r[k])} ${k}`).join(', '); }

  // ---------- commands from the HUD ----------
  // Queues one unit, or up to `count` (hold a train button to queue five). With several
  // buildings selected, each unit goes to the one with the shortest queue.
  trainUnit(bids, type, count = 1) {
    const w = this.world, d = w.def(0, type);
    const list = [].concat(bids).map(id => w.get(id)).filter(b => b && b.built && CONFIG.buildings[b.type].trains?.includes(type));
    if (!list.length) return;
    let n = 0;
    for (; n < count; n++) {
      const b = list.filter(x => x.queue.length < 5).sort((x, y) => x.queue.length - y.queue.length)[0];
      if (!b || !w.canAfford(0, d.cost)) break;
      w.train(b.id, type);
    }
    if (!n) {
      if (list.every(b => b.queue.length >= 5)) this.hud.toast('The queue is full (5).');
      else this.hud.toast(`Not enough: ${this.missing(d.cost)}.`, 'bad');
      return;
    }
    if (count > 1) this.hud.toast(`Queued ${n} ${plural(d.name, n)}.`);
    const t = w.teams[0], queued = list.reduce((s2, b) => s2 + b.queue.length, 0);
    if (t.pop + queued > t.popCap) { this.hud.toast('Build a House to raise your population limit.'); this.hud.popFull(); audio.say('house'); }
  }
  // Tap a resource token: select the workers gathering it (tap again to look at the next one).
  selectGatherers(kind) {
    const w = this.world, KIND = { lumber: 'tree', gold: 'gold', food: 'berries' };
    const list = [...w.units()].filter(u => u.team === 0 && u.type === 'worker' && (u.order?.type === 'gather' || u.order?.type === 'return') && (() => { const t = w.get(u.order.target ?? u.order.then); return t ? (t.cat === 'bld' ? kind === 'food' : t.kind === KIND[kind]) : u.carry?.type === kind; })());
    if (!list.length) { this.hud.toast(`Nobody is gathering ${kind}.`); return; }
    this.gatherI = this.gatherKind === kind ? (this.gatherI + 1) % list.length : 0; this.gatherKind = kind;
    this.sel = list.map(u => u.id);
    const u = list[this.gatherI]; this.view.centerOn(u.x, u.y);
    this.hud.toast(`${list.length} worker${list.length > 1 ? 's' : ''} gathering ${kind}.`);
  }
  holdPosition() { this.world.orderHold(this.sel); this.hud.toast('Holding position.'); audio.sfx('order'); audio.say('hold'); }
  selectAllIdle() {
    const idle = this.idleWorkers();
    if (!idle.length) return;
    this.sel = idle.map(u => u.id);
    this.hud.toast(`${idle.length} idle worker${idle.length > 1 ? 's' : ''} selected.`);
  }
  cancelTraining(bid, i) { this.world.cancel(bid, i); }
  cancelConstruction(bid) { this.world.cancelConstruction(bid); this.events(); this.sel = []; }
  stop() { for (const id of this.sel) { const u = this.world.get(id); if (u?.cat === 'unit') this.world.setOrder(u, null); } }
  narrowTo(type) { this.sel = this.sel.filter(id => this.world.get(id)?.type === type); }
  idleWorkers() { return [...this.world.units()].filter(u => u.team === 0 && u.type === 'worker' && !u.order); }
  army() { return [...this.world.units()].filter(u => u.team === 0 && u.type !== 'worker'); }
  selectIdleWorker() {
    const idle = this.idleWorkers();
    if (!idle.length) return;
    this.idleI = ((this.idleI ?? -1) + 1) % idle.length;
    const u = idle[this.idleI];
    this.sel = [u.id]; this.view.centerOn(u.x, u.y);
  }
  selectArmy() { const a = this.army(); if (a.length) { this.sel = a.map(u => u.id); const u = a[0]; this.view.centerOn(u.x, u.y); } }
  goHome() { const tc = this.home(); if (tc) { this.view.centerOn(tc.x + 3, tc.y); this.sel = [tc.id]; } }
  escape() {
    if (this.hud.wheelAt) this.hud.wheelAt = null;
    else if (this.amoveMode) this.amoveMode = false;
    else if (this.placing) this.cancelPlacement();
    else if (this.rallyMode) this.rallyMode = false;
    else if (this.sel.length) this.sel = [];
    else this.togglePause();
  }

  // ---------- pause and end ----------
  togglePause(force) {
    if (this.over) return;
    this.paused = force ?? !this.paused;
    const t = this.world.time; $('#pause-time').textContent = `Time ${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')} · ${this.tutorial.step ? `Goal ${this.tutorial.i + 1} of ${this.tutorial.total}` : 'All goals done'}`;
    $('#pause').classList.toggle('hidden', !this.paused);
  }
  end(won) {
    if (this.over) return;
    this.over = true;
    store.del(SAVE_KEY);
    audio.sfx(won ? 'victory' : 'defeat'); audio.say(won ? 'victory' : 'defeat', undefined, true);
    const t = this.world.teams[0], s = t.stats, r = this.world.teams[1].nation;
    $('#end-title').textContent = won ? 'Victory!' : 'Defeat';
    $('#end-sub').textContent = won ? `You destroyed the ${r.name} Town Center.` : `The ${r.name} army destroyed your Town Center.`;
    const g = s.gathered;
    $('#end-stats').innerHTML = [
      ['Time', `${Math.floor(this.world.time / 60)}:${String(Math.floor(this.world.time % 60)).padStart(2, '0')}`],
      [`${ICONS.food} Food`, Math.floor(g.food)], [`${ICONS.lumber} Lumber`, Math.floor(g.lumber)], [`${ICONS.gold} Gold`, Math.floor(g.gold)],
      ['Units trained', s.trained], ['Enemies defeated', s.killed], ['Units lost', s.lost], ['Buildings destroyed', s.razed],
    ].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
    $('#end').classList.toggle('won', won);
    setTimeout(() => $('#end').classList.remove('hidden'), 900);
  }
}

// ---------- menus ----------
let game = null;
const choice = { team: store.get('genom.team', 'hufflepuff'), pace: store.get('genom.pace', 'relaxed') };

function menu() {
  const teams = $('#teams');
  teams.innerHTML = TEAM_IDS.map(id => {
    const t = CONFIG.teams[id];
    return `<button class="team" data-id="${id}" style="--tc:${t.color};--td:${t.dark}"><span class="emblem">${EMBLEMS[t.art]}</span><span class="tn"><b>${t.name}</b><small>${t.element}</small></span></button>`;
  }).join('');
  const paint = () => {
    teams.querySelectorAll('.team').forEach(b => b.classList.toggle('on', b.dataset.id === choice.team));
    document.querySelectorAll('.pace').forEach(b => b.classList.toggle('on', b.dataset.pace === choice.pace));
    $('#pace-desc').textContent = document.querySelector('.pace.on small')?.textContent || '';
  };
  teams.querySelectorAll('.team').forEach(b => { b.onclick = () => { choice.team = b.dataset.id; store.set('genom.team', choice.team); paint(); }; });
  document.querySelectorAll('.pace').forEach(b => { b.onclick = () => { choice.pace = b.dataset.pace; store.set('genom.pace', choice.pace); paint(); }; });
  paint();
  $('#start').onclick = () => start();
  $('#continue').onclick = () => { const s2 = loadSave(); if (s2) start(s2); };
  $('#resume').onclick = () => game?.togglePause(false);
  $('#restart').onclick = () => { $('#pause').classList.add('hidden'); store.del(SAVE_KEY); start(); };
  $('#quit').onclick = () => { game?.save(); toMenu(); };
  $('#again').onclick = () => start();
  $('#menu-btn').onclick = toMenu;
  $('#map-name').textContent = CONFIG.map.name;
  for (const b of document.querySelectorAll('.open-settings')) b.onclick = openSettings;
  $('#settings-done').onclick = () => $('#settings').classList.add('hidden');
  settingsUi();
  showContinue();
  // Every button gives a soft click.
  document.addEventListener('pointerdown', e => { if (e.target.closest?.('button, input')) audio.sfx('tap'); }, true);
}

// The Continue card, when a saved match is waiting.
function showContinue() {
  const s2 = loadSave(), el = $('#continue');
  el.classList.toggle('hidden', !s2);
  $('#start').textContent = s2 ? 'New match' : 'Start';
  $('#start').classList.toggle('big', !s2);
  if (!s2) return;
  const me = CONFIG.teams[s2.team], them = CONFIG.teams[s2.rivalKey], t = s2.world.time;
  el.innerHTML = `<b>Continue</b><small>${me.name} vs ${them.name} · ${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')} played</small>`;
  $('#start').textContent = 'New match';
  $('#start').classList.toggle('big', false);
}

// ---------- settings: sound and graphics ----------
function settingsUi() {
  const sfx = $('#set-sfx'), voice = $('#set-voice'), mute = $('#set-mute');
  sfx.value = audio.settings.sfx * 100; voice.value = audio.settings.voice * 100; mute.checked = audio.settings.muted;
  sfx.oninput = () => { audio.set('sfx', sfx.value / 100); audio.sfx('select', 0.15); };
  voice.oninput = () => audio.set('voice', voice.value / 100);
  voice.onchange = () => audio.say('selectWorker', undefined, true);
  mute.onchange = () => { audio.set('muted', mute.checked); paintMute(); };
  const lay = $('#set-layout');
  lay.querySelectorAll('button').forEach(b => {
    b.onclick = () => { store.set('genom.hudLayout', b.dataset.l); if (game) { game.hudLayout = b.dataset.l; game.hud.setLayout(b.dataset.l); } lay.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); };
    b.classList.toggle('on', b.dataset.l === store.get('genom.hudLayout', 'corner'));
  });
  const q = $('#set-quality');
  q.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      store.set('genom.quality', b.dataset.q);
      game?.setQuality(b.dataset.q);
      q.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    };
    b.classList.toggle('on', b.dataset.q === store.get('genom.quality', 'auto'));
  });
}
function openSettings() { audio.unlock(); $('#settings').classList.remove('hidden'); }
function paintMute() { $('#set-mute').checked = audio.settings.muted; game?.hud.paintMute(); }
function toggleMute() { audio.set('muted', !audio.settings.muted); paintMute(); }

function toMenu() {
  game?.dispose(); game = null;
  for (const id of ['#pause', '#end']) $(id).classList.add('hidden');
  $('#menu').classList.remove('hidden');
  showContinue();
}

function start(saved = null) {
  audio.unlock();
  $('#menu').classList.add('hidden');
  for (const id of ['#pause', '#end']) $(id).classList.add('hidden');
  $('#loading').classList.remove('hidden');
  // Let the loading screen paint before the heavy scene build.
  setTimeout(() => {
    try {
      game?.dispose();
      if (!saved) store.del(SAVE_KEY);
      game = new Game(saved ? { team: saved.team, pace: saved.pace } : choice, saved);
      game.toggleMute = toggleMute;
      window.__genom = game;
    } catch (err) {
      console.error(err);
      if (saved) store.del(SAVE_KEY);
      $('#loading').textContent = `Something went wrong: ${err.message}`;
      return;
    }
    $('#loading').classList.add('hidden');
  }, 30);
}

try { artLibrary(); } catch (err) { console.error(err); }
menu();
// In a phone browser, show how to install the app first (or play full screen on Android).
if (installGate(() => { if (!game) $('#menu').classList.remove('hidden'); })) $('#menu').classList.add('hidden');
// The installed app works offline and starts fast.
if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
