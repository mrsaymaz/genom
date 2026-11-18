// Upgrades and technologies: researched at buildings, one at a time per building (it does not
// train while it researches). Most have levels; each level unlocks with an age, so the first
// level helps from the Dark Age and later ones keep pace with the rival. Every effect is a plain
// number the simulation reads (see World.mods), and every text is short and simple.
// cost and time are for level I; each level costs more (LEVEL_COST) and takes longer.

export const LEVEL_COST = [1, 1.8, 2.8];
export const LEVEL_TIME = [1, 1.35, 1.7];
export const ROMAN = ['I', 'II', 'III'];

// ages: the age each level unlocks in. per: what one level adds.
export const TECHS = {
  // ---------- Town Center ----------
  baskets: { name: 'Bigger Baskets', at: 'towncenter', ages: ['dark'], cost: { food: 75, lumber: 50 }, time: 25, short: 'Carry +5', text: 'Workers carry 5 more, so they walk back less often.' },
  quickfeet: { name: 'Quick Feet', at: 'towncenter', ages: ['mythic'], cost: { food: 200, gold: 75 }, time: 35, short: 'Workers +15%', text: 'Workers walk 15% faster.' },
  townguard: { name: 'Town Guard', at: 'towncenter', ages: ['dark', 'mythic'], cost: { food: 50, lumber: 100 }, time: 30, short: 'Arrows +30%', text: 'Town Centers and towers shoot 30% harder.' },
  // ---------- Storehouse: gathering ----------
  axes: { name: 'Sharp Axes', at: 'storehouse', ages: ['dark', 'mythic', 'arcane'], cost: { food: 75, lumber: 50 }, time: 25, short: 'Lumber +20%', text: 'Workers cut lumber 20% faster.' },
  picks: { name: 'Deep Picks', at: 'storehouse', ages: ['dark', 'mythic', 'arcane'], cost: { food: 75, lumber: 75 }, time: 25, short: 'Gold +20%', text: 'Workers mine gold 20% faster.' },
  farming: { name: 'Farm Tools', at: 'storehouse', ages: ['dark', 'mythic', 'arcane'], cost: { food: 50, lumber: 100 }, time: 25, short: 'Food +20%', text: 'Workers gather berries and farm food 20% faster.' },
  // ---------- Barracks: the army ----------
  weapons: { name: 'Forged Weapons', at: 'barracks', ages: ['dark', 'mythic', 'arcane'], cost: { food: 100, gold: 50 }, time: 30, short: 'Attack +15%', text: 'Soldiers hit 15% harder.' },
  armour: { name: 'Strong Armour', at: 'barracks', ages: ['dark', 'mythic', 'arcane'], cost: { food: 100, lumber: 50 }, time: 30, short: 'Health +15%', text: 'Soldiers have 15% more health.' },
  fletching: { name: 'Fletching', at: 'barracks', ages: ['mythic', 'arcane'], cost: { lumber: 100, gold: 50 }, time: 30, short: 'Range +1', text: 'Archers and towers shoot 1 tile further.' },
  // ---------- Watchtower: defence ----------
  walls: { name: 'Stone Walls', at: 'watchtower', ages: ['mythic', 'arcane'], cost: { lumber: 150, gold: 50 }, time: 35, short: 'Buildings +25%', text: 'All your buildings have 25% more health.' },
  signals: { name: 'Signal Fires', at: 'watchtower', ages: ['mythic'], cost: { lumber: 100, gold: 75 }, time: 30, short: 'Towers +2', text: 'Towers and Town Centers see and shoot 2 tiles further.' },
  // ---------- Sanctum, Beast Pen and Workshop ----------
  herocraft: { name: 'Hero Training', at: 'sanctum', ages: ['mythic', 'arcane'], cost: { food: 150, gold: 100 }, time: 35, short: 'Ability +', text: 'Your hero\'s ability reaches 1 tile further and comes back 20% sooner; the hero gets 15% more health.' },
  beastcraft: { name: 'Beast Training', at: 'pen', ages: ['mythic', 'arcane'], cost: { food: 150, gold: 75 }, time: 35, short: 'Creature +20%', text: 'Your creature has 20% more health and hits 20% harder.' },
  siegecraft: { name: 'Siege Craft', at: 'workshop', ages: ['arcane', 'celestial'], cost: { lumber: 150, gold: 100 }, time: 35, short: 'Siege +1', text: 'Siege engines shoot 1 tile further and their bursts are wider.' },
};

// Each nation's own two technologies, researched at the Sanctum (Mythic, then Arcane Age).
export const UNIQUE_TECHS = {
  air: {
    swarm: { name: 'Swarm Call', at: 'sanctum', ages: ['mythic'], cost: { food: 150, gold: 100 }, time: 35, short: 'Scouts slow', text: 'Scouts call a swarm of bees with every hit: the enemy is slowed for 2 seconds.' },
    hivestore: { name: 'Hive Homes', at: 'sanctum', ages: ['arcane'], cost: { lumber: 200, gold: 100 }, time: 40, short: 'Houses +5', text: 'Every House holds 5 more people, and your population can reach 80.' },
  },
  water: {
    springs: { name: 'Deep Springs', at: 'sanctum', ages: ['mythic'], cost: { food: 150, gold: 100 }, time: 35, short: 'Healing x2', text: 'Out of a fight, your units heal twice as fast and start sooner.' },
    tidehealers: { name: 'Tide Healers', at: 'sanctum', ages: ['arcane'], cost: { food: 200, gold: 125 }, time: 40, short: 'Healers +50%', text: 'Healers heal 50% more and reach 1 tile further.' },
  },
  fire: {
    forgefury: { name: 'Forge Fury', at: 'sanctum', ages: ['mythic'], cost: { food: 150, gold: 100 }, time: 35, short: 'Train +25%', text: 'All units train 25% faster.' },
    lionheart: { name: 'Lion Heart', at: 'sanctum', ages: ['arcane'], cost: { food: 200, gold: 125 }, time: 40, short: 'Brave +30%', text: 'Hurt soldiers fight harder: below half health they hit 30% harder.' },
  },
  earth: {
    ironbark: { name: 'Ironbark', at: 'sanctum', ages: ['mythic'], cost: { food: 150, gold: 100 }, time: 35, short: 'Guardians +30%', text: 'Guardians have 30% more health.' },
    roots: { name: 'Root Network', at: 'sanctum', ages: ['arcane'], cost: { lumber: 200, gold: 100 }, time: 40, short: 'Self-repair', text: 'Your buildings slowly repair themselves when they are not under attack.' },
  },
};

// Every technology a nation can research, by id.
export function techsFor(nation) { return { ...TECHS, ...UNIQUE_TECHS[nation] }; }
