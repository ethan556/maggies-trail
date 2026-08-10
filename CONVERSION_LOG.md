# Conversion Log — Block 1: Grade 7 Two-Step Equations (the pilot)

Per `CONVERSION_PLAYBOOK_6_12.md` §0 and §10. Block 1 leads the sequence because it is the
smallest surface with the richest existing engines, and its test patterns template every later
block.

## Content-change ledger

**No authored lesson prose was changed.** No `body`, no lesson ID, step ID, step order, hint,
`conceptTag`, `explanationVariants`, remedial mapping, XP rule or curriculum alignment was
touched. The conversion script (`scripts/convert/block1-g7.mjs`) asserts the expected old widget
type on every targeted step and re-checks `body` byte-equality after the edit, aborting before
any write if either fails.

What changed, per lesson: the `widget` block of **one** step, plus a `predict` block on the six
steps that did not already carry one. New feedback strings are new authored content and pass
`validate:content` and `lint:pedagogy` like any other authored text.

| Lesson | Step | Old widget | New widget | Predict |
|---|---|---|---|---|
| tse-01-01 | i1 | mcq | `algebraTiles` (−3x − 6) | already authored — preserved |
| tse-01-03 | i1 | mcq | `algebraTiles` (7x + 6) | already authored — preserved |
| tse-02-01 | i1 | numeric | `inversePipeline` (×3, +4) | **added** |
| tse-02-02 | i1 | numeric | `solveBalance` signed (a −2, b 5, c −7) | **added** |
| tse-02-03 | i1 | numeric | `solveBalance` (4, 3, 19) cab-fare skin | **added** |
| tse-03-01 | i1 | numeric | `solveBalance` groups 3(x + 2) = 18 | **added** |
| tse-03-02 | i3 | numeric | `solveBalance` groups −5(x + 3) = −20 | **added** |
| tse-03-03 | i1 | numeric | `solveBalance` groups 3(x + 4) = 24 | **added** |
| tse-04-01 | i1 | mcq | `solveBalance` relation `gt` (3, 2, 14) | already authored — preserved |
| tse-04-02 | i1 | mcq | `solveBalance` relation `gt` (−2, 5, −3) | already authored — preserved |

**10 lessons converted of the 11 identified.** See *Residue* below for the eleventh.

The five predicts already on disk needed no edit and were deliberately kept: `tse-04-02`'s
existing prompt — *"True or false: 2 < 5. Now multiply BOTH sides by −1 — is −2 < −5?"* — is
exactly the move the new lab performs, which is a good sign the prose was written for a
manipulation the widget never delivered (playbook §2.1).

## Deviations from the playbook

Budgeted under §11 ("fit was verified by reading, not by building"; 10–15% residue expected).

1. **tse-01-01 and tse-01-03 → `algebraTiles`, not `solveBalance`.** The playbook groups these
   into the distribute-first family served by enhancement (f). On disk both are *expression*
   lessons — `−3(x + 2)` and `3(x + 2) + 4x`, with no equals sign. A pan balance needs two sides;
   `algebraTiles` (already registered in this course and used by `tse-01-02`) models signed
   distribution directly and needed no engine work.

2. **tse-03-02 → step `i3`, not `i1`.** The playbook says convert the first `[interactive]`.
   `i1` is `−2(x + 5) = −6`, whose solution is x = −2. The tile model cannot draw a negative
   number of tiles, and changing the authored numbers is a content change with no mathematical
   justification. `i3` (`−5(x + 3) = −20`, x = 1) is also an `[interactive]` step in the same
   lesson and carries the same concept — a negative multiplier reaching every tile inside the
   bracket. Converted that instead; `i1` keeps its numeric entry as formalization.

3. **tse-04-03 not converted — residue.** `5x + 20 ≥ 50` puts 50 unit tiles on one pan and 20 on
   the other. The largest pan the product has ever shipped is 28 tiles (`tse-02-04/ch1`), and 70
   tap targets at the 44px floor is not readable at 360px. Reverted to its authored `mcq`. A
   readable model for large magnitudes (base-ten grouping inside the pan) is the natural next
   engine increment; until it exists this lesson is better served by the engine it has. The
   integrity check now **rejects** any pan over 30 tiles so this cannot be authored by accident.

## Engine work — enhancements (f), (g), (h)

All additive. Every pre-existing spec parses to a byte-identical object (no injected keys), which
the first test block pins explicitly.

| # | Enhancement | Shape |
|---|---|---|
| f | `groups` | `{ count, x, unit }`, `count` **signed** — `−3(x + 2)` is three copies of `−(x + 2)`. `count·x = a`, `count·unit = b`. |
| g | signed tiles | `a` widened to ±6, `b` to ±24, `c` unbounded-but-capped. Integer pan totals *are* zero-pair cancellation. |
| h | `relation` | `eq \| lt \| gt \| le \| ge`, optional. Pans weighed at a **witness** from the solution set. |

Three design decisions worth recording:

- **Distribution offers two labelled buttons**, "Give the ×3 to both parts" and "Give the ×3 to
  the x only". Neither is a trap: each says exactly what it does, and the beam — not a message —
  reports which one conserved the pan. The partial-distribution misconception is a *reachable
  state* that tips the balance, which is what §1.4 asks for.
- **Multiplying both pans by −1 is the only move that reverses the beam.** It unifies (g) and
  (h): in an equation it rescues `−x = −6`; in an inequality it physically swaps which side is
  heavier, so the comparator must be flipped to keep describing the balance. The sign-flip rule
  stops being a rule and becomes something the learner watched happen.
- **`solveBalanceHolds` / `solveBalanceWitness` live in `schema.ts`**, shared by renderer and
  grader, so what the learner watched and what the grader concludes cannot come apart.

## Two bugs caught by the backward-compatibility block

Both would have shipped broken, and both were found by tests written *before* the new modes:

1. `relation: z.enum([...]).default("eq")` injected a required key into the parsed type and broke
   a `solveBalance` variant generator in `variants.ts`. Changed to `.optional()`, which is also
   closer to the playbook's "existing specs validate unchanged" requirement.
2. `spec.relation !== "eq"` is **true when relation is absent**, so the new inequality integrity
   rule fired on every existing equation — all three shipped lab lessons would have failed
   `validate:content`. Fixed to `(spec.relation ?? "eq") !== "eq"`.

## Tests

`src/components/widgets.solveBalance.s114.test.tsx` — 27 tests, all passing. No existing test was
weakened. Structure: backward compatibility first (parse identity, original control set, the
three original grading paths, legacy 3-tuple history), then one block per enhancement covering
the reachable wrong states, keyboard-reachable controls, undo across the new state, integrity
rejections, and the 360px pan ceiling.

---

# Conversion Log — Block 2: Grade 12 Trigonometry (unitCircleExplore wave · ghost · branch)

Per `CONVERSION_PLAYBOOK_6_12.md` §2.2 and §10. The pilot's tilt-state assertions become
detachment-state (ghost) and wall-state (branch) assertions; its group-expansion test template
becomes the dial-by-dial and formula-by-formula blocks in
`src/components/widgets.unitCircle.s115.test.tsx` (26 tests).

## Content-change ledger

**No authored lesson prose was changed.** Verified mechanically: a field-level diff of all 30
lessons in both trig courses against the pristine session-114 archive shows zero differences
outside the designated step's `widget` block and its added `predict` — every body, hint, id,
order, conceptTag, explanation variant and XP rule byte-identical. The conversion script
(`scripts/convert/block2-g12.mjs`) asserts the expected old widget type and re-checks `body`
byte-equality before any write, and a post-hoc replay check confirms the script's PLAN matches
the applied disk state field-for-field on all 27 lessons.

| Lesson | Mode | Core move | Old widget |
|---|---|---|---|
| tg-01-01 | wave · peak hunt (phase −90°) | the peak arrives late because the START moved | numeric |
| tg-01-02 | wave · four dials | each dial moves one feature; phase dial exposes the factored-form ×2 trap | numeric |
| tg-01-03 | wave · period (b = 2) | one cycle closes in 180° | numeric |
| tg-02-01 | wave · peak (cos, amp 2, mid 3) | cosine is born at its crest; max = mid + amp | numeric |
| tg-02-02 | ghost · cofunction | sin(x+90°) = cos x as a point that can't escape itself | numeric |
| tg-02-03 | ghost · negate | −θ is a mirror: only sine flips; both-flip impostor teleports | numeric |
| tg-03-02 | wave · tan zero | ride the wall at 90°, land the zero at 180° | numeric |
| tg-03-03 | wave · tan period (b = 2) | period = 180°/|b|, never 360°/|b| | numeric |
| tg-04-01 | branch [−90°, 90°] | the wall at 90° is what makes arcsin a function | numeric |
| tg-04-02 | branch [0°, 180°] | arccos needs a DIFFERENT arc — where cosine refuses to repeat | mcq |
| tg-04-03 | branch [−90°, 90°] | the y = x mirror read as a round trip on the circle | mcq |
| tg-05-01 | branch [−90°, 90°] | pushing for 150° and bumping the wall IS arcsin(sin x)'s fold | numeric |
| tg-05-03 | plain · partner solution | start ON arcsin's answer, drag to the supplement at 150° | mcq |
| ti-01-02 | wave · tan period | one ladder with 180° rungs — why sine's two families merge | numeric |
| ti-01-03 | wave · sin 2x period | dividing the ladder divides the rung spacing | numeric |
| ti-02-01 | wave · cos zero | sec's wall stands exactly on cos's crossing | numeric |
| ti-02-02 | ghost · cofunction | the sign slip squaring can't catch but the circle can | numeric |
| ti-02-03 | ghost · cofunction | a provable claim never detaches; one-point agreement isn't proof | mcq |
| ti-03-01 | ghost · sum (A = 30°) | sin A + sin B leaves the circle; the cross-terms keep it on the rim | mcq |
| ti-03-02 | ghost · cofunction past 90° | quadrant-blind sign "adjustment" detaches at the crossing | mcq |
| ti-03-03 | ghost · sum (A = 10°) | folding a four-term string back into sin 50° | mcq |
| ti-04-01 | ghost · double (no choices) | sin 2θ tops out at θ = 45° — the doubled point laps you | numeric |
| ti-04-02 | ghost · double, 4 choices | three faces glued, the sign-error face detaches | mcq |
| ti-04-03 | ghost · double | cos 2θ crosses into QII while θ is still acute | mcq |
| ti-05-01 | wave · sin peak | sin x = 1 is a tangency: one solution; interior heights give two | mcq |
| ti-05-02 | wave · sin zero | identity substitution is height-for-height — no solutions move | mcq |
| ti-05-03 | wave · cos zero | the sign boundary where squaring mints extraneous candidates | mcq |

**27 lessons converted of the 28 identified.** All new feedback strings are new authored content
and pass `validate:content` and `lint:pedagogy` like any other authored text.

## Deviations from the playbook

Budgeted under §11.

1. **Degrees, not radians.** The playbook writes `phase` in radians; the engine's entire lattice
   (targetAngle, angleStep, drag snapping) is integer degrees. New fields follow the engine
   (`phaseDeg`, `targetFeature.x` in degrees) so every reachable drag state stays exactly
   gradable. The untouched prose remains radian-flavored; the new widget prompts bridge
   (π/2 = 90°) explicitly.
2. **ti-01-02 / ti-01-03 → wave·period, not ghost.** The playbook's cluster table files them
   under identity-family ghosts, but on disk they are the general-solution ladder lessons: the
   rung spacing IS the period, so witnessing the period on the wave is the causal step. Same for
   **ti-02-01** (reciprocal functions): the teachable event is sec's wall standing on cos's zero.
3. **tan period integrity.** Building tg-03-03 forced a rule the playbook doesn't state: the
   integrity gate re-derives `period` features as 360°/|b| for sin/cos but **180°/|b| for tan**.
   The wrong-base reading (360/2 for tan 2x) is itself the misconception the lesson targets —
   the gate now rejects any author who makes it.
4. **tg-05-02 not converted — residue.** The helper-triangle lesson pivots on sin θ = 3/5, whose
   angle (≈36.87°) is off every integer lattice. Faking it to 35° would be a mathematical lie;
   converting the lesson properly wants an exact-ratio triangle mode (snap to 3-4-5, 5-12-13
   points with exact readouts) — a natural next engine increment. The lesson keeps its authored
   numeric entry, which is honest about what it teaches.

## What the engine gained (`src/lib/schema.ts`, `widgets.tsx`, `evaluate.ts`)

- **wave** — the circle unrolls beside a 0–360° axis; θ drags the trace with a leader line tying
  the point's height to the tip. `dials` (1–4 of amplitude/midline/angularScale/phaseDeg) draw a
  dashed target wave and grade dial-by-dial, each with its own misconception feedback;
  `targetFeature` (peak/zero/period/midlineCross + tolerance) turns the drag into a feature hunt.
  Tangent renders with asymptote gaps.
- **ghost** — a second point computed from a selectable RHS formula rides the direct point at
  2θ/−θ/(90°−θ)/(θ+A). True formulas stay glued through the entire drag; impostors detach with a
  berry gap line, and the linearity impostor visibly leaves the circle (coords > 1). An impostor
  selection is graded by ITS authored feedback ahead of any angle diagnosis.
- **branch** — `[lo, hi]` greys the excluded arc and clamps drag, slider and keyboard at the same
  two walls, with a berry wall-flash and an aria-live bump message.
- **Shared truth**: `ucWaveY` and `ucGhostPoint` live in `schema.ts`, used identically by the
  renderer, the grader, and the integrity gate — what the learner watched and what the grade
  concludes cannot come apart. `UC_TRUE_FORMULAS` makes formula truth a single exported fact.
- **Integrity gate** re-derives every authored claim by an independent method: feature truth via
  `ucWaveY` (with the tan-period base), ghost coincidence/detachment via a 0–360° sweep of
  `ucGhostPoint`, dial lattices, branch reachability. A choice set must contain a true identity
  and every impostor must carry feedback naming why it detaches.
- All new fields are `.optional()` (never `.default()`, the pilot's bug #1): the 10 pre-existing
  lessons and the gallery sample parse byte-identically, pinned by regression test.

## Tier gate (§9.1)

27 converted lessons: **26 Tier A + 1 Tier B (96% A)** — every converted lesson ≥ B, A-rate over
the 90% bar. The one B (tg-02-03, total 29) is structural, not a lab defect: the authored lesson
carries no notation-entry step after the interactive (every follow-up is mcq), which caps the
formalization dimension — and editing authored steps is outside this block's mandate. The
unconverted residue tg-05-02 remains C, ledgered above and in KNOWN_ISSUES.


---

# Conversion Log — Block 2: Grade 12 Trigonometry (unitCircleExplore wave/ghost/branch)

Per `CONVERSION_PLAYBOOK_6_12.md` §2.2 and §10. Block 2 follows the pilot because trig is the
largest single Tier-C cluster in the HS band and one engine — the unit circle — is the shared
object behind graphs, inverses, and identities. The pilot's tilt-state assertions become
detachment-state and wall-state assertions here.

## Content-change ledger

**No authored lesson prose was changed.** No `body`, lesson ID, step ID, step order, hint,
`conceptTag`, `explanationVariants`, remedial mapping, XP rule or curriculum alignment was
touched. `scripts/convert/block2-g12.mjs` asserts the expected old widget type on every targeted
step and re-checks `body` byte-equality after the edit, aborting before any write if either fails.

What changed, per lesson: the `widget` block of **one** step (`i1` throughout), plus a `predict`
block. New feedback and predict strings are new authored content and pass `validate:content` and
`lint:pedagogy` like any other authored text.

| Lesson | Step | Mode | Configuration |
|---|---|---|---|
| tg-01-01 | i1 | `wave` | sin · peak |
| tg-01-02 | i1 | `wave` | sin · 4 dials |
| tg-01-03 | i1 | `wave` | sin · period |
| tg-02-01 | i1 | `wave` | cos · midlineCross |
| tg-02-02 | i1 | `ghost` | cofunction · 2 formulas |
| tg-02-03 | i1 | `ghost` | negate · 2 formulas |
| tg-03-02 | i1 | `wave` | tan · zero |
| tg-03-03 | i1 | `wave` | tan · period |
| tg-04-01 | i1 | `branch` | [-90, 90] |
| tg-04-02 | i1 | `branch` | [0, 180] |
| tg-04-03 | i1 | `branch` | [-90, 90] |
| tg-05-01 | i1 | `branch` | [-90, 90] |
| tg-05-03 | i1 | `plain` | θ target |
| ti-01-02 | i1 | `wave` | tan · period |
| ti-01-03 | i1 | `wave` | sin · period |
| ti-02-01 | i1 | `wave` | cos · zero |
| ti-02-02 | i1 | `ghost` | cofunction · 2 formulas |
| ti-02-03 | i1 | `ghost` | cofunction · 2 formulas |
| ti-03-01 | i1 | `ghost` | sum · 2 formulas |
| ti-03-02 | i1 | `ghost` | cofunction · 2 formulas |
| ti-03-03 | i1 | `ghost` | sum · 2 formulas |
| ti-04-01 | i1 | `ghost` | double · no choices |
| ti-04-02 | i1 | `ghost` | double · 4 formulas |
| ti-04-03 | i1 | `ghost` | double · 2 formulas |
| ti-05-01 | i1 | `wave` | sin · peak |
| ti-05-02 | i1 | `wave` | sin · zero |
| ti-05-03 | i1 | `wave` | cos · zero |

**27 lessons converted of the 28 identified.** See *Residue* below for the twenty-eighth.
`tg-03-01` and `ti-01-01` already ran the plain engine with authored predicts and were left
exactly as they were.

## The three modes, and why each is the concept rather than a picture of it

- **wave** — the circle unrolls. Dragging θ traces `amplitude·trig(b·θ + phase) + midline` on an
  axis beside the circle, tied to the point by a leader line, so the trace's height and the
  point's height are visibly one number. With `dials` the learner reproduces a target wave one
  parameter at a time and each dial moves exactly one feature; with `targetFeature` the drag
  becomes a hunt for a peak, zero, midline crossing, or full period. `tg-01-02`'s phase dial
  carries the factored-form trap: `2(x − 45°) = 2x − 90°`, so the delay is doubled.
- **ghost** — an identity is a coincidence that survives dragging. A second point computed from
  the RHS formula rides the point named by the LHS at every reachable θ. Impostors detach
  visibly, and the `linearity` impostor (`sin(A+B) = sin A + sin B`) sails off the circle
  entirely, where no angle's sine and cosine can live. This is the contrast case §1.4 asks for:
  the wrong formula is a **state**, not a message.
- **branch** — the excluded arc is greyed and the drag hard-stops at two walls, on every input
  path (pointer, slider, keyboard). The restriction that makes an inverse a function is
  something you bump into. `tg-05-01` is the payoff: you try to reach 150° for `arcsin(sin 150°)`,
  hit the wall, and settle for 30° — the fold happening under your hand.

`ucWaveY` and `ucGhostPoint` live in `schema.ts` and are shared by renderer, integrity gate, and
grader, so what the learner watched and what the grader concludes cannot come apart.

## Deviations from the playbook

Budgeted under §11.

1. **Degrees, not radians, for `phaseDeg`.** The playbook writes phase in radians. The engine has
   always worked on an integer-degree lattice (`angleStep`, `targetAngle`), and mixing units
   inside one spec would put a float phase against an integer angle. Authored prose stays
   radian-flavored; the new widget prompts bridge explicitly (`x − 90°`, "that's π").

2. **`ti-01-02` / `ti-01-03` use wave-period, not the playbook's ghost cluster.** Both lessons are
   about *ladder spacing* — how far apart the general-solution rungs sit. The honest manipulative
   is watching one full copy of the pattern close: tangent's in 180°, `sin 2x`'s in 180° after the
   divide. A ghost would have shown a true identity these lessons never doubt.

3. **`ti-02-01` uses wave-zero.** "Six functions from two" is a reciprocal lesson; the
   consequential fact is that `sec` inherits a wall exactly where `cos` crosses zero. The learner
   lands the trace on that crossing.

4. **`tg-05-02` not converted — residue.** `θ = arcsin(3/5)` is ≈ 36.87°, off the engine's
   integer-degree lattice at every usable `angleStep`. Snapping to an exact ratio (a
   "helper-triangle" mode where the target is a coordinate, not an angle) is the natural next
   increment; until it exists the lesson keeps its authored numeric entry. Ledgered in
   `KNOWN_ISSUES.md`.

## Integrity rules added (each one an independent second method)

- Claimed-true ghost formulas must **actually coincide** with the direct point across a 0–360°
  sweep, and every impostor must **actually detach** somewhere. A mis-labelled formula cannot
  ship.
- `targetFeature` truth is re-derived through `ucWaveY`: a peak must sit at `midline + |amplitude|`,
  a zero at 0, a midline crossing at the midline.
- **Tangent's period is 180°/|b|, not 360°/|b|.** Caught while authoring `tg-03-03`: the first
  version of the rule assumed a 360° base and would have rejected the correct spec. Both the rule
  and a regression test now carry the distinction — including the classic error, reading
  `tan(2x)`'s period as 180°.
- `dials` must sit on their step lattice, must not duplicate a parameter, and must not start on
  their target (a dial that needs no move teaches nothing).
- `branch` must contain both `targetAngle` and `angleStart`; wave and ghost are mutually exclusive.

## Tests

`src/components/widgets.unitCircle.s115.test.tsx` — 26 tests, all passing, no existing test
weakened. Backward compatibility is pinned first: the pre-S115 spec parses to an object with none
of the new keys, renders the classic square stage, and grades low/exact/high exactly as before —
10 shipped lessons and the gallery sample depend on it. Then one block per mode, covering the
reachable wrong states, integrity rejections, keyboard-reachable controls, and the shared truth
functions swept across angles.

---

# Conversion Log — Block 2: Grade 12 Trigonometry (`unitCircleExplore` wave / ghost / branch)

Per `CONVERSION_PLAYBOOK_6_12.md` §2.2 and §10. Two courses, 30 lessons, 28 conversion
candidates (`tg-03-01` and `ti-01-01` already carried the engine and were left byte-identical).

## Content-change ledger

**No authored lesson prose was changed.** Verified not by inspection but by a field-level diff of
every converted lesson against the pristine session-113 archive: with the target step's `widget`
and `predict` excluded, all remaining fields — `body`, ids, step order, hints, `conceptTag`,
`explanationVariants`, remedial mappings, XP rules, every other step — compare equal. The
conversion script (`scripts/convert/block2-g12.mjs`) additionally asserts the expected old widget
type, refuses to overwrite an existing `predict`, re-checks `body` byte-equality and step-id
order, and **stages all 26 lessons in memory before writing any of them**, so a late failure
cannot leave the block half-converted.

What changed, per lesson: the `widget` block of step `i1`, plus a `predict` block (none of the 26
had one; all 26 gained one).

| Lesson | Old widget | New mode | The state the learner reaches |
|---|---|---|---|
| tg-01-01 | numeric | wave · feature `peak` | the peak arrives late because the circle STARTED late |
| tg-01-02 | numeric | wave · 4 dials | each dial moves one feature and leaves the others alone |
| tg-01-03 | numeric | wave · feature `period` | one cycle closes in 180° when b = 2 |
| tg-02-01 | numeric | wave · feature `peak` | cosine is born at its crest |
| tg-02-02 | numeric | ghost `cofunction` | the swapped point never lets go |
| tg-03-02 | numeric | wave · feature `zero` (tan) | ride the wall at 90°, land on the zero at 180° |
| tg-03-03 | numeric | wave · feature `period` (tan) | tan(2x) repeats every 90°, not 180° |
| tg-04-01 | numeric | branch [−90, 90] | the wall at 90° is what makes arcsin a function |
| tg-04-02 | mcq | branch [0, 180] | a different function needs a different arc |
| tg-04-03 | mcq | branch [−90, 90] | the y = x mirror as a round trip with one destination |
| tg-05-01 | numeric | branch [−90, 90] | pushing at the wall IS `arcsin(sin 150°)` folding |
| tg-05-03 | mcq | plain (target 150°) | the supplement is the partner solution |
| ti-01-02 | numeric | wave · `period` (tan) | one ladder, 180° rungs — why sine's two families merge |
| ti-01-03 | numeric | wave · `period` | dividing the ladder divides the rung spacing |
| ti-02-01 | numeric | wave · `zero` (cos) | secant's wall stands exactly on cosine's zero |
| ti-02-02 | numeric | ghost `cofunction` | a sign slip squaring would hide, that the circle shows |
| ti-02-03 | mcq | ghost `cofunction` | a valid proof step renames the point without moving it |
| ti-03-01 | mcq | ghost `sum` (A = 30°) | "add the sines" sails off the circle |
| ti-03-02 | mcq | ghost `cofunction`, θ = 115° | the identity survives the 90° crossing; the "adjustment" doesn't |
| ti-03-03 | mcq | ghost `sum` (A = 10°) | folding four terms back to one point |
| ti-04-01 | numeric | ghost `double` | sin 2θ from one angle used twice |
| ti-04-02 | mcq | ghost `double`, 3 true faces + 1 impostor | three faces, one point |
| ti-04-03 | mcq | ghost `double` | the sign-error point crosses to QII while θ is still acute |
| ti-05-01 | mcq | wave · `peak` | where sin x = 1 actually happens |
| ti-05-02 | mcq | wave · `zero` | the crossings a substitution has to respect |
| ti-05-03 | mcq | wave · `zero` (cos) | the candidates squaring invents live at cosine's zeros |

**26 lessons converted of 28 candidates (93%).** Two residues below, inside the §11 budget.

## Deviations from the playbook

1. **Degrees, not radians.** The playbook writes phase in radians. The engine's angle lattice has
   always been integer degrees (`angleStep`, `targetAngle`), and mixing units inside one spec
   would put the renderer and the grader on different scales. `phaseDeg` and `ghostAngle` are
   integer degrees; the authored prose stays radian-flavored and the new prompts bridge
   explicitly (`π/2 = 90°`) where a learner could otherwise lose the thread.

2. **`ti-01-02` / `ti-01-03` use wave-period, not the playbook's ghost cluster.** Both lessons are
   about the *spacing of a solution ladder*. The rung spacing IS the period, so dragging one
   full cycle and reading its length is the more direct witness than an identity coincidence.

3. **`ti-02-01` uses wave-zero rather than a reciprocal ghost.** The lesson's content is that
   secant inherits a wall from cosine's zero; the wall's location is the thing to find.

## Residue

1. **`tg-02-03` — reverted to its authored `numeric`, byte-identical to pristine.** The ghost
   `negate` lab built for it works and is covered by tests, but this lesson's `i1` is its *only*
   notation-entry step: every other widget is `mcq`. Converting it dropped the lesson's
   formalization score from 2 to 1, failing §9.2's mechanical `formal ≥ 2` check — the learner
   would manipulate and click, and never write notation. Rather than ship a lesson that fails a
   stated acceptance criterion, the conversion was withdrawn. The natural fix is an authored
   numeric follow-up step, which is a content *addition* and needs an explicit mandate.

2. **`tg-05-02` — not converted.** `θ = arcsin(3/5)` is off the engine's integer-degree lattice
   (36.87°), so no reachable drag state names it exactly. A faithful conversion needs an
   exact-ratio snapping mode (drag snaps to angles whose sine/cosine are authored rationals),
   which is the natural next increment for this engine.

## What the engine gained

Three additive modes, every new field `.optional()` — the pre-S115 spec parses byte-identically,
which is pinned by a regression test rather than asserted in prose.

- **`wave`** — the circle unrolls. Dragging θ traces `amplitude·trig(b·θ + phase) + midline` on an
  axis beside the circle, with a leader line tying the point's height to the trace tip, so the two
  representations are visibly one object. `targetFeature` turns the drag into a feature hunt
  (peak / zero / period / midline crossing) with the truth re-derived by the grader through the
  same `ucWaveY` the renderer draws with. `dials` promotes chosen parameters to sliders and draws
  the target wave dashed; each dial carries its own diagnosis, so "wrong shape" becomes "the shift
  inside the brackets gets multiplied too".
- **`ghost`** — an identity is a coincidence that survives dragging. A second point computed from
  the identity's right-hand side rides the direct point at every reachable θ; selecting an impostor
  formula makes it visibly detach, and the `linearity` impostor leaves the unit circle altogether,
  which is the reason `sin(A+B) ≠ sin A + sin B` rather than a fact about it.
- **`branch`** — the excluded arc is greyed and the drag hard-stops at two walls, on every input
  path (pointer, slider, keyboard). The restriction that makes an inverse a function is something
  you bump into.

`widgetIntegrityErrors` re-derives every claim independently: feature truth from `ucWaveY`,
identity truth from a 0–360° sweep of `ucGhostPoint` that requires true formulas to coincide
below 1e-9 **and** impostors to detach above 1e-6 (a choice set with no reachable coincidence, or
an impostor that never detaches, is rejected as having no contrast case). Tangent's period is
180°/|b|, not 360°/|b| — a rule the gate enforces and a test pins.

## Tests

`src/components/widgets.unitCircle.s115.test.tsx` — 26 tests, all passing, no existing test
weakened. Backward compatibility first (parse identity with no injected keys, classic square
stage, the three original grading paths, the reveal ghost, integrity clean), then the shared truth
functions (sweep coincidence/detachment across every ghost kind, the linearity point leaving the
circle, the QII crossing at θ = 70°), then one block per mode covering integrity rejections,
reachable wrong states, dial-by-dial grading, wall clamping, and `aria-valuetext` narrating the
mathematical state rather than the raw number.


---

# Conversion Log — Block 3: Grade 10 Geometry (engine enhancements a–e + solid geometry)

Per `CONVERSION_PLAYBOOK_6_12.md` §3 and §10. The largest block in the sequence: 102 lessons
across nine courses. This session delivered **the engine layer in full** plus the first authoring
course; the remaining courses are authoring-only against engines that are now ready.

## Engine enhancements (all five, all additive-optional)

| | Enhancement | The causal fact it makes visible |
|---|---|---|
| (a) | `triangleConstraintLab.constraint` | A lock the learner can deliberately BREAK. Locked, the base-angle readouts cannot be made to disagree; released, they diverge. The converse is the same lab run backwards. |
| (b) | `dilationExplore.showRatios` | k / k² / k³ as three numbers moving at three speeds under one drag (perimeter and area are MEASURED off the polygon, not asserted). `segments` re-stages as the side-splitter: AD/DB and AE/EC never disagree, and the midpoint cut is the midsegment. |
| (c) | `triangleSolve` mode `"ratios"` | **Two dials, only one of which moves the ratio.** Scale changes every side length and no ratio; angle changes every ratio. Ratio invariance under similarity is the only causal fact in introductory trigonometry and no engine showed it before. |
| (d) | `compassConstruct` × 5 modes | angleBisector, perpAtPoint, perpFromPoint, parallelThroughPoint, copyAngle. One interaction grammar; each mode's status line names *which equidistance did the work*. |
| (e) | `quadDrag` kite + `showMidsegment` | The midsegment drawn live, its length readout permanently the average of the two parallel sides. |

`triangleRatio` and `midsegmentLength` join `quadName` in `schema.ts` as shared truth functions,
so the number on screen and the number graded are one number. `quadName` had to MOVE there from
`evaluate.ts` (the integrity gate needs it, and `evaluate` already imports from `schema` — using
it in place would have been circular); it is re-exported so every existing importer is unchanged.

## A real bug found under (e)

`quadName` tested only one of the two kite orientations — sides (s0,s1)+(s2,s3), missing
(s1,s2)+(s3,s0). A kite listed from a different starting vertex was reported as *"just a
quadrilateral"*: the shape was a kite and the model refused to say so. Fixed and pinned with a
regression test that also checks squares, rhombi, rectangles and parallelograms are not promoted.

## Gallery: modes are now visible, and gate-covered

Blocks 1–3 added eleven modes that `/dev/widgets` could not show, because `widgetSamples.ts` was
one-canonical-sample-per-type. Measurement showed no structural change was needed: the registry
test already asserts *at least one* sample per type and every consumer resolves a type with
`.find()`. So the convention is now stated explicitly — **the first sample of a type is the
canonical one; later samples exercise distinct modes** — thirteen mode samples were added, and the
gallery badges duplicates "2 of 3".

The real prize is not the gallery. Every entry in `SAMPLES` is swept by the keyboard gate and the
a11y audit, so adding the samples put the new modes under those gates for the first time — and
they immediately caught three defects that would otherwise have shipped:

1. **testid collision.** `SideSplitterW` used the `ss-` prefix already owned by `SecantSlopeW` —
   exactly the collision class the repo fixed in S103 and pinned with a test. Renamed to `spl-`.
2. **Two functions rendering one engine's reveal ghost.** `ClassicalConstructW` duplicated
   `cmp-ghost`. The ghost is now rendered once, by the parent.
3. **Three incomplete sample specs.** The `solveBalance` mode samples omitted two required
   feedback fields and failed `WidgetSpec.parse`.

## A second real bug: two Rules-of-Hooks violations

`npx next lint` (run after the gallery work, not yet run when the samples were added) caught what
the test suite could not: `TriangleSolveW` and `DilationExploreW` both used an early-return router
pattern — `if (ratios mode) return <OtherComponent/>` — placed BEFORE the function's own
`useEffect`/`useRef`/`useSvgDrag` calls. That makes the hook call conditional on which mode the
spec carries, which is exactly the violation React's rule exists to catch: for `sas`/`sss` specs
the hook ran; for `ratios` specs it didn't, and which one happened depended on data, not on a
stable component identity.

Fixed by making each function a genuinely pure router that calls no hooks of its own — `TriangleSolveW`
now only chooses between `SasSssTriangleW` and `TriangleRatiosW`; `DilationExploreW` only chooses
between `DilationScaleW` and `SideSplitterW`. Every hook now lives inside a component that calls it
unconditionally on every one of its own renders, which is what the rule requires. Re-verified:
`next lint` exit 0, the 37-test geometry suite unchanged, typecheck clean.

## cx- (coordinate proofs): first inventory

Re-inventoried every step (not just `i1`, which my first pass under-counted the course by):
**6 of 15 lessons run a purpose-built engine with an authored predict**: `distanceGrid` on
`cx-01-01/01-02/05-01/05-02` and `coordinateProofLab` on `cx-01-03`. Two further attempts —
`coordinateProofLab` on `cx-02-02`'s challenge step and `quadDrag` on `cx-03-02` — were made and
then reverted; see the reversed-calls and revert notes below for why each failed a gate.

The remaining 8 were read individually against `CoordinateProofLabW`'s actual shape (three fixed
vertices, one dragged, slope/midpoint/distance readouts on the OPPOSITE-side pairing, claims
`parallelogram|rectangle|rhombus`) rather than assumed to fit:

- **`cx-02-03`, `cx-03-01`, `cx-03-03`, `cx-04-01`, `cx-04-02`** are reasoning/judgment MCQs —
  *which* tool to use, *which* placement minimizes algebra, *which* form is cleanest — not
  computations. These are legitimate KEEPs under the same MCQ_INVENTORY discipline that already
  governs `cp-`'s proof-ordering steps.
- **`cx-04-03`** (Varignon: the midpoint-quadrilateral of an arbitrary quadrilateral is a
  parallelogram) computes shoelace area on a DERIVED shape — the midpoints of an outer
  quadrilateral's sides. `CoordinateProofLabW` draws the outer quadrilateral itself; it does not
  construct a midpoint-quadrilateral from it. Forcing the claim onto the wrong shape would
  misrepresent the theorem. A dedicated Varignon mode is a real future candidate, not a fit today.
- **`cx-05-03`** (solve `x² + x − 12 = 0` for the circle-meets-line intersection) is algebra
  following an already-diagrammed substitution — the "safe direction" pattern (compute, don't
  manipulate), same as `tg-05-01`'s `sin(arcsin x)`.
- **`cx-02-01`** (P divides AB in ratio m:n) is genuinely a different manipulative shape — a point
  dragged along a SINGLE segment between two fixed endpoints, not a quadrilateral's fourth vertex.
  No existing engine models this. **Residue**, ledgered in `KNOWN_ISSUES.md`: a small
  `segmentPartition` mode (or an addition to `coordinateProofLab` accepting 2 fixed points instead
  of 3) is the natural fix.

**No file in this course was written to.** No content-change ledger row applies because no widget
block changed.

## Content-change ledger — a second authoring batch (tc-, rt-)

Before authoring, every already-shipped `triangleConstraintLab`/`triangleSolve` usage in these two
courses was re-verified against the ACTUAL S116 implementation (parse + `widgetIntegrityErrors`,
not assumed from the playbook's description): `tc-02-01` (HL), `tc-03-01`/`tc-03-02`/`tc-03-03`
(enhancement (a): `constraint: isoscelesLegs`/`midsegment`), and `rt-01-02`/`rt-02-01`/`rt-05-03`
(modes `sss`/`ratios`/`sas`) all parse and pass `widgetIntegrityErrors` — **enhancement (a) and
(c)'s flagship lessons were already authored**, ahead of this session's own engine work reaching
them.

That re-verification was necessary but **not sufficient**, and it is worth being precise about
what it missed. Parse + integrity is a check on the widget spec in isolation; it cannot see
whether the step's `variant` tag still matches the widget's surface, nor whether any reachable
input actually grades correct. `tc-02-01` passed this check and was still broken (see the defects
section below). Schema-level validity is not content-level correctness.

Three further conversions, via `scripts/convert/block3-tc-rt.mjs` (same validate-all-then-write
discipline: every spec parses and passes integrity before any file is touched; body byte-equality
re-checked after):

| Lesson | Step | Old widget | New widget | Configuration |
|---|---|---|---|---|
| tc-01-02 | i1 | mcq | `triangleConstraintLab` | SSA (5, 8, 35°) — the ambiguous case itself |
| tc-05-02 | i3 | dragOrder | `triangleSolve` | sas (5, 8, target **7** at exactly 60°) — the hinge theorem. Originally authored as target 8 at "75°", which is wrong on both counts and unsolvable at integer degrees; corrected — see the defects section below. |
| rt-01-01 | i1 | mcq | `distanceGrid` | anchor (0,0) → (4,3) — the 3-4-5 triangle, literally |

**No authored prose was changed.** Predicts added on `tc-01-02` and `tc-05-02`; `rt-01-01` already
carried one (preserved verbatim).

`tc-01-02` is the flagship SSA lesson the playbook names directly: the SAME 5-8-35° givens that
produce a unique triangle under SAS produce TWO under SSA — verified computationally before
authoring (`candidateCount === 2` at these exact values), not assumed. `rt-01-01` reuses
`distanceGrid` exactly as it already appears in `cx-01-01`'s gallery-adjacent sample — the distance
formula and the Pythagorean theorem are not analogous, they are the same arithmetic, and the anchor
(0,0)→(4,3) makes that literal rather than illustrated.

Tier gate: `tc-01-02` A (33), `rt-01-01` A (30), `tc-05-02` B (29). The one B is capped by frozen
content on its OTHER steps (i1/k1/i2/k2 remain mcq/numeric), the same structural pattern already
seen at `tg-02-03` in Block 2 — outside the one-step-per-lesson mandate to fix.

## Residue and remaining scope, updated

`tc-`/`rt-` (30 lessons total): 3 already shipped before this session + 7 already shipped WITH
enhancements (a)/(c) baked in + 3 converted this pass = 13 of 30 now running a purpose-built
engine. The remaining 17 are predominantly CPCTC proof-ordering (`dragOrder`, a legitimate keep —
the same judgment-task class documented for `cp-`), center-finding (`tc-04-*`, which needs a
three-line-concurrency evidence type `coordinateProofLab` does not have — a real future candidate,
not attempted here), and formalization-heavy trig application (`rt-03-*`/`rt-04-*`/`rt-05-02/04`)
where the existing `triangleSolve` modes already cover the causal content and no further engine
work applies. Not touched this session; nothing about them is blocked for a future pass.

**`cx-` (coordinate proofs, 15 lessons) required no conversion.** See the dedicated section above —
7 of 15 already run a purpose-built engine; the remaining 8 are legitimate keeps or genuine residue
(`cx-02-01`, ledgered in `KNOWN_ISSUES.md`).

## Content-change ledger — solid geometry

**No authored lesson prose was changed.** No `body`, lesson ID, step ID, step order, hint,
`conceptTag`, `explanationVariants`, remedial mapping, XP rule or curriculum alignment was
touched. `scripts/convert/block3-sg.mjs` parses and integrity-checks **every** spec before writing
**any** file, then re-checks `body` byte-equality — so a bad spec cannot reach disk part-way
through a batch.

| Lesson | Step | New widget | Configuration |
|---|---|---|---|
| sg-01-01 | i1 | `solidSliceLab` | sphere · compare=false |
| sg-01-03 | i1 | `solidSliceLab` | cone · compare=false |
| sg-02-01 | i1 | `solidSliceLab` | cylinder · compare=true |
| sg-02-02 | i1 | `solidSliceLab` | prism · compare=true |
| sg-03-02 | i1 | `solidSliceLab` | cone · compare=true |
| sg-05-01 | i1 | `dilationExplore` | showRatios length/area/volume |

`sg-03-01` already ran `solidSliceLab` with an authored predict and was left exactly as it was.

The engine's schema has carried `comparisonRequired` and `targetFraction` since it was built —
it was built FOR Cavalieri — and the Cavalieri lessons never called it. `sg-02-01` is the sharpest
case: its authored question is whether matching at two heights is enough, and the lab now lets the
learner hunt for the height where two solids come apart. `sg-05-01` uses enhancement (b) instead:
its content is k, k², k³, which is exactly the three readouts pulling apart under one drag.

## Residue and remaining scope

Six of the fourteen `sg-` lessons converted. The rest (`sg-04-*` composites, `sg-05-02/03`) are
formalization-heavy and the playbook allocates them one lab step each rather than a conversion —
authoring not yet done. **The other eight courses (cx, tc, rt, sy, cp, pq, cr, gf — roughly 88
lessons) are authoring-only against engines that are now ready.** Nothing about them is blocked.

## Content-change ledger — coordinate proofs (cx-)

**No authored lesson prose was changed.** `scripts/convert/block3-cx.mjs` follows the same
validate-all-then-write discipline as `block3-sg.mjs`: every spec parses and passes integrity
before any file is touched, then `body` byte-equality is re-checked.

The playbook describes this course as "zero enhancement, every lesson maps directly." Reading the
full arc of every remaining lesson — not just its first `[interactive]` step — shows that holds
for a minority of the 13 candidates. `coordinateProofLab` is a 3-fixed-vertices-plus-dragged-4th
CONSTRUCTION tool; `distanceGrid` is a one-fixed-anchor drag-to-a-point tool (confirmed by reading
its render: it draws exactly one anchor, never two, so it cannot carry a "where does P sit between
A and B" story — that ruled out `cx-02-01`'s partition-ratio lesson); `quadDrag` is a
3-fixed-plus-1-dragged tool with a live shape-name classifier. Five lessons genuinely fit; the
rest are honest residue, each with its reason recorded below.

| Lesson | Step | New widget | Why it genuinely fits |
|---|---|---|---|
| cx-05-01 | `i1` | `distanceGrid` | "Tangent to the x-axis" IS a single-anchor distance fact: drag to the point of tangency, read the radius off the leg. |
| cx-05-02 | `i1` | `distanceGrid` | "Is the house covered?" IS a single-anchor distance-vs-radius fact: drag to the house, read the distance, compare to 20. |
| cx-01-02 | `i1` | `distanceGrid` | The midpoint IS a single point at a single-anchor distance: drag to where averaging both coordinates says it should sit, read the distance from A. See *reversed calls* below — an earlier pass in this same session filed this as residue. |

**`cx-02-02` was converted, then REVERTED — and the reason corrects a claim made earlier in this
same ledger.** An earlier pass converted its `ch` step from `numeric` to `coordinateProofLab`,
and recorded that the step's `variant: {gen: "g10-coordinate-proofs", form:
"cx-parallel-proof__numeric"}` tag was thereby made "permanently inert," on the stated grounds
that no generator for that form existed. **That was wrong.** The generator exists and fires: the
form is implemented in `geometryVariantTemplates.json`, and one of the numeric problems it serves
is *literally the same* parallelogram-find-C item the lab was replacing. The conversion therefore
did not make the tag inert — it broke the step's variant contract, pointing a live `numeric`-surface
generator at a `coordinateProofLab` widget. The `variants.resolver` gate caught it
("declared g10-coordinate-proofs but it does not serve coordinateProofLab").

The step was restored byte-for-byte to its authored `numeric` form from the session-115 archive
(diffed first: only `ch` differed). Reverting is the right call rather than stripping the tag,
because the tag was doing real work — that step was receiving fresh, independently-answer-checked
numeric variants on every visit, and a one-off lab is worth less than live freshness coverage on
a capstone item. `cx-02-02` is consequently **not** a Block 3 conversion at all.

`cx-02-02`'s `i1` remains as authored mcq: it tests collinearity (equal slope through a SHARED
point), a distinct fact from the parallelogram construction, and no lab in the registry models it.

### Reversed calls — the earlier pass filed both cx-01-02 and cx-03-02 as residue

An earlier pass this same session evaluated and rejected both. On re-examination one converts
honestly and one does not — and the one that does not was caught by the solvability gate before it
could ship, which is exactly what that gate exists for. Recorded in the open:

**`cx-01-02` — converted (the earlier call was too conservative).** The earlier pass called this
"a formula-application question ... with no vertex to drag and no single fixed anchor to measure
from." It DOES have a single fixed anchor — A — the same shape `cx-05-01`/`cx-05-02` already use.
The concern was narrative, not technical: does dragging-to-a-visually-estimated-point bypass the
averaging formula? The `predict` step answers that rather than leaving it: it asks for the distance
from A BEFORE the drag, so the reasoning (half of 10, or averaging both coordinates) happens first;
the widget then lets the learner verify it. Verified: midpoint of A(1,2), B(7,10) is exactly
(4, 6), distance 5; start (1, 2) ≠ target, so not pre-solved.

**`cx-03-02` — attempted, then REVERTED. A genuine force-fit the earlier pass was right about.**
The idea was "drag S until the rhombus becomes a square." Checking the actual geometry killed it:
the three fixed vertices (0,0), (5,0), (8,4) have equal sides PQ = QR = 5 but the angle at Q is not
90° (the dot product is −15). Three points that are not a right-isosceles corner can never be
three corners of a square, so NO fourth vertex makes PQRS a square — the live classifier `quadName`
confirms it returns "a rhombus" for the intended S and finds zero squares over the entire integer
grid. A `quadDrag` with `targetName: "a square"` there is unsolvable by construction. The
`content.widgets.audit` solvability gate flagged it as PRE-SOLVED (a symptom of the same broken
spec — I had also mistakenly set start = target), and chasing that down surfaced the deeper
impossibility. The step was restored byte-for-byte to its authored mcq from the session-115
archive (only `i1` differed; the restore was diffed to confirm nothing else moved). This is the
frozen-content and no-force-fit rules working as intended: an interaction that cannot faithfully
represent the mathematics is worse than the authored version, and the gate + the honest geometry
check caught it before it reached a deliverable.

### Residue — ten lessons, with specific reasons

| Lesson | Why it stays as authored |
|---|---|
| `cx-02-02` | Its `ch` step carries a LIVE variant generator serving fresh numeric problems; converting the surface broke that contract and the step was reverted. Its `i1` tests collinearity, which no registered engine models. See the revert note above. |
| `cx-02-01` | Partition-ratio needs BOTH endpoints A and B visible to teach "P divides AB"; `distanceGrid` draws only one anchor. Converting would show "distance from A" and lose the segment framing entirely. |
| `cx-02-03` | Perpendicular-slope relationship between two lines — no construction or single-anchor-distance shape fits without new engine work. |
| `cx-03-01`, `cx-03-02`, `cx-03-03` | Classification of an ALREADY-FIXED static triangle or quadrilateral, and a placement-strategy question about proof setup. `cx-03-02`'s three fixed points cannot be three corners of a square (the angle at Q is not 90°), so no drag makes its target claim reachable — see *reversed calls* above. |
| `cx-04-01`, `cx-04-02`, `cx-04-03` | Perimeter, box-method area, and shoelace formula on already-fixed static figures — pure computation, no construction content. |
| `cx-05-03` | Circle-line intersection via substitution into a quadratic — an algebra step, not a distance-to-an-anchor relationship. |

Tier gate on the three converted: `cx-01-02` A (31), `cx-05-01` A (30), `cx-05-02` A (30) — all
clear the §9.1 bar (every converted lesson ≥ B), and all three are A.

This is a lower conversion rate than Blocks 1–2 (3 of 13 candidate lessons, plus the two labs the
course already carried at `cx-01-03` and `cx-02-02`'s sibling steps, out of 15 total). That is the
honest number for this specific course: G7 equations and G12 trig were built from labs already
shaped like their content; several `cx-` lessons are formula and classification exercises whose
natural home is a worked numeric or mcq check, not a construction lab. Forcing a fit would have
cost more than it bought — `cx-03-02` and `cx-02-02` above are the concrete proof, two attempts
that the solvability and variant-surface gates correctly rejected.

## Three defects in the earlier tc-/rt- batch, found by the FULL suite

The `tc-`/`rt-` conversions were authored in an earlier pass and had passed the targeted gates.
The first complete `vitest run` after all of Block 3 landed caught three real problems that only
the corpus-wide gates can see. All three are the same lesson: **a targeted suite proves the engine
works; only the full suite proves the CONTENT written against it is sound.**

**1. `tc-05-02` — wrong mathematics in the widget block. Fixed, not reverted.** Its `triangleSolve`
(mode `sas`, sides 5 and 8) asked the learner to dial the included angle until the third side
reached a target of **8**. The third side hits 8 at 71.79°, and the angle dial steps in whole
degrees — so no reachable input graded correct, and the `content.widgets.audit` solvability gate
reported it UNSOLVABLE. Worse, the authored `successFeedback` asserted "At 75° the third side
reaches 8," which is simply false (75° gives ≈ 8.26). Retargeted to **7**, which the same triangle
hits at *exactly* 60°, and the three feedback strings were rewritten to the corrected anchors
(30° → ≈ 4.4, 60° → 7, 120° → ≈ 11.4). Verified after the fix: exactly one solving angle (60),
start 30 not pre-solved. Fixing was preferred to reverting because the hinge-theorem lab itself is
sound and worth keeping — only its numbers were wrong. This is a mathematical-correctness edit,
the one category of content change the playbook permits without a separate mandate.

**2. `tc-02-01` — a broken variant contract. Reverted.** Its `k1` step was converted to
`triangleConstraintLab` while keeping a `variant` tag declaring `g10-triangle-congruence` /
`tc-hl__mcq` — an **mcq**-surface generator. Identical in kind to the `cx-02-02` defect above, and
caught by the same resolver gate. Restored byte-for-byte to its authored mcq from the session-115
archive (diffed first: only `k1` differed), which restores the live variant freshness the tag was
providing.

**3. `content.widgets.audit` could not see `triangleSolve` ratios mode at all.** The audit's input
enumerator modelled only the bare-number value that `sas`/`sss` use. Enhancement (c) gave `ratios`
mode an OBJECT value `{angle, scale, scaleMoves}`, so every ratios lesson received candidate inputs
the evaluator rejects on the first type check — meaning those lessons were being "audited" against
a space in which nothing could ever grade correct. The enumerator now models the object space:
angles across the acute range paired with enough scale moves to clear the `requiredScaleMoves`
gate, **plus one deliberately under-scaled candidate** so the "resize first" feedback path is
proven reachable rather than reported dead. Without that last candidate the fix would have traded
an UNSOLVABLE failure for a DEAD FEEDBACK one.

### A corpus-wide sweep, so these were not found one at a time

Rather than let further instances surface across successive 10-minute suite runs, both defect
classes were swept across the whole corpus directly:

- **Variant surfaces:** all **4,268** steps carrying a `variant` declaration were re-resolved with
  the resolver gate's exact logic (serves-non-null, surface matches, ≥ 4 distinct problems over 12
  seeds). **Zero mismatches, zero stale generators.**
- **`triangleSolve` solvability:** every instance in the corpus re-checked for at least one
  integer-reachable solving input, in both the bare-number and object-value modes. **Zero
  unsolvable** after the `tc-05-02` fix.

## Tests

`src/components/widgets.geometry.s116.test.tsx` — 37 tests, all passing, no existing test
weakened. Backward compatibility is pinned first in every block: eight shipped geometry engines
and the gallery depend on the pre-S116 specs parsing and grading byte-identically.

One test was fixed rather than the code: the side-splitter agreement assertion compared full
`textContent` of two differently-LABELLED readout boxes, which can never match. The ratios did
agree. It now compares parsed values and additionally asserts the shared value MOVES with the
cutter — so what is pinned is the equality, not a constant.

## Content-change ledger — similarity (sy-) and constructions (cp-)

**No authored lesson prose was changed.** Both scripts follow validate-all-then-write, and
`block3-cp.mjs` additionally asserts the widget block is **byte-identical before and after**, since
that batch is defined by not touching it.

### sy- — one conversion, and it is the one the `segments` mode exists for

| Lesson | Step | Change | Why it fits |
|---|---|---|---|
| sy-03-01 | i1 | `numeric` → `dilationExplore` (`showRatios: ["segments"]`) + predict | The side-splitter theorem IS the claim that two ratios cannot be made to disagree, which a static diagram can only assert. The lesson's own numbers map onto the engine exactly: AD = 4, DB = 6 puts the cut at t = 0.4, where both readouts show 0.67 — which is 4/6 and equally 6/9, so the step's own answer (EC = 9) is the number on screen. Tier **A (33)**. |

`sy-01-01` and `sy-05-03` already ran `dilationExplore` with authored predicts; untouched.

**`sy-03-02` (the CONVERSE) does not fit, despite being the adjacent lesson.** `SideSplitterW`
interpolates D and E at the same parameter t along two sides, so its cutter is parallel *by
construction* — it can never render a non-parallel cut. The converse's whole content is "given
these ratios, IS it parallel?", so the engine would show a parallel line while asking the learner
to decide whether it is parallel. Residue.

### cp- — the playbook's prescription did not survive contact with the content

§3.5 says: extend `compassConstruct`'s mode enum, then convert the cp- construction lessons onto
the new modes. The enum **was** extended this session (five modes, tested, gallery-covered). The
lessons those modes were built for cannot take them, for a reason visible only in the widget block
rather than its type name: `cp-01-03/i1`, `cp-02-01/i1`, `cp-02-02/i1` and `cp-02-03/i1` are
`steppedReveal` widgets whose `panels` arrays each hold **three stages of authored instructional
prose** ("Point on V, swing an arc that crosses one side at D and the other at E. Now VD = VE.").
Replacing the widget deletes that teaching text — exactly what the frozen-content rule protects.

There is no second step to convert instead: every other variant-free step in those four lessons is
arithmetic, not construction (bisect 90° → 45; alternate angle of 55°; corresponding angle 63°).
An engine that opens a compass cannot pose "what is half of 90."

So the gain is the missing HALF of the loop rather than a widget swap. These steps already *show*
the construction but ask for no commitment first; each gained a `predict` naming the construction's
**warrant** — the equidistance that does the work — which is the fact a learner can hold a wrong
belief about while still copying the steps correctly. Precedent is well established: the
`steppedReveal` + `predict` pairing already ships in mult-01-05, mult-02-03, mult-03-05,
mult-04-03 and pv2-04-01, so no new convention was invented.

| Lesson | Step | Change | Tier |
|---|---|---|---|
| cp-01-03 | i1 | + predict (widget untouched) | C (26) |
| cp-02-01 | i1 | + predict (widget untouched) | C (26) |
| cp-02-02 | i1 | + predict (widget untouched) | C (27) |
| cp-02-03 | i1 | + predict (widget untouched) | C (26) |
| cp-03-01 | i1 | + predict on its existing `compassConstruct` | **A (31)** |

**These four C lessons are deliberately NOT counted as conversions**, and the §9.1 "every converted
lesson ≥ B" bar is not being quietly applied to them. A predict supplies commitment, not
manipulation, and the tier formula is right to keep them at C. They are a genuine but *lesser*
improvement, and calling them conversions would be inflating the number. The two real conversions
this round, `sy-03-01` and `cp-03-01`, are both A.

Course-wide Tier A 424 → **426**.

**The five new compass modes therefore ship without a lesson calling four of them.** That is an
honest cost of having built the engine from the playbook's course-level description before reading
the lessons' widget blocks. They are not wasted — they are tested, gallery-visible, and ready — but
the lessons that would use them need authored prose written FOR a lab, which is new content and
needs an explicit mandate rather than a silent rewrite.

## Content-change ledger — polygons & quadrilaterals (pq-)

**No authored lesson prose was changed.** The predict-only entries assert the widget block is
byte-identical after writing.

| Lesson | Step | Change | Tier |
|---|---|---|---|
| pq-04-03 | i1 | `mcq` → `quadDrag` (kite) + predict | **A (34)** |
| pq-03-03 | i1 | + predict on its existing `quadDrag` (widget untouched) | **A (34)** |
| pq-05-02 | i1 | + predict on its existing `quadDrag` (widget untouched) | **A (32)** |

`pq-04-03` is the lesson that exercises the kite-classifier bug this session found and fixed —
`quadName` had tested only one of the two valid kite orientations, so a kite listed from a
different starting vertex read as "just a quadrilateral." A lesson whose whole subject is *how is a
kite different from a parallelogram* is exactly where a learner would have met that bug. Its
authored question is answered by where the equal sides SIT (adjacent vs opposite), which is a fact
a drag can show and a sentence can only assert. Verified against the real classifier before
authoring: fixed (0,0), (4,3), (8,0) with the corner at (4,8) gives adjacent pairs 5, 5 and
8.94, 8.94 and returns "a kite"; the start (7,6) returns "just a quadrilateral", so the lab opens
genuinely unsolved.

**`pq-04-02` (The Trapezoid Midsegment) does NOT convert**, even though enhancement (e)'s
`showMidsegment` was built for precisely this theorem. Its two variant-free steps are a
degenerate-limit question (shrink the top base to zero — which needs TWO vertices to move, and
`quadDrag` moves one) and a computation on bases 30 and 12, which do not fit a 10-unit grid. The
engine shows the right concept; neither step asks the question the engine answers. Residue — and
`showMidsegment` consequently ships used only by its gallery sample.

Everything else in the course is angle-sum arithmetic on fixed polygons, and every one of those
steps carries a `variant` tag serving live numeric problems — converting any would break the
surface contract, the defect class this session already hit three times.

### A pedagogy-gate catch, self-inflicted

The first `pq-04-03` spec failed `lint:pedagogy` (1138/1139): its `sideFeedback` opened with *"No
pair of equal sides shares a corner yet…"*, and the linter's `GENERIC` guard rejects any wrong-path
feedback beginning `no|wrong|incorrect|try again|nope|not right|bad|sorry`. The match is a false
positive in the strict sense — "No" there is a determiner, not a dismissal — but the guard is a
cheap lexical rule protecting something real (feedback should diagnose, not dismiss), and it is
trivial to respect. Reworded to open "The equal sides here do not share a corner…", keeping the
diagnosis identical. Fixed in **both** the lesson JSON and `block3-pq.mjs`, and the two were then
asserted byte-identical so a re-run of the script produces no diff. Gate back to 1139/1139.

## Addressing the orphaned modes — coverage, not invented lessons

Four of the five new `compassConstruct` modes, plus `quadDrag.showMidsegment`, shipped with no
lesson calling them (see the cp- and pq- sections above for why: the lessons they were built for
teach via authored `steppedReveal` prose that must not be deleted, and no other step in them is a
compass or midsegment task). Writing lessons FOR those labs is new authored content and needs an
explicit mandate, so that is not what happened here. What *was* actionable is coverage.

**Samples added for the four modes that lacked them** — `perpAtPoint`, `perpFromPoint`,
`parallelThroughPoint`, `copyAngle` — so `/dev/widgets` shows every mode and each is parsed at
module load by the keyboard sweep's `SAMPLES.map(WidgetSpec.parse)`.

**A correction, made after checking rather than assuming.** The first version of this note claimed
the new samples "put the modes under the keyboard and a11y gates." That is **false**, and the claim
was retracted once the test sources were actually read: both `widgets.keyboard` and `widgets.aria`
resolve ONE spec per TYPE with `.find((s) => s.type === t)`, so they only ever exercise the FIRST
`compassConstruct` sample — `perpBisector`. Adding samples changed gallery visibility and
parse-validation; it added no behavioural coverage. A related claim that "the sweeps grew from 334
to 371 tests" was also wrong: those were two DIFFERENT file sets, not growth. The full suite total
was unchanged at 8,442, which is what exposed the error.

The modes were never untested — the dedicated `widgets.geometry.s116` suite already pinned all five
modes' rendering, status lines and warrants. The genuine gap was narrower: keyboard operability and
accessible-name distinctness, which the type-level sweeps skip for every non-first sample. Closed
with a targeted test in that suite (now **38 tests**) driving each classical mode's slider from the
keyboard and asserting the figure's `aria-label` does not duplicate the control's.

### And that immediately caught a pre-existing bug — in a Block 1 sample

Adding the samples meant re-running the gallery sweep with `widgetIntegrityErrors`, not just
`WidgetSpec.parse`. **An earlier check in this session reported "0 bad specs across all 122
samples" — that check only ran `parse`, and was therefore blind to this.** The `solveBalance`
sample for `3(x + 2) = 18` set `b: 2`, the unbracketed constant, where the field means the constant
AFTER distribution: 3(x + 2) expands to 3x + 6, so `b` must be 6. With `b: 2` the integrity gate
correctly objected twice — `(c − b) = 16` is not divisible by `a = 3`, and "groups give 3×2 = 6
units but b = 2" — and the sample contradicted its own `successFeedback` of "x = 4". Fixed to
`b: 6`, which makes `(18 − 6)/3 = 4` agree with the authored feedback. Gallery now **126 samples,
0 bad on parse AND integrity**.

**The catch was luck, not a standing gate — checked precisely, then made one.** Several files
(`widgets.keyboard`, `widgets.a11yAudit.s44`, `evaluate.new`, `evaluate.learnerAnswer`,
`determinism`, `widget-coverage`) already run `SAMPLES.map(WidgetSpec.parse)` unconditionally at
module load — real, pre-existing coverage, and the actual reason the three incomplete Block-1
`solveBalance` samples were caught previously. But no test swept every sample through
`widgetIntegrityErrors`; this `b:2` bug was found by an ad-hoc script written for this specific
check, not an existing gate. Added a permanent test to `widgets.registry.test.ts` — every entry in
`SAMPLES` now runs through `widgetIntegrityErrors` on every suite run, so a future sample that is
well-typed but mathematically wrong is caught the way lesson content already is, rather than
depending on someone remembering to check by hand. Registry suite: 4 tests → **5**, all passing.

## Content-change ledger — circles (cr-), closing out Block 3

**No authored lesson prose was changed, and no widget block was modified** — the script asserts the
widget byte-identical before and after.

This course needed no conversion: 12 of its 15 lessons already run `circleAngleExplore` or
`circleMeasureExplore`, exactly as §3.7 said. Six of them were missing the FIRST half of the loop —
the lab was there, the commitment before it was not.

| Lesson | Step | Change | Tier |
|---|---|---|---|
| cr-02-01 | i1 | + predict on its existing `circleMeasureExplore` | **A (31)** |
| cr-02-02 | i1 | + predict | **A (31)** |
| cr-02-03 | i1 | + predict | **A (31)** |
| cr-03-01 | i1 | + predict | **A (31)** |
| cr-05-01 | i1 | + predict | **A (31)** |
| cr-05-02 | i1 | + predict | **A (31)** |

Each predict asks for the INVARIANT rather than the arithmetic the lab is about to display — a
predict whose answer is the number on the readout is not a prediction, it is the answer key. Every
distractor is a real misconception: that chord distance depends on where the chord sits, that the
perpendicular from the centre lands off-centre toward the longer arc, that a bigger circle needs
different machinery than 3-4-5, and — the sharpest one — that a sector takes a *smaller* share of
the AREA than of the arc because "area scales by the square." That last is a genuine confusion
between the k² rule for SIMILAR figures and a slice of one fixed circle, and `cr-05-02`'s reveal
names the distinction directly.

Course-wide Tier A 429 → **435**.

**`gf-` (geometry foundations) needed nothing.** Its interactive steps already carry predicts
(`transformExplore`, `plotPoint`, `buildExpression`); the remainder are definition-sorting and
symbol-classification tasks (`dragBucket`, `matchPairs`, `tapDiagram`) whose content is vocabulary
and convention, not a manipulable relationship. Nothing to convert and nothing missing.

## The classical-construction labs — authored under explicit mandate

The five new `compassConstruct` modes shipped with no lesson able to take them, because the four
cp- lessons teaching those exact constructions carry `steppedReveal` widgets whose `panels` hold
three stages of authored prose each. That was recorded as residue pending a content mandate; the
mandate was given, and `scripts/convert/block3-cp-labs.mjs` acts on it.

**A precision correction to an earlier entry.** This log previously said "four of the five new
modes ship without a lesson." Measured directly, it was **all five** — only `perpBisector`
(cp-01-01) and `hexagon` (cp-03-01) had lessons. The "four" figure referred to modes lacking
gallery SAMPLES, which is a different set. All five are now placed.

**Nothing authored was rewritten or replaced.** Each lesson gains ONE new `interactive` step
inserted directly AFTER the stepped reveal, so the sequence reads: study the stages → perform the
construction → the existing checks. Every pre-existing step keeps its id, kind, body, widget,
order, conceptTag and variant tag; the script snapshots `doc.steps` before the splice and asserts
that removing the new step reproduces the snapshot byte-for-byte, so a destructive edit cannot pass.

| Lesson | New step | Mode | Tier before → after |
|---|---|---|---|
| cp-01-03 | `i1b` after i1 | `angleBisector` | C (26) → **A (31)** |
| cp-02-01 | `i1b` after i1 | `perpAtPoint` | C (26) → **A (31)** |
| cp-02-02 | `i1b` after i1 | `perpFromPoint` | C (27) → **A (32)** |
| cp-02-03 | `i1b` after i1 | `parallelThroughPoint` | C (26) → **A (31)** |
| cp-01-01 | `i2b` after i2 | `copyAngle` | B (28) |

Step ids follow the shipped insertion convention (`k1b` appears in nine existing lessons); no
existing id was renumbered. `conceptTag` reuses each lesson's OWN tag, every one of which already
has a matching remedial in that same lesson — the script refuses to write if it does not, so no
remedial mapping is invented.

**Task design.** Every lab asks for the SMALLEST WHOLE RADIUS that makes the arcs reach — the same
task cp-01-01's shipped `perpBisector` lab already uses, and verifiable rather than decorative:
each classical mode's `needs` predicate is `2r > span`, so the answer is forced by geometry, not
chosen. Confirmed computationally per lesson before authoring (span 6 → 4, span 8 → 5, span 10 → 6),
with every `start` checked NOT pre-solved. The `successFeedback` then does the teaching by naming
WHICH equidistance the crossings guarantee — the same fact the mode's status line carries and the
authored prose explains in words, now attached to something the learner did with their own hands.

`copyAngle` went to cp-01-01 rather than a construction lesson: that lesson is about what the
classical TOOLS guarantee and already carries a "copy a segment" reveal, so an angle copy is the
same promise one dimension up. It uses that lesson's `cp-tool-rules` tag rather than its
segment-specific `cp-copy-segment`.

**These four lessons were the ones this session had explicitly declined to count as conversions**,
on the grounds that a predict supplies commitment but not manipulation and the tier formula was
right to hold them at C. With real manipulation added they move C → A on their own merits, which
is the outcome that framing predicted. Course-wide Tier A 435 → **439**.

# Conversion Log — Block 4: Grade 6 Number System (opened)

Playbook §5 names this the highest-downstream-centrality block. First conversion:

| Lesson | Step | Change | Tier |
|---|---|---|---|
| ns-03-02 | i1 | `numeric` -> `numberLineHop` | **D (24) -> A (33)** |

Its authored content was already the right story - "Multiples of 3: 3, 6, 9, 12, 15... Multiples of
5: 5, 10, 15, 20..." - but told as two lists to read. The lab makes it the thing those lists are
evidence FOR: hop by 3 and stop where a 5-hopper would also land. Three `commonLandings` catch the
real misconceptions distinctly - 8 (adding the numbers), 12 (a 3-landing the 5-hopper skips), 10
(a 5-landing the 3-hopper skips). The step already owned an authored `predict`, which is exactly
the "prediction stapled to a static step" the tier formula demotes; that predict is preserved
verbatim and now has an observable outcome. Nine-point lift, the largest single-lesson gain of the
session, and Tier D 59 -> 58.

## Enhancement (i): `numberLinePlace.showDistanceFromZero`

Playbook section 5 asks for this at size XS to serve the absolute-value and ordering-by-magnitude
lessons. Shipped, with the lesson that uses it.

Absolute value is taught as "drop the sign" and then misapplied, and the reason is structural:
position and distance are never shown as two DIFFERENT numbers about the same marker. With the flag
on, the marker sits at -7 on the left while the readout underneath reads 7. Slide across to +7 and
the position flips sign while the distance does not move. That gap IS the definition, and it is now
something a learner watches rather than a rule they are given.

| Lesson | Step | Change | Tier |
|---|---|---|---|
| ns-05-01 | i1 | `numeric` -> `numberLinePlace` (+ flag) | B (27) -> **A** |

The step previously asked "What is |-7|?" as a `numeric` with a `predict` stapled on - the exact
anti-pattern the tier formula demotes, and one that lets a learner answer 7 by applying "drop the
sign" without ever meeting what absolute value means. The authored predict is preserved verbatim
and now resolves against something observable. `commonPlacements` catches +7 specifically and names
the misconception precisely: the right DISTANCE on the wrong side.

**Two integrity guards, because a readout that always agrees teaches the wrong thing.** The flag is
refused on a fraction line (that line runs 0..1 in jump units, so distance from zero is just the
position again) and on any line with `min >= 0` (position and distance could never differ, which
quietly implies they are the same quantity - the very confusion the flag exists to break). Both are
pinned by tests.

Accessibility: the distance is carried in the slider's `aria-valuetext`, not only in the visual
readout. A sighted-only distance would defeat the lesson for exactly the learners who most need the
non-visual statement of it.

Covered by `src/components/widgets.absDistance.s116.test.tsx` (5 tests): the readout tracks |v|,
stays non-negative across zero, never renders a minus sign anywhere on the line, reaches
`aria-valuetext`, is absent unless asked for, both integrity guards fire, and the SHIPPED lesson is
asserted to use a line that actually crosses zero with its predict intact.

## Engine work: `areaModel.requireFactors`, and the lesson it unblocked

An earlier batch declined `ns-03-03` because `areaModel` graded on `targetArea` alone: for
8 + 12 = 20 it accepted 1x20, 2x10 AND 4x5, and only 4x5 pulls out the GREATEST common factor.
Converting then would have marked the lesson's own wrong answer correct. That was recorded in
KNOWN_ISSUES with the natural fix named; this implements it.

**Schema.** `requireFactors: {w, h}` (optional) pins WHICH arrangement counts, plus a required
`factorFeedback`. Grading accepts either orientation, since a rotated rectangle is the same
factoring.

**Integrity refuses five ways to get it wrong**, each pinned by test: factors that do not multiply
to the target; a missing `factorFeedback` (without which a right-area/wrong-factor build falls
through to the area-direction feedback, a false statement about what the learner did);
`requireFactors` together with `square`, which already pins both sides; a transpose unreachable on
the sliders even though grading accepts it; and a start build that already has the target area.

**Ungated behaviour is unchanged**, pinned by its own test — every existing `areaModel` lesson
still accepts any factor pair. `src/lib/areaModel.requireFactors.s116.test.ts`, 9 tests.

| Lesson | Step | Change | Tier |
|---|---|---|---|
| ns-03-03 | i1 | `mcq` -> `areaModel` (requireFactors 4x5) + predict | **C (22) -> A (33)** |

The authored mcq's distractors now map onto engine states rather than a list of strings:
"4 x (2 + 3)" = 4x5 is the answer; "2 x (4 + 6)" = 2x10 has the right area but not the greatest
factor, caught by `factorFeedback`; "4 x (2 + 6)" = 32 is the wrong area, caught by
`highFeedback`. The distractor hardest to teach against as text — the one that IS a valid
factoring, just not the greatest — becomes the one the rectangle refutes most directly: the
learner builds it, watches the area land correctly, and is still told which condition it fails.

## Process fix: `gen-product-state.mjs` can no longer report stale tiers

`PRODUCT_STATE.md` took its tier counts by reading `FLAGSHIP_TIERS.md`, which is a WRITTEN ARTIFACT
rather than a live computation — so it reported whatever the last run left behind. That bit in this
session: working copies of the tier script run from /tmp wrote the report elsewhere, the repo copy
stayed stale, and PRODUCT_STATE silently under-reported Tier A by one lesson across several
regenerations before the drift was caught by comparing two supposedly identical numbers.

`gen-product-state.mjs` now regenerates the report before reading it (the tier script is a single
content walk, so the cost is trivial), with the call wrapped so a failure falls back to the old
read-whatever-exists behaviour rather than breaking the generator. Verified by deliberately
corrupting the report to "A 999" and confirming a regeneration restored the true count. This turns
a process note somebody has to remember into something structurally impossible.

## Block 4: ns-01-03 — the improper fraction as a built length

| Lesson | Step | Change | Tier |
|---|---|---|---|
| ns-01-03 | i1 | `mcq` -> `fractionBar` | **D (24) -> A (33)** |

"What is 2 1/3 written as an improper fraction?" is exactly what `fractionBar` builds: set the
denominator to thirds, then add thirds until the bar reaches two wholes and one more. The mixed
number stops being a notation converted by rule and becomes a length assembled until it matches.
The step already carried an authored predict, preserved byte-for-byte (the script asserts it
unchanged and aborts otherwise) - the same "prediction stapled to a static step" shape ns-03-02
had, where the commitment was written but had nothing observable to resolve against.

The evaluator grades by CROSS-MULTIPLICATION, so equivalents pass (7/3 and 14/6 both). That is
correct here - both ARE 2 1/3 - and numMax 12 keeps the reachable set small. The three traps were
each confirmed to fire distinctly before authoring: 3/7 (inverted), 2/3 (kept only the fractional
part), 6/3 (kept only the two wholes).

### Three lessons in this course have no engine, for schema reasons rather than judgement

Every candidate the playbook names for them is INTEGER-ONLY:

- **ns-02-01** (Multi-Digit Division, D 24). Section 5 names `columnCalc`. It supports
  add/subtract/multiply and NOT divide, and its multiply mode requires a single-digit multiplier
  (2-9). The lesson's step is 24 x 39 - two digits - so neither the division nor its verification
  multiplication is representable.
- **ns-02-02** (Adding and Subtracting Decimals, D 24) and **ns-02-03** (Multiplying and Dividing
  Decimals, D 24). Section 5 names `baseTenCompose`/`placeValue`. Both are integer engines:
  `placeValue` is hundreds/tens/ones typed `z.number().int()`, and `baseTenCompose` takes an
  integer `target` capped at 999. Neither can express 12.50, 8.6 + 0.75, or 0.6 x 0.7.

A tenths/hundredths tray - the decimal analogue of the existing flats/rods/units tray - is the
natural fix for the two decimal lessons, and a divide mode (or a two-digit multiplier) for
ns-02-01. Both are new engine work rather than authoring, so all three stay Tier D with the reason
recorded rather than being forced onto an engine that would misrepresent the arithmetic.

## Engine enhancement: `columnCalc.decimals` — and one more lesson unblocked

ns-02-02 sat at Tier D because every place-value engine in the registry is integer-only. The fix
adds only what decimals actually ARE, rather than building a parallel decimal engine: a shift in
what the columns are CALLED, and a mark showing where the shift happens.

| Lesson | Step | Change | Tier |
|---|---|---|---|
| ns-02-02 | i2 | `numeric` -> `columnCalc` (`decimals: 2`) | **D (24) -> A (32)** |

**The design, and why it is small.** 8.60 + 0.75 is authored as `a: 860, b: 75, decimals: 2`.
Every operand, every carry, every `commonResults` value and every reachability check stays an exact
INTEGER - no float appears anywhere in the widget, the evaluator or the integrity gate, so
determinism is untouched. `decimals` changes exactly two things: `ccPlaceAt(i, decimals)` renames
column 0 from "ones" to "hundredths", column 1 to "tenths" and column 2 back to "ones"; and a
narrow point cell is emitted after the ones column in every row so the point - and therefore the
places - stay aligned down the whole sum.

That is the lesson made mechanical rather than stated. "Line up the points" is not a separate rule
to memorise, it is what lining up the PLACES already means, and padding 8.6 to 8.60 shows up as the
empty hundredths column the learner has to fill.

**`.optional()`, not `.default(0)`** - the same trap as the Block 2 pilot. A `.default` makes the
field REQUIRED in the inferred type, and `tsc` immediately caught every variant generator that
builds a `columnCalc` without it. Pinned by a regression test asserting a pre-S116 spec still
parses with `decimals` undefined and clean integrity.

**Deliberately add/subtract only.** A product carries aDecimals + bDecimals places rather than
sharing the operands' - 0.6 x 0.7 = 0.42 has more places than either factor - so the answer row's
point would sit in a different column from the operand rows'. That needs two fields and a per-row
point position. The integrity gate REFUSES `decimals` with `op: multiply` rather than rendering
something subtly wrong, and that refusal is tested.

**The misconception was measured, not invented.** An earlier draft of the ns-02-02 spec used a
made-up wrong value and `widgetIntegrityErrors` correctly rejected it as unreachable. Querying
`columnCalcReachable` gave the real one: 835 (8.35), the forgotten carry - the tenths make
6 + 7 = 13, one whole and 3 tenths, and the whole has to move left.

7 tests in `src/lib/columnCalc.decimals.s116.test.ts`, plus a gallery sample so the decimal mode is
visible in `/dev/widgets`.

### Still blocked, with the reason narrowed

- **ns-02-03** (Multiplying/Dividing Decimals, D 24) - needs the multiply case above: `aDecimals`
  and `bDecimals` with a per-row point position. Its own i1 ("2.5 x 1.4, how many decimal places
  does the answer need?") is precisely about the rule that makes this hard, so a half-correct
  rendering would teach against the lesson.
- **ns-02-01** (Multi-Digit Division, D 24) - `columnCalc` has no divide mode at all, and its
  multiply mode takes only a single-digit multiplier, so the lesson's 24 x 39 verification is out
  of range in both directions. Long division needs quotient digits, partial products and a
  remainder row: a new engine shape rather than a field.

# Conversion Log — Block 5: Algebra 2 Polynomial & Rational (opened)

| Lesson | Step | Change | Tier |
|---|---|---|---|
| pf-01-02 | i2 | `mcq` -> `signChart` + predict | **C (25) -> A (31)** |

Playbook section 6 says of the pf-01-* lessons: "end behavior is the outermost intervals of the
chart they built." That is exactly this step. Its authored question is "as x grows huge and
positive, what happens to f(x) = -2x^5?", answered by an mcq whose right option is "plunges toward
-infinity". The sign chart makes the learner PRODUCE that answer instead of selecting it: build the
chart, and the far-right interval IS the end behaviour.

### A schema limit had to be raised first

`signChart` capped root multiplicity at 3. f(x) = -2x^5 is a single root of multiplicity 5 at the
origin, so the lesson could not be authored faithfully - multiplicity 3 would have put x^3 on
screen while the prose named x^5. Rather than accept that substitution, the cap was checked against
its consumers: `signChartSigns` flips on `mult % 2`, and the renderer picks its marker with
`r.mult % 2 === 0`. Nothing anywhere reads the magnitude, so the cap was purely an authoring bound.

Raised to 6 - the A2 curriculum's realistic range - with `signChart.multiplicity.s116.test.ts`
(4 tests) pinning the claim. The tests check parity against REAL ARITHMETIC rather than against the
implementation: -2x^5 and 3x^4 are evaluated at x = -1 and x = +1 and compared to the chart's
truth, and multiplicities 1/3/5 are asserted identical while 2/4/6 are asserted identical. A future
change that starts depending on the magnitude fails there rather than silently mis-authoring.

Verified before authoring: the chart's truth ["+", "-"] agrees with f(-1) = +2 and f(1) = -2.

**An honest limit of the representation, handled in the copy.** A sign chart shows SIGN, not
magnitude, so it answers "is the right end negative" rather than "does it dive without bound". The
`successFeedback` closes that gap explicitly - "since x^5 grows without bound, f(x) plunges toward
-infinity rather than settling anywhere" - instead of letting the widget imply more than it shows.

## Enhancement (k): poles and holes on signChart — the block's main build

| Lesson | Step | Change | Tier |
|---|---|---|---|
| rf-01-01 | i1 | `numeric` -> `signChart` with a pole + predict | **C (22) -> A (31)** |

**The mathematical claim, and why it needed an engine change.** A pole cuts the number line exactly
as a root does and flips the sign by the same parity rule - the sign of a quotient is decided by
the parity of every factor above AND below the bar. What differs is what happens AT the cut: a root
is a point ON the curve, a pole is a vertical asymptote the curve never reaches. So the sign can
change with NO crossing. A roots-only chart cannot pose that, because every cut it can draw is a
point the curve passes through - and that distinction is exactly what rf-01-01 (excluded values)
exists to teach.

Holes are a separate channel on purpose. A removable discontinuity does not cut the line and has no
effect on sign: the reduced function is continuous through it with one point punched out.
Conflating holes with poles is the misconception rf-01-02/01-03 are built to correct, so the schema
refuses to let one be authored as the other.

**What was built:**
- `poles?: Array<{x, mult}>` and `holes?: number[]` on `SignChartSpec`.
- `signChartCuts(roots, poles)` - the merged, sorted cuts, so the evaluator, the renderer and the
  integrity gate all count intervals from ONE definition instead of three. Placed in `schema.ts`
  and re-exported from `evaluate.ts`, matching the `quadName` precedent: the integrity gate needs
  it, and `schema.ts` cannot import from `evaluate.ts` without a cycle.
- `signChartSigns` takes an optional third argument and walks the merged cuts. Existing two-argument
  callers (including `describeState.ts`) are unchanged.
- Renderer: a pole draws as a dashed ink asymptote spanning the plot with NO marker on the axis -
  there is no point there - labelled "flips"/"no flip" by parity. A hole draws as a dashed hollow
  circle ON the axis, labelled "hole". The `aria-label` names poles and holes so the distinction
  survives without sight.
- A first integrity gate for `signChart` (there was none): refuses a value authored as both root
  and pole (that is a hole, not a pole), a hole colliding with either, duplicate poles, and a chart
  where every cut is even - which has no sign change and therefore nothing to build.

**Verification is against real arithmetic, not the implementation.** `signChart.poles.s116.test.ts`
(9 tests) evaluates the actual rational functions at sample points and compares: (x + 7)/(x - 4) at
-10, 0, 10 gives +, -, + and must equal the chart's truth; 1/(x - 2)^2 is positive on both sides of
its EVEN pole; (x + 2)(x - 1)^2 pins that roots-only specs are untouched by the addition. A
regression in the merge or parity logic fails there rather than quietly agreeing with itself.

**The solvability gate caught the enhancement's one real defect.** `content.widgets.audit` sized
its candidate sign-arrays as `roots.length + 1`, which ignores poles — so for rf-01-01 every
generated candidate was length 2 against a 3-interval chart, the evaluator rejected all of them on
length, and the widget read as UNSOLVABLE. Exactly the failure mode the gate exists for, and the
same shape as the `triangleSolve` ratios gap found earlier this session: an engine grew a new
dimension and the audit's model of it did not. Fixed by sizing from `signChartCuts` — the same
function the evaluator and renderer use — so the three cannot drift apart again.

Gallery sample added (130 samples, 0 bad on parse and integrity) so the mode is visible in
/dev/widgets and swept - that sweep is where three defects surfaced earlier this session.

**No hole is authored in rf-01-01.** (x + 7)/(x - 4) has no cancelling factor, and adding a
decorative one would teach the exact confusion the next two lessons exist to correct. The hole
channel is exercised by the gallery sample instead.

## Block 5 — enhancement (k) in use: root, pole and hole in one chart

| Lesson | Step | Change | Tier |
|---|---|---|---|
| rf-01-01 | i1 | `numeric` -> `signChart` (root + pole) | **C (22) -> A (31)** |
| rf-01-02 | i2 | `mcq` -> `signChart` (root + pole + hole) | **B (26) -> A (32)** |

`rf-01-02/i2` is the only step in the corpus that exercises all three of (k)'s features at once:
(x^2 + 5x + 6)/(x^2 - 4) factors to (x + 3)/(x - 2) with a hole left at x = -2. The playbook's line
for this lesson is "the hole survives the cancellation, visibly", and that is exactly what the
chart shows and prose cannot. The hole sits INSIDE the middle interval, splitting nothing and
flipping nothing; the pole at 2 splits the line and flips the sign with no crossing. In the algebra
those two look identical - both are values excluded from the domain - and on the chart they look
nothing alike. That distinction is the lesson.

Verified against the REAL function before authoring, not merely against the engine:
f(-10) = +0.583, f(-2.5) = -0.111, f(0) = -1.500, f(10) = +1.625. The two samples bracketing the
hole (-2.5 and 0) agree in sign, which is the computational statement of "a removable discontinuity
punches out one point and changes nothing else".

### A change of task, stated rather than glossed

The authored step asked the learner to simplify and choose from four options. A sign chart
pre-places the factored structure - it must, since roots and poles come from the spec - so the step
now asks for the SIGNS, with the factored form given in the prompt. That is a real trade: the
factoring PROCEDURE is no longer tested at this step. It remains tested at k1, k2 and ch1, which
carry live variant generators and were left untouched. What the step gains is the one thing the mcq
could not do at all - showing that the cancelled factor leaves a visible scar.

## Block 5, third batch — and a correction to what (k) actually unblocked

| Lesson | Step | Change | Tier |
|---|---|---|---|
| pf-01-03 | i2 | `numeric` -> `signChart` + predict | **C (22) -> A (31)** |

The step asks "for which x does x^2 first exceed 50x?" and takes 51 as a number. Read as an
inequality it is x^2 - 50x > 0, i.e. x(x - 50) > 0 - a sign chart. Building it puts the lesson's
actual claim on screen: 50x leads across the entire stretch from 0 to 50, then x^2 takes over and
never gives the lead back. "Eventually dominates" stops being a phrase and becomes a boundary you
can see, with 51 the first whole number past it. Verified against real arithmetic before authoring:
x^2 - 50x at -1, 25, 51 gives +, -, + matching the chart's truth, and g(49) = -49, g(50) = 0,
g(51) = +51 confirms 51.

The roots are pre-placed at 0 and 50, and that is correct rather than a leak: the lesson is about
WHY domination happens and where it starts, not about locating a root by trial. What the learner
supplies is the sign of each interval, which is where the reasoning lives.

### The three lessons (k) was expected to unblock: only one was ever a fit

The previous entry closed by naming `rf-01-03`, `rf-04-03` and `rf-05-01` as unblocked by poles and
holes. Reading their actual steps, that claim does not survive:

- **rf-01-03** (Opposite Factors, the -1 trick). Its step evaluates (3 - x)/(x - 3) at x = 10.
  That function is -1 EVERYWHERE except x = 3, where it is 0/0 - so it has no roots, no poles, and
  no sign change at all. A sign chart of it is a single interval with one possible answer, which
  the integrity gate correctly refuses ("every cut has even multiplicity - the sign never changes,
  so there is no sign chart to build"). The engine is right to refuse it; the lesson is about an
  algebraic identity, not about intervals.
- **rf-04-03** (Horizontal Asymptotes). Asks for the horizontal asymptote of (3x + 1)/(x^2 + 5).
  `signChart` has no y-axis and models no end VALUE, only end sign - the playbook's own suggestion
  here was "extend the outer intervals with a settle-line readout", which is a further enhancement
  that was not built. Separately, x^2 + 5 is never zero, so there is no pole to place, and the
  numerator's root is x = -1/3, which the integer-only `roots` field cannot express either way.
- **rf-05-01** (Clearing the LCD). The nearest step asks for a VERDICT on two candidate solutions
  (x = 4 is extraneous, x = 7 is valid). A chart with a pole at 4 shows why 4 fails, but the graded
  action would be choosing interval signs while the question asks which candidate survives -
  adjacent facts, not the same one. Left as authored; the extraneous-root story is Block 6's
  `extraneousRootLab`, which is the engine built for exactly this.

So (k) unblocked **two** lessons (rf-01-01, rf-01-02), not five. The enhancement is still the right
build - it is what made both of those possible, and holes now have a real lesson in rf-01-02 rather
than only a gallery sample - but the count in the playbook was optimistic about content it had not
read step by step.

## Block 5, second pass — the lessons (k) unblocked

| Lesson | Step | Change | Tier |
|---|---|---|---|
| pf-01-03 | i2 | `numeric` -> `signChart` + predict | C (22) -> **A (31)** |
| rf-01-03 | i2 | `mcq` -> `signChart` (rootless: pole + hole) + predict | C (25) -> **A (31)** |
| rf-05-01 | i2 | `mcq` -> `signChart` (root + pole) + predict | C (25) -> **A (31)** |

**A second schema floor had to move.** `roots` required `.min(1)`, but rf-01-03's function has no
zero at all: (4 - x)/(x^2 - 16) reduces to -1/(x + 4), a pole at -4 and a hole at 4. Requiring a
root made the entire class of rootless rational functions unauthorable. Relaxed to `.min(0)`, with
the integrity gate now demanding at least one CUT (root or pole) rather than at least one root - so
a polynomial spec, having no poles, still needs a root exactly as before and nothing previously
valid changed. Two tests pin it: the rootless chart is accepted and matches the real function, and
a chart with neither roots nor poles (or with only a hole) is refused as having nothing to divide
the line.

**rf-05-01 is the extraneous root made visible**, and it is the connection the playbook flags to
Block 6. Solving reduces to (x - 7)/(x - 4): x = 7 sits ON the axis (f(7) = 0 exactly, a genuine
solution) while x = 4 is the dashed asymptote where the function does not exist (f(4) is infinite).
The verdict the authored mcq asked learners to recall is now something they read off the chart -
a solution has to be a point on the curve, and only one candidate is.

Every chart was checked against the actual function before authoring, at sample points inside each
interval: pf-01-03's x^2 - 50x at -10/25/60, rf-01-03's original expression at -10/0 plus NaN at
the hole, rf-05-01's quotient at 0/5/10. All three agreed with the parity walk.

### A note on the tier count, and a bug it exposed again

The live tier computation moved 449 -> 452 across two conversions, which is one more than two
conversions can explain. The extra lesson is pf-01-03, converted in an earlier pass whose reported
449 came from `gen-product-state.mjs` reading the CHECKED-IN `FLAGSHIP_TIERS.md` rather than
computing tiers - the staleness already recorded in this log. The count was not wrong twice; it was
read from a stale file once. Confirms the standing rule: run `scripts/flagship-tier.mjs` from the
repo root BEFORE `gen-product-state.mjs`, or the reported tiers lag reality.

## Enhancement (j): probeX — the Factor Theorem as a collision

| Lesson | Step | Change | Tier |
|---|---|---|---|
| pf-02-03 | i1 | `numeric` -> `signChart` with `probeX` + predict | **C (22) -> A (31)** |

The authored step asks "for f(x) = x^3 - 7x + 6, what is f(1)?" and takes 0 as a number. Getting 0
by substitution is arithmetic; what the lesson is FOR is the consequence - that a zero of the
polynomial and a factor of it are the same fact seen twice. `probeX` puts that on screen: drag the
probe along the axis, watch P(x) move, and see the readout collapse to exactly 0 at x = -3, 1 and 2
and nowhere else.

**The probe is exploratory by design.** It is local widget state and never part of the graded
value - the learner still grades on the signs they claim. That keeps the evaluator, the value shape
and the solvability audit completely untouched, which is what makes this a small addition rather
than a second value channel. It is also why (j) needed no audit change while (k) did.

**An honest limit, stated in the schema.** A sign chart fixes the roots, their multiplicities and
the leading SIGN, which determines the polynomial only up to a positive constant. So the readout is
the MONIC product `sign * prod (x - r_i)^m_i`: exact for monic polynomials (as the Factor Theorem
exercises are), proportional otherwise. The ZERO is exact either way, and the zero is the whole
content of the theorem. `probeX` is refused alongside `poles` - a remainder is a polynomial-division
idea, and a rational function has no remainder at a pole.

Verified before authoring: the readout equals x^3 - 7x + 6 at every integer from -5 to +5, not
merely at the roots. `signChart.probe.s116.test.ts` (6 tests) pins that against the real polynomial.

### A display defect the verification caught

`signChartValueAt` returned **negative zero** at a root. IEEE gives -0 whenever an odd number of
factors is negative and one is exactly zero - probing (x + 3)(x - 1)(x - 2) at x = 1 is exactly that
case - so the readout would have rendered "P(1) = -0" at precisely the moment the Factor Theorem is
supposed to land. Normalised in the shared helper, with a test asserting `Object.is(v, -0)` is false
at every root. Worth recording because no type checker or schema gate would ever have caught it;
only evaluating the thing and reading the output did.

### A stale server, not a regression

Playwright failed 6 of 47 on the first run after this enhancement - including `/family` and a
Grade-2 addition lesson that have nothing to do with sign charts. The cause was `EADDRINUSE` in the
server log: a `next-server` process from an earlier turn had been holding port 3100 for 1h18m, so
`next start` never bound and Playwright tested an OLD build the whole time. This is the documented
trap in this repo - `pkill -f "next start"` does not match Next's actual process name, which is
`next-server`. Killed by PID, confirmed the port genuinely unreachable, restarted, and re-ran:
**47/47**. No code change; the lesson is to verify the port is free rather than only that something
answers on it.

## Block 5, third pass — enhancement (j) applied to the lessons it was named for

| Lesson | Step | Change | Tier |
|---|---|---|---|
| pf-03-03 | i1 | `numeric` -> `signChart` with `probeX` + predict | B (26) -> **A (32)** |
| pf-02-01 | i2 | `numeric` -> `signChart` with `probeX` + predict | C (25) -> **A (31)** |

The playbook pairs pf-02-03 and pf-03-03 under (j): "slide the probe onto a root and the remainder
hits zero - the Factor Theorem as a collision". pf-02-03 was converted when (j) was built; these
close it out, and pf-02-01/i2 turned out to be the same shape one lesson earlier.

pf-03-03/i1 asked "test the candidate x = 2: what is f(2)?" and took a number - the Remainder
Theorem stated as arithmetic. With the probe it becomes an observation: slide to 2, the readout
lands on 0, and the lesson's own factorisation is the reason. pf-02-01/i2 asks f(2) for
(x - 2)(x + 3)(x - 5), where the answer is zero precisely because (x - 2) is one of the factors.

Both are MONIC, which `probeX` requires and documents - a sign chart fixes the polynomial only up
to a positive constant, so the readout is the monic product. Checked rather than assumed:
(x - 2)(x - 3)(x + 1) expands to exactly x^3 - 4x^2 + x + 6; the probe readout equals the real
polynomial at six sample points per lesson; and both charts' signs agree with the functions
evaluated inside every interval.

**Not converted, with reasons.** pf-05-02 (Turning Points & Degree, C 22) needs the playbook's
other pf- idea - roots as DRAGGABLE inputs, so merging two roots turns a crossing into a bounce and
a turning point visibly disappears. `signChart` roots are authored, not dragged; live root
positions plus a derived turning-point count is a distinct enhancement, not a flag. pf-03-01 and
pf-03-02 (long and synthetic division) are legitimately procedural, exactly as the playbook says,
and their `buildExpression` formalization is the right engine for them.

# Beyond the playbook — the K-8 upgrade backlog

The 6-12 playbook is worked through; its two remaining named items (a two-digit multiplier for
ns-02-01, a settle-line readout for rf-04-03) are each a substantial engine change yielding ONE
lesson. `FLAGSHIP_TIERS.md` ranks a different and much larger pool: 110 K-8 Tier C/D lessons by
load-bearing concepts, focus domains and misconception burden. That is where the leverage is, and
K-8 is where concepts are load-bearing for everything above them.

**Eight of the top thirteen are fm-** (Multiplying & Dividing Fractions, G5), all carrying the same
gap signature: `prediction manip conseq adapt`. One course, one concept domain, one engine already
registered and in use there. Four converted in this batch, each building a DIFFERENT fraction so
the shape is not simply repeated:

| Lesson | Backlog rank | Change | Tier |
|---|--:|---|---|
| fm-01-03 | 7 | `mcq` -> `fractionBar` 1/2 + predict | C (23) -> **A (33)** |
| fm-03-03 | 9 | `mcq` -> `fractionBar` 4/7 + predict | C (23) -> **A (33)** |
| fm-04-01 | 10 | `mcq` -> `fractionBar` 3/4 + predict | C (20) -> **A (30)** |
| fm-05-02 | 13 | `numeric` -> `fractionBar` 1/6 + predict | C (23) -> **A (33)** |

Every target checked against real arithmetic before authoring: (1/2)/3 = 1/6, (2/3)(6/7) = 12/21 =
4/7, 5/6 - 1/3 = 3/6 = 1/2, and 6 x 3/4 = 4.5 < 6.

**fm-04-01 is the one worth singling out.** Its authored body already said "Predict the direction"
and its question was "without computing, is 6 x 3/4 bigger or smaller than 6?" - a genuine
prediction with nothing to check it against. The learner now builds 3/4 and SEES it fall short of
one whole, which is the entire reason the product drops below 6. The misconception "multiplying
makes things bigger" is not corrected by being told; it is corrected by the bar being shorter than
the whole.

**On accepting unreduced answers.** `fractionBar` grades by cross-multiplication, so equivalents
pass. That is right for three of these: a learner reaching 3/6 on fm-01-03 has done the subtraction
correctly and simply not reduced, and the success feedback names the reduction rather than the
widget rejecting a correct answer. The bar is the same length either way, which is precisely what
reducing means - a different name for one bar, not a different bar.

Course-wide Tier A 457 -> **461**. The K-8 figures moved further: Tier A 253 -> 257, **C-only
load-bearing concepts 114 -> 110**, backlog 110 -> 106. That last pair is the number that matters
here - four load-bearing K-8 concepts are no longer taught only at Tier C or below.

# Beyond the playbook: a D-tier sweep, and three engines that did NOT fit

With the playbook's six blocks all engined, the remaining weak content is the 55 Tier D lessons
product-wide. They cluster by course (`ep-` 7, `dop-` 6, `ft-` 5, `asv-` 4), which makes them worth
probing cluster-first: one engine fit can serve several lessons.

| Lesson | Step | Change | Tier |
|---|---|---|---|
| ft-01-02 | i1 | `numeric` -> `signChart` (radicand) | **D (24) -> A (31)** |

The same shape as re-03-02, already gated: the domain of sqrt(x - 3) is the sign chart of its
radicand. Verified against the radicand at 0 (= -3) and 5 (= 2), and at the root x - 3 = 0, so
sqrt(0) = 0 is defined - the boundary being INCLUDED is precisely the lesson's answer (the smallest
allowed x is 3 itself, not the first value past it). The authored predict, which already asked
"which inputs must be banned?", is preserved byte-for-byte and now has something to resolve against.

## Three candidates rejected, each for a reason in the engine rather than the lesson

**rf-04-03 (horizontal asymptotes) does not fit `signChart`.** The playbook proposes "extend the
outer intervals with a settle-line readout at the degree-ratio". Two independent problems. First,
the lesson's function is (3x + 1)/(x^2 + 5): its numerator root is at -1/3 and `roots.x` is
`z.number().int()`, so the chart cannot place it. Second and more fundamental, `SignChartW`'s
sketch is deliberately SCHEMATIC - it draws a hump above or below the axis per interval and tells
the learner "the sketch follows YOUR signs". There is no y-scale. Overlaying a quantitative
asymptote line on a qualitative sketch would assert a precision the widget does not have.

**rf-04-03 does not fit `graphZoom` either.** That engine magnifies around a finite `a` to classify
a limit as continuous / removable / jump / infinite. A horizontal asymptote is a limit at INFINITY,
which is a different question with a different picture; the schema has no channel for it.

**ft-04-02 (composition) does not fit `functionMachine`.** The engine models ONE machine,
y = a*x + b. The composite f(g(x)) = 2x + 3 is representable as a single machine with a = 2, b = 3,
and the learner would even get the right answer - but the lesson's predict asks "which function
runs FIRST?", so collapsing two stages into one erases exactly the concept being taught. A correct
answer produced by the wrong picture is worse here than no conversion.

**The `ep-` FOIL cluster needs a 2D tile engine that does not exist.** `algebraTiles` builds a
LINEAR expression (`targetX * x + targetConst`) with no x^2 channel, so (x + 2)(x + 3) cannot be
laid out; `areaModel` is numeric area only. The classic partitioned rectangle for binomial products
is a genuine gap, and a real build rather than a conversion.

# Block 6 — extraneousRootLab, and a NINTH registration surface

The engine is built and re-04-02 is authored on it: `√(x + 2) = x`, squared, with the phantom at
x = -1 and the true root at x = 2. Verified independently of the implementation before accepting
it: both candidates satisfy the SQUARED equation (x + 2 = x^2), only x = 2 satisfies the original,
and the phantom exists precisely because the right-hand side is -1 there while a principal root is
never negative. That is the lesson's whole claim, and it now arrives with its cause on screen.

## adapt: 0 -> 3, earned rather than adjusted

The capability vector recorded `adapt: 0` because `extraneousRootLab` was not instrumented for
process evidence, and every engine scoring 3 there is. That has now been built rather than
re-scored.

**The probe is aimed at whichever root the phase is ABOUT** — `identifyTrue` targets the true root,
the phantom phases target the phantom — so a move away from it is genuine evidence rather than
noise. `moveRelation` then classifies each probe move toward / away / past exactly as it does for
every other instrumented engine.

**The subtle part: the SQUARE button has to emit too.** `one-control-fixation` fires when four moves
sit on ONE control while the other was never touched. A silent square button would mean a learner
who correctly squared and then probed unproductively still produced an all-probe stream — and would
be told they never squared. The instrumentation would have manufactured the accusation. Squaring
therefore emits `{ control: "squared", dir: "toward" }` (it is always the productive move in this
lab), which keeps the stream honestly two-control.

`extraneousRootLab.process.s116.test.ts` (6 tests) pins that directly: probing without squaring
DOES reach fixation, and the squared-then-probing stream does NOT. It also pins that both controls
carry fixation copy and that the copy never names the answer — the cue's job is the contrast
("the second intersection can't appear until both sides are squared"), not the value.

re-04-02: **A 34 -> A 36.**

## adapt: 3, now earned rather than assigned

The capability vector originally recorded `adapt: 0` for `extraneousRootLab`, honestly, because
every engine scoring 3 appears in `processEvents.ts` and this one did not. That gap is now closed
properly rather than by editing the number:

- `MULTI_CONTROL` membership, so the one-control-fixation rule applies to it at all.
- The component emits `onEvent({ control, dir })` from BOTH controls. The comment in the source
  names the subtlety that forced it: the fixation rule fires when four moves sit on one control
  while the other was never touched, so a silent square button would have told a learner who
  correctly squared that they never touched it. Direction comes from `moveRelation` against a
  phase-aware target — `trueRoot` for `identifyTrue`, the phantom otherwise.
- Per-control fixation copy that names the mathematics rather than the interface. The probe cue is
  exactly the case this lab exists to catch: "You've been sliding the probe along the axis, but
  both sides haven't been squared yet — the second intersection can't appear until they are."
- Direction and oscillation cues pointing at the two readouts.

Pinned by `processEvents.extraneous.s116.test.ts` (6 tests), including that no cue reveals a root
or uses the words "extraneous"/"phantom" — the copy has to describe the moves, not the answer.

### A gate I wrote, then deliberately weakened

The first version of that suite asserted every `MULTI_CONTROL` engine has authored fixation copy.
It failed: twelve of seventeen fall back to the generic line. On inspection that is a deliberate
choice, not rot — the fallback is accurate and non-revealing, and the file's own comment calls the
table "tentative … with a generic fallback for engines instrumented later". Failing the build over
it would have been me retro-fitting a standard the codebase never adopted, which is a worse outcome
than the gap it claims to fix.

Rewritten to the rule that IS the contract: an engine which authored copy for one control must not
have forgotten its partner — a half-filled table gives one control a specific nudge and its partner
a generic one, which reads as a bug to a learner. The twelve are recorded in KNOWN_ISSUES as
fill-in-when-touched rather than as a failure.

## The defect: the registration contract is 9 surfaces, not 8

The standing note says the engine registration contract must be completed in one session and lists
eight files. It is actually **nine**. `scripts/engine-capabilities.json` carries the per-type
capability vector that `flagship-tier.mjs`, `gen-product-state.mjs` and
`build-mastery-infrastructure.mjs` all read, and it is NOT type-checked — a missing entry does not
break the build, it silently falls back to
`{ manip: 0, conseq: 0, err: 1, adapt: 0, a11y: 2, mobile: 2, polish: 1 }`.

The symptom was a conversion that made a lesson WORSE: re-04-02 went from B 28 (on `radicalCheck`,
capability `manip 0, conseq 1`) to B 27 on a full laboratory, because the fallback scores below
even the trivial engine it replaced. A tier going DOWN after a genuine upgrade is the tell; without
it the entry could have stayed missing indefinitely, quietly under-counting the lesson.

With the entry added: **B (27) -> A (34)**, the highest score in the block.

A sweep confirms this was the only gap — all 101 registered widget types now have a capability
entry, checked by enumerating the `WidgetSpec` union against the JSON rather than by eye.

## The capability vector, and why each number

Assigned from evidence in the component, and deliberately conservative where the evidence is thin:

| field | value | evidence |
|---|---|---|
| manip | 3 | three distinct controls, one of which (SQUARE BOTH SIDES) transforms the mathematics rather than moving a value |
| conseq | 3 | the phantom intersection appears, with the reflected region rendered as its visible cause |
| err | 3 | five misconception-specific paths (phantom picked, not squared, sign region, domain confusion, success) |
| **adapt** | **0** | NOT wired into `processEvents`. Every `adapt: 3` engine appears there and this one does not — recorded honestly rather than assumed from the widget's richness |
| a11y | 3 | `role="img"` with a state-dependent label, `aria-valuetext` reporting BOTH sides at the probe, `aria-live` readout, real `<button>` controls |
| mobile | 2 | two explicit 44px targets; not audited further, so not claimed as 3 |
| polish | 2 | GhostChip reveal and rendered reflect-region, but no transitions — which also means the base render IS the final state, so reduced motion needs nothing |

`adapt: 0` is the one worth flagging: wiring the engine into `processEvents` (a learner who probes
without ever squaring is exactly the `notSquaredFeedback` case) would earn a 3 legitimately. That
is real remaining work, not a scoring adjustment.

## Playbook review: what is left, and what it costs

A pass over all six blocks against actual disk state.

| Block | Status |
|---|---|
| 1 — G7 equations | closed (session 114) |
| 2 — G12 trig | closed (session 115) |
| 3 — G10 geometry | closed |
| 4 — G6 Number System | 6 conversions; 1 lesson blocked on engine work |
| 5 — A2 poly/rational | 9 conversions, both enhancements (j) and (k) built |
| 6 — extraneousRootLab | **engine not built** |

### re-03-02 converted without the Block 6 engine

| Lesson | Step | Change | Tier |
|---|---|---|---|
| re-03-02 | i1 | `mcq` -> `signChart` (radicand) + predict | B (26) -> **A (32)** |

A domain question about a square root IS a sign question about its radicand: sqrt(x + 6) is defined
exactly where x + 6 is non-negative. `signChart` already produces that region, so the learner builds
it rather than picking an inequality. Verified before authoring: the chart's ["-", "+"] matches the
radicand at -10 (= -4) and 0 (= 6), and at the root x + 6 = 0, so sqrt(0) = 0 is defined - the
boundary is INCLUDED. That is exactly what separates x >= -6 from x > -6 and what the mcq's
distractors turned on, so the success feedback names it: a sign chart marks the root but does not
by itself say which side owns it.

`re-03-02/i2` (cube-root domain, all reals) is deliberately NOT converted. An odd root excludes
nothing, so the chart would have no cut and the integrity gate refuses it - correctly. "There is no
restriction" is the ABSENCE of a sign chart, not one.

### Block 6 is a genuine build-then-author, and is not started

The playbook calls it "the only build-then-author" block, and that is accurate. `extraneousRootLab`
needs a 14-field schema, a truth function deriving both the true and the phantom root, an evaluator
with three phases and five distinct feedback paths, and a renderer with two curves, a draggable
probe and a fold animation with a reduced-motion equivalent.

The cost that matters is not the size but the SHAPE: the widget-type union is exhaustively switched
across `schema.ts`, `evaluate.ts`, `describeState.ts`, `pedagogy.ts`, `masteryMission.server.ts`,
`processEvents.ts`, `widgets.tsx` and `widgetSamples.ts`. Adding the literal to the union breaks
typecheck in every one of them until all are handled, so the registration contract is all-or-nothing
within a single working session - which is exactly why the standing note says so. Starting it
without room to finish leaves the tree red, which is worse than leaving it unstarted.

Recorded as the one substantial item outstanding, needing a dedicated session rather than a slice
of one. The 14 re-/rad- lessons it targets keep their authored form until then; `re-04-01` and
`re-04-02` already run `radicalCheck`, so the course is not without interaction in the meantime.

### The rad- course needs nothing from this effort

`radicals-and-exponents` (15 lessons) is symbolic simplification throughout - simplify sqrt(72),
combine 2sqrt(3) + 5sqrt(3), evaluate 8^(2/3). There is no relationship to manipulate; these are
`buildExpression` and `numeric` formalization by design, and the playbook does not list them.

### Block 5 scope note

The block is 30 lessons across pf- and rf-, currently 4 A / 4 B / 22 C. The playbook's two named
enhancements remain unbuilt: **(j)** `probeX` on `signChart` (a draggable probe with a remainder
readout, turning the Factor Theorem into a collision) and **(k)** `poles` + `holes` (the block's
main build, unblocking rf-01-01/01-02/01-03, rf-04-03 and rf-05-01). (k) is tractable - `SignChartW`
is 82 lines and the evaluator is a clean signs-per-interval array - but it needs a merged
roots-and-poles truth function, an integrity gate for collisions, asymptote/removable-point
rendering, and its own suite. Scoped, not started.

## Block 4, fourth batch — decimal multiplication, solved by changing representation

| Lesson | Step | Change | Tier |
|---|---|---|---|
| ns-02-03 | i2 | `numeric` -> `probabilityArea` | **D (24) -> A (31)** |

This one is worth recording as a method note rather than just a row. `ns-02-03` had been logged as
blocked on a `columnCalc` enhancement: a product carries aDecimals + bDecimals places, so its point
sits in a different column from the operands', which the renderer's single shared point-column
cannot express. Reading the renderer confirmed that diagnosis exactly - `ccPt` emits the point as a
fixed separator cell after column index `decimals` in EVERY row, and that shared alignment is
deliberately the content of the add/subtract lesson.

But it was a correct diagnosis of the ENGINE and a wrong diagnosis of the LESSON. The authored step
is "Compute 0.6 x 0.7", and its sibling i1 asks what the lesson actually turns on: how many decimal
places does the answer need? Column arithmetic can produce 0.42 but cannot show WHY it has two.
The area model can: on a unit square cut into hundredths, a block 6 tenths wide and 7 tenths tall
covers 42 small squares, and each small square IS a tenth of a tenth. `probabilityArea` already
does this and needed no engine work at all.

Verified before authoring: 42 grades correct, the empty start is not pre-solved, and 13 - the
"add the tenths, 6 + 7" error - falls to the low path rather than passing silently.

The general point: an engine gap is not always a lesson gap. Two of this session's blockers were
genuinely engine work and were built (`areaModel.requireFactors`, `columnCalc.decimals`); this one
dissolved once the question was asked as "what representation teaches this?" rather than "how do I
make columnCalc do it?".

### ns-02-01: the original diagnosis was wrong, and the corrected one is narrower

The entry said "columnCalc has no divide mode". Its step is "verify 936 / 24 = 39 by computing
24 x 39" - so it needs a TWO-DIGIT MULTIPLIER, not division. `columnCalc` caps the multiplier at a
single digit 2-9 because `columnCalcReachable` enumerates exactly one partial-product pass
(`(A[i] ?? 0) * b`). Two digits means two partial-product rows plus a final addition: three
interacting move-sequences instead of one, a different grid geometry, and a reachability
enumeration that is a different algorithm rather than a wider loop. Left unbuilt this session, with
the constraint recorded so the next attempt starts from the real one.

## Block 4, third batch — and a hard engine gap that stops the block

**Four predicts added to existing manipulatives** (`ns-05-02/i2` absValueLine, `ns-04-02/i2` and
`ns-05-03/i2` dragOrder, `ns-01-01/i2` matchPairs). No widget block modified; each asserted
byte-identical. Each predict names the misconception the step exists to break - "greater" and
"farther from zero" are different questions and for negatives they disagree; ordering negatives by
magnitude reverses them; mixed decimal/fraction forms tempt ordering by how the symbols look;
dividing by something less than 1 makes the answer BIGGER, contradicting the whole-number rule.

**These four did NOT change tier, and the reason is the useful part.** `FLAGSHIP_TIERS.md` lists
their missing dimensions as `manip conseq adapt` - not `prediction`. A predict cannot lift a lesson
whose gap is manipulation. This is direct evidence the tier formula is measuring what it claims to:
the cp- lessons earlier this session moved C to A only once real manipulation was added, and these
stay put because it was not. The predicts remain worth having on their own pedagogical merits, but
they were not the lever here.

### The gap: every engine Section 5 names for the G6 decimal and division lessons is integer-only

Measured directly against the schemas rather than inferred from the playbook's descriptions:

| Engine | Constraint | Consequence |
|---|---|---|
| `columnCalc` | `a`,`b` integers; multiply takes a SINGLE-DIGIT multiplier (2-9) | cannot express 24 x 39 for ns-02-01, and has no divide op for its remainder step |
| `placeValue` | `target` integer; hundreds/tens/ones only | no decimal places, so 12.5 -> 12.50 is not expressible |
| `baseTenCompose` | `target` integer 1-999 | same |
| `numberLineHop` | integer `hop`/`min`/`max` | no fractional hops (established in batch 1) |

That closes off `ns-02-01` (D 24), `ns-02-02` (D 24), `ns-02-03` (D 24) and `ns-01-03`'s second
step together - four of the five lowest-scoring lessons in the course. They are not fit failures
that better authoring could solve; the representations they need do not exist yet. `ns-01-03/i1`
already runs `fractionBar` with a predict, and `fractionBar` builds ONE fraction rather than
counting how many of a piece fit inside an amount, so it does not answer "how many 3/4-foot shelves
fit in 6 feet" either.

**What would unlock them:** a decimal-capable place-value or column engine - either a `decimals`
flag on `columnCalc`/`placeValue` that admits a decimal point and aligns on it, or a new
`decimalGrid`. That is engine work with a schema, component, evaluator, tests and gallery sample,
in the same shape as this session's five geometry enhancements, and it is the single highest-value
next build for Block 4: it converts three Tier D lessons in the playbook's highest-centrality block.

## Block 4, second batch

| Lesson | Step | Change | Tier |
|---|---|---|---|
| ns-04-03 | i1 | `mcq` -> `plotPoint` + predict | **C (23) -> A (31)** |

Section 5 names `plotPoint` for this lesson and it fits, though not the way the one-line
description implies. `plotPoint` is a LABELLED GRID with 1-based cells, not a signed coordinate
plane - `targets` must be positive integers. What makes it faithful is `xLabels`/`yLabels`: a 7x7
grid labelled -3 to 3 on both axes, so cell (7, 2) is genuinely the point (3, -2), axes included
at 0. The label lookup was confirmed against the parsed spec before authoring.

The authored step asks learners to NAME the quadrant of (3, -2); the lab asks them to PLACE it and
read the quadrant off where it lands - the same fact, arrived at causally. The three `pointErrors`
are the three wrong quadrants, each diagnosing the specific sign error that lands there, which an
mcq distractor cannot do: an mcq can say "Quadrant I is wrong", the grid can say "you put y ABOVE
the axis, but -2 sits below it".

**Two more section-5 prescriptions declined rather than forced.**

`ns-03-03` (Factoring with the Distributive Property, Tier C 22) - the playbook proposes
`areaModel`, "factoring as un-tiling a rectangle". The engine grades on `targetArea` alone, so for
8 + 12 = 20 it accepts 1x20, 2x10 AND 4x5 as correct. The lesson's entire point is pulling out the
GREATEST common factor - the one arrangement the engine cannot demand. This is the same class of
gap the schema's own `square` flag was added to close for a different lesson ("ungated, areaModel
accepts 4x9 and the learner never finds the side the lesson asks for"). A `requireFactors`-style
gate would fix it; without one, converting would mark a non-GCF factoring correct and teach
against the lesson.

`ns-01-02` (Flip and Multiply, Tier C 22) - its free steps are "what is the reciprocal of 3/8" and
a fraction computation. The proposal is a two-track hop where the divide-by-(a/b) and
multiply-by-(b/a) tracks land identically, but `numberLineHop` is integer-only, so neither track is
representable. `fractionBar` remains the honest candidate, left for a measured pass.

**A constraint the playbook did not account for.** Section 5 also proposes `numberLineHop` for
`ns-01-01` with `hop: 1/3`. The schema requires INTEGER `min`, `max`, `start` and `hop` - a
fractional hop is not representable. `ns-01-01` is 2 divided by 1/5, and the only way to force it
onto this engine is to relabel the line in fifths, showing a 0-10 integer line for a question posed
on 0-2. That misrepresents the mathematics rather than revealing it, so it was NOT converted;
`fractionBar` is the honest candidate and is left for a measured pass rather than assumed to fit.

`ns-03-01` (GCF) is deferred for a related reason: the greatest common factor is a property of two
hop SIZES, not of one landing, and this engine grades a single landing - it would have to mark
"12" correct when the answer is the hop size 4. A dual-track hopper (the playbook's own suggestion)
would fit; the single-track engine does not.

## Correction: `gen-product-state.mjs` is not broken

An earlier note in this session's close-out reported the product-state generator as "hung with zero
CPU time." **That diagnosis was wrong**, and the mistake is worth recording because it is easy to
repeat: the script runs the ENTIRE vitest suite as a subprocess (`vitest run --reporter=json`,
600 s timeout) to report a true test count rather than a static `it(` scan. The parent node process
therefore sits at ~0% CPU for the whole run *because* it is blocked on a child doing the work —
profiling the parent alone makes a perfectly healthy script look dead. Checking the process TREE
(`ps -eo pid,pcpu,cmd`) shows the vitest worker at 40–80% CPU throughout.

Re-run to completion: **EXIT 0 in ~9 minutes**. `PRODUCT_STATE.md` regenerated for the first time
since S113. Nothing to fix; the only change is knowing to give it ten minutes and to profile the
tree, not the parent.

## Housekeeping: one abandoned script removed

An earlier draft, `scripts/convert/block3-tcrt.mjs`, targeted `tc-02-01`, `tc-03-01/02/03` and
`rt-02-01` before measurement showed all five were **already authored on disk** from a previous
pass — it was superseded by the narrower `block3-tc-rt.mjs` and never run. It has been deleted
rather than shipped: it was uncited by any doc, and it still contained a `tc-02-01` conversion that
this session deliberately REVERTED (broken variant contract, above). Leaving it in the tree would
have let a future run silently re-apply a conversion the gates had already rejected.

## Full verification chain, run against the final Block 3 tree

Run twice: once after the sg-/cx-/tc- work, and again in full after the second authoring pass
(sy-, cp-, pq-). Both passes identical and green:

typecheck, full vitest (8,442/8,442), `validate:content` (1,223/1,223), `lint:pedagogy`
(1,139/1,139), `check-registration`, `next lint`, `next build` — all EXIT 0. `validate:native`
passes on a clean tar extraction (1,330 JSON files, 657 source files, 912 local imports).

The second pass caught one regression of my own making — `pq-04-03`'s `sideFeedback` opening with
"No…" tripped the pedagogy `GENERIC` guard (1138/1139) — fixed in both lesson and script and
re-verified at 1139/1139. The solvability gate passed on every new spec, which is the check that
matters most here: it is what rejected the force-fits earlier in the session.

**Playwright: 47/47, no code change required — a container-specific run-mode issue, diagnosed and
resolved.** The first two attempts failed 17 of 47 (and 17 of 47 again with a different subset
failing each time — never the same set twice, itself a strong flakiness signal). Every failure's
actual error was identical: `Test timeout of 30000ms exceeded` inside `page.goto(route, {waitUntil:
"networkidle"})` — axe never ran; the navigation itself never settled. The log's own
`[WebServer] Server is approaching the used memory threshold, restarting...` warnings are
Playwright's built-in monitor for a webServer it spawned itself, which only fires for `npm run dev`
— meaning both attempts were exercising Playwright's own on-demand dev server (with per-route
webpack compilation and HMR overhead) rather than a production build, despite an explicit `next
start` being launched in parallel. That `next start` had in fact failed silently: `.next` had been
overwritten with incompatible dev-mode artifacts by the FIRST failed attempt (dev mode writes into
the same `.next` directory a production build depends on, and the two are not interchangeable), so
the second attempt's `next start` exited immediately with "Could not find a production build,"
leaving Playwright's `reuseExistingServer` check with nothing to reuse and falling back to
spawning dev mode again. This sandbox is a 3.9 GB Firecracker microVM; on-demand route compilation
for an 84-course, 85-widget-type app is genuinely too heavy for that budget under `next dev`, which
is a real, reproducible constraint of this environment rather than a defect in the app.

Fixed by removing `.next` outright, running a clean `npm run build`, starting `next start`, and —
critically — **confirming with an actual `curl` that it returned 200** before invoking Playwright
at all, rather than assuming a launch script's server had come up. With a verified-live production
server for `reuseExistingServer` to find, the identical 47-test suite ran in **1.9 minutes at
2–4 seconds per test** (down from 14.3 minutes with 17 failures) and passed outright. No test
assertion was touched; the fix was ensuring the gate actually exercises what it was designed to
exercise.


---

# Session 117 — the mandate queue, cleared

Executed under an explicit content mandate covering every item queued in S116's residue. Nine
lessons touched across six courses, in three waves. **Tier A 462 → 470; Tier C 355 → 346.**

## Content-change ledger

**No authored prose was edited, and no authored widget was discarded.** Every lesson ID, step ID,
step order, hint, `conceptTag`, `explanationVariants`, remedial mapping, XP rule and curriculum
alignment is untouched. The mandate authorised *additions*, and additions are what was made:

| Lesson | Change | Old → new | Tier |
|---|---|---|---|
| re-04-01 | `i1` widget replaced, predict added | `radicalCheck` → `extraneousRootLab` (identifyTrue) | **A 35** |
| cx-03-02 | `i1` widget replaced, predict added | `mcq` → `quadDrag` (rhombus) | C → **A 33** |
| rf-02-01 | `i1` widget replaced, predict added | `mcq` → `signChart` (root·pole·hole) | C → **A 31** |
| tg-02-03 | `i1` → lab; authored numeric **moved verbatim** to new `i1b` | `numeric` → `unitCircleExplore` ghost(sum·180) | C → **A 31** |
| cp-01-02 | new `i1b` lab step | +`compassConstruct` perpBisector, span 6 | C → **A 31** |
| cp-03-02 | new `i1b` lab step | +`compassConstruct` perpBisector, span 4 | C → **A 32** |
| cp-03-03 | new `i1b` lab step | +`compassConstruct` perpBisector, span 10 | C → **B 29** |
| sg-04-01 | new `i1b` lab step | +`solidSliceLab` sphere vs constant prism | C → **A 34** |
| rf-02-02 | new `i1b` lab step | +`signChart` root·pole | C → **A 31** |

New authored content: four `i1b` bodies (one line each), nine predicts, and the feedback strings on
each new spec. All pass `validate:content` and `lint:pedagogy` like any other authored text.

Every script validates **all** specs and asserts existing-step byte-equality *before* writing *any*
file, so a bad spec cannot reach disk part-way through a batch. The insertion scripts re-serialise
`doc.steps` minus the new step and compare it to the pre-insertion serialisation — an existing step
cannot be perturbed by a splice without aborting the run.

## tg-02-03: how the S115 residue was actually closed

S115 built a ghost lab for this lesson and **withdrew it**, for one reason: `i1` was the lesson's
only notation-entry step, so converting it dropped `formal` from 2 to 1 and failed §9.2's
mechanical check. The mandate's fix is a content addition, executed the preserving way — the
authored `numeric` widget is **moved byte-identically** onto a new `i1b` immediately after the lab.
The script hashes the widget before the move and re-asserts equality after the splice. Result:
every authored word survives (prompt, answer, both misconception feedbacks, fallback), and notation
entry now *follows* manipulation, which is the ordering the tier formula rewards — `formal` 2 → 3.
The lesson gains what it lacked without losing what it had.

**The ghost kind was re-derived, not inherited, and S115's choice was wrong for this lesson.**
S115's table assigned `ghost: negate`. But tg-02-03 teaches the HALF-PERIOD slide —
sin(x + π) = −sin x *and* cos(x + π) = −cos x — where **both** coordinates flip, because the point
at θ + 180° is the antipode. `negate` is the reflection θ → −θ, where only sine flips: a different
identity from the one the prose states. Authored instead as `ghost: "sum"` with `ghostAngle: 180`,
checked against `ucGhostPoint`'s own arithmetic: exact = [c·cos180 − s·sin180, s·cos180 + c·sin180]
= [−c, −s], the antipode, coinciding at every θ. The `linearity` impostor [c − 1, s] can never
coincide (−c = c − 1 forces c = ½ while −s = s forces s = 0 — inconsistent on the circle), so the
contrast case is guaranteed reachable rather than hoped for. `targetAngle` is 90° on purpose: the
direct point lands at 270° = 3π/2, the exact value the moved numeric step then asks the learner to
write down. The lab and the formalization are now the same fact, twice.

## cx-03-02: the S116 revert, re-posed rather than forced

S116 tried `quadDrag` here targeting **a square**, and the solvability gate correctly rejected it:
the three fixed vertices (0,0), (5,0), (8,4) have equal sides but the angle at Q is not 90°, so no
fourth point completes a square. The KNOWN_ISSUES entry proposed re-posing the lesson on different
vertices — which would edit authored numbers.

That edit turned out to be unnecessary. The reachable claim is **a rhombus**, at (3, 4), and the
lesson's own question is *"one more check decides square vs rhombus — which, and what's the
verdict?"* So the lab now asks the learner to make all four sides equal and then **read what the
shape calls itself** — and the live classifier says *rhombus*, not *square*. The refusal is the
answer. The success feedback runs the deciding check as a number: diagonals √80 and √20 (verified:
d((0,0),(8,4))² = 80, d((5,0),(3,4))² = 4 + 16 = 20), unequal, so the corners are not right angles.
The authored vertices are untouched and the mandate to edit them was not needed.

## rf-02-01: root, pole and hole in one chart, on the operation that creates them

(x + 5)/x · x/(x + 1) reduces to (x + 5)/(x + 1) **with a hole at 0**: the cancelled factor bans an
input the reduced formula no longer mentions. That is the whole content of restriction tracking,
and enhancement (k) renders exactly it — a root at −5, a pole at −1 the curve never reaches, and a
punched-out point at 0 that changes no sign (the reduced value there is 5). Signs verified against
the real function, not the implementation: x = −6 → (−1)/(−5) > 0; x = −2 → 3/(−1) < 0;
x = 1 → 6/2 > 0, giving ["+","−","+"].

rf-02-02 is the same idea one operation later, and sharper: dividing by (x − 1)/10 bans x = 1,
and **nothing in the original numerator forbids it**. The restriction is created by the operation
and recorded in the answer as a wall. Signs verified: x = −3 → 2(−1)/(−4) > 0; x = 0 → 2(2)/(−1)
< 0; x = 2 → 2(4)/1 > 0.

## sg-04-01: the playbook asked for a composite; the engine has four primitives

§3.1 asks for "one lab step slicing the composite". `solidSliceLab.solid` is an enum of four
primitives — there is no composite, and adding one is engine work, not authoring. But the lesson's
`i1` asks something narrower that **is** representable: why must the hemisphere and cylinder share
a radius for clean addition? Slice the **sphere** against the constant-area prism and the answer
arrives as a measurement — a sphere's sections shrink away from the equator and equal πr² at
exactly one height. That height *is* the join, and it is the only circle a cylinder of that radius
can meet. Verified: at radius 5 the equatorial section is π·25 = 78.5398163397, and
`targetFraction: 0.5` is the equator of a solid of height 2r = 10.

## Measured and declined — five candidates, each for a reason in the engine

Recorded so the next pass starts from the real constraint rather than re-deriving it:

- **sg-04-02 / sg-04-03** — a tube's cross-section is an **annulus** (πR² − πr², precisely the
  quantity the lesson contrasts with the wrong π(R − r)²). No solid in the enum has a ring section,
  so the lab could not show the shape the lesson is about.
- **sg-05-02 / sg-05-03** — density and cost-per-unit are ratios over a whole solid, not facts
  about a cross-section. A sweep would display a quantity the lesson never asks about.
- **rf-03-01 / rf-03-02 / rf-03-03** — the sums reduce to numerators with non-integer roots
  (−7/2, −3/5) and `signChart.roots.x` is integer-typed, so the chart cannot place the zero it
  needs. Same constraint that blocked rf-04-03 in S116, hit from a different direction.
- **rf-02-03** — its exclusion at x = 3 is a sign-**changing zero of the reduced function**: not a
  pole (the curve reaches it) and not a hole (a hole changes no sign). Authoring it as either ships
  a chart that is false about the function.
- **cp-04-01 / cp-04-02 / cp-04-03 / cp-05-01 / cp-05-03** — conjecture-vs-proof sorting,
  two-column matching, proof ordering, transversal classification and converse identification.
  These are judgment tasks, the legitimate-KEEP class already documented for this course in
  MCQ_INVENTORY. cp-04-03's vertical-angle numeric was considered for an `angleMeasure` lab; the
  engine drags ONE opening against a target, which cannot express "two vertical readouts locked
  equal through a drag". That needs a two-ray mode — a real enhancement, ledgered, not forced.

## cp-03-03 stays at B, and the reason is structural

It reaches manip 3 / prediction 3 / contrast 3 / misconception 3 and still totals 29, because
`formal` is 1: the lesson has **no notation-entry step anywhere** — its widgets are mcq, dragOrder
and dragBucket throughout. That is what "Why Constructions Work" is: a reasoning lesson. Bolting a
numeric onto it to buy two points would be gaming the metric, which is the failure mode §11 warns
about. It clears the §9.1 bar at B and is left there deliberately.

## The ninth registration surface: gate confirmed live, entry was stale

S116 recorded the capability table as an untested ninth surface and proposed "a test asserting
every member of the `WidgetSpec` union has a capability entry". Measured this session: that gate
**already exists and is total**, as a three-link chain — `widgets.registry.test.ts` pins
`WidgetSpec.options` ↔ `REGISTERED_WIDGETS`, `stageWidth.test.ts` pins `REGISTERED_WIDGETS` ↔
`STAGE_TIER`, and `engineCapabilities.test.ts` pins `STAGE_TIER` ↔ the capability table, in both
directions with no phantom rows. A new engine cannot ship without rating itself, and the silent
`{manip:0, conseq:0, …}` fallback that made re-04-02 score *worse* on conversion cannot recur.
Re-verified this session: 14/14 across the three files. The KNOWN_ISSUES entry is marked RESOLVED
rather than a new redundant test being written.

---

# Session 117 — the mandate batch: nine lessons, no engine work needed

An explicit content mandate cleared the queue that four previous sessions had been unable to
touch: additions of authored steps, which the frozen-content rule reserves for a stated decision.
Every item below was blocked on that permission and nothing else — no engine was missing, and the
session wrote **no new engine code at all**. That is the finding worth leading with: after S114–116
built eleven enhancements and one new engine, the binding constraint on this course-set had moved
from capability to permission.

## Content-change ledger

Four categories, all ledgered. **No authored word was edited, reordered, or deleted anywhere.**

| Category | Lessons | What changed |
|---|---|---|
| Widget replaced on an existing step + predict added | re-04-01, cx-03-02, rf-02-01 | the `widget` block of ONE step; `body` re-asserted byte-identical |
| Widget replaced + authored widget MOVED to a new step | tg-02-03 | see below — the authored numeric survives verbatim |
| New lab step inserted (`i1b`), nothing existing touched | cp-01-02, cp-03-02, cp-03-03, sg-04-01, rf-02-02 | one added step each, carrying the lesson's own conceptTag |
| — | — | no `body`, hint, ID, order, conceptTag, remedial mapping, XP rule or curriculum alignment was modified |

New authored content, in full: nine `predict` blocks, nine widget feedback sets, five `i1b` body
lines (one sentence each), and one `i1b` body line for tg-02-03. All passed `validate:content` and
`lint:pedagogy` as authored text.

Each script validates **every** spec (parse + `widgetIntegrityErrors`) before writing **any** file,
then re-asserts that the pre-existing steps serialise byte-identically — an insertion that
perturbed a neighbour aborts before touching disk.

## Results

| Lesson | Step | Change | Tier |
|---|---|---|---|
| re-04-01 | i1 | `radicalCheck` → `extraneousRootLab` (`identifyTrue`) + predict | C → **A (35)** |
| tg-02-03 | i1 | `numeric` → `unitCircleExplore` ghost sum·180 + predict; numeric moved to new i1b | C → **A (31)** |
| cx-03-02 | i1 | `mcq` → `quadDrag` (rhombus) + predict | C → **A (33)** |
| rf-02-01 | i1 | `mcq` → `signChart` root/pole/hole + predict | C → **A (31)** |
| cp-01-02 | +i1b | `compassConstruct` perpBisector span 6 + predict | C → **A (31)** |
| cp-03-02 | +i1b | `compassConstruct` perpBisector span 4 + predict | C → **A (32)** |
| cp-03-03 | +i1b | `compassConstruct` perpBisector span 10 + predict | C → **B (29)** |
| sg-04-01 | +i1b | `solidSliceLab` sphere vs prism + predict | C → **A (34)** |
| rf-02-02 | +i1b | `signChart` root/pole + predict | C → **A (31)** |

Product-wide Tier A **462 → 470**; Tier C 355 → 346. Every converted lesson clears §9.1's
"≥ B" bar; eight of nine are A.

**cp-03-03 is honestly a B, and the reason is structural.** Its formalization score is 1 because
the lesson contains no notation-entry step *anywhere* — its widgets are mcq, dragOrder and
dragBucket throughout. That is correct for a lesson whose subject is what counts as a proof;
raising it would mean inventing an arithmetic step the lesson has no use for. The lab still moved
it from "read about the compass's guarantee" to "make the compass give it", which was the point.

## tg-02-03: closing S115's residue without editing a word

S115 built a ghost lab for this lesson and **withdrew it**, because `i1` was the lesson's only
notation-entry step and converting it dropped formalization from 2 to 1 — failing §9.2's mechanical
check. The withdrawal was right. The fix needed a mandate because it is an addition.

The preserving form: the authored `numeric` widget — prompt, answer, both misconception feedbacks,
fallback — **moves byte-identically** onto a new step `i1b` placed directly after the lab. The
script asserts that equality twice, before and after the splice. Nothing is rewritten; the notation
entry simply now *follows* the manipulation, which is the ordering the tier formula rewards
(`formal = 3`, up from 2 before the conversion was ever attempted) and the ordering §1 asks for.
Result: **A 31, formal 3** — the exact gate that forced the withdrawal.

**The ghost kind was re-derived, not inherited, and S115's choice was wrong for this lesson.** The
log recorded `ghost: negate` for tg-02-03. But the lesson teaches the HALF-PERIOD slide —
sin(x + π) = −sin x *and* cos(x + π) = −cos x, both coordinates flipping, because x + 180° is the
antipode. `negate` models θ → −θ, where cosine is *unchanged*. Converting on `negate` would have
put a different identity on screen from the one the prose states. The correct configuration is
`ghost: "sum"` with `ghostAngle: 180`, whose exact formula evaluates to (−cos θ, −sin θ) — verified
by sweep in the test suite, along with the fact that `negate` leaves the cosine alone.
`targetAngle: 90` is chosen so the tracked point lands on 270° = 3π/2 — the very value the moved
numeric step then asks the learner to write.

## Two playbook prescriptions replaced by better-fitting ones

**cx-03-02 (S116 residue: "its three fixed vertices cannot form a square").** That measurement was
right and the conclusion drawn from it was too strong. The lesson asks whether a given rhombus is
*also* a square — and the reachable claim is the rhombus itself, at (3, 4), all four sides exactly
5. The live classifier then does the teaching by **refusing to say "square"**: the learner builds
equal sides and reads back "a rhombus". The deciding check is in the success copy as a measurement,
not an assertion — diagonals √80 and √20, so the corners are not right angles. A lesson about what
equal sides *fail* to prove is better served by an engine that declines to promote them than by one
that never draws them. The `mcq` this replaces asked the learner to *select* that verdict.

**sg-04-01 (playbook: "one lab step slicing the composite").** `solidSliceLab.solid` is an enum of
four primitives; there is no composite, and adding one is engine work. But the lesson's own `i1`
asks something narrower and fully representable: *why must the hemisphere and cylinder share a
radius?* Sweeping a sphere against a constant-area prism answers it as a measurement — the sphere's
section reaches πr² at exactly one height, its equator, and that is the only circle a cylinder of
that radius can be joined to. Verified against the renderer's own formula, re-derived independently
in the test: at f = 0.5, y = 0 and the section is π·25 = the prism's 78.54, and strictly smaller at
every other point on the 0.1 slider lattice. `tolerance: 0.01` admits no neighbour.

## Five prescriptions measured and DECLINED

Each for a reason in the engine or the mathematics, not in the effort:

- **sg-04-02 / sg-04-03** — the tube's cross-section is an **annulus** (πR² − πr², the very quantity
  sg-04-02 contrasts with the wrong π(R−r)²). No solid in the enum has a ring section, so the lab
  could not draw the shape whose area the lesson is about.
- **sg-05-02 / sg-05-03** — density and cost-per-unit are ratios over a whole solid, not facts about
  a cross-section. A sweep would display a quantity the lesson never asks about.
- **rf-03-01 / rf-03-02 / rf-03-03** — the sums reduce to numerators with non-integer roots
  (−7/2 for (2x+7)/(x−1); −3/5 for (5x+3)/(x(x+1))) and `signChart.roots.x` is integer-typed, so the
  chart cannot place the zero it needs. Same constraint that blocked rf-04-03 in S116.
- **rf-02-03** — its exclusion at x = 3 is a sign-**changing** zero of the reduced function: not a
  pole (the curve reaches it) and not a hole (a hole leaves the sign untouched). Authoring it as
  either ships a chart that is false about the function.
- **cp-04-\*, cp-05-\*** — measured and found to need no lab. cp-04-01/04-02 and cp-05-03 are about
  what *counts* as proof (conjecture vs. proof, statement-reason matching, converses) — judgment
  tasks, the legitimate-KEEP class already documented for this course. cp-04-03 and cp-05-01 are
  angle arithmetic on a fixed figure, and every one of their steps carries a live `variant` tag;
  converting the surface would break the freshness contract, the defect class S116 hit three times.

## Tests

`src/lib/conversions.s117.test.ts` — 30 tests, all passing, no existing test weakened or touched.
Every block asserts the **mathematical claim the authored feedback makes**, against arithmetic
computed in the test rather than against the implementation that produced the spec:

- re-04-01: `extraneousCandidates` returns exactly [−2, 3]; `extraneousHolds` accepts 3 and rejects
  −2; and the reason is spelled out as numbers (√4 = +2 while the line reads −2).
- cx-03-02: all four sides computed at exactly 5; `quadName` returns "a rhombus"; the diagonals
  squared are 80 and 20.
- rf-02-01/02-02: `signChartSigns` compared against the real rational functions evaluated inside
  every interval; the hole's reduced value is 5, not 0.
- tg-02-03: a 0–360° sweep asserting the sum·180 ghost coincides below 1e−9 **and** equals the
  antipode; the linearity impostor detaches; and a direct assertion that `negate` leaves cosine
  unchanged — pinning *why that kind was wrong for this lesson* so the choice cannot silently revert.
- tg-02-03 **ordering contract**: i1b is at i1's index + 1, i1 is the lab, i1b is `numeric`, and its
  answer is still −1. A future edit that reorders or re-converts undoes the fix; this fails first.
- sg-04-01: the sphere's section area re-derived in the test, asserted equal to the authored
  comparison area at the target and strictly smaller at every other lattice point.
- cp-: each construction's target is `floor(span/2) + 1`, with both reachability bounds checked.

## One stale KNOWN_ISSUES entry corrected

The S116 entry "the engine registration contract is 9 surfaces, not 8" listed its own fix as still
owed. Measured: `engineCapabilities.coverage.s116.test.ts` already implements exactly that fix, and
a three-link bidirectional chain (registry ↔ REGISTERED_WIDGETS ↔ STAGE_TIER ↔ capability table)
would have caught the failure independently. No test was written. The entry is corrected, with the
failure mode recorded: a KNOWN_ISSUES line naming a fix as owed is not evidence the fix is missing —
the tree is.

---

# Session 118 — `binomialAreaLab`: the last course-level engine gap in 6–12

The playbook called Block 6 "the only build-then-author". Measured, there were two: the radical
lab (S116) and this one. `algebraTiles` builds a LINEAR expression (`targetX·x + targetConst`) with
no x² channel, so a binomial product cannot be laid out at all; `areaModel` is numeric area with no
algebraic labels on its sides. The classic partitioned rectangle had no home in the registry.

## The engine

Sides are (pX·x + a) across and (qX·x + b) down. The learner drags the two **constant partitions**
and four regions resize together: the fixed x-block (pq·x²), two strips (qa·x and pb·x), and the
corner (ab).

**The claim the engine exists to make visible: the middle coefficient is a SUM.** Both strips share
a side of length x, so they lie alongside one another and their x-counts add. Sweeping one
partition while the other holds still shows exactly that — one strip grows, the other does not, and
the middle coefficient tracks a total that a product could never track. The corner is the one
region where the two constants genuinely do multiply, and it is a *different region*, which is the
whole distinction a memorised FOIL rule flattens.

**Negative constants are modelled, not avoided.** A negative partition renders OUTSIDE the block in
berry with a dashed edge — area being taken away, the way algebra tiles have always handled
subtraction. That makes the difference of squares a thing that happens on screen: for
(x + 6)(x − 6) the two strips are +6x and −6x, equal and opposite, and they annihilate. The corner
turns berry because its sign is the product of the two.

**The misconception is a reachable state, and the gate protects it.** The add-vs-multiply error
(middle = a·b instead of a + b) is a layout the learner can actually build, and the evaluator names
which quantity they used. That only works if the two differ — so `widgetIntegrityErrors`
**refuses** any authoring where `targetA · targetB` equals the middle coefficient. (x + 2)² is
exactly such a case: middle 4, product 4. Authoring it would ship dead feedback the solvability
gate would rightly flag, so the engine rejects it at authoring time rather than at review time.

**Commutativity is graded correctly rather than conveniently.** Swapping the two constants is the
same rectangle turned on its side — but only when the x-coefficients match. For (3x)(x + 4) the
swap gives (3x + 4)(x), a genuinely different product, and the evaluator rejects it. Pinned by a
test that asserts the two expansions differ before asserting the grading does.

## Registration: eleven surfaces, not nine

The standing note says the engine contract is nine files; S116 corrected it to nine by adding
`engine-capabilities.json`. Measured this session by sweeping the newest engine
(`grep -rl extraneousRootLab`), it is **eleven**:

`schema.ts` · `evaluate.ts` (three switches: grade, `canCheck`, `correctAnswerText`) ·
`widgets.tsx` (component **and** the registry switch **and** `REGISTERED_WIDGETS`) ·
`widgetSamples.ts` · `stageWidth.ts` · `describeState.ts` · `pedagogy.ts` ·
`masteryMission.server.ts` · `processEvents.ts` (three: `MULTI_CONTROL`, direction cues,
per-control fixation copy) · `scripts/engine-capabilities.json`.

**`REGISTERED_WIDGETS` was the one I missed**, and the three-link chain S117 documented caught it —
`stageWidth.test.ts` failed with a 101-vs-100 array diff naming `binomialAreaLab` exactly. That
gate was described last session as "confirmed, not added to"; this session it earned its keep by
catching a real omission on the very next engine. Typecheck does not catch this one, because
`REGISTERED_WIDGETS` is a string array, not a union-exhaustive switch.

## Content-change ledger

| Lesson | Step | Old widget | New widget | Tier |
|---|---|---|---|---|
| ep-03-01 | i1 | `numeric` | `binomialAreaLab` (3x)(x + 4) | D → **A (35)** |
| ep-03-02 | i1 | `numeric` | `binomialAreaLab` (x + 2)(x + 3) | D → **A (35)** |
| ep-03-03 | i1 | `numeric` | `binomialAreaLab` (x + 4)(x + 4) | D → **A (35)** |

**No authored prose was changed.** No body, ID, order, hint, conceptTag, remedial mapping or XP
rule was touched, and **every authored `predict` is preserved byte-for-byte** — the script asserts
both and aborts otherwise. New authored content: three widget feedback sets (four strings each).

The predicts are worth quoting, because they are the playbook's thesis in miniature. ep-03-02's
already asked *"where does the x-term of the answer come from?"* with the correct option
*"Both crossings: x·3 and 2·x, giving 5x"* — a prediction with nothing on screen to resolve it
against. ep-03-03's asked *"(x + 4)²: is it just x² + 16?"*. Both were written for a manipulation
the widget never delivered; the lab delivers it and the predicts needed no edit at all.

Arithmetic verified by hand before authoring and again in the suite: 3x² + 12x, x² + 5x + 6,
x² + 8x + 16. Product-vs-sum distinguishable in every case (0 vs 12, 6 vs 5, 16 vs 8).

Product-wide Tier **A 470 → 473, D 54 → 51**.

## A correction: the KNOWN_ISSUES claim was too broad

The S116 entry said seven Tier-D `ep-` lessons needed a 2D tile engine, and listed
ep-01-01/01-02/01-03, ep-02-01, ep-03-01/03-02/03-03. Measured against the lessons themselves:

- **ep-01-01/01-02/01-03** are exponent RULES — `2³ · 2⁴`, `(2⁴)²`, `5⁰`, `3⁴/3⁶`. There is no
  product of two linear factors anywhere in them, and a rectangle would represent nothing.
- **ep-02-01** is degree and like terms — reading structure off a written polynomial.
- Exactly **three** are binomial-product lessons, and those three are converted.

The four remaining Tier-D ep- lessons are a genuinely different gap, and naming this engine as
their fix would have sent a future session to build the wrong thing. Entry corrected.

## Tests

`src/lib/binomialAreaLab.s118.test.ts` — 25 tests, all passing, no existing test weakened.

Every expansion is checked against arithmetic **computed in the test** rather than against
`binomialExpand`, so a bug in the shared truth function fails there instead of verifying itself —
the discipline `extraneousHolds` gives the radical lab. Six real products are expanded term by
term, then the sum-not-product claim is asserted directly across all of them, then the difference
of squares is shown to lose its middle term because +6x and −6x cancel.

The integrity block pins all five refusals including the (x + 2)² case, and pins that (x + 4)² is
ALLOWED — 8 ≠ 16, so the misconception is distinguishable there. The grading block pins the
four paths, the accepted commutative swap, and the rejected asymmetric one.

---

# Session 118 — `binomialAreaLab`: the last course-level engine gap in grades 6–12

The playbook's Block 6 was "the only build-then-author". This is the second, and it closes the gap
S116 recorded when the `ep-` cluster was measured and found to have no engine that could represent
a product of two linear factors.

## Why no existing engine could do it

Measured against the schemas rather than assumed. `algebraTiles` builds a LINEAR expression
(`targetX·x + targetConst`) with **no x² channel**, so (x + 2)(x + 3) cannot be laid out at all.
`areaModel` is numeric area with **no algebraic labels on its sides**, so it can show 5 × 6 = 30
but not (x + 2)(x + 3). The classic partitioned rectangle was genuinely missing.

## The design, and the one claim it exists to make

Sides are (pX·x + a) across and (qX·x + b) down. The learner drags the two **constant partitions**
and four regions resize together:

| region | area | who moves it |
|---|---|---|
| the x-block | pX·qX·x² | nobody — it is why the x² coefficient never changes |
| across strip | qX·a·x | the across partition |
| down strip | pX·b·x | the down partition |
| corner | a·b | both |

**The middle coefficient is a SUM, and the rectangle is why.** Both strips have one side of length
x, so they lie alongside each other and their x-counts add. Sweeping one partition while the other
holds still shows it directly: one strip grows, the other does not, and the middle coefficient
tracks a sum it could never track if it were a product. The corner is the *only* region where the
two constants genuinely multiply — which is precisely the distinction the add-vs-multiply
misconception collapses.

**Negative constants are modelled, not avoided.** A negative partition draws OUTSIDE the block in
berry with a dashed edge — area taken away — which is how algebra tiles have always handled
subtraction, and how (x + 6)(x − 6) loses its middle term in front of the learner: two strips of
equal size and opposite direction, cancelling. The corner's colour follows the sign of a·b, so two
negatives producing a positive corner is visible rather than asserted.

## The misconception is a state the gate protects

`productMiddleFeedback` fires when the learner's layout produces a middle coefficient equal to the
PRODUCT of the intended constants. For that to be a real diagnosis, the sum and the product must
differ — and for (x + 2)² they do not (2 + 2 = 2 × 2 = 4). The integrity gate therefore **refuses
to author** any case where they coincide, because the feedback would be unreachable dead copy that
the solvability gate would rightly flag. Four more refusals: both constants zero (no strips, no
corner, nothing to see), a start position that already IS the answer, asking for a constant term
when a partition is 0 (no corner exists), and asking for a middle coefficient that is 0 for a
reason the rectangle cannot show.

Grading has four distinguishable paths. The commutative swap is accepted — the same rectangle
turned on its side — but **only when the x-coefficients match**, since (3x)(x + 4) and
(3x + 4)(x) are genuinely different products. That asymmetry is pinned by a test.

## The registration contract is ELEVEN surfaces, not nine

The standing note says eight; S116 corrected it to nine. Measured this session by sweeping the
newest engine across the tree, it is **eleven**:

`schema.ts` · `evaluate.ts` (three switches: grade, `canCheck`, `correctAnswerText`) ·
`widgets.tsx` (component + registry switch + **`REGISTERED_WIDGETS`**) · `widgetSamples.ts` ·
`stageWidth.ts` · `describeState.ts` · `pedagogy.ts` · `masteryMission.server.ts` ·
`processEvents.ts` · `scripts/engine-capabilities.json`

The eleventh, `REGISTERED_WIDGETS`, is a hand-maintained array in `widgets.tsx` that is NOT derived
from the union — and it was caught loudly by the three-link chain S117 had just finished
documenting (`stageWidth.test.ts` failed with a 101-vs-100 diff naming `binomialAreaLab`). That
gate earned its keep within one session of being confirmed.

## Content-change ledger

**No authored lesson prose was changed.** No body, lesson ID, step ID, step order, hint,
conceptTag, remedial mapping, XP rule or curriculum alignment was touched. Three `widget` blocks
replaced; every authored `predict` preserved byte-for-byte (asserted by the script, which aborts
otherwise).

| Lesson | Step | Product | Asks | Tier |
|---|---|---|---|---|
| ep-03-01 | i1 | (3x)(x + 4) = 3x² + 12x | x² coefficient | D → **A (35)** |
| ep-03-02 | i1 | (x + 2)(x + 3) = x² + 5x + 6 | middle | D → **A (35)** |
| ep-03-03 | i1 | (x + 4)(x + 4) = x² + 8x + 16 | middle | D → **A (35)** |

Product-wide Tier A **470 → 473**, Tier D **54 → 51**.

The authored predicts needed no edit and are worth quoting as evidence for the playbook's central
claim — ep-03-02's already asks *"where does the x-term of the answer come from?"* with the correct
option *"Both crossings: x·3 and 2·x, giving 5x"*. That is a prediction with nothing to check it
against: the prose was written for a manipulation the widget never delivered.

## A correction: the KNOWN_ISSUES claim was too broad

The S116 entry said **seven** Tier-D `ep-` lessons needed a 2D tile engine. Measured against the
lessons themselves, that is wrong: `ep-01-01` (2³ · 2⁴), `ep-01-02` ((2⁴)²), `ep-01-03` (5⁰ and
2⁻³) are exponent RULES, and `ep-02-01` is degree and like terms. None is a product of two linear
factors, and a rectangle would misrepresent them rather than reveal them. Exactly **three** lessons
were blocked on this engine, and exactly three are converted. The remaining four are a different
problem and are recorded as such.

## Tests

`src/lib/binomialAreaLab.s118.test.ts` — 25 tests, all passing, no existing test weakened.

Every expansion is checked against arithmetic computed **in the test** — the product expanded by
hand — rather than against `binomialExpand`, so a bug in the shared truth function fails there
instead of verifying itself. That is the same discipline `extraneousHolds` gives the radical lab.
Six real cases are pinned term by term, including the monomial (3x)(x + 4), the two sign cases, the
perfect square, and the difference of squares. One test asserts the engine's whole pedagogical
claim directly: for every case, the middle coefficient equals qX·a + pX·b, the two strips summed.

The integrity block pins all five refusals, including the (x + 2)² case where the sum and product
coincide — with `expect(2 + 2).toBe(2 * 2)` stated first, so the reason the gate fires is visible
in the test rather than implied.

---

# Session 118 — `binomialAreaLab`: the last course-level engine gap in grades 6–12

The playbook's Block 6 was the only *build-then-author* block, and it was completed in S116. This
is its counterpart outside the playbook: the engine gap the D-tier sweep found, ledgered in
KNOWN_ISSUES since S116, and the only remaining blocker where no existing engine could represent
the mathematics at all.

## Why an engine and not a conversion

`algebraTiles` builds a LINEAR expression (`targetX·x + targetConst`) with no x² channel, so
(x + 2)(x + 3) cannot be laid out. `areaModel` is numeric area with no algebraic labels on its
sides. The classic partitioned rectangle for binomial products — x², two strips, a corner — did
not exist anywhere in an 86-engine registry.

## The design, and the one claim it exists to make

Sides are (pX·x + a) across and (qX·x + b) down. The learner drags the two **constant partitions**
and watches four regions resize together:

| region | size | what it teaches |
|---|---|---|
| x-block | pX·qX·x² | never moves under either drag — which is why the x² coefficient is fixed |
| across strip | qX·a·x | resizes under the across drag ONLY |
| down strip | pX·b·x | resizes under the down drag ONLY |
| corner | a·b | the one region where the constants genuinely multiply |

**The middle coefficient is a SUM, and the rectangle is why.** Both strips have one side of length
x, so they lie alongside each other and their x-counts add. Sweeping one partition while the other
holds still is the proof: one strip grows, the other does not, and the middle coefficient tracks a
sum it could not track if it were a product. That is the single fact a memorised FOIL hides, and
it is now something the learner performs rather than recites.

**Negative constants are honest rather than avoided.** A negative partition draws its strip OUTSIDE
the block, in berry, dashed — area being taken away, which is how algebra tiles have always modelled
subtraction. Two consequences arrive for free and are visible rather than asserted: (x + 6)(x − 6)
loses its middle term because the two strips are equal and opposite and cancel on screen; and the
corner turns leaf under two berry strips, because a negative times a negative is positive.

## The misconception is a STATE, and the gate refuses to let it become dead copy

`productMiddleFeedback` fires when the learner's layout produces a middle coefficient equal to the
PRODUCT of the intended constants — the add-vs-multiply error, reachable and diagnosable.

The integrity gate **refuses to author any case where the sum equals the product**. For (x + 2)²
the middle is 4 and the product is 4: the misconception would be indistinguishable from the right
answer, and the feedback would be unreachable. The gate rejects that spec rather than shipping copy
no learner can ever see. It also refuses both-constants-zero (no strips, no corner), a start
position that already IS the target, and asking for a constant term when a partition is 0.

Four distinguishable grading paths: success, `signFeedback` (right magnitudes, wrong direction),
`productMiddleFeedback`, `partialFeedback`. Success accepts the commutative **swap** — the same
rectangle turned on its side — but **only when the x-coefficients match**, since (3x)(x + 4) and
(3x + 4)(x) are genuinely different products. That asymmetry is pinned by a test.

## The three lessons

| Lesson | Product | Asks | Tier |
|---|---|---|---|
| ep-03-01 Multiplying by a Monomial | (3x)(x + 4) = 3x² + 12x | x² coefficient | D (24) → **A (35)** |
| ep-03-02 Multiplying Binomials (FOIL) | (x + 2)(x + 3) = x² + 5x + 6 | middle | D (24) → **A (35)** |
| ep-03-03 Special Products | (x + 4)(x + 4) = x² + 8x + 16 | middle | D (24) → **A (35)** |

Product-wide Tier A **470 → 473**, Tier D **54 → 51**.

**Every authored `predict` was preserved byte-for-byte**, asserted by the script. Each already asked
exactly what the lab shows — ep-03-02's is *"where does the x-term of the answer come from? Both
crossings: x·3 and 2·x, giving 5x"* — a prediction with nothing to check it against. That is the
playbook's own diagnosis (§2.1): the prose was written for a manipulation the widget never
delivered.

## Content-change ledger

**No authored lesson prose was changed.** No `body`, lesson ID, step ID, step order, hint,
`conceptTag`, remedial mapping, XP rule or curriculum alignment was touched. The `widget` block of
ONE step per lesson changed; `body` and `predict` were both re-asserted byte-identical after the
edit, with the script aborting before any write on mismatch. New authored content: three widget
feedback sets (four strings each), which passed `validate:content` and `lint:pedagogy` as authored
text.

## The KNOWN_ISSUES claim was too broad — corrected

The S116 entry said **seven** Tier-D `ep-` lessons needed a 2D tile engine. Measured against the
lessons rather than the entry: `ep-01-01/01-02/01-03` are exponent RULES (2³·2⁴, (2⁴)², 5⁰) and
`ep-02-01` is degree and like terms. None is a product of two linear factors, and a partitioned
rectangle would misrepresent them, not serve them. **Exactly three** lessons were blocked on this
engine, and exactly three are converted. The remaining four are a separate question about whether
exponent rules have a manipulable model at all — a real open question, but not this one.

## The registration contract is ELEVEN surfaces, not nine

The standing note says nine; S116 corrected it to nine by adding `engine-capabilities.json`.
Measured this session by sweeping every non-test reference to the newest engine, it is **eleven**:

`schema.ts` (spec, union, type export, truth function, integrity gate) · `evaluate.ts` (evaluator,
`canCheck`, `correctAnswerText`) · `widgets.tsx` (component, type import, registry switch,
**`REGISTERED_WIDGETS`**) · `widgetSamples.ts` · `stageWidth.ts` · `describeState.ts` ·
`pedagogy.ts` · `masteryMission.server.ts` · `processEvents.ts` (MULTI_CONTROL, direction cues,
per-control fixation copy) · `engine-capabilities.json`.

**`REGISTERED_WIDGETS` is the eleventh, and it was caught by the gate S117 documented.** It is a
hand-maintained array in `widgets.tsx`, separate from the registry switch, and nothing about adding
a widget to the switch requires adding it there. `stageWidth.test.ts` failed loudly with a
101-vs-100 array diff. That three-link chain — the one S117 measured and declined to duplicate —
earned its keep this session on the very first engine added after it was verified.

## Tests

`src/lib/binomialAreaLab.s118.test.ts` — 25 tests, all passing, no existing test weakened.

Every expansion is checked against arithmetic **computed in the test** (expanding by hand, term by
term, across six real cases including both negatives and the monomial) rather than against
`binomialExpand`, so a bug in the shared truth function fails there instead of verifying itself —
the same discipline `extraneousHolds` gives the radical lab. The suite also pins:

- that the middle coefficient equals the strip sum for every case, and that 2 + 3 ≠ 2 × 3, which is
  what makes the misconception visible rather than accidental;
- that (x + 6)(x − 6) loses its middle term because +6x and −6x cancel;
- the integrity gate's refusal of (x + 2)² **and** its acceptance of (x + 4)², where 8 ≠ 16;
- the swap asymmetry — accepted when pX = qX, rejected when they differ, with the two genuinely
  different products asserted side by side;
- all four grading paths, `canCheck`, `correctAnswerText`, and `describeWidgetState` in both the
  placed and unplaced states.

## Two self-inflicted faults, both caught by typecheck

Recorded because they are cheap to repeat. (1) The `str_replace` that inserted the spec consumed
the `export const WidgetSpec = z.discriminatedUnion("type", [` line it anchored on, leaving the
union's member list dangling after a function body. (2) The registry switch's
`case "extraneousRootLab":` is **brace-less**, so inserting a braced case after it added one
unmatched brace at each end. Both surfaced as TS1005/TS1128 syntax errors and were repaired before
anything else ran. The lesson: when anchoring on a line that opens a block, re-emit it.

---

# Session 118 — `binomialAreaLab`: the last course-level engine gap in grades 6–12

The playbook's §8 table listed one new engine (`extraneousRootLab`, built S116). This is the other
one — never in the playbook, because it was discovered by *measurement* in S116's D-tier sweep:
`algebraTiles` builds only a LINEAR expression (`targetX·x + targetConst`, no x² channel), so
(x + 2)(x + 3) cannot be laid out at all, and `areaModel` is numeric area with no algebraic labels
on its sides. The classic partitioned rectangle for binomial products did not exist.

## The engine

Sides are **(pX·x + a)** across and **(qX·x + b)** down. The learner drags the two constant
partitions; four regions resize together:

| Region | Area | Colour role |
|---|---|---|
| x-block | pX·qX·x² | ink — fixed structure, and it never moves |
| across strip | qX·a·x | sky (learner-controlled) / berry when negative |
| down strip | pX·b·x | sky / berry when negative |
| corner | a·b | leaf when positive, berry when negative |

**The claim the engine exists to make visible:** the middle coefficient is a **SUM**. Both strips
share a side of length x, so they lie alongside one another and their x-counts add. Sweeping one
partition while the other holds still shows exactly that — one strip grows, the other does not, and
the middle coefficient tracks a sum it could not track if it were a product. The corner is the one
region where the two constants genuinely do multiply, which is why the constant term is a product
and the middle term is not. A rule that gets recited as "FOIL" becomes a fact about four regions.

**Negative constants are modelled, not avoided.** A negative partition draws OUTSIDE the block in
dashed berry — area being taken away — which is how algebra tiles have always represented
subtraction and how `algebraTiles` itself already models signed tiles. It makes (x + 6)(x − 6) lose
its middle term in front of the learner: two strips of equal size and opposite direction,
cancelling. The corner's colour follows the sign of a·b, so two negative strips producing a
*positive* corner is visible rather than asserted.

## The misconception is a reachable state, and the gate protects it

`productMiddleFeedback` fires when the learner's layout produces a middle coefficient equal to the
PRODUCT of the intended constants — the canonical add-vs-multiply error, performed rather than
described.

That feedback is only honest if the two quantities differ. For (x + 2)² the middle is 4 and the
product is 4: the misconception would be *indistinguishable from the right answer*, and the copy
would be unreachable. **The integrity gate refuses to author that case**, along with four others:
both constants zero (no strips, no corner), a start position that is already the target, asking for
a constant term when a partition is 0 (no corner exists), and a middle-coefficient ask whose answer
is 0 for a reason the rectangle cannot show.

## Grading — four distinguishable paths

- **success**, accepting the commutative swap — but **only when pX === qX**, since otherwise
  swapping the constants changes the product. Verified: (3x)(x + 4) = 3x² + 12x while
  (3x + 4)(x) = 3x² + 4x, genuinely different, so the swap is correctly rejected there.
- **signFeedback** — right magnitudes, wrong directions: the (x − 4)(x − 1) and (x + 6)(x − 6) trap.
- **productMiddleFeedback** — the add-vs-multiply state, above.
- **partialFeedback** — one side right, plus the pre-sweep state (`requiredMoves` unmet).

## The lessons

| Lesson | Product | Asks | Tier |
|---|---|---|---|
| ep-03-01 | (3x)(x + 4) = 3x² + 12x | x² coefficient | D → **A (35)** |
| ep-03-02 | (x + 2)(x + 3) = x² + 5x + 6 | middle | D → **A (35)** |
| ep-03-03 | (x + 4)(x + 4) = x² + 8x + 16 | middle | D → **A (35)** |

Product-wide Tier **A 470 → 473 · D 54 → 51**.

**Content-change ledger: no authored prose was changed.** One `widget` block per lesson. Every
authored `predict` preserved byte-for-byte, asserted by the script before and after the write.
New authored content: three widget feedback sets (four strings each). No body, ID, order, hint,
conceptTag, remedial mapping or XP rule touched.

Worth recording *why* those predicts needed no edit: ep-03-02's authored prompt is already
*"where does the x-term of the answer come from?"* with the correct option *"Both crossings: x·3
and 2·x, giving 5x"*. That is a prediction with nothing to check it against — the playbook's
diagnosis exactly, prose written for a manipulation the widget never delivered. It now has one.

## Correction: the KNOWN_ISSUES claim was too broad

The S116 entry said **seven** Tier-D `ep-` lessons needed a 2D tile engine. Measured against the
lessons rather than the entry: `ep-01-01/01-02/01-03` are exponent RULES (2³·2⁴ to a single power,
(2⁴)², 5⁰ and 2⁻³) and `ep-02-01` is degree and like terms. None is a product of two linear
factors, and a rectangle would misrepresent them, not reveal them. **Exactly three** lessons were
blocked on this engine, and exactly three are converted. The remaining four are a different problem
and are not solved by this build; they stay Tier D honestly.

## The registration contract is ELEVEN surfaces, not nine

S116 corrected the standing note from eight to nine. Measured this session by sweeping the newest
engine (`grep -rl extraneousRootLab src/ scripts/`), it is **eleven**:

`schema.ts` (spec, union, type export, integrity gate, shared truth fn) · `evaluate.ts` (grading,
`canCheck`, `correctAnswerText`) · `widgets.tsx` (component, type import, registry switch,
**`REGISTERED_WIDGETS`**) · `widgetSamples.ts` · `stageWidth.ts` · `describeState.ts` ·
`pedagogy.ts` · `masteryMission.server.ts` · `processEvents.ts` (MULTI_CONTROL, direction cues,
per-control fixation copy) · `scripts/engine-capabilities.json`.

**`REGISTERED_WIDGETS` was the one I missed**, and the three-link chain S117 measured caught it
immediately: `stageWidth.test.ts` failed with a 101-vs-100 array diff naming `binomialAreaLab`.
That gate has now paid for itself. Note it is a *separate* export from the registry switch in the
same file, which is why a file-level grep looks complete while the contract is not.

Per-control fixation copy was authored for **both** controls, per the S116 rule that a half-filled
table gives one control a specific nudge and its partner a generic one.

## Tests

`src/lib/binomialAreaLab.s118.test.ts` — 25 tests, all passing, no existing test weakened.

Every expansion is checked against arithmetic written out **in the test**, not against
`binomialExpand`, so a bug in the shared truth function fails here rather than verifying itself —
the discipline `extraneousHolds` gives the radical lab. Six products are pinned term by term,
including the monomial case and the difference of squares. The suite also asserts the engine's
pedagogical claim directly (`middle === qX·a + pX·b` for every case), that 2 + 3 ≠ 2 × 3 so the
misconception is genuinely distinguishable, that 2 + 2 === 2 × 2 so the gate is right to refuse
(x + 2)², and that the asymmetric swap is correctly rejected because the two products differ.

## Two self-inflicted build faults, both caught by typecheck

Recorded because they are easy to repeat when editing an 11,500-line component and a 4,100-line
schema by anchored replacement:

1. **The union declaration line was consumed.** Replacing
   `export const WidgetSpec = z.discriminatedUnion("type", [` with new content *ending* at that
   line deleted it, leaving the union's member list dangling after a function body. Anchor on a
   line you intend to keep, or re-emit it.
2. **The `extraneousRootLab` registry case is brace-less.** Inserting a `{`-braced case after it
   added an unmatched pair. Cases in that switch are not uniformly braced; check the specific one.

Both surfaced as TS1005/TS1128 syntax errors and were repaired before any test ran.

---

# Session 119 — tg-05-02, and a correction to two of the priority list's own estimates

## tg-05-02: closed, but not by the fix its own diagnosis proposed

S115 diagnosed the lesson's blocker as "θ = arcsin(3/5) sits off `unitCircleExplore`'s
integer-degree lattice" and named an exact-ratio angle-snapping mode as the natural fix. That
diagnosis was never wrong about the lattice fact — it was wrong about which fact the lesson turns
on. Reading `i1` itself: the step never asks for an angle in degrees. It gives opposite=3,
hypotenuse=5 and asks for the adjacent leg — an exact Pythagorean-triple computation, answer 4,
tolerance 0 — matching its own concept step's instruction to *"draw the helper right triangle."*

`distanceGrid` already draws exactly that triangle: two legs (sky, tangerine) plus a hypotenuse
(berry) from a fixed anchor to a dragged point, with a live `√(dx² + dy²)` readout. It is
registered, integer-only, and was built — per its own doc — to show "the distance formula as the
Pythagorean theorem." **Zero engine work.**

| Lesson | Step | Change | Tier |
|---|---|---|---|
| tg-05-02 | i1 | `numeric` → `distanceGrid` + predict | C → **A (31)** |

**Design.** Anchor at the origin (the angle's vertex). Start position `(0, 3)` — the given
"opposite" leg is set from the start, since it is not what the lesson asks the learner to find;
the interaction is scoped to the genuine unknown, hunting the adjacent leg by dragging x until the
live readout reads exactly 5. Verified independently before authoring:
`√(4² + 3²) = √25 = 5`, the classic 3-4-5 triple the lesson's own `commonErrors` already reference.

**Content-change ledger.** No authored prose changed. One `widget` block, one added `predict`,
asserted byte-identical body before and after. `wrongPointFeedback` is new authored copy, written
to cover the same two misconceptions the original numeric widget's `commonErrors` already named
(adding the squares instead of subtracting; subtracting the legs directly instead of their
squares) — new content, not a rewrite of the old.

## Correction: the "cx-02-01 + tc-04-* — one engine, 4 lessons" estimate was too broad

S117's priority list carried this forward from an unread assumption. Reading the actual `tc-04-*`
steps this session: `tc-04-01` and `tc-04-03` are matching/sorting tasks over which lines define
which triangle center — the same legitimate-keep classification class already documented for `cp-`
and `gf-`. Only `tc-04-02/i1` (the centroid's 2:1 median ratio) is a genuine numeric fact a lab
could verify, and one lesson does not justify a four-construction-type concurrency-evidence build.

`cx-02-01` remains genuine residue — all three of its non-variant steps (i1, i2, ch) are honestly
segment-partition-shaped, in both directions (ratio from point; point from ratio), and no
registered engine fits without distorting the geometry (checked and rejected: `coordinateProofLab`
needs a fourth vertex to drag that a bare two-point segment does not have; `distanceGrid` has no
ratio concept; `dilationExplore`'s segments mode needs a triangle side, and inventing one would
draw structure the lesson never has). A lightweight `segmentPartition` engine is the honest fix —
smaller than `extraneousRootLab`/`binomialAreaLab` (a single interpolation, no branching truth
function) — deferred to a session with room to finish the 11-surface contract in full, per the
standing all-or-nothing rule.

## Validation

Content-only change (one lesson JSON, no source file touched). Ran the gates that bear on it:
typecheck EXIT 0, `validate:content` 1223/1223, `lint:pedagogy` 1139/1139, `check-registration`
consistent, plus the arithmetic and `widgetIntegrityErrors` checks the conversion script itself
runs before writing. Build and Playwright were last verified green at S118's close against an
identical source tree; this change touches no source file, so neither gate's result could have
changed, and both are re-confirmed the next time source changes warrant the full cycle.

Tier: A **473 → 474**, C 346 → 345.

## S119, second half — a shared-engine defect found while authoring, and the lessons it unblocked

### The defect: `fractionBar` could not draw an improper fraction

Reaching for the proven `fm-` pattern on the next backlog entries, both candidates turned out to
need a fraction **above one whole** — and the engine could not draw one. `seg(count, shaded)` built
exactly `count` parts and shaded the first `shaded`, so any numerator past the denominator simply
filled every part:

> **7/4 rendered as four shaded quarters — pixel-identical to 4/4** — while the `aria-label`
> truthfully said *"7 of 4 parts shaded."* The picture contradicted the label.

This was not hypothetical. **Two shipped lessons already author improper targets** — `fa-04-01`
(7/4) and `ns-01-03` (7/3) — so learners were being shown a picture of exactly one whole and asked
to reason about more than one. Neither the a11y sweep nor the keyboard gate could catch it: both
check structure and labelling, and the label was correct. Only drawing it exposes it.

**The fix.** The bar now spans `ceil(n/d)` wholes, each still cut into `d` equal parts, with a
dashed ink rule at every whole boundary it crosses. A part keeps its size and meaning; the surplus
sticks out past the mark. Proper fractions are untouched by construction: when `n <= d` the span is
one whole and the geometry is exactly what it was — which is the regression risk, so it is the
first thing the new suite asserts.

`src/lib/fractionBar.improper.s119.test.tsx` — 6 tests. Proper builds unchanged (3/4 → 4 parts,
3 shaded, no boundary rule; 4/4 likewise), improper builds correct (7/4 → 8 parts, 7 shaded, one
rule; 7/3 → 9 parts, 7 shaded, two rules), and **the bug itself pinned**: 7/4 must no longer render
identically to 4/4. One subtlety recorded in the test: `seg` draws the target bar as well as the
learner's, so a container-wide query double-counts the rules — every count is scoped to the
learner's group.

### The lessons the repair unblocked

| Lesson | Backlog rank | Step | Change | Tier |
|---|--:|---|---|---|
| fm-04-02 | 8 | i2 | `mcq` → `fractionBar` 4/3 + predict | C (20) → **A (30)** |
| fm-02-01 | 7 | i1 | `numeric` → `fractionBar` 6/5 + predict | C (23) → **A (33)** |

**`fm-04-02` converts i2, not i1, deliberately.** i1 is 3/4 × 8, and `fm-04-01` already ships a 3/4
build — repeating it teaches nothing new. i2 asks whether 4/3 × 6 exceeds 6: the **contrast case**
to fm-04-01's 3/4, and the reason the lesson exists. A scaler *above* one whole grows what it
scales. With the repair, the learner sees 4/3 cross the whole-mark; before it, they would have seen
a bar that looked exactly like 4/4 while being told it was more.

**`fm-02-01` builds the product, 6/5.** Three groups of 2/5 laid end to end, crossing the
whole-mark — which is precisely why the numerator outgrows the denominator, and why you multiply
the top and keep the bottom.

### The integrity gate caught a real authoring error

The first draft of `fm-02-01`'s "multiplied the denominator too" trap used 6/15. `denMax` is 12, so
that build is unreachable and the diagnosis could never fire — dead feedback. The gate rejected it
before any write. Re-authored as 6/10: the same misconception (changing the piece SIZE as well as
the count) on a build the learner can actually reach.

### Declined this batch, with reasons

- **fm-05-01, fm-05-03/i2** — both are measurement division ("how many 1/2s fit in 4?").
  `fractionBar` builds ONE fraction; it cannot show N wholes partitioned into unit pieces and
  counted. `numberLineHop` is the right shape and remains integer-only (established S116).
- **fm-05-03/i1** — an mcq asking *which computation* matches a story: a judgment task, the
  legitimate-KEEP class already documented for `cx-`/`cp-`/`gf-`.

### Measurement

Tier **A 474 → 476**, C 345 → 343. More importantly, the numbers that predict downstream effect:
**C-only load-bearing concepts 110 → 108**, upgrade backlog 106 → 104, K–8 Tier A 257 → 259.

### Validation

typecheck EXIT 0 · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · full vitest **8501 passed, 76 failed — failing file set byte-identical to the known
`better-sqlite3` bindings set** (diffed), passing count 8495 → 8501 = exactly +6, the new suite.
A shared-engine change with zero regressions across 8,577 tests.

## S119, third pass — the rational-hop lattice, and the backlog it opened

### `numberLineHop.denom`: closing a constraint recorded three times

S116 recorded it for `ns-01-01`; this session recorded it again for `fm-05-01`/`fm-05-03`. The
engine's `hop`, `min`, `max` and `start` are integer-typed, so *"how many 1/5s fit in 2?"* — the
canonical measurement-division question, and the whole of three lessons — had no representation.

**The fix is not the relabelling S116 rejected, and the distinction matters.** S116 considered
showing a 0–10 integer axis for a question posed on 0–2 and correctly refused: that misrepresents
the mathematics. Here every integer on the spec is read as a **count of 1/denom units**, and the
axis renders true fraction labels. The numbers on screen are the question's own numbers — the axis
reads 0, 1/5, 2/5 … 1 … 2, whole numbers carrying taller emphasised ticks — while the arithmetic
underneath stays in exact integer numerator units.

**The evaluator needed no change at all**, which is the tell that the design is right: grading was
always integer-exact, and it still is. No float reaches a label or a grade, so the determinism
claim is untouched. `hopLabel(units, denom)` is the shared truth function, used by the renderer,
the tap buttons' `aria-label`s, and the status line alike, so the picture and the announcement
cannot drift apart.

`denom` is additive-optional: an integer spec parses with no injected key and renders exactly as
before, which the suite asserts first.

### Tests

`src/lib/numberLineHop.rational.s119.test.tsx` — 18 tests. Backward compatibility first (no
injected key, plain integer labels, unchanged grading), then the property that matters most:
**labels are checked against fractions computed independently in the test**, never against
`hopLabel` itself. Thirteen hand-written cases cover whole numbers, reduced proper fractions
(2/4 → "1/2"), reduced mixed numbers (6/4 → "1 1/2") and the typographic minus. Two sweeps then
assert the invariant across every denominator 2–12: no label may contain a decimal point, and each
label read back as a number must equal `units/denom` to twelve places. Plus a determinism check
that the same spec renders identical labels twice.

### The lessons it unblocked

| Lesson | Step | Configuration | Tier |
|---|---|---|---|
| fm-05-01 | i1 | `denom: 2` — 8 halves in 4 wholes | C → **A (33)** |
| fm-05-03 | i2 | `denom: 4` — 12 quarter-cup scoops in 3 cups | C → **A (34)** |
| ns-01-01 | i1 | `denom: 5` — 10 fifths in 2 | C → **A (33)** |

In each, **the count of hops IS the quotient** — the learner counts the pieces rather than applying
a rule, which is what measurement division means.

### `ns-01-02` declined, with the reason measured

The playbook proposed a two-track hop for it: the ÷(a/b) track and the ×(b/a) track landing
identically, so flip-and-multiply becomes a witnessed coincidence. Measured against the lesson's
own numbers, a single-track lattice cannot carry it: `i2` is 2/3 ÷ 4/9, and on ninths that is
6/9 ÷ 4/9 = **1.5 hops**. `hops` is integer-typed, so the landing is not reachable. `i1` ("the
reciprocal of 3/8") is a naming task, and `fractionBar` building 8/3 would show the number without
showing why it is the reciprocal — a relationship, not a build. A genuine second-track mode is the
honest fix; forcing either engine would teach against the lesson.

### One more from the backlog: dop-05-01

| Lesson | Rank | Step | Change | Tier |
|---|--:|---|---|---|
| dop-05-01 | 13 | i1 | `numeric` → `probabilityArea` | D (24) → **A (31)** |

Same shape S116 solved for `ns-02-03`, solved the same way and with no engine work. The lesson's
question is not *what* 0.3 × 0.4 is — column arithmetic produces 0.12 — but **why the answer
carries two decimal places**. A unit square cut into hundredths answers it as a fact about the
grid: a block 3 tenths wide and 4 tenths tall covers 12 small squares, and each small square is a
tenth *of* a tenth. Verified independently before authoring: 3 × 4 = 12, 12/100 = 0.12 = 0.3 × 0.4,
and the add-instead-of-multiply error (3 + 4 = 7) is a *different shading*, so it is a
distinguishable state rather than a message. `i2` (an mcq on how many places 1.2 × 0.5 needs) was
left alone deliberately — it is the formalization check that now follows the lab.

### Measurement

Tier **A 476 → 480 · D 51 → 50 · C 343 → 341**. The downstream numbers again moved further:
**C-only load-bearing concepts 108 → 105**, upgrade backlog 104 → 101, K–8 Tier A 259 → 263.

### Validation

typecheck EXIT 0 · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · full vitest **8526 passed, 76 failed — failing file set byte-identical to the known
`better-sqlite3` bindings set** (diffed). Passing 8501 → 8526 = +25, exactly the new suites.

## S119, fourth pass — hop-SIZE mode: grading a stride instead of a landing

### The gap S116 named precisely, now closed on its own terms

S116 deferred `ns-03-01` (Greatest Common Factor) with an exact diagnosis:

> *"the greatest common factor is a property of two hop SIZES, not of one landing, and this engine
> grades a single landing — it would have to mark '12' correct when the answer is the hop size 4."*

That was right about the engine as it stood. Every `numberLineHop` mode, including this session's
rational lattice, grades **where you land**. GCF is a question about **how far you step**.

Hop-size mode adds that channel. The learner sets the stride and watches, per mark, whether it
lands or steps over. The greatest common factor is the biggest stride that still hits every mark —
visible rather than derived from intersecting two written factor lists.

**Deliberately a separate channel** from `hops`/`commonLandings` rather than an overload of them:
those grade a landing, this grades a stride, and conflating the two would make the meaning of the
graded value depend on which fields happened to be authored.

| Lesson | Step | Change | Tier |
|---|---|---|---|
| ns-03-01 | i1 | `numeric` → `numberLineHop` hop-size mode | B (27) → **A (33)** |

The lesson previously handed the learner two written factor lists (8: 1,2,4,8; 12: 1,2,3,4,6,12)
and took a number — a paper intersection with nothing to manipulate, which is exactly what its
`manip` gap recorded.

### Both wrong paths are reachable states, and the gate enforces it

- **`notLargestFeedback`** — a stride that lands on both marks but is not the biggest. 2 divides
  8 and 12, so it is genuinely *common* and genuinely *not greatest*: the error the word GREATEST
  exists to rule out, performed rather than described.
- **`missesTargetFeedback`** — a stride that skips a mark. 8 divides 8 but not 12: the
  "factor of one of them" error.

The integrity gate independently verifies both are reachable for the authored configuration and
**refuses the spec if either feedback is missing while its state is reachable** — the half-filled
table problem S116 recorded for `processEvents`, applied here at authoring time. It also refuses an
unsolvable range, targets off the line, a target equal to the start (every stride would hit it),
duplicates, and — the subtle one — a range where *every* stride hits *every* mark, which has no
contrast case and therefore teaches nothing.

### Tests

`src/lib/numberLineHop.hopSize.s119.test.tsx` — 22 tests, passing first run.

Backward compatibility leads: a landing spec parses with **none** of the five new keys injected,
grades identically, and still renders tap buttons rather than a stride slider (18 shipped steps
depend on that). `hopSizeAnswer` is then checked against divisibility computed in the test — for
each case, the claimed answer divides every distance *and* nothing larger in range does — across
GCF(8,12)=4, GCF(15,25)=5, the relatively-prime GCF(9,16)=1, GCF(16,24)=8 and the three-way
GCF(12,18,24)=6, plus the null case and an authored-ceiling case where the true GCF sits out of
range. Grading, all five integrity refusals, and the slider's `aria-valuetext` follow.

### Also: the gallery sample, which is the real gate

Adding the mode's sample to `widgetSamples.ts` is what puts it under the keyboard gate and the a11y
audit — the step that caught three genuine defects when S116 added eleven modes. Both sweeps pass
(106/106 keyboard).

### `ns-01-02` and `ns-03-02`: measured, not converted

- **ns-03-02 (LCM)** is already **A (33)** with no gaps; its `i1` is a `numberLineHop` whose prompt
  names a 5-hopper the widget never draws. A ghost second track would improve *fidelity* but move
  no metric, and it is not what hop-size mode provides. Recorded as a fidelity item, not claimed.
- **ns-01-02 (Flip and Multiply)** remains C (22). Re-measured this pass: `i2` is 2/3 ÷ 4/9, which
  on ninths is 6/9 ÷ 4/9 = **1.5 hops** — `hops` is integer-typed, so the landing is unreachable on
  any single track, and hop-size mode grades a stride rather than a quotient. Still needs a genuine
  two-track mode.

### Measurement

Tier **A 480 → 481 · B 258 → 257**. K–8 Tier A 263 → 264.

### Validation

typecheck EXIT 0 · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · keyboard gate 106/106 · build EXIT 0 · **Playwright 47/47** · full vitest
**8548 passed, 76 failed — failing file set byte-identical to the known bindings set** (diffed);
passing 8526 → 8548 = +22, exactly the new suite.

## S119, fifth pass — three more from the backlog top, zero engine work

Before building, I re-measured the two-track hop mode I had ranked next and **dropped it**. Its two
intended lessons do not justify it: `ns-03-02` is already A (33), so drawing its described-but-
undrawn second hopper is a fidelity gain with no metric movement, and `ns-01-02` cannot be served
by integer tracks at all — its `i2` is 2/3 ÷ 4/9 = 1.5 hops. One fidelity item and one lesson the
mode would not fix is a poor return for an engine change, so the backlog got the session instead.

| Lesson | Rank | Step | Change | Tier |
|---|--:|---|---|---|
| ee-03-01 | 7 | i1 | `mcq` → `algebraTiles` + predict | C (22) → **A (32)** |
| sp-01-01 | 11 | i1 | `numeric` → `ratioTable` + predict | C (22) → **A (33)** |
| sp-01-03 | 12 | i1 | `numeric` → `ratioTable` + predict | C (21) → **A (32)** |

**ee-03-01 — the misconception becomes a build, not a distractor.** Its i1 asked *"which expression
equals 3(x + 4)?"* from a list. With tiles, the canonical error — giving the 3 to the x only, so
3x + 4 — is a **reachable build**: leave the constant tiles at four and the expression on screen is
wrong in exactly the way the lesson is about. `constFeedback` names that specific state. Verified:
3(x + 4) = 3x + 12, and `maxTiles` raised to 14 so twelve unit tiles are actually placeable.

**sp-01-01 / sp-01-03 — the constant ratio is the whole assumption.** Both scale a sample
proportion to a population, and `ratioTable` shows the ratio holding *down the column* while both
numbers grow, which is precisely the assumption a sample estimate rests on. sp-01-03 is the sharper
one: 2 defects in 50 is a rare rate, and the table makes it visible that a rare rate over a large
population is still a large count (200) — rate and count are different questions, and the lesson
turns on not confusing them.

Every ratio was verified by cross-multiplication in the script before writing, including each
*shown* row (a decorative row that broke the ratio would teach a false pattern), plus that the
target sits on the `bStep` lattice and within `bMax`.

### Declined, with reasons

- **sp-01-01/i2, sp-01-03/i3** — "which sampling method is least biased?" is a judgment task, the
  legitimate-KEEP class documented for `cx-`/`cp-`/`gf-`. `samplingBiasLab` exists but answers a
  different question (watching a biased frame distort an estimate); neither step asks it.
- **sp-02-02** — its i1/i2 interpret ALREADY-DRAWN dot plots ("what does this overlap suggest?").
  That is reading a display, not manipulating one; converting would draw a plot the learner does
  not control. i3 is arithmetic on given means.
- **sp-03-02** — relative frequency from a FIXED reported outcome (6 heads in 10 flips). A
  simulation engine would generate its own trials and contradict the authored numbers.

### Measurement

Tier **A 481 → 484 · C 341 → 338**. The leverage metrics moved hardest this pass:
**C-only load-bearing concepts 105 → 100**, upgrade backlog 101 → 98, K–8 Tier A 264 → 267.

### Validation

Content-only (three lesson JSONs; no source file touched since the fourth pass's full validation).
validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration consistent ·
`content.test.ts` + `content.widgets.audit.test.ts` 13/13. Build and Playwright stand from the
fourth pass, which validated an identical source tree.

## S119, sixth pass — tm-03-02, and two G8 lessons with no honest home

| Lesson | Rank | Step | Change | Tier |
|---|--:|---|---|---|
| tm-03-02 | 22 | i1 | `numeric` → `triangleAngleLab` + predict | D (24) → **A (35)** |

**The word doing the work was `ANY`.** The lesson's concept step states the invariant outright —
*"The three angles inside ANY triangle always add up to 180°. Know two of them and you can find the
third by subtracting."* Its i1 then asked the subtraction (40 + 60 → 80) in a numeric box. One
arithmetic question cannot establish a claim about *every* triangle, because one triangle is not
evidence about all of them.

`triangleAngleLab` was built for precisely this: deform the triangle by dragging a vertex while all
three angle readouts and their total update live. The sum is **the thing that refuses to move while
everything else does**, which is what an invariant is. A 35/39 — the highest single-lesson score
this session, because the lesson's own concept and the engine's own purpose are the same sentence.

**Reachability verified on the widget's own 0.25 drag lattice**, recomputing the angle from
coordinates rather than importing the widget's helper (so a bug there could not certify itself):
target A = 40° is reachable to within **0.03°** at C = (7.25, 6.25), well inside the authored 3°
tolerance, and the three angles sum to 180 to within 2.8 × 10⁻¹⁴ at every lattice point swept.
`scripts/measure/tm-reach.ts` keeps that check runnable.

### Two declined, each for a reason in the engines

- **tm-03-03 (Angle-Angle Similarity)** — AA is a claim about **two** triangles, and no registered
  engine draws two. `triangleConstraintLab`'s criterion enum is SSS/SAS/ASA/AAS/HL/SSA: congruence
  criteria, with AA absent *by construction* since AA does not give congruence. `dilationExplore`
  draws a shape and its scaled image, which **presumes** similarity rather than testing it — the
  learner would be asked to decide whether two triangles are similar while looking at a picture
  that already assumed they were.
- **tm-05-01 (Volume of a Cylinder)** — `volumeBuilder` builds rectangular prisms (l × w × h) with
  no circular base. `solidSliceLab` grades a slice **position**, and every cross-section of a
  cylinder is identical, so no position is distinguishable from any other and `targetFraction`
  would be arbitrary. A cylinder-volume lab (drag r and h, watch πr²h accumulate) is a genuine
  engine gap, not a conversion.

### Measurement

Tier **A 484 → 485 · D 50 → 49**. **C-only load-bearing concepts fell below 100 for the first
time: 100 → 99.** Backlog 98 → 97, K–8 Tier A 267 → 268.

### Validation

validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration consistent ·
content test files 13/13. Content-only; build and Playwright stand from the fourth pass's
identical source tree.

## S119, seventh pass — the sy- cluster, and an engine build abandoned on reading

I opened this course intending to build the two-triangle comparison mode: `tm-03-03` needs one, and
the playbook assigns the `sy-` criteria lessons to `triangleConstraintLab`. **Reading the eleven
Tier-C lessons first changed the plan entirely.** Most are not criterion questions at all — they
are **proportions**: corresponding sides, shadow heights, map scales. And the constant ratio is the
whole of what similarity means.

`ratioTable` shows exactly that — known rows fixed, one value set by the learner, the ratio holding
down the column while both numbers grow. Registered, used twice already this session, **no engine
work**.

| Lesson | Step | Proportion | Tier |
|---|---|---|---|
| sy-01-02 | i2 | 6 : 9 = 8 : 12 | C (23) → **A (34)** |
| sy-05-01 | i1 | 4 : 6 = 20 : 30 (shadow : height) | C (23) → **A (34)** |
| sy-05-02 | i1 | 1 : 50 = 8 : 400 (model : real) | C (22) → **A (33)** |

**sy-01-02 is the one that earns its place.** Its authored `commonErrors` already name the
misconception precisely — *"11 = 8 + 3 adds the DIFFERENCE (9 − 6). Similar sides scale by a
RATIO"* — and a numeric box could only say so after the fact. In the table, the learner watches
6→9, 2→3 and 8→12 all carry the same multiplier, so "add 3 to every side" stops being a rule to
avoid and becomes a pattern that visibly does not hold in the rows above.

Every proportion was cross-multiplied before any write, **including each shown row** (a decorative
row that broke the ratio would teach a false pattern), plus lattice and bound checks on the target.

### Declined, with reasons

- **sy-02-01/i1, sy-02-02/i2** ask for a **ratio or scale factor** as the answer (1.5; 3).
  `ratioTable` grades a scaled *value* in column B, not the ratio itself, so converting would
  silently change what the step asks. A ratio-readout mode would fit — that is engine work.
- **sy-04-01, sy-04-02** are the altitude-to-hypotenuse family (three similar triangles, geometric
  mean). The relationship holds between three *nested* triangles sharing an altitude; no registered
  engine draws that configuration, and a proportion table would assert the very correspondence the
  lesson exists to establish.
- **sy-01-03/i1** is the 180° sum (40 + 75 → 65). `triangleAngleLab` fits the arithmetic, but the
  lesson's subject is that *two triangles sharing two angles share the third*. A one-triangle lab
  would show the sum without showing the sharing, which is the actual claim.

### On the abandoned engine

The two-triangle mode is still the right fix for `tm-03-03` and for `sy-02-*`'s criterion
questions. What changed is its measured return: from "eleven C lessons plus a D" down to roughly
four, because most of the eleven were served better by a table that already exists. That is worth
recording as a method note — **the size of an engine's backlog should be measured by reading the
lessons, not by counting the tier column.**

### Measurement

Tier **A 485 → 488 · C 338 → 335**. Backlog 97, C-only load-bearing 99.

### Validation

validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration consistent ·
content test files 13/13. Content-only; build and Playwright stand from the identical source tree.

## S119, eighth pass — smg1-02-03, and a measured survey of the Grade 1 course

| Lesson | Rank | Step | Change | Tier |
|---|--:|---|---|---|
| smg1-02-03 | 25 | i1 | `numeric` → `fractionBar` + predict | C (22) → **A (33)** |

*"How many fourths make one half?"* was a question about a picture, answered in a numeric box. The
bar answers it directly: add fourths one at a time and watch the second land **exactly on the half
mark**. Nothing is computed; the equivalence is seen. Copy written for six-year-olds — short
sentences, concrete words, no algebra vocabulary.

Verified before writing: 2/4 = 1/2 exactly, and neither trap shares the target's value (1/4 = 0.25,
4/4 = 1 against 0.5) — which the integrity gate independently requires.

### The other four Grade 1 lessons: declined, both for the same class of reason

- **smg1-01-01 / 01-02 / 01-03** count a shape's sides, faces and corners. `tapDiagram` is the only
  tap-to-count engine, and reading a real usage settles it: it places **icons at coordinates on a
  blank canvas** and never draws the figure. *"Tap each side of the triangle"* would present no
  triangle — the learner would be counting floating markers. The honest fix is a shape-parts mode
  that draws the polygon or solid and makes its own sides and vertices tappable.
- **smg1-03-02** asks *"how many MORE"* (a 5-paperclip pencil vs a 3-paperclip eraser).
  `lengthCompare` draws precisely that picture, per-unit tick marks included — but its `pick` mode
  grades **which bar is tapped**, not the difference between them. Converting would grade "the
  pencil" when the lesson asks for 2.

Both declines share a shape worth naming: **the engine draws the right picture but grades the wrong
quantity, or grades the right quantity without drawing the picture.** Neither is fixable by
authoring, and neither is a reason to ship a lesson that asks one thing and scores another.

### Measurement

Tier **A 488 → 489 · C 335 → 334**. C-only load-bearing concepts 99 → **98**; backlog 97 → **96**.

### Validation

validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration consistent ·
content test files 13/13.

## S119, ninth pass — `lengthCompare` difference mode, and two defects found by the gates

### The engine gap, stated exactly

`lengthCompare` already drew the right picture — two tick-marked bars — and graded the wrong
quantity. Its `pick` mode grades **which bar** the learner taps. "How many more?" is not a question
about which bar is longer; it is a question about the **gap**. Six steps across three K–2 lessons
sat in numeric boxes beside a comparison they could not touch.

Difference mode grades the gap and shades it: both bars from a shared baseline, unit ticks on each,
and the stretch by which the longer overhangs drawn in dashed tangerine. Comparison subtraction
stops being an arithmetic step performed away from the picture and becomes the picture's own
measurement.

**The commonest error is a reachable state, and the gate keeps it reachable.** Counting the whole
longer bar instead of the overhang gets its own diagnosis (`countsWholeFeedback`), and the
integrity gate **refuses any `diffMax` below the longer bar's length** — a ceiling that clamped
that count out of the slider's range would turn the diagnosis into dead copy.

Nine integrity refusals in all: exactly two items; a `unitLabel` (a gap in units cannot be counted
off unmarked bars); a shared baseline; whole-unit lengths; a `targetDifference` that actually
equals the bars' difference; non-equal bars; `answerId` naming the **longer** bar; a reachable
`diffMax`; and `countsWholeFeedback` outside difference mode rejected as dead copy.

### Conversions

| Lesson | Steps | Change | Tier |
|---|--:|---|---|
| smg1-02-03 | i1 | `numeric` → `fractionBar` (eighth pass) | C (22) → **A (33)** |
| smg1-03-02 | i1, i2, i3 | `numeric` → `lengthCompare` difference | C → **A (31)** |
| mmt-02-02 | i2, i3 | `numeric` → difference, + predict | C → **A** |
| mmt-05-03 | i2 | `numeric` → difference, + predict | C → **A** |

Both `mmt-` lessons landed at B (27, 28) on conversion alone — `prediction: 0` was the sole missing
A-gate — so a predict was added to each lab step, with the widget asserted byte-identical across
the edit. Every difference was recomputed from the two lengths in the script *and* re-derived
independently by the integrity gate.

### Two defects the gates found

**1. A duplicate-key bug in `covariationScrubber`** — a widget this session never touched, surfaced
by a React warning during the keyboard sweep. Its five-row value window clamped each cell
independently, so at a bound it collapsed: `x = 0` with `inputMin = 0` produced `[0, 0, 0, 1, 2]`.
Duplicate React keys (which React warns "may cause children to be duplicated and/or omitted") and
**three identical rows in a table whose entire purpose is showing neighbouring values**. Fixed by
sliding the window rather than squashing it, with an exhaustive regression test sweeping every
`x` across every bound pair in range.

**2. The capability gate caught an over-rating — mine.** The difference component originally wired
`onEvent`, and `engineCapabilities.test.ts` enforces `onEvent wired ⟺ adapt === 3` **per widget
type**. But `lengthCompare`'s pick and align modes cannot emit direction events at all: a
categorical bar-tap has no ordinal target for `moveRelation`. Rating the type `adapt: 3` would have
credited every existing pick and align lesson with process evidence it does not have — precisely
the flattery that table exists to prevent.

The wiring was removed rather than the gate weakened or the number inflated, and the component
carries a comment explaining why, so it is not "helpfully" re-added later. Worth recording as a
contract note: **capability ratings are per TYPE, so instrumenting one mode of a multi-mode engine
makes a claim on behalf of every other mode.**

### Measurement

Tier **A 489 → 492 · C 334 → 331**. C-only load-bearing concepts **98 → 94**; backlog 96 → **93**;
K–8 Tier A 269 → 272.

### Validation

typecheck 0 errors · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · keyboard gate 106/106 · new suite 25/25 · build EXIT 0 · **Playwright 47/47** ·
full vitest **8573 passed, 76 failed with the failing file set byte-identical to the known
`better-sqlite3` bindings set** (diffed). Passing 8548 → 8573 = +25, exactly the new suite.

## S119, tenth pass — `shapeParts`: counting by touching

### The gap, and why `tapDiagram` could not fill it

"How many sides does a hexagon have?" was a numeric box beside **no hexagon**. A six-year-old
answers that question by putting a finger on each side in turn and keeping track — which is a
manipulation, and which is also precisely how the counting principles (one-to-one correspondence,
cardinality) are meant to be practised. `tapDiagram`, the only tap-to-count engine, places icons at
coordinates on a blank canvas: it would have asked a child to tap the sides of a triangle that was
not drawn.

`shapeParts` draws the figure and makes its own parts the targets. Five shapes — polygon (3–10
sides), cube, rectangular prism, square pyramid, cylinder — with `sides`/`corners` for the flat
one and `faces`/`vertices` for the solids, so each lesson keeps its own vocabulary. Solids are
drawn in oblique projection with the hidden edges dashed, so the corners round the back are
findable rather than invisible.

### Grading is SET-based, and that is the whole point

The value is the list of parts tapped, not a total. A bare number cannot distinguish **six** from
**"counted one corner twice and missed another"** — a set can, and that distinction is exactly what
counting by touch is supposed to teach. `doubleCountFeedback` fires on the repeat; `missedFeedback`
on stopping early. The suite pins the case directly: `[0, 0, 1, 2, 3, 4]` is six taps on a hexagon
and is **not** correct.

### Conversions — 11 steps across 5 lessons

| Lesson | Steps | Tier |
|---|--:|---|
| smg1-01-01 | i1, i2, i3 | C → **A (33)** |
| smg1-01-02 | i2, i3 (+predict) | C → **A** |
| smg1-01-03 | i1, i2, i3 | C → **A (33)** |
| ssg2-01-01 | i1 | C → **A (33)** |
| ssg2-01-02 | i1, i2 | C → **A (33)** |

**Every derived count was checked against the lesson's own authored answer before writing** —
`shapePartCount(shape, sides, part)` had to equal `widget.answer` for all eleven steps, or the
script aborted. The engine and the curriculum agree by verification, not by assertion.

### The keyboard gate caught a real accessibility downgrade — mine

The first renderer used `<g role="button" tabIndex={0}>` inside the SVG. `auditNativeControls`
rejects that outright: *anything presented as pressable must BE a button, and anything
focus-managed must be native.* The gate is right — a role shim only imitates the focus, activation
and pressed-state semantics a real `<button>` gets for free.

Rewritten so the SVG is purely presentational (`aria-hidden`) and every tap target is a **real
`<button>`** positioned over the figure, each with a 44px minimum box and its own accessible name
(`"side 1"`, `"vertex 3"`). Better than what I first wrote, and the gate is what forced it.

### Euler's formula as an independent check

The suite verifies every solid against **V − E + F = 2** rather than only checking table entries
one at a time — a constraint on the whole table that would catch a plausible-looking wrong count.

### Measurement

Tier **A 492 → 497 · C 331 → 326**. C-only load-bearing concepts **94 → 90**; backlog 93 → **88**;
K–8 Tier A 272 → 277.

### Validation

typecheck EXIT 0 · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · all five registration-contract gates 38/38 · keyboard 107/107 · new suite 25/25 ·
build EXIT 0 · **Playwright 47/47** · full vitest **8600 passed, 76 failed with the failing file
set byte-identical to the known bindings baseline** (diffed). Passing 8573 → 8600 = +27.

## S119, eleventh pass — `radiusScale`: the circle that responds

### The gap, named by the lesson itself

`g7-02-03`'s concept step states the misconception outright: *"Circumference and area are the
classic mix-up: **C = 2πr doubles, A = πr² squares**."* That is a claim about how two quantities
**respond** to a change in r — and a response cannot be shown by a fixed diagram. All three
existing `circleMeasureExplore` modes hold the circle still and move something inside it
(a chord, a tangent, an arc). `radiusScale` moves the circle.

Drag r and the three measures recompute side by side, so the coefficients visibly pull apart:
double the radius and the circumference doubles while the area quadruples. **Every readout stays an
exact integer** — d = 2r, and the π-coefficients 2r and r² — so nothing on screen is rounded, the π
is carried symbolically, and the grade is integer equality on the radius.

| Lesson | Step | Asks | Tier |
|---|---|---|---|
| g7-02-01 | i1 | diameter 10 | B (27) → **A (31)** |
| g7-02-02 | i1 | circumference 10π | D (24) → **A (31)** |
| g7-02-03 | i1 | area 25π | D (24) → **A (31)** |

All three lessons turn on r = 5 and differ only in which measure they want, so one mode serves all
three. **Each derived value was re-checked against the lesson's own authored answer before writing**
(10, 10, 25), and each kept its authored predict byte-for-byte.

The integrity gate refuses `targetRadius < 3`, because at r = 2 the two coefficients coincide
(both 4) and at r = 1 they are 2 and 1 — neither shows the divergence the mode exists to teach.
The suite proves r = 2 is the *only* coincidence in range rather than asserting it.

### Two regressions I caused, both caught by existing gates

1. **`correctAnswerText` for the three pre-existing modes.** My edit replaced `"a length of 8"`
   with `"8"`. `evaluate.new.test.ts` failed on the exact string. Restored verbatim — a reminder
   that rewriting a whole `case` to add one branch risks the branches already there.
2. **The solvability gate reported all three new lessons UNSOLVABLE.** Its input model didn't know
   `radiusScale`'s domain (the radius over `[1, radiusMax]`) and was falling through to the
   arc-angle range, so no candidate it tried could ever grade correct. **I extended the model, not
   the assertion** — the gate still proves every widget is solvable; it just now knows this mode's
   real input space. Weakening the assertion would have silenced a gate that was doing its job.

Both confirmed resolved: the failing file set diffs byte-identical to the environmental baseline.

### A limitation of the shared keyboard gate, worth recording

`byType` takes the **first** sample of each widget type, and an earlier `chordDistance` sample
already claims that slot — so the shared keyboard gate never exercises `radiusScale`. The keyboard
drive for this mode therefore lives in its own suite. This applies to every multi-mode engine: a
new mode added behind an existing sample is invisible to the shared gate, and must carry its own
keyboard coverage.

### Measurement

Tier **A 497 → 500** (crossing 500 for the first time) · **D 49 → 47** · C-only load-bearing
90 → **88** · backlog 88 → **86** · K–8 Tier A 277 → 280.

### Validation

typecheck 0 errors · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · contract gates 116/116 · new suite 29/29 · build EXIT 0 · **Playwright 47/47** ·
full vitest **8624 passed, 76 failed with the failing file set byte-identical to the known
bindings baseline** (diffed).

## S119, twelfth pass — round solids, and three regressions the gates caught

### The engine

`volumeBuilder` built rectangular prisms only. The three G8 lessons it could not serve sit in a
relationship that three formulas on a page cannot show: at r = 3, h = 4 a **cylinder** is 36π and a
**cone** is exactly a third of it, 12π — while a **sphere** of the same radius is 36π *again*.

Those coincidences are the content, and they are only visible if the volumes stay exact. 12π
against 36π reads as a third at a glance; 37.699 against 113.097 does not. So the π-coefficient is
carried as a **reduced fraction**, never a decimal.

| Lesson | Solid | Volume | Tier |
|---|---|---|---|
| tm-05-01 | cylinder r=3 h=4 | 36π | D (24) → **A (33)** |
| tm-05-02 | cone r=3 h=4 | 12π | C (24) → **A** |
| tm-05-03 | sphere r=3 | 36π | B (26) → **A** |

`solid` defaults to `"prism"`, so every existing spec is untouched — asserted first in the suite.
Each derived coefficient was checked against the lesson's own authored answer before writing, and
the cone and sphere predicts were written to make the comparisons explicit ("how does the cone
compare?", "more or less than the 36π cylinder?").

### Three regressions, all mine, all caught

**1. A duplicate `case "volumeBuilder"` in the integrity switch.** I added a second case rather than
extending the first. TypeScript accepts this silently, and the first case wins — so **every
existing prism lock-reachability check became dead code**. `constrainedBuilders.s51` caught it by
asserting a specific error string that had stopped being produced. Merged into the original block,
with the round solids taking an early `break` since every check below concerns an l/w/h lattice a
cylinder does not have. This is the most dangerous defect of the session: it disabled a working
gate without failing anything that named the new code.

**2. A stack overflow from a negative-form route check.** The router tested
`spec.solid !== "prism"`, so a spec that skipped zod's defaults (`solid === undefined`) took the
round branch, received l/w/h values, and produced `NaN` — which recursed forever in the gcd.
Fixed twice over: the router now tests **positively** for the three round solids (failing toward
the older behaviour), and `roundSolidCoef` returns `{0, 1}` on non-finite input instead of
recursing.

**3. A ghost-testid collision.** My `rs-ghost` shared the `rs` prefix with `RiemannSumW` — exactly
the collision class `widgets.revealGhost.s103` exists to prevent. Renamed to `vbr-ghost`, and the
chip switched to the shared `GhostChip` so its aria-hidden treatment matches every other engine.

### The capability contract, applied a second time

The router's introduction hid `onEvent` from `engineCapabilities.test.ts`, which reads a
component's body to decide whether its type may claim `adapt: 3`. Two things were needed to make
the existing rating **true** rather than merely passing: the router destructures and forwards
`onEvent` explicitly (a spread would have hidden it), and the round branch genuinely emits, judging
direction on the **volume** each move produces rather than on the raw slider — a wider radius is not
"toward" the target if it overshoots. Both modes now emit, so `adapt: 3` is honest for every
lesson using the engine.

### Measurement

Tier **A 500 → 503 · D 47 → 46 · C 326 → 325**. C-only load-bearing 88 → **86**; backlog 86 → **84**;
K–8 Tier A 280 → 283.

### Validation

typecheck 0 errors · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · new suite 20/20 · contract gates green · build EXIT 0 · **Playwright 47/47** ·
full vitest **8644 passed, 76 failed with the failing file set byte-identical to the known
bindings baseline** (diffed).

---

# S119 — THREE MATHEMATICAL RELEASE BLOCKERS

Each of these shipped a **false mathematical claim**. None was a tier problem, a polish problem or
a coverage problem: in each case the engine told a learner something untrue. All three are fixed,
each with an adversarial suite that fails against the old behaviour.

## Blocker 1 — inequality solution-set equivalence

**The defect.** `solveBalance` graded an inequality by weighing the beam at ONE witness value.
`2x + 3 > 11` has solution set `x > 4` and was weighed at x = 5 — so a learner landing on **`x > 3`
was checked as 5 > 3, true, and marked correct**. The same hole accepted `x ≥ 4` for `x > 4`, and
accepted any one-sided operation whose damage happened to miss the sampled point. A single sample
is not a proof of set equality and never was.

**The fix.** Every claim is reduced to a canonical solution set and compared **as a set**:
`solveBalanceSet(coefX, units, rhs, rel)` returns a half-line with a reduced-fraction boundary, a
point, all-x, or no-x. The comparator reversal on division by a negative lives in that one function,
so no caller can forget it. The boundary is exact integer arithmetic — never a float — so no
comparison can drift. Correctness is now `solveBalanceSetsEqual(trueSet, learnerSet)`.

**Diagnosis is preserved and sharpened.** Same boundary with wrong direction or strictness is a
*comparator* fault and keeps its own message; anything else that changed the set is a broken
transformation and gets the other. The beam still tilts at a witness — that is the visual — but the
visual no longer decides correctness.

**A regression the solvability gate caught during the fix:** with `holds` now meaning set-equality,
a state with no x left failed set-equality first and returned the generic "unbalanced" message,
making the specific "you removed the x-tiles" diagnosis unreachable in tse-04-01/02. The
zero-coefficient case now resolves before the generic branch.

**Adversarial suite** (`solveBalance.solutionSet.s119.test.ts`, 25 tests) covers every case
requested: `x > 3` for `x > 4`; `x ≥ 4` for `x > 4`; reversed symbols; one-sided operations;
a transformation that preserves the witness but not the set (`2x > 9` agrees at x = 5 and differs
below); multiplication and division by negatives, with and without the reversal; inclusive
comparators and the boundary value that separates `≤` from `<`. Several tests assert **that the old
check passed** the wrong answer, so the hole itself is pinned, not just its absence.

## Blocker 2 — unit-circle causal representation

**The defect.** The wave view drew the point at (cos g, sin g) and ran ONE vertical leader line
from that point's height to the graph, with a source comment asserting *"the point's height IS the
trace value"*. That is true for sine and **false for the other two**: cosine is the point's
horizontal coordinate, and tangent is not a coordinate of the point at all. Two of three functions
were taught with a false causal picture.

Two further faults sat alongside it. The circle's radius was multiplied by `|amplitude|`, so a
"unit circle" was drawn at radius 2 or 3 — the figure stopped being the thing it was named. And the
graph's y-scale divided by `max(|amplitude|, 1)`, which **exactly cancelled the amplitude it was
supposed to display**: amplitude 1 and amplitude 2 drew identical heights.

**The fix.** `ucCircleQuantity(trace, genDeg)` gives the raw quantity each trace actually comes
from, and `ucTransferGeometry` gives the construction that reads it:

- **sine** — vertical: the point's own height.
- **cosine** — horizontal: the point's x-coordinate, carried to the axis by a genuine quarter-turn
  arc, never by pretending it was already vertical.
- **tangent** — the tangent-line construction: the ray through the point extended to the vertical
  line x = 1. Reported **undefined** at the asymptotes rather than drawn at a clamp.

The circle is now a unit circle at every amplitude. Amplitude and midline are applied on the way
OUT to the graph, which is where they act: amplitude stretches the emitted ordinate (and its sign
reflects it), midline displaces the trace and its axis together on a shared scale.

**Invariant suite** (`unitCircleCausal.s119.test.tsx`, 54 tests): every expected value computed from
`Math.sin/cos/tan` in the test, never from the engine. Key angles and quadrantals; the Pythagorean
identity across the circle; tangent equals sine over cosine wherever defined; the composition law
`ucWaveY = amp × ucCircleQuantity + midline` across seven parameter combinations; phase of 90°
turning sine into cosine exactly; and render assertions that cosine draws the arc and not a vertical
drop, tangent draws the tangent line, and the circle's radius does not change with amplitude.

## Blocker 3 — triangle-constraint geometry

**The defect, and it was the worst of the three.** The lab computed its displayed angles from a
formula unrelated to the triangle it drew. Released from the isosceles lock it used
`otherBase = 180 − apex − baseAngle × 0.72` — an arbitrary factor. At an apex of 60° that displays
**60 + 60 + 76.8 = 196.8°**: an impossible triangle presented to a learner as fact.

The midsegment mode was worse. Both readouts were the constant `spec.sideA / 2`, derived from no
geometry at all, and the segment was never drawn between midpoints. Releasing the "locked to the
midpoints" control changed the caption and **not one number**.

**The fix.** `triangleConstraintModel` builds the actual vertices and derives everything from them.
Angles come from the coordinates by the law of cosines, so they sum to 180 **by construction**
rather than by hope. Locked, both legs are `sideB` and the base angles are equal as a fact of the
coordinates; released, the second leg becomes `sideA`, the triangle is genuinely scalene, and the
base angles diverge while still summing correctly with the apex. The midsegment is measured between
the points it is actually drawn between: at t = 1/2 its length is exactly half the base; released to
t = 0.35 it is 0.35 of the base, and the number visibly stops being half.

**Adversarial suite** (`triangleConstraintGeometry.s119.test.tsx`) compares the four things the
brief names — geometric coordinates, displayed labels, evaluator result and success feedback — and
asserts they agree, including that angles sum to 180 across the whole angle range in both lock
states, and that the old 0.72 formula would have failed.

## Validation

typecheck 0 errors · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · the three blocker suites **115/115** · build EXIT 0 · **Playwright 47/47** ·
full vitest **8899 passed, 76 failed with the failing file set byte-identical to the known
`better-sqlite3` bindings baseline** (diffed) — **zero regressions**.

## S119 — post-blocker audit, and a gate that reaches every sample

### The audit: searching for more of the blocker class

All three release blockers shared one shape — **a displayed value that did not derive from the
engine's own truth model**. That is a class, not three accidents, so the first thing after fixing
them was to look for more.

Two systematic sweeps:

1. **Truth functions the grader uses that the renderer ignores.** Cross-referenced all 30 exported
   truth functions in `schema.ts` against both files. Result: the only two the renderer does not
   call are `solveBalanceSet` and `solveBalanceSetsEqual`, which are grading-only by design — the
   beam's tilt at a witness is the visual, and correctness is the set comparison. Everything else
   is shared. **Clean.**
2. **Arbitrary factors in displayed quantities** — the `× 0.72` pattern that produced the impossible
   triangle. Everything the grep surfaced is a legitimate visual scale (clock hand lengths at
   `R × 0.8`, bar insets, arc radii), not a mathematical claim. `triangleSolve` was read directly
   and is sound: its drawn coordinates come from the same `lawOfCosinesAngle` the grader uses.
   **Clean.**

Reporting a clean audit as a result rather than quietly moving on: the absence of further defects
of this class is worth knowing, and the two sweeps are repeatable.

### The gate that only tested one sample per type

`widgets.keyboard.test.tsx` resolves specs with `byType`, which takes the **first** sample of a
widget type. Fine when each type had one sample; not fine now. **Six modes added this session sit
behind an existing sample of the same type** — `numberLineHop` rational and hop-size,
`lengthCompare` difference, `circleMeasureExplore` radiusScale, `volumeBuilder` round solids,
`shapeParts` cube — and the shared gate never rendered one of them.

The "drive it to correct" half genuinely needs per-mode steps and stays where it is. The
**operability** half does not: whether a control is a real element, reachable, named, and driveable
is universal, and can be swept across every sample there is.

`allSamples.operability.s119.test.tsx` — **702 assertions across every gallery sample**:
renders without throwing; no role-shimmed controls (the `<g role="button" tabIndex>` defect written
for `shapeParts` earlier this session is caught here on ANY sample, not just the first of its type);
every button and range input carries an accessible name; every slider has a non-empty, non-inverted
range with its value inside it; and touch-target sizing.

### A false positive I caught in my own test, and what I did about it

The first version of the touch-target check flagged three samples. Two were **my regex being
wrong** — `min-h-14` is 56px, comfortably above the 44px floor, and my pattern only matched
`min-h-11|12`. The third, `fractionCompare`, uses buttons sized by the fraction bar they wrap.

jsdom has no layout engine, so no test here can measure a rendered height. Rather than ship a gate
with known false positives, or weaken it into meaninglessness, the check is **scoped to what it can
actually prove**: a button either declares a height utility of at least 44px, or it wraps
substantive content that carries its own height. A bare-text button with neither is the genuinely
risky case, and that is what it asserts — with the limitation written into the file.

Claiming to verify more than is verifiable would have been the same kind of false claim this
session spent its time removing.

### Validation

typecheck 0 errors · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · new sweep 702/702 · build EXIT 0 · **Playwright 47/47** · full vitest
**9601 passed, 76 failed with the failing file set byte-identical to the known bindings baseline**
(diffed) — zero regressions. The suite grew 8899 → 9601 = +702, exactly the new sweep.

## S119 — the fraction lattice on `ratioTable`, and closing the last batch item

### The gap

`pr-01-01` and `pr-01-03` are unit-rate lessons — "1/2 mile in 1/4 hour", "5/8 mile in 5/16 hour" —
and were declined earlier this session for a fidelity reason found by reading the renderer:
`doubleNumberLine`'s formatter renders a non-integer as `Math.round(n * 100) / 100`, so a
quarter-hour tick reads **0.25**. In a lesson titled *"Dividing by a Fraction"*, a decimal axis
sidesteps the subject.

### The fix, reusing a piece already proven

The same `denom` idea built and tested for `numberLineHop`'s rational lattice applies directly:
every value on the spec is read as a **count of 1/denom units**, and the axis renders true fractions
through `hopLabel` — the shared truth function whose 18-test suite already proves it never emits a
decimal point across denominators 2–12. Nothing new had to be invented; the piece existed.

| Lesson | Steps | Lattice | Tier |
|---|---|---|---|
| pr-01-01 | i1 | quarters (`denom: 4`) | C → **A** |
| pr-01-03 | i1, i2 | sixteenths, twentieths | C → **A** |

Tier **A 503 → 505**; C-only load-bearing 86 → **84**; backlog 84 → **82**.

### The operability sweep caught its own blind spot

Immediately after adding the mode, the sweep built last pass reported that **no gallery sample used
`denom` at all** — so neither fraction-lattice mode (this one or `numberLineHop`'s) was being
rendered by it. A mode with no sample is invisible to every sample-driven gate, which is the same
first-only limitation in a different disguise. Samples added for both; the sweep now runs
**738 assertions** and exercises them.

That is the sweep doing exactly what it was built for, one pass after being built.

### A Playwright failure that was NOT a code defect — and how that was established

The first run after this change returned `PWEXIT:1` with only 3 tests passing and
`net::ERR_CONNECTION_REFUSED`. The runner's curl gate had already proved the server live (HTTP 200
after two probes), so the server died *during* the run — the documented memory-pressure failure in
this 3.9 GB microVM, immediately following a production build.

Rather than assume, it was re-run on a clean server: **47/47 in 1.8 minutes**, the healthy-run
signature. Recorded because "Playwright failed" and "Playwright could not stay up" look identical in
a log tail and mean completely different things.

### Validation

typecheck 0 errors · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · fraction-lattice suite 26/26 · operability sweep 738/738 · build EXIT 0 ·
**Playwright 47/47** · full vitest **9656 passed, 76 failed with the failing file set
byte-identical to the known bindings baseline** (diffed) — zero regressions.

## S119 — three clean audits, and `functionMachine` gains a second machine

### The audits: looking for more of the blocker class

The three release blockers shared one shape, so before building anything the codebase was swept for
more of it. Three sweeps, all **clean**:

1. **Truth functions the grader uses that the renderer ignores.** All 30 exported truth functions
   cross-referenced against both files; the only two the renderer does not call are
   `solveBalanceSet`/`solveBalanceSetsEqual`, grading-only by design.
2. **Arbitrary factors in displayed quantities** — the `× 0.72` pattern that produced the impossible
   triangle. Everything surfaced is legitimate visual scaling. `triangleSolve` read directly and
   found sound: its coordinates come from the same `lawOfCosinesAngle` the grader uses.
3. **Universal claims graded by sampling** — blocker 1's own class, which had not been swept. The
   strongest lead was `unitCircleExplore`'s ghost mode, which grades identities from
   `UC_TRUE_FORMULAS`, a hand-maintained set. That set turns out to be **verified, not merely
   declared**: an existing sweep checks every formula across every angle and asserts the true ones
   coincide below 1e-9 while the impostors detach above 0.1.

Recording clean results deliberately. The absence of further defects of a class that produced three
release blockers is worth knowing, and all three sweeps are repeatable.

### The engine gap

`ft-04-01`, `ft-04-02` and `ft-04-03` were all **Tier D 24**, and all about two functions joined —
`(f + g)(3)`, `(f · g)(2)`, `f(g(4))`, and the formula for `f(g(x))`. Every one was a numeric box or
an mcq sitting beside a single machine that could not represent a second function at all.

`functionMachine` gains a second stage and a `join` saying how the two are wired:

- **`compose`** — series. The first machine's output becomes the second's input, and a **middle box**
  makes that hand-off visible. This is the ordering the lessons turn on.
- **`add` / `multiply`** — both machines fed the SAME input, their outputs combined. The same two
  machines, wired differently.

A `square` flag on each stage lets `f(x) = x²` be represented without inventing a general expression
parser — the stage computes `a·(x or x²) + b`.

| Lesson | Wiring | Tier |
|---|---|---|
| ft-04-01 | `add` — x² and 2x+1 at x = 3 → 9 + 7 = 16 | D (24) → **A** |
| ft-04-02 | `compose` — 4 → 8 → 11 | D (24) → **A** |
| ft-04-03 | `compose` — 3 → 4 → 16, showing (x+1)² not x²+1 | D (24) → **A** |

Tier **A 505 → 508 · D 46 → 43**.

### Adversarial tests

`functionMachine.chain.s119.test.ts` — 18 tests, every expected value computed **by hand in the
test**, never from `fmOutput`. The weight is on ORDER, because that is what the lessons are about:

- `f(g(4)) = 11` and `g(f(4)) = 14` asserted as **different numbers**, so an order-blind engine fails.
- Grading rejects the input that would hit the target under the wrong order.
- Combination **is** symmetric where composition is not — the contrast the lessons rest on, pinned.
- `fmStage(3, 2, 1, true)` is `2·9 + 1`, explicitly **not** `(2·3+1)²` — squaring the input, not the
  output.
- Backward compatibility first: a one-stage spec parses with no `stage2`/`join` injected and grades
  exactly as before.

The conversion script independently verified each target is reachable at **exactly one** input, so
no lesson can be satisfied by an unintended value.

### Gallery samples, because the sweep taught that lesson already

Two samples added — one `compose`, one `add`. Without them the operability sweep never renders the
new wirings, which is precisely the blind spot that sweep caught one pass earlier. Sweeps now run
**829 assertions**.

### Validation

typecheck 0 errors · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · chain suite 18/18 · sweeps 829 · build EXIT 0 · **Playwright 47/47** · full vitest
**9686 passed, 76 failed with the failing file set byte-identical to the known bindings baseline**
(diffed) — zero regressions.

## S119 — `quadraticExplore` process instrumentation: the highest-leverage fix of the session

### The finding

Five `qu-` lessons already used `quadraticExplore` steps and still sat at **Tier D 24** with
`manip conseq adapt` among their gaps — a signal pointing at the engine, not the lessons.
`engine-capabilities.json` had `quadraticExplore` at **`adapt: 0`** while comparable engines
(`functionMachine`, `lineExplore`) carry 3: the engine emitted no process events at all.

**18 lessons use this engine; 7 of them were Tier D.** One honest capability fix touches all of
them at once — by far the highest lessons-per-change ratio of any item this session.

The tempting shortcut was to edit the capability row directly. That is exactly the flattery
`engineCapabilities.test.ts` exists to prevent, and the identical trap hit twice already this
session with `lengthCompare` and `volumeBuilder`. So the claim was made **true** first — both the
vertex and roots branches now wire `onEvent` genuinely — and only then raised.

### Roots are interchangeable, and the signal has to respect that

`(x − 3)(x + 2)` and `(x + 2)(x − 3)` are the same parabola. A learner holding the right pair of
roots in the opposite order must never be told they are moving "away" from anything. Each root is
scored against whichever target it sits nearer to
(`rootTargets` picks the pairing — direct or swapped — with the smaller total distance), so a
correct-but-reversed pair reads as progress rather than a mistake.

The vertex branch reports both `h` and `k` together on a single drag, since dragging the vertex
point moves both at once — a fix that touches only one while breaking the other is now visible as
exactly that, rather than silently praised for the one it got right.

Per-control fixation copy was added for all five controls (`a, h, k, r1, r2`), each naming what its
own control does rather than a generic nudge — the S116 half-filled-table rule.

### Two rendering defects the escape-literal gate caught in this same change

Two of the new roots-form strings used `\u00b2`/`\u2212` inside **JSX text and a JSX attribute**,
neither of which interprets a `\uXXXX` escape the way a template literal does — so a learner would
have seen the literal six characters `\u00b2` on screen instead of a superscript 2, in the expanded
polynomial readout and the discriminant label. `noLiteralEscapes.s119.test.tsx`, the sweep built
earlier this session, failed immediately on the new sample. Fixed with the real Unicode characters
in both places; re-verified at 145/145.

### Adversarial suite

`quadraticProcess.s119.test.tsx` — 10 tests. Both forms are proven to emit for every one of their
controls; a move toward the target is reported `toward` and away as `away`; the interchangeable-
roots case is asserted directly (landing the reversed correct pair is never `away`); the process
copy is proven to differ from the generic fallback rather than merely exist, and every one of the
five per-control cues is proven distinct from the others.

Two authoring faults surfaced while writing it, both corrected: the test first drove a slider to
the value it already held, which a React controlled input suppresses — the identical trap hit
earlier this session in `binomialAreaLab`'s keyboard drive, now avoided by driving every control
through two genuinely different values; and a shared `drive` helper was first scoped inside one
`describe` block and unusable from another, hoisted to module scope.

### Measurement

Tier **A 508 → 515 · D 43 → 36**. The single largest Tier-D drop of any change this session.

### Validation

typecheck 0 errors · validate:content 1223/1223 · lint:pedagogy 1139/1139 · check-registration
consistent · capability gate green (the `adapt: 3` claim is now backed by both branches) ·
quadratic-process suite 10/10 · roots suite 23/23 (untouched) · escape gate 145/145 · full vitest
**9725 passed, 76 failed with the failing file set byte-identical to the known bindings baseline**
(diffed, confirmed on a clean restart after the runner died mid-suite) · build EXIT 0 ·
**Playwright 47/47**.

## S119 — `volumeBuilder` fractional edge (`denomL`), and a proven mathematical fact

### The gap, and why it fits a pattern already twice proven

`asv-05-02` ("Volume with Fractional Edges") asks for the volume of "1/2 × 2 × 3" and "1½ × 4 × 2".
`volumeBuilder` only counted whole unit cubes — there was no way to represent a half-unit edge at
all. `denomL` reuses the exact idea already proven this session for `numberLineHop.denom` and
`doubleNumberLine.denom`: the length slider's tick is a count of 1/denomL units, so the number on
screen stays the question's own number (a half reads "1/2" via the shared `hopLabel`, never "0.5"),
while `prismVolume(l, w, h, denomL)` keeps the arithmetic exact underneath.

| Lesson | Steps | Tier |
|---|---|---|
| asv-05-02 | i1 (1/2×2×3=3), i2 (1½×4×2=12) | D (24) → **A (33)** |

Both derived volumes were checked against the lesson's own authored answers before writing.

### The renderer draws the fraction honestly, not by faking whole cubes

The existing isometric view loops one full unit cube per integer tick on each axis. Forcing a
half-unit edge through that loop would mean drawing either a gap, an overlap, or an extra full
cube — three different false pictures. Rather than rework the isometric geometry for partial
slabs, a dedicated `FractionalPrismW` component draws a **length ruler** with real-fraction tick
labels and a dashed mark at every whole-unit boundary crossed — the exact idiom the `fractionBar`
fix used earlier this session, reused rather than reinvented — crossed with a flat grid for the
constant w×h cross-section.

### A mathematical fact proven by exhaustive search, not assumed

The first integrity rule made `wholeUnitFeedback` (the "you read the tick as a whole unit"
misconception) conditionally required, based on whether a given target was reachable via that
misreading. Building the adversarial test for the *unreachable* branch, hand-picked counterexamples
kept failing for a structural reason, so the search was made exhaustive instead: across
denominators 2–7 and dimension caps up to 19, including asymmetric and prime-flavoured bounds,
**zero** cases exist where an integer the fractional formula reaches is not also reachable as a
plain integer product in the same lattice. This is not a search-range artifact — it follows from the
raw achievable set (every product of three bounded integers) being intrinsically the larger set, so
anything the more restrictive fractional path reaches can always be repackaged as pure integers.

The rule was simplified to match this proven fact: `wholeUnitFeedback` is required *unconditionally*
whenever `denomL` is set, because the misconception is reachable whenever the lesson is solvable at
all. The search itself is preserved in the test suite as documentation, rather than asserted from a
comment the next person has to trust.

### Two authoring faults caught in my own test, both fixed rather than routed around

- A hand-picked "dead feedback" fixture that turned out to be mathematically impossible to
  construct — replaced with the exhaustive search above once the impossibility was understood.
- A `canCheck(s, null)` expectation that assumed the wrong contract; `volumeBuilder`'s `canCheck`
  is unconditionally permissive by pre-existing design (unrelated to this change), and the test was
  corrected to assert what the code actually does rather than what seemed intuitive.

### A render bug caught by the same test file

The length ruler sized itself from the *current* slider value rather than `spec.lMax`, so at the
default start position (`l = lStart`) it showed **zero** whole-unit boundary marks — a ruler that
grows as you drag instead of showing the full reachable range up front, the opposite of how a
physical ruler works. Fixed to size from `lMax`.

### Validation

typecheck 0 errors · validate:content unaffected (content-only steps use an already-registered
type) · fractional-edge suite 21/21 · operability sweep 878/878 (new sample added) · escape-literal
gate clean (one `\u00d7` written literally in JSX text caught and fixed in the same pass, identical
defect class to the quadratics pass) · full vitest **9752 passed, 76 failed with the failing file
set byte-identical to the known bindings baseline** (diffed) — zero regressions · build EXIT 0.

Playwright required two attempts: the first died mid-run with `ERR_CONNECTION_REFUSED` from test 25
onward, the server-under-memory-pressure failure documented earlier this session, not a code
defect — confirmed by the curl gate having proved the server live before the run started, and by a
second clean run passing in full.

## S119 — three more engine extensions, and a real defect the audit gate caught in its own patch

### `sequenceBuild` gains `geometricTerm`: a finite growing sequence, not the infinite series

`geometric` mode was already built for infinite converging series (ratio in tenths, a forever-sum).
The `fn-03-*` trio (nine steps total) needed something structurally different: a **finite** growing
sequence, aₙ = first·rⁿ⁻¹, with r a small whole number dragged directly. Sharing a name fragment
with `geometric` invited exactly the kind of silent misgrading this session has repeatedly found
elsewhere, so `geometricTerm` is a distinct mode with its own slider range (whole numbers 2–rMax,
not tenths) and its own target field (`targetTerm` at `atPosition`, not `targetSum`).

All nine steps converted (fn-03-01/02/03), all reaching **A**. The reframing that unified them:
"find the ratio" and "find term N" are the same drag-and-read task once `atPosition` is set — the
first collapses the formula to `first × r`, the rest just read further along the same curve.

### `quadraticExplore` roots form: seven more `qu-` lessons

The roots form (built earlier this session for the zero-product cluster) generalizes cleanly to
factoring, square-root solving, and the quadratic formula — every one of these is "find the two
x-intercepts," whatever method got you there. `qu-02-01/02-02/02-03/03-01/03-02/04-02/04-03`
converted, each equation's expansion re-derived from its roots via `rootsFormCoefs` and checked
against the authored coefficients before writing.

`qu-03-03` (the Discriminant) was deliberately **not** touched — its three steps ask for a
discriminant value and a solution *count* from standard-form coefficients, a different task shape
from "drag to the two roots," and forcing it through this form would answer a question the lesson
doesn't ask. It remains the one honest D in this cluster.

### `ratioTable` gains a fraction mode, closing the unit-rate items for real this time

Earlier this session, `pr-01-01`/`pr-01-03` were declined because `doubleNumberLine`'s formatter
rendered 1/4 as "0.25." A `denom` option was then measured against `doubleNumberLine`'s own step
lattice and found to fit only one of the three steps — the other two need sixteenths and
twentieths against a max step of 8. `ratioTable` has no step lattice at all (its rows are given
outright), so all three fit without that constraint. It now renders through the same `hopLabel`
already proven for `numberLineHop`'s rational lattice — one fraction formatter, reused a fourth
time this session, not reinvented.

`pr-01-01/i1`, `pr-01-03/i1`, `pr-01-03/i2` converted, all reaching A.

### A real defect: three steps opened pre-solved, caught by the solvability gate on its first real pass

The `fn-03` conversion script used a blanket `start: 2` for every `geometricTerm` step. Two of the
target ratios in this batch are also 2 — `fn-03-02/i3` and two steps in `fn-03-03` — so those three
steps opened already showing the correct answer. `content.widgets.audit.test.ts` caught all three
by name on its first pass over this content.

The fix needed care: `start` defaults to 1 in the schema, but the **renderer's slider has a
hardcoded `min={2}`** for this mode — setting `start` to 1 would have created a state/display
mismatch (the stored value below the slider's own floor) rather than a real fix. The three affected
steps were moved to `start: 5` instead — valid within [2, rMax], and independently verified against
`geometricTerm` to not coincide with any of their target ratios before the write. Every other field
in each step was asserted byte-identical before and after.

### Validation

typecheck 0 errors (confirmed before this pass, re-confirmed after the fix) · new suites 58/58
(`sequenceGeometricTerm`, `ratioTableFractions`, `quadraticRoots`) · solvability gate clean after
the fix (was reporting 3 pre-solved instances by name before it) · validate:content 1223/1223 ·
lint:pedagogy 1139/1139 · check-registration consistent.

Playwright needed two attempts earlier in this same stretch of work: the first died mid-suite with
`ERR_CONNECTION_REFUSED` from test 25 on (the server-under-memory-pressure failure documented
earlier this session — confirmed, not assumed, since the curl gate had proved the server live
before the run started); a clean re-run passed 47/47.

# Session 120 — the uptake audit: three capabilities that never reached a learner

The mandate was to review the playbook, say what is outstanding, and close it. The review is
`PLAYBOOK_STATUS.md`, regenerated from disk by `scripts/measure/playbook-status.mjs`; the closure
is eight conversions and one real defect.

## What the review found

All sixteen engine items in the playbook — the thirteen §8 enhancements plus `wave`/`ghost`/
`branch` and `extraneousRootLab` — are **built**. Blocks 1 and 2 are closed. That was already
known. What was not known is that **built and reaching lessons are different questions**, and the
tier report cannot tell them apart: a capability that no lesson calls is, from the learner's side,
indistinguishable from one that was never written.

Measured by parsing every lesson's widget block, three capabilities had almost no uptake:

| capability | lessons using it | playbook's estimate |
|---|--:|--:|
| (c) `triangleSolve mode:"ratios"` | 1 | ~10 |
| (e) `quadDrag.showMidsegment` | **0** | 2 |
| `coordinateProofLab` (not a §8 item) | 1 | 13+ |

(c) is the one that stings: the playbook calls ratio invariance under similarity "the only causal
fact in introductory trigonometry," the enhancement was built to show it, and `rt-03-01`,
`rt-01-03` and `rt-01-04` were sitting at Tier **D** with the engine on the shelf beside them.

## The defect: (e) was not neglected, it was unreachable

`showMidsegment` shipped with an integrity gate that rejected any shape `quadName` called
"just a quadrilateral". `quadName` has no trapezoid case. Every trapezoid it meets — isosceles,
right, any — comes back "just a quadrilateral", so **the gate refused the entire family the
trapezoid midsegment theorem is about.** Verified before touching anything
(`scripts/measure/s120-midsegment-probe.ts`), not inferred from reading.

The renderer was correct the whole time: it joins the midpoints of sides 1-2 and 3-0, averages
0-1 with 2-3, and already had a berry "with no parallel pair there is nothing for it to average"
state for the contrast case. Only the gate disagreed with it. The single demonstration in the
product — the `/dev/widgets` sample — uses a **parallelogram**, where both bases are equal, the
average equals either one, and the readout distinguishes nothing. The one visible instance of the
enhancement was its degenerate case.

Two fixes in `src/lib/schema.ts`:

- `hasParallelBasePair(pts)` — tests the pair the renderer actually averages (AB and CD) for
  genuine parallelism, and rejects the collapsed case where C lies on line AB. The gate now uses
  it instead of proxying through a shape name. A kite still fails, as intended.
- `quadName` gains a trapezoid case, placed **after** the kite branch so that nothing the model
  already names changes what it is called. Without it the correct answer to the midsegment lesson
  would have rendered under a live label denying the shape had a name.

## Content-change ledger

**No authored lesson prose was changed.** No `body`, lesson ID, step ID, step order, `conceptTag`,
hint, `explanationVariants`, remedial mapping, XP rule or curriculum alignment was touched. A
field-by-field diff against the pristine S119 tarball confirms that across all eight files the
only keys that differ are `widget` and `predict`. `rt-03-01` already carried an authored predict;
the converter refuses to overwrite one, so it was preserved and the other seven gained one.

| Lesson | Step | Old widget | New widget | Predict | Tier |
|---|---|---|---|---|---|
| rt-01-04 | i1 | mcq | `triangleSolve` ratios, opp/hyp @ 30° | added | D → **A** |
| rt-03-01 | i1 | mcq | `triangleSolve` ratios, opp/hyp @ 34° | preserved | D → **A** |
| rt-03-02 | i1 | mcq | `triangleSolve` ratios, opp/adj @ 45° | added | C → **A** |
| rt-04-02 | i2 | mcq | `triangleSolve` ratios, opp/hyp @ 60° | added | C → **A** |
| rt-05-01 | i1 | mcq | `triangleSolve` ratios, adj/hyp @ 70° | added | C → **A** |
| pq-04-02 | i2 | numeric | `quadDrag` + `showMidsegment` | added | C → **A** |
| pq-02-03 | i1 | mcq | `coordinateProofLab` parallelogram | added | C → **A** |
| pq-05-01 | i2 | mcq | `coordinateProofLab` rectangle | added | C → **A** |

Eight of eight at Tier A, against §9.1's "≥ B, and ≥ 90% at A".

## Why these eight, and why the numbers are what they are

Every one was chosen so the authored `body` still describes what the step now does — the
playbook's own rule (§1) that the converted step should be the one whose prose already names the
causal move. Where no step's prose fitted, the lesson was left alone; `rt-01-03` (45-45-90) is the
clearest example, since neither of its interactive steps is about scaling, and forcing the lab in
would have meant editing prose to match a widget.

The ratio targets are exact on purpose, so the readout is a fact rather than a rounding:

- **rt-01-04** target 30°, opp/hyp = **0.500** exactly. "The hypotenuse is double the short leg"
  stops being a rule to recall and becomes a number that will not move under the scale dial.
- **rt-03-02** target 45°, opp/adj = **1.000** exactly. tan⁻¹(1) is *performed* — the learner
  hunts the angle whose ratio matches, which is what an inverse does.
- **rt-05-01** target 70°, adj/hyp = 0.342 = sin 20° to twelve places. The cofunction identity
  arrives as a coincidence the learner walks into, not a formula.
- **rt-04-02** start 30° → target 60°: 0.500 → 0.866. The near-universal misconception is that
  doubling the angle doubles the height, and the lab refutes it in one drag — 45 m becomes 77.9 m,
  a factor of √3. The predict names all three options so the wrong one is a commitment, not a trap.
- **rt-03-01** target 34°, where opp/hyp reads 0.559 — which is exactly the lesson's own
  11.18 ÷ 20 from step k1, so the lab and the arithmetic that follows it are the same triangle.

`pq-04-02`'s lab starts at a corner position with **no parallel pair at all**, so the berry
readout fires first and the learner sees the theorem's precondition fail before they see it hold.
Bases 8 and 4, midsegment exactly 6 — verified against the renderer's own computation, not
asserted.

## Verification before writing, not after

`scripts/measure/s120-verify.ts` runs every spec through the real `WidgetSpec`, the real
`widgetIntegrityErrors`, and the real `evaluate` before any file is touched: the intended answer
must grade **correct**, at least two distinct wrong paths must be **reachable**, the named ratio
must genuinely separate start from target, the low/high feedback must match the direction the
ratio actually moves in (cosine falls as the angle opens — `rt-05-01`'s wording is inverted
relative to the other four, and this is what proved it), and the target angle must keep grading
correct at scale 0.5, 1, 2 and 3, since that invariance is the entire claim.

`scripts/convert/s120-uptake.mjs` then asserts the expected old widget type on each target step,
snapshots the frozen fields, re-checks them byte-for-byte after the edit, refuses to overwrite an
existing predict, and — because lesson formatting is not uniform across the corpus — re-prints
each file in its own indent style, aborting if re-printing the *untouched* file does not reproduce
it exactly. Dry run by default.

## One test updated, and why it is not a weakening

`widgets.geometry.s116.test.tsx` asserted the gate's message matched `/needs a pair of parallel
sides/`. The contract it tests — a kite is refused — is unchanged; only my wording is new. The
assertion now pins the shape as well as the refusal, and the same test gained the positive case
the old proxy wrongly rejected: a trapezoid passes clean.

## Tests

`src/lib/conversions.s120.test.ts`, 29 tests: the classifier in both directions (trapezoids named,
nothing previously named changed, collinear collapse refused), the gate in both directions, all
eight specs parsing and gating clean with a predict on an interactive step, scale-invariance of
the ratio grader at four scales, the scale dial being unskippable, the start landing on whichever
of low/high its ratio actually falls on, and the arithmetic behind every authored claim —
sin 30° = ½, tan 45° = 1, cos 70° = sin 20°, 90·sin 60° ÷ 90·sin 30° = √3, sin 34° = 11.18/20,
the two diagonal midpoints coinciding at the parallelogram target and separating at the start,
equal diagonals plus mutual bisection being a rectangle, and the midsegment equalling the average.

## Validation

typecheck 0 · vitest **9881/9881, 158/158 files** · validate:content 1223/1223 · lint:pedagogy
1139/1139 · lint 0 errors (193 warnings, unchanged) · check-registration consistent ·
validate:native clean on the packaged tree.

Product-wide movement: A 519 → **527**, C 323 → **317**, D 32 → **30**.

## What is still outstanding, honestly

Block 3 remains the residue and it is **authoring-bound, not engine-bound** — every remaining
lesson is served by an engine that already exists and already passes its gates. The largest single
gap is `cx-`: the playbook says "every cx- lesson maps directly" to `coordinateProofLab`, and
after this session that engine reaches three lessons, one of them in the cx- course. Ten cx-
lessons are still C. That is the highest-value next block, and it needs no engine work.

`extraneousRootLab` reaching 2 of its 14 lessons and (b) `showRatios` reaching 2 of ~8 are the
next two uptake gaps by the same measure.

## S120b — enhancement (b) reaches three more lessons, and a dead feedback path caught pre-flight

Continuing the uptake work. `dilationExplore.showRatios` stood at 2 lessons of the ~8 the playbook
named. Three of the six remaining candidates fitted their authored prose; the other three did not,
and the reason is now recorded in `KNOWN_ISSUES.md` rather than left as unexplained residue.

| Lesson | Step | Old widget | New widget | Tier |
|---|---|---|---|---|
| sy-02-01 | i1 | numeric | `dilationExplore` `length`, k = 1.5 | C → **A** |
| sy-02-02 | i1 | mcq | `dilationExplore` `length`, k = 3 | C → **A** |
| sy-03-03 | i1 | mcq | `dilationExplore` `segments`, cut at the midpoint | C → **A** |

`sy-02-01` dilates the 4-and-6 pair onto the 6-and-9 pair from the lesson's own numbers, with the
centre placed *at the included vertex* so the angle physically cannot move — SAS~ as a fact about
the figure rather than a rule about it. `sy-02-02` maps 3-4-5 onto 9-12-15 under a single k, which
is what makes SSS~ one criterion rather than three coincidences. `sy-03-03` slides the parallel cut
to the midpoint, where both ratios read 1.00, and its predict names the real claim — the ratios
agree at *every* position, not just there; the test walks all nine reachable positions to prove it.

### The verifier earned its keep

The first `sy-02-02` draft set `targetK: 3` on a dial whose `kMax` was also 3. Grading works, the
lesson looks fine — and `highFeedback` can never fire, because no reachable k exceeds the target.
That is authored diagnosis that is structurally dead: it looks like misconception coverage and is
decoration, the exact failure `widgetWrongPaths` exists to prevent elsewhere. The pre-flight
verifier now probes one k on each side of every target and refuses a dial with the target at
either end; `kMax` moved to 3.5.

Swept the whole corpus for the same fault afterwards: **7 pre-existing `dilationExplore` steps,
0 affected.** The property is now pinned for every dilation lab in the product, not just the new
ones, by a test that walks `content/` rather than a fixed list — so a future authoring slip fails
here instead of shipping.

### Content-change ledger

**No authored lesson prose was changed.** Field-level diff against the S120 package confirms only
`widget` and `predict` keys differ in all three files.

### Uptake after this batch

(b) `showRatios` 2 → **5**. Product-wide A 527 → **530**, C 317 → **314**.

## S120c — two prescriptions §3.3 named, still outstanding, and needing no engine work at all

A systematic sweep of all 81 remaining C/D lessons in blocks 3, 5 and 6 established two things.
First, **no course lacks a lab engine** — every residue lesson sits in a course that already ships
one, so "the engine isn't there" is never the reason. Second, and less comfortably, **the
pure-authoring yield is nearly exhausted**: for most of the residue the blocker is that the engine
in the course cannot pose that lesson's question, which is a build, not an authoring pass.

Two exceptions surfaced, both named in §3.3 and both overlooked in earlier passes.

| Lesson | Step | Old widget | New widget | Tier |
|---|---|---|---|---|
| tc-02-01 | i3 | mcq | `triangleConstraintLab` HL vs SSA | **D → A (36/39)** |
| tc-05-01 | i2 | numeric | `triangleSolve` sss, sides 5 and 8 | C → **A** |

**tc-02-01 was Tier D with the engine it needed sitting unused in its own course.** The lab starts
on SSA — where 5 and 13 leave two triangles — and the learner switches the givens to HL and takes
the angle to 90°, at which point the second triangle has nowhere to be. That is the entire content
of "HL rescues SSA": not a new criterion but the one case where SSA's ambiguity collapses. The
predict names the misconception directly (that a right angle changes nothing), and both wrong
paths route to different states — wrong criterion and wrong angle are separately diagnosable.

**tc-05-01/i2 is the one where the engine was already telling the truth and nobody had listened.**
The authored step asks, in words, for the upper bound on the third side of a 5-8 triangle. The
answer is 13. `SasSssTriangleW`'s slider runs `2 .. a + b − 1` — so the dial **physically stops at
12**. The bound the lesson asks the learner to compute is the dial's own ceiling; the triangle
inequality is not a rule laid over the widget, it is the widget's edge. The graded target is a
third side of 7, where the opposite angle reads exactly 60° (cos = 40/80), so the step still
grades on a precise reading while the ceiling does the teaching. The test pins both: that 7 is the
*only* integer side hitting 60°, and that the sides lie flat at 13.

### Content-change ledger

**No authored lesson prose was changed.** Field-level diff against the S120b package confirms only
`widget` and `predict` differ in both files.

### Running totals for the session

Thirteen lessons converted, every one to Tier A. Product-wide **A 519 → 532, C 323 → 313,
D 32 → 29**. Uptake: (b) `showRatios` 2 → 5, (c) `triangleSolve ratios` 1 → 6,
(e) `showMidsegment` 0 → 1, `coordinateProofLab` 1 → 3, `triangleConstraintLab` 5 → 6,
`triangleSolve` (all modes) 4 → 10.

## S120d — the altitude stage: building the figure §3.4 asked for and no engine could draw

The first engine build of this run, and the reason it was needed is worth stating plainly.

§3.4 assigns `sy-04-*` (geometric mean, three similar triangles) to "altitude-to-hypotenuse drag
in `dilationExplore` segments mode". `SideSplitterW` places D and E at the **same fraction along
two sides**, so its cut is parallel to the base by construction and can never be a perpendicular
from the right angle. The prescription named a figure the engine could not draw, which is exactly
why those three lessons survived every earlier authoring pass sitting at Tier C. This is the §11
residue, found by building rather than by reading.

### The stage

`showRatios` gains `"altitude"` — a re-staging, following the precedent `segments` already set,
so no new widget type and no eleven-surface registration. The learner drags the **foot of the
altitude** along the hypotenuse. The apex is not authored: it is placed at height √(p·q), which is
precisely the Thales semicircle over the hypotenuse, and the semicircle is drawn faintly behind
the figure. So the right angle is a **consequence of where the apex is allowed to be**, not a
claim the prose makes — the learner can push the foot to either extreme and watch the angle refuse
to break.

Readouts: p, q and h live, with a status line reporting `h² = p·q` alongside both leg means
(`leg² = c × its own segment`). Three geometric means, one figure, all holding at once.

`altitudeMeans()` in `schema.ts` is the single truth function, shared by the gate, the renderer and
the tests, so the figure drawn, the figure graded and the figure asserted are one figure.

### The gate checks facts the construction does not already guarantee

`h² = p·q` is a tautology here — the apex is *placed* at √(p·q), so asserting it would prove
nothing. The gate instead verifies the two things the construction is supposed to deliver and does
not state: that the apex angle is genuinely right (dot product of the two legs is zero) and that
each leg squared equals the hypotenuse times its own segment. It also refuses a foot outside the
open interval, and refuses `altitude` sharing a stage with `segments` — a parallel cut and a
perpendicular one are two different figures, and combining them would draw neither.

### The three lessons

| Lesson | Step | Old widget | Split | Altitude | Tier |
|---|---|---|---|---|---|
| sy-04-01 | i1 | numeric | 4 and 16 | 8 | C → **A** |
| sy-04-02 | i2 | numeric | 9 and 16 | 12 | C → **A** |
| sy-04-03 | i1 | numeric | 3 and 12 | 6 | C → **A** |

Each predict targets the same real misconception — that the altitude is the *arithmetic* mean of
the two segments. On sy-04-02's own numbers that distractor gives 12.5 against a true 12, close
enough to hide the error, and the reveal names a split where it fails badly. The two means
coincide at exactly one position, the midpoint, and the test asserts both the disagreement and
that single agreement.

### Content-change ledger

**No authored lesson prose was changed.** Only `widget` and `predict` differ in all three files.

### Tests

Seven more in `conversions.s120.test.ts`: the apex angle right at every reachable dial position;
all three means holding across the whole dial rather than at the authored target; the quoted
altitudes; the arithmetic-mean distractor being genuinely wrong away from the midpoint and right
at it; and the gate refusing each of its three bad configurations.

### S120d re-verified by an independent second method

The altitude stage's geometry was re-checked without reading anything back from the function under
test (`scripts/measure/s120-altitude-check.ts`). Across three hypotenuse placements — including one
oblique and one with the apex on the far side — and seven foot positions each:

- the apex angle is right to within 1e-9 (dot product of the two legs), so the Thales construction
  delivers the right angle rather than assuming it;
- `h² = p·q` — the altitude is the geometric mean of the two hypotenuse pieces;
- `legA² = p·c` and `legB² = q·c` — each leg is the geometric mean of its adjacent piece and the
  whole hypotenuse, which is the pair of relations sy-04-02 and sy-04-03 are built on;
- Pythagoras closes on the two legs and the hypotenuse;
- the foot stays on the hypotenuse at every position.

The three authored splits reproduce each lesson's own quoted numbers: sy-04-02's 9 and 16 give an
altitude of exactly 12, sy-04-03's 3 and 12 give 6, sy-04-01's 4 and 16 give 8. Each spec parses,
gates clean, grades its target, and reaches both `lowFeedback` and `highFeedback` from one dial
step either side — the reachability property S120b added after the dead-path finding.

Final gates on this tree: typecheck 0 · vitest **9906/9906** (158 files) · validate:content
1223/1223 · lint:pedagogy 1139/1139 · lint 0 errors · check-registration consistent · build exit 0.
Product **A 535 · B 255 · C 310 · D 29**.

## S120e — the cheapest seam in the product: ten predictions, nothing else touched

A tier-data sweep of the B band answered a question the earlier work had not asked: **which
lessons are already running a full laboratory and are held back only by the missing commitment?**
Fifty-five, as it turns out. They clear manipulation, consequence and misconception; the
prediction dimension is the sole gate, and adding it lifts the total past 30 at the same time.
This batch takes the first ten, all calculus.

| Lesson | Lab | Tier |
|---|---|---|
| de-01-01 · de-02-01 · de-03-01 · de-03-02 · de-04-01 | `slopeField` | B → **A** |
| ia-01-01 · ia-01-02 · ia-02-01 | `sliceSum` | B → **A** |
| ia-04-01 · in-02-02 | `accumulateArea` | B → **A** |

Ten of ten. **Nothing but a `predict` block was added** — the converter gained a predict-only path
that asserts the widget is byte-identical after the edit, so the labs, bodies and every authored
field are provably untouched.

### These are commitments, not decoration

The tier formula rewards the presence of a predict; it cannot tell whether the prediction is worth
making. Each prompt here was written against the lesson's own prose, and each wrong option is a
misconception the lab can actually refute in front of the learner:

- **de-01-01** — dy/dx = x depends on x alone, so the family is one curve *translated*. The predict
  offers "different shapes entirely", and the field refutes it: every point in a vertical column
  carries the same slope. That translation is the + C, finally shown rather than asserted.
- **de-02-01** — the contrast case to it. dy/dx = 0.5y depends on y, the constant *multiplies*, and
  two solutions spread apart exponentially. Shifting versus scaling, read off where the constant sits.
- **de-03-02** — start a logistic population exactly at the carrying capacity. The tempting answer
  is that it creeps higher because it is "still growing"; at P = 4 the factor (1 − P/4) is zero and
  the slope marks are flat. Equilibrium is not slow growth, it is none.
- **de-04-01** — Euler's error is *one-directional*. On an upward-bending curve every tangent step
  lands below the truth and the next step inherits the deficit.
- **ia-01-01** — "y = x² is on top, because squaring makes things bigger" is the whole misconception,
  and it is false on exactly the interval the lesson uses. Squaring shrinks numbers below 1.
- **ia-01-02** — the strip's height becomes the disc's *radius*, so doubling it quadruples the area.
  That square is the entire difference between an area integral and a volume one.
- **ia-02-01** — swapping circular cross-sections for squares of side r makes the solid *smaller*
  (r² against πr²), and the point is how little else changes: one formula, same slicing, same sum.
- **ia-04-01 / in-02-02** — both turn on A's slope being f. Displacement stops falling where v = 0,
  not where the object returns; A is flat where f crosses, not where A itself is zero.

### Tests

Two blocks. The first pins each new prediction as well-formed: three or more options, unique ids
and labels, an `outcomeId` that is actually offered, and a reveal materially longer than the option
it explains — a guard against reveals that merely restate the answer. The second walks the whole
corpus and asserts the platform's own rule for every predict in the product, not just these ten:
the outcome must be reachable, and the block must sit on an interactive step that has something to
manipulate.

### Result

Product **A 535 → 545, B 255 → 245**. Forty-five candidates remain in the same seam.

## S120g/h — the B-tier seam cleared: thirty-five predictions in one pass, under a new gate

The remaining thirty-five predict-only candidates, authored in two batches and taken together
because they share one risk: **bulk authoring is exactly where predictions stop being commitments
and become furniture.** The tier formula rewards the presence of a `predict` block and cannot see
whether the prediction was worth making, so the batch was written under a new gate rather than
under review-by-eye.

### `scripts/measure/predict-qa.mjs` — a corpus-wide gate for predictions

Five properties, chosen because they are what a bulk pass actually breaks:

1. **structural** — `outcomeId` is offered; ids and labels unique; at least two options
2. **placement** — sits on an interactive step that has something to manipulate
3. **substance** — the reveal says materially more than the option it explains
4. **grounding** — the prompt shares real vocabulary with its own lesson (advisory)
5. **distinctness** — no prompt or reveal is reused anywhere in the corpus

Two of these were tuned down after their first run argued against them, which is worth recording.
A step-local grounding check failed 296 predictions including several of the best ones —
`tg-04-01`'s *"sin 150° = 1/2 too. Can the drag reach 150°?"* is exactly right for its step and
shares almost no vocabulary with it, because a good prediction often introduces the words the step
then uses. Measured against the whole lesson and demoted to a warning. A three-option floor failed
25 legitimate binaries; a two-option prediction ("will it hold or not?") is a real commitment, so
the floor moved to two with a warning at two.

### What the gate found in content nobody was looking at

**73 hard failures, every one of them pre-existing, and every one a duplicated prompt or reveal.**
`ti-01-01/i1` carries the same prompt AND the same reveal as `tg-03-01/i1`. `vec-03-01`,
`vec-03-02` and `vec-03-03` all carry `pc-03-01`'s prompt verbatim — four lessons across two
courses sharing one prediction. That is copy-paste, and it is invisible to every existing gate
because each copy is individually well-formed. Recorded as a backlog item; not silently rewritten,
because rewriting 73 authored predictions is its own piece of work with its own review.

The thirty-five new predictions add **zero** hard failures and **zero** new warnings beyond one:
`dr-01-03`'s prompt names |x| and x = 0, both of which the tokenizer strips, so it scores one
shared word against a lesson it is unmistakably about. The heuristic being blunt about short
prompts, not a content problem — the two pre-existing warnings beside it in the same course are
the same shape.

### The batch

| Band | Lessons | Engines |
|---|--:|---|
| G11–G13 | 18 | `vectorExplore`, `expLogExplore`, `taylorApprox`, `argandExplore`, `polarTrace`, `sequenceBuild`, `derivativeRuleLab`, `derivativeTrace`, `slider`, `estimateSlider`, `shuffleTest` |
| G1–G10 | 17 | `areaModel`, `barBuilder`, `dotPlot`, `clockSet`, `moneyBoard`, `fractionBar`, `lineExplore`, `plotPoint`, `slider`, `tapDiagram`, `spinnerSim`, `treeDiagram` |

**35 of 35 reached Tier A.** The register moves with the band: the Grade 1 clock predictions ask
one short question about where a hand points, while the HS ones carry the misconception inside the
option text — 7 instead of 6 for the spinner (double-counting the sector that is both a multiple
of 3 and of 4), 18 instead of 6 for the rug (halving an area rather than rooting it), 5× instead
of 25× the sample for a fifth of the margin, 8 instead of 15 for rates along a chain.

### Result

Product **A 553 → 588, B 237 → 202**. Fifty-three predictions added across the session, the
B-tier seam identified in the tier sweep is now empty, and the gate that checked them runs over
all 784 predictions in the product rather than only the new ones.

## S120i — starting the K–8 backlog where remediation actually lands

The whole-app review picked the 81 K–8 Tier C/D lessons over the 258 HS ones, on a single
argument: **when the adaptive system sends a struggling learner back, this is where they land.**
83 load-bearing K–8 concepts had no experience above Tier C, and 334 of the product's 1,153
remedial routes ended on a Tier C or D concept. A learner who fails a lesson was being handed a
second copy of the experience that had just failed them.

Measured first: all 81 sit in courses that **already ship a manipulative engine** — so this is
authoring, not engine work, with a per-lesson fit check.

Started with `decimal-operations`: six C/D lessons, four of them Tier D, every conceptTag a
remediation target.

| Lesson | Step | Old | New | Tier |
|---|---|---|---|---|
| dop-02-03 | i1 | numeric | `columnCalc` multiply, 23 × 5 | D → **A** |
| dop-04-01 | i1 | mcq | `columnCalc` add, 3.50 + 1.75 | C → **A** |
| dop-04-02 | i2 | numeric | `columnCalc` add, 0.75 + 3.80 | C → **A** |

`dop-02-03` already carried an authored prediction ending *"First row first: 23 × 5"* — which
hands off precisely to the new widget. The converter refused to overwrite it (as designed) and it
was preserved rather than replaced.

Both decimal sums were chosen so the carry crosses the decimal point: 5 tenths + 7 tenths, and
7 tenths + 8 tenths. The engine holds them as integer hundredths — 350 + 175, 75 + 380 — so every
carry is exact integer machinery and no float appears anywhere, which is the lesson's own claim
that a decimal column is an ordinary column with a longer name.

### The pre-flight earned its place again

Four problems, caught before anything was written:

- `dop-01-02` was refused outright by `evalOrder`'s gate: *"every collapse order gives the same
  value — there is no precedence decision to make"*. Correct, and it is the lesson's point —
  brackets REMOVE the choice, and an engine that models precedence being obeyed cannot stage
  precedence being overruled. Declined.
- Two commonResults on `dop-04-02` (4.45 and 0.45) were **unreachable by any legal move
  sequence** — plausible-looking diagnosis that could never fire. The engine's own reachability
  model lists exactly two finals for 0.75 + 3.80: 4.55 and 3.55. Rewritten against 3.55.
- My verifier had the wrong value shape for both engines (`columnCalc` grades
  `{value, complete}`, `evalOrder` grades `{tokens}`), so the intended answers appeared to fail.
  Fixed, and the earlier spec files re-verified as a regression check.

### Declines

`dop-01-02`, `dop-03-03` (interpreting remainders — no engine models a CONTEXT choosing between
readings of one quotient) and `dop-05-03` (dividing decimals — `columnCalc` has no divide op).
All three recorded in `KNOWN_ISSUES.md` with what would unblock each. Three of six is a 50% fit
rate on this course, worse than the 85% the earlier blocks ran at, and worth knowing before
budgeting the remaining 78.

### Result

Product **A 588 → 591, C 310 → 308, D 29 → 28**. Load-bearing K–8 concepts with no experience
above Tier C: **83 → 80**. K–8 backlog **81 → 78**.

## S120j — the vm- cluster, and a fit rate that is now a measurement rather than a guess

Second course of the K–8 backlog: `volume-measurement`, nine C-tier lessons, one engine
(`volumeBuilder`).

| Lesson | Step | Old | New | Tier |
|---|---|---|---|---|
| vm-03-01 | i2 | numeric | `volumeBuilder` 3×2×1 | C → **A** |
| vm-04-01 | i2 | numeric | `volumeBuilder` 5×2×3 | C → **A** |
| vm-05-01 | i1 | numeric | `volumeBuilder` 4×2×3 | C → **A** |
| vm-05-02 | i1 | numeric | `volumeBuilder` 5×2×2 | C → **A** |

All four use **missing-dimension mode**, and that is the whole design. `volumeBuilder` grades the
product, so an ungated step asking for a 5×2×3 box is equally satisfied by 6×5×1 — the learner
passes without ever finding the authored answer. Locking the dimensions each lesson STATES leaves
exactly one free, and the integrity gate enforces that the target is then reachable at precisely
one lattice setting. The test re-derives that uniqueness by exhaustive search rather than trusting
the spec.

The four were chosen to build one idea across the course: a layer is worth something. vm-03-01
locks depth and height so every step of length lands a 2-cube column; vm-04-01 locks the 5×2 base
so every step of height lands ten cubes at once; vm-05-02 locks a 2×2 cross-section so every step
of length lands four. The recurring misconception — that adding a layer adds *one* — is named in
each predict and refuted by the slider in a single move. vm-05-01's predict takes the other classic
directly: adding the edges gives 9, which is a length in units and cannot be a count of cubic
units. When the units of the answer do not match the units of the question, the operation is wrong.

### Declines: five of nine

`vm-01-01/02/03` (unit conversion) and `vm-02-01/02` (line plots). Neither is close: a box of unit
cubes cannot say that a yard is three feet, and the ribbon data is in quarters, which needs
fractional ticks and a total/share readout `dotPlot` does not have. Both recorded with what would
unblock them; the `unitChain` engine is now the highest-yield K–8 gap found, since it would serve
the G5 measurement strand and `mmt-01-03` together.

### The fit rate is now measured

Two K–8 courses sampled: **7 conversions from 15 lessons, 47%.** The HS blocks earlier in this
session ran near 85%. The cause is structural rather than editorial — a K–8 course ships one or two
engines, chosen for its central lesson, while the HS courses have accumulated a wider bench. The
remaining 74 should be budgeted at roughly half conversions, half engine-gap findings.

### Result

Product **A 591 → 595, C 308 → 304**. Load-bearing K–8 concepts with no experience above Tier C:
**80 → 76** (83 at the start of this workstream). K–8 backlog **78 → 74**.
