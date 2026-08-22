# S247 independent assessment — Grade 2 add/subtract within 1,000

## Outcome

The 16-lesson source packet is a substantial improvement, but it is not a 16-lesson `KEEP` packet. The current-source dispositions are:

- Whole lesson: **7 KEEP**, **9 REVISE**, **0 ESCALATE**.
- Visual: **1 REQUIRED**, **2 PREFERRED**, **13 SUFFICIENT**, **0 ESCALATE**.
- Grade language: **8 FIT**, **8 REVISE**, **0 ESCALATE**.

The signed candidate file is `S247_ADD_SUBTRACT_1000_G2_TRIPLE_DISPOSITIONS.jsonl`. Its current SHA-256 is `2ac8cfee25414aa22efa858a7acd6a2d5a38b54b939bd2259bdfa7faf76f8893`. The strict validator passes, and the bounded shared-ledger appender dry-run accepts all 16 exact records without writing the ledger.

## Decision table

| Lesson | Whole | Visual | Language | Current assessment |
| --- | --- | --- | --- | --- |
| g2b-01-01 | REVISE | SUFFICIENT | REVISE | Correct and visible; challenge repeats the taught 300 + 200 exemplar, estimate options are imbalanced, and feedback is too abstract. |
| g2b-01-02 | REVISE | SUFFICIENT | REVISE | Correct no-trade progression; estimate choices have a 9-versus-30-38-character construction cue and feedback is teacher-facing. |
| g2b-01-03 | REVISE | SUFFICIENT | REVISE | Trade states and evaluator agree; `legal`, `licenses`, and similar prose are not simple Grade 2 language. |
| g2b-01-04 | KEEP | SUFFICIENT | FIT | Correct tens-to-hundred construction, explanation, computation, and transfer with accessible value-preserving controls. |
| g2b-01-05 | REVISE | SUFFICIENT | REVISE | Both trades are correctly visible; anthropomorphic narration and a reused trade-justification family remain. |
| g2b-02-01 | KEEP | SUFFICIENT | FIT | Correct subtraction, remainder builds, estimate, transfer, and concise feedback. |
| g2b-02-02 | KEEP | SUFFICIENT | FIT | Correct nonstandard ten-to-ones constructions and direct equal-value explanation. |
| g2b-02-03 | KEEP | SUFFICIENT | FIT | Correct hundred-to-tens constructions, computation, explanation, and transfer. |
| g2b-02-04 | REVISE | PREFERRED | REVISE | Double-trade truth is correct, but the fixed SVG puts its final label at y=104 outside a 96-unit viewBox; `double-broken`/`fed` wording is unnecessary. |
| g2b-02-05 | REVISE | REQUIRED | FIT | The boundary statement is now true and concise, but no visual, interaction, or question actually crosses a hundred. |
| g2b-02-06 | KEEP | SUFFICIENT | FIT | Correct forward/backward hundred jumps and new-number mental transfer. |
| g2b-03-01 | REVISE | SUFFICIENT | REVISE | Number-line mathematics is correct; method feedback is adult-like and the correct option is the longest. |
| g2b-03-02 | KEEP | SUFFICIENT | FIT | Correct nonstandard decompositions with visible, accessible equal-value construction. |
| g2b-03-03 | REVISE | SUFFICIENT | REVISE | Jobs are varied and mathematically correct; explanation language remains too formal and repeats a course-level family. |
| g2b-03-04 | KEEP | SUFFICIENT | FIT | Correct visual story modelling across addition, subtraction, equation reading, and transfer. |
| g2b-03-05 | REVISE | PREFERRED | REVISE | The new challenge is a genuinely distinct across-zero procedure; method/estimate option parity, adult prose, and a text-flow rather than comparison visual remain. |

## What is genuinely closed

### Illustration replacement

All **32 original illustration-placement causes are genuinely source-closed**. Every former `count-on-hops` c1/c2 placement now uses the course-specific expected renderer, and all 16 remedials use the same reviewed representation. The registered figures render SVG with a title and image role, and the focused regression checks text/figure alignment.

This does not mean every visual is final. Three narrower semantic/presentation issues remain:

- `g2b-02-04`: the final fixed-figure label is outside its viewBox.
- `g2b-02-05`: the newly stated cross-hundred case is not represented or assessed.
- `g2b-03-05`: the method-selection figure is a labelled text flow rather than a side-by-side mathematical comparison.

### Progression and repetition

All **16 original structural cloned-interaction causes are closed**: every lesson has distinct widget payloads, exact prompts, and number-normalized prompt templates. The correction to `g2b-03-05/ch1` also removes the remaining same-method-choice repetition found during this assessment.

Only **15 of 16 lessons are semantically progression-complete**. `g2b-01-01/ch1` still presents the exact `300 + 200` fact already taught and answered in c1, so its “challenge” is retrieval of the displayed exemplar rather than transfer to a new number, representation, explanation, or misconception.

## Specialized work that remains

### Choice-surface integrity — 5 surfaces

- `g2b-01-01/k3`
- `g2b-01-02/k3`
- `g2b-03-01/k3`
- `g2b-03-05/k2`
- `g2b-03-05/k3`

Runtime seeded shuffling correctly prevents a fixed answer position, but it cannot remove wording and length cues. The three estimate families contain a nine-character distractor against 30-38-character alternatives; the method surfaces also make the correct option conspicuously longer.

### Grade-language revision — 8 lessons

`g2b-01-01`, `g2b-01-02`, `g2b-01-03`, `g2b-01-05`, `g2b-02-04`, `g2b-03-01`, `g2b-03-03`, and `g2b-03-05` contain avoidable teacher-like, idiomatic, anthropomorphic, or abstract feedback. Examples include `trades exactness for speed`, `precisely`, `legal`, `licenses`, `ideal`, `pure mental math`, `likely`, and `place-value structure`.

### Standards evidence — all 16 lessons

The live authority reports **zero standards dossiers for all 16 lessons**. Therefore these lesson dispositions must not be presented as Common Core alignment closure. A later standards batch must map exact Grade 2 Operations and Algebraic Thinking / Number and Operations in Base Ten expectations to step-level evidence, inspect full intent and boundaries, and keep each claim candidate until official-source review approves it.

## Arithmetic, evaluator, and accessibility evidence

The strict validator independently audits **112 scored/manipulated surfaces**:

- 60 numeric surfaces, including remedials;
- 9 number-line interactions;
- 23 base-ten constructions;
- 20 MCQs, including remedials.

Every parsed numeric answer agrees with its prompt, every line landing is inside its authored range and named consistently in success/miss feedback, every standard/nonstandard base-ten target is reachable under its caps, and every reviewed main MCQ has one correct semantic label. `requireStandard` is correctly false for the nonstandard regrouping lessons and true for standard-form construction.

The base-ten picture itself is hidden from assistive technology, but equivalent steppers, four named exchange controls, and a polite live expanded-value equation expose the state and actions. Fixed concept figures carry titles and image roles. MCQ grading uses stable option IDs while the runtime shuffles display order reproducibly. These are strong source contracts; they do not replace final browser evidence for keyboard, touch, narrow viewport, reduced motion, and screen reader journeys.

## Derived-artifact state and honest queue effect

The current shared cards and queue predate this final packet:

- all 16 cards exist, but **0/16 lesson-source hashes and 0/16 review-basis hashes are current**;
- the scoped queue contains **80 rows**: 32 stale illustration rows plus 48 generic lesson/visual/language review rows;
- no current progression row remains in the materialized queue, even though `g2b-01-01` still has the semantic challenge weakness described above.

After root-controlled serial append and regeneration:

- the 32 stale illustration rows should close;
- the 48 generic rows should close by current signed decisions;
- nine bounded `REVISION_IMPLEMENTATION` rows should represent the nine `REVISE` lessons;
- the progression, five choice surfaces, and three visual issues above should remain explicit in the revision rationales rather than being lost because a mechanical detector is quiet;
- standards closure must remain unavailable until exact evidence dossiers exist.

## Deterministic verification

- Strict candidate validator: **PASS**.
- Bounded append dry-run: **PASS**, 16 records, no shared write.
- Focused course regression after assessor-driven source corrections: **5/5 passed**.
- Content schema: **1,840/1,840 passed**.
- Pedagogy lint: **1,711/1,711 clean**.
- Strict CML lint: **0 errors, 0 warnings**.
- Typecheck: **passed**.

No lesson/runtime source, shared ledger, queue, review card, or cache was edited by this assessor packet.
