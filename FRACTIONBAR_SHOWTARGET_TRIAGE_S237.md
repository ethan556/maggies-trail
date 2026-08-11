# fractionBar `showTarget` — triage for ruling

**Handover §4 item 4.** No content was edited. This is the list, per the S237 ruling to triage
first and bring back a proposal. Row-level detail is in `FRACTIONBAR_SHOWTARGET_TRIAGE_S237.csv`.

| Verdict | Instances | Meaning |
|---|---:|---|
| **HIDE** | 42 | The target must be computed. Showing it is the answer. |
| **CONTESTED** | 8 (4 prompts) | The target's *value* is given; only the fraction notation is the work. Needs your call. |
| **KEEP** | 46 | The prompt already states the target. Showing it is restatement, not a giveaway. |
| ALREADY_HIDDEN | 5 | Authored `showTarget: false`. No change. |

101 total; 96 inherit the permissive default, as recorded.

---

## What the target actually reveals

Worth settling before ruling, because it changes the answer. With `showTarget: true`, `FractionBarW`
draws a second bar labelled `target`, segmented by `targetDen` and shaded to `targetNum`. So the
partition **and** the shading are on screen — a learner can read both numbers off the picture by
counting. And the SVG's accessible name states them outright:

```
`Your bar shows ${n} of ${d} parts shaded. Target is ${spec.targetNum} of ${spec.targetDen}.`
```

So for a screen-reader user the target is not a picture to interpret at all — it is the answer in
numerals. Any row ruled HIDE is leaking harder through the accessible channel than the visible one.

The engine already knows this. Its own comment says that when the target is named in the prompt,
"the reference bar and the live ✓ cue are hidden so the manipulative doesn't print its own answer" —
which is precisely the distinction below, already articulated by whoever wrote the 5 hidden items.

## The test used

**Is the target derivable from the prompt without doing the mathematics the step teaches?**

- Derivable → KEEP. "Build a bar cut into 4 equal pieces with 1 shaded: make 1/4" names its own
  target; drawing it restates the prompt.
- Not derivable → HIDE. "2/8 + 3/8. Build the answer on the bar" — the target *is* the sum.

Applied mechanically (fraction literals, mixed numbers, word forms like "a half", and `n ÷ m`
written as a rewrite task), then every HIDE row was read back. That reading produced the third
bucket, which the mechanical rule had wrongly folded into HIDE.

## The 8 contested — one question, four prompts

| Lesson | Target | Prompt |
|---|---|---|
| `g5f-01-01` | 3/4 | "3 sandwiches shared among 4 people. Build one person's share." |
| `g5f-01-04` | 7/8 | "7 metres of rope shared among 8 people. Build one share." |
| `g3f-03-01` | 6/6 | "Build a fraction that equals exactly one whole using sixths." |
| `g3f-03-04` | 5/6 | "A ribbon is cut into 6 equal pieces and 5 are used. Build the fraction used." |

In all four, **every digit in the target already appears in the prompt** — 3 and 4, 7 and 8, six
and one whole, 6 and 5. Nothing is computed. What the learner supplies is the *notation*: that
sharing 3 among 4 is written `3/4`, that "one whole in sixths" is written `6/6`.

`g5f-01-01` is not a random example — `ANSWER_ON_SCREEN_AUDIT_S237.md` names it as the case where
"a visible target is arguably the representation practice itself, not a giveaway". The triage
rediscovered it from the prompt text alone, which is some evidence the boundary is real and not an
artifact of how the rule was written.

**The question:** when a step teaches fraction *notation* for a quantity the prompt has already
fully specified, is a drawn target the practice or the answer?

- If **practice** → these 8 stay `showTarget: true`; 42 rows change.
- If **answer** → all 50 change, and `g5f-01` / `g3f-03` lose their worked reference.

I lean toward *practice* for these four, on the grounds that a learner who cannot yet write `3/4`
gains nothing from being unable to see it, and the misconception being trained against
(`3/4` vs `4/3`, `1/8` vs `7/8`) is about which number goes where — which the target bar shows and
the prompt does not. But it is your ruling, and it is the same ruling for all four.

## Recommended sequencing if the 42 are approved

1. Set `showTarget: false` on the 42 HIDE rows. Content-only; no engine change.
2. Confirm each of the 42 renders the reveal ghost — the engine draws a dashed fill line for
   hidden-target builds specifically so a wrong answer still gets a correction. It is only wired
   for `showTarget: false`, so the 42 gain it rather than lose anything.
3. Re-run schema + pedagogy, then read back a sample of the 42 at both settings.
4. `g4x-01-01`…`g4x-03-02` (12 rows) are one repeated family — the entire grade-4 "multiply a
   fraction by a whole number" sequence — and should move together or not at all.

## Not done here

No content edited, no engine edited, no queue regenerated. The accessible-name asymmetry noted
above (numerals spoken, picture shown) is a separate defect that survives whichever way this is
ruled, and is not fixed by flipping the flag.
