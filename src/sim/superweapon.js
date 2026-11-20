// The Celestial Wonders and their superweapons. Each nation can raise one Wonder in the Celestial
// Age; once built it charges for four minutes (both sides see the countdown), then its owner
// unleashes the nation's superweapon on any spot, and it starts charging again.
//   Hufflepuff  Tempest Hive    Great Tempest  a cyclone wanders the area for 12 s: enemies are
//                                              lifted (held), flung aside and hurt, buildings torn
//                                              at, and friendly units nearby run faster
//   Ravenclaw   Moon Lighthouse Moonfall Tide  a great wave rolls through the spot, away from the
//                                              lighthouse: enemies swept back, hurt and slowed,
//                                              buildings struck; the flood slows enemies 30 s
//   Gryffindor  Phoenix Forge   Phoenix Strike the phoenix flies from the forge to the spot,
//                                              burning a trail, and bursts into a blaze that
//                                              keeps burning for 20 s
//   Slytherin   Titan's Henge   Great Quake    a rift tears open through the spot: enemies on it
//                                              held and hurt, buildings cracked, then a rocky
//                                              ridge rises along it and blocks the way for 30 s
// A superweapon never wins by itself: a Town Center loses at most 15% of its health to one use.
import { T } from './map.js';

export const SUPER = {
  air: { kind: 'tempest', wonder: 'Tempest Hive', name: 'Great Tempest', text: 'A cyclone lifts and flings enemies, tears at buildings and speeds up your units.' },
  water: { kind: 'tide', wonder: 'Moon Lighthouse', name: 'Moonfall Tide', text: 'A great wave sweeps enemies back, slows them and strikes buildings. The flood slows enemies.' },
  fire: { kind: 'phoenix', wonder: 'Phoenix Forge', name: 'Phoenix Strike', text: 'The phoenix flies to the target, burning a trail, and bursts into a great blaze.' },
  earth: { kind: 'quake', wonder: "Titan's Henge", name: 'Great Quake', text: 'A rift holds and hurts enemies, cracks buildings, then a ridge of rock blocks the way.' },
};
export const CHARGE = 240; // seconds to charge
const TC_CAP = 0.15;

export const superOf = (w, team) => SUPER[w.teams[team].nation.art];
export const wonderOf = (w, team) => [...w.buildings(team)].find(b => b.type === 'wonder');

// Damage from a superweapon: straight to the target's health, with the Town Center capped per use.
function hit(w, use, e, amt) {
  if (!w.ents.has(e.id) || e.team === use.team || e.inside) return;
  if (e.cat === 'bld' && e.type === 'towncenter') {
    if (w.teams[e.team].ward) return;
    const done = use.tc[e.id] || 0, room = e.maxHp * TC_CAP - done;
    amt = Math.max(0, Math.min(amt, room));
    use.tc[e.id] = done + amt;
  }
  if (amt <= 0) return;
  e.hp -= amt;
  e.hurtT = w.time;
  w.events.push({ type: 'hit', from: use.wonder, to: e.id, ranged: true, siege: true, team: use.team, super: true });
  if (e.hp > 0) return;
  const t = w.teams[use.team];
  if (e.cat === 'unit') { t.stats.killed++; w.teams[e.team].stats.lost++; } else t.stats.razed++;
  w.remove(e);
}
const foes = (w, team, f) => [...w.ents.values()].filter(e => (e.cat === 'unit' || e.cat === 'bld') && e.team !== undefined && e.team !== team && !e.inside && f(e));
const boxDist = (e, x, y) => (e.cat === 'unit' ? Math.hypot(e.x - x, e.y - y) : Math.hypot(Math.max(e.x - x, 0, x - (e.x + e.w)), Math.max(e.y - y, 0, y - (e.y + e.h))));
// Distance from a point to the segment a-b, and how far along it (0..1).
function seg(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)); return [Math.hypot(px - (ax + dx * t), py - (ay + dy * t)), t]; }

export function initSupers(w) { w.supers = []; w.floods = []; w.ridges = []; }

// Can this Wonder fire now? { ok, why, left }.
export function canFire(w, b) {
  if (!b || b.type !== 'wonder' || !b.built) return { ok: false, why: 'none' };
  const c = b.charge || 0;
  return c >= 1 ? { ok: true } : { ok: false, why: 'charging', left: (1 - c) * CHARGE };
}

export function fire(w, bid, tx, ty) {
  const b = w.get(bid);
  if (!canFire(w, b).ok) return false;
  b.charge = 0; b.warned = false;
  const S = superOf(w, b.team), [x0, y0] = w.center(b);
  tx = Math.max(1, Math.min(w.size - 1, tx)); ty = Math.max(1, Math.min(w.size - 1, ty));
  let dx = tx - x0, dy = ty - y0; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
  const use = { kind: S.kind, team: b.team, wonder: b.id, x: tx, y: ty, x0, y0, dx, dy, t: 0, tick: 0, tc: {}, hits: [] };
  if (S.kind === 'tempest') Object.assign(use, { dur: 12, cx: tx, cy: ty, ang: 0 });
  if (S.kind === 'tide') Object.assign(use, { dur: 4, len: 13, half: 5 });
  if (S.kind === 'phoenix') Object.assign(use, { dur: Math.max(2.4, d / 6.5), trail: 0 });
  if (S.kind === 'quake') {
    use.dur = 30;
    const ax = tx - dx * 5.5, ay = ty - dy * 5.5, bx = tx + dx * 5.5, by = ty + dy * 5.5;
    Object.assign(use, { ax, ay, bx, by });
    for (const e of foes(w, b.team, e => (e.cat === 'unit' ? seg(e.x, e.y, ax, ay, bx, by)[0] <= 1.4 : boxSeg(e, ax, ay, bx, by) <= 1.0))) {
      if (e.cat === 'unit') { hit(w, use, e, 55); if (w.ents.has(e.id)) { e.rootT = 3; e.path = null; } } else hit(w, use, e, 550);
    }
    // The ridge: open grass along the rift turns to rock for a while. Units on it step aside.
    const tiles = [];
    for (let y = Math.floor(Math.min(ay, by)) - 1; y <= Math.max(ay, by) + 1; y++) for (let x = Math.floor(Math.min(ax, bx)) - 1; x <= Math.max(ax, bx) + 1; x++) {
      if (!w.inside(x, y) || w.terrainAt(x, y) !== T.GRASS || w.occ[y * w.size + x]) continue;
      if (seg(x + 0.5, y + 0.5, ax, ay, bx, by)[0] > 0.62) continue;
      tiles.push(y * w.size + x);
    }
    for (const i of tiles) w.map.terrain[i] = T.ROCK;
    for (const u of w.units()) if (w.blocked(Math.floor(u.x), Math.floor(u.y))) { const s = w.freeTileNear({ x: Math.floor(u.x), y: Math.floor(u.y), w: 1, h: 1 }); if (s) { u.x = u.px = s[0] + 0.5; u.y = u.py = s[1] + 0.5; } u.path = null; }
    for (const u of w.units()) u.path = null; // everyone finds a new way
    w.ridges.push({ tiles, t: 30 });
    w.events.push({ type: 'ridge', tiles });
  }
  w.supers.push(use);
  w.events.push({ type: 'superFire', team: b.team, kind: S.kind, id: b.id, x0, y0, x: tx, y: ty, dx, dy, dur: use.dur });
  return true;
}
function boxSeg(e, ax, ay, bx, by) { let best = 1e9; for (const [x, y] of [[e.x, e.y], [e.x + e.w, e.y], [e.x, e.y + e.h], [e.x + e.w, e.y + e.h], [e.x + e.w / 2, e.y + e.h / 2]]) best = Math.min(best, seg(x, y, ax, ay, bx, by)[0]); return best; }

export function updateSupers(w, dt) {
  // Charging Wonders.
  for (const b of w.buildings()) {
    if (b.type !== 'wonder' || !b.built) continue;
    const before = b.charge || 0;
    b.charge = Math.min(1, before + dt / CHARGE);
    if (before < 1 - 60 / CHARGE && b.charge >= 1 - 60 / CHARGE) w.events.push({ type: 'superSoon', team: b.team, id: b.id });
    if (before < 1 && b.charge >= 1) w.events.push({ type: 'superReady', team: b.team, id: b.id });
  }
  // Weapons at work.
  w.supers = w.supers.filter(s => {
    s.t += dt; s.tick -= dt;
    const tick = s.tick <= 0;
    if (tick) s.tick = 0.25;
    if (s.kind === 'tempest') {
      s.ang += dt * 1.3;
      const r = Math.min(3, s.t * 0.45);
      s.cx = s.x + Math.cos(s.ang) * r; s.cy = s.y + Math.sin(s.ang) * r;
      if (tick) {
        for (const e of foes(w, s.team, e => boxDist(e, s.cx, s.cy) <= (e.cat === 'unit' ? 2.2 : 1.7))) {
          if (e.cat === 'unit') { hit(w, s, e, 7); if (w.ents.has(e.id)) { e.rootT = Math.max(e.rootT || 0, 0.6); w.knock(e, s.cx, s.cy, 0.5); } } else hit(w, s, e, 35);
        }
        for (const u of w.units()) if (u.team === s.team && Math.hypot(u.x - s.cx, u.y - s.cy) <= 4.5) u.boost = 1;
      }
    }
    if (s.kind === 'tide') {
      // The wave front moves from behind the target to beyond it.
      const front = -s.len / 2 + (s.t / s.dur) * s.len;
      for (const e of foes(w, s.team, e => !s.hits.includes(e.id))) {
        const [cx, cy] = w.center(e), along = (cx - s.x) * s.dx + (cy - s.y) * s.dy, across = Math.abs((cx - s.x) * -s.dy + (cy - s.y) * s.dx);
        if (across > s.half || along > front || along < front - 1.2) continue;
        s.hits.push(e.id);
        if (e.cat === 'unit') { hit(w, s, e, 55); if (w.ents.has(e.id)) { e.slowT = 6; w.knock(e, e.x - s.dx, e.y - s.dy, 2.5); } } else hit(w, s, e, 320);
      }
      if (s.t >= s.dur) for (let k = -1; k <= 1; k++) w.floods.push({ x: s.x + s.dx * k * 3.5, y: s.y + s.dy * k * 3.5, r: 3.2, t: 30, team: s.team });
    }
    if (s.kind === 'phoenix') {
      const k = Math.min(1, s.t / s.dur), px = s.x0 + (s.x - s.x0) * k, py = s.y0 + (s.y - s.y0) * k;
      s.px = px; s.py = py;
      // A burning trail behind the bird, once it is clear of the forge.
      if (Math.hypot(px - s.x0, py - s.y0) > 3 && Math.hypot(px - (s.lx ?? s.x0), py - (s.ly ?? s.y0)) >= 1.2) { s.lx = px; s.ly = py; w.burns.push({ x: px, y: py, r: 1.0, t: 8, tick: 0.5, dps: 10, team: s.team, from: s.wonder }); }
      if (k >= 1) {
        for (const e of foes(w, s.team, e => boxDist(e, s.x, s.y) <= 3.2)) hit(w, s, e, e.cat === 'unit' ? 70 : 650);
        w.burns.push({ x: s.x, y: s.y, r: 3, t: 20, tick: 0.5, dps: 14, team: s.team, from: s.wonder });
        w.events.push({ type: 'superBurst', team: s.team, kind: s.kind, x: s.x, y: s.y });
      }
    }
    return s.t < s.dur;
  });
  // The flood: enemies wading through it are slowed.
  if (w.floods.length) w.floods = w.floods.filter(f => {
    f.t -= dt;
    for (const u of w.units()) if (u.team !== f.team && Math.hypot(u.x - f.x, u.y - f.y) <= f.r) u.slowT = Math.max(u.slowT || 0, 0.4);
    return f.t > 0;
  });
  // The ridge sinks back after 30 seconds.
  if (w.ridges.length) w.ridges = w.ridges.filter(r => {
    r.t -= dt;
    if (r.t > 0) return true;
    for (const i of r.tiles) w.map.terrain[i] = T.GRASS;
    w.events.push({ type: 'ridgeEnd', tiles: r.tiles });
    return false;
  });
}

// After loading a save: the map is rebuilt from its seed, so put standing ridges back.
export function restoreSupers(w, data) {
  w.supers = data.supers || []; w.floods = data.floods || []; w.ridges = data.ridges || [];
  for (const r of w.ridges) for (const i of r.tiles) w.map.terrain[i] = T.ROCK;
}

export const wonderName = art => SUPER[art].wonder;
