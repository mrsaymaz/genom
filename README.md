# Genom (working title): an English RTS by Mr. Saymaz

A touch-first, browser-based real-time strategy game for Grades 5–8 English students (CEFR A1–A2+), part of Mr. Saymaz's English League alongside SnowPax, solMaxima, Languini and Wordramp.

Students lead their own League team (Hufflepuff, Ravenclaw, Gryffindor or Slytherin) through four ages (**Dark, Mythic, Arcane and Celestial**) across three arenas. Every building upgrade and every age-up is earned with English, at 3D task stations built on the SnowPax language bank.

**Status:** design and concept art. No game code yet.

## What's here

| Path | Contents |
|---|---|
| `docs/GAME_DESIGN_SPEC.md` | The design spec: nations, ages and arenas, design languages, content rules, main screen, League, balance |
| `docs/LANGUAGE_TASKS.md` | How English drives progress: the Trial of the Age, building stations, battlefield stations, difficulty and item selection |
| `docs/BUILDING_ROSTER.md` | Every building per nation and age, with base stats (generated from the concept pages) |
| `docs/TOWN_CENTERS.md` | Every Town Center per nation and age, with abilities |
| `docs/concepts/` | The approved 3D concept pages. Open any of them in a browser; each has New/Previous and Colour/Silhouette views |
| `content/` | The language bank: `grade5.json`–`grade8.json` (44 units, bilingual), with its notes and authoring guide |
| `art/scenes/` | The three.js scene fragments behind the concept pages, for reuse in the game |

## Concept pages

| Page | Shows |
|---|---|
| `town-centers-dark-age.html` | Dark Age Town Centers |
| `mythic-town-centers.html` | Mythic Town Centers, with Dark for comparison |
| `arcane-town-centers.html` | Arcane Town Centers, with Dark and Mythic |
| `celestial-town-centers.html` | Celestial Town Centers, with all four ages |
| `dark-age-buildings.html` | The five Dark Age buildings per nation |
| `mythic-age-buildings.html` | The seven Mythic Age buildings per nation, with Dark |
| `arcane-age-buildings.html` | The eight Arcane Age buildings per nation, with Dark and Mythic |
| `celestial-age-buildings.html` | The eight Celestial Age buildings per nation, with all four ages |
| `signature-creatures.html` | The four signature creatures |
| `nation-design-languages.html` | The four nation design languages |

The pages load three.js r128 and two Google Fonts from the web; everything else is inline.

## Notes

- The house names are kept for classroom prototyping and must be renamed before any public release (trademark). Emblems are our own element symbols, never the film crests.
- The language bank comes from the SnowPax v0.5.0 linked bank; see `content/README-LEARNING.md` and `content/AUTHORING.md`. Its validation tools live in the SnowPax repo.
