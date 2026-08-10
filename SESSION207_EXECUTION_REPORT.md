# SESSION 207 EXECUTION REPORT — The last three static answer surfaces join the tone grammar; the C-class arrangement adjudication closes with zero lifts

Mandate: `S206_ENGINE_EXCELLENCE_PROMPT.md`, continued per `HANDOVER_S206.md` §4 priority order.
This session completed **P0 remainder items 1 and 2** of that order and deliberately did **not**
start item 3 (MMIP foundations) — see §6.

## 1. Executive assessment

S206 left the tone grammar (retry cue on the learner's own object, reveal ghost suppressed on
match, no answer leaked at retry, accessible names pinned) covering `mcq`, `numeric`,
`fractionEntry`, and gave `solveBalance` the bidirectional Spotlight. **Three static answer
surfaces remained outside the grammar: `pointEntry`, `radicalCheck`, `subitizeFlash`.** All three
now follow it, with a 16-test suite whose expected values are derived independently of the
implementation (the radicalCheck fixture's phantom root −2 is verified by hand arithmetic in the
test header, not read from the widget).

The second P0 remainder — the eleven-engine C-class lift assessment per the S205M rubric —
**closes with zero rating changes.** Per-engine evidence in §3. This is the outcome the rubric
itself anticipated: "where a model doesn't respond, leave the rating alone — that may be the
correct final state." Every engine examined either (a) is a pinned arrangement engine with no
model added since S205M, (b) is a selection engine over a static model whose illumination is
already captured in `err`/`conseq`, or (c) already carries the correct mode-aware treatment
(exactNumberLab, S205K).

One genuine defect was found and fixed during review: the new subitizeFlash reveal decorations
reused `data-testid="sf-ghost"` — **already pinned to SlopeFieldW** by `widgets.tone.test.tsx`
and `widgets.revealGhost.s102.test.tsx`. Both widgets render on the `/dev/widgets` gallery page,
so any tree-level `getByTestId("sf-ghost")` was ambiguous. A registry sweep confirmed every other
duplicated ghost testid lives inside a *single* widget's conditional branches; this was the only
cross-widget collision. Fixed by renaming the **new** ids (`szf-ghost`, `szf-yours`), never the
pinned ones.

## 2. Changes

### 2a. pointEntry joins the tone grammar (`widgets.tsx` PointEntryW)
- **Problem:** retry left the tuple fields and the live mini-grid unchanged; reveal existed only
  as dock text.
- **Solution:** `tone="error"` paints the berry cue on the learner's own fields *and* on the
  mini-grid dot/vector they draw (they are one answer object); `tone="info"` renders a
  dashed-tangerine GhostChip stating the correct tuple in the authored delimiter form, suppressed
  when the learner's tuple already matches. Slot accessible names (`first value`, `second value`,
  authored `slotLabels`) pinned. No tone: byte-identical classic rendering.
- **No answer leak at retry:** pinned by a body-text probe (`\u22124` absent) in the test.

### 2b. radicalCheck joins the tone grammar (`widgets.tsx` RadicalCheckW)
- Retry moves the berry accent onto the candidate slider (the learner's object) with no ghost;
  reveal states `x = target` in the GhostChip, suppressed when the candidate already sits on the
  genuine solution. Slider accessible name pinned.

### 2c. subitizeFlash joins the tone grammar (`widgets.tsx` SubitizeFlashW)
- Retry anchors the berry cue on the chosen count option and leaks nothing (the true count's
  option receives no tangerine at retry — probed). Reveal follows the mcq option-surface pattern:
  dashed-tangerine ghost on the true count, berry "yours" contrast on a differing pick, ghost
  only (no contrast) when the pick was right — **and the dot pattern is finally held visible**
  (`role="img"` name `"5 dots"`), because a revealed subitizing task must let the learner count.
- Option accessible names pinned to the numeral labels.

### 2d. Cross-widget testid collision repair (`widgets.tsx`, s207 test file)
- subitizeFlash's reveal testids renamed `sf-*` → `szf-*`. SlopeFieldW's pinned `sf-ghost`
  untouched; `widgets.tone.test.tsx` and `widgets.revealGhost.s102.test.tsx` re-run green.
  The `errorTeach=3 ⇒ ghost testid` source scan still matches (`szf-ghost` satisfies
  `[a-z]+-ghost`).

### 2e. Ratings deliberately not edited
`pointEntry`/`radicalCheck`/`subitizeFlash` stay at their current rows (err 1, conseq 1) exactly
as `mcq`/`numeric`/`fractionEntry` did after S206 — S205M discipline: a rating change requires
evidence through the rubric's own gates, and tone decoration is presentation, not a new err-teach
mechanism (the ghost grammar at err=3 means *model-level* error teaching, which these static
surfaces still do not have).

## 3. The C-class adjudication — eleven engines, zero lifts, per-engine evidence

Rubric (S205M, pinned in `engineCapabilities.test.ts`): **manip ≥ 2 requires a mathematical MODEL
responding to the learner's action** — a beam that tips, a curve that redraws, a candidate sliding
against derived landmarks. A better placement gesture is still placement. Lifting any engine whose
interaction class matches a 1-rated engine makes the table stop meaning anything.

| engine | interaction class | does a model respond? | verdict |
|---|---|---|---|
| `dragBucket` | drag/place into buckets | No. The `db-live` panel restates the arrangement (membership + count); nothing is computed *from* it beyond tallying. The decisive S205M case — pinned ≤ 1. | stays 1 |
| `dragOrder` | reorder tokens | No model; sequence is the answer itself. Pinned ≤ 1. | stays 1 |
| `matchPairs` | link left↔right | No model; links are the answer. Pinned ≤ 1. | stays 1 |
| `buildExpression` | token sequence | The `reads:` readout parses and evaluates the build — genuine live consequence, already captured at conseq 2; but the tokens are placed, not manipulated against a responding model. The S205M refusal object itself — pinned ≤ 1. | stays 1 |
| `absValueLine` | pick one of N marked operands | The number-line brackets are drawn from fixed spec values; selection changes only highlight color. No arrangement exists. | stays 1 |
| `placeCompare` | slot <,=,> between fixed numbers | The digit-cell/base-ten model illuminates the deciding place at error/success — that is `err` doing its job (err = 3), not manipulation. | stays 1 |
| `rationalCompare` | slot <,=,> | Same class; and the widget's own header records the *deliberate refusal* of a proportional model (sized bars would print the answer and delete the graded reasoning — the ssg2-03-03 keep principle). The static model is a design decision, not a gap. | stays 1 |
| `fractionCompare` | pick left/right/equal between two bars | Bars are proportional renders of fixed spec fractions; the pick changes selection chrome only. | stays 1 |
| `toggleExplore` | flip boolean toggles | **The closest call.** `evalRule` recomputes the lamp on every toggle — a computed consequence, correctly captured at conseq 2. But toggling is discrete choice-making; rating it manip 2 while dragBucket's full drag-and-place stays 1 recreates exactly the incoherence S205M refused. If a future session adds a circuit model (wire highlighting, gate-by-gate propagation the learner can trace), that is the evidence path. | stays 1 |
| `steppedReveal` | tap to reveal panels | Progressive disclosure; no arrangement, no model. conseq 1 / manip 1 is its designed ceiling. | stays 1 |
| `exactNumberLab` | mode-dependent | Already adjudicated mode-aware in S205K (`manipByAnswerMode`: numeric 2 via the magnitude rail, verified by 33 tests; choice/relation/explore 1). Floor invariant (type-level 1) intact and pinned. | stays as-is |

**Consequence:** the C-class row of the census is at its correct final state under the current
implementations. The honest routes to future lifts are *feature* routes (a responding model), not
rating edits — toggleExplore's circuit-trace idea above is the most concrete candidate.

## 4. Tests added or updated

- **New:** `src/components/widgets.answerSurface.tone.s207.test.tsx` — 16 tests across the three
  engines: no-tone byte-classic probes, retry-cue-on-own-object probes, answer-leak probes,
  reveal-ghost content probes, ghost-suppression-on-match probes, accessible-name pins.
  Expected values derived independently (radicalCheck's √(x+6)=x: genuine root 3, phantom −2 by
  hand verification in the header).
- **Updated:** same file, testids `sf-*` → `szf-*` (collision repair, §2d).
- No existing test weakened; no timeout raised; no assertion loosened.

## 5. Validation results

(Recorded at seal time — see the tail of this file.)

## 6. What this session did NOT do — the honest gap

- **MMIP foundations (P0 item 3) not started.** solveBalance bidirectional editing (drag a tile
  count / edit `st.leftX` / type into the equation, all representations updating together) is the
  next flagship step and remains the highest-leverage untouched item, along with the
  Representation Synchronization Graph on the line/function lab. Starting a platform layer with
  the gate chain pending would have left an unsealed half-feature — against session protocol.
- **HS rich mix untouched at 23.7%** (62 insertions to 25%; `lf-02-01/i3` still the carried
  candidate).
- The eight engine gaps carried from S205 remain open.
- S201 world-parity pass (forced-colors, CPU-throttled perf specs) remains queued.
- The legacy `package-session*.mjs` scripts remain unfit for polish sessions (S206 §3); this
  session packaged by hand with the same exclusion set and manifest reprove.

## 7. Full validation summary (all gates, seal pass)

One correction to §4 above: the new test file's authoritative count, re-run at seal time, is
**15 tests** (not 16 — a miscount in the earlier draft; corrected here rather than carried
forward silently).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| New file `widgets.answerSurface.tone.s207.test.tsx` | 15/15 passed |
| `npm run validate:content` | exit 0, 1,840/1,840 files clean |
| `npm run lint:pedagogy` | exit 0, 1,711/1,711 files clean |
| `npm run check:registration` | exit 0 |
| `npm run check:engine-registration` | exit 0, 126/126 core-complete |
| `npm run build` | exit 0, 57/57 static pages |
| `next start` on `127.0.0.1:3100` + `curl` | 200 |
| `npx playwright test` (reused the 3100 server) | 115/115, exit 0, 4.1m |
| `npm run hash:proof` | exit 0, 1,701/1,701 lessons byte-identical; S151C proof 807/686 |
| Full vitest, batched by directory | 281 files / 11,928 tests passed, 0 failures |
| — `src/lib` minus the two documented slow files | 189 files / 6,747 tests |
| — `src/components` + `src/server` + `src/app/api` + `src/world` | 90 files / 1,191 tests |
| — `variants.test.ts`, solo (Trap B) | 3,988/3,988, 209s |
| — `content.widgets.audit.test.ts`, solo, `--testTimeout=120000` (Trap B) | 2/2, 20s |
| Fresh-extraction reprove | see HANDOVER_S207.md |

**No authored lesson content was changed.**

**Environment note for future sessions (Trap C):** a single monolithic `npx vitest run
--maxWorkers=2` launched via `setsid` in the background died silently partway through this
session, with no error in its log — the log's last write predated the process's disappearance
by tens of minutes, and no other command (no `pkill`, no `hash:proof`) was implicated. This
sandbox appears to fork/restore the underlying VM between some tool calls (`dmesg` shows `random:
crng reseeded due to virtual machine fork` at points matching the gaps), which is fatal to a
long-running unattended background job even under `setsid`. The fix: don't run the full suite as
one long background call. Split it into 2–3 directory-scoped foreground `vitest run` calls with
`--reporter=dot` (each comfortably under the tool's own per-call wall-clock ceiling), then run the
two documented slow files (`variants.test.ts`, `content.widgets.audit.test.ts`) solo per the
existing Trap B guidance. This completed the full ~11,900-test suite in four foreground calls
totalling under 8 minutes, with no lost work and no retries.
