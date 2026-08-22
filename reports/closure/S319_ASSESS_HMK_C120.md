# S319 — Independent Assessment: how-many-k + counting-120

Reviewer: Claude Cowork independent assessor (S319)
Reviewed: 2026-08-20T12:35:14.000Z
Scope: `content/courses/how-many-k/course.json` + all 16 lessons in
`content/courses/how-many-k/lessons/`, and `content/courses/counting-120/course.json` + all 15
lessons in `content/courses/counting-120/lessons/`. Read-only review; dispositions staged to
`reports/closure/cowork-staging/laneB-s319-hmk-c120-dispositions.jsonl` (31 NDJSON lines, one per
lesson). This report does not write to any ledger.

Authority note: per `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md`, the repository source,
explicit human-decision ledgers, and current gate evidence are authoritative. The ChatGPT Work
cache is a derived evidence accelerator only — it was not consulted for, and cannot self-approve,
any lesson-content judgment below. All verdicts come from independently reading every lesson JSON
byte-for-byte, hand-recomputing every counting/arithmetic claim (one-to-one correspondence,
cardinality, count-on, decade rollovers, tens/ones decomposition, ten-more/ten-less), verifying
every figure ID against its registered component and accessible `<title>`, and running an
exact-match duplication scan across all `mcq`/`numeric` widget bodies in both courses (31 lessons,
zero missed).

## Course summaries

**how-many-k** (kindergarten, "How Many?") — 3 chapters, 16 lessons, all `readingProfile: "early"`:

| Chapter | Lessons |
|---|---|
| ch1 Touch and Count | khm-01-01 .. khm-01-05 |
| ch2 The Counting Rules | khm-02-01 .. khm-02-05 |
| ch3 One More and Quick Looks | khm-03-01 .. khm-03-06 |

Coherent build: one-to-one touch-pairing → no-skip/no-repeat → counting a line → counting a circle
(remembered start) → counting fixed pictures (marks) → cardinality (last word = the group) →
recount-only-on-change → order-irrelevance → conservation (spacing ≠ amount) → scattered counting
→ one-more-is-next-number → counting on from a known group → one-more as comparison (pairing with
a leftover) → counting out exactly N → subitizing (dice patterns) → subitizing with ten-frames. All
32 referenced figure IDs exist in `src/components/figures/howManyFigures.tsx`, each with an SVG
`<title>` and non-colour text/rule labels. Every concept-step body is ≤25 words, satisfying the K
reading-profile cap enforced by `src/lib/pedagogy.ts`. No generic ("try again"/bare "no") or
sub-25-character incorrect-answer feedback anywhere in the course.

**counting-120** (grade 1, "Count & Write to 120") — 5 chapters, 15 lessons, all
`readingProfile: "early"`:

| Chapter | Lessons |
|---|---|
| ch1 Counting Past Twenty | c120-01-01 .. c120-01-03 |
| ch2 The 120 Chart | c120-02-01 .. c120-02-03 |
| ch3 Reading & Writing Numerals to 120 | c120-03-01 .. c120-03-03 |
| ch4 Counting by Tens and Ones | c120-04-01 .. c120-04-03 |
| ch5 One/Ten More & Less | c120-05-01 .. c120-05-03 |

Coherent build: counting past 20 → decade rollovers (29→30, 39→40, …) → counting to 50 → chart rows
of ten → finding a number by row/spot → down-a-row-is-ten-more (column shares ones digit) →
tens-and-ones compose a numeral → tricky teens (13 vs. 31 digit-flip) → past 100 → skip-counting by
tens → counting a pile as tens+ones → tens/ones to 120 → one more/one less (with rollovers) → ten
more/ten less → mixing +10/±1 jumps. Every arithmetic claim in every `numeric`/`mcq`/`numberLineHop`
/`baseTenCompose`/`matchPairs`/`dragOrder` widget across all 15 lessons was independently
recomputed and confirmed correct — no math-truth defects were found in this course. All 25
referenced figure IDs exist and are registered with accessible titles.

## Decision counts

**how-many-k**: KEEP 11, REVISE 5, ESCALATE 0 (16/16 lessons signed).
**counting-120**: KEEP 14, REVISE 1, ESCALATE 0 (15/15 lessons signed).
**Combined**: KEEP 25, REVISE 6, ESCALATE 0 — 31/31 lesson dispositions recorded.

## Per-lesson verdicts

### how-many-k

- **khm-01-01** — KEEP / SUFFICIENT / FIT. Source lesson for a template later duplicated
  elsewhere (see khm-01-04, khm-02-05); this instance is original and sound.
- **khm-01-02** — KEEP / SUFFICIENT / FIT. No math or duplication defects.
- **khm-01-03** — KEEP / SUFFICIENT / FIT. Source lesson for a template later duplicated in
  khm-03-04; this instance is original and sound.
- **khm-01-04** — REVISE / SUFFICIENT / FIT — cross-lesson duplication: k2's mcq is byte-identical
  to khm-01-01/ch1 and khm-02-05/k2 (same child name, same numbers, same feedback).
- **khm-01-05** — REVISE / SUFFICIENT / FIT — prompt/feedback mismatch: ch1's prompt is about
  "stars" but its three feedback strings say "blocks" (unedited generator boilerplate).
- **khm-02-01** — KEEP / SUFFICIENT / FIT. No defects.
- **khm-02-02** — KEEP / SUFFICIENT / FIT. No defects.
- **khm-02-03** — KEEP / SUFFICIENT / FIT. No defects.
- **khm-02-04** — KEEP / SUFFICIENT / FIT. No defects.
- **khm-02-05** — REVISE / SUFFICIENT / FIT — severe cross-lesson duplication: k1 is byte-identical
  to khm-01-05/k2 and k2 is byte-identical to khm-01-01/ch1 (and khm-01-04/k2); 2 of 3 check items
  in this lesson are copies, neither exercising the lesson's own kch-count-scattered concept.
- **khm-03-01** — KEEP / SUFFICIENT / FIT. No defects.
- **khm-03-02** — KEEP / SUFFICIENT / FIT. No defects.
- **khm-03-03** — KEEP / SUFFICIENT / FIT. No defects.
- **khm-03-04** — REVISE / SUFFICIENT / FIT — cross-lesson duplication: ch1's mcq is byte-identical
  to khm-01-03/ch1, testing nothing specific to this lesson's "count out exactly N" topic.
- **khm-03-05** — KEEP / SUFFICIENT / FIT. Its two subitizeFlash widgets use different counts
  (3 vs. 4) and are correctly distinct.
- **khm-03-06** — REVISE / SUFFICIENT / FIT — within-lesson duplication: k2 and ch1 both flash the
  identical subitizeFlash stimulus (count 4, tenFrame arrangement, identical distractor set),
  giving the "challenge" step no new instructional content over the check it repeats.

### counting-120

- **c120-01-01** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-01-02** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-01-03** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-02-01** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-02-02** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-02-03** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-03-01** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-03-02** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-03-03** — REVISE / SUFFICIENT / REVISE — narration bug: c2's narration reads "…one
  thirteen is one hundred and thirteen…", mis-rendering the numeral 113 (spoken correctly as "one
  hundred thirteen" one clause earlier in the same sentence) as the nonstandard "one thirteen."
  Secondary: c1's narration "one hundred and thirteen more is one hundred thirteen" is homophonic
  with saying 113 itself and risks being misheard aloud. All written numerals and arithmetic in the
  lesson are correct; only the narration/read-aloud channel is defective.
- **c120-04-01** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-04-02** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-04-03** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-05-01** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-05-02** — KEEP / SUFFICIENT / FIT. No defects.
- **c120-05-03** — KEEP / SUFFICIENT / FIT. No defects. Course finale; closes coherently.

## Implementation contracts for every REVISE

### khm-01-04 (k2 duplication)

Replace step `k2`'s `widget` (currently the byte-identical "Noor counts her blocks: 1, 2, 3, 4, 5"
mcq shared with khm-01-01/ch1 and khm-02-05/k2) with a fresh `countObjectsMcq`-family instance that
does not collide with any prompt already used elsewhere in the course: pick a child name and block
count not already paired together anywhere in how-many-k (verified collision set: Mina+9, Noor+5,
Ravi+8/4, Kai+3/9, Lena+6/8, Tally+8/9 are all taken — e.g. "Sam counts her blocks: 1, 2, 3, 4, 3, 2, 1"
is invalid as a count but "Sam counts her blocks: 1, 2, 3, 4, 5, 6" with a fresh name/count pairing
such as "Priya…7" is open). Keep the same four-option correct/±1/±2 structure and feedback style
already used by every sibling instance so parity is preserved. `conceptTag` stays `kch-count-circle`.

### khm-01-05 (ch1 stars/blocks mismatch)

Rewrite ch1's three feedback strings to say "stars" (matching the prompt's "Eight stars each have
one tick…") instead of "blocks": `o0.feedback` → "Correct — the last number said, 8, tells how many
stars there are in all."; `o1.feedback` → "…saying one more number would count a star that is not
there."; `o2.feedback` → "…every star gets exactly one number, ending at 8."; `o3.feedback` →
"…the last number spoken is the answer, and it was 8." No change to `options` values, `correct`
flags, or the prompt itself.

### khm-02-05 (k1 + k2 both duplicated)

Replace step `k1`'s widget (currently byte-identical to khm-01-05/k2's "stickers scattered" mcq)
with a new mcq/widget specific to `kch-count-scattered` that is not reused from any other lesson —
e.g. a `tapDiagram` contrasting a scattered-and-marked record against scattered-and-unmarked, in
the same style as this lesson's own `i2` but as a graded check. Replace step `k2`'s widget
(currently byte-identical to khm-01-01/ch1 and khm-01-04/k2's "Noor…1-5" mcq) with a fresh
`countObjectsMcq` instance using a name/count pairing not already used elsewhere in the course (see
collision list under khm-01-04 above). Keep `k3` (numberLineHop, 9+3=12) and `ch1` unchanged — both
are original and correct.

### khm-03-04 (ch1 duplication)

Replace ch1's widget (currently byte-identical to khm-01-03/ch1's "Mina counts…1-5" mcq) with a
`countObjectsMcq`-family instance built around the lesson's own "count out exactly N" theme (e.g.
frame the challenge explicitly as counting-out crayons rather than a bare count-and-name-the-total
MCQ, or at minimum swap to a name/count pairing not already used elsewhere per the collision list
under khm-01-04). `conceptTag` stays `kch-count-out`.

### khm-03-06 (k2/ch1 identical subitizeFlash)

Change ch1's `subitizeFlash` parameters so the challenge presents a genuinely new stimulus rather
than repeating k2's: e.g. keep `arrangement: "tenFrame"` but change `count` to a different in-range
value not equal to 4 (update `options`, `commonPicks`, `missFeedback`, and `successFeedback` to
match the new target the way k2's are internally consistent with count 4), or keep count 4 but
change `arrangement` to `"dice"`/`"line"`/`"scatter"` so the visual pattern itself differs from k2's
ten-frame flash. Either change is sufficient as long as k2 and ch1 no longer share identical
`(count, arrangement)` stimulus parameters.

### c120-03-03 (narration bug)

In step `c2`, replace the narration string
`"Numbers like one hundred thirteen are one hundred and more: one thirteen is one hundred and thirteen. Write one, then the rest."`
with a version that reads 113 consistently both times, e.g.
`"Numbers like one hundred thirteen are one hundred and more: one hundred thirteen is one hundred and thirteen. Write one, then the rest."`
(no change to `body`, which is already correct). Optionally, to remove the secondary read-aloud
ambiguity in `c1`, reword its narration from
`"…count on: one hundred and thirteen more is one hundred thirteen."`
to something that inserts a clarifying pause or restructures the clause, e.g.
`"…count on: one hundred, and thirteen more, is one hundred thirteen."` — this second change is a
polish, not a correctness requirement, since the written `body` text (`"100 and 13 more is 113"`)
is unambiguous.

## Raw counts

- Lessons assessed: 31/31 (16 how-many-k + 15 counting-120).
- KEEP: 25 (11 how-many-k + 14 counting-120).
- REVISE: 6 (5 how-many-k: khm-01-04, khm-01-05, khm-02-05, khm-03-04, khm-03-06; 1 counting-120:
  c120-03-03).
- ESCALATE: 0.
- visualDecision: SUFFICIENT for all 31 lessons (every referenced figure/interactive widget exists,
  is registered, carries an accessible `<title>`/non-colour cue, and renders the claimed
  quantity/relationship; no missing or mismatched visual promise found).
- gradeLanguageDecision: FIT for 30/31; REVISE for c120-03-03 (narration-channel numeral error, see
  above). No K reading-profile word-cap violation found anywhere (all concept bodies ≤25 words).
- Duplication findings: 3 distinct MCQ templates each appear 2–3 times verbatim across how-many-k
  (Noor/1-5 ×3 lessons, Mina/1-5 ×2 lessons, "stickers scattered" ×2 lessons), plus 1 within-lesson
  subitizeFlash duplication (khm-03-06). counting-120 has zero duplicate widgets (exact-match scan
  across all 15 lessons returned no collisions).
- Math-truth findings: 0 arithmetic/counting errors in either course. All commonErrors/commonLandings
  /commonBuilds/commonPicks/misorderFeedback/pairErrors feedback strings name their misconception
  with the actual numbers involved; none are generic or under the 25-character diagnosis floor.
