// Arena 1: Wildmere Valley, its wild creatures and its single age-up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/sim/world.js';
import { RivalAI } from '../src/sim/ai.js';
import { T } from '../src/sim/map.js';
import { WILD } from '../src/sim/wild.js';

const run = (w, seconds, ais = []) => { for (let t = 0; t < seconds; t += 0.05) { for (const a of ais) a.update(0.05); w.step(0.05); if (w.winner !== null) break; } };
const arena = (o = {}) => new World({ mapId: 'wildmere', teams: ['ravenclaw', 'gryffindor'], ...o });
const wild = (w, kind, mine = true) => [...w.ents.values()].filter(e => e.cat === 'wild' && (!kind || e.kind === kind) && (e.y > e.x) === mine);

test('Wildmere Valley is big, symmetric, and every gold mine and lair can be reached', () => {
  const w = arena(), n = w.size, t = w.map.terrain;
  assert.equal(n, 96);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) assert.equal(t[y * n + x], t[(n - 1 - y) * n + (n - 1 - x)], `terrain at ${x},${y}`);
  for (const k of [T.MOUNT, T.SAND, T.GARDEN, T.PAVE, T.DECOR]) assert.ok(t.includes(k), `has terrain ${k}`);
  // Flood fill from the player's base over open ground.
  const seen = new Uint8Array(n * n), b = w.map.bases[0], q = [[b.x - 1, b.y]];
  seen[b.y * n + b.x - 1] = 1;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = x + dx, c = y + dy; if (!w.inside(a, c) || seen[c * n + a] || w.blocked(a, c)) continue; seen[c * n + a] = 1; q.push([a, c]); } }
  const near = e => { for (let y = Math.floor(e.y) - 1; y <= Math.floor(e.y) + (e.h || 1); y++) for (let x = Math.floor(e.x) - 1; x <= Math.floor(e.x) + (e.w || 1); x++) if (w.inside(x, y) && seen[y * n + x]) return true; return false; };
  const gold = [...w.resources('gold')];
  assert.equal(gold.length, 18);
  for (const e of [...gold, ...w.buildings(), ...wild(w, null, true), ...wild(w, null, false)]) assert.ok(near(e), `${e.kind || e.type} at ${e.x},${e.y} is reachable`);
  // Each side holds the same gold, and far more than the tutorial map.
  const side = s => gold.filter(g => (g.y > g.x) === s).reduce((a, g) => a + g.amount, 0);
  assert.equal(side(true), side(false));
  assert.ok(side(true) >= 14000, `gold per side ${side(true)}`);
  // Lairs: wolves, boars, a bear and a troll on each side.
  for (const k of Object.keys(WILD)) assert.equal(wild(w, k, true).length, wild(w, k, false).length);
  assert.equal(wild(w, 'wolf').length, 3);
});

test('Arena 1 has one age-up: the Mythic Age is the last', () => {
  const w = arena();
  assert.equal(w.nextAge(0), 'mythic');
  w.enterAge(0, 'mythic');
  assert.equal(w.nextAge(0), null);
  assert.equal(w.canAgeUp(0).why, 'max');
});

test('wild creatures attack units that come close, chase only so far, and pay a bounty', () => {
  const w = arena(), tc = [...w.buildings(0)][0];
  const bear = wild(w, 'bear')[0];
  // A worker walks up to the bear: it is attacked and runs.
  const wk = w.spawnUnit(0, 'worker', tc); wk.x = wk.px = bear.x + 2.5; wk.y = wk.py = bear.y - 1.5;
  let fled = false;
  for (let i = 0; i < 80 && !fled; i++) { w.step(0.05); fled = w.drainEvents().some(e => e.type === 'fled'); }
  assert.ok(fled, 'the worker ran');
  // Far from its lair the bear gives up and goes home.
  run(w, 15);
  assert.ok(Math.hypot(bear.x - bear.hx, bear.y - bear.hy) < 1.5, 'the bear went home');
  // Eight spears clear it, for its bounty.
  const ids = [];
  for (let i = 0; i < 8; i++) { const s = w.spawnUnit(0, 'spearman', tc); s.x = s.px = bear.x + 3 + (i % 4) * 0.5; s.y = s.py = bear.y - 2 + Math.floor(i / 4) * 0.5; ids.push(s.id); }
  w.recount();
  const food = w.teams[0].res.food, gold = w.teams[0].res.gold;
  w.orderAttack(ids, bear.id);
  const ev = [];
  for (let i = 0; i < 20 * 40 && w.ents.has(bear.id); i++) { w.step(0.05); ev.push(...w.drainEvents()); }
  assert.ok(!w.ents.has(bear.id), 'the bear was beaten');
  assert.ok(ev.some(e => e.type === 'lairCleared' && e.kind === 'bear' && e.team === 0));
  assert.equal(w.teams[0].res.food - food, WILD.bear.bounty.food);
  assert.equal(w.teams[0].res.gold - gold, WILD.bear.bounty.gold);
  assert.equal(w.teams[0].stats.lairs, 1);
});

test('a sleeping troll only wakes when someone comes right up to it', () => {
  const w = arena(), tc = [...w.buildings(0)][0], troll = wild(w, 'troll')[0];
  const s = w.spawnUnit(0, 'archer', tc); s.x = s.px = troll.x + 2.9; s.y = s.py = troll.y; w.orderHold([s.id]);
  run(w, 3);
  assert.ok(troll.asleep, 'still asleep');
  s.x = s.px = troll.x + 1.6; run(w, 1);
  assert.ok(!troll.asleep && troll.target === s.id, 'awake and angry');
});

test('workers and the rival leave guarded resources alone until the lair is cleared', () => {
  const w = arena();
  const bear = wild(w, 'bear')[0], mine = w.nearestResource(bear.hx, bear.hy, 'gold', 6);
  assert.equal(mine, null, 'the bear mine is not offered');
  w.remove(bear); w.zones = null;
  assert.ok(w.nearestResource(bear.hx, bear.hy, 'gold', 6), 'free once the bear is gone');
});

test('a garden heals units resting in it', () => {
  const w = arena(), tc = [...w.buildings(0)][0];
  let gx, gy;
  for (let y = 0; y < w.size && gx === undefined; y++) for (let x = 0; x < w.size; x++) if (w.terrainAt(x, y) === T.GARDEN && !w.blocked(x, y) && y > x) { gx = x; gy = y; break; }
  const s = w.spawnUnit(0, 'spearman', tc); s.x = s.px = gx + 0.5; s.y = s.py = gy + 0.5; s.hp = 10; w.orderHold([s.id]);
  run(w, 8);
  assert.ok(s.hp > 25, `healed to ${s.hp}`);
});

test('an Arena 1 match saves and loads with its map and creatures', () => {
  const w = arena({ pace: 'challenge' });
  const ai = new RivalAI(w, 1);
  run(w, 60, [ai]);
  const back = World.load(JSON.parse(JSON.stringify(w.save())));
  assert.equal(back.mapId, 'wildmere');
  assert.equal(back.size, 96);
  assert.equal(wild(back).length + wild(back, null, false).length, wild(w).length + wild(w, null, false).length);
  for (let i = 0; i < 100; i++) { w.step(0.05); back.step(0.05); }
  assert.deepEqual(JSON.stringify(back.save().ents), JSON.stringify(w.save().ents), 'the loaded match runs exactly the same');
});

test('two rivals play 20 minutes of Arena 1: both reach the Mythic Age and clear lairs', () => {
  const w = arena({ pace: 'challenge' });
  const a = new RivalAI(w, 0), b = new RivalAI(w, 1);
  const ev = [];
  for (let t = 0; t < 20 * 60 && w.winner === null; t += 0.05) { a.update(0.05); b.update(0.05); w.step(0.05); ev.push(...w.drainEvents().filter(e => e.type === 'lairCleared')); }
  assert.ok(w.winner !== null || w.teams.every(t => t.age === 'mythic'), 'both reached the Mythic Age');
  assert.ok(ev.length >= 2, `lairs cleared: ${ev.length}`);
});

test('soldiers capture a wonder, it pays its owner, and enemies can take it back', () => {
  const w = arena(), tc = [...w.buildings(0)][0], o = w.wonders.find(x => x.kind === 'obelisk' && x.y > x.x);
  assert.equal(w.wonders.length, 4);
  // Workers alone do not capture.
  const wk = w.spawnUnit(0, 'worker', tc); wk.x = wk.px = o.x + 1.5; wk.y = wk.py = o.y + 0.5; w.orderHold([wk.id]);
  run(w, 5);
  assert.equal(o.owner, null);
  const mine = [];
  for (let i = 0; i < 3; i++) { const s = w.spawnUnit(0, 'spearman', tc); s.x = s.px = o.x + 1.5 + i * 0.4; s.y = s.py = o.y + 1.5; w.orderHold([s.id]); mine.push(s); }
  w.recount();
  run(w, 7);
  assert.equal(o.owner, 0, 'captured');
  const gold = w.teams[0].res.gold;
  run(w, 10);
  assert.ok(w.teams[0].res.gold - gold > 3, 'it pays gold');
  // The rival's soldiers take it back once ours are gone.
  for (const s of mine) w.remove(s);
  const foe = []; const rtc = [...w.buildings(1)][0];
  for (let i = 0; i < 3; i++) { const s = w.spawnUnit(1, 'spearman', rtc); s.x = s.px = o.x - 1.5 - i * 0.4; s.y = s.py = o.y - 1.5; w.orderHold([s.id]); foe.push(s); }
  w.recount();
  const ev = [];
  for (let i = 0; i < 20 * 16; i++) { w.step(0.05); ev.push(...w.drainEvents()); }
  assert.ok(ev.some(e => e.type === 'wonderUnder' && e.team === 0), 'the owner was warned');
  assert.ok(ev.some(e => e.type === 'wonderLost' && e.team === 0));
  assert.equal(o.owner, 1);
});

test('the Moonwell heals its owner and the old bridges cross at full speed', () => {
  const w = arena(), tc = [...w.buildings(0)][0], o = w.wonders.find(x => x.kind === 'moonwell' && x.y > x.x);
  o.owner = 0; o.p = 1;
  const s = w.spawnUnit(0, 'archer', tc); s.x = s.px = o.x + 2; s.y = s.py = o.y; s.hp = 5; w.orderHold([s.id]);
  run(w, 4);
  assert.ok(s.hp > 10, `healed to ${s.hp}`);
  const n = w.size; let bridges = 0;
  for (let i = 0; i < n * n; i++) if (w.map.terrain[i] === T.BRIDGE) { bridges++; assert.ok(!w.blocked(i % n, Math.floor(i / n))); }
  assert.ok(bridges >= 8, `bridge tiles ${bridges}`);
});
