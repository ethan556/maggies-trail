# MATH_TYPESETTING Claim Verdict — s237 adversarial review

## 1. VERDICT: REFUTED — say it loudly

**The claim is REFUTED.** The assertion that ~9,316 of the 9,579 MATH_TYPESETTING queue rows
are false positives and only 263 remain is **wrong by more than 15x**. Acting on it would have
wrongly closed at least 3,765 rows — a wrong optimisation that closes 9,000 rows is far more
damaging than an unclosed backlog, and this was on track to be exactly that.

Two of four lenses refuted it outright (display-mode mismatch; semantic fidelity), one
partially refuted it (call-site coverage), one survived (the renderer fallback is transient,
not vacuous). The claim's *raw arithmetic* is reproducible — 8,361 default-match + 955
arithmetic-only + 263 no-match = 9,579 — but its central equivalence, "authoredMathParts
finds a match somewhere in the string" == "the audit finding is resolved," is false.

### The corrected arithmetic

```
9,579 flagged rows = 5,633 INLINE_MATH + 3,946 DISPLAY_MATH   (audit's own classification)

DISPLAY_MATH (3,946):  3,765 render inline only — WRONG MODE per the audit's own
                              next_action ("canonical KaTeX/MathML DISPLAY path")   → OPEN
                         181 render under neither mode                              → OPEN
INLINE_MATH (5,633):   5,551 render inline (matches recommendation)   → candidate-closed
                          82 render under neither mode                              → OPEN

FLOOR of genuinely open rows = 3,765 + 181 + 82 = 4,028      (claim said 263; 15.3x low)
```

The floor goes UP, not down, once the other refuting lenses are de-overlapped against it:

- **+ up to 315** rows (Lens 2) whose json_path shapes never reach MathProse at all —
  choice labels, MatchPairs labels, titles, values/candidates/tokens/panels/hotspots/
  operations/authoredStages, DragOrderW items. Any of these classified INLINE_MATH are
  currently sitting *inside* the 5,551 "closed" bucket and must be moved to OPEN.
- **+ up to 261** rows (Lens 4) whose conversion is actively hazardous — the parser emits
  mathematically FALSE standalone equations ("9 = 1", "6 = 0", "36 = 0") or strips
  grouping from conic/complex-number expressions. A row that renders *wrong math* in
  polished KaTeX is worse than open; it is a regression.
- **+ an unverified subset of ~955** arithmetic-only rows: the claim validated
  includeArithmetic only at 3 call sites (Rich(), QuizShell item.body, LessonPlayer
  explanationVariants). widgets.tsx — which renders steps[].widget.prompt (947 rows) and
  more — calls MathProse 150 times and passes includeArithmetic **zero** times. Any
  arithmetic-only row living at those sites does not render today.

**Bottom line: true open work is 4,028 rows minimum, plausibly ~4,300–4,600 after
de-overlap, with a further ~955-row verification burden. True false positives are AT MOST
~5,551 and will shrink. The claim's 263 figure must not be used for any planning purpose.**

Within the 263 no-match rows: 205 are fixable via 15 recogniser families (largest: ASCII
`<=`/`>=` 75 rows; bare unicode superscripts 41 rows), and 58 are "unfixable" — 41 scanner
false positives (non-prose config fields like `approxFormula.op: "sqrt"`, figure IDs) that
should be excluded at the *generator*, and 17 prose-only sentences correctly left alone.

## 2. What each lens found

**Lens 1 — Screen delivery (SURVIVES, HIGH).** MathInline's `fallback={part.source}` is only
the pre-import useState initial value; the useEffect swap-in is real. Strongest evidence:
a jsdom probe over 370 real flagged rows through the actual MathText.tsx/renderMath.ts
pipeline — 350/350 parser-matched rows produced genuine `.katex` DOM nodes, zero stuck on
the source fallback, zero KaTeX error-fallbacks. When a match exists and the right mode is
used, it does reach the screen. This lens explicitly does NOT validate the 8,361/955 split.

**Lens 2 — Call-site coverage (PARTIALLY_REFUTED, HIGH).** The claim generalised from 3
includeArithmetic-passing call sites to the whole corpus. Strongest evidence: `grep -c
includeArithmetic src/components/widgets.tsx` = **0** across a 16,685-line file containing
150 MathProse calls and the single largest flagged shape (steps[].widget.prompt, 947 rows);
plus 315 rows across 10 shapes rendered as raw `{field}` interpolation with no MathProse at
all (e.g. widgets.tsx:13207/13254 MatchPairsW labels, ~20 choices[].label render sites).
Also flagged: ~87 rows (misconceptions, approxConstants) that are never displayed at all
and arguably should not be in the audit.

**Lens 3 — Display vs inline mode (REFUTED, HIGH).** The audit's own consolidator
(consolidate-pending-workload-s236.mjs, next_action branch) prescribes the "canonical
KaTeX/MathML DISPLAY path" for 3,946 classification-C rows. Strongest evidence: MathDisplay
is invoked exactly 4 times in the whole codebase, all on hardcoded TeX inside one
u-substitution widget (widgets.tsx:16192-16198) — **no authored JSON string ever reaches a
display-mode render**. MathProse is unconditionally `display=false`. So 3,765 DISPLAY_MATH
rows the claim counted as closed get inline treatment the audit explicitly says is not the
required treatment. This is the largest single refutation: 3,765 rows.

**Lens 4 — Semantic fidelity (REFUTED, HIGH).** The claim never checked whether the
conversions that DO happen are *correct*. Strongest evidence: the real flagged row
"x²/16 − y²/9 = 1: a = 4, b = 3, …" under includeArithmetic=true renders plain-text "x²/",
a KaTeX box "16 − y", plain-text "²/", then a KaTeX box asserting **"9 = 1"** — a false
equation never present in the source. Systematic sweep: 229 match instances producing bare
false "N = M" equations across 261 distinct flagged strings, driven partly by the arithmetic
operator set recognising unicode − but not ASCII '-'. Plus one confirmed latent bug:
`x^2-1` parses as `x^{2-1}` (zero current corpus hits, but real).

## 3. THE PLAN

Ground rules for every step: **no row is ever closed by editing
PREMIUM_PENDING_WORKLOAD_QUEUE.csv or MATH_TYPESETTING_AUDIT.csv directly.** The only
sanctioned closure is: land the code/generator change, then regenerate the governing audit
(`node scripts/audit/premium-rebuild-baseline-s226.mjs`) and re-consolidate
(`node scripts/audit/consolidate-pending-workload-s236.mjs`), and prove the row's condition
no longer holds. Queue deltas below are *expected regeneration outcomes*, not permissions to
delete rows. Steps 3 and 4 are ordered before any arithmetic-mode expansion on purpose:
widening includeArithmetic before the hazard class is fixed multiplies false-equation
renders across hundreds of new call sites.

**Step 0 — fable — Architecture decision: what does DISPLAY_MATH mean here?**
Gates 3,946 rows. Decide between (a) building a sanctioned authored-content path to
MathDisplay (block mode) for DISPLAY_MATH fields, (b) revising the classifier in
premium-rebuild-baseline-s226.mjs because its denseMath/mathChars>=5 rule mislabels
prose-embedded arithmetic ("18 + 24 − 15 = 27") as display-worthy, or (c) a split policy
keyed on json_path shape. Record as an ADR in COWORK_CACHE/ with the rule stated as a
testable predicate. Acceptance: ADR file exists and names the predicate the regenerated
audit will enforce. Queue delta: 0 (decision only, but every later delta depends on it).

**Step 1 — sonnet — Build the shape→renderer coverage map as a checked artifact.**
Script (scripts/audit/, new file) that enumerates all 83 step_path shapes and emits, per
shape: renderer file/line, MathProse yes/no, includeArithmetic yes/no, display mode,
never-displayed flag. This turns Lens 2's findings into a regenerable input instead of a
one-off grep, and resolves the overlap unknowns (how many of the 315 zero-coverage and 261
hazardous rows are INLINE_MATH vs DISPLAY_MATH).
Acceptance: `node scripts/audit/render-coverage-map-s238.mjs` exits 0 and its output row
count reconciles to 9,579 with zero UNKNOWN shapes. Queue delta: 0 (evidence artifact).

**Step 2 — opus — Fix the hazardous-conversion class in src/lib/math/authoredMath.ts.**
Shared, load-bearing file; adversarial risk is exactly Lens 4's findings. Scope: (i) treat
ASCII '-' as a subtraction operator wherever unicode − is accepted, (ii) refuse to open an
arithmetic run whose left boundary abuts unconsumed math-like text (the "²/16 − y" and
"x^2 - x - **6 = 0**" shredding), preferring no-match over partial-expression match,
(iii) fix the `x^2-1` → `x^{2-1}` glued-sign bug.
Acceptance: `npx vitest run src/lib/math` green, PLUS a hazard sweep
(`node scripts/audit/hazard-sweep-s238.mjs`, new, kept) over all 9,579 rows reporting **0**
bare numerically-false "N = M" matches and **0** partial-expression openings (currently 229
instances / 261 strings). Queue delta: 0 directly — this step prevents wrong closures; it
may move some rows from "renders" to "no match," which is correct and must be allowed.

**Step 3 — sonnet — Wrap the 10 zero-coverage shapes in MathProse.**
Bounded per-component edits at the exact sites Lens 2 listed: choices[].label (~20 widget
components), MatchPairsW l/r labels (widgets.tsx:13207,13254), titles (LessonPlayer.tsx:371,
524; SyllabusClient.tsx:104,175; CatalogClient.tsx:42,166), values/candidates joined-text
(widgets.tsx:7013-7018, 7182-7192), tokens (13420), panels[].body (13637), hotspots[].icon
(12966), operations[].label (5583), authoredStages[].body (7019), DragOrderW items
(12986-13050). No includeArithmetic added in this step.
Acceptance: `npx vitest run src/components/math` plus a jsdom probe test (committed, not
throwaway) rendering ≥3 real audit rows per shape to `.katex` nodes; `npm run typecheck`
green. Expected queue delta after regen: up to −315, minus any rows Step 0 routes to
display mode.

**Step 4 — opus — includeArithmetic policy at the remaining call sites.**
Shared-file edit across widgets.tsx (150 MathProse sites), LessonPlayer.tsx predict blocks
(600,611,625,711,830). Only after Step 2 lands. Decide centrally (default-on in MathProse
vs explicit per-site) per Step 0's ADR.
Acceptance: probe mapping each of the 955 arithmetic-only rows to its *actual* call site
(via Step 1's map) shows the row rendering, and the Step 2 hazard sweep still reports 0.
Expected queue delta after regen: closes the arithmetic-only subset at widget sites
(bounded above by 955; exact number comes from Step 1's map, not from this plan).

**Step 5 — sonnet — Recogniser families for the 205 fixable gap rows.**
Implement in the priority order of the family table, one family per commit, each with unit
tests targeting that family's stated risk (e.g. `<=`/`>=` must not fire inside code-like
text; superscript runs need a non-letter boundary; ratio colons need digit-tight matching;
the misc bundle's sub-cases each get their own tests — no blanket rule). The 17 prose-only
rows get NO rule; do not chase them.
Acceptance: `npx vitest run src/lib/math` green; per-family probe showing that family's
rows now produce tex parts; hazard sweep still 0. Expected queue delta after regen: up to
−205 cumulative.

**Step 6 — sonnet — Fix the audit generator's scan scope and classification.**
premium-rebuild-baseline-s226.mjs: exclude non-prose json_paths (.figure, .conceptTag,
.variant.form, *.approxFormula…op — the 41 identifier rows) and never-displayed fields
(steps[].cml.misconceptions[], approxConstants[].label — ~87 rows) from MATH_TYPESETTING;
make the INLINE/DISPLAY classifier consult Step 0's predicate and Step 1's coverage map
rather than raw character density.
Acceptance: `node scripts/audit/premium-rebuild-baseline-s226.mjs` runs clean and the diff
of the regenerated audit shows exactly the predicted exclusions and reclassifications, each
attributable to a named rule — no unexplained row movement. Expected queue delta: −41
scanner false positives; ~87 reclassified out of visible-typesetting scope.

**Step 7 — opus — Adversarial closure review and the only real queue regeneration.**
Re-run the full chain: `node scripts/audit/premium-rebuild-baseline-s226.mjs` then
`node scripts/audit/consolidate-pending-workload-s236.mjs`. Reconcile the resulting
MATH_TYPESETTING row count against the sum of predicted deltas from Steps 3-6; any
discrepancy blocks sign-off. Then adversarially re-sample: ≥100 newly-closed rows rendered
in jsdom AND checked for semantic fidelity (Lens 4's failure class), stratified across
INLINE/DISPLAY and across call-site shapes — not just the easy 3 sites.
Acceptance: regenerated queue's MATH_TYPESETTING count equals prediction ±0; sample shows 0
false-equation renders and 0 wrong-mode closures. Queue delta: this step *is* the delta —
nothing before it closed anything.

## 4. WHAT MUST NOT BE DONE

1. **Do not close 9,316 rows on the strength of this claim.** That is the catastrophic
   move this review exists to prevent. At minimum 4,028 of them are open by the audit's
   own stated condition.
2. **Do not edit PREMIUM_PENDING_WORKLOAD_QUEUE.csv (or MATH_TYPESETTING_AUDIT.csv) to
   mark rows done.** Lesson 2 of the handover: an audit is a list of *candidates*; the
   queue is a derived artifact. The only closure is regenerating the governing audit and
   proving the condition no longer holds (Step 7). Hand-editing the CSV forges evidence.
3. **Do not treat "code was edited" as "row complete."** The manifest rule is explicit. A
   MathProse wrapper added in widgets.tsx closes nothing until the regenerated audit shows
   the row's condition cleared — and Lens 4 proved a row can render KaTeX and still be
   *worse* than before (a false "9 = 1" in typeset math).
4. **Do not blanket-enable includeArithmetic before the hazard fixes (Step 2) land.** The
   tempting one-line fix — default includeArithmetic:true in MathProse — would push the
   false-equation class ("6 = 0", "9 = 1") onto 150 widget call sites at once.
5. **Do not accept inline rendering as closure for DISPLAY_MATH rows** until Step 0
   explicitly re-decides what those 3,946 rows require. The consolidator's next_action
   text is the audit's contract; you don't get to reinterpret it row-by-row mid-closure.
6. **Do not validate at the 3 convenient call sites and extrapolate.** That is precisely
   how this claim went wrong. Every closure sample must stratify across the shape→renderer
   map (Step 1), and every parser change must re-run the hazard sweep, not just the happy-
   path render probe.
7. **Do not write a recogniser rule loose enough to catch the 17 prose-only rows** (generic
   WORD = WORD, bare symbol mentions). This corpus uses '=' conversationally everywhere;
   such a rule trades 17 un-renderable rows for corpus-wide over-matching.

## 5. Restated for the impatient reader

REFUTED. True remaining work: **≥ 4,028 rows** (3,765 wrong-mode DISPLAY_MATH + 263
recogniser gaps), rising toward ~4,600 pending de-overlap of 315 zero-coverage rows and 261
semantically hazardous conversions, plus a ~955-row includeArithmetic verification burden.
Genuinely closeable today: at most ~5,551, and only via audit regeneration after Step 7 —
never by touching the queue file.
