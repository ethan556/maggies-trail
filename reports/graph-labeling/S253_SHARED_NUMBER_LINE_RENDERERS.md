# S253 shared number-line renderer evidence

Date: 2026-08-18
Scope: `numberLinePlace` and `numberLineHop` in authored lesson steps plus remedial concept/check surfaces under `content/courses`.

## Exact consumer boundary

| Renderer | Consumers | Specialized surfaces |
|---|---:|---:|
| `numberLinePlace` | 63 | 18 fractional-placement lines |
| `numberLineHop` | 430 | 5 rational-hop lines; 1 hop-size line |
| **Total** | **493** | **24 specialized surfaces** |

The exhaustive regression discovers these consumers recursively and fails if the boundary changes. It parses every widget through `WidgetSpec`, renders every surface, and verifies the authored spec is not mutated.

## Root-cause repair

- Rebuilt both renderers around a complete responsive SVG line with a ruled guide field, equal minor ticks, 1–2–5 major spacing, both arrowheads, required endpoints, and exactly one origin label when zero is in range.
- Added compact collision-aware row placement for hop choices. The SVG height grows only when the complete label set needs another row, avoiding clipping at narrow widths.
- Rendered rational values as stacked fractions with visible fraction bars. Negative values use the mathematical minus sign (U+2212); no caret notation is emitted.
- Added optional schema fields `title`, `axisLabel`, and `unit`, each guarded against caret notation. Safe fallbacks remain truthful: `Number line`/`Number-line hops`/`Hop-size number line`, with `Position` or `Fraction` as the axis title.
- Kept visible and spoken information aligned. Accessible names report the title, axis/unit, range, scale labels, choices, current marker or stride, direction, hop count, and landing state.
- Preserved evaluator data and controls: stable widget IDs/specs, target values, hop arithmetic, radio choices, emitted events, native range keyboard behavior, and 44 px (`h-11`/`min-h-11 min-w-11`) touch targets.
- Honored reduced-motion preferences for hop animation.

## Deterministic evidence

New aggregate regression: `src/components/widgets.numberLines.s253.test.tsx`.

- PASS — 5/5 S253 tests across all 493 consumers.
- PASS — 190/190 focused legacy evaluator, rational, drag, absolute-distance, hop-size, and hop-arc tests.
- PASS — focused keyboard regression for `numberLinePlace` (1/1; 147 unrelated tests skipped).
- PASS — full TypeScript check.
- PASS — targeted ESLint with zero errors. The 27 reported warnings pre-exist elsewhere in the shared hot files; the new test is clean.
- PASS — `git diff --check` for the owned files.
- PASS — canonical `src/lib/content.test.ts` (12/12 tests); it ran in the same command as the audit below.

Two legacy presentation assertions intentionally remain incompatible with the current figure-labeling contract:

1. `widgets.numberLineScale.s237.test.tsx` parses SVG text with JavaScript `Number()` and therefore rejects the required U+2212 negative endpoint.
2. `widgets.labelCollision.s237.test.tsx` expects an endpoint (`60`) to be hidden and expects ASCII `-10`; the current contract requires both endpoints and the mathematical minus sign.

These are stale assertions, not learner-visible defects. The new exhaustive test ratchets the replacement requirements directly.

The canonical modeled-widget solvability audit is currently red on 36 pre-existing `fractionBar` dead-feedback findings in Grade 4 and one pre-existing `dilationExplore` finding. It reports no number-line finding. Those content defects were outside this shared-renderer packet.

## Residual inventory

- All 493 existing consumers currently use truthful shared fallback titles/axes because this bounded packet did not edit lessons. Course-specific context and units can be authored incrementally through the new optional fields without further renderer work.
- Lesson-specific instructional copy and mathematical context remain content-authoring work; the renderer does not invent a unit that the source does not establish.
- No evaluator, lesson JSON, queue, card, cache, ledger, standards, landing-page, commit, deployment, or shared review-authority artifact was changed in this packet.
