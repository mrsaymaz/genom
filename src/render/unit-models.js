// Unit models for the four nations. Each unit is built from simple shapes and merged into two
// meshes: a lit one with vertex colours and an unlit "glow" one for magic, embers and runes. Two
// meshes per unit type keeps a whole army cheap to draw (the game instances them).
// Units face +Z and stand on y = 0. A standard figure is about 1.15 tall.
// This file is shared by the game and the concept pages (tools/gen-units.mjs inlines it).

// detail: 1 for close-ups (the concept pages); the game uses less, since units are only about
// 20 screen points tall on a phone and fewer triangles keep big armies smooth.
export function unitKit(THREE, { detail = 1 } = {}) {
  const sg = (n, min = 4) => Math.max(min, Math.round(n * detail));
  const lit = [], glow = [];
  const stack = [new THREE.Matrix4()];
  const col = new THREE.Color();
  const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

  function put(geo, color, o = {}) {
    const m = new THREE.Matrix4();
    if (o.s) m.makeScale(...(Array.isArray(o.s) ? o.s : [o.s, o.s, o.s]));
    if (o.r) m.premultiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(o.r[0] || 0, o.r[1] || 0, o.r[2] || 0, o.order || 'XYZ')));
    if (o.q) m.premultiply(new THREE.Matrix4().makeRotationFromQuaternion(o.q));
    if (o.p) m.premultiply(new THREE.Matrix4().makeTranslation(o.p[0], o.p[1], o.p[2]));
    m.premultiply(stack[stack.length - 1]);
    let g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(m);
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    col.set(color).convertSRGBToLinear();
    const n = g.attributes.position.count, c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    (o.glow ? glow : lit).push(g);
  }

  const k = {
    THREE,
    push(o = {}) {
      const m = new THREE.Matrix4();
      if (o.s) m.makeScale(...(Array.isArray(o.s) ? o.s : [o.s, o.s, o.s]));
      if (o.r) m.premultiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(o.r[0] || 0, o.r[1] || 0, o.r[2] || 0, o.order || 'XYZ')));
      if (o.p) m.premultiply(new THREE.Matrix4().makeTranslation(o.p[0], o.p[1], o.p[2]));
      stack.push(stack[stack.length - 1].clone().multiply(m));
    },
    pop() { if (stack.length > 1) stack.pop(); },
    box(w, h, d, p, c, o = {}) { put(new THREE.BoxGeometry(w, h, d), c, { ...o, p }); },
    cyl(rt, rb, h, p, c, o = {}) { put(new THREE.CylinderGeometry(rt, rb, h, sg(o.seg || 8, 5), 1, !!o.open, o.t0 || 0, o.arc || Math.PI * 2), c, { ...o, p }); },
    hex(r, h, p, c, o = {}) { put(new THREE.CylinderGeometry(r, r, h, 6), c, { ...o, p }); },
    ball(r, p, c, o = {}) { put(new THREE.SphereGeometry(r, sg(o.ws || 10, 6), sg(o.hs || 8, 4), o.ps || 0, o.pl || Math.PI * 2, o.t0 || 0, o.tl || Math.PI), c, { ...o, p }); },
    // A hood: a sphere open at the front so the face shows.
    hood(r, p, c, o = {}) { const open = o.open || 0.95; put(new THREE.SphereGeometry(r, sg(12, 7), sg(10, 5), Math.PI / 2 + open, Math.PI * 2 - open * 2, 0, o.tl || Math.PI * 0.62), c, { ...o, p }); },
    cone(r, h, p, c, o = {}) { put(new THREE.ConeGeometry(r, h, o.seg && o.seg <= 6 ? o.seg : sg(o.seg || 8, 5)), c, { ...o, p }); },
    torus(R, r, p, c, o = {}) { put(new THREE.TorusGeometry(R, r, sg(o.rs || 6, 3), sg(o.ts || 16, 8), o.arc || Math.PI * 2), c, { ...o, p }); },
    ico(r, p, c, o = {}) { put(new THREE.IcosahedronGeometry(r, o.d || 0), c, { ...o, p }); },
    dodeca(r, p, c, o = {}) { put(new THREE.DodecahedronGeometry(r, 0), c, { ...o, p }); },
    octa(r, p, c, o = {}) { put(new THREE.OctahedronGeometry(r, 0), c, { ...o, p }); },
    // Profile points run from bottom to top so the faces point outwards.
    lathe(pts, p, c, o = {}) { const q = pts[0][1] > pts[pts.length - 1][1] ? [...pts].reverse() : pts; put(new THREE.LatheGeometry(q.map(([x, y]) => new THREE.Vector2(x, y)), sg(o.seg || 10, 6)), c, { ...o, p }); },
    // A tapered rod from a to b (limbs, shafts, strings).
    rod(a, b, r1, c, o = {}) {
      const A = v3(a), Bv = v3(b), d = Bv.clone().sub(A), len = d.length();
      if (len < 1e-5) return;
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      put(new THREE.CylinderGeometry(o.r2 ?? r1, r1, len, o.seg || 6), c, { ...o, q, p: A.add(Bv).multiplyScalar(0.5).toArray() });
    },
    // A cone whose tip points from a towards b (arrow and harpoon heads).
    point(a, b, r, c, o = {}) {
      const A = v3(a), Bv = v3(b), d = Bv.clone().sub(A), len = d.length();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
      put(new THREE.ConeGeometry(r, len, o.seg || 5), c, { ...o, q, p: A.add(Bv).multiplyScalar(0.5).toArray() });
    },
    // Two meshes: lit (vertex colours) and glow (unlit), ready to instance.
    build() {
      const merge = list => {
        if (!list.length) return null;
        let n = 0; for (const g of list) n += g.attributes.position.count;
        const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3);
        let o = 0;
        for (const g of list) { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(P, 3));
        g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
        g.setAttribute('color', new THREE.BufferAttribute(C, 3));
        g.computeBoundingBox(); g.computeBoundingSphere();
        return g;
      };
      return { lit: merge(lit), glow: merge(glow) };
    },
  };
  return k;
}

// ---------- the figure ----------
// A stylised person: slightly large head so faces and hats read at phone size.
// hands: target points for the left and right hand. Returns useful anchor points.
export function figure(k, o) {
  const s = o.stocky ? 1.22 : 1, hipY = o.hipY || 0.42, sh = 0.18 * s;
  const skin = o.skin, top = o.top, legs = o.legs || '#4a3a2c', boots = o.boots || '#3a2a1c';
  const stride = o.stride || 0;
  // Legs and boots (stride > 0 puts the right leg forward, as in running).
  const footL = [0.09 * s, 0.05, -stride], footR = [-0.09 * s, 0.05, stride];
  k.rod([0.085 * s, hipY, 0], [footL[0], 0.1, footL[2]], 0.062 * s, legs, { r2: 0.055 * s });
  k.rod([-0.085 * s, hipY, 0], [footR[0], 0.1, footR[2]], 0.062 * s, legs, { r2: 0.055 * s });
  k.box(0.11 * s, 0.09, 0.17, [footL[0], 0.045, footL[2] + 0.03], boots);
  k.box(0.11 * s, 0.09, 0.17, [footR[0], 0.045, footR[2] + 0.03], boots);
  // Body: tunic, skirt and belt.
  k.cyl(0.15 * s, 0.17 * s, 0.34, [0, hipY + 0.2, 0], top, { seg: 10 });
  if (o.skirt !== false) k.cyl(0.17 * s, (o.robe ? 0.26 : 0.205) * s, o.robe ? hipY + 0.06 : 0.16, [0, o.robe ? (hipY + 0.06) / 2 : hipY - 0.02, 0], o.skirt || top, { seg: 10 });
  k.cyl(0.165 * s, 0.17 * s, 0.05, [0, hipY + 0.05, 0], o.belt || '#5a3a20', { seg: 10 });
  // Shoulders, arms and hands.
  const shY = hipY + 0.34, L = [sh, shY, 0], R = [-sh, shY, 0];
  const hl = o.hands?.l || [0.24 * s, hipY + 0.02, 0.08], hr = o.hands?.r || [-0.24 * s, hipY + 0.02, 0.08];
  const sleeve = o.sleeve || top;
  const elbow = (a, b, out) => [(a[0] + b[0]) / 2 + out * 0.05, (a[1] + b[1]) / 2 - 0.02, (a[2] + b[2]) / 2 - 0.04];
  const eL = elbow(L, hl, 1), eR = elbow(R, hr, -1);
  k.rod(L, eL, 0.055 * s, sleeve); k.rod(eL, hl, 0.05 * s, o.forearm || sleeve, { r2: 0.045 * s });
  k.rod(R, eR, 0.055 * s, sleeve); k.rod(eR, hr, 0.05 * s, o.forearm || sleeve, { r2: 0.045 * s });
  k.ball(0.075 * s, L, sleeve); k.ball(0.075 * s, R, sleeve);
  k.ball(0.048 * s, hl, o.glove || skin); k.ball(0.048 * s, hr, o.glove || skin);
  // Neck and head.
  const headY = shY + 0.2, hr2 = 0.155;
  k.cyl(0.05, 0.055, 0.08, [0, shY + 0.04, 0], skin);
  k.ball(hr2, [0, headY, 0], skin, { ws: 12, hs: 10 });
  if (o.face !== false) {
    k.box(0.03, 0.04, 0.02, [0.055, headY + 0.01, hr2 - 0.01], '#2a1e18');
    k.box(0.03, 0.04, 0.02, [-0.055, headY + 0.01, hr2 - 0.01], '#2a1e18');
    k.box(0.06, 0.012, 0.02, [0, headY - 0.06, hr2 - 0.02], '#9a5a48');
  }
  if (o.hair) k.ball(hr2 + 0.012, [0, headY + 0.03, -0.025], o.hair, { tl: Math.PI * 0.55, ws: 12 });
  return { head: [0, headY, 0], hr: hr2, shY, hipY, hl, hr, s };
}

// Common props.
const spear = (k, hand, len, shaft, tip, o = {}) => {
  const bottom = [hand[0], Math.max(0.02, hand[1] - len * 0.45), hand[2] - (o.lean || 0)], top = [hand[0], hand[1] + len * 0.55, hand[2] + (o.lean || 0)];
  k.rod(bottom, top, 0.022, shaft);
  k.cone(0.045, 0.18, [top[0], top[1] + 0.08, top[2]], tip, { seg: 4 });
  return top;
};

// ---------- Dark Age units ----------
const AIR = { honey: '#e8b830', amber: '#f0a020', straw: '#d9b66a', strawD: '#b08a42', black: '#2b2622', cream: '#efe4c8', timber: '#9a6a3a', glow: '#ffc44a' };
const WAT = { pearl: '#efe9e0', sheen: '#d6d0e8', deep: '#1f4f8f', blue: '#3f8fe0', bronze: '#b8843a', coral: '#e87a5d', glow: '#7fe8ff', sand: '#d8c8a0' };
const FIR = { basalt: '#2e2b2e', iron: '#55565e', scarlet: '#c22a26', red: '#e2483b', gold: '#e2b23a', leather: '#7a4a2a', glow: '#ff8a2a', hot: '#ffd060' };
const EAR = { bark: '#6b4a2c', barkD: '#4a3220', moss: '#4f8a3a', leaf: '#3f7a36', leafL: '#7fb24f', stone: '#8d877c', stoneD: '#6a655c', glow: '#7dff9a', cap: '#c8402a' };
const SKIN = ['#f0c4a0', '#d9a07a', '#b97a52', '#8a5636'];

export const DARK_UNITS = {
  air: {
    worker(k) {
      const f = figure(k, { skin: SKIN[0], top: AIR.cream, skirt: AIR.straw, belt: AIR.timber, legs: '#6a5a40', hands: { l: [0.22, 0.52, 0.16], r: [-0.25, 0.44, 0.1] } });
      const [hx, hy] = f.head;
      // Wide straw hat with a veil.
      k.cyl(0.3, 0.3, 0.025, [hx, hy + 0.08, 0], AIR.straw, { seg: 14 });
      k.lathe([[0.001, 0.2], [0.1, 0.19], [0.15, 0.12], [0.16, 0.0]], [hx, hy + 0.08, 0], AIR.strawD, { seg: 12 });
      k.cyl(0.17, 0.205, 0.17, [hx, hy - 0.01, 0], AIR.cream, { seg: 12, open: true, t0: Math.PI * 0.28, arc: Math.PI * 1.44 });
      k.torus(0.29, 0.012, [hx, hy + 0.09, 0], AIR.black, { r: [Math.PI / 2, 0, 0], ts: 20 });
      // Smoker pot in the left hand, a little smoke-glow at the spout.
      k.cyl(0.055, 0.055, 0.12, [0.22, 0.47, 0.2], '#a8783a', { seg: 8 });
      k.cone(0.05, 0.07, [0.22, 0.56, 0.2], '#8a5a2a', { seg: 8 });
      k.ball(0.03, [0.22, 0.61, 0.2], AIR.glow, { glow: true });
      // Hand axe in the right hand.
      k.rod([-0.25, 0.3, 0.1], [-0.25, 0.62, 0.1], 0.02, AIR.timber);
      k.box(0.04, 0.09, 0.12, [-0.25, 0.6, 0.15], '#9aa0a8');
      // A straw hive on the back.
      k.push({ p: [0, 0.68, -0.22] });
      k.lathe([[0.001, 0.32], [0.08, 0.3], [0.14, 0.22], [0.16, 0.1], [0.15, 0.0]], [0, -0.14, 0], AIR.straw, { seg: 12 });
      for (const y of [-0.08, 0.0, 0.08]) k.torus(0.152 - (y + 0.08) * 0.18, 0.014, [0, y, 0], AIR.strawD, { r: [Math.PI / 2, 0, 0], ts: 16 });
      k.box(0.07, 0.05, 0.02, [0, -0.08, -0.15], AIR.black);
      k.pop();
    },
    infantry(k) {
      const f = figure(k, { skin: SKIN[2], top: AIR.honey, skirt: AIR.black, legs: AIR.black, belt: AIR.timber, sleeve: AIR.black, hands: { l: [0.27, 0.6, 0.18], r: [-0.25, 0.55, 0.12] } });
      // Stripes on the tabard.
      for (const y of [0.56, 0.68]) k.cyl(0.158, 0.162, 0.045, [0, y, 0], AIR.black, { seg: 10 });
      const [hx, hy] = f.head;
      // Coiled straw beehive helmet.
      for (let i = 0; i < 4; i++) k.torus(0.16 - i * 0.03, 0.03, [hx, hy + 0.04 + i * 0.05, 0], i % 2 ? AIR.strawD : AIR.straw, { r: [Math.PI / 2, 0, 0], ts: 14 });
      k.ball(0.05, [hx, hy + 0.24, 0], AIR.strawD);
      // Hexagonal wicker shield with an amber boss.
      k.push({ p: [0.33, 0.6, 0.2], r: [Math.PI / 2, 0, -0.25] });
      k.hex(0.2, 0.04, [0, 0, 0], AIR.strawD);
      k.hex(0.15, 0.05, [0, 0, 0], AIR.straw);
      k.hex(0.06, 0.07, [0, 0, 0], AIR.amber);
      k.pop();
      // Spear with a striped pennant.
      const top = spear(k, [-0.25, 0.55, 0.12], 1.3, AIR.timber, '#c8ccd2');
      k.box(0.02, 0.1, 0.16, [top[0], top[1] - 0.1, top[2] - 0.09], AIR.honey);
      k.box(0.021, 0.04, 0.16, [top[0], top[1] - 0.1, top[2] - 0.09], AIR.black);
    },
    ranged(k) {
      const f = figure(k, { skin: SKIN[1], top: AIR.cream, skirt: AIR.honey, legs: '#7a6a4a', belt: AIR.black, hands: { l: [0.22, 0.5, 0.16], r: [-0.12, 1.25, 0.05] } });
      const [hx, hy] = f.head;
      // Striped cap with a tail, and amber goggles on the forehead.
      k.ball(0.165, [hx, hy + 0.04, -0.01], AIR.honey, { tl: Math.PI * 0.5, ws: 12 });
      k.torus(0.15, 0.022, [hx, hy + 0.07, 0], AIR.black, { r: [Math.PI / 2 - 0.15, 0, 0] });
      k.ball(0.04, [0.06, hy + 0.1, 0.13], AIR.amber); k.ball(0.04, [-0.06, hy + 0.1, 0.13], AIR.amber);
      k.rod([0, hy + 0.08, -0.15], [0.02, hy - 0.1, -0.32], 0.035, AIR.honey, { r2: 0.02 });
      // Honey scarf blowing back.
      k.torus(0.1, 0.035, [0, f.shY + 0.05, 0], AIR.honey, { r: [Math.PI / 2, 0, 0] });
      k.box(0.08, 0.03, 0.26, [0.06, f.shY + 0.02, -0.2], AIR.honey, { r: [0.3, 0.2, 0] });
      // The sling whirling above the head, with its stone.
      k.rod([-0.12, 1.25, 0.05], [-0.1, 1.42, 0.12], 0.008, AIR.timber);
      k.torus(0.16, 0.008, [-0.1, 1.45, 0.05], AIR.timber, { r: [Math.PI / 2 - 0.3, 0, 0], ts: 18 });
      k.ball(0.04, [0.06, 1.47, 0.08], '#8d877c');
      // Stone pouch on the belt.
      k.ball(0.06, [0.15, 0.4, 0.1], AIR.timber);
    },
    special(k) {
      // Kite Runner: running, towing a diamond kite on a string.
      k.push({ r: [0.18, 0, 0] });
      const f = figure(k, { skin: SKIN[3], top: AIR.honey, skirt: AIR.cream, legs: AIR.cream, belt: AIR.black, stride: 0.14, hands: { l: [0.2, 0.62, -0.05], r: [-0.2, 0.72, 0.18] }, hair: '#2a1e18' });
      const [hx, hy] = f.head;
      k.torus(0.15, 0.025, [hx, hy + 0.05, 0], AIR.black, { r: [Math.PI / 2 - 0.2, 0, 0] });
      k.box(0.03, 0.03, 0.2, [hx, hy + 0.07, -0.2], AIR.black, { r: [0.4, 0, 0] });
      // Wind-rose badge.
      k.octa(0.05, [0, 0.66, 0.16], AIR.amber, { s: [1, 1, 0.3] });
      k.pop();
      // The string and the kite, high and behind.
      const kite = [0.15, 1.75, -0.55];
      k.rod([0.2, 0.68, -0.02], kite, 0.006, '#5a4a30');
      k.push({ p: kite, r: [0.5, 0.3, 0.1] });
      k.octa(0.32, [0, 0, 0], AIR.honey, { s: [0.8, 1.15, 0.08] });
      k.box(0.03, 0.72, 0.035, [0, 0, 0.01], AIR.black);
      k.box(0.5, 0.03, 0.035, [0, 0.05, 0.01], AIR.black);
      k.pop();
      // Tail ribbons.
      k.rod([kite[0], kite[1] - 0.36, kite[2] - 0.15], [kite[0] + 0.05, kite[1] - 0.6, kite[2] - 0.35], 0.012, AIR.black);
      for (const t of [0.3, 0.55]) k.box(0.08, 0.05, 0.02, [kite[0] + 0.02, kite[1] - 0.36 - t * 0.4, kite[2] - 0.2 - t * 0.25], t > 0.4 ? AIR.honey : AIR.cream);
    },
  },

  water: {
    worker(k) {
      const f = figure(k, { skin: SKIN[1], top: WAT.blue, skirt: WAT.deep, legs: WAT.sand, belt: WAT.bronze, hands: { l: [0.22, 0.44, 0.12], r: [-0.24, 0.5, 0.16] } });
      const [hx, hy] = f.head;
      // Spiral shell hat.
      k.cone(0.17, 0.3, [hx, hy + 0.2, -0.02], WAT.pearl, { seg: 10, r: [-0.15, 0, 0] });
      for (let i = 0; i < 3; i++) k.torus(0.14 - i * 0.04, 0.02, [hx, hy + 0.1 + i * 0.07, -0.02 - i * 0.012], WAT.sheen, { r: [Math.PI / 2 - 0.15, 0, i], ts: 14 });
      k.cyl(0.21, 0.21, 0.02, [hx, hy + 0.06, 0], WAT.pearl, { seg: 12 });
      // Net basket on the back.
      k.push({ p: [0, 0.68, -0.22] });
      k.cyl(0.15, 0.12, 0.3, [0, 0, 0], '#a8885a', { seg: 10, open: true });
      for (const y of [-0.1, 0, 0.1]) k.torus(0.14 - y * 0.08, 0.01, [0, y, 0], '#6a5a3a', { r: [Math.PI / 2, 0, 0] });
      k.ball(0.06, [0.04, 0.14, 0.02], WAT.coral); k.ball(0.05, [-0.05, 0.13, -0.03], WAT.pearl);
      k.pop();
      // Bronze hand-pick.
      k.rod([-0.24, 0.32, 0.16], [-0.24, 0.66, 0.16], 0.02, '#8a6a4a');
      k.box(0.03, 0.03, 0.2, [-0.24, 0.66, 0.18], WAT.bronze, { r: [0.2, 0, 0] });
    },
    infantry(k) {
      const f = figure(k, { skin: SKIN[2], top: WAT.deep, skirt: WAT.blue, legs: WAT.deep, belt: WAT.bronze, sleeve: WAT.blue, hands: { l: [0.27, 0.6, 0.18], r: [-0.25, 0.55, 0.12] } });
      // Pearl breastplate.
      k.cyl(0.168, 0.178, 0.3, [0, 0.64, 0], WAT.pearl, { seg: 12, open: true, t0: -0.95, arc: 1.9 });
      for (const y of [0.56, 0.66, 0.76]) k.torus(0.168, 0.012, [0, y, 0], WAT.sheen, { r: [Math.PI / 2, 0, 0], arc: 1.9, ts: 10, order: 'XYZ' });
      const [hx, hy] = f.head;
      // Tall spiral conch helmet.
      k.ball(0.17, [hx, hy + 0.02, 0], WAT.pearl, { tl: Math.PI * 0.55, ws: 12 });
      k.cone(0.13, 0.38, [hx, hy + 0.3, -0.03], WAT.pearl, { seg: 10, r: [-0.2, 0, 0] });
      for (let i = 0; i < 4; i++) k.torus(0.12 - i * 0.026, 0.018, [hx, hy + 0.16 + i * 0.075, -0.012 - i * 0.017], WAT.sheen, { r: [Math.PI / 2 - 0.2, 0, i * 0.7], ts: 14 });
      // Scallop shield: a fan of ribs.
      k.push({ p: [0.33, 0.6, 0.2], r: [0, 0.35, 0] });
      for (let i = -3; i <= 3; i++) k.box(0.07, 0.34, 0.035, [Math.sin(i * 0.28) * 0.12, 0.02 + Math.cos(i * 0.28) * 0.06, 0], i % 2 ? WAT.pearl : WAT.coral, { r: [0, 0, -i * 0.28] });
      k.ball(0.05, [0, -0.1, 0.02], WAT.bronze);
      k.pop();
      // Coral spear with a bronze tip.
      spear(k, [-0.25, 0.55, 0.12], 1.3, WAT.coral, WAT.bronze);
    },
    ranged(k) {
      const f = figure(k, { skin: SKIN[3], top: WAT.pearl, skirt: WAT.deep, legs: WAT.deep, belt: '#6a5a3a', sleeve: WAT.blue, hands: { l: [0.24, 0.62, 0.22], r: [-0.18, 1.05, -0.1] }, hair: '#1a1410' });
      const [hx, hy] = f.head;
      // Blue bandana with tails, bronze earring.
      k.ball(0.165, [hx, hy + 0.03, 0], WAT.blue, { tl: Math.PI * 0.45, ws: 12 });
      k.box(0.05, 0.12, 0.03, [0.04, hy - 0.02, -0.16], WAT.blue, { r: [0.4, 0, 0.2] });
      k.torus(0.025, 0.008, [0.15, hy - 0.04, 0], WAT.bronze);
      // Rope coil at the waist.
      k.torus(0.08, 0.025, [0.17, 0.42, 0.05], '#c8b088', { r: [0, Math.PI / 2, 0] });
      // Spare harpoons on the back.
      for (const x of [-0.06, 0, 0.06]) k.rod([x, 0.35, -0.2], [x * 1.5, 1.15, -0.26], 0.014, '#8a6a4a');
      // The harpoon, raised to throw.
      const hand = [-0.18, 1.05, -0.1], d = [-0.35, 0.3, 0.88], at = t => hand.map((v, i) => v + d[i] * t);
      k.rod(at(-0.5), at(0.62), 0.02, '#8a6a4a');
      k.point(at(0.6), at(0.8), 0.045, WAT.bronze, { seg: 4 });
      k.rod(at(0.56), [...at(0.5)].map((v, i) => v + [0.06, -0.06, 0][i]), 0.012, WAT.bronze);
      k.rod(at(0.56), [...at(0.5)].map((v, i) => v + [-0.06, -0.02, 0][i]), 0.012, WAT.bronze);
    },
    special(k) {
      // Tide Mender: long robe, shell crown, a glass bowl of glowing water.
      const f = figure(k, { skin: SKIN[0], top: WAT.deep, robe: true, skirt: WAT.deep, legs: WAT.deep, belt: WAT.pearl, sleeve: WAT.deep, hands: { l: [0.13, 0.68, 0.22], r: [-0.13, 0.68, 0.22] }, hair: '#d8d0c0' });
      k.cyl(0.27, 0.28, 0.04, [0, 0.03, 0], WAT.pearl, { seg: 12 });
      k.rod([0, f.shY, 0.15], [0, 0.1, 0.24], 0.04, WAT.pearl, { r2: 0.05 });
      const [hx, hy] = f.head;
      // Shell crown: small fans around the head.
      for (let i = -2; i <= 2; i++) k.cone(0.04, 0.12, [Math.sin(i * 0.5) * 0.13, hy + 0.15 - Math.abs(i) * 0.02, Math.cos(i * 0.5) * 0.06], i ? WAT.pearl : WAT.coral, { seg: 6, r: [0, 0, -i * 0.3] });
      // Glass bowl with glowing water and two drops orbiting.
      k.ball(0.12, [0, 0.72, 0.25], '#bfe6f2', { t0: Math.PI / 2, tl: Math.PI / 2, ws: 12 });
      k.ball(0.095, [0, 0.74, 0.25], WAT.glow, { s: [1, 0.55, 1], glow: true });
      k.ball(0.035, [0.16, 0.95, 0.22], WAT.glow, { glow: true });
      k.ball(0.028, [-0.14, 1.05, 0.3], WAT.glow, { glow: true });
      k.torus(0.2, 0.01, [0, 0.95, 0.25], WAT.glow, { r: [Math.PI / 2 - 0.4, 0, 0], arc: Math.PI * 1.2, glow: true });
    },
  },

  fire: {
    worker(k) {
      const f = figure(k, { skin: SKIN[2], top: FIR.scarlet, skirt: FIR.leather, legs: '#3a2a22', belt: FIR.iron, stocky: true, sleeve: FIR.scarlet, forearm: SKIN[2], hands: { l: [0.27, 0.46, 0.1], r: [-0.2, 0.92, -0.05] } });
      // Leather apron.
      k.box(0.3, 0.42, 0.04, [0, 0.52, 0.19], FIR.leather);
      const [hx, hy] = f.head;
      // Scarlet bandana with a knot.
      k.ball(0.165, [hx, hy + 0.035, 0], FIR.scarlet, { tl: Math.PI * 0.42, ws: 12 });
      k.box(0.05, 0.05, 0.06, [0, hy, -0.17], FIR.scarlet);
      // Big hammer over the shoulder.
      k.rod([-0.2, 0.92, -0.05], [-0.22, 1.05, -0.45], 0.025, '#5a3a22');
      k.box(0.14, 0.12, 0.2, [-0.22, 1.08, -0.5], FIR.iron);
      // A small glowing ingot in the left hand, held in tongs.
      k.rod([0.27, 0.46, 0.1], [0.3, 0.42, 0.28], 0.012, FIR.iron);
      k.box(0.1, 0.04, 0.06, [0.3, 0.42, 0.3], FIR.glow, { glow: true });
    },
    infantry(k) {
      const f = figure(k, { skin: SKIN[0], top: FIR.basalt, skirt: FIR.scarlet, legs: FIR.basalt, belt: FIR.gold, sleeve: FIR.iron, glove: FIR.iron, hands: { l: [0.27, 0.6, 0.18], r: [-0.25, 0.55, 0.12] } });
      // Red iron chest plate with gold rivets.
      k.box(0.28, 0.24, 0.05, [0, 0.66, 0.15], FIR.scarlet);
      for (const x of [-0.1, 0.1]) for (const y of [0.58, 0.74]) k.ball(0.018, [x, y, 0.18], FIR.gold);
      // Pauldrons with spikes.
      for (const x of [0.19, -0.19]) { k.ball(0.09, [x, f.shY + 0.02, 0], FIR.iron, { tl: Math.PI / 2 }); k.cone(0.03, 0.12, [x * 1.15, f.shY + 0.11, 0], FIR.iron, { seg: 5, r: [0, 0, -x * 2] }); }
      const [hx, hy] = f.head;
      // Basalt helmet with a spiked crest that burns at the top.
      k.ball(0.172, [hx, hy + 0.02, 0], FIR.basalt, { tl: Math.PI * 0.6, ws: 12 });
      k.box(0.2, 0.05, 0.03, [hx, hy - 0.01, 0.15], FIR.iron);
      for (let i = 0; i < 4; i++) k.cone(0.035, 0.12 + i * 0.015, [hx, hy + 0.18, 0.08 - i * 0.07], FIR.scarlet, { seg: 4 });
      k.cone(0.05, 0.14, [hx, hy + 0.3, -0.05], FIR.glow, { seg: 6, glow: true });
      k.cone(0.03, 0.1, [hx, hy + 0.36, -0.05], FIR.hot, { seg: 6, glow: true });
      // Angular spiked shield.
      k.push({ p: [0.33, 0.58, 0.2], r: [0, 0.35, 0] });
      k.box(0.32, 0.42, 0.04, [0, 0, 0], FIR.scarlet);
      k.box(0.26, 0.36, 0.05, [0, 0, 0.005], FIR.basalt);
      k.box(0.1, 0.1, 0.06, [0, 0.02, 0.01], FIR.gold, { r: [0, 0, Math.PI / 4] });
      for (const x of [-0.12, 0, 0.12]) k.cone(0.025, 0.1, [x, 0.25, 0], FIR.iron, { seg: 4 });
      k.pop();
      spear(k, [-0.25, 0.55, 0.12], 1.3, '#3a2a22', FIR.gold);
    },
    ranged(k) {
      const f = figure(k, { skin: SKIN[3], top: FIR.scarlet, skirt: FIR.basalt, legs: '#3a2a22', belt: FIR.gold, sleeve: FIR.basalt, hands: { l: [0.3, 0.8, 0.28], r: [0.02, 0.8, 0.0] } });
      const [hx, hy] = f.head;
      // Red hood with iron cheek guards.
      k.hood(0.19, [hx, hy + 0.02, -0.01], FIR.scarlet, { tl: Math.PI * 0.7 });
      k.cone(0.07, 0.14, [hx, hy + 0.15, -0.12], FIR.scarlet, { seg: 6, r: [-0.7, 0, 0] });
      for (const x of [0.13, -0.13]) k.box(0.03, 0.12, 0.08, [x, hy - 0.06, 0.08], FIR.iron);
      // Bow (an arc) held out in the left hand, string drawn to the right hand.
      k.push({ p: [0.3, 0.8, 0.28], r: [0, -0.5, 0] });
      k.torus(0.36, 0.022, [-0.26, 0, 0], FIR.basalt, { arc: Math.PI * 0.62, r: [0, 0, -Math.PI * 0.31] });
      k.pop();
      k.rod([0.46, 1.12, 0.12], [0.02, 0.8, 0.0], 0.005, '#d8c8a0');
      k.rod([0.46, 0.48, 0.12], [0.02, 0.8, 0.0], 0.005, '#d8c8a0');
      // Arrow with a glowing ember tip.
      k.rod([0.02, 0.8, 0.0], [0.42, 0.8, 0.42], 0.01, '#8a6a4a');
      k.ball(0.035, [0.44, 0.8, 0.45], FIR.glow, { glow: true });
      // Quiver of ember arrows on the back.
      k.cyl(0.06, 0.05, 0.38, [-0.08, 0.78, -0.2], FIR.leather, { r: [0.3, 0, 0.25] });
      for (const dx of [-0.02, 0.03]) k.ball(0.028, [-0.14 + dx, 0.98, -0.28], FIR.glow, { glow: true });
    },
    special(k) {
      // Boar Rider: a black war boar with tusks and an iron head plate.
      k.push({ p: [0, -0.1, 0] });
      k.ball(0.36, [0, 0.52, -0.05], FIR.basalt, { s: [0.85, 0.8, 1.35], ws: 12 });
      k.ball(0.22, [0, 0.5, 0.42], '#3a3236', { s: [0.9, 0.85, 1.1] });
      k.cyl(0.11, 0.13, 0.12, [0, 0.45, 0.62], '#4a3a3a', { r: [Math.PI / 2, 0, 0] });
      k.box(0.24, 0.16, 0.05, [0, 0.6, 0.55], FIR.iron, { r: [-0.5, 0, 0] });
      for (const x of [0.1, -0.1]) {
        k.cone(0.028, 0.2, [x, 0.46, 0.66], '#f2ead8', { seg: 5, r: [-1.1, 0, -x * 3] });
        k.cone(0.05, 0.1, [x * 1.4, 0.7, 0.42], '#3a3236', { seg: 4, r: [0, 0, -x * 4] });
        k.ball(0.022, [x * 0.9, 0.58, 0.6], FIR.glow, { glow: true });
      }
      // Bristle ridge glowing like coals.
      for (let i = 0; i < 5; i++) k.cone(0.05, 0.14, [0, 0.85 - Math.abs(i - 2) * 0.02, 0.28 - i * 0.14], i % 2 ? FIR.basalt : FIR.glow, { seg: 4, glow: !(i % 2), r: [-0.4, 0, 0] });
      // Short, sturdy legs.
      for (const [x, z] of [[0.17, 0.3], [-0.17, 0.3], [0.17, -0.35], [-0.17, -0.35]]) {
        k.rod([x, 0.38, z], [x, 0.16, z + 0.03], 0.085, '#2a2428', { r2: 0.07 });
        k.box(0.12, 0.08, 0.13, [x, 0.14, z + 0.04], '#1e1a1c');
      }
      // Scarlet saddle cloth with gold trim.
      k.box(0.6, 0.04, 0.42, [0, 0.82, -0.06], FIR.scarlet);
      k.box(0.62, 0.02, 0.44, [0, 0.8, -0.06], FIR.gold);
      k.pop();
      // The rider, seated, with a gold-tipped axe-spear held forward.
      k.push({ p: [0, 0.32, -0.08] });
      const f = figure(k, { skin: SKIN[1], top: FIR.scarlet, skirt: FIR.basalt, legs: FIR.basalt, belt: FIR.gold, sleeve: FIR.iron, hands: { l: [0.2, 0.52, 0.22], r: [-0.22, 0.62, 0.18] }, hair: '#2a1a12' });
      const [hx, hy] = f.head;
      k.ball(0.17, [hx, hy + 0.03, 0], FIR.iron, { tl: Math.PI * 0.5, ws: 12 });
      k.cone(0.04, 0.16, [hx, hy + 0.22, 0], FIR.glow, { seg: 6, glow: true });
      k.pop();
      k.rod([-0.22, 0.65, -0.35], [-0.24, 1.15, 0.85], 0.022, '#3a2a22');
      k.box(0.03, 0.16, 0.12, [-0.24, 1.12, 0.78], FIR.gold, { r: [0.4, 0, 0] });
    },
  },

  earth: {
    worker(k) {
      const f = figure(k, { skin: SKIN[3], top: EAR.moss, skirt: EAR.bark, legs: '#5a4a32', belt: EAR.barkD, hands: { l: [0.22, 0.48, 0.12], r: [-0.25, 0.5, 0.14] } });
      const [hx, hy] = f.head;
      // A wide leaf hat with a pointed tip.
      k.ball(0.3, [hx, hy + 0.15, 0.0], EAR.leafL, { s: [1, 0.12, 1.15], ws: 12 });
      k.ball(0.165, [hx, hy + 0.06, -0.01], EAR.leaf, { tl: Math.PI * 0.42, ws: 12 });
      k.cone(0.05, 0.1, [hx, hy + 0.21, 0], EAR.leaf, { seg: 6 });
      k.rod([hx, hy + 0.17, -0.33], [hx, hy + 0.17, 0.34], 0.008, EAR.leaf);
      // Wicker basket with mushrooms on the back.
      k.push({ p: [0, 0.66, -0.23] });
      k.cyl(0.15, 0.11, 0.26, [0, 0, 0], EAR.bark, { seg: 10 });
      for (const y of [-0.08, 0.04]) k.torus(0.135 + y * 0.12, 0.012, [0, y, 0], EAR.barkD, { r: [Math.PI / 2, 0, 0] });
      k.ball(0.07, [0.04, 0.15, 0.02], EAR.cap, { tl: Math.PI / 2 }); k.cyl(0.02, 0.025, 0.06, [0.04, 0.12, 0.02], '#efe4c8');
      k.ball(0.055, [-0.06, 0.14, -0.03], '#d8c0a0', { tl: Math.PI / 2 });
      k.pop();
      // Wooden hoe.
      k.rod([-0.25, 0.2, 0.14], [-0.25, 0.95, 0.14], 0.02, EAR.bark);
      k.box(0.04, 0.12, 0.14, [-0.25, 0.95, 0.2], EAR.barkD, { r: [0.5, 0, 0] });
    },
    infantry(k) {
      const f = figure(k, { skin: SKIN[1], top: EAR.bark, skirt: EAR.leaf, legs: EAR.barkD, belt: EAR.moss, sleeve: EAR.barkD, hands: { l: [0.27, 0.6, 0.18], r: [-0.25, 0.55, 0.12] } });
      // Bark plates and a leaf cloak.
      for (const y of [0.56, 0.68]) k.box(0.3, 0.07, 0.05, [0, y, 0.15], EAR.barkD, { r: [0, 0, y > 0.6 ? 0.08 : -0.08] });
      k.cyl(0.2, 0.27, 0.55, [0, 0.55, -0.06], EAR.leaf, { seg: 10, open: true, t0: Math.PI * 0.75, arc: Math.PI * 0.5 });
      const [hx, hy] = f.head;
      // Wooden helmet with branching antlers.
      k.ball(0.172, [hx, hy + 0.025, 0], EAR.bark, { tl: Math.PI * 0.55, ws: 12 });
      for (const x of [1, -1]) {
        k.rod([0.1 * x, hy + 0.12, 0], [0.22 * x, hy + 0.34, -0.02], 0.02, EAR.barkD, { r2: 0.012 });
        k.rod([0.17 * x, hy + 0.25, -0.01], [0.27 * x, hy + 0.3, 0.06], 0.012, EAR.barkD, { r2: 0.008 });
        k.ico(0.035, [0.2 * x, hy + 0.3, -0.02], EAR.leafL);
      }
      // Mossy round shield with a green rune.
      k.push({ p: [0.33, 0.6, 0.2], r: [Math.PI / 2, 0.0, -0.35], order: 'ZXY' });
      k.cyl(0.21, 0.21, 0.05, [0, 0, 0], EAR.bark, { seg: 12 });
      k.cyl(0.17, 0.17, 0.055, [0, 0, 0], EAR.barkD, { seg: 12 });
      k.ico(0.08, [0.1, 0.03, 0.08], EAR.moss, { s: [1, 0.4, 1] });
      k.octa(0.1, [0, 0.0, 0], EAR.glow, { s: [0.55, 0.36, 1], glow: true });
      k.pop();
      // Thorn spear.
      const top = spear(k, [-0.25, 0.55, 0.12], 1.3, EAR.bark, EAR.stone);
      for (let i = 0; i < 3; i++) k.cone(0.015, 0.06, [top[0] + (i % 2 ? 0.025 : -0.025), top[1] - 0.25 - i * 0.18, top[2]], EAR.barkD, { seg: 4, r: [0, 0, i % 2 ? -1.2 : 1.2] });
    },
    ranged(k) {
      const f = figure(k, { skin: SKIN[0], top: EAR.leaf, skirt: EAR.moss, legs: EAR.barkD, belt: EAR.bark, sleeve: EAR.leaf, hands: { l: [0.3, 0.8, 0.28], r: [0.02, 0.8, 0.0] } });
      const [hx, hy] = f.head;
      // Pointed leaf hood and cloak.
      k.hood(0.195, [hx, hy + 0.02, -0.01], EAR.leaf, { tl: Math.PI * 0.7 });
      k.cone(0.12, 0.3, [hx, hy + 0.2, -0.1], EAR.leaf, { seg: 7, r: [-0.6, 0, 0] });
      k.cyl(0.21, 0.3, 0.6, [0, 0.52, -0.05], EAR.moss, { seg: 10, open: true, t0: Math.PI * 0.7, arc: Math.PI * 0.6 });
      // Longbow grown from a living branch, with leaves.
      k.push({ p: [0.3, 0.8, 0.28], r: [0, -0.5, 0] });
      k.torus(0.48, 0.022, [-0.4, 0, 0], EAR.bark, { arc: Math.PI * 0.6, r: [0, 0, -Math.PI * 0.3] });
      k.ico(0.04, [-0.13, 0.42, 0], EAR.leafL); k.ico(0.035, [-0.15, -0.4, 0], EAR.leafL);
      k.pop();
      k.rod([0.5, 1.25, 0.08], [0.02, 0.8, 0.0], 0.005, '#d8c8a0');
      k.rod([0.5, 0.35, 0.08], [0.02, 0.8, 0.0], 0.005, '#d8c8a0');
      k.rod([0.02, 0.8, 0.0], [0.42, 0.8, 0.42], 0.01, EAR.bark);
      k.cone(0.02, 0.06, [0.44, 0.8, 0.45], EAR.stone, { seg: 4, r: [Math.PI / 2, 0, -0.78], order: 'ZXY' });
      // Quiver of fletched arrows.
      k.cyl(0.06, 0.05, 0.36, [-0.08, 0.78, -0.22], EAR.barkD, { r: [0.3, 0, 0.25] });
      for (const dx of [-0.02, 0.03]) k.cone(0.025, 0.06, [-0.14 + dx, 0.98, -0.28], EAR.leafL, { seg: 4 });
    },
    special(k) {
      // Stonewarden: big and stocky, in rough stone, with a slab shield and green rune light.
      k.push({ s: 1.3 });
      const f = figure(k, { skin: EAR.stoneD, top: EAR.stoneD, skirt: EAR.bark, legs: EAR.stoneD, boots: EAR.stone, belt: EAR.barkD, stocky: true, sleeve: EAR.stone, glove: EAR.stone, hands: { l: [0.32, 0.55, 0.2], r: [-0.3, 0.5, 0.14] }, face: false });
      // Stone chest with a glowing rune.
      k.dodeca(0.22, [0, 0.66, 0.04], EAR.stone, { s: [1.05, 0.9, 0.75] });
      k.octa(0.11, [0, 0.67, 0.2], EAR.glow, { s: [0.55, 1, 0.25], glow: true });
      k.octa(0.05, [0.07, 0.6, 0.19], EAR.glow, { s: [0.5, 1, 0.25], r: [0, 0, -0.7], glow: true });
      // Big rough stone shoulders with moss.
      for (const x of [0.25, -0.25]) { k.dodeca(0.14, [x, f.shY + 0.03, 0], EAR.stone); k.ico(0.08, [x, f.shY + 0.14, -0.02], EAR.moss, { s: [1.2, 0.5, 1.1] }); }
      const [hx, hy] = f.head;
      // Stone helm with glowing eyes.
      k.dodeca(0.18, [hx, hy, 0], EAR.stoneD);
      k.box(0.05, 0.025, 0.02, [0.06, hy, 0.16], EAR.glow, { glow: true });
      k.box(0.05, 0.025, 0.02, [-0.06, hy, 0.16], EAR.glow, { glow: true });
      k.ico(0.07, [0.03, hy + 0.15, -0.02], EAR.moss, { s: [1.3, 0.5, 1] });
      // Stone slab shield on the left arm.
      k.push({ p: [0.4, 0.55, 0.24], r: [0, 0.3, 0] });
      k.box(0.34, 0.56, 0.08, [0, 0, 0], EAR.stone);
      k.box(0.36, 0.08, 0.09, [0, 0.2, 0], EAR.stoneD);
      k.ico(0.09, [0.08, 0.27, 0.02], EAR.moss, { s: [1.3, 0.5, 1] });
      k.octa(0.12, [0, -0.04, 0.045], EAR.glow, { s: [0.5, 1, 0.2], glow: true });
      k.pop();
      // Stone maul.
      k.rod([-0.3, 0.2, 0.14], [-0.3, 0.88, 0.14], 0.03, EAR.barkD);
      k.dodeca(0.13, [-0.3, 0.95, 0.14], EAR.stone, { s: [1.2, 0.85, 0.85] });
      k.pop();
    },
  },
};
