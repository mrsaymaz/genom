
  /* ================= ARCANE AGE BUILDINGS ================= */
  function isle(b, x, y, z, r, h, seed, topKey) {
    var g = new T3.Group(); g.position.set(x, y, z); b.g.add(g);
    b.add(rough(new T3.CylinderGeometry(r, 0.06, h, 10, 4), 0.3, seed), C("#a59d8e", { flatShading: true, roughness: 0.9 }), 0, -h / 2, 0, { parent: g });
    var tk = topKey || "grassAir";
    b.add(new T3.CylinderGeometry(r + 0.03, r - 0.03, 0.12, 10), [M("sideAir", 2, 0.4), M(tk, r, r), M(tk, r, r)], 0, 0.02, 0, { parent: g });
    var cr = b.add(new T3.OctahedronGeometry(0.06 + r * 0.08, 0), glowMat("#fff4c8", "#ffd860", 1.6), 0, -h - 0.15, 0, { parent: g, noCast: true }); cr.scale.set(0.8, 1.6, 0.8);
    var ph = b.rand() * 6;
    b.fx.push(function (t) { g.position.y = y + Math.sin(t * 0.85 + ph) * 0.06; cr.rotation.y = t; });
    return g;
  }
  function pylon(b, x, z, h, tx, ty, tz) {
    var gold = GOLD(), cry = glowMat("#fff4c8", "#ffd860", 1.6);
    b.add(new T3.CylinderGeometry(0.08, 0.14, h, 4), PALE(0.4, 1), x, h / 2, z, { ry: PI / 4 });
    b.add(new T3.ConeGeometry(0.1, 0.16, 4), gold, x, h + 0.08, z, { ry: PI / 4 });
    var c = b.add(new T3.OctahedronGeometry(0.09, 0), cry, x, h + 0.35, z, { noCast: true }); c.scale.set(0.8, 1.6, 0.8);
    if (tx != null) b.beam([x, h + 0.38, z], [tx, ty, tz], 0.022, new T3.MeshBasicMaterial({ color: lin("#fff2c0"), transparent: true, opacity: 0.25, depthWrite: false }));
    var ph = b.rand() * 6; b.fx.push(function (t) { c.rotation.y = t * 1.2 + ph; c.position.y = h + 0.35 + Math.sin(t * 1.5 + ph) * 0.04; });
  }
  function plaza(b, r) {
    b.add(new T3.CylinderGeometry(r, r + 0.08, 0.18, 40), [PALE(5, 0.3), PALE(r * 1.5, r * 1.5), PALE(r * 1.5, r * 1.5)], 0, 0.09, 0);
    b.add(new T3.TorusGeometry(r - 0.25, 0.03, 4, 64), GOLD(), 0, 0.185, 0, { rx: PI / 2, noCast: true });
    var rune = glowMat("#fff2b8", "#ffd860", 0.9);
    b.add(new T3.RingGeometry(r * 0.45, r * 0.5, 3), rune, 0, 0.19, 0, { rx: -PI / 2, noCast: true });
    b.add(new T3.RingGeometry(r * 0.45, r * 0.5, 3), rune, 0, 0.19, 0, { rx: -PI / 2, rz: PI, noCast: true });
  }
  function sailRing(b, parent, y, r, n, sp) {
    var ring = new T3.Group(); ring.position.y = y; parent.add(ring);
    b.add(new T3.TorusGeometry(r, 0.025, 6, 48), GOLD(), 0, 0, 0, { parent: ring, rx: PI / 2 });
    var sm = M("canvas", 1, 1, { side: T3.DoubleSide });
    for (var s = 0; s < n; s++) { var a = s / n * 2 * PI, p = onRing(r, a), g = new T3.Group(); g.position.set(p[0], 0, p[1]); g.rotation.y = -a + 0.5; ring.add(g); b.add(new T3.PlaneGeometry(r * 0.28, r * 0.42), sm, 0, 0, 0, { parent: g }); }
    b.fx.push(function (t, dt) { ring.rotation.y += dt * (sp || 0.6); });
    return ring;
  }
  function armillary(b, x, y, z, s) {
    var g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); b.g.add(g);
    var bz = BRONZE(), orb = glowMat("#e8f8ff", "#58c8ff", 2);
    b.add(new T3.SphereGeometry(0.17, 16, 12), orb, 0, 0, 0, { parent: g, noCast: true });
    var r1 = b.add(new T3.TorusGeometry(0.55, 0.025, 6, 40), bz, 0, 0, 0, { parent: g }), r2 = b.add(new T3.TorusGeometry(0.47, 0.025, 6, 40), bz, 0, 0, 0, { parent: g }), r3 = b.add(new T3.TorusGeometry(0.62, 0.02, 6, 40), bz, 0, 0, 0, { parent: g, rx: PI / 2 });
    b.beam([0, -0.65, 0], [0, -0.35, 0], 0.025, bz, g);
    b.fx.push(function (t) { r1.rotation.set(t * 0.6, 0.4, 0); r2.rotation.set(0.9, t * 0.8, 0); r3.rotation.z = t * 0.5; });
  }
  function waterRing(b, x, y, z, r, tilt) {
    var m = new T3.MeshStandardMaterial({ map: tex("water", 4, 0.3), transparent: true, opacity: 0.75, roughness: 0.05, emissive: lin("#1a6ab0"), emissiveIntensity: 0.5 });
    var ring = b.add(new T3.TorusGeometry(r, 0.05, 8, 56), m, x, y, z, { rx: PI / 2 - (tilt || 0.25), noCast: true });
    b.fx.push(function (t) { ring.rotation.z = t * 0.45; m.map.offset.x = t * 0.15; });
  }
  function glassDome(b, x, y, z, r) {
    var glass = new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#2a8fe0"), emissiveIntensity: 0.75, transparent: true, opacity: 0.88, roughness: 0.08, metalness: 0.25 });
    b.add(new T3.SphereGeometry(r, 28, 12, 0, 2 * PI, 0, PI / 2), glass, x, y, z);
    for (var i = 0; i < 4; i++) b.add(new T3.TorusGeometry(r + 0.01, 0.022, 6, 28, PI), BRONZE(), x, y, z, { ry: i * PI / 4 });
    b.fx.push(function (t) { glass.emissiveIntensity = 0.7 + Math.sin(t * 1.4) * 0.15; });
  }
  function halo(b, x, y, z, r) {
    var g = new T3.Group(); g.position.set(x, y, z); b.g.add(g);
    b.add(new T3.TorusGeometry(r, 0.025, 6, 36), REDGOLD(), 0, 0, 0, { parent: g, rx: PI / 2 });
    for (var f = 0; f < 6; f++) { var p = onRing(r, f / 6 * 2 * PI); b.add(new T3.ConeGeometry(0.04, 0.13, 5), REDGOLD(), p[0], 0.05, p[1], { parent: g }); }
    b.fx.push(function (t) { g.rotation.y = t * 0.6; g.position.y = y + Math.sin(t * 1.3) * 0.04; });
  }
  function brazier(b, x, z, y0, s) {
    s = s || 1;
    b.cyl(0.13 * s, 0.17 * s, 0.22 * s, 8, M("stoneWarm", 0.4, 0.2), x, y0 || 0, z);
    b.cyl(0.19 * s, 0.1 * s, 0.13 * s, 10, M("iron"), x, (y0 || 0) + 0.22 * s, z);
    b.fire(x, (y0 || 0) + 0.35 * s, z, 0.45 * s, 0.45 * s);
  }
  function walledYard(b, half, h, gapAt, towers) {
    var sw = M("stoneWarm", 0.3, 0.3);
    var segs = [[-half, half, gapAt - 0.35, half], [gapAt + 0.35, half, half, half], [half, half, half, -half], [half, -half, -half, -half], [-half, -half, -half, half]];
    segs.forEach(function (w) {
      var len = Math.hypot(w[2] - w[0], w[3] - w[1]); if (len < 0.05) return;
      var ry = -Math.atan2(w[3] - w[1], w[2] - w[0]);
      b.box(len, h, 0.22, M("stoneWarm", len, h), (w[0] + w[2]) / 2, 0, (w[1] + w[3]) / 2, { ry: ry });
      merlons(b, w[0], w[1], w[2], w[3], h, sw, 0.14);
    });
    if (towers) [[-half, half], [half, half], [half, -half], [-half, -half]].forEach(function (p) {
      b.cyl(0.26, 0.3, h + 0.6, 12, M("stoneWarm", 1, 1), p[0], 0, p[1]);
      b.add(new T3.ConeGeometry(0.36, 0.5, 12), M("shinglesRed", 1.4, 0.8), p[0], h + 0.6 + 0.25, p[1]);
      b.add(new T3.SphereGeometry(0.04, 8, 6), REDGOLD(), p[0], h + 1.12, p[1]);
    });
  }
  function orbitStones(b, x, y, z, r, n, s) {
    var o = new T3.Group(); o.position.set(x, y, z); b.g.add(o);
    var rune = glowMat("#9effc0", "#3cff8a", 1.4), list = [];
    for (var i = 0; i < n; i++) {
      var a = i / n * 2 * PI, p = onRing(r, a), sh = new T3.Group(); sh.position.set(p[0], 0, p[1]); o.add(sh);
      b.add(new T3.CylinderGeometry(0.08 * s, 0.12 * s, 0.42 * s, 4), SLATE(), 0, 0, 0, { parent: sh, ry: PI / 4 });
      b.add(new T3.BoxGeometry(0.03, 0.2 * s, 0.15 * s), rune, 0, 0, 0, { parent: sh, noCast: true });
      list.push([sh, i]);
    }
    b.fx.push(function (t, dt) { o.rotation.y += dt * 0.3; list.forEach(function (q) { q[0].position.y = Math.sin(t * 1.1 + q[1]) * 0.1; q[0].rotation.y = -o.rotation.y; }); rune.emissiveIntensity = 1.2 + Math.sin(t * 1.4) * 0.4; });
  }
  function glowRing(b, x, z, r, y) {
    var m = new T3.MeshBasicMaterial({ color: lin("#5cff9a"), transparent: true, opacity: 0.35, depthWrite: false });
    b.add(new T3.TorusGeometry(r, 0.02, 4, 80), m, x, y || 0.02, z, { rx: PI / 2, noCast: true });
    b.fx.push(function (t) { m.opacity = 0.25 + Math.sin(t * 1.4) * 0.12; });
  }
  function fireflies(b, x, z, n, rMin, rMax, yMin, yMax) {
    var fm = new T3.SpriteMaterial({ map: tex("glow"), transparent: true, depthWrite: false, blending: T3.AdditiveBlending }), list = [];
    for (var i = 0; i < n; i++) { var s = new T3.Sprite(fm); s.scale.set(0.1, 0.1, 1); b.g.add(s); list.push([s, b.rand() * 6.28, rMin + b.rand() * (rMax - rMin), yMin + b.rand() * (yMax - yMin), 0.3 + b.rand() * 0.5]); }
    b.fx.push(function (t) { list.forEach(function (f) { var a = f[1] + t * f[4]; f[0].position.set(x + Math.cos(a) * f[2], f[3] + Math.sin(t * 1.3 + f[1]) * 0.2, z + Math.sin(a * 1.3) * f[2]); }); });
  }

  /* ---------------- Hufflepuff ---------------- */
  function aAirHouse(b) {
    b.slab(3.2, "grassAir", "sideAir"); plaza(b, 1.25);
    var I = isle(b, -0.15, 1.15, -0.2, 0.95, 1.0, 7);
    b.add(new T3.CylinderGeometry(0.62, 0.66, 0.55, 16), PALE(3, 0.7), 0, 0.36, 0, { parent: I });
    b.add(new T3.TorusGeometry(0.66, 0.03, 6, 28), GOLD(), 0, 0.64, 0, { parent: I, rx: PI / 2 });
    b.add(new T3.CylinderGeometry(0.4, 0.44, 0.38, 14), PALE(2, 0.5), 0, 0.84, 0, { parent: I });
    b.add(new T3.ConeGeometry(0.7, 0.45, 16), M("canvas", 3, 1, { side: T3.DoubleSide }), 0, 0.66 + 0.225, 0, { parent: I });
    b.add(new T3.ConeGeometry(0.5, 0.55, 16), M("canvas", 3, 1, { side: T3.DoubleSide }), 0, 1.03 + 0.275, 0, { parent: I });
    var dw = b.add(new T3.PlaneGeometry(0.22, 0.34), glowMat("#ffe9b0", "#ffb23e", 0.8), 0, 0.27, 0.665, { parent: I, noCast: true });
    var cw = glowMat("#ffe39a", "#ffb23e", 1);
    [0.9, -0.4].forEach(function (a) { var p = onRing(0.665, a), w = b.add(new T3.PlaneGeometry(0.12, 0.2), cw, p[0], 0.4, p[1], { parent: I, noCast: true }); w.lookAt(I.position.x + p[0] * 3, I.position.y + 0.4, I.position.z + p[1] * 3); });
    for (var s = 0; s < 4; s++) { var t = s / 3, p = onRing(1.55 - t * 0.55, PI / 2), y = 0.3 + t * 0.85; b.box(0.4, 0.08, 0.22, PALE(0.4, 0.2), p[0] - 0.15, y, p[1] - 0.2); }
    b.hay(-1.15, 1.05, 0.3); b.bush(1.25, -1.2, 0.15);
  }
  function aAirFarm(b) {
    b.slab(4.2, "grassAir", "sideAir");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.1, 0, 0.1);
    b.wheat(-1.25, -0.2, 1.45, 1.45, 5, 9, ["#d9b84a", "#c8a83e", "#e6cc6a"]);
    [[-0.85, 1.35, -1.05, 0.8, 5], [0.75, 2.15, -1.2, 0.65, 9]].forEach(function (q) {
      var I = isle(b, q[0], q[1], q[2], q[3], 0.8, q[4], "soil");
      var keep = b.g; b.g = I; b.oak(0.15, 0.05, 0.6); b.oak(-0.3, -0.15, 0.5);
      for (var f = 0; f < 5; f++) b.add(new T3.SphereGeometry(0.05, 8, 6), C("#e8b83a"), Math.cos(f * 1.3) * 0.3, 0.6 + (f % 2) * 0.1, Math.sin(f * 1.3) * 0.3, { noCast: true });
      b.g = keep;
    });
    pylon(b, 1.7, 1.7, 1.2, 0.75, 1.9, -1.2); pylon(b, -1.75, 1.75, 1.0, -0.85, 1.1, -1.05);
    b.hay(1.9, 0.4, 0.3); b.basket(-1.9, 0.6, "#e6cc6a");
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, 1.75 + b.rand() * 0.3, "#5a9238");
  }
  function aAirStore(b) {
    b.slab(3.2, "grassAir", "sideAir"); plaza(b, 1.4);
    var CX = -0.1, CZ = -0.1;
    b.cyl(0.62, 0.68, 0.9, 16, PALE(3, 1), CX, 0.18, CZ);
    b.add(new T3.TorusGeometry(0.66, 0.03, 6, 28), GOLD(), CX, 1.08, CZ, { rx: PI / 2 });
    b.cyl(0.42, 0.46, 0.55, 14, PALE(2, 0.6), CX, 1.08, CZ);
    b.tent(CX, 1.63, CZ, 0.62, 0.65, 16);
    b.add(new T3.BoxGeometry(0.4, 0.55, 0.05), GOLD(), CX + 0.47, 0.18 + 0.275, CZ + 0.47, { ry: PI / 4 });
    var orbit = new T3.Group(); orbit.position.set(CX, 1.3, CZ); b.g.add(orbit), plats = [];
    for (var i = 0; i < 3; i++) {
      var a = i / 3 * 2 * PI, p = onRing(1.05, a), pl = new T3.Group(); pl.position.set(p[0], 0, p[1]); orbit.add(pl);
      b.add(new T3.BoxGeometry(0.4, 0.07, 0.32), PALE(0.4, 0.3), 0, 0, 0, { parent: pl });
      b.add(new T3.BoxGeometry(0.18, 0.18, 0.18), M("plankWarm", 0.3, 0.3), -0.08, 0.13, 0, { parent: pl });
      b.add(new T3.SphereGeometry(0.08, 8, 6), C("#c9a86a"), 0.11, 0.1, 0.05, { parent: pl });
      var c = b.add(new T3.OctahedronGeometry(0.05, 0), glowMat("#fff4c8", "#ffd860", 1.6), 0, -0.14, 0, { parent: pl, noCast: true }); c.scale.set(0.8, 1.6, 0.8);
      plats.push([pl, i]);
    }
    b.fx.push(function (t, dt) { orbit.rotation.y += dt * 0.35; plats.forEach(function (q) { q[0].rotation.y = -orbit.rotation.y; q[0].position.y = Math.sin(t * 1.2 + q[1] * 2) * 0.08; }); });
    b.gold(1.15, 0.9); b.logs(-1.2, 1.0, 0.3);
  }
  function aAirBarracks(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.3, 1.3, 2.6, 1.5);
    var HX = -0.35, HZ = -0.7, gold = GOLD();
    b.add(new T3.BoxGeometry(3.0, 0.2, 1.7), PALE(2, 0.3), HX, 0.1, HZ);
    b.box(2.7, 1.6, 1.25, PALE(3, 1.4), HX, 0.2, HZ - 0.1);
    for (var c = 0; c < 7; c++) { var x = HX - 1.3 + c * 0.433; b.cyl(0.055, 0.06, 0.75, 8, MARBLE(), x, 0.2, HZ + 0.62); b.cyl(0.055, 0.06, 0.75, 8, MARBLE(), x, 1.0, HZ + 0.62); }
    b.box(2.82, 0.06, 0.3, gold, HX, 0.95, HZ + 0.55); b.box(2.82, 0.06, 0.3, gold, HX, 1.78, HZ + 0.55);
    b.gable({ len: 2.7, wid: 1.55, rise: 0.75, over: 0.15, mat: M("canvas", 2.4, 1, { side: T3.DoubleSide }), gmat: PALE(1.5, 0.6), x: HX, y: 1.84, z: HZ, ridge: gold });
    b.box(0.5, 0.7, 0.04, glowMat("#ffe9b0", "#ffb23e", 0.7), HX, 0.2, HZ + 0.53, { noCast: true });
    var I = isle(b, 1.05, 2.0, 1.05, 0.7, 0.75, 11);
    var keep = b.g; b.g = I; b.target(0.15, -0.1, 0.6); b.dummy(-0.25, 0.15, 0.3); b.g = keep;
    pylon(b, 1.85, -0.2, 1.1, 1.05, 1.3, 1.05);
    b.banner(HX - 0.6, HZ + 1.15, 0, "bannerAir", 1.6); b.banner(HX + 0.6, HZ + 1.15, 0, "bannerAir", 1.6);
    b.target(-1.4, 1.5, 0.3); b.rack(-0.6, 1.75, 0, "spear");
  }
  function aAirTower(b) {
    b.slab(3.2, "grassAir", "sideAir"); plaza(b, 1.0);
    b.cyl(0.42, 0.55, 2.0, 16, PALE(2.5, 2), 0, 0.18, 0);
    merlons(b, -0.42, 0.42, 0.42, 0.42, 2.18, GOLD(), 0.12); merlons(b, 0.42, 0.42, 0.42, -0.42, 2.18, GOLD(), 0.12);
    b.door(0.38, 0.18, 0.38, PI / 4, 0.28, 0.5);
    b.cylWindows(0, 0, 0.47, 1.35, [PI / 4, PI / 4 + 1], 0.1, 0.22, glowMat("#ffe39a", "#ffb23e", 1));
    [[2.55, 0.62, 0.18], [3.25, 0.45, 0.15]].forEach(function (c, i) {
      var cr = new T3.Group(); cr.position.set(0, c[0], 0); b.g.add(cr);
      b.add(new T3.CylinderGeometry(c[1], c[1] * 0.8, c[2], 16), PALE(2, 0.3), 0, 0, 0, { parent: cr });
      b.add(new T3.ConeGeometry(c[1] * 1.15, c[1], 16), M("canvas", 3, 1, { side: T3.DoubleSide }), 0, c[2] / 2 + c[1] / 2, 0, { parent: cr });
      b.add(new T3.TorusGeometry(c[1] * 1.08, 0.025, 6, 28), GOLD(), 0, c[2] / 2, 0, { parent: cr, rx: PI / 2 });
      var ph = i * 2; b.fx.push(function (t) { cr.position.y = c[0] + Math.sin(t * 1.1 + ph) * 0.05; cr.rotation.y = t * (i ? -0.2 : 0.15); });
    });
    var o = new T3.Group(); o.position.set(0, 2.2, 0); b.g.add(o);
    for (var k = 0; k < 4; k++) { var p = onRing(0.85, k * PI / 2), m = b.add(new T3.OctahedronGeometry(0.08, 0), glowMat("#fff4c8", "#ffd860", 1.6), p[0], 0, p[1], { parent: o, noCast: true }); m.scale.set(0.8, 1.6, 0.8); }
    var L = new T3.PointLight("#ffd860", 0.8, 3, 2); L.position.set(0, 2.3, 0); b.g.add(L);
    b.fx.push(function (t, dt) { o.rotation.y += dt * 0.8; });
    b.hay(-1.1, 0.95, 0.2); b.rock(1.2, 1.1, 0.12);
  }
  function aAirPen(b) {
    b.slab(4.2, "grassAir", "sideAir"); plaza(b, 1.9);
    var I = isle(b, -0.1, 1.55, -0.2, 1.35, 1.3, 13);
    var keep = b.g; b.g = I;
    b.mound(-0.45, -0.45, 0.8, 0.65, 0.7, "stonePale", 1.5);
    b.add(new T3.TorusGeometry(0.28, 0.03, 6, 16, PI), GOLD(), -0.45 + 0.55, 0.0, -0.45 + 0.55, { ry: PI / 4 });
    b.bear(0.35, 0.35, 0.62, -0.3);
    b.g = keep;
    [PI * 0.9, PI * 1.5, PI * 0.2].forEach(function (a) { var p = onRing(1.8, a); pylon(b, p[0], p[1], 0.9, -0.1 + p[0] * 0.4, 0.4, -0.2 + p[1] * 0.4); });
    for (var s = 0; s < 6; s++) { var t = s / 5, p = onRing(2.3 - t * 0.9, PI / 2), y = 0.3 + t * 1.25; b.box(0.5, 0.08, 0.26, PALE(0.4, 0.2), p[0] - 0.1, y, p[1] - 0.2); }
    var amber = new T3.MeshStandardMaterial({ color: lin("#f2a72e"), emissive: lin("#c06a10"), emissiveIntensity: 0.5, roughness: 0.25 });
    [[1.7, 1.6], [1.95, 1.45]].forEach(function (q) { b.cyl(0.1, 0.12, 0.22, 10, amber, q[0], 0.18, q[1]); });
    b.banner(-1.55, 1.6, 0.18, "bannerAir", 1.45);
  }
  function aAirSanctum(b) {
    b.slab(4.2, "grassAir", "sideAir"); plaza(b, 1.95);
    var gold = GOLD();
    b.add(new T3.CylinderGeometry(1.45, 1.5, 0.16, 32), PALE(4, 0.2), 0, 0.26, 0);
    for (var c = 0; c < 10; c++) { var p = onRing(1.3, c / 10 * 2 * PI); b.cyl(0.07, 0.08, 1.3, 10, MARBLE(), p[0], 0.34, p[1]); }
    b.add(new T3.TorusGeometry(1.3, 0.09, 4, 40), PALE(6, 0.3), 0, 1.68, 0, { rx: PI / 2 });
    for (var c2 = 0; c2 < 8; c2++) { var q = onRing(0.95, c2 / 8 * 2 * PI + 0.2); b.cyl(0.05, 0.06, 0.9, 8, MARBLE(), q[0], 1.72, q[1]); }
    b.add(new T3.TorusGeometry(0.95, 0.07, 4, 36), PALE(5, 0.3), 0, 2.64, 0, { rx: PI / 2 });
    for (var r = 0; r < 4; r++) b.add(new T3.TorusGeometry(0.95, 0.022, 6, 28, PI), gold, 0, 2.66, 0, { ry: r * PI / 4 });
    var core = new T3.Group(); core.position.set(0, 1.55, 0); b.g.add(core);
    var big = b.add(new T3.OctahedronGeometry(0.34, 0), glowMat("#fff4c8", "#ffd860", 1.8), 0, 0, 0, { parent: core, noCast: true }); big.scale.set(0.8, 1.5, 0.8);
    var sat = new T3.Group(); core.add(sat);
    for (var k = 0; k < 4; k++) { var p2 = onRing(0.75, k * PI / 2), m = b.add(new T3.OctahedronGeometry(0.09, 0), glowMat("#fff4c8", "#ffd860", 1.6), p2[0], 0, p2[1], { parent: sat, noCast: true }); m.scale.set(0.8, 1.6, 0.8); }
    var L = new T3.PointLight("#ffd860", 1.8, 5, 2); core.add(L);
    sailRing(b, b.g, 2.25, 1.85, 8, 0.5);
    b.fx.push(function (t, dt) { core.position.y = 1.55 + Math.sin(t * 1.2) * 0.08; big.rotation.y = t * 0.8; sat.rotation.y -= dt * 1.2; sat.rotation.x = Math.sin(t * 0.5) * 0.3; L.intensity = 1.6 + Math.sin(t * 1.6) * 0.3; });
    b.banner(-1.1, 1.75, 0.18, "bannerAir", 1.5); b.banner(1.75, -1.1, 0.18, "bannerAir", 1.5);
  }
  function aAirWorkshop(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.6, 1.2, 2.4, 1.8);
    var gold = GOLD(), HX = -0.7, HZ = -0.9;
    b.box(2.2, 0.15, 1.6, PALE(2, 1.4), HX, 0, HZ);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { b.cyl(0.07, 0.08, 1.3, 8, MARBLE(), HX + s[0] * 0.95, 0.15, HZ + s[1] * 0.65); });
    b.box(1.0, 1.3, 1.4, PALE(1, 1.2), HX - 0.55, 0.15, HZ);
    b.gable({ len: 2.2, wid: 1.6, rise: 0.6, over: 0.15, mat: M("canvas", 2, 1, { side: T3.DoubleSide }), gmat: PALE(1, 0.5), x: HX, y: 1.45, z: HZ, ridge: gold });
    b.lift(0.15, function () { this.logs(HX + 0.3, HZ, PI / 2); this.crate(HX + 0.65, HZ - 0.35, 0.28, 0.3); });
    b.cyl(0.05, 0.07, 2.0, 8, gold, 1.45, 0, -1.35);
    b.beam([1.45, 1.95, -1.35], [0.6, 2.15, -0.6], 0.03, gold);
    var BX = 0.65, BZ = 0.75, bal = new T3.Group(); bal.position.set(BX, 0, BZ); bal.rotation.y = PI / 4; b.g.add(bal);
    var w = C("#6a4a2c");
    [[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.35], [0.3, -0.35]].forEach(function (q) { b.add(new T3.CylinderGeometry(0.12, 0.12, 0.06, 12), w, q[0], 0.12, q[1], { parent: bal, rz: PI / 2 }); });
    b.add(new T3.BoxGeometry(0.55, 0.12, 0.9), M("plankWarm", 0.5, 0.8), 0, 0.22, 0, { parent: bal });
    var head = new T3.Group(); head.position.set(0, 0.45, 0); bal.add(head);
    b.add(new T3.BoxGeometry(0.12, 0.12, 1.1), M("plankDark", 0.2, 1), 0, 0, 0, { parent: head });
    [-1, 1].forEach(function (s) { b.beam([0, 0, 0.35], [s * 0.6, 0, 0.1], 0.03, gold, head); });
    b.beam([-0.6, 0, 0.1], [0, 0, -0.35], 0.006, C("#f2ece0"), head); b.beam([0.6, 0, 0.1], [0, 0, -0.35], 0.006, C("#f2ece0"), head);
    var bolt = b.add(new T3.OctahedronGeometry(0.07, 0), glowMat("#fff4c8", "#ffd860", 2), 0, 0.08, 0.35, { parent: head, noCast: true }); bolt.scale.set(0.8, 0.8, 4);
    b.fx.push(function (t) { head.rotation.y = Math.sin(t * 0.5) * 0.3; head.rotation.x = -0.15 + Math.sin(t * 0.7) * 0.05; });
    pylon(b, -1.9, 1.7, 1.0); b.banner(-0.4, 1.95, 0, "bannerAir", 1.5);
  }

  /* ---------------- Ravenclaw ---------------- */
  function aWaterHouse(b) {
    b.slab(3.2, "grassWater", "sideWater"); b.decal("path", 0.05, 1.25, 0.8, 0.9);
    var X = -0.25, Z = -0.35;
    b.box(1.9, 0.22, 1.7, M("stoneBlue", 1.8, 0.2), X, 0, Z);
    b.box(1.5, 1.0, 1.25, M("stonePale", 1.5, 1), X, 0.22, Z);
    [-0.55, -0.18, 0.18, 0.55].forEach(function (dx) { b.cyl(0.05, 0.06, 1.0, 8, MARBLE(), X + dx, 0.22, Z + 0.7); });
    b.box(1.6, 0.1, 1.45, M("stoneBlue", 1.5, 0.2), X, 1.22, Z + 0.08);
    b.box(1.62, 0.03, 1.47, BRONZE(), X, 1.32, Z + 0.08);
    glassDome(b, X, 1.35, Z, 0.55);
    b.add(new T3.SphereGeometry(0.07, 12, 10), glowMat("#e8f8ff", "#58c8ff", 1.8), X, 1.95, Z, { noCast: true });
    b.box(0.36, 0.62, 0.04, glowMat("#a8dcff", "#3a9ae8", 0.5), X, 0.22, Z + 0.63, { noCast: true });
    b.box(1.0, 0.1, 0.6, M("stoneBlue", 1, 0.5), 0.75, 0, 0.85); b.water(0.3, 0.6, 1.2, 1.1, 0.05, 0.13);
    waterRing(b, X, 1.7, Z, 0.85, 0.3);
    b.oak(-1.15, -1.2, 0.7); b.barrel(-1.2, 0.9);
  }
  function aWaterFarm(b) {
    mWaterFarm(b);
    var AX = -1.85, stoneA = M("stoneBlue", 0.4, 1.2);
    [-1.6, -0.6, 0.4].forEach(function (z) { b.box(0.26, 1.15, 0.26, stoneA, AX, 0, z); });
    [-1.1, -0.1].forEach(function (z) { b.add(new T3.TorusGeometry(0.24, 0.07, 6, 12, PI), stoneA, AX, 0.85, z, { ry: PI / 2 }); });
    b.box(0.34, 0.18, 2.3, M("stoneBlue", 0.3, 2), AX, 1.15, -0.6);
    var at = tex("water", 0.3, 1.5);
    b.add(new T3.BoxGeometry(0.2, 0.03, 2.3), new T3.MeshStandardMaterial({ map: at, roughness: 0.1 }), AX, 1.34, -0.6, { noCast: true });
    var cas = tex("water", 0.4, 1);
    b.add(new T3.PlaneGeometry(0.2, 0.55), new T3.MeshStandardMaterial({ map: cas, transparent: true, opacity: 0.8, side: T3.DoubleSide }), AX + 0.2, 1.0, -1.6, { ry: PI / 2, noCast: true });
    b.fx.push(function (t) { at.offset.y = -t * 0.4; cas.offset.y = t * 0.9; });
    armillary(b, 1.15, 1.75, -1.8, 0.5);
  }
  function aWaterStore(b) {
    b.slabWater(3.2, 1.0, "grassWater", "sideWater");
    var HX = -0.3, HZ = -0.75, bz = BRONZE();
    b.box(2.0, 0.15, 1.4, M("stoneBlue", 2, 1.4), HX, 0, HZ);
    b.box(1.7, 0.95, 1.1, M("stonePale", 1.7, 1), HX, 0.15, HZ);
    [-0.6, 0, 0.6].forEach(function (dx) { b.cyl(0.05, 0.06, 0.95, 8, MARBLE(), HX + dx, 0.15, HZ + 0.6); });
    b.box(1.8, 0.1, 1.25, M("stoneBlue", 1.6, 0.2), HX, 1.1, HZ + 0.05);
    glassDome(b, HX, 1.2, HZ, 0.5);
    b.add(new T3.SphereGeometry(0.06, 10, 8), glowMat("#e8f8ff", "#58c8ff", 1.8), HX, 1.75, HZ, { noCast: true });
    b.box(3.2, 0.1, 0.55, M("stoneBlue", 3, 0.5), 0, -0.05, 0.35);
    b.cyl(0.05, 0.07, 1.6, 8, bz, 0.95, 0, 0.45);
    var arm = new T3.Group(); arm.position.set(0.95, 1.5, 0.45); b.g.add(arm);
    b.beam([0, 0, 0], [-0.1, 0.15, 0.85], 0.03, bz, arm);
    var hook = new T3.Group(); hook.position.set(-0.1, 0.15, 0.85); arm.add(hook);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.8, 4), C("#d8cba6"), 0, -0.4, 0, { parent: hook });
    b.add(new T3.BoxGeometry(0.22, 0.2, 0.22), M("plankWarm", 0.4, 0.4), 0, -0.9, 0, { parent: hook });
    b.fx.push(function (t) { arm.rotation.y = Math.sin(t * 0.4) * 0.6; hook.rotation.x = Math.sin(t * 1.3) * 0.08; });
    b.boat(-0.5, 1.15, 0.1);
    [-0.95, -0.05].forEach(function (x) { b.add(new T3.SphereGeometry(0.06, 10, 8), glowMat("#e8f8ff", "#58c8ff", 1.6), x, 0.25, 1.15, { noCast: true }); });
    b.gold(-1.2, 0.3); b.sack(-0.95, 0.4, 0, "#c9a86a"); b.banner(-1.35, -0.1, 0, "bannerWater", 1.3);
  }
  function aWaterBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater"); b.decal("path", 0.2, 1.35, 2.6, 1.4);
    var HX = -0.3, HZ = -0.65, bz = BRONZE();
    b.add(new T3.BoxGeometry(3.1, 0.3, 2.0), M("stoneBlue", 2, 1.4), HX, 0.15, HZ);
    b.box(2.6, 1.1, 1.3, M("stonePale", 2.4, 1), HX, 0.3, HZ - 0.1);
    for (var c = 0; c < 7; c++) { var x = HX - 1.25 + c * 0.417; b.cyl(0.065, 0.075, 1.1, 10, MARBLE(), x, 0.3, HZ + 0.72); }
    b.box(2.75, 0.14, 1.75, M("stoneBlue", 2.4, 0.2), HX, 1.4, HZ + 0.05);
    b.box(2.77, 0.03, 1.77, bz, HX, 1.54, HZ + 0.05);
    glassDome(b, HX, 1.57, HZ, 0.6);
    armillary(b, HX, 2.55, HZ, 0.45);
    b.box(0.6, 0.85, 0.05, glowMat("#a8dcff", "#3a9ae8", 0.5), HX, 0.3, HZ + 0.56, { noCast: true });
    b.banner(HX - 0.8, HZ + 1.25, 0, "bannerWater", 1.6); b.banner(HX + 0.8, HZ + 1.25, 0, "bannerWater", 1.6);
    b.box(1.4, 0.18, 0.9, M("stoneBlue", 1.3, 0.3), 1.25, 0, 1.1); b.water(0.6, 0.7, 1.9, 1.5, 0.08, 0.16);
    b.target(-1.4, 1.5, 0.3); b.target(-0.8, 1.75, 0.2);
  }
  function aWaterTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var bz = BRONZE(), TX = -0.15, TZ = -0.4;
    b.cyl(0.8, 0.88, 0.25, 16, M("stoneBlue", 3, 0.3), TX, 0, TZ);
    for (var s = 0; s < 6; s++) { var r0 = 0.62 - s * 0.045, r1 = 0.62 - (s + 1) * 0.045; b.add(new T3.CylinderGeometry(r1, r0, 0.48, 18), s % 2 ? MARBLE() : M("stoneBlue", 3, 0.5), TX, 0.25 + 0.48 * s + 0.24, TZ); }
    var top = 0.25 + 6 * 0.48;
    b.cyl(0.6, 0.38, 0.14, 18, M("stoneBlue", 3, 0.2), TX, top, TZ);
    var glass = glowMat("#e8f8ff", "#7fd8ff", 1.3); glass.transparent = true; glass.opacity = 0.85;
    b.add(new T3.CylinderGeometry(0.28, 0.28, 0.4, 10), glass, TX, top + 0.34, TZ, { noCast: true });
    b.add(new T3.SphereGeometry(0.32, 16, 8, 0, 2 * PI, 0, PI / 2), bz, TX, top + 0.54, TZ);
    armillary(b, TX, top + 1.4, TZ, 0.55);
    waterRing(b, TX, top - 0.4, TZ, 0.8, 0.2);
    var L = new T3.PointLight("#7fd8ff", 1.2, 4, 2); L.position.set(TX, top + 0.34, TZ); b.g.add(L);
    [[0.75, 0.6], [-0.95, 0.6]].forEach(function (q) { b.box(0.08, 0.3, 0.3, M("plankDark", 0.2, 0.3), TX + q[0] * 0.55, top - 0.15, TZ + q[1] * 0.55); });
    b.door(TX + 0.5, 0.25, TZ + 0.5, PI / 4, 0.3, 0.5);
    b.boat(-0.65, 1.2, -0.2); b.barrel(-1.15, 0.2);
  }
  function aWaterPen(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var CX = 0.2, CZ = 0.3, bz = BRONZE();
    b.add(new T3.CylinderGeometry(1.2, 1.25, 0.24, 32, 1, true), M("stoneBlue", 5, 0.3, { side: T3.DoubleSide }), CX, 0.12, CZ);
    var wt = tex("water", 1.2, 1.2);
    b.add(new T3.CircleGeometry(1.18, 36), new T3.MeshStandardMaterial({ map: wt, roughness: 0.1, metalness: 0.25 }), CX, 0.17, CZ, { rx: -PI / 2, noCast: true });
    b.fx.push(function (t) { wt.offset.set(t * 0.03, t * 0.02); });
    var RX = -1.0, RZ = -1.0;
    b.cyl(0.35, 0.45, 2.5, 12, M("stoneBlue", 1.4, 2), RX, 0, RZ);
    b.cyl(0.6, 0.38, 0.14, 14, M("stonePale", 2, 0.2), RX, 2.5, RZ);
    b.add(new T3.TorusGeometry(0.5, 0.07, 6, 18), M("wicker", 3, 0.5), RX, 2.7, RZ, { rx: PI / 2 });
    var glass = new T3.MeshStandardMaterial({ color: lin("#8fd8ff"), emissive: lin("#2a9ae8"), emissiveIntensity: 0.7, transparent: true, opacity: 0.6, roughness: 0.05, side: T3.DoubleSide });
    b.add(new T3.ConeGeometry(0.62, 0.7, 12, 1, true), glass, RX, 3.35, RZ, { noCast: true });
    [0, 1, 2, 3].forEach(function (k) { var p = onRing(0.55, k * PI / 2 + PI / 4); b.cyl(0.02, 0.02, 0.5, 4, bz, RX + p[0], 2.64, RZ + p[1]); });
    b.raven(RX + 0.15, 2.66, RZ + 0.1, 1.3, 0.8, false);
    b.cyl(0.07, 0.1, 1.2, 8, bz, 1.6, 0, -1.2); b.beam([1.35, 1.2, -1.2], [1.85, 1.2, -1.2], 0.03, bz);
    b.raven(1.6, 1.16, -1.2, 1.15, 1.2, false);
    var orbit = new T3.Group(); orbit.position.set(0, 2.6, 0); b.g.add(orbit);
    var fly = b.raven(0, 0, 0, 1.05, 0, true); b.g.remove(fly); orbit.add(fly); fly.position.set(1.45, 0, 0); fly.rotation.y = PI; fly.rotation.z = -0.25;
    b.fx.push(function (t) { orbit.rotation.y = t * 0.5; });
    b.cyl(0.08, 0.12, 0.5, 8, MARBLE(), CX, 0.17, CZ); armillary(b, CX, 1.2, CZ, 0.4);
    b.banner(1.9, 1.6, 0, "bannerWater", 1.5);
  }
  function aWaterSanctum(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var CX = -0.55, CZ = -0.55, bz = BRONZE();
    b.add(new T3.CylinderGeometry(1.35, 1.4, 0.35, 28), M("stoneBlue", 4, 0.3), CX, 0.175, CZ);
    b.cyl(1.0, 1.05, 1.3, 22, M("stonePale", 3, 1), CX, 0.35, CZ);
    for (var k = 0; k < 10; k++) { var p = onRing(1.2, k / 10 * 2 * PI); b.cyl(0.06, 0.07, 1.3, 8, MARBLE(), CX + p[0], 0.35, CZ + p[1]); }
    b.add(new T3.CylinderGeometry(1.3, 1.3, 0.12, 28), M("stoneBlue", 4, 0.2), CX, 1.71, CZ);
    glassDome(b, CX, 1.77, CZ, 1.05);
    armillary(b, CX, 3.3, CZ, 0.6);
    b.box(0.55, 0.85, 0.05, glowMat("#a8dcff", "#3a9ae8", 0.6), CX + 0.74, 0.35, CZ + 0.74, { ry: PI / 4, noCast: true });
    var PX = 1.0, PZ = 1.0;
    b.box(1.8, 0.16, 1.8, M("stoneBlue", 1.6, 1.6), PX, 0, PZ); b.water(PX - 0.78, PZ - 0.78, PX + 0.78, PZ + 0.78, 0.1, 0.17);
    var orbM = new T3.MeshStandardMaterial({ color: lin("#9fdcff"), emissive: lin("#3aa8ff"), emissiveIntensity: 1.0, transparent: true, opacity: 0.75, roughness: 0.05 });
    var orb = b.add(new T3.SphereGeometry(0.42, 22, 16), orbM, PX, 1.4, PZ, { noCast: true });
    waterRing(b, PX, 1.4, PZ, 0.7, 0.5);
    var L = new T3.PointLight("#58c8ff", 1.5, 4, 2); b.g.add(L);
    b.fx.push(function (t) { var y = 1.4 + Math.sin(t * 1.2) * 0.1; orb.position.y = y; orb.scale.set(1 + Math.sin(t * 2.3) * 0.05, 1 + Math.sin(t * 2.3 + 1.5) * 0.05, 1); L.position.set(PX, y, PZ); });
    [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].forEach(function (q) { b.cyl(0.06, 0.07, 0.9, 8, MARBLE(), PX + q[0], 0.16, PZ + q[1]); b.add(new T3.SphereGeometry(0.06, 10, 8), glowMat("#e8f8ff", "#58c8ff", 1.4), PX + q[0], 1.12, PZ + q[1], { noCast: true }); });
    b.banner(-1.9, 0.6, 0, "bannerWater", 1.5);
  }
  function aWaterWorkshop(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var bz = BRONZE(), DX = 0.35, DZ = 0.35;
    b.add(new T3.BoxGeometry(2.8, 0.35, 2.0), M("stoneBlue", 2.6, 0.3), DX, 0.175, DZ);
    b.water(DX - 1.2, DZ - 0.8, DX + 1.2, DZ + 0.8, 0.1, 0.3);
    var barge = new T3.Group(); barge.position.set(DX, 0.28, DZ); b.g.add(barge);
    var sh = new T3.Shape(); sh.moveTo(-0.95, 0); sh.quadraticCurveTo(-0.7, 0.42, 0, 0.42); sh.quadraticCurveTo(0.7, 0.42, 0.95, 0); sh.quadraticCurveTo(0.7, -0.42, 0, -0.42); sh.quadraticCurveTo(-0.7, -0.42, -0.95, 0);
    b.add(new T3.ExtrudeGeometry(sh, { depth: 0.28, bevelEnabled: false }), M("plankWarm", 2, 2), 0, 0, 0, { parent: barge, rx: -PI / 2 });
    b.add(new T3.BoxGeometry(1.5, 0.04, 0.7), M("plankDark", 1.5, 0.7), 0, 0.28, 0, { parent: barge });
    b.add(new T3.CylinderGeometry(0.22, 0.26, 0.2, 12), bz, 0.2, 0.38, 0, { parent: barge });
    var gun = new T3.Group(); gun.position.set(0.2, 0.55, 0); barge.add(gun);
    b.add(new T3.CylinderGeometry(0.09, 0.13, 0.85, 12), bz, 0.4, 0.05, 0, { parent: gun, rz: -PI / 2 + 0.25 });
    b.add(new T3.TorusGeometry(0.1, 0.025, 6, 16), bz, 0.82, 0.16, 0, { parent: gun, ry: PI / 2, rx: 0.25 });
    b.add(new T3.SphereGeometry(0.16, 14, 10), glowMat("#e8f8ff", "#58c8ff", 1.5), -0.15, 0.08, 0, { parent: gun, noCast: true });
    b.fx.push(function (t) { gun.rotation.y = Math.sin(t * 0.5) * 0.5; barge.position.y = 0.28 + Math.sin(t * 1.2) * 0.02; });
    [[-1.2, -0.95], [1.9, -0.95]].forEach(function (q) { b.cyl(0.05, 0.07, 1.8, 8, bz, q[0], 0.35, q[1]); });
    b.beam([-1.2, 2.1, -0.95], [1.9, 2.1, -0.95], 0.035, bz);
    b.box(1.4, 1.1, 0.9, M("stonePale", 1.4, 1), -1.15, 0, -1.6);
    glassDome(b, -1.15, 1.1, -1.6, 0.42);
    b.crate(-1.8, 0.2, 0.3, 0.3); b.barrel(-1.6, 0.6); b.banner(1.95, 1.75, 0, "bannerWater", 1.5);
  }

  /* ---------------- Gryffindor ---------------- */
  function aFireHouse(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0, 1.2, 0.9, 1.0);
    var rs = M("stoneRed", 1.4, 1.4), gold = REDGOLD();
    b.box(1.75, 0.18, 1.5, M("stoneWarm", 1.6, 0.2), -0.15, 0, -0.25);
    b.box(1.5, 1.45, 1.2, rs, -0.15, 0.18, -0.25);
    b.gable({ len: 1.5, wid: 1.2, rise: 0.8, over: 0.15, mat: M("shinglesRed", 2, 1.2), gmat: M("stoneRed", 1, 0.6), x: -0.15, y: 1.63, z: -0.25, ridge: gold });
    b.cyl(0.32, 0.36, 2.1, 12, M("stoneWarm", 1.2, 2), 0.62, 0, 0.35);
    b.add(new T3.ConeGeometry(0.44, 0.7, 12), M("shinglesRed", 1.4, 0.8), 0.62, 2.1 + 0.35, 0.35);
    b.add(new T3.SphereGeometry(0.05, 8, 6), gold, 0.62, 2.85, 0.35);
    [[-0.55, 0.65], [0.15, 0.65], [-0.55, 1.25], [0.15, 1.25]].forEach(function (w) { b.window(w[0], w[1], 0.38, 0, 0.18, 0.24, "#ffd38a", "#ff9a3c"); });
    b.door(-0.2, 0.18, 0.36, 0, 0.36, 0.6);
    brazier(b, -1.05, 0.85, 0, 0.9); halo(b, -1.05, 0.95, 0.85, 0.3);
    b.box(0.3, 2.6, 0.3, M("stoneWarm", 0.3, 2.4), -0.75, 0, -0.65); b.smoke(-0.75, 2.7, -0.65, 5);
    b.pine(-1.15, -1.2, 0.7);
  }
  function aFireFarm(b) {
    b.slab(4.2, "grassFire", "sideFire");
    [[-0.3, 0.05], [0.1, 0.25], [0.5, 0.45]].forEach(function (t, i) { b.box(3.0 - i * 0.6, 0.12 + i * 0.15, 0.85, M("stoneWarm", 2.5, 0.3), 0.2, 0, 0.95 - i * 0.85); });
    [[1.05, 0.12], [0.2, 0.27], [-0.65, 0.42]].forEach(function (r, i) { b.lift(r[1], function () { this.wheat(-1.2 + i * 0.3, r[0] - 0.35, 1.6 - i * 0.3, r[0] + 0.35, 3, 8 - i, ["#e8b83a", "#d8a030", "#f2cc5a"]); }); });
    [[-1.55, -1.55], [1.55, -1.6]].forEach(function (g) { b.cyl(0.42, 0.46, 1.5, 14, M("stoneRed", 1.6, 1.4), g[0], 0, g[1]); b.add(new T3.ConeGeometry(0.56, 0.75, 14), M("shinglesRed", 2, 1), g[0], 1.5 + 0.375, g[1]); halo(b, g[0], 2.45, g[1], 0.22); });
    var lava = glowMat("#ffb060", "#ff4a10", 1.5);
    b.box(3.6, 0.02, 0.1, lava, 0, 0.01, 1.75, { noCast: true });
    [[-1.9, 1.75], [1.9, 1.75]].forEach(function (p) { brazier(b, p[0], p[1], 0, 1.0); });
    b.hay(-1.9, 0.0, 0.3); b.scarecrow(0.3, 1.05, "#b3261e");
  }
  function aFireStore(b) {
    b.slab(3.2, "grassFire", "sideFire");
    b.box(2.9, 0.1, 2.9, M("stoneWarm", 2.6, 2.6), 0, 0, 0);
    walledYard(b, 1.35, 0.5, 0.3, false);
    var HX = -0.45, HZ = -0.5;
    b.box(1.35, 1.1, 1.05, M("stoneRed", 1.3, 1), HX, 0.1, HZ);
    b.gable({ len: 1.35, wid: 1.05, rise: 0.55, over: 0.12, mat: M("shinglesRed", 1.8, 1), gmat: M("stoneRed", 1, 0.5), x: HX, y: 1.2, z: HZ, ridge: REDGOLD() });
    var FX = 0.65, FZ = -0.55;
    b.cyl(0.38, 0.6, 1.5, 12, M("stoneWarm", 2, 1.2), FX, 0.1, FZ);
    b.fire(FX, 1.7, FZ, 0.6, 1.0); halo(b, FX, 2.4, FZ, 0.3); b.smoke(FX, 2.2, FZ, 5);
    var cru = new T3.Group(); cru.position.set(0.55, 0.65, 0.45); b.g.add(cru);
    b.add(new T3.CylinderGeometry(0.18, 0.12, 0.22, 12), M("iron"), 0, 0, 0, { parent: cru });
    b.add(new T3.CylinderGeometry(0.15, 0.15, 0.02, 12), glowMat("#ffd080", "#ff8a10", 2), 0, 0.1, 0, { parent: cru, noCast: true });
    var pour = b.add(new T3.CylinderGeometry(0.025, 0.035, 0.45, 8), glowMat("#ffd080", "#ff9a10", 2.2), 0.2, -0.25, 0, { noCast: true, parent: cru });
    b.fx.push(function (t) { cru.rotation.z = -0.5 + Math.sin(t * 0.8) * 0.1; });
    b.cyl(0.03, 0.03, 0.7, 6, M("iron"), 0.3, 0.1, 0.45); b.beam([0.3, 0.8, 0.45], [0.55, 0.75, 0.45], 0.02, M("iron"));
    var gb = C("#f2c040", { metalness: 0.85, roughness: 0.3 });
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3 - r; c++) b.box(0.16, 0.07, 0.34, gb, 0.65 + c * 0.17 + r * 0.085 - 0.15, 0.1 + r * 0.07, 0.75);
  }
  function aFireBarracks(b) {
    b.slab(4.2, "grassFire", "sideFire");
    b.box(4.0, 0.1, 4.0, M("stoneWarm", 3.6, 3.6), 0, 0, 0);
    walledYard(b, 1.85, 0.7, 0.2, true);
    var HX = -0.35, HZ = -0.65;
    b.box(2.4, 1.35, 1.3, M("stoneRed", 2.2, 1.2), HX, 0.1, HZ);
    [[-1.2, 0.65, 1.2, 0.65], [1.2, 0.65, 1.2, -0.65], [1.2, -0.65, -1.2, -0.65], [-1.2, -0.65, -1.2, 0.65]].forEach(function (l) { merlons(b, HX + l[0], HZ + l[1], HX + l[2], HZ + l[3], 1.45, M("stoneWarm", 0.3, 0.3), 0.16); });
    b.gable({ len: 1.9, wid: 1.0, rise: 0.65, over: 0.05, mat: M("shinglesRed", 2.4, 1), gmat: M("stoneRed", 1, 0.5), x: HX, y: 1.45, z: HZ, ridge: REDGOLD() });
    b.box(0.55, 0.75, 0.04, glowMat("#ffb060", "#ff7a2a", 0.8), HX, 0.1, HZ + 0.66, { noCast: true });
    b.box(0.85, 1.25, 0.4, M("stoneWarm", 0.8, 1.2), 0.2, 0, 1.85);
    b.box(0.5, 0.75, 0.03, glowMat("#ffb060", "#ff6a1a", 0.9), 0.2, 0.0, 2.06, { noCast: true });
    b.banner(-0.4, 2.3, 0, "bannerFire", 1.6); b.banner(0.8, 2.3, 0, "bannerFire", 1.6);
    b.target(1.1, 0.8, 0.6); b.target(1.35, 0.25, 0.8); b.dummy(-1.2, 0.95, 0.3); b.dummy(-0.7, 1.15, -0.2);
    brazier(b, 0.3, 0.9, 0.1, 0.9);
  }
  function aFireTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var sw = M("stoneWarm", 0.3, 0.3);
    b.box(1.6, 0.6, 1.6, M("stoneWarm", 1.6, 0.6), 0, 0, 0);
    merlons(b, -0.8, 0.8, 0.8, 0.8, 0.6, sw, 0.14); merlons(b, 0.8, 0.8, 0.8, -0.8, 0.6, sw, 0.14);
    b.cyl(0.55, 0.62, 2.3, 18, M("stoneRed", 2.4, 2.2), 0, 0.6, 0);
    b.cyl(0.74, 0.56, 0.2, 18, M("stoneWarm", 2.4, 0.2), 0, 2.9, 0);
    for (var c = 0; c < 10; c++) { var a = c / 10 * 2 * PI, p = onRing(0.66, a); b.box(0.2, 0.22, 0.14, sw, p[0], 3.1, p[1], { ry: -a }); }
    var bal = new T3.Group(); bal.position.set(0.25, 3.12, 0.25); b.g.add(bal);
    b.add(new T3.BoxGeometry(0.1, 0.1, 0.6), M("plankDark", 0.2, 0.6), 0, 0.08, 0, { parent: bal });
    [-1, 1].forEach(function (s) { b.beam([0, 0.08, 0.2], [s * 0.3, 0.08, 0.05], 0.02, M("iron"), bal); });
    b.fx.push(function (t) { bal.rotation.y = Math.sin(t * 0.6) * 0.8 + PI / 4; });
    b.cyl(0.1, 0.12, 0.3, 8, M("iron"), -0.2, 3.1, -0.2);
    b.cyl(0.3, 0.14, 0.18, 14, M("iron"), -0.2, 3.4, -0.2);
    b.fire(-0.2, 3.58, -0.2, 0.9, 1.4); halo(b, -0.2, 4.35, -0.2, 0.35);
    [1.3, 2.1].forEach(function (y) { b.box(0.07, 0.3, 0.03, glowMat("#ffc070", "#ff8a2a", 1.4), 0.2, 0.6 + y, 0.6, { noCast: true }); });
    b.door(0.4, 0, 0.81, 0, 0.3, 0.5);
    b.pennant(0.55, 3.2, -0.45, "#c0281c", 0.5);
  }
  function aFirePen(b) {
    pFirePen(b);
    var lava = glowMat("#ffb060", "#ff4a10", 1.6);
    b.add(new T3.TorusGeometry(1.08, 0.06, 6, 40), lava, -0.15 + 0.25, 0.08, -0.25, { rx: PI / 2, noCast: true });
    halo(b, 0.1, 2.2, -0.25, 0.35);
    [[-1.4, -1.6], [1.25, -1.6]].forEach(function (q) { b.cyl(0.28, 0.32, 1.7, 12, M("stoneWarm", 1, 1.4), q[0], 0, q[1]); b.add(new T3.ConeGeometry(0.4, 0.55, 12), M("shinglesRed", 1.4, 0.8), q[0], 1.7 + 0.275, q[1]); });
    b.fx.push(function (t) { lava.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.4; });
  }
  function aFireSanctum(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var gold = REDGOLD();
    [[3.5, "stoneWarm"], [2.85, "stoneRed"], [2.2, "stoneWarm"], [1.6, "stoneRed"]].forEach(function (t, i) { b.box(t[0], 0.32, t[0], M(t[1], t[0], 0.3), 0, i * 0.32, 0); });
    for (var s = 0; s < 8; s++) b.box(0.7, 0.16, 0.18, M("stoneWarm", 0.7, 0.2), 0, s * 0.16, 1.75 - s * 0.11);
    var Y = 1.28;
    [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(function (q) { b.cyl(0.07, 0.08, 1.4, 10, gold, q[0], Y, q[1]); });
    b.box(1.5, 0.1, 1.5, M("stoneRed", 1.4, 0.2), 0, Y + 1.4, 0);
    b.hip(0, 0, 1.75, 0.6, Y + 1.5, M("shinglesRed", 2, 1, { flatShading: true }));
    b.cyl(0.3, 0.36, 0.3, 10, M("stoneRed", 1, 0.3), 0, Y, 0);
    b.cyl(0.34, 0.2, 0.12, 14, gold, 0, Y + 0.3, 0);
    b.fire(0, Y + 0.42, 0, 0.85, 1.8);
    halo(b, 0, Y + 1.15, 0, 0.45); halo(b, 0, Y + 2.35, 0, 0.3);
    [[-1.6, 1.6], [1.6, 1.6], [-1.6, -1.6], [1.6, -1.6]].forEach(function (p) { brazier(b, p[0], p[1], 0.32, 0.9); });
    b.banner(-0.6, 2.05, 0, "bannerFire", 1.5); b.banner(0.6, 2.05, 0, "bannerFire", 1.5);
  }
  function aFireWorkshop(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.4, 1.0, 2.6, 2.2);
    var HX = -0.9, HZ = -1.0;
    b.box(1.9, 1.3, 1.3, M("stoneRed", 1.8, 1.2), HX, 0, HZ);
    merlons(b, HX - 0.95, HZ + 0.65, HX + 0.95, HZ + 0.65, 1.3, M("stoneWarm", 0.3, 0.3), 0.15);
    [[-0.5, -0.3], [0.5, -0.3]].forEach(function (c) { b.box(0.32, 2.4, 0.32, M("stoneWarm", 0.3, 2.2), HX + c[0], 0, HZ + c[1]); b.smoke(HX + c[0], 2.5, HZ + c[1], 4); });
    b.box(0.8, 0.8, 0.04, C("#1a0d07"), HX, 0, HZ + 0.66);
    b.box(0.65, 0.65, 0.02, glowMat("#ffb060", "#ff6a1a", 0.9), HX, 0, HZ + 0.68, { noCast: true });
    var TX = 0.75, TZ = 0.65, tr = new T3.Group(); tr.position.set(TX, 0, TZ); tr.rotation.y = PI / 4 + 0.3; b.g.add(tr);
    var w = C("#6a4a2c"), w2 = M("plankDark", 0.3, 1);
    b.add(new T3.BoxGeometry(0.9, 0.1, 1.2), w, 0, 0.12, 0, { parent: tr });
    [-0.35, 0.35].forEach(function (x) { b.beam([x, 0.15, -0.45], [x, 1.25, 0], 0.05, w, tr); b.beam([x, 0.15, 0.45], [x, 1.25, 0], 0.05, w, tr); });
    b.beam([-0.4, 1.25, 0], [0.4, 1.25, 0], 0.045, M("iron"), tr);
    var arm = new T3.Group(); arm.position.set(0, 1.25, 0); tr.add(arm);
    b.add(new T3.BoxGeometry(0.08, 0.08, 2.0), w2, 0, 0, 0.35, { parent: arm });
    b.add(new T3.BoxGeometry(0.35, 0.35, 0.35), M("stoneWarm", 0.4, 0.4), 0, -0.2, -0.55, { parent: arm });
    var fb = new T3.Group(); fb.position.set(0, 0.05, 1.35); arm.add(fb);
    b.add(new T3.SphereGeometry(0.13, 12, 10), glowMat("#ffb060", "#ff5a10", 2), 0, 0, 0, { parent: fb, noCast: true });
    var keep = b.g; b.g = fb; b.fire(0, 0.05, 0, 0.35, 0.8); b.g = keep;
    b.fx.push(function (t) { arm.rotation.x = 0.5 + Math.sin(t * 0.6) * 0.15; });
    brazier(b, -1.9, 1.6, 0, 0.9); b.logs(-1.6, 0.6, 0.3); b.banner(0.2, 1.95, 0, "bannerFire", 1.5);
    b.add(new T3.SphereGeometry(0.12, 10, 8), C("#5a4a3e", { flatShading: true }), 1.8, 0.12, -0.6); b.add(new T3.SphereGeometry(0.12, 10, 8), C("#5a4a3e", { flatShading: true }), 1.95, 0.12, -0.4);
  }

  /* ---------------- Slytherin ---------------- */
  function aEarthHouse(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var X = -0.15, Z = -0.2;
    bigTrunk(b, X, Z, 0.75, 0.5, 2.0, 0, 0.18);
    rootsAround(b, X, Z, 0.6, 1.35, 0.7, 8, PI / 4);
    archDoor(b, X + 0.7 * 0.707, Z + 0.7 * 0.707, PI / 4, 0.32, 0.4, 0);
    trunkWindows(b, X, Z, function (y) { return 0.75 - y / 2.0 * 0.25; }, [[0.1, 0.9], [1.35, 1.0], [0.75, 1.5], [-0.3, 1.45], [1.9, 1.55]]);
    b.add(new T3.CylinderGeometry(0.9, 0.9, 0.06, 24), M("plankWarm", 3, 1), X, 1.2, Z);
    for (var p = 0; p < 14; p++) { var q = onRing(0.87, p / 14 * 2 * PI); b.cyl(0.014, 0.014, 0.22, 4, C("#4a3020"), X + q[0], 1.23, Z + q[1]); }
    canopyAt(b, X, 1.85, Z, 1.4);
    b.mushrooms([[-1.2, 0.9], [-1.05, 1.05], [1.0, -1.1]], capGlow());
    glowRing(b, X, Z, 1.4);
  }
  function aEarthFarm(b) {
    mEarthFarm(b);
    bigTrunk(b, 1.75, 0.3, 0.16, 0.1, 0.8, 0, 0.3); canopyAt(b, 1.75, 0.7, 0.3, 0.8);
    for (var m = 0; m < 8; m++) { var a = m / 8 * 2 * PI, p = onRing(2.0, a); if (Math.abs(a - PI / 2) < 0.4) continue; b.add(new T3.CylinderGeometry(0.06, 0.1, 0.55, 4), SLATE(), p[0], 0.275, p[1], { ry: -a }); b.add(new T3.OctahedronGeometry(0.04, 0), glowMat("#9effc0", "#3cff8a", 1.4), p[0], 0.62, p[1], { noCast: true }); }
    glowRing(b, 0, 0, 2.0); fireflies(b, 0, 0, 10, 0.5, 1.6, 0.6, 1.6);
  }
  function aEarthStore(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var X = -0.2, Z = -0.3;
    bigTrunk(b, X, Z, 1.0, 0.88, 1.15, 0, 0.1);
    b.add(new T3.CircleGeometry(0.88, 16), M("logEnd"), X, 1.16, Z, { rx: -PI / 2, noCast: true });
    rootsAround(b, X, Z, 0.85, 1.45, 0.5, 9, PI / 4);
    var d = new T3.Group(); d.position.set(X + 0.95 * 0.707, 0, Z + 0.95 * 0.707); d.rotation.y = PI / 4; b.g.add(d);
    b.add(new T3.BoxGeometry(1.0, 0.85, 0.3), M("stoneGrey", 1, 0.8), 0, 0.425, 0, { parent: d });
    archDoor(b, X + 1.1 * 0.707, Z + 1.1 * 0.707, PI / 4, 0.4, 0.42, 0);
    bigTrunk(b, X - 0.25, Z - 0.25, 0.08, 0.05, 0.5, 1.15, 0.3); canopyAt(b, X - 0.25, 1.6, Z - 0.25, 0.65);
    orbitStones(b, X, 0.9, Z, 1.45, 5, 1);
    b.basket(1.15, -0.4, "#e0761e"); b.gold(0.3, 1.2); b.logs(-1.2, 0.9, 0.5);
  }
  function aEarthBarracks(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var X = -0.5, Z = -0.6;
    bigTrunk(b, X, Z, 0.9, 0.6, 2.3, 0, 0.15);
    rootsAround(b, X, Z, 0.75, 1.7, 0.9, 9, PI / 4);
    var fa = new T3.CylinderGeometry(0.98, 1.0, 0.9, 20, 1, true, PI / 4 - 0.8, 1.6);
    b.add(fa, M("stoneGrey", 2, 1, { side: T3.DoubleSide }), X, 0.45, Z);
    archDoor(b, X + 1.0 * 0.707, Z + 1.0 * 0.707, PI / 4, 0.4, 0.45, 0);
    trunkWindows(b, X, Z, function (y) { return 0.9 - y / 2.3 * 0.3; }, [[0.0, 1.2], [1.5, 1.25], [0.75, 1.75], [-0.4, 1.7]]);
    canopyAt(b, X, 2.1, Z, 1.6);
    var thorn = C("#3a4a22", { flatShading: true }), thorn2 = C("#5a3d24", { flatShading: true });
    for (var i = 0; i < 30; i++) { var a = -0.2 + i / 29 * 2.0, r = 2.55, x = X + Math.cos(a) * r, z = Z + Math.sin(a) * r; if (Math.abs(a - 0.8) < 0.18) continue; var h = 0.5 + b.rand() * 0.3; b.add(new T3.ConeGeometry(0.08, h, 4), i % 2 ? thorn : thorn2, x, h / 2, z, { rz: Math.cos(a) * 0.35, rx: -Math.sin(a) * 0.35 }); }
    b.target(0.9, 0.9, 0.5); b.target(1.35, 0.35, 0.7); b.dummy(0.3, 1.3, 0.2);
    b.banner(X - 0.9, Z + 1.6, 0, "bannerEarth", 1.6); b.banner(X + 1.6, Z - 0.9, 0, "bannerEarth", 1.6);
  }
  function aEarthTower(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    bigTrunk(b, 0, 0, 0.55, 0.32, 3.0, 0, 0.3);
    rootsAround(b, 0, 0, 0.45, 1.2, 0.6, 7, PI / 4);
    b.add(new T3.CylinderGeometry(0.9, 0.9, 0.1, 20), M("plankWarm", 2, 1), 0, 2.85, 0);
    for (var k = 0; k < 14; k++) { var q = onRing(0.87, k / 14 * 2 * PI); b.cyl(0.015, 0.015, 0.3, 4, C("#4a3020"), q[0], 2.9, q[1]); }
    b.add(new T3.TorusGeometry(0.87, 0.018, 5, 36), C("#4a3020"), 0, 3.2, 0, { rx: PI / 2 });
    canopyAt(b, 0, 3.25, 0, 1.15);
    orbitStones(b, 0, 1.7, 0, 1.1, 4, 1);
    var eye = glowMat("#d8ffb0", "#7aff40", 2.0);
    b.add(new T3.SphereGeometry(0.1, 12, 10), eye, 0.38, 2.2, 0.38, { noCast: true, s: [1, 0.6, 1] });
    archDoor(b, 0.38, 0.38, PI / 4, 0.24, 0.3, 0);
    glowRing(b, 0, 0, 1.3); b.mushrooms([[-1.1, 0.9], [-0.95, 1.05]], capGlow());
  }
  function aEarthPen(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var CX = -0.1, CZ = -0.15;
    b.add(new T3.CylinderGeometry(1.7, 1.75, 0.06, 32), M("grassEarth", 1.6, 1.6, { color: lin("#6a8a60") }), CX, 0.03, CZ);
    [-0.2, 1.3, 2.55, 3.8, 5.0].forEach(function (a) { if (Math.abs(a - PI / 4) < 0.5) return; var p = onRing(1.85, a); trilithon(b, CX + p[0], CZ + p[1], a, 1.15, 0.6); });
    b.serpent(CX, CZ, 1.25, 0.6);
    orbitStones(b, CX, 1.6, CZ, 1.5, 4, 0.9);
    glowRing(b, CX, CZ, 1.85);
    b.mushrooms([[-1.95, 1.3], [-1.8, 1.45], [1.9, -0.7]], capGlow());
    b.banner(1.95, 1.4, 0, "bannerEarth", 1.5);
  }
  function aEarthSanctum(b) {
    mEarthSanctum(b);
    orbitStones(b, 0, 1.6, 0, 1.15, 6, 0.9);
    bigTrunk(b, 0, 0, 0.08, 0.05, 0.4, 1.05, 0.5);
    var heart = glowMat("#3fb868", "#1fd060", 0.6); heart.flatShading = true;
    [[0, 1.75, 0, 0.36], [-0.3, 1.6, 0.12, 0.25], [0.3, 1.58, -0.12, 0.27]].forEach(function (c) { b.add(new T3.IcosahedronGeometry(c[3], 0), heart, c[0], c[1], c[2], { noCast: true }); });
    b.fx.push(function (t) { heart.emissiveIntensity = 0.5 + Math.sin(t * 1.5) * 0.2; });
  }
  function aEarthWorkshop(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var X = -1.0, Z = -1.0;
    bigTrunk(b, X, Z, 0.7, 0.45, 1.8, 0, 0.2);
    rootsAround(b, X, Z, 0.6, 1.4, 0.6, 7, PI / 4);
    var d = new T3.Group(); d.position.set(X + 0.75 * 0.707, 0, Z + 0.75 * 0.707); d.rotation.y = PI / 4; b.g.add(d);
    b.add(new T3.BoxGeometry(1.2, 0.8, 0.35), M("stoneGrey", 1.2, 0.8), 0, 0.4, 0, { parent: d });
    archDoor(b, X + 0.95 * 0.707, Z + 0.95 * 0.707, PI / 4, 0.5, 0.35, 0);
    canopyAt(b, X, 1.6, Z, 1.2);
    var CX = 0.75, CZ = 0.7, cat = new T3.Group(); cat.position.set(CX, 0, CZ); cat.rotation.y = PI / 4 + 0.4; b.g.add(cat);
    b.add(new T3.BoxGeometry(0.85, 0.14, 1.2), M("barkTree", 1, 1), 0, 0.1, 0, { parent: cat });
    [-0.3, 0.3].forEach(function (x) { b.beam([x, 0.15, -0.1], [x, 0.75, -0.1], 0.06, M("barkTree", 0.3, 0.5), cat); });
    var arm = new T3.Group(); arm.position.set(0, 0.25, -0.45); cat.add(arm);
    var pts = [new T3.Vector3(0, 0, 0), new T3.Vector3(0, 0.6, 0.15), new T3.Vector3(0, 1.1, 0.5), new T3.Vector3(0, 1.3, 0.95)];
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 20, 0.07, 7), M("barkTree", 1, 2), 0, 0, 0, { parent: arm });
    [[0, 1.0, 0.4, 0.18], [0.1, 1.2, 0.7, 0.14]].forEach(function (l) { b.add(new T3.IcosahedronGeometry(l[3], 0), C("#3f8a4c", { flatShading: true }), l[0], l[1], l[2], { parent: arm }); });
    b.add(new T3.TorusGeometry(0.16, 0.04, 6, 12), M("wicker", 2, 0.4), 0, 1.32, 1.0, { parent: arm, rx: PI / 2 });
    b.add(new T3.DodecahedronGeometry(0.13, 0), SLATE(), 0, 1.42, 1.0, { parent: arm });
    b.add(new T3.BoxGeometry(0.035, 0.15, 0.04), glowMat("#9effc0", "#3cff8a", 1.6), 0, 1.42, 1.13, { parent: arm, noCast: true });
    b.fx.push(function (t) { arm.rotation.x = -0.35 + Math.sin(t * 0.7) * 0.12; });
    orbitStones(b, X, 1.0, Z, 1.55, 4, 0.9);
    b.banner(1.9, -1.3, 0, "bannerEarth", 1.5); b.mushrooms([[-1.9, 1.2], [-1.75, 1.35]], capGlow());
    b.add(new T3.DodecahedronGeometry(0.14, 0), SLATE(), -0.2, 0.12, 1.7); b.add(new T3.DodecahedronGeometry(0.12, 0), SLATE(), 0.05, 0.1, 1.85);
  }

  var ARC = {
    air: [aAirHouse, aAirFarm, aAirStore, aAirBarracks, aAirTower, aAirPen, aAirSanctum, aAirWorkshop],
    water: [aWaterHouse, aWaterFarm, aWaterStore, aWaterBarracks, aWaterTower, aWaterPen, aWaterSanctum, aWaterWorkshop],
    fire: [aFireHouse, aFireFarm, aFireStore, aFireBarracks, aFireTower, aFirePen, aFireSanctum, aFireWorkshop],
    earth: [aEarthHouse, aEarthFarm, aEarthStore, aEarthBarracks, aEarthTower, aEarthPen, aEarthSanctum, aEarthWorkshop]
  };
