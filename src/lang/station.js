// A language task station: the English task that does a job (docs/LANGUAGE_TASKS.md). The camera
// glides to the place, the words sit on 3D props (HTML labels pinned to them every frame, so they
// stay sharp and tappable), and every right answer visibly does part of the work. A wrong answer
// brings a hint (in English and Turkish), a second one the explanation and the right answer, so
// nobody gets stuck. While a station is open the match pauses on Relaxed and runs at a quarter
// speed on Challenge. Stepping out keeps the answers already given.
import * as THREE from 'three';
import { ICONS } from '../ui/icons.js';
import { TILE } from '../render/art.js';
import { ELEMENTS } from '../render/effects.js';

const lin = c => new THREE.Color(c).convertSRGBToLinear();
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const RIGHT = new THREE.Vector3(1, 0, -1).normalize(), TOWARD = new THREE.Vector3(1, 0, 1).normalize();
const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// What the coach says for each kind of task.
const ASK = { choice: 'Tap the right one!', order: 'Tap them in the right order!', spell: 'Spell the word!' };

export class Station {
  // spec: { job, title, focus: [tx, ty], items, scene, done(game), sub?(i) }
  constructor(game, spec) {
    this.g = game; this.spec = spec; this.items = spec.items;
    this.i = spec.start || 0; this.props = []; this.tweens = []; this.lock = false; this.t = 0;
  }

  // ---------- opening and closing ----------
  open() {
    const g = this.g, v = g.view;
    g.station = this;
    g.sel = []; g.hud.wheelAt = null; g.hud.glide = null; g.cancelPlacement?.();
    this.cam0 = { x: v.target.x, z: v.target.z, zoom: v.zoom };
    const [fx, fz] = v.toWorld(...this.spec.focus);
    this.focus = new THREE.Vector3(fx, 0, fz);
    // Frame the place a little above the middle of the screen, leaving room for the props below.
    this.zoom = Math.max(11, Math.min(14, v.zoom));
    const up = this.zoom * 0.12;
    this.cam1 = { x: fx + TOWARD.x * up, z: fz + TOWARD.z * up };
    this.group = new THREE.Group(); v.scene.add(this.group);
    this.buildDom();
    document.getElementById('app').classList.add('station');
    this.spec.setup?.(this);
    this.setItem(this.i);
    g.audio?.sfx('whoosh');
  }
  close(done = false) {
    const g = this.g, v = g.view;
    if (!done) g.lang.progress[this.spec.job] = this.i; // stepping out keeps what was answered
    else delete g.lang.progress[this.spec.job];
    this.closedNow = true;
    v.scene.remove(this.group);
    this.el.remove();
    document.getElementById('app').classList.remove('station');
    v.target.set(this.cam0.x, 0, this.cam0.z); v.zoom = this.cam0.zoom; v.updateCamera();
    g.station = null;
    this.spec.closed?.(this, done);
  }

  buildDom() {
    const g = this.g, art = g.world.teams[0].nation.art;
    const el = this.el = h('div', `station nation-${art}`);
    el.addEventListener('pointerdown', e => e.stopPropagation());
    el.addEventListener('wheel', e => e.preventDefault(), { passive: false });
    this.top = h('div', 'st-top frame', `<span class="st-ico">${ICONS.instant}</span><b class="st-title"></b><span class="st-pips"></span>`);
    const hear = h('button', 'st-btn', ICONS.sound); hear.title = 'Hear it again'; hear.onclick = () => this.hear();
    const out = h('button', 'st-btn st-out', `${ICONS.back}<span>Step out</span>`); out.onclick = () => { if (!this.finished) this.close(false); };
    this.top.append(hear, out);
    this.prompt = h('div', 'st-prompt frame');
    this.labels = h('div', 'st-labels');
    this.coach = h('div', 'st-coach frame', `<span class="face"></span><span class="say"></span><button class="st-tr" type="button">TR</button>`);
    this.coach.querySelector('.face').innerHTML = g.hud.guideFaceHtml?.() || '';
    this.coach.querySelector('.st-tr').onclick = () => { this.showTr = !this.showTr; this.paintCoach(); };
    el.append(this.top, this.prompt, this.labels, this.coach);
    document.getElementById('app').append(el);
    this.top.querySelector('.st-title').textContent = this.spec.title;
  }

  // ---------- items ----------
  setItem(i) {
    const it = this.it = this.items[i];
    this.misses = 0; this.k = 0; this.lock = false;
    for (const p of this.props) this.group.remove(p.obj);
    this.props = []; this.labels.innerHTML = '';
    if (this.spec.sub) this.top.querySelector('.st-title').textContent = this.spec.sub(i);
    this.paintPips();
    const words = it.kind === 'choice' ? it.options : it.kind === 'order' ? shuffleFixed(it.blocks) : it.tiles;
    const n = words.length, v = this.g.view, ppu = Math.min(v.w, v.h) / this.zoom;
    // Props in a row (two for many letter tiles) across the screen, in front of the place.
    const perRow = it.kind === 'spell' ? Math.min(n, 6) : n, rows = Math.ceil(n / perRow);
    const gapPx = it.kind === 'spell' ? 62 : Math.min(200, (v.w - 80) / n), gap = gapPx / ppu;
    words.forEach((word, j) => {
      const row = Math.floor(j / perRow), col = j % perRow, cols = Math.min(perRow, n - row * perRow);
      const pos = this.focus.clone().addScaledVector(RIGHT, (col - (cols - 1) / 2) * gap).addScaledVector(TOWARD, (this.spec.ahead ?? 3.2) + row * 2.2);
      const obj = this.spec.scene.prop(this, it, word, j);
      obj.position.copy(pos); this.group.add(obj);
      const btn = h('button', `st-word ${it.kind}${word.length > 18 ? ' long' : ''}`, esc(word)); btn.type = 'button';
      btn.onclick = () => this.answer(j);
      this.labels.append(btn);
      this.props.push({ obj, word, btn, used: false, base: pos.clone(), lift: obj.userData.labelY ?? 1.4 });
    });
    this.paintPrompt();
    this.say(it.ask || this.spec.ask?.(it) || ASK[it.kind]);
    if (it.kind !== 'order') this.hear();
  }
  // Which word should be tapped now.
  want() { const it = this.it; return it.kind === 'choice' ? it.answer : it.kind === 'order' ? it.blocks[this.k] : it.word[this.k + 1]; }

  answer(j) {
    const p = this.props[j];
    if (this.lock || !p || p.used) return;
    if (p.word === this.want()) this.right(p);
    else this.wrong(p);
  }
  right(p, revealed = false) {
    const it = this.it;
    p.used = true; p.btn.classList.add('yes'); p.btn.disabled = true;
    this.spec.scene.correct(this, p, this.k);
    this.g.audio?.sfx(revealed ? 'tap' : 'chime');
    this.k++;
    this.paintPrompt();
    const done = it.kind === 'choice' || (it.kind === 'order' ? this.k >= it.blocks.length : this.k >= it.word.length - 1);
    if (done) this.itemDone(this.misses === 0);
  }
  wrong(p) {
    this.misses++;
    p.btn.classList.remove('no'); void p.btn.offsetWidth; p.btn.classList.add('no');
    this.g.audio?.sfx('deny');
    const fb = this.it.fb || {};
    if (this.misses === 1) { this.coachLine = { en: fb.hint?.en || 'Not quite. Try again!', tr: fb.hint?.tr || 'Tekrar dene!' }; this.paintCoach(true); return; }
    // Second miss: the explanation, then the right answer, step by step.
    this.coachLine = { en: fb.explanation?.en || 'Here is the right answer.', tr: fb.explanation?.tr || 'İşte doğru cevap.' };
    this.paintCoach(true);
    this.lock = true;
    const step = () => {
      if (this.closedNow) return;
      const want = this.want(), q = this.props.find(x => !x.used && x.word === want);
      if (!q) return;
      q.btn.classList.add('show');
      setTimeout(() => { if (this.closedNow) return; this.right(q, true); if (!this.finishedItem) setTimeout(step, 420); }, 750);
    };
    setTimeout(step, 1100);
  }
  itemDone(firstTry) {
    this.finishedItem = true; this.lock = true;
    this.g.lang.record(this.it, firstTry);
    (this.results ||= [])[this.i] = firstTry;
    this.paintPips();
    if (firstTry) this.say(['Great!', 'Well done!', 'Perfect!', 'Brilliant!'][Math.floor(Math.random() * 4)], true);
    setTimeout(() => this.g.audio?.speak(this.it.say, true), 250);
    setTimeout(() => {
      this.finishedItem = false;
      if (this.i + 1 < this.items.length) { this.i++; this.setItem(this.i); return; }
      this.finish();
    }, this.it.kind === 'order' ? 1700 : 1300);
  }
  finish() {
    this.finished = true;
    this.g.lang.tasks++;
    this.say(this.spec.cheer || 'You did it!', true);
    this.g.audio?.sfx('built');
    this.spec.scene.finish?.(this);
    this.spec.done(this.g, this);
    setTimeout(() => this.close(true), 1500);
  }

  // ---------- painting ----------
  paintPips() {
    const pips = this.top.querySelector('.st-pips'), res = this.results || [];
    pips.innerHTML = this.items.map((_, j) => `<i class="${j < this.i || res[j] !== undefined ? (res[j] === false ? 'got' : 'ok') : j === this.i ? 'now' : ''}"></i>`).join('');
  }
  paintPrompt() {
    const it = this.it;
    let main = '', sub = '';
    if (it.kind === 'choice') { main = esc(it.prompt); sub = it.promptTr && it.promptTr !== it.prompt ? esc(it.promptTr) : ''; if (it.pic && it.prompt === 'Which word is this?') sub = ''; }
    if (it.kind === 'order') { const got = it.blocks.slice(0, this.k); main = [...got.map(esc), ...it.blocks.slice(this.k).map(() => '<span class="gap"></span>')].join(' '); sub = esc(it.tr || ''); }
    if (it.kind === 'spell') { main = `<span class="slots">${it.word.split('').map((ch, j) => `<b class="${j <= this.k ? 'got' : ''}">${j <= this.k ? esc(ch) : ''}</b>`).join('')}</span>`; sub = it.tr ? esc(it.tr) : ''; }
    this.prompt.innerHTML = `${it.pic ? `<img class="st-pic" src="${it.pic}" alt="" draggable="false">` : ''}<div class="st-text"><div class="st-main">${main}</div>${sub ? `<div class="st-sub">${sub}</div>` : ''}</div>`;
  }
  say(text, keep) { this.coachLine = { en: text, tr: '' }; this.paintCoach(); if (keep) return; }
  paintCoach(speak) {
    const c = this.coachLine || { en: '' };
    this.coach.querySelector('.say').innerHTML = `${esc(c.en)}${this.showTr && c.tr ? `<small>${esc(c.tr)}</small>` : ''}`;
    this.coach.querySelector('.st-tr').classList.toggle('hidden', !c.tr);
    this.coach.classList.remove('pop'); void this.coach.offsetWidth; this.coach.classList.add('pop');
    if (speak) this.g.audio?.speak(c.en, true);
  }
  // Reads the prompt aloud (the clue, the question, the word to spell).
  hear() { const it = this.it; this.g.audio?.speak(it.kind === 'spell' ? it.word : it.kind === 'order' ? it.text : it.prompt === 'Which word is this?' ? 'Which word is this?' : it.prompt, true); }

  // ---------- every frame ----------
  update(dt) {
    const v = this.g.view;
    this.t += dt;
    // The camera glides in.
    const k = ease(Math.min(1, this.t / 0.6));
    v.target.set(this.cam0.x + (this.cam1.x - this.cam0.x) * k, 0, this.cam0.z + (this.cam1.z - this.cam0.z) * k);
    v.zoom = this.cam0.zoom + (this.zoom - this.cam0.zoom) * k; v.updateCamera();
    // Prop animations.
    this.tweens = this.tweens.filter(tw => {
      tw.t += dt;
      const u = Math.min(1, tw.t / tw.dur), e = ease(u);
      tw.obj.position.lerpVectors(tw.from, tw.to, e);
      if (tw.arc) tw.obj.position.y += Math.sin(u * Math.PI) * tw.arc;
      if (tw.scale !== undefined) tw.obj.scale.setScalar(1 + (tw.scale - 1) * e);
      if (u >= 1) { tw.end?.(); return false; }
      return true;
    });
    for (const p of this.props) if (!p.used && p.obj.userData.bob) p.obj.position.y = p.base.y + Math.sin(this.t * 2 + p.base.x) * 0.08;
    this.spec.scene.update?.(this, dt);
    // Labels follow their props, then a few passes push apart any that touch (long replies, a
    // second row of letter tiles) and keep them on screen.
    const vec = new THREE.Vector3(), L = [];
    for (const p of this.props) {
      vec.copy(p.obj.position); vec.y += p.lift;
      vec.project(v.cam);
      if (!p.w) { p.w = p.btn.offsetWidth; p.h = p.btn.offsetHeight; }
      const gone = p.used && this.it.kind !== 'choice';
      p.btn.classList.toggle('gone', gone);
      L.push({ p, x: (vec.x + 1) / 2 * v.w, y: (1 - vec.y) / 2 * v.h, w: p.w || 48, h: p.h || 46, gone });
    }
    const top = (this.prompt.offsetTop + this.prompt.offsetHeight || 100) + 8;
    const keep = a => { a.x = Math.max(a.w / 2 + 8, Math.min(v.w - a.w / 2 - 8, a.x)); a.y = Math.max(top + a.h, Math.min(v.h - 70, a.y)); };
    L.forEach(keep);
    for (let n = 0; n < 12; n++) {
      let moved = false;
      for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
        const a = L[i], b = L[j];
        if (a.gone || b.gone) continue;
        const dx = b.x - a.x, dy = b.y - a.y, ox = (a.w + b.w) / 2 + 8 - Math.abs(dx), oy = (a.h + b.h) / 2 + 6 - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        if (ox < oy) { const s = (dx >= 0 ? 1 : -1) * ox / 2; a.x -= s; b.x += s; } else { const s = (dy >= 0 ? 1 : -1) * oy / 2; a.y -= s; b.y += s; }
        keep(a); keep(b);
      }
      if (!moved) break;
    }
    for (const a of L) a.p.btn.style.transform = `translate(${Math.round(a.x)}px, ${Math.round(a.y)}px) translate(-50%, -100%)`;
  }
  tween(obj, to, dur, o = {}) { this.tweens.push({ obj, from: obj.position.clone(), to, dur, t: 0, ...o }); }
}

// Sentence blocks in a mixed order that is never the right one.
function shuffleFixed(blocks) {
  for (let n = 0; n < 8; n++) { const a = [...blocks].sort(() => Math.random() - 0.5); if (a.some((b, i) => b !== blocks[i])) return a; }
  return [...blocks].reverse();
}

// ---------- the props (one look per station) ----------
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: 0.7, flatShading: true, ...o });
const glowMat = c => new THREE.MeshBasicMaterial({ color: lin(c) });

// Word stones: glowing crystals floating around the Town Center (the Age Ceremony).
export const STONES = {
  prop(st) {
    const E = ELEMENTS[st.g.world.teams[0].nation.art], g = new THREE.Group();
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshStandardMaterial({ color: lin(E.a), emissive: lin(E.a), emissiveIntensity: 0.5, roughness: 0.3, flatShading: true }));
    gem.scale.y = 1.5; gem.position.y = 1.2; gem.castShadow = true; g.add(gem);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 6, 24), glowMat(E.b)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; g.add(ring);
    g.userData = { bob: true, labelY: 2.4, gem };
    return g;
  },
  correct(st, p) {
    // The stone flies into the Town Center in a burst.
    const to = st.focus.clone().setY(3.5);
    st.tween(p.obj, to, 0.7, { arc: 1.5, scale: 0.2, end: () => { st.g.view.magic.emit(st.g.world.teams[0].nation.art, st.focus.x, st.focus.z, { n: 30, radius: 1, speed: 1.5, life: 1.2, size: 1, shape: 'star' }); p.obj.visible = false; } });
  },
  update(st, dt) { for (const p of st.props) if (p.obj.userData.gem && !p.used) p.obj.userData.gem.rotation.y += dt * 1.5; },
};

// Letter tiles in front of a sign: tap them in order and they jump onto the sign.
export const TILES = {
  prop() {
    const g = new THREE.Group();
    const tile = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.2, 0.75), mat('#c8a46a')); tile.position.y = 0.1; tile.castShadow = true; g.add(tile);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.6), mat('#efe0b8')); top.position.y = 0.22; g.add(top);
    g.userData = { labelY: 0.55 };
    return g;
  },
  correct(st, p, k) {
    const n = st.it.word.length, to = st.focus.clone().addScaledVector(RIGHT, ((k + 1) - (n - 1) / 2) * 0.62).setY(1.6);
    st.tween(p.obj, to, 0.45, { arc: 1, end: () => { p.obj.visible = false; } });
  },
};

// The claim post on the gold mine: a post with a board where the letters land, and a flag.
export function claimPost(st) {
  const g = new THREE.Group(), wood = mat('#8a5a32');
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), wood); post.position.y = 1.1; g.add(post);
  const n = st.items[0].word.length;
  const board = new THREE.Mesh(new THREE.BoxGeometry(n * 0.62 + 0.5, 0.9, 0.12), mat('#d8b878')); board.position.set(0, 1.6, 0.12); board.rotation.y = Math.PI / 4; g.add(board);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.8), mat(st.g.world.teams[0].nation.color)); flag.position.set(0, 2.2, -0.45); g.add(flag);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.position.copy(st.focus).addScaledVector(TOWARD, 0.6);
  st.group.add(g);
  st.post = { g, flag };
}

// Soldiers holding sentence blocks: tap them in order and they march into a line.
export const SOLDIERS = {
  prop(st) {
    const g = st.g.view.units.model(0, 'spearman', st.g.world.teams[0].age);
    g.scale.setScalar(1.25); g.rotation.y = Math.PI / 4;
    g.userData = { labelY: 1.9 };
    return g;
  },
  correct(st, p, k) {
    const n = st.it.blocks.length, to = st.focus.clone().addScaledVector(TOWARD, 1.4).addScaledVector(RIGHT, (k - (n - 1) / 2) * 1.3);
    st.tween(p.obj, to, 0.6, { end: () => { p.obj.rotation.y = Math.PI / 4; } });
    st.g.audio?.sfx('order');
  },
};

// Food for the creature: tap the food with the answer and it is tossed to the creature.
export const FOOD = {
  prop(st, it, word, j) {
    const g = new THREE.Group(), kind = j % 3;
    if (kind === 0) { // a joint of meat
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), mat('#b0503a')); m.scale.set(1.3, 0.8, 0.9); m.position.y = 0.4; g.add(m);
      const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 6), mat('#f2ead8')); bone.rotation.z = Math.PI / 2; bone.position.set(0.5, 0.4, 0); g.add(bone);
    } else if (kind === 1) { // a fish
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), mat('#6aa8d8')); f.scale.set(1.6, 0.7, 0.6); f.position.y = 0.35; g.add(f);
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 4), mat('#4a88b8')); tail.rotation.z = Math.PI / 2; tail.position.set(-0.6, 0.35, 0); g.add(tail);
    } else { // a honeycomb
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 6), mat('#f0b830')); c.position.y = 0.2; g.add(c);
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.24, 6), mat('#ffd860', { emissive: lin('#a86a00'), emissiveIntensity: 0.3 })); d.position.y = 0.21; g.add(d);
    }
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.08, 16), mat('#8a6a40')); plate.position.y = 0.04; g.add(plate);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    g.userData = { labelY: 1.1 };
    return g;
  },
  correct(st, p) {
    const to = st.creature.position.clone().setY(1.1);
    st.tween(p.obj, to, 0.6, { arc: 2, scale: 0.3, end: () => { p.obj.visible = false; st.g.audio?.sfx('roar'); st.chomp = 0.6; } });
  },
  update(st, dt) {
    if (st.creature) {
      st.creature.position.y = st.creature.userData.y + (st.chomp > 0 ? Math.abs(Math.sin(st.chomp * 12)) * 0.25 : 0);
      if (st.chomp > 0) st.chomp -= dt;
    }
  },
  finish(st) { if (st.creature) st.g.view.magic.emit(st.g.world.teams[0].nation.art, st.creature.position.x, st.creature.position.z, { n: 40, radius: 1, speed: 1.4, life: 1.3, size: 1.1, shape: 'star' }); },
};

// Reply banners around the war banner: the right reply is raised high.
export const BANNERS = {
  prop(st) {
    const g = new THREE.Group(), col = st.g.world.teams[0].nation.color;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.8, 6), mat('#6a4a2a')); pole.position.y = 0.9; g.add(pole);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.8), mat(col)); flag.position.set(0, 1.45, 0.4); g.add(flag);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    g.rotation.y = Math.PI / 4;
    g.userData = { labelY: 2.3 };
    return g;
  },
  correct(st, p) {
    st.tween(p.obj, p.obj.position.clone().setY(1.2), 0.5, { scale: 1.4 });
    st.g.audio?.sfx('fanfare');
  },
};

export { TILE };
