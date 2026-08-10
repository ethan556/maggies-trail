# Regression Audit — Session 101 (2026-07-24)

This document is the evidence trail for the claim that Session 101 improved the
tree without changing any authored learning content and without weakening any
gate. Read it next to `SESSION101_RELEASE_GATE_SUMMARY.json` (machine-readable
gate matrix) and `SESSION101_SEMANTIC_DIFF.json` (per-file why).

## 1. The frozen-content proof

The invariant was not "we were careful"; it is cryptographic:

```
sha256 tree-hash, content/courses/**  vs  the pristine Session-100 archive
  baseline files: 1,213     working files: 1,213
  changed: 0    added: 0    removed: 0     →  ZERO-DRIFT
```

Every prompt, hint, answer, misconception, explanation variant, conceptTag,
XP rule and remedial mapping a learner can reach is byte-identical to the
uploaded baseline. All improvement this session lives in code, tests,
generators, and documentation.

## 2. Where the 295 failures came from, and where they went

Session 101 opened with 295 failing tests across the restored dependency
environment (Sessions 99–100 could not install dependencies, so tsx-backed
suites and gates had not actually executed since Session 98). Final state:
**111/111 files, 8,131/8,131 tests, green — run twice**, before and after the
LessonPlayer decomposition.

The failures decomposed into eight mechanisms, none of them "the tests were
wrong about the product" in more than a handful of cases:

| # | Mechanism | Scale | Resolution |
| --- | --- | --- | --- |
| 1 | Strict-TS drift exposed by the first real `tsc` since 98 | 25 errors | Fixed in app/lib code (`courses/[slug]`, `standards`, `stageWidth`, `cml/mesh`, `processEvents`, `strategyClassifiers`, `db.s43.test`); zero behavior change |
| 2 | `.cjs` independent solvers invisible to the typechecker | 8 modules | Added `.d.cts` declaration files; solvers untouched |
| 3 | Generator prose defects (agreement, pluralization, ellipsis, float noise, currency) | 71 prose-gate failures | Fixed **at the source** in variants/templates (`g0/g1/g2/g4/g8`, algebra 1–2, geometry, precalc, calculus); the prose gate itself was *hardened*, not relaxed |
| 4 | Independent-solver routes out of lockstep with corrected prose | ~40 | Route regexes updated in the `.cjs` solvers and prompt-keyed answer JSONs, verified by 150-seed harnesses per family |
| 5 | Freshness floors (≥6 distinct in 12; per-form; per-item >3) | ~30 | Variant pools *widened* (more distinct states), never narrowed |
| 6 | Structured-widget contract gaps (`||` + JSON part, `;;` option splits, matchPairs derangement, dragOrder 4th entries) | ~20 | Generator output extended to satisfy the stricter contract |
| 7 | Registry/registration drift | 1 loop | `check-registration` restored to green; registry count verified from code |
| 8 | Widget keyboard/label gaps surfaced by new parity tests | 14 added tests | Fixed in `widgets.tsx`; the new tests stay as a permanent gate |

## 3. Sanctioned test corrections (the complete list)

Gate policy is *stricter-or-equal*. Five test-side edits were made; each is a
correction of a demonstrably wrong expectation, each is documented in-code at
the edit site, and none loosens what a learner-visible behavior must satisfy:

1. **Direction-aware `numberLineHop`** (`variants.test.ts`) — the old
   expectation asserted rightward hops for a subtraction family whose authored
   semantics hop left; the widget was right, the test was wrong.
2. **Implicit-coefficient `f‴` route** (`variants.test.ts`) — third-derivative
   prompts print `t³` with an implicit 1-coefficient; the route regex now
   accepts `(\d*)` where the test previously demanded `(\d+)`.
3. **Prose `\bnull\b` narrowing** (`variants.prose.test.ts`) — the bare-word
   arm now skips legitimate statistics vocabulary ("null hypothesis") while
   still failing on leaked JSON `null`. The gate covers *more* real defects
   than before because the false positive previously forced an exclusion list.
4. **`mixedTruth` complete-flag** (`variants.test.ts`) — the completeness
   assertion keyed on a field the generator has never emitted; re-keyed to the
   real flag.
5. **Freshness-floor arithmetic** (`variants.resolver.test.ts`) — two floors
   double-counted seed collisions; corrected to the documented ≥6-in-12 rule.

## 4. Gates that remain red, on purpose

- `npm run lint:pedagogy` — **1138/1139**. The failure is a genuine defect in
  frozen content: `dop-02-02` step `k3` declares `predict` on
  `"kind": "check"` (598 of 599 predict steps in the corpus are
  `interactive`, and k3's widget is a real manipulative). The fix is one word
  in one JSON file and is logged for a content session in `VARIANT_LOG.md`.
  Weakening the rule to make the gate green would have hidden a real bug.
- `npm run validate:native` — exit 1 with exactly one flag: `node_modules/`
  exists. The gate audits a *shipped archive*; a working checkout after the
  mandated `npm ci` definitionally trips it. Every true violation it found
  this session (scratch probe scripts with host-absolute paths, a stray
  `tsconfig.tsbuildinfo`, an e2e-created `data/` SQLite) was deleted.

## 5. Dependency posture

- `npm audit`: 3 high → **2 high**. `brace-expansion` remediated in-lock.
  The remaining two are `next` itself (every 15.x release is flagged; the
  upstream fix ships in 16.3, and the Next-15 major is a session invariant)
  and the `sharp` build it bundles. Clearing them is a Next-16 migration
  session, not a patch.
- `next` moved 15.5.20 → **15.5.21** (patch, inside the frozen major) as part
  of the audit fix; the full matrix (typecheck, 8,131 tests, build, e2e) was
  re-run green after the reinstall.
- One dev-only dependency was added: `@sparticuz/chromium`, because
  `cdn.playwright.dev` is outside this environment's egress allowlist. It is
  wired through an env-gated `PW_CHROMIUM_EXE` override in
  `playwright.config.ts`; with the variable unset, Playwright behaves exactly
  as stock.

## 6. The decomposition, verified

`LessonPlayer.tsx` (1,458 lines) was split into:

- `playerStore.ts` (406) — the `work → retry → correct → revealed → done`
  machine, grading, XP, adaptive ladder, persistence/resume. Extracted
  **verbatim**; 12 focused imports; no DOM.
- `playerChrome.tsx` (248) — Narration, Rich, TrailDots, GoalRing,
  TrailAtmosphere, TrailWaypoint, TrailClearingLabel, SummitRoute. Pure
  rendering.
- `LessonPlayer.tsx` (818) — orchestrator; public API (`NextLesson`,
  `LessonTrailContext`, default export) unchanged.

Proof of behavior-neutrality: the identical 8,131-test suite (including every
`LessonPlayer.*` playthrough family and the s41/s45 ladder/strategy suites)
and the 3/3 production-build Playwright run are green on both sides of the
split.

## 7. What this audit does not claim

- No measured learner outcomes. "The gates are green" is an engineering
  conclusion, not an efficacy study.
- The e2e run used a registry-installed Chromium 149, not the Playwright-blessed
  build (same milestone, CDP-compatible; documented in the gate summary).
- No real-device screen-reader or touch sweep occurred in this container; the
  accessibility evidence is source-level plus the jsdom suites.
