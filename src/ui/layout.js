// Where the buttons of an action ring go. Pure maths with no DOM, so it can be tested on its own.
// The rules: buttons sit on an arc (or a full circle) around the thing that was tapped; the whole
// ring moves as one to stay inside the safe area (buttons are never pushed in one at a time, which
// is what made them pile up); the arc turns towards the side with the most room; and a last pass
// pushes apart anything that still touches.

// items: [{ tagW }] (the width of each button's cost tag, 0 for none). opts: anchor [x, y],
// radius, center (degrees, -90 is up), full (a whole circle), size (button), tagH, gap, bounds
// { left, top, right, bottom }. Returns { pts: [[x, y]], fits }.
export function layoutRing(items, o) {
  const n = items.length, size = o.size, gap = o.gap ?? 8, tagH = o.tagH ?? 18;
  const B = o.bounds;
  if (!n) return { pts: [], fits: true };
  // Each button is a box: the round button, plus its cost tag hanging below it.
  const boxes = items.map(it => ({ w: Math.max(size, it.tagW || 0), h: size + (it.tagW ? tagH : 0) }));
  const half = b => [b.w / 2, size / 2, b.h - size / 2]; // half width, above centre, below centre
  // Space neighbours by the widest box so neither the buttons nor their tags touch.
  const span = Math.max(...boxes.map(b => b.w)) + gap;
  const maxArc = o.full ? 360 : 270;
  let radius = Math.max(o.radius, size / 2 + 22);
  let step = n > 1 ? (2 * Math.asin(Math.min(1, span / (2 * radius))) * 180) / Math.PI : 0;
  if (o.full) step = 360 / n;
  else if (n > 1 && step * (n - 1) > maxArc) step = maxArc / (n - 1);
  // A full circle, or an arc with too little room between buttons, grows its radius.
  if (n > 1) radius = Math.max(radius, span / (2 * Math.sin((step * Math.PI) / 360)));
  const place = center => {
    const start = o.full ? center : center - ((n - 1) * step) / 2;
    return items.map((_, i) => { const a = ((start + i * step) * Math.PI) / 180; return [o.anchor[0] + Math.cos(a) * radius, o.anchor[1] + Math.sin(a) * radius]; });
  };
  // How far a layout spills out of the safe area, and the shift that brings it back in.
  const fit = pts => {
    let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
    pts.forEach(([x, y], i) => { const [hw, up, down] = half(boxes[i]); l = Math.min(l, x - hw); r = Math.max(r, x + hw); t = Math.min(t, y - up); b = Math.max(b, y + down); });
    const dx = l < B.left ? B.left - l : r > B.right ? B.right - r : 0;
    const dy = t < B.top ? B.top - t : b > B.bottom ? B.bottom - b : 0;
    return { dx, dy, fits: r - l <= B.right - B.left && b - t <= B.bottom - B.top };
  };
  // Try the preferred direction first, then the others, and keep the one that moves least.
  const tries = o.full ? [o.center ?? -90] : [o.center ?? -90, 90, -90, 0, 180, -45, -135, 45, 135];
  let best = null;
  for (const c of tries) {
    const pts = place(c), f = fit(pts), cost = Math.hypot(f.dx, f.dy) + (c === (o.center ?? -90) ? 0 : 12);
    if (!best || cost < best.cost) best = { pts, f, cost };
    if (cost === 0) break;
  }
  let pts = best.pts.map(([x, y]) => [x + best.f.dx, y + best.f.dy]);
  // Still too big for the screen: keep each button inside, then push apart anything touching.
  const clamp = (p, i) => { const [hw, up, down] = half(boxes[i]); p[0] = Math.max(B.left + hw, Math.min(B.right - hw, p[0])); p[1] = Math.max(B.top + up, Math.min(B.bottom - down, p[1])); };
  pts.forEach(clamp);
  for (let k = 0; k < 40; k++) {
    let moved = false;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const ov = overlap(pts[i], boxes[i], pts[j], boxes[j], size, gap / 2);
      if (!ov) continue;
      moved = true;
      let ux = pts[j][0] - pts[i][0], uy = pts[j][1] - pts[i][1], d = Math.hypot(ux, uy);
      if (d < 1e-3) { ux = Math.cos(i + j); uy = Math.sin(i + j); d = 1; }
      const push = Math.min(ov, 12) / 2 + 0.5;
      pts[i][0] -= (ux / d) * push; pts[i][1] -= (uy / d) * push; pts[j][0] += (ux / d) * push; pts[j][1] += (uy / d) * push;
      clamp(pts[i], i); clamp(pts[j], j);
    }
    if (!moved) break;
  }
  const clear = pts.every((p, i) => pts.every((q, j) => j <= i || !overlap(p, boxes[i], q, boxes[j], size, 0)));
  return { pts, fits: best.f.fits && clear };
}

// How much two buttons overlap (0 when apart), with a little margin. Buttons are round; a cost
// tag is a strip hanging below its button.
export function overlap(p, a, q, b, size, margin = 0) {
  let worst = Math.max(0, size + margin - Math.hypot(q[0] - p[0], q[1] - p[1]));
  const tag = (c, box) => (box.h > size ? { x0: c[0] - box.w / 2, x1: c[0] + box.w / 2, y0: c[1] + size / 2, y1: c[1] - size / 2 + box.h } : null);
  const disc = c => ({ x0: c[0] - size * 0.42, x1: c[0] + size * 0.42, y0: c[1] - size * 0.42, y1: c[1] + size * 0.42 });
  const hit = (r, s2) => { if (!r || !s2) return 0; const ox = Math.min(r.x1 + margin, s2.x1) - Math.max(r.x0 - margin, s2.x0), oy = Math.min(r.y1 + margin, s2.y1) - Math.max(r.y0 - margin, s2.y0); return ox > 0 && oy > 0 ? Math.min(ox, oy) : 0; };
  const ta = tag(p, a), tb = tag(q, b);
  worst = Math.max(worst, hit(ta, tb), hit(ta, disc(q)), hit(tb, disc(p)));
  return worst;
}

// The width of a cost tag with this many resources (matches the tags drawn in the HUD).
export const tagWidth = (costs, compact) => (costs ? (compact ? 10 : 14) + costs * (compact ? 32 : 38) : 0);
