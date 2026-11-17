# English tasks in the RTS

English is woven into the game's own jobs, as in Languini: **the gesture that does the job is the English task.** Soldiers holding sentence blocks march into formation when the sentence is built; produce sorted into the right baskets is the harvest; a fixed blueprint assembles the siege engine.

## The rules

1. **Wait or do it now, except for a few required moments.** Most timers can be waited out or skipped with English: construction, upgrades, squad training and research. A few key moments are **required** English with no waiting option, starting with the age-up (see "Required tasks"). Each pending job shows its timer and a **Do it now** button (a drawn lightning-bolt icon, not an emoji) that opens its station. Completing the task finishes the job instantly.
2. **English never interrupts a fight.** There are no pop-ups. Pending jobs wait on the **work-order rail** (like Languini's ticket rail) until the player taps one.
3. **The gesture is the job.** The camera glides to the building; words sit on the 3D props; every accepted move visibly does part of the work.
4. **One task, one whole batch.** One sentence musters the whole squad, one sort brings in the whole harvest, one fix repairs the whole building.
5. **Protected time.** While a station is open, the match pauses on Relaxed (the rival AI too) and runs at a quarter speed on Challenge. A student is never punished for reading slowly. **[Proposed]**
6. **Nobody gets stuck.** A wrong answer brings a hint, then an explanation and the right answer (the bank's two-step feedback). It never costs units or resources.

## Wait or do it now

| Job | Waiting time (example) | Do it now |
|---|---|---|
| Construct a building | Its build time (20–60 s, see `BUILDING_ROSTER.md`) | The building's station, 3 items |
| Upgrade a building to the current age | 60–120 s | The building's station, 3 items |
| Train a squad (Barracks, Beast Pen, Workshop) | About 20 s per unit | One drill / feeding / blueprint task |
| Research a tech (Sanctum) | 45–90 s | One scroll |
| Age-up | **No waiting: required** | The Age Ceremony |

- **Partial progress:** if the student steps out, each accepted item removes its share of the remaining time. Nothing is wasted.
- **Perfect bonus:** all items right first time earns a small extra, for example a 20% resource refund or a veteran squad. Accuracy is worth more than speed alone.
- **No farming:** a task only speeds up a job that is already paid for and queued.
- **Tempo:** waits are about twice as long as the task, so a student who uses English clearly out-paces one who waits. The rival AI waits its own timers; its difficulty is tuned around a student who does about half the tasks.

## Required tasks

These cannot be waited out. **Each arena demands more than the last:** Arena 1 is the easiest, Arena 3 the toughest, both in how many required moments there are and in how big they are. Each moment uses the task family of its job, so they do not all feel the same.

| Required moment | Task (family) | Arena 1 | Arena 2 | Arena 3 |
|---|---|---|---|---|
| **Gold mine claim**: staking the arena's first gold mine | Stamp the claim marker (spelling) | 1 item | 1 item | 2 items |
| **Key building foundation**: the building the age-up needs | That building's task | Barracks, 3 items | Sanctum, 3 items | Workshop, 3 items |
| **Other special building foundations**: the first Beast Pen and Sanctum built in the arena | That building's task | wait or do it now | Beast Pen, 3 items | Beast Pen and Sanctum, 3 items each |
| **Key research**: one Sanctum scroll before the Age Ceremony | Read the scroll (reading) | — | 3 items | 3 items |
| **Hero summon**: the arena's first hero, at the Sanctum | A two-turn dialogue | wait or do it now | 2 items | 2 items |
| **First squad drill**: the arena's first Barracks squad | Drill (sentence building) | wait or do it now | wait or do it now | 3 items |
| **First siege engine**: the arena's first Workshop engine | Blueprint (grammar repair) | — | wait or do it now | 3 items |
| **Age Ceremony**: the only way to reach the next age | One round per family | 3 rounds × 2 items | 4 rounds × 3 items | 6 rounds × 3 items, every family |
| **Creature's new form**: at the Beast Pen after the age-up | Feed the creature (clue → word) | 1 item | 1 item | 2 items |
| **Battle cry**: launching the final assault | A rallying reply (appropriate reply) | 1 item | 2 items | 3 items |

### Per arena

| Arena | Required moments, in a typical order | Tasks | Items | English time (required only) |
|---|---|---|---|---|
| Arena 1 (Dark → Mythic) | Gold mine claim, Barracks foundation, Age Ceremony, creature's first form, battle cry | **5** | about 12 | about 2–3 min |
| Arena 2 (starts Mythic → Arcane) | Gold mine claim, Sanctum foundation, key research, hero summon, Beast Pen foundation, Age Ceremony, creature's elder form, battle cry | **8** | about 27 | about 5 min |
| Arena 3 (starts Arcane → Celestial) | Gold mine claim, Workshop foundation, Sanctum foundation, key research, hero summon, first squad drill, Beast Pen foundation, first siege engine, Age Ceremony, creature's final form, battle cry | **11** | about 42 | about 8 min |

- The task formats climb too (see "Difficulty by arena"): Arena 1 uses matching, pictures, sorting, clues and spelling with the first letter given; Arena 3 adds grammar repair, reading and dialogue.
- **Quick starts** in Arenas 2 and 3 include the Town Center and the Dark-age buildings only. The Beast Pen, Sanctum and Workshop are never pre-built, because nothing carries over between arenas.
- Arena 3 holds about 8 minutes of required English, so it should run toward the 20-minute end of the range; check this in testing.
- **Required never means stuck.** A wrong answer brings a hint, then an explanation and the right answer, so every item eventually completes. First-try accuracy is still recorded.
- Required tasks can be paused and resumed; accepted answers are kept.
- The rival ages up on its own timer, so finishing the key building and the Ceremony promptly matters.
- **Battle cry:** the rival's Town Center is protected by a ward that only falls once the battle cry is given at the war banner. It cannot be skipped by waiting.

## Jobs and their tasks

| Job | Task family (bank field) | The gesture |
|---|---|---|
| **Drill a squad** (Barracks) | Sentence building (`sentences`) | Soldiers each hold a block; tap them in sentence order and they march into formation |
| **Harvest** (Farm) | Sorting (`categories`) | Drag produce into the right category baskets; full baskets roll to the store |
| **Stock the store** (Storehouse) | Spelling (`misspellings`, `words`) | Stamp crate labels: fix the misspelled label or spell the word with letter tiles (Languini's supply labelling) |
| **Move-in day** (House) | Matching EN↔TR or picture (`words`) | Carry furniture with Turkish tags into rooms with English names; each match furnishes a room |
| **Signal fires** (Watchtower) | Listening (`words`) | The lookout calls a word; light the beacon carrying it |
| **Feed the creature** (Beast Pen) | Clue → word (`clues`) | The creature asks a riddle; toss it the food labelled with the answer |
| **Research** (Sanctum) | Reading (`contexts`) | Read a short scroll and answer its question; it seals into the tech library |
| **Build a siege engine** (Workshop) | Grammar repair (`repairs`) | Find the mistake on the blueprint, choose the right word, stamp it (Languini's checkout receipt) |
| **Repair a damaged building** (any) | Gap fill (`gaps`) | Cracks show a sentence with a missing word; fill it and the crack seals |
| **Trade with a caravan** (visits the Storehouse) | Appropriate reply (`questions`) | The trader asks, for example, "How much wood do you need?"; choose the right reply to make the deal |
| **Cross the river** (map) | Sentence halves (`halves`) | Join the halves; each pair lays a plank of the bridge |
| **Hire mercenaries** (Envoy's Tent) | Dialogue (`dialogues`) | A short two-turn conversation with the envoy |
| **Cast a Town Center ability** | One quick item | Read the incantation and pick the missing word; abilities also recharge slowly on their own |
| **Age-up: Age Ceremony** (Town Center) | Mixed | One quick round per family the unit supports, ending in the age transformation |

- Each station has one mechanic and four nation skins (for example the Sanctum's scroll library is a hive library, an observatory, a forge hall or a grove).
- The player's own commander stands in the station, cheering right answers and shrugging at wrong ones (as in SnowPax).
- Repairs, trade, bridges, mercenaries and abilities are optional extras with cooldowns; they have no waiting alternative because they do not exist without the task.

### Pictures in tasks

Emoji pictures (the bank's licensed Fluent Emoji images) appear **only inside language tasks**, as picture prompts. Everywhere else the game uses its own drawn icons (see `GAME_DESIGN_SPEC.md`, Icons).

### Words in the world (no task)

- Unit and building names in English, with Turkish on a long-press.
- Scout reports as one short English line.
- Gold "word coins" from resource nodes: picking one up reads the word aloud with its meaning (like SnowPax's snowflake words).

## Scoring and unlocking

- **Unlock rule: 60% first-try accuracy** in the arena (lower than SnowPax's 80%, because the student is also running a battle).
- Accuracy counts every task the student did in the arena, required and optional. There is no minimum task count: the required tasks (5, 8 and 11 per arena) guarantee there is always enough to count.
- Every item counts once toward first-try accuracy; retries after a hint do not count against it twice.
- The **English League claim** (Ulti points) needs a win plus the 60% rule on Relaxed, or 2+ stars on Challenge. **[OPEN]** confirm with the League.
- Stars per arena (proposed): 1 for the win, 2 for 60%+ first-try, 3 for 80%+ first-try.

## The language bank

`content/grade5.json` to `content/grade8.json` (from the SnowPax v0.5.0 linked bank; see `content/README-LEARNING.md` and `content/AUTHORING.md`).

- 44 units: Grade 5 (A2.1) and Grade 6 (A2.2) have 10 each; Grades 7 and 8 (A2) have 12 each.
- The student picks a unit as the **theme** on the main screen; every task in the match draws from it.
- Every record has Turkish, a short bilingual hint (first miss) and an explanation (second miss).
- **Thin units:** the extension units (unit 9 onwards) have no `contexts` and only a few `gaps` and `repairs`. A job whose task the unit cannot fill uses a compatible family instead (as SnowPax's `usableSubtasks` does), for example reading falls back to appropriate reply.

## Difficulty by arena

| Arena | Families used | Notes |
|---|---|---|
| Tutorial and Arena 1 | Matching, pictures, sorting, clue → word, spelling with the first letter given | Short words; 3-block sentences |
| Arena 2 | + Sentence building, listening, sentence halves | 4-block sentences; no first letter |
| Arena 3 | + Grammar repair, reading, dialogue | 5–6-block sentences |

Jobs whose family is not yet unlocked use an easier compatible family, so every building can still be rushed in Arena 1. This mirrors SnowPax's per-arena sub-task gates (`minArena`) and its `demand` table.

## Choosing items

Follow solMaxima's `practice-selection.js`:
- About 60% fresh items, 25% review and 15% familiar.
- Track by concept (`conceptIds`), not single records; the same word may appear in several formats.
- A missed concept returns after two other tasks, in a different format where possible, and first on the low-stakes moments (abilities, word coins, repairs).
- Mastery (from the bank's runtime notes): at least four first-try successes, 80% first-try accuracy, two different dates and two evidence types; review spacing of 1, 3, 7 and 14 days.

## While a station is open

- The card is a slim strip with title, coach line, progress, timer (Challenge only), read-aloud and Step out.
- Words are HTML labels pinned to the 3D props each frame, so they stay sharp and tappable (SnowPax `render/worldtask.js`).
- Listening uses the device's English voice, with "Hear it again"; with no voice, the word is shown to read instead.

## Time budget

An arena is 15–20 minutes. A student who rushes most jobs spends about 35–40% of it at stations: roughly 6–10 building jobs, a few squads and research, one Age Ceremony and a handful of extras. That is about one English moment per minute, all chosen by the student.
