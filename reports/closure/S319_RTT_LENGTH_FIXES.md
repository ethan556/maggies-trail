# S319 — right-triangles-trig mcq label-length parity fixes

**Worker:** bounded implementation worker (right-triangles-trig S319)
**Source contract:** `reports/closure/S318_LANEB_RIGHT_TRIANGLES_TRIG_ASSESSMENT.md` (REVISE list,
2 items)
**Scope:** exactly the 2 REVISE contracts named in S318 — pure `label` text edits inside existing
`options` arrays. No widget type change, no `figure` rebind, no `answer`/`correct`/`feedback`/
`explanationVariants` change, no `course.json` change, no other step touched.

## Files changed

- `content/courses/right-triangles-trig/lessons/rt-01-04.json` — `steps[i2].widget.options`
  (o2, o3, o4 labels)
- `content/courses/right-triangles-trig/lessons/rt-05-04.json` —
  `remedials[conceptTag=rt-choose-tool].check.widget.options` (o2, o3, o4 labels)

`git diff` confirms the only lines touched in each file are the three distractor `"label"` strings
(6 lines total across both files; verified via `git diff` — no other field, step, or record moved).

## Method

For each REVISE item, the correct option (`o1`) and all `feedback` strings were left byte-identical.
Only the three distractor `label` strings were lengthened, each with a **true** elaboration of the
wrong reasoning it already encoded — the underlying math was independently recomputed for every new
clause before it was added, and each new clause was checked against that option's own existing
`feedback` text for consistency (no misconception was changed to a different one).

## `rt-01-04` / step `i2` ("Route the conversion")

Prompt: "You know the LONG leg of a 30-60-90 triangle. What's the correct route to the hypotenuse?"
Correct route (`o1`, unchanged): divide the long leg by √3 to get the short leg, then double for the
hypotenuse. This is the lesson's own permanent ratio, 1 : √3 : 2.

| id | before | after | recomputed math for the new clause |
|---|---|---|---|
| o1 (correct) | "Divide by √3 for the short leg, then double to reach the hypotenuse" | *unchanged* | 1:√3:2 ratio, per lesson's own recap |
| o2 | "Divide by √3, then stop at the short leg" | "Divide by √3 to reach the short leg, then stop instead of doubling it" | long ÷ √3 = short leg is a **true** intermediate result; the misconception is stopping before the ×2 step, not the division itself — matches this option's own feedback ("go ÷√3 first, then double") |
| o3 | "Double the long leg before finding the short leg" | "Double the long leg first, overshooting the hypotenuse by a factor of √3" | 2 × (short·√3) = √3 × (2 × short) = √3 × hypotenuse — doubling the long leg overshoots the true hypotenuse by **exactly** a factor of √3 (verified algebraically) |
| o4 | "Add the legs before identifying the hypotenuse" | "Add the two legs directly, since legs never sum to the true hypotenuse" | short·(1 + √3) ≈ short·2.732 ≠ 2·short (the hypotenuse) for any short leg ≠ 0 — legs never sum to the hypotenuse except the degenerate case, matching this option's own feedback |

### Before/after stats (`rt-01-04` `i2`)

```
BEFORE
  o1: 67 chars (correct)
  o2: 40 chars
  o3: 48 chars
  o4: 46 chars
  ratio correct/max_distractor: 1.396
  spread (max-min): 27
  correct unique-longest: True

AFTER
  o1: 67 chars (correct)
  o2: 69 chars
  o3: 72 chars
  o4: 70 chars
  ratio correct/max_distractor: 0.931
  spread (max-min): 5
  correct unique-longest: False
```

## `rt-05-04` / remedial `rt-choose-tool` ("Dispatch once more")

Prompt: "You know all three sides of a triangle and want an angle. Which tool?"
Correct tool (`o1`, unchanged): Law of Cosines, solved for cos C — the only tool that digests SSS
with no known angle.

| id | before | after | recomputed math for the new clause |
|---|---|---|---|
| o1 (correct) | "Law of Cosines, solved for cos C" | *unchanged* | cos C = (a²+b²−c²)/(2ab), per this option's own feedback |
| o2 | "Law of Sines" | "Law of Sines, needing a known angle first" | Law of Sines (a/sin A = b/sin B) requires a known angle paired with its opposite side to anchor the ratio; an SSS triangle supplies zero angles — matches this option's own feedback ("Sines needs at least one known angle to anchor a pair") |
| o3 | "SOH-CAH-TOA" | "SOH-CAH-TOA, needing a guaranteed right angle" | the plain ratios (sin/cos/tan = opp/hyp etc.) are only valid in a right triangle; an arbitrary SSS triangle has no guaranteed right angle — matches this option's own feedback ("Without a guaranteed right angle the plain ratios don't apply") |
| o4 | "Area = ½·ab·sin C" | "Area = ½·ab·sin C, needing an angle already" | the area formula takes angle C as an input to produce area — it cannot be inverted to solve for an unknown angle from three known sides — matches this option's own feedback ("The area formula CONSUMES an angle; it can't find one") |

### Before/after stats (`rt-05-04` remedial `rt-choose-tool`)

```
BEFORE
  o1: 32 chars (correct)
  o2: 12 chars
  o3: 11 chars
  o4: 17 chars
  ratio correct/max_distractor: 1.882
  spread (max-min): 21
  correct unique-longest: True

AFTER
  o1: 32 chars (correct)
  o2: 41 chars
  o3: 45 chars
  o4: 43 chars
  ratio correct/max_distractor: 0.711
  spread (max-min): 13
  correct unique-longest: False
```

## Verification (scripted, both widgets)

- **Parse-clean:** both files load via `python3 json.load` with no error, before and after.
- **Exactly one `correct: true` per widget:** confirmed by script — `rt-01-04` `i2` has 1 (`o1`);
  `rt-05-04` remedial `rt-choose-tool` has 1 (`o1`).
- **Correct stays FIRST in authored order:** confirmed — `o1` is `options[0]` in both widgets,
  before and after.
- **Feedback untouched:** confirmed byte-identical via `git diff` (only `"label"` lines changed).
- **Which option is correct never changed:** `o1`'s `correct: true` flag and label text are
  byte-identical before/after in both files.
- **No meaning drift:** each new distractor clause is a mathematically true elaboration of the
  *same* wrong-step claim the original short label already made (verified against that option's
  own `feedback` string, which was left untouched and constrains what the label may legally say).
- **Length-spread target met:** both widgets now have all-four-option spread ≤ 15 chars
  (5 and 13 respectively) and the correct option is no longer the unique longest in either widget.
- **Scope:** `git diff --stat` shows only the 2 target files changed, 6 lines added / 6 lines
  removed total (3 label lines per file) — no other lesson, step, remedial, or `course.json` touched.

## Raw data

- Base commit: `992b59059ca038835dc594a2600f412fa48a6d0b`
- `sha256` before/after and full per-widget stats/preserved-fields ledger: see
  `reports/closure/cowork-staging/laneA-s319-rtt.jsonl` (2 NDJSON records, one per lesson).
- `npm`/`vitest`/`tsc` were not run per task instructions; all checks above are scripted
  parse/character-count/diff verifications only.
