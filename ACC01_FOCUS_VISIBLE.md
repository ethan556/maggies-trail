# ACC-01 — THE FOCUS RING THE APP DESIGNED AND THEN SWITCHED OFF

**Evidence:** `reports/acc/ACC01_ACCESSIBILITY_MATRIX.md` row d1 · **Gate:**
`src/components/focusVisible.s242.test.ts` · **Date:** 2026-08-16

## The finding

`ACC01_ACCESSIBILITY_MATRIX` called this *"the one clean Level-AA failure, one token wide"*, and it
is the last of the matrix's three headline rows still open. (`openReading` reach was fixed at
`a5aa97b`; the `LabReadout` colour-only channel was rewritten alongside ENG-01 R2.)

The app **has** a designed focus indicator:

```css
:focus-visible { outline: 3px solid theme(colors.sky); outline-offset: 2px; }
```

The failure is not its absence. It is local suppression.

```
ui.tsx  BTN_BASE = "… rounded-card font-bold focus-visible:outline-none …"
```

No replacement, and at specificity (0,2,0) it beats the global rule's (0,1,0). **Every `<Button>`
and `<ButtonLink>` in the app had no visible focus indicator** — WCAG 2.4.7, Level AA.

## Why the token was there, and why deleting it needed a second fix

The global rule also carried `border-radius: 4px`. That sets the radius of the **focused element**,
not of the outline — so every `rounded-card` button, input and tile visibly squared off the moment
it took focus. Browsers already draw an outline following the element's own border-radius, so the
declaration bought nothing and deformed everything. It is almost certainly why someone reached for
`outline-none` on the buttons in the first place.

Both are fixed: the radius override is gone from `globals.css`, and `BTN_BASE` no longer suppresses
the ring. The fix **deletes a token rather than adding a parallel Tailwind ring** — the app already
has one designed indicator, and a second would drift from it.

## Sweeping for the class, not just the instance

Row d1 was found by reading, so the token was swept for across all of `src/`:

| site | what stood in for the outline | verdict |
|---|---|---|
| `ui.tsx` shared `<Button>` | nothing | **bare — fixed** |
| `numberLineRay.tsx:536` constant input | nothing | **bare — fixed** |
| `widgets.tsx` lab number inputs **×9** | `focus:border-sky` — a border colour change alone | weak — brought onto the app's `focus:ring-2 focus:ring-sky/25` pattern, which a sibling input four lines away already used |
| `widgets.tsx:17784`, `CatalogClient`, `Atlas`, `OnboardingFlow` | `focus:border-sky focus:ring-2 focus:ring-sky/25` | passing, unchanged |

The second bare suppression is the point of sweeping: reading found one, and the token found two.
The nine border-only inputs are not a 2.4.7 failure — a border going from `ink/20` to `sky` is
visible — but they were inconsistent with the app's own pattern in the same file, and consistency
here costs one class each.

## The gate

`focusVisible.s242.test.ts` asserts that any declaration removing the outline names a replacement
**in the same class string or CSS rule**, so a ring three elements away cannot excuse a bare
suppression. It also pins the global rule: `outline: 3px solid` present, `border-radius` absent.

**Deliberately a source sweep, not a render.** `:focus-visible` styling is not observable in jsdom,
so a rendering test would report a clean pass on a broken app. Reading what the class string *says*
is what catches a one-token regression.

**Verified to discriminate.** Re-adding `focus-visible:outline-none` to `BTN_BASE` turns the gate
red and naming the exact line; removing it turns it green. A detector never observed failing is not
evidence.

**One false positive, caught and fixed.** The first cut stripped comments per line and flagged the
three block comments in this packet that quote `outline-none` while explaining the rule — a detector
that fails on its own documentation. Block comments are now blanked across the whole file first,
newlines preserved so reported line numbers stay true.

## What remains in ACC-01

Row §5(f)'s SVG half: ~34 sites where colour is the only channel for "you are at the target". The
`LabReadout` half of that row is done. The matrix notes these are the same sites as the
answer-on-screen work, so the remaining ones need the R1/R2 tone gating read alongside them rather
than a separate pass.
