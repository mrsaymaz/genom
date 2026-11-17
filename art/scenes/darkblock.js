/* ================= DARK AGE in the new design languages ================= */
  TEX.skep = [256, 256, function (g, w, h, r) {
    g.fillStyle = "#c99a48"; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 2600; i++) { var x = r() * w, y = r() * h, l = 6 + r() * 12; g.strokeStyle = rgba(["#e8c870", "#a8782e", "#f2dc94"][(r() * 3) | 0], 0.7); g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (r() - 0.5) * 2); g.stroke(); }
    for (var y = 0; y < h; y += 21) { g.fillStyle = "rgba(60,36,10,.55)"; g.fillRect(0, y, w, 3); g.fillStyle = "rgba(255,240,190,.2)"; g.fillRect(0, y + 3, w, 2); }
    for (var x2 = 0; x2 < w; x2 += 32) for (var y2 = 0; y2 < h; y2 += 21) { g.fillStyle = "rgba(60,36,10,.4)"; g.fillRect(x2 + (y2 / 21 % 2) * 16, y2 + 4, 3, 15); }
  }];
  TEX.canvasBY = [256, 256, cloth("#f0c63e", "#2a2622", "#2a2622")];
  TEX.basalt = [256, 256, stone("#4a3c3c", "#16100f", 5, 3)];
  TEX.drift = [256, 256, planks("#9c958a", 9)];
  TEX.pearl = [256, 256, function (g, w, h, r) {
    g.fillStyle = "#efe8e2"; g.fillRect(0, 0, w, h);
    blotch(g, w, h, r, 26, ["#d8e6f2", "#f2d8e0", "#ffffff", "#e0d6cc"], 0.45, 20, 70);
    for (var y = 0; y < h; y += 10) { g.strokeStyle = "rgba(150,130,120," + (0.08 + r() * 0.1) + ")"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, y); for (var x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 2); g.stroke(); }
  }];
  TEX.ironPlate = [256, 256, function (g, w, h, r) {
    g.fillStyle = "#1e1414"; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 64) for (var x = (y / 64 % 2) * 32 - 32; x < w + 64; x += 64) {
      g.fillStyle = jit("#6a2a20", r, 0.3); g.fillRect(x + 2, y + 2, 60, 60);
      g.fillStyle = "rgba(255,200,150,.12)"; g.fillRect(x + 2, y + 2, 60, 3);
      g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(x + 2, y + 58, 60, 4);
      g.fillStyle = "#b08040"; [[8, 8], [54, 8], [8, 54], [54, 54]].forEach(function (p) { g.beginPath(); g.arc(x + p[0], y + p[1], 2.5, 0, 6.3); g.fill(); });
    }
  }];
  TEX.net = [128, 128, function (g, w, h) { g.clearRect(0, 0, w, h); g.strokeStyle = "rgba(226,214,186,1)"; g.lineWidth = 2.5; for (var i = 0; i <= w; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } }];

  function dGlow(col, em, k) { return new T3.MeshStandardMaterial({ color: lin(col), emissive: lin(em), emissiveIntensity: k == null ? 1 : k, roughness: 0.5 }); }
  function dRing(r, a) { return [Math.cos(a) * r, Math.sin(a) * r]; }
  function dLathe(profile, seg) { return new T3.LatheGeometry(profile.map(function (p) { return new T3.Vector2(p[0], p[1]); }), seg || 32); }
  function dFlame(b, x, y, z, s, li) {
    var grp = new T3.Group(); grp.position.set(x, y, z); b.g.add(grp);
    var fl = [];
    [["#ff5a1a", 0.17, 0.75], ["#ff8a2a", 0.13, 0.6], ["#ffc04a", 0.09, 0.42], ["#fff0b0", 0.05, 0.26]].forEach(function (f, i) {
      var mat = new T3.MeshBasicMaterial({ color: lin(f[0]), transparent: true, opacity: 0.85, blending: T3.AdditiveBlending, depthWrite: false });
      for (var k = 0; k < 3; k++) fl.push([b.add(new T3.ConeGeometry(f[1] * s, f[2] * s, 8), mat, Math.cos(k * 2.1 + i) * 0.08 * s, f[2] * s / 2, Math.sin(k * 2.1 + i) * 0.08 * s, { parent: grp, noCast: true, noReceive: true }), i * 3 + k]);
    });
    var L = null; if (li) { L = new T3.PointLight("#ff8a3d", li, 4 * s + 2, 2); L.position.set(x, y + 0.4 * s, z); b.g.add(L); }
    var ph = b.rand() * 9;
    b.fx.push(function (t) { fl.forEach(function (q) { var p = q[1] + ph; q[0].scale.set(1 + Math.sin(t * 9 + p) * 0.12, 1 + Math.sin(t * 11 + p * 1.7) * 0.25, 1 + Math.cos(t * 8 + p) * 0.12); }); if (L) L.intensity = li * (1 + Math.sin(t * 13 + ph) * 0.12); });
  }
  function dSmoke(b, x, y, z, n) {
    var list = [];
    for (var i = 0; i < n; i++) { var sp = new T3.Sprite(new T3.SpriteMaterial({ map: tex("smoke"), transparent: true, depthWrite: false, opacity: 0.5 })); b.g.add(sp); list.push([sp, i / n]); }
    b.fx.push(function (t) { list.forEach(function (q) { var k = (t * 0.18 + q[1]) % 1; q[0].position.set(x + k * 0.5, y + k * 1.4, z - k * 0.3); var sc = 0.22 + k * 0.7; q[0].scale.set(sc, sc, 1); q[0].material.opacity = 0.5 * (1 - k) * Math.min(1, k * 6); }); });
  }
  function dSkep(b, x, y0, z, R, H) {
    var pts = [];
    for (var i = 0; i <= 26; i++) { var t = i / 26, y = t * H, r = R * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.5) * (1 + 0.035 * Math.sin(t * H * 30)); pts.push([Math.max(0.001, r), y]); }
    pts.push([0.001, H]);
    b.add(dLathe(pts, 32), M("skep", 5, H * 4), x, y0, z);
    return function (y) { var t = (y - y0) / H; return R * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.5); };
  }
  function dPennant(b, x, y, z, col) {
    var pv = new T3.Group(); pv.position.set(x, y, z); b.g.add(pv);
    var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(0.42, -0.08); sh.lineTo(0, -0.18); sh.closePath();
    b.add(new T3.ShapeGeometry(sh), C(col, { side: T3.DoubleSide }), 0, 0, 0, { parent: pv, ry: -PI / 4 });
    var ph = b.rand() * 6; b.fx.push(function (t) { pv.rotation.y = Math.sin(t * 2.2 + ph) * 0.35; });
  }

  /* -------- Hufflepuff: Sky Hall, a straw hive raised on a stilted hex deck -------- */
  function dAir(b) {
    b.base(M("grassAir", 3, 3), M("sideAir", 3, 1));
    b.decal("path", 0.6, 1.5, 1.2, 2.2, -0.3);
    var post = M("plankDark", 0.3, 1), dark = C("#2a2622"), wood = M("plankWarm", 2, 2);
    var DY = 0.78;
    for (var k = 0; k < 6; k++) { var p = dRing(1.2, k * PI / 3 + PI / 6); b.cyl(0.07, 0.09, DY, 7, post, p[0] - 0.2, 0, p[1] - 0.2); }
    for (var k2 = 0; k2 < 6; k2++) { var a = k2 * PI / 3 + PI / 6, p1 = dRing(1.2, a), p2 = dRing(1.2, a + PI / 3); b.beam([p1[0] - 0.2, 0.15, p1[1] - 0.2], [p2[0] - 0.2, DY - 0.08, p2[1] - 0.2], 0.025, post); }
    b.add(new T3.CylinderGeometry(1.42, 1.42, 0.12, 6), [M("plankDark", 4, 0.3), wood, wood], -0.2, DY + 0.06, -0.2, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(1.44, 1.44, 0.035, 6, 1, true), dark, -0.2, DY + 0.11, -0.2, { ry: PI / 6 });
    var rOn = dSkep(b, -0.2, DY + 0.12, -0.2, 1.0, 1.65);
    var lamp = dGlow("#ffd27a", "#ffa420", 1.0);
    [[PI / 4 - 0.85, DY + 0.75], [PI / 4 + 0.85, DY + 0.75], [PI / 4 - 1.7, DY + 0.6]].forEach(function (w) {
      var r = rOn(w[1]) + 0.02, x = -0.2 + Math.cos(w[0]) * r, z = -0.2 + Math.sin(w[0]) * r;
      var m = b.add(new T3.CircleGeometry(0.09, 6), lamp, x, w[1], z, { noCast: true }); m.lookAt(x + Math.cos(w[0]) * 3, w[1] + 0.3, z + Math.sin(w[0]) * 3);
      var f = b.add(new T3.RingGeometry(0.09, 0.13, 6), dark, x, w[1], z, { noCast: true }); f.lookAt(x + Math.cos(w[0]) * 3, w[1] + 0.3, z + Math.sin(w[0]) * 3);
    });
    var dr = rOn(DY + 0.35), dg = new T3.Group(); dg.position.set(-0.2 + Math.cos(PI / 4) * (dr - 0.02), DY + 0.12, -0.2 + Math.sin(PI / 4) * (dr - 0.02)); dg.rotation.y = PI / 4; b.g.add(dg);
    var ash = new T3.Shape(); ash.moveTo(-0.24, 0); ash.lineTo(-0.24, 0.32); ash.absarc(0, 0.32, 0.24, PI, 0, true); ash.lineTo(0.24, 0); ash.closePath();
    b.add(new T3.ShapeGeometry(ash), dGlow("#3a2008", "#ff9a20", 0.35), 0, 0, 0.04, { parent: dg, noCast: true });
    b.add(new T3.TorusGeometry(0.26, 0.04, 6, 6, PI), dark, 0, 0.32, 0.05, { parent: dg });
    b.add(new T3.BoxGeometry(0.75, 0.04, 0.32), M("canvasBY", 0.8, 0.4), 0, 0.72, 0.2, { parent: dg, rx: 0.35 });
    for (var s = 0; s < 4; s++) b.box(0.5, DY + 0.12 - s * 0.22 - 0.1, 0.24, M("plankWarm", 0.5, 0.3), 0.55 + s * 0.17, 0, 0.55 + s * 0.17, { ry: PI / 4 });
    b.cyl(0.02, 0.02, 0.45, 6, dark, -0.2, DY + 1.7, -0.2);
    var rose = new T3.Group(); rose.position.set(-0.2 + 0.03, DY + 2.15, -0.2 + 0.03); rose.rotation.y = PI / 4; b.g.add(rose);
    var spin = new T3.Group(); rose.add(spin);
    for (var bl = 0; bl < 6; bl++) { var g = new T3.Group(); g.rotation.z = bl * PI / 3; spin.add(g); b.add(new T3.PlaneGeometry(0.1, 0.3), M("canvasBY", 0.3, 0.6, { side: T3.DoubleSide }), 0, 0.18, 0.02, { parent: g, ry: 0.4 }); }
    b.fx.push(function (t, dt) { spin.rotation.z -= dt * 2.4; });
    [[-1.9, 1.35, 0.46, 0.75], [-1.95, 0.35, 0.36, 0.6], [1.45, -1.95, 0.42, 0.7]].forEach(function (q) {
      b.add(new T3.CylinderGeometry(q[2] + 0.12, q[2] + 0.15, 0.1, 6), M("plankDark", 2, 0.2), q[0], 0.05, q[1], { ry: PI / 6 });
      dSkep(b, q[0], 0.1, q[1], q[2], q[3]);
      b.add(new T3.CircleGeometry(0.09, 6), C("#140c04"), q[0] + Math.cos(PI / 4) * q[2] * 0.95, 0.22, q[1] + Math.sin(PI / 4) * q[2] * 0.95, { ry: PI / 4, noCast: true });
    });
    var MX = 1.95, MZ = -0.35, MH = 3.0;
    b.cyl(0.05, 0.08, MH, 8, post, MX, 0, MZ);
    b.beam([MX, MH * 0.85, MZ], [MX - 0.55, 0.05, MZ - 0.5], 0.01, C("#e8dcc0"));
    var sh = new T3.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.5, -0.55, 0.12, -1.55); sh.lineTo(-0.04, -1.55); sh.closePath();
    var sv = new T3.Group(); sv.position.set(MX, MH - 0.15, MZ); sv.rotation.y = PI / 2 + 0.6; b.g.add(sv);
    var sail = b.add(new T3.ShapeGeometry(sh), M("canvasBY", 1, 1, { side: T3.DoubleSide }), 0, 0, 0, { parent: sv });
    b.fx.push(function (t) { sail.scale.x = 1 + Math.sin(t * 1.6) * 0.2; });
    dPennant(b, MX, MH, MZ, "#f0c63e");
    var lm = new T3.Group(); lm.position.set(0.95, 1.45, 0.95); b.g.add(lm);
    b.beam([0.95, 0.0, 0.95], [0.95, 1.55, 0.95], 0.03, post);
    b.add(new T3.CylinderGeometry(0.06, 0.07, 0.14, 6), lamp, 0, -0.1, 0, { parent: lm, noCast: true });
    var jar = new T3.MeshStandardMaterial({ color: lin("#f2a72e"), emissive: lin("#c06a10"), emissiveIntensity: 0.4, roughness: 0.25 });
    [[-0.9, 2.2], [-0.65, 2.35], [-0.95, 2.45]].forEach(function (q) { b.cyl(0.09, 0.09, 0.2, 6, jar, q[0], 0, q[1]); b.cyl(0.06, 0.06, 0.04, 6, dark, q[0], 0.2, q[1]); });
    b.hay(1.95, 1.9, 0.4); b.hay(2.3, 1.4, -0.3); b.crate(1.55, 2.35, 0.26, 0.3);
    b.banner(-0.5, 1.75, 0, "bannerAir", 1.5);
    b.bush(-2.5, -2.4, 0.2); b.oak(0.6, -2.5, 0.85); b.bush(2.5, -2.5, 0.16);
    for (var j = 0; j < 14; j++) b.tuft(-2.8 + b.rand() * 5.6, 1.3 + b.rand() * 1.5, "#5a9238");
  }

  /* -------- Ravenclaw: Tide Hall, a driftwood hut under a conch-shell roof by the water -------- */
  function dConch(b, x, z, H, R, y0, turns, ridgeCol) {
    var prof = [[0.001, 0]];
    [[0.75, 0.04], [1.0, 0.3], [1.0, 0.6], [0.82, 0.95], [0.6, 1.3], [0.44, 1.6], [0.31, 1.95], [0.2, 2.3], [0.11, 2.62], [0.04, 2.85], [0.001, 2.95]].forEach(function (q) { prof.push([q[0] * R, q[1] / 2.95 * H]); });
    b.add(dLathe(prof, 36), M("pearl", 3, 3, { roughness: 0.35, metalness: 0.08, color: lin("#f2dcd2") }), x, y0, z);
    function rAt(y) { for (var i = 1; i < prof.length; i++) if (prof[i][1] >= y) { var a = prof[i - 1], c = prof[i], k = (y - a[1]) / Math.max(1e-6, c[1] - a[1]); return a[0] + (c[0] - a[0]) * k; } return 0; }
    var pts = [];
    for (var s = 0; s <= 140; s++) { var t = s / 140, y = 0.12 * H + t * 0.82 * H, a = t * PI * 2 * (turns || 4); pts.push(new T3.Vector3(x + Math.cos(a) * (rAt(y) + 0.012), y0 + y, z + Math.sin(a) * (rAt(y) + 0.012))); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 280, 0.075 * R, 6, false), M("pearl", 1, 8, { color: lin(ridgeCol || "#9a6e64"), roughness: 0.4 }), 0, 0, 0);
    return rAt;
  }
  function dWater(b) {
    var grass = M("grassWater", 2.5, 2.5), side = M("sideWater", 2.5, 1), bottom = C("#21180f");
    b.add(new T3.BoxGeometry(4.9, 0.7, 4.9), [side, side, grass, bottom, side, side], -0.55, -0.35, -0.55);
    b.add(new T3.BoxGeometry(6, 0.35, 1.1), M("dirt", 2, 1), 0, -0.525, 2.45);
    b.add(new T3.BoxGeometry(1.1, 0.35, 4.9), M("dirt", 2, 1), 2.45, -0.525, -0.55);
    var wtex = tex("water", 2, 1), wtex2 = tex("water", 1, 2);
    b.add(new T3.BoxGeometry(6, 0.27, 1.1), new T3.MeshStandardMaterial({ map: wtex, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 0, -0.215, 2.45, { noCast: true });
    b.add(new T3.BoxGeometry(1.1, 0.27, 4.9), new T3.MeshStandardMaterial({ map: wtex2, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 2.45, -0.215, -0.55, { noCast: true });
    b.fx.push(function (t) { wtex.offset.set(t * 0.03, Math.sin(t * 0.4) * 0.02); wtex2.offset.set(Math.sin(t * 0.4) * 0.02, -t * 0.03); });
    var sand = M("dirt", 1.5, 1.5, { color: lin("#f0e2c0") });
    b.add(new T3.CylinderGeometry(1.75, 1.85, 0.08, 28), sand, -0.6, 0.04, -0.6);
    var HX = -0.6, HZ = -0.6, drift = M("drift", 4, 1);
    b.cyl(1.0, 1.05, 0.95, 16, drift, HX, 0.08, HZ);
    b.add(new T3.TorusGeometry(1.02, 0.04, 6, 32), C("#6a5a48"), HX, 0.35, HZ, { rx: PI / 2 });
    b.add(new T3.TorusGeometry(1.02, 0.04, 6, 32), C("#6a5a48"), HX, 0.85, HZ, { rx: PI / 2 });
    dConch(b, HX, HZ, 1.75, 1.18, 1.0, 4);
    var bz = C("#c08a4a", { metalness: 0.75, roughness: 0.3 }), glass = dGlow("#bfe8ff", "#4ab0f0", 0.7);
    [PI / 4 - 0.8, PI / 4 + 0.8, -0.5].forEach(function (a) {
      var p = dRing(1.05, a), x = HX + p[0], z = HZ + p[1];
      var g = b.add(new T3.CircleGeometry(0.11, 16), glass, x, 0.6, z, { noCast: true }); g.lookAt(x + p[0], 0.6, z + p[1]);
      var r = b.add(new T3.TorusGeometry(0.12, 0.025, 6, 16), bz, x, 0.6, z); r.lookAt(x + p[0], 0.6, z + p[1]);
    });
    var mouth = new T3.Group(); mouth.position.set(HX + Math.cos(PI / 4) * 1.03, 0.08, HZ + Math.sin(PI / 4) * 1.03); mouth.rotation.y = PI / 4; b.g.add(mouth);
    b.add(new T3.TorusGeometry(0.34, 0.09, 8, 24, PI * 1.25), M("pearl", 2, 0.5, { color: lin("#f6dcd4") }), 0, 0.34, 0.03, { parent: mouth, rz: -PI * 0.125 });
    b.add(new T3.CircleGeometry(0.31, 22), dGlow("#1a3a5a", "#2a7ac8", 0.45), 0, 0.34, 0.02, { parent: mouth, noCast: true });
    dConch(b, 0.9, -1.95, 2.0, 0.42, 0.0, 4.5);
    b.box(0.95, 0.07, 1.25, M("drift", 1, 2), HX, -0.02, 2.42);
    [[-0.42, 1.85], [0.42, 1.85], [-0.42, 2.98], [0.42, 2.98]].forEach(function (q) { b.cyl(0.04, 0.045, 0.85, 7, C("#6a5a48"), HX + q[0], -0.4, q[1]); });
    b.box(0.7, 0.06, 1.3, M("drift", 1, 2), 2.45, -0.02, 0.6);
    [[2.15, 0.0], [2.75, 0.0], [2.15, 1.2], [2.75, 1.2]].forEach(function (q) { b.cyl(0.035, 0.04, 0.8, 7, C("#6a5a48"), q[0], -0.4, q[1]); });
    var bsh = new T3.Shape(); bsh.moveTo(-0.5, 0); bsh.quadraticCurveTo(-0.3, 0.2, 0, 0.2); bsh.quadraticCurveTo(0.3, 0.2, 0.5, 0); bsh.quadraticCurveTo(0.3, -0.2, 0, -0.2); bsh.quadraticCurveTo(-0.3, -0.2, -0.5, 0);
    var boat = new T3.Group(); boat.position.set(2.4, -0.12, -0.55); boat.rotation.y = PI / 2; b.g.add(boat);
    b.add(new T3.ExtrudeGeometry(bsh, { depth: 0.16, bevelEnabled: false }), M("drift", 2, 2), 0, 0, 0, { parent: boat, rx: -PI / 2 });
    b.add(new T3.BoxGeometry(0.06, 0.03, 0.34), C("#5a4a3a"), 0.05, 0.15, 0, { parent: boat });
    b.fx.push(function (t) { boat.rotation.z = Math.sin(t * 1.2) * 0.04; boat.position.y = -0.12 + Math.sin(t * 1.5) * 0.012; });
    var netM = new T3.MeshStandardMaterial({ map: tex("net", 2, 1), transparent: true, alphaTest: 0.4, side: T3.DoubleSide, roughness: 1 });
    [[0.75, 0.75], [1.45, 0.05]].forEach(function (q) { b.cyl(0.03, 0.035, 1.0, 6, C("#6a5a48"), q[0], 0, q[1]); });
    var net = b.add(new T3.PlaneGeometry(1.0, 0.6), netM, 1.1, 0.68, 0.4, { ry: -PI / 4, noCast: true });
    b.fx.push(function (t) { net.rotation.x = Math.sin(t * 1.3) * 0.06; });
    b.cyl(0.04, 0.05, 1.1, 6, C("#6a5a48"), -1.95, 0, 0.9); b.beam([-1.95, 1.05, 0.9], [-1.7, 1.05, 0.9], 0.025, C("#6a5a48"));
    var bell = new T3.Group(); bell.position.set(-1.72, 1.02, 0.9); b.g.add(bell);
    b.add(new T3.ConeGeometry(0.1, 0.16, 12, 1, true), bz, 0, -0.1, 0, { parent: bell, s: [1, 1, 1] });
    b.fx.push(function (t) { bell.rotation.z = Math.sin(t * 1.8) * 0.12; });
    var shellM = M("pearl", 0.3, 0.3, { color: lin("#f6d8cc") });
    [[0.2, 0.9], [-1.4, 0.85], [0.95, -0.7]].forEach(function (q, i) { b.add(new T3.SphereGeometry(0.08, 10, 6, 0, 2 * PI, 0, PI / 2), shellM, q[0], 0.08, q[1], { s: [1, 0.5, 1.3], ry: i }); });
    b.add(new T3.SphereGeometry(0.11, 14, 10), dGlow("#bfe8ff", "#4ab0f0", 1.2), 0.75, 1.02, 0.75, { noCast: true });
    var reed = C("#6a8a3a", { flatShading: true });
    [[-2.75, 2.1], [-2.65, 2.85], [1.0, 2.75]].forEach(function (q) { for (var k = 0; k < 5; k++) b.add(new T3.ConeGeometry(0.02, 0.5 + b.rand() * 0.3, 3), reed, q[0] + (b.rand() - 0.5) * 0.18, 0.1, q[1] + (b.rand() - 0.5) * 0.18, { rz: (b.rand() - 0.5) * 0.4 }); });
    b.banner(-1.75, -0.05 + 1.2, 0.08, "bannerWater", 1.5);
    b.rock(-2.5, -2.3, 0.16, "#9aa6ae"); b.rock(-2.2, -2.6, 0.12, "#9aa6ae");
  }

  /* -------- Gryffindor: Ember Keep, basalt forge-huts around a fire pit -------- */
  function dFrustum(b, x, y0, z, r0, r1, h, mat) { return b.add(new T3.CylinderGeometry(r1, r0, h, 4, 1), mat, x, y0 + h / 2, z, { ry: PI / 4 }); }
  function dFire(b) {
    b.base(M("grassFire", 3, 3, { color: lin("#c8b890") }), M("sideFire", 3, 1));
    b.decal("path", 0.5, 0.6, 3.2, 3.0);
    var bas = M("basalt", 3, 1), iron = M("ironPlate", 2, 1), gold = C("#e3a83a", { metalness: 0.7, roughness: 0.3 }), magma = dGlow("#ffb060", "#ff4a10", 1.5);
    var HX = -0.65, HZ = -0.75;
    dFrustum(b, HX, 0, HZ, 1.75, 1.6, 0.18, M("basalt", 3, 0.2));
    dFrustum(b, HX, 0.18, HZ, 1.5, 1.32, 1.05, bas);
    dFrustum(b, HX, 1.23, HZ, 1.42, 1.38, 0.08, gold);
    dFrustum(b, HX, 1.31, HZ, 1.05, 0.92, 0.6, bas);
    dFrustum(b, HX, 1.85, HZ, 0.98, 0.95, 0.06, gold);
    dFrustum(b, HX, 1.91, HZ, 0.62, 0.5, 0.32, iron);
    var spk = M("iron"), e1 = 1.36 * 0.707, e2 = 0.94 * 0.707;
    [[e1, 1.31], [e2, 1.91]].forEach(function (q) {
      for (var k = -3; k <= 3; k++) { var o = k / 3 * q[0] * 0.9; [[o, q[0]], [q[0], o], [o, -q[0]], [-q[0], o]].forEach(function (pp) { b.add(new T3.ConeGeometry(0.04, 0.2, 4), spk, HX + pp[0], q[1] + 0.1, HZ + pp[1]); }); }
    });
    b.cyl(0.3, 0.2, 0.18, 8, M("iron"), HX, 2.23, HZ);
    b.cyl(0.27, 0.27, 0.02, 8, magma, HX, 2.41, HZ, { noCast: true });
    dFlame(b, HX, 2.42, HZ, 0.7, 1.0);
    var fz = HZ + 1.41 * 0.707 + 0.01;
    var ash = new T3.Shape(); ash.moveTo(-0.27, 0); ash.lineTo(-0.27, 0.4); ash.lineTo(0, 0.66); ash.lineTo(0.27, 0.4); ash.lineTo(0.27, 0); ash.closePath();
    var gg = new T3.MeshBasicMaterial({ color: lin("#ff8a3d"), transparent: true, opacity: 0.6 });
    b.add(new T3.ShapeGeometry(ash), C("#120808"), HX, 0.18, fz, { noCast: true });
    b.add(new T3.ShapeGeometry(ash), gg, HX, 0.21, fz + 0.005, { noCast: true, s: [0.78, 0.82, 1] });
    var head = new T3.Group(); head.position.set(HX, 1.05, fz + 0.04); b.g.add(head);
    b.add(new T3.SphereGeometry(0.13, 12, 9), gold, 0, 0, 0, { parent: head, s: [1, 1, 0.7] });
    b.add(new T3.SphereGeometry(0.06, 10, 8), gold, 0, -0.04, 0.09, { parent: head });
    for (var m = 0; m < 10; m++) { var a = m / 10 * 2 * PI; b.add(new T3.ConeGeometry(0.035, 0.12, 4), gold, Math.cos(a) * 0.15, Math.sin(a) * 0.15, -0.02, { parent: head, rz: a - PI / 2 }); }
    [-0.65, 0.65].forEach(function (dx) { b.box(0.14, 0.32, 0.03, dGlow("#ffd38a", "#ff9a3c", 1.2), HX + dx, 0.6, fz, { noCast: true }); b.box(0.03, 0.32, 0.14, dGlow("#ffd38a", "#ff9a3c", 1.2), HX + 1.41 * 0.707 + 0.01, 0.6, HZ + dx, { noCast: true }); });
    var CX = HX + 0.85, CZ = HZ - 0.85;
    dFrustum(b, CX, 1.0, CZ, 0.32, 0.2, 1.75, bas);
    b.cyl(0.15, 0.15, 0.05, 8, magma, CX, 2.75, CZ, { noCast: true });
    dFlame(b, CX, 2.78, CZ, 0.4, 0.4); dSmoke(b, CX, 3.1, CZ, 5);
    var PX = 0.95, PZ = 0.85;
    for (var r = 0; r < 9; r++) { var p = dRing(0.48, r / 9 * 2 * PI); b.add(new T3.DodecahedronGeometry(0.13, 0), C("#3a3032", { flatShading: true }), PX + p[0], 0.08, PZ + p[1], { ry: r, s: [1, 0.7, 1] }); }
    b.add(new T3.CylinderGeometry(0.42, 0.42, 0.04, 16), magma, PX, 0.04, PZ, { noCast: true });
    dFlame(b, PX, 0.06, PZ, 0.9, 1.6);
    var embers = [], em = new T3.SpriteMaterial({ map: tex("ember"), blending: T3.AdditiveBlending, depthWrite: false, transparent: true });
    for (var e = 0; e < 8; e++) { var sp = new T3.Sprite(em); sp.scale.set(0.06, 0.06, 1); b.g.add(sp); embers.push([sp, b.rand() * 2, (b.rand() - 0.5) * 0.5, (b.rand() - 0.5) * 0.5]); }
    b.fx.push(function (t) { embers.forEach(function (q) { var k = ((t * 0.6 + q[1]) % 1.2) / 1.2; q[0].position.set(PX + q[2] * k, 0.4 + k * 1.8, PZ + q[3] * k); q[0].material.opacity = 1 - k; }); gg.opacity = 0.5 + Math.sin(t * 5) * 0.1; magma.emissiveIntensity = 1.3 + Math.sin(t * 2) * 0.3; });
    var FX = 1.55, FZ = -1.35;
    dFrustum(b, FX, 0, FZ, 0.75, 0.65, 0.8, bas);
    dFrustum(b, FX, 0.8, FZ, 0.82, 0.3, 0.55, iron);
    b.box(0.4, 0.4, 0.03, dGlow("#ffb060", "#ff6a1a", 1.2), FX, 0.05, FZ + 0.48, { noCast: true });
    b.cyl(0.11, 0.14, 0.22, 8, M("plankDark", 0.4, 0.3), FX - 0.1, 0, FZ + 0.85);
    b.box(0.3, 0.09, 0.13, M("iron"), FX - 0.1, 0.22, FZ + 0.85, { ry: 0.6 });
    var stake = C("#6a4a2c", { flatShading: true });
    for (var s2 = 0; s2 < 11; s2++) { var z = -2.6 + s2 * 0.38; b.add(new T3.ConeGeometry(0.07, 0.75, 5), stake, -2.6, 0.32, z, { rz: 0.25 }); }
    for (var s3 = 0; s3 < 7; s3++) { var x = -2.2 + s3 * 0.38; b.add(new T3.ConeGeometry(0.07, 0.75, 5), stake, x, 0.32, -2.6, { rx: -0.25 }); }
    b.banner(HX - 0.55, fz + 0.45, 0, "bannerFire", 1.55); b.banner(HX + 0.55, fz + 0.45, 0, "bannerFire", 1.55);
    b.logs(2.2, 0.6, 0.3); b.logs(2.25, 1.25, -0.1);
    var ore = C("#4a3c3e", { flatShading: true });
    for (var o = 0; o < 6; o++) b.add(new T3.DodecahedronGeometry(0.08 + b.rand() * 0.05, 0), ore, 2.3 + (b.rand() - 0.5) * 0.4, 0.06, -0.4 + (b.rand() - 0.5) * 0.4);
    b.pine(1.0, -2.55, 0.8); b.pine(2.55, -2.5, 0.75);
  }
  var DARKNEW = { air: dAir, water: dWater, fire: dFire };