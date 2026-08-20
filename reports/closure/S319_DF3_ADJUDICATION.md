# S319 — `df3-03-02` adjudication (closes the `audit:excellence` blocker from `S319_EXCELLENCE_REFRESH.md`)

Bounded assessor+audit packet. Scoped to `df3-03-02.json` (read/assess only) and
`scripts/audit/excellence-dispositions-s126.json` (write). Follow-up to
`reports/closure/S319_EXCELLENCE_REFRESH.md`, which left `df3-03-02` as the single unresolved-policy
row blocking `npm run audit:excellence` and the `QUESTION_DIVERSITY_AND_TRANSFER` count.

## 1. Why the generator threw

`scripts/audit/excellence-backlog-s126.mjs` requires every live K–8 Tier-C/D lesson to have either a
hand-policy record in `excellence-dispositions-s126.json` or an auto-derivable one from
`repetitionDisposition()`. That function (line 338) auto-derives **only** when the lesson has ≥1
`check`, ≥1 `challenge`, **and** live `d.transfer === 0` — a narrow rule built for lessons whose
challenge is pure repetition of a check.

`df3-03-02` ("Why You Can't Divide by Zero", grade 3) is live **Tier C, total 22/39**, with:

```
prediction 0  manip 0  conseq 0  revise 2  contrast 3  invariant 3
formal 2      transfer 2  misconception 3  adapt 1  a11y 2  mobile 2  polish 2
```

(`TIER_JSON=/tmp/tier319.json node scripts/flagship-tier.mjs`, row for `df3-03-02`.)

`d.transfer = 2`, not 0 — so `repetitionDisposition()` returns `null` and the lesson falls into
`unresolvedPolicy`, and the whole generator throws (`fail("policy/live backlog drift...")`) before
writing any output. **The lesson does not have the problem the auto-rule detects**; it has a
different, unaddressed gap (no manipulable engine — `manip=0`, `conseq=0`), for which the schema
requires a genuine human judgment call, not a mechanical one.

## 2. Full-lesson read and math re-check

Steps, in order: `c1` (concept) → `i1` (mcq, explore: "Which inverse equation would need a solution
for 7 ÷ 0 to have a quotient?") → `k1` (mcq, check: "What is 7 ÷ 0?") → `c2` (concept) → `i2` (mcq,
explore: "What does 0 × any number equal?") → `k2` (numeric, check: "Five equal groups contain 0
counters in all...") → `k3` (mcq, check: "Does 12 ÷ 0 have a quotient?") → `ch1` (mcq, challenge:
"Which expression has a quotient?" 8÷0 vs 0÷8) → `r1` (recap). One remedial route
(`rem-g3d-zero-c`/`rem-g3d-zero-k`) reinforces the same rule with 5 ÷ 0.

**Recomputed arithmetic (all correct as authored):**
- `i1`/`k1`: `0 × ? = 7` has no solution (0×n=0 for all n, never 7) → `k1.o2` "No quotient; no number
  works" is correctly flagged `correct: true`; `k1.o0` (7), `o1` (1), `o3` (0) are each falsified by
  their own stated multiplication check (`7×0=0`, `1×0=0`, `0×0=0`, none equal 7) — every distractor's
  feedback is literally true.
- `i2`/`k2`: `0 ÷ 5 = 0` (zero as the total/dividend, not the divisor) — `k2.answer = 0`,
  `commonErrors` for 5 and 1 are both genuinely wrong and their feedback is accurate.
- `k3`: `0 × ? = 12` has no solution → `k3.o1` "No quotient" is correctly `correct: true`; `o0` (1),
  `o2` (0), `o3` (12) are each falsified the same way as `k1`'s distractors.
- `ch1`: `8 ÷ 0` is undefined (zero as divisor) vs `0 ÷ 8 = 0` (zero as dividend) →
  `ch1.o3` "0 ÷ 8" is correctly `correct: true`; `o0` ("8 ÷ 0") is wrong because zero-as-divisor is
  undefined; `o1` ("Both are undefined") and `o2` ("Neither has an answer") are wrong because `0 ÷ 8`
  does have an answer.
- Remedial `rem-g3d-zero-k`: `0 × ? = 5` has no solution → `o0` correctly `correct: true`; `o1`/`o2`/`o3`
  are each falsified by their own cited product.

No mathematical error found anywhere in the lesson or its remedial.

**Per-step instructional job (the question this task requires — is the repetition defensible?):**

| step | job | distinct from |
|---|---|---|
| `k1` | Judge whether 7÷0 has a quotient, via inverse multiplication | — |
| `k2` | Judge the value of 0÷5 (zero as **dividend**, the mirror case) | `k1`/`k3` (opposite zero position) |
| `k3` | Judge whether 12÷0 has a quotient — **same job as `k1`, different number** | intentional retrieval-practice repeat of `k1`'s judgment, using the same `DivZeroMcq` generator form |
| `ch1` | **Discriminate** zero-as-divisor (undefined) from zero-as-dividend (=0) in a single item that puts both cases side by side | genuinely new job: not "is N÷0 defined" (that's `k1`/`k3`) and not "what is 0÷N" (that's `k2`), but "tell the two apart" |

`k1`/`k3` sharing a generator form is retrieval practice of one judgment at two numbers — the generator
itself scores this correctly: `d.contrast = 3` (max) because `k1`, `k2`, and `k3` collectively span
three distinct representation signatures (`variant:...DivZeroMcq`, `surface:numeric`, and — via `k2`'s
distinct role — the zero-as-dividend case), and `d.transfer = 2` because `ch1`'s discrimination task is
independently confirmed (by `transferScore` in `scripts/audit/flagship-representation.mjs`) to share
neither representation signature nor normalized prompt with any check step.

**This is corroborated by two prior, independent sessions' test suites**, not just this read:
- `src/lib/session186.fluencyPair.test.ts`: `NO_FACT_LESSONS = new Set(["df3-03-02"])` ("the one lesson
  that legitimately carries no fact family: division by zero is not a fact") and
  `UNVARIANTED_OK = new Set(["df3-03-02/k2", "df3-03-02/ch1", ...])`, commented "`df3-03-02` is the
  divide-by-zero lesson (0 ÷ 5 and 'which has an answer?' are one-off conceptual items)".
- `src/lib/session254.divisionFluencyG3CourseIntegrity.test.tsx`: pins `df3-03-02/k1` and
  `df3-03-02/k3` specifically to option-id order `[o0,o1,o2,o3]` and an 8-character label-length-spread
  cap, and asserts the lesson's figures/wording (`expect(text).toContain("Division by zero is
  undefined")`).

Both were authored in earlier sessions, before this packet, and both encode the same conclusion this
read reaches independently: the `k1`/`k3` near-repetition is intentional retrieval practice, and `k2`/
`ch1` are deliberate one-off conceptual items — not an oversight.

## 3. Ruling

**Option (b): the current design is defensible.** `df3-03-02` does not need an added transfer
question — it already has one (`ch1`, live `transfer = 2`, nonzero). Writing a synthetic "transfer"
item on top of `ch1` would either duplicate `ch1`'s discrimination job or misdiagnose a repetition
problem that measurably does not exist. The lesson's Tier-C standing is driven entirely by `manip = 0`
and `conseq = 0` — it uses conventional `mcq`/`numeric` answer surfaces because the concept (division by
zero is undefined, a definitional exclusion proven by inverse multiplication) is symbolic/logical, not
a spatial or quantitative relationship that a drag/build engine would represent more truthfully. This
is independently corroborated by the live `predictionEligibility.status = "unsafe"` ("every exploratory
step is itself a classification/selection judgment; a preceding prediction would duplicate the assessed
judgment") — the same content-driven honesty rule the generator already trusts elsewhere in this file.

Action taken: added **one** schema-conformant record to
`scripts/audit/excellence-dispositions-s126.json` —
`lessonId: "df3-03-02"`, `interactionIntent: "justify"`, `representationRequired: "symbolic process"`,
`representationPresent: "yes"`, `predictionEligibility: "unsafe"`,
`candidateDisposition: "intentional-assessment"`, `honestRestingTier: "C-intentional"`,
`reviewStatus: "classified"`, plus non-empty `candidateEngineOrExtension`, `fitAcceptanceContract`, and
`workstream` strings citing the specific steps and live dimensions above (full text in the JSON file).
**No lesson content was edited** — `df3-03-02.json` is byte-identical to before this packet
(`reviewBasisHash de5aa800fd4a751ca4cfb2e6d9dd93812c892b2c38531538a88f1f8a7d491598`, confirmed via
`node scripts/session/print-review-basis.mjs df3-03-02`).

## 4. `npm run audit:excellence` rerun — verbatim output (clean exit)

```
> audit:excellence
> node scripts/audit/excellence-backlog-s126.mjs

excellence-s126: 10/10 classified, 0 unreviewed | derived representation novelty=9 | dispositions {"extend":6,"intentional-assessment":1,"multi-engine":3} | representations no=0 partial=9 | honest prediction ceilings=17
```

Exit code 0. `EXCELLENCE_BACKLOG_S126.{json,csv,md}` regenerated. The 10 classified rows: `df3-03-02`
(new, `intentional-assessment`), plus 9 lessons auto-derived by `repetitionDisposition()` from live
`transfer = 0` (`ks-01-01`, `ks-01-02`, `ks-01-03`, `ks-02-01`, `ks-02-03`, `ks-03-02` — `extend`;
`mmt-02-01`, `ns-04b-01`, `sp-03-02` — `multi-engine`).

## 5. `npm run audit:pending-workload` rerun (once) — verbatim output

```
> audit:pending-workload
> node scripts/audit/consolidate-pending-workload-s236.mjs

{
  "total": 4220,
  "byWorkstream": {
    "CLOSURE_LEDGER": 27,
    "LESSON_REVISION_IMPLEMENTATION": 10,
    "V4_PROGRAMME_PHASE": 7,
    "QUESTION_DIVERSITY_AND_TRANSFER": 10,
    "CHOICE_SURFACE_INTEGRITY": 447,
    "STANDARDS_VERIFICATION": 2,
    "LESSON_PROGRESSION_AND_DUPLICATION": 228,
    "VISUAL_FIRST_REPRESENTATION": 1163,
    "GRADE_LANGUAGE_REVIEW": 1163,
    "LESSON_COMPLETE_DISPOSITION": 1163
  }
}
```

## 6. `QUESTION_DIVERSITY_AND_TRANSFER` delta

**Before: 15. After: 10. Delta: −5.**

The consolidator (`scripts/audit/consolidate-pending-workload-s236.mjs`) emits one
`QUESTION_DIVERSITY_AND_TRANSFER` row per row currently in `EXCELLENCE_BACKLOG_S126.csv` — this
includes every classified live-backlog lesson, regardless of disposition (an `intentional-assessment`
row is still queued, matching the generator's own note that "an honest Tier B or C-intentional is not
a defect" but is still a classified queue entry, not a silently-dropped one). The stale pre-fix CSV
(last successfully generated before the generator started throwing) had 15 rows. The freshly
regenerated CSV has 10:

- **6 rows dropped out of the live K–8 C/D backlog entirely**, independent of this packet — they had
  already climbed to Tier B on current source: `fa-02-02`, `kc-01-01`, `kc-04-03`, `mmt-04-03`,
  `ssg2-03-03`, `ks-03-03` (matches the live-tier proof table in `S319_EXCELLENCE_REFRESH.md` §3).
- **9 rows remain**, unchanged, auto-derived by `repetitionDisposition()` (`transfer = 0`,
  genuinely still needing an `extend`/`multi-engine` fix — this packet did not touch them):
  `ks-01-01`, `ks-01-02`, `ks-01-03`, `ks-02-01`, `ks-02-03`, `ks-03-02`, `mmt-02-01`, `ns-04b-01`,
  `sp-03-02`.
- **1 new row appears**: `df3-03-02` — it was never one of the original 15 (it was the out-of-scope
  generator blocker), and now shows up correctly classified as `intentional-assessment` rather than
  blocking the whole run.

15 − 6 (climbed to B) + 1 (df3-03-02 newly classified) = 10. ✓

## Files touched

- `scripts/audit/excellence-dispositions-s126.json` — added one record (`df3-03-02`). Hand-edited, in
  scope.
- `EXCELLENCE_BACKLOG_S126.{json,csv,md}`, `FLAGSHIP_TIERS.md` — regenerated by the two permitted
  generator runs (`npm run audit:excellence`, whose internal `flagship-tier.mjs` subprocess also
  writes `FLAGSHIP_TIERS.md`). Not hand-edited.
- `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`, `PREMIUM_PENDING_WORKLOAD_QUEUE_S236.md` — regenerated by the
  one permitted `npm run audit:pending-workload` run. Not hand-edited.
- `content/courses/division-fluency-g3/lessons/df3-03-02.json` — **read only, not edited**
  (`reviewBasisHash de5aa800fd4a751ca4cfb2e6d9dd93812c892b2c38531538a88f1f8a7d491598`, unchanged from
  before this packet).
- `reports/closure/S319_DF3_ADJUDICATION.md` (this file) and
  `reports/closure/cowork-staging/laneA-s319-df3.jsonl` — new evidence files for this packet.

## Note: pre-existing unrelated dirty tree

`git status` at the start of this packet already showed ~90 modified `content/courses/**/lessons/*.json`
files and several generated-report files unrelated to `df3-03-02` or the excellence audit (mtimes
predate every edit made in this packet, and neither `audit:excellence` nor `audit:pending-workload`
writes lesson content — `excellence-backlog-s126.mjs` explicitly states "No authored lesson content was
changed by this compiler"). These are out of this packet's scope and were not touched, inspected in
depth, or reverted.
