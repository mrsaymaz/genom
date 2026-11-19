// The forgotten wonders of the old world. Soldiers capture one by standing near it with no enemy
// soldiers there (more soldiers capture faster, up to three); the owner keeps it until enemy
// soldiers take it back. A held wonder pays its owner a steady trickle:
//   Sun Obelisk  gold          (about 420 gold over 20 minutes)
//   Moonwell     food, and the owner's units near it heal
// Workers do not capture: wonders are a reason to send an army out.
export const WONDERS = {
  obelisk: { name: 'Sun Obelisk', gives: { gold: 0.35 }, info: 'An obelisk of the old world. Keep soldiers near it to capture it: it gives you gold all the time.' },
  moonwell: { name: 'Moonwell', gives: { food: 0.45 }, heal: 2, info: 'A well of moonlight. Keep soldiers near it to capture it: it gives you food, and heals your units nearby.' },
};
export const CAPTURE_R = 4, CAPTURE_TIME = 12;

export function initWonders(w) {
  w.wonders = (w.map.wonders || []).map((d, i) => ({ i, kind: d.kind, x: d.x, y: d.y, owner: null, p: 0, warnT: -99 }));
}

// Soldiers of each team within reach of a wonder.
export function holders(w, o) {
  const n = [0, 0];
  for (const u of w.units()) if (u.type !== 'worker' && Math.hypot(u.x - o.x, u.y - o.y) <= CAPTURE_R) n[u.team]++;
  return n;
}

export function updateWonders(w, dt) {
  for (const o of w.wonders || []) {
    const D = WONDERS[o.kind], n = holders(w, o);
    const rate = k => (1 + 0.5 * (Math.min(3, k) - 1)) / CAPTURE_TIME;
    if (n[0] && !n[1]) o.p = Math.min(1, o.p + rate(n[0]) * dt);
    else if (n[1] && !n[0]) o.p = Math.max(-1, o.p - rate(n[1]) * dt);
    else if (!n[0] && !n[1] && o.owner === null) o.p += (0 - o.p) * Math.min(1, dt / 30) * 3;
    // An enemy is taking our wonder: warn the owner now and then.
    if (o.owner !== null && n[1 - o.owner] && !n[o.owner] && w.time - o.warnT > 20) { o.warnT = w.time; w.events.push({ type: 'wonderUnder', i: o.i, kind: o.kind, team: o.owner, x: o.x, y: o.y }); }
    if (o.owner === 0 && o.p <= 0) { o.owner = null; w.events.push({ type: 'wonderLost', i: o.i, kind: o.kind, team: 0, x: o.x, y: o.y }); }
    if (o.owner === 1 && o.p >= 0) { o.owner = null; w.events.push({ type: 'wonderLost', i: o.i, kind: o.kind, team: 1, x: o.x, y: o.y }); }
    if (o.owner === null && Math.abs(o.p) >= 1) { o.owner = o.p > 0 ? 0 : 1; w.events.push({ type: 'wonderTaken', i: o.i, kind: o.kind, team: o.owner, x: o.x, y: o.y }); }
    if (o.owner === null) continue;
    const t = w.teams[o.owner];
    for (const [k, v] of Object.entries(D.gives)) { t.res[k] += v * dt; t.stats.wonder = (t.stats.wonder || 0) + v * dt; }
    if (D.heal) for (const u of w.units()) if (u.team === o.owner && u.hp < u.maxHp && Math.hypot(u.x - o.x, u.y - o.y) <= CAPTURE_R + 1) u.hp = Math.min(u.maxHp, u.hp + D.heal * dt);
  }
}
