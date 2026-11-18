// Pop-up action rings: round buttons laid out on an arc around a point on screen (a selected
// building, a building outline being placed, or the thumb-zone Build button). Rebuilt only when
// the set of buttons changes; positions, costs, badges and progress update every frame.
import { ICONS } from './icons.js';
import { layoutRing, tagWidth } from './layout.js';

const BTN = 60, SMALL = 48, HOLD_MS = 450; // never below 48: a child's fingertip
const costHtml = cost => Object.entries(cost || {}).map(([k, v]) => `<span class="cost">${ICONS[k]}${v}</span>`).join('');

export class ActionRing {
  constructor(root, cls = '') {
    this.el = document.createElement('div');
    this.el.className = `ring ${cls}`;
    root.append(this.el);
    this.key = ''; this.btns = new Map();
  }

  hide() { if (this.key) { this.el.innerHTML = ''; this.btns.clear(); this.key = ''; } }

  // anchor: [x, y] on screen (or null to hide). opts: radius, center (arc middle, degrees, -90 is
  // up), full (a whole circle), compact (small picture-only buttons), bounds { w, h, top, bottom },
  // stack (a column climbing from the anchor, for the thumb zone).
  show(anchor, items, opts) {
    if (!anchor || !items.length) { this.hide(); return; }
    const key = items.map(i => i.id).join('|');
    if (key !== this.key) this.build(key, items);
    // Small, picture-only buttons when zoomed out; full buttons with words when zoomed in. A full
    // ring that cannot fit on the screen also goes small.
    let compact = !!opts.compact;
    const { bounds } = opts, safe = { left: 6, right: bounds.w - 6, top: bounds.top, bottom: bounds.h - bounds.bottom };
    // The button size as drawn (CSS makes them smaller on phones and in the compact ring).
    const lay = c => {
      this.el.classList.toggle('compact', c);
      const size = this.btns.values().next().value?.el.offsetWidth || (c ? SMALL : BTN);
      return layoutRing(items.map(it => ({ tagW: tagWidth(Object.keys(it.cost || {}).length, c) })), { anchor, radius: opts.radius * (c ? 0.85 : 1), center: opts.center ?? -90, full: opts.full, size, tagH: c ? 15 : 18, gap: c ? 6 : 8, bounds: safe });
    };
    let pos;
    if (opts.stack) pos = items.map((_, i) => [anchor[0], anchor[1] - i * opts.stack]);
    else { pos = lay(compact); if (!pos.fits && !compact) { compact = true; pos = lay(true); } pos = pos.pts; }
    this.el.classList.toggle('compact', compact && !opts.stack);
    this.compact = compact && !opts.stack;
    let minY = Infinity, maxY = -Infinity, sx = 0;
    items.forEach((it, i) => {
      const b = this.btns.get(it.id);
      if (!b) return;
      const [x, y] = pos[i];
      b.x = x; b.y = y; minY = Math.min(minY, y); maxY = Math.max(maxY, y); sx += x;
      const r = (b.el.offsetWidth || BTN) / 2; // buttons can be smaller on small screens
      b.el.style.transform = `translate(${x - r}px, ${y - r}px)`;
      b.el.classList.toggle('poor', !!it.poor);
      b.el.classList.toggle('on', !!it.on);
      if (b.badge.textContent !== String(it.badge || '')) b.badge.textContent = it.badge || '';
      // Labels (a research percentage) and costs (the next level) can change while it is open.
      if (b.lbl && b.lbl.textContent !== it.label) { b.lbl.textContent = it.label; b.lbl.classList.toggle('long', it.label.length > 9); }
      const ck = JSON.stringify(it.cost || null);
      if (ck !== b.ck) { b.ck = ck; if (b.tag) { b.tag.innerHTML = costHtml(it.cost); b.tag.classList.toggle('none', !it.cost); } }
      b.el.style.setProperty('--p', it.progress || 0);
      b.it = it;
    });
    // In the compact ring, a caption names the button under the finger, just below the ring.
    if (this.caption && this.capT > 0) {
      // In the middle of the ring (over the building or worker), where no button ever is.
      this.caption.style.transform = `translate(${Math.max(60, Math.min(bounds.w - 60, sx / items.length))}px, ${(minY + maxY) / 2}px) translate(-50%, -50%)`;
    }
  }
  // The rectangle the ring's buttons cover on screen (for keeping the guide's bubble clear).
  rect() {
    if (!this.key) return null;
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    for (const x of this.btns.values()) { const h = (x.el.offsetWidth || BTN) / 2 + 4; l = Math.min(l, x.x - h); r = Math.max(r, x.x + h); t = Math.min(t, x.y - h); b = Math.max(b, x.y + h + 18); }
    return l < r ? { l, t, r, b } : null;
  }
  // Says which button the finger is on, for a moment (compact rings have no words on the buttons).
  say(text) {
    if (!this.compact) return;
    if (!this.caption) { this.caption = document.createElement('div'); this.caption.className = 'ring-caption'; this.el.append(this.caption); }
    this.caption.textContent = text; this.caption.classList.add('on'); this.capT = 1;
    clearTimeout(this.capTimer); this.capTimer = setTimeout(() => { this.capT = 0; this.caption?.classList.remove('on'); }, 1800);
  }

  build(key, items) {
    this.el.innerHTML = ''; this.btns.clear(); this.key = key; this.caption = null; this.capT = 0;
    items.forEach((it, i) => {
      const el = document.createElement('button');
      el.className = `rbtn ${it.cls || ''}`;
      el.dataset.id = it.id;
      el.style.animationDelay = `${i * 30}ms`;
      el.innerHTML = `<span class="face">${it.icon}<span class="lbl${it.label.length > 9 ? ' long' : ''}">${it.label}</span></span><span class="tag${it.cost ? '' : ' none'}">${costHtml(it.cost)}</span><i class="badge"></i>`;
      el.title = it.hint || it.label;
      const b = { el, badge: el.querySelector('.badge'), lbl: el.querySelector('.lbl'), tag: el.querySelector('.tag'), ck: JSON.stringify(it.cost || null), it, held: false, timer: 0 };
      // Tap to act; hold to run the item's hold action (for example, queue five).
      el.addEventListener('pointerdown', e => {
        e.stopPropagation();
        this.say(b.it.label);
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
