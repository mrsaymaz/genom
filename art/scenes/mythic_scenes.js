
  /* ================= MYTHIC AGE: full rebuilds ================= */
  function glowMat(col, em, k) { return new T3.MeshStandardMaterial({ color: lin(col), emissive: lin(em), emissiveIntensity: k == null ? 1 : k, roughness: 0.5 }); }
  function flameAt(b, x, y, z, s, li) {
    var grp = new T3.Group(); grp.position.set(x, y, z); b.g.add(grp);
    var fl = [];
    [["#ff5a1a", 0.17, 0.75], ["#ff8a2a", 0.13, 0.6], ["#ffc04a", 0.09, 0.42], ["#fff0b0", 0.05, 0.26]].forEach(function (f, i) {
      var mat = new T3.MeshBasicMaterial({ color: lin(f[0]), transparent: true, opacity: 0.85, blending: T3.AdditiveBlending, depthWrite: false });
      for (var k = 0; k < 3; k++) {
        var m = b.add(new T3.ConeGeometry(f[1] * s, f[2] * s, 8), mat, Math.cos(k * 2.1 + i) * 0.08 * s, f[2] * s / 2, Math.sin(k * 2.1 + i) * 0.08 * s, { parent: grp, noCast: true, noReceive: true });
        fl.push([m, i * 3 + k]);
      }
    });
    var L = null;
    if (li) { L = new T3.PointLight("#ff8a3d", li, 4 * s + 2, 2); L.position.set(x, y + 0.4 * s, z); b.g.add(L); }
    var ph = b.rand() * 9;
    b.fx.push(function (t) {
      fl.forEach(function (q) { var m = q[0], p = q[1] + ph; m.scale.set(1 + Math.sin(t * 9 + p) * 0.12, 1 + Math.sin(t * 11 + p * 1.7) * 0.25, 1 + Math.cos(t * 8 + p) * 0.12); });
      if (L) L.intensity = li * (1 + Math.sin(t * 13 + ph) * 0.12 + Math.sin(t * 7.3) * 0.08);
    });
  }
  function smokeAt(b, x, y, z, n) {
    var list = [];
    for (var i = 0; i < n; i++) { var sp = new T3.Sprite(new T3.SpriteMaterial({ map: tex("smoke"), transparent: true, depthWrite: false, opacity: 0.5 })); b.g.add(sp); list.push([sp, i / n]); }
    b.fx.push(function (t) { list.forEach(function (q) { var k = (t * 0.18 + q[1]) % 1; q[0].position.set(x + k * 0.5, y + k * 1.4, z - k * 0.3); var sc = 0.22 + k * 0.7; q[0].scale.set(sc, sc, 1); q[0].material.opacity = 0.5 * (1 - k) * Math.min(1, k * 6); }); });
  }
  function rough(geo, amt, seed) {
    var p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + (n3(x * 3 + seed, y * 3, z * 3) - 0.5) * amt; p.setXYZ(i, x * k, y, z * k); }
    geo.computeVertexNormals(); return geo;
  }
  function merlons(b, x0, z0, x1, z1, y, mat, size) {
    var dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz), n = Math.max(2, Math.round(len / 0.34)), ry = -Math.atan2(dz, dx);
    for (var i = 0; i <= n; i += 1) {
      if (i % 2) continue;
      b.box(size || 0.17, 0.2, 0.2, mat, x0 + dx * i / n, y, z0 + dz * i / n, { ry: ry });
    }
  }
  function onRing(r, a) { return [Math.cos(a) * r, Math.sin(a) * r]; }

  /* ---------- Hufflepuff: Sky Hall raised on a floating island ---------- */
  function mythicAir(b) {
    b.base(M("grassAir", 3, 3), M("sideAir", 3, 1));
    var gold = C("#e8bf45", { metalness: 0.65, roughness: 0.3 });
    var pale = M("stonePale", 4, 0.35), paleT = M("stonePale", 3, 3);
    b.add(new T3.CylinderGeometry(2.25, 2.35, 0.22, 40), [pale, paleT, paleT], 0, 0.11, 0);
    b.add(new T3.TorusGeometry(1.75, 0.03, 4, 64), gold, 0, 0.225, 0, { rx: PI / 2, noCast: true });
    var rune = glowMat("#fff2b8", "#ffd860", 0.9);
    b.add(new T3.RingGeometry(0.95, 1.08, 6), rune, 0, 0.232, 0, { rx: -PI / 2, noCast: true });
    b.add(new T3.RingGeometry(0.55, 0.62, 48), rune, 0, 0.232, 0, { rx: -PI / 2, noCast: true });

    var IY = 2.45, isl = new T3.Group(); isl.position.set(0, IY, 0); b.g.add(isl);
    var rockG = rough(new T3.CylinderGeometry(1.58, 0.1, 1.9, 11, 5), 0.3, 2);
    b.add(rockG, C("#a59d8e", { flatShading: true, roughness: 0.9 }), 0, -0.95, 0, { parent: isl });
    var gt = M("grassAir", 1.5, 1.5), gs = M("sideAir", 3, 0.6);
    b.add(new T3.CylinderGeometry(1.62, 1.56, 0.16, 11), [gs, gt, gt], 0, 0.02, 0, { parent: isl });
    var cry = glowMat("#fff4c8", "#ffd860", 1.5), crys = [];
    [[0, -2.1, 0, 0.22], [0.75, -0.75, 0.35, 0.13], [-0.55, -1.0, 0.45, 0.12], [0.25, -0.9, -0.65, 0.14], [-0.5, -0.7, -0.5, 0.1]].forEach(function (c) {
      var m = b.add(new T3.OctahedronGeometry(c[3], 0), cry, c[0], c[1], c[2], { parent: isl, noCast: true }); m.scale.set(0.8, 1.6, 0.8); crys.push(m);
    });
    var under = new T3.PointLight("#ffd860", 1.4, 4.5, 2); under.position.set(0, -1.6, 0); isl.add(under);

    var Y = 0.1, hp = M("stonePale", 4, 1);
    b.add(new T3.CylinderGeometry(1.0, 1.05, 0.95, 20), hp, 0, Y + 0.475, 0, { parent: isl });
    for (var k = 0; k < 12; k++) {
      var a = k / 12 * 2 * PI + PI / 12, p = onRing(1.2, a);
      b.add(new T3.CylinderGeometry(0.055, 0.065, 0.95, 8), C("#f2ece0"), p[0], Y + 0.475, p[1], { parent: isl });
      b.add(new T3.BoxGeometry(0.14, 0.05, 0.14), gold, p[0], Y + 0.96, p[1], { parent: isl });
    }
    b.add(new T3.CylinderGeometry(1.32, 1.32, 0.12, 32), gold, 0, Y + 1.03, 0, { parent: isl });
    b.add(new T3.ConeGeometry(1.5, 1.15, 24), M("canvas", 5, 1, { side: T3.DoubleSide }), 0, Y + 1.09 + 0.575, 0, { parent: isl });
    var win = glowMat("#ffe39a", "#ffb23e", 1.0);
    [-0.35, 0.35, 1.15, -1.15].forEach(function (off) {
      var a = PI / 4 + off, p = onRing(1.02, a);
      var w = b.add(new T3.PlaneGeometry(0.2, 0.36), win, p[0], Y + 0.6, p[1], { parent: isl, noCast: true });
      w.lookAt(isl.position.x + p[0] * 3, isl.position.y + Y + 0.6, p[1] * 3);
    });
    var dp = onRing(1.03, PI / 2);
    var dg = new T3.Group(); dg.position.set(dp[0], Y, dp[1]); dg.rotation.y = 0; isl.add(dg);
    b.add(new T3.BoxGeometry(0.5, 0.7, 0.06), gold, 0, 0.35, 0.02, { parent: dg });
    b.add(new T3.BoxGeometry(0.4, 0.62, 0.05), M("plankDark", 0.5, 1), 0, 0.31, 0.05, { parent: dg });

    var dark = C("#3e2817");
    b.add(new T3.CylinderGeometry(0.05, 0.07, 1.6, 8), dark, 0, Y + 2.1, 0, { parent: isl });
    var vanes = new T3.Group(); vanes.position.set(0, Y + 2.45, 0); isl.add(vanes);
    var sailM = M("canvas", 1, 1, { side: T3.DoubleSide });
    for (var v = 0; v < 3; v++) {
      var vg = new T3.Group(); vg.rotation.y = v * 2 * PI / 3; vanes.add(vg);
      b.add(new T3.CylinderGeometry(0.42, 0.42, 0.85, 10, 1, true, 0, PI * 0.55), sailM, 0.32, 0, 0, { parent: vg });
      b.add(new T3.BoxGeometry(0.72, 0.03, 0.03), dark, 0.36, 0.43, 0, { parent: vg });
      b.add(new T3.BoxGeometry(0.72, 0.03, 0.03), dark, 0.36, -0.43, 0, { parent: vg });
    }
    var top = b.add(new T3.OctahedronGeometry(0.16, 0), cry, 0, Y + 3.15, 0, { parent: isl, noCast: true }); top.scale.set(0.8, 1.5, 0.8);
    b.add(new T3.TorusGeometry(0.28, 0.018, 6, 28), gold, 0, Y + 3.15, 0, { parent: isl, rx: 1.2 });

    var bannerM = new T3.MeshStandardMaterial({ map: tex("bannerAir"), transparent: true, alphaTest: 0.5, side: T3.DoubleSide, roughness: 0.9 });
    var hang = [];
    [PI / 4 - 0.8, PI / 4 + 0.8, PI / 4 + 1.9, PI / 4 - 1.9].forEach(function (a) {
      var p = onRing(1.5, a), pv = new T3.Group(); pv.position.set(p[0], 0.0, p[1]); pv.rotation.y = PI / 2 - a; isl.add(pv);
      b.add(new T3.PlaneGeometry(0.34, 0.68), bannerM, 0, -0.34, 0.02, { parent: pv });
      hang.push(pv);
    });

    var pylonM = M("stonePale", 0.5, 1.5);
    [PI / 4, 3 * PI / 4, 5 * PI / 4, 7 * PI / 4].forEach(function (a) {
      var p = onRing(2.0, a);
      b.add(new T3.CylinderGeometry(0.09, 0.16, 0.75, 4), pylonM, p[0], 0.22 + 0.375, p[1], { ry: PI / 4 });
      var pc = b.add(new T3.OctahedronGeometry(0.09, 0), cry, p[0], 1.2, p[1], { noCast: true }); pc.scale.set(0.8, 1.5, 0.8); crys.push(pc);
    });

    var steps = [];
    for (var s = 0; s < 8; s++) {
      var t = s / 7, r = 2.65 - t * 1.0, y = 0.32 + t * (IY - 0.32), p = onRing(r, PI / 2);
      var st = b.add(new T3.BoxGeometry(0.55, 0.1, 0.3), M("stonePale", 0.5, 0.3), p[0], y, p[1]);
      steps.push([st, y, s]);
      b.add(new T3.OctahedronGeometry(0.04, 0), cry, p[0], y - 0.1, p[1], { noCast: true });
    }
    var ribbons = [];
    for (var ri = 0; ri < 10; ri++) { var sp = new T3.Sprite(new T3.SpriteMaterial({ map: tex("ember"), color: lin("#fff6d0"), transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0.7 })); sp.scale.set(0.08, 0.08, 1); b.g.add(sp); ribbons.push([sp, b.rand() * 6.28, 1.9 + b.rand() * 0.6, b.rand()]); }

    b.fx.push(function (t, dt) {
      isl.position.y = IY + Math.sin(t * 0.8) * 0.07; isl.rotation.y = Math.sin(t * 0.3) * 0.04;
      vanes.rotation.y += dt * 1.1;
      crys.forEach(function (c, i) { c.rotation.y = t * (0.6 + i * 0.1); });
      top.rotation.y = t;
      steps.forEach(function (q) { q[0].position.y = q[1] + Math.sin(t * 1.3 + q[2]) * 0.03; });
      hang.forEach(function (h, i) { h.rotation.x = Math.sin(t * 1.5 + i) * 0.12; });
      under.intensity = 1.3 + Math.sin(t * 1.6) * 0.25;
      ribbons.forEach(function (rb) { var a = rb[1] + t * 0.7; rb[0].position.set(Math.cos(a) * rb[2], 0.6 + ((t * 0.25 + rb[3]) % 1) * 3.2, Math.sin(a) * rb[2]); rb[0].material.opacity = 0.7 * Math.sin(((t * 0.25 + rb[3]) % 1) * PI); });
    });

    b.hay(-2.5, 1.9, 0.4); b.hay(-2.2, 2.45, -0.3); b.crate(2.45, 1.95, 0.3, 0.3); b.barrel(2.15, 2.4);
    b.pine(-2.55, -2.45, 1.0); b.oak(2.55, -2.3, 0.85); b.bush(-2.6, 0.2, 0.16); b.bush(0.3, -2.65, 0.18);
    for (var j = 0; j < 14; j++) { var tx = -2.8 + b.rand() * 5.6, tz = -2.8 + b.rand() * 5.6; if (Math.hypot(tx, tz) > 2.45) b.tuft(tx, tz, "#5a9238"); }
  }

  /* ---------- Ravenclaw: Tide Temple with glass dome and aqueduct ---------- */
  function mythicWater(b) {
    var grass = M("grassWater", 2.5, 2.5), side = M("sideWater", 2.5, 1), bottom = C("#21180f");
    b.add(new T3.BoxGeometry(4.9, 0.7, 4.9), [side, side, grass, bottom, side, side], -0.55, -0.35, -0.55);
    var bed = M("dirt", 2, 1);
    b.add(new T3.BoxGeometry(6, 0.35, 1.1), bed, 0, -0.525, 2.45);
    b.add(new T3.BoxGeometry(1.1, 0.35, 4.9), bed, 2.45, -0.525, -0.55);
    var wtex = tex("water", 2, 1), wtex2 = tex("water", 1, 2);
    b.add(new T3.BoxGeometry(6, 0.27, 1.1), new T3.MeshStandardMaterial({ map: wtex, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 0, -0.215, 2.45, { noCast: true });
    b.add(new T3.BoxGeometry(1.1, 0.27, 4.9), new T3.MeshStandardMaterial({ map: wtex2, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 2.45, -0.215, -0.55, { noCast: true });
    b.fx.push(function (t) { wtex.offset.set(t * 0.03, Math.sin(t * 0.4) * 0.02); wtex2.offset.set(Math.sin(t * 0.4) * 0.02, -t * 0.03); });
    b.box(5.05, 0.14, 0.22, M("stoneBlue", 4, 0.25), -0.48, -0.06, 1.86);
    b.box(0.22, 0.14, 4.9, M("stoneBlue", 0.25, 4), 1.86, -0.06, -0.55);

    var PX = -0.6, PZ = -0.6, sb = M("stoneBlue", 3, 0.5), sbT = M("stoneBlue", 3, 3);
    b.add(new T3.BoxGeometry(3.5, 0.5, 3.5), [sb, sb, sbT, sb, sb, sb], PX, 0.25, PZ);
    for (var s = 0; s < 3; s++) b.box(1.3, 0.5 - s * 0.16, 0.18, M("stoneBlue", 1.2, 0.3), PX, 0, PZ + 1.75 + 0.09 + s * 0.18);
    var bronze = C("#c08a4a", { metalness: 0.75, roughness: 0.3 }), marble = C("#eef1f2", { roughness: 0.6 });
    var Y0 = 0.5;
    b.add(new T3.CylinderGeometry(1.2, 1.28, 1.3, 8), M("stoneBlue", 3, 1), PX, Y0 + 0.65, PZ, { ry: PI / 8 });
    for (var k = 0; k < 8; k++) {
      var a = k * PI / 4 + PI / 8, p = onRing(1.52, a);
      b.cyl(0.08, 0.09, 1.38, 10, marble, PX + p[0], Y0, PZ + p[1]);
      b.cyl(0.13, 0.13, 0.07, 8, bronze, PX + p[0], Y0, PZ + p[1]);
      b.cyl(0.13, 0.11, 0.08, 8, bronze, PX + p[0], Y0 + 1.32, PZ + p[1]);
    }
    b.add(new T3.CylinderGeometry(1.72, 1.72, 0.18, 8), M("stonePale", 4, 0.3), PX, Y0 + 1.49, PZ, { ry: PI / 8 });
    b.add(new T3.CylinderGeometry(1.74, 1.74, 0.04, 8), bronze, PX, Y0 + 1.6, PZ, { ry: PI / 8 });
    var glass = new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#2a8fe0"), emissiveIntensity: 0.75, transparent: true, opacity: 0.88, roughness: 0.08, metalness: 0.25 });
    var DY = Y0 + 1.62;
    b.add(new T3.SphereGeometry(1.2, 32, 14, 0, 2 * PI, 0, PI / 2), glass, PX, DY, PZ);
    for (var r = 0; r < 4; r++) b.add(new T3.TorusGeometry(1.21, 0.028, 6, 32, PI), bronze, PX, DY, PZ, { ry: r * PI / 4 });
    b.add(new T3.TorusGeometry(0.86, 0.025, 6, 40), bronze, PX, DY + 0.84, PZ, { rx: PI / 2 });
    b.cyl(0.2, 0.24, 0.4, 8, bronze, PX, DY + 1.16, PZ);
    b.add(new T3.ConeGeometry(0.24, 0.55, 8), glass, PX, DY + 1.56 + 0.275, PZ);
    var orb = glowMat("#e8f8ff", "#58c8ff", 1.8);
    b.add(new T3.SphereGeometry(0.09, 14, 10), orb, PX, DY + 2.2, PZ, { noCast: true });
    var inner = new T3.PointLight("#58c8ff", 1.3, 5, 2); inner.position.set(PX, DY + 0.5, PZ); b.g.add(inner);
    var win = glowMat("#c6ecff", "#6ac8ff", 1.0);
    [PI / 4 - PI / 4, PI / 4 + PI / 4].forEach(function (a) {
      var p = onRing(1.2, a);
      var w = b.add(new T3.PlaneGeometry(0.32, 0.6), win, PX + p[0] * 1.01, Y0 + 0.75, PZ + p[1] * 1.01, { noCast: true });
      w.lookAt(PX + p[0] * 3, Y0 + 0.75, PZ + p[1] * 3);
    });
    var dz = PZ + 1.2;
    b.box(0.62, 0.95, 0.06, bronze, PX, Y0, dz);
    b.box(0.5, 0.88, 0.05, glowMat("#a8dcff", "#3a9ae8", 0.6), PX, Y0, dz + 0.03, { noCast: true });

    var wf = tex("water", 0.6, 1);
    var wfm = new T3.MeshStandardMaterial({ map: wf, transparent: true, opacity: 0.8, roughness: 0.1, side: T3.DoubleSide });
    b.box(0.3, 0.14, 0.24, bronze, PX + 1.82, 0.32, PZ + 0.2);
    b.add(new T3.PlaneGeometry(0.26, 0.42), wfm, PX + 1.97, 0.1, PZ + 0.2, { ry: PI / 2, noCast: true, rz: 0 });
    var foamM = new T3.MeshBasicMaterial({ color: lin("#e8f6ff"), transparent: true, opacity: 0.5, depthWrite: false });
    b.add(new T3.RingGeometry(0.06, 0.3, 20), foamM, PX + 2.05, -0.065, PZ + 0.2, { rx: -PI / 2, noCast: true });

    var AX = 2.45, stoneA = M("stoneBlue", 0.5, 1.6);
    [-2.65, -1.75, -0.85].forEach(function (z) { b.box(0.34, 1.75, 0.34, stoneA, AX, -0.35, z); });
    [-2.2, -1.3].forEach(function (z) { b.add(new T3.TorusGeometry(0.28, 0.08, 6, 14, PI), stoneA, AX, 0.95, z, { ry: PI / 2 }); });
    b.box(0.42, 0.22, 2.25, M("stoneBlue", 0.4, 2), AX, 1.35, -1.75);
    var at = tex("water", 0.3, 1.5);
    b.add(new T3.BoxGeometry(0.26, 0.04, 2.25), new T3.MeshStandardMaterial({ map: at, roughness: 0.1, metalness: 0.2 }), AX, 1.58, -1.75, { noCast: true });
    var cas = tex("water", 0.5, 1);
    b.add(new T3.PlaneGeometry(0.24, 1.55), new T3.MeshStandardMaterial({ map: cas, transparent: true, opacity: 0.8, roughness: 0.1, side: T3.DoubleSide }), AX, 0.78, -0.66, { noCast: true });
    b.add(new T3.RingGeometry(0.05, 0.32, 20), foamM, AX, -0.065, -0.5, { rx: -PI / 2, noCast: true });
    b.fx.push(function (t) {
      wf.offset.y = t * 0.8; at.offset.y = -t * 0.4; cas.offset.y = t * 0.9;
      foamM.opacity = 0.4 + Math.sin(t * 3) * 0.12;
      var k = 1 + Math.sin(t * 1.4) * 0.2; glass.emissiveIntensity = 0.7 * k; orb.emissiveIntensity = 1.6 * k; inner.intensity = 1.2 * k;
    });

    var deck = M("plankWarm", 1, 2);
    b.box(1.1, 0.07, 1.2, deck, PX, -0.02, 2.42);
    [[PX - 0.75, 1.75], [PX + 0.75, 1.75]].forEach(function (lp) {
      b.add(new T3.CylinderGeometry(0.06, 0.1, 1.3, 4), marble, lp[0], 0.65, lp[1], { ry: PI / 4 });
      b.add(new T3.SphereGeometry(0.09, 14, 10), orb, lp[0], 1.4, lp[1], { noCast: true });
    });
    b.banner(PX - 1.5, PZ + 1.5, 0.5, "bannerWater", 1.7); b.banner(PX + 1.5, PZ + 1.5, 0.5, "bannerWater", 1.7);
    var lily = C("#4f9a4e");
    [[-2.3, 2.2], [-1.6, 2.65], [2.3, 0.6], [1.0, 2.7]].forEach(function (q) { b.add(new T3.CylinderGeometry(0.11, 0.11, 0.012, 10, 1, false, 0.3, 5.6), lily, q[0], -0.075, q[1], { noCast: true }); });
    b.oak(-2.45, -2.4, 1.0); b.pine(-2.6, -0.9, 0.85); b.bush(1.3, -2.55, 0.18);
  }

  /* ---------- Gryffindor: Ember Keep becomes a walled castle ---------- */
  function mythicFire(b) {
    b.base(M("grassFire", 3, 3), M("sideFire", 3, 1));
    var sw = M("stoneWarm", 4, 0.2), swT = M("stoneWarm", 4, 4);
    b.add(new T3.BoxGeometry(4.7, 0.14, 4.7), [sw, sw, swT, sw, sw, sw], 0, 0.07, 0);
    var red = M("stoneRed", 2.5, 1.6), warm = M("stoneWarm", 1, 1), Y = 0.14;
    var gold = C("#e3a83a", { metalness: 0.7, roughness: 0.3 });
    var HX = 0.15, HZ = -0.45;
    b.box(2.5, 1.55, 1.7, red, HX, Y, HZ);
    [-0.85, 0, 0.85].forEach(function (x) { b.box(0.18, 1.2, 0.2, M("stoneWarm", 0.2, 1), HX + x, Y, HZ + 0.92); });
    b.gable({ len: 2.5, wid: 1.7, rise: 1.35, over: 0.24, mat: M("shinglesRed", 3.5, 2.5), gmat: M("stoneRed", 1.6, 1), x: HX, y: Y + 1.55, z: HZ, ridge: gold });
    [-1, 1].forEach(function (sg) { b.add(new T3.ConeGeometry(0.07, 0.35, 6), gold, HX + sg * 1.42, Y + 1.55 + 1.5, HZ); });
    var win = glowMat("#ffd38a", "#ff9a3c", 1.2);
    [-0.45, 0.45].forEach(function (x) { b.box(0.22, 0.55, 0.03, win, HX + x, Y + 0.75, HZ + 0.86, { noCast: true }); });
    b.box(0.03, 0.5, 0.22, win, HX + 1.26, Y + 0.8, HZ, { noCast: true });

    var BX = -1.65, BZ = -1.7, BH = 3.35;
    b.box(1.0, BH, 1.0, red, BX, Y, BZ);
    b.box(1.2, 0.18, 1.2, M("stoneWarm", 1.2, 0.2), BX, Y + BH, BZ);
    [[-0.5, -0.5, 0.5, -0.5], [0.5, -0.5, 0.5, 0.5], [0.5, 0.5, -0.5, 0.5], [-0.5, 0.5, -0.5, -0.5]].forEach(function (l) { merlons(b, BX + l[0], BZ + l[1], BX + l[2], BZ + l[3], Y + BH + 0.18, warm, 0.18); });
    b.cyl(0.32, 0.18, 0.22, 12, M("iron"), BX, Y + BH + 0.18, BZ);
    b.cyl(0.28, 0.28, 0.02, 12, glowMat("#ff7a2a", "#ff5a10", 2), BX, Y + BH + 0.4, BZ, { noCast: true });
    flameAt(b, BX, Y + BH + 0.4, BZ, 1.05, 1.8);
    [1.2, 2.2].forEach(function (y) { b.box(0.08, 0.36, 0.03, glowMat("#ffc070", "#ff8a2a", 1.4), BX + 0.2, Y + y, BZ + 0.51, { noCast: true }); b.box(0.03, 0.36, 0.08, glowMat("#ffc070", "#ff8a2a", 1.4), BX + 0.51, Y + y, BZ - 0.2, { noCast: true }); });

    var GZ = 1.45, T1 = [-0.95, GZ], T2 = [1.3, GZ];
    b.box(1.6, 1.45, 0.55, warm, (T1[0] + T2[0]) / 2, Y, GZ);
    merlons(b, T1[0] + 0.3, GZ + 0.27, T2[0] - 0.3, GZ + 0.27, Y + 1.45, warm);
    merlons(b, T1[0] + 0.3, GZ - 0.27, T2[0] - 0.3, GZ - 0.27, Y + 1.45, warm);
    var GX = (T1[0] + T2[0]) / 2;
    var ash = new T3.Shape(); ash.moveTo(-0.3, 0); ash.lineTo(-0.3, 0.55); ash.absarc(0, 0.55, 0.3, PI, 0, true); ash.lineTo(0.3, 0); ash.closePath();
    var gateGlow = new T3.MeshBasicMaterial({ color: lin("#ff8a3d"), transparent: true, opacity: 0.6 });
    b.add(new T3.ShapeGeometry(ash), C("#1a0d07"), GX, Y, GZ + 0.28, { noCast: true });
    b.add(new T3.ShapeGeometry(ash), gateGlow, GX, Y, GZ + 0.285, { noCast: true, s: [0.8, 0.85, 1] });
    for (var pb = -2; pb <= 2; pb++) b.box(0.025, 0.8, 0.025, M("iron"), GX + pb * 0.12, Y, GZ + 0.3);
    [0.2, 0.45, 0.7].forEach(function (y) { b.box(0.6, 0.025, 0.025, M("iron"), GX, Y + y, GZ + 0.3); });
    var gl = new T3.PointLight("#ff8a3d", 0.8, 2.5, 2); gl.position.set(GX, Y + 0.4, GZ + 0.8); b.g.add(gl);
    b.fx.push(function (t) { gateGlow.opacity = 0.5 + Math.sin(t * 5) * 0.12; });

    [T1, T2].forEach(function (tp, i) {
      b.cyl(0.52, 0.58, 2.3, 18, M("stoneWarm", 2, 2), tp[0], Y, tp[1]);
      b.cyl(0.66, 0.54, 0.16, 18, M("stoneWarm", 2, 0.2), tp[0], Y + 2.3, tp[1]);
      b.add(new T3.ConeGeometry(0.72, 1.05, 18), M("shinglesRed", 3, 1.5), tp[0], Y + 2.46 + 0.525, tp[1]);
      b.add(new T3.TorusGeometry(0.66, 0.03, 6, 28), gold, tp[0], Y + 2.5, tp[1], { rx: PI / 2 });
      b.add(new T3.SphereGeometry(0.07, 10, 8), gold, tp[0], Y + 3.55, tp[1]);
      [1.0, 1.7].forEach(function (y) { b.box(0.06, 0.28, 0.03, glowMat("#ffc070", "#ff8a2a", 1.4), tp[0] + 0.2, Y + y, tp[1] + 0.53, { noCast: true }); });
      b.cyl(0.015, 0.015, 0.5, 6, C("#3e2616"), tp[0], Y + 3.55, tp[1]);
      var pv = new T3.Group(); pv.position.set(tp[0], Y + 4.03, tp[1]); b.g.add(pv);
      var fs = new T3.Shape(); fs.moveTo(0, 0); fs.lineTo(0.45, -0.09); fs.lineTo(0, -0.2); fs.closePath();
      b.add(new T3.ShapeGeometry(fs), C("#c0281c", { side: T3.DoubleSide }), 0, 0, 0, { parent: pv, ry: -PI / 4 });
      b.fx.push(function (t) { pv.rotation.y = Math.sin(t * 2.4 + i) * 0.35; });
    });
    [[T1[0] - 0.5, GZ, -2.15, GZ], [-2.15, GZ, -2.15, -0.9], [T2[0] + 0.5, GZ, 2.15, GZ], [2.15, GZ, 2.15, -0.9]].forEach(function (w) {
      var len = Math.hypot(w[2] - w[0], w[3] - w[1]), cx = (w[0] + w[2]) / 2, cz = (w[1] + w[3]) / 2, ry = -Math.atan2(w[3] - w[1], w[2] - w[0]);
      b.box(len + 0.3, 0.85, 0.3, M("stoneWarm", len, 0.7), cx, Y, cz, { ry: ry });
      merlons(b, w[0], w[1], w[2], w[3], Y + 0.85, warm, 0.16);
    });
    b.banner(GX - 0.45, GZ + 0.62, Y, "bannerFire", 1.65); b.banner(GX + 0.45, GZ + 0.62, Y, "bannerFire", 1.65);
    [[-1.7, 2.35], [2.0, 2.35]].forEach(function (p) {
      b.cyl(0.18, 0.22, 0.2, 8, M("stoneWarm", 0.5, 0.2), p[0], 0, p[1]);
      b.cyl(0.24, 0.13, 0.16, 12, M("iron"), p[0], 0.2, p[1]);
      flameAt(b, p[0], 0.36, p[1], 0.5, 0.7);
    });
    var FX = 1.55, FZ = -1.85;
    b.box(1.0, 0.85, 0.85, warm, FX, Y, FZ);
    b.box(0.34, 1.9, 0.34, M("stoneWarm", 0.4, 1.8), FX + 0.25, Y, FZ - 0.18);
    smokeAt(b, FX + 0.25, Y + 2.0, FZ - 0.18, 6);
    b.box(0.03, 0.4, 0.45, glowMat("#ffb070", "#ff6a1a", 1.6), FX + 0.51, Y + 0.12, FZ, { noCast: true });
    b.pine(-2.6, 0.2, 0.75); b.pine(2.6, 0.3, 0.8); b.bush(0.4, -2.6, 0.17, "#5a7a30");
  }

  /* ---------- Slytherin: the hall moves inside the great tree ---------- */
  function mythicEarth(b) {
    b.base(M("grassEarth", 3, 3), M("sideEarth", 3, 1));
    var CX = -0.1, CZ = -0.2;
    b.add(new T3.CylinderGeometry(1.75, 1.85, 0.22, 24), M("stoneGrey", 4, 0.3), CX, 0.11, CZ);
    var tg = new T3.CylinderGeometry(0.85, 1.35, 3.0, 18, 10), tp = tg.attributes.position;
    for (var i = 0; i < tp.count; i++) {
      var x = tp.getX(i), y = tp.getY(i), z = tp.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z);
      var k = 1 + Math.sin(a * 5 + y * 1.2) * 0.07 + (n3(x * 4, y * 2, z * 4) - 0.5) * 0.08;
      a += y * 0.12;
      tp.setXYZ(i, Math.cos(a) * r * k, y, Math.sin(a) * r * k);
    }
    tg.computeVertexNormals();
    var barkM = M("barkTree", 4, 3);
    b.add(tg, barkM, CX, 1.72, CZ);
    function rAt(y) { return 1.35 - (y - 0.22) / 3.0 * 0.5; }
    var rootM = M("barkTree", 1, 3);
    for (var rt = 0; rt < 9; rt++) {
      var ra = rt / 9 * 2 * PI + 0.2;
      if (Math.abs(((ra - PI / 4 + PI) % (2 * PI)) - PI) < 0.35) continue;
      var pts = [];
      for (var s = 0; s <= 5; s++) { var t = s / 5, rr = 1.1 + t * 1.25, yy = 1.25 * Math.pow(1 - t, 1.6) + 0.05; pts.push(new T3.Vector3(CX + Math.cos(ra + t * 0.25) * rr, yy, CZ + Math.sin(ra + t * 0.25) * rr)); }
      b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 24, 0.16 - (rt % 3) * 0.02, 7, false), rootM, 0, 0, 0);
    }

    var sl = C("#b4b8b6", { flatShading: true });
    var dr = rAt(0.6), door = new T3.Group(); door.position.set(CX + Math.cos(PI / 4) * (dr - 0.05), 0.22, CZ + Math.sin(PI / 4) * (dr - 0.05)); door.rotation.y = PI / 4; b.g.add(door);
    b.add(new T3.BoxGeometry(0.17, 0.85, 0.2), sl, -0.42, 0.42, 0.06, { parent: door });
    b.add(new T3.BoxGeometry(0.17, 0.85, 0.2), sl, 0.42, 0.42, 0.06, { parent: door });
    b.add(new T3.TorusGeometry(0.42, 0.085, 6, 16, PI), sl, 0, 0.85, 0.06, { parent: door });
    var dsh = new T3.Shape(); dsh.moveTo(-0.34, 0); dsh.lineTo(-0.34, 0.85); dsh.absarc(0, 0.85, 0.34, PI, 0, true); dsh.lineTo(0.34, 0); dsh.closePath();
    var doorM = glowMat("#123a22", "#2dff7a", 0.65);
    b.add(new T3.ShapeGeometry(dsh), doorM, 0, 0, 0.05, { parent: door, noCast: true });
    var dl = new T3.PointLight("#5cff9a", 1.0, 3.5, 2); dl.position.set(0, 0.6, 0.8); door.add(dl);

    var winM = glowMat("#a6ffc4", "#3cff8a", 1.0);
    [[0.0, 1.25], [1.35, 1.45], [0.7, 2.25], [-0.55, 2.0], [2.0, 2.35], [0.25, 2.9], [1.15, 3.0]].forEach(function (w) {
      var r = rAt(w[1]) + 0.02, x = CX + Math.cos(w[0]) * r, z = CZ + Math.sin(w[0]) * r;
      var g = b.add(new T3.CircleGeometry(0.13, 16), winM, x, w[1], z, { noCast: true }); g.lookAt(x + Math.cos(w[0]) * 3, w[1], z + Math.sin(w[0]) * 3);
      var ring = b.add(new T3.TorusGeometry(0.15, 0.04, 6, 16), sl, x, w[1], z); ring.lookAt(x + Math.cos(w[0]) * 3, w[1], z + Math.sin(w[0]) * 3);
    });
    var BY = 1.95;
    b.add(new T3.CylinderGeometry(1.55, 1.55, 0.08, 28), M("plankWarm", 4, 1), CX, BY, CZ);
    for (var bp = 0; bp < 18; bp++) { var ba = bp / 18 * 2 * PI, q = onRing(1.5, ba); b.cyl(0.018, 0.018, 0.28, 5, C("#4a3020"), CX + q[0], BY + 0.04, CZ + q[1]); }
    b.add(new T3.TorusGeometry(1.5, 0.02, 5, 48), C("#4a3020"), CX, BY + 0.32, CZ, { rx: PI / 2 });
    for (var br = 0; br < 6; br++) { var bba = br / 6 * 2 * PI + 0.3, q2 = onRing(0.95, bba), q3 = onRing(1.45, bba); b.beam([CX + q2[0], BY - 0.55, CZ + q2[1]], [CX + q3[0], BY - 0.02, CZ + q3[1]], 0.04, C("#4a3020")); }

    var canopy = new T3.Group(); canopy.position.set(CX, 3.2, CZ); b.g.add(canopy);
    [[0, 0.95, 0, 1.05, "#2f6f3c"], [-1.1, 0.55, 0.45, 0.85, "#285f34"], [1.1, 0.5, -0.45, 0.88, "#285f34"], [0.4, 0.45, 1.15, 0.8, "#3b8048"], [-0.5, 0.5, -1.15, 0.82, "#245a31"],
     [-0.35, 1.5, -0.2, 0.7, "#3f8a4c"], [0.6, 1.35, 0.45, 0.62, "#4a9654"], [1.15, 0.85, 0.75, 0.6, "#34763f"], [-1.2, 0.95, -0.55, 0.6, "#2a6236"], [-0.85, 0.75, 1.05, 0.55, "#3b8048"]].forEach(function (c, ci) {
      var ig = new T3.IcosahedronGeometry(c[3], 1), ip = ig.attributes.position;
      for (var q = 0; q < ip.count; q++) { var ax = ip.getX(q), ay = ip.getY(q), az = ip.getZ(q), f = 1 + (n3(ax * 5 + ci, ay * 5, az * 5) - 0.5) * 0.35; ip.setXYZ(q, ax * f, ay * f, az * f); }
      ig.computeVertexNormals();
      b.add(ig, C(c[4], { flatShading: true, roughness: 0.9 }), c[0], c[1], c[2], { parent: canopy });
    });
    var lanterns = [];
    [[1.35, 0.4], [-1.35, 0.1], [0.3, 1.5], [0.9, -1.2], [-0.9, 1.0]].forEach(function (l, li) {
      var pv = new T3.Group(); pv.position.set(l[0], 0.2, l[1]); canopy.add(pv);
      b.add(new T3.CylinderGeometry(0.006, 0.006, 0.5, 4), C("#2a2a2a"), 0, -0.25, 0, { parent: pv, noCast: true });
      b.add(new T3.SphereGeometry(0.07, 10, 8), winM, 0, -0.55, 0, { parent: pv, noCast: true });
      lanterns.push([pv, li]);
    });
    b.fx.push(function (t) {
      canopy.rotation.z = Math.sin(t * 0.7) * 0.02; canopy.rotation.x = Math.sin(t * 0.55 + 1) * 0.015;
      lanterns.forEach(function (l) { l[0].rotation.z = Math.sin(t * 1.6 + l[1]) * 0.15; });
      var k = 0.55 + Math.sin(t * 1.6) * 0.2; doorM.emissiveIntensity = k; dl.intensity = 0.7 + k * 0.6;
    });

    var stoneM = C("#a7adb0", { flatShading: true, roughness: 0.8 }), runeM = glowMat("#9effc0", "#3cff8a", 1.3);
    [-1.25, -0.4, 1.95, 2.8, 3.65, 4.5].forEach(function (a) {
      [-0.2, 0.2].forEach(function (o) {
        var p = onRing(2.5, a + o);
        b.add(new T3.CylinderGeometry(0.13, 0.19, 1.15, 4), stoneM, CX + p[0], 0.575, CZ + p[1], { ry: -a + PI / 4 });
        b.box(0.04, 0.42, 0.02, runeM, CX + p[0] + 0.11, 0.25, CZ + p[1] + 0.11, { ry: PI / 4, noCast: true });
      });
      var c = onRing(2.5, a);
      b.box(1.25, 0.2, 0.3, stoneM, CX + c[0], 1.15, CZ + c[1], { ry: -a - PI / 2 });
    });
    var ringM = new T3.MeshBasicMaterial({ color: lin("#5cff9a"), transparent: true, opacity: 0.35, depthWrite: false });
    b.add(new T3.TorusGeometry(2.5, 0.022, 4, 96), ringM, CX, 0.02, CZ, { rx: PI / 2, noCast: true });
    var capM = glowMat("#7ff0d0", "#2fe0b0", 0.9);
    [[2.0, 1.2, 1.5], [2.2, 1.0, 1.0], [-2.3, -0.6, 1.4], [-2.1, -0.4, 0.9], [1.3, -2.2, 1.2], [-1.0, 2.3, 1.3]].forEach(function (m) {
      var s = m[2];
      b.cyl(0.035 * s, 0.045 * s, 0.22 * s, 7, C("#e6eedd"), m[0], 0, m[1]);
      b.add(new T3.SphereGeometry(0.13 * s, 12, 8, 0, 2 * PI, 0, PI / 2), capM, m[0], 0.22 * s, m[1], { noCast: true });
    });
    var flyM = new T3.SpriteMaterial({ map: tex("glow"), transparent: true, depthWrite: false, blending: T3.AdditiveBlending });
    var flies = [];
    for (var fi = 0; fi < 18; fi++) { var fs = new T3.Sprite(flyM); fs.scale.set(0.12, 0.12, 1); b.g.add(fs); flies.push([fs, b.rand() * 6.28, 1.6 + b.rand() * 1.2, 1.2 + b.rand() * 1.8, 0.3 + b.rand() * 0.5]); }
    b.fx.push(function (t) {
      flies.forEach(function (f) { var a = f[1] + t * f[4]; f[0].position.set(CX + Math.cos(a) * f[2], f[3] + Math.sin(t * 1.3 + f[1]) * 0.25, CZ + Math.sin(a * 1.3) * f[2]); });
      ringM.opacity = 0.25 + Math.sin(t * 1.4) * 0.12; capM.emissiveIntensity = 0.7 + Math.sin(t * 2) * 0.3; runeM.emissiveIntensity = 1.1 + Math.sin(t * 1.4) * 0.4;
    });
    [1.95, 2.35, 2.75, 3.15].forEach(function (r, i) { b.add(new T3.CylinderGeometry(0.17, 0.2, 0.05, 7), C("#8f9694", { flatShading: true }), CX + 0.707 * r + (i % 2 ? 0.08 : -0.08), 0.02, CZ + 0.707 * r - (i % 2 ? 0.08 : -0.08), { ry: i }); });
    b.banner(-2.3, 2.3, 0, "bannerEarth", 1.7);
    b.pine(2.5, -2.5, 1.0); b.bush(-2.55, 1.2, 0.18, "#2f6a2e"); b.bush(2.6, 2.4, 0.16, "#2f6a2e");
  }
  var MYTHIC = { air: mythicAir, water: mythicWater, fire: mythicFire, earth: mythicEarth };
