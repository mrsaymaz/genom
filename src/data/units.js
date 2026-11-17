// The unit roster: four lines per nation that transform with every age, plus a hero (from the
// Mythic Age), the signature creature (Beast Pen, from the Mythic Age) and a siege engine (from
// the Arcane Age). Plain data, read by the game, the docs generator and the concept pages.
// Stats are example values for tuning. The Dark Age values match the first playable slice.

export const AGES = ['dark', 'mythic', 'arcane', 'celestial'];
export const AGE_NAMES = { dark: 'Dark', mythic: 'Mythic', arcane: 'Arcane', celestial: 'Celestial' };

// How a line grows with each age: HP, attack and cost multipliers.
export const AGE_SCALE = {
  dark: { hp: 1, attack: 1, cost: 1 },
  mythic: { hp: 1.35, attack: 1.3, cost: 1.2 },
  arcane: { hp: 1.75, attack: 1.6, cost: 1.4 },
  celestial: { hp: 2.2, attack: 2, cost: 1.6 },
};

// Counters, in plain words for the unit cards. Infantry beats fast units, ranged beats infantry,
// fast units beat ranged. Guardians beat infantry and fast units but are slow, so ranged beats
// them. Healers keep others alive and avoid fights. The element cycle adds a small extra edge.
export const LINES = {
  worker: {
    label: 'Worker', from: 'Town Center', attackType: 'melee',
    base: { hp: 25, attack: 2, range: 0.9, cooldown: 1.4, speed: 2.3, sight: 4, cost: { food: 50 }, time: 12, pop: 1 },
    role: 'Gathers food, lumber and gold, and builds.',
    strong: 'Nothing: keep workers away from fights.', weak: 'Every soldier',
  },
  infantry: {
    label: 'Infantry', from: 'Barracks', attackType: 'melee',
    base: { hp: 55, attack: 7, range: 0.95, cooldown: 1.2, speed: 2.1, sight: 6, cost: { food: 60, lumber: 20 }, time: 18, pop: 1 },
    role: 'Front-line spear fighter. Extra damage against buildings and fast units.',
    strong: 'Fast units and buildings', weak: 'Ranged units and guardians',
  },
  ranged: {
    label: 'Ranged', from: 'Barracks', attackType: 'ranged',
    base: { hp: 35, attack: 5, range: 4.5, cooldown: 1.6, speed: 2.2, sight: 7, cost: { food: 40, lumber: 35, gold: 15 }, time: 20, pop: 1 },
    role: 'Attacks from a distance. Fragile up close.',
    strong: 'Infantry and guardians', weak: 'Fast units',
  },
};

// The fourth line is different for each nation and fits its element.
export const SPECIALS = {
  air: {
    kind: 'scout', label: 'Scout', from: 'Barracks', attackType: 'melee',
    base: { hp: 40, attack: 5, range: 0.9, cooldown: 1.0, speed: 3.4, sight: 9, cost: { food: 50, lumber: 30 }, time: 16, pop: 1 },
    role: 'The fastest unit in the game. Sees far and strikes and runs.',
    ability: { name: 'Tailwind', text: 'Runs even faster for a few seconds after landing a hit.' },
    strong: 'Ranged units and workers', weak: 'Infantry',
  },
  water: {
    kind: 'healer', label: 'Healer', from: 'Barracks', attackType: 'ranged',
    base: { hp: 32, attack: 2, range: 3, cooldown: 2.0, speed: 2.1, sight: 7, cost: { food: 50, gold: 30 }, time: 20, pop: 1, heal: 3 },
    role: 'Heals the most hurt ally nearby. A weak fighter.',
    ability: { name: 'Mend', text: 'Heals a nearby ally by 3 HP every second.' },
    strong: 'Long fights, next to infantry', weak: 'Fast units',
  },
  fire: {
    kind: 'charger', label: 'Charger', from: 'Barracks', attackType: 'melee',
    base: { hp: 70, attack: 8, range: 1.0, cooldown: 1.3, speed: 3.0, sight: 6, cost: { food: 70, gold: 25 }, time: 22, pop: 1 },
    role: 'A rider who crashes into the enemy line.',
    ability: { name: 'Charge', text: 'The first hit after running in deals double damage.' },
    strong: 'Ranged units and workers', weak: 'Infantry',
  },
  earth: {
    kind: 'guardian', label: 'Guardian', from: 'Barracks', attackType: 'melee',
    base: { hp: 120, attack: 9, range: 1.0, cooldown: 1.6, speed: 1.5, sight: 5, cost: { food: 60, lumber: 40, gold: 20 }, time: 26, pop: 2 },
    role: 'Slow and very tough. Holds the line while others fight.',
    ability: { name: 'Stone Skin', text: 'Takes half damage from melee attacks.' },
    strong: 'Infantry and fast units', weak: 'Ranged units',
  },
};

// Small nation-wide unit twists, matching each nation's play identity.
export const UNIT_TWISTS = {
  air: { speed: 1.1, text: 'All units move 10% faster.' },
  water: { regen: 0.5, text: 'Units slowly heal when they are out of combat.' },
  fire: { time: 0.85, text: 'Units train 15% faster.' },
  earth: { hp: 1.1, speed: 0.95, text: 'Units have 10% more HP but move 5% slower.' },
};

// Names and looks per nation, line and age. Dark Age descriptions match the concept models.
export const ROSTER = {
  air: {
    worker: [
      ['Beekeeper', 'A villager in a wide straw hat and veil, with a smoker pot, a hand axe and a straw hive on their back.'],
      ['Comb Keeper', 'A honey gatherer with an amber-glass satchel and a small kite pack.'],
      ['Sky Tender', 'Followed by a floating honey crystal that carries their load.'],
      ['Cloud Tender', 'Glides over the ground on a small puff of cloud.'],
    ],
    infantry: [
      ['Hive Guard', 'A spear fighter in a striped honey-and-black tabard, a coiled straw helmet like a beehive, and a hexagonal wicker shield.'],
      ['Comb Warden', 'Honeycomb armour and an amber hex shield; the spear tip is shaped like a stinger.'],
      ['Gale Lancer', 'A lancer whose shield holds a spinning wind rose.'],
      ['Sky Lancer', 'Canvas wings on the back let them leap over the line.'],
    ],
    ranged: [
      ['Wind Slinger', 'A light fighter with a honey scarf, a striped cap and amber goggles, whirling a sling over their head.'],
      ['Gale Archer', 'A bow fletched with sail cloth; arrows ride the wind.'],
      ['Storm Archer', 'Arrows leave a trail of wind that pushes enemies back.'],
      ['Comet Archer', 'Hovers above the field and shoots streaks of golden light.'],
    ],
    special: [
      ['Kite Runner', 'A quick runner in honey and cream, towing a striped diamond kite that catches the wind.'],
      ['Glider', 'Glides a little above the ground on a striped canvas wing.'],
      ['Bee Rider', 'Rides a giant honeybee over walls and rivers.'],
      ['Wind Skiff', 'A tiny flying boat with a full sail.'],
    ],
    hero: ['Wind Warden', 'Storm Warden', 'Sky Warden'],
    siege: ['Gust Cannon', 'Storm Engine'],
  },
  water: {
    worker: [
      ['Shell Gatherer', 'A villager in a blue tunic and a spiral shell hat, with a net basket on their back and a bronze hand-pick.'],
      ['Pearl Gatherer', 'Carries pearls and glass floats in a woven net.'],
      ['Tide Scholar', 'Uses bronze tools and a floating water orb.'],
      ['Star Scholar', 'Reads the stars from a small bronze armillary.'],
    ],
    infantry: [
      ['Shell Guard', 'A spear fighter in a pearl breastplate and a tall spiral conch helmet, with a scallop shield and a coral spear.'],
      ['Conch Guard', 'Mother-of-pearl armour and a shield shaped like a conch.'],
      ['Tidewall Guard', 'Their shield is a curved wall of moving water.'],
      ['Pearl Sentinel', 'Armour of glass and pearl that shines like the moon.'],
    ],
    ranged: [
      ['Harpooner', 'A sailor in a blue bandana who throws bronze harpoons, with a rope coil at the waist and spare harpoons on the back.'],
      ['Tide Archer', 'A bow of polished shell; arrows splash on impact.'],
      ['Glass Archer', 'A crystal bow that shoots arrows of glass and water.'],
      ['Moon Archer', 'Silver arrows that glow like moonlight on water.'],
    ],
    special: [
      ['Tide Mender', 'A healer in a long deep-blue robe and a shell crown, carrying a glass bowl of glowing water.'],
      ['Wave Mender', 'Heals with ribbons of water that flow to wounded allies.'],
      ['Spring Sage', 'A floating spring follows them and heals everyone it touches.'],
      ['Star Sage', 'Heals a whole group with a shower of starlit rain.'],
    ],
    hero: ['Tide Navigator', 'Glass Navigator', 'Star Navigator'],
    siege: ['Tide Engine', 'Moon Engine'],
  },
  fire: {
    worker: [
      ['Forge Hand', 'A strong villager in a leather apron and a scarlet bandana, with a big hammer on the shoulder.'],
      ['Ember Smith', 'Carries a small glowing anvil-stone that never cools.'],
      ['Magma Smith', 'Iron gloves and tools that glow with heat.'],
      ['Sun Smith', 'Works gold and sunfire with a golden hammer.'],
    ],
    infantry: [
      ['Ash Guard', 'A spear fighter in black basalt armour with red iron plates, a spiked crest that burns at the top, and a spiked shield.'],
      ['Flame Guard', 'Armour with glowing seams and a lion-faced shield.'],
      ['Magma Guard', 'Heavy plates with rivers of magma between them.'],
      ['Sun Guard', 'Golden armour crowned with a ring of flame.'],
    ],
    ranged: [
      ['Ember Archer', 'An archer in a red hood with iron cheek guards, shooting arrows with glowing ember tips.'],
      ['Flame Archer', 'Fire arrows that leave small burning patches.'],
      ['Blaze Archer', 'A forged bow that shoots arrows of pure flame.'],
      ['Sunfire Archer', 'Arrows of sunlight that burn through shields.'],
    ],
    special: [
      ['Boar Rider', 'A rider on a black war boar with big tusks, an iron head plate and a scarlet saddle cloth.'],
      ['Ember Rider', 'The boar\'s tusks and bristles glow like coals.'],
      ['Lava Charger', 'Rides an armoured salamander with a magma back.'],
      ['Sun Charger', 'Rides a burning horse that leaves a trail of fire.'],
    ],
    hero: ['Flame Captain', 'Blaze Captain', 'Sun Champion'],
    siege: ['Magma Mortar', 'Sun Cannon'],
  },
  earth: {
    worker: [
      ['Root Tender', 'A villager in a moss-green tunic and a wide leaf hat, with a wicker basket of mushrooms and a wooden hoe.'],
      ['Moss Tender', 'Moss and small flowers grow on their cloak.'],
      ['Rune Gardener', 'Their tools carry glowing green runes.'],
      ['Grove Keeper', 'Little living saplings walk behind them.'],
    ],
    infantry: [
      ['Thorn Guard', 'A spear fighter in bark armour and a leaf cloak, with a branching wooden helmet, a mossy round shield and a thorn spear.'],
      ['Bark Guard', 'Thick bark armour that slowly heals itself.'],
      ['Rune Guard', 'Standing-stone shields with glowing green runes.'],
      ['Grove Guard', 'Armour of living wood that blooms in battle.'],
    ],
    ranged: [
      ['Thornbow', 'A hooded archer in a pointed leaf cloak, with a longbow grown from a living branch.'],
      ['Briar Archer', 'Arrows that sprout thorny briars where they land.'],
      ['Rune Archer', 'A rune-carved bow that shoots glowing seeds.'],
      ['Starthorn Archer', 'Arrows of starlight wrapped in thorns.'],
    ],
    special: [
      ['Stonewarden', 'A huge warrior in rough stone armour with moss on the shoulders, a stone slab shield and green rune light.'],
      ['Moss Golem', 'A walking stone figure covered in moss.'],
      ['Rune Golem', 'Standing stones joined by glowing runes.'],
      ['Grove Colossus', 'A towering giant of stone and living trees.'],
    ],
    hero: ['Root Seer', 'Rune Seer', 'Star Seer'],
    siege: ['Root Catapult', 'Earthshaker'],
  },
};

// Heroes: one per nation, trained at the Sanctum from the Mythic Age. Each age gives a new title.
export const HEROES = {
  air: { role: 'Leader', ability: { name: 'Updraft', text: 'Lifts nearby allies: they move faster and dodge arrows for a few seconds.' }, base: { hp: 320, attack: 16, speed: 2.6 } },
  water: { role: 'Support leader', ability: { name: 'High Tide', text: 'A wave heals allies and pushes enemies back.' }, base: { hp: 280, attack: 12, speed: 2.3 } },
  fire: { role: 'Champion', ability: { name: 'Battle Roar', text: 'Nearby allies deal more damage for a few seconds.' }, base: { hp: 360, attack: 20, speed: 2.4 } },
  earth: { role: 'Defender', ability: { name: 'Root Snare', text: 'Roots grab enemies in an area and hold them in place.' }, base: { hp: 340, attack: 14, speed: 2.0 } },
};

// Signature creatures (forms per age in docs/concepts/signature-creatures.html).
export const CREATURES = {
  air: 'Galehide Bear', water: 'Tide Raven', fire: 'Ember Lion', earth: 'Rootcoil Serpent',
};

export const NATION_ORDER = ['air', 'water', 'fire', 'earth'];
export const NATION_INFO = {
  air: { team: 'Hufflepuff', element: 'Air', hash: 'hufflepuff' },
  water: { team: 'Ravenclaw', element: 'Water', hash: 'ravenclaw' },
  fire: { team: 'Gryffindor', element: 'Fire', hash: 'gryffindor' },
  earth: { team: 'Slytherin', element: 'Earth', hash: 'slytherin' },
};

// The stats a unit has in a given age, with its nation's twist applied.
export function unitStats(nation, line, age = 'dark') {
  const def = line === 'special' ? SPECIALS[nation] : LINES[line];
  const s = AGE_SCALE[age], tw = UNIT_TWISTS[nation], b = def.base;
  const cost = Object.fromEntries(Object.entries(b.cost).map(([k, v]) => [k, Math.round((v * s.cost) / 5) * 5]));
  return {
    ...b,
    hp: Math.round(b.hp * s.hp * (tw.hp || 1)),
    attack: Math.round(b.attack * s.attack * 10) / 10,
    speed: Math.round(b.speed * (tw.speed || 1) * 100) / 100,
    time: Math.round(b.time * (tw.time || 1)),
    cost,
  };
}
