# Genom (working title): an English RTS by Mr. Saymaz

A touch-first, browser-based real-time strategy game for Grades 5–8 English students (CEFR A1–A2+), part of Mr. Saymaz's English League alongside SnowPax, solMaxima, Languini and Wordramp.

Students lead their own League team (Hufflepuff, Ravenclaw, Gryffindor or Slytherin) through four ages (**Dark, Mythic, Arcane and Celestial**) across three arenas. Every timer in the game (construction, upgrades, training, research and the age-up) can be waited out or finished instantly with English, at 3D task stations built on the SnowPax language bank.

**Status:** first playable slice. This is a Dark Age tutorial skirmish against one computer rival on an invented map, Sunmeadow Vale. It has no language tasks yet. The game deploys to Vercel as a static browser game, as SnowPax does.

## Play and build

Requires Node 20 or newer.

```bash
npm install
```

```bash
npm run serve
```

`npm run serve` builds the game and serves it at http://localhost:5173.

```bash
npm run build
```

`npm run build` writes the static site to `dist/`. Vercel runs this itself; the settings are in `vercel.json`.

```bash
npm test
```

`npm test` runs the headless simulation tests (map, gathering, building, training, combat, rival pacing).

### Controls

- **Tap** a unit or building to select it.
- **Tap** the ground, a tree, berries, a mine or an enemy to give the selected units an order.
- **Drag** to select a group.
- **Two fingers** move the map; **pinch** to zoom.
- **Mouse:** right-click gives orders, right- or middle-drag pans, and the wheel zooms. WASD or the arrow keys also pan.
- Space pauses and Esc cancels.
- **To place a building:** move its outline, then tap it again or tap the tick.

## What's here

| Path | Contents |
|---|---|
| `docs/GAME_DESIGN_SPEC.md` | The design spec: nations, ages and arenas, design languages, content rules, main screen, League, balance |
| `docs/LANGUAGE_TASKS.md` | How English drives progress: wait or go Instant!, the jobs and their task gestures, scoring (60% rule), difficulty and item selection |
| `docs/BUILDING_ROSTER.md` | Every building per nation and age, with base stats (generated from the concept pages) |
| `docs/TOWN_CENTERS.md` | Every Town Center per nation and age, with abilities |
| `docs/concepts/` | The approved 3D concept pages. Open any of them in a browser; each has New/Previous and Colour/Silhouette views |
| `content/` | The language bank: `grade5.json`–`grade8.json` (44 units, bilingual), with its notes and authoring guide |
| `art/scenes/` | The three.js scene fragments behind the concept pages, for reuse in the game |
| `src/sim/` | The simulation: map generator, pathfinding, world rules and the rival AI. Pure JavaScript, tested headless |
| `src/render/` | The 3D view (three.js r128). Buildings come straight from the concept pages via `tools/gen-art.mjs` and are baked for phones |
| `src/ui/`, `src/input.js`, `src/tutorial.js`, `src/main.js` | HUD, touch input, the tutorial coach and the game loop |
| `public/` | `index.html` and `style.css` |
| `tests/` | `node --test` simulation tests |

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
