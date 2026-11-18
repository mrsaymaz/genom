// Turns the roster (src/data/units.js) into the stats the simulation uses, per nation.
// Unit type keys in the game: worker, spearman (infantry line), archer (ranged line) and special
// (the nation's element special: scout, healer, charger or guardian).
import { ROSTER, SPECIALS, LINES, unitStats } from '../data/units.js';

export const TYPE_LINE = { worker: 'worker', spearman: 'infantry', archer: 'ranged', special: 'special' };
export const UNIT_TYPES = Object.keys(TYPE_LINE);

// Short labels for buttons: the full name when it fits, otherwise its last word.
const short = name => (name.length <= 11 ? name : name.split(' ').pop());

export function unitDefs(nation, age = 'dark') {
  const ageIndex = ['dark', 'mythic', 'arcane', 'celestial'].indexOf(age);
  const out = {};
  for (const [type, line] of Object.entries(TYPE_LINE)) {
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
  return out;
}

// The role used for counters: worker, infantry, ranged, or the special's kind.
export const roleOf = d => d.kind;

// Attacker role -> target role -> damage multiplier.
export const COUNTER = {
  infantry: { scout: 1.5, charger: 1.5 },
  ranged: { infantry: 1.25, guardian: 1.6 },
  scout: { ranged: 1.5, worker: 1.5, healer: 1.5 },
  charger: { ranged: 1.5, worker: 1.5, healer: 1.5 },
  guardian: { infantry: 1.4, scout: 1.3, charger: 1.3 },
};
// Damage against buildings, by attacker role.
export const BLD_DAMAGE = { infantry: 1.5, ranged: 0.35, worker: 0.5, scout: 0.5, healer: 0.2, charger: 1.0, guardian: 1.2 };
// The element cycle: each element beats the next.
export const ELEMENT_BEATS = { fire: 'earth', earth: 'air', air: 'water', water: 'fire' };
