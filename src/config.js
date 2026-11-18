// Every gameplay setting for the first playable slice (Dark Age tutorial skirmish).
// Plain data only, so the simulation, the renderer and the tests can all read it.

export const CONFIG = {
  game: { title: 'Genom', version: '0.1.0' },

  // The four English League teams. Emblems are our own element symbols, never the film crests.
  teams: {
    hufflepuff: { name: 'Hufflepuff', element: 'Air', art: 'air', color: '#f0c63e', dark: '#8a5a00', hp: 1, bt: 1 },
    ravenclaw: { name: 'Ravenclaw', element: 'Water', art: 'water', color: '#3f8fe0', dark: '#0f3f7a', hp: 1, bt: 1 },
    gryffindor: { name: 'Gryffindor', element: 'Fire', art: 'fire', color: '#e2483b', dark: '#7a1416', hp: 0.85, bt: 0.8 },
    slytherin: { name: 'Slytherin', element: 'Earth', art: 'earth', color: '#2fa865', dark: '#0c5a2c', hp: 1.25, bt: 1.2 },
  },

  // Pace: Relaxed or Challenge. The rival's timings and size come from here.
  pace: {
    relaxed: { aiWorkers: 9, aiBarracksAt: 210, firstWaveAt: 480, waveEvery: 210, firstWave: 3, waveGrowth: 1, aiTrainEvery: 26, aiAges: { mythic: 780, arcane: 1260, celestial: 1740 } },
    challenge: { aiWorkers: 13, aiBarracksAt: 140, firstWaveAt: 330, waveEvery: 165, firstWave: 5, waveGrowth: 2, aiTrainEvery: 18, aiAges: { mythic: 520, arcane: 880, celestial: 1240 } },
  },

  map: { size: 48, seed: 7, name: 'Sunmeadow Vale' },

  start: { food: 200, lumber: 200, gold: 100, workers: 3 },
  popMax: 60,

  // Buildings (Dark Age). Footprint in tiles; stats from docs/BUILDING_ROSTER.md.
  buildings: {
    towncenter: { name: 'Town Center', role: 'tc', size: 4, hp: 2400, bt: 90, cost: {}, pop: 5, drop: ['food', 'lumber', 'gold'], trains: ['worker'], attack: { range: 6, damage: 4, cooldown: 2 } },
    house: { name: 'House', role: 'house', size: 2, hp: 550, bt: 20, cost: { lumber: 30 }, pop: 10 },
    farm: { name: 'Farm', role: 'farm', size: 3, hp: 300, bt: 25, cost: { lumber: 60 }, walkable: true, farm: true },
    storehouse: { name: 'Storehouse', role: 'store', size: 2, hp: 600, bt: 30, cost: { lumber: 80 }, drop: ['lumber', 'gold', 'food'] },
    barracks: { name: 'Barracks', role: 'barracks', size: 3, hp: 1200, bt: 45, cost: { lumber: 150 }, trains: ['spearman', 'archer', 'special'] },
    watchtower: { name: 'Watchtower', role: 'tower', size: 2, hp: 800, bt: 40, cost: { lumber: 100, gold: 50 }, attack: { range: 7, damage: 7, cooldown: 1.5 } },
    // Mythic Age buildings: the Beast Pen trains the nation's signature creature and the Sanctum
    // its hero (one of each at a time).
    pen: { name: 'Beast Pen', role: 'pen', size: 3, hp: 1300, bt: 50, cost: { lumber: 175, gold: 50 }, age: 'mythic', trains: ['creature'] },
    sanctum: { name: 'Sanctum', role: 'sanctum', size: 3, hp: 1000, bt: 60, cost: { lumber: 150, gold: 150 }, age: 'mythic', trains: ['hero'] },
    // Arcane Age: the Workshop builds siege engines.
    workshop: { name: 'Workshop', role: 'workshop', size: 3, hp: 1100, bt: 55, cost: { lumber: 200, gold: 100 }, age: 'arcane', trains: ['siege'] },
  },
  buildOrder: ['house', 'farm', 'storehouse', 'barracks', 'watchtower', 'pen', 'sanctum', 'workshop'],

  // Ages. Research the next age at the Town Center once its key building stands: a Barracks for
  // the Mythic Age, a Sanctum for the Arcane Age and a Workshop for the Celestial Age. (The Age
  // Ceremony language task will join this step; for now the research timer runs.) Buildings gain
  // 20% HP with each age, and every unit takes its next form.
  ages: ['dark', 'mythic', 'arcane', 'celestial'],
  ageUp: {
    mythic: { name: 'Mythic Age', cost: { food: 400, gold: 150 }, time: 40, needs: 'barracks', hpGain: 1.2 },
    arcane: { name: 'Arcane Age', cost: { food: 600, gold: 300 }, time: 45, needs: 'sanctum', hpGain: 1.2 },
    celestial: { name: 'Celestial Age', cost: { food: 800, gold: 450 }, time: 50, needs: 'workshop', hpGain: 1.2 },
  },

  // Unit stats come from the roster in src/data/units.js (each nation has its own units).


  // Gathering per second while working; amounts per resource node.
  gather: { lumber: 0.75, gold: 0.6, food: 0.85, farm: 0.6 },
  nodes: { tree: 90, gold: 900, berries: 150 },

  // Several workers on one site build faster, with diminishing returns.
  buildRate: n => (n <= 0 ? 0 : 1 + (n - 1) * 0.6),
};

export const TEAM_IDS = Object.keys(CONFIG.teams);
