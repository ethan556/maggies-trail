# S320 — CHOICE_SURFACE_INTEGRITY trace, staleness test, and legitimate closure

Bounded audit-infrastructure packet. Scope: trace where `CHOICE_SURFACE_INTEGRITY` rows in
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` come from (447 open: 281 authored-course + 166
generator-sourced), stale-test a sample against current source, close the lane through the input
artifact's own legitimate mechanism, and rerun `npm run audit:pending-workload` exactly once.
`scripts/audit/consolidate-pending-workload-s236.mjs` was read but never edited. No generated CSV
was hand-edited — the one generated artifact this lane depends on
(`reports/mcq/MCQ_LEAKAGE_INDEX.csv`) was regenerated only through its own documented `--write`
flag.

## 1. Trace — exactly one input artifact, fully enumerated

Read `scripts/audit/consolidate-pending-workload-s236.mjs` in full (533 lines) and enumerated
**every** `readObjects(...)` call in the file (8 total: `VIS01_PLACEMENTS.csv`, 9 `MATH_*_INDEX.csv`
files as one loop, `MCQ_LEAKAGE_INDEX.csv`, `PREDICTION_GATE_ADJUDICATION.csv`,
`PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv`, `PREMIUM_INTERACTION_PRIORITY.csv`,
`EXCELLENCE_BACKLOG_S126.csv`) and grepped the whole file for `CHOICE_SURFACE_INTEGRITY` (exactly
one hit). Result: **`CHOICE_SURFACE_INTEGRITY` rows come from exactly one input,
`reports/mcq/MCQ_LEAKAGE_INDEX.csv`, and nothing else** (lines 167–195). There is no second
producer, no `PREMIUM_*` CSV involved, and no per-row status/disposition filter — every
`(source, owner, unit, path)` group in the CSV becomes a queue row unconditionally, the same
"every row becomes a queue row" pattern S319 found for `EXCELLENCE_BACKLOG_S126.csv`. Rows are
grouped by `[source, owner, unit, path]`, tells joined with `" | "`; `work_id` is `CHOICE-####`.

`MCQ_DISTRACTOR_AUDIT.csv` (repo root, 3,293 rows, task's other guess) **is not read by the
consolidator at all** — confirmed by the full enumeration above. It is the same kind of superseded
pre-adjudication baseline as `PREDICTION_GATE_AUDIT.csv` (composite `blind_guess_test` verdict, no
named cause); `MCQ_LEAKAGE_ADJUDICATION.md`'s own §"Why the queue was rebuilt rather than worked"
says so explicitly. `MCQ_LEAKAGE_ADJUDICATION.md` itself is also not a consolidator input — it is
S242 narrative/methodology prose (findings-by-cause table, three worked-and-discarded detector
post-mortems, one demonstrated repair family), not a per-row ledger — so appending to it would have
**zero** effect on the queue; it was read only, not touched.

**Is the input generated or hand-maintained?** Generated, unconditionally, with no gate:

- Generator: `scripts/audit/mcq-leakage.mts` (read in full, 247 lines). No npm script wraps it
  (`grep -n "mcq" package.json` → 0 hits); its own header states the exact invocation: `npx tsx
  scripts/audit/mcq-leakage.mts [--write]`.
- Mechanism: walks every `content/courses/**/*.json` lesson for `widget.type === "mcq"` steps
  (**authored** items, `owner` = lesson id, `unit` = step id, real `path`); separately calls every
  `VARIANT_GENERATORS` entry (`src/lib/variants.ts`) on every declared `form`, at exactly 3 fixed
  seeds each (`hashSeed(\`${tag}|${form}|core|${i}\`)`, `i = 0,1,2`, band always `"core"`)
  (**generated** items, `owner` = generator tag, `unit` = form, `path` = `""`). Each item is scored
  against 5 independent, regex-only "tell" heuristics (`length-prose-vs-prose`,
  `length-answer-explains-itself`, `lone-justification`, `absolutes-in-distractors-only`,
  `only-answer-completes-stem`, `only-numeric-option`, `only-option-with-a-unit` — 7 codes, 5
  currently firing in this data) and one row is written per `(item, tell)`.
- **Unlike `EXCELLENCE_BACKLOG_S126.csv`, there is no policy/adjudication file gating this
  generator and no failure mode.** Full read confirms zero `throw`, zero policy-file dependency,
  zero `unresolvedPolicy`/`stalePolicy` analog — it unconditionally measures and writes. This makes
  the CHOICE lane strictly *simpler* to legitimately close than the QD/EXCELLENCE lane was.
- Verified the 447/281/166 split exactly, independent of the consolidator, by parsing the CSV and
  reproducing its exact grouping key: **447 grouped items = 281 authored + 166 generated**, matching
  the task's stated baseline precisely.

## 2. Staleness test — 61-row stratified sample, later proven 100% predictive of the full regeneration

**Method.** For every sampled row, current source was re-scored using `leaks()` copied **verbatim**
from `scripts/audit/mcq-leakage.mts` (same regexes, same thresholds — no reimplementation risk),
against: (a) the live lesson JSON at the row's `path`/`stepId`, for authored rows; (b) the generator
replayed at `mcq-leakage.mts`'s own exact seed formula (`tag|form|core|i`, `i=0..2`), for generated
rows. Sample = 41 authored (29 from the 12 courses named by S298–S315-family choice-parity/choice-repair
sessions + 12 "control" rows from courses with no such named session) + 20 generated (top-4 tags by
row count, tied at 3rd: `g10-triangle-congruence`=10, `g13-curve-analysis`=10, `g10-similarity`=9,
`g10-solid-geometry`=9, plus 10 more scattered tags) = **61 rows, exceeding the ≥25 floor**.

**Result:**

| Class | Sampled | Stale (repaired) | Still live | Stale fraction |
|---|---:|---:|---:|---:|
| Authored | 41 | 37 | 4 | **90.2%** |
| Generated | 20 | 0 | 20 | **0%** |
| Combined sample | 61 | 37 | 24 | 60.7% |

**Smoking-gun example (`rf-01-01`, `rational-functions`, cited session `S304_RATIONAL_FUNCTIONS_
CHOICE_PARITY.md` + `scripts/session/s304-rational-functions-choice-repair.mjs`).** The CSV's
`correct` field for step `i2` reads `"f(6) = 0 — a perfectly legal output"` (37 chars, vs. bare
distractors like `"f(6) = 6"`) — a textbook `length-answer-explains-itself` leak. Direct read of the
**current** `content/courses/rational-functions/lessons/rf-01-01.json` shows option `o1` is now
`"f(6) = 0; the denominator is nonzero there."` and every distractor (`o2`–`o4`) now also carries its
own `"because..."` clause of comparable length — byte-identical to the `after` value hard-coded in
`s304-rational-functions-choice-repair.mjs`'s own `choices[]` table. All 8 of S304's `CHOICE-0216`…
`CHOICE-0223` rows (`rf-01-01`×2, `rf-01-02`, `rf-04-01`, `rf-04-02`×2, `rf-04-03`, `rf-05-01`) came
back stale by direct source comparison. The same exact-count match (named session's `workId`/`choices`
array length == that course's current CSV row count) held for all 12 named courses checked:
`solving-equations`(1), `integration-accumulation`(11), `trig-graphs-inverses`(8),
`constructions-and-proof`(9), `rational-functions`(8), `differential-equations`(9),
`derivative-rules`(7), `polynomial-rational-analysis`(6), `trig-identities-equations`(5),
`radical-functions`(4), `function-transformations`(2), `polar-parametric`(4).

**Why generated is 0% stale, not a sampling artifact.** `git log --oneline -- src/lib/variants.ts`
returns exactly **one** commit across all 7 reachable commits (`c5af1f1`…`ae399cc`) — the graft-point
commit itself. **No commit has ever touched the generator source since.** The file that produces
every one of the 166 generated items has been byte-stable for the entire visible history, so no
generated row can have been repaired; the 0/20 sample result is not luck, it is structurally certain
for all 166.

**Root cause of the staleness.** `MCQ_LEAKAGE_INDEX.csv`'s own header records `sourceSeal=3793c45+
inputs...`; `MCQ_LEAKAGE_ADJUDICATION.md` records `Seal: 9d23243`. `git cat-file -e 3793c45` and
`git cat-file -e 9d23243` both **fail — neither hash is a valid object in this repository.** Both
predate the graft point (`c5af1f1`, "Advance mastery and content integrity") entirely. The CSV was
never regenerated across any of the 7 large commits now reachable (each representing a squashed wave
of prior-session work), which is exactly why a dozen dated, in-repo `choice-parity`/`choice-repair`
session reports (S298–S315) plus broader S316–S319 lesson-disposition implementation work already
repaired the great majority of what it still lists.

**Validation — the sample predicted the full regeneration exactly.** After regenerating (§3), all 61
sampled rows were re-checked against the new CSV: **all 37 predicted-stale rows are gone; all 4
predicted-still-live rows remain; the generated set is byte-identical, 0 dropped / 0 added out of
166.** 61/61 exact match.

**Sample vs. population, stated honestly.** The sample was stratified/purposive (deliberately
oversampling the 12 named-repair courses to test the hypothesis directly), so its 90.2% authored
figure is not a random-sample estimate. The exhaustive regeneration (§3) is the authoritative
population figure: **195/281 authored rows (69.4%) actually dropped**, lower than the sample's 90.2%
because the sample under-weighted the long tail of small, previously-unnamed courses that turned out
only partly repaired (e.g. `shapes-build-k`, 9/9 rows still open — see §3).

Four still-live authored rows from the sample, kept open, with why: `ft-03-03/i1`
(`function-transformations`) and `fna-01-03/k3` (`function-analysis`) both fail
`only-option-with-a-unit`, a tell class the length-focused S312 repair never targeted; `lc-01-03/k1`
(`limits-continuity`) has no matching named session at all; `kgb-01-01/k2` (`shapes-build-k`) has a
same-course sibling script, `s302-shapes-build-k-choice-order-repair.mjs`, but that fixes choice
**order** (shuffle/position), a different defect family from the length/explanation-density leak
still present here.

## 3. Closure — regenerated the generator's own output; no policy file to satisfy, nothing hand-edited

Ran `npx tsx scripts/audit/mcq-leakage.mts --write` (final invocation; see concurrency note below for
why it was invoked more than once during verification). No `unresolvedPolicy`-style gate exists in
this script (confirmed by the full read in §1), so — unlike the EXCELLENCE lane — there was no fail
mode to navigate and no judgment-bearing entry to write by hand; the legitimate closure mechanism is
simply letting the generator re-measure current source, exactly as its own `--write` flag is for.

**Result: 447 → 252 grouped items.**

| | Before | After | Δ | Δ% |
|---|---:|---:|---:|---:|
| Authored | 281 | 86 | **−195** | −69.4% |
| Generated | 166 | 166 | **0** | 0% |
| **Total** | **447** | **252** | **−195** | −43.6% |

Cross-checked directly against the regenerated CSV (independent of the consolidator, same grouping
key): 86 authored + 166 generated = 252, matches exactly. Remaining authored rows are concentrated in
courses with **no** matching named length/explanation-parity repair: `shapes-build-k`(9),
`function-analysis`(7), `polygons-quadrilaterals`(6), `vectors-matrices`(6), `compose-shapes-g1`(5),
plus a long tail of 1–3-row courses; remaining tell mix is 64 `length-prose-vs-prose` / 13
`length-answer-explains-itself` / 6 `only-option-with-a-unit` / 5 `lone-justification`.

**Concurrency note (honesty, not a defect in this result).** While this packet ran, unrelated edits
landed on `content/courses/place-value-1000/*`, `content/courses/volume-measurement/vm-04-01.json`,
`content/courses/mult-div-fluency-g4/lessons/g4m-02-05.json`, `src/components/figureIds.ts`, and
`src/components/figures.tsx` — files this packet never opened with Read/Edit/Write. An untracked
scratch file also appeared mid-session, `scripts/audit/_tmp_probe_s320_item2_scan.mjs`, whose own
header names a *different* concurrent lane ("S320 item 2", a duplication scan on
`mult-div-fluency-g4`) — left untouched, not mine to delete. This is consistent with other bounded
workers operating on the same shared tree concurrently (the concurrent-cohort execution model
`reports/planning/S247_BACKLOG_EXECUTION_OPTIMIZATION.md` itself describes), and it is why
`mcq-leakage.mts`'s own `inputHash` provenance string changed between my invocations even though none
of *my* actions touched `content/courses` or `src/lib`. It did not affect the CHOICE result: the
**measured aggregate (252 items; 203/45/6/5 by tell code) was byte-identical across all 4 of my
invocations** (2 measurement-only, 2 `--write`), and the final `--write` immediately preceded the one
permitted `audit:pending-workload` run, so the two numbers in this report are mutually consistent at
that instant. Later drift from other concurrent lanes is expected and is exactly what the next
regeneration is for.

## 4. The 166 generator-sourced rows — the S247-described broader evidence path does not exist as code

Searched `scripts/` for "a script that replays generator seeds and audits choice parity" per the
task's S247 pointer. Traced the exact phrase to its source: `reports/planning/
S247_BACKLOG_EXECUTION_OPTIMIZATION.md` line 82 — *"Generators: 166 generated rows compile into 14
parent domains, 57 required exact-tag contracts and 57 tag-bounded microbatches. Reuse domain
context, but run the **prompt-only oracle, deterministic replay and verdict independently per tag**."*
That sentence, and the near-identical `qa:` guidance string for the `GENERATOR_DOMAIN_PORTFOLIO`
class (*"Per-tag prompt-only oracle and deterministic replay; domain-wide boundary/adversarial,
duplicate/collision/parity sweeps; independent verdict with no cross-tag inference."*), exist in
**exactly one place**: hard-coded string literals inside `scripts/audit/
compile-v4-backlog-portfolios-s247.mjs` (line 244, the `classGuidance` object) — planning/guidance
**prose** the S247 portfolio compiler writes into its own report, not a call to any function or
script. `grep -rn "oracle\|deterministic replay" scripts/` found no second occurrence anywhere.

**Ruled out as substitutes, by reading each:**
- `scripts/audit/generator-quality-sweep.mts` (S242/GEN-01+02) *does* do a much deeper deterministic
  replay (500/100 samples per generator per its inventory tier, all bands, not just 3 at band
  `"core"`) and *does* write `GENERATOR_DISTRACTOR_AUDIT.csv` via `auditDistractors()` — but that
  function checks only **structural** MCQ validity (`mcq-correct-count`, `duplicate-option-label`,
  `mcq-too-few-options`, `distractor-without-diagnosis`, `answer-not-an-option`), none of the 5
  length/qualifier/absolute/grammar/form "tells" that define `CHOICE_SURFACE_INTEGRITY`. Not a match.
- `scripts/audit/fishing-oracle.mts` (S242/ENG-01 R3) is a genuine "oracle" (an attacker model that
  enumerates widget states from feedback alone) — but it audits **reversible-play information
  leakage on graded numeric/interactive engines**, unrelated to MCQ choice surfaces. Not a match.
- `scripts/audit/distractor-contract.mts` (S242/GEN-03) audits distractor **feedback language**
  (banned phrasings, cross-generator boilerplate), not option/answer choice parity. Not a match.

**What already exists and is a real (if narrower) seed-replay + choice-parity mechanism:**
`mcq-leakage.mts` itself — 3 seeds per `(tag, form)`, 5 tells, exactly the tool run for closure in
§3. Its own adjudication doc (`MCQ_LEAKAGE_ADJUDICATION.md`) states its own limit: *"Generated items
are sampled at three seeds per form, not exhausted. A tell that only appears at an unusual draw is
not in this file."* Its single full-corpus run already covers **all 166** generator-sourced rows,
including the top tags by row count (`g10-triangle-congruence`=10, `g13-curve-analysis`=10,
`g10-similarity`=9, `g10-solid-geometry`=9, tied for 3rd) — so a separate constrained "top-3-tags-only"
run would have been strictly less thorough than the full run already performed in §3, and was not run
again separately.

**What's genuinely missing (documented per the task's "design nothing" instruction — not built):** a
deeper per-generator-tag replay that (a) samples materially more than 3 draws per form — e.g. reusing
`generator-quality-sweep.mts`'s existing 500/100-tier volume — scored against the same 5 tells (or a
richer prompt-only-oracle judge, closer to `fishing-oracle.mts`'s attacker-model style than to a
regex heuristic), and (b) emits a genuine per-tag PASS/FAIL verdict artifact distinct from the flat
per-item CSV, so one `GENERATOR_DOMAIN_PORTFOLIO` (of the 14 domains / 57 exact tags S247 defines)
could close independently of its siblings ("no cross-tag inference"). No script under `scripts/audit/`
does this today. I did not build it — that would be inventing a new evidence mechanism outside this
packet's authorization. Since the measured generator side did not move (0/166 dropped, confirmed
byte-identical set in §3) and no deeper tool exists to run, **all 166 generator-sourced rows remain
open after this packet, correctly and for a documented reason** — not from an oversight.

## 5. Consolidator rerun (once) — verbatim output

```
> audit:pending-workload
> node scripts/audit/consolidate-pending-workload-s236.mjs

{
  "total": 2911,
  "byWorkstream": {
    "CLOSURE_LEDGER": 27,
    "LESSON_REVISION_IMPLEMENTATION": 12,
    "V4_PROGRAMME_PHASE": 7,
    "QUESTION_DIVERSITY_AND_TRANSFER": 10,
    "CHOICE_SURFACE_INTEGRITY": 252,
    "STANDARDS_VERIFICATION": 2,
    "LESSON_PROGRESSION_AND_DUPLICATION": 225,
    "VISUAL_FIRST_REPRESENTATION": 792,
    "GRADE_LANGUAGE_REVIEW": 792,
    "LESSON_COMPLETE_DISPOSITION": 792
  }
}
```

**`CHOICE_SURFACE_INTEGRITY` delta: 447 → 252 (−195, −43.6%).** This is the only workstream this
packet acted on. Every other workstream's count differs from the last-known S319 baseline
(`QUESTION_DIVERSITY_AND_TRANSFER` 15→10, `VISUAL_FIRST_REPRESENTATION`/`GRADE_LANGUAGE_REVIEW`/
`LESSON_COMPLETE_DISPOSITION` 1163→792, `LESSON_PROGRESSION_AND_DUPLICATION` 228→225,
`LESSON_REVISION_IMPLEMENTATION` 10→12) — these deltas are from the concurrent work described in §3's
concurrency note (the S319 mass-assessment wave and/or other bounded workers active in the same tree
right now), **not from any writer this packet ran.** Only `npm run audit:pending-workload` was
executed, exactly once, per the task's instruction; no other writer script ran.

## Files touched (2, both regenerated through their own mechanism, none hand-edited)

- `reports/mcq/MCQ_LEAKAGE_INDEX.csv` — regenerated via its own `--write` flag
  (`npx tsx scripts/audit/mcq-leakage.mts --write`).
- `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` / `PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md` — regenerated by
  the single permitted `npm run audit:pending-workload` run.

## Files explicitly not touched

- `scripts/audit/consolidate-pending-workload-s236.mjs` — read only, per instruction.
- `scripts/audit/mcq-leakage.mts`, `generator-quality-sweep.mts`, `distractor-contract.mts`,
  `fishing-oracle.mts`, `compile-v4-backlog-portfolios-s247.mjs` — read/executed via documented
  entry points only; no edits.
- `MCQ_LEAKAGE_ADJUDICATION.md`, `MCQ_DISTRACTOR_AUDIT.csv` — read only; neither gates the queue
  (§1), so neither needed a hand-maintained adjudication append.
- `src/lib/variants.ts` and all generator source — not modified, consistent with the measured 0/166
  generated-row movement.
- All `content/courses` lesson files — read only for verification (61-row sample); zero edits.
- My own temporary verification script and its two sample-data JSON files
  (`scripts/audit/_tmp-s320-choice-staleness-check.mts` and `_tmp-s320-{authored,generated}-sample.json`)
  were deleted before this packet ended; they never persisted past the diagnostic step and are not
  part of this packet's evidence trail beyond what is quoted above.
