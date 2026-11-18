// The language bank in the game: the theme (unit) the student picked, the items each station
// needs, and what the student has practised. Items come from dist/bank (tools/gen-bank.mjs).
// Choosing items follows the League's practice rules in a simple form: fresh items first, then
// items missed before (after a gap), never the same item twice in a match.
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};

export async function loadIndex() {
  const r = await fetch('bank/index.json');
  if (!r.ok) throw new Error('The word bank could not load.');
  return r.json();
}

export async function loadUnit(id) {
  const r = await fetch(`bank/${id}.json`);
  if (!r.ok) throw new Error('The word bank could not load.');
  return r.json();
}

const shuffle = (a, r = Math.random) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export { shuffle };

// One student's English in one match: picks items, records answers, keeps score.
export class Language {
  constructor(unit) {
    this.unit = unit;
    this.key = `genom.practice.${unit.id}`;
    this.memory = store.get(this.key, {}); // concept -> { n, ok, miss, at }
    this.used = new Set();
    this.tasks = 0; // tasks finished this match
    this.items = 0; this.firstTry = 0; // items answered, and right first time
    this.recent = []; // concepts seen lately, for spacing
  }
  // Picks an item: unseen concepts first, then ones missed before (not seen in the last few),
  // then anything not used in this match.
  pick(list, filter = () => true) {
    const pool = list.filter(it => !this.used.has(it.id) && filter(it));
    const from = pool.length ? pool : list.filter(filter);
    if (!from.length) return null;
    const m = c => this.memory[c] || null;
    const score = it => {
      const s = m(it.c);
      if (this.recent.includes(it.c)) return 5;
      if (!s) return 1; // fresh
      if (s.miss > 0 && s.ok < s.n) return 2; // to review
      return 3 + s.ok / 10; // familiar
    };
    const best = Math.min(...from.map(score)), top = from.filter(it => score(it) === best);
    const it = top[Math.floor(Math.random() * top.length)];
    this.used.add(it.id);
    return it;
  }
  // Items for each kind of task. Each returns { prompt, answer, options, ... } ready for a station.
  match() {
    // A word to recognise: from its picture when it has one, otherwise from its Turkish.
    const w = this.pick(this.unit.words);
    if (!w) return null;
    const others = shuffle(this.unit.words.filter(x => x.en !== w.en && x.tr !== w.tr)).slice(0, 2);
    return { id: w.id, c: w.c, kind: 'choice', pic: w.pic, prompt: w.pic ? 'Which word is this?' : w.tr, promptTr: w.tr, answer: w.en, options: shuffle([w.en, ...others.map(o => o.en)]), say: w.en, fb: w.fb };
  }
  clue() {
    const c = this.pick(this.unit.clues);
    if (!c) return this.match();
    return { id: c.id, c: c.c, kind: 'choice', prompt: c.clue, answer: c.answer, options: shuffle(c.options), say: c.clue, fb: c.fb };
  }
  spell() {
    const s = this.pick(this.unit.spells, it => it.word.length <= 8) || this.pick(this.unit.spells);
    if (!s) return this.match();
    const w = this.unit.words.find(x => x.en.toLowerCase() === s.word.toLowerCase());
    const word = s.word.toLowerCase(), extra = shuffle('aeioustrnl'.split('').filter(ch => !word.includes(ch))).slice(0, 2);
    return { id: s.id, c: s.c, kind: 'spell', word, tr: w?.tr, pic: w?.pic, tiles: shuffle([...word.slice(1).split(''), ...extra]), say: word, fb: s.fb };
  }
  sentence() {
    const s = this.pick(this.unit.sentences);
    if (!s) return this.match();
    return { id: s.id, c: s.c, kind: 'order', blocks: s.blocks, text: s.text, tr: s.tr, say: s.text, fb: s.fb };
  }
  reply() {
    const q = this.pick(this.unit.replies);
    if (!q) return this.clue();
    return { id: q.id, c: q.c, kind: 'choice', prompt: q.q, promptTr: q.qTr, answer: q.a, options: shuffle(q.options), say: q.q, fb: q.fb };
  }
  // An answered item: first try counts toward accuracy; misses come back for review later.
  record(item, firstTry) {
    this.items++; if (firstTry) this.firstTry++;
    const s = this.memory[item.c] || { n: 0, ok: 0, miss: 0, at: 0 };
    s.n++; if (firstTry) s.ok++; else s.miss++;
    s.at = Date.now();
    this.memory[item.c] = s;
    this.recent = [item.c, ...this.recent].slice(0, 4);
    store.set(this.key, this.memory);
  }
  get accuracy() { return this.items ? this.firstTry / this.items : 0; }
  save() { return { tasks: this.tasks, items: this.items, firstTry: this.firstTry, used: [...this.used] }; }
  load(d) { if (!d) return; this.tasks = d.tasks || 0; this.items = d.items || 0; this.firstTry = d.firstTry || 0; this.used = new Set(d.used || []); }
}
