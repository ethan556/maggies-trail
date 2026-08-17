# V4 Phase 0-6 local evidence and release matrix

Date: 2026-08-17  
Scope: local evidence only; no push, deployment, public-asset enablement, or release-state mutation.

## Verdict

**PARTIAL — not releasable.** Local identity and cross-band source contracts are now executable,
but the tree is not frozen, deployment parity is absent, the curriculum queues remain open, and
the local development server did not resolve representative lesson routes during the bounded
browser run.

## Candidate identity observed

`node scripts/release/v4-candidate-identity.mjs` at 2026-08-17T21:01:31Z reported:

- candidate key: `66ac01f9414d-7283f8bd122f21a8-dirty`
- HEAD: `66ac01f9414da80906ea5f7182eec326261c551f`
- runtime fingerprint: `7283f8bd122f21a84f4a2cc6f9ae446e014c1438eb91b5e99c49927c0d62dcb4`
- content fingerprint: `28f14f03554f402fd76b149aa4d10471a9d120eec76122a87476fa20d78102be`
- inventory: 129 courses / 1,701 lessons
- dirty entries: 547
- local candidate identity: **PASS**
- candidate freeze: **BLOCKED**
- deployment parity: **BLOCKED** (`VERCEL_GIT_COMMIT_SHA` and `VERCEL_URL` absent)

The script calculates the identity from current tracked and non-ignored source bytes. The values
above are an observation, not a frozen release identity; rerun it after concurrent work settles.
`--assert-frozen` is the release fail-closed mode.

## Seven-phase matrix

| Phase | Status | Exact evidence | Release blocker |
|---|---|---|---|
| 0. Evidence, precache, deployment parity | **PARTIAL** | Content/runtime/evidence fingerprints and fail-closed freeze/deployment gates now exist. | Dirty tree; no immutable commit, deployed URL/commit, content seal comparison, or build-bound browser record. The old cache is not a current content-addressed V4 cache. |
| 1. Curriculum contracts and complete disposition | **BLOCKED** | Current S244 status records the contracts and queue taxonomy. | 1,701 complete-lesson, 1,701 visual-first, and 1,701 grade-language dispositions remain unapproved; standards have zero approvals. |
| 2. Semantic correctness | **PARTIAL** | Reported high-risk fraction feedback and several answer-signalling canaries are corrected with focused guards. | Complete evaluator/target/representation/accessible-text/feedback family review remains open. |
| 3. Visual-first and question-diversity canaries | **PARTIAL** | Causal and flagship canaries plus current source-level checks exist. | Withheld figures, visual-promise questions, repeated challenge forms, independent canary approval, and deployed visual evidence remain open. |
| 4. Mathematical presentation and bounded queues | **PARTIAL** | Prediction-source work and several shared presentation causes are closed. | 14,732 queue rows remain: 6,119 standards, 1,701 each visual/language/complete disposition, 1,078 illustrations, 950 presentation, 773 progression/duplication, 637 choices, and 72 other rows. |
| 5. Generator and family assurance | **PARTIAL** | Existing property/integrity suites cover many engines; focused S244 gates pass. | 256 under-parameterised forms and broader unseen-seed, collision, boundary, retry-state, and qualitative review remain. |
| 6. Cross-band journeys, standards closure, release | **PARTIAL** | A frozen seven-band manifest and 8 static journey checks now verify exact lesson/step/widget identity, schema/pedagogy integrity, prediction presence, and manipulation/accessibility/mobile capability. | Browser execution is not sealed; no exact deployed candidate; no real screen-reader, 200% zoom, or actual touch-gesture evidence; standards claims and lesson closure are unapproved. |

## New executable evidence

- `reports/release/V4_CROSS_BAND_JOURNEYS.json` selects early, elementary, middle,
  secondary algebra, secondary geometry, statistics, and calculus hosts.
- `src/lib/session244.crossBandReleaseJourneys.test.ts` fails on a moved/missing host, wrong
  widget, malformed lesson, pedagogy/integrity error, missing prediction contract, or engine below
  level 2 for manipulation, accessibility, or mobile support.
- `src/lib/session244.candidateIdentity.test.ts` locks the identity report schema and the exact
  129-course / 1,701-lesson inventory.
- `e2e/v4-cross-band-journeys.spec.ts` is prepared to verify exact resume, prediction commitment,
  rendered stage, keyboard focus, reduced motion, 320px overflow, Axe, and runtime errors. It runs
  serially to prevent seven cold development compilations from contending.

## Checks run

| Check | Result |
|---|---|
| Focused Vitest identity + journey contracts | **PASS — 2 files, 9 tests** |
| TypeScript (`tsc --noEmit`) | **PASS** |
| Candidate identity generation | **PASS locally; freeze/deploy BLOCKED as designed** |
| Playwright, first attempt | **INVALID harness attempt** — corrected wrong route/storage contract. |
| Playwright, corrected parallel attempt | **BLOCKED** — all seven routes stayed on `Loading lesson` until the 30-second development cold-start limit. |
| Playwright, corrected serial bounded attempt | **BLOCKED** — the first route remained on `Loading lesson` beyond one minute; the run was stopped rather than recording false browser success. |

## Exact remaining release gates

1. Reconcile and commit the shared tree, then require `v4-candidate-identity.mjs --assert-frozen`.
2. Build once and run the cross-band suite against that immutable production build or exact
   deployment via `PW_BASE_URL`; record the candidate key, URL, browser, viewport, and artifact
   hashes together.
3. Extend each representative journey from host rendering to one wrong/retry/correct transition,
   including prompt/diagram/evaluator/feedback/accessibility semantic agreement and 44px targets.
4. Run real touch interaction, 200% browser zoom, and manual screen-reader journeys (minimum:
   early-years visual/tap, spatial model, and calculus symbolic/graph state).
5. Fix the global keyboard prerequisites already identified in `SiteNav` (sheet initial focus,
   containment, return focus) and add a skip link before claiming whole-app keyboard closure.
6. Join each journey to an approved exact-source standards dossier; zero standards approvals means
   journey success cannot close Common Core claims.
7. Reconcile all 1,701 lesson dispositions and all closure rows against the deployed candidate;
   only then may Phase 6 and release be marked PASS.
