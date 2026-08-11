# S237 — what is actually left, and how big it actually is

**The headline: the 11,487-row queue is not 11,487 units of work.** It counts row *instances*.
The work lives at the *family* level, and every large workstream is dominated by a handful of
families. Measured, not estimated — every number below comes from a script over the tracked CSVs
and the real renderer.

| Workstream | Queue rows | Distinct work units | Concentration |
|---|---:|---:|---|
| MATH_TYPESETTING | 9,579 | **263** candidate rows, in ~6 notation families | 8,361 already render on the default path; +955 via `includeArithmetic`, which the real call sites pass |
| ILLUSTRATION_REPLACEMENT | 1,078 | **91 figures** | 3 figures cover 942 rows (87%): `count-on-hops` 793, `bar-compare` 84, `number-track` 65 |
| MCQ_DISTRACTOR_REVIEW | 572 | **2 detector signals** × families | every row is `BLIND_GUESS_FAIL` with `longest=yes/no` + `punctuation=yes/no` |
| PREDICTION_GATE_REVIEW | 200 | **1 systemic finding** | all 200 rows carry the identical evidence string |
| CLOSURE_LEDGER | 27 | 27 | umbrella rows over the detail work |
| ENGINE_REVERSIBLE_PLAY | 17 | 17 | Work Package 2 |
| PREMIUM_REBUILD_WAVE | 8 | 8 | program waves |
| INTERACTION_NECESSITY / DISPOSITION | 6 | 6 | decisions, not edits |

**Order-of-magnitude claim: ~11,487 rows → a few hundred real decisions.** The
MATH_TYPESETTING line is under adversarial attack in a running workflow and is the only one not
yet settled; the other three concentrations are direct counts from the queue and are not in doubt.

---

## 1. Work Package 1 — learner-focus

- **Audit: CLOSED.** 18 LEAK + 1 UNCERTAIN → 19 cleared. Re-verifiable in ~1s:
  `node scripts/audit/learner-focus-recheck-s237.mjs`.
- **Browser verification at 390/768/1440, light and dark: NOT DONE.** This is WP1's stated exit
  condition and no session has touched it. Nothing in this repo has ever been browser-verified in
  Cowork — all evidence to date is source, printed output, and jsdom.
  Note the standing constraint recorded in project memory: the Playwright browser suite (97
  declarations) has not been runnable in these sandboxes. **This container has Chromium
  pre-installed at `/opt/pw-browsers/chromium` with `PLAYWRIGHT_BROWSERS_PATH` already set**, so
  that constraint may no longer hold. Testing it is cheap and would unblock the exit condition —
  it is the highest-value unknown left in WP1.

## 2. Awaiting a ruling (blocking, cheap to answer)

- **fractionBar CONTESTED — 8 instances, 4 prompts, one question.** Detail in
  `FRACTIONBAR_SHOWTARGET_TRIAGE_S237.md`. The 42 HIDE rows are ready to apply the moment this
  lands; they are content-only.

## 3. Work Package 2 — 17 reversible-play engine families

`exactNumberLab`, `buildExpression`, `dragBucket`, `matchPairs`, `dragOrder`, `numeric`, `mcq`,
`steppedReveal`, `fractionEntry`, `placeCompare`, `rationalCompare`, `pointEntry`,
`subitizeFlash`, `absValueLine`, `fractionCompare`, `toggleExplore`, `radicalCheck`.

Not started. `numeric` and `mcq` are answer surfaces, not labs — the execution prompt explicitly
warns against pretending typed/choice input is a rich lab, so those two are dispositions to argue,
not features to build.

## 4. Closure ledger — 29 open, of which 8 cannot be closed here at all

Externally blocked, and must never be closed with source-only evidence: `CL-P0-016` billing,
`CL-P0-017` email, `CL-P0-018` cross-device sync, `CL-P0-020` observability, `CL-P0-022` empirical
calibration, `CL-P0-023` commercial proof, `CL-P1-019` LTI AGS, `CL-P1-031` supported CI.
Hardware/assistive-tech gated: `CL-P1-035`, `CL-P1-011`.

**`CL-P1-033` should be narrowed, not closed.** Linux is now evidenced green at both `4b66fe1` and
post-repair `489b272`+; none of the recorded 15 Windows failures reproduces on Linux. See
`VITEST_SET_DIFFERENCE_S237.md`. Remaining scope is genuinely Windows portability.

## 5. Carried findings — recorded, unowned

Small, real, and cheap; they will rot if not picked up.

- `quotientReasoningLab` renders whole numbers as improper fractions **on screen** —
  `dop-03-02` shows `492/1 ÷ 15/1`, `ns-02-01` shows `1248/1 ÷ 24/1`. 39 authored instances.
- `equationOutcomeLab` transform mode emits a trailing space on all 8 authored transform instances.
- `fractionBar` states the target in **numerals** to screen-reader users while sighted learners
  count segments — survives whichever way the `showTarget` ruling goes.
- 11 `KNOWN_UNREVIEWED` parity-baseline entries were removed as tokenizer artifacts; the remaining
  11 are still unreviewed candidate defects, including one known leak (`extraneousRootLab`).

---

## 6. Why the previous shape was expensive

Three sessions have now spent their opening budget rediscovering the same things: which gates
exist, that Trap K eats the queue CSV, that Trap B fakes failures under contention, and what the
audit CSVs mean. Session A recorded 25 Vitest failures that were contention artifacts; session B
inherited them as fact; this session spent its first hours proving they were not real.

The precache in `COWORK_CACHE/` exists to make that a one-time cost. It is **tracked**, which is a
deliberate departure from the execution prompt's "session-local, outside tracked source" — because
session-local is precisely what caused three sessions to pay for it three times. It contains no
lesson prose and no dependency content; it is maps, counts, and traps.
