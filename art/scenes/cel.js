
  /* ================= CELESTIAL AGE TOWN CENTERS ================= */
  TEX.star = [64, 64, dot("rgba(255,255,245,1)", "rgba(255,255,245,0)")];
  function starMotes(b, n, R, y0, y1, col, size) {
    var list = [];
    for (var i = 0; i < n; i++) {
      var m = new T3.SpriteMaterial({ map: tex("star"), color: lin(col), transparent: true, depthWrite: false, opacity: 0.9 });
      var s = new T3.Sprite(m), a = b.rand() * 2 * PI, r = R * Math.sqrt(b.rand()), y = y0 + b.rand() * (y1 - y0), sz = (size || 0.16) * (0.6 + b.rand() * 0.8);
      s.position.set(Math.cos(a) * r, y, Math.sin(a) * r); s.scale.set(sz, sz, 1); b.g.add(s);
      list.push([s, m, b.rand() * 6, y]);
    }
    b.fx.push(function (t) { list.forEach(function (q) { q[1].opacity = 0.45 + 0.45 * Math.sin(t * 2 + q[2]); q[0].position.y = q[3] + Math.sin(t * 0.5 + q[2]) * 0.08; }); });
  }
  function constellation(b, y, R, n, col, tilt, sp) {
    var g = new T3.Group(); g.position.y = y; g.rotation.x = tilt || 0; b.g.add(g);
    var spin = new T3.Group(); g.add(spin);
    var lineM = new T3.MeshBasicMaterial({ color: lin(col), transparent: true, opacity: 0.45, depthWrite: false });
    var pts = [];
    for (var i = 0; i < n; i++) { var a = i / n * 2 * PI, r = R * (i % 2 ? 0.86 : 1), h = (i % 3 - 1) * 0.18; pts.push([Math.cos(a) * r, h, Math.sin(a) * r]); }
    pts.forEach(function (p, i) {
      var q = pts[(i + 1) % n];
      b.beam(p, q, 0.012, lineM, spin);
      var st = b.add(new T3.OctahedronGeometry(0.09, 0), glowMat("#ffffff", col, 2.2), p[0], p[1], p[2], { parent: spin, noCast: true });
      st.scale.set(1, 1.6, 1);
    });
    b.fx.push(function (t, dt) { spin.rotation.y += dt * (sp || 0.12); });
    return g;
  }
  function cloud(b, x, y, z, s) {
    var m = C("#f3f5ff", { roughness: 1, emissive: lin("#c8d4ff"), emissiveIntensity: 0.25 });
    var g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); b.g.add(g);
    [[0, 0, 0, 0.55], [0.5, -0.05, 0.1, 0.42], [-0.5, -0.08, -0.05, 0.4], [0.15, 0.25, -0.1, 0.38], [-0.2, 0.05, 0.38, 0.33]].forEach(function (q) { b.add(new T3.SphereGeometry(q[3], 14, 10), m, q[0], q[1], q[2], { parent: g, s: [1, 0.72, 1], noCast: true }); });
    var ph = b.rand() * 6; b.fx.push(function (t) { g.position.y = y + Math.sin(t * 0.4 + ph) * 0.05; });
    return g;
  }

  /* ---------- Hufflepuff: Cloud Throne ---------- */
  function cAir(b) {
    b.base(M("grassAir", 3, 3), M("sideAir", 3, 1));
    hexStep(b, 2.65, 0.12, 0); hexStep(b, 2.3, 0.12, 0.12); hexStep(b, 1.95, 0.1, 0.24);
    var rune = glowMat("#fff4c0", "#ffc030", 1.1);
    b.add(new T3.RingGeometry(1.55, 1.66, 6), rune, 0, 0.345, 0, { rx: -PI / 2, rz: PI / 6, noCast: true });
    for (var k = 0; k < 6; k++) b.add(new T3.PlaneGeometry(0.05, 1.5), rune, 0, 0.346, 0, { rx: -PI / 2, rz: k * PI / 3, noCast: true }).geometry.translate(0, 0.85, 0);
    [PI / 2, PI / 2 + 2 * PI / 3, PI / 2 + 4 * PI / 3].forEach(function (a) { var p = dRing(2.25, a); honeyPylon(b, p[0], p[1], 2.0, p[0] * 0.3, 2.4, p[1] * 0.3); });
    var IY = 3.3, I = hexIsland(b, 0, IY, 0, 1.85, 2.1, 7);
    var L = new T3.PointLight("#ffc040", 2.0, 7, 2); L.position.set(0, -2.2, 0); I.add(L);
    [[1.6, 0.4], [0.4, 1.6], [-1.3, 1.1], [1.1, -1.3], [-1.4, -0.6], [-0.6, -1.5], [0.2, 0.2]].forEach(function (q, i) { cloud(b, q[0], IY - 0.75 - (i % 2) * 0.2, q[1], 1.15 + (i % 3) * 0.15); });
    inGroup(b, I, function () {
      var rot = PI / 12, dark = C(BY.black), gold = REDGOLD();
      [1, 2, 3, 4, 5].forEach(function (kk) { var p = nb(0, 0, 0.82, 0.42, kk, rot); hexCell(b, p[0], p[1], 0.42, kk % 2 ? 0.85 : 0.65, 0, { rot: rot, cap: "tent", capH: 0.3, lamps: (kk === 1 || kk === 5) ? [[0, 0.55, 0.8]] : [] }); });
      hexCell(b, 0, 0, 0.82, 1.25, 0, { rot: rot, band: 0.5, door: [0, 0.52, 0.42], lamps: [[5, 0.72], [1, 0.72]] });
      gallery(b, 0, 1.28, 0, 1.08);
      var y = 1.25;
      [[0.66, 0.7], [0.48, 0.6]].forEach(function (t, i) {
        b.add(new T3.CylinderGeometry(t[0], t[0] + 0.06, t[1], 6), AMBERG(), 0, y + t[1] / 2, 0, { ry: rot, noCast: true });
        b.add(new T3.CylinderGeometry(t[0] - 0.1, t[0] - 0.06, t[1] - 0.06, 6), dGlow("#ffe7a0", "#ffb030", 1.2), 0, y + t[1] / 2, 0, { ry: rot, noCast: true });
        for (var v = 0; v < 6; v++) { var a = rot + v * PI / 3; b.cyl(0.02, 0.02, t[1], 4, dark, Math.sin(a) * (t[0] + 0.03), y, Math.cos(a) * (t[0] + 0.03)); }
        y += t[1];
        b.add(new T3.CylinderGeometry(t[0] + 0.12, t[0] + 0.12, 0.07, 6), i ? gold : dark, 0, y, 0, { ry: rot });
        if (!i) gallery(b, 0, y + 0.04, 0, t[0] + 0.2);
      });
      dSkep(b, 0, y + 0.03, 0, 0.42, 0.62);
      b.add(new T3.TorusGeometry(0.43, 0.03, 6, 24), gold, 0, y + 0.18, 0, { rx: PI / 2 });
      [[PI * 0.95, 0], [PI * 1.45, 1], [PI * 1.95, 0], [PI * 0.45, 1]].forEach(function (q) { var p = dRing(1.5, q[0]); b.cyl(0.03, 0.045, 1.7, 6, M("plankDark", 0.2, 1), p[0], 0, p[1]); bySail(b, p[0], 1.65, p[1], PI / 4, 1.05); dPennant(b, p[0], 1.7, p[1], q[1] ? BY.yellow : BY.black); });
    });
    var star = new T3.Group(); b.g.add(star);
    var sm = glowMat("#fff6d0", "#ffb020", 2.6);
    var core = b.add(new T3.OctahedronGeometry(0.3, 0), sm, 0, 0, 0, { parent: star, noCast: true }); core.scale.set(1, 1.6, 1);
    for (var r = 0; r < 8; r++) { var a = r / 8 * 2 * PI; b.add(new T3.ConeGeometry(0.06, r % 2 ? 0.45 : 0.75, 4), sm, Math.cos(a) * 0.35, Math.sin(a) * 0.35, 0, { parent: star, rz: a - PI / 2, noCast: true }); }
    star.add(new T3.PointLight("#ffd060", 2.2, 8, 2));
    b.fx.push(function (t) { star.position.set(0, IY + 3.75 + Math.sin(t) * 0.08, 0); star.rotation.y = t * 0.6; });
    b.add(new T3.TorusGeometry(0.75, 0.035, 6, 40), REDGOLD(), 0, IY + 3.75, 0, { rx: PI / 2 - 0.25 });
    constellation(b, IY + 2.4, 3.0, 8, "#ffd060", 0.18, 0.1);
    var moons = new T3.Group(); moons.position.y = IY + 0.3; b.g.add(moons);
    [0, 1, 2].forEach(function (i) {
      var a = i * 2 * PI / 3, S = hexIsland(b, Math.cos(a) * 2.75, (i - 1) * 0.45, Math.sin(a) * 2.75, 0.5, 0.75, 20 + i);
      moons.add(S);
      inGroup(b, S, function () { hexCell(b, 0, 0, 0.26, 0.42, 0, { cap: "tent", capH: 0.22, lamps: [[0, 0.5, 0.65], [5, 0.5, 0.65]] }); b.cyl(0.015, 0.02, 0.6, 5, C(BY.black), 0.3, 0, 0.1); bySail(b, 0.3, 0.6, 0.1, PI / 4, 0.45); });
    });
    b.fx.push(function (t, dt) { moons.rotation.y += dt * 0.1; });
    var orbit = new T3.Group(); b.g.add(orbit);
    var gl = [0, 1, 2, 3].map(function () { var g = glider(b, orbit); g.scale.setScalar(1.3); return g; });
    b.fx.push(function (t) { gl.forEach(function (g, i) { var a = t * 0.35 + i * PI / 2, R = 3.2 - (i % 2) * 0.5; g.position.set(Math.cos(a) * R, 5.0 + (i % 2) * 0.6 + Math.sin(t * 1.2 + i) * 0.1, Math.sin(a) * R); g.rotation.set(0, -a, 0.35); }); });
    starMotes(b, 34, 3.4, 3.0, 8.0, "#ffe8a0", 0.18);
  }

  /* ---------- Ravenclaw: Moon Observatory ---------- */
  function cWater(b) {
    b.base(M("grassWater", 3, 3), M("sideWater", 3, 1));
    var bz = BRZ(), silver = C("#dfe6f2", { metalness: 0.75, roughness: 0.25 });
    blueTerrace(b, 0, 0, 2.85, 0.14, 0);
    roundPool(b, 0, 0, 2.55, 0.14);
    var PY = 2.15;
    for (var k = 0; k < 8; k++) { var p = dRing(1.7, k * PI / 4 + PI / 8); waterCol(b, p[0], 0.24, p[1], 0.14, PY - 0.24); }
    b.add(new T3.CylinderGeometry(2.05, 1.6, 0.32, 56), PEARLM(5, 0.4), 0, PY + 0.16, 0);
    b.add(new T3.CylinderGeometry(2.06, 2.06, 0.07, 56, 1, true), M("stoneBlue", 5, 0.2), 0, PY + 0.24, 0);
    b.add(new T3.TorusGeometry(2.05, 0.035, 6, 64), silver, 0, PY + 0.33, 0, { rx: PI / 2 });
    var DY = PY + 0.32, DR = 1.6;
    dConch(b, 0, 0, 1.6, 0.52, DY, 4);
    var Lc = new T3.PointLight("#9fd8ff", 1.6, 5, 2); Lc.position.set(0, DY + 0.8, 0); b.g.add(Lc);
    glassDome(b, 0, DY, 0, DR, 12);
    for (var c = 0; c < 12; c++) { var q = dRing(DR + 0.15, c * PI / 6); b.cyl(0.05, 0.06, 0.55, 10, PEARLM(0.3, 0.5), q[0], DY, q[1]); b.add(new T3.SphereGeometry(0.06, 10, 8), dGlow("#e8f8ff", "#58c8ff", 1.6), q[0], DY + 0.6, q[1], { noCast: true }); }
    waterRing2(b, 0, DY + 0.7, 0, 2.3, 0.2, 0.35);
    var TY = DY + DR;
    b.add(new T3.CylinderGeometry(0.32, 0.42, 0.3, 24), PEARLM(1, 0.3), 0, TY + 0.15, 0);
    waterCol(b, 0, TY + 0.3, 0, 0.13, 1.6);
    waterRing2(b, 0, TY + 0.9, 0, 0.55, 0.3, 0.8); waterRing2(b, 0, TY + 1.4, 0, 0.42, -0.3, -0.9);
    var MY = TY + 2.75;
    var moonM = M("pearl", 1.5, 1.5, { color: lin("#b8c6e0"), emissive: lin("#5a86d0"), emissiveIntensity: 0.4, roughness: 0.75 });
    var moon = new T3.Group(); b.g.add(moon);
    b.add(new T3.SphereGeometry(0.9, 36, 26), moonM, 0, 0, 0, { parent: moon, noCast: true });
    [[0.4, 0.35, 0.8, 0.16], [-0.3, -0.2, 0.84, 0.12], [0.1, -0.5, 0.75, 0.14], [-0.55, 0.3, 0.68, 0.1]].forEach(function (q) { var v = new T3.Vector3(q[0], q[1], q[2]).normalize().multiplyScalar(0.88); var cr = b.add(new T3.CircleGeometry(q[3], 16), C("#8e9cc0", { emissive: lin("#3a5a98"), emissiveIntensity: 0.25 }), v.x, v.y, v.z, { parent: moon, noCast: true }); cr.lookAt(v.clone().multiplyScalar(3)); });
    moon.add(new T3.PointLight("#bcd8ff", 2.2, 9, 2));
    b.fx.push(function (t) { moon.position.set(0, MY + Math.sin(t * 0.7) * 0.08, 0); moon.rotation.y = t * 0.15; });
    armSphere(b, 0, MY, 0, 2.3);
    var cres = new T3.Group(); cres.position.set(0, MY, 0); cres.rotation.y = PI / 4; b.g.add(cres);
    b.add(new T3.TorusGeometry(1.75, 0.09, 10, 80, PI * 1.35), silver, 0, 0, 0, { parent: cres, rz: -PI * 0.175 + PI / 2 });
    [[-1, 0.5], [1, 0.5]].forEach(function (s) { var a = PI / 2 + s[0] * PI * 0.675; b.add(new T3.ConeGeometry(0.1, 0.35, 8), silver, Math.cos(a) * 1.75, Math.sin(a) * 1.75, 0, { parent: cres, rz: a + (s[0] > 0 ? 0 : PI) }); });
    [0, 1, 2, 3].forEach(function (i) { var a = i * PI / 2 + PI / 4, p = onRing(0.6, a); waterArc(b, p[0] * 0.8, MY - 0.75, p[1] * 0.8, p[0] * 1.6, DY + DR * 0.7, p[1] * 1.6, 0.25, 14); });
    [[3 * PI / 4], [-PI / 4]].forEach(function (q) {
      var p = onRing(2.35, q[0]), AY = 1.4;
      waterCol(b, p[0], 0.24, p[1], 0.1, AY - 0.24);
      b.add(new T3.CylinderGeometry(0.6, 0.48, 0.16, 32), PEARLM(1.5, 0.3), p[0], AY + 0.08, p[1]);
      dConch(b, p[0], p[1], 0.75, 0.24, AY + 0.16, 3);
      glassDome(b, p[0], AY + 0.16, p[1], 0.52, 6);
      armSphere(b, p[0], AY + 1.15, p[1], 0.38);
      b.beam([p[0] * 0.8, AY + 0.35, p[1] * 0.8], [p[0] * 0.55, PY + 0.2, p[1] * 0.55], 0.1, GLASSM(0.35));
    });
    constellation(b, MY + 0.2, 2.9, 7, "#9fd8ff", -0.2, -0.08);
    starMotes(b, 36, 3.4, 2.5, 8.6, "#cfe6ff", 0.17);
    b.banner(2.6, 0.95, 0.14, "bannerWater", 1.8); b.banner(0.95, 2.6, 0.14, "bannerWater", 1.8);
  }

  /* ---------- Gryffindor: Phoenix Throne ---------- */
  function cFire(b) {
    b.base(M("grassFire", 3, 3, { color: lin("#c8b890") }), M("sideFire", 3, 1));
    var obs = M("basalt", 2, 2.5, { color: lin("#d2b8c2"), roughness: 0.42 }), gold = REDGOLD(), lava = lavaM(1.7);
    dFrustum(b, 0, 0, 0, 3.1, 3.0, 0.18, M("basalt", 4, 0.3));
    magmaMoat(b, 0, 0, 2.65, 0.19);
    var ray = glowMat("#ffe0a0", "#ff9020", 1.4);
    for (var k = 0; k < 8; k++) { var a = k * PI / 4 + PI / 8; b.add(new T3.BoxGeometry(0.06, 0.02, 0.75), ray, Math.sin(a) * 2.05, 0.19, Math.cos(a) * 2.05, { ry: a, noCast: true }); }
    var Y = 0.18;
    [[2.25, 2.1, 0.45], [1.75, 1.6, 0.45], [1.3, 1.15, 0.5]].forEach(function (t) {
      dFrustum(b, 0, Y, 0, t[0], t[1], t[2], obs);
      dFrustum(b, 0, Y + t[2] - 0.05, 0, t[1] + 0.04, t[1] + 0.02, 0.06, gold);
      edgeLava(b, 0, 0, Y, t[0], t[1], t[2], lava);
      spikeRing(b, 0, 0, t[1] * 0.707, Y + t[2], 3);
      Y += t[2];
    });
    for (var s = 0; s < 10; s++) b.box(0.9, 0.09 * (s + 1), 0.18, obs, 0, 0.18, 1.62 - s * 0.12, { ry: 0 });
    b.box(0.5, 0.02, 1.25, lava, 0, 0.19 + 0.02, 1.0, { noCast: true });
    lionStatue(b, -0.75, 1.75, 0.18, 0, 0.8); lionStatue(b, 0.75, 1.75, 0.18, 0, 0.8);
    lionStatue(b, 1.75, -0.75, 0.18, PI / 2, 0.8); lionStatue(b, 1.75, 0.75, 0.18, PI / 2, 0.8);
    dFrustum(b, 0, Y, 0, 0.62, 0.42, 1.2, obs); edgeLava(b, 0, 0, Y, 0.62, 0.42, 1.2, lava);
    Y += 1.2;
    fireCrown(b, 0, Y, 0, 1.0);
    sunDisc(b, -1.0, Y + 3.1, -1.0, PI / 4, 2.6);
    var P = new T3.Group(); P.position.set(0.25, Y + 1.25, 0.25); P.rotation.y = PI / 4; P.scale.setScalar(2.2); b.g.add(P);
    b.add(new T3.SphereGeometry(0.17, 14, 10), dGlow("#ffd080", "#ff6a10", 2.0), 0, 0.1, 0, { parent: P, s: [0.85, 1.5, 0.85], noCast: true });
    b.add(new T3.SphereGeometry(0.09, 12, 10), gold, 0, 0.45, 0.05, { parent: P });
    b.add(new T3.ConeGeometry(0.035, 0.12, 4), gold, 0, 0.44, 0.15, { parent: P, rx: PI / 2 });
    inGroup(b, P, function () { dFlame(b, 0, 0.5, -0.02, 0.35, 0.4); });
    var wings = [1, -1].map(function (s) { var w = featherWing(b, P, s, 11, 0.5, 0.1); w.position.set(s * 0.1, 0.2, 0); return [w, s]; });
    for (var t2 = 0; t2 < 5; t2++) b.add(new T3.ConeGeometry(0.05, 0.7, 5), lavaM(1.5), (t2 - 2) * 0.08, -0.35, -0.03, { parent: P, rz: (t2 - 2) * 0.22, rx: PI, noCast: true });
    P.add(new T3.PointLight("#ff8030", 2.4, 8, 2));
    b.fx.push(function (t) { wings.forEach(function (q) { q[0].rotation.z = q[1] * Math.sin(t * 1.0) * 0.1; }); P.position.y = Y + 1.25 + Math.sin(t) * 0.06; lava.emissiveIntensity = 1.5 + Math.sin(t * 2.2) * 0.4; });
    var ring = new T3.Group(); ring.position.set(0, Y - 0.5, 0); ring.rotation.x = 0.12; b.g.add(ring);
    b.add(new T3.TorusGeometry(2.3, 0.05, 6, 80), gold, 0, 0, 0, { parent: ring, rx: PI / 2 });
    for (var f = 0; f < 16; f++) { var p = onRing(2.3, f / 16 * 2 * PI); b.add(new T3.ConeGeometry(0.05, 0.22, 5), f % 2 ? gold : lavaM(1.8), p[0], 0.08, p[1], { parent: ring, noCast: f % 2 === 0 }); }
    b.fx.push(function (t, dt) { ring.rotation.y += dt * 0.25; });
    [[-2.35, 2.35], [2.35, -2.35], [-2.35, -2.35]].forEach(function (q) {
      obelisk(b, q[0], q[1], 3.0, 0.18);
      var fb = new T3.Group(); b.g.add(fb);
      b.add(new T3.SphereGeometry(0.2, 16, 12), dGlow("#ffd080", "#ff5a10", 2.2), 0, 0, 0, { parent: fb, noCast: true });
      fb.add(new T3.PointLight("#ff8030", 1.0, 4, 2));
      var ph = b.rand() * 6; b.fx.push(function (t) { fb.position.set(q[0], 3.85 + Math.sin(t * 1.3 + ph) * 0.08, q[1]); });
      haloG(b, q[0], 4.3, q[1], 0.3);
    });
    dSmoke(b, 0, Y + 1.0, 0, 4);
    starMotes(b, 26, 3.3, 2.0, 8.4, "#ffc070", 0.16);
  }

  /* ---------- Slytherin: Star Tree ---------- */
  function cEarth(b) {
    b.base(M("grassEarth", 3, 3), M("sideEarth", 3, 1));
    var rune = glowMat("#c8ffd8", "#30e070", 1.6), stone = M("stoneGrey", 1, 1.5, { color: lin("#b8bcb0") });
    b.add(new T3.RingGeometry(2.25, 2.35, 64), rune, 0, 0.015, 0, { rx: -PI / 2, noCast: true });
    b.add(new T3.RingGeometry(1.55, 1.6, 64), rune, 0, 0.015, 0, { rx: -PI / 2, noCast: true });
    for (var k = 0; k < 8; k++) {
      var a = k * PI / 4 + PI / 8, p = onRing(2.5, a), tg = new T3.Group(); tg.position.set(p[0], 0, p[1]); tg.rotation.y = -a + PI / 2; b.g.add(tg);
      [-0.32, 0.32].forEach(function (x) { b.add(new T3.BoxGeometry(0.22, 1.5, 0.24), stone, x, 0.75, 0, { parent: tg }); b.add(new T3.BoxGeometry(0.08, 0.5, 0.02), rune, x, 0.85, 0.13, { parent: tg, noCast: true }); });
      b.add(new T3.BoxGeometry(0.95, 0.24, 0.28), stone, 0, 1.62, 0, { parent: tg });
    }
    var bark = M("barkTree", 2, 3);
    b.add(new T3.CylinderGeometry(0.62, 1.05, 4.2, 14, 4), bark, 0, 2.1, 0);
    for (var r = 0; r < 7; r++) { var ra = r / 7 * 2 * PI + 0.3, rp = onRing(1.0, ra), rq = onRing(2.0, ra + 0.15); b.beam([rp[0] * 0.8, 1.1, rp[1] * 0.8], [rq[0], 0.05, rq[1]], 0.17 - (r % 2) * 0.04, bark); b.beam([rq[0], 0.05, rq[1]], [rq[0] * 1.12, 0.0, rq[1] * 1.12], 0.1, bark); }
    var ar = new T3.Shape(); ar.moveTo(-0.32, 0); ar.lineTo(-0.32, 0.55); ar.absarc(0, 0.55, 0.32, PI, 0, true); ar.lineTo(0.32, 0); ar.closePath();
    var door = b.add(new T3.ShapeGeometry(ar), glowMat("#0e3a1e", "#30e070", 0.9), 0.0, 0, 0, { noCast: true }); door.position.set(0.72, 0.0, 0.72); door.rotation.y = PI / 4;
    b.add(new T3.TorusGeometry(0.34, 0.07, 6, 16, PI), stone, 0.74, 0.55, 0.74, { ry: PI / 4 });
    [1.6, 3.0].forEach(function (y, i) {
      var rr = 1.0 - (y / 4.2) * 0.43 + 0.25;
      b.add(new T3.CylinderGeometry(rr + 0.25, rr + 0.25, 0.08, 24), M("plankWarm", 2, 2), 0, y, 0);
      b.add(new T3.TorusGeometry(rr + 0.25, 0.025, 6, 40), C("#3a2a1a"), 0, y + 0.22, 0, { rx: PI / 2 });
      for (var w = 0; w < 5; w++) { var wa = w / 5 * 2 * PI + i; b.add(new T3.CircleGeometry(0.1, 12), glowMat("#e8ffd0", "#7cff9a", 1.4), Math.cos(wa) * (rr - 0.02), y + 0.45, Math.sin(wa) * (rr - 0.02), { ry: PI / 2 - wa, noCast: true }); }
    });
    var leafA = C("#245e33", { flatShading: true, roughness: 0.9, emissive: lin("#0a3018"), emissiveIntensity: 0.3 }), leafB = C("#2f7a40", { flatShading: true, roughness: 0.9, emissive: lin("#0a3018"), emissiveIntensity: 0.3 }), leafC = C("#1c4a2c", { flatShading: true, roughness: 0.9, emissive: lin("#0a3018"), emissiveIntensity: 0.3 });
    var blobs = [[0, 5.3, 0, 1.55], [1.3, 4.85, 0.3, 1.1], [-1.2, 4.9, 0.5, 1.1], [0.4, 4.8, -1.3, 1.1], [-0.4, 4.75, 1.3, 1.05], [1.0, 5.55, -0.8, 0.95], [-0.9, 5.6, -0.6, 0.95], [0.2, 6.25, 0.2, 1.0], [-1.85, 4.55, -0.9, 0.75], [1.9, 4.5, 1.1, 0.75]];
    blobs.forEach(function (q, i) { b.add(new T3.IcosahedronGeometry(q[3], 1), [leafA, leafB, leafC][i % 3], q[0], q[1], q[2], { s: [1, 0.72, 1] }); });
    var fruitM = glowMat("#f4fff0", "#9affb8", 2.4), fruits = [];
    blobs.forEach(function (q) { for (var f = 0; f < 5; f++) { var th = b.rand() * 2 * PI, ph = (b.rand() * 0.9 - 0.25) * PI / 2, dx = Math.cos(ph) * Math.cos(th), dy = Math.sin(ph) * 0.72, dz = Math.cos(ph) * Math.sin(th); if (dx + dz < -0.3) continue; var fy = q[1] + dy * q[3] * 0.98; var m = b.add(new T3.OctahedronGeometry(0.1, 0), fruitM, q[0] + dx * q[3] * 1.0, fy, q[2] + dz * q[3] * 1.0, { noCast: true }); m.scale.set(1, 1.5, 1); fruits.push([m, fy, b.rand() * 6]); } });
    for (var hl = 0; hl < 7; hl++) { var ha = hl / 7 * 2 * PI + 0.4, hr = 1.5 + (hl % 2) * 0.5, hx = Math.cos(ha) * hr, hz = Math.sin(ha) * hr; b.add(new T3.CylinderGeometry(0.004, 0.004, 0.6, 4), C("#3a2a1a"), hx, 3.95, hz, { noCast: true }); var lm = b.add(new T3.OctahedronGeometry(0.09, 0), fruitM, hx, 3.6, hz, { noCast: true }); lm.scale.set(1, 1.5, 1); fruits.push([lm, 3.6, b.rand() * 6]); }
    b.fx.push(function (t) { fruits.forEach(function (q) { q[0].position.y = q[1] + Math.sin(t * 0.9 + q[2]) * 0.05; q[0].rotation.y = t + q[2]; }); fruitM.emissiveIntensity = 2.2 + Math.sin(t * 1.4) * 0.4; });
    var L = new T3.PointLight("#9affb8", 2.0, 8, 2); L.position.set(0, 4.2, 0); b.g.add(L);
    var star = new T3.Group(); b.g.add(star);
    var sm = glowMat("#f4fff0", "#5affa0", 2.6);
    var core = b.add(new T3.OctahedronGeometry(0.28, 0), sm, 0, 0, 0, { parent: star, noCast: true }); core.scale.set(1, 1.6, 1);
    for (var s2 = 0; s2 < 8; s2++) { var sa = s2 / 8 * 2 * PI; b.add(new T3.ConeGeometry(0.05, s2 % 2 ? 0.4 : 0.65, 4), sm, Math.cos(sa) * 0.3, Math.sin(sa) * 0.3, 0, { parent: star, rz: sa - PI / 2, noCast: true }); }
    star.add(new T3.PointLight("#7cffa8", 1.6, 6, 2));
    b.fx.push(function (t) { star.position.set(0, 7.6 + Math.sin(t) * 0.08, 0); star.rotation.y = t * 0.6; });
    var orb = new T3.Group(); orb.position.y = 2.4; b.g.add(orb);
    for (var o = 0; o < 6; o++) { var oa = o / 6 * 2 * PI, op = onRing(1.55, oa); var rs = b.add(new T3.DodecahedronGeometry(0.17, 0), stone, op[0], (o % 2) * 0.35, op[1], { parent: orb }); b.add(new T3.BoxGeometry(0.05, 0.16, 0.02), rune, op[0] * 1.1, (o % 2) * 0.35, op[1] * 1.1, { parent: orb, ry: -oa + PI / 2, noCast: true }); }
    b.fx.push(function (t, dt) { orb.rotation.y += dt * 0.3; });
    constellation(b, 6.9, 2.7, 9, "#7cffa8", 0.15, 0.08);
    starMotes(b, 34, 3.2, 1.0, 8.4, "#c8ffd8", 0.16);
    b.banner(2.75, 0.4, 0, "bannerEarth", 1.8); b.banner(0.4, 2.75, 0, "bannerEarth", 1.8);
  }

  var CELEST = { air: cAir, water: cWater, fire: cFire, earth: cEarth };
