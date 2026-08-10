# Maggie's Trail — variant generation

You are continuing a long-running, incremental workstream. Read this file completely before
acting. Everything below was learned by breaking something.

## The task

Make authored practice items re-askable by generating fresh problems from a seed, so "mastery"
becomes a measurement (*can you do a new one?*) rather than a memory (*do you recall this one?*).

You add ONE `variant` key to a lesson step. You never touch anything else in the content.

Current state lives in `VARIANT_STATE.md`. Read it second. Append your session's ledger to
`VARIANT_LOG.md` and rewrite `VARIANT_STATE.md` when you finish.

## NON-NEGOTIABLE

1. **Never change authored lesson prose.** Only ever *add* a `variant` key to a step. No
   copyediting, no reordering, no "improving" a typo. Lesson IDs, step IDs, answers, hints,
   `conceptTag` values and remedial mappings are frozen. If you find a genuine content error,
   record it in `VARIANT_LOG.md` for a human and move on.
2. **Generators are pure functions of the seed.** Same seed ⇒ byte-identical widget, forever.
   No `Math.random`, no `Date.now`, no network, no AI calls at runtime.
3. **Every distractor is a computed real misconception whose feedback names it.** Never "try
   again" — say what the learner did and why it fails, using the numbers actually drawn.
4. **A trap that can grade correct is a bug**, not a near miss. Guard *every pair*:
   trap-vs-answer AND trap-vs-trap.
5. **Feedback must be literally true of the drawn problem.** If it says "you carried wrong", the
   drawn problem must involve a carry.
6. **Round once, at the end — and only to a convention the authored prompt states.** If the
   content states none, do not invent one. A trap that prints 1.67 for 5÷3 when no prompt
   mentions rounding is a defect.
7. **Some items must NOT be generated. Rejecting is a SUCCESS, not a failure.** If exactly one
   problem exists ("What is i²?", "Which eccentricity gives a parabola?", "Order the four conics
   by eccentricity", "Which pair names the origin?"), a generator would emit an identical widget
   forever. Record the rejection with its reason and move on. Never dress up a single-fact item
   to raise the step count.

## Working rhythm — follow it in order, every session

1. `npx tsx scripts/measure/centrality.mts` and `scripts/measure/manip.mts` → choose targets **by
   leverage, not tractability**.
2. Dump and **read every authored item** for the chosen tags before writing anything. Your
   generator must reproduce what the content actually does, including its exact question shapes.
3. Write generator + independent route + `VariantForm` union entry + BAND entry **together**.
4. `npx vitest run src/lib/variants.test.ts` → fix collisions. **Expect several. That catch rate
   is the system working, not a warning sign.**
5. **PRINT THE GENERATED OUTPUT AND READ IT.** The gate is necessary, not sufficient. Write a
   throwaway script under `scripts/measure/` that prints 3–4 items per form with every trap,
   fallback and success string, and read them as a human would. See "What reading catches" below.
6. `npx tsx scripts/measure/verify.mts` → confirm generated matches the authored template.
7. Declare the `variant` key in the lesson JSON → resolver + surface gates.
8. Full gate sequence (below). Then update state files.

**Batch size that works: 10–30 steps per session.** Do not exceed it. A larger batch is not
faster; it is where unread output ships.

## Every generator needs four things

1. **The generator** in `src/lib/variants.ts`: `{ tag, label, forms, gen(rand, band, form) }`.
2. **An independent route** in `variants.test.ts` (the `INDEPENDENT` map, keyed `"gen@form"` or
   `gen`) that recomputes the answer **from the printed prompt by a different method**. Two
   independent derivations must agree. This is the heart of the design.
   Routes must never use the shortcut under test: solve equations by *search*, not by inverting;
   count digit places by *string position*, not `log10`; find roots by *search*, not `Math.sqrt`;
   walk recursive sequences *term by term*; compute LCM by *walking multiples*.
3. **Union + band entries**: add form names to `VariantForm`; add the tag to `BAND` in
   `variants.resolver.test.ts` as `"early"` (K–2) or `"later"`.
4. **A declaration** on the lesson step: `"variant": { "gen": "…", "form": "…" }`.

If you add a builder for a widget type that has no gate branch in `variants.test.ts`, **add the
branch**. Generic checks are not sufficient — each engine has hazards no value-widget has. Ask
the same five questions in that engine's own terms (correct / traps real / traps bite /
diagnostic / deterministic).

## Gate sequence — run EVERY session, all of it

```bash
npm run typecheck                      # must be clean
npx vitest run                         # all green (~8,350 tests; shard if it stalls)
npm run validate:content               # 1223/1223
npm run lint:pedagogy                  # 1139/1139
npm run validate:native                # source-level integrity — see note below
node scripts/check-registration.mjs
timeout 850 npm run build > /tmp/build.log 2>&1; echo "EXIT:$?"
```

**`validate:native` is not optional.** It is the only gate that catches things typecheck and
vitest cannot see: a native `<button>` without an explicit `type` (which submits its enclosing
form), host-absolute import paths, unbounded API parsing, unreachable internal routes. Session
113 shipped six untyped buttons in new admin/teacher UI precisely because this gate was left
off the checklist. In a working checkout it will still flag `node_modules/` and `.next/` — those
are archive-only checks and are expected; **any other** finding is a real defect.

**If `npx vitest run` appears to hang**, it has probably been OOM-killed under output buffering.
Shard it — `npx vitest run --shard=1/4` … `4/4` — which also gives you a readable per-shard
pass count instead of one silent wall.

**Check the build by EXIT CODE, not by grepping for "error".** It can print
`✓ Compiled successfully` and still exit 1 on an ESLint failure. Note `> log 2>&1`, never
`2>&1 > log` (that order leaks stderr).

**Never weaken a gate to make it pass.** If a gate assertion is genuinely wrong (it encoded an
assumption that a new, legitimate case breaks), you may correct it — but say so explicitly in
the log, and make it *stricter or equally strict*, never looser. Real examples: the fractionEntry
trap-distinctness check compared unsigned values and so rejected a legitimate −8/+8 trap pair;
the answer bound was "strictly positive" and so rejected a legitimate −3/25 answer. Both were
corrected to match the evaluator's actual semantics. Neither was relaxed.

## What the GATE catches (deterministic, reliable)

Trap collisions — the #1 failure mode. Special values collapse two distractors onto each other or
onto the answer. Real cases: `v=90`/`v=60` (rhombus angles), `b=60` (isosceles trapezoid),
`a=45` (parallelogram), `p=2` (ratio pairs), `k=d+1` (π-fractions), `n=2` (cube roots),
`D=60` (vertical angles), `a=2b` (ellipse axes). Geometry's special angles are collision
factories.

Freshness failures. **Fix with a new DIMENSION, not a wider axis.** If a pool is genuinely
constrained, widening won't help — and widening often pushes values out of range. Add a second
dimension, preferably one the authored content already uses (a second context, a second phrasing,
a different item count).

## What only READING catches — do not skip step 5

Every one of these shipped past a green gate and was caught only by printing the output:

- **Invented rounding.** A backward-division trap printed `1.67` for 5÷3 when no prompt states a
  convention. (Rule 6.)
- **Derived English morphology.** `"Every book wants a shelve"` (naive `s`-stripping),
  `"a sphere has round all over"` (a verb factored out of data that couldn't share a template),
  `"3th"`/`"5ths"` ordinals, `"1 units up"` (count disagreement).
  **Store singulars, plurals and verbs in data; never derive English morphology with a regex.**
- **Spliced or dangling phrases.** `"All both points line up"`, `"same signs give a positive."`
  — both from careless `.replace()` and ternaries.
- **Dropped units.** A word-problem success message that lost its `m`.
- **Traps displayed reduced** when the misconception produces an unreduced pair — matches by
  value, but the diagnosis names numbers the learner never saw.
- **A guard that excluded authored content.** A "hazard" check deleted (8×10⁷)×(5×10³), which is
  an actual authored item. A guard that rejects the content it is meant to reproduce is a bug.

When you change a prompt's wording, **re-run the gate immediately**: the independent route's regex
often hardcodes the old phrasing. That coupling is deliberate — it is the dual route working.

## Tooling gotchas

- Python patch scripts write at the end, so a failed `assert` discards *every* edit in that
  script. Prefer targeted string replacement when `\uXXXX` escapes appear in the target text.
- Greedy `[\d.]+` swallows sentence periods — use `(\d+(?:\.\d+)?)`.
- `grep -c` exits 1 on zero matches, breaking `&&` chains.
- Vitest jsdom tests need `// @vitest-environment jsdom` on line 1.
- Feedback must be ≥25 characters and must not open with a negation (`NEGATION` regex ban). K–2
  copy is naturally terse and trips the length floor constantly — prepend framing words.

## Measurement tools — `npx tsx scripts/measure/<name>.mts`

| Tool | Purpose |
|---|---|
| `centrality.mts` | Ranks every conceptTag by leverage. The top-200 rollup is the target list. |
| `eff2.mts` | Overall coverage: refreshed / eligible / manipulative / declared |
| `grade.mts` | Per-grade ledger |
| `manip.mts` | Manipulative engines ranked by unserved steps |
| `g12.mts <grade>` | Unserved tags within one grade |
| `verify.mts` | Authored vs generated side by side — **run before declaring** |
| `full.mjs <tag…>` | Dump every authored numeric item for the given tags |

## Finishing a session

1. Append to `VARIANT_LOG.md`: steps added, generators added, every rejection with its reason,
   every gate catch, every reading catch, any authored-content error found but NOT fixed.
2. Rewrite `VARIANT_STATE.md`: current coverage numbers, the next 3 targets by leverage with the
   reason, and the running list of permanent rejections.
3. State the exact gate results. If any gate is red, say so plainly and do not claim the batch
   landed.

Do not inflate the step count. An honest 12 with every trap read is worth more than 40 unread.
