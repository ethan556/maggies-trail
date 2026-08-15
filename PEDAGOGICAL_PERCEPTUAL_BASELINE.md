# PEDAGOGICAL & PERCEPTUAL EXCELLENCE — WAVE 0 BASELINE

**Source seal:** `b1a8e79` · **Date:** 2026-08-15 · **Session:** S242

This is the whole-program baseline the V3 plan's §8 artifact contract asks for. It says what is
true at this seal, what was proved, and — at least as importantly — what is not certified and must
not be quoted as if it were.

Companion artifacts: `WAVE0_TRUTH_BASELINE_S242.md` (corpus and claim reconciliation),
`TRUTH_MANIFEST_S242.json`, `GENERATOR_INVENTORY.json`, `GENERATOR_PEDAGOGY_BASELINE.md`,
`GENERATOR_REBUILD_LEDGER.md`, `CML_WAIVERS.json`, `reports/generator-audit/*.csv`.

---

## 1. The register at this seal

| ID | Status | Evidence |
|---|---|---|
| TRUTH-01 | **closed** | `TRUTH_MANIFEST_S242.json` — one manifest, source-hashed, all current docs reconciled to it |
| TRUTH-03 | **closed** | Trap K: a *passing* test was deleting 10,409 ledger rows on every run. Now behind `UPDATE_PENDING_WORKLOAD_QUEUE=1`; proved by a full 13,648-test run leaving ledgers byte-identical |
| GEN-01 | **closed** | `GENERATOR_INVENTORY.json` (442 generators, user map, risk flags, tiers) + `GENERATOR_PEDAGOGY_BASELINE.md` |
| GEN-02 | **closed** | Sampling design implemented and executed: `scripts/audit/generator-quality-sweep.mts`, 102,251 problems, every seed reproducible from its own row |
| MATH-01 | **partial** | Presentation index built and reduced 7,815 → 99 rows; generated-side indexes now exist. The nine *separately named* indexes are not yet split out |
| ARCH-01 | **ruled and landed** | Word-boundary fix, S237 guard rescoping, relation islands, four further tokenizer defects — 33 fixtures |
| ARCH-02 | **ruled** | "Not defects — fix only what fails to render"; applied |
| ARCH-03 / ARCH-04 | **open** | Canonical generated-state and diversity contracts — unstarted |
| CML-01 | **closed** | 0 strict errors (was 5). Warnings ratcheted and waived with owner, rationale, evidence and expiry in `CML_WAIVERS.json` |
| UX-01 | **closed** | Grade 3 dead end fixed; exhaustive grade × goal × placement branch test |
| SEC-01 | **closed** | nanoid 3.3.18 via override; `npm audit` 0 vulnerabilities across 622 deps; guardrail test so the override cannot silently vanish |
| SEC-02 | **closed** | CSP with per-script SHA-256 hashes, HSTS, nosniff, referrer, permissions, COOP; hashes recomputed by test so a stale hash is a red test |
| PERF-01 | **partial** | Route budgets failing closed (`ROUTE_BUDGETS.json`); LCP/INP/CLS budgets not established |
| TOOL-01 | **closed** | Path normalisation in `native-integrity.mjs` and `generator-guard.mjs`; identical results on Windows and Linux |
| VIS-00 | **partial** | 25-defect ledger worked through; graph gates strengthened. Full generated-render sweep still opt-in |
| GATE-01 | **green at this seal** | See §4 |
| QA-01 | **open** | Rubric not yet published |

---

## 2. The four findings that mattered most

**Variant delivery was broken on Practice and Review, and no gate could see it.** Two compounding
bugs — the step's own `variant` declaration was dropped from the pool item, and a `hasVariants`
pre-gate rejected items before the resolver ran. 419 of 6,762 refreshable steps were actually
refreshing; 457 of 526 chapters served none. Every gate passed throughout, because the resolver was
never the broken part. Coverage had been measured on the declaration path, which was healthy, while
the delivery path was not measured at all.

**A passing test was mutating a source ledger.** `figureTextAdversarialAudit.test.tsx` wrote
`PREMIUM_PENDING_WORKLOAD_QUEUE.csv` as a side effect, deleting 10,409 rows every time the suite
ran. This is the mechanism behind the plan's own observation that the pending queue "contains counts
that were superseded" — the counts were not superseded, they were overwritten by the verifier.

**Two gates were reporting green on nothing.** `node scripts/cml-lint.mjs --strict` read `argv[2]`
as its root path, so the documented invocation resolved the root to `<cwd>/--strict`, found no
content beneath it, walked zero files and printed "0 error(s), 0 warning(s)". Separately, the same
lint truncated its output at 250 rows in file order, so errors late in the alphabet vanished while
the headline still counted them — which is why the plan's warning breakdown (228 + 21 = 249) was
wrong. The true figures at this seal were 292 and 39.

**The math presentation residue was mostly one mis-scoped guard.** The S237 boundary guard, which
correctly drops an arithmetic candidate that follows an operator, was iterating over *all*
candidates including always-on islands — so a radical or a fraction after an equals sign, the most
ordinary shape in this corpus, was discarded. 875 fractions and 106 carets. No prior audit had
identified this cause.

---

## 3. What is NOT certified

Stated plainly, because the plan's central warning is that coverage gets mistaken for quality.

- **Pedagogical quality is unmeasured.** Nothing here says a problem teaches the right thing, sits
  at the right difficulty for its band, or names the misconceptions learners actually hold. 200
  strict CML warnings are waived, not fixed, and expire 2026-11-13.
- **Rendered appearance is unmeasured.** The math audit proves what the tokenizer claims, not what
  KaTeX draws. No screenshot evidence, no viewport matrix, no 200% zoom, no collision testing.
- **Accessibility is partial.** Automated semantics only. No real-device touch, no VoiceOver, NVDA
  or TalkBack, no math narration certification.
- **Performance is partial.** Route budgets exist and fail closed. No interaction-frame, LCP, INP or
  CLS budget exists, and the two hotspot routes are budgeted at their current size, not their right
  size.
- **1,078 illustration placements remain withheld or mismatched.** Runtime containment prevents them
  rendering; containment is not repair.
- **572 MCQ leakage candidates remain unadjudicated.**
- **Production readiness is absent.** Email and LMS delivery are outbox-only, billing is
  demonstrative, persistence is single-node, no deployment is configured.
- **There is no independent efficacy evidence.** None of this is an outcome claim.
- **No anti-repeat mechanism exists.** 243 (generator, form) pairs cannot avoid repeating inside ten
  draws; 1,801 more would be served by a queue that does not exist.

---

## 4. Gate chain at this seal

```
typecheck                 clean
vitest                    13,807 passed, 4 skipped (4 shards)
validate:content          1840/1840
lint:pedagogy             1711/1711
cml-lint --strict         0 errors, 200 warnings (all within waived ceilings)
validate:native           3 archive-only findings (node_modules, .next, tsbuildinfo) — expected
check-registration        consistent
npm audit                 0 vulnerabilities, 622 dependencies
route-budgets             all routes within budget
```

No historical evidence is mixed into this table. Every line was executed at seal `b1a8e79` or its
immediate descendants in this session.

---

## 5. Recommended next packet

In the plan's own order, with what changed:

1. **QA-01** — publish the independent-assessment rubric. It is the cheapest remaining P0 and it
   gates the closure of everything after it.
2. **ARCH-03 / ARCH-04** — the canonical generated-state and diversity contracts. `GRB-05`
   (anti-repeat) sits inside ARCH-04 and should be decided there rather than as a generator repair.
3. **GRB-02 then GRB-01** — the rounding decision before the operator migration, because both touch
   prompt text and one pass through the `INDEPENDENT` route regexes is better than two.
4. **MATH-01 completion** — split the presentation index into the nine separately named indexes.
5. **PILOT-01** — gold cohort selection, which cannot start before QA-01's rubric exists.

Do **not** start broad curriculum editing. The 200 waived CML warnings, the 243 small pools and the
572 MCQ rows all look like content work and all of them are downstream of a decision that has not
been made yet.
