# Compact bank editing

Use `content/grade5.json` through `grade8.json`. Unit IDs stay `g5u1`, `g6u4`, and so on. Do not rename existing item IDs.

- Add short words/phrases with `en`, `tr`, `def`, `example`, `exampleTr` and `conceptIds`.
- Add question pairs with `q`, `a`, `qTr`, `aTr`, `options`, short bilingual `feedback` and at least three distinct `optionSets`. Each set contains two definitely inappropriate replies; `a` is always the correct reply.
- Add sentences with `text`, meaningful `blocks`, `tr`, `rb: 1`, `form` and `grammarFocus`. Joining blocks with one space must reproduce the text exactly. Aim for one short sentence; check the 15-character wrapping by two-line block limit.
- Put related records under the same concept IDs and maintain the unit's `concepts` registry. Keep `relatedItemIds` within the unit.
- Add prompt paraphrases only when the same exact answer still works. Preserve person, tense, quantity, negation and the short-answer auxiliary.
- Preserve correct word senses. The same English spelling can mean different things in different units.

Run the three validation commands in `README_LEARNING_V3.md`. Use `/preview.html` to inspect grades, units, task families and later task-arena levels. The preview is read-only for learning progress.

Türkçe: Yeni kayıtların İngilizce ve Türkçe alanlarını birlikte hazırlayın. Seçeneklerden yalnızca biri soruya uygun cevap olmalıdır. Diğer seçenekler farklı bir bilgi vermeli veya farklı bir nesneyi anlatmalıdır. Uzun konuşmalar eklemek yerine tek soruluk kısa etkinlikler ve anlamlı cümle parçaları kullanın. Eski kayıt kimliklerini koruyun; aynı kelimenin farklı anlamlarını karıştırmayın.
