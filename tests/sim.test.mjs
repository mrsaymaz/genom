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
  const tcB = [...w.buildings(1)].find(e => e.type === 'towncenter'), tcA = [...w.buildings(0)].find(e => e.type === 'towncenter');
  const goals = w.goalsAround(tcB), start = w.goalsAround(tcA).values().next().value;
  const p = findPath(n, (x, y) => w.blocked(x, y), start % n, Math.floor(start / n), goals, 20000);
  assert.ok(p && p.length > 10, 'a path exists between the bases');
  // The player's base is on the south-west side of the river, the rival's on the north-east.
  assert.ok(a.y - a.x > 20 && b.x - b.y > 20, `player base ${a.x},${a.y} rival ${b.x},${b.y}`);
  assert.ok(w.map.fords.length === 5, 'five fords on the large map');
  assert.equal(n, 72);
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

test('a team ages up: units take their Mythic forms and buildings grow stronger', () => {
  const w = new World({ teams: ['gryffindor', 'slytherin'] });
  const tc = [...w.buildings(0)].find(b => b.type === 'towncenter');
  assert.equal(w.canAgeUp(0).why, 'needs', 'a Barracks is needed first');
  const spot = (() => { for (let y = tc.y - 12; y < tc.y + 8; y++) for (let x = tc.x - 4; x < tc.x + 14; x++) if (w.canPlace(0, 'barracks', x, y)) return [x, y]; })();
  w.addBuilding(0, 'barracks', spot[0], spot[1], true);
  w.teams[0].res = { food: 1000, lumber: 1000, gold: 1000 };
  const worker = [...w.units()].find(u => u.team === 0);
  worker.hp = worker.maxHp / 2;
  const tcHp = tc.maxHp;
  assert.ok(w.startAgeUp(tc.id));
  assert.equal(w.teams[0].res.food, 600, 'the age-up was paid for');
  assert.equal(w.startAgeUp(tc.id), false, 'only one age-up at a time');
  // Training waits while the age is researched.
  w.train(tc.id, 'worker');
  run(w, 20);
  assert.equal(tc.queue.length, 1);
  // A save in the middle carries on.
  const b = World.load(JSON.parse(JSON.stringify(w.save())));
  run(w, 22); run(b, 22);
  for (const x of [w, b]) {
    assert.equal(x.teams[0].age, 'mythic');
    assert.equal(x.def(0, 'spearman').name, 'Flame Guard');
    assert.equal(x.teams[1].age, 'dark', 'the rival is unchanged');
  }
  const ev = w.drainEvents();
  assert.ok(ev.some(e => e.type === 'aged' && e.team === 0 && e.age === 'mythic'));
  assert.equal(tc.maxHp, Math.round(tcHp * 1.2));
  assert.ok(Math.abs(worker.hp / worker.maxHp - 0.5) < 0.01, 'the worker keeps half its health');
  assert.ok(worker.maxHp > 25);
  assert.deepEqual([w.canAgeUp(0).why, w.canAgeUp(0).needs], ['needs', 'sanctum'], 'the Arcane Age needs a Sanctum');
});

test('the rival ages up on its own', () => {
  const w = new World({ pace: 'challenge' }), ai = new RivalAI(w, 1);
  const mine = [...w.buildings(0)].find(b => b.type === 'towncenter'); mine.hp = mine.maxHp = 1e9; // an idle player must not lose first
  run(w, 760, [ai]);
  assert.equal(w.teams[1].age, 'mythic', `rival age at ${Math.round(w.time)} s`);
});

test('the Beast Pen and the Sanctum can only be built in the Mythic Age', () => {
  const w = new World();
  const tc = [...w.buildings(0)].find(b => b.type === 'towncenter');
  w.teams[0].res = { food: 1000, lumber: 1000, gold: 1000 };
  const spot = type => { for (let y = tc.y - 12; y < tc.y + 8; y++) for (let x = tc.x - 4; x < tc.x + 14; x++) { w.teams[0].age = 'mythic'; const ok = w.canPlace(0, type, x, y); w.teams[0].age = 'dark'; if (ok) return [x, y]; } };
  const [px, py] = spot('pen');
  assert.equal(w.canPlace(0, 'pen', px, py), false, 'not in the Dark Age');
  assert.equal(w.place(0, 'sanctum', px, py), null);
  w.enterAge(0, 'mythic');
  const pen = w.place(0, 'pen', px, py);
  assert.ok(pen, 'built in the Mythic Age');
  assert.equal(w.teams[0].res.gold, 950);
});

// ---------- heroes, creatures and the later ages ----------
// A world where team 0 is already in an age with a Sanctum and a Beast Pen standing.
function lateWorld(age = 'mythic', teams = ['hufflepuff', 'gryffindor']) {
  const w = new World({ teams });
  const tc = [...w.buildings(0)].find(b => b.type === 'towncenter');
  for (const a of ['mythic', 'arcane', 'celestial'].slice(0, ['mythic', 'arcane', 'celestial'].indexOf(age) + 1)) w.enterAge(0, a);
  w.teams[0].res = { food: 5000, lumber: 5000, gold: 5000 };
  const spot = type => { for (let y = tc.y - 14; y < tc.y + 10; y++) for (let x = tc.x - 6; x < tc.x + 16; x++) if (w.canPlace(0, type, x, y)) return [x, y]; };
  const out = { w, tc };
  for (const type of ['sanctum', 'pen', 'barracks', 'house', 'house']) { const [x, y] = spot(type); out[type] = w.addBuilding(0, type, x, y, true); }
  w.recount();
  w.drainEvents();
  return out;
}
// A unit placed right beside another entity (or spawned at a building).
const unitNear = (w, team, type, at) => { const u = w.spawnUnit(team, type, at); if (at.cat === 'unit') { u.x = u.px = at.x + 0.8; u.y = u.py = at.y; } return u; };

test('the Sanctum trains one hero at a time, and the Beast Pen one creature', () => {
  const { w, sanctum, pen } = lateWorld('mythic');
  assert.equal(w.def(0, 'hero').name, 'Wind Warden');
  assert.equal(w.def(0, 'creature').name, 'Galehide Bear');
  assert.ok(w.train(sanctum.id, 'hero'));
  assert.equal(w.train(sanctum.id, 'hero'), false, 'only one hero in training');
  assert.ok(w.train(pen.id, 'creature'));
  assert.equal(w.train(pen.id, 'creature'), false, 'only one creature');
  assert.equal(w.train(pen.id, 'hero'), false, 'the Pen does not train heroes');
  run(w, 45);
  const hero = [...w.units()].find(u => u.team === 0 && u.type === 'hero'), bear = [...w.units()].find(u => u.team === 0 && u.type === 'creature');
  assert.ok(hero && bear, 'both arrived');
  assert.equal(w.train(sanctum.id, 'hero'), false, 'still one hero while it lives');
  w.remove(hero);
  assert.ok(w.train(sanctum.id, 'hero'), 'a fallen hero can be trained again');
});

test('hero abilities: Updraft lifts, Battle Roar rouses, Root Snare holds, High Tide heals and pushes', () => {
  // Updraft
  let { w, tc } = lateWorld('mythic', ['hufflepuff', 'gryffindor']);
  let hero = unitNear(w, 0, 'hero', tc), friend = unitNear(w, 0, 'spearman', hero);
  assert.ok(w.cast(hero.id));
  assert.ok(friend.boost > 5 && friend.dodge > 5, 'friends move faster and dodge arrows');
  assert.equal(w.cast(hero.id), false, 'then it must recharge');
  assert.equal(w.canCast(hero).why, 'cooldown');
  run(w, 36);
  assert.ok(w.canCast(hero).ok, 'ready again after 35 s');
  // Battle Roar: roused units hit 35% harder.
  ({ w, tc } = lateWorld('mythic', ['gryffindor', 'hufflepuff']));
  hero = unitNear(w, 0, 'hero', tc); friend = unitNear(w, 0, 'spearman', hero);
  const foe = unitNear(w, 1, 'spearman', tc), foe2 = unitNear(w, 1, 'spearman', tc);
  w.cast(hero.id);
  const hp = foe.hp; w.damage(friend, foe, 10); const roused = hp - foe.hp;
  friend.roar = 0; const hp2 = foe2.hp; w.damage(friend, foe2, 10);
  assert.ok(Math.abs(roused / (hp2 - foe2.hp) - 1.35) < 0.01);
  // Root Snare: enemies nearby cannot move.
  ({ w, tc } = lateWorld('mythic', ['slytherin', 'hufflepuff']));
  hero = unitNear(w, 0, 'hero', tc);
  const caught = unitNear(w, 1, 'spearman', hero);
  caught.x = hero.x + 1.5; caught.y = hero.y; caught.px = caught.x;
  w.cast(hero.id);
  assert.ok(caught.rootT > 4, 'held for 5 s');
  w.orderMove([caught.id], caught.x + 6, caught.y);
  const x0 = caught.x; for (let i = 0; i < 40; i++) w.step(0.05);
  assert.ok(Math.abs(caught.x - x0) < 0.3, 'it cannot walk away while rooted');
  // High Tide: hurt friends heal and enemies are pushed away.
  ({ w, tc } = lateWorld('mythic', ['ravenclaw', 'hufflepuff']));
  hero = unitNear(w, 0, 'hero', tc); friend = unitNear(w, 0, 'spearman', hero);
  friend.hp = friend.maxHp * 0.3;
  const near = unitNear(w, 1, 'spearman', hero); near.x = hero.x + 1; near.y = hero.y;
  const d0 = Math.hypot(near.x - hero.x, near.y - hero.y);
  w.cast(hero.id);
  assert.ok(friend.hp > friend.maxHp * 0.6, 'healed');
  assert.ok(Math.hypot(near.x - hero.x, near.y - hero.y) > d0 + 0.5, 'pushed back');
});

test('creatures: the serpent roots what it bites, the raven heals from above and flies over water', () => {
  let { w, tc } = lateWorld('mythic', ['slytherin', 'hufflepuff']);
  const snake = unitNear(w, 0, 'creature', tc), prey = unitNear(w, 1, 'spearman', tc);
  w.orderAttack([snake.id], prey.id);
  for (let i = 0; i < 200 && !(prey.rootT > 0); i++) w.step(0.05);
  assert.ok(prey.rootT > 0, 'Entangle roots the target');
  ({ w, tc } = lateWorld('mythic', ['ravenclaw', 'hufflepuff']));
  const raven = unitNear(w, 0, 'creature', tc), hurt = unitNear(w, 0, 'spearman', raven);
  hurt.x = raven.x; hurt.y = raven.y; hurt.hp = 20;
  run(w, 3);
  assert.ok(hurt.hp > 24, 'Healing Rain heals friends beneath it');
  // It flies straight over the river, where walkers must use a ford.
  const water = (() => { for (let y = 0; y < w.size; y++) for (let x = 0; x < w.size; x++) if (w.terrainAt(x, y) === T.WATER) return [x, y]; })();
  w.orderMove([raven.id], water[0], water[1]);
  run(w, 40);
  assert.ok(Math.hypot(raven.x - water[0] - 0.5, raven.y - water[1] - 0.5) < 1, 'the raven reaches open water');
});

test("creatures beat the next element's creature by the element cycle", () => {
  const { w, tc } = lateWorld('mythic', ['gryffindor', 'slytherin']);
  w.enterAge(1, 'mythic');
  const lion = unitNear(w, 0, 'creature', tc), snake = unitNear(w, 1, 'creature', tc);
  const hp = snake.hp; w.damage(lion, snake, 10);
  assert.ok(Math.abs(hp - snake.hp - 16.5) < 0.01, 'fire beats earth: x1.5 and the element edge');
});

test('the ages go on to Arcane (needs a Sanctum) and Celestial (needs a Workshop), and saves keep them', () => {
  const w = new World({ teams: ['ravenclaw', 'hufflepuff'] });
  const tc = [...w.buildings(0)].find(b => b.type === 'towncenter');
  w.teams[0].res = { food: 9000, lumber: 9000, gold: 9000 };
  const place = type => { for (let y = tc.y - 14; y < tc.y + 10; y++) for (let x = tc.x - 6; x < tc.x + 16; x++) if (w.canPlace(0, type, x, y)) return w.addBuilding(0, type, x, y, true); };
  place('barracks');
  assert.ok(w.startAgeUp(tc.id)); run(w, 41);
  assert.equal(w.teams[0].age, 'mythic');
  assert.equal(w.canAgeUp(0).needs, 'sanctum');
  const sanctum = place('sanctum');
  w.train(sanctum.id, 'hero'); run(w, 41);
  const hero = [...w.units()].find(u => u.type === 'hero');
  assert.equal(w.def(0, 'hero').name, 'Tide Navigator');
  assert.ok(w.startAgeUp(tc.id)); run(w, 46);
  assert.equal(w.teams[0].age, 'arcane');
  assert.equal(w.def(0, 'hero').name, 'Glass Navigator', 'the hero takes its Arcane form');
  assert.ok(hero.maxHp > 280);
  assert.equal(w.def(0, 'hero').cast.cooldown, 30, 'abilities recharge faster each age');
  assert.equal(w.canAgeUp(0).needs, 'workshop');
  place('workshop');
  assert.ok(w.startAgeUp(tc.id));
  w.cast(hero.id);
  const b = World.load(JSON.parse(JSON.stringify(w.save())));
  run(w, 51); run(b, 51);
  for (const x of [w, b]) {
    assert.equal(x.teams[0].age, 'celestial');
    assert.equal(x.def(0, 'creature').name, 'Moon Raven');
    assert.equal(x.def(0, 'spearman').name, 'Crescent Guard');
    assert.equal(x.canAgeUp(0).why, 'max', 'Celestial is the last age');
  }
  assert.ok(Math.abs(b.get(hero.id).castCd - w.get(hero.id).castCd) < 1e-6, 'the cooldown survives a save');
});

test('the rival builds a Sanctum, a Beast Pen and a Workshop, trains its hero, creature and siege, and reaches the Celestial Age', () => {
  const w = new World({ pace: 'challenge' }), ai = new RivalAI(w, 1);
  const mine = [...w.buildings(0)].find(b => b.type === 'towncenter'); mine.hp = mine.maxHp = 1e9; // an idle player must not lose first
  let hero = false, creature = false, siege = false;
  for (let t = 0; t < 1700 && w.teams[1].age !== 'celestial'; t += 0.05) { ai.update(0.05); w.step(0.05); if (!hero || !creature || !siege) for (const u of w.units()) if (u.team === 1) { hero ||= u.type === 'hero'; creature ||= u.type === 'creature'; siege ||= u.type === 'siege'; } }
  assert.ok(hero, 'the rival trained its hero');
  assert.ok(creature, 'the rival trained its creature');
  assert.ok(siege, 'the rival built a siege engine');
  assert.equal(w.teams[1].age, 'celestial', `rival age at ${Math.round(w.time)} s`);
});

// ---------- siege engines ----------
test('the Workshop is an Arcane Age building that builds siege engines', () => {
  const { w, tc } = lateWorld('mythic', ['gryffindor', 'hufflepuff']);
  const spot = () => { for (let y = tc.y - 14; y < tc.y + 10; y++) for (let x = tc.x - 6; x < tc.x + 16; x++) { w.teams[0].age = 'arcane'; const ok = w.canPlace(0, 'workshop', x, y); w.teams[0].age = 'mythic'; if (ok) return [x, y]; } };
  const [x, y] = spot();
  assert.equal(w.canPlace(0, 'workshop', x, y), false, 'not in the Mythic Age');
  assert.equal(w.def(0, 'siege'), undefined, 'no siege before the Arcane Age');
  w.enterAge(0, 'arcane');
  const shop = w.addBuilding(0, 'workshop', x, y, true); w.recount();
  assert.equal(w.def(0, 'siege').name, 'Magma Mortar');
  assert.ok(w.train(shop.id, 'siege')); assert.ok(w.train(shop.id, 'siege'), 'more than one engine is fine');
  w.enterAge(0, 'celestial');
  assert.equal(w.def(0, 'siege').name, 'Sun Cannon');
});

// Puts an engine of `nation` in front of an enemy house, with an enemy soldier beside the house.
function siegeRange(nation) {
  const { w, tc } = lateWorld('arcane', [nation, 'hufflepuff']);
  const eng = w.spawnUnit(0, 'siege', tc);
  let house = null;
  for (let y = 4; y < w.size - 4 && !house; y++) for (let x = 4; x < w.size - 10 && !house; x++) {
    if (!w.canPlace(1, 'house', x, y)) continue;
    let clear = true; for (let dx = -7; dx < 0 && clear; dx++) if (w.blocked(x + dx, y)) clear = false;
    if (clear && Math.hypot(x - tc.x, y - tc.y) > 8) house = w.addBuilding(1, 'house', x, y, true);
  }
  eng.x = eng.px = house.x - 5; eng.y = eng.py = house.y + 0.5;
  const foe = w.spawnUnit(1, 'spearman', house); foe.x = foe.px = house.x - 0.4; foe.y = foe.py = house.y + 1;
  w.orderHold([foe.id]); // it stays beside the house
  w.drainEvents();
  return { w, eng, house, foe };
}
const fire = (w, eng, target) => { w.orderAttack([eng.id], target.id); for (let i = 0; i < 40; i++) w.step(0.05); };

test('siege shots fly, burst where they land and wreck buildings, but hurt units less', () => {
  const { w, eng, house, foe } = siegeRange('gryffindor');
  const hp = house.hp, fhp = foe.hp;
  w.orderAttack([eng.id], house.id); w.step(0.05);
  assert.equal(w.shots.length, 1, 'a shot is in flight');
  assert.equal(house.hp, hp, 'no damage until it lands');
  for (let i = 0; i < 30; i++) w.step(0.05);
  assert.ok(hp - house.hp > 46 * 3, `the house takes heavy damage (${Math.round(hp - house.hp)})`);
  assert.ok(foe.hp < fhp && fhp - foe.hp < 30, 'the soldier beside it is caught in the burst, lightly');
  assert.ok(w.drainEvents().some(e => e.type === 'impact' && e.effect === 'lava'));
});

test('siege engines cannot fire at anything right beside them, and soldiers tear into them', () => {
  const { w, eng, foe } = siegeRange('slytherin');
  foe.x = eng.x + 1; foe.y = eng.y;
  w.orderAttack([eng.id], foe.id); for (let i = 0; i < 20; i++) w.step(0.05);
  assert.equal(w.shots.length, 0, 'too close to fire');
  const hp = eng.hp; w.damage(foe, eng, 10);
  assert.ok(Math.abs(hp - eng.hp - 16) < 0.01, 'spear fighters deal x1.6 to engines');
});

test('each nation\'s shot does its own thing: gust, soak, lava and shatter', () => {
  let r = siegeRange('hufflepuff'); let d0 = Math.hypot(r.foe.x - r.house.x - 1, r.foe.y - r.house.y - 1);
  fire(r.w, r.eng, r.house);
  assert.ok(Math.hypot(r.foe.x - r.house.x - 1, r.foe.y - r.house.y - 1) > d0 + 0.5 || !r.w.get(r.foe.id), 'Gust Shot throws units back');
  r = siegeRange('ravenclaw'); fire(r.w, r.eng, r.house);
  assert.ok(r.foe.slowT > 0, 'Soak slows units');
  r = siegeRange('gryffindor'); fire(r.w, r.eng, r.house);
  assert.ok(r.w.burns.length === 1, 'Lava Splash leaves the ground burning');
  const hp = r.house.hp; for (let i = 0; i < 20; i++) r.w.step(0.05);
  assert.ok(r.house.hp < hp, 'and the fire keeps burning');
  // Shatter: the same shot hits a building 30% harder.
  r = siegeRange('slytherin'); const h0 = r.house.hp; fire(r.w, r.eng, r.house);
  assert.ok(h0 - r.house.hp > 40 * 3.2 * 1.25, 'Shatter cracks buildings harder');
});

test('shots in flight and burning ground survive a save', () => {
  const r = siegeRange('gryffindor');
  r.w.orderAttack([r.eng.id], r.house.id); r.w.step(0.05);
  const b = World.load(JSON.parse(JSON.stringify(r.w.save())));
  assert.equal(b.shots.length, 1);
  for (let i = 0; i < 30; i++) { r.w.step(0.05); b.step(0.05); }
  assert.equal(Math.round(b.get(r.house.id).hp), Math.round(r.house.hp));
  assert.equal(b.burns.length, r.w.burns.length);
});

// ---------- the large map ----------
test('the large map gives each side five gold mines (home, back, two outlying sites, contested), all within reach', () => {
  const w = new World(), n = w.size;
  const side = r => (r.y + r.h / 2 > r.x + r.w / 2 ? 0 : 1);
  const golds = [...w.resources('gold')];
  assert.equal(golds.filter(g => side(g) === 0).length, 5, 'five gold mines a side');
  assert.equal(golds.filter(g => side(g) === 1).length, 5);
  // Every gold mine and berry bush can be reached by a worker from its own Town Center.
  const tc = [...w.buildings(0)].find(b => b.type === 'towncenter'), start = w.goalsAround(tc).values().next().value;
  for (const r of [...w.resources('gold'), ...w.resources('berries')]) {
    const p = findPath(n, (x, y) => w.blocked(x, y), start % n, Math.floor(start / n), w.goalsAround(r), 30000);
    assert.ok(p, `${r.kind} at ${r.x},${r.y} is reachable`);
  }
});

test('a match saved on the old 48-tile map still continues', () => {
  const old = new World({ size: 48 }), data = JSON.parse(JSON.stringify(old.save()));
  delete data.size; // saves from before the large map
  const w = World.load(data);
  assert.equal(w.size, 48);
  run(w, 5);
  assert.equal([...w.buildings(0)].length, 1);
});
