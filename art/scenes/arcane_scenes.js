
  /* ================= ARCANE AGE: second rebuild ================= */
  function aBob(b, grp, y, amp, sp, ph) { b.fx.push(function (t) { grp.position.y = y + Math.sin(t * sp + ph) * amp; }); }
  function aIsland(b, x, y, z, r, h, seed) {
    var g = new T3.Group(); g.position.set(x, y, z); b.g.add(g);
    b.add(rough(new T3.CylinderGeometry(r, 0.08, h, 11, 5), 0.3, seed), C("#a59d8e", { flatShading: true, roughness: 0.9 }), 0, -h / 2, 0, { parent: g });
    b.add(new T3.CylinderGeometry(r + 0.03, r - 0.04, 0.14, 11), [M("sideAir", 3, 0.5), M("grassAir", 1.5, 1.5), M("grassAir", 1.5, 1.5)], 0, 0.02, 0, { parent: g });
    return g;
  }
  function arcaneAir(b) {
    b.base(M("grassAir", 3, 3), M("sideAir", 3, 1));
    var gold = C("#e8bf45", { metalness: 0.7, roughness: 0.28 }), cry = glowMat("#fff4c8", "#ffd860", 1.6);
    var pale = M("stonePale", 5, 0.35), paleT = M("stonePale", 3.5, 3.5);
    b.add(new T3.CylinderGeometry(2.45, 2.55, 0.24, 48), [pale, paleT, paleT], 0, 0.12, 0);
    b.add(new T3.TorusGeometry(2.0, 0.035, 4, 72), gold, 0, 0.245, 0, { rx: PI / 2, noCast: true });
    var rune = glowMat("#fff2b8", "#ffd860", 1.0);
    b.add(new T3.RingGeometry(1.15, 1.25, 3), rune, 0, 0.25, 0, { rx: -PI / 2, noCast: true });
    b.add(new T3.RingGeometry(1.15, 1.25, 3), rune, 0, 0.25, 0, { rx: -PI / 2, rz: PI, noCast: true });
    b.add(new T3.RingGeometry(1.5, 1.58, 48), rune, 0, 0.25, 0, { rx: -PI / 2, noCast: true });

    var IY = 2.5, isl = aIsland(b, 0, IY, 0, 1.65, 2.1, 2);
    aBob(b, isl, IY, 0.06, 0.7, 0);
    [[0, -1.75, 0, 0.26], [0.8, -0.9, 0.4, 0.14], [-0.7, -1.0, 0.5, 0.13], [0.3, -1.1, -0.75, 0.15], [-0.5, -0.8, -0.6, 0.11]].forEach(function (c) {
      var m = b.add(new T3.OctahedronGeometry(c[3], 0), cry, c[0], c[1], c[2], { parent: isl, noCast: true }); m.scale.set(0.8, 1.6, 0.8);
      b.fx.push(function (t) { m.rotation.y = t * 0.8; });
    });
    var under = new T3.PointLight("#ffd860", 1.6, 5, 2); under.position.set(0, -1.4, 0); isl.add(under);
    var Y = 0.1, hp = M("stonePale", 5, 1);
    b.add(new T3.CylinderGeometry(1.15, 1.2, 0.85, 24), hp, 0, Y + 0.425, 0, { parent: isl });
    b.add(new T3.CylinderGeometry(1.24, 1.24, 0.08, 32), gold, 0, Y + 0.89, 0, { parent: isl });
    var win = glowMat("#ffe39a", "#ffb23e", 1.1);
    [PI / 4 - 1.1, PI / 4 - 0.4, PI / 4 + 0.4, PI / 4 + 1.1].forEach(function (a) {
      var p = onRing(1.17, a), w = b.add(new T3.PlaneGeometry(0.2, 0.42), win, p[0], Y + 0.45, p[1], { parent: isl, noCast: true });
      w.lookAt(p[0] * 4, isl.position.y + Y + 0.45, p[1] * 4);
    });
    var Y2 = Y + 0.93;
    b.add(new T3.CylinderGeometry(0.78, 0.82, 0.75, 20), hp, 0, Y2 + 0.375, 0, { parent: isl });
    for (var c2 = 0; c2 < 12; c2++) { var q = onRing(0.95, c2 / 12 * 2 * PI); b.add(new T3.CylinderGeometry(0.045, 0.05, 0.75, 8), C("#f2ece0"), q[0], Y2 + 0.375, q[1], { parent: isl }); }
    b.add(new T3.CylinderGeometry(1.04, 1.04, 0.08, 32), gold, 0, Y2 + 0.79, 0, { parent: isl });
    b.add(new T3.ConeGeometry(1.1, 1.05, 24), M("canvas", 6, 1, { side: T3.DoubleSide }), 0, Y2 + 0.83 + 0.525, 0, { parent: isl });
    b.add(new T3.ConeGeometry(0.12, 0.85, 8), gold, 0, Y2 + 1.88 + 0.425, 0, { parent: isl });
    var tip = b.add(new T3.OctahedronGeometry(0.13, 0), cry, 0, Y2 + 2.45, 0, { parent: isl, noCast: true }); tip.scale.set(0.8, 1.6, 0.8);
    var dp = onRing(1.2, PI / 2), dg = new T3.Group(); dg.position.set(dp[0], Y, dp[1]); isl.add(dg);
    b.add(new T3.BoxGeometry(0.55, 0.75, 0.06), gold, 0, 0.375, 0, { parent: dg });
    b.add(new T3.BoxGeometry(0.44, 0.66, 0.05), glowMat("#ffe9b0", "#ffb23e", 0.7), 0, 0.34, 0.03, { parent: dg, noCast: true });

    var ring = new T3.Group(); ring.position.set(0, Y2 + 0.35, 0); isl.add(ring);
    b.add(new T3.TorusGeometry(1.55, 0.035, 6, 64), gold, 0, 0, 0, { parent: ring, rx: PI / 2 });
    var sailM = M("canvas", 1, 1, { side: T3.DoubleSide });
    for (var s = 0; s < 6; s++) {
      var a = s / 6 * 2 * PI, p2 = onRing(1.55, a), sg = new T3.Group(); sg.position.set(p2[0], 0, p2[1]); sg.rotation.y = -a + 0.5; ring.add(sg);
      b.add(new T3.PlaneGeometry(0.42, 0.62), sailM, 0, 0, 0, { parent: sg });
      b.add(new T3.BoxGeometry(0.03, 0.66, 0.03), gold, -0.21, 0, 0, { parent: sg });
    }
    b.fx.push(function (t, dt) { ring.rotation.y += dt * 0.6; tip.rotation.y = t; under.intensity = 1.5 + Math.sin(t * 1.4) * 0.3; });

    [[-1.95, 1.6, 1.05, 3.3], [1.5, 2.15, -1.8, 4.1]].forEach(function (q, i) {
      var si = aIsland(b, q[0], q[1], q[2], 0.55, 0.8, q[3]);
      aBob(b, si, q[1], 0.08, 0.9, i * 2);
      b.add(new T3.CylinderGeometry(0.28, 0.3, 0.42, 12), hp, 0, 0.3, 0, { parent: si });
      b.add(new T3.ConeGeometry(0.42, 0.45, 12), M("canvas", 2, 1, { side: T3.DoubleSide }), 0, 0.73, 0, { parent: si });
      var sc = b.add(new T3.OctahedronGeometry(0.1, 0), cry, 0, -0.9, 0, { parent: si, noCast: true }); sc.scale.set(0.8, 1.6, 0.8);
      b.beam([q[0] * 0.72, IY + 0.08, q[2] * 0.72], [q[0] * 0.92, q[1] + 0.08, q[2] * 0.92], 0.015, gold);
    });
    var beamM = new T3.MeshBasicMaterial({ color: lin("#fff2c0"), transparent: true, opacity: 0.22, depthWrite: false });
    [PI * 0.95, PI * 1.45, PI * 1.95].forEach(function (a, i) {
      var p = onRing(2.05, a);
      b.add(new T3.CylinderGeometry(0.12, 0.2, 1.25, 4), M("stonePale", 0.5, 1.2), p[0], 0.24 + 0.625, p[1], { ry: PI / 4 });
      b.add(new T3.ConeGeometry(0.15, 0.2, 4), gold, p[0], 1.6, p[1], { ry: PI / 4 });
      var pc = b.add(new T3.OctahedronGeometry(0.13, 0), cry, p[0], 1.95, p[1], { noCast: true }); pc.scale.set(0.8, 1.6, 0.8);
      var q = onRing(1.3, a), dx = q[0] - p[0], dz = q[1] - p[1];
      b.beam([p[0], 2.0, p[1]], [q[0], IY - 0.6, q[1]], 0.03, beamM);
      b.fx.push(function (t) { pc.rotation.y = t * 1.2 + i; pc.position.y = 1.95 + Math.sin(t * 1.5 + i) * 0.05; });
    });
    for (var st = 0; st < 9; st++) {
      var tt = st / 8, r = 2.7 - tt * 1.1, y = 0.35 + tt * (IY - 0.35), p3 = onRing(r, PI / 2);
      var stp = b.add(new T3.BoxGeometry(0.58, 0.1, 0.3), M("stonePale", 0.5, 0.3), p3[0], y, p3[1]);
      (function (m, yy, k) { b.fx.push(function (t) { m.position.y = yy + Math.sin(t * 1.3 + k) * 0.03; }); })(stp, y, st);
    }
    b.banner(-1.2, 2.2, 0, "bannerAir", 1.6); b.banner(2.2, -1.2, 0, "bannerAir", 1.6);
    b.oak(-2.6, -2.5, 0.85); b.bush(2.6, 2.6, 0.16);
  }

  function arcaneWater(b) {
    var grass = M("grassWater", 2.5, 2.5), side = M("sideWater", 2.5, 1), bottom = C("#21180f");
    b.add(new T3.BoxGeometry(4.9, 0.7, 4.9), [side, side, grass, bottom, side, side], -0.55, -0.35, -0.55);
    var bed = M("dirt", 2, 1);
    b.add(new T3.BoxGeometry(6, 0.35, 1.1), bed, 0, -0.525, 2.45);
    b.add(new T3.BoxGeometry(1.1, 0.35, 4.9), bed, 2.45, -0.525, -0.55);
    var wtex = tex("water", 2, 1), wtex2 = tex("water", 1, 2);
    b.add(new T3.BoxGeometry(6, 0.27, 1.1), new T3.MeshStandardMaterial({ map: wtex, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 0, -0.215, 2.45, { noCast: true });
    b.add(new T3.BoxGeometry(1.1, 0.27, 4.9), new T3.MeshStandardMaterial({ map: wtex2, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 2.45, -0.215, -0.55, { noCast: true });
    b.box(5.05, 0.14, 0.22, M("stoneBlue", 4, 0.25), -0.48, -0.06, 1.86);
    b.box(0.22, 0.14, 4.9, M("stoneBlue", 0.25, 4), 1.86, -0.06, -0.55);
    var bz = C("#c08a4a", { metalness: 0.75, roughness: 0.3 }), marble = C("#eef1f2", { roughness: 0.55 });
    var PX = -0.6, PZ = -0.6, sb = M("stoneBlue", 3.5, 0.4), sbT = M("stoneBlue", 3.5, 3.5), pl = M("stonePale", 3, 0.4), plT = M("stonePale", 3, 3);
    b.add(new T3.BoxGeometry(3.7, 0.4, 3.7), [sb, sb, sbT, sb, sb, sb], PX, 0.2, PZ);
    b.add(new T3.BoxGeometry(3.0, 0.4, 3.0), [pl, pl, plT, pl, pl, pl], PX, 0.6, PZ);
    for (var s = 0; s < 4; s++) b.box(1.4, 0.8 - s * 0.2, 0.2, M("stonePale", 1.3, 0.3), PX, 0, PZ + 1.5 + 0.1 + s * 0.2);
    var Y0 = 0.8;
    b.cyl(1.0, 1.05, 1.5, 24, M("stoneBlue", 4, 1.4), PX, Y0, PZ);
    for (var k = 0; k < 12; k++) {
      var a = k / 12 * 2 * PI, p = onRing(1.28, a);
      b.cyl(0.075, 0.085, 1.5, 10, marble, PX + p[0], Y0, PZ + p[1]);
      b.cyl(0.12, 0.12, 0.07, 8, bz, PX + p[0], Y0, PZ + p[1]); b.cyl(0.12, 0.1, 0.08, 8, bz, PX + p[0], Y0 + 1.43, PZ + p[1]);
    }
    b.add(new T3.CylinderGeometry(1.45, 1.45, 0.2, 40), M("stonePale", 5, 0.3), PX, Y0 + 1.6, PZ);
    b.add(new T3.CylinderGeometry(1.47, 1.47, 0.04, 40), bz, PX, Y0 + 1.72, PZ);
    var win = glowMat("#c6ecff", "#6ac8ff", 1.1);
    [PI / 4 - 0.7, PI / 4, PI / 4 + 0.7].forEach(function (a) { var p = onRing(1.02, a), w = b.add(new T3.PlaneGeometry(0.24, 0.8), win, PX + p[0], Y0 + 0.75, PZ + p[1], { noCast: true }); w.lookAt(PX + p[0] * 4, Y0 + 0.75, PZ + p[1] * 4); });
    var glass = new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#2a8fe0"), emissiveIntensity: 0.75, transparent: true, opacity: 0.88, roughness: 0.08, metalness: 0.25 });
    var DY = Y0 + 1.74;
    b.add(new T3.SphereGeometry(1.15, 36, 16, 0, 2 * PI, 0, PI / 2), glass, PX, DY, PZ);
    for (var r = 0; r < 6; r++) b.add(new T3.TorusGeometry(1.16, 0.026, 6, 32, PI), bz, PX, DY, PZ, { ry: r * PI / 6 });
    b.cyl(0.12, 0.22, 0.3, 10, bz, PX, DY + 1.1, PZ);
    var arm = new T3.Group(); arm.position.set(PX, DY + 1.95, PZ); b.g.add(arm);
    var orb = glowMat("#e8f8ff", "#58c8ff", 2.0);
    b.add(new T3.SphereGeometry(0.17, 18, 14), orb, 0, 0, 0, { parent: arm, noCast: true });
    var r1 = b.add(new T3.TorusGeometry(0.55, 0.025, 6, 48), bz, 0, 0, 0, { parent: arm }), r2 = b.add(new T3.TorusGeometry(0.48, 0.025, 6, 48), bz, 0, 0, 0, { parent: arm }), r3 = b.add(new T3.TorusGeometry(0.62, 0.02, 6, 48), bz, 0, 0, 0, { parent: arm, rx: PI / 2 });
    b.beam([0, -0.62, 0], [0, -0.35, 0], 0.025, bz, arm);
    var L = new T3.PointLight("#58c8ff", 1.5, 5, 2); L.position.set(PX, DY + 0.6, PZ); b.g.add(L);
    var tideM = new T3.MeshStandardMaterial({ map: tex("water", 4, 0.3), transparent: true, opacity: 0.75, roughness: 0.05, emissive: lin("#1a6ab0"), emissiveIntensity: 0.5 });
    var tide = b.add(new T3.TorusGeometry(1.75, 0.06, 8, 64), tideM, PX, DY + 0.5, PZ, { rx: PI / 2 - 0.25, noCast: true });
    [[PX - 1.6, PZ + 1.6], [PX + 1.6, PZ - 1.6], [PX - 1.6, PZ - 1.6]].forEach(function (q) {
      b.cyl(0.2, 0.26, 2.6, 12, M("stoneBlue", 1, 2), q[0], 0.8, q[1]);
      b.cyl(0.32, 0.22, 0.12, 12, M("stonePale", 1, 0.2), q[0], 3.4, q[1]);
      b.add(new T3.ConeGeometry(0.24, 0.6, 12), glass, q[0], 3.52 + 0.3, q[1]);
      b.add(new T3.SphereGeometry(0.06, 10, 8), orb, q[0], 4.18, q[1], { noCast: true });
    });
    var wf = tex("water", 0.5, 1), wfm = new T3.MeshStandardMaterial({ map: wf, transparent: true, opacity: 0.82, roughness: 0.1, side: T3.DoubleSide });
    [-0.9, 0.0, 0.9].forEach(function (dz) {
      b.box(0.24, 0.12, 0.2, bz, PX + 1.86, 0.62, PZ + dz);
      b.add(new T3.PlaneGeometry(0.22, 0.75), wfm, PX + 1.98, 0.25, PZ + dz, { ry: PI / 2, noCast: true });
    });
    var foamM = new T3.MeshBasicMaterial({ color: lin("#e8f6ff"), transparent: true, opacity: 0.5, depthWrite: false });
    b.add(new T3.PlaneGeometry(0.5, 2.4), foamM, PX + 2.15, -0.065, PZ, { rx: -PI / 2, noCast: true });
    b.fx.push(function (t, dt) {
      wtex.offset.set(t * 0.03, Math.sin(t * 0.4) * 0.02); wtex2.offset.set(Math.sin(t * 0.4) * 0.02, -t * 0.03);
      r1.rotation.set(t * 0.6, 0.4, 0); r2.rotation.set(0.9, t * 0.8, 0); r3.rotation.z = t * 0.5;
      arm.position.y = DY + 1.95 + Math.sin(t * 1.2) * 0.05;
      tide.rotation.z = t * 0.4; tideM.map.offset.x = t * 0.15;
      wf.offset.y = t * 0.9; foamM.opacity = 0.4 + Math.sin(t * 3) * 0.12;
      var k = 1 + Math.sin(t * 1.4) * 0.2; glass.emissiveIntensity = 0.7 * k; orb.emissiveIntensity = 1.8 * k; L.intensity = 1.4 * k;
    });
    b.box(1.1, 0.07, 1.2, M("plankWarm", 1, 2), PX, -0.02, 2.42);
    [[PX - 0.75, 1.75], [PX + 0.75, 1.75]].forEach(function (lp) { b.add(new T3.CylinderGeometry(0.06, 0.1, 1.3, 4), marble, lp[0], 0.65, lp[1], { ry: PI / 4 }); b.add(new T3.SphereGeometry(0.09, 14, 10), orb, lp[0], 1.4, lp[1], { noCast: true }); });
    b.banner(PX - 1.0, PZ + 1.75, 0.8, "bannerWater", 1.6); b.banner(PX + 1.75, PZ - 1.0, 0.8, "bannerWater", 1.6);
    b.oak(1.35, -2.55, 0.9);
  }

  function arcaneFire(b) {
    b.base(M("grassFire", 3, 3), M("sideFire", 3, 1));
    var sw = M("stoneWarm", 4, 0.2), swT = M("stoneWarm", 4.5, 4.5);
    b.add(new T3.BoxGeometry(5.2, 0.14, 5.2), [sw, sw, swT, sw, sw, sw], 0, 0.07, 0);
    var Y = 0.14, red = M("stoneRed", 2, 3), warm = M("stoneWarm", 0.3, 0.3), gold = C("#e3a83a", { metalness: 0.7, roughness: 0.3 });
    var lava = glowMat("#ffb060", "#ff4a10", 1.6);
    [[-1.3, 0, 0.12, 2.0], [1.3, 0, 0.12, 2.0], [0, -1.3, 2.0, 0.12]].forEach(function (l) { b.box(l[2], 0.02, l[3], lava, l[0], Y, l[1], { noCast: true }); });
    var KX = 0, KZ = -0.35;
    b.box(1.7, 2.7, 1.7, red, KX, Y, KZ);
    [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]].forEach(function (c) { b.box(0.3, 2.3, 0.3, M("stoneWarm", 0.3, 2.2), KX + c[0], Y, KZ + c[1]); });
    b.box(1.95, 0.2, 1.95, M("stoneWarm", 2, 0.2), KX, Y + 2.7, KZ);
    [[-0.95, -0.95, 0.95, -0.95], [0.95, -0.95, 0.95, 0.95], [0.95, 0.95, -0.95, 0.95], [-0.95, 0.95, -0.95, -0.95]].forEach(function (l) { merlons(b, KX + l[0], KZ + l[1], KX + l[2], KZ + l[3], Y + 2.9, warm, 0.18); });
    var win = glowMat("#ffd38a", "#ff9a3c", 1.3);
    [0.9, 1.7].forEach(function (y) { [-0.4, 0.4].forEach(function (x) { b.box(0.16, 0.4, 0.03, win, KX + x, Y + y, KZ + 0.86, { noCast: true }); b.box(0.03, 0.4, 0.16, win, KX + 0.86, Y + y, KZ + x, { noCast: true }); }); });
    b.box(0.8, 1.3, 0.8, red, KX, Y + 2.9, KZ);
    b.box(0.95, 0.14, 0.95, M("stoneWarm", 1, 0.2), KX, Y + 4.2, KZ);
    b.cyl(0.32, 0.16, 0.22, 12, M("iron"), KX, Y + 4.34, KZ);
    b.cyl(0.3, 0.3, 0.02, 12, glowMat("#ff7a2a", "#ff5a10", 2), KX, Y + 4.56, KZ, { noCast: true });
    flameAt(b, KX, Y + 4.57, KZ, 1.25, 2.2);
    var halo = new T3.Group(); halo.position.set(KX, Y + 5.1, KZ); b.g.add(halo);
    b.add(new T3.TorusGeometry(0.55, 0.03, 6, 40), gold, 0, 0, 0, { parent: halo, rx: PI / 2 });
    for (var f = 0; f < 6; f++) { var p = onRing(0.55, f / 6 * 2 * PI); b.add(new T3.ConeGeometry(0.05, 0.16, 5), gold, p[0], 0.06, p[1], { parent: halo }); }
    b.fx.push(function (t) { halo.rotation.y = t * 0.6; halo.position.y = Y + 5.1 + Math.sin(t * 1.3) * 0.05; });
    var HX = -1.3, HZ = -1.55;
    b.box(1.2, 1.3, 1.6, red, HX, Y, HZ);
    b.gable({ len: 1.2, wid: 1.6, rise: 0.9, over: 0.12, mat: M("shinglesRed", 1.8, 1.6), gmat: M("stoneRed", 1, 0.7), x: HX, y: Y + 1.3, z: HZ, ridge: gold, ry: PI / 2 });
    var C4 = 2.15;
    [[-C4, C4], [C4, C4], [C4, -C4], [-C4, -C4]].forEach(function (tp, i) {
      b.cyl(0.42, 0.48, 1.75, 16, M("stoneWarm", 1.6, 1.6), tp[0], Y, tp[1]);
      b.cyl(0.54, 0.44, 0.14, 16, M("stoneWarm", 1.6, 0.2), tp[0], Y + 1.75, tp[1]);
      b.add(new T3.ConeGeometry(0.6, 0.85, 16), M("shinglesRed", 2.4, 1.2), tp[0], Y + 1.89 + 0.425, tp[1]);
      b.add(new T3.SphereGeometry(0.06, 10, 8), gold, tp[0], Y + 2.78, tp[1]);
      b.box(0.06, 0.26, 0.03, glowMat("#ffc070", "#ff8a2a", 1.4), tp[0] + 0.15, Y + 1.0, tp[1] + 0.44, { noCast: true });
    });
    var walls = [[-C4, C4, -0.55, C4], [0.75, C4, C4, C4], [C4, C4, C4, -C4], [C4, -C4, -C4, -C4], [-C4, -C4, -C4, C4]];
    walls.forEach(function (w) {
      var len = Math.hypot(w[2] - w[0], w[3] - w[1]), ry = -Math.atan2(w[3] - w[1], w[2] - w[0]);
      b.box(len, 0.85, 0.28, M("stoneWarm", len, 0.7), (w[0] + w[2]) / 2, Y, (w[1] + w[3]) / 2, { ry: ry });
      merlons(b, w[0], w[1], w[2], w[3], Y + 0.85, warm, 0.16);
    });
    var GX = 0.1, GZ = C4;
    [-0.55, 0.75].forEach(function (x) { b.box(0.5, 1.5, 0.6, M("stoneWarm", 0.5, 1.4), x, Y, GZ); merlons(b, x - 0.2, GZ + 0.3, x + 0.2, GZ + 0.3, Y + 1.5, warm, 0.15); });
    b.box(0.85, 0.5, 0.5, M("stoneWarm", 0.8, 0.4), GX, Y + 1.0, GZ);
    var gg = new T3.MeshBasicMaterial({ color: lin("#ff8a3d"), transparent: true, opacity: 0.65 });
    b.box(0.78, 1.0, 0.04, C("#1a0d07"), GX, Y, GZ + 0.2, { noCast: true });
    b.box(0.6, 0.85, 0.02, gg, GX, Y, GZ + 0.23, { noCast: true });
    var gl = new T3.PointLight("#ff8a3d", 1.0, 3, 2); gl.position.set(GX, Y + 0.5, GZ + 0.6); b.g.add(gl);
    b.banner(-0.55, GZ + 0.55, Y, "bannerFire", 1.8); b.banner(0.75, GZ + 0.55, Y, "bannerFire", 1.8);
    var FX = 1.25, FZ = -1.4;
    b.box(0.9, 0.8, 0.9, M("stoneWarm", 1, 0.8), FX, Y, FZ);
    b.box(0.32, 2.3, 0.32, M("stoneWarm", 0.3, 2.2), FX + 0.25, Y, FZ - 0.25);
    smokeAt(b, FX + 0.25, Y + 2.4, FZ - 0.25, 6);
    var lv = new T3.PointLight("#ff6a1a", 1.0, 4, 2); lv.position.set(0, 0.5, 0.9); b.g.add(lv);
    b.fx.push(function (t) { lava.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.4; gg.opacity = 0.55 + Math.sin(t * 5) * 0.12; lv.intensity = 0.9 + Math.sin(t * 2) * 0.3; });
  }

  function arcaneEarth(b) {
    b.base(M("grassEarth", 3, 3), M("sideEarth", 3, 1));
    var CX = -0.1, CZ = -0.25;
    b.add(new T3.CylinderGeometry(2.1, 2.2, 0.22, 36), M("stoneGrey", 5, 0.3), CX, 0.11, CZ);
    var tg = new T3.CylinderGeometry(0.95, 1.6, 3.7, 20, 12), tp = tg.attributes.position;
    for (var i = 0; i < tp.count; i++) {
      var x = tp.getX(i), y = tp.getY(i), z = tp.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z);
      var k = 1 + Math.sin(a * 6 + y * 1.1) * 0.08 + (n3(x * 4, y * 2, z * 4) - 0.5) * 0.08; a += y * 0.14;
      tp.setXYZ(i, Math.cos(a) * r * k, y, Math.sin(a) * r * k);
    }
    tg.computeVertexNormals();
    b.add(tg, M("barkTree", 5, 4), CX, 0.22 + 1.85, CZ);
    function rAt(y) { return 1.6 - (y - 0.22) / 3.7 * 0.65; }
    var rootM = M("barkTree", 1, 3);
    for (var rt = 0; rt < 11; rt++) {
      var ra = rt / 11 * 2 * PI + 0.15;
      if (Math.abs(((ra - PI / 4 + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI) < 0.45) continue;
      var pts = [];
      for (var s = 0; s <= 6; s++) { var t = s / 6, rr = 1.35 + t * 1.35, yy = 1.6 * Math.pow(1 - t, 1.5) + 0.06; pts.push(new T3.Vector3(CX + Math.cos(ra + t * 0.3) * rr, yy, CZ + Math.sin(ra + t * 0.3) * rr)); }
      b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 30, 0.2 - (rt % 3) * 0.03, 8, false), rootM, 0, 0, 0);
    }
    var sl = C("#b4b8b6", { flatShading: true }), st = M("stoneGrey", 1.5, 1);
    var fa = new T3.CylinderGeometry(1.68, 1.72, 1.15, 24, 1, true, PI / 4 - 0.75, 1.5);
    b.add(fa, M("stoneGrey", 2, 1, { side: T3.DoubleSide }), CX, 0.22 + 0.575, CZ, { ry: 0 });
    var door = new T3.Group(); door.position.set(CX + Math.cos(PI / 4) * 1.72, 0.22, CZ + Math.sin(PI / 4) * 1.72); door.rotation.y = PI / 4; b.g.add(door);
    b.add(new T3.BoxGeometry(0.2, 1.05, 0.24), sl, -0.5, 0.52, 0.04, { parent: door });
    b.add(new T3.BoxGeometry(0.2, 1.05, 0.24), sl, 0.5, 0.52, 0.04, { parent: door });
    b.add(new T3.BoxGeometry(1.4, 0.26, 0.3), sl, 0, 1.15, 0.04, { parent: door });
    var dsh = new T3.Shape(); dsh.moveTo(-0.4, 0); dsh.lineTo(-0.4, 0.62); dsh.absarc(0, 0.62, 0.4, PI, 0, true); dsh.lineTo(0.4, 0); dsh.closePath();
    var doorM = glowMat("#123a22", "#2dff7a", 0.7);
    b.add(new T3.ShapeGeometry(dsh), doorM, 0, 0, 0.06, { parent: door, noCast: true });
    var dl = new T3.PointLight("#5cff9a", 1.2, 4, 2); dl.position.set(0, 0.6, 0.9); door.add(dl);
    var winM = glowMat("#a6ffc4", "#3cff8a", 1.1);
    [[0.0, 1.65], [1.5, 1.7], [0.7, 2.55], [-0.6, 2.4], [2.1, 2.6], [0.2, 3.3], [1.25, 3.4], [-0.3, 1.55]].forEach(function (w) {
      var r = rAt(w[1]) + 0.03, x = CX + Math.cos(w[0]) * r, z = CZ + Math.sin(w[0]) * r;
      var g = b.add(new T3.CircleGeometry(0.14, 16), winM, x, w[1], z, { noCast: true }); g.lookAt(x + Math.cos(w[0]) * 3, w[1], z + Math.sin(w[0]) * 3);
      var ring = b.add(new T3.TorusGeometry(0.16, 0.04, 6, 16), sl, x, w[1], z); ring.lookAt(x + Math.cos(w[0]) * 3, w[1], z + Math.sin(w[0]) * 3);
    });
    [[2.05, 1.95], [3.0, 1.62]].forEach(function (bl) {
      var BY = bl[0], R = bl[1];
      b.add(new T3.CylinderGeometry(R, R, 0.09, 32), M("plankWarm", 5, 1), CX, BY, CZ);
      for (var p = 0; p < 22; p++) { var q = onRing(R - 0.04, p / 22 * 2 * PI); b.cyl(0.018, 0.018, 0.3, 4, C("#4a3020"), CX + q[0], BY + 0.05, CZ + q[1]); }
      b.add(new T3.TorusGeometry(R - 0.04, 0.02, 5, 56), C("#4a3020"), CX, BY + 0.34, CZ, { rx: PI / 2 });
    });
    var canopy = new T3.Group(); canopy.position.set(CX, 3.75, CZ); b.g.add(canopy);
    [[0, 1.1, 0, 1.2, "#2f6f3c"], [-1.3, 0.6, 0.5, 0.95, "#285f34"], [1.3, 0.55, -0.5, 1.0, "#285f34"], [0.5, 0.5, 1.35, 0.9, "#3b8048"], [-0.6, 0.55, -1.35, 0.92, "#245a31"],
     [-0.4, 1.7, -0.25, 0.8, "#3f8a4c"], [0.7, 1.5, 0.5, 0.72, "#4a9654"], [1.35, 0.95, 0.85, 0.7, "#34763f"], [-1.4, 1.05, -0.65, 0.7, "#2a6236"], [-1.0, 0.85, 1.25, 0.65, "#3b8048"], [1.0, 0.9, -1.3, 0.68, "#2f6f3c"]].forEach(function (c, ci) {
      var ig = new T3.IcosahedronGeometry(c[3], 1), ip = ig.attributes.position;
      for (var q = 0; q < ip.count; q++) { var ax = ip.getX(q), ay = ip.getY(q), az = ip.getZ(q), f = 1 + (n3(ax * 5 + ci, ay * 5, az * 5) - 0.5) * 0.35; ip.setXYZ(q, ax * f, ay * f, az * f); }
      ig.computeVertexNormals();
      b.add(ig, C(c[4], { flatShading: true, roughness: 0.9 }), c[0], c[1], c[2], { parent: canopy });
    });
    var lan = [];
    [[1.6, 0.5], [-1.6, 0.2], [0.4, 1.7], [1.1, -1.4], [-1.1, 1.2], [-0.9, -1.5]].forEach(function (l, li) {
      var pv = new T3.Group(); pv.position.set(l[0], 0.3, l[1]); canopy.add(pv);
      b.add(new T3.CylinderGeometry(0.006, 0.006, 0.6, 4), C("#2a2a2a"), 0, -0.3, 0, { parent: pv, noCast: true });
      b.add(new T3.SphereGeometry(0.08, 10, 8), winM, 0, -0.65, 0, { parent: pv, noCast: true }); lan.push([pv, li]);
    });
    var orbit = new T3.Group(); orbit.position.set(CX, 2.5, CZ); b.g.add(orbit);
    var runeM = glowMat("#9effc0", "#3cff8a", 1.4), shards = [];
    for (var o = 0; o < 6; o++) {
      var a2 = o / 6 * 2 * PI, p2 = onRing(2.35, a2), sh = new T3.Group(); sh.position.set(p2[0], 0, p2[1]); orbit.add(sh);
      b.add(new T3.CylinderGeometry(0.12, 0.17, 0.6, 4), C("#a7adb0", { flatShading: true }), 0, 0, 0, { parent: sh, ry: PI / 4 });
      b.add(new T3.BoxGeometry(0.04, 0.3, 0.2), runeM, 0, 0, 0, { parent: sh, noCast: true, s: [1, 1, 1.1] });
      shards.push([sh, o]);
    }
    var ringM = new T3.MeshBasicMaterial({ color: lin("#5cff9a"), transparent: true, opacity: 0.35, depthWrite: false });
    b.add(new T3.TorusGeometry(2.6, 0.025, 4, 96), ringM, CX, 0.24, CZ, { rx: PI / 2, noCast: true });
    for (var m = 0; m < 10; m++) {
      var a3 = m / 10 * 2 * PI + PI / 10;
      if (Math.abs(((a3 - PI / 4 + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI) < 0.35) continue;
      var p3 = onRing(2.6, a3), h = 0.75 + (m % 2) * 0.2;
      b.add(new T3.CylinderGeometry(0.1, 0.16, h, 4), C("#a7adb0", { flatShading: true }), CX + p3[0], h / 2, CZ + p3[1], { ry: -a3 });
      b.add(new T3.OctahedronGeometry(0.06, 0), runeM, CX + p3[0], h + 0.12, CZ + p3[1], { noCast: true });
    }
    var flyM = new T3.SpriteMaterial({ map: tex("glow"), transparent: true, depthWrite: false, blending: T3.AdditiveBlending }), flies = [];
    for (var fi = 0; fi < 20; fi++) { var fs = new T3.Sprite(flyM); fs.scale.set(0.12, 0.12, 1); b.g.add(fs); flies.push([fs, b.rand() * 6.28, 1.9 + b.rand() * 1.0, 1.0 + b.rand() * 2.6, 0.3 + b.rand() * 0.5]); }
    b.fx.push(function (t, dt) {
      canopy.rotation.z = Math.sin(t * 0.6) * 0.015; orbit.rotation.y += dt * 0.25;
      shards.forEach(function (q) { q[0].position.y = Math.sin(t * 1.1 + q[1]) * 0.15; q[0].rotation.y = -orbit.rotation.y; });
      lan.forEach(function (l) { l[0].rotation.z = Math.sin(t * 1.5 + l[1]) * 0.12; });
      var k = 0.6 + Math.sin(t * 1.5) * 0.2; doorM.emissiveIntensity = k; dl.intensity = 0.9 + k * 0.6; runeM.emissiveIntensity = 1.2 + Math.sin(t * 1.4) * 0.4; ringM.opacity = 0.25 + Math.sin(t * 1.4) * 0.12;
      flies.forEach(function (f) { var a = f[1] + t * f[4]; f[0].position.set(CX + Math.cos(a) * f[2], f[3] + Math.sin(t * 1.3 + f[1]) * 0.25, CZ + Math.sin(a * 1.3) * f[2]); });
    });
    b.banner(-2.45, 2.35, 0, "bannerEarth", 1.8);
    b.pine(2.55, -2.55, 1.0);
  }
  var ARCANE = { air: arcaneAir, water: arcaneWater, fire: arcaneFire, earth: arcaneEarth };
