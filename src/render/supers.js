// The superweapons on the map, staged like the climax they are. Every strike has an anticipation,
// an impact and an aftermath:
//   Great Tempest   the sky darkens under a turning storm with an eye of light; a twisting funnel
//                   roams the circle with dust and debris; wind streaks race round it; lightning
//                   strikes again and again, each bolt flashing and scorching the ground
//   Moonfall Tide   a moon rises over the circle and the light turns silver; a column of sea falls
//                   from the sky, bursts into a crown of spray, and a curling ring wave with a foam
//                   crest rolls out to the edge, darkening the ground behind it; a rippling flood
//                   stays for 30 s
//   Phoenix Strike  a pillar of flame at the forge as the phoenix rises; it flies on a ribbon of
//                   fire, dives, and bursts: white flash, layered fireball, shockwave, a column of
//                   flame and a mushroom of smoke, flying debris and falling embers; the circle
//                   burns, smokes and stays scorched
//   Great Quake     a spectral titan's fist slams into the middle; glowing cracks run out across
//                   the circle, rock erupts and rains down, dust rolls; aftershocks pulse; a
//                   rune-lit ring of rock rises round the edge and sinks again 30 s later
// Everything follows the simulation (world.supers, floods, ridges, burns), so a loaded match
// shows what is still going on; flashes, debris and marks are only for show.
import * as THREE from 'three';
import { TILE } from './art.js';

const lin = c => new THREE.Color(c).convertSRGBToLinear();
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
const ease = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);

// ---------- textures, drawn once ----------
function canvasTex(w, h, draw, wrap = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const TEX = {};
function textures() {
  if (TEX.soft) return TEX;
  TEX.soft = canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  TEX.puff = canvasTex(128, 128, g => { for (let i = 0; i < 9; i++) { const x = 64 + rnd(-26, 26), y = 64 + rnd(-22, 22), r = rnd(22, 40), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); } });
  TEX.streak = canvasTex(64, 256, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 46; i++) { const x = rnd(0, w), y = rnd(0, h), l = rnd(30, 120); g.fillStyle = `rgba(255,255,255,${rnd(0.25, 0.8)})`; g.fillRect(x, y, rnd(1, 3), l); g.fillRect(x, y - h, rnd(1, 3), l); } }, true);
  TEX.water = canvasTex(128, 128, (g, w) => { g.fillStyle = '#3d8fd0'; g.fillRect(0, 0, w, w); for (let i = 0; i < 70; i++) { const x = rnd(0, w), y = rnd(0, w), l = rnd(10, 26); g.strokeStyle = Math.random() < 0.6 ? 'rgba(210,240,255,.7)' : 'rgba(20,70,130,.4)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); } }, true);
  TEX.spiral = canvasTex(256, 256, g => { g.translate(128, 128); for (let arm = 0; arm < 4; arm++) { g.rotate(Math.PI / 2); g.beginPath(); for (let t = 0; t < 1; t += 0.01) { const r = t * 124, a = t * 5.5; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 14; g.stroke(); } });
  TEX.scorch = canvasTex(256, 256, g => { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(20,10,4,0.95)'); gr.addColorStop(0.6, 'rgba(40,20,8,0.75)'); gr.addColorStop(1, 'rgba(40,20,8,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 26; i++) { const a = rnd(0, 6.28), r = rnd(50, 105), x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r, rr = rnd(14, 30), b = g.createRadialGradient(x, y, 0, x, y, rr); b.addColorStop(0, 'rgba(15,8,2,0.35)'); b.addColorStop(1, 'rgba(15,8,2,0)'); g.fillStyle = b; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } });
  TEX.wet = canvasTex(128, 128, g => { const gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(30,60,90,0.55)'); gr.addColorStop(0.85, 'rgba(30,60,90,0.45)'); gr.addColorStop(1, 'rgba(30,60,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  TEX.cracks = canvasTex(512, 512, g => {
    g.translate(256, 256); g.lineCap = 'round';
    const branch = (x, y, a, len, wdt, depth) => { let px = x, py = y; for (let s = 0; s < 6; s++) { const nx = px + Math.cos(a) * len / 6, ny = py + Math.sin(a) * len / 6; g.lineWidth = wdt * (1 - s / 8); g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke(); px = nx; py = ny; a += rnd(-0.35, 0.35); if (depth < 2 && Math.random() < 0.25) branch(px, py, a + rnd(-1, 1), len * 0.45, wdt * 0.6, depth + 1); } };
    for (const [col, wd] of [['rgba(80,255,150,0.35)', 14], ['rgba(200,255,220,0.95)', 4]]) { g.strokeStyle = col; for (let i = 0; i < 11; i++) branch(0, 0, i / 11 * 6.28 + rnd(-0.15, 0.15), rnd(170, 250), wd, 0); }
    g.strokeStyle = 'rgba(200,255,220,0.8)'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 238, 0, 7); g.stroke();
  });
  return TEX;
}

export class SuperFx {
  constructor(view) {
    this.v = view; this.scene = view.scene; textures();
    this.live = new Map(); // weapon in use -> its visuals
    this.floods = new Map(); this.ridges = new Map(); this.blazes = new Map();
    this.puffs = []; this.debris = []; this.marks = []; this.timed = [];
    this.dim = { k: 0, want: 0, base: null, tint: lin('#3a4258') };
    this.sound = () => {};
    this.flameMats = ['#e8400a', '#ff6a14', '#ffa020'].map(c => new THREE.MeshBasicMaterial({ color: lin(c), transparent: true, opacity: 0.85, depthWrite: false }));
    this.rockMat = new THREE.MeshStandardMaterial({ color: lin('#7d7466'), roughness: 0.95, flatShading: true });
    this.runeRock = new THREE.MeshStandardMaterial({ color: lin('#6f7a6a'), emissive: lin('#2aff7a'), emissiveIntensity: 0.25, roughness: 0.9, flatShading: true });
    this.chunkGeo = new THREE.DodecahedronGeometry(0.3, 0);
    // A full-screen flash over the canvas.
    const host = view.renderer.domElement.parentElement;
    this.flashEl = document.createElement('div');
    Object.assign(this.flashEl.style, { position: 'absolute', inset: '0', pointerEvents: 'none', opacity: '0', zIndex: '3', mixBlendMode: 'screen' });
    host?.appendChild(this.flashEl);
    this.flashK = 0;
  }
  w() { return this.v.world; }
  at(x, y) { return this.v.toWorld(x, y); }

  // ---------- shared pieces ----------
  flash(color, k) { this.flashEl.style.background = color; this.flashK = Math.max(this.flashK, k); }
  puff(x, y, z, o = {}) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.puff, color: lin(o.color || '#d8ccb4'), transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(x, y, z); m.scale.setScalar(o.size || 2); this.scene.add(m);
    this.puffs.push({ m, t: 0, life: o.life || 2.5, grow: o.grow ?? 1.8, rise: o.rise ?? 0.6, vx: o.vx || 0, vz: o.vz || 0, alpha: o.alpha ?? 0.8, size: o.size || 2, delay: o.delay || 0 });
  }
  glowBall(x, y, z, color, size, life, grow = 1) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.soft, color: lin(color), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set(x, y, z); m.scale.setScalar(size); this.scene.add(m);
    this.timed.push({ obj: m, t: 0, life, upd: k => { m.scale.setScalar(Math.max(0.01, size * (1 + k * grow))); m.material.opacity = 1 - k; } });
  }
  chunks(x, z, n, spread, power, mat) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(this.chunkGeo, mat || this.rockMat), a = rnd(0, 6.28), r = rnd(0, spread);
      m.position.set(x + Math.cos(a) * r, 0.2, z + Math.sin(a) * r); m.scale.setScalar(rnd(0.5, 1.5)); m.castShadow = true; this.scene.add(m);
      this.debris.push({ m, vx: Math.cos(a) * rnd(0.5, 2.5), vy: rnd(power * 0.6, power), vz: Math.sin(a) * rnd(0.5, 2.5), rx: rnd(-6, 6), ry: rnd(-6, 6) });
    }
  }
  mark(x, z, r, tex, life, opts = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, color: lin(opts.color || '#ffffff'), blending: opts.add ? THREE.AdditiveBlending : THREE.NormalBlending }));
    m.position.set(x, 0.045 + (opts.lift || 0), z); m.rotation.y = rnd(0, 6.28); m.renderOrder = 2; this.scene.add(m);
    const o = { m, t: 0, life, fadeIn: opts.fadeIn ?? 0.4, alpha: opts.alpha ?? 1 };
    this.marks.push(o); return o;
  }
  ringWave(x, z, R, color, time) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.88, 1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: lin(color), transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
    m.position.set(x, 0.1, z); this.scene.add(m);
    this.timed.push({ obj: m, t: 0, life: time, upd: k => { const r = 0.4 + ease(k) * R; m.scale.set(r, 1, r); m.material.opacity = 0.9 * (1 - k); } });
  }
  // A tall column of light or fire that flares and fades.
  pillar(x, z, color, radius, height, life) {
    const geo = new THREE.CylinderGeometry(radius * 0.7, radius, height, 24, 8, true); geo.translate(0, height / 2, 0);
    const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3), c = lin(color);
    for (let i = 0; i < pos.count; i++) { const k = Math.pow(1 - pos.getY(i) / height, 1.4); cols[i * 3] = c.r * k; cols[i * 3 + 1] = c.g * k; cols[i * 3 + 2] = c.b * k; }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.position.set(x, 0, z); this.scene.add(m);
    this.timed.push({ obj: m, t: 0, life, upd: k => { m.material.opacity = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85; m.scale.set(1 + k * 0.6, 0.4 + ease(k * 3) * 0.6, 1 + k * 0.6); m.rotation.y += 0.05; } });
  }
  // A lightning bolt from the clouds to a point, with branches; it flickers and is gone.
  bolt(x, z, top = 8.5) {
    const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: lin('#fff8d8'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const seg = (a, b, r) => { const d = new THREE.Vector3().subVectors(b, a), len = d.length(), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 4, 1, true), mat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); };
    let p = new THREE.Vector3(x + rnd(-1.5, 1.5), top, z + rnd(-1.5, 1.5));
    const pts = [p.clone()];
    for (let i = 1; i <= 8; i++) { const k = i / 8, q = new THREE.Vector3(p.x + (x - p.x) * (1 / (9 - i)) + rnd(-0.6, 0.6), top * (1 - k), p.z + (z - p.z) * (1 / (9 - i)) + rnd(-0.6, 0.6)); if (i === 8) q.set(x, 0, z); seg(p, q, 0.07); pts.push(q.clone()); p = q; }
    for (let b = 0; b < 2; b++) { let s = pts[2 + b * 3].clone(); for (let i = 0; i < 3; i++) { const q = s.clone().add(new THREE.Vector3(rnd(-1, 1), -rnd(0.6, 1.2), rnd(-1, 1))); seg(s, q, 0.035); s = q; } }
    this.scene.add(g);
    this.timed.push({ obj: g, t: 0, life: 0.32, upd: k => { mat.opacity = (k < 0.5 ? 1 : 0.3) * (Math.sin(k * 40) > -0.3 ? 1 : 0.2); } });
    this.glowBall(x, 0.6, z, '#fff4c0', 2.5, 0.35, 1.5);
    this.v.magic.emit('air', x, z, { n: 14, radius: 0.4, speed: 2.5, life: 0.6, size: 1 });
    this.mark(x, z, 0.9, TEX.scorch, 8, { alpha: 0.7, fadeIn: 0.05 });
    this.flash('#e8f0ff', 0.28);
    this.sound('thunder', 0.5);
  }
  setDim(want, tint) { this.dim.want = Math.max(this.dim.want, want); if (tint) this.dim.tint = lin(tint); }

  // ---------- the look of each weapon ----------
  tempest(s) {
    const g = new THREE.Group(), R = s.r * TILE;
    // The storm canopy: soft dark clouds turning over the circle, with a bright eye.
    const canopy = new THREE.Group(); g.add(canopy);
    const clouds = [];
    for (let k = 0; k < 34; k++) {
      const a = k / 34 * Math.PI * 2 + rnd(-0.1, 0.1), rr = R * rnd(0.35, 1.05), m = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.puff, color: lin(k % 3 ? '#5c6678' : '#7a8498'), transparent: true, opacity: 0, depthWrite: false }));
      m.position.set(Math.cos(a) * rr, rnd(7.8, 9), Math.sin(a) * rr); const sz = rnd(4, 6.5); m.scale.set(sz, sz * 0.55, 1); canopy.add(m); clouds.push(m);
    }
    const eye = new THREE.Mesh(new THREE.CircleGeometry(R * 0.45, 32).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ map: TEX.spiral, color: lin('#dfe8ff'), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    eye.position.y = 8.3; canopy.add(eye);
    // The ground swirl.
    const swirl = new THREE.Mesh(new THREE.CircleGeometry(R, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TEX.spiral, color: lin('#e8f0ff'), transparent: true, opacity: 0, depthWrite: false }));
    swirl.position.y = 0.07; g.add(swirl);
    // The funnel: two twisting layers of streaked wind on a flared profile.
    const prof = [], N = 14;
    for (let i = 0; i <= N; i++) { const t = i / N; prof.push(new THREE.Vector2(0.5 + Math.pow(t, 1.7) * 3.8, t * 8.2)); }
    const cyc = new THREE.Group(); g.add(cyc);
    const layers = [['#d8e0ee', 1, 0.75], ['#8e9ab2', 0.8, 0.9]].map(([c, sc, op], i) => {
      const tex = TEX.streak.clone(); tex.needsUpdate = true; tex.repeat.set(3, 1);
      const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), new THREE.MeshStandardMaterial({ color: lin(c), map: tex, alphaMap: tex, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, emissive: lin('#30384c'), emissiveIntensity: 0.4 }));
      m.scale.set(sc, 1, sc); cyc.add(m); return { m, tex, sp: i ? -1.4 : 2.2 };
    });
    const debris = [];
    for (let k = 0; k < 22; k++) { const d = new THREE.Mesh(k % 4 ? this.chunkGeo : new THREE.BoxGeometry(0.1, 0.1, 0.5), new THREE.MeshStandardMaterial({ color: lin(['#6b4a2c', '#3f7a34', '#7d7466', '#8a6a3a'][k % 4]), flatShading: true })); d.scale.setScalar(rnd(0.35, 0.8)); cyc.add(d); debris.push({ d, a: rnd(0, 6.28), r: rnd(0.8, 2.6), y: rnd(0.3, 7), sp: rnd(2.5, 5) }); }
    // Wind streaks racing round the circle.
    const streaks = [];
    for (let k = 0; k < 8; k++) { const m = new THREE.Mesh(new THREE.TorusGeometry(R * rnd(0.5, 1), 0.04, 4, 40, rnd(0.6, 1.3)), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false })); m.rotation.x = Math.PI / 2; m.position.y = rnd(0.6, 4); g.add(m); streaks.push({ m, sp: rnd(1.5, 3.5) }); }
    return { g, canopy, clouds, eye, swirl, cyc, layers, debris, streaks, kind: 'tempest', nextBolt: 0.8 };
  }
  wave() {
    const g = new THREE.Group();
    // The moon over the circle, and the column of sea that falls from it.
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.soft, color: lin('#dcecff'), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    moon.position.y = 13; moon.scale.setScalar(7); g.add(moon);
    const ctex = TEX.streak.clone(); ctex.needsUpdate = true; ctex.repeat.set(4, 1.5);
    const column = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.6, 13, 24, 1, true), new THREE.MeshStandardMaterial({ color: lin('#5ab4f0'), map: ctex, emissive: lin('#1a5a9a'), emissiveIntensity: 0.5, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
    g.add(column);
    // The ring wave: a curling cross-section turned round the centre.
    const wtex = TEX.water.clone(); wtex.needsUpdate = true; wtex.repeat.set(16, 1);
    const wave = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: lin('#7ac8f4'), map: wtex, emissive: lin('#1a5a9a'), emissiveIntensity: 0.35, roughness: 0.15, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }));
    g.add(wave);
    const foam = [];
    for (let k = 0; k < 44; k++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.puff, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })); m.scale.setScalar(rnd(0.8, 1.4)); g.add(m); foam.push({ m, a: k / 44 * Math.PI * 2, ph: rnd(0, 6) }); }
    return { g, moon, column, ctex, wave, wtex, foam, kind: 'tide', splashed: false };
  }
  phoenix() {
    const g = new THREE.Group();
    const fire = new THREE.MeshStandardMaterial({ color: lin('#ffb060'), emissive: lin('#ff5a10'), emissiveIntensity: 2, flatShading: true });
    const gold = new THREE.MeshStandardMaterial({ color: lin('#ffe080'), emissive: lin('#ffa020'), emissiveIntensity: 1.2, metalness: 0.4, roughness: 0.3, flatShading: true });
    g.scale.setScalar(2.6);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), fire); body.scale.set(1.7, 0.8, 0.8); g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), gold); head.position.set(0.8, 0.22, 0); g.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 5), gold); beak.rotation.z = -Math.PI / 2; beak.position.set(1.1, 0.18, 0); g.add(beak);
    for (let c = 0; c < 3; c++) { const cr = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.35, 4), fire); cr.position.set(0.72 - c * 0.08, 0.5, 0); cr.rotation.z = 0.4 + c * 0.2; g.add(cr); }
    const wings = [];
    for (const s of [-1, 1]) {
      const wg = new THREE.Group(); wg.position.set(0, 0.1, s * 0.3); g.add(wg);
      for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.14, 2.2 - k * 0.22, 4), k % 2 ? gold : fire); f.rotation.x = s * Math.PI / 2; f.rotation.z = -0.15 * k; f.position.set(0.15 - 0.2 * k, 0, s * (1.05 - k * 0.06)); wg.add(f); }
      wings.push([wg, s]);
    }
    for (let k = 0; k < 5; k++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.1, 1.8, 4), k % 2 ? gold : fire); t.rotation.z = Math.PI / 2 - (k - 2) * 0.05; t.position.set(-1.4, -0.05, (k - 2) * 0.18); g.add(t); }
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.soft, color: lin('#ff9a30'), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(2.4); g.add(halo);
    return { g, wings, kind: 'phoenix', trailT: 0 };
  }

  // ---------- aiming: the circle the player is about to strike ----------
  preview(x, y, r, color) {
    if (!this.aim) {
      const g = new THREE.Group();
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, depthWrite: false }));
      const rim = new THREE.Mesh(new THREE.RingGeometry(0.95, 1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false }));
      const inner = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 64, 1, 0, Math.PI * 1.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }));
      disc.position.y = 0.07; rim.position.y = 0.08; inner.position.y = 0.085; inner.scale.setScalar(0.82);
      disc.renderOrder = rim.renderOrder = inner.renderOrder = 5; g.add(disc, rim, inner); this.scene.add(g);
      this.aim = { g, disc, rim, inner };
    }
    const [wx, wz] = this.at(x, y);
    this.aim.g.position.set(wx, 0, wz); this.aim.g.scale.set(r * TILE, 1, r * TILE); this.aim.g.visible = true;
    for (const m of [this.aim.disc, this.aim.rim, this.aim.inner]) m.material.color.set(lin(color));
  }
  clearPreview() { if (this.aim) this.aim.g.visible = false; }

  // ---------- events ----------
  fired(ev) {
    const v = this.v, R = (ev.r || 6) * TILE, [cx, cz] = this.at(ev.x, ev.y), [wx, wz] = this.at(ev.x0, ev.y0);
    // Every Wonder sends a beam of its power up into the sky as it fires.
    const col = { tempest: '#ffe08a', tide: '#bfe4ff', phoenix: '#ff8a30', quake: '#7cffa8' }[ev.kind];
    this.pillar(wx, wz, col, 1.2, 16, 1.6);
    if (ev.kind === 'phoenix') { this.pillar(wx, wz, '#ff5a10', 2, 10, 1.2); v.magic.emit('fire', wx, wz, { n: 90, radius: 1.5, speed: 2.5, life: 1.4, size: 1.4 }); this.flash('#ffb060', 0.25); this.sound('flame', 0.7); }
    if (ev.kind === 'tempest') { v.shake = 0.5; this.sound('gust', 0.8); this.sound('thunder', 0.4); }
    if (ev.kind === 'tide') this.sound('splash', 0.5);
    if (ev.kind === 'quake') this.quakeImpact(cx, cz, R);
  }
  quakeImpact(cx, cz, R) {
    const v = this.v;
    // The titan's spectral fist slams into the middle.
    const fist = new THREE.Group(), fm = new THREE.MeshBasicMaterial({ color: lin('#7cffa8'), transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    fist.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 2, 2), fm));
    for (let f = 0; f < 4; f++) { const fg = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 2.1), fm); fg.position.set(-0.85 + f * 0.57, -1.2, 0.1); fist.add(fg); }
    const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.6), fm); thumb.position.set(1.4, -0.4, 0.8); fist.add(thumb);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 9, 8, 1, true), fm); arm.position.y = 5.5; fist.add(arm);
    fist.position.set(cx, 14, cz); this.scene.add(fist);
    let landed = false;
    this.timed.push({ obj: fist, t: 0, life: 1.1, upd: k => {
      const fall = Math.min(1, k / 0.32);
      fist.position.y = 14 - Math.pow(fall, 2) * 12.6;
      fm.opacity = k < 0.32 ? 0.75 : 0.75 * (1 - (k - 0.32) / 0.68);
      if (fall < 1 || landed) return;
      landed = true;
      this.flash('#b8ffd0', 0.45); v.shake = 1.6; this.sound('boom', 1); this.sound('rumble', 0.9);
      this.ringWave(cx, cz, R * 1.15, '#9affb8', 0.8);
      this.mark(cx, cz, R * 1.05, TEX.cracks, 34, { add: true, fadeIn: 0.5, color: '#9affb8' });
      this.mark(cx, cz, R, TEX.scorch, 34, { alpha: 0.35, fadeIn: 0.4 });
      this.chunks(cx, cz, 34, R * 0.9, 9);
      for (let i = 0; i < 16; i++) { const a = rnd(0, 6.28), r = rnd(0, R); this.puff(cx + Math.cos(a) * r, 0.5, cz + Math.sin(a) * r, { color: '#b8a888', size: rnd(2.5, 4), life: rnd(2, 3.5), delay: rnd(0, 0.4), rise: 0.4, alpha: 0.75 }); }
      for (let i = 0; i < 20; i++) { const a = i / 20 * 6.28; this.puff(cx + Math.cos(a) * R, 0.4, cz + Math.sin(a) * R, { color: '#c8b898', size: 2.4, life: 2.2, vx: Math.cos(a) * 1.2, vz: Math.sin(a) * 1.2, delay: 0.1 }); }
    } });
  }
  shock(ev) {
    const v = this.v, [cx, cz] = this.at(ev.x, ev.y), R = ev.r * TILE;
    v.shake = Math.max(v.shake, 0.8);
    this.ringWave(cx, cz, R, '#9affb8', 0.6);
    this.chunks(cx, cz, 10, R * 0.8, 5);
    for (let k = 0; k < 6; k++) { const a = rnd(0, 6.28), r = rnd(0, R); this.puff(cx + Math.cos(a) * r, 0.4, cz + Math.sin(a) * r, { color: '#b8a888', size: 2.5, life: 2 }); }
    this.flash('#b8ffd0', 0.12);
    this.sound('rumble', 0.6);
  }
  burst(ev) {
    const v = this.v, [x, z] = this.at(ev.x, ev.y), R = (ev.r || 6) * TILE;
    this.flash('#fff2d0', 0.75); v.shake = 1.8; this.sound('boom', 1);
    // The fireball: a white core, an orange shell and a red rim, each swelling and fading.
    for (const [c, s, life, gr] of [['#ffffff', 3, 0.35, 2], ['#ffd060', 4, 0.8, 2.2], ['#ff6a14', 5, 1.2, 1.9], ['#c8300a', 6, 1.6, 1.6]]) this.glowBall(x, 1.5, z, c, s, life, gr * R / 9);
    this.ringWave(x, z, R * 1.2, '#ffb040', 0.7);
    this.ringWave(x, z, R * 1.5, '#ffe0a0', 1.1);
    this.pillar(x, z, '#ff7a20', 2.2, 14, 2.2);
    v.magic.emit('fire', x, z, { n: 260, radius: R * 0.8, speed: 3.5, life: 2, size: 1.6 });
    this.chunks(x, z, 26, R * 0.7, 8, new THREE.MeshStandardMaterial({ color: lin('#3a2a1a'), emissive: lin('#ff4a10'), emissiveIntensity: 0.6, flatShading: true }));
    // A mushroom of smoke: a stem, then a spreading cap.
    for (let i = 0; i < 10; i++) this.puff(x + rnd(-0.6, 0.6), 1 + i * 0.7, z + rnd(-0.6, 0.6), { color: '#4a3a32', size: 2.6, life: 4.5, grow: 1.5, rise: 0.9, delay: 0.2 + i * 0.05, alpha: 0.7 });
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; this.puff(x + Math.cos(a) * 1.5, 8, z + Math.sin(a) * 1.5, { color: '#5a4a40', size: 3.5, life: 5, grow: 1.6, rise: 0.5, vx: Math.cos(a) * 1.4, vz: Math.sin(a) * 1.4, delay: 0.5, alpha: 0.65 }); }
    this.mark(x, z, R * 1.1, TEX.scorch, 40, { alpha: 0.85, fadeIn: 0.3 });
  }

  // ---------- every frame ----------
  update(dt, time) {
    const w = this.w(), v = this.v, seen = new Set();
    for (const s of w.supers || []) {
      seen.add(s);
      let fx = this.live.get(s);
      if (!fx) {
        fx = s.kind === 'tempest' ? this.tempest(s) : s.kind === 'tide' ? this.wave(s) : s.kind === 'phoenix' ? this.phoenix() : { kind: 'quake', g: new THREE.Group() };
        this.scene.add(fx.g); this.live.set(s, fx);
      }
      const k = Math.min(1, s.t / s.dur), [x, z] = this.at(s.x, s.y), R = s.r * TILE;
      if (fx.kind === 'tempest') {
        const grow = Math.max(0.001, Math.min(1, s.t / 1.5, (s.dur - s.t) / 1.5));
        this.setDim(0.85 * grow, '#3a4258');
        fx.g.position.set(x, 0, z);
        fx.canopy.rotation.y = time * 0.25;
        fx.clouds.forEach(c => { c.material.opacity = 0.92 * grow; });
        fx.eye.material.opacity = 0.35 * grow; fx.eye.rotation.y = -time * 0.8;
        fx.swirl.material.opacity = 0.22 * grow; fx.swirl.rotation.y = -time * 1.6;
        const [qx, qz] = this.at(s.cx, s.cy);
        fx.cyc.position.set(qx - x, 0, qz - z); fx.cyc.scale.set(grow, Math.max(0.001, Math.min(1, s.t / 0.8) * grow), grow);
        fx.layers.forEach(l => { l.m.rotation.y = time * l.sp; l.tex.offset.y = -time * 0.9; });
        fx.debris.forEach(d => { const a = d.a + time * d.sp, rr = d.r * (0.5 + d.y / 8); d.d.position.set(Math.cos(a) * rr * 1.4, d.y + Math.sin(time * 2 + d.a) * 0.3, Math.sin(a) * rr * 1.4); d.d.rotation.set(time * 4 + d.a, time * 3, 0); });
        fx.streaks.forEach(st => { st.m.rotation.z = time * st.sp; st.m.material.opacity = 0.5 * grow; });
        if (Math.random() < dt * 8 * grow) this.puff(qx + rnd(-1.5, 1.5), 0.4, qz + rnd(-1.5, 1.5), { color: '#c8bca4', size: 2, life: 1.4, vx: rnd(-2, 2), vz: rnd(-2, 2), alpha: 0.7 });
        fx.nextBolt -= dt;
        if (fx.nextBolt <= 0 && s.t < s.dur - 1) { fx.nextBolt = rnd(0.35, 0.85); const a = rnd(0, 6.28), r = Math.sqrt(Math.random()) * R * 0.95; this.bolt(x + Math.cos(a) * r, z + Math.sin(a) * r); }
      }
      if (fx.kind === 'tide') {
        fx.g.position.set(x, 0, z);
        this.setDim(0.7 * Math.min(1, s.t / 0.4, (s.dur + 1.5 - s.t) / 1.5), '#2a4a78');
        fx.moon.material.opacity = Math.min(1, s.t / 0.4) * (1 - k * 0.7);
        // 0 to 0.7 s: the sea falls; then the splash, and the ring wave rolls out.
        const fall = Math.min(1, s.t / 0.7);
        fx.column.visible = fall < 1; fx.ctex.offset.y = time * 3;
        fx.column.scale.set(1, Math.max(0.02, 1 - fall * 0.9), 1); fx.column.position.y = 13 * (1 - fall * 0.9) / 2 + (1 - fall) * 3;
        if (fall >= 1 && !fx.splashed) {
          fx.splashed = true;
          this.flash('#cfe8ff', 0.4); v.shake = 1.2; this.sound('splash', 1); this.sound('boom', 0.6);
          v.magic.emit('water', x, z, { n: 220, radius: 2, speed: 5, life: 1.6, size: 1.6, up: 2.5 });
          this.glowBall(x, 1, z, '#cfe8ff', 4, 0.6, 2);
          // The crown of spray.
          const crown = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.6, 3, 24, 1, true), new THREE.MeshStandardMaterial({ color: lin('#bfe4ff'), map: fx.ctex, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
          crown.position.set(x, 1.5, z); this.scene.add(crown);
          this.timed.push({ obj: crown, t: 0, life: 1.2, upd: kk => { crown.scale.set(1 + kk * 2.5, 1 + Math.sin(kk * Math.PI) * 1.2, 1 + kk * 2.5); crown.material.opacity = 0.8 * (1 - kk); } });
          for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; this.puff(x + Math.cos(a) * 1.5, 0.6, z + Math.sin(a) * 1.5, { color: '#e8f6ff', size: 2.5, life: 1.8, vx: Math.cos(a) * 4, vz: Math.sin(a) * 4, alpha: 0.85 }); }
        }
        const wk = Math.max(0, (s.t - 0.7) / (s.dur - 0.7)), front = 0.6 + ease(wk) * (R + 0.6), h = fall < 1 ? 0.001 : Math.sin(Math.min(1, wk * 1.1) * Math.PI) * 2.8 + 0.3;
        fx.wave.visible = fall >= 1 && wk < 1;
        if (fx.wave.visible) {
          // The cross-section: a back slope, a steep face and a curl leaning outward, in world units.
          const prof = [];
          for (let i = 0; i <= 14; i++) { const t = i / 14; prof.push(new THREE.Vector2(Math.max(0.05, front - 2.2 + t * 2.2 + (t > 0.75 ? (t - 0.75) * 2.4 : 0)), h * (t < 0.75 ? Math.sin(t / 0.75 * Math.PI / 2) : 1 - (t - 0.75) * 1.6))); }
          fx.wave.geometry.dispose(); fx.wave.geometry = new THREE.LatheGeometry(prof, 64);
        }
        fx.wtex.offset.x = time * 0.4; fx.wtex.offset.y = -time * 1.2;
        fx.foam.forEach(f => { f.m.visible = fx.wave.visible; const a = f.a + time * 0.15; f.m.position.set(Math.cos(a) * (front + 0.3), h * 0.95 + Math.sin(time * 8 + f.ph) * 0.15, Math.sin(a) * front * 1.04); f.m.material.opacity = 0.9 * (1 - wk * 0.6); });
        if (fx.wave.visible && Math.random() < dt * 40) { const a = rnd(0, 6.28); v.magic.emit('water', x + Math.cos(a) * front, z + Math.sin(a) * front, { n: 5, y: h, radius: 0.5, speed: 1.6, life: 0.7, size: 1.1 }); }
        if (wk > 0 && !fx.wet) fx.wet = this.mark(x, z, R, TEX.wet, 34, { alpha: 0.85, fadeIn: 2 });
      }
      if (fx.kind === 'phoenix') {
        // It climbs out of the forge, sweeps across, then dives onto the circle.
        const kk = ease(k * 0.9 + 0.1 * k * k), px = s.x0 + (s.x - s.x0) * kk, py = s.y0 + (s.y - s.y0) * kk, [bx, bz] = this.at(px, py);
        const hgt = k < 0.75 ? 2 + Math.sin(k / 0.75 * Math.PI / 2) * 7 : 9 * (1 - Math.pow((k - 0.75) / 0.25, 2)) + 0.5;
        fx.g.position.set(bx, hgt, bz);
        fx.g.rotation.set(0, -Math.atan2(s.y - s.y0, s.x - s.x0), k < 0.75 ? 0.25 : -0.9);
        fx.wings.forEach(([wg, sd]) => { wg.rotation.x = sd * (k < 0.75 ? Math.sin(time * 10) * 0.7 : -0.9); });
        // A ribbon of fire behind it.
        fx.trailT -= dt;
        if (fx.trailT <= 0) { fx.trailT = 0.03; this.glowBall(bx, hgt, bz, '#ff7a20', 3, 0.7, -0.6); this.glowBall(bx, hgt, bz, '#ffd060', 1.6, 0.4, -0.5); }
        v.magic.emit('fire', bx, bz, { n: 3, y: hgt, radius: 0.6, speed: 0.6, life: 0.9, size: 1.3 });
      }
    }
    for (const [s, fx] of this.live) if (!seen.has(s)) { this.scene.remove(fx.g); this.live.delete(s); }

    // The flood: a rippling sheet of water that fades out.
    const fseen = new Set();
    for (const f of w.floods || []) {
      fseen.add(f);
      let o = this.floods.get(f);
      if (!o) {
        const tex = TEX.water.clone(); tex.needsUpdate = true; tex.repeat.set(f.r, f.r);
        const m = new THREE.Mesh(new THREE.CircleGeometry(f.r * TILE, 40).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0, roughness: 0.1, emissive: lin('#1a4a7a'), emissiveIntensity: 0.3, depthWrite: false }));
        const [x, z] = this.at(f.x, f.y); m.position.set(x, 0.06, z); this.scene.add(m);
        o = { m, tex, x, z, ripple: 0 }; this.floods.set(f, o);
      }
      o.tex.offset.set(time * 0.03, Math.sin(time * 0.4) * 0.04);
      o.m.material.opacity = 0.62 * Math.min(1, f.t / 4) * Math.min(1, (30 - f.t + 0.3) / 1.5);
      o.ripple -= dt;
      if (o.ripple <= 0 && f.t > 3) { o.ripple = rnd(0.4, 1); const a = rnd(0, 6.28), r = Math.sqrt(Math.random()) * f.r * TILE * 0.85; this.ringWave(o.x + Math.cos(a) * r, o.z + Math.sin(a) * r, 1.2, '#e8f6ff', 1.2); }
    }
    for (const [f, o] of this.floods) if (!fseen.has(f)) { this.scene.remove(o.m); this.floods.delete(f); }

    // The ring of rock: it rises in dust, rune-lit, and sinks again.
    const rkeys = new Set((w.ridges || []).map(r => r.tiles.join(',')));
    for (const r of w.ridges || []) if (!this.ridges.has(r.tiles.join(','))) this.ridge(r.tiles);
    for (const [key, r] of this.ridges) {
      if (!r.sink && !rkeys.has(key)) { r.sink = true; r.t = 0; for (const [x, z] of r.spots.filter((_, i) => i % 3 === 0)) this.puff(x, 0.4, z, { color: '#b8a888', size: 2.2, life: 1.8 }); }
      r.t += dt;
      r.g.position.y = r.sink ? -Math.min(2, r.t * 2) : -2 + ease(r.t / 0.9) * 2;
      this.runeRock.emissiveIntensity = 0.25 + Math.sin(time * 2) * 0.12;
      if (r.sink && r.t > 1.1) { this.scene.remove(r.g); this.ridges.delete(key); }
    }

    // Burning ground (the phoenix's blaze, and molten siege shot): flames, heat glow and smoke.
    const bseen = new Set();
    for (const b of w.burns || []) {
      bseen.add(b);
      let f = this.blazes.get(b);
      if (!f) {
        const g = new THREE.Group(), [x, z] = this.at(b.x, b.y), n = Math.round(3 + b.r * b.r * 2.2), flames = [];
        for (let k = 0; k < n; k++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * b.r * TILE * 0.9, h = rnd(0.5, 1.5); const m = new THREE.Mesh(new THREE.ConeGeometry(rnd(0.16, 0.32), h, 5), this.flameMats[k % 3]); m.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r); g.add(m); flames.push([m, Math.random() * 6]); }
        const glow = new THREE.Mesh(new THREE.CircleGeometry(b.r * TILE, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TEX.soft, color: lin('#ff6a20'), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
        glow.position.y = 0.06; g.add(glow);
        g.position.set(x, 0, z); this.scene.add(g); f = { g, flames, glow, x, z, r: b.r * TILE, smoke: 0 }; this.blazes.set(b, f);
      }
      const fade = Math.min(1, b.t / 2.5);
      f.flames.forEach(([m, ph]) => m.scale.set(fade, Math.max(0.001, fade * (0.7 + Math.sin(time * 9 + ph) * 0.35)), fade));
      f.glow.material.opacity = (0.35 + Math.sin(time * 3) * 0.1) * fade;
      f.smoke -= dt;
      if (f.smoke <= 0 && f.r > 3) { f.smoke = rnd(0.15, 0.35); const a = rnd(0, 6.28), r = Math.sqrt(Math.random()) * f.r * 0.8; this.puff(f.x + Math.cos(a) * r, 1.2, f.z + Math.sin(a) * r, { color: '#5a4c44', size: 1.8, life: 3, rise: 1.2, grow: 1.6, alpha: 0.5 * fade }); }
    }
    for (const [b, f] of this.blazes) if (!bseen.has(b)) { this.scene.remove(f.g); this.blazes.delete(b); }

    // Short-lived pieces: puffs of smoke and dust, flying debris, glows, bolts and marks.
    this.puffs = this.puffs.filter(p => {
      if (p.delay > 0) { p.delay -= dt; return true; }
      p.t += dt; const k = p.t / p.life;
      p.m.scale.setScalar(p.size * (1 + k * p.grow)); p.m.position.y += p.rise * dt; p.m.position.x += p.vx * dt * (1 - k); p.m.position.z += p.vz * dt * (1 - k);
      p.m.material.opacity = p.alpha * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85);
      if (k >= 1) { this.scene.remove(p.m); p.m.material.dispose(); return false; }
      return true;
    });
    this.debris = this.debris.filter(d => {
      d.vy -= 18 * dt; d.m.position.x += d.vx * dt; d.m.position.y += d.vy * dt; d.m.position.z += d.vz * dt; d.m.rotation.x += d.rx * dt; d.m.rotation.y += d.ry * dt;
      if (d.m.position.y < 0.1 && d.vy < 0) { if (Math.random() < 0.3) this.puff(d.m.position.x, 0.2, d.m.position.z, { color: '#b8a888', size: 0.9, life: 0.8, rise: 0.3 }); this.scene.remove(d.m); return false; }
      return true;
    });
    this.timed = this.timed.filter(o => { o.t += dt; const k = Math.min(1, o.t / o.life); o.upd(k); if (k >= 1) { this.scene.remove(o.obj); return false; } return true; });
    this.marks = this.marks.filter(o => {
      o.t += dt; const a = o.t < o.fadeIn ? o.t / o.fadeIn : o.t > o.life - 4 ? Math.max(0, (o.life - o.t) / 4) : 1;
      o.m.material.opacity = o.alpha * a;
      if (o.t >= o.life) { this.scene.remove(o.m); o.m.geometry.dispose(); o.m.material.dispose(); return false; }
      return true;
    });

    // The screen flash fades fast; the storm or moonlight dims the scene while it lasts.
    if (this.flashK > 0) this.flashK = Math.max(0, this.flashK - dt * 2.8);
    this.flashEl.style.opacity = String(this.flashK);
    this.applyDim(dt);
  }
  applyDim(dt) {
    const d = this.dim, v = this.v;
    d.k += (d.want - d.k) * Math.min(1, dt * 2.5); d.want = 0;
    if (d.k < 0.005 && !d.base) return;
    if (!d.base) d.base = { hemi: v.hemi.intensity, sun: v.sun.intensity, bg: v.scene.background.clone() };
    v.hemi.intensity = d.base.hemi * (1 - d.k * 0.7); v.sun.intensity = d.base.sun * (1 - d.k * 0.85);
    v.scene.background.copy(d.base.bg).lerp(d.tint, d.k); if (v.scene.fog) v.scene.fog.color.copy(v.scene.background);
    if (d.k < 0.005) { v.hemi.intensity = d.base.hemi; v.sun.intensity = d.base.sun; v.scene.background.copy(d.base.bg); if (v.scene.fog) v.scene.fog.color.copy(d.base.bg); d.base = null; d.k = 0; }
  }

  ridge(tiles) {
    const w = this.w(), key = tiles.join(','), g = new THREE.Group(), spots = [];
    let seed = tiles[0] || 1; const rr = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (const i of tiles) {
      const [x, z] = this.at(i % w.size + 0.5, Math.floor(i / w.size) + 0.5);
      spots.push([x, z]);
      for (let k = 0; k < 2; k++) { const d = new THREE.DodecahedronGeometry(0.6 + rr() * 0.35, 0); d.scale(1, 1.3 + rr() * 1.1, 1); d.rotateY(rr() * 6); d.translate(x + (rr() - 0.5) * 0.6, 0.55, z + (rr() - 0.5) * 0.6); const m = new THREE.Mesh(d, k ? this.runeRock : this.rockMat); m.castShadow = m.receiveShadow = true; g.add(m); }
    }
    g.position.y = -2; this.scene.add(g);
    for (const [x, z] of spots.filter((_, i) => i % 2 === 0)) this.puff(x, 0.4, z, { color: '#c0b090', size: 2.4, life: 2, delay: rnd(0, 0.4) });
    this.ridges.set(key, { g, t: 0, sink: false, spots });
  }
}
