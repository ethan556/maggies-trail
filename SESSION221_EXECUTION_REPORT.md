# SESSION 221 — WAVE 02 EXECUTION REPORT

## Outcome

**Wave 02 remains OPEN. No learner-facing or mathematical source was changed.** S221 executed the mandatory runtime-recovery step and exhausted every non-invasive execution path available in this environment. The blocker is external infrastructure, not a demonstrated Maggie regression.

## Runtime recovery attempts

1. **Local supported Node runtime**
   - Installed runtime: Node `v22.16.0`.
   - Required by locked `@sparticuz/chromium@149.0.0`: Node `^22.17.0 || >=24.0.0`.
   - Isolated Node 22.17.0 download from nodejs.org was unavailable from this container.

2. **Exact dependency restore**
   - No `node_modules` exists in the S220 seal.
   - The configured package mirror now returns HTTP 404 for at least:
     - `zustand@5.0.14`
     - `zod@3.25.76`
     - `next@15.5.23`
     - `react@19.2.7`
   - This is broader than S220's initial Zustand-only failure; replacing/removing individual dependencies would not restore the exact tree and is prohibited by the closure STOP rules.

3. **Connected Vercel remote build**
   - Connected team resolved successfully.
   - Vercel project list: **0 projects**.
   - No Maggie project exists to reuse safely for remote build/deployment.

4. **Connected GitHub CI**
   - GitHub repository list: **0 repositories**.
   - No linked repository exists to execute GitHub Actions or recover a CI artifact.

5. **Vercel Sandbox**
   - `@vercel/sandbox` is not installed locally.
   - Bootstrapping it requires the same unavailable package-registry path and project credentials.

## What did execute on the exact S220 tree

- `validate:native`: **PASS** — 2,492 JSON files, 1,190 source files, 1,686 local imports, 47 internal links, 2 assets, 268 buttons, 28 API routes.
- `verify:corpus-state`: **PASS** — 129 courses, 1,701 lessons, 15,621 steps, corpus SHA-256 `b6461fe5b12d211f98ac3f65fe9aa14fa2e36288aa93a4bbfda7b3476525cf19`.
- Visual certification contract: **PASS** — 15 surfaces × 3 viewports × 2 themes = 90 required captures; 4 manual gates remain explicit.
- Post-S151 exact authorization: **PASS** — 815 lesson files match sealed hashes.
- Frozen S151 ledger: **PASS** — 1,129 entries, SHA-256 `3ff6e1891c158e5e55c9124b48b6043e44a9d57f376bcd553e86bb3ed0a47a01`.

## Operator corrections

Two S221 execution mistakes were caught and **not converted into source changes**:

1. I initially treated the visual runner as if it supported `--contract-only`; it does not. The repository has a separate dependency-free `closure-visual-contract-s220.mjs`. The correct script passes. No harness change was made.
2. I initially guessed verifier filenames for the post-S151/frozen-ledger checks. Those names did not exist. The actual scripts (`verified-post-s151-changes.mjs` and `verify-frozen-s151-ledger.mjs`) were then run and passed. No source was changed.

## CHANGED

- Session documentation and closure-ledger evidence only.
- No `src/**`, `content/courses/**`, package dependency, engine, evaluator, or lesson changes.

## REFUSED

- Removing or replacing dependencies to work around an incomplete mirror.
- Making premium visual-shell changes without current rendered evidence.
- Calling historical S218 runtime results current S221 certification.
- Creating/deploying an unidentified Vercel project.

## MATHEMATICAL DELTA

None.

## PEDAGOGICAL DELTA

None.

## VISUAL DELTA

None. The 90-capture matrix remains unexecuted because a current production/current-source server cannot be built in this environment.

## QA

Dependency-free integrity gates are green. Full semantic/type/Vitest/build/Playwright/security/browser certification remains OPEN.

## REGRESSIONS

None demonstrated. Authored corpus and learner/runtime source remain untouched.

## OPEN

- CL-P0-004 current-source full verification.
- CL-P1-006 supported runtime.
- CL-P0-005 installed-tree security/Sharp reachability proof.
- CL-P1-028 actual 90-capture visual execution.

## NEXT

Do not create another preflight layer. Supply or connect one of the following and immediately execute the existing chain:

1. Node >=22.17/24 plus the exact lockfile dependency tree; or
2. a GitHub repository/CI environment containing this exact seal; or
3. a Vercel project capable of building this exact seal.

Then: typecheck -> full Vitest/content/pedagogy/registration -> build -> Playwright -> security audit -> 90 captures -> evidence-led shell repair.
