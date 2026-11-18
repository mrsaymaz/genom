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
    ? { ui: '[data-id="ok"]', hint: 'Tap the green tick to start building.' }
    : { hint: 'The outline is red, so it cannot go there. Drag it onto open grass.' };
  if (!g.world.canAfford(0, cost)) {
    const tree = nearest(g, workerFor(g), 'tree');
    return { at: tree, hint: `You need ${Object.entries(cost).map(([k, v]) => `${v} ${k}`).join(' and ')}. Send more workers to the trees.` };
  }
  if (g.hud.wheelAt) return { ui: `[data-id="b${type}"]`, hint: `Tap the ${name}.` };
  if (selWorkers(g).length) return { ui: '[data-id="build"]', hint: 'Tap the yellow Build button.' };
  return { at: workerFor(g), hint: 'First, tap a worker.' };
}
// Training: tap the building, then the unit button on its ring.
function trainGuide(g, type, unit) {
  const b = mine(g, type);
  if (!b) return {};
  if (g.sel.includes(b.id)) return { ui: `[data-id="t${unit}"]`, hint: `Tap the ${g.world.def(0, unit).name} button on the ${CONFIG.buildings[type].name}.` };
  return { at: b, hint: `Tap your ${CONFIG.buildings[type].name}.` };
}

export const STEPS = [
  {
    title: 'Select a worker', hint: 'Tap one of your workers near the Town Center.',
    done: g => selWorkers(g).length > 0,
    guide: g => ({ at: workerFor(g), hint: 'Tap a worker. Workers carry a tool and a straw hat.' }),
  },
  {
    title: 'Gather lumber', hint: 'With a worker selected, tap a tree.',
    done: g => gathering(g, 'tree') || g.world.teams[0].stats.gathered.lumber > 0,
    guide: g => { const w = selWorkers(g)[0]; return w ? { at: nearest(g, w, 'tree'), hint: 'Now tap a tree.' } : { at: workerFor(g), hint: 'Tap a worker first.' }; },
  },
  {
    title: 'Gather food', hint: 'Send another worker to the red berry bushes.',
    done: g => g.world.teams[0].stats.gathered.food > 0 || gathering(g, 'berries'),
    guide: g => {
      const w = selWorkers(g)[0];
      if (w && !(w.order?.type === 'gather' && g.world.get(w.order.target)?.kind === 'tree')) return { at: nearest(g, w, 'berries'), hint: 'Tap the berry bushes.' };
      return { at: workerFor(g, u => g.world.get(u.order?.target)?.kind !== 'tree'), hint: 'Tap a different worker. Then tap the berry bushes.' };
    },
  },
  {
    title: 'Train a worker', hint: 'Tap your Town Center, then tap the Worker button that pops up on it.',
    done: g => g.world.teams[0].stats.trained > 0 || [...g.world.buildings(0)].some(b => b.queue.length),
    guide: g => trainGuide(g, 'towncenter', 'worker'),
  },
  {
    title: 'Build a House', hint: 'Select a worker, tap Build and pick the House. Drag the outline, then tap the tick.',
    done: g => has(g.world, 0, 'house'),
    guide: g => { const h = mine(g, 'house'); return h && !h.built ? { at: h, hint: 'Your workers are building the House. Wait for them to finish.' } : buildGuide(g, 'house'); },
  },
  {
    title: 'Build a Barracks', hint: 'Barracks train soldiers. You need 150 lumber.',
    done: g => has(g.world, 0, 'barracks'),
    guide: g => { const b = mine(g, 'barracks'); return b && !b.built ? { at: b, hint: 'The Barracks are going up. More workers build faster.' } : buildGuide(g, 'barracks'); },
  },
  {
    title: 'Train three soldiers', hint: 'Tap the Barracks, then tap a soldier button on it. Hold a button to queue five.',
    done: g => soldiers(g.world, 0) >= 3,
    guide: g => trainGuide(g, 'barracks', 'spearman'),
  },
  {
    title: 'Hold off the first attack', hint: 'The rival will attack. Keep soldiers near your base. If they come, ring the Town bell.',
    done: g => g.raided && g.calmFor >= 8,
    guide: g => ({ at: soldiers(g.world, 0) < 5 ? mine(g, 'barracks') : null, hint: 'Train more soldiers while you wait. Keep your workers gathering.' }),
  },
  {
    title: "Destroy the rival's Town Center", hint: 'Gather an army, cross a ford and attack the rival Town Center across the river.',
    done: g => g.world.winner === 0,
    guide: g => ({ at: [...g.world.buildings(1)].find(b => b.type === 'towncenter'), hint: 'Select your soldiers, tap Attack, then tap the rival Town Center.' }),
  },
];

export class Tutorial {
  constructor(game) { this.g = game; this.i = 0; this.stepT = 0; this.hintT = 0; this.nudge = 0; }
  get step() { return STEPS[this.i]; }
  get total() { return STEPS.length; }
  // What the pointer should show right now: { at: entity } or { ui: selector }, plus a hint.
  guide() { return this.step ? this.step.guide(this.g) || {} : {}; }
  update(dt = 0) {
    while (this.i < STEPS.length && STEPS[this.i].done(this.g)) { this.i++; this.stepT = 0; this.hintT = 0; } // the goal panel pulses with the new goal
    if (!this.step) return;
    this.stepT += dt; this.hintT += dt; this.nudge = Math.max(0, this.nudge - dt);
    // Stuck on one goal for a while? Say what to do next, and make the pointer bounce harder.
    if (this.stepT > 20 && this.hintT > 22) {
      this.hintT = 0; this.nudge = 4;
      const h = this.guide().hint || this.step.hint;
      this.g.hud.toast(h, 'hint');
    }
  }
  // Any useful action resets the stuck timer.
  acted() { this.hintT = Math.min(this.hintT, 8); }
}
