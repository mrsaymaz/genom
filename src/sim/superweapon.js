// The Celestial Wonders and their superweapons. Each nation can raise one Wonder in the Celestial
// Age; once built it charges for four minutes (both sides see the countdown). Then its owner picks
// a circle anywhere on the map (radius RADIUS tiles), confirms, speaks the incantation (an English
// task, for the player), and the superweapon devastates everything of the enemy inside the circle.
//   Hufflepuff  Tempest Hive    Great Tempest  for 12 s a storm rages in the circle, with a cyclone
//                                              roaming it: enemies are lifted, battered and flung
//                                              out, buildings torn apart; friendly units run faster
//   Ravenclaw   Moon Lighthouse Moonfall Tide  the sea crashes down in the middle and a ring wave
//                                              rolls out to the edge, sweeping enemies outward and
//                                              smashing buildings; the flood slows enemies 30 s
//   Gryffindor  Phoenix Forge   Phoenix Strike the phoenix flies to the circle and bursts: the
//                                              blast hits everything in it and the whole circle
//                                              burns for 20 s
//   Slytherin   Titan's Henge   Great Quake    the ground breaks under the circle: enemies held
//                                              and hurt, buildings shattered, three aftershocks,
//                                              then a ring of rock rises round the edge for 30 s
//                                              (with four gaps), trapping what is left inside
// A Town Center loses at most 65% of its health to one use: devastating, but not the whole match.
import { T } from './map.js';

export const SUPER = {
  air: { kind: 'tempest', wonder: 'Tempest Hive', name: 'Great Tempest', text: 'A storm rages in the circle for 12 seconds: enemies are lifted, battered and flung out, buildings torn apart, and your units run faster.' },
  water: { kind: 'tide', wonder: 'Moon Lighthouse', name: 'Moonfall Tide', text: 'The sea crashes down and a great wave rolls out to the edge of the circle, smashing enemies and buildings. The flood slows enemies.' },
  fire: { kind: 'phoenix', wonder: 'Phoenix Forge', name: 'Phoenix Strike', text: 'The phoenix bursts over the circle: a blast hits everything in it, and the whole circle burns for 20 seconds.' },
  earth: { kind: 'quake', wonder: "Titan's Henge", name: 'Great Quake', text: 'The ground breaks under the circle: enemies are held and hurt, buildings shattered, and a ring of rock traps what is left.' },
};
export const CHARGE = 240; // seconds to charge
export const RADIUS = 6; // tiles
const TC_CAP = 0.65;

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
// Distance from a point to an entity (its nearest edge for a building).
const dist = (e, x, y) => (e.cat === 'unit' ? Math.hypot(e.x - x, e.y - y) : Math.hypot(Math.max(e.x - x, 0, x - (e.x + e.w)), Math.max(e.y - y, 0, y - (e.y + e.h))));
// Enemy units and buildings within r of a point.
export const inCircle = (w, team, x, y, r) => [...w.ents.values()].filter(e => (e.cat === 'unit' || e.cat === 'bld') && e.team !== undefined && e.team !== team && !e.inside && dist(e, x, y) <= r);

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
  b.charge = 0;
  const S = superOf(w, b.team), [x0, y0] = w.center(b), R = RADIUS;
  tx = Math.max(1, Math.min(w.size - 1, tx)); ty = Math.max(1, Math.min(w.size - 1, ty));
  const use = { kind: S.kind, team: b.team, wonder: b.id, x: tx, y: ty, x0, y0, r: R, t: 0, tick: 0, tc: {}, hits: [] };
  if (S.kind === 'tempest') Object.assign(use, { dur: 12, cx: tx, cy: ty, ang: 0 });
  if (S.kind === 'tide') Object.assign(use, { dur: 3.5 });
  if (S.kind === 'phoenix') Object.assign(use, { dur: Math.max(2.4, Math.hypot(tx - x0, ty - y0) / 6.5) });
  if (S.kind === 'quake') {
    use.dur = 3.2; use.shocks = 0;
    for (const e of inCircle(w, b.team, tx, ty, R)) {
      if (e.cat === 'unit') { hit(w, use, e, 130); if (w.ents.has(e.id)) { e.rootT = 4; e.path = null; } } else hit(w, use, e, 1500);
    }
    // A ring of rock rises round the edge, with four gaps so the way is never shut for good.
    const tiles = [];
    for (let y = Math.floor(ty - R - 1); y <= ty + R + 1; y++) for (let x = Math.floor(tx - R - 1); x <= tx + R + 1; x++) {
      if (!w.inside(x, y) || w.terrainAt(x, y) !== T.GRASS || w.occ[y * w.size + x]) continue;
      const d = Math.hypot(x + 0.5 - tx, y + 0.5 - ty), a = Math.atan2(y + 0.5 - ty, x + 0.5 - tx);
      if (Math.abs(d - R) > 0.55) continue;
      if ([0, 1, 2, 3].some(k => Math.abs(Math.atan2(Math.sin(a - k * Math.PI / 2 - Math.PI / 4), Math.cos(a - k * Math.PI / 2 - Math.PI / 4))) < 0.16)) continue;
      tiles.push(y * w.size + x);
    }
    for (const i of tiles) w.map.terrain[i] = T.ROCK;
    for (const u of w.units()) if (w.blocked(Math.floor(u.x), Math.floor(u.y))) { const s = w.freeTileNear({ x: Math.floor(u.x), y: Math.floor(u.y), w: 1, h: 1 }); if (s) { u.x = u.px = s[0] + 0.5; u.y = u.py = s[1] + 0.5; } }
    for (const u of w.units()) u.path = null; // everyone finds a new way
    w.ridges.push({ tiles, t: 30 });
  }
  w.supers.push(use);
  w.events.push({ type: 'superFire', team: b.team, kind: S.kind, id: b.id, x0, y0, x: tx, y: ty, r: R, dur: use.dur });
  return true;
}

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
      // The cyclone roams the circle; the storm batters everything inside it.
      s.ang += dt * 1.1;
      const rr = s.r * 0.55 * Math.min(1, s.t / 2);
      s.cx = s.x + Math.cos(s.ang) * rr; s.cy = s.y + Math.sin(s.ang * 1.7) * rr;
      if (tick) {
        for (const e of inCircle(w, s.team, s.x, s.y, s.r)) {
          const near = dist(e, s.cx, s.cy) <= 2.4;
          if (e.cat === 'unit') { hit(w, s, e, near ? 9 : 5); if (w.ents.has(e.id) && near) { e.rootT = Math.max(e.rootT || 0, 0.6); w.knock(e, s.cx, s.cy, 0.6); } } else hit(w, s, e, near ? 90 : 45);
        }
        for (const u of w.units()) if (u.team === s.team && Math.hypot(u.x - s.x, u.y - s.y) <= s.r + 2) u.boost = 1;
      }
    }
    if (s.kind === 'tide') {
      // The ring wave rolls out from the middle to the edge of the circle.
      const front = 0.5 + (s.t / s.dur) * (s.r + 0.5);
      for (const e of inCircle(w, s.team, s.x, s.y, s.r)) {
        if (s.hits.includes(e.id)) continue;
        const [cx, cy] = w.center(e);
        if (Math.hypot(cx - s.x, cy - s.y) - (e.cat === 'bld' ? e.w / 2 : 0) > front) continue;
        s.hits.push(e.id);
        if (e.cat === 'unit') { hit(w, s, e, 140); if (w.ents.has(e.id)) { e.slowT = 8; w.knock(e, s.x, s.y, 2.5); } } else hit(w, s, e, 1800);
      }
      if (s.t >= s.dur) w.floods.push({ x: s.x, y: s.y, r: s.r, t: 30, team: s.team });
    }
    if (s.kind === 'phoenix') {
      const k = Math.min(1, s.t / s.dur);
      if (k >= 1) {
        for (const e of inCircle(w, s.team, s.x, s.y, s.r)) hit(w, s, e, e.cat === 'unit' ? 150 : 1800);
        w.burns.push({ x: s.x, y: s.y, r: s.r, t: 20, tick: 0.5, dps: 25, team: s.team, from: s.wonder });
        w.events.push({ type: 'superBurst', team: s.team, kind: s.kind, x: s.x, y: s.y, r: s.r });
      }
    }
    if (s.kind === 'quake') {
      // Three aftershocks, one a second.
      while (s.shocks < 3 && s.t >= 0.8 + s.shocks) {
        s.shocks++;
        for (const e of inCircle(w, s.team, s.x, s.y, s.r)) hit(w, s, e, e.cat === 'unit' ? 25 : 300);
        w.events.push({ type: 'superShock', team: s.team, x: s.x, y: s.y, r: s.r });
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
  // The ring of rock sinks back after 30 seconds.
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
