# S316 Adjudication — the remedial-distinctness standard

Adjudicator: Claude Cowork adjudicator (S316). Date: 2026-08-20.
Scope of this ruling: the signed **REVISE** disposition class whose rationale reads, in one of its
several wordings, *"the remedial route is immediate same-family practice rather than a distinct
misconception diagnosis"* — i.e. `remedials[0].check.widget` was a byte-identical copy of the
lesson's main `k1` check.

This document rules on four divergent implementer packets (Workers A–D), sets the binding standard,
and disposes of the koa-20 escalation. **This adjudication edited no file other than itself.**

---

## 0. Evidence actually read

Ledger: `reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl` — 741 lines, 1 schema record, 740
`lesson-disposition` records.

| Family | Records | Decision | Rationale character |
|---|---|---|---|
| `Codex course assessor (add-subtract-10-k S252)` | 40 (= 20 lessons × {original, `-lfnorm`}) | REVISE ×40 | **bare**: names the defect, prescribes no remedy |
| `Codex course assessor (add-within-100-g1 S251)` | 27 (+3 `g1a-02-06` supersession) | REVISE | bare, + "that implementation debt must stay open" |
| `Codex course assessor (properties-strategies-g1 S251)` | 28 | REVISE | bare |
| `Codex course assessor (fluency-20-g2 S251)` | 28 | REVISE | bare |
| `…(fractions-deeper-g3 S252)` | 24 | REVISE | **prescriptive**: "remedial check exactly repeats k1", "no semantic figure", "instead of using a diagnostic or transfer task" |
| `…(measure-problems-g4 S256)` | 24 | REVISE | **prescriptive**: "Replace that retry with a synchronized visual and a misconception-specific transfer item" |
| `…(unlike-fractions-g5 S253)` | 25 | REVISE | **prescriptive**: "A visual diagnostic transfer task is still required" |
| `…(division-fluency-g3 follow-on supersession S256)` | 24 | **KEEP ×24** | states the accepted remedy: "the figured remedial now teaches 12 shared into two groups and **asks a distinct evaluator-valid transfer rather than repeating k1**" |

Every KOA record carries the same `reopenCondition` clause: *"REVISE closes review only and
preserves implementation debt."* The `-lfnorm` duplicates are mechanical LF/CRLF re-basings with
"decision content unchanged" — no second opinion, no additional mandate.

Precedent Worker C cites — `S248-MF3-mf3-01-01`, **KEEP**, reviewer *ChatGPT Work independent
assessor (mult-fluency-g3 S248)*. Read the lesson: `k1` = `"2 × 6 = ?"`, answer 12; remedial check =
`"Use 6 pairs of counters. How many counters are in all?"`, answer 12, `commonErrors` **and their
feedback strings byte-identical to k1's**. Same numbers, same answer, same traps — only the
*representation* changed (symbolic recall → concrete grouping), preceded by a remedial concept that
re-teaches the strategy. That earned KEEP. **The precedent is real, and it is narrower and sharper
than "a fresh problem instance": what was accepted was a change of route, not a change of numbers.**

Lessons read in full: `koa-01-01`, `koa-03-05`, `koa-02-01…02-05`, `mf3-01-01`, `df3-01-01…03`,
`g2g-01-01/02`, `g1a-01-01`, `g1a-01-03`, `g1p-01-04`, `g1p-02-01`, `f20-01-01/01-03/02-02/03-01/03-06`,
`g3f-01-01`, `g4v-01-01…03-04` (all 12 remedials), `g5u-01-01/01-02/01-04`, plus `git diff HEAD` on
all 98 modified content files.

---

## 1. THE STANDARD (binding, ref. **S316-R**)

### 1.1 The signed defect is *diagnostic equivalence*, not *misconception identity*

The rationale sentence parses two ways: "a diagnosis that is distinct [from the immediate re-ask]"
or "a diagnosis of a distinct misconception." **The first reading is correct.** Four independent
grounds:

1. **The KEEP precedents fix the meaning.** `mf3-01-01` (KEEP) targets the *identical* misconception
   with the *identical* traps and changed only representation. The 24 `S256-DF3-FOLLOWON` KEEPs
   state the bar in their own words: *"asks a distinct evaluator-valid transfer rather than
   repeating k1."* "Distinct" modifies the task relative to k1 — not the misconception relative to
   the main sequence. An assessor community cannot mean by a phrase something it has repeatedly
   refused to require.
2. **The prescriptive rationales say so explicitly.** S256/S253/S252-G3F ask for a *"diagnostic **or
   transfer** task"*, a *"misconception-specific transfer item"*, a *"visual diagnostic transfer
   task."* A transfer item is by construction the same misconception family in a new context.
3. **A categorically different misconception is pedagogically wrong here.** The remedial fires
   because the learner missed `k1`'s concept. Routing them to a different misconception abandons the
   diagnosis of the error they actually made, and breaks the repo's own constraint that a remedial
   must carry diagnostic value *for the observed failure*.
4. **Authority boundary.** `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`: *"Recommendations …
   cannot approve their own work."* An assessor's prose cannot silently create a new pedagogical
   design mandate that no signed decision carries. Where the rationale is bare, its remedy is the
   remedy the ledger's own KEEP dispositions accept — nothing larger.

**Ruling 1(a): a fresh problem instance in the same misconception family CAN satisfy the signed
rationale. A categorically distinct misconception is NOT required and must not be demanded of a
worker. But "fresh instance" is not sufficient on its own — see 1.2.**

### 1.2 The operative test already exists in this repository

`src/lib/session255.dataLinePlotsG2FollowOn.test.tsx:52–63` is the house gate for this exact defect
class, green today on a course whose dispositions are KEEP:

```
normalized = (text) => text.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#")
                            .replace(/\s+/g, " ").trim()

expect(remedial.concept.figure).toBe(expectedRemedialFigures[lesson.id])
expect(FIGURES[remedial.concept.figure!]).toBeDefined()
expect(remedial.concept.body).not.toBe(c2.body)
expect(remedial.concept.narration).toBe(remedial.concept.body)
expect(remedial.check.widget.prompt).not.toBe(k1.widget.prompt)
expect(normalized(remedial.check.widget.prompt)).not.toBe(normalized(k1.widget.prompt))
expect(JSON.stringify(remedial.check.widget)).not.toBe(JSON.stringify(k1.widget))
```

I verified every KEEP-dispositioned precedent passes all five content clauses: `mf3-01-01`,
`df3-01-01/02/03`, `g2g-01-01/02` — including the **number-normalized** clause. That clause is the
load-bearing one, and it is the clause that separates the four packets.

### 1.3 Why number-normalisation, not operand freshness — independent architectural evidence

`src/lib/lessonVariants.ts:81ff` (`refreshLessonSteps`) and `src/components/playerStore.ts:200–205`
together decide this:

* **The first walk is always the authored one** (`refreshLessonSteps`, the comment block flagged as
  "the most important line here"). So on a first walk, `k1` is the authored item — and the remedial
  fires precisely on a first walk. A byte-identical remedial is therefore served with **certainty**,
  not probability. Closing that is real work, and it is what all three implementing workers did.
* **Remedials are never variant-refreshed.** `playerStore` injects `rem.concept` and `rem.check` raw
  from `st.lesson.remedials`; `refreshLessonSteps` touches only `lesson.steps`. The remedial is
  always the static authored instance.
* **Therefore on every replay walk, a static remedial that shares `k1`'s prompt *template* can be
  re-drawn as `k1` itself.** I measured this. Driving the real generators
  (`src/lib/g1Variants.ts`, `g2Variants.ts`) over 120,000 draws per form per band against the
  post-edit tree:

| Course | Lessons whose remedial prompt is regenerable as a main-step draw | Baseline at HEAD |
|---|---|---|
| `add-within-100-g1` (Worker B, operand swap) | **12 / 14** | 11 / 14 |
| `properties-strategies-g1` (Worker B, operand swap) | **3 / 14** | 5 / 14 |
| `fluency-20-g2` (Worker C, representation shift) | **0 / 14** | 14 / 14 |

Worked example — `g1a-01-01`. Worker B set the remedial to `"9 + 1 = ? Count on 1."`, traps
`9 → "That stops before counting on 1."` and `1 → "That is only the amount counted on."`.
`CountOnSmallNumeric` (`src/lib/g1Variants.ts:23`) emits
`` `${a} + ${d} = ? Count on ${d}.` `` with traps `[[a, "That stops before counting on ${d}."],
[d, "That is only the amount counted on."]]`, `a ∈ [3, 8|10|13]`, `d ∈ [0, 3]`. The remedial is
**exactly a draw of the generator that serves k1, trap feedback included** — measured recurrence
1.89 % per replay draw (up to 4.22 % on `g1a-01-02`'s `MakeTenFirstNumeric`). The defect is not
closed; it is made intermittent.

An operand swap under an unchanged template is invisible to number-normalisation *because it is the
same item to the learner's memory as well.* The normalized clause and the generator measurement are
two independent routes to the same conclusion, which is exactly the dual-derivation discipline this
codebase is built on.

### 1.4 The standard, stated for a worker

A remedial route closes this defect class when **all** of the following hold. Nothing here requires a
pedagogical judgment call.

**Binding for every packet in this class (check side):**

* **R1** `remedial.check.widget.prompt !== k1.widget.prompt`.
* **R2** `normalized(prompt) !== normalized(k1.widget.prompt)` using the S255 `normalized` above,
  and likewise against **every** main-step widget prompt in the same lesson (`k2`, `k3`, `ch1`,
  `i1`, `i2`) — not just `k1`.
* **R3** `JSON.stringify(remedial.check.widget) !== JSON.stringify(k1.widget)`.
* **R4** If the step whose `conceptTag` the remedial serves declares a `variant`, the remedial
  prompt must not be producible by that `gen`/`form`. R2 satisfies R4 automatically whenever the
  route (not merely the numbers) changed; a same-template operand swap does not.
* **R5** Every trap on the remedial check is recomputed from the numbers actually printed, its
  feedback is literally true of them, and no trap equals the answer or another trap.
* **R6** No text shown in the same injected pair (`remedial.concept.body` / `narration`, which is
  rendered immediately before the check) states the check's answer.

**Binding additionally where the signed rationale names a visual or text-only defect** (all of
`fractions-deeper-g3` S252, `measure-problems-g4` S256, `unlike-fractions-g5` S253):

* **R7** `remedial.concept.figure` is present, registered in `figureIds.ts` + `figures.tsx`, and
  semantically agrees with `remedial.concept.body`.
* **R8** `remedial.concept.narration === remedial.concept.body`.
* **R9** The remedial check's job is the job the remedial concept just taught. A concept that
  teaches unit conversion followed by a check that never converts does not close the defect.

**Explicitly NOT binding, and not to be demanded of a worker:**

* A categorically different misconception (ruling 1(a)).
* A **new** figure component, a change to `src/components/figures.tsx`, or any edit outside
  `content/courses/<course>/lessons/`. Where the only conforming fix needs a new figure, **stop and
  escalate** — that is the correct outcome, not a defect in the worker.
* Attaching a figure to a remedial in a course whose rationale is *silent* on visuals
  (`add-subtract-10-k`, `add-within-100-g1`, `properties-strategies-g1`, `fluency-20-g2`). That is a
  separate, unsigned improvement. Record it as debt; do not gate on it. `mf3-01-01` holds a KEEP
  with **no** remedial figure.
* Rewriting authored `remedial.concept.body`. See §4, Worker D, item (vi).

### 1.5 The known-good shapes (pick one; both are precedent-backed)

* **Shape α — route shift, numbers held.** Keep `k1`'s `type`, `answer`, `commonErrors` (values *and*
  feedback verbatim) and restate the stem in a representation the lesson already contains.
  `mf3-01-01` (KEEP): `"2 × 6 = ?"` → `"Use 6 pairs of counters. How many counters are in all?"`.
  Worker C's `fluency-20-g2` fix is this shape; it scored 0/14 regenerable.
* **Shape β — misconception-naming diagnostic.** `"A learner did X and wrote Y. What is the
  mistake?"`, where X and Y are drawn from `k1`'s own authored trap feedback. Worker D's
  `unlike-fractions-g5` fix is this shape and is the highest-quality work in the batch.

---

## 2. Verdict on the koa-20 (Worker A)

**Procedurally upheld. Substantively overturned. Re-dispatch with the binding pattern in §3.**

*Upheld, on the record.* Worker A verified the defect before refusing — it dumped
`remedials[0].check.widget` for all 20 lessons and confirmed word-for-word identity with `k1`. I
re-verified independently: the check widget of `koa-01-01` is byte-identical to `k1`'s (prompt,
answer 5, both `commonErrors` values and feedback, `fallbackFeedback`, `successFeedback`); ditto
`koa-03-05`'s three MCQ options and their feedback. A also correctly observed that
`reports/pedagogy/S252_ADD_SUBTRACT_10_K_WHOLE_COURSE_REPAIR.md` names no target misconception, and
that the templated `cml.misconceptions` field carries only boilerplate ("Changing a visible feature
without preserving the relationship that defines koa join groups") — so the pedagogy report genuinely
does not answer the question. Under `CHATGPT_WORK_V4_EXACT_PREFIX.md` ("Stop for … a new judgment
call") A's stop was the contract working. **A is not at fault and its ledger rows should not be
recharacterised as an error.**

*Overturned, on the substance.* The pattern A said was missing was already determinable from
signed material A did not have pointed at it:

1. `src/lib/session255.dataLinePlotsG2FollowOn.test.tsx` is an in-repo, green, KEEP-backed gate that
   *is* the specification (§1.2).
2. `mf3-01-01` and the 24 `S256-DF3-FOLLOWON` KEEPs demonstrate what the assessors accept.
3. **Decisive: `add-subtract-10-k` already contains five conforming exemplars, authored under the
   same S252 repair.** `koa-02-01…koa-02-05` pass R1/R2/R3 today. The course carries its own answer.

Applying the S316-R check-side clauses to the 20 koa lessons as they stand:

| Clause | Pass | Failing lessons |
|---|---|---|
| R1 `prompt !== k1` | 5/20 | koa-01-01…01-05, koa-03-01…03-10 |
| R2 number-normalized | 5/20 | same 15 |
| R3 payload | 5/20 | same 15 |
| `concept.body !== c2.body` | 10/20 | koa-01-01…01-05, koa-02-01…02-05 |

So **15 lessons** need the check rebuilt; the 5 chapter-2 lessons are already conforming on the
check side and are the template.

The misconception each remedial must diagnose is **not** an open question: it is already authored in
`k1`'s own `commonErrors[].feedback` / MCQ option feedback. `koa-01-01` names two —
*"That counts only the first group"* and *"That compares the groups instead of joining them."*
`koa-03-05` names *"Adding more cats would show cats ARRIVING, but these cats left"* and *"draws the
wrong starting number and never shows the cats leaving."* Selecting from an authored list is reading,
not inventing.

Ruling 2(b): **overturned — re-dispatch.** A's other four rejections in the same packet are
**upheld outright**: `mf3-02-01` (needs a ×8 double-double figure; `Mult3DoubleDouble` at
`src/components/figures.tsx:4210` is static and hard-coded to 4 × 6 = 24; `figures.tsx` is out of
scope) and `mf3-03-01` / `mf3-03-03` / `mf3-03-06` (latest disposition is **ESCALATE**, not REVISE —
correctly out of a REVISE lane).

---

## 3. Binding fix pattern **KOA-R** — zero pedagogical judgment required

For each of the 15 lessons `koa-01-01 … koa-01-05` and `koa-03-01 … koa-03-10`, edit **only**
`remedials[0].check.widget`. Do not touch `remedials[0].concept`, `explanationVariants`,
`conceptTag`, any step, or any id.

**Step 1 — copy the shape from the course's own conforming siblings.** The five chapter-2 remedials
are one shape: *a hands-on manipulative directive with a concrete object, smaller quantities than
`k1`, same widget `type` as `k1`, both traps recomputed with feedback phrased in the manipulative's
own language.*

| exemplar | `k1` | conforming remedial |
|---|---|---|
| koa-02-01 | "There are 7 cookies. You eat 3. How many cookies are left?" (4) | "Put 5 counters in a row. Slide 2 counters away. How many counters stay?" (3) |
| koa-02-02 | "Draw 8 circles, then cross out 3. How many circles are NOT crossed out?" (5) | "Draw 5 big circles. Cross out 3 slowly. How many plain circles can you touch?" (2) |
| koa-02-03 | "6 children are playing. 2 go home. How many children are still playing?" (4) | "Set out 4 toy people. Move 1 toy person home. How many toy people stay at the playground?" (3) |
| koa-02-04 | "7 frogs sit on a log. 2 hop away. Which sentence shows this?" (mcq) | "Four blocks are out. One block is put away. Which sentence shows the action?" (mcq) |
| koa-02-05 | "10 balloons float away one at a time until 4 have gone. How many balloons are left?" (6) | "Draw 6 balloons. Cover 2 balloons with your hand. How many balloons can you still see?" (4) |

**Step 2 — fill the shape from material already in the lesson.** Widget `type` = `k1`'s type.
Manipulative verb and object: take them from the lesson's own `i1` / `i2` prompt (every koa lesson
has a `tenFrame` or `numberLineHop` interactive whose prompt supplies both — e.g. `koa-01-01`'s
`i1` is *"Fill the frame to show 3 counters, then 2 more"*, giving "counters" and "fill the frame").

**Step 3 — pick the quantities mechanically.** Both operands strictly less than `k1`'s
corresponding operands; result ≥ 0; all quantities within 0–10; and `normalized(prompt)` must differ
from `normalized(prompt)` of every widget-bearing step in the lesson. If more than one pair
qualifies, take the numerically smallest pair (lexicographic on `(a, b)`). Deterministic, no taste.

**Step 4 — recompute both traps.** Reuse `k1`'s trap *semantics* (the misconception each trap
encodes) with the new values, and rewrite each feedback string so it is literally true of the new
manipulative: `koa-02-01` shows exactly this — `k1`'s "counts only the first group" becomes
"That is the starting row. Two counters have moved away…". Keep each feedback ≥ 25 characters and
not opening with a negation.

**Step 5 — verify before returning.** Print all 15 remedials with every trap, fallback and success
string and read them as a Kindergartner's adult would (counted nouns: never "1 counters"; the k0
generator's `kOne`/`kN` helpers at `src/lib/g0Variants.ts:757–759` exist because this exact bug
shipped once). Then assert R1–R6 programmatically against every step in the lesson.

**Step 6 — do NOT** add a figure (the koa rationales are silent on visuals; `mf3-01-01` holds a KEEP
without one), and do NOT rewrite `remedials[0].concept.body`. The 10 lessons whose remedial concept
body equals `c2.body` are recorded in §6 as a separate, unsigned defect class.

Re-dispatch envelope: **15 lessons, one packet.** Gate with R1–R6 plus
`npm run validate:content`, `npm run lint:pedagogy`, and
`npx vitest run src/lib/session252.addSubtract10KCourseIntegrity.test.tsx`.

---

## 4. Per-worker conformity

Semantic footprint, measured by comparing every leaf JSON path of each file against `HEAD` (not by
line diff):

| Worker | Files | Value changes in `.remedials` | Value changes in `.steps` | Line-diff noise |
|---|---|---|---|---|
| B (`g1a`, `g1p`) | 28 | 154 | **0** | 0 |
| C (`f20`, `g3f`) | 24 | 111 | 54 (6 lessons) | 0 |
| D (`g4v`, `g5u`) | 23 | 253 | **0** | **383 lines of `\uXXXX` re-encoding** |

S316-R applied to each worker's declared scope:

| | fig | body≠c2 | R1 prompt≠k1 | **R2 normalized≠k1** | R3 payload≠k1 |
|---|---|---|---|---|---|
| A — koa (unchanged) | 0/20 | 10/20 | 5/20 | **5/20** | 5/20 |
| B — 28 lessons | 0/28 | 28/28 | 28/28 | **0/28** | 28/28 |
| C — 24 lessons | 10/24 | 15/24 | 24/24 | **22/24** | 24/24 |
| D — 23 lessons | 23/23 | 11/23 | 23/23 | **18/23** | 23/23 |

### Worker B — `add-within-100-g1` + `properties-strategies-g1` (28) → **REWORK REQUIRED**

*Credit where due.* This is the cleanest-executed packet in the batch. 100 % of B's semantic changes
are inside `.remedials`; zero main-sequence drift. I re-derived every new answer and every trap:
all correct, no trap/answer or trap/trap collisions, and — the thing that usually breaks — every
`explanationVariants` pair in these 28 lessons is number-free ("Counting on from the bigger number
is faster than starting over"), so B's decision to leave them byte-identical introduced **no stale
numbers**. B verified round-trip re-serialisation with `ensure_ascii=False` before editing, which is
why its diffs are surgical. B's residual note — that a categorically different misconception would
be a new judgment call needing its own signature — is **correct and is hereby confirmed as the
standard** (ruling 1(a)). B behaved exactly as a bounded worker should.

*Why it still needs rework.* B chose the one shape the standard rejects: operand swap under an
unchanged prompt template. **0/28 clear R2**, and **15/28 remedials are re-drawable as a main-step
variant** (§1.3), trap feedback included. B genuinely eliminated the certain first-walk duplicate;
it left an intermittent replay duplicate that its own verification could not see, because B compared
only against the *authored* `k1` string and not against the generator's draw space.

**Rework, minimum cost (28 lessons, `remedials[0].check.widget.prompt` only in most cases):** apply
Shape α. Keep B's new operands and answers exactly as they are — they are correct and already
signed — and restate each stem in the representation the lesson already carries. Every one of these
28 lessons has a `k2`/`k3` in a contextual or number-line phrasing that supplies the wording; e.g.
`g1a-01-01` has `k2` *"A counter is on 5 and moves forward 2 spaces. What number does it reach?"* —
recasting the remedial as `"A counter is on 9 and moves forward 1 space. What number does it reach?"`
clears R2 and R4 at once. Then re-verify R5 (trap feedback must still be literally true of the new
wording) and re-run the R2/R4 scan.

### Worker C — `fluency-20-g2` + `fractions-deeper-g3` (24) → **f20 CONFORMS (1 exception); g3f GATE-RED**

*`fluency-20-g2` (14): the strongest result in the batch on the measure that matters.* C's
representation shift took the course from 14/14 regenerable to **0/14**, and 13/14 clear R2. I read
all 14 remedials as printed output: because C held the numbers constant, every untouched
`commonErrors` feedback string remains literally true of the reworded prompt (`f20-03-01`'s
*"That is one too many left — check by adding back: 9 + 7 = 16, not 15"* still names the numbers on
screen). No dropped units, no derived morphology, no spliced phrases. **C's use of `mf3-01-01` as
precedent is valid and is adopted as Shape α.**

* One exception: **`f20-03-03` fails R2.** C's "sibling fact from the same family" change
  (`14 − 8 = 6` → `14 − 6 = 8`) is pedagogically the most thoughtful edit in the packet, but it is
  an operand swap under an identical template and normalizes to the same string.
  **Fix: keep the sibling fact, reword the stem** (Shape α on top of it). One line.

*`fractions-deeper-g3` (10): blocked.* C removed five stale `variant` declarations
(`Ssg2ThirdsCountNumeric`, `Ssg2GridApplyNumeric`, `faImproperToMixedNumeric` ×3) rather than leave
them pointing at generators that would regenerate content contradicting the corrected prompts. The
intent was right; the mechanism is **gate-red**:

```
npx vitest run src/lib/session195.fractionsDeeperG3.test.ts
  → 5 failed | 11 passed
  TypeError: Cannot read properties of undefined (reading 'gen')   at :109
  g3f-01-01, g3f-01-04, g3f-02-05, g3f-03-01, g3f-03-04
```

Line 109 dereferences `s.variant.gen` for every numeric check. Making the test tolerate a missing
`variant` would make it **looser**, which CLAUDE.md forbids. **Fix: for each of the five steps,
either declare a `gen`/`form` that actually reproduces the corrected prompt, or revert the prompt
change and escalate the generator mismatch. Silently dropping the key is not available.**

*C's main-sequence edits are authorised — verified individually.* C changed 54 values across
`.steps` in 6 lessons, which is the largest curriculum-truth footprint in the batch. Every one is
named by its own signed rationale, so the "no curriculum change without lesson-level evidence"
constraint is satisfied:

| Edit | Authorising rationale text |
|---|---|
| `g3f-01-04` `k1` redesigned (array total → fraction-of-a-set, answer 15 → 5) and its `fallbackFeedback` rewritten | *"the checks use fraction bars or simple array totals rather than consistently assessing fraction-of-a-set reasoning; k1 and the remedial check merely count 5 by 3. Their numeric fallback says to name equal pieces of a cut whole, which is contextually false"* |
| "mixed number" / "WHOLE NUMBER part" terminology on exact quotients, `g3f-02-05` / `03-01` / `03-04` | *"Prompts call exact whole-number quotients such as 8/2 and 24/8 mixed numbers … this misuse recurs in checks and remediation"*; *"That terminology should be replaced with accurate improper-fraction-to-whole language"* |
| `g3f-01-01` `ch1` thirds → fifths | *"the challenge also largely repeats k2 with only its context noun changed"* |
| `g3f-03-01` `ch1` 8/8 → 18/6 | *"the sequence contains several near-identical conversion jobs"* |
| `g3f-02-03` `ch1` denominator 24 → 18 | *"The denominator-24 challenge also needs a clearer Grade 3 progression rationale"* |

Note for the record: `g3f-01-04`'s answer change is a change to grading truth on a main check. It is
correctly grounded in lesson-level evidence and stands — but it is the kind of change that must never
be inferred, and C was right to quote the rationale for it.

Residual left open (not C's to close): 9/10 `g3f` remedial concept bodies are still byte-identical
to `c2.body`. See §6.

### Worker D — `measure-problems-g4` + `unlike-fractions-g5` (23) → **best content, six defects, GATE-RED**

*Credit where due.* D produced the highest-quality diagnostic items in the batch — Shape β
misconception-naming MCQs whose distractors are real computed errors with feedback that names them
(`g5u-01-01`: *"After renaming, a learner adds 3/6 + 2/6 and writes 5/12 by adding the denominators
again. What is the mistake?"*). D attached a registered figure to 23/23 remedial concepts, always
reusing one of the lesson's own verified `c1`/`c2` figures and never one the rationale had flagged.
D's semantic footprint is 100 % inside `.remedials`. D's escalation of the 8 `g4v` main-route figure
mismatches — after confirming that every `figureIds.ts` entry maps to a static zero-argument
component and that no registered figure matches — is exactly right and is **upheld**; those 8 stay
open for a worker with `figures.tsx` authority.

Defects, in severity order:

**(i) `g4v-01-02` — answer printed on screen immediately before the check (R6).** `remedials[0].concept.body`
reads *"…the table lets you jump straight to **9 m = 900 cm** without listing the rows between"*, and
`playerStore` injects `[concept, check]` consecutively. D's new check asks *"A table shows 2 m = 200 cm
and 5 m = 500 cm. Using the same rule, what is 9 m in centimeters?"* — `answer: 900`. The learner
reads the answer, then is asked for it. Reveal-after-reasoning is broken. **Fix: change the check's
quantity to one the adjacent authored prose does not state (e.g. 7 m → 700).**

**(ii) Pinned evaluator contract broken and not re-pinned — GATE-RED.**

```
npx vitest run src/lib/session252.unlikeFractionsG5CourseIntegrity.test.tsx
  → "preserves all evaluator IDs and correctness while repairing learner-visible truth"
    expected 644bef53… to be 8b35d290…
```

`allSteps()` at line 16 **includes remedials**, and `evaluatorSignature` (line 36–42) covers `type`,
`answer`, `tolerance` and mcq `{id, correct}`. D changed remedial answers in all 11 `g5u` lessons and
two widget types, so the S252 pin necessarily breaks. This is the legitimate case CLAUDE.md
contemplates: the pin encoded "the S252 repair preserves these signatures," and an authorised S253
REVISE is a new legitimate case. **Fix: re-pin the hash to the new value, state it explicitly in the
log, and confirm the assertion is equally strict — do not delete or relax the pin, and do not revert
the content.** D did not discover this because it ran no gates.

**(iii) 383 lines of `\uXXXX` re-encoding across 23 files.** D re-serialised with `ensure_ascii=True`,
converting every authored `—` to `—` and `×` to `×` (198 lines in `g4v`, 185 in `g5u`;
B and C produced zero). Semantically inert — but ~64 % of D's diff is untracked rewriting of authored
prose bytes, which makes independent review of the actual change impossible without filtering.
**Fix: re-serialise all 23 files with `ensure_ascii=False` so only the intended values differ.**

**(iv) 5/12 `g4v` remedials fail R2** — `g4v-02-03`, `02-04`, `03-01`, `03-02`, `03-03` are operand
swaps under the identical multistep template (`"6 shifts of 35 minutes and finishes 20 minutes
early"` vs `k1`'s `"8 shifts of 45 minutes … 10 minutes early"`). Same rework as Worker B, Shape α.

**(v) Remedial concept ↛ remedial check mismatch (R9), 3 lessons.** `g4v-02-01`'s concept teaches
*"1 liter equals 1,000 milliliters"* and its check asks a ceiling-division jug-count; `g4v-02-04`'s
concept says *"When the answer is wanted in hours, convert AFTER building the total"* and its check
asks *"How many minutes?"* with no conversion at all; `g4v-03-03` likewise. A learner routed here is
taught one thing and tested on another. **Fix: align the check's job to the concept's claim, or
attach the figure/body pair that matches the check.** Note C fixed precisely this defect at
`g3f-03-03`; D reintroduced it.

**(vi) `g5u-01-04` — authored prose rewritten outside signed scope.** D changed
`remedials[0].concept.body` and `narration` from the *"1/4 and 1/6 into twelfths"* example to
*"1/2 and 1/3 into sixths"* so the text would match `fm-common-denom`, the only registered figure.
The rewrite is mathematically true and preserves the point (×3 and ×2, same destination), and the
rationale did ask for the withheld model — but the rationale did not authorise editing the example,
and D had a third option it used *eleven times elsewhere in the same packet*: stop and escalate the
figure gap. **Ruling: retain the text (reverting would ship either a figure that contradicts its own
body or a defect the rationale names), but it requires an explicit, separately-signed
authored-prose amendment record. Do not repeat this pattern without a named authorisation.** D's
inconsistency here — escalating the `g4v` figure mismatches while silently resolving the identical
`g5u` one — is the thing to correct, not the sentence.

**(vii) `g5u-01-02` lost a visual affordance on the surface the rationale asked to strengthen.** The
remedial check went `numeric` (carrying `previewDenominator: 6`, prompt *"Split each half into three
sixth-size pieces"*) → text-only `mcq`, against a rationale reading *"A visual diagnostic transfer
task is still required."* The concept gained a figure, so the route is net better; but the check lost
its model. **Fix: restore a model-backed check form, or record the trade-off explicitly.**

---

## 5. Ruling on the staged verifier dispositions

`reports/closure/cowork-staging/laneAV-{g1,g2-g3,g4-g5}-dispositions.jsonl` (28 / 24 / 23 rows,
reviewer *"Claude Cowork independent verifier (S316)"*) are **internally inconsistent and must not be
committed to the ledger as they stand.** They grant **KEEP 28/28** to Worker B's operand swap while
returning **REVISE 14/14** on Worker C's `f20` representation shift, on the ground that the reword is
*"cosmetic … no different representation is used."* That reasoning contradicts (a) `mf3-01-01`'s KEEP
for the same reword pattern, (b) its own `laneAV-g1` KEEPs, which accept a strictly weaker change,
and (c) the measurement in §1.3, where the "cosmetic" pattern eliminated all 14 regenerable
collisions and the KEEP'd pattern left 15. `laneAV-g4-g5` also KEEPs `g4v-03-03`, an R2 failure, and
dismisses the escape churn as *"cosmetic escaping."* No row in any of the three files detects the
broken evaluator pin, and none reports a gate run.

**Direction: re-run all 75 verifier rows against S316-R §1.4 before any are appended. Under this
standard the expected outcome is REVISE on B's 28 (R2/R4), KEEP on 13 of C's `f20` 14 with REVISE on
`f20-03-03`, REVISE on C's 5 gate-red `g3f` lessons, and REVISE on D's `g4v-01-02`, `02-01`, `02-03`,
`02-04`, `03-01`, `03-02`, `03-03`, `g5u-01-02` and `g5u-01-04`.**

---

## 6. Cross-lane gate state (measured, 2026-08-20)

| Gate | Result | Attribution |
|---|---|---|
| `npm run validate:content` | **1840/1840 clean** | — |
| `node scripts/check-registration.mjs` | **clean** | — |
| `npm run lint:pedagogy` | **RED — 1710/1711**: `decimal-fluency-g5/g5d-01-05` — *"columnCalc: commonResults value 454 is unreachable by any move sequence — dead feedback that looks like diagnosis"* | **A fifth lane, not A–D.** Value `454` does not exist at `HEAD`; it was introduced by the working-tree `decimal-fluency-g5` edit (6 files). Needs its own owner. |
| `session195.fractionsDeeperG3` | **RED — 5 failed** | **Worker C** (removed `variant` keys) |
| `session252.unlikeFractionsG5CourseIntegrity` — evaluator pin | **RED** | **Worker D** (needs re-pin) |
| `session190.addWithin100g1` | RED — 11 failed, all on `k2`/`k3`/`ch1` | **Pre-existing.** The test reads only `lesson.steps` (never `remedials`); B's footprint is 100 % `.remedials`. Cause is an earlier session's main-prompt rewording desynchronising the independent solver regex — the coupling CLAUDE.md warns about. Own owner needed. |
| `session197.unlikeFractionsG5` | RED — 7 failed, incl. `g5u-01-05`/`g5u-02-01` | **Pre-existing.** Test contains zero `remedials` references, and two failing lessons are outside D's scope. |
| `session252…` — figure-text alignment on `g5u-01-01/c2` | RED | **Pre-existing.** Assertion reads `lesson.steps` concepts only; `c2` untouched. |
| `session251.addWithin100G1CourseIntegrity`, `session251.propertiesStrategiesG1CourseIntegrity`, `session251.fluency20G2CourseIntegrity`, `session196.measureProblemsG4`, `session256.measureProblemsG4CourseIntegrity`, `session244.unlikeFractionsDiversity`, `session297.unlikeFractionsG5ChoiceRepair` | **pass** | — |

`npm run typecheck`, full `npx vitest run`, `npm run validate:native` and the build were **not** run
by this adjudication. **No packet in this batch may be declared landed.** All three implementing
workers stated plainly that they ran no gates; that disclosure was correct and is credited.

Recorded for a human, found but not fixed:

* **Concept-side twin of this defect class, unsigned and open.** `remedials[0].concept.body` is
  byte-identical to `c2.body` in **12/12 `g4v`**, **9/10 `g3f`**, and **10/20 `koa`** lessons; in
  `g4v-01-01` D also attached `c2`'s own figure to `c2`'s own sentence, making the remedial concept a
  complete replay of the step the learner just failed to absorb. Every KEEP precedent
  (`mf3-01-01`, `df3-01-*`, `g2g-01-*`) has `body !== c2.body`. This is the same "immediate
  same-family" failure one step to the left and needs its own assessor pass — it is **not** a worker
  fix, because rewriting an authored explanation is authored-prose work.
* `CountOnSmallNumeric` (`src/lib/g1Variants.ts:23`) draws `d ∈ [0,3]`, so it can emit
  `"3 + 0 = ? Count on 0."` — a degenerate Grade 1 item. Pre-existing; not touched.
* No gate anywhere in `src/lib/*.test.*` asserts remedial-vs-`k1` distinctness except the single
  course-scoped `session255` file. That is why this defect class survived four whole-course repairs
  and their integrity tests: `session251.*CourseIntegrity` and `session256.*CourseIntegrity` all pass
  with byte-identical remedials in place.

---

## 7. Binding guidance for future packets

1. **Generalise the S255 gate.** Promote `session255.dataLinePlotsG2FollowOn`'s remedial block into a
   corpus-wide test over every `content/courses/*/lessons/*.json` with `remedials`, asserting R1, R2,
   R3 against **all** widget-bearing steps in the lesson (not just `k1`), plus R6. Introduce it with
   an explicit allow-list of the lessons that fail today, and shrink the list — never widen it. This
   is the single change that stops this defect class recurring, and it makes every future packet
   self-checking.
2. **Add R4 to the variant gate.** In `src/lib/variants.test.ts`, for any step declaring a `variant`,
   assert that no `remedials[*].check.widget.prompt` in that lesson is producible by that
   `gen`/`form`. Drive the real generator; do not reason about it. The measurement in §1.3 is the
   template.
3. **A REVISE rationale that names a defect but no remedy is answerable from the ledger, not from
   invention.** Before escalating, a worker must check, in this order: (a) an existing gate that
   encodes the fix; (b) a KEEP disposition on the same defect class elsewhere; (c) a conforming
   sibling lesson inside the same course. Worker A's escalation was correct *and* all three sources
   existed — so the standing instruction is: search these three, cite what you find or cite their
   absence, then escalate. An escalation that names what it looked for is worth far more than one
   that does not.
4. **Rejecting remains a success.** Nothing in this ruling should be read as pressure to implement.
   Worker A's `mf3-02-01` and three ESCALATE rejections were correct and are upheld; Worker D's 8
   `g4v` figure escalations were correct and are upheld. What was wrong was not A's refusal — it was
   that the question A raised had a published answer.
5. **Never re-serialise a lesson file with `ensure_ascii=True`.** Round-trip against `HEAD` with
   `ensure_ascii=False` and confirm byte-identity before making any edit (Worker B's discipline);
   then the diff *is* the change.
6. **A pinned hash that a signed later decision legitimately breaks must be re-pinned in the same
   packet, with the break stated in the log.** Never delete it, never loosen it, never leave it red.
7. **Read the injected pair, not just the item.** `playerStore` renders `remedial.concept` and
   `remedial.check` back-to-back. Any number stated in the concept body is on screen when the check
   is answered (defect (i) above). Print the pair and read it.
8. **When the only conforming fix needs a new figure or a generator change, stop.** That is inside
   the contract and it is the right answer. What is *not* available is silently dropping a `variant`
   key or quietly rewriting authored prose to fit an available figure — both were done in this batch,
   both by workers who escalated the identical problem elsewhere in the same packet.

---

## 8. Disposition summary

| Packet | Ruling |
|---|---|
| **A** — `add-subtract-10-k` ×20 | Stop **procedurally upheld**; rejection **substantively overturned**. Re-dispatch 15 lessons (`koa-01-01…01-05`, `koa-03-01…03-10`) under **KOA-R** (§3). `koa-02-01…02-05` already conform on the check side. |
| **A** — `mf3-02-01` | Rejection **upheld** — needs `figures.tsx` authority. |
| **A** — `mf3-03-01`/`03-03`/`03-06` | Rejection **upheld** — ESCALATE, wrong lane. |
| **B** — `g1a` + `g1p` ×28 | Content correct, footprint exemplary, **rework required**: 0/28 clear R2 and 15/28 are generator-regenerable. Apply Shape α over B's existing operands. |
| **C** — `f20` ×14 | **Conforms** on 13; `f20-03-03` needs a one-line stem reword to clear R2. Precedent claim (`mf3-01-01`) **upheld and adopted**. |
| **C** — `g3f` ×10 | **Gate-red** (`session195`, 5 lessons). Main-sequence edits **authorised and upheld**. Restore or replace the 5 `variant` declarations. |
| **D** — `g4v` ×12 | Best-in-batch diagnostics; **rework**: `g4v-01-02` (R6 answer-on-screen), 5 × R2, 3 × R9, escape churn. 8 figure escalations **upheld**. |
| **D** — `g5u` ×11 | Best-in-batch diagnostics; **rework**: re-pin `session252` evaluator hash, escape churn, `g5u-01-02` visual affordance, `g5u-01-04` prose amendment needs its own signature. |
| Staged `laneAV-*` verifier rows (75) | **Do not append.** Re-run against S316-R §1.4. |
| `decimal-fluency-g5` `g5d-01-05` | **Gate-red, fifth lane.** Needs its own owner; blocks the shared tree. |
