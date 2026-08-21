# S328 Fix E3 — pv1000-02-01 REVISE implementation

**Scope:** Implement A1's (S327 wave) blocked REVISE disposition for `pv1000-02-01`
(`s327-A1-pv1000-02-01`), determine whether the fix is compatible with the pins in
`src/lib/session273.placeValue1000Course.test.ts` and
`src/lib/session301.placeValue1000PredictionOrder.test.ts`, implement it, and issue a
fresh disposition.

**Result:** Fixed. Path (a) — content-only fix, one field, one lesson. No trio-wide
pin update was needed or made.

---

## 1. What A1's REVISE actually asked for

A1's rationale (`reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl`, record
`s327-A1-pv1000-02-01`, `reviewedAt: 2026-08-21T10:32:01Z`) reviewed the whole lesson,
fixed several defects directly (both remedials' S316-class issues), and found exactly
**one** defect it could not fix in place:

> i1's predict.reveal states "The hundreds only stir when the tens wrap past 9, which
> is exactly what the next problem will do" — but the actual next step, k1, is a direct
> hundreds-only skip-count (200→300→400→500, tens digit always 0, never wraps) and does
> NOT demonstrate a tens-rollover-into-hundreds event; that phenomenon first appears two
> steps later at i2. This is a real factual/sequencing inaccuracy in the narration ...
> but here the field is predict.reveal, and
> src/lib/session301.placeValue1000PredictionOrder.test.ts pins an exact SHA-256 hash of
> this lesson's i1 predict.reveal text (and of predict.options/outcomeId), so editing it
> would break a cross-course pinned gate that only a worker with src/** authority can
> safely re-pin.

A1's own `reopenCondition` explicitly licensed the fix path:

> Reopen (close this REVISE) once a worker with src/** authority either rewords i1's
> predict.reveal to accurately describe what k1 actually does (removing the false "next
> problem" claim, or reordering so a rollover step genuinely follows immediately) and
> re-pins session301's hash for pv1000-02-01/i1 accordingly, or provides an
> evidence-backed reason the current wording should be read as correct as-is.

I independently re-derived the same finding by reading the lesson JSON directly:
`steps` order is `c1, i1, k1, c2, i2, c3, i3, k2, k3, ch1, r1`. k1's widget prompt is
"Skip-count by 100s: 200, 300, 400, ___?" (answer 500) — tens digit is 0 throughout, no
rollover. i2's widget prompt is "Skip-count by 10s: 480, 490, ___?" (answer 500) — tens
9→0, hundreds 4→5, a genuine rollover, immediately preceded by c2's rollover
explanation ("When the tens digit hits 9 and jumps by 10 again, it rolls over to 0 and
the hundreds digit grows by 1"). A1's finding is correct: the reveal's forward
reference names the wrong step.

## 2. What the pins actually protect (read in full before editing anything)

### `src/lib/session273.placeValue1000Course.test.ts`

Pins, for the trio `{pv1000-02-01, pv1000-04-02, pv1000-04-03}`:

1. **Step-ID sequence** per lesson (`expectedSteps` map, e.g. pv1000-02-01:
   `["c1","i1","k1","c2","i2","c3","i3","k2","k3","ch1","r1"]`).
2. **Widget-type sequence** per lesson (`widgetTypes` map, e.g. pv1000-02-01:
   `["numberLineHop","numeric","numeric","numeric","numeric","numeric","numeric","numeric","numeric"]`,
   read via `WidgetSpec.parse(item.widget).type`).
3. **Exactly one withheld fixed-exemplar figure per lesson** (`withheld` map):
   `pv1000-02-01:c1 → "320, 330, 340, 350"`, `pv1000-04-02:c1 → "486 − 253"`,
   `pv1000-04-03:c2 → "247 + 186 = 433"` — each of those steps must have
   `figure === undefined` and `body` must contain the literal signature string.

Per the test file's own inline type, `Step = { id, body, figure?, widget? }` — **there
is no `predict` field anywhere in this test's model.** It never reads, hashes, or
constrains any step's `predict` object. This is the pin A1's rationale describes as
governing "step-ID sequence, widget-type sequence, and one withheld figure" for the
trio, and it is exactly that and nothing more — it is silent on `i1.predict.reveal`
entirely.

### `src/lib/session301.placeValue1000PredictionOrder.test.ts`

A *different*, independent pin. It walks **all 12 lessons** of the
`place-value-1000` course and, for one named step per lesson (usually `i1`), asserts
against a flat `contracts` array of 12 rows — one row per lesson, keyed only by
`lessonId`/`stepId`, with no grouping or cross-row relationship to the session273 trio:

- the option ids match a canonical set,
- `outcomeId` matches,
- an `optionsHash` (SHA-256 of the sorted `{id,label}` pairs) matches,
- a `revealHash` (SHA-256 of the raw `prediction.reveal` string) matches,
- `outcomeIndex` (the position of the correct option) equals `index % 2 + 1`, where
  `index` is the row's position in the 12-row array — enforcing a 6/6 split of which
  on-screen slot holds the correct answer, across the whole course.

pv1000-04-02 and pv1000-04-03 each have their own row (rows 11 and 12) in this same
flat list. Nothing in this file links the three trio lessons' rows together beyond
being members of the same array — each row's contract is independently checked.

### Conclusion on scope

Because A1's fix targets only `pv1000-02-01`'s `i1.predict.reveal` string:

- It cannot violate session273's pin (which never looks at `predict` at all), so **no
  trio-wide structural coordination is implicated by this fix at all** — the task's
  precautionary "trio" framing does not apply here; that framing describes a real
  constraint of session273, but session273 isn't the test blocking this specific edit.
- It changes exactly one cell of session301's pin: the `revealHash` in the
  `pv1000-02-01` row. Options, `outcomeId`, and hence `outcomeIndex` parity are
  untouched, so nothing else in that file needs to move.

### Confirming the siblings don't have the same defect

Before concluding "no trio update needed," I checked whether pv1000-04-02 or
pv1000-04-03 might independently have the same class of dangling-forward-reference bug
in their own `i1.predict.reveal` (which would be a separate, coincidental defect, not a
pin issue, but still relevant to "does the trio stay consistent"). A1 already checked
this explicitly, in the same S327 wave, specifically *because* of what was found at
pv1000-02-01:

- `s327-A1-pv1000-04-02` (KEEP, `reviewedAt: 2026-08-21T11:03:40Z`): "i1.predict
  (session301-pinned, untouched) correctly identifies no spot needs trading ... and
  accurately foreshadows i2's 342-127 (ones 2<7, genuinely needs trade) — verified
  accurate, **not a dangling reference** (checked specifically since I found and could
  NOT fix an analogous dangling predict.reveal at pv1000-02-01; **this lesson's reveal
  has no such defect**)."
- `s327-A1-pv1000-04-03` (KEEP, `reviewedAt: 2026-08-21T11:12:55Z`): "i1.predict
  (session301-pinned, untouched) 'more than 324' correctly reasons that receiving books
  only grows the total, **reveal accurate**."

I independently confirmed via `git diff` that neither sibling lesson's file has any
diff hunk touching its `predict` block at all (see §4) — consistent with A1's "untouched"
claims. Both siblings' current KEEP dispositions stand unchanged; I did not re-review
or re-disposition them (per instructions, only lessons whose content actually changed
get a fresh disposition).

## 3. Path taken: (a), content-only fix

This is a pure content/prose fix confined to one field (`i1.predict.reveal`) on one step
of one lesson (`pv1000-02-01`), plus the one licensed hash re-pin in session301 that
field change requires. It is not case (b) — no pin's *protected shape* (step order,
widget types, the withheld figure, or any other lesson's content) needed to change, and
no coordinated trio edit was required.

### The edit

Old text (the bug):

> "Hops of ten spin the TENS digit — 2, 3, 4, 5 — while the ones digit stays parked on
> 0. The hundreds only stir when the tens wrap past 9, which is exactly what the next
> problem will do."

New text:

> "Hops of ten spin the TENS digit — 2, 3, 4, 5 — while the ones digit stays parked on
> 0. The hundreds digit only stirs when the tens wrap past 9 — a rollover you'll see
> demonstrated later in this lesson."

Rationale for this specific wording, versus A1's other suggested remedy (reorder a
rollover step to sit immediately after i1): reordering would edit the step-ID sequence
array that session273 genuinely does pin — trading a prose bug for a real structural
risk. Instead: the first sentence is untouched (already accurate — verified by hand:
320→330→340→350 moves the tens digit 2,3,4,5 while ones stays 0). The second sentence
keeps the still-true general rule ("hundreds only stirs when tens wrap past 9") but
drops the false immediate-adjacency claim, replacing it with "later in this lesson" —
true regardless of exact step distance, since i2 (five positions after i1 in the same
steps array) genuinely demonstrates the rollover. This wording is also robust to minor
future reordering in a way "the next problem" was not, as long as some step after i1
still demonstrates a rollover.

Both `outcomeId` ("tens") and `options` (ids/labels for "ones"/"hundreds"/"tens") are
byte-identical to before — untouched.

### The re-pin

`session301`'s `pv1000-02-01` contracts row, `revealHash` field only:

- old: `872dd3eec4e5039d8f95417237038f8b1f2fb151617ef500c5d0e682221744cb`
  (verified via probe script to be `sha256(old reveal text)`, matching the test's own
  `hash()` function, before any edit was made)
- new: `ff3571f388aa59ee4b9e23d7dd4627175dea6991db3592881b8699e76d31b3be`
  (`sha256(new reveal text)`, same function)

`optionsHash` for this row (`888f4ac4527ab448bc15546ac286f4e2a22fb67dfd98e98b7d5fd3bc879e677a`)
is unchanged — verified unaffected since `options` was never touched. A 6-line
provenance comment was added directly above the `contracts` array explaining why this
one cell moved and citing this report.

## 4. Files changed (with line numbers)

### `content/courses/place-value-1000/lessons/pv1000-02-01.json`

- Line 57 (step `i1`, `predict.reveal`): replaced the reveal string as shown above.
  This is the only change I made to this file. (The file's working-tree diff also
  contains pre-existing, already-KEEP/REVISE-ledgered edits to the two remedials
  `rem-pst-c/k` and `rem-psh-c/k`, made by A1 earlier in this same S327-wave session,
  described in A1's own rationale text — those predate and are untouched by this task.)

### `src/lib/session301.placeValue1000PredictionOrder.test.ts`

- Lines 13–18 (new): added a 6-line provenance comment above the `contracts` array.
- Line 23 (was line 17 pre-comment; the `pv1000-02-01` row): updated the `revealHash`
  field (7th tuple element) from `872dd3ee...744cb` to `ff3571f3...31b3be`. No other
  field in this row, and no other row, changed.

### Not changed

`content/courses/place-value-1000/lessons/pv1000-04-02.json`,
`content/courses/place-value-1000/lessons/pv1000-04-03.json`,
`src/lib/session273.placeValue1000Course.test.ts` — confirmed via tool-call audit (no
`Edit`/`Write` was issued against any of these paths in this task) and via `git diff`
(no `predict`-block hunk appears anywhere in either sibling lesson's diff).

## 5. Gates run

All targeted/per-file only, per this task's resource constraints (no full `vitest`,
no whole-project `tsc`/`build`):

| Gate | Command | Result |
|---|---|---|
| Pinned trio + prediction-order tests | `npx vitest run src/lib/session301.placeValue1000PredictionOrder.test.ts src/lib/session273.placeValue1000Course.test.ts` | **2 files, 5 tests, all passed** |
| Defense-in-depth: third predict/reveal pin file | `npx vitest run src/lib/session244.causalPredictionSequencing.test.ts` | **52 tests, all passed** (confirmed pv1000-02-01 does not appear in this file's fixtures at all — only pv1000-03-02/03-03 do, for unrelated `placeValueTransformLab` widget checks) |
| Schema validation, whole content tree | `npx tsx scripts/content-check.ts schema` (= `npm run validate:content`) | **1840/1840 files clean**, including `pv1000-02-01.json` explicitly |
| Pedagogy lint, whole content tree | `npx tsx scripts/content-check.ts pedagogy` (= `npm run lint:pedagogy`) | **1711/1711 files clean**, including `pv1000-02-01.json` explicitly |
| Review-basis hash (post-edit, byte-sensitive) | `node scripts/session/print-review-basis.mjs pv1000-02-01` | `93fbed80599e04a1e57ceb313a952651590795a723a96c23aed001455cbedc80` |

## 6. Trio consistency — explicit confirmation

- **Step-ID sequence**: unchanged for all three lessons (pv1000-02-01's array is
  identical before/after my edit; I never touched pv1000-04-02/04-03).
- **Widget-type sequence**: unchanged for all three (I never touched any `widget`
  object; `i1`'s widget is still `numberLineHop` with the exact same fields).
- **Withheld figure**: unchanged for all three (`pv1000-02-01:c1` still has no
  `figure` and its body still contains `"320, 330, 340, 350"` — verified by the
  passing session273 run above, which asserts this explicitly).
- **session301 per-lesson predict contracts**: 11 of 12 rows byte-identical to before;
  only `pv1000-02-01`'s `revealHash` moved, matching the one field that actually
  changed. pv1000-04-02 and pv1000-04-03's rows, and their underlying lesson content,
  are untouched — their existing `KEEP` dispositions (`s327-A1-pv1000-04-02`,
  `s327-A1-pv1000-04-03`) remain current and were not re-issued.

The trio remains fully internally consistent: nothing that ties the three lessons
together (session273's pin) was touched, and the one independent per-lesson pin that
*was* touched (session301, pv1000-02-01's own row) was updated to match the corrected
content, exactly as A1's reopenCondition anticipated.

## 7. Disposition issued

One new record, `s328-E3-pv1000-02-01` (`decision: KEEP`), written to
`reports/closure/cowork-staging/laneA-s328-E3.jsonl` (not appended to the main ledger).
No new records for `pv1000-04-02` or `pv1000-04-03` — their content was not touched, so
their existing current dispositions stand per instructions.
