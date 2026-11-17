// The tutorial coach: one goal at a time, ticked off automatically.
const soldiers = (w, team) => [...w.units()].filter(u => u.team === team && u.type !== 'worker').length;
const has = (w, team, type) => [...w.buildings(team)].some(b => b.type === type && b.built);

export const STEPS = [
  { title: 'Select a worker', hint: 'Tap one of your workers near the Town Center.', done: g => g.sel.some(id => g.world.get(id)?.type === 'worker' && g.world.get(id).team === 0) },
  { title: 'Gather lumber', hint: 'With a worker selected, tap a tree.', done: g => [...g.world.units()].some(u => u.team === 0 && u.order?.type === 'gather' && g.world.get(u.order.target)?.kind === 'tree') || g.world.teams[0].stats.gathered.lumber > 0 },
  { title: 'Gather food', hint: 'Send another worker to the red berry bushes.', done: g => g.world.teams[0].stats.gathered.food > 0 || [...g.world.units()].some(u => u.team === 0 && u.order?.type === 'gather' && g.world.get(u.order.target)?.kind === 'berries') },
  { title: 'Train a worker', hint: 'Tap your Town Center, then tap the worker button.', done: g => g.world.teams[0].stats.trained > 0 },
  { title: 'Build a House', hint: 'Select a worker, tap the House button, move the outline, then tap the tick.', done: g => has(g.world, 0, 'house') },
  { title: 'Build a Barracks', hint: 'Barracks train soldiers. You need 150 lumber.', done: g => has(g.world, 0, 'barracks') },
  { title: 'Train three soldiers', hint: 'Tap the Barracks and train Spearmen or Archers.', done: g => soldiers(g.world, 0) >= 3 },
  { title: 'Hold off the first attack', hint: 'The rival will attack. Keep soldiers near your base.', done: g => g.raided && g.calmFor >= 8 },
  { title: "Destroy the rival's Town Center", hint: 'Gather an army, cross a ford and attack the rival Town Center across the river.', done: g => g.world.winner === 0 },
];

export class Tutorial {
  constructor(game) { this.g = game; this.i = 0; }
  get step() { return STEPS[this.i]; }
  get total() { return STEPS.length; }
  update() {
    while (this.i < STEPS.length && STEPS[this.i].done(this.g)) {
      this.i++;
      if (this.i < STEPS.length) this.g.hud.toast(`Done! Next: ${STEPS[this.i].title}`);
    }
  }
}
