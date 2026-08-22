# S284 — Fractions Add figure-exact source closure

## Scope and baseline

- Course: `fractions-add` (Grade 5), clean at entry.
- Current source-sealed packet: 13 P0 `ILLUSTRATION_REPLACEMENT` rows across seven lessons.
- One separate `EXCELLENCE-fa-02-02` diversity row is outside this figure-only packet and remains
  unclaimed.
- Allowed writes: affected lesson JSON, guarded repair, aggregate regression, and this report only.

## Exact source dispositions

| Source rows | Count | Action |
| --- | ---: | --- |
| `fa-01-02/c1` | 1 | Rebound `fa-multiplier` to existing `fm-common-denom`, whose visible and ARIA model includes `1/3 → 2/6`. |
| `fa-03-01/c1,c2` | 2 | Fail-closed fixed fifths exemplar beside authored sevenths. |
| `fa-03-02/c1,c2` | 2 | Fail-closed fixed fifths exemplar beside authored sixths/tenths. |
| `fa-04-01/c1,c2` | 2 | Fail-closed the fixed `11/8 = 1 3/8` exemplar where the complete nearby numeric claim was absent or changed to `22/7`. |
| `fa-04-02/c1` | 1 | Fail-closed fixed `2 1/4 = 9/4` beside authored `2 3/5 = 13/5`. |
| `fa-04-03/c1,c2` | 2 | Fail-closed conversion exemplars beside mixed-number addition/carry/borrow claims. |
| `fa-05-01/c1,c2` | 2 | Fail-closed the fixed repeated-add exemplar because its full rendered claim includes `1 1/5`, which the nearby text does not consistently state. |
| `fa-05-02/c1` | 1 | Fail-closed fixed `3 × 2/5` beside authored `5 × 3/8 = 15/8`. |

Result: one exact semantic rebind and twelve explicit safe withholds. No attractive but contradictory
fixed exemplar remains attached. Stable lesson/step IDs, widgets, variants, evaluators, feedback,
and correct answers are unchanged.

## Evidence and residuals

- `scripts/session/s284-fractions-add-figure-exact-repair.mjs` is guarded and idempotent.
- `src/lib/session284.fractionsAddFigureExact.test.tsx` ratchets all 13 dispositions, visible/ARIA
  semantics for the retained model, and alignment of every remaining course figure placement.
- Source-compatible P0 figure closures: 13/13.
- Residual assessor-controlled rows and `EXCELLENCE-fa-02-02` remain open; no queue, review card,
  cache, ledger, standards, shared renderer, schema, or figure registry changed.
