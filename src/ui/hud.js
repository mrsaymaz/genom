// The heads-up display: resource bar, objectives, minimap, selection panel, command card,
// quick-select buttons, toasts and the drag box. Plain DOM over the 3D canvas.
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
const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export class HUD {
  constructor(root, game) {
    this.g = game; this.root = root;
    root.innerHTML = '';
    // Top bar.
    this.top = h('div', 'hud-top');
    this.res = {};
    for (const k of [...RES, 'pop']) { const s = h('div', 'res', `${ICONS[k]}<b>0</b>`); s.title = k === 'pop' ? 'Population' : k[0].toUpperCase() + k.slice(1); this.res[k] = s.querySelector('b'); this.top.append(s); }
    this.clock = h('div', 'clock', '0:00');
    this.muteBtn = h('button', 'icon-btn'); this.muteBtn.onclick = () => game.toggleMute?.();
    this.pauseBtn = h('button', 'icon-btn', ICONS.pause); this.pauseBtn.title = 'Pause'; this.pauseBtn.onclick = () => game.togglePause();
    this.top.append(this.clock, this.muteBtn, this.pauseBtn);
    this.paintMute();
    // Objectives.
    this.obj = h('div', 'objectives');
    this.objHead = h('button', 'obj-head');
    this.objBody = h('div', 'obj-body');
    this.objHead.onclick = () => { this.obj.classList.toggle('closed'); this.objOpenT = this.obj.classList.contains('closed') ? 0 : 8; };
    this.obj.append(this.objHead, this.objBody);
    // Quick-select buttons.
    this.quick = h('div', 'quick');
    this.idleBtn = h('button', 'icon-btn', `${ICONS.idle}<i></i>`); this.idleBtn.title = 'Next idle worker (hold: all idle workers)'; holdable(this.idleBtn, () => game.selectIdleWorker(), () => game.selectAllIdle());
    this.armyBtn = h('button', 'icon-btn', `${ICONS.army}<i></i>`); this.armyBtn.title = 'Select all soldiers'; this.armyBtn.onclick = () => game.selectArmy();
    this.homeBtn = h('button', 'icon-btn', ICONS.towncenter); this.homeBtn.title = 'Go to Town Center'; this.homeBtn.onclick = () => game.goHome();
    this.quick.append(this.idleBtn, this.armyBtn, this.homeBtn);
    // Minimap (a diamond, turned to match the camera).
    this.mini = h('div', 'minimap');
    this.miniCanvas = h('canvas'); this.miniCanvas.width = this.miniCanvas.height = 96;
    this.mini.append(this.miniCanvas);
    this.mini.addEventListener('pointerdown', e => { this.miniDrag = true; this.miniPoint(e); });
    this.mini.addEventListener('pointermove', e => { if (this.miniDrag) this.miniPoint(e); });
    addEventListener('pointerup', () => { this.miniDrag = false; });
    // Bottom: selection panel and command card.
    this.panel = h('div', 'panel hidden');
    this.wheelAt = null; // tile point the build wheel is drawn around, while it is open
    this.toasts = h('div', 'toasts');
    this.boxEl = h('div', 'dragbox hidden');
    // Alerts (raids, the bell) sit under the top bar, with buttons to act on them.
    this.alertEl = h('div', 'alert hidden'); this.alertOn = false; this.alertT = 0;
    // The tutorial pointer: a bouncing arrow over what to tap next.
    this.marker = h('div', 'marker hidden', ICONS.pointer);
    root.append(this.top, this.obj, this.quick, this.mini, this.panel, this.toasts, this.boxEl, this.alertEl);
    // Rings go last so their buttons sit above toasts and panels.
    this.ring = new ActionRing(root, 'on-map');
    this.thumb = new ActionRing(root, 'thumb');
    root.append(this.marker);
    this.terrainImg = this.drawTerrain();
    this.panelKey = ''; this.miniT = 0;
  }

  // ---------- per-frame refresh ----------
  update(dt) {
    const g = this.g, w = g.world, t = w.teams[0];
    for (const k of RES) this.res[k].textContent = Math.floor(t.res[k]);
    this.res.pop.textContent = `${t.pop}/${t.popCap}`;
    this.res.pop.parentElement.classList.toggle('warn', t.pop >= t.popCap);
    this.clock.textContent = fmtTime(w.time);
    const idle = g.idleWorkers().length, army = g.army().length;
    this.idleBtn.querySelector('i').textContent = idle || '';
    this.idleBtn.classList.toggle('dim', !idle);
    this.armyBtn.querySelector('i').textContent = army || '';
    this.armyBtn.classList.toggle('dim', !army);
    this.objectives(dt);
    this.selection();
    this.commands();
    this.pointer();
    if (this.alertOn && this.alertT > 0 && (this.alertT -= dt) <= 0) this.closeAlert();
    this.miniT -= dt;
    if (this.miniT <= 0) { this.miniT = 0.25; this.drawMini(); }
  }

  // The goal panel opens on each new goal, then folds down to a one-line strip so it covers
  // less of the map. Tap the strip to open it again.
  objectives(dt) {
    const tut = this.g.tutorial, step = tut.step, n = tut.i;
    if (this.objOpenT > 0 && (this.objOpenT -= dt) <= 0) this.obj.classList.add('closed');
    const key = step ? n : 'done';
    if (key === this.objKey) return;
    this.objKey = key;
    this.objHead.innerHTML = `${ICONS.objectives}<span class="n">${step ? `${n + 1}/${tut.total}` : ''}</span><b>${step ? step.title : 'All goals done!'}</b>`;
    this.objBody.innerHTML = step ? `<p>${step.hint}</p>` : '<p>Well played! Now win the match.</p>';
    this.obj.classList.remove('closed'); this.objOpenT = 8;
    this.obj.classList.remove('pulse'); void this.obj.offsetWidth; this.obj.classList.add('pulse');
  }

  // ---------- the tutorial pointer ----------
  pointer() {
    const g = this.g, v = g.view, tut = g.tutorial;
    const guide = !g.paused && !g.over ? tut.guide() : {};
    const uiEl = guide.ui ? this.root.querySelector(guide.ui) : null;
    if (this.pointed && this.pointed !== uiEl) this.pointed.classList.remove('pointed');
    this.pointed = uiEl;
    this.marker.classList.toggle('nudge', tut.nudge > 0);
    let x, y, angle = 0;
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
        this.marker.classList.add('edge');
      } else this.marker.classList.remove('edge');
    } else { this.marker.classList.add('hidden'); return; }
    this.marker.classList.remove('hidden');
    this.marker.style.transform = `translate(${x - 18}px, ${y - 36}px) rotate(${angle}deg)`;
    this.marker.style.transformOrigin = '18px 36px';
  }

  // ---------- alerts ----------
  alert(text, actions = [], kind = '', ttl = 0) {
    this.alertEl.className = `alert ${kind}`;
    this.alertEl.innerHTML = `<span>${text}</span>`;
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
  // While workers shelter, a lasting banner offers the all-clear.
  bellAlert(safe = false) {
    const n = this.g.world.allUnits ? [...this.g.world.allUnits()].filter(u => u.team === 0 && (u.inside || u.order?.type === 'shelter')).length : 0;
    this.alert(safe ? 'It looks safe now.' : `Bell! ${n} workers are hiding. The Town Center shoots harder.`,
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

  // ---------- selection panel ----------
  selection() {
    const g = this.g, w = g.world, ents = g.sel.map(id => w.get(id)).filter(Boolean);
    if (!ents.length) { this.panel.classList.add('hidden'); this.panelKey = ''; return; }
    this.panel.classList.remove('hidden');
    if (ents.length > 1) {
      const counts = {};
      for (const e of ents) counts[e.type] = (counts[e.type] || 0) + 1;
      const key = 'multi' + JSON.stringify(counts);
      if (key !== this.panelKey) {
        this.panelKey = key;
        const iconOf = k => { const e = ents.find(x => x.type === k); return e.cat === 'unit' ? unitIcon(w.def(e.team, k)) : ICONS[k]; };
        this.panel.innerHTML = `<div class="multi">${Object.entries(counts).map(([k, v]) => `<button class="chip" data-type="${k}" title="${ents.find(x => x.type === k).cat === 'unit' ? w.def(0, k).name : ''}">${iconOf(k)}<b>${v}</b></button>`).join('')}</div>`;
        this.panel.querySelectorAll('.chip').forEach(b => { b.onclick = () => g.narrowTo(b.dataset.type); });
      }
      return;
    }
    const e = ents[0];
    const own = e.team === 0;
    const name = e.cat === 'res' ? { tree: 'Tree', gold: 'Gold Mine', berries: 'Berry Bush' }[e.kind] : (e.cat === 'bld' ? CONFIG.buildings[e.type].name : w.def(e.team, e.type).name);
    const icon = e.cat === 'res' ? ICONS[{ tree: 'lumber', gold: 'gold', berries: 'food' }[e.kind]] : e.cat === 'unit' ? unitIcon(w.def(e.team, e.type)) : ICONS[e.type];
    const key = `one${e.id}`;
    if (key !== this.panelKey) {
      this.panelKey = key;
      const team = e.team !== undefined ? w.teams[e.team].nation : null;
      this.panel.innerHTML = `<div class="portrait" style="--tc:${team ? team.color : '#c8b890'}">${icon}</div>
        <div class="info"><div class="name">${name}${team && !own ? ` <small>${team.name}</small>` : ''}</div>
        <div class="bar"><i></i></div><div class="status"></div><div class="queue"></div></div>`;
      this.pBar = this.panel.querySelector('.bar i'); this.pStatus = this.panel.querySelector('.status'); this.pQueue = this.panel.querySelector('.queue');
      this.queueKey = '';
    }
    if (e.cat === 'res') { this.pBar.style.width = `${100 * e.amount / e.max}%`; this.pBar.className = 'res'; this.pStatus.textContent = `${Math.ceil(e.amount)} left`; this.pQueue.innerHTML = ''; return; }
    this.pBar.className = e.hp / e.maxHp < 0.35 ? 'low' : '';
    this.pBar.style.width = `${100 * Math.max(0, e.hp) / e.maxHp}%`;
    let status = `${Math.ceil(e.hp)} / ${e.maxHp}`;
    if (e.cat === 'bld' && !e.built) status = `Building ${Math.floor(e.progress * 100)}%`;
    else if (e.cat === 'unit' && own) {
      const o = e.order, tgt = o && w.get(o.target);
      const what = o ? ({ gather: tgt ? `Gathering ${tgt.cat === 'bld' ? 'food' : { tree: 'lumber', gold: 'gold', berries: 'food' }[tgt.kind]}` : 'Gathering', return: 'Carrying back', build: 'Building', move: 'Moving', amove: 'Attacking', attack: 'Attacking' }[o.type] || '') : 'Idle';
      status += ` · ${what}${e.carry && e.carry.amt >= 1 ? ` (${Math.floor(e.carry.amt)} ${e.carry.type})` : ''}`;
    }
    this.pStatus.textContent = status;
    // Training queue (tap an item to cancel it).
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
      const t = w.teams[0];
      this.pStatus.textContent = first.blocked && t.pop >= t.popCap ? 'Need more houses for population' : status;
    }
  }

  // ---------- actions: rings on the map and the thumb zone ----------
  // Buildings show their actions in a ring around themselves; a building outline being placed
  // shows its tick and cross beside it; selected units get thumb-zone buttons (bottom right),
  // where Build opens a wheel of buildings.
  commands() {
    const g = this.g, w = g.world, v = g.view;
    const ents = g.sel.map(id => w.get(id)).filter(e => e && e.team === 0);
    const compact = v.h < 460;
    const bounds = { w: v.w, h: v.h, top: compact ? 44 : 56, bottom: 4 };
    const ppu = v.h / v.zoom;
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
    if (ring) this.ring.show(ring.anchor, ring.items, { ...ring.opts, bounds: { ...bounds, bottom: this.panel.classList.contains('hidden') ? 4 : (compact ? 96 : 108) } }); else this.ring.hide();
    if (thumb) {
      // The thumb zone: buttons in a quarter circle around the bottom-right corner.
      const corner = [v.w - 10, v.h - 10];
      const n = thumb.items.length, r = n <= 2 ? (compact ? 62 : 74) : n === 3 ? (compact ? 100 : 112) : (compact ? 132 : 146);
      this.thumb.show(corner, thumb.items, { radius: r, center: -135, step: n <= 2 ? 62 : 90 / (n - 1), bounds });
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
