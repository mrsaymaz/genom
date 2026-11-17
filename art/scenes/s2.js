
  /* ================= SLYTHERIN: Dark = earth & sod, Mythic = living wood, Arcane = megaliths & emerald ================= */
  function RSTONE(rx, ry) { return M("stoneGrey", rx || 1, ry || 1.5, { color: lin("#a9b2a6"), flatShading: true }); }
  function runeG(k) { return glowMat("#c8ffd8", "#30e070", k || 1.4); }
  function CRYS() { return new T3.MeshStandardMaterial({ color: lin("#6affa8"), emissive: lin("#12b860"), emissiveIntensity: 0.95, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.88, flatShading: true }); }
  function crystals(b, x, y, z, s, n, big) {
    var m = CRYS(), g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); b.g.add(g);
    var main = b.add(new T3.ConeGeometry(0.18, big || 1.0, 6), m, 0, (big || 1.0) / 2, 0, { parent: g, noCast: true });
    for (var i = 0; i < n; i++) { var a = i / n * 2 * PI + 0.4, h = 0.35 + (i % 3) * 0.15, t = 0.45 + (i % 2) * 0.15; b.add(new T3.ConeGeometry(0.09, h, 6), m, Math.cos(a) * 0.14, h * 0.4, Math.sin(a) * 0.14, { parent: g, rz: -Math.cos(a) * t, rx: Math.sin(a) * t, noCast: true }); }
    g.add(new T3.PointLight("#5aff9a", 0.9 * s, 3.5 * s, 2));
    b.fx.push(function (t) { m.emissiveIntensity = 0.85 + Math.sin(t * 1.5 + x) * 0.2; });
    return g;
  }
  function slab4(b, x, y, z, w, h, d, ry, mat) { var g = new T3.BoxGeometry(w, h, d, 2, 1, 2); rough(g, 0.12, x * 7 + z * 3); return b.add(g, mat || RSTONE(w, h), x, y + h / 2, z, { ry: ry || 0 }); }
  function megaRing(b, x, z, r, h, y0, n, mat) { b.add(rough(new T3.CylinderGeometry(r, r + 0.06, h, n || 10, 1), 0.05, r * 9), mat || RSTONE(r * 3, h * 2), x, (y0 || 0) + h / 2, z); }

  /* ---------------- Slytherin MYTHIC (new barracks, tower) ---------------- */
  function smBarracks(b) {
    b.slab(4.2, "grassEarth", "sideEarth"); b.decal("path", 0.4, 1.25, 2.6, 1.6);
    var HX = -0.35, HZ = -0.7, bark = M("barkTree", 0.6, 3), L = 3.0, R = 0.82;
    b.box(L + 0.3, 0.22, 1.9, RSTONE(3, 0.3), HX, 0, HZ);
    var leafA = C("#2f6f3c", { flatShading: true, roughness: 0.9, side: T3.DoubleSide }), leafB = C("#3b8048", { flatShading: true, roughness: 0.9 });
    var vault = new T3.CylinderGeometry(R, R, L, 20, 4, true, 0, PI); rough(vault, 0.1, 3);
    b.add(vault, leafA, HX, 0.22, HZ, { rz: PI / 2 });
    for (var i = 0; i <= 8; i++) b.add(new T3.TorusGeometry(R + 0.03, 0.06, 6, 16, PI), bark, HX - L / 2 + i * L / 8, 0.22, HZ, { ry: PI / 2 });
    var cross = new T3.CylinderGeometry(1.05, 1.05, 1.7, 20, 3, true, 0, PI); rough(cross, 0.1, 5);
    b.add(cross, leafA, HX, 0.22, HZ, { rx: PI / 2, ry: PI / 2, rz: PI / 2 });
    [-0.55, 0, 0.55].forEach(function (dz) { b.add(new T3.TorusGeometry(1.08, 0.07, 6, 16, PI), bark, HX, 0.22, HZ + dz); });
    [[-1, 0], [1, 0]].forEach(function (q) { b.add(new T3.SphereGeometry(R, 16, 8, 0, PI, 0, PI), leafA, HX + q[0] * L / 2, 0.22, HZ, { ry: q[0] > 0 ? 0 : PI, rz: PI / 2 }); });
    for (var c = 0; c < 9; c++) { var cx = HX - 1.3 + c * 0.33; b.add(new T3.IcosahedronGeometry(0.2 + (c % 3) * 0.05, 0), c % 2 ? leafB : leafA, cx, 0.22 + R + 0.02, HZ + (c % 2 ? 0.12 : -0.1)); }
    for (var k = 0; k < 6; k++) { var a = k / 6 * 2 * PI; b.beam([HX + Math.cos(a) * 0.5, 1.15, HZ + Math.sin(a) * 0.5], [HX, 1.85, HZ], 0.05, bark); }
    b.add(new T3.OctahedronGeometry(0.13, 0), runeG(1.8), HX, 1.95, HZ, { noCast: true }).scale.set(1, 1.6, 1);
    trilithon(b, HX, HZ + 1.15, PI / 2, 1.0, 0.7);
    archDoor(b, HX, HZ + 1.02, 0, 0.42, 0.45, 0.22);
    var thorn = C("#3a4a22", { flatShading: true }), thorn2 = C("#5a3d24", { flatShading: true });
    for (var t = 0; t < 22; t++) { var ta = -0.2 + t / 21 * 1.9, tr = 2.5, x = HX + Math.cos(ta) * tr, z = HZ + Math.sin(ta) * tr; if (Math.abs(ta - 0.85) < 0.22) continue; var h = 0.45 + b.rand() * 0.25; b.add(new T3.ConeGeometry(0.07, h, 4), t % 2 ? thorn : thorn2, x, h / 2, z, { rz: Math.cos(ta) * 0.35, rx: -Math.sin(ta) * 0.35 }); }
    b.banner(HX - 0.9, HZ + 1.3, 0, "bannerEarth", 1.5); b.banner(HX + 0.9, HZ + 1.3, 0, "bannerEarth", 1.5);
    b.target(0.95, 1.45, 0.4); b.target(1.45, 0.85, 0.6);
    b.mushrooms([[-1.9, 1.2], [-1.75, 1.35]], capGlow());
  }
  function smTower(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    megaRing(b, 0, 0, 0.85, 0.16, 0, 9);
    var bark = M("barkTree", 0.6, 4), H = 2.75;
    for (var k = 0; k < 3; k++) {
      var pts = [];
      for (var s = 0; s <= 24; s++) { var t = s / 24, a = k * 2 * PI / 3 + t * PI * 2.2, r = 0.3 - t * 0.17; pts.push(new T3.Vector3(Math.cos(a) * r, 0.1 + t * H, Math.sin(a) * r)); }
      b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 60, 0.15 - k * 0.012, 8, false), bark, 0, 0, 0);
    }
    rootsAround(b, 0, 0, 0.32, 1.05, 0.45, 7, PI / 4);
    archDoor(b, 0.33, 0.33, PI / 4, 0.22, 0.3, 0.16);
    var NY = H - 0.1;
    b.add(new T3.CylinderGeometry(0.62, 0.48, 0.1, 10), M("plankWarm", 1.5, 1.5), 0, NY, 0);
    for (var p = 0; p < 10; p++) { var pa = p / 10 * 2 * PI; b.beam([Math.cos(pa) * 0.6, NY, Math.sin(pa) * 0.6], [Math.cos(pa + 0.25) * 0.62, NY + 0.32, Math.sin(pa + 0.25) * 0.62], 0.02, bark); }
    b.add(new T3.TorusGeometry(0.62, 0.03, 6, 30), bark, 0, NY + 0.3, 0, { rx: PI / 2 });
    for (var q = 0; q < 3; q++) { var qa = q * 2 * PI / 3 + 0.5; b.beam([Math.cos(qa) * 0.5, NY + 0.05, Math.sin(qa) * 0.5], [Math.cos(qa) * 0.15, NY + 0.75, Math.sin(qa) * 0.15], 0.035, bark); }
    canopyAt(b, 0, NY + 0.55, 0, 0.62);
    var lan = b.add(new T3.OctahedronGeometry(0.08, 0), runeG(1.8), 0.35, NY - 0.3, 0.35, { noCast: true }); lan.scale.set(1, 1.5, 1);
    b.beam([0.35, NY - 0.2, 0.35], [0.35, NY, 0.35], 0.005, C("#3a2a1a"));
    b.mushrooms([[-1.1, 0.95], [-0.95, 1.1]], capGlow()); b.rock(1.1, -1.0, 0.14, "#8f9694");
  }

  /* ---------------- Slytherin ARCANE: megaliths & emerald ---------------- */
  function asHouse(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var X = -0.2, Z = -0.2, st = RSTONE();
    megaRing(b, X, Z, 1.2, 0.18, 0, 9);
    [[-0.48, -0.4], [0.48, -0.4], [-0.48, 0.4], [0.48, 0.4]].forEach(function (q, i) { slab4(b, X + q[0], 0.18, Z + q[1], 0.3, 1.2, 0.36, 0.1 * i, st); });
    b.box(0.7, 1.05, 0.6, C("#24301f"), X, 0.18, Z);
    slab4(b, X, 1.38, Z, 1.65, 0.24, 1.35, 0.15, st);
    b.add(new T3.BoxGeometry(1.5, 0.05, 1.2), C("#3b7a3e", { flatShading: true }), X, 1.64, Z, { ry: 0.15 });
    archDoor(b, X + 0.18, Z + 0.42, 0, 0.3, 0.42, 0.18);
    [[-0.48, 0.4], [0.48, 0.4]].forEach(function (q) { b.box(0.04, 0.5, 0.02, runeG(), X + q[0], 0.55, Z + q[1] + 0.19, { noCast: true }); });
    rootsAround(b, X, Z, 0.7, 1.35, 1.45, 6, PI / 4);
    crystals(b, X - 0.1, 1.66, Z - 0.1, 0.9, 6, 0.95);
    orbitStones(b, X, 2.25, Z, 0.95, 4, 0.8);
    b.mushrooms([[-1.2, 0.9], [-1.05, 1.05], [1.05, -1.1]], capGlow());
  }
  function asFarm(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var soil = M("soil", 2, 2), leafs = ["#3f8a4c", "#5fae6a", "#2f6f3c"];
    [[1.9, 0.18], [1.4, 0.36], [0.9, 0.54]].forEach(function (q, i) {
      megaRing(b, 0, 0, q[0], q[1], 0, 14);
      b.add(new T3.CylinderGeometry(q[0] - 0.08, q[0] - 0.08, 0.02, 28), soil, 0, q[1] + 0.01, 0);
      var n = [22, 15, 9][i], rr = q[0] - 0.24;
      for (var k = 0; k < n; k++) { var a = k / n * 2 * PI, x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (k % 3 === 0) b.add(new T3.ConeGeometry(0.04, 0.42, 5), C("#5a9a3a", { flatShading: true }), x, q[1] + 0.21, z); else b.add(new T3.IcosahedronGeometry(0.11, 0), C(leafs[k % 3], { flatShading: true }), x, q[1] + 0.1, z); }
    });
    b.add(new T3.CylinderGeometry(0.32, 0.4, 0.3, 6), RSTONE(), 0, 0.69, 0);
    b.add(new T3.TorusGeometry(0.36, 0.03, 6, 20), runeG(), 0, 0.84, 0, { rx: PI / 2, noCast: true });
    crystals(b, 0, 0.84, 0, 1.25, 7, 1.6);
    orbitStones(b, 0, 2.1, 0, 1.15, 5, 0.9);
    trilithon(b, 1.55, 1.55, PI / 4, 1.0, 0.75);
    b.mushrooms([[-1.95, 1.2], [1.2, -1.95]], capGlow());
  }
  function asStore(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var X = -0.25, Z = -0.25, R = 1.05;
    megaRing(b, X, Z, 1.25, 0.14, 0, 9);
    var shell = new T3.SphereGeometry(R, 18, 10, PI * 0.95, PI * 1.55, 0, PI / 2); rough(shell, 0.12, 4);
    b.add(shell, M("stoneGrey", 2, 1.5, { color: lin("#8f9690"), flatShading: true, side: T3.DoubleSide }), X, 0.14, Z);
    var inner = new T3.SphereGeometry(R - 0.12, 18, 10, PI * 0.95, PI * 1.55, 0, PI / 2);
    b.add(inner, C("#1f3a28", { side: T3.BackSide, emissive: lin("#0a3018"), emissiveIntensity: 0.6 }), X, 0.14, Z);
    var cm = CRYS();
    for (var i = 0; i < 26; i++) {
      var ph = PI * 0.95 + 0.15 + b.rand() * (PI * 1.55 - 0.3), th = 0.15 + b.rand() * 1.2, rr = R - 0.14;
      var px = -Math.cos(ph) * Math.sin(th) * rr, py = Math.cos(th) * rr, pz = Math.sin(ph) * Math.sin(th) * rr;
      var c = b.add(new T3.ConeGeometry(0.06, 0.28 + b.rand() * 0.2, 6), cm, X + px, 0.14 + py, Z + pz, { noCast: true });
      c.lookAt(X, 0.14 + 0.2, Z); c.rotateX(PI / 2);
    }
    var L = new T3.PointLight("#5aff9a", 1.4, 3.5, 2); L.position.set(X, 0.6, Z); b.g.add(L);
    b.lift(0.14, function () { this.gold(X - 0.1, Z + 0.05); this.sack(X + 0.3, Z - 0.25, 0, "#c9a86a"); this.crate(X - 0.35, Z - 0.35, 0.24, 0.3); });
    rootsAround(b, X, Z, 0.5, 1.35, 1.1, 6, PI / 4);
    crystals(b, X - 0.15, 0.14 + R - 0.08, Z - 0.15, 0.75, 6, 0.9);
    var cap = new T3.Group(); b.g.add(cap);
    b.add(new T3.ConeGeometry(0.28, 0.32, 4), RSTONE(), 0, 0, 0, { parent: cap, rx: PI });
    b.add(new T3.BoxGeometry(0.03, 0.14, 0.02), runeG(), 0.12, 0.02, 0.12, { parent: cap, ry: PI / 4, noCast: true });
    b.fx.push(function (t) { cap.position.set(X - 0.15, 1.95 + Math.sin(t * 1.1) * 0.08, Z - 0.15); cap.rotation.y = t * 0.4; });
    [0, 1, 2].forEach(function (s) { slab4(b, X + 0.95 + s * 0.12, 0, Z + 0.95 + s * 0.12, 0.6, 0.12 - s * 0.035, 0.3, PI / 4, RSTONE()); });
  }
  function asBarracks(b) {
    b.slab(4.2, "grassEarth", "sideEarth"); b.decal("path", 0.5, 1.3, 2.4, 1.4);
    var HX = -0.55, HZ = -0.75, st = RSTONE(), N = 5, step = 0.62;
    b.box(N * step + 0.6, 0.16, 1.6, RSTONE(3, 0.3), HX + 0.2, 0, HZ);
    for (var i = 0; i < N; i++) {
      var x = HX - (N - 1) * step / 2 + 0.2 + i * step, h = 1.35 + (i === 2 ? 0.35 : 0);
      [-0.5, 0.5].forEach(function (dz) { slab4(b, x, 0.16, HZ + dz, 0.3, h, 0.22, 0.05 * i, st); b.box(0.04, h * 0.45, 0.02, runeG(), x, 0.16 + h * 0.25, HZ + dz + 0.12, { noCast: true }); });
      slab4(b, x, 0.16 + h, HZ, 0.42, 0.22, 1.4, 0.03 * i, st);
    }
    b.add(new T3.BoxGeometry(N * step - 0.2, 0.9, 0.7), C("#1c2a1c"), HX + 0.2, 0.62, HZ, {});
    archDoor(b, HX + 0.2, HZ + 0.62, 0, 0.42, 0.5, 0.16);
    var EX = HX + (N - 1) * step / 2 + 0.75, EZ = HZ - 0.15;
    b.add(rough(new T3.CylinderGeometry(0.16, 0.34, 2.6, 4, 2), 0.1, 6), st, EX, 1.3, EZ, { ry: PI / 4 });
    b.add(new T3.BoxGeometry(0.04, 1.6, 0.02), runeG(1.6), EX + 0.17, 1.2, EZ + 0.17, { ry: PI / 4, noCast: true });
    crystals(b, EX, 2.55, EZ, 0.8, 5, 0.9);
    var thorn = C("#3a4a22", { flatShading: true }), thorn2 = C("#5a3d24", { flatShading: true });
    for (var t = 0; t < 26; t++) { var ta = -0.25 + t / 25 * 1.95, tr = 2.5, x2 = HX + 0.3 + Math.cos(ta) * tr, z2 = HZ + 0.1 + Math.sin(ta) * tr; if (Math.abs(ta - 0.85) < 0.2) continue; var hh = 0.5 + b.rand() * 0.3; b.add(new T3.ConeGeometry(0.07, hh, 4), t % 2 ? thorn : thorn2, x2, hh / 2, z2, { rz: Math.cos(ta) * 0.35, rx: -Math.sin(ta) * 0.35 }); }
    orbitStones(b, HX + 0.2, 2.45, HZ, 0.9, 4, 0.8);
    b.banner(HX - 0.6, HZ + 1.25, 0, "bannerEarth", 1.5); b.banner(HX + 1.0, HZ + 1.25, 0, "bannerEarth", 1.5);
    b.target(1.1, 1.45, 0.4); b.target(1.6, 0.9, 0.6);
  }
  function asTower(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var st = RSTONE(1, 3);
    megaRing(b, 0, 0, 0.95, 0.18, 0, 8); megaRing(b, 0, 0, 0.7, 0.18, 0.18, 8);
    var H = 2.9, Y0 = 0.36;
    b.add(rough(new T3.CylinderGeometry(0.2, 0.44, H, 4, 4), 0.06, 8), st, 0, Y0 + H / 2, 0, { ry: PI / 4 });
    [0.25, 0.5, 0.75].forEach(function (f) { var r = 0.44 - 0.24 * f + 0.03; b.add(new T3.CylinderGeometry(r, r, 0.05, 4, 1, true), runeG(1.5), 0, Y0 + H * f, 0, { ry: PI / 4, noCast: true }); });
    b.add(new T3.BoxGeometry(0.05, H * 0.55, 0.02), runeG(1.6), 0.0, Y0 + H * 0.4, 0.3, { noCast: true });
    b.add(new T3.BoxGeometry(0.02, H * 0.55, 0.05), runeG(1.6), 0.3, Y0 + H * 0.4, 0.0, { noCast: true });
    rootsAround(b, 0, 0, 0.42, 0.95, 0.5, 6, PI / 4);
    archDoor(b, 0.31, 0.31, PI / 4, 0.2, 0.3, 0.36);
    var cap = new T3.Group(); b.g.add(cap);
    b.add(new T3.ConeGeometry(0.3, 0.42, 4), st, 0, 0, 0, { parent: cap, ry: PI / 4 });
    b.add(new T3.ConeGeometry(0.3, 0.2, 4), st, 0, -0.31, 0, { parent: cap, ry: PI / 4, rx: PI });
    b.fx.push(function (t) { cap.position.set(0, Y0 + H + 0.55 + Math.sin(t * 1.2) * 0.06, 0); cap.rotation.y = t * 0.5; });
    crystals(b, 0, Y0 + H + 0.82, 0, 0.6, 5, 0.8);
    orbitStones(b, 0, 2.0, 0, 0.85, 4, 0.75);
    b.mushrooms([[-1.1, 0.95], [-0.95, 1.1]], capGlow());
  }
  function asPen(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var CX = -0.1, CZ = -0.1, st = RSTONE(3, 0.6);
    [[1.95, 0.6], [1.6, 0.42], [1.25, 0.24]].forEach(function (q) { megaRing(b, CX, CZ, q[0], q[1], 0, 18, st); });
    b.add(new T3.CylinderGeometry(1.15, 1.15, 0.02, 28), C("#2f5a2c", { flatShading: true }), CX, 0.25, CZ);
    for (var k = 0; k < 8; k++) { var a = k / 8 * 2 * PI + PI / 8, p = onRing(1.95, a); if (Math.abs(a - PI / 4) < 0.5) continue; slab4(b, CX + p[0], 0.6, CZ + p[1], 0.22, 0.75, 0.22, a, RSTONE()); b.box(0.03, 0.3, 0.02, runeG(), CX + p[0] * 1.06, 0.95, CZ + p[1] * 1.06, { ry: -a + PI / 2, noCast: true }); }
    b.add(new T3.CylinderGeometry(0.22, 0.3, 0.35, 6), RSTONE(), CX - 0.3, 0.42, CZ - 0.3);
    crystals(b, CX - 0.3, 0.6, CZ - 0.3, 1.2, 7, 1.4);
    b.lift(0.26, function () { this.serpent(CX + 0.25, CZ + 0.2, 1.05, -0.6); });
    var gp = onRing(1.95, PI / 4);
    trilithon(b, CX + gp[0], CZ + gp[1], PI / 4, 1.2, 0.8);
    orbitStones(b, CX - 0.3, 2.3, CZ - 0.3, 0.8, 4, 0.75);
    b.banner(1.95, -0.9, 0, "bannerEarth", 1.5);
  }
  function asSanctum(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var st = RSTONE(2, 1);
    b.add(new T3.RingGeometry(1.9, 1.98, 64), runeG(1.4), 0, 0.015, 0, { rx: -PI / 2, noCast: true });
    for (var k = 0; k < 22; k++) { var a = k / 22 * 2 * PI, p = onRing(1.62, a); if (Math.abs(a - PI / 4) < 0.25) continue; slab4(b, p[0], 0, p[1], 0.32, 0.38, 0.22, -a, st); }
    var mound = new T3.SphereGeometry(1.5, 28, 12, 0, 2 * PI, 0, PI / 2); rough(mound, 0.06, 2);
    b.add(mound, M("grassEarth", 2, 2), 0, 0, 0, { s: [1, 0.5, 1] });
    slab4(b, 1.1, 0, 1.1, 0.65, 0.5, 0.35, -PI / 4, st);
    archDoor(b, 1.02, 1.02, PI / 4, 0.32, 0.36, 0.0);
    var bark = M("barkTree", 0.6, 4);
    for (var r = 0; r < 4; r++) {
      var pts = [];
      for (var s = 0; s <= 16; s++) { var t = s / 16, ra = r * PI / 2 + t * PI * 1.1, rr = 1.1 - t * 0.75; pts.push(new T3.Vector3(Math.cos(ra) * rr, 0.55 * (1 - t * t) + t * 2.4 * t, Math.sin(ra) * rr)); }
      b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 40, 0.09, 7, false), bark, 0, 0, 0);
    }
    crystals(b, 0, 0.7, 0, 1.9, 9, 1.55);
    var beam = new T3.MeshBasicMaterial({ color: lin("#9affc0"), transparent: true, opacity: 0.18, depthWrite: false });
    b.add(new T3.CylinderGeometry(0.12, 0.3, 2.4, 16, 1, true), beam, 0, 4.4, 0, { noCast: true });
    orbitStones(b, 0, 2.6, 0, 1.45, 6, 1.0);
    [[-1.95, -1.95, 1.7], [1.95, -1.95, 1.4], [-1.95, 1.95, 1.4]].forEach(function (q) { b.add(rough(new T3.CylinderGeometry(0.1, 0.2, q[2], 4, 2), 0.1, q[0]), RSTONE(), q[0], q[2] / 2, q[1], { ry: PI / 4 }); b.box(0.03, q[2] * 0.5, 0.02, runeG(), q[0] + 0.11, q[2] * 0.4, q[1] + 0.11, { ry: PI / 4, noCast: true }); });
  }
  function asWorkshop(b) {
    b.slab(4.2, "grassEarth", "sideEarth"); b.decal("path", 0.4, 1.0, 2.6, 2.2);
    var st = RSTONE(), bark = M("barkTree", 0.6, 4);
    var FX = -0.95, FZ = -0.95;
    megaRing(b, FX, FZ, 1.05, 0.2, 0, 12);
    for (var k = 0; k < 7; k++) { var a = k / 7 * 2 * PI + 0.3, p = onRing(1.0, a); if (Math.abs(a - PI / 4) < 0.45) continue; slab4(b, FX + p[0], 0.2, FZ + p[1], 0.26, 0.9 + (k % 2) * 0.35, 0.22, -a, st); b.box(0.03, 0.3, 0.02, runeG(), FX + p[0] * 1.08, 0.6, FZ + p[1] * 1.08, { ry: -a + PI / 2, noCast: true }); }
    b.add(new T3.CylinderGeometry(0.45, 0.5, 0.18, 10), RSTONE(), FX, 0.29, FZ);
    var fire = glowMat("#c8ffd8", "#30e070", 2.0);
    b.add(new T3.CylinderGeometry(0.36, 0.36, 0.03, 12), fire, FX, 0.39, FZ, { noCast: true });
    var fl = []; for (var f = 0; f < 5; f++) { var fp = onRing(0.18, f * 1.3); fl.push([b.add(new T3.ConeGeometry(0.08, 0.45, 6), fire, FX + fp[0], 0.62, FZ + fp[1], { noCast: true }), f]); }
    b.fx.push(function (t) { fl.forEach(function (q) { q[0].scale.set(1, 0.8 + Math.sin(t * 7 + q[1] * 2) * 0.25, 1); }); });
    var L = new T3.PointLight("#5aff9a", 1.6, 4, 2); L.position.set(FX, 0.9, FZ); b.g.add(L);
    [0, 1, 2].forEach(function (i) { var a = i * 2 * PI / 3 + 0.2, p = onRing(0.55, a); b.beam([FX + p[0], 0.2, FZ + p[1]], [FX, 1.55, FZ], 0.07, st); });
    b.add(new T3.CylinderGeometry(0.2, 0.14, 0.22, 10), M("iron"), FX, 1.12, FZ);
    crystals(b, FX - 0.75, 0.2, FZ + 0.35, 0.7, 5, 0.8);
    slab4(b, FX + 0.85, 0, FZ - 0.25, 0.4, 0.32, 0.3, 0.4, st);
    var TX = 0.7, TZ = 0.45, base = new T3.Group(); base.position.set(TX, 0, TZ); base.rotation.y = -PI / 4; b.g.add(base);
    inGroup(b, base, function () {
      slab4(b, 0, 0, -0.45, 0.75, 0.55, 0.5, 0, RSTONE()); slab4(b, 0, 0, 0.45, 0.75, 0.55, 0.5, 0, RSTONE());
      b.box(0.9, 0.12, 1.4, RSTONE(0.9, 0.2), 0, 0, 0);
    });
    rootsAround(b, TX, TZ, 0.35, 1.0, 0.5, 6, PI / 4);
    var arm = new T3.Group(); arm.position.set(TX, 0.5, TZ); arm.rotation.y = -PI / 4; b.g.add(arm);
    var pts = []; for (var s2 = 0; s2 <= 14; s2++) { var t = s2 / 14; pts.push(new T3.Vector3(0, t * 2.4, -Math.pow(t, 1.7) * 1.35)); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 40, 0.17, 8, false), bark, 0, 0, 0, { parent: arm });
    var top = pts[14];
    b.add(new T3.SphereGeometry(0.28, 12, 8, 0, 2 * PI, PI / 2, PI / 2), bark, top.x, top.y, top.z, { parent: arm });
    b.add(new T3.IcosahedronGeometry(0.26, 0), CRYS(), top.x, top.y + 0.12, top.z, { parent: arm, noCast: true });
    for (var lf = 0; lf < 4; lf++) b.add(new T3.IcosahedronGeometry(0.16, 0), C(lf % 2 ? "#2f6f3c" : "#3b8048", { flatShading: true }), (lf - 1.5) * 0.12, 1.2 + lf * 0.25, -0.35 - lf * 0.12, { parent: arm });
    b.fx.push(function (t) { arm.rotation.x = Math.sin(t * 0.6) * 0.06; });
    [[1.6, -0.35], [1.75, -0.12], [1.48, -0.1]].forEach(function (q) { b.add(new T3.DodecahedronGeometry(0.15, 0), CRYS(), q[0], 0.14, q[1], { noCast: true }); });
    b.banner(-0.1, 1.95, 0, "bannerEarth", 1.5);
  }

  if (typeof NEWB !== "undefined" && !NEWB.earth && typeof DARK !== "undefined") NEWB.earth = DARK.earth;
  if (typeof MYTHB !== "undefined" && typeof MYTH !== "undefined") MYTHB.earth = [MYTH.earth[0], MYTH.earth[1], MYTH.earth[2], smBarracks, smTower, MYTH.earth[5], MYTH.earth[6]];
  if (typeof ARCB !== "undefined") ARCB.earth = [asHouse, asFarm, asStore, asBarracks, asTower, asPen, asSanctum, asWorkshop];
