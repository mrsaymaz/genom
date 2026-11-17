# Scene sources for the concept pages

These are the three.js scene fragments used to build the concept pages in `docs/concepts/`. Each page is self-contained: its full code is already inside the HTML. The fragments are kept here so the game can reuse the models.

They are **fragments, not modules**: each one expects to be pasted inside the page's single script scope, after the shared builder (`bld_core.js`), and before the renderer. They rely on shared globals such as `T3` (three.js r128), `PI`, `M`, `C`, `lin`, `tex`, `TEX`, `B` and `glowMat`.

## What each file holds

| File | Contents |
|---|---|
| `bld_core.js` | Textures (`TEX`, `tex`, `M`, `C`, `lin`) and the `B` scene builder (`add`, `box`, `cyl`, `beam`, `base`, props) |
| `bld_scenes_part.js` | Builder extras (`slab`, `water`, `lift`, `wheat`, `boat`, …) and the first Dark Age buildings |
| `mb_top.js` | Shared helpers (`glowMat`, `onRing`, `REDGOLD`, `BRONZE`, …) and builder props (`crystal`, `target`, `eagle`, …) |
| `creatures.js`, `pens.js` | Signature creatures (`bear`, `raven`, `lion`, `serpent`) and their first pens |
| `darkblock.js` | Dark Age Town Centers in the nation design languages (`DARKNEW`) and core helpers (`dSkep`, `dConch`, `dFrustum`, …) |
| `dbn.js` | Dark Age buildings (`NEWB`) |
| `mbn.js` | Mythic Age buildings (`MYTHB`) |
| `lang_scenes.js`, `mythnew.js` | Mythic Town Centers (`MYTHNEW`) and helpers (`kite`, `lionStatue`, …) |
| `arcnew.js` | Arcane Town Centers (`ARCNEW`) and helpers (`hexIsland`, `inGroup`, `armSphere`) |
| `abn.js` | First Arcane buildings (`ARCB`) and helpers (`honeyPylon`, `waterRing2`, `haloG`, `magmaMoat`) |
| `h2.js` | Hufflepuff Mythic and Arcane buildings on the age ladder (overrides `MYTHB.air`, `ARCB.air`) |
| `r2.js` | Ravenclaw Mythic and Arcane buildings (overrides `MYTHB.water`, `ARCB.water`) |
| `g2.js` | Gryffindor Mythic and Arcane buildings (overrides `MYTHB.fire`, `ARCB.fire`) |
| `s2.js` | Slytherin Mythic and Arcane buildings (overrides `MYTHB.earth`, `ARCB.earth`) |
| `tcn.js` | Town Centers on the age ladder (overrides `MYTHNEW.air`, `ARCNEW`) |
| `cel.js` | Celestial Town Centers (`CELEST`) and helpers (`starMotes`, `constellation`, `cloud`) |
| `c2.js` | Celestial buildings for all four nations (`CELB`) |
| `mythic_scenes.js`, `arcane_scenes.js`, `ab_pre.js`, `ab_scenes.js`, `mb_scenes_v2.js` | Earlier versions (the "Previous" view on the pages) and the original Slytherin scenes and helpers |

## Order used on the pages

Builder core, then the earlier scenes, then: `darkblock` → `dbn` → `mbn` → `lang_scenes` → `mythnew` → `arcnew` → `abn` → `h2` → `r2` → `g2` → `s2` → `tcn` → `cel` → `c2`.

Later files override the tables of earlier ones, so the order matters.

## For the game

The game should turn these into ES modules with explicit imports, one module per nation and age, keyed by the building IDs in `docs/BUILDING_ROSTER.md`.
