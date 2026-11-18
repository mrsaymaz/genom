import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/sim/world.js';
import { RivalAI } from '../src/sim/ai.js';
import { findPath } from '../src/sim/path.js';
import { T } from '../src/sim/map.js';

const run = (w, seconds, ais = []) => { for (let t = 0; t < seconds; t += 0.05) { for (const a of ais) a.update(0.05); w.step(0.05); if (w.winner !== null) break; } };

test('the map is symmetric and both bases can reach each other', () => {
  const w = new World();
  const n = w.size;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) assert.equal(w.map.terrain[y * n + x], w.map.terrain[(n - 1 - y) * n + (n - 1 - x)], `terrain at ${x},${y}`);
  const [a, b] = w.map.bases;
  const goals = new Set([(b.y - 1) * n + b.x]);
  const p = findPath(n, (x, y) => w.blocked(x, y), a.x + 4, a.y + 4, goals, 20000);
  assert.ok(p && p.length > 10, 'a path exists between the bases');
  const [lx, ly] = p[p.length - 1];
  assert.deepEqual([lx, ly], [b.x, b.y - 1]);
  assert.ok(w.map.fords.length === 3);
  assert.equal(w.map.terrain[w.map.fords[1][1] * n + w.map.fords[1][0]], T.FORD);
});

test('both teams start with a Town Center, three workers and equal resources', () => {
  const w = new World();
  for (const team of [0, 1]) {
    assert.equal([...w.buildings(team)].filter(b => b.type === 'towncenter' && b.built).length, 1);
    assert.equal([...w.units()].filter(u => u.team === team && u.type === 'worker').length, 3);
    assert.equal(w.teams[team].popCap, 5);
  }
  const count = (team, kind) => [...w.resources(kind)].filter(r => (team === 0) === (r.y + r.h / 2 > r.x + r.w / 2)).length;
  for (const kind of ['tree', 'gold', 'berries']) assert.equal(count(0, kind), count(1, kind), kind);
});

test('a worker gathers lumber and brings it back', () => {
  const w = new World();
  const u = [...w.units()].find(x => x.team === 0);
  const tc = [...w.buildings(0)][0];
  const tree = w.nearestResource(...w.center(tc), 'tree', 30);
  const before = w.teams[0].res.lumber;
  w.orderGather([u.id], tree.id);
  run(w, 60);
  assert.ok(w.teams[0].res.lumber >= before + 20, `lumber went from ${before} to ${w.teams[0].res.lumber}`);
});

test('workers construct a house, which raises the population cap', () => {
  const w = new World();
  const ids = [...w.units()].filter(x => x.team === 0).map(x => x.id);
  const tc = [...w.buildings(0)][0];
  let spot = null;
  for (let y = tc.y - 4; y < tc.y + 8 && !spot; y++) for (let x = tc.x + 5; x < tc.x + 10 && !spot; x++) if (w.canPlace(0, 'house', x, y)) spot = [x, y];
  const h = w.place(0, 'house', spot[0], spot[1], ids);
  assert.ok(h);
  assert.equal(w.teams[0].res.lumber, 170);
  run(w, 30);
  assert.ok(h.built, 'the house is finished');
  assert.equal(w.teams[0].popCap, 15);
});

test('the Town Center trains a worker and waits when the population is full', () => {
  const w = new World();
  const tc = [...w.buildings(0)][0];
  assert.ok(w.train(tc.id, 'worker'));
  assert.ok(w.train(tc.id, 'worker'));
  assert.ok(w.train(tc.id, 'worker'));
  run(w, 40);
  assert.equal([...w.units()].filter(u => u.team === 0).length, 5, 'stops at the cap of 5');
  assert.equal(tc.queue.length, 1);
});

test('soldiers fight and units die', () => {
  const w = new World();
  const tc = [...w.buildings(0)][0];
  const a = w.spawnUnit(0, 'spearman', tc), b = w.spawnUnit(1, 'spearman', tc);
  w.orderAttack([a.id], b.id);
  run(w, 30);
  assert.ok(!w.get(a.id) || !w.get(b.id), 'one of them falls');
});

test('the rival builds up and attacks on Relaxed; an idle player eventually loses', () => {
  const w = new World({ pace: 'relaxed' });
  const ai = new RivalAI(w, 1);
  run(w, 600, [ai]);
  const rival = [...w.buildings(1)];
  assert.ok(rival.some(b => b.type === 'barracks' && b.built), 'the rival has a barracks');
  assert.ok(rival.some(b => b.type === 'house'), 'the rival built a house');
  assert.ok(w.teams[1].stats.gathered.lumber > 300, 'the rival gathers');
  assert.ok(ai.wave >= 1, 'the rival sent a wave');
  run(w, 1500, [ai]);
  assert.equal(w.winner, 1, 'with nobody playing, the rival wins');
  assert.ok(w.time < 1500, `the game ends in ${Math.round(w.time / 60)} minutes`);
});

test('the Challenge rival attacks sooner than the Relaxed rival', () => {
  const firstWave = pace => { const w = new World({ pace }); const ai = new RivalAI(w, 1); let t = 0; while (ai.wave === 0 && t < 900) { ai.update(0.05); w.step(0.05); t += 0.05; } return t; };
  assert.ok(firstWave('challenge') < firstWave('relaxed'));
});

test('soldiers on hold position fight in reach but never chase', () => {
  const w = new World();
  const tc = [...w.buildings(0)].find(b => b.type === 'towncenter');
  const guard = w.spawnUnit(0, 'spearman', tc);
  const [gx, gy] = [guard.x, guard.y];
  w.orderHold([guard.id]);
  // An archer shoots from beyond the spearman's reach: the spearman must stay put.
  const archer = w.spawnUnit(1, 'archer', tc);
  archer.x = archer.px = gx + 3.5; archer.y = archer.py = gy;
  w.orderAttack([archer.id], guard.id);
  run(w, 3);
  assert.ok(Math.hypot(guard.x - gx, guard.y - gy) < 0.6, 'the guard stayed in place');
  assert.equal(guard.order?.type, 'hold');
  // A spearman walks into reach and gets hit.
  const raider = w.spawnUnit(1, 'spearman', tc);
  raider.x = raider.px = gx + 0.8; raider.y = raider.py = gy;
  w.setOrder(archer, null); archer.x = archer.px = 1; archer.y = archer.py = 1;
  const hp = raider.hp;
  w.setOrder(raider, { type: 'hold' });
  run(w, 3);
  assert.ok(!w.get(raider.id) || raider.hp < hp, 'the guard struck the raider in reach');
});

test('a saved match continues exactly as if it had never stopped', () => {
  const a = new World({ pace: 'challenge' }), aiA = new RivalAI(a, 1);
  run(a, 200, [aiA]);
  const data = JSON.parse(JSON.stringify({ w: a.save(), ai: aiA.save() }));
  const b = World.load(data.w), aiB = new RivalAI(b, 1);
  aiB.load(data.ai);
  run(a, 120, [aiA]); run(b, 120, [aiB]);
  const sig = w => JSON.stringify([w.time.toFixed(2), w.teams.map(t => [t.res, t.pop, t.popCap]), [...w.ents.values()].map(e => [e.id, e.cat, Math.round((e.x ?? 0) * 100), Math.round((e.y ?? 0) * 100), Math.round(e.hp ?? e.amount)])]);
  assert.equal(sig(b), sig(a));
});

test('the Town bell shelters workers, the Town Center hits harder, and the all-clear sends them back', () => {
  const w = new World();
  const tc = [...w.buildings(0)].find(b => b.type === 'towncenter');
  const tree = w.nearestResource(...w.center(tc), 'tree', 40);
  const workers = [...w.units()].filter(u => u.team === 0);
  w.orderGather(workers.map(u => u.id), tree.id);
  run(w, 10);
  assert.equal(w.ringBell(0), 3);
  run(w, 15);
  assert.equal(w.sheltered(tc).length, 3, 'all three are inside');
  assert.equal([...w.units()].filter(u => u.team === 0).length, 0, 'none are out on the map');
  assert.equal(w.teams[0].pop, 3, 'they still count towards population');
  // An enemy near the Town Center takes the boosted damage.
  const raider = w.spawnUnit(1, 'spearman', tc);
  const hp = raider.hp;
  tc.cd = 0; w.step(0.05);
  assert.ok(hp - raider.hp > 4 * 1.9, 'the Town Center shot harder');
  w.remove(raider);
  w.allClear(0);
  assert.equal(w.sheltered(tc).length, 0);
  assert.ok(workers.every(u => u.order?.type === 'gather' && u.order.target === tree.id), 'everyone went back to the trees');
});

test('each nation trains its own units, with its own names and twists', () => {
  const w = new World({ teams: ['ravenclaw', 'slytherin'] });
  assert.equal(w.def(0, 'spearman').name, 'Shell Guard');
  assert.equal(w.def(1, 'special').name, 'Stonewarden');
  assert.equal(w.def(0, 'special').kind, 'healer');
  assert.equal(w.def(1, 'special').pop, 2, 'a guardian takes two population');
  assert.ok(w.def(1, 'spearman').hp > w.def(0, 'spearman').hp, 'Earth units are tougher');
  const tc = [...w.buildings(1)][0];
  const before = w.teams[1].pop;
  w.spawnUnit(1, 'special', tc);
  assert.equal(w.teams[1].pop, before + 2);
});

test('the healer mends a hurt ally, and the guardian shrugs off melee hits', () => {
  const w = new World({ teams: ['ravenclaw', 'slytherin'] });
  const tc = [...w.buildings(0)][0];
  const healer = w.spawnUnit(0, 'special', tc), guard = w.spawnUnit(0, 'spearman', tc);
  guard.x = healer.x + 1; guard.y = healer.y; guard.hp = 20; guard.hurtT = w.time;
  run(w, 3);
  assert.ok(guard.hp >= 26, `healed to ${guard.hp}`);
  // A spear against a guardian does half damage, then the counter bonus applies.
  const g2 = w.spawnUnit(1, 'special', tc), sp = w.spawnUnit(0, 'spearman', tc);
  const hp = g2.hp;
  w.damage(sp, g2, 10);
  assert.ok(Math.abs(hp - g2.hp - 10 * 0.5) < 0.01, `guardian took ${hp - g2.hp}`);
});

test('chargers hit twice as hard after a run-up, and scouts speed away after a hit', () => {
  const w = new World({ teams: ['gryffindor', 'hufflepuff'] });
  const tc = [...w.buildings(0)][0];
  const rider = w.spawnUnit(0, 'special', tc), target = w.spawnUnit(1, 'archer', tc);
  target.x = rider.x + 6; target.y = rider.y; target.px = target.x; target.py = target.y;
  w.setOrder(target, { type: 'hold' });
  const events = [];
  w.orderAttack([rider.id], target.id);
  for (let t = 0; t < 6 && !events.some(e => e.type === 'charge'); t += 0.05) { w.step(0.05); events.push(...w.drainEvents()); }
  assert.ok(events.some(e => e.type === 'charge'), 'the first hit was a charge');
  const scout = w.spawnUnit(1, 'special', tc), dummy = w.spawnUnit(0, 'worker', tc);
  dummy.x = scout.x + 0.5; dummy.y = scout.y;
  w.setOrder(dummy, { type: 'hold' });
  w.orderAttack([scout.id], dummy.id);
  for (let t = 0; t < 3 && scout.boost <= 0; t += 0.05) w.step(0.05);
  assert.ok(scout.boost > 0, 'Tailwind is active after the hit');
});
