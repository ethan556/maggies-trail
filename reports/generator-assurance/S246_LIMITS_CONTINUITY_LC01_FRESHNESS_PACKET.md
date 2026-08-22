# S246 Limits & Continuity `lc-01` Freshness Packet

## Scope and census

This packet closes the complete Chapter 1 generator family in `g12-limits-continuity` without editing authored lessons or shared evidence.

| Form | Preserved surface | Declared consumers | Mathematical states |
| --- | --- | ---: | ---: |
| `limits-continuity__lc-limit-idea__numeric` | numeric | 3 | 12 |
| `limits-continuity__lc-limit-idea__mcq` | MCQ | 1 | 12 |
| `limits-continuity__lc-read-limit__numeric` | numeric | 3 | 12 |
| `limits-continuity__lc-dne__mcq` | MCQ | 3 | 12 |
| `limits-continuity__lc-dne__numeric` | numeric | 1 | 12 |
| **Total** |  | **11** | **60 form-specific states** |

The jobs remain separate: approaching a value despite a displaced point, reading/evaluating a continuous graph, diagnosing disagreeing one-sided limits, and confirming existence when the one-sided limits agree.

## Assurance contract

The focused gate samples 280 direct seeds and 96 unseen resolver seeds per form. It ratchets exactly 12 distinct prompts and 12 independently derived truth states per form, deterministic replay, schema validity, response-surface preservation, unique numeric traps, exactly one defensible MCQ answer, shuffled answer positions, and bounded option-length spread.

The independent solver uses only the visible prompt. Mutation cases show that it recomputes changed lines and limit values, rejects reversed approach data, rejects an alleged point-versus-limit distinction when the two values are equal, and rejects a DNE prompt whose one-sided limits actually agree.

## Verification

- Focused packet: 4/4 tests pass.
- Combined `lc-01` + `lc-02` packets: 9/9 tests pass.
- Existing generator gate filtered to `g12-limits-continuity`: 28/28 tests pass.
- TypeScript: passes.
- Targeted lint: 0 errors; the one remaining `any` warning predates this packet in the authored-template import.
- Full resolver: all `lc-01` consumers pass and advances through Chapter 2; the next untouched frontier after the adjacent packet is `lc-03-01.json/k1`.
