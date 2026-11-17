# Game Design Spec: Touch-First English RTS (Web)

Status: Draft v2. Items marked **[OPEN]** need a decision before content is locked.
Audience: the model or developer building the game or expanding buildings and units. Read sections 1–6 fully before writing any content.

Companion documents:
- `docs/LANGUAGE_TASKS.md`: how English practice drives progress, the task stations and the language bank.
- `docs/BUILDING_ROSTER.md`: every building, per nation and age, with base stats (generated from the concept pages).
- `docs/TOWN_CENTERS.md`: every Town Center, per nation and age, with abilities.
- `docs/concepts/`: the approved 3D concept pages. They are the visual reference for every building.

---

## 1. Overview

A browser-playable, touch-first real-time strategy game for Mr. Saymaz's Grades 5–8 English students (CEFR A1–A2+), part of the English League family alongside SnowPax, solMaxima, Languini and Wordramp.

- **Look**: 2.5D isometric (three.js), inspired by Red Alert 2 for readability and by Warcraft 3, Age of Empires 2/3, Rise of Nations and Rise of Legends for aesthetics. Bright and readable at phone size.
- **Platform**: web browser, installable as a PWA. Landscape. No accounts and no install needed to play.
- **Match**: 1v1 against an AI rival, three arenas, each about 15–20 minutes.
- **Core loop**: gather Food, Lumber and Gold; build and upgrade; complete English tasks to upgrade buildings and reach the next age; build an army; destroy the rival's Town Center.
- **English is the key, never a wall**: every upgrade and age-up needs English, but wrong answers only cost time, never units, and nobody gets stuck (same rule as SnowPax).

## 2. Players, teams and nations

The four nations are the four English League teams. **A student always plays their own League team** (confirmed); they do not choose a nation.

| Nation (team) | Element | Play identity | Signature creature |
|---|---|---|---|
| Hufflepuff | Air | Mobility, scouting, relocating buildings | Galehide Bear |
| Ravenclaw | Water | Economy and healing, strong in long fights | Tide Raven (eagle-raven) |
| Gryffindor | Fire | Aggressive, fast production, early pressure | Ember Lion |
| Slytherin | Earth/Nature | Defense, durable regenerating buildings | Rootcoil Serpent |

- The rival is drawn from the other three teams (weighted by arena, section 7).
- Emblems are our own element symbols, never the film crests (as in SnowPax).
- **[OPEN] Naming**: the house names are trademarked. Fine for classroom prototyping; rename before any public release.

### Element counter cycle

Fire > Earth > Air > Water > Fire. A counter gives +10–15% damage; it is a tilt, not a decision.

## 3. Resources

| Resource | Sources | Used for |
|---|---|---|
| Food | Farms (infinite, slow); hunting or fishing (fast, finite) | Units, population |
| Lumber | Trees near a dropsite | Buildings, upgrades |
| Gold | Mines (finite, contested) | Advanced units, age-ups, tech |

All three use the same loop: go to node, gather, return to a dropsite. Gold is finite so matches end on time.

## 4. Ages and arenas

Four ages: **Dark, Mythic, Arcane, Celestial** (confirmed). Ages are reached **during arena fights**, one per arena (confirmed):

| Arena | Starts in | Ages up mid-fight to | New for the player |
|---|---|---|---|
| Tutorial skirmish | Dark | — | Gathering, building, first stations |
| Arena 1 | Dark | **Mythic** | Beast Pen, Sanctum, first signature creature |
| Arena 2 | Mythic (quick start) | **Arcane** | Workshop and siege; second Town Center ability |
| Arena 3 | Arcane (quick start) | **Celestial** | Final forms and map-scale abilities |

- **No carry-over** between arenas except the starting age (confirmed). Each arena is self-contained.
- **Quick start**: Arenas 2 and 3 open with the Town Center and a few core buildings already standing in the starting age, so the early game is not replayed.
- **Age-up timing**: around minute 6–9 of the arena, leaving time to use the new age before the finale.
- **The rival ages up too**, on a timer set by its difficulty, so the race to the next age is part of the fight.
- **Age-up requirements**: resources, one key building (Sanctum for Arcane, Workshop for Celestial) and the **Trial of the Age** language station at the Town Center (`LANGUAGE_TASKS.md`).
- **The age-up moment**: every building transforms into its next-age form, one by one, with the nation's elemental choreography (as solMaxima's evolutions: air ribbons, rising embers, growing vines, water arches). Under 8 seconds, skippable. The signature creature takes its next form at the same time.

## 5. Visual design languages

Each nation owns its shapes and materials, and **each age changes the structural concept**, not just the ornament. Every role keeps its own silhouette within an age (Barracks long, Watchtower tall and thin, Workshop a machine, Sanctum a centred monument).

| Nation | Dark | Mythic | Arcane | Celestial |
|---|---|---|---|---|
| Hufflepuff | Straw and timber hives, masts | Honeycomb masonry: clusters of hex cells | Airborne: floating islands, levitating stacks, airships | Clouds and stars: cloud-borne islands, amber stars, constellations |
| Ravenclaw | Driftwood and shell | Pearl shell architecture: conch, nautilus, scallop | Glass and living water: domes and tanks on water columns | Moon and silver: crescents, moon orbs, an orrery |
| Gryffindor | Rough basalt huts | Stepped basalt ziggurats with gold bands | Obsidian and molten gold: lion-head gate, phoenix, volcano forge | Sun and phoenix: small suns, sunburst crowns, solar lens |
| Slytherin | Earth and sod mounds | Living wood: trees, woven branches | Megaliths and emerald: dolmens, obelisks, crystal hearts | Star blossoms: giant glowing buds, lilies, seed pods |

Rules:
- **Motif ownership**: hives and sails are Hufflepuff's; conches, glass and water Ravenclaw's; basalt, magma and lions Gryffindor's; trees and trilithons Slytherin's. **No trees outside Slytherin.**
- Every building must read by **silhouette alone** (each concept page has a Silhouette view).
- The concept pages in `docs/concepts/` are the reference. The ladders of names and descriptions are in `BUILDING_ROSTER.md` and `TOWN_CENTERS.md`.

## 6. Buildings and units: content rules

### Buildings

Eight roles, the same for every nation (full table in `BUILDING_ROSTER.md`):

| Role | Footprint | Unlocked | Upgrade language task (`LANGUAGE_TASKS.md`) |
|---|---|---|---|
| Town Center | 4×4 | start | Trial of the Age (mixed) |
| House | 2×2 | Dark | Matching |
| Farm | 3×3 | Dark | Sorting |
| Storehouse | 2×2 | Dark | Spelling |
| Barracks | 3×3 | Dark | Sentence building |
| Watchtower | 2×2 | Dark | Listening |
| Beast Pen | 3×3 | Mythic | Clue → word |
| Sanctum | 3×3 | Mythic | Reading |
| Workshop | 3×3 | Arcane | Grammar repair |

- A building is upgraded to the current age by completing its station. Footprints never change with the age.
- HP rises 20% with each rebuild.
- Nation twists: Hufflepuff production and dropsite buildings can pack up and relocate; Ravenclaw buildings slowly heal nearby units and its Farms and Storehouses gather faster next to water; Gryffindor buildings go up 20% faster with 15% less HP; Slytherin buildings have 25% more HP and regenerate but take 20% longer to build.

### Data format

All content is data, not code: one JSON entry per building or unit, in the nation's file.

```json
{
  "id": "gryffindor_mythic_barracks",
  "type": "building",
  "nation": "gryffindor",
  "role": "barracks",
  "age": 2,
  "name": "War Hall",
  "element": "fire",
  "footprint": [3, 3],
  "cost": { "food": 0, "lumber": 150, "gold": 0 },
  "build_time_s": 45,
  "hp": 1440,
  "upgrade_task": "build",
  "production_queue": ["gryffindor_mythic_spear"],
  "art_ref": "gFireBarracks",
  "description": "One line, player-facing."
}
```

Units use the same shape with `"type": "unit"`, plus `hp`, `attack`, `armor`, `speed`, `range`, `attack_type`, `cost`, `pop` and `element`.

### Constraints

- Costs use only Food, Lumber and Gold.
- Every building and unit has an `age` 1–4; a unit may only be produced by a building of the same or a lower age.
- No unit is strictly stronger than its age peers across all stats; each has a weakness.
- Per age, per nation: 3–4 units; exactly one signature creature form and one hero in ages 2–4.
- Names: short, evocative, no trademarked terms. IDs: lowercase snake_case, prefixed by nation and age.

## 7. Arenas and difficulty

Three arenas, climbing in difficulty, each self-contained. **[OPEN]** Settings for the three maps (SnowPax uses real Istanbul places; this game may use invented ones).

| Arena | AI behaviour | Rival draw weights (player-favoured / even / rival-favoured) |
|---|---|---|
| 1 | Builds slowly, attacks late, teaches basics | 40% / 50% / 10% |
| 2 | Expands, uses all ages, reacts to scouting | 25% / 50% / 25% |
| 3 | Times attacks to player weak spots | 10% / 40% / 50% |

- Difficulty comes from AI behaviour and skill, never resource cheats.
- AI skill compensates for matchup edges.
- The setup screen shows only a general description ("tougher rival"), never odds.
- **Unlocking**: the next arena opens at 80% first-try accuracy on the language tasks (the SnowPax rule).
- **Pace**: Relaxed (no task timers, slower rival) or Challenge (task timers, full-speed rival), as in SnowPax.

## 8. Main screen

One panel that fits a phone without scrolling (as solMaxima's opening screen):

1. **Who are you?** Grade (5–8), then class and name from the League roster (as SnowPax). The team follows from the roster.
2. **Theme / unit**: the grade's units (for example School Life, Wild Animals). It decides which words and sentences appear.
3. **Pace**: Relaxed or Challenge.
4. **Arena panel**: the three arenas with their age ladder (Dark → Mythic, Mythic → Arcane, Arcane → Celestial), lock state and stars. Team cards show each team's live Ulti for the chosen grade.

## 9. English League

- Wins are claimed as Ulti points through the League client (game ID to be assigned; see SnowPax `docs/ENGLISH-LEAGUE.md`). The League decides the points.
- Win rule (proposed, from SnowPax): 60% of tasks right first time on Relaxed, or 2+ stars on Challenge.
- `public/config.js` holds the League address; an empty value gives a practice-only copy with no requests.
- No ads, no accounts, no tracking beyond the League claim. Progress is saved per device.

## 10. Balance and testing

- Headless simulation of every nation against every other; target 45–55% for each pairing. Re-run after every content change.
- Match length: 15–20 minutes median per arena; track the median and 90th percentile.
- Language time budget: about 35–40% of an arena spent at stations; check per arena.

## 11. Telemetry (local, per match)

- `match_id`, `timestamp`, `arena`, `grade`, `unit`, `pace`, `player_nation`, `rival_nation`, `rival_skill_level`
- `winner`, `duration_s`, `reason`, `age_reached_at` for both sides
- Language: tasks attempted, first-try accuracy per task family, missed concept IDs (feeds review)

## 12. Touch interaction

- Tap to select; long-press for a context command; drag on empty ground to box-select.
- Two-finger drag to pan; pinch to zoom.
- Command card and production panel: large icons, at least 44 px.
- Placement: a lift-and-place ghost above the finger.
- Stations: the fight slows to a quarter speed while a station is open (as SnowPax).

## 13. Open decisions

1. ~~Nation names~~: kept for the prototype; **rename before any public release**.
2. ~~Age names~~: Dark / Mythic / Arcane / Celestial.
3. ~~Team choice~~: always the student's League team.
4. ~~Carry-over~~: none except the starting age.
5. Arena settings and map themes.
6. League game ID and the exact win rule.
7. Rival draw weights (section 7) or uniform draws with AI skill only.
8. Units roster per nation and age (next content task).
9. Scope for v1: suggested all four nations, the tutorial and Arena 1 first.
