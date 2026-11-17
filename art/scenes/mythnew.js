
  /* ================= MYTHIC AGE Town Centers, grand versions in the new languages ================= */
  function hexPlinth(b, r, h, y0, rot) {
    var hc = M("honeycomb", r * 1.5, r * 1.5), hcS = M("honeycomb", r * 3, 0.4);
    b.add(new T3.CylinderGeometry(r, r + 0.06, h, 6), [hcS, hc, hc], 0, y0 + h / 2, 0, { ry: PI / 6 + (rot || 0) });
    b.add(new T3.CylinderGeometry(r + 0.02, r + 0.02, 0.04, 6, 1, true), C("#2a2622"), 0, y0 + h - 0.01, 0, { ry: PI / 6 + (rot || 0) });
  }
  function kite(b, ax, ay, az, i, h) {
    var k = new T3.Group(); b.g.add(k);
    var ks = new T3.Shape(); ks.moveTo(0, 0.3); ks.lineTo(0.2, 0); ks.lineTo(0, -0.42); ks.lineTo(-0.2, 0); ks.closePath();
    b.add(new T3.ShapeGeometry(ks), M("canvasBY", 0.6, 0.6, { side: T3.DoubleSide }), 0, 0, 0, { parent: k });
    var tail = new T3.Group(); tail.position.y = -0.42; k.add(tail);
    for (var t = 0; t < 3; t++) b.add(new T3.PlaneGeometry(0.1, 0.06), C(t % 2 ? "#f0c63e" : "#2a2622", { side: T3.DoubleSide }), 0, -0.15 - t * 0.17, 0, { parent: tail, rz: t % 2 ? 0.5 : -0.5, noCast: true });
    var str = b.add(new T3.CylinderGeometry(0.006, 0.006, 1, 4), C("#e8dcc0"), 0, 0, 0, { noCast: true });
    var base = new T3.Vector3(ax, ay, az);
    b.fx.push(function (t) {
      var kp = new T3.Vector3(ax * 0.5 + Math.sin(t * 0.7 + i * 2) * 0.35, h + Math.sin(t * 1.1 + i) * 0.15, az * 0.5 + Math.cos(t * 0.6 + i) * 0.3);
      k.position.copy(kp); k.rotation.set(0, PI / 4, Math.sin(t * 1.5 + i) * 0.3); tail.rotation.z = Math.sin(t * 3 + i) * 0.3;
      var d = kp.clone().sub(base); str.position.copy(base).add(d.clone().multiplyScalar(0.5)); str.scale.set(1, d.length(), 1); str.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), d.normalize());
    });
  }
  function gAir(b) {
    b.base(M("grassAir", 3, 3), M("sideAir", 3, 1));
    var dark = C("#2a2622"), amber = glowMat("#ffd27a", "#ffa420", 1.2), bw = M("plankDark", 0.3, 2);
    hexPlinth(b, 2.55, 0.16, 0); hexPlinth(b, 2.1, 0.16, 0.16); hexPlinth(b, 1.75, 0.14, 0.32);
    for (var s = 0; s < 3; s++) b.box(0.9, 0.16 * (s + 1) - 0.02, 0.24, M("honeycomb", 0.9, 0.3), 1.55 * 0.707 + (2 - s) * 0.17 + 0.18, 0, 1.55 * 0.707 + (2 - s) * 0.17 + 0.18, { ry: PI / 4 });
    var Y = 0.46, H = 2.65, R = 1.42;
    skep(b, 0, 0, R, H, Y);
    function rOn(y) { var t = (y - Y) / H; return R * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.5); }
    [0.5, 1.35, 2.0].forEach(function (yy, i) { var y = Y + yy; b.add(new T3.TorusGeometry(rOn(y) + 0.02, i === 1 ? 0.045 : 0.03, 6, 40), i === 1 ? glowMat("#ffd060", "#c88a10", 0.5) : dark, 0, y, 0, { rx: PI / 2 }); });
    [[0.95, 8, 0.12], [1.7, 6, 0.1]].forEach(function (row, ri) {
      for (var k = 0; k < row[1]; k++) {
        var a = PI / 4 + (k - (row[1] - 1) / 2) * (ri ? 0.55 : 0.42); if (Math.abs(a - PI / 4) < 0.2 && ri === 0) continue;
        var y = Y + row[0], r = rOn(y) + 0.02, x = Math.cos(a) * r, z = Math.sin(a) * r;
        var m = b.add(new T3.CircleGeometry(row[2], 6), amber, x, y, z, { noCast: true }); m.lookAt(x * 4, y + 0.4, z * 4);
        var f = b.add(new T3.RingGeometry(row[2], row[2] + 0.04, 6), dark, x * 1.003, y, z * 1.003, { noCast: true }); f.lookAt(x * 4, y + 0.4, z * 4);
      }
    });
    var dg = new T3.Group(); dg.position.set(Math.cos(PI / 4) * (R - 0.05), Y, Math.sin(PI / 4) * (R - 0.05)); dg.rotation.y = PI / 4; b.g.add(dg);
    var ash = new T3.Shape(); ash.moveTo(-0.38, 0); ash.lineTo(-0.38, 0.55); ash.absarc(0, 0.55, 0.38, PI, 0, true); ash.lineTo(0.38, 0); ash.closePath();
    b.add(new T3.ShapeGeometry(ash), glowMat("#3a2008", "#ff9a20", 0.6), 0, 0, 0.12, { parent: dg, noCast: true });
    b.add(new T3.TorusGeometry(0.43, 0.06, 6, 6, PI), dark, 0, 0.55, 0.13, { parent: dg });
    [-1, 1].forEach(function (sg) { b.add(new T3.CylinderGeometry(0.06, 0.06, 0.55, 6), dark, sg * 0.43, 0.275, 0.13, { parent: dg }); });
    b.add(new T3.BoxGeometry(1.2, 0.04, 0.55), M("canvasBY", 1.2, 0.6), 0, 1.15, 0.35, { parent: dg, rx: 0.45 });
    var cup = new T3.Group(); cup.position.y = Y + H - 0.12; b.g.add(cup);
    var keep = b.g; b.g = cup; skep(b, 0, 0, 0.42, 0.7, 0); b.g = keep;
    for (var c = 0; c < 6; c++) { var p = onRing(0.43, c * PI / 3); b.add(new T3.CircleGeometry(0.06, 6), amber, p[0], 0.22, p[1], { parent: cup, noCast: true }).lookAt(p[0] * 5, cup.position.y + 0.3, p[1] * 5); }
    var crown = new T3.Group(); b.g.add(crown);
    b.add(new T3.CylinderGeometry(0.2, 0.2, 0.46, 6), amber, 0, 0, 0, { parent: crown, noCast: true });
    b.add(new T3.ConeGeometry(0.2, 0.26, 6), amber, 0, 0.36, 0, { parent: crown, noCast: true });
    b.add(new T3.ConeGeometry(0.2, 0.26, 6), amber, 0, -0.36, 0, { parent: crown, rx: PI, noCast: true });
    var ring = b.add(new T3.TorusGeometry(0.42, 0.02, 6, 6), dark, 0, 0, 0, { parent: crown, rx: PI / 2 });
    var L = new T3.PointLight("#ffb030", 1.4, 5, 2); crown.add(L);
    var CY = Y + H + 0.95;
    b.fx.push(function (t) { crown.position.set(0, CY + Math.sin(t * 1.3) * 0.08, 0); crown.rotation.y = t * 0.6; ring.rotation.z = t; });
    [[-1.75, -0.5], [-0.5, -1.75], [1.55, -1.25], [-1.25, 1.55]].forEach(function (q, i) {
      b.add(new T3.CylinderGeometry(0.6, 0.62, 0.12, 6), [M("honeycomb", 2, 0.2), M("honeycomb", 1, 1), M("honeycomb", 1, 1)], q[0], 0.52, q[1], { ry: PI / 6 });
      skep(b, q[0], q[1], 0.5, 0.95, 0.58);
      b.add(new T3.CircleGeometry(0.11, 6), C("#140c04"), q[0] + Math.cos(PI / 4) * 0.48, 0.74, q[1] + Math.sin(PI / 4) * 0.48, { ry: PI / 4, noCast: true });
      b.cyl(0.015, 0.015, 0.3, 5, dark, q[0], 1.5, q[1]);
      var rose = new T3.Group(); rose.position.set(q[0] + 0.02, 1.82, q[1] + 0.02); rose.rotation.y = PI / 4; b.g.add(rose);
      var sp = new T3.Group(); rose.add(sp);
      for (var bl = 0; bl < 6; bl++) { var g = new T3.Group(); g.rotation.z = bl * PI / 3; sp.add(g); b.add(new T3.PlaneGeometry(0.07, 0.22), M("canvasBY", 0.3, 0.6, { side: T3.DoubleSide }), 0, 0.13, 0.02, { parent: g, ry: 0.4 }); }
      (function (spn, k) { b.fx.push(function (t, dt) { spn.rotation.z -= dt * (2 + k * 0.3); }); })(sp, i);
    });
    var sail = M("canvasBY", 1, 1, { side: T3.DoubleSide });
    [[-2.45, 1.05, 3.6], [1.05, -2.45, 3.6], [-2.2, -2.2, 3.9]].forEach(function (m, i) {
      var top = [m[0] * 0.9, m[2], m[1] * 0.9];
      b.beam([m[0], 0, m[1]], top, 0.055, bw);
      b.beam([top[0], top[1] - 0.9, top[2]], [top[0] * 0.55, Y + 1.0, top[2] * 0.55], 0.01, C("#e8dcc0"));
      var sh = new T3.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.65, -0.7, 0.18, -2.1); sh.lineTo(-0.05, -2.1); sh.closePath();
      var pv = new T3.Group(); pv.position.set(top[0], top[1] - 0.1, top[2]); pv.rotation.y = PI / 4 + (i === 2 ? 0 : (i ? 0.5 : -0.5)); b.g.add(pv);
      var s1 = b.add(new T3.ShapeGeometry(sh), sail, 0, 0, 0, { parent: pv });
      b.fx.push(function (t) { s1.scale.x = 1 + Math.sin(t * 1.5 + i) * 0.2; });
      dPennant(b, top[0], top[1] + 0.02, top[2], i % 2 ? "#2a2622" : "#f0c63e");
      kite(b, top[0], top[1], top[2], i, 4.9 + i * 0.3);
    });
    var lan = [];
    [[1.9, 0.6, 1.6], [0.6, 1.9, 1.9], [-0.9, 2.1, 2.3]].forEach(function (q, i) {
      var l = b.add(new T3.CylinderGeometry(0.09, 0.09, 0.2, 6), amber, q[0], q[2], q[1], { noCast: true });
      lan.push([l, q[2], i]);
    });
    b.fx.push(function (t) { lan.forEach(function (q) { q[0].position.y = q[1] + Math.sin(t * 1.2 + q[2] * 2) * 0.1; q[0].rotation.y = t + q[2]; }); });
    var jar = new T3.MeshStandardMaterial({ color: lin("#f2a72e"), emissive: lin("#c06a10"), emissiveIntensity: 0.5, roughness: 0.25 });
    [[2.4, 2.0], [2.6, 1.8], [2.55, 2.2]].forEach(function (q) { b.cyl(0.1, 0.1, 0.22, 6, jar, q[0], 0, q[1]); b.cyl(0.07, 0.07, 0.04, 6, dark, q[0], 0.22, q[1]); });
    b.banner(0.45, 2.55, 0, "bannerAir", 1.9); b.banner(2.55, 0.45, 0, "bannerAir", 1.9);
  }

  function gWater(b) {
    var grass = M("grassWater", 2.5, 2.5), side = M("sideWater", 2.5, 1), bottom = C("#21180f");
    b.add(new T3.BoxGeometry(4.9, 0.7, 4.9), [side, side, grass, bottom, side, side], -0.55, -0.35, -0.55);
    b.add(new T3.BoxGeometry(6, 0.35, 1.1), M("dirt", 2, 1), 0, -0.525, 2.45);
    b.add(new T3.BoxGeometry(1.1, 0.35, 4.9), M("dirt", 2, 1), 2.45, -0.525, -0.55);
    var wtex = tex("water", 2, 1), wtex2 = tex("water", 1, 2);
    b.add(new T3.BoxGeometry(6, 0.27, 1.1), new T3.MeshStandardMaterial({ map: wtex, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 0, -0.215, 2.45, { noCast: true });
    b.add(new T3.BoxGeometry(1.1, 0.27, 4.9), new T3.MeshStandardMaterial({ map: wtex2, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 2.45, -0.215, -0.55, { noCast: true });
    b.fx.push(function (t) { wtex.offset.set(t * 0.03, 0); wtex2.offset.set(0, -t * 0.03); });
    var CX = -0.6, CZ = -0.6, bl = M("stoneBlue", 4, 0.4), blT = M("stoneBlue", 3, 3), pl = M("pearl", 4, 0.3, { color: lin("#f0e2da") });
    b.add(new T3.CylinderGeometry(2.15, 2.25, 0.25, 48), [bl, blT, blT], CX, 0.125, CZ);
    b.add(new T3.CylinderGeometry(1.75, 1.8, 0.25, 48), [pl, M("pearl", 3, 3), M("pearl", 3, 3)], CX, 0.375, CZ);
    for (var s = 0; s < 3; s++) b.box(1.1, 0.5 - s * 0.16, 0.2, M("pearl", 1, 0.3), CX + (1.9 + s * 0.2) * 0.707, 0, CZ + (1.9 + s * 0.2) * 0.707, { ry: PI / 4 });
    var Y = 0.5, cx = CX - 0.2, cz = CZ - 0.2;
    var rAt = conch(b, cx, cz, 4.2, 1.3, Y, 6);
    var mouth = new T3.Group(); mouth.position.set(cx + 0.88, Y, cz + 0.88); mouth.rotation.y = PI / 4; b.g.add(mouth);
    b.add(new T3.TorusGeometry(0.62, 0.16, 10, 30, PI * 1.25), M("pearl", 2, 0.5, { color: lin("#f6dcd4") }), 0, 0.6, 0.06, { parent: mouth, rz: -PI * 0.125 });
    var mg = glowMat("#9fdcff", "#2a9ae8", 0.9);
    b.add(new T3.CircleGeometry(0.55, 30), mg, 0, 0.6, 0.0, { parent: mouth, noCast: true });
    var glass = new T3.MeshStandardMaterial({ color: lin("#8fd8ff"), emissive: lin("#2a9ae8"), emissiveIntensity: 0.85, transparent: true, opacity: 0.85, roughness: 0.05 });
    [[-0.5, 1.3, 0.2], [1.6, 1.4, 0.18], [0.5, 2.1, 0.15], [-0.15, 2.7, 0.12], [2.3, 1.05, 0.16], [1.1, 2.9, 0.1], [-1.2, 1.7, 0.16]].forEach(function (q) { var r = rAt(q[1]) + 0.01; b.add(new T3.SphereGeometry(q[2], 14, 10), glass, cx + Math.cos(q[0]) * r, Y + q[1], cz + Math.sin(q[0]) * r, { noCast: true }); });
    var bz = BRONZE(), by = Y + 1.75, br = rAt(1.75) + 0.3;
    b.add(new T3.CylinderGeometry(br, br - 0.12, 0.06, 36), M("pearl", 2, 0.2), cx, by - 0.03, cz);
    b.add(new T3.TorusGeometry(br, 0.03, 6, 44), bz, cx, by + 0.22, cz, { rx: PI / 2 });
    for (var k = 0; k < 14; k++) { var p = onRing(br, k / 14 * 2 * PI); b.cyl(0.012, 0.012, 0.22, 4, bz, cx + p[0], by, cz + p[1]); }
    var tel = new T3.Group(); tel.position.set(cx + br * 0.7, by, cz - br * 0.7); b.g.add(tel);
    b.add(new T3.CylinderGeometry(0.05, 0.09, 0.8, 10), bz, 0, 0.35, 0, { parent: tel, rz: -0.7, rx: 0.3 });
    b.fx.push(function (t) { tel.rotation.y = Math.sin(t * 0.3) * 0.6; });
    var crown = new T3.Group(); crown.position.set(cx, Y + 4.05, cz); b.g.add(crown);
    b.add(new T3.TorusGeometry(0.3, 0.025, 6, 30), bz, 0, 0, 0, { parent: crown, rx: PI / 2 });
    b.add(new T3.SphereGeometry(0.1, 14, 10), glowMat("#e8f8ff", "#58c8ff", 2), 0, 0.2, 0, { parent: crown, noCast: true });
    b.fx.push(function (t) { crown.rotation.y = t * 0.5; });
    var spires = [[CX - 1.55, CZ + 0.75], [CX + 0.75, CZ - 1.55]];
    spires.forEach(function (q) { conch(b, q[0], q[1], 2.4, 0.5, Y - 0.12, 4.5); b.add(new T3.SphereGeometry(0.07, 10, 8), glowMat("#e8f8ff", "#58c8ff", 1.8), q[0], Y + 2.35, q[1], { noCast: true }); });
    var ws = new T3.Shape();
    ws.moveTo(0, 0); ws.lineTo(0.9, 0); ws.quadraticCurveTo(1.0, 0.9, 0.55, 1.15); ws.quadraticCurveTo(0.15, 1.3, 0.05, 0.95); ws.quadraticCurveTo(0.3, 1.0, 0.45, 0.85); ws.quadraticCurveTo(0.6, 0.6, 0.35, 0.2); ws.closePath();
    var waveM = new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#1a6ab0"), emissiveIntensity: 0.5, transparent: true, opacity: 0.85, roughness: 0.1, side: T3.DoubleSide });
    [[0.75, -0.55, -0.9 + PI], [-0.55, 0.75, 0.9 + PI / 2]].forEach(function (q) { b.add(new T3.ExtrudeGeometry(ws, { depth: 0.16, bevelEnabled: false }), waveM, CX + 1.25 + q[0] * 0.35, Y - 0.1, CZ + 1.25 + q[1] * 0.35, { ry: q[2], s: [1.1, 1.1, 1] }); });
    var arcs = [];
    spires.forEach(function (q, i) {
      var dm = new T3.SpriteMaterial({ map: tex("drop"), transparent: true, depthWrite: false });
      for (var d = 0; d < 14; d++) { var sp = new T3.Sprite(dm); sp.scale.set(0.06, 0.06, 1); b.g.add(sp); arcs.push([sp, d / 14, q, i]); }
    });
    b.fx.push(function (t) {
      mg.emissiveIntensity = 0.8 + Math.sin(t * 1.5) * 0.25;
      arcs.forEach(function (a) { var k = (t * 0.45 + a[1]) % 1, sx = a[2][0], sz = a[2][1], ex = cx, ez = cz; a[0].position.set(sx + (ex - sx) * k, Y + 1.8 + 1.0 * Math.sin(k * PI), sz + (ez - sz) * k); });
    });
    var coral = C("#e8826e", { flatShading: true });
    [[CX + 1.6, CZ - 0.2], [CX - 0.2, CZ + 1.6]].forEach(function (q) { b.beam([q[0], 0.5, q[1]], [q[0] + 0.05, 0.85, q[1] - 0.05], 0.03, coral); b.beam([q[0] + 0.03, 0.65, q[1]], [q[0] + 0.18, 0.88, q[1] + 0.05], 0.025, coral); });
    b.box(1.1, 0.07, 1.2, M("drift", 1, 2), CX + 0.6, -0.02, 2.42);
    [[CX + 0.15, 1.8], [CX + 1.05, 1.8]].forEach(function (lp) { b.cyl(0.035, 0.05, 0.9, 8, bz, lp[0], 0, lp[1]); b.add(new T3.SphereGeometry(0.08, 12, 10), glowMat("#e8f8ff", "#58c8ff", 1.6), lp[0], 0.98, lp[1], { noCast: true }); });
    b.banner(CX - 2.0, CZ + 2.0, 0, "bannerWater", 1.8);
  }

  function lionStatue(b, x, z, y0, ry, s) {
    var g = new T3.Group(); g.position.set(x, y0, z); g.rotation.y = ry; g.scale.setScalar(s); b.g.add(g);
    var gold = REDGOLD();
    b.add(new T3.BoxGeometry(0.5, 0.25, 0.7), M("basalt", 0.5, 0.3), 0, 0.125, 0, { parent: g });
    b.add(new T3.SphereGeometry(0.2, 10, 8), gold, 0, 0.45, -0.1, { parent: g, s: [0.9, 0.9, 1.4] });
    b.add(new T3.SphereGeometry(0.17, 10, 8), gold, 0, 0.55, 0.18, { parent: g });
    [-0.12, 0.12].forEach(function (lx) { b.add(new T3.CylinderGeometry(0.05, 0.05, 0.3, 6), gold, lx, 0.38, 0.22, { parent: g }); });
    var head = new T3.Group(); head.position.set(0, 0.78, 0.25); g.add(head);
    b.add(new T3.SphereGeometry(0.13, 10, 8), gold, 0, 0, 0, { parent: head });
    b.add(new T3.SphereGeometry(0.06, 8, 6), gold, 0, -0.04, 0.11, { parent: head });
    var fl = [];
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * 2 * PI, mm = new T3.MeshBasicMaterial({ color: lin(["#ff4a10", "#ff7a1a", "#ffb030"][i % 3]), transparent: true, opacity: 0.8, blending: T3.AdditiveBlending, depthWrite: false });
      var m = b.add(new T3.ConeGeometry(0.045, 0.22, 6), mm, 0, 0, 0, { parent: head, noCast: true, noReceive: true });
      var dir = new T3.Vector3(Math.cos(a), Math.sin(a), -0.45).normalize();
      m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), dir); m.position.copy(dir.multiplyScalar(0.2)); fl.push([m, i]);
    }
    b.fx.push(function (t) { fl.forEach(function (q) { q[0].scale.set(1, 1 + Math.sin(t * 11 + q[1] * 1.7) * 0.25, 1); }); });
  }
  function gFire(b) {
    b.base(M("grassFire", 3, 3, { color: lin("#b8a888") }), M("sideFire", 3, 1));
    var bas = M("basalt", 3, 1), gold = REDGOLD(), iron = M("iron"), magma = glowMat("#ffb060", "#ff4a10", 1.6);
    frustum(b, 0, 0, 0, 3.4, 3.2, 0.28, bas); frustum(b, 0, 0.28, 0, 2.9, 2.7, 0.28, bas);
    [[3.25, 0.28], [2.75, 0.56]].forEach(function (q) { var h = q[0] * 0.707 * 0.97; [-1, 1].forEach(function (s) { b.box(h * 2, 0.025, 0.045, magma, 0, q[1] + 0.005, s * h, { noCast: true }); b.box(0.045, 0.025, h * 2, magma, s * h, q[1] + 0.005, 0, { noCast: true }); }); });
    for (var s2 = 0; s2 < 4; s2++) b.box(1.0, 0.56 - s2 * 0.14, 0.22, M("basalt", 1, 0.3), 0, 0, 1.95 + s2 * 0.22);
    var Y = 0.56, tiers = [[1.75, 1.42, 1.25], [1.22, 0.95, 1.05], [0.8, 0.56, 0.9]];
    tiers.forEach(function (t, i) {
      frustum(b, 0, Y, 0, t[0], t[1], t[2], bas);
      frustum(b, 0, Y + t[2] - 0.08, 0, t[1] + 0.07, t[1] + 0.03, 0.1, gold);
      var half = t[1] * 0.707 + 0.02;
      [-1, 1].forEach(function (sg) { for (var k = -3; k <= 3; k++) { b.add(new T3.ConeGeometry(0.045, 0.24, 4), iron, k * half * 0.28, Y + t[2] + 0.12, sg * half); b.add(new T3.ConeGeometry(0.045, 0.24, 4), iron, sg * half, Y + t[2] + 0.12, k * half * 0.28); } });
      var fh = t[0] * 0.707;
      [[0.3, 0.7], [-0.45, 0.5], [0.6, 0.45]].forEach(function (c, j) { if (i === 2 && j) return; var inset = (t[0] - t[1]) * 0.35; b.box(0.045, t[2] * c[1], 0.02, magma, c[0] * fh, Y + t[2] * 0.3, fh * 0.97 - inset, { rz: 0.25 - j * 0.4, noCast: true }); b.box(0.02, t[2] * c[1], 0.045, magma, fh * 0.97 - inset, Y + t[2] * 0.3, c[0] * fh, { rx: 0.25 - j * 0.4, noCast: true }); });
      Y += t[2];
    });
    for (var c = 0; c < 10; c++) { var p = onRing(0.42, c / 10 * 2 * PI); b.add(new T3.ConeGeometry(0.06, 0.55, 4), gold, p[0], Y + 0.27, p[1], { rz: p[0] * -0.55, rx: p[1] * 0.55 }); }
    b.cyl(0.36, 0.24, 0.22, 10, iron, 0, Y, 0);
    b.cyl(0.34, 0.34, 0.02, 10, magma, 0, Y + 0.22, 0, { noCast: true });
    flameAt(b, 0, Y + 0.23, 0, 1.35, 2.4);
    var gate = new T3.Group(); gate.position.set(0, 0.56, 1.75 * 0.707 - 0.06); b.g.add(gate);
    var ash = new T3.Shape(); ash.moveTo(-0.36, 0); ash.lineTo(-0.36, 0.5); ash.lineTo(0, 0.88); ash.lineTo(0.36, 0.5); ash.lineTo(0.36, 0); ash.closePath();
    var gg = new T3.MeshBasicMaterial({ color: lin("#ff8a3d"), transparent: true, opacity: 0.7 });
    b.add(new T3.ShapeGeometry(ash), C("#120808"), 0, 0, 0.14, { parent: gate, noCast: true });
    b.add(new T3.ShapeGeometry(ash), gg, 0, 0.04, 0.15, { parent: gate, noCast: true, s: [0.8, 0.85, 1] });
    var head = new T3.Group(); head.position.set(0, 1.15, 0.22); gate.add(head);
    b.add(new T3.SphereGeometry(0.22, 12, 9), gold, 0, 0, 0, { parent: head, s: [1, 1, 0.8] });
    b.add(new T3.SphereGeometry(0.11, 10, 8), gold, 0, -0.07, 0.16, { parent: head });
    [-1, 1].forEach(function (sg) { b.add(new T3.SphereGeometry(0.035, 8, 6), glowMat("#fff2a0", "#ffb020", 2.4), sg * 0.09, 0.04, 0.17, { parent: head, noCast: true }); });
    var maneFl = [];
    for (var i = 0; i < 16; i++) {
      var a = i / 16 * 2 * PI, mm = new T3.MeshBasicMaterial({ color: lin(["#ff4a10", "#ff7a1a", "#ffb030"][i % 3]), transparent: true, opacity: 0.8, blending: T3.AdditiveBlending, depthWrite: false });
      var m = b.add(new T3.ConeGeometry(0.07, 0.34, 6), mm, 0, 0, 0, { parent: head, noCast: true, noReceive: true });
      var dir = new T3.Vector3(Math.cos(a), Math.sin(a), -0.4).normalize();
      m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), dir); m.position.copy(dir.clone().multiplyScalar(0.28)); maneFl.push([m, i]);
    }
    var gl = new T3.PointLight("#ff8a3d", 1.3, 4, 2); gl.position.set(0, 0.5, 0.8); gate.add(gl);
    b.fx.push(function (t) { maneFl.forEach(function (q) { q[0].scale.set(1, 1 + Math.sin(t * 11 + q[1] * 1.7) * 0.25, 1); }); gg.opacity = 0.6 + Math.sin(t * 5) * 0.12; magma.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.4; });
    lionStatue(b, -0.85, 2.1, 0.28, 0, 0.9); lionStatue(b, 0.85, 2.1, 0.28, 0, 0.9);
    [[-2.05, -2.05], [2.05, -2.05], [-2.05, 2.05], [2.05, 2.05]].forEach(function (q, i) {
      var h = i < 2 ? 2.6 : 1.7;
      frustum(b, q[0], 0.28, q[1], 0.36, 0.22, h, bas);
      frustum(b, q[0], 0.28 + h * 0.6, q[1], 0.33, 0.31, 0.05, gold);
      b.cyl(0.17, 0.17, 0.06, 4, magma, q[0], 0.28 + h, q[1], { ry: PI / 4, noCast: true });
      flameAt(b, q[0], 0.34 + h, q[1], 0.5, 0.45);
      if (i < 2) smokeAt(b, q[0], 0.8 + h, q[1], 4);
    });
    [[-0.75, 1.55], [0.75, 1.55]].forEach(function (p) {
      var pv = new T3.Group(); pv.position.set(p[0], 1.75, p[1] - 0.25); b.g.add(pv);
      b.add(new T3.PlaneGeometry(0.45, 1.0), new T3.MeshStandardMaterial({ map: tex("bannerFire"), transparent: true, alphaTest: 0.5, side: T3.DoubleSide, roughness: 0.9 }), 0, -0.5, 0, { parent: pv });
      b.add(new T3.BoxGeometry(0.55, 0.045, 0.045), gold, 0, 0, 0, { parent: pv });
    });
  }

  function gEarth(b) {
    mythicEarth(b);
    var lantern = glowMat("#a6ffc4", "#3cff8a", 1.2), lan = [];
    [[1.3, 2.5, 0.5], [-1.1, 2.6, 0.8], [0.2, 2.45, -1.4], [1.5, 2.55, -0.6]].forEach(function (q, i) {
      var pv = new T3.Group(); pv.position.set(-0.5 + q[0], 3.15, -0.7 + q[2]); b.g.add(pv);
      b.add(new T3.CylinderGeometry(0.006, 0.006, 0.6, 4), C("#2a2a2a"), 0, -0.3, 0, { parent: pv, noCast: true });
      b.add(new T3.SphereGeometry(0.08, 10, 8), lantern, 0, -0.65, 0, { parent: pv, noCast: true });
      lan.push([pv, i]);
    });
    b.fx.push(function (t) { lan.forEach(function (l) { l[0].rotation.z = Math.sin(t * 1.5 + l[1]) * 0.12; }); });
  }
  var MYTHNEW = { air: gAir, water: gWater, fire: gFire, earth: gEarth };
