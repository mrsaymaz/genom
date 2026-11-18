// The match simulation: map, teams, resources, buildings, units, orders and combat.
// Pure logic with no rendering, so it runs headless in the tests.
import { CONFIG } from '../config.js';
import { generateMap, T } from './map.js';
import { findPath } from './path.js';
import { unitDefs, roleOf, COUNTER, BLD_DAMAGE, ELEMENT_BEATS } from './units.js';

const AGE_I = { dark: 0, mythic: 1, arcane: 2, celestial: 3 };

const UNIT_R = 0.32;

export class World {
  constructor({ teams = ['hufflepuff', 'gryffindor'], pace = 'relaxed', seed = CONFIG.map.seed } = {}) {
    this.cfg = CONFIG;
    this.pace = CONFIG.pace[pace] ? pace : 'relaxed';
    this.seed = seed;
    this.map = generateMap(CONFIG.map.size, seed);
    this.size = this.map.size;
    this.time = 0;
    this.ents = new Map();
    this.nextId = 1;
    this.occ = new Int32Array(this.size * this.size);
    this.events = [];
    this.winner = null;
    this.teams = teams.map((key, i) => ({
      index: i, key, nation: CONFIG.teams[key],
      res: { food: CONFIG.start.food, lumber: CONFIG.start.lumber, gold: CONFIG.start.gold },
      pop: 0, popCap: 0,
      stats: { gathered: { food: 0, lumber: 0, gold: 0 }, trained: 0, lost: 0, killed: 0, built: 0, razed: 0 },
      age: 'dark', units: unitDefs(CONFIG.teams[key].art),
    }));
    for (const r of this.map.resources) this.addResource(r);
    this.map.bases.forEach((b, i) => {
      const tc = this.addBuilding(i, 'towncenter', b.x, b.y, true);
      for (let k = 0; k < CONFIG.start.workers; k++) this.spawnUnit(i, 'worker', tc);
    });
    this.recount();
  }

  // ---------- entities ----------
  addResource(r) {
    const e = { id: this.nextId++, cat: 'res', kind: r.kind, x: r.x, y: r.y, w: r.w, h: r.h, amount: r.amount, max: r.amount };
    this.ents.set(e.id, e);
    this.mark(e, e.id);
    return e;
  }

  addBuilding(team, type, x, y, built = false) {
    const d = CONFIG.buildings[type], t = this.teams[team];
    const maxHp = Math.round(d.hp * t.nation.hp);
    const e = {
      id: this.nextId++, cat: 'bld', type, team, x, y, w: d.size, h: d.size,
      maxHp, hp: built ? maxHp : Math.max(1, Math.round(maxHp * 0.05)), progress: built ? 1 : 0, built,
      bt: d.bt * t.nation.bt, queue: [], rally: null, cd: 0, walkable: !!d.walkable,
    };
    this.ents.set(e.id, e);
    this.mark(e, e.id);
    this.events.push({ type: 'placed', id: e.id });
    if (!e.walkable) this.evict(e);
    if (built) this.recount();
    return e;
  }

  // A unit type's stats for a team: each nation has its own units (src/data/units.js).
  def(team, type) { return this.teams[team].units[type]; }

  spawnUnit(team, type, near) {
    const d = this.def(team, type);
    const spot = this.freeTileNear(near) || [near.x, near.y];
    const e = {
      id: this.nextId++, cat: 'unit', type, team, x: spot[0] + 0.5, y: spot[1] + 0.5, px: spot[0] + 0.5, py: spot[1] + 0.5,
      hp: d.hp, maxHp: d.hp, order: null, path: null, carry: null, cd: 0, facing: 0, work: 0, prev: null, repath: 0,
      run: 0, boost: 0, healCd: 0, hurtT: -99,
      // Hero and creature abilities, and what they leave on others: arrows dodged, a battle roar,
      // roots holding a unit in place.
      castCd: 0, traitCd: 2, dodge: 0, roar: 0, rootT: 0,
    };
    this.ents.set(e.id, e);
    this.teams[team].pop += d.pop;
    this.events.push({ type: 'spawn', id: e.id });
    return e;
  }

  remove(e) {
    if (!this.ents.has(e.id)) return;
    this.ents.delete(e.id);
    if (e.cat !== 'unit') this.mark(e, 0);
    if (e.cat === 'unit') this.teams[e.team].pop -= this.def(e.team, e.type).pop;
    this.events.push({ type: 'removed', id: e.id, cat: e.cat, kind: e.kind || e.type, team: e.team });
    if (e.cat === 'bld') {
      for (const u of this.allUnits()) if (u.inside === e.id) this.leaveShelter(u, e);
      this.recount();
      if (e.type === 'towncenter' && this.winner === null) { this.winner = 1 - e.team; this.events.push({ type: 'end', winner: this.winner }); }
    }
  }

  mark(e, v) {
    for (let y = e.y; y < e.y + e.h; y++) for (let x = e.x; x < e.x + e.w; x++) this.occ[y * this.size + x] = v;
  }

  recount() {
    for (const t of this.teams) t.popCap = 0;
    for (const e of this.ents.values()) if (e.cat === 'bld' && e.built) this.teams[e.team].popCap += CONFIG.buildings[e.type].pop || 0;
    for (const t of this.teams) t.popCap = Math.min(t.popCap, CONFIG.popMax);
  }

  // ---------- grid ----------
  terrainAt(x, y) { return this.map.terrain[y * this.size + x]; }
  inside(x, y) { return x >= 0 && y >= 0 && x < this.size && y < this.size; }
  blocked(x, y) {
    if (!this.inside(x, y)) return true;
    const t = this.terrainAt(x, y);
    if (t === T.WATER || t === T.ROCK) return true;
    const o = this.occ[y * this.size + x];
    if (!o) return false;
    const e = this.ents.get(o);
    return !(e && e.walkable);
  }
  entAtTile(x, y) { const o = this.inside(x, y) ? this.occ[y * this.size + x] : 0; return o ? this.ents.get(o) : null; }

  freeTileNear(e) {
    const cx = e.x + (e.w || 1) / 2, cy = e.y + (e.h || 1) / 2;
    for (let r = 1; r < 8; r++) {
      let best = null, bd = 1e9;
      for (let y = Math.floor(e.y - r); y <= e.y + (e.h || 1) - 1 + r; y++) for (let x = Math.floor(e.x - r); x <= e.x + (e.w || 1) - 1 + r; x++) {
        if (this.blocked(x, y)) continue;
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) + (this.unitsOnTile(x, y) * 0.8);
        if (d < bd) { bd = d; best = [x, y]; }
      }
      if (best) return best;
    }
    return null;
  }
  unitsOnTile(x, y) { let n = 0; for (const u of this.units()) if (Math.floor(u.x) === x && Math.floor(u.y) === y) n++; return n; }
  evict(b) {
    for (const u of this.units()) if (u.x > b.x - UNIT_R && u.x < b.x + b.w + UNIT_R && u.y > b.y - UNIT_R && u.y < b.y + b.h + UNIT_R) {
      const s = this.freeTileNear(b); if (s) { u.x = u.px = s[0] + 0.5; u.y = u.py = s[1] + 0.5; u.path = null; }
    }
  }

  // Units out on the map. Workers sheltering inside a Town Center are left out (see allUnits).
  *units() { for (const e of this.ents.values()) if (e.cat === 'unit' && !e.inside) yield e; }
  *allUnits() { for (const e of this.ents.values()) if (e.cat === 'unit') yield e; }
  *buildings(team) { for (const e of this.ents.values()) if (e.cat === 'bld' && (team === undefined || e.team === team)) yield e; }
  *resources(kind) { for (const e of this.ents.values()) if (e.cat === 'res' && (!kind || e.kind === kind)) yield e; }
  get(id) { return this.ents.get(id); }

  // ---------- placement and production ----------
  canAfford(team, cost) { const r = this.teams[team].res; return Object.entries(cost || {}).every(([k, v]) => r[k] >= v); }
  pay(team, cost) { const r = this.teams[team].res; for (const [k, v] of Object.entries(cost || {})) r[k] -= v; }
  refund(team, cost) { const r = this.teams[team].res; for (const [k, v] of Object.entries(cost || {})) r[k] += v; }

  // A building is available from its age on (the Beast Pen and Sanctum from the Mythic Age).
  hasAge(team, type) { const need = CONFIG.buildings[type].age; return !need || CONFIG.ages.indexOf(this.teams[team].age) >= CONFIG.ages.indexOf(need); }
  canPlace(team, type, x, y) {
    if (!this.hasAge(team, type)) return false;
    const s = CONFIG.buildings[type].size;
    for (let yy = y; yy < y + s; yy++) for (let xx = x; xx < x + s; xx++) {
      if (!this.inside(xx, yy) || this.terrainAt(xx, yy) !== T.GRASS || this.occ[yy * this.size + xx]) return false;
    }
    return true;
  }

  place(team, type, x, y, builders = []) {
    const d = CONFIG.buildings[type];
    if (!this.canPlace(team, type, x, y) || !this.canAfford(team, d.cost)) return null;
    this.pay(team, d.cost);
    const b = this.addBuilding(team, type, x, y, false);
    this.orderBuild(builders, b.id);
    return b;
  }

  // Heroes and creatures are unique: one in the field or in training at a time.
  hasUnique(team, type) {
    for (const u of this.allUnits()) if (u.team === team && u.type === type) return true;
    for (const b of this.buildings(team)) if (b.queue.some(q => q.type === type)) return true;
    return false;
  }
  train(bid, type) {
    const b = this.get(bid);
    if (!b || !b.built || b.queue.length >= 5) return false;
    const d = this.def(b.team, type);
    if (!d || !CONFIG.buildings[b.type].trains?.includes(type) || !this.canAfford(b.team, d.cost)) return false;
    if (d.unique && this.hasUnique(b.team, type)) return false;
    this.pay(b.team, d.cost);
    b.queue.push({ type, t: 0 });
    return true;
  }

  // ---------- ages ----------
  nextAge(team) { const a = CONFIG.ages, i = a.indexOf(this.teams[team].age); return a[i + 1] || null; }
  // Can this team start researching its next age? Returns { ok, why }.
  canAgeUp(team) {
    const next = this.nextAge(team), d = next && CONFIG.ageUp[next];
    if (!d) return { ok: false, why: 'max' };
    const tcs = [...this.buildings(team)].filter(b => b.type === 'towncenter' && b.built);
    if (tcs.some(b => b.ageUp)) return { ok: false, why: 'busy' };
    if (!tcs.length) return { ok: false, why: 'tc' };
    if (![...this.buildings(team)].some(b => b.type === d.needs && b.built)) return { ok: false, why: 'needs', needs: d.needs };
    if (!this.canAfford(team, d.cost)) return { ok: false, why: 'cost', cost: d.cost };
    return { ok: true, next, def: d };
  }
  startAgeUp(bid) {
    const b = this.get(bid);
    if (!b || b.type !== 'towncenter') return false;
    const c = this.canAgeUp(b.team);
    if (!c.ok) return false;
    this.pay(b.team, c.def.cost);
    b.ageUp = { to: c.next, t: 0, time: c.def.time };
    this.events.push({ type: 'ageStart', team: b.team, id: b.id, age: c.next });
    return true;
  }
  cancelAgeUp(bid) {
    const b = this.get(bid);
    if (!b?.ageUp) return;
    this.refund(b.team, CONFIG.ageUp[b.ageUp.to].cost);
    b.ageUp = null;
  }
  // The team enters the age: units take their next form (keeping their share of health) and
  // buildings grow stronger.
  enterAge(team, age) {
    const t = this.teams[team], gain = CONFIG.ageUp[age]?.hpGain || 1;
    t.age = age;
    t.units = unitDefs(t.nation.art, age);
    for (const u of this.allUnits()) if (u.team === team) { const m = t.units[u.type].hp; u.hp = (u.hp / u.maxHp) * m; u.maxHp = m; }
    for (const b of this.buildings(team)) { b.maxHp = Math.round(b.maxHp * gain); b.hp = Math.min(b.maxHp, b.hp * gain); }
    this.events.push({ type: 'aged', team, age });
  }

  cancel(bid, i) {
    const b = this.get(bid);
    if (!b || !b.queue[i]) return;
    this.refund(b.team, this.def(b.team, b.queue[i].type).cost);
    b.queue.splice(i, 1);
  }

  cancelConstruction(bid) {
    const b = this.get(bid);
    if (!b || b.built) return;
    this.refund(b.team, CONFIG.buildings[b.type].cost);
    this.remove(b);
  }

  // ---------- orders ----------
  setOrder(u, order) { u.order = order; u.path = null; u.repath = 0; u.work = 0; }
  orderMove(ids, tx, ty) {
    const list = ids.map(id => this.get(id)).filter(u => u && u.cat === 'unit');
    const n = list.length, cols = Math.ceil(Math.sqrt(n));
    list.forEach((u, i) => {
      const ox = (i % cols) - (cols - 1) / 2, oy = Math.floor(i / cols) - (Math.ceil(n / cols) - 1) / 2;
      let x = Math.round(tx + ox * 0.9), y = Math.round(ty + oy * 0.9);
      if (this.blocked(x, y)) [x, y] = [Math.floor(tx), Math.floor(ty)];
      this.setOrder(u, { type: 'move', x, y });
    });
  }
  orderAttack(ids, tid) { for (const id of ids) { const u = this.get(id); if (u?.cat === 'unit') this.setOrder(u, { type: 'attack', target: tid }); } }
  orderAttackMove(ids, tx, ty) { for (const id of ids) { const u = this.get(id); if (u?.cat === 'unit') this.setOrder(u, { type: 'amove', x: Math.floor(tx), y: Math.floor(ty) }); } }
  orderGather(ids, tid) {
    for (const id of ids) { const u = this.get(id); if (u?.cat === 'unit' && u.type === 'worker') this.setOrder(u, { type: 'gather', target: tid }); }
  }
  orderBuild(ids, bid) {
    for (const id of ids) {
      const u = this.get(id);
      if (u?.cat !== 'unit' || u.type !== 'worker') continue;
      if (u.order && u.order.type !== 'build') u.prev = u.order;
      this.setOrder(u, { type: 'build', target: bid });
    }
  }
  orderHold(ids) { for (const id of ids) { const u = this.get(id); if (u?.cat === 'unit' && u.type !== 'worker') this.setOrder(u, { type: 'hold' }); } }
  orderReturn(ids) { for (const id of ids) { const u = this.get(id); if (u?.carry) this.setOrder(u, { type: 'return', then: u.order?.target ?? null }); } }

  // Smart command: what the player meant by tapping a target with units selected.
  command(ids, target, tx, ty) {
    const units = ids.map(id => this.get(id)).filter(u => u && u.cat === 'unit');
    if (!units.length) return null;
    const team = units[0].team;
    if (target && target.team !== undefined && target.team !== team) { this.orderAttack(ids, target.id); return 'attack'; }
    const workers = units.filter(u => u.type === 'worker').map(u => u.id), others = units.filter(u => u.type !== 'worker').map(u => u.id);
    if (target && target.cat === 'res' && workers.length) { this.orderGather(workers, target.id); if (others.length) this.orderMove(others, tx, ty); return 'gather'; }
    if (target && target.cat === 'bld' && target.team === team && workers.length) {
      if (!target.built) { this.orderBuild(workers, target.id); if (others.length) this.orderMove(others, tx, ty); return 'build'; }
      if (CONFIG.buildings[target.type].farm) { this.orderGather(workers.slice(0, 1), target.id); return 'gather'; }
      if (CONFIG.buildings[target.type].drop) { const carriers = workers.filter(id => this.get(id).carry); if (carriers.length) { this.orderReturn(carriers); return 'return'; } }
    }
    this.orderMove(ids, tx, ty);
    return 'move';
  }

  // ---------- the Town bell ----------
  // Every worker runs to the nearest Town Center and shelters inside until the all-clear.
  ringBell(team) {
    const tcs = [...this.buildings(team)].filter(b => b.type === 'towncenter' && b.built);
    if (!tcs.length) return 0;
    let n = 0;
    for (const u of this.units()) {
      if (u.team !== team || u.type !== 'worker' || u.order?.type === 'shelter') continue;
      const tc = tcs.reduce((a, b) => (this.distTo(u, a) <= this.distTo(u, b) ? a : b));
      const resume = u.order && u.order.type !== 'move' ? u.order : null;
      this.setOrder(u, { type: 'shelter', target: tc.id, resume });
      n++;
    }
    this.teams[team].bell = n > 0;
    return n;
  }
  allClear(team) {
    for (const u of [...this.allUnits()]) {
      if (u.team !== team) continue;
      if (u.inside) this.leaveShelter(u, this.get(u.inside));
      else if (u.order?.type === 'shelter') this.setOrder(u, u.order.resume || null);
    }
    this.teams[team].bell = false;
  }
  leaveShelter(u, b) {
    const spot = b && this.freeTileNear(b);
    if (spot) { u.x = u.px = spot[0] + 0.5; u.y = u.py = spot[1] + 0.5; }
    u.inside = 0;
    const resume = u.order?.resume || null;
    this.setOrder(u, resume && (resume.target === undefined || this.get(resume.target)) ? resume : null);
  }
  sheltered(b) { const out = []; for (const u of this.allUnits()) if (u.inside === b.id) out.push(u); return out; }

  // ---------- saving ----------
  // A match saves as plain data. The map itself is rebuilt from its seed.
  save() {
    return {
      v: 1, seed: this.seed, pace: this.pace, time: this.time, nextId: this.nextId, winner: this.winner,
      teams: this.teams.map(t => ({ key: t.key, res: t.res, stats: t.stats, bell: !!t.bell, age: t.age })),
      ents: [...this.ents.values()],
    };
  }
  static load(data) {
    const w = new World({ teams: data.teams.map(t => t.key), pace: data.pace, seed: data.seed });
    w.ents = new Map(); w.occ.fill(0);
    for (const e of data.ents) { w.ents.set(e.id, e); if (e.cat !== 'unit') w.mark(e, e.id); }
    Object.assign(w, { time: data.time, nextId: data.nextId, winner: data.winner, events: [] });
    data.teams.forEach((t, i) => { Object.assign(w.teams[i], { res: t.res, stats: t.stats, bell: t.bell, age: t.age || 'dark' }); w.teams[i].units = unitDefs(w.teams[i].nation.art, w.teams[i].age); });
    for (const t of w.teams) t.pop = 0;
    for (const u of w.allUnits()) w.teams[u.team].pop += w.def(u.team, u.type).pop;
    w.recount();
    return w;
  }

  // ---------- geometry helpers ----------
  distTo(u, e) {
    if (e.cat === 'unit') return Math.hypot(u.x - e.x, u.y - e.y) - UNIT_R;
    const dx = Math.max(e.x - u.x, 0, u.x - (e.x + e.w)), dy = Math.max(e.y - u.y, 0, u.y - (e.y + e.h));
    return Math.hypot(dx, dy);
  }
  center(e) { return e.cat === 'unit' ? [e.x, e.y] : [e.x + e.w / 2, e.y + e.h / 2]; }

  goalsAround(e) {
    const goals = new Set();
    if (e.cat === 'unit') { goals.add(Math.floor(e.y) * this.size + Math.floor(e.x)); return goals; }
    if (e.walkable) { for (let y = e.y; y < e.y + e.h; y++) for (let x = e.x; x < e.x + e.w; x++) goals.add(y * this.size + x); return goals; }
    for (let y = e.y - 1; y <= e.y + e.h; y++) for (let x = e.x - 1; x <= e.x + e.w; x++) {
      if ((x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h) || this.blocked(x, y)) continue;
      goals.add(y * this.size + x);
    }
    return goals;
  }

  pathTo(u, goals) {
    // Flying units (the Tide Raven) go over water, rocks and buildings.
    const flies = this.def(u.team, u.type).flies;
    const p = findPath(this.size, flies ? (x, y) => !this.inside(x, y) : (x, y) => this.blocked(x, y), Math.floor(u.x), Math.floor(u.y), goals);
    u.path = p ? p.map(([x, y]) => [x + 0.5, y + 0.5]) : [];
    // Already on a goal tile but off its centre: finish the last half-step.
    if (p && !p.length) { const cx = Math.floor(u.x) + 0.5, cy = Math.floor(u.y) + 0.5; if (Math.hypot(cx - u.x, cy - u.y) > 0.05) u.path = [[cx, cy]]; }
    return p;
  }

  // Moves along the path; returns true when the path is finished.
  follow(u, dt) {
    if (!u.path || !u.path.length) return true;
    if (u.rootT > 0) return false; // held by roots
    const d = this.def(u.team, u.type);
    const speed = d.speed * (!d.flies && this.terrainAt(Math.floor(u.x), Math.floor(u.y)) === T.FORD ? 0.7 : 1) * (u.boost > 0 ? 1.4 : 1);
    let step = speed * dt;
    u.run += step; // chargers hit harder after a run-up
    while (step > 0 && u.path.length) {
      const [wx, wy] = u.path[0];
      const dx = wx - u.x, dy = wy - u.y, d = Math.hypot(dx, dy);
      if (d <= step) { u.x = wx; u.y = wy; step -= d; u.path.shift(); }
      else { u.x += dx / d * step; u.y += dy / d * step; u.facing = Math.atan2(dy, dx); step = 0; }
    }
    return !u.path.length;
  }

  // Walks toward an entity until within range; returns true when in range.
  approach(u, e, range, dt) {
    if (this.distTo(u, e) <= range) { u.path = null; return true; }
    u.repath -= dt;
    if (!u.path || !u.path.length || u.repath <= 0) {
      u.repath = e.cat === 'unit' ? 0.8 : 3;
      if (e.cat === 'unit' && range > 1.5) {
        const goals = new Set();
        const [cx, cy] = this.center(e), r = Math.max(1, Math.floor(range - 0.4));
        for (let y = Math.floor(cy) - r; y <= Math.floor(cy) + r; y++) for (let x = Math.floor(cx) - r; x <= Math.floor(cx) + r; x++) if (!this.blocked(x, y) && Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= range - 0.4) goals.add(y * this.size + x);
        this.pathTo(u, goals.size ? goals : this.goalsAround(e));
      } else this.pathTo(u, this.goalsAround(e));
      if (!u.path.length && this.distTo(u, e) > range) return false;
    }
    this.follow(u, dt);
    return this.distTo(u, e) <= range;
  }

  nearestEnemy(u, radius, onlyUnits = false) {
    let best = null, bd = radius;
    for (const e of this.ents.values()) {
      if (e.team === undefined || e.team === u.team || e.inside || (onlyUnits && e.cat !== 'unit')) continue;
      if (e.cat === 'bld' && !onlyUnits) { const d = this.distTo(u, e) + 2; if (d < bd) { bd = d; best = e; } continue; }
      if (e.cat !== 'unit') continue;
      const d = this.distTo(u, e);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }

  nearestDrop(u, kind) {
    let best = null, bd = 1e9;
    for (const b of this.buildings(u.team)) {
      if (!b.built) continue;
      const drop = CONFIG.buildings[b.type].drop;
      if (!drop || !drop.includes(kind)) continue;
      const d = this.distTo(u, b);
      if (d < bd) { bd = d; best = b; }
    }
    return best;
  }

  nearestResource(x, y, kind, maxD = 14, team) {
    let best = null, bd = maxD;
    for (const r of this.ents.values()) {
      const ok = (r.cat === 'res' && r.kind === kind) || (kind === 'farm' && r.cat === 'bld' && r.team === team && r.built && CONFIG.buildings[r.type].farm && !this.farmTaken(r));
      if (!ok) continue;
      const d = Math.hypot(r.x + r.w / 2 - x, r.y + r.h / 2 - y);
      if (d < bd) { bd = d; best = r; }
    }
    return best;
  }
  farmTaken(f, except) { for (const u of this.units()) if (u !== except && u.order?.type === 'gather' && u.order.target === f.id) return true; return false; }

  // ---------- combat ----------
  // Counters, the element cycle and a few abilities shape the damage of every hit.
  damage(attacker, target, amount) {
    if (!this.ents.has(target.id)) return;
    let dmg = amount;
    const ar = attacker.cat === 'unit' ? roleOf(this.def(attacker.team, attacker.type)) : 'building';
    if (target.cat === 'bld') dmg *= attacker.cat === 'unit' ? (BLD_DAMAGE[ar] ?? 1) : 0.5;
    else if (attacker.cat === 'unit') {
      const td = this.def(target.team, target.type), tr = roleOf(td);
      dmg *= COUNTER[ar]?.[tr] ?? 1;
      const ad = this.def(attacker.team, attacker.type);
      // Stone Skin: guardians take half damage from melee attacks.
      if (td.kind === 'guardian' && ad.attackType === 'melee') dmg *= 0.5;
      // Updraft: lifted units dodge half of every arrow.
      if (target.dodge > 0 && ad.attackType === 'ranged') dmg *= 0.5;
      // Signature creatures follow the element cycle among themselves, strongly.
      if (ar === 'creature' && tr === 'creature' && ELEMENT_BEATS[this.teams[attacker.team].nation.art] === this.teams[target.team].nation.art) dmg *= 1.5;
    }
    // Battle Roar: roused units hit harder.
    if (attacker.cat === 'unit' && attacker.roar > 0) dmg *= 1.35;
    // The element cycle: Fire > Earth > Air > Water > Fire, a small extra edge.
    if (target.team !== undefined && ELEMENT_BEATS[this.teams[attacker.team].nation.art] === this.teams[target.team].nation.art) dmg *= 1.1;
    target.hp -= dmg;
    if (target.cat === 'unit') target.hurtT = this.time;
    const ranged = attacker.cat === 'bld' || this.def(attacker.team, attacker.type).attackType === 'ranged';
    this.events.push({ type: 'hit', from: attacker.id, to: target.id, ranged });
    // Idle soldiers fight back; workers and healers fight back only when they have nothing else to do.
    if (target.cat === 'unit' && attacker.cat === 'unit') {
      const kind = this.def(target.team, target.type).kind;
      const free = !target.order || (target.order.auto && target.type !== 'worker' && kind !== 'healer');
      if (free && kind !== 'healer') this.setOrder(target, { type: 'attack', target: attacker.id, auto: true });
    }
    if (target.hp <= 0) {
      this.teams[attacker.team].stats.killed += target.cat === 'unit' ? 1 : 0;
      if (target.cat === 'bld') this.teams[attacker.team].stats.razed++;
      if (target.cat === 'unit') this.teams[target.team].stats.lost++;
      this.remove(target);
    }
  }

  // ---------- simulation step ----------
  step(dt) {
    if (this.winner !== null) return;
    this.time += dt;
    const builders = new Map();
    for (const u of this.units()) if (u.order?.type === 'build' && this.ents.has(u.order.target) && this.distTo(u, this.get(u.order.target)) <= 0.85) builders.set(u.order.target, (builders.get(u.order.target) || 0) + 1);
    for (const u of [...this.units()]) { u.px = u.x; u.py = u.y; this.updateUnit(u, dt, builders); }
    this.separate();
    for (const b of [...this.buildings()]) this.updateBuilding(b, dt);
  }

  updateBuilding(b, dt) {
    const d = CONFIG.buildings[b.type];
    if (!b.built) return;
    // Researching the next age: training waits until it is done.
    if (b.ageUp) {
      b.ageUp.t += dt;
      if (b.ageUp.t >= b.ageUp.time) { const to = b.ageUp.to; b.ageUp = null; this.enterAge(b.team, to); }
    } else if (b.queue.length) {
      const q = b.queue[0], ud = this.def(b.team, q.type), t = this.teams[b.team];
      if (q.t < ud.time) q.t += dt;
      if (q.t >= ud.time) {
        if (t.pop + ud.pop <= t.popCap) {
          const u = this.spawnUnit(b.team, q.type, b);
          t.stats.trained++;
          b.queue.shift();
          this.events.push({ type: 'trained', id: u.id, team: b.team });
          if (b.rally) {
            const r = this.get(b.rally.target);
            if (r && u.type === 'worker' && (r.cat === 'res' || (r.cat === 'bld' && CONFIG.buildings[r.type].farm))) this.setOrder(u, { type: 'gather', target: r.id });
            else this.setOrder(u, { type: 'move', x: b.rally.x, y: b.rally.y });
          }
        } else q.blocked = true;
      }
    }
    if (d.attack) {
      b.cd -= dt;
      if (b.cd <= 0) {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        let best = null, bd = d.attack.range + b.w / 2;
        for (const u of this.units()) { if (u.team === b.team) continue; const dd = Math.hypot(u.x - cx, u.y - cy); if (dd < bd) { bd = dd; best = u; } }
        // Each sheltering worker adds an extra arrow's worth of damage.
        if (best) { b.cd = d.attack.cooldown; this.damage(b, best, d.attack.damage * (1 + 0.35 * this.sheltered(b).length)); }
      }
    }
  }

  updateUnit(u, dt, builders) {
    const d = this.def(u.team, u.type);
    u.cd -= dt; u.boost -= dt;
    if (u.castCd !== undefined) { u.castCd -= dt; u.traitCd -= dt; u.dodge -= dt; u.roar -= dt; u.rootT -= dt; }
    if (d.heal) this.mend(u, d, dt);
    if (d.trait) this.trait(u, d, dt);
    // Ravenclaw's twist: units out of combat for a while slowly heal.
    if (d.regen && u.hp < u.maxHp && this.time - u.hurtT > 5) u.hp = Math.min(u.maxHp, u.hp + d.regen * dt);
    const o = u.order;
    if (!o) {
      if (u.type !== 'worker' && d.kind !== 'healer') { const e = this.nearestEnemy(u, d.sight, true); if (e) this.setOrder(u, { type: 'attack', target: e.id, auto: true }); }
      return;
    }
    switch (o.type) {
      case 'move': {
        if (!u.path) this.pathTo(u, new Set([o.y * this.size + o.x]));
        if (this.follow(u, dt)) this.setOrder(u, null);
        break;
      }
      case 'amove': {
        const e = this.nearestEnemy(u, d.sight, false);
        if (e) { this.fight(u, e, dt); break; }
        if (!u.path) this.pathTo(u, new Set([o.y * this.size + o.x]));
        if (this.follow(u, dt)) {
          const next = this.nearestEnemy(u, 60, false);
          if (next) { const [cx, cy] = this.center(next); this.setOrder(u, { type: 'amove', x: Math.floor(cx), y: Math.floor(cy) }); } else this.setOrder(u, null);
        }
        break;
      }
      case 'attack': {
        const e = this.get(o.target);
        if (!e) { this.setOrder(u, null); break; }
        if (o.auto && this.distTo(u, e) > d.sight + 3) { this.setOrder(u, null); break; }
        this.fight(u, e, dt);
        break;
      }
      case 'hold': {
        // Hold position: strike anything that comes within reach, but never step away.
        let best = null, bd = d.range + 0.05;
        if (d.kind === 'healer') break;
        for (const e of this.ents.values()) {
          if (e.team === undefined || e.team === u.team || e.inside || (e.cat !== 'unit' && e.cat !== 'bld')) continue;
          const dd = this.distTo(u, e);
          if (dd <= bd) { bd = dd; best = e; }
        }
        if (best) {
          u.facing = Math.atan2(this.center(best)[1] - u.y, this.center(best)[0] - u.x);
          if (u.cd <= 0) { u.cd = d.cooldown; u.work = 0.01; this.damage(u, best, d.damage); }
        }
        break;
      }
      case 'shelter': {
        const b = this.get(o.target);
        if (!b) { this.setOrder(u, o.resume || null); break; }
        if (this.approach(u, b, 0.8, dt)) { u.inside = b.id; u.path = null; [u.x, u.y] = this.center(b); u.px = u.x; u.py = u.y; }
        break;
      }
      case 'gather': this.gather(u, o, dt); break;
      case 'return': this.returnCargo(u, o, dt); break;
      case 'build': {
        const b = this.get(o.target);
        if (!b || b.built) { this.afterBuild(u, b); break; }
        if (this.approach(u, b, 0.8, dt)) {
          const n = Math.max(1, builders.get(b.id) || 0);
          const rate = CONFIG.buildRate(n) / n;
          const dp = Math.min(1 - b.progress, dt / b.bt * rate);
          b.progress += dp;
          b.hp = Math.min(b.maxHp, b.hp + dp * b.maxHp * 0.95);
          u.work = (u.work + dt) % 1;
          u.facing = Math.atan2(b.y + b.h / 2 - u.y, b.x + b.w / 2 - u.x);
          if (b.progress >= 1 - 1e-6) {
            b.progress = 1; b.built = true; b.hp = Math.max(b.hp, b.maxHp * 0.98);
            this.teams[b.team].stats.built++;
            this.recount();
            this.events.push({ type: 'built', id: b.id, team: b.team });
            this.afterBuild(u, b);
          }
        }
        break;
      }
    }
  }

  afterBuild(u, b) {
    if (b && b.built && CONFIG.buildings[b.type].farm && !this.farmTaken(b, u)) { this.setOrder(u, { type: 'gather', target: b.id }); return; }
    const prev = u.prev; u.prev = null;
    if (prev && (prev.type === 'gather' || prev.type === 'return')) { const t = this.get(prev.target ?? prev.then); if (t) { this.setOrder(u, { type: 'gather', target: t.id }); return; } }
    this.setOrder(u, null);
  }

  fight(u, e, dt) {
    const d = this.def(u.team, u.type);
    if (this.approach(u, e, d.range, dt)) {
      u.facing = Math.atan2(this.center(e)[1] - u.y, this.center(e)[0] - u.x);
      if (u.cd <= 0) {
        u.cd = d.cooldown; u.work = 0.01;
        // Charge: a charger's first hit after a run-up deals double damage.
        const charged = d.kind === 'charger' && u.run >= 2.5;
        this.damage(u, e, d.damage * (charged ? 2 : 1));
        // Entangle: the Rootcoil Serpent's strike roots its target.
        if (d.trait === 'entangle' && e.cat === 'unit' && this.ents.has(e.id)) { e.rootT = 3; e.path = null; this.events.push({ type: 'rooted', id: e.id, by: u.id }); }
        if (charged) this.events.push({ type: 'charge', id: u.id });
        // Tailwind: a scout speeds away after landing a hit.
        if (d.kind === 'scout') u.boost = 3;
        u.run = 0;
      }
    }
  }

  // ---------- heroes and creatures ----------
  // Units of one side within r tiles of a point (sheltering workers are safe inside).
  near(x, y, r, team, enemies) {
    const out = [];
    for (const v of this.units()) if ((enemies ? v.team !== team : v.team === team) && Math.hypot(v.x - x, v.y - y) <= r) out.push(v);
    return out;
  }
  // Pushes a unit up to `dist` tiles away from a point, stopping at anything solid.
  knock(v, x, y, dist) {
    const dx = v.x - x, dy = v.y - y, d = Math.hypot(dx, dy) || 1, flies = this.def(v.team, v.type).flies;
    for (let k = 0; k < Math.round(dist * 5); k++) {
      const nx = v.x + dx / d * 0.2, ny = v.y + dy / d * 0.2;
      if (!flies && this.blocked(Math.floor(nx), Math.floor(ny))) break;
      if (!this.inside(Math.floor(nx), Math.floor(ny))) break;
      v.x = nx; v.y = ny;
    }
    v.path = null; v.repath = 0;
  }
  // Can this hero use its ability now? Returns { ok, why, wait }.
  canCast(u) {
    const d = u && this.def(u.team, u.type);
    if (!d?.cast) return { ok: false, why: 'none' };
    if (u.castCd > 0) return { ok: false, why: 'cooldown', wait: u.castCd };
    return { ok: true };
  }
  // A hero's ability, centred on the hero: Updraft, High Tide, Battle Roar or Root Snare.
  cast(id) {
    const u = this.get(id);
    if (!this.canCast(u).ok) return false;
    const d = this.def(u.team, u.type), c = d.cast, r = c.radius;
    const allies = this.near(u.x, u.y, r, u.team, false), foes = this.near(u.x, u.y, r * 0.9, u.team, true);
    let n = 0;
    if (c.id === 'updraft') for (const a of allies) { a.boost = 6; a.dodge = 6; n++; }
    else if (c.id === 'hightide') {
      for (const a of allies) { a.hp = Math.min(a.maxHp, a.hp + a.maxHp * 0.35); n++; }
      for (const f of foes) { this.knock(f, u.x, u.y, 2.4); this.damage(u, f, d.damage * 0.8); }
    } else if (c.id === 'roar') for (const a of allies) { a.roar = 8; n++; }
    else if (c.id === 'snare') for (const f of foes) { f.rootT = 5; f.path = null; this.damage(u, f, d.damage * 0.6); n++; }
    u.castCd = c.cooldown; u.work = 0.01;
    this.events.push({ type: 'cast', id: u.id, team: u.team, ability: c.id, x: u.x, y: u.y, r, n, hit: foes.map(f => f.id) });
    return true;
  }
  // Creature abilities work on their own.
  trait(u, d, dt) {
    if (u.traitCd > 0) return;
    if (d.trait === 'galeSlam') {
      // Gale Slam: a gust bursts from its paws when enemies crowd it.
      const foes = this.near(u.x, u.y, 2.3, u.team, true);
      if (!foes.length) { u.traitCd = 0.5; return; }
      for (const f of foes) { this.damage(u, f, d.damage * 0.7); if (this.ents.has(f.id)) this.knock(f, u.x, u.y, 1.6); }
      u.traitCd = 8;
      this.events.push({ type: 'trait', id: u.id, team: u.team, trait: d.trait, x: u.x, y: u.y, r: 2.3 });
    } else if (d.trait === 'healingRain') {
      // Healing Rain: friends beneath it heal a little every second.
      let healed = 0;
      for (const a of this.near(u.x, u.y, 2.6, u.team, false)) if (a.hp < a.maxHp) { a.hp = Math.min(a.maxHp, a.hp + 3 * d.scale); healed++; }
      u.traitCd = 1;
      if (healed) this.events.push({ type: 'trait', id: u.id, team: u.team, trait: d.trait, x: u.x, y: u.y, r: 2.6 });
    } else if (d.trait === 'fireRoar') {
      // Fire Roar: a cone of fire in front of it while it fights.
      const tgt = u.order?.type === 'attack' || u.order?.type === 'amove' ? this.nearestEnemy(u, 2.6, true) : null;
      if (!tgt) { u.traitCd = 0.5; return; }
      const face = Math.atan2(tgt.y - u.y, tgt.x - u.x);
      for (const f of this.near(u.x, u.y, 3.2, u.team, true)) {
        let da = Math.atan2(f.y - u.y, f.x - u.x) - face; da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) < 0.6) this.damage(u, f, d.damage * 0.9);
      }
      u.traitCd = 9; u.facing = face;
      this.events.push({ type: 'trait', id: u.id, team: u.team, trait: d.trait, x: u.x, y: u.y, r: 3.2, face });
    } else u.traitCd = 99; // Entangle works on each strike (see fight)
  }

  // Mend: a healer heals the most hurt ally within reach.
  mend(u, d, dt) {
    u.healCd -= dt;
    if (u.healCd > 0) return;
    let best = null, low = 1;
    for (const a of this.units()) {
      if (a.team !== u.team || a === u || a.hp >= a.maxHp) continue;
      if (Math.hypot(a.x - u.x, a.y - u.y) > d.range) continue;
      const f = a.hp / a.maxHp;
      if (f < low) { low = f; best = a; }
    }
    if (!best) { u.healCd = 0.3; return; }
    best.hp = Math.min(best.maxHp, best.hp + d.heal);
    u.healCd = 1; u.work = 0.01;
    u.facing = Math.atan2(best.y - u.y, best.x - u.x);
    this.events.push({ type: 'heal', from: u.id, to: best.id });
  }

  gather(u, o, dt) {
    let r = this.get(o.target);
    const kindOf = e => (e.cat === 'bld' ? 'farm' : e.kind);
    if (!r) {
      const kind = o.kind || (u.carry ? (u.carry.type === 'food' ? 'berries' : u.carry.type === 'gold' ? 'gold' : 'tree') : null);
      const next = kind && this.nearestResource(u.x, u.y, kind, 10, u.team);
      if (next) { o.target = next.id; return; }
      if (u.carry) { this.setOrder(u, { type: 'return', then: null }); return; }
      this.setOrder(u, null); return;
    }
    o.kind = kindOf(r);
    const type = r.cat === 'bld' ? 'food' : (r.kind === 'tree' ? 'lumber' : r.kind === 'gold' ? 'gold' : 'food');
    const cap = this.def(u.team, 'worker').carry;
    if (u.carry && (u.carry.type !== type || u.carry.amt >= cap)) { this.setOrder(u, { type: 'return', then: r.id }); return; }
    const inRange = r.cat === 'bld' ? this.distTo(u, r) <= 0.05 || this.approach(u, r, 0.05, dt) : this.approach(u, r, 0.8, dt);
    if (!inRange) return;
    const rate = r.cat === 'bld' ? CONFIG.gather.farm : CONFIG.gather[type];
    u.facing = Math.atan2(r.y + r.h / 2 - u.y, r.x + r.w / 2 - u.x);
    u.work = (u.work + dt) % 1;
    const amt = Math.min(rate * dt, r.cat === 'bld' ? Infinity : r.amount, cap - (u.carry?.amt || 0));
    u.carry = { type, amt: (u.carry?.amt || 0) + amt };
    if (r.cat === 'res') { r.amount -= amt; if (r.amount <= 1e-6) { this.remove(r); this.events.push({ type: 'depleted', id: r.id }); } }
    if (u.carry.amt >= cap - 1e-6) this.setOrder(u, { type: 'return', then: r.cat === 'res' && !this.ents.has(r.id) ? null : r.id, kind: o.kind });
  }

  returnCargo(u, o, dt) {
    if (!u.carry) { this.resume(u, o); return; }
    const drop = this.nearestDrop(u, u.carry.type);
    if (!drop) { this.setOrder(u, null); return; }
    if (this.approach(u, drop, 0.8, dt)) {
      const t = this.teams[u.team], amt = Math.floor(u.carry.amt + 1e-6);
      t.res[u.carry.type] += amt;
      t.stats.gathered[u.carry.type] += amt;
      this.events.push({ type: 'deposit', id: u.id, kind: u.carry.type, amt, team: u.team });
      u.carry = null;
      this.resume(u, o);
    }
  }

  resume(u, o) {
    const t = o.then != null ? this.get(o.then) : null;
    if (t) { this.setOrder(u, { type: 'gather', target: t.id }); return; }
    if (o.kind) { const next = this.nearestResource(u.x, u.y, o.kind, 12, u.team); if (next) { this.setOrder(u, { type: 'gather', target: next.id }); return; } }
    this.setOrder(u, null);
  }

  separate() {
    const list = [...this.units()];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      if (this.def(a.team, a.type).flies || this.def(b.team, b.type).flies) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), min = UNIT_R * 1.7;
      if (d >= min || d < 1e-6) continue;
      const push = (min - d) / 2 * 0.5, nx = dx / d, ny = dy / d;
      const am = !a.path?.length, bm = !b.path?.length;
      if (!this.blocked(Math.floor(a.x - nx * push), Math.floor(a.y - ny * push)) && am) { a.x -= nx * push; a.y -= ny * push; }
      if (!this.blocked(Math.floor(b.x + nx * push), Math.floor(b.y + ny * push)) && bm) { b.x += nx * push; b.y += ny * push; }
    }
  }

  drainEvents() { const e = this.events; this.events = []; return e; }
}
