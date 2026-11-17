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
