
  /* ---------- Beast Pens built around each signature creature ---------- */
  function pAirPen(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.6, 1.2, 2.2, 1.8);
    var gold = GOLD();
    b.mound(-0.75, -0.85, 1.35, 1.1, 1.2, "stonePale", 2.5);
    var cave = new T3.Group(); cave.position.set(-0.75 + 0.95 * 0.707, 0, -0.85 + 0.85 * 0.707); cave.rotation.y = PI / 4; b.g.add(cave);
    b.add(new T3.BoxGeometry(1.0, 0.85, 0.5), PALE(1, 0.8), 0, 0.425, -0.05, { parent: cave });
    var ash = new T3.Shape(); ash.moveTo(-0.33, 0); ash.lineTo(-0.33, 0.42); ash.absarc(0, 0.42, 0.33, PI, 0, true); ash.lineTo(0.33, 0); ash.closePath();
    b.add(new T3.ShapeGeometry(ash), C("#1a1408"), 0, 0, 0.205, { parent: cave, noCast: true });
    b.add(new T3.TorusGeometry(0.36, 0.035, 6, 18, PI), gold, 0, 0.42, 0.21, { parent: cave });
    [-1, 1].forEach(function (sg) { b.add(new T3.BoxGeometry(0.07, 0.42, 0.07), gold, sg * 0.36, 0.21, 0.21, { parent: cave }); });
    b.add(new T3.BoxGeometry(1.1, 0.1, 0.6), M("grassAir", 0.6, 0.4), 0, 0.88, -0.05, { parent: cave });
    var cg = new T3.PointLight("#ffd860", 0.6, 2, 2); cg.position.set(0, 0.3, 0.5); cave.add(cg);
    [[1.3, -1.4, 1.3], [-1.75, 0.9, 1.0], [1.75, 0.2, 1.7]].forEach(function (q, i) {
      var fr = new T3.Group(); fr.position.set(q[0], q[2], q[1]); b.g.add(fr);
      b.add(rough(new T3.CylinderGeometry(0.28, 0.04, 0.4, 7, 2), 0.35, i), C("#a59d8e", { flatShading: true }), 0, -0.2, 0, { parent: fr });
      b.add(new T3.CylinderGeometry(0.29, 0.27, 0.06, 7), M("grassAir", 0.4, 0.4), 0, 0.01, 0, { parent: fr });
      var cr = b.add(new T3.OctahedronGeometry(0.07, 0), glowMat("#fff4c8", "#ffd860", 1.5), 0, -0.48, 0, { parent: fr, noCast: true }); cr.scale.set(0.8, 1.5, 0.8);
      b.fx.push(function (t) { fr.position.y = q[2] + Math.sin(t * 1.1 + i * 2) * 0.07; cr.rotation.y = t; });
    });
    var amber = new T3.MeshStandardMaterial({ color: lin("#f2a72e"), emissive: lin("#c06a10"), emissiveIntensity: 0.5, roughness: 0.25, transparent: true, opacity: 0.9 });
    [[-1.6, 1.75], [-1.35, 1.9], [-1.55, 2.05]].forEach(function (q) { b.cyl(0.1, 0.12, 0.22, 10, amber, q[0], 0, q[1]); b.cyl(0.06, 0.06, 0.04, 8, gold, q[0], 0.22, q[1]); });
    [[2.0, 2.0], [0.4, 2.0], [-0.6, 2.0], [2.0, 0.9], [2.0, -0.4]].forEach(function (p) { b.box(0.12, 0.45, 0.12, PALE(0.2, 0.4), p[0], 0, p[1]); b.add(new T3.SphereGeometry(0.06, 8, 6), gold, p[0], 0.49, p[1]); });
    b.beam([0.4, 0.33, 2.0], [2.0, 0.33, 2.0], 0.02, gold); b.beam([2.0, 0.33, 2.0], [2.0, 0.33, -0.4], 0.02, gold);
    b.bear(0.55, 0.55, 0.78, -0.45);
    b.banner(-1.0, 2.05, 0, "bannerAir", 1.45);
    b.oak(-1.85, -1.95, 0.85);
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, -2 + b.rand() * 0.4, "#5a9238");
  }
  function pWaterPen(b) {
    b.slab(4.2, "grassWater", "sideWater"); b.decal("path", 0.8, 1.6, 1.6, 1.0);
    var bz = BRONZE(), CX = -0.15, CZ = -0.2;
    b.add(new T3.CylinderGeometry(1.4, 1.45, 0.24, 32, 1, true), M("stoneBlue", 5, 0.3, { side: T3.DoubleSide }), CX, 0.12, CZ);
    b.add(new T3.TorusGeometry(1.42, 0.06, 6, 48), M("stonePale", 6, 0.2), CX, 0.24, CZ, { rx: PI / 2 });
    var wt = tex("water", 1.4, 1.4);
    b.add(new T3.CircleGeometry(1.38, 40), new T3.MeshStandardMaterial({ map: wt, roughness: 0.1, metalness: 0.25 }), CX, 0.17, CZ, { rx: -PI / 2, noCast: true });
    b.fx.push(function (t) { wt.offset.set(t * 0.03, t * 0.02); });
    var nest = M("wicker", 3, 0.5), sb = M("stoneBlue", 0.5, 1.4);
    [[-0.6, -0.65, 1.45], [0.55, -0.55, 1.05], [-0.15, 0.45, 0.75]].forEach(function (q) {
      b.cyl(0.11, 0.17, q[2], 6, sb, CX + q[0], 0.1, CZ + q[1]);
      b.add(new T3.TorusGeometry(0.11, 0.025, 6, 16), bz, CX + q[0], q[2] * 0.55, CZ + q[1], { rx: PI / 2 });
      b.add(new T3.CylinderGeometry(0.22, 0.17, 0.08, 10), bz, CX + q[0], q[2] + 0.12, CZ + q[1]);
      b.add(new T3.TorusGeometry(0.2, 0.05, 6, 14), nest, CX + q[0], q[2] + 0.17, CZ + q[1], { rx: PI / 2 });
    });
    b.raven(CX - 0.6, 1.62, CZ - 0.65, 1.15, 0.7, false);
    b.raven(CX - 0.15, 0.92, CZ + 0.45, 1.05, 0.9, false);
    var orbit = new T3.Group(); orbit.position.set(CX, 2.4, CZ); b.g.add(orbit);
    var fly = b.raven(0, 0, 0, 1.05, 0, true); b.g.remove(fly); orbit.add(fly); fly.position.set(1.15, 0, 0); fly.rotation.y = PI;
    b.fx.push(function (t) { orbit.rotation.y = t * 0.55; fly.position.y = Math.sin(t * 1.3) * 0.12; fly.rotation.z = -0.25; });
    [[1.85, 1.6], [-1.8, 1.7]].forEach(function (lp) { b.cyl(0.03, 0.04, 0.85, 6, C("#3a2818"), lp[0], 0, lp[1]); b.add(new T3.SphereGeometry(0.07, 12, 10), glowMat("#e8f8ff", "#58c8ff", 1.6), lp[0], 0.92, lp[1], { noCast: true }); b.add(new T3.ConeGeometry(0.09, 0.09, 6), bz, lp[0], 1.03, lp[1]); });
    b.banner(1.75, -1.6, 0, "bannerWater", 1.5);
    b.barrel(1.7, 0.9); b.basket(1.95, 1.1, "#9fb8c8"); b.oak(-1.85, -1.9, 0.9);
  }
  function pFirePen(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var sw = M("stoneWarm", 0.3, 0.3), rs = M("stoneRed", 2, 0.6), PX = -0.15, PZ = -0.25;
    b.box(3.4, 0.08, 3.0, M("dirt", 3, 3), PX, 0, PZ);
    [[-1.7, 1.25, -1.7, -1.75], [-1.7, -1.75, 1.7, -1.75], [1.7, -1.75, 1.7, 1.25]].forEach(function (w) {
      var len = Math.hypot(w[2] - w[0], w[3] - w[1]), ry = -Math.atan2(w[3] - w[1], w[2] - w[0]);
      b.box(len + 0.25, 0.75, 0.25, rs, PX + (w[0] + w[2]) / 2, 0, PZ + (w[1] + w[3]) / 2, { ry: ry });
      merlons(b, PX + w[0], PZ + w[1], PX + w[2], PZ + w[3], 0.75, sw, 0.16);
    });
    [-1.7, 1.7].forEach(function (x) { b.box(0.4, 1.1, 0.4, M("stoneWarm", 0.4, 1), PX + x, 0, PZ + 1.25); b.cyl(0.16, 0.1, 0.12, 10, M("iron"), PX + x, 1.1, PZ + 1.25); b.fire(PX + x, 1.22, PZ + 1.25, 0.45, 0.5); });
    for (var i = -6; i <= 6; i++) if (Math.abs(i) > 1) b.box(0.025, 0.85, 0.025, M("iron"), PX + i * 0.24, 0, PZ + 1.25);
    [0.2, 0.75].forEach(function (y) { b.box(3.0, 0.03, 0.03, M("iron"), PX, y, PZ + 1.25); });
    b.add(new T3.CylinderGeometry(0.55, 0.55, 0.04, 20), glowMat("#ff8a3a", "#ff4a10", 1.3), PX - 0.9, 0.06, PZ - 0.95, { noCast: true });
    b.add(new T3.TorusGeometry(0.58, 0.07, 6, 24), C("#3a322e", { flatShading: true }), PX - 0.9, 0.08, PZ - 0.95, { rx: PI / 2 });
    var pl = new T3.PointLight("#ff6a1a", 0.9, 2.5, 2); pl.position.set(PX - 0.9, 0.4, PZ - 0.95); b.g.add(pl);
    b.add(rough(new T3.CylinderGeometry(0.75, 0.95, 0.45, 9, 2), 0.25, 3), C("#7a6a5e", { flatShading: true }), PX + 0.25, 0.225, PZ + 0.0);
    var lion = b.lion(PX + 0.25, PZ + 0.0, 0.85, 0.5); lion.position.y = 0.45;
    b.banner(PX - 1.25, PZ + 1.75, 0, "bannerFire", 1.55); b.banner(PX + 1.25, PZ + 1.75, 0, "bannerFire", 1.55);
    b.hay(1.85, 1.75, 0.3);
  }
  function pEarthPen(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var CX = -0.1, CZ = -0.15;
    b.add(new T3.CylinderGeometry(1.5, 1.55, 0.06, 32), M("grassEarth", 1.6, 1.6, { color: lin("#7a9a70") }), CX, 0.03, CZ);
    var st = SLATE(), rune = glowMat("#9effc0", "#3cff8a", 1.3);
    for (var i = 0; i < 8; i++) {
      var a = i * PI / 4 + PI / 8, p = onRing(1.7, a), h = 0.8 + (i % 2) * 0.3;
      b.add(new T3.CylinderGeometry(0.11, 0.18, h, 4), st, CX + p[0], h / 2, CZ + p[1], { ry: -a + PI / 4 });
      b.box(0.035, h * 0.4, 0.02, rune, CX + p[0] + 0.1, h * 0.25, CZ + p[1] + 0.1, { ry: PI / 4, noCast: true });
    }
    var rootM = M("barkTree", 1, 3);
    [0.6, 2.2, 3.8, 5.3].forEach(function (a, k) {
      var p0 = onRing(1.6, a), p1 = onRing(1.6, a + 2.4), mid = onRing(0.3, a + 1.2);
      var pts = [new T3.Vector3(CX + p0[0], 0, CZ + p0[1]), new T3.Vector3(CX + (p0[0] + mid[0]) / 2, 1.3, CZ + (p0[1] + mid[1]) / 2), new T3.Vector3(CX + mid[0], 1.75 + k * 0.05, CZ + mid[1]), new T3.Vector3(CX + (p1[0] + mid[0]) / 2, 1.3, CZ + (p1[1] + mid[1]) / 2), new T3.Vector3(CX + p1[0], 0, CZ + p1[1])];
      if (k % 2) b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 40, 0.07, 6, false), rootM, 0, 0, 0);
    });
    b.serpent(CX, CZ, 0.95, 0.6);
    b.mushrooms([[-1.9, 1.2], [-1.75, 1.35], [1.85, -0.6], [1.0, 1.85], [1.15, 1.75]], capGlow());
    b.banner(1.95, 1.35, 0, "bannerEarth", 1.5);
    b.pine(1.9, -1.9, 1.0); b.pine(-1.95, -1.85, 0.85);
  }
  MYTH.air[5] = pAirPen; MYTH.water[5] = pWaterPen; MYTH.fire[5] = pFirePen; MYTH.earth[5] = pEarthPen;
