// The heads-up display: resource bar, objectives, minimap, selection panel, command card,
// quick-select buttons, toasts and the drag box. Plain DOM over the 3D canvas.
import { CONFIG } from '../config.js';
import { ICONS } from './icons.js';
import { T } from '../sim/map.js';

const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const RES = ['food', 'lumber', 'gold'];
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
    this.pauseBtn = h('button', 'icon-btn', ICONS.pause); this.pauseBtn.title = 'Pause'; this.pauseBtn.onclick = () => game.togglePause();
    this.top.append(this.clock, this.pauseBtn);
    // Objectives.
    this.obj = h('div', 'objectives');
    this.objHead = h('button', 'obj-head');
    this.objBody = h('div', 'obj-body');
    this.objHead.onclick = () => this.obj.classList.toggle('closed');
    this.obj.append(this.objHead, this.objBody);
    // Quick-select buttons.
    this.quick = h('div', 'quick');
    this.idleBtn = h('button', 'icon-btn', `${ICONS.idle}<i></i>`); this.idleBtn.title = 'Next idle worker'; this.idleBtn.onclick = () => game.selectIdleWorker();
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
    this.card = h('div', 'card');
    this.toasts = h('div', 'toasts');
    this.boxEl = h('div', 'dragbox hidden');
    root.append(this.top, this.obj, this.quick, this.mini, this.panel, this.card, this.toasts, this.boxEl);
    this.terrainImg = this.drawTerrain();
    this.cardKey = ''; this.panelKey = ''; this.miniT = 0;
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
    this.objectives();
    this.selection();
    this.commands();
    this.miniT -= dt;
    if (this.miniT <= 0) { this.miniT = 0.25; this.drawMini(); }
  }

  objectives() {
    const tut = this.g.tutorial, step = tut.step, n = tut.i;
    const key = step ? n : 'done';
    if (key === this.objKey) return;
    this.objKey = key;
    this.objHead.innerHTML = `${ICONS.objectives}<span>${step ? `Goal ${n + 1} of ${tut.total}` : 'All goals done'}</span>`;
    this.objBody.innerHTML = step ? `<b>${step.title}</b><p>${step.hint}</p>` : '<p>Well played!</p>';
    this.obj.classList.remove('closed');
    this.obj.classList.remove('pulse'); void this.obj.offsetWidth; this.obj.classList.add('pulse');
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
        this.panel.innerHTML = `<div class="multi">${Object.entries(counts).map(([k, v]) => `<button class="chip" data-type="${k}">${ICONS[k]}<b>${v}</b></button>`).join('')}</div>`;
        this.panel.querySelectorAll('.chip').forEach(b => { b.onclick = () => g.narrowTo(b.dataset.type); });
      }
      return;
    }
    const e = ents[0];
    const own = e.team === 0;
    const name = e.cat === 'res' ? { tree: 'Tree', gold: 'Gold Mine', berries: 'Berry Bush' }[e.kind] : (e.cat === 'bld' ? CONFIG.buildings[e.type].name : CONFIG.units[e.type].name);
    const icon = e.cat === 'res' ? ICONS[{ tree: 'lumber', gold: 'gold', berries: 'food' }[e.kind]] : ICONS[e.type];
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
      this.pQueue.innerHTML = q.map((x, i) => `<button class="qitem" data-i="${i}" title="Cancel">${ICONS[x.type]}${i === 0 ? '<s><i></i></s>' : ''}</button>`).join('');
      this.pQueue.querySelectorAll('.qitem').forEach(b => { b.onclick = () => g.cancelTraining(e.id, +b.dataset.i); });
    }
    if (q.length) {
      const first = q[0], p = Math.min(1, first.t / CONFIG.units[first.type].time);
      const bar = this.pQueue.querySelector('s i'); if (bar) bar.style.width = `${p * 100}%`;
      const t = w.teams[0];
      this.pStatus.textContent = first.blocked && t.pop >= t.popCap ? 'Need more houses for population' : status;
    }
  }

  // ---------- command card ----------
  commands() {
    const g = this.g, w = g.world, t = w.teams[0];
    const ents = g.sel.map(id => w.get(id)).filter(e => e && e.team === 0);
    let buttons = [];
    if (g.placing) {
      buttons = [
        { id: 'ok', icon: ICONS.check, label: 'Place', cls: g.placing.ok ? 'go' : 'off', act: () => g.confirmPlacement() },
        { id: 'no', icon: ICONS.cancel, label: 'Cancel', cls: 'stop', act: () => g.cancelPlacement() },
      ];
    } else if (g.rallyMode) {
      buttons = [{ id: 'no', icon: ICONS.cancel, label: 'Cancel', cls: 'stop', act: () => { g.rallyMode = false; } }];
    } else if (ents.length && ents.every(e => e.cat === 'unit')) {
      if (ents.some(e => e.type === 'worker')) {
        buttons = CONFIG.buildOrder.map(type => {
          const d = CONFIG.buildings[type];
          return { id: 'b' + type, icon: ICONS[type], label: d.name, cost: d.cost, cls: w.canAfford(0, d.cost) ? '' : 'poor', act: () => g.startPlacement(type) };
        });
      }
      buttons.push({ id: 'stop', icon: ICONS.stop, label: 'Stop', act: () => g.stop() });
    } else if (ents.length === 1 && ents[0].cat === 'bld') {
      const b = ents[0], d = CONFIG.buildings[b.type];
      if (!b.built) buttons = [{ id: 'cc', icon: ICONS.cancel, label: 'Cancel', cls: 'stop', act: () => g.cancelConstruction(b.id) }];
      else {
        buttons = (d.trains || []).map(type => {
          const u = CONFIG.units[type];
          return { id: 't' + type, icon: ICONS[type], label: u.name, cost: u.cost, cls: w.canAfford(0, u.cost) && b.queue.length < 5 ? '' : 'poor', act: () => g.trainUnit(b.id, type) };
        });
        if (d.trains) buttons.push({ id: 'rally', icon: ICONS.rally, label: 'Rally', act: () => { g.rallyMode = true; g.hud.toast('Tap where new units should go.'); } });
      }
    }
    const key = buttons.map(b => b.id + (b.cls || '')).join('|');
    if (key === this.cardKey) return;
    this.cardKey = key;
    this.card.innerHTML = '';
    for (const b of buttons) {
      const el = h('button', `cmd ${b.cls || ''}`, `${b.icon}<span class="lbl">${b.label}</span>${b.cost ? `<span class="costs">${costHtml(b.cost)}</span>` : ''}`);
      el.onclick = ev => { ev.stopPropagation(); b.act(); this.cardKey = ''; };
      this.card.append(el);
    }
    void t;
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
    while (this.toasts.children.length > 3) this.toasts.firstChild.remove();
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3200);
  }
  box(x0, y0, x1, y1) {
    const s = this.boxEl.style;
    this.boxEl.classList.remove('hidden');
    s.left = `${Math.min(x0, x1)}px`; s.top = `${Math.min(y0, y1)}px`; s.width = `${Math.abs(x1 - x0)}px`; s.height = `${Math.abs(y1 - y0)}px`;
  }
  hideBox() { this.boxEl.classList.add('hidden'); }
}
