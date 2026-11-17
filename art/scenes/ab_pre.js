
  /* ================= MYTHIC AGE BUILDINGS ================= */
  TEX.stonePale = [256, 256, stone("#ded7c7", "#8c8272", 6, 3)];
  TEX.stoneRed = [256, 256, stone("#b4553e", "#4a2018", 7, 4)];
  TEX.drop = [64, 64, dot("rgba(235,250,255,1)", "rgba(120,200,255,0)")];
  function glowMat(col, em, k) { return new T3.MeshStandardMaterial({ color: lin(col), emissive: lin(em), emissiveIntensity: k == null ? 1 : k, roughness: 0.5 }); }
  function rough(geo, amt, seed) {
    var p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + (n3(x * 3 + seed, y * 3, z * 3) - 0.5) * amt; p.setXYZ(i, x * k, y, z * k); }
    geo.computeVertexNormals(); return geo;
  }
  function onRing(r, a) { return [Math.cos(a) * r, Math.sin(a) * r]; }
  function merlons(b, x0, z0, x1, z1, y, mat, size) {
    var dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz), n = Math.max(2, Math.round(len / 0.32)), ry = -Math.atan2(dz, dx);
    for (var i = 0; i <= n; i += 2) b.box(size || 0.16, 0.18, 0.18, mat, x0 + dx * i / n, y, z0 + dz * i / n, { ry: ry });
  }
  var PALE = function (rx, ry) { return M("stonePale", rx, ry); };
  var GOLD = function () { return C("#e8bf45", { metalness: 0.65, roughness: 0.3 }); };
  var BRONZE = function () { return C("#c08a4a", { metalness: 0.75, roughness: 0.3 }); };
  var MARBLE = function () { return C("#eef1f2", { roughness: 0.6 }); };
  var REDGOLD = function () { return C("#e3a83a", { metalness: 0.7, roughness: 0.3 }); };
  var SLATE = function () { return C("#a7adb0", { flatShading: true, roughness: 0.8 }); };

  B.prototype.crystal = function (x, y, z, s, col, em, light) {
    var m = this.add(new T3.OctahedronGeometry(s, 0), glowMat(col || "#fff4c8", em || "#ffd860", 1.5), x, y, z, { noCast: true });
    m.scale.set(0.8, 1.5, 0.8);
    var L = null; if (light) { L = new T3.PointLight(em || "#ffd860", light, 3, 2); L.position.set(x, y, z); this.g.add(L); }
    var ph = this.rand() * 6;
    this.fx.push(function (t) { m.position.y = y + Math.sin(t * 1.5 + ph) * 0.06; m.rotation.y = t * 0.9 + ph; if (L) L.position.y = m.position.y; });
    return m;
  };
  B.prototype.tent = function (x, y, z, r, h, seg) {
    this.add(new T3.ConeGeometry(r, h, seg || 16), M("canvas", 4, 1, { side: T3.DoubleSide }), x, y + h / 2, z);
    this.add(new T3.TorusGeometry(r * 0.96, 0.03, 6, 32), GOLD(), x, y + 0.02, z, { rx: PI / 2 });
  };
  B.prototype.cylWindows = function (cx, cz, r, y, angles, w, h, mat) {
    angles.forEach(function (a) {
      var p = onRing(r + 0.01, a);
      var m = this.add(new T3.PlaneGeometry(w, h), mat, cx + p[0], y, cz + p[1], { noCast: true });
      m.lookAt(cx + p[0] * 3, y, cz + p[1] * 3);
    }, this);
  };
  B.prototype.vanes = function (x, y, z, s) {
    var g = new T3.Group(); g.position.set(x, y, z); this.g.add(g);
    var sm = M("canvas", 1, 1, { side: T3.DoubleSide }), d = C("#3e2817");
    for (var v = 0; v < 3; v++) {
      var vg = new T3.Group(); vg.rotation.y = v * 2 * PI / 3; g.add(vg);
      this.add(new T3.CylinderGeometry(0.3 * s, 0.3 * s, 0.6 * s, 8, 1, true, 0, PI * 0.55), sm, 0.24 * s, 0, 0, { parent: vg });
      this.add(new T3.BoxGeometry(0.5 * s, 0.025, 0.025), d, 0.25 * s, 0.3 * s, 0, { parent: vg });
    }
    this.fx.push(function (t, dt) { g.rotation.y += dt * 1.3; });
  };
  B.prototype.target = function (x, z, ry) {
    var grp = new T3.Group(); grp.position.set(x, 0, z); grp.rotation.y = ry || 0; this.g.add(grp);
    var w = C("#5a3d24");
    this.beam([-0.15, 0, -0.12], [-0.08, 0.6, 0.02], 0.025, w, grp); this.beam([0.15, 0, -0.12], [0.08, 0.6, 0.02], 0.025, w, grp);
    this.beam([0, 0, -0.25], [0, 0.55, 0], 0.025, w, grp);
    [[0.26, "#e6d3a0"], [0.2, "#c0392b"], [0.13, "#f2efe6"], [0.06, "#e8bf45"]].forEach(function (r, i) {
      this.add(new T3.CylinderGeometry(r[0], r[0], 0.06 + i * 0.008, 20), C(r[1]), 0, 0.55, 0.05, { parent: grp, rx: PI / 2 - 0.2 });
    }, this);
  };
  B.prototype.eagle = function (x, y, z, s, ry, fly) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; g.scale.set(s, s, s); this.g.add(g);
    var br = C("#7a5232", { flatShading: true }), wh = C("#f2ece0", { flatShading: true }), yl = C("#e8b83a");
    this.add(new T3.SphereGeometry(0.16, 10, 8), br, 0, 0.18, 0, { parent: g, s: [0.85, 0.85, 1.5] });
    this.add(new T3.SphereGeometry(0.1, 10, 8), wh, 0, 0.3, 0.22, { parent: g });
    this.add(new T3.ConeGeometry(0.035, 0.09, 6), yl, 0, 0.28, 0.33, { parent: g, rx: PI / 2 });
    this.add(new T3.BoxGeometry(0.16, 0.02, 0.18), br, 0, 0.17, -0.3, { parent: g, rx: 0.2 });
    var sh = new T3.Shape(); sh.moveTo(0, 0.08); sh.lineTo(0.35, 0.1); sh.lineTo(0.62, 0.02); sh.lineTo(0.55, -0.04); sh.lineTo(0.45, -0.02); sh.lineTo(0.38, -0.08); sh.lineTo(0.25, -0.06); sh.lineTo(0.15, -0.12); sh.lineTo(0, -0.08);
    var wings = [];
    [-1, 1].forEach(function (sg) {
      var pv = new T3.Group(); pv.position.set(sg * 0.1, 0.22, 0); g.add(pv);
      var w = this.add(new T3.ShapeGeometry(sh), C("#6a4428", { side: T3.DoubleSide, flatShading: true }), 0, 0, 0, { parent: pv, rx: -PI / 2 });
      pv.scale.x = sg; wings.push(pv);
    }, this);
    if (!fly) [-0.05, 0.05].forEach(function (lx) { this.add(new T3.CylinderGeometry(0.015, 0.015, 0.1, 5), yl, lx, 0.05, 0, { parent: g }); }, this);
    var ph = this.rand() * 6;
    this.fx.push(function (t) {
      var f = fly ? Math.sin(t * 6 + ph) * 0.55 : (Math.sin(t * 0.7 + ph) > 0.85 ? Math.sin(t * 9) * 0.6 : -1.15);
      wings.forEach(function (w) { w.rotation.z = f; });
    });
    return g;
  };
  B.prototype.drake = function (x, y, z, s, ry) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; g.scale.set(s, s, s); this.g.add(g);
    var sk = C("#a8321f", { flatShading: true }), bel = C("#e8a03a", { flatShading: true }), dk = C("#5a1a12", { flatShading: true, side: T3.DoubleSide });
    this.add(new T3.SphereGeometry(0.3, 12, 8), sk, 0, 0.42, 0, { parent: g, s: [0.85, 0.75, 1.4] });
    this.add(new T3.SphereGeometry(0.22, 10, 8), bel, 0, 0.32, 0.05, { parent: g, s: [0.8, 0.6, 1.3] });
    var neckPts = [new T3.Vector3(0, 0.5, 0.3), new T3.Vector3(0, 0.75, 0.45), new T3.Vector3(0, 0.95, 0.5)];
    this.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(neckPts), 10, 0.1, 7), sk, 0, 0, 0, { parent: g });
    var head = new T3.Group(); head.position.set(0, 0.98, 0.52); g.add(head);
    this.add(new T3.BoxGeometry(0.2, 0.16, 0.3), sk, 0, 0, 0.08, { parent: head });
    this.add(new T3.BoxGeometry(0.16, 0.08, 0.16), sk, 0, -0.06, 0.24, { parent: head });
    [-1, 1].forEach(function (sg) {
      this.add(new T3.ConeGeometry(0.03, 0.18, 5), C("#f2e6c8"), sg * 0.07, 0.12, -0.04, { parent: head, rx: -0.6 });
      this.add(new T3.SphereGeometry(0.025, 6, 5), glowMat("#ffe08a", "#ffb030", 1.5), sg * 0.09, 0.03, 0.14, { parent: head, noCast: true });
    }, this);
    var tailPts = [new T3.Vector3(0, 0.4, -0.35), new T3.Vector3(0.15, 0.25, -0.7), new T3.Vector3(0.05, 0.12, -1.0), new T3.Vector3(-0.15, 0.08, -1.2)];
    this.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(tailPts), 14, 0.06, 6), sk, 0, 0, 0, { parent: g });
    [[-0.17, 0.22], [0.17, 0.22], [-0.17, -0.22], [0.17, -0.22]].forEach(function (l) { this.add(new T3.CylinderGeometry(0.05, 0.04, 0.3, 6), sk, l[0], 0.15, l[1], { parent: g }); }, this);
    var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(0.75, 0.3); sh.lineTo(0.62, 0.05); sh.lineTo(0.48, 0.1); sh.lineTo(0.4, -0.08); sh.lineTo(0.25, -0.02); sh.lineTo(0.12, -0.2); sh.closePath();
    var wings = [];
    [-1, 1].forEach(function (sg) { var pv = new T3.Group(); pv.position.set(sg * 0.18, 0.6, 0.05); pv.scale.x = sg; g.add(pv); this.add(new T3.ShapeGeometry(sh), dk, 0, 0, 0, { parent: pv, rx: -PI / 2 + 0.3 }); wings.push(pv); }, this);
    var fm = new T3.MeshBasicMaterial({ color: lin("#ff8a2a"), transparent: true, opacity: 0.85, blending: T3.AdditiveBlending, depthWrite: false });
    var fm2 = new T3.MeshBasicMaterial({ color: lin("#ffe08a"), transparent: true, opacity: 0.9, blending: T3.AdditiveBlending, depthWrite: false });
    var breath = new T3.Group(); breath.position.set(0, -0.05, 0.32); head.add(breath);
    this.add(new T3.ConeGeometry(0.12, 0.6, 10), fm, 0, 0, 0.3, { parent: breath, rx: -PI / 2, noCast: true, noReceive: true });
    this.add(new T3.ConeGeometry(0.06, 0.4, 10), fm2, 0, 0, 0.2, { parent: breath, rx: -PI / 2, noCast: true, noReceive: true });
    var L = new T3.PointLight("#ff8a3d", 0, 3, 2); L.position.set(0, 0, 0.5); head.add(L);
    this.fx.push(function (t) {
      var c = (t % 4.5) / 4.5, on = c > 0.6 ? Math.sin((c - 0.6) / 0.4 * PI) : 0;
      breath.scale.set(0.4 + on, 0.4 + on, 0.05 + on * 1.4 + Math.sin(t * 30) * 0.05 * on); breath.visible = on > 0.02;
      L.intensity = on * 2.2;
      head.rotation.x = -0.2 + Math.sin(t * 0.8) * 0.12 - on * 0.15;
      wings.forEach(function (w) { w.rotation.z = 0.2 + Math.sin(t * 1.2) * 0.12 + on * 0.25; });
    });
    return g;
  };
  B.prototype.stag = function (x, z, s, ry) {
    var g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; g.scale.set(s, s, s); this.g.add(g);
    var fur = C("#8a5a34", { flatShading: true }), lt = C("#d8c0a0", { flatShading: true }), ant = C("#e8dcc0", { flatShading: true });
    this.add(new T3.SphereGeometry(0.3, 10, 8), fur, 0, 0.75, 0, { parent: g, s: [0.75, 0.75, 1.5] });
    this.add(new T3.SphereGeometry(0.1, 8, 6), lt, 0, 0.82, -0.42, { parent: g });
    [[-0.13, 0.28], [0.13, 0.28], [-0.13, -0.3], [0.13, -0.3]].forEach(function (l) { this.add(new T3.CylinderGeometry(0.04, 0.03, 0.62, 6), fur, l[0], 0.31, l[1], { parent: g }); }, this);
    var neck = new T3.Group(); neck.position.set(0, 0.9, 0.32); g.add(neck);
    this.add(new T3.CylinderGeometry(0.09, 0.13, 0.5, 8), fur, 0, 0.2, 0.08, { parent: neck, rx: 0.5 });
    var head = new T3.Group(); head.position.set(0, 0.45, 0.22); neck.add(head);
    this.add(new T3.SphereGeometry(0.11, 8, 6), fur, 0, 0, 0.06, { parent: head, s: [0.9, 0.9, 1.5] });
    this.add(new T3.SphereGeometry(0.04, 6, 5), C("#2a1a12"), 0, -0.03, 0.22, { parent: head });
    [-1, 1].forEach(function (sg) {
      this.beam([sg * 0.05, 0.08, 0], [sg * 0.2, 0.42, -0.08], 0.02, ant, head);
      this.beam([sg * 0.13, 0.25, -0.04], [sg * 0.28, 0.32, 0.06], 0.014, ant, head);
      this.beam([sg * 0.18, 0.36, -0.07], [sg * 0.24, 0.55, -0.02], 0.014, ant, head);
      this.beam([sg * 0.2, 0.42, -0.08], [sg * 0.36, 0.5, -0.18], 0.014, ant, head);
      this.add(new T3.ConeGeometry(0.04, 0.1, 5), fur, sg * 0.1, 0.06, -0.05, { parent: head, rz: -sg * 1.0 });
    }, this);
    var ph = this.rand() * 6;
    this.fx.push(function (t) { var c = (Math.sin(t * 0.5 + ph) + 1) / 2; neck.rotation.x = c * 1.1; });
    return g;
  };

  /* ---------------- Hufflepuff ---------------- */
  function mAirHouse(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.0, 1.2, 0.8, 1.0);
    var gold = GOLD(), CX = -0.05, CZ = -0.15;
    b.add(new T3.CylinderGeometry(1.0, 1.08, 0.2, 24), [PALE(3, 0.2), PALE(2, 2), PALE(2, 2)], CX, 0.1, CZ);
    b.add(new T3.CylinderGeometry(0.78, 0.82, 0.85, 18), PALE(3, 1), CX, 0.625, CZ);
    b.tent(CX, 1.05, CZ, 1.05, 0.9, 18);
    var win = glowMat("#ffe39a", "#ffb23e", 1);
    b.cylWindows(CX, CZ, 0.8, 0.7, [PI / 4 - 0.8, PI / 4 + 0.8, -0.4], 0.16, 0.28, win);
    b.door(CX, 0.2, CZ + 0.8, 0, 0.34, 0.56);
    b.box(0.46, 0.05, 0.06, gold, CX, 0.78, CZ + 0.82);
    b.cyl(0.02, 0.02, 0.5, 6, C("#3e2817"), CX, 1.9, CZ);
    b.vanes(CX, 2.2, CZ, 0.8);
    b.crystal(CX + 0.6, 2.25, CZ + 0.1, 0.11, null, null, 0.6);
    b.hay(-1.15, 1.0, 0.4); b.barrel(1.05, 0.95); b.bush(-1.2, -1.2, 0.16); b.oak(1.15, -1.1, 0.7);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 1.0 + b.rand() * 0.5, "#5a9238");
  }
  function mAirFarm(b) {
    b.slab(4.2, "grassAir", "sideAir");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.1, 0, 0.1);
    b.wheat(-1.25, -0.6, 1.45, 1.45, 6, 9, ["#d9b84a", "#c8a83e", "#e6cc6a"]);
    var gold = GOLD();
    [[-1.5, 1.7], [1.7, 1.7], [1.7, -1.5], [-1.5, -1.5]].forEach(function (p) { b.box(0.12, 0.42, 0.12, PALE(0.2, 0.4), p[0], 0, p[1]); b.add(new T3.SphereGeometry(0.06, 8, 6), gold, p[0], 0.46, p[1]); });
    b.beam([-1.5, 0.3, 1.7], [-0.3, 0.3, 1.7], 0.02, gold); b.beam([0.5, 0.3, 1.7], [1.7, 0.3, 1.7], 0.02, gold); b.beam([1.7, 0.3, 1.7], [1.7, 0.3, -1.5], 0.02, gold);
    var isl = new T3.Group(); isl.position.set(-0.55, 1.55, -0.95); b.g.add(isl);
    b.add(rough(new T3.CylinderGeometry(0.85, 0.08, 1.0, 9, 3), 0.3, 5), C("#a59d8e", { flatShading: true }), 0, -0.5, 0, { parent: isl });
    b.add(new T3.CylinderGeometry(0.88, 0.84, 0.1, 9), [M("sideAir", 2, 0.4), M("soil", 1, 1), M("soil", 1, 1)], 0, 0.02, 0, { parent: isl });
    b.lift(0, function () { var keep = this.g; this.g = isl; this.cabbages(-0.55, -0.55, 0.55, 0.55, 3, 3, "#6fae4a", 0.07); this.g = keep; });
    var ic = b.add(new T3.OctahedronGeometry(0.13, 0), glowMat("#fff4c8", "#ffd860", 1.5), 0, -1.15, 0, { parent: isl, noCast: true }); ic.scale.set(0.8, 1.5, 0.8);
    var il = new T3.PointLight("#ffd860", 0.8, 2.5, 2); il.position.set(0, -0.9, 0); isl.add(il);
    b.fx.push(function (t) { isl.position.y = 1.55 + Math.sin(t * 0.9) * 0.06; ic.rotation.y = t; });
    var TX = 1.55, TZ = -1.55;
    b.cyl(0.26, 0.34, 1.8, 12, PALE(1, 1.6), TX, 0, TZ);
    b.add(new T3.TorusGeometry(0.3, 0.025, 6, 20), gold, TX, 1.8, TZ, { rx: PI / 2 });
    b.cyl(0.02, 0.02, 0.4, 6, C("#3e2817"), TX, 1.8, TZ);
    b.vanes(TX, 2.25, TZ, 0.9);
    b.hay(-1.9, 1.85, 0.3); b.basket(-1.6, 1.95, "#e6cc6a"); b.bush(-1.95, -1.9, 0.17);
    for (var i = 0; i < 12; i++) b.tuft(-2 + b.rand() * 4, 1.8 + b.rand() * 0.3, "#5a9238");
  }
  function mAirStore(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.3, 1.15, 1.2, 1.0);
    var gold = GOLD(), CX = -0.45, CZ = -0.45;
    b.add(new T3.CylinderGeometry(0.85, 0.9, 0.16, 20), [PALE(3, 0.2), PALE(2, 2), PALE(2, 2)], CX, 0.08, CZ);
    b.add(new T3.CylinderGeometry(0.68, 0.72, 1.0, 16), PALE(3, 1.2), CX, 0.66, CZ);
    b.tent(CX, 1.16, CZ, 0.95, 0.85, 16);
    b.door(CX + 0.5, 0.16, CZ + 0.5, PI / 4, 0.4, 0.62);
    b.cylWindows(CX, CZ, 0.7, 0.85, [PI / 4 + 0.9, PI / 4 - 0.9], 0.14, 0.24, glowMat("#ffe39a", "#ffb23e", 1));
    var plat = new T3.Group(); plat.position.set(0.7, 1.05, 0.55); b.g.add(plat);
    b.add(new T3.BoxGeometry(0.95, 0.12, 0.75), PALE(1, 0.8), 0, 0, 0, { parent: plat });
    b.add(new T3.BoxGeometry(1.0, 0.03, 0.8), gold, 0, 0.075, 0, { parent: plat });
    var keep = b.g; b.g = plat;
    b.lift(0.09, function () { this.crate(-0.2, -0.1, 0.3, 0.2); this.crate(0.2, 0.1, 0.24, -0.3); this.sack(0.25, -0.2, 0, "#c9a86a"); this.gold(-0.25, 0.2); });
    b.g = keep;
    var pc = b.add(new T3.OctahedronGeometry(0.11, 0), glowMat("#fff4c8", "#ffd860", 1.5), 0, -0.35, 0, { parent: plat, noCast: true }); pc.scale.set(0.8, 1.5, 0.8);
    b.fx.push(function (t) { plat.position.y = 1.05 + Math.sin(t * 1.1) * 0.06; plat.rotation.y = Math.sin(t * 0.4) * 0.08; pc.rotation.y = t; });
    b.logs(-1.25, 0.9, 0.3); b.gold(0.9, -0.6); b.sack(1.15, -0.4, 0, "#c9a86a");
    b.pennant(CX, 2.0, CZ, "#e8bf45", 0.4);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 1.1 + b.rand() * 0.4, "#5a9238");
  }
  function mAirBarracks(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.3, 1.25, 2.6, 1.6);
    var gold = GOLD(), HX = -0.3, HZ = -0.6, pale = PALE(3, 1);
    b.add(new T3.BoxGeometry(3.1, 0.22, 2.0), [PALE(2, 0.2), PALE(2, 0.2), PALE(2, 1.4), PALE(1, 1), PALE(2, 0.2), PALE(2, 0.2)], HX, 0.11, HZ);
    b.box(2.6, 1.05, 1.3, pale, HX, 0.22, HZ - 0.1);
    b.box(2.72, 0.08, 1.42, gold, HX, 1.27, HZ - 0.1);
    for (var c = 0; c < 6; c++) { var x = HX - 1.25 + c * 0.5; b.cyl(0.06, 0.07, 1.05, 10, MARBLE(), x, 0.22, HZ + 0.78); b.box(0.15, 0.05, 0.15, gold, x, 1.25, HZ + 0.78); }
    b.box(2.72, 0.1, 0.3, PALE(2, 0.2), HX, 1.27, HZ + 0.72);
    b.gable({ len: 2.6, wid: 1.6, rise: 0.85, over: 0.18, mat: M("canvas", 2.4, 1, { side: T3.DoubleSide }), gmat: PALE(1.5, 0.6), x: HX, y: 1.35, z: HZ + 0.05, ridge: gold });
    b.door(HX, 0.22, HZ + 0.56, 0, 0.55, 0.78);
    [-0.8, 0.8].forEach(function (dx) { b.window(HX + dx, 0.75, HZ + 0.57, 0, 0.26, 0.32, "#ffe39a", "#ffb23e", "#e3b437"); });
    b.crystal(HX, 2.6, HZ + 0.05, 0.12, null, null, 0.7);
    b.banner(HX - 0.55, HZ + 1.15, 0, "bannerAir", 1.55); b.banner(HX + 0.55, HZ + 1.15, 0, "bannerAir", 1.55);
    b.target(1.35, 1.5, 0.5); b.target(1.85, 1.0, 0.7);
    b.windsock(1.8, -1.6, 1.6);
    b.rack(-1.3, 1.45, 0.2, "spear"); b.pine(-1.85, -1.85, 0.9); b.bush(-1.9, 0.6, 0.16);
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, 1.7 + b.rand() * 0.3, "#5a9238");
  }
  function mAirTower(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var gold = GOLD();
    b.add(new T3.CylinderGeometry(0.85, 0.92, 0.22, 20), [PALE(3, 0.2), PALE(2, 2), PALE(2, 2)], 0, 0.11, 0);
    b.cyl(0.48, 0.6, 1.9, 16, PALE(2.5, 2), 0, 0.22, 0);
    b.add(new T3.TorusGeometry(0.5, 0.035, 6, 24), gold, 0, 2.1, 0, { rx: PI / 2 });
    b.door(0.42, 0.22, 0.42, PI / 4, 0.3, 0.52);
    b.cylWindows(0, 0, 0.53, 1.45, [PI / 4], 0.12, 0.26, glowMat("#ffe39a", "#ffb23e", 1));
    b.crystal(0, 2.35, 0, 0.13, null, null, 0.9);
    var crown = new T3.Group(); crown.position.set(0, 2.75, 0); b.g.add(crown);
    b.add(new T3.CylinderGeometry(0.66, 0.5, 0.18, 16), PALE(2, 0.3), 0, 0, 0, { parent: crown });
    for (var c = 0; c < 6; c++) { var p = onRing(0.55, c * PI / 3 + PI / 6); b.add(new T3.CylinderGeometry(0.035, 0.035, 0.42, 6), MARBLE(), p[0], 0.3, p[1], { parent: crown }); }
    b.add(new T3.ConeGeometry(0.72, 0.6, 16), M("canvas", 3, 1, { side: T3.DoubleSide }), 0, 0.81, 0, { parent: crown });
    b.add(new T3.TorusGeometry(0.69, 0.03, 6, 28), gold, 0, 0.52, 0, { parent: crown, rx: PI / 2 });
    var cc = b.add(new T3.OctahedronGeometry(0.08, 0), glowMat("#fff4c8", "#ffd860", 1.6), 0, 1.22, 0, { parent: crown, noCast: true }); cc.scale.set(0.8, 1.5, 0.8);
    var cl = new T3.PointLight("#ffd860", 0.6, 2, 2); cl.position.set(0, 0.3, 0); crown.add(cl);
    b.fx.push(function (t) { crown.position.y = 2.75 + Math.sin(t * 1.1) * 0.06; crown.rotation.y = t * 0.15; cc.rotation.y = t * 1.5; });
    b.hay(-1.1, 0.95, 0.2); b.bush(-1.2, -1.1, 0.15); b.rock(1.2, 1.1, 0.12);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 0.9 + b.rand() * 0.6, "#5a9238");
  }
  function mAirPen(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.3, 1.3, 2.4, 1.6);
    var gold = GOLD();
    b.add(new T3.CylinderGeometry(1.9, 1.95, 0.12, 32), [PALE(4, 0.2), M("dirt", 2, 2), M("dirt", 2, 2)], 0, 0.06, -0.1);
    for (var w = 0; w < 14; w++) { var a = PI * 0.95 + w / 13 * PI * 1.1, p = onRing(1.85, a); b.box(0.28, 0.42, 0.18, PALE(0.3, 0.4), p[0], 0.12, p[1] - 0.1, { ry: -a + PI / 2 }); }
    var nest = M("wicker", 3, 0.5);
    [[-0.6, -0.9, 1.6], [0.7, -0.6, 1.15], [-0.05, 0.35, 0.8]].forEach(function (q, i) {
      b.cyl(0.13, 0.2, q[2], 6, PALE(0.5, 1.4), q[0], 0.12, q[1]);
      b.add(new T3.TorusGeometry(0.22, 0.07, 6, 14), nest, q[0], q[2] + 0.17, q[1], { rx: PI / 2 });
      if (i === 1) [0, 1, 2].forEach(function (e) { b.add(new T3.SphereGeometry(0.05, 8, 6), C("#f2ece0"), q[0] + Math.cos(e * 2) * 0.07, q[2] + 0.2, q[1] + Math.sin(e * 2) * 0.07, { s: [1, 1.3, 1] }); });
    });
    b.eagle(-0.6, 1.79, -0.9, 1.3, 0.6, false);
    b.eagle(-0.05, 0.99, 0.35, 1.1, 1.2, false);
    var orbit = new T3.Group(); orbit.position.set(0, 2.9, -0.2); b.g.add(orbit);
    var fly = b.eagle(1.3, 0, 0, 1.2, 0, true); b.g.remove(fly); orbit.add(fly); fly.position.set(1.2, 0, 0); fly.rotation.y = PI;
    b.fx.push(function (t) { orbit.rotation.y = t * 0.5; fly.position.y = Math.sin(t * 1.2) * 0.15; });
    b.box(0.8, 0.18, 0.3, M("plankWarm", 0.8, 0.3), 1.2, 0.12, 0.9);
    b.hay(1.75, 1.6, 0.4); b.hay(-1.7, 1.65, -0.3);
    b.banner(-0.4, 1.95, 0, "bannerAir", 1.5);
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, 1.75 + b.rand() * 0.3, "#5a9238");
  }
  function mAirSanctum(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.8, 0.8, 1.6, 1.6, PI / 4);
    var gold = GOLD();
    b.add(new T3.CylinderGeometry(1.75, 1.85, 0.18, 32), [PALE(5, 0.2), PALE(3, 3), PALE(3, 3)], 0, 0.09, 0);
    b.add(new T3.CylinderGeometry(1.45, 1.5, 0.16, 32), [PALE(5, 0.2), PALE(3, 3), PALE(3, 3)], 0, 0.26, 0);
    b.add(new T3.RingGeometry(0.55, 0.65, 6), glowMat("#fff2b8", "#ffd860", 0.9), 0, 0.345, 0, { rx: -PI / 2, noCast: true });
    for (var c = 0; c < 8; c++) { var p = onRing(1.3, c * PI / 4 + PI / 8); b.cyl(0.08, 0.09, 1.6, 10, MARBLE(), p[0], 0.34, p[1]); b.box(0.2, 0.06, 0.2, gold, p[0], 1.92, p[1]); }
    b.add(new T3.TorusGeometry(1.3, 0.1, 4, 40), PALE(6, 0.3), 0, 2.02, 0, { rx: PI / 2 });
    for (var r = 0; r < 4; r++) b.add(new T3.TorusGeometry(1.3, 0.025, 6, 32, PI), gold, 0, 2.05, 0, { ry: r * PI / 4 });
    var core = new T3.Group(); core.position.set(0, 1.25, 0); b.g.add(core);
    var big = b.add(new T3.OctahedronGeometry(0.3, 0), glowMat("#fff4c8", "#ffd860", 1.7), 0, 0, 0, { parent: core, noCast: true }); big.scale.set(0.8, 1.5, 0.8);
    var r1 = b.add(new T3.TorusGeometry(0.55, 0.025, 6, 40), gold, 0, 0, 0, { parent: core }), r2 = b.add(new T3.TorusGeometry(0.7, 0.02, 6, 40), gold, 0, 0, 0, { parent: core });
    var L = new T3.PointLight("#ffd860", 1.6, 4.5, 2); core.add(L);
    var motes = [];
    for (var m = 0; m < 14; m++) { var sp = new T3.Sprite(new T3.SpriteMaterial({ map: tex("ember"), color: lin("#fff6d0"), transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); sp.scale.set(0.07, 0.07, 1); b.g.add(sp); motes.push([sp, b.rand() * 6.28, 0.35 + b.rand() * 0.6, b.rand()]); }
    b.fx.push(function (t) {
      core.position.y = 1.25 + Math.sin(t * 1.2) * 0.08; big.rotation.y = t * 0.8;
      r1.rotation.x = t * 0.9; r1.rotation.y = 0.5; r2.rotation.y = t * 0.6; r2.rotation.x = 1.2 + Math.sin(t) * 0.2;
      L.intensity = 1.5 + Math.sin(t * 1.6) * 0.3;
      motes.forEach(function (q) { var k = (t * 0.3 + q[3]) % 1, a = q[1] + t * 1.2; q[0].position.set(Math.cos(a) * q[2], 0.4 + k * 1.8, Math.sin(a) * q[2]); q[0].material.opacity = Math.sin(k * PI); });
    });
    b.banner(-1.0, 1.7, 0, "bannerAir", 1.5); b.banner(1.7, -1.0, 0, "bannerAir", 1.5);
    b.oak(-1.85, -1.8, 0.95); b.bush(1.9, 1.9, 0.16);
    for (var i = 0; i < 12; i++) { var tx = -2 + b.rand() * 4, tz = -2 + b.rand() * 4; if (Math.hypot(tx, tz) > 1.95) b.tuft(tx, tz, "#5a9238"); }
  }

  /* ---------------- Ravenclaw ---------------- */
  var WGL2 = "#c6ecff", WGW2 = "#6ac8ff";
  function mWaterHouse(b) {
    b.slab(3.2, "grassWater", "sideWater"); b.decal("path", 0, 1.2, 0.8, 1.0);
    var sb = M("stoneBlue", 1.6, 0.8), bz = BRONZE();
    b.box(1.85, 0.22, 1.6, M("stoneBlue", 1.6, 0.2), -0.15, 0, -0.25);
    b.box(1.5, 0.85, 1.15, sb, -0.15, 0.22, -0.35);
    b.box(1.58, 0.07, 1.23, bz, -0.15, 1.07, -0.35);
    b.hip(-0.15, -0.35, 1.9, 0.75, 1.12, M("shinglesBlue", 2.4, 1.4, { flatShading: true }));
    b.add(new T3.SphereGeometry(0.07, 12, 10), bz, -0.15, 1.92, -0.35);
    [-0.45, 0.15].forEach(function (x) { b.cyl(0.05, 0.06, 0.82, 10, MARBLE(), x, 0.22, 0.42); });
    b.gable({ len: 0.85, wid: 0.5, rise: 0.25, over: 0.06, mat: M("shinglesBlue", 1, 0.5), gmat: MARBLE(), x: -0.15, y: 1.04, z: 0.38, ry: PI / 2, thick: 0.05, ridge: bz });
    b.box(0.38, 0.62, 0.04, glowMat("#a8dcff", "#3a9ae8", 0.5), -0.15, 0.22, 0.24, { noCast: true });
    b.window(0.62, 0.68, -0.35, PI / 2, 0.24, 0.3, WGL2, WGW2, "#2f5fa8");
    b.window(-0.62, 0.68, 0.24, 0, 0.22, 0.28, WGL2, WGW2, "#2f5fa8");
    var FX = 0.95, FZ = 0.95;
    b.add(new T3.CylinderGeometry(0.3, 0.32, 0.2, 16, 1, true), M("stoneBlue", 1.5, 0.2, { side: T3.DoubleSide }), FX, 0.1, FZ);
    b.add(new T3.TorusGeometry(0.3, 0.035, 6, 20), C("#9aa6ae"), FX, 0.2, FZ, { rx: PI / 2 });
    var ft = tex("water", 0.5, 0.5);
    b.add(new T3.CircleGeometry(0.29, 16), new T3.MeshStandardMaterial({ map: ft, roughness: 0.1, metalness: 0.2 }), FX, 0.16, FZ, { rx: -PI / 2, noCast: true });
    b.cyl(0.04, 0.05, 0.35, 8, C("#9aa6ae"), FX, 0.1, FZ);
    var drops = [], dm = new T3.SpriteMaterial({ map: tex("drop"), transparent: true, depthWrite: false });
    for (var d = 0; d < 10; d++) { var s = new T3.Sprite(dm); s.scale.set(0.05, 0.05, 1); b.g.add(s); drops.push([s, d / 10, d * 2.5]); }
    b.fx.push(function (t) { ft.offset.set(t * 0.05, t * 0.03); drops.forEach(function (q) { var k = (t * 0.9 + q[1]) % 1; q[0].position.set(FX + Math.cos(q[2]) * 0.24 * k, 0.48 + 0.15 * k - 0.45 * k * k, FZ + Math.sin(q[2]) * 0.24 * k); }); });
    b.oak(-1.15, -1.2, 0.75); b.barrel(-1.1, 0.9); b.bush(1.2, -1.15, 0.15);
  }
  function mWaterFarm(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var levels = [[-1.45, -0.55, 0.62], [-0.55, 0.35, 0.38], [0.35, 1.25, 0.14]];
    levels.forEach(function (L, i) {
      var d = L[1] - L[0], cz = (L[0] + L[1]) / 2, sd = M("stoneBlue", 1.6, L[2] * 2), tp = M("soil", 2, 0.6);
      b.add(new T3.BoxGeometry(3.0, L[2], d), [sd, sd, tp, sd, sd, sd], -0.1, L[2] / 2, cz);
      if (i === 1) b.lift(L[2], function () { this.wheat(-1.45, L[0] + 0.1, 0.9, L[1] - 0.1, 3, 8, ["#7fbf5a", "#6aa84a", "#9fd06a"]); });
      else b.cabbages(-1.45, L[0] + 0.1, 0.9, L[1] - 0.1, 2, 8, i ? "#4f8a6a" : "#5f9e4a", L[2]);
      b.water(1.0, L[0], 1.3, L[1], L[2], L[2] + 0.05);
      if (i < 2) {
        var cas = tex("water", 0.3, 0.6);
        b.add(new T3.PlaneGeometry(0.28, L[2] - levels[i + 1][2] + 0.05), new T3.MeshStandardMaterial({ map: cas, transparent: true, opacity: 0.85, roughness: 0.1, side: T3.DoubleSide }), 1.15, (L[2] + levels[i + 1][2]) / 2 + 0.03, L[1] + 0.005, { noCast: true });
        b.fx.push(function (t) { cas.offset.y = t * 0.9; });
      }
    });
    b.water(1.0, 1.25, 1.3, 1.95, 0, 0.05);
    var bz = BRONZE();
    b.cyl(0.25, 0.3, 0.9, 10, M("stoneBlue", 1, 0.8), 1.15, 0, -1.8);
    b.add(new T3.SphereGeometry(0.26, 14, 8, 0, 2 * PI, 0, PI / 2), new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#2a8fe0"), emissiveIntensity: 0.7, transparent: true, opacity: 0.85, roughness: 0.1 }), 1.15, 0.9, -1.8);
    b.add(new T3.TorusGeometry(0.27, 0.02, 6, 20), bz, 1.15, 0.9, -1.8, { rx: PI / 2 });
    [[-1.9, 1.7], [1.8, 1.9]].forEach(function (lp) { b.cyl(0.03, 0.04, 0.85, 6, C("#3a2818"), lp[0], 0, lp[1]); b.add(new T3.SphereGeometry(0.07, 12, 10), glowMat("#e8f8ff", "#58c8ff", 1.6), lp[0], 0.92, lp[1], { noCast: true }); b.add(new T3.ConeGeometry(0.09, 0.09, 6), bz, lp[0], 1.03, lp[1]); });
    b.basket(-1.7, 1.9, "#5f9e4a"); b.basket(-1.45, 1.95, "#e0761e"); b.scarecrow(0.0, 1.75, "#2f5fa8");
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, 1.55 + b.rand() * 0.45, "#4f9246");
  }
  function mWaterStore(b) {
    b.slabWater(3.2, 1.0, "grassWater", "sideWater");
    var bz = BRONZE(), HX = -0.3, HZ = -0.75, sb = M("stoneBlue", 2, 1);
    b.box(2.0, 0.15, 1.4, M("stoneBlue", 2, 1.4), HX, 0, HZ);
    b.box(1.8, 1.0, 1.05, sb, HX, 0.15, HZ);
    b.gable({ len: 1.8, wid: 1.05, rise: 0.55, over: 0.15, mat: M("shinglesBlue", 2.2, 1), gmat: M("stoneBlue", 1, 0.4), x: HX, y: 1.15, z: HZ, ridge: bz });
    var ash = new T3.Shape(); ash.moveTo(-0.22, 0); ash.lineTo(-0.22, 0.4); ash.absarc(0, 0.4, 0.22, PI, 0, true); ash.lineTo(0.22, 0); ash.closePath();
    var dk = C("#0f1820");
    [-0.5, 0.5].forEach(function (dx) { b.add(new T3.ShapeGeometry(ash), dk, HX + dx, 0.15, HZ + 0.53, { noCast: true }); b.add(new T3.TorusGeometry(0.22, 0.04, 6, 12, PI), MARBLE(), HX + dx, 0.55, HZ + 0.535); });
    b.lift(0.15, function () { this.barrel(HX + 0.5, HZ + 0.4); this.crate(HX - 0.5, HZ + 0.42, 0.24, 0.3); });
    b.box(3.2, 0.1, 0.55, M("stoneBlue", 3, 0.5), 0, -0.05, 0.35);
    var CX = 0.95, CZ = 0.45;
    b.cyl(0.05, 0.07, 1.6, 8, bz, CX, 0, CZ);
    var arm = new T3.Group(); arm.position.set(CX, 1.5, CZ); b.g.add(arm);
    b.beam([0, 0, 0], [-0.1, 0.15, 0.85], 0.03, bz, arm);
    var hook = new T3.Group(); hook.position.set(-0.1, 0.15, 0.85); arm.add(hook);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.8, 4), C("#d8cba6"), 0, -0.4, 0, { parent: hook });
    b.add(new T3.BoxGeometry(0.22, 0.2, 0.22), M("plankWarm", 0.4, 0.4), 0, -0.9, 0, { parent: hook });
    b.fx.push(function (t) { arm.rotation.y = Math.sin(t * 0.4) * 0.6; hook.rotation.x = Math.sin(t * 1.3) * 0.08; });
    b.boat(-0.5, 1.15, 0.1); b.barrel(0.3, 0.45); b.gold(-1.2, 0.3); b.sack(-0.95, 0.4, 0, "#c9a86a");
    b.banner(-1.35, -0.1, 0, "bannerWater", 1.3);
  }
  function mWaterBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater"); b.decal("path", 0.2, 1.3, 2.6, 1.5);
    var bz = BRONZE(), HX = -0.3, HZ = -0.65;
    b.add(new T3.BoxGeometry(3.1, 0.3, 2.0), [M("stoneBlue", 2, 0.2), M("stoneBlue", 2, 0.2), M("stoneBlue", 2, 1.4), C("#333"), M("stoneBlue", 2, 0.2), M("stoneBlue", 2, 0.2)], HX, 0.15, HZ);
    b.box(2.5, 1.1, 1.2, M("stoneBlue", 2.4, 1), HX, 0.3, HZ - 0.15);
    for (var c = 0; c < 6; c++) { var x = HX - 1.2 + c * 0.48; b.cyl(0.07, 0.08, 1.1, 10, MARBLE(), x, 0.3, HZ + 0.78); b.cyl(0.11, 0.11, 0.06, 8, bz, x, 0.3, HZ + 0.78); b.cyl(0.11, 0.1, 0.06, 8, bz, x, 1.35, HZ + 0.78); }
    b.box(2.7, 0.14, 1.75, M("stonePale", 2.4, 1.4), HX, 1.4, HZ + 0.1);
    b.gable({ len: 2.7, wid: 1.75, rise: 0.6, over: 0.1, mat: M("shinglesBlue", 3, 1), gmat: MARBLE(), x: HX, y: 1.54, z: HZ + 0.1, ridge: bz });
    b.box(0.6, 0.85, 0.05, glowMat("#a8dcff", "#3a9ae8", 0.5), HX, 0.3, HZ + 0.46, { noCast: true });
    b.banner(HX - 0.75, HZ + 1.2, 0, "bannerWater", 1.6); b.banner(HX + 0.75, HZ + 1.2, 0, "bannerWater", 1.6);
    b.target(1.4, 1.5, 0.5); b.target(1.85, 1.0, 0.7);
    var TX = -1.3, TZ = 1.4;
    b.box(0.8, 0.25, 0.4, M("stoneBlue", 0.8, 0.3), TX, 0, TZ); b.water(TX - 0.34, TZ - 0.14, TX + 0.34, TZ + 0.14, 0.1, 0.22);
    b.cyl(0.04, 0.05, 0.5, 8, C("#9aa6ae"), TX, 0.25, TZ - 0.12);
    [[1.8, -1.8], [-1.9, -1.8]].forEach(function (lp) { b.cyl(0.03, 0.04, 0.85, 6, C("#3a2818"), lp[0], 0, lp[1]); b.add(new T3.SphereGeometry(0.07, 12, 10), glowMat("#e8f8ff", "#58c8ff", 1.6), lp[0], 0.92, lp[1], { noCast: true }); });
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, 1.75 + b.rand() * 0.3, "#4f9246");
  }
  function mWaterTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var bz = BRONZE(), TX = -0.15, TZ = -0.4;
    b.cyl(0.78, 0.85, 0.25, 16, M("stoneBlue", 3, 0.3), TX, 0, TZ);
    var segs = 5, h = 0.5;
    for (var s = 0; s < segs; s++) { var r0 = 0.62 - s * 0.05, r1 = 0.62 - (s + 1) * 0.05; b.add(new T3.CylinderGeometry(r1, r0, h, 18), s % 2 ? MARBLE() : M("stoneBlue", 3, 0.5), TX, 0.25 + h * s + h / 2, TZ); }
    var top = 0.25 + segs * h;
    b.cyl(0.62, 0.42, 0.14, 18, M("stoneBlue", 3, 0.2), TX, top, TZ);
    for (var k = 0; k < 12; k++) { var p = onRing(0.58, k / 12 * 2 * PI); b.cyl(0.015, 0.015, 0.24, 4, bz, TX + p[0], top + 0.14, TZ + p[1]); }
    b.add(new T3.TorusGeometry(0.58, 0.018, 5, 32), bz, TX, top + 0.38, TZ, { rx: PI / 2 });
    var glass = new T3.MeshStandardMaterial({ color: lin("#e8f8ff"), emissive: lin("#7fd8ff"), emissiveIntensity: 1.3, transparent: true, opacity: 0.85, roughness: 0.1 });
    b.add(new T3.CylinderGeometry(0.3, 0.3, 0.45, 10), glass, TX, top + 0.14 + 0.225, TZ, { noCast: true });
    for (var m = 0; m < 6; m++) { var q = onRing(0.3, m * PI / 3); b.cyl(0.012, 0.012, 0.45, 4, bz, TX + q[0], top + 0.14, TZ + q[1]); }
    b.add(new T3.SphereGeometry(0.34, 16, 8, 0, 2 * PI, 0, PI / 2), bz, TX, top + 0.59, TZ);
    b.cyl(0.015, 0.02, 0.3, 6, bz, TX, top + 0.9, TZ);
    var beam = new T3.Group(); beam.position.set(TX, top + 0.37, TZ); b.g.add(beam);
    var bm = new T3.MeshBasicMaterial({ color: lin("#f0fbff"), transparent: true, opacity: 0.2, depthWrite: false, side: T3.DoubleSide });
    b.add(new T3.ConeGeometry(0.3, 1.5, 16, 1, true), bm, 0.75, 0, 0, { parent: beam, rz: PI / 2, noCast: true, noReceive: true });
    var L = new T3.PointLight("#7fd8ff", 1.2, 4, 2); L.position.set(TX, top + 0.37, TZ); b.g.add(L);
    b.fx.push(function (t) { beam.rotation.y = t * 0.8; });
    b.door(TX + 0.48, 0.25, TZ + 0.48, PI / 4, 0.3, 0.5);
    b.cylWindows(TX, TZ, 0.55, 1.4, [PI / 4], 0.12, 0.22, glowMat(WGL2, WGW2, 1));
    b.box(0.6, 0.06, 0.8, M("plankWarm", 0.6, 1), 0.7, -0.04, 1.05);
    b.boat(-0.65, 1.2, -0.2); b.barrel(-1.15, 0.2); b.rock(-1.25, -1.2, 0.12);
  }
  function mWaterPen(b) {
    b.slab(4.2, "grassWater", "sideWater"); b.decal("path", 0.6, 1.5, 2.0, 1.2);
    var bz = BRONZE(), PX = -0.2, PZ = -0.25, R = 1.45;
    b.add(new T3.CylinderGeometry(R + 0.15, R + 0.2, 0.4, 32, 1, true), M("stoneBlue", 5, 0.4, { side: T3.DoubleSide }), PX, 0.2, PZ);
    b.add(new T3.TorusGeometry(R + 0.17, 0.07, 6, 48), M("stonePale", 6, 0.2), PX, 0.4, PZ, { rx: PI / 2 });
    var wt = tex("water", 1.5, 1.5);
    b.add(new T3.CircleGeometry(R + 0.14, 40), new T3.MeshStandardMaterial({ map: wt, roughness: 0.1, metalness: 0.25, color: lin("#cfe6ff") }), PX, 0.3, PZ, { rx: -PI / 2, noCast: true });
    for (var k = 0; k < 16; k++) { var p = onRing(R + 0.17, k / 16 * 2 * PI); b.cyl(0.02, 0.02, 0.35, 5, bz, PX + p[0], 0.45, PZ + p[1]); }
    b.add(new T3.TorusGeometry(R + 0.17, 0.018, 5, 48), bz, PX, 0.78, PZ, { rx: PI / 2 });
    var segs = [], sk = C("#2f7a8a", { flatShading: true }), fin = C("#5fd0c0", { flatShading: true });
    for (var s = 0; s < 14; s++) { var r = 0.2 - s * 0.008; segs.push(b.add(new T3.SphereGeometry(r, 10, 8), s % 3 === 0 ? fin : sk, 0, 0, 0, { noCast: s > 10 })); }
    var head = new T3.Group(); b.g.add(head);
    b.add(new T3.SphereGeometry(0.17, 10, 8), sk, 0, 0, 0.08, { parent: head, s: [0.9, 0.8, 1.4] });
    b.add(new T3.ConeGeometry(0.05, 0.25, 5), fin, 0, 0.14, -0.05, { parent: head, rx: -0.9 });
    [-1, 1].forEach(function (sg) { b.add(new T3.SphereGeometry(0.03, 6, 5), glowMat("#e8ffb0", "#c8ff40", 1.5), sg * 0.08, 0.06, 0.2, { parent: head, noCast: true }); });
    b.fx.push(function (t) {
      for (var i = 0; i < segs.length; i++) {
        var u = i / (segs.length - 1), a = t * 0.6 - u * 2.4, rr = 0.75;
        var y = 0.3 + Math.sin(u * PI * 1.0 + 0.1) * 1.25 * (0.7 + 0.3 * Math.sin(t * 0.8)) - u * 0.2;
        segs[i].position.set(PX + Math.cos(a) * rr, Math.max(0.22, y), PZ + Math.sin(a) * rr);
      }
      var h0 = segs[0].position, h1 = segs[1].position;
      head.position.set(h0.x + (h0.x - h1.x) * 0.9, h0.y + 0.12, h0.z + (h0.z - h1.z) * 0.9);
      head.lookAt(h0.x + (h0.x - h1.x) * 4, h0.y + 0.1, h0.z + (h0.z - h1.z) * 4);
      wt.offset.set(t * 0.03, t * 0.02);
    });
    b.barrel(1.65, 1.6); b.barrel(1.9, 1.35); b.basket(1.85, 1.85, "#9fb8c8");
    b.banner(-1.6, 1.7, 0, "bannerWater", 1.5);
    b.oak(1.8, -1.85, 0.9); b.bush(-1.9, -1.9, 0.17);
  }
  function mWaterSanctum(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var bz = BRONZE(), CX = -0.7, CZ = -0.7;
    b.add(new T3.CylinderGeometry(1.15, 1.2, 0.3, 24), [M("stoneBlue", 4, 0.3), M("stoneBlue", 2, 2), M("stoneBlue", 2, 2)], CX, 0.15, CZ);
    b.cyl(0.9, 0.95, 1.15, 20, M("stoneBlue", 3, 1), CX, 0.3, CZ);
    for (var k = 0; k < 8; k++) { var p = onRing(1.05, k * PI / 4); b.cyl(0.06, 0.07, 1.15, 8, MARBLE(), CX + p[0], 0.3, CZ + p[1]); }
    b.add(new T3.CylinderGeometry(1.12, 1.12, 0.12, 24), M("stonePale", 4, 0.2), CX, 1.51, CZ);
    var glass = new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#2a8fe0"), emissiveIntensity: 0.75, transparent: true, opacity: 0.88, roughness: 0.08, metalness: 0.25 });
    b.add(new T3.SphereGeometry(0.95, 28, 12, 0, 2 * PI, 0, PI / 2), glass, CX, 1.57, CZ);
    for (var r = 0; r < 4; r++) b.add(new T3.TorusGeometry(0.96, 0.024, 6, 28, PI), bz, CX, 1.57, CZ, { ry: r * PI / 4 });
    b.add(new T3.SphereGeometry(0.08, 12, 10), glowMat("#e8f8ff", "#58c8ff", 1.8), CX, 2.6, CZ, { noCast: true });
    b.box(0.5, 0.8, 0.05, glowMat("#a8dcff", "#3a9ae8", 0.6), CX + 0.67, 0.3, CZ + 0.67, { ry: PI / 4, noCast: true });
    var PX = 0.75, PZ = 0.75;
    b.box(1.7, 0.16, 1.7, M("stoneBlue", 1.6, 1.6), PX, 0, PZ);
    b.water(PX - 0.72, PZ - 0.72, PX + 0.72, PZ + 0.72, 0.1, 0.17);
    [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]].forEach(function (q) { b.cyl(0.06, 0.07, 0.9, 8, MARBLE(), PX + q[0], 0.16, PZ + q[1]); b.add(new T3.SphereGeometry(0.06, 10, 8), glowMat("#e8f8ff", "#58c8ff", 1.4), PX + q[0], 1.12, PZ + q[1], { noCast: true }); });
    var orbM = new T3.MeshStandardMaterial({ color: lin("#9fdcff"), emissive: lin("#3aa8ff"), emissiveIntensity: 0.9, transparent: true, opacity: 0.75, roughness: 0.05 });
    var orb = b.add(new T3.SphereGeometry(0.28, 20, 14), orbM, PX, 1.2, PZ, { noCast: true });
    var L = new T3.PointLight("#58c8ff", 1.3, 3.5, 2); b.g.add(L);
    var drops = [], dm = new T3.SpriteMaterial({ map: tex("drop"), transparent: true, depthWrite: false });
    for (var d = 0; d < 12; d++) { var s = new T3.Sprite(dm); s.scale.set(0.06, 0.06, 1); b.g.add(s); drops.push([s, d / 12 * 2 * PI]); }
    b.fx.push(function (t) {
      var y = 1.2 + Math.sin(t * 1.2) * 0.1; orb.position.y = y; orb.scale.set(1 + Math.sin(t * 2.3) * 0.05, 1 + Math.sin(t * 2.3 + 1.5) * 0.05, 1); L.position.set(PX, y, PZ);
      drops.forEach(function (q) { var a = q[1] + t * 1.1; q[0].position.set(PX + Math.cos(a) * 0.5, y + Math.sin(a * 2 + t) * 0.1, PZ + Math.sin(a) * 0.5); });
      glass.emissiveIntensity = 0.7 + Math.sin(t * 1.4) * 0.15;
    });
    b.banner(-1.75, 0.6, 0, "bannerWater", 1.5);
    b.oak(1.8, -1.7, 0.9); b.bush(-1.85, 1.85, 0.16);
  }

  /* ---------------- Gryffindor ---------------- */
  var FGL2 = "#ffd38a", FGW2 = "#ff9a3c";
  function mFireHouse(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0, 1.2, 0.9, 1.0);
    var rs = M("stoneRed", 1.4, 1.4), gold = REDGOLD();
    b.box(1.6, 0.18, 1.35, M("stoneWarm", 1.4, 0.2), -0.1, 0, -0.2);
    b.box(1.45, 1.45, 1.15, rs, -0.1, 0.18, -0.2);
    b.box(1.55, 0.08, 1.25, M("stoneWarm", 1.4, 0.1), -0.1, 0.9, -0.2);
    b.gable({ len: 1.45, wid: 1.15, rise: 0.85, over: 0.18, mat: M("shinglesRed", 2, 1.2), gmat: M("stoneRed", 1, 0.6), x: -0.1, y: 1.63, z: -0.2, ridge: gold });
    b.box(0.34, 2.75, 0.36, M("stoneWarm", 0.4, 2.8), 0.68, 0, -0.35);
    b.smoke(0.68, 2.85, -0.35, 6);
    var fz = -0.2 + 0.575;
    b.door(-0.1, 0.18, fz + 0.01, 0, 0.38, 0.6);
    [[-0.5, 0.65], [0.3, 0.65], [-0.5, 1.25], [0.3, 1.25], [-0.1, 1.25]].forEach(function (w) { b.window(w[0], w[1], fz + 0.03, 0, 0.18, 0.24, FGL2, FGW2); });
    b.cyl(0.02, 0.025, 0.7, 6, M("iron"), 0.32, 0, 0.75); b.cyl(0.06, 0.04, 0.06, 8, M("iron"), 0.32, 0.7, 0.75); b.fire(0.32, 0.76, 0.75, 0.3, 0.5);
    b.logs(-1.1, 0.75, 0.2); b.pine(-1.15, -1.15, 0.75); b.rock(1.25, 1.2, 0.1);
  }
  function mFireFarm(b) {
    b.slab(4.2, "grassFire", "sideFire");
    b.box(3.1, 0.06, 2.6, M("soil", 3, 2.6), 0.25, 0, 0.45);
    b.wheat(-1.2, -0.75, 1.75, 1.7, 7, 10, ["#e8b83a", "#d8a030", "#f2cc5a", "#c88a28"]);
    var sw = M("stoneWarm", 3, 0.3);
    [[-1.35, 1.95, 1.9, 1.95], [1.95, 1.95, 1.95, -1.0], [-1.35, -1.0, -1.35, 0.6]].forEach(function (w) {
      var len = Math.hypot(w[2] - w[0], w[3] - w[1]); b.box(len + 0.2, 0.35, 0.16, sw, (w[0] + w[2]) / 2, 0, (w[1] + w[3]) / 2, { ry: -Math.atan2(w[3] - w[1], w[2] - w[0]) });
    });
    var GX = -1.4, GZ = -1.45;
    b.cyl(0.5, 0.55, 1.5, 16, M("stoneRed", 2, 1.4), GX, 0, GZ);
    b.add(new T3.ConeGeometry(0.66, 0.85, 16), M("shinglesRed", 2.5, 1.2), GX, 1.5 + 0.425, GZ);
    b.add(new T3.SphereGeometry(0.06, 10, 8), REDGOLD(), GX, 2.4, GZ);
    b.box(0.32, 0.5, 0.04, C("#2e1c10"), GX + 0.38, 0, GZ + 0.38, { ry: PI / 4 });
    [[1.95, -1.0], [-1.35, 1.95], [1.95, 1.95]].forEach(function (p) { b.cyl(0.14, 0.18, 0.18, 8, M("stoneWarm", 0.4, 0.2), p[0], 0.35, p[1]); b.cyl(0.18, 0.1, 0.12, 10, M("iron"), p[0], 0.53, p[1]); b.fire(p[0], 0.65, p[1], 0.4, 0.5); });
    b.hay(0.6, -1.5, 0.3); b.hay(1.1, -1.55, -0.2); b.scarecrow(0.3, 0.5, "#b3261e");
  }
  function mFireStore(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0.2, 0.9, 1.6, 1.4);
    var rs = M("stoneRed", 1.4, 1), gold = REDGOLD(), HX = -0.45, HZ = -0.5;
    b.box(1.45, 1.05, 1.15, rs, HX, 0, HZ);
    b.gable({ len: 1.45, wid: 1.15, rise: 0.6, over: 0.15, mat: M("shinglesRed", 2, 1), gmat: M("stoneRed", 1, 0.5), x: HX, y: 1.05, z: HZ, ridge: gold });
    b.box(0.6, 0.72, 0.04, C("#1a0d07"), HX, 0, HZ + 0.58);
    b.lift(0, function () { this.logs(HX, HZ + 0.4, PI / 2); });
    var FX = 0.75, FZ = -0.65;
    b.cyl(0.32, 0.6, 1.4, 12, M("stoneWarm", 2, 1.2), FX, 0, FZ);
    b.cyl(0.36, 0.32, 0.12, 12, M("iron"), FX, 1.4, FZ);
    b.fire(FX, 1.5, FZ, 0.55, 1.0); b.smoke(FX, 2.0, FZ, 6);
    var og = new T3.MeshBasicMaterial({ color: lin("#ffb060"), transparent: true, opacity: 0.85 });
    var op = b.add(new T3.PlaneGeometry(0.3, 0.32), og, FX + 0.4, 0.3, FZ + 0.4, { ry: PI / 4, noCast: true });
    var ol = new T3.PointLight("#ff7a2a", 1.0, 2.5, 2); ol.position.set(FX + 0.7, 0.4, FZ + 0.7); b.g.add(ol);
    b.fx.push(function (t) { og.opacity = 0.7 + Math.sin(t * 7) * 0.15; ol.intensity = 0.9 + Math.sin(t * 9) * 0.2; });
    var gb = C("#f2c040", { metalness: 0.85, roughness: 0.3 });
    b.box(0.6, 0.06, 0.45, M("plankDark", 0.6, 0.4), 0.55, 0, 0.7);
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3 - r; c++) b.box(0.16, 0.07, 0.36, gb, 0.39 + c * 0.17 + r * 0.085, 0.06 + r * 0.07, 0.7);
    var ore = C("#6a5a4e", { flatShading: true });
    for (var o = 0; o < 8; o++) b.add(new T3.DodecahedronGeometry(0.07 + b.rand() * 0.05, 0), ore, -0.95 + (b.rand() - 0.5) * 0.4, 0.06, 0.8 + (b.rand() - 0.5) * 0.4);
    b.pine(1.2, 1.15, 0.6); b.rock(-1.25, 1.25, 0.11);
  }
  function mFireBarracks(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.3, 1.3, 2.6, 1.6);
    var rs = M("stoneRed", 2.4, 1.2), sw = M("stoneWarm", 0.3, 0.3), gold = REDGOLD(), HX = -0.35, HZ = -0.55;
    b.box(2.6, 1.25, 1.6, rs, HX, 0, HZ);
    [[-1.3, 0.8, 1.3, 0.8], [1.3, 0.8, 1.3, -0.8], [1.3, -0.8, -1.3, -0.8], [-1.3, -0.8, -1.3, 0.8]].forEach(function (l) { merlons(b, HX + l[0], HZ + l[1], HX + l[2], HZ + l[3], 1.25, sw, 0.17); });
    b.gable({ len: 2.1, wid: 1.2, rise: 0.75, over: 0.05, mat: M("shinglesRed", 2.6, 1), gmat: M("stoneRed", 1.2, 0.5), x: HX, y: 1.25, z: HZ, ridge: gold });
    [-1, 1].forEach(function (sg) { b.box(0.42, 1.6, 0.42, M("stoneWarm", 0.4, 1.6), HX + sg * 1.3, 0, HZ + 0.8); merlons(b, HX + sg * 1.3 - 0.2, HZ + 1.0, HX + sg * 1.3 + 0.2, HZ + 1.0, 1.6, sw, 0.14); });
    var ash = new T3.Shape(); ash.moveTo(-0.3, 0); ash.lineTo(-0.3, 0.5); ash.absarc(0, 0.5, 0.3, PI, 0, true); ash.lineTo(0.3, 0); ash.closePath();
    var gg = new T3.MeshBasicMaterial({ color: lin("#ff8a3d"), transparent: true, opacity: 0.6 });
    b.add(new T3.ShapeGeometry(ash), C("#1a0d07"), HX, 0, HZ + 0.81, { noCast: true });
    b.add(new T3.ShapeGeometry(ash), gg, HX, 0, HZ + 0.815, { noCast: true, s: [0.8, 0.85, 1] });
    var gl = new T3.PointLight("#ff8a3d", 0.8, 2.4, 2); gl.position.set(HX, 0.4, HZ + 1.2); b.g.add(gl);
    b.fx.push(function (t) { gg.opacity = 0.5 + Math.sin(t * 5) * 0.12; });
    [-0.75, 0.75].forEach(function (dx) { b.box(0.08, 0.36, 0.03, glowMat("#ffc070", "#ff8a2a", 1.4), HX + dx, 0.7, HZ + 0.81, { noCast: true }); });
    b.banner(HX - 0.55, HZ + 1.25, 0, "bannerFire", 1.55); b.banner(HX + 0.55, HZ + 1.25, 0, "bannerFire", 1.55);
    b.target(1.35, 1.45, 0.5); b.target(1.85, 0.95, 0.7);
    [[-1.4, 1.6], [0.6, 1.75]].forEach(function (p) { b.cyl(0.16, 0.2, 0.2, 8, M("stoneWarm", 0.5, 0.2), p[0], 0, p[1]); b.cyl(0.22, 0.12, 0.15, 12, M("iron"), p[0], 0.2, p[1]); b.fire(p[0], 0.35, p[1], 0.5, 0.7); });
    b.rack(-1.6, 0.6, 1.4, "spear"); b.pine(1.85, -1.85, 0.9);
  }
  function mFireTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var gold = REDGOLD(), sw = M("stoneWarm", 0.3, 0.3);
    b.cyl(0.75, 0.82, 0.3, 18, M("stoneWarm", 2, 0.3), 0, 0, 0);
    b.cyl(0.58, 0.68, 2.4, 18, M("stoneRed", 2.4, 2.4), 0, 0.3, 0);
    b.cyl(0.78, 0.6, 0.2, 18, M("stoneWarm", 2.4, 0.2), 0, 2.7, 0);
    for (var c = 0; c < 10; c++) { var a = c / 10 * 2 * PI, p = onRing(0.7, a); b.box(0.2, 0.24, 0.15, sw, p[0], 2.9, p[1], { ry: -a }); }
    b.add(new T3.TorusGeometry(0.78, 0.03, 6, 32), gold, 0, 2.8, 0, { rx: PI / 2 });
    b.cyl(0.1, 0.12, 0.25, 8, M("iron"), 0, 2.9, 0);
    b.cyl(0.36, 0.16, 0.2, 14, M("iron"), 0, 3.15, 0);
    b.cyl(0.32, 0.32, 0.02, 14, glowMat("#ff7a2a", "#ff5a10", 2), 0, 3.34, 0, { noCast: true });
    b.fire(0, 3.35, 0, 1.0, 1.6);
    [1.1, 1.9].forEach(function (y) { b.box(0.07, 0.3, 0.03, glowMat("#ffc070", "#ff8a2a", 1.4), 0.2, 0.3 + y, 0.62, { noCast: true }); b.box(0.03, 0.3, 0.07, glowMat("#ffc070", "#ff8a2a", 1.4), 0.62, 0.3 + y, -0.2, { noCast: true }); });
    b.door(0.45, 0.3, 0.45, PI / 4, 0.32, 0.55);
    b.pennant(-0.5, 3.0, -0.5, "#c0281c", 0.6);
    b.logs(-1.1, 0.8, 0.3); b.barrel(1.0, 0.95); b.pine(-1.15, -1.15, 0.85);
  }
  function mFirePen(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var sw = M("stoneWarm", 0.3, 0.3), rs = M("stoneRed", 2, 0.6), PX = -0.15, PZ = -0.25;
    b.box(3.4, 0.08, 3.0, M("dirt", 3, 3), PX, 0, PZ);
    [[-1.7, 1.25, -1.7, -1.75], [-1.7, -1.75, 1.7, -1.75], [1.7, -1.75, 1.7, 1.25]].forEach(function (w) {
      var len = Math.hypot(w[2] - w[0], w[3] - w[1]), ry = -Math.atan2(w[3] - w[1], w[2] - w[0]);
      b.box(len + 0.25, 0.75, 0.25, rs, PX + (w[0] + w[2]) / 2, 0, PZ + (w[1] + w[3]) / 2, { ry: ry });
      merlons(b, PX + w[0], PZ + w[1], PX + w[2], PZ + w[3], 0.75, sw, 0.16);
    });
    [-1.7, 1.7].forEach(function (x) { b.box(0.4, 1.1, 0.4, M("stoneWarm", 0.4, 1), PX + x, 0, PZ + 1.25); });
    for (var i = -6; i <= 6; i++) b.box(0.025, 0.85, 0.025, M("iron"), PX + i * 0.24, 0, PZ + 1.25);
    [0.2, 0.75].forEach(function (y) { b.box(3.0, 0.03, 0.03, M("iron"), PX, y, PZ + 1.25); });
    b.add(new T3.CylinderGeometry(0.75, 0.75, 0.04, 20), glowMat("#ff8a3a", "#ff4a10", 1.3), PX - 0.1, 0.06, PZ - 0.3, { noCast: true });
    b.add(new T3.TorusGeometry(0.78, 0.08, 6, 24), C("#3a322e", { flatShading: true }), PX - 0.1, 0.08, PZ - 0.3, { rx: PI / 2 });
    var pl = new T3.PointLight("#ff6a1a", 1.0, 3, 2); pl.position.set(PX - 0.1, 0.4, PZ - 0.3); b.g.add(pl);
    b.add(rough(new T3.CylinderGeometry(0.45, 0.6, 0.35, 8), 0.3, 3), C("#6a5a4e", { flatShading: true }), PX + 0.55, 0.18, PZ + 0.2);
    b.drake(PX + 0.55, 0.35, PZ + 0.2, 1.0, 2.4);
    b.beam([PX + 0.45, 0.4, PZ + 0.2], [PX - 1.5, 0.5, PZ - 1.6], 0.012, M("iron"));
    b.banner(PX - 1.25, PZ + 1.75, 0, "bannerFire", 1.55); b.banner(PX + 1.25, PZ + 1.75, 0, "bannerFire", 1.55);
    b.hay(1.85, 1.75, 0.3);
  }
  function mFireSanctum(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var gold = REDGOLD();
    [[3.2, 0.3, "stoneWarm"], [2.5, 0.3, "stoneRed"], [1.8, 0.3, "stoneWarm"]].forEach(function (t, i) { b.box(t[0], t[1], t[0], M(t[2], t[0], 0.3), 0, i * 0.3, 0); });
    for (var s = 0; s < 6; s++) b.box(0.7, 0.15, 0.2, M("stoneWarm", 0.7, 0.2), 0, s * 0.15, 1.6 - s * 0.12);
    var Y = 0.9;
    [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]].forEach(function (q) { b.cyl(0.08, 0.09, 1.2, 10, gold, q[0], Y, q[1]); });
    b.box(1.75, 0.12, 1.75, M("stoneRed", 1.6, 0.2), 0, Y + 1.2, 0);
    b.hip(0, 0, 2.0, 0.75, Y + 1.32, M("shinglesRed", 2.4, 1.2, { flatShading: true }));
    b.add(new T3.SphereGeometry(0.08, 10, 8), gold, 0, Y + 2.12, 0);
    b.cyl(0.35, 0.42, 0.35, 10, M("stoneRed", 1, 0.3), 0, Y, 0);
    b.cyl(0.38, 0.22, 0.14, 14, gold, 0, Y + 0.35, 0);
    b.cyl(0.34, 0.34, 0.02, 14, glowMat("#ff7a2a", "#ff5a10", 2), 0, Y + 0.49, 0, { noCast: true });
    b.fire(0, Y + 0.5, 0, 0.95, 1.8);
    [[-1.45, 1.45], [1.45, 1.45], [-1.45, -1.45], [1.45, -1.45]].forEach(function (p) { b.cyl(0.12, 0.16, 0.25, 8, M("stoneWarm", 0.4, 0.2), p[0], 0.3, p[1]); b.cyl(0.18, 0.1, 0.12, 10, M("iron"), p[0], 0.55, p[1]); b.fire(p[0], 0.67, p[1], 0.4, 0.4); });
    b.banner(-0.6, 1.95, 0, "bannerFire", 1.5); b.banner(0.6, 1.95, 0, "bannerFire", 1.5);
    b.pine(-1.85, -1.9, 0.85); b.pine(1.9, -1.8, 0.75);
  }

  /* ---------------- Slytherin ---------------- */
  var capGlow = function () { return glowMat("#7ff0d0", "#2fe0b0", 0.9); };
  function bigTrunk(b, x, z, r0, r1, h, y0, twist) {
    var tg = new T3.CylinderGeometry(r1, r0, h, 16, 8), tp = tg.attributes.position;
    for (var i = 0; i < tp.count; i++) { var px = tp.getX(i), py = tp.getY(i), pz = tp.getZ(i), a = Math.atan2(pz, px), r = Math.hypot(px, pz), k = 1 + Math.sin(a * 5 + py * 1.5) * 0.07 + (n3(px * 4, py * 2, pz * 4) - 0.5) * 0.08; a += py * (twist || 0.15); tp.setXYZ(i, Math.cos(a) * r * k, py, Math.sin(a) * r * k); }
    tg.computeVertexNormals();
    return b.add(tg, M("barkTree", 3, 2), x, (y0 || 0) + h / 2, z);
  }
  function canopyAt(b, x, y, z, s, list) {
    var g = new T3.Group(); g.position.set(x, y, z); g.scale.set(s, s, s); b.g.add(g);
    (list || [[0, 0.5, 0, 0.6, "#2f6f3c"], [-0.55, 0.25, 0.25, 0.45, "#285f34"], [0.55, 0.25, -0.25, 0.48, "#3b8048"], [0.15, 0.25, 0.6, 0.42, "#34763f"], [-0.2, 0.85, -0.1, 0.42, "#4a9654"]]).forEach(function (c, ci) {
      var ig = new T3.IcosahedronGeometry(c[3], 1), ip = ig.attributes.position;
      for (var q = 0; q < ip.count; q++) { var ax = ip.getX(q), ay = ip.getY(q), az = ip.getZ(q), f = 1 + (n3(ax * 5 + ci, ay * 5, az * 5) - 0.5) * 0.35; ip.setXYZ(q, ax * f, ay * f, az * f); }
      ig.computeVertexNormals();
      b.add(ig, C(c[4], { flatShading: true, roughness: 0.9 }), c[0], c[1], c[2], { parent: g });
    });
    var ph = b.rand() * 6;
    b.fx.push(function (t) { g.rotation.z = Math.sin(t * 0.7 + ph) * 0.025; });
    return g;
  }
  function rootsAround(b, x, z, rIn, rOut, yTop, n, skip) {
    var rootM = M("barkTree", 1, 3);
    for (var i = 0; i < n; i++) {
      var a = i / n * 2 * PI + 0.2;
      if (skip != null && Math.abs(((a - skip + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI) < 0.4) continue;
      var pts = [];
      for (var s = 0; s <= 5; s++) { var t = s / 5, rr = rIn + t * (rOut - rIn), yy = yTop * Math.pow(1 - t, 1.6) + 0.04; pts.push(new T3.Vector3(x + Math.cos(a + t * 0.25) * rr, yy, z + Math.sin(a + t * 0.25) * rr)); }
      b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 20, 0.1 - (i % 3) * 0.015, 6, false), rootM, 0, 0, 0);
    }
  }
  function archDoor(b, x, z, ry, w, h, y0) {
    var d = new T3.Group(); d.position.set(x, y0 || 0, z); d.rotation.y = ry; b.g.add(d);
    var sl = C("#b4b8b6", { flatShading: true });
    b.add(new T3.BoxGeometry(0.12, h, 0.14), sl, -w / 2 - 0.06, h / 2, 0.03, { parent: d });
    b.add(new T3.BoxGeometry(0.12, h, 0.14), sl, w / 2 + 0.06, h / 2, 0.03, { parent: d });
    b.add(new T3.TorusGeometry(w / 2 + 0.06, 0.06, 6, 14, PI), sl, 0, h, 0.03, { parent: d });
    var sh = new T3.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(-w / 2, h); sh.absarc(0, h, w / 2, PI, 0, true); sh.lineTo(w / 2, 0); sh.closePath();
    var m = glowMat("#123a22", "#2dff7a", 0.6);
    b.add(new T3.ShapeGeometry(sh), m, 0, 0, 0.02, { parent: d, noCast: true });
    var ph = b.rand() * 6; b.fx.push(function (t) { m.emissiveIntensity = 0.5 + Math.sin(t * 1.6 + ph) * 0.2; });
  }
  function trunkWindows(b, x, z, rAt, list) {
    var winM = glowMat("#a6ffc4", "#3cff8a", 1.0), sl = C("#b4b8b6", { flatShading: true });
    list.forEach(function (w) {
      var r = rAt(w[1]) + 0.02, px = x + Math.cos(w[0]) * r, pz = z + Math.sin(w[0]) * r, s = w[2] || 1;
      var g = b.add(new T3.CircleGeometry(0.1 * s, 14), winM, px, w[1], pz, { noCast: true }); g.lookAt(px + Math.cos(w[0]) * 3, w[1], pz + Math.sin(w[0]) * 3);
      var ring = b.add(new T3.TorusGeometry(0.11 * s, 0.03, 6, 14), sl, px, w[1], pz); ring.lookAt(px + Math.cos(w[0]) * 3, w[1], pz + Math.sin(w[0]) * 3);
    });
  }
  function trilithon(b, x, z, a, h, w) {
    var st = SLATE(), rune = glowMat("#9effc0", "#3cff8a", 1.3);
    [-1, 1].forEach(function (s) {
      var px = x - Math.sin(a) * s * w / 2, pz = z + Math.cos(a) * s * w / 2;
      b.add(new T3.CylinderGeometry(0.11, 0.16, h, 4), st, px, h / 2, pz, { ry: -a + PI / 4 });
      b.box(0.035, h * 0.4, 0.02, rune, px + 0.09, h * 0.25, pz + 0.09, { ry: PI / 4, noCast: true });
    });
    b.box(w + 0.35, 0.16, 0.24, st, x, h, z, { ry: -a - PI / 2 });
  }
  function mEarthHouse(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var X = -0.15, Z = -0.2;
    bigTrunk(b, X, Z, 0.62, 0.42, 1.55, 0, 0.2);
    rootsAround(b, X, Z, 0.5, 1.15, 0.55, 7, PI / 4);
    archDoor(b, X + 0.58 * 0.707, Z + 0.58 * 0.707, PI / 4, 0.3, 0.38, 0);
    trunkWindows(b, X, Z, function (y) { return 0.62 - y / 1.55 * 0.2; }, [[0.1, 0.9], [1.3, 1.1], [0.75, 1.35, 0.8]]);
    canopyAt(b, X, 1.4, Z, 1.15);
    b.cyl(0.07, 0.08, 0.35, 7, M("stoneGrey", 0.3, 0.4), X - 0.35, 1.35, Z - 0.3); b.smoke(X - 0.35, 1.75, Z - 0.3, 4);
    b.mushrooms([[-1.2, 0.9], [-1.05, 1.05], [1.0, -1.1], [1.15, -0.95]], capGlow());
    [1.0, 1.3].forEach(function (r, i) { b.add(new T3.CylinderGeometry(0.13, 0.15, 0.04, 7), C("#8f9694", { flatShading: true }), X + 0.707 * (r + 0.1), 0.02, Z + 0.707 * (r + 0.1) + (i ? 0.08 : -0.08), { ry: i }); });
    b.bush(-1.2, -0.1, 0.15, "#2f6a2e"); b.rock(1.25, 0.6, 0.1, "#8f9694");
  }
  function mEarthFarm(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var soil = M("soil", 1.2, 1), logM = [M("bark", 1, 1), M("logEnd"), M("logEnd")];
    [[-0.9, -0.2], [0.9, -0.2], [-0.9, 1.35], [0.9, 1.35]].forEach(function (p, i) {
      b.box(1.4, 0.16, 1.1, soil, p[0], 0, p[1]);
      [-1, 1].forEach(function (s) { b.add(new T3.CylinderGeometry(0.06, 0.06, 1.5, 8), logM, p[0], 0.08, p[1] + s * 0.57, { rz: PI / 2 }); });
      if (i % 2) { b.pumpkin(p[0] - 0.3, p[1] - 0.2, 0.14, 0.16); b.pumpkin(p[0] + 0.3, p[1] + 0.15, 0.15, 0.16); b.pumpkin(p[0], p[1] + 0.25, 0.11, 0.16); }
      else b.cabbages(p[0] - 0.55, p[1] - 0.4, p[0] + 0.55, p[1] + 0.4, 2, 4, i ? "#5f9e4a" : "#4a8a5a", 0.16);
    });
    [[-1.3, -1.6], [0.7, -1.7]].forEach(function (t) {
      bigTrunk(b, t[0], t[1], 0.18, 0.12, 0.9, 0, 0.3);
      canopyAt(b, t[0], 0.8, t[1], 0.85);
      for (var f = 0; f < 6; f++) b.add(new T3.SphereGeometry(0.06, 8, 6), C("#d8402a"), t[0] + Math.cos(f * 1.1) * 0.45, 0.95 + (f % 3) * 0.15, t[1] + Math.sin(f * 1.1) * 0.45, { noCast: true });
    });
    trilithon(b, 0, 2.05, PI / 2, 0.85, 0.75);
    b.mushrooms([[-1.95, 0.6], [-1.85, 0.75], [1.9, 0.55], [1.8, 0.4], [0, 0.6]], capGlow());
    b.basket(1.85, 1.95, "#e0761e"); b.basket(-1.85, 1.95, "#5f9e4a");
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, -2 + b.rand() * 0.3, "#3f7a32");
  }
  function mEarthStore(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var X = -0.3, Z = -0.4;
    var st = bigTrunk(b, X, Z, 0.9, 0.8, 1.05, 0, 0.1);
    b.add(new T3.CircleGeometry(0.8, 16), M("logEnd"), X, 1.06, Z, { rx: -PI / 2, noCast: true });
    rootsAround(b, X, Z, 0.75, 1.35, 0.45, 8, PI / 4);
    archDoor(b, X + 0.86 * 0.707, Z + 0.86 * 0.707, PI / 4, 0.4, 0.45, 0);
    trunkWindows(b, X, Z, function () { return 0.86; }, [[0.15, 0.6], [1.35, 0.6]]);
    b.cyl(0.03, 0.05, 0.35, 6, M("barkTree", 0.3, 0.5), X - 0.2, 1.05, Z - 0.2);
    canopyAt(b, X - 0.2, 1.3, Z - 0.2, 0.55);
    trilithon(b, 0.9, 0.9, PI / 4 + PI / 2, 1.0, 0.75);
    b.basket(1.15, -0.3, "#e0761e"); b.basket(1.2, -0.65, "#5f9e4a"); b.logs(-1.2, 0.9, 0.5); b.gold(0.2, 1.25); b.sack(0.45, 1.3, 0, "#9a8a5a");
    b.mushrooms([[-1.25, -1.1], [-1.1, -1.25]], capGlow()); b.pine(1.2, -1.25, 0.65);
  }
  function mEarthBarracks(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var MX = -0.35, MZ = -0.55;
    b.mound(MX, MZ, 1.55, 1.0, 1.0, "grassEarth", 3);
    var FZ = MZ + 0.8;
    b.box(1.8, 0.95, 0.35, M("stoneGrey", 1.8, 0.9), MX, 0, FZ);
    b.box(1.9, 0.12, 0.45, M("grassEarth", 1, 0.4), MX, 0.95, FZ - 0.03);
    trilithon(b, MX, FZ + 0.25, PI / 2, 0.8, 0.6);
    archDoor(b, MX, FZ + 0.18, 0, 0.45, 0.42, 0);
    trunkWindows(b, MX, FZ + 0.0, function () { return 0.18; }, [[PI / 2 - 0.9, 0.55], [PI / 2 + 0.9, 0.55]]);
    bigTrunk(b, MX + 0.3, MZ - 0.25, 0.3, 0.2, 1.3, 0.75, 0.3);
    canopyAt(b, MX + 0.3, 1.9, MZ - 0.25, 1.15);
    var thorn = C("#3a4a22", { flatShading: true }), thorn2 = C("#5a3d24", { flatShading: true });
    for (var i = 0; i < 26; i++) {
      var a = -0.25 + i / 25 * 1.95, r = 2.45, x = MX + Math.cos(a) * r, z = MZ + Math.sin(a) * r;
      if (Math.abs(a - 0.85) < 0.2) continue;
      var h = 0.45 + b.rand() * 0.25;
      b.add(new T3.ConeGeometry(0.07, h, 4), i % 2 ? thorn : thorn2, x, h / 2, z, { rz: Math.cos(a) * 0.35, rx: -Math.sin(a) * 0.35 });
    }
    b.banner(MX - 1.1, FZ + 0.55, 0, "bannerEarth", 1.5); b.banner(MX + 1.1, FZ + 0.55, 0, "bannerEarth", 1.5);
    b.target(0.75, 1.3, 0.4); b.target(1.25, 0.65, 0.6);
    b.mushrooms([[-1.9, 1.2], [-1.75, 1.35]], capGlow()); b.pine(1.8, -1.85, 0.95);
  }
  function mEarthTower(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    bigTrunk(b, 0, 0, 0.5, 0.3, 2.7, 0, 0.3);
    rootsAround(b, 0, 0, 0.42, 1.1, 0.5, 7, PI / 4);
    var pl = M("plankWarm", 0.5, 0.3);
    for (var s = 0; s < 14; s++) { var t = s / 14, a = PI / 4 + t * PI * 2.1, y = 0.2 + t * 2.35, r = 0.5 - t * 0.18 + 0.18; var p = onRing(r, a); b.box(0.3, 0.05, 0.16, pl, p[0], y, p[1], { ry: -a }); }
    b.add(new T3.CylinderGeometry(0.85, 0.85, 0.1, 20), M("plankWarm", 2, 1), 0, 2.6, 0);
    for (var k = 0; k < 14; k++) { var q = onRing(0.82, k / 14 * 2 * PI); b.cyl(0.015, 0.015, 0.3, 4, C("#4a3020"), q[0], 2.65, q[1]); }
    b.add(new T3.TorusGeometry(0.82, 0.018, 5, 36), C("#4a3020"), 0, 2.95, 0, { rx: PI / 2 });
    canopyAt(b, 0, 3.0, 0, 1.15);
    var rune = glowMat("#9effc0", "#3cff8a", 1.3);
    b.add(new T3.TorusGeometry(0.47, 0.025, 6, 24), rune, 0, 1.0, 0, { rx: PI / 2, noCast: true });
    b.fx.push(function (t) { rune.emissiveIntensity = 1.1 + Math.sin(t * 1.4) * 0.4; });
    archDoor(b, 0.33, 0.33, PI / 4, 0.24, 0.3, 0);
    var lan = b.add(new T3.SphereGeometry(0.06, 10, 8), glowMat("#a6ffc4", "#3cff8a", 1.4), 0.6, 2.4, 0.6, { noCast: true });
    b.mushrooms([[-1.1, 0.9], [-0.95, 1.05], [1.0, -1.05]], capGlow()); b.rock(1.2, 0.3, 0.12, "#8f9694"); b.bush(-1.2, 0.2, 0.14, "#2f6a2e");
  }
  function mEarthPen(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var CX = -0.1, CZ = -0.15;
    for (var i = 0; i < 22; i++) { var a = i / 22 * 2 * PI; if (Math.abs(a - PI / 4) < 0.3) continue; var p = onRing(1.75, a); b.add(new T3.IcosahedronGeometry(0.22 + (i % 3) * 0.04, 0), C(i % 2 ? "#2f6a2e" : "#3b7a36", { flatShading: true }), CX + p[0], 0.2, CZ + p[1], { s: [1, 1.2, 1] }); }
    trilithon(b, CX + 1.75 * 0.707, CZ + 1.75 * 0.707, PI / 4, 0.95, 0.8);
    b.stag(CX - 0.1, CZ - 0.2, 1.6, 0.9);
    b.box(0.7, 0.18, 0.28, M("plankWarm", 0.7, 0.3), CX - 0.8, 0, CZ + 0.7, { ry: 0.6 });
    b.add(new T3.CylinderGeometry(0.5, 0.5, 0.03, 18), M("water", 0.5, 0.5, { roughness: 0.1, metalness: 0.2 }), CX + 0.65, 0.02, CZ - 0.8, { noCast: true });
    b.add(new T3.TorusGeometry(0.5, 0.06, 6, 20), C("#8f9694", { flatShading: true }), CX + 0.65, 0.04, CZ - 0.8, { rx: PI / 2 });
    b.mushrooms([[-1.0, 0.9], [-0.85, 1.0], [0.9, 0.5]], capGlow());
    b.banner(1.95, 1.0, 0, "bannerEarth", 1.5);
    b.pine(1.9, -1.9, 1.0); b.pine(-1.95, -1.85, 0.85);
  }
  function mEarthSanctum(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    b.add(new T3.CylinderGeometry(1.95, 2.0, 0.1, 32), M("stoneGrey", 6, 0.2), 0, 0.05, 0);
    [-1.2, -0.1, 1.75, 2.85, 3.95].forEach(function (a) { var p = onRing(1.6, a); trilithon(b, p[0], p[1], a, 1.15, 0.6); });
    b.cyl(0.4, 0.5, 0.45, 8, SLATE(), 0, 0.1, 0);
    var heart = glowMat("#7fffb0", "#2dff7a", 1.2);
    var hg = new T3.Group(); hg.position.set(0, 0.55, 0); b.g.add(hg);
    bigTrunk(b, 0, 0, 0.12, 0.07, 0.6, 0.55, 0.6);
    [[0, 0.75, 0, 0.32], [-0.25, 0.62, 0.1, 0.22], [0.25, 0.6, -0.1, 0.24], [0.05, 0.92, 0.05, 0.2]].forEach(function (c) { b.add(new T3.IcosahedronGeometry(c[3], 0), heart, c[0], c[1], c[2], { parent: hg, noCast: true }); });
    var L = new T3.PointLight("#5cff9a", 1.6, 4.5, 2); L.position.set(0, 1.3, 0); b.g.add(L);
    var ringM = new T3.MeshBasicMaterial({ color: lin("#5cff9a"), transparent: true, opacity: 0.35, depthWrite: false });
    b.add(new T3.TorusGeometry(1.6, 0.022, 4, 80), ringM, 0, 0.11, 0, { rx: PI / 2, noCast: true });
    var flyM = new T3.SpriteMaterial({ map: tex("glow"), transparent: true, depthWrite: false, blending: T3.AdditiveBlending }), flies = [];
    for (var f = 0; f < 16; f++) { var s = new T3.Sprite(flyM); s.scale.set(0.11, 0.11, 1); b.g.add(s); flies.push([s, b.rand() * 6.28, 0.4 + b.rand() * 1.0, b.rand()]); }
    b.fx.push(function (t) {
      hg.rotation.y = t * 0.2; heart.emissiveIntensity = 1.0 + Math.sin(t * 1.5) * 0.35; L.intensity = 1.4 + Math.sin(t * 1.5) * 0.4; ringM.opacity = 0.25 + Math.sin(t * 1.4) * 0.12;
      flies.forEach(function (q) { var k = (t * 0.25 + q[3]) % 1, a = q[1] + t * 0.8; q[0].position.set(Math.cos(a) * q[2], 0.8 + k * 1.8, Math.sin(a) * q[2]); q[0].material.opacity = Math.sin(k * PI); });
    });
    b.banner(1.5, 1.75, 0, "bannerEarth", 1.5);
    b.pine(-1.9, -1.9, 1.0); b.pine(1.95, -1.6, 0.8);
    b.mushrooms([[-1.9, 1.0], [-1.75, 1.15], [1.0, -1.9]], capGlow());
  }

  var DARK = {
    air: [airHouse, airFarm, airStore, airBarracks, airTower],
    water: [waterHouse, waterFarm, waterStore, waterBarracks, waterTower],
    fire: [fireHouse, fireFarm, fireStore, fireBarracks, fireTower],
    earth: [earthHouse, earthFarm, earthStore, earthBarracks, earthTower]
  };
  var MYTH = {
    air: [mAirHouse, mAirFarm, mAirStore, mAirBarracks, mAirTower, mAirPen, mAirSanctum],
    water: [mWaterHouse, mWaterFarm, mWaterStore, mWaterBarracks, mWaterTower, mWaterPen, mWaterSanctum],
    fire: [mFireHouse, mFireFarm, mFireStore, mFireBarracks, mFireTower, mFirePen, mFireSanctum],
    earth: [mEarthHouse, mEarthFarm, mEarthStore, mEarthBarracks, mEarthTower, mEarthPen, mEarthSanctum]
  };


  /* ================= SIGNATURE CREATURES ================= */
  function cGlow(col, em, k) { return new T3.MeshStandardMaterial({ color: lin(col), emissive: lin(em), emissiveIntensity: k == null ? 1 : k, roughness: 0.45 }); }
  function cFlat(col, extra) { return C(col, Object.assign({ flatShading: true, roughness: 0.85 }, extra || {})); }
  function pointAlong(mesh, dir) { mesh.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), dir.clone().normalize()); }

  /* Galehide Bear (Hufflepuff, Air): honey-gold bear with wind-crystal spines and gale rings at its paws */
  B.prototype.bear = function (x, z, s, ry) {
    var g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; g.scale.set(s, s, s); this.g.add(g);
    var fur = cFlat("#b47a36"), dark = cFlat("#5e3a1c"), belly = cFlat("#e2be86"), pale = cFlat("#f0e6cc");
    var body = new T3.Group(); g.add(body);
    this.add(new T3.SphereGeometry(0.5, 12, 9), fur, 0, 0.78, 0, { parent: body, s: [0.88, 0.78, 1.35] });
    this.add(new T3.SphereGeometry(0.4, 12, 9), fur, 0, 1.04, 0.26, { parent: body });
    this.add(new T3.SphereGeometry(0.43, 12, 9), fur, 0, 0.82, -0.36, { parent: body });
    this.add(new T3.SphereGeometry(0.3, 10, 8), belly, 0, 0.66, 0.32, { parent: body, s: [0.9, 0.8, 1.1] });
    this.add(new T3.SphereGeometry(0.1, 8, 6), fur, 0, 0.92, -0.78, { parent: body });
    var runeM = cGlow("#ffe9a0", "#ffc83a", 1.2);
    [-1, 1].forEach(function (sg) {
      [[0.95, 0.15, 0.5], [0.82, -0.15, 0.35], [0.7, -0.4, 0.25]].forEach(function (r) {
        this.add(new T3.BoxGeometry(0.03, 0.05, r[2]), runeM, sg * 0.43, r[0], r[1], { parent: body, ry: sg * 0.2, rz: sg * 0.35, noCast: true });
      }, this);
    }, this);
    var head = new T3.Group(); head.position.set(0, 1.0, 0.72); body.add(head);
    this.add(new T3.SphereGeometry(0.27, 12, 9), fur, 0, 0, 0, { parent: head, s: [1, 0.92, 1.05] });
    this.add(new T3.SphereGeometry(0.15, 10, 8), belly, 0, -0.07, 0.24, { parent: head, s: [0.9, 0.75, 1.2] });
    this.add(new T3.SphereGeometry(0.055, 8, 6), dark, 0, -0.02, 0.41, { parent: head });
    [-1, 1].forEach(function (sg) {
      this.add(new T3.SphereGeometry(0.085, 8, 6), fur, sg * 0.18, 0.21, -0.03, { parent: head, s: [1, 1, 0.6] });
      this.add(new T3.SphereGeometry(0.035, 8, 6), cGlow("#fff2b0", "#ffcc33", 2), sg * 0.11, 0.07, 0.21, { parent: head, noCast: true });
      this.add(new T3.ConeGeometry(0.04, 0.18, 4), pale, sg * 0.1, 0.24, 0.0, { parent: head, rz: -sg * 0.5, rx: -0.4 });
    }, this);
    var legs = [];
    [[-0.27, 0.42], [0.27, 0.42], [-0.29, -0.44], [0.29, -0.44]].forEach(function (l, i) {
      var lg = new T3.Group(); lg.position.set(l[0], 0.6, l[1]); g.add(lg);
      this.add(new T3.CylinderGeometry(0.17, 0.15, 0.55, 8), fur, 0, -0.27, 0, { parent: lg });
      this.add(new T3.SphereGeometry(0.14, 8, 6), dark, 0, -0.54, 0.05, { parent: lg, s: [1, 0.55, 1.25] });
      legs.push(lg);
    }, this);
    var crystM = cGlow("#fff4c8", "#ffd860", 1.6), crys = [];
    [[0, 1.42, 0.38, 0.12, -0.3], [0, 1.4, 0.12, 0.15, -0.4], [0, 1.3, -0.15, 0.13, -0.5], [0, 1.18, -0.4, 0.1, -0.6], [0.12, 1.32, 0.25, 0.08, -0.3], [-0.12, 1.3, 0.0, 0.08, -0.45]].forEach(function (c) {
      var m = this.add(new T3.OctahedronGeometry(c[3], 0), crystM, c[0], c[1], c[2], { parent: body, rx: c[4], noCast: true });
      m.scale.set(0.6, 2.0, 0.6); crys.push(m);
    }, this);
    var ringM = new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.5, depthWrite: false, side: T3.DoubleSide });
    var rings = [];
    [[-0.27, 0.46], [0.27, 0.46], [-0.29, -0.4], [0.29, -0.4]].forEach(function (l, i) {
      var r = this.add(new T3.TorusGeometry(0.2, 0.012, 4, 28, PI * 1.5), ringM, l[0], 0.08, l[1], { parent: g, rx: PI / 2, noCast: true, noReceive: true });
      rings.push([r, i]);
    }, this);
    var wisps = [];
    for (var w = 0; w < 10; w++) { var sp = new T3.Sprite(new T3.SpriteMaterial({ map: tex("ember"), color: lin("#fff6d0"), transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); sp.scale.set(0.06, 0.06, 1); g.add(sp); wisps.push([sp, this.rand() * 6.28, this.rand()]); }
    var L = new T3.PointLight("#ffd860", 0.5, 2.5, 2); L.position.set(0, 1.5, 0); g.add(L);
    var ph = this.rand() * 6;
    this.fx.push(function (t) {
      var c = ((t + ph) % 7) / 7, gale = c > 0.82 ? Math.sin((c - 0.82) / 0.18 * PI) : 0;
      body.scale.y = 1 + Math.sin(t * 1.6) * 0.015;
      head.rotation.y = Math.sin(t * 0.6 + ph) * 0.35; head.rotation.x = -gale * 0.5;
      legs.forEach(function (lg, i) { lg.rotation.x = gale * (i < 2 ? -0.35 : 0.15); });
      crystM.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.3 + gale * 1.5;
      L.intensity = 0.4 + gale * 1.5;
      rings.forEach(function (r) { r[0].rotation.z = t * 3 + r[1]; var k = 1 + gale * 2.2; r[0].scale.set(k, k, 1); });
      ringM.opacity = 0.35 + gale * 0.5;
      wisps.forEach(function (q) { var k = (t * 0.4 + q[2]) % 1, a = q[1] + t * 1.5; q[0].position.set(Math.cos(a) * (0.6 + gale), 0.1 + k * 1.4, Math.sin(a) * (0.8 + gale)); q[0].material.opacity = Math.sin(k * PI) * 0.8; });
    });
    return g;
  };

  /* Tide Raven (Ravenclaw, Water): eagle-sized raven with a crest of water and tail streamers of flowing water */
  B.prototype.raven = function (x, y, z, s, ry, fly) {
    var g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; g.scale.set(s, s, s); this.g.add(g);
    var fe = cFlat("#1d2940"), fe2 = cFlat("#2b3d5e"), beakM = cFlat("#3a404c", { metalness: 0.3 });
    var glass = new T3.MeshStandardMaterial({ color: lin("#8fd8ff"), emissive: lin("#2a9ae8"), emissiveIntensity: 0.9, transparent: true, opacity: 0.8, roughness: 0.05, flatShading: true });
    this.add(new T3.SphereGeometry(0.2, 10, 8), fe, 0, 0.36, 0, { parent: g, s: [0.9, 0.9, 1.65] });
    this.add(new T3.SphereGeometry(0.16, 10, 8), fe2, 0, 0.34, 0.16, { parent: g });
    var head = new T3.Group(); head.position.set(0, 0.55, 0.3); g.add(head);
    this.add(new T3.SphereGeometry(0.12, 10, 8), fe, 0, 0, 0, { parent: head });
    this.add(new T3.ConeGeometry(0.05, 0.22, 6), beakM, 0, -0.02, 0.18, { parent: head, rx: PI / 2 });
    this.add(new T3.ConeGeometry(0.02, 0.06, 5), beakM, 0, -0.05, 0.28, { parent: head, rx: PI });
    [-1, 1].forEach(function (sg) { this.add(new T3.SphereGeometry(0.025, 8, 6), cGlow("#c6f4ff", "#3ad0ff", 2.2), sg * 0.07, 0.03, 0.08, { parent: head, noCast: true }); }, this);
    for (var c = 0; c < 5; c++) {
      var a = -0.5 + c * 0.25, m = this.add(new T3.ConeGeometry(0.025, 0.2 + (c % 2) * 0.06, 5), glass, Math.sin(a) * 0.05, 0.1, -0.05, { parent: head, noCast: true });
      m.rotation.x = -0.9; m.rotation.z = -a * 0.9;
    }
    var sh = new T3.Shape(); sh.moveTo(0, 0.1); sh.lineTo(0.3, 0.12); sh.lineTo(0.6, 0.06); sh.lineTo(0.72, -0.02); sh.lineTo(0.6, -0.04); sh.lineTo(0.66, -0.1); sh.lineTo(0.52, -0.1); sh.lineTo(0.56, -0.16); sh.lineTo(0.4, -0.14); sh.lineTo(0.2, -0.16); sh.lineTo(0, -0.1);
    var tip = new T3.Shape(); tip.moveTo(0.5, -0.02); tip.lineTo(0.72, -0.02); tip.lineTo(0.6, -0.04); tip.lineTo(0.66, -0.1); tip.lineTo(0.52, -0.1); tip.lineTo(0.56, -0.16); tip.lineTo(0.42, -0.14); tip.closePath();
    var wingM = cFlat("#22314c", { side: T3.DoubleSide }), tipM = cGlow("#9fe4ff", "#3ab8ff", 1.2); tipM.side = T3.DoubleSide;
    var wings = [];
    [-1, 1].forEach(function (sg) {
      var pv = new T3.Group(); pv.position.set(sg * 0.12, 0.44, 0.08); pv.scale.x = sg; g.add(pv);
      this.add(new T3.ShapeGeometry(sh), wingM, 0, 0, 0, { parent: pv, rx: -PI / 2 });
      this.add(new T3.ShapeGeometry(tip), tipM, 0, 0.005, 0, { parent: pv, rx: -PI / 2, noCast: true });
      wings.push([pv, sg]);
    }, this);
    var wt = tex("water", 0.3, 1.2);
    var ribbonM = new T3.MeshStandardMaterial({ map: wt, transparent: true, opacity: 0.8, roughness: 0.1, side: T3.DoubleSide, emissive: lin("#1a6ab0"), emissiveIntensity: 0.4 });
    var tails = [];
    [-0.12, 0, 0.12].forEach(function (dx, i) {
      var pv = new T3.Group(); pv.position.set(dx, 0.36, -0.3); g.add(pv);
      this.add(new T3.PlaneGeometry(0.07, 0.5 + (i === 1 ? 0.18 : 0)), ribbonM, 0, -0.25 - (i === 1 ? 0.09 : 0), 0, { parent: pv, noCast: true });
      pv.rotation.x = 1.1; pv.rotation.z = dx * 1.5; tails.push([pv, i]);
    }, this);
    if (!fly) [-0.06, 0.06].forEach(function (lx) { this.add(new T3.CylinderGeometry(0.015, 0.015, 0.18, 5), beakM, lx, 0.1, 0.03, { parent: g }); }, this);
    var drops = [], dm = new T3.SpriteMaterial({ map: tex("drop"), transparent: true, depthWrite: false });
    for (var d = 0; d < 6; d++) { var sp = new T3.Sprite(dm); sp.scale.set(0.05, 0.05, 1); g.add(sp); drops.push([sp, d / 6 * 2 * PI]); }
    var ph = this.rand() * 6;
    this.fx.push(function (t) {
      var c = ((t + ph) % 6) / 6, open = fly || c > 0.85, flap = fly ? Math.sin(t * 5 + ph) * 0.6 : Math.sin((c - 0.85) / 0.15 * PI * 3) * 0.7;
      wings.forEach(function (w) { if (open) { w[0].rotation.set(0, 0, flap * w[1]); } else { w[0].rotation.set(0, w[1] * 1.3, -w[1] * 0.3); } });
      head.rotation.y = fly ? 0 : Math.sin(t * 0.9 + ph) * 0.5; head.rotation.x = Math.sin(t * 0.7) * 0.1;
      tails.forEach(function (q) { q[0].rotation.x = 1.1 + Math.sin(t * 3 + q[1]) * 0.18; });
      wt.offset.y = -t * 0.6;
      drops.forEach(function (q) { var a = q[1] + t * 1.4; q[0].position.set(Math.cos(a) * 0.35, 0.4 + Math.sin(a * 2 + t) * 0.08, Math.sin(a) * 0.45); });
      tipM.emissiveIntensity = 1.0 + Math.sin(t * 2.2 + ph) * 0.4;
    });
    return g;
  };

  /* Ember Lion (Gryffindor, Fire): a lion whose mane and tail tip are living flame, with molten cracks in its hide */
  B.prototype.lion = function (x, z, s, ry) {
    var g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; g.scale.set(s, s, s); this.g.add(g);
    var fur = cFlat("#c8843c"), lt = cFlat("#e8b47a"), dk = cFlat("#4a2412");
    var body = new T3.Group(); g.add(body);
    this.add(new T3.SphereGeometry(0.42, 12, 9), fur, 0, 0.78, -0.05, { parent: body, s: [0.8, 0.72, 1.55] });
    this.add(new T3.SphereGeometry(0.34, 12, 9), fur, 0, 0.86, 0.38, { parent: body });
    this.add(new T3.SphereGeometry(0.26, 10, 8), lt, 0, 0.7, 0.42, { parent: body, s: [0.85, 0.8, 1] });
    var crack = cGlow("#ffc070", "#ff6a10", 1.8), cracks = [];
    [[0.33, 0.85, 0.1, 0.35, 0.4], [0.31, 0.72, -0.25, 0.3, -0.3], [0.3, 0.92, -0.4, 0.22, 0.7], [0, 1.08, 0.0, 0.35, 0]].forEach(function (q) {
      [-1, 1].forEach(function (sg) { if (q[0] === 0 && sg < 0) return; cracks.push(this.add(new T3.BoxGeometry(0.025, 0.03, q[3]), crack, sg * q[0], q[1], q[2], { parent: body, rx: q[4] * 0.3, ry: q[4], noCast: true })); }, this);
    }, this);
    var legs = [];
    [[-0.21, 0.4], [0.21, 0.4], [-0.23, -0.48], [0.23, -0.48]].forEach(function (l) {
      var lg = new T3.Group(); lg.position.set(l[0], 0.62, l[1]); g.add(lg);
      this.add(new T3.CylinderGeometry(0.135, 0.11, 0.6, 8), fur, 0, -0.3, 0, { parent: lg });
      this.add(new T3.SphereGeometry(0.13, 8, 6), lt, 0, -0.6, 0.05, { parent: lg, s: [1, 0.55, 1.3] });
      legs.push(lg);
    }, this);
    var head = new T3.Group(); head.position.set(0, 1.12, 0.74); body.add(head);
    this.add(new T3.SphereGeometry(0.3, 12, 9), cGlow("#5a1608", "#a02008", 0.35), 0, 0.03, -0.16, { parent: head, s: [1.1, 1.05, 0.55] });
    this.add(new T3.SphereGeometry(0.22, 12, 9), fur, 0, 0, 0.08, { parent: head, s: [1, 1, 1.05] });
    this.add(new T3.SphereGeometry(0.12, 10, 8), lt, 0, -0.07, 0.26, { parent: head, s: [1, 0.8, 1] });
    this.add(new T3.SphereGeometry(0.04, 8, 6), dk, 0, -0.01, 0.37, { parent: head });
    [-1, 1].forEach(function (sg) {
      this.add(new T3.SphereGeometry(0.03, 8, 6), cGlow("#fff2a0", "#ffb020", 2.4), sg * 0.09, 0.06, 0.24, { parent: head, noCast: true });
      this.add(new T3.ConeGeometry(0.05, 0.08, 5), fur, sg * 0.16, 0.2, 0.0, { parent: head });
    }, this);
    var mane = new T3.Group(); mane.position.set(0, 0.02, -0.04); head.add(mane);
    var cols = ["#ff4a10", "#ff7a1a", "#ffb030", "#ffe080"], flames = [];
    for (var i = 0; i < 18; i++) {
      var a = i / 18 * 2 * PI, lay = i % 3, mat = new T3.MeshBasicMaterial({ color: lin(cols[(i + lay) % 3]), transparent: true, opacity: 0.7, blending: T3.AdditiveBlending, depthWrite: false });
      var h = 0.32 + (i % 4) * 0.06, m = this.add(new T3.ConeGeometry(0.075, h, 6), mat, Math.cos(a) * 0.24, Math.sin(a) * 0.24, -0.12 - lay * 0.05, { parent: mane, noCast: true, noReceive: true });
      pointAlong(m, new T3.Vector3(Math.cos(a), Math.sin(a) + 0.35, -0.55));
      m.position.add(new T3.Vector3(Math.cos(a), Math.sin(a) + 0.35, -0.55).normalize().multiplyScalar(h / 2));
      flames.push([m, i]);
    }
    var tailPts = [new T3.Vector3(0, 0.85, -0.65), new T3.Vector3(0, 0.6, -0.95), new T3.Vector3(0.1, 0.55, -1.2), new T3.Vector3(0.12, 0.75, -1.35)];
    this.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(tailPts), 16, 0.035, 6), fur, 0, 0, 0, { parent: body });
    var tailFire = new T3.Group(); tailFire.position.set(0.12, 0.78, -1.36); body.add(tailFire);
    [["#ff6a1a", 0.08, 0.3], ["#ffd060", 0.04, 0.2]].forEach(function (f) { this.add(new T3.ConeGeometry(f[1], f[2], 8), new T3.MeshBasicMaterial({ color: lin(f[0]), transparent: true, opacity: 0.9, blending: T3.AdditiveBlending, depthWrite: false }), 0, f[2] / 2, 0, { parent: tailFire, noCast: true, noReceive: true }); }, this);
    var L = new T3.PointLight("#ff8a3d", 1.0, 3, 2); L.position.set(0, 1.2, 0.7); g.add(L);
    var ph = this.rand() * 6;
    this.fx.push(function (t) {
      var c = ((t + ph) % 6.5) / 6.5, roar = c > 0.78 ? Math.sin((c - 0.78) / 0.22 * PI) : 0;
      body.scale.y = 1 + Math.sin(t * 1.8) * 0.012;
      head.rotation.x = -roar * 0.45; head.rotation.y = Math.sin(t * 0.5 + ph) * 0.3 * (1 - roar);
      flames.forEach(function (q) { var k = 1 + Math.sin(t * 11 + q[1] * 1.7) * 0.18 + roar * 0.6; q[0].scale.set(1 + roar * 0.3, k, 1 + roar * 0.3); });
      tailFire.scale.setScalar(1 + Math.sin(t * 10) * 0.15);
      cracks.forEach(function (m, i) { m.material.emissiveIntensity = 1.5 + Math.sin(t * 2 + i) * 0.4 + roar; });
      L.intensity = 0.9 + Math.sin(t * 13) * 0.1 + roar * 1.6;
    });
    return g;
  };

  /* Rootcoil Serpent (Slytherin, Earth): a moss-scaled serpent with stone horns, a leaf frill and rune rings */
  B.prototype.serpent = function (x, z, s, ry) {
    var g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; g.scale.set(s, s, s); this.g.add(g);
    var sc = cFlat("#3f6e3a"), sc2 = cFlat("#2c5530"), belly = cFlat("#b8c27a"), horn = cFlat("#9aa0a2");
    var leafSh = new T3.Shape(); leafSh.moveTo(0, 0); leafSh.quadraticCurveTo(0.07, 0.1, 0, 0.24); leafSh.quadraticCurveTo(-0.07, 0.1, 0, 0);
    var leafM = cFlat("#6aae48", { side: T3.DoubleSide }), leafM2 = cFlat("#4f9a3a", { side: T3.DoubleSide });
    var runeM = cGlow("#9effc0", "#3cff8a", 1.4);
    var coil = [];
    for (var i = 0; i <= 40; i++) { var t = i / 40, a = t * PI * 3.4 + 0.6, r = 0.18 + t * 0.42; coil.push(new T3.Vector3(Math.cos(a) * r, 0.13 + (1 - t) * 0.16, Math.sin(a) * r)); }
    var curve = new T3.CatmullRomCurve3(coil);
    var tg = new T3.TubeGeometry(curve, 90, 0.14, 9), tp = tg.attributes.position;
    for (var k = 0; k < tp.count; k++) { var u = Math.floor(k / 10) / 90, c = curve.getPointAt(Math.min(1, u)), dx = tp.getX(k) - c.x, dy = tp.getY(k) - c.y, dz = tp.getZ(k) - c.z, f = 0.35 + 0.65 * Math.min(1, u * 1.6); tp.setXYZ(k, c.x + dx * f, c.y + dy * f, c.z + dz * f); }
    tg.computeVertexNormals();
    this.add(tg, sc, 0, 0, 0, { parent: g });
    for (var l = 4; l < 40; l += 3) {
      var p = coil[l], nx = coil[l + 1] ? coil[l + 1].clone().sub(p) : new T3.Vector3(1, 0, 0);
      var lf = this.add(new T3.ShapeGeometry(leafSh), l % 2 ? leafM : leafM2, p.x, p.y + 0.1 * (0.35 + 0.65 * Math.min(1, l / 40 * 1.6)), p.z, { parent: g, noCast: true });
      lf.rotation.y = Math.atan2(nx.x, nx.z) + PI / 2; lf.rotation.z = (l % 2 ? 0.3 : -0.3); lf.scale.setScalar(0.5 + l / 60);
    }
    [12, 26].forEach(function (l) { var p = coil[l], nx = coil[l + 1].clone().sub(p).normalize(); var rr = this.add(new T3.TorusGeometry(0.13 * (0.35 + 0.65 * Math.min(1, l / 40 * 1.6)) + 0.01, 0.018, 5, 18), runeM, p.x, p.y, p.z, { parent: g, noCast: true }); rr.quaternion.setFromUnitVectors(new T3.Vector3(0, 0, 1), nx); }, this);
    var base = coil[40].clone();
    var N = 11, segs = [];
    for (var n = 0; n < N; n++) {
      var rad = 0.14 - n * 0.004, m = this.add(new T3.SphereGeometry(rad, 10, 8), n % 4 === 2 ? sc2 : sc, 0, 0, 0, { parent: g });
      if (n % 2 === 0 && n > 1) { var lf2 = this.add(new T3.ShapeGeometry(leafSh), leafM, 0, rad * 0.7, 0, { parent: m, noCast: true }); lf2.scale.setScalar(0.8); }
      if (n === 5 || n === 9) this.add(new T3.TorusGeometry(rad + 0.01, 0.016, 5, 16), runeM, 0, 0, 0, { parent: m, rx: PI / 2, noCast: true });
      segs.push(m);
    }
    var head = new T3.Group(); head.rotation.order = "YXZ"; g.add(head);
    this.add(new T3.SphereGeometry(0.15, 12, 9), sc, 0, 0, 0.05, { parent: head, s: [1, 0.68, 1.5] });
    this.add(new T3.SphereGeometry(0.11, 10, 8), belly, 0, -0.05, 0.1, { parent: head, s: [0.9, 0.45, 1.4] });
    [-1, 1].forEach(function (sg) {
      this.add(new T3.ConeGeometry(0.035, 0.22, 5), horn, sg * 0.08, 0.08, -0.12, { parent: head, rx: -1.9, rz: sg * 0.25 });
      this.add(new T3.SphereGeometry(0.03, 8, 6), cGlow("#d8ffb0", "#7aff40", 2.2), sg * 0.075, 0.04, 0.17, { parent: head, noCast: true });
    }, this);
    for (var fr = 0; fr < 7; fr++) {
      var fa = -1.2 + fr * 0.4, lf3 = this.add(new T3.ShapeGeometry(leafSh), fr % 2 ? leafM : leafM2, Math.sin(fa) * 0.12, 0.02 + Math.cos(fa) * 0.06, -0.08, { parent: head, noCast: true });
      lf3.rotation.set(-0.9, 0, -fa); lf3.scale.setScalar(1.3);
    }
    var tongue = this.add(new T3.BoxGeometry(0.02, 0.008, 0.14), cFlat("#c0303a"), 0, -0.04, 0.3, { parent: head, noCast: true });
    var ph = this.rand() * 6;
    this.fx.push(function (t) {
      var c = ((t + ph) % 6) / 6, strike = c > 0.8 ? Math.sin((c - 0.8) / 0.2 * PI) : 0;
      var top = new T3.Vector3(Math.sin(t * 0.6 + ph) * 0.18 - 0.05, 1.3 - strike * 0.35, -0.1 + strike * 0.6);
      for (var i = 0; i < N; i++) {
        var u = (i + 1) / (N + 1), side = Math.sin(u * PI) * 0.22 * Math.sin(t * 1.1 + ph);
        var px = base.x + (top.x - base.x) * u + side, pz = base.z + (top.z - base.z) * u, py = base.y + (top.y - base.y) * Math.pow(u, 0.75);
        segs[i].position.set(px, py, pz);
      }
      var last = segs[N - 1].position;
      head.position.set(top.x, top.y + 0.05, top.z);
      head.rotation.y = Math.atan2(top.x - last.x, top.z - last.z + 0.25); head.rotation.x = 0.25 + strike * 0.35;
      runeM.emissiveIntensity = 1.2 + Math.sin(t * 1.5) * 0.4 + strike;
      tongue.visible = (Math.sin(t * 7) > 0.6);
    });
    return g;
  };

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
