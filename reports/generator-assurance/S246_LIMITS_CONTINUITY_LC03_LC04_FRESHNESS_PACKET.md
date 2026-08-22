# S246 Limits & Continuity `lc-03` / `lc-04` Freshness Packet

## Scope and census

This bounded packet closes the two adjacent `g12-limits-continuity` chapters after the verified `lc-02` frontier. It changes no authored lesson or shared evidence.

| Chapter / form | Preserved surface | Consumers | Mathematical states |
| --- | --- | ---: | ---: |
| `lc-onesided__numeric` | numeric | 2 | 12 |
| `lc-onesided__mcq` | MCQ | 2 | 12 |
| `lc-infinity__numeric` | exact-number lab | 4 | 12 |
| `lc-endbehavior__mcq` | MCQ | 4 | 12 |
| `lc-continuity__numeric` | exact-number lab | 2 | 12 |
| `lc-continuity__mcq` | MCQ | 2 | 12 |
| `lc-discontinuity__numeric` | numeric | 2 | 12 |
| `lc-discontinuity__mcq` | MCQ | 2 | 12 |
| `lc-ivt__numeric` | exact-number lab | 2 | 12 |
| `lc-ivt__mcq` | MCQ | 2 | 12 |
| **Total** |  | **24** | **120 form-specific states** |

## Mathematical contract

- One-sided work selects only the stated branch and keeps matching and disagreeing side cases distinct.
- Infinite limits distinguish lower, equal, and higher numerator degree before using coefficient signs or ratios. Numeric equal-degree cases include positive and negative finite limits.
- Continuity decisions require existence and equality of the two-sided limit and function value; parameter tasks compute the boundary value from the approaching branch.
- Discontinuities separate removable holes, jumps, and vertical-asymptote behavior. Hole heights are recomputed after exact factor cancellation.
- IVT conclusions require a continuous closed interval plus an actual endpoint sign change. The theorem guarantees at least one interior root, never uniqueness.

No generated prompt introduces raw caret notation; powers use learner-facing superscripts.

## Assurance

The focused gate samples 280 direct seeds and 96 unseen resolver seeds per form. It requires exactly 12 prompts and 12 prompt-derived truth states, deterministic replay, schema validity, preserved numeric/MCQ/lab surfaces, one defensible shuffled MCQ answer, unique diagnostic traps, and bounded option-construction spread.

The independent solver reads only visible prompt data. Adversarial cases reject a one-sided request paired with the wrong branch, mismatched continuity boundaries, non-canceling hole factors, a claimed jump with equal side limits, and an IVT conclusion without a sign change. Boundary tests cover numerator degree below, equal to, and above denominator degree, including negative unbounded behavior.

## Verification

- Focused packet: 5/5 tests pass.
- Integrated `lc-01` through `lc-04` packets: 14/14 tests pass.
- Existing generator gate filtered to `g12-limits-continuity`: 28/28 tests pass.
- Resolver: every `lc-03` and `lc-04` consumer passes; its sole expected failure advances to untouched `lc-05-01.json/k1` / `limits-continuity__lc-avg-rate__numeric`.
- TypeScript and diff integrity pass. Targeted lint reports 0 errors and only the pre-existing authored-template `any` warning.
