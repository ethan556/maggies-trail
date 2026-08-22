# S246 coordinate-area visual replacement packet

## Scope

This bounded packet replaces the generic `asv-coord-area` illustration in the two
coordinate-polygon lessons with four lesson-specific visual explanations:

| Lesson step | Figure | Instructional job |
|---|---|---|
| `asv-03-02#c1` | `asv-coordinate-rectangle-area` | Read width and height as coordinate differences, then multiply to obtain area 8. |
| `asv-03-02#c2` | `asv-coordinate-right-triangle-legs` | Identify horizontal and vertical legs and connect them to one-half base times height. |
| `asv-03-03#c1` | `asv-coordinate-composite-setup` | Separate the attached rectangle and triangle without revealing the following calculated answers. |
| `asv-03-03#c2` | `asv-coordinate-composite-sum` | Combine the already-established areas by addition: 15 + 4.5 = 19.5 square units. |

The first three placements were suppressed blocklist rows. The fourth already rendered,
but its old 5-by-3 rectangle did not represent the composite conclusion beside it.

## Deterministic evidence

| Measure | Before | After | Delta |
|---|---:|---:|---:|
| Total placements | 3,825 | 3,825 | 0 |
| Rendering placements | 2,757 | 2,760 | +3 |
| Withheld placements | 1,068 | 1,065 | −3 |
| Fixed-exemplar suppressions | 932 | 932 | 0 |
| Blocklist suppressions | 136 | 133 | −3 |
| Registered figures | 1,884 | 1,888 | +4 |
| Unregistered placements | 0 | 0 | 0 |
| Adversarial REVIEW rows | 0 | 0 | 0 |

Evidence is regenerated in `reports/vis/VIS01_PLACEMENTS.csv`,
`FIGURE_TEXT_ADVERSARIAL_AUDIT.csv`, and
`src/lib/figureTextMismatchBlocklist.generated.ts`. The exact test ratchets now require
1,888 registered descriptions, 1,065 suppressed placements, and 133 blocklist bindings.

## Human visual and accessibility review

- All four SVGs use a readable grid, distinct shape colors, strong outlines, and labels of at least 10 px.
- Every SVG has a specific `<title>` that states the same quantities, relationship, and operation as the visible figure.
- Rectangle coordinates, differences, dimensions, and area agree: 6 − 2 = 4, 4 − 2 = 2, and 4 × 2 = 8.
- The triangle scaffold distinguishes `Δx` from `Δy`, marks the right angle, and states `A = ½ × b × h`.
- The composite setup depicts attachment and addition but does not expose 15, 4.5, or 19.5 before learners calculate them.
- The composite conclusion shows the calculated areas only after both component-area tasks.
- None of these figures appears on a check or challenge surface.

Rendered review PNGs are in `reports/vis/s246-coordinate-area-previews/`.

## Queue disposition

The three exact `ILLUSTRATION_REPLACEMENT` rows are ready to close after the consolidated
queue is regenerated. Lesson-level visual-disposition and standards rows remain open; this
packet makes no claim to close them.
