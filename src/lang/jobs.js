// Arena 1's required English moments (docs/LANGUAGE_TASKS.md, "Required tasks"): what is waiting
// for the student right now, and the station that does each job.
//   Gold mine claim     spell the word on the claim post (first letter given)       1 item
//   Barracks foundation soldiers hold sentence blocks; tap them in order            3 items
//   Age Ceremony        match a picture or Turkish word, a clue, a spelling          3 rounds x 2
//   Creature's first form  the creature's riddle: toss it the food with the answer   1 item
//   Battle cry          the herald asks; raise the banner with the right reply       1 item
import * as THREE from 'three';
import { ICONS } from '../ui/icons.js';
import { Station, STONES, TILES, SOLDIERS, FOOD, BANNERS, claimPost } from './station.js';

// The jobs waiting for an English task: { id, label, say, icon, at (entity) }.
export function jobs(g) {
  const w = g.world, out = [];
  if (!w.language || !g.lang) return out;
  const t = w.teams[0], tc = g.home();
  if (t.goldLocked) {
    // Shown once gold matters: a worker sent to a mine, or the tutorial's research goal.
    const sent = [...w.units()].find(u => u.team === 0 && w.get(u.order?.target)?.kind === 'gold');
    if (sent || (w.mapId === 'vale' && g.tutorial.i >= 7) || w.time > 300) {
      const mine = sent ? w.get(sent.order.target) : tc && w.nearestResource(...w.center(tc), 'gold', 40);
      if (mine) out.push({ id: 'gold', label: 'Claim the gold', say: 'Claim the gold mine: tap the sign!', icon: ICONS.gold, at: mine });
    }
  }
  for (const b of w.buildings(0)) if (b.sealed) out.push({ id: 'drill', label: 'Foundation', say: 'Lay the foundation: tap the Barracks!', icon: ICONS.barracks, at: b });
  if (tc?.ageUp?.ceremony) out.push({ id: 'ceremony', label: 'Age Ceremony', say: 'Start the Age Ceremony!', icon: ICONS.age, at: tc });
  for (const b of w.buildings(0)) if (b.queue[0]?.feed) out.push({ id: 'feed', label: 'Feed it', say: 'Your creature is hungry: feed it!', icon: ICONS.creature, at: b });
  if (w.teams[1].ward) {
    const rtc = [...w.buildings(1)].find(b => b.type === 'towncenter');
    if (rtc) {
      const [cx, cy] = w.center(rtc), army = [...w.units()].filter(u => u.team === 0 && u.type !== 'worker' && Math.hypot(u.x - cx, u.y - cy) < 16);
      if (army.length >= 3) out.push({ id: 'battle', label: 'Battle cry', say: 'Give the battle cry to break the ward!', icon: ICONS.army, at: rtc, army });
    }
  }
  return out;
}

// Word stones for choices and letter tiles for spelling, in one station.
const MIXED = { prop: (st, it, word, j) => (it.kind === 'spell' ? TILES : STONES).prop(st, it, word, j), correct: (st, p, k) => (st.it.kind === 'spell' ? TILES : STONES).correct(st, p, k), update: STONES.update };

// The Wonder's incantation: before the superweapon strikes, the student speaks the spell (a clue
// and a spelling, at the Wonder). Fresh items every time; stepping out calls the strike off.
export function incantation(g, wonder, title, onDone) {
  const L = g.lang, [x, y] = g.world.center(wonder);
  return new Station(g, { job: 'incant', start: 0, focus: [x, y], title, items: [L.clue(), L.spell()], scene: MIXED, ahead: 3.6,
    sub: i => `${title} · Word ${i + 1} of 2`, cheer: 'The spell is spoken!', done: onDone });
}

// The station for a job. Items are chosen once per job, so stepping out and back in keeps them.
export function stationFor(g, job) {
  const w = g.world, L = g.lang, keep = L.jobItems || (L.jobItems = {});
  const items = n => keep[job.id] || (keep[job.id] = n());
  const start = L.progress[job.id] || 0;
  const [ex, ey] = w.center(job.at);
  const base = { job: job.id, start, focus: [ex, ey] };
  if (job.id === 'gold') return new Station(g, { ...base, title: 'Claim the gold mine', items: items(() => [L.spell()]), scene: TILES, setup: claimPost, ahead: 2.6,
    ask: () => 'Spell the word to stake your claim!', cheer: 'The gold mine is yours!', done: () => w.claimGold(0) });
  if (job.id === 'drill') return new Station(g, { ...base, title: 'Lay the foundation', items: items(() => [L.sentence(), L.sentence(), L.sentence()]), scene: SOLDIERS, ahead: 3,
    ask: () => 'Tap the soldiers in sentence order!', cheer: 'The foundation is ready. Build it!', done: () => w.layFoundation(job.at.id) });
  if (job.id === 'ceremony') {
    return new Station(g, { ...base, title: 'Age Ceremony', items: items(() => [L.match(), L.match(), L.clue(), L.clue(), L.spell(), L.spell()]), scene: MIXED, ahead: 3.4,
      sub: i => `Age Ceremony · Round ${Math.floor(i / 2) + 1} of 3`, cheer: 'The Mythic Age is coming!', done: () => w.finishCeremony(job.at.id) });
  }
  if (job.id === 'feed') return new Station(g, { ...base, title: 'Feed the creature', items: items(() => [L.clue()]), scene: FOOD, ahead: 3,
    ask: () => 'Which food has the answer?', cheer: 'Your creature is ready!',
    setup: st => {
      const m = g.view.units.model(0, 'creature', w.teams[0].age);
      m.scale.setScalar(1.5); m.rotation.y = Math.PI / 4;
      m.position.copy(st.focus).addScaledVector(new THREE.Vector3(1, 0, 1).normalize(), 1.2);
      if (w.def(0, 'creature').flies) m.position.y = 0.6;
      m.userData.y = m.position.y; st.creature = m; st.group.add(m);
    },
    done: () => w.feedCreature(job.at.id) });
  if (job.id === 'battle') {
    // The army's war banner stands between the army and the warded Town Center.
    const ax = job.army.reduce((s, u) => s + u.x, 0) / job.army.length, ay = job.army.reduce((s, u) => s + u.y, 0) / job.army.length;
    return new Station(g, { ...base, focus: [(ax + ex) / 2, (ay + ey) / 2], title: 'Battle cry', items: items(() => [L.reply()]), scene: BANNERS, ahead: 2.6,
      ask: () => 'The herald asks a question. Raise the right reply!', cheer: 'For our team! The ward is breaking!',
      setup: st => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8), new THREE.MeshStandardMaterial({ color: new THREE.Color('#6a4a2a').convertSRGBToLinear() }));
        pole.position.copy(st.focus).setY(1.6);
        const flag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 1.5), new THREE.MeshStandardMaterial({ color: new THREE.Color(w.teams[0].nation.color).convertSRGBToLinear() }));
        flag.position.copy(st.focus).add(new THREE.Vector3(0, 2.6, 0.75)); flag.rotation.y = Math.PI / 4;
        st.group.add(pole, flag);
      },
      done: () => w.battleCry(0) });
  }
  return null;
}
