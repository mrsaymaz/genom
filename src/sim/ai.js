// The rival. It plays by the same rules as the player (no resource cheats); the pace setting
// only changes its timings and the size of its attack waves.
import { CONFIG } from '../config.js';

export class RivalAI {
  constructor(world, team = 1) {
    this.w = world; this.team = team;
    this.p = CONFIG.pace[world.pace];
    this.tick = 0; this.wave = 0; this.nextWave = this.p.firstWaveAt; this.nextTrain = 0;
    this.home = [...world.buildings(team)].find(b => b.type === 'towncenter');
  }

  save() { return { tick: this.tick, wave: this.wave, nextWave: this.nextWave, nextTrain: this.nextTrain }; }
  load(d) { Object.assign(this, d); }

  get t() { return this.w.teams[this.team]; }
  mine(type) { return [...this.w.buildings(this.team)].filter(b => b.type === type); }
  units(type) { return [...this.w.units()].filter(u => u.team === this.team && (!type || u.type === type)); }

  update(dt) {
    this.tick -= dt;
    if (this.tick > 0 || this.w.winner !== null) return;
    this.tick = 1;
    this.home = this.mine('towncenter')[0];
    if (!this.home) return;
    this.economy();
    this.buildUp();
    this.army();
    this.ageUp();
  }

  economy() {
    const w = this.w, tc = this.home, t = this.t;
    const workers = this.units('worker');
    const queued = tc.queue.length;
    if (workers.length + queued < this.p.aiWorkers && queued < 2 && t.res.food >= 50 && !this.saving()) w.train(tc.id, 'worker');
    const counts = { food: 0, lumber: 0, gold: 0 };
    const kindOf = u => { const o = u.order; if (!o) return null; const e = w.get(o.target ?? o.then); if (!e) return o.kind === 'tree' ? 'lumber' : o.kind === 'gold' ? 'gold' : o.kind ? 'food' : null; return e.cat === 'bld' ? 'food' : e.kind === 'tree' ? 'lumber' : e.kind === 'gold' ? 'gold' : 'food'; };
    for (const u of workers) { const k = kindOf(u); if (k) counts[k]++; }
    const [cx, cy] = w.center(tc);
    for (const u of workers) {
      if (u.order) continue;
      const want = counts.food < workers.length * 0.45 ? 'food' : counts.lumber < workers.length * 0.35 ? 'lumber' : 'gold';
      let target = null;
      if (want === 'food') target = w.nearestResource(cx, cy, 'berries', 14) || w.nearestResource(cx, cy, 'farm', 20, this.team);
      else if (want === 'lumber') target = w.nearestResource(cx, cy, 'tree', 24);
      else target = w.nearestResource(cx, cy, 'gold', 24);
      if (!target) target = w.nearestResource(cx, cy, 'tree', 40);
      if (target) { w.orderGather([u.id], target.id); counts[want]++; }
    }
  }

  builder() {
    const ws = this.units('worker').filter(u => u.order?.type !== 'build');
    const [cx, cy] = this.w.center(this.home);
    ws.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
    return ws[0];
  }

  // Finds a free spot near an anchor, leaving a one-tile gap so paths stay open.
  spot(type, ax, ay) {
    const s = CONFIG.buildings[type].size, w = this.w;
    for (let r = 2; r < 14; r++) for (let k = 0; k < r * 8; k++) {
      const a = k / (r * 8) * Math.PI * 2, x = Math.round(ax + Math.cos(a) * r - s / 2), y = Math.round(ay + Math.sin(a) * r - s / 2);
      if (w.canPlace(this.team, type, x - 1, y - 1) && w.canPlace(this.team, type, x + 1, y + 1) && w.canPlace(this.team, type, x, y)) return [x, y];
    }
    return null;
  }

  tryBuild(type, ax, ay) {
    const d = CONFIG.buildings[type];
    if (!this.w.canAfford(this.team, d.cost)) return false;
    const pending = [...this.w.buildings(this.team)].some(b => b.type === type && !b.built);
    if (pending) return false;
    const s = this.spot(type, ax, ay), u = this.builder();
    if (!s || !u) return false;
    return !!this.w.place(this.team, type, s[0], s[1], [u.id]);
  }

  buildUp() {
    const w = this.w, t = this.t, [cx, cy] = w.center(this.home);
    const queued = [...w.buildings(this.team)].reduce((n, b) => n + b.queue.length, 0);
    if (t.popCap < CONFIG.popMax && t.popCap - t.pop - queued <= 2) this.tryBuild('house', cx, cy);
    if (w.time >= this.p.aiBarracksAt && !this.mine('barracks').length) this.tryBuild('barracks', cx + 2, cy + 2);
    if (!w.nearestResource(cx, cy, 'berries', 14) && this.mine('farm').length < Math.ceil(this.units('worker').length * 0.4)) this.tryBuild('farm', cx, cy);
    const grove = w.nearestResource(cx, cy, 'tree', 40);
    if (grove && Math.hypot(grove.x - cx, grove.y - cy) > 10 && !this.mine('storehouse').some(s => Math.hypot(s.x - grove.x, s.y - grove.y) < 8) && t.res.lumber > 120) this.tryBuild('storehouse', grove.x, grove.y);
    if (w.time > this.p.aiBarracksAt + 120 && !this.mine('watchtower').length) this.tryBuild('watchtower', cx + 3, cy + 3);
  }

  army() {
    const w = this.w, t = this.t;
    const rax = this.mine('barracks').find(b => b.built);
    if (rax && w.time >= this.nextTrain && rax.queue.length < 2 && !this.saving()) {
      // Keep a mix: about half spears, then ranged units and the nation's special.
      const mix = { spearman: 0.45, archer: 0.3, special: 0.25 };
      const type = Object.keys(mix).filter(t => w.canAfford(this.team, w.def(this.team, t).cost))
        .sort((a, b) => this.units(a).length / mix[a] - this.units(b).length / mix[b])[0] || 'spearman';
      if (w.train(rax.id, type)) this.nextTrain = w.time + this.p.aiTrainEvery;
    }
    const soldiers = this.units().filter(u => u.type !== 'worker');
    // Defend: enemies near home draw every idle soldier.
    const [cx, cy] = w.center(this.home);
    const intruder = [...w.units()].find(u => u.team !== this.team && Math.hypot(u.x - cx, u.y - cy) < 11);
    if (intruder) for (const s of soldiers) if (!s.order || s.order.type === 'move') w.orderAttack([s.id], intruder.id);
    // Attack waves.
    if (w.time >= this.nextWave) {
      const idle = soldiers.filter(s => !s.order || s.order.auto);
      const need = this.p.firstWave + this.wave * this.p.waveGrowth;
      if (idle.length >= need) {
        const target = this.targetBuilding();
        if (target) {
          const ids = idle.slice(0, need).map(s => s.id), [tx, ty] = w.center(target);
          w.orderAttackMove(ids, tx, ty);
          w.events.push({ type: 'wave', team: this.team, ids, target: target.id, n: this.wave + 1 });
        }
        this.wave++;
        this.nextWave = w.time + this.p.waveEvery;
      } else this.nextWave = w.time + 15;
    }
  }

  // The rival ages up too, on a timer set by the pace. From 90 s before, it stops training and
  // saves food and gold, moving workers onto gold if it is short.
  saving() {
    const next = this.w.nextAge(this.team);
    return !!next && this.w.time >= this.p.aiAgeAt - 90 && !this.home?.ageUp && this.mine('barracks').some(b => b.built);
  }
  ageUp() {
    const w = this.w;
    if (!this.saving()) return;
    if (w.time >= this.p.aiAgeAt && w.canAgeUp(this.team).ok) { w.startAgeUp(this.home.id); return; }
    const cost = CONFIG.ageUp[w.nextAge(this.team)].cost, r = this.t.res;
    const onGold = this.units('worker').filter(u => w.get(u.order?.target)?.kind === 'gold' || u.carry?.type === 'gold');
    if (r.gold < cost.gold && onGold.length < 4) {
      const pick = this.units('worker').find(u => w.get(u.order?.target)?.kind === 'tree');
      const [cx, cy] = w.center(this.home), mine = w.nearestResource(cx, cy, 'gold', 30);
      if (pick && mine) w.orderGather([pick.id], mine.id);
    }
  }

  targetBuilding() {
    const w = this.w, [cx, cy] = w.center(this.home);
    let best = null, bd = 1e9;
    for (const b of w.buildings(1 - this.team)) { const d = Math.hypot(b.x - cx, b.y - cy); if (d < bd) { bd = d; best = b; } }
    return best;
  }
}
