
  /* ================= TOWN CENTERS on the new age ladder ================= */
  function tAirM(b) {
    b.base(M("grassAir", 3, 3), M("sideAir", 3, 1));
    b.decal("path", 1.75, 1.75, 1.4, 2.4, -PI / 4);
    hexStep(b, 2.65, 0.14, 0); hexStep(b, 2.3, 0.14, 0.14); hexStep(b, 1.95, 0.12, 0.28);
    var Y = 0.4, R0 = 0.95, rot = PI / 12, rs = 0.55;
    hexCell(b, 0, 0, R0, 2.0, Y, { rot: rot, band: 0.58, door: [0, 0.62, 0.55], lamps: [[5, 0.75], [1, 0.75], [0, 0.84, 1.2]], cap: "skep", capR: 0.64, rose: 1.25 });
    gallery(b, 0, Y + 1.32, 0, 1.18);
    [1, 2, 3, 4, 5].forEach(function (k) {
      var p = nb(0, 0, R0, rs, k, rot), h = k % 2 ? 1.2 : 0.92;
      hexCell(b, p[0], p[1], rs, h, Y, { rot: rot, cap: "tent", capH: 0.42, lamps: (k === 1 || k === 5) ? [[0, 0.55, 0.9], [k, 0.55, 0.9]] : [] });
    });
    [[3 * PI / 4, 0], [-PI / 4, 1]].forEach(function (q) {
      var p = onRing(2.0, q[0]);
      var top = hexCell(b, p[0], p[1], 0.36, 2.35, Y, { rot: rot, band: 0.6, lamps: [[0, 0.75, 0.75], [5, 0.75, 0.75]], cap: "tent", capH: 0.38 });
      b.cyl(0.02, 0.02, 0.5, 5, C(BY.black), p[0], top, p[1]); dPennant(b, p[0], top + 0.5, p[1], q[1] ? BY.yellow : BY.black);
    });
    var post = M("plankDark", 0.3, 2);
    b.cyl(0.05, 0.07, 3.2, 8, post, -1.55, 0.28, -1.55); bySail(b, -1.55, 3.3, -1.55, PI / 4, 1.5); dPennant(b, -1.55, 3.48, -1.55, BY.yellow);
    kite(b, -1.55, 3.4, -1.55, 3, 4.6);
    b.banner(1.45, 0.65, 0.4, "bannerAir", 1.5); b.banner(0.65, 1.45, 0.4, "bannerAir", 1.5);
    amberFloat(b, 1.55, 2.4, -0.6, 0.9); amberFloat(b, -0.6, 2.6, 1.55, 0.9);
    [[2.55, -1.3], [2.55, -0.85], [-1.3, 2.55], [-0.85, 2.55]].forEach(function (q) { b.cyl(0.03, 0.03, 0.3, 5, post, q[0], 0, q[1]); b.box(0.32, 0.04, 0.32, M("plankWarm", 0.4, 0.4), q[0], 0.3, q[1]); dSkep(b, q[0], 0.34, q[1], 0.14, 0.3); });
    honeyJars(b, [[2.3, 1.2], [2.45, 1.05], [1.2, 2.4]]);
  }

  function tAirX(b) {
    b.base(M("grassAir", 3, 3), M("sideAir", 3, 1));
    hexStep(b, 2.55, 0.12, 0); hexStep(b, 2.2, 0.12, 0.12);
    var rune = glowMat("#fff0a0", "#ffb020", 0.9);
    b.add(new T3.RingGeometry(1.5, 1.6, 6), rune, 0, 0.245, 0, { rx: -PI / 2, rz: PI / 6, noCast: true });
    b.add(new T3.RingGeometry(0.8, 0.87, 6), rune, 0, 0.245, 0, { rx: -PI / 2, noCast: true });
    [PI / 2, PI / 2 + 2 * PI / 3, PI / 2 + 4 * PI / 3].forEach(function (a) { var p = dRing(2.05, a); honeyPylon(b, p[0], p[1], 1.6, p[0] * 0.35, 1.95, p[1] * 0.35); });
    var IY = 2.95, I = hexIsland(b, 0, IY, 0, 1.75, 2.0, 5);
    var L = new T3.PointLight("#ffb030", 1.8, 6, 2); L.position.set(0, -2.1, 0); I.add(L);
    inGroup(b, I, function () {
      var rot = PI / 12, R0 = 0.72, dark = C(BY.black);
      hexCell(b, 0, 0, R0, 1.2, 0, { rot: rot, band: 0.5, door: [0, 0.48, 0.4], lamps: [[5, 0.72], [1, 0.72]] });
      b.add(new T3.CylinderGeometry(0.62, 0.68, 0.75, 6), AMBERG(), 0, 1.575, 0, { ry: rot, noCast: true });
      b.add(new T3.CylinderGeometry(0.52, 0.56, 0.65, 6), dGlow("#ffe7a0", "#ffb030", 1.1), 0, 1.55, 0, { ry: rot, noCast: true });
      for (var k = 0; k < 6; k++) { var a = rot + k * PI / 3; b.cyl(0.022, 0.022, 0.75, 4, dark, Math.sin(a) * 0.66, 1.2, Math.cos(a) * 0.66); }
      b.add(new T3.CylinderGeometry(0.72, 0.72, 0.06, 6), dark, 0, 1.97, 0, { ry: rot });
      dSkep(b, 0, 2.0, 0, 0.56, 0.84);
      b.cyl(0.02, 0.02, 0.35, 5, dark, 0, 2.8, 0); windRose(b, 0.03, 3.15, 0.03, 1.15);
      [1, 2, 3, 4, 5].forEach(function (kk) { var p = nb(0, 0, R0, 0.4, kk, rot); hexCell(b, p[0], p[1], 0.4, kk % 2 ? 0.8 : 0.6, 0, { rot: rot, cap: "tent", capH: 0.3, lamps: (kk === 1 || kk === 5) ? [[0, 0.55, 0.8]] : [] }); });
      gallery(b, 0, 1.22, 0, 0.98);
      [[PI * 0.95, 0], [PI * 1.45, 1], [PI * 1.95, 0]].forEach(function (q) { var p = dRing(1.45, q[0]); b.cyl(0.03, 0.045, 1.6, 6, M("plankDark", 0.2, 1), p[0], 0, p[1]); bySail(b, p[0], 1.55, p[1], PI / 4, 1.0); dPennant(b, p[0], 1.6, p[1], q[1] ? BY.yellow : BY.black); });
      [[0.95, 0.75], [-0.9, 0.85], [0.8, -0.95]].forEach(function (q) { b.add(new T3.CylinderGeometry(0.004, 0.004, 0.5, 4), dark, q[0], -0.9, q[1], { noCast: true }); b.add(new T3.CylinderGeometry(0.07, 0.07, 0.14, 6), dGlow("#ffd27a", "#ffa420", 1.4), q[0], -1.2, q[1], { noCast: true }); });
    });
    var beamM = new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.25, depthWrite: false });
    [[-2.3, 2.05, 0.75, 11], [0.75, 3.95, -2.3, 12]].forEach(function (q) {
      var S = hexIsland(b, q[0], q[1], q[2], 0.62, 0.85, q[3]);
      inGroup(b, S, function () { hexCell(b, 0, 0, 0.3, 0.5, 0, { cap: "tent", capH: 0.26, lamps: [[0, 0.5, 0.7], [5, 0.5, 0.7]] }); b.cyl(0.015, 0.015, 0.2, 5, C(BY.black), 0, 0.76, 0); windRose(b, 0.02, 1.0, 0.02, 0.6); });
      b.beam([q[0] * 0.75, q[1] - 0.1, q[2] * 0.75], [q[0] * 0.25, IY - 0.2, q[2] * 0.25], 0.025, beamM);
    });
    var ship = new T3.Group(); ship.position.set(1.75, 5.35, -1.65); ship.rotation.y = PI / 4; b.g.add(ship);
    b.add(new T3.SphereGeometry(1, 28, 16), M("canvasBY", 4, 2), 0, 0, 0, { parent: ship, s: [1.15, 0.45, 0.45] });
    [-0.6, 0, 0.6].forEach(function (x) { var rr = 0.45 * Math.sqrt(1 - (x / 1.15) * (x / 1.15)); b.add(new T3.TorusGeometry(rr + 0.01, 0.02, 5, 24), C(BY.black), x, 0, 0, { parent: ship, ry: PI / 2 }); });
    b.add(new T3.ConeGeometry(0.22, 0.4, 4), M("canvasBY", 1, 1, { side: T3.DoubleSide }), -1.15, 0, 0, { parent: ship, rz: PI / 2, s: [1, 1, 0.15] });
    b.add(new T3.BoxGeometry(0.75, 0.16, 0.26), M("plankWarm", 0.8, 0.3), 0.05, -0.7, 0, { parent: ship });
    [[-0.3, -0.1], [-0.3, 0.1], [0.35, -0.1], [0.35, 0.1]].forEach(function (q) { b.beam([q[0], -0.62, q[1]], [q[0] * 1.2, -0.38, q[1] * 1.6], 0.005, C("#d8cba6"), ship); });
    b.add(new T3.CylinderGeometry(0.05, 0.05, 0.12, 6), dGlow("#ffd27a", "#ffa420", 1.4), 0.45, -0.7, 0, { parent: ship, noCast: true });
    b.fx.push(function (t) { ship.position.y = 5.35 + Math.sin(t * 0.8) * 0.08; ship.rotation.z = Math.sin(t * 0.6) * 0.03; });
    b.beam([1.75 - 0.2, 4.7, -1.65 + 0.2], [0.85, IY + 1.55, -0.85], 0.006, C("#d8cba6"));
    var orbit = new T3.Group(); b.g.add(orbit);
    var gl = [0, 1, 2].map(function () { var g = glider(b, orbit); g.scale.setScalar(1.3); return g; });
    b.fx.push(function (t) { gl.forEach(function (g, i) { var a = t * 0.4 + i * 2 * PI / 3, R = 2.85; g.position.set(Math.cos(a) * R, 4.3 + i * 0.3 + Math.sin(t * 1.2 + i) * 0.1, Math.sin(a) * R); g.rotation.set(0, -a, 0.35); }); });
    honeyJars(b, [[2.4, 1.3], [2.55, 1.15]]);
  }

  function tWaterX(b) {
    b.base(M("grassWater", 3, 3), M("sideWater", 3, 1));
    var bz = BRZ();
    blueTerrace(b, 0, 0, 2.8, 0.14, 0);
    roundPool(b, 0, 0, 2.5, 0.14);
    var PY = 2.35;
    for (var k = 0; k < 6; k++) { var p = dRing(1.5, k * PI / 3 + PI / 6); waterCol(b, p[0], 0.24, p[1], 0.15, PY - 0.24); }
    waterCol(b, 0, 0.24, 0, 0.28, PY - 0.24);
    b.add(new T3.CylinderGeometry(2.0, 1.5, 0.32, 56), PEARLM(5, 0.4), 0, PY + 0.16, 0);
    b.add(new T3.CylinderGeometry(2.01, 2.01, 0.07, 56, 1, true), M("stoneBlue", 5, 0.2), 0, PY + 0.24, 0);
    b.add(new T3.TorusGeometry(2.0, 0.035, 6, 64), bz, 0, PY + 0.33, 0, { rx: PI / 2 });
    var DY = PY + 0.32;
    dConch(b, 0, 0, 1.9, 0.6, DY, 4);
    var Lc = new T3.PointLight("#58c8ff", 1.8, 5, 2); Lc.position.set(0, DY + 0.9, 0); b.g.add(Lc);
    var O = new T3.Group(); b.g.add(O);
    [[1.05, 0.5, 0.2], [-0.9, 0.9, 0.16], [0.2, 1.3, 0.13]].forEach(function (q) { b.add(new T3.SphereGeometry(q[2], 16, 12), WATERM(0.5, 0.5, 0.75), q[0], q[1], 0, { parent: O, noCast: true }); });
    b.fx.push(function (t) { O.position.y = DY; O.rotation.y = t * 0.4; });
    glassDome(b, 0, DY, 0, 1.9, 10);
    waterRing2(b, 0, DY + 0.8, 0, 2.25, 0.25, 0.4); waterRing2(b, 0, DY + 1.35, 0, 1.75, -0.3, -0.55);
    b.add(new T3.CylinderGeometry(0.3, 0.38, 0.25, 24), PEARLM(1, 0.3), 0, DY + 1.95, 0);
    glowCrown(b, 0, DY + 2.12, 0, 0.18);
    armSphere(b, 0, DY + 3.05, 0, 1.0);
    [[3 * PI / 4], [-PI / 4]].forEach(function (q) {
      var p = onRing(2.3, q[0]), AY = 1.35;
      waterCol(b, p[0], 0.24, p[1], 0.1, AY - 0.24);
      b.add(new T3.CylinderGeometry(0.62, 0.5, 0.16, 32), PEARLM(1.5, 0.3), p[0], AY + 0.08, p[1]);
      dConch(b, p[0], p[1], 0.75, 0.24, AY + 0.16, 3);
      glassDome(b, p[0], AY + 0.16, p[1], 0.55, 6);
      glowCrown(b, p[0], AY + 0.78, p[1], 0.08);
      b.beam([p[0] * 0.78, AY + 0.35, p[1] * 0.78], [p[0] * 0.5, PY + 0.2, p[1] * 0.5], 0.11, GLASSM(0.35));
    });
    [PI / 4, PI * 0.75 + 0.5, -PI / 4 - 0.5, PI * 1.25].forEach(function (a) { var p = onRing(1.95, a); waterArc(b, p[0], PY + 0.1, p[1], p[0] * 1.2, 0.25, p[1] * 1.2, 0.25, 10); });
    b.banner(2.55, 0.9, 0.14, "bannerWater", 1.7); b.banner(0.9, 2.55, 0.14, "bannerWater", 1.7);
  }

  function tFireX(b) {
    b.base(M("grassFire", 3, 3, { color: lin("#c8b890") }), M("sideFire", 3, 1));
    var obs = OBS(), gold = REDGOLD(), lava = lavaM(1.7);
    dFrustum(b, 0, 0, 0, 3.05, 2.95, 0.18, M("basalt", 4, 0.3));
    magmaMoat(b, 0, 0, 2.6, 0.19);
    dFrustum(b, 0, 0.18, 0, 2.3, 2.2, 0.35, obs); dFrustum(b, 0, 0.5, 0, 2.23, 2.22, 0.05, gold);
    spikeRing(b, 0, 0, 2.22 * 0.707, 0.55, 5);
    var Y = 0.55, H = 2.7, keepM = M("basalt", 2, 2.5, { color: lin("#d2b8c2"), roughness: 0.42 });
    dFrustum(b, 0, Y, 0, 1.15, 0.82, H, keepM);
    var slit = lavaM(1.5);
    [0.45, 1.3, 2.2].forEach(function (dy) {
      var ap = (1.15 - 0.33 * dy / H) * 0.707 + 0.012;
      [-0.38, 0, 0.38].forEach(function (o) { var hh = dy > 2 ? 0.22 : 0.3; b.box(0.08, hh, 0.02, slit, o * ap / 0.8, Y + dy, ap, { noCast: true }); b.box(0.02, hh, 0.08, slit, ap, Y + dy, o * ap / 0.8, { noCast: true }); });
    });
    edgeLava(b, 0, 0, Y, 1.15, 0.82, H, lava);
    [0.33, 0.66].forEach(function (f) { var r = 1.15 - 0.33 * f + 0.02; dFrustum(b, 0, Y + H * f, 0, r, r - 0.01, 0.07, gold); });
    dFrustum(b, 0, Y + H, 0, 0.82, 1.05, 0.3, keepM); dFrustum(b, 0, Y + H + 0.3, 0, 1.06, 1.05, 0.06, gold);
    spikeRing(b, 0, 0, 1.05 * 0.707, Y + H + 0.36, 3);
    fireCrown(b, 0, Y + H + 0.36, 0, 0.95);
    sunDisc(b, 0, Y + H + 1.65, 0, PI / 4, 1.7);
    haloG(b, 0, Y + H + 2.95, 0, 0.55);
    var W = new T3.Group(); W.position.set(0, Y + 2.35, 0); W.rotation.y = PI / 4; b.g.add(W);
    var wings = [1, -1].map(function (s) { var w = featherWing(b, W, s, 11, 0.85, 0.15); w.position.set(s * 0.72, 0, 0); return [w, s]; });
    b.fx.push(function (t) { wings.forEach(function (q) { q[0].rotation.z = q[1] * Math.sin(t * 0.9) * 0.08; }); lava.emissiveIntensity = 1.5 + Math.sin(t * 2.2) * 0.4; slit.emissiveIntensity = 1.3 + Math.sin(t * 1.7) * 0.3; });
    var G = new T3.Group(); G.position.set(1.15, 0.55, 1.15); G.rotation.y = PI / 4; b.g.add(G);
    inGroup(b, G, function () {
      b.box(1.5, 1.35, 0.8, obs, 0, 0, 0); b.box(1.56, 0.07, 0.86, gold, 0, 1.35, 0);
      for (var q = -3; q <= 3; q++) b.add(new T3.ConeGeometry(0.04, 0.2, 4), M("iron"), q * 0.2, 1.52, 0.4);
      lionHead(b, 0, 1.0, 0.42, 0, 0.62);
      forgeGate(b, 0, 0, 0.41, 0, 0.55, 0.62, 0);
    });
    lionStatue(b, 2.15, 0.95, 0.55, PI / 4, 0.7); lionStatue(b, 0.95, 2.15, 0.55, PI / 4, 0.7);
    [[-1.7, -1.7, 3.0, 1], [1.75, -1.75, 2.5, 1], [-1.75, 1.75, 2.5, 0]].forEach(function (q) { obelisk(b, q[0], q[1], q[2], 0.55); if (q[3]) haloG(b, q[0], 0.55 + q[2] + 0.7, q[1], 0.25); });
    dSmoke(b, 0, Y + H + 1.2, 0, 4);
  }

  if (typeof MYTHNEW !== "undefined") MYTHNEW.air = tAirM;
  if (typeof ARCNEW !== "undefined") { ARCNEW.air = tAirX; ARCNEW.water = tWaterX; ARCNEW.fire = tFireX; }
