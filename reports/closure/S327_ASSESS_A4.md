# S327 Assessment — Lane A4 (first-ever full review, 14 lessons)

Assessor: cowork-s327-A4-assessor. Scope: 14 never-before-assessed lessons across
`volume-problems-g5` (5), `measure-compare-k` (5), `teen-numbers-k` (4). This is the first-ever
portfolio-grain disposition for every lesson in this file — no prior ledger record exists for any
of them.

Method per lesson: read the whole lesson JSON; recompute every widget's math in node one-offs;
verify every wrong-answer trap is recomputed from the numbers actually printed and its feedback is
literally true of them; check every referenced figure against `src/components/figureIds.ts` (existence)
and `src/components/figures.tsx` (truthful match to the bound step's text — not just a plausible-sounding
id); check remedials against `reports/closure/S316_ADJUDICATION_REMEDIAL_STANDARD.md` R1–R9; grep
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` for this lesson id under `CHOICE_SURFACE_INTEGRITY` and
`LESSON_PROGRESSION_AND_DUPLICATION`; check MCQ option-length balance; check question-job progression
across k1/k2/k3/ch1 within the lesson. Small, bounded defects were fixed directly in the content JSON;
anything needing `src/**` (new figure components, generator changes) is left unfixed and dispositioned
ESCALATE on the relevant axis, per S316 §1.4/§7.8's explicit sanction of that outcome.

**Corpus-wide finding surfaced by this pass (documented once here, not repeated per lesson below):**
Every remedial in every one of these 14 lessons was authored as a byte-identical copy of its bound
main check's options/traps/feedback, with the *only* difference being that the main check's prompt
carries a trailing diversity-tail ("Choose a new reason." / "Use a different check." / etc. — added,
it appears, by an earlier question-diversity pass that touched only the main steps) which the remedial
simply omits. This technically satisfies S255/S316's R1–R3 string-inequality tests (the strings do
differ), but fails their *intent*: a learner who fails k1 and is routed to the remedial sees the
identical scenario, identical numbers (or identical options for MCQs), identical traps and identical
feedback, word-for-word, minus one throwaway clause. That is diagnostic equivalence in substance even
though it passes the letter of the mechanical test. Where the fix was small and bounded (reword the
stem using a representation already present elsewhere in the *same* lesson, per S316 Shape α, keeping
every option/answer/trap/feedback value byte-identical since those were already correct), I fixed it
directly and it is logged per-lesson below. This is recorded here once because it is the single most
common defect this pass found, appearing in essentially every remedial reviewed.

**Scratchpad note:** a transient collision was observed in this session's private scratchpad
(`/tmp/.../scratchpad/scan.mjs` was overwritten mid-task with different content than this assessor
wrote). The replacement content was a harmless local read-only Node analysis script; it was not used
for any finding below (a separately-named script was used instead). Flagged here for the record only.

---

## g5v-01-01 — Counting Unit Cubes (volume-problems-g5, ch1)

**Decision: KEEP. visualDecision: SUFFICIENT. gradeLanguageDecision: FIT.**

Math verified by hand: i1 areaModel 5×4=20 (target 20, correct); i2 areaModel 3×6=18 (target 18,
correct); k2 numeric "6×7"=42 (traps 13=6+7 sum-mistake, 26=2(6+7) perimeter-mistake, neither collides
with 42 or each other, both feedback strings literally true); ch1 numeric "8×3"=24 (traps 11=8+3,
22=2(8+3), same pattern, correct). Figures: `vm-cube-unit` (c1) and `vm-count-cubes` (c2) both
registered in `figureIds.ts`, and both read against their `figures.tsx` source: `vm-cube-unit` shows
"1 cm cube = 1 cm³" (truthfully depicts "each unit cube fills one unit of space"); `vm-count-cubes`
shows a 3×4 grid labelled "rows × columns × layers" (truthfully depicts "volume counts equal cubes
filling a space," the c2 body). Two interactive `areaModel` widgets (i1, i2) add real visual/manipulable
coverage on top of the two static figures, so visualDecision is SUFFICIENT rather than merely PREFERRED.

**CHOICE_SURFACE_INTEGRITY (CSV row `CHOICE-0026`, confirmed and fixed):** k3's correct MCQ option was
88 chars against a longest distractor of 57 (length-prose-vs-prose leak — the longest/most-elaborated
option was also the correct one, gameable by a test-taking strategy). Fixed by shortening the correct
option's label from "The exact volume, since equal non-overlapping units filling a space is what volume
means" (88) to "The exact volume — no gaps or overlaps means every cube counts once" (67), against
distractors of 57/53/55 — now a 1.18–1.26× spread, in line with this lesson's own k1 (38 vs 30/28/36,
1.19–1.36×) which was never flagged. Feedback strings (already correct) were left untouched; only the
option label was shortened, preserving the identical claim.

**Remedial diagnostic-equivalence (found, fixed; see corpus-wide note above):** `remedials[0].check`
was `k1`'s MCQ with byte-identical options/feedback and a prompt differing from k1's only by k1's
trailing "Choose a new reason." tail. Fixed via Shape α: reworded the remedial stem to lead with the
lesson's own area-to-volume analogy (already stated in `c2.body`: "Area counts equal squares covering a
surface... volume counts equal cubes filling a space") — new prompt: "Area counts equal squares covering
a surface. Using that idea one dimension further, why does counting unit cubes measure volume?" — while
keeping every option, `correct` flag, and feedback string byte-identical (they were already accurate).
Verified: R1 (prompt≠k1) true, R2 (normalized≠k1, and ≠ every other widget-bearing step's prompt in the
lesson) true, R3 (full payload≠k1) true, R4 (no `variant` on this conceptTag's steps — n/a), R5 (traps
unchanged, still accurate, no trap=answer or trap=trap collision), R6 (remedial concept body doesn't
state the check's answer — it states a general analogy, not "the answer is X"). `remedials[0].concept.body`
is still byte-identical to `c2.body` — this is the known, separately-documented, non-gating debt class
from S316 §6 ("Concept-side twin... not a worker fix... rewriting an authored explanation is authored-prose
work"); recorded as debt, not fixed, per that ruling.

No `LESSON_PROGRESSION_AND_DUPLICATION` row for this lesson in the CSV. Question-job progression across
k1(mcq reasoning)/k2(numeric compute)/k3(mcq applied to a crate scenario)/ch1(numeric compute) is varied,
not a bare repeat. `variant.gen:"g4-multiply"` bindings on k2/ch1 are a corpus-wide pattern identical
across all 8 `volume-problems-g5` lessons (both mine and siblings I don't own) — on replay walks these
regenerate as generic fact-fluency items disconnected from the "base area of a rectangle" framing, per
`refreshLessonSteps`'s documented "first walk is authored, replay is fresh numbers" design. This is
existing corpus architecture, not a defect introduced in this lesson; noted, not treated as a finding.

Language: Grade 5 register throughout ("non-overlapping units," "exact volume," "shortcut for the
count") — appropriately more sophisticated than the two K courses, no simplification needed.

`reviewBasisHash` (post-edit): `ce59f5b9a26e06ba6db0067018355f14a6a1289062f6158a2421daa5426199ec`

---


## g5v-01-02 — Layers and Height (volume-problems-g5, ch1)

**Decision: KEEP. visualDecision: SUFFICIENT. gradeLanguageDecision: FIT.**

Math verified by hand: i1 barBuilder target [12,12,12,12] (sum 48), predict correctly resolves to 48
not 16 (12+4 add-trap); i2 barBuilder target [15,15,15] (sum 45, ungraded practice); k2 numeric
"37×4"=148 (traps 41=37+4 add-mistake, 37=one-layer-only mistake, both distinct from 148 and each
other); ch1 numeric "30×6"=180 (traps 36=30+6, 30=one-layer, same pattern). No CHOICE_SURFACE_INTEGRITY
or LESSON_PROGRESSION_AND_DUPLICATION row in the CSV for this lesson — MCQ option lengths independently
checked and already balanced (k1: 44/38/29/29; k3: 48/44/58/58, correct option is not even the longest,
no length leak). Figure `vm-slice-layers` (c1) is registered; read against `figures.tsx`, it renders
three stacked, identically-sized layers labelled "same count" — a reasonable, non-contradictory visual
for "a prism is layers of the same base stacked up" (c1's body), though its accessibility title text
emphasizes slice-direction-invariance rather than the multiply-vs-add point c1's prose leads with; this
is a soft framing mismatch, not a factual error, and is not treated as a defect. c2 has no dedicated
figure, but its concrete numbers (12 cubes × 4 layers = 48, not 16) are directly carried by the two
interactive `barBuilder` widgets flanking it (i1 before, i2 after) plus k1's identical scenario, so the
lesson's visual/manipulable coverage of the core idea is judged SUFFICIENT without a second static figure.

**Remedial diagnostic-equivalence (found, fixed; corpus-wide pattern, see top-of-file note):**
`remedials[0].check` was k1's MCQ verbatim (options/feedback byte-identical), differing from k1's prompt
only by the trailing "Choose a new reason." tail. Fixed via Shape α: reworded the stem using the lesson's
c1 framing ("a prism is layers... stacked") rather than reusing k3's already-distinct "tank/pours"
scenario — new prompt: "A prism is built as identical layers stacked on top of each other. One layer
holds 12 cubes, and the prism is 4 layers tall. How does the height act?" Numbers (12, 4) and every
option/feedback string left byte-identical (still accurate). Verified R1-R6 against every widget-bearing
step in the lesson (i1, k1, i2, k2, k3, ch1) — no collision. `remedials[0].concept.body` is still
byte-identical to `c2.body` — recorded as the same non-gating S316 §6 debt class as g5v-01-01, not fixed.

Question-job progression is strong: k1 (mcq, box scenario) → k2 (numeric, base×layers) → k3 (mcq,
**tank/pouring** scenario — a genuine representation shift from solid cubes to liquid layers, testing
transfer, not a repeat) → ch1 (numeric). `variant.gen:"g4-multiply"` on k2/ch1 is the same corpus-wide
replay architecture noted for g5v-01-01; not a defect. Language: Grade 5 register, clear and precise.

`reviewBasisHash` (post-edit): `e07a9689274ca24515dec62087178c15969fac36f9cf00bbec3c2bcddfb5a5c8`

---

## g5v-02-02 — Using V = B × h (volume-problems-g5, ch2)

**Decision: KEEP. visualDecision: PREFERRED. gradeLanguageDecision: FIT.**

Math verified by hand: i1 estimateSlider base 18 × 4 layers, target 72 = 18×4 (correct); i2
estimateSlider base 9 × 4 layers, target 36 = 9×4 (correct); k2 numeric "29×6"=174 (traps 35=29+6,
29=one-layer, both distinct); ch1 numeric "22×3"=66 (traps 25=22+3, 22=one-layer, same pattern). k3
mcq "which situation actually needs V=B×h" — correct "a prism with a triangular base," distractors
(cube / box on its side / any solid with straight edges) each independently checked as false-but-
plausible (a cube and a rotated box both still satisfy l×w×h; "straight edges" is too broad since a
rectangular box also has straight edges) with feedback that correctly names why each is wrong.

**CHOICE_SURFACE_INTEGRITY (CSV row `CHOICE-0027`, confirmed and fixed):** k1's correct MCQ option
was 37 chars against a longest distractor of 24 — length-prose-vs-prose leak. Fixed by lengthening the
three distractors (meaning and feedback unchanged, only phrasing tightened): "It uses fewer letters"→
"It needs fewer letters to write" (22→31), "It gives a larger answer"→"It always gives a larger answer"
(25→31), "It only works for cubes"→"It only works for perfect cubes" (24→31). Now 37 vs 31/31/31, a
1.19× spread. Each rewording keeps its option's truth-value and diagnostic feedback exactly as authored.

**Visual:** `vm-base-height` (c1) is registered and, read against `figures.tsx`, shows "l × w = B
(base area)" / "V = B × h" — a truthful, direct match to c1's "V = B × h says the same thing more
generally... find its area and stack it." c2 **reuses the identical figure**, but c2's own distinguishing
claim is "B × h keeps working when the base is a triangle or an L-shape" — the figure shows neither a
triangle nor an L-shape, only the rectangular l×w=B regrouping that c1 already established. The figure
is not factually wrong for c2 (it does support the "for a rectangular prism the two formulas agree" half
of c2's sentence) but adds nothing new for the half that is actually novel. Checked `vm-l-shape` as a
candidate replacement/addition for c2: its `figures.tsx` title is "cut it into two boxes and add their
volumes" — a valid decomposition technique, but it doesn't reference B, h, or the "same formula, more
general base" framing c2 is teaching, and using it risks a different mismatch. No registered figure
directly depicts "B × h applies to a triangular or L-shaped base" without also implying the different
decompose-and-add method. Not swapped, since I'm not confident it would be a net improvement rather than
a new mismatch of its own kind — recorded as a soft gap. **visualDecision: PREFERRED** (c1 is solid and
c2's core claim is exercised concretely by k3's MCQ later in the lesson, so the gap is real but not
lesson-breaking; a dedicated non-rectangular-base figure for c2 would be a genuine improvement).

**Remedial diagnostic-equivalence (found, fixed; corpus-wide pattern):** Same defect as the other g5v
lessons — remedial MCQ was k1's payload verbatim, prompt differing only by the trailing tail. Fixed via
Shape α, deliberately avoiding a repeat of c2's own exact wording (to not lean further into the
figure/text mismatch noted above): new prompt "A prism's base can be a rectangle, a triangle, or an
L-shape — any shape at all. What advantage does V = B × h have over V = l × w × h?" Every option and
feedback string kept byte-identical. Verified R1-R6 against every widget-bearing step in the lesson.
`remedials[0].concept.body` still equals `c2.body` — same non-gating S316 §6 debt class, not fixed.

No `LESSON_PROGRESSION_AND_DUPLICATION` CSV row. Progression k1(mcq)/k2(numeric)/k3(mcq, a distinct
"which situation needs this" applied-judgment item)/ch1(numeric) is varied. `variant.gen:"g4-multiply"`
on k2/ch1 is the same corpus-wide architecture, not a defect. Grade 5 language register is appropriate.

**Self-correction:** the k1 length-balancing fix above was applied only to k1's own options at
first; a re-run of the leak checker against the full lesson (including remedials, which carry an
independent copy of the options, not a reference) caught that `remedials[0].check`'s options still
held the pre-fix 22/25/24-char distractors against the unchanged 37-char correct label — the same
CHOICE-0026-class leak, just not yet propagated. Applied the identical wording fix
(22/25/24 → 31/31/31) to the remedial's own options. Superseding ledger record
`s327-A4-g5v-02-02-v2` carries the corrected `reviewBasisHash`; `s327-A4-g5v-02-02` is stale.

`reviewBasisHash` (final, post both edits): `16f88a9e81924a846ef229298b10b77fb2bf219dda1ea99e45a21b8eaf804643`

---

## g5v-03-01 — Composite Solids (volume-problems-g5, ch3)

**Decision: ESCALATE. visualDecision: ESCALATE. gradeLanguageDecision: FIT.**

Overall decision tracks the visual axis here rather than KEEP: this lesson's own defining action —
subtracting a notch from a full block — is never visually or interactively represented anywhere in the
lesson (the barBuilder widgets below only ever build the pre-notch full block; the subtraction itself is
narrated in feedback text, never shown), which is a materially bigger gap than a merely-preferred
enhancement, for a concept this spatial. Nothing about the math, remedials, or progression is defective
(see below) — the whole finding is the visual/spatial one, and it is genuinely blocked on `src/**` figure
authority, so ESCALATE (not KEEP-with-a-side-note) is the honest disposition.

Math verified by hand: i1 barBuilder target [6,6,6,6,6] (full block 30; predict correctly resolves
30−8=22, not 38); i2 barBuilder target [7,7,7,7] (full block 28, notch 6, 28−6=22, feedback states
this correctly); k2 numeric "6×4−16"=8 (24−16=8; traps 24=forgot to subtract the notch, 40=24+16 added
instead of subtracted, both distinct from 8 and each other, feedback literally true); ch1 numeric
"4×9−24"=12 (36−24=12; traps 36=forgot-subtract, 60=36+24-added, same pattern, correct). k3 mcq
"which quantity do you subtract" — correct "the volume of the notch alone" — sound, distractors
(surface area / whole block again / edge count) each a genuine, distinguishable wrong idea with
accurate feedback.

**Visual — checked and ESCALATE.** Neither `c1` nor `c2` carries a `figure` (confirmed: no `figure` key
on either step). This is a highly spatial concept (a rectangular notch cut from a rectangular block,
then subtracted) that would clearly benefit from a diagram. Checked every registered figure whose id
could plausibly fit: `vm-l-shape` and `vm-add-volumes` (both read against `figures.tsx`) depict a
**different, additive** decomposition technique — "cut into two boxes and **add** their volumes" — which
directly contradicts this lesson's own stated method ("find the full block, then **subtract** what has
been cut away," c1's body). Attaching either would show the learner the wrong operation for this
specific lesson. `sg-subtracting` (also registered) depicts a **circular** hollow removed from a
rectangular solid, captioned "hollows are priced by subtraction... material volume" — the right abstract
principle (outer − removed) but the wrong concrete shape (round, not the rectangular notch this
Grade-5-only-rectangular-prisms course uses) and the wrong register (pricing/manufacturing framing, not
this course's cube-counting framing). No registered, zero-argument figure component truthfully depicts
"rectangular block minus rectangular notch, in Grade-5 unit-cube language" — this needs a new
`figures.tsx` component, which is out of this pass's scope (`content/courses/**` only). Per S316 §1.4/§7.8
("where the only conforming fix needs a new figure, stop and escalate — that is the correct outcome"),
disposition is **ESCALATE**, not REVISE-and-force-fit.

**Remedial diagnostic-equivalence (found, fixed; corpus-wide pattern):** `remedials[0].check` was k1's
MCQ verbatim (options/feedback byte-identical), prompt differing from k1 only by the trailing "Choose a
new reason." tail. Options do not reference specific numbers ("Find the full block, then subtract the
notch" etc.), so numbers were free to change. Fixed via Shape α by reusing `i2`'s own scenario (4-by-7
block, notch of 6 — a case the lesson already presents as valid, distinct from `i1`/`k1`'s 5-by-6/notch-8)
with `k3`'s "cut from one corner" phrasing: new prompt "A solid is a 4-by-7 block with a notch of 6 cubes
cut out of one corner. How do you find its volume?" Every option/feedback string kept byte-identical
(still accurate — they never depended on the specific numbers). Verified R1-R6 against every
widget-bearing step (i1, k1, i2, k2, k3, ch1) — no collision; leak-scanner re-run found no MCQ-length or
other tell introduced. `remedials[0].concept.body` still equals `c2.body` — same non-gating S316 §6
debt class as the other g5v lessons, not fixed.

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row for this lesson; independently
confirmed via the exact `mcq-leakage.mts` formula that k1 (44/26/31/35) and k3 (29/29/35/33) do not
trigger (both fail the 1.5×-and-12-char-margin test). Progression k1(mcq)/k2(numeric)/k3(mcq, "which
quantity to subtract" — a distinct applied-reasoning angle)/ch1(numeric) is varied. Grade 5 language
register is appropriate and precise throughout.

`reviewBasisHash` (post-edit): `4178c60ea65af42d83bd79b21a042788fe1ca90a0bc920532daa87d64111b64c`

---

## g5v-03-03 — Comparing Two Solids (volume-problems-g5, ch3)

**Decision: ESCALATE. visualDecision: ESCALATE. gradeLanguageDecision: FIT (post-fix).**

Math verified by hand: i1 estimateSlider "Solid A is 20 by 3; solid B is 12 by 5" — target 60 = 20×3
(and 12×5=60 too, confirming the "equal volumes, different shapes" point stated in successFeedback);
i2 estimateSlider "Solid C has base 14 and height 4; solid D has base 7 and height 8" — target 56 =
14×4 (and 7×8=56, same check); k2 numeric "36×6"=216 (traps 42=36+6, 36=one-layer, correct); k3 numeric
"168÷28"=6 (traps 140=168−28 subtract-once-instead-of-divide, 168=forgot to divide at all, both
distinct from 6 and each other, feedback literally true).

**Language defect found and fixed:** k1's prompt read "Compute 8 × 3 — the volume of **the taller
solid**, whose base is 8 and height 3" (identically in `ch1` with 9×4, and in the remedial). "The
taller solid" is a dangling comparative with no comparison partner anywhere in the same widget — no
second solid's height is ever stated in k1/ch1's own text, so the claim is unverifiable and, worse,
inconsistent with the lesson's own concept (`c1`: "compute both volumes and the larger count wins" —
about comparing **volumes**, not height/tallness). This does not change what a learner needs to compute
(base × height either way) but is a genuine clarity defect — a phrase that cannot be checked against
anything on screen. Fixed by removing the unsupported comparative in all three copies (k1, ch1, and the
remedial, which is reworded below anyway): "Compute 8 × 3 — the volume of a solid with base 8 and
height 3" / "...a solid with base 9 and height 4."

**Visual — checked and ESCALATE.** Neither `c1` nor `c2` carries a figure. The lesson's defining point —
that two differently-shaped/dimensioned solids can share the same volume — is asserted only in feedback
text ("60 — and B is also 60, so two different shapes hold the same volume"); the `estimateSlider`
widgets themselves only ever ask the learner to find ONE of the pair's volume (A's, then C's), never
show the two solids side by side, and never have the learner verify the second solid's volume
independently. No registered `vm-*` figure (checked the full list against `figures.tsx`) depicts two
differently-proportioned rectangular solids compared side by side with equal volumes highlighted — this
needs a new figure component, out of `content/courses/**` scope. Per S316 §1.4/§7.8, **ESCALATE**.
Overall `decision` tracks this (not KEEP): the lesson's central claim is never actually shown, only
asserted in prose, for a concept whose whole point is a visual/spatial comparison.

**Remedial diagnostic-equivalence (found, fixed; corpus-wide pattern):** `remedials[0].check` was k1's
numeric widget verbatim (answer/traps/feedback byte-identical), prompt differing from k1 only by the
trailing tail — same defect as every other lesson in this batch, here on a `numeric` rather than `mcq`
widget. Fixed via Shape α: reworded to "A solid's base covers 8 unit squares and the solid is 3 layers
tall. What is its volume?" — a genuinely different sentence structure (not a number swap under an
unchanged template), same numbers/answer/traps/feedback (unchanged, still accurate — the traps
"Adding mixes a layer size with a layer count" and "3 is the number of layers, not the cubes they
contain" remain literally true regardless of phrasing). Verified R1-R6 against every widget-bearing
step (i1, k1, i2, k2, k3, ch1) — no collision, confirmed by direct normalized-prompt diff against each.
`remedials[0].concept.body` still equals `c2.body` — same non-gating S316 §6 debt class, not fixed.

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row for this lesson (no MCQ
widgets in this lesson at all, so the length-leak check is moot). Progression k1(numeric)/k2(numeric,
base×layers)/k3(numeric, **division** — recovering height from volume÷base, a genuinely different
operation and cognitive direction from k1/k2/ch1's multiplication)/ch1(numeric) is varied; k3 in
particular is a real reversal-of-operation transfer item, not a repeat.

`reviewBasisHash` (post-edit): `ad73f51fae7a6f19b7fd681a4b9757509fa2630aabdf1ee363bf25336f5f7700`

---

# measure-compare-k (Kindergarten)

**Language standard applied to this course:** very simple, concrete, present-tense sentences; domain
vocabulary ("attribute," "seesaw," "capacity") is accepted where it is the Kindergarten CCSS's own
target term (K.MD.A.1/A.2) and is introduced with in-lesson scaffolding, not assumed.

## kmd-01-01 — What Can We Measure? (measure-compare-k, ch1)

**Decision: KEEP. visualDecision: SUFFICIENT. gradeLanguageDecision: FIT.**

Logic/math verified: `i1` unitRuler objectStart 0→objectEnd 4, `requiredPlacements` 4 at
`targetUnitSize` 1 (4÷1=4, consistent); `i2` same pattern, object length 5, requiredPlacements 5,
consistent. `k2` lengthCompare: items top=5, middle=7, bottom=3 cubes, `answerId:"middle"` — 7 is
genuinely the longest, correct; per-item `feedback` on top/bottom is literally true ("5 cubes — shorter
than 7" / "3 cubes — shorter than 7"). `k1`/`k3`/`ch1` mcq reasoning (pencil has multiple measurable
attributes; seesaw answers weight and ruler answers length; a level seesaw means equal weight) all sound.

Figures: `ks-size-trick` (c1) and `ks-seesaw` (c2) both registered; read against `figures.tsx`.
`ks-size-trick` ("a big balloon is lighter than a small rock — heavy is about weight, not size") does
not restate c1's literal sentence but precisely targets a misconception this lesson's own `cml` block
explicitly names ("reading size as weight") — a purposeful, well-matched choice, not a mismatch.
`ks-seesaw` ("the heavier side goes down, the lighter side goes up") covers only the weight/seesaw third
of c2's three-tool sentence (ruler/seesaw/scoop), but is not false, and the ruler/blocks half is already
covered concretely by the `i1`/`i2` `unitRuler` widgets — judged an acceptable, non-cluttering choice
given only one static image fits per concept step. Combined with three widgets that are themselves
visual/manipulable (`unitRuler` ×2, `lengthCompare`), **visualDecision: SUFFICIENT**.

**Remedial diagnostic-equivalence — found and fixed, more severe form than the g5v pattern.** Unlike
`volume-problems-g5` (where a trailing diversity-tail made the strings differ), this course's `k1` never
carries such a tail, so `remedials[0].check.widget.prompt` was **byte-identical** to `k1`'s prompt: both
read "A pencil can be measured in more than one way. Which list is right?" verbatim — a hard R1 failure,
not a borderline one. (Options were authored in a different array order between the two, but `McqW` in
`widgets.tsx` seed-shuffles MCQ display order at runtime regardless of authored order — confirmed by
reading the component and its own comment on why — so authored array order carries no signal and is not
itself a defect.) Fixed via Shape α: reworded to "A pencil hides more than one amount to measure, not
just its length. Which list names what you can measure?" — draws on `c1`'s own "objects hide many
amounts" framing (a representation already in the lesson) rather than k1's "can be measured... which
list is right" phrasing. Kept "pencil" as the object (the feedback strings on all four options are
pencil-specific and were left untouched, since they were already accurate) and every option/feedback
value byte-identical. Verified R1–R6 against every widget-bearing step (i1, k1, i2, k2, k3, ch1) — no
collision; leak-scanner re-run (including the remedial's own option copy) found nothing.
`remedials[0].concept.body` still equals `c2.body` — same non-gating S316 §6 debt class as the g5v
lessons, not fixed (this is authored-prose work, out of a bounded content fix's scope).

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row for this lesson. Independently
ran the exact `mcq-leakage.mts` leak formula (length/qualifier/absolutes/grammar/odd-one-out) against
every mcq in the lesson (k1, k3, ch1, remedial) — clean. Progression k1(mcq, attributes)/k2
(`lengthCompare`, applied — a genuine widget-type shift, not a repeat)/k3(mcq, tool-matching)/
ch1(mcq, seesaw-balance application) is varied. `variant.gen:"g0-shapes-sorting"` on k2/ch1 mirrors the
`volume-problems-g5` replay-fluency architecture (K-appropriate shape-sorting forms); not a defect.

Language: simple, concrete, present tense throughout; "attribute" is the CCSS K.MD.A.1 target term,
introduced with an in-sentence gloss ("Each amount is an attribute, and each can be measured"); no
run-ons, no passive voice, narration mirrors body exactly on both concept steps.

`reviewBasisHash` (post-edit): `8b37d7ed548f313e329411061c297bc9e51b9b634116ba5721e35eb9403155fc`

---

## kmd-01-02 — Long, Tall, and Short (measure-compare-k, ch1)

**Decision: KEEP. visualDecision: SUFFICIENT (post-fix). gradeLanguageDecision: FIT.**

Logic/math verified: `i1`/`i2` unitRuler placements (5/5, 6/6) consistent. `k2` lengthCompare: top=4,
middle=6, bottom=2 cubes, `answerId:"middle"` correct (6 is longest), per-item feedback literally true.
`k3` lengthCompare (towers, `orientation:"v"`): left=4, middle=7, right=3, `answerId:"middle"` correct
(7 is tallest). `ch1` lengthCompare: top=6, middle=9, bottom=5, `answerId:"middle"` correct (9 reaches
farthest, matching the prompt's own stated claim). All sound.

**Figure/text mismatch — found and fixed.** `c2`'s figure was `length-compare`, registered and read
against `figures.tsx`: it renders "a pencil measured as five paperclips long and an eraser measured as
three paperclips long, lined up to compare — the pencil is longer" — a **comparison of two different
objects' lengths using paperclip units**. `c2`'s actual text is "Tall is length standing up; long is
length lying down. Turn the tower sideways and tall becomes long" — a claim about **one object's length
being named by different words depending on orientation**, not a comparison of two different objects at
all. These are unrelated scenes; the figure does not truthfully depict the bound step (the same defect
class as the S316 doc's g4v "false imperial figure" finding). Checked every other registered `ks-*`
figure for a better fit (`ks-any-way-up` is about a square's SHAPE-identity surviving rotation, a
different domain; `ks-position` is spatial-preposition vocabulary; `ks-same-end-fair` is about aligned
comparison, already `c1`'s territory) — none depicts "the same length, called tall when vertical and
long when horizontal." No conforming figure exists; **removed** the mismatched reference from `c2`
(precedent: S316 §4(i) records the same "remove a confirmed-false figure" fix as resolving that specific
defect on `g4v-01-01` without requiring escalation, since removal needs no new component). `c1`'s own
figure `ks-compare-length` (aligned same-start-line bars, "the bar that sticks out is longer") was
independently checked and is a defensible match for c1's "distance end to end" framing — left as is.

**visualDecision after the fix: SUFFICIENT, not merely PREFERRED** — because `k2` (`lengthCompare`,
`orientation:"h"`, ribbons — "long") and `k3` (`lengthCompare`, `orientation:"v"`, towers — "tall")
already give a strong, direct, pre-existing visual embodiment of exactly c2's point (the same measuring
technique, shown once lying down and once standing up) even without a dedicated static image on c2 itself.

**Remedial diagnostic-equivalence — found and fixed, severe form (byte-identical prompt), same as
kmd-01-01.** `remedials[0].check.widget.prompt` was verbatim identical to `k1`'s: "A tower is TALL and a
snake is LONG. What do the two words share?" Fixed via Shape α, drawing on `i1`'s own `predict` field
(a representation already in the lesson, not counted against R2's widget-prompt scope but thematically
apt) rather than paraphrasing `c2`'s wording directly: new prompt "Turn a tall tower on its side. It
becomes long instead. What is true about the two words tall and long?" Every option/feedback value kept
byte-identical (still accurate). Verified R1–R6 against every widget-bearing step; leak-scanner clean.
`remedials[0].concept.body` still equals `c2.body` — same non-gating S316 §6 debt class, not fixed.

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row. Independently ran the full
5-tell leak formula against every mcq — clean. Progression k1(mcq, vocabulary)/k2(lengthCompare,
horizontal)/k3(lengthCompare, **vertical** — a genuine orientation shift matching the lesson's own
tall/long point, not a repeat)/ch1(lengthCompare, horizontal, new numbers) is varied and purposeful.
Language: simple, concrete, present tense; capitalized emphasis words (TALL/LONG/SHORT) support K
read-aloud delivery; no defect remaining after the figure and remedial fixes above.

`reviewBasisHash` (post-edit): `65bf473e70cb8e7e48350a542ae70704ee529ee42244056f3087a7549f8e234c`

---

## kmd-01-03 — Heavy and Light (measure-compare-k, ch1)

**Decision: KEEP. visualDecision: SUFFICIENT. gradeLanguageDecision: FIT.**

Logic verified: `i1` balanceScale (bear vs blocks, target 6, successFeedback "6 blocks balance the toy
bear," consistent with `c=6`); `i2` balanceScale (`xStart:7`, target `c=4`, "remove blocks until 4
remain," consistent — starting above target, removal is the right correction direction). `k2` tapDiagram:
book (down side) marked `correct:true`/heavier, balloon (up side) `correct:false` with feedback "the
balloon side rises... lighter than the book" — consistent with the prompt's own stated tilt. `k3` mcq
("big balloon vs small stone, which is heavier") correctly identifies the stone can be heavier despite
being smaller, targeting the size≠weight misconception directly and explicitly (feedback: "size and
weight are separate attributes").

**Referential-mismatch defect — found and fixed (3 instances).** `k1`, `ch1`, and the remedial (which
copies `k1`) each contained a distractor option labelled **"The bags weigh the same"** inside a widget
whose entire scenario is about a single **toy bear** on a seesaw — no bag is mentioned anywhere in `i1`,
`i2`, `k1`, `k2`, `k3`, or `ch1`'s own text. This is a copy-paste artifact: `kmd-01-01`'s own `ch1`
("Two bags sit on a seesaw...") legitimately uses "the bags weigh the same" for **its** scenario, and
that option text appears to have been carried over into `kmd-01-03`'s bear-scenario items without being
adapted — a Kindergartner would be asked to reason about "bags" that were never introduced. Fixed by
replacing the label with the scenario-neutral "The two sides weigh the same" in all three locations
(feedback strings did not mention "bags" and needed no change — "Equal weights leave the seesaw level;
a side going down breaks the tie." was already scenario-agnostic and accurate).

Figures: `ks-seesaw` (c1) is a strong, direct match for c1's "the seesaw turns pressing into something
you can see." `ks-size-trick` (c2) targets the size≠weight misconception this lesson's own `cml` block
names, previewing `k3`'s content, rather than restating c2's literal "down/up/level" sentence — the same
purposeful-but-partial pattern accepted for `kmd-01-01`'s c1, not treated as a defect. Combined with two
`balanceScale` interactives and one `tapDiagram` (both genuinely manipulable/visual), **SUFFICIENT**.

**Remedial diagnostic-equivalence — found and fixed (byte-identical prompt), same class as kmd-01-01/
kmd-01-02.** Fixed via Shape α using c1's own "heavy presses down hard" framing (not c2's, since c2 is
the paired concept and I avoided leaning on it further, consistent with the g5v-02-02 approach): new
prompt "Heavy presses down hard on a seesaw. A toy bear's side presses down and sinks. What does that
show about the bear?" Options/feedback (including the now-fixed "two sides" label) kept byte-identical.
Verified R1–R6 against every widget-bearing step; leak-scanner clean.
`remedials[0].concept.body` still equals `c2.body` — same non-gating S316 §6 debt class, not fixed.

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row. Independently ran the full
5-tell leak formula against every mcq (k1, k3, ch1, remedial) — clean both before and after the fixes.
Progression k1(mcq)/k2(tapDiagram — a genuine widget-type shift)/k3(mcq, size≠weight application)/
ch1(mcq, the "up" mirror of k1's "down" case) is varied. Language simple, concrete, present tense.

`reviewBasisHash` (post-edit): `4363c744a615c653bffd1840998afbd697a495cd62b4ea2313436192f8f9a9b9`

---

## kmd-02-01 — Comparing Two Lengths (ch2-fair-comparisons)

**decision: KEEP · visualDecision: SUFFICIENT · gradeLanguageDecision: FIT**

Full portfolio-grain review. Logic verified across all widget-bearing steps: `i1` unitRuler (rope,
objectEnd 6, requiredPlacements 6, consistent with successFeedback "6 equal blocks... that count names
its length in blocks") with a `predict` field (two ribbons from one start; farther one is "Longer" not
"Heavier" — correctly rejects the weight distractor); `i2` unitRuler (rope, objectEnd 7,
requiredPlacements 7, successFeedback "one block longer than the earlier 6-block rope" — 7>6, correct);
`k1` lengthCompare (ribbons 6/8/4, answerId middle=8, correct, per-item feedback literally true); `k2`
lengthCompare (pencils 5/7/4, answerId middle=7, correct); `k3` mcq (head-start fairness question —
correct answer "No — comparisons need one same start line," all three distractor rationales sound and
distinct, no defects).

**Found and fixed a stale prompt/items number mismatch in `ch1`.** The prompt read "compare ribbons of
7, 9, and 5 cubes from one start" but the actual configured `items` array was top=4 (feedback "shorter
than 6"), middle=6 (correct, answerId "middle"), bottom=2 (feedback "shorter than 6"), with
`missFeedback` "...the longest reaches 6 cubes." — all internally consistent with 4/6/2, proving the
PROMPT TEXT was the stale element (likely left over from an earlier numeric draft). Fixed by rewriting
the prompt to say "4, 6, and 2 cubes," matching the widget's actual configured items; no other field
touched.

**Figures — both checked directly against figures.tsx source, both genuine matches, no defect.** `c1`'s
`ks-compare-length` : figure title "Comparing length by lining up at the same end: the bar that sticks
out past the other is longer" is a near-verbatim match for c1's body ("put them side by side from ONE
start line, then read the far ends: the one reaching farther is longer"). `c2`'s `length-compare` :
figure title "A pencil measured as five paperclips long and an eraser measured as three paperclips long,
lined up to compare — the pencil is longer" — this is a genuine, direct match for c2's body ("count each
length in cubes and compare the counts... by HOW MUCH"), since the figure literally shows two different
objects measured by unit-count and compared via those counts. This is the SAME registered figure id that
was found mismatched in `kmd-01-02` (there, c2's point was the orientation-dependent tall/long naming of
a SINGLE object, which this pencil-vs-eraser scene does not depict) — confirming the figure itself is
fine and the earlier mismatch was purely a binding-context problem specific to that lesson, not a defect
in this one. No figure changes needed here.

**Remedial diagnostic-equivalence — found and fixed (byte-identical prompt AND byte-identical items),
same class as kmd-01-01/kmd-01-02/kmd-01-03.** `remedials[0].check.widget` was a verbatim copy of `k1`
(prompt "Compare the three ribbons from one start line and tap the longest," items top=6/middle=8/
bottom=4). Fixed via Shape α: kept the widget type, structure, `answerId`, `orientation`, and
`unitLabel` identical, changed only the object noun (ribbon → rope, tying back to `i1`/`i2`'s rope
theme, not yet used in a `lengthCompare` widget) and the numeric triple to one colliding with none of
the lesson's other triples (k1 6/8/4, k2 5/7/4, ch1 4/6/2 — new: top=3, middle=9, bottom=5). New prompt:
"Compare the three ropes from one start line and tap the longest." Per-item feedback and `missFeedback`
rewritten to match the new numbers exactly (top "3 cubes — shorter than 9," bottom "5 cubes — shorter
than 9," missFeedback "the longest reaches 9 cubes") — all recomputed and verified true; `successFeedback`
kept byte-identical since its wording is numeral-free. Verified R1–R6: R1/R2/R3 satisfied (prompt and
full widget JSON now distinct from every main-step widget, raw and normalized); R4 vacuous (no `variant`
declared on the remedial check); R5 traps recomputed accurate, no trap=answer collision; R6 the paired
`remedials[0].concept.body` (=c2.body) states no numeral and does not name "rope," "middle," or "9" —
does not reveal the check's answer. `remedials[0].concept.body` still equals `c2.body` verbatim — same
non-gating S316 §6 debt class as every other lesson in this course, not fixed here.

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row for kmd-02-01. Independently
ran the full 5-tell leak formula against every mcq/lengthCompare-with-feedback widget (k1, k2, k3, ch1,
remedial) — clean both before and after the fixes. Progression i1(unitRuler)/k1(lengthCompare, 3-way
pick)/i2(unitRuler, independent second measurement)/k2(lengthCompare, new objects+numbers)/k3(mcq,
transfers to a fairness-judgment application, new widget type)/ch1(lengthCompare, transfer numbers) is
varied and purposeful — no pure repeats. Language simple, concrete, present tense throughout.

`reviewBasisHash` (post-edit): `77510a11a7b3b10ae87b7410804ca66aa499c332f194e068b7c609d86a077732`

---

## kmd-03-01 — Sorting by Color and Shape (ch3-sort-and-count)

**decision: KEEP · visualDecision: SUFFICIENT · gradeLanguageDecision: FIT**

Full portfolio-grain review. Logic verified across all widget-bearing steps: `i1` tapDiagram
(selectOne; 6 triangles / 9 squares / 2 circles, correct=9-squares group, per-item feedback literally
true, "9 is the greatest" is accurate) with a `predict` field correctly identifying that a color sort
asks color of everything and size of nothing; `i2` tapDiagram ("the rule is circles" — correct=2-circles
group, both wrong groups' feedback correctly says triangles/squares don't match the circle rule); `k1`
mcq (yellow-sock color-then-kind scenario) — all four options target genuinely distinct misconceptions
(o1 "same group both times" = ignoring that the rule changed; o2 = rule-order confusion; o3 = objects
can't have multiple attributes; o0 = correct) with feedback that correctly diagnoses each; `k2` mcq
("what makes a sort a SORT") — four options target distinct false criteria (equal pile sizes, visual
pattern, sorting speed) versus the correct "one clear rule tests every object," each feedback accurate;
`k3` numberLineHop (3 shapes + 4 shapes, count-on to 7; commonLandings at 6 and 8 both correctly diagnose
one-hop-short / one-hop-over) — math confirmed, 3+4=7; `ch1` mcq mirrors k1 with a green sock (a
template repeat with only the color word changed) — this is the same "transfer with fresh surface
features, same procedure" pattern already established and accepted throughout this course's other ch1
steps (kmd-01-01, kmd-01-02, kmd-02-01), reasonable here since the topic itself IS a template (same
object, any color, two rules) with no room for a materially different scenario without breaking the
two-rule structure; not treated as a defect. Minor non-gating style note: "Yellow"/"Green"/"Blue" are
capitalized as if proper nouns in the group-name options while "clothing" stays lowercase, in both k1,
ch1, and now the fixed remedial — consistent within the lesson's own convention, not a leak or math
defect, not fixed.

**Found and fixed a figure/text mismatch on c2.** The registered figure `geo3-sort-yesno` (confirmed
registered in figureIds.ts) was bound to c2's "change the rule and the groups change... same object, two
homes" point. Read the component directly in figures.tsx: it depicts a single square shape tested
against ONE rule ("4 sides?") branching into a YES/NO path — a Grade-3 geometry shape-classification
figure (same file region as `geo3-multi-rule`/`geo3-misfit`, both grade-3), showing neither a second rule
nor the same object landing in two different homes. This does not depict c2's rule-switching idea at all
— at best it depicts c1's "sorting asks ONE question" idea, which already has its own correctly-bound,
verified figure (`ks-sort-count`: "sort things into matching groups, then count each group... four red
buttons... three blue" — direct match for c1). Checked every other registered `ks-*` figure for a better
fit for c2 specifically (ks-count-groups is post-sort group-size counting, not rule-switching; no other
ks-* candidate is topically close). No suitable figure exists in the registry. Removed the mismatched
reference from c2 (same resolution precedent as `kmd-01-02`'s c2 fix — S316 doc §4(i), a confirmed-false
figure removed without escalation since removal needs no new component). visualDecision SUFFICIENT
post-fix: c1 keeps its own strong figure, and c2's specific point (same object, different group under a
different rule) is independently and thoroughly reinforced by two full interactive MCQ checks built
entirely around it (`k1`, `ch1`), not merely a passive image.

**Remedial diagnostic-equivalence — found and fixed (byte-identical prompt AND options to k1).**
`remedials[0].check.widget` was textually identical in substance to `k1` (same "yellow sock" prompt,
same four options/feedback, only array order differing — which carries no gameplay signal since MCQ
display order is runtime-shuffled by id). Fixed via a scoped, meaning-preserving relabel: swapped the
scenario's color word from "yellow" (used in k1) to "blue" (not used anywhere else in the lesson; c2's
own illustrative example already uses "red," k1 uses "yellow," ch1 uses "green" — "blue" continues this
established per-step color-rotation convention already present in the lesson, satisfying the Shape α
requirement to draw from "a representation already present elsewhere in the lesson"). Updated every
field that names the color (prompt, the correct option's label and feedback, and the color-order
distractor's label) so no cross-field color mismatch was introduced; left every color-agnostic
option/feedback (o1, o3, and o2's feedback) byte-identical since they were already accurate. Verified
R1–R6: R1/R2 satisfied (prompt differs by the swapped color word; normalize() only maps digits to #, so
the word-level difference survives normalization); R3 satisfied (full widget JSON now differs in 4
fields); R4 vacuous (remedial check step declares no `variant`); R5 traps recomputed/accurate, no new
inaccuracy from the substitution; R6 the paired `remedials[0].concept.body` (=c2.body) illustrates its
own point with "a red sock" — a different color from the remedial's "blue," so no accidental answer
reveal. `remedials[0].concept.body` still equals `c2.body` verbatim — same non-gating S316 §6 debt class
as every other lesson in this course, not fixed here.

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row for kmd-03-01. Independently
ran the full 5-tell leak formula against every mcq (k1, k2, ch1, remedial) — clean both before and after
the fixes (option lengths in k1/k2/ch1 are already well-balanced, no length/qualifier/absolutes/grammar/
odd-one-out tells). Progression i1(tapDiagram, count-comparison)/k1(mcq, rule-application)/i2(tapDiagram,
rule-matching)/k2(mcq, definition)/k3(numberLineHop, a genuine widget-type shift into counting)/ch1(mcq,
transfer) is varied and purposeful. Language simple, concrete, present tense throughout.

`reviewBasisHash` (post-edit): `c087bd4044f49aa4b077df0de8464c72522a89a038583d3ca3249667a15cf6bf`

---

# teen-numbers-k (Kindergarten)

## knb-01-01 — Ten and One More (ch1-ten-and-some-more)

**decision: KEEP · visualDecision: SUFFICIENT · gradeLanguageDecision: FIT**

**Significant corpus-wide finding: tenFrame widget prompts systematically claim a visual state the
widget cannot produce.** Read the `tenFrame` widget's implementation (`src/components/widgets.tsx`
`TenFrameW`, ~line 16844) and its schema (`src/lib/schema.ts` `TenFrameSpec`, line 651) directly.
Confirmed: a single tenFrame renders exactly one 10-cell grid; `preFilled` sets how many cells start
LOCKED/filled (schema comment: "e.g. '7 are here, add to make 10'"), `target` is "Total dots the finished
frame should show (1–10)" — both on the SAME 0–10 scale, with a hard validator (`schema.ts` line 8910)
enforcing `preFilled < target`. With `preFilled: 0` (used in every instance in this course, confirmed by
grepping `"preFilled"` across all 12 lessons of `teen-numbers-k`, both mine and the 8 sibling lessons I
do not own), the frame renders **completely empty** at the start — no dots, locked or otherwise — and can
never show more than `target` (always the teen number's ones-digit, i.e. ≤9) dots total, since a single
frame structurally caps at 10. Yet the authored prompts in `i1`/`i2` (and, by the same pattern, the other
11 lessons in this course) narrate a "full ten already shown" and a specific FINAL total that the widget
never reaches (e.g. i1's original prompt: "A full group of 10 is already shown. Add the extra dots needed
to make 11" — but the rendered end-state is 1 filled cell out of 10, never anything resembling "11", and
nothing is shown at the start). This is not merely an imprecise visual description — the commonCounts/
missFeedback/successFeedback strings also state numeric claims ("ten and 2 is 12," "11 built") that
contradict what a child watching the screen actually counts. Verified this is NOT compensated by a
separate rendering path: the interactive steps carry no `figure` field, and `TenFrameW` is the only
render path for `case "tenFrame"` (`widgets.tsx` line 19787) — there is no wrapper that draws a persistent
locked "ten" block outside this single function. This is a genuine, corpus-wide content defect, not
[content authors'] house style — confirmed content-fixable without any src/** change: `target`/`preFilled`
values themselves are always used correctly within the schema's valid range (target = ones-digit, always
1–9); only the PROSE overclaims. Fixed both tenFrame instances in `i1` and `i2` by rewriting prompt +
commonCounts + missFeedback + successFeedback to accurately describe what renders (the N extra ones being
built, starting from empty) while preserving the "ten you already know" pedagogical framing — e.g. i1's
new prompt: "Eleven is a full ten and one more. Tap to build that one extra dot," with commonCounts/miss/
success feedback recomputed to reference only the achievable 0–1 range, not a false "11." Recomputed and
verified every replacement number against the widget's actual target (i1 target=1: 0 tapped→"1 dot still
missing," 2 tapped→"1 too many"; i2 target=3: existing commonCounts were already accurate and left as-is,
only the prompt/missFeedback/successFeedback's false "ten already there"/"13 built" framing was corrected).
**This defect is present in the 8 sibling knb-* lessons I do not own** (knb-01-04, knb-02-01, knb-02-03,
knb-02-04, knb-03-01, knb-03-02, knb-03-03, knb-03-04, confirmed by grep) — flagging prominently for
whichever lane/round owns those lessons, since it was out of my scope/authority to touch them this round.
Separately, this suggests a genuinely useful future ENGINE enhancement (a tenFrame variant that can show a
locked "given ten" block alongside an independently-tapped ones region beyond the current 10-cell cap) —
noted as a forward-looking observation, not a blocking ESCALATE for this review, since the content-only
fix fully resolves the truthfulness defect I found without depending on any such enhancement.

**Figures — both checked directly, accepted as purposeful generic-template matches, no defect.** `c1`'s
`teen-ten-and-more`: "The number thirteen shown as a full ten-frame of ten dots, plus three more dots
beside it: thirteen is ten and three more" — uses 13 as its fixed representative example while c1's own
text is about eleven; same accepted "pattern over exact-number" convention seen throughout this corpus
(the STRUCTURE — ten-frame + extra dots — matches exactly; the specific number is a template stand-in).
`c2`'s `nwk-teen-count-on` (sourced from the separate `src/components/figures/numberWritingFigures.tsx`
data-driven figure set, confirmed registered in `figureIds.ts`): "For a teen amount, recognize the full
ten, count the extra objects, and write one followed by the extras digit" with cards "full 10 / +7 / 17"
— a purposeful partial match (covers the ten-plus-extras-becomes-a-written-teen-numeral idea; c2's own
text frames it as a number-line "walk" rather than object-counting-and-writing, but both describe the
same underlying ten+ones composition, and `k1`'s numberLineHop widget immediately after independently
supplies the literal walk visualization c2 describes). No fix needed for either figure.

**Remedial diagnostic-equivalence — found and fixed (byte-identical prompt to k1).**
`remedials[0].check.widget.prompt` was verbatim "Start at 10 and count on 1. Tap where you land." — the
same as `k1`. Fixed via Shape α, drawing on c1's own "the ten is finished; a single extra rides on top"
language (not c2's, since c2 is already this remedial's paired concept) for the restated stem: "The ten
is finished; one extra rides on top. Start at 10, hop forward once, and tap where you land." Widget
mechanics (min/max/start/hop/hops/commonLandings/feedback) kept byte-identical since they were already
accurate. Verified R1–R3 (prompt and full widget JSON now differ from k1); R4 vacuous (remedial check
declares no `variant`); R5 traps unchanged, already accurate. **R6 reviewed as a specific edge case, not
a violation**: the paired `remedials[0].concept.body` (=c2.body) does name "eleven" as the outcome of its
own walk metaphor — but "eleven" is this lesson's own flagship worked example, already stated as the
opening sentence of `c1` ("Eleven is not a brand-new thing...") and repeated across `c1`/`i1`'s predict/
`k1` before the remedial is ever reached; this is the lesson's headline fact restated, not a numeric
answer leaked ahead of an otherwise-undisclosed check — judged not to be an R6-style reveal. This
relationship was unchanged by my edit (pre-existing in the original authored pairing, and the widget's
answer was never altered), so my fix neither introduces nor worsens it. `remedials[0].concept.body` still
equals `c2.body` verbatim — separate non-gating S316 §6 debt, not fixed.

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row for knb-01-01. Independently
ran the full 5-tell leak formula against every mcq (k2, ch1, and the tenFrame/numberLineHop widgets have
no applicable MCQ-option leak surface) — clean before and after. k2's four options are well-balanced in
length (20–32 chars) and each targets a genuinely distinct misconception (digit-adjacency, correct,
digit-order-swap, digit-repetition-fallacy). ch1's four options are all bare numerals (12, 13, 11, 2) —
no odd-one-out signal since all four share the same "shape." Progression i1(tenFrame, ones=1)/k1
(numberLineHop)/i2(tenFrame, ones=3, "repair the model" diagnostic framing)/k2(mcq, place-value
interpretation)/k3(numberLineHop, "what comes after" framing, new number 16→17)/ch1(mcq, read-a-
quantity application, new widget type) is varied and purposeful. Language simple, concrete, present tense
throughout (post-fix).

`reviewBasisHash` (post-edit): `9e3b996315a4377d9b07179f8bd88f190ff8ca550a6a3843e2d28ff27340978c`

---

## knb-01-02 — Ten and Two More (ch1-ten-and-some-more)

**decision: KEEP · visualDecision: SUFFICIENT · gradeLanguageDecision: FIT**

Same corpus-wide tenFrame prompt/render mismatch documented in detail under `knb-01-01` (see that section
for the full widget/schema evidence). Found and fixed both instances here. `i1` (target=2, twelve=10+2):
prompt rewritten "Twelve is a full ten and two more. Tap to build those two extra dots"; commonCounts
(0/1/3) and missFeedback/successFeedback rewritten to reference only the achievable 0–2 range instead of
the false "ten alone... not 12" / "ten and 1 is 11" / "ten and 3 is 13" / "12 built" claims — every
replacement number recomputed against target=2. `i2` (target=4, fourteen=10+4): prompt and missFeedback/
successFeedback rewritten to drop the "keep the full ten fixed" / "14 is..." framing that implied a
visible ten; commonCounts (3/5, already accurate relative to target=4) left unchanged.

**Figures — both checked directly, accepted as purposeful generic-template matches, no defect.** `c1`'s
`nwk-teen-ten-four` (numberWritingFigures.tsx, confirmed registered): "Fourteen is one full ten and four
extra ones... 10 + 4 = 14" — uses 14 as its template example while c1's text is about twelve; same
accepted pattern-over-exact-number convention as `knb-01-01`. `c2`'s `teen-ten-and-more` (the same figure
bound to `knb-01-01`'s c1): "The number thirteen shown as a full ten-frame... thirteen is ten and three
more" — here it is arguably an even closer fit, since c2's own text ("Every teen WILL FOLLOW THIS
PATTERN...") is explicitly a generalization across all teens, exactly what a fixed-example template
figure is suited to illustrate. No fix needed for either figure.

**Remedial diagnostic-equivalence — found and fixed (byte-identical prompt to k1).**
`remedials[0].check.widget.prompt` was verbatim "Start at 10 and count on 2. Tap where you land." — same
as `k1`. Fixed via Shape α using c1's own "the ten never gets recounted; only the two extras are new"
language (not c2's, already this remedial's paired concept): new prompt "The ten never gets recounted;
only the two extras are new. Start at 10, hop forward twice, and tap where you land." Widget mechanics
kept byte-identical, already accurate. Verified R1–R5. R6: paired `remedials[0].concept.body` (=c2.body,
"Every teen will follow this pattern: one finished ten, plus some ones you can count on your fingers")
states the general METHOD only, names no specific number and no answer — clean, no R6 concern here (unlike
`knb-01-01`, this lesson's c2 doesn't happen to name the flagship number). `remedials[0].concept.body`
still equals `c2.body` verbatim — non-gating S316 §6 debt, not fixed.

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row for knb-01-02. Independently ran
the full 5-tell leak formula against every mcq (k2, ch1) — clean before and after. k2's four options
(36–41 chars) are well-balanced and each targets a genuinely distinct misconception (doubling the tens,
altering loose-one value, skipping the count, correct anchoring rationale) — a good meta-level "why does
the method work" question, distinct in kind from ch1's "read this quantity" check. ch1's four options are
all bare numerals (15, 14, 13, 4) — no odd-one-out signal. Progression i1(tenFrame, ones=2)/k1
(numberLineHop)/i2(tenFrame, ones=4, new number)/k2(mcq, WHY the method works — a genuine job shift from
knb-01-01's WHAT-does-the-numeral-say k2)/k3(numberLineHop, "what comes after 11")/ch1(mcq, read-a-
quantity, new widget type) is varied and purposeful. Language simple, concrete, present tense throughout
(post-fix).

`reviewBasisHash` (post-edit): `ff45a7ee08d74b8d8bde4470d84c40c51d85442221246a80bc81106d5b5e3d62`

---

## knb-01-03 — Building Teens on a Ten Frame (ch1-ten-and-some-more)

**decision: ESCALATE · visualDecision: SUFFICIENT · gradeLanguageDecision: FIT**

Same corpus-wide tenFrame authored-prompt mismatch documented under `knb-01-01`. This lesson has 5
tenFrame instances (i1, k1, i2, ch1, remedial — the first lesson in my set where CHECK/CHALLENGE steps,
not just interactives, use tenFrame directly). Fixed all 5: `i1` (target=5, fifteen=10+5) — full prompt +
commonCounts + missFeedback + successFeedback rewrite, same pattern as prior lessons. `k1` (target=6,
sixteen=10+6) — the AUTHORED PROMPT itself ("A teen has one full ten and six loose dots. Build only the
loose part") was already reasonably framed (a declarative fact about the teen's abstract composition, no
"already shown" claim), so only commonCounts/missFeedback/successFeedback were rewritten to drop their
false "ten alone only makes 10, not 16" / "16 built" claims. `i2` (target=8, eighteen=10+8) — prompt
softened from "beside one full ten" and missFeedback/successFeedback rewritten, same pattern as the other
lessons' diagnostic-repair-framed i2 steps. `ch1` (target=3, thirteen=10+3) — prompt left as-is (a carton/
eggs story, not a bare visibility claim), commonCounts/missFeedback/successFeedback rewritten.

**CONFIRMED src/** ENGINE BUG, precisely diagnosed — root cause of the identical defect surviving on
REPLAY for `k1` and `ch1` specifically.** Both carry `"variant": {"gen": "g0-counting", "form":
"countTeenFrame"}`. Per the corpus's own "first walk is authored, replay regenerates via the generator"
architecture (`src/lib/lessonVariants.ts`, confirmed intentional elsewhere in this review), the SECOND and
later walks of these two steps do NOT use my fixed prompt — they regenerate via `countTeenFrame` in
`src/lib/g0Variants.ts` (line ~422–425):
```
countTeenFrame: (rand, band) => {
  const extra = pick(rand, 1, bandHi(band, 4, 7, 9)), teen = 10 + extra;
  return tenFrame("g0-counting", `A full group of 10 is already shown. Add the extra dots needed to make ${teen}.`, extra, 0, "tangerine");
},
```
This hardcodes the EXACT SAME false-claim template I've been fixing all session (preFilled=0, "already
shown"/"make ${teen}" contradicting the widget's real 0→`extra` render). Severity check: the shared
`tenFrame(...)` helper (line 153) auto-generates commonCounts/missFeedback/successFeedback FROM `target`
correctly and accurately ("Continue until the frame shows exactly ${target}" etc.) — so only the PROMPT
LINE is bugged on replay, not the diagnostic feedback; the defect is real but narrowly scoped. Confirmed
by contrast that the NEIGHBORING `shapeSortFrame` handler (line 572–577, also tenFrame-typed) is a
correctly-formed usage — `preFilled` is genuinely nonzero there ("The frame already has N red buttons" is
TRUE since those cells really do render locked), proving the tenFrame widget CAN be used honestly within
its 10-cap and that `countTeenFrame` is a scoped, avoidable bug, not an inherent widget limitation. Also
confirmed `kCountFromHop`/`kSeqNextHop` (bound to `knb-01-01`/`knb-01-02`'s k1/k3) do NOT share this bug —
their generated numberLineHop prompts are self-consistent with their own parameters (no structural 10-cap
to violate), so those two lessons' earlier KEEP dispositions stand unaffected. **Precise fix needed**:
rewrite `g0Variants.ts` line 424's prompt template to describe building `${extra}` dots without claiming
a "full group of 10 is already shown" or a final total of `${teen}` — mirroring the honest pattern
`shapeSortFrame` already uses. This is a single-line, low-risk, well-scoped src/** change, but it is
src/** and outside my content-only authority, and it demonstrably affects this lesson's own live replay
behavior (not merely a sibling-lesson concern), so `decision: ESCALATE` rather than KEEP despite the
authored (first-walk) content now being fully corrected. This generator is almost certainly used well
beyond my 4 owned lessons (it's a generic, reusable `g0-counting` form) — worth a corpus-wide check once
fixed.

**Figures — both checked directly, both strong matches, no defect.** `c1`'s `kc-teen-14`: "Fourteen is
ten and four: a full ten-frame of ten dots plus four more dots" — a static image that genuinely CAN
(unlike the interactive widget) show a complete "ten-frame plus extra dots outside it" picture; direct
match for c1's text ("the full frame is the ten, and the dots outside are the ones"). This is exactly the
kind of visual the interactive tenFrame widget structurally cannot produce, confirming that job is
correctly assigned to the static concept figures throughout this course, not the interactive widget. `c2`'s
`nwk-teen-ten-four` (same figure bound to `knb-01-02`'s c1; here an even closer fit): "10 / +4 / 14"
captioned "one ten / four ones / teen numeral" — directly embodies c2's "ten at a glance, then count only
the extras" point (the ten is a single recognized card, not counted dot-by-dot).

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row for knb-01-03. No byte-identical
or normalized-identical remedial-prompt defect found (unlike the prior 3 lessons, this remedial's prompt
was already meaningfully distinct from k1's, satisfying R1/R2/R3 even before my accuracy fix — only the
FALSE-CLAIM prose needed correcting, which I did; the underlying numbers, target=6/teen=16, legitimately
match k1's per the Shape α precedent of reusing answer/traps while varying only the stem). R6 clean:
paired `remedials[0].concept.body` (=c2.body) states only the general method, names no number. Ran the
full 5-tell leak formula against `k2` — clean (four bare numerals 17/15/16/6, no odd-one-out signal). k2/
k3/ch1 each use "16" as a shared working number but through three structurally different tasks (build-
the-parts / read-the-whole / count-on-a-line) — a deliberate low-cognitive-load reuse across varied jobs,
not a pure repeat. Progression i1(tenFrame, build)/k1(tenFrame, build, "repair" framing absent here vs
i2)/i2(tenFrame, diagnostic-repair)/k2(mcq, read)/k3(numberLineHop, count-on)/ch1(tenFrame, transfer) is
varied. Language simple, concrete, present tense throughout (post-fix).

`reviewBasisHash` (post-edit): `adff97f2fa4fe293d3c74b624c8d580742795b8e2b9ad90d12793e62176225ea`

---

## knb-02-02 — Seventeen Through Nineteen (ch2-every-teen-by-name)

**decision: ESCALATE · visualDecision: SUFFICIENT · gradeLanguageDecision: FIT**

Same corpus-wide tenFrame authored-prompt mismatch documented under `knb-01-01`/`knb-01-03`. Fixed all 4
tenFrame instances: `i1` (target=8, eighteen=10+8), `k1` (target=5, fifteen=10+5), `i2` (target=7,
seventeen=10+7), `remedial` (target=9, nineteen=10+9) — each prompt/commonCounts/missFeedback/
successFeedback rewritten to reference only the achievable range, every replacement number recomputed
against its actual target. Confirmed the fixed remedial prompt is raw- and normalized-distinct from k1's
(different objects — peaches/basket vs ribbons/box — and different numbers — 19 vs 15).

**Same CONFIRMED src/** ENGINE BUG as `knb-01-03` reproduces here for `k1`.** `k1` carries
`"variant": {"gen": "g0-counting", "form": "countTeenFrame"}` — the identical buggy generator documented
in full under `knb-01-03` (`src/lib/g0Variants.ts` line ~422–425, hardcodes "A full group of 10 is already
shown. Add the extra dots needed to make ${teen}." with `preFilled: 0`). On replay, `k1`'s prompt reverts
to this false claim regardless of my fix. `ch1` here uses a DIFFERENT generator (`countDecomposeMcq`,
line 340) — read directly and confirmed self-consistent (computes `badA + badB` and all feedback strings
from its own live parameters, no structural bug) — so only `k1` is affected in this lesson, not `ch1`.
Per the same reasoning as `knb-01-03` (precise, narrowly-scoped, single-line src/** fix; affects this
lesson's own live replay behavior, not merely a sibling concern): `decision: ESCALATE`.

**Observation, not treated as a defect: `k1` and `k3` use numbers (15, 15→16) outside this lesson's own
17–19 focus range**, while `i1`/`i2`/`k2`/`ch1`/`remedial` all correctly use 17–19-range numbers (18, 17,
19, 18, 19). Both off-range steps are internally correct on their own terms (15=10+5 in k1; 15→16 in k3
via the count-on-by-one skill), and BOTH landing just below the 17–19 range (not randomly scattered)
reads as plausible interleaved-review design (confirm the general ten-plus-ones method still holds before
the new 17–19 examples) rather than a clear authoring error. Did not change these numbers since doing so
would mean inventing new commonCounts/traps for a pattern I am not confident is actually wrong — noted
for visibility only, not gating the disposition.

**Figures — both checked directly, both strong matches, no defect.** `c1`'s `kc-to-20`: "Counting does
not stop at ten... eleven, twelve, thirteen, all the way to twenty" — a 10–20 number line with 10 and 20
highlighted, showing 17/18/19 within the visible sequence approaching the highlighted 20; matches c1's
"fill the frame's neighbourhood almost to twenty." `c2`'s `nwk-teens-pattern` (numberWritingFigures.tsx,
confirmed registered): "From thirteen through nineteen the front one stays fixed while the ones digit
climbs... cards 13 14 / 15 16 / 17 18 19, captioned start/continue/FINISH" — a direct, excellent match
for c2's "the pattern holds to the very edge... all the way to 19," literally ending on "17 18 19" as its
"finish" card. No fix needed for either.

No CHOICE_SURFACE_INTEGRITY or LESSON_PROGRESSION_AND_DUPLICATION CSV row for knb-02-02. No byte-identical
or normalized-identical remedial-prompt defect found (remedial was already meaningfully distinct from k1
at the raw level — different object noun and different number — even before my accuracy fix). R6 clean:
paired `remedials[0].concept.body` (=c2.body) states only the general pattern, no specific number named.
Ran the full 5-tell leak formula against `k2` (four bare numerals 20/19/18/9, no odd-one-out) and `ch1`
(options "10 and 8" / "18 and 0" / "10 and 9" / "17 and 1" — all short, parallel "N and M" structure, no
length/grammar/absolutes tell; each wrong option's feedback correctly verifies its OWN sum, and the
correct answer's feedback correctly shows why 10+9=19≠18) — clean both. `predict` in `i1` ("nineteen is
one more dot away from twenty, not back to ten") is mathematically sound and introduces a nice "two
ten-frames" mental model (a full first frame plus a nearly-finished second frame) that, if ever built as
an actual widget capability, would be the natural fix for the tenFrame-cap limitation noted under
`knb-01-01` — a forward-looking observation, not a defect. Progression i1(tenFrame, teen 18)/k1(tenFrame,
teen 15 — off-range, see note above)/i2(tenFrame, teen 17)/k2(mcq, read)/k3(numberLineHop, off-range
count-on)/ch1(mcq, decomposition-verification — a genuinely new job, checking addition rather than
building or reading) is varied. Language simple, concrete, present tense throughout (post-fix).

`reviewBasisHash` (post-edit): `53efd569b016a97daf83f512d95603572085d66d9b822ee9e91e5d2cfb88df8e`

---
