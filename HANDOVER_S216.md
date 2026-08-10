# HANDOVER → Session 216

Read `SESSION215_EXECUTION_REPORT.md`, `SESSION215_FABLE_QA.md`,
`SESSION215_CONTENT_CHANGE_LEDGER.md`, and `docs/CAPABILITY_AXES.md` (new — the first written
rubric for all seven capability axes).

## 0. State

Five MMIP-class engines plus a **new engine**: `numberLineRay` (confirmed gap G, inequalities —
QA-passed, rated Σ19 grade A, zero authored users). It is the first widget to live outside
`widgets.tsx`, in `src/components/widgets/`. Three lessons carry program-authored causal
interactions (`se-01-03` 8.3, `tse-01-01`, `pq-05-03`). Content baseline
`SESSION210_LESSON_HASHES.json`, content proof **812/812** — unchanged this session (zero content
changes). Gates at seal: **319 files / 12,767 vitest** · engine-registration **127/127** ·
Playwright 115/115 · build 0.

## 1. Restart priorities

1. **Author the first `numberLineRay` lesson.** The engine is QA-passed and rated; inequalities
   are high-reuse across bands, and this is the first genuinely new candidate pool the program has
   manufactured (three sweeps agree the existing-engine pool is saturated at ~11–13%). Use the
   five gates and the freeze protocol; expect the assessor to check whether the learner still has
   to SUPPLY the claim.
2. **Adjudicate the twelve `err: 3` debts** one at a time against `docs/CAPABILITY_AXES.md`
   (`ERR3_NO_OWN_GHOST_DEBT` in `engineCapabilities.test.ts` names them with dates). For each the
   answer is either "fix the engine" or "correct the row" — do not bulk-resolve, and never add a
   name to the list to silence a failure (the list's own comment says so).
3. **Re-adjudicate `numberLineRay` mobile 2 → 3.** It was held at 2 *because the 44px gate was
   failing on it*; that blocker was removed later the same session. The number's stated basis no
   longer holds. Re-adjudicate properly — do not lift it quietly, and note the engine's real
   remaining constraint: at 320px, adjacent ticks are ~20 CSS px apart so a 44px handle spans ~2
   units, and precision comes from snap + steppers rather than fine dragging.
4. **Close the `rate/start` half of the systemsExplore REPRESENTATIONS docking** — the controls
   still speak "rate/start" while the lesson thinks in equations. Fable-QA estimates `se-01-03`
   reaches ≈8.7 with the fixes already landed; this is the remaining lift.
5. **The remaining seven engine gaps** (§13): nested-rule decomposition (`dr-04-02`),
   u-substitution two-world (`in-05-02`), error propagation (`dc-03-02`), growth race
   (`dc-04-02`), movable interval, motion odometer, quotient mode. Still the only route that
   manufactures new candidates.
6. Queued, not urgent: generalise the `data-overlay="picture"` marker (a self-declaring signal for
   fixed-size targets inside scaled coordinate spaces) — but only as a **co-signal alongside a real
   size check**, never instead of one, or it recreates the untrustworthy-aggregate problem this
   session spent itself walking back. Also: `algebraTiles`' SVG accessible name still omits the
   third pile and the rectangle; and the proper closure for the area grader is a population check
   inside the *area* path (leaving nets alone for the classic mat) — reasoning is in `schema.ts`'s
   guard comment, where it travels with the code.

## 2. The lesson of S215 — checks whose scope is narrower than their claim

Four separate blindnesses were found and closed in one session, and they are one failure in four
costumes:

- a regex missing 15 components because a signature had no space;
- an `err = 3` contract satisfied by a **count** that could not name an engine;
- two contracts scanning `widgets.tsx` **only**, so the first engine outside the monolith was
  invisible to guarantees every other engine must meet;
- `expect(container.textContent).not.toMatch(/\b(error|info)\b/i)` — **vacuous**, because
  concatenating a DOM tree welds words together and destroys the boundary. It passed with the
  defect fully present.

**Before trusting any gate, ask what it actually scans and whether it can name the thing it
claims to check.** A gate that reports a number instead of a name is not a gate. Sweep negatives
per text node, never against a `textContent` blob.

Related, from the same session: **a large sweep is not evidence.** A 2,210-state proof passed
identically against the pre-fix model. Mutation-check every sweep — revert the fix and confirm the
sweep goes red — and say the mutation result, not the state count.

## 3. Process that is proven

The implementor does not certify; a FRESH Fable-QA each session, given the previous seal tarball
to diff. Its record now: one step rejected outright, required fixes on five more, and in S215 four
blocking findings the session had not disclosed — including a widget that had been printing the
word "neutral" to every learner and a screen-reader panel telling users false mathematics.
Refusals and rejections are deliverables. An implementor may override the planner (it has happened
twice and been right both times). Build the engine to the standard BEFORE authoring content on it.
Single-writer locks, sequential widgets.tsx windows, ONE serialized gate chain, content
authorization serialized in the planner.

## 4. Traps

A: Playwright reuses the 3100 prod server. B: `variants.test.ts` and `content.widgets.audit.test.ts`
solo. C: foreground directory-batched vitest, dot reporter. D: servers resurrect — `fuser 3100/tcp`
to find/kill; require `Ready` + zero `EADDRINUSE` in the NEW server's log. E: mtime churn lies —
hash against the sealed tarball. F: a test can pin a true-at-the-time FACT as an invariant — name
the opted-in set explicitly. G: a scripted `str.replace` can silently no-op — assert on every
replacement. **H (new): adding a widget-union member breaks compilation in four places by design**
(`evaluate.ts`, `pedagogy.ts`, `stageWidth.ts` carry exhaustive switches — the repo's
register-or-fail contract). That is the contract working; add the cases.

## 5. Tripwires

`mmipTypes.ts` FROZEN. Content proof expects **812**. Engine registration expects **127**.
`ERR3_NO_OWN_GHOST_DEBT` must never grow and must never silently shrink. `systemsExploreEditErrors`
and the new `algebraTiles` area guard are both wired into `widgetIntegrityErrors` — the latter
refuses mixed-sign area specs with a stated mathematical reason; do not relax it without moving the
grader to populations first. `console.error` trap is opt-in with an EMPTY allowlist. algebraTiles:
`frame-standing` refusal; `complete` means the mat holds EXACTLY the rectangle; per-pile cell
budget (the net-budget rule was wrong even on the one authored area spec). Rating lifts: rubric
only, adjudicated by a non-author.

## 6. Verification chain

Unchanged, with Trap D's fuser protocol. Expect vitest ~12.8k, content proof 812/812, hash
1,701/1,701, engine registration 127/127.
