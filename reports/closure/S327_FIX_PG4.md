# S327-PG4 — LESSON_PROGRESSION_AND_DUPLICATION closure (29 lessons, 7 courses)

Fixer: cowork-s327-PG4-fixer. Scope: `PREMIUM_PENDING_WORKLOAD_QUEUE.csv` rows under workstream
`LESSON_PROGRESSION_AND_DUPLICATION` for 29 named lessons across `functions-g8`,
`arrays-even-odd-g2`, `number-line-g2`, `long-division-g5`, `data-graphs-g1`, `radical-functions`,
`shapes-measure-g1`, plus the two `CHOICE_SURFACE_INTEGRITY` rows already known to co-locate on
`fg-01-02` and `g5l-01-01`. Every other lesson in scope was independently grepped against
`CHOICE_SURFACE_INTEGRITY` in the same CSV; no further rows exist for this scope (confirmed by a
full-file parse: 232 total `CHOICE_SURFACE_INTEGRITY` rows in the file, only the two named ones
match this scope's lesson ids).

**Method.** For each lesson, every step named in `mismatch_evidence` was read against the rest of the
lesson's own steps. `number-normalized-prompts` is a purely textual signal (digits replaced with `#`,
whitespace collapsed) — it cannot distinguish a deliberate contrastive pair (e.g. the same setup with
the correct answer flipped) from an accidental copy-with-new-numbers. Each flagged step was judged on
its actual mathematical/pedagogical job:

- **KEEP** — the repeat carries a real, distinct job: a flipped answer that defeats a specific
  heuristic/misconception, a new numeric threshold crossed (e.g. one bundle vs two), a sign change, a
  different sub-case of the same rule, etc. Left untouched; rationale recorded below.
- **REWRITE** — the repeat is the same job at the same difficulty with only cosmetic number changes.
  The flagged (later) step was rewritten to differ in representation, constraint, or misconception
  while keeping the lesson's grade register; all math was recomputed and hand-verified in `node`
  one-offs (no `npm`/`vitest`/`tsc`/builds were run, per container constraints); every commonError
  value was re-checked to differ from the new answer and from every other trap.

Only files under `content/courses/<course>/lessons/` were touched, and only the lesson ids assigned to
this lane. No `src/**`, `scripts/**`, ledger, or other staging file was edited. Where a step's content
was changed enough to diverge from its authored `variant.gen`/`variant.form` generator template, the
`variant` field was removed rather than left stale, and that is called out per-lesson below as
`VARIANT_LOG debt` (matching the convention already used in `laneA-s318-prog.jsonl`).

Disposition records are appended to `reports/closure/cowork-staging/laneA-s327-PG4.jsonl`
(schema: `lesson-disposition`, one line per lesson, `decision:"KEEP"` per the closure schema —
i.e. "this queue row is now resolved," with the KEEP/REWRITE substance captured in `rationale`).

---

## fg-01-02 — functions-g8

**Class:** (b) true duplicate on k3; (a) legitimate contrast on k1/i2  **Disposition:** MIXED — k3 rewritten; k1/i2 kept; CHOICE cross-fix on i2

**Flagged:** `i2`, `k3` (number-normalized-prompts) + `i2` (CHOICE_SURFACE_INTEGRITY length leak, CHOICE-0013).

- `k1` ("Is this a function? (4,1),(5,3),(4,9)", repeated INPUT -> NOT a function) and `i2` ("Is this a function? (1,8),(2,8),(3,8)", repeated OUTPUT -> IS a function) share the bracket-pair skeleton by design: an immediate yes/no contrast isolating input-vs-output. **KEPT.**
- `k3` duplicated `i2`'s exact job (repeated-output-still-a-function, all-same-output case "(2,1),(4,1),(6,1)"). **REWRITTEN** to `"A table has inputs 2, 5, 9 with outputs 7, 7, 3. Is it a function?"` — a partial repeat (only 2 of 3 outputs match), table framing instead of bracket-pair framing. Answer: Yes (inputs 2,5,9 all unique). Distractors recomputed: "No — the output 7 repeats" / "No — a table function needs every output to differ" / "Only if 9 also had output 7", each with feedback naming the actual rule.
- CHOICE fix: `i2` option `a` shortened from `"Yes — each input appears once (the repeated output is fine)"` (59 chars) to `"Yes — each input appears exactly once"` (37 chars) — no longer the longest option (tied with a 37-char distractor); explanation preserved in `feedback`, not the label.

## fg-02-01 — functions-g8

**Class:** (b) true duplicate on k2; (a) legitimate escalation on k1/k3  **Disposition:** MIXED — k2 rewritten; k1/k3 kept

**Flagged:** `k2`, `k3` (number-normalized-prompts).

- `k1` (rate 4, positive) and `k3` (rate −3, negative, body "A negative rate of change") deliberately flip the sign to test that a decreasing output gives a negative rate — same skeleton by design. **KEPT.**
- `k2` duplicated `k1`'s exact job (another positive two-point rate, 5 instead of 4). **REWRITTEN** to `"A table lists (x, y) pairs: (2, 7), (4, 7), (6, 7). What is the rate of change?"`, answer `0` (constant function, a new zero-rate edge case). `commonErrors`: value `7` ("That's the output value ... not the CHANGE"), value `2` ("That's the change in x, not the rate"). `variant` tag removed — `fgRateWide` only emits wide positive-gap prose problems, not this table/zero-rate job (VARIANT_LOG debt).

## fg-02-02 — functions-g8

**Class:** (a) legitimate escalation  **Disposition:** KEEP — no file changes

**Flagged:** `ch1` (number-normalized-prompts, paired with `k2`).

`k2` uses all-positive coordinates (2,3)-(5,12); `ch1` uses a negative x-coordinate (−1,2)-(3,14), forcing run = 3−(−1) = 4 instead of a straight subtraction of two positives. This is a distinct, harder sign-handling constraint the lesson's own body text calls out ("A slope with a negative coordinate"). Judged legitimate escalation. **KEPT, no edit.**

## fg-03-02 — functions-g8

**Class:** (a) legitimate contrast  **Disposition:** KEEP — no file changes

**Flagged:** `k1` (number-normalized-prompts, paired with `i1`).

`i1` and `k1` are the only two steps in the lesson comparing an equation against a table, and they deliberately flip which one wins (table wins at `i1`, equation wins at `k1`, body text "Equation vs table, the other way"). Every choice set in this lesson carries a `misconception:b` distractor of the form "because it's a(n) equation/table" — the flip exists specifically to defeat that source-kind heuristic from both directions. Judged intentional contrastive design. **KEPT, no edit.**

## fg-04-01 — functions-g8

**Class:** (a) legitimate contrast/escalation  **Disposition:** KEEP — no file changes

**Flagged:** `i2`, `k2` (number-normalized-prompts, paired with `k1`).

All three share the table skeleton but differ in job: `k1` = nonlinear via quadratic growth (1,3,5), `i2` = nonlinear via doubling (2,4,8; a distinct misconception target, "each output is double the last"), `k2` = the complementary LINEAR case, decreasing by a constant −2. Two nonlinear flavors plus the linear counter-example is real contrast. **KEPT, no edit.**

## g2a-01-01 — arrays-even-odd-g2

**Class:** (a) legitimate spaced practice  **Disposition:** KEEP — no file changes

**Flagged:** `i2`, `k2`, `ch1` (number-normalized-prompts).

`i1`(14,even)/`i2`(15,odd) and `k1`(14,even)/`k2`(11,odd) are necessary odd+even coverage pairs on the two widget types used in this lesson (interactive pairing, then a plain check). `ch1`(18,even) repeats k1's parity but a fresh number; its body text "One more, for the road" self-documents it as deliberate fluency practice. **KEPT, no edit.**

## g2a-01-03 — arrays-even-odd-g2

**Class:** (a) legitimate spaced practice / inductive evidence  **Disposition:** KEEP — no file changes

**Flagged:** `i2`, `k3`, `ch1` (number-normalized-prompts).

`i1`(16)/`i2`(12) both confirm the same-invariant claim (doubles are always even) with independent counts — legitimate repeated evidence for a generalization. `k1`(7+7=14)/`k3`(6+6=12)/`ch1`(9+9=18) are three distinct doubles facts under a fluency objective — each is its own memorization target. **KEPT, no edit.**

## g2a-01-04 — arrays-even-odd-g2

**Class:** (a) legitimate spaced practice  **Disposition:** KEEP — no file changes

**Flagged:** `i2` (number-normalized-prompts, paired with `i1`).

`i1`(18,even)/`i2`(13,odd) is the same even/odd positive-negative contrast pattern used as a warm-up review across this course (see g2a-01-01). The lesson's actual new content (k1-ch1, doubles-as-equations) is untouched and unflagged. **KEPT, no edit.**

## g2a-03-01 — arrays-even-odd-g2

**Class:** (b) true duplicate on k3  **Disposition:** REWRITTEN — k3

**Flagged:** `k3` (number-normalized-prompts, paired with `k1`).

`k1` and old `k3` were the same BY-ROWS MCQ job with the same row-size (6), only the row COUNT differed (4 vs 3) — a true duplicate. **REWRITTEN**: `k3` now asks `"An array has 3 rows with 5 dots in each row. Which repeated sum counts it BY COLUMNS?"`, correct `3 + 3 + 3 + 3 + 3` (5 columns of 3). Distractors: `5 + 5 + 5` (BY ROWS trap, mirrors k1's own by-columns trap in reverse), `3 + 5` (mixing counts), `4 + 4 + 4 + 4 + 4` (wrong column height). This exercises the orthogonal BY-COLUMNS framing the lesson's `c2`/`i2` steps already set up, instead of repeating BY-ROWS with a smaller row count.

## g2l-02-01 — number-line-g2

**Class:** (b) true duplicate on ch1, resolved via a genuine new constraint  **Disposition:** REWRITTEN — ch1

**Flagged:** `ch1` (number-normalized-prompts, paired with `k1`).

`k1`(57+20=77) and old `ch1`(52+40=92) were the same no-carry, under-100 ten-jump addition — a true duplicate, since this task family structurally cannot vary except by crossing the 100 boundary. **REWRITTEN**: `ch1` now reads `"68 + 50 = ? (jumping forward by tens on the line)"`, answer `118` (crosses 100). Traps: `73` (jumps read as ones), `128` (one hop too many). `variant` tag removed — `Add2DigitNumeric` caps its sum at 99 and cannot regenerate this instance (VARIANT_LOG debt).

## g2l-02-02 — number-line-g2

**Class:** (b) true duplicates on k2 and ch1  **Disposition:** REWRITTEN — k2 and ch1

**Flagged:** `k2`, `ch1` (number-normalized-prompts, paired with `k1`).

All three (`k1`=46−20=26, old `k2`=62−40=22, old `ch1`=65−40=25) were the same no-borrow, 2-digit 'jump backward by tens' job. **REWRITTEN**: `k2` -> `"Jumping backward by tens, 74 lands on 34. How many ten-hops was that?"` = `4` (inverse question: hop-count, not landing). `ch1` -> `"58 − 50 = ? (jumping backward by tens)"` = `8` (crosses below ten; new trap: answering the hop-count `5` instead of the landing `8`). `k1`/`ch1` now form a deliberate basic-vs-edge-case pair. `variant` removed from both edited steps — `Pv1000SubtractByPlaceNumeric` only emits 3-digit problems and was already mismatched lesson-wide before this edit.

## g2l-03-02 — number-line-g2

**Class:** (b) true duplicate on ch1, resolved via a genuine new constraint (regrouping)  **Disposition:** REWRITTEN — ch1

**Flagged:** `k2`, `ch1` (number-normalized-prompts).

`k2`(64−43=21) and old `ch1`(43−22=21) were the same no-regroup gap subtraction. **REWRITTEN**: `ch1` now reads `"52 − 24 = ? (the gap between the two marks)"` = `28`, which requires borrowing (unlike every other numeric item in the lesson). Traps: `32` (smaller-from-larger digit bug), `38` (borrowed correctly in the ones but forgot to reduce the tens). `variant` tag removed (pre-existing 3-digit-only mismatch, see g2l-02-02).

## g2l-03-03 — number-line-g2

**Class:** (b) true duplicate on k2; (a) legitimate spaced retrieval on k1/ch1  **Disposition:** REWRITTEN — k2; k1/ch1 kept

**Flagged:** `k2`, `ch1` (number-normalized-prompts, paired with `k1`).

`k1`(74−30=44) and `ch1`(41−20=21) are a legitimate final-challenge echo of the first check — **KEPT**. `k2` (50−20=30, sitting between them with no distinguishing role) was the true duplicate. **REWRITTEN** to the BACKWARD-route framing `i2` already sets up: `"A route starts at 80 and lands at 50, moving backward. What is the missing jump?"` = `30`. Traps: `130` (added instead of subtracted), `50` (landing mistaken for the jump). `variant` tag removed from `k2` only (pre-existing 3-digit-only mismatch; `k1`/`ch1` untouched).

## g2l-03-04 — number-line-g2

**Class:** (b) true duplicate on ch1, resolved via a genuine new constraint (regrouping)  **Disposition:** REWRITTEN — ch1

**Flagged:** `k2`, `ch1` (number-normalized-prompts).

`k2` (46−14=32) and old `ch1` (45−13=32) were the same no-regroup word problem, same total. **REWRITTEN**: `ch1` now reads `"Maggie is at marker 71. How far behind her is marker 44? Compute 71 − 44."` = `27` (requires regrouping). Traps: `33` (smaller-from-larger digit bug), `37` (forgot to reduce the tens after borrowing). `variant` tag removed (pre-existing 3-digit-only mismatch, see g2l-02-02).

## g5l-01-01 — long-division-g5

**Class:** (a) legitimate spaced practice on i1/i2; (b) true duplicate on ch1, resolved via a genuine new case; CHOICE cross-fix on k1  **Disposition:** REWRITTEN — ch1; i1/i2 kept; CHOICE fix on k1 (+ remedial consistency trim)

**Flagged:** `i2`, `ch1` (number-normalized-prompts, LESSON_PROGRESSION_AND_DUPLICATION) + `k1` (CHOICE_SURFACE_INTEGRITY, CHOICE-0025, lone-justification leak).

`i1`/`i2` are legitimate core-skill practice (each divisor needs its own compatible-pair reasoning) — **KEPT**. `k2`/old-`ch1` were a true bare-multiplication duplicate. **REWRITTEN**: `ch1` -> `"Estimating 187 ÷ 23, which pair of compatible numbers helps most?"`, correct `"180 ÷ 20 = 9"` — the ROUND-DOWN case k1's round-up example never tests. `variant` removed (widget type changed numeric->mcq).

**CHOICE fix:** `k1` option `o0` trimmed from `"600 ÷ 25 = 24, since 25 divides 600 exactly"` to `"600 ÷ 25 = 24"` — was the only option carrying a justification clause (a writing tell); reasoning kept in `feedback`. Applied the same trim to the remedial's byte-identical copy for consistency.

## g5l-01-02 — long-division-g5

**Class:** (b) true duplicate on k3  **Disposition:** REWRITTEN — k3

**Flagged:** `k3` (number-normalized-prompts, paired with `k2`).

`k2`(340÷20=17) and old `k3`(260÷20=13) used the identical divisor 20 — no generalization tested in a lesson about generalizing across multiples of ten. **REWRITTEN**: `k3` now reads `"Compute 600 ÷ 40 — dividing by a multiple of ten."` = `15`, using divisor 40 (matching the lesson's own `i2` example) instead of reusing 20. Traps: `150` (divided by 4 not 40), `60` (divided by ten alone). `variant` removed — pre-existing mismatch (`mbDivideBigNumeric` draws single-digit divisors only).

## g5l-03-02 — long-division-g5

**Class:** (a) legitimate spaced practice  **Disposition:** KEEP — no file changes

**Flagged:** `i2` (number-normalized-prompts, paired with `i1`).

`i1`(23,24,8->560) and `i2`(18,27,13->499) are core practice of the same 'rebuild the dividend' slider mechanic with fresh, independent (quotient, divisor, remainder) triples — no other escalation axis is available for this specific widget. The lesson's actual checks (`k1`-`ch1`) already diversify into four distinct sub-skills and are unflagged. **KEPT, no edit.**

## dgr1-01-03 — data-graphs-g1

**Class:** (a) legitimate spaced practice / threshold escalation  **Disposition:** KEEP — no file changes

**Flagged:** `k3`, `ch1` (number-normalized-prompts, paired respectively with `k1` and `k2`).

`k1`(N=7->1 group) and `k3`(N=13->2 groups) escalate a genuine threshold: 13 is the lesson's first case with TWO complete five-bundles. `k2`(N=8->3 singles) and `ch1`(N=13->3 singles) likewise escalate the decomposition difficulty (2 groups instead of 1) even though the leftover digit coincides at 3. `k3`/`ch1` together decompose the SAME total (13) as a deliberate two-step 'find the groups, then the leftover' workflow. **KEPT, no edit.**

## dgr1-01-04 — data-graphs-g1

**Class:** (b) true duplicate on k2  **Disposition:** REWRITTEN — k2

**Flagged:** `k2` (number-normalized-prompts, paired with `k1`).

`k1`(1 group, 2 marks->7) and old `k2`(1 group, 3 marks->8) shared the same singular-group/plural-marks grammatical skeleton with only a fluency-level digit change. **REWRITTEN**: `k2` -> `"A tally row shows 1 crossed five-group and 1 single mark. How many does it count?"` = `6` — the lesson's one unused (1 group, 1 single) slot, grammatically distinct (singular 'mark') from k1's plural 'marks', and the smallest possible reading case. `variant` tag kept (g=1,sg=1 is in-range for `GdTallyReadNumeric` and matches its output exactly).

## dgr1-02-03 — data-graphs-g1

**Class:** (b) true duplicate on k3; (a) legitimate spaced retrieval on k1/ch1  **Disposition:** REWRITTEN — k3; k1/ch1 kept

**Flagged:** `k3`, `ch1` (number-normalized-prompts, paired with `k1`).

`k1`, old-`k3`, and `ch1` were three instances of the identical 'shorter by' subtraction job with no escalation axis available in this widget family. `k1`/`ch1` are a legitimate first-check/final-challenge pair — **KEPT**. `k3` was the gratuitous third repeat. **REWRITTEN**: `k3` -> `"On a bar graph, the Cats bar reaches 5. The Dogs bar is 4 taller. How tall is the Dogs bar?"` = `9` — the mirror ADDITION case ('taller' instead of 'shorter'), targeting the reverse misconception. `variant` removed — the generator only emits the 'shorter' framing.

## dgr1-02-04 — data-graphs-g1

**Class:** (b) true duplicate on k3; (a) legitimate spaced retrieval on k1/ch1  **Disposition:** REWRITTEN — k3; k1/ch1 kept

**Flagged:** `k3`, `ch1` (number-normalized-prompts, paired with `k1`).

Same pattern as `dgr1-02-03`: `k1`, old-`k3`, `ch1` were three identical 'shorter by' subtraction instances. `k1`/`ch1` — **KEPT** (legitimate first-check/final-challenge pair). **REWRITTEN**: `k3` -> `"On a bar graph, the Cats bar reaches 6. The Dogs bar is 2 taller. How tall is the Dogs bar?"` = `8` — the mirror ADDITION case. `variant` removed — the generator only emits the 'shorter' framing.

## re-01-01 — radical-functions

**Class:** (a) legitimate spaced practice / distinct sub-skill  **Disposition:** KEEP — no file changes

**Flagged:** `k3` (number-normalized-prompts, collides with `k1`'s 'Write x^(m/n) as a radical' template).

`k1` (numerator 2, nontrivial power) and `k3` (numerator 1, body explicitly 'Unit fraction shortcut') look alike as text but require structurally different builds: k1's correct answer includes a power tile ((x²) inside the radical); k3's correct answer has NO power tile at all (bare x under the root) — the exact m=1 special case c2 calls out by name, with distractors tuned to a different misconception. **KEPT, no edit.**

## re-02-01 — radical-functions

**Class:** (a) legitimate spaced practice / capstone integration  **Disposition:** KEEP — no file changes

**Flagged:** `k1`, `ch1` (number-normalized-prompts).

`k1` is a single-technique rationalization on an already-prime radicand (√5). `ch1` (body: 'Full pipeline.') is the deliberate capstone that chains `k2`'s radical-simplification technique (√27 = 3√3) with `k1`'s rationalization technique on the resulting 3/√3 — genuine skill integration, strictly more work than k1 alone, not a repeat of it. **KEPT, no edit.**

## re-03-01 — radical-functions

**Class:** (a) legitimate spaced practice / distinct pedagogical target  **Disposition:** KEEP — no file changes

**Flagged:** `k1` (number-normalized-prompts, collides with `i1`'s 'what is f(N)?' template).

`i1` (numeric widget) tests pure computation fluency (traps: halved or squared the input). `k1` (mcq widget, body 'The principal root.') is the lesson's first check of its actual thesis — √ returns ONE nonnegative value — with `±3`/`−3` offered as selectable distractors, a misconception check a numeric-input widget cannot represent. The widget-type change is what enables the check, not incidental variation. **KEPT, no edit.**

## re-05-02 — radical-functions

**Class:** (a) legitimate spaced practice / deliberate 3-way contrast set  **Disposition:** KEEP — no file changes

**Flagged:** `i2`, `k3` (number-normalized-prompts, collide with `k1`'s 'how many real solutions' template).

`k1` (even numerator, positive target -> 2 solutions), `i2` (body: 'Odd numerator control case' -> 1 solution), and `k3` (body: 'A negative target' -> 0 solutions) are an explicit, labeled 3-way contrast covering the lesson's full case analysis (numerator parity × target sign), matching the recap's three stated rules verbatim. Not duplication — compare-and-contrast by design. **KEPT, no edit.**

## smg1-01-01 — shapes-measure-g1

**Class:** (a) legitimate spaced practice / bookend difficulty escalation  **Disposition:** KEEP — no file changes

**Flagged:** `ch1` (number-normalized-prompts, collides with `k3`'s 'Which shape has N sides and N corners?' template).

`k3` (triangle, the lesson's first-taught, most familiar shape) and `ch1` (hexagon, the newest vocabulary word, introduced last in `c2`) bookend the full shape-name range rather than repeating one fact — easy-to-hard progression from most-familiar to newest name. Pentagon, the middle case, is deliberately tested by a different action (`i3`, touching corners) rather than a third 'name the shape' repeat. **KEPT, no edit.**

## smg1-04-01 — shapes-measure-g1

**Class:** (a) legitimate spaced practice / full clock-face coverage, no other escalation axis available  **Disposition:** KEEP — no file changes

**Flagged:** `i2`, `i3`, `k2`, `k3`, `ch1` (number-normalized-prompts, all collide with `k1`'s 'Set the clock to show H:00.' template).

This lesson is scoped to on-the-hour time only (by design — half-past and discrimination are the next two lessons), so the clockSet widget has exactly one remaining axis to vary: which hour. The full set (3,7,10,12,5,9,11) covers 7 of 12 clock positions with no repeats — necessary breadth for a spatial skill, not filler. `i3` (hour=12) additionally hits the explicit 'both hands overlap' special case from `c3`. **KEPT, no edit.**

## smg1-04-02 — shapes-measure-g1

**Class:** (a) legitimate spaced practice / full clock-face coverage, no other escalation axis available  **Disposition:** KEEP — no file changes

**Flagged:** `i2`, `i3`, `k2`, `k3`, `ch1` (number-normalized-prompts, all collide with `k1`'s 'Set the clock to show H:30.' template).

Same structure as `smg1-04-01`, scoped to half-past only: the clockSet widget's sole remaining axis is which hour, and the flagged set (7,9,5,11,1,8,12) covers 7 of 12 clock positions with no repeats. `ch1` (hour=12, body 'Crossing midnight/noon.') is the lesson's designated hardest case — the hour hand has just passed 12 — placed deliberately as the final challenge, directly tied to `c3`'s concept text. **KEPT, no edit.**

## smg1-04-03 — shapes-measure-g1

**Class:** (a) legitimate spaced practice / deliberate alternating discrimination sequence  **Disposition:** KEEP — no file changes

**Flagged:** `k1`, `i2`, `i3`, `k2`, `k3`, `ch1` (number-normalized-prompts, all collide with `i1`'s 'Set the clock to show H:MM.' template).

The normalizer strips minute digits along with hour digits, so it cannot see this lesson's actual subject: distinguishing on-the-hour from half-past. The real sequence alternates perfectly — `:00, :30, :00, :30, :00, :30, :00` across all seven steps — a deliberate discrimination-practice structure matching the lesson's own title and concept text, not duplication. Hour values (4,6,8,2,1,10,12) also cover 7 of 12 positions with no repeats; `ch1` (12:00) is the hardest discrimination case (both hands at 12 vs. half-past-11). **KEPT, no edit.**
