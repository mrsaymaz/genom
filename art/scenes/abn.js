
  /* ================= ARCANE AGE BUILDINGS in the new design languages ================= */
  function honeyPylon(b, x, z, h, tx, ty, tz) {
    b.add(new T3.CylinderGeometry(0.13, 0.17, h, 6), M("honeycomb", 0.6, h), x, h / 2, z, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.19, 0.19, 0.04, 6), C(BY.black), x, h, z, { ry: PI / 6 });
    amberFloat(b, x, h + 0.3, z, 0.7);
    if (tx != null) b.beam([x, h + 0.3, z], [tx, ty, tz], 0.025, new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.22, depthWrite: false }));
  }
  function hexSteps(b, fromR, toR, ang, y0, y1, n) {
    for (var s = 0; s < n; s++) {
      var t = s / (n - 1), p = onRing(fromR + (toR - fromR) * t, ang), y = y0 + t * (y1 - y0);
      var st = b.add(new T3.CylinderGeometry(0.2, 0.2, 0.08, 6), [M("honeycomb", 0.5, 0.2), M("honeycomb", 0.4, 0.4), M("honeycomb", 0.4, 0.4)], p[0], y, p[1], { ry: PI / 6 });
      (function (m, yy, k) { b.fx.push(function (tt) { m.position.y = yy + Math.sin(tt * 1.3 + k) * 0.03; }); })(st, y, s);
    }
  }
  function waterRing2(b, x, y, z, r, tilt, sp) {
    var m = new T3.MeshStandardMaterial({ map: tex("water", 4, 0.3), transparent: true, opacity: 0.75, roughness: 0.05, emissive: lin("#1a6ab0"), emissiveIntensity: 0.5 });
    var ring = b.add(new T3.TorusGeometry(r, 0.045, 8, 56), m, x, y, z, { rx: PI / 2 - (tilt || 0.25), noCast: true });
    b.fx.push(function (t) { ring.rotation.z = t * (sp || 0.45); m.map.offset.x = t * 0.15; });
  }
  function haloG(b, x, y, z, r) {
    var g = new T3.Group(); b.g.add(g);
    b.add(new T3.TorusGeometry(r, 0.025, 6, 40), REDGOLD(), 0, 0, 0, { parent: g, rx: PI / 2 });
    for (var f = 0; f < 8; f++) { var q = onRing(r, f / 8 * 2 * PI); b.add(new T3.ConeGeometry(0.035, 0.14, 5), REDGOLD(), q[0], 0.06, q[1], { parent: g }); }
    var ph = b.rand() * 6; b.fx.push(function (t) { g.position.set(x, y + Math.sin(t * 1.3 + ph) * 0.04, z); g.rotation.y = t * 0.6; });
  }
  function magmaMoat(b, x, z, r, y) {
    var m = dGlow("#ffb060", "#ff4a10", 1.6);
    b.add(new T3.TorusGeometry(r, 0.06, 4, 4), m, x, y || 0.02, z, { rx: PI / 2, rz: PI / 4, noCast: true });
    b.fx.push(function (t) { m.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.4; });
  }

  /* ---------------- Hufflepuff Arcane ---------------- */
  function zAirHouse(b) {
    b.slab(3.2, "grassAir", "sideAir");
    hexStep(b, 1.3, 0.12, 0); hexStep(b, 1.05, 0.1, 0.12);
    b.add(new T3.RingGeometry(0.55, 0.62, 6), glowMat("#fff0a0", "#ffb020", 0.9), 0, 0.225, 0, { rx: -PI / 2, rz: PI / 6, noCast: true });
    var I = hexIsland(b, -0.1, 1.55, -0.1, 0.95, 1.0, 21);
    inGroup(b, I, function () { bigHive(b, 0, 0, 0.66, 1.2, 0.0, { bands: [0.25, 0.55], cupola: 0.2, rose: 0.55, door: [0.28, 0.2], wins: [[PI / 4 - 0.8, 0.35], [PI / 4 + 0.8, 0.35], [PI / 4, 0.6, 0.8]] }); });
    hexSteps(b, 1.45, 0.95, PI / 4 + 0.45, 0.35, 1.5, 5);
    honeyPylon(b, 1.15, -1.0, 0.9, -0.1, 1.1, -0.1);
    amberFloat(b, -1.05, 2.4, 0.6, 0.8);
    honeyJars(b, [[-1.15, 1.0], [-0.95, 1.15]]);
  }
  function zAirFarm(b) {
    b.slab(4.2, "grassAir", "sideAir");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.2, 0, 0.2);
    b.wheat(-1.15, -1.15, 1.55, 1.55, 8, 9, ["#d9b84a", "#c8a83e", "#e6cc6a"]);
    var hc = M("honeycomb", 3, 0.3);
    [[0.2, 1.8, 3.3, 0.16], [1.8, 0.2, 0.16, 3.3]].forEach(function (w) { b.box(w[2], 0.34, w[3], hc, w[0], 0, w[1]); b.box(w[2] + 0.02, 0.04, w[3] + 0.02, C(BY.black), w[0], 0.34, w[1]); });
    var I = hexIsland(b, 0.85, 2.25, -0.75, 0.9, 1.0, 31);
    inGroup(b, I, function () { b.cabbages(-0.55, -0.55, 0.55, 0.55, 3, 3, "#6fae4a", 0.0); dSkep(b, 0.45, 0, -0.45, 0.2, 0.38); dSkep(b, -0.45, 0, 0.45, 0.18, 0.34); });
    var TX = -1.6, TZ = -1.6;
    hexStep(b, 0.62, 0.18, 0, TX, TZ);
    b.cyl(0.34, 0.42, 1.6, 6, M("honeycomb", 1.5, 1.6), TX, 0.18, TZ, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.48, 0.48, 0.06, 6), C(BY.black), TX, 1.8, TZ, { ry: PI / 6 });
    dSkep(b, TX, 1.83, TZ, 0.38, 0.62);
    windRose(b, TX + 0.28, 2.05, TZ + 0.28, 2.6);
    honeyPylon(b, 1.85, 0.6, 1.1, 0.85, 1.75, -0.75);
    kite(b, 1.9, 1.3, 1.9, 4, 3.6);
    amberFloat(b, 0.4, 1.5, 0.6, 0.9);
  }
  function zAirStore(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var CX = -0.2, CZ = -0.2;
    hexStep(b, 1.3, 0.12, 0, CX, CZ); hexStep(b, 1.05, 0.12, 0.12, CX, CZ);
    b.cyl(0.62, 0.68, 0.8, 6, M("honeycomb", 2.5, 0.9), CX, 0.24, CZ, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.72, 0.72, 0.05, 6), C(BY.black), CX, 1.04, CZ, { ry: PI / 6 });
    b.cyl(0.46, 0.5, 0.5, 6, M("honeycomb", 2, 0.6), CX, 1.07, CZ, { ry: PI / 6 });
    b.add(new T3.ConeGeometry(0.68, 0.55, 6, 1, true), M("canvasBY", 2, 1, { side: T3.DoubleSide }), CX, 1.57 + 0.275, CZ, { ry: PI / 6 });
    windRose(b, CX + 0.03, 2.25, CZ + 0.03, 0.65);
    hiveDoor(b, CX + 0.6 * 0.707, 0.24, CZ + 0.6 * 0.707, PI / 4, 0.32, 0.26, 0.4);
    var orbit = new T3.Group(); orbit.position.set(CX, 1.35, CZ); b.g.add(orbit); var plats = [];
    for (var i = 0; i < 3; i++) {
      var a = i / 3 * 2 * PI, p = onRing(1.15, a), pl = new T3.Group(); pl.position.set(p[0], 0, p[1]); orbit.add(pl);
      b.add(new T3.CylinderGeometry(0.28, 0.28, 0.08, 6), [M("honeycomb", 0.6, 0.2), M("honeycomb", 0.5, 0.5), M("honeycomb", 0.5, 0.5)], 0, 0, 0, { parent: pl, ry: PI / 6 });
      b.add(new T3.BoxGeometry(0.16, 0.16, 0.16), M("plankWarm", 0.3, 0.3), -0.06, 0.12, 0, { parent: pl });
      b.add(new T3.CylinderGeometry(0.06, 0.06, 0.14, 6), new T3.MeshStandardMaterial({ color: lin("#f2a72e"), emissive: lin("#c06a10"), emissiveIntensity: 0.5 }), 0.1, 0.11, 0.05, { parent: pl });
      plats.push([pl, i]);
    }
    b.fx.push(function (t, dt) { orbit.rotation.y += dt * 0.35; plats.forEach(function (q) { q[0].rotation.y = -orbit.rotation.y; q[0].position.y = Math.sin(t * 1.2 + q[1] * 2) * 0.08; }); });
    b.cyl(0.04, 0.06, 2.0, 8, M("plankDark", 0.3, 2), 1.15, 0, -1.1); bySail(b, 1.15, 1.9, -1.1, PI / 4, 1.0);
    b.gold(1.0, 0.95); honeyJars(b, [[-1.2, 1.0], [-1.0, 1.15]]);
  }
  function zAirBarracks(b) {
    hAirBarracks(b);
    var I = hexIsland(b, -1.45, 2.35, 1.35, 0.72, 0.85, 41);
    inGroup(b, I, function () { b.dummy(-0.15, -0.15, 0.6); b.dummy(0.25, 0.2, 0.9); b.add(new T3.RingGeometry(0.35, 0.42, 6), glowMat("#fff0a0", "#ffb020", 0.9), 0, 0.01, 0, { rx: -PI / 2, rz: PI / 6, noCast: true }); });
    honeyPylon(b, -1.95, -0.1, 1.2, -1.45, 1.6, 1.35);
    kite(b, -1.95, 2.5, -1.6, 7, 3.9);
  }
  function zAirTower(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var post = M("plankDark", 0.4, 3), rope = C("#d8cba6");
    hexStep(b, 0.8, 0.16, 0); hexStep(b, 0.6, 0.12, 0.16);
    b.cyl(0.09, 0.13, 3.0, 8, post, 0, 0.28, 0);
    [[1.3, 0.25], [-0.25, 1.3], [0.25, -1.3], [-1.3, -0.25]].forEach(function (g) { b.beam([0, 2.9, 0], [g[0], 0, g[1]], 0.01, rope); });
    [[1.4, 0.42, 0.3], [2.4, 0.52, 0.36]].forEach(function (n, i) {
      b.add(new T3.CylinderGeometry(n[1], n[1] * 0.78, n[2], 6, 1, true), M("wattle", 3, 0.6, { side: T3.DoubleSide }), 0, n[0] + n[2] / 2, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(n[1] * 0.78, n[1] * 0.78, 0.05, 6), M("plankWarm", 0.8, 0.8), 0, n[0] + 0.02, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(n[1] + 0.02, n[1] + 0.02, 0.04, 6, 1, true), i ? glowMat("#ffd060", "#c88a10", 0.5) : C(BY.black), 0, n[0] + n[2], 0, { ry: PI / 6 });
    });
    var crown = hexIsland(b, 0, 3.55, 0, 0.55, 0.45, 51);
    inGroup(b, crown, function () { b.add(new T3.ConeGeometry(0.62, 0.42, 6, 1, true), M("canvasBY", 2, 0.6, { side: T3.DoubleSide }), 0, 0.35, 0, { ry: PI / 6 }); for (var k = 0; k < 3; k++) { var p = dRing(0.42, k * 2 * PI / 3 + 0.4); b.beam([p[0], 0, p[1]], [p[0] * 0.8, 0.18, p[1] * 0.8], 0.012, post); } windRose(b, 0.03, 0.75, 0.03, 0.6); });
    var orb = new T3.Group(); orb.position.set(0, 2.1, 0); b.g.add(orb);
    for (var k2 = 0; k2 < 3; k2++) { var q = onRing(0.85, k2 * 2 * PI / 3), m = b.add(new T3.OctahedronGeometry(0.08, 0), glowMat("#ffd27a", "#ffa420", 1.6), q[0], 0, q[1], { parent: orb, noCast: true }); m.scale.set(0.8, 1.6, 0.8); }
    b.fx.push(function (t, dt) { orb.rotation.y += dt * 0.9; });
    for (var r = 0; r < 10; r++) { var t = r / 10, y = 0.4 + t * 1.95, o = 0.38 - t * 0.1; b.beam([o + 0.07, y, o - 0.07], [o - 0.07, y, o + 0.07], 0.012, M("plankWarm", 0.2, 0.2)); }
    b.hay(1.1, -1.0, 0.3);
  }
  function zAirPen(b) {
    b.slab(4.2, "grassAir", "sideAir");
    hexStep(b, 1.5, 0.12, 0); hexStep(b, 1.2, 0.1, 0.12);
    b.add(new T3.RingGeometry(0.7, 0.78, 6), glowMat("#fff0a0", "#ffb020", 0.9), -0.2, 0.225, -0.2, { rx: -PI / 2, rz: PI / 6, noCast: true });
    var I = hexIsland(b, -0.2, 2.3, -0.2, 1.3, 1.35, 61);
    var IL = new T3.PointLight("#ffb030", 1.2, 4, 2); IL.position.set(0, -1.3, 0); I.add(IL);
    inGroup(b, I, function () {
      var R = 0.82, H = 0.95, rOn = hiveR(R, H, 0);
      dSkep(b, -0.4, 0, -0.4, R, H);
      [0.3, 0.6].forEach(function (f, i) { var y = H * f; b.add(new T3.TorusGeometry(hiveR(R, H, 0)(y) + 0.015, 0.03, 6, 32), i ? glowMat("#ffd060", "#c88a10", 0.5) : C(BY.black), -0.4, y, -0.4, { rx: PI / 2 }); });
      var dr = rOn(0.35) - 0.05; hiveDoor(b, -0.4 + Math.cos(PI / 4) * dr, 0, -0.4 + Math.sin(PI / 4) * dr, PI / 4, 0.55, 0.3, 0.3);
      b.bear(0.45, 0.5, 0.72, -0.5);
    });
    [PI * 0.95, PI * 1.45, PI * 1.95].forEach(function (a) { var p = onRing(1.9, a); honeyPylon(b, p[0], p[1], 1.0, -0.2 + p[0] * 0.3, 1.0, -0.2 + p[1] * 0.3); });
    hexSteps(b, 2.0, 1.25, PI / 4 + 0.55, 0.3, 2.15, 7);
    honeyJars(b, [[1.9, 1.6], [1.7, 1.75], [1.95, 1.85]]);
    b.banner(-0.4, 2.1, 0, "bannerAir", 1.6);
  }
  function zAirSanctum(b) {
    b.slab(4.2, "grassAir", "sideAir");
    hexStep(b, 2.0, 0.14, 0); hexStep(b, 1.7, 0.14, 0.14); hexStep(b, 1.4, 0.12, 0.28);
    var dark = C(BY.black), post = M("plankDark", 0.3, 2), Y = 0.4;
    for (var k = 0; k < 6; k++) { var p = dRing(1.2, k * PI / 3 + PI / 6); b.cyl(0.08, 0.09, 2.2, 6, post, p[0], Y, p[1]); [0.5, 1.1, 1.7].forEach(function (yy, i) { b.cyl(0.1, 0.1, 0.07, 6, i === 1 ? glowMat("#ffd060", "#c88a10", 0.5) : dark, p[0], Y + yy, p[1]); }); }
    b.add(new T3.TorusGeometry(1.23, 0.07, 6, 6), M("honeycomb", 3, 0.3), 0, Y + 2.2, 0, { rx: PI / 2, rz: PI / 6 });
    b.add(new T3.ConeGeometry(1.5, 0.6, 6, 1, true), M("canvasBY", 3, 1, { side: T3.DoubleSide }), 0, Y + 2.25 + 0.3, 0, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.5, 0.5, 0.3, 6), M("canvasBY", 1.2, 0.5), 0, Y + 2.75, 0, { ry: PI / 6 });
    b.add(new T3.ConeGeometry(0.75, 0.45, 6, 1, true), M("canvasBY", 2, 1, { side: T3.DoubleSide }), 0, Y + 2.9 + 0.225, 0, { ry: PI / 6 });
    windRose(b, 0.03, Y + 3.45, 0.03, 0.8);
    var core = new T3.Group(); b.g.add(core);
    var amber = glowMat("#ffd27a", "#ffa420", 1.7);
    b.add(new T3.CylinderGeometry(0.26, 0.26, 0.55, 6), amber, 0, 0, 0, { parent: core, noCast: true });
    b.add(new T3.ConeGeometry(0.26, 0.32, 6), amber, 0, 0.43, 0, { parent: core, noCast: true });
    b.add(new T3.ConeGeometry(0.26, 0.32, 6), amber, 0, -0.43, 0, { parent: core, rx: PI, noCast: true });
    var sat = new T3.Group(); core.add(sat);
    for (var s = 0; s < 4; s++) { var q = dRing(0.7, s * PI / 2), m = b.add(new T3.OctahedronGeometry(0.09, 0), amber, q[0], 0, q[1], { parent: sat, noCast: true }); m.scale.set(0.8, 1.6, 0.8); }
    var L = new T3.PointLight("#ffb030", 1.9, 5, 2); core.add(L);
    b.fx.push(function (t, dt) { core.position.set(0, Y + 1.1 + Math.sin(t * 1.2) * 0.08, 0); core.rotation.y = t * 0.5; sat.rotation.y -= dt * 1.4; sat.rotation.x = Math.sin(t * 0.5) * 0.3; });
    var ring = new T3.Group(); ring.position.y = Y + 1.9; b.g.add(ring);
    b.add(new T3.TorusGeometry(1.75, 0.025, 6, 6), dark, 0, 0, 0, { parent: ring, rx: PI / 2, rz: PI / 6 });
    for (var r = 0; r < 6; r++) { var p2 = dRing(1.75, r * PI / 3), sg = new T3.Group(); sg.position.set(p2[0], 0, p2[1]); sg.rotation.y = -r * PI / 3 + 0.5; ring.add(sg); b.add(new T3.PlaneGeometry(0.38, 0.55), M("canvasBY", 1, 1, { side: T3.DoubleSide }), 0, 0, 0, { parent: sg }); }
    b.fx.push(function (t, dt) { ring.rotation.y += dt * 0.5; });
    kite(b, -1.9, 1.6, 1.9, 8, 3.8);
  }
  function zAirWorkshop(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.6, 1.2, 2.4, 1.8, -0.3);
    var HX = -0.6, HZ = -0.85, dark = C(BY.black), R = 0.82, L = 2.0;
    b.box(2.9, 0.14, 2.0, M("honeycomb", 2.9, 2.0), HX, 0, HZ); b.box(2.92, 0.03, 2.02, dark, HX, 0.13, HZ);
    var sk = M("skep", 4, 3);
    b.add(new T3.CylinderGeometry(R, R, L, 22, 1, true, 0, PI), sk, HX, 0.16, HZ, { rz: PI / 2 });
    [-1, 1].forEach(function (s2) { b.add(new T3.SphereGeometry(R, 22, 10, 0, PI, 0, PI / 2), M("skep", 3, 2), HX + s2 * L / 2, 0.16, HZ, { ry: s2 * PI / 2 }); });
    for (var a2 = 0; a2 < 7; a2++) { var hot = a2 === 3; b.add(new T3.TorusGeometry(R + 0.015, hot ? 0.035 : 0.022, 5, 22, PI), hot ? glowMat("#ffd060", "#c88a10", 0.5) : dark, HX - 0.9 + a2 * 0.3, 0.16, HZ, { ry: PI / 2 }); }
    hiveDoor(b, HX, 0.16, HZ + R - 0.02, 0, 0.62, 0.36, 0.62);
    b.add(new T3.BoxGeometry(1.7, 0.035, 0.45), M("canvasBY", 1.7, 0.5), HX, 0.98, HZ + 0.98, { rx: 0.45 });
    bigHive(b, HX, HZ, 0.45, 0.8, R + 0.12, { bands: [0.35], cupola: 0.16, rose: 0.5 });
    var MX = 1.55, MZ = -1.45, post = M("plankDark", 0.3, 2);
    b.cyl(0.05, 0.07, 2.6, 8, post, MX, 0, MZ);
    b.beam([MX, 2.45, MZ], [0.55, 2.55, -0.45], 0.03, post); bySail(b, MX, 2.5, MZ, PI / 4, 1.2);
    var hang = new T3.Group(); hang.position.set(0.55, 2.55, -0.45); b.g.add(hang);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 1.0, 4), C("#d8cba6"), 0, -0.5, 0, { parent: hang });
    b.add(new T3.BoxGeometry(0.26, 0.22, 0.26), M("plankWarm", 0.3, 0.3), 0, -1.1, 0, { parent: hang });
    b.fx.push(function (t) { hang.rotation.z = Math.sin(t * 1.1) * 0.06; });
    var BX = 0.85, BZ = 0.85, bal = new T3.Group(); bal.position.set(BX, 0, BZ); bal.rotation.y = PI / 4; bal.scale.set(1.45, 1.45, 1.45); b.g.add(bal);
    [[-0.3, 0.32], [0.3, 0.32], [-0.3, -0.36], [0.3, -0.36]].forEach(function (q) { b.add(new T3.CylinderGeometry(0.13, 0.13, 0.06, 6), M("honeycomb", 0.3, 0.1), q[0], 0.13, q[1], { parent: bal, rz: PI / 2 }); });
    b.add(new T3.BoxGeometry(0.55, 0.12, 0.95), M("plankWarm", 0.5, 0.8), 0, 0.24, 0, { parent: bal });
    b.add(new T3.BoxGeometry(0.57, 0.03, 0.97), dark, 0, 0.31, 0, { parent: bal });
    var head = new T3.Group(); head.position.set(0, 0.5, 0); bal.add(head);
    b.add(new T3.BoxGeometry(0.12, 0.12, 1.15), M("plankDark", 0.2, 1), 0, 0, 0, { parent: head });
    [-1, 1].forEach(function (s) { var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(s * 0.75, 0.12); sh.lineTo(s * 0.6, -0.25); sh.closePath(); b.add(new T3.ShapeGeometry(sh), M("canvasBY", 0.8, 0.5, { side: T3.DoubleSide }), 0, 0.02, 0.25, { parent: head, rx: -PI / 2 }); });
    b.beam([-0.62, 0.02, 0.1], [0, 0.02, -0.5], 0.008, C("#d8cba6"), head); b.beam([0.62, 0.02, 0.1], [0, 0.02, -0.5], 0.008, C("#d8cba6"), head);
    var bolt = b.add(new T3.OctahedronGeometry(0.08, 0), glowMat("#ffd27a", "#ffa420", 2), 0, 0.09, 0.4, { parent: head, noCast: true }); bolt.scale.set(0.8, 0.8, 4);
    b.fx.push(function (t) { head.rotation.y = Math.sin(t * 0.5) * 0.3; head.rotation.x = -0.15 + Math.sin(t * 0.7) * 0.05; });
    var rack = new T3.Group(); rack.position.set(-1.55, 0, 1.0); rack.rotation.y = PI / 4; b.g.add(rack);
    b.add(new T3.BoxGeometry(0.6, 0.06, 0.3), M("plankWarm", 0.5, 0.3), 0, 0.2, 0, { parent: rack });
    [-0.25, 0.25].forEach(function (x) { b.add(new T3.BoxGeometry(0.05, 0.2, 0.05), post, x, 0.1, 0, { parent: rack }); });
    for (var k = 0; k < 4; k++) { var m = b.add(new T3.OctahedronGeometry(0.05, 0), glowMat("#ffd27a", "#ffa420", 1.4), -0.18 + k * 0.12, 0.27, 0, { parent: rack, noCast: true }); m.scale.set(0.8, 0.8, 4); }
    honeyPylon(b, -1.95, 1.85, 1.1); amberFloat(b, 1.9, 1.7, 1.9, 0.7);
    kite(b, -1.9, 2.4, -1.75, 9, 3.7);
    b.banner(-0.35, 2.0, 0, "bannerAir", 1.5);
  }

  /* ---------------- Ravenclaw Arcane ---------------- */
  function zWaterHouse(b) {
    b.slab(3.2, "grassWater", "sideWater");
    var X = -0.2, Z = -0.25;
    blueTerrace(b, X, Z, 1.3, 0.14, 0); pearlTerrace(b, X, Z, 1.08, 0.14, 0.14); pearlTerrace(b, X, Z, 0.88, 0.12, 0.28);
    var rAt = dConch(b, X, Z, 2.35, 0.78, 0.4, 5);
    shellMouth(b, X + Math.cos(PI / 4) * 0.66, 0.4, Z + Math.sin(PI / 4) * 0.66, PI / 4, 0.72);
    glassBubbles(b, X, Z, rAt, 0.4, [[PI / 4 + 0.9, 0.55, 0.1], [PI / 4 - 0.9, 0.65, 0.09], [0.2, 1.1, 0.08], [1.6, 1.4, 0.07]]);
    bronzeRing(b, X, 1.3, Z, rAt(0.9) + 0.15, 10);
    armSphere(b, X, 3.15, Z, 0.42);
    waterRing2(b, X, 1.75, Z, 0.75, 0.3, 0.5);
    b.water(0.55, 0.6, 1.25, 1.3, 0.0, 0.08);
    waterArc(b, X + 0.4, 1.4, Z + 0.3, 0.9, 0.1, 0.95, 0.35, 10);
    shells(b, [[-1.15, 0.9], [1.2, -0.9]]);
  }
  function zWaterFarm(b) {
    rWaterFarm(b);
    var pm = M("pearl", 0.4, 1.5, { color: lin("#f0e2da") });
    [-1.55, -0.55, 0.45].forEach(function (z) { b.box(0.22, 1.45, 0.22, pm, -1.9, 0, z); dConch(b, -1.9, z, 0.45, 0.14, 1.45, 3); });
    [-1.05, -0.05].forEach(function (z) { b.add(new T3.TorusGeometry(0.28, 0.07, 6, 12, PI), pm, -1.9, 1.2, z, { ry: PI / 2 }); });
    b.box(0.3, 0.14, 2.3, M("pearl", 0.3, 2), -1.9, 1.45, -0.55);
    var at = tex("water", 0.3, 1.5);
    b.add(new T3.BoxGeometry(0.18, 0.03, 2.3), new T3.MeshStandardMaterial({ map: at, roughness: 0.1 }), -1.9, 1.6, -0.55, { noCast: true });
    b.fx.push(function (t) { at.offset.y = -t * 0.4; });
    waterArc(b, -1.9, 1.55, 0.6, -1.2, 0.55, 0.9, 0.3, 10);
    armSphere(b, 1.6, 2.75, -1.75, 0.38);
  }
  function zWaterStore(b) {
    rWaterStore(b);
    waterRing2(b, -0.4 + 0.85, 1.9, -0.7 - 0.3, 0.55, 0.25, 0.6);
    armSphere(b, -0.4 + 0.85, 3.25, -0.7 - 0.3, 0.32);
    [[-0.95, 1.6], [-0.05, 1.6]].forEach(function (lp) { b.cyl(0.03, 0.05, 0.8, 8, BRZ(), lp[0], -0.05, lp[1] - 0.3); });
  }
  function zWaterBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater"); b.decal("path", 0.3, 1.4, 2.6, 1.3);
    var HX = -0.35, HZ = -0.7;
    blueTerrace(b, HX, HZ, 1.9, 0.16, 0); pearlTerrace(b, HX, HZ, 1.6, 0.14, 0.16);
    b.box(2.3, 0.7, 1.0, M("pearl", 3, 0.8, { color: lin("#f0e2da") }), HX, 0.3, HZ);
    var g = hullRoof(b, HX, 1.0, HZ, 2.6, 1.25, 0);
    g.children.forEach(function (c) { if (c.geometry && c.geometry.type === "SphereGeometry") c.material = M("pearl", 3, 1.5, { color: lin("#f2dcd2") }); });
    var rAt = dConch(b, HX, HZ, 2.6, 0.62, 1.35, 5);
    armSphere(b, HX, 4.25, HZ, 0.42);
    [-1, 1].forEach(function (s) { var x = HX + s * 1.3; b.cyl(0.34, 0.38, 0.7, 14, M("pearl", 1.5, 0.7), x, 0.3, HZ); dConch(b, x, HZ, 1.7, 0.4, 1.0, 4); glowCrown(b, x, 2.78, HZ, 0.1); });
    waterRing2(b, HX, 2.4, HZ, 0.85, 0.3, 0.5);
    shellMouth(b, HX, 0.3, HZ + 0.52, 0, 0.8);
    [-0.6, 0.6].forEach(function (dx) { porthole(b, HX + dx, 0.72, HZ + 0.51, 0, 1, 0.85); });
    b.box(1.3, 0.16, 0.8, M("pearl", 1.3, 0.3), 1.3, 0, 1.2); b.water(0.7, 0.85, 1.9, 1.55, 0.06, 0.15);
    waveWall(b, -1.75, 0, 1.25, -PI / 2, 0.8);
    b.target(-1.2, 1.7, 0.3); b.target(-0.55, 1.85, 0.2);
    b.banner(HX - 0.75, HZ + 1.35, 0, "bannerWater", 1.6); b.banner(HX + 0.75, HZ + 1.35, 0, "bannerWater", 1.6);
  }
  function zWaterTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var TX = -0.2, TZ = -0.45;
    blueTerrace(b, TX, TZ, 1.0, 0.16, 0); pearlTerrace(b, TX, TZ, 0.82, 0.14, 0.16); pearlTerrace(b, TX, TZ, 0.66, 0.12, 0.3);
    var rAt = dConch(b, TX, TZ, 3.5, 0.62, 0.42, 7);
    shellMouth(b, TX + 0.55 * 0.707, 0.42, TZ + 0.55 * 0.707, PI / 4, 0.6);
    glassBubbles(b, TX, TZ, rAt, 0.42, [[PI / 4 + 0.6, 0.95, 0.08], [PI / 4 - 0.7, 1.5, 0.07], [PI / 4 + 0.2, 2.1, 0.06], [PI / 4 - 0.3, 2.6, 0.05]]);
    bronzeRing(b, TX, 1.65, TZ, rAt(1.23) + 0.18, 10); bronzeRing(b, TX, 2.65, TZ, rAt(2.23) + 0.14, 8);
    armSphere(b, TX, 4.6, TZ, 0.45);
    waterRing2(b, TX, 2.0, TZ, 0.8, 0.25, 0.5); waterRing2(b, TX, 3.0, TZ, 0.55, -0.3, -0.6);
    waveWall(b, 0.65, 0, 0.45, -PI / 2 + 0.4, 0.55);
    b.boat(-0.65, 1.2, -0.2);
  }
  function zWaterPen(b) {
    rWaterPen(b);
    var CX = -0.1, CZ = -0.15;
    waterRing2(b, CX - 0.65, 2.6, CZ - 0.7, 0.55, 0.3, 0.6);
    armSphere(b, CX + 1.4, 2.4, CZ - 1.4, 0.35);
    var bz = BRZ();
    b.cyl(0.04, 0.05, 2.0, 8, bz, CX + 1.4, 0, CZ - 1.4);
  }
  function zWaterSanctum(b) {
    rWaterSanctum(b);
    armSphere(b, -0.5, 2.85, -0.5, 0.55);
    waterRing2(b, -0.5, 1.4, -0.5, 1.35, 0.2, 0.35);
    [[-1.75, 0.6], [0.6, -1.75]].forEach(function (q) { var r = dConch(b, q[0], q[1], 1.9, 0.38, 0.0, 4); glowCrown(b, q[0], 1.98, q[1], 0.1); waterArc(b, q[0], 1.5, q[1], 1.05, 1.25, 1.05, 0.5, 10); });
  }
  function zWaterWorkshop(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var bz = BRZ(), DX = 0.35, DZ = 0.4, pl = M("pearl", 2.6, 0.3, { color: lin("#f0e2da") }), plT = M("pearl", 2.6, 0.4);
    var WL = 3.0, WD = 2.2, T = 0.22, H = 0.42;
    b.box(WL, 0.06, WD, M("pearl", 2.6, 2), DX, 0, DZ);
    [[0, -(WD - T) / 2, WL, T], [0, (WD - T) / 2, WL, T], [-(WL - T) / 2, 0, T, WD - 2 * T], [(WL - T) / 2, 0, T, WD - 2 * T]].forEach(function (w) {
      b.add(new T3.BoxGeometry(w[2], H, w[3]), [pl, pl, plT, pl, pl, pl], DX + w[0], H / 2, DZ + w[1]);
      b.box(w[2] + 0.02, 0.04, w[3] + 0.02, bz, DX + w[0], H, DZ + w[1]);
    });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { var x = DX + c[0] * (WL / 2 - 0.11), z = DZ + c[1] * (WD / 2 - 0.11); b.cyl(0.07, 0.08, 0.22, 10, bz, x, H, z); glowCrown(b, x, H + 0.22, z, 0.06); });
    b.water(DX - WL / 2 + T, DZ - WD / 2 + T, DX + WL / 2 - T, DZ + WD / 2 - T, 0.06, 0.28);
    var barge = new T3.Group(); barge.position.set(DX, 0.22, DZ); b.g.add(barge);
    var sh = new T3.Shape(); sh.moveTo(-1.05, 0); sh.quadraticCurveTo(-0.75, 0.5, 0, 0.5); sh.quadraticCurveTo(0.75, 0.5, 1.05, 0); sh.quadraticCurveTo(0.75, -0.5, 0, -0.5); sh.quadraticCurveTo(-0.75, -0.5, -1.05, 0);
    b.add(new T3.ExtrudeGeometry(sh, { depth: 0.32, bevelEnabled: false }), M("drift", 2, 2), 0, 0, 0, { parent: barge, rx: -PI / 2 });
    b.add(new T3.BoxGeometry(1.6, 0.04, 0.78), M("pearl", 1.5, 0.7), 0, 0.32, 0, { parent: barge });
    b.add(new T3.TorusGeometry(0.4, 0.025, 6, 24), bz, 0, 0.35, 0, { parent: barge, rx: PI / 2 });
    b.add(new T3.ConeGeometry(0.16, 0.5, 12), M("pearl", 0.5, 0.5), -0.95, 0.38, 0, { parent: barge, rz: PI / 2 + 0.4 });
    var gun = new T3.Group(); gun.position.set(0.15, 0.62, 0); barge.add(gun);
    b.add(new T3.CylinderGeometry(0.24, 0.3, 0.22, 14), bz, 0, -0.17, 0, { parent: gun });
    b.add(new T3.CylinderGeometry(0.1, 0.15, 0.95, 14), bz, 0.45, 0.06, 0, { parent: gun, rz: -PI / 2 + 0.25 });
    b.add(new T3.TorusGeometry(0.12, 0.025, 6, 14), bz, 0.88, 0.17, 0, { parent: gun, ry: PI / 2, rx: 0.25 });
    b.add(new T3.SphereGeometry(0.18, 14, 10), glowMat("#e8f8ff", "#58c8ff", 1.6), -0.18, 0.08, 0, { parent: gun, noCast: true });
    b.fx.push(function (t) { gun.rotation.y = Math.sin(t * 0.5) * 0.5; barge.position.y = 0.22 + Math.sin(t * 1.2) * 0.02; });
    var CT = [-1.45, -1.4];
    blueTerrace(b, CT[0], CT[1], 0.55, 0.14, 0);
    b.cyl(0.36, 0.4, 0.5, 14, M("pearl", 1.2, 0.5), CT[0], 0.14, CT[1]);
    var rAt = dConch(b, CT[0], CT[1], 2.5, 0.45, 0.64, 5);
    bronzeRing(b, CT[0], 1.6, CT[1], rAt(0.96) + 0.12, 8);
    armSphere(b, CT[0], 3.55, CT[1], 0.34);
    var arm = new T3.Group(); arm.position.set(CT[0], 2.2, CT[1]); b.g.add(arm);
    b.beam([0, 0, 0], [1.5, 0.15, 1.5], 0.04, bz, arm);
    b.beam([0, 0, 0], [-0.45, -0.1, -0.45], 0.04, bz, arm);
    b.add(new T3.SphereGeometry(0.12, 12, 10), bz, -0.45, -0.1, -0.45, { parent: arm });
    var hook = new T3.Group(); hook.position.set(1.5, 0.15, 1.5); arm.add(hook);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 1.1, 4), C("#d8cba6"), 0, -0.55, 0, { parent: hook });
    b.add(new T3.TorusGeometry(0.08, 0.02, 6, 12), bz, 0, -1.12, 0, { parent: hook });
    b.fx.push(function (t) { arm.rotation.y = Math.sin(t * 0.35) * 0.3; hook.rotation.x = Math.sin(t * 1.3) * 0.06; });
    waveWall(b, 1.9, 0.0, -1.0, PI, 0.6);
    b.barrel(-1.75, 0.55); b.barrel(-1.55, 0.75); b.banner(1.95, 1.85, 0, "bannerWater", 1.5);
  }

  /* ---------------- Gryffindor Arcane ---------------- */
  function zFireHouse(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var X = -0.2, Z = -0.25;
    dFrustum(b, X, 0, Z, 1.3, 1.2, 0.14, M("basalt", 2, 0.2));
    magmaMoat(b, X, Z, 1.15, 0.15);
    var Y = stepped(b, X, Z, [[1.05, 0.9, 0.6], [0.78, 0.64, 0.45], [0.56, 0.44, 0.38], [0.4, 0.3, 0.3]], 0.14);
    fireCrown(b, X, Y, Z, 0.75); haloG(b, X, Y + 1.0, Z, 0.32);
    forgeGate(b, X, 0.14, Z + 0.97 * 0.707 + 0.02, 0, 0.32, 0.48, 0.75);
    obelisk(b, X + 0.9, Z - 0.9, 2.1, 0); dSmoke(b, X + 0.9, 2.4, Z - 0.9, 4);
    lionStatue(b, 0.95, 0.95, 0, PI / 4, 0.55);
  }
  function zFireFarm(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var bas = M("basalt", 3, 0.3), gold = REDGOLD();
    [[1.15, 0.0, 0.0], [0.3, 0.22, 0.85], [-0.55, 0.44, 0.85]].forEach(function (r, i) {
      b.box(3.2 - i * 0.2, r[1] + 0.06, 0.85, bas, 0.3, 0, r[0]); b.box(3.22 - i * 0.2, 0.03, 0.87, gold, 0.3, r[1] + 0.06, r[0]);
      b.box(3.0 - i * 0.2, 0.04, 0.7, M("soil", 3, 0.7), 0.3, r[1] + 0.06, r[0]);
      b.lift(r[1] + 0.1, function () { this.wheat(-1.15 + i * 0.1, r[0] - 0.3, 1.75 - i * 0.1, r[0] + 0.3, 2, 9, ["#e8b83a", "#d8a030", "#f2cc5a"]); });
    });
    var lava = dGlow("#ffb060", "#ff4a10", 1.5);
    b.box(0.08, 0.02, 2.6, lava, 1.95, 0.02, 0.3, { noCast: true }); b.fx.push(function (t) { lava.emissiveIntensity = 1.3 + Math.sin(t * 2) * 0.4; });
    [[-1.6, -1.65], [1.6, -1.65]].forEach(function (g) { var Y = stepped(b, g[0], g[1], [[0.55, 0.45, 0.6], [0.4, 0.3, 0.5], [0.28, 0.2, 0.4]], 0); fireCrown(b, g[0], Y, g[1], 0.5); haloG(b, g[0], Y + 0.7, g[1], 0.22); });
    [[1.95, 1.95], [-1.4, 1.95]].forEach(function (p) { obelisk(b, p[0], p[1], 1.3, 0); });
    b.scarecrow(0.3, 1.15, "#b3261e");
  }
  function zFireStore(b) {
    b.slab(3.2, "grassFire", "sideFire");
    b.box(2.9, 0.1, 2.9, M("basalt", 2.6, 2.6), 0, 0, 0);
    [[-1.4, 1.4, -1.4, -1.4], [-1.4, -1.4, 1.4, -1.4], [1.4, -1.4, 1.4, 0.4]].forEach(function (w) { var len = Math.hypot(w[2] - w[0], w[3] - w[1]); b.box(len, 0.45, 0.2, M("basalt", len, 0.4), (w[0] + w[2]) / 2, 0.1, (w[1] + w[3]) / 2, { ry: -Math.atan2(w[3] - w[1], w[2] - w[0]) }); spikeRing(b, 0, 0, 1.4, 0.55, 4); });
    var X = -0.45, Z = -0.45;
    var Y = stepped(b, X, Z, [[0.82, 0.7, 0.7], [0.6, 0.48, 0.45], [0.42, 0.3, 0.35]], 0.1);
    dFrustum(b, X, Y, Z, 0.3, 0.04, 0.3, M("ironPlate", 1, 1));
    forgeGate(b, X, 0.1, Z + 0.76 * 0.707 + 0.02, 0, 0.38, 0.5, 0.6);
    var FX = 0.7, FZ = -0.65;
    dFrustum(b, FX, 0.1, FZ, 0.5, 0.3, 1.7, M("basalt", 1, 1.4));
    fireCrown(b, FX, 1.8, FZ, 0.75); haloG(b, FX, 2.65, FZ, 0.3); dSmoke(b, FX, 2.4, FZ, 5);
    var pour = dGlow("#ffd080", "#ff8a10", 2.2);
    b.box(0.08, 0.02, 0.7, pour, FX, 0.42, FZ + 0.65, { rx: 0.35, noCast: true });
    b.add(new T3.CylinderGeometry(0.28, 0.28, 0.03, 4), pour, FX, 0.13, FZ + 1.1, { ry: PI / 4, noCast: true });
    var gb = C("#f2c040", { metalness: 0.85, roughness: 0.3 });
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3 - r; c++) b.box(0.15, 0.06, 0.3, gb, -0.3 + c * 0.16 + r * 0.08, 0.1 + 0.06 * r, 1.05);
  }
  function zFireBarracks(b) {
    b.slab(4.2, "grassFire", "sideFire");
    b.box(4.0, 0.1, 4.0, M("basalt", 3.6, 3.6), 0, 0, 0);
    var bas = M("basalt", 3, 0.6);
    [[-1.9, 1.9, -0.45, 1.9], [0.45, 1.9, 1.9, 1.9], [1.9, 1.9, 1.9, -1.9], [1.9, -1.9, -1.9, -1.9], [-1.9, -1.9, -1.9, 1.9]].forEach(function (w) { var len = Math.hypot(w[2] - w[0], w[3] - w[1]), ry = -Math.atan2(w[3] - w[1], w[2] - w[0]); b.box(len + 0.2, 0.6, 0.24, bas, (w[0] + w[2]) / 2, 0.1, (w[1] + w[3]) / 2, { ry: ry }); var n = Math.round(len / 0.28); for (var k = 0; k <= n; k++) { var t = k / n; b.add(new T3.ConeGeometry(0.035, 0.18, 4), M("iron"), w[0] + (w[2] - w[0]) * t, 0.79, w[1] + (w[3] - w[1]) * t); } });
    [[-1.9, 1.9], [1.9, 1.9], [1.9, -1.9], [-1.9, -1.9]].forEach(function (p, i) { obelisk(b, p[0], p[1], i < 2 ? 1.5 : 2.2, 0.1); });
    var HX = -0.3, HZ = -0.55, gold = REDGOLD(), Y = 0.1;
    [[2.3, 1.4, 0.85], [1.75, 1.0, 0.55], [1.2, 0.65, 0.45]].forEach(function (t) { b.box(t[0], t[2], t[1], bas, HX, Y, HZ); b.box(t[0] + 0.06, 0.06, t[1] + 0.06, gold, HX, Y + t[2] - 0.05, HZ); for (var k = -3; k <= 3; k++) b.add(new T3.ConeGeometry(0.035, 0.18, 4), M("iron"), HX + k * t[0] / 7, Y + t[2] + 0.09, HZ + t[1] / 2); Y += t[2]; });
    fireCrown(b, HX, Y, HZ, 0.65); haloG(b, HX, Y + 0.9, HZ, 0.3);
    forgeGate(b, HX, 0.1, HZ + 0.71, 0, 0.45, 0.65, 0.9);
    lionStatue(b, HX - 0.5, HZ + 1.15, 0.1, 0, 0.6); lionStatue(b, HX + 0.5, HZ + 1.15, 0.1, 0, 0.6);
    b.target(1.15, 1.2, 0.5); b.target(1.4, 0.55, 0.7); b.dummy(-1.3, 1.25, 0.3);
    b.banner(-0.05, 2.15, 0, "bannerFire", 1.5);
  }
  function zFireTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    dFrustum(b, 0, 0, 0, 1.2, 1.1, 0.22, M("basalt", 2, 0.2));
    magmaMoat(b, 0, 0, 1.0, 0.23);
    var Y = stepped(b, 0, 0, [[0.85, 0.68, 1.3], [0.62, 0.5, 1.0], [0.48, 0.38, 0.7]], 0.22);
    dFrustum(b, 0, Y, 0, 0.42, 0.66, 0.25, M("basalt", 1, 0.3));
    dFrustum(b, 0, Y + 0.25, 0, 0.67, 0.66, 0.05, REDGOLD());
    spikeRing(b, 0, 0, 0.66 * 0.707, Y + 0.3, 2);
    fireCrown(b, 0, Y + 0.3, 0, 1.0); haloG(b, 0, Y + 1.5, 0, 0.42);
    var bal = new T3.Group(); bal.position.set(0.55, 1.6, 0.0); b.g.add(bal);
    b.add(new T3.BoxGeometry(0.5, 0.06, 0.4), M("basalt", 0.5, 0.4), 0.15, 0, 0, { parent: bal });
    var bw = new T3.Group(); bw.position.set(0.2, 0.12, 0); bal.add(bw);
    b.add(new T3.BoxGeometry(0.08, 0.08, 0.5), M("plankDark", 0.2, 0.5), 0, 0, 0, { parent: bw });
    [-1, 1].forEach(function (s) { b.beam([0, 0, 0.15], [s * 0.25, 0, 0.0], 0.015, M("iron"), bw); });
    b.fx.push(function (t) { bw.rotation.y = Math.sin(t * 0.6) * 0.7; });
    forgeGate(b, 0, 0.22, 0.8 * 0.707 + 0.02, 0, 0.3, 0.48, 0.7);
    obelisk(b, -1.1, 1.0, 1.1, 0);
  }
  function zFirePen(b) {
    gFirePen(b);
    haloG(b, 0.15, 2.2, -0.35, 0.35);
    magmaMoat(b, 0.15, -0.35, 1.45, 0.1);
    [[-1.85, -1.85], [1.75, -1.85]].forEach(function (q) { obelisk(b, q[0], q[1], 2.0, 0.85); });
  }
  function zFireSanctum(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var bas = M("basalt", 3, 0.4), gold = REDGOLD();
    magmaMoat(b, 0, 0, 1.85, 0.02);
    var Y = stepped(b, 0, 0, [[2.5, 2.3, 0.3], [2.05, 1.85, 0.3], [1.65, 1.45, 0.3], [1.25, 1.05, 0.3]], 0);
    for (var s = 0; s < 8; s++) b.box(0.75, 0.15 * (s + 1) - 0.02, 0.16, M("basalt", 0.7, 0.2), 0, 0, 1.8 - s * 0.1);
    [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(function (q) { dFrustum(b, q[0], Y, q[1], 0.12, 0.1, 1.3, bas); dFrustum(b, q[0], Y + 0.6, q[1], 0.115, 0.11, 0.05, gold); });
    dFrustum(b, 0, Y + 1.3, 0, 0.72, 0.68, 0.1, bas); dFrustum(b, 0, Y + 1.4, 0, 0.7, 0.05, 0.45, M("ironPlate", 1.2, 1));
    spikeRing(b, 0, 0, 0.68 * 0.707, Y + 1.4, 2);
    dFrustum(b, 0, Y, 0, 0.3, 0.24, 0.25, bas);
    fireCrown(b, 0, Y + 0.25, 0, 0.9);
    haloG(b, 0, Y + 2.1, 0, 0.45); haloG(b, 0, Y + 2.4, 0, 0.3);
    lionStatue(b, -0.6, 1.6, 0.3, 0, 0.6); lionStatue(b, 0.6, 1.6, 0.3, 0, 0.6);
    [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]].forEach(function (p, i) { obelisk(b, p[0], p[1], i < 2 ? 2.3 : 1.4, 0); });
  }
  function zFireWorkshop(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.4, 1.0, 2.6, 2.2);
    var HX = -0.9, HZ = -1.0;
    magmaMoat(b, HX, HZ, 1.5, 0.02);
    dFrustum(b, HX, 0, HZ, 1.42, 1.38, 0.1, M("basalt", 2, 0.2));
    var Y = stepped(b, HX, HZ, [[1.25, 1.1, 0.85], [0.9, 0.75, 0.5]], 0.1);
    dFrustum(b, HX, Y, HZ, 0.72, 0.05, 0.4, M("ironPlate", 1, 1));
    forgeGate(b, HX, 0.1, HZ + 1.2 * 0.707 + 0.02, 0, 0.55, 0.62, 0.8);
    [[-0.85, -0.85], [0.85, -0.85]].forEach(function (c) { obelisk(b, HX + c[0], HZ + c[1], 2.4, 0); dSmoke(b, HX + c[0], 2.8, HZ + c[1], 4); });
    var TX = 0.95, TZ = 1.0, tr = new T3.Group(); tr.position.set(TX, 0, TZ); tr.rotation.y = 3 * PI / 4 - 0.15; tr.scale.set(1.3, 1.3, 1.3); b.g.add(tr);
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
    [[-0.3, 0.0], [-0.15, 0.12], [-0.05, -0.1]].forEach(function (q) { b.add(new T3.SphereGeometry(0.1, 10, 8), dGlow("#ff9a50", "#d83a08", 1.1), 1.75 + q[0], 0.1, -0.35 + q[1], { noCast: true }); });
    lionStatue(b, -1.85, 1.55, 0, PI / 4, 0.6);
    b.banner(0.0, 2.0, 0, "bannerFire", 1.5);
  }

  var ARCB = {
    air: [zAirHouse, zAirFarm, zAirStore, zAirBarracks, zAirTower, zAirPen, zAirSanctum, zAirWorkshop],
    water: [zWaterHouse, zWaterFarm, zWaterStore, zWaterBarracks, zWaterTower, zWaterPen, zWaterSanctum, zWaterWorkshop],
    fire: [zFireHouse, zFireFarm, zFireStore, zFireBarracks, zFireTower, zFirePen, zFireSanctum, zFireWorkshop]
  };
