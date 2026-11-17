
  /* ---------- extra textures ---------- */
  TEX.soil = [256, 256, function (g, w, h, r) {
    g.fillStyle = "#6b4a2d"; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 32) {
      g.fillStyle = "rgba(30,18,8,.45)"; g.fillRect(0, y + 20, w, 10);
      g.fillStyle = "rgba(255,220,170,.12)"; g.fillRect(0, y + 4, w, 8);
    }
    speckle(g, w, h, r, 3000, ["#3e2a18", "#a3825a"], 0.45, 2);
  }];
  TEX.wicker = [128, 128, function (g, w, h, r) {
    g.fillStyle = "#8a6a3e"; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 8) for (var x = (y / 8) % 2 ? 0 : 8; x < w; x += 16) {
      g.fillStyle = jit("#b8935a", r, 0.25); g.fillRect(x, y, 14, 6);
    }
  }];

  /* ---------- builder extras ---------- */
  B.prototype.slab = function (S, top, side) {
    var t = M(top, S / 2, S / 2), s = M(side, S / 2, 0.72);
    this.add(new T3.BoxGeometry(S, 0.5, S), [s, s, t, C("#21180f"), s, s], 0, -0.25, 0);
  };
  B.prototype.water = function (x0, z0, x1, z1, yb, yt) {
    var w = x1 - x0, d = z1 - z0, tx = tex("water", Math.max(0.5, w / 2), Math.max(0.5, d / 2));
    var m = new T3.MeshStandardMaterial({ map: tx, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 });
    this.add(new T3.BoxGeometry(w, yt - yb, d), m, (x0 + x1) / 2, (yb + yt) / 2, (z0 + z1) / 2, { noCast: true });
    var sp = this.rand() * 3;
    this.fx.push(function (t) { tx.offset.set(t * 0.03 + sp, Math.sin(t * 0.4 + sp) * 0.02); });
  };
  B.prototype.slabWater = function (S, wz, top, side) {
    var t = M(top, S / 2, (S - wz) / 2), s = M(side, S / 2, 0.72), bt = C("#21180f");
    this.add(new T3.BoxGeometry(S, 0.5, S - wz), [s, s, t, bt, s, s], 0, -0.25, -wz / 2);
    this.add(new T3.BoxGeometry(S, 0.22, wz), M("dirt", S / 2, wz / 2), 0, -0.39, S / 2 - wz / 2);
    this.water(-S / 2, S / 2 - wz, S / 2, S / 2, -0.28, -0.07);
    this.box(S, 0.12, 0.18, M("stoneBlue", S / 2, 0.2), 0, -0.06, S / 2 - wz);
  };
  B.prototype.lift = function (y, fn) {
    var grp = new T3.Group(); grp.position.y = y; this.g.add(grp);
    var keep = this.g; this.g = grp; fn.call(this); this.g = keep; return grp;
  };
  B.prototype.logHall = function (cx, cz, w, d, y0, rows, r) {
    this.box(w - 0.06, rows * r * 1.9, d - 0.06, C("#5a3c24"), cx, y0, cz);
    var lm = [M("bark", 2, 3), M("logEnd"), M("logEnd")];
    for (var i = 0; i < rows; i++) {
      var y = y0 + r + i * r * 1.9;
      [cz + d / 2, cz - d / 2].forEach(function (z) { this.add(new T3.CylinderGeometry(r, r, w + 0.3, 10), lm, cx, y, z, { rz: PI / 2 }); }, this);
      [cx + w / 2, cx - w / 2].forEach(function (x) { this.add(new T3.CylinderGeometry(r, r, d + 0.3, 10), lm, x, y + r * 0.95, cz, { rx: PI / 2 }); }, this);
    }
    return y0 + rows * r * 1.9 + r;
  };
  B.prototype.hip = function (cx, cz, size, h, y, mat) {
    return this.add(new T3.ConeGeometry(size / Math.SQRT2, h, 4, 1), mat, cx, y + h / 2, cz, { ry: PI / 4 });
  };
  B.prototype.door = function (x, y, z, ry, w, h) {
    var grp = new T3.Group(); grp.position.set(x, y, z); grp.rotation.y = ry || 0; this.g.add(grp);
    this.add(new T3.BoxGeometry(w + 0.1, h + 0.06, 0.05), C("#2e1c10"), 0, h / 2, 0, { parent: grp });
    this.add(new T3.BoxGeometry(w, h, 0.04), M("plankDark", w, 1), 0, h / 2, 0.025, { parent: grp });
    this.add(new T3.SphereGeometry(0.025, 8, 6), C("#d8b35a", { metalness: 0.7, roughness: 0.3 }), w * 0.3, h * 0.5, 0.06, { parent: grp });
  };
  B.prototype.fire = function (x, y, z, s, light) {
    var grp = new T3.Group(); grp.position.set(x, y, z); this.g.add(grp);
    var fl = [];
    [["#ff5a1a", 0.17, 0.75], ["#ff8a2a", 0.13, 0.6], ["#ffc04a", 0.09, 0.42], ["#fff0b0", 0.05, 0.26]].forEach(function (f, i) {
      var mat = new T3.MeshBasicMaterial({ color: lin(f[0]), transparent: true, opacity: 0.85, blending: T3.AdditiveBlending, depthWrite: false });
      for (var k = 0; k < 3; k++) {
        var m = this.add(new T3.ConeGeometry(f[1] * s, f[2] * s, 8), mat, Math.cos(k * 2.1 + i) * 0.08 * s, f[2] * s / 2, Math.sin(k * 2.1 + i) * 0.08 * s, { parent: grp, noCast: true, noReceive: true });
        fl.push([m, i * 3 + k]);
      }
    }, this);
    var L = null;
    if (light) { L = new T3.PointLight("#ff8a3d", light, 4 * s + 1.5, 2); L.position.set(x, y + 0.4 * s, z); this.g.add(L); }
    var ph = this.rand() * 9;
    this.fx.push(function (t) {
      fl.forEach(function (q) { var m = q[0], p = q[1] + ph; m.scale.set(1 + Math.sin(t * 9 + p) * 0.12, 1 + Math.sin(t * 11 + p * 1.7) * 0.25, 1 + Math.cos(t * 8 + p) * 0.12); });
      if (L) L.intensity = light * (1 + Math.sin(t * 13 + ph) * 0.12 + Math.sin(t * 7.3) * 0.08);
    });
  };
  B.prototype.smoke = function (x, y, z, n) {
    var list = [];
    for (var i = 0; i < (n || 6); i++) {
      var sp = new T3.Sprite(new T3.SpriteMaterial({ map: tex("smoke"), transparent: true, depthWrite: false, opacity: 0.5 }));
      this.g.add(sp); list.push([sp, i / (n || 6)]);
    }
    var g = this.g;
    this.fx.push(function (t) {
      list.forEach(function (q) { var k = (t * 0.2 + q[1]) % 1; q[0].position.set(x + k * 0.4, y + k * 1.2, z - k * 0.25); var sc = 0.18 + k * 0.55; q[0].scale.set(sc, sc, 1); q[0].material.opacity = 0.5 * (1 - k) * Math.min(1, k * 6); });
    });
  };
  B.prototype.wheat = function (x0, z0, x1, z1, rows, per, cols) {
    var self = this, mats = cols.map(function (c) { return C(c, { flatShading: true }); });
    for (var i = 0; i < rows; i++) {
      var z = z0 + (i + 0.5) * (z1 - z0) / rows;
      var row = new T3.Group(); row.position.set(0, 0.06, z); this.g.add(row);
      for (var k = 0; k < per; k++) {
        var x = x0 + (k + 0.5) * (x1 - x0) / per + (this.rand() - 0.5) * 0.08;
        for (var q = 0; q < 3; q++) {
          var hh = 0.28 + this.rand() * 0.12;
          this.add(new T3.ConeGeometry(0.035, hh, 4), mats[(this.rand() * mats.length) | 0], x + (this.rand() - 0.5) * 0.1, hh / 2, (this.rand() - 0.5) * 0.1,
            { parent: row, rz: (this.rand() - 0.5) * 0.3, rx: (this.rand() - 0.5) * 0.3 });
        }
      }
      (function (row, ph) { self.fx.push(function (t) { row.rotation.x = Math.sin(t * 1.4 + ph) * 0.05; }); })(row, i * 0.6);
    }
  };
  B.prototype.cabbages = function (x0, z0, x1, z1, rows, per, col, y) {
    var mat = C(col, { flatShading: true }), mat2 = C("#9cc86a", { flatShading: true });
    for (var i = 0; i < rows; i++) for (var k = 0; k < per; k++) {
      var x = x0 + (k + 0.5) * (x1 - x0) / per, z = z0 + (i + 0.5) * (z1 - z0) / rows, s = 0.09 + this.rand() * 0.03;
      this.add(new T3.IcosahedronGeometry(s, 0), mat, x, (y || 0) + s * 0.7, z, { s: [1, 0.75, 1], ry: this.rand() * 3 });
      this.add(new T3.IcosahedronGeometry(s * 0.55, 0), mat2, x, (y || 0) + s * 1.2, z, { noCast: true });
    }
  };
  B.prototype.pumpkin = function (x, z, s, y) {
    this.add(new T3.SphereGeometry(s, 10, 8), C("#e0761e", { flatShading: true }), x, (y || 0) + s * 0.7, z, { s: [1, 0.72, 1] });
    this.add(new T3.CylinderGeometry(0.015, 0.02, 0.06, 5), C("#4a6a2a"), x, (y || 0) + s * 1.45, z);
  };
  B.prototype.fence = function (pts, h, mat) {
    mat = mat || C("#6a4a2c");
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      this.box(0.06, h, 0.06, mat, p[0], 0, p[1]);
      if (i < pts.length - 1) {
        var q = pts[i + 1], dx = q[0] - p[0], dz = q[1] - p[1], len = Math.hypot(dx, dz), n = Math.max(1, Math.round(len / 0.6));
        for (var k = 1; k < n; k++) this.box(0.05, h * 0.9, 0.05, mat, p[0] + dx * k / n, 0, p[1] + dz * k / n);
        [h * 0.4, h * 0.8].forEach(function (y) { this.beam([p[0], y, p[1]], [q[0], y, q[1]], 0.018, mat); }, this);
      }
    }
  };
  B.prototype.dummy = function (x, z, ry) {
    var grp = new T3.Group(); grp.position.set(x, 0, z); grp.rotation.y = ry || 0; this.g.add(grp);
    var w = C("#5a3d24");
    this.add(new T3.CylinderGeometry(0.03, 0.03, 0.8, 6), w, 0, 0.4, 0, { parent: grp });
    this.add(new T3.CylinderGeometry(0.11, 0.13, 0.32, 10), M("straw", 1, 1), 0, 0.52, 0, { parent: grp });
    this.add(new T3.SphereGeometry(0.08, 10, 8), M("straw", 1, 1), 0, 0.78, 0, { parent: grp });
    this.add(new T3.BoxGeometry(0.42, 0.04, 0.04), w, 0, 0.6, 0, { parent: grp });
    this.add(new T3.CylinderGeometry(0.135, 0.135, 0.06, 10), C("#a33a2a"), 0, 0.5, 0, { parent: grp });
  };
  B.prototype.rack = function (x, z, ry, tip) {
    var grp = new T3.Group(); grp.position.set(x, 0, z); grp.rotation.y = ry || 0; this.g.add(grp);
    var w = C("#4a3020");
    this.add(new T3.BoxGeometry(0.05, 0.6, 0.05), w, -0.3, 0.3, 0, { parent: grp });
    this.add(new T3.BoxGeometry(0.05, 0.6, 0.05), w, 0.3, 0.3, 0, { parent: grp });
    this.add(new T3.BoxGeometry(0.66, 0.04, 0.04), w, 0, 0.55, 0, { parent: grp });
    for (var i = 0; i < 4; i++) {
      var x0 = -0.22 + i * 0.15;
      this.beam([x0, 0.02, 0.1], [x0 + 0.02, 0.88, -0.04], 0.013, C("#7a5838"), grp);
      if (tip === "oar") this.add(new T3.BoxGeometry(0.07, 0.22, 0.015), C("#9a7448"), x0 + 0.02, 0.85, -0.03, { parent: grp, rx: 0.17 });
      else this.add(new T3.ConeGeometry(0.025, 0.1, 4), C("#c0c0c0", { metalness: 0.8, roughness: 0.3 }), x0 + 0.02, 0.93, -0.05, { parent: grp });
    }
  };
  B.prototype.gold = function (x, z, y) {
    var gm = C("#f2c040", { metalness: 0.85, roughness: 0.3, flatShading: true });
    for (var i = 0; i < 7; i++) this.add(new T3.DodecahedronGeometry(0.05 + this.rand() * 0.03, 0), gm, x + (this.rand() - 0.5) * 0.22, (y || 0) + 0.04 + (i > 4 ? 0.06 : 0), z + (this.rand() - 0.5) * 0.22, { ry: i });
  };
  B.prototype.sack = function (x, z, y, col) {
    this.add(new T3.SphereGeometry(0.12, 10, 8), C(col || "#b8935a"), x, (y || 0) + 0.11, z, { s: [1, 1.1, 0.9] });
    this.add(new T3.CylinderGeometry(0.03, 0.05, 0.06, 6), C(col || "#b8935a"), x, (y || 0) + 0.26, z);
  };
  B.prototype.basket = function (x, z, fill) {
    this.cyl(0.12, 0.1, 0.16, 12, M("wicker", 2, 1), x, 0, z);
    if (fill) for (var i = 0; i < 4; i++) this.add(new T3.SphereGeometry(0.045, 8, 6), C(fill), x + Math.cos(i * 1.6) * 0.05, 0.17, z + Math.sin(i * 1.6) * 0.05);
  };
  B.prototype.pinwheel = function (x, y, z, s, cols) {
    var hub = new T3.Group(); hub.position.set(x, y, z); hub.rotation.y = PI / 4; this.g.add(hub);
    var spin = new T3.Group(); hub.add(spin);
    for (var i = 0; i < 4; i++) {
      var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(s, s * 0.15); sh.lineTo(s * 0.9, s * 0.5); sh.closePath();
      var m = this.add(new T3.ShapeGeometry(sh), C(cols[i % cols.length], { side: T3.DoubleSide }), 0, 0, 0, { parent: spin, noCast: false });
      m.rotation.z = i * PI / 2;
    }
    this.add(new T3.SphereGeometry(s * 0.12, 8, 6), C("#e8bf45"), 0, 0, 0.02, { parent: spin });
    this.fx.push(function (t, dt) { spin.rotation.z -= dt * 3; });
  };
  B.prototype.windsock = function (x, z, h) {
    this.cyl(0.025, 0.03, h, 6, C("#3a2818"), x, 0, z);
    var pv = new T3.Group(); pv.position.set(x, h - 0.05, z); this.g.add(pv);
    var cols = ["#e8bf45", "#2a2622", "#e8bf45", "#2a2622"];
    for (var i = 0; i < 4; i++) {
      var g = new T3.CylinderGeometry(0.1 - i * 0.017, 0.1 - (i + 1) * 0.017, 0.14, 10, 1, true);
      this.add(g, C(cols[i], { side: T3.DoubleSide }), 0.09 + i * 0.14, 0, 0, { parent: pv, rz: PI / 2 });
    }
    pv.rotation.y = -PI / 4;
    this.fx.push(function (t) { pv.rotation.y = -PI / 4 + Math.sin(t * 1.1) * 0.35; pv.rotation.z = Math.sin(t * 2.3) * 0.06 - 0.05; });
  };
  B.prototype.pennant = function (x, y, z, col, h) {
    this.cyl(0.018, 0.018, h || 0.5, 6, C("#3a2818"), x, y, z);
    var pv = new T3.Group(); pv.position.set(x, y + (h || 0.5) - 0.02, z); this.g.add(pv);
    var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(0.4, -0.08); sh.lineTo(0, -0.17); sh.closePath();
    this.add(new T3.ShapeGeometry(sh), C(col, { side: T3.DoubleSide }), 0, 0, 0, { parent: pv, ry: -PI / 4 });
    var ph = this.rand() * 6;
    this.fx.push(function (t) { pv.rotation.y = Math.sin(t * 2.2 + ph) * 0.35; });
  };
  B.prototype.mound = function (x, z, rx, h, rz, key, rep) {
    var sg = new T3.SphereGeometry(1, 48, 20, 0, 2 * PI, 0, PI / 2), pos = sg.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
      var k = py > 0.02 ? 1 + (n3(px * 3 + x, py * 3, pz * 3 + z) - 0.5) * 0.08 : 1;
      pos.setXYZ(i, px * k, py * k, pz * k);
    }
    sg.computeVertexNormals();
    this.add(sg, M(key || "grassEarth", rep || 3, (rep || 3) / 2), x, 0, z, { s: [rx, h, rz] });
    return function (px, pz) { var u = (px - x) / rx, v = (pz - z) / rz, d = u * u + v * v; return d >= 1 ? 0 : h * Math.sqrt(1 - d); };
  };
  B.prototype.mushrooms = function (pts, capM) {
    pts.forEach(function (m, i) {
      var s = 0.6 + (i % 3) * 0.25;
      this.cyl(0.02 * s, 0.025 * s, 0.12 * s, 6, C("#e6eedd"), m[0], 0, m[1]);
      this.add(new T3.SphereGeometry(0.07 * s, 10, 6, 0, 2 * PI, 0, PI / 2), capM, m[0], 0.12 * s, m[1], { noCast: true });
    }, this);
  };
  B.prototype.boat = function (x, z, ry) {
    var sh = new T3.Shape(); sh.moveTo(-0.5, 0); sh.quadraticCurveTo(-0.3, 0.2, 0, 0.2); sh.quadraticCurveTo(0.3, 0.2, 0.5, 0);
    sh.quadraticCurveTo(0.3, -0.2, 0, -0.2); sh.quadraticCurveTo(-0.3, -0.2, -0.5, 0);
    var g = new T3.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: false });
    var grp = new T3.Group(); grp.position.set(x, -0.12, z); grp.rotation.y = ry || 0; this.g.add(grp);
    this.add(g, M("plankWarm", 2, 2), 0, 0, 0, { parent: grp, rx: -PI / 2 });
    this.add(new T3.BoxGeometry(0.06, 0.03, 0.34), C("#5a3d24"), 0.05, 0.15, 0, { parent: grp });
    this.add(new T3.BoxGeometry(0.6, 0.02, 0.025), C("#5a3d24"), 0.1, 0.17, 0.1, { parent: grp, ry: 0.3 });
    var ph = this.rand() * 4;
    this.fx.push(function (t) { grp.rotation.z = Math.sin(t * 1.2 + ph) * 0.04; grp.position.y = -0.12 + Math.sin(t * 1.5 + ph) * 0.012; });
  };
  B.prototype.well = function (x, z, roofMat) {
    var st = M("stoneBlue", 1.5, 0.4);
    this.add(new T3.CylinderGeometry(0.26, 0.28, 0.32, 14, 1, true), st, x, 0.16, z);
    this.add(new T3.TorusGeometry(0.26, 0.04, 6, 18), C("#8e9aa3"), x, 0.32, z, { rx: PI / 2 });
    this.add(new T3.CircleGeometry(0.24, 16), E("#2a78b6", "#103a60", 0.4), x, 0.22, z, { rx: -PI / 2, noCast: true });
    var w = C("#4a3020");
    this.box(0.05, 0.7, 0.05, w, x - 0.26, 0, z); this.box(0.05, 0.7, 0.05, w, x + 0.26, 0, z);
    this.beam([x - 0.28, 0.6, z], [x + 0.28, 0.6, z], 0.02, w);
    this.gable({ len: 0.62, wid: 0.5, rise: 0.22, over: 0.06, mat: roofMat, gmat: M("plankWarm", 0.5, 0.3), x: x, y: 0.7, z: z, thick: 0.04 });
    this.cyl(0.05, 0.04, 0.09, 8, M("plankWarm", 0.3, 0.2), x + 0.05, 0.38, z);
  };
  B.prototype.scarecrow = function (x, z, cloth) {
    var w = C("#5a3d24");
    this.box(0.05, 0.9, 0.05, w, x, 0, z);
    this.box(0.55, 0.04, 0.04, w, x, 0.68, z, { ry: PI / 4 });
    this.add(new T3.SphereGeometry(0.08, 10, 8), M("straw", 1, 1), x, 0.96, z);
    this.add(new T3.ConeGeometry(0.14, 0.14, 10), M("straw", 1, 1), x, 1.06, z);
    var body = this.add(new T3.CylinderGeometry(0.1, 0.16, 0.34, 8), C(cloth), x, 0.6, z);
    var pv = new T3.Group(); pv.position.set(x, 0.68, z); this.g.add(pv);
    [-1, 1].forEach(function (s) {
      this.add(new T3.PlaneGeometry(0.04, 0.3), C(cloth, { side: T3.DoubleSide }), s * 0.19, -0.15, 0, { parent: pv, noCast: true });
    }, this);
    pv.rotation.y = PI / 4;
    this.fx.push(function (t) { pv.rotation.x = Math.sin(t * 2) * 0.15; });
  };

  /* ================= HUFFLEPUFF (AIR) ================= */
  var Y_SHUT = "#e3b437", GLASS = "#ffe39a", GLOW = "#ffb23e";
  function airHouse(b) {
    b.slab(3.2, "grassAir", "sideAir");
    b.decal("path", 0.05, 1.25, 0.8, 1.1);
    var st = M("stoneGrey", 1.2, 0.2), stT = M("stoneGrey", 1, 1);
    b.add(new T3.BoxGeometry(2.0, 0.2, 1.8), [st, st, stT, st, st, st], 0, 0.1, -0.1);
    var post = M("plankDark", 0.3, 1), dark = C("#3e2817"), wood = M("plankWarm", 2, 1);
    [[-0.8, -0.8], [-0.8, 0.6], [0.8, -0.8], [0.8, 0.6]].forEach(function (p) { b.cyl(0.07, 0.08, 0.3, 8, post, p[0], 0.2, p[1]); });
    b.box(1.9, 0.1, 1.7, M("plankWarm", 2, 2), 0, 0.48, -0.1);
    b.box(1.55, 0.8, 1.3, wood, 0, 0.58, -0.1);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (s) { b.box(0.1, 0.82, 0.1, dark, s[0] * 0.775, 0.57, -0.1 + s[1] * 0.65); });
    b.box(1.62, 0.07, 1.37, dark, 0, 1.36, -0.1);
    var fz = 0.55;
    b.door(0, 0.58, fz + 0.01, 0, 0.4, 0.62);
    b.window(-0.48, 1.0, fz + 0.03, 0, 0.24, 0.24, GLASS, GLOW, Y_SHUT);
    b.window(0.48, 1.0, fz + 0.03, 0, 0.24, 0.24, GLASS, GLOW, Y_SHUT);
    b.window(0.805, 1.0, -0.1, PI / 2, 0.24, 0.24, GLASS, GLOW, Y_SHUT);
    b.gable({ len: 1.55, wid: 1.3, rise: 0.72, over: 0.24, mat: M("canvas", 1.4, 0.8, { side: T3.DoubleSide }), gmat: wood, x: 0, y: 1.43, z: -0.1 });
    b.box(0.5, 0.38, 0.2, M("plankWarm", 0.5, 0.3), 0, 0, fz + 0.2);
    b.box(0.5, 0.19, 0.2, M("plankWarm", 0.5, 0.2), 0, 0, fz + 0.4);
    b.cyl(0.015, 0.015, 0.35, 6, dark, 0.95, 2.15, -0.1);
    b.pinwheel(0.95, 2.5, -0.1, 0.22, ["#e8bf45", "#f4efe2"]);
    b.hay(-1.15, 1.0, 0.4); b.barrel(1.05, 0.95); b.bush(-1.2, -1.2, 0.16); b.rock(1.3, -0.9, 0.1);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 0.9 + b.rand() * 0.6, "#5a9238");
  }
  function airFarm(b) {
    b.slab(4.2, "grassAir", "sideAir");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0, 0, 0);
    b.wheat(-1.35, -1.35, 1.35, 1.35, 8, 9, ["#d9b84a", "#c8a83e", "#e6cc6a", "#b8a03a"]);
    b.fence([[0.5, 1.65], [1.65, 1.65], [1.65, -1.65], [-1.65, -1.65], [-1.65, 1.65], [-0.5, 1.65]], 0.38);
    var w = M("plankDark", 0.3, 1);
    var bx = -1.85, bz = -1.85, h = 2.1;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) { b.beam([bx + s[0] * 0.22, 0, bz + s[1] * 0.22], [bx + s[0] * 0.06, h, bz + s[1] * 0.06], 0.03, w); });
    [0.6, 1.3].forEach(function (y) { var k = 0.22 - (0.16 * y / h); b.beam([bx - k, y, bz + k], [bx + k, y, bz + k], 0.02, w); b.beam([bx + k, y, bz - k], [bx + k, y, bz + k], 0.02, w); });
    b.pinwheel(bx + 0.08, h + 0.05, bz + 0.08, 0.45, ["#f4efe2", "#e8bf45"]);
    b.box(0.5, 0.25, 0.35, M("stoneGrey", 0.5, 0.3), bx + 0.45, 0, bz + 0.1);
    b.scarecrow(0.35, 0.2, "#e8bf45");
    b.hay(1.85, 0.6, 0.2); b.hay(1.9, 1.15, -0.4); b.basket(-1.9, 1.8, "#e6cc6a"); b.basket(-1.65, 1.95);
    b.bush(1.9, -1.9, 0.17);
    for (var i = 0; i < 14; i++) b.tuft(-2 + b.rand() * 4, 1.75 + b.rand() * 0.3, "#5a9238");
  }
  function airStore(b) {
    b.slab(3.2, "grassAir", "sideAir");
    b.decal("path", 0.2, 1.2, 1.2, 1.0);
    var st = M("stoneGrey", 1.2, 0.2), stT = M("stoneGrey", 1, 1);
    b.add(new T3.BoxGeometry(2.0, 0.2, 1.8), [st, st, stT, st, st, st], -0.1, 0.1, -0.15);
    var post = M("plankDark", 0.3, 1), dark = C("#3e2817");
    [[-0.95, -0.9], [-0.95, 0.6], [0.75, -0.9], [0.75, 0.6], [-0.1, -0.9], [-0.1, 0.6]].forEach(function (p) { b.cyl(0.07, 0.08, 0.34, 8, post, p[0], 0.2, p[1]); });
    var Y = 0.54;
    b.box(1.95, 0.1, 1.75, M("plankWarm", 2, 2), -0.1, Y, -0.15);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (s) { b.box(0.1, 0.92, 0.1, dark, -0.1 + s[0] * 0.88, Y + 0.1, -0.15 + s[1] * 0.78); });
    b.box(1.8, 0.45, 0.06, M("plankWarm", 1.6, 0.4), -0.1, Y + 0.1, -0.9);
    b.gable({ len: 1.85, wid: 1.6, rise: 0.55, over: 0.2, mat: M("canvas", 1.6, 0.8, { side: T3.DoubleSide }), gmat: M("plankWarm", 1, 0.5), x: -0.1, y: Y + 1.02, z: -0.15 });
    b.lift(Y + 0.1, function () {
      this.logs(-0.6, -0.4, PI / 2);
      this.crate(0.3, -0.55, 0.3, 0.2); this.crate(0.32, -0.55, 0.22, -0.3);
      this.sack(0.1, 0.25, 0, "#c9a86a"); this.sack(0.35, 0.3, 0, "#c9a86a"); this.gold(-0.25, 0.3);
    });
    for (var s = 0; s < 3; s++) b.box(0.55, Y + 0.1 - s * 0.2, 0.2, M("plankWarm", 0.5, 0.3), 0.35, 0, 0.82 + s * 0.2);
    var CX = 1.2, CZ = 0.4;
    b.cyl(0.06, 0.07, 1.8, 8, post, CX, 0, CZ);
    b.beam([CX, 1.7, CZ], [CX + 0.45, 1.95, CZ + 0.45], 0.035, post);
    var pv = new T3.Group(); pv.position.set(CX + 0.45, 1.95, CZ + 0.45); b.g.add(pv);
    b.add(new T3.CylinderGeometry(0.008, 0.008, 1.0, 4), C("#d8cba6"), 0, -0.5, 0, { parent: pv });
    b.add(new T3.BoxGeometry(0.22, 0.22, 0.22), M("plankWarm", 0.4, 0.4), 0, -1.1, 0, { parent: pv });
    b.fx.push(function (t) { pv.rotation.z = Math.sin(t * 1.2) * 0.08; pv.rotation.x = Math.sin(t * 0.9) * 0.05; });
    b.pennant(-1.05, Y + 1.6, -0.15, "#e8bf45", 0.45);
    b.logs(-1.25, 1.05, 0.3); b.bush(1.25, -1.2, 0.16); b.hay(-1.3, 0.5, 1.2);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 1.0 + b.rand() * 0.5, "#5a9238");
  }
  function airBarracks(b) {
    b.slab(4.2, "grassAir", "sideAir");
    b.decal("path", 0.3, 1.2, 2.6, 1.6);
    var HX = -0.2, HZ = -0.55;
    var st = M("stoneGrey", 2, 0.2), stT = M("stoneGrey", 2, 1.2);
    b.add(new T3.BoxGeometry(3.0, 0.24, 1.9), [st, st, stT, st, st, st], HX, 0.12, HZ);
    var wood = M("plankWarm", 3, 1), dark = C("#3e2817");
    b.box(2.7, 1.0, 1.55, wood, HX, 0.24, HZ);
    [[-1, -1], [-1, 1], [1, -1], [1, 1], [0, 1]].forEach(function (s) { b.box(0.11, 1.02, 0.11, dark, HX + s[0] * 1.35, 0.23, HZ + s[1] * 0.775); });
    b.box(2.8, 0.08, 1.65, dark, HX, 1.22, HZ);
    var fz = HZ + 0.775;
    b.door(HX, 0.24, fz + 0.01, 0, 0.56, 0.72);
    b.window(HX - 0.85, 0.75, fz + 0.03, 0, 0.26, 0.28, GLASS, GLOW, Y_SHUT);
    b.window(HX + 0.85, 0.75, fz + 0.03, 0, 0.26, 0.28, GLASS, GLOW, Y_SHUT);
    b.window(HX + 1.38, 0.75, HZ, PI / 2, 0.26, 0.28, GLASS, GLOW, Y_SHUT);
    b.gable({ len: 2.7, wid: 1.55, rise: 0.82, over: 0.26, mat: M("canvas", 2.4, 1, { side: T3.DoubleSide }), gmat: wood, x: HX, y: 1.3, z: HZ });
    b.pennant(HX - 1.5, 2.15, HZ, "#e8bf45", 0.45); b.pennant(HX + 1.5, 2.15, HZ, "#2a2622", 0.4);
    b.banner(HX - 0.55, fz + 0.45, 0, "bannerAir", 1.5); b.banner(HX + 0.55, fz + 0.45, 0, "bannerAir", 1.5);
    b.dummy(1.25, 1.35, 0.3); b.dummy(1.75, 0.85, -0.2);
    b.rack(-1.25, 1.45, 0.2, "spear");
    b.windsock(1.75, -1.6, 1.6);
    b.barrel(-1.85, 0.75); b.crate(-1.9, 1.15, 0.26, 0.4); b.pine(-1.8, -1.85, 0.9); b.bush(1.85, 1.85, 0.16);
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, 1.6 + b.rand() * 0.4, "#5a9238");
  }
  function airTower(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var st = M("stoneGrey", 1, 0.3), stT = M("stoneGrey", 1, 1);
    b.add(new T3.BoxGeometry(1.5, 0.32, 1.5), [st, st, stT, st, st, st], 0, 0.16, 0);
    var post = M("plankDark", 0.3, 2), dark = C("#3e2817"), H = 2.5, Y0 = 0.32;
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (s) { b.beam([s[0] * 0.6, Y0, s[1] * 0.6], [s[0] * 0.42, H, s[1] * 0.42], 0.055, post); });
    [[Y0 + 0.1, 0.9], [0.9, 1.7], [1.7, H - 0.05]].forEach(function (lv) {
      var k0 = 0.6 - (lv[0] - Y0) / (H - Y0) * 0.18, k1 = 0.6 - (lv[1] - Y0) / (H - Y0) * 0.18;
      b.beam([-k0, lv[0], k0], [k1, lv[1], k1], 0.02, dark); b.beam([k0, lv[0], k0], [-k1, lv[1], k1], 0.02, dark);
      b.beam([k0, lv[0], -k0], [k1, lv[1], k1], 0.02, dark); b.beam([k0, lv[0], k0], [k1, lv[1], -k1], 0.02, dark);
    });
    b.box(1.3, 0.1, 1.3, M("plankWarm", 1.2, 1.2), 0, H, 0);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (s) { b.box(0.06, 0.62, 0.06, dark, s[0] * 0.6, H + 0.1, s[1] * 0.6); });
    [0.3, 0.5].forEach(function (y) {
      b.beam([-0.6, H + y, 0.6], [0.6, H + y, 0.6], 0.015, dark); b.beam([0.6, H + y, -0.6], [0.6, H + y, 0.6], 0.015, dark);
      b.beam([-0.6, H + y, -0.6], [0.6, H + y, -0.6], 0.015, dark); b.beam([-0.6, H + y, -0.6], [-0.6, H + y, 0.6], 0.015, dark);
    });
    b.hip(0, 0, 1.55, 0.6, H + 0.7, M("canvas", 2, 1, { side: T3.DoubleSide, flatShading: true }));
    b.pennant(0, H + 1.25, 0, "#e8bf45", 0.45);
    b.beam([-0.15, Y0, 0.75], [-0.15, H, 0.62], 0.02, dark); b.beam([0.15, Y0, 0.75], [0.15, H, 0.62], 0.02, dark);
    for (var r = 0; r < 9; r++) { var y = Y0 + 0.2 + r * 0.24, z = 0.75 - (y - Y0) / (H - Y0) * 0.13; b.beam([-0.15, y, z], [0.15, y, z], 0.012, dark); }
    var lamp = E("#ffe39a", "#ffb23e", 1.2);
    b.add(new T3.SphereGeometry(0.07, 10, 8), lamp, 0.45, H + 0.42, 0.45, { noCast: true });
    b.windsock(1.1, -0.9, 1.3);
    b.hay(-1.1, 0.9, 0.2); b.barrel(-1.05, -1.1); b.rock(1.2, 1.1, 0.12); b.bush(-1.2, 1.3, 0.14);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 0.9 + b.rand() * 0.6, "#5a9238");
  }

  /* ================= RAVENCLAW (WATER) ================= */
  var B_SHUT = "#2f5fa8", WGL = "#c6ecff", WGW = "#6ac8ff";
  function waterHouse(b) {
    b.slab(3.2, "grassWater", "sideWater");
    b.decal("path", 0, 1.2, 0.8, 1.0);
    var st = M("stoneBlue", 1.2, 0.2), stT = M("stoneBlue", 1, 1);
    b.add(new T3.BoxGeometry(1.9, 0.24, 1.7), [st, st, stT, st, st, st], -0.15, 0.12, -0.2);
    var top = b.logHall(-0.15, -0.2, 1.5, 1.3, 0.24, 5, 0.085);
    var fz = -0.2 + 0.65 + 0.09;
    b.door(-0.15, 0.24, fz, 0, 0.38, 0.6);
    b.window(-0.68, 0.72, fz + 0.01, 0, 0.22, 0.24, WGL, WGW, B_SHUT);
    b.window(0.38, 0.72, fz + 0.01, 0, 0.22, 0.24, WGL, WGW, B_SHUT);
    b.window(0.69, 0.72, -0.2, PI / 2, 0.22, 0.24, WGL, WGW, B_SHUT);
    b.hip(-0.15, -0.2, 2.0, 0.85, top, M("shinglesBlue", 2.5, 1.5, { flatShading: true }));
    b.box(0.26, 0.6, 0.26, M("stoneBlue", 0.3, 0.6), -0.55, top + 0.35, -0.55);
    b.smoke(-0.55, top + 1.0, -0.55, 5);
    b.well(0.95, 0.95, M("shinglesBlue", 0.6, 0.4));
    b.barrel(-1.1, 0.95); b.basket(-1.25, 0.6, "#8fc0e0");
    b.oak(-1.15, -1.2, 0.75); b.bush(1.2, -1.15, 0.15);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 1.0 + b.rand() * 0.5, "#4f9246");
  }
  function waterFarm(b) {
    b.slab(4.2, "grassWater", "sideWater");
    var soil = M("soil", 1, 3);
    [-1.1, 0, 1.1].forEach(function (x) {
      b.box(0.85, 0.12, 2.9, soil, x, 0, 0.1);
      b.box(0.89, 0.13, 0.05, C("#5a3c24"), x, 0, -1.37); b.box(0.89, 0.13, 0.05, C("#5a3c24"), x, 0, 1.57);
    });
    b.water(-0.675, -1.35, -0.425, 1.55, 0, 0.07);
    b.water(0.425, -1.35, 0.675, 1.55, 0, 0.07);
    b.water(-1.6, -1.65, 1.6, -1.4, 0, 0.07);
    b.cabbages(-1.45, -1.25, -0.75, 1.45, 7, 2, "#5f9e4a", 0.12);
    b.cabbages(0.75, -1.25, 1.45, 1.45, 7, 2, "#4f8a6a", 0.12);
    b.lift(0.12, function () { this.wheat(-0.35, -1.25, 0.35, 1.45, 9, 2, ["#7fbf5a", "#6aa84a", "#9fd06a"]); });
    var WX = -1.85, WZ = -1.55;
    b.box(0.4, 0.2, 0.5, M("stoneBlue", 0.4, 0.2), WX + 0.05, 0, WZ);
    b.water(WX - 0.12, WZ - 0.2, WX + 0.2, WZ + 0.2, 0.12, 0.18);
    var wheel = new T3.Group(); wheel.position.set(WX - 0.12, 0.42, WZ - 0.4); b.g.add(wheel);
    var bronze = C("#b98a45", { metalness: 0.6, roughness: 0.4 }), wd = C("#7a5232");
    b.add(new T3.TorusGeometry(0.36, 0.022, 6, 24), bronze, 0, 0, 0, { parent: wheel, ry: PI / 2 });
    for (var k = 0; k < 8; k++) {
      var a = k * PI / 4;
      b.add(new T3.BoxGeometry(0.16, 0.12, 0.02), wd, 0, Math.cos(a) * 0.38, Math.sin(a) * 0.38, { parent: wheel, rx: -a });
      if (k < 4) b.add(new T3.BoxGeometry(0.02, 0.72, 0.02), wd, 0, 0, 0, { parent: wheel, rx: a });
    }
    b.box(0.06, 0.45, 0.06, C("#4a3020"), WX - 0.12, 0, WZ - 0.4);
    b.fx.push(function (t, dt) { wheel.rotation.x -= dt * 1.2; });
    var fence = C("#5a3c24");
    b.fence([[1.85, 1.85], [1.85, -1.85], [-1.4, -1.85]], 0.36, fence);
    b.scarecrow(1.6, 1.75, "#2f5fa8");
    b.basket(-1.85, 1.75, "#5f9e4a"); b.basket(-1.6, 1.9, "#e0761e"); b.barrel(-1.9, 1.35);
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, 1.75 + b.rand() * 0.3, "#4f9246");
  }
  function waterStore(b) {
    b.slabWater(3.2, 1.0, "grassWater", "sideWater");
    var HX = -0.35, HZ = -0.7;
    var st = M("stoneBlue", 1.2, 0.2);
    b.box(1.95, 0.2, 1.4, st, HX, 0, HZ);
    var top = b.logHall(HX, HZ, 1.6, 1.05, 0.2, 5, 0.085);
    b.gable({ len: 1.6, wid: 1.05, rise: 0.6, over: 0.22, mat: M("shinglesBlue", 2, 1), gmat: M("plankWarm", 1, 0.5), x: HX, y: top - 0.04, z: HZ });
    var fz = HZ + 0.525 + 0.09;
    b.box(0.62, 0.62, 0.05, C("#2e1c10"), HX, 0.2, fz);
    b.box(0.54, 0.58, 0.03, C("#140c06"), HX, 0.2, fz + 0.025);
    b.window(HX + 0.89, 0.62, HZ, PI / 2, 0.22, 0.22, WGL, WGW, B_SHUT);
    var deck = M("plankWarm", 1, 1.5);
    b.box(0.95, 0.06, 1.2, deck, 0.65, -0.04, 1.0);
    [[0.22, 0.45], [1.08, 0.45], [0.22, 1.55], [1.08, 1.55]].forEach(function (q) { b.cyl(0.04, 0.045, 0.6, 7, C("#4a3020"), q[0], -0.45, q[1]); });
    b.lift(0.02, function () { this.barrel(0.45, 0.85); this.barrel(0.75, 0.75); this.crate(0.85, 1.3, 0.26, 0.3); this.basket(0.45, 1.3, "#9fb8c8"); });
    b.boat(-0.6, 1.15, 0.15);
    b.beam([0.22, 0.05, 1.5], [-0.25, -0.05, 1.2], 0.008, C("#d8cba6"));
    b.logs(-1.25, 0.15, 0.1);
    b.sack(0.35, 0.1, 0, "#c9a86a"); b.gold(0.6, 0.15);
    b.banner(0.75, -0.25, 0, "bannerWater", 1.3);
    b.oak(1.15, -1.15, 0.75); b.bush(-1.3, -1.35, 0.14);
    var reed = C("#6a8a3a", { flatShading: true });
    [[-1.4, 1.35], [1.35, 1.45]].forEach(function (q) {
      for (var k = 0; k < 5; k++) b.add(new T3.ConeGeometry(0.02, 0.45 + b.rand() * 0.25, 3), reed, q[0] + (b.rand() - 0.5) * 0.18, 0.1, q[1] + (b.rand() - 0.5) * 0.18, { rz: (b.rand() - 0.5) * 0.4 });
    });
  }
  function waterBarracks(b) {
    b.slab(4.2, "grassWater", "sideWater");
    b.decal("path", 0.2, 1.25, 2.4, 1.5);
    var HX = -0.2, HZ = -0.55;
    var st = M("stoneBlue", 2, 0.25), stT = M("stoneBlue", 2, 1.3);
    b.add(new T3.BoxGeometry(3.0, 0.3, 1.95), [st, st, stT, st, st, st], HX, 0.15, HZ);
    var top = b.logHall(HX, HZ, 2.6, 1.4, 0.3, 6, 0.09);
    b.gable({ len: 2.6, wid: 1.4, rise: 0.8, over: 0.26, mat: M("shinglesBlue", 3, 1.2), gmat: M("plankWarm", 1.5, 0.6), x: HX, y: top - 0.04, z: HZ });
    var fz = HZ + 0.7 + 0.1;
    b.door(HX, 0.3, fz, 0, 0.55, 0.72);
    b.box(0.85, 0.05, 0.35, M("canvas", 1, 1), HX, 1.15, fz + 0.15, { rx: 0.35 });
    b.window(HX - 0.85, 0.8, fz + 0.01, 0, 0.26, 0.28, WGL, WGW, B_SHUT);
    b.window(HX + 0.85, 0.8, fz + 0.01, 0, 0.26, 0.28, WGL, WGW, B_SHUT);
    b.window(HX + 1.4, 0.8, HZ, PI / 2, 0.26, 0.28, WGL, WGW, B_SHUT);
    b.banner(HX - 0.6, fz + 0.4, 0, "bannerWater", 1.5); b.banner(HX + 0.6, fz + 0.4, 0, "bannerWater", 1.5);
    b.rack(-1.3, 1.45, 0.2, "oar"); b.rack(1.2, 1.55, -0.2, "spear");
    b.box(0.7, 0.22, 0.3, M("plankWarm", 0.7, 0.3), 1.65, 0, 0.5);
    b.water(1.33, 0.38, 1.97, 0.62, 0.05, 0.2);
    b.dummy(1.75, 1.15, 0.2);
    b.barrel(-1.85, 0.6); b.oak(-1.75, -1.75, 0.95); b.bush(1.85, -1.8, 0.17);
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, 1.65 + b.rand() * 0.4, "#4f9246");
  }
  function waterTower(b) {
    b.slabWater(3.2, 0.9, "grassWater", "sideWater");
    var TX = -0.2, TZ = -0.45, st = M("stoneBlue", 3, 2);
    b.cyl(0.6, 0.68, 2.3, 20, st, TX, 0, TZ);
    b.cyl(0.8, 0.62, 0.14, 20, M("stoneBlue", 3, 0.2), TX, 2.3, TZ);
    for (var k = 0; k < 14; k++) { var a = k / 14 * 2 * PI; b.cyl(0.018, 0.018, 0.28, 5, C("#4a3020"), TX + Math.cos(a) * 0.76, 2.44, TZ + Math.sin(a) * 0.76); }
    b.add(new T3.TorusGeometry(0.76, 0.02, 5, 32), C("#4a3020"), TX, 2.7, TZ, { rx: PI / 2 });
    b.cyl(0.42, 0.45, 0.5, 16, M("stoneBlue", 2, 0.4), TX, 2.44, TZ);
    var bandM = E("#c6ecff", "#6ac8ff", 0.9);
    [0, 1, 2, 3].forEach(function (i) { var a = PI / 4 + (i - 1.5) * 0.5; b.box(0.08, 0.2, 0.03, bandM, TX + Math.cos(a) * 0.44, 2.58, TZ + Math.sin(a) * 0.44, { ry: PI / 2 - a, noCast: true }); });
    b.add(new T3.ConeGeometry(0.6, 0.7, 16), M("shinglesBlue", 3, 1.5), TX, 2.94 + 0.35, TZ);
    var lampY = 3.72;
    [0, 1, 2, 3].forEach(function (i) { var a = i * PI / 2 + PI / 4; b.cyl(0.012, 0.012, 0.3, 4, C("#b98a45", { metalness: 0.7 }), TX + Math.cos(a) * 0.12, lampY - 0.1, TZ + Math.sin(a) * 0.12); });
    var orb = E("#d6f4ff", "#58c8ff", 1.6);
    b.add(new T3.SphereGeometry(0.1, 14, 10), orb, TX, lampY + 0.05, TZ, { noCast: true });
    b.add(new T3.ConeGeometry(0.17, 0.16, 4), C("#b98a45", { metalness: 0.7, roughness: 0.35 }), TX, lampY + 0.28, TZ, { ry: PI / 4 });
    var L = new T3.PointLight("#58c8ff", 0.9, 3, 2); L.position.set(TX, lampY + 0.05, TZ); b.g.add(L);
    b.fx.push(function (t) { var k = 1 + Math.sin(t * 1.8) * 0.3; orb.emissiveIntensity = 1.4 * k; L.intensity = 0.8 * k; });
    b.door(TX + 0.47, 0, TZ + 0.47, PI / 4, 0.32, 0.55);
    b.window(TX + 0.45, 1.4, TZ + 0.45, PI / 4, 0.14, 0.24, WGL, WGW);
    b.box(0.6, 0.06, 0.8, M("plankWarm", 0.6, 1), 0.7, -0.04, 1.05);
    [[0.42, 0.7], [0.98, 0.7], [0.42, 1.42], [0.98, 1.42]].forEach(function (q) { b.cyl(0.035, 0.04, 0.5, 7, C("#4a3020"), q[0], -0.4, q[1]); });
    b.boat(-0.65, 1.2, -0.2);
    b.barrel(-1.15, 0.2); b.bush(1.2, -1.25, 0.15); b.rock(-1.25, -1.2, 0.12);
  }

  /* ================= GRYFFINDOR (FIRE) ================= */
  var FGL = "#ffd38a", FGW = "#ff9a3c";
  function halfTimberHouse(b, cx, cz, w, d, h, y0) {
    var htF = M("halfTimber", w / 1.1, h), htS = M("halfTimber", d / 1.1, h), pl = C("#e3d6ba"), dark = C("#3e2616");
    b.add(new T3.BoxGeometry(w, h, d), [htS, htS, pl, pl, htF, htF], cx, y0 + h / 2, cz);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (s) { b.box(0.11, h + 0.01, 0.11, dark, cx + s[0] * w / 2, y0, cz + s[1] * d / 2); });
  }
  function fireHouse(b) {
    b.slab(3.2, "grassFire", "sideFire");
    b.decal("path", 0, 1.2, 0.9, 1.0);
    b.box(1.75, 0.22, 1.45, M("stoneWarm", 1.6, 0.2), -0.1, 0, -0.15);
    halfTimberHouse(b, -0.1, -0.15, 1.6, 1.3, 0.85, 0.22);
    b.gable({ len: 1.6, wid: 1.3, rise: 0.75, over: 0.24, mat: M("shinglesRed", 2, 1.2), gmat: M("halfTimber", 1, 0.7), x: -0.1, y: 1.07, z: -0.15, ridge: C("#5a1e14") });
    b.box(0.36, 2.15, 0.42, M("stoneWarm", 0.5, 2.4), 0.82, 0, -0.15);
    b.box(0.42, 0.06, 0.48, M("stoneWarm", 0.5, 0.1), 0.82, 2.15, -0.15);
    b.smoke(0.82, 2.25, -0.15, 6);
    var fz = -0.15 + 0.65;
    b.door(-0.1, 0.22, fz + 0.01, 0, 0.4, 0.62);
    b.window(-0.58, 0.68, fz + 0.03, 0, 0.24, 0.24, FGL, FGW);
    b.window(0.38, 0.68, fz + 0.03, 0, 0.24, 0.24, FGL, FGW);
    b.logs(-1.1, 0.75, 0.2); b.barrel(0.95, 0.95); b.pine(-1.15, -1.15, 0.75); b.rock(1.25, 1.2, 0.1);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 1.0 + b.rand() * 0.5, "#7a8a38");
  }
  function fireFarm(b) {
    b.slab(4.2, "grassFire", "sideFire");
    b.box(3.0, 0.06, 3.0, M("soil", 3, 3), 0.15, 0, 0.15);
    b.wheat(-1.2, -1.2, 1.5, 1.5, 8, 9, ["#e8b83a", "#d8a030", "#f2cc5a", "#c88a28"]);
    b.fence([[0.6, 1.8], [1.8, 1.8], [1.8, -1.5], [-0.6, -1.5]], 0.38);
    b.fence([[-1.5, -0.6], [-1.5, 1.8], [-0.4, 1.8]], 0.38);
    var SX = -1.45, SZ = -1.45;
    b.box(0.95, 0.12, 0.8, M("stoneWarm", 0.9, 0.15), SX, 0, SZ);
    halfTimberHouse(b, SX, SZ, 0.85, 0.7, 0.6, 0.12);
    b.gable({ len: 0.85, wid: 0.7, rise: 0.45, over: 0.14, mat: M("shinglesRed", 1.2, 0.7), gmat: M("halfTimber", 0.6, 0.4), x: SX, y: 0.72, z: SZ, ridge: C("#5a1e14") });
    b.box(0.32, 0.45, 0.03, C("#2e1c10"), SX, 0.12, SZ + 0.36);
    [[1.8, -1.5], [-1.5, 1.8]].forEach(function (p) {
      b.cyl(0.03, 0.04, 0.7, 6, C("#4a3020"), p[0], 0, p[1]);
      b.cyl(0.07, 0.04, 0.08, 8, M("iron"), p[0], 0.7, p[1]);
      b.fire(p[0], 0.76, p[1], 0.35, 0.5);
    });
    b.scarecrow(0.2, 0.3, "#b3261e");
    b.hay(1.95, 1.0, 0.3); b.hay(1.95, 0.45, -0.2); b.basket(-1.9, 1.95, "#e8b83a");
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, -2 + b.rand() * 0.3, "#7a8a38");
  }
  function fireStore(b) {
    b.slab(3.2, "grassFire", "sideFire");
    b.decal("path", 0.1, 0.9, 1.6, 1.4);
    var HX = -0.1, HZ = -0.35, sw = M("stoneWarm", 1.8, 1);
    b.box(2.1, 0.12, 1.5, M("stoneWarm", 2, 1.4), HX, 0, HZ);
    b.box(2.0, 1.0, 0.26, sw, HX, 0.12, HZ - 0.62);
    b.box(0.26, 0.55, 1.3, M("stoneWarm", 1.2, 0.5), HX - 0.87, 0.12, HZ);
    var dark = C("#3e2616");
    [[1, 0.65], [-1, 0.65], [0.05, 0.65]].forEach(function (s) { b.box(0.12, 1.0, 0.12, dark, HX + s[0] * 0.92, 0.12, HZ + s[1]); });
    b.box(2.0, 0.1, 0.12, dark, HX, 1.08, HZ + 0.65);
    b.gable({ len: 2.0, wid: 1.4, rise: 0.6, over: 0.2, mat: M("shinglesRed", 2.4, 1), gmat: M("stoneWarm", 1.2, 0.5), x: HX, y: 1.12, z: HZ, ridge: C("#5a1e14") });
    b.lift(0.12, function () {
      this.logs(-0.45, -0.25, PI / 2); this.logs(-0.45, 0.15, PI / 2);
      var cart = new T3.Group(); cart.position.set(0.45, 0, 0.0); cart.rotation.y = 0.3; this.g.add(cart);
      this.add(new T3.BoxGeometry(0.55, 0.22, 0.38), M("plankWarm", 0.6, 0.3), 0, 0.22, 0, { parent: cart });
      [[-0.18, 0.21], [0.18, 0.21], [-0.18, -0.21], [0.18, -0.21]].forEach(function (w) { this.add(new T3.CylinderGeometry(0.1, 0.1, 0.03, 12), C("#3a3530", { metalness: 0.4 }), w[0], 0.1, w[1], { parent: cart, rx: PI / 2 }); }, this);
      var gm = C("#f2c040", { metalness: 0.85, roughness: 0.3, flatShading: true });
      for (var i = 0; i < 8; i++) this.add(new T3.DodecahedronGeometry(0.055, 0), gm, (this.rand() - 0.5) * 0.4, 0.36 + this.rand() * 0.05, (this.rand() - 0.5) * 0.24, { parent: cart });
    });
    var AX = 0.85, AZ = 0.85;
    b.cyl(0.13, 0.16, 0.22, 8, M("plankDark", 0.4, 0.3), AX, 0, AZ);
    b.box(0.32, 0.1, 0.14, M("iron"), AX, 0.22, AZ, { ry: PI / 4 });
    b.add(new T3.ConeGeometry(0.06, 0.16, 4), M("iron"), AX + 0.15, 0.27, AZ - 0.15, { rz: PI / 2, ry: -PI / 4 });
    b.box(0.5, 0.38, 0.45, M("stoneWarm", 0.5, 0.4), -0.85, 0, 0.75);
    b.cyl(0.17, 0.17, 0.02, 10, E("#ff7a2a", "#ff5a10", 1.8), -0.85, 0.38, 0.75, { noCast: true });
    b.fire(-0.85, 0.39, 0.75, 0.4, 0.9);
    b.barrel(1.15, -0.2); b.pine(1.15, -1.2, 0.8); b.rock(-1.3, 1.25, 0.11);
  }
  function fireBarracks(b) {
    b.slab(4.2, "grassFire", "sideFire");
    b.decal("path", 0.3, 1.25, 2.6, 1.6);
    var HX = -0.4, HZ = -0.55;
    b.box(2.75, 0.28, 1.7, M("stoneWarm", 2.5, 0.25), HX, 0, HZ);
    halfTimberHouse(b, HX, HZ, 2.6, 1.5, 1.0, 0.28);
    b.gable({ len: 2.6, wid: 1.5, rise: 0.85, over: 0.26, mat: M("shinglesRed", 3, 1.3), gmat: M("halfTimber", 1.4, 0.8), x: HX, y: 1.28, z: HZ, ridge: C("#5a1e14") });
    var fz = HZ + 0.75;
    b.door(HX, 0.28, fz + 0.01, 0, 0.55, 0.74);
    b.window(HX - 0.85, 0.85, fz + 0.03, 0, 0.26, 0.28, FGL, FGW);
    b.window(HX + 0.85, 0.85, fz + 0.03, 0, 0.26, 0.28, FGL, FGW);
    var FX = HX + 1.75, FZ = HZ - 0.05;
    b.box(0.85, 0.85, 1.0, M("stoneWarm", 1, 1), FX, 0, FZ);
    b.gable({ len: 0.85, wid: 1.0, rise: 0.35, over: 0.1, mat: M("shinglesRed", 1, 0.6), gmat: M("stoneWarm", 0.8, 0.3), x: FX, y: 0.85, z: FZ, ridge: C("#5a1e14") });
    b.box(0.34, 2.2, 0.34, M("stoneWarm", 0.4, 2.2), FX + 0.15, 0, FZ - 0.2);
    b.cyl(0.13, 0.13, 0.02, 10, E("#ffb070", "#ff6a1a", 2), FX + 0.15, 2.2, FZ - 0.2, { noCast: true });
    b.smoke(FX + 0.15, 2.3, FZ - 0.2, 6);
    b.box(0.42, 0.42, 0.04, C("#1a0d07"), FX + 0.1, 0.12, FZ + 0.5);
    var fg = new T3.MeshBasicMaterial({ color: lin("#ff7a2a"), transparent: true, opacity: 0.75 });
    b.add(new T3.PlaneGeometry(0.34, 0.34), fg, FX + 0.1, 0.33, FZ + 0.525, { noCast: true });
    var FL = new T3.PointLight("#ff7a2a", 0.9, 2.5, 2); FL.position.set(FX + 0.1, 0.4, FZ + 0.8); b.g.add(FL);
    b.fx.push(function (t) { fg.opacity = 0.6 + Math.sin(t * 6) * 0.15; FL.intensity = 0.8 + Math.sin(t * 9) * 0.15; });
    b.banner(HX - 0.6, fz + 0.4, 0, "bannerFire", 1.5); b.banner(HX + 0.6, fz + 0.4, 0, "bannerFire", 1.5);
    b.dummy(1.0, 1.4, 0.2); b.dummy(1.6, 1.0, -0.3);
    b.rack(-1.5, 1.4, 0.25, "spear");
    b.cyl(0.18, 0.22, 0.2, 8, M("stoneWarm", 0.5, 0.2), 0.3, 0, 1.75); b.cyl(0.24, 0.14, 0.15, 12, M("iron"), 0.3, 0.2, 1.75);
    b.fire(0.3, 0.36, 1.75, 0.55, 1.0);
    b.logs(-1.85, 0.6, 0.2); b.pine(-1.8, -1.85, 0.9); b.bush(1.85, -1.8, 0.16, "#5a7a30");
  }
  function fireTower(b) {
    b.slab(3.2, "grassFire", "sideFire");
    var sw = M("stoneWarm", 1.2, 2.6);
    b.box(1.35, 0.25, 1.35, M("stoneWarm", 1.3, 0.25), 0, 0, 0);
    b.box(1.1, 2.4, 1.1, sw, 0, 0.25, 0);
    b.box(1.3, 0.15, 1.3, M("stoneWarm", 1.3, 0.2), 0, 2.65, 0);
    var cm = M("stoneWarm", 0.3, 0.3);
    [-0.5, -0.17, 0.17, 0.5].forEach(function (p) {
      b.box(0.2, 0.24, 0.12, cm, p, 2.8, 0.59); b.box(0.2, 0.24, 0.12, cm, p, 2.8, -0.59);
      b.box(0.12, 0.24, 0.2, cm, 0.59, 2.8, p); b.box(0.12, 0.24, 0.2, cm, -0.59, 2.8, p);
    });
    b.cyl(0.08, 0.1, 0.3, 8, M("iron"), 0, 2.8, 0);
    b.cyl(0.24, 0.12, 0.16, 12, M("iron"), 0, 3.1, 0);
    b.cyl(0.21, 0.21, 0.02, 12, E("#ff7a2a", "#ff5a10", 2), 0, 3.25, 0, { noCast: true });
    b.fire(0, 3.26, 0, 0.75, 1.4);
    var slit = E("#ffc070", "#ff8a2a", 1.4);
    [1.1, 1.9].forEach(function (y) { b.box(0.07, 0.3, 0.03, slit, 0.2, y, 0.56, { noCast: true }); b.box(0.03, 0.3, 0.07, slit, 0.56, y, -0.2, { noCast: true }); });
    b.door(-0.15, 0.25, 0.56, 0, 0.36, 0.58);
    b.pennant(0.55, 3.0, 0.55, "#c0281c", 0.55);
    b.logs(-1.1, 0.8, 0.3); b.barrel(1.0, 0.95); b.pine(-1.15, -1.15, 0.85); b.rock(1.2, -1.0, 0.12);
    for (var i = 0; i < 8; i++) b.tuft(-1.5 + b.rand() * 3, 1.0 + b.rand() * 0.5, "#7a8a38");
  }

  /* ================= SLYTHERIN (EARTH) ================= */
  var stoneLight = function () { return C("#b4b8b6", { flatShading: true }); };
  var glowCap = function () { return new T3.MeshStandardMaterial({ color: lin("#7ff0d0"), emissive: lin("#2fe0b0"), emissiveIntensity: 0.9 }); };
  function greenDoor(b, parent, w, h, z) {
    var sh = new T3.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(-w / 2, h); sh.absarc(0, h, w / 2, PI, 0, true); sh.lineTo(w / 2, 0); sh.closePath();
    var m = new T3.MeshStandardMaterial({ color: lin("#123a22"), emissive: lin("#2dff7a"), emissiveIntensity: 0.6, roughness: 0.6 });
    b.add(new T3.ShapeGeometry(sh), m, 0, 0, z, { parent: parent, noCast: true });
    var ph = b.rand() * 6;
    b.fx.push(function (t) { m.emissiveIntensity = 0.5 + Math.sin(t * 1.6 + ph) * 0.2; });
    return m;
  }
  function earthHouse(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var MX = -0.15, MZ = -0.15;
    b.mound(MX, MZ, 1.05, 0.8, 1.05, "grassEarth", 2);
    var door = new T3.Group(); door.position.set(MX + 0.66, 0, MZ + 0.66); door.rotation.y = PI / 4; b.g.add(door);
    var sl = stoneLight();
    b.add(new T3.BoxGeometry(0.62, 0.62, 0.36), M("stoneGrey", 0.6, 0.6), 0, 0.31, 0, { parent: door });
    b.add(new T3.TorusGeometry(0.2, 0.05, 8, 20), sl, 0, 0.3, 0.19, { parent: door });
    var dm = new T3.MeshStandardMaterial({ color: lin("#123a22"), emissive: lin("#2dff7a"), emissiveIntensity: 0.6 });
    b.add(new T3.CircleGeometry(0.19, 20), dm, 0, 0.3, 0.185, { parent: door, noCast: true });
    b.fx.push(function (t) { dm.emissiveIntensity = 0.5 + Math.sin(t * 1.6) * 0.2; });
    b.add(new T3.BoxGeometry(0.72, 0.1, 0.46), M("grassEarth", 0.5, 0.5), 0, 0.65, -0.02, { parent: door });
    b.add(new T3.CylinderGeometry(0.12, 0.15, 0.5, 7), M("stoneGrey", 0.5, 0.5), MX - 0.35, 0.8, MZ - 0.45);
    b.smoke(MX - 0.35, 1.1, MZ - 0.45, 5);
    b.cyl(0.025, 0.04, 0.35, 6, M("barkTree", 0.3, 0.5), MX + 0.15, 0.7, MZ - 0.1);
    b.add(new T3.IcosahedronGeometry(0.17, 0), C("#3f8a4c", { flatShading: true }), MX + 0.15, 1.12, MZ - 0.1);
    b.add(new T3.IcosahedronGeometry(0.12, 0), C("#4a9654", { flatShading: true }), MX + 0.27, 1.05, MZ - 0.02);
    var winM = E("#a6ffc4", "#3cff8a", 0.9);
    [0.2, 1.35].forEach(function (az) { var r = 1.0, x = MX + Math.cos(az) * r, z = MZ + Math.sin(az) * r; var g = b.add(new T3.CircleGeometry(0.09, 14), winM, x, 0.3, z, { noCast: true }); g.lookAt(x + Math.cos(az), 0.45, z + Math.sin(az)); var ring = b.add(new T3.TorusGeometry(0.1, 0.03, 6, 14), stoneLight(), x, 0.3, z); ring.lookAt(x + Math.cos(az), 0.45, z + Math.sin(az)); });
    [1.05, 1.3].forEach(function (r, i) { b.add(new T3.CylinderGeometry(0.13, 0.15, 0.04, 7), C("#8f9694", { flatShading: true }), MX + 0.707 * (r + 0.1) + (i ? 0.06 : -0.06), 0.02, MZ + 0.707 * (r + 0.1) - (i ? 0.06 : -0.06), { ry: i }); });
    b.mushrooms([[-1.2, 0.9], [-1.05, 1.05], [1.0, -1.15], [1.15, -1.0]], glowCap());
    b.pine(-1.15, -1.2, 0.75); b.rock(1.25, 0.6, 0.1, "#8f9694"); b.bush(-1.25, 0.2, 0.14, "#2f6a2e");
  }
  function earthFarm(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var soil = M("soil", 1.2, 1), logM = [M("bark", 1, 1), M("logEnd"), M("logEnd")];
    [[-0.95, -0.95], [0.95, -0.95], [-0.95, 0.95], [0.95, 0.95]].forEach(function (p, i) {
      b.box(1.5, 0.16, 1.5, soil, p[0], 0, p[1]);
      [-1, 1].forEach(function (s) {
        b.add(new T3.CylinderGeometry(0.06, 0.06, 1.6, 8), logM, p[0], 0.08, p[1] + s * 0.78, { rz: PI / 2 });
        b.add(new T3.CylinderGeometry(0.06, 0.06, 1.6, 8), logM, p[0] + s * 0.78, 0.1, p[1], { rx: PI / 2 });
      });
      if (i === 1) { b.pumpkin(p[0] - 0.35, p[1] - 0.3, 0.14, 0.16); b.pumpkin(p[0] + 0.3, p[1] + 0.25, 0.16, 0.16); b.pumpkin(p[0] - 0.25, p[1] + 0.35, 0.12, 0.16); b.pumpkin(p[0] + 0.35, p[1] - 0.35, 0.11, 0.16); }
      else b.cabbages(p[0] - 0.6, p[1] - 0.6, p[0] + 0.6, p[1] + 0.6, 3, 3, i === 2 ? "#5f9e4a" : "#4a8a5a", 0.16);
    });
    var rune = E("#9effc0", "#3cff8a", 1.3);
    b.add(new T3.CylinderGeometry(0.13, 0.22, 1.0, 4, 1), C("#a3a9ab", { flatShading: true }), -1.9, 0.5, -1.9, { ry: PI / 4 });
    b.box(0.04, 0.45, 0.02, rune, -1.77, 0.25, -1.77, { ry: PI / 4, noCast: true });
    b.fx.push(function (t) { rune.emissiveIntensity = 1.1 + Math.sin(t * 1.4) * 0.4; });
    var wick = M("wicker", 4, 0.5);
    b.box(0.06, 0.4, 3.8, wick, 1.95, 0, -0.05); b.box(3.0, 0.4, 0.06, wick, 0.45, 0, -1.95);
    b.mushrooms([[0, 0], [0.12, 0.1], [-0.1, 0.12], [-1.95, 1.4], [-1.8, 1.55], [1.5, 1.95]], glowCap());
    b.basket(-1.9, 1.9, "#e0761e"); b.basket(-1.65, 1.98, "#5f9e4a");
    b.scarecrow(0.0, 1.95, "#1f6b45");
    for (var i = 0; i < 10; i++) b.tuft(-2 + b.rand() * 4, 1.8 + b.rand() * 0.3, "#3f7a32");
  }
  function earthStore(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var MX = -0.25, MZ = -0.3;
    var surf = b.mound(MX, MZ, 1.2, 0.95, 1.2, "grassEarth", 2.5);
    var door = new T3.Group(); door.position.set(MX + 0.72, 0, MZ + 0.72); door.rotation.y = PI / 4; b.g.add(door);
    var sl = stoneLight();
    b.add(new T3.BoxGeometry(0.9, 0.8, 0.5), M("stoneGrey", 0.9, 0.8), 0, 0.4, 0, { parent: door });
    b.add(new T3.BoxGeometry(0.16, 0.66, 0.16), sl, -0.32, 0.33, 0.27, { parent: door });
    b.add(new T3.BoxGeometry(0.16, 0.66, 0.16), sl, 0.32, 0.33, 0.27, { parent: door });
    b.add(new T3.BoxGeometry(0.85, 0.16, 0.2), sl, 0, 0.72, 0.27, { parent: door });
    var dm = new T3.MeshStandardMaterial({ color: lin("#0d1a10"), emissive: lin("#1f8a4a"), emissiveIntensity: 0.4 });
    b.add(new T3.PlaneGeometry(0.48, 0.64), dm, 0, 0.32, 0.256, { parent: door, noCast: true });
    b.add(new T3.BoxGeometry(1.0, 0.1, 0.6), M("grassEarth", 0.6, 0.4), 0, 0.85, -0.03, { parent: door });
    var rootM = M("barkTree", 1, 3);
    [[-0.75, 0.4], [-0.55, 0.55], [-0.95, 0.3]].forEach(function (q, i) {
      var pts = [new T3.Vector3(q[0], 0, 0.15), new T3.Vector3(q[0] * 0.7, 0.9 + q[1] * 0.4, 0.2), new T3.Vector3(0, 1.15 + i * 0.05, 0.3), new T3.Vector3(-q[0] * 0.7, 0.9 + q[1] * 0.4, 0.2), new T3.Vector3(-q[0], 0, 0.15)];
      b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 30, 0.06 - i * 0.008, 6, false), rootM, 0, 0, 0, { parent: door });
    });
    b.cyl(0.035, 0.05, 0.45, 6, M("barkTree", 0.3, 0.5), MX - 0.2, 0.85, MZ - 0.25);
    b.add(new T3.IcosahedronGeometry(0.22, 0), C("#3f8a4c", { flatShading: true }), MX - 0.2, 1.38, MZ - 0.25);
    b.basket(0.85, -0.6, "#e0761e"); b.basket(1.1, -0.4, "#5f9e4a"); b.basket(1.15, -0.75);
    b.logs(-1.2, 0.85, 0.5); b.gold(0.25, 1.15); b.sack(0.5, 1.2, 0, "#9a8a5a");
    b.mushrooms([[-1.25, -1.1], [-1.1, -1.25], [1.2, 0.3]], glowCap());
    b.pine(1.15, -1.25, 0.7);
  }
  function earthBarracks(b) {
    b.slab(4.2, "grassEarth", "sideEarth");
    var MX = -0.35, MZ = -0.55;
    b.mound(MX, MZ, 1.55, 1.0, 1.0, "grassEarth", 3);
    var FZ = MZ + 0.82;
    b.box(1.5, 0.82, 0.32, M("stoneGrey", 1.5, 0.8), MX, 0, FZ);
    b.box(1.6, 0.12, 0.42, M("grassEarth", 1, 0.4), MX, 0.82, FZ - 0.03);
    var face = new T3.Group(); face.position.set(MX, 0, FZ + 0.16); b.g.add(face);
    b.add(new T3.BoxGeometry(0.13, 0.62, 0.14), stoneLight(), -0.32, 0.31, 0.04, { parent: face });
    b.add(new T3.BoxGeometry(0.13, 0.62, 0.14), stoneLight(), 0.32, 0.31, 0.04, { parent: face });
    b.add(new T3.TorusGeometry(0.32, 0.065, 6, 14, PI), stoneLight(), 0, 0.62, 0.04, { parent: face });
    greenDoor(b, face, 0.5, 0.6, 0.012);
    var winM = E("#a6ffc4", "#3cff8a", 0.9);
    [-0.6, 0.6].forEach(function (x) { b.add(new T3.CircleGeometry(0.09, 14), winM, x, 0.5, 0.012, { parent: face, noCast: true }); b.add(new T3.TorusGeometry(0.1, 0.03, 6, 14), stoneLight(), x, 0.5, 0.012, { parent: face }); });
    var thorn = C("#3a4a22", { flatShading: true }), thorn2 = C("#5a3d24", { flatShading: true });
    for (var i = 0; i < 26; i++) {
      var a = -0.25 + i / 25 * 1.95, r = 2.45;
      var x = MX + Math.cos(a) * r, z = MZ + Math.sin(a) * r;
      if (Math.abs(a - 0.85) < 0.18) continue;
      var h = 0.4 + b.rand() * 0.25;
      b.add(new T3.ConeGeometry(0.07, h, 4), i % 2 ? thorn : thorn2, x, h / 2, z, { rz: Math.cos(a) * 0.35, rx: -Math.sin(a) * 0.35 });
    }
    b.banner(MX - 0.95, FZ + 0.5, 0, "bannerEarth", 1.5); b.banner(MX + 0.95, FZ + 0.5, 0, "bannerEarth", 1.5);
    b.add(new T3.CylinderGeometry(0.12, 0.2, 0.75, 4, 1), C("#a3a9ab", { flatShading: true }), 1.1, 0.375, 0.9, { ry: PI / 4 });
    b.dummy(0.55, 1.35, 0.2);
    b.cyl(0.04, 0.05, 0.5, 6, M("barkTree", 0.4, 0.5), MX + 0.5, 0.9, MZ - 0.3);
    b.add(new T3.IcosahedronGeometry(0.28, 0), C("#2f6f3c", { flatShading: true }), MX + 0.5, 1.5, MZ - 0.3);
    b.add(new T3.IcosahedronGeometry(0.2, 0), C("#3f8a4c", { flatShading: true }), MX + 0.72, 1.4, MZ - 0.15);
    b.mushrooms([[-1.9, 1.2], [-1.75, 1.35], [1.85, -0.6]], glowCap());
    b.pine(1.8, -1.85, 0.95); b.pine(-1.95, -1.9, 0.8); b.bush(-1.95, 1.9, 0.18, "#2f6a2e");
  }
  function earthTower(b) {
    b.slab(3.2, "grassEarth", "sideEarth");
    var pg = new T3.CylinderGeometry(0.4, 0.62, 2.7, 7, 4), pp = pg.attributes.position;
    for (var i = 0; i < pp.count; i++) { var x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i), k = 1 + (n3(x * 4, y * 2, z * 4) - 0.5) * 0.12; pp.setXYZ(i, x * k, y, z * k); }
    pg.computeVertexNormals();
    b.add(pg, C("#a7adb0", { flatShading: true, roughness: 0.8 }), 0, 1.35, 0);
    var rootM = M("barkTree", 1, 4);
    [0, PI].forEach(function (off, j) {
      var pts = [];
      for (var s = 0; s <= 14; s++) { var t = s / 14, a = off + t * PI * 2.2, r = 0.64 - t * 0.22 + 0.03; pts.push(new T3.Vector3(Math.cos(a) * r, t * 2.65, Math.sin(a) * r)); }
      b.add(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 80, 0.05 - j * 0.01, 6, false), rootM, 0, 0, 0);
    });
    var rune = new T3.MeshStandardMaterial({ color: lin("#9effc0"), emissive: lin("#3cff8a"), emissiveIntensity: 1.3 });
    b.add(new T3.TorusGeometry(0.5, 0.025, 6, 7), rune, 0, 1.55, 0, { rx: PI / 2, noCast: true });
    b.box(0.05, 0.5, 0.02, rune, 0.36, 0.7, 0.36, { ry: PI / 4, noCast: true });
    b.fx.push(function (t) { rune.emissiveIntensity = 1.1 + Math.sin(t * 1.4) * 0.4; });
    b.cyl(0.62, 0.5, 0.12, 9, M("stoneGrey", 2, 0.2), 0, 2.7, 0);
    b.cyl(0.05, 0.08, 0.5, 6, M("barkTree", 0.4, 0.5), -0.15, 2.82, -0.15);
    [[0, 3.45, 0, 0.42, "#2f6f3c"], [-0.32, 3.3, 0.18, 0.3, "#3b8048"], [0.3, 3.3, -0.2, 0.32, "#285f34"], [0.05, 3.7, 0.05, 0.28, "#4a9654"]].forEach(function (c, ci) {
      b.add(new T3.IcosahedronGeometry(c[3], 0), C(c[4], { flatShading: true }), c[0] - 0.15, c[1], c[2] - 0.15, { ry: ci });
    });
    var door = new T3.Group(); door.position.set(0.42, 0, 0.42); door.rotation.y = PI / 4; b.g.add(door);
    greenDoor(b, door, 0.36, 0.42, 0.06);
    b.add(new T3.TorusGeometry(0.22, 0.05, 6, 12, PI), stoneLight(), 0, 0.42, 0.06, { parent: door });
    b.mushrooms([[-1.1, 0.9], [-0.95, 1.05], [1.0, -1.05], [0.75, 0.95]], glowCap());
    b.pine(-1.15, -1.2, 0.8); b.rock(1.2, 0.3, 0.12, "#8f9694"); b.bush(-1.2, 0.2, 0.14, "#2f6a2e");
    [1.05, 1.35].forEach(function (r, i) { b.add(new T3.CylinderGeometry(0.13, 0.15, 0.04, 7), C("#8f9694", { flatShading: true }), 0.707 * r + (i ? 0.05 : -0.05), 0.02, 0.707 * r - (i ? 0.05 : -0.05), { ry: i }); });
  }

