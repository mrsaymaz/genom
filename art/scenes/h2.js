
  /* ================= HUFFLEPUFF: Dark = straw & timber, Mythic = honeycomb masonry, Arcane = airborne ================= */
  function AMBERG(op) { return new T3.MeshStandardMaterial({ color: lin("#ffcf6a"), emissive: lin("#ff9a10"), emissiveIntensity: 0.55, roughness: 0.12, metalness: 0.1, transparent: true, opacity: op || 0.85 }); }
  function cLamp(b, x, y, z, a, s) {
    s = s || 1;
    b.add(new T3.CircleGeometry(0.08 * s, 6), dGlow("#ffd27a", "#ffa420", 1.0), x, y, z, { ry: a, noCast: true });
    b.add(new T3.RingGeometry(0.08 * s, 0.115 * s, 6), C(BY.black), x, y, z, { ry: a, noCast: true });
  }
  function hexFace(rot, k) { var a = PI / 6 + rot + k * PI / 3; return [Math.sin(a), Math.cos(a), a]; }
  function nb(x, z, r1, r2, k, rot) { var f = hexFace(rot == null ? PI / 6 : rot, k), d = (r1 + r2) * 0.866; return [x + f[0] * d, z + f[1] * d]; }
  function hexCell(b, x, z, r, h, y0, o) {
    o = o || {};
    var rot = o.rot == null ? PI / 6 : o.rot, dark = C(BY.black);
    var side = o.side || M("honeycomb", Math.max(1, r * 3), Math.max(0.6, h * 1.4)), top = M("honeycomb", r * 1.5, r * 1.5);
    b.add(new T3.CylinderGeometry(r, r, h, 6), [side, top, top], x, y0 + h / 2, z, { ry: rot });
    b.add(new T3.CylinderGeometry(r + 0.015, r + 0.015, 0.045, 6, 1, true), dark, x, y0 + h - 0.02, z, { ry: rot });
    if (y0 > 0.05 || o.foot) b.add(new T3.CylinderGeometry(r + 0.015, r + 0.015, 0.045, 6, 1, true), dark, x, y0 + 0.02, z, { ry: rot });
    if (o.band != null) b.add(new T3.CylinderGeometry(r + 0.02, r + 0.02, 0.06, 6, 1, true), glowMat("#ffd060", "#c88a10", 0.5), x, y0 + h * o.band, z, { ry: rot });
    var ap = r * 0.866 + 0.012;
    (o.lamps || []).forEach(function (l) { var f = hexFace(rot, l[0]); cLamp(b, x + f[0] * ap, y0 + h * l[1], z + f[1] * ap, f[2], l[2] || 1); });
    if (o.door) { var f = hexFace(rot, o.door[0]); hiveDoor(b, x + f[0] * (ap - 0.01), y0, z + f[1] * (ap - 0.01), f[2], o.door[1], o.door[2], 0.5); }
    var Y = y0 + h;
    if (o.cap === "tent") {
      var th = o.capH || r * 0.7;
      b.add(new T3.ConeGeometry(r * 1.2, th, 6, 1, true), M("canvasBY", 2, 0.6, { side: T3.DoubleSide }), x, Y + th / 2, z, { ry: rot });
      b.add(new T3.CylinderGeometry(r * 1.2 + 0.01, r * 1.2 + 0.01, 0.04, 6, 1, true), dark, x, Y, z, { ry: rot });
      b.add(new T3.ConeGeometry(0.05, 0.16, 6), dark, x, Y + th + 0.06, z);
      return Y + th;
    }
    if (o.cap === "skep") {
      var R = o.capR || r * 0.62, H = R * 1.5; dSkep(b, x, Y - 0.02, z, R, H);
      if (o.rose) { b.cyl(0.015, 0.015, 0.28, 5, dark, x, Y + H - 0.05, z); windRose(b, x + 0.02, Y + H + 0.25, z + 0.02, o.rose); }
      return Y + H;
    }
    return Y;
  }
  function plankDisc(b, x, y, z, r, h) { var w = M("plankWarm", r * 1.5, r * 1.5); b.add(new T3.CylinderGeometry(r, r, h || 0.06, 6), [M("plankDark", 3, 0.2), w, w], x, y, z, { ry: PI / 6 }); }
  function gallery(b, x, y, z, r) {
    plankDisc(b, x, y, z, r, 0.06);
    var post = M("plankDark", 0.2, 0.4);
    for (var k = 0; k < 6; k++) { var p = dRing(r - 0.02, k * PI / 3); b.cyl(0.018, 0.018, 0.2, 5, post, x + p[0], y, z + p[1]); }
    b.add(new T3.CylinderGeometry(r + 0.005, r + 0.005, 0.03, 6, 1, true), C(BY.black), x, y + 0.2, z, { ry: PI / 6 });
  }
  function glider(b, parent) {
    var g = new T3.Group(); parent.add(g);
    var sh = new T3.Shape(); sh.moveTo(0, 0.34); sh.lineTo(0.52, -0.16); sh.lineTo(0, -0.05); sh.lineTo(-0.52, -0.16); sh.closePath();
    b.add(new T3.ShapeGeometry(sh), M("canvasBY", 0.8, 0.5, { side: T3.DoubleSide }), 0, 0, 0, { parent: g, rx: PI / 2 });
    b.add(new T3.BoxGeometry(0.03, 0.03, 0.5), C(BY.black), 0, -0.01, 0.06, { parent: g });
    b.add(new T3.BoxGeometry(0.07, 0.15, 0.07), C("#6a4a2a"), 0, -0.13, 0.04, { parent: g });
    b.add(new T3.SphereGeometry(0.045, 8, 6), C("#e8c39a"), 0, -0.02, 0.06, { parent: g });
    return g;
  }

  /* ---------------- Hufflepuff MYTHIC: honeycomb masonry ---------------- */
  function mhHouse(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.5, 1.2, 0.9, 1.1, -0.3);
    var X = -0.35, Z = -0.35;
    hexStep(b, 1.35, 0.12, 0, -0.15, -0.15);
    hexCell(b, X, Z, 0.52, 1.75, 0.12, { cap: "skep", capR: 0.36, rose: 0.75, band: 0.62, lamps: [[5, 0.85], [0, 0.85], [1, 0.85]] });
    var pB = nb(X, Z, 0.52, 0.42, 0), pC = nb(X, Z, 0.52, 0.34, 5);
    hexCell(b, pB[0], pB[1], 0.42, 1.0, 0.12, { cap: "tent", door: [0, 0.3, 0.3], lamps: [[5, 0.62, 0.8], [1, 0.62, 0.8]] });
    hexCell(b, pC[0], pC[1], 0.34, 0.7, 0.12, { cap: "tent", lamps: [[5, 0.55, 0.75], [0, 0.55, 0.75]] });
    gallery(b, X, 1.38, Z, 0.72);
    b.add(new T3.BoxGeometry(0.5, 0.035, 0.26), M("canvasBY", 0.6, 0.4), pB[0] + 0.42 * 0.95, 0.62, pB[1] + 0.42 * 0.55, { ry: PI / 3, rx: 0.45 });
    honeyJars(b, [[-1.15, 0.95], [-0.95, 1.12]]);
    b.hay(1.05, -1.0, 0.5); amberFloat(b, 0.95, 1.6, -0.9, 0.6);
    for (var i = 0; i < 6; i++) b.tuft(-1.5 + b.rand() * 3, 1.1 + b.rand() * 0.4, "#5a9238");
  }
  function mhStore(b) {
    b.slab(3.2, "grassAir", "sideAir"); b.decal("path", 0.55, 1.2, 1.0, 0.9, -0.3);
    var X = -0.3, Z = -0.3, rc = 0.46, rs = 0.33;
    hexStep(b, 1.4, 0.1, 0, X, Z);
    var Y = hexCell(b, X, Z, rc, 1.45, 0.1, { band: 0.55, lamps: [[5, 0.82, 0.85], [0, 0.82, 0.85]] });
    for (var k = 0; k < 6; k++) {
      var p = nb(X, Z, rc, rs, k), vis = (k === 5 || k === 0 || k === 1);
      hexCell(b, p[0], p[1], rs, 0.62, 0.1, { door: vis ? [k, 0.3, 0.28] : null });
      (function (px, pz, kk) { b.lift(0.72, function () { if (kk % 2) this.crate(px - 0.06, pz, 0.24, kk); else { this.sack(px, pz, 0, "#c9a86a"); this.sack(px + 0.12, pz - 0.08, 0, "#d8b878"); } }); })(p[0], p[1], k);
    }
    var post = M("plankDark", 0.3, 1);
    gallery(b, X, Y + 0.03, Z, 0.5);
    b.cyl(0.045, 0.06, 1.05, 8, post, X, Y, Z);
    b.beam([X, Y + 0.95, Z], [X + 0.95, Y + 1.1, Z + 0.95], 0.03, post);
    b.beam([X, Y + 0.95, Z], [X - 0.35, Y + 0.9, Z - 0.35], 0.03, post);
    b.cyl(0.1, 0.1, 0.18, 6, C(BY.black), X - 0.35, Y + 0.72, Z - 0.35);
    var pv = new T3.Group(); pv.position.set(X + 0.95, Y + 1.1, Z + 0.95); b.g.add(pv);
    b.add(new T3.CylinderGeometry(0.006, 0.006, 0.85, 4), C("#d8cba6"), 0, -0.42, 0, { parent: pv });
    var netM = new T3.MeshStandardMaterial({ map: tex("net", 1, 1), transparent: true, alphaTest: 0.4, side: T3.DoubleSide, roughness: 1 });
    b.add(new T3.SphereGeometry(0.17, 10, 8), netM, 0, -0.95, 0, { parent: pv, s: [1, 1.2, 1] });
    b.add(new T3.SphereGeometry(0.13, 8, 6), C("#c9a86a"), 0, -0.97, 0, { parent: pv });
    b.fx.push(function (t) { pv.rotation.z = Math.sin(t * 1.2) * 0.08; });
    windRose(b, X + 0.02, Y + 1.25, Z + 0.02, 0.6);
    b.gold(1.05, 0.95); honeyJars(b, [[1.2, -0.95], [1.0, -1.15]]);
  }
  function mhBarracks(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.4, 1.35, 2.8, 1.4);
    var HX = -0.3, HZ = -0.8, dark = C(BY.black), post = M("plankDark", 0.3, 1);
    b.box(3.7, 0.12, 1.75, M("honeycomb", 3.7, 1.75), HX, 0, HZ); b.box(3.72, 0.03, 1.77, dark, HX, 0.08, HZ);
    var rc = 0.72, rs = 0.56, off = (rc + rs) * 0.866;
    hexCell(b, HX, HZ, rc, 1.75, 0.12, { rot: 0, cap: "tent", capH: 0.62, band: 0.62, door: [0, 0.46, 0.42], lamps: [[5, 0.82], [0, 0.82], [1, 0.82]] });
    [-1, 1].forEach(function (s) { hexCell(b, HX + s * off, HZ, rs, 1.15, 0.12, { rot: 0, cap: "tent", capH: 0.45, lamps: [[5, 0.6, 0.85], [0, 0.6, 0.85], [s > 0 ? 1 : 4, 0.6, 0.85]] }); });
    var GZ = HZ + 0.78, GY = 1.02;
    b.box(3.2, 0.06, 0.32, M("plankWarm", 3, 0.3), HX, GY, GZ);
    for (var i = 0; i <= 6; i++) { var x = HX - 1.55 + i * (3.1 / 6); if (Math.abs(x - HX) < 0.3) continue; b.cyl(0.03, 0.035, GY, 6, post, x, 0, GZ + 0.13); b.cyl(0.015, 0.015, 0.22, 5, post, x, GY + 0.06, GZ + 0.15); }
    b.box(3.2, 0.03, 0.03, dark, HX, GY + 0.27, GZ + 0.15);
    [-1, 1].forEach(function (s) { b.banner(HX + s * 0.55, GZ + 0.35, 0, "bannerAir", 1.0); });
    b.cyl(0.04, 0.055, 2.6, 8, post, 1.85, 0, -1.75); bySail(b, 1.85, 2.5, -1.75, PI / 4, 1.3); dPennant(b, 1.85, 2.6, -1.75, BY.yellow);
    b.target(1.3, 1.45, 0.5); b.target(1.8, 0.9, 0.7); b.dummy(-1.5, 1.45, 0.3); b.dummy(-1.0, 1.75, -0.2);
    b.rack(-1.95, 0.75, 0.2, "spear"); honeyJars(b, [[0.6, 1.85], [0.78, 1.95]]);
  }
  function mhTower(b) {
    b.slab(3.2, "grassAir", "sideAir");
    hexStep(b, 0.92, 0.14, 0);
    var y = hexCell(b, 0, 0, 0.6, 1.15, 0.14, { band: 0.55, door: [0, 0.3, 0.32], lamps: [[5, 0.75, 0.8], [1, 0.75, 0.8]] });
    plankDisc(b, 0, y + 0.03, 0, 0.66, 0.06); y += 0.06;
    y = hexCell(b, 0, 0, 0.5, 0.85, y, { lamps: [[5, 0.55, 0.8], [0, 0.55, 0.8], [1, 0.55, 0.8]] });
    plankDisc(b, 0, y + 0.03, 0, 0.55, 0.06); y += 0.06;
    y = hexCell(b, 0, 0, 0.42, 0.55, y, { band: 0.5 });
    var NY = y, post = M("plankDark", 0.2, 1);
    plankDisc(b, 0, NY + 0.04, 0, 0.66, 0.08);
    b.add(new T3.CylinderGeometry(0.66, 0.66, 0.24, 6, 1, true), M("wattle", 3, 0.5, { side: T3.DoubleSide }), 0, NY + 0.2, 0, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.675, 0.675, 0.04, 6, 1, true), C(BY.black), 0, NY + 0.32, 0, { ry: PI / 6 });
    for (var k = 0; k < 3; k++) { var p = dRing(0.6, k * 2 * PI / 3 + PI / 3); b.cyl(0.025, 0.025, 0.55, 5, post, p[0], NY + 0.3, p[1]); }
    b.add(new T3.ConeGeometry(0.82, 0.48, 6, 1, true), M("canvasBY", 2, 0.6, { side: T3.DoubleSide }), 0, NY + 0.85 + 0.24, 0, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.83, 0.83, 0.04, 6, 1, true), C(BY.black), 0, NY + 0.85, 0, { ry: PI / 6 });
    b.add(new T3.CylinderGeometry(0.07, 0.08, 0.14, 6), dGlow("#ffd27a", "#ffa420", 1.4), 0, NY + 0.45, 0, { noCast: true });
    b.cyl(0.015, 0.015, 0.35, 5, C(BY.black), 0, NY + 1.3, 0); dPennant(b, 0, NY + 1.65, 0, BY.yellow);
    b.windsock(-1.15, 0.95, 1.2); b.hay(1.1, -1.0, 0.3);
  }
  function mhPen(b) {
    b.slab(4.2, "grassAir", "sideAir");
    var X = 0.05, Z = 0.05, R = 1.85, dark = C(BY.black), hc = M("honeycomb", 1.8, 0.45);
    b.add(new T3.CylinderGeometry(R, R, 0.06, 6), [M("honeycomb", 3, 0.1), M("path", 2, 2), M("path", 2, 2)], X, 0.03, Z, { ry: PI / 6 });
    for (var k = 0; k < 6; k++) {
      var v = dRing(R, k * PI / 3);
      b.add(new T3.CylinderGeometry(0.17, 0.17, 0.85, 6), [M("honeycomb", 0.6, 0.8), dark, dark], X + v[0], 0.425, Z + v[1], { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(0.1, 0.1, 0.12, 6), glowMat("#ffd27a", "#ffa420", 1.3), X + v[0], 0.91, Z + v[1], { ry: PI / 6, noCast: true });
      if (k === 0) continue;
      var bm = k * PI / 3 + PI / 6, m = dRing(R * 0.866, bm);
      b.add(new T3.BoxGeometry(R, 0.48, 0.14), hc, X + m[0], 0.24, Z + m[1], { ry: PI / 2 - bm });
      b.add(new T3.BoxGeometry(R + 0.02, 0.04, 0.16), dark, X + m[0], 0.49, Z + m[1], { ry: PI / 2 - bm });
    }
    var g0 = dRing(R, 0), g1 = dRing(R, PI / 3);
    b.banner(X + g0[0] - 0.1, Z + g0[1] + 0.12, 0, "bannerAir", 1.3); b.banner(X + g1[0] + 0.05, Z + g1[1] - 0.1, 0, "bannerAir", 1.3);
    var DX = -0.75, DZ = -0.75;
    hexCell(b, DX, DZ, 0.8, 1.15, 0.06, { cap: "skep", capR: 0.6, rose: 0.7, band: 0.6, door: [0, 0.6, 0.42], lamps: [[5, 0.75], [1, 0.75]] });
    b.bear(0.45, 0.5, 0.78, -0.6);
    b.box(0.5, 0.14, 0.2, M("plankWarm", 0.5, 0.2), 1.0, 0.06, -0.55, { ry: PI / 4 });
    b.box(0.42, 0.03, 0.14, glowMat("#f2a72e", "#c06a10", 0.6), 1.0, 0.2, -0.55, { ry: PI / 4, noCast: true });
    honeyJars(b, [[-0.2, 0.75], [-0.05, 0.9]]);
  }

  /* ---------------- Hufflepuff ARCANE: airborne ---------------- */
  function ahHouse(b) {
    b.slab(3.2, "grassAir", "sideAir");
    hexStep(b, 1.1, 0.1, 0, -0.15, -0.15);
    b.add(new T3.RingGeometry(0.6, 0.68, 6), glowMat("#fff0a0", "#ffb020", 0.9), -0.15, 0.105, -0.15, { rx: -PI / 2, rz: PI / 6, noCast: true });
    var I = hexIsland(b, -0.15, 1.95, -0.15, 1.0, 1.2, 23);
    var L = new T3.PointLight("#ffb030", 1.2, 4, 2); L.position.set(0, -1.3, 0); I.add(L);
    inGroup(b, I, function () {
      var X = -0.12, Z = -0.12, dark = C(BY.black);
      var y = hexCell(b, X, Z, 0.46, 0.9, 0, { band: 0.55, lamps: [[5, 0.6], [1, 0.6]] });
      b.add(new T3.CylinderGeometry(0.4, 0.44, 0.55, 6), AMBERG(), X, y + 0.275, Z, { ry: PI / 6, noCast: true });
      b.add(new T3.CylinderGeometry(0.33, 0.33, 0.45, 6), dGlow("#ffe7a0", "#ffb030", 1.1), X, y + 0.25, Z, { ry: PI / 6, noCast: true });
      for (var k = 0; k < 6; k++) { var p = dRing(0.42, k * PI / 3); b.cyl(0.018, 0.018, 0.55, 4, dark, X + p[0], y, Z + p[1]); }
      b.add(new T3.CylinderGeometry(0.46, 0.46, 0.05, 6), dark, X, y + 0.57, Z, { ry: PI / 6 });
      dSkep(b, X, y + 0.58, Z, 0.36, 0.52); b.cyl(0.015, 0.015, 0.25, 5, dark, X, y + 1.05, Z); windRose(b, X + 0.02, y + 1.3, Z + 0.02, 0.7);
      var pB = nb(X, Z, 0.46, 0.34, 0);
      hexCell(b, pB[0], pB[1], 0.34, 0.62, 0, { cap: "tent", door: [0, 0.26, 0.26], lamps: [[5, 0.6, 0.75]] });
      var pC = nb(X, Z, 0.46, 0.26, 5);
      hexCell(b, pC[0], pC[1], 0.26, 0.42, 0, { cap: "tent" });
      [[-0.7, 0.35], [0.35, -0.7]].forEach(function (q, i) { b.cyl(0.025, 0.035, 1.1, 6, M("plankDark", 0.2, 1), q[0], 0, q[1]); bySail(b, q[0], 1.05, q[1], PI / 4, 0.75); dPennant(b, q[0], 1.1, q[1], i ? BY.yellow : BY.black); });
      [[0.45, 0.6], [-0.55, 0.3], [0.2, -0.55]].forEach(function (q) { b.add(new T3.CylinderGeometry(0.004, 0.004, 0.4, 4), dark, q[0], -0.72, q[1], { noCast: true }); b.add(new T3.CylinderGeometry(0.06, 0.06, 0.12, 6), dGlow("#ffd27a", "#ffa420", 1.4), q[0], -0.98, q[1], { noCast: true }); });
    });
    b.cyl(0.04, 0.05, 0.45, 6, M("plankDark", 0.2, 0.5), 1.05, 0, 0.95);
    b.beam([1.05, 0.45, 0.95], [0.55, 1.65, 0.45], 0.008, C("#d8cba6"));
    honeyJars(b, [[-1.15, 1.0], [-0.95, 1.15]]); b.hay(1.15, -1.05, 0.5);
  }
  function ahFarm(b) {
    b.slab(4.2, "grassAir", "sideAir");
    b.box(3.5, 0.06, 3.5, M("soil", 3, 3), 0.1, 0, 0.1);
    b.wheat(-0.4, -0.4, 1.65, 1.65, 7, 7, ["#d9b84a", "#c8a83e", "#e6cc6a"]);
    b.wheat(-1.6, 0.4, -0.55, 1.65, 4, 4, ["#d9b84a", "#e6cc6a"]);
    b.wheat(0.4, -1.6, 1.65, -0.55, 4, 4, ["#d9b84a", "#e6cc6a"]);
    var hc = M("honeycomb", 3, 0.3);
    [[0.1, 1.9, 3.6, 0.14], [1.9, 0.1, 0.14, 3.6]].forEach(function (w) { b.box(w[2], 0.3, w[3], hc, w[0], 0, w[1]); b.box(w[2] + 0.02, 0.04, w[3] + 0.02, C(BY.black), w[0], 0.3, w[1]); });
    var PX = -1.05, PZ = -1.05;
    hexStep(b, 0.62, 0.14, 0, PX, PZ);
    var top = hexCell(b, PX, PZ, 0.3, 2.0, 0.14, { band: 0.35, lamps: [[5, 0.7, 0.7], [0, 0.7, 0.7]] });
    b.add(new T3.ConeGeometry(0.34, 0.3, 6), C(BY.black), PX, top + 0.15, PZ, { ry: PI / 6 });
    var cg = new T3.Group(); cg.position.set(PX, top + 0.85, PZ); b.g.add(cg);
    var cr = b.add(new T3.OctahedronGeometry(0.24, 0), glowMat("#ffd27a", "#ffa420", 1.8), 0, 0, 0, { parent: cg, noCast: true }); cr.scale.set(0.85, 1.7, 0.85);
    cg.add(new T3.PointLight("#ffb030", 1.6, 5, 2));
    b.fx.push(function (t) { cg.position.y = top + 0.85 + Math.sin(t * 1.2) * 0.06; cr.rotation.y = t * 0.8; });
    var beamM = new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.25, depthWrite: false });
    [[3 * PI / 4, 1.55, 1.25, 0.66, 31], [-PI / 4, 2.2, 1.25, 0.66, 32], [PI * 1.25, 3.25, 1.05, 0.58, 33]].forEach(function (q, i) {
      var p = onRing(q[2], q[0]), x = PX + p[0], z = PZ + p[1];
      var I = hexIsland(b, x, q[1], z, q[3], 0.62, q[4]);
      inGroup(b, I, function () {
        if (i < 2) { b.cabbages(-0.3, -0.3, 0.3, 0.3, 3, 3, i ? "#7fbf4a" : "#6fae4a", 0.0); dSkep(b, 0.3, 0, -0.3, 0.15, 0.28); }
        else { hexCell(b, 0, 0, 0.22, 0.35, 0, {}); windRose(b, 0.12, 0.6, 0.12, 1.3); b.cyl(0.02, 0.02, 0.3, 5, C(BY.black), 0, 0.35, 0); }
      });
      b.beam([PX, top + 0.85, PZ], [x, q[1] - 0.1, z], 0.02, beamM);
    });
    [[1.85, -1.85], [1.55, -1.85], [1.85, -1.55]].forEach(function (q) { b.cyl(0.03, 0.03, 0.3, 5, M("plankDark", 0.3, 0.3), q[0], 0, q[1]); b.box(0.3, 0.04, 0.3, M("plankWarm", 0.4, 0.4), q[0], 0.3, q[1]); dSkep(b, q[0], 0.34, q[1], 0.13, 0.28); });
    kite(b, 1.9, 0.6, 1.9, 4, 3.4);
  }
  function ahStore(b) {
    b.slab(3.2, "grassAir", "sideAir");
    var X = -0.2, Z = -0.2, dark = C(BY.black);
    hexStep(b, 1.32, 0.12, 0, X, Z); hexStep(b, 1.05, 0.1, 0.12, X, Z);
    b.add(new T3.RingGeometry(0.42, 0.5, 6), glowMat("#fff0a0", "#ffb020", 0.9), X, 0.225, Z, { rx: -PI / 2, rz: PI / 6, noCast: true });
    [PI / 2, PI / 2 + 2 * PI / 3, PI / 2 + 4 * PI / 3].forEach(function (a) { var p = dRing(0.92, a); honeyPylon(b, X + p[0], Z + p[1], 1.25, X, 1.55, Z); });
    var VY = 2.15, V = new T3.Group(); V.position.set(X, VY, Z); b.g.add(V);
    var lvl;
    inGroup(b, V, function () {
      var hc = M("honeycomb", 1, 1);
      b.add(new T3.CylinderGeometry(0.66, 0.5, 0.16, 6), [M("honeycomb", 2, 0.2), hc, hc], 0, -0.53, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(0.5, 0.66, 0.16, 6), [M("honeycomb", 2, 0.2), hc, hc], 0, 0.53, 0, { ry: PI / 6 });
      b.add(new T3.ConeGeometry(0.42, 0.35, 6), M("honeycomb", 1, 0.5), 0, -0.78, 0, { rx: PI, ry: PI / 6 });
      b.add(new T3.CylinderGeometry(0.55, 0.55, 0.9, 6), AMBERG(0.5), 0, 0, 0, { ry: PI / 6, noCast: true });
      lvl = b.add(new T3.CylinderGeometry(0.47, 0.47, 0.8, 6), dGlow("#ffc040", "#ff9010", 1.0), 0, -0.45, 0, { ry: PI / 6, noCast: true });
      lvl.geometry.translate(0, 0.4, 0);
      for (var k = 0; k < 6; k++) { var p = dRing(0.55, k * PI / 3); b.cyl(0.022, 0.022, 0.9, 4, dark, p[0], -0.45, p[1]); }
      b.add(new T3.ConeGeometry(0.78, 0.46, 6, 1, true), M("canvasBY", 2, 0.6, { side: T3.DoubleSide }), 0, 0.61 + 0.23, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(0.79, 0.79, 0.04, 6, 1, true), dark, 0, 0.61, 0, { ry: PI / 6 });
      b.cyl(0.015, 0.015, 0.3, 5, dark, 0, 1.05, 0); windRose(b, 0.02, 1.35, 0.02, 0.7);
    });
    b.fx.push(function (t) { V.position.y = VY + Math.sin(t * 0.9) * 0.05; V.rotation.y = t * 0.25; lvl.scale.y = 0.7 + Math.sin(t * 0.6) * 0.2; });
    var LX = X + 0.78, LZ = Z + 0.55;
    b.add(new T3.CylinderGeometry(0.035, 0.035, 1.4, 6), new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.3, depthWrite: false }), LX, 0.92, LZ, { noCast: true });
    var lift = new T3.Group(); b.g.add(lift);
    b.add(new T3.CylinderGeometry(0.2, 0.2, 0.05, 6), [M("honeycomb", 0.6, 0.1), M("honeycomb", 0.4, 0.4), M("honeycomb", 0.4, 0.4)], 0, 0, 0, { parent: lift, ry: PI / 6 });
    b.add(new T3.BoxGeometry(0.16, 0.16, 0.16), M("plankWarm", 0.3, 0.3), 0, 0.1, 0, { parent: lift });
    b.fx.push(function (t) { lift.position.set(LX, 0.25 + (1 - Math.cos(t * 0.7)) * 0.6, LZ); });
    b.lift(0.22, function () { this.crate(X - 0.55, Z + 0.45, 0.24, 0.3); this.sack(X + 0.2, Z - 0.7, 0, "#c9a86a"); this.gold(X - 0.7, Z - 0.3); });
    honeyJars(b, [[1.2, 1.0], [1.05, 1.18], [1.25, 1.2]]);
  }
  function ahBarracks(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.6, 1.4, 2.4, 1.2);
    var IX = -0.45, IZ = -0.65;
    hexStep(b, 0.95, 0.1, 0, IX, IZ);
    b.add(new T3.RingGeometry(0.55, 0.63, 6), glowMat("#fff0a0", "#ffb020", 0.9), IX, 0.105, IZ, { rx: -PI / 2, rz: PI / 6, noCast: true });
    honeyPylon(b, -1.85, 0.6, 1.1, IX - 0.6, 1.0, IZ + 0.4); honeyPylon(b, 0.9, -1.85, 1.1, IX + 0.6, 1.0, IZ - 0.4);
    var I = hexIsland(b, IX, 2.0, IZ, 1.4, 1.3, 43);
    var L = new T3.PointLight("#ffb030", 1.3, 4.5, 2); L.position.set(0, -1.4, 0); I.add(L);
    inGroup(b, I, function () {
      var rc = 0.5, rs = 0.4, off = (rc + rs) * 0.866;
      hexCell(b, 0, -0.15, rc, 1.05, 0, { rot: 0, cap: "tent", capH: 0.45, band: 0.6, door: [0, 0.34, 0.3], lamps: [[5, 0.8, 0.8], [1, 0.8, 0.8]] });
      [-1, 1].forEach(function (s) { hexCell(b, s * off, -0.15, rs, 0.72, 0, { rot: 0, cap: "tent", capH: 0.35, lamps: [[0, 0.55, 0.7], [5, 0.55, 0.7]] }); });
      [[-0.55, 0.75, 0.25], [0.55, 0.75, -0.25]].forEach(function (q) { var g = glider(b, b.g); g.position.set(q[0], 0.2, q[1]); g.rotation.set(-0.12, q[2] + PI / 4, 0); });
      b.target(0.95, 0.35, 0.8);
    });
    var orbit = new T3.Group(); orbit.position.set(IX, 0, IZ); b.g.add(orbit);
    var gl = [0, 1, 2].map(function (i) { var g = glider(b, orbit); g.scale.set(1.25, 1.25, 1.25); return g; });
    b.fx.push(function (t) { gl.forEach(function (g, i) { var a = t * 0.45 + i * 2 * PI / 3, R = 2.05; g.position.set(Math.cos(a) * R, 3.0 + i * 0.22 + Math.sin(t * 1.3 + i) * 0.08, Math.sin(a) * R); g.rotation.set(0, -a, 0.35); }); });
    b.target(1.35, 1.45, 0.5); b.target(1.8, 0.95, 0.7); b.dummy(-1.4, 1.55, 0.3); b.dummy(-0.85, 1.8, -0.2);
    b.banner(-0.15, 1.95, 0, "bannerAir", 1.4);
  }
  function ahTower(b) {
    b.slab(3.2, "grassAir", "sideAir");
    hexStep(b, 0.88, 0.16, 0); hexStep(b, 0.64, 0.12, 0.16);
    b.add(new T3.RingGeometry(0.32, 0.4, 6), glowMat("#fff0a0", "#ffb020", 1.0), 0, 0.285, 0, { rx: -PI / 2, rz: PI / 6, noCast: true });
    var dark = C(BY.black);
    b.add(new T3.CylinderGeometry(0.05, 0.05, 3.4, 6), new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.3 + 1.7, 0, { noCast: true });
    var D = [[0.62, 0.5, 1.15], [0.5, 0.55, 2.0], [0.4, 0.42, 2.85]];
    D.forEach(function (d, i) {
      var g = new T3.Group(); g.position.set(0, d[2], 0); b.g.add(g);
      inGroup(b, g, function () {
        hexCell(b, 0, 0, d[0], d[1], 0, { band: 0.5, foot: true, lamps: [[5, 0.5, 0.75], [0, 0.5, 0.75], [1, 0.5, 0.75]] });
        b.add(new T3.ConeGeometry(d[0] * 0.85, d[0] * 0.8, 6), M("honeycomb", 1, 0.6), 0, -d[0] * 0.4, 0, { rx: PI, ry: PI / 6 });
      });
      b.fx.push(function (t) { g.position.y = d[2] + Math.sin(t * 1.1 + i * 1.4) * 0.05; });
    });
    for (var k = 0; k < 3; k++) { var p0 = dRing(0.55, k * 2 * PI / 3 + PI / 3), p1 = dRing(0.5, k * 2 * PI / 3 + PI / 3); b.beam([p0[0], 0.28, p0[1]], [p1[0], 0.95, p1[1]], 0.018, dark); }
    var tur = new T3.Group(); tur.position.set(0, 2.27, 0); b.g.add(tur);
    b.add(new T3.TorusGeometry(0.98, 0.02, 5, 6), dark, 0, 0, 0, { parent: tur, rx: PI / 2, rz: PI / 6 });
    for (var s = 0; s < 6; s++) { var q = dRing(0.98, s * PI / 3), sg = new T3.Group(); sg.position.set(q[0], 0, q[1]); sg.rotation.y = -s * PI / 3 + 0.6; tur.add(sg); b.add(new T3.PlaneGeometry(0.24, 0.5), M("canvasBY", 1, 1, { side: T3.DoubleSide }), 0, 0, 0, { parent: sg }); }
    b.fx.push(function (t, dt) { tur.rotation.y += dt * 0.9; });
    var cg = new T3.Group(); b.g.add(cg);
    var cr = b.add(new T3.OctahedronGeometry(0.22, 0), glowMat("#ffd27a", "#ffa420", 2.0), 0, 0, 0, { parent: cg, noCast: true }); cr.scale.set(0.9, 1.9, 0.9);
    cg.add(new T3.PointLight("#ffb030", 1.8, 5, 2));
    var sh = new T3.Group(); cg.add(sh);
    for (var j = 0; j < 3; j++) { var q2 = dRing(0.42, j * 2 * PI / 3), m = b.add(new T3.OctahedronGeometry(0.06, 0), glowMat("#ffd27a", "#ffa420", 1.6), q2[0], 0, q2[1], { parent: sh, noCast: true }); m.scale.set(0.8, 1.6, 0.8); }
    b.fx.push(function (t, dt) { cg.position.set(0, 3.75 + Math.sin(t * 1.3) * 0.07, 0); cr.rotation.y = t; sh.rotation.y -= dt * 1.6; });
    b.windsock(-1.15, 0.95, 1.1); b.hay(1.1, -1.05, 0.3);
  }
  function ahPen(b) {
    b.slab(4.2, "grassAir", "sideAir");
    var IX = -0.35, IZ = -0.35, IY = 2.15;
    hexStep(b, 1.25, 0.1, 0, IX, IZ);
    var I = hexIsland(b, IX, IY, IZ, 1.3, 1.3, 61);
    var L = new T3.PointLight("#ffb030", 1.2, 4.5, 2); L.position.set(0, -1.3, 0); I.add(L);
    inGroup(b, I, function () {
      var R = 0.78, H = 0.9, dark = C(BY.black);
      var rOn = dSkep(b, -0.3, 0, -0.3, R, H);
      [0.28, 0.58].forEach(function (f, i) { var y = H * f; b.add(new T3.TorusGeometry(hiveR(R, H, 0)(y) + 0.015, 0.03, 6, 32), i ? glowMat("#ffd060", "#c88a10", 0.5) : dark, -0.3, y, -0.3, { rx: PI / 2 }); });
      var dr = hiveR(R, H, 0)(0.3) - 0.04; hiveDoor(b, -0.3 + Math.cos(PI / 4) * dr, 0, -0.3 + Math.sin(PI / 4) * dr, PI / 4, 0.5, 0.3, 0.35);
      b.cyl(0.015, 0.015, 0.3, 5, dark, -0.3, H - 0.05, -0.3); windRose(b, -0.28, H + 0.25, -0.28, 0.75);
      b.bear(0.62, -0.2, 0.75, -0.9);
      honeyJars(b, [[0.35, 0.65], [0.5, 0.55]]);
      b.add(new T3.CylinderGeometry(0.2, 0.2, 0.06, 6), glowMat("#f2a72e", "#c06a10", 0.9), 0.0, 0.03, 0.9, { ry: PI / 6, noCast: true });
    });
    var fallM = new T3.MeshStandardMaterial({ color: lin("#ffc040"), emissive: lin("#ff8a10"), emissiveIntensity: 0.9, transparent: true, opacity: 0.8, roughness: 0.2 });
    var FX = IX, FZ = IZ + 1.12, fall = b.add(new T3.BoxGeometry(0.2, IY - 0.05, 0.05), fallM, FX, (IY + 0.05) / 2, FZ, { noCast: true });
    b.fx.push(function (t) { fallM.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.2; fall.scale.x = 1 + Math.sin(t * 5) * 0.08; });
    b.add(new T3.CylinderGeometry(0.42, 0.42, 0.06, 6), glowMat("#ffc040", "#ff9010", 1.0), FX, 0.13, FZ, { ry: PI / 6, noCast: true });
    b.add(new T3.CylinderGeometry(0.46, 0.46, 0.08, 6, 1, true), C(BY.black), FX, 0.13, FZ, { ry: PI / 6 });
    var drops = []; for (var d = 0; d < 4; d++) drops.push(b.add(new T3.SphereGeometry(0.045, 8, 6), glowMat("#ffd27a", "#ffa420", 1.5), FX + 0.06, 0, FZ + 0.06, { noCast: true }));
    b.fx.push(function (t) { drops.forEach(function (m, i) { var u = (t * 0.6 + i / 4) % 1; m.position.y = IY - u * u * (IY - 0.15); }); });
    hexSteps(b, 2.0, 1.15, -0.4, 0.3, 2.05, 7);
    honeyPylon(b, 1.7, 1.5, 1.0, IX + 0.6, 1.4, IZ + 0.6);
    b.banner(1.0, 1.85, 0, "bannerAir", 1.5);
  }
  function ahSanctum(b) {
    b.slab(4.2, "grassAir", "sideAir");
    hexStep(b, 2.0, 0.12, 0); hexStep(b, 1.65, 0.12, 0.12);
    var rune = glowMat("#fff0a0", "#ffb020", 0.9);
    b.add(new T3.RingGeometry(1.2, 1.28, 6), rune, 0, 0.245, 0, { rx: -PI / 2, rz: PI / 6, noCast: true });
    for (var c = 0; c < 4; c++) b.add(new T3.PlaneGeometry(0.06, 1.25), rune, 0, 0.246, 0, { rx: -PI / 2, rz: c * PI / 2, noCast: true }).geometry.translate(0, 0.75, 0);
    var I = hexIsland(b, 0, 1.6, 0, 1.0, 1.05, 71);
    var L0 = new T3.PointLight("#ffb030", 1.2, 4, 2); L0.position.set(0, -1.2, 0); I.add(L0);
    inGroup(b, I, function () {
      var post = M("plankDark", 0.3, 1), dark = C(BY.black);
      for (var k = 0; k < 6; k++) { var p = dRing(0.78, k * PI / 3 + PI / 6); b.cyl(0.06, 0.07, 1.0, 6, post, p[0], 0, p[1]); b.cyl(0.08, 0.08, 0.06, 6, k % 2 ? glowMat("#ffd060", "#c88a10", 0.5) : dark, p[0], 0.55, p[1]); }
      b.add(new T3.TorusGeometry(0.8, 0.05, 6, 6), M("honeycomb", 2, 0.3), 0, 1.0, 0, { rx: PI / 2, rz: PI / 6 });
      b.add(new T3.ConeGeometry(1.05, 0.45, 6, 1, true), M("canvasBY", 3, 1, { side: T3.DoubleSide }), 0, 1.25, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(0.36, 0.36, 0.22, 6), M("canvasBY", 1.2, 0.5), 0, 1.5, 0, { ry: PI / 6 });
      b.add(new T3.ConeGeometry(0.55, 0.32, 6, 1, true), M("canvasBY", 2, 1, { side: T3.DoubleSide }), 0, 1.77, 0, { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(0.15, 0.15, 0.5, 6), glowMat("#ffd27a", "#ffa420", 1.4), 0, 0.3, 0, { ry: PI / 6, noCast: true });
    });
    var core = new T3.Group(); b.g.add(core);
    var amber = glowMat("#ffd27a", "#ffa420", 1.8);
    b.add(new T3.CylinderGeometry(0.3, 0.3, 0.55, 6), amber, 0, 0, 0, { parent: core, noCast: true });
    b.add(new T3.ConeGeometry(0.3, 0.38, 6), amber, 0, 0.46, 0, { parent: core, noCast: true });
    b.add(new T3.ConeGeometry(0.3, 0.38, 6), amber, 0, -0.46, 0, { parent: core, rx: PI, noCast: true });
    core.add(new T3.PointLight("#ffb030", 2.0, 6, 2));
    b.fx.push(function (t) { core.position.set(0, 4.05 + Math.sin(t * 1.1) * 0.07, 0); core.rotation.y = t * 0.5; });
    var beamM = new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.28, depthWrite: false });
    [0, PI / 2, PI, 3 * PI / 2].forEach(function (a, i) {
      var p = onRing(1.72, a), y = i % 2 ? 2.55 : 2.15;
      var S = hexIsland(b, p[0], y, p[1], 0.42, 0.55, 80 + i);
      inGroup(b, S, function () {
        hexCell(b, 0, 0, 0.2, 0.3, 0, { band: 0.5 });
        b.cyl(0.025, 0.03, 0.85, 6, M("plankDark", 0.2, 1), 0, 0.3, 0);
        bySail(b, 0, 1.1, 0, a + PI / 2, 0.6); windRose(b, 0.03, 1.2, 0.03, 0.55);
      });
      b.beam([p[0], y + 0.4, p[1]], [0, 4.0, 0], 0.02, beamM);
    });
  }
  function ahWorkshop(b) {
    b.slab(4.2, "grassAir", "sideAir"); b.decal("path", 0.7, 1.4, 2.2, 1.1, -0.3);
    var Z0 = -0.55, post = M("plankDark", 0.3, 2), dark = C(BY.black);
    b.box(3.5, 0.12, 2.0, M("honeycomb", 3.5, 2.0), -0.15, 0, Z0); b.box(3.52, 0.03, 2.02, dark, -0.15, 0.08, Z0);
    [-1.75, 1.45].forEach(function (x) { hexCell(b, x, Z0, 0.2, 2.75, 0.12, { band: 0.5, lamps: [[5, 0.3, 0.6], [5, 0.7, 0.6]] }); b.add(new T3.CylinderGeometry(0.12, 0.12, 0.1, 6), glowMat("#ffd27a", "#ffa420", 1.3), x, 2.92, Z0, { ry: PI / 6, noCast: true }); });
    b.beam([-1.75, 2.8, Z0], [1.45, 2.8, Z0], 0.05, post);
    var WY = 1.55, WZ = Z0 - 0.82;
    b.box(2.9, 0.05, 0.26, M("plankWarm", 2.9, 0.3), -0.15, WY, WZ);
    for (var wi = 0; wi < 5; wi++) { var wx = -1.45 + wi * 0.65; b.cyl(0.025, 0.03, WY, 6, post, wx, 0.12, WZ - 0.1); b.beam([wx, WY + 0.05, WZ - 0.1], [wx, WY + 0.3, WZ - 0.1], 0.012, post); }
    b.box(2.9, 0.025, 0.025, dark, -0.15, WY + 0.3, WZ - 0.1);
    var BXc = -0.15, BYc = 2.05, RX = 1.45, RR = 0.68;
    var ship = new T3.Group(); ship.position.set(BXc, BYc, Z0); b.g.add(ship);
    var skin = b.add(new T3.SphereGeometry(1, 28, 16, PI / 2, PI), M("canvasBY", 4, 2, { side: T3.DoubleSide }), 0, 0, 0, { parent: ship, s: [RX, RR, RR] });
    function ringR(x) { return RR * Math.sqrt(Math.max(0, 1 - (x / RX) * (x / RX))); }
    [0.25, 0.75].forEach(function (x) { b.add(new T3.TorusGeometry(ringR(x) + 0.01, 0.025, 5, 28), dark, x, 0, 0, { parent: ship, ry: PI / 2 }); });
    var wood = M("plankWarm", 0.3, 1);
    for (var i = 1; i <= 5; i++) { var x = -RX * i / 5.5; b.add(new T3.TorusGeometry(ringR(x), 0.018, 5, 26), wood, x, 0, 0, { parent: ship, ry: PI / 2 }); }
    [0, PI / 2, PI, 3 * PI / 2].forEach(function (a) { var pts = []; for (var s = 0; s <= 6; s++) { var x = -RX * 0.98 * s / 6; pts.push([x, Math.cos(a) * ringR(x), Math.sin(a) * ringR(x)]); } for (var s2 = 0; s2 < 6; s2++) b.beam(pts[s2], pts[s2 + 1], 0.014, wood, ship); });
    b.beam([-RX, 0, 0], [0, 0, 0], 0.02, dark, ship);
    var GY = 0.95;
    b.box(1.35, 0.24, 0.44, M("plankWarm", 1.3, 0.3), BXc + 0.1, GY, Z0); b.box(1.37, 0.03, 0.46, dark, BXc + 0.1, GY + 0.24, Z0);
    [[-0.5, -0.18], [-0.5, 0.18], [0.65, -0.18], [0.65, 0.18]].forEach(function (q) { b.beam([BXc + q[0], GY + 0.24, Z0 + q[1]], [BXc + q[0] * 0.8, BYc - RR * 0.85, Z0 + q[1] * 0.6], 0.007, C("#d8cba6")); });
    var head = new T3.Group(); head.position.set(BXc + 0.6, GY + 0.36, Z0); head.rotation.y = PI / 2; b.g.add(head);
    b.add(new T3.BoxGeometry(0.08, 0.08, 0.6), M("plankDark", 0.2, 1), 0, 0, 0, { parent: head });
    [-1, 1].forEach(function (s) { var sh = new T3.Shape(); sh.moveTo(0, 0); sh.lineTo(s * 0.4, 0.06); sh.lineTo(s * 0.32, -0.14); sh.closePath(); b.add(new T3.ShapeGeometry(sh), M("canvasBY", 0.5, 0.3, { side: T3.DoubleSide }), 0, 0.02, 0.12, { parent: head, rx: -PI / 2 }); });
    var bolt = b.add(new T3.OctahedronGeometry(0.05, 0), glowMat("#ffd27a", "#ffa420", 2), 0, 0.06, 0.22, { parent: head, noCast: true }); bolt.scale.set(0.8, 0.8, 4);
    [[-1.0, 0.25], [0.7, -0.3]].forEach(function (q) { b.beam([BXc + q[0], 2.8, Z0], [BXc + q[0], BYc + ringR(q[0]) - 0.02, Z0], 0.006, C("#d8cba6")); });
    b.fx.push(function (t) { ship.rotation.x = Math.sin(t * 0.8) * 0.02; });
    var WX = 1.05, WZ = 0.95;
    b.box(0.5, 0.25, 0.3, M("plankDark", 0.5, 0.3), WX, 0, WZ, { ry: PI / 4 });
    var drum = b.add(new T3.CylinderGeometry(0.11, 0.11, 0.42, 10), M("plankWarm", 0.4, 0.3), WX, 0.38, WZ, { rz: PI / 2, ry: PI / 4 });
    b.fx.push(function (t) { drum.rotation.x = t; });
    b.beam([WX, 0.48, WZ], [BXc + 0.6, GY, Z0 + 0.2], 0.006, C("#d8cba6"));
    var rack = new T3.Group(); rack.position.set(-1.45, 0, 1.1); rack.rotation.y = PI / 4; b.g.add(rack);
    b.add(new T3.BoxGeometry(0.6, 0.06, 0.3), M("plankWarm", 0.5, 0.3), 0, 0.2, 0, { parent: rack });
    [-0.25, 0.25].forEach(function (x) { b.add(new T3.BoxGeometry(0.05, 0.2, 0.05), post, x, 0.1, 0, { parent: rack }); });
    for (var k = 0; k < 4; k++) { var m = b.add(new T3.OctahedronGeometry(0.05, 0), glowMat("#ffd27a", "#ffa420", 1.4), -0.18 + k * 0.12, 0.27, 0, { parent: rack, noCast: true }); m.scale.set(0.8, 0.8, 4); }
    b.crate(1.7, 0.2, 0.26, 0.3); b.crate(1.75, -0.15, 0.2, -0.2);
    b.banner(-0.3, 1.95, 0, "bannerAir", 1.5);
  }

  MYTHB.air = [mhHouse, MYTHB.air[1], mhStore, mhBarracks, mhTower, mhPen, MYTHB.air[6]];
  if (typeof ARCB !== "undefined") ARCB.air = [ahHouse, ahFarm, ahStore, ahBarracks, ahTower, ahPen, ahSanctum, ahWorkshop];
