# S255 `data-line-plots-g2` independent V4 assessment

Status: **PASS — 36 source closures verified; 12 whole lessons still require revision**

This independent review read all 12 current lessons, all 12 remedial routes, all eight retained figure implementations, the `dotPlot`, `graphRead`, `barBuilder`, `unitRuler`, numeric, and MCQ contracts, current review authority, current cards, and the live scoped queue. It made no lesson, runtime, shared-authority, queue, card, cache, ledger, or standards edit.

## Signed result

- Whole lesson: **0 KEEP, 12 REVISE, 0 ESCALATE**.
- Visual: **12 REQUIRED, 0 PREFERRED, 0 SUFFICIENT, 0 ESCALATE**.
- Grade 2 language: **2 FIT, 10 REVISE, 0 ESCALATE**.
- Candidate SHA-256: `894056082a2a6182b7d07a6bdaffb2cdebec1322650d117ba766bf69cd384edd`.
- Current review-basis hashes: **12/12 matched**. The shared S244 cards are stale for all 12, so the candidate binds the live authority directly.

| Lesson | Lesson | Visual | Language | Independent finding |
|---|---|---|---|---|
| `g2g-01-01` | REVISE | REQUIRED | REVISE | Correct ruler model; text-only exact-copy retry, repeated k1, fixed first key, and unclear endpoint feedback remain. |
| `g2g-01-02` | REVISE | REQUIRED | REVISE | Repeats are retained correctly, but `dd-data-answers` does not visibly model a record with repeated values; retry repeats k1. |
| `g2g-01-03` | REVISE | REQUIRED | REVISE | Correct line-plot reading; both concepts reuse one example, while the retry copies c2/k1 and uses adult vocabulary. |
| `g2g-01-04` | REVISE | REQUIRED | REVISE | Value-versus-count truth is sound; remediation removes the plot and repeats the same stack-count job. |
| `g2g-01-05` | REVISE | REQUIRED | REVISE | Modal-value math is true, but prompts ask for a value while the interaction grades marking Xs; i2 masks this because value and frequency both equal 6. |
| `g2g-02-01` | REVISE | REQUIRED | REVISE | Key-of-1 figure is true but does not demonstrate the generalized “one or more” key claim; retry is text-only. |
| `g2g-02-02` | REVISE | REQUIRED | FIT | Main picture-graph language and truth fit Grade 2; retry copies c2 and semantically repeats k1 without a graph. |
| `g2g-02-03` | REVISE | REQUIRED | REVISE | Bar construction is true; one finished example is reused, the retry exactly repeats k1, and terminology is too formal. |
| `g2g-02-04` | REVISE | REQUIRED | REVISE | Read targets are true; the compare figure is a text slogan, and remediation copies c2/k1. |
| `g2g-03-01` | REVISE | REQUIRED | REVISE | Cats 3 plus birds 4 visibly equals 7; other sums are only declared as graph counts, with meta-instructional stems and a repeated retry. |
| `g2g-03-02` | REVISE | REQUIRED | REVISE | Dogs 6 minus cats 3 is true; c1 is a formula slogan, k3 is an unrepresented addition detour, and remediation repeats k1. |
| `g2g-03-03` | REVISE | REQUIRED | FIT | Main display-selection language and figures are sound; four MCQ surfaces are first-keyed, the retry repeats k1, and the challenge abandons the visual selection job. |

## Verified source closures

The S254 source packet safely closes all **24 stale illustration-replacement rows**: every c1/c2 placement is now registered, accessible, concept-related, and no lesson retains `count-on-hops`. It also safely closes all **12 progression rows** under the current detector contract: main prompts and normalized prompts are distinct, widget payloads are distinct, evaluator targets remain true, and IDs are stable.

The repair guard is current with seal `14eb0dae24706c233853cf026256150c5a03101464762cf220c6ffb1916100d2`. The S254 aggregate and S194 evaluator suites pass **20/20** tests. These facts establish the 36 bounded source closures; they do not establish whole-lesson excellence.

## Residual specialized debt

The exact retained inventory is:

- **12/12 text-only remedial concepts**.
- **7 exact c2 remedial concept copies**: `g2g-01-01`, `g2g-01-03`, `g2g-01-04`, `g2g-01-05`, `g2g-02-02`, `g2g-02-03`, `g2g-02-04`.
- **10 exact k1 remedial widget copies**: `g2g-01-01`, `g2g-01-02`, `g2g-01-03`, `g2g-01-04`, `g2g-01-05`, `g2g-02-03`, `g2g-02-04`, `g2g-03-01`, `g2g-03-02`, `g2g-03-03`.
- **15/15 MCQ surfaces** have the correct answer at option index 0. Several correct labels also contain uniquely explicit justifications, so position and construction parity both remain cueable.
- **Five weak concept-to-figure placements**: `g2g-01-01/c2` is text-only inside the SVG; `g2g-01-02/c1` is a generic Grade 6 data-set graphic; `g2g-02-01/c1` shows only key 1 while prose claims generalized keys; `g2g-02-04/c2` is a text slogan; `g2g-03-02/c1` is a formula slogan rather than a visible gap.
- `g2g-01-05/i1` and `i2` ask “which value” while `dotPlot` read mode accepts only marking the full asked stack. In i2, value 6 and frequency 6 coincide, obscuring the difference the lesson says it teaches. The lesson should either ask learners to mark the Xs above the modal value and then name it, or use an evaluator that directly accepts the value.

No learner-visible arithmetic falsehood or shared-renderer defect was found, so no record is escalated. The items above are nevertheless release-quality revision requirements, not optional polish.

## Queue effect

The live scoped queue contains **72 rows**: 24 illustration, 12 progression, and 12 each for lesson, visual, and language review.

An authoritative append would close **36 generic human-review rows** and open **12 `LESSON_REVISION_IMPLEMENTATION` rows**, reducing 72 to 48 immediately. A subsequent source-aware refresh would close the 24 stale illustration and 12 stale progression rows, leaving **12 scoped revision rows**. Thus:

- guaranteed disposition-only delta: **−24 net**;
- source-refresh delta already evidenced: **−36**;
- projected 72 → **12**, without hiding the residual implementation work.

## Reproducible gates

```text
node reports/closure/candidates/validate-s255-data-line-plots-g2-triple-dispositions.mjs
node scripts/audit/append-lesson-review-candidates-s246.mjs --check reports/closure/candidates/S255_DATA_LINE_PLOTS_G2_TRIPLE_DISPOSITIONS.jsonl
node scripts/audit/repair-data-line-plots-g2-s254.mjs --check
npx vitest run src/lib/session254.dataLinePlotsG2CourseIntegrity.test.tsx src/lib/session194.dataLinePlots.test.ts --reporter=verbose
```

The candidate check is deliberately read-only. Only root-reviewed append plus serial queue/card/cache regeneration can make these decisions authoritative.
