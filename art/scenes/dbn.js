
  /* ================= DARK AGE BUILDINGS in the new design languages ================= */
  TEX.wattle = [128, 128, function (g, w, h, r) {
    g.fillStyle = "#6a4a26"; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 10) { g.fillStyle = jit("#b88a48", r, 0.25); g.beginPath(); for (var x = 0; x <= w; x += 8) g.lineTo(x, y + 4 + Math.sin(x * 0.2 + y) * 2.5); g.lineTo(w, y + 9); g.lineTo(0, y + 9); g.fill(); }
    for (var x2 = 8; x2 < w; x2 += 24) { g.fillStyle = "#5a3a1e"; g.fillRect(x2, 0, 4, h); }
  }];
  TEX.drop = [64, 64, dot("rgba(235,250,255,1)", "rgba(120,200,255,0)")];
  function rough(geo, amt, seed) { var p = geo.attributes.position; for (var i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + (n3(x * 3 + seed, y * 3, z * 3) - 0.5) * amt; p.setXYZ(i, x * k, y, z * k); } geo.computeVertexNormals(); return geo; }
  var BY = { yellow: "#f0c63e", black: "#2a2622" };
  function hexDeck(b, x, z, r, y, mat) {
    var post = M("plankDark", 0.3, 1), wood = mat || M("plankWarm", 2, 2);
    if (y > 0.05) for (var k = 0; k < 6; k++) { var p = dRing(r * 0.85, k * PI / 3 + PI / 6); b.cyl(0.05, 0.065, y, 6, post, x + p[0], 0, z + p[1]); }
    b.add(new T3.CylinderGeometry(r, r, 0.1, 6), [M("plankDark", 3, 0.2), wood, wood], x, y + 0.05, z, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(r + 0.02, r + 0.02, 0.03, 6, 1, true), C(BY.black), x, y + 0.09, z, { ry: PI / 6 });
  }
  function hiveDoor(b, x, y, z, ry, w, h, glow) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry; b.g.add(g);
    var ash = new T3.Shape(); ash.moveTo(-w / 2, 0); ash.lineTo(-w / 2, h); ash.absarc(0, h, w / 2, PI, 0, true); ash.lineTo(w / 2, 0); ash.closePath();
    b.add(new T3.ShapeGeometry(ash), dGlow("#3a2008", "#ff9a20", glow == null ? 0.3 : glow), 0, 0, 0.03, { parent: g, noCast: true });
    b.add(new T3.TorusGeometry(w / 2 + 0.02, 0.035, 6, 6, PI), C(BY.black), 0, h, 0.04, { parent: g });
    return g;
  }
  function hexLamp(b, x, y, z, nx, nz, s) {
    var m = b.add(new T3.CircleGeometry(0.08 * (s || 1), 6), dGlow("#ffd27a", "#ffa420", 1.0), x, y, z, { noCast: true }); m.lookAt(x + nx * 3, y + 0.25, z + nz * 3);
    var f = b.add(new T3.RingGeometry(0.08 * (s || 1), 0.115 * (s || 1), 6), C(BY.black), x, y, z, { noCast: true }); f.lookAt(x + nx * 3, y + 0.25, z + nz * 3);
  }
  function windRose(b, x, y, z, s) {
    var rose = new T3.Group(); rose.position.set(x, y, z); rose.rotation.y = PI / 4; b.g.add(rose);
    var spin = new T3.Group(); rose.add(spin);
    for (var bl = 0; bl < 6; bl++) { var g = new T3.Group(); g.rotation.z = bl * PI / 3; spin.add(g); b.add(new T3.PlaneGeometry(0.1 * s, 0.32 * s), M("canvasBY", 0.3, 0.6, { side: T3.DoubleSide }), 0, 0.19 * s, 0.02, { parent: g, ry: 0.4 }); }
    b.add(new T3.CylinderGeometry(0.04 * s, 0.04 * s, 0.05, 6), C(BY.black), 0, 0, 0.03, { parent: spin, rx: PI / 2 });
    b.fx.push(function (t, dt) { spin.rotation.z -= dt * 2.4; });
  }
  function honeyJars(b, list) {
    var jar = new T3.MeshStandardMaterial({ color: lin("#f2a72e"), emissive: lin("#c06a10"), emissiveIntensity: 0.4, roughness: 0.25 });
    list.forEach(function (q) { b.cyl(0.08, 0.08, 0.18, 6, jar, q[0], 0, q[1]); b.cyl(0.055, 0.055, 0.035, 6, C(BY.black), q[0], 0.18, q[1]); });
  }
  function bySail(b, x, y, z, ry, h) {
    var sh = new T3.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.35 * h, -0.36 * h, 0.08 * h, -h); sh.lineTo(-0.03, -h); sh.closePath();
    var sv = new T3.Group(); sv.position.set(x, y, z); sv.rotation.y = ry; b.g.add(sv);
    var s = b.add(new T3.ShapeGeometry(sh), M("canvasBY", 1, 1, { side: T3.DoubleSide }), 0, 0, 0, { parent: sv });
    var ph = b.rand() * 6; b.fx.push(function (t) { s.scale.x = 1 + Math.sin(t * 1.6 + ph) * 0.2; });
  }

  /* ---------------- Hufflepuff ---------------- */
  function nAirHouse(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.35, 1.15, 0.9, 1.2, -0.3);
    hexDeck(b, -0.15, -0.15, 1.0, 0.3);
    var rOn = dSkep(b, -0.15, 0.4, -0.15, 0.72, 1.15);
    var dr = rOn(0.62); hiveDoor(b, -0.15 + Math.cos(PI / 4) * (dr - 0.01), 0.4, -0.15 + Math.sin(PI / 4) * (dr - 0.01), PI / 4, 0.32, 0.22);
    [[PI / 4 - 0.9, 0.85], [PI / 4 + 0.9, 0.85]].forEach(function (w) { var r = rOn(w[1]) + 0.015; hexLamp(b, -0.15 + Math.cos(w[0]) * r, w[1], -0.15 + Math.sin(w[0]) * r, Math.cos(w[0]), Math.sin(w[0])); });
    b.add(new T3.BoxGeometry(0.62, 0.035, 0.3), M("canvasBY", 0.7, 0.4), -0.15 + 0.62 * 0.707, 0.98, -0.15 + 0.62 * 0.707, { ry: PI / 4, rx: 0.4 });
    b.cyl(0.018, 0.018, 0.4, 6, C(BY.black), -0.15, 1.5, -0.15);
    windRose(b, -0.12, 1.9, -0.12, 0.8);
    for (var s = 0; s < 2; s++) b.box(0.42, 0.3 - s * 0.15, 0.2, M("plankWarm", 0.5, 0.3), 0.62 + s * 0.15, 0, 0.62 + s * 0.15, { ry: PI / 4 });
    honeyJars(b, [[-1.05, 0.95], [-0.85, 1.1]]);
    b.hay(1.05, -0.95, 0.5); b.bush(-1.2, -1.15, 0.16);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 0.9 + b.rand() * 0.6, "#5a9238");
  }
  function nAirFarm(b) {
    b.slab(4.2, "grassAir", "sideAir");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.1, 0, 0.1);
    b.wheat(-1.25, -1.25, 1.45, 1.45, 8, 9, ["#d9b84a", "#c8a83e", "#e6cc6a", "#b8a03a"]);
    var wat = M("wattle", 4, 0.5);
    [[0.1, 1.68, 3.2, 0.06, 0], [1.68, 0.1, 0.06, 3.2, 0], [0.1, -1.48, 3.2, 0.06, 0]].forEach(function (f) { b.box(f[2], 0.36, f[3], wat, f[0], 0, f[1]); });
    b.box(0.06, 0.36, 1.2, wat, -1.48, 0, -0.85); b.box(0.06, 0.36, 1.2, wat, -1.48, 0, 1.05);
    var post = M("plankDark", 0.3, 2), TX = -1.85, TZ = -1.85, H = 2.2;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { b.beam([TX + s[0] * 0.24, 0, TZ + s[1] * 0.24], [TX + s[0] * 0.07, H, TZ + s[1] * 0.07], 0.03, post); });
    [0.6, 1.35].forEach(function (y) { var k = 0.24 - 0.17 * y / H; b.beam([TX - k, y, TZ + k], [TX + k, y, TZ + k], 0.02, post); b.beam([TX + k, y, TZ - k], [TX + k, y, TZ + k], 0.02, post); });
    b.add(new T3.CylinderGeometry(0.16, 0.16, 0.1, 6), C(BY.black), TX, H + 0.02, TZ, { ry: PI / 6 });
    windRose(b, TX + 0.1, H + 0.15, TZ + 0.1, 1.6);
    [[1.85, -0.9], [1.85, -0.35], [1.85, 0.2]].forEach(function (q) { b.cyl(0.03, 0.03, 0.3, 5, post, q[0], 0, q[1]); b.box(0.36, 0.04, 0.36, M("plankWarm", 0.4, 0.4), q[0], 0.3, q[1]); dSkep(b, q[0], 0.34, q[1], 0.16, 0.34); });
    var sc = new T3.Group(); b.g.add(sc);
    b.scarecrow(0.3, 0.25, BY.yellow);
    b.add(new T3.CylinderGeometry(0.105, 0.165, 0.05, 8), C(BY.black), 0.3, 0.55, 0.25, { noCast: true });
    honeyJars(b, [[-1.85, 1.85], [-1.65, 1.95]]); b.hay(1.95, 1.75, 0.3);
    for (var i = 0; i < 12; i++) b.tuft(-2 + b.rand() * 4, 1.8 + b.rand() * 0.3, "#5a9238");
  }
  function nAirStore(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.4, 1.1, 1.2, 1.0, -0.3);
    var CX = -0.25, CZ = -0.25, post = M("plankDark", 0.3, 1);
    hexDeck(b, CX, CZ, 1.05, 0.22);
    for (var k = 0; k < 6; k++) { var p = dRing(0.95, k * PI / 3 + PI / 6); b.cyl(0.045, 0.05, 1.05, 6, post, CX + p[0], 0.32, CZ + p[1]); }
    b.add(new T3.ConeGeometry(1.22, 0.85, 6, 1, true), M("canvasBY", 3, 1, { side: T3.DoubleSide }), CX, 1.37 + 0.425, CZ, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(1.2, 1.2, 0.06, 6), C(BY.black), CX, 1.37, CZ, { ry: PI / 6 });
    b.add(new T3.ConeGeometry(0.08, 0.2, 6), C(BY.black), CX, 2.32, CZ, { ry: PI / 6 });
    b.lift(0.32, function () {
      this.logs(CX - 0.35, CZ - 0.2, PI / 2);
      this.crate(CX + 0.35, CZ - 0.4, 0.28, 0.2); this.crate(CX + 0.37, CZ - 0.4, 0.2, -0.3);
      this.sack(CX + 0.1, CZ + 0.4, 0, "#c9a86a"); this.sack(CX + 0.38, CZ + 0.3, 0, "#c9a86a"); this.gold(CX - 0.25, CZ + 0.35);
    });
    var MX = 1.1, MZ = 0.6;
    b.cyl(0.05, 0.07, 1.9, 8, post, MX, 0, MZ);
    b.beam([MX, 1.8, MZ], [MX + 0.45, 2.0, MZ + 0.45], 0.03, post);
    var pv = new T3.Group(); pv.position.set(MX + 0.45, 2.0, MZ + 0.45); b.g.add(pv);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.95, 4), C("#d8cba6"), 0, -0.47, 0, { parent: pv });
    var netM = new T3.MeshStandardMaterial({ map: tex("net", 1, 1), transparent: true, alphaTest: 0.4, side: T3.DoubleSide, roughness: 1 });
    b.add(new T3.SphereGeometry(0.17, 10, 8), netM, 0, -1.05, 0, { parent: pv, s: [1, 1.2, 1] });
    b.add(new T3.SphereGeometry(0.13, 8, 6), C("#c9a86a"), 0, -1.07, 0, { parent: pv });
    b.fx.push(function (t) { pv.rotation.z = Math.sin(t * 1.2) * 0.08; pv.rotation.x = Math.sin(t * 0.9) * 0.05; });
    dPennant(b, MX, 1.9, MZ, BY.yellow);
    b.hay(-1.25, 1.0, 0.3); honeyJars(b, [[1.2, -0.9], [1.0, -1.1]]);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 1.0 + b.rand() * 0.5, "#5a9238");
  }
  function nAirBarracks(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.4, 1.3, 2.6, 1.5);
    var HX = -0.35, HZ = -0.6, post = M("plankDark", 0.3, 1);
    b.box(2.9, 0.12, 1.6, M("plankWarm", 3, 1.6), HX, 0.18, HZ);
    [[-1.35, -0.7], [-1.35, 0.7], [1.35, -0.7], [1.35, 0.7], [0, -0.7], [0, 0.7]].forEach(function (p) { b.cyl(0.05, 0.065, 0.18, 6, post, HX + p[0], 0, HZ + p[1]); });
    var sk = M("skep", 4, 3), skE = M("skep", 3, 2);
    b.add(new T3.CylinderGeometry(0.72, 0.72, 1.7, 22, 1, true, 0, PI), sk, HX, 0.3, HZ, { rz: PI / 2 });
    [-1, 1].forEach(function (s2) { b.add(new T3.SphereGeometry(0.72, 22, 10, 0, PI, 0, PI / 2), skE, HX + s2 * 0.85, 0.3, HZ, { ry: s2 * PI / 2 }); });
    for (var a2 = 0; a2 < 5; a2++) { var x2 = HX - 0.7 + a2 * 0.35; b.add(new T3.TorusGeometry(0.735, 0.025, 5, 20, PI), C(BY.black), x2, 0.3, HZ, { ry: PI / 2 }); }
    hiveDoor(b, HX, 0.3, HZ + 0.71, 0, 0.38, 0.3, 0.35);
    [-0.6, 0.6].forEach(function (dx) { hexLamp(b, HX + dx, 0.62, HZ + 0.6, 0, 1); });
    b.add(new T3.BoxGeometry(1.5, 0.035, 0.42), M("canvasBY", 1.6, 0.5), HX, 0.95, HZ + 0.88, { rx: 0.45 });
    b.banner(HX - 0.95, HZ + 1.15, 0, "bannerAir", 1.45); b.banner(HX + 0.95, HZ + 1.15, 0, "bannerAir", 1.45);
    b.dummy(1.3, 1.3, 0.3); b.dummy(1.8, 0.8, -0.2);
    b.rack(-1.35, 1.45, 0.2, "spear");
    b.cyl(0.035, 0.05, 2.4, 8, post, 1.75, 0, -1.55);
    bySail(b, 1.75, 2.3, -1.55, PI / 4, 1.3);
    dPennant(b, 1.75, 2.4, -1.55, BY.black);
    b.hay(-1.85, 0.6, 0.3); honeyJars(b, [[-1.9, 1.15], [-1.75, 1.3]]);
    for (var j = 0; j < 10; j++) b.tuft(-2 + b.rand() * 4, 1.7 + b.rand() * 0.3, "#5a9238");
  }
  function nAirTower(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var post = M("plankDark", 0.4, 3), rope = C("#d8cba6");
    hexDeck(b, 0, 0, 0.55, 0.0);
    b.cyl(0.08, 0.12, 3.0, 8, post, 0, 0.1, 0);
    [[1.25, 0.2], [-0.3, 1.25], [0.2, -1.25], [-1.25, -0.3]].forEach(function (g) { b.beam([0, 2.6, 0], [g[0], 0, g[1]], 0.01, rope); b.cyl(0.03, 0.04, 0.15, 5, post, g[0], 0, g[1]); });
    var NY = 2.45;
    b.add(new T3.CylinderGeometry(0.5, 0.38, 0.42, 6, 1, true), M("wattle", 3, 0.6, { side: T3.DoubleSide }), 0, NY + 0.21, 0, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.38, 0.38, 0.05, 6), M("plankWarm", 0.8, 0.8), 0, NY + 0.02, 0, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.52, 0.52, 0.04, 6, 1, true), C(BY.black), 0, NY + 0.42, 0, { ry: PI / 6 });
    for (var k = 0; k < 3; k++) { var p = dRing(0.42, k * 2 * PI / 3 + 0.4); b.beam([p[0], NY + 0.42, p[1]], [0, NY + 1.0, 0], 0.015, post); }
    b.add(new T3.ConeGeometry(0.62, 0.42, 6, 1, true), M("canvasBY", 2, 0.6, { side: T3.DoubleSide }), 0, NY + 0.95, 0, { ry: PI / 6 });
    b.cyl(0.015, 0.015, 0.4, 5, C(BY.black), 0, NY + 1.15, 0);
    dPennant(b, 0, NY + 1.52, 0, BY.yellow);
    var lad = M("plankWarm", 0.2, 2);
    [-0.1, 0.1].forEach(function (dx) { b.beam([0.35 + dx * 0.7, 0.05, 0.35 - dx * 0.7], [0.2 + dx * 0.7, NY, 0.2 - dx * 0.7], 0.012, rope); });
    for (var r = 0; r < 9; r++) { var t = r / 9, y = 0.25 + t * (NY - 0.3), o = 0.35 - t * 0.15; b.beam([o + 0.07, y, o - 0.07], [o - 0.07, y, o + 0.07], 0.012, M("plankWarm", 0.2, 0.2)); }
    b.add(new T3.CylinderGeometry(0.06, 0.07, 0.12, 6), dGlow("#ffd27a", "#ffa420", 1.2), 0.38, NY + 0.3, 0.2, { noCast: true });
    b.windsock(-1.1, 0.9, 1.3);
    b.hay(1.1, -1.0, 0.3); b.bush(-1.2, -1.1, 0.15);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 0.9 + b.rand() * 0.6, "#5a9238");
  }

  /* ---------------- Ravenclaw ---------------- */
  var BRZ = function () { return C("#c08a4a", { metalness: 0.75, roughness: 0.3 }); };
  function porthole(b, x, y, z, nx, nz, s) {
    var g = b.add(new T3.CircleGeometry(0.1 * (s || 1), 16), dGlow("#bfe8ff", "#4ab0f0", 0.7), x, y, z, { noCast: true }); g.lookAt(x + nx * 3, y, z + nz * 3);
    var r = b.add(new T3.TorusGeometry(0.11 * (s || 1), 0.022, 6, 16), BRZ(), x, y, z); r.lookAt(x + nx * 3, y, z + nz * 3);
  }
  function shellMouth(b, x, y, z, ry, s) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.scale.setScalar(s); b.g.add(g);
    b.add(new T3.TorusGeometry(0.34, 0.09, 8, 24, PI * 1.25), M("pearl", 2, 0.5, { color: lin("#f6dcd4") }), 0, 0.34, 0.03, { parent: g, rz: -PI * 0.125 });
    b.add(new T3.CircleGeometry(0.31, 22), dGlow("#1a3a5a", "#2a7ac8", 0.45), 0, 0.34, 0.02, { parent: g, noCast: true });
  }
  function shells(b, list) {
    var sm = M("pearl", 0.3, 0.3, { color: lin("#f6d8cc") });
    list.forEach(function (q, i) { b.add(new T3.SphereGeometry(0.07, 10, 6, 0, 2 * PI, 0, PI / 2), sm, q[0], q[2] || 0, q[1], { s: [1, 0.5, 1.3], ry: i * 1.3 }); });
  }
  function hullRoof(b, x, y, z, len, wid, ry) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; b.g.add(g);
    b.add(new T3.SphereGeometry(1, 28, 12, 0, 2 * PI, 0, PI / 2), M("drift", 4, 2), 0, 0, 0, { parent: g, s: [len / 2, 0.6, wid / 2] });
    b.add(new T3.BoxGeometry(len * 0.92, 0.07, 0.07), C("#5a4a3a"), 0, 0.6, 0, { parent: g });
    for (var i = -2; i <= 2; i++) { var xx = i * len * 0.18, k = Math.sqrt(Math.max(0, 1 - Math.pow(xx / (len / 2), 2))); b.add(new T3.TorusGeometry(wid / 2 * k + 0.01, 0.02, 5, 20, PI), C("#5a4a3a"), xx, 0, 0, { parent: g, ry: PI / 2, s: [1, 0.6 / (wid / 2) * 1.0, 1] }); }
    return g;
  }
  function nWaterHouse(b) {
    b.slab(3.2, "grassWater", "sideWater"); b.decal("path", 0.2, 1.15, 0.8, 1.0, -0.2);
    var HX = -0.2, HZ = -0.25;
    b.add(new T3.CylinderGeometry(0.95, 1.0, 0.08, 24), M("dirt", 1, 1, { color: lin("#f0e2c0") }), HX, 0.04, HZ);
    b.cyl(0.66, 0.7, 0.68, 14, M("drift", 3, 0.7), HX, 0.08, HZ);
    b.add(new T3.TorusGeometry(0.69, 0.03, 6, 28), C("#6a5a48"), HX, 0.36, HZ, { rx: PI / 2 });
    dConch(b, HX, HZ, 1.15, 0.8, 0.74, 3.5);
    shellMouth(b, HX + Math.cos(PI / 4) * 0.68, 0.08, HZ + Math.sin(PI / 4) * 0.68, PI / 4, 0.75);
    [PI / 4 + 0.95, PI / 4 - 0.95].forEach(function (a) { var p = dRing(0.7, a); porthole(b, HX + p[0], 0.5, HZ + p[1], p[0], p[1], 0.85); });
    var WX = 0.85, WZ = 0.8;
    b.add(new T3.CylinderGeometry(0.26, 0.28, 0.26, 16, 1, true), M("pearl", 1.5, 0.3, { side: T3.DoubleSide, color: lin("#e8d8d0") }), WX, 0.13, WZ);
    b.add(new T3.TorusGeometry(0.27, 0.04, 6, 18), M("pearl", 1, 0.2), WX, 0.26, WZ, { rx: PI / 2 });
    b.add(new T3.CircleGeometry(0.25, 16), dGlow("#2a78b6", "#103a60", 0.4), WX, 0.18, WZ, { rx: -PI / 2, noCast: true });
    b.add(new T3.TorusGeometry(0.26, 0.02, 6, 16, PI), BRZ(), WX, 0.27, WZ, { ry: PI / 4 });
    b.add(new T3.CylinderGeometry(0.05, 0.04, 0.09, 8), BRZ(), WX, 0.36, WZ);
    shells(b, [[-1.1, 0.9], [-0.9, 1.15], [1.15, -0.8]]);
    var reed = C("#6a8a3a", { flatShading: true });
    for (var k = 0; k < 5; k++) b.add(new T3.ConeGeometry(0.02, 0.45 + b.rand() * 0.2, 3), reed, -1.15 + (b.rand() - 0.5) * 0.2, 0.1, -1.1 + (b.rand() - 0.5) * 0.2, { rz: (b.rand() - 0.5) * 0.4 });
    b.barrel(1.15, -0.15);
  }
  function nWaterFarm(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var soil = M("soil", 1, 3), pr = M("pearl", 3, 0.3, { color: lin("#e8d8d0") });
    [-1.1, 0, 1.1].forEach(function (x) { b.box(0.85, 0.12, 2.9, soil, x, 0, 0.1); b.box(0.89, 0.14, 0.06, pr, x, 0, -1.37); b.box(0.89, 0.14, 0.06, pr, x, 0, 1.57); });
    b.water(-0.675, -1.35, -0.425, 1.55, 0, 0.07); b.water(0.425, -1.35, 0.675, 1.55, 0, 0.07); b.water(-1.6, -1.65, 1.6, -1.4, 0, 0.07);
    var kelp = ["#4f8a6a", "#3f7a5a", "#6aa87a"];
    b.lift(0.12, function () { this.wheat(-1.45, -1.25, -0.75, 1.45, 9, 2, kelp); this.wheat(0.75, -1.25, 1.45, 1.45, 9, 2, kelp); });
    b.cabbages(-0.35, -1.25, 0.35, 1.45, 7, 2, "#5f9e4a", 0.12);
    var r = dConch(b, -1.9, -1.55, 1.3, 0.42, 0.0, 3.5);
    var drops = [], dm = new T3.SpriteMaterial({ map: tex("drop"), transparent: true, depthWrite: false });
    for (var d = 0; d < 12; d++) { var s = new T3.Sprite(dm); s.scale.set(0.05, 0.05, 1); b.g.add(s); drops.push([s, d / 12]); }
    var sx = -1.9 + 0.2, sy = 0.95, sz = -1.55 + 0.2, ex = -0.55, ez = -1.52;
    b.fx.push(function (t) { drops.forEach(function (q) { var k = (t * 0.6 + q[1]) % 1; q[0].position.set(sx + (ex - sx) * k, sy + 0.3 * k - (sy + 0.2) * k * k, sz + (ez - sz) * k); }); });
    b.cyl(0.03, 0.04, 1.0, 6, C("#6a5a48"), 1.85, 0, 1.85);
    var chime = new T3.Group(); chime.position.set(1.85, 0.98, 1.85); b.g.add(chime);
    [-0.06, 0.0, 0.06].forEach(function (dx, i) { b.add(new T3.CylinderGeometry(0.015, 0.015, 0.2 + i * 0.05, 6), BRZ(), dx, -0.15 - i * 0.02, 0, { parent: chime }); });
    b.fx.push(function (t) { chime.rotation.z = Math.sin(t * 2.1) * 0.15; });
    var drift = C("#8a8478");
    [[1.85, -1.85], [1.85, -0.6], [1.85, 0.65], [-1.2, -1.85], [0.1, -1.85]].forEach(function (p) { b.cyl(0.04, 0.05, 0.42, 6, drift, p[0], 0, p[1]); });
    b.beam([1.85, 0.3, -1.85], [1.85, 0.3, 0.65], 0.012, C("#d8cba6")); b.beam([-1.2, 0.3, -1.85], [1.85, 0.3, -1.85], 0.012, C("#d8cba6"));
    shells(b, [[-1.85, 1.75], [-1.65, 1.9], [1.5, 1.95]]); b.basket(-1.9, 1.35, "#5f9e4a");
  }
  function nWaterStore(b) {
    b.slabWater(3.2, 1.0, "grassWater", "sideWater");
    var HX = -0.35, HZ = -0.7;
    b.box(1.9, 0.12, 1.3, M("drift", 2, 1.3), HX, 0, HZ);
    b.box(1.6, 0.62, 0.95, M("drift", 2, 0.7), HX, 0.12, HZ);
    hullRoof(b, HX, 0.74, HZ, 2.0, 1.2, 0);
    shellMouth(b, HX, 0.12, HZ + 0.48, 0, 0.62);
    porthole(b, HX + 0.81, 0.45, HZ, 1, 0, 0.8); porthole(b, HX - 0.55, 0.45, HZ + 0.48, 0, 1, 0.75);
    b.box(0.95, 0.06, 1.2, M("drift", 1, 1.5), 0.65, -0.04, 1.0);
    [[0.22, 0.45], [1.08, 0.45], [0.22, 1.55], [1.08, 1.55]].forEach(function (q) { b.cyl(0.04, 0.045, 0.6, 7, C("#6a5a48"), q[0], -0.45, q[1]); });
    dConch(b, 1.0, 1.45, 0.75, 0.2, 0.02, 3);
    b.lift(0.02, function () { this.barrel(0.45, 0.85); this.barrel(0.72, 0.72); this.basket(0.45, 1.3, "#9fb8c8"); });
    b.boat(-0.6, 1.15, 0.15);
    var netM = new T3.MeshStandardMaterial({ map: tex("net", 2, 1), transparent: true, alphaTest: 0.4, side: T3.DoubleSide, roughness: 1 });
    [[-1.3, 0.0], [-1.3, 0.75]].forEach(function (q) { b.cyl(0.03, 0.035, 0.85, 6, C("#6a5a48"), q[0], 0, q[1]); });
    var net = b.add(new T3.PlaneGeometry(0.75, 0.5), netM, -1.3, 0.55, 0.37, { ry: PI / 2, noCast: true });
    b.fx.push(function (t) { net.rotation.z = Math.sin(t * 1.3) * 0.05; });
    b.logs(-1.2, -1.2, 0.3); b.gold(0.6, -0.1); b.sack(0.85, 0.05, 0, "#c9a86a");
    shells(b, [[-0.9, 0.25], [0.3, 0.2]]);
    b.banner(0.75, -0.25, 0, "bannerWater", 1.3);
  }
  function nWaterBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater"); b.decal("path", 0.3, 1.3, 2.6, 1.5);
    var HX = -0.3, HZ = -0.6;
    b.box(2.7, 0.14, 1.6, M("drift", 3, 1.6), HX, 0, HZ);
    b.box(2.2, 0.85, 1.2, M("drift", 3, 0.9), HX, 0.14, HZ);
    hullRoof(b, HX, 0.99, HZ, 2.5, 1.45, 0);
    [-1, 1].forEach(function (s) { b.cyl(0.36, 0.4, 0.7, 12, M("drift", 1.5, 0.7), HX + s * 1.28, 0.14, HZ); dConch(b, HX + s * 1.28, HZ, 1.25, 0.42, 0.84, 3.5); });
    shellMouth(b, HX, 0.14, HZ + 0.6, 0, 0.8);
    [-0.65, 0.65].forEach(function (dx) { porthole(b, HX + dx, 0.62, HZ + 0.61, 0, 1, 0.85); });
    var ws = new T3.Shape(); ws.moveTo(0, 0); ws.lineTo(0.55, 0); ws.quadraticCurveTo(0.6, 0.55, 0.32, 0.7); ws.quadraticCurveTo(0.1, 0.78, 0.04, 0.58); ws.quadraticCurveTo(0.18, 0.6, 0.26, 0.5); ws.quadraticCurveTo(0.36, 0.35, 0.2, 0.12); ws.closePath();
    var waveM = new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#1a6ab0"), emissiveIntensity: 0.45, transparent: true, opacity: 0.85, roughness: 0.1, side: T3.DoubleSide });
    [[-1.55, 1.2, 0], [0.95, 1.2, 0]].forEach(function (q) { b.add(new T3.ExtrudeGeometry(ws, { depth: 0.9, bevelEnabled: false }), waveM, q[0], 0, q[1], { ry: -PI / 2 }); });
    b.rack(-1.3, 1.6, 0.2, "oar"); b.rack(1.25, 1.65, -0.2, "spear");
    b.banner(HX - 0.6, HZ + 1.05, 0, "bannerWater", 1.45); b.banner(HX + 0.6, HZ + 1.05, 0, "bannerWater", 1.45);
    shells(b, [[1.8, -1.6], [1.6, -1.8], [-1.9, -1.6]]);
    var reed = C("#6a8a3a", { flatShading: true });
    for (var k = 0; k < 6; k++) b.add(new T3.ConeGeometry(0.02, 0.5 + b.rand() * 0.2, 3), reed, 1.8 + (b.rand() - 0.5) * 0.25, 0.1, 0.4 + (b.rand() - 0.5) * 0.25, { rz: (b.rand() - 0.5) * 0.4 });
  }
  function nWaterTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var TX = -0.2, TZ = -0.45;
    b.add(rough(new T3.CylinderGeometry(0.75, 0.9, 0.35, 9, 2), 0.25, 6), C("#8a8e94", { flatShading: true }), TX, 0.175, TZ);
    var rAt = dConch(b, TX, TZ, 2.8, 0.62, 0.3, 5);
    shellMouth(b, TX + 0.55 * 0.707, 0.33, TZ + 0.55 * 0.707, PI / 4, 0.65);
    [[PI / 4 + 0.5, 1.1], [PI / 4 - 0.6, 1.55]].forEach(function (w) { var r = rAt(w[1] - 0.3) + 0.01; porthole(b, TX + Math.cos(w[0]) * r, w[1], TZ + Math.sin(w[0]) * r, Math.cos(w[0]), Math.sin(w[0]), 0.65); });
    var LY = 3.12, bz = BRZ();
    b.add(new T3.CylinderGeometry(0.2, 0.2, 0.03, 10), bz, TX, LY - 0.02, TZ);
    for (var k = 0; k < 4; k++) { var p = dRing(0.16, k * PI / 2 + PI / 4); b.cyl(0.012, 0.012, 0.3, 4, bz, TX + p[0], LY, TZ + p[1]); }
    var orb = dGlow("#d6f4ff", "#58c8ff", 1.6);
    b.add(new T3.SphereGeometry(0.12, 14, 10), orb, TX, LY + 0.15, TZ, { noCast: true });
    b.add(new T3.ConeGeometry(0.2, 0.16, 10), bz, TX, LY + 0.38, TZ);
    var L = new T3.PointLight("#58c8ff", 0.9, 3, 2); L.position.set(TX, LY + 0.15, TZ); b.g.add(L);
    b.fx.push(function (t) { var k = 1 + Math.sin(t * 1.8) * 0.3; orb.emissiveIntensity = 1.4 * k; L.intensity = 0.8 * k; });
    b.box(0.6, 0.06, 0.8, M("drift", 0.6, 1), 0.7, -0.04, 1.05);
    [[0.42, 0.7], [0.98, 0.7], [0.42, 1.42], [0.98, 1.42]].forEach(function (q) { b.cyl(0.035, 0.04, 0.5, 7, C("#6a5a48"), q[0], -0.4, q[1]); });
    b.boat(-0.65, 1.2, -0.2); shells(b, [[-1.15, 0.25], [1.15, -1.0]]);
  }

  /* ---------------- Gryffindor ---------------- */
  var GOLDF = function () { return C("#e3a83a", { metalness: 0.7, roughness: 0.3 }); };
  function spikeRing(b, x, z, half, y, n) {
    var spk = M("iron");
    for (var k = -n; k <= n; k++) { var o = k / n * half * 0.9; [[o, half], [half, o], [o, -half], [-half, o]].forEach(function (pp) { b.add(new T3.ConeGeometry(0.035, 0.17, 4), spk, x + pp[0], y + 0.085, z + pp[1]); }); }
  }
  function forgeGate(b, x, y, z, ry, w, h, lion) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; b.g.add(g);
    var ash = new T3.Shape(); ash.moveTo(-w / 2, 0); ash.lineTo(-w / 2, h * 0.6); ash.lineTo(0, h); ash.lineTo(w / 2, h * 0.6); ash.lineTo(w / 2, 0); ash.closePath();
    b.add(new T3.ShapeGeometry(ash), C("#120808"), 0, 0, 0.01, { parent: g, noCast: true });
    var gg = new T3.MeshBasicMaterial({ color: lin("#ff8a3d"), transparent: true, opacity: 0.6 });
    b.add(new T3.ShapeGeometry(ash), gg, 0, 0.03, 0.015, { parent: g, noCast: true, s: [0.78, 0.82, 1] });
    var ph = b.rand() * 6; b.fx.push(function (t) { gg.opacity = 0.5 + Math.sin(t * 5 + ph) * 0.1; });
    if (lion) {
      var head = new T3.Group(); head.position.set(0, h + 0.2, 0.04); g.add(head);
      b.add(new T3.SphereGeometry(0.1 * lion, 12, 9), GOLDF(), 0, 0, 0, { parent: head, s: [1, 1, 0.7] });
      b.add(new T3.SphereGeometry(0.045 * lion, 10, 8), GOLDF(), 0, -0.03 * lion, 0.07 * lion, { parent: head });
      for (var m = 0; m < 10; m++) { var a = m / 10 * 2 * PI; b.add(new T3.ConeGeometry(0.028 * lion, 0.1 * lion, 4), GOLDF(), Math.cos(a) * 0.12 * lion, Math.sin(a) * 0.12 * lion, -0.02, { parent: head, rz: a - PI / 2 }); }
    }
    return g;
  }
  function basaltBowl(b, x, z, y0, s) {
    dFrustum(b, x, y0 || 0, z, 0.2 * s, 0.15 * s, 0.25 * s, M("basalt", 0.4, 0.3));
    dFrustum(b, x, (y0 || 0) + 0.25 * s, z, 0.14 * s, 0.24 * s, 0.12 * s, M("iron"));
    b.add(new T3.CylinderGeometry(0.16 * s, 0.16 * s, 0.01, 4), dGlow("#ffb060", "#ff4a10", 1.5), x, (y0 || 0) + 0.37 * s, z, { ry: PI / 4, noCast: true });
    dFlame(b, x, (y0 || 0) + 0.37 * s, z, 0.4 * s, 0.4 * s);
  }
  function stakes(b, x0, z0, x1, z1, n) {
    var st = C("#6a4a2c", { flatShading: true }), nx = -(z1 - z0), nz = x1 - x0, L = Math.hypot(nx, nz); nx /= L; nz /= L;
    for (var i = 0; i < n; i++) { var t = i / (n - 1); b.add(new T3.ConeGeometry(0.06, 0.6, 5), st, x0 + (x1 - x0) * t, 0.26, z0 + (z1 - z0) * t, { rx: nz * 0.25, rz: -nx * 0.25 }); }
  }
  function stepHut(b, x, z, r, h, tiers, top) {
    var bas = M("basalt", 2, 0.8), gold = GOLDF(), y = 0;
    dFrustum(b, x, 0, z, r + 0.15, r + 0.1, 0.12, M("basalt", 2, 0.2)); y = 0.12;
    dFrustum(b, x, y, z, r, r * 0.9, h, bas); y += h;
    dFrustum(b, x, y, z, r * 0.94, r * 0.92, 0.05, gold); y += 0.05;
    spikeRing(b, x, z, r * 0.9 * 0.707, y - 0.05, 2);
    if (tiers > 1) { dFrustum(b, x, y, z, r * 0.68, r * 0.55, h * 0.5, bas); y += h * 0.5; dFrustum(b, x, y, z, r * 0.58, r * 0.56, 0.04, gold); y += 0.04; }
    if (top === "iron") { dFrustum(b, x, y, z, r * 0.5, 0.03, r * 0.45, M("ironPlate", 1, 1)); }
    return y;
  }
  function nFireHouse(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0.2, 0.9, 1.2, 1.4, -0.2);
    var X = -0.25, Z = -0.3;
    var y = stepHut(b, X, Z, 0.85, 0.75, 2, "iron");
    forgeGate(b, X, 0.12, Z + 0.85 * 0.9 * 0.707 + 0.04, 0, 0.36, 0.55, 0.7);
    b.box(0.03, 0.22, 0.12, dGlow("#ffd38a", "#ff9a3c", 1.2), X + 0.85 * 0.9 * 0.707 + 0.03, 0.55, Z, { noCast: true });
    dFrustum(b, X + 0.45, 0.6, Z - 0.45, 0.2, 0.13, 1.45, M("basalt", 0.5, 1.4));
    b.cyl(0.1, 0.1, 0.03, 4, dGlow("#ffb060", "#ff4a10", 1.5), X + 0.45, 2.05, Z - 0.45, { ry: PI / 4, noCast: true });
    dFlame(b, X + 0.45, 2.07, Z - 0.45, 0.28, 0.25); dSmoke(b, X + 0.45, 2.3, Z - 0.45, 4);
    basaltBowl(b, 0.85, 0.75, 0, 1.0);
    stakes(b, -1.4, -1.4, -1.4, 0.8, 7);
    b.logs(1.0, -1.0, 0.4); b.pine(-1.15, 1.15, 0.6);
  }
  function nFireFarm(b) {
    b.slab(4.2, "grassFire", "sideFire");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.15, 0, 0.15);
    b.wheat(-1.2, -1.2, 1.5, 1.5, 8, 9, ["#e8b83a", "#d8a030", "#f2cc5a", "#c88a28"]);
    var bas = M("basalt", 3, 0.3);
    [[0.15, 1.75, 3.3, 0.2], [1.75, 0.15, 0.2, 3.3]].forEach(function (w) { b.box(w[2], 0.28, w[3], bas, w[0], 0, w[1]); });
    stakes(b, -1.6, 1.4, -1.6, -0.6, 6); stakes(b, -0.4, -1.6, 1.6, -1.6, 7);
    var GX = -1.5, GZ = -1.5;
    stepHut(b, GX, GZ, 0.5, 0.75, 2, "iron");
    forgeGate(b, GX, 0.12, GZ + 0.5 * 0.9 * 0.707 + 0.03, 0, 0.26, 0.4, 0);
    [[1.75, 1.75], [1.75, -1.4], [-1.4, 1.75]].forEach(function (p) { basaltBowl(b, p[0], p[1], 0.0, 1.0); });
    b.scarecrow(0.25, 0.3, "#b3261e");
    b.hay(-0.3, 1.95, 0.2); b.hay(0.25, 1.98, -0.1);
  }
  function nFireStore(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0.3, 0.8, 1.6, 1.5, -0.2);
    var X = -0.45, Z = -0.45, bas = M("basalt", 2, 0.8);
    dFrustum(b, X, 0, Z, 1.0, 0.95, 0.12, M("basalt", 2, 0.2));
    b.box(1.25, 0.95, 0.22, bas, X, 0.12, Z - 0.5); b.box(0.22, 0.95, 1.2, bas, X - 0.52, 0.12, Z);
    [[0.55, 0.55], [0.55, -0.45], [-0.45, 0.55]].forEach(function (p) { dFrustum(b, X + p[0], 0.12, Z + p[1], 0.11, 0.09, 0.95, bas); });
    dFrustum(b, X, 1.07, Z, 0.95, 0.85, 0.08, GOLDF());
    dFrustum(b, X, 1.15, Z, 0.88, 0.05, 0.6, M("ironPlate", 1.2, 1));
    spikeRing(b, X, Z, 0.85 * 0.707 * 0.95, 1.12, 2);
    b.lift(0.12, function () { this.logs(X - 0.15, Z - 0.15, PI / 4); this.gold(X + 0.2, Z + 0.25); this.sack(X - 0.25, Z + 0.3, 0, "#9a7a5a"); });
    var FX = 0.75, FZ = -0.7;
    dFrustum(b, FX, 0, FZ, 0.42, 0.24, 1.25, M("basalt", 1, 1.2));
    b.cyl(0.18, 0.18, 0.03, 4, dGlow("#ffb060", "#ff4a10", 1.6), FX, 1.25, FZ, { ry: PI / 4, noCast: true });
    dFlame(b, FX, 1.27, FZ, 0.5, 0.8); dSmoke(b, FX, 1.7, FZ, 5);
    var og = new T3.MeshBasicMaterial({ color: lin("#ffb060"), transparent: true, opacity: 0.85 });
    b.add(new T3.PlaneGeometry(0.22, 0.22), og, FX, 0.25, FZ + 0.36, { noCast: true });
    b.fx.push(function (t) { og.opacity = 0.7 + Math.sin(t * 7) * 0.15; });
    b.cyl(0.11, 0.14, 0.22, 4, M("basalt", 0.4, 0.3), 0.75, 0, 0.55, { ry: PI / 4 });
    b.box(0.3, 0.09, 0.13, M("iron"), 0.75, 0.22, 0.55, { ry: 0.6 });
    var gb = C("#f2c040", { metalness: 0.85, roughness: 0.3 });
    for (var r = 0; r < 2; r++) for (var c = 0; c < 3 - r; c++) b.box(0.15, 0.06, 0.3, gb, -0.1 + c * 0.16 + r * 0.08, 0.06 * r, 1.0);
    stakes(b, -1.35, 1.35, 0.35, 1.35, 6);
  }
  function nFireBarracks(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.3, 1.25, 2.6, 1.6);
    var HX = -0.4, HZ = -0.6, bas = M("basalt", 3, 0.9), gold = GOLDF();
    b.box(2.9, 0.12, 1.75, M("basalt", 3, 0.2), HX, 0, HZ);
    b.box(2.6, 0.95, 1.45, bas, HX, 0.12, HZ);
    b.box(2.7, 0.06, 1.55, gold, HX, 1.07, HZ);
    b.box(1.9, 0.45, 0.95, bas, HX, 1.13, HZ);
    b.box(1.98, 0.04, 1.03, gold, HX, 1.58, HZ);
    var ridge = new T3.CylinderGeometry(0.02, 0.48, 0.42, 4, 1);
    b.add(new T3.BoxGeometry(1.5, 0.3, 0.5), M("ironPlate", 1.5, 0.4), HX, 1.77, HZ, { rx: PI / 4, s: [1, 0.7, 0.7] });
    for (var k = 0; k < 7; k++) { var x = HX - 0.75 + k * 0.25; b.add(new T3.ConeGeometry(0.035, 0.18, 4), M("iron"), x, 1.98, HZ); }
    for (var k2 = -4; k2 <= 4; k2++) { b.add(new T3.ConeGeometry(0.035, 0.17, 4), M("iron"), HX + k2 * 0.3, 1.17, HZ + 0.75); }
    forgeGate(b, HX, 0.12, HZ + 0.73, 0, 0.5, 0.72, 1.0);
    [-0.8, 0.8].forEach(function (dx) { b.box(0.16, 0.34, 0.03, dGlow("#ffd38a", "#ff9a3c", 1.2), HX + dx, 0.6, HZ + 0.73, { noCast: true }); });
    var CX = HX + 1.55, CZ = HZ - 0.35;
    dFrustum(b, CX, 0, CZ, 0.42, 0.36, 0.9, bas);
    dFrustum(b, CX, 0.9, CZ, 0.24, 0.15, 1.35, M("basalt", 0.5, 1.2));
    b.cyl(0.11, 0.11, 0.03, 4, dGlow("#ffb060", "#ff4a10", 1.6), CX, 2.25, CZ, { ry: PI / 4, noCast: true });
    dFlame(b, CX, 2.27, CZ, 0.35, 0.4); dSmoke(b, CX, 2.55, CZ, 5);
    b.add(new T3.PlaneGeometry(0.3, 0.3), new T3.MeshBasicMaterial({ color: lin("#ff8a3d") }), CX, 0.3, CZ + 0.31, { noCast: true });
    b.banner(HX - 0.55, HZ + 1.15, 0, "bannerFire", 1.5); b.banner(HX + 0.55, HZ + 1.15, 0, "bannerFire", 1.5);
    b.dummy(1.1, 1.35, 0.2); b.dummy(1.65, 0.95, -0.3); b.rack(-1.6, 1.45, 0.25, "spear");
    basaltBowl(b, 0.35, 1.7, 0, 1.1);
    stakes(b, -2.0, -1.9, -2.0, 0.7, 8);
  }
  function nFireTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var bas = M("basalt", 1.5, 2.6), gold = GOLDF();
    dFrustum(b, 0, 0, 0, 1.0, 0.9, 0.2, M("basalt", 2, 0.2));
    dFrustum(b, 0, 0.2, 0, 0.72, 0.5, 2.3, bas);
    [0.95, 1.75].forEach(function (y) { var r = 0.72 - (y - 0.2) / 2.3 * 0.22; dFrustum(b, 0, y, 0, r + 0.03, r + 0.02, 0.05, gold); });
    dFrustum(b, 0, 2.5, 0, 0.55, 0.72, 0.28, bas);
    dFrustum(b, 0, 2.78, 0, 0.73, 0.72, 0.05, gold);
    spikeRing(b, 0, 0, 0.72 * 0.707, 2.83, 2);
    basaltBowl(b, 0, 0, 2.83, 1.6);
    [1.3, 2.05].forEach(function (y) { b.box(0.06, 0.26, 0.03, dGlow("#ffc070", "#ff8a2a", 1.4), 0.15, y, 0.43 - (y - 0.2) / 2.3 * 0.15, { noCast: true }); });
    forgeGate(b, 0, 0.2, 0.68 * 0.707 + 0.02, 0, 0.3, 0.45, 0.6);
    var pv = new T3.Group(); pv.position.set(0.45, 3.35, -0.45); b.g.add(pv);
    b.cyl(0.015, 0.015, 0.55, 5, C("#3e2616"), 0.45, 2.83, -0.45);
    var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(0.42, -0.08); sh.lineTo(0, -0.18); sh.closePath();
    b.add(new T3.ShapeGeometry(sh), C("#c0281c", { side: T3.DoubleSide }), 0, 0, 0, { parent: pv, ry: -PI / 4 });
    b.fx.push(function (t) { pv.rotation.y = Math.sin(t * 2.4) * 0.35; });
    stakes(b, -1.35, -1.35, -1.35, 1.0, 7);
    b.logs(1.05, 0.95, 0.3); b.pine(1.15, -1.15, 0.7);
  }

  var NEWB = {
    air: [nAirHouse, nAirFarm, nAirStore, nAirBarracks, nAirTower],
    water: [nWaterHouse, nWaterFarm, nWaterStore, nWaterBarracks, nWaterTower],
    fire: [nFireHouse, nFireFarm, nFireStore, nFireBarracks, nFireTower]
  };
