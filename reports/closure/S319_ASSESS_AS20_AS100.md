# S319 Independent Assessment — add-subtract-20 & add-subtract-100

Reviewer: Claude Cowork independent assessor (S319)
Reviewed at: 2026-08-20T12:33:37.000Z
Prefix obeyed: `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` (MT-V4-WORKER-PREFIX-1), read byte-for-byte before work began. Repository source (lesson JSON + course.json) is the sole authority used for every verdict below; no cache entry was treated as curriculum or as a pre-existing approval.

Method: read both `course.json` files and all 33 lesson JSON files in full. Recomputed every addition/subtraction fact appearing in prompts, widgets, `commonErrors`/`commonLandings`/`commonCounts`/`commonBuilds`/`pairErrors`, `explanationVariants`, hints, and recap takeaways by hand. Cross-checked every referenced `figure` id against `src/components/figureIds.ts` (registration) and `src/components/figures.tsx` (component mapping) — all 63 distinct figure references across both courses resolve to a real, correctly-labelled SVG component with a `<title>` and non-colour-only cues (spot-checked `CountOnHops`, `TensPartners`, `FactFamily`, `AddBalanceScale`, `BarCompare` source). Replicated the pedagogy linter's structural rules (`src/lib/pedagogy.ts`: step count 8–15, ≥60% action steps, concept→check/interactive adjacency, no consecutive concepts, challenge in final third, recap last with 1–3 takeaways + teaser, `explanationVariants` distinct, challenge = exactly 3 hints, mcq single-correct/no duplicate or near-duplicate labels, feedback ≥25 chars and not generic, no two distractors sharing feedback, concept-body word cap of 25 for `readingProfile: "early"`) against every lesson programmatically — zero violations found. Basis hashes pulled in bulk via `node scripts/session/print-review-basis.mjs`.

Known-context items applied as instructed: mcq/predict authored order is a convention only (seeded-shuffle at render), so authored non-correct-first ordering (e.g. as-01-03/k1, as-02-01/k3) was not treated as a defect.

## Course-level decision counts

**add-subtract-20** (gradeLevel 1, 17 lessons, chapters ch1–ch5): 17 KEEP / 0 REVISE / 0 ESCALATE.
**add-subtract-100** (gradeLevel 2, 16 lessons, chapters ch1–ch5): 16 KEEP / 0 REVISE / 0 ESCALATE.
**Total: 33 KEEP / 0 REVISE / 0 ESCALATE.**

## REVISE list

None. No lesson required a REVISE or ESCALATE disposition.

## Per-lesson verdict lines

### add-subtract-20

| lessonId | decision | visualDecision | gradeLanguageDecision | one-line basis |
|---|---|---|---|---|
| as-01-01 | KEEP | REQUIRED | FIT | Counting-on hops (4+3=7, 5+2=7, 8+3=11, 7+5=12) all correct; figure `count-on-hops` renders the exact hop sequence. |
| as-01-02 | KEEP | REQUIRED | FIT | Small-add and zero-add facts (9+1=10, 6+2=8, 7+3=10, 5+0=5, 8+2=10) all correct. |
| as-01-03 | KEEP | REQUIRED | FIT | Commutative bigger-first facts (3+8=11, 2+9=11, 4+7=11, 5+9=14) all correct; predict step correctly asserts commutativity. |
| as-02-01 | KEEP | REQUIRED | FIT | Partners-of-ten facts (8+2=10, 6+4=10, 7+3=10) all correct; CML invariant explanation is mathematically sound. |
| as-02-02 | KEEP | REQUIRED | FIT | Make-ten bridge for 8+5=13 verified at every intermediate step (8+2=10, 3 left, 10+3=13). |
| as-02-03 | KEEP | REQUIRED | FIT | Make-ten practice (7+6=13, 8+6=14, 6+7=13, 9+5=14) all correct. |
| as-02-04 | KEEP | REQUIRED | FIT | Make-ten-to-teen facts (8+7=15, 9+6=15, 7+8=15) and base-ten build of 13 = 1 ten 3 ones all correct. |
| as-03-01 | KEEP | REQUIRED | FIT | Take-away facts (7-3=4, 9-4=5, 8-5=3, 10-3=7) all correct; count-the-start-number trap correctly diagnosed. |
| as-03-02 | KEEP | REQUIRED | FIT | Counting-back facts (9-3=6, 8-2=6, 7-5=2, 12-4=8) all correct; distinct job from as-03-01 (procedural off-by-one focus). |
| as-03-03 | KEEP | REQUIRED | FIT | Count-up/difference facts (8-5=3, 10-6=4, 9-7=2, 12-8=4) all correct; distinct job (hops-not-landing framing). |
| as-03-04 | KEEP | REQUIRED | FIT | Fact-family subtraction (13-5=8, 15-6=9, 12-3=9, 14-6=8) all correct. |
| as-04-01 | KEEP | REQUIRED | FIT | Fact-family triples (8+5/13-8, 9+4/13-9, 7+6/13-6) and matchPairs sums (7+8=15, 9+5=14, 6+4=10) all correct. |
| as-04-02 | KEEP | REQUIRED | FIT | Equal-sign facts (10=6+4, 3+4=4+3, 6+4=5+5, 8+2=7+3) all correct; balance widget (x=2 for x+3=5) correct. |
| as-04-03 | KEEP | REQUIRED | FIT | Unknown-in-equation facts (6+4=10, 9-4=5, 8+5=13, 8+7=15) all correct via fact-family reasoning. |
| as-05-01 | KEEP | REQUIRED | FIT | Join/separate word problems (7+5=12, 8+6=14, 13-5=8, 9+4=13, 11-3=8) all correct. |
| as-05-02 | KEEP | REQUIRED | FIT | Part-whole word problems (6+7=13, 8+5=13, 15-9=6, 12-8=4, 14-6=8) all correct. |
| as-05-03 | KEEP | REQUIRED | FIT | Compare/difference word problems (9-5=4, 12-8=4, 14-6=8, 11-7=4, 7-5=2) all correct; "more ≠ always add" trap correctly handled. |

### add-subtract-100

| lessonId | decision | visualDecision | gradeLanguageDecision | one-line basis |
|---|---|---|---|---|
| as100-01-01 | KEEP | REQUIRED | FIT | Doubles (6+6=12, 7+7=14, 8+8=16, 9+9=18) all correct. |
| as100-01-02 | KEEP | REQUIRED | FIT | Near-doubles (7+8=15, 8+9=17, 5+6=11, 6+7=13) all correct via double-smaller-plus-1. |
| as100-01-03 | KEEP | REQUIRED | FIT | Strategy-selection facts (6+6=12, 9+5=14, 9+2=11, 8+9=17) all correctly matched to their named strategy. |
| as100-02-01 | KEEP | REQUIRED | FIT | Tens addition (30+40=70, 20+50=70, 40+40=80, 60+30=90, 60+40=100) all correct. |
| as100-02-02 | KEEP | REQUIRED | FIT | Ones-onto-two-digit (34+5=39, 52+6=58, 71+8=79, 23+4=27, 62+7=69) all correct. |
| as100-02-03 | KEEP | REQUIRED | FIT | No-regroup two-digit addition (34+52=86, 23+45=68, 61+27=88, 35+42=77, 53+26=79) all correct by place. |
| as100-02-04 | KEEP | REQUIRED | FIT | Regrouping addition (37+25=62, 48+36=84, 29+17=46, 15+17=32) all correct including the carry. |
| as100-03-01 | KEEP | REQUIRED | FIT | Tens subtraction (70-30=40, 90-50=40, 80-20=60, 60-40=20, 100-50=50) all correct. |
| as100-03-02 | KEEP | REQUIRED | FIT | Ones-from-two-digit subtraction (58-5=53, 79-6=73, 65-4=61, 47-3=44, 96-4=92) all correct. |
| as100-03-03 | KEEP | REQUIRED | FIT | No-regroup two-digit subtraction (86-52=34, 78-34=44, 95-63=32, 69-25=44, 87-41=46) all correct by place. |
| as100-03-04 | KEEP | REQUIRED | FIT | Break-a-ten subtraction (62-37=25, 74-28=46, 83-45=38, 32-15=17) all correct including regrouping. |
| as100-04-01 | KEEP | REQUIRED | FIT | Two-step chains (18+24-15=27, 35+20-12=43, 46+17-23=40, 10+5-3=12) all correct, including the intermediate hop targets. |
| as100-04-02 | KEEP | REQUIRED | FIT | Two-step chains with regrouping (52-27+13=38, 46+17-23=40, 60-35+18=43, 41-15+6=32) all correct. |
| as100-04-03 | KEEP | REQUIRED | FIT | Keyword-selection two-step stories (40-15+12=37, 23+40-18=45, 52-38=14, 64-15-22=27, 20-5+8=23) all correct. |
| as100-05-01 | KEEP | REQUIRED | FIT | Parity facts (6/10/12/30/48 even; 9/57/25/71 odd) all correct via both pairing and last-digit rule. |
| as100-05-02 | KEEP | REQUIRED | FIT | Sum-parity facts (4+6=10, 3+5=8, 4+7=11, 7+7=14, 9+6=15, 2+2=4) all correctly match the parity rules stated. |

## Implementation contracts for REVISE lessons

None — no lesson in either course received a REVISE disposition, so no implementation contract is required.

## Notes for future reviewers

- Both courses are structurally and mathematically clean: zero linter-rule violations were found across all 33 lessons when the full `src/lib/pedagogy.ts` structural rule set (step-count bounds, action-step ratio, concept/check adjacency, challenge placement, recap shape, mcq/near-duplicate label checks, feedback substance and non-duplication, reading-level word cap) was replicated and run against every lesson programmatically.
- All 63 distinct `figure` ids referenced by the two courses are registered in `src/components/figureIds.ts` and mapped to a real component in `src/components/figures.tsx`; a sample was read directly and confirmed to render the exact quantities claimed in the adjacent `concept` step body/narration (e.g. `count-on-hops` → 4+3=7, `tens-partners` → 6+4=10).
- `readingProfile: "early"` is used throughout both courses (including the nominally-G2 add-subtract-100), which is the stricter 25-word concept-body cap; every concept body in both courses is well under that cap, so this is a conservative choice by the author, not a defect.
