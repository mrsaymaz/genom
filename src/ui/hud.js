// The heads-up display, framed in the student's nation material: a banner of resource tokens,
// the quest scroll, the guide's speech bubble, the minimap with its quick buttons, the selection
// badge, action rings, alert ribbons, toasts and the drag box. Plain DOM over the 3D canvas.
import { CONFIG } from '../config.js';
import { ICONS, unitIcon } from './icons.js';
import { T } from '../sim/map.js';
import { ActionRing } from './ring.js';
import { TILE } from '../render/art.js';

const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const RES = ['food', 'lumber', 'gold'];
// A button with a tap action and a separate long-press action.
const holdable = (el, tap, hold) => {
  let timer = 0, held = false;
  el.addEventListener('pointerdown', () => { held = false; clearTimeout(timer); timer = setTimeout(() => { held = true; navigator.vibrate?.(15); hold(); }, 500); });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, () => clearTimeout(timer));
  el.addEventListener('click', () => { if (held) { held = false; return; } tap(); });
  el.addEventListener('contextmenu', e => e.preventDefault());
};
const costHtml = cost => Object.entries(cost || {}).map(([k, v]) => `<span class="cost">${ICONS[k]}${v}</span>`).join('');

// The village guide who speaks the tutorial lines: a small face in each nation's hat.
const GUIDE = {
  air: '<path d="M6 21c0-9 5-14 14-14s14 5 14 14" fill="#d9b66a"/><ellipse cx="20" cy="21" rx="18" ry="4" fill="#e8c878"/><path d="M14 9h12" stroke="#b08a42" stroke-width="2"/>',
  water: '<path d="M10 21L20 2l10 19z" fill="#efe9e0"/><path d="M13 15h14M15.5 10h9M18 6h4" stroke="#c9c0d8" stroke-width="1.6"/><ellipse cx="20" cy="21" rx="14" ry="3" fill="#efe9e0"/>',
  fire: '<path d="M7 22c0-8 6-13 13-13s13 5 13 13z" fill="#c22a26"/><path d="M31 18l6 3-5 3" fill="#c22a26"/><path d="M8 21h24" stroke="#8a1a16" stroke-width="2"/>',
  earth: '<ellipse cx="20" cy="17" rx="19" ry="5" fill="#7fb24f"/><path d="M1 17h38" stroke="#4f8a3a" stroke-width="1.2"/><path d="M20 12v-6" stroke="#4f8a3a" stroke-width="2"/>',
};
const guideFace = art => `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="26" r="12" fill="#e9b994"/><circle cx="15.5" cy="25" r="1.6" fill="#2a1e18"/><circle cx="24.5" cy="25" r="1.6" fill="#2a1e18"/><path d="M16 30q4 3 8 0" stroke="#9a5a48" stroke-width="1.6" fill="none" stroke-linecap="round"/>${GUIDE[art]}</svg>`;
// What a unit is doing, as a small icon on its badge.
const STATUS = { gather: null, return: null, build: 'build', move: 'rally', amove: 'amove', attack: 'amove', hold: 'hold', shelter: 'bell' };
const RES_OF = { tree: 'lumber', gold: 'gold', berries: 'food' };

export class HUD {
  constructor(root, game) {
    this.g = game; this.root = root;
    root.innerHTML = '';
    // Every frame takes the student's nation material (straw, pearl, basalt or bark).
    const art = game.world.teams[0].nation.art;
    root.className = `nation-${art}`;
    this.art = art;

    // Resources: a slim tray of tokens at the bottom (or a tab down the left edge).
    // Tap a token to find the workers gathering it.
    this.tray = h('div', 'tray frame');
    this.res = {}; this.tok = {};
    for (const k of RES) {
      const t = h('button', 'tok', `${ICONS[k]}<b>0</b>`); t.title = `${k[0].toUpperCase() + k.slice(1)}: tap to find the workers gathering it`;
      t.onclick = () => game.selectGatherers?.(k);
      this.res[k] = t.querySelector('b'); this.tok[k] = t; this.tray.append(t);
    }
    const pop = h('div', 'tok pop', `${ICONS.house}<b>0</b>`); pop.title = 'Population: build Houses for more';
    this.res.pop = pop.querySelector('b'); this.tok.pop = pop;
    this.tray.append(pop);
    // Sound and pause: two small round buttons at the top right.
    this.top = h('div', 'sys');
    this.muteBtn = h('button', 'icon-btn frame'); this.muteBtn.onclick = () => game.toggleMute?.();
    this.pauseBtn = h('button', 'icon-btn frame', ICONS.pause); this.pauseBtn.title = 'Pause'; this.pauseBtn.onclick = () => game.togglePause();
    this.top.append(this.muteBtn, this.pauseBtn);
    this.paintMute();

    // Goals: a quest scroll with a progress ring; tap to unroll the full goal.
    this.obj = h('div', 'quest closed');
    this.objHead = h('button', 'scroll frame');
    this.objBody = h('div', 'quest-body frame');
    this.objHead.onclick = () => { this.obj.classList.toggle('closed'); this.objOpenT = this.obj.classList.contains('closed') ? 0 : 6; };
    this.objHead.title = 'Your goal (tap to read it)';
    this.obj.append(this.objHead, this.objBody);

    // The guide's speech bubble, beside the pointer arrow on the map.
    this.bubble = h('div', 'bubble hidden', `<span class="face">${guideFace(art)}</span><span class="say"></span><button class="speak" type="button" title="Listen">${ICONS.sound}</button>`);
    this.bubble.querySelector('.speak').onclick = e => { e.stopPropagation(); game.audio?.speak(this.sayText, true); };

    // Quick buttons in a column beside the minimap.
    this.quick = h('div', 'quick');
    this.idleBtn = h('button', 'icon-btn frame', `${ICONS.idle}<i></i>`); this.idleBtn.title = 'Next idle worker (hold: all idle workers)'; holdable(this.idleBtn, () => game.selectIdleWorker(), () => game.selectAllIdle());
    this.armyBtn = h('button', 'icon-btn frame', `${ICONS.army}<i></i>`); this.armyBtn.title = 'Select all soldiers'; this.armyBtn.onclick = () => game.selectArmy();
    this.homeBtn = h('button', 'icon-btn frame', ICONS.towncenter); this.homeBtn.title = 'Go to Town Center'; this.homeBtn.onclick = () => game.goHome();
    this.quick.append(this.idleBtn, this.armyBtn, this.homeBtn);
    // Minimap (a diamond, turned to match the camera).
    this.mini = h('div', 'minimap frame');
    this.miniCanvas = h('canvas'); this.miniCanvas.width = this.miniCanvas.height = 96;
    this.mini.append(this.miniCanvas);
    this.mini.addEventListener('pointerdown', e => { this.miniDrag = true; this.miniPoint(e); });
    this.mini.addEventListener('pointermove', e => { if (this.miniDrag) this.miniPoint(e); });
    addEventListener('pointerup', () => { this.miniDrag = false; });
    // The selection badge: a round portrait with a health ring, a status icon and a short name.
    this.panel = h('div', 'panel badge frame hidden');
    this.wheelAt = null; // tile point the build wheel is drawn around, while it is open
    this.toasts = h('div', 'toasts');
    this.boxEl = h('div', 'dragbox hidden');
    // Alerts drop in as a ribbon at the top centre.
    this.alertEl = h('div', 'alert hidden'); this.alertOn = false; this.alertT = 0;
    // The tutorial pointer: a bouncing arrow over what to tap next.
    this.marker = h('div', 'marker hidden', ICONS.pointer);
    root.append(this.top, this.obj, this.quick, this.mini, this.tray, this.panel, this.boxEl, this.alertEl, this.toasts);
    this.setLayout(game.hudLayout || 'beside');
    // Rings go last so their buttons sit above toasts and panels.
    this.ring = new ActionRing(root, 'on-map');
    this.thumb = new ActionRing(root, 'thumb');
    root.append(this.bubble, this.marker);
    this.terrainImg = this.drawTerrain();
    this.panelKey = ''; this.miniT = 0; this.gains = {};
  }

  // ---------- per-frame refresh ----------
  update(dt) {
    const g = this.g, w = g.world, t = w.teams[0];
    for (const k of RES) this.res[k].textContent = Math.floor(t.res[k]);
    this.res.pop.textContent = `${t.pop}/${t.popCap}`;
    this.tok.pop.classList.toggle('warn', t.pop >= t.popCap);
    const idle = g.idleWorkers().length, army = g.army().length;
    this.idleBtn.querySelector('i').textContent = idle || '';
    this.idleBtn.classList.toggle('dim', !idle);
    this.armyBtn.querySelector('i').textContent = army || '';
    this.armyBtn.classList.toggle('dim', !army);
    this.objectives(dt);
    this.selection();
    this.place();
    this.commands();
    this.pointer();
    if (this.alertOn && this.alertT > 0 && (this.alertT -= dt) <= 0) this.closeAlert();
    this.miniT -= dt;
    if (this.miniT <= 0) { this.miniT = 0.25; this.drawMini(); }
  }

  // ---------- layout: where the tray and the selection card go ----------
  // beside: the card slides out to the right of the tray; above: the card sits above the tray;
  // side: resources are a tab down the left edge and the card sits at the bottom.
  setLayout(name) { this.layout = name; this.root.classList.remove('layout-beside', 'layout-above', 'layout-side'); this.root.classList.add(`layout-${name}`); this.placeKey = ''; }
  place() {
    const q = this.quick, b = parseFloat(getComputedStyle(this.mini).bottom) || 8;
    const x0 = q.offsetLeft + q.offsetWidth + 8;
    const key = [this.layout, x0, b, this.tray.offsetWidth, this.tray.offsetHeight].join();
    if (key === this.placeKey) return;
    this.placeKey = key;
    const set = (el, left, bottom) => { el.style.left = `${left}px`; el.style.bottom = `${bottom}px`; };
    if (this.layout === 'side') { this.tray.style.left = this.tray.style.bottom = ''; set(this.panel, x0, b); }
    else if (this.layout === 'above') { set(this.tray, x0, b); set(this.panel, x0, b + this.tray.offsetHeight + 6); }
    else { set(this.tray, x0, b); set(this.panel, x0 + this.tray.offsetWidth + 8, b); }
  }

  // ---------- resource tokens ----------
  // A "+10" floats up from a token when resources arrive (deposits and goal rewards).
  gain(kind, amt) {
    const tok = this.tok[kind];
    if (!tok || amt <= 0) return;
    const now = performance.now(), last = this.gains[kind];
    if (last && now - last.t < 700 && last.el.isConnected) { last.amt += amt; last.el.textContent = `+${Math.round(last.amt)}`; return; }
    const el = h('span', 'gain', `+${Math.round(amt)}`);
    tok.append(el);
    this.gains[kind] = { t: now, amt, el };
    setTimeout(() => el.remove(), 1300);
  }
  // A token shakes and flashes red when it is what you are missing.
  missing(cost) {
    const r = this.g.world.teams[0].res;
    for (const [k, v] of Object.entries(cost || {})) if (r[k] < v && this.tok[k]) { const t = this.tok[k]; t.classList.remove('short'); void t.offsetWidth; t.classList.add('short'); }
  }
  popFull() { const t = this.tok.pop; t.classList.remove('short'); void t.offsetWidth; t.classList.add('short'); }

  // ---------- the quest scroll ----------
  objectives(dt) {
    const tut = this.g.tutorial, step = tut.step, n = tut.i;
    if (this.objOpenT > 0 && (this.objOpenT -= dt) <= 0) this.obj.classList.add('closed');
    const key = step ? n : 'done';
    if (key === this.objKey) return;
    this.objKey = key;
    const p = step ? n / tut.total : 1;
    this.objHead.innerHTML = `<span class="prog" style="--p:${p}">${ICONS.scroll}</span><span class="n">${step ? `${n + 1}/${tut.total}` : `${tut.total}/${tut.total}`}</span><b>${step ? step.short : 'All done!'}</b>`;
    this.objBody.innerHTML = step ? `<b>${step.title}</b><p>${step.hint}</p>` : '<b>All goals done!</b><p>Well played! Now win the match.</p>';
    this.obj.classList.remove('closed'); this.objOpenT = innerHeight < 430 ? 4 : 5; // then it folds back to the ring
    this.obj.classList.remove('pulse'); void this.obj.offsetWidth; this.obj.classList.add('pulse');
  }
  // A finished goal: a stamped tick, a fanfare and the reward floating onto the tokens.
  goalDone(step, reward) {
    const stamp = h('span', 'stamp', ICONS.check);
    this.objHead.append(stamp);
    setTimeout(() => stamp.remove(), 1400);
    this.g.audio?.sfx('built');
    if (reward) for (const [k, v] of Object.entries(reward)) this.gain(k, v);
  }
  // Stuck for a while: the guide wiggles and says the line again.
  guideNudge(hint) {
    this.bubble.classList.remove('wiggle'); void this.bubble.offsetWidth; this.bubble.classList.add('wiggle');
    if (this.sayText) this.g.audio?.speak(this.sayText, true);
    if (this.bubble.classList.contains('hidden')) this.toast(hint, 'hint');
  }

  // ---------- the tutorial pointer and the guide's bubble ----------
  pointer() {
    const g = this.g, v = g.view, tut = g.tutorial;
    const guide = !g.paused && !g.over ? tut.guide() : {};
    const uiEl = guide.ui ? this.root.querySelector(guide.ui) : null;
    if (this.pointed && this.pointed !== uiEl) this.pointed.classList.remove('pointed');
    this.pointed = uiEl;
    this.marker.classList.toggle('nudge', tut.nudge > 0);
    let x, y, angle = 0, edge = false;
    if (uiEl) {
      uiEl.classList.add('pointed');
      const r = uiEl.getBoundingClientRect(), root = this.root.getBoundingClientRect();
      x = r.left + r.width / 2 - root.left; y = r.top - root.top - 6;
      if (y < 60) { y = r.bottom - root.top + 6; angle = 180; }
    } else if (guide.at && g.world.get(guide.at.id)) {
      const e = guide.at, [cx, cy] = g.world.center(e);
      const hgt = e.cat === 'unit' ? 1.4 : e.cat === 'res' ? (e.kind === 'tree' ? 2.6 : 1.4) : Math.max(1.5, (v.blds.get(e.id)?.art.height || 2) * 0.9);
      [x, y] = v.screen(cx, cy, hgt);
      // Off screen: an arrow on the edge of the screen points the way.
      const m = 34, top = 56;
      if (x < m || x > v.w - m || y < top || y > v.h - m) {
        const ox = v.w / 2, oy = v.h / 2, dx = x - ox, dy = y - oy;
        const k = Math.min((v.w / 2 - m) / Math.abs(dx || 1e-6), (v.h / 2 - m) / Math.abs(dy || 1e-6));
        x = ox + dx * k; y = Math.max(top, oy + dy * k);
        angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;
        edge = true;
      }
    } else { this.marker.classList.add('hidden'); this.showBubble(null); return; }
    this.marker.classList.toggle('edge', edge);
    this.marker.classList.remove('hidden');
    this.marker.style.transform = `translate(${x - 18}px, ${y - 36}px) rotate(${angle}deg)`;
    this.marker.style.transformOrigin = '18px 36px';
    this.showBubble(guide.say || (guide.hint || '').split(/(?<=[.!?])\s/)[0], x, y, angle);
  }
  // The guide says the line in a bubble beside the arrow, and reads it aloud once.
  showBubble(text, x, y, angle = 0) {
    const b = this.bubble;
    if (!text) { b.classList.add('hidden'); return; }
    if (text !== this.sayText) {
      this.sayText = text;
      b.querySelector('.say').textContent = text;
      this.g.audio?.speak(text);
    }
    b.classList.remove('hidden');
    const v = this.g.view, bw = b.offsetWidth || 160, bh = b.offsetHeight || 40;
    // Beside the arrow, on the side with more room; above it when the arrow points up.
    let bx = x + 24 + bw > v.w - 8 ? x - 24 - bw : x + 24;
    let by = angle === 180 ? y + 6 : y - bh - 10;
    bx = Math.max(8, Math.min(v.w - bw - 8, bx)); by = Math.max(46, Math.min(v.h - bh - 70, by));
    b.style.transform = `translate(${bx}px, ${by}px)`;
  }

  // ---------- alerts ----------
  alert(text, actions = [], kind = '', ttl = 0) {
    this.alertEl.className = `alert frame ${kind}`;
    const icon = kind === 'bad' ? ICONS.amove : kind === 'bell' ? ICONS.bell : kind === 'good' ? ICONS.clear : ICONS.objectives;
    this.alertEl.innerHTML = `<span class="ai">${icon}</span><span class="at">${text}</span>`;
    for (const a of actions) {
      const b = h('button', '', `${a.icon || ''}<span>${a.label}</span>`);
      b.onclick = e => { e.stopPropagation(); a.act(); if (!a.keep) this.closeAlert(); };
      this.alertEl.append(b);
    }
    const x = h('button', 'x', ICONS.cancel); x.title = 'Close'; x.onclick = () => this.closeAlert();
    this.alertEl.append(x);
    this.alertOn = true; this.alertT = ttl;
  }
  closeAlert() { this.alertEl.className = 'alert hidden'; this.alertOn = false; this.bellShown = false; }
  // While workers shelter, a lasting ribbon offers the all-clear.
  bellAlert(safe = false) {
    const n = this.g.world.allUnits ? [...this.g.world.allUnits()].filter(u => u.team === 0 && (u.inside || u.order?.type === 'shelter')).length : 0;
    this.alert(safe ? 'It looks safe now.' : `Bell! ${n} workers are hiding.`,
      [{ label: 'All clear', icon: ICONS.clear, act: () => this.g.allClear() }], safe ? 'good' : 'bell', 0);
    this.bellShown = true;
  }
  clearAlert() { if (this.bellShown) this.closeAlert(); }
  paintMute() {
    const m = this.g.audio?.settings.muted;
    this.muteBtn.innerHTML = m ? ICONS.soundOff : ICONS.sound;
    this.muteBtn.title = m ? 'Sound off (tap to turn on)' : 'Sound on (tap to mute)';
    this.muteBtn.classList.toggle('dim', !!m);
  }

  // ---------- the selection badge ----------
  selection() {
    const g = this.g, w = g.world, ents = g.sel.map(id => w.get(id)).filter(Boolean);
    if (!ents.length) { this.panel.classList.add('hidden'); this.panelKey = ''; return; }
    this.panel.classList.remove('hidden');
    if (ents.length > 1) {
      // A group: one stacked portrait per kind, with a count. Tap one to keep only that kind.
      const counts = {};
      for (const e of ents) counts[e.type] = (counts[e.type] || 0) + 1;
      const key = 'multi' + JSON.stringify(counts);
      if (key !== this.panelKey) {
        this.panelKey = key;
        const iconOf = k => { const e = ents.find(x => x.type === k); return e.cat === 'unit' ? unitIcon(w.def(e.team, k)) : ICONS[k]; };
        const col = w.teams[ents[0].team ?? 0].nation.color;
        this.panel.innerHTML = `<div class="multi">${Object.entries(counts).map(([k, v]) => `<button class="chip" data-type="${k}" style="--tc:${col}" title="${ents.find(x => x.type === k).cat === 'unit' ? w.def(0, k).name : CONFIG.buildings[k]?.name || ''}">${iconOf(k)}<b>${v}</b></button>`).join('')}</div>`;
        this.panel.querySelectorAll('.chip').forEach(b => { b.onclick = () => g.narrowTo(b.dataset.type); });
      }
      return;
    }
    const e = ents[0], own = e.team === 0;
    const name = e.cat === 'res' ? { tree: 'Tree', gold: 'Gold Mine', berries: 'Berry Bush' }[e.kind] : (e.cat === 'bld' ? CONFIG.buildings[e.type].name : w.def(e.team, e.type).name);
    const icon = e.cat === 'res' ? ICONS[RES_OF[e.kind]] : e.cat === 'unit' ? unitIcon(w.def(e.team, e.type)) : ICONS[e.type];
    const key = `one${e.id}`;
    if (key !== this.panelKey) {
      this.panelKey = key;
      const team = e.team !== undefined ? w.teams[e.team].nation : null;
      this.panel.innerHTML = `<div class="pic" style="--tc:${team ? team.color : '#c8b890'}"><span class="hp"></span><span class="face">${icon}</span><span class="st"></span></div>
        <div class="info"><div class="name">${name}</div><div class="sub2"></div></div><div class="queue"></div>`;
      this.panel.title = name + (team && !own ? ` (${team.name})` : '');
      this.panel.classList.toggle('enemy', !!team && !own);
      this.pHp = this.panel.querySelector('.hp'); this.pSt = this.panel.querySelector('.st'); this.pSub = this.panel.querySelector('.sub2'); this.pQueue = this.panel.querySelector('.queue');
      this.queueKey = ''; this.stKey = '';
    }
    // The health ring (gold for what is left in a resource).
    const frac = e.cat === 'res' ? e.amount / e.max : e.cat === 'bld' && !e.built ? e.progress : Math.max(0, e.hp) / e.maxHp;
    this.pHp.style.setProperty('--p', frac.toFixed(3));
    this.pHp.className = `hp ${e.cat === 'res' ? 'res' : e.cat === 'bld' && !e.built ? 'build' : frac < 0.35 ? 'low' : ''}`;
    // A short line: HP, "Building 40%", or what is left.
    this.pSub.textContent = e.cat === 'res' ? `${Math.ceil(e.amount)} left` : e.cat === 'bld' && !e.built ? `${Math.floor(e.progress * 100)}%` : `${Math.ceil(e.hp)}/${e.maxHp}`;
    // What the unit is doing, as an icon: the resource it gathers, a hammer, a flag, swords, zzz.
    let st = null;
    if (e.cat === 'unit' && own) {
      const o = e.order, tgt = o && w.get(o.target ?? o.then);
      st = !o ? 'idle' : (o.type === 'gather' || o.type === 'return') ? (tgt ? (tgt.cat === 'bld' ? 'food' : RES_OF[tgt.kind]) : e.carry?.type || 'lumber') : STATUS[o.type];
    } else if (e.cat === 'bld' && own && e.queue.length && e.queue[0].blocked && w.teams[0].pop >= w.teams[0].popCap) st = 'house';
    if (st !== this.stKey) { this.stKey = st; this.pSt.innerHTML = st ? ICONS[st] || '' : ''; this.pSt.classList.toggle('hidden', !st); this.pSt.classList.toggle('warn', st === 'house'); }
    // Training queue: small icons; the first shows its progress. Tap one to cancel it.
    const q = e.cat === 'bld' && own ? e.queue : [];
    const qk = q.map(x => x.type).join(',');
    if (qk !== this.queueKey) {
      this.queueKey = qk;
      this.pQueue.innerHTML = q.map((x, i) => `<button class="qitem" data-i="${i}" title="Cancel">${unitIcon(w.def(e.team, x.type))}${i === 0 ? '<s><i></i></s>' : ''}</button>`).join('');
      this.pQueue.querySelectorAll('.qitem').forEach(b => { b.onclick = () => g.cancelTraining(e.id, +b.dataset.i); });
    }
    if (q.length) {
      const first = q[0], p = Math.min(1, first.t / w.def(e.team, first.type).time);
      const bar = this.pQueue.querySelector('s i'); if (bar) bar.style.width = `${p * 100}%`;
    }
  }

  // ---------- actions: rings on the map and the thumb zone ----------
  // Buildings show their actions in a ring around themselves; a building outline being placed
  // shows its tick and cross beside it; selected units get thumb-zone buttons (bottom right),
  // where Build opens a wheel of buildings.
  commands() {
    const g = this.g, w = g.world, v = g.view;
    const ents = g.sel.map(id => w.get(id)).filter(e => e && e.team === 0);
    const compact = v.h < 700;
    // Rings stay below the top bar and above the info panel.
    const st = this.safeTop ?? (this.safeTop = parseFloat(getComputedStyle(this.top).top) - 6 || 0);
    const sb = this.safeBottom ?? (this.safeBottom = parseFloat(getComputedStyle(this.panel).bottom) - 8 || 0);
    const sr = this.safeRight ?? (this.safeRight = parseFloat(getComputedStyle(this.top).right) - 8 || 0);
    const bounds = { w: v.w, h: v.h, top: (v.h <= 430 ? 40 : 50) + st, bottom: 8 + sb };
    const ppu = v.ppu;
    let ring = null, thumb = null;

    if (g.placing) {
      const p = g.placing, s = CONFIG.buildings[p.type].size;
      // The tick sits to the right of the outline and the cross to the left.
      ring = {
        anchor: v.screen(p.x + s / 2, p.y + s / 2, 0.3),
        items: [
          { id: 'ok', icon: ICONS.check, label: 'Build', cls: 'go', poor: !p.ok, act: () => g.confirmPlacement() },
          { id: 'no', icon: ICONS.cancel, label: 'Cancel', cls: 'stop', act: () => g.cancelPlacement() },
        ],
        opts: { radius: s * TILE * ppu * 0.62 + 40, center: 90, step: 180 },
      };
    } else if (g.rallyMode) {
      thumb = { items: [{ id: 'no', icon: ICONS.cancel, label: 'Cancel', cls: 'stop', act: () => { g.rallyMode = false; } }] };
    } else if (g.amoveMode) {
      thumb = { items: [{ id: 'no', icon: ICONS.cancel, label: 'Cancel', cls: 'stop', act: () => { g.amoveMode = false; } }] };
    } else if (ents.length && ents.every(e => e.cat === 'bld' && e.type === ents[0].type) && (ents.length === 1 || ents.every(e => e.built))) {
      // One building, or every building of one type (double-tap or long-press): the ring sits on
      // the building that was tapped, and training goes to whichever has the shortest queue.
      const b = ents.find(e => e.id === g.focus) || ents[0], d = CONFIG.buildings[b.type], ids = ents.map(e => e.id);
      let items = [];
      if (!b.built) items = [{ id: 'cc', icon: ICONS.cancel, label: 'Cancel', cls: 'stop', hint: 'Cancel construction (refund)', act: () => g.cancelConstruction(b.id) }];
      else {
        items = (d.trains || []).map(type => {
          const u = w.def(0, type);
          let n = 0, prog = 0, room = false;
          for (const e of ents) {
            n += e.queue.filter(q => q.type === type).length;
            if (e.queue.length < 5) room = true;
            const first = e.queue[0];
            if (first && first.type === type) prog = Math.max(prog, Math.min(1, first.t / u.time));
          }
          return {
            id: 't' + type, icon: unitIcon(u), label: u.short, cost: u.cost, hint: `Train a ${u.name}${u.ability ? ` (${u.ability.name}: ${u.ability.text})` : ''}. Hold to queue five.`,
            poor: !w.canAfford(0, u.cost) || !room, badge: n, progress: prog,
            act: () => g.trainUnit(ids, type), hold: () => g.trainUnit(ids, type, 5),
          };
        });
        if (d.trains) items.push({ id: 'rally', icon: ICONS.rally, label: 'Rally', hint: 'Set where new units go', act: () => { g.rallyMode = true; this.toast('Tap where new units should go.'); } });
        if (b.type === 'towncenter') {
          items.push(w.teams[0].bell
            ? { id: 'clear', icon: ICONS.clear, label: 'All clear', cls: 'go', hint: 'Send the workers back to work', badge: w.sheltered(b).length, act: () => g.allClear() }
            : { id: 'bell', icon: ICONS.bell, label: 'Bell', cls: 'warn', hint: 'Ring the Town bell: workers hide inside and the Town Center shoots harder', act: () => g.ringBell() });
        }
      }
      const [cx, cy] = w.center(b), view = g.view.blds.get(b.id);
      const hgt = view ? Math.min(2.2, view.art.height * 0.45) : 1;
      const anchor = v.screen(cx, cy, hgt), radius = b.w * TILE * ppu * 0.5 + 34;
      ring = { anchor, items, opts: { radius, center: anchor[1] - radius < bounds.top + 40 ? 90 : -90 } };
    } else if (ents.length && ents.every(e => e.cat === 'unit')) {
      const workers = ents.filter(e => e.type === 'worker');
      if (!workers.length) this.wheelAt = null;
      if (this.wheelAt) {
        // The build wheel: a full ring of buildings around where the worker stood.
        const items = CONFIG.buildOrder.map(type => {
          const d = CONFIG.buildings[type];
          return { id: 'b' + type, icon: ICONS[type], label: d.name, cost: d.cost, poor: !w.canAfford(0, d.cost), act: () => { this.wheelAt = null; g.startPlacement(type); } };
        });
        items.push({ id: 'back', icon: ICONS.cancel, label: 'Close', cls: 'stop', act: () => { this.wheelAt = null; } });
        ring = { anchor: v.screen(this.wheelAt[0], this.wheelAt[1], 0.5), items, opts: { radius: compact ? 96 : 110, center: -90, step: 360 / items.length } };
      } else {
        const soldiers = ents.length > workers.length;
        thumb = { items: [
          ...(workers.length ? [{ id: 'build', icon: ICONS.build, label: 'Build', cls: 'main', act: () => { const u = workers[0]; this.wheelAt = [u.x, u.y]; } }] : []),
          ...(soldiers ? [
            { id: 'amove', icon: ICONS.amove, label: 'Attack', cls: workers.length ? '' : 'main', hint: 'Attack-move: tap a spot; they fight everything on the way', act: () => { g.amoveMode = true; this.toast('Tap where to attack.'); } },
            { id: 'hold', icon: ICONS.hold, label: 'Hold', hint: 'Hold position: stay put and strike anything in reach', on: ents.every(e => e.type === 'worker' || e.order?.type === 'hold'), act: () => g.holdPosition() },
          ] : []),
          { id: 'stop', icon: ICONS.stop, label: 'Stop', act: () => g.stop() },
        ] };
      }
    }
    if (!(ents.length && ents.every(e => e.cat === 'unit' ) && ents.some(e => e.type === 'worker'))) this.wheelAt = null;

    if (ring && (ring.anchor[0] < -40 || ring.anchor[0] > v.w + 40 || ring.anchor[1] < -40 || ring.anchor[1] > v.h + 40)) ring = null;
    // Rings on the map stay clear of the info panel at the bottom of the screen.
    const low = Math.max(this.panel.classList.contains('hidden') ? 0 : v.h - this.panel.offsetTop, this.layout === 'side' ? 0 : v.h - this.tray.offsetTop);
    if (ring) this.ring.show(ring.anchor, ring.items, { ...ring.opts, bounds: { ...bounds, bottom: Math.max(bounds.bottom, low + 8) } }); else this.ring.hide();
    if (thumb) {
      // The thumb zone: a column of buttons climbing the right edge from the bottom corner,
      // under the right thumb, beside the info panel.
      const t = v.h <= 430 ? 26 : 32; // half a thumb button (smaller on phones)
      this.thumb.show([v.w - 6 - sr - t, v.h - 6 - sb - t], thumb.items, { stack: t * 2 + 8, bounds });
    } else this.thumb.hide();
  }

  // ---------- minimap ----------
  drawTerrain() {
    const w = this.g.world, n = w.size, c = document.createElement('canvas');
    c.width = c.height = n;
    const x = c.getContext('2d'), img = x.createImageData(n, n);
    const col = { [T.GRASS]: [118, 170, 76], [T.WATER]: [59, 143, 200], [T.FORD]: [150, 190, 200], [T.ROCK]: [130, 124, 114] };
    for (let i = 0; i < n * n; i++) { const c3 = col[w.map.terrain[i]] || col[T.GRASS]; img.data.set([...c3, 255], i * 4); }
    x.putImageData(img, 0, 0);
    return c;
  }
  drawMini() {
    const g = this.g, w = g.world, n = w.size, c = this.miniCanvas, x = c.getContext('2d'), k = c.width / n;
    x.imageSmoothingEnabled = false;
    x.drawImage(this.terrainImg, 0, 0, c.width, c.height);
    for (const r of w.resources()) { x.fillStyle = r.kind === 'tree' ? '#2f5f2a' : r.kind === 'gold' ? '#f2c040' : '#c8304a'; x.fillRect(r.x * k, r.y * k, Math.max(1, r.w * k), Math.max(1, r.h * k)); }
    for (const b of w.buildings()) { x.fillStyle = w.teams[b.team].nation.color; x.fillRect(b.x * k, b.y * k, b.w * k, b.h * k); x.strokeStyle = '#0008'; x.lineWidth = 0.6; x.strokeRect(b.x * k, b.y * k, b.w * k, b.h * k); }
    for (const u of w.units()) { x.fillStyle = u.team === 0 ? '#fff' : w.teams[u.team].nation.color; x.fillRect(u.x * k - 1, u.y * k - 1, 2, 2); }
    for (const p of g.pings) { x.strokeStyle = `rgba(255,60,60,${p.t})`; x.lineWidth = 1.5; x.beginPath(); x.arc(p.x * k, p.y * k, 3 + (1 - p.t) * 8, 0, 7); x.stroke(); }
    // The camera's view.
    const v = g.view, corners = [[0, 0], [v.w, 0], [v.w, v.h], [0, v.h]].map(([sx, sy]) => v.pick(sx, sy)).filter(Boolean);
    if (corners.length === 4) { x.strokeStyle = '#fff'; x.lineWidth = 1; x.beginPath(); corners.forEach(([tx, ty], i) => (i ? x.lineTo : x.moveTo).call(x, tx * k, ty * k)); x.closePath(); x.stroke(); }
  }
  miniPoint(e) {
    const r = this.mini.getBoundingClientRect(), u = e.clientX - (r.left + r.width / 2), v = e.clientY - (r.top + r.height / 2);
    const size = this.miniCanvas.getBoundingClientRect().width / Math.SQRT2; // the turned canvas's edge on screen
    const lx = (u + v) / Math.SQRT2, ly = (v - u) / Math.SQRT2;
    const n = this.g.world.size;
    this.g.view.centerOn((lx / size + 0.5) * n, (ly / size + 0.5) * n);
  }

  // ---------- toasts and the drag box ----------
  toast(text, kind = '') {
    const el = h('div', `toast ${kind}`, text);
    this.toasts.append(el);
    while (this.toasts.children.length > 2) this.toasts.firstChild.remove();
    const life = kind === 'hint' ? 6000 : 2600;
    setTimeout(() => el.classList.add('out'), life);
    setTimeout(() => el.remove(), life + 600);
    if (kind === 'bad') this.g.audio?.sfx('deny', 0.4);
  }
  box(x0, y0, x1, y1) {
    const s = this.boxEl.style;
    this.boxEl.classList.remove('hidden');
    s.left = `${Math.min(x0, x1)}px`; s.top = `${Math.min(y0, y1)}px`; s.width = `${Math.abs(x1 - x0)}px`; s.height = `${Math.abs(y1 - y0)}px`;
  }
  hideBox() { this.boxEl.classList.add('hidden'); }
}
