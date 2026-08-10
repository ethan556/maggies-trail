# WAVE 02 EXECUTION REPORT — PREFLIGHT COMPLETE, VISUAL CERTIFICATION STILL OPEN

## CHANGED

1. Added a deterministic premium-shell certification matrix: **15 surfaces × 3 viewports × 2 themes =
   90 required captures**.
2. Forced reduced-motion + settled final state for screenshot baselines, separating visual-layout review
   from normal-motion semantic review.
3. Added automated capture telemetry for HTTP status, horizontal overflow, visible controls, sub-24px
   targets and desktop keyboard focus; retained 200% real-browser zoom and real-device touch as explicit
   manual gates.
4. Repaired the full generated-evidence chain so historical proofs can safely exercise the current
   1,701-lesson corpus without path-only authorization drift.
5. Added exact current-byte verification for all **815** post-S151 authorized lesson files.
6. Replaced destructive regeneration of the frozen S151 1,129-lesson hash baseline with checksum-pinned
   verification.
7. Hardened historical lesson-hash writers to validate historical count before writing.
8. Reworked the S151 evaluator loader to load the real current local TypeScript dependency graph instead
   of a frozen dependency shim.
9. Repaired refusal-only Python authorization generation (`set()` rather than `{}`).
10. Updated S151 failure-first logic to preserve the original 29-widget boundary while separately
    recognizing exact-hash later authorized lesson changes.
11. Made the S126 excellence backlog generator extraction-path portable after the first candidate S220
    tarball proved that serializing the repository folder name broke fresh-extraction determinism.

## REFUSED

### Dependency-removal workaround

Removing the single direct Zustand dependency was tested as a possible way to unblock the exact runtime.
It immediately exposed another missing mirror package (`zod`). Because this did not restore the runtime and
would have changed core player-store infrastructure, the experiment was rejected and restored from the
S219 seal.

### Visual/source polish without current renders

No CSS/component visual changes were made. Historical screenshots and source inspection are insufficient
for the Wave-02 blind screenshot exit gate. The product shell is therefore **not declared premium-certified
in S220**.

### Borrowing S218 runtime greens

The historical S218 full-suite/build/browser counts remain historical. They are not reported as S220
execution evidence.

## MATHEMATICAL DELTA

**None.** `content/courses/**` is byte-identical to the S219 seal and retains corpus SHA-256
`b6461fe5b12d211f98ac3f65fe9aa14fa2e36288aa93a4bbfda7b3476525cf19`.

The repaired historical sweeps re-confirm many exact mathematical generators, including S151
**33,408/33,408** with **155/155 adversarial mutations rejected**, but these are audit-harness results and
are not presented as new lesson mathematics.

## PEDAGOGICAL DELTA

No learner-facing instructional sequence changed. The gain is verification discipline: future shell polish
will be judged against deterministic current renders rather than animation-timing artifacts, stale audit
files, or historical screenshots.

## VISUAL DELTA

**No product visual delta.** New visual work is test infrastructure only.

The certification contract now requires home → onboarding → placement → dashboard → catalog/course →
Trailhead/Atlas → lesson start/completion → profile/family/teach → premium/account at 390, 768 and 1440 in
both themes. Execution remains blocked by the unavailable current dependency/browser environment.

## QA

Current dependency-free evidence:

- native integrity: **PASS — 2,492 JSON / 1,190 source / 1,686 imports / 47 links / 2 assets / 268 buttons /
  28 API routes**;
- authored corpus: **129 / 1,701 / 15,621**, exact SHA `b6461fe5...52c5cf19`;
- authored `content/courses/**` diff vs S219: **0 differences**;
- post-S151 cumulative exact authorization: **815/815**;
- frozen S151 ledger: **1,129 entries**, exact sealed SHA
  `3ff6e1891c158e5e55c9124b48b6043e44a9d57f376bcd553e86bb3ed0a47a01`;
- S151 integration: **95/95**;
- S151 engine sweep: **33,408/33,408**;
- S151 mutations: **155/155 rejected; 29/29 controls accepted**;
- S151 failure-first: **44/44**;
- generated freshness: **all 81 groups byte-stable after reviewed first-run refreshes**;
- visual certification contract: **15 × 3 × 2 = 90 captures required — PASS**;
- three adversarial contract mutations: **all red as intended**, all restores byte-exact.
- first candidate tarball fresh extraction: **rejected** on path-dependent generated output; generator repaired to use repository-relative `.`; candidate seal discarded.

Current runtime blocker re-confirmed:

- Node **22.16.0** below Chromium 149's declared ≥22.17 floor;
- exact `npm ci` exits **1** on internal mirror HTTP 404 for `zustand@5.0.14`.

Consequently semantic typecheck, full Vitest, build, Playwright, installed-tree dependency audit and actual
90-screen capture remain **OPEN**.

## REGRESSIONS

No authored-content regression. No intentional learner-facing source change.

The audit repair regenerated numerous historical/current report artifacts whose previous source hashes,
TypeScript-version metadata or current-corpus summaries were stale. Each regenerated group was required to
be byte-stable on its second run.

## OPEN

1. Restore Node ≥22.17 or supported 24 and exact dependencies.
2. Run current-tree typecheck, full Vitest/content/pedagogy/registration/build/Playwright chain.
3. Run authoritative dependency audit and close/re-prove the Sharp mitigation.
4. Execute the 90-capture visual matrix and review every failure/defect at 390/768/1440, light/dark.
5. Perform real 200% zoom, screen-reader spatial-state, real-device touch and normal-motion semantic review.
6. Only then implement evidence-led Wave-02 shell polish and repeat the matrix.

## NEXT

**S221 starts with the runtime/dependency gate again.** If dependencies are restored, no further preflight
work is required: execute the current source seal, run `npm run verify:closure-visual`, inspect the generated
90-capture manifest/screenshots, rank visual defects by learner harm × frequency × visibility × strategic
importance, and repair the highest-leverage shell problems.

## LEARNER-VALUE DELTA

### BEFORE

Wave-02 visual review lacked one deterministic current-shell matrix, and the broad generated-evidence chain
contained stale historical assumptions capable of rejecting legitimate current content—or, in one case,
overwriting a frozen baseline before failing.

### AFTER

There is one explicit 90-capture certification contract and a generated-evidence chain that distinguishes
frozen history from exact-hash later authorization. The next visual change can be evaluated against current,
settled, reproducible evidence without weakening historical proof.

### CAUSAL MECHANISM

This is a release/QA batch rather than a learner interaction. Its causal mechanism is engineering:
a content-byte drift, frozen-ledger drift, required-viewport omission, unauthorized historical change, or
stale generated artifact causes a red gate instead of silently reaching the release package.

### MISCONCEPTION

No student misconception behavior changed. The engineering misconception removed is that a historical
proof can safely be “regenerated” against a modern corpus or that a path already authorized in the past may
change again without re-certification.

### TRANSFER

The stronger proof architecture applies across later Wave-02 visual work and future Waves 3–9: later
changes remain acceptable only when explicitly authorized and current bytes/evidence match what the release
claims.

## SEAL / FRESH-EXTRACTION REPROVE

The repaired candidate archive was extracted into a clean `maggies-trail-session-220` directory. From that
artifact, native integrity, corpus identity, exact post-S151 authorization, frozen S151 ledger integrity,
visual-matrix contract, S219 source/content equality, and **all 81 generated-freshness groups** passed.
The earlier candidate archive that exposed `repositoryRoot` path dependence was discarded and is not a
release artifact.
