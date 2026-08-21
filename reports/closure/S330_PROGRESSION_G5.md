# S330 LESSON_PROGRESSION_AND_DUPLICATION — Queue Packet G5

Courses: counting-120 (c120) and decimals-place-value (dpv). Ten lessons reviewed. The detector (`scripts/audit/consolidate-pending-workload-s236.mjs`, ~L358-393) strips digits from every graded/interactive step's widget `prompt` and flags any step whose resulting normalized template exactly matches another step's template within the same lesson. Each lesson below was read in full; the flagged step(s) were traced to the sibling step(s) they collide with, and a genuine pedagogical judgment was made per collision — KEEP where the repeated template is legitimate fluency/retrieval practice or a distinct sub-case dressed in the same sentence shape, REDESIGN where it was a genuine accidental repeat of an already-covered case (usually a check/challenge pair with no real escalation in kind).

Reminder for the record: a KEEP disposition does **not** and cannot clear this row from the queue — the detector is purely structural and is not wired to any disposition field by deliberate design. KEEP rows below are expected to remain open; they are reported here as an honest review, not a suppression.

---

## c120-01-02 — Crossing to a New Ten — KEEP (no edit)

**Flagged:** i2, k2.
**Collisions:** i2 (`"Start at 48 and count on 4. Cross into the 50s. Tap where you land."`) collides with i1 (`"Start at 27 and count on 4. Cross into the 30s..."`) — both `numberLineHop` interactives, template `"start at # and count on #. cross into the #s. tap where you land."`. k2 (`"What number comes right after 49?"`) collides with k1 (`"...after 39?"`) — both `numeric` checks, template `"what number comes right after #?"`.

**Judgment:** The lesson is explicitly structured as two parallel teach→practice→check rounds (c1→i1→k1, then c2→i2→k2→k3→ch1), and c2's own text is the generalization claim being tested: *"It happens at every ten. After 49 comes 50. After 59 comes 60."* Repeating the identical interactive-then-check pair at a new decade (30s→40s in round 1, 50s→60s/70s in round 2) is the direct enactment of that stated invariance claim, not filler — it is the textbook "check immediately re-drills the skill an interactive just taught" pattern this queue's own instructions call out as legitimate. Every decade the lesson touches (30s, 40s, 50s, 60s, 70s) is used exactly once with no wasted repeats. KEPT untouched.

---

## c120-03-01 — Tens and Ones Make a Numeral — KEEP (no edit)

**Flagged:** i2, k3.
**Collisions:** i2 (`"Build 62 with ten-rods and one-cubes."`) collides with i1 (`"Build 47..."`) — both `baseTenCompose` interactives, template `"build # with ten-rods and one-cubes."`. k3 (`"What numeral is 8 tens and 0 ones?"`) collides with k1 (`"...6 tens and 2 ones?"`) — both `numeric` checks, template `"what numeral is # tens and # ones?"`.

**Judgment:** i1/i2 are ordinary spaced practice of the general tens-ones build skill at increasing values (47, then 62) — legitimate. k1 and k3 share a template but target genuinely different misconceptions: k1's traps are digit-flip (26) and add-instead-of-place-value (8); k3 specifically drills the **zero-ones edge case** (8 tens, 0 ones = 80) with traps for "forgot the placeholder ten's-digit-only reading" (8) and "miscounted tens" (18) — a distinct, harder sub-skill (a lone digit needs a trailing 0 to mean "tens only") that the lesson's own challenge (ch1, "build 80 with nothing left over") escalates further. Same template, different tested content. KEPT untouched.

---

## c120-04-03 — Tens and Ones to 120 — KEEP (no edit)

**Flagged:** k2.
**Collision:** k2 (`"110 + 10 = ?"`) collides with k1 (`"90 + 10 = ?"`) — both `numeric` checks, template `"# + # = ?"`.

**Judgment:** k1 drills crossing the century boundary (90→100) and k2 drills reaching the course's own terminal ceiling (110→120) — this specific short lesson exists to bridge exactly the numbers between 90 and 120, and both milestones are individually significant to a course literally named "counting to 120." No number in this pair repeats another check's job. KEPT untouched.

---

## c120-05-01 — One More, One Less — REDESIGNED (k3, ch1)

**Flagged:** k3, ch1 (both collide with k1 and with each other on template `"what is one less than #?"`).

**Old vs new:** The lesson's concept c2 states two rollover examples in one breath — *"One more than 39 is 40; one less than 40 is 39"* — but only the one-more rollover ever got drilled (i2's matching pairs, k2's "one more than 39"). k3, as originally written (`"What is one LESS than 70?"`, mcq, 70→69), was just k1's already-covered ordinary no-rollover case (60→59) restated at a new number — a genuine gap-filling miss, not legitimate practice, since the parallel one-less rollover case c2 itself names was never checked at all before the lesson jumped straight to ch1's much harder century-crossing case.
- **k3 redesigned** — action changed from direct compute to catch-a-mistake: *"Deshawn says one less than 40 is 30. Is he right?"* (mcq: "Yes, that's right" / "No, it should be 41" / "No, it should be 39" ✓). This now drills exactly the un-practiced one-less rollover c2 stated. **Re-verified:** 40 − 1 = 39 (not 30, which is ten less — the misconception baked into the claim itself); 41 is the one-more/one-less-direction confusion. Correct option kept at options-array index 2 to preserve the course-wide alternating-mcq-position contract enforced by `session298.counting120ChoiceParity.test.ts`.
- **ch1 redesigned** — kept the hard content (crossing 100→99) but changed the representation from direct recall to sequence-completion: *"Count back: 101, 100, ___. What comes next?"* (answer 99). **Re-verified:** 101 → 100 → 99, each step back by one; traps 90 (ten-less) and 98 (one too far) are both wrong-but-plausible and neither equals 99.

Deleted the stale `variant:{gen:"g1-counting-120", form:"OneMoreLessMcq"}` (k3) and `variant:{gen:"g1-counting-120", form:"OneMoreLessNumeric"}` (ch1) tags — both generator forms in `src/lib/g1Variants.ts` only ever reproduce a bare "What is one less/more than N?" prompt and cannot regenerate a claim-evaluation or sequence-completion widget. Hand-authored static widgets instead (no generator file touched).

---

## c120-05-02 — Ten More, Ten Less — REDESIGNED (ch1)

**Flagged:** ch1, colliding with k3 on template `"what is ten more than #?"`.

**Old vs new:** k3 (`"What is ten more than 58?"`, 58→68) tests the ordinary decade-internal case; ch1 originally reused the identical direct-recall sentence at the lesson's genuinely harder century-crossing case (90→100) with no distinguishing question type — a check-vs-challenge collision matching this queue's paradigm redesign case (harder number, identical job). Redesigned ch1 into pattern/sequence-completion, matching the course's own established convention for challenge steps (e.g. c120-01-02's ch1, "Count on: 68, 69, __"): *"Count by tens: 70, 80, 90, ___. What comes next?"* (answer 100). **Re-verified:** 70, 80, 90 counting by tens → next term is 100; traps 91 (counted on by ones instead of tens) and 110 (jumped two tens instead of one) are wrong-but-plausible and neither equals 100.

Deleted the stale `variant:{gen:"g1-counting-120", form:"TenMoreLessNumeric"}` tag (only reproduces the bare "what is ten more/less than N" prompt) and hand-authored a static widget instead. No generator file touched.

---

## c120-06 courses cross-check
(Not applicable — packet contains no c120-06 lessons; note retained only to confirm no lesson was skipped from the assignment list.)

---

## dpv-01-03 — ×10 and ÷10 as Ladder Moves — KEEP (no edit)

**Flagged:** k3.
**Collision:** k3 (`"0.5 ÷ 10 = ?  (enter as a decimal)"`) collides with k1 (`"5 ÷ 10 = ?  (enter as a decimal)"`) — both `placeValueTransformLab` "shift" tasks, template `"# ÷ # = ?  (enter as a decimal)"`.

**Judgment:** k1 drills the ladder move that first **crosses the decimal point** (5 → 0.5, ones into tenths) — the exact claim c1 opens with ("the point is a landmark, not a wall"). k3 drills a shift that stays **entirely below one** (0.5 → 0.05, tenths into hundredths), reinforcing that the identical ladder logic holds even once you're already past the point — directly on-theme for this chapter (`ch1-ladder-below-one`). The two check different, individually load-bearing instances of the lesson's central claim; same sentence shape, different tested content, with slightly different trap sets (k1 traps a wrong-direction error; k3 traps a no-op/forgot-to-shift error). KEPT untouched.

---

## dpv-02-02 — Expanded Form with Decimals — REDESIGNED (ch1)

**Flagged:** ch1, colliding with k2 on template `"which decimal equals # + #?"`.

**Old vs new:** k2 (`"Which decimal equals 2/10 + 4/100?"` → 0.24) is an ordinary two-place rebuild; ch1 originally reused the identical bare-computation sentence at the lesson's genuinely harder case (3/10 + 9/1000 → 0.309, the "empty hundredths needs a placeholder zero" misconception this lesson's own title/body calls out) — same computation job, harder numbers only. Redesigned ch1's action from direct computation to error-correction: *"Riley wrote 3/10 + 9/1000 as 0.39. That's wrong. What is the correct decimal?"* — kept the widget type `numeric` (unchanged) because `session267.decimalsPlaceValueCourse.test.ts` hardcodes this lesson's six widget types positionally, ch1 included, so a type change would have broken that fixture. **Re-verified:** 3/10 + 9/1000 = 0.3 + 0.009 = 0.309; trap 0.39 = 0.3 + 0.09 reproduces Riley's stated (wrong) answer — the 9 placed one place too early, in hundredths; trap 0.3009 = 0.3 + 0.0009 shifts the 9 one place too far, into ten-thousandths. Neither trap equals 0.309.

Deleted the stale `variant:{gen:"decimal-representation", form:"expandedDecimal"}` tag — that generator (`src/lib/variants.ts`, ~L17419) only ever emits a bare "Which decimal equals A + B?" prompt and cannot reproduce an error-correction widget — and hand-authored a static widget instead. No generator file touched.

---

## dpv-03-01 — Lining Up the Places — KEEP (no edit)

**Flagged:** k1, k2, i2, ch1 (all collide with i1 and each other on template `"which is greater: # or #?"`).

**Judgment:** This is the largest cluster in the packet (5 of 6 widget-bearing steps share one template) and was scrutinized hardest, but it resolves to the strongest KEEP in the set: the six comparisons form a deliberate 2×2 design over (equal length vs. different length) × (tenths tie vs. no tie), plus an escaping meta-question and a hardest synthesis case —

| step | pair | length | tenths tie? | what it isolates |
|---|---|---|---|---|
| i1 | 0.6 vs 0.4 | equal | no | baseline: compare first differing place |
| k1 | 0.35 vs 0.38 | equal | **yes** | tie pushes the decision to hundredths |
| k2 | 0.7 vs 0.68 | **different** | no | "more digits ≠ bigger" trap (this is c2's own stated example) |
| i2 | 0.52 vs 0.5 | **different** | **yes** | shorter number needs an implicit trailing 0 to compare hundredths |
| k3 | 0.61 vs 0.48 | equal | no | escapes detection: asks *which place* decides, not *which number* — a genuinely different question job |
| ch1 | 0.409 vs 0.41 | **different** | **yes** | "the close one": combines padding + tie AND the longer number is the smaller one |

Every collision pair has substantively different `choices`, `feedback`, and misconception `claim` tags despite the shared prompt sentence — and "Which is greater: A or B?" is simply the canonical, unavoidable phrasing for a magnitude-comparison exercise; rewording it purely to dodge the detector would make the lesson worse, which the task instructions explicitly warn against. KEPT untouched in full.

---

## dpv-04-01 — Rounding to a Whole — KEEP (no edit)

**Flagged:** k2.
**Collision:** k2 (`"Round 0.5 to the nearest whole number."`) collides with k1 (`"Round 3.8..."`) — both `numeric` checks, template `"round # to the nearest whole number."`.

**Judgment:** k1 drills the ordinary "closer wins" case (3.8 → 4). k2 drills the **exact-halfway convention** (0.5 → 1) that c2 introduces as a distinct idea in its own right — *"a tenths digit of exactly 5 rounds up... a rule people chose for consistency, not a law of nature."* That is a different kind of reasoning (apply an agreed convention vs. judge which whole is closer), not a repeat of k1's job. KEPT untouched.

---

## dpv-04-02 — Rounding to Any Decimal Place — KEEP (no edit)

**Flagged:** k3.
**Collision:** k3 (`"Round 3.15 to the nearest tenth."`) collides with k1 (`"Round 0.78..."`) — both `numeric` checks, template `"round # to the nearest tenth."`.

**Judgment:** Directly mirrors dpv-04-01's legitimate k1/k2 pair one level up: k1 drills an ordinary decider digit (8 → rounds up, unambiguous); k3 drills the **exact-halfway convention** again (decider digit exactly 5, 3.15 → 3.2), now re-established in the "any place" framework this lesson generalizes to. Distinct, individually necessary content. KEPT untouched.

---

## Summary table

| Lesson | Flagged | Result |
|---|---|---|
| c120-01-02 | i2, k2 | KEPT — legitimate two-round spaced practice of the stated "every ten" invariance |
| c120-03-01 | i2, k3 | KEPT — i2 ordinary practice; k3 is the distinct zero-ones edge case |
| c120-04-03 | k2 | KEPT — two distinct milestones (century crossing, course ceiling) |
| c120-05-01 | k3, ch1 | **REDESIGNED both** — k3 → catch-a-mistake on the un-drilled rollover case; ch1 → sequence-completion |
| c120-05-02 | ch1 | **REDESIGNED** — ch1 → sequence-completion ("count by tens") |
| dpv-01-03 | k3 | KEPT — k3 is the distinct below-one-only shift case |
| dpv-02-02 | ch1 | **REDESIGNED** — ch1 → error-correction on Riley's mistake |
| dpv-03-01 | k1, k2, i2, ch1 | KEPT — deliberate 2×2 (length × tie) design, strongest keep in the packet |
| dpv-04-01 | k2 | KEPT — k2 is the distinct exact-halfway convention case |
| dpv-04-02 | k3 | KEPT — k3 mirrors dpv-04-01's exact-halfway convention case |

**Shared generator files touched:** none. Every redesign deleted its `variant` pointer and hand-authored a static widget in place, per the strong preference in the task instructions, specifically to avoid collision risk with other concurrently-running packets touching `src/lib/g1Variants.ts` / `src/lib/variants.ts`.

**Verification performed for every edited lesson:** `node -e "JSON.parse(...)"` (valid JSON); a standalone re-implementation of the audit script's exact normalize/collide logic (confirms zero remaining flagged steps in all three edited lessons); `npx vitest run` against the course-specific schema/integrity fixtures (`session298.counting120ChoiceParity.test.ts`, `session267.decimalsPlaceValueCourse.test.ts`) plus the causal-prediction and fixed-exemplar canaries that reference these lesson IDs (`session244.causalPredictionSequencing.test.ts`, `session244.grade45CausalPrediction.test.ts`, `session272.smallP0FigureWithholding.test.ts`) — all 109 tests pass; and a full `Lesson.parse` + `lintLesson` pass against the Zod schema and pedagogy linter for all three edited files (0 lint findings), via a temporary local test file that was deleted immediately after use.

**Process note:** mid-task, all three edited files were briefly found reverted to their pre-edit HEAD state on disk, coinciding with `git status` showing an entirely different set of files modified by what is evidently another concurrent process/session sharing this working tree; a subsequent `Edit` retry reported "file modified since read" (consistent with a concurrent formatter/linter touch) but the content verification immediately after confirmed all edits were in fact present and correct on disk. Flagging this instability for the orchestrator's awareness — worth a final byte-level confirmation of this packet's three files before reconciliation, given the shared working tree.
