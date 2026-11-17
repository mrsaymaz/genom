  var T3 = THREE, PI = Math.PI;

  /* ---------- deterministic randomness ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function n3(x, y, z) {
    var s = Math.sin(Math.round(x * 97) * 12.9898 + Math.round(y * 97) * 78.233 + Math.round(z * 97) * 37.719) * 43758.5453;
    return s - Math.floor(s);
  }
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function jit(hex, r, amt) {
    var c = rgb(hex), k = 1 + (r() - 0.5) * amt;
    return "rgb(" + c.map(function (v) { return Math.max(0, Math.min(255, Math.round(v * k))); }).join(",") + ")";
  }
  function rgba(hex, a) { var c = rgb(hex); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

  /* ---------- painted textures ---------- */
  function speckle(g, w, h, r, n, cols, a, s) {
    for (var i = 0; i < n; i++) {
      g.fillStyle = rgba(cols[(r() * cols.length) | 0], a * (0.4 + r() * 0.6));
      var z = s * (0.5 + r());
      g.fillRect(r() * w, r() * h, z, z);
    }
  }
  function blotch(g, w, h, r, n, cols, a, rmin, rmax) {
    for (var i = 0; i < n; i++) {
      var x = r() * w, y = r() * h, rad = rmin + r() * (rmax - rmin), col = cols[(r() * cols.length) | 0];
      for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {
        var gr = g.createRadialGradient(x + ox * w, y + oy * h, 0, x + ox * w, y + oy * h, rad);
        gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
        g.fillStyle = gr; g.fillRect(x + ox * w - rad, y + oy * h - rad, rad * 2, rad * 2);
      }
    }
  }
  function grass(base, dark, light) {
    return function (g, w, h, r) {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      blotch(g, w, h, r, 26, [dark, light], 0.32, 30, 90);
      g.lineWidth = 1.3;
      for (var i = 0; i < 9000; i++) {
        var x = r() * w, y = r() * h, l = 2 + r() * 5, a = -PI / 2 + (r() - 0.5) * 1.1;
        g.strokeStyle = rgba([dark, light, base, light][(r() * 4) | 0], 0.55);
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      speckle(g, w, h, r, 120, ["#f3e6a0", "#ffffff"], 0.5, 2);
    };
  }
  function moss(base, dark, light) {
    return function (g, w, h, r) {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      blotch(g, w, h, r, 40, [dark, light, dark], 0.38, 18, 60);
      for (var i = 0; i < 2600; i++) {
        g.fillStyle = rgba([dark, light, base][(r() * 3) | 0], 0.5);
        g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 2.5, 0, 2 * PI); g.fill();
      }
      speckle(g, w, h, r, 60, ["#d9f2c4", "#b9e8ff"], 0.6, 2);
    };
  }
  function dirt(base) {
    return function (g, w, h, r) {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      blotch(g, w, h, r, 20, ["#6e5638", "#c9ad7c"], 0.3, 20, 70);
      speckle(g, w, h, r, 4000, ["#5a452c", "#d8c095", "#8a6e48"], 0.5, 2);
      for (var i = 0; i < 70; i++) {
        var x = r() * w, y = r() * h, s = 2 + r() * 4;
        g.fillStyle = jit("#8f8578", r, 0.4); g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * PI, 0, 2 * PI); g.fill();
        g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(x - s * 0.4, y - s * 0.5, s * 0.6, 1);
      }
    };
  }
  function softEdge(draw) {
    return function (g, w, h, r) {
      draw(g, w, h, r);
      g.globalCompositeOperation = "destination-in";
      var gr = g.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w * 0.5);
      gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "source-over";
    };
  }
  function strata(lip) {
    return function (g, w, h, r) {
      var y = 0, cols = ["#7a5636", "#6a4a2e", "#83603d", "#5c4129", "#73533a"];
      g.fillStyle = "#5e432a"; g.fillRect(0, 0, w, h);
      y = 16;
      while (y < h) {
        var bh = 18 + r() * 30, col = cols[(r() * cols.length) | 0];
        g.fillStyle = col; g.beginPath(); g.moveTo(0, y);
        for (var x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.03 + y) * 3 + (r() - 0.5) * 4);
        g.lineTo(w, h); g.lineTo(0, h); g.closePath(); g.fill();
        y += bh;
      }
      speckle(g, w, h, r, 2500, ["#3e2b1a", "#a3825a"], 0.45, 2);
      for (var i = 0; i < 45; i++) {
        var rx = r() * w, ry = 30 + r() * (h - 40), s = 4 + r() * 9;
        g.fillStyle = jit("#8c857a", r, 0.35); g.beginPath(); g.ellipse(rx, ry, s * 1.3, s * 0.8, (r() - 0.5) * 0.6, 0, 2 * PI); g.fill();
        g.fillStyle = "rgba(255,255,255,.2)"; g.fillRect(rx - s * 0.6, ry - s * 0.6, s, 2);
        g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(rx - s * 0.6, ry + s * 0.5, s * 1.2, 2);
      }
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.45)");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = lip; g.fillRect(0, 0, w, 14);
      for (var k = 0; k < 260; k++) {
        var gx = r() * w; g.strokeStyle = rgba(lip, 0.9); g.lineWidth = 2;
        g.beginPath(); g.moveTo(gx, 10); g.lineTo(gx + (r() - 0.5) * 4, 14 + r() * 10); g.stroke();
      }
    };
  }
  function stone(base, mortar, rows, cols) {
    return function (g, w, h, r) {
      g.fillStyle = mortar; g.fillRect(0, 0, w, h);
      var bh = h / rows;
      for (var row = 0; row < rows; row++) {
        var y = row * bh, x = -(r() * w / cols);
        while (x < w) {
          var bw = (w / cols) * (0.65 + r() * 0.7);
          for (var o = 0; o <= 1; o++) {
            var xx = x + (o ? w : 0); if (o && x + bw < w) continue;
            if (o) xx = x - w;
            g.fillStyle = jit(base, r, 0.28);
            g.fillRect(xx + 2, y + 2, bw - 4, bh - 4);
            g.fillStyle = "rgba(255,255,255,.16)"; g.fillRect(xx + 2, y + 2, bw - 4, 3);
            g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(xx + 2, y + 2, 3, bh - 4);
            g.fillStyle = "rgba(0,0,0,.24)"; g.fillRect(xx + 2, y + bh - 6, bw - 4, 4);
          }
          x += bw;
        }
      }
      speckle(g, w, h, r, 3000, ["#000000", "#ffffff"], 0.12, 2);
      blotch(g, w, h, r, 12, ["#3a4a2a", "#000000"], 0.12, 20, 50);
    };
  }
  function planks(base, n) {
    return function (g, w, h, r) {
      var bw = w / n;
      for (var i = 0; i < n; i++) {
        var x = i * bw; g.fillStyle = jit(base, r, 0.22); g.fillRect(x, 0, bw, h);
        g.lineWidth = 1;
        for (var k = 0; k < 6; k++) {
          var gx = x + 3 + r() * (bw - 6), ph = r() * 6;
          g.strokeStyle = "rgba(40,22,10," + (0.12 + r() * 0.18) + ")";
          g.beginPath(); g.moveTo(gx, 0);
          for (var y = 0; y <= h; y += 16) g.lineTo(gx + Math.sin(y * 0.05 + ph) * 1.6, y);
          g.stroke();
        }
        if (r() < 0.5) { g.fillStyle = "rgba(40,22,10,.35)"; g.beginPath(); g.ellipse(x + bw * (0.3 + r() * 0.4), r() * h, 2.5, 4, 0, 0, 2 * PI); g.fill(); }
        var seam = r() * h;
        g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(x, seam, bw, 2);
        g.fillStyle = "rgba(30,20,10,.8)"; g.fillRect(x + 3, seam - 6, 2, 2); g.fillRect(x + bw - 5, seam - 6, 2, 2);
        g.fillStyle = "rgba(0,0,0,.6)"; g.fillRect(x, 0, 2, h);
        g.fillStyle = "rgba(255,255,255,.1)"; g.fillRect(x + 2, 0, 1, h);
      }
    };
  }
  function shingles(base, rows, cols) {
    return function (g, w, h, r) {
      g.fillStyle = jit(base, r, 0) ; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(0, 0, w, h);
      var th = h / rows, tw = w / cols;
      for (var row = 0; row < rows; row++) {
        var off = row % 2 ? tw / 2 : 0;
        for (var c = -1; c <= cols; c++) {
          var x = c * tw + off + 1, y = row * th, ww = tw - 2, hh = th * 1.05, rad = ww * 0.32;
          var col = jit(base, r, 0.26), gr = g.createLinearGradient(0, y, 0, y + hh);
          gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,.35)");
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + ww, y); g.lineTo(x + ww, y + hh - rad);
          g.quadraticCurveTo(x + ww, y + hh, x + ww - rad, y + hh); g.lineTo(x + rad, y + hh);
          g.quadraticCurveTo(x, y + hh, x, y + hh - rad); g.closePath();
          g.fillStyle = col; g.fill(); g.fillStyle = gr; g.fill();
          g.fillStyle = "rgba(255,255,255,.14)"; g.fillRect(x + 2, y + 1, ww - 4, 2);
        }
      }
      speckle(g, w, h, r, 1500, ["#000000", "#ffffff"], 0.1, 2);
      blotch(g, w, h, r, 10, ["#4a5a3a", "#d8d0b0"], 0.12, 20, 50);
    };
  }
  function cloth(base, stripe, edge) {
    return function (g, w, h, r) {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      for (var y = 0; y < h; y += 2) { g.fillStyle = "rgba(0,0,0," + (0.02 + r() * 0.04) + ")"; g.fillRect(0, y, w, 1); }
      for (var x = 0; x < w; x += 2) { g.fillStyle = "rgba(255,255,255," + (r() * 0.04) + ")"; g.fillRect(x, 0, 1, h); }
      [[0.18, 0.12], [0.62, 0.12]].forEach(function (b) {
        g.fillStyle = stripe; g.fillRect(0, b[0] * h, w, b[1] * h);
        g.fillStyle = edge; g.fillRect(0, b[0] * h - 3, w, 3); g.fillRect(0, (b[0] + b[1]) * h, w, 3);
      });
      blotch(g, w, h, r, 14, ["#7a6a48", "#ffffff"], 0.1, 20, 60);
    };
  }
  function halfTimber(plaster, beam) {
    return function (g, w, h, r) {
      g.fillStyle = plaster; g.fillRect(0, 0, w, h);
      blotch(g, w, h, r, 18, ["#b8a888", "#ffffff"], 0.22, 14, 50);
      speckle(g, w, h, r, 1500, ["#8a7a5a"], 0.2, 2);
      var bw = 15;
      function bar(x1, y1, x2, y2) {
        g.strokeStyle = beam; g.lineWidth = bw; g.lineCap = "butt";
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      }
      bar(bw / 2, 0, bw / 2, h); bar(0, bw / 2, w, bw / 2); bar(0, h - bw / 2, w, h - bw / 2); bar(0, h * 0.5, w, h * 0.5);
      bar(bw, h * 0.5, w * 0.45, bw); bar(w, h * 0.5, w * 0.55, bw); bar(w * 0.5, h * 0.5, w * 0.5, h);
      g.fillStyle = "rgba(0,0,0,.18)";
      for (var i = 0; i < 6; i++) g.fillRect(0, h * 0.5 + 8 + i * 3, w, 1);
    };
  }
  function bark(base) {
    return function (g, w, h, r) {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 70; i++) {
        var x = r() * w, ph = r() * 9, lw = 1 + r() * 3.5;
        g.strokeStyle = r() < 0.7 ? "rgba(25,15,8,.55)" : "rgba(255,230,190,.14)"; g.lineWidth = lw;
        g.beginPath(); g.moveTo(x, 0);
        for (var y = 0; y <= h; y += 12) g.lineTo(x + Math.sin(y * 0.04 + ph) * 4, y);
        g.stroke();
      }
      blotch(g, w, h, r, 10, ["#4a6a3a"], 0.25, 15, 40);
    };
  }
  function logEnd() {
    return function (g, w, h, r) {
      g.fillStyle = "#c79a62"; g.fillRect(0, 0, w, h);
      for (var k = 1; k < 9; k++) { g.strokeStyle = "rgba(90,55,25,.45)"; g.lineWidth = 1.5; g.beginPath(); g.arc(w / 2, h / 2, k * w / 18, 0, 2 * PI); g.stroke(); }
      g.strokeStyle = "#5a3c22"; g.lineWidth = 8; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, 2 * PI); g.stroke();
    };
  }
  function ripple() {
    return function (g, w, h, r) {
      g.fillStyle = "#2a78b6"; g.fillRect(0, 0, w, h);
      blotch(g, w, h, r, 14, ["#1d5f96", "#3d93cf"], 0.5, 30, 80);
      for (var i = 0; i < 80; i++) {
        var x = r() * w, y = r() * h, l = 20 + r() * 40;
        g.strokeStyle = r() < 0.6 ? "rgba(170,225,255,.5)" : "rgba(10,40,80,.3)"; g.lineWidth = 1.5 + r() * 1.5;
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 4, x + l, y); g.stroke();
      }
      speckle(g, w, h, r, 120, ["#ffffff"], 0.7, 2);
    };
  }
  function straw() {
    return function (g, w, h, r) {
      g.fillStyle = "#c9a24e"; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 2200; i++) {
        var x = r() * w, y = r() * h, l = 6 + r() * 14;
        g.strokeStyle = rgba(["#e8c870", "#a17a32", "#f2dc94"][(r() * 3) | 0], 0.7); g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y + l); g.stroke();
      }
    };
  }
  function iron() { return function (g, w, h, r) { g.fillStyle = "#3b3633"; g.fillRect(0, 0, w, h); speckle(g, w, h, r, 2500, ["#1a1816", "#6a5a4e", "#7a4a2a"], 0.4, 2); }; }
  function banner(color, trim, emblem) {
    return function (g, w, h) {
      g.clearRect(0, 0, w, h);
      g.beginPath(); g.moveTo(6, 0); g.lineTo(w - 6, 0); g.lineTo(w - 6, h - 20); g.lineTo(w / 2, h - 64); g.lineTo(6, h - 20); g.closePath();
      g.fillStyle = color; g.fill();
      g.strokeStyle = trim; g.lineWidth = 7; g.stroke();
      g.fillStyle = trim; g.fillRect(6, 0, w - 12, 20);
      for (var i = 0; i < 5; i++) { g.fillStyle = "rgba(0,0,0," + (i % 2 ? 0.12 : 0.04) + ")"; g.fillRect(8 + i * (w - 16) / 5, 20, (w - 16) / 5, h - 40); }
      g.save(); g.translate(w / 2, h * 0.42); g.strokeStyle = trim; g.fillStyle = trim; g.lineWidth = 8; g.lineCap = "round";
      if (emblem === "air") {
        [-22, 0, 22].forEach(function (y, i) { g.beginPath(); g.moveTo(-34 + i * 6, y); g.bezierCurveTo(-10, y - 16, 10, y + 16, 30 - i * 4, y - 6); g.stroke(); });
      } else if (emblem === "water") {
        [-14, 16].forEach(function (y) { g.beginPath(); g.moveTo(-36, y); for (var x = -36; x <= 36; x += 4) g.lineTo(x, y + Math.sin(x / 7) * 7); g.stroke(); });
      } else if (emblem === "fire") {
        g.beginPath(); g.moveTo(0, -42); g.bezierCurveTo(22, -14, 30, 4, 22, 22); g.bezierCurveTo(16, 36, -16, 36, -22, 22);
        g.bezierCurveTo(-28, 6, -14, -6, -6, -14); g.bezierCurveTo(-4, -2, 4, 2, 6, -6); g.bezierCurveTo(10, -20, 4, -30, 0, -42); g.fill();
      } else {
        g.beginPath(); g.ellipse(0, 0, 18, 38, 0.5, 0, 2 * PI); g.fill();
        g.strokeStyle = color; g.lineWidth = 4; g.beginPath(); g.moveTo(-14, 26); g.lineTo(14, -26); g.stroke();
      }
      g.restore();
    };
  }
  function dot(core, edge) {
    return function (g, w, h) {
      var gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, core); gr.addColorStop(1, edge);
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    };
  }

  var TEX = {
    grassAir: [512, 512, grass("#86b852", "#5a8a36", "#bcd97a")],
    grassWater: [512, 512, grass("#6fae66", "#467f4a", "#a2d38a")],
    grassFire: [512, 512, grass("#98a24c", "#6c7330", "#cbc276")],
    grassEarth: [512, 512, moss("#4a8541", "#2b5a2b", "#7cb25a")],
    sideAir: [512, 180, strata("#5f8f36")],
    sideWater: [512, 180, strata("#4f8a44")],
    sideFire: [512, 180, strata("#6f7a30")],
    sideEarth: [512, 180, strata("#2f6a2e")],
    path: [256, 256, softEdge(dirt("#ae9064"))],
    dirt: [256, 256, dirt("#8e7350")],
    stoneGrey: [256, 256, stone("#a29b8e", "#4f4a43", 7, 4)],
    stoneBlue: [256, 256, stone("#97a3ab", "#4d5760", 7, 4)],
    stoneWarm: [256, 256, stone("#a8927c", "#56463a", 7, 4)],
    plankWarm: [256, 256, planks("#b9844f", 7)],
    plankDark: [256, 256, planks("#6c4729", 6)],
    bark: [256, 256, bark("#6a4a30")],
    barkTree: [256, 256, bark("#5a4230")],
    logEnd: [128, 128, logEnd()],
    canvas: [256, 256, cloth("#f1e5c4", "#e7b93a", "#2b2520")],
    shinglesBlue: [256, 256, shingles("#3f6caf", 8, 7)],
    shinglesRed: [256, 256, shingles("#b13b25", 8, 7)],
    shinglesTeal: [256, 256, shingles("#4f8f86", 8, 7)],
    halfTimber: [256, 256, halfTimber("#e9dcc0", "#4a2e1c")],
    water: [256, 256, ripple()],
    straw: [128, 128, straw()],
    iron: [128, 128, iron()],
    bannerAir: [128, 256, banner("#e8bf45", "#2a2622", "air")],
    bannerWater: [128, 256, banner("#2f5fa8", "#d2a35c", "water")],
    bannerFire: [128, 256, banner("#b3261e", "#eab43c", "fire")],
    bannerEarth: [128, 256, banner("#1f6b45", "#d4dadd", "earth")],
    ember: [64, 64, dot("rgba(255,230,160,1)", "rgba(255,120,30,0)")],
    smoke: [128, 128, dot("rgba(200,195,190,.85)", "rgba(200,195,190,0)")],
    glow: [128, 128, dot("rgba(140,255,170,.9)", "rgba(60,200,110,0)")]
  };
  var canvasCache = {};
  function canvasFor(key) {
    if (canvasCache[key]) return canvasCache[key];
    var d = TEX[key], c = document.createElement("canvas");
    c.width = d[0]; c.height = d[1];
    d[2](c.getContext("2d"), d[0], d[1], rng(hashStr(key)));
    return (canvasCache[key] = c);
  }
  function tex(key, rx, ry) {
    var t = new T3.CanvasTexture(canvasFor(key));
    t.wrapS = t.wrapT = T3.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.encoding = T3.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  }
  function M(key, rx, ry, extra) {
    return new T3.MeshStandardMaterial(Object.assign({ map: tex(key, rx, ry), roughness: 0.88, metalness: 0 }, extra || {}));
  }
  function lin(c) { return new T3.Color(c).convertSRGBToLinear(); }
  function C(color, extra) { return new T3.MeshStandardMaterial(Object.assign({ color: lin(color), roughness: 0.85, metalness: 0 }, extra || {})); }
  function E(color, emissive, k) { return new T3.MeshStandardMaterial({ color: lin(color), emissive: lin(emissive), emissiveIntensity: k == null ? 1 : k, roughness: 0.5 }); }

  /* ---------- builder ---------- */
  function B(scene) { this.g = new T3.Group(); scene.add(this.g); this.fx = []; this.rand = rng(hashStr(scene.uuid)); }
  B.prototype.add = function (geo, mat, x, y, z, o) {
    o = o || {};
    var m = new T3.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
    if (o.s) m.scale.set(o.s[0], o.s[1], o.s[2]);
    m.castShadow = !o.noCast; m.receiveShadow = !o.noReceive;
    (o.parent || this.g).add(m);
    return m;
  };
  B.prototype.box = function (w, h, d, mat, x, y0, z, o) { return this.add(new T3.BoxGeometry(w, h, d), mat, x, y0 + h / 2, z, o); };
  B.prototype.cyl = function (rt, rb, h, seg, mat, x, y0, z, o) { return this.add(new T3.CylinderGeometry(rt, rb, h, seg), mat, x, y0 + h / 2, z, o); };
  B.prototype.beam = function (a, b, r, mat, parent, seg) {
    var A = new T3.Vector3(a[0], a[1], a[2]), Bv = new T3.Vector3(b[0], b[1], b[2]);
    var d = Bv.clone().sub(A), len = d.length();
    var m = new T3.Mesh(new T3.CylinderGeometry(r, r, len, seg || 6), mat);
    m.position.copy(A).add(Bv).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), d.normalize());
    m.castShadow = true; m.receiveShadow = true;
    (parent || this.g).add(m);
    return m;
  };
  B.prototype.gable = function (o) {
    var grp = new T3.Group(); grp.position.set(o.x, o.y, o.z); grp.rotation.y = o.ry || 0; this.g.add(grp);
    var hw = o.wid / 2, half = hw + o.over, a = Math.atan2(o.rise, hw), S = half / Math.cos(a), t = o.thick || 0.08;
    var L = o.len + 2 * (o.overEnd == null ? o.over * 0.6 : o.overEnd);
    var cy = o.rise - (half / 2) * Math.tan(a) + t / 2;
    this.add(new T3.BoxGeometry(L, t, S), o.mat, 0, cy, half / 2, { rx: a, parent: grp });
    this.add(new T3.BoxGeometry(L, t, S), o.mat2 || o.mat, 0, cy, -half / 2, { rx: -a, parent: grp });
    var sh = new T3.Shape(); sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(0, o.rise); sh.closePath();
    var eg = new T3.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false });
    [-1, 1].forEach(function (s) { this.add(eg, o.gmat, s * (o.len / 2) - (s > 0 ? 0.06 : 0) + (s < 0 ? 0 : 0), 0, 0, { ry: PI / 2, parent: grp }); }, this);
    this.add(new T3.BoxGeometry(L + 0.06, 0.11, 0.11), o.ridge || C("#3a2416"), 0, o.rise + t + 0.02, 0, { parent: grp });
    return grp;
  };
  B.prototype.base = function (top, side) {
    var bottom = C("#21180f");
    this.add(new T3.BoxGeometry(6, 0.7, 6), [side, side, top, bottom, side, side], 0, -0.35, 0);
  };
  B.prototype.decal = function (key, x, z, w, d, ry) {
    var m = new T3.MeshStandardMaterial({ map: tex(key, 1, 1), transparent: true, depthWrite: false, roughness: 1 });
    return this.add(new T3.PlaneGeometry(w, d), m, x, 0.012, z, { rx: -PI / 2, rz: ry || 0, noCast: true });
  };
  B.prototype.rock = function (x, z, s, col) {
    var m = this.add(new T3.DodecahedronGeometry(s, 0), C(col || "#8d877c", { flatShading: true }), x, s * 0.35, z,
      { s: [1, 0.65 + this.rand() * 0.3, 0.9], ry: this.rand() * PI, rx: (this.rand() - 0.5) * 0.4 });
    return m;
  };
  B.prototype.bush = function (x, z, s, col) {
    var mat = C(col || "#3f7a36", { flatShading: true });
    this.add(new T3.IcosahedronGeometry(s, 0), mat, x, s * 0.7, z, { s: [1, 0.8, 1] });
    this.add(new T3.IcosahedronGeometry(s * 0.7, 0), mat, x + s * 0.6, s * 0.5, z + s * 0.3);
    this.add(new T3.IcosahedronGeometry(s * 0.6, 0), C("#5c9a45", { flatShading: true }), x - s * 0.3, s * 1.05, z + s * 0.2);
  };
  B.prototype.tuft = function (x, z, col) {
    var mat = C(col || "#4e8a34", { flatShading: true });
    for (var i = 0; i < 4; i++) {
      var a = i * 1.7;
      this.add(new T3.ConeGeometry(0.03, 0.22 + this.rand() * 0.12, 3), mat, x + Math.cos(a) * 0.05, 0.12, z + Math.sin(a) * 0.05,
        { rz: Math.cos(a) * 0.35, rx: Math.sin(a) * 0.35, noCast: true });
    }
  };
  B.prototype.pine = function (x, z, s) {
    this.cyl(0.06 * s, 0.09 * s, 0.4 * s, 6, C("#5a3d24"), x, 0, z);
    var cols = ["#2a5a32", "#326a3a", "#3b7a42"];
    for (var i = 0; i < 3; i++) {
      this.add(new T3.ConeGeometry((0.55 - i * 0.13) * s, (0.75 - i * 0.1) * s, 7), C(cols[i], { flatShading: true }), x, (0.6 + i * 0.38) * s, z, { ry: i });
    }
  };
  B.prototype.oak = function (x, z, s) {
    this.cyl(0.08 * s, 0.13 * s, 0.75 * s, 7, M("barkTree", 1, 1), x, 0, z);
    var cols = ["#3f7a38", "#4a8a3e", "#346b30"];
    [[0, 1.05, 0, 0.5], [0.28, 0.9, 0.12, 0.36], [-0.25, 0.92, -0.1, 0.38], [0.05, 1.32, 0.05, 0.34]].forEach(function (b, i) {
      this.add(new T3.IcosahedronGeometry(b[3] * s, 0), C(cols[i % 3], { flatShading: true }), x + b[0] * s, b[1] * s, z + b[2] * s, { ry: i });
    }, this);
  };
  B.prototype.barrel = function (x, z) {
    this.cyl(0.15, 0.15, 0.36, 12, M("plankWarm", 1, 0.4), x, 0, z);
    var im = C("#3a3530", { metalness: 0.5, roughness: 0.6 });
    [0.07, 0.29].forEach(function (y) { this.add(new T3.TorusGeometry(0.152, 0.012, 6, 20), im, x, y, z, { rx: PI / 2 }); }, this);
  };
  B.prototype.crate = function (x, z, s, ry) {
    var m = M("plankWarm", 0.6, 0.6);
    this.box(s, s, s, m, x, 0, z, { ry: ry || 0 });
  };
  B.prototype.hay = function (x, z, ry) {
    var st = M("straw", 2, 1), end = M("straw", 1, 1);
    this.add(new T3.CylinderGeometry(0.2, 0.2, 0.42, 14), [st, end, end], x, 0.2, z, { rz: PI / 2, ry: ry || 0 });
  };
  B.prototype.logs = function (x, z, ry) {
    var grp = new T3.Group(); grp.position.set(x, 0, z); grp.rotation.y = ry || 0; this.g.add(grp);
    var mats = [M("bark", 1, 1), M("logEnd"), M("logEnd")];
    [[-0.13, 0.08], [0, 0.08], [0.13, 0.08], [-0.065, 0.2], [0.065, 0.2], [0, 0.32]].forEach(function (p) {
      this.add(new T3.CylinderGeometry(0.07, 0.07, 0.7, 9), mats, p[0], p[1], 0, { rx: PI / 2, parent: grp });
    }, this);
  };
  B.prototype.banner = function (x, z, y0, key, h) {
    h = h || 1.8;
    var pole = C("#3a2818");
    this.cyl(0.03, 0.035, h, 8, pole, x, y0, z);
    this.add(new T3.SphereGeometry(0.05, 10, 8), C("#c9a24e", { metalness: 0.6, roughness: 0.35 }), x, y0 + h + 0.03, z);
    this.box(0.5, 0.035, 0.035, pole, x, y0 + h - 0.12, z);
    var pivot = new T3.Group(); pivot.position.set(x, y0 + h - 0.14, z + 0.03); this.g.add(pivot);
    var mat = new T3.MeshStandardMaterial({ map: tex(key), transparent: true, alphaTest: 0.5, side: T3.DoubleSide, roughness: 0.9 });
    this.add(new T3.PlaneGeometry(0.44, 0.88), mat, 0, -0.44, 0, { parent: pivot });
    var ph = this.rand() * 6;
    this.fx.push(function (t) { pivot.rotation.y = Math.sin(t * 1.3 + ph) * 0.18; pivot.rotation.x = Math.sin(t * 0.9 + ph) * 0.04; });
  };
  B.prototype.window = function (x, y, z, ry, w, h, glass, glow, shutters) {
    var grp = new T3.Group(); grp.position.set(x, y, z); grp.rotation.y = ry || 0; this.g.add(grp);
    var frame = C("#3a2416");
    this.add(new T3.BoxGeometry(w + 0.1, h + 0.1, 0.06), frame, 0, 0, 0, { parent: grp });
    var pane = E(glass, glow, 0.9);
    this.add(new T3.BoxGeometry(w, h, 0.03), pane, 0, 0, 0.03, { parent: grp, noCast: true });
    this.add(new T3.BoxGeometry(0.035, h, 0.04), frame, 0, 0, 0.04, { parent: grp });
    this.add(new T3.BoxGeometry(w, 0.035, 0.04), frame, 0, 0, 0.04, { parent: grp });
    this.add(new T3.BoxGeometry(w + 0.18, 0.05, 0.12), frame, 0, -h / 2 - 0.06, 0.04, { parent: grp });
    if (shutters) {
      var sm = C(shutters, { roughness: 0.8 });
      this.add(new T3.BoxGeometry(w / 2, h + 0.08, 0.03), sm, -w * 0.78, 0, 0.1, { ry: 0.5, parent: grp });
      this.add(new T3.BoxGeometry(w / 2, h + 0.08, 0.03), sm, w * 0.78, 0, 0.1, { ry: -0.5, parent: grp });
    }
    return pane;
  };

