# HANDOVER → Session 214

Read `SESSION213_EXECUTION_REPORT.md`, `SESSION213_CONTENT_CHANGE_LEDGER.md`,
`SESSION213_FABLE_QA.md`, and `MASTERY_INTERACTION_CANDIDATES.json`.

## 0. State

Four MMIP engines on assembled seams; one shared morph/history implementation. **`se-01-03` is
the first lesson with a breakable-systems interaction** (and the first authored user of any S212
capability). algebraTiles area mode: **model-proven, NOT learner-ready** — see the precondition
list below; factor mode is a display, not an interaction. Content baseline
`SESSION210_LESSON_HASHES.json`, **content-change proof 810/810** (S213 added one authorized
entry). Gates at seal: 313 files / 12,562 vitest · Playwright 115/115 · hash 1,701/1,701 ·
build 0. HS rich mix 23.8% (863/3,626).

## 1. Restart priorities

1. **Make systemsExplore's lines DRAGGABLE.** The accepted S213 insertion's own ceiling and the
   reason Fable-QA scored it 7.9 rather than 9+: the mathematical object is edited by steppers and
   sliders, not by grabbing the line. Program §6 is explicit — "learner rotates the line" beats
   "slider controls slope"; sliders stay as secondary precision/keyboard controls. Small, high
   value, and it lifts an already-shipping lesson.
2. **algebraTiles area precondition list** (do NOT author an area lesson before all three):
   edges drawn proportionally to the factors; real partial-product cells; a start requiring the
   learner to PRODUCE the partials rather than click once. Plus additive `unopenedFrameFeedback`
   in evaluate.ts (defect A-M1: submitting while framed returns `constFeedback`; latent and
   currently unreachable because no lesson uses area mode).
3. **The remaining live candidates** in `MASTERY_INTERACTION_CANDIDATES.json` under the same
   five-gate + Fable-QA protocol: `pq-05-03/i1` (coordinateProofLab, rhombus certification),
   `vec-03-02/k1` (vectorExplore dot mode). Both P0/P1, both unauthored.
4. **Then the confirmed engine gaps** (program §13). Two independent sweeps now show both the
   0%-rich and partially-rich buckets are saturated with legitimate non-novel drill (~11–13% pass
   rate). New engines are the only route that manufactures genuinely new candidates. Start with
   the gaps whose target lessons are already named: nested-rule decomposition (`dr-04-02`),
   u-substitution two-world (`in-05-02`), error propagation (`dc-03-02`), growth race (`dc-04-02`).
5. Do NOT force the 25% number. S213's report states the honest position; a forced number means
   decorative interaction, which the program forbids.

## 2. Process that is now proven and should be kept

- **The implementor does not certify.** A fresh Fable-QA assessor rejected a step that the
  implementor, the planner, and every automated gate had passed. It is the single most valuable
  role in the loop — keep it fresh (not the standing code reviewer) and give it the seal tarball
  so it can diff against the previous state.
- **A refusal is a deliverable.** S213 produced three: an authoring refusal on REACH, 26
  adjudication refusals, and one post-hoc rejection-and-revert. All three improved the product.
- Single-writer locks per shared file; sequential widgets.tsx windows; ONE serialized gate chain;
  content authorization serialized in the planner, never in the implementor's window.
- Beware "proven" claims that were proven at model level. S213's lesson: ask "can a learner
  actually reach it, and does the picture show the mathematics?" before writing a lesson on it.

## 3. Traps (short form)

A: Playwright reuses the 3100 prod server. B: `variants.test.ts` and
`content.widgets.audit.test.ts` solo. C: foreground directory-batched vitest, dot reporter.
D: servers resurrect — `fuser 3100/tcp` to find/kill; require `Ready` + zero `EADDRINUSE` in the
NEW server's log; a green curl proves nothing. E: mtime churn lies — hash against the sealed
tarball. **F (new): a test can pin a true-at-the-time FACT as an invariant.** Four such pins broke
this session the moment content legitimately opted in. When writing a corpus-wide assertion, name
the opted-in set explicitly so the next change is a deliberate edit, not a mystery failure.

## 4. Tripwires

`mmipTypes.ts` FROZEN (`acceptTransaction` was added additively in S213). Content proof expects
**810**. `systemsExploreEditErrors` is now wired into `widgetIntegrityErrors` — editable specs
REQUIRE `degenerateSystemFeedback`; do not relax. `console.error` trap is opt-in over
`src/lib/mmip/`, `src/components/widgets.mmip.`, `src/components/widgets.aria.` with an EMPTY
allowlist — verify a path is clean before adding it, never allowlist to make it pass.
algebraTiles: `frame-standing` refusal, mode-gated controls, framed readout must never assert a
mat value that contradicts the frame. Persisted-value tripwires unchanged (`leCanonicalFor`,
SlopeTriangleW, `{x,c,mat}`, the systems `lines` envelope written only-on-difference).
Rating lifts: S205M rubric only — S213 changed none, on Fable-QA's explicit recommendation.

## 5. Verification chain

Unchanged, with Trap D's fuser protocol. Expect vitest ~12.5k, content proof **810/810**, hash
1,701/1,701.
