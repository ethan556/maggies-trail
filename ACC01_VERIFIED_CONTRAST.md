# ACC-01 §8(2) — THE CONTRAST RATIOS, COMPUTED · AND R1 ACROSS THE WHOLE LAB FAMILY

**Gates:** `src/app/contrast.s242.test.ts`, `src/components/widgets.generatedContracts.s242.test.tsx`
**Date:** 2026-08-16

Two named gaps closed, both of them promises made in earlier reports.

---

## 1. The contrast figures were documented but never verified

`ACC01_ACCESSIBILITY_MATRIX.md` §8 item 2, verbatim:

> **No browser rendered anything.** So: no computed contrast ratios — I report the values the tokens
> *document* at `globals.css:173-234`, **which I did not verify**.

Those values are load-bearing. They sit beside the tokens — `#5B6A86, 5.24:1 on paper (AA; was
4.16)`, `4.85 even on sky/10 tint; 5.48 under white`, `White labels: 5.48 / 7.26 / 5.21`,
`6.98 on paper`, `7.14 on night` — and each is the reason a reviewer stops worrying about 1.4.3.

**No browser is needed.** The tokens are literal sRGB triples, the surfaces are too, and `sky/10` is
deterministic alpha compositing. The WCAG 2.x relative-luminance formula does the rest.

### Result: every documented figure is correct

Ten claims transcribed from the comments, ten matches within 0.05. And the assertion that matters
more than the comments being right — **every text role clears 4.5:1 on the page background in both
modes**, and all three CTA fills clear 3:1 against the page (1.4.11).

### The near-miss worth recording

A first cut reported two disagreements, one of them a **Level AA failure**:

```
--sky-ink on a sky/10 tint:            source says 4.85, computes to 4.77
--tangerine-ink on a tangerine/10 tint: source says 4.75, computes to 4.49   ← below 4.5
```

That failure does not exist. `bg-sky/10` resolves to `rgb(var(--sky) / 0.1)` — the **brand hue** —
while `--sky-ink` is the separate AA text counterpart that sits *on* that tint. My tint model
composited the ink channel with itself. Reading `tailwind.config` before believing the number is the
only reason a phantom WCAG failure was not filed against a stylesheet that is, in fact, correct.

**Verified to discriminate:** dropping `--text-muted` to a lighter value turns the gate red with
both the mismatch (`5.24 → 2.86`) and the AA failure named separately.

---

## 2. R1 now covers the whole staged-reveal family

`GENERATED_CORPUS_CONTRACTS.md` scoped the generated-corpus R1 check to `exactNumberLab` and said
its six siblings "export the same shape of truth function and are the obvious next step". They do,
and this is that step:

| engine | generated declarations |
|---|---:|
| `exactNumberLab` | 338 |
| `affineRelationshipLab` | 39 |
| `geometricConstraintLab` | 38 |
| `placeValueTransformLab` | 29 |
| `proportionalReasoningLab` | 27 |
| `quotientReasoningLab` | 23 |
| `pointSetReasoningLab` | — |

All seven are now swept by the same differential: open every stage, reveal the verdict, and require
a stage whose value **is** the answer to appear more often afterwards than during work.

**628 answer-revealing stages found across the family**, up from the `exactNumberLab`-only sweep —
which is the point of widening it. The contract holds on every one.

The count is asserted with a floor rather than an exact pin. Generators legitimately change how many
stages they build; only a *collapse* would mean the sweep had stopped looking, and that is what the
floor catches. A strict filter matching nothing is a green light for nothing.

---

## What §8 still holds

Items 1, 3, 4, 6 and 7 need what this environment does not have: a screen reader, a built stylesheet
with computed cascade winners, a keyboard walk, and a human reading for cognitive load. Item 2 is now
closed for colour; its sibling claims — pixel sizes at 320px, `textScale: xl` overlap, 200% zoom
reflow — still need a browser.
