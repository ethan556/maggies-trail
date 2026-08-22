# S327 Fix Packet PG6 — LESSON_PROGRESSION_AND_DUPLICATION (23 lessons, 18 courses)

Fixer: cowork-s327-PG6-fixer. Contracts: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows `PROGRESSION-<lessonId>`
under workstream `LESSON_PROGRESSION_AND_DUPLICATION` for the 23 lessons in scope, plus the three
known `CHOICE_SURFACE_INTEGRITY` cross-fixes (`CHOICE-0001` as100-03-04, `CHOICE-0017` fna-03-02,
`CHOICE-0059` ti-03-02). Standard for remedial-step defects: `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md`
(R1-R6). Detector reproduced verbatim from `scripts/audit/consolidate-pending-workload-s236.mjs`
(PROGRESSION lane: `lesson.steps[].widget.prompt`, normalized `lowercase + digits->\"#\" + collapse
whitespace`, only non-first occurrences flagged) and `scripts/audit/mcq-leakage.mts` (`leaks()`,
verbatim) to verify every fix pre/post edit before recording a disposition.

Every row in this packet's `mismatch_evidence` reads `duplicate-widgets=[]; exact-prompts=[];
number-normalized-prompts=[...]` — i.e. every flagged repeat in this packet's scope is a
number-normalized-template collision (same widget template, only the numbers differ), never a
byte-identical repeat. Per-lesson disposition is (a) KEEP as legitimate spaced/fluency practice
where the repeat serves a distinct, separated retrieval purpose, or (b) redesign where the repeat is
adjacent/interchangeable with no distinguishing action, representation, misconception, constraint or
transfer demand. The flagged step id(s) in each row's `step_path` are exactly the *later* occurrence(s)
the consolidator's own algorithm names (first occurrence of a template is never flagged) — redesigns
below edit that named step, not the earlier canonical one, unless stated otherwise.

---

## ee-01-02 (expressions-equations) — PROGRESSION, step_path k2

Classification: **(b) unintentional duplicate.**
Evidence: k1 `"Evaluate 3^3."` and k2 `"Evaluate 10^4."` both normalize to `"evaluate #^#."` via
byte-identical `exactNumberLab`/`powerEvaluate` widgets (same `requiredStageKeys`
`["power:left:expand","power:left:value"]`) — same action and representation, only the numbers
differ. k2 sits immediately after `c2`, which teaches a *distinct* fact (powers of ten are 1 followed
by that many zeros), but the old k2 still forced the full expand-and-multiply lab, which defeats the
shortcut instead of testing it.
BEFORE (k2 widget): `exactNumberLab`/`powerEvaluate`, prompt "Evaluate 10^4.", traps 40/1000.
AFTER: `numeric` widget, prompt "Use the zeros shortcut — no expanding needed. What is 10^6?",
answer 1,000,000; traps recomputed in node for exp=6 — 60 (`10*6`, multiplies instead of counting
zeros) and 100,000 (`10^5`, one zero short). Dropped the stale `variant: {gen:"power-product",
form:"basicPower"}` tag: that generator's own `basicPower` form re-emits `"Evaluate {base}^{exp}."`
(collides again), and its `tenPower` form emits `"Evaluate 10^{exp}."` (also normalizes to
`"evaluate #^#."`, colliding with k1) — no existing generator form tests the zeros-shortcut
recognition without reproducing the collision, so the step is now static-authored (precedented:
9/56 check-kind steps in this course already carry no `variant`).
Verified: post-edit `number-normalized-prompts=[]` for the whole lesson (was `[k2]`); JSON valid;
`k2` not referenced by any pinning test (`session244.grade6CausalPrediction.test.ts` pins only `i1`;
`session261.vis03SingletonClosure.test.ts` pins only `c2`). Not a remedial (`lesson.steps`, not
`lesson.remedials`) — S316 standard not applicable.
reviewBasisHash: `1e708089259db30437ec1c780e73e7083d2d09aea4438c9f8440e64ae42f83c8`

---

## ee-05-01 (expressions-equations) — PROGRESSION, step_path k1

Classification: **(a) legitimate progression — KEEP, no rewrite.**
Evidence: i1 `"Is x = 6 a solution of x > 5?"` and k1 `"Is x = 5 a solution of x > 5?"` both normalize
to `"is x = # a solution of x > #?"` via the same `exactNumberLab`/`inequalityMembership` lab.
Read in context: i1 (candidate 6, strictly past the boundary) is guided practice on the general
membership mechanic; k1 (candidate 5, exactly AT the boundary) immediately escalates to the
strict-inequality boundary-exclusion edge case — a different constraint (interior point vs. boundary
point) surfacing a different, more specific misconception ("the boundary always counts" / "5 is close
enough") that i1's own distractors (equality-vs-inequality confusion, vague "can't tell") never
exercise. `c2`, immediately after k1, formally states the strict-vs-inclusive rule — k1 is deliberate
cognitive setup for that concept, not idle repetition. Action and representation are identical by
design (one lab mechanic, immediately stress-tested on its hardest case); constraint and targeted
misconception are not. No edit made.
reviewBasisHash: `060baf27e02cec0d7abaea2ed2f7ccb14d5cb3b8314a02eabab5d93ab887c2d3`

---

## fna-01-01 (function-analysis) — PROGRESSION, step_path k3

Classification: **(b) unintentional duplicate.**
Evidence: k1 `"...f(x) = x² on [1, 3]?"` (answer 4) and k3 `"...f(x) = x² on [2, 5]?"` (answer 7) both
normalized to the identical template, same `numeric` widget, and the identical two traps
(output-change-only; divide-by-b). k3's own body — "A bigger curved interval" — confirmed the only
intended variation was magnitude; no new misconception.
BEFORE: k3 = `f(x) = x² on [2, 5]`, answer 7, traps 21 / 4.2.
AFTER: k3 redesigned to a both-negative, decreasing interval — `f(x) = x² on [−3, −1]`, a falling
arc with a NEGATIVE rate (−4) — exercising a genuinely new misconception (order/sign of `f(b) − f(a)`
and the double-negative denominator `−1 − (−3)`) distinct from k1 (positive/increasing), k2 (linear
special case), and ch1 (shifted-quadratic negative-*output* twist, a different mechanism). Recomputed
in node: `f(−3)=9, f(−1)=1, rate=(1−9)/(−1−(−3))=−8/2=−4`; traps 4 (`(fa−fb)/(b−a)`, drops the sign)
and 2 (misreads `−1−(−3)` as `−1−3=−4`, giving `−8/−4=2`) — both ≠ −4 and ≠ each other.
**Pitfall caught and fixed:** a first pass kept k1's sentence shape and only swapped in the negative
bracket numbers — this *still* collided, because the consolidator's normalizer regex
(`/[-−+]?\d+(?:[.,/]\d+)*/g`) captures a leading sign as part of the number token, so `[−3, −1]` and
`[1, 3]` both reduce to `[#, #]`. The final fix restructures the sentence itself ("As x runs from −3
to −1 on f(x) = x², the curve is FALLING. What is the average rate of change over that stretch?"),
which is template-distinct as well as content-distinct — recorded here since the same trap (sign
alone ≠ template difference) will recur for any other lesson in this packet using signed numbers.
Dropped k3's `variant` tag: the generator's only unclaimed form (`default`) draws `a,b` from
positive-only ranges and can never reproduce a negative interval — keeping the tag would have
silently reverted k3 to a same-family positive draw on replay walks.
Verified: post-edit `number-normalized-prompts=[]` for the whole lesson; JSON valid. Not a remedial —
S316 standard not applicable.
reviewBasisHash: `77c92e9ecfce9481c0d89111ba060bdf622773303662e2692331b89da20e948d`

---

## fna-03-02 (function-analysis) — PROGRESSION k2 (KEEP) + CHOICE-0017 cross-fix k3

**PROGRESSION, step_path k2 — (a) legitimate progression, KEEP, no rewrite.**
k1 (x=2) is the boundary case (branch-selection traps: 7, 2). k2 (x=3, body "Deep in the second
branch") is deliberately non-boundary and targets a different, arithmetic-mechanics misconception —
trap 6 is 3 doubled instead of squared (3×2 vs 3×3), unrelated to branch selection and impossible to
even construct at the boundary. Same boundary-vs-general-interior pattern already approved for
ee-05-01 above.

**CHOICE-0017 cross-fix, step_path k3 — length-prose-vs-prose (92 chars vs longest distractor 34).**
k3's mcq answer ("So every input has exactly one owning rule…", 92 chars) towered over two bare,
unelaborated distractor labels (34 / 28 chars).
BEFORE: o2 `"Because x = 2 is not in the domain"` (34); o3 `"It's only a style preference"` (28).
AFTER: o2 `"Because x = 2 sits exactly on a boundary, and boundary points are left out of every
rule's own domain"` (101) — false: x = 2 IS in the domain, owned by the `x ≥ 2` branch. o3
`"It is just a style choice between < and ≤ here, since both rules would give the same value at
x = 2 anyway"` (106) — false: 2 + 5 = 7 vs 2² = 4 (verified in node), not the same value. Both
distractors are now comparably fleshed-out, plausible-but-false prose rather than bare labels; their
`feedback` text was updated to rebut the new specific wording.
Verified in node: new `longestWrong = 106`, answer `= 92` → `92 > 106×1.5` is false (leak clears on
the ratio alone; margin also negative). No `ABSOLUTE` word landed in *both* distractors (tell needs
all wrong options to carry one). Answer still carries no `QUALIFIER` word, so `lone-justification`
does not newly fire. Prompt ends in `?`, so the grammar tell does not apply.
reviewBasisHash: `d3dd1e3ffd144076ec5562f2a5c9a11eac856cf3096652afa3565a847e7fb4be`

---

## gf-03-03 (geometry-foundations) — PROGRESSION, step_path k2

Classification: **(a) legitimate progression — KEEP, no rewrite.**
c1 teaches three distinct coordinate rotation rules (90°: `(−y,x)`; 180°: `(−x,−y)`; 270°: `(y,−x)`).
k1 drills the 90° rule (traps: 1 = old y left unmoved; −4 = the 270° rule's answer — i.e. confusing
which rule applies); k2 drills the 270° rule (traps: 1 = old x without its sign flip; 7 = old y in the
wrong slot). Two different transformation formulas, each step's traps built to catch confusion with
the *other* named angle — the shared sentence template is structurally required (it must fit any of
the three taught angles); the angle itself is the constraint the consolidator's digit-normalization
cannot see past. No edit made.
reviewBasisHash: `f7eba86848d9f8b7dfff5bfba5b32f29e0d4714e4a5ae0b955aff6e1a884467c`

---

## gf-05-02 (geometry-foundations) — PROGRESSION, step_path k2

Classification: **(a) legitimate progression — KEEP, no rewrite.**
c2 teaches a four-entry "fingerprint chart" mapping sign patterns to rigid motions (x-only flip →
y-axis mirror; y-only flip → x-axis mirror; both flip → 180° rotation; swap → y = x mirror). i2 drills
the x-only-flip entry (correct: y-axis reflection); k2 drills the both-flip entry (correct: 180°
rotation) — different option sets, different correct answers, not the same question restated. The
shared mcq stem is structurally required to fit any of the four fingerprints; `duplicate-widgets=[]`
in the same queue row already confirms the full widget signatures differ, only the stem text
collided. No edit made.
reviewBasisHash: `5554469809c85050b798db5c12e8e0cdd4114f6aedee4ff813e1a9882b4845c4`

---

## kc-01-03 (counting-to-20-k) — PROGRESSION, step_path i2

Classification: **(a) legitimate spaced/fluency practice — KEEP, no rewrite.**
Kindergarten counting-on lesson (`readingProfile: early`); its entire purpose is repeated hop-forward
practice with a gently rising hop count — the expected design at this level. i1 (start 3, 2 hops →
5) is the first hop-forward practice, right after c1. i2 (start 5, 3 hops → 8) is explicitly labeled
by its own body text — "A longer hop trip" — a signposted escalation to 3 hops, after c2 and k1
(single hop) intervene. Traps recomputed for the new hop count. No edit made.
reviewBasisHash: `0ed156a490feb4bf36538992586d590bd924f537d1611771ff8e3ed5a3dcb97f`

---

## kc-05-01 (counting-to-20-k) — PROGRESSION, step_path i2 k2 k3

Classification: **(a) legitimate coverage/fluency practice — KEEP, no rewrite.**
Kindergarten "Make Ten" lesson; its curricular purpose is drilling the canonical "friends of ten"
pairs (1+9, 2+8, 3+7, 4+6, 5+5). Each flagged step drills a DIFFERENT pair, never a repeat: i1
`preFilled=8` (partner 2), i2 `preFilled=7` (partner 3), k1 `preFilled=6` (partner 4), k2
`preFilled=9` (partner 1), k3 `preFilled=3` (partner 7), ch1 tests 5+5 against three wrong pairs.
c2, between k2 and k3, names the specific pairs the lesson drills ("6 and 4, 9 and 1, and 5 and 5"),
confirming systematic pair coverage — not repetition — is the authored intent; k3 (3 and 7) completes
that coverage. Each step's `commonCounts` are recomputed for its own pair. No edit made.
reviewBasisHash: `2d93e3c7e1c4d1c3058e92dd9ff2ce4886df08bb18f2f50d0a91b1700fc885b8`

---

## ti-03-01 (trig-identities-equations) — PROGRESSION, step_path k2

Classification: **(a) legitimate progression — KEEP, no rewrite.**
The lesson's stated teaching point (c1, c2, r1) is that cosine's sign FLIPS between sum and
difference: `cos(A+B) = cosAcosB − sinAsinB` vs `cos(A−B) = cosAcosB + sinAsinB`. k1b tests the SUM
case (`cos 75°`, minus sign, 0.2588) and k2 tests the DIFFERENCE case (`cos 15°`, plus sign, 0.9659)
— the two complementary halves of the one concept, not a repeated computation. k2's own trap (0.2588,
"that's cos 75°… the difference flips cosine's sign to PLUS") is explicitly built around confusing it
with k1b's answer, confirming intentional contrast. No edit made.
reviewBasisHash: `4653bc4aeed9c45d37d91281f57d2762276614fa037cad00af64171253198000`

---

## ti-03-02 (trig-identities-equations) — PROGRESSION ch1 (KEEP) + CHOICE-0059 cross-fix k3

**PROGRESSION, step_path ch1 — (a) legitimate progression, KEEP, no rewrite.**
k1 tests the SUM tangent formula (`tan 75° = tan(45°+30°)`, 3.732); ch1 tests the DIFFERENCE form
(`tan 15° = tan(45°−30°)`, 0.268) — same sum-vs-difference contrast already established for ti-03-01.
ch1's trap (3.732, "the reciprocal-ish partner") targets confusion with k1's answer directly.

**CHOICE-0059 cross-fix, step_path k3 — lone-justification.**
k3's mcq answer o1 (`"cos θ, since the sine term survives the expansion."`) was the only option
carrying a `QUALIFIER`-regex word ("since"); o2/o3 used "if"-clauses that don't match the regex.
BEFORE: `"cos θ, since the sine term survives the expansion."` (also somewhat ambiguous — "the sine
term" is unclear about which factor survives).
AFTER: `"cos θ — sin 90° = 1 survives; cos 90° = 0 vanishes."` — removes the trigger word and is more
precise, matching the option's own `feedback` field (`1·cosθ − 0·sinθ = cosθ`). Math verified against
k3's `explanationVariants`: `sin(90°−θ) = sin90°cosθ − cos90°sinθ = 1·cosθ − 0·sinθ = cosθ`.
**Pitfall caught:** a first draft that only deleted "since" (keeping the longer original clause,
84 chars) introduced a NEW `length-prose-vs-prose` leak against the 49-char longest distractor;
verified in node before finalizing the 51-char replacement, which clears both checks with margin.
reviewBasisHash: `e676073ff27fe8500d6ed652e669517847d1b2b6599786c3ec9d452550f49d2a`

---

## as-04-01 (add-subtract-20) — PROGRESSION, step_path k2

Classification: **(a) legitimate spaced/fluency practice — KEEP, no rewrite.**
Grade 1 fact-families lesson; its recap states the transferable point explicitly: "Knowing one fact
gives you the other three" — generalizing across DIFFERENT families is the skill (same rationale as
kc-05-01 above). k1 drills family (8,5,13); k2 drills a different family (9,4,13) — k2's own body
text, "A new family," is the author's fluency-drill framing, and its traps are recomputed for the new
numbers (22 = addition-instead-of-subtraction; 5 = the off-by-one slip specific to 9+5=14, not
reused from k1). No edit made.
reviewBasisHash: `65fdb1cd5abd82b8706698ca77f4f03536f306998213f55eef9ccdb267410309`

---

## as100-03-04 (add-subtract-100) — PROGRESSION k2 (KEEP) + ch1 (redesign) + CHOICE-0001 cross-fix k3

**PROGRESSION, step_path k2 — (a) legitimate, KEEP.** k1 (62−37) predates c2's explicit naming of
the two traps, and its own trap value (35) conflates flip-trap and forgot-to-break into one ambiguous
number. k2 (74−28), body "Split the two traps," is the first check after c2 names both traps
explicitly, and cleanly isolates each into its own trap value (54 = flip; 56 = forgot-spent) — a real
escalation in diagnostic precision.

**PROGRESSION, step_path ch1 — (b) unintentional duplicate, redesigned.** ch1 (83−45) used the
identical clean two-trap structure as k2 (42 = flip; 48 = forgot-spent), same widget type, same hint
scaffolding already present at k2 — its "solo!" framing wasn't backed by any actual affordance
difference.
BEFORE: `"83 − 45 = ?"` (bare equation, same shape as k1/k2).
AFTER: `"A rack starts with 83 shirts. The store sells 45 of them today. How many shirts are left on
the rack?"` — same numbers/answer (38), but now requires extracting the subtraction from a story
context (transfer demand), which no other step in the lesson does. Recomputed in node: `83−45=38`;
flip trap `42=(8−4)×10+(5−3)`; forgot-spent trap `48=(8−4)×10+(13−5)` — both unchanged (word-problem
framing doesn't affect the underlying arithmetic); only feedback text was recontextualized to
"shirts."

**CHOICE-0001 cross-fix, step_path k3 — length-prose-vs-prose (38 chars vs longest distractor 22).**
BEFORE: distractor b `"every time we subtract"` (23); c `"when the answer is big"` (23).
AFTER: b `"every time you subtract two numbers, no matter what the digits are"` (66); c `"whenever
the answer works out to be a big two-digit number"` (58) — both remain false (rebutted by the
existing, unchanged `feedback`: 86 − 52 needs no break; answer size is irrelevant) and are now
comparably fleshed-out. Verified in node: `longestWrong=66`, answer `=38` → ratio and margin checks
both clear; no `ABSOLUTE` word introduced in either distractor.
reviewBasisHash: `31f0a4da258b1409e77f3e9f86d4633c27eb18f1bb2f5aa735e17521b0cd1f0f`

---

## cx-02-01 (coordinate-proofs) — PROGRESSION, step_path k2

Classification: **(b) unintentional duplicate.**
Unlike the gf/ti pairs above (different rule/formula behind a shared stem), k1 (ratio 2:1) and k2
(ratio 1:3) applied the identical forward formula `P = A + k(B−A)` with the same three trap kinds
recomputed for new numbers — no stated escalation purpose. k3 already supplies the lesson's genuine
direction-reversal escalation ("from B"), making k2 the redundant middle step.
BEFORE: k2 = forward problem, "P divides segment A(2,0)→B(10,8) in ratio 1:3, enter P's
x-coordinate", answer 4.
AFTER: k2 redesigned as the INVERSE problem — given A and P (not B) plus the ratio, solve backward
for B's x-coordinate: `"P divides the segment from A(1, 2) to B in the ratio 1 : 4, and P = (4, 3).
What is B's x-coordinate?"`, answer 16. Genuinely different transfer demand (algebraic inversion,
`B = A + (P−A)/k`) not tested elsewhere in the lesson. Recomputed in node: forward-constructed
`B=(16,7)` from `A=(1,2)`, `k=0.2` gives exactly `P=(4,3)` (construction verified), then solved
backward: `dx=3`, `Bx=1+3/0.2=16`. Traps: 7 (treats P as the midpoint, `2P−A`) and 4 (copies P's own
x-coordinate) — both ≠ 16, ≠ each other.
Dropped k2's `variant` tag after reading (read-only) `src/lib/geometryVariantTemplates.json`: the
`g10-coordinate-proofs`/`cx-partition__numeric` tag draws via random `pick()` (in
`src/lib/geometryVariants.ts`) from a **fixed 3-item bank** containing k1's own item, the *old* k2
item just replaced, and ch's own item — keeping the tag risked k2 redrawing the exact old colliding
item on replay.
**Noted, not fixed (pre-existing, out of scope):** k1 and ch still share this same form tag and
3-item bank, so on replay walks they can already draw each other's content or collide — a structural
property of this template-bank generator across many geometry-family lessons (unaffected by, and
unrelated to, this edit); fixing it would mean editing `src/lib/geometryVariants.ts` or the shared
templates JSON, outside the 23-file scope of this packet.
reviewBasisHash: `b7f57eafbb030a8852418f2ddda55f8a08f8af7476ece595c6e241b56ed5d466`

---

## g1s-02-04 (compose-shapes-g1) — PROGRESSION, step_path k3

Classification: **(b) unintentional duplicate — the worst case in this packet.**
k1 and (old) k3 were byte-identical in every field except the digit "4" vs "8" pattern blocks in the
stem — a number the question never uses. All four mcq options, all feedback, the correct answer,
hints, `conceptTag`, and even the stale `variant` tag were verbatim identical.
BEFORE: k3 = `"You fill an outline with 8 pattern blocks. What must be true when you finish?"`
(identical options/feedback to k1).
AFTER: k3 redesigned to test a different, already-set-up idea: c2 and i1's own predict block
establish that DIFFERENT piece sets can each validly fill the same outline ("a square can take two
triangles, or four small squares"). New k3: `"A square outline was filled with 2 triangles yesterday.
Today it gets filled with 4 small squares instead, and both fills have no gaps and no overlaps. Is
today's fill also correct?"` — tests equivalence-of-valid-fillings, with new distractors (assumes
only the first fill counts; assumes piece count must match) absent from k1's option set.
Dropped k3's `variant` tag: read (read-only) `src/lib/g1Variants.ts` and confirmed
`Smg1ShapeSidesMcq` generates an unrelated item ("Which shape has N sides and M corners?") already
mismatched to this lesson before my edit — a pre-existing defect shared by k1/ch1 (not touched, out
of scope); kept off only for my rewritten step to avoid replay drawing off-topic content over it.
reviewBasisHash: `0af69b538562ad7c547f7271b9064323011eec8bdd2ee5e71d270860330ce9ca`

---

## g5e-01-04 (expressions-patterns-g5) — PROGRESSION, step_path k3

**Queue evidence**: number-normalized-prompts=[k3], colliding with k1. Both normalize to `"compute # × # − #, multiplying before subtracting."` — same order-of-operations skill, same 4×8−20 numbers, differing only in trap values.

**Classification**: (b) true unintentional duplicate.

**BEFORE (k3)**:
- prompt: `"Compute 4 × 8 − 20, multiplying before subtracting."`
- answer: 12, traps: 32, 15

**AFTER (k3)**:
- prompt: `"A student computed 4 × 8 − 20 by subtracting first (8 − 20 = −12) and then multiplying by 4, getting −48. What is the correct value of 4 × 8 − 20?"`
- answer: 12, traps: -48 (the shown wrong-order result), 32 (right order, wrong second step)
- body/explanationVariants/hints updated to match the error-diagnosis framing
- `variant` tag `{gen:"g4-multiply", form:"mbMultiStepNumeric"}` dropped — read `src/lib/g4Variants.ts` (read-only, ~line 873-878): this generator form produces an unrelated "class buys packs of markers" word problem, not this step's content.

**Math recomputed** (node): 4×8=32; 32−20=12 (correct). 8−20=−12; 4×(−12)=−48 (the shown wrong-order result, now used as a distractor).

**Rationale**: k1 already covers "compute this expression correctly, watch the order." k3 duplicated that exact action on the exact same numbers. Redesigned k3 to a diagnose-a-worked-error format — a materially different cognitive demand (spot what went wrong in a shown derivation vs. compute from scratch) while keeping the same underlying arithmetic fact (4×8−20=12), consistent with the diagnose-an-error pattern already used elsewhere in this packet (ee-01-02, cx-02-01).

**Verified**: `check_lesson.mjs` on the edited file — duplicate-widgets=[], exact-prompts=[], number-normalized-prompts=[] across all six steps (i1, k1, i2, k2, k3, ch1). No CHOICE_SURFACE_INTEGRITY leaks (lesson has no mcq widgets).

**reviewBasisHash**: `56fa55f9a6de0017b504301ac431fcf954d8ea897678370c27c3fb5e5ece5ed8`

---

## g4p-01-01 (patterns-factors-g4) — PROGRESSION, step_path i2

Classification: **(a) legitimate transfer practice — KEEP, no rewrite.**
i1 (area 24, sides 4×6) sits before c2 teaches the search strategy and reuses c1's own worked-example
numbers — first hands-on attempt at the mechanic. i2 (area 36, sides 9×4) sits after c2, and its own
body text states the purpose directly: "Transfer the rectangle test to a new area, using a non-square
factor pair" (36 is a perfect square with pair 6×6 available; the non-square pair 9×4 is deliberately
assigned instead). Same before/after-the-strategy pattern already approved for ee-05-01 and
fna-03-02. No edit made.
reviewBasisHash: `bd30c65ccbd6b376af101baa681608da36842035abe21c0674be99b57b3f22f9`

---

## g5f-03-04 (fraction-division-g5) — PROGRESSION, step_path k3

**Queue evidence**: number-normalized-prompts=[k3], colliding with k1. Both normalize to `"roughly how big is # ÷ #, without computing exactly?"`.

**Classification**: (b) true unintentional duplicate.

**BEFORE (k3)**: `"Roughly how big is 7 ÷ 1/4, without computing exactly?"` with a 4-option skeleton ("About 28 because...", "About 1.75 — dividing makes things smaller", "About 7, since 1/4 is close to nothing", "About 4, because a whole holds 4 fourths") — a templated clone of k1's own skeleton (5 ÷ 1/3 / "About 15 / 1.7 / 5 / 3"), swapped fraction and whole number only, no new concept step separating them from a taught strategy shift.

**AFTER (k3)**: `"For 9 ÷ 1/2, which best describes what happens to the 9?"` — options: "It roughly doubles, since each whole holds 2 halves" (correct) / "It roughly halves, since dividing usually shrinks things" / "It roughly triples, the same as dividing by a third" / "It stays about the same, since 1/2 is already part of a whole". Explanation variants and hints updated to match.

**What changed**: action shifted from *produce a numeric estimate* to *identify the qualitative multiplicative relationship* (doubles/halves/triples/unchanged); misconception target shifted from "dividing shrinks things" / "the fraction is negligible" / "per-whole vs. total confusion" to a new one — conflating which unit fraction produces which multiplier (thinking halves triple the way thirds do), or believing a fraction "part of a whole" leaves magnitude unchanged.

**Math recomputed** (node): 9 ÷ (1/2) = 18 → 9 roughly doubles. Confirmed correct.

**Verified**: `check_lesson.mjs` — duplicate-widgets=[], exact-prompts=[], number-normalized-prompts=[] across all six steps; new k3 template `"for # ÷ #, which best describes what happens to the #?"` is structurally distinct from every other step. No CHOICE_SURFACE_INTEGRITY leak: option lengths 51/56/51/61 chars (well inside the 1.5×/12-char LENGTH threshold), no lone qualifier/absolute word, no numeric-only or unit-only odd option. k3 carried no `variant` tag originally, so none to drop.

**reviewBasisHash**: `9febbe339001a4e578dc6998cb3a6eb8aac296984a5e8507168874f59e85029b`

---

## pc-01-02 (parametric-polar-calculus) — PROGRESSION, step_path ch1

**Queue evidence**: number-normalized-prompts=[ch1], colliding with k1. Both normalize to `"x = #t, y = #t, for t from # to #. find the arc length."`.

**Classification**: (b) true unintentional duplicate.

**BEFORE (ch1)**: `"x = 6t, y = 8t, for t from 0 to 2. Find the arc length."` (answer 20) — a 6-8-10 triangle, exactly the 3-4-5 triangle from k1 scaled by 2. The step's own explanationVariants admitted it: *"this is another 3-4-5 triangle, scaled by 2"* — the authored text itself flags it as the same worked example restated, not a fresh case.

**AFTER (ch1)**: `"A point moves with x = 8t, y = 15t. It travels 51 units of arc length. What value of t does that take?"` (answer 3) — a fresh 8-15-17 triple, and the action is inverted: given the distance, solve for the parameter, rather than given the parameter, compute the distance.

**What changed**: action inverted (forward compute → inverse solve-for-t), leaning on c2's "integrand IS the speed" framing taught between k1 and ch1. Same technique already approved in this batch for cx-02-01 (backward P/B solve).

**Math recomputed** (node): hypot(8,15)=17; 17×3=51 → t=3. Distractors: 867=17×51 (multiply instead of divide), 6.375=51/8 (x-rate only), 3.4=51/15 (y-rate only) — all verified.

**Variant tag dropped**: `{gen:"g13-parametric-polar-calculus", form:"...pc-arc-length__numeric"}` — read `src/lib/calculusVariants.ts` (read-only, ~line 2829-2841): `parametricArcNumericWidget` always produces a forward "Find its arc length" prompt from a fixed 12-case bank (never an inverse solve-for-t prompt), and its own prompt shape ("The curve has x(t) = ... for 0 ≤ t ≤ ...") already diverged from the hand-authored JSON text before this edit — the tag was already stale.

**Verified**: `check_lesson.mjs` — duplicate-widgets=[], exact-prompts=[], number-normalized-prompts=[] across all five widget-bearing steps. No CHOICE_SURFACE_INTEGRITY leak (k3 is the lesson's only mcq, untouched).

**reviewBasisHash**: `743776466cde45c247e77c95469e984fef7164d4c5c533d486a21082b5465426`

---

## pp-04-02 (polar-parametric) — PROGRESSION, step_path k3 (KEEP)

**Queue evidence**: number-normalized-prompts=[k3], colliding with k2. Both normalize to `"eliminate t from x = #cos t, y = #sin t."`.

**Classification**: (a) legitimate progression — KEEP, no rewrite.

**Why the collision is superficial, not real**: k2 (x=2cos t, y=2sin t — EQUAL coefficients) produces a circle, x² + y² = 4, matching c2's own worked example at a new magnitude. k3 (x=3cos t, y=2sin t — UNEQUAL coefficients) produces an ellipse, (x/3)² + (y/2)² = 1 — a structurally different final equation form that k2 cannot exercise.

**Evidence this is structural, not cosmetic**: the buildExpression token banks differ meaningfully — k2 offers no swapped-divisor distractor (moot when both divisors are equal); k3 offers `(x/2)² + (y/3)²` as a swapped-divisor distractor and a `x² + y² = 5` commonBuilds path representing "add the two unequal coefficients as if one shared constant" — a misconception that cannot arise when the coefficients are equal. k3's own explanationVariants state the generalization explicitly: *"Different divisors on x and y give an ellipse, not a circle."*

**Rationale**: matching two different divisors to two different variables is a genuine new attention-to-structure demand, not a magnitude-only restatement — the same before/after-generalization pattern already approved for g4p-01-01, ee-05-01, and fna-03-02 in this packet.

**Verified**: `check_lesson.mjs` reproduces the queue's own flag (number-normalized-prompts=[k3]) confirming detector fidelity; no CHOICE_SURFACE_INTEGRITY leak on i1 (the lesson's only other mcq-adjacent widget).

**reviewBasisHash**: `be2e2a908e1bf3659f88e3fdd180a4ef448cf708a35f68680fcac8ce8694880e`

---

## sr-04-01 (sequences-series) — PROGRESSION, step_path i4

**Queue evidence**: number-normalized-prompts=[i4], colliding with i3. Both normalize to `"use the trick on s = # + # + #. (#s − s = # − #.)"`.

**Classification**: (b) true unintentional duplicate — though the deeper redundancy was against k1, not i3.

**Analysis**: i3 (r=3: S=2+6+18, answer 26) is legitimate scaffolded practice on c3's just-introduced "extra division by (r−1)" twist. The OLD i4 (r=2: S=4+8+16, answer 28) shared i3's wording template but not its mechanic — with r=2, 2S−S=S directly, no extra division needed, which is exactly k1's (r=2: 3+6+12+24=45) already-tested mechanic. So the old i4 was a magnitude-only restatement of k1's action, sitting as an unexplained regression between i3 (drills the new twist) and ch1 (applies the twist again at r=5).

**BEFORE (i4)**: `"Use the trick on S = 4 + 8 + 16. (2S − S = 32 − 4.)"` (answer 28)

**AFTER (i4)**: `"S = 3 + 12 + 48, with ratio 4. Work the whole derivation yourself this time — no formula handed to you. What is S?"` (answer 63)

**What changed**: ratio changed to r=4 (distinct from i3's r=3 and ch1's r=5, still requiring the extra-division twist), AND the pre-built `rS − S = X − Y` scaffolding i3 hands the learner is removed — i4 now requires constructing the full derivation unaided. This is a genuine scaffolding-fade action change, matching this lesson's own natural arc: c3 fully worked → i3 partially scaffolded → i4 now unscaffolded → ch1 independent challenge.

**Math recomputed** (node): S=3+12+48=63; 4S=252; 4S−S=3S=192−3=189; 189/3=63. Distractors: 189 (undivided 3S, forgot the final division), 60 (12+48, dropped first term) — both verified.

**Verified**: `check_lesson.mjs` — duplicate-widgets=[], exact-prompts=[], number-normalized-prompts=[] across all six widget-bearing steps. No mcq widgets in main `.steps`, so no CHOICE_SURFACE_INTEGRITY exposure. i4 carried no `variant` tag originally.

**reviewBasisHash**: `e487732fe60ac9356ba0786a6a7287d348ed0683d8424c460d21a5756cbae8fa`

---

## tf-02-02 (trig-functions) — PROGRESSION, step_path k2 (KEEP) + ch1 (redesign) — 3-way collision vs i2

**Queue evidence**: number-normalized-prompts=[k2, ch1], both colliding with i2. All three normalize to `"convert #π/# to degrees."`. Split disposition: k2 KEEP, ch1 rewrite.

**k2 — (a) legitimate progression, KEEP**: i2 (5π/6=150°, denominator-6/30°-step family, under the 180° anchor) is the first read-back practice. k2 (3π/2=270°, denominator-2/90°-step family, past the 180° anchor) tests a genuinely different family AND the harder "exceeds the anchor" case. Confirmed by `src/lib/variants.ts`'s own `radian-convert` generator (read-only, ~line 7446-7578): its default form is purpose-built for exactly the "180<deg<360" case across a multi-denominator family bank — the corpus's own tooling treats "different family, past-anchor" as the intended legitimate variation axis.

**ch1 — (b) true unintentional duplicate, rewritten**: OLD ch1 (7π/6=210°) reused i2's own denominator-6 family (not fresh, unlike k2) AND reused k2's "past anchor" property, adding nothing new — while sitting after c3 (negative angles turn clockwise) and i3 (tests "past one lap") without ever exercising c3's actual content. A challenge step that should escalate was instead a magnitude repeat of i2.

**AFTER (ch1)**: `"Same size steps as before, but this angle runs clockwise: −5π/6. What degree measure is that?"` (answer −150) — same magnitude/family as i2 (5π/6=150°), but now negative, requiring the clockwise-direction fact from c3.

**Math recomputed** (node): 5×30=150, sign flips to −150.

**Variant tag dropped** on ch1 (`{gen:"radian-convert"}`, no form): none of the 5 named forms or the default form ever produce a negative output — read source confirms, so keeping it would regress the step on replay.

**Verified**: `check_lesson.mjs` — ch1's collision against i2 resolved (new template structurally distinct); k2 remains flagged against i2 as expected for an approved-KEEP row (wording deliberately unchanged), confirming the tool still reproduces the queue's original two-step_path flag for the untouched half. No CHOICE_SURFACE_INTEGRITY leak (no mcq widgets in main `.steps`).

**reviewBasisHash**: `bebf29949756c527216e80fe0aff756ac53d84c8f53a8931358b9edd04297e4e`

---

## tg-05-01 (trig-graphs-inverses) — PROGRESSION, step_path k3 + ch1 vs k1 (KEEP, all three)

**Queue evidence**: number-normalized-prompts=[k3, ch1], both colliding with k1 — a three-way collision, all normalize to `"what is arcsin(sin(#π/#))?"`.

**Classification**: (a) legitimate progression across all three — KEEP, no rewrite.

**Why the collision is superficial**: identical wording, but three different quadrants, each requiring a distinct sign/reduction rule and targeting a distinct, explicitly-named misconception:

- **k1** (x=5π/6, QII, sin=+1/2): mirror rule x → π−x, matching c1/i1's own 150° worked example — the first formal check of the base trap. Distractors: return-x-unchanged; report-the-intermediate-sine-value (general trap-blindness).
- **k3** (x=5π/3, QIV, sin=−√3/2): sits AFTER c2 states the QII mirror rule, requires a DIFFERENT reduction (subtract a full turn, x−2π). Its wrong option o3 explicitly targets mirror-rule OVERGENERALIZATION: *"That uses the π − x mirror, which only works when x is between π/2 and 3π/2. Here subtract 2π instead."* This misconception could not exist before c2 taught the mirror rule — proof of deliberate sequencing.
- **ch1** (x=7π/6, QIII, sin=−1/2): a third reduction (subtract π, track the sign), targeting a third distinct misconception — SIGN-tracking failure (wrong option o3: `"π/6"` with feedback *"Sign check: sin(7π/6) = −1/2, NEGATIVE"*).

**Rationale**: this satisfies the redesign rubric's "different misconception" axis directly — three distinct, explicitly-named error patterns, one per quadrant. The correct handling of arcsin(sin x) genuinely depends on the quadrant, so quadrant-by-quadrant coverage is the intended breadth of practice for this "trap" lesson, not duplication.

**Verified**: `check_lesson.mjs` reproduces the queue's own flag (k3, ch1 both vs k1) exactly, confirming detector fidelity. No CHOICE_SURFACE_INTEGRITY leak on any of the lesson's three mcq widgets (k1, k3, ch1).

**reviewBasisHash**: `3117059920d764b7601e6899b41a59a3343a48037715c40c0918bba3cec7031a`

---

## tse-01-02 (two-step-equations) — PROGRESSION, step_path k2 + k3 (KEEP, both — two independent pairs)

**Queue evidence**: number-normalized-prompts=[k2, k3] — two independent collision pairs: k2 vs k1 (`"simplify: #x - #x"`), k3 vs i3 (`"simplify: #(x + #) + #x"`).

**Classification**: (a) legitimate progression for both pairs — KEEP, no rewrite.

**Pair 1 (k2 vs k1)**: k1 (2x − 7x, coefficients +2 and −7) tests the DIFFERENT-signs branch of the combine-like-terms rule — the only branch c1's own worked example demonstrates. k2 (−3x − 5x, coefficients −3 and −5) tests the SAME-signs branch, stated explicitly in its own explanationVariants: *"Same signs (both negative): 3+5=8, keep negative."* This is the first test of the same-signs branch anywhere in the lesson.

**Pair 2 (k3 vs i3)**: i3 (2(x+3)+4x, distributing +2, then adding two positives) tests distribution with a positive coefficient, matching c3's own worked example. k3 (−2(x+4)+3x, distributing −2, then combining terms of different signs) tests distribution with a negative coefficient — confirmed by its own distractor: *"−2 times 4 is −8, not +8."*

**Rationale**: both pairs follow the same structural pattern already validated elsewhere in this batch (tf-02-02's k2, pp-04-02's k3, tg-05-01's k3/ch1) — the canonical step covers only one branch of a two-branch rule, and the flagged "duplicate" is the necessary first test of the other branch, evidenced concretely in the step's own explanation/distractor text.

**Verified**: `check_lesson.mjs` reproduces the queue's own flag (k2, k3) exactly. No CHOICE_SURFACE_INTEGRITY leak on any of the lesson's mcq widgets (i1, i2, i3).

**reviewBasisHash**: `71309cbc5b6cd724ddb8a22bdab46cc5eb86ede3522e5af620bcdf6d13014c7f`
