# S327 Fix Packet PG2 — LESSON_PROGRESSION_AND_DUPLICATION (27 lessons, 4 courses)

Fixer: cowork-s327-PG2-fixer. Contracts: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows
`PROGRESSION-<lessonId>` (workstream `LESSON_PROGRESSION_AND_DUPLICATION`) for the 27 lessons listed
below, plus one cross-owned `CHOICE_SURFACE_INTEGRITY` row (`CHOICE-0056`, `rns-03-01/k3`).

Scope: `content/courses/linear-functions` (8), `content/courses/the-real-number-system` (7),
`content/courses/solving-equations` (6), `content/courses/exponents-polynomials` (6).

Method: every `PROGRESSION-*` row's `mismatch_evidence` was reproduced exactly before touching any
file, using a one-off script (`/tmp/.../scratchpad/check-progression.mjs`) that replicates the
consolidator's own detector verbatim (`scripts/audit/consolidate-pending-workload-s236.mjs:358-393`:
per-lesson widget-bearing steps, `duplicate-widgets` = identical widget JSON, `exact-prompts` =
byte-identical `widget.prompt`, `number-normalized-prompts` = prompts equal after
`/[-−+]?\d+(?:[.,\/]\d+)*/g → "#"`). All 27 rows reproduced byte-for-byte against the CSV
(`duplicate-widgets=[]; exact-prompts=[]` in every row — only the normalized-template clause ever
fires in this batch). Each disposition below is (a) KEEP with a fluency/retrieval rationale — the
repeats are a deliberately spaced retrieval pair doing genuinely different jobs — or (b) a rewrite of
the later-occurring flagged step so its normalized template no longer collides with any earlier
widget-bearing step in the same lesson, with every number, trap, and feedback string in the rewritten
widget hand-recomputed and verified. Where (b) fires, only the flagged (later) step is rewritten; the
earlier, unflagged instance the detector treats as canonical is left untouched. Post-edit, the same
detector is re-run on the file and required to report `number-normalized-prompts=[]` before the
lesson is closed.

No file outside `content/courses/{linear-functions,the-real-number-system,solving-equations,exponents-polynomials}/lessons/`
was edited. No `npm`/`vitest`/`tsc`/build command was run — all verification is `node` one-offs
(JSON.parse for parse-cleanliness, the detector replica above, and hand arithmetic).

---

## lf-01-01 — (b) rewrite

Flagged: `ch1` (number-normalized dup of `k2`; both templated `"find the slope of the line through
(#, #) and (#, #)."`). Structure: `k2` (mid-lesson check, points (1,1)&(4,7)→slope 2) and `ch1` (the
lesson's own culminating challenge, points (2,3)&(5,12)→slope 3) asked the literally identical bare
two-point slope computation with no differentiating demand — a genuine unintentional duplicate, not
spaced practice, since a "challenge" step promises more than a repeat of a mid-lesson check.
BEFORE: `ch1` widget.prompt = "Find the slope of the line through (2, 3) and (5, 12)."
AFTER: `ch1` widget.prompt = "A hiking trail's height is tracked on a graph where x is minutes and y
is total meters climbed. The graph passes through (2, 3) and (5, 12). What is the trail's climbing
rate, in meters per minute?" — same points/answer (3), but now demands transfer (interpreting slope
as a real rate with units) instead of bare computation. `commonErrors` (9, −3), `fallbackFeedback`,
`explanationVariants`, and `hints` all rewritten to the meters/minutes framing; arithmetic
unchanged and reverified (12−3=9, 5−2=3, 9÷3=3).
Verified: detector re-run on the file → `number-normalized-prompts=[]` (was `[ch1]`); JSON parses;
no new duplicate introduced against `i1,k1,i2,k2,i3,k3`.

## lf-01-03 — (a) KEEP, fluency/retrieval rationale

Flagged: `k2` (number-normalized dup of `k1`; both `slopeTriangle` widgets templated `"build the
triangle for the line through a (#, #) and b (#, #)."`). Read in full context: `c1`→`i1` teach
reading sign from direction; `k1` builds the triangle for A(1,8)–B(5,0), a FALLING line (slope −2,
negative); `c2`→`i2` teach the horizontal/zero case; `k2` builds the triangle for A(0,1)–B(4,9), a
RISING line (slope +2, positive); `c3`→`i3` teach the vertical/undefined case; `k3` (matchPairs)
synthesizes all four sign categories together; `ch1` is a second falling/negative build (steeper,
slope −3). The text-only detector cannot see it, but `k1` and `k2` are a deliberate contrast pair:
identical action (construct a slope triangle from two labeled points) under an opposite **constraint**
— k1's points are chosen to force a negative outcome, k2's to force a positive one — which is exactly
the sign-discrimination target this lesson teaches, immediately before k3 requires sorting all four
sign categories at once. This is spaced retrieval of the construction skill across the lesson's own
core misconception (sign confusion), not an accidental re-ask; no edit made.
Verified: no file changed; JSON still parses; detector output unchanged from the CSV's own
`number-normalized-prompts=[k2]` (left as-is by design, not treated as an error).

## lf-02-01 — (a) KEEP, fluency/retrieval rationale

Flagged: `i3` (number-normalized dup of `k2`; both `"for y = #x + #, find y when x = #."` — `ch1`'s
"− 5" keeps its literal minus sign under the detector's own regex since it is space-separated from
the digit, so it normalizes differently and was correctly left unflagged by the CSV). Read in full
context: `k2` is the FIRST practice of evaluating y = mx + b at a point, positioned right after `c2`
(which teaches the x = 0 substitution mechanic) and built with the scaffolded `exactNumberLab`
widget (`approximationEvaluate` task: the learner manipulates named constants m/c/x through an
explicit `approxFormula` and must log a required exploration before answering) — a materially
different action from a plain numeric-entry check. Between `k2` and `i3` the lesson interleaves two
identification tasks (`i2` negative slope, `k3` fractional slope). `i3` then re-tests the same
evaluate skill unscaffolded (a plain `numeric` widget, no exploration mechanic) as spaced/interleaved
retrieval, immediately setting up `ch1`'s harder subtraction-based evaluate challenge (order of
operations with a negative constant). This is deliberate interleaved spaced practice of the lesson's
evaluate-at-a-point skill using a different interaction mechanic, not an accidental re-ask; no edit
made.
Verified: no file changed; JSON still parses; detector output unchanged (`number-normalized-prompts=[i3]`,
left as-is by design).

## lf-03-01 — (a) KEEP, fluency/retrieval rationale

Flagged: `k3`, `ch1` (both number-normalized dups of `i2`; all three `buildExpression` widgets
templated `"build the point-slope equation for the line through (#, #) with slope #."`). Read in
full: `i2` builds from (2, 5), slope 3 — no negatives, pure mechanics. `k3` builds from (5, −1),
slope 2 — the point's y-coordinate is negative, exercising exactly the hidden-negative reading `c3`
just taught (its lone trap is the sign on the constant, `y − (−1) → y + 1`). `ch1` builds from
(−3, 4), slope −2 — its own body literally says "Two negatives to handle": the point's x-coordinate
AND the slope are both negative, and its two `commonBuilds` traps are distinct from k3's (dropping
the sign on x, and dropping the sign on the slope out front). This is a deliberate 0 → 1 → 2 negative
escalation of the same construction action, each step targeting a different, named misconception
trap — legitimate escalating-constraint practice, not an accidental re-ask; no edit made.
Verified: no file changed; JSON still parses; detector output unchanged
(`number-normalized-prompts=[k3,ch1]`, left as-is by design).

## lf-03-02 — (a) KEEP, fluency/retrieval rationale

Flagged: `ch1` (number-normalized dup of `k3`; both `"convert y − # = #(x − #) to slope-intercept
form. what is b?"` — `k1` keeps its own longer suffix ", the y-intercept?" so it never collides, and
`k2`'s literal "y + …" vs the others' literal "y − …" keeps it textually distinct too). Read in full:
`k1` is the baseline conversion with a reminder clause. `k2` (after `c2`'s shortcut formula) tests a
point whose y-coordinate is hidden-negative (`y + 4` ⇒ y₁ = −4) — its trap is mis-signing y₁. `k3`
(right after `i3` teaches the *backward* direction) is a plain positive-number reinforcement of the
*forward* conversion, spaced retrieval before the final challenge. `ch1`'s own body says "Negative
slope, full convert" — its distinguishing complication is a **negative slope** (m = −3), a different
sign-error source from k2's negative point-coordinate, with its own two traps
(`2 + (−3) = −1` and a flipped sign on `b`) that are specific to mis-subtracting a negative slope
term. Escalation is baseline → hidden-negative point → plain reinforcement → hardest case (negative
slope), each exercising a distinct sign-handling constraint; not an accidental re-ask. No edit made.
Verified: no file changed; JSON still parses; detector output unchanged
(`number-normalized-prompts=[ch1]`, left as-is by design).

## lf-03-03 — (b) rewrite

Flagged: `k2` (number-normalized dup of `k1`; both templated `"find the x-intercept of #x + #y = #
(set y = #)."`). This one is a genuine content mismatch, not merely a textual echo: the sequence is
`k1` (x-intercept of 3x+2y=12) → `c2` (teaches BOTH x- and y-intercept technique) → `i2` (y-intercept
of that SAME equation) → `k2`, which — despite `i2` having just taught y-intercept — asked for the
**x-intercept again** (of a new equation, 4x+5y=20), leaving y-intercept exercised only once, in an
ungraded interactive. Rewrote `k2` to check the skill the lesson actually just taught: the y-intercept
of the same new equation, in a wording distinct from `i2`'s ("Find the y-intercept of… (set x = 0).")
so the fix does not just trade one collision for another.
BEFORE: body "A different line."; prompt "Find the x-intercept of 4x + 5y = 20 (set y = 0)."; answer 5.
AFTER: body "Same trick, the other axis."; prompt "Where does 4x + 5y = 20 cross the y-axis? (Set x =
0.)"; answer 4 (5y = 20 ⇒ y = 4, hand-verified; this value was already independently confirmed
correct by the OLD k2's own trap feedback, which read "That's the y-intercept (20/5 = 4)"). Traps
recomputed and swapped to match the new job: 5 (the x-intercept, same swapped-axis error k1/i2 guard
against) and 20 (divide by the y-coefficient 5, not by A). `approxConstants`/`approxFormula` swapped
from A/C÷A to B/C÷B accordingly.
Verified: detector re-run on the file → `number-normalized-prompts=[]` (was `[k2]`); JSON parses; new
`k2` template `"where does #x + #y = # cross the y-axis? (set x = #.)"` is distinct from `i2`'s
`"find the y-intercept of #x + #y = # (set x = #)."` and from every other step.

## lf-04-01 — (a) KEEP, fluency/retrieval rationale

Flagged: `k2`, `ch1` (both number-normalized dups of `i2`; all three templated `"a line passes
through (#, #) with slope #. what is b?"`). Read in full: `i2` — point (3,4) positive, slope **−1**
negative (one negative, in the slope); answer 7, traps target mis-signing y₁ and adding instead of
subtracting m·x₁. `k2` — point **(−1, 2)** negative x, slope 3 positive (one negative, in the point
this time); answer 5, traps target the same two failure modes but for the point's sign. `ch1` —
point **(−2, 2)** AND slope **−3** both negative (its own body says "Two negatives to manage");
answer −4, traps specifically target mishandling the negative-times-negative product. This is the
same escalating single-negative → other single-negative → double-negative constraint pattern already
verified as deliberate design elsewhere in this course (`lf-03-01`, `lf-03-02`); each step's traps
are freshly computed for its own sign combination. Not an accidental re-ask; no edit made.
Verified: no file changed; JSON still parses; detector output unchanged
(`number-normalized-prompts=[k2,ch1]`, left as-is by design).

## lf-04-02 — mixed: (b) rewrite k3, (a) KEEP ch1

Flagged: `k3`, `ch1` (both number-normalized dups of `k1`; all three templated `"the line through
(#, #) and (#, #) has slope #. find b."`). These two flagged steps are NOT the same situation and
were adjudicated separately:
- `k3` was a genuine unintentional duplicate of `k1`: both all-positive coordinates, both "slope
  given directly, find b from one point," with no differentiating constraint at all — unlike `ch1`
  (see below), `k3` added nothing new. Rewrote it to (1) use a **negative slope** (the one sign
  combination this lesson's cluster didn't yet cover: `k1` = all positive, `ch1` = negative point
  x-coordinate) and (2) use different wording so it no longer collides with either sibling even after
  number-stripping. BEFORE: prompt "The line through (2, 1) and (5, 7) has slope 2. Find b." (answer
  −3). AFTER: prompt "A line's slope is -2, and it runs through (1, 8) and (4, 2). What is b?"
  (answer 10). Verified consistent: (2−8)/(4−1) = −6/3 = −2 (slope matches what's stated); b via
  (1,8): 8 − (−2)(1) = 10; cross-checked via (4,2): 2 − (−2)(4) = 10. Traps recomputed: 8 (bare y₁)
  and 6 (adding m·x₁ instead of subtracting: 8 + (−2) = 6).
- `ch1` was left untouched: its own body already says "Negatives in a point" and its point
  (−2, 1) is the lesson's one negative-coordinate case (vs. `k1`'s all-positive baseline) — the same
  escalating-constraint pattern already established as legitimate elsewhere in this course
  (`lf-03-01`, `lf-03-02`, `lf-04-01`), now genuinely distinct from `k3` too since `k3` no longer
  duplicates it.
Verified: detector re-run on the file → `number-normalized-prompts=[ch1]` (was `[k3,ch1]`); `k3`'s
new template `"a line's slope is #, and it runs through (#, #) and (#, #). what is b?"` collides with
nothing; the residual `ch1` flag against `k1` is the accepted, text-invisible sign-escalation case
and is retained by design, not left over by omission.

## rns-01-01 — (a) KEEP, fluency/retrieval rationale

Flagged: `ch1` (number-normalized dup of `k4`; both `"# as a decimal is:"` — the detector's own
digit/slash-joined-number regex collapses an entire fraction like `9/20` or `5/11` into one `#`
token, which is why two structurally different fractions read as textually identical here). Read in
full: `k4` asks the learner to classify **9/20 = 0.45** — a straightforward **terminating** case,
reached after two digits. `ch1` (its own body: "A trickier one") asks the learner to classify
**5/11 = 0.4545…**, a **repeating**-block case, and its distractor options specifically probe a
different, harder misconception cluster than k4's: assuming it stops after two digits (`0.45, and it
stops there`), miscopying the digits, and naming the wrong repeating block (`"4"` instead of `"45"`).
This is a deliberate escalation to the opposite classification outcome and a genuinely different
misconception target (recognizing a repeating block vs. recognizing termination), not an accidental
re-ask; no edit made.
Verified: no file changed; JSON still parses; detector output unchanged
(`number-normalized-prompts=[ch1]`, left as-is by design).

## rns-01-02 — (b) rewrite

Flagged: `k2` (number-normalized dup of `k1`; both `"# will:"` — the fraction collapses to one `#`).
Unlike this course's escalating-constraint keeps, `k1` (1/12 = 2²×3, repeats) and the original `k2`
(5/6 = 2×3, repeats) were a genuine unintentional duplicate: identical reasoning (a leftover factor
of 3 after removing the 2s), identical outcome (repeats), and near-identical distractor shapes
("terminate because even," "can't tell") — no escalation, no new misconception, nothing a `ch1`-style
"trickier" framing would signal. The lesson already covers the pure-power-of-5 case (`i2`) and the
simplify-first trap twice (`i3`, `ch1`); `k1`/`k2` were the only two instances of "mixed 2×p denominator
repeats," and both used p = 3 — a real risk of the narrower misconception "numbers with a 3 don't
terminate" rather than the general rule.
BEFORE: prompt "5/6 will:" (6 = 2×3, repeats).
AFTER: prompt "5/14 — terminate or repeat? (14 = 2 × 7)" (14 = 2×7, repeats) — same classification
outcome and same general rule, but the stray prime is now 7, not 3, so the pair actually generalizes
the rule instead of re-drilling one instance of it; distractor structure rebuilt in parallel (even ⇒
terminate trap; already-lowest-terms ⇒ terminate trap; can't-tell) with numbers/feedback recomputed
for 14 = 2×7.
Verified: detector re-run on the file → `number-normalized-prompts=[]` (was `[k2]`); JSON parses; new
`k2` template `"# — terminate or repeat? (# = # × #)"` collides with no other step (distinct from
`i2`'s `"# — will it terminate or repeat? (# = #²)"` and `ch1`'s `"# — terminate or repeat? (simplify
first!)"`). Arithmetic re-verified: 5/14 = 0.357142857142… (period 6, non-terminating) since
14 = 2 × 7 and 7 ∉ {2, 5}.

## rns-01-03 — mixed: (a) KEEP i2, (b) rewrite k3

Flagged: `i2` (dup of `k1`, both `"#… equals:"`) and `k3` (dup of `k2`, both `"#… (block "#"
repeats) equals:"`) — two independent collisions, adjudicated separately.
- `i2` KEPT: `k1` (0.777…, `answerMode: "fraction"`, free-entry construction) and `i2` (0.222…,
  `answerMode: "choice"`, multiple-choice recognition against named-misconception distractors) use a
  genuinely different interaction mechanic — produce vs. recognize — and `i2`'s own body ("One more
  single-digit conversion") signals deliberate spaced reinforcement before the lesson moves on to
  two-digit blocks at `k2`. No edit made.
- `k3` REWRITTEN: the original `k3` (0.181818… → 2/11) and `k2` (0.454545… → 5/11, which is also
  `c2`'s own worked example) were a true duplicate — same `answerMode: "fraction"`, same two-digit
  block task, both denominators reducible by 9, no differentiating constraint. Redesigned `k3` to
  test the case the lesson never otherwise covers: a two-digit block that does **not** simplify.
  BEFORE: prompt "0.181818… (block "18" repeats) equals:", answer 18/99 = 2/11.
  AFTER: prompt "Convert 0.131313… (repeating block "13") to a fraction.", answer 13/99 — verified
  already in lowest terms (Euclidean algorithm: gcd(13,99): 99=7·13+8, 13=1·8+5, 8=1·5+3, 5=1·3+2,
  3=1·2+1, 2=2·1 ⇒ gcd 1). This targets a new misconception (assuming every two-digit-block answer
  must be simplified, or reflexively dividing by 9) instead of repeating `k2`'s "simplify by 9" job.
  `fractionErrors` recomputed: 13/100 (terminating-decimal trap, kept) and a new 13/9 trap (confusing
  the two-digit block's denominator 99 with the one-digit block's denominator 9).
Verified: detector re-run on the file → `number-normalized-prompts=[i2]` only (was `[i2,k3]`); JSON
parses; `k3`'s new template `"convert #… (repeating block "#") to a fraction."` collides with
nothing (distinct from `i1`'s `"convert #… to a fraction."`, `k2`'s, and `ch1`'s templates).

## rns-02-01 — (a) KEEP, fluency/retrieval rationale

Flagged: `i3`, `k3` (both number-normalized dups of `k2`; all three `rootClassify` widgets templated
`"√# is:"`). Read in full: `k2` classifies √50 — **irrational** (50 sits between 49 and 64). `i3`
immediately follows with the opposite classification — √100 — **rational**, exactly 10 (a
perfect square), as ungraded practice. `k3`, the very next step, is the **graded check** on that
identical rational/perfect-square skill (√81 = 9). Unlike `rns-01-02`/`rns-01-03` above (where the
colliding pair had unrelated material between them and stood alone as genuine duplicates), `i3` and
`k3` here are directly adjacent with `i3` explicitly rehearsing the exact skill `k3` then grades —
the standard "practice, then get checked on it" sequence, immediately following `k2`'s contrasting
irrational case. This is deliberate rehearsal-then-assessment plus a classification contrast with
`k2`, not an accidental re-ask; no edit made.
Verified: no file changed; JSON still parses; detector output unchanged
(`number-normalized-prompts=[i3,k3]`, left as-is by design).

## rns-02-03 — (a) KEEP, fluency/retrieval rationale

Flagged: `k2`, `ch1` (both number-normalized dups of `k1`; all three `rootBracket` widgets templated
`"#² = # and #² = #. so √# is between:"`). Read in full: `k1` brackets **√2** to tenths precision
(1.4–1.5). `k2` — its own body literally says "Narrow it further" — brackets the SAME **√2** to
**hundredths** precision (1.41–1.42), a deliberate precision escalation on the identical target.
`ch1` — its own body says "Apply the narrowing idea to a **new number**" — brackets a **different**
radicand, **√10**, at hundredths precision: an explicit transfer task, reusing the technique on a
number the lesson never brackets elsewhere. This is precision escalation (k1 → k2) followed by
transfer to a new target (k2 → ch1), exactly the allowed "constraint" and "transfer demand"
differentiators — not an accidental re-ask; no edit made.
Verified: no file changed; JSON still parses; detector output unchanged
(`number-normalized-prompts=[k2,ch1]`, left as-is by design).

## rns-03-01 — (b) rewrite k2 (KEEP ch1) + CHOICE_SURFACE_INTEGRITY cross-fix on k3

Two queue rows on this lesson, both closed in this pass: `PROGRESSION-rns-03-01` and `CHOICE-0056`.

**PROGRESSION** — flagged `k2`, `ch1` (both number-normalized dups of `k1`; all three templated
`"between which two whole numbers does √# lie? type the smaller one."`). Read in full: `k1` brackets
√70 (between 8, 9). `k2` (original) bracketed √95 (between 9, 10) — the identical job as `k1`, same
recall range (perfect squares ≤ 100), no differentiation. `ch1` brackets √150 (between 12, 13) and
its own hints explicitly walk further out the perfect-square list ("100, 121, 144, 169…") — a genuine
recall-range escalation, kept as-is. `k2` was a true duplicate of `k1` and was rewritten: same
radicand (95) and same bracket, but now asking for the **larger** bound instead of the smaller one —
a real action change that guards against defaulting to "always report the smaller/first bound,"
distinct from bracket-only repetition. BEFORE: prompt "…Type the smaller one.", answer 9. AFTER:
prompt "…Type the LARGER one.", answer 10 (81 < 95 < 100, 9²=81, 10²=100, larger bound = 10 —
verified). Traps recomputed: 9 (the smaller bound, now the wrong-direction trap) and 11
(121 > 100, one perfect square too far).
Verified: detector re-run → `number-normalized-prompts=[ch1]` only (was `[k2,ch1]`); new `k2`
template `"…type the larger one."` collides with nothing.

**CHOICE_SURFACE_INTEGRITY** (`CHOICE-0056`, `rns-03-01/k3`, lone-justification leak) — the correct
option alone carried a baked-in justification ("10, since 95 is closer to 100 than to 81") while
distractor `b` ("9") carried none, making the correct option identifiable by its unique explanatory
form rather than by the mathematics. Gave every option a parallel "verdict, since reason" clause so
none is uniquely self-justifying, keeping option ids, order, correct flags, and evaluator semantics
unchanged:
- `a` (correct, unchanged): "10, since 95 is closer to 100 than to 81"
- `b` (was "9"): "9, since 9 is the smaller of the two bounds" — a real, named misconception
  (defaulting to the smaller bracket bound instead of comparing distances), not a filler reason.
- `c` (was "9.5, the exact midpoint"): "9.5, since that's the number exactly between 9 and 10" —
  reworded to parallel form; feedback correspondingly rewritten to rebut the "midpoint of the
  bounds" reasoning directly rather than the midpoint of the squares.
- `d` (was "Neither — they're equally close"): "Neither, since 95 seems close to both 81 and 100"
- All four labels now sit in the same 40–55 character band (no length tell either).
Verified: JSON parses; option ids `a/b/c/d`, `correct` flags, and feedback truth all re-checked —
100 − 95 = 5 and 95 − 81 = 14 (5 < 14, so 10 is genuinely closer); midpoint of 9 and 10 is 9.5
(the `c` claim); 9 is genuinely the smaller bound (the `b` claim) — every distractor's stated premise
is factually true, only its conclusion is wrong, which is what makes it a real misconception rather
than an arbitrary wrong answer.

## rns-03-02 — mixed: (a) KEEP i2/k3/ch1, (b) rewrite k2

Flagged: `i2`, `k2`, `k3`, `ch1` — a five-way cluster including the anchor `k1`, all templated
`"to one decimal place, √# ≈ ____"` (the widest repetition in this batch). Read in full and
adjudicated per instance:
- `k1` (anchor, √10 ≈ 3.2) and `i2` (√2 ≈ 1.4, ungraded) — `i2` uses the single most canonical
  irrational in the whole course (√2) as low-stakes rehearsal immediately after the first graded
  check; kept.
- `k3` (√27 ≈ 5.2) and `ch1` (√83 ≈ 9.1) genuinely escalate the whole-number bracket size (5–6, then
  9–10, vs. k1/i2's 3–4 and 1–2) — bigger perfect-square recall, and `ch1`'s hints explicitly re-walk
  the FULL bracket-then-narrow process ("First bracket √83 between whole numbers…") as the lesson's
  combined-skill capstone; both kept.
- `k2` (√3 ≈ 1.7) was the one true unintentional duplicate: same single-digit bracket (1–2) as `i2`,
  no escalation, no new demand — the fourth instance of an unchanged task with nothing left to
  differentiate it. Rewrote it to the one genuinely new constraint this lesson never tests: a
  **close call**, where the two tenths candidates are nearly equidistant and naive "which is bigger"
  intuition is unreliable.
  BEFORE: prompt "To one decimal place, √3 ≈ ____", answer 1.7 (1.7²=2.89, 1.8²=3.24 — not close,
  margins 0.11 vs 0.24).
  AFTER: prompt "Rounded to one decimal place, what is √6?", answer 2.4 — verified: 2.4² = 5.76
  (6 − 5.76 = 0.24) vs 2.5² = 6.25 (6.25 − 6 = 0.25); 0.24 < 0.25, so 2.4 wins by the narrowest
  possible margin (0.01), genuinely requiring the exact comparison rather than a memorized or
  eyeballed value. Trap recomputed: 2.5 (the "almost halfway so round up" trap this margin invites)
  and 2 (bare whole-number bound, kept).
Verified: detector re-run → `number-normalized-prompts=[i2,k3,ch1]` (was `[i2,k2,k3,ch1]`); JSON
parses; `k2`'s new template `"rounded to one decimal place, what is √#?"` collides with nothing.

## alg1-01-01 — (b) rewrite

Flagged: `ch1` (number-normalized dup of `k1`; both `"solve for x: #x + # = #"`). `k1` (4x+8=28,
positive coefficient, positive constant) and the original `ch1` (5x+3=38, same shape) were the same
"baseline all-positive two-step solve" with zero escalation — `k2` already owns the negative-constant
case (3x−5=16) and `k3` already owns the procedural "which step first" question, leaving the
challenge nothing new to add. Rewrote `ch1` to the one sign case this lesson never tests: a
**negative coefficient**.
BEFORE: prompt "Solve for x: 5x + 3 = 38", answer 7.
AFTER: prompt "What value of x makes -3x + 4 = 19 true?", answer −5. Verified: 19 − 4 = 15,
15 ÷ (−3) = −5; check: −3·(−5) + 4 = 15 + 4 = 19. Traps recomputed: 15 (bare `-3x`, one undo short)
and 5 (sign-drop error: dividing 15 by −3 as if by +3).
Verified: detector re-run on the file → `number-normalized-prompts=[]` (was `[ch1]`); JSON parses;
new `ch1` template `"what value of x makes #x + # = # true?"` collides with nothing.

## alg1-01-02 — mixed: (a) KEEP k1 (anchor), (b) rewrite k2 + ch1

CSV: `PROGRESSION-alg1-01-02`, step_path `k2 ch1`, mismatch_evidence `number-normalized-prompts=[k2,ch1]`. No CHOICE_SURFACE_INTEGRITY row for this lesson.

BEFORE (check-progression.mjs on original file):
```
k1  :: "solve for x: #x + # = #x + #"
k2  :: "solve for x: #x + # = #x + #"   <- flagged dup of k1
ch1 :: "solve for x: #x + # = #x + #"   <- flagged dup of k1
number-normalized-prompts=[k2,ch1]
```
k1 = "5x + 2 = 3x + 10" (x=4). k2 = "7x + 3 = 4x + 15" (x=4) — these are literally c2's own worked-example numbers ("Subtract the smaller x-term... for 7x + 3 = 4x + 15...") replayed verbatim as the graded check: zero transfer, pure recall. ch1 = "9x + 4 = 5x + 24" (x=5) — same shape/style as k1, only bigger numbers, no new constraint.

Classification: (b) true duplicate. All three items were the identical task (positive coefficients both sides, positive constants both sides, left coefficient always bigger) differing only in magnitude — no representation, constraint, or misconception shift, per S316.

REDESIGN:
- k2 → "Solve for x: 6x - 4 = 2x + 20" (x=6). Introduces a negative constant on the left side (new for this lesson — k1 and original-k2/ch1 were all-positive). The literal "-" sign is separated from the digit by spaces in the prompt text, so the detector's number regex (`[-−+]?\d+...`, sign must be digit-adjacent) does NOT absorb it into a `#` token — it survives normalization as literal text, so k2's template becomes `"solve for x: #x - # = #x + #"`, textually distinct from k1's `"...#x + # = #x + #"`. commonErrors/hints/explanationVariants fully recomputed for the new equation.
- ch1 → "What is x, given 3x + 4 = 7x + 20?" (x=-4). Two genuine escalations for the challenge tier: (1) the RIGHT-side coefficient is now bigger than the left (7x vs 3x), forcing transfer of c2's "subtract the smaller x-term" rule to the case where that smaller term sits on the left — the x-terms end up collected on the right side instead of the left, a real route/representation shift; (2) the solution is negative for the first time in this lesson (x = −4), a genuine misconception-diagnostic difference (sign-handling on the final division, plus the wrong-sign commonError now models mis-adding vs mis-subtracting a positive 20 rather than a positive 4). Also reworded the stem itself ("What is x, given …?" vs "Solve for x: …") so the template differs from k1/k2 in wording, not just numbers/signs — belt-and-suspenders against the textual-only nature of the detector.
- k1 unchanged (kept as the anchor: baseline all-positive case).
- k3 (MCQ, "why must 3x come off both sides…") was never flagged — untouched.

Math verified via node:
- k2: 6·6−4 = 32, 2·6+20 = 32 ✓. Wrong-sign candidate (add 4 the wrong way): 20−4=16→x=4 (clean). "That's 4x not x" value: 4·6=24.
- ch1: 3·(−4)+4 = −8, 7·(−4)+20 = −8 ✓. Wrong-sign candidate: 4+20=24→x=6 (clean). "That's 4x not x" value: 4·(−4)=−16.

AFTER (check-progression.mjs on edited file):
```
i1  :: "solve #x + # = #x + #. drag the steps into order."
k1  :: "solve for x: #x + # = #x + #"
i2  :: "collect the x-terms, then solve. match each equation to its x."
k2  :: "solve for x: #x - # = #x + #"
k3  :: "why must #x come off both sides of #x + # = #x + #?"
ch1 :: "what is x, given #x + # = #x + #?"
duplicate-widgets=[]
exact-prompts=[]
number-normalized-prompts=[]
CLEAN
```

Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs reports CLEAN; reviewBasisHash `210c1257478cf6eb6c99d12c6804301297ba2f39ed868cca5d502ac3f499abd5`.

## alg1-02-01 — mixed: (a) KEEP k1/k2 (anchor + already-differentiated), (b) rewrite ch1

CSV: `PROGRESSION-alg1-02-01`, step_path `ch1`, mismatch_evidence `number-normalized-prompts=[ch1]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
k1  :: "solve for x: x/# + # = #"
ch1 :: "solve for x: x/# + # = #"   <- flagged dup of k1
```
k1 = "x/3 + 2 = 7" (x=15) — also literally c1's own worked-example numbers. k2 = "x/4 − 3 = 2" (x=20, already has its own negative-constant differentiation, never flagged). ch1 (original) = "x/5 + 1 = 4" (x=15) — same all-positive shape as k1, and even the SAME final answer (15), despite being the capstone challenge — weaker than k2, no escalation.

Classification: (b) true duplicate.

REDESIGN: ch1 → "Solve for x: 9 + x/4 = 3" (x = −24). The constant now LEADS the equation (order flip changes the literal template to `"# + x/# = #"`, distinct from k1's `"x/# + # = #"`), and both the intermediate (x/4 = −6) and final value are negative for the first time in the lesson — a genuine escalation past both k1 and k2, appropriate for the challenge tier. Verified: 9 + (−24)/4 = 9 − 6 = 3 ✓.

AFTER:
```
i1  :: "solve x/# − # = #. drag the steps into order."
k1  :: "solve for x: x/# + # = #"
i2  :: "solve each fraction equation and match it to its x."
k2  :: "solve for x: x/# − # = #"
k3  :: "x/# = #. what frees the x?"
ch1 :: "solve for x: # + x/# = #"
number-normalized-prompts=[]
CLEAN
```
Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `ebb378b92c9bfc264876675294529e7fcc2d36f921f5e11f351efc43e93eadc3`.

## alg1-02-02 — mixed: (a) KEEP k1 (anchor), (b) rewrite k2 + ch1

CSV: `PROGRESSION-alg1-02-02`, step_path `k2 ch1`, mismatch_evidence `number-normalized-prompts=[k2,ch1]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
k1  :: "solve for x: x/# + x/# = #"
k2  :: "solve for x: x/# + x/# = #"   <- flagged dup of k1
ch1 :: "solve for x: x/# + x/# = #"   <- flagged dup of k1
```
k1 = "x/2 + x/3 = 5" (x=6, LCD 6) — again literally c1's own worked example. k2 (original) = "x/2 + x/5 = 7" (x=10, LCD 10). ch1 (original) = "x/3 + x/4 = 7" (x=12, LCD 12). All three: plain two-fraction sum, coprime denominator pair, positive throughout — differing only in which pair of coprime denominators was used. Same job, same difficulty, same representation — no escalation across the tier (per S316, "different numbers, nothing else").

REDESIGN:
- k2 → "Solve for x: x/3 + x/9 + 2 = 10" (x=18). Adds a third, bare-constant addend alongside the two fraction terms (template becomes `"...x/# + x/# + # = #"`, textually distinct from k1) and switches to a non-coprime denominator pair (9 is a multiple of 3, so LCD = 9, not 27) — echoing the "LCD isn't just the product" idea already modeled in i2, but now assessed for the first time. Also exercises a new, more granular case of the "every term scales" misconception: forgetting to multiply the bare +2 by the LCD (distinct from c2/k3's already-covered case of forgetting to scale the other *side*).
- ch1 → "Solve for x: x/2 - x/8 = 6" (x=16). A subtraction between the two fraction terms (template `"...x/# - x/# = #"`), also a non-coprime pair (8 is a multiple of 2) — genuinely new action (sign propagation through the LCD-clear step) appropriate for the capstone.
- k1 kept as anchor; k3 (MCQ) was never flagged, untouched.

Math verified via node: 3·18+18+18=90 → 4x=72 → x=18 (checks: 18/3+18/9+2 = 6+2+2 = 10). 4·16−16=48 → 3x=48 → x=16 (checks: 16/2−16/8 = 8−2 = 6).

AFTER:
```
i1  :: "pick the smallest multiplier that clears both fractions."
k1  :: "solve for x: x/# + x/# = #"
i2  :: "solve x/# + x/# = #. drag the steps into order."
k2  :: "solve for x: x/# + x/# + # = #"
k3  :: "when clearing x/# + x/# = # with ×#, which terms get multiplied?"
ch1 :: "solve for x: x/# - x/# = #"
number-normalized-prompts=[]
CLEAN
```
Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `3f2ccb75bd7568d8d1fefcd6dfa5370da8541f3f7a5bb315187d2d1b8a029d10`.

## alg1-02-03 — mixed: (a) KEEP k1 (anchor), (b) rewrite k2 + ch1

CSV: `PROGRESSION-alg1-02-03`, step_path `k2 ch1`, mismatch_evidence `number-normalized-prompts=[k2,ch1]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
k1  :: "solve for x: #x + # = #"
k2  :: "solve for x: #x + # = #"   <- flagged dup of k1
ch1 :: "solve for x: #x + # = #"   <- flagged dup of k1
```
Note: decimal points are absorbed into the number token exactly like any other digit under this detector's regex, so k1 ("0.5x + 1.2 = 3.7"), k2 (original: "0.2x + 3 = 4"), and ch1 (original: "0.3x + 0.4 = 1.9") all normalized identically regardless of decimal-place count. All three also solved to the SAME final answer, x = 5 — the clearest possible signal that only the numbers were swapped.

Classification: (b) true duplicate.

REDESIGN:
- k2 → "Solve for x: 1.5 + 0.25x = 3" (x=6). Order-flipped (constant leads → template `"# + #x = #"`) and escalates to TWO decimal places, which requires ×100 rather than the ×10 shift used everywhere else in the lesson — a genuinely new constraint (recognizing how many places to shift), not just bigger numbers.
- ch1 → "Solve for x: 0.6x - 0.9 = 1.5" (x=4). A subtraction (template `"#x - # = #"` — the literal "-" is space-separated from the digit, so the detector's sign-adjacent-to-digit rule does not absorb it into the number token) — new sign-handling demand appropriate for the capstone.
- k1 kept as anchor; k3 (MCQ) was never flagged, untouched.

Math verified via node: 150 + 25·6 = 300 (1.5 + 0.25·6 = 3 ✓). 6·4 − 9 = 15 (0.6·4 − 0.9 = 1.5 ✓).

AFTER:
```
i1  :: "shift every term one place. which whole-number equation matches?"
k1  :: "solve for x: #x + # = #"
i2  :: "solve #x + # = # by shifting. drag the steps into order."
k2  :: "solve for x: # + #x = #"
k3  :: "which is the correct ×# shift of #x + # = #?"
ch1 :: "solve for x: #x - # = #"
number-normalized-prompts=[]
CLEAN
```
Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `3698f9deb478488b30fbf62bba036024fd5f9905191f1d93c2fdea6ba6112261`.

## alg1-03-03 — mixed: (a) KEEP k1/ch1 (anchor + already-distinct), (b) rewrite k3

CSV: `PROGRESSION-alg1-03-03`, step_path `k3`, mismatch_evidence `number-normalized-prompts=[k3]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
k1  :: "using f = #c/# + #, find f when c = #."
k3  :: "using f = #c/# + #, find f when c = #."   <- flagged dup of k1
ch1 :: "c = (f − #)·#. find f when c = #."         <- distinct, not flagged (requires rearranging first)
```
k1 = "find F when C=100" → F=212. k3 (original) = "find F when C=25" → F=77. Both are plug-into-the-already-solved-formula evaluations at a positive C — identical task, identical representation, differing only in the input value. ch1 legitimately escalates already (gives the UNSOLVED formula C=(F−32)·5/9 and requires the student to rearrange it before evaluating), so it wasn't flagged and needed no change — but it also meant k3 needed a genuinely different job of its own, not just "another positive plug-in."

Classification: (b) true duplicate.

REDESIGN: k3 → "What is F when C = -40, using F = 9C/5 + 32?" (F = −40). Reworded the stem (clauses reordered, changing the literal template to `"what is f when c = #, using f = #c/# + #?"`) and moved to a NEGATIVE input for the first time in the lesson — landing on the famous −40° crossover point where Fahrenheit and Celsius coincide. This is a genuine sign-handling escalation (the multiply/divide chain and the final addition all now cross zero) distinct from k1's positive case, and distinct from ch1's rearrange-then-evaluate task. commonErrors recomputed for the new input: −72 (forgot the +32) and −8 (added 32 to C directly, skipping the 9/5 scaling — mirrors the exact error shape used for k1/ch1's own commonErrors, just recomputed).

Math verified via node: 9·(−40)/5 + 32 = −72 + 32 = −40.

AFTER:
```
i1  :: "the forward path from f to c is subtract #, multiply by #, then divide by #. build the inverse path from c back to f."
k1  :: "using f = #c/# + #, find f when c = #."
i2  :: "assemble the solution of y = mx + b for x."
k2  :: "solve #x + a = c for x."
k3  :: "what is f when c = #, using f = #c/# + #?"
ch1 :: "c = (f − #)·#. find f when c = #."
number-normalized-prompts=[]
CLEAN
```
Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `271b591dba5e0100a081fcfe409af728953b930bf5ec32cd8b945950ec54ae0b`.

## ep-01-01 — mixed: (a) KEEP k1/k2/k3/i1/i2/i3 (anchor + already-distinct), (b) rewrite ch1

CSV: `PROGRESSION-ep-01-01`, step_path `ch1`, mismatch_evidence `number-normalized-prompts=[ch1]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
k1  :: "evaluate #^# · #^#."
ch1 :: "evaluate #^# · #^#."   <- flagged dup of k1
```
k1 = "2^3 · 2^2" = 32. ch1 (original) = "2^4 · 2^3" = 128. Both plain numeric base-2 product-rule evaluations, no escalation between them despite k2 (quotient) and k3 (variable quotient) already sitting between them in the lesson.

Classification: (b) true duplicate.

REDESIGN: ch1 → "Evaluate (2^5 · 2^2) / 2^3." (=16). A genuine capstone synthesis: requires applying BOTH rules taught in this lesson in sequence (product rule, then quotient rule), not just one operation repeated with different numbers. New template `"evaluate (#^# · #^#) / #^#."`, textually and structurally distinct from k1's. commonErrors updated to target the two natural partial-application mistakes: doing only the product step (128 — coincidentally the *original* ch1's answer, a nice touch) and treating all three exponents as one undifferentiated combine (1024).

Math verified via node: 2^5·2^2/2^3 = 32·4/8 = 16.

AFTER: `ch1 :: "evaluate (#^# · #^#) / #^#."` — distinct from k1's `"evaluate #^# · #^#."` and from k2's `"evaluate #^# / #^#."`. Full file: `duplicate-widgets=[]; exact-prompts=[]; number-normalized-prompts=[]` — CLEAN.

Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `6a7a9f4bdfcf2c579cb5807c464d0fb65d8709a1dede1ee673b529ac9b8f91a5`.

## ep-01-02 — mixed: (a) KEEP k1/i3/k3 (anchors + already-distinct), (b) rewrite k2 + ch1

CSV: `PROGRESSION-ep-01-02`, step_path `k2 ch1`, mismatch_evidence `number-normalized-prompts=[k2,ch1]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
i3  :: "simplify (x^#)^# to x^?. what is the exponent?"
k2  :: "simplify (x^#)^# to x^?. what is the exponent?"   <- flagged dup of i3
k1  :: "evaluate (#^#)^#."
ch1 :: "evaluate (#^#)^#."   <- flagged dup of k1
```
(i3 and k1 occur earlier in the steps array than k2/ch1, so they are the unflagged anchors, matching the detector's first-occurrence rule.) k2 (original) = "(x^2)^5", i3 = "(x^4)^3" — both plain single-variable power-of-power fill-ins, identical task. ch1 (original) = "(2^2)^3", k1 = "(2^3)^2" — both plain numeric power-of-power evaluations, identical task.

Classification: (b) true duplicate, both.

REDESIGN:
- k2 → "Simplify (x^4 y^2)^3 to x^a y^b. What is the exponent on y?" (=6). Tests the TWO-VARIABLE / "several factors" case that c3 explicitly teaches ("(x^2 y^3)^2 = x^4 y^6... every exponent inside multiplies") but which no check item actually assessed — both i3 and the original k2 were single-variable. New template with an extra y-token and a "which variable" framing (`"simplify (x^# y^#)^# to x^a y^b. what is the exponent on y?"`), plus a new distractor: reporting the OTHER variable's exponent (12, the x-exponent) instead of the asked-for one (6).
- ch1 → "Evaluate (2^2 · 3)^2." (=144). Synthesizes the lesson's two rules (power-of-a-power from c1/k1, power-of-a-product from c2/i2) into one numeric evaluation — the outer square must hit both the already-squared 2^2 and the bare 3 — a genuine capstone-level demand never assessed together before. New template `"evaluate (#^# · #)^#."`, distinct from k1's `"evaluate (#^#)^#."`.
- i3, k1, k3 (MCQ) unchanged — i3/k1 are anchors, k3 was never flagged.

Math verified via node: (x^4 y^2)^3 → exponent on y = 2·3 = 6, on x = 4·3 = 12 (used as the wrong-variable distractor). (2^2·3)^2 = 12^2 = 144 (commonErrors 48 = forgot to square the 3; 36 = forgot the outer square entirely).

AFTER:
```
i1  :: "simplify (#^#)^# to #^?. what is the exponent?"
k1  :: "evaluate (#^#)^#."
i2  :: "simplify (#x)^#."
i3  :: "simplify (x^#)^# to x^?. what is the exponent?"
k2  :: "simplify (x^# y^#)^# to x^a y^b. what is the exponent on y?"
k3  :: "simplify (#x^#)^#."
ch1 :: "evaluate (#^# · #)^#."
number-normalized-prompts=[]
CLEAN
```
Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `e5cc5fe9eae4adc2fcbf26681f235d86434d1cea87398bbdf053417caadc3725`.

## ep-01-03 — mixed: (a) KEEP k1/k2/i2 (anchors + already-distinct), (b) rewrite k3 + ch1

CSV: `PROGRESSION-ep-01-03`, step_path `k3 ch1`, mismatch_evidence `number-normalized-prompts=[k3,ch1]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
i2  :: "what is #^# as a fraction?"
k3  :: "what is #^# as a fraction?"                                    <- flagged dup of i2
k1  :: "simplify #^# · #^# to #^?. what is the exponent?"
ch1 :: "simplify #^# · #^# to #^?. what is the exponent?"              <- flagged dup of k1
```
Note: `2^-3` normalizes the same as `2^3` — the detector's sign-adjacent-to-digit rule absorbs a digit-adjacent minus into the number token, so "which exponent is negative" is invisible to it; only the surrounding words differentiate templates. k3 (original) = "What is 3^-2 as a fraction?" (MCQ) — identical task/shape to i2 = "What is 2^-3 as a fraction?", just a different numeric base. ch1 (original) = "Simplify 2^3 · 2^-5..." — identical task/shape to k1 = "Simplify 2^3 · 2^-1...", both numeric-base products landing on a negative exponent.

Classification: (b) true duplicate, both.

REDESIGN:
- k3 → "What is x^-4 as a fraction?" Moves the reciprocal-conversion skill to a VARIABLE base for the first time — i2 and the original k3 were both numeric bases (2, 3). New template `"what is x^# as a fraction?"`, with distractors reworked for variable algebra: "-x^4" (made it negative instead of reciprocal) and "x^4" (dropped the negative without reciprocating).
- ch1 → "Simplify 2^-3 / 2^2 to 2^?. What is the exponent?" (=−5). Switches from the product rule (already covered numerically by k1 and with a variable base by k2) to the QUOTIENT rule landing on a negative — new template using "/" instead of "·", and a genuinely new demand: subtracting exponents where the FIRST one is already negative (−3 − 2 = −5), not just the second as in k1/k2/original-ch1.
- i2/k1/k2 unchanged as anchors.

Math verified via node: −3 − 2 = −5.

AFTER:
```
i1  :: "evaluate #^#."
k1  :: "simplify #^# · #^# to #^?. what is the exponent?"
i2  :: "what is #^# as a fraction?"
i3  :: "#⁴ / #⁶ simplifies to a single power #^?. chain through the subtraction."
k2  :: "simplify x^# · x^# to x^?. what is the exponent?"
k3  :: "what is x^# as a fraction?"
ch1 :: "simplify #^# / #^# to #^?. what is the exponent?"
number-normalized-prompts=[]
CLEAN
```
Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `b43cf0235c9a5ab55c279814f5c5c7e513385856810215221234f243e192a5b2`.

## ep-02-03 — mixed: (a) KEEP k1/k3/ch1 (anchor + already-distinct), (b) rewrite k2

CSV: `PROGRESSION-ep-02-03`, step_path `k2`, mismatch_evidence `number-normalized-prompts=[k2]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
k1 :: "subtract: (#x^# + #x - #) - (#x^# + #x - #). what is the coefficient of x?"
k2 :: "subtract: (#x^# + #x - #) - (#x^# + #x - #). what is the coefficient of x?"   <- flagged dup of k1
```
k2 (original) asked for the coefficient of x in (6x²+2x−1)−(3x²+2x−5), where the x-terms happen to cancel (2−2=0) — a nice idea (a column can vanish), but carried entirely by the numbers with an otherwise identical template/tail-question to k1, so the detector still flagged it.

Classification: (b) true duplicate (template-level), though the underlying pedagogical intent (a cancelling column) was worth preserving.

REDESIGN: k2 → "Subtract: (4x^2 + 5x - 3) - (4x^2 - x + 3). What is the coefficient of x^2?" (=0). Preserves the "a column can cancel to zero" idea but generalizes it to the LEADING (x²) column instead of the x column (k1 already owns the x-column/negative-result case; k3 owns the constant column; ch1 owns the x-column sign-flip case) — new template ending `"...coefficient of x^#?"` instead of `"...coefficient of x?"`. Also switched the second polynomial's middle term to an implicit coefficient ("− x" rather than "+ #x"), a second, independent textual differentiator. Updated the `variant.form` tag from `subX` to `subX2` to match what's actually being asked. k1/k3/ch1/i1/i2/i3 unchanged.

Math verified via node: 4 − 4 = 0 (x² cancels); commonErrors 8 (added instead of subtracted) and 4 (forgot to subtract at all) recomputed for the new pair.

AFTER:
```
i1  :: "build (#x + #) − (x − #) with tiles."
k1  :: "subtract: (#x^# + #x - #) - (#x^# + #x - #). what is the coefficient of x?"
i2  :: "subtract: (#x^# - x + #) - (x^# - #x + #). what is the coefficient of x?"
i3  :: "subtract: (#x^# - x + #) - (x^# - #x + #). what is the constant term?"
k2  :: "subtract: (#x^# + #x - #) - (#x^# - x + #). what is the coefficient of x^#?"
k3  :: "subtract: (#x^# + #x - #) - (#x^# + #x - #). what is the constant term?"
ch1 :: "subtract: (#x^# + #x - #) - (#x^# - x + #). what is the coefficient of x?"
number-normalized-prompts=[]
CLEAN
```
Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `4928ac08bd03bd53b4291fc8053b1ac6cb0daaadc422d65b427f288fdc7f411c`.

## ep-03-01 — mixed: (a) KEEP k1/k3/ch1/i1/i2/i3 (anchor + already-distinct), (b) rewrite k2

CSV: `PROGRESSION-ep-03-01`, step_path `k2`, mismatch_evidence `number-normalized-prompts=[k2]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
i3 :: "multiply (#x^#)(x^# + #x - #). what is the coefficient of x^#?"
k2 :: "multiply (#x^#)(x^# + #x - #). what is the coefficient of x^#?"   <- flagged dup of i3
```
i3 and k2 (original) used the literally IDENTICAL multiplication, `(4x^2)(x^2 + 2x - 1)`, differing only in which power's coefficient was asked for (x^3 vs x^4) — and since that digit is stripped by the detector exactly like any other, the two prompts normalized identically.

Classification: (b) true duplicate.

REDESIGN: k2 → "Multiply (5x^2)(x^2 - 3x + 2). What is the coefficient of x^4?" (=5). Fresh numbers AND a flipped internal sign pattern (negative middle term, positive constant — the opposite of i3's positive-middle/negative-constant) — new template `"...(x^# - #x + #)..."`, textually distinct from i3's `"...(x^# + #x - #)..."`. Preserves k2's original "leading/top term" role, distinct from i3's x³-column role.

Math verified via node: 5·1 = 5 (x⁴ coefficient); 5·(−3) = −15 (x³ coefficient, used as a commonError distractor).

AFTER: `k2 :: "multiply (#x^#)(x^# - #x + #). what is the coefficient of x^#?"` — distinct from i3's `"...+ #x - #)..."`. Full file `number-normalized-prompts=[]` — CLEAN.

Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `738a199cd3cd4e10758883dc4bc3744d8a8a4173d638100efc6d25bdf2d8c732`.

## ep-04-03 — mixed: (a) KEEP k1/i3/k3 (anchors + already-distinct), (b) rewrite k2 + ch1

CSV: `PROGRESSION-ep-04-03`, step_path `k2 ch1`, mismatch_evidence `number-normalized-prompts=[k2,ch1]`. No CHOICE_SURFACE_INTEGRITY row.

BEFORE:
```
i2  :: "factor (x^# - #)."
k2  :: "factor (x^# - #)."          <- flagged dup of i2 (prompt text only — k2's buildExpression widget was already a different ACTION from i2's mcq)
k3  :: "factor (#x^# - #)."
ch1 :: "factor (#x^# - #)."         <- flagged dup of k3
```
k2 (original) = "Factor (x^2 - 25)." — same target (25=5²) as k1's own numeric item, and the same literal prompt shape as i2's MCQ, even though its widget (buildExpression: assemble the conjugate pair from tokens) was already a genuinely different action from i2's select-the-answer MCQ — the detector only reads the prompt string. ch1 (original) = "Factor (9x^2 - 4)." — same shape as k3's "Factor (4x^2 - 9)." (single-variable, coefficient-squared), no escalation for the capstone.

Classification: (b) true duplicate, both (template-level for k2; template-and-content-level for ch1).

REDESIGN:
- k2 → "Build the factored form of x^2 - 49." Kept the buildExpression action; moved the target from 25 (already k1's own fact) to 49, and reworded the stem so the template differs from i2's: `"build the factored form of x^# - #."` vs `"factor (x^# - #)."`.
- ch1 → "Factor (36x^2 - 25y^2)." = (6x+5y)(6x−5y). Introduces a SECOND variable for the first time in the lesson — every prior item was a single variable squared minus a plain constant, or a coefficient-squared single variable minus a constant; this is a genuine transfer of the a²−b² pattern to a two-variable expression, appropriate for the capstone. New template with an extra `"y^#"` token: `"factor (#x^# - #y^#)."`. Distractor tokens updated to match (raw-coefficients-not-rooted, and a "dropped the second variable" slip).
- k1, i3, k3 unchanged — i2/k3 are the anchors, k1/i3 were never flagged.

Math verified via node: (6x+5y)(6x−5y) expands to 36x² − 25y² with the middle terms (30xy − 30xy) cancelling.

AFTER:
```
i1  :: "build (x + #)(x − #) as a rectangle and watch what happens to the middle strips."
k1  :: "factor (x^# - #) as (x + #)(x - a). find a."
i2  :: "factor (x^# - #)."
i3  :: "factor (#x^# - #) as (#x + #)(#x - a). find a."
k2  :: "build the factored form of x^# - #."
k3  :: "factor (#x^# - #)."
ch1 :: "factor (#x^# - #y^#)."
number-normalized-prompts=[]
CLEAN
```
Verified: `node -e "JSON.parse(...)"` passes; check-progression.mjs CLEAN; reviewBasisHash `23c740d28f657ccec97975877766e425442d6c0214219b1c91c074064f89692b`.
