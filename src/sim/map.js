// Sunmeadow Vale: the invented tutorial landscape. A meadow split by a river with three
// fords, the player's base on the left of the screen and the rival's across the river on the right. The map is
// point-symmetric, so neither base has an advantage.
import { rng } from './rng.js';

export const T = { GRASS: 0, WATER: 1, FORD: 2, ROCK: 3 };

export function generateMap(size, seed) {
  const r = rng(seed);
  const terrain = new Uint8Array(size * size);
  const idx = (x, y) => y * size + x;
  const inside = (x, y) => x >= 0 && y >= 0 && x < size && y < size;
  const mirror = (x, y) => [size - 1 - x, size - 1 - y];

  // River from the north-west corner to the south-east corner, meandering across the diagonal.
  for (let i = 0; i < size * 3; i++) {
    const t = i / (size * 3 - 1);
    const cx = t * (size - 1) + Math.sin(t * Math.PI * 4) * 3.2;
    const cy = t * (size - 1) - Math.sin(t * Math.PI * 4) * 3.2;
    const w = 1.3 + Math.cos(t * Math.PI * 6) * 0.25;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const x = Math.round(cx + dx), y = Math.round(cy + dy);
      if (inside(x, y) && Math.hypot(dx, dy) <= w) terrain[idx(x, y)] = T.WATER;
    }
  }
  // Three fords, wide enough for a group to cross.
  const fords = [0.27, 0.5, 0.73].map(t => [Math.round(t * (size - 1) + Math.sin(t * Math.PI * 4) * 3.2), Math.round(t * (size - 1) - Math.sin(t * Math.PI * 4) * 3.2)]);
  for (const [fx, fy] of fords) for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
    const x = fx + dx, y = fy + dy;
    if (inside(x, y) && terrain[idx(x, y)] === T.WATER && Math.abs(dx - dy) <= 3) terrain[idx(x, y)] = T.FORD;
  }

  // Make the river and fords exactly point-symmetric: the north-east half copies the south-west half.
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (y - x < 0 || (y === x && x >= size / 2)) { const [x2, y2] = mirror(x, y); terrain[idx(x, y)] = terrain[idx(x2, y2)]; }
  fords[2] = mirror(...fords[0]);

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
  const mid = fords[1];
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
  // Home gold mine, berries and two groves.
  place('gold', B.x - 3, B.y - 6, 2, 2, 900);
  for (const [dx, dy] of [[7, 1], [8, 2], [7, 3], [8, 0], [9, 3], [8, 4]]) place('berries', B.x + dx, B.y + dy, 1, 1, 150);
  const grove = (cx, cy, rad, n) => { for (let k = 0; k < n * 4 && n > 0; k++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * rad; if (place('tree', Math.round(cx + Math.cos(a) * d), Math.round(cy + Math.sin(a) * d), 1, 1, 90)) n--; } };
  grove(B.x - 3, B.y + 7, 3.4, 22);
  grove(B.x + 8, B.y + 8, 3.0, 18);
  grove(B.x - 4, B.y - 1, 2.0, 7);
  // Contested middle gold, near the side fords.
  place('gold', fords[0][0] - 6, fords[0][1] + 3, 2, 2, 1200);
  // Scattered groves and rocky outcrops across the meadow.
  for (let g = 0; g < 7; g++) { const cx = 2 + r() * (size - 4), cy = 2 + r() * (size - 4); if (cy - cx > 6) grove(cx, cy, 2 + r() * 2, 6 + Math.floor(r() * 8)); }
  for (let k = 0; k < 9; k++) {
    const x = Math.floor(r() * size), y = Math.floor(r() * size);
    if (y - x > 5 && free(x, y, 2, 2)) { const [x2, y2] = mirror(x + 1, y + 1); if (free(x2, y2, 2, 2)) { for (const [ax, ay] of [[x, y], [x2, y2]]) for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) if (r() < 0.85 || (xx === 0 && yy === 0)) terrain[idx(ax + xx, ay + yy)] = T.ROCK; reserve(x, y, 2, 2, 0); reserve(x2, y2, 2, 2, 0); } }
  }
  // Mirror rocks exactly (the loop above can leave a mismatch when the random skip differs).
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (terrain[idx(x, y)] === T.ROCK) { const [x2, y2] = mirror(x, y); terrain[idx(x2, y2)] = T.ROCK; }

  return { size, terrain, bases, resources, fords, name: 'Sunmeadow Vale' };
}
