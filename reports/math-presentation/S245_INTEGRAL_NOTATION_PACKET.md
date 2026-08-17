# S245 Phase 4 packet — integral notation

## Result

**PASS. The live integral-notation index is 27 → 0.** The repair is at the shared
`authoredMath` rendering boundary, so authored lessons and every generated seed receive the same
visible and accessible notation without duplicating content edits.

No evaluator, answer, lesson, widget, schema, figure, or generator-template field changed.

## Disposition of the 27 rows

| Disposition                   | Authored | Generated |  Total | Resolution                                                                                |
| ----------------------------- | -------: | --------: | -----: | ----------------------------------------------------------------------------------------- |
| Genuine integral-sign residue |       10 |         8 |     18 | Repaired at the shared parser boundary                                                    |
| Detector false positive       |        3 |         6 |      9 | Ordinary phrases such as “the integral of a rate” are no longer treated as ASCII notation |
| **Total**                     |   **13** |    **14** | **27** | **All closed**                                                                            |

The 18 genuine residues came from six bounded causes:

| Cause                                                             | Contract                                                                                                  |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Standalone `∫` match-pair labels                                  | An entire trimmed string equal to `∫` is notation; the same symbol inside prose remains prose             |
| A completed integral followed by `(for …)`                        | The island closes at the final differential; the usage note remains outside                               |
| `∫πf² dx`                                                         | π is treated as a constant beside an integrand, not as an ASCII word-boundary case                        |
| Legacy lower-bound glyphs `ᵦ` and `꜀`                             | Normalised to b/c only immediately after `∫`; they are not admitted as general subscript aliases          |
| Text integrands `rate`, `speed`, `top − bottom`, `something in u` | A closed vocabulary renders through `\text{…}` so words remain words in visual HTML and accessible MathML |
| Shared authored/generated reuse                                   | The boundary repair applies identically to all seeds; no generator fork was necessary                     |

## False-claim controls

- Arbitrary prose after an integral is still refused: `∫ speedy dt` and `∫ total distance dt`
  remain plain text.
- “The ∫ is a stretched S” remains prose because the symbol is not the entire string.
- “The integral of a rate gives change” remains prose and is no longer a detector finding.
- Textual integrands are emitted with KaTeX `\text`, never as products of italic letters.
- All new TeX parses without fallback and includes MathML for assistive technology.

## Queue evidence

Source seal: `66ac01f`.

| Index                                 | Before | After |                         Change |
| ------------------------------------- | -----: | ----: | -----------------------------: |
| `MATH_INTEGRAL_NOTATION_INDEX`        |     27 |     0 |                            -27 |
| `MATH_SYMBOLIC_DISPLAY_INDEX`         |    811 |   804 | -7 overlapping raw-symbol rows |
| Total mathematical-presentation queue |    941 |   907 |                            -34 |

The consolidated queue moved from 14,713 to 14,669 during this packet. Only 34 rows are
attributable to the integral repair; a concurrent ten-row progression/duplication reduction
accounts for the remainder.

## Verification

- Six parser/render test files: 97/97 pass.
- Corpus false-claim and word-boundary regression suites: pass.
- New S245 integral tests cover the six causes, negative cases, KaTeX parsing and MathML output.
- TypeScript: pass.
- Focused lint: zero errors; one pre-existing `no-explicit-any` warning remains in the report walker.
- Deterministic math-presentation reports regenerated: integral index contains header only.
- Consolidated queue regenerated from the current report set.
