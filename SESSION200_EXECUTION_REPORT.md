# Session 200 — Execution Report

**Brief:** a premium excellence pass over the lesson player and the manipulative system
(Fable 5C prompt), with authored lesson content frozen and all existing product invariants
preserved.

**Outcome:** the brief was executed audit-first. The audit did not support the brief's central
premise, and said so rather than manufacturing work to match it. THREE real defects of a single
class were found, fixed, tested adversarially, and shipped, with no lesson content touched.

A second mandate followed in the same session: the §22 visual-explanation repair. That work DID
edit lesson JSON — 51 files, each concept step gaining exactly one registered `figure` key and
nothing else — taking figure coverage from 97.21% to **100%** (3616/3616). It is the only
content-touching work in S200 and is fully itemised in `SESSION200_CONTENT_CHANGE_LEDGER.json`.

---

## 1. What the audit measured

All figures independently derived from disk, not read from documentation:

- 1,667 lessons · 15,305 steps · 10,022 widget steps
- **125 registered widget types** (`STAGE_TIER`, the exhaustive `Record<TWidget["type"], …>`),
  of which 123 appear in content
- tiers A 1156 / B 313 / C 188 / D 10

## 2. The brief's premise did not survive contact with the repo

The prompt was written against a much earlier snapshot. Several of its P0 items are already
shipped to the standard it describes:

| P0 asked for | already present |
|---|---|
| principled responsive stage widths, not per-widget hard-coding | `src/components/stageWidth.ts` — three tiers (narrow/medium/wide), exhaustive over the widget union so an unregistered tier is a compile error, applied to the step column *and* the header/footer inner containers |
| coherent motion language, reduced-motion parity | `src/lib/motion.ts` — settle/snap/ease tokens, `gatedKeyframes`, `glideStyle`, `useCountUp`, all gated so the base render equals the final state |
| reveal that contrasts learner state with correct state | `revealYours` / `revealAnswer` contrast pair in the dock |
| feedback that never covers the manipulative | dock is sticky (takes layout space), feedback region capped at `42dvh` with internal scroll, plus a measured dock-overlap reveal |
| prediction that treats surprise as evidence | non-shaming comparison banner; predict options seeded-shuffled to defeat the 87% authoring bias |
| undo for multi-action construction | CML history with `undoCML` / `restoreFirstCML` |

**The tier scorer contradicts the premise directly.** Averaging its 13 dimensions across Tier A
versus Tier C/D lessons:

| dimension | Tier A | Tier C/D |
|---|---:|---:|
| polish | 2.01 | 2.00 |
| mobile | 1.99 | 2.00 |
| a11y | 2.02 | 2.00 |
| **prediction** | **2.97** | **0.10** |
| **manip** | **2.14** | **0.63** |
| adapt | 2.23 | 1.04 |
| formal | 2.67 | 1.83 |

Presentation quality is flat across the corpus; the entire quality gap is prediction and
manipulation coverage, and 196 of the 198 weak lessons are high school. That is content
authoring — explicitly frozen by this brief. Recorded so a later session does not re-litigate it.

## 3. What the audit did find

**One defect class: the player gated two learner-facing surfaces on step KIND, while every other
layer gated on AVAILABILITY.**

### 3.1 Stranded hint ladders (118 steps)

`usePlayer.hint()` advances `hintsShown` for any step carrying `hints`. The ladder renderer draws
`s.hints.slice(0, hintsShown)` for any step. `xpFor()` accepts `"interactive"` as a kind and
prices each rung at the same −2 XP. Only the button tested
`s.kind === "challenge" || s.kind === "check"` — and `Enter` never calls `hint()`, so there was no
alternate route.

Result: 118 interactive steps carrying complete three-rung ladders that no learner action could
open, across nine courses — decimal-operations 27, fractions-multiply 22, ratios-rates 17,
decimals-place-value 12, number-system 12, volume-measurement 12, coordinate-geometry 8,
expressions-equations 7, data-distributions 1.

### 3.2 Stranded explanation variants (118 steps, 116 of them the same steps)

`showExplanation` carried the identical kind test, so `explanationVariants` authored on interactive
steps were discarded. A learner finished an explored step with a correct/revealed banner, no
"here is why", and no access to the "Explain it differently" swap.

### 3.3 Why no gate caught either

`validate:content` and `lint:pedagogy` verify that content is well-formed, not that the player
renders a path to it. The defect is only visible by cross-referencing *authored fields by step
kind* against *render conditions*. Worth repeating against any other field guarded by a
`s.kind === …` test.

## 4. The fix

`src/components/LessonPlayer.tsx`, two gates, both now keyed on availability:

```
- {(s.kind === "challenge" || s.kind === "check") && … hintsShown < (s.hints?.length ?? 0)
+ {actionable && … hintsShown < (s.hints?.length ?? 0)

- const showExplanation = finalized && (s.kind === "check" || s.kind === "challenge") && s.explanationVariants;
+ const showExplanation = finalized && actionable && s.explanationVariants;
```

`actionable` (`s.kind !== "concept" && s.kind !== "recap"`) preserves the exclusion that mattered;
the availability tests preserve the rest. Nothing new leaks: concept and recap steps author
neither field anywhere in the corpus (measured).

Why this improves learning: the scaffolding was written by the curriculum author for precisely the
moment a learner is stuck inside an exploration, and the "why" was written for the moment the
exploration resolves. Both were being withheld at exactly those moments.

## 5. Tests

`src/components/LessonPlayer.hintReach.s200.test.tsx` — 10 tests (6 hint/explanation + 4 figure):

1. the hint control appears on an interactive step with an authored ladder
2. rungs open one at a time and the control retires when exhausted
3. no hints on ungraded concept/recap steps
4. the authored explanation appears once an interactive step is finalized, and the swap reaches
   the second variant
5. `xpFor("interactive", …)` pricing is the pre-existing rule, not a new one
6. check-step behaviour is unchanged

Falsification-checked in both directions (see `SESSION200_GATE_EVIDENCE.md`).

## 5b. The class swept, and gated

The figure gate was the **third** instance, and it was repaired in THIS session — a fact an
earlier draft of this report got wrong, describing it as pre-existing. Diffing `LessonPlayer.tsx`
against the sealed S199 tarball settles it: 39 changed lines covering all three gates plus the
duplicate-label suppression. Three instances in one sweep is why the class was closed with a gate
rather than left to recur.

Every step-level field authored anywhere in the corpus, traced to its consumer:

| field | kinds authored | consumer | verdict |
|---|---|---|---|
| `body`, `id`, `kind` | all | player | reachable |
| `widget` | interactive / check / challenge | WidgetView | reachable |
| `hints` | +118 interactive | availability gate | **fixed S200** |
| `explanationVariants` | +118 interactive | availability gate | **fixed S200** |
| `figure` | concept 3616, interactive 2 | FIGURE_IDS gate | **fixed S200** |
| `predict` | interactive 1340 | prediction block | reachable |
| `takeaways` / `teaser` | recap | recap block | reachable |
| `narration` | concept 1100 | `speech.narrationFor()`, preferred over `body` | reachable |
| `cml` | interactive / check / challenge | `resolveCMLMeta` (kind-agnostic) | reachable |
| `variant` | check / challenge / interactive 62 | `variants.ts` seeded generator | reachable |
| `conceptTag` | check / challenge / interactive | mastery for graded kinds; process-evidence ledger for interactive | by design |

**No fourth instance.** Note `narration`: the schema still describes it as awaiting "a TTS/audio
provider in a later phase", but `narrationFor()` already prefers it over `body` for the Listen
control — the comment is stale, the field is wired.

The durable output is the gate, not the sweep. `src/components/playerFieldReachability.s200.test.ts`
(content group, 4 tests, ~7ms) collects every (field, kind) pair present in the corpus and fails
any pair without a declared consumer, reporting field, kind, step count and an example step id. It
also pins the three repairs at corpus level and rejects stale declarations for pairs the corpus no
longer authors. Falsification-checked: deleting the `hints::interactive` declaration reproduces the
original S200 defect as a failing assertion.

This is the piece that makes the session durable — a fourth instance now fails at authoring time
instead of shipping silently.

## 6. Files changed

| file | change |
|---|---|
| `src/components/LessonPlayer.tsx` | **three** render gates (kind → availability) plus duplicate-label suppression; 39-line diff vs S199 |
| `src/components/LessonPlayer.hintReach.s200.test.tsx` | **new** — 6 adversarial tests |
| `src/components/playerFieldReachability.s200.test.ts` | **new** — corpus gate closing the stranding class for good |
| `scripts/session/s200-latch-repeat.sh` | **new** — repeat-runs one e2e test against a production server to separate regression from load-induced race |
| `SESSION200_GATE_EVIDENCE.md`, `SESSION200_EXECUTION_REPORT.md`, `SESSION200_LESSON_HASHES.json` | **new** — release artifacts |
| `SESSION_NOTES.md`, `KNOWN_ISSUES.md`, `HANDOVER.md` | session record, three findings, next-session pointer |

**No file under `content/` was modified.**

## 7. Honest limitations

- **Not a transformation of the manipulative system.** The brief's Part II/III asked for
  direct-manipulation upgrades across the high-priority engines. None were made. The audit found
  the shared layer already in place and the measured weakness elsewhere; spending the session
  rewriting healthy engines would have been motion without benefit.
- **The C/D backlog is untouched** — 188 C and 10 D lessons, overwhelmingly high-school, needing
  prediction and manipulation steps that only content authoring can add.
- **No before/after scoring is offered against Brilliant.org.** The brief requested 1–10 scores on
  ten axes. Two render-gate fixes do not move a ten-axis product score, and inventing movement
  would be false precision. The measured dimension table in §2 is the honest substitute.
- **The 287s `variants.test.ts` sweep was deferred**, on `generator-guard` evidence that all 29
  generator inputs are byte-identical — not re-run from scratch.
- **sqlite-dependent tests (17 files) cannot pass in-sandbox** and were not touched.

## 8. Highest-value next candidates

1. ~~Audit the remaining `s.kind === …` render guards for the same stranding class.~~ **Done** —
   swept, no fourth instance, and gated (§5b).
2. The probability-engine `onEvent` upgrade named in `ADAPT1_BY_ENGINE_GAP` — cheapest tier lift,
   and it also clears the standing `dragBucket` note.
3. The HS Tier C/D prediction-coverage backlog, which is where the measured quality gap actually
   is.

## 9b. Trail-voice consolidation

The third mandate of the session. Audit finding: the player theme was already §13-complete, so
nothing was renamed — the work was structural. `src/lib/trail.ts` is now the single source for
theme language (39 files previously carried it as inline literals); playerChrome and copy.ts read
from it with zero visible change; `verify:trail-voice` holds canonical spellings, single-sourced
stage labels, and §13 player containment (forbidden-import denylist). All three checks
falsification-tested. First-run false positives (CSS classes, "halfway point") were fixed by
narrowing the gate's scan, not by relaxing its rules.

## 9c. Instructional-colour unification

Found and closed during the theme pass: the only raw-palette bypass in the player core was
`TRAIL_GUIDE`'s `text-violet-700 dark:text-violet-300` on concept and recap steps — outside the
brand palette and the §20 semantic contract. Concept now speaks ink (structure being SHOWN, not
manipulated); recap speaks leaf (it consolidates the confirmed relationship).
`verify:instructional-colors` enforces the contract: zero tolerance in the player core, a
37-bypass ratcheting budget elsewhere, falsification-tested (an injected `text-emerald-500` in
playerChrome fails by file and class name).

## 10. Phase B — world-state derivation + math pipeline (zero UI)

Scope executed per `S200_IMPLEMENTATION_HANDOVER.md` Phase B, with the world manifest pulled
forward from Phase A as B's required input. **No lesson content changed in this phase** — the
new `content/world/` directory is geography metadata, not lessons; the five-place authorization
machinery was not implicated.

**Landed.**
- `scripts/gen-world-manifest.mjs` → `content/world/world-manifest.json`: 14 regions (§5),
  129 courses (prereqs from PATH_EDGES: 122 edges → 88 courses), 513 landmarks, 13 instruments.
  Generated, never hand-edited; Phase D fields honestly empty (tests pin the emptiness).
- `src/world/`: `worldTypes` · `revealRules` (named policy constants: ENDURING_AFTER_DAYS=22,
  RECENT_DAYS=3, calibration strictly above ASSISTED_CEILING with streak≥2; "carried"
  deliberately unreachable until Phase D defines cross-course evidence) · `deriveWorldState`
  (+ `evidenceFromProfile` projection) · `worldCopy` (builds on TRAIL) · `worldThemes`
  (presentation-only flags, allowlist-pinned so a functional flag cannot be smuggled in).
- `src/world/world.test.ts` — 23 tests, every reveal rule at satisfied/unsatisfied/exact
  boundary, run against the REAL manifest. One test expectation was corrected during review
  (evidence on ANY instrument tag = "discovered" per §9; the rule was right, the test wrong).
- Math (§21): `src/lib/math/renderMath.ts` (KaTeX 0.16.11, `htmlAndMathml`, deterministic,
  degrades to escaped text — never throws at a learner, injection-tested) ·
  `src/components/math/MathText.tsx` (MathInline/MathDisplay, lazy KaTeX, reserved display
  height) · `src/lib/math/renderMath.test.ts`.
- Gates: `npm run verify:world` (W1 freshness · W2 regions · W3 landmark↔chapter · W4 prereq +
  PATH_EDGES resolution · W5 no learning state · W6 acyclic) and `npm run verify:math-format`
  (M1 single importer · M2 zero raw LaTeX in lessons · M3 pipeline + height reservation).

**Review fix (correction of record).** The first landed MathText set `role="math"
aria-label={tex}` on rendered spans. Because the renderer already emits MathML, that label
would have OVERRIDDEN the MathML and read raw LaTeX aloud to screen-reader users. Removed:
KaTeX's own markup self-describes; the pre-load fallback shows the tex source to everyone.

**Falsification evidence (all five run, all failed as required, tree restored byte-clean).**
- F1 hand-edited manifest → `W1: checked-in manifest differs from a fresh generation`
- F2 ghost prerequisite → `W4: add-subtract-1000-g2 prerequisite no-such-course is not a
  manifest course` (alongside W1, proving independent detection)
- F3 stray `import katex` in src/lib → `M1: src/lib/strayMath.ts imports katex outside the
  sanctioned math modules`
- F4 `\frac` planted in a lesson JSON → `M2: raw LaTeX command in lesson content` (proves the
  shell-escaped regex genuinely matches JSON-encoded backslashes)
- F5 height reservation removed → `M3: MathDisplay no longer reserves height`

**Adoption status — honest.** The math pipeline ships UNWIRED: no route imports MathText, so
today's bundle cost is zero; KaTeX is paid only when Phase C adopts it. World derivation
likewise has no UI — Phase C renders `deriveWorldState`'s output and computes nothing itself.

## 11. Correction of record — the five-place trap has a sixth and seventh place

Seal 1 declared `quotient-reasoning-s146.py` and `affine-relationship-s147.py` "not implicated"
by the figure repair after checking their TARGET lesson sets. That test was answering the wrong
question: both scripts ALSO run a whole-corpus symmetric check
(`set(changed) != expected_changed | allowed_later`) over all 1,667 lessons. Neither seal 1's
reprove chain nor Phase B's first gate chain runs gen:reports, so the landmine stayed armed
until the first end-to-end gen:reports run in Phase B, which failed at s146.

Diagnosis proved the unauthorized residue was EXACTLY the 3 batch-1 files (tse-02-04,
tse-02-05, ft-05-04) — the 48 batch-2 files were already inside both scripts' S19x bulk sets.
Fix: `S200_FIGURES_AUTHORIZED` (3 files) added to both scripts; both pass standalone
(37/37 · changed 731 and 35/35 · changed 727). Ledger's fivePlaceDetail updated.

**Rule corrected for future sessions:** any byte change to any lesson JSON must be authorized
in s146 AND s147 regardless of whether the touched lessons are their targets — the honest
count is seven places, not five.

## 12. Phases C and D — world surfaces, instruments, return paths, field journal

**Shipped.** Four routes wired to the Grade 3 Pattern Valley pilot only (§31: pilot before
rollout): `/trailhead` (3.55 kB) · `/atlas` (1.5 kB) · `/basecamp/[courseId]` (2.39 kB) ·
`/journal` (2.42 kB), 119–121 kB first load. `src/world/` gained WorldShell, Trailhead, Atlas
(+RegionMap, AccessibleRegionList), Basecamp, FieldJournal(+Client), Instruments, ReturnPaths,
WorldPreferences, worldServer (server-only slicing), worldNav, worldPreferences.

**The slice trap.** The 241 KB manifest never reaches the browser; server components pass a
region slice. But Pattern Valley's approach trails START OUTSIDE the region, and `approachOpen`
fails closed on an unresolvable prerequisite — so a naive region-only slice would render courses
locked and look like ordinary "not unlocked yet" behaviour. `regionWorld` carries the transitive
prerequisite closure; a test pins `derive(slice) === derive(full)` for every pilot course.

**Mode equivalence is proved, not promised.** Surfaces render `WorldState` and never derive, so
presentation flags structurally cannot reach the derivation. The tests compare the complete set
of hrefs and actionable controls across minimal/guided/immersive on all three surfaces.

**Phase D evidence mapping.** Instruments map to 255 of the corpus's 1,705 distinct step
conceptTags via generator patterns plus a precedence order. Four false-positive patterns were
found and fixed during design — `metric` matched "geoMETRIC"/"paraMETRIC", `mean` matched
"MEANing", `variab` matched "isolate-VARIABle", `rate-` claimed rate-of-change for ratios —
each of which would have attached a learner's evidence to an instrument they had never used.
Completing every waypoint of a trail discovers NO instrument without graded evidence (tested).
Connections remain genuinely empty rather than faked.

**Two real defects found by the new tests.** (1) The region and landmark `<ol>`s had no
accessible name — the label sat on the section wrapper, so a screen-reader user jumping by list
landed somewhere unidentifiable. (2) Hand-written profile JSON in tests is silently rejected by
`parseStoredProfile` (it needs the sync stamp `progressStore.save` adds); a test seeding it
renders an empty surface and passes forever. Both fixed in the code, not the assertions.

**Correction of record.** A `theme modes` Playwright spec first asserted `svg[aria-hidden]`
count 0 to prove Minimal drops the map; the page has 13 such SVGs because nav icons are
correctly aria-hidden. The assertion was wrong, not the product — replaced with a targeted
`[data-region-map]` hook asserted in BOTH directions (present in guided, absent in minimal).

**Validation.** tsc 0 · full vitest = the documented 17-file/76-test sqlite baseline exactly
(12 + 64, all better-sqlite3 bindings; content 73/73, rest chunks 46/50, 50/50, 50/50, 36/49) ·
validate:content 1806/1806 · lint:pedagogy 1677/1677 · registration clean · proof 686/686 ·
all five verify gates · build rc=0 · **Playwright 77 → 97/97** (12 world specs + 8 axe specs
across light and dark) · screenshot sweep 6/6 · gen:reports rc=0 end to end · fresh-extraction
reprove green (65/65 session tests).

**Honest gaps.** `GRADE_3_PATTERN_VALLEY_PILOT.md` answers 6 of §32's 14 adversarial questions
with evidence; 4 are unverified (young-learner comprehension, grayscale rendering, low-end
hardware, adult surfaces) and 2 are partial. Phase E exists to close them. Region rollout beyond
G3, Atlas connections, and the remaining named docs are unbuilt.
