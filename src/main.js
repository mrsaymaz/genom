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

const STEP = 1 / 20;
const plural = (name, n) => (n === 1 || name.endsWith('s') ? name : name.endsWith('man') ? `${name.slice(0, -3)}men` : `${name}s`);
const $ = s => document.querySelector(s);
const store = { get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };

class Game {
  constructor({ team, pace }) {
    const rivals = TEAM_IDS.filter(t => t !== team);
    this.rivalKey = rivals[Math.floor(Math.random() * rivals.length)];
    this.world = new World({ teams: [team, this.rivalKey], pace });
    this.ai = new RivalAI(this.world, 1);
    const old = $('#view'), fresh = old.cloneNode(false); old.replaceWith(fresh); // a clean WebGL context each match
    this.canvas = fresh;
    this.view = new View(this.canvas, this.world);
    this.sel = []; this.placing = null; this.rallyMode = false; this.amoveMode = false; this.focus = null;
    this.paused = false; this.over = false; this.pings = [];
    this.calmFor = 0; this.raided = false; this.alertT = 0;
    this.hud = new HUD($('#hud'), this);
    this.tutorial = new Tutorial(this);
    this.input = new Input(this.canvas, this);
    this.onResize = () => this.view.resize(innerWidth, innerHeight);
    addEventListener('resize', this.onResize); this.onResize();
    const tc = this.home();
    this.view.centerOn(tc.x + 3, tc.y - 1);
    this.acc = 0; this.last = performance.now(); this.time = 0;
    this.frame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.frame);
    this.hud.toast(`Your rival is ${CONFIG.teams[this.rivalKey].name} (${CONFIG.teams[this.rivalKey].element}).`);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.input.dispose();
    removeEventListener('resize', this.onResize);
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
      this.tutorial.update();
    }
    for (const b of this.world.buildings()) if (!b.built) this.view.syncBuilding(b);
    this.pings = this.pings.filter(p => (p.t -= dt / 3) > 0);
    this.sel = this.sel.filter(id => this.world.get(id));
    this.hud.update(dt);
    this.view.render(this.paused ? 0 : this.acc / STEP, this.time, dt, this.rings());
  }

  // Sim events become visuals and messages.
  events() {
    const w = this.world, v = this.view;
    for (const ev of w.drainEvents()) {
      if (ev.type === 'placed') v.addBuilding(w.get(ev.id));
      else if (ev.type === 'built') { const b = w.get(ev.id); if (b) { v.syncBuilding(b); if (b.team === 0) this.hud.toast(`${CONFIG.buildings[b.type].name} complete.`); } }
      else if (ev.type === 'removed') {
        v.removeEntity(ev);
        if (ev.cat === 'bld' && ev.team === 0) this.hud.toast(`Your ${CONFIG.buildings[ev.kind].name} was destroyed.`, 'bad');
      } else if (ev.type === 'hit') {
        const a = w.get(ev.from), t = w.get(ev.to);
        if (!a || !t) continue;
        if (ev.ranged) { const [ax, ay] = w.center(a), [bx, by] = w.center(t); v.arrow(v.toWorld(ax, ay), v.toWorld(bx, by)); }
        else if (t.cat === 'bld' && Math.random() < 0.3) { const [bx, by] = w.center(t), [x, z] = v.toWorld(bx, by); v.dust({ x, z }, 2, t.w * TILE * 0.8); }
        if (t.team === 0 && a.team !== 0 && this.world.time - this.alertT > 20) {
          this.alertT = this.world.time;
          this.hud.toast('You are under attack!', 'bad');
          const [px, py] = w.center(t); this.pings.push({ x: px, y: py, t: 1 });
        }
      } else if (ev.type === 'end') this.end(ev.winner === 0);
    }
  }

  // Tracks whether the rival's raid has reached the base and been beaten off (tutorial goal).
  watch(dt) {
    const tc = this.home();
    if (!tc) return;
    const [cx, cy] = this.world.center(tc);
    const near = [...this.world.units()].some(u => u.team !== 0 && u.type !== 'worker' && Math.hypot(u.x - cx, u.y - cy) < 15);
    if (near) { this.raided = true; this.calmFor = 0; } else this.calmFor += dt;
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
    const w = this.world, v = this.view, ppu = v.h / v.zoom;
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
      return;
    }
    const mine = this.sel.map(id => w.get(id)).filter(e => e && e.team === 0 && e.cat === 'unit');
    if (target && target.team === 0) {
      // Workers tapping their own unfinished building or a farm get to work instead of selecting it.
      const workers = mine.filter(u => u.type === 'worker');
      if (workers.length && target.cat === 'bld' && (!target.built || CONFIG.buildings[target.type].farm)) { this.order(mine, target, tile); return; }
      if (dbl) { this.selectAllOf(target); return; }
      this.focus = target.id;
      this.sel = this.sel.length === 1 && this.sel[0] === target.id && target.cat === 'bld' ? [] : [target.id];
      return;
    }
    if (mine.length) { this.order(mine, target, tile); return; }
    this.sel = target ? [target.id] : [];
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
    if (what) { const [x, z] = this.view.toWorld(target ? tx : tile[0], target ? ty : tile[1]); this.flag(x, z, what === 'attack' ? '#ff6060' : '#ffffff'); }
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
    const center = this.view.pick(this.view.w / 2, this.view.h / 2) || [this.world.size / 2, this.world.size / 2];
    this.placing = { type, x: 0, y: 0, ok: false, builders: this.sel.filter(id => this.world.get(id)?.type === 'worker') };
    this.setGhostAt(center[0], center[1]);
    void t;
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
    this.events();
    this.cancelPlacement();
  }
  cancelPlacement() { this.placing = null; this.view.setGhost(null); }
  missing(cost) { const r = this.world.teams[0].res; return Object.entries(cost).filter(([k, v]) => r[k] < v).map(([k, v]) => `${Math.ceil(v - r[k])} ${k}`).join(', '); }

  // ---------- commands from the HUD ----------
  // Queues one unit, or up to `count` (hold a train button to queue five). With several
  // buildings selected, each unit goes to the one with the shortest queue.
  trainUnit(bids, type, count = 1) {
    const w = this.world, d = CONFIG.units[type];
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
    if (t.pop + queued > t.popCap) this.hud.toast('Build a House to raise your population limit.');
  }
  holdPosition() { this.world.orderHold(this.sel); this.hud.toast('Holding position.'); }
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
  goHome() { const tc = this.home(); if (tc) { this.view.centerOn(tc.x + 2, tc.y + 2); this.sel = [tc.id]; } }
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
    $('#pause').classList.toggle('hidden', !this.paused);
  }
  end(won) {
    if (this.over) return;
    this.over = true;
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
    return `<button class="team" data-id="${id}" style="--tc:${t.color};--td:${t.dark}"><span class="emblem">${EMBLEMS[t.art]}</span><b>${t.name}</b><small>${t.element}</small></button>`;
  }).join('');
  const paint = () => {
    teams.querySelectorAll('.team').forEach(b => b.classList.toggle('on', b.dataset.id === choice.team));
    document.querySelectorAll('.pace').forEach(b => b.classList.toggle('on', b.dataset.pace === choice.pace));
  };
  teams.querySelectorAll('.team').forEach(b => { b.onclick = () => { choice.team = b.dataset.id; store.set('genom.team', choice.team); paint(); }; });
  document.querySelectorAll('.pace').forEach(b => { b.onclick = () => { choice.pace = b.dataset.pace; store.set('genom.pace', choice.pace); paint(); }; });
  paint();
  $('#start').onclick = start;
  $('#resume').onclick = () => game?.togglePause(false);
  $('#restart').onclick = () => { $('#pause').classList.add('hidden'); start(); };
  $('#quit').onclick = toMenu;
  $('#again').onclick = start;
  $('#menu-btn').onclick = toMenu;
  $('#map-name').textContent = CONFIG.map.name;
}

function toMenu() {
  game?.dispose(); game = null;
  for (const id of ['#pause', '#end']) $(id).classList.add('hidden');
  $('#menu').classList.remove('hidden');
}

function start() {
  $('#menu').classList.add('hidden');
  for (const id of ['#pause', '#end']) $(id).classList.add('hidden');
  $('#loading').classList.remove('hidden');
  // Let the loading screen paint before the heavy scene build.
  setTimeout(() => {
    try {
      game?.dispose();
      game = new Game(choice);
      window.__genom = game;
    } catch (err) {
      console.error(err);
      $('#loading').textContent = `Something went wrong: ${err.message}`;
      return;
    }
    $('#loading').classList.add('hidden');
  }, 30);
}

try { artLibrary(); } catch (err) { console.error(err); }
menu();
