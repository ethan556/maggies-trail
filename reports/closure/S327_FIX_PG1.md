# S327 Fix Packet PG1 — LESSON_PROGRESSION_AND_DUPLICATION, before/after evidence

Reviewer: cowork-s327-PG1-fixer. Scope: 28 lessons across functions-and-sequences,
exponential-functions, proportional-relationships (workstream LESSON_PROGRESSION_AND_DUPLICATION).
Cross-check against CHOICE_SURFACE_INTEGRITY for the same 28 lesson ids ran clean — zero hits, so
no MCQ-leak cross-fix applies in this packet (verified by parsing PREMIUM_PENDING_WORKLOAD_QUEUE.csv
directly: 28/28 lessons matched under LESSON_PROGRESSION_AND_DUPLICATION, 0 matched under
CHOICE_SURFACE_INTEGRITY).

Method: for each flagged lesson, `mismatch_evidence` names the *repeat* step id(s); the step(s) they
duplicate under number-normalization were located by grouping every widget-bearing step's
`widget.prompt` under `normalize(text) = text.toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g,
"#").replace(/\s+/g," ").trim()` (the same normalizer S316_ADJUDICATION_REMEDIAL_STANDARD.md uses)
and reading every member's full widget (type, options/answer, commonErrors/traps, conceptTag,
variant) side by side. KEEP was signed where the repeat carries a distinct action, representation,
misconception target, constraint (e.g. sign/direction/boundary case), or transfer demand (e.g.
extrapolation, solve-for-a-different-unknown). Where a repeat was a true unintentional duplicate
(same job, same trap shape, only the numbers swapped, sometimes even landing on the same final
answer), exactly one of the repeated steps was rewritten — math independently recomputed in node
one-offs before writing — to carry a new job. None of the 28 lessons' flagged steps are `remedials`,
so S316_ADJUDICATION_REMEDIAL_STANDARD.md's R1–R9 does not bind this packet directly; its
number-normalization test and its documented `variantForStep` regeneration hazard were still applied
as the relevant technical standard (see note below).

Note on `variant` fields (regeneration hazard): `src/lib/variants.ts:variantForStep` re-derives a
step's content from `step.variant.gen/form` on every replay after the first walk, and — the less
obvious path — even a step with **no** `variant` field still gets regenerated from its bare
`conceptTag` via the same function's fallback branch (`variants.ts:40839`) if the tag resolves in the
alias table. Interactive-kind steps in these three courses are authored with **no** `conceptTag`, so
they are immune to both regeneration paths — they were preferred as the edit target wherever the
duplicate group contained one. Where only check/challenge-kind steps (which always carry a
`conceptTag`) were available to edit, the step's `variant` object was removed (closing the direct
regeneration path) and this is noted per-lesson below; the `conceptTag` was deliberately left in
place so the step stays routed to its correct remedial on failure, which leaves the fallback
regeneration path as a residual, pre-existing architectural limitation (`variants.ts` itself
documents this as unresolved: "Until variants can be declared per step rather than per tag...") that
is out of this packet's `content/courses/**`-only scope to close.

---

## fn-01-02 — PROGRESSION-fn-01-02 (k1) — KEEP, no edit

i1 (mcq, recognition) asks the range of distinct-output pairs; k1 (buildExpression, construction)
asks the range of repeated-output pairs, specifically targeting whether the learner collapses
duplicate outputs into a size-1 set. Distinct action + distinct misconception. See jsonl rationale
for full detail.

reviewBasisHash (unchanged): 621eba7eca6af611864e88b6b1c2dba8c4d37294536cc5f384196cf4259f6a96

## fn-01-03 — PROGRESSION-fn-01-03 (i2) — KEEP, no edit

k1 evaluates f(4) within the range the intro functionMachine displayed; i2 evaluates f(20), a value
never shown in the table — genuine extrapolation transfer demand, not a repeat of the same read.

reviewBasisHash (unchanged): 4350097d4c393bfd092462403508c3cbe428c12eeb8caa0f2cfe450ded487a32

## fn-02-01 — PROGRESSION-fn-02-01 (i3 k2 k3 ch1) — KEEP, no edit

Two groups. Common-difference: k1 (d=−3, sign-of-negative-difference trap) vs k2 (d=+7,
subtraction-order trap) — different sign is a real constraint change. Next-term: i2/k3 (increasing,
practice-then-check pair) vs i3/ch1 (decreasing, practice-then-check pair, i3 additionally landing
exactly on 0 — a boundary case with its own sign-continuation trap that no sibling tests). All four
final answers (19, 0, 17, 68) are distinct.

reviewBasisHash (unchanged): db41a77d427643ba498d03e8ad28809a1cf7009796333b96ca8242a5acd972dd

## fn-04-01 — PROGRESSION-fn-04-01 (i2 i3 k2 k3 ch1) — KEEP, no edit

This is the classify-geometric-vs-arithmetic-vs-neither lesson. Six items cover three categories
(geometric x3, arithmetic x2, neither x1) with fresh numbers and re-derived distractor feedback each
time — i3's "neither" case (1,4,9,16, quadratic growth) is the lesson's real target misconception and
has no duplicate anywhere else in the set. Multiple fresh examples per category is the question job a
classification lesson requires, not filler repetition.

reviewBasisHash (unchanged): 9a63639b8c7c7098c6ee648c87c1d1e1aa83efba1df2565d6b48bf9c75189021

## fn-02-02 — PROGRESSION-fn-02-02 (i2 i3 k2 k3 ch1) — REVISE: i3 rewritten

k1/i2/i3/k2/ch1 shared one positive-d off-by-one trap with only magnitude varying (5 reps, no
distinct job); k3 (d=−5) already carried a distinct sign constraint. Rewrote i3 only (interactive,
no `conceptTag` — immune to the `variantForStep` regeneration hazard) from a forward "what is the
Nth term" rep into the inverse job "given a_1 and a later term, solve for d":

- prompt: "For a_1 = 1, d = 2, what is the 10th term?" (answer 19)
  → "A sequence has a_1 = 9 and the 4th term is 33. What is the common difference, d?" (answer 8)
- commonErrors recomputed for the new numbers: divide-by-n slip (33−9)÷4 = 6; forgot-to-divide slip
  33−9 = 24. Both node-verified against d = (33−9)÷(4−1) = 24÷3 = 8.
- body: "A distant term." → "Work backward for the step."

reviewBasisHash after edit: 462e80bff9d121004307410e9a42e4472318a04fdeb2067649e8de7cb005087c

## fn-02-03 — PROGRESSION-fn-02-03 (i3 k2 k3 ch1) — REVISE: ch1 rewritten

Two groups: forward "Nth term" (k1 ref/i3/k2/ch1, four reps of the identical trap) and "solve for n"
(i2 ref/k3, a legitimate 2-rep practice-then-check pair — left as KEEP). Fixed the forward group by
rewriting ch1 into a third distinct job (solve for d, not a_n and not n):

- prompt: "For the sequence 6, 11, 16, 21, ..., what is the 10th term?" (answer 51)
  → "In a sequence, a_1 = 9 and the 6th term is 69. What is the common difference, d?" (answer 12)
- commonErrors recomputed: divide-by-n slip (69−9)÷6 = 10; forgot-to-divide slip 69−9 = 60. Node
  verified d = (69−9)÷(6−1) = 60÷5 = 12.
- hints rewritten to match; `variant` object removed (conceptTag `fn-arith-rule` kept for remedial
  routing) so the rewrite is not overwritten by the old generator form on replay.

reviewBasisHash after edit: df40579fc0d4eaa9ff7518f76014be78734146ee446bc2838433fce2056e42a0

## fn-03-01 — PROGRESSION-fn-03-01 (k2 ch1) — REVISE: k2 rewritten

Group "common ratio": k1 (3,6,12,24, r=2) and k2 (5,10,20,40, r=2) landed on the **same ratio
answer**, not just the same template — a true duplicate. Group "next term" (k3 r=3→81 / ch1 r=5→1250)
already differs in ratio and magnitude — left as KEEP. Fixed k2 with a representation shift (bare
symbolic sequence → word context) and a fresh ratio:

- prompt: "In the sequence 5, 10, 20, 40, what is the common ratio?" (answer 2)
  → "A savings account balance forms the sequence $4, $20, $100, $500 across four months. What is
  the common ratio?" (answer 5)
- commonErrors recomputed: 20−4=16 (difference, not ratio); 20 (the second month's balance, not the
  ratio). Node verified 20÷4 = 100÷20 = 500÷100 = 5.
- `variant` object removed (conceptTag `fn-common-ratio` kept for remedial routing).

reviewBasisHash after edit: adeb4908c25e13be1e93895a4244c903577688b2adc779a466139707e4c0d083

## fn-03-02 — PROGRESSION-fn-03-02 (i2 i3 k2 k3 ch1) — REVISE: ch1 rewritten

sequenceBuild slider group (i1 ref/i2/i3): three reps at three different ratios (3,4,2) — legitimate
constraint variation, KEEP. nth-term group (k1 ref/k2/k3/ch1): k3 and ch1 shared BOTH r=3 and n=4
(only a_1 rescaled, 1→3) — the weakest rep. Fixed by leveling ch1 up with a fresh ratio and a longer
reach:

- prompt: "For a_1 = 3, r = 3, what is the 4th term?" (answer 81)
  → "For a_1 = 2, r = 4, what is the 5th term?" (answer 512)
- commonErrors recomputed: r^n slip 2·4⁵=2048; "that's the 4th term" slip 2·4³=128. Node verified
  a_5 = 2·4⁴ = 512.
- `variant` object removed (conceptTag `fn-geo-nth` kept for remedial routing).

reviewBasisHash after edit: 36b2f0ed04031165fe85cb0ec501cb54e893fcb7536ce0e72607c9c106da3163

## fn-03-03 — PROGRESSION-fn-03-03 (i3 k2 k3 ch1) — REVISE: k2 rewritten

sequenceBuild slider group (i2 ref/i3): ratio 4 vs 2, position 5 vs 6 — legitimate, KEEP. "list 4
terms, ask the 5th" group (k1 ref/k2/k3/ch1): k1 and k2 shared BOTH r=3 and n=5, only a_1 differed
(2 vs 1) — the closest duplicate in this packet. Fixed k2 with a fresh ratio, same structure:

- prompt: "For the sequence 1, 3, 9, 27, ..., what is the 5th term?" (answer 81)
  → "For the sequence 2, 10, 50, 250, ..., what is the 5th term?" (answer 1250)
- commonErrors recomputed: r^n slip 2·5⁵=6250; "already listed" slip 250. Node verified terms
  2,10,50,250 (r=5) and a_5 = 2·5⁴ = 1250.
- `variant` object removed (conceptTag `fn-geo-rule` kept for remedial routing).

reviewBasisHash after edit: b3986ab8674236caea1561bd37ea9b811b9bdcb8b82a08fbe3cd1627a52a188d

## fn-04-02 — PROGRESSION-fn-04-02 (i3 k2 k3 ch1) — REVISE: k2 rewritten

Geometric group (k1 ref/i3/k3/ch1, ratios 3,2,5,2): acceptable variety, KEEP. Arithmetic group (i2
ref/k2): only two items and both used the identical d=3 — true near-duplicate. Fixed k2 with a fresh
common difference:

- prompt: "For 4, 7, 10, 13, ... (arithmetic), what is the 6th term?" (answer 19)
  → "For 5, 12, 19, 26, ... (arithmetic), what is the 6th term?" (answer 40)
- commonErrors recomputed: off-by-one slip 5+6·7=47. Node verified terms 5,12,19,26 (d=7) and
  a_6 = 5+5·7 = 40.
- `variant` object removed (conceptTag `fn-choose-formula` kept for remedial routing).

reviewBasisHash after edit: eaffb2f8cd760a7b0111111901f736471cdcc748b5067db8690e282744e64126

---

## exp-01-01 — PROGRESSION-exp-01-01 (k2 k3 ch1) — KEEP, no edit

Evaluate-f(x) group (k1/k2/ch1): three fully distinct (a,b,x) triples and distinct answers
(45,48,54) — proportionate for the course's opening evaluate-fluency lesson. Initial-value group
(i2 ref/k3): standard 2-item practice-check pair, different a/b. No collision anywhere.

reviewBasisHash (unchanged): 15889fc1e4fa4bbc676f5bccc97133d88206ad12ba7f6fa8c3a597a063b28365

## exp-01-02 — PROGRESSION-exp-01-02 (k3 ch1) — REVISE: ch1 rewritten

k3 (base 1/3) is properly distinct. But i2 (a=16, base 1/2, x=3 → 2) and ch1 (a=32, base 1/2, x=4 →
2) shared both the base AND the final answer — ch1 is literally "one more halving" of i2's own
chain (32,16,8,4,2 contains 16,8,4,2). Rewrote ch1 to a fresh base and start:

- prompt: "For f(x) = 32 · (1/2)^x, what is f(4)?" (answer 2)
  → "For f(x) = 375 · (1/5)^x, what is f(3)?" (answer 3)
- numericErrors recomputed: f(2)=15, f(1)=75. Node verified 375÷5=75, 75÷5=15, 15÷5=3.
- approxConstants/approxFormula updated to a 3-factor (1/5) chain; `variant` removed (conceptTag
  `exp-growth-decay` kept for remedial routing).

reviewBasisHash after edit: 8eba1b20ec23496ffe55a2b603ae2ddc119ed6678a82c1c3802c9fc2ee1d9884

## exp-01-03 — PROGRESSION-exp-01-03 (k2 k3 ch1) — KEEP, no edit

Constant-ratio group (k1/k2): different ratios, KEEP. Next-term group (i2 ref/k3/ch1): i2 and ch1
share ratio 3 but every digit of the two sequences differs (2,6,18,54 vs 5,15,45,135) and the final
answers differ (162 vs 405, no collision) — ch1's 3-digit numbers are a genuine magnitude escalation.
Unlike exp-01-02, no shared final answer here.

reviewBasisHash (unchanged): 2376733f298682f7d6e8d879563d8a4b358bc58190a23965d1ea9ebf55f001ab

## exp-03-01 — PROGRESSION-exp-03-01 (i2 i3 k2 k3 ch1) — KEEP, no edit

Six items use five distinct bases (3,5,10,2,4→2,3) and five distinct answers. k3 additionally targets
a categorically distinct misconception (rational exponent, requires a base rewrite: 4^x=8 → x=3/2).
k1 and ch1 share base 3 but different targets (3⁴=81 vs 3⁵=243, answers 4 vs 5) — a legitimate
"go one power further" capstone given four other bases already supply variety.

reviewBasisHash (unchanged): 63feb82dd5115f8a66a2d39a1b4d4d34c8f0877b36747786212ccd21b9fb7a3f

## exp-03-02 — PROGRESSION-exp-03-02 (i2 i3 k2 k3 ch1) — REVISE: i2 and ch1 rewritten

The packet's most severe true duplicate: i2 (5·2^x=40), k2 (7·2^x=56), and ch1 (6·2^x=48) all reduced
to the IDENTICAL sub-problem 2^x=8 (x=3) — same base, same intermediate value 8, and the
numericErrors feedback text was verbatim identical across all three. Rewrote two of the three:

- i2: "Solve 5 · 2^x = 40." (answer 3) → "Solve 3 · 10^x = 300." (answer 2). Node verified
  300÷3=100=10². Traps: 100 (stopped early), 297 (subtraction slip).
- ch1: "Solve 6 · 2^x = 48." (answer 3) → "Solve 5 · 4^x = 80." (answer 2). Node verified
  80÷5=16=4². Traps: 16 (stopped early), 75 (subtraction slip). `variant` removed (conceptTag
  `exp-coeff-equation` kept for remedial routing).

After the edit, bases in play are 3,10,3,2,5,4 with six distinct intermediate values (27,100,9,8,25,16)
— no remaining sub-problem collision.

reviewBasisHash after edit: 436ff59efb0b7aa2763f02ae2e90de54fdb18e9c74f1ea7b21b4c31d40779bec

## exp-03-03 — PROGRESSION-exp-03-03 (k1 k2 k3 ch1) — REVISE: ch1 rewritten

Fraction-base group (i2 ref/k3) already varies base and exponent depth, KEEP. Negative-exponent group
(k1/k2/ch1): k1 (base 3, x=−2) and ch1 (base 5, x=−2) shared the identical exponent MAGNITUDE — ch1,
meant to be hardest, was no deeper than the first check. Rewrote ch1 to a deeper exponent on a fresh
base:

- prompt: "Solve 5^x = 1/25." (answer −2) → "Solve 10^x = 1/1000." (answer −3). Node verified
  10³=1000. Traps: 3 (positive-exponent slip), 1000 (denominator-confusion slip). `variant` removed
  (conceptTag `exp-negative-exponent` kept for remedial routing).

reviewBasisHash after edit: 92f82a92bea311b7d80159620e5643f9d8d9bfde4342660f7b9c136868d1c458

## exp-04-01 — PROGRESSION-exp-04-01 (k3) — KEEP, no edit

k1 (a=3,b=4→3) and k3 (a=10,b=3→10): different coefficient, base, and y-intercept answer. Standard
2-item pair, no collision.

reviewBasisHash (unchanged): fe170121f6de5bab8316bb4ebc9dda127bd4e63dcb6d66c3e91e12c0cb643c42

## exp-04-02 — PROGRESSION-exp-04-02 (k3) — KEEP, no edit

k1 (a=10,b=2,x=2→40) vs k3 (a=1,b=4,x=3→64): fully distinct triple; k3's a=1 additionally tests a
distinct identity-coefficient edge case. No collision.

reviewBasisHash (unchanged): 98e262509d63004f21daa25c437a02d9b3f99d0a9588b721fd89c06fb0be1275

## exp-04-03 — PROGRESSION-exp-04-03 (k1 ch1) — KEEP, no edit

Classify group (i2 ref/k1): opposite categories (exponential vs linear) — a distinct classification
job, same accepted pattern as fn-04-01. Evaluate group (k2 ref/ch1): share base 2 but different
coefficient, exponent, and final answer (48 vs 40, no collision).

reviewBasisHash (unchanged): 960056533ad99a748ce3e48939a6cc259e1530c72255ad007ab16cc39b530f68

---

## pr-02-01 — PROGRESSION-pr-02-01 (k1 i2 i3 k2 k3 ch1) — KEEP, no edit

Yes/no "is this table proportional" classification lesson. 4 YES cases (constants 3,4,2/3,5 — all
distinct, one fractional) and 3 NO cases (broken ratios 10/3, 9/2, 16/5 — all distinct). No two items
share a constant or a broken-ratio value; every distractor's feedback is re-derived per item.

reviewBasisHash (unchanged): ae92c3ee4455fa887f58133dc7772a95839112f96b805209f9dbedf127ca6f99

## pr-02-02 — PROGRESSION-pr-02-02 (i2 k2 k3) — KEEP, no edit

"Find k" group: k1 (numeric, k=6) vs i2 (mcq, k=3/4) vs k2 (choice, k=3/5) — three response formats,
three distinct constants, i2/k2 a legitimate fractional-constant practice-check pair. "Use k to
predict y" group: i3(k=3,x=10→30)/k3(k=4,x=5→20) — standard distinct pair. No collision.

reviewBasisHash (unchanged): ca9da25039fbf5cbdaabf0ed18c9bf9362f482c6e12214fd1d3524c9038063e2

## pr-02-03 — PROGRESSION-pr-02-03 (i2 k2 ch1) — KEEP, no edit

Three groups, each a standard 2-item pair with a real distinguishing feature (opposite verdicts;
whole vs fractional constant; different k/x/y with ch1 billed as a "full mixed challenge"). No
collision found.

reviewBasisHash (unchanged): 9a93ac26c2cb811e21e4fdc0875defec0d3aaeebe79ccd3f5819bdb25927876d

## pr-03-01 — PROGRESSION-pr-03-01 (k1 i3 k2 ch1) — KEEP, no edit

k1 (k=1) is the special identity-line case. i3 (k=4) is fresh alongside i2 (k=3). k2 (k=2) reuses
i1's constant deliberately, under a reduced-scaffold template (2 given points, a subset of i1's own
points) — its body text literally reads "Plot the line for k = 2 again," an explicit retrieval-
practice framing. ch1 (rate 2/3) adds a genuinely new trap (mistaking the line for slope=1) beyond
k3 (rate 1.5).

reviewBasisHash (unchanged): 6eafa7aa5e8b2208e637941b06a67f16f97a04a7e561773fc23ccf8a8c992141

## pr-03-02 — PROGRESSION-pr-03-02 (k1 i3 k2 k3 ch1) — KEEP, no edit

Unit-rate-point group (i1=3/k1=5/k2=2): an atomic single-point-plot skill with only one possible trap
(axis-swap) — three distinct k values is transparent, proportionate drill, not a disguised duplicate.
Read-the-rate group (i2=(1,6)→6, the degenerate x=1 case / i3=(4,20)→5 / k3=(3,18)→6 via actual
division / ch1=(8,24)→3): i2/k3 share a value incidentally (unrelated points, different required
operation), not a hidden identical sub-problem.

reviewBasisHash (unchanged): 5fdc73d038f4ff523acf169edbb1488060ec81bf4aa5b9549055f22d6206da82

## pr-03b-01 — PROGRESSION-pr-03b-01 (i2) — KEEP, no edit

i1 (k=5) intro; i2 (k=7) explicitly billed as "a steeper relationship" — deliberate constraint
escalation, only 2 items, no collision.

reviewBasisHash (unchanged): 578e62e62ac631754b0a22e41adc3fdc2696c724ce29173614d7b501d84ba1c0

## pr-04-01 — PROGRESSION-pr-04-01 (k2 k3) — KEEP, no edit

Tip group (k1 $50@8%→54 / k3 $10@25%→12.5) and tax group (i3 $200@6%→212 / k2 $80@5%→84): every
price, percent, and total distinct across both groups.

reviewBasisHash (unchanged): 551a803128ecbbab55ec17eb6df639bd6adac8462fc660c105c2c2794ce682b8

## pr-04-03 — PROGRESSION-pr-04-03 (i3 k2 k3 ch1) — REVISE: ch1 rewritten

Falls group (i2/i3, both -20%): distinct second-trap targets (raw-change vs divide-by-new-value),
KEEP. Rises group: k1 (+25%) distinct, but k3 (50→60, +20%) and ch1 (75→90, +20%) were a true
duplicate — identical final answer AND an identical second-trap value (16.67 in both). Rewrote ch1:

- prompt: "A price rises from 75 to 90. What is the percent change?" (answer 20)
  → "A price rises from 40 to 52. What is the percent change?" (answer 30)
- commonErrors recomputed: raw-change trap 12; divide-by-new-value trap 12÷52×100=23.08. Node
  verified (52−40)÷40×100=30.
- `variant` removed (conceptTag `pr-percent-change` kept for remedial routing).

reviewBasisHash after edit: cc124114989139b914622ec976021b9f6667e5fa281d1f30f043558de62644ca

## pr-04b-01 — PROGRESSION-pr-04b-01 (i2) — KEEP, no edit

i1 ($500@4%, percentStep 1) vs i2 ($1,200@10%, percentStep 5): different principal, rate, and
interaction granularity; i2's own body text reads "A different rate, same structure" — an honest,
deliberate 2-item manipulative-practice pair.

reviewBasisHash (unchanged): fd6f89f440d824ad852e6f4d8283437fb5428e5d41bf19ad4a34b162fd6ae207

---

## Packet summary

28/28 lessons dispositioned (all `decision: KEEP` — the queue-closing disposition; see per-lesson
classification below for which were (a) no-edit-needed vs (b) redesigned-then-closed). 10 lessons
required a content edit (one step rewritten per lesson, occasionally two): fn-02-02, fn-02-03,
fn-03-01, fn-03-02, fn-03-03, fn-04-02, exp-01-02, exp-03-02, exp-03-03, pr-04-03. 18 lessons were
KEEP with no edit. Zero ESCALATE — no fix in this packet needed `src/**` work. Zero CHOICE_SURFACE_INTEGRITY
cross-fixes applied (verified clean against all 28 lesson ids at the top of this packet). All edits
stayed inside `content/courses/{functions-and-sequences,exponential-functions,proportional-relationships}/lessons/`.
