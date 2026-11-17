
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


  /* ================= MYTHIC AGE BUILDINGS in the new design languages ================= */
  function hiveR(R, H, y0) { return function (y) { var t = (y - y0) / H; return R * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.5); }; }
  function bigHive(b, x, z, R, H, y0, opts) {
    opts = opts || {};
    dSkep(b, x, y0, z, R, H);
    var rOn = hiveR(R, H, y0), dark = C(BY.black);
    (opts.bands || [0.22, 0.55]).forEach(function (f, i) { var y = y0 + H * f; b.add(new T3.TorusGeometry(rOn(y) + 0.015, i === 1 ? 0.035 : 0.025, 6, 32), i === 1 ? glowMat("#ffd060", "#c88a10", 0.5) : dark, x, y, z, { rx: PI / 2 }); });
    (opts.wins || []).forEach(function (w) { var y = y0 + H * w[1], r = rOn(y) + 0.015; hexLamp(b, x + Math.cos(w[0]) * r, y, z + Math.sin(w[0]) * r, Math.cos(w[0]), Math.sin(w[0]), w[2] || 1); });
    if (opts.door) { var dy = y0, dr = rOn(y0 + 0.2) - 0.02; hiveDoor(b, x + Math.cos(PI / 4) * dr, dy, z + Math.sin(PI / 4) * dr, PI / 4, opts.door[0], opts.door[1], 0.5); }
    if (opts.cupola) { var cy = y0 + H - 0.08; dSkep(b, x, cy, z, opts.cupola, opts.cupola * 1.6); b.cyl(0.015, 0.015, 0.3, 5, dark, x, cy + opts.cupola * 1.55, z); windRose(b, x + 0.02, cy + opts.cupola * 1.55 + 0.32, z + 0.02, opts.rose || 0.7); }
    return rOn;
  }
  function amberFloat(b, x, y, z, s) {
    var g = new T3.Group(); b.g.add(g);
    var amber = glowMat("#ffd27a", "#ffa420", 1.3);
    b.add(new T3.CylinderGeometry(0.1 * s, 0.1 * s, 0.22 * s, 6), amber, 0, 0, 0, { parent: g, noCast: true });
    b.add(new T3.ConeGeometry(0.1 * s, 0.13 * s, 6), amber, 0, 0.175 * s, 0, { parent: g, noCast: true });
    b.add(new T3.ConeGeometry(0.1 * s, 0.13 * s, 6), amber, 0, -0.175 * s, 0, { parent: g, rx: PI, noCast: true });
    var L = new T3.PointLight("#ffb030", 0.6 * s, 2.5, 2); g.add(L);
    var ph = b.rand() * 6; b.fx.push(function (t) { g.position.set(x, y + Math.sin(t * 1.3 + ph) * 0.07, z); g.rotation.y = t * 0.7; });
  }
  function hexStep(b, r, h, y0, x, z) {
    var hc = M("honeycomb", r * 1.5, r * 1.5), hcS = M("honeycomb", r * 3, 0.4);
    b.add(new T3.CylinderGeometry(r, r + 0.05, h, 6), [hcS, hc, hc], x || 0, y0 + h / 2, z || 0, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(r + 0.015, r + 0.015, 0.03, 6, 1, true), C(BY.black), x || 0, y0 + h - 0.01, z || 0, { ry: PI / 6 });
  }

  /* ---------------- Hufflepuff Mythic ---------------- */
  function hAirHouse(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.45, 1.2, 0.8, 1.0, -0.3);
    hexStep(b, 1.15, 0.12, 0, -0.15, -0.15); hexStep(b, 0.95, 0.12, 0.12, -0.15, -0.15);
    bigHive(b, -0.15, -0.15, 0.78, 1.35, 0.24, { door: [0.3, 0.22], cupola: 0.24, rose: 0.6, wins: [[PI / 4 - 0.9, 0.42], [PI / 4 + 0.9, 0.42], [PI / 4, 0.68, 0.8]] });
    b.add(new T3.BoxGeometry(0.62, 0.035, 0.3), M("canvasBY", 0.7, 0.4), -0.15 + 0.75 * 0.707, 0.82, -0.15 + 0.75 * 0.707, { ry: PI / 4, rx: 0.4 });
    for (var s = 0; s < 2; s++) b.box(0.5, 0.24 - s * 0.12, 0.18, M("honeycomb", 0.5, 0.3), 0.72 + s * 0.13, 0, 0.72 + s * 0.13, { ry: PI / 4 });
    amberFloat(b, 0.75, 1.75, -0.85, 0.9);
    honeyJars(b, [[-1.1, 0.95], [-0.9, 1.1], [-1.15, 1.2]]); b.hay(1.1, -1.0, 0.4);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 0.95 + b.rand() * 0.5, "#5a9238");
  }
  function hAirFarm(b) {
    b.slab(4.2, "grassAir", "sideAir");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.15, 0, 0.15);
    b.wheat(-1.2, -1.2, 1.5, 1.5, 8, 9, ["#d9b84a", "#c8a83e", "#e6cc6a", "#b8a03a"]);
    var hc = M("honeycomb", 3, 0.3);
    [[0.15, 1.75, 3.3, 0.16], [1.75, 0.15, 0.16, 3.3]].forEach(function (w) { b.box(w[2], 0.32, w[3], hc, w[0], 0, w[1]); });
    b.box(3.3, 0.04, 0.17, C(BY.black), 0.15, 0.32, 1.75); b.box(0.17, 0.04, 3.3, C(BY.black), 1.75, 0.32, 0.15);
    var TX = -1.55, TZ = -1.55;
    hexStep(b, 0.6, 0.18, 0, TX, TZ);
    b.cyl(0.32, 0.4, 1.3, 6, M("honeycomb", 1.5, 1.4), TX, 0.18, TZ, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.45, 0.45, 0.06, 6), C(BY.black), TX, 1.5, TZ, { ry: PI / 6 });
    dSkep(b, TX, 1.53, TZ, 0.36, 0.6);
    windRose(b, TX + 0.25, 1.75, TZ + 0.25, 2.2);
    [[-1.65, 0.9], [-1.65, 0.3], [-1.65, -0.3]].forEach(function (q) { b.cyl(0.03, 0.03, 0.35, 5, M("plankDark", 0.3, 0.5), q[0], 0, q[1]); b.cyl(0.2, 0.2, 0.04, 6, M("honeycomb", 0.4, 0.4), q[0], 0.35, q[1]); dSkep(b, q[0], 0.39, q[1], 0.16, 0.34); });
    var pole = [1.95, 2.6, -1.95];
    b.cyl(0.035, 0.05, 2.6, 8, M("plankDark", 0.3, 2), pole[0], 0, pole[2]);
    kite(b, pole[0], pole[1], pole[2], 0, 3.4);
    amberFloat(b, 0.15, 1.6, 0.15, 1.0);
    honeyJars(b, [[-1.85, 1.85], [-1.6, 1.95]]);
  }
  function hAirStore(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.45, 1.1, 1.0, 1.0, -0.3);
    var CX = -0.2, CZ = -0.2, post = M("plankDark", 0.3, 1);
    hexStep(b, 1.2, 0.14, 0, CX, CZ); hexStep(b, 1.02, 0.12, 0.14, CX, CZ);
    for (var k = 0; k < 6; k++) { var p = dRing(0.92, k * PI / 3 + PI / 6); b.cyl(0.05, 0.055, 1.05, 6, post, CX + p[0], 0.26, CZ + p[1]); b.cyl(0.065, 0.065, 0.05, 6, C(BY.black), CX + p[0], 0.75, CZ + p[1]); }
    b.add(new T3.ConeGeometry(1.2, 0.55, 6, 1, true), M("canvasBY", 3, 1, { side: T3.DoubleSide }), CX, 1.31 + 0.275, CZ, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.42, 0.42, 0.28, 6), M("canvasBY", 1, 0.5), CX, 1.72, CZ, { ry: PI / 6 });
    b.add(new T3.ConeGeometry(0.62, 0.5, 6, 1, true), M("canvasBY", 2, 1, { side: T3.DoubleSide }), CX, 1.86 + 0.25, CZ, { ry: PI / 6 });
    windRose(b, CX + 0.03, 2.5, CZ + 0.03, 0.7);
    b.lift(0.26, function () { this.logs(CX - 0.3, CZ - 0.2, PI / 2); this.crate(CX + 0.35, CZ - 0.4, 0.26, 0.2); this.sack(CX + 0.1, CZ + 0.4, 0, "#c9a86a"); this.gold(CX - 0.25, CZ + 0.35); });
    honeyJars(b, [[CX + 0.35, CZ + 0.15]]);
    var MX = 1.15, MZ = 0.55;
    b.cyl(0.05, 0.07, 2.2, 8, post, MX, 0, MZ);
    bySail(b, MX, 2.1, MZ, PI / 4, 1.1);
    b.beam([MX, 1.6, MZ], [MX + 0.4, 1.8, MZ + 0.4], 0.03, post);
    var pv = new T3.Group(); pv.position.set(MX + 0.4, 1.8, MZ + 0.4); b.g.add(pv);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.8, 4), C("#d8cba6"), 0, -0.4, 0, { parent: pv });
    b.add(new T3.BoxGeometry(0.2, 0.2, 0.2), M("plankWarm", 0.3, 0.3), 0, -0.9, 0, { parent: pv });
    b.fx.push(function (t) { pv.rotation.z = Math.sin(t * 1.2) * 0.08; });
    amberFloat(b, -1.15, 1.4, 0.9, 0.8);
  }
  function hAirBarracks(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.4, 1.35, 2.6, 1.4);
    var HX = -0.35, HZ = -0.65, dark = C(BY.black);
    b.box(3.1, 0.14, 1.8, M("honeycomb", 3, 1.8), HX, 0, HZ); b.box(3.12, 0.03, 1.82, dark, HX, 0.13, HZ);
    var sk = M("skep", 4, 3), skE = M("skep", 3, 2);
    b.add(new T3.CylinderGeometry(0.72, 0.72, 2.0, 22, 1, true, 0, PI), sk, HX, 0.14, HZ, { rz: PI / 2 });
    [-1, 1].forEach(function (s2) { b.add(new T3.SphereGeometry(0.72, 22, 10, 0, PI, 0, PI / 2), skE, HX + s2 * 1.0, 0.14, HZ, { ry: s2 * PI / 2 }); });
    for (var a2 = 0; a2 < 6; a2++) { var x2 = HX - 0.85 + a2 * 0.34; b.add(new T3.TorusGeometry(0.735, a2 === 2 || a2 === 3 ? 0.035 : 0.022, 5, 20, PI), a2 === 2 || a2 === 3 ? glowMat("#ffd060", "#c88a10", 0.5) : dark, x2, 0.14, HZ, { ry: PI / 2 }); }
    bigHive(b, HX, HZ, 0.62, 1.15, 0.62, { bands: [0.3], cupola: 0.2, rose: 0.6, wins: [[PI / 2 - 0.5, 0.35], [PI / 2 + 0.5, 0.35]] });
    hiveDoor(b, HX, 0.14, HZ + 0.71, 0, 0.42, 0.3, 0.45);
    [-0.7, 0.7].forEach(function (dx) { hexLamp(b, HX + dx, 0.48, HZ + 0.6, 0, 1); });
    b.add(new T3.BoxGeometry(1.6, 0.035, 0.42), M("canvasBY", 1.6, 0.5), HX, 0.86, HZ + 0.88, { rx: 0.45 });
    [[1.85, -1.55], [-1.95, -1.6]].forEach(function (m, i) { b.cyl(0.04, 0.055, 2.5, 8, M("plankDark", 0.3, 2), m[0], 0, m[1]); bySail(b, m[0], 2.4, m[1], PI / 4, 1.35); dPennant(b, m[0], 2.5, m[1], i ? BY.yellow : BY.black); });
    b.banner(HX - 0.95, HZ + 1.25, 0, "bannerAir", 1.5); b.banner(HX + 0.95, HZ + 1.25, 0, "bannerAir", 1.5);
    b.target(1.3, 1.45, 0.5); b.target(1.8, 0.95, 0.7); b.dummy(-1.5, 1.4, 0.3);
    honeyJars(b, [[-1.95, 0.75], [-1.8, 0.9]]);
  }
  function hAirTower(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var post = M("plankDark", 0.4, 3), rope = C("#d8cba6");
    hexStep(b, 0.75, 0.16, 0); hexStep(b, 0.55, 0.12, 0.16);
    b.cyl(0.09, 0.13, 3.5, 8, post, 0, 0.28, 0);
    [[1.3, 0.25], [-0.25, 1.3], [0.25, -1.3], [-1.3, -0.25]].forEach(function (g) { b.beam([0, 3.2, 0], [g[0], 0, g[1]], 0.01, rope); b.cyl(0.03, 0.04, 0.15, 5, post, g[0], 0, g[1]); });
    [[1.7, 0.42, 0.32], [2.75, 0.55, 0.4]].forEach(function (n, i) {
      var NY = n[0];
      b.add(new T3.CylinderGeometry(n[1], n[1] * 0.78, n[2], 6, 1, true), M("wattle", 3, 0.6, { side: T3.DoubleSide }), 0, NY + n[2] / 2, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(n[1] * 0.78, n[1] * 0.78, 0.05, 6), M("plankWarm", 0.8, 0.8), 0, NY + 0.02, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(n[1] + 0.02, n[1] + 0.02, 0.04, 6, 1, true), i ? glowMat("#ffd060", "#c88a10", 0.5) : C(BY.black), 0, NY + n[2], 0, { ry: PI / 6 });
    });
    for (var k = 0; k < 3; k++) { var p = dRing(0.5, k * 2 * PI / 3 + 0.4); b.beam([p[0], 3.3, p[1]], [0, 3.85, 0], 0.015, post); }
    b.add(new T3.ConeGeometry(0.7, 0.48, 6, 1, true), M("canvasBY", 2, 0.6, { side: T3.DoubleSide }), 0, 3.8, 0, { ry: PI / 6 });
    windRose(b, 0.03, 4.2, 0.03, 0.75);
    kite(b, 0, 3.95, 0, 1, 4.6);
    for (var r = 0; r < 12; r++) { var t = r / 12, y = 0.4 + t * 2.3, o = 0.38 - t * 0.12; b.beam([o + 0.07, y, o - 0.07], [o - 0.07, y, o + 0.07], 0.012, M("plankWarm", 0.2, 0.2)); }
    [-0.1, 0.1].forEach(function (dx) { b.beam([0.38 + dx * 0.7, 0.3, 0.38 - dx * 0.7], [0.26 + dx * 0.7, 2.7, 0.26 - dx * 0.7], 0.012, rope); });
    amberFloat(b, 0.0, 2.35, 0.0, 0.7);
    b.hay(1.1, -1.0, 0.3);
  }
  function hAirPen(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.6, 1.25, 2.2, 1.6, -0.3);
    hexStep(b, 1.65, 0.12, 0, -0.55, -0.55);
    var R = 1.35, H = 1.35, x = -0.55, z = -0.55;
    dSkep(b, x, 0.12, z, R, H);
    var rOn = hiveR(R, H, 0.12), dark = C(BY.black);
    [0.3, 0.6].forEach(function (f, i) { var y = 0.12 + H * f; b.add(new T3.TorusGeometry(rOn(y) + 0.015, 0.03, 6, 36), i ? glowMat("#ffd060", "#c88a10", 0.5) : dark, x, y, z, { rx: PI / 2 }); });
    var dr = rOn(0.5) - 0.05;
    hiveDoor(b, x + Math.cos(PI / 4) * dr, 0.12, z + Math.sin(PI / 4) * dr, PI / 4, 0.75, 0.42, 0.3);
    b.add(new T3.BoxGeometry(1.2, 0.04, 0.5), M("canvasBY", 1.2, 0.5), x + Math.cos(PI / 4) * (dr + 0.15), 1.12, z + Math.sin(PI / 4) * (dr + 0.15), { ry: PI / 4, rx: 0.45 });
    [[PI / 4 - 0.9, 0.55], [PI / 4 + 0.9, 0.55]].forEach(function (w) { var y = 0.12 + H * w[1], r = rOn(y) + 0.015; hexLamp(b, x + Math.cos(w[0]) * r, y, z + Math.sin(w[0]) * r, Math.cos(w[0]), Math.sin(w[0])); });
    b.cyl(0.015, 0.015, 0.4, 5, dark, x, 0.12 + H - 0.05, z); windRose(b, x + 0.02, 0.12 + H + 0.38, z + 0.02, 0.9);
    b.bear(0.95, 0.95, 0.7, -0.5);
    var hc = M("honeycomb", 0.2, 0.4);
    [[2.0, -1.0], [2.0, 0.3], [2.0, 1.6], [0.3, 2.0], [-1.0, 2.0]].forEach(function (p) { b.cyl(0.07, 0.08, 0.5, 6, hc, p[0], 0, p[1]); b.cyl(0.085, 0.085, 0.04, 6, dark, p[0], 0.5, p[1]); });
    honeyJars(b, [[-1.85, 1.6], [-1.65, 1.75], [-1.9, 1.85]]);
    amberFloat(b, 1.6, 1.6, -1.5, 0.9);
    b.banner(-0.2, 2.05, 0, "bannerAir", 1.5);
  }
  function hAirSanctum(b) {
    b.slab(4.2, "grassAir", "sideAir");
    hexStep(b, 1.95, 0.14, 0); hexStep(b, 1.65, 0.14, 0.14); hexStep(b, 1.35, 0.12, 0.28);
    for (var s = 0; s < 3; s++) b.box(0.8, 0.14 * (s + 1), 0.22, M("honeycomb", 0.8, 0.3), (1.55 + (2 - s) * 0.18) * 0.707, 0, (1.55 + (2 - s) * 0.18) * 0.707, { ry: PI / 4 });
    var dark = C(BY.black), post = M("plankDark", 0.3, 2), Y = 0.4;
    for (var k = 0; k < 6; k++) {
      var p = dRing(1.15, k * PI / 3 + PI / 6);
      b.cyl(0.08, 0.09, 1.9, 6, post, p[0], Y, p[1]);
      [0.5, 1.2].forEach(function (yy, i) { b.cyl(0.1, 0.1, 0.07, 6, i ? glowMat("#ffd060", "#c88a10", 0.5) : dark, p[0], Y + yy, p[1]); });
    }
    b.add(new T3.TorusGeometry(1.18, 0.07, 6, 6), M("honeycomb", 3, 0.3), 0, Y + 1.9, 0, { rx: PI / 2, rz: PI / 6 });
    b.add(new T3.ConeGeometry(1.45, 0.75, 6, 1, true), M("canvasBY", 3, 1, { side: T3.DoubleSide }), 0, Y + 1.95 + 0.375, 0, { ry: PI / 6 });
    windRose(b, 0.03, Y + 2.85, 0.03, 0.9);
    var core = new T3.Group(); b.g.add(core);
    var amber = glowMat("#ffd27a", "#ffa420", 1.6);
    b.add(new T3.CylinderGeometry(0.26, 0.26, 0.55, 6), amber, 0, 0, 0, { parent: core, noCast: true });
    b.add(new T3.ConeGeometry(0.26, 0.32, 6), amber, 0, 0.43, 0, { parent: core, noCast: true });
    b.add(new T3.ConeGeometry(0.26, 0.32, 6), amber, 0, -0.43, 0, { parent: core, rx: PI, noCast: true });
    var L = new T3.PointLight("#ffb030", 1.8, 5, 2); core.add(L);
    var roses = new T3.Group(); core.add(roses);
    for (var r = 0; r < 4; r++) { var g = new T3.Group(); var q = dRing(0.62, r * PI / 2); g.position.set(q[0], 0, q[1]); roses.add(g); b.add(new T3.CylinderGeometry(0.07, 0.07, 0.14, 6), amber, 0, 0, 0, { parent: g, noCast: true }); }
    b.fx.push(function (t, dt) { core.position.set(0, Y + 1.0 + Math.sin(t * 1.2) * 0.08, 0); core.rotation.y = t * 0.5; roses.rotation.y -= dt * 1.2; L.intensity = 1.6 + Math.sin(t * 1.6) * 0.3; });
    [[-2.0, 1.1], [1.1, -2.0]].forEach(function (m, i) { b.cyl(0.04, 0.055, 2.6, 8, post, m[0], 0, m[1]); bySail(b, m[0], 2.5, m[1], PI / 4, 1.3); kite(b, m[0], 2.6, m[1], i + 3, 3.6 + i * 0.2); });
    b.banner(-1.4, 1.45, 0, "bannerAir", 1.6); b.banner(1.45, -1.4, 0, "bannerAir", 1.6);
  }

  /* ---------------- Ravenclaw Mythic ---------------- */
  function blueTerrace(b, x, z, r, h, y0) { b.add(new T3.CylinderGeometry(r, r + 0.06, h, 40), [M("stoneBlue", r * 2.5, 0.3), M("stoneBlue", r * 1.5, r * 1.5), M("stoneBlue", r, r)], x, y0 + h / 2, z); }
  function pearlTerrace(b, x, z, r, h, y0) { b.add(new T3.CylinderGeometry(r, r + 0.05, h, 40), [M("pearl", r * 2.5, 0.3, { color: lin("#f0e2da") }), M("pearl", r * 1.5, r * 1.5), M("pearl", r, r)], x, y0 + h / 2, z); }
  function bronzeRing(b, x, y, z, r, posts) {
    var bz = BRZ();
    b.add(new T3.CylinderGeometry(r, r - 0.1, 0.05, 32), M("pearl", 2, 0.2), x, y - 0.02, z);
    b.add(new T3.TorusGeometry(r, 0.025, 6, 40), bz, x, y + 0.2, z, { rx: PI / 2 });
    for (var k = 0; k < (posts || 12); k++) { var p = dRing(r, k / (posts || 12) * 2 * PI); b.cyl(0.01, 0.01, 0.2, 4, bz, x + p[0], y, z + p[1]); }
  }
  function waterArc(b, sx, sy, sz, ex, ey, ez, hgt, n) {
    var dm = new T3.SpriteMaterial({ map: tex("drop"), transparent: true, depthWrite: false }), list = [];
    for (var d = 0; d < (n || 12); d++) { var s = new T3.Sprite(dm); s.scale.set(0.055, 0.055, 1); b.g.add(s); list.push([s, d / (n || 12)]); }
    b.fx.push(function (t) { list.forEach(function (q) { var k = (t * 0.5 + q[1]) % 1; q[0].position.set(sx + (ex - sx) * k, sy + (ey - sy) * k + hgt * Math.sin(k * PI), sz + (ez - sz) * k); }); });
  }
  function glassBubbles(b, x, z, rAt, y0, list) {
    var glass = new T3.MeshStandardMaterial({ color: lin("#8fd8ff"), emissive: lin("#2a9ae8"), emissiveIntensity: 0.85, transparent: true, opacity: 0.85, roughness: 0.05 });
    list.forEach(function (q) { var r = rAt(q[1]) + 0.01; b.add(new T3.SphereGeometry(q[2], 12, 10), glass, x + Math.cos(q[0]) * r, y0 + q[1], z + Math.sin(q[0]) * r, { noCast: true }); });
  }
  function waveWall(b, x, y, z, ry, s) {
    var ws = new T3.Shape(); ws.moveTo(0, 0); ws.lineTo(0.9, 0); ws.quadraticCurveTo(1.0, 0.9, 0.55, 1.15); ws.quadraticCurveTo(0.15, 1.3, 0.05, 0.95); ws.quadraticCurveTo(0.3, 1.0, 0.45, 0.85); ws.quadraticCurveTo(0.6, 0.6, 0.35, 0.2); ws.closePath();
    var m = new T3.MeshStandardMaterial({ color: lin("#7fc8ff"), emissive: lin("#1a6ab0"), emissiveIntensity: 0.5, transparent: true, opacity: 0.85, roughness: 0.1, side: T3.DoubleSide });
    b.add(new T3.ExtrudeGeometry(ws, { depth: 0.14, bevelEnabled: false }), m, x, y, z, { ry: ry, s: [s, s, 1] });
  }
  function glowCrown(b, x, y, z, r) {
    var g = new T3.Group(); g.position.set(x, y, z); b.g.add(g);
    b.add(new T3.TorusGeometry(r, 0.02, 6, 28), BRZ(), 0, 0, 0, { parent: g, rx: PI / 2 });
    b.add(new T3.SphereGeometry(r * 0.32, 12, 10), dGlow("#e8f8ff", "#58c8ff", 2), 0, r * 0.6, 0, { parent: g, noCast: true });
    b.fx.push(function (t) { g.rotation.y = t * 0.5; });
  }
  function rWaterHouse(b) {
    b.slab(3.2, "grassWater", "sideWater"); b.decal("path", 0.35, 1.15, 0.8, 1.0, -0.2);
    var X = -0.2, Z = -0.25;
    blueTerrace(b, X, Z, 1.2, 0.14, 0); pearlTerrace(b, X, Z, 0.98, 0.14, 0.14);
    var rAt = dConch(b, X, Z, 1.95, 0.82, 0.28, 4);
    shellMouth(b, X + Math.cos(PI / 4) * 0.7, 0.28, Z + Math.sin(PI / 4) * 0.7, PI / 4, 0.75);
    glassBubbles(b, X, Z, rAt, 0.28, [[PI / 4 + 0.9, 0.55, 0.1], [PI / 4 - 0.9, 0.6, 0.09], [0.2, 1.05, 0.08]]);
    bronzeRing(b, X, 1.15, Z, rAt(0.87) + 0.16, 10);
    glowCrown(b, X, 2.32, Z, 0.16);
    b.water(0.5, 0.55, 1.2, 1.25, 0.0, 0.08);
    b.add(new T3.BoxGeometry(0.74, 0.1, 0.06), M("pearl", 0.7, 0.2), 0.85, 0, 0.53); b.add(new T3.BoxGeometry(0.06, 0.1, 0.74), M("pearl", 0.2, 0.7), 0.48, 0, 0.9);
    waterArc(b, X + 0.4, 1.3, Z + 0.3, 0.85, 0.1, 0.9, 0.35, 10);
    shells(b, [[-1.15, 0.9], [1.2, -0.9], [-1.0, -1.1]]);
  }
  function rWaterFarm(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var levels = [[-1.45, -0.55, 0.5], [-0.55, 0.35, 0.3], [0.35, 1.25, 0.1]], kelp = ["#4f8a6a", "#3f7a5a", "#6aa87a"];
    levels.forEach(function (L, i) {
      var d = L[1] - L[0], cz = (L[0] + L[1]) / 2, sd = M("pearl", 1.6, L[2] * 2, { color: lin("#e8d8d0") }), tp = M("soil", 2, 0.6);
      b.add(new T3.BoxGeometry(2.9, L[2], d), [sd, sd, tp, sd, sd, sd], -0.15, L[2] / 2, cz);
      if (i === 1) b.cabbages(-1.5, L[0] + 0.1, 0.9, L[1] - 0.1, 2, 8, "#5f9e4a", L[2]);
      else b.lift(L[2], function () { this.wheat(-1.5, L[0] + 0.1, 0.9, L[1] - 0.1, 2, 9, kelp); });
      b.water(1.0, L[0], 1.3, L[1], L[2], L[2] + 0.05);
      if (i < 2) { var cas = tex("water", 0.3, 0.6); b.add(new T3.PlaneGeometry(0.28, L[2] - levels[i + 1][2] + 0.05), new T3.MeshStandardMaterial({ map: cas, transparent: true, opacity: 0.85, roughness: 0.1, side: T3.DoubleSide }), 1.15, (L[2] + levels[i + 1][2]) / 2 + 0.03, L[1] + 0.005, { noCast: true }); b.fx.push(function (t) { cas.offset.y = t * 0.9; }); }
    });
    b.water(1.0, 1.25, 1.3, 1.95, 0, 0.05);
    var rAt = dConch(b, 1.6, -1.75, 2.2, 0.55, 0.0, 4.5);
    glassBubbles(b, 1.6, -1.75, rAt, 0, [[PI / 4, 0.6, 0.08], [PI / 4 + 1, 1.0, 0.07]]);
    glowCrown(b, 1.6, 2.3, -1.75, 0.12);
    waterArc(b, 1.55, 1.6, -1.55, 1.15, 0.55, -1.0, 0.45, 12);
    var chime = new T3.Group(); chime.position.set(-1.85, 1.0, 1.85); b.g.add(chime);
    b.cyl(0.03, 0.04, 1.0, 6, BRZ(), -1.85, 0, 1.85);
    [-0.06, 0.0, 0.06].forEach(function (dx, i) { b.add(new T3.CylinderGeometry(0.015, 0.015, 0.2 + i * 0.05, 6), BRZ(), dx, -0.15 - i * 0.02, 0, { parent: chime }); });
    b.fx.push(function (t) { chime.rotation.z = Math.sin(t * 2.1) * 0.15; });
    shells(b, [[-1.85, 1.6], [-1.6, 1.95], [0.6, 1.95]]);
  }
  function rWaterStore(b) {
    b.slabWater(3.2, 1.0, "grassWater", "sideWater");
    var HX = -0.4, HZ = -0.7;
    b.box(2.0, 0.14, 1.4, M("stoneBlue", 2, 1.4), HX, 0, HZ);
    b.box(1.65, 0.7, 1.0, M("pearl", 2, 0.7, { color: lin("#f0e2da") }), HX, 0.14, HZ);
    var g = hullRoof(b, HX, 0.84, HZ, 2.0, 1.2, 0);
    g.children.forEach(function (c) { if (c.geometry && c.geometry.type === "SphereGeometry") c.material = M("pearl", 3, 1.5, { color: lin("#f2dcd2") }); });
    var rAt = dConch(b, HX + 0.85, HZ - 0.3, 1.9, 0.38, 0.84, 4);
    glowCrown(b, HX + 0.85, 2.8, HZ - 0.3, 0.1);
    shellMouth(b, HX, 0.14, HZ + 0.52, 0, 0.7);
    porthole(b, HX + 0.84, 0.5, HZ + 0.15, 1, 0, 0.8); porthole(b, HX - 0.55, 0.5, HZ + 0.52, 0, 1, 0.8);
    b.box(3.2, 0.1, 0.55, M("stoneBlue", 3, 0.5), 0, -0.05, 0.35);
    var bz = BRZ(), CX = 0.95, CZ = 0.45;
    b.cyl(0.05, 0.07, 1.6, 8, bz, CX, 0, CZ);
    var arm = new T3.Group(); arm.position.set(CX, 1.5, CZ); b.g.add(arm);
    b.beam([0, 0, 0], [-0.1, 0.15, 0.85], 0.03, bz, arm);
    var hook = new T3.Group(); hook.position.set(-0.1, 0.15, 0.85); arm.add(hook);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.8, 4), C("#d8cba6"), 0, -0.4, 0, { parent: hook });
    var netM = new T3.MeshStandardMaterial({ map: tex("net", 1, 1), transparent: true, alphaTest: 0.4, side: T3.DoubleSide, roughness: 1 });
    b.add(new T3.SphereGeometry(0.15, 10, 8), netM, 0, -0.92, 0, { parent: hook, s: [1, 1.2, 1] });
    b.fx.push(function (t) { arm.rotation.y = Math.sin(t * 0.4) * 0.6; hook.rotation.x = Math.sin(t * 1.3) * 0.08; });
    b.boat(-0.5, 1.15, 0.1);
    [-0.95, -0.05].forEach(function (x) { b.add(new T3.SphereGeometry(0.06, 10, 8), dGlow("#e8f8ff", "#58c8ff", 1.6), x, 0.25, 1.15, { noCast: true }); });
    b.gold(-1.2, 0.3); shells(b, [[0.3, 0.2]]); b.banner(-1.35, -0.1, 0, "bannerWater", 1.3);
  }
  function rWaterBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater"); b.decal("path", 0.3, 1.35, 2.6, 1.4);
    var HX = -0.35, HZ = -0.65;
    b.box(3.0, 0.16, 1.9, M("stoneBlue", 3, 1.9), HX, 0, HZ);
    b.box(2.6, 0.14, 1.6, M("pearl", 3, 1.6, { color: lin("#f0e2da") }), HX, 0.16, HZ);
    b.box(2.1, 0.75, 1.15, M("pearl", 3, 0.8, { color: lin("#f0e2da") }), HX, 0.3, HZ);
    var g = hullRoof(b, HX, 1.05, HZ, 2.45, 1.4, 0);
    g.children.forEach(function (c) { if (c.geometry && c.geometry.type === "SphereGeometry") c.material = M("pearl", 3, 1.5, { color: lin("#f2dcd2") }); });
    [-1, 0, 1].forEach(function (s) { var x = HX + s * 1.1, h = s === 0 ? 1.4 : 1.65, y0 = s === 0 ? 1.55 : 0.3; if (s !== 0) b.cyl(0.36, 0.4, 0.75, 14, M("pearl", 1.5, 0.7), x, 0.3, HZ); dConch(b, x, HZ, h, s === 0 ? 0.3 : 0.42, s === 0 ? y0 : 1.05, 4); glowCrown(b, x, (s === 0 ? y0 : 1.05) + h + 0.08, HZ, 0.1); });
    shellMouth(b, HX, 0.3, HZ + 0.58, 0, 0.85);
    [-0.6, 0.6].forEach(function (dx) { porthole(b, HX + dx, 0.75, HZ + 0.59, 0, 1, 0.85); });
    waveWall(b, -1.65, 0.0, 1.2, -PI / 2, 0.8); waveWall(b, 0.85, 0.0, 1.2, -PI / 2, 0.8);
    b.target(1.35, 1.5, 0.5); b.target(1.85, 1.0, 0.7);
    b.banner(HX - 0.6, HZ + 1.2, 0, "bannerWater", 1.5); b.banner(HX + 0.6, HZ + 1.2, 0, "bannerWater", 1.5);
    shells(b, [[1.8, -1.6], [-1.9, -1.6]]);
  }
  function rWaterTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var TX = -0.2, TZ = -0.45;
    blueTerrace(b, TX, TZ, 0.95, 0.18, 0); pearlTerrace(b, TX, TZ, 0.78, 0.14, 0.18);
    var rAt = dConch(b, TX, TZ, 3.4, 0.68, 0.32, 6);
    shellMouth(b, TX + 0.6 * 0.707, 0.32, TZ + 0.6 * 0.707, PI / 4, 0.65);
    glassBubbles(b, TX, TZ, rAt, 0.32, [[PI / 4 + 0.6, 1.0, 0.08], [PI / 4 - 0.7, 1.5, 0.07], [PI / 4 + 0.2, 2.1, 0.06]]);
    bronzeRing(b, TX, 0.32 + 1.3, TZ, rAt(1.3) + 0.18, 10);
    var LY = 3.75, bz = BRZ();
    b.add(new T3.CylinderGeometry(0.24, 0.24, 0.03, 12), bz, TX, LY - 0.02, TZ);
    for (var k = 0; k < 6; k++) { var p = dRing(0.2, k * PI / 3); b.cyl(0.012, 0.012, 0.36, 4, bz, TX + p[0], LY, TZ + p[1]); }
    var orb = dGlow("#d6f4ff", "#58c8ff", 1.8);
    b.add(new T3.SphereGeometry(0.15, 16, 12), orb, TX, LY + 0.18, TZ, { noCast: true });
    b.add(new T3.ConeGeometry(0.26, 0.2, 12), bz, TX, LY + 0.46, TZ);
    var L = new T3.PointLight("#58c8ff", 1.2, 4, 2); L.position.set(TX, LY + 0.18, TZ); b.g.add(L);
    b.fx.push(function (t) { var k = 1 + Math.sin(t * 1.8) * 0.3; orb.emissiveIntensity = 1.6 * k; L.intensity = 1.0 * k; });
    waveWall(b, 0.6, 0, 0.45, -PI / 2 + 0.4, 0.6);
    b.boat(-0.65, 1.2, -0.2); shells(b, [[-1.15, 0.25], [1.15, -1.0]]);
  }
  function rWaterPen(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var CX = -0.1, CZ = -0.15;
    blueTerrace(b, CX, CZ, 1.75, 0.2, 0);
    var wt = tex("water", 1.3, 1.3);
    b.add(new T3.CircleGeometry(1.45, 40), new T3.MeshStandardMaterial({ map: wt, roughness: 0.1, metalness: 0.25 }), CX, 0.205, CZ, { rx: -PI / 2, noCast: true });
    b.fx.push(function (t) { wt.offset.set(t * 0.03, t * 0.02); });
    b.add(new T3.TorusGeometry(1.47, 0.06, 6, 48), M("pearl", 6, 0.2), CX, 0.22, CZ, { rx: PI / 2 });
    var nest = M("wicker", 3, 0.5), bz = BRZ();
    [[-0.65, -0.7, 2.1], [0.6, -0.55, 1.55], [-0.2, 0.55, 1.15]].forEach(function (q, i) {
      var x = CX + q[0], z = CZ + q[1];
      dConch(b, x, z, q[2], 0.32, 0.2, 4);
      b.add(new T3.CylinderGeometry(0.26, 0.2, 0.08, 10), bz, x, q[2] + 0.2, z);
      b.add(new T3.TorusGeometry(0.22, 0.05, 6, 14), nest, x, q[2] + 0.27, z, { rx: PI / 2 });
      if (i < 2) b.raven(x, q[2] + 0.28, z, 1.1, 0.7 + i * 0.3, false);
    });
    var orbit = new T3.Group(); orbit.position.set(CX, 2.9, CZ); b.g.add(orbit);
    var fly = b.raven(0, 0, 0, 1.0, 0, true); b.g.remove(fly); orbit.add(fly); fly.position.set(1.25, 0, 0); fly.rotation.y = PI; fly.rotation.z = -0.25;
    b.fx.push(function (t) { orbit.rotation.y = t * 0.55; fly.position.y = Math.sin(t * 1.3) * 0.12; });
    waterArc(b, CX - 0.2, 1.3, CZ + 0.55, CX + 0.9, 0.22, CZ + 0.6, 0.3, 10);
    waveWall(b, 1.4, 0, 1.6, -PI / 2, 0.6);
    b.banner(-1.75, 1.6, 0, "bannerWater", 1.5); shells(b, [[1.9, -1.6], [-1.9, -1.7]]);
  }
  function rWaterSanctum(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var CX = -0.5, CZ = -0.5;
    blueTerrace(b, CX, CZ, 1.55, 0.2, 0); pearlTerrace(b, CX, CZ, 1.3, 0.18, 0.2);
    var dome = new T3.SphereGeometry(1.05, 32, 14, 0, 2 * PI, 0, PI / 2);
    b.add(dome, M("pearl", 3, 2, { color: lin("#f2dcd2"), roughness: 0.35 }), CX, 0.38, CZ, { s: [1, 1.25, 1] });
    var pts = [];
    for (var s = 0; s <= 120; s++) { var t = s / 120, a = t * PI * 2 * 3.5, el = t * PI / 2 * 0.92, r = 1.05 * Math.cos(el) + 0.015, y = 0.38 + 1.05 * 1.25 * Math.sin(el); pts.push(new T3.Vector3(CX + Math.cos(a) * r, y, CZ + Math.sin(a) * r)); }
    b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 240, 0.05, 6, false), M("pearl", 1, 8, { color: lin("#9a6e64") }), 0, 0, 0);
    var glass = new T3.MeshStandardMaterial({ color: lin("#8fd8ff"), emissive: lin("#2a9ae8"), emissiveIntensity: 0.9, transparent: true, opacity: 0.85, roughness: 0.05 });
    b.add(new T3.SphereGeometry(0.3, 18, 10, 0, 2 * PI, 0, PI / 2), glass, CX, 0.38 + 1.27, CZ);
    glowCrown(b, CX, 2.05, CZ, 0.3);
    shellMouth(b, CX + 0.95 * 0.707, 0.38, CZ + 0.95 * 0.707, PI / 4, 0.85);
    [PI / 4 + 0.95, PI / 4 - 0.95].forEach(function (a) { var p = dRing(1.03, a); porthole(b, CX + p[0], 0.75, CZ + p[1], p[0], p[1], 0.9); });
    var PX = 1.05, PZ = 1.05;
    b.box(1.6, 0.16, 1.6, M("stoneBlue", 1.5, 1.5), PX, 0, PZ); b.water(PX - 0.68, PZ - 0.68, PX + 0.68, PZ + 0.68, 0.1, 0.17);
    var orbM = new T3.MeshStandardMaterial({ color: lin("#9fdcff"), emissive: lin("#3aa8ff"), emissiveIntensity: 0.9, transparent: true, opacity: 0.75, roughness: 0.05 });
    var orb = b.add(new T3.SphereGeometry(0.3, 20, 14), orbM, PX, 1.2, PZ, { noCast: true });
    var L = new T3.PointLight("#58c8ff", 1.3, 3.5, 2); b.g.add(L);
    var ring = b.add(new T3.TorusGeometry(0.5, 0.035, 8, 40), new T3.MeshStandardMaterial({ map: tex("water", 3, 0.3), transparent: true, opacity: 0.75, emissive: lin("#1a6ab0"), emissiveIntensity: 0.5 }), PX, 1.2, PZ, { rx: PI / 2 - 0.4, noCast: true });
    b.fx.push(function (t) { var y = 1.2 + Math.sin(t * 1.2) * 0.1; orb.position.y = y; ring.position.y = y; ring.rotation.z = t * 0.6; L.position.set(PX, y, PZ); });
    waterArc(b, CX + 0.2, 2.0, CZ + 0.2, PX, 1.25, PZ, 0.4, 12);
    waveWall(b, PX + 0.95, 0, PZ - 1.0, PI, 0.6); waveWall(b, PX - 1.0, 0, PZ + 0.95, -PI / 2, 0.6);
    b.banner(-1.95, 0.6, 0, "bannerWater", 1.5);
  }

  /* ---------------- Gryffindor Mythic ---------------- */
  function magmaSeams(b, x, z, r0, h, y0, n, mat) {
    var fh = r0 * 0.707;
    for (var j = 0; j < n; j++) { var o = (j / Math.max(1, n - 1) - 0.5) * fh * 1.2; b.box(0.04, h * 0.55, 0.02, mat, x + o, y0 + h * 0.3, z + fh * 0.96, { rz: 0.3 - j * 0.3, noCast: true }); b.box(0.02, h * 0.55, 0.04, mat, x + fh * 0.96, y0 + h * 0.3, z + o, { rx: 0.3 - j * 0.3, noCast: true }); }
  }
  function fireCrown(b, x, y, z, s) {
    var gold = REDGOLD();
    for (var c = 0; c < 8; c++) { var p = onRing(0.3 * s, c / 8 * 2 * PI); b.add(new T3.ConeGeometry(0.045 * s, 0.38 * s, 4), gold, x + p[0], y + 0.19 * s, z + p[1], { rz: p[0] / s * -0.55 * 3, rx: p[1] / s * 0.55 * 3 }); }
    b.cyl(0.26 * s, 0.17 * s, 0.16 * s, 10, M("iron"), x, y, z);
    b.cyl(0.24 * s, 0.24 * s, 0.02, 10, dGlow("#ffb060", "#ff4a10", 1.6), x, y + 0.16 * s, z, { noCast: true });
    dFlame(b, x, y + 0.17 * s, z, 0.85 * s, 1.0 * s);
  }
  function obelisk(b, x, z, h, y0) {
    dFrustum(b, x, y0 || 0, z, 0.28, 0.17, h, M("basalt", 0.5, h));
    dFrustum(b, x, (y0 || 0) + h * 0.6, z, 0.25, 0.24, 0.05, REDGOLD());
    b.cyl(0.13, 0.13, 0.04, 4, dGlow("#ffb060", "#ff4a10", 1.6), x, (y0 || 0) + h, z, { ry: PI / 4, noCast: true });
    dFlame(b, x, (y0 || 0) + h + 0.03, z, 0.4, 0.35);
  }
  function stepped(b, x, z, tiers, y0) {
    var bas = M("basalt", 2, 0.8), gold = REDGOLD(), magma = dGlow("#ffb060", "#ff4a10", 1.5), Y = y0 || 0;
    tiers.forEach(function (t, i) {
      dFrustum(b, x, Y, z, t[0], t[1], t[2], bas);
      dFrustum(b, x, Y + t[2] - 0.06, z, t[1] + 0.05, t[1] + 0.02, 0.07, gold);
      spikeRing(b, x, z, t[1] * 0.707 + 0.01, Y + t[2], 2);
      magmaSeams(b, x, z, t[0], t[2], Y, i ? 1 : 2, magma);
      Y += t[2];
    });
    b.fx.push(function (t) { magma.emissiveIntensity = 1.3 + Math.sin(t * 2) * 0.35; });
    return Y;
  }
  function gFireHouse(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0.25, 0.95, 1.1, 1.4, -0.2);
    var X = -0.2, Z = -0.25;
    dFrustum(b, X, 0, Z, 1.25, 1.15, 0.14, M("basalt", 2, 0.2));
    var Y = stepped(b, X, Z, [[1.0, 0.86, 0.7], [0.72, 0.58, 0.48], [0.5, 0.36, 0.36]], 0.14);
    fireCrown(b, X, Y, Z, 0.75);
    forgeGate(b, X, 0.14, Z + 0.93 * 0.707 + 0.02, 0, 0.32, 0.5, 0.75);
    obelisk(b, X + 0.85, Z - 0.85, 1.7, 0); dSmoke(b, X + 0.85, 2.0, Z - 0.85, 4);
    basaltBowl(b, 0.95, 0.85, 0, 0.9);
    stakes(b, -1.4, -1.4, -1.4, 0.8, 7); b.logs(1.05, -1.0, 0.4);
  }
  function gFireFarm(b) {
    b.slab(4.2, "grassFire", "sideFire");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.25, 0, 0.25);
    b.wheat(-1.1, -1.1, 1.6, 1.6, 8, 9, ["#e8b83a", "#d8a030", "#f2cc5a", "#c88a28"]);
    var bas = M("basalt", 3, 0.3), gold = REDGOLD();
    [[0.25, 1.85, 3.3, 0.22], [1.85, 0.25, 0.22, 3.3]].forEach(function (w) { b.box(w[2], 0.36, w[3], bas, w[0], 0, w[1]); b.box(w[2] + 0.02, 0.04, w[3] + 0.02, gold, w[0], 0.36, w[1]); });
    var GX = -1.5, GZ = -1.5;
    var Y = stepped(b, GX, GZ, [[0.75, 0.62, 0.8], [0.52, 0.4, 0.55], [0.34, 0.24, 0.4]], 0);
    fireCrown(b, GX, Y, GZ, 0.6);
    forgeGate(b, GX, 0, GZ + 0.69 * 0.707 + 0.02, 0, 0.26, 0.42, 0.55);
    [[1.85, 1.85], [1.85, -1.55], [-1.55, 1.85]].forEach(function (p) { obelisk(b, p[0], p[1], 1.0, 0.36); });
    stakes(b, -1.75, 1.2, -1.75, -0.4, 5); stakes(b, -0.5, -1.75, 1.2, -1.75, 5);
    b.scarecrow(0.3, 0.35, "#b3261e"); b.hay(0.6, -1.95, 0.2);
  }
  function gFireStore(b) {
    b.slab(3.2, "grassFire", "sideFire"); b.decal("path", 0.3, 0.8, 1.6, 1.5, -0.2);
    var X = -0.5, Z = -0.5;
    dFrustum(b, X, 0, Z, 1.05, 0.98, 0.14, M("basalt", 2, 0.2));
    var Y = stepped(b, X, Z, [[0.85, 0.74, 0.8], [0.6, 0.48, 0.42]], 0.14);
    dFrustum(b, X, Y, Z, 0.48, 0.05, 0.35, M("ironPlate", 1, 1));
    forgeGate(b, X, 0.14, Z + 0.79 * 0.707 + 0.02, 0, 0.42, 0.55, 0.65);
    var FX = 0.75, FZ = -0.7;
    dFrustum(b, FX, 0, FZ, 0.5, 0.3, 1.6, M("basalt", 1, 1.4));
    dFrustum(b, FX, 0.9, FZ, 0.43, 0.42, 0.05, REDGOLD());
    fireCrown(b, FX, 1.6, FZ, 0.75); dSmoke(b, FX, 2.2, FZ, 5);
    var pour = dGlow("#ffd080", "#ff8a10", 2.2);
    b.box(0.08, 0.02, 0.7, pour, FX, 0.32, FZ + 0.65, { rx: 0.35, noCast: true });
    b.add(new T3.CylinderGeometry(0.28, 0.28, 0.03, 4), pour, FX, 0.04, FZ + 1.1, { ry: PI / 4, noCast: true });
    var pl = new T3.PointLight("#ff8a2a", 1.0, 2.5, 2); pl.position.set(FX, 0.4, FZ + 1.1); b.g.add(pl);
    var gb = C("#f2c040", { metalness: 0.85, roughness: 0.3 });
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3 - r; c++) b.box(0.15, 0.06, 0.3, gb, -0.2 + c * 0.16 + r * 0.08, 0.06 * r, 1.05);
    stakes(b, -1.35, 1.35, -1.35, -0.3, 5);
  }
  function gFireBarracks(b) {
    b.slab(4.2, "grassFire", "sideFire"); b.decal("path", 0.3, 1.3, 2.6, 1.5);
    var HX = -0.4, HZ = -0.65, bas = M("basalt", 3, 0.9), gold = REDGOLD(), magma = dGlow("#ffb060", "#ff4a10", 1.5);
    b.box(3.0, 0.14, 1.9, M("basalt", 3, 0.2), HX, 0, HZ);
    var tiers = [[2.7, 1.55, 0.95], [2.1, 1.1, 0.55], [1.4, 0.65, 0.4]], Y = 0.14;
    tiers.forEach(function (t, i) {
      b.box(t[0], t[2], t[1], bas, HX, Y, HZ);
      b.box(t[0] + 0.06, 0.06, t[1] + 0.06, gold, HX, Y + t[2] - 0.05, HZ);
      for (var k = -4; k <= 4; k++) { if (Math.abs(k * t[0] / 9) > t[0] / 2) continue; b.add(new T3.ConeGeometry(0.035, 0.18, 4), M("iron"), HX + k * t[0] / 9, Y + t[2] + 0.09, HZ + t[1] / 2); }
      if (i < 2) [-0.6, 0.3, 0.8].forEach(function (o, j) { b.box(0.04, t[2] * 0.5, 0.02, magma, HX + o * t[0] / 2, Y + t[2] * 0.3, HZ + t[1] / 2 + 0.005, { rz: 0.3 - j * 0.3, noCast: true }); });
      Y += t[2];
    });
    fireCrown(b, HX, Y, HZ, 0.7);
    forgeGate(b, HX, 0.14, HZ + 0.78, 0, 0.5, 0.72, 1.0);
    obelisk(b, HX - 1.75, HZ + 0.5, 1.9, 0); obelisk(b, HX + 1.75, HZ + 0.5, 1.9, 0);
    lionStatue(b, HX - 0.55, HZ + 1.25, 0, 0, 0.6); lionStatue(b, HX + 0.55, HZ + 1.25, 0, 0, 0.6);
    b.target(1.25, 1.45, 0.5); b.target(1.75, 0.95, 0.7);
    b.banner(-1.6, 1.6, 0, "bannerFire", 1.5);
    b.fx.push(function (t) { magma.emissiveIntensity = 1.3 + Math.sin(t * 2) * 0.35; });
  }
  function gFireTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    dFrustum(b, 0, 0, 0, 1.15, 1.05, 0.22, M("basalt", 2, 0.2));
    var Y = stepped(b, 0, 0, [[0.85, 0.66, 1.4], [0.6, 0.48, 1.0], [0.46, 0.36, 0.6]], 0.22);
    dFrustum(b, 0, Y, 0, 0.4, 0.62, 0.25, M("basalt", 1, 0.3));
    dFrustum(b, 0, Y + 0.25, 0, 0.63, 0.62, 0.05, REDGOLD());
    spikeRing(b, 0, 0, 0.62 * 0.707, Y + 0.3, 2);
    fireCrown(b, 0, Y + 0.3, 0, 1.05);
    forgeGate(b, 0, 0.22, 0.8 * 0.707 + 0.02, 0, 0.32, 0.5, 0.7);
    var pv = new T3.Group(); pv.position.set(0.45, Y + 0.85, -0.45); b.g.add(pv);
    b.cyl(0.015, 0.015, 0.55, 5, C("#3e2616"), 0.45, Y + 0.3, -0.45);
    var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(0.42, -0.08); sh.lineTo(0, -0.18); sh.closePath();
    b.add(new T3.ShapeGeometry(sh), C("#c0281c", { side: T3.DoubleSide }), 0, 0, 0, { parent: pv, ry: -PI / 4 });
    b.fx.push(function (t) { pv.rotation.y = Math.sin(t * 2.4) * 0.35; });
    obelisk(b, -1.1, 1.0, 1.0, 0); stakes(b, -1.35, -1.35, 1.0, -1.35, 7);
  }
  function gFirePen(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var bas = M("basalt", 3, 0.4), gold = REDGOLD(), magma = dGlow("#ffb060", "#ff4a10", 1.6);
    b.box(3.6, 0.1, 3.2, M("dirt", 3, 3, { color: lin("#a08870") }), -0.1, 0, -0.2);
    [[-1.85, 1.35, -1.85, -1.85], [-1.85, -1.85, 1.75, -1.85], [1.75, -1.85, 1.75, 1.35]].forEach(function (w) {
      var len = Math.hypot(w[2] - w[0], w[3] - w[1]), ry = -Math.atan2(w[3] - w[1], w[2] - w[0]), cx = (w[0] + w[2]) / 2, cz = (w[1] + w[3]) / 2;
      b.box(len + 0.3, 0.5, 0.36, bas, cx, 0, cz, { ry: ry }); b.box(len + 0.1, 0.35, 0.24, bas, cx, 0.5, cz, { ry: ry });
      b.box(len + 0.12, 0.04, 0.26, gold, cx, 0.85, cz, { ry: ry });
      var n = Math.round(len / 0.3); for (var k = 0; k <= n; k++) { var t = k / n; b.add(new T3.ConeGeometry(0.035, 0.2, 4), M("iron"), w[0] + (w[2] - w[0]) * t, 0.97, w[1] + (w[3] - w[1]) * t); }
    });
    [-1.85, 1.75].forEach(function (x) { obelisk(b, x, 1.35, 1.5, 0); });
    for (var i = -5; i <= 5; i++) if (Math.abs(i) > 1) b.box(0.03, 0.9, 0.03, M("iron"), -0.05 + i * 0.3, 0, 1.35);
    [0.25, 0.8].forEach(function (y) { b.box(3.2, 0.035, 0.035, M("iron"), -0.05, y, 1.35); });
    var RX = 0.15, RZ = -0.35;
    dFrustum(b, RX, 0.1, RZ, 1.05, 0.85, 0.3, bas); dFrustum(b, RX, 0.4, RZ, 0.8, 0.62, 0.25, bas);
    dFrustum(b, RX, 0.6, RZ, 0.66, 0.63, 0.05, gold);
    magmaSeams(b, RX, RZ, 1.05, 0.55, 0.1, 2, magma);
    b.add(new T3.TorusGeometry(1.25, 0.06, 6, 4), magma, RX, 0.12, RZ, { rx: PI / 2, rz: PI / 4, noCast: true });
    var lion = b.lion(RX, RZ, 0.8, 0.55); lion.position.y = 0.65;
    lionStatue(b, -1.35, -1.35, 0, PI / 4, 0.55);
    b.banner(-0.9, 1.75, 0, "bannerFire", 1.5); b.banner(0.8, 1.75, 0, "bannerFire", 1.5);
    b.fx.push(function (t) { magma.emissiveIntensity = 1.4 + Math.sin(t * 2) * 0.4; });
  }
  function gFireSanctum(b) {
    b.slab(4.2, "grassFire", "sideFire");
    var bas = M("basalt", 3, 0.4), gold = REDGOLD();
    var Y = stepped(b, 0, 0, [[2.45, 2.25, 0.32], [1.95, 1.75, 0.32], [1.5, 1.3, 0.32]], 0);
    for (var s = 0; s < 6; s++) b.box(0.75, 0.16 * (s + 1) - 0.02, 0.16, M("basalt", 0.7, 0.2), 0, 0, 1.75 - s * 0.1);
    [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(function (q) { dFrustum(b, q[0], Y, q[1], 0.14, 0.11, 1.3, bas); dFrustum(b, q[0], Y + 0.45, q[1], 0.13, 0.12, 0.05, gold); dFrustum(b, q[0], Y + 1.0, q[1], 0.12, 0.115, 0.05, gold); });
    dFrustum(b, 0, Y + 1.3, 0, 0.85, 0.8, 0.12, bas); dFrustum(b, 0, Y + 1.42, 0, 0.82, 0.05, 0.5, M("ironPlate", 1.4, 1));
    spikeRing(b, 0, 0, 0.8 * 0.707, Y + 1.42, 2);
    dFrustum(b, 0, Y, 0, 0.36, 0.28, 0.3, bas);
    fireCrown(b, 0, Y + 0.3, 0, 1.0);
    lionStatue(b, -0.6, 1.55, 0.32, 0, 0.6); lionStatue(b, 0.6, 1.55, 0.32, 0, 0.6);
    [[-1.85, -1.85], [1.85, -1.85]].forEach(function (p) { obelisk(b, p[0], p[1], 2.0, 0); });
    b.banner(-1.5, 1.8, 0, "bannerFire", 1.5); b.banner(1.5, 1.8, 0, "bannerFire", 1.5);
  }

  var MYTHB = {
    air: [hAirHouse, hAirFarm, hAirStore, hAirBarracks, hAirTower, hAirPen, hAirSanctum],
    water: [rWaterHouse, rWaterFarm, rWaterStore, rWaterBarracks, rWaterTower, rWaterPen, rWaterSanctum],
    fire: [gFireHouse, gFireFarm, gFireStore, gFireBarracks, gFireTower, gFirePen, gFireSanctum]
  };

  /* ---------- shared renderer, one canvas per card ---------- */
  var RW = 1024, RH = 768;
  var renderer;
  try { renderer = new T3.WebGLRenderer({ antialias: true, alpha: true }); }
  catch (e) { arts.forEach(function (a) { var p = a.querySelector(".fallback"); if (p) p.textContent = "This browser can't show the 3D preview (WebGL is off)."; }); return; }
  renderer.setPixelRatio(1); renderer.setSize(RW, RH, false);
  renderer.outputEncoding = T3.sRGBEncoding; renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  var VIEW_H = 6.4, TARGET = new T3.Vector3(0, 1.05, 0), DIR = new T3.Vector3(1, 0.816, 1).normalize();
  var cam = new T3.OrthographicCamera(-VIEW_H * 2 / 3, VIEW_H * 2 / 3, VIEW_H / 2, -VIEW_H / 2, 0.1, 100);
  cam.position.copy(TARGET).addScaledVector(DIR, 30); cam.lookAt(TARGET);
  function build(fn) {
    var scene = new T3.Scene();
    scene.add(new T3.HemisphereLight("#d6e6ff", "#5a4630", 0.65));
    var sun = new T3.DirectionalLight("#fff0d6", 1.55); sun.position.set(-3.5, 9, 6.5); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    var sc = sun.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 1; sc.far = 25;
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3; scene.add(sun);
    var rim = new T3.DirectionalLight("#9fc4ff", 0.35); rim.position.set(6, 5, -6); scene.add(rim);
    var b = new B(scene); fn(b); b.fx.forEach(function (f) { f(0, 0); });
    scene.updateMatrixWorld(true);
    var list = [], sprites = [];
    scene.traverse(function (o) { if (o.isMesh) { var bb = new T3.Box3().setFromObject(o); list.push([o, o.material, bb.max.y < 0.12]); } else if (o.isSprite) sprites.push(o); });
    return { scene: scene, fx: b.fx, list: list, sprites: sprites, sil: false };
  }
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var outs = cards.map(function (card) {
    var art = card.querySelector(".art"), cv = document.createElement("canvas");
    var fb = art.querySelector(".fallback"); if (fb) fb.remove(); art.appendChild(cv);
    var o = { art: art, cv: cv, ctx: cv.getContext("2d"), visible: true, dirty: true };
    function resize() { var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(art.clientWidth * dpr), h = Math.round(art.clientHeight * dpr); if (w && h && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; o.dirty = true; } }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(art); else window.addEventListener("resize", resize);
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { o.visible = en[0].isIntersecting; if (o.visible) o.dirty = true; }).observe(art);
    return o;
  });
  var cache = {}, current = "air", paused = false, time = 0, last = performance.now(), acc = 0, AGES = window.__TC.ages;
  var SIL_B = new T3.MeshBasicMaterial({ color: lin("#1b2028") }), SIL_G = new T3.MeshBasicMaterial({ color: lin("#a9b2bc") });
  function setSil(v, on) { if (v.sil === on) return; v.sil = on; v.list.forEach(function (q) { q[0].material = on ? (q[2] ? SIL_G : SIL_B) : q[1]; }); v.sprites.forEach(function (s) { s.visible = !on; }); }
  var vstate = { ver: "new", sil: false };
  function view(i) {
    var age = AGES[i], nv = vstate.ver === "new" && MYTHB[current], key = current + ":" + i + ":" + age + ":" + (nv ? "n" : "o");
    if (!cache[key]) cache[key] = build(age === "dark" ? (nv ? NEWB[current][i] : DARK[current][i]) : (nv ? MYTHB[current][i] : MYTH[current][i]));
    setSil(cache[key], vstate.sil);
    return cache[key];
  }
  function refresh() { window.__TC.fill(current); outs.forEach(function (o) { o.dirty = true; }); }
  function setNation(n) {
    current = n; refresh();
    document.querySelectorAll(".tab").forEach(function (t) { t.setAttribute("aria-selected", t.dataset.n === n ? "true" : "false"); t.tabIndex = t.dataset.n === n ? 0 : -1; });
  }
  function draw(i) {
    var v = view(i), o = outs[i];
    v.fx.forEach(function (f) { f(time, 0); });
    renderer.render(v.scene, cam);
    o.ctx.clearRect(0, 0, o.cv.width, o.cv.height);
    o.ctx.drawImage(renderer.domElement, 0, 0, o.cv.width, o.cv.height);
    o.dirty = false;
  }
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!paused) time += dt;
    acc += dt; var tick = acc >= 1 / 30; if (tick) acc = 0;
    outs.forEach(function (o, i) {
      if (!o.visible) return;
      if (tick && !paused) view(i).fx.forEach(function (f) { f(time, 1 / 30); });
      if (o.dirty || (tick && !paused)) draw(i);
    });
    requestAnimationFrame(frame);
  }
  cards.forEach(function (card, i) {
    card.querySelectorAll(".seg button").forEach(function (bt) { bt.addEventListener("click", function () { AGES[i] = bt.dataset.age; refresh(); }); });
  });
  document.querySelectorAll("[data-all]").forEach(function (bt) { bt.addEventListener("click", function () { for (var i = 0; i < AGES.length; i++) if (!window.__TC.ROLES[i].isNew) AGES[i] = bt.dataset.all; refresh(); }); });
  document.querySelectorAll("[data-ver]").forEach(function (bt) { bt.addEventListener("click", function () { vstate.ver = bt.dataset.ver; window.__VER = vstate.ver; syncV(); }); });
  document.querySelectorAll("[data-view]").forEach(function (bt) { bt.addEventListener("click", function () { vstate.sil = bt.dataset.view === "sil"; syncV(); }); });
  function syncV() {
    document.querySelectorAll("[data-ver]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.ver === vstate.ver ? "true" : "false"); });
    document.querySelectorAll("[data-view]").forEach(function (b) { b.setAttribute("aria-pressed", (b.dataset.view === "sil") === vstate.sil ? "true" : "false"); });
    document.querySelectorAll(".art").forEach(function (a) { a.classList.toggle("sil", vstate.sil); });
    refresh();
  }
  var BY_HASH = { hufflepuff: "air", ravenclaw: "water", gryffindor: "fire", slytherin: "earth" };
  function fromHash() { return BY_HASH[(location.hash || "").slice(1)] || "air"; }
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () { var h = window.__TC.NATIONS[t.dataset.n].hash; if (location.hash.slice(1) !== h) location.hash = h; else setNation(t.dataset.n); });
    t.addEventListener("keydown", function (e) { var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab")), i = tabs.indexOf(t); if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var j = (i + (e.key === "ArrowRight" ? 1 : 3)) % 4; tabs[j].focus(); tabs[j].click(); e.preventDefault(); } });
  });
  window.addEventListener("hashchange", function () { setNation(fromHash()); });
  setNation(fromHash());
  requestAnimationFrame(frame);
  var btn = document.getElementById("motion");
  function setPaused(p) { paused = p; btn.setAttribute("aria-pressed", p ? "true" : "false"); btn.textContent = p ? "Play animation" : "Pause animation"; }
  btn.addEventListener("click", function () { setPaused(!paused); });
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
})();
</script>
