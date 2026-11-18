// Turns the roster (src/data/units.js) into the stats the simulation uses, per nation.
// Unit type keys in the game: worker, spearman (infantry line), archer (ranged line), special
// (the nation's element special: scout, healer, charger or guardian), and from the Mythic Age the
// hero (trained at the Sanctum) and the signature creature (trained at the Beast Pen).
import { ROSTER, SPECIALS, LINES, HEROES, HERO_ABILITY, CREATURES, AGE_SCALE, unitStats } from '../data/units.js';

export const TYPE_LINE = { worker: 'worker', spearman: 'infantry', archer: 'ranged', special: 'special', hero: 'hero', creature: 'creature' };
export const UNIT_TYPES = Object.keys(TYPE_LINE);
// Heroes and creatures: only one of each at a time (in the field or in training).
export const UNIQUE = { hero: true, creature: true };
const AGES = ['dark', 'mythic', 'arcane', 'celestial'];

// Short labels for buttons: the full name when it fits, otherwise its last word.
const short = name => (name.length <= 11 ? name : name.split(' ').pop());
// Hero and creature stats are given for the Mythic Age; later ages grow them like every line.
const grow = (age, key) => (AGE_SCALE[age] || AGE_SCALE.mythic)[key] / AGE_SCALE.mythic[key];
const growCost = (cost, age) => Object.fromEntries(Object.entries(cost).map(([k, v]) => [k, Math.round((v * grow(age, 'cost')) / 5) * 5]));

export function unitDefs(nation, age = 'dark') {
  const ageIndex = AGES.indexOf(age);
  const out = {};
  for (const [type, line] of Object.entries(TYPE_LINE)) {
    if (type === 'hero' || type === 'creature') continue;
    const st = unitStats(nation, line, age), def = line === 'special' ? SPECIALS[nation] : LINES[line];
    const name = ROSTER[nation][line][ageIndex][0];
    out[type] = {
      type, line, name, short: short(name), kind: line === 'special' ? def.kind : line,
      attackType: def.attackType, ability: def.ability || null,
      hp: st.hp, damage: st.attack, range: st.range, cooldown: st.cooldown, speed: st.speed, sight: st.sight,
      cost: st.cost, time: st.time, pop: st.pop || 1, heal: st.heal || 0, carry: 10,
      regen: nation === 'water' ? 0.5 : 0,
    };
  }
  if (ageIndex >= 1) {
    const h = HEROES[nation], name = ROSTER[nation].hero[ageIndex - 1][0];
    out.hero = {
      type: 'hero', line: 'hero', name, short: short(name), kind: 'hero', unique: true,
      attackType: h.range > 1.5 ? 'ranged' : 'melee', ability: h.ability, role: h.role,
      cast: { ...h.ability, radius: HERO_ABILITY.radius[ageIndex - 1], cooldown: HERO_ABILITY.cooldown[ageIndex - 1] },
      hp: Math.round(h.base.hp * grow(age, 'hp')), damage: Math.round(h.base.attack * grow(age, 'attack') * 10) / 10,
      range: h.range, cooldown: h.cooldown, speed: h.base.speed, sight: h.sight,
      cost: growCost(h.cost, age), time: h.time, pop: 1, heal: 0, carry: 0, regen: nation === 'water' ? 0.5 : 0,
    };
    const c = CREATURES[nation], form = c.forms[ageIndex - 1][0];
    out.creature = {
      type: 'creature', line: 'creature', name: form, short: short(form), kind: 'creature', unique: true, icon: `creature-${nation}`,
      attackType: c.attackType, ability: c.trait, trait: c.trait.id, role: c.role, flies: !!c.flies,
      hp: Math.round(c.base.hp * grow(age, 'hp')), damage: Math.round(c.base.attack * grow(age, 'attack') * 10) / 10,
      range: c.base.range, cooldown: c.base.cooldown, speed: c.base.speed, sight: c.base.sight,
      cost: growCost(c.cost, age), time: c.time, pop: c.pop, heal: 0, carry: 0, regen: nation === 'water' ? 0.5 : 0,
      scale: grow(age, 'attack'),
    };
  }
  return out;
}

// The role used for counters: worker, infantry, ranged, the special's kind, hero or creature.
export const roleOf = d => d.kind;

// Attacker role -> target role -> damage multiplier.
export const COUNTER = {
  infantry: { scout: 1.5, charger: 1.5, creature: 1.3 },
  ranged: { infantry: 1.25, guardian: 1.6 },
  scout: { ranged: 1.5, worker: 1.5, healer: 1.5 },
  charger: { ranged: 1.5, worker: 1.5, healer: 1.5 },
  guardian: { infantry: 1.4, scout: 1.3, charger: 1.3 },
};
// Damage against buildings, by attacker role.
export const BLD_DAMAGE = { infantry: 1.5, ranged: 0.35, worker: 0.5, scout: 0.5, healer: 0.2, charger: 1.0, guardian: 1.2, hero: 1.0, creature: 1.2 };
// The element cycle: each element beats the next.
export const ELEMENT_BEATS = { fire: 'earth', earth: 'air', air: 'water', water: 'fire' };
