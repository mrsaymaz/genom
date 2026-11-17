// Grid A* with eight directions. Diagonal moves never cut a blocked corner.
// isBlocked(x, y) says whether a tile can be walked; goals is a Set of tile indexes to reach.

const SQ2 = Math.SQRT2;

class Heap {
  constructor() { this.a = []; }
  push(n) { const a = this.a; a.push(n); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p].f <= n.f) break; a[i] = a[p]; i = p; } a[i] = n; }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
  get size() { return this.a.length; }
}

export function findPath(size, isBlocked, sx, sy, goals, maxNodes = 6000) {
  if (!goals.size) return null;
  const start = sy * size + sx;
  if (goals.has(start)) return [];
  let gx = 0, gy = 0;
  for (const g of goals) { gx += g % size; gy += Math.floor(g / size); }
  gx /= goals.size; gy /= goals.size;
  const h = (x, y) => { const dx = Math.abs(x - gx), dy = Math.abs(y - gy); return (dx + dy) + (SQ2 - 2) * Math.min(dx, dy); };
  const g = new Map([[start, 0]]), from = new Map();
  const open = new Heap();
  open.push({ i: start, f: h(sx, sy) });
  const closed = new Set();
  let best = start, bestH = h(sx, sy), n = 0;
  while (open.size && n++ < maxNodes) {
    const cur = open.pop();
    if (closed.has(cur.i)) continue;
    closed.add(cur.i);
    if (goals.has(cur.i)) return build(from, cur.i, size);
    const cx = cur.i % size, cy = (cur.i - cx) / size, cg = g.get(cur.i);
    const ch = h(cx, cy); if (ch < bestH) { bestH = ch; best = cur.i; }
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      const ni = y * size + x;
      if (closed.has(ni)) continue;
      const isGoal = goals.has(ni);
      if (!isGoal && isBlocked(x, y)) continue;
      if (dx && dy && (isBlocked(cx + dx, cy) || isBlocked(cx, cy + dy))) continue;
      const ng = cg + (dx && dy ? SQ2 : 1);
      if (ng < (g.get(ni) ?? Infinity)) { g.set(ni, ng); from.set(ni, cur.i); open.push({ i: ni, f: ng + h(x, y) }); }
    }
  }
  // No full path: go as close as possible.
  return best === start ? null : build(from, best, size);
}

function build(from, end, size) {
  const out = [];
  for (let i = end; from.has(i); i = from.get(i)) out.push([i % size, Math.floor(i / size)]);
  return out.reverse();
}
