# WS-E Prediction Gate Rubric — Real Per-Gate Adjudication

Status: **PROPOSED PROCESS DOCUMENT.** Nothing in this file, and no verdict produced by following it,
is a ruling. Every verdict this rubric produces — including the 23-gate pilot batch that
accompanies it — is `PROPOSED` until a human explicitly confirms it. This file does not authorize
anyone or anything to edit, remove, or reorder a `predict` block in `content/courses/`. See
`WS_E_PREDICTION_PURGE_PLAN.md` §5 (governance note) and §7 question 3 (batch-checkpoint mechanism,
still open).

This is Phase 1 of `WS_E_PREDICTION_PURGE_PLAN.md` §4: "Design the real prediction-gate evidence
rubric." It replaces nothing in the codebase by itself — it is the yardstick Phase 2
(re-adjudication) will hold up against `PREDICTION_GATE_ADJUDICATION.csv`, gate by gate, by a human
or a Fable-reviewed process (§7 question 2 of the plan is still open: who adjudicates, concretely).

---

## 0. Scope — what this rubric governs and what it doesn't

This rubric answers exactly one question, per already-authored gate: **does this specific
`predict` block, as written, earn the interruption it causes?** (`OPTIMIZATION_PLAN_V3.md`'s own
framing: "expected learning gain > interruption cost.")

It does **not** answer a different, adjacent question that already has its own machinery in this
repo: *should a lesson that currently has no `predict` block get one?* That is
`scripts/audit/prediction-eligibility.mjs`'s job (called from `scripts/audit/
excellence-backlog-s126.mjs` and `scripts/flagship-tier.mjs`), and it works on lesson-level
`OBSERVATION_TYPES`/`CLASSIFICATION_TYPES` widget-type sets plus keyword regexes
(`prediction-eligibility.mjs:10-25`) to flag *candidates* for new prediction cycles. That script's
verdicts are also never based on prediction text, for the same structural reason this rubric exists
— but it is a different script, feeding different downstream consumers, answering "should one be
added," not "should this one survive." **Correction to this task's own framing:** the task that
commissioned this rubric describes `prediction-eligibility.mjs` as the direct cause of
`PREDICTION_GATE_AUDIT.csv`'s boilerplate-reason problem. That's not accurate — the CSV's actual
generator is `scripts/audit/premium-rebuild-baseline-s226.mjs` (confirmed by
`WS_E_PREDICTION_PURGE_PLAN.md:41` and by the CSV's own column header), and its decision logic
(lines 119–155) never calls `prediction-eligibility.mjs` at all. The two scripts share a family
resemblance — both classify by widget-type set/capability lookup instead of reading gate text —
but they are independent failure instances, not one script causing the other's symptom. This
rubric is written for the gate the plan actually asks about: **existing `predict` blocks**, sourced
from `premium-rebuild-baseline-s226.mjs`'s exact extraction shape (see
`scripts/audit/prediction-gate-evidence.mjs`).

This rubric also does not:
- Decide interruption-cost softening (`LessonPlayer.tsx` — Phase 3, explicitly deferred).
- Execute any purge (Phase 4, explicitly deferred, requires the human batch-checkpoint mechanism
  §7 Q3 of the plan leaves open).
- Touch purpose-typed lessons or the world layer (separate sub-deliverables of WS-E, out of scope
  for this document).

---

## 1. What this replaces, and why, with the receipts

`PREDICTION_GATE_AUDIT.csv` has 1,362 data rows. Verified directly against the live file (2026-08-13):

- Decisions: **KEEP 1,162 / REMOVE 200** (REFRAME: 0).
- Distinct `reason` strings across all 1,362 rows: **2, exactly** — one for every KEEP
  ("Prediction precedes a direct causal model, retains the learner choice, and explains the
  observed outcome."), one for every REMOVE ("The attached surface does not meet the
  direct-manipulation and visible-consequence threshold.").
- Distinct `widget_type` values: **108.** Widget types where the 1,362 rows split KEEP/REMOVE
  within the same type: **0.**

The mechanism (`premium-rebuild-baseline-s226.mjs:119-155`) explains all three findings at once.
The decision is computed from exactly this:

```js
const c = caps[type] ?? {};                                    // type = step.widget?.type
const direct = (c.manip ?? 0) >= 2 && (c.conseq ?? 0) >= 2;     // scripts/engine-capabilities.json
const duplicatesTask = step.widget?.prompt && predict.prompt.trim().toLowerCase()
                        === step.widget.prompt.trim().toLowerCase();
// decision = REMOVE if !direct or duplicatesTask, else KEEP (REFRAME if outcome/reveal missing)
```

`direct` is a per-**type** lookup into a 129-entry capability table (`manip`, `conseq`, `err`,
`adapt`, `a11y`, `mobile`, `polish` scores, each 0-3, assigned once per widget type, not per
instance). Every instance of `matchPairs` gets the same `direct` value; every instance of `slider`
gets the same `direct` value. **The gate's own `predict.prompt` and `predict.reveal` are never
read for their content** — `prompt` is only used for the `duplicatesTask` string-equality check
(and that check is almost never true — real prompts are phrased differently from their widget's
prompt even when they ask the same thing, so this check under-fires too). This is why the same two
`reason` sentences repeat 1,362 times, and why no widget type ever splits: **the verdict is a
property of the widget engine, not of the specific pedagogical claim the gate makes.**

One clean, corpus-confirmed illustration: `add-subtract-100/as100-01-01.json` step `i1` (a
`matchPairs` widget) has this predict block —

```
prompt: "Doubles climb the same ladder: 6 + 6 = 12, so 7 + 7 is…"
options: 14 (outcome) / 13 / 15
reveal: "Each double is 2 more than the one before — BOTH addends grew by 1. Know one double and
         its neighbours come free: 12, 14, 16, 18."
```

The old CSV marks this **REMOVE** — not because the prediction is weak (it is, in fact, a real
invariant claim: consecutive doubles differ by a constant step, stated explicitly and generalized
to "its neighbours come free"), but because `matchPairs` scores `manip < 2` in
`engine-capabilities.json`. Under this rubric (§4, "Invariant") this gate has a strong textual case
for **KEEP** — see the pilot file for the fully worked adjudication of a different course's
`matchPairs` instances showing the same pattern.

**A side note on `REFRAME` (0/1,362, never fires):** this isn't a coincidence. `REFRAME` fires when
`!hasOutcome || !hasReveal` — i.e., when `outcomeId` doesn't resolve to a real option, or `reveal`
is empty. But `Prediction` in `src/lib/schema.ts:8880-8899` already makes both conditions
impossible for any gate that passes `validate:content`: `outcomeId` is checked by `superRefine` to
be one of the option ids, and `reveal` has a hard `min(25)` character floor. `REFRAME`'s trigger
condition is schema-unreachable for any content actually shipping. This is worth knowing because it
means the old CSV's three-value vocabulary was never really three-valued in practice — it was
binary, and that binary was widget-capability, not pedagogy.

---

## 2. The absolute rule

**No verdict may cite `widget_type`, `scripts/engine-capabilities.json`, `CMLStage`/`CMLMeta`
fields (including `stage: "predict"` or `predictionId`), or any other structural/metadata lookup as
evidence.** These may appear in the evidence CSV for a human's situational awareness (which engine
renders this gate, what stage it's tagged), but **citing them as the reason for a verdict is
automatically invalid** — it is exactly the failure mode this rubric exists to stop.

The only admissible evidence is the gate's own text:

- `predict.prompt` — quoted verbatim.
- `predict.reveal` — quoted verbatim.
- `predict.options[].label` — quoted verbatim, when relevant to naming a specific misconception.

The accompanying widget's `prompt`/`body` text may be quoted for **scene-setting context only**
(e.g., to show what the learner is about to do) — never as the basis for a category claim. If a
verdict's justification would not survive with the widget text deleted from the write-up, the
verdict is not yet earned.

Every worked example in §4 below follows this rule: each claim is backed by an exact quote from
`predict.prompt` or `predict.reveal`, not by "it's a `steppedReveal`" or "it's tagged
`stage: predict`."

---

## 3. Verdict vocabulary

Three verdicts, chosen deliberately over a strict KEEP/REMOVE binary — see the rationale below.

| Verdict | Meaning |
|---|---|
| **KEEP** | At least one of the five categories (§4) applies, with quoted textual evidence from `predict.prompt`/`predict.reveal`, and no disqualifier (§5) applies. |
| **REWRITE** | The gate has real, salvageable raw material — a genuinely misconception-shaped distractor, a plausible causal-contrast setup, a countable pattern — but the *current* `prompt`/`reveal` text does not yet close the loop (see §5's "single instance vs. relationship" and "reveal must engage the wrong path" tests). A specific, named gap must be recorded: what's missing, not just "weak." |
| **REMOVE** | No category applies, and there is no salvageable raw material — the distractors are generic/arbitrary rather than specific misconceptions, or the prediction is a strict duplicate of the widget's own immediate task with no independent claim anywhere in the text, and no plausible rewrite of `reveal` alone would fix it without effectively authoring a new gate. |

**Every verdict produced under this rubric — by this document's author, by a future adjudicator, by
anyone — is `PROPOSED` until a named human signs off on it.** No verdict in
`PREDICTION_GATE_ADJUDICATION.csv` or its pilot sibling authorizes a content edit. This mirrors
`CLAUDE.md`'s non-negotiable #7 ("some items must NOT be generated... rejecting is a SUCCESS") and
the plan's own §5 governance note: large-scale authored-content judgment calls get a human
checkpoint, not a script running unattended.

**Why three verdicts, not the two the plan's prose literally uses ("keep only gates with...")：**
the plan's bar text is about the *target state* (which gates survive), not the *adjudication
process*. The old CSV already anticipated a middle category (`REFRAME`) even though its own
mechanism could never reach it. Reading real gates for this rubric's pilot (§ below, and the
sibling pilot CSV) surfaced a real, recurring pattern that a strict binary handles badly: a gate
whose distractors are clearly misconception-shaped but whose `reveal` only restates the correct
answer's mechanics without engaging the wrong paths. Forcing that into REMOVE destroys real
authoring investment over a fixable gap; forcing it into KEEP certifies a reveal that doesn't
actually do the reconciliation work the predict → observe → reconcile loop promises. REWRITE names
the gap instead of hiding it in a binary. **If a human reviewer prefers a strict KEEP/REMOVE
binary, REWRITE rows can be mechanically resolved to either bound (REWRITE→REMOVE is the
conservative default, REWRITE→KEEP the optimistic one) without re-reading the gates — the
category and gap note already say why.** This is a judgment call, made and flagged, not hidden;
see the final report for how it was reached.

---

## 4. The five categories — operational tests

For every category: a definition, the textual evidence required, a positive checklist, explicit
disqualifiers, and two worked examples pulled from the real pilot batch (`multiplication-division`,
grade 3) — one KEEP, one non-KEEP (REWRITE) — so the boundary is concrete, not aspirational.

A gate may satisfy more than one category. Record all that apply; the verdict only needs one, but
recording all of them helps a future author see which lever to pull if they rewrite.

### 4.1 Counterintuitive consequence

**Definition:** the mathematically correct outcome plausibly conflicts with what a learner would
predict by naive extrapolation from a nearby, more familiar pattern. The naive-but-wrong intuition
must be nameable, and `reveal` must address it, not just assert the right answer.

**Required evidence:** quote the part of `reveal` that names or implies the naive intuition being
overturned, not merely the part that states the correct mechanism.

**Disqualifiers:** the "correct" outcome is the obviously expected one (no real friction with
intuition); or `reveal` states the right answer without ever gesturing at why someone might have
guessed otherwise.

**KEEP example** — `mult-02-05` (`dragBucket`, `add-subtract-100`... — course is
`multiplication-division`):
> prompt: *"6 × 0 and 6 × 1 — will these two land in the same bucket?"*
> reveal: *"×1 hands back exactly what it was given — one group of 6 is 6. ×0 makes ZERO groups of
> 6: nothing at all. The two strangers look like neighbors but do opposite jobs: one is the
> identity, the other the annihilator."*

×0 and ×1 read as a matched "boring operations" pair to a learner (both look like they "don't do
much"); the reveal explicitly names that apparent-neighbor framing ("look like neighbors") and
states the actual opposite-jobs relationship. This is the cleanest counterintuitive-consequence
gate in the pilot batch.

**REWRITE example (fails the test as written)** — `mult-01-01` (`slider`):
> prompt: *"Each bag holds 4 apples. Before you pack: how many bags will 20 apples fill?"*
> reveal: *"Five bags of 4 — the slider counts GROUPS, and 5 groups of 4 is the multiplication 5 ×
> 4 = 20. Groups-of is what the × sign means."*

The distractors (`"4 bags"`, `"16 bags"`) are plausible wrong answers, but `reveal` never
acknowledges that a learner might have picked either — it only restates why 5 is correct. No
naive-intuition contrast is present in the text.

### 4.2 Common misconception

**Definition:** at least one wrong option in `predict.options` encodes a specific, real, nameable
error pattern (not an arbitrary wrong number), and `reveal` explains — in terms of that specific
error — why it fails.

**Required evidence:** quote the wrong option's `label`, and the portion of `reveal` (or the honest
absence of one) that engages it.

**Disqualifiers:** the wrong option is generic/random with no identifiable reasoning behind it; or
`reveal` addresses only the correct path with zero reference, explicit or by worked counterexample,
to why the specific wrong option seemed plausible.

**KEEP example** — `mult-05-02` (`tapDiagram`):
> prompt: *"A SQUARE number is something times itself. Is 6 one?"*
> wrong option: *"Yes — 6 is 3 + 3"*
> reveal: *"6 only splits as 2 × 3 — different factors make a rectangle, never a square. 4 = 2 × 2,
> 9 = 3 × 3 and 16 = 4 × 4 are the true squares here; 3 + 3 is doubling, not squaring."*

The distractor encodes a specific, well-documented elementary error (confusing "double" with
"square," i.e. `n + n` with `n × n`). `reveal` names it directly: *"3 + 3 is doubling, not
squaring."*

**REWRITE example** — `mult-01-01` again:
> wrong option: *"16 bags"* — a real subtract-instead-of-divide slip (20 − 4 = 16).

`reveal` (quoted in 4.1) never engages this option or the operation-confusion it represents. Real
misconception-shaped raw material; unclosed loop.

### 4.3 Invariant

**Definition:** `reveal` states a relationship, pattern, or rule that demonstrably holds **across
variation** — a second worked instance, an explicit counterfactual/hypothetical, an "always/every"
claim, or a structural claim about all cases of a category. This is **not** a restatement or
relabeling of the single instance the learner just computed.

This is the category most often mis-claimed, so it gets its own litmus test (also cross-referenced
in §5): **"single instance, relabeled" vs. "relationship across change."** A reveal that only
restates *this problem's* answer using a general-sounding label ("that's what × means") has not yet
demonstrated an invariant — it has defined a term. A reveal that shows the relationship surviving a
second case, a hypothetical change, or an explicit "always" has.

**Required evidence:** quote the part of `reveal` that shows variation (a second number, a
hypothetical, an explicit universal quantifier) and the pattern that persists through it.

**KEEP example** — `mult-02-02` (`slider`):
> prompt: *"You'll pack 12 eggs into boxes of 4. If the boxes instead held MORE eggs each, you'd
> need…"*
> reveal: *"Bigger groups means fewer groups: 12 eggs fill 3 boxes of 4 but only 2 boxes of 6. The
> total never changes — group size and group count trade off against each other. That trade IS
> division."*

Two concrete cases (boxes of 4, boxes of 6) plus an explicit general trade-off claim. The
counterfactual is in the *prompt itself* ("If the boxes instead held MORE eggs each") — the
prediction is about the relationship, not about computing one number.

**KEEP example 2** — `mult-05-04` (`plotPoint`):
> reveal: *"...Multiples make stripes whenever the chart's width matches the skip — change the
> width and the stripe tilts."*

Explicit variation (width) with an explicit predicted response (the stripe tilts) — passes cleanly.

**REWRITE example (fails the test)** — `mult-01-01` once more:
> reveal: *"...Groups-of is what the × sign means."*

One instance (20 apples, 4 per bag), relabeled with a general-sounding definition. No second case,
no hypothetical, no "always." Structurally identical to `mult-01-02` (rows of cars) and
`mult-01-04` (frog hops) in the same course — all three ask "solve this one instance" and reveal
"here's what the operation is called," never "here's what stays true as something changes."

### 4.4 Estimate

**Definition:** the prediction requires genuine approximation under **stated uncertainty or
rounding** (an "about," a range, an order-of-magnitude band) — not an exact deterministic lookup —
and `reveal` reconciles the estimate against the real value or confirms the band.

**Disqualifier:** a numeric prediction with an exact, fully-determined answer is not an estimate
just because the widget happens to be `estimateSlider` or because the number is large. Check the
prompt's own language for the uncertainty marker.

**KEEP example** — `mult-03-02` (`estimateSlider`):
> prompt: *"32 classrooms of about 10 kids each — the total lands between…"*
> options: *"100 and 1,000"* (outcome) / *"10 and 100"* / *"1,000 and 10,000"*
> reveal: *"32 × 10 = 320 — a three-digit answer, parked between 100 and 1,000. Multiplying by ten
> slides a number one whole tick along this line: that power-of-ten skeleton is what every estimate
> hangs on."*

Genuine "about," genuine order-of-magnitude band, reveal reconciles the exact computation against
the estimated band and generalizes the power-of-ten skeleton to "every estimate."

**Non-example worth naming explicitly:** `mult-01-04` ("how many hops to land **exactly** on 12")
asks for an exact count, not an estimate, despite being numeric — the word "exactly" is in the
prompt itself. Don't credit "estimate" just because a gate is quantitative; the prompt's own
uncertainty language decides this, same rule as every other category.

### 4.5 Causal contrast

**Definition:** the prediction forces a choice between two (or more) genuinely different
**mechanisms or rules** that could each plausibly govern the situation — not "will the number be A
or B" but "does process X or process Y apply here." `reveal` must explain which mechanism governs
**and** make the other mechanism's (wrong) consequence concrete — worked out, not just named.

**KEEP example** — `mult-01-03` (`dragOrder`):
> prompt: *"Counting by 2s — each next number is…"*
> options: *"2 more than the last"* (outcome) / *"Double the last"* / *"It depends on where you
> start"*
> reveal: *"Skip counting climbs by a fixed step: 2, 4, 6, 8 — each adds 2. Doubling would race away
> to 2, 4, 8, 16: a much steeper ladder. Same start, very different climbs."*

Two real mechanisms (additive vs. multiplicative growth) both get worked out from the same
starting point, so the contrast is visible, not asserted. Likely the strongest pure causal-contrast
gate in the pilot batch.

**KEEP example 2** — `mult-04-04` (`dragOrder`):
> prompt: *"Ella buys 3 packs of 4 pencils, then gives 5 away. Which operation comes FIRST?"*
> reveal: *"You can't give away pencils you haven't counted: first 3 × 4 = 12, then 12 − 5 = 7. The
> story sets the order — subtracting first would mean taking 5 from a single pack of 4."*

The wrong mechanism ("subtract first") is worked out concretely enough to show it doesn't even make
sense (you'd be taking 5 pencils from a single pack of 4) — not just labeled wrong.

---

## 5. Cross-cutting disqualifiers (apply after the category check)

These apply regardless of which category was claimed.

**5.1 "Duplicates the task," read from text, not compared by string equality.** The old CSV's
`duplicates_task` field was `predict.prompt.trim().toLowerCase() === widget.prompt.trim()
.toLowerCase()` — exact string equality, which almost never fires even when a gate is genuinely
redundant with its widget (real prompts are phrased differently even when they ask literally the
same thing). The real test: **does answering `predict.prompt` require the same cognitive work,
with zero independent claim, as the widget the learner is about to operate — such that the widget
adds no information beyond confirming the same number?** This is a spectrum, not a boolean; when in
doubt, apply the invariant litmus test in §4.3 — a gate that states a relationship or contrast
survives even if it's thematically close to its widget (e.g. `mult-02-03`, `steppedReveal`,
predicts the missing-factor reframing the widget is about to walk through step by step — legitimate
"commit before the walkthrough," not duplication, because the widget doesn't state the general
"same fact family, read from a different side" claim the way the reveal does).

**5.2 Reveal-quality floor.** A `reveal` that would be word-for-word appropriate regardless of which
option the learner picked (i.e., it never differentiates from a wrong path) is weak evidence for
common-misconception specifically, even if strong for invariant/estimate/causal-contrast on other
grounds. Don't let a strong invariant claim quietly launder a weak misconception claim — check each
category's evidence bar independently.

**5.3 Silly/throwaway distractors don't need refutation.** Not every wrong option requires the
reveal to name it. `mult-04-03`'s *"Worth 14, its spot in the alphabet"* option (confusing an
algebraic variable with a substitution cipher) is real but implausible enough at this grade that
the reveal reasonably spends its words on the more tempting *"any number you like"* misreading
instead. Don't penalize a gate for not refuting every option; require it to engage the *most
plausible* wrong path.

---

## 6. Adjudication procedure

1. Pull the row from `PREDICTION_GATE_ADJUDICATION.csv` (generated by
   `scripts/audit/prediction-gate-evidence.mjs`). Do **not** open the lesson JSON file — the row
   already carries full context (prompt, options, outcome + its label, reveal, source path, old
   decision/reason for comparison). If something looks truncated or wrong, that's a signal to check
   the generator, not to go around it.
2. Read `predict.prompt` and `predict.reveal` in full. Ignore `widget_type_context_only` for
   decision purposes — it is there for situational awareness only (§2).
3. Test the gate against each of the five categories in §4, in any order. For each, record
   `yes`/`no` and, if `yes`, the quoted evidence. Do not stop at the first match — record all that
   apply.
4. Apply the cross-cutting disqualifiers (§5).
5. Decide the verdict per §3's table: at least one category with clean evidence and no disqualifier
   → **KEEP**. Real salvageable raw material but no category cleanly earned → **REWRITE**, with a
   named gap (which category was closest, and what specific textual addition would close it).
   Nothing salvageable → **REMOVE**.
6. Write the verdict, the category flags, and a short evidence note into the adjudication row.
   Every verdict is `PROPOSED`.
7. Batch discipline: adjudicate in batches of 20-30 gates (matching this project's existing MCQ
   remediation batching), stop, and get a human checkpoint before treating any batch's verdicts as
   final — per the plan's §5 governance note. This rubric does not resolve *how* that checkpoint is
   delivered (`AskUserQuestion`-equivalent vs. some other review surface); that's plan §7 question 3,
   still open, and the pilot's cost accounting (see the implementation report) is meant to give
   whoever resolves it real numbers instead of a guess.

---

## 7. Relationship to the evidence CSV

`scripts/audit/prediction-gate-evidence.mjs` emits `PREDICTION_GATE_ADJUDICATION.csv` with these
columns:

| Column | Source | Notes |
|---|---|---|
| `course_id`, `grade`, `lesson_id`, `step_id`, `source` | direct extraction | same identifying fields as the old CSV, for join/comparison |
| `widget_type_context_only` | `step.widget.type` | orientation only — **never** verdict evidence (§2) |
| `predict_prompt` | `step.predict.prompt` | quote this |
| `predict_options` | `step.predict.options` | `id="label"` pairs, `\|`-joined |
| `outcome_id`, `outcome_label` | `step.predict.outcomeId` + matching option's label | |
| `predict_reveal` | `step.predict.reveal` | quote this |
| `old_decision`, `old_reason` | `PREDICTION_GATE_AUDIT.csv`, joined by `(course_id, lesson_id, step_id)` | side-by-side comparison only, never authoritative |
| `counterintuitive_consequence`, `common_misconception`, `invariant`, `estimate`, `causal_contrast` | — | **empty in the generated artifact.** Filled in only during real adjudication (§6). |
| `proposed_verdict`, `adjudicator_notes` | — | **empty in the generated artifact.** `KEEP`/`REWRITE`/`REMOVE` plus the evidence note (§6 step 6). |

The generator is strictly read-only over `content/courses/`; it opens lesson files with
`readFileSync` only and never writes there. See the script's own header comment for the same
guarantee stated at the code level.

---

## 8. What this rubric deliberately does not decide

- Whether the resulting KEEP/REWRITE/REMOVE split should differ from the plan's "count may drop
  steeply — good" expectation. The 23-gate pilot (see the implementation report and
  `PREDICTION_GATE_ADJUDICATION_PILOT.csv`) found the opposite of a steep cut in one course — that
  is reported as a finding, not smoothed over, and it should not be extrapolated to the other 1,339
  gates without reading them.
- Who performs Phase 2's full re-adjudication, or how batch checkpoints reach a human at
  corpus scale (plan §7 questions 2 and 3 — unresolved, flagged, not guessed at here).
- Anything about Phase 3 (interruption-cost softening) or Phase 4 (execution). This rubric only
  produces `PROPOSED` judgments; it does not act on them.
