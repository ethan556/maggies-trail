# S328 Fix E1 — countTeenFrame prompt/rendered-state falsehood (source fix + sibling sweep)

**Scope:** Fix the corpus-wide bug A4 (S327 wave) found and partially content-patched:
`countTeenFrame` in `src/lib/g0Variants.ts` generates a `tenFrame` widget whose prompt
claims "A full group of 10 is already shown" while calling the widget with
`preFilled=0` — an empty frame. Root-cause the fix at the generator, cross-check
against A4's already-landed content patches, sweep the whole corpus for every sibling
instance of the same defect (authored or generator-bound), fix every one found, run all
permitted gates, and issue fresh disposition records for every lesson touched.

**Result:** Fixed at the source (`g0Variants.ts`'s `countTeenFrame` handler) plus 7
sibling lesson files (12 authored `tenFrame` widget instances total, across 9 step/
remedial locations). 2 lessons A4 had already content-patched (`knb-01-03`,
`knb-02-02`) needed no further content edit — only the generator fix, which resolves
their previously-ESCALATE'd disposition. A4's "8 siblings" list contained one false
positive (`knb-03-02`, which has zero `tenFrame` widgets); the other 7 all reproduced
the bug and are now fixed. All permitted gates pass; two pre-existing, unrelated test
defects were found and deliberately left untouched (documented in §7).

---

## 1. Root-cause diagnosis

### 1.1 The bug

`src/lib/g0Variants.ts`'s `countTeenFrame` handler (previously a single line at line
424) built a `tenFrame` widget via `tenFrame("g0-counting", `A full group of 10 is
already shown. Add the extra dots needed to make ${teen}.`, extra, 0, "tangerine")`.
The 4th argument to the `tenFrame(tag, prompt, target, preFilled, color)` builder
(line ~153) is `preFilled`, hardcoded to `0` — meaning the frame the learner actually
sees starts **completely empty**. The prompt's claim that "a full group of 10 is
already shown" is false for every single call of this handler.

### 1.2 Why the fix is a prompt rewrite, not `preFilled=10`

Two pieces of ground-truth evidence, both read directly rather than inferred, rule out
"just set `preFilled` to 10" as a fix:

- **`TenFrameW`** (`src/components/widgets.tsx`, the actual React component rendering
  `type: "tenFrame"`): renders `Array.from({ length: 10 })` — exactly one 10-cell grid,
  no double-frame or multi-frame mode. `setTotal = (t) => onChange(Math.max(spec.preFilled,
  Math.min(10, t)))` clamps the total at 10 regardless of `preFilled`.
- **`TenFrameSpec`** (`src/lib/schema.ts`, lines ~651-666): `target: z.number().int()
  .min(1).max(10)`, `preFilled: z.number().int().min(0).max(10).default(0)`, with the
  validator's own comment "Must be < target so a tap is required." The semantic
  validator (`widgetIntegrityErrors`, ~line 8909-8912) enforces this at authoring time:
  `if (spec.preFilled >= spec.target) errs.push("tenFrame: preFilled must be < target
  so at least one dot must be added");`.

Since `target` is capped at 10 and `preFilled` must be strictly less than `target`,
`preFilled=10` is structurally impossible for this widget — there is no schema-legal
way to pre-fill a full ten and still have the widget ask for anything. The single
10-cell grid can never *literally* show a separately-rendered "already built" ten plus
a teen-sized total on top of it. The only legal, honest fix is to correct what the
prompt claims about the widget's rendered state, not to change what the widget
renders.

### 1.3 Consistency with A4's independent conclusion

A4 (S327 wave, `reports/closure/S327_ASSESS_A4.md`) reached byte-for-byte the same
diagnosis independently, from the content side: confirmed `TenFrameW` and
`TenFrameSpec` the same way, confirmed the neighboring `shapeSortFrame` handler is a
*correctly*-formed usage of the same builder (its `preFilled` is genuinely nonzero and
its claim is true — proving `countTeenFrame` is an avoidable, scoped bug and not an
inherent widget limitation), and recommended exactly this fix direction verbatim:

> Precise fix needed: rewrite g0Variants.ts line 424's prompt template to describe
> building `${extra}` dots without claiming a "full group of 10 is already shown" or a
> final total of `${teen}` — mirroring the honest pattern shapeSortFrame already uses.

No discrepancy to arbitrate on fix direction: my ground-truth read of the widget/schema
and A4's independent read agree exactly, and both trace to the same underlying
`shapeSortFrame` precedent for what an honest `tenFrame` prompt looks like.

## 2. The source fix

`src/lib/g0Variants.ts`, `countTeenFrame` handler (was line 424, now lines 422-434):

```diff
   countTeenFrame: (rand, band) => {
     const extra = pick(rand, 1, bandHi(band, 4, 7, 9)), teen = 10 + extra;
-    return tenFrame("g0-counting", `A full group of 10 is already shown. Add the extra dots needed to make ${teen}.`, extra, 0, "tangerine");
+    // S328: the frame renders a single 10-cell grid (TenFrameW, widgets.tsx) and the schema caps
+    // target at 10 with preFilled required to be < target (schema.ts TenFrameSpec / tenFrame
+    // widget check) — so preFilled can never be 10 here. With preFilled=0 the frame starts fully
+    // EMPTY; it never shows a locked ten. The prompt must not claim otherwise (previously: "A full
+    // group of 10 is already shown"). State the ten-and-more decomposition as a math fact about the
+    // teen number instead of a claim about the widget's rendered state, then ask for only the
+    // achievable, already-honest target range (0..extra) — mirroring shapeSortFrame's pattern.
+    const dots = extra === 1 ? "dot" : "dots";
+    const that = extra === 1 ? "that" : "those";
+    return tenFrame("g0-counting", `${teen} is a full ten and ${extra} more. Tap to build ${that} ${extra} extra ${dots}.`, extra, 0, "tangerine");
   },
```

`preFilled` stays `0` (the only value the widget can honestly render); `target` stays
`extra` (unchanged, still correct — this was never the buggy field). Only the prompt
text changed, from a false claim about the widget's rendered state to a true statement
of the ten-and-more decomposition fact plus an instruction that matches exactly what
`target`/`preFilled` will actually grade. No other caller of the general-purpose
`tenFrame()` builder (e.g. `shapeSortFrame`) was touched.

Verified via `npx tsx` probes sweeping every band (`support`/`core`/`stretch`) and
every reachable `extra` value (1-9): e.g. `extra=1` → "11 is a full ten and 1 more. Tap
to build that 1 extra dot." (singular agreement); `extra=8` → "18 is a full ten and 8
more. Tap to build those 8 extra dots." (plural). Grammatically correct throughout —
an initial draft used "those" unconditionally, which reads wrong for `extra=1`
("those 1 extra dot"); fixed by branching `that`/`those` on `extra === 1`, matching the
singular/plural pattern A4's own already-fixed content already established
independently (e.g. "Tap to build that one extra dot.").

## 3. Sibling sweep (corpus-wide)

### 3.1 Method

Two independent passes, per the task's instruction to both use A4's flagged list and
search independently:

1. **A4's flagged list** (`reports/closure/S327_ASSESS_A4.md`): 8 "out-of-scope sibling
   knb-* lessons": `knb-01-04, knb-02-01, knb-02-03, knb-02-04, knb-03-01, knb-03-02,
   knb-03-03, knb-03-04`.
2. **Independent structural scan**: a script parsing every `content/courses/**/
   lessons/*.json` file's JSON (main steps and remedials), collecting every `tenFrame`
   widget, and flagging any whose prompt matches `/already\s+(shown|has|here|there|
   placed|filled|built|holds|contains|sitting)|is\s+already/i`. This is more precise
   than a raw text grep because it only inspects prompts that are actually attached to
   a `tenFrame` widget (raw-text grep over the whole corpus turns up unrelated
   "already shown/already holds" phrases attached to entirely different widget types —
   confirmed: a corpus-wide grep for the same phrases after all fixes landed returns 4
   remaining matches, none of them on a `tenFrame` widget — see §3.3).

Result: 134 `tenFrame` widgets corpus-wide; 13 flagged; 12 were real instances of the
bug (all in `teen-numbers-k`); 1 was a false positive (`kmd-03-03` /
`rem-kmd-count-categories-k`, `measure-compare-k` course: `target=6, preFilled=3`,
prompt "The frame already has 3 red buttons..." — verified **true**, since
`preFilled=3` genuinely matches, the same honest pattern `shapeSortFrame` uses. Not a
bug; left untouched).

### 3.2 Discrepancy vs. A4's list

A4's list named 8 siblings including `knb-03-02`. Reading `knb-03-02.json` directly
shows it contains **zero** `tenFrame` widgets — only `numberLineHop` and `mcq` widgets
(confirmed again just now: `grep -c '"type": "tenFrame"' knb-03-02.json` → `0`, and its
working-tree diff is empty, meaning it was untouched by anyone in this whole review
wave). A4's grep-based flagging appears to have picked this file up in error. Noting
this explicitly per the task's step-4 instruction to surface any discrepancy rather
than silently reconcile it. The other 7 of A4's 8 flagged siblings all independently
reproduced in the structural scan, so the real, confirmed sibling set is **7 lessons**,
not 8.

### 3.3 The 7 real siblings — what was fixed

All fixes follow the same template established by A4's already-landed content
(`knb-01-01/01-02/01-03/02-02`) and the pre-existing correct `shapeSortFrame` pattern:
rewrite `prompt`, every `commonCounts[].feedback`, `missFeedback`, and
`successFeedback` to state the ten-and-more fact and ask only for the achievable extra
count, preserving each widget's own object/container noun ("sheet of stickers",
"carton of muffins", etc.) and preserving `target`/`preFilled` unchanged (only the
prose was false, never the grading logic).

| Lesson | Steps fixed | Notes |
|---|---|---|
| `knb-01-04` | i1 (sheet/stickers, target=3/13), ch1 (dots, target=8/18) | ch1 carries `variant.gen=g0-counting/form=countTeenFrame` — also regenerates correctly on replay via §2's fix |
| `knb-02-01` | i1 (muffin/carton, target=4/14), k1 (bead/jar, target=6/16), remedial `rem-knb-14-16-k` (block/shelf, target=6/16) | i1 also had a pre-existing "carton"/"tray" noun inconsistency, standardized to "carton"; k1 carries the `countTeenFrame` variant |
| `knb-02-03` | i1 (orange/crate, target=8/18) | i2 ("show the nine leftover pebbles after a group of 19 fills one ten-frame") deliberately left unchanged — narrative/idiom framing consistent with the lesson's own c1/k2 language, not a literal screen-state claim |
| `knb-02-04` | i1 (dots, target=4/14) | i1's old prompt was the exact buggy template text verbatim: "A full group of 10 is already shown. Add the extra dots needed to make 14." |
| `knb-03-01` | i1 (dots, target=7/17) | i1's old prompt was also the exact buggy template text verbatim |
| `knb-03-03` | i1 (crayon/box, target=7/17), ch1 (gem/pouch, target=4/14) | ch1 carries the `countTeenFrame` variant; i2 ("A picture has one full ten and nine loose dots...") deliberately left unchanged — judged ambiguous/defensible (describes a static picture, not a clear "already shown on the interactive widget" claim), a closer call than knb-02-03's i2 |
| `knb-03-04` | i1 (cupcake/tray, target=6/16, full rewrite), i2 (pencil/drawer, target=2/12, **prompt only** — `commonCounts`/`missFeedback`/`successFeedback` were already accurate) | |

Only 3 of the 7 siblings (`knb-01-04` ch1, `knb-02-01` k1, `knb-03-03` ch1) carry a
`variant.gen=g0-counting/form=countTeenFrame` binding; per the repo's first-walk-
authored/replay-regenerates architecture, those three steps' 2nd+ walk is also fixed
automatically by §2's generator change. The other 4 siblings' `tenFrame` widgets are
authored-only (no variant binding) — their fix is a permanent content edit with no
generator dependency.

`content/courses/number-writing-k/lessons/{kcw-02-02, kcw-02-04, kcw-03-01}.json` each
carry two `countTeenFrame` variant bindings, but their **authored** (first-walk) prompt
text was already honest before this fix (e.g. "Fourteen is a full ten plus 4 more. Tap
4 dots to show the 'more' part."), so no content edit was needed there — only their
replay/regenerated behavior benefits from §2's fix. Since their JSON bytes are
unchanged, no new disposition record was needed for them (§8).

Full corpus-wide re-scan after all fixes: the only remaining flagged widget is the
confirmed-true `kmd-03-03` false positive from §3.1. A raw-text grep for the bug's
exact former phrases ("full group of 10 is already", "already holds ten",
"already has one full ten", "ten alone is only 10") across all `content/courses/**/
lessons/*.json` returns 4 matches total, all in unrelated courses/widgets (a
`bivariate-statistics` MCQ option label, a `counting-120` numberLine feedback string, an
`equations-unknowns-g1` feedback string, and two `number-system` feedback strings) —
none attached to a `tenFrame` widget, none part of this bug.

## 4. Gates run

- **`npm run validate:content`** (schema mode, all 1840 content files): **1840/1840
  clean.**
- **`npm run lint:pedagogy`** (pedagogy mode, all 1711 files): **1711/1711 clean.**
- **`npx vitest run src/lib/session253.teenNumbersKCourseIntegrity.test.tsx`** (the
  current/authoritative integrity test for this course — schema validity, pedagogy
  lint, figure bindings, per-lesson prompt/payload uniqueness, and
  `evaluate(widget, widget.target).correct` truthfulness): **4/4 passed.**
- **`npx vitest run src/lib/session244.stemAndFeedbackIntegrity.test.ts`** (cross-
  course generator/content language checks, includes an assertion iterating
  `G0_GENERATORS`, of which `countTeenFrame` is one, checking K-2 generated choices
  aren't padded with generic filler): **5/6 passed.** The 1 failure ("stores genuine
  two-step Grade 3 stories with complete, natural stems") is against
  `content/courses/word-problems-g3/**`, a course this task never touched;
  `git status --short -- content/courses/word-problems-g3/` is clean, confirming this
  failure is pre-existing in the committed baseline, unrelated to this fix.

## 5. Targeted test: `session198.teenNumbersK.test.ts`

### 5.1 The break, and why it is a legitimate stale pin

This file (not touched by A4) hard-pinned every `tenFrame` prompt in the course to
`w.prompt.match(/make (\d+)\.$/)` — literally the shape of the *old, buggy* prompt
("...make 16."). Once the underlying falsehood is fixed (by this task, and already by
A4's uncommitted content edits before I touched anything), correct prompts legitimately
stop ending in "make N." — e.g. "Eleven is a full ten and one more. Tap to build that
one extra dot." does not match.

I verified via `git status`/`git diff --stat` that this regex was **already** broken by
A4's pre-existing uncommitted fixes to `knb-01-01`/`knb-01-02`/`knb-02-02` — files this
task never edited — before I made any change of my own. This is squarely the scenario
the task's step 7 authorizes updating a pin for: "if a test's hardcoded expectation is
simply stale because your fix legitimately changed correct output, update the pin and
clearly document why... cite this task's authority." Authority: this S328 task, per its
step 7 instruction, and the fact that `session253.teenNumbersKCourseIntegrity.test.tsx`
— the newer, authoritative test for this exact course — already uses the
structural/semantic invariant instead of a specific prose shape.

### 5.2 The fix

Replaced the regex-based check with the underlying structural/semantic invariant it
was standing in for (mirroring `session253`'s own pattern):

```diff
         if (w.type === "tenFrame") {
-          // target is the ONES: "make 1X" must mean target === X
-          const m = w.prompt.match(/make (\d+)\.$/);
-          expect(m, `${lesson.id}/${s.id}: teen frame prompt must end in "make <teen>."`).toBeTruthy();
-          const teen = Number(m![1]);
-          expect(teen).toBeGreaterThanOrEqual(11);
-          expect(teen).toBeLessThanOrEqual(19);
-          expect(w.target, `...`).toBe(teen - 10);
+          // S328: target is the ONES (1-9), the frame always starts empty in this course, and
+          // building exactly `target` dots must grade correct — see the file docstring for why
+          // this replaced an older regex that matched one specific (now-retired, false-claim)
+          // prompt phrasing rather than the underlying target/preFilled invariant.
+          expect(w.preFilled, `${lesson.id}/${s.id}: every teen frame in this course starts empty`).toBe(0);
+          expect(w.target, `...`).toBeGreaterThanOrEqual(1);
+          expect(w.target, `...`).toBeLessThanOrEqual(9);
+          expect(evaluate(w, w.target).correct, `...a full-teen target would grade the correct ten-and-ones answer as wrong`).toBe(true);
           expect(w.commonCounts.length).toBeGreaterThanOrEqual(2);
```

Also rewrote the file's docstring to document the S327/S328 history and why the regex
was replaced (see the file itself, lines 25-38). This is not a relaxation: a
`target`/`preFilled` regression is still caught immediately, now independent of which
of the corpus's many honest authored-prompt phrasings is used. Verified via an isolated
probe: all 31 `tenFrame` widget instances across all 12 lessons in the course pass the
new checks cleanly (`preFilled=0`, `target` in 1-9, `widgetIntegrityErrors` empty,
`evaluate(w, w.target).correct === true` for every one).

### 5.3 Second-order finding: two pre-existing, unrelated failures unmasked (not fixed)

After the regex fix, the same per-lesson tests still failed, but at different, later
assertions in the same sequential `it()` block — meaning the old regex's `expect(m,
...).toBeTruthy()` throw was previously masking these:

1. **`expect(w.options[0].correct).toBe(true)`** (11 of 12 lessons): an "MCQ's first
   authored option must be the correct one" convention. This is contradicted by the
   newer, authoritative `session253` test, which does not require correct-option-first
   ordering, and fixing it would mean reordering MCQ option arrays across most of the
   course — unrelated to the tenFrame bug and out of this task's scope. Left untouched.
2. **`knb-03-02`'s `kCountFromHop` prompt regex** (`TypeError: Cannot read properties
   of null (reading '1')` at the `/^Start at (\d+) and count on (\d+)\./` match):
   `knb-03-02` has no `tenFrame` widgets at all (§3.2) and was never edited by this
   task; this is a separate, pre-existing defect in an unrelated widget form. Left
   untouched.

Both were re-confirmed present in a fresh full run of this file after all fixes landed
(`npx vitest run src/lib/session198.teenNumbersK.test.ts`): 15 tests, 3 pass (course-
shape/recipe block), 12 fail — all 12 on one of the two pre-existing issues above, zero
on the tenFrame invariant this task fixed.

## 6. Other targeted tests checked for breakage

- **`src/lib/session198.numberWritingK.test.ts`**: run fresh
  (`npx vitest run src/lib/session198.numberWritingK.test.ts`) — 17 tests, 16 fail.
  Every failure is pre-existing and unrelated: a `countZeroTap` authored-vs-generated
  widget-type mismatch (`dragOrder` vs `tapDiagram`), a `dragOrder` manip-capability
  assertion, and the same `options[0].correct` issue as §5.3. None mention `tenFrame`,
  `countTeenFrame`, `preFilled`, or `target`. This file itself has no working-tree diff
  (`git status --short` confirms); its one *conditional* "make N." check
  (`if (m) { expect(...) }`, lines 163-168) never activates against any of this
  course's `countTeenFrame`-bound lessons because their authored prompts were already
  honest pre-fix (§3.3) — so it was already a no-op before this task and remains one.
- **`src/lib/session198.measureCompareK.test.ts`**: run fresh — 18 tests, 12 fail.
  11 are the same `options[0].correct` issue; the 12th (`kmd-03-04`/i2) is a
  `shapeSortTap` solver disagreement, an unrelated generator this task never touched.
  This file has a generic/unrelated `tenFrame` check (target range 1-10 only) and a
  `shapeSortFrame`-specific test that only mentions "countTeenFrame" in a contrast
  comment string — neither is affected.
- **`src/lib/g0Variants.language.test.ts`**: read in full; only tests `countAddMcq`/
  `countSubtractMcq`/k0-add-subtract forms, never `countTeenFrame`. No risk; not
  re-run.

## 7. Disposition records issued

Wrote 9 `lesson-disposition` records to
`reports/closure/cowork-staging/laneA-s328-E1.jsonl`, `recordId`s prefixed `s328-E1-`,
schema-validated against `LESSON_REVIEW_DECISIONS_S244.jsonl`'s first-line schema
record (all 11 required fields present, all enum values valid). Not appended to the
main ledger — that is a separate integration step.

| lessonId | recordId | decision | basis hash | superseding |
|---|---|---|---|---|
| `knb-01-03` | `s328-E1-knb-01-03` | KEEP | unchanged: `adff97f2fa4f...` | `s327-A4-knb-01-03` (ESCALATE) — closed per its own reopenCondition now that the engine fix has shipped; lesson JSON itself not re-edited this pass |
| `knb-02-02` | `s328-E1-knb-02-02` | KEEP | unchanged: `53efd569b016...` | `s327-A4-knb-02-02` (ESCALATE) — same closure; A4's separate, explicitly non-gating k1/k3 off-range-15 observation is carried forward unaddressed, not silently dropped |
| `knb-01-04` | `s328-E1-knb-01-04` | KEEP | new: `ac2f2103e909...` | `s326-R1-knb-01-04` (KEEP, predates A4's discovery) |
| `knb-02-01` | `s328-E1-knb-02-01` | KEEP | new: `769f7d6c8392...` | `s326-R1-knb-02-01` (KEEP, predates A4's discovery) |
| `knb-02-03` | `s328-E1-knb-02-03` | KEEP | new: `b816768112c9...` | `s326-R1-knb-02-03` (KEEP, predates A4's discovery) |
| `knb-02-04` | `s328-E1-knb-02-04` | KEEP | new: `26127021db11...` | `S321-V1-knb-02-04` (KEEP, even older) |
| `knb-03-01` | `s328-E1-knb-03-01` | KEEP | new: `1aa7200c7b68...` | `s326-R1-knb-03-01` (KEEP, predates A4's discovery) |
| `knb-03-03` | `s328-E1-knb-03-03` | KEEP | new: `bf0924365ed5...` | `s326-R1-knb-03-03` (KEEP, predates A4's discovery) |
| `knb-03-04` | `s328-E1-knb-03-04` | KEEP | new: `21bffefe5bc8...` | `s326-R1-knb-03-04` (KEEP, predates A4's discovery) |

For the 2 escalation-closers, `reviewedBasisHash` is confirmed **unchanged** from A4's
own recorded value via `node scripts/session/print-review-basis.mjs knb-01-03
knb-02-02` — expected, since this task did not re-edit either lesson's JSON, only the
shared generator both depend on. For the 7 content-edited siblings, all 9 fresh hashes
were computed via the same script, run after each lesson's content edit landed, per
the tool's documented byte-sensitivity. All 7 siblings' prior dispositions were
`s326-R1`/`S321-V1` KEEPs dated before A4's S327 discovery (2026-08-21T06:26/
2026-08-20T20:43 vs. A4's 12:00-12:15) — i.e. reviews that never evaluated the tenFrame
prompt-truthfulness question in the first place, now correctly superseded by a review
that has.

`visualDecision`/`gradeLanguageDecision` were carried forward unchanged (`SUFFICIENT`/
`FIT`) from each lesson's prior disposition in every one of the 9 records — this task's
edits never touched figures, and the new prompt phrasing is equally grade-K-appropriate
prose reusing each lesson's own established vocabulary, so neither field's prior
assessment is invalidated by this fix.

## 8. Open questions / residual risk

- **`knb-02-02`'s k1/k3 off-range-15 observation** (A4's, non-gating, not addressed by
  this task): k1/k3 use the number 15 while this lesson's own stated focus is 17-19.
  A4 judged this plausibly deliberate (interleaved review) rather than a clear defect
  and explicitly did not fix it; this task carried the observation forward unresolved
  in `s328-E1-knb-02-02`'s `reopenCondition` rather than silently dropping it.
- **Two pre-existing, unrelated test defects** left untouched (§5.3, §6): the
  `options[0].correct`-must-be-first MCQ convention (violated across most of
  `teen-numbers-k`, `number-writing-k`, and `measure-compare-k`, contradicted by the
  newer `session253` test, and would require reordering MCQ option arrays broadly to
  fix) and `knb-03-02`'s unrelated `kCountFromHop` prompt-regex mismatch. Neither was
  introduced or fixed by this task; both are documented here for visibility since
  fixing the tenFrame regex unmasked them (they were previously hidden behind the
  earlier-throwing stale regex in the same test's execution order).
- **`kcw-02-02`/`kcw-02-04`/`kcw-03-01`** (`number-writing-k`): benefit from the §2
  generator fix on replay (their `countTeenFrame`-bound steps regenerate honest prompts
  now) without any content edit, since their authored text was already honest. No
  disposition record was written for them since their JSON bytes are unchanged and
  their existing basis hash remains valid.
- **`knb-03-02`'s inclusion in A4's "8 siblings" list is a documented factual error**
  (§3.2) — flagged for visibility in case any other lane relied on that count; the
  correct sibling count reproducing this specific bug is 7, not 8.
- Two `tenFrame` prompts were deliberately left unedited as judgment calls rather than
  clear violations (`knb-02-03`'s i2, `knb-03-03`'s i2 — §3.3 table); both read as
  narrative/picture-description framing rather than a literal "the interactive widget
  already shows this" claim, but are noted as the closest calls in the sweep in case a
  future reviewer reaches a different conclusion.
