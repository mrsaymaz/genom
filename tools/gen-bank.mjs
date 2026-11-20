// The language bank, trimmed for the game: from content/gradeN.json (the SnowPax linked bank) to
// one small file per grade with only what the stations use (words, clues, short sentences,
// misspellings and replies), and the pictures those words point to. The game fetches a grade's
// file when a match starts.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const fb = f => (f ? { hint: f.hint, explanation: f.explanation } : undefined);

export function generateBank(out) {
  mkdirSync(join(out, 'bank'), { recursive: true });
  mkdirSync(join(out, 'pictures', 'emoji'), { recursive: true });
  const pics = new Set();
  let bytes = 0;
  const index = [];
  for (const g of [5, 6, 7, 8]) {
    const d = JSON.parse(readFileSync(`content/grade${g}.json`, 'utf8'));
    const units = d.units.map(u => ({
      id: u.id, title: u.title,
      words: u.words.filter(w => w.en && w.tr && w.en.length <= 16).map(w => { const pic = w.pic && existsSync(join('content', w.pic)) ? w.pic : undefined; if (pic) pics.add(pic); return { id: w.id, en: w.en, tr: w.tr, pic, c: w.conceptIds?.[0] || w.id, fb: fb(w.feedback) }; }),
      clues: u.clues.filter(c => c.options?.length >= 3).map(c => ({ id: c.id, clue: c.clue, answer: c.answer, options: c.options.slice(0, 3), c: c.conceptIds?.[0] || c.id, fb: fb(c.feedback) })),
      sentences: u.sentences.filter(s => s.blocks?.length >= 3 && s.blocks.length <= 6).map(s => ({ id: s.id, blocks: s.blocks, text: s.text, tr: s.tr, c: s.conceptIds?.[0] || s.id, fb: fb(s.feedback) })),
      spells: u.misspellings.filter(m => /^[a-z]{3,10}$/i.test(m.word)).map(m => ({ id: m.id, word: m.word, c: m.conceptIds?.[0] || m.id, fb: fb(m.feedback) })),
      replies: u.questions.filter(q => q.options?.length >= 3 && q.a.length <= 48).map(q => ({ id: q.id, q: q.q, a: q.a, options: q.options.slice(0, 3), qTr: q.qTr, aTr: q.aTr, c: q.conceptIds?.[0] || q.id, fb: fb(q.feedback) })),
    }));
    // One file per unit (a match needs only its theme), and an index of the themes for the menu.
    for (const u of units) { const json = JSON.stringify(u); writeFileSync(join(out, 'bank', `${u.id}.json`), json); bytes += json.length; }
    index.push({ grade: g, units: units.map(u => ({ id: u.id, title: u.title })) });
  }
  writeFileSync(join(out, 'bank', 'index.json'), JSON.stringify(index));
  for (const p of pics) { const src = join('content', p); if (existsSync(src)) { copyFileSync(src, join(out, p)); bytes += readFileSync(src).length; } }
  return { bytes, pictures: pics.size };
}
