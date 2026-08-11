# Premium Experience Rebuild — S230 Wave C Batch 3

## Outcome

S230 remediates 18 repeated Grade 5 MCQ blind-guess risks without changing curriculum mathematics, prompts, distractor misconceptions, authored feedback, grading, lesson order, or progression.

- Starting queue: 651 of 3,293 authored/remedial MCQ moments.
- Selected evidence: six concept families repeated three times each.
- Changed surface: the keyed option label only.
- Batch result: all 18 selected rows now pass and are classified KEEP.
- Remaining queue: 633 rows.
- Cumulative Wave C result: 64 of the original 697 rows remediated.

## Parallel review and scope decision

Three independent GPT-5.6 reviews were used at deliberately different effort levels:

- Low effort quantified repeat frequency and ranked a conservative 15-row core.
- High effort reviewed pedagogy, grade-language fit, and candidate replacement labels; it also identified unsafe prompts that need curriculum review.
- Ultra effort adversarially tested the scope and recommended adding the clean `V = B × h` family while rejecting a broader 27-row batch whose prompts contained ambiguity or truth-risk.

The integrated batch is therefore 18 rows: the 15-row high-harm core plus the clean three-row prism-generalization family. Frequency alone was not treated as rewrite authority.

## Selected families

| Family | Lesson(s) | Rows | Keyed label after remediation |
|---|---|---:|---|
| Remainder as a fraction | `g5f-01-03` | 3 | When the leftover can be shared equally |
| Order of operations | `g5e-01-01` | 3 | Multiplication comes before addition |
| Partial quotients | `g5l-02-01`, `g5l-02-02` | 3 | Groups may be removed in batches and totalled |
| Fraction-addition reasonableness | `g5u-03-02` | 3 | Yes because 5/6 is between 1/2 and 1 |
| Unit cubes as volume | `g5v-01-01` | 3 | Each unit cube fills one unit of space |
| General prism formula | `g5v-02-02` | 3 | It works for prisms of any base shape |

## Preservation evidence

1. The content diff changes exactly 18 keyed labels in seven lesson JSON files: 18 removed values and 18 replacement values.
2. Every prompt, option ID, `correct: true` marker, widget shape, hint, and lesson sequence is unchanged.
3. All 54 wrong-option labels are unchanged.
4. All 72 correct and incorrect feedback strings are unchanged.
5. All seven edited lesson files parse as JSON.
6. The regenerated audit records exactly 18 target decision changes from REMEDIATE to KEEP and zero non-target decision changes.

## Regenerated artifacts

- `MCQ_DISTRACTOR_AUDIT.csv`
- `MATH_TYPESETTING_AUDIT.csv`
- `PREMIUM_REBUILD_BASELINE.md`

The math audit changes only because the revised fraction-reasonableness label contains additional learner-visible fractions. No direct-manipulation decision changed.

## Verification

- TypeScript typecheck: PASS.
- Course-specific Vitest: PASS, 81/81 across five files.
- CML integration: PASS; 18 pilots, 91 direct-engine profiles, 1,701 lesson files.
- Math-format verifier: PASS; two sanctioned KaTeX importers and zero raw-LaTeX lesson files.
- Engine registration: PASS, 127/127.
- Visual explanations: PASS, 3,684/3,684.
- Production Next.js build: PASS, 57 routes.
- Offline production dependency audit: PASS, zero vulnerabilities.
- JSON parse: PASS, 7/7 edited lessons.
- Content schema and pedagogy commands: blocked before project code by the retained Windows `uv_os_get_passwd` / `ENOMEM` host failure.
- Browser automation was not rerun for this label-only content batch; S229 retains the documented Windows browser-server orchestration exception, while the production build and independent source gates are green.

Wave C remains active. The remaining 633 rows are increasingly dominated by singletons and lower-frequency families and require human curriculum review rather than bulk shortening.
