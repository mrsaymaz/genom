# SnowPax v0.5.0 - linked language bank

Prepared for Mr. Saymaz, 9 November 2026.

## Use the complete game package

This folder is a complete static SnowPax build. Deploy its root as with the uploaded Vercel-ready game. The existing Vercel settings, original art, fonts, sounds and League configuration are preserved. No website has been published by this task.

For the live improvements, use the complete game package. JSON replacements alone enrich the data but do not install adaptive review, rotating prompts or the new feedback behavior. The optional `modules/grade5.js` through `grade8.js` files export the same grade data as ES modules; the current game uses `content/grade*.json`.

## What changed

| Improvement | Result |
|---|---|
| Complete bilingual records | All 1,287 main question-answer records have Turkish questions and answers; all 3,247 sentences have Turkish translations |
| Vocabulary support | All 2,302 word/phrase records have a short English definition and a bilingual example |
| Connected records | Unit concept IDs, related item links and objectives connect vocabulary, questions and sentence activities |
| Varied choices | Four alternative distractor sets per main question; the immediately previous set is excluded |
| Varied prompts | 368 PDF-backed questions have a compact alternative prompt with Turkish translation |
| Sentence forms | 264 new compact examples: 88 affirmative, 88 negative and 88 questions across 44 units |
| Existing block repairs | All 79 previously oversized sentence-block records were rechunked without changing their sentence text |
| Short explanations | First wrong choice: short bilingual hint. Second wrong choice: short explanation and a correct-choice cue. Correct response: answer and Turkish meaning |
| Review tracking | Missed items return after other items; concept links help revisit the language across activity formats and later sessions |
| Word-sense quality | 51 word records corrected, including book, bat, watch, stop, balance and phone expressions; dependent clues aligned |

The existing short dialogue links were retained. No longer conversations, new audio files, new pictures or dashboard were added.

The source PDFs cover Grades 5-6 themes 1-8 and Grades 7-8 units 1-10. Existing extension units remain. The expansion now enriches all 44 game units.

## Compact activity design

The 264 new sentence-form examples are at most 63 characters and 11 words. Blocks are meaningful phrases, rather than artificial letter/word splits. Correct responses and feedback remain inside the existing card. No extra student panels or modal windows were introduced.

The new distractors follow your agreed rule: one response appropriately answers the question; the others give a different kind of information or describe another object. A distractor may be true in isolation. The data does not mark another valid acceptance/refusal or opposite yes/no reply wrong.

## Learning evidence and review

The runtime distinguishes reply recognition, meaning recognition, listening, spelling, sentence reconstruction, categorization, instruction following and grammar repair. Sentence reconstruction is not labelled independent writing.

A single correct choice does not mark a concept mastered. The current editable rule requires at least four first-try successes, at least 80% first-try accuracy, two different dates and two evidence types. Review spacing uses 1, 3, 7 and 14 days. A miss becomes due but is kept behind several other steps where the available pool permits. These values are gameplay heuristics, not standardized assessment scores.

Progress is local to this browser/device. If a student is selected through the existing League name picker, the learning profile uses that student ID. Without a selected student, practice records are grouped by the selected team on that device. Anonymous practice is therefore not individual tracking for several children sharing the same team/device. No new network requests or external tracking service were introduced.

Original game saves, points and existing record IDs remain. The separate learning-evidence record starts with this update; older saved mistakes still inform selection. Later stages now pass their actual task-arena level, making the bank's advanced activity formats available where supported.

Retries on one card item are counted once, including when a sorting item is corrected after a miss.

## Metadata and authoring

Each unit has `concepts`, `learningObjectives` and `coverageKind`. Core records contain `conceptIds`, `relatedItemIds` and `learningObjective`. Sentence forms and grammar tags are available for selection and future editing. Grammar tags marked `pattern_inferred` are authoring aids, not an independently verified curriculum mapping; tags on the 264 new form examples are marked `authored`.

Words include `def`, `example`, `exampleTr` and, where a suitable bank sentence exists, `exampleSentenceId`. A link can refer to another unit's sentence; the example text and translation are included directly, so the game does not need to fetch that other grade.

Main question records include `qTr`, `aTr`, `feedback`, `optionSets` and optional `promptVariants`. Each option set contains two wrong responses. The canonical `a` remains the correct response, and every emitted task shuffles that answer with the chosen wrong responses.

`sourceExample` retains an older extracted example when the displayed example was replaced with a clearer, sense-matched one. Original PDF provenance is preserved. The PDFs themselves are not bundled.

To continue authoring, preserve IDs, add naturally written content and translations, update the related concept records, and run the checks below. Avoid adding a paraphrase whose short-answer auxiliary or meaning no longer fits the original answer.

## Verification

From this folder:

```bash
python3 tools/validate_content.py --report reports/structural-validation.json
node --test tools/learning-runtime.test.mjs
node tools/check-bank.mjs
```

Python 3.9+ and Node.js 18+ are sufficient; no dependency installation is needed.

Results for this package:

- 0 structural errors across 44 units.
- 1 documented word-matching warning: `energy-efficient` is longer than a standard tile permits as one token. Its spelling is preserved and it remains usable in compatible formats.
- 39,660 sampled generated rounds; 0 generation failures.
- 8 learning-runtime tests passed, plus a generator regression check preventing immediate repeated mistakes when the bank has alternatives.
- JSON/JavaScript exports match exactly; concept and related-record references are valid.
- A live desktop browser check verified the first hint, second explanation, correct response translation and retained missed-first-try status on the actual card renderer.
- The live check was not a complete real-phone campaign playtest. On-device performance and longer-session classroom behavior still need observation.

See `reports/bank-upgrade.json`, `reports/bank-checks.json` and the translation/word audit notes for counts and review scope. Structural validation does not by itself establish linguistic perfection.
