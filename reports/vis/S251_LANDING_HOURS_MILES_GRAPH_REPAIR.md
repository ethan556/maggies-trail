# S251 landing hours–miles graph repair

Status: **PASS — landing-only implementation and focused evidence complete**

## Scope and evidence boundary

- Input screenshot: `reports/vis/S251_LANDING_WIDGET_INPUT.png`
- Screenshot SHA-256: `84f79aa66bf44c64de19b4ce821fcfd9e42f5791de55f125fa114e7b09d439c2`
- Exact owner: `src/components/LandingHero.tsx`
- New focused suite: `src/components/LandingHero.graph.s251.test.tsx`
- Normative drawing instruction read in full: `C:\Users\Amusa\Downloads\FIGURE_LABELING_PROMPT.md`

The screenshot showed the landing hero at its narrow presentation: the table was legible, but the adjacent mini graph was a bare white plane with a floating line and point, no graph paper, no tick strokes or numerals, no explicit origin, tiny corner words `miles` and `hours`, no visible figure title, and no visible current ordered-pair label. The implementation was traced to `LandingHero`, which directly embedded the shared covariation renderer. This wave changes only the landing component and adds a focused test/report. It does not edit `src/components/widgets.tsx`, `src/components/widgets/covariationScrubber.tsx`, graph audit scripts, lesson JSON, queue, cards, or cache.

## Implemented drawing contract

- Full first-quadrant graph paper: minor lines every 1 hour / 4 miles, major lines every 2 hours / 8 miles, in grid → axes → data → labels order.
- Tick strokes at every grid position and major numerals `0, 2, 4, 6, 8, 10` and `8, 16, 24, 32, 40`; both scale endpoints are visible and the origin is labelled once.
- Axes have arrowheads, italic context variables `t` and `d`, and full titles `Time (hours)` and `Distance (miles)`.
- Visible title `Distance traveled over time` and a blue `d = 4t` line with eleven data marks from `(0, 0)` through `(10, 40)`.
- The current point has a dark-orange fill, ink outline, white separation ring, and a stateful visible label such as `(6 h, 24 mi)`; color is not its only state channel.
- The table now has a caption, scoped headers using the same variable/unit vocabulary, and `aria-current` on the synchronized row.
- Equation/readouts use `d = 4t`, `4 miles per hour`, and unit-bearing current-point notation. No caret or multiplication asterisk is learner-visible.
- The slider remains the keyboard-parity path and has an explicit stable name, stateful `aria-valuetext`, a 44 px control row, and synchronized context.
- The SVG is `role="img"` with a distinct accessible name and a stateful accessible description containing the same window, relationship, and current point shown visibly.
- The table/graph surface stacks below the small breakpoint and uses `min-w-0`, a responsive SVG viewBox, `width: 100%`, automatic height, and internal label coordinates within the 460×320 viewBox.

## Accessibility audit

**Standard:** WCAG 2.1 AA | **Date:** 2026-08-18

### Summary

**Input issues found:** 7 | **Critical:** 1 | **Major:** 5 | **Minor:** 1 | **Open in repaired scope:** 0

### Findings and disposition

| #   | Input issue                                                                             | Criterion / graph rule | Severity | Repaired disposition                                                    |
| --- | --------------------------------------------------------------------------------------- | ---------------------- | -------- | ----------------------------------------------------------------------- |
| 1   | Bare coordinate plane; no graph paper or readable scale                                 | 1.3.1, A6–A8           | Critical | Minor/major graph paper, aligned ticks and major numerals added.        |
| 2   | Origin and both scale endpoints were only inferable                                     | 1.3.1, A5, A8          | Major    | Single visible `0`; 10-hour and 40-mile endpoints labelled.             |
| 3   | Corner captions omitted variable vocabulary and units                                   | 3.3.2, A11–A12         | Major    | Full `Time (hours)` and `Distance (miles)` axis titles added.           |
| 4   | Current point had no visible value label                                                | 1.3.1, D1              | Major    | Stateful `(t h, d mi)` label and unit-bearing readout added.            |
| 5   | SVG accessible label lacked the visible scale/window and separate description semantics | 1.1.1, 4.1.2, E7, E9   | Major    | Distinct title/name plus stateful `aria-describedby` description added. |
| 6   | Current table row relied primarily on pale blue fill                                    | 1.4.1                  | Major    | Border, bold weight, and `aria-current` supplement color.               |
| 7   | Narrow side-by-side composition made the plane too small for conventional labels        | B1–B3                  | Minor    | Responsive stack and fixed internal viewBox geometry prevent clipping.  |

### Color contrast check

| Element                 | Foreground | Background |   Ratio |                 Required | Result |
| ----------------------- | ---------- | ---------- | ------: | -----------------------: | ------ |
| Axes, ticks, labels     | `#22314F`  | `#FFFFFF`  | 12.96:1 | 3:1 graphics; 4.5:1 text | PASS   |
| Data line and marks     | `#2069BF`  | `#FFFFFF`  |  5.48:1 |                      3:1 | PASS   |
| Current point and label | `#BA4A00`  | `#FFFFFF`  |  5.16:1 | 3:1 graphics; 4.5:1 text | PASS   |

Gridlines are intentionally subordinate, non-load-bearing structure. Every value is recoverable from the high-contrast ticks/numerals, data ink, table, and accessible description.

### Keyboard and screen-reader behavior

| Surface          | Keyboard / pointer                                                 | Screen-reader contract                                                                             |
| ---------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Trip time slider | Native arrow-key slider; 44 px row; direct graph drag is redundant | `Trip time (hours)`, value text such as `6 hours, 24 miles`, context association                   |
| Graph            | Pointer drag over plot; slider provides full keyboard parity       | Image named `Distance traveled over time`; description gives axes, relationship, and current point |
| Table            | Reading surface                                                    | Caption, scoped unit headers, and current row state                                                |
| Check            | Native button                                                      | Existing polite result status retained                                                             |

## Verification

```text
npx vitest run src/components/LandingHero.test.tsx src/components/LandingHero.graph.s251.test.tsx --reporter=verbose
npm run typecheck
npx eslint src/components/LandingHero.tsx src/components/LandingHero.graph.s251.test.tsx
npx prettier --check src/components/LandingHero.tsx src/components/LandingHero.graph.s251.test.tsx
git diff --check -- src/components/LandingHero.tsx src/components/LandingHero.graph.s251.test.tsx reports/vis/S251_LANDING_HOURS_MILES_GRAPH_REPAIR.md
```

Observed:

- focused rendered/interaction/accessibility suites: **7/7 passed**;
- TypeScript: **passed**;
- focused ESLint: **passed**;
- Prettier: **passed**;
- shared widget and shared authority files: **untouched**.

The focused suite ratchets exact grid/tick counts, major labels and single-origin behavior, draw order, endpoints/data marks, axis titles, role/name/description, table header/current-row semantics, state synchronization at 6 hours/24 miles, responsive SVG contract, absence of carets, and load-bearing contrast.
