
  /* ================= ARCANE AGE Town Centers in the new design languages ================= */
  if (typeof REDGOLD === "undefined") { var REDGOLD = function () { return C("#e3a83a", { metalness: 0.7, roughness: 0.3 }); }; }
  if (typeof BRONZE === "undefined") { var BRONZE = function () { return C("#c08a4a", { metalness: 0.75, roughness: 0.3 }); }; }
  function inGroup(b, grp, fn) { var keep = b.g; b.g = grp; fn(); b.g = keep; }
  function hexIsland(b, x, y, z, r, depth, seed) {
    var g = new T3.Group(); g.position.set(x, y, z); b.g.add(g);
    b.add(rough(new T3.CylinderGeometry(r * 0.95, 0.08, depth, 6, 4), 0.3, seed), C("#a59d8e", { flatShading: true, roughness: 0.9 }), 0, -depth / 2 - 0.18, 0, { parent: g, ry: PI / 6 });
    var hc = M("honeycomb", r * 1.5, r * 1.5), hcS = M("honeycomb", r * 3, 0.5);
    b.add(new T3.CylinderGeometry(r, r * 0.97, 0.36, 6), [hcS, hc, hc], 0, -0.18, 0, { parent: g, ry: PI / 6 });
    b.add(new T3.CylinderGeometry(r + 0.02, r + 0.02, 0.04, 6, 1, true), C(BY.black), 0, -0.01, 0, { parent: g, ry: PI / 6 });
    var cr = b.add(new T3.OctahedronGeometry(0.1 + r * 0.06, 0), glowMat("#ffd27a", "#ffa420", 1.6), 0, -depth - 0.35, 0, { parent: g, noCast: true }); cr.scale.set(0.8, 1.6, 0.8);
    var ph = b.rand() * 6; b.fx.push(function (t) { g.position.y = y + Math.sin(t * 0.8 + ph) * 0.06; cr.rotation.y = t; });
    return g;
  }
  function xAir(b) {
    b.base(M("grassAir", 3, 3), M("sideAir", 3, 1));
    var dark = C(BY.black), amber = glowMat("#ffd27a", "#ffa420", 1.4), bw = M("plankDark", 0.3, 2);
    hexStep(b, 2.75, 0.14, 0); hexStep(b, 2.4, 0.14, 0.14); hexStep(b, 2.05, 0.12, 0.28);
    var rune = glowMat("#fff0a0", "#ffb020", 0.9);
    b.add(new T3.RingGeometry(1.3, 1.42, 6), rune, 0, 0.405, 0, { rx: -PI / 2, rz: PI / 6, noCast: true });
    b.add(new T3.RingGeometry(0.75, 0.82, 6), rune, 0, 0.405, 0, { rx: -PI / 2, noCast: true });
    var IY = 2.15, isl = hexIsland(b, 0, IY, 0, 1.75, 1.7, 3);
    var L = new T3.PointLight("#ffb030", 1.6, 5, 2); L.position.set(0, -1.4, 0); isl.add(L);
    inGroup(b, isl, function () {
      bigHive(b, 0, 0, 1.2, 2.1, 0.0, { bands: [0.2, 0.45, 0.7], cupola: 0.34, rose: 0.85, door: [0.46, 0.34], wins: [[PI / 4 - 0.55, 0.32], [PI / 4 + 0.55, 0.32], [PI / 4 - 1.2, 0.32], [PI / 4 + 1.2, 0.32], [PI / 4 - 0.35, 0.58, 0.9], [PI / 4 + 0.35, 0.58, 0.9], [PI / 4 - 1.0, 0.58, 0.9], [PI / 4 + 1.0, 0.58, 0.9]] });
      b.add(new T3.BoxGeometry(1.2, 0.04, 0.5), M("canvasBY", 1.2, 0.5), Math.cos(PI / 4) * 1.25, 0.95, Math.sin(PI / 4) * 1.25, { ry: PI / 4, rx: 0.45 });
      [[-1.45, 0.2], [0.2, -1.45], [-1.1, -1.1]].forEach(function (m, i) {
        b.beam([m[0], 0, m[1]], [m[0] * 1.05, 2.4, m[1] * 1.05], 0.05, bw);
        bySail(b, m[0] * 1.05, 2.3, m[1] * 1.05, PI / 4, 1.6);
        dPennant(b, m[0] * 1.05, 2.42, m[1] * 1.05, i % 2 ? BY.black : BY.yellow);
      });
    });
    var crown = new T3.Group(); b.g.add(crown);
    b.add(new T3.CylinderGeometry(0.24, 0.24, 0.55, 6), amber, 0, 0, 0, { parent: crown, noCast: true });
    b.add(new T3.ConeGeometry(0.24, 0.32, 6), amber, 0, 0.43, 0, { parent: crown, noCast: true });
    b.add(new T3.ConeGeometry(0.24, 0.32, 6), amber, 0, -0.43, 0, { parent: crown, rx: PI, noCast: true });
    var r1 = b.add(new T3.TorusGeometry(0.55, 0.025, 6, 6), dark, 0, 0, 0, { parent: crown, rx: PI / 2 });
    var r2 = b.add(new T3.TorusGeometry(0.68, 0.02, 6, 6), glowMat("#ffd060", "#c88a10", 0.6), 0, 0, 0, { parent: crown, rx: PI / 2 - 0.4 });
    var CL = new T3.PointLight("#ffb030", 1.5, 5, 2); crown.add(CL);
    b.fx.push(function (t) { crown.position.set(0, IY + 3.15 + Math.sin(t * 1.2) * 0.09, 0); crown.rotation.y = t * 0.5; r1.rotation.z = t; r2.rotation.z = -t * 0.7; });
    [[-2.2, 1.35, 0.95, 3.4], [0.95, 1.85, -2.2, 4.4]].forEach(function (q, i) {
      var si = hexIsland(b, q[0], q[1], q[2], 0.62, 0.7, q[3]);
      inGroup(b, si, function () { bigHive(b, 0, 0, 0.45, 0.8, 0.0, { bands: [0.35], cupola: 0.13, rose: 0.45 }); });
      b.beam([q[0] * 0.6, IY - 0.15, q[2] * 0.6], [q[0] * 0.85, q[1] - 0.15, q[2] * 0.85], 0.012, C("#e8dcc0"));
      kite(b, q[0], q[1] + 0.8, q[2], i + 2, 4.9 + i * 0.25);
    });
    for (var s = 0; s < 8; s++) {
      var t = s / 7, p = onRing(2.55 - t * 1.15, PI / 4 + 0.35), y = 0.5 + t * (IY - 0.5);
      var st = b.add(new T3.CylinderGeometry(0.24, 0.24, 0.1, 6), [M("honeycomb", 0.6, 0.2), M("honeycomb", 0.4, 0.4), M("honeycomb", 0.4, 0.4)], p[0], y, p[1], { ry: PI / 6 });
      (function (m, yy, k) { b.fx.push(function (tt) { m.position.y = yy + Math.sin(tt * 1.3 + k) * 0.03; }); })(st, y, s);
    }
    var beamM = new T3.MeshBasicMaterial({ color: lin("#fff0b0"), transparent: true, opacity: 0.22, depthWrite: false });
    [PI * 0.95, PI * 1.45, PI * 1.95].forEach(function (a, i) {
      var p = onRing(2.3, a);
      b.add(new T3.CylinderGeometry(0.2, 0.24, 1.6, 6), M("honeycomb", 0.8, 1.4), p[0], 0.4 + 0.8, p[1], { ry: PI / 6 });
      b.add(new T3.CylinderGeometry(0.26, 0.26, 0.05, 6), dark, p[0], 2.0, p[1], { ry: PI / 6 });
      amberFloat(b, p[0], 2.35, p[1], 0.9);
      var q = onRing(1.2, a); b.beam([p[0], 2.35, p[1]], [q[0], IY - 0.9, q[1]], 0.03, beamM);
    });
    amberFloat(b, 2.2, 1.2, 1.6, 0.8); amberFloat(b, 1.6, 1.5, 2.2, 0.7);
    b.banner(0.2, 2.65, 0, "bannerAir", 2.0); b.banner(2.65, 0.2, 0, "bannerAir", 2.0);
  }

  function armSphere(b, x, y, z, s) {
    var g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); b.g.add(g);
    var bz = BRONZE(), orb = glowMat("#e8f8ff", "#58c8ff", 2.2);
    b.add(new T3.SphereGeometry(0.2, 18, 14), orb, 0, 0, 0, { parent: g, noCast: true });
    var r1 = b.add(new T3.TorusGeometry(0.58, 0.025, 6, 44), bz, 0, 0, 0, { parent: g }), r2 = b.add(new T3.TorusGeometry(0.5, 0.025, 6, 44), bz, 0, 0, 0, { parent: g }), r3 = b.add(new T3.TorusGeometry(0.66, 0.02, 6, 44), bz, 0, 0, 0, { parent: g, rx: PI / 2 }), r4 = b.add(new T3.TorusGeometry(0.42, 0.02, 6, 40), bz, 0, 0, 0, { parent: g });
    b.beam([0, -0.75, 0], [0, -0.4, 0], 0.03, bz, g);
    var L = new T3.PointLight("#58c8ff", 1.4, 5, 2); g.add(L);
    b.fx.push(function (t) { r1.rotation.set(t * 0.6, 0.4, 0); r2.rotation.set(0.9, t * 0.8, 0); r3.rotation.z = t * 0.5; r4.rotation.set(-t * 0.7, 1.2, 0.3); g.position.y = y + Math.sin(t * 1.1) * 0.05; orb.emissiveIntensity = 2 + Math.sin(t * 1.5) * 0.4; });
  }
  function xWater(b) {
    var grass = M("grassWater", 2.5, 2.5), side = M("sideWater", 2.5, 1), bottom = C("#21180f");
    b.add(new T3.BoxGeometry(4.9, 0.7, 4.9), [side, side, grass, bottom, side, side], -0.55, -0.35, -0.55);
    b.add(new T3.BoxGeometry(6, 0.35, 1.1), M("dirt", 2, 1), 0, -0.525, 2.45);
    b.add(new T3.BoxGeometry(1.1, 0.35, 4.9), M("dirt", 2, 1), 2.45, -0.525, -0.55);
    var wtex = tex("water", 2, 1), wtex2 = tex("water", 1, 2);
    b.add(new T3.BoxGeometry(6, 0.27, 1.1), new T3.MeshStandardMaterial({ map: wtex, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 0, -0.215, 2.45, { noCast: true });
    b.add(new T3.BoxGeometry(1.1, 0.27, 4.9), new T3.MeshStandardMaterial({ map: wtex2, transparent: true, opacity: 0.86, roughness: 0.12, metalness: 0.25 }), 2.45, -0.215, -0.55, { noCast: true });
    b.fx.push(function (t) { wtex.offset.set(t * 0.03, 0); wtex2.offset.set(0, -t * 0.03); });
    var CX = -0.6, CZ = -0.6;
    blueTerrace(b, CX, CZ, 2.3, 0.22, 0); pearlTerrace(b, CX, CZ, 1.95, 0.22, 0.22); pearlTerrace(b, CX, CZ, 1.6, 0.2, 0.44);
    for (var s = 0; s < 4; s++) b.box(1.2, 0.64 - s * 0.16, 0.2, M("pearl", 1.1, 0.3), CX + (1.65 + s * 0.2) * 0.707, 0, CZ + (1.65 + s * 0.2) * 0.707, { ry: PI / 4 });
    var Y = 0.64, cx = CX - 0.15, cz = CZ - 0.15;
    var rAt = conch(b, cx, cz, 4.8, 1.38, Y, 7);
    var mouth = new T3.Group(); mouth.position.set(cx + 0.95, Y, cz + 0.95); mouth.rotation.y = PI / 4; b.g.add(mouth);
    b.add(new T3.TorusGeometry(0.7, 0.18, 10, 30, PI * 1.25), M("pearl", 2, 0.5, { color: lin("#f6dcd4") }), 0, 0.7, 0.06, { parent: mouth, rz: -PI * 0.125 });
    var mg = glowMat("#9fdcff", "#2a9ae8", 1.0);
    b.add(new T3.CircleGeometry(0.62, 30), mg, 0, 0.7, 0.0, { parent: mouth, noCast: true });
    glassBubbles(b, cx, cz, rAt, Y, [[-0.4, 1.4, 0.22], [1.6, 1.5, 0.2], [0.4, 2.2, 0.17], [-0.2, 2.9, 0.13], [2.3, 1.15, 0.18], [1.1, 3.1, 0.12], [-1.2, 1.9, 0.18], [2.0, 2.4, 0.14], [0.8, 3.7, 0.09]]);
    bronzeRing(b, cx, Y + 1.7, cz, rAt(1.7) + 0.32, 16);
    bronzeRing(b, cx, Y + 3.0, cz, rAt(3.0) + 0.22, 12);
    var tel = new T3.Group(); tel.position.set(cx + 0.9, Y + 1.7, cz - 0.9); b.g.add(tel);
    b.add(new T3.CylinderGeometry(0.06, 0.1, 0.9, 10), BRONZE(), 0, 0.38, 0, { parent: tel, rz: -0.7, rx: 0.3 });
    b.fx.push(function (t) { tel.rotation.y = Math.sin(t * 0.3) * 0.6; mg.emissiveIntensity = 0.9 + Math.sin(t * 1.5) * 0.25; });
    armSphere(b, cx, Y + 5.15, cz, 0.85);
    var tideM = new T3.MeshStandardMaterial({ map: tex("water", 5, 0.3), transparent: true, opacity: 0.75, roughness: 0.05, emissive: lin("#1a6ab0"), emissiveIntensity: 0.55 });
    var tide = b.add(new T3.TorusGeometry(1.75, 0.07, 8, 64), tideM, cx, Y + 2.3, cz, { rx: PI / 2 - 0.3, noCast: true });
    var tide2 = b.add(new T3.TorusGeometry(1.25, 0.05, 8, 64), tideM, cx, Y + 3.2, cz, { rx: PI / 2 + 0.25, noCast: true });
    b.fx.push(function (t) { tide.rotation.z = t * 0.4; tide2.rotation.z = -t * 0.5; tideM.map.offset.x = t * 0.15; });
    var spires = [[PI / 4 + 1.45, 2.6], [PI / 4 - 1.45, 2.6], [PI / 4 + PI, 3.0]];
    spires.forEach(function (q) {
      var p = onRing(1.75, q[0]), x = CX + p[0], z = CZ + p[1];
      var ra = conch(b, x, z, q[1], 0.52, 0.44, 4.5);
      glowCrown(b, x, 0.44 + q[1] + 0.1, z, 0.14);
      waterArc(b, x, 0.44 + q[1] * 0.75, z, cx, Y + 2.0, cz, 0.7, 12);
    });
    var wf = tex("water", 0.5, 1), wfm = new T3.MeshStandardMaterial({ map: wf, transparent: true, opacity: 0.82, roughness: 0.1, side: T3.DoubleSide });
    [-1.2, -0.4, 0.4].forEach(function (dz) { b.box(0.26, 0.12, 0.22, BRONZE(), CX + 2.28, 0.5, CZ + dz); b.add(new T3.PlaneGeometry(0.22, 0.9), wfm, CX + 2.42, 0.1, CZ + dz, { ry: PI / 2, noCast: true }); });
    b.fx.push(function (t) { wf.offset.y = t * 0.9; });
    waveWall(b, CX + 2.15, 0, CZ + 1.1, PI, 1.0); waveWall(b, CX + 1.1, 0, CZ + 2.15, -PI / 2, 1.0);
    b.box(1.2, 0.07, 1.2, M("drift", 1, 2), CX + 1.1, -0.02, 2.42);
    [[CX + 0.6, 1.8], [CX + 1.6, 1.8]].forEach(function (lp) { b.cyl(0.04, 0.06, 1.1, 8, BRONZE(), lp[0], 0, lp[1]); b.add(new T3.SphereGeometry(0.09, 12, 10), glowMat("#e8f8ff", "#58c8ff", 1.6), lp[0], 1.2, lp[1], { noCast: true }); });
    var coral = C("#e8826e", { flatShading: true });
    [[CX - 1.6, CZ + 1.3], [CX + 1.3, CZ - 1.6]].forEach(function (q) { b.beam([q[0], 0.44, q[1]], [q[0] + 0.05, 0.85, q[1] - 0.05], 0.035, coral); b.beam([q[0] + 0.03, 0.62, q[1]], [q[0] + 0.2, 0.9, q[1] + 0.05], 0.03, coral); });
    b.banner(CX - 2.15, CZ + 2.15, 0, "bannerWater", 2.0);
  }

  function xFire(b) {
    b.base(M("grassFire", 3, 3, { color: lin("#b0a080") }), M("sideFire", 3, 1));
    var bas = M("basalt", 3, 1), gold = REDGOLD(), magma = dGlow("#ffb060", "#ff4a10", 1.7);
    frustum(b, 0, 0, 0, 3.55, 3.4, 0.25, bas); frustum(b, 0, 0.25, 0, 3.1, 2.95, 0.25, bas);
    var moat = b.add(new T3.TorusGeometry(2.0, 0.08, 4, 4), magma, 0, 0.5, 0, { rx: PI / 2, rz: PI / 4, noCast: true });
    var Y = 0.5, tiers = [[1.95, 1.62, 1.05], [1.45, 1.18, 0.95], [1.05, 0.8, 0.85], [0.7, 0.5, 0.75]];
    tiers.forEach(function (t, i) {
      frustum(b, 0, Y, 0, t[0], t[1], t[2], bas);
      frustum(b, 0, Y + t[2] - 0.08, 0, t[1] + 0.07, t[1] + 0.03, 0.1, gold);
      spikeRing(b, 0, 0, t[1] * 0.707 + 0.02, Y + t[2], 3);
      magmaSeams(b, 0, 0, t[0], t[2], Y, 2, magma);
      Y += t[2];
    });
    var topY = Y;
    var stairs = M("basalt", 1, 0.3);
    for (var s = 0; s < 9; s++) { var sy = 0.5 + s * 0.13, sz = 2.0 - s * 0.14; b.box(0.8, 0.13, 0.16, stairs, 0, sy, sz); }
    [-0.48, 0.48].forEach(function (dx) {
      b.add(new T3.BoxGeometry(0.1, 0.03, 1.4), magma, dx, 0.95, 1.38, { rx: -0.7, noCast: true });
      b.add(new T3.BoxGeometry(0.1, 0.03, 1.0), magma, dx * 0.85, 1.95, 0.95, { rx: -0.95, noCast: true });
    });
    for (var c = 0; c < 12; c++) { var p = onRing(0.48, c / 12 * 2 * PI); b.add(new T3.ConeGeometry(0.07, 0.65, 4), gold, p[0], topY + 0.32, p[1], { rz: p[0] * -1.1, rx: p[1] * 1.1 }); }
    b.cyl(0.42, 0.28, 0.24, 10, M("iron"), 0, topY, 0);
    b.cyl(0.4, 0.4, 0.02, 10, magma, 0, topY + 0.24, 0, { noCast: true });
    flameAt(b, 0, topY + 0.25, 0, 1.6, 2.8);
    var halo = new T3.Group(); b.g.add(halo);
    b.add(new T3.TorusGeometry(0.85, 0.035, 6, 48), gold, 0, 0, 0, { parent: halo, rx: PI / 2 });
    for (var f = 0; f < 10; f++) { var q = onRing(0.85, f / 10 * 2 * PI); b.add(new T3.ConeGeometry(0.05, 0.2, 5), gold, q[0], 0.08, q[1], { parent: halo }); }
    b.fx.push(function (t) { halo.position.set(0, topY + 1.85 + Math.sin(t * 1.3) * 0.06, 0); halo.rotation.y = t * 0.5; magma.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.4; });
    var gate = new T3.Group(); gate.position.set(0, 0.5, 1.95 * 0.707 + 0.02); b.g.add(gate);
    var head = new T3.Group(); head.position.set(0, 1.25, 0.15); gate.add(head);
    b.add(new T3.SphereGeometry(0.24, 12, 9), gold, 0, 0, 0, { parent: head, s: [1, 1, 0.8] });
    b.add(new T3.SphereGeometry(0.12, 10, 8), gold, 0, -0.08, 0.17, { parent: head });
    [-1, 1].forEach(function (sg) { b.add(new T3.SphereGeometry(0.04, 8, 6), glowMat("#fff2a0", "#ffb020", 2.4), sg * 0.1, 0.05, 0.18, { parent: head, noCast: true }); });
    var maneFl = [];
    for (var i = 0; i < 18; i++) {
      var a = i / 18 * 2 * PI, mm = new T3.MeshBasicMaterial({ color: lin(["#ff4a10", "#ff7a1a", "#ffb030"][i % 3]), transparent: true, opacity: 0.8, blending: T3.AdditiveBlending, depthWrite: false });
      var m = b.add(new T3.ConeGeometry(0.08, 0.4, 6), mm, 0, 0, 0, { parent: head, noCast: true, noReceive: true });
      var dir = new T3.Vector3(Math.cos(a), Math.sin(a), -0.4).normalize(); m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), dir); m.position.copy(dir.clone().multiplyScalar(0.32)); maneFl.push([m, i]);
    }
    b.fx.push(function (t) { maneFl.forEach(function (q) { q[0].scale.set(1, 1 + Math.sin(t * 11 + q[1] * 1.7) * 0.25, 1); }); });
    lionStatue(b, -0.95, 2.55, 0.0, 0, 1.15); lionStatue(b, 0.95, 2.55, 0.0, 0, 1.15);
    [[-2.35, -2.35], [2.35, -2.35], [-2.35, 2.2], [2.35, 2.2]].forEach(function (q, i) {
      var h = i < 2 ? 3.4 : 2.2;
      frustum(b, q[0], 0, q[1], 0.42, 0.24, h, bas);
      [0.35, 0.7].forEach(function (f2) { var r = 0.42 - 0.18 * f2; frustum(b, q[0], h * f2, q[1], r + 0.03, r + 0.02, 0.06, gold); });
      b.cyl(0.18, 0.18, 0.06, 4, magma, q[0], h, q[1], { ry: PI / 4, noCast: true });
      flameAt(b, q[0], h + 0.06, q[1], 0.6, 0.55);
      if (i < 2) smokeAt(b, q[0], h + 0.6, q[1], 4);
    });
    [[-1.0, 1.6], [1.0, 1.6]].forEach(function (p) {
      var pv = new T3.Group(); pv.position.set(p[0], 1.5, p[1] - 0.3); b.g.add(pv);
      b.add(new T3.PlaneGeometry(0.5, 1.05), new T3.MeshStandardMaterial({ map: tex("bannerFire"), transparent: true, alphaTest: 0.5, side: T3.DoubleSide, roughness: 0.9 }), 0, -0.52, 0, { parent: pv });
      b.add(new T3.BoxGeometry(0.6, 0.045, 0.045), gold, 0, 0, 0, { parent: pv });
    });
  }
  var ARCNEW = { air: xAir, water: xWater, fire: xFire };
