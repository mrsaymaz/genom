
  /* ================= RAVENCLAW: Dark = driftwood & shell, Mythic = pearl shell masonry, Arcane = glass & living water ================= */
  function inG(b, grp, fn) { var keep = b.g; b.g = grp; fn(); b.g = keep; }
  function GLASSM(op) { return new T3.MeshStandardMaterial({ color: lin("#cdeeff"), emissive: lin("#2a7ac8"), emissiveIntensity: 0.3, transparent: true, opacity: op || 0.32, roughness: 0.05, metalness: 0.1, side: T3.DoubleSide, depthWrite: false }); }
  function WATERM(rx, ry, op) { return new T3.MeshStandardMaterial({ map: tex("water", rx, ry), transparent: true, opacity: op || 0.8, roughness: 0.05, emissive: lin("#1a6ab0"), emissiveIntensity: 0.45 }); }
  function PEARLM(rx, ry) { return M("pearl", rx || 2, ry || 1, { color: lin("#f0e2da") }); }
  function waterCol(b, x, y0, z, r, h) {
    var m = WATERM(1, h * 1.5, 0.82);
    b.add(new T3.CylinderGeometry(r, r * 1.15, h, 16, 1, true), m, x, y0 + h / 2, z, { noCast: true });
    b.add(new T3.TorusGeometry(r * 1.7, 0.02, 6, 20), dGlow("#e8f8ff", "#58c8ff", 1.2), x, y0 + 0.02, z, { rx: PI / 2, noCast: true });
    b.fx.push(function (t) { m.map.offset.y = -t * 0.8; });
  }
  function glassDome(b, x, y, z, r, ribs) {
    var bz = BRZ();
    b.add(new T3.SphereGeometry(r, 32, 16, 0, 2 * PI, 0, PI / 2), GLASSM(), x, y, z, { noCast: true });
    for (var k = 0; k < (ribs || 6); k++) b.add(new T3.TorusGeometry(r + 0.004, 0.016, 5, 32, PI), bz, x, y, z, { ry: k * PI / (ribs || 6) });
    b.add(new T3.TorusGeometry(r + 0.01, 0.03, 6, 40), bz, x, y + 0.01, z, { rx: PI / 2 });
    b.add(new T3.SphereGeometry(0.05, 10, 8), bz, x, y + r, z);
  }
  function roundPool(b, x, z, r, y) {
    var m = WATERM(r, r, 0.85);
    b.add(new T3.CylinderGeometry(r, r, 0.1, 40), m, x, (y || 0) + 0.05, z, { noCast: true });
    b.add(new T3.TorusGeometry(r + 0.04, 0.06, 8, 48), PEARLM(4, 0.3), x, (y || 0) + 0.1, z, { rx: PI / 2 });
    b.fx.push(function (t) { m.map.offset.set(t * 0.03, Math.sin(t * 0.4) * 0.03); });
  }
  function nautilus(b, cx, cy, cz, ry, s) {
    var g = new T3.Group(); g.position.set(cx, cy, cz); g.rotation.y = ry; g.scale.setScalar(s); b.g.add(g);
    var pearl = M("pearl", 1, 1, { color: lin("#f4e2d8"), roughness: 0.35 }), band = M("pearl", 1, 1, { color: lin("#b8786a"), roughness: 0.4 });
    var N = 52, th0 = -PI * 0.5 - 2.5 * PI, A = 0.19, k = 0.175, last;
    for (var i = 0; i < N; i++) {
      var u = i / (N - 1) * 2.5 * PI, a = A * Math.exp(k * u), th = th0 + u, rr = a * 0.6;
      last = b.add(new T3.SphereGeometry(rr, 16, 12), (i % 7 < 2) ? band : pearl, Math.cos(th) * a, Math.sin(th) * a, 0, { parent: g, s: [1, 1, 0.88] });
    }
    return { g: g, end: last.position.clone(), endR: A * Math.exp(k * 2.5 * PI) * 0.6 };
  }
  function scallop(b, x, y, z, ry, R) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry; b.g.add(g);
    var pA = M("pearl", 1, 2, { color: lin("#f6e4da"), roughness: 0.35 }), pB = M("pearl", 1, 2, { color: lin("#e4c0b0"), roughness: 0.4 });
    var sh = new T3.Shape(); sh.moveTo(R, 0); sh.absarc(0, 0, R, 0, PI, false); sh.lineTo(R, 0);
    b.add(new T3.ShapeGeometry(sh, 24), M("pearl", 2, 2, { color: lin("#d8b2a2"), side: T3.DoubleSide }), 0, 0, -0.03, { parent: g });
    for (var i = 0; i < 13; i++) { var a = (i + 0.5) / 13 * PI, rib = b.add(new T3.CylinderGeometry(0.1 * R, 0.025 * R, R * 0.98, 8), i % 2 ? pA : pB, Math.cos(a) * R * 0.49, Math.sin(a) * R * 0.49, 0.03, { parent: g, rz: a - PI / 2 }); rib.scale.z = 0.55; }
    b.add(new T3.BoxGeometry(R * 0.7, R * 0.12, 0.14), pB, 0, R * 0.04, 0.02, { parent: g });
    return g;
  }

  /* ---------------- Ravenclaw MYTHIC (new store, barracks, tower) ---------------- */
  function rmStore(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var X = -0.3, Z = -0.45, bz = BRZ();
    blueTerrace(b, X, Z, 1.05, 0.14, 0); pearlTerrace(b, X, Z, 0.85, 0.12, 0.14);
    var n = nautilus(b, X, 1.58, Z, PI / 4, 1.15);
    var ex = n.end.x, ey = n.end.y;
    var dir = new T3.Vector3(ex, ey, n.endR * 0.85).applyAxisAngle(new T3.Vector3(0, 1, 0), PI / 4);
    dir.multiplyScalar(1.15); shellMouth(b, X + dir.x, 0.27, Z + dir.z, PI / 4, 0.9);
    var glass = new T3.MeshStandardMaterial({ color: lin("#8fd8ff"), emissive: lin("#2a9ae8"), emissiveIntensity: 0.85, transparent: true, opacity: 0.85, roughness: 0.05 });
    [[0.45, 0.55, 0.11], [-0.35, 0.75, 0.09], [0.1, 1.05, 0.08]].forEach(function (q) { var v = new T3.Vector3(q[0], q[1], 0.42).applyAxisAngle(new T3.Vector3(0, 1, 0), PI / 4); b.add(new T3.SphereGeometry(q[2] * 1.15, 12, 10), glass, X + v.x * 1.15, 1.58 + (v.y - 0.4) * 1.15, Z + v.z * 1.15, { noCast: true }); });
    glowCrown(b, X, 2.22, Z, 0.13);
    var MX = 1.1, MZ = 0.25;
    b.cyl(0.04, 0.05, 1.9, 8, bz, MX, 0, MZ);
    b.beam([MX, 1.8, MZ], [0.45, 2.0, 1.05], 0.03, bz);
    var pv = new T3.Group(); pv.position.set(0.45, 2.0, 1.05); b.g.add(pv);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.95, 4), C("#d8cba6"), 0, -0.47, 0, { parent: pv });
    var netM = new T3.MeshStandardMaterial({ map: tex("net", 1, 1), transparent: true, alphaTest: 0.4, side: T3.DoubleSide, roughness: 1 });
    b.add(new T3.SphereGeometry(0.17, 10, 8), netM, 0, -1.05, 0, { parent: pv, s: [1, 1.2, 1] });
    b.add(new T3.SphereGeometry(0.13, 8, 6), C("#c9a86a"), 0, -1.07, 0, { parent: pv });
    b.fx.push(function (t) { pv.rotation.z = Math.sin(t * 1.2) * 0.08; });
    b.boat(-0.65, 1.2, -0.2); b.barrel(1.2, -0.7); b.barrel(1.05, -0.9);
  }
  function rmBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var G = new T3.Group(); G.position.set(-0.5, 0, -0.5); G.rotation.y = PI / 4; b.g.add(G);
    var bz = BRZ();
    inG(b, G, function () {
      b.box(3.6, 0.22, 1.9, PEARLM(3, 0.3), 0, 0, -0.15);
      b.box(3.62, 0.05, 1.92, M("stoneBlue", 3, 0.2), 0, 0.18, -0.15);
      b.box(2.7, 1.05, 1.0, PEARLM(2.5, 1), 0, 0.22, -0.55);
      b.box(2.76, 0.12, 1.06, M("stoneBlue", 2.5, 0.2), 0, 1.27, -0.55);
      b.box(2.8, 0.04, 1.1, bz, 0, 1.39, -0.55);
      scallop(b, 0, 0.22, 0.02, 0, 1.55);
      shellMouth(b, 0, 0.22, 0.12, 0, 1.05);
      [-1, 1].forEach(function (s) {
        var x = s * 1.6;
        b.cyl(0.32, 0.36, 1.45, 24, PEARLM(1.5, 1.4), x, 0.22, -0.3);
        [0.6, 1.2].forEach(function (y) { b.add(new T3.TorusGeometry(0.335, 0.025, 6, 28), bz, x, 0.22 + y, -0.3, { rx: PI / 2 }); });
        b.add(new T3.SphereGeometry(0.34, 20, 12, 0, 2 * PI, 0, PI / 2), PEARLM(1, 1), x, 1.67, -0.3);
        glowCrown(b, x, 2.04, -0.3, 0.1);
        b.banner(s * 1.15, 0.7, 0.22, "bannerWater", 1.2);
      });
    });
    b.water(0.2, 1.2, 1.9, 1.9, 0.0, 0.08); b.box(1.8, 0.1, 0.06, PEARLM(1.5, 0.2), 1.05, 0, 1.17);
    b.target(1.55, 0.6, 0.6); b.target(1.75, 0.1, 0.8);
    waveWall(b, -1.85, 0, 1.0, -PI / 2, 0.75);
    b.rack(-1.55, 1.65, 0.3, "spear");
  }
  function rmTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var X = -0.2, Z = -0.45, bz = BRZ();
    blueTerrace(b, X, Z, 0.95, 0.16, 0); pearlTerrace(b, X, Z, 0.76, 0.14, 0.16);
    b.cyl(0.44, 0.54, 2.0, 32, PEARLM(2, 2), X, 0.3, Z);
    [0.75, 1.45].forEach(function (y) { b.add(new T3.TorusGeometry(0.5 - y * 0.035, 0.028, 6, 32), bz, X, 0.3 + y, Z, { rx: PI / 2 }); });
    shellMouth(b, X + 0.52 * 0.707, 0.3, Z + 0.52 * 0.707, PI / 4, 0.6);
    [[PI / 4 + 0.7, 1.15], [PI / 4 - 0.7, 1.15], [PI / 4, 1.75]].forEach(function (q) { var r = 0.5 - q[1] * 0.04; porthole(b, X + Math.sin(q[0]) * r, 0.3 + q[1], Z + Math.cos(q[0]) * r, Math.sin(q[0]), Math.cos(q[0]), 0.85); });
    bronzeRing(b, X, 2.3, Z, 0.66, 14);
    b.add(new T3.SphereGeometry(0.46, 24, 12, 0, 2 * PI, 0, PI / 2), PEARLM(1.5, 1), X, 2.3, Z);
    for (var k = 0; k < 4; k++) b.add(new T3.TorusGeometry(0.465, 0.018, 5, 24, PI), bz, X, 2.3, Z, { ry: k * PI / 4 });
    var tg = new T3.Group(); tg.position.set(X, 2.55, Z); b.g.add(tg);
    var tube = new T3.Group(); tube.rotation.x = -0.75; tg.add(tube);
    b.add(new T3.CylinderGeometry(0.07, 0.1, 1.05, 16), bz, 0, 0.35, 0, { parent: tube });
    b.add(new T3.TorusGeometry(0.075, 0.02, 6, 16), bz, 0, 0.87, 0, { parent: tube, rx: PI / 2 });
    b.add(new T3.CircleGeometry(0.07, 16), dGlow("#e8f8ff", "#58c8ff", 2), 0, 0.88, 0, { parent: tube, rx: -PI / 2, noCast: true });
    b.add(new T3.SphereGeometry(0.1, 12, 10), bz, 0, 0, 0, { parent: tg });
    b.fx.push(function (t) { tg.rotation.y = PI / 4 + Math.sin(t * 0.3) * 0.8; });
    b.boat(-0.65, 1.2, -0.2);
  }

  function rmSanctum(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var X = -0.3, Z = -0.3, bz = BRZ();
    blueTerrace(b, X, Z, 1.9, 0.16, 0); pearlTerrace(b, X, Z, 1.65, 0.14, 0.16);
    roundPool(b, X, Z, 1.12, 0.3);
    var spine = M("pearl", 1, 3, { color: lin("#f2dcd2"), roughness: 0.35 }), knob = M("pearl", 1, 1, { color: lin("#b8786a"), roughness: 0.4 });
    var AY = 3.05;
    for (var k = 0; k < 8; k++) {
      var a = k * PI / 4 + PI / 8, pts = [];
      for (var s = 0; s <= 10; s++) { var t = s / 10, r = 1.45 + 0.32 * Math.sin(PI * t * 0.85) - 1.22 * t * t; pts.push([X + Math.cos(a) * r, 0.3 + (AY - 0.3) * t, Z + Math.sin(a) * r]); }
      for (var s2 = 0; s2 < 10; s2++) b.beam(pts[s2], pts[s2 + 1], 0.11 - s2 * 0.007, spine, null, 10);
      [3, 6].forEach(function (i) { var p = pts[i], d = [Math.cos(a), Math.sin(a)]; b.add(new T3.ConeGeometry(0.05, 0.22, 6), knob, p[0] + d[0] * 0.12, p[1], p[2] + d[1] * 0.12, { rz: -d[0] * 1.3, rx: d[1] * 1.3 }); });
      b.cyl(0.14, 0.17, 0.12, 10, bz, pts[0][0], 0.3, pts[0][2]);
    }
    b.add(new T3.TorusGeometry(0.3, 0.04, 8, 28), bz, X, AY, Z, { rx: PI / 2 });
    b.add(new T3.SphereGeometry(0.2, 18, 14), dGlow("#e8f8ff", "#58c8ff", 2.4), X, AY + 0.18, Z, { noCast: true });
    var L = new T3.PointLight("#58c8ff", 1.6, 5, 2); L.position.set(X, AY, Z); b.g.add(L);
    var O = new T3.Group(); b.g.add(O);
    var wm = WATERM(1, 1, 0.65);
    b.add(new T3.SphereGeometry(0.42, 26, 20), wm, 0, 0, 0, { parent: O, noCast: true });
    b.add(new T3.SphereGeometry(0.14, 12, 10), dGlow("#e8f8ff", "#58c8ff", 2.0), 0, 0, 0, { parent: O, noCast: true });
    b.fx.push(function (t) { O.position.set(X, 1.45 + Math.sin(t) * 0.07, Z); wm.map.offset.x = t * 0.06; });
    waterRing2(b, X, 1.45, Z, 0.68, 0.3, 0.5);
    waterArc(b, X, AY - 0.1, Z, X + 0.2, 1.85, Z + 0.2, 0.05, 10);
    waveWall(b, 1.4, 0, 0.55, -PI / 2 + 0.3, 0.6); waveWall(b, 0.55, 0, 1.45, -0.3, 0.6);
    b.banner(1.85, -1.3, 0, "bannerWater", 1.5);
  }

  /* ---------------- Ravenclaw ARCANE: glass & living water ---------------- */
  function awHouse(b) {
    b.slab(3.2, "grassWater", "sideWater");
    var X = -0.2, Z = -0.25, bz = BRZ();
    roundPool(b, X, Z, 1.15);
    [0, 2, 4].forEach(function (k) { var p = dRing(0.58, k * PI / 3 + PI / 6); waterCol(b, X + p[0], 0.1, Z + p[1], 0.09, 1.55); });
    b.add(new T3.CylinderGeometry(0.98, 0.72, 0.2, 40), PEARLM(3, 0.4), X, 1.75, Z);
    b.add(new T3.TorusGeometry(0.98, 0.03, 6, 48), bz, X, 1.85, Z, { rx: PI / 2 });
    dConch(b, X, Z, 1.05, 0.38, 1.85, 3);
    var L = new T3.PointLight("#58c8ff", 1.3, 4, 2); L.position.set(X, 2.3, Z); b.g.add(L);
    glassDome(b, X, 1.85, Z, 0.84, 6);
    var g = GLASSM(0.4);
    [[PI / 4 + 1.05, 0.24], [PI / 4 - 1.05, 0.18]].forEach(function (q) { b.add(new T3.SphereGeometry(q[1], 16, 12), g, X + Math.sin(q[0]) * 0.86, 1.85 + q[1] * 0.8, Z + Math.cos(q[0]) * 0.86, { noCast: true }); });
    armSphere(b, X, 3.15, Z, 0.42);
    waterArc(b, X + 0.65, 1.8, Z + 0.65, X + 1.05, 0.15, Z + 1.05, 0.12, 8);
    shells(b, [[1.2, -1.0], [-1.25, 1.05]]);
  }
  function awFarm(b) {
    b.slab(4.2, "grassWater", "sideWater");
    b.box(3.5, 0.06, 3.5, M("soil", 3, 3), 0.1, 0, 0.1);
    b.water(0.45, -1.7, 0.65, 0.45, 0.0, 0.09); b.water(-1.7, 0.45, 0.45, 0.65, 0.0, 0.09);
    [[-0.85, -0.85, 1.0], [1.05, -0.8, 0.68], [-0.8, 1.05, 0.68]].forEach(function (d) {
      pearlTerrace(b, d[0], d[1], d[2] + 0.08, 0.12, 0);
      b.cabbages(d[0] - d[2] * 0.55, d[1] - d[2] * 0.55, d[0] + d[2] * 0.55, d[1] + d[2] * 0.55, 3, 3, "#5fae6a", 0.12);
      for (var k = 0; k < 5; k++) { var p = dRing(d[2] * 0.6, k * 1.3); b.add(new T3.ConeGeometry(0.04, 0.45 * d[2], 5), C("#3f8a5a", { flatShading: true }), d[0] + p[0], 0.12 + 0.22 * d[2], d[1] + p[1]); }
      glassDome(b, d[0], 0.12, d[1], d[2], 6);
      glowCrown(b, d[0], 0.12 + d[2] + 0.05, d[1], 0.08);
      waterArc(b, 0.55, 2.0, 0.55, d[0], 0.15 + d[2] * 1.05, d[1], 0.35, 9);
    });
    blueTerrace(b, 0.55, 0.55, 0.42, 0.12, 0);
    waterCol(b, 0.55, 0.12, 0.55, 0.11, 1.95);
    armSphere(b, 0.55, 2.65, 0.55, 0.45);
    b.cabbages(1.0, 1.0, 1.85, 1.85, 3, 3, "#6fae4a"); shells(b, [[1.9, 0.3], [0.3, 1.9]]);
  }
  function awStore(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var X = -0.3, Z = -0.45, bz = BRZ();
    blueTerrace(b, X, Z, 1.0, 0.14, 0); pearlTerrace(b, X, Z, 0.8, 0.12, 0.14);
    var Y0 = 0.26, H = 1.55, R = 0.6;
    var wm = WATERM(1.5, 1.5, 0.55), fill = b.add(new T3.CylinderGeometry(R - 0.04, R - 0.04, H - 0.25, 28), wm, X, Y0 + (H - 0.25) / 2, Z, { noCast: true });
    b.fx.push(function (t) { wm.map.offset.y = t * 0.05; });
    b.add(new T3.CylinderGeometry(R, R, H, 32, 1, true), GLASSM(0.3), X, Y0 + H / 2, Z, { noCast: true });
    for (var h = 0; h < 4; h++) b.add(new T3.TorusGeometry(R + 0.01, 0.03, 6, 36), bz, X, Y0 + 0.05 + h * (H - 0.1) / 3, Z, { rx: PI / 2 });
    for (var s = 0; s < 8; s++) { var p = dRing(R + 0.01, s * PI / 4); b.cyl(0.015, 0.015, H, 4, bz, X + p[0], Y0, Z + p[1]); }
    b.add(new T3.ConeGeometry(0.42, 0.28, 16), C("#f2c040", { metalness: 0.85, roughness: 0.3 }), X, Y0 + 0.14, Z);
    var swirl = new T3.Group(); swirl.position.set(X, Y0, Z); b.g.add(swirl);
    for (var i = 0; i < 12; i++) { var a = i * 2.4, rr = 0.22 + (i % 3) * 0.1; b.add(new T3.SphereGeometry(i % 2 ? 0.05 : 0.065, 10, 8), i % 2 ? C("#f2c040", { metalness: 0.8, roughness: 0.3 }) : dGlow("#ffffff", "#bfe8ff", 0.8), Math.cos(a) * rr, 0.45 + i * 0.075, Math.sin(a) * rr, { parent: swirl, noCast: true }); }
    b.fx.push(function (t, dt) { swirl.rotation.y += dt * 0.8; });
    var L = new T3.PointLight("#58c8ff", 1.0, 3, 2); L.position.set(X, 1.0, Z); b.g.add(L);
    dConch(b, X, Z, 0.95, 0.64, Y0 + H, 3);
    armSphere(b, X, Y0 + H + 1.3, Z, 0.32);
    var MX = 0.85, MZ = -1.05;
    b.cyl(0.04, 0.05, 1.9, 8, bz, MX, 0, MZ);
    b.beam([MX, 1.8, MZ], [0.75, 2.0, 0.85], 0.03, bz);
    var pv = new T3.Group(); pv.position.set(0.75, 2.0, 0.85); b.g.add(pv);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.95, 4), C("#d8cba6"), 0, -0.47, 0, { parent: pv });
    b.add(new T3.SphereGeometry(0.14, 14, 10), dGlow("#bfe8ff", "#58c8ff", 1.4), 0, -1.05, 0, { parent: pv, noCast: true });
    b.fx.push(function (t) { pv.rotation.z = Math.sin(t * 1.2) * 0.08; });
    b.boat(-0.65, 1.2, -0.2);
  }
  function awBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var HX = -0.3, HZ = -0.85, bz = BRZ(), L = 2.5, R = 0.82, Y0 = 0.3;
    b.box(3.7, Y0, 1.95, PEARLM(3, 0.3), HX, 0, HZ); b.box(3.72, 0.05, 1.97, M("stoneBlue", 3, 0.2), HX, Y0 - 0.06, HZ);
    b.water(HX - 1.1, HZ - 0.3, HX + 1.1, HZ + 0.3, Y0, Y0 + 0.04);
    b.add(new T3.CylinderGeometry(R, R, L, 32, 1, true, 0, PI), GLASSM(0.3), HX, Y0, HZ, { rz: PI / 2, noCast: true });
    for (var i = 0; i <= 6; i++) b.add(new T3.TorusGeometry(R, 0.024, 5, 28, PI), bz, HX - L / 2 + i * L / 6, Y0, HZ, { ry: PI / 2 });
    b.add(new T3.BoxGeometry(L, 0.04, 0.04), bz, HX, Y0 + R, HZ);
    [-0.7, 0, 0.7].forEach(function (dx, i) { b.add(new T3.SphereGeometry(0.13, 14, 10), dGlow("#e8f8ff", "#58c8ff", 1.6), HX + dx, Y0 + 0.4 + (i % 2) * 0.12, HZ, { noCast: true }); });
    var LL = new T3.PointLight("#58c8ff", 1.2, 4, 2); LL.position.set(HX, Y0 + 0.5, HZ); b.g.add(LL);
    [-1, 1].forEach(function (s) {
      var x = HX + s * (L / 2 + 0.4);
      b.cyl(0.42, 0.46, 1.95, 28, PEARLM(1.5, 1.6), x, Y0, HZ);
      [0.7, 1.4].forEach(function (y) { b.add(new T3.TorusGeometry(0.44, 0.026, 6, 30), bz, x, Y0 + y, HZ, { rx: PI / 2 }); });
      shellMouth(b, x + s * 0.0, Y0, HZ + 0.45, 0, 0.55);
      glassDome(b, x, Y0 + 1.95, HZ, 0.43, 4);
      glowCrown(b, x, Y0 + 2.45, HZ, 0.1);
    });
    waterCol(b, HX, Y0 + R - 0.02, HZ, 0.07, 1.2);
    armSphere(b, HX, Y0 + R + 1.65, HZ, 0.48);
    b.water(HX - 1.4, 0.55, HX + 1.0, 1.75, 0.0, 0.09);
    b.box(2.4, 0.12, 0.08, PEARLM(2, 0.2), HX - 0.2, 0, 0.5);
    [[HX - 0.9, 1.15], [HX - 0.2, 1.35], [HX + 0.5, 1.15]].forEach(function (q, i) { var o = b.add(new T3.SphereGeometry(0.1, 12, 10), dGlow("#e8f8ff", "#58c8ff", 1.5), q[0], 0.4, q[1], { noCast: true }); b.fx.push(function (t) { o.position.y = 0.35 + Math.abs(Math.sin(t * 1.5 + i)) * 0.35; }); });
    b.target(1.55, 1.1, 0.6); b.target(1.75, 0.45, 0.8);
    waveWall(b, -1.95, 0, 1.4, -PI / 2, 0.7);
    b.banner(HX - 0.6, HZ + 1.15, 0.3, "bannerWater", 1.4); b.banner(HX + 0.6, HZ + 1.15, 0.3, "bannerWater", 1.4);
  }
  function awTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var X = -0.2, Z = -0.45, bz = BRZ();
    blueTerrace(b, X, Z, 0.95, 0.16, 0); pearlTerrace(b, X, Z, 0.75, 0.14, 0.16);
    b.cyl(0.42, 0.52, 0.6, 32, PEARLM(2, 0.6), X, 0.3, Z);
    shellMouth(b, X + 0.5 * 0.707, 0.3, Z + 0.5 * 0.707, PI / 4, 0.5);
    bronzeRing(b, X, 0.9, Z, 0.56, 12);
    waterCol(b, X, 0.9, Z, 0.12, 2.25);
    waterRing2(b, X, 1.75, Z, 0.42, 0.3, 0.7); waterRing2(b, X, 2.5, Z, 0.32, -0.3, -0.8);
    var GY = 3.55;
    for (var k = 0; k < 3; k++) { var a = k * 2 * PI / 3; b.add(new T3.TorusGeometry(0.56, 0.02, 5, 24, PI * 0.55), bz, X, GY, Z, { ry: a, rz: -PI * 0.78 }); }
    b.add(new T3.SphereGeometry(0.55, 28, 20), GLASSM(0.25), X, GY, Z, { noCast: true });
    armSphere(b, X, GY, Z, 0.7);
    b.add(new T3.CylinderGeometry(0.03, 0.05, 0.3, 8), bz, X, GY + 0.55, Z);
    waterArc(b, X + 0.35, GY - 0.3, Z + 0.35, X + 0.85, 0.3, Z + 0.85, 0.25, 12);
    waterArc(b, X - 0.35, GY - 0.3, Z + 0.35, X - 0.7, 0.3, Z + 0.7, 0.2, 10);
    b.boat(-0.65, 1.2, -0.2);
  }
  function awPen(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var X = -0.1, Z = -0.15, bz = BRZ(), OY = 2.45;
    roundPool(b, X, Z, 1.6);
    waterCol(b, X, 0.1, Z, 0.07, OY - 0.8);
    var O = new T3.Group(); O.position.set(X, OY, Z); b.g.add(O);
    var wm = WATERM(2, 2, 0.6);
    b.add(new T3.SphereGeometry(0.78, 32, 24), wm, 0, 0, 0, { parent: O, noCast: true });
    b.add(new T3.SphereGeometry(0.26, 18, 14), dGlow("#e8f8ff", "#58c8ff", 2.0), 0, 0, 0, { parent: O, noCast: true });
    O.add(new T3.PointLight("#58c8ff", 1.6, 5, 2));
    var r1 = b.add(new T3.TorusGeometry(1.0, 0.025, 6, 48), bz, 0, 0, 0, { parent: O }), r2 = b.add(new T3.TorusGeometry(0.92, 0.022, 6, 48), bz, 0, 0, 0, { parent: O });
    b.fx.push(function (t) { O.position.y = OY + Math.sin(t * 0.9) * 0.06; wm.map.offset.set(t * 0.05, t * 0.02); r1.rotation.set(PI / 2 + 0.35, t * 0.3, 0); r2.rotation.set(PI / 2 - 0.4, 0, t * 0.4); });
    armSphere(b, X, OY + 1.2, Z, 0.32);
    var orb = new T3.Group(); orb.position.set(X, OY + 0.15, Z); b.g.add(orb);
    inGroup(b, orb, function () { b.raven(1.45, 0, 0, 0.6, PI, true); b.raven(-1.35, -0.25, 0, 0.55, 0, true); });
    b.fx.push(function (t, dt) { orb.rotation.y += dt * 0.55; });
    [[3 * PI / 4, 1.25], [-PI / 4, 1.05]].forEach(function (q) {
      var p = onRing(1.62, q[0]);
      b.cyl(0.09, 0.12, q[1], 16, PEARLM(0.6, 1), X + p[0], 0.1, Z + p[1]);
      b.add(new T3.CylinderGeometry(0.2, 0.12, 0.1, 16), bz, X + p[0], 0.15 + q[1], Z + p[1]);
      b.raven(X + p[0], 0.2 + q[1], Z + p[1], 0.5, q[0] + PI, false);
    });
    b.banner(1.65, 1.2, 0, "bannerWater", 1.5);
  }
  function awSanctum(b) {
    b.slab(4.2, "grassWater", "sideWater");
    blueTerrace(b, 0, 0, 2.0, 0.16, 0); pearlTerrace(b, 0, 0, 1.75, 0.14, 0.16); pearlTerrace(b, 0, 0, 1.52, 0.12, 0.3);
    var bz = BRZ(), Y0 = 0.42, CR = 1.32;
    for (var k = 0; k < 14; k++) { var p = dRing(CR, k * 2 * PI / 14); b.cyl(0.07, 0.08, 0.6, 12, PEARLM(0.4, 0.6), p[0], Y0, p[1]); }
    b.add(new T3.TorusGeometry(CR, 0.07, 8, 56), PEARLM(4, 0.3), 0, Y0 + 0.64, 0, { rx: PI / 2 });
    var DY = Y0 + 0.68;
    glassDome(b, 0, DY, 0, CR + 0.02, 8);
    var O = new T3.Group(); b.g.add(O);
    var wm = WATERM(1.5, 1.5, 0.65);
    b.add(new T3.SphereGeometry(0.45, 28, 20), wm, 0, 0, 0, { parent: O, noCast: true });
    b.add(new T3.SphereGeometry(0.16, 14, 10), dGlow("#e8f8ff", "#58c8ff", 2.2), 0, 0, 0, { parent: O, noCast: true });
    O.add(new T3.PointLight("#58c8ff", 1.8, 5, 2));
    b.fx.push(function (t) { O.position.set(0, DY + 0.55 + Math.sin(t) * 0.06, 0); wm.map.offset.x = t * 0.06; });
    waterRing2(b, 0, DY + 0.55, 0, 0.75, 0.3, 0.5);
    b.add(new T3.CylinderGeometry(0.22, 0.3, 0.16, 20), PEARLM(1, 0.2), 0, DY + CR + 0.05, 0);
    armSphere(b, 0, DY + CR + 0.75, 0, 0.75);
    [PI / 4, 3 * PI / 4, 5 * PI / 4, 7 * PI / 4].forEach(function (a) {
      var p = onRing(1.72, a);
      b.cyl(0.14, 0.18, 0.3, 16, PEARLM(0.6, 0.3), p[0], 0.3, p[1]);
      b.add(new T3.CylinderGeometry(0.12, 0.12, 0.04, 16), WATERM(0.3, 0.3), p[0], 0.62, p[1], { noCast: true });
      waterArc(b, p[0], 0.65, p[1], p[0] * 0.15, DY + CR * 0.85, p[1] * 0.15, 0.7, 12);
    });
    b.banner(-1.95, 1.05, 0, "bannerWater", 1.5);
  }

  MYTHB.water = [MYTHB.water[0], MYTHB.water[1], rmStore, rmBarracks, rmTower, MYTHB.water[5], rmSanctum];
  if (typeof ARCB !== "undefined") ARCB.water = [awHouse, awFarm, awStore, awBarracks, awTower, awPen, awSanctum, ARCB.water[7]];
