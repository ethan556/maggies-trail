# Phase 1E — Atlas label legibility

## Source-true issue

The optional Atlas `RegionMap` uses a `720 × 200` SVG with a `520px` mobile minimum width. Its
grade-band labels were 10 SVG units, so the narrow canvas rendered them at approximately
`10 × 520 / 720 = 7.2 CSS px`. The labels also inherited `fillOpacity={0.65 * dim}`: matched labels
were translucent, and a filtered-out label fell to 0.1625 opacity. The ordered region list remained
the correct semantic and keyboard alternative, but the visual map's orientation key was not
reliably legible.

## Bounded repair

- Raised all 14 grade-band labels to 14 SVG units and weight 800. Their narrow-canvas floor is
  approximately `14 × 520 / 720 = 10.1 CSS px`.
- Kept every label at full `currentColor` contrast. With the stage's ink `#22314f`, contrast is
  above WCAG AA 4.5:1 against both light-stage gradient endpoints.
- Preserved filter dimming on circles and trail marks. The map stays `aria-hidden="true"` and
  `role="presentation"`; `AccessibleRegionList` continues to carry region names, match state,
  counts, current state, and keyboard-native links.
- No course content, widget/schema contract, figure registry, queue, cards, cache, ledger, or
  generated evidence changed.

## Evidence

`RegionMap.accessibility.p1e.test.tsx` renders all 14 bands and ratchets label count/order, effective
mobile font size, weight, opacity, AA contrast, decorative-map semantics, and continued mark-only
dimming. Existing World Atlas surface tests cover the accessible ordered-list alternative and mode
equivalence.
