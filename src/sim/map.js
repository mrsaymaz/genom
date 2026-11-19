// Sunmeadow Vale: the invented tutorial landscape. A meadow split by a river with fords (three
// on the small map, five on the large one), the player's base on the left of the screen and the
// rival's across the river on the right. Each side has a home gold mine and, on the large map, a
// second mine and two outlying sites with gold, berries and a grove worth claiming, plus a pond.
// The map is point-symmetric, so neither base has an advantage.
import { rng } from './rng.js';

// Terrain. Walkable: grass, fords, sand, garden lawns, old paving and stone bridges (no slowdown). Blocked: water, rocks,
// mountains and decor tiles (standing stones, pillars, hedges, fountains, dens). Only grass can be
// built on.
export const T = { GRASS: 0, WATER: 1, FORD: 2, ROCK: 3, MOUNT: 4, SAND: 5, GARDEN: 6, DECOR: 7, PAVE: 8, BRIDGE: 9 };
export const SOLID = new Set([T.WATER, T.ROCK, T.MOUNT, T.DECOR]);

export function generateMap(size, seed) {
  const r = rng(seed);
  const terrain = new Uint8Array(size * size);
  const idx = (x, y) => y * size + x;
  const inside = (x, y) => x >= 0 && y >= 0 && x < size && y < size;
  const mirror = (x, y) => [size - 1 - x, size - 1 - y];
  const k = size / 48, large = size >= 64; // the river and the scatter grow with the map

  // River from the north-west corner to the south-east corner, meandering across the diagonal.
  for (let i = 0; i < size * 3; i++) {
    const t = i / (size * 3 - 1);
    const cx = t * (size - 1) + Math.sin(t * Math.PI * 4) * 3.2 * k;
    const cy = t * (size - 1) - Math.sin(t * Math.PI * 4) * 3.2 * k;
    const w = 1.3 + Math.cos(t * Math.PI * 6) * 0.25;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const x = Math.round(cx + dx), y = Math.round(cy + dy);
      if (inside(x, y) && Math.hypot(dx, dy) <= w) terrain[idx(x, y)] = T.WATER;
    }
  }
  // Fords, wide enough for a group to cross.
  const fordAt = large ? [0.17, 0.335, 0.5, 0.665, 0.83] : [0.27, 0.5, 0.73];
  const fords = fordAt.map(t => [Math.round(t * (size - 1) + Math.sin(t * Math.PI * 4) * 3.2 * k), Math.round(t * (size - 1) - Math.sin(t * Math.PI * 4) * 3.2 * k)]);
  for (const [fx, fy] of fords) for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
    const x = fx + dx, y = fy + dy;
    if (inside(x, y) && terrain[idx(x, y)] === T.WATER && Math.abs(dx - dy) <= 3) terrain[idx(x, y)] = T.FORD;
  }

  // Make the river and fords exactly point-symmetric: the north-east half copies the south-west half.
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (y - x < 0 || (y === x && x >= size / 2)) { const [x2, y2] = mirror(x, y); terrain[idx(x, y)] = terrain[idx(x2, y2)]; }
  for (let i = 0; i < fords.length >> 1; i++) fords[fords.length - 1 - i] = mirror(...fords[i]);

  // Bases (top-left tile of the 4x4 Town Center).
  const bases = [{ x: 6, y: size - 11 }, null];
  const [mx, my] = mirror(bases[0].x + 3, bases[0].y + 3);
  bases[1] = { x: mx, y: my };

  const resources = [];
  const taken = new Uint8Array(size * size);
  const reserve = (x0, y0, w, h, pad) => { for (let y = y0 - pad; y < y0 + h + pad; y++) for (let x = x0 - pad; x < x0 + w + pad; x++) if (inside(x, y)) taken[idx(x, y)] = 1; };
  const free = (x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { if (!inside(x, y) || taken[idx(x, y)] || terrain[idx(x, y)] !== T.GRASS) return false; } return true; };
  for (const b of bases) reserve(b.x, b.y, 4, 4, 3);
  // Keep a clear lane from each base to the middle ford.
  const clearLine = (ax, ay, bx, by) => { for (let i = 0; i <= 40; i++) { const t = i / 40; const x = Math.round(ax + (bx - ax) * t), y = Math.round(ay + (by - ay) * t); reserve(x - 1, y - 1, 3, 3, 0); } };
  const mid = fords[fords.length >> 1];
  clearLine(bases[0].x + 2, bases[0].y + 2, mid[0], mid[1]);
  clearLine(bases[1].x + 2, bases[1].y + 2, mid[0], mid[1]);
  for (const [fx, fy] of fords) reserve(fx - 2, fy - 2, 5, 5, 1);

  // Place a resource on the south-west half, then mirror it to the north-east.
  const place = (kind, x, y, w, h, amount) => {
    const [x2, y2] = mirror(x + w - 1, y + h - 1);
    if (!free(x, y, w, h) || !free(x2, y2, w, h)) return false;
    resources.push({ kind, x, y, w, h, amount });
    resources.push({ kind, x: x2, y: y2, w, h, amount });
    reserve(x, y, w, h, 0); reserve(x2, y2, w, h, 0);
    return true;
  };
  const B = bases[0];
  // Home gold mine (enough for all four ages), berries and two groves.
  place('gold', B.x - 3, B.y - 6, 2, 2, 1500);
  for (const [dx, dy] of [[7, 1], [8, 2], [7, 3], [8, 0], [9, 3], [8, 4]]) place('berries', B.x + dx, B.y + dy, 1, 1, 150);
  const grove = (cx, cy, rad, n) => { for (let k = 0; k < n * 4 && n > 0; k++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rad; if (place('tree', Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), 1, 1, 90)) n--; } };
  grove(B.x - 3, B.y + 7, 3.4, 22);
  grove(B.x + 8, B.y + 8, 3.0, 18);
  grove(B.x - 4, B.y - 1, 2.0, 7);
  // Contested middle gold, near the side fords.
  const side = large ? fords[1] : fords[0];
  place('gold', side[0] - 6, side[1] + 3, 2, 2, 1800);
  if (large) {
    // A second home mine, and two outlying sites: gold, berries and a grove at each.
    for (const [dx, dy] of [[10, 6], [11, 6], [12, 5], [9, 7]]) if (place('gold', B.x + dx, B.y + dy, 2, 2, 1200)) break;
    const site = (cx, cy) => {
      for (let tries = 0; tries < 12; tries++) if (place('gold', Math.round(cx + (r() - 0.5) * 4), Math.round(cy + (r() - 0.5) * 4), 2, 2, 1500)) break;
      let n = 0; for (let tries = 0; tries < 40 && n < 5; tries++) if (place('berries', Math.round(cx + 3 + r() * 3), Math.round(cy - 2 + r() * 4), 1, 1, 150)) n++;
      grove(cx - 4, cy + 3, 3, 14);
    };
    site(size * 0.1, size * 0.32);
    site(size * 0.52, size * 0.85);
    // A pond on each side.
    const pond = (cx, cy, rad) => {
      for (let y = Math.floor(cy - rad); y <= cy + rad; y++) for (let x = Math.floor(cx - rad); x <= cx + rad; x++) {
        if (!inside(x, y) || Math.hypot((x - cx) / 1.4, y - cy) > rad || !free(x, y, 1, 1)) continue;
        const [x2, y2] = mirror(x, y); if (!free(x2, y2, 1, 1)) continue;
        terrain[idx(x, y)] = terrain[idx(x2, y2)] = T.WATER; reserve(x, y, 1, 1, 1); reserve(x2, y2, 1, 1, 1);
      }
    };
    pond(size * 0.36, size * 0.68, 2.6);
  }
  // Scattered groves and rocky outcrops across the meadow.
  for (let g = 0; g < Math.round(7 * k * k); g++) { const cx = 2 + r() * (size - 4), cy = 2 + r() * (size - 4); if (cy - cx > 6) grove(cx, cy, 2 + r() * 2, 6 + Math.floor(r() * 8)); }
  for (let n = 0; n < Math.round(9 * k * k); n++) {
    const x = Math.floor(r() * size), y = Math.floor(r() * size);
    if (y - x > 5 && free(x, y, 2, 2)) { const [x2, y2] = mirror(x + 1, y + 1); if (free(x2, y2, 2, 2)) { for (const [ax, ay] of [[x, y], [x2, y2]]) for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) if (r() < 0.85 || (xx === 0 && yy === 0)) terrain[idx(ax + xx, ay + yy)] = T.ROCK; reserve(x, y, 2, 2, 0); reserve(x2, y2, 2, 2, 0); } }
  }
  // Mirror rocks exactly (the loop above can leave a mismatch when the random skip differs).
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (terrain[idx(x, y)] === T.ROCK) { const [x2, y2] = mirror(x, y); terrain[idx(x2, y2)] = T.ROCK; }

  return { size, terrain, bases, resources, fords, decor: [], lairs: [], wonders: [], name: 'Sunmeadow Vale' };
}
