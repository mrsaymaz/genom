// The match simulation: map, teams, resources, buildings, units, orders and combat.
// Pure logic with no rendering, so it runs headless in the tests.
import { CONFIG } from '../config.js';
import { generateMap, T } from './map.js';
import { findPath } from './path.js';

const UNIT_R = 0.32;

export class World {
  constructor({ teams = ['hufflepuff', 'gryffindor'], pace = 'relaxed', seed = CONFIG.map.seed } = {}) {
    this.cfg = CONFIG;
    this.pace = CONFIG.pace[pace] ? pace : 'relaxed';
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

  spawnUnit(team, type, near) {
    const d = CONFIG.units[type];
    const spot = this.freeTileNear(near) || [near.x, near.y];
    const e = {
      id: this.nextId++, cat: 'unit', type, team, x: spot[0] + 0.5, y: spot[1] + 0.5, px: spot[0] + 0.5, py: spot[1] + 0.5,
      hp: d.hp, maxHp: d.hp, order: null, path: null, carry: null, cd: 0, facing: 0, work: 0, prev: null, repath: 0,
    };
    this.ents.set(e.id, e);
    this.teams[team].pop++;
    this.events.push({ type: 'spawn', id: e.id });
    return e;
  }

  remove(e) {
    if (!this.ents.has(e.id)) return;
    this.ents.delete(e.id);
    if (e.cat !== 'unit') this.mark(e, 0);
    if (e.cat === 'unit') this.teams[e.team].pop--;
    this.events.push({ type: 'removed', id: e.id, cat: e.cat, kind: e.kind || e.type, team: e.team });
    if (e.cat === 'bld') {
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

  *units() { for (const e of this.ents.values()) if (e.cat === 'unit') yield e; }
  *buildings(team) { for (const e of this.ents.values()) if (e.cat === 'bld' && (team === undefined || e.team === team)) yield e; }
  *resources(kind) { for (const e of this.ents.values()) if (e.cat === 'res' && (!kind || e.kind === kind)) yield e; }
  get(id) { return this.ents.get(id); }

  // ---------- placement and production ----------
  canAfford(team, cost) { const r = this.teams[team].res; return Object.entries(cost || {}).every(([k, v]) => r[k] >= v); }
  pay(team, cost) { const r = this.teams[team].res; for (const [k, v] of Object.entries(cost || {})) r[k] -= v; }
  refund(team, cost) { const r = this.teams[team].res; for (const [k, v] of Object.entries(cost || {})) r[k] += v; }

  canPlace(team, type, x, y) {
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

  train(bid, type) {
    const b = this.get(bid);
    if (!b || !b.built || b.queue.length >= 5) return false;
    const d = CONFIG.units[type];
    if (!CONFIG.buildings[b.type].trains?.includes(type) || !this.canAfford(b.team, d.cost)) return false;
    this.pay(b.team, d.cost);
    b.queue.push({ type, t: 0 });
    return true;
  }

  cancel(bid, i) {
    const b = this.get(bid);
    if (!b || !b.queue[i]) return;
    this.refund(b.team, CONFIG.units[b.queue[i].type].cost);
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
    const p = findPath(this.size, (x, y) => this.blocked(x, y), Math.floor(u.x), Math.floor(u.y), goals);
    u.path = p ? p.map(([x, y]) => [x + 0.5, y + 0.5]) : [];
    // Already on a goal tile but off its centre: finish the last half-step.
    if (p && !p.length) { const cx = Math.floor(u.x) + 0.5, cy = Math.floor(u.y) + 0.5; if (Math.hypot(cx - u.x, cy - u.y) > 0.05) u.path = [[cx, cy]]; }
    return p;
  }

  // Moves along the path; returns true when the path is finished.
  follow(u, dt) {
    if (!u.path || !u.path.length) return true;
    const speed = CONFIG.units[u.type].speed * (this.terrainAt(Math.floor(u.x), Math.floor(u.y)) === T.FORD ? 0.7 : 1);
    let step = speed * dt;
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
      if (e.team === undefined || e.team === u.team || (onlyUnits && e.cat !== 'unit')) continue;
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
  damage(attacker, target, amount) {
    if (!this.ents.has(target.id)) return;
    let dmg = amount;
    if (target.cat === 'bld') dmg *= attacker.cat === 'unit' ? ({ spearman: 1.5, archer: 0.35, worker: 0.5 }[attacker.type] ?? 1) : 0.5;
    target.hp -= dmg;
    this.events.push({ type: 'hit', from: attacker.id, to: target.id, ranged: (attacker.cat === 'bld' || attacker.type === 'archer') });
    // Idle soldiers fight back; workers fight back only when they have nothing else to do.
    if (target.cat === 'unit' && attacker.cat === 'unit') {
      const free = !target.order || (target.order.auto && target.type !== 'worker');
      if (free) this.setOrder(target, { type: 'attack', target: attacker.id, auto: true });
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
    if (b.queue.length) {
      const q = b.queue[0], ud = CONFIG.units[q.type], t = this.teams[b.team];
      if (q.t < ud.time) q.t += dt;
      if (q.t >= ud.time) {
        if (t.pop < t.popCap) {
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
        if (best) { b.cd = d.attack.cooldown; this.damage(b, best, d.attack.damage); }
      }
    }
  }

  updateUnit(u, dt, builders) {
    const d = CONFIG.units[u.type];
    u.cd -= dt;
    const o = u.order;
    if (!o) {
      if (u.type !== 'worker') { const e = this.nearestEnemy(u, d.sight, true); if (e) this.setOrder(u, { type: 'attack', target: e.id, auto: true }); }
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
        for (const e of this.ents.values()) {
          if (e.team === undefined || e.team === u.team || (e.cat !== 'unit' && e.cat !== 'bld')) continue;
          const dd = this.distTo(u, e);
          if (dd <= bd) { bd = dd; best = e; }
        }
        if (best) {
          u.facing = Math.atan2(this.center(best)[1] - u.y, this.center(best)[0] - u.x);
          if (u.cd <= 0) { u.cd = d.cooldown; u.work = 0.01; this.damage(u, best, d.damage); }
        }
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
    const d = CONFIG.units[u.type];
    if (this.approach(u, e, d.range, dt)) {
      u.facing = Math.atan2(this.center(e)[1] - u.y, this.center(e)[0] - u.x);
      if (u.cd <= 0) { u.cd = d.cooldown; u.work = 0.01; this.damage(u, e, d.damage); }
    }
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
    const cap = CONFIG.units.worker.carry;
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
