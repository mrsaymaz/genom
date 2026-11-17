
  /* ================= NEW DESIGN LANGUAGES ================= */
  TEX.honeycomb = [256, 256, function (g, w, h, r) {
    g.fillStyle = "#7a5418"; g.fillRect(0, 0, w, h);
    var s = 18, hh = s * Math.sqrt(3);
    for (var row = -1; row * hh / 2 < h + hh; row++) for (var col = -1; col * s * 1.5 < w + s * 2; col++) {
      var cx = col * s * 1.5, cy = row * hh + (col % 2 ? hh / 2 : 0);
      g.beginPath(); for (var k = 0; k < 6; k++) { var a = k * Math.PI / 3; g.lineTo(cx + Math.cos(a) * (s - 2.5), cy + Math.sin(a) * (s - 2.5)); } g.closePath();
      g.fillStyle = jit("#e2a83a", r, 0.3); g.fill();
      g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(cx - s * 0.4, cy - s * 0.55, s * 0.8, 2);
    }
    speckle(g, w, h, r, 900, ["#4a3008", "#fff0b0"], 0.25, 2);
  }];
  TEX.skep = [256, 256, function (g, w, h, r) {
    g.fillStyle = "#c99a48"; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 2600; i++) { var x = r() * w, y = r() * h, l = 6 + r() * 12; g.strokeStyle = rgba(["#e8c870", "#a8782e", "#f2dc94"][(r() * 3) | 0], 0.7); g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (r() - 0.5) * 2); g.stroke(); }
    for (var y = 0; y < h; y += 21) { g.fillStyle = "rgba(60,36,10,.55)"; g.fillRect(0, y, w, 3); g.fillStyle = "rgba(255,240,190,.2)"; g.fillRect(0, y + 3, w, 2); }
    for (var x = 0; x < w; x += 32) for (var y2 = 0; y2 < h; y2 += 21) { g.fillStyle = "rgba(60,36,10,.4)"; g.fillRect(x + (y2 / 21 % 2) * 16, y2 + 4, 3, 15); }
  }];
  TEX.canvasBY = [256, 256, cloth("#f0c63e", "#2a2622", "#2a2622")];
  TEX.basalt = [256, 256, stone("#4a3c3c", "#16100f", 5, 3)];
  TEX.pearl = [256, 256, function (g, w, h, r) {
    g.fillStyle = "#efe8e2"; g.fillRect(0, 0, w, h);
    blotch(g, w, h, r, 26, ["#d8e6f2", "#f2d8e0", "#ffffff", "#e0d6cc"], 0.45, 20, 70);
    for (var y = 0; y < h; y += 10) { g.strokeStyle = "rgba(150,130,120," + (0.08 + r() * 0.1) + ")"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, y); for (var x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 2); g.stroke(); }
  }];
  TEX.ironPlate = [256, 256, function (g, w, h, r) {
    g.fillStyle = "#1e1414"; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 64) for (var x = (y / 64 % 2) * 32; x < w + 64; x += 64) {
      g.fillStyle = jit("#8a2a1e", r, 0.3); g.fillRect(x + 2, y + 2, 60, 60);
      g.fillStyle = "rgba(255,200,150,.12)"; g.fillRect(x + 2, y + 2, 60, 3);
      g.fillStyle = "rgba(0,0,0,.3)"; g.fillRect(x + 2, y + 58, 60, 4);
      g.fillStyle = "#d8a040"; [[8, 8], [54, 8], [8, 54], [54, 54]].forEach(function (p) { g.beginPath(); g.arc(x + p[0], y + p[1], 2.5, 0, 6.3); g.fill(); });
    }
    speckle(g, w, h, r, 1200, ["#000000", "#c0603a"], 0.2, 2);
  }];

  function lathe(profile, seg) { return new T3.LatheGeometry(profile.map(function (p) { return new T3.Vector2(p[0], p[1]); }), seg || 32); }
  function hexWin(b, parent, x, y, z, s, nx, nz, mat) { var m = b.add(new T3.CircleGeometry(s, 6), mat, x, y, z, { parent: parent, noCast: true }); m.lookAt(x + nx * 5 + (parent ? parent.position.x : 0), y + (parent ? parent.position.y : 0), z + nz * 5 + (parent ? parent.position.z : 0)); m.rotation.z += PI / 6; return m; }

  /* -------- Hufflepuff: Hive and Sail -------- */
  function skep(b, x, z, R, H, y0) {
    var pts = [];
    for (var i = 0; i <= 28; i++) { var t = i / 28, y = t * H, r = R * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.5) * (1 + 0.035 * Math.sin(t * H * 30)); pts.push([Math.max(0.001, r), y]); }
    pts.push([0.001, H]);
    var m = b.add(lathe(pts, 36), M("skep", 5, H * 4), x, y0 || 0, z);
    return m;
  }
  function newAir(b) {
    b.base(M("grassAir", 3, 3), M("sideAir", 3, 1));
    var hc = M("honeycomb", 3, 3), hcS = M("honeycomb", 6, 0.4), dark = C("#2a2622");
    b.add(new T3.CylinderGeometry(2.35, 2.45, 0.25, 6), [hcS, hc, hc], 0, 0.125, 0, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(2.38, 2.38, 0.04, 6, 1, true), dark, 0, 0.26, 0, { ry: PI / 6 });
    [[-1.35, -0.75, 0.62, 1.0], [0.75, -1.4, 0.55, 0.9], [-1.4, 0.75, 0.48, 0.8]].forEach(function (q) {
      b.add(new T3.CylinderGeometry(q[2] + 0.15, q[2] + 0.18, 0.12, 6), [hcS, hc, hc], q[0], 0.31, q[1], { ry: PI / 6 });
      skep(b, q[0], q[1], q[2], q[3], 0.37);
      var a = Math.atan2(-q[1], -q[0]);
      b.add(new T3.CircleGeometry(0.12, 6), C("#140c04"), q[0] + Math.cos(PI / 4) * q[2] * 0.96, 0.5, q[1] + Math.sin(PI / 4) * q[2] * 0.96, { ry: PI / 4, noCast: true });
    });
    var H = 2.3, R = 1.3;
    skep(b, 0, 0, R, H, 0.25);
    var amber = glowMat("#ffd27a", "#ffa420", 1.2);
    function rOn(y) { var t = (y - 0.25) / H; return R * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.5); }
    [[PI / 4 - 0.75, 1.0], [PI / 4 + 0.75, 1.0], [PI / 4, 1.55], [PI / 4 - 1.5, 1.3], [PI / 4 + 1.5, 1.3], [PI / 4, 2.05]].forEach(function (w) {
      var r = rOn(w[1]) + 0.02, x = Math.cos(w[0]) * r, z = Math.sin(w[0]) * r;
      var m = b.add(new T3.CircleGeometry(0.11, 6), amber, x, w[1], z, { noCast: true }); m.lookAt(x * 4, w[1] + 0.4, z * 4);
      var f = b.add(new T3.RingGeometry(0.11, 0.15, 6), dark, x * 1.003, w[1], z * 1.003, { noCast: true }); f.lookAt(x * 4, w[1] + 0.4, z * 4);
    });
    var dg = new T3.Group(); dg.position.set(Math.cos(PI / 4) * 1.22, 0.25, Math.sin(PI / 4) * 1.22); dg.rotation.y = PI / 4; b.g.add(dg);
    var ash = new T3.Shape(); ash.moveTo(-0.3, 0); ash.lineTo(-0.3, 0.4); ash.absarc(0, 0.4, 0.3, PI, 0, true); ash.lineTo(0.3, 0); ash.closePath();
    b.add(new T3.ShapeGeometry(ash), glowMat("#3a2008", "#ff9a20", 0.6), 0, 0, 0.05, { parent: dg, noCast: true });
    b.add(new T3.TorusGeometry(0.33, 0.05, 6, 6, PI), dark, 0, 0.4, 0.06, { parent: dg, rz: 0 });
    var crown = new T3.Group(); crown.position.set(0, 0.25 + H + 0.15, 0); b.g.add(crown);
    var hc2 = b.add(new T3.CylinderGeometry(0.16, 0.16, 0.38, 6), amber, 0, 0.19, 0, { parent: crown, noCast: true });
    b.add(new T3.ConeGeometry(0.16, 0.22, 6), amber, 0, 0.49, 0, { parent: crown, noCast: true });
    b.add(new T3.ConeGeometry(0.16, 0.22, 6), amber, 0, -0.11, 0, { parent: crown, rx: PI, noCast: true });
    var L = new T3.PointLight("#ffb030", 1.0, 4, 2); L.position.set(0, 0.2, 0); crown.add(L);
    b.fx.push(function (t) { crown.position.y = 0.25 + H + 0.2 + Math.sin(t * 1.4) * 0.07; crown.rotation.y = t * 0.6; });
    var bw = M("plankDark", 0.3, 2), sail = M("canvasBY", 1, 1, { side: T3.DoubleSide });
    [[-1.9, 1.5, 3.3, -0.25], [1.5, -1.9, 3.0, 0.25]].forEach(function (m, i) {
      var top = [m[0] * 0.85, m[2], m[1] * 0.85];
      b.beam([m[0], 0.25, m[1]], top, 0.05, bw);
      var sh = new T3.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.55, -0.6, 0.15, -1.8); sh.lineTo(-0.05, -1.8); sh.closePath();
      var pv = new T3.Group(); pv.position.set(top[0], top[1] - 0.1, top[2]); pv.rotation.y = Math.atan2(m[0], m[1]) + PI / 2; b.g.add(pv);
      var s1 = b.add(new T3.ShapeGeometry(sh), sail, 0, 0, 0, { parent: pv });
      b.fx.push(function (t) { s1.scale.x = 1 + Math.sin(t * 1.6 + i) * 0.2; });
      b.pennant(top[0], top[1], top[2], i ? "#2a2622" : "#f0c63e", 0.4);
      var kite = new T3.Group(); b.g.add(kite);
      var ks = new T3.Shape(); ks.moveTo(0, 0.28); ks.lineTo(0.18, 0); ks.lineTo(0, -0.38); ks.lineTo(-0.18, 0); ks.closePath();
      b.add(new T3.ShapeGeometry(ks), M("canvasBY", 0.6, 0.6, { side: T3.DoubleSide }), 0, 0, 0, { parent: kite });
      b.add(new T3.PlaneGeometry(0.04, 0.6), C(i ? "#f0c63e" : "#2a2622", { side: T3.DoubleSide }), 0, -0.68, 0, { parent: kite, noCast: true });
      var strM = C("#e8dcc0"), str = b.add(new T3.CylinderGeometry(0.006, 0.006, 1, 4), strM, 0, 0, 0, { noCast: true });
      var base = new T3.Vector3(top[0], top[1], top[2]);
      b.fx.push(function (t) {
        var kp = new T3.Vector3(top[0] * 0.55 + Math.sin(t * 0.7 + i * 2) * 0.35, 4.3 + i * 0.35 + Math.sin(t * 1.1 + i) * 0.15, top[2] * 0.55 + Math.cos(t * 0.6 + i) * 0.25);
        kite.position.copy(kp); kite.rotation.set(0, PI / 4, Math.sin(t * 1.5 + i) * 0.3);
        var d = kp.clone().sub(base); str.position.copy(base).add(d.clone().multiplyScalar(0.5)); str.scale.set(1, d.length(), 1); str.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), d.normalize());
      });
    });
    var rose = new T3.Group(); rose.position.set(1.95, 1.6, 1.95); rose.rotation.y = PI / 4; b.g.add(rose);
    b.beam([1.95, 0.25, 1.95], [1.95, 1.55, 1.95], 0.04, bw);
    var spin = new T3.Group(); rose.add(spin);
    for (var k = 0; k < 6; k++) { var bl = new T3.Group(); bl.rotation.z = k * PI / 3; spin.add(bl); b.add(new T3.PlaneGeometry(0.13, 0.42), M("canvasBY", 0.3, 0.6, { side: T3.DoubleSide }), 0, 0.25, 0.02, { parent: bl, ry: 0.4 }); }
    b.add(new T3.CylinderGeometry(0.06, 0.06, 0.06, 6), amber, 0, 0, 0.04, { parent: spin, rx: PI / 2, noCast: true });
    b.fx.push(function (t, dt) { spin.rotation.z -= dt * 2.2; });
    var jar = new T3.MeshStandardMaterial({ color: lin("#f2a72e"), emissive: lin("#c06a10"), emissiveIntensity: 0.5, roughness: 0.25 });
    [[1.0, 1.75], [1.25, 1.6], [1.15, 1.95]].forEach(function (q) { b.cyl(0.1, 0.1, 0.22, 6, jar, q[0], 0.25, q[1]); b.cyl(0.07, 0.07, 0.04, 6, dark, q[0], 0.47, q[1]); });
    b.banner(-0.75, 1.95, 0.25, "bannerAir", 1.6);
  }

  /* -------- Ravenclaw: Shell and Glass -------- */
  function conchProfile(H, R) {
    var p = [[0.001, 0]];
    [[0.75, 0.04], [1.0, 0.3], [1.0, 0.6], [0.82, 0.95], [0.6, 1.3], [0.44, 1.6], [0.31, 1.95], [0.2, 2.3], [0.11, 2.62], [0.04, 2.85], [0.001, 2.95]].forEach(function (q) { p.push([q[0] * R, q[1] / 2.95 * H]); });
    return p;
  }
  function conch(b, x, z, H, R, y0, turns) {
    var prof = conchProfile(H, R), pearl = M("pearl", 3, 3, { roughness: 0.35, metalness: 0.08, color: lin("#f2dcd2") });
    b.add(lathe(prof, 40), pearl, x, y0, z);
    function rAt(y) { for (var i = 1; i < prof.length; i++) if (prof[i][1] >= y) { var a = prof[i - 1], c = prof[i], k = (y - a[1]) / Math.max(1e-6, c[1] - a[1]); return a[0] + (c[0] - a[0]) * k; } return 0; }
    var pts = [];
    for (var s = 0; s <= 160; s++) { var t = s / 160, y = 0.15 * H + t * 0.8 * H, a = t * PI * 2 * (turns || 5); var r = rAt(y) + 0.015; pts.push(new T3.Vector3(x + Math.cos(a) * r, y0 + y, z + Math.sin(a) * r)); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 320, 0.075 * R, 6, false), M("pearl", 1, 8, { color: lin("#9a6e64"), roughness: 0.4 }), 0, 0, 0);
    return rAt;
  }
  function newWater(b) {
    var grass = M("grassWater", 2.5, 2.5), side = M("sideWater", 2.5, 1), bottom = C("#21180f");
    b.add(new T3.BoxGeometry(4.9, 0.7, 4.9), [side, side, grass, bottom, side, side], -0.55, -0.35, -0.55);
    b.add(new T3.BoxGeometry(6, 0.35, 1.1), M("dirt", 2, 1), 0, -0.525, 2.45);
    b.add(new T3.BoxGeometry(1.1, 0.35, 4.9), M("dirt", 2, 1), 2.45, -0.525, -0.55);
    var wtex = tex("water", 2, 1), wtex2 = tex("water", 1, 2);
    b.add(new T3.BoxGeometry(6, 0.27, 1.1), new T3.MeshStandardMaterial({ map: wtex, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 0, -0.215, 2.45, { noCast: true });
    b.add(new T3.BoxGeometry(1.1, 0.27, 4.9), new T3.MeshStandardMaterial({ map: wtex2, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 2.45, -0.215, -0.55, { noCast: true });
    b.fx.push(function (t) { wtex.offset.set(t * 0.03, 0); wtex2.offset.set(0, -t * 0.03); });
    var CX = -0.6, CZ = -0.6, pl = M("stoneBlue", 4, 0.4), plT = M("stoneBlue", 3, 3);
    b.add(new T3.CylinderGeometry(1.85, 1.95, 0.32, 40), [pl, plT, plT], CX, 0.16, CZ);
    var wt = tex("water", 1, 1);
    b.add(new T3.CircleGeometry(0.65, 30), new T3.MeshStandardMaterial({ map: wt, roughness: 0.1, metalness: 0.25 }), CX + 0.95, 0.33, CZ + 0.95, { rx: -PI / 2, noCast: true });
    b.add(new T3.TorusGeometry(0.66, 0.05, 6, 30), M("pearl", 2, 0.2), CX + 0.95, 0.34, CZ + 0.95, { rx: PI / 2 });
    var rAt = conch(b, CX - 0.15, CZ - 0.15, 3.6, 1.15, 0.32, 5.5);
    var mouth = new T3.Group(); mouth.position.set(CX - 0.15 + 0.75, 0.32, CZ - 0.15 + 0.75); mouth.rotation.y = PI / 4; b.g.add(mouth);
    b.add(new T3.TorusGeometry(0.5, 0.13, 10, 28, PI * 1.25), M("pearl", 2, 0.5, { color: lin("#f6dcd4") }), 0, 0.45, 0.05, { parent: mouth, rz: -PI * 0.125 });
    var mg = glowMat("#9fdcff", "#2a9ae8", 0.9);
    b.add(new T3.CircleGeometry(0.44, 28), mg, 0, 0.45, 0.0, { parent: mouth, noCast: true });
    b.add(new T3.BoxGeometry(0.9, 0.04, 0.4), M("pearl", 1, 0.4), 0, 0.02, 0.25, { parent: mouth });
    var glass = new T3.MeshStandardMaterial({ color: lin("#8fd8ff"), emissive: lin("#2a9ae8"), emissiveIntensity: 0.8, transparent: true, opacity: 0.85, roughness: 0.05 });
    [[-0.6, 1.2, 0.18], [1.45, 1.35, 0.16], [0.6, 2.0, 0.13], [-0.2, 2.45, 0.1], [2.2, 1.0, 0.15]].forEach(function (q) {
      var r = rAt(q[1]) + 0.01, x = CX - 0.15 + Math.cos(q[0]) * r, z = CZ - 0.15 + Math.sin(q[0]) * r;
      b.add(new T3.SphereGeometry(q[2], 14, 10), glass, x, 0.32 + q[1], z, { noCast: true });
    });
    var bz = BRONZE(), by = 0.32 + 1.55, br = rAt(1.55) + 0.25;
    b.add(new T3.TorusGeometry(br, 0.03, 6, 40), bz, CX - 0.15, by, CZ - 0.15, { rx: PI / 2 });
    for (var k = 0; k < 12; k++) { var p = onRing(br, k / 12 * 2 * PI); b.cyl(0.012, 0.012, 0.22, 4, bz, CX - 0.15 + p[0], by - 0.2, CZ - 0.15 + p[1]); }
    b.add(new T3.CylinderGeometry(br, br - 0.1, 0.05, 32), M("pearl", 2, 0.2), CX - 0.15, by - 0.22, CZ - 0.15);
    var tel = new T3.Group(); tel.position.set(CX - 0.15 + br * 0.7, by, CZ - 0.15 - br * 0.7); b.g.add(tel);
    b.add(new T3.CylinderGeometry(0.05, 0.08, 0.7, 10), bz, 0, 0.3, 0, { parent: tel, rz: -0.7, rx: 0.3 });
    b.fx.push(function (t) { tel.rotation.y = Math.sin(t * 0.3) * 0.6; });
    [[-2.0, 0.35], [0.4, -2.05]].forEach(function (q) { conch(b, q[0], q[1], 1.6, 0.42, 0.0, 4); });
    var ws = new T3.Shape();
    ws.moveTo(0, 0); ws.lineTo(0.9, 0); ws.quadraticCurveTo(1.0, 0.9, 0.55, 1.15); ws.quadraticCurveTo(0.15, 1.3, 0.05, 0.95); ws.quadraticCurveTo(0.3, 1.0, 0.45, 0.85); ws.quadraticCurveTo(0.6, 0.6, 0.35, 0.2); ws.closePath();
    var waveM = new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#1a6ab0"), emissiveIntensity: 0.5, transparent: true, opacity: 0.85, roughness: 0.1, side: T3.DoubleSide });
    [[0.9, -1.35, -0.9], [-1.35, 0.9, PI + 0.9]].forEach(function (q) {
      var wv = b.add(new T3.ExtrudeGeometry(ws, { depth: 0.18, bevelEnabled: false }), waveM, CX + q[0], 0.32, CZ + q[1], { ry: q[2] });
    });
    var drops = [], dm = new T3.SpriteMaterial({ map: tex("drop"), transparent: true, depthWrite: false });
    for (var d = 0; d < 16; d++) { var s = new T3.Sprite(dm); s.scale.set(0.06, 0.06, 1); b.g.add(s); drops.push([s, d / 16]); }
    var sx = CX - 0.15 + Math.cos(0.9) * rAt(2.2), sz = CZ - 0.15 + Math.sin(0.9) * rAt(2.2), sy = 0.32 + 2.2;
    b.fx.push(function (t) {
      wt.offset.set(t * 0.04, t * 0.02); mg.emissiveIntensity = 0.8 + Math.sin(t * 1.5) * 0.2;
      drops.forEach(function (q) { var k = (t * 0.55 + q[1]) % 1; q[0].position.set(sx + (CX + 0.95 - sx) * k, sy + 0.4 * k - (sy + 0.1) * k * k, sz + (CZ + 0.95 - sz) * k); });
    });
    b.box(1.1, 0.07, 1.2, M("plankWarm", 1, 2), CX, -0.02, 2.42);
    b.banner(CX - 1.75, CZ + 1.75, 0.0, "bannerWater", 1.6);
    var coral = C("#e8826e", { flatShading: true });
    [[CX + 0.75, CZ + 1.15], [CX + 1.2, CZ + 0.8]].forEach(function (q) { b.beam([q[0], 0.3, q[1]], [q[0] + 0.05, 0.6, q[1] - 0.05], 0.025, coral); b.beam([q[0] + 0.03, 0.45, q[1]], [q[0] + 0.15, 0.62, q[1] + 0.05], 0.02, coral); });
  }

  /* -------- Gryffindor: Forged and Volcanic -------- */
  function frustum(b, x, y0, z, r0, r1, h, mat) { return b.add(new T3.CylinderGeometry(r1, r0, h, 4, 1), mat, x, y0 + h / 2, z, { ry: PI / 4 }); }
  function newFire(b) {
    b.base(M("grassFire", 3, 3, { color: lin("#b8a888") }), M("sideFire", 3, 1));
    var bas = M("basalt", 3, 1), basT = M("basalt", 3, 3), gold = REDGOLD(), iron = M("iron"), magma = glowMat("#ffb060", "#ff4a10", 1.6);
    frustum(b, 0, 0, 0, 3.2, 3.0, 0.3, bas); frustum(b, 0, 0.3, 0, 2.65, 2.45, 0.28, bas);
    [[2.12, 0.3], [1.73, 0.58]].forEach(function (q, i) { [-1, 1].forEach(function (s) { b.box(q[0] * 1.414 * 0.95, 0.025, 0.04, magma, 0, q[1] + 0.01, s * q[0] * 0.69, { noCast: true }); b.box(0.04, 0.025, q[0] * 1.414 * 0.95, magma, s * q[0] * 0.69, q[1] + 0.01, 0, { noCast: true }); }); });
    var Y = 0.58, tiers = [[1.6, 1.3, 1.2], [1.12, 0.86, 1.0], [0.72, 0.5, 0.85]];
    tiers.forEach(function (t, i) {
      frustum(b, 0, Y, 0, t[0], t[1], t[2], bas);
      frustum(b, 0, Y + t[2] - 0.08, 0, t[1] + 0.06, t[1] + 0.02, 0.1, gold);
      var half = t[1] * 0.707 + 0.02;
      [-1, 1].forEach(function (s) {
        for (var k = -2; k <= 2; k++) { b.add(new T3.ConeGeometry(0.045, 0.22, 4), iron, k * half * 0.4, Y + t[2] + 0.11, s * half, {}); b.add(new T3.ConeGeometry(0.045, 0.22, 4), iron, s * half, Y + t[2] + 0.11, k * half * 0.4, {}); }
      });
      var fh = t[0] * 0.707;
      [[0.35, 0.6], [-0.4, 0.45]].forEach(function (c, j) { if (i === 2 && j) return; b.box(0.04, t[2] * c[1], 0.02, magma, c[0] * fh, Y + t[2] * 0.3, fh * 0.95 - (t[0] - t[1]) * 0.35, { rz: 0.25 - j * 0.5, noCast: true }); b.box(0.02, t[2] * c[1], 0.04, magma, fh * 0.95 - (t[0] - t[1]) * 0.35, Y + t[2] * 0.3, c[0] * fh, { rx: 0.25 - j * 0.5, noCast: true }); });
      Y += t[2];
    });
    var crownY = Y;
    for (var c = 0; c < 8; c++) { var p = onRing(0.38, c / 8 * 2 * PI); b.add(new T3.ConeGeometry(0.06, 0.45, 4), gold, p[0], crownY + 0.22, p[1], { rz: p[0] * -0.5, rx: p[1] * 0.5 }); }
    b.cyl(0.32, 0.22, 0.2, 10, iron, 0, crownY, 0);
    b.cyl(0.3, 0.3, 0.02, 10, magma, 0, crownY + 0.2, 0, { noCast: true });
    flameAt(b, 0, crownY + 0.21, 0, 1.15, 2.2);
    var gate = new T3.Group(); gate.position.set(0, 0.58, 1.6 * 0.707 - 0.05); b.g.add(gate);
    var ash = new T3.Shape(); ash.moveTo(-0.32, 0); ash.lineTo(-0.32, 0.45); ash.lineTo(0, 0.78); ash.lineTo(0.32, 0.45); ash.lineTo(0.32, 0); ash.closePath();
    var gg = new T3.MeshBasicMaterial({ color: lin("#ff8a3d"), transparent: true, opacity: 0.7 });
    b.add(new T3.ShapeGeometry(ash), C("#120808"), 0, 0, 0.12, { parent: gate, noCast: true });
    b.add(new T3.ShapeGeometry(ash), gg, 0, 0.04, 0.13, { parent: gate, noCast: true, s: [0.8, 0.85, 1] });
    var head = new T3.Group(); head.position.set(0, 1.05, 0.2); gate.add(head);
    b.add(new T3.SphereGeometry(0.2, 12, 9), gold, 0, 0, 0, { parent: head, s: [1, 1, 0.8] });
    b.add(new T3.SphereGeometry(0.1, 10, 8), gold, 0, -0.07, 0.15, { parent: head });
    [-1, 1].forEach(function (s) { b.add(new T3.SphereGeometry(0.03, 8, 6), glowMat("#fff2a0", "#ffb020", 2.4), s * 0.08, 0.04, 0.16, { parent: head, noCast: true }); });
    var maneFl = [];
    for (var i = 0; i < 14; i++) {
      var a = i / 14 * 2 * PI, mm = new T3.MeshBasicMaterial({ color: lin(["#ff4a10", "#ff7a1a", "#ffb030"][i % 3]), transparent: true, opacity: 0.8, blending: T3.AdditiveBlending, depthWrite: false });
      var m = b.add(new T3.ConeGeometry(0.06, 0.3, 6), mm, Math.cos(a) * 0.24, Math.sin(a) * 0.24, -0.08, { parent: head, noCast: true, noReceive: true });
      m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), new T3.Vector3(Math.cos(a), Math.sin(a), -0.4).normalize());
      m.position.add(new T3.Vector3(Math.cos(a), Math.sin(a), -0.4).normalize().multiplyScalar(0.15)); maneFl.push([m, i]);
    }
    var gl = new T3.PointLight("#ff8a3d", 1.2, 3.5, 2); gl.position.set(0, 0.5, 0.7); gate.add(gl);
    b.fx.push(function (t) { maneFl.forEach(function (q) { q[0].scale.set(1, 1 + Math.sin(t * 11 + q[1] * 1.7) * 0.25, 1); }); gg.opacity = 0.6 + Math.sin(t * 5) * 0.12; magma.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.4; });
    [[-1.55, -1.55], [1.55, -1.55], [-1.85, 0.4]].forEach(function (q, i) {
      var h = 2.2 - i * 0.3;
      frustum(b, q[0], 0.58, q[1], 0.32, 0.2, h, bas);
      b.cyl(0.16, 0.16, 0.06, 8, magma, q[0], 0.58 + h, q[1], { noCast: true });
      flameAt(b, q[0], 0.62 + h, q[1], 0.45, 0.4);
      smokeAt(b, q[0], 1.0 + h, q[1], 4);
      b.add(new T3.ConeGeometry(0.05, 0.25, 4), iron, q[0], 0.58 + h + 0.1, q[1] + 0.18, { rx: 0.4 });
    });
    [[-1.0, 1.45], [1.0, 1.45]].forEach(function (p) {
      var pv = new T3.Group(); pv.position.set(p[0], 1.62, p[1] - 0.12); b.g.add(pv);
      var bm = new T3.MeshStandardMaterial({ map: tex("bannerFire"), transparent: true, alphaTest: 0.5, side: T3.DoubleSide, roughness: 0.9 });
      b.add(new T3.PlaneGeometry(0.42, 0.9), bm, 0, -0.45, 0, { parent: pv });
      b.add(new T3.BoxGeometry(0.5, 0.04, 0.04), gold, 0, 0, 0, { parent: pv });
    });
    [[-2.6, 2.6], [2.6, 2.6]].forEach(function (p) { b.cyl(0.14, 0.18, 0.25, 4, bas, p[0], 0, p[1]); b.cyl(0.2, 0.1, 0.13, 4, iron, p[0], 0.25, p[1]); b.fire(p[0], 0.38, p[1], 0.45, 0.45); });
  }

  var NEW = { air: newAir, water: newWater, fire: newFire };
