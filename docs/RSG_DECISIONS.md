# RSG decisions — append-only

The dated record behind `docs/RSG_DESIGN.md`. The design doc states the contract as it stands now;
this file states what was decided, when, and WHY the alternatives were rejected — which is the part
that stops a later session quietly re-litigating a settled question or re-introducing a defect that
was deliberately removed.

APPEND ONLY. Entries are never edited or deleted; a decision that is superseded gets a NEW entry
that says so and why. Nothing here has been reworded in the move from `RSG_DESIGN.md` (S212).

## The vertical-line decision (SETTLED, S209 — retires open question 1)

`slopeTriangle` must let a learner build run = 0 and SEE undefined slope. Two options were on the
table: the widget holds run = 0 as ephemeral state outside the model, or `LineCanonical` gains a
`VerticalLine` variant. **Neither was taken, and both were wrong for the same reason** — they
assume the slope triangle's canonical object is a LINE. **It is a PAIR OF LEGS.** `1:2` and `2:4`
are different triangles on the same line, and teaching that they are the same slope is the whole
lesson, so `rise` is genuinely canonical here rather than derived. Once the canonical object is
the triangle, the line becomes a DERIVATION — partial by nature, the graph of a function of x
only when the run is non-zero.

So `TriangleCanonical` joins `LineCanonical` in the family, with reps `legs` (the only editable
one), `slope`, `line` and `verdict`. `deriveTriangleSlope` returns `undefined` and `none` as NAMED
results; `deriveTriangleLine` returns a `vertical` branch carrying the x it stands on, and builds a
real `LineCanonical` in its `function` branch — the one place a triangle becomes a line.

Why not the variant: `LineCanonical` IS the graph of a function of x, which is what makes
`deriveEquation`, `deriveTable`, `lineValueAt` and `deriveContext` **total**. A `VerticalLine`
variant makes all four partial, hands every consumer a case it cannot render, and abandons the
"accepted only if every representation derives" invariant. Why not ephemeral widget state: that is
the second source of truth the RSG exists to abolish. The cost: two canonical types in one family
— the correct number, because they are two different objects, one a function and one a direction.

## The two-line decision (SETTLED, S210 — `linePairModel.ts`)

A pair of lines is **its own canonical type**, not a relation node over two line graphs. The node
reading was not merely worse, it is unimplementable inside this contract: a node's `derive` takes
THE canonical state, so one reading two of them breaks the star topology — propagation stops being
depth-1, "commit re-derives every view from the canonical" stops being expressible, and undo would
span two stacks with no defined interleaving. "Which pair are we relating?" would also be a fact
living outside any canonical state, which is the first rule broken.

`LinePairCanonical` holds two complete `LineCanonical`s plus labels. Both lines are independent
facts; everything ABOUT the pair is derived. `deriveRelation` is TOTAL with three named branches —
`unique` (exact rational crossing), `parallel` (carrying the constant gap), `coincident` — and
`deriveSolutionSet` says the same fact as a system's answer. **All three are REACHABLE states, not
rejections:** setting the slopes equal is an ordinary line edit that destroys the solution, and
being able to do that is the lesson. The module's single rejection is dragging a crossing that
does not exist (`no-crossing-parallel` / `no-crossing-coincident`).

No absorb logic is duplicated: `{ kind: "line", line, edit }` delegates verbatim to
`absorbLineEdit`, so every policy, clamp and rejection already proven still holds, and
`describeLinePairChange` retargets `describeLineChange`'s own ops onto `a:`/`b:`. Two moves are
genuinely pair-level: `setIntersection` (hold both rates, slide both lines onto a point) and
`matchSlope` (copy one rate onto the other — expressible as a line edit only once you know the
value, and knowing it requires the pair). The shared window is held in both slots and normalized
by construction and absorb, so each slot stays a complete, independently derivable line;
`linePairWindowsAgree` states that invariant.

## Wiring status

**`lineExplore` — LANDED (S208-2a), re-seated on the assembled model (S209-B).** Persisted value,
process evidence, lock chips, reveal ghost, testids and accessible names unchanged; policy
`slopeStep`/`interceptStep` 1, `outOfRange: "clamp"`, `offLattice: "snap"` reproduces the old
`snapToStep` lattice exactly and now REPORTS each adjustment.

**`slopeTriangle` — LANDED (S209-B).** Persisted `{run, rise}` unchanged; steppers/sliders are
`setRunLeg`/`setRiseLeg`, Reset is an undoable edit, leg clamping is declared and reported. Two
picture/grader contradictions closed: the verdict is the grader's own exact cross-multiplication,
not a float evaluation (LATENT — smallest disagreeing problem A(−14,−14) B(7,13), run −7, rise −9,
needs a ±14 grid), and the empty triangle no longer draws a phantom vertical line its own readout
called "no triangle" (LIVE, one keypress from the shipped sample).

**`affineRelationshipLab` — derive-only, now complete (S209-B, S211).** Plot geometry comes from
line-model views instead of `affineLineValue`, and the crossing from `linePairModel`'s
`deriveRelation` instead of `affineIntersection` — the last line math in the widget. Still outside:
`affineRelationshipTruth` remains the sole grader, and authored `tablePoints` are arbitrary sampled
pairs, not an arithmetic domain.

**`systemsExplore` — reads from a canonical pair (S211).** The crossing, the reveal ghost and the
process-evidence distance all come from `deriveRelation`. Where the two rates are equal it used to
produce `null` and then say nothing — no crossing, no ghost, and `distance` pinned at 0 so every
move scored alike; the pair NAMES that state (`parallel` with its constant gap, or `coincident`)
and a verdict line says so. All five authored specs are `unique`, so that line renders for no
lesson that exists today and the surface is byte-identical.

**NOT YET BREAKABLE, and it is a spec limit.** No shipped widget has controls that edit a line:
`systemsExplore`'s `m1/b1/m2/b2` are authored constants (the learner drags a point),
`affineRelationshipLab`'s controls are stage reveals and answers, and `lineRelationLab` is
angle-and-offset geometry whose relation is parallel/perpendicular, not a solution set. A learner
cannot yet make a solution vanish. The round trip unique → parallel → coincident → unique is proved
on the canonical pair instead, so the behaviour a breakable lab needs is ready for the surface that
gets the controls. What that surface needs, and what this session would NOT invent: editable line
parameters on the spec — ranges, steps and starts for each line — after which the wiring is the
same shape as `lineExplore`'s.

VERIFIED BEFORE WIRING: the derived crossing agrees EXACTLY with each widget's own predecessor
across all 44 comparable authored specs. Note the two predecessors differ — `systemsExplore`
divided in raw doubles, `affineIntersection` rounds to 1e-12 — and on `se-03-03` (rates −4/3 and
−3/2) the raw route gives 2.9999999999999987 where the cleaned and the exact routes both give 3.

## The editable-line schema slice (S212 phase 1 — `systemsExplore`)

`systemsExplore` was chosen in S211 as the first systems surface, and the finding then was that it
could not be made BREAKABLE without a schema change: `m1/b1/m2/b2` are authored constants and the
learner only drags a point. This slice adds that capability without touching a single existing
spec.

`SystemsLineEditSpec` is optional per line (`editLine1`, `editLine2`), defaultless at the point of
use, so every authored spec parses to exactly the key set it always did — pinned field-for-field
over all five in `schema.systemsExplore.s212.test.ts`. Its vocabulary is deliberately
`lineExplore`'s (range, lattice step, `clamp`/`snap` vs `reject`), so phase 2's wiring reuses the
established policy path rather than inventing a second one.

PERSISTED VALUE. The value stays `{ x, y }` and gains an OPTIONAL `lines` envelope, written ONLY
once the pair actually differs from the authored one. A classic spec can never write it; an
editable spec whose lines are untouched does not write it either. So every value ever stored stays
valid, forever. `systemsPairAdapter.ts` owns that rule in a single writer (`systemsPairPersist`)
rather than leaving each call site to remember it, and PER-LINE gating in `systemsPairParams` makes
a stale or corrupt envelope harmless — a slot the author never opened reads its authored value
whatever the stored object claims.

AN IMMOVABLE LINE IS NOT A SPECIAL CASE. Rather than teach the pair model about read-only slots, a
line with no controls gets a policy pinned to its own values with `outOfRange: "reject"`. Any edit
aimed at it is refused by the machinery that already refuses everything else, in the same shape.

CONSEQUENCE FOR GRADING, recorded before it bites: with editable lines the graded claim "the point
satisfies both relationships" must be read against the lines as they now stand, so `evaluate.ts`
has to consult `value.lines` when present. No authored spec enables editing, so `evaluate.ts` is
correct as written for every shipped lesson today; the change belongs to the phase that first
authors an editable spec.

## systemsExplore becomes breakable (S212 phase 2)

The lesson the whole line-pair thread was built for now exists on a surface: give the two lines the
same rate and the crossing leaves (`parallel`, with the constant gap named), match the starts too
and it returns everywhere (`coincident`), change either back and the single solution reappears.
Breaking a solution and repairing it is how a learner finds out what the solution WAS.

Line moves are absorbed through `systemsPairAdapter` → `linePairCanonicalModel`; the point stays
what it always was — the learner's answer, not part of the problem — so point moves are NOT pair
edits and never enter the pair's undo stack. Undo therefore appears only once a line has moved.

COALESCING is keyed `slot:parameter`, so a run on line 1's rate and a run on line 2's rate never
merge into one step back even though both are "a rate". The oracle stays `repSyncGraph`'s own
history depth (the EXTERNAL `recordAs` path in `widgetMorph`), because the graph coalesces its own
stack and is the only thing that can say whether a step was opened.

A spec with no `editLine1`/`editLine2` renders no controls, no verdict, no status region and no
Undo, and persists `{ x, y }` exactly as it always has. All five authored specs are that spec.

OPEN SEAM at the time of writing: `evaluate.ts` does not yet read `value.lines`, so a learner who
moves a line and then answers is graded against the AUTHORED lines. Harmless today — no authored
spec opts in — but it is a hard prerequisite before the first editable spec is authored, and it is
the reason no editable spec should be authored until that lands.

