
  /* ================= GRYFFINDOR: Dark = rough basalt, Mythic = stepped ziggurats, Arcane = obsidian & molten gold colossi ================= */
  function OBS() { return M("basalt", 1.5, 1.5, { color: lin("#b09aa4"), roughness: 0.4, metalness: 0.0 }); }
  function lavaM(k) { return dGlow("#ffb060", "#ff4a10", k || 1.6); }
  function lionHead(b, x, y, z, ry, s) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); b.g.add(g);
    var gold = REDGOLD(), dk = C("#2a1408");
    b.add(new T3.CylinderGeometry(0.5, 0.5, 0.2, 24), gold, 0, 0, -0.04, { parent: g, rx: PI / 2 });
    b.add(new T3.SphereGeometry(0.42, 18, 14), gold, 0, 0.02, 0.06, { parent: g, s: [1, 1.05, 0.55] });
    b.add(new T3.BoxGeometry(0.34, 0.28, 0.3), gold, 0, -0.14, 0.26, { parent: g });
    b.add(new T3.BoxGeometry(0.16, 0.1, 0.1), dk, 0, -0.02, 0.42, { parent: g });
    b.add(new T3.BoxGeometry(0.5, 0.08, 0.12), gold, 0, 0.17, 0.24, { parent: g });
    b.add(new T3.BoxGeometry(0.24, 0.06, 0.05), lavaM(1.4), 0, -0.29, 0.41, { parent: g, noCast: true });
    [-1, 1].forEach(function (sd) {
      b.add(new T3.SphereGeometry(0.055, 10, 8), lavaM(2.4), sd * 0.15, 0.08, 0.3, { parent: g, noCast: true });
      b.add(new T3.ConeGeometry(0.1, 0.2, 4), gold, sd * 0.33, 0.4, 0.0, { parent: g, rz: -sd * 0.5 });
    });
    var flm = lavaM(1.8), mane = [];
    for (var i = 0; i < 16; i++) { var a = i / 16 * 2 * PI; mane.push([b.add(new T3.ConeGeometry(0.1, 0.34, 5), flm, Math.cos(a) * 0.62, Math.sin(a) * 0.62, -0.06, { parent: g, rz: a - PI / 2, noCast: true }), i]); }
    for (var j = 0; j < 12; j++) { var a2 = (j + 0.5) / 12 * 2 * PI; b.add(new T3.ConeGeometry(0.07, 0.26, 4), gold, Math.cos(a2) * 0.54, Math.sin(a2) * 0.54, -0.03, { parent: g, rz: a2 - PI / 2 }); }
    b.fx.push(function (t) { mane.forEach(function (q) { q[0].scale.set(1, 0.85 + Math.sin(t * 6 + q[1] * 1.7) * 0.2, 1); }); flm.emissiveIntensity = 1.6 + Math.sin(t * 3) * 0.3; });
    return g;
  }
  function edgeLava(b, x, z, y0, r0, r1, h, m) {
    [0, PI / 2, -PI / 2].forEach(function (a) { var s = Math.sin(a + PI / 4), c = Math.cos(a + PI / 4); b.beam([x + s * (r0 + 0.01), y0, z + c * (r0 + 0.01)], [x + s * (r1 + 0.01), y0 + h, z + c * (r1 + 0.01)], 0.022, m); });
  }
  function sunDisc(b, x, y, z, ry, s) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); b.g.add(g);
    var spin = new T3.Group(); g.add(spin);
    b.add(new T3.CylinderGeometry(0.34, 0.34, 0.04, 28), dGlow("#fff2b0", "#ffb020", 2.2), 0, 0, 0, { parent: g, rx: PI / 2, noCast: true });
    b.add(new T3.TorusGeometry(0.4, 0.05, 8, 36), REDGOLD(), 0, 0, 0, { parent: g });
    for (var i = 0; i < 12; i++) { var a = i / 12 * 2 * PI; b.add(new T3.ConeGeometry(0.06, i % 2 ? 0.26 : 0.4, 4), REDGOLD(), Math.cos(a) * (i % 2 ? 0.55 : 0.62), Math.sin(a) * (i % 2 ? 0.55 : 0.62), 0, { parent: spin, rz: a - PI / 2 }); }
    b.fx.push(function (t) { spin.rotation.z = t * 0.4; });
    return g;
  }
  function featherWing(b, parent, side, n, base, step, col) {
    var w = new T3.Group(); parent.add(w); var list = [];
    for (var i = 0; i < n; i++) {
      var L = base + step * i, a = -0.1 + i * (1.0 / (n - 1));
      var sh = new T3.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(L * 0.5, 0.13, L, 0.02); sh.quadraticCurveTo(L * 0.55, -0.07, 0, 0);
      var m = b.add(new T3.ShapeGeometry(sh, 8), i % 2 ? REDGOLD() : lavaM(1.3), 0, 0, -i * 0.004, { parent: w, noCast: i % 2 === 0 });
      m.material.side = T3.DoubleSide;
      m.rotation.z = side > 0 ? a : PI - a;
      list.push(m);
    }
    return w;
  }
  function trebuchet(b, TX, TZ, ry, sc) {
    var tr = new T3.Group(); tr.position.set(TX, 0, TZ); tr.rotation.y = ry; tr.scale.setScalar(sc); b.g.add(tr);
    var bas = M("basalt", 0.6, 0.6), iron = M("iron"), gold = REDGOLD();
    b.add(new T3.BoxGeometry(0.95, 0.14, 1.35), bas, 0, 0.07, 0, { parent: tr });
    b.add(new T3.BoxGeometry(0.97, 0.03, 1.37), gold, 0, 0.14, 0, { parent: tr });
    [-0.38, 0.38].forEach(function (x) { b.beam([x, 0.14, -0.5], [x, 1.35, 0], 0.07, bas, tr); b.beam([x, 0.14, 0.5], [x, 1.35, 0], 0.07, bas, tr); b.beam([x, 0.55, -0.33], [x, 0.55, 0.33], 0.035, iron, tr); });
    b.beam([-0.44, 1.35, 0], [0.44, 1.35, 0], 0.05, gold, tr);
    var arm = new T3.Group(); arm.position.set(0, 1.35, 0); tr.add(arm);
    b.add(new T3.BoxGeometry(0.1, 0.1, 2.1), M("plankDark", 0.3, 1), 0, 0, 0.35, { parent: arm });
    inGroup(b, arm, function () { dFrustum(b, 0, -0.5, -0.6, 0.25, 0.2, 0.38, bas); b.box(0.36, 0.04, 0.36, gold, 0, -0.14, -0.6); });
    var fb = new T3.Group(); fb.position.set(0, 0.06, 1.4); arm.add(fb);
    b.add(new T3.SphereGeometry(0.15, 12, 10), dGlow("#ffb060", "#ff5a10", 2), 0, 0, 0, { parent: fb, noCast: true });
    inGroup(b, fb, function () { dFlame(b, 0, 0.05, 0, 0.4, 0.85); });
    b.fx.push(function (t) { arm.rotation.x = 0.5 + Math.sin(t * 0.6) * 0.12; });
  }

  /* ---------------- Gryffindor MYTHIC (new tower) ---------------- */
  function gmTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    dFrustum(b, 0, 0, 0, 1.05, 1.0, 0.14, M("basalt", 2, 0.2));
    var Y = stepped(b, 0, 0, [[0.8, 0.64, 1.05], [0.6, 0.48, 0.85]], 0.14);
    dFrustum(b, 0, Y, 0, 0.5, 0.66, 0.22, M("basalt", 1, 0.3));
    dFrustum(b, 0, Y + 0.22, 0, 0.67, 0.66, 0.05, REDGOLD());
    spikeRing(b, 0, 0, 0.66 * 0.707, Y + 0.27, 2);
    b.cyl(0.3, 0.22, 0.12, 10, M("iron"), -0.12, Y + 0.27, -0.12);
    dFlame(b, -0.12, Y + 0.38, -0.12, 0.9, 0.9);
    lionHead(b, 0.12, Y + 0.85, 0.12, PI / 4, 0.68);
    forgeGate(b, 0, 0.14, 0.8 * 0.707 + 0.03, 0, 0.3, 0.45, 0.6);
    obelisk(b, -1.05, 1.0, 1.0, 0); b.logs(1.0, -1.0, 0.4);
  }

  function gmStore(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0.4, 1.0, 1.6, 1.2, -0.2);
    var bas = M("basalt", 2, 0.8), gold = REDGOLD(), lava = lavaM(1.6), iron = M("iron");
    var HX = -0.3, HZ = -0.75;
    b.box(2.45, 0.12, 1.15, M("basalt", 2.4, 1.1), HX, 0, HZ);
    b.box(2.25, 0.78, 0.92, bas, HX, 0.12, HZ); b.box(2.31, 0.06, 0.98, gold, HX, 0.88, HZ);
    b.box(1.75, 0.3, 0.6, bas, HX, 0.94, HZ - 0.05); b.box(1.79, 0.05, 0.64, gold, HX, 1.22, HZ - 0.05);
    for (var k = -5; k <= 5; k++) b.add(new T3.ConeGeometry(0.03, 0.15, 4), iron, HX + k * 0.2, 1.02, HZ + 0.47);
    for (var k2 = -4; k2 <= 4; k2++) b.add(new T3.ConeGeometry(0.03, 0.14, 4), iron, HX + k2 * 0.19, 1.34, HZ + 0.25);
    [-0.7, 0, 0.7].forEach(function (dx) { forgeGate(b, HX + dx, 0.12, HZ + 0.47, 0, 0.34, 0.42, 0); });
    var CX = 1.05, CZ = -0.95;
    dFrustum(b, CX, 0, CZ, 0.46, 0.26, 2.55, bas);
    [0.9, 1.8].forEach(function (y) { var r = 0.46 - 0.2 * y / 2.55 + 0.02; dFrustum(b, CX, y, CZ, r, r - 0.005, 0.06, gold); });
    magmaSeams(b, CX, CZ, 0.46, 2.0, 0.1, 2, lava);
    b.cyl(0.17, 0.17, 0.02, 4, lava, CX, 2.55, CZ, { ry: PI / 4, noCast: true }); dFlame(b, CX, 2.56, CZ, 0.55, 0.6); dSmoke(b, CX, 2.9, CZ, 5);
    var GX = 0.75, GZ = 0.65;
    [-1, 1].forEach(function (s) { b.beam([GX + s * 0.4, 0, GZ - 0.25], [GX + s * 0.35, 1.25, GZ], 0.035, iron); b.beam([GX + s * 0.4, 0, GZ + 0.25], [GX + s * 0.35, 1.25, GZ], 0.035, iron); });
    b.beam([GX - 0.42, 1.25, GZ], [GX + 0.42, 1.25, GZ], 0.04, gold);
    var cru = new T3.Group(); cru.position.set(GX, 1.0, GZ); b.g.add(cru);
    [-1, 1].forEach(function (s) { b.beam([s * 0.15, 0.25, 0], [s * 0.2, 0.0, 0], 0.01, iron, cru); });
    var bowl = new T3.Group(); cru.add(bowl);
    b.add(new T3.CylinderGeometry(0.2, 0.13, 0.26, 12), iron, 0, -0.1, 0, { parent: bowl });
    b.add(new T3.CylinderGeometry(0.17, 0.17, 0.02, 12), lava, 0, 0.03, 0, { parent: bowl, noCast: true });
    bowl.rotation.z = -0.55;
    var pour = lavaM(2.2);
    b.add(new T3.CylinderGeometry(0.03, 0.04, 0.68, 6), pour, GX + 0.2, 0.55, GZ, { noCast: true });
    b.box(0.5, 0.12, 0.3, iron, GX + 0.2, 0, GZ); b.box(0.42, 0.02, 0.22, pour, GX + 0.2, 0.12, GZ, { noCast: true });
    b.fx.push(function (t) { pour.emissiveIntensity = 2 + Math.sin(t * 6) * 0.3; });
    var gb = C("#f2c040", { metalness: 0.85, roughness: 0.3 });
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3 - r; c++) b.box(0.15, 0.06, 0.3, gb, -0.85 + c * 0.16 + r * 0.08, 0.06 * r, 0.75);
    b.box(0.42, 0.22, 0.3, M("plankDark", 0.4, 0.3), -1.15, 0.08, 0.15, { ry: 0.3 });
    [[-1.3, 0.05], [-1.0, 0.25]].forEach(function (q) { b.add(new T3.CylinderGeometry(0.08, 0.08, 0.04, 10), iron, q[0], 0.08, q[1] - 0.2, { rx: PI / 2, ry: 0.3 }); });
    b.add(new T3.DodecahedronGeometry(0.12, 0), gb, -1.15, 0.33, 0.15);
  }

  /* ---------------- Gryffindor ARCANE: obsidian & molten gold ---------------- */
  function agHouse(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var X = -0.2, Z = -0.25, obs = OBS(), gold = REDGOLD(), lava = lavaM(1.7);
    dFrustum(b, X, 0, Z, 1.28, 1.2, 0.16, M("basalt", 2, 0.2));
    magmaMoat(b, X, Z, 1.08, 0.17);
    dFrustum(b, X, 0.16, Z, 0.86, 0.8, 0.3, M("basalt", 1.5, 0.3)); dFrustum(b, X, 0.42, Z, 0.83, 0.8, 0.05, gold);
    dFrustum(b, X, 0.46, Z, 0.62, 0.5, 1.75, obs);
    [1.05, 1.75].forEach(function (y) { var r = 0.62 - (y - 0.46) / 1.75 * 0.12 + 0.02; dFrustum(b, X, y, Z, r, r - 0.005, 0.06, gold); });
    edgeLava(b, X, Z, 0.46, 0.62, 0.5, 1.75, lava);
    dFrustum(b, X, 2.21, Z, 0.5, 0.66, 0.22, obs); dFrustum(b, X, 2.43, Z, 0.67, 0.66, 0.05, gold);
    spikeRing(b, X, Z, 0.66 * 0.707, 2.48, 2);
    fireCrown(b, X, 2.48, Z, 0.5);
    sunDisc(b, X, 3.3, Z, PI / 4, 0.9);
    lionHead(b, X, 1.55, Z + 0.43, 0, 0.28);
    b.box(0.09, 1.0, 0.04, lava, X, 0.46, Z + 0.47, { noCast: true }); b.box(0.09, 0.03, 0.42, lava, X, 0.45, Z + 0.68, { noCast: true });
    b.fx.push(function (t) { lava.emissiveIntensity = 1.5 + Math.sin(t * 2.5) * 0.4; });
    forgeGate(b, X + 0.62 * 0.707 + 0.01, 0.46, Z, PI / 2, 0.3, 0.52, 0);
    obelisk(b, X + 1.05, Z - 1.0, 1.6, 0); lionStatue(b, 1.0, 1.0, 0, PI / 4, 0.55);
  }
  function agFarm(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var R = 1.75, gold = REDGOLD(), lava = lavaM(1.5);
    b.add(new T3.CylinderGeometry(R + 0.15, R + 0.2, 0.12, 8), M("basalt", 3, 0.2), 0, 0.06, 0, { ry: PI / 8 });
    b.add(new T3.CylinderGeometry(R + 0.16, R + 0.16, 0.035, 8, 1, true), gold, 0, 0.12, 0, { ry: PI / 8 });
    var cols = ["#e8b83a", "#d8a030", "#f2cc5a"].map(function (c) { return C(c, { flatShading: true }); });
    for (var w = 0; w < 8; w++) {
      var t0 = w * PI / 4 + 0.05, tl = PI / 4 - 0.1;
      b.add(new T3.CylinderGeometry(R, R, 0.05, 6, 1, false, t0, tl), M("soil", 2, 2), 0, 0.145, 0);
      var row = new T3.Group(); b.g.add(row);
      for (var s = 0; s < 16; s++) { var rr = 0.62 + b.rand() * (R - 0.75), th = t0 + 0.06 + b.rand() * (tl - 0.12), hh = 0.26 + b.rand() * 0.12; b.add(new T3.ConeGeometry(0.035, hh, 4), cols[(b.rand() * 3) | 0], Math.sin(th) * rr, 0.17 + hh / 2, Math.cos(th) * rr, { parent: row, rz: (b.rand() - 0.5) * 0.3 }); }
      (function (row, ph) { b.fx.push(function (t) { row.rotation.y = Math.sin(t * 0.8 + ph) * 0.008; }); })(row, w);
      var ga = w * PI / 4; b.add(new T3.BoxGeometry(0.05, 0.03, R - 0.5), lava, Math.sin(ga) * (0.5 + (R - 0.5) / 2), 0.16, Math.cos(ga) * (0.5 + (R - 0.5) / 2), { ry: ga, noCast: true });
    }
    b.fx.push(function (t) { lava.emissiveIntensity = 1.3 + Math.sin(t * 2) * 0.35; });
    b.add(new T3.CylinderGeometry(0.55, 0.62, 0.22, 8), M("basalt", 1, 0.3), 0, 0.23, 0, { ry: PI / 8 });
    b.add(new T3.CylinderGeometry(0.56, 0.56, 0.04, 8, 1, true), gold, 0, 0.34, 0, { ry: PI / 8 });
    var gs = new T3.Shape(); gs.moveTo(-0.32, 0); gs.lineTo(0.32, 0); gs.lineTo(0.02, 1.65); gs.lineTo(-0.02, 1.65); gs.closePath();
    b.add(new T3.ExtrudeGeometry(gs, { depth: 0.07, bevelEnabled: false }), C("#e3a83a", { metalness: 0.75, roughness: 0.28 }), 0, 0.34, 0, { ry: PI / 4 });
    var sun = new T3.Group(); b.g.add(sun);
    b.add(new T3.SphereGeometry(0.3, 24, 18), dGlow("#fff2b0", "#ffb020", 2.6), 0, 0, 0, { parent: sun, noCast: true });
    sun.add(new T3.PointLight("#ffb040", 2.0, 6, 2));
    var rays = new T3.Group(); rays.rotation.y = PI / 4; sun.add(rays);
    for (var i = 0; i < 12; i++) { var a = i / 12 * 2 * PI; b.add(new T3.ConeGeometry(0.05, i % 2 ? 0.2 : 0.32, 4), gold, Math.cos(a) * 0.45, Math.sin(a) * 0.45, 0, { parent: rays, rz: a - PI / 2 }); }
    b.add(new T3.TorusGeometry(0.4, 0.025, 6, 32), gold, 0, 0, 0, { parent: rays });
    b.fx.push(function (t) { sun.position.set(0, 2.85 + Math.sin(t * 1.1) * 0.06, 0); rays.rotation.z = t * 0.5; });
    [[1.95, 0], [0, 1.95], [-1.95, 0], [0, -1.95]].forEach(function (q) { basaltBowl(b, q[0], q[1], 0.12, 0.8); });
  }
  function agStore(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var X = -0.25, Z = -0.25, obs = OBS(), gold = C("#e8b040", { metalness: 0.85, roughness: 0.25 });
    dFrustum(b, X, 0, Z, 1.25, 1.18, 0.14, M("basalt", 2, 0.2));
    b.add(new T3.CylinderGeometry(0.8, 0.86, 1.05, 8), obs, X, 0.14 + 0.525, Z, { ry: PI / 8 });
    [0.2, 1.17].forEach(function (y) { b.add(new T3.CylinderGeometry(0.83, 0.83, 0.06, 8, 1, true), REDGOLD(), X, y, Z, { ry: PI / 8 }); });
    for (var k = 0; k < 8; k++) { var a = PI / 8 + k * PI / 4 + PI / 8, s = Math.sin(a), c = Math.cos(a); b.beam([X + s * 0.84, 0.2, Z + c * 0.84], [X + s * 0.79, 1.17, Z + c * 0.79], 0.025, REDGOLD()); }
    b.add(new T3.SphereGeometry(0.82, 32, 14, 0, 2 * PI, 0, PI / 2), gold, X, 1.19, Z);
    for (var r = 0; r < 8; r++) b.add(new T3.TorusGeometry(0.825, 0.018, 5, 28, PI), C("#9a6418", { metalness: 0.7, roughness: 0.35 }), X, 1.19, Z, { ry: r * PI / 8 });
    b.cyl(0.16, 0.2, 0.3, 8, obs, X, 2.0, Z);
    b.cyl(0.13, 0.13, 0.03, 8, lavaM(1.8), X, 2.3, Z, { noCast: true });
    dFlame(b, X, 2.32, Z, 0.5, 0.5);
    haloG(b, X, 2.95, Z, 0.32);
    var ap = 0.8 * Math.cos(PI / 8);
    forgeGate(b, X + Math.sin(PI / 4) * (ap + 0.01), 0.14, Z + Math.cos(PI / 4) * (ap + 0.01), PI / 4, 0.42, 0.62, 0.7);
    lionStatue(b, X + 0.35, Z + 1.15, 0.14, PI / 4, 0.5); lionStatue(b, X + 1.15, Z + 0.35, 0.14, PI / 4, 0.5);
    basaltBowl(b, X - 1.0, Z + 0.75, 0.14, 0.8);
    var pour = lavaM(2.2); pour.color = lin("#ffd080");
    b.box(0.07, 0.025, 0.55, pour, X - 0.82, 0.16, Z + 0.45, { ry: -0.5, noCast: true });
    var gb = C("#f2c040", { metalness: 0.85, roughness: 0.3 });
    for (var rr = 0; rr < 3; rr++) for (var cc = 0; cc < 3 - rr; cc++) b.box(0.15, 0.06, 0.3, gb, 0.65 + cc * 0.16 + rr * 0.08, 0.14 + 0.06 * rr, -1.0, { ry: 0.2 });
  }
  function agBarracks(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.6, 1.1, 2.4, 2.0);
    var G = new T3.Group(); G.position.set(-0.45, 0, -0.45); G.rotation.y = PI / 4; b.g.add(G);
    var obs = OBS(), bas = M("basalt", 2, 1), gold = REDGOLD(), iron = M("iron");
    inGroup(b, G, function () {
      b.box(3.7, 0.14, 2.0, M("basalt", 3.5, 2), 0, 0, -0.2);
      magmaMoat(b, 0, -0.2, 1.95, 0.15);
      b.box(2.1, 1.9, 1.25, obs, 0, 0.14, -0.45);
      b.box(2.16, 0.07, 1.31, gold, 0, 1.0, -0.45); b.box(2.16, 0.07, 1.31, gold, 0, 1.97, -0.45);
      b.box(1.6, 0.35, 0.95, bas, 0, 2.04, -0.5); b.box(1.64, 0.05, 0.99, gold, 0, 2.36, -0.5);
      b.box(1.05, 0.3, 0.65, bas, 0, 2.39, -0.55); b.box(1.09, 0.05, 0.69, gold, 0, 2.66, -0.55);
      for (var k = -5; k <= 5; k++) b.add(new T3.ConeGeometry(0.04, 0.2, 4), iron, k * 0.19, 2.13, 0.19);
      fireCrown(b, 0, 2.71, -0.55, 0.6);
      [-1, 1].forEach(function (s) {
        b.box(0.75, 1.0, 1.1, bas, s * 1.45, 0.14, -0.4);
        b.box(0.79, 0.05, 1.14, gold, s * 1.45, 1.1, -0.4);
        for (var q = -2; q <= 2; q++) b.add(new T3.ConeGeometry(0.035, 0.17, 4), iron, s * 1.45 + q * 0.15, 1.22, 0.14);
        obelisk(b, s * 1.65, -0.8, 2.3, 0.14);
      });
      lionHead(b, 0, 1.38, 0.24, 0, 0.82);
      forgeGate(b, 0, 0.14, 0.21, 0, 0.62, 0.62, 0);
      haloG(b, 0, 3.4, -0.55, 0.42);
    });
    b.target(1.35, 1.55, 0.5); b.target(1.85, 1.0, 0.7); b.dummy(-1.45, 1.55, 0.3); b.dummy(-0.9, 1.85, -0.2);
    lionStatue(b, 0.45, 1.15, 0, PI / 4, 0.55); lionStatue(b, 1.15, 0.45, 0, PI / 4, 0.55);
  }
  function agTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var obs = OBS(), lava = lavaM(1.7);
    dFrustum(b, 0, 0, 0, 1.15, 1.1, 0.16, M("basalt", 2, 0.2));
    magmaMoat(b, 0, 0, 0.98, 0.17);
    var Y = stepped(b, 0, 0, [[0.78, 0.62, 0.45]], 0.16);
    var H = 2.65;
    dFrustum(b, 0, Y, 0, 0.44, 0.1, H, obs);
    edgeLava(b, 0, 0, Y, 0.44, 0.1, H, lava);
    [0.33, 0.66].forEach(function (f) { var r = 0.44 - 0.34 * f + 0.02; dFrustum(b, 0, Y + H * f, 0, r, r - 0.01, 0.06, REDGOLD()); });
    b.fx.push(function (t) { lava.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.4; });
    var rings = [[0.62, Y + 0.75, 0.35], [0.5, Y + 1.45, -0.4], [0.38, Y + 2.1, 0.3]].map(function (q, i) {
      var g = new T3.Group(); g.position.set(0, q[1], 0); b.g.add(g);
      b.add(new T3.TorusGeometry(q[0], 0.028, 6, 40), REDGOLD(), 0, 0, 0, { parent: g, rx: PI / 2 });
      for (var f = 0; f < 6; f++) { var p = onRing(q[0], f / 6 * 2 * PI); b.add(new T3.ConeGeometry(0.03, 0.12, 4), REDGOLD(), p[0], 0.05, p[1], { parent: g }); }
      g.rotation.x = q[2]; return [g, i];
    });
    b.fx.push(function (t) { rings.forEach(function (q) { q[0].rotation.y = t * (0.5 + q[1] * 0.25) * (q[1] % 2 ? -1 : 1); }); });
    var fb = new T3.Group(); b.g.add(fb);
    b.add(new T3.SphereGeometry(0.26, 20, 16), dGlow("#ffd080", "#ff5a10", 2.4), 0, 0, 0, { parent: fb, noCast: true });
    inGroup(b, fb, function () { dFlame(b, 0, 0.1, 0, 0.75, 1.0); });
    fb.add(new T3.PointLight("#ff8030", 2.0, 5, 2));
    b.fx.push(function (t) { fb.position.set(0, Y + H + 0.5 + Math.sin(t * 1.4) * 0.07, 0); });
    forgeGate(b, 0, 0.16, 0.78 * 0.707 + 0.02, 0, 0.32, 0.45, 0.6);
    obelisk(b, -1.1, 1.0, 1.2, 0); obelisk(b, 1.0, -1.1, 1.2, 0);
  }
  function agPen(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var R = 1.72, obs = OBS(), lava = lavaM(1.6);
    b.add(new T3.CylinderGeometry(R + 0.2, R + 0.26, 0.14, 12), M("basalt", 3, 0.2), 0, 0.07, 0);
    b.add(new T3.CylinderGeometry(R + 0.05, R + 0.05, 0.02, 40), C("#8a6a4a"), 0, 0.15, 0);
    b.add(new T3.TorusGeometry(1.05, 0.09, 6, 48), lava, 0, 0.15, 0, { rx: PI / 2, noCast: true });
    b.fx.push(function (t) { lava.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.4; });
    for (var k = 0; k < 10; k++) {
      var a = k / 10 * 2 * PI + PI / 4, p = onRing(R, a);
      if (k === 0) continue;
      dFrustum(b, p[0], 0.14, p[1], 0.12, 0.09, 1.55, obs);
      dFrustum(b, p[0], 0.85, p[1], 0.14, 0.13, 0.05, REDGOLD());
      b.cyl(0.13, 0.09, 0.1, 8, M("iron"), p[0], 1.69, p[1]);
      dFlame(b, p[0], 1.79, p[1], 0.38, 0.35);
    }
    b.add(new T3.TorusGeometry(R, 0.045, 4, 60), REDGOLD(), 0, 1.69, 0, { rx: PI / 2 });
    var bm = C("#3a2c2a", { flatShading: true, roughness: 0.85 }), Y = 0.15;
    [[0.82, 0.95, 0.42, 3], [0.6, 0.76, 0.38, 4], [0.36, 0.52, 0.32, 5]].forEach(function (q) { b.add(rough(new T3.CylinderGeometry(q[0], q[1], q[2], 7, 2), 0.25, q[3]), bm, 0, Y + q[2] / 2, 0); Y += q[2]; });
    for (var v = 0; v < 5; v++) { var va = v * 1.26 + 0.3; b.beam([Math.cos(va) * 0.9, 0.2, Math.sin(va) * 0.9], [Math.cos(va) * 0.4, Y - 0.05, Math.sin(va) * 0.4], 0.02, REDGOLD()); }
    b.lift(Y, function () { this.lion(0.0, 0.05, 0.95, PI / 4); });
    haloG(b, 0, Y + 1.25, 0, 0.36);
    var gp = onRing(R, PI / 4);
    b.banner(gp[0] + 0.3, gp[1] - 0.35, 0.14, "bannerFire", 1.5); b.banner(gp[0] - 0.35, gp[1] + 0.3, 0.14, "bannerFire", 1.5);
  }
  function agSanctum(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var obs = OBS(), gold = REDGOLD(), lava = lavaM(1.7);
    b.add(new T3.TorusGeometry(1.98, 0.07, 4, 64), lava, 0, 0.03, 0, { rx: PI / 2, noCast: true });
    var Y = 0;
    [[1.85, 0.2], [1.5, 0.2], [1.15, 0.2]].forEach(function (q) { b.add(new T3.CylinderGeometry(q[0] - 0.05, q[0], q[1], 12), M("basalt", 3, 0.3), 0, Y + q[1] / 2, 0, { ry: PI / 12 }); b.add(new T3.CylinderGeometry(q[0] - 0.04, q[0] - 0.04, 0.04, 12, 1, true), gold, 0, Y + q[1] - 0.02, 0, { ry: PI / 12 }); Y += q[1]; });
    var H = 2.0;
    dFrustum(b, 0, Y, 0, 0.42, 0.16, H, obs);
    edgeLava(b, 0, 0, Y, 0.42, 0.16, H, lava);
    dFrustum(b, 0, Y + H * 0.5, 0, 0.32, 0.31, 0.06, gold);
    forgeGate(b, 0, Y, 0.42 * 0.707 + 0.02, 0, 0.26, 0.42, 0);
    fireCrown(b, 0, Y + H, 0, 0.45);
    var P = new T3.Group(); P.position.set(0, Y + H + 0.35, 0); P.rotation.y = PI / 4; P.scale.setScalar(1.45); b.g.add(P);
    b.add(new T3.SphereGeometry(0.17, 14, 10), dGlow("#ffd080", "#ff6a10", 1.8), 0, 0.1, 0, { parent: P, s: [0.85, 1.5, 0.85], noCast: true });
    b.add(new T3.SphereGeometry(0.09, 12, 10), gold, 0, 0.45, 0.05, { parent: P });
    b.add(new T3.ConeGeometry(0.035, 0.12, 4), gold, 0, 0.44, 0.15, { parent: P, rx: PI / 2 });
    inGroup(b, P, function () { dFlame(b, 0, 0.5, -0.02, 0.35, 0.4); });
    var wings = [1, -1].map(function (s) { var w = featherWing(b, P, s, 9, 0.5, 0.11, null); w.position.set(s * 0.1, 0.2, 0); return [w, s]; });
    for (var t2 = 0; t2 < 3; t2++) { var tf = b.add(new T3.ConeGeometry(0.06, 0.55, 5), lavaM(1.4), (t2 - 1) * 0.1, -0.25, 0, { parent: P, rz: (t2 - 1) * 0.35, rx: PI, noCast: true }); }
    P.add(new T3.PointLight("#ff8030", 1.8, 6, 2));
    b.fx.push(function (t) { wings.forEach(function (q) { q[0].rotation.z = q[1] * Math.sin(t * 1.2) * 0.12; }); P.position.y = Y + H + 0.35 + Math.sin(t * 1.2) * 0.04; lava.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.35; });
    haloG(b, 0, Y + H + 1.95, 0, 0.42);
    lionStatue(b, 1.3, 0.45, 0.2, PI / 4, 0.6); lionStatue(b, 0.45, 1.3, 0.2, PI / 4, 0.6);
    [[-1.4, -1.4], [1.45, -1.45], [-1.45, 1.45]].forEach(function (q) { basaltBowl(b, q[0] * 0.95, q[1] * 0.95, 0.2, 0.9); });
  }
  function agWorkshop(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.4, 1.0, 2.6, 2.2);
    var VX = -0.85, VZ = -0.95, VH = 2.3, RT = 0.42, RB = 1.35, lava = lavaM(1.8);
    b.add(rough(new T3.CylinderGeometry(RT, RB, VH, 14, 6, true), 0.22, 9), C("#2c2426", { flatShading: true, roughness: 0.9 }), VX, VH / 2, VZ);
    b.add(new T3.CylinderGeometry(RT * 0.95, RT * 0.95, 0.05, 14), lava, VX, VH - 0.08, VZ, { noCast: true });
    var L = new T3.PointLight("#ff6a20", 1.8, 5, 2); L.position.set(VX, VH + 0.4, VZ); b.g.add(L);
    dSmoke(b, VX, VH + 0.2, VZ, 6);
    b.add(new T3.TorusGeometry(RB - (0.55 / VH) * (RB - RT) + 0.02, 0.045, 6, 40), REDGOLD(), VX, 0.55, VZ, { rx: PI / 2 });
    [PI / 4 - 0.55, PI / 4 + 0.05, PI / 4 + 0.6].forEach(function (a0, i) {
      var pts = [];
      for (var s = 0; s <= 8; s++) { var t = s / 8, a = a0 + Math.sin(t * 5 + i) * 0.1, rr = RT + (RB - RT) * t + 0.05; pts.push([VX + Math.sin(a) * rr, VH * (1 - t) - 0.05, VZ + Math.cos(a) * rr]); }
      for (var s2 = 0; s2 < 8; s2++) b.beam(pts[s2], pts[s2 + 1], 0.035 + s2 * 0.003, lava);
    });
    b.fx.push(function (t) { lava.emissiveIntensity = 1.6 + Math.sin(t * 2.2) * 0.4; });
    forgeGate(b, VX + Math.sin(PI / 4) * 1.2, 0, VZ + Math.cos(PI / 4) * 1.2, PI / 4, 0.62, 0.7, 0.8);
    haloG(b, VX, VH + 0.9, VZ, 0.5);
    magmaMoat(b, VX, VZ, 1.5, 0.02);
    trebuchet(b, 0.95, 1.0, 3 * PI / 4 - 0.15, 1.3);
    [[-0.3, 0.0], [-0.15, 0.12], [-0.05, -0.1]].forEach(function (q) { b.add(new T3.SphereGeometry(0.1, 10, 8), dGlow("#ff9a50", "#d83a08", 1.1), 1.75 + q[0], 0.1, -0.35 + q[1], { noCast: true }); });
    lionStatue(b, -1.85, 1.55, 0, PI / 4, 0.6);
    b.banner(0.0, 2.0, 0, "bannerFire", 1.5);
  }

  MYTHB.fire = [MYTHB.fire[0], MYTHB.fire[1], gmStore, MYTHB.fire[3], gmTower, MYTHB.fire[5], MYTHB.fire[6]];
  if (typeof ARCB !== "undefined") ARCB.fire = [agHouse, agFarm, agStore, agBarracks, agTower, agPen, agSanctum, agWorkshop];
