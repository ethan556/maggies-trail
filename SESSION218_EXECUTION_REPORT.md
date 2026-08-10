# SESSION 218 EXECUTION REPORT — Fable-only: the highest-reuse engine's picture learns to answer a wrong conclusion, and a describe-mcq becomes a build task with its re-askability intact

Fable-only session, second under the mode. The coordinator planned, implemented, tested and
sealed; the only agent spent was the independent Fable QA (two passes: full + delta). Zero
Opus/Sonnet, credits untouched.

## 1. What shipped

**distributionCompareLab judge-mode lift — 7 judge steps across 3 lessons activate with zero
content bytes.** The engine's judge mode (pick a conclusion about two distributions) previously
answered a wrong pick with feedback text only; the picture never responded, and its options
lacked the house grammar. Now at retry/reveal the DECIDING QUANTITIES are drawn onto the picture
— the mean-gap bracket ("gap ≈ N variability-units") and the overlap label ("overlap ≈ P%") —
computed from the same gap/overlap the widget always used, and the options carry the
ghost/contrast grammar with the correct option unmarked at retry. QA render-diffed **525 cases
against the S217 seal: 483 byte-identical** (every no-tone/neutral/success render and ALL measure
renders — stronger than claimed), 42 differing exactly where the lift lives. It verified the
evidence strings against its own hand-computed values on all 7 authored judge specs, including
the singular at gapUnits exactly 1, and ruled the overlap proxy **honest as documented** (it is
exactly the drawn curves' crossing-height fraction; the schema declares it a readout; the sealed
aria has spoken the identical number since S131; and it never crosses an authored conclusion's
decision boundary — checked against the true normal-overlap integral).

**ee-05-02/k1 — describe becomes build.** "Graphing Inequalities" asked, in an mcq, what kind of
circle and which direction for x ≤ 3. The learner now BUILDS it on `numberLineRay`: start x > 0,
target x ≤ 3, set-graded. The mcq's two distractor misconceptions (open circle; wrong direction)
are now the engine's own reachable wrong states with its own state-computed diagnoses. Five gates
re-adjudicated by QA; NOVELTY holds against the lesson's `numberLinePlace` step (which places
only the boundary — one fact of three). Revert-proof byte-exact.

**A new generator form kept the check re-askable.** k1 carried a variant key whose generator
emits an mcq — the conversion turned the resolver's type-match invariant RED (the S210 situation,
caught this time by the gate rather than by an assessor). Per the S211 precedent, the fix was a
ray-emitting `graphBuild` form under the full CLAUDE.md protocol: independent substitution route
(classify b−1/b/b+1 against the printed symbol — never the engine's comparators), a new
`numberLineRay` gate branch (the engine has no distractor list, so the five questions read in its
terms: wrong-direction and wrong-inclusivity states must bite through the real evaluator with
distinct, leak-free diagnoses), and 150 seeds through the identical gate.

## 2. The catches, in order of who caught what

- **The integrity gate caught the generator's first draw** (start boundary 0 falls off-window for
  b > 6) — kept as a comment at the fix site.
- **The print-and-read step caught two defects a green gate had passed**, exactly the classes
  CLAUDE.md's step-5 list warns about: "A open circle" (article morphology — now stored with the
  noun phrase) and a fallback "test number" that was INSIDE the set ("does 2 satisfy x ≤ 4?" — it
  does, pinning nothing). Both fixed, both now pinned in the gate branch so they cannot recur.
- **One gate assertion was corrected, documented in-line and empirically validated by QA**: the
  first draft banned diagnoses from quoting "x ≤ b" — the SOLVE-task leak rule — but in a build
  task the inequality is the printed GIVEN and the answer is the drawing. QA proved the draft
  rule would have flagged 125/125 legitimate specs and that the corrected rule (ban describing
  the target DRAWING) binds on the task's actual answer channel. A re-typing, not a loosening.
- **QA corrected its own first report on the record**: its claim "no gate asserts widget-type
  match" was false — the resolver test existed and was red; its grep had missed a dynamic
  content-walk. It also confessed a vitest `-t` filter that matched nothing and re-ran properly —
  with the recorded lesson that a green scoped run proves nothing until the filter is shown to
  match loop-generated test names.
- **The coordinator's own independent transcription was wrong once**: it assumed the overlap was
  the normal-overlap integral; the engine's documented model is the visual proxy exp(−g²/8). The
  test was corrected to transcribe the PUBLISHED formula with hand anchors — the widget was right.

## 3. Verdicts and validation

Fable QA: full pass 9.25 ACCEPT×2 with one REQUIRED_FIX; delta pass after the fix + the variant
form: **OVERALL 9.55 — mathematics 10/10, mastery 10/10 — no new REQUIRED_FIX.**

One serialized chain: typecheck 0 · vitest **322 files / 12,925 tests, 0 failures** (components
84/1,326 · lib 210/7,309 · app+server+world+math 24/162 · variants solo **3,993** · audit solo 2)
· validate:content 1,840/1,840 · lint:pedagogy 1,711/1,711 · registrations clean ·
engine-registration 127/127 · content proof **815/815** · hash 1,701/1,701 · build 0 · Playwright
115/115 (Trap-D protocol) · fresh-extraction reprove at seal.

## 4. Metrics

| metric | value |
|---|---|
| Lessons whose existing judge steps gained a responding picture | 3 (7 steps, zero content bytes) |
| Lessons gaining a build-instead-of-describe causal step | 1 (`ee-05-02`) |
| numberLineRay authored users | 3 lessons; + a generator form making its build tasks re-askable |
| Escalations off Fable | 0 |
| Print-and-read catches | 2 (morphology; in-set test number) |
| Gate catches | 2 (off-window start; red resolver invariant) |
| Self-corrections on the record | 2 (QA's false claim; coordinator's wrong transcription) |
| Content changes | 1 file (`ee-05-02`, k1 widget + variant form) |

## 5. Queue for next (unchanged priorities + one addition)

1. The manipulable wrong-state contrast for distributionCompareLab (QA: "the queue item's other
   half") — the evidence overlay answers a wrong conclusion; a manipulable version would let the
   learner DRAG the distributions until their claimed conclusion becomes true, and see what gap
   it requires. Medium; needs a design decision (does dragging fit a judge step's demand?).
2. Overlap-label placement polish (collides with its own bracket at some gaps — QA note).
3. Second algebraTiles distribute lesson; then the seven engine gaps.
4. describeState coverage 84/127 (low urgency).
