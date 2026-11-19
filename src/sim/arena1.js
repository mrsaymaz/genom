// Wildmere Valley: the map of Arena 1 (Dark Age to Mythic Age). A larger cousin of the tutorial's
// Sunmeadow Vale (96 tiles across instead of 72), made for a match of about 20 minutes: a river
// with five fords down the middle, mountains along the edges, and on each side a home valley
// with places worth expanding to:
//   - a palm oasis with a pond, dates and gold, where wild boars wallow;
//   - a forest site with gold and berries, watched by a wolf pack;
//   - a gold mine under the southern mountains, guarded by a cave bear;
//   - the ruins of an old shrine with a hoard of gold, where a stone troll sleeps;
//   - a walled garden with a fountain, where wounded units heal;
//   - a circle of standing stones with a floating sky shard, an open site with gold, and two
//     mines near the fords.
// And the old world's leftovers: the river springs from waterfalls in the corner gorges, a
// waterfall drops off the west wall into a hidden pool, old stone bridges span the outer fords
// (no slowdown), the Twin Kings stand in the river by the middle ford, a dragon's skeleton lies in
// the eastern meadow, a broken gate arches over the road, fairy rings (which heal, like the
// garden) and glowing crystals dot the land. Two kinds of ancient wonder can be captured: the Sun
// Obelisk (a trickle of gold) and the Moonwell (food, and it heals its owner's units).
// The map is point-symmetric (the rival's half mirrors the player's), so neither side is ahead.
import { rng } from './rng.js';
import { T } from './map.js';

export function generateArena1(size = 96, seed = 11) {
  const S = size, r = rng(seed), k = S / 48;
  const terrain = new Uint8Array(S * S), taken = new Uint8Array(S * S), soft = new Uint8Array(S * S);
  const idx = (x, y) => y * S + x;
  const inside = (x, y) => x >= 0 && y >= 0 && x < S && y < S;
  const mirror = (x, y) => [S - 1 - x, S - 1 - y];
  const at = (x, y) => (inside(x, y) ? terrain[idx(x, y)] : T.ROCK);
  // Sets a tile and its mirror.
  const set2 = (x, y, t) => { if (!inside(x, y)) return; terrain[idx(x, y)] = t; const [a, b] = mirror(x, y); terrain[idx(a, b)] = t; };
  // Marks a box (and its mirror) in a mask: `taken` is hard (no resources), `soft` keeps open
  // ground (no mountains, scattered forests or rocks).
  const mark = (arr, x0, y0, w, h, pad = 0) => {
    for (let y = y0 - pad; y < y0 + h + pad; y++) for (let x = x0 - pad; x < x0 + w + pad; x++) if (inside(x, y)) { arr[idx(x, y)] = 1; const [a, b] = mirror(x, y); arr[idx(a, b)] = 1; }
  };
  const markCircle = (arr, cx, cy, rad) => { for (let y = Math.floor(cy - rad); y <= cy + rad; y++) for (let x = Math.floor(cx - rad); x <= cx + rad; x++) if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= rad) mark(arr, x, y, 1, 1); };

  // Smooth value noise for natural edges (a coarse random grid, blended).
  const N = 17, grid = Array.from({ length: N * N }, () => r());
  const noise = (x, y) => {
    const gx = (x / S) * (N - 1), gy = (y / S) * (N - 1), x0 = Math.min(N - 2, Math.floor(gx)), y0 = Math.min(N - 2, Math.floor(gy)), fx = gx - x0, fy = gy - y0;
    const g = (i, j) => grid[(y0 + j) * N + x0 + i];
    return (g(0, 0) * (1 - fx) + g(1, 0) * fx) * (1 - fy) + (g(0, 1) * (1 - fx) + g(1, 1) * fx) * fy;
  };

  // ---- the river and its fords ----
  const riverAt = t => [t * (S - 1) + Math.sin(t * Math.PI * 4) * 3.2 * k, t * (S - 1) - Math.sin(t * Math.PI * 4) * 3.2 * k];
  for (let i = 0; i < S * 3; i++) {
    const t = i / (S * 3 - 1), [cx, cy] = riverAt(t), w = 1.6 + Math.cos(t * Math.PI * 6) * 0.3;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const x = Math.round(cx + dx), y = Math.round(cy + dy);
      if (inside(x, y) && Math.hypot(dx, dy) <= w) terrain[idx(x, y)] = T.WATER;
    }
  }
  const fords = [0.15, 0.335, 0.5, 0.665, 0.85].map(t => riverAt(t).map(Math.round));
  for (const [fx, fy] of fords) for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
    const x = fx + dx, y = fy + dy;
    if (inside(x, y) && terrain[idx(x, y)] === T.WATER && Math.abs(dx - dy) <= 4) terrain[idx(x, y)] = T.FORD;
  }
  const symmetrize = () => { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (y - x < 0 || (y === x && x >= S / 2)) { const [x2, y2] = mirror(x, y); terrain[idx(x, y)] = terrain[idx(x2, y2)]; } };
  symmetrize();
  for (let i = 0; i < fords.length >> 1; i++) fords[fords.length - 1 - i] = mirror(...fords[i]);

  // ---- bases and the open ground around them ----
  const B = { x: 8, y: S - 14 };
  const [mx, my] = mirror(B.x + 3, B.y + 3);
  const bases = [B, { x: mx, y: my }];
  const home = [B.x + 2, B.y + 2];
  mark(taken, B.x, B.y, 4, 4, 3);
  markCircle(soft, home[0], home[1], 12);
  // Clear lanes from the base to the three middle fords, so mountains never close the way.
  const lane = (ax, ay, bx, by, rad) => { const n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2); for (let i = 0; i <= n; i++) { const t = i / n; markCircle(soft, ax + (bx - ax) * t, ay + (by - ay) * t, rad); } };
  for (const f of fords.slice(1, 4)) lane(home[0], home[1], f[0] + 0.5, f[1] + 0.5, 2.5);
  for (const [fx, fy] of fords) { mark(taken, fx - 2, fy - 2, 5, 5, 1); markCircle(soft, fx + 0.5, fy + 0.5, 5); }

  // ---- resources ----
  const resources = [], decor = [], lairs = [], wonders = [];
  const free = (x0, y0, w, h, ok = [T.GRASS]) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { if (!inside(x, y) || taken[idx(x, y)] || !ok.includes(terrain[idx(x, y)])) return false; } return true; };
  // A resource on the player's half and its mirror on the rival's.
  const place = (kind, x, y, w, h, amount, ok) => {
    const [x2, y2] = mirror(x + w - 1, y + h - 1);
    if (!free(x, y, w, h, ok) || !free(x2, y2, w, h, ok)) return false;
    resources.push({ kind, x, y, w, h, amount }, { kind, x: x2, y: y2, w, h, amount });
    mark(taken, x, y, w, h);
    return true;
  };
  const placeNear = (kind, cx, cy, w, h, amount, tries = 16, spread = 3) => { for (let i = 0; i < tries; i++) { const s = i === 0 ? 0 : spread; if (place(kind, Math.round(cx + (r() - 0.5) * 2 * s), Math.round(cy + (r() - 0.5) * 2 * s), w, h, amount)) return true; } return false; };
  // A grove: n trees scattered in a disc. Wild groves keep off open ground.
  const grove = (cx, cy, rad, n, wild = false) => {
    for (let i = 0; i < n * 4 && n > 0; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rad, x = Math.round(cx + Math.cos(a) * d), y = Math.round(cy + Math.sin(a) * d);
      if (wild && (!inside(x, y) || soft[idx(x, y)])) continue;
      if (place('tree', x, y, 1, 1, 90)) n--;
    }
  };
  const berries = (cx, cy, n, ok) => { let got = 0; for (let i = 0; i < n * 6 && got < n; i++) if (place('berries', Math.round(cx + (r() - 0.5) * 4), Math.round(cy + (r() - 0.5) * 3), 1, 1, 150, ok)) got++; };
  // Decor on both halves (the rival's copy turned half a circle). Solid decor blocks its tile.
  const deco = (kind, x, y, o = {}) => {
    const solid = !!o.solid, tx = Math.floor(x), ty = Math.floor(y);
    if (solid) { if (!inside(tx, ty) || taken[idx(tx, ty)]) return false; set2(tx, ty, T.DECOR); mark(taken, tx, ty, 1, 1); }
    const s = o.s ?? 1, a = o.a ?? r() * Math.PI * 2;
    decor.push({ kind, x, y, s, a }, { kind, x: S - x, y: S - y, s, a: a + Math.PI });
    return true;
  };
  const lair = (kind, x, y, n) => lairs.push({ kind, x, y, n }, { kind, x: S - x, y: S - y, n });

  // Home: two gold mines, berries and groves.
  place('gold', B.x - 3, B.y - 6, 2, 2, 1500);
  for (const [dx, dy] of [[7, 1], [8, 2], [7, 3], [8, 0], [9, 3], [8, 4], [9, 1]]) place('berries', B.x + dx, B.y + dy, 1, 1, 150);
  for (const [dx, dy] of [[12, 6], [11, 7], [13, 5], [10, 8]]) if (place('gold', B.x + dx, B.y + dy, 2, 2, 1200)) break;
  grove(B.x - 3, B.y + 8, 3.6, 26);
  grove(B.x + 7, B.y + 10, 3.0, 20);
  grove(B.x - 5, B.y - 1, 2.2, 9);

  // The palm oasis: sand around a pond, dates, a gold mine and a wallow of boars.
  const O = [11.5, 33.5];
  for (let y = Math.floor(O[1] - 7); y <= O[1] + 7; y++) for (let x = Math.floor(O[0] - 8); x <= O[0] + 8; x++) {
    if (!inside(x, y) || at(x, y) !== T.GRASS) continue;
    const e = Math.hypot((x + 0.5 - O[0]) / 6.6, (y + 0.5 - O[1]) / 5.6) + (noise(x, y) - 0.5) * 0.3;
    if (e <= 0.42) { set2(x, y, T.WATER); mark(taken, x, y, 1, 1); } else if (e <= 1) set2(x, y, T.SAND);
  }
  markCircle(soft, O[0], O[1], 8.5);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + r() * 0.3, d = 3.8 + r() * 1.3; deco('palm', O[0] + Math.cos(a) * d, O[1] + Math.sin(a) * d * 0.85, { s: 0.85 + r() * 0.35 }); }
  berries(O[0] + 4, O[1] - 3.5, 5, [T.SAND, T.GRASS]);
  placeNear('gold', O[0] + 6.5, O[1] + 1, 2, 2, 1500, 20, 2);
  deco('wallow', O[0] - 2.5, O[1] + 4.6, { s: 1.2 });
  lair('boar', O[0] - 2.5, O[1] + 4.6, 2);

  // The forest site: gold, berries and a grove, with a wolf den in the trees.
  const A = [15.5, 47.5];
  markCircle(soft, A[0], A[1], 5);
  placeNear('gold', A[0], A[1], 2, 2, 1500);
  berries(A[0] + 4, A[1] - 1, 5);
  grove(A[0] - 6, A[1] + 3, 3.4, 18);
  deco('den', A[0] - 3.5, A[1] + 2.5, { solid: true, a: Math.PI * 0.25 });
  lair('wolf', A[0] - 2.5, A[1] + 1.5, 3);

  // The open site to the south-east: gold, berries and a grove, unguarded.
  const Bs = [60.5, 85.5];
  markCircle(soft, Bs[0], Bs[1], 5);
  placeNear('gold', Bs[0], Bs[1], 2, 2, 1500);
  berries(Bs[0] + 4, Bs[1] - 1, 5);
  grove(Bs[0] - 4, Bs[1] + 4, 3, 14);

  // The cave bear's mine under the southern mountains.
  const bear = [37, 86];
  markCircle(soft, bear[0] + 1, bear[1] + 1, 3.5);
  placeNear('gold', bear[0], bear[1], 2, 2, 1800, 10, 1);
  deco('cave', bear[0] + 3.5, bear[1] + 3.5, { solid: true, a: -Math.PI * 0.75, s: 1.3 });
  lair('bear', bear[0] + 3, bear[1] + 2.2, 1);

  // Contested gold near the fords.
  placeNear('gold', fords[1][0] - 7, fords[1][1] + 4, 2, 2, 1800);
  placeNear('gold', fords[2][0] - 9, fords[2][1] + 3, 2, 2, 1500);

  // The ruined shrine: old paving, a ring of pillars, the hoard and its sleeping troll.
  const R = [57.5, 73.5];
  for (let y = Math.floor(R[1] - 5); y <= R[1] + 5; y++) for (let x = Math.floor(R[0] - 5); x <= R[0] + 5; x++) if (at(x, y) === T.GRASS && Math.hypot(x + 0.5 - R[0], y + 0.5 - R[1]) <= 4.6) set2(x, y, T.PAVE);
  markCircle(soft, R[0], R[1], 6);
  resources.push({ kind: 'gold', x: Math.floor(R[0]) - 1, y: Math.floor(R[1]) - 1, w: 2, h: 2, amount: 3000 });
  { const [x2, y2] = mirror(Math.floor(R[0]), Math.floor(R[1])); resources.push({ kind: 'gold', x: x2, y: y2, w: 2, h: 2, amount: 3000 }); }
  for (let y = Math.floor(R[1]) - 1; y <= Math.floor(R[1]); y++) for (let x = Math.floor(R[0]) - 1; x <= Math.floor(R[0]); x++) { set2(x, y, T.GRASS); mark(taken, x, y, 1, 1); }
  for (let i = 0; i < 12; i++) {
    if (i === 1 || i === 6 || i === 9) continue; // gaps to walk through
    const a = (i / 12) * Math.PI * 2, x = R[0] + Math.cos(a) * 4.1, y = R[1] + Math.sin(a) * 4.1;
    deco(r() < 0.35 ? 'broken' : 'pillar', Math.floor(x) + 0.5, Math.floor(y) + 0.5, { solid: true, s: 0.9 + r() * 0.25 });
  }
  deco('statue', R[0] - 2.5, R[1] - 2.5, { solid: true, a: Math.PI * 0.25 });
  lair('troll', R[0] + 2, R[1] + 1, 1);

  // The walled garden: lawns, hedges with four gates, flower beds, cypresses and a fountain.
  const G = { x: 37, y: 75, w: 11, h: 7 };
  for (let y = G.y; y < G.y + G.h; y++) for (let x = G.x; x < G.x + G.w; x++) if (at(x, y) === T.GRASS && !taken[idx(x, y)]) set2(x, y, T.GARDEN);
  markCircle(soft, G.x + G.w / 2, G.y + G.h / 2, 7);
  const gx = G.x + (G.w >> 1), gy = G.y + (G.h >> 1);
  for (let y = G.y; y < G.y + G.h; y++) for (let x = G.x; x < G.x + G.w; x++) {
    const edge = x === G.x || y === G.y || x === G.x + G.w - 1 || y === G.y + G.h - 1, gate = Math.abs(x - gx) <= 0 || Math.abs(y - gy) <= 0;
    if (edge && !gate && at(x, y) === T.GARDEN) deco('hedge', x + 0.5, y + 0.5, { solid: true, a: (y === G.y || y === G.y + G.h - 1) ? 0 : Math.PI / 2 });
  }
  deco('fountain', gx + 0.5, gy + 0.5, { solid: true, a: 0 });
  for (const [dx, dy] of [[-3, -1], [3, -1], [-3, 1], [3, 1]]) deco('bed', gx + dx + 0.5, gy + dy + 0.5, { a: 0 });
  for (const [dx, dy] of [[-4, -2], [4, -2], [-4, 2], [4, 2]]) deco('cypress', gx + dx + 0.5, gy + dy + 0.5, { solid: true });

  // A circle of standing stones on the west meadow.
  const C = [5.5, 70.5];
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; deco('stone', Math.floor(C[0] + Math.cos(a) * 3) + 0.5, Math.floor(C[1] + Math.sin(a) * 3) + 0.5, { solid: true, s: 0.9 + r() * 0.3, a: a + Math.PI / 2 }); }
  deco('altar', C[0], C[1], { solid: true, a: 0 });

  // ---- the old world ----
  // The river springs from waterfalls in the two corner gorges: the corner is solid rock.
  for (let y = 0; y < 10; y++) for (let x = 0; x < 10; x++) if (x + y < 9.5) { set2(x, y, T.MOUNT); mark(taken, x, y, 1, 1); }
  {
    const t = 0.052, [fx, fy] = riverAt(t), [ax, ay] = riverAt(t + 0.01);
    deco('falls', fx, fy, { a: Math.atan2(ay - fy, ax - fx), s: 1.15 });
  }
  // The Mistfall: a waterfall off the west wall into a hidden pool.
  const P = [7.5, 57.5];
  for (let y = 54; y < 62; y++) for (let x = 4; x < 12; x++) if (at(x, y) === T.GRASS && Math.hypot((x + 0.5 - P[0]) / 1.3, y + 0.5 - P[1]) <= 2) { set2(x, y, T.WATER); mark(taken, x, y, 1, 1); }
  markCircle(soft, P[0], P[1], 2.6);
  for (let y = 55; y < 61; y++) for (let x = 0; x < 4; x++) if (at(x, y) === T.GRASS) { set2(x, y, T.MOUNT); mark(taken, x, y, 1, 1); }
  deco('falls', 4.1, P[1], { a: 0, s: 0.8 });
  // Old stone bridges across the outer fords: the crossing there is as quick as dry land.
  for (const ft of [0.15]) {
    const [cx, cy] = riverAt(ft), [nx, ny] = riverAt(ft + 0.002), len = Math.hypot(nx - cx, ny - cy), ux = (nx - cx) / len, uy = (ny - cy) / len;
    for (let y = Math.floor(cy) - 6; y <= cy + 6; y++) for (let x = Math.floor(cx) - 6; x <= cx + 6; x++) {
      if (!inside(x, y) || (at(x, y) !== T.FORD && at(x, y) !== T.WATER)) continue;
      const along = (x + 0.5 - cx) * ux + (y + 0.5 - cy) * uy, across = Math.abs((x + 0.5 - cx) * -uy + (y + 0.5 - cy) * ux);
      if (Math.abs(along) <= 1.25 && across <= 3.2) set2(x, y, T.BRIDGE);
    }
    deco('bridge', cx, cy, { a: Math.atan2(ux, -uy), s: 1 });
  }
  // The Twin Kings: giant statues standing in the river on each side of the middle ford.
  {
    const [cx, cy] = riverAt(0.5), [nx, ny] = riverAt(0.502), d = Math.hypot(nx - cx, ny - cy), ux = (nx - cx) / d, uy = (ny - cy) / d;
    deco('king', cx - ux * 7.2, cy - uy * 7.2, { a: Math.atan2(-uy, -ux), s: 1.3 });
  }
  // A dragon's skeleton in the eastern meadow: walk between its ribs, but not through its skull.
  {
    const D = [66.5, 79.5], a = -Math.PI / 4;
    markCircle(soft, D[0], D[1], 5);
    deco('dragon', D[0], D[1], { a, s: 1.25 });
    for (const k of [4.0, 4.8]) { const x = D[0] + Math.cos(a) * k, y = D[1] + Math.sin(a) * k; deco('none', Math.floor(x) + 0.5, Math.floor(y) + 0.5, { solid: true }); }
  }
  // A broken gate of the old kings on the meadow beside the road to the middle ford, turned to
  // face the camera so its arch reads from the usual view.
  {
    const gx = 22.5, gy = 69.5, dx = Math.SQRT1_2, dy = -Math.SQRT1_2;
    markCircle(soft, gx, gy, 3.2);
    deco('gate', gx, gy, { a: Math.atan2(dy, dx), s: 1 });
    for (const sgn of [-1, 1]) deco('none', Math.floor(gx + dx * 2.4 * sgn) + 0.5, Math.floor(gy + dy * 2.4 * sgn) + 0.5, { solid: true });
  }
  // The sky shard floats over the standing stones' altar.
  deco('shard', C[0], C[1], { a: 0, s: 1 });
  // The capturable wonders. Each stands on 2x2 solid tiles with open ground around it.
  const wonder = (kind, x, y) => {
    markCircle(soft, x, y, 5);
    for (let yy = y - 1; yy <= y; yy++) for (let xx = x - 1; xx <= x; xx++) { set2(xx, yy, T.DECOR); }
    mark(taken, x - 1, y - 1, 2, 2, 2);
    wonders.push({ kind, x, y }, { kind, x: S - x, y: S - y });
  };
  wonder('obelisk', 50, 61);
  wonder('moonwell', 24, 77);

  // ---- mountains ----
  const blob = (cx, cy, rx, ry) => {
    for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
      if (!inside(x, y) || soft[idx(x, y)] || taken[idx(x, y)] || at(x, y) !== T.GRASS) continue;
      const e = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry) + (noise(x, y) - 0.5) * 0.7;
      if (e <= 1) { const [a, b] = mirror(x, y); if (taken[idx(a, b)] || at(a, b) !== T.GRASS) continue; set2(x, y, T.MOUNT); }
    }
  };
  const ridge = (ax, ay, bx, by, rad) => { const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 1.5); for (let i = 0; i <= n; i++) { const t = i / n, w = rad * (0.75 + r() * 0.5); blob(ax + (bx - ax) * t, ay + (by - ay) * t, w, w); } };
  blob(2, 15, 6, 9); blob(8, 20, 4, 4); // the north-west massif, behind the oasis
  ridge(0, 51, 0, 62, 3.6); // the west wall
  ridge(22, 96, 56, 96, 4.2); blob(45, 92, 5, 3); // the southern range above the bear's mine
  ridge(0, 88, 0, 96, 3); // the corner behind the base
  for (let i = 0, made = 0; i < 40 && made < 7; i++) { // lone peaks across the meadow
    const x = 4 + r() * (S - 8), y = 4 + r() * (S - 8);
    if (y - x < 18 || soft[idx(Math.floor(x), Math.floor(y))]) continue;
    blob(x, y, 1.8 + r() * 1.6, 1.8 + r() * 1.6); made++;
  }

  // Glowing crystals at the foot of the mountains, and fairy rings on quiet meadows.
  for (let i = 0, n = 0; i < 400 && n < 7; i++) {
    const x = 2 + Math.floor(r() * (S - 4)), y = 2 + Math.floor(r() * (S - 4));
    if (y - x < 6 || at(x, y) !== T.GRASS || taken[idx(x, y)] || soft[idx(x, y)]) continue;
    if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(x + dx, y + dy) === T.MOUNT)) continue;
    if (deco('crystal', x + 0.5, y + 0.5, { solid: true, s: 0.8 + r() * 0.4 })) n++;
  }
  for (let i = 0, n = 0; i < 300 && n < 2; i++) {
    const x = 3 + Math.floor(r() * (S - 6)), y = 3 + Math.floor(r() * (S - 6));
    if (y - x < 10) continue;
    let ok = true;
    for (let yy = y - 1; yy <= y + 1 && ok; yy++) for (let xx = x - 1; xx <= x + 1; xx++) if (at(xx, yy) !== T.GRASS || taken[idx(xx, yy)] || soft[idx(xx, yy)]) { ok = false; break; }
    if (!ok) continue;
    const [mx2, my2] = mirror(x, y);
    for (let yy = -1; yy <= 1; yy++) for (let xx = -1; xx <= 1; xx++) if (at(mx2 + xx, my2 + yy) !== T.GRASS) ok = false;
    if (!ok) continue;
    for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++) set2(xx, yy, T.GARDEN);
    mark(taken, x - 1, y - 1, 3, 3); markCircle(soft, x + 0.5, y + 0.5, 2.5);
    deco('ring', x + 0.5, y + 0.5, { s: 1 }); n++;
  }

  // ---- forests and rocks ----
  for (const [x, y, rad, n] of [[2, 78, 3.5, 26], [20, 91, 3.4, 24], [29, 59, 3.5, 22], [3, 41, 3, 18], [52, 57, 3, 18], [72, 91, 4, 28], [84, 93, 3, 18], [26, 30, 3, 16], [44, 64, 2.6, 12]]) grove(x, y, rad, n, true);
  for (let g = 0; g < Math.round(12 * k * k); g++) { const cx = 2 + r() * (S - 4), cy = 2 + r() * (S - 4); if (cy - cx > 8) grove(cx, cy, 2.2 + r() * 2.2, 9 + Math.floor(r() * 10), true); }
  for (let n = 0; n < Math.round(9 * k * k); n++) {
    const x = Math.floor(r() * S), y = Math.floor(r() * S);
    if (y - x <= 6 || !free(x, y, 2, 2) || soft[idx(x, y)]) continue;
    const [x2, y2] = mirror(x + 1, y + 1); if (!free(x2, y2, 2, 2)) continue;
    for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) if (r() < 0.85 || (xx === 0 && yy === 0)) set2(x + xx, y + yy, T.ROCK);
    mark(taken, x, y, 2, 2);
  }
  symmetrize();

  return { size: S, terrain, bases, resources, fords, decor, lairs, wonders, name: 'Wildmere Valley' };
}
