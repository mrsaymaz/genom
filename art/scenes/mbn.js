
  /* ================= MYTHIC AGE BUILDINGS in the new design languages ================= */
  function hiveR(R, H, y0) { return function (y) { var t = (y - y0) / H; return R * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.5); }; }
  function bigHive(b, x, z, R, H, y0, opts) {
    opts = opts || {};
    dSkep(b, x, y0, z, R, H);
    var rOn = hiveR(R, H, y0), dark = C(BY.black);
    (opts.bands || [0.22, 0.55]).forEach(function (f, i) { var y = y0 + H * f; b.add(new T3.TorusGeometry(rOn(y) + 0.015, i === 1 ? 0.035 : 0.025, 6, 32), i === 1 ? glowMat("#ffd060", "#c88a10", 0.5) : dark, x, y, z, { rx: PI / 2 }); });
    (opts.wins || []).forEach(function (w) { var y = y0 + H * w[1], r = rOn(y) + 0.015; hexLamp(b, x + Math.cos(w[0]) * r, y, z + Math.sin(w[0]) * r, Math.cos(w[0]), Math.sin(w[0]), w[2] || 1); });
    if (opts.door) { var dy = y0, dr = rOn(y0 + 0.2) - 0.02; hiveDoor(b, x + Math.cos(PI / 4) * dr, dy, z + Math.sin(PI / 4) * dr, PI / 4, opts.door[0], opts.door[1], 0.5); }
    if (opts.cupola) { var cy = y0 + H - 0.08; dSkep(b, x, cy, z, opts.cupola, opts.cupola * 1.6); b.cyl(0.015, 0.015, 0.3, 5, dark, x, cy + opts.cupola * 1.55, z); windRose(b, x + 0.02, cy + opts.cupola * 1.55 + 0.32, z + 0.02, opts.rose || 0.7); }
    return rOn;
  }
  function amberFloat(b, x, y, z, s) {
    var g = new T3.Group(); b.g.add(g);
    var amber = glowMat("#ffd27a", "#ffa420", 1.3);
    b.add(new T3.CylinderGeometry(0.1 * s, 0.1 * s, 0.22 * s, 6), amber, 0, 0, 0, { parent: g, noCast: true });
    b.add(new T3.ConeGeometry(0.1 * s, 0.13 * s, 6), amber, 0, 0.175 * s, 0, { parent: g, noCast: true });
    b.add(new T3.ConeGeometry(0.1 * s, 0.13 * s, 6), amber, 0, -0.175 * s, 0, { parent: g, rx: PI, noCast: true });
    var L = new T3.PointLight("#ffb030", 0.6 * s, 2.5, 2); g.add(L);
    var ph = b.rand() * 6; b.fx.push(function (t) { g.position.set(x, y + Math.sin(t * 1.3 + ph) * 0.07, z); g.rotation.y = t * 0.7; });
  }
  function hexStep(b, r, h, y0, x, z) {
    var hc = M("honeycomb", r * 1.5, r * 1.5), hcS = M("honeycomb", r * 3, 0.4);
    b.add(new T3.CylinderGeometry(r, r + 0.05, h, 6), [hcS, hc, hc], x || 0, y0 + h / 2, z || 0, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(r + 0.015, r + 0.015, 0.03, 6, 1, true), C(BY.black), x || 0, y0 + h - 0.01, z || 0, { ry: PI / 6 });
  }

  /* ---------------- Hufflepuff Mythic ---------------- */
  function hAirHouse(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.45, 1.2, 0.8, 1.0, -0.3);
    hexStep(b, 1.15, 0.12, 0, -0.15, -0.15); hexStep(b, 0.95, 0.12, 0.12, -0.15, -0.15);
    bigHive(b, -0.15, -0.15, 0.78, 1.35, 0.24, { door: [0.3, 0.22], cupola: 0.24, rose: 0.6, wins: [[PI / 4 - 0.9, 0.42], [PI / 4 + 0.9, 0.42], [PI / 4, 0.68, 0.8]] });
    b.add(new T3.BoxGeometry(0.62, 0.035, 0.3), M("canvasBY", 0.7, 0.4), -0.15 + 0.75 * 0.707, 0.82, -0.15 + 0.75 * 0.707, { ry: PI / 4, rx: 0.4 });
    for (var s = 0; s < 2; s++) b.box(0.5, 0.24 - s * 0.12, 0.18, M("honeycomb", 0.5, 0.3), 0.72 + s * 0.13, 0, 0.72 + s * 0.13, { ry: PI / 4 });
    amberFloat(b, 0.75, 1.75, -0.85, 0.9);
    honeyJars(b, [[-1.1, 0.95], [-0.9, 1.1], [-1.15, 1.2]]); b.hay(1.1, -1.0, 0.4);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 0.95 + b.rand() * 0.5, "#5a9238");
  }
  function hAirFarm(b) {
    b.slab(4.2, "grassAir", "sideAir");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.15, 0, 0.15);
    b.wheat(-1.2, -1.2, 1.5, 1.5, 8, 9, ["#d9b84a", "#c8a83e", "#e6cc6a", "#b8a03a"]);
    var hc = M("honeycomb", 3, 0.3);
    [[0.15, 1.75, 3.3, 0.16], [1.75, 0.15, 0.16, 3.3]].forEach(function (w) { b.box(w[2], 0.32, w[3], hc, w[0], 0, w[1]); });
    b.box(3.3, 0.04, 0.17, C(BY.black), 0.15, 0.32, 1.75); b.box(0.17, 0.04, 3.3, C(BY.black), 1.75, 0.32, 0.15);
    var TX = -1.55, TZ = -1.55;
    hexStep(b, 0.6, 0.18, 0, TX, TZ);
    b.cyl(0.32, 0.4, 1.3, 6, M("honeycomb", 1.5, 1.4), TX, 0.18, TZ, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.45, 0.45, 0.06, 6), C(BY.black), TX, 1.5, TZ, { ry: PI / 6 });
    dSkep(b, TX, 1.53, TZ, 0.36, 0.6);
    windRose(b, TX + 0.25, 1.75, TZ + 0.25, 2.2);
    [[-1.65, 0.9], [-1.65, 0.3], [-1.65, -0.3]].forEach(function (q) { b.cyl(0.03, 0.03, 0.35, 5, M("plankDark", 0.3, 0.5), q[0], 0, q[1]); b.cyl(0.2, 0.2, 0.04, 6, M("honeycomb", 0.4, 0.4), q[0], 0.35, q[1]); dSkep(b, q[0], 0.39, q[1], 0.16, 0.34); });
    var pole = [1.95, 2.6, -1.95];
    b.cyl(0.035, 0.05, 2.6, 8, M("plankDark", 0.3, 2), pole[0], 0, pole[2]);
    kite(b, pole[0], pole[1], pole[2], 0, 3.4);
    amberFloat(b, 0.15, 1.6, 0.15, 1.0);
    honeyJars(b, [[-1.85, 1.85], [-1.6, 1.95]]);
  }
  function hAirStore(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.45, 1.1, 1.0, 1.0, -0.3);
    var CX = -0.2, CZ = -0.2, post = M("plankDark", 0.3, 1);
    hexStep(b, 1.2, 0.14, 0, CX, CZ); hexStep(b, 1.02, 0.12, 0.14, CX, CZ);
    for (var k = 0; k < 6; k++) { var p = dRing(0.92, k * PI / 3 + PI / 6); b.cyl(0.05, 0.055, 1.05, 6, post, CX + p[0], 0.26, CZ + p[1]); b.cyl(0.065, 0.065, 0.05, 6, C(BY.black), CX + p[0], 0.75, CZ + p[1]); }
    b.add(new T3.ConeGeometry(1.2, 0.55, 6, 1, true), M("canvasBY", 3, 1, { side: T3.DoubleSide }), CX, 1.31 + 0.275, CZ, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.42, 0.42, 0.28, 6), M("canvasBY", 1, 0.5), CX, 1.72, CZ, { ry: PI / 6 });
    b.add(new T3.ConeGeometry(0.62, 0.5, 6, 1, true), M("canvasBY", 2, 1, { side: T3.DoubleSide }), CX, 1.86 + 0.25, CZ, { ry: PI / 6 });
    windRose(b, CX + 0.03, 2.5, CZ + 0.03, 0.7);
    b.lift(0.26, function () { this.logs(CX - 0.3, CZ - 0.2, PI / 2); this.crate(CX + 0.35, CZ - 0.4, 0.26, 0.2); this.sack(CX + 0.1, CZ + 0.4, 0, "#c9a86a"); this.gold(CX - 0.25, CZ + 0.35); });
    honeyJars(b, [[CX + 0.35, CZ + 0.15]]);
    var MX = 1.15, MZ = 0.55;
    b.cyl(0.05, 0.07, 2.2, 8, post, MX, 0, MZ);
    bySail(b, MX, 2.1, MZ, PI / 4, 1.1);
    b.beam([MX, 1.6, MZ], [MX + 0.4, 1.8, MZ + 0.4], 0.03, post);
    var pv = new T3.Group(); pv.position.set(MX + 0.4, 1.8, MZ + 0.4); b.g.add(pv);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.8, 4), C("#d8cba6"), 0, -0.4, 0, { parent: pv });
    b.add(new T3.BoxGeometry(0.2, 0.2, 0.2), M("plankWarm", 0.3, 0.3), 0, -0.9, 0, { parent: pv });
    b.fx.push(function (t) { pv.rotation.z = Math.sin(t * 1.2) * 0.08; });
    amberFloat(b, -1.15, 1.4, 0.9, 0.8);
  }
  function hAirBarracks(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.4, 1.35, 2.6, 1.4);
    var HX = -0.35, HZ = -0.65, dark = C(BY.black);
    b.box(3.1, 0.14, 1.8, M("honeycomb", 3, 1.8), HX, 0, HZ); b.box(3.12, 0.03, 1.82, dark, HX, 0.13, HZ);
    var sk = M("skep", 4, 3), skE = M("skep", 3, 2);
    b.add(new T3.CylinderGeometry(0.72, 0.72, 2.0, 22, 1, true, 0, PI), sk, HX, 0.14, HZ, { rz: PI / 2 });
    [-1, 1].forEach(function (s2) { b.add(new T3.SphereGeometry(0.72, 22, 10, 0, PI, 0, PI / 2), skE, HX + s2 * 1.0, 0.14, HZ, { ry: s2 * PI / 2 }); });
    for (var a2 = 0; a2 < 6; a2++) { var x2 = HX - 0.85 + a2 * 0.34; b.add(new T3.TorusGeometry(0.735, a2 === 2 || a2 === 3 ? 0.035 : 0.022, 5, 20, PI), a2 === 2 || a2 === 3 ? glowMat("#ffd060", "#c88a10", 0.5) : dark, x2, 0.14, HZ, { ry: PI / 2 }); }
    bigHive(b, HX, HZ, 0.62, 1.15, 0.62, { bands: [0.3], cupola: 0.2, rose: 0.6, wins: [[PI / 2 - 0.5, 0.35], [PI / 2 + 0.5, 0.35]] });
    hiveDoor(b, HX, 0.14, HZ + 0.71, 0, 0.42, 0.3, 0.45);
    [-0.7, 0.7].forEach(function (dx) { hexLamp(b, HX + dx, 0.48, HZ + 0.6, 0, 1); });
    b.add(new T3.BoxGeometry(1.6, 0.035, 0.42), M("canvasBY", 1.6, 0.5), HX, 0.86, HZ + 0.88, { rx: 0.45 });
    [[1.85, -1.55], [-1.95, -1.6]].forEach(function (m, i) { b.cyl(0.04, 0.055, 2.5, 8, M("plankDark", 0.3, 2), m[0], 0, m[1]); bySail(b, m[0], 2.4, m[1], PI / 4, 1.35); dPennant(b, m[0], 2.5, m[1], i ? BY.yellow : BY.black); });
    b.banner(HX - 0.95, HZ + 1.25, 0, "bannerAir", 1.5); b.banner(HX + 0.95, HZ + 1.25, 0, "bannerAir", 1.5);
    b.target(1.3, 1.45, 0.5); b.target(1.8, 0.95, 0.7); b.dummy(-1.5, 1.4, 0.3);
    honeyJars(b, [[-1.95, 0.75], [-1.8, 0.9]]);
  }
  function hAirTower(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var post = M("plankDark", 0.4, 3), rope = C("#d8cba6");
    hexStep(b, 0.75, 0.16, 0); hexStep(b, 0.55, 0.12, 0.16);
    b.cyl(0.09, 0.13, 3.5, 8, post, 0, 0.28, 0);
    [[1.3, 0.25], [-0.25, 1.3], [0.25, -1.3], [-1.3, -0.25]].forEach(function (g) { b.beam([0, 3.2, 0], [g[0], 0, g[1]], 0.01, rope); b.cyl(0.03, 0.04, 0.15, 5, post, g[0], 0, g[1]); });
    [[1.7, 0.42, 0.32], [2.75, 0.55, 0.4]].forEach(function (n, i) {
      var NY = n[0];
      b.add(new T3.CylinderGeometry(n[1], n[1] * 0.78, n[2], 6, 1, true), M("wattle", 3, 0.6, { side: T3.DoubleSide }), 0, NY + n[2] / 2, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(n[1] * 0.78, n[1] * 0.78, 0.05, 6), M("plankWarm", 0.8, 0.8), 0, NY + 0.02, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(n[1] + 0.02, n[1] + 0.02, 0.04, 6, 1, true), i ? glowMat("#ffd060", "#c88a10", 0.5) : C(BY.black), 0, NY + n[2], 0, { ry: PI / 6 });
    });
    for (var k = 0; k < 3; k++) { var p = dRing(0.5, k * 2 * PI / 3 + 0.4); b.beam([p[0], 3.3, p[1]], [0, 3.85, 0], 0.015, post); }
    b.add(new T3.ConeGeometry(0.7, 0.48, 6, 1, true), M("canvasBY", 2, 0.6, { side: T3.DoubleSide }), 0, 3.8, 0, { ry: PI / 6 });
    windRose(b, 0.03, 4.2, 0.03, 0.75);
    kite(b, 0, 3.95, 0, 1, 4.6);
    for (var r = 0; r < 12; r++) { var t = r / 12, y = 0.4 + t * 2.3, o = 0.38 - t * 0.12; b.beam([o + 0.07, y, o - 0.07], [o - 0.07, y, o + 0.07], 0.012, M("plankWarm", 0.2, 0.2)); }
    [-0.1, 0.1].forEach(function (dx) { b.beam([0.38 + dx * 0.7, 0.3, 0.38 - dx * 0.7], [0.26 + dx * 0.7, 2.7, 0.26 - dx * 0.7], 0.012, rope); });
    amberFloat(b, 0.0, 2.35, 0.0, 0.7);
    b.hay(1.1, -1.0, 0.3);
  }
  function hAirPen(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.6, 1.25, 2.2, 1.6, -0.3);
    hexStep(b, 1.65, 0.12, 0, -0.55, -0.55);
    var R = 1.35, H = 1.35, x = -0.55, z = -0.55;
    dSkep(b, x, 0.12, z, R, H);
    var rOn = hiveR(R, H, 0.12), dark = C(BY.black);
    [0.3, 0.6].forEach(function (f, i) { var y = 0.12 + H * f; b.add(new T3.TorusGeometry(rOn(y) + 0.015, 0.03, 6, 36), i ? glowMat("#ffd060", "#c88a10", 0.5) : dark, x, y, z, { rx: PI / 2 }); });
    var dr = rOn(0.5) - 0.05;
    hiveDoor(b, x + Math.cos(PI / 4) * dr, 0.12, z + Math.sin(PI / 4) * dr, PI / 4, 0.75, 0.42, 0.3);
    b.add(new T3.BoxGeometry(1.2, 0.04, 0.5), M("canvasBY", 1.2, 0.5), x + Math.cos(PI / 4) * (dr + 0.15), 1.12, z + Math.sin(PI / 4) * (dr + 0.15), { ry: PI / 4, rx: 0.45 });
    [[PI / 4 - 0.9, 0.55], [PI / 4 + 0.9, 0.55]].forEach(function (w) { var y = 0.12 + H * w[1], r = rOn(y) + 0.015; hexLamp(b, x + Math.cos(w[0]) * r, y, z + Math.sin(w[0]) * r, Math.cos(w[0]), Math.sin(w[0])); });
    b.cyl(0.015, 0.015, 0.4, 5, dark, x, 0.12 + H - 0.05, z); windRose(b, x + 0.02, 0.12 + H + 0.38, z + 0.02, 0.9);
    b.bear(0.95, 0.95, 0.7, -0.5);
    var hc = M("honeycomb", 0.2, 0.4);
    [[2.0, -1.0], [2.0, 0.3], [2.0, 1.6], [0.3, 2.0], [-1.0, 2.0]].forEach(function (p) { b.cyl(0.07, 0.08, 0.5, 6, hc, p[0], 0, p[1]); b.cyl(0.085, 0.085, 0.04, 6, dark, p[0], 0.5, p[1]); });
    honeyJars(b, [[-1.85, 1.6], [-1.65, 1.75], [-1.9, 1.85]]);
    amberFloat(b, 1.6, 1.6, -1.5, 0.9);
    b.banner(-0.2, 2.05, 0, "bannerAir", 1.5);
  }
  function hAirSanctum(b) {
    b.slab(4.2, "grassAir", "sideAir");
    hexStep(b, 1.95, 0.14, 0); hexStep(b, 1.65, 0.14, 0.14); hexStep(b, 1.35, 0.12, 0.28);
    for (var s = 0; s < 3; s++) b.box(0.8, 0.14 * (s + 1), 0.22, M("honeycomb", 0.8, 0.3), (1.55 + (2 - s) * 0.18) * 0.707, 0, (1.55 + (2 - s) * 0.18) * 0.707, { ry: PI / 4 });
    var dark = C(BY.black), post = M("plankDark", 0.3, 2), Y = 0.4;
    for (var k = 0; k < 6; k++) {
      var p = dRing(1.15, k * PI / 3 + PI / 6);
      b.cyl(0.08, 0.09, 1.9, 6, post, p[0], Y, p[1]);
      [0.5, 1.2].forEach(function (yy, i) { b.cyl(0.1, 0.1, 0.07, 6, i ? glowMat("#ffd060", "#c88a10", 0.5) : dark, p[0], Y + yy, p[1]); });
    }
    b.add(new T3.TorusGeometry(1.18, 0.07, 6, 6), M("honeycomb", 3, 0.3), 0, Y + 1.9, 0, { rx: PI / 2, rz: PI / 6 });
    b.add(new T3.ConeGeometry(1.45, 0.75, 6, 1, true), M("canvasBY", 3, 1, { side: T3.DoubleSide }), 0, Y + 1.95 + 0.375, 0, { ry: PI / 6 });
    windRose(b, 0.03, Y + 2.85, 0.03, 0.9);
    var core = new T3.Group(); b.g.add(core);
    var amber = glowMat("#ffd27a", "#ffa420", 1.6);
    b.add(new T3.CylinderGeometry(0.26, 0.26, 0.55, 6), amber, 0, 0, 0, { parent: core, noCast: true });
    b.add(new T3.ConeGeometry(0.26, 0.32, 6), amber, 0, 0.43, 0, { parent: core, noCast: true });
    b.add(new T3.ConeGeometry(0.26, 0.32, 6), amber, 0, -0.43, 0, { parent: core, rx: PI, noCast: true });
    var L = new T3.PointLight("#ffb030", 1.8, 5, 2); core.add(L);
    var roses = new T3.Group(); core.add(roses);
    for (var r = 0; r < 4; r++) { var g = new T3.Group(); var q = dRing(0.62, r * PI / 2); g.position.set(q[0], 0, q[1]); roses.add(g); b.add(new T3.CylinderGeometry(0.07, 0.07, 0.14, 6), amber, 0, 0, 0, { parent: g, noCast: true }); }
    b.fx.push(function (t, dt) { core.position.set(0, Y + 1.0 + Math.sin(t * 1.2) * 0.08, 0); core.rotation.y = t * 0.5; roses.rotation.y -= dt * 1.2; L.intensity = 1.6 + Math.sin(t * 1.6) * 0.3; });
    [[-2.0, 1.1], [1.1, -2.0]].forEach(function (m, i) { b.cyl(0.04, 0.055, 2.6, 8, post, m[0], 0, m[1]); bySail(b, m[0], 2.5, m[1], PI / 4, 1.3); kite(b, m[0], 2.6, m[1], i + 3, 3.6 + i * 0.2); });
    b.banner(-1.4, 1.45, 0, "bannerAir", 1.6); b.banner(1.45, -1.4, 0, "bannerAir", 1.6);
  }

  /* ---------------- Ravenclaw Mythic ---------------- */
  function blueTerrace(b, x, z, r, h, y0) { b.add(new T3.CylinderGeometry(r, r + 0.06, h, 40), [M("stoneBlue", r * 2.5, 0.3), M("stoneBlue", r * 1.5, r * 1.5), M("stoneBlue", r, r)], x, y0 + h / 2, z); }
  function pearlTerrace(b, x, z, r, h, y0) { b.add(new T3.CylinderGeometry(r, r + 0.05, h, 40), [M("pearl", r * 2.5, 0.3, { color: lin("#f0e2da") }), M("pearl", r * 1.5, r * 1.5), M("pearl", r, r)], x, y0 + h / 2, z); }
  function bronzeRing(b, x, y, z, r, posts) {
    var bz = BRZ();
    b.add(new T3.CylinderGeometry(r, r - 0.1, 0.05, 32), M("pearl", 2, 0.2), x, y - 0.02, z);
    b.add(new T3.TorusGeometry(r, 0.025, 6, 40), bz, x, y + 0.2, z, { rx: PI / 2 });
    for (var k = 0; k < (posts || 12); k++) { var p = dRing(r, k / (posts || 12) * 2 * PI); b.cyl(0.01, 0.01, 0.2, 4, bz, x + p[0], y, z + p[1]); }
  }
  function waterArc(b, sx, sy, sz, ex, ey, ez, hgt, n) {
    var dm = new T3.SpriteMaterial({ map: tex("drop"), transparent: true, depthWrite: false }), list = [];
    for (var d = 0; d < (n || 12); d++) { var s = new T3.Sprite(dm); s.scale.set(0.055, 0.055, 1); b.g.add(s); list.push([s, d / (n || 12)]); }
    b.fx.push(function (t) { list.forEach(function (q) { var k = (t * 0.5 + q[1]) % 1; q[0].position.set(sx + (ex - sx) * k, sy + (ey - sy) * k + hgt * Math.sin(k * PI), sz + (ez - sz) * k); }); });
  }
  function glassBubbles(b, x, z, rAt, y0, list) {
    var glass = new T3.MeshStandardMaterial({ color: lin("#8fd8ff"), emissive: lin("#2a9ae8"), emissiveIntensity: 0.85, transparent: true, opacity: 0.85, roughness: 0.05 });
    list.forEach(function (q) { var r = rAt(q[1]) + 0.01; b.add(new T3.SphereGeometry(q[2], 12, 10), glass, x + Math.cos(q[0]) * r, y0 + q[1], z + Math.sin(q[0]) * r, { noCast: true }); });
  }
  function waveWall(b, x, y, z, ry, s) {
    var ws = new T3.Shape(); ws.moveTo(0, 0); ws.lineTo(0.9, 0); ws.quadraticCurveTo(1.0, 0.9, 0.55, 1.15); ws.quadraticCurveTo(0.15, 1.3, 0.05, 0.95); ws.quadraticCurveTo(0.3, 1.0, 0.45, 0.85); ws.quadraticCurveTo(0.6, 0.6, 0.35, 0.2); ws.closePath();
    var m = new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#1a6ab0"), emissiveIntensity: 0.5, transparent: true, opacity: 0.85, roughness: 0.1, side: T3.DoubleSide });
    b.add(new T3.ExtrudeGeometry(ws, { depth: 0.14, bevelEnabled: false }), m, x, y, z, { ry: ry, s: [s, s, 1] });
  }
  function glowCrown(b, x, y, z, r) {
    var g = new T3.Group(); g.position.set(x, y, z); b.g.add(g);
    b.add(new T3.TorusGeometry(r, 0.02, 6, 28), BRZ(), 0, 0, 0, { parent: g, rx: PI / 2 });
    b.add(new T3.SphereGeometry(r * 0.32, 12, 10), dGlow("#e8f8ff", "#58c8ff", 2), 0, r * 0.6, 0, { parent: g, noCast: true });
    b.fx.push(function (t) { g.rotation.y = t * 0.5; });
  }
  function rWaterHouse(b) {
    b.slab(3.2, "grassWater", "sideWater"); b.decal("path", 0.35, 1.15, 0.8, 1.0, -0.2);
    var X = -0.2, Z = -0.25;
    blueTerrace(b, X, Z, 1.2, 0.14, 0); pearlTerrace(b, X, Z, 0.98, 0.14, 0.14);
    var rAt = dConch(b, X, Z, 1.95, 0.82, 0.28, 4);
    shellMouth(b, X + Math.cos(PI / 4) * 0.7, 0.28, Z + Math.sin(PI / 4) * 0.7, PI / 4, 0.75);
    glassBubbles(b, X, Z, rAt, 0.28, [[PI / 4 + 0.9, 0.55, 0.1], [PI / 4 - 0.9, 0.6, 0.09], [0.2, 1.05, 0.08]]);
    bronzeRing(b, X, 1.15, Z, rAt(0.87) + 0.16, 10);
    glowCrown(b, X, 2.32, Z, 0.16);
    b.water(0.5, 0.55, 1.2, 1.25, 0.0, 0.08);
    b.add(new T3.BoxGeometry(0.74, 0.1, 0.06), M("pearl", 0.7, 0.2), 0.85, 0, 0.53); b.add(new T3.BoxGeometry(0.06, 0.1, 0.74), M("pearl", 0.2, 0.7), 0.48, 0, 0.9);
    waterArc(b, X + 0.4, 1.3, Z + 0.3, 0.85, 0.1, 0.9, 0.35, 10);
    shells(b, [[-1.15, 0.9], [1.2, -0.9], [-1.0, -1.1]]);
  }
  function rWaterFarm(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var levels = [[-1.45, -0.55, 0.5], [-0.55, 0.35, 0.3], [0.35, 1.25, 0.1]], kelp = ["#4f8a6a", "#3f7a5a", "#6aa87a"];
    levels.forEach(function (L, i) {
      var d = L[1] - L[0], cz = (L[0] + L[1]) / 2, sd = M("pearl", 1.6, L[2] * 2, { color: lin("#e8d8d0") }), tp = M("soil", 2, 0.6);
      b.add(new T3.BoxGeometry(2.9, L[2], d), [sd, sd, tp, sd, sd, sd], -0.15, L[2] / 2, cz);
      if (i === 1) b.cabbages(-1.5, L[0] + 0.1, 0.9, L[1] - 0.1, 2, 8, "#5f9e4a", L[2]);
      else b.lift(L[2], function () { this.wheat(-1.5, L[0] + 0.1, 0.9, L[1] - 0.1, 2, 9, kelp); });
      b.water(1.0, L[0], 1.3, L[1], L[2], L[2] + 0.05);
      if (i < 2) { var cas = tex("water", 0.3, 0.6); b.add(new T3.PlaneGeometry(0.28, L[2] - levels[i + 1][2] + 0.05), new T3.MeshStandardMaterial({ map: cas, transparent: true, opacity: 0.85, roughness: 0.1, side: T3.DoubleSide }), 1.15, (L[2] + levels[i + 1][2]) / 2 + 0.03, L[1] + 0.005, { noCast: true }); b.fx.push(function (t) { cas.offset.y = t * 0.9; }); }
    });
    b.water(1.0, 1.25, 1.3, 1.95, 0, 0.05);
    var rAt = dConch(b, 1.6, -1.75, 2.2, 0.55, 0.0, 4.5);
    glassBubbles(b, 1.6, -1.75, rAt, 0, [[PI / 4, 0.6, 0.08], [PI / 4 + 1, 1.0, 0.07]]);
    glowCrown(b, 1.6, 2.3, -1.75, 0.12);
    waterArc(b, 1.55, 1.6, -1.55, 1.15, 0.55, -1.0, 0.45, 12);
    var chime = new T3.Group(); chime.position.set(-1.85, 1.0, 1.85); b.g.add(chime);
    b.cyl(0.03, 0.04, 1.0, 6, BRZ(), -1.85, 0, 1.85);
    [-0.06, 0.0, 0.06].forEach(function (dx, i) { b.add(new T3.CylinderGeometry(0.015, 0.015, 0.2 + i * 0.05, 6), BRZ(), dx, -0.15 - i * 0.02, 0, { parent: chime }); });
    b.fx.push(function (t) { chime.rotation.z = Math.sin(t * 2.1) * 0.15; });
    shells(b, [[-1.85, 1.6], [-1.6, 1.95], [0.6, 1.95]]);
  }
  function rWaterStore(b) {
    b.slabWater(3.2, 1.0, "grassWater", "sideWater");
    var HX = -0.4, HZ = -0.7;
    b.box(2.0, 0.14, 1.4, M("stoneBlue", 2, 1.4), HX, 0, HZ);
    b.box(1.65, 0.7, 1.0, M("pearl", 2, 0.7, { color: lin("#f0e2da") }), HX, 0.14, HZ);
    var g = hullRoof(b, HX, 0.84, HZ, 2.0, 1.2, 0);
    g.children.forEach(function (c) { if (c.geometry && c.geometry.type === "SphereGeometry") c.material = M("pearl", 3, 1.5, { color: lin("#f2dcd2") }); });
    var rAt = dConch(b, HX + 0.85, HZ - 0.3, 1.9, 0.38, 0.84, 4);
    glowCrown(b, HX + 0.85, 2.8, HZ - 0.3, 0.1);
    shellMouth(b, HX, 0.14, HZ + 0.52, 0, 0.7);
    porthole(b, HX + 0.84, 0.5, HZ + 0.15, 1, 0, 0.8); porthole(b, HX - 0.55, 0.5, HZ + 0.52, 0, 1, 0.8);
    b.box(3.2, 0.1, 0.55, M("stoneBlue", 3, 0.5), 0, -0.05, 0.35);
    var bz = BRZ(), CX = 0.95, CZ = 0.45;
    b.cyl(0.05, 0.07, 1.6, 8, bz, CX, 0, CZ);
    var arm = new T3.Group(); arm.position.set(CX, 1.5, CZ); b.g.add(arm);
    b.beam([0, 0, 0], [-0.1, 0.15, 0.85], 0.03, bz, arm);
    var hook = new T3.Group(); hook.position.set(-0.1, 0.15, 0.85); arm.add(hook);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.8, 4), C("#d8cba6"), 0, -0.4, 0, { parent: hook });
    var netM = new T3.MeshStandardMaterial({ map: tex("net", 1, 1), transparent: true, alphaTest: 0.4, side: T3.DoubleSide, roughness: 1 });
    b.add(new T3.SphereGeometry(0.15, 10, 8), netM, 0, -0.92, 0, { parent: hook, s: [1, 1.2, 1] });
    b.fx.push(function (t) { arm.rotation.y = Math.sin(t * 0.4) * 0.6; hook.rotation.x = Math.sin(t * 1.3) * 0.08; });
    b.boat(-0.5, 1.15, 0.1);
    [-0.95, -0.05].forEach(function (x) { b.add(new T3.SphereGeometry(0.06, 10, 8), dGlow("#e8f8ff", "#58c8ff", 1.6), x, 0.25, 1.15, { noCast: true }); });
    b.gold(-1.2, 0.3); shells(b, [[0.3, 0.2]]); b.banner(-1.35, -0.1, 0, "bannerWater", 1.3);
  }
  function rWaterBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater"); b.decal("path", 0.3, 1.35, 2.6, 1.4);
    var HX = -0.35, HZ = -0.65;
    b.box(3.0, 0.16, 1.9, M("stoneBlue", 3, 1.9), HX, 0, HZ);
    b.box(2.6, 0.14, 1.6, M("pearl", 3, 1.6, { color: lin("#f0e2da") }), HX, 0.16, HZ);
    b.box(2.1, 0.75, 1.15, M("pearl", 3, 0.8, { color: lin("#f0e2da") }), HX, 0.3, HZ);
    var g = hullRoof(b, HX, 1.05, HZ, 2.45, 1.4, 0);
    g.children.forEach(function (c) { if (c.geometry && c.geometry.type === "SphereGeometry") c.material = M("pearl", 3, 1.5, { color: lin("#f2dcd2") }); });
    [-1, 0, 1].forEach(function (s) { var x = HX + s * 1.1, h = s === 0 ? 1.4 : 1.65, y0 = s === 0 ? 1.55 : 0.3; if (s !== 0) b.cyl(0.36, 0.4, 0.75, 14, M("pearl", 1.5, 0.7), x, 0.3, HZ); dConch(b, x, HZ, h, s === 0 ? 0.3 : 0.42, s === 0 ? y0 : 1.05, 4); glowCrown(b, x, (s === 0 ? y0 : 1.05) + h + 0.08, HZ, 0.1); });
    shellMouth(b, HX, 0.3, HZ + 0.58, 0, 0.85);
    [-0.6, 0.6].forEach(function (dx) { porthole(b, HX + dx, 0.75, HZ + 0.59, 0, 1, 0.85); });
    waveWall(b, -1.65, 0.0, 1.2, -PI / 2, 0.8); waveWall(b, 0.85, 0.0, 1.2, -PI / 2, 0.8);
    b.target(1.35, 1.5, 0.5); b.target(1.85, 1.0, 0.7);
    b.banner(HX - 0.6, HZ + 1.2, 0, "bannerWater", 1.5); b.banner(HX + 0.6, HZ + 1.2, 0, "bannerWater", 1.5);
    shells(b, [[1.8, -1.6], [-1.9, -1.6]]);
  }
  function rWaterTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var TX = -0.2, TZ = -0.45;
    blueTerrace(b, TX, TZ, 0.95, 0.18, 0); pearlTerrace(b, TX, TZ, 0.78, 0.14, 0.18);
    var rAt = dConch(b, TX, TZ, 3.4, 0.68, 0.32, 6);
    shellMouth(b, TX + 0.6 * 0.707, 0.32, TZ + 0.6 * 0.707, PI / 4, 0.65);
    glassBubbles(b, TX, TZ, rAt, 0.32, [[PI / 4 + 0.6, 1.0, 0.08], [PI / 4 - 0.7, 1.5, 0.07], [PI / 4 + 0.2, 2.1, 0.06]]);
    bronzeRing(b, TX, 0.32 + 1.3, TZ, rAt(1.3) + 0.18, 10);
    var LY = 3.75, bz = BRZ();
    b.add(new T3.CylinderGeometry(0.24, 0.24, 0.03, 12), bz, TX, LY - 0.02, TZ);
    for (var k = 0; k < 6; k++) { var p = dRing(0.2, k * PI / 3); b.cyl(0.012, 0.012, 0.36, 4, bz, TX + p[0], LY, TZ + p[1]); }
    var orb = dGlow("#d6f4ff", "#58c8ff", 1.8);
    b.add(new T3.SphereGeometry(0.15, 16, 12), orb, TX, LY + 0.18, TZ, { noCast: true });
    b.add(new T3.ConeGeometry(0.26, 0.2, 12), bz, TX, LY + 0.46, TZ);
    var L = new T3.PointLight("#58c8ff", 1.2, 4, 2); L.position.set(TX, LY + 0.18, TZ); b.g.add(L);
    b.fx.push(function (t) { var k = 1 + Math.sin(t * 1.8) * 0.3; orb.emissiveIntensity = 1.6 * k; L.intensity = 1.0 * k; });
    waveWall(b, 0.6, 0, 0.45, -PI / 2 + 0.4, 0.6);
    b.boat(-0.65, 1.2, -0.2); shells(b, [[-1.15, 0.25], [1.15, -1.0]]);
  }
  function rWaterPen(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var CX = -0.1, CZ = -0.15;
    blueTerrace(b, CX, CZ, 1.75, 0.2, 0);
    var wt = tex("water", 1.3, 1.3);
    b.add(new T3.CircleGeometry(1.45, 40), new T3.MeshStandardMaterial({ map: wt, roughness: 0.1, metalness: 0.25 }), CX, 0.205, CZ, { rx: -PI / 2, noCast: true });
    b.fx.push(function (t) { wt.offset.set(t * 0.03, t * 0.02); });
    b.add(new T3.TorusGeometry(1.47, 0.06, 6, 48), M("pearl", 6, 0.2), CX, 0.22, CZ, { rx: PI / 2 });
    var nest = M("wicker", 3, 0.5), bz = BRZ();
    [[-0.65, -0.7, 2.1], [0.6, -0.55, 1.55], [-0.2, 0.55, 1.15]].forEach(function (q, i) {
      var x = CX + q[0], z = CZ + q[1];
      dConch(b, x, z, q[2], 0.32, 0.2, 4);
      b.add(new T3.CylinderGeometry(0.26, 0.2, 0.08, 10), bz, x, q[2] + 0.2, z);
      b.add(new T3.TorusGeometry(0.22, 0.05, 6, 14), nest, x, q[2] + 0.27, z, { rx: PI / 2 });
      if (i < 2) b.raven(x, q[2] + 0.28, z, 1.1, 0.7 + i * 0.3, false);
    });
    var orbit = new T3.Group(); orbit.position.set(CX, 2.9, CZ); b.g.add(orbit);
    var fly = b.raven(0, 0, 0, 1.0, 0, true); b.g.remove(fly); orbit.add(fly); fly.position.set(1.25, 0, 0); fly.rotation.y = PI; fly.rotation.z = -0.25;
    b.fx.push(function (t) { orbit.rotation.y = t * 0.55; fly.position.y = Math.sin(t * 1.3) * 0.12; });
    waterArc(b, CX - 0.2, 1.3, CZ + 0.55, CX + 0.9, 0.22, CZ + 0.6, 0.3, 10);
    waveWall(b, 1.4, 0, 1.6, -PI / 2, 0.6);
    b.banner(-1.75, 1.6, 0, "bannerWater", 1.5); shells(b, [[1.9, -1.6], [-1.9, -1.7]]);
  }
  function rWaterSanctum(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var CX = -0.5, CZ = -0.5;
    blueTerrace(b, CX, CZ, 1.55, 0.2, 0); pearlTerrace(b, CX, CZ, 1.3, 0.18, 0.2);
    var dome = new T3.SphereGeometry(1.05, 32, 14, 0, 2 * PI, 0, PI / 2);
    b.add(dome, M("pearl", 3, 2, { color: lin("#f2dcd2"), roughness: 0.35 }), CX, 0.38, CZ, { s: [1, 1.25, 1] });
    var pts = [];
    for (var s = 0; s <= 120; s++) { var t = s / 120, a = t * PI * 2 * 3.5, el = t * PI / 2 * 0.92, r = 1.05 * Math.cos(el) + 0.015, y = 0.38 + 1.05 * 1.25 * Math.sin(el); pts.push(new T3.Vector3(CX + Math.cos(a) * r, y, CZ + Math.sin(a) * r)); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 240, 0.05, 6, false), M("pearl", 1, 8, { color: lin("#9a6e64") }), 0, 0, 0);
    var glass = new T3.MeshStandardMaterial({ color: lin("#8fd8ff"), emissive: lin("#2a9ae8"), emissiveIntensity: 0.9, transparent: true, opacity: 0.85, roughness: 0.05 });
    b.add(new T3.SphereGeometry(0.3, 18, 10, 0, 2 * PI, 0, PI / 2), glass, CX, 0.38 + 1.27, CZ);
    glowCrown(b, CX, 2.05, CZ, 0.3);
    shellMouth(b, CX + 0.95 * 0.707, 0.38, CZ + 0.95 * 0.707, PI / 4, 0.85);
    [PI / 4 + 0.95, PI / 4 - 0.95].forEach(function (a) { var p = dRing(1.03, a); porthole(b, CX + p[0], 0.75, CZ + p[1], p[0], p[1], 0.9); });
    var PX = 1.05, PZ = 1.05;
    b.box(1.6, 0.16, 1.6, M("stoneBlue", 1.5, 1.5), PX, 0, PZ); b.water(PX - 0.68, PZ - 0.68, PX + 0.68, PZ + 0.68, 0.1, 0.17);
    var orbM = new T3.MeshStandardMaterial({ color: lin("#9fdcff"), emissive: lin("#3aa8ff"), emissiveIntensity: 0.9, transparent: true, opacity: 0.75, roughness: 0.05 });
    var orb = b.add(new T3.SphereGeometry(0.3, 20, 14), orbM, PX, 1.2, PZ, { noCast: true });
    var L = new T3.PointLight("#58c8ff", 1.3, 3.5, 2); b.g.add(L);
    var ring = b.add(new T3.TorusGeometry(0.5, 0.035, 8, 40), new T3.MeshStandardMaterial({ map: tex("water", 3, 0.3), transparent: true, opacity: 0.75, emissive: lin("#1a6ab0"), emissiveIntensity: 0.5 }), PX, 1.2, PZ, { rx: PI / 2 - 0.4, noCast: true });
    b.fx.push(function (t) { var y = 1.2 + Math.sin(t * 1.2) * 0.1; orb.position.y = y; ring.position.y = y; ring.rotation.z = t * 0.6; L.position.set(PX, y, PZ); });
    waterArc(b, CX + 0.2, 2.0, CZ + 0.2, PX, 1.25, PZ, 0.4, 12);
    waveWall(b, PX + 0.95, 0, PZ - 1.0, PI, 0.6); waveWall(b, PX - 1.0, 0, PZ + 0.95, -PI / 2, 0.6);
    b.banner(-1.95, 0.6, 0, "bannerWater", 1.5);
  }

  /* ---------------- Gryffindor Mythic ---------------- */
  function magmaSeams(b, x, z, r0, h, y0, n, mat) {
    var fh = r0 * 0.707;
    for (var j = 0; j < n; j++) { var o = (j / Math.max(1, n - 1) - 0.5) * fh * 1.2; b.box(0.04, h * 0.55, 0.02, mat, x + o, y0 + h * 0.3, z + fh * 0.96, { rz: 0.3 - j * 0.3, noCast: true }); b.box(0.02, h * 0.55, 0.04, mat, x + fh * 0.96, y0 + h * 0.3, z + o, { rx: 0.3 - j * 0.3, noCast: true }); }
  }
  function fireCrown(b, x, y, z, s) {
    var gold = REDGOLD();
    for (var c = 0; c < 8; c++) { var p = onRing(0.3 * s, c / 8 * 2 * PI); b.add(new T3.ConeGeometry(0.045 * s, 0.38 * s, 4), gold, x + p[0], y + 0.19 * s, z + p[1], { rz: p[0] / s * -0.55 * 3, rx: p[1] / s * 0.55 * 3 }); }
    b.cyl(0.26 * s, 0.17 * s, 0.16 * s, 10, M("iron"), x, y, z);
    b.cyl(0.24 * s, 0.24 * s, 0.02, 10, dGlow("#ffb060", "#ff4a10", 1.6), x, y + 0.16 * s, z, { noCast: true });
    dFlame(b, x, y + 0.17 * s, z, 0.85 * s, 1.0 * s);
  }
  function obelisk(b, x, z, h, y0) {
    dFrustum(b, x, y0 || 0, z, 0.28, 0.17, h, M("basalt", 0.5, h));
    dFrustum(b, x, (y0 || 0) + h * 0.6, z, 0.25, 0.24, 0.05, REDGOLD());
    b.cyl(0.13, 0.13, 0.04, 4, dGlow("#ffb060", "#ff4a10", 1.6), x, (y0 || 0) + h, z, { ry: PI / 4, noCast: true });
    dFlame(b, x, (y0 || 0) + h + 0.03, z, 0.4, 0.35);
  }
  function stepped(b, x, z, tiers, y0) {
    var bas = M("basalt", 2, 0.8), gold = REDGOLD(), magma = dGlow("#ffb060", "#ff4a10", 1.5), Y = y0 || 0;
    tiers.forEach(function (t, i) {
      dFrustum(b, x, Y, z, t[0], t[1], t[2], bas);
      dFrustum(b, x, Y + t[2] - 0.06, z, t[1] + 0.05, t[1] + 0.02, 0.07, gold);
      spikeRing(b, x, z, t[1] * 0.707 + 0.01, Y + t[2], 2);
      magmaSeams(b, x, z, t[0], t[2], Y, i ? 1 : 2, magma);
      Y += t[2];
    });
    b.fx.push(function (t) { magma.emissiveIntensity = 1.3 + Math.sin(t * 2) * 0.35; });
    return Y;
  }
  function gFireHouse(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0.25, 0.95, 1.1, 1.4, -0.2);
    var X = -0.2, Z = -0.25;
    dFrustum(b, X, 0, Z, 1.25, 1.15, 0.14, M("basalt", 2, 0.2));
    var Y = stepped(b, X, Z, [[1.0, 0.86, 0.7], [0.72, 0.58, 0.48], [0.5, 0.36, 0.36]], 0.14);
    fireCrown(b, X, Y, Z, 0.75);
    forgeGate(b, X, 0.14, Z + 0.93 * 0.707 + 0.02, 0, 0.32, 0.5, 0.75);
    obelisk(b, X + 0.85, Z - 0.85, 1.7, 0); dSmoke(b, X + 0.85, 2.0, Z - 0.85, 4);
    basaltBowl(b, 0.95, 0.85, 0, 0.9);
    stakes(b, -1.4, -1.4, -1.4, 0.8, 7); b.logs(1.05, -1.0, 0.4);
  }
  function gFireFarm(b) {
    b.slab(4.2, "grassFire", "sideFire");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.25, 0, 0.25);
    b.wheat(-1.1, -1.1, 1.6, 1.6, 8, 9, ["#e8b83a", "#d8a030", "#f2cc5a", "#c88a28"]);
    var bas = M("basalt", 3, 0.3), gold = REDGOLD();
    [[0.25, 1.85, 3.3, 0.22], [1.85, 0.25, 0.22, 3.3]].forEach(function (w) { b.box(w[2], 0.36, w[3], bas, w[0], 0, w[1]); b.box(w[2] + 0.02, 0.04, w[3] + 0.02, gold, w[0], 0.36, w[1]); });
    var GX = -1.5, GZ = -1.5;
    var Y = stepped(b, GX, GZ, [[0.75, 0.62, 0.8], [0.52, 0.4, 0.55], [0.34, 0.24, 0.4]], 0);
    fireCrown(b, GX, Y, GZ, 0.6);
    forgeGate(b, GX, 0, GZ + 0.69 * 0.707 + 0.02, 0, 0.26, 0.42, 0.55);
    [[1.85, 1.85], [1.85, -1.55], [-1.55, 1.85]].forEach(function (p) { obelisk(b, p[0], p[1], 1.0, 0.36); });
    stakes(b, -1.75, 1.2, -1.75, -0.4, 5); stakes(b, -0.5, -1.75, 1.2, -1.75, 5);
    b.scarecrow(0.3, 0.35, "#b3261e"); b.hay(0.6, -1.95, 0.2);
  }
  function gFireStore(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0.3, 0.8, 1.6, 1.5, -0.2);
    var X = -0.5, Z = -0.5;
    dFrustum(b, X, 0, Z, 1.05, 0.98, 0.14, M("basalt", 2, 0.2));
    var Y = stepped(b, X, Z, [[0.85, 0.74, 0.8], [0.6, 0.48, 0.42]], 0.14);
    dFrustum(b, X, Y, Z, 0.48, 0.05, 0.35, M("ironPlate", 1, 1));
    forgeGate(b, X, 0.14, Z + 0.79 * 0.707 + 0.02, 0, 0.42, 0.55, 0.65);
    var FX = 0.75, FZ = -0.7;
    dFrustum(b, FX, 0, FZ, 0.5, 0.3, 1.6, M("basalt", 1, 1.4));
    dFrustum(b, FX, 0.9, FZ, 0.43, 0.42, 0.05, REDGOLD());
    fireCrown(b, FX, 1.6, FZ, 0.75); dSmoke(b, FX, 2.2, FZ, 5);
    var pour = dGlow("#ffd080", "#ff8a10", 2.2);
    b.box(0.08, 0.02, 0.7, pour, FX, 0.32, FZ + 0.65, { rx: 0.35, noCast: true });
    b.add(new T3.CylinderGeometry(0.28, 0.28, 0.03, 4), pour, FX, 0.04, FZ + 1.1, { ry: PI / 4, noCast: true });
    var pl = new T3.PointLight("#ff8a2a", 1.0, 2.5, 2); pl.position.set(FX, 0.4, FZ + 1.1); b.g.add(pl);
    var gb = C("#f2c040", { metalness: 0.85, roughness: 0.3 });
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3 - r; c++) b.box(0.15, 0.06, 0.3, gb, -0.2 + c * 0.16 + r * 0.08, 0.06 * r, 1.05);
    stakes(b, -1.35, 1.35, -1.35, -0.3, 5);
  }
  function gFireBarracks(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.3, 1.3, 2.6, 1.5);
    var HX = -0.4, HZ = -0.65, bas = M("basalt", 3, 0.9), gold = REDGOLD(), magma = dGlow("#ffb060", "#ff4a10", 1.5);
    b.box(3.0, 0.14, 1.9, M("basalt", 3, 0.2), HX, 0, HZ);
    var tiers = [[2.7, 1.55, 0.95], [2.1, 1.1, 0.55], [1.4, 0.65, 0.4]], Y = 0.14;
    tiers.forEach(function (t, i) {
      b.box(t[0], t[2], t[1], bas, HX, Y, HZ);
      b.box(t[0] + 0.06, 0.06, t[1] + 0.06, gold, HX, Y + t[2] - 0.05, HZ);
      for (var k = -4; k <= 4; k++) { if (Math.abs(k * t[0] / 9) > t[0] / 2) continue; b.add(new T3.ConeGeometry(0.035, 0.18, 4), M("iron"), HX + k * t[0] / 9, Y + t[2] + 0.09, HZ + t[1] / 2); }
      if (i < 2) [-0.6, 0.3, 0.8].forEach(function (o, j) { b.box(0.04, t[2] * 0.5, 0.02, magma, HX + o * t[0] / 2, Y + t[2] * 0.3, HZ + t[1] / 2 + 0.005, { rz: 0.3 - j * 0.3, noCast: true }); });
      Y += t[2];
    });
    fireCrown(b, HX, Y, HZ, 0.7);
    forgeGate(b, HX, 0.14, HZ + 0.78, 0, 0.5, 0.72, 1.0);
    obelisk(b, HX - 1.75, HZ + 0.5, 1.9, 0); obelisk(b, HX + 1.75, HZ + 0.5, 1.9, 0);
    lionStatue(b, HX - 0.55, HZ + 1.25, 0, 0, 0.6); lionStatue(b, HX + 0.55, HZ + 1.25, 0, 0, 0.6);
    b.target(1.25, 1.45, 0.5); b.target(1.75, 0.95, 0.7);
    b.banner(-1.6, 1.6, 0, "bannerFire", 1.5);
    b.fx.push(function (t) { magma.emissiveIntensity = 1.3 + Math.sin(t * 2) * 0.35; });
  }
  function gFireTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    dFrustum(b, 0, 0, 0, 1.15, 1.05, 0.22, M("basalt", 2, 0.2));
    var Y = stepped(b, 0, 0, [[0.85, 0.66, 1.4], [0.6, 0.48, 1.0], [0.46, 0.36, 0.6]], 0.22);
    dFrustum(b, 0, Y, 0, 0.4, 0.62, 0.25, M("basalt", 1, 0.3));
    dFrustum(b, 0, Y + 0.25, 0, 0.63, 0.62, 0.05, REDGOLD());
    spikeRing(b, 0, 0, 0.62 * 0.707, Y + 0.3, 2);
    fireCrown(b, 0, Y + 0.3, 0, 1.05);
    forgeGate(b, 0, 0.22, 0.8 * 0.707 + 0.02, 0, 0.32, 0.5, 0.7);
    var pv = new T3.Group(); pv.position.set(0.45, Y + 0.85, -0.45); b.g.add(pv);
    b.cyl(0.015, 0.015, 0.55, 5, C("#3e2616"), 0.45, Y + 0.3, -0.45);
    var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(0.42, -0.08); sh.lineTo(0, -0.18); sh.closePath();
    b.add(new T3.ShapeGeometry(sh), C("#c0281c", { side: T3.DoubleSide }), 0, 0, 0, { parent: pv, ry: -PI / 4 });
    b.fx.push(function (t) { pv.rotation.y = Math.sin(t * 2.4) * 0.35; });
    obelisk(b, -1.1, 1.0, 1.0, 0); stakes(b, -1.35, -1.35, 1.0, -1.35, 7);
  }
  function gFirePen(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var bas = M("basalt", 3, 0.4), gold = REDGOLD(), magma = dGlow("#ffb060", "#ff4a10", 1.6);
    b.box(3.6, 0.1, 3.2, M("dirt", 3, 3, { color: lin("#a08870") }), -0.1, 0, -0.2);
    [[-1.85, 1.35, -1.85, -1.85], [-1.85, -1.85, 1.75, -1.85], [1.75, -1.85, 1.75, 1.35]].forEach(function (w) {
      var len = Math.hypot(w[2] - w[0], w[3] - w[1]), ry = -Math.atan2(w[3] - w[1], w[2] - w[0]), cx = (w[0] + w[2]) / 2, cz = (w[1] + w[3]) / 2;
      b.box(len + 0.3, 0.5, 0.36, bas, cx, 0, cz, { ry: ry }); b.box(len + 0.1, 0.35, 0.24, bas, cx, 0.5, cz, { ry: ry });
      b.box(len + 0.12, 0.04, 0.26, gold, cx, 0.85, cz, { ry: ry });
      var n = Math.round(len / 0.3); for (var k = 0; k <= n; k++) { var t = k / n; b.add(new T3.ConeGeometry(0.035, 0.2, 4), M("iron"), w[0] + (w[2] - w[0]) * t, 0.97, w[1] + (w[3] - w[1]) * t); }
    });
    [-1.85, 1.75].forEach(function (x) { obelisk(b, x, 1.35, 1.5, 0); });
    for (var i = -5; i <= 5; i++) if (Math.abs(i) > 1) b.box(0.03, 0.9, 0.03, M("iron"), -0.05 + i * 0.3, 0, 1.35);
    [0.25, 0.8].forEach(function (y) { b.box(3.2, 0.035, 0.035, M("iron"), -0.05, y, 1.35); });
    var RX = 0.15, RZ = -0.35;
    dFrustum(b, RX, 0.1, RZ, 1.05, 0.85, 0.3, bas); dFrustum(b, RX, 0.4, RZ, 0.8, 0.62, 0.25, bas);
    dFrustum(b, RX, 0.6, RZ, 0.66, 0.63, 0.05, gold);
    magmaSeams(b, RX, RZ, 1.05, 0.55, 0.1, 2, magma);
    b.add(new T3.TorusGeometry(1.25, 0.06, 6, 4), magma, RX, 0.12, RZ, { rx: PI / 2, rz: PI / 4, noCast: true });
    var lion = b.lion(RX, RZ, 0.8, 0.55); lion.position.y = 0.65;
    lionStatue(b, -1.35, -1.35, 0, PI / 4, 0.55);
    b.banner(-0.9, 1.75, 0, "bannerFire", 1.5); b.banner(0.8, 1.75, 0, "bannerFire", 1.5);
    b.fx.push(function (t) { magma.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.4; });
  }
  function gFireSanctum(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var bas = M("basalt", 3, 0.4), gold = REDGOLD();
    var Y = stepped(b, 0, 0, [[2.45, 2.25, 0.32], [1.95, 1.75, 0.32], [1.5, 1.3, 0.32]], 0);
    for (var s = 0; s < 6; s++) b.box(0.75, 0.16 * (s + 1) - 0.02, 0.16, M("basalt", 0.7, 0.2), 0, 0, 1.75 - s * 0.1);
    [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(function (q) { dFrustum(b, q[0], Y, q[1], 0.14, 0.11, 1.3, bas); dFrustum(b, q[0], Y + 0.45, q[1], 0.13, 0.12, 0.05, gold); dFrustum(b, q[0], Y + 1.0, q[1], 0.12, 0.115, 0.05, gold); });
    dFrustum(b, 0, Y + 1.3, 0, 0.85, 0.8, 0.12, bas); dFrustum(b, 0, Y + 1.42, 0, 0.82, 0.05, 0.5, M("ironPlate", 1.4, 1));
    spikeRing(b, 0, 0, 0.8 * 0.707, Y + 1.42, 2);
    dFrustum(b, 0, Y, 0, 0.36, 0.28, 0.3, bas);
    fireCrown(b, 0, Y + 0.3, 0, 1.0);
    lionStatue(b, -0.6, 1.55, 0.32, 0, 0.6); lionStatue(b, 0.6, 1.55, 0.32, 0, 0.6);
    [[-1.85, -1.85], [1.85, -1.85]].forEach(function (p) { obelisk(b, p[0], p[1], 2.0, 0); });
    b.banner(-1.5, 1.8, 0, "bannerFire", 1.5); b.banner(1.5, 1.8, 0, "bannerFire", 1.5);
  }

  var MYTHB = {
    air: [hAirHouse, hAirFarm, hAirStore, hAirBarracks, hAirTower, hAirPen, hAirSanctum],
    water: [rWaterHouse, rWaterFarm, rWaterStore, rWaterBarracks, rWaterTower, rWaterPen, rWaterSanctum],
    fire: [gFireHouse, gFireFarm, gFireStore, gFireBarracks, gFireTower, gFirePen, gFireSanctum]
  };
