// Touch-first input. One finger: tap to select or command, drag on the ground to box-select
// (or to move the building ghost while placing). Two fingers: drag to pan, pinch to zoom.
// Mouse: left as a finger, right-click to command, right or middle drag to pan, wheel to zoom.
export class Input {
  constructor(el, game) {
    this.el = el; this.g = game; this.p = new Map(); this.multi = false; this.keys = new Set();
    this.lastTap = { t: 0, x: 0, y: 0 };
    el.addEventListener('pointerdown', e => this.down(e));
    el.addEventListener('pointermove', e => this.move(e));
    el.addEventListener('pointerup', e => this.up(e));
    el.addEventListener('pointercancel', e => { this.p.delete(e.pointerId); this.g.endBox(); });
    el.addEventListener('wheel', e => { e.preventDefault(); this.g.view.zoomBy(e.deltaY > 0 ? 1.1 : 1 / 1.1); }, { passive: false });
    el.addEventListener('contextmenu', e => e.preventDefault());
    this.onKey = e => {
      if (e.type === 'keydown') {
        this.keys.add(e.key.toLowerCase());
        if (e.key === 'Escape') this.g.escape();
        if (e.key === ' ') { e.preventDefault(); this.g.togglePause(); }
      } else this.keys.delete(e.key.toLowerCase());
    };
    addEventListener('keydown', this.onKey); addEventListener('keyup', this.onKey);
  }
  dispose() { removeEventListener('keydown', this.onKey); removeEventListener('keyup', this.onKey); }

  pos(e) { const r = this.el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

  down(e) {
    this.el.setPointerCapture?.(e.pointerId);
    const [x, y] = this.pos(e);
    this.p.set(e.pointerId, { x0: x, y0: y, x, y, t: performance.now(), button: e.button, mouse: e.pointerType === 'mouse', moved: false });
    if (this.p.size === 2) { this.multi = true; this.g.endBox(); const [a, b] = [...this.p.values()]; this.pinch = Math.hypot(a.x - b.x, a.y - b.y); this.mid = [(a.x + b.x) / 2, (a.y + b.y) / 2]; }
    if (this.p.size === 1) this.multi = false;
  }

  move(e) {
    const [x, y] = this.pos(e);
    const q = this.p.get(e.pointerId);
    if (!q) { if (e.pointerType === 'mouse') this.g.hover(x, y); return; }
    const dx = x - q.x, dy = y - q.y;
    q.x = x; q.y = y;
    if (Math.hypot(x - q.x0, y - q.y0) > 10) q.moved = true;
    if (this.p.size >= 2) {
      const [a, b] = [...this.p.values()];
      const mid = [(a.x + b.x) / 2, (a.y + b.y) / 2], dist = Math.hypot(a.x - b.x, a.y - b.y);
      this.g.view.pan(mid[0] - this.mid[0], mid[1] - this.mid[1]);
      if (this.pinch > 0 && dist > 0) this.g.view.zoomBy(this.pinch / dist);
      this.mid = mid; this.pinch = dist;
      return;
    }
    if (this.multi || !q.moved) return;
    if (q.mouse && (q.button === 1 || q.button === 2)) { this.g.view.pan(dx, dy); return; }
    if (this.g.placing) { this.g.moveGhost(x, y); return; }
    this.g.box(q.x0, q.y0, x, y);
  }

  up(e) {
    const q = this.p.get(e.pointerId);
    this.p.delete(e.pointerId);
    if (!q) return;
    if (this.multi) { if (!this.p.size) this.multi = false; return; }
    if (q.moved) { if (!this.g.placing && !(q.mouse && q.button !== 0)) this.g.finishBox(); return; }
    const now = performance.now();
    const dbl = now - this.lastTap.t < 320 && Math.hypot(q.x - this.lastTap.x, q.y - this.lastTap.y) < 24;
    this.lastTap = { t: now, x: q.x, y: q.y };
    if (q.mouse && q.button === 2) this.g.command(q.x, q.y);
    else this.g.tap(q.x, q.y, dbl);
  }

  // Keyboard panning, called every frame.
  update(dt) {
    const k = this.keys, s = 700 * dt;
    let dx = 0, dy = 0;
    if (k.has('a') || k.has('arrowleft')) dx += s;
    if (k.has('d') || k.has('arrowright')) dx -= s;
    if (k.has('w') || k.has('arrowup')) dy += s;
    if (k.has('s') || k.has('arrowdown')) dy -= s;
    if (dx || dy) this.g.view.pan(dx, dy);
  }
}
