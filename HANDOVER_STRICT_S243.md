# HANDOVER — STRICT START FILE FOR THE NEXT SESSION (S243)

**Read this first, completely, before any tool call. Then read `CLAUDE.md`, then `VARIANT_STATE.md`.**
This file is the contract for a fresh chat with no memory of S242. Everything in it was verified on
seal `0263690` (branch `cowork/s242`, 43 commits ahead of `origin/cowork/s237` = `53da787`).

---

## 0. Non-negotiables inherited from the owner (all still in force)

1. **Never change authored lesson prose** (CLAUDE.md rule 1). An MCQ option label is authored
   prose. Content errors go to `VARIANT_LOG.md` for a human.
2. **Exact answers**: π exact unless the concept requires a numeric; `π/2` never `1π/2`; `π` never
   "pi"; no caret on any learner surface — `x` phrasing or typeset exponents, system-wide.
3. **Generators are pure functions of the seed.** No `Math.random`, no `Date.now`.
4. **Never weaken a gate to make it pass.** Corrections must be equally strict or stricter, and
   must be announced in the log.
5. **Style**: cut verbosity in chat replies.
6. **dy/dx renders stacked as a true fraction, everywhere.**
7. **Anti-repeat storage**: existing ProgressStore + autoSync (already landed as `antiRepeat.ts`).

## 1. Repository state you are inheriting

- **Branch:** `cowork/s242`, HEAD `0263690`, clean tree. Base `53da787` is published as
  `origin/cowork/s237`.
- **Push is blocked** by the git proxy (`ethan556/maggies-trail` not in the session's authorized
  sources). Do not burn time on it: attempt one push at session end; if 403, refresh the bundle
  (`git bundle create <file> origin/cowork/s237..HEAD`) and deliver it. The stop hook's
  "N unpushed commits" counts against `origin/main` and overstates the gap.
- **All gates green at close of S242:** 4 vitest shards (5642 / 4354 / 2461 / 1473 + 1 skipped),
  variants gate 3996/3996, schema 1840/1840, pedagogy 1711/1711, registration consistent,
  `validate:native` = 4 archive-only findings (expected), build EXIT:0, chromium e2e 125/125,
  player projects 30/30, generated sweep 102,281 samples / 0 throws.
- **Zero-rows registers:** `GENERATOR_MATH_PRESENTATION_AUDIT.csv` (GRB-01),
  `GENERATOR_DISTRACTOR_AUDIT.csv`, `GENERATOR_EDGE_CASE_AUDIT.csv`,
  `GENERATOR_INTERACTION_SYNC_AUDIT.csv`, generated MCQ hard leaks.

## 2. Hard-won operational rules — violating any of these cost S242 real time

1. **Restart `next start` after EVERY build.** A stale server 400s the new chunk hashes and every
   browser measurement against it is vacuous. Hit twice.
2. **Guard every browser measurement with a render check first** (body text length, a known
   selector). S242 produced a "0 carets" result against a blank page. A measurement without a
   render guard is not a measurement.
3. **Never add a Content-Security-Policy to `next.config.mjs`.** The CSP lives in
   `src/middleware.ts` (per-request nonce, set on the REQUEST header — that is what makes Next
   stamp its own scripts). Two CSPs are enforced as an intersection; the symptom of a second one is
   a blank app that looks exactly like the bug S242 fixed.
4. **`scripts/audit/mcq-leakage.mts` writes only with `--write`.** Without it you are reading the
   previous run's file and the seal in the header lies to you.
5. **Shard vitest** (`--shard=i/4`); the unsharded run OOMs silently. Check builds by EXIT CODE.
6. **Run audits from the repo root**; scratch `.mjs` probes must live in the repo (Playwright
   resolves from there), and delete them after use.
7. **Do not run the vitest suite while editing `src/`** — S242 recorded phantom failures from this.
8. **Every count is stale until re-measured.** S242's tally: 293→229, 63→0, 40→23, 81→5, 158→18,
   1078→91, 942→660→25. Open one of the things being counted before believing the count —
   including numbers written by S242.

## 3. Decisions already made — do NOT re-decide

- **ARCH-01/02 are RULED** (`ARCH_01_02_RULING.md`): no learner-facing AST; typed values where
  computed, authored notation + the `authoredMath.ts` boundary where displayed; enumerated
  invariant; exact/intermediate/final ladder; grade bands. Reopen ONLY on the stated condition
  (leak index cannot reach zero by boundary repairs).
- **GRB-02 ruling:** quadratic-formula generators keep the surd (`x = 1 ± √5`), never a float.
- **CSP route:** nonce via middleware. Cost (21 shell routes now dynamic) accepted and recorded.
- **Rule-7 withdrawals are permanent:** `g4p-02-01/k2` and `g4p-02-02/k2` declare no variant.
  Do not re-declare.
- **`cosmetic-only` GRB-04 pairs** (many prompts, ONE answer) are never fixed by adding nouns:
  the answer must move, or the pair is a rule-7 rejection.
- **The figure guard on `count-on-hops` etc. is correct behaviour**, not a defect: hidden IS the
  repair for wrong declarations. The remaining work is per-step figure selection (authoring).
- **The evalOrder `^` token stays `"^"` in specs** (evaluator keys on it); it renders as xʸ and a
  true superscript. The sweep excepts exactly that one shape.

## 4. The work queue for S243, in order, with acceptance criteria

### Priority 1 — CML-01 burn-down (calendar risk: waivers expire 2026-11-13)
`reports/CML01_BURNDOWN.csv` splits 161 flagged predictions: **16 reachable-by-moving** (a direct
step exists after the prediction, distance 4–6), **2 manipulative-precedes**, **143
no-manipulative-anywhere**. Start with the 18 sequencing cases ONLY if re-ordering steps without
touching prose is genuinely possible under rule 1 — otherwise they too are authoring and go to the
human list. The 143 need an interactive surface BUILT per lesson (reuse existing engines; never
gallery-only). This is Wave-5 scale work: batch 10–30 steps, read everything.
**Accept:** waiver counts in `CML_WAIVERS.json` RATCHET DOWN with each landed batch (they may never
rise), strict CML stays 0 errors.

### Priority 2 — GRB-04 under-parameterised backlog (256 pairs)
Order by `npx tsx scripts/audit/exhausted-leverage.mts` (harm = declarations × window shortfall).
Head of the family list: `g1-shapes-measure` (6 thin forms / 40 declarations), `g2-shapes-shares`,
`root-solve`, `g2-add-subtract-100`, `shape-identify`. Fix with a NEW DIMENSION the authored
content already uses, never a wider axis. Print and read output per CLAUDE.md step 5. Expect trap
collisions; guard, never relax.
**Accept:** re-run `exhausted-by-subject.mts`; repaired pairs leave the register; variants gate
green; no `cosmetic-only` pair "fixed" by nouns.

### Priority 3 — the 14 remaining cosmetic-only pairs
Same defect class as `compareNegativeFractions` (answered `gt` forever) and `trailingMatchCount`
(answered 2 forever). Each needs the missing mathematical dimension or a recorded rule-7 rejection.
The list is in `GENERATOR_EXHAUSTED_BY_SUBJECT.csv`, verdict `cosmetic-only`.

### Priority 4 — MATH-03 residue
820 rows in `MATH_SYMBOLIC_DISPLAY_INDEX.csv`, now judgeable against ARCH-02 §6 grade bands.
Bounded packets; the known-open item is the orphaned function name (`f(x)` renders `f` + typeset
`(x)`) — ruled OPEN in ARCH-01 §3.2, do not hack at it with regexes.

### Not yours (do not start): 25 authored MCQ leaks (human, listed in VARIANT_LOG), VIS-01 figure
selection (authoring), ENG-01/02 + ADAPT-01 (spec-first design), ACC-01 §8 (hardware),
PERF-01 budgets (owner decision), PILOT/OPS/EVID (institutions; packets in
`CLOSURE_PACKETS_S242.md`).

## 5. Session-close duties (mandatory, CLAUDE.md "Finishing a session")

Append the session ledger to `VARIANT_LOG.md` (every rejection with reason, every gate catch,
every reading catch, authored errors NOT fixed). Rewrite `VARIANT_STATE.md` (coverage deltas,
next 3 targets by leverage, permanent-rejection list). Write `HANDOVER_COWORK_S243.md`. State
exact gate results; if any gate is red, say so and do not claim the batch landed. Attempt one
push; deliver a refreshed bundle when it 403s.

## 6. Key files, one line each

| File | What it is |
|---|---|
| `CLAUDE.md` | the working contract; read completely before acting |
| `VARIANT_STATE.md` / `VARIANT_LOG.md` | current coverage + the append-only ledger |
| `ARCH_01_02_RULING.md` | the semantic-math and canonical-form rulings |
| `SEC02_CSP_NONCE.md` | why the CSP is a middleware nonce and what it cost |
| `HANDOVER_COWORK_S242.md` | narrative of the previous session |
| `S242_THREE_NUMBERS_I_ASSERTED.md` | the carried-count failure pattern, documented against S242 itself |
| `reports/CML01_BURNDOWN.csv` | the 16/2/143 split behind Priority 1 |
| `reports/generator-audit/GENERATOR_EXHAUSTED_BY_SUBJECT.csv` | GRB-04: closed/cosmetic/backlog verdicts |
| `reports/mcq/MCQ_LEAKAGE_INDEX.csv` | seal-stamped; regenerate with `--write` |
| `scripts/audit/exhausted-leverage.mts` | GRB-04 harm ordering |
| `CML_WAIVERS.json` | the ratchet; expiry 2026-11-13; counts may only fall |

## 7. Gate sequence (run all of it, every session)

```bash
npm run typecheck
npx vitest run --shard=1/4   # …2/4, 3/4, 4/4
npm run validate:content     # 1840/1840
npm run lint:pedagogy        # 1711/1711
npm run validate:native      # 4 archive-only findings expected; anything else is real
node scripts/check-registration.mjs
timeout 850 npm run build > /tmp/build.log 2>&1; echo "EXIT:$?"
# browser work: rebuild → RESTART next start → render-guard → measure
```
