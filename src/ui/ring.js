// Pop-up action rings: round buttons laid out on an arc around a point on screen (a selected
// building, a building outline being placed, or the thumb-zone Build button). Rebuilt only when
// the set of buttons changes; positions, costs, badges and progress update every frame.
import { ICONS } from './icons.js';

const BTN = 60, HOLD_MS = 450;
const costHtml = cost => Object.entries(cost || {}).map(([k, v]) => `<span class="cost">${ICONS[k]}${v}</span>`).join('');

export class ActionRing {
  constructor(root, cls = '') {
    this.el = document.createElement('div');
    this.el.className = `ring ${cls}`;
    root.append(this.el);
    this.key = ''; this.btns = new Map();
  }

  hide() { if (this.key) { this.el.innerHTML = ''; this.btns.clear(); this.key = ''; } }

  // anchor: [x, y] on screen (or null to hide). opts: radius, center (arc middle, degrees,
  // -90 is up), step (degrees between buttons), bounds { w, h, top, bottom }.
  show(anchor, items, opts) {
    if (!anchor || !items.length) { this.hide(); return; }
    const key = items.map(i => i.id).join('|');
    if (key !== this.key) this.build(key, items);
    const { center = -90, bounds } = opts;
    // Space buttons so neither the buttons nor their cost tags touch (a tag with three costs is wide).
    const tags = Math.max(0, ...items.map(i => Object.keys(i.cost || {}).length));
    const half = Math.max(BTN / 2 + 18, [0, 34, 50, 66][tags] + 4);
    const n = items.length;
    let radius = opts.radius, step = opts.step;
    if (step === undefined) {
      // Spread at most 270 degrees; if the buttons need more room, grow the ring instead.
      const want = Math.max(38, (2 * Math.asin(Math.min(1, half / radius)) * 180) / Math.PI);
      step = n > 1 ? Math.min(want, 270 / (n - 1)) : want;
      radius = Math.max(radius, half / Math.sin((step * Math.PI) / 360));
    }
    const start = center - ((n - 1) * step) / 2;
    items.forEach((it, i) => {
      const b = this.btns.get(it.id);
      if (!b) return;
      const a = ((start + i * step) * Math.PI) / 180;
      let x, y;
      if (opts.stack) { x = anchor[0]; y = anchor[1] - i * opts.stack; } // a column climbing from the anchor
      else {
        x = anchor[0] + Math.cos(a) * radius; y = anchor[1] + Math.sin(a) * radius;
        x = Math.max(BTN / 2 + 6, Math.min(bounds.w - BTN / 2 - 6, x));
        y = Math.max(bounds.top + BTN / 2, Math.min(bounds.h - bounds.bottom - BTN / 2, y));
      }
      b.el.style.transform = `translate(${x - BTN / 2}px, ${y - BTN / 2}px)`;
      b.el.classList.toggle('poor', !!it.poor);
      b.el.classList.toggle('on', !!it.on);
      if (b.badge.textContent !== String(it.badge || '')) b.badge.textContent = it.badge || '';
      b.el.style.setProperty('--p', it.progress || 0);
      b.it = it;
    });
  }

  build(key, items) {
    this.el.innerHTML = ''; this.btns.clear(); this.key = key;
    items.forEach((it, i) => {
      const el = document.createElement('button');
      el.className = `rbtn ${it.cls || ''}`;
      el.dataset.id = it.id;
      el.style.animationDelay = `${i * 30}ms`;
      el.innerHTML = `<span class="face">${it.icon}<span class="lbl${it.label.length > 9 ? ' long' : ''}">${it.label}</span></span>${it.cost ? `<span class="tag">${costHtml(it.cost)}</span>` : ''}<i class="badge"></i>`;
      el.title = it.hint || it.label;
      const b = { el, badge: el.querySelector('.badge'), it, held: false, timer: 0 };
      // Tap to act; hold to run the item's hold action (for example, queue five).
      el.addEventListener('pointerdown', e => {
        e.stopPropagation();
        b.held = false;
        clearTimeout(b.timer);
        if (b.it.hold) b.timer = setTimeout(() => { b.held = true; el.classList.add('held'); setTimeout(() => el.classList.remove('held'), 300); b.it.hold(); }, HOLD_MS);
      });
      const stop = () => clearTimeout(b.timer);
      el.addEventListener('pointerup', stop); el.addEventListener('pointerleave', stop); el.addEventListener('pointercancel', stop);
      el.addEventListener('click', e => { e.stopPropagation(); if (b.held) { b.held = false; return; } b.it.act(); });
      el.addEventListener('contextmenu', e => e.preventDefault());
      this.el.append(el);
      this.btns.set(it.id, b);
    });
  }
}
