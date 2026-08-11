# Premium Experience Rebuild — S233 Adversarial Figure/Text Audit

## Direct answer

No replacement illustrations were created for the 942 placements suppressed in S232. Suppression was an accuracy safeguard, not visual completion. S233 keeps that distinction explicit.

The newly reported fraction screen also exposed a second mismatch: the illustration contained four equal and four unequal parts while the prose said “three” and “thirds.” Because the next learner action builds `1/4`, the durable correction is:

> A fraction only has a name when the pieces are EQUAL. Four unequal pieces are not fourths — they are simply four pieces.

The lesson source, narration, owning generator, runtime guard, regression test, accessible image description, DOM, and screenshot now agree on four/fourths.

## Expanded adversarial result

| Measure | Result |
|---|---:|
| Registered illustration IDs rendered and inspected | 1,871 |
| Illustration IDs currently used by lessons | 1,819 |
| Authored illustration placements inspected | 3,816 |
| Original fixed-exemplar mismatches withheld | 942 |
| Additional suspicious exact pairings withheld | 136 |
| **Total placements withheld pending a truthful replacement/review** | **1,078** |
| **Placements still rendered after the gate** | **2,738** |

The additional pass compares each illustration's accessible description with its accompanying title/body/prompt and flags three high-risk disagreement classes:

1. fraction or partition-count conflict;
2. opposing operation conflict;
3. disjoint worked-example numbers.

All 136 newly flagged pairings are blocked by an exact illustration-plus-text fingerprint. This is deliberately fail-closed: changing either the illustration binding or the prose invalidates the old fingerprint and forces the audit to evaluate the new pairing.

## Audit health

| Step | Health | Evidence |
|---|---|---|
| Reported fourths/thirds contradiction | **CLOSED** | Same-viewport screenshot and DOM show four parts with four/fourths prose. |
| Accessible description parity | **PASS** | Image description says four equal and four unequal parts; visible prose says four/fourths. |
| Complete placement inventory | **PASS** | 3,816 placements across 1,701 lessons. |
| Complete registered-asset render sweep | **PASS** | 1,871/1,871 registered illustrations render with accessible titles. |
| Fixed-placeholder guard | **PASS** | 954 placements checked; 12 truthful matches render and 942 mismatches do not. |
| Expanded adversarial guard | **PASS — CONSERVATIVE** | 136 additional suspicious exact bindings are withheld; zero unreviewed flagged bindings render. |
| Empty visual-shell prevention | **PASS** | The figure wrapper is omitted when its illustration is withheld; lesson text remains. |
| Focused regression suite | **PASS** | 5 files, 23 tests, including the exact thirds/fourths mutation. |
| Type safety | **PASS** | TypeScript typecheck. |
| Production build | **PASS** | Next.js generated all 57 routes. |

## Evidence

- `PREMIUM_REBUILD_SCREENSHOTS_S233/01-fourths-corrected.png`
- `FIGURE_TEXT_ALIGNMENT_AUDIT.csv`
- `FIGURE_TEXT_ADVERSARIAL_AUDIT.csv`
- `src/lib/figureTextMismatchBlocklist.generated.ts`

## Important limit

The safe runtime state is not the same as a fully illustrated curriculum. The 1,078 withheld placements need concept-specific assets or an evidence-backed KEEP decision before visual coverage can be called complete. Automated text/description checks catch explicit numeric and operation contradictions; they cannot prove every subtle pedagogical relationship in 2,738 bespoke rendered illustrations. Human visual review remains required for an absolute “always matches” claim.
