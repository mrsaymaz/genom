
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

