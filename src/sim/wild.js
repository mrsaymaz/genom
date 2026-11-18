// Wild creatures of the arena maps. They belong to no team: each lives at its lair, attacks any
// unit (from either side) that comes close, chases only so far from home, then goes back and heals.
// They guard the richest places, so clearing a lair is a choice: it costs soldiers, and it pays a
// bounty and opens the treasure. Soldiers on attack-move walk past them; they fight a creature
// only when ordered to, or when it attacks them first. Workers run from them.
import { findPath } from './path.js';
import { T } from './map.js';

export const WILD = {
  wolf: { name: 'Wolf', plural: 'wolves', hp: 50, damage: 6, cooldown: 1.1, speed: 2.6, range: 0.9, aggro: 5, leash: 9, bounty: { food: 30 }, pack: true },
  boar: { name: 'Wild Boar', plural: 'wild boars', hp: 95, damage: 9, cooldown: 1.4, speed: 2.5, range: 0.9, aggro: 3.5, leash: 7, bounty: { food: 60 }, charge: true, pack: true },
  bear: { name: 'Cave Bear', plural: 'cave bears', hp: 280, damage: 16, cooldown: 1.5, speed: 2.1, range: 1, aggro: 4.5, leash: 8, bounty: { food: 100, gold: 50 } },
  troll: { name: 'Stone Troll', plural: 'stone trolls', hp: 750, damage: 30, cooldown: 2.3, speed: 1.7, range: 1.3, aggro: 3, leash: 7, bounty: { gold: 250 }, sleeps: true, smash: 1.3 },
};
// What each wild creature says about itself when tapped.
export const WILD_INFO = {
  wolf: 'A wolf pack guards this forest. Send soldiers together, or stay away.',
  boar: 'Wild boars charge anyone near the oasis. Spear fighters beat them best.',
  bear: 'A cave bear guards this gold mine. Bring a strong group to clear it.',
  troll: 'A stone troll sleeps on a hoard of gold. Wake it only with an army!',
};
const UNIT_R = 0.3;

export function spawnWild(w) {
  (w.map.lairs || []).forEach((L, li) => {
    const d = WILD[L.kind];
    for (let i = 0; i < L.n; i++) {
      const a = (i / L.n) * Math.PI * 2, rr = L.n > 1 ? 0.8 : 0;
      const hx = L.x + Math.cos(a) * rr, hy = L.y + Math.sin(a) * rr;
      const e = { id: w.nextId++, cat: 'wild', kind: L.kind, lair: li, hx, hy, x: hx, y: hy, px: hx, py: hy, hp: d.hp, maxHp: d.hp, cd: 0, facing: a + Math.PI, target: null, path: null, pathT: 0, hurtT: -99, asleep: !!d.sleeps, back: false, run: 0, work: 0 };
      w.ents.set(e.id, e);
    }
  });
}

export function* wilds(w) { for (const e of w.ents.values()) if (e.cat === 'wild') yield e; }

// Lairs that still have creatures, as danger zones: { x, y, r }. Workers and the rival keep out.
export function dangerZones(w) {
  const out = [], seen = new Set();
  for (const e of wilds(w)) { if (seen.has(e.lair)) continue; seen.add(e.lair); const L = w.map.lairs[e.lair]; out.push({ x: L.x, y: L.y, r: WILD[L.kind].aggro + 2.5, lair: e.lair, kind: L.kind }); }
  return out;
}

export function updateWild(w, dt) {
  // The walled gardens: units resting on the lawn heal.
  for (const u of w.units()) if (u.hp < u.maxHp && w.terrainAt(Math.floor(u.x), Math.floor(u.y)) === T.GARDEN && w.time - (u.hurtT ?? -99) > 3) u.hp = Math.min(u.maxHp, u.hp + 2.5 * dt);
  for (const e of [...wilds(w)]) {
    const d = WILD[e.kind];
    e.px = e.x; e.py = e.y; e.cd -= dt; e.work = Math.max(0, e.work - dt);
    const fromHome = (x, y) => Math.hypot(x - e.hx, y - e.hy);
    let t = e.target && w.get(e.target);
    if (t && (t.cat !== 'unit' || t.inside || fromHome(t.x, t.y) > d.leash + 1.5)) { t = null; e.target = null; e.back = true; e.path = null; }
    if (!t && !e.back) {
      // Look for prey: a sleeping troll only wakes when someone comes right up to it.
      const reach = e.asleep ? 2.2 : d.aggro;
      let best = null, bd = reach;
      for (const u of w.units()) { const dd = Math.hypot(u.x - e.x, u.y - e.y); if (dd < bd && fromHome(u.x, u.y) <= d.leash) { bd = dd; best = u; } }
      if (best) aggro(w, e, best);
      t = e.target && w.get(e.target);
    }
    if (t) {
      const dist = Math.hypot(t.x - e.x, t.y - e.y) - UNIT_R;
      e.facing = Math.atan2(t.y - e.y, t.x - e.x);
      if (dist <= d.range) {
        if (e.cd <= 0) { e.cd = d.cooldown; e.work = 0.4; strike(w, e, t, d); e.run = 0; }
      } else {
        walk(w, e, t.x, t.y, d.speed, dt);
        e.run += dt;
        if (fromHome(e.x, e.y) > d.leash) { e.target = null; e.back = true; e.path = null; }
      }
    } else if (fromHome(e.x, e.y) > 0.4) {
      walk(w, e, e.hx, e.hy, d.speed * 0.8, dt);
      if (fromHome(e.x, e.y) <= 0.5) { e.back = false; e.path = null; }
    } else {
      e.back = false;
      // At home: heal, and a troll left alone dozes off again.
      if (w.time - e.hurtT > 4) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.05 * dt);
      if (d.sleeps && w.time - e.hurtT > 12) e.asleep = true;
    }
  }
}

// Sets a creature on a unit; its pack joins in.
function aggro(w, e, u) {
  e.target = u.id; e.asleep = false; e.back = false; e.path = null;
  if (!WILD[e.kind].pack) return;
  for (const o of wilds(w)) if (o.lair === e.lair && !o.target) { o.target = u.id; o.asleep = false; o.back = false; o.path = null; }
}

// Walks towards a point, along a path around anything solid.
function walk(w, e, tx, ty, speed, dt) {
  e.pathT -= dt;
  if (!e.path || e.pathT <= 0) {
    e.pathT = 0.6;
    const goal = new Set([Math.floor(ty) * w.size + Math.floor(tx)]);
    const p = findPath(w.size, (x, y) => w.blocked(x, y), Math.floor(e.x), Math.floor(e.y), goal, 2500);
    e.path = p ? p.map(([x, y]) => [x + 0.5, y + 0.5]) : [];
    if (e.path.length) e.path[e.path.length - 1] = [tx, ty]; else e.path = [[tx, ty]];
  }
  let step = speed * dt;
  while (step > 0 && e.path.length) {
    const [px, py] = e.path[0], dx = px - e.x, dy = py - e.y, dd = Math.hypot(dx, dy);
    if (dd <= step) { e.x = px; e.y = py; e.path.shift(); step -= dd; continue; }
    const nx = e.x + (dx / dd) * step, ny = e.y + (dy / dd) * step;
    if (w.blocked(Math.floor(nx), Math.floor(ny)) && !w.blocked(Math.floor(e.x), Math.floor(e.y))) { e.path = null; break; }
    e.x = nx; e.y = ny; e.facing = Math.atan2(dy, dx); step = 0;
  }
}

function strike(w, e, t, d) {
  const dmg = d.damage * (d.charge && e.run >= 1.5 ? 2 : 1);
  if (d.charge && e.run >= 1.5) w.events.push({ type: 'charge', id: e.id });
  if (d.smash) {
    // The troll's club hits everyone around its target.
    for (const u of [...w.units()]) if (Math.hypot(u.x - t.x, u.y - t.y) <= d.smash) hurt(w, e, u, u === t ? dmg : dmg * 0.6);
    w.events.push({ type: 'smash', id: e.id, x: t.x, y: t.y, r: d.smash });
  } else hurt(w, e, t, dmg);
}

function hurt(w, e, u, dmg) {
  if (!w.ents.has(u.id)) return;
  u.hp -= dmg; u.hurtT = w.time;
  w.events.push({ type: 'hit', from: e.id, to: u.id, ranged: false, siege: false, team: -1, wild: true });
  if (u.hp <= 0) { w.teams[u.team].stats.lost++; w.remove(u); return; }
  const kind = w.def(u.team, u.type).kind;
  if (u.type === 'worker' || kind === 'healer') {
    // Workers and healers run, away from the creature and towards home.
    if (u.order?.type === 'move' && u.order.flee) return;
    const dx = u.x - e.x, dy = u.y - e.y, dd = Math.hypot(dx, dy) || 1;
    const tc = [...w.buildings(u.team)].find(b => b.type === 'towncenter');
    let fx = u.x + (dx / dd) * 6, fy = u.y + (dy / dd) * 6;
    if (tc) { const [cx, cy] = w.center(tc), hd = Math.hypot(cx - u.x, cy - u.y) || 1; fx = (fx + u.x + ((cx - u.x) / hd) * 6) / 2; fy = (fy + u.y + ((cy - u.y) / hd) * 6) / 2; }
    fx = Math.max(0, Math.min(w.size - 1, Math.floor(fx))); fy = Math.max(0, Math.min(w.size - 1, Math.floor(fy)));
    if (w.blocked(fx, fy)) { const s = w.freeTileNear({ x: fx, y: fy, w: 1, h: 1 }); if (s) [fx, fy] = s; }
    w.setOrder(u, { type: 'move', x: fx, y: fy, flee: true });
    w.events.push({ type: 'fled', id: u.id, team: u.team, kind: e.kind });
  } else if (!u.order || u.order.auto) w.setOrder(u, { type: 'attack', target: e.id, auto: true });
}

// A unit hits a wild creature. Spears were made for hunting: they hit beasts harder.
export function hurtWild(w, a, e, amount) {
  const d = WILD[e.kind];
  let dmg = amount;
  if (a.cat === 'unit') { const ad = w.def(a.team, a.type); if (ad.line === 'infantry') dmg *= 1.5; }
  e.hp -= dmg; e.hurtT = w.time;
  const ad = a.cat === 'unit' ? w.def(a.team, a.type) : null;
  w.events.push({ type: 'hit', from: a.id, to: e.id, ranged: !ad || (ad.attackType === 'ranged' && !ad.siege), siege: !!ad?.siege, team: a.team });
  if (a.cat === 'unit') {
    const cur = e.target && w.get(e.target);
    if (!cur || Math.hypot(cur.x - e.x, cur.y - e.y) > Math.hypot(a.x - e.x, a.y - e.y) + 1) if (Math.hypot(a.x - e.hx, a.y - e.hy) <= d.leash + 1) aggro(w, e, a);
    if (e.asleep) aggro(w, e, a);
  }
  if (e.hp > 0) return;
  w.remove(e);
  const team = w.teams[a.team];
  for (const [k, v] of Object.entries(d.bounty)) team.res[k] += v;
  team.stats.killed++;
  team.stats.wild = (team.stats.wild || 0) + 1;
  w.events.push({ type: 'wildDown', kind: e.kind, team: a.team, bounty: d.bounty, x: e.x, y: e.y });
  if (![...wilds(w)].some(o => o.lair === e.lair)) {
    const L = w.map.lairs[e.lair];
    team.stats.lairs = (team.stats.lairs || 0) + 1;
    w.events.push({ type: 'lairCleared', kind: e.kind, team: a.team, x: L.x, y: L.y });
  }
}
