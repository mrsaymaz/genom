
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
