// The tutorial coach: one goal at a time, ticked off automatically. Each goal also has a guide
// that points at exactly what to tap next (a unit, a building, a tree, or a button) and a hint
// for when the student seems stuck. Students play at home, alone, so the game must teach itself.
import { CONFIG } from './config.js';

const soldiers = (w, team) => [...w.units()].filter(u => u.team === team && u.type !== 'worker').length;
const has = (w, team, type) => [...w.buildings(team)].some(b => b.type === type && b.built);
const mine = (g, type) => [...g.world.buildings(0)].find(b => b.type === type);
const selected = g => g.sel.map(id => g.world.get(id)).filter(e => e && e.team === 0);
const selWorkers = g => selected(g).filter(e => e.type === 'worker');
const workerFor = (g, prefer) => {
  const all = [...g.world.units()].filter(u => u.team === 0 && u.type === 'worker');
  return all.find(u => !u.order) || all.find(prefer || (() => false)) || all[0] || null;
};
const nearest = (g, from, kind) => (from ? g.world.nearestResource(from.x, from.y, kind, 40) : null);
const gathering = (g, kind) => [...g.world.units()].some(u => u.team === 0 && u.order?.type === 'gather' && g.world.get(u.order.target)?.kind === kind);

// Building a building: worker, then Build, then the right wheel button, then the tick.
function buildGuide(g, type) {
  const name = CONFIG.buildings[type].name, cost = CONFIG.buildings[type].cost;
  if (g.placing?.type === type) return g.placing.ok
    ? { ui: '[data-id="ok"]', say: 'Tap the green tick!', hint: 'Tap the green tick to start building.' }
    : { say: 'Drag it onto the grass.', hint: 'The outline is red, so it cannot go there. Drag it onto open grass.' };
  if (!g.world.canAfford(0, cost)) {
    const tree = nearest(g, workerFor(g), 'tree');
    return { at: tree, say: 'We need more wood!', hint: `You need ${Object.entries(cost).map(([k, v]) => `${v} ${k}`).join(' and ')}. Send more workers to the trees.` };
  }
  if (g.hud.wheelAt) return { ui: `[data-id="b${type}"]`, say: `Tap the ${name}!`, hint: `Tap the ${name}.` };
  if (selWorkers(g).length) return { ui: '[data-id="build"]', say: 'Tap Build!', hint: 'Tap the yellow Build button.' };
  return { at: workerFor(g), say: 'Tap a worker!', hint: 'First, tap a worker.' };
}
// Training: tap the building, then the unit button on its ring.
function trainGuide(g, type, unit) {
  const b = mine(g, type);
  if (!b) return {};
  if (g.sel.includes(b.id)) return { ui: `[data-id="t${unit}"]`, say: `Tap the ${g.world.def(0, unit).short}!`, hint: `Tap the ${g.world.def(0, unit).name} button on the ${CONFIG.buildings[type].name}.` };
  return { at: b, say: `Tap the ${CONFIG.buildings[type].name}!`, hint: `Tap your ${CONFIG.buildings[type].name}.` };
}

export const STEPS = [
  {
    title: 'Select a worker', short: 'Tap a worker', reward: { food: 20 }, hint: 'Tap one of your workers near the Town Center.',
    done: g => selWorkers(g).length > 0,
    guide: g => ({ at: workerFor(g), say: 'Tap a worker!', hint: 'Tap a worker. Workers carry a tool.' }),
  },
  {
    title: 'Gather lumber', short: 'Get lumber', reward: { lumber: 20 }, hint: 'With a worker selected, tap a tree.',
    done: g => gathering(g, 'tree') || g.world.teams[0].stats.gathered.lumber > 0,
    guide: g => { const w = selWorkers(g)[0]; return w ? { at: nearest(g, w, 'tree'), say: 'Now tap a tree!', hint: 'Now tap a tree.' } : { at: workerFor(g), say: 'Tap a worker!', hint: 'Tap a worker first.' }; },
  },
  {
    title: 'Gather food', short: 'Get food', reward: { food: 30 }, hint: 'Send another worker to the red berry bushes.',
    done: g => g.world.teams[0].stats.gathered.food > 0 || gathering(g, 'berries'),
    guide: g => {
      const w = selWorkers(g)[0];
      if (w && !(w.order?.type === 'gather' && g.world.get(w.order.target)?.kind === 'tree')) return { at: nearest(g, w, 'berries'), say: 'Tap the berries!', hint: 'Tap the berry bushes.' };
      return { at: workerFor(g, u => g.world.get(u.order?.target)?.kind !== 'tree'), say: 'Tap another worker!', hint: 'Tap a different worker. Then tap the berry bushes.' };
    },
  },
  {
    title: 'Train a worker', short: 'Train a worker', reward: { food: 30 }, hint: 'Tap your Town Center, then tap the Worker button that pops up on it.',
    done: g => g.world.teams[0].stats.trained > 0 || [...g.world.buildings(0)].some(b => b.queue.length),
    guide: g => trainGuide(g, 'towncenter', 'worker'),
  },
  {
    title: 'Build a House', short: 'Build a House', reward: { lumber: 40 }, hint: 'Select a worker, tap Build and pick the House. Drag the outline, then tap the tick.',
    done: g => has(g.world, 0, 'house'),
    guide: g => { const h = mine(g, 'house'); return h && !h.built ? { at: h, say: 'They are building it. Wait!', hint: 'Your workers are building the House. Wait for them to finish.' } : buildGuide(g, 'house'); },
  },
  {
    title: 'Build a Barracks', short: 'Build Barracks', reward: { gold: 30 }, hint: 'Barracks train soldiers. You need 150 lumber.',
    done: g => has(g.world, 0, 'barracks'),
    guide: g => { const b = mine(g, 'barracks'); return b && !b.built ? { at: b, say: 'More workers build faster!', hint: 'The Barracks are going up. More workers build faster.' } : buildGuide(g, 'barracks'); },
  },
  {
    title: 'Train three soldiers', short: 'Train 3 soldiers', reward: { food: 50, gold: 20 }, hint: 'Tap the Barracks, then tap a soldier button on it. Hold a button to queue five.',
    done: g => soldiers(g.world, 0) >= 3,
    guide: g => trainGuide(g, 'barracks', 'spearman'),
  },
  {
    title: 'Research an upgrade', short: 'Get an upgrade', reward: { food: 50, gold: 50 }, hint: 'Tap the Barracks, tap Research, then tap Forged Weapons. Upgrades make your soldiers stronger than the rival\'s.',
    done: g => Object.values(g.world.teams[0].tech).some(v => v > 0) || [...g.world.buildings(0)].some(b => b.research),
    guide: g => {
      const b = mine(g, 'barracks');
      if (!b) return {};
      const next = g.world.nextTech(0, 'weapons');
      if (next && !g.world.canAfford(0, next.cost)) return { at: nearest(g, workerFor(g), 'gold') || nearest(g, workerFor(g), 'berries'), say: 'We need food and gold!', hint: 'Forged Weapons costs 100 food and 50 gold. Keep your workers gathering.' };
      if (!g.sel.includes(b.id)) return { at: b, say: 'Tap the Barracks!', hint: 'Tap your Barracks.' };
      if (g.hud.researchAt === b.id) return { ui: '[data-id="rweapons"]', say: 'Tap Forged Weapons!', hint: 'Tap Forged Weapons: your soldiers will hit harder.' };
      return { ui: '[data-id="research"]', say: 'Tap Research!', hint: 'Tap the Research button on the Barracks.' };
    },
  },
  {
    title: 'Hold off the first attack', short: 'Stop the attack', reward: { lumber: 60, gold: 40 }, hint: 'The rival will attack. Keep soldiers near your base. If they come, ring the Town bell.',
    done: g => g.raided && g.calmFor >= 8,
    guide: g => ({ at: soldiers(g.world, 0) < 5 ? mine(g, 'barracks') : null, say: 'Train more soldiers!', hint: 'Train more soldiers while you wait. Keep your workers gathering.' }),
  },
  {
    title: 'Reach the Mythic Age', short: 'Age up', reward: { food: 100, gold: 50 }, hint: 'Tap your Town Center, then tap the Mythic button. You need a Barracks, 400 food and 150 gold.',
    done: g => g.world.teams[0].age !== 'dark',
    guide: g => {
      const tc = mine(g, 'towncenter');
      if (!tc) return {};
      if (tc.ageUp) return { at: tc, say: 'The Mythic Age is coming!', hint: 'Your people are getting ready. Keep gathering while you wait.' };
      const c = g.world.canAgeUp(0);
      if (c.why === 'needs') return buildGuide(g, c.needs);
      if (c.why === 'cost') {
        const r = g.world.teams[0].res, w = workerFor(g);
        return r.food < c.cost.food ? { at: nearest(g, w, 'berries') || mine(g, 'farm'), say: 'We need more food!', hint: 'Send workers to the berries or farms.' } : { at: nearest(g, w, 'gold'), say: 'We need more gold!', hint: 'Send workers to the gold mine.' };
      }
      if (g.sel.includes(tc.id)) return { ui: '[data-id="age"]', say: 'Tap Mythic!', hint: 'Tap the Mythic button on your Town Center.' };
      return { at: tc, say: 'Tap the Town Center!', hint: 'Tap your Town Center.' };
    },
  },
  {
    title: "Destroy the rival's Town Center", short: 'Destroy their Town Center', reward: null, hint: 'Gather an army, cross a ford and attack the rival Town Center across the river.',
    done: g => g.world.winner === 0,
    guide: g => ({ at: [...g.world.buildings(1)].find(b => b.type === 'towncenter'), say: 'Attack their Town Center!', hint: 'Select your soldiers, tap Attack, then tap the rival Town Center.' }),
  },
];

export class Tutorial {
  constructor(game) { this.g = game; this.i = 0; this.stepT = 0; this.hintT = 0; this.nudge = 0; }
  get step() { return STEPS[this.i]; }
  get total() { return STEPS.length; }
  // What the pointer should show right now: { at: entity } or { ui: selector }, plus a hint.
  guide() {
    // A required English job comes first: it is what holds up the game (the gold, the Barracks,
    // the Mythic Age, the creature, the ward).
    const g = this.g, job = !g.station && g.jobs?.()[0];
    if (job) {
      const t = g.hud.root.querySelector(`[data-job="${job.id}"]`), onMap = t && !t.classList.contains('hidden');
      return { ui: onMap ? `[data-job="${job.id}"]` : `[data-job-chip="${job.id}"]`, say: job.say, hint: job.say };
    }
    return this.step ? this.step.guide(this.g) || {} : {};
  }
  update(dt = 0) {
    while (this.i < STEPS.length && STEPS[this.i].done(this.g)) {
      // A finished goal gives a small reward, shown on the resource tokens.
      const reward = STEPS[this.i].reward;
      if (reward) { const r = this.g.world.teams[0].res; for (const [k, v] of Object.entries(reward)) r[k] += v; }
      this.g.hud.goalDone?.(STEPS[this.i], reward);
      this.i++; this.stepT = 0; this.hintT = 0;
    }
    if (!this.step) return;
    this.stepT += dt; this.hintT += dt; this.nudge = Math.max(0, this.nudge - dt);
    // Stuck on one goal for a while? Say what to do next, and make the pointer bounce harder.
    if (this.stepT > 20 && this.hintT > 22) {
      this.hintT = 0; this.nudge = 4;
      this.g.hud.guideNudge?.(this.guide().hint || this.step.hint);
    }
  }
  // Any useful action resets the stuck timer.
  acted() { this.hintT = Math.min(this.hintT, 8); }
}
