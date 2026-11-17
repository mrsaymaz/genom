
  /* ================= CELESTIAL AGE BUILDINGS ================= */
  function SILVER() { return C("#e2e8f2", { metalness: 0.8, roughness: 0.22 }); }
  function WGOLD() { return C("#f6d77e", { metalness: 0.85, roughness: 0.25 }); }
  function starBurst(b, x, y, z, s, core, em, rays) {
    var g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); b.g.add(g);
    var m = glowMat(core, em, 2.6), n = rays || 8;
    var c = b.add(new T3.OctahedronGeometry(0.22, 0), m, 0, 0, 0, { parent: g, noCast: true }); c.scale.set(1, 1.6, 1);
    for (var i = 0; i < n; i++) { var a = i / n * 2 * PI; b.add(new T3.ConeGeometry(0.05, i % 2 ? 0.35 : 0.6, 4), m, Math.cos(a) * 0.26, Math.sin(a) * 0.26, 0, { parent: g, rz: a - PI / 2, noCast: true }); }
    g.add(new T3.PointLight(em, 1.5 * s, 6 * s, 2));
    var ph = b.rand() * 6; b.fx.push(function (t) { g.position.y = y + Math.sin(t * 1.1 + ph) * 0.06; g.rotation.y = t * 0.6; });
    return g;
  }
  function moonOrb(b, x, y, z, r, bob) {
    var g = new T3.Group(); g.position.set(x, y, z); b.g.add(g);
    b.add(new T3.SphereGeometry(r, 32, 24), M("pearl", 1.5, 1.5, { color: lin("#c4d0e8"), emissive: lin("#5a86d0"), emissiveIntensity: 0.45, roughness: 0.75 }), 0, 0, 0, { parent: g, noCast: true });
    var cm = C("#8e9cc0", { emissive: lin("#3a5a98"), emissiveIntensity: 0.25 });
    [[0.4, 0.35, 0.8, 0.18], [-0.3, -0.2, 0.84, 0.13], [0.15, -0.5, 0.75, 0.15], [-0.55, 0.3, 0.68, 0.11], [0.7, -0.1, 0.4, 0.12]].forEach(function (q) { var v = new T3.Vector3(q[0], q[1], q[2]).normalize(); var cr = b.add(new T3.CircleGeometry(q[3] * r, 16), cm, v.x * r * 0.99, v.y * r * 0.99, v.z * r * 0.99, { parent: g, noCast: true }); cr.quaternion.setFromUnitVectors(new T3.Vector3(0, 0, 1), v); });
    g.add(new T3.PointLight("#bcd8ff", 1.4, 5, 2));
    var ph = b.rand() * 6; b.fx.push(function (t) { if (bob !== false) g.position.y = y + Math.sin(t * 0.8 + ph) * 0.06; g.rotation.y = t * 0.2; });
    return g;
  }
  function crescent(b, x, y, z, R, tube, ry, mat, arc) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry; b.g.add(g);
    var A = arc || PI * 1.35;
    b.add(new T3.TorusGeometry(R, tube, 10, 64, A), mat || SILVER(), 0, 0, 0, { parent: g, rz: PI / 2 - A / 2 + PI });
    return g;
  }
  function sunOrb(b, x, y, z, r) {
    var g = new T3.Group(); g.position.set(x, y, z); b.g.add(g);
    var m = glowMat("#fff4c0", "#ffb020", 2.8);
    b.add(new T3.SphereGeometry(r, 28, 20), m, 0, 0, 0, { parent: g, noCast: true });
    var cor = new T3.Group(); cor.rotation.y = PI / 4; g.add(cor);
    b.add(new T3.TorusGeometry(r * 1.35, r * 0.06, 6, 40), WGOLD(), 0, 0, 0, { parent: cor });
    for (var i = 0; i < 12; i++) { var a = i / 12 * 2 * PI; b.add(new T3.ConeGeometry(r * 0.12, r * (i % 2 ? 0.55 : 0.9), 4), m, Math.cos(a) * r * 1.55, Math.sin(a) * r * 1.55, 0, { parent: cor, rz: a - PI / 2, noCast: true }); }
    g.add(new T3.PointLight("#ffc050", 2.0, 7, 2));
    b.fx.push(function (t) { cor.rotation.z = t * 0.35; m.emissiveIntensity = 2.6 + Math.sin(t * 2) * 0.3; });
    return g;
  }
  function petalM(col, em, k) { return new T3.MeshStandardMaterial({ color: lin(col), emissive: lin(em), emissiveIntensity: k == null ? 0.35 : k, roughness: 0.5, side: T3.DoubleSide, flatShading: true }); }
  function bloom(b, x, y, z, R, n, open, cA, cB, glow) {
    var g = new T3.Group(); g.position.set(x, y, z); b.g.add(g);
    var mA = petalM(cA, "#3aa860"), mB = petalM(cB, "#3aa860");
    for (var i = 0; i < n; i++) {
      var a = i / n * 2 * PI, pg = new T3.Group(); pg.rotation.y = -a; g.add(pg);
      var tg = new T3.Group(); tg.rotation.z = -open; pg.add(tg);
      b.add(new T3.SphereGeometry(1, 14, 10), i % 2 ? mA : mB, R * 0.12, R * 0.5, 0, { parent: tg, s: [R * 0.12, R * 0.52, R * 0.3] });
    }
    if (glow !== false) {
      var gm = glowMat("#f4fff0", "#9affb8", 2.2);
      b.add(new T3.SphereGeometry(R * 0.16, 14, 10), gm, 0, R * 0.12, 0, { parent: g, noCast: true });
      for (var s = 0; s < 6; s++) { var sa = s / 6 * 2 * PI; b.add(new T3.CylinderGeometry(0.012, 0.012, R * 0.35, 4), C("#d8ffc0"), Math.cos(sa) * R * 0.1, R * 0.3, Math.sin(sa) * R * 0.1, { parent: g, rz: Math.cos(sa) * 0.3, rx: -Math.sin(sa) * 0.3, noCast: true }); b.add(new T3.SphereGeometry(0.03, 8, 6), gm, Math.cos(sa) * R * 0.16, R * 0.47, Math.sin(sa) * R * 0.16, { parent: g, noCast: true }); }
      g.add(new T3.PointLight("#9affb8", 1.0, 3 + R * 2, 2));
    }
    return g;
  }
  function STARWOOD(rx, ry) { return M("barkTree", rx || 1, ry || 3, { color: lin("#dfe9d6"), emissive: lin("#2a6a3a"), emissiveIntensity: 0.35 }); }
  function constellPts(b, pts, col, parent) {
    var g = parent || new T3.Group(); if (!parent) b.g.add(g);
    var lm = new T3.MeshBasicMaterial({ color: lin(col), transparent: true, opacity: 0.5, depthWrite: false });
    for (var i = 0; i < pts.length - 1; i++) if (pts[i + 1]) b.beam(pts[i], pts[i + 1], 0.012, lm, g);
    var sm = glowMat("#ffffff", col, 2.3);
    pts.forEach(function (p) { if (p) b.add(new T3.OctahedronGeometry(0.075, 0), sm, p[0], p[1], p[2], { parent: g, noCast: true }).scale.set(1, 1.6, 1); });
    var ph = b.rand() * 6; b.fx.push(function (t) { sm.emissiveIntensity = 2.0 + Math.sin(t * 2 + ph) * 0.5; });
    return g;
  }

  /* ======================= HUFFLEPUFF ======================= */
  function chHouse(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var X = -0.15, Z = -0.15, IY = 2.0;
    hexStep(b, 1.15, 0.1, 0, X, Z);
    b.add(new T3.RingGeometry(0.62, 0.7, 6), glowMat("#fff4c0", "#ffc030", 1.1), X, 0.105, Z, { rx: -PI / 2, rz: PI / 6, noCast: true });
    [[0.7, 0.3], [0.3, 0.7], [-0.5, 0.45], [0.45, -0.5], [-0.35, -0.45]].forEach(function (q, i) { cloud(b, X + q[0], IY - 0.62 - (i % 2) * 0.12, Z + q[1], 0.75 + (i % 3) * 0.1); });
    var I = hexIsland(b, X, IY, Z, 1.0, 1.0, 29);
    var L = new T3.PointLight("#ffc040", 1.2, 4, 2); L.position.set(0, -1.1, 0); I.add(L);
    inGroup(b, I, function () {
      var rot = PI / 12, dark = C(BY.black), gold = WGOLD();
      var pB = nb(0, 0, 0.44, 0.3, 0, rot), pC = nb(0, 0, 0.44, 0.26, 4, rot);
      hexCell(b, pB[0], pB[1], 0.3, 0.55, 0, { rot: rot, cap: "tent", capH: 0.25, door: [0, 0.24, 0.24] });
      hexCell(b, pC[0], pC[1], 0.26, 0.45, 0, { rot: rot, cap: "tent", capH: 0.22 });
      var y = hexCell(b, 0, 0, 0.44, 0.75, 0, { rot: rot, band: 0.55, lamps: [[5, 0.6, 0.8], [1, 0.6, 0.8]] });
      [[0.38, 0.5], [0.28, 0.4]].forEach(function (t, i) {
        b.add(new T3.CylinderGeometry(t[0], t[0] + 0.04, t[1], 6), AMBERG(), 0, y + t[1] / 2, 0, { ry: rot, noCast: true });
        b.add(new T3.CylinderGeometry(t[0] - 0.08, t[0] - 0.05, t[1] - 0.05, 6), dGlow("#ffe7a0", "#ffb030", 1.2), 0, y + t[1] / 2, 0, { ry: rot, noCast: true });
        for (var v = 0; v < 6; v++) { var a = rot + v * PI / 3; b.cyl(0.015, 0.015, t[1], 4, dark, Math.sin(a) * (t[0] + 0.02), y, Math.cos(a) * (t[0] + 0.02)); }
        y += t[1]; b.add(new T3.CylinderGeometry(t[0] + 0.08, t[0] + 0.08, 0.05, 6), i ? gold : dark, 0, y, 0, { ry: rot });
      });
      dSkep(b, 0, y + 0.02, 0, 0.24, 0.36);
      [[PI * 0.95], [PI * 1.95]].forEach(function (q) { var p = dRing(0.8, q[0]); b.cyl(0.02, 0.03, 1.1, 6, M("plankDark", 0.2, 1), p[0], 0, p[1]); bySail(b, p[0], 1.05, p[1], PI / 4, 0.7); });
    });
    starBurst(b, X, IY + 2.45, Z, 0.6, "#fff6d0", "#ffb020");
    b.add(new T3.TorusGeometry(0.42, 0.025, 6, 30), WGOLD(), X, IY + 2.45, Z, { rx: PI / 2 - 0.3 });
    constellation(b, IY + 1.75, 1.35, 6, "#ffd060", 0.2, 0.15);
    starMotes(b, 14, 1.5, 1.4, 4.8, "#ffe8a0", 0.13);
    honeyJars(b, [[1.15, 1.0], [1.0, 1.15]]);
  }
  function chFarm(b) {
    b.slab(4.2, "grassAir", "sideAir");
    var IY = 2.2, post = M("plankDark", 0.3, 0.3);
    [[-1.7, -1.1], [-1.7, -0.5], [-1.7, 0.1], [-1.1, -1.7], [-0.5, -1.7], [0.1, -1.7]].forEach(function (q) { b.cyl(0.03, 0.03, 0.3, 5, post, q[0], 0, q[1]); b.box(0.32, 0.04, 0.32, M("plankWarm", 0.4, 0.4), q[0], 0.3, q[1]); dSkep(b, q[0], 0.34, q[1], 0.14, 0.3); });
    [PI * 0.25, PI * 0.25 + 2 * PI / 3, PI * 0.25 + 4 * PI / 3].forEach(function (a) { var p = onRing(1.25, a); honeyPylon(b, 0.15 + p[0], 0.15 + p[1], 1.0, 0.15 + p[0] * 0.5, IY - 0.6, 0.15 + p[1] * 0.5); });
    [[1.2, 0.3], [0.3, 1.2], [-0.6, 0.9], [0.9, -0.6], [0.2, 0.2]].forEach(function (q, i) { cloud(b, 0.15 + q[0], IY - 0.7 - (i % 2) * 0.15, 0.15 + q[1], 1.0 + (i % 3) * 0.12); });
    var I = hexIsland(b, 0.15, IY, 0.15, 1.6, 0.8, 37);
    inGroup(b, I, function () {
      b.add(new T3.CylinderGeometry(1.45, 1.45, 0.04, 6), M("soil", 2, 2), 0, 0.02, 0, { ry: PI / 6 });
      b.wheat(-1.0, -0.95, 1.0, 0.95, 7, 8, ["#f2d060", "#e8c050", "#ffe08a"]);
      [[1.3, 0], [-1.3, 0]].forEach(function (q) { var p = q; b.cyl(0.03, 0.04, 0.9, 6, M("plankDark", 0.2, 1), p[0] * 0.65, 0, -p[0] * 0.65); });
    });
    var wm = glowMat("#ffe9a0", "#ffb020", 0.6); b.add(new T3.CylinderGeometry(1.62, 1.62, 0.05, 6, 1, true), wm, 0.15, IY + 0.02, 0.15, { ry: PI / 6, noCast: true });
    var mill = new T3.Group(); b.g.add(mill);
    hexCell(b, -1.45, -1.45, 0.32, 2.2, 0, { band: 0.4, lamps: [[5, 0.75, 0.7], [0, 0.75, 0.7]], cap: "skep", capR: 0.26 });
    windRose(b, -1.45 + 0.3, 2.35, -1.45 + 0.3, 2.4);
    starBurst(b, 0.15, IY + 1.55, 0.15, 0.7, "#fff6d0", "#ffb020");
    starMotes(b, 40, 2.0, 0.6, 3.6, "#ffcf50", 0.08);
    kite(b, 1.9, 0.8, 1.9, 2, 4.0);
  }
  function chStore(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var dark = C(BY.black);
    hexStep(b, 1.3, 0.12, 0, -0.1, -0.1);
    var MX = -0.75, MZ = -0.75, top = hexCell(b, MX, MZ, 0.24, 2.7, 0.12, { band: 0.45, lamps: [[5, 0.7, 0.6], [0, 0.7, 0.6]] });
    b.add(new T3.TorusGeometry(0.34, 0.04, 6, 24), WGOLD(), MX, top + 0.05, MZ, { rx: PI / 2 });
    starBurst(b, MX, top + 0.5, MZ, 0.45, "#fff6d0", "#ffb020");
    var SX = 0.4, SY = 2.55, SZ = 0.25, ship = new T3.Group(); ship.position.set(SX, SY, SZ); ship.rotation.y = PI / 4; b.g.add(ship);
    b.add(new T3.SphereGeometry(1, 28, 16), M("canvasBY", 4, 2), 0, 0, 0, { parent: ship, s: [1.05, 0.42, 0.42] });
    [-0.5, 0, 0.5].forEach(function (x) { var rr = 0.42 * Math.sqrt(1 - (x / 1.05) * (x / 1.05)); b.add(new T3.TorusGeometry(rr + 0.01, 0.02, 5, 24), dark, x, 0, 0, { parent: ship, ry: PI / 2 }); });
    b.add(new T3.ConeGeometry(0.22, 0.38, 4), M("canvasBY", 1, 1, { side: T3.DoubleSide }), -1.05, 0, 0, { parent: ship, rz: PI / 2, s: [1, 1, 0.15] });
    b.add(new T3.BoxGeometry(0.85, 0.2, 0.32), M("plankWarm", 0.8, 0.3), 0.05, -0.68, 0, { parent: ship });
    var netM = new T3.MeshStandardMaterial({ map: tex("net", 1, 1), transparent: true, alphaTest: 0.4, side: T3.DoubleSide, roughness: 1 });
    [-0.25, 0.15].forEach(function (x) { b.add(new T3.SphereGeometry(0.13, 10, 8), netM, x, -0.9, 0, { parent: ship }); b.add(new T3.SphereGeometry(0.1, 8, 6), C("#c9a86a"), x, -0.92, 0, { parent: ship }); });
    [[-0.3, -0.12], [-0.3, 0.12], [0.4, -0.12], [0.4, 0.12]].forEach(function (q) { b.beam([q[0], -0.58, q[1]], [q[0] * 1.15, -0.36, q[1] * 1.6], 0.005, C("#d8cba6"), ship); });
    b.fx.push(function (t) { ship.position.y = SY + Math.sin(t * 0.8) * 0.06; ship.rotation.z = Math.sin(t * 0.6) * 0.03; });
    b.beam([MX, top - 0.1, MZ], [SX - 0.55, SY - 0.1, SZ - 0.55], 0.007, C("#d8cba6"));
    cloud(b, SX + 0.2, SY - 1.05, SZ + 0.2, 0.7); cloud(b, SX - 0.4, SY - 1.2, SZ + 0.5, 0.55);
    var lift = new T3.Group(); b.g.add(lift);
    b.add(new T3.CylinderGeometry(0.17, 0.17, 0.04, 6), M("honeycomb", 0.4, 0.4), 0, 0, 0, { parent: lift, ry: PI / 6 });
    b.add(new T3.BoxGeometry(0.14, 0.14, 0.14), M("plankWarm", 0.3, 0.3), 0, 0.09, 0, { parent: lift });
    b.add(new T3.CylinderGeometry(0.03, 0.03, 1.6, 6), new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.3, depthWrite: false }), SX + 0.05, 1.05, SZ + 0.05, { noCast: true });
    b.fx.push(function (t) { lift.position.set(SX + 0.05, 0.26 + (1 - Math.cos(t * 0.7)) * 0.75, SZ + 0.05); });
    b.lift(0.12, function () { this.crate(0.6, -0.75, 0.26, 0.3); this.crate(0.85, -0.6, 0.2, -0.2); this.sack(-0.95, 0.55, 0, "#c9a86a"); this.gold(-0.5, 0.85); });
    honeyJars(b, [[1.2, 1.05], [1.05, 1.2]]);
    starMotes(b, 12, 1.5, 1.5, 4.2, "#ffe8a0", 0.12);
  }
  function chBarracks(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.6, 1.4, 2.4, 1.2);
    var dir = [Math.SQRT1_2, -Math.SQRT1_2], CX = -0.45, CZ = -0.45, gold = WGOLD();
    var isl = [[-1.45, 2.05, 0.75, 0.5], [0, 2.45, 1.05, 0.62], [1.45, 2.05, 0.75, 0.5]].map(function (q, i) {
      var x = CX + dir[0] * q[0], z = CZ + dir[1] * q[0], I = hexIsland(b, x, q[1], z, q[2], 0.9, 50 + i);
      inGroup(b, I, function () {
        if (i === 1) { hexCell(b, 0, 0, 0.5, 1.0, 0, { cap: "tent", capH: 0.42, band: 0.55, door: [0, 0.34, 0.3], lamps: [[5, 0.8, 0.8], [1, 0.8, 0.8]] }); starBurst(b, 0, 2.0, 0, 0.45, "#fff6d0", "#ffb020"); }
        else { hexCell(b, 0, 0, 0.36, 0.7, 0, { cap: "tent", capH: 0.3, lamps: [[0, 0.55, 0.7], [5, 0.55, 0.7]] }); var g = glider(b, b.g); g.position.set(0.35, 0.15, 0.35); g.rotation.set(-0.1, PI / 4, 0); }
      });
      cloud(b, x + 0.15, q[1] - 0.75, z + 0.15, q[2] * 0.95);
      return [x, q[1], z];
    });
    var rope = C("#d8cba6"), plank = M("plankWarm", 0.3, 0.3);
    [[0, 1], [1, 2]].forEach(function (pr) { var A = isl[pr[0]], B2 = isl[pr[1]]; for (var k = 0; k <= 6; k++) { var t = k / 6, sag = Math.sin(t * PI) * 0.12; b.box(0.12, 0.03, 0.26, plank, A[0] + (B2[0] - A[0]) * t, A[1] + (B2[1] - A[1]) * t - sag - 0.02, A[2] + (B2[2] - A[2]) * t, { ry: PI / 4 }); } b.beam([A[0], A[1] + 0.25, A[2]], [B2[0], B2[1] + 0.25, B2[2]], 0.008, rope); });
    [[0.7, 1.0], [1.3, 0.4]].forEach(function (q) { b.cyl(0.03, 0.04, 1.4, 6, M("plankDark", 0.2, 1), q[0], 0, q[1]); b.cyl(0.03, 0.04, 1.4, 6, M("plankDark", 0.2, 1), q[0] + 0.6, 0, q[1] - 0.6); b.add(new T3.TorusGeometry(0.42, 0.04, 6, 30), gold, q[0] + 0.3, 1.25, q[1] - 0.3, { ry: PI / 4 }); });
    var orbit = new T3.Group(); orbit.position.set(CX, 0, CZ); b.g.add(orbit);
    var gl = [0, 1, 2].map(function () { var g = glider(b, orbit); g.scale.setScalar(1.25); return g; });
    b.fx.push(function (t) { gl.forEach(function (g, i) { var a = t * 0.45 + i * 2 * PI / 3, R = 2.1; g.position.set(Math.cos(a) * R, 3.4 + i * 0.25 + Math.sin(t * 1.3 + i) * 0.08, Math.sin(a) * R); g.rotation.set(0, -a, 0.35); }); });
    b.target(1.55, 1.55, 0.5); b.dummy(-1.4, 1.6, 0.3); b.dummy(-0.9, 1.85, -0.2);
    b.banner(-0.2, 1.95, 0, "bannerAir", 1.6);
    starMotes(b, 16, 2.2, 2.0, 4.8, "#ffe8a0", 0.12);
  }
  function chTower(b) {
    b.slab(3.2, "grassAir", "sideAir");
    hexStep(b, 0.85, 0.16, 0); hexStep(b, 0.62, 0.12, 0.16);
    b.add(new T3.RingGeometry(0.3, 0.38, 6), glowMat("#fff4c0", "#ffc030", 1.2), 0, 0.285, 0, { rx: -PI / 2, rz: PI / 6, noCast: true });
    b.add(new T3.CylinderGeometry(0.05, 0.05, 4.0, 6), new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.35, depthWrite: false }), 0, 2.3, 0, { noCast: true });
    var hc = M("honeycomb", 2, 0.3);
    [[0.58, 0.9], [0.5, 1.6], [0.42, 2.3], [0.34, 3.0], [0.26, 3.6]].forEach(function (q, i) {
      var g = new T3.Group(); b.g.add(g);
      b.add(new T3.CylinderGeometry(q[0], q[0], 0.16, 6, 1, true), [hc], 0, 0, 0, { parent: g, ry: PI / 6 });
      b.add(new T3.CylinderGeometry(q[0] + 0.02, q[0] + 0.02, 0.04, 6, 1, true), i % 2 ? WGOLD() : C(BY.black), 0, 0.09, 0, { parent: g, ry: PI / 6 });
      b.add(new T3.CylinderGeometry(q[0] - 0.05, q[0] - 0.05, 0.03, 6), dGlow("#ffe7a0", "#ffb030", 0.9), 0, -0.07, 0, { parent: g, ry: PI / 6, noCast: true });
      b.fx.push(function (t) { g.position.y = q[1] + Math.sin(t * 1.1 + i) * 0.05; g.rotation.y = (i % 2 ? -1 : 1) * t * 0.2; });
    });
    var helix = []; for (var s = 0; s <= 9; s++) { var a = s * 0.85, r = 0.85 - s * 0.05; helix.push([Math.cos(a) * r, 0.7 + s * 0.36, Math.sin(a) * r]); }
    var hg = new T3.Group(); b.g.add(hg); constellPts(b, helix, "#ffd060", hg); b.fx.push(function (t, dt) { hg.rotation.y += dt * 0.3; });
    starBurst(b, 0, 4.25, 0, 0.85, "#fff6d0", "#ffb020");
    cloud(b, 0.55, 0.55, 0.3, 0.5); cloud(b, -0.5, 0.6, 0.45, 0.45);
    b.windsock(-1.15, 0.95, 1.1);
  }
  function chPen(b) {
    b.slab(4.2, "grassAir", "sideAir");
    var IX = -0.3, IZ = -0.3, IY = 2.0;
    [[1.1, 0.3], [0.3, 1.1], [-0.8, 0.8], [0.8, -0.8], [-0.9, -0.3], [-0.3, -0.9], [0.1, 0.1]].forEach(function (q, i) { cloud(b, IX + q[0], IY - 0.7 - (i % 2) * 0.15, IZ + q[1], 1.0 + (i % 3) * 0.1); });
    var I = hexIsland(b, IX, IY, IZ, 1.3, 0.9, 63);
    inGroup(b, I, function () {
      hexStep(b, 0.7, 0.12, 0, -0.1, -0.1); hexStep(b, 0.5, 0.12, 0.12, -0.1, -0.1);
      b.lift(0.24, function () { this.bear(-0.1, -0.1, 0.95, -0.6); });
      honeyJars(b, [[0.75, 0.35], [0.85, 0.2], [0.35, 0.8]]);
    });
    var halo = new T3.Group(); halo.position.set(IX - 0.45, IY + 1.25, IZ - 0.45); halo.rotation.y = PI / 4; b.g.add(halo);
    b.add(new T3.TorusGeometry(0.95, 0.05, 6, 48), WGOLD(), 0, 0, 0, { parent: halo });
    b.add(new T3.CircleGeometry(0.92, 40), glowMat("#fff0b0", "#ffb020", 0.7), 0, 0, -0.02, { parent: halo, noCast: true });
    var Y = IY + 2.4, bear = [[-1.4, Y + 0.1, 0.6], [-0.9, Y + 0.25, 0.55], [-0.45, Y + 0.2, 0.4], [0, Y, 0.2], [0.15, Y - 0.35, 0.65], [0.7, Y - 0.3, 0.45], [0.6, Y + 0.1, 0.0], null];
    constellPts(b, bear.filter(Boolean), "#ffd060");
    constellPts(b, [[0, Y, 0.2], [0.6, Y + 0.1, 0.0]], "#ffd060");
    b.add(new T3.CylinderGeometry(0.42, 0.42, 0.06, 6), glowMat("#ffc040", "#ff9010", 1.0), 1.2, 0.03, 1.2, { ry: PI / 6, noCast: true });
    [[1.85, 0.4], [1.85, 0.8], [0.4, 1.85]].forEach(function (q) { b.cyl(0.03, 0.03, 0.3, 5, M("plankDark", 0.3, 0.3), q[0], 0, q[1]); b.box(0.3, 0.04, 0.3, M("plankWarm", 0.4, 0.4), q[0], 0.3, q[1]); dSkep(b, q[0], 0.34, q[1], 0.13, 0.28); });
    hexSteps(b, 2.0, 1.25, -0.35, 0.3, 1.9, 7);
    starMotes(b, 18, 2.2, 1.5, 5.0, "#ffe8a0", 0.12);
  }
  function chSanctum(b) {
    b.slab(4.2, "grassAir", "sideAir");
    hexStep(b, 2.0, 0.14, 0); hexStep(b, 1.65, 0.14, 0.14);
    var post = M("plankDark", 0.3, 1), dark = C(BY.black);
    [[0, 1.55, 1.3, 1.05, 0.95], [0, 2.95, 0.92, 0.75, 0.75], [0, 4.05, 0.6, 0.5, 0.55]].forEach(function (q, i) {
      var I = hexIsland(b, 0, q[1], 0, q[2], 0.55 + (2 - i) * 0.25, 90 + i);
      inGroup(b, I, function () {
        for (var k = 0; k < 6; k++) { var p = dRing(q[3] * 0.75, k * PI / 3 + PI / 6); b.cyl(0.04, 0.05, q[4], 6, post, p[0], 0, p[1]); }
        b.add(new T3.CylinderGeometry(0.2 * (3 - i) * 0.5, 0.2 * (3 - i) * 0.5, q[4] * 0.8, 6), glowMat("#ffd27a", "#ffa420", 1.5), 0, q[4] * 0.45, 0, { ry: PI / 6, noCast: true });
        b.add(new T3.ConeGeometry(q[3] + 0.1, q[4] * 0.5, 6, 1, true), M("canvasBY", 3, 1, { side: T3.DoubleSide }), 0, q[4] + q[4] * 0.25, 0, { ry: PI / 6 });
        b.add(new T3.CylinderGeometry(q[3] + 0.11, q[3] + 0.11, 0.04, 6, 1, true), i === 1 ? WGOLD() : dark, 0, q[4], 0, { ry: PI / 6 });
      });
      cloud(b, 0.3, q[1] - 0.6, 0.2, q[2] * 0.7); cloud(b, -0.35, q[1] - 0.65, -0.2, q[2] * 0.6);
    });
    starBurst(b, 0, 5.15, 0, 1.05, "#fff6d0", "#ffb020", 12);
    b.add(new T3.TorusGeometry(0.7, 0.035, 6, 40), WGOLD(), 0, 5.15, 0, { rx: PI / 2 - 0.3 });
    var sh = new T3.Group(); sh.position.y = 2.4; b.g.add(sh);
    for (var s = 0; s < 4; s++) { var a = s * PI / 2, p = onRing(2.05, a), sg = new T3.Group(); sg.position.set(p[0], (s % 2) * 0.4, p[1]); sh.add(sg); inGroup(b, sg, function () { b.cyl(0.025, 0.03, 1.0, 6, post, 0, -0.3, 0); bySail(b, 0, 0.65, 0, a + PI / 2, 0.75); windRose(b, 0.03, 0.75, 0.03, 0.55); b.add(new T3.CylinderGeometry(0.16, 0.16, 0.08, 6), M("honeycomb", 0.4, 0.4), 0, -0.32, 0, { ry: PI / 6 }); }); }
    b.fx.push(function (t, dt) { sh.rotation.y += dt * 0.25; });
    constellation(b, 3.6, 2.6, 8, "#ffd060", 0.15, -0.1);
    starMotes(b, 26, 2.4, 0.8, 5.8, "#ffe8a0", 0.13);
  }
  function chWorkshop(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.7, 1.4, 2.2, 1.1, -0.3);
    var gold = WGOLD(), dark = C(BY.black), post = M("plankDark", 0.3, 2);
    var RX = -0.75, RZ = -0.75, RY = 2.0, R = 1.15;
    hexStep(b, 1.25, 0.12, 0, RX, RZ);
    [-1, 1].forEach(function (s) { var x = RX + s * R * Math.SQRT1_2, z = RZ - s * R * Math.SQRT1_2; hexCell(b, x, z, 0.2, RY - 0.1, 0.12, { band: 0.5, lamps: [[5, 0.4, 0.6]] }); });
    var ring = new T3.Group(); ring.position.set(RX, RY, RZ); ring.rotation.y = PI / 4; b.g.add(ring);
    b.add(new T3.TorusGeometry(R, 0.09, 6, 6), M("honeycomb", 3, 0.3), 0, 0, 0, { parent: ring, rz: PI / 6 });
    b.add(new T3.TorusGeometry(R + 0.1, 0.03, 6, 6), gold, 0, 0, 0, { parent: ring, rz: PI / 6 });
    b.add(new T3.CircleGeometry(R - 0.06, 6), AMBERG(0.55), 0, 0, 0, { parent: ring, rz: PI / 6, noCast: true });
    var bm = new T3.MeshBasicMaterial({ color: lin("#fff0a0"), transparent: true, opacity: 0.35, depthWrite: false });
    b.add(new T3.ConeGeometry(R * 0.85, 1.6, 6, 1, true), bm, RX + 0.75, RY - 0.25, RZ + 0.75, { rz: PI / 2 + 0.55, ry: -PI / 4, noCast: true });
    var AX = 0.55, AZ = 0.55;
    b.box(0.5, 0.35, 0.4, C("#5a4a3a"), AX, 0, AZ, { ry: PI / 4 });
    b.add(new T3.SphereGeometry(0.18, 14, 10), glowMat("#fff6d0", "#ffb020", 2.4), AX, 0.48, AZ, { noCast: true });
    var bal = new T3.Group(); bal.position.set(0.95, 0, -0.35); bal.rotation.y = PI / 4 + 0.5; bal.scale.setScalar(1.7); b.g.add(bal);
    [[-0.3, 0.32], [0.3, 0.32], [-0.3, -0.36], [0.3, -0.36]].forEach(function (q) { b.add(new T3.CylinderGeometry(0.13, 0.13, 0.06, 6), M("honeycomb", 0.3, 0.1), q[0], 0.13, q[1], { parent: bal, rz: PI / 2 }); });
    b.add(new T3.BoxGeometry(0.55, 0.12, 0.95), M("plankWarm", 0.5, 0.8), 0, 0.24, 0, { parent: bal });
    var head = new T3.Group(); head.position.set(0, 0.5, 0); bal.add(head);
    b.add(new T3.BoxGeometry(0.12, 0.12, 1.15), M("plankDark", 0.2, 1), 0, 0, 0, { parent: head });
    [-1, 1].forEach(function (s) { var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(s * 0.75, 0.12); sh.lineTo(s * 0.6, -0.25); sh.closePath(); b.add(new T3.ShapeGeometry(sh), M("canvasBY", 0.8, 0.5, { side: T3.DoubleSide }), 0, 0.02, 0.25, { parent: head, rx: -PI / 2 }); });
    var bolt = b.add(new T3.OctahedronGeometry(0.1, 0), glowMat("#fff6d0", "#ffb020", 2.6), 0, 0.1, 0.45, { parent: head, noCast: true }); bolt.scale.set(0.8, 0.8, 4);
    b.fx.push(function (t) { head.rotation.y = Math.sin(t * 0.5) * 0.3; });
    cloud(b, -1.8, 0.55, 1.0, 0.6); cloud(b, 1.6, 0.6, -1.6, 0.55);
    starBurst(b, RX, RY + R + 0.55, RZ, 0.5, "#fff6d0", "#ffb020");
    b.banner(-0.3, 1.95, 0, "bannerAir", 1.6);
    starMotes(b, 16, 2.2, 0.8, 4.0, "#ffe8a0", 0.11);
  }

  /* ======================= RAVENCLAW ======================= */
  function cwHouse(b) {
    b.slab(3.2, "grassWater", "sideWater");
    var X = -0.15, Z = -0.15, sv = SILVER();
    roundPool(b, X, Z, 1.2);
    b.add(new T3.CylinderGeometry(0.42, 0.55, 0.3, 32), PEARLM(1.5, 0.3), X, 0.15, Z);
    crescent(b, X, 1.6, Z, 1.05, 0.1, PI / 4, sv, PI * 1.45);
    var GY = 1.62;
    b.add(new T3.SphereGeometry(0.62, 32, 24), GLASSM(0.3), X, GY, Z, { noCast: true });
    for (var k = 0; k < 4; k++) b.add(new T3.TorusGeometry(0.625, 0.014, 5, 40), sv, X, GY, Z, { ry: k * PI / 4 });
    b.add(new T3.CylinderGeometry(0.5, 0.5, 0.04, 32), PEARLM(1, 1), X, GY - 0.2, Z);
    dConch(b, X, Z, 0.7, 0.24, GY - 0.18, 3);
    var L = new T3.PointLight("#9fd8ff", 1.2, 3, 2); L.position.set(X, GY, Z); b.g.add(L);
    b.beam([X, 0.3, Z], [X, GY - 0.62, Z], 0.08, sv);
    moonOrb(b, X - 0.25, 3.25, Z - 0.25, 0.3);
    armSphere(b, X - 0.25, 3.25, Z - 0.25, 0.78);
    var tip = function (s) { var a = 1.5 * PI + s * PI * 0.725, lx = Math.cos(a) * 1.05; return [X + lx * Math.SQRT1_2, 1.6 + Math.sin(a) * 1.05, Z - lx * Math.SQRT1_2]; };
    [-1, 1].forEach(function (s) { var p = tip(s); waterArc(b, p[0], p[1], p[2], p[0] + s * 0.25, 0.15, p[2] - s * 0.25, 0.1, 9); });
    starMotes(b, 14, 1.5, 1.0, 4.2, "#cfe6ff", 0.12);
    shells(b, [[1.2, -1.0], [-1.25, 1.05]]);
  }
  function cwFarm(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var sv = SILVER();
    roundPool(b, 0, 0, 1.95);
    b.cyl(0.18, 0.24, 2.0, 16, sv, 0, 0, 0);
    [[1.65, 0.35], [1.15, 0.95], [0.7, 1.55]].forEach(function (q, i) {
      b.add(new T3.CylinderGeometry(q[0], q[0], 0.08, 48), GLASSM(0.45), 0, q[1], 0, { noCast: true });
      b.add(new T3.TorusGeometry(q[0], 0.035, 6, 56), sv, 0, q[1] + 0.04, 0, { rx: PI / 2 });
      var n = [14, 10, 6][i];
      for (var k = 0; k < n; k++) { var a = k / n * 2 * PI, r = q[0] - 0.22; b.add(new T3.ConeGeometry(0.05, 0.35, 5), C(k % 2 ? "#3f8a5a" : "#5fae6a", { flatShading: true }), Math.cos(a) * r, q[1] + 0.21, Math.sin(a) * r); b.add(new T3.SphereGeometry(0.035, 8, 6), dGlow("#e8f8ff", "#58c8ff", 1.6), Math.cos(a) * r, q[1] + 0.42, Math.sin(a) * r, { noCast: true }); }
      for (var w = 0; w < 4; w++) { var wa = w * PI / 2 + i * 0.4, p = onRing(q[0], wa); waterArc(b, p[0], q[1], p[1], p[0] * 1.2, q[1] - 0.6 + (i ? 0.3 : 0.35), p[1] * 1.2, 0.08, 7); }
    });
    var MY = 2.75;
    moonOrb(b, 0, MY, 0, 0.42);
    crescent(b, 0, MY, 0, 0.7, 0.05, PI / 4, sv, PI * 1.3);
    waterRing2(b, 0, MY, 0, 0.95, 0.35, 0.5);
    constellation(b, 3.5, 2.0, 7, "#9fd8ff", 0.2, 0.1);
    starMotes(b, 18, 2.2, 0.8, 4.0, "#cfe6ff", 0.12);
  }
  function cwStore(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var X = -0.3, Z = -0.45, sv = SILVER();
    blueTerrace(b, X, Z, 1.05, 0.14, 0);
    var shellM = M("pearl", 2, 2, { color: lin("#f2e6ee"), roughness: 0.35, side: T3.DoubleSide }), inM = M("pearl", 1, 1, { color: lin("#f8f0ff"), emissive: lin("#7a8ad0"), emissiveIntensity: 0.25, side: T3.DoubleSide });
    var clam = new T3.Group(); clam.position.set(X, 0.14, Z); clam.rotation.y = PI / 4; b.g.add(clam);
    b.add(new T3.SphereGeometry(1, 28, 12, 0, 2 * PI, PI / 2, PI / 2), shellM, 0, 0.3, 0, { parent: clam, s: [0.95, 0.3, 0.8] });
    var lid = new T3.Group(); lid.position.set(0, 0.3, -0.78); lid.rotation.x = -1.2; clam.add(lid);
    b.add(new T3.SphereGeometry(1, 28, 12, 0, 2 * PI, 0, PI / 2), shellM, 0, 0, 0.78, { parent: lid, s: [0.95, 0.3, 0.8] });
    b.add(new T3.SphereGeometry(0.93, 28, 12, 0, 2 * PI, 0, PI / 2), inM, 0, -0.01, 0.78, { parent: lid, s: [0.95, 0.28, 0.8] });
    for (var r = 0; r < 9; r++) { var a = (r - 4) * 0.28; b.add(new T3.TorusGeometry(0.62, 0.02, 5, 20, PI * 0.5), sv, Math.sin(a) * 0.3, 0.12, 0.78 + Math.cos(a) * 0.05, { parent: lid, ry: a, rx: -PI / 2, rz: PI * 0.25 }); }
    b.add(new T3.TorusGeometry(0.88, 0.03, 6, 48), sv, 0, 0.3, 0, { parent: clam, rx: PI / 2, s: [1, 0.85, 1] });
    b.fx.push(function (t) { lid.rotation.x = -1.2 - Math.sin(t * 0.5) * 0.06; });
    var pearl = moonOrb(b, X, 0.82, Z, 0.36, false);
    var MX = 1.1, MZ = 0.25;
    b.cyl(0.04, 0.05, 1.9, 8, sv, MX, 0, MZ);
    b.beam([MX, 1.8, MZ], [0.45, 2.0, 1.05], 0.03, sv);
    var pv = new T3.Group(); pv.position.set(0.45, 2.0, 1.05); b.g.add(pv);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.95, 4), C("#d8cba6"), 0, -0.47, 0, { parent: pv });
    b.add(new T3.SphereGeometry(0.13, 14, 10), dGlow("#f8f0ff", "#9fb8ff", 1.2), 0, -1.05, 0, { parent: pv, noCast: true });
    b.fx.push(function (t) { pv.rotation.z = Math.sin(t * 1.2) * 0.08; });
    crescent(b, X - 0.25, 2.3, Z - 0.25, 0.42, 0.045, PI / 4, sv, PI * 1.3);
    armSphere(b, X - 0.25, 2.3, Z - 0.25, 0.5);
    b.boat(-0.65, 1.2, -0.2);
    starMotes(b, 12, 1.5, 0.8, 3.6, "#cfe6ff", 0.11);
  }
  function cwBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var HX = -0.35, HZ = -0.8, sv = SILVER(), L = 3.0;
    b.box(L + 0.6, 0.28, 1.8, PEARLM(3, 0.3), HX, 0, HZ); b.box(L + 0.62, 0.05, 1.82, M("stoneBlue", 3, 0.2), HX, 0.22, HZ);
    b.add(new T3.BoxGeometry(L, 0.95, 0.9), GLASSM(0.35), HX, 0.28 + 0.475, HZ, { noCast: true });
    b.add(new T3.BoxGeometry(L, 0.05, 0.92), sv, HX, 1.25, HZ);
    for (var i = 0; i < 3; i++) b.add(new T3.SphereGeometry(0.12, 12, 10), dGlow("#e8f8ff", "#58c8ff", 1.6), HX - 0.9 + i * 0.9, 0.7, HZ, { noCast: true });
    for (var k = 0; k < 6; k++) { var x = HX - L / 2 + k * L / 5; crescent(b, x, 1.15, HZ, 0.62, 0.05, PI / 2, sv, PI * 1.2); b.cyl(0.05, 0.06, 0.6, 10, PEARLM(0.3, 0.5), x, 0.28, HZ + 0.52); }
    var orb = new T3.Group(); orb.position.set(HX, 2.35, HZ); b.g.add(orb);
    inGroup(b, orb, function () { moonOrb(b, 1.05, 0, 0, 0.26); moonOrb(b, -1.05, 0.15, 0, 0.2); });
    b.fx.push(function (t, dt) { orb.rotation.y += dt * 0.35; });
    armSphere(b, HX, 2.35, HZ, 0.55);
    waterCol(b, HX, 1.3, HZ, 0.06, 0.65);
    b.water(HX - 1.4, 0.55, HX + 1.0, 1.75, 0.0, 0.09); b.box(2.4, 0.12, 0.08, PEARLM(2, 0.2), HX - 0.2, 0, 0.5);
    [[HX - 0.9, 1.15], [HX - 0.2, 1.35], [HX + 0.5, 1.15]].forEach(function (q, i) { var o = b.add(new T3.SphereGeometry(0.1, 12, 10), dGlow("#e8f8ff", "#58c8ff", 1.5), q[0], 0.4, q[1], { noCast: true }); b.fx.push(function (t) { o.position.y = 0.35 + Math.abs(Math.sin(t * 1.5 + i)) * 0.4; }); });
    b.target(1.55, 1.1, 0.6); b.target(1.75, 0.45, 0.8);
    b.banner(HX - 0.6, HZ + 1.15, 0.28, "bannerWater", 1.4); b.banner(HX + 0.6, HZ + 1.15, 0.28, "bannerWater", 1.4);
    starMotes(b, 14, 2.2, 1.0, 3.8, "#cfe6ff", 0.11);
  }
  function cwTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var X = -0.2, Z = -0.45, sv = SILVER();
    blueTerrace(b, X, Z, 0.9, 0.16, 0); pearlTerrace(b, X, Z, 0.7, 0.14, 0.16);
    b.cyl(0.2, 0.36, 3.1, 28, PEARLM(1.2, 3), X, 0.3, Z);
    [0.9, 1.7, 2.5].forEach(function (y) { b.add(new T3.TorusGeometry(0.34 - y * 0.045, 0.025, 6, 30), sv, X, 0.3 + y, Z, { rx: PI / 2 }); });
    shellMouth(b, X + 0.35 * 0.707, 0.3, Z + 0.35 * 0.707, PI / 4, 0.5);
    bronzeRing(b, X, 2.65, Z, 0.42, 10);
    b.add(new T3.SphereGeometry(0.24, 20, 12, 0, 2 * PI, 0, PI / 2), sv, X, 3.4, Z);
    var cres = crescent(b, X, 4.05, Z, 0.42, 0.07, PI / 4, sv, PI * 1.35);
    moonOrb(b, X, 4.05, Z, 0.18, false);
    b.fx.push(function (t) { cres.rotation.y = PI / 4 + Math.sin(t * 0.4) * 0.5; });
    waterRing2(b, X, 1.4, Z, 0.5, 0.3, 0.7); waterRing2(b, X, 2.2, Z, 0.42, -0.3, -0.8);
    waterArc(b, X + 0.2, 3.3, Z + 0.2, X + 0.8, 0.3, Z + 0.8, 0.2, 12);
    b.boat(-0.65, 1.2, -0.2);
    starMotes(b, 12, 1.4, 1.5, 4.6, "#cfe6ff", 0.11);
  }
  function cwPen(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var X = -0.1, Z = -0.15, sv = SILVER();
    roundPool(b, X, Z, 1.65);
    var C2 = crescent(b, X, 1.75, Z, 1.55, 0.17, PI / 4, M("pearl", 2, 2, { color: lin("#e8eef8"), emissive: lin("#6a8ad0"), emissiveIntensity: 0.3 }), PI * 1.3);
    b.add(new T3.TorusGeometry(1.55, 0.04, 6, 64, PI * 1.3), sv, 0, 0, 0.1, { parent: C2, rz: PI / 2 - PI * 0.65 + PI });
    var perches = [-0.55, -0.15, 0.25, 0.55];
    perches.forEach(function (f, i) { var a = PI / 2 + PI + f * PI * 0.62, x = Math.cos(a) * 1.6, y = Math.sin(a) * 1.6; var w = new T3.Vector3(x, y + 0.1, 0).applyAxisAngle(new T3.Vector3(0, 1, 0), PI / 4); b.raven(X + w.x, 1.75 + w.y, Z + w.z, 0.45, PI / 4 + (i % 2 ? 0.6 : -0.6), false); });
    moonOrb(b, X, 2.15, Z, 0.42);
    var orb = new T3.Group(); orb.position.set(X, 2.6, Z); b.g.add(orb);
    inGroup(b, orb, function () { b.raven(1.7, 0, 0, 0.55, PI, true); b.raven(-1.6, 0.3, 0, 0.5, 0, true); });
    b.fx.push(function (t, dt) { orb.rotation.y += dt * 0.5; });
    var RY = 4.0; constellPts(b, [[-1.0, RY, 0.6], [-0.4, RY + 0.25, 0.4], [0.1, RY + 0.1, 0.1], [0.6, RY + 0.4, -0.2], [1.1, RY + 0.15, -0.5], [0.4, RY - 0.25, -0.1], [0.1, RY + 0.1, 0.1]], "#9fd8ff");
    starMotes(b, 18, 2.2, 1.0, 4.6, "#cfe6ff", 0.12);
    b.banner(1.75, 1.3, 0, "bannerWater", 1.5);
  }
  function cwSanctum(b) {
    b.slab(4.2, "grassWater", "sideWater");
    blueTerrace(b, 0, 0, 2.0, 0.16, 0); pearlTerrace(b, 0, 0, 1.75, 0.14, 0.16); pearlTerrace(b, 0, 0, 1.45, 0.12, 0.3);
    var sv = SILVER(), Y0 = 0.42;
    for (var k = 0; k < 10; k++) { var p = dRing(1.3, k * 2 * PI / 10); b.cyl(0.06, 0.07, 0.75, 12, PEARLM(0.4, 0.6), p[0], Y0, p[1]); b.add(new T3.SphereGeometry(0.06, 10, 8), dGlow("#e8f8ff", "#58c8ff", 1.6), p[0], Y0 + 0.82, p[1], { noCast: true }); }
    b.add(new T3.TorusGeometry(1.3, 0.05, 8, 56), sv, 0, Y0 + 0.78, 0, { rx: PI / 2 });
    b.cyl(0.08, 0.14, 3.6, 16, sv, 0, Y0, 0);
    crescent(b, 0, Y0 + 3.75, 0, 0.36, 0.06, PI / 4, sv, PI * 1.35);
    var CY = Y0 + 2.2;
    moonOrb(b, 0, CY, 0, 0.45, false);
    [[1.0, 0.18, 0.7, "#8fd8ff", 0.4], [1.5, 0.24, -0.45, "#f0e2da", -0.25], [1.95, 0.16, 0.3, "#c8d4ff", 0.15]].forEach(function (q, i) {
      var arm = new T3.Group(); arm.position.y = CY; arm.rotation.x = q[4]; b.g.add(arm);
      b.add(new T3.TorusGeometry(q[0], 0.012, 4, 64), sv, 0, 0, 0, { parent: arm, rx: PI / 2 });
      var sp = new T3.Group(); arm.add(sp);
      b.beam([0, 0, 0], [q[0], 0, 0], 0.012, sv, sp);
      var pl = b.add(new T3.SphereGeometry(q[1], 18, 14), i === 0 ? WATERM(0.6, 0.6, 0.85) : C(q[3], { emissive: lin(q[3]), emissiveIntensity: 0.3 }), q[0], 0, 0, { parent: sp, noCast: true });
      if (i === 1) b.add(new T3.TorusGeometry(q[1] * 1.7, 0.015, 4, 28), sv, q[0], 0, 0, { parent: sp, rx: PI / 2 - 0.4 });
      b.fx.push(function (t) { sp.rotation.y = t * q[2]; });
    });
    [PI / 4, 3 * PI / 4, 5 * PI / 4, 7 * PI / 4].forEach(function (a) { var p = onRing(1.72, a); waterArc(b, p[0], 0.4, p[1], p[0] * 0.2, CY - 0.3, p[1] * 0.2, 0.8, 12); });
    constellation(b, Y0 + 4.2, 2.3, 9, "#9fd8ff", 0.18, 0.08);
    starMotes(b, 24, 2.3, 0.6, 5.2, "#cfe6ff", 0.12);
    b.banner(-1.95, 1.05, 0, "bannerWater", 1.5);
  }
  function cwWorkshop(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var sv = SILVER(), DX = 0.35, DZ = 0.4, WL = 3.0, WD = 2.2, T = 0.22, H = 0.42, pl = PEARLM(2.6, 0.3);
    b.box(WL, 0.06, WD, M("pearl", 2.6, 2), DX, 0, DZ);
    [[0, -(WD - T) / 2, WL, T], [0, (WD - T) / 2, WL, T], [-(WL - T) / 2, 0, T, WD - 2 * T], [(WL - T) / 2, 0, T, WD - 2 * T]].forEach(function (w) { b.add(new T3.BoxGeometry(w[2], H, w[3]), pl, DX + w[0], H / 2, DZ + w[1]); b.box(w[2] + 0.02, 0.04, w[3] + 0.02, sv, DX + w[0], H, DZ + w[1]); });
    b.water(DX - WL / 2 + T, DZ - WD / 2 + T, DX + WL / 2 - T, DZ + WD / 2 - T, 0.06, 0.28);
    waterCol(b, DX, 0.28, DZ, 0.07, 0.4);
    var ship = new T3.Group(); ship.position.set(DX, 0.78, DZ); ship.rotation.y = PI / 4; ship.scale.setScalar(1.3); b.g.add(ship);
    var sh = new T3.Shape(); sh.moveTo(-1.15, 0); sh.quadraticCurveTo(-0.7, 0.42, 0.2, 0.42); sh.quadraticCurveTo(0.95, 0.35, 1.25, 0); sh.quadraticCurveTo(0.95, -0.35, 0.2, -0.42); sh.quadraticCurveTo(-0.7, -0.42, -1.15, 0);
    b.add(new T3.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), M("pearl", 2, 2, { color: lin("#e8eef8") }), 0, 0, 0, { parent: ship, rx: -PI / 2 });
    b.add(new T3.BoxGeometry(1.7, 0.04, 0.6), sv, 0, 0.3, 0, { parent: ship });
    b.cyl(0.03, 0.04, 1.6, 8, sv, -0.15, 0.3, 0, { parent: ship });
    [[1.0, 0.0], [0.7, 0.75]].forEach(function (q) { var cs = new T3.Shape(); cs.absarc(0, 0, q[0] * 0.6, -PI / 2, PI / 2, false); cs.absarc(-0.18, 0, q[0] * 0.48, PI / 2, -PI / 2, true); b.add(new T3.ShapeGeometry(cs, 20), M("pearl", 1, 1, { color: lin("#f4f6ff"), emissive: lin("#6a8ad0"), emissiveIntensity: 0.45, side: T3.DoubleSide }), -0.1, 0.95 + q[1] * 0.65, 0.01, { parent: ship }); });
    var gun = new T3.Group(); gun.position.set(0.85, 0.42, 0); ship.add(gun);
    b.add(new T3.CylinderGeometry(0.08, 0.12, 0.6, 14), sv, 0.25, 0.05, 0, { parent: gun, rz: -PI / 2 + 0.2 });
    b.add(new T3.SphereGeometry(0.12, 14, 10), dGlow("#f8f0ff", "#9fb8ff", 2.0), -0.05, 0.05, 0, { parent: gun, noCast: true });
    b.fx.push(function (t) { ship.position.y = 0.78 + Math.sin(t * 1.1) * 0.05; gun.rotation.y = Math.sin(t * 0.5) * 0.4; });
    waterCol(b, DX + 0.5, 0.28, DZ - 0.5, 0.07, 0.4); waterCol(b, DX - 0.5, 0.28, DZ + 0.5, 0.07, 0.4);
    var GX = -1.5, GZ = -1.4;
    blueTerrace(b, GX, GZ, 0.5, 0.14, 0);
    b.cyl(0.08, 0.1, 2.2, 12, sv, GX, 0.14, GZ);
    crescent(b, GX, 2.5, GZ, 0.36, 0.05, PI / 4, sv, PI * 1.35); moonOrb(b, GX, 2.5, GZ, 0.17, false);
    b.beam([GX, 2.1, GZ], [DX - 0.2, 2.25, DZ - 0.2], 0.035, sv);
    b.add(new T3.CylinderGeometry(0.005, 0.005, 1.0, 4), C("#d8cba6"), DX - 0.2, 1.75, DZ - 0.2);
    waveWall(b, 1.9, 0.0, -1.0, PI, 0.6);
    b.banner(1.95, 1.85, 0, "bannerWater", 1.5);
    starMotes(b, 14, 2.2, 0.8, 3.6, "#cfe6ff", 0.11);
  }

  /* ======================= GRYFFINDOR ======================= */
  function cgHouse(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var X = -0.2, Z = -0.25, obs = OBS(), gold = WGOLD(), lava = lavaM(1.7);
    dFrustum(b, X, 0, Z, 1.3, 1.22, 0.16, M("basalt", 2, 0.2)); magmaMoat(b, X, Z, 1.1, 0.17);
    dFrustum(b, X, 0.16, Z, 0.85, 0.75, 1.05, obs); edgeLava(b, X, Z, 0.16, 0.85, 0.75, 1.05, lava);
    dFrustum(b, X, 1.15, Z, 0.78, 0.78, 0.06, gold);
    b.add(new T3.SphereGeometry(0.55, 28, 14, 0, 2 * PI, 0, PI / 2), gold, X, 1.21, Z);
    var fins = new T3.Group(); fins.position.set(X, 1.25, Z); b.g.add(fins);
    for (var i = 0; i < 12; i++) { var a = i / 12 * 2 * PI, fg = new T3.Group(); fg.rotation.y = -a; fins.add(fg); var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(0.75, 0.15); sh.lineTo(0.55, 0.55); sh.lineTo(0.25, 0.5); sh.closePath(); b.add(new T3.ExtrudeGeometry(sh, { depth: 0.035, bevelEnabled: false }), i % 2 ? gold : lavaM(1.3), 0.35, -0.05, -0.017, { parent: fg }); }
    b.fx.push(function (t, dt) { fins.rotation.y += dt * 0.15; });
    sunOrb(b, X, 2.65, Z, 0.32);
    forgeGate(b, X, 0.16, Z + 0.85 * 0.707 + 0.02, 0, 0.3, 0.5, 0.6);
    lionStatue(b, 1.0, 1.0, 0, PI / 4, 0.55); obelisk(b, X + 1.05, Z - 1.0, 1.5, 0);
    starMotes(b, 12, 1.5, 1.0, 3.8, "#ffc070", 0.12);
  }
  function cgFarm(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var R = 1.75, gold = WGOLD(), lava = lavaM(1.5);
    b.add(new T3.CylinderGeometry(R + 0.15, R + 0.2, 0.12, 12), M("basalt", 3, 0.2), 0, 0.06, 0);
    b.add(new T3.CylinderGeometry(R + 0.16, R + 0.16, 0.035, 12, 1, true), gold, 0, 0.12, 0);
    var cols = ["#f2c84a", "#ffd860", "#f8e080"].map(function (c) { return C(c, { flatShading: true, emissive: lin("#a06010"), emissiveIntensity: 0.25 }); });
    for (var w = 0; w < 12; w++) {
      var t0 = w * PI / 6 + 0.04, tl = PI / 6 - 0.08;
      b.add(new T3.CylinderGeometry(R, R, 0.05, 6, 1, false, t0, tl), M("soil", 2, 2), 0, 0.145, 0);
      for (var s = 0; s < 9; s++) { var rr = 0.55 + b.rand() * (R - 0.65), th = t0 + 0.04 + b.rand() * (tl - 0.08), hh = 0.26 + b.rand() * 0.12; b.add(new T3.ConeGeometry(0.035, hh, 4), cols[(b.rand() * 3) | 0], Math.sin(th) * rr, 0.17 + hh / 2, Math.cos(th) * rr); }
      var ga = w * PI / 6; b.add(new T3.BoxGeometry(0.04, 0.03, R - 0.5), lava, Math.sin(ga) * (0.5 + (R - 0.5) / 2), 0.16, Math.cos(ga) * (0.5 + (R - 0.5) / 2), { ry: ga, noCast: true });
    }
    var SY = 3.1;
    [PI / 4, 3 * PI / 4, 5 * PI / 4, 7 * PI / 4].forEach(function (a) {
      var pts = []; for (var s2 = 0; s2 <= 10; s2++) { var t = s2 / 10, r = R * (1 - t) * 0.95 + 0.42 * t, y = 0.15 + (SY - 0.15) * Math.sin(t * PI / 2) - 0.0; pts.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
      for (var k = 0; k < 10; k++) b.beam(pts[k], pts[k + 1], 0.05 - k * 0.003, gold);
      var p = onRing(R * 0.95, a); b.cyl(0.14, 0.18, 0.2, 8, OBS(), p[0], 0.12, p[1]);
    });
    sunOrb(b, 0, SY, 0, 0.45);
    [PI / 8, 5 * PI / 8, 9 * PI / 8, 13 * PI / 8].forEach(function (a) { var p = onRing(R + 0.05, a), m = b.add(new T3.CircleGeometry(0.2, 20), C("#fff4d0", { metalness: 0.9, roughness: 0.1, side: T3.DoubleSide }), p[0], 0.45, p[1], { noCast: true }); m.lookAt(0, SY, 0); b.beam([p[0], 0.12, p[1]], [p[0], 0.35, p[1]], 0.03, gold); });
    starMotes(b, 16, 2.0, 0.6, 4.0, "#ffc070", 0.12);
  }
  function cgStore(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var X = -0.2, Z = -0.2, obs = OBS(), gold = C("#f2c040", { metalness: 0.85, roughness: 0.25 });
    dFrustum(b, X, 0, Z, 1.35, 1.28, 0.16, M("basalt", 2, 0.2)); magmaMoat(b, X, Z, 1.15, 0.17);
    dFrustum(b, X, 0.16, Z, 1.1, 1.05, 0.22, obs);
    dFrustum(b, X, 0.38, Z, 0.98, 0.12, 1.6, gold);
    for (var k = 1; k < 5; k++) { var y = 0.38 + k * 0.32, r = 0.98 - (0.86 * k * 0.32 / 1.6) + 0.01; dFrustum(b, X, y, Z, r, r - 0.01, 0.02, C("#9a6418", { metalness: 0.7 })); }
    forgeGate(b, X, 0.38, Z + 0.98 * 0.707 - 0.08, 0, 0.32, 0.42, 0.6);
    var cap = new T3.Group(); b.g.add(cap);
    b.add(new T3.ConeGeometry(0.22, 0.32, 4), glowMat("#fff4c0", "#ffb020", 2.6), 0, 0, 0, { parent: cap, ry: PI / 4, noCast: true });
    b.add(new T3.ConeGeometry(0.22, 0.14, 4), glowMat("#fff4c0", "#ffb020", 2.6), 0, -0.23, 0, { parent: cap, ry: PI / 4, rx: PI, noCast: true });
    cap.add(new T3.PointLight("#ffc050", 1.6, 5, 2));
    var ring = new T3.Group(); cap.add(ring);
    b.add(new T3.TorusGeometry(0.42, 0.025, 6, 36), WGOLD(), 0, 0, 0, { parent: ring, rx: PI / 2 });
    for (var f = 0; f < 8; f++) { var p = onRing(0.42, f / 8 * 2 * PI); b.add(new T3.ConeGeometry(0.03, 0.12, 4), WGOLD(), p[0], 0.05, p[1], { parent: ring }); }
    b.fx.push(function (t) { cap.position.set(X, 2.45 + Math.sin(t * 1.2) * 0.07, Z); cap.rotation.y = t * 0.5; ring.rotation.y = -t; });
    lionStatue(b, X + 0.25, Z + 1.2, 0.16, PI / 4, 0.55); lionStatue(b, X + 1.2, Z + 0.25, 0.16, PI / 4, 0.55);
    var gb = C("#f2c040", { metalness: 0.85, roughness: 0.3 });
    for (var rr = 0; rr < 3; rr++) for (var cc = 0; cc < 3 - rr; cc++) b.box(0.15, 0.06, 0.3, gb, -1.15 + cc * 0.16 + rr * 0.08, 0.06 * rr, 0.9);
    starMotes(b, 12, 1.5, 1.0, 3.6, "#ffc070", 0.12);
  }
  function cgBarracks(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.6, 1.1, 2.4, 2.0);
    var G = new T3.Group(); G.position.set(-0.45, 0, -0.45); G.rotation.y = PI / 4; b.g.add(G);
    var obs = OBS(), bas = M("basalt", 2, 1), gold = WGOLD(), iron = M("iron");
    inGroup(b, G, function () {
      b.box(4.0, 0.14, 2.0, M("basalt", 3.5, 2), 0, 0, -0.2); magmaMoat(b, 0, -0.2, 2.05, 0.15);
      [-1, 1].forEach(function (s) {
        b.box(1.15, 1.35, 1.1, obs, s * 1.2, 0.14, -0.45); b.box(1.19, 0.06, 1.14, gold, s * 1.2, 1.49, -0.45);
        for (var q = -3; q <= 3; q++) b.add(new T3.ConeGeometry(0.035, 0.18, 4), iron, s * 1.2 + q * 0.15, 1.64, 0.1);
        dFrustum(b, s * 1.75, 0.14, -0.75, 0.32, 0.22, 2.3, obs); dFrustum(b, s * 1.75, 1.4, -0.75, 0.3, 0.29, 0.05, gold);
        var W = new T3.Group(); W.position.set(s * 1.75, 2.35, -0.75); G.add(W);
        featherWing(b, W, s, 8, 0.45, 0.09); dFlame(b, s * 1.75, 2.45, -0.75, 0.45, 0.4);
      });
      b.box(1.25, 0.9, 0.9, obs, 0, 0.14, -0.4);
      forgeGate(b, 0, 0.14, 0.06, 0, 0.6, 0.62, 0);
      sunDisc(b, 0, 1.75, -0.4, 0, 1.25);
      b.add(new T3.TorusGeometry(0.78, 0.05, 6, 40, PI), gold, 0, 1.04, 0.05);
      lionStatue(b, -0.75, 0.75, 0.14, 0, 0.95); lionStatue(b, 0.75, 0.75, 0.14, 0, 0.95);
      haloG(b, 0, 2.85, -0.4, 0.45);
    });
    b.target(1.45, 1.55, 0.5); b.target(1.85, 1.0, 0.7); b.dummy(-1.45, 1.55, 0.3);
    starMotes(b, 14, 2.2, 1.5, 4.0, "#ffc070", 0.12);
  }
  function cgTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var obs = OBS(), lava = lavaM(1.7), gold = WGOLD();
    dFrustum(b, 0, 0, 0, 1.15, 1.1, 0.16, M("basalt", 2, 0.2)); magmaMoat(b, 0, 0, 0.98, 0.17);
    var Y = stepped(b, 0, 0, [[0.75, 0.6, 0.4]], 0.16), H = 2.5;
    dFrustum(b, 0, Y, 0, 0.42, 0.26, H, obs); edgeLava(b, 0, 0, Y, 0.42, 0.26, H, lava);
    [0.3, 0.6, 0.9].forEach(function (f) { var r = 0.42 - 0.16 * f + 0.02; dFrustum(b, 0, Y + H * f, 0, r, r - 0.01, 0.05, gold); });
    var TY = Y + H;
    dFrustum(b, 0, TY, 0, 0.26, 0.45, 0.25, obs); dFrustum(b, 0, TY + 0.25, 0, 0.46, 0.45, 0.05, gold);
    var SY = TY + 0.85;
    sunOrb(b, 0, SY, 0, 0.3);
    var fan = new T3.Group(); fan.position.y = SY; b.g.add(fan);
    for (var i = 0; i < 8; i++) { var a = i / 8 * 2 * PI, fg = new T3.Group(); fg.rotation.y = a; fan.add(fg); b.add(new T3.BoxGeometry(0.04, 0.5, 0.18), gold, 0.62, 0, 0, { parent: fg, rz: 0.4 }); }
    var beamM = new T3.MeshBasicMaterial({ color: lin("#ffb840"), transparent: true, opacity: 0.16, depthWrite: false, side: T3.DoubleSide, blending: T3.AdditiveBlending });
    var bm = new T3.Group(); bm.position.y = SY; b.g.add(bm);
    b.add(new T3.ConeGeometry(0.42, 3.0, 16, 1, true), beamM, 1.5, -0.18, 0, { parent: bm, rz: PI / 2 + 0.12, noCast: true });
    b.fx.push(function (t, dt) { fan.rotation.y += dt * 0.8; bm.rotation.y = t * 0.5; });
    forgeGate(b, 0, 0.16, 0.75 * 0.707 + 0.02, 0, 0.3, 0.42, 0.6);
    obelisk(b, -1.1, 1.0, 1.2, 0);
    starMotes(b, 10, 1.4, 1.5, 4.6, "#ffc070", 0.12);
  }
  function cgPen(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var gold = WGOLD(), obs = OBS(), lava = lavaM(1.6);
    b.add(new T3.CylinderGeometry(1.95, 2.0, 0.14, 24), M("basalt", 3, 0.2), 0, 0.07, 0);
    b.add(new T3.CylinderGeometry(1.75, 1.75, 0.02, 40), C("#c8a060", { emissive: lin("#5a3a10"), emissiveIntensity: 0.2 }), 0, 0.15, 0);
    for (var r = 0; r < 12; r++) { var a = r / 12 * 2 * PI; b.add(new T3.BoxGeometry(0.04, 0.02, 1.2), glowMat("#ffe0a0", "#ff9020", 1.3), Math.sin(a) * 1.05, 0.16, Math.cos(a) * 1.05, { ry: a, noCast: true }); }
    var Y = 0.14;
    [[0.75, 0.7, 0.3], [0.58, 0.52, 0.3], [0.42, 0.38, 0.3]].forEach(function (q) { b.add(new T3.CylinderGeometry(q[1], q[0], q[2], 12), obs, 0, Y + q[2] / 2, 0); b.add(new T3.CylinderGeometry(q[1] + 0.01, q[1] + 0.01, 0.03, 12, 1, true), gold, 0, Y + q[2], 0); Y += q[2]; });
    b.lift(Y, function () { this.lion(0, 0.05, 1.1, PI / 4); });
    sunDisc(b, -0.45, Y + 1.05, -0.45, PI / 4, 1.45);
    [0, PI / 2, PI, 3 * PI / 2].forEach(function (a) { var g = new T3.Group(); g.position.set(0, 0.15, 0); g.rotation.y = a + PI / 4; b.g.add(g); b.add(new T3.TorusGeometry(0.42, 0.05, 6, 24, PI), lavaM(1.8), 1.62, 0, 0, { parent: g, ry: PI / 2, noCast: true }); });
    var LY = Y + 2.5; constellPts(b, [[-1.1, LY, 0.5], [-0.6, LY + 0.3, 0.3], [-0.1, LY + 0.35, 0.0], [0.35, LY + 0.1, -0.3], [0.9, LY + 0.2, -0.55], [0.35, LY + 0.1, -0.3], [0.25, LY - 0.35, -0.1], [-0.6, LY - 0.3, 0.45], [-0.6, LY + 0.3, 0.3]], "#ffc060");
    var gp = onRing(1.95, PI / 4);
    b.banner(gp[0] + 0.3, gp[1] - 0.35, 0.14, "bannerFire", 1.5); b.banner(gp[0] - 0.35, gp[1] + 0.3, 0.14, "bannerFire", 1.5);
    starMotes(b, 16, 2.2, 1.0, 4.6, "#ffc070", 0.12);
  }
  function cgSanctum(b) {
    b.slab(4.2, "grassFire", "sideFire");
    magmaMoat(b, 0, 0, 2.0, 0.02);
    var Y = stepped(b, 0, 0, [[2.55, 2.35, 0.32], [2.1, 1.9, 0.32], [1.68, 1.48, 0.32], [1.28, 1.08, 0.32]], 0);
    for (var s = 0; s < 9; s++) b.box(0.8, 0.14 * (s + 1), 0.16, M("basalt", 0.7, 0.2), 0, 0, 1.85 - s * 0.11);
    b.box(0.3, 0.02, 1.4, lavaM(2.0), 0, 0.02 + 0.0, 1.2, { noCast: true });
    var gold = WGOLD(), obs = OBS();
    [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]].forEach(function (q) { dFrustum(b, q[0], Y, q[1], 0.11, 0.09, 0.9, obs); });
    dFrustum(b, 0, Y + 0.9, 0, 0.66, 0.62, 0.1, gold); dFrustum(b, 0, Y + 1.0, 0, 0.64, 0.05, 0.42, gold);
    fireCrown(b, 0, Y, 0, 0.7);
    sunOrb(b, 0, Y + 2.35, 0, 0.6);
    haloG(b, 0, Y + 3.3, 0, 0.5);
    [[-1.95, -1.95], [1.95, -1.95], [-1.95, 1.95], [1.95, 1.95]].forEach(function (p, i) {
      obelisk(b, p[0], p[1], i < 2 ? 2.3 : 1.6, 0);
      var P = new T3.Group(); P.position.set(p[0], (i < 2 ? 2.3 : 1.6) + 0.35, p[1]); P.rotation.y = PI / 4; P.scale.setScalar(0.65); b.g.add(P);
      b.add(new T3.SphereGeometry(0.17, 12, 10), dGlow("#ffd080", "#ff6a10", 1.8), 0, 0.1, 0, { parent: P, s: [0.85, 1.5, 0.85], noCast: true });
      [1, -1].forEach(function (s2) { var w = featherWing(b, P, s2, 6, 0.4, 0.08); w.position.set(s2 * 0.1, 0.2, 0); });
    });
    lionStatue(b, -0.6, 1.95, 0.0, 0, 0.6); lionStatue(b, 0.6, 1.95, 0.0, 0, 0.6);
    starMotes(b, 22, 2.4, 1.0, 5.6, "#ffc070", 0.13);
  }
  function cgWorkshop(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.4, 1.0, 2.6, 2.2);
    var obs = OBS(), gold = WGOLD(), lava = lavaM(1.8);
    var RX = -0.85, RZ = -0.85, RY = 2.05, R = 1.05;
    dFrustum(b, RX, 0, RZ, 1.35, 1.3, 0.16, M("basalt", 2, 0.2));
    [-1, 1].forEach(function (s) { var x = RX + s * R * Math.SQRT1_2, z = RZ - s * R * Math.SQRT1_2; dFrustum(b, x, 0.16, z, 0.22, 0.16, RY - 0.16, obs); });
    var ring = new T3.Group(); ring.position.set(RX, RY, RZ); ring.rotation.y = PI / 4; b.g.add(ring);
    b.add(new T3.TorusGeometry(R, 0.1, 8, 48), gold, 0, 0, 0, { parent: ring });
    for (var f = 0; f < 16; f++) { var a = f / 16 * 2 * PI; b.add(new T3.ConeGeometry(0.05, 0.25, 4), gold, Math.cos(a) * (R + 0.15), Math.sin(a) * (R + 0.15), 0, { parent: ring, rz: a - PI / 2 }); }
    b.add(new T3.CircleGeometry(R - 0.06, 40), new T3.MeshStandardMaterial({ color: lin("#fff4c8"), emissive: lin("#ffb830"), emissiveIntensity: 1.6, transparent: true, opacity: 0.8, side: T3.DoubleSide }), 0, 0, 0, { parent: ring, noCast: true });
    ring.add(new T3.PointLight("#ffc050", 1.6, 5, 2));
    var bm = new T3.MeshBasicMaterial({ color: lin("#ffc860"), transparent: true, opacity: 0.45, depthWrite: false, blending: T3.AdditiveBlending });
    var AX = 0.35, AZ = 0.35;
    b.beam([RX + 0.2, RY - 0.2, RZ + 0.2], [AX, 0.55, AZ], 0.1, bm);
    dFrustum(b, AX, 0, AZ, 0.35, 0.28, 0.4, M("basalt", 0.5, 0.4));
    b.add(new T3.SphereGeometry(0.16, 14, 10), dGlow("#fff4c0", "#ff8a10", 2.6), AX, 0.55, AZ, { noCast: true });
    var cn = new T3.Group(); cn.position.set(1.1, 0, -0.45); cn.rotation.y = PI / 4 + 0.4; cn.scale.setScalar(1.3); b.g.add(cn);
    [-0.32, 0.32].forEach(function (z) { b.add(new T3.CylinderGeometry(0.22, 0.22, 0.06, 16), C("#5a3a20"), -0.15, 0.22, z, { parent: cn, rx: PI / 2 }); b.add(new T3.TorusGeometry(0.22, 0.025, 6, 20), gold, -0.15, 0.22, z * 1.08, { parent: cn }); });
    b.add(new T3.BoxGeometry(0.7, 0.14, 0.5), obs, -0.1, 0.3, 0, { parent: cn });
    var barrel = new T3.Group(); barrel.position.set(0, 0.45, 0); cn.add(barrel);
    b.add(new T3.CylinderGeometry(0.12, 0.17, 0.95, 16), gold, 0.35, 0.12, 0, { parent: barrel, rz: -PI / 2 + 0.35 });
    b.add(new T3.TorusGeometry(0.13, 0.03, 6, 18), gold, 0.79, 0.28, 0, { parent: barrel, ry: PI / 2, rx: 0.35 });
    b.add(new T3.CircleGeometry(0.11, 18), glowMat("#fff4c0", "#ffb020", 2.4), 0.8, 0.285, 0, { parent: barrel, ry: PI / 2, rx: 0.35, noCast: true });
    b.fx.push(function (t) { barrel.rotation.y = Math.sin(t * 0.5) * 0.3; });
    [[1.7, 0.5], [1.85, 0.7], [1.6, 0.75]].forEach(function (q) { b.add(new T3.SphereGeometry(0.11, 12, 10), dGlow("#ffd080", "#ff5a10", 1.6), q[0], 0.11, q[1], { noCast: true }); });
    lionStatue(b, -1.85, 1.55, 0, PI / 4, 0.6); b.banner(-0.15, 2.0, 0, "bannerFire", 1.5);
    starMotes(b, 14, 2.2, 0.8, 3.8, "#ffc070", 0.11);
  }

  /* ======================= SLYTHERIN ======================= */
  function csHouse(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var X = -0.15, Z = -0.15;
    megaRing(b, X, Z, 1.1, 0.16, 0, 12);
    b.add(new T3.CylinderGeometry(0.95, 0.95, 0.04, 28), petalM("#3f8a4c", "#1a5a2a", 0.25), X, 0.18, Z);
    var bud = bloom(b, X, 0.2, Z, 1.55, 8, 0.24, "#dff0d2", "#c4e2b8", false);
    b.add(new T3.CylinderGeometry(0.3, 0.38, 1.2, 14), C("#24402a", { emissive: lin("#1a6a3a"), emissiveIntensity: 0.5 }), X, 0.8, Z);
    var winM = glowMat("#d8ffe0", "#5aff9a", 1.6);
    [[PI / 4 - 0.6, 0.95], [PI / 4 + 0.6, 1.15], [PI / 4, 1.45]].forEach(function (q) { var r = 0.4 + (q[1] - 0.2) * 0.35; b.add(new T3.CircleGeometry(0.08, 12), winM, X + Math.sin(q[0]) * r, q[1], Z + Math.cos(q[0]) * r, { ry: q[0], noCast: true }); });
    archDoor(b, X + 0.46 * 0.707, Z + 0.46 * 0.707, PI / 4, 0.28, 0.36, 0.2);
    starBurst(b, X, 2.55, Z, 0.45, "#f4fff0", "#5aff9a");
    for (var v = 0; v < 5; v++) { var a = v / 5 * 2 * PI + 0.3, p = onRing(1.05, a); b.add(new T3.IcosahedronGeometry(0.13, 0), C("#2f6f3c", { flatShading: true }), X + p[0], 0.25, Z + p[1]); b.add(new T3.SphereGeometry(0.05, 8, 6), glowMat("#f4fff0", "#9affb8", 2.2), X + p[0], 0.42, Z + p[1], { noCast: true }); }
    constellation(b, 3.1, 1.2, 5, "#7cffa8", 0.2, 0.15);
    starMotes(b, 12, 1.5, 0.6, 3.6, "#c8ffd8", 0.11);
  }
  function csFarm(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var leaf = petalM("#2f6f3c", "#0a3018", 0.3);
    for (var k = 0; k < 8; k++) {
      var a = k / 8 * 2 * PI, g = new T3.Group(); g.rotation.y = -a; b.g.add(g);
      b.add(new T3.SphereGeometry(1, 16, 8), M("soil", 1, 1), 1.15, 0.0, 0, { parent: g, s: [0.75, 0.08, 0.3] });
      b.add(new T3.TorusGeometry(1, 0.03, 4, 24), RSTONE(), 1.15, 0.06, 0, { parent: g, rx: PI / 2, s: [0.75, 0.3, 1] });
      for (var f = 0; f < 4; f++) { var fx = 0.65 + f * 0.33; var fl = bloom(b, 0, 0, 0, 0.32, 5, 0.75, f % 2 ? "#f4f8e8" : "#d8f0d0", "#bfe8c4", true); g.add(fl); fl.position.set(fx, 0.08, (f % 2 ? 0.1 : -0.1)); }
    }
    var st = []; for (var s = 0; s <= 8; s++) { var t = s / 8; st.push(new T3.Vector3(Math.sin(t * 2) * 0.08, t * 1.5, Math.cos(t * 2) * 0.08 - 0.08)); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(st), 20, 0.11, 8, false), STARWOOD(1, 2), 0, 0, 0);
    [[0.6, 0.0], [1.0, PI]].forEach(function (q) { b.add(new T3.SphereGeometry(1, 12, 8), leaf, Math.cos(q[1]) * 0.35, q[0], Math.sin(q[1]) * 0.35, { s: [0.4, 0.05, 0.18], ry: q[1] }); });
    bloom(b, 0, 1.5, 0, 1.25, 8, 0.95, "#f6fbee", "#dff2d4", true);
    starMotes(b, 34, 1.9, 0.3, 3.2, "#e8ffd0", 0.09);
    trilithon(b, 1.6, 1.6, PI / 4, 1.0, 0.75);
    constellation(b, 3.4, 2.0, 7, "#7cffa8", 0.15, 0.1);
  }
  function csStore(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var X = -0.2, Z = -0.2, podM = petalM("#7fbf6a", "#1e5a2a", 0.3), inM = petalM("#e8f8d8", "#3aa860", 0.5);
    megaRing(b, X, Z, 1.2, 0.14, 0, 12);
    var podY = new T3.Group(); podY.position.set(X, 0.72, Z); podY.rotation.y = PI / 4; b.g.add(podY); var pod = new T3.Group(); pod.rotation.set(0.6, 0, 0.28); podY.add(pod);
    [-1, 1].forEach(function (s) { var h = new T3.Group(); h.position.y = -0.45; pod.add(h); var inner = new T3.Group(); inner.position.y = 0.45; h.add(inner); h.rotation.x = s * 0.48; var ps = s > 0 ? 0 : PI; b.add(new T3.SphereGeometry(1, 28, 14, ps, PI), podM, 0, 0, 0, { parent: inner, s: [1.25, 0.52, 0.4] }); b.add(new T3.SphereGeometry(0.97, 28, 14, ps, PI), inM, 0, 0, 0, { parent: inner, s: [1.23, 0.5, 0.38] }); b.add(new T3.TorusGeometry(1, 0.03, 4, 40, PI), C("#3f7a3a"), 0, 0, 0, { parent: inner, s: [1.25, 0.52, 0.4], rx: s > 0 ? PI / 2 : -PI / 2 }); });
    var sm = glowMat("#f4fff0", "#7cffa8", 2.0);
    for (var i = 0; i < 5; i++) b.add(new T3.SphereGeometry(0.19 - Math.abs(i - 2) * 0.02, 16, 12), sm, -0.72 + i * 0.36, 0.0, 0, { parent: pod, noCast: true });
    pod.add(new T3.PointLight("#7cffa8", 1.8, 3.5, 2));
    b.beam([X - 0.85, 0.15, Z + 0.85], [X - 0.55, 0.55, Z + 0.55], 0.06, STARWOOD(0.3, 0.5));
    var stem = []; for (var s2 = 0; s2 <= 10; s2++) { var t = s2 / 10; stem.push(new T3.Vector3(X - 0.9 + Math.sin(t * 2.5) * 0.25, t * 2.6, Z - 0.9 + t * 0.15)); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(stem), 30, 0.07, 8, false), STARWOOD(0.6, 2), 0, 0, 0);
    var tp = stem[10]; starBurst(b, tp.x, tp.y + 0.25, tp.z, 0.4, "#f4fff0", "#5aff9a");
    rootsAround(b, X, Z, 0.5, 1.3, 0.55, 6, PI / 4);
    b.lift(0.14, function () { this.gold(0.75, 0.85); this.sack(0.95, 0.6, 0, "#c9a86a"); });
    starMotes(b, 12, 1.5, 0.6, 3.4, "#c8ffd8", 0.11);
  }
  function csBarracks(b) {
    b.slab(4.2, "grassEarth", "sideEarth"); b.decal("path", 0.4, 1.3, 2.6, 1.5);
    var HX = -0.35, HZ = -0.75, L = 3.0, wood = STARWOOD(0.5, 2), leafA = petalM("#3f9a4c", "#0e4a20", 0.35), leafB = petalM("#2f7a3c", "#0e4a20", 0.35);
    b.box(L + 0.4, 0.2, 1.8, RSTONE(3, 0.3), HX, 0, HZ);
    for (var i = 0; i <= 5; i++) { var x = HX - L / 2 + i * L / 5; [-0.6, 0.6].forEach(function (dz) { b.cyl(0.07, 0.09, 1.2, 10, wood, x, 0.2, HZ + dz); }); }
    for (var r = 0; r < 7; r++) { var x2 = HX - L / 2 + 0.1 + r * (L - 0.2) / 6; [-1, 1].forEach(function (s) { b.add(new T3.SphereGeometry(1, 16, 10), (r + (s > 0 ? 1 : 0)) % 2 ? leafA : leafB, x2, 1.62, HZ + s * 0.42, { s: [0.32, 0.07, 0.62], rx: s * 0.6 }); }); }
    b.add(new T3.BoxGeometry(L - 0.2, 0.95, 0.9), C("#1c2a1c"), HX, 0.68, HZ);
    archDoor(b, HX, HZ + 0.46, 0, 0.45, 0.5, 0.2);
    var bud = []; for (var s2 = 0; s2 <= 8; s2++) { var t = s2 / 8; bud.push(new T3.Vector3(HX + L / 2 + 0.35 + Math.sin(t * 2) * 0.05, t * 2.2, HZ)); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(bud), 20, 0.1, 8, false), wood, 0, 0, 0);
    bloom(b, HX + L / 2 + 0.35, 2.15, HZ, 0.85, 6, 0.3, "#f0f8e4", "#d8f0d0", true);
    var thorn = C("#3a4a22", { flatShading: true });
    for (var t2 = 0; t2 < 22; t2++) { var ta = -0.2 + t2 / 21 * 1.9, tr = 2.5, xx = HX + Math.cos(ta) * tr, zz = HZ + Math.sin(ta) * tr; if (Math.abs(ta - 0.85) < 0.22) continue; var h = 0.45 + b.rand() * 0.25; b.add(new T3.ConeGeometry(0.07, h, 4), thorn, xx, h / 2, zz, { rz: Math.cos(ta) * 0.35, rx: -Math.sin(ta) * 0.35 }); if (t2 % 3 === 0) b.add(new T3.SphereGeometry(0.06, 8, 6), glowMat("#f4fff0", "#9affb8", 2.0), xx, h + 0.04, zz, { noCast: true }); }
    b.banner(HX - 0.9, HZ + 1.25, 0, "bannerEarth", 1.5); b.banner(HX + 0.9, HZ + 1.25, 0, "bannerEarth", 1.5);
    b.target(0.95, 1.45, 0.4); b.target(1.45, 0.85, 0.6);
    constellation(b, 3.3, 2.2, 7, "#7cffa8", 0.15, 0.1);
    starMotes(b, 14, 2.2, 0.8, 3.6, "#c8ffd8", 0.1);
  }
  function csTower(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    megaRing(b, 0, 0, 0.85, 0.16, 0, 10);
    var wood = STARWOOD(0.6, 4), H = 3.5, pts = [];
    for (var s = 0; s <= 20; s++) { var t = s / 20; pts.push(new T3.Vector3(Math.sin(t * 5) * 0.12 * (1 - t), 0.15 + t * H, Math.cos(t * 5) * 0.12 * (1 - t))); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 50, 0.16, 10, false), wood, 0, 0, 0);
    rootsAround(b, 0, 0, 0.2, 0.9, 0.45, 6, PI / 4);
    archDoor(b, 0.17, 0.17, PI / 4, 0.18, 0.26, 0.16);
    var leaf = petalM("#3f9a4c", "#0e4a20", 0.35);
    [[0.9, 0.4], [1.5, 2.6], [2.1, 4.6], [2.7, 0.9]].forEach(function (q) { var g = new T3.Group(); g.position.y = q[0]; g.rotation.y = q[1]; b.g.add(g); b.add(new T3.SphereGeometry(1, 12, 8), leaf, 0.42, 0.05, 0, { parent: g, s: [0.4, 0.05, 0.16], rz: 0.35 }); });
    var TY = 0.15 + H;
    bloom(b, 0, TY - 0.1, 0, 1.0, 8, 1.0, "#f6fbee", "#dff2d4", true);
    b.add(new T3.CylinderGeometry(0.4, 0.3, 0.06, 12), M("plankWarm", 1, 1), 0, TY + 0.05, 0);
    starBurst(b, 0, TY + 1.05, 0, 0.55, "#f4fff0", "#5aff9a");
    var hg = new T3.Group(); b.g.add(hg); var hl = []; for (var k = 0; k <= 8; k++) { var a = k * 0.9, r = 0.75; hl.push([Math.cos(a) * r, 0.6 + k * 0.33, Math.sin(a) * r]); }
    constellPts(b, hl, "#7cffa8", hg); b.fx.push(function (t, dt) { hg.rotation.y += dt * 0.3; });
    b.mushrooms([[-1.1, 0.95], [-0.95, 1.1]], capGlow());
  }
  function csPen(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var X = -0.1, Z = -0.1;
    var pm = new T3.MeshStandardMaterial({ map: tex("water", 2, 2), transparent: true, opacity: 0.85, roughness: 0.1, emissive: lin("#0e4a3a"), emissiveIntensity: 0.4 });
    b.add(new T3.CylinderGeometry(1.95, 1.95, 0.08, 40), pm, X, 0.04, Z, { noCast: true });
    b.add(new T3.TorusGeometry(1.98, 0.07, 6, 48), RSTONE(), X, 0.08, Z, { rx: PI / 2 });
    bloom(b, X, 0.08, Z, 1.6, 10, 1.25, "#f0f8e8", "#d4ecc8", false);
    bloom(b, X, 0.1, Z, 1.15, 8, 0.85, "#f8fcf0", "#e4f4dc", false);
    b.add(new T3.CylinderGeometry(0.75, 0.6, 0.18, 20), petalM("#c8e090", "#5a8a20", 0.5), X, 0.1, Z);
    b.lift(0.28, function () { this.serpent(X, Z, 1.15, -0.6); });
    var L = new T3.PointLight("#9affb8", 1.4, 5, 2); L.position.set(X, 1.2, Z); b.g.add(L);
    for (var p = 0; p < 6; p++) { var a = p / 6 * 2 * PI + 0.4, q = onRing(1.7, a); b.add(new T3.CylinderGeometry(0.3, 0.3, 0.02, 16), petalM("#2f7a3c", "#0a3018", 0.3), X + q[0], 0.09, Z + q[1]); }
    var SY = 3.4; constellPts(b, [[-1.2, SY, 0.6], [-0.8, SY + 0.35, 0.3], [-0.35, SY + 0.05, 0.25], [0.05, SY + 0.4, -0.05], [0.5, SY + 0.1, -0.2], [0.95, SY + 0.45, -0.5], [1.2, SY + 0.3, -0.75]], "#7cffa8");
    starMotes(b, 18, 2.0, 0.6, 4.0, "#c8ffd8", 0.11);
    b.banner(1.95, -0.9, 0, "bannerEarth", 1.5);
  }
  function csSanctum(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var st = RSTONE(2, 1);
    b.add(new T3.RingGeometry(1.95, 2.03, 64), runeG(1.4), 0, 0.015, 0, { rx: -PI / 2, noCast: true });
    for (var k = 0; k < 6; k++) { var a = k / 6 * 2 * PI + PI / 6, p = onRing(1.85, a); trilithon(b, p[0], p[1], a + PI / 2, 1.1, 0.6); }
    megaRing(b, 0, 0, 0.9, 0.3, 0, 12);
    var wood = STARWOOD(0.8, 3);
    for (var s = 0; s < 3; s++) { var pts = []; for (var i = 0; i <= 14; i++) { var t = i / 14, a2 = s * 2 * PI / 3 + t * PI * 1.4, r = 0.45 * (1 - t) + 0.12; pts.push(new T3.Vector3(Math.cos(a2) * r, 0.3 + t * 2.2, Math.sin(a2) * r)); } b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 40, 0.12, 8, false), wood, 0, 0, 0); }
    var BY0 = 2.45;
    bloom(b, 0, BY0, 0, 1.55, 10, 0.55, "#f6fbee", "#dff2d4", false);
    bloom(b, 0, BY0 + 0.05, 0, 1.1, 7, 0.3, "#fbfff4", "#e8f6e0", false);
    crystals(b, 0, BY0 + 0.15, 0, 1.0, 7, 1.1);
    var beam = new T3.MeshBasicMaterial({ color: lin("#9affc0"), transparent: true, opacity: 0.16, depthWrite: false });
    b.add(new T3.CylinderGeometry(0.12, 0.35, 2.4, 16, 1, true), beam, 0, BY0 + 2.6, 0, { noCast: true });
    orbitStones(b, 0, BY0 + 0.6, 0, 1.85, 6, 0.9);
    constellation(b, BY0 + 2.2, 2.4, 9, "#7cffa8", 0.15, -0.08);
    starMotes(b, 26, 2.4, 0.6, 5.6, "#c8ffd8", 0.12);
  }
  function csWorkshop(b) {
    b.slab(4.2, "grassEarth", "sideEarth"); b.decal("path", 0.4, 1.0, 2.6, 2.2);
    var st = RSTONE(), wood = STARWOOD(0.6, 4);
    var FX = -0.95, FZ = -0.95;
    megaRing(b, FX, FZ, 1.0, 0.2, 0, 12);
    var fire = glowMat("#e8ffe0", "#5aff9a", 2.0);
    b.add(new T3.CylinderGeometry(0.45, 0.5, 0.2, 10), st, FX, 0.3, FZ);
    var fl = []; for (var f = 0; f < 5; f++) { var fp = onRing(0.18, f * 1.3); fl.push([b.add(new T3.ConeGeometry(0.08, 0.45, 6), fire, FX + fp[0], 0.62, FZ + fp[1], { noCast: true }), f]); }
    b.fx.push(function (t) { fl.forEach(function (q) { q[0].scale.set(1, 0.8 + Math.sin(t * 7 + q[1] * 2) * 0.25, 1); }); });
    bloom(b, FX, 0.2, FZ, 1.35, 8, 1.05, "#e8f4dc", "#cfe8c4", false);
    var L = new T3.PointLight("#5aff9a", 1.6, 4, 2); L.position.set(FX, 0.9, FZ); b.g.add(L);
    var TX = 0.7, TZ = 0.45, base = new T3.Group(); base.position.set(TX, 0, TZ); base.rotation.y = -PI / 4; b.g.add(base);
    inGroup(b, base, function () { slab4(b, 0, 0, -0.45, 0.75, 0.5, 0.5, 0, RSTONE()); slab4(b, 0, 0, 0.45, 0.75, 0.5, 0.5, 0, RSTONE()); b.box(0.9, 0.12, 1.4, RSTONE(0.9, 0.2), 0, 0, 0); });
    rootsAround(b, TX, TZ, 0.35, 1.0, 0.5, 6, PI / 4);
    var arm = new T3.Group(); arm.position.set(TX, 0.45, TZ); arm.rotation.y = -PI / 4; b.g.add(arm);
    var pts = []; for (var s = 0; s <= 14; s++) { var t = s / 14; pts.push(new T3.Vector3(0, t * 2.5, -Math.pow(t, 1.7) * 1.4)); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 40, 0.15, 8, false), wood, 0, 0, 0, { parent: arm });
    var top = pts[14], head = bloom(b, 0, 0, 0, 0.55, 7, 1.3, "#f6fbee", "#dff2d4", false);
    arm.add(head); head.position.set(top.x, top.y, top.z);
    b.add(new T3.SphereGeometry(0.24, 18, 14), glowMat("#f4fff0", "#7cffa8", 2.2), top.x, top.y + 0.15, top.z, { parent: arm, noCast: true });
    b.fx.push(function (t) { arm.rotation.x = Math.sin(t * 0.6) * 0.06; });
    [[1.6, -0.35], [1.75, -0.12], [1.48, -0.1]].forEach(function (q) { b.add(new T3.SphereGeometry(0.13, 12, 10), glowMat("#f4fff0", "#7cffa8", 1.6), q[0], 0.13, q[1], { noCast: true }); });
    b.banner(-0.1, 1.95, 0, "bannerEarth", 1.5);
    starMotes(b, 14, 2.2, 0.8, 3.6, "#c8ffd8", 0.1);
  }

  var CELB = {
    air: [chHouse, chFarm, chStore, chBarracks, chTower, chPen, chSanctum, chWorkshop],
    water: [cwHouse, cwFarm, cwStore, cwBarracks, cwTower, cwPen, cwSanctum, cwWorkshop],
    fire: [cgHouse, cgFarm, cgStore, cgBarracks, cgTower, cgPen, cgSanctum, cgWorkshop],
    earth: [csHouse, csFarm, csStore, csBarracks, csTower, csPen, csSanctum, csWorkshop]
  };
