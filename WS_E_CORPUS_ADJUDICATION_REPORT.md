# WS-E Phase 2 — Corpus Adjudication Complete (all 1,362 gates)

Session S241, 2026-08-14. Every prediction gate in the corpus now carries a real, per-gate
textual adjudication against `WS_E_PREDICTION_RUBRIC.md` (v1.1). Zero rows empty. Nothing in
`content/courses/` has been touched — every verdict below `PROPOSED` awaits your ruling before
any Phase 4 edit executes, per the accumulate-per-course cadence you set.

## Headline result

| Verdict | Count | Share |
|---|---:|---:|
| KEEP | 1,145 | 84% |
| REWRITE | 200 | 15% |
| REMOVE | 17 | 1% |

**The old widget-capability CSV is now fully measured against real adjudication, and it fails in
both directions.** Old-vs-new matrix:

| | new KEEP | new REWRITE | new REMOVE |
|---|---:|---:|---:|
| **old KEEP (1,162)** | 967 | 180 | 15 |
| **old REMOVE (200)** | **178** | 20 | 2 |

89% of the gates the old system would have deleted (178 of 200) are KEEPs under the rubric —
including much of the corpus's best material. Meanwhile 195 gates the old system blessed
actually need work. The two methods agree on verdicts barely better than chance would suggest;
the purge the old CSV prescribed would have destroyed far more value than it removed.

## Provenance (every row tagged in `adjudicator_notes`)

- 20 rows: S240 batch 1, **user-ruled** (add-subtract-10-k, koa) — 16 adopted as-is; 4
  reconciled (below).
- 44 rows: S241 batches 1–2, **user-ruled** (non-koa rows of add-subtract-10-k ruling wave,
  add-subtract-100, add-subtract-1000-g2, absolute-value-piecewise).
- 17 rows: S240 batch 2, proposed (add-subtract-20, v1.1-aware hand adjudication; agreed with
  this session's wave on 16 of 17 — the disagreement, as-03-01, adopted their REWRITE).
- 1,281 rows: S241 parallel wave adjudication, proposed — every note mechanically verified to
  quote that gate's own text; zero widget-type citations, zero boilerplate.
- 18 of the wave rows subsequently flipped KEEP→REWRITE by the v1.1 re-screen (below).

## The two-session reconciliation (done this session, per your delegation)

The S240 session and this one ran in parallel; both user-ruled `add-subtract-10-k`, clashing on
8 of 20 gates. Resolution, row by row:

- **koa-01-02, koa-01-03, koa-02-02 → REWRITE** (S240's verdict). Your S241 ruling had them
  KEEP, but my own batch notes flagged all three "second reader"; S240's adjudication *is* that
  second read and applies v1.1's stricter single-instance litmus consistently.
- **koa-02-03, koa-02-05, koa-03-02, koa-03-04 → REMOVE** (S241's thinning ruling stands). Your
  thinning decision was made with the repetition family laid out whole; S240's own notes call
  these the "third/fourth/fifth instance of the template" and its koa-02-05 KEEP self-describes
  as "the row whose flip costs least."
- **koa-03-06 → REMOVE** (S240's verdict). Both sessions agreed it isn't a mathematical
  prediction; S240's demotion-to-prose reasoning was explicitly user-approved.

WS-J was reconciled the same way: S240's committed implementation (onboarding + leaderboard
wiring, enabled-path forward-tests) adopted as canonical; this session's parallel rebuild
dropped except its one unique piece, the reasoning-surface fence test, ported in `50cd7d1`.

## v1.1 re-screen: 18 flips (KEEP→REWRITE), all one-clause fixes

Rubric v1.1's correctness test (a universal claim must be *true* across its own natural domain)
postdated the wave adjudication, so all 591 invariant-based KEEPs were re-screened against it.
573 pass. The 18 failures — each verified to quote the gate's own text, each with a concrete
counterexample, every one fixable with a single scoping clause:

zero breaks "×<1 always shrinks" (`g5d-02-02`, `dop-05-01`); crossing 100 breaks "ten more
climbs the tens digit" (`c120-02-03`, `c120-05-02`) and "tens digit names the row"
(`c120-02-02`); y=x³ breaks "flat tangents are where a curve turns" (`dr-01-02`, `dc-01-01` —
verbatim duplicate reveals); vertical lines break "two points always give y=mx+b" (`lf-04-02`);
reflex angles break "past 90° is obtuse" (`mc-03-03`); a too-short go-between breaks the
transitive-measurement gate (`g1m-01-03`); ×9's digit pattern (asserted elsewhere in the same
corpus!) breaks "×6–×9 have no patterns" (`mf3-02-05`); the digit 0 breaks "place always sets
the value" (`pv2-01-03` — where the "wrong" option is actually the true statement); 1:1 ratios
break "never by adding" (`rr-02-01`); non-lowest-terms breaks the terminating-decimal test
(`rns-01-02`); cosine on [−90°,90°] breaks "hits every value twice" (`tg-04-02`); θ=90° breaks
"tan·cos = sin through the whole drag" (`ti-02-03`); the multiplicative identity breaks
"disagree sharply" (`g5e-01-04`); appending 0 to a whole number breaks "adds nothing"
(`dg4-03-03`).

## Content defects — need your ruling (frozen prose, never silently edited)

Verified by me directly against `content/courses/` source, not taken from agent reports:

1. **`k100-03-02`, `k100-03-03`** (K, counting) — keyed answer's number contradicts its own
   reveal ("stop at 40" vs reveal "reaches 38"; "stop at 50" vs "reaches 49"). A correct-counting
   learner is marked wrong. 2 of 7 gates in an otherwise-clean family.
2. **`g1s-02-02`** (G1, geometry) — keyed answer "Four" is right but the reveal's arithmetic
   (8 edges − 2 hidden = 6) never reaches it; the edge-merge step is missing.
3. **`qu-01-03`** (quadratics) — prompt says "move h DOWN", keyed answer "left" (correct), but
   the reveal is the UP-case text pasted verbatim from `qu-01-01/02` ("Raising h moves the
   vertex RIGHT") — it argues *against* its own keyed answer.
4. **`g5d-02-01`** (G5, decimals) — reveal claims rounding 4.9→5 lands "within half a unit":
   4.9×6=29.4 vs 30 is 0.6 off. False as written.
5. **`esn-04-03`** (G8, scientific notation) — "the powers add: 4+2 makes 10⁶" drops the
   mantissa product (3×2=6 → 6×10⁶); the method as stated lands a decade low whenever mantissas
   multiply past 10.
6. **`kgb-01-03`** (K, shapes) — reveal names "beside the vase" as a landmark; no vase exists
   anywhere in the prompt (minor, but a K learner has nothing to anchor it to).
7. **`pv2-01-03`** (place value) — the distractor "Only zeros match everywhere" is the *true*
   statement under the keyed claim's own logic (overlaps with re-screen flip above).

## Repetition families — for the per-course thinning passes

The wave surfaced ~130 gates in repetition families beyond the koa set you already thinned.
Largest: the 5-gate "hop direction" family (as/g1a), 4-gate "crossing ten" (as/g1t), the
rf-01/02 domain-restriction quartet, the qu-01 vertex-shift triplet (byte-identical reveals),
tf-03's identical-reveal triplet, and two cross-course byte-identical duplicates
(ks-03-01 ≡ smg1-03-01; tg-03-01 ≡ ti-01-01). All are tagged `ESCALATED` in the CSV with every
family member named, ready for one thinning decision per family when each course's ruling pass
happens — same pattern as your koa ruling.

## What's next (in order, per the standing plan)

1. Your per-course rulings over the PROPOSED verdicts (1,362 done, 64 already ruled).
2. Phase 4 content edits execute per ruled course — REWRITEs (200, overwhelmingly one-clause),
   REMOVEs (17), defect fixes (7 above) — accumulate-per-course cadence.
3. Phase 3 (LessonPlayer interruption-cost softening for retained gates), Phase 5 (world-layer
   nav), Phases 6–9 (art — still governance-blocked).
