# S248 mult-div-fluency-g4 independent V4 assessment

Status: **PASS — candidate and validator are current-hash clean; implementation is not V4-complete**

This assessment read all 16 complete live lessons and remedials, every evaluator and feedback state, all 19 main option surfaces, the S248 focused test and implementer report, the 13 registered figure implementations and accessible labels, current review cards, queue evidence, and the authoritative review hashes. It did not edit lesson/runtime source, append the shared decision ledger, or regenerate the shared queue, cards, or cache.

## Exact triple-disposition result

- Whole lesson: **0 KEEP, 16 REVISE, 0 ESCALATE**.
- Visual first: **2 REQUIRED, 0 PREFERRED, 14 SUFFICIENT, 0 ESCALATE**.
- Grade 4 language: **11 FIT, 5 REVISE, 0 ESCALATE**.
- Candidate: `reports/closure/candidates/S248_MULT_DIV_FLUENCY_G4_TRIPLE_DISPOSITIONS.jsonl`.
- Candidate SHA-256: `54ff7c4b7c20092a663caa2a44fdca97431757dce41b3be608ad1c697f93d748`.

No current lesson is escalated because the learner-visible falsehoods found during independent review were repaired and ratcheted before the candidate basis was frozen. `REVISE` means the complete lesson still fails at least one V4 question-job, visual-semantic, or language contract.

| Lesson | Current review basis | Lesson | Visual | Language | Primary finding |
|---|---|---|---|---|---|
| g4m-01-01 | `bb6d450bc988ea50c21273c18b9769b07b174345cf06221567a443f16de3700a` | REVISE | SUFFICIENT | FIT | Exact 30 × 4 area action repeats; later work remains one computation family. |
| g4m-01-02 | `5bf40a59e28c32bf271937fcfb87257dcb316dee0555309728f769928191f2b3` | REVISE | SUFFICIENT | FIT | Exact 14 × 6 area action repeats; no inspectable region error. |
| g4m-01-03 | `fe74eeb28317f9e1fbd85280aaf882693013a08330dc39460f01aca8fefa8694` | REVISE | SUFFICIENT | FIT | Exact 1,342 × 3 column state repeats; challenge falls to 15 × 3. |
| g4m-01-04 | `2516f0c7f842a503d2f248ffb920b86318bdd14e7527c7fc79f93a0f5caaf504` | REVISE | REQUIRED | FIT | c2 uses an addition-only carry figure for multiplication; exact column state repeats. |
| g4m-01-05 | `ca76e3a511156611240510d1d9bffc67cb627fc7615cab39f94130185d9728f7` | REVISE | SUFFICIENT | FIT | Exact 23 × 14 area action repeats; the claim is not an editable error. |
| g4m-01-06 | `db96281c0cd8d5024695fc005f70a2c699ab8604fc7258d8a915426314fedc0a` | REVISE | SUFFICIENT | REVISE | Exact 26 × 18 area action repeats; emphatic/figurative copy needs a literal Grade 4 pass. |
| g4m-02-01 | `59022a1062358463b94417de27281f4d2cda10e3b0630765f21dfac05df1b3fa` | REVISE | SUFFICIENT | REVISE | Exact estimate band repeats; “within a whisker/order of magnitude/guards” copy is indirect. |
| g4m-02-02 | `1853eda469af5b58f20dd82c9f961b56a8f845aa409ada7a1dd87b4b106e83f5` | REVISE | SUFFICIENT | REVISE | Exact estimate band repeats; telegraphic stem and repeated advanced idiom. |
| g4m-02-03 | `c7cfa5a9526a1fbf34844418ab316c090f54bad7adb7963a108bd7af825900db` | REVISE | SUFFICIENT | FIT | Exact 936 ÷ 3 slider repeats after truth repair. |
| g4m-02-04 | `3fb034eb52f07236d09cbdfd628c9026107897e2cbf050a79431564257b8fbc7` | REVISE | REQUIRED | REVISE | No figure or interaction constructs partial quotients; same broad slider repeats; chunk copy is imprecise. |
| g4m-02-05 | `48fb28b5348143b50503b3b4e9938f8535455813f79199d2ad9c3ae1468e9047` | REVISE | SUFFICIENT | FIT | Both interactions repeat 84 × 6 instead of performing/diagnosing division. |
| g4m-03-01 | `1a3bfc7e6dd0bc0dc8201852a480ed51e9d3589adacd304e1116e0dba33a3e24` | REVISE | SUFFICIENT | FIT | Exact 3,612 ÷ 6 estimate band repeats after wording truth repair. |
| g4m-03-02 | `198d659fb274bffbd9b9f7d2a9f69ae794496674b0b471a2754a6111e4ef6926` | REVISE | SUFFICIENT | FIT | Exact seven-hop action repeats; partition/grouping language is now truthful. |
| g4m-03-03 | `ddc8eb99b8adbe38d23dd18a1c8c8e153adef1617dda4dad7c8d7ead981e5a0a` | REVISE | SUFFICIENT | FIT | Exact six-hop action repeats; no new capacity-allocation state. |
| g4m-03-04 | `b594d0d3db7df02b78f709ada0137a05afc22fe1c19e36349427828744cfb9a1` | REVISE | SUFFICIENT | FIT | Exact 2,437 ÷ 5 estimate band repeats; nearby-multiple and singular grammar defects are closed. |
| g4m-03-05 | `bd5938a58b7bc82e87c0a77bf9fb8d8fa7eaca60dadb6c36ee1cb223d95810a5` | REVISE | SUFFICIENT | REVISE | Exact 213 × 4 checker repeats; prediction reveal is too dense for Grade 4. |

## Release-blocking falsehoods found and closed

Independent review found defects that the original 6-test aggregate did not detect. The implementation owner repaired them before this candidate was frozen, and the focused suite now includes a seventh truth-ratchet test.

- `g4m-03-01/c1` no longer calls a hundreds-or-thousands answer a “four-digit quotient”; it correctly refers to a quotient from a four-digit dividend.
- All eight division/remainder lessons now use division-specific CML and numeric fallback feedback instead of copied multiplication decomposition.
- `g4m-02-03/i1+i2` now state the true result that 9 hundreds shared among 3 groups gives 3 hundreds each.
- `g4m-03-02/c1` now distinguishes partition sharing (objects in each group) from grouping division; the remedial uses a genuine grouping model.
- `g4m-03-04/i1` calls 2,500 a nearby friendly multiple, not the closest multiple of 5 to 2,437; the “1 hiker” feedback is grammatical.
- `g4m-02-04/i1+i2` now honestly ask for a broad quotient range, matching their factor-two estimate evaluator, instead of claiming that a broad band proves the exact total 213.
- `g4m-01-01` now teaches place-value scaling and accounts for a trailing zero produced by the basic fact itself; `g4m-01-03` no longer applies a nonzero-digit shortcut to ordinary multi-digit products.
- `g4m-02-01/c2` now says “the product of two two-digit factors,” removing the ambiguous claim about a “two-digit product.”

## What the S248 implementation genuinely fixed

The independently rerun focused suite passed **7/7**. Across the frozen live source:

- the 45 audited main numeric answers equal their independently checked arithmetic results;
- all 8 main `columnCalc` surfaces report their own multiplication equation and product;
- all 19 main MCQs have exactly one correct option, unique labels, misconception-specific feedback, maximum option-length spread 12 characters, and deterministic runtime shuffling that reaches all four positions;
- generic incorrect-option feedback count is **0**;
- all concept figures are registered, no concept still references `count-on-hops`, and the repaired source passes schema/pedagogy/widget checks.

These are real improvements. They do not establish whole-lesson V4 quality because the focused “distinct progression” check includes prompt text in its widget signature and therefore treats a new sentence around an unchanged action as a new action.

## Why the progression queue is not semantically closed

For every one of the 16 lessons, removing only `widget.prompt` makes i1 and i2 byte-equivalent under stable serialization. Widget type, operands or target, range, controls, answer state, error states, and feedback are identical. “Build the model” becoming “test a classmate's claim” does not change what the learner does.

The legacy progression detector currently carries only 13 rows because its prompt-based signatures miss this semantic equivalence. The independent V4 assessment preserves **16** action-contract rows: `PROGRESSION-g4m-01-01` through `PROGRESSION-g4m-03-05`.

## Specialized rows that remain

After authoritative append and derived-artifact refresh, specialized work still includes:

- **16 semantic progression rows**: every lesson's prompt-stripped i1/i2 action contract.
- **3 semantic illustration replacements**:
  - `g4m-01-04/c2`: addition carry-chain figure used to explain multiplication regrouping;
  - `g4m-02-04/c1`: generic long-division cycle does not show partial-quotient chunks;
  - `g4m-02-04/c2`: unrelated 812 ÷ 39 estimate does not show the 852 ÷ 4 chunk model.
- **16 `LESSON_REVISION_IMPLEMENTATION` rows** after the 16 REVISE decisions are integrated.
- **0 current `CHOICE_SURFACE_INTEGRITY` rows** after refreshing the repaired option audit.
- **0 current `MATH_PRESENTATION_RESIDUE` rows** for this course.

The current queue still carries 32 illustration placements because no independent semantic closure has yet been integrated. This review finds 29 placements sufficient and preserves/replaces the 3 rows above; regeneration must not delete all 32 mechanically merely because every figure ID is registered.

## Shared-artifact boundary and reproducible gates

At validation time, all 16 shared course cards were stale against the repaired lesson hashes. The candidate binds directly to `loadLessonReviewAuthority` and has **16/16 current review-basis hashes**. The current scoped queue remains 94 rows: 32 illustration, 13 legacy progression, 1 stale choice, and 48 generic triple-review rows.

```text
node reports/closure/candidates/validate-s248-mult-div-fluency-g4-triple-dispositions.mjs
node scripts/audit/append-lesson-review-candidates-s246.mjs --check reports/closure/candidates/S248_MULT_DIV_FLUENCY_G4_TRIPLE_DISPOSITIONS.jsonl
npx vitest run src/lib/session248.multDivFluencyG4CourseIntegrity.test.ts --reporter=verbose
```

Observed results:

- strict candidate validator: **PASS**, 16/16 current authority hashes;
- bounded appender dry-run: **PASS**, ledger history 178 → 194, 16 REVISE records;
- focused implementation regression: **PASS**, 7/7 tests;
- candidate SHA-256: `54ff7c4b7c20092a663caa2a44fdca97431757dce41b3be608ad1c697f93d748`.

Authoritative append can close the 48 generic review rows, but it must open or retain the 16 revision implementations and all specialized semantic work listed above.
