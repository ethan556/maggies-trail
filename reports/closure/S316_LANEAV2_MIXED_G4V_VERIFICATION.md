# S316 Lane A V2 — Independent Verification: mixed-lane revisions + measure-problems-g4 post-fixup

Independent adversarial re-verification of 41 lesson revisions never previously verified (Scope A,
29 lessons across six courses) plus a post-fixup re-verification of measure-problems-g4 (Scope B, 12
lessons, g4v-01-01..03-04) after a later fixup packet edited 7 of the 12 (answer-give-away removal,
normalization reworks, concept-check fixes; see `reports/closure/S316_FIXUP_BATCH3.md`).

Method: for each lesson, read the original signed REVISE rationale from the ledger first, then read
the current lesson JSON and `git diff HEAD` in full, form an independent verdict by re-solving every
changed arithmetic problem, re-checking every trap for realness/distinctness/collision and every
feedback string for literal truth against the drawn problem, and cross-checking every reused or
newly-attached figure ID against its actual rendered SVG/title text in `src/components/figures.tsx`
against the specific numbers in the step it is attached to — only after forming an independent view
were implementer claims in `reports/closure/cowork-staging/laneA-mixed.jsonl` read and cross-checked.
No `npm`/`vitest`/`tsc` was run (raw source-level review only). No file was edited except the two
staging deliverables below.

## Verdict counts

- **41** lessons verified
- **29 KEEP**
- **12 REVISE** (all with `visualDecision: REQUIRED`; all for a figure/text mismatch, never a math
  defect, except one — see g5d-01-03 below, which is a feedback-accuracy defect, not a figure issue)
- **0 ESCALATE**

## Non-KEEP list with reasons

| Lesson | Reason |
|---|---|
| g5d-01-03 | k2's and ch1's "carry" trap feedback claims a dropped-ones-carry error (which would be 1.00 off from the answer) but the actual trap values are only 0.10 off; the feedback is not literally true of the drawn problem in either step. (Math/feedback defect, not a figure issue — no `visualDecision` set.) |
| bv-04-02 | ch1's attached figure `bv-rel-freq` is hardcoded to "÷ 50 (whole)" / "÷ 20 (adults)", numbers that belong to k2's own table but do not appear anywhere in ch1's new 60-student/30%/18 scenario. |
| g4v-01-01 | Remedial figure `rr-conversion` is hardcoded to "12 in = 1 ft" (imperial, factor 12); this lesson is metric-only (factor 100/1000). |
| g4v-01-02 | Main-route c1 figure `ratio-table` (flour/milk) still does not depict this lesson's meter/centimeter table — one of 8 known-open main-route defects, open by design. |
| g4v-01-03 | Same `rr-conversion` imperial-units defect as g4v-01-01. |
| g4v-02-01 | Main-route c1 figure `md3-liter` still does not depict the 1,000 mL equivalence — open by design. |
| g4v-02-02 | Main-route c1 clock figure still shows only 3:00, not 60 min/hr or 60 sec/min — open by design. |
| g4v-02-03 | Main-route c2 figure `two-step-bar` still shows an unrelated 18+24−15 join story, not equal-groups-then-subtraction — open by design. |
| g4v-02-04 | Main-route c1 figure `md3-elapsed` still shows a fixed 8:40–9:20 interval unrelated to this lesson's shifts — open by design. |
| g4v-03-01 | Main-route c1 figure `mmt-coin-total` still shows 23¢ from dimes/pennies, not the $25-passes scenario — open by design. |
| g4v-03-02 | Main-route c1 figure `line-plot` still shows five pencil lengths, not eight quarter-unit marks — open by design. |
| g4v-03-04 | Two open defects: main-route c1 (`mb-multistep`, equation-only) and c2 (`two-step-bar`, wrong structure); additionally the remedial reuses `two-step-bar`, which actively depicts the single-end-subtraction misconception the remedial is meant to reject. |

g4v-01-04 and g4v-03-03 are the only two Scope-B lessons with no open figure defect anywhere in the
lesson and are signed KEEP; g4v-01-01 and g4v-01-03 would otherwise also qualify (their main routes
were already fixed) but are demoted to REVISE solely by the newly-found `rr-conversion` remedial
defect below.

## Key finding: g5d-01-03 (math/feedback, not a figure issue)

k2: "Add 3.5 and 4.65 (padded 3.50)" → correct sum 8.15. The stored second trap is 8.05, and its
feedback reads *"The carried ten from 5 + 6 = 11 in the tenths column went missing — that carry adds
a whole 1.00 to the total."* A genuinely dropped ones-carry produces 8.15 − 1.00 = 7.15, not 8.05.
Hand-verified digit-by-digit that 8.05 is reachable only via a different, unstated mistake — misadding
the tenths column itself (treating 5+6 as 10 instead of 11). The identical pattern recurs in ch1
(6.80+2.57=9.37; trap 9.27 is 0.10 low; feedback again claims a 1.00-off dropped carry, which would
be 8.37). The padding trap in both steps (7.7 and 8.65 respectively) is correctly computed and
correctly described — only the second trap in each step has this feedback/value mismatch. The
implementer's own claim in `laneA-mixed.jsonl` describes only the padding trap and does not
acknowledge this inconsistency.

## Key finding: bv-04-02 (figure/text mismatch)

ch1 was rewritten to a new context (60 students, walk-vs-bus by lunch, 30%→18) but kept the
`bv-rel-freq` figure. That figure's SVG/title (`src/components/figures.tsx` lines 13797–13814) is
fully hardcoded to "÷ 50 (whole)" / "÷ 20 (adults)" — numbers that happen to match k2's own table
(child/adult × dog/cat, total 50, 20 adults) but do not appear anywhere in ch1's actual numbers. The
implementer's staging note frames the retention as a sound "denominator-model figure," which does not
address that its hardcoded totals no longer match the step it is attached to.

## Key finding: g4v-01-01 / g4v-01-03 (`rr-conversion` imperial-units mismatch, missed by the prior verification pass)

Both lessons' remedials now carry figure `rr-conversion`. Its full rendered content
(`src/components/figures.tsx` lines 858–867) is:

```
"12 in = 1 ft"
"ft → in: × 12"
"in → ft: ÷ 12"
```

with no parameterization whatsoever — it depicts US customary units at a factor of 12. Both lessons
are metric-only (meters/centimeters at factor 100; kilometers/meters at factor 1000). This is a live
figure-text mismatch. Notably, the **prior** independent verification pass
(`reports/closure/S316_LANEAV_G4_G5_VERIFICATION.md`) signed both of these lessons **KEEP**, stating
explicitly that "every reused figure ID was looked up in `src/components/figures.tsx` and its
rendered SVG text/labels were read to confirm it truthfully depicts... the generic relationship." That
check did not catch this hardcode for `rr-conversion`. This is flagged as a discrepancy against that
prior verification, independent of anything the current lane-A implementer claimed (the implementer
did not touch these two lessons' remedial figures in the currently-reviewed diff — the figure
attachment predates this diff and was carried over unchanged from the state that pass already
reviewed).

## Cross-check against `reports/closure/cowork-staging/laneA-mixed.jsonl` (Scope A, 32 records, 29 in scope)

Read only after forming an independent view, per instructions. All 29 in-scope claims were checked
against `git diff HEAD` for that lesson. Every described figure swap, every described step rebuild,
and every stale-variant-binding removal was confirmed to match the actual diff. Two discrepancies
found (both already covered above): (1) g5d-01-03's claim describes only the legitimate padding trap
and omits the carry-trap feedback/value mismatch; (2) bv-04-02's claim frames the retained
`bv-rel-freq` figure as sound without addressing that its hardcoded totals (50, 20) no longer appear
in ch1's rewritten numbers (60, 30%, 18). No other discrepancies found across the remaining 27
lessons — mb-05-02's explicit note that `visualDecision` was `PREFERRED` not `REQUIRED` (so no new
figure was owed) was verified against the original ledger rationale and found accurate.

## Scope B (measure-problems-g4) post-fixup re-verification detail

The 8 known-open main-route figure defects (documented pre-fixup in
`reports/closure/S316_LANEAV_G4_G5_VERIFICATION.md`) were independently re-confirmed still present
and unchanged in the current `git diff HEAD` for every one of the 8: g4v-01-02, g4v-02-01, g4v-02-02,
g4v-02-03, g4v-02-04, g4v-03-01, g4v-03-02, g4v-03-04. All 8 are signed REVISE / visualDecision
REQUIRED, per the task's explicit instruction not to sign KEEP on a lesson with a live figure-text
mismatch. For each of the 7 lessons the fixup packet touched (g4v-01-02, g4v-02-01, g4v-02-03,
g4v-02-04, g4v-03-01, g4v-03-02, g4v-03-03 per `S316_FIXUP_BATCH3.md`'s R2/R6/R9 fixes), the
remedial's numeric widget was independently re-derived and confirmed correct, with all traps real and
distinct. g4v-01-04 and g4v-03-03 have no open main-route defect and are signed KEEP outright.
g4v-01-01 and g4v-01-03 (previously signed KEEP pre-fixup, main route already fixed) are demoted to
REVISE solely by the newly-found `rr-conversion` remedial-figure defect above — their own remedial
check math is otherwise sound.

## Files written

- `reports/closure/cowork-staging/laneAV2-mixed-g4v-dispositions.jsonl` — 41 NDJSON disposition
  records, one per lesson, `recordId` `S316-V2-<lessonId>`.
- `reports/closure/S316_LANEAV2_MIXED_G4V_VERIFICATION.md` — this report.

No lesson, course, or other repository source file was modified.

---

## Superseding note (S316-V3, 2026-08-20T02:45:51.000Z)

A follow-up fix round landed for every defect this report flagged non-KEEP, plus the 8-lesson
main-route figure rebuild for `measure-problems-g4` and 3 unrelated misc-figure fixes
(`reports/closure/S316_RESIDUAL_FIXES_2.md`, `reports/closure/S316_G4V_FIGURE_REBUILD.md`,
`reports/closure/S316_MISC_FIGURE_REBUILD.md`). Fresh, independent dispositions for all 15
affected/new-in-scope lessons were signed to
`reports/closure/cowork-staging/laneAV3-residuals-dispositions.jsonl` (`recordId`
`S316-V3-<lessonId>`), **superseding** the S316-V2 records below for the lessons they cover. The
S316-V2 records above remain the disposition of record for every lesson NOT listed here.

**Verdict counts (15 lessons): 12 KEEP, 3 REVISE.**

| Lesson | S316-V2 verdict | S316-V3 verdict | What changed |
|---|---|---|---|
| g5d-01-03 | REVISE | **KEEP** | Both k2's and ch1's carry-trap feedback rewritten to name the actual mechanism (a mis-added tenths-column fact, e.g. 5+6 read as 10) instead of a dropped-carry; independently re-derived both trap values (8.05, 9.27) now match their stated feedback exactly. Trap values themselves unchanged. |
| bv-04-02 | REVISE | **KEEP** | ch1 reworked back to a 50-total/20-adult scenario so the hardcoded `bv-rel-freq` figure ("÷50 whole" / "÷20 adults") is true again; independently re-derived 15÷20=75% (already established at k1) and 15÷50=30% (new answer); traps and normalized-prompt distinctness across all 7 widget-bearing steps checked by hand, no collision. |
| g4v-01-01 | REVISE | **REVISE (narrowed)** | The false imperial `rr-conversion` figure was removed from the remedial concept (confirmed byte-identical to HEAD, no `figure` key) — that specific defect is resolved. But the *same* `rr-conversion` figure is still live on main-route `c2` (confirmed unchanged, still "12 in = 1 ft" against a meters/centimeters body) — explicitly left out of this fix packet's scope. REVISE / visualDecision REQUIRED stands, now scoped to c2 only. |
| g4v-01-03 | REVISE | **REVISE (narrowed)** | Same finding and same scope-narrowing as g4v-01-01. |
| g4v-01-02 | REVISE | **KEEP** | Main-route c1 figure rebuilt as `g4v-meter-cm-table` (1m=100cm/2m=200cm/3m=300cm); independently confirmed exact match to c1's body. |
| g4v-02-01 | REVISE | **KEEP** | Main-route c1 figure rebuilt as `g4v-liter-ml-jug` (1–4 L bands, ×1000 factor); independently confirmed match to c1's body; remedial math independently re-verified (8×1000=8000, both traps real/distinct). |
| g4v-02-02 | REVISE | **KEEP** | Main-route c1 figure rebuilt as `g4v-clock-60` (60-tick clock, both hour/minute and minute/second factors); independently confirmed exact match to c1's body. |
| g4v-02-03 | REVISE | **KEEP** | Main-route c2 figure rebuilt as `g4v-groups-adjust-distance` (6×400−150=2,250 m); independently confirmed the numbers appear verbatim in c1's body and k2's prompt; remedial math independently re-verified (6×350−45=2055, both traps real/distinct). |
| g4v-02-04 | REVISE | **KEEP** | Main-route c1 figure rebuilt as `g4v-groups-adjust-time` (5×30−20=130 min); independently confirmed exact match to c1's body. |
| g4v-03-01 | REVISE | **KEEP** | Main-route c1 figure rebuilt as `g4v-groups-adjust-money` (9×25−40=185 dollars); independently confirmed exact match to c1's body; remedial math independently re-verified (20×7−15=125, both traps real/distinct). |
| g4v-03-02 | REVISE | **KEEP** | Main-route c1 figure rebuilt as `g4v-quarter-inch-plot` (8 marks × 1/4″ = 2 in); independently confirmed exact match to c1's body; remedial math independently re-verified (28÷4=7, both traps real/distinct). |
| g4v-03-04 | REVISE | **REVISE (narrowed)** | Both main-route figures (c1 `g4v-groups-adjust-distance`, c2 `g4v-end-vs-inside-adjust`) independently confirmed as genuine, correct matches to k1's and k3's own prompts — the two main-route defects this verifier flagged are closed. But the remedial still reuses `two-step-bar`, confirmed unchanged — still the 18+24−15 unequal-join story, still contradicting (not merely omitting) the remedial's own equal-groups-inside-adjustment answer. REVISE / visualDecision REQUIRED stands, now scoped to the remedial figure only. |
| mf3-02-01 | not in scope | **KEEP** (new) | New figure `mult3-double-double-double` (6→12→24→48) independently confirmed to match c1/c2's body exactly, resolving the prior figure's stop-at-24 gap. |
| sa7-01-03 | not in scope | **KEEP** (new) | Two new figures (`sa7-pyramid-parts` on k3, `sa7-pyramid-net-total` on ch1) independently confirmed exact matches (5-face net; 36+4×15=96 matching ch1's answer). "Any prism" wording corrected to "any right prism" in c2 and the remedial. Action-step invariant independently recounted by hand: 5/8 = 62.5%, above the 60% floor. Both defects named in the governing rationale are resolved together. |
| tm-03-02 | not in scope | **KEEP** (new) | New figure `tm-right-triangle-90-35-55` (a real right triangle with a right-angle marker, 90°/35°/55°) independently confirmed to match c2's body exactly. Independently recomputed `figureTextBindingKey` in Node using the exact algorithm in `src/lib/figureTextAlignment.ts`: the old binding (`la-triangle-sum` + c2's body) hashes to `2ff13c9b`, confirmed present in the blocklist; the new binding (`tm-right-triangle-90-35-55` + the same unmodified body) hashes to `34593d80`, confirmed absent from the blocklist and from the numeric-claims map — the fix is a genuine new semantic figure, not a hash-dodge on the old one. |

`bv-05-03` was reviewed for completeness (per `S316_MISC_FIGURE_REBUILD.md`, item 4) and remains
correctly fail-closed / unchanged — the outstanding defect is in the shared `ScatterFitW` widget
renderer (`src/components/widgets.tsx`), not a `figures.tsx` figure, and is out of scope for both
that packet and this one. No disposition was re-signed for it in this round since it was not named
in the current task and its S316-V2-era status (`rejected: true`, not carried as a KEEP/REVISE
lesson record in this lane) is unchanged.

No `npm`/`vitest`/`tsc` was run for this verification round (component and test-file sources were
read, not executed). No lesson, course, or other repository source file was modified — only
`reports/closure/cowork-staging/laneAV3-residuals-dispositions.jsonl` and this appended section
were written.

---

## Addendum (S316-V4, 2026-08-20T04:38:36.000Z) — gate-reconciliation content edits

A gate-reconciliation worker made 5 lesson-content edits while re-pinning 18 test files to the
current legitimate content state (`reports/closure/S316_GATE_RECONCILIATION.md`, §D). Each was
independently verified via `git diff HEAD` plus a full read and signed to
`reports/closure/cowork-staging/laneAV4-final-dispositions.jsonl` (`recordId`
`S316-V4-<lessonId>`).

**Verdict: 5/5 KEEP.**

| Lesson | Edit claimed | Verification |
|---|---|---|
| g5d-01-01 | Removed stale `variant` key from k3 (bound to a whole-number-only generator that couldn't parse k3's decimal-prose prompt) | Confirmed via diff the key is gone; independently read `Pv1000AddTradeNumeric` in `src/lib/g2Variants.ts` — its only template is literally `` `${a} + ${b2} = ?` `` with whole-number operands, incompatible with k3's current "Add 0.65 and 0.19" prompt. k3's answer/traps/feedback unchanged (already verified correct in S316-V2). |
| g5d-01-03 | Reworded ch1's prompt to de-duplicate a same-sitting phrasing template shared with k2 | Independently computed `normalized()` (digit-runs→`#`) for both prompts — confirmed genuinely distinct templates now. Answer/traps/feedback byte-identical to what this verifier already re-derived as correct in S316-V3. |
| g5d-01-05 | Rebalanced k3's mcq option-label lengths to remove an answer-length cue | Measured all four current labels by hand: 67/68/65/56 chars, spread 12 — well within a uniform range. Exactly one `correct:true` option, all four distractors real and distinct, feedback accurate. |
| g7-04-01 | Lowercased one ALL-CAPS word ("CAN"→"can") in a trap's feedback | Ran a corpus-wide `\b[A-Z]{2,}\b` scan over the full lesson JSON — zero all-caps words remain. k3's answer (10) and both traps (9, 3) independently re-confirmed correct and unchanged. |
| g7-04-03 | Lowercased one ALL-CAPS word ("PARALLEL"→"parallel") in an mcq option's feedback | Same corpus-wide scan — zero all-caps words remain. i2's four options, `correct` flags, and reasoning independently re-confirmed unchanged and sound. |

In every case, answers, hints, `conceptTag`, evaluator logic, and IDs were confirmed untouched —
only the specific prose/key named in the report changed. No new defect (arithmetic, duplication,
feedback-rule, or option-parity) was found in any of the 5 files. No `npm`/`vitest`/`tsc` was run;
no lesson or other repository source file was modified — only
`reports/closure/cowork-staging/laneAV4-final-dispositions.jsonl` and this addendum were written.
