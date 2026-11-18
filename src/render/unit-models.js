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

// ---------- Mythic Age units ----------
// Each line keeps its Dark Age silhouette, so students recognise it, but gains the materials of
// the nation's Mythic buildings: honeycomb and amber, pearl and bronze, magma-seamed basalt and
// gold, mossy bark and rune light. Heroes (one per nation) appear from this age.
const GLASS = '#bfe6f2', FLOWER = ['#ffffff', '#f6a8c8', '#ffe27a'];
// A ring of small shapes around a centre (crowns, manes, honeycomb bands).
const around = (n, r, cb) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; cb(Math.cos(a) * r, Math.sin(a) * r, a, i); } };
// The archer pose used by every nation: bow out in the left hand, string drawn to the right.
const ARCHER_HANDS = { l: [0.3, 0.8, 0.28], r: [0.02, 0.8, 0.0] };
function bow(k, R, wood, string, o = {}) {
  k.push({ p: [0.3, 0.8, 0.28], r: [0, -0.5, 0] });
  k.torus(R, 0.024, [-R + 0.1, 0, 0], wood, { arc: Math.PI * 0.62, r: [0, 0, -Math.PI * 0.31] });
  if (o.tips) for (const s of [1, -1]) k.cone(0.03, 0.08, [-R * 0.42 + 0.1, s * R * 0.83, 0], o.tips, { seg: 5, r: [0, 0, s > 0 ? 0.4 : Math.PI - 0.4] });
  if (o.thorns) for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.28 + (i / 6) * Math.PI * 0.56; k.cone(0.014, 0.06, [-R + 0.1 + Math.cos(a) * R * 1.04, Math.sin(a) * R * 1.04, 0], o.thorns, { seg: 4, r: [0, 0, a - Math.PI / 2] }); }
  if (o.leaves) for (const y of [0.32, -0.3, 0.05]) k.ico(0.035, [-R + 0.1 + Math.cos(Math.asin(y / R)) * R, y, 0.01], o.leaves);
  k.pop();
  const top = [0.3 + 0.16 * 0.88, 0.8 + R * 0.83, 0.28 - 0.16 * 0.48], bot = [top[0], 0.8 - R * 0.83, top[2]];
  k.rod(top, [0.02, 0.8, 0.0], 0.005, string); k.rod(bot, [0.02, 0.8, 0.0], 0.005, string);
}

export const MYTHIC_UNITS = {
  air: {
    worker(k) {
      const f = figure(k, { skin: SKIN[2], top: AIR.honey, skirt: AIR.cream, belt: AIR.black, legs: '#6a5a40', sleeve: AIR.cream, hands: { l: [0.22, 0.5, 0.16], r: [-0.24, 0.62, 0.18] } });
      for (const y of [0.56, 0.68]) k.cyl(0.158, 0.162, 0.04, [0, y, 0], AIR.black, { seg: 10 });
      const [hx, hy] = f.head;
      // A broad hat with a band of amber honeycomb cells.
      k.cyl(0.31, 0.3, 0.03, [hx, hy + 0.09, 0], AIR.straw, { seg: 16 });
      k.lathe([[0.001, 0.22], [0.12, 0.2], [0.17, 0.12], [0.17, 0.0]], [hx, hy + 0.09, 0], AIR.strawD, { seg: 12 });
      around(8, 0.172, (x, z, a) => { k.push({ p: [hx + x, hy + 0.15, z], r: [0, -a + Math.PI / 2, 0] }); k.hex(0.034, 0.025, [0, 0, 0], AIR.amber, { r: [Math.PI / 2, 0, 0] }); k.pop(); });
      // A glowing amber satchel on the hip.
      k.hex(0.08, 0.07, [0.2, 0.42, 0.06], AIR.amber, { r: [0, 0, Math.PI / 2] });
      k.hex(0.05, 0.075, [0.2, 0.42, 0.06], AIR.glow, { r: [0, 0, Math.PI / 2], glow: true });
      k.rod([0.2, 0.47, 0.06], [-0.12, 0.76, 0.06], 0.012, AIR.black);
      // A long honey dipper.
      k.rod([-0.24, 0.4, 0.18], [-0.24, 0.98, 0.22], 0.018, AIR.timber);
      for (let i = 0; i < 3; i++) k.cyl(0.05 - i * 0.008, 0.05 - i * 0.008, 0.035, [-0.24, 0.98 + i * 0.045, 0.22], i % 2 ? AIR.honey : AIR.amber, { seg: 8 });
      k.ball(0.03, [-0.24, 0.92, 0.23], AIR.glow, { glow: true });
      // A small kite flying from a pole on the back.
      const kt = [0.08, 1.62, -0.3];
      k.rod([0.02, 0.5, -0.17], kt, 0.014, AIR.timber);
      k.push({ p: kt, r: [0.4, 0.4, 0.2] });
      k.octa(0.17, [0, 0, 0], AIR.honey, { s: [0.75, 1.1, 0.08] });
      k.box(0.02, 0.36, 0.03, [0, 0, 0.01], AIR.black); k.box(0.24, 0.02, 0.03, [0, 0.03, 0.01], AIR.black);
      k.pop();
      k.rod([kt[0], kt[1] - 0.18, kt[2]], [kt[0] + 0.04, kt[1] - 0.42, kt[2] - 0.12], 0.008, AIR.black);
    },
    infantry(k) {
      const f = figure(k, { skin: SKIN[1], top: AIR.black, skirt: AIR.honey, legs: AIR.black, belt: AIR.timber, sleeve: AIR.black, glove: AIR.honey, hands: { l: [0.27, 0.6, 0.18], r: [-0.25, 0.55, 0.12] } });
      // Golden honeycomb plates on the chest.
      for (const [x, y] of [[-0.075, 0.56], [0.075, 0.56], [0, 0.645], [-0.075, 0.73], [0.075, 0.73]]) k.hex(0.048, 0.03, [x, y, 0.15], '#e8b830', { r: [Math.PI / 2, 0, 0] });
      for (const x of [0.2, -0.2]) { k.ball(0.095, [x, f.shY + 0.02, 0], AIR.honey, { tl: Math.PI / 2 }); k.hex(0.05, 0.03, [x, f.shY + 0.1, 0], AIR.amber); }
      const [hx, hy] = f.head;
      // A tall hive helm with an amber visor and two antennae.
      for (let i = 0; i < 6; i++) k.torus(0.165 - i * 0.024, 0.03, [hx, hy + 0.03 + i * 0.05, 0], i % 2 ? AIR.strawD : AIR.straw, { r: [Math.PI / 2, 0, 0], ts: 14 });
      k.ball(0.04, [hx, hy + 0.32, 0], AIR.strawD);
      k.box(0.22, 0.05, 0.03, [hx, hy + 0.0, 0.15], AIR.glow, { glow: true });
      for (const x of [0.05, -0.05]) { k.rod([x, hy + 0.3, 0], [x * 2.6, hy + 0.48, 0.06], 0.008, AIR.black); k.ball(0.022, [x * 2.6, hy + 0.48, 0.06], AIR.amber); }
      // A glowing amber hexagon shield.
      k.push({ p: [0.34, 0.6, 0.2], r: [Math.PI / 2, 0, -0.25] });
      k.hex(0.24, 0.04, [0, 0, 0], AIR.strawD);
      k.hex(0.2, 0.05, [0, 0, 0], AIR.honey);
      k.hex(0.045, 0.06, [0, 0, 0], AIR.glow, { glow: true });
      around(6, 0.095, (x, z) => k.hex(0.04, 0.058, [x, 0, z], AIR.amber));
      k.pop();
      // A stinger-tipped spear.
      const top = spear(k, [-0.25, 0.55, 0.12], 1.3, AIR.timber, AIR.black);
      k.cone(0.05, 0.12, [top[0], top[1] - 0.02, top[2]], AIR.honey, { seg: 6, r: [Math.PI, 0, 0] });
    },
    ranged(k) {
      const f = figure(k, { skin: SKIN[0], top: AIR.cream, skirt: AIR.honey, legs: AIR.timber, belt: AIR.black, sleeve: AIR.honey, hands: ARCHER_HANDS });
      const [hx, hy] = f.head;
      k.ball(0.165, [hx, hy + 0.04, -0.01], AIR.honey, { tl: Math.PI * 0.5, ws: 12 });
      k.torus(0.15, 0.022, [hx, hy + 0.07, 0], AIR.black, { r: [Math.PI / 2 - 0.15, 0, 0] });
      k.ball(0.04, [0.06, hy + 0.1, 0.13], AIR.amber); k.ball(0.04, [-0.06, hy + 0.1, 0.13], AIR.amber);
      // A striped sail-cloth cape that billows behind.
      k.push({ p: [0, 0.92, -0.16], r: [0.55, 0, 0] });
      for (let j = -2; j <= 2; j++) k.box(0.08, 0.6, 0.02, [j * 0.075, -0.3, -Math.abs(j) * 0.03], j % 2 ? AIR.black : AIR.honey, { r: [0, j * 0.18, 0] });
      k.pop();
      // A hexagonal quiver.
      k.hex(0.065, 0.38, [-0.1, 0.8, -0.22], AIR.strawD, { r: [0.3, 0, 0.25] });
      bow(k, 0.4, AIR.timber, '#e8dcc0', { tips: AIR.amber });
      k.rod([0.02, 0.8, 0.0], [0.42, 0.8, 0.42], 0.01, AIR.timber);
      k.point([0.42, 0.8, 0.42], [0.47, 0.8, 0.47], 0.025, AIR.black, { seg: 4 });
      // A ring of wind around the arrow.
      for (const t of [0.4, 0.75]) k.torus(0.07 - t * 0.02, 0.009, [0.02 + 0.4 * t, 0.8, 0.42 * t], '#fff3c0', { r: [0, Math.PI / 4, 0], glow: true });
    },
    special(k) {
      // Glider: skimming just above the ground under a striped canvas wing.
      k.push({ p: [0, 0.14, 0] });
      const f = figure(k, { skin: SKIN[3], top: AIR.honey, skirt: AIR.cream, legs: AIR.cream, belt: AIR.black, stride: 0.07, hands: { l: [0.2, 1.18, 0.06], r: [-0.2, 1.18, 0.06] }, hair: '#2a1e18' });
      const [hx, hy] = f.head;
      k.torus(0.15, 0.02, [hx, hy + 0.02, 0], AIR.black, { r: [Math.PI / 2, 0, 0] });
      k.ball(0.04, [0.06, hy + 0.01, 0.14], AIR.amber); k.ball(0.04, [-0.06, hy + 0.01, 0.14], AIR.amber);
      // The timber frame and the wing.
      k.rod([0.2, 1.18, 0.06], [-0.2, 1.18, 0.06], 0.014, AIR.timber);
      for (const x of [0.2, -0.2]) k.rod([x, 1.18, 0.06], [0, 1.55, 0.02], 0.012, AIR.timber);
      k.push({ p: [0, 1.56, 0], r: [-0.12, 0, 0] });
      // One delta wing pointing forward, with black stripes across it.
      k.cyl(0.78, 0.78, 0.025, [0, 0, -0.12], AIR.honey, { seg: 3, s: [1.25, 1, 1] });
      for (const [z, w] of [[-0.3, 1.5], [-0.08, 1.0], [0.14, 0.55]]) k.box(w, 0.03, 0.06, [0, 0.004, z], AIR.black);
      k.rod([0, 0.02, 0.42], [0, 0.02, -0.55], 0.016, AIR.timber);
      k.box(0.02, 0.1, 0.22, [0, -0.02, -0.66], AIR.honey, { r: [0.2, 0, 0] });
      k.pop();
      k.pop();
    },
    hero(k) {
      k.push({ s: 1.18 });
      const f = figure(k, { skin: SKIN[1], top: AIR.honey, robe: true, skirt: AIR.honey, legs: AIR.honey, belt: AIR.black, sleeve: AIR.cream, hands: { l: [0.2, 0.62, 0.18], r: [-0.26, 0.72, 0.14] }, hair: '#3a2a1a' });
      k.cyl(0.26, 0.28, 0.04, [0, 0.03, 0], AIR.black, { seg: 12 });
      // A long cloak and a crown of amber hexagons.
      k.cyl(0.21, 0.32, 0.8, [0, 0.5, -0.03], AIR.black, { seg: 12, open: true, t0: Math.PI * 0.7, arc: Math.PI * 0.6 });
      k.torus(0.2, 0.02, [0, f.shY + 0.03, 0], AIR.honey, { r: [Math.PI / 2, 0, 0] });
      const [hx, hy] = f.head;
      around(6, 0.12, (x, z) => k.hex(0.04, 0.09, [hx + x, hy + 0.17, z], AIR.glow, { glow: true }));
      k.torus(0.13, 0.018, [hx, hy + 0.13, 0], '#e8b830', { r: [Math.PI / 2, 0, 0] });
      // A staff topped by a wind rose with a floating amber crystal.
      k.rod([-0.26, 0.05, 0.14], [-0.26, 1.5, 0.14], 0.022, AIR.timber);
      k.push({ p: [-0.26, 1.52, 0.14] });
      k.octa(0.16, [0, 0, 0], AIR.honey, { s: [1, 1, 0.18] });
      k.octa(0.12, [0, 0, 0.01], AIR.black, { s: [1, 1, 0.2], r: [0, 0, Math.PI / 4] });
      k.octa(0.09, [0, 0.26, 0], AIR.glow, { s: [1, 1.6, 1], glow: true });
      k.torus(0.13, 0.008, [0, 0.26, 0], '#fff3c0', { r: [Math.PI / 2, 0, 0], glow: true });
      k.pop();
      k.pop();
    },
  },

  water: {
    worker(k) {
      const f = figure(k, { skin: SKIN[3], top: WAT.blue, skirt: WAT.deep, legs: WAT.sand, belt: WAT.bronze, hands: { l: [0.22, 0.5, 0.14], r: [-0.24, 0.45, 0.16] } });
      const [hx, hy] = f.head;
      // A spiral shell hat with a glass bubble on top, and bronze goggles.
      k.cyl(0.22, 0.22, 0.02, [hx, hy + 0.07, 0], WAT.pearl, { seg: 12 });
      k.cone(0.17, 0.3, [hx, hy + 0.21, -0.02], WAT.pearl, { seg: 10, r: [-0.15, 0, 0] });
      for (let i = 0; i < 3; i++) k.torus(0.14 - i * 0.04, 0.02, [hx, hy + 0.11 + i * 0.07, -0.02 - i * 0.012], WAT.sheen, { r: [Math.PI / 2 - 0.15, 0, i], ts: 14 });
      k.ball(0.07, [hx, hy + 0.4, -0.06], GLASS);
      k.ball(0.025, [hx + 0.025, hy + 0.43, -0.03], '#ffffff', { glow: true });
      for (const x of [0.06, -0.06]) k.torus(0.035, 0.012, [x, hy + 0.06, 0.13], WAT.bronze);
      // A net of pearls and glass floats over the shoulder.
      k.ball(0.16, [0.04, 0.66, -0.2], '#c8b088', { s: [1, 1.1, 0.8] });
      for (const [x, y, z, c] of [[0.1, 0.72, -0.08, WAT.pearl], [-0.02, 0.62, -0.06, WAT.pearl], [0.06, 0.54, -0.1, '#9fd8e8'], [-0.06, 0.76, -0.1, '#9fd8e8']]) k.ball(0.045, [x, y, z], c);
      k.rod([0.16, 0.76, 0.0], [0.04, 0.82, -0.12], 0.012, '#a8885a');
      // A bronze rake.
      k.rod([-0.24, 0.25, 0.16], [-0.24, 0.98, 0.18], 0.018, '#8a6a4a');
      k.box(0.2, 0.03, 0.03, [-0.24, 0.98, 0.2], WAT.bronze);
      for (let i = -2; i <= 2; i++) k.box(0.015, 0.07, 0.015, [-0.24 + i * 0.045, 1.02, 0.2], WAT.bronze);
    },
    infantry(k) {
      const f = figure(k, { skin: SKIN[0], top: WAT.deep, skirt: WAT.blue, legs: WAT.deep, belt: WAT.bronze, sleeve: WAT.pearl, hands: { l: [0.27, 0.6, 0.18], r: [-0.25, 0.55, 0.12] } });
      // Layered mother-of-pearl armour with bronze trim.
      for (const [y, r] of [[0.74, 0.16], [0.64, 0.168], [0.54, 0.174]]) { k.cyl(r, r + 0.012, 0.12, [0, y, 0], WAT.pearl, { seg: 12, open: true, t0: -1.0, arc: 2.0 }); k.torus(r + 0.008, 0.01, [0, y - 0.06, 0], WAT.bronze, { r: [Math.PI / 2, 0, 0], arc: 2.0, ts: 10 }); }
      for (const x of [0.2, -0.2]) { k.ball(0.1, [x, f.shY + 0.02, 0], WAT.pearl, { tl: Math.PI / 2, s: [1, 0.8, 1] }); k.torus(0.09, 0.012, [x, f.shY, 0], WAT.bronze, { r: [Math.PI / 2, 0, 0] }); }
      const [hx, hy] = f.head;
      // A conch-spiral helm with a bronze rim and crest.
      k.ball(0.172, [hx, hy + 0.02, 0], WAT.pearl, { tl: Math.PI * 0.55, ws: 12 });
      k.torus(0.168, 0.018, [hx, hy + 0.0, 0], WAT.bronze, { r: [Math.PI / 2, 0, 0] });
      k.cone(0.14, 0.42, [hx, hy + 0.32, -0.05], WAT.pearl, { seg: 10, r: [-0.28, 0, 0] });
      for (let i = 0; i < 5; i++) k.torus(0.13 - i * 0.024, 0.016, [hx, hy + 0.16 + i * 0.07, -0.01 - i * 0.026], WAT.sheen, { r: [Math.PI / 2 - 0.28, 0, i * 0.7], ts: 14 });
      // A round spiral shield.
      k.push({ p: [0.34, 0.6, 0.2], r: [Math.PI / 2, 0, -0.3] });
      k.cyl(0.22, 0.22, 0.04, [0, 0, 0], WAT.pearl, { seg: 16 });
      k.torus(0.22, 0.02, [0, 0, 0], WAT.bronze, { r: [Math.PI / 2, 0, 0], ts: 20 });
      for (let i = 0; i < 4; i++) k.torus(0.17 - i * 0.04, 0.012, [0.012 * i, 0.025, 0.01 * i], WAT.sheen, { r: [Math.PI / 2, 0, 0], arc: Math.PI * 1.6, ts: 14 });
      k.ball(0.04, [0.04, 0.03, 0.03], WAT.bronze);
      k.pop();
      // A bronze-headed trident.
      const top = [-0.25, 1.27, 0.12];
      k.rod([-0.25, 0.0, 0.12], top, 0.022, WAT.coral);
      k.box(0.18, 0.03, 0.03, [-0.25, top[1], 0.12], WAT.bronze);
      for (const dx of [-0.08, 0, 0.08]) k.cone(0.025, dx ? 0.14 : 0.18, [-0.25 + dx, top[1] + (dx ? 0.08 : 0.1), 0.12], WAT.bronze, { seg: 4 });
    },
    ranged(k) {
      const f = figure(k, { skin: SKIN[2], top: WAT.pearl, skirt: WAT.deep, legs: WAT.deep, belt: WAT.bronze, sleeve: WAT.blue, hands: ARCHER_HANDS, hair: '#1a1410' });
      const [hx, hy] = f.head;
      k.torus(0.155, 0.018, [hx, hy + 0.06, 0], WAT.bronze, { r: [Math.PI / 2 - 0.1, 0, 0] });
      k.ball(0.03, [hx, hy + 0.07, 0.15], WAT.glow, { glow: true });
      // A deep-blue cape with a wave-shaped hem.
      k.cyl(0.2, 0.3, 0.62, [0, 0.52, -0.04], WAT.deep, { seg: 12, open: true, t0: Math.PI * 0.7, arc: Math.PI * 0.6 });
      for (let i = 0; i < 5; i++) { const a = Math.PI * 0.75 + (i / 4) * Math.PI * 0.5; k.ball(0.05, [Math.sin(a) * 0.3, 0.22, Math.cos(a) * 0.3 - 0.04], WAT.blue, { s: [1, 0.6, 1] }); }
      k.cyl(0.06, 0.05, 0.36, [-0.08, 0.78, -0.22], WAT.blue, { r: [0.3, 0, 0.25] });
      for (const dx of [-0.02, 0.03]) k.ball(0.026, [-0.14 + dx, 0.97, -0.28], WAT.glow, { glow: true });
      bow(k, 0.4, WAT.pearl, '#e8eef4', { tips: WAT.bronze });
      k.rod([0.02, 0.8, 0.0], [0.42, 0.8, 0.42], 0.01, '#8a6a4a');
      k.ball(0.04, [0.45, 0.8, 0.45], WAT.glow, { glow: true });
      k.ball(0.018, [0.5, 0.86, 0.47], WAT.glow, { glow: true });
    },
    special(k) {
      const f = figure(k, { skin: SKIN[0], top: WAT.deep, robe: true, skirt: WAT.blue, legs: WAT.deep, belt: WAT.pearl, sleeve: WAT.deep, hands: { l: [0.17, 0.84, 0.22], r: [-0.17, 0.84, 0.22] }, hair: '#d8d0c0' });
      k.cyl(0.27, 0.28, 0.04, [0, 0.03, 0], WAT.pearl, { seg: 12 });
      k.rod([0, f.shY, 0.15], [0, 0.1, 0.25], 0.04, WAT.pearl, { r2: 0.05 });
      const [hx, hy] = f.head;
      // A tall shell crown.
      for (let i = -3; i <= 3; i++) k.cone(0.045, 0.2 - Math.abs(i) * 0.03, [Math.sin(i * 0.42) * 0.13, hy + 0.19 - Math.abs(i) * 0.02, Math.cos(i * 0.42) * 0.05], i ? WAT.pearl : WAT.coral, { seg: 6, r: [0, 0, -i * 0.28] });
      // A glass orb, and ribbons of glowing water curling around.
      k.ball(0.11, [0, 0.98, 0.27], GLASS);
      k.ball(0.06, [0, 0.98, 0.27], WAT.glow, { glow: true });
      k.torus(0.34, 0.013, [0, 0.55, 0], WAT.glow, { r: [Math.PI / 2 - 0.3, 0, 0.5], arc: Math.PI * 1.3, glow: true });
      k.torus(0.28, 0.011, [0, 0.95, 0], WAT.glow, { r: [Math.PI / 2 + 0.35, 0, -0.4], arc: Math.PI * 1.1, glow: true });
      for (const [x, y, z] of [[0.3, 1.2, 0.1], [-0.28, 0.75, 0.2], [0.2, 0.35, 0.3]]) k.ball(0.028, [x, y, z], WAT.glow, { glow: true });
    },
    hero(k) {
      k.push({ s: 1.18 });
      const f = figure(k, { skin: SKIN[1], top: WAT.deep, robe: true, skirt: WAT.deep, legs: '#2a2a3a', belt: WAT.bronze, sleeve: WAT.deep, hands: { l: [0.14, 0.98, 0.22], r: [-0.24, 0.5, 0.12] }, hair: '#2a1a12' });
      k.cyl(0.26, 0.27, 0.04, [0, 0.03, 0], WAT.pearl, { seg: 12 });
      for (const y of [0.3, 0.45, 0.6, 0.72]) k.ball(0.018, [0, y, 0.2 - y * 0.06], WAT.pearl);
      k.box(0.06, 0.6, 0.02, [0, 0.42, 0.19], WAT.blue, { r: [-0.1, 0, 0] });
      const [hx, hy] = f.head;
      // A shell tricorn.
      k.cyl(0.26, 0.24, 0.04, [hx, hy + 0.1, 0], WAT.pearl, { seg: 3, r: [0, Math.PI / 6, 0] });
      k.ball(0.14, [hx, hy + 0.12, 0], WAT.pearl, { tl: Math.PI / 2 });
      k.torus(0.14, 0.014, [hx, hy + 0.13, 0], WAT.bronze, { r: [Math.PI / 2, 0, 0] });
      k.cone(0.04, 0.12, [hx + 0.06, hy + 0.27, 0.02], WAT.coral, { seg: 6, r: [0, 0, -0.4] });
      // A bronze spyglass, held up.
      k.rod([0.1, 0.98, 0.2], [0.14, 1.0, 0.56], 0.03, WAT.bronze, { r2: 0.045 });
      k.torus(0.045, 0.01, [0.14, 1.0, 0.56], '#e8c070', { r: [0, Math.PI / 2 - 0.1, 0] });
      // Two bronze rings turning behind, around a glowing orb.
      k.torus(0.34, 0.016, [0, 0.95, -0.3], WAT.bronze, { r: [0.2, 0.6, 0], ts: 24 });
      k.torus(0.3, 0.014, [0, 0.95, -0.3], WAT.bronze, { r: [1.2, -0.4, 0], ts: 24 });
      k.ball(0.07, [0, 0.95, -0.3], WAT.glow, { glow: true });
      k.pop();
    },
  },

  fire: {
    worker(k) {
      const f = figure(k, { skin: SKIN[1], top: FIR.scarlet, skirt: FIR.leather, legs: '#3a2a22', belt: FIR.gold, stocky: true, sleeve: FIR.scarlet, forearm: FIR.iron, glove: FIR.iron, hands: { l: [0.27, 0.6, 0.24], r: [-0.2, 0.95, -0.05] } });
      // A scorched apron with gold rivets.
      k.box(0.32, 0.46, 0.04, [0, 0.52, 0.19], '#5a3420');
      for (const x of [-0.12, 0.12]) for (const y of [0.4, 0.7]) k.ball(0.017, [x, y, 0.215], FIR.gold);
      const [hx, hy] = f.head;
      k.ball(0.165, [hx, hy + 0.035, 0], FIR.scarlet, { tl: Math.PI * 0.42, ws: 12 });
      k.torus(0.16, 0.016, [hx, hy + 0.05, 0], FIR.gold, { r: [Math.PI / 2, 0, 0] });
      // A glowing anvil-stone in the left hand.
      k.box(0.18, 0.11, 0.14, [0.27, 0.64, 0.3], FIR.basalt);
      k.box(0.16, 0.02, 0.12, [0.27, 0.705, 0.3], FIR.glow, { glow: true });
      k.box(0.02, 0.09, 0.145, [0.24, 0.64, 0.3], FIR.glow, { glow: true });
      // A forge hammer with a gold band over the shoulder.
      k.rod([-0.2, 0.95, -0.05], [-0.22, 1.08, -0.47], 0.026, '#3a2a22');
      k.box(0.16, 0.14, 0.22, [-0.22, 1.11, -0.52], FIR.iron);
      k.box(0.17, 0.03, 0.23, [-0.22, 1.11, -0.52], FIR.gold);
    },
    infantry(k) {
      const f = figure(k, { skin: SKIN[2], top: FIR.basalt, skirt: FIR.scarlet, legs: FIR.basalt, belt: FIR.gold, sleeve: FIR.basalt, glove: FIR.iron, hands: { l: [0.27, 0.6, 0.18], r: [-0.25, 0.55, 0.12] } });
      // Stepped basalt armour with glowing magma seams.
      for (const [y, w] of [[0.54, 0.34], [0.64, 0.3], [0.74, 0.26]]) { k.box(w, 0.09, 0.08, [0, y, 0.13], FIR.basalt); k.box(w - 0.02, 0.012, 0.085, [0, y - 0.05, 0.13], FIR.glow, { glow: true }); }
      for (const x of [0.21, -0.21]) { k.box(0.14, 0.06, 0.16, [x, f.shY + 0.04, 0], FIR.basalt); k.box(0.1, 0.05, 0.12, [x, f.shY + 0.09, 0], FIR.scarlet); for (const z of [-0.04, 0.04]) k.cone(0.025, 0.12, [x * 1.1, f.shY + 0.16, z], FIR.iron, { seg: 4 }); }
      const [hx, hy] = f.head;
      k.ball(0.172, [hx, hy + 0.02, 0], FIR.basalt, { tl: Math.PI * 0.6, ws: 12 });
      k.box(0.2, 0.05, 0.03, [hx, hy - 0.01, 0.15], FIR.gold);
      for (const s of [1, -1]) k.box(0.02, 0.16, 0.18, [s * 0.05, hy + 0.2, 0], FIR.scarlet, { r: [0, 0, s * 0.15] });
      k.cone(0.07, 0.22, [hx, hy + 0.32, -0.02], FIR.glow, { seg: 6, glow: true });
      k.cone(0.04, 0.16, [hx, hy + 0.38, -0.02], FIR.hot, { seg: 6, glow: true });
      // A shield bearing a gold lion face with a fiery mane.
      k.push({ p: [0.34, 0.58, 0.2], r: [0, 0.35, 0] });
      k.box(0.34, 0.44, 0.04, [0, 0, 0], FIR.scarlet);
      k.box(0.28, 0.38, 0.05, [0, 0, 0.005], FIR.basalt);
      around(10, 0.1, (x, y, a) => k.cone(0.03, 0.08, [x, y, 0.03], FIR.glow, { seg: 4, r: [0, 0, a - Math.PI / 2], glow: true }));
      k.ball(0.075, [0, 0, 0.04], FIR.gold, { s: [1, 1, 0.6] });
      for (const x of [-0.025, 0.025]) k.box(0.014, 0.014, 0.01, [x, 0.015, 0.088], '#2a1a12');
      k.box(0.03, 0.02, 0.01, [0, -0.025, 0.088], '#8a3a10');
      k.pop();
      const top = spear(k, [-0.25, 0.55, 0.12], 1.3, '#3a2a22', FIR.gold);
      k.cone(0.03, 0.1, [top[0], top[1] + 0.2, top[2]], FIR.glow, { seg: 5, glow: true });
    },
    ranged(k) {
      const f = figure(k, { skin: SKIN[2], top: FIR.scarlet, skirt: FIR.basalt, legs: '#3a2a22', belt: FIR.gold, sleeve: FIR.basalt, hands: ARCHER_HANDS });
      const [hx, hy] = f.head;
      k.hood(0.19, [hx, hy + 0.02, -0.01], FIR.scarlet, { tl: Math.PI * 0.7 });
      k.cone(0.07, 0.16, [hx, hy + 0.15, -0.13], FIR.scarlet, { seg: 6, r: [-0.7, 0, 0] });
      k.box(0.2, 0.06, 0.04, [hx, hy - 0.06, 0.14], FIR.iron);
      k.box(0.18, 0.012, 0.045, [hx, hy - 0.035, 0.14], FIR.gold);
      // A quiver of burning arrows.
      k.cyl(0.06, 0.05, 0.38, [-0.08, 0.78, -0.2], FIR.basalt, { r: [0.3, 0, 0.25] });
      for (const dx of [-0.03, 0.01, 0.05]) k.cone(0.026, 0.07, [-0.15 + dx, 1.0, -0.28], FIR.glow, { seg: 5, glow: true });
      bow(k, 0.4, FIR.basalt, '#d8c8a0', { tips: FIR.gold });
      k.rod([0.02, 0.8, 0.0], [0.42, 0.8, 0.42], 0.01, '#3a2a22');
      k.ball(0.045, [0.45, 0.8, 0.45], FIR.glow, { glow: true });
      k.point([0.44, 0.82, 0.44], [0.37, 0.88, 0.37], 0.03, FIR.hot, { glow: true });
    },
    special(k) {
      // Ember Rider: an armoured war boar with glowing tusks and bristles.
      k.push({ p: [0, -0.1, 0] });
      k.ball(0.36, [0, 0.52, -0.05], FIR.basalt, { s: [0.85, 0.8, 1.35], ws: 12 });
      k.ball(0.22, [0, 0.5, 0.42], '#3a3236', { s: [0.9, 0.85, 1.1] });
      k.cyl(0.11, 0.13, 0.12, [0, 0.45, 0.62], '#4a3a3a', { r: [Math.PI / 2, 0, 0] });
      k.box(0.26, 0.18, 0.05, [0, 0.6, 0.56], FIR.scarlet, { r: [-0.5, 0, 0] });
      k.box(0.14, 0.03, 0.055, [0, 0.62, 0.57], FIR.gold, { r: [-0.5, 0, 0] });
      for (const s of [1, -1]) {
        k.cone(0.03, 0.22, [s * 0.1, 0.46, 0.66], FIR.hot, { seg: 5, r: [-1.1, 0, -s * 0.3], glow: true });
        k.cone(0.05, 0.1, [s * 0.14, 0.7, 0.42], '#3a3236', { seg: 4, r: [0, 0, -s * 0.4] });
        k.ball(0.022, [s * 0.09, 0.58, 0.6], FIR.glow, { glow: true });
        // Iron side plates with a magma seam.
        k.box(0.04, 0.26, 0.5, [s * 0.3, 0.52, -0.05], FIR.iron, { r: [0, 0, s * 0.2] });
        k.box(0.045, 0.02, 0.48, [s * 0.3, 0.5, -0.05], FIR.glow, { r: [0, 0, s * 0.2], glow: true });
      }
      for (let i = 0; i < 6; i++) k.cone(0.05, 0.16, [0, 0.86 - Math.abs(i - 2.5) * 0.015, 0.3 - i * 0.13], FIR.glow, { seg: 4, glow: true, r: [-0.4, 0, 0] });
      for (const [x, z] of [[0.17, 0.3], [-0.17, 0.3], [0.17, -0.35], [-0.17, -0.35]]) { k.rod([x, 0.38, z], [x, 0.16, z + 0.03], 0.085, '#2a2428', { r2: 0.07 }); k.box(0.12, 0.08, 0.13, [x, 0.14, z + 0.04], '#1e1a1c'); }
      k.box(0.6, 0.04, 0.42, [0, 0.82, -0.06], FIR.scarlet);
      k.box(0.62, 0.02, 0.44, [0, 0.8, -0.06], FIR.gold);
      k.pop();
      // The rider, with a flame banner.
      k.push({ p: [0, 0.32, -0.08] });
      const f = figure(k, { skin: SKIN[3], top: FIR.scarlet, skirt: FIR.basalt, legs: FIR.basalt, belt: FIR.gold, sleeve: FIR.iron, hands: { l: [0.2, 0.52, 0.22], r: [-0.24, 0.66, 0.12] }, hair: '#2a1a12' });
      const [hx, hy] = f.head;
      k.ball(0.17, [hx, hy + 0.03, 0], FIR.basalt, { tl: Math.PI * 0.5, ws: 12 });
      k.cone(0.05, 0.18, [hx, hy + 0.24, 0], FIR.glow, { seg: 6, glow: true });
      k.pop();
      k.rod([-0.24, 0.6, 0.04], [-0.26, 1.75, -0.02], 0.018, '#3a2a22');
      k.box(0.02, 0.3, 0.34, [-0.26, 1.55, -0.2], FIR.scarlet);
      k.box(0.021, 0.08, 0.34, [-0.26, 1.42, -0.2], FIR.gold);
      k.cone(0.05, 0.16, [-0.26, 1.83, -0.02], FIR.glow, { seg: 6, glow: true });
    },
    hero(k) {
      k.push({ s: 1.2 });
      const f = figure(k, { skin: SKIN[2], top: FIR.scarlet, skirt: FIR.basalt, legs: FIR.basalt, belt: FIR.gold, sleeve: FIR.scarlet, glove: FIR.iron, stocky: true, hands: { l: [0.26, 0.55, 0.16], r: [-0.22, 0.72, 0.22] }, hair: '#2a1a12' });
      // Red iron plate with gold trim, and a mane of flame on the shoulders.
      k.box(0.36, 0.3, 0.06, [0, 0.66, 0.16], FIR.scarlet);
      k.box(0.37, 0.03, 0.065, [0, 0.8, 0.16], FIR.gold); k.box(0.37, 0.03, 0.065, [0, 0.52, 0.16], FIR.gold);
      around(9, 0.2, (x, z, a) => { if (z < 0.05) k.cone(0.05, 0.2, [x, f.shY + 0.1, z * 0.9 - 0.02], FIR.glow, { seg: 5, glow: true, r: [-z * 1.5, 0, -x * 1.6] }); });
      // A scarlet cape.
      k.box(0.42, 0.7, 0.03, [0, 0.5, -0.22], FIR.scarlet, { r: [0.18, 0, 0] });
      const [hx, hy] = f.head;
      // A gold crown of fire.
      k.torus(0.14, 0.022, [hx, hy + 0.1, 0], FIR.gold, { r: [Math.PI / 2, 0, 0] });
      around(6, 0.12, (x, z) => k.cone(0.03, 0.11, [hx + x, hy + 0.18, z], FIR.glow, { seg: 5, glow: true }));
      // A great blade with a glowing magma edge.
      k.rod([-0.22, 0.62, 0.22], [-0.22, 0.82, 0.24], 0.025, '#3a2a22');
      k.box(0.2, 0.03, 0.05, [-0.22, 0.84, 0.24], FIR.gold);
      k.box(0.11, 0.8, 0.03, [-0.22, 1.25, 0.26], FIR.iron);
      k.box(0.02, 0.78, 0.032, [-0.165, 1.25, 0.26], FIR.glow, { glow: true });
      k.box(0.02, 0.78, 0.032, [-0.275, 1.25, 0.26], FIR.glow, { glow: true });
      k.cone(0.065, 0.14, [-0.22, 1.72, 0.26], FIR.iron, { seg: 4, s: [1, 1, 0.4] });
      k.pop();
    },
  },

  earth: {
    worker(k) {
      const f = figure(k, { skin: SKIN[0], top: EAR.moss, skirt: EAR.bark, legs: '#5a4a32', belt: EAR.barkD, hands: { l: [0.22, 0.48, 0.12], r: [-0.25, 0.5, 0.14] } });
      const [hx, hy] = f.head;
      // A big spotted mushroom hat.
      k.ball(0.3, [hx, hy + 0.1, 0], EAR.cap, { tl: Math.PI / 2, s: [1, 0.6, 1], ws: 14 });
      k.cyl(0.29, 0.22, 0.04, [hx, hy + 0.1, 0], '#efe4c8', { seg: 14 });
      for (const [x, z] of [[0.12, 0.12], [-0.14, 0.06], [0.02, -0.16], [-0.06, 0.2], [0.18, -0.06]]) k.ball(0.035, [hx + x, hy + 0.1 + 0.18 * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / 0.09)) * 0.95, z], '#ffffff', { s: [1, 0.5, 1] });
      // A moss cloak sprouting flowers.
      k.cyl(0.2, 0.27, 0.56, [0, 0.55, -0.05], EAR.moss, { seg: 10, open: true, t0: Math.PI * 0.72, arc: Math.PI * 0.56 });
      for (let i = 0; i < 5; i++) { const a = Math.PI * 0.8 + i * 0.24; k.ball(0.025, [Math.sin(a) * 0.24, 0.4 + (i % 3) * 0.14, Math.cos(a) * 0.24 - 0.05], FLOWER[i % 3]); }
      // A basket of glowing mushrooms.
      k.push({ p: [0.2, 0.42, 0.14] });
      k.cyl(0.1, 0.08, 0.1, [0, 0, 0], EAR.bark, { seg: 10 });
      for (const [x, z] of [[0.03, 0.02], [-0.04, -0.02], [0.0, -0.05]]) { k.cyl(0.012, 0.014, 0.06, [x, 0.07, z], '#efe4c8'); k.ball(0.035, [x, 0.1, z], EAR.glow, { tl: Math.PI / 2, glow: true }); }
      k.pop();
      // A rune-carved hoe.
      k.rod([-0.25, 0.2, 0.14], [-0.25, 0.98, 0.14], 0.02, EAR.bark);
      k.box(0.04, 0.12, 0.15, [-0.25, 0.98, 0.21], EAR.stoneD, { r: [0.5, 0, 0] });
      k.box(0.012, 0.12, 0.012, [-0.25, 0.7, 0.165], EAR.glow, { glow: true });
    },
    infantry(k) {
      const f = figure(k, { skin: SKIN[3], top: EAR.bark, skirt: EAR.leaf, legs: EAR.barkD, belt: EAR.moss, sleeve: EAR.barkD, glove: EAR.bark, hands: { l: [0.27, 0.6, 0.18], r: [-0.25, 0.55, 0.12] } });
      // Thick, layered bark with moss in the joints.
      for (const [y, w, r] of [[0.5, 0.36, -0.06], [0.6, 0.34, 0.08], [0.7, 0.32, -0.05], [0.79, 0.28, 0.06]]) k.box(w, 0.09, 0.07, [0, y, 0.14], y % 0.2 > 0.1 ? EAR.barkD : EAR.bark, { r: [0, 0, r] });
      for (const x of [0.12, -0.12]) k.ico(0.04, [x, 0.65, 0.18], EAR.moss, { s: [1.2, 0.6, 1] });
      for (const x of [0.21, -0.21]) { k.dodeca(0.1, [x, f.shY + 0.03, 0], EAR.bark, { s: [1.1, 0.8, 1] }); k.ico(0.06, [x, f.shY + 0.1, 0], EAR.moss, { s: [1.3, 0.5, 1] }); }
      const [hx, hy] = f.head;
      // A leafy antler helm.
      k.ball(0.175, [hx, hy + 0.025, 0], EAR.barkD, { tl: Math.PI * 0.55, ws: 12 });
      for (const x of [1, -1]) {
        k.rod([0.1 * x, hy + 0.12, 0], [0.24 * x, hy + 0.38, -0.02], 0.022, EAR.bark, { r2: 0.012 });
        k.rod([0.18 * x, hy + 0.27, -0.01], [0.32 * x, hy + 0.32, 0.07], 0.012, EAR.bark, { r2: 0.008 });
        k.rod([0.21 * x, hy + 0.33, -0.02], [0.17 * x, hy + 0.47, -0.06], 0.011, EAR.bark, { r2: 0.007 });
        for (const [dx, dy] of [[0.24, 0.39], [0.32, 0.33], [0.17, 0.48], [0.28, 0.24]]) k.ico(0.04, [dx * x, hy + dy, 0], EAR.leafL);
      }
      // A shield cut from a tree trunk, with growth rings and a glowing rune.
      k.push({ p: [0.34, 0.6, 0.2], r: [Math.PI / 2, 0, -0.35] });
      k.cyl(0.22, 0.22, 0.06, [0, 0, 0], EAR.bark, { seg: 14 });
      k.cyl(0.19, 0.19, 0.065, [0, 0, 0], '#c8a070', { seg: 14 });
      for (const r of [0.15, 0.1, 0.05]) k.torus(r, 0.007, [0, 0.035, 0], '#8a6a40', { r: [Math.PI / 2, 0, 0], ts: 16 });
      k.octa(0.09, [0, 0.04, 0], EAR.glow, { s: [0.55, 0.3, 1], glow: true });
      k.pop();
      const top = spear(k, [-0.25, 0.55, 0.12], 1.3, EAR.bark, EAR.stone);
      for (let i = 0; i < 4; i++) k.cone(0.016, 0.07, [top[0] + (i % 2 ? 0.026 : -0.026), top[1] - 0.2 - i * 0.16, top[2]], EAR.barkD, { seg: 4, r: [0, 0, i % 2 ? -1.2 : 1.2] });
      k.ico(0.04, [top[0], top[1] - 0.1, top[2] + 0.02], EAR.leafL);
    },
    ranged(k) {
      const f = figure(k, { skin: SKIN[1], top: EAR.leaf, skirt: EAR.moss, legs: EAR.barkD, belt: EAR.bark, sleeve: EAR.leaf, hands: ARCHER_HANDS });
      const [hx, hy] = f.head;
      k.hood(0.195, [hx, hy + 0.02, -0.01], EAR.leaf, { tl: Math.PI * 0.7 });
      k.cone(0.12, 0.3, [hx, hy + 0.2, -0.1], EAR.leaf, { seg: 7, r: [-0.6, 0, 0] });
      around(7, 0.17, (x, z, a, i) => { if (z > -0.1) k.ball(0.028, [hx + x, hy + 0.12, z * 0.9], FLOWER[i % 3]); });
      k.cyl(0.21, 0.3, 0.6, [0, 0.52, -0.05], EAR.moss, { seg: 10, open: true, t0: Math.PI * 0.7, arc: Math.PI * 0.6 });
      k.cyl(0.06, 0.05, 0.36, [-0.08, 0.78, -0.22], EAR.barkD, { r: [0.3, 0, 0.25] });
      for (const dx of [-0.02, 0.03]) k.ball(0.024, [-0.14 + dx, 0.98, -0.28], EAR.glow, { glow: true });
      // A longbow wrapped in thorny briars.
      bow(k, 0.48, EAR.bark, '#d8c8a0', { thorns: EAR.barkD, leaves: EAR.leafL });
      k.rod([0.02, 0.8, 0.0], [0.42, 0.8, 0.42], 0.01, EAR.bark);
      k.ball(0.035, [0.44, 0.8, 0.44], EAR.glow, { glow: true, s: [1, 1.3, 1] });
    },
    special(k) {
      // Moss Golem: stacked stones under moss and ferns, with a glowing rune heart.
      k.push({ s: 1.4 });
      for (const x of [0.11, -0.11]) { k.dodeca(0.1, [x, 0.12, 0], EAR.stoneD, { s: [1, 1.2, 1] }); k.dodeca(0.09, [x, 0.3, 0], EAR.stone); }
      k.dodeca(0.24, [0, 0.62, 0], EAR.stone, { s: [1.05, 0.95, 0.8] });
      k.dodeca(0.16, [0, 0.42, 0], EAR.stoneD, { s: [1.1, 0.7, 0.9] });
      k.octa(0.09, [0, 0.64, 0.19], EAR.glow, { s: [0.7, 1, 0.3], glow: true });
      for (const x of [0.3, -0.3]) {
        k.dodeca(0.1, [x, 0.74, 0], EAR.stone);
        k.dodeca(0.085, [x * 1.1, 0.56, 0.04], EAR.stoneD);
        k.dodeca(0.12, [x * 1.15, 0.36, 0.08], EAR.stone, { s: [1.1, 1, 1.1] });
        k.ico(0.07, [x, 0.82, 0], EAR.moss, { s: [1.3, 0.5, 1.2] });
      }
      k.dodeca(0.13, [0, 0.95, 0.02], EAR.stoneD);
      for (const x of [0.05, -0.05]) k.box(0.045, 0.022, 0.02, [x, 0.96, 0.13], EAR.glow, { glow: true });
      k.ico(0.11, [0, 0.82, -0.04], EAR.moss, { s: [1.6, 0.5, 1.3] });
      k.ico(0.08, [0.02, 1.05, -0.02], EAR.moss, { s: [1.4, 0.5, 1.2] });
      for (const [x, z, r] of [[-0.06, -0.05, 0.3], [0.08, -0.06, -0.3], [0.0, -0.1, 0]]) k.cone(0.03, 0.2, [x, 1.12, z], EAR.leaf, { seg: 4, r: [-0.3, 0, r] });
      k.pop();
    },
    hero(k) {
      k.push({ s: 1.18 });
      const f = figure(k, { skin: SKIN[2], top: EAR.moss, robe: true, skirt: EAR.moss, legs: EAR.barkD, belt: EAR.bark, sleeve: EAR.moss, hands: { l: [0.22, 0.55, 0.16], r: [-0.24, 0.78, 0.16] }, hair: '#d8d0c0' });
      k.cyl(0.26, 0.27, 0.04, [0, 0.03, 0], EAR.leaf, { seg: 12 });
      k.octa(0.08, [0, 0.66, 0.17], EAR.glow, { s: [0.6, 1, 0.25], glow: true });
      const [hx, hy] = f.head;
      k.cone(0.07, 0.14, [hx, hy - 0.16, 0.1], '#e8e2d4', { seg: 6, r: [Math.PI - 0.3, 0, 0] });
      // An antler crown of leaves.
      for (const x of [1, -1]) {
        k.rod([0.08 * x, hy + 0.12, 0], [0.2 * x, hy + 0.36, 0], 0.016, EAR.bark, { r2: 0.009 });
        k.rod([0.15 * x, hy + 0.26, 0], [0.27 * x, hy + 0.3, 0.06], 0.01, EAR.bark);
        for (const [dx, dy] of [[0.2, 0.37], [0.27, 0.31], [0.12, 0.3]]) k.ico(0.035, [dx * x, hy + dy, 0], EAR.leafL);
      }
      // A staff of twisted roots holding a glowing rune stone.
      for (let i = 0; i < 6; i++) { const a = i * 0.9, b = (i + 1) * 0.9; k.rod([-0.24 + Math.cos(a) * 0.03, 0.05 + i * 0.25, 0.16 + Math.sin(a) * 0.03], [-0.24 + Math.cos(b) * 0.03, 0.05 + (i + 1) * 0.25, 0.16 + Math.sin(b) * 0.03], 0.02, EAR.bark); }
      around(4, 0.07, (x, z) => k.rod([-0.24, 1.5, 0.16], [-0.24 + x, 1.72, 0.16 + z], 0.012, EAR.barkD));
      k.octa(0.08, [-0.24, 1.66, 0.16], EAR.glow, { s: [0.8, 1.4, 0.8], glow: true });
      k.pop();
    },
  },
};
