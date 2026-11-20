// The Celestial Wonders and their superweapons.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { World } from '../src/sim/world.js';
import { RivalAI } from '../src/sim/ai.js';
import { T } from '../src/sim/map.js';
import { CHARGE } from '../src/sim/superweapon.js';

const run = (w, s, ais = []) => { for (let t = 0; t < s; t += 0.05) { for (const a of ais) a.update(0.05); w.step(0.05); } };
const celestial = teams => { const w = new World({ teams }); for (const t of [0, 1]) for (const a of ['mythic', 'arcane', 'celestial']) w.enterAge(t, a); w.drainEvents(); return w; };
const spot = (w, team, type) => { const tc = [...w.buildings(team)].find(b => b.type === 'towncenter'); for (let r = 5; r < 22; r++) for (let y = tc.y - r; y <= tc.y + r; y++) for (let x = tc.x - r; x <= tc.x + r; x++) if (w.canPlace(team, type, x, y)) return [x, y]; return null; };
const wonder = (w, team) => w.addBuilding(team, 'wonder', ...spot(w, team, 'wonder'), true);
const squad = (w, team, x, y, n = 8) => { const tc = [...w.buildings(team)][0], out = []; for (let i = 0; i < n; i++) { const u = w.spawnUnit(team, 'spearman', tc); u.x = u.px = x + (i % 4) * 0.5; u.y = u.py = y + Math.floor(i / 4) * 0.5; w.orderHold([u.id]); out.push(u); } w.recount(); return out; };
const hpOf = us => us.reduce((s, u) => s + Math.max(0, u.hp), 0);

test('the Wonder is Celestial only and one per team', () => {
  const w = new World();
  const s = spot(w, 0, 'house');
  assert.equal(w.canPlace(0, 'wonder', s[0], s[1]), false, 'not before the Celestial Age');
  const c = celestial(['hufflepuff', 'ravenclaw']);
  assert.ok(spot(c, 0, 'wonder'));
  wonder(c, 0);
  assert.equal(spot(c, 0, 'wonder'), null, 'only one Wonder');
});

test('a Wonder charges for four minutes, fires once, then charges again', () => {
  const w = celestial(['gryffindor', 'slytherin']), W = wonder(w, 0);
  run(w, CHARGE - 5);
  assert.equal(w.canFire(W.id).ok, false);
  const ev = [];
  for (let i = 0; i < 20 * 10; i++) { w.step(0.05); ev.push(...w.drainEvents()); }
  assert.ok(ev.some(e => e.type === 'superReady' && e.team === 0));
  assert.ok(w.canFire(W.id).ok);
  const [cx, cy] = w.center([...w.buildings(1)].find(b => b.type === 'towncenter'));
  assert.ok(w.fireSuper(W.id, cx - 6, cy + 6));
  assert.equal(w.canFire(W.id).ok, false, 'charging again');
});

for (const [me, foe] of [['hufflepuff', 'gryffindor'], ['ravenclaw', 'gryffindor'], ['gryffindor', 'slytherin'], ['slytherin', 'hufflepuff']]) {
  test(`the ${me} superweapon hurts the enemy group, spares friends, and spares most of a Town Center`, () => {
    const w = celestial([me, foe]), W = wonder(w, 0); W.charge = 1;
    const rtc = [...w.buildings(1)].find(b => b.type === 'towncenter'), [rx, ry] = w.center(rtc);
    // Fire on the rival Town Center with a squad of each side beside it.
    const them = squad(w, 1, rx - 3, ry + 3), us = squad(w, 0, rx + 9, ry + 9, 4);
    const theirs = hpOf(them), ours = hpOf(us), tc = rtc.hp;
    assert.ok(w.fireSuper(W.id, rx - 2, ry + 3));
    run(w, 14);
    assert.ok(hpOf(them) < theirs * 0.75, `${me}: enemy squad ${hpOf(them)} of ${theirs}`);
    assert.equal(hpOf(us), ours, 'friends untouched');
    assert.ok(rtc.hp >= tc - rtc.maxHp * 0.15 - 60, `Town Center kept most of its health (${rtc.hp} of ${tc})`);
  });
}

test('the Great Quake raises a ridge that blocks the way for 30 seconds, also after loading', () => {
  const w = celestial(['slytherin', 'hufflepuff']), W = wonder(w, 0); W.charge = 1;
  const [cx, cy] = w.center(W);
  assert.ok(w.fireSuper(W.id, cx + 10, cy - 8));
  const tiles = w.ridges[0].tiles;
  assert.ok(tiles.length >= 6, `ridge tiles ${tiles.length}`);
  for (const i of tiles) assert.equal(w.map.terrain[i], T.ROCK);
  const back = World.load(JSON.parse(JSON.stringify(w.save())));
  for (const i of tiles) assert.ok(back.blocked(i % back.size, Math.floor(i / back.size)), 'still blocked after loading');
  run(w, 31);
  for (const i of tiles) assert.equal(w.map.terrain[i], T.GRASS);
  assert.equal(w.ridges.length, 0);
});

test('the rival raises its Wonder in the Celestial Age and fires it at an army', () => {
  const w = celestial(['hufflepuff', 'ravenclaw']), ai = new RivalAI(w, 1);
  w.teams[1].res = { food: 3000, lumber: 3000, gold: 3000 };
  for (const t of ['barracks', 'sanctum', 'pen', 'workshop']) { const s = spot(w, 1, t); w.addBuilding(1, t, s[0], s[1], true); }
  w.recount();
  run(w, 60, [ai]);
  const W = [...w.buildings(1)].find(b => b.type === 'wonder');
  assert.ok(W, 'the rival placed its Wonder');
  W.progress = 1; W.built = true; W.hp = W.maxHp; W.charge = 1;
  const tc = [...w.buildings(0)][0], [x, y] = w.center(tc);
  squad(w, 0, x + 6, y - 6);
  const ev = [];
  for (let i = 0; i < 40; i++) { ai.update(0.05); w.step(0.05); ev.push(...w.drainEvents()); }
  assert.ok(ev.some(e => e.type === 'superFire' && e.team === 1), 'it fired');
});
