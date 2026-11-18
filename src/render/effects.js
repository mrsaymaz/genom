// Magic effects for big moments (the age-up): glowing particles, pillars of light and shockwave
// rings, all additive and unlit so they glow. One instanced mesh per particle shape keeps
// hundreds of particles cheap on phones.
import * as THREE from 'three';

const lin = c => new THREE.Color(c).convertSRGBToLinear();

// Each nation's elemental choreography: colours and how its particles move.
export const ELEMENTS = {
  air: { a: '#ffd453', b: '#fff6cf', shape: 'ribbon', rise: 2.2, swirl: 3.2, spread: 0.6 },
  water: { a: '#62dcff', b: '#e6fbff', shape: 'drop', rise: 3.4, swirl: 0.6, spread: 1.6, gravity: 5.5 },
  fire: { a: '#ff7a1f', b: '#ffd060', shape: 'ember', rise: 2.8, swirl: 0.9, spread: 0.7, flicker: true },
  earth: { a: '#6dff8e', b: '#c8ff9a', shape: 'leaf', rise: 1.8, swirl: 2.2, spread: 0.9 },
};

const MAX = 1400;

export class Effects {
  constructor(scene) {
    this.scene = scene;
    const mat = () => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const geos = {
      ember: new THREE.OctahedronGeometry(0.07, 0),
      drop: new THREE.SphereGeometry(0.06, 6, 4),
      ribbon: new THREE.PlaneGeometry(0.06, 0.32),
      leaf: new THREE.PlaneGeometry(0.16, 0.1).rotateZ(Math.PI / 4),
      star: new THREE.OctahedronGeometry(0.1, 0).scale(1, 1.8, 1),
    };
    this.meshes = {};
    for (const [k, g] of Object.entries(geos)) {
      const m = new THREE.InstancedMesh(g, mat(), MAX);
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
      m.count = 0; m.frustumCulled = false; m.renderOrder = 6;
      scene.add(m);
      this.meshes[k] = { mesh: m, list: [] };
    }
    this.d = new THREE.Object3D();
    this.col = new THREE.Color();
    this.objs = []; // pillars and rings
  }

  // A burst of particles at a world point. kind picks the shape; el the element style.
  emit(el, x, z, { n = 30, y = 0.2, radius = 0.6, speed = 1, life = 1.4, size = 1, up = 1, shape } = {}) {
    const E = ELEMENTS[el], sh = shape || E.shape, bucket = this.meshes[sh].list;
    for (let i = 0; i < n && bucket.length < MAX; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * radius;
      const out = (0.4 + Math.random()) * E.spread * speed;
      bucket.push({
        x: x + Math.cos(a) * r, y: y + Math.random() * 0.4, z: z + Math.sin(a) * r,
        vx: Math.cos(a) * out, vy: (0.6 + Math.random()) * E.rise * speed * up, vz: Math.sin(a) * out,
        a, swirl: E.swirl * (0.6 + Math.random() * 0.8) * (Math.random() < 0.5 ? 1 : -1), cx: x, cz: z,
        t: 0, life: life * (0.6 + Math.random() * 0.7), s: size * (0.7 + Math.random() * 0.8),
        c: Math.random() < 0.55 ? E.a : E.b, g: E.gravity || 0, flick: !!E.flicker, spin: Math.random() * 6,
      });
    }
  }

  // A pillar of light: a tall glowing column that fades upward. Returns a handle to animate.
  pillar(x, z, { color = '#ffffff', radius = 0.9, height = 14 } = {}) {
    const geo = new THREE.CylinderGeometry(radius, radius * 1.25, height, 24, 6, true);
    geo.translate(0, height / 2, 0);
    // Bright at the bottom, fading to nothing at the top.
    const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3), c = lin(color).multiplyScalar(0.6); // keeps its colour over bright ground
    for (let i = 0; i < pos.count; i++) { const k = Math.pow(1 - pos.getY(i) / height, 1.6); cols[i * 3] = c.r * k; cols[i * 3 + 1] = c.g * k; cols[i * 3 + 2] = c.b * k; }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    m.position.set(x, 0, z); m.renderOrder = 5;
    this.scene.add(m);
    const h = { mesh: m, opacity: 0, width: 1, dispose: () => { this.scene.remove(m); geo.dispose(); m.material.dispose(); } };
    this.objs.push(h);
    return h;
  }

  // A shockwave ring on the ground.
  ring(x, z, { color = '#ffffff', from = 0.5, to = 30, time = 2.2, width = 0.08 } = {}) {
    const m = new THREE.Mesh(new THREE.RingGeometry(1 - width, 1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: lin(color), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set(x, 0.08, z); m.renderOrder = 4;
    this.scene.add(m);
    const h = { mesh: m, t: 0, time, from, to, auto: true };
    this.objs.push(h);
    return h;
  }

  update(dt) {
    const d = this.d, col = this.col;
    for (const { mesh, list } of Object.values(this.meshes)) {
      let n = 0;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.t += dt;
        if (p.t >= p.life) { list[i] = list[list.length - 1]; list.pop(); continue; }
        // Rise, swirl around the source, slow down; water falls back in arcs.
        p.a += p.swirl * dt;
        const k = p.t / p.life;
        p.vy -= p.g * dt;
        p.x += p.vx * dt + Math.cos(p.a) * p.swirl * 0.25 * dt;
        p.z += p.vz * dt + Math.sin(p.a) * p.swirl * 0.25 * dt;
        p.y += p.vy * dt;
        p.vx *= 1 - 1.2 * dt; p.vz *= 1 - 1.2 * dt;
        if (p.y < 0.05 && p.g) { p.y = 0.05; p.vy *= -0.3; }
        const fade = k < 0.15 ? k / 0.15 : 1 - Math.pow((k - 0.15) / 0.85, 1.5);
        const s = p.s * (p.flick ? 0.7 + Math.random() * 0.6 : 1) * (0.4 + fade * 0.6);
        d.position.set(p.x, p.y, p.z); d.rotation.set(p.spin + p.t * 3, p.a, p.t * 2); d.scale.setScalar(s); d.updateMatrix();
        mesh.setMatrixAt(n, d.matrix);
        col.set(p.c).convertSRGBToLinear().multiplyScalar(Math.max(0, fade) * 1.4);
        mesh.setColorAt(n, col);
        n++;
      }
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    this.objs = this.objs.filter(h => {
      if (h.auto) {
        h.t += dt;
        const k = Math.min(1, h.t / h.time), e = 1 - Math.pow(1 - k, 3);
        h.mesh.scale.setScalar(h.from + (h.to - h.from) * e);
        h.mesh.material.opacity = 0.9 * (1 - k);
        if (k >= 1) { this.scene.remove(h.mesh); h.mesh.geometry.dispose(); h.mesh.material.dispose(); return false; }
        return true;
      }
      if (h.done) { h.dispose(); return false; }
      h.mesh.material.opacity = h.opacity;
      h.mesh.scale.set(h.width, 1, h.width);
      return true;
    });
  }

  clear() { for (const b of Object.values(this.meshes)) b.list.length = 0; for (const h of this.objs) { if (h.auto) { this.scene.remove(h.mesh); } else h.dispose(); } this.objs = []; }
}
