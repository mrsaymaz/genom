import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutRing, overlap, tagWidth } from '../src/ui/layout.js';

// Screens: an iPhone held sideways, a small Android, an iPad and a desktop.
const SCREENS = [[852, 393, 46, 8], [740, 360, 42, 8], [1180, 820, 56, 8], [1366, 768, 56, 8]];
// Rings from the game: building rings (arcs) and the build wheel (a full circle).
const RINGS = [
  { n: 2, full: false, costs: [0, 0] }, // a placement tick and cross
  { n: 4, full: false, costs: [2, 0, 2, 0] },
  { n: 5, full: false, costs: [2, 2, 2, 0, 0] }, // Barracks: three soldiers, rally, research
  { n: 6, full: false, costs: [1, 0, 2, 0, 0, 0] }, // Town Center
  { n: 5, full: false, costs: [2, 2, 2, 2, 0] }, // a research wheel
  { n: 7, full: true, costs: [1, 1, 1, 1, 2, 2, 0] }, // the build wheel
  { n: 9, full: true, costs: [1, 1, 1, 1, 2, 2, 2, 2, 0] }, // the build wheel in the Arcane Age
];

function check(ring, [w, h, top, bottom], ax, ay, size, compact) {
  const items = ring.costs.map(c => ({ tagW: tagWidth(c, compact) }));
  const bounds = { left: 6, right: w - 6, top, bottom: h - bottom };
  const { pts } = layoutRing(items, { anchor: [ax, ay], radius: ring.full ? 100 : 70, center: -90, full: ring.full, size, tagH: compact ? 15 : 18, gap: compact ? 6 : 8, bounds });
  const boxes = items.map(it => ({ w: Math.max(size, it.tagW), h: size + (it.tagW ? (compact ? 15 : 18) : 0) }));
  pts.forEach(([x, y], i) => {
    const b = boxes[i], where = `ring of ${ring.n} at ${Math.round(ax)},${Math.round(ay)} on ${w}x${h}, size ${size}`;
    assert.ok(x - b.w / 2 >= bounds.left - 0.5 && x + b.w / 2 <= bounds.right + 0.5, `button ${i} inside left and right: ${where}`);
    assert.ok(y - size / 2 >= bounds.top - 0.5 && y - size / 2 + b.h <= bounds.bottom + 0.5, `button ${i} inside top and bottom: ${where}`);
    for (let j = i + 1; j < pts.length; j++) assert.equal(overlap(pts[i], boxes[i], pts[j], boxes[j], size), 0, `buttons ${i} and ${j} do not overlap: ${where}`);
  });
}

test('ring buttons never overlap and never leave the screen, wherever the ring opens', () => {
  for (const screen of SCREENS) for (const ring of RINGS) for (const [size, compact] of [[60, false], [52, false], [46, true]]) {
    // Anchors all over the screen, including right at the edges and corners.
    for (let fx = 0; fx <= 1.0001; fx += 0.1) for (let fy = 0; fy <= 1.0001; fy += 0.1) check(ring, screen, fx * screen[0], fy * screen[1], size, compact);
  }
});

test('a ring with room around it keeps its even arc, centred on what was tapped', () => {
  const items = [0, 0, 0].map(() => ({ tagW: 0 }));
  const { pts, fits } = layoutRing(items, { anchor: [400, 300], radius: 80, center: -90, size: 60, bounds: { left: 6, right: 846, top: 40, bottom: 760 } });
  assert.ok(fits);
  assert.ok(Math.abs(pts[1][0] - 400) < 0.01 && pts[1][1] < 300, 'the middle button sits straight above');
  const d = pts.map(([x, y]) => Math.hypot(x - 400, y - 300));
  assert.ok(d.every(v => Math.abs(v - d[0]) < 0.01), 'all on one circle');
});

test('near the top of the screen the arc turns downwards instead of piling up', () => {
  const items = [2, 2, 2, 0, 0].map(c => ({ tagW: tagWidth(c, false) }));
  const { pts } = layoutRing(items, { anchor: [500, 70], radius: 70, center: -90, size: 52, bounds: { left: 6, right: 846, top: 46, bottom: 385 } });
  assert.ok(pts.every(([, y]) => y > 70 - 1), 'every button is below the building');
});
