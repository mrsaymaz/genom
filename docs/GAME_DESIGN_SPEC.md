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
- **Where it's played**: at home, as homework practice, never in class. Students play alone on their own phone, tablet or computer, with no teacher on hand, so every rule and control must teach itself in the game.
- **Platform**: web browser and installable web app, **landscape** (confirmed). On phones the game runs as an installed web app, full screen and sideways with no browser bars: a phone browser shows an install guide instead of the game (iPhone: Share, Add to Home Screen; Android: an Install button, or Play full screen without installing). The guide switches between English and Turkish, using the button names iOS shows in Turkish (Paylaş, Ana Ekrana Ekle, Ekle). Tablets and computers play in the browser. Phones held upright are asked to turn sideways.
- **Deployment**: a static build hosted on Vercel for Mr. Saymaz's students, as SnowPax is (`vercel.json`: build with `npm run build`, publish `dist`; no environment variables).
- **Match**: 1v1 against an AI rival, three arenas, each about 15–20 minutes.
- **Core loop**: gather Food, Lumber and Gold; build, upgrade and train; reach the next age; build an army; destroy the rival's Town Center.
- **Wait or go Instant!**: most timers (construction, upgrades, training, research) can be waited out or finished instantly with an English task, using the **Instant!** button. Key moments are required English with no waiting option, and **each arena demands more**: 5 required tasks in Arena 1, 8 in Arena 2 and 11 in Arena 3 (`LANGUAGE_TASKS.md`). Wrong answers only cost time, and nobody gets stuck (same rule as SnowPax).

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
- **Quick start**: Arenas 2 and 3 open with the Town Center and the Dark-age buildings already standing, upgraded to the starting age, so the early game is not replayed. The special buildings (Beast Pen, Sanctum, Workshop) are never pre-built.
- **Age-up timing**: around minute 6–9 of the arena, leaving time to use the new age before the finale.
- **The rival ages up too**, on a timer set by its difficulty, so the race to the next age is part of the fight.
- **Age-up requirements**: resources and one key building founded in this arena (Barracks for Mythic, Sanctum for Arcane, Workshop for Celestial), plus one Sanctum research for Arcane and Celestial. Then the **Age Ceremony** at the Town Center is **required**: there is no timer to wait out, and it grows with each arena (3, 4 and 6 rounds; `LANGUAGE_TASKS.md`). Wrong answers bring hints and the right answer, so nobody is stuck.
- **The age-up moment**: every building transforms into its next-age form, one by one, with the nation's elemental choreography (as solMaxima's evolutions: air ribbons, rising embers, growing vines, water arches). Under 8 seconds, skippable. The signature creature takes its next form at the same time.
- **Built (Dark to Mythic)**: research at the Town Center (400 food, 150 gold, 40 s, needs a Barracks), with an elemental vortex and a growing pillar of light. Then a 7.5 s ceremony that pauses play and can be skipped: letterbox bars, the camera glides to the Town Center, dusk, a burst and two shockwave rings, the title card, and a wave that transforms each building (sinking into light, rising in its Mythic form) and each unit as it passes. The rival ages up too (Relaxed at 13 min, Challenge at about 8.5 min), with the same wave on the map but no pause. The Age Ceremony language task will join the research step.
- **Built (Mythic to Arcane, Arcane to Celestial)**: the Arcane Age (600 food, 300 gold, 45 s) needs a Sanctum and the Celestial Age (800 food, 450 gold, 50 s) a Workshop. Every building takes its Arcane or Celestial form from the concept pages. Each ceremony is grander: the Arcane Age adds a third shockwave ring, a violet dusk and a crown of stars circling the Town Center; the Celestial Age brings night, a starry sky, stars falling on every building as it changes, four rings and a crown of bells. The title card shows four age marks lit up to the new age, and a short note after the ceremony says what is new. **Temporary, for testing only:** until the arenas are built, the tutorial skirmish lets all three age-ups happen in one match so every age can be tried. The design stays one age-up per arena; when the arenas arrive, the tutorial goes back to Dark to Mythic only. The rival ages up on timers (Relaxed 13, 21 and 29 min; Challenge about 8.5, 14.5 and 20.5 min), builds its Sanctum and Beast Pen, trains its hero and creature and uses the hero's ability in fights.
- **Built (siege engines)**: the Workshop (Arcane Age, 200 lumber, 100 gold) builds siege engines: one per nation, with an Arcane and a Celestial form (Gust Cannon / Storm Engine, Tide Engine / Moon Engine, Magma Mortar / Sun Cannon, Root Catapult / Earthshaker). Every engine is slow, lobs a long shot (6.5 to 8 tiles) that bursts where it lands, deals heavy damage to buildings and half to units, and cannot fire at anything within 2 tiles; spear fighters, scouts and chargers tear into it and arrows do little. Each nation's shot is different: Gust Shot throws units back, Soak slows them, Lava Splash leaves the ground burning, Shatter hits buildings 30% harder and sprays shards. The rival builds a Workshop and two engines and sends them with its attacks. Gold mines hold more gold (1500 at home, 1800 in the middle) so every age can be reached.
- **Built (upgrades and technologies)**: buildings research upgrades, one at a time (a building does not train while it researches); tap Research on a building to open its wheel of upgrades, each with a short effect, its cost and its level. Most have levels that unlock with the ages (I from the Dark Age, II Mythic, III Arcane), and costs grow per level. Town Center: Bigger Baskets (carry +5), Quick Feet (workers +15% speed), Town Guard (Town Center and tower arrows +30% per level). Storehouse: Sharp Axes, Deep Picks, Farm Tools (+20% gathering per level, 3 levels). Barracks: Forged Weapons (+15% attack), Strong Armour (+15% health), each 3 levels, Fletching (archers and towers +1 range, 2 levels). Watchtower: Stone Walls (all buildings +25% health, 2 levels), Signal Fires (towers +2 range). Sanctum: Hero Training; Beast Pen: Beast Training; Workshop: Siege Craft. Each nation has two of its own at the Sanctum: Swarm Call and Hive Homes (Hufflepuff), Deep Springs and Tide Healers (Ravenclaw), Forge Fury and Lion Heart (Gryffindor), Ironbark and Root Network (Slytherin). Upgrades also apply to units already trained. The rival researches too (about every 90 s on Relaxed, 30 s on Challenge), so out-researching it is part of winning; its upgrades are announced. A tutorial goal teaches research (Forged Weapons at the Barracks) before the first attack.
- **Built (heroes and creatures)**: the Sanctum trains one hero at a time and the Beast Pen one signature creature at a time. With the hero selected, a big ability button (with its cooldown on the ring) casts Updraft, High Tide, Battle Roar or Root Snare around the hero; each age makes it reach further and recharge faster (35, 30, 25 s). Creature abilities work on their own: Gale Slam, Healing Rain (the raven flies over water and buildings), Fire Roar and Entangle. Creatures beat the next element's creature (x1.5), and spear fighters hit creatures harder.

## 5. Visual design languages

Each nation owns its shapes and materials, and **each age changes the structural concept**, not just the ornament. Every role keeps its own silhouette within an age (Barracks long, Watchtower tall and thin, Workshop a machine, Sanctum a centred monument).

| Nation | Dark | Mythic | Arcane | Celestial |
|---|---|---|---|---|
| Hufflepuff | Straw and timber hives, masts | Honeycomb masonry: clusters of hex cells | Airborne: floating islands, levitating stacks, airships | Clouds and stars: cloud-borne islands, amber stars, constellations |
| Ravenclaw | Driftwood and shell | Pearl shell architecture: conch, nautilus, scallop | Glass and living water: domes and tanks on water columns | Moon and silver: crescents, moon orbs, an orrery |
| Gryffindor | Rough basalt huts | Stepped basalt ziggurats with gold bands | Obsidian and molten gold: lion-head gate, phoenix, volcano forge | Sun and phoenix: small suns, sunburst crowns, solar lens |
| Slytherin | Earth and sod mounds | Living wood: trees, woven branches | Megaliths and emerald: dolmens, obelisks, crystal hearts | Star blossoms: giant glowing buds, lilies, seed pods |

Rules:
- **Icons: no emoji anywhere in the game** (HUD, buttons, menus, main screen, notifications, unit and building cards) **except inside language tasks**, where the bank's licensed Fluent Emoji pictures are the picture prompts. Every other icon is drawn in the game's own style (resources, the Instant! lightning bolt, abilities, team emblems).
- **Motif ownership**: hives and sails are Hufflepuff's; conches, glass and water Ravenclaw's; basalt, magma and lions Gryffindor's; trees and trilithons Slytherin's. **No trees outside Slytherin.**
- Every building must read by **silhouette alone** (each concept page has a Silhouette view).
- The concept pages in `docs/concepts/` are the reference. The ladders of names and descriptions are in `BUILDING_ROSTER.md` and `TOWN_CENTERS.md`.

## 6. Buildings and units: content rules

### Buildings

Eight roles, the same for every nation (full table in `BUILDING_ROSTER.md`):

| Role | Footprint | Unlocked | Instant! task (`LANGUAGE_TASKS.md`) |
|---|---|---|---|
| Town Center | 4×4 | start | Age Ceremony (mixed) |
| House | 2×2 | Dark | Move-in day: matching |
| Farm | 3×3 | Dark | Harvest: sorting |
| Storehouse | 2×2 | Dark | Stock the store: spelling |
| Barracks | 3×3 | Dark | Drill: sentence building |
| Watchtower | 2×2 | Dark | Signal fires: listening |
| Beast Pen | 3×3 | Mythic | Feed the creature: clue → word |
| Sanctum | 3×3 | Mythic | Research: reading |
| Workshop | 3×3 | Arcane | Blueprint: grammar repair |

- A building is constructed or upgraded to the current age by waiting its timer, or instantly by completing its task. Footprints never change with the age.
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
  "rush_task": "build",
  "upgrade_time_s": 90,
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

Three arenas, climbing in difficulty, each self-contained, on **invented landscapes** (confirmed), so their settings can be as imaginative as the nations.

| Arena | AI behaviour | Rival draw weights (player-favoured / even / rival-favoured) |
|---|---|---|
| 1 | Builds slowly, attacks late, teaches basics | 40% / 50% / 10% |
| 2 | Expands, uses all ages, reacts to scouting | 25% / 50% / 25% |
| 3 | Times attacks to player weak spots | 10% / 40% / 50% |

- Difficulty comes from AI behaviour and skill, never resource cheats.
- AI skill compensates for matchup edges.
- The setup screen shows only a general description ("tougher rival"), never odds.
- **Unlocking**: the next arena opens with a win and **60% first-try accuracy** on the English tasks, over every task the student did in the arena; the required tasks guarantee there are always some to count (`LANGUAGE_TASKS.md`).
- **Pace**: Relaxed (no task timers, slower rival) or Challenge (task timers, full-speed rival), as in SnowPax.

## 8. Main screen

One panel that fits a phone without scrolling (as solMaxima's opening screen):

1. **Who are you?** Grade (5–8), then class and name from the League roster (as SnowPax). The team follows from the roster.
2. **Theme / unit**: the grade's units (for example School Life, Wild Animals). It decides which words and sentences appear.
3. **Pace**: Relaxed or Challenge.
4. **Arena panel**: the three arenas with their age ladder (Dark → Mythic, Mythic → Arcane, Arcane → Celestial), lock state and stars. Team cards show each team's live Ulti for the chosen grade.

## 9. English League

- Wins are claimed as Ulti points through the League client (game ID to be assigned; see SnowPax `docs/ENGLISH-LEAGUE.md`). The League decides the points.
- Win rule (proposed): a win plus 60% of tasks right first time on Relaxed, or 2+ stars on Challenge. Stars: 1 for the win, 2 for 60%+ first-try, 3 for 80%+.
- `public/config.js` holds the League address; an empty value gives a practice-only copy with no requests.
- No ads, no accounts, no tracking beyond the League claim. Progress is saved per device.

## 10. Balance and testing

- Headless simulation of every nation against every other; target 45–55% for each pairing. Re-run after every content change.
- Match length: 15–20 minutes median per arena; track the median and 90th percentile.
- Language time budget: about 35–40% of an arena spent at stations for a student who rushes most jobs; check per arena.
- Tempo: waits about twice a task's length, and the rival tuned around a student who does about half the tasks; check that waiting for everything is still winnable on Relaxed Arena 1.

## 11. Telemetry (local, per match)

- `match_id`, `timestamp`, `arena`, `grade`, `unit`, `pace`, `player_nation`, `rival_nation`, `rival_skill_level`
- `winner`, `duration_s`, `reason`, `age_reached_at` for both sides
- Language: tasks attempted, first-try accuracy per task family, missed concept IDs (feeds review)

## 12. Touch interaction

- Tap to select; long-press for a context command; drag on empty ground to box-select.
- Two-finger drag to pan; pinch to zoom.
- Command card and production panel: large icons, at least 44 px.
- Placement: a lift-and-place ghost above the finger.
- Stations: the match pauses on Relaxed and runs at a quarter speed on Challenge while a station is open (confirmed). Pending jobs wait on a work-order rail; nothing pops up.

## 13. Open decisions

1. ~~Nation names~~: kept for the prototype; **rename before any public release**.
2. ~~Age names~~: Dark / Mythic / Arcane / Celestial.
3. ~~Team choice~~: always the student's League team.
4. ~~Icons~~: no emoji outside language tasks; all other icons are drawn.
5. ~~Carry-over~~: none except the starting age.
6. ~~Unlock threshold~~: 60% first-try accuracy over all tasks done in the arena; no minimum task count.
7. ~~Language tasks~~: wait or Instant! per job, with the age-up (Age Ceremony) required, as in `LANGUAGE_TASKS.md`.
8. ~~Other required tasks~~: they climb by arena: 5 in Arena 1, 8 in Arena 2, 11 in Arena 3 (`LANGUAGE_TASKS.md`).
9. ~~Protected time~~: full pause on Relaxed and a quarter speed on Challenge while a task is open.
10. ~~Map settings~~: the tutorial and all three arenas are invented landscapes; their themes are still to design. **Built (tutorial map)**: Sunmeadow Vale is now 72 by 72 tiles (it was 48), point-symmetric, with a winding river and five fords. Each side has a home gold mine, a second mine behind the base, two outlying sites (gold, berries and a grove) worth claiming with a Storehouse, a contested mine near the river and a pond; groves and rocky outcrops are scattered across the meadow. Matches saved on the old map still continue on it.
11. League game ID and the exact win rule.
12. Rival draw weights (section 7) or uniform draws with AI skill only.
13. ~~Units roster~~: four lines per nation (Worker, Infantry, Ranged and an element special: Air scouts, Water healers, Fire chargers, Earth guardians) that transform every age, plus a hero and the signature creature from the Mythic Age and siege from the Arcane Age (`UNIT_ROSTER.md`). The Dark Age units are in the game, with counters, the element edge and the four special abilities. The Mythic Age units and heroes are in the game with the age-up. The Arcane and Celestial Age units, heroes and creatures are in the game with their age-ups (`arcane-age-units.html`, `celestial-age-units.html`); the Celestial forms are the final and strongest. Siege engines are in the game too (see Siege engines below).
14. Scope for v1: suggested all four nations, the tutorial and Arena 1 first.
