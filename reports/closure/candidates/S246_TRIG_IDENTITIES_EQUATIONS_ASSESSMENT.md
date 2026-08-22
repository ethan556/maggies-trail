# S246 trigonometric identities & equations — triple-disposition assessment

## Result

The complete `trig-identities-equations` course was reviewed once across whole-lesson quality, visual-first representation, and Grade 12 language. This is an isolated candidate portfolio: it does not change lesson source, the authoritative ledger, queue, cards, or cache.

- Lessons reviewed: **15/15**
- Current card hashes matched: **15/15**
- Candidate dispositions: **1 KEEP / 12 REVISE / 2 ESCALATE**
- Visual dispositions: **1 REQUIRED / 3 PREFERRED / 11 SUFFICIENT**
- Grade-language dispositions: **9 FIT / 6 REVISE**
- Expected generic review closures after authoritative append: **45**
- Expected traceable implementation-debt rows after append: **14**
- Exact-MCQ duplicate clusters: **0**
- Candidate standards edges retained as pending authority: **90**

## Lesson decisions

| Lesson | Whole lesson | Visual | Language | Primary disposition basis |
|---|---|---|---|---|
| ti-01-01 | REVISE | SUFFICIENT | REVISE | k3 option-length/construction cue; 1 notation row |
| ti-01-02 | REVISE | SUFFICIENT | REVISE | k2 explanatory/long correct option; 15 notation rows |
| ti-01-03 | REVISE | SUFFICIENT | FIT | 8 transformed-family notation rows |
| ti-02-01 | REVISE | SUFFICIENT | FIT | 1 reciprocal/quotient notation row |
| ti-02-02 | REVISE | REQUIRED | REVISE | cofunction ghost does not derive the Pythagorean family; k3 numeric cue; 4 notation rows |
| ti-02-03 | ESCALATE | PREFERRED | REVISE | quotient identities stated beyond their common domains; k1 answer cue; 1 notation row |
| ti-03-01 | REVISE | SUFFICIENT | FIT | four numeric evaluation surfaces; detected k1b/k2 normalized repeat; 3 notation rows |
| ti-03-02 | REVISE | SUFFICIENT | REVISE | k3 lone justification/length cue; repeated tangent evaluation; 6 notation rows |
| ti-03-03 | REVISE | SUFFICIENT | FIT | 4 formula-rendering rows; semantic progression otherwise sound |
| ti-04-01 | REVISE | SUFFICIENT | REVISE | 34 notation rows; unsupported `30/25` in ch1 common-error feedback |
| ti-04-02 | REVISE | SUFFICIENT | FIT | 16 squared/double-angle notation rows |
| ti-04-03 | ESCALATE | PREFERRED | FIT | quotient cancellation omits zero-denominator exclusions; 20 notation rows |
| ti-05-01 | REVISE | PREFERRED | FIT | k1/k2/k3 repeat solution counting; 1 notation row |
| ti-05-02 | KEEP | SUFFICIENT | FIT | coherent conversion/selection/count/transfer sequence; no current math, choice, progression, or duplicate finding |
| ti-05-03 | REVISE | SUFFICIENT | FIT | 2 feedback notation rows; semantic trap treatment is sound |

## Bounded implementation packets

### TI-A — mathematical domain truth (release-blocking)

Owners: `ti-02-03`, `ti-04-03`.

The course cancels `sin θ`, `tan θ`, or `cos θ` while presenting the simplified statement as unrestricted. The repair must establish the common domain before cancellation, preserve excluded values in every proof step, and keep evaluators, feedback, and accessible narration synchronized. This is the reason for both `ESCALATE` decisions; it should be fixed as one proof-domain contract, not as scattered wording edits.

### TI-B — shared structured math rendering

Current evidence contains **116** `MATH_PRESENTATION_RESIDUE` rows across **14** lessons. Concentration is highest in `ti-04-01` (34), `ti-04-03` (20), `ti-04-02` (16), and `ti-01-02` (15). Repair the parser/semantic boundary by notation family—general-solution ladders, squared identities, double-angle expressions, and feedback formulas—then reopen every consumer and verify visual plus screen-reader output. `ti-05-02` is the only lesson with zero current math-presentation row.

### TI-C — cue-resistant choice construction

Five current choice rows require bounded repair:

- `ti-01-01/k3`: correct general solution materially longer than distractors;
- `ti-01-02/k2`: correct option alone contains the merge explanation;
- `ti-02-02/k3`: correct choice is the only numeric-only option;
- `ti-02-03/k1`: correct option explains that the proof is complete;
- `ti-03-02/k3`: correct option alone includes a full parenthetical justification.

All options should express one parallel answer unit, use misconception-based distractors, and move explanations to feedback.

### TI-D — progression and question-job diversity

The detector reports **2** rows (`ti-03-01`, `ti-03-02`). The semantic review adds `ti-05-01`, where three consecutive checks all ask for the number of solutions. Replace repeated evaluation/count surfaces with exact-form construction, factor-tree building, graph/branch matching, sign-error diagnosis, or explanation. The change should preserve the existing scaffold rather than merely swapping numbers.

### TI-E — representation alignment

All **30** authored concept figures currently report `RENDERS`; the issue is not missing artwork. `ti-02-02` nevertheless requires a replacement because its cofunction/reflection interaction does not carry the Pythagorean derivation it claims to teach. Use a synchronized unit-circle equation or right-triangle derivation. Stepwise domain annotations are preferred in `ti-02-03` and `ti-04-03`, and simultaneous branch/level visualization is preferred in `ti-05-01`.

### TI-F — standards authority boundary

The cards reference **90** candidate standards edges (six per lesson). This assessment does not approve them. Exact-source, full-intent standards review remains a separate authority and cannot be inferred from a `KEEP` lesson decision.

## Evidence and validation

- Candidate: `reports/closure/candidates/S246_TRIG_IDENTITIES_EQUATIONS_TRIPLE_DISPOSITIONS.jsonl`
- Validator: `reports/closure/candidates/validate-s246-trig-identities-equations-triple-dispositions.mjs`
- Validator result: **PASS**
- Append simulation: all **15** candidate records resolve to `CURRENT_HUMAN_DECISION` against the live shared review basis
- Exact lesson/card/course order: **15/15**
- Generic queue rows currently present: exactly one of each of the three streams per lesson

Authority boundary: only a root-reviewed append through the bounded lesson-review candidate appender, followed by serial queue/card/cache regeneration, can make these dispositions authoritative.
