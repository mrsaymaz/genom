# English tasks in the RTS

English practice drives progress: buildings are upgraded and ages are reached by completing English tasks at **3D task stations**. The rule from SnowPax holds: wrong answers only cost time, a hint and the right answer always follow, and nobody gets stuck.

## The language bank

`content/grade5.json` to `content/grade8.json` (from the SnowPax v0.5.0 linked bank; see `content/README-LEARNING.md` and `content/AUTHORING.md`).

- 44 units: Grade 5 (A2.1) and Grade 6 (A2.2) have 10 each; Grades 7 and 8 (A2) have 12 each.
- The student picks a unit as the **theme** on the main screen; every task in the match draws from it.
- Each unit has these task families:

| Field | What it holds | Used for |
|---|---|---|
| `words` | English, Turkish, picture, definition, example | Matching, listening, spelling |
| `clues` | Riddle → word | Clue → word |
| `halves` | Sentence beginnings and endings | Sentence halves |
| `sentences` | Sentences split into meaningful blocks | Sentence building |
| `questions` | Question → appropriate reply, with option sets | Appropriate reply, dialogue |
| `contexts` | A short message with questions | Reading |
| `gaps`, `repairs` | Grammar gaps and broken words | Grammar repair |
| `categories` | Group members and non-members | Sorting, odd one out |
| `misspellings` | A word and a wrong spelling | Spelling |
| `dialogues` | Two linked questions | Envoy dialogue |

- Every record has Turkish, a short bilingual hint (first miss) and an explanation (second miss).
- **Thin units**: the extension units (unit 9 onwards) have no `contexts` and only a few `gaps`/`repairs`. A station the unit cannot fill is replaced by a compatible one, as SnowPax's `usableSubtasks` does.

## Where tasks appear

### 1. Trial of the Age (Town Center)

The biggest station. Requirements before it opens: the age-up resources and the key building (Sanctum for Arcane, Workshop for Celestial).

- A chain of short rounds, one per task family the unit supports.
- Target: about 80% first-try accuracy. Below that, the trial can be retried after a short cooldown; the answers already given count.
- On success, the age-up transformation plays (`GAME_DESIGN_SPEC.md` section 4).

### 2. Building upgrades

Each role owns one task family, so players learn what to expect where. One round of 3 items per upgrade.

| Building | Task family | Station (3D set) | Interaction |
|---|---|---|---|
| House | Matching EN↔TR or picture | **Name Plaques** | Hang the right nameplate on each door |
| Farm | Sorting into groups | **Harvest Carts** | Load each crate into the right category cart |
| Storehouse | Spelling, wrong-spelling hunt | **Ledger Stamps** | Stamp the correctly spelled label on each crate |
| Barracks | Build the sentence | **Drill Orders** | Soldiers holding blocks line up in sentence order |
| Watchtower | Listening | **Signal Horn** | The horn sounds the word; raise the right flag |
| Beast Pen | Clue → word | **Feed the Creature** | The creature asks a riddle; toss the food tagged with the answer |
| Sanctum | Reading a short message | **Scroll Library** | Read the scroll, answer its question |
| Workshop | Grammar gaps and repairs | **Blueprint Table** | Fix the broken word so the siege engine assembles |

- Each station has one shared mechanic and four nation skins (for example a hive library, an observatory, a forge hall and a grove for the Scroll Library): 9 stations × 4 skins.
- Every station shows the player's own commander, who acts out right answers (cheers) and wrong ones (shrugs), as in SnowPax.

### 3. Battlefield stations (neutral, capturable)

| Station | Task | Reward |
|---|---|---|
| **Word Wells** | A quick round (3 items, any family) | A temporary buff: gather speed or armour. Rivals can contest them. |
| **Bridge of Halves** | Match sentence halves | Builds a bridge across a river, opening a flanking route (like Wordramp's Bridge Builder) |
| **Envoy's Tent** | Appropriate reply / dialogue | Hires neutral mercenaries |
| **Rich nodes** | One question | A gold vein or great tree yields double for a while (like SnowPax's hot cocoa) |

### 4. Small moments

- **Town Center abilities** (Sky Lift, Moon Tide and the others) charge with one question each use.
- **The signature creature** is summoned with a short dialogue at the Beast Pen.
- **Missed words** come back on these small moments first.

## Difficulty by arena

| Arena | Families used | Notes |
|---|---|---|
| Tutorial and Arena 1 | Matching, pictures, sorting, clue → word, spelling with the first letter given | Short words and 3-block sentences |
| Arena 2 | + Sentence building, listening, sentence halves | 4-block sentences; no first letter |
| Arena 3 | + Grammar repair, reading, dialogue | 5–6-block sentences |

This mirrors SnowPax's per-arena sub-task gates (`minArena`) and its `demand` table.

## A complete plan per arena

Each arena guarantees the full set of stations the unit supports, in a shuffled order (as solMaxima's twenty-format plan), so no match turns into "only matching". The plan is seeded and saved with the match.

## Choosing items

Use solMaxima's `practice-selection.js` approach:
- About 60% fresh items, 25% review and 15% familiar.
- Tracking is by concept (`conceptIds`), not by single record; the same word or sentence may appear in several formats.
- A missed concept returns after two other activities, in a different format where possible.
- Mastery (from the bank's runtime notes): at least four first-try successes, 80% first-try accuracy, two different dates and two evidence types. Review spacing: 1, 3, 7 and 14 days.

## While a station is open

- The fight slows to a quarter speed; rival hits never interrupt the task.
- The card is a slim strip with title, coach line, progress, timer (Challenge pace only), read-aloud and Step out.
- Words sit on the 3D objects as HTML labels pinned each frame, so they stay sharp and tappable (SnowPax `render/worldtask.js`).
- Listening uses the device's English voice, with a "Hear it again" button; with no voice, the word is shown to read instead.
- **Scoring**: every item counts once toward the arena's first-try accuracy (the 80% rule).

## Time budget

An arena is 15–20 minutes. About 35–40% of it is at stations: roughly 6–8 building upgrades, 2–4 battlefield stations and one Trial of the Age, each about 30–60 seconds.
