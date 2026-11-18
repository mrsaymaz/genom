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
      ['Comb Keeper', 'A honey gatherer in a striped smock and a broad hat banded with honeycomb, with a glowing amber satchel, a long honey dipper and a small kite flying from a pole on the back.'],
      ['Sky Tender', 'A gatherer in an amber-glass visor and a honeycomb-plated vest, with a floating amber crystal and a small honeycomb island that carry the load behind them.'],
      ['Cloud Tender', 'A tender who glides on a small puff of cloud, in a cloud-white smock with gold hexes and a wide gold-banded hat with an amber star, holding a staff topped by a ringed star while a little cloud island carries the load.'],
    ],
    infantry: [
      ['Hive Guard', 'A spear fighter in a striped honey-and-black tabard, a coiled straw helmet like a beehive, and a hexagonal wicker shield.'],
      ['Comb Warden', 'A guard in plates of golden honeycomb over a striped tabard, with a tall hive helm and amber visor, a glowing amber hex shield and a stinger-tipped spear.'],
      ['Gale Lancer', 'A lancer in winged honeycomb armour and a crested hive helm, with a long lance pennant and a round shield that holds a spinning amber wind rose.'],
      ['Sky Lancer', 'A lancer in gilded honeycomb plate with great white wings tipped with amber, a gold hive helm crested with a star, a cloud-white shield bearing a great amber star and a long gold lance.'],
    ],
    ranged: [
      ['Wind Slinger', 'A light fighter with a honey scarf, a striped cap and amber goggles, whirling a sling over their head.'],
      ['Gale Archer', 'An archer in a striped sail-cloth cape that billows behind, with a timber bow, a hexagonal quiver and a ring of wind around the arrow.'],
      ['Storm Archer', 'An archer in a sail-cloth mantle with floating amber hexes around the shoulders, drawing a great sail-winged bow whose arrow spins inside a ring of wind.'],
      ['Comet Archer', 'An archer who hovers on a cloud, in a gold circlet with a star and a cloud-white mantle sewn with a gold constellation, drawing a gold bow whose arrows fly like comets with tails of light.'],
    ],
    special: [
      ['Kite Runner', 'A quick runner in honey and cream, towing a striped diamond kite that catches the wind.'],
      ['Glider', 'A scout who skims just above the ground under a striped canvas wing on a timber frame, goggles down, with a pennant streaming behind.'],
      ['Bee Rider', 'A rider on a giant striped honeybee with glowing amber wings, flying over walls and rivers with a lance and goggles.'],
      ['Starwing Rider', 'A rider in gold armour and a winged helm on a royal honeybee with a gold crown and four starlit wings, trailing a puff of cloud, carrying a star-tipped lance.'],
    ],
    hero: [['Wind Warden', 'A tall leader in a long honey cloak and a crown of amber hexes, holding a staff topped by a spinning wind rose with a floating amber crystal.'], ['Storm Warden', 'A leader in a storm-grey and honey cloak, with a crown of floating amber hexes, holding a staff wrapped in a small storm cloud where lightning flickers in the amber.'], ['Sky Warden', 'A leader who stands on a cloud with great white wings, in a cloud-white robe banded with gold, crowned with gold hexes under a blazing amber star, while a constellation ring turns around them and a gold wind rose tops the staff.']],
    siege: ['Gust Cannon', 'Storm Engine'],
  },
  water: {
    worker: [
      ['Shell Gatherer', 'A villager in a blue tunic and a spiral shell hat, with a net basket on their back and a bronze hand-pick.'],
      ['Pearl Gatherer', 'A gatherer in a spiral shell hat topped with a glass bubble, with bronze goggles, a net of pearls and glass floats over one shoulder and a bronze rake.'],
      ['Tide Scholar', 'A scholar in a long blue coat and bronze spectacles, with a satchel of scrolls, a bronze astrolabe tool and a floating orb of water in a bronze ring.'],
      ['Moon Scholar', 'A scholar in a night-blue robe sewn with silver stars and a tall hat with a silver crescent, holding a moon lantern in a crescent cradle and a small silver orrery.'],
    ],
    infantry: [
      ['Shell Guard', 'A spear fighter in a pearl breastplate and a tall spiral conch helmet, with a scallop shield and a coral spear.'],
      ['Conch Guard', 'A guard in layered mother-of-pearl armour with bronze trim, a conch-spiral helm, a round spiral shield and a bronze-headed trident.'],
      ['Tidewall Guard', 'A guard in pearl and bronze plate with a domed glass helm, holding up a curved wall of moving water as a shield, with a bronze trident.'],
      ['Crescent Guard', 'A guard in silver plate with crescent pauldrons and a helm crowned by a tall crescent with a moon between its horns, holding a shield like a full moon of pearl in a silver crescent and a crescent-headed trident.'],
    ],
    ranged: [
      ['Harpooner', 'A sailor in a blue bandana who throws bronze harpoons, with a rope coil at the waist and spare harpoons on the back.'],
      ['Tide Archer', 'An archer in a deep-blue cape with a wave-shaped hem, a bow of polished pearl shell and arrows tipped with glowing water.'],
      ['Glass Archer', 'An archer in a bronze circlet and a flowing cape, with a bow of clear glass and arrows of glass and water; a small armillary ring turns at the hip.'],
      ['Moon Archer', 'An archer in a silver circlet with a small crescent and a night-blue cape sewn with silver stars, drawing a silver crescent bow with arrows of moonlight while a small moon floats over the shoulder.'],
    ],
    special: [
      ['Tide Mender', 'A healer in a long deep-blue robe and a shell crown, carrying a glass bowl of glowing water.'],
      ['Wave Mender', 'A healer in a tall shell crown and a flowing robe, holding a glass orb as ribbons of glowing water curl around them.'],
      ['Spring Sage', 'A sage in a tall pearl mitre and a robe edged with bronze, with a floating spring of water pouring from a shell above their hands.'],
      ['Moon Sage', 'A sage in a tall pearl mitre with a great silver crescent behind the head, raising a full moon in a silver cradle that pours moonlit rain over the army.'],
    ],
    hero: [['Tide Navigator', 'A captain in a long deep-blue coat with pearl buttons and a shell tricorn, holding a bronze spyglass, with two bronze rings turning behind them.'], ['Glass Navigator', 'A captain in a long blue coat with a glass-and-bronze armillary sphere turning behind them and an orb of water at its heart, holding a bronze sextant.'], ['Moon Navigator', 'A captain in a night-blue coat and a crescent tricorn, with a silver spyglass and a moon staff, while a ring of water orbits them like a planet and a great silver orrery turns behind them with the moon at its heart.']],
    siege: ['Tide Engine', 'Moon Engine'],
  },
  fire: {
    worker: [
      ['Forge Hand', 'A strong villager in a leather apron and a scarlet bandana, with a big hammer on the shoulder.'],
      ['Ember Smith', 'A smith in iron gauntlets and a scorched apron with gold rivets, carrying a glowing anvil-stone and a forge hammer, with a gold-banded bandana.'],
      ['Magma Smith', 'A smith in a basalt-plated apron and glowing iron gauntlets, with a hammer whose head is a block of cooling magma and a small floating ember.'],
      ['Sun Smith', 'A smith in a gold-plated apron and gold gauntlets, with a sunburst on the headband, raising a hammer whose head is a small blazing sun, a little sun floating over the free hand.'],
    ],
    infantry: [
      ['Ash Guard', 'A spear fighter in black basalt armour with red iron plates, a spiked crest that burns at the top, and a spiked shield.'],
      ['Flame Guard', 'A guard in stepped basalt armour with glowing magma seams and spiked pauldrons, a flame-crested helm and a shield bearing a gold lion face with a fiery mane.'],
      ['Magma Guard', 'A guard in heavy stepped basalt plates with rivers of magma between them, a horned helm with a crown of fire, and a tall ziggurat shield with a glowing core.'],
      ['Sun Guard', 'A guard in stepped golden plate with white-hot seams and rayed pauldrons, a gold helm crowned with sun rays, a tall stepped shield rising into a half sun and a spear with a broad sun blade.'],
    ],
    ranged: [
      ['Ember Archer', 'An archer in a red hood with iron cheek guards, shooting arrows with glowing ember tips.'],
      ['Flame Archer', 'An archer in a scarlet hood with an iron half-mask, a forged black bow and a quiver of burning arrows, with a fire arrow nocked.'],
      ['Blaze Archer', 'An archer in a horned iron hood and a cloak of smouldering scarlet, drawing a forged bow that burns along its edges, with an arrow of pure flame.'],
      ['Sunfire Archer', 'An archer in a scarlet hood and gold mask framed by a sunburst crown, drawing a gold bow with a solar lens at the grip, shooting beams of sunlight that burn through shields.'],
    ],
    special: [
      ['Boar Rider', 'A rider on a black war boar with big tusks, an iron head plate and a scarlet saddle cloth.'],
      ['Ember Rider', 'A rider on an armoured war boar whose tusks and bristles glow like coals, carrying a flame banner.'],
      ['Lava Charger', 'A rider on an armoured salamander whose back splits with glowing magma, carrying a fire lance and a gold-rimmed shield.'],
      ['Sun Charger', 'A rider in gold armour with a sun crown and a sun shield, on a great scarlet horse with a mane and tail of fire, burning hooves and gold barding, leaving a trail of fire.'],
    ],
    hero: [['Flame Captain', 'A champion in red iron plate with a mane of flame on the shoulders, a gold crown of fire, a scarlet cape and a great blade with a glowing magma edge.'], ['Blaze Captain', 'A champion in basalt plate split by magma seams, with burning horns, a mane of fire and a great blade that burns white-hot.'], ['Phoenix Captain', 'A champion in golden plate with phoenix wings of fire, a sun disc blazing behind the head, a crown of rays and a great sun blade that burns white-hot.']],
    siege: ['Magma Mortar', 'Sun Cannon'],
  },
  earth: {
    worker: [
      ['Root Tender', 'A villager in a moss-green tunic and a wide leaf hat, with a wicker basket of mushrooms and a wooden hoe.'],
      ['Moss Tender', 'A gatherer under a big spotted mushroom hat, with a moss cloak sprouting small flowers, a basket of glowing mushrooms and a rune-carved hoe.'],
      ['Rune Gardener', 'A gardener in a bark-ringed hat sprouting a small sapling, with a rune-carved sickle and a glowing rune stone floating by their shoulder.'],
      ['Grove Keeper', 'A gardener in a hat like a great star lily, with a staff holding a glowing seed-pod lantern, followed by a little living sapling with glowing eyes and a star blossom on top.'],
    ],
    infantry: [
      ['Thorn Guard', 'A spear fighter in bark armour and a leaf cloak, with a branching wooden helmet, a mossy round shield and a thorn spear.'],
      ['Bark Guard', 'A guard in thick, layered bark armour with moss in the joints, a leafy antler helm, a shield cut from a tree trunk with a glowing rune, and a thorn spear.'],
      ['Rune Guard', 'A guard in moss-covered stone plate with an antler crown, holding a standing-stone shield carved with a glowing rune, while two small rune stones orbit them.'],
      ['Grove Guard', 'A guard in armour of living wood that blooms with star blossoms, an antler crown in flower, a seed-pod shield with glowing seams and a great blossom, and a thorn spear with an emerald tip.'],
    ],
    ranged: [
      ['Thornbow', 'A hooded archer in a pointed leaf cloak, with a longbow grown from a living branch.'],
      ['Briar Archer', 'An archer in a leaf hood crowned with small flowers, with a longbow wrapped in thorny briars and arrows tipped with glowing seeds.'],
      ['Rune Archer', 'An archer in a leaf mantle with glowing rune bands, drawing a rune-carved bow of living wood that shoots glowing seeds.'],
      ['Starthorn Archer', 'An archer in a hood like a closed flower bud with a collar of petals, drawing a thorny bow of living wood that blooms at both tips, shooting arrows of starlight wound with thorny vines.'],
    ],
    special: [
      ['Stonewarden', 'A huge warrior in rough stone armour with moss on the shoulders, a stone slab shield and green rune light.'],
      ['Moss Golem', 'A walking figure of stacked stones covered in moss and ferns, with a glowing rune heart, glowing eyes and boulder fists.'],
      ['Rune Golem', 'A giant of floating standing stones held together by glowing green runes instead of joints, with a heart-stone and a crown of moss.'],
      ['Grove Colossus', 'A towering giant of mossy stone bound in roots, with an emerald heart, boulder fists and a small tree growing from its shoulders, hung with glowing star blossoms.'],
    ],
    hero: [['Root Seer', 'An elder in a long moss robe with an antler crown of leaves, leaning on a staff of twisted roots that holds a glowing green rune stone.'], ['Rune Seer', 'An elder in a robe of living moss with a branching antler crown, leaning on a staff grown from the World Tree while rune stones orbit them.'], ['Star Seer', 'An elder in a moss robe with a hem of petals, whose antler crown blooms with glowing star blossoms among fireflies, holding a staff that opens into a star bud while glowing seed pods orbit them.']],
    siege: ['Root Catapult', 'Earthshaker'],
  },
};

// Heroes: one per nation, trained at the Sanctum from the Mythic Age (one at a time). Each age
// gives a new title and look, and the Celestial form is the final one. Stats are for the Mythic Age.
export const HEROES = {
  air: { role: 'Leader', range: 0.95, cooldown: 1.1, sight: 9, cost: { food: 150, gold: 150 }, time: 40, ability: { name: 'Updraft', text: 'Lifts nearby allies: they move faster and dodge arrows for a few seconds.' }, base: { hp: 320, attack: 16, speed: 2.6 } },
  water: { role: 'Support leader', range: 3.5, cooldown: 1.4, sight: 9, cost: { food: 150, gold: 150 }, time: 40, ability: { name: 'High Tide', text: 'A wave heals allies and pushes enemies back.' }, base: { hp: 280, attack: 12, speed: 2.3 } },
  fire: { role: 'Champion', range: 1.0, cooldown: 1.2, sight: 8, cost: { food: 150, gold: 150 }, time: 40, ability: { name: 'Battle Roar', text: 'Nearby allies deal more damage for a few seconds.' }, base: { hp: 360, attack: 20, speed: 2.4 } },
  earth: { role: 'Defender', range: 3.0, cooldown: 1.5, sight: 8, cost: { food: 150, gold: 150 }, time: 40, ability: { name: 'Root Snare', text: 'Roots grab enemies in an area and hold them in place.' }, base: { hp: 340, attack: 14, speed: 2.0 } },
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
