# S215 — content-change ledger

**No authored lesson content file was changed.** Full content-tree diff against the S214 seal:
byte-identical. Content-change proof 812/812 (unchanged); hash proof 1,701/1,701. The three
lessons authored in S213–S214 (`se-01-03`, `tse-01-01`, `pq-05-03`) are untouched, verified by
hash after every window.

This is deliberate. A new engine (`numberLineRay`) and a new control (algebraTiles x²-tiles)
landed this session, and **no lesson may use a capability before it has passed independent QA**
— the discipline that S213 established by rejecting a step authored on a capability that turned
out not to be learner-ready. `numberLineRay` has now passed and been rated, so authoring its
first lesson is S216's task, under the usual freeze protocol.

## Registry changes (not content, but rating decisions — recorded here for the same audit trail)

`scripts/engine-capabilities.json`, three changes, each adjudicated against
`docs/CAPABILITY_AXES.md` by an assessor who did not write the rubric and did not build the code:

1. **`numberLineRay` — new row**: manip 2 · conseq 3 · err 3 · adapt 3 · a11y 3 · mobile 2 ·
   polish 3 (Σ 19, grade A). `manip` refused at 3 for consistency with `systemsExplore`; `mobile`
   held at 2 because the repo's own 44px gate was failing on it at adjudication time. **That
   blocker was removed later the same session** (the handles became class-sized and the gate now
   passes), so the stated basis for the 2 no longer holds — recorded as requiring
   re-adjudication in S216 rather than lifted quietly here.
2. **`exactNumberLab` adapt 2 → 3.** A whitespace-dependent regex in the pinned contract could not
   see 15 components; repaired, 14 proved consistent and this one was genuinely wrong. The score
   was the error, not the test.
3. **`rotationLab` err — stays 3**, now earned rather than asserted: its component gained a real
   reveal ghost and a retry direction cue, replacing markup that had been printing the raw tone
   token to learners.

No other row changed. Twelve engines carrying `err: 3` without a ghost in their own component are
recorded as a **named, non-growing debt** in `engineCapabilities.test.ts` — not downgraded, not
hidden. See `SESSION215_EXECUTION_REPORT.md` §4 for why a bulk downgrade was refused.
