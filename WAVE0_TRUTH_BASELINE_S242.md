# Wave 0 — Repository and Corpus Truth Baseline

**Session:** S242 (Cowork)
**Date:** 14 August 2026
**Source seal:** `2d5f39f10e9e09da365af55e25a0a1064e9e02b7` — branch `cowork/s237`, working tree clean, 4,800 tracked files
**Scope:** TRUTH-01, TRUTH-02, TRUTH-03, GEN-01, MATH-01 from `MAGGIES_TRAIL_UPDATED_EXECUTION_PLAN_20260814.md`
**Authority:** Wave 0 is evidence-only. No product code was modified. The only tracked-file mutation in this session was a deliberate, immediately-reverted reproduction of the TRUTH-03 defect.

---

## 0. What changed about the plan

Wave 0 was scoped as "regenerate the counts so everyone agrees." It did that, but four of its own premises did not survive contact with the sealed tree, and one previously-unknown P0 defect surfaced that reorders the whole program.

**The headline: the plan's first premise is inverted.** It says *"Coverage is being mistaken for quality — all practice-eligible steps have runtime variants, but the repository does not prove they are excellent."* The truth is worse and cheaper to fix. **On the Practice and Review surfaces, 6.2% of eligible items are refreshable — 419 of 6,762 — and 461 of 530 chapters (87%) have none at all.** The variant investment does reach learners through Mastery Studio, which passes the step object intact; it does not reach them through the two surfaces named "practice" and "review". This is not a quality problem awaiting a sampling program. It is a wiring defect, and it gates the value of every downstream generator wave.

Second: **the build is not what is impure.** The 11,487 → 1,078 ledger mutation is real — I reproduced it — but `next build` never touches that file. A *passing* Vitest test destroys it. A session that hardens the build will not stop the data loss.

Third: **the corpus hash "evidence failure" is a stale artifact, not a corrupt tree.** One command fixes it.

---

## 1. Reconciliation table — every claim in the plan, checked

| # | Plan's claim | Verified value | Verdict |
|---|---|---|---|
| 1 | 129 courses, 1,701 lessons, 15,645 steps | 129 / 1,701 / 15,645 | **CONFIRMED** |
| 2 | Live hash `a01d31a9…` disagrees with manifest `bdfbe3fe…` — "P0 evidence failure" | Both hashes real and correct | **MISDIAGNOSED** — see §2 |
| 3 | 434 generators | **442** | **CORRECTED (+8)** |
| 4 | 4,268 variant declarations | **5,897** | **CORRECTED (+1,629)** |
| 5 | 4,471 practice-eligible steps have runtime variants | Category error — see §3 | **REFUTED** |
| 6 | Generator seal stale against seven changed inputs | 7 of 29 changed | **CONFIRMED exactly** |
| 7 | Strict CML: 5 errors, 332 warnings | 5 / 332 | **CONFIRMED** |
| 8 | …including 228 non-causal predictions, 21 response-heavy | **293** and **39** | **CORRECTED** — 228/21 were the script's 250-issue print cap |
| 9 | `next build` mutates the queue 11,487 → 1,078 | Real, but the trigger is `vitest` | **MISATTRIBUTED** — see §4 |
| 10 | 1,294 live prediction gates vs 1,362 adjudicated | 1,294 / 1,362 | **CONFIRMED** — all five sub-claims exact |
| 11 | 572 MCQ leakage rows remain | 572 | **CONFIRMED** (audit file 4 days stale) |
| 12 | 25 live graph defects | 25 recorded, **~20 live** | **STALE** — D-01/02/03/05 closed 3h later by `ad83214`; ledger has no status column |
| 13 | 1,078 withheld/mismatched illustrations | 1,078 | **CONFIRMED** — but see §5, it is *one* number, not two |
| 14 | 17 reversible-play engine families; 129 engines | 17 / 129 | **CONFIRMED with caveat** — the 17 was measured against a 127 denominator |
| 15 | ≥4,028 math display defects, likely 4,300–4,600 | Not re-derived on this seal | **UNPROVEN** — see §6; a separate ≥6,664-occurrence defect exists that no audit counts |
| 16 | Node 24 present | **Node 22.22.2** | **WRONG** for this container |
| 17 | 1 high-severity `nanoid` advisory | 1 high, `nanoid <3.3.18` | **CONFIRMED** |
| 18 | Local type-check passes | `tsc --noEmit` → 0 errors | **CONFIRMED** |
| 19 | 11,487-row queue "contains counts superseded by later closure" | All 11,487 rows are already OPEN-only | **PARTLY REFUTED** — see §5 |

---

## 2. The hash disagreement is one stale file

Three fingerprint rules exist and all three are working correctly:

| Rule | Live value | Covers |
|---|---|---|
| `authoredCorpusFingerprint` | `a01d31a9f5d3ff48…` | 1,830 authored files (129 courses + 1,701 lessons) |
| recorded in `content/curriculum-manifest.json` | `bdfbe3fe78922454…` | same file set, written Aug 13 |
| `corpusFingerprint` | `a2c49c7296b1783e…` | lesson bytes + test-file *paths* (test-record validity) |

`content/curriculum-manifest.json` was last regenerated at `c058a2b` (Aug 13). Lesson content changed at `ad83214` (Aug 14 — the S241 graph-defect fixes that added `xLabels`/`yLabels`). Nobody re-ran `npm run gen:manifest` afterwards.

**Live consequence, verified:**

```
$ node scripts/gen-product-state.mjs
gen-product-state: STALE curriculum manifest (manifest bdfbe3fe…, live a01d31a9…)
  — refusing to generate product state
```

`gen-product-state.mjs:31` fails closed by design, and it is doing exactly its job. So `PRODUCT_STATE.json` is frozen at Aug 13 and every number in it is one content commit behind. **This is not an evidence failure requiring a freeze-and-reconcile program. It is `npm run gen:manifest` followed by `npm run gen:state`.**

Do that *before* citing any product-state number, because the refusal means the current `PRODUCT_STATE.json` has not seen the S241 content at all.

---

## 3. P0 — NEW: the variant declaration mechanism is inert on Practice and Review

This did not appear in any prior audit and it reframes Waves 2, 6, and 12.

**Scope first, because it is easy to overstate.** Mastery Studio (`src/lib/masteryMission.server.ts:204`) passes the real `TStep` and therefore honours declarations: 97.5% of its practice-bank states are generated, covering 72.9% of declaring steps, and it is linked from every lesson completion, basecamp, and standards surface. **The defect is confined to the two surfaces named Practice and Review** — but those are the two a learner reaches when they choose to practise.

**Measured against the sealed tree:**

| Learner-facing (all pool-eligible items, declaring or not) | Items |
|---|---:|
| Pool-eligible items on Practice | 6,762 |
| **Refreshable today** | **419 (6.2%)** |
| Refreshable after both fixes | **6,027 (89.1%)** |
| Chapters with zero refreshable items today | **461 of 530 (87%)** |

| Declaration-side detail | Steps |
|---|---:|
| Steps declaring `variant.gen` | 5,897 |
| …pool-eligible (`check`/`challenge` + widget + conceptTag) | 5,835 |
| …whose `conceptTag` independently resolves via `hasVariants()` | 404 |
| …that survive the widget-surface guard and are served today | 227 |
| …still blocked by the `hasVariants` gate even if the declaration were forwarded | 5,431 |

**The number to watch is 419 → 6,027 of 6,762.** The 227 figure is declaring-steps-only and understates the surface, because 192 non-declaring items are already refreshed through the tag/alias path.

**A third defect, on the items that do work.** Of the 227 served, the declared *form* is never consulted: the path Practice uses is `variantFor(tag, seed, band)` → `resolveGeneratorTag(tag)`, which reads the generator and form from the 55-key alias table, not from the step. Six items resolve through an alias to a differently-named generator (e.g. `sp-03-01` declares `prob-fraction/spinner`, receives `probability-fraction`). So the wiring bug does not only suppress variants — on the minority it does serve, it can substitute a different problem shape than the author declared. That is a correctness defect, not only a coverage one.

**Two independent bugs compound.**

**(a) The declaration is never forwarded.** `src/app/(shell)/practice/[chapterId]/page.tsx:39-49` builds each pool item by copying named fields — `key, body, widget, explanationVariants, hints, context, conceptTag, lessonId, stepId`. **`s.variant` is not among them.** `src/app/api/review-steps/route.ts:56` does the same. The resolver's own comment at `src/lib/variants.ts:40510` says *"A step's own declaration wins over its tag's alias — this is the only way a manipulative item living inside a numeric tag can be refreshed at all,"* and that branch is unreachable from both learner surfaces.

**(b) The gate short-circuits before the resolver.** `PracticeClient.tsx:72` — `if (!hasVariants(item.conceptTag)) return item;` — and `ReviewClient.tsx:117` do the same. `hasVariants` consults only the 442 generator tags and a 55-key alias table; it never looks at `variant.gen`. So even after fixing (a), 5,431 steps across **1,504 distinct conceptTags** would still be skipped.

**The only path that works is Mastery Mission** (`src/lib/masteryMission.server.ts:204`), which passes a real `TStep`.

**Why this outranks the rest of the program:** every generator-quality wave (100/500-seed sampling, distractor contracts, anti-repeat, GQR ≥9.2) prices the effort of certifying 442 generators against Practice/Review exposure that is currently 6.2% of eligible items. Fixing the wiring first makes the certification worth its cost — and it also means any regression the sampling waves find is, on those surfaces, largely invisible to learners today, which changes the release-blocking calculus.

**Recommended packet (bounded, testable, no pedagogy decision):** forward `s.variant` in both surface builders; replace the `hasVariants(conceptTag)` gate in both clients with a resolver-aware predicate that also considers `step.variant`; decide whether the declared form should win over the alias table (this one *is* a design question — route it to ARCH-03); add a regression test asserting a declared step with a matching widget surface receives the declared generator. Then re-measure: **419 → 6,027 of 6,762**. Forwarding alone is not sufficient — the gate blocks 5,431 steps regardless, so both halves must land together.

---

## 4. TRUTH-03 — reproduced, and the plan blames the wrong command

**The plan says `next build` mutates the ledger. It does not.** There is no `prebuild`/`postbuild` hook, no webpack plugin, no `instrumentation.ts`, no `generateStaticParams`, and no production module imports the writer. This was checked by reading *and* by execution: `npm run build` ran to completion (exit 0, "Compiled successfully in 85s") and left all 4,800 tracked files SHA-256 byte-identical. **The build is pure. It was never the problem.**

**The actual trigger, reproduced this session:**

```
$ wc -l PREMIUM_PENDING_WORKLOAD_QUEUE.csv        →  11488
$ npx vitest run src/components/figureTextAdversarialAudit.test.tsx
   Test Files  1 passed (1)
        Tests  1 passed (1)
$ wc -l PREMIUM_PENDING_WORKLOAD_QUEUE.csv        →   1079
$ git diff --stat
   PREMIUM_PENDING_WORKLOAD_QUEUE.csv | 10411 +----  1 insertion(+), 10410 deletions(-)
```

**A passing test silently deleted 10,409 rows of a tracked source ledger.** The writer is `src/components/figureTextAdversarialAudit.test.tsx:218` — an unguarded `writeFileSync` that emits only its own `ILLUSTRATION_REPLACEMENT` rows under the identical 15-column header, so the file still parses and still looks like the queue. Tree was restored to byte-identical state immediately (verified against a pre-run sha256 manifest of all 4,800 tracked files).

**Three sibling writers have the same defect:**

- `src/components/collisionSweep.s238.test.tsx:63` → `COWORK_CACHE/label-collision-remainder-s238.csv`
- `src/components/figuresCollision.s238.test.tsx:82` → `COWORK_CACHE/figure-collision-remainder-s238.csv`
- `e2e/wave04-math-rendering.spec.ts:29,49` → tracked PNGs under `WAVE04_SCREENSHOTS/`

**The fix does not weaken any gate.** The same file already gates a different write behind `UPDATE_FIGURE_TEXT_BLOCKLIST=1` at line 227 — apply that pattern to line 218. The assertions at lines 236-240 (`toHaveLength(3816)`, `toHaveLength(1078)`, `size 136`) are what actually enforce the contract, and they stay untouched. Changing what a test *writes* is not changing what it *asserts*.

**Also worth untracking:** `data/app.db{,-wal,-shm}` are committed live SQLite files, `.tier-precheck.json` (1.3 MB), `.wp1-shard-{a,b,c}.csv`, `.build-time`, and a tracked 1.3 MB file literally named `1` (a shell-redirect accident — almost certainly an intended `2>&1`).

---

## 5. The pending queue is not what the plan thinks

The plan says the 11,487-row queue "contains counts that were superseded by later closure work." Checked directly:

| Workstream | Rows |
|---|---:|
| MATH_TYPESETTING | 9,579 |
| ILLUSTRATION_REPLACEMENT | 1,078 |
| MCQ_DISTRACTOR_REVIEW | 572 |
| PREDICTION_GATE_REVIEW | 200 |
| CLOSURE_LEDGER | 27 |
| ENGINE_REVERSIBLE_PLAY | 17 |
| PREMIUM_REBUILD_WAVE | 8 |
| INTERACTION_NECESSITY_REVIEW | 3 |
| ENGINE_DISPOSITION_REVIEW | 3 |
| **Total** | **11,487** |

**11,485 of the 11,487 rows carry an `OPEN*` status** (the two exceptions are `CLOSURE_LEDGER` rows with compound free-text status, one reading `CLOSED-SOURCE / RUNTIME REPROVE OPEN`). So 11,487 is already essentially the open-only view, and **1,078 is a workstream slice, not a superseded total.** The two numbers are not competing measurements of the same thing.

Two corrections that do matter:

- **The 200 `PREDICTION_GATE_REVIEW` rows are genuinely stale.** Source shows all 17 REMOVE gates absent, all 200 REWRITE gates retained with changed reveals, and 51 KEEP rows thinned. Live count is 1,294 against 1,362 adjudicated — the arithmetic closes exactly. These 200 rows should be retired, not worked.
- **The two 1,078s are one number, not corroboration.** `PREMIUM_PENDING_WORKLOAD_QUEUE.csv`'s illustration rows are *written by* the adversarial audit (that is the TRUTH-03 defect). Joining on `(lesson_id, step_path)`, 1,077 of 1,078 are identical; the one difference is `pc-03-01`, where S240 inserted a step and shifted the index. Do not treat these as independent evidence.

---

## 6. MATH-01 — the 4,028 estimate is contested; a larger unaudited defect exists alongside it

**On the 4,028: I do not have grounds to refute it, and the composition argument is weaker than it looks.** Tracing it to source (`COWORK_CACHE/typesetting-verdict.md:24`): 3,765 + 181 + 82, where the 3,765 term is rows that *do* render inline but where the audit's `display_recommended` column preferred display mode. It is tempting to discount those as typography preference and quote 263 as the real floor — but **that same document names 263 and rejects it explicitly**, calling it "wrong by more than 15x" and "must not be used for any planning purpose," on the strength of four separate lenses plus a de-overlap that pushes the estimate to 4,300–4,600. I did not re-run those lenses. **Verdict on the plan's 4,028–4,600 figure: UNPROVEN on this seal, neither confirmed nor refuted.** Re-deriving it against `2d5f39f` is genuine outstanding MATH-01 work, not a settled question. Whether display-vs-inline mode counts as a defect is a policy call that belongs to ARCH-02, and until it is ruled the number cannot be interpreted either way.

**Separately, and regardless of how that resolves, there is a defect class in no existing audit.** I ran the real tokenizer (`src/lib/math/authoredMath.ts`) over **118,138 learner-visible strings** across authored steps, feedback, hints, options, predictions, and remedials, using the same `includeArithmetic` flag each surface actually passes.

| Pattern | Occurrences (floor) | In any existing audit? |
|---|---:|---|
| **WORD_TEARING** | **≥6,664** (5,582 distinct strings) | **No** |
| RAW_FRACTION | ≥875 | Partly |
| RAW_CARET | ≥183 | Partly |
| RAW_INEQUALITY (`<=`, `>=`) | ≥58 | No |
| RAW_DERIVATIVE | ≥20 | No |
| RAW_PI | ≥13 | No |
| RAW_INTEGRAL | ≥2 | No |
| **Total rows** | **≥7,815** | |

**These are floors, not totals.** Independent QA re-derivation with wider field coverage finds **≥10,656** torn islands — my index omits the `numericErrors[]`, `commonBuilds[]`, `items[]`, `pairErrors[]`, `commonPlacements[]` and `pointErrors[]` feedback arrays (all of which reach `MathProse` with arithmetic on via `evaluate.ts` → `res.feedback` → `QuizShell.tsx:201,219`), it detects right-edge tears barely at all (5 found vs ~1,238 present — e.g. `1/2 × b` eating the "b" of "base"), and it never reaches 60 lessons. Two independently-written detectors agreed island-for-island on the rows both covered, so the *method* is sound and the *enumeration* is short. Treat 6,664 as the low end of a ~6,700–10,700 band.

**What word-tearing is.** The arithmetic atom at `authoredMath.ts:256` is `\d*[A-Za-z]` — a single letter, **with no left word boundary**. So the final letter of an ordinary English word is absorbed into the math island beside it. Verified against the real parser:

| Authored | On screen |
|---|---|
| `Position −6, distance 6.` | `Positio` ⟦*n* − 6⟧`, distance 6.` |
| `Too far left — you have passed −6.` | `Too far left — you have passe` ⟦*d* − 6⟧`.` |
| `area = 1/2 bh` | `are` ⟦*a* = ½⟧ `bh` |
| `y = sqrt(9)` | ⟦*y* = *s*⟧`qrt(9)` |
| `f(x) = x^2` | `f` ⟦(*x*) = *x*²⟧ |

Two harms compound: the English word is broken, **and** the authored U+2212 minus is re-set as a binary subtraction operator. Row 4 tears the token `sqrt` in half.

The file's own S237 comment block documents fixing a closely-related bug (islands that were *false statements*) with a right-boundary guard. The left word boundary was never added. **The fix is one assertion** — `(?<![A-Za-z])` on the leading atom — but it is a semantic-math change and belongs to ARCH-01/ARCH-02, so it is specified here, not applied.

**`verify:math-format` is green throughout all of this**, because it is a wiring check: it asserts KaTeX is imported only from sanctioned modules, that no raw LaTeX sits in content JSON, and that three identifier substrings exist in `MathText.tsx`. It never invokes the parser (`grep -c authoredMath scripts/verify-math-format.mjs` → 0). It would still pass if `MathText.tsx` were gutted to return plain text.

**Structural bypasses the tokenizer cannot reach**, with the commands, because these are the shapes any semantic-math migration must plan around:

| Shape | Count | Command |
|---|---:|---|
| SVG `<text>` open tags in `widgets.tsx` — KaTeX emits HTML+MathML, neither legal inside `<text>` | 337 | `grep -c '<text[ >]' src/components/widgets.tsx` |
| `</text>` close tags (upper bound on distinct elements) | 344 | `grep -c '</text>' src/components/widgets.tsx` |
| Raw JSX label interpolations (`>{choice.label}<` and kin) | 51 | see `MATH_PRESENTATION_INDEX.csv` notes |
| `toFixed` occurrences in learner components | 209 | `grep -c toFixed src/components/widgets.tsx` |
| `MathProse` call sites in `widgets.tsx` | 155 | `grep -c '<MathProse' src/components/widgets.tsx` |
| …of which the identical expression `spec.prompt` | 152 | `grep -o 'MathProse text={[^}]*}' … \| sort \| uniq -c` |

The last row is the load-bearing one: engine-layer math coverage is one expression repeated, not 155 considered decisions. How many of the 209 `toFixed` results are *rendered directly* rather than passed onward is not measurable from source alone and remains open.

---

## 7. GEN-01 — generator inventory

`GENERATOR_INVENTORY.json` is generated by executing the live registry, not by parsing it.

| | |
|---|---:|
| Generators (`VARIANT_GENERATORS.length`) | **442** |
| Distinct tags (no duplicates) | 442 |
| Referenced by ≥1 declaration | 429 |
| Never declared (tag/alias reach only) | 13 |
| `declarationOnly` | 17 |
| Forms **defined** by generators (supply side, `sum(formCount)`) | 2,657 |
| Distinct `(gen, form)` pairs **exercised** by declarations (demand side) | 2,896 |
| Sampling tier 500 (high-reach or regex-rebuild) | 74 |
| Sampling tier 100 | 368 |

Each entry carries: tag, label, forms, declaring-step count, distinct lessons, distinct forms exercised, distinct conceptTags, widget surfaces, step kinds, display path, parameter-space class, risk flags, sampling tier.

**The risk flag that matters — `regex-display-rebuild`.** Seven loops at `variants.ts:39642, 39763, 39865, 39982, 40116, 40154, 40210` monkey-patch `generator.gen` after the array is built. The upgrade receives the **already-rendered** variant, so the numeric state is gone, and it recovers the numbers by regex over the prompt string — then builds the *figure geometry* from what it parsed. **50 generators, 201 `(tag, form)` pairs**, 43 `prompt.match(` sites, 44 distinct "could not parse" throws.

The codebase names this as its own worst defect source (`variants.ts:43-52`): *"the single largest cost and the largest defect source in the conversion programme… a mis-scoped capture silently produced ten wrong answers in S153."* The remedy — an additive `Variant.params` field carrying structured state forward — exists but is **~10% adopted**: 19 generators emit `params`, 8 branches consume it.

**This is the concrete form of the plan's ARCH-03 "canonical generated-state contract."** It is not a greenfield design problem. It is finishing a migration the repo already started and already knows is right, on a bounded list of 201 pairs.

Within a single generator, state is sound: prompt, answer, and distractors are destructured from one rejection-sampled scope, and the `ok` predicate pre-computes distractors to reject colliding draws. Generation is fully deterministic (`prng.ts` FNV-1a → mulberry32, no `Math.random` in the generator path); the same `(tag, seed, band)` replays byte-identically, and the gate asserts this at 400 seeds × generator.

---

## 8. Gate status on this seal

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | **PASS** — 0 errors |
| Math format | `node scripts/verify-math-format.mjs` | **PASS** — but see §6 |
| Native integrity | `node scripts/native-integrity.mjs` | **FAIL (exit 1)** |
| Strict pedagogy | `node scripts/cml-lint.mjs . --strict` | **FAIL** — 5 errors, 332 warnings |
| Product state | `node scripts/gen-product-state.mjs` | **REFUSES** — stale manifest (§2) |
| Dependency audit | `npm audit` | **1 high** — `nanoid <3.3.18` via postcss |

**New regression, introduced by the handover commit itself.** `validate:native` reports four findings; three (`node_modules`, `.next`, `tsconfig.tsbuildinfo`) are expected artifacts of a working checkout per `CLAUDE.md`. The fourth is real: `scripts/brand/gen_avatar_prompt_pack.py` hardcodes `/home/claude/avatar-prompts.json` (line 189) and `/home/claude/AVATAR_PROMPT_PACK.md` (line 288), both introduced by `2d5f39f` — the S241 handover commit carried in the bundle. `CLAUDE.md` states `validate:native` is not optional, so **the delivered bundle introduces the only genuine finding this gate reports.** Fixing it (derive paths from the repo root) removes that finding but **does not turn the gate green** — it still exits 1 on the three expected artifacts, which is its designed behaviour in a working tree, not a release tree.

**The five CML errors, in full** — four lesson files:

```
flagship-missing-prediction      derivatives-in-context/dc-02-02.json#3
flagship-missing-prediction      polynomial-rational-analysis/pra-04-02.json#1
flagship-missing-prediction      trig-functions/tf-03-02.json#1
flagship-without-manipulation    radical-functions/re-04-02.json
flagship-missing-direct-surface  radical-functions/re-04-02.json#1
```

---

## 9. Corpus counts — and the ambiguity that caused the drift

| Measure | Value |
|---|---:|
| Courses | 129 |
| Lesson files | 1,701 |
| **Top-level steps** | **15,645** |
| — `check` | 5,060 |
| — `concept` | 3,684 |
| — `interactive` | 3,498 |
| — `challenge` | 1,702 |
| — `recap` | 1,701 |
| Remedial blocks | 1,697 |
| Remedial steps (concept + check each) | 3,394 |
| **Total steps including remedials** | **19,039** |
| Live prediction gates | 1,294 |
| Engine registry | 129 |
| Test files | 384 |

**15,645 and 19,039 are both correct.** They differ by exactly the 1,697 remedial concept/check pairs. Every prior document quotes 15,645 without saying it excludes remedials, which is how two honest scans of the same tree produce different numbers. **Any future count must state which walk it used.** `PRODUCT_STATE.json`'s `tests: 12925 / testFiles: 322` are carried forward from Session 218 and are not current (384 test files exist today).

---

## 10. Wave 0 exit gate — status

| Exit criterion | Status |
|---|---|
| One signed baseline | **MET** — this document + `TRUTH_MANIFEST_S242.json`, all numbers traceable to a command against `2d5f39f` |
| No conflicting "current" counts | **MET** — §1 reconciles all 19 claims; §9 resolves the 15,645/19,039 ambiguity |
| Stale queues marked historical or regenerated | **MET for identification** — §5. Retirement of the 200 prediction rows is a follow-on edit |
| Verifier green | **NOT MET** — native integrity, strict CML, and product-state all red (§8) |
| Two builds byte-stable | **NOT MET, but diagnosed and reproduced** — §4. The build was never the problem |

**Wave 0 is evidence-complete and gate-incomplete.** The remaining gate work is bounded and specified below; none of it requires a pedagogy or architecture ruling.

---

## 11. Recommended next packet

Ordered by (learner impact × cost). Items 1–5 are mechanical and carry no design decision.

1. **Repair variant delivery on Practice and Review** (§3). Forward `s.variant` in both surface builders, replace the `hasVariants(conceptTag)` gate with a resolver-aware predicate in both clients, add a regression test. Both halves must land together — neither alone helps. Moves refreshable items **419 → 6,027 of 6,762** and takes chapters with zero refreshable practice from 461 to near zero. **Highest-value change in the repo right now.** The sub-question of whether a declared form should outrank the alias table is a design decision — route it to ARCH-03 rather than settling it in the packet.
2. **Guard the four test writers** (§4). Copy the `UPDATE_FIGURE_TEXT_BLOCKLIST` pattern already in the same file. Assertions untouched. Then untrack `data/app.db*`, `.tier-precheck.json`, `.wp1-shard-*.csv`, `.build-time`, and the file named `1`.
3. **`npm run gen:manifest && npm run gen:state`** (§2). Unblocks product-state regeneration; retires the "P0 evidence failure."
4. **Fix `gen_avatar_prompt_pack.py` paths** (§8). Two lines; removes the only genuine `validate:native` finding.
5. **`SEC-01`** — override `nanoid` to ≥3.3.18, re-run audit + build + tests.
6. **Complete the MATH-01 index before pricing the migration** (§6). Extend the field enumeration to the six missed feedback arrays, add right-edge tear detection, cover the 60 missed lessons, and re-derive the 4,028/4,300–4,600 estimate on this seal under a ruled display-mode policy. Only then is the migration's size known.
7. **Add the left word boundary** to the arithmetic atom (§6) — `(?<![A-Za-z])` on the leading atom. One assertion against a ≥6,664-occurrence defect, but it is a semantic-math change: route through ARCH-01/ARCH-02 with an adversarial fixture set. Do not hand-patch content.
8. **Retire the 200 stale `PREDICTION_GATE_REVIEW` rows** (§5) and add a status column to `GRAPH_DEFECT_INDEX.md` so closed defects can be recorded (§1 item 12).
9. **Re-seal `GENERATOR_SOURCE_HASHES.json`** — 7 of 29 inputs changed; re-seal without rebuilding coverage, as the plan directs.

**Do not start** the 100/500-seed sampling program, the gold-cohort pilot, or the semantic-math migration until item 1 lands. All three price their effort against Practice/Review exposure that is currently 6.2% of eligible items.

---

## Artifacts produced

| File | Contents |
|---|---|
| `TRUTH_MANIFEST_S242.json` | Machine-readable baseline — seal, hashes, all corrected counts, gate results, verdicts |
| `GENERATOR_INVENTORY.json` | 442 generators with user map, forms, surfaces, display path, risk flags, sampling tier |
| `MATH_PRESENTATION_INDEX.csv` | 7,815 rows — lesson, step, field, arithmetic flag, pattern, detail, source text |
| `WAVE0_TRUTH_BASELINE_S242.md` | This document |

Every number in these artifacts was produced by a command run against seal `2d5f39f` in this session. No number is carried forward from a prior session's evidence. Where a prior artifact is the only source, it is labelled as such and dated.

---

## Independent QA record

This baseline was adversarially reviewed by an assessor that did not produce it, tasked with refuting rather than confirming. It independently re-derived the six load-bearing claims by different methods, ran `npm run build` to completion, re-ran the vitest mutation, and hand-judged 25 sampled word-tearing rows.

**What survived unchanged:** every figure in §3's declaration table, §4 in full (including build purity, now verified by execution rather than inference), §5's nine-workstream breakdown and the 1,077/1,078 join, §7's inventory figures, §8's five CML errors verbatim, and all of §9's corpus counts. Word-tearing false-positive rate on the sample: 0 of 25.

**What the review corrected, and is fixed above:**

- §0/§3 said the variant investment "does not reach the learner at all." It reaches them through Mastery Studio; the defect is specific to Practice and Review. **Scope narrowed.**
- The headline metric was declaring-steps-only (227 → 5,835). The learner-facing pair is **419 → 6,027 of 6,762**. **Metric replaced.**
- §6 quoted 263 as the "genuine" math floor. The cited source explicitly rejects 263 as "wrong by more than 15x." The refutation of 4,028 was withdrawn and the claim marked **UNPROVEN**.
- §6 presented 6,664/7,815 as totals; they are **floors** — wider field coverage finds ≥10,656.
- §7 conflated forms *defined* (2,657) with `(gen, form)` pairs *exercised* (2,896). **Row split.**
- §8 claimed a two-line fix would turn `validate:native` green; it removes the only genuine finding but the gate still exits 1 on expected artifacts. **Corrected.**
- §5's "not a single CLOSED row" was absolute; 2 of 11,487 carry compound status. **Softened.**
- §6's structural-bypass counts (302 SVG `<text>`, 156 `MathProse`, 165 `toFixed`) did not reproduce. **Replaced with commands and corrected values (337/344, 155, 209).**

**One finding the review added, since incorporated into §3:** on the 227 items Practice does refresh, the declared form is never consulted, and six resolve through an alias to a differently-named generator. The wiring bug can substitute a different problem shape, not merely suppress one.

The working tree was verified clean and SHA-256 byte-identical across all 4,800 tracked files at the end of both the authoring and the review pass.
