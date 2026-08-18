# S246 Limits & Continuity `lc-02` Freshness Packet

## Scope and census

Chapter 2 deliberately crosses two generators. Four direct-substitution consumers stay on the mature `limit-laws` generator; eight factor-and-conjugate consumers use `g12-limits-continuity`. The packet preserves that boundary rather than duplicating the law engine.

| Generator / form | Preserved surface | Declared consumers | Case coverage |
| --- | --- | ---: | ---: |
| `limit-laws` default / product / `polySub` / `rationalSub` | numeric | 4 | at least 12 prompts per form |
| `limits-continuity__lc-factor__numeric` | numeric | 4 | 12 prompts / 12 truths |
| `limits-continuity__lc-rationalize__numeric` | exact-number lab | 3 | 12 prompts / 12 truths |
| `limits-continuity__lc-rationalize__mcq` | MCQ | 1 | 12 prompts / 12 truths |
| **Total** |  | **12** |  |

Factor cases vary both the removable point and remaining factor. Rationalizing cases vary the square-root constant from 1 through 144 while retaining exact conjugate structure and three-decimal evaluation. The MCQ conjugate is generated from the same visible expression, choices are shuffled, and competing methods are kept similar in construction and length.

## Assurance contract

The new factor-and-conjugate forms receive 280 direct seeds and 96 unseen resolver seeds per form, with exact deterministic replay, schema validation, prompt-only independent answers, 12 prompt/truth states, stable answer-ID agreement, unique numeric traps, one correct MCQ answer, and response-surface preservation. The existing `limit-laws` forms receive a separate 320-seed prompt-derived check and retain at least 12 genuine problem statements in each form.

Adversarial mutations reject a numerator factor that does not match the removable denominator and reject a radical constant that is not the stated square. Valid changed factor and radical prompts are recomputed rather than matched to a stored answer.

## Verification

- Focused packet: 5/5 tests pass.
- Combined `lc-01` + `lc-02` packets: 9/9 tests pass.
- Existing generator gate filtered to `g12-limits-continuity`: 28/28 tests pass.
- TypeScript: passes.
- Targeted lint: 0 errors; one pre-existing authored-template `any` warning remains.
- Full resolver: all Chapter 1 and Chapter 2 consumers pass. Its sole expected failure moves to untouched `lc-03-01.json/k1` / `limits-continuity__lc-onesided__numeric` (two distinct widgets).
