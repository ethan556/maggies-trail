# WAVE 01 — ADVERSARIAL QA

## Verdict

**TRUTH-LAYER ACCEPT. FULL RELEASE CERTIFICATION NOT YET AVAILABLE.**

The implemented Wave 01 repairs survive dependency-free falsification. The current checkout cannot run
the full TypeScript/Vitest/build/Playwright chain because its dependency tree cannot be reconstructed in
this environment. That limitation is an OPEN release gate, not a waived test.

## 1. Corpus truth — independently falsified

Fresh direct walk and verifier agree on **129 courses · 1,701 lessons · 15,621 steps** and corpus
SHA-256 `b6461fe5b12d211f98ac3f65fe9aa14fa2e36288aa93a4bbfda7b3476525cf19` across **1,830 authored files**.

Recursive diff of `content/courses/**` vs the S218 seal: **0 differences**.

### Mutation test

Target: `content/courses/expressions-equations/lessons/ee-05-02.json`.

- original SHA-256: `69dafdb236cc0e3d50580c5ecf1f63b689b341f78007358b7022f948acf2c032`;
- a trailing byte mutation changed the live corpus hash;
- `node scripts/gen-product-state.mjs` exited **1** with `STALE curriculum manifest ... refusing to
  generate product state`;
- the lesson was restored to the exact original SHA-256;
- `PRODUCT_STATE_VERIFIED.json` remained byte-identical before/after the rejected mutation;
- corpus verifier returned green after restore.

Evidence: `reports/wave01/CORPUS_MUTATION_EVIDENCE.md`.

This specifically falsifies the old failure mode: a lesson body can no longer change while a stale
manifest/product state silently remains “current.”

## 2. Generated-state freshness

After regeneration/review, the available dependency-free freshness subset passed:

`VERIFY_GROUP_START=0 VERIFY_GROUP_END=3 node scripts/session/verify-generated.mjs`

Result: **5 artifacts byte-stable after regeneration**; flagship tiers A1186/B457/C57/D1;
playbook 16 enhancements / 0 unbuilt / 0 built-but-unused; `FLAGSHIP.md` 1,701 lessons / 1,341 flagship / 143 rich-engine-without-prediction; product state 129/1701/15621/127.

`node scripts/session/verify-corpus-state.mjs` also passed independently.

The first freshness attempt before regeneration was RED because current-looking artifacts were stale.
That red is retained as evidence that the gate has teeth; it was not weakened.

## 3. Source syntax and static contract QA

With no project dependencies available, the globally installed TypeScript parser was used only as a
**syntax/JSX parser**, not misrepresented as a semantic typecheck. Results:

- `OnboardingFlow.tsx`: 0 syntax diagnostics;
- `OnboardingFlow.name.test.tsx`: 0;
- `PlacementFlow.tsx`: 0;
- `placement/page.tsx`: 0;
- homepage `page.tsx`: 0.

`node --check` passed for the new/changed dependency-free `.mjs` integrity scripts and
`python -m py_compile` passed for the priority scanner.

`scripts/audit/closure-wave1-s219.mjs` passes and asserts:

- manifest/product-state corpus hashes agree;
- stale `reports/session-test-result.json` is absent;
- certified runtime remains explicitly S218;
- production onboarding exposes the 12-item diagnostic and no legacy `q`/`comfort` path;
- placement can persist an onboarding-launched recommendation;
- homepage contains no testimonial fixture/demo testimonial copy;
- demo billing markers remain visible, preventing a cosmetic change from falsely “closing” billing.


## 3A. Native source-release gate — red first, then green

`npm run validate:native` was run before seal and initially failed on three issues:

1. Wave-1 mutation evidence was stored as a `.log`, forbidden in source releases;
2. S218 carried `tsconfig.tsbuildinfo`, a generated compiler artifact;
3. pre-existing `scripts/session/apply-manipulable-repair.mjs` embedded a root-relative probe import that the static resolver correctly could not resolve relative to the utility file.

Repairs: mutation evidence moved to source-safe Markdown; `tsconfig.tsbuildinfo` removed; the generated probe import is now interpolated so its root-relative path is not misrepresented as the utility's own local import.

Final native gate: **PASS — 2,491 JSON files · 1,187 source files · 1,680 local imports · 47 internal links · 2 assets · 268 buttons · 28 API routes.**

The gate was not weakened.

## 4. Placement adversarial questions

**Could Grade 3 still take the old quiz?** Production `OnboardingFlow` no longer contains the legacy
question stages or Grade-3 branch. Legacy helpers remain only as compatibility/test code.

**Could a learner complete placement and be sent back into onboarding?** Placement now records the
recommended lesson/course into onboarding state when the diagnostic was launched with an onboarding
`goal`; the dashboard therefore sees onboarding completion.

**Could the diagnostic be forced?** No. “Start at my grade level” remains an explicit bypass.

**Did this make psychometric claims stronger?** No. Placement architecture is unified, but empirical
calibration remains provisional and is still a Wave 8 evidence requirement.

## 5. Social-proof adversarial question

The production homepage no longer contains the fictional testimonial data or “demo testimonials”
section. It now exposes verifiable catalogue/product evidence. This does not manufacture outcome,
efficacy, user-count, or satisfaction claims.

## 6. Security/dependency adversarial ruling

Exact lock versions were inspected directly. Current public advisories checked during this Wave place
Next 15.5.23 beyond the July 2026 15.5.21 fix and React 19.2.7 beyond the 19.2.4 follow-up fixes.
However transitive `sharp@0.34.5` remains inside a high-severity `<0.35.0` advisory. The repository's
existing mitigation disables Next's image optimizer, but this Wave cannot freshly rebuild and probe the
endpoint because dependencies are unavailable.

Attempts to reconstruct the dependency tree failed at the configured package registry; `npm audit`
was likewise unavailable. A workspace search found no matching `node_modules` tree. Current Node
22.16.0 also misses `@sparticuz/chromium@149.0.0`'s declared minimum 22.17.0.

Ruling: **no blind dependency upgrade; no false clean bill of health.** Keep current full audit,
sharp mitigation reachability, build, browser, and full test chain OPEN.

## 7. Self-correction required by QA culture

The first audit pass accidentally used `repr` as the seventh capability axis rather than `polish`.
That understated A/B coverage. It was re-derived from the repository formula before prioritization.
Correct authoritative values:

- engines: **A65 / B45 / C12 / D5**;
- authored instances: **A1800 / B855 / C1164 / D6417**;
- zero-A/B rates: **3.9% K–2 / 17.9% G3–5 / 24.1% G6–8 / 20.4% HS**.

The incorrect preliminary census is not used in any closure artifact.

## 8. What is NOT proven in this Wave

- semantic TypeScript typecheck on current S219 tree;
- current Vitest execution;
- current `validate:content` / `lint:pedagogy` execution if they require project dependencies;
- current Next production build;
- current Playwright/browser/accessibility matrix;
- current 390/768/1440 visual screenshots;
- current real-device/touch behavior;
- current complete npm advisory tree;
- current performance/INP/drag-frame measurements.

The last certified values for those areas remain S218 evidence, explicitly labelled historical.

## 9. QA conclusion

No mathematical regression is possible from authored lesson bytes because none changed. The Wave's
main new invariant — exact corpus hash before product-state generation — was mutation-proven. Entry
flow and launch credibility repairs pass source-level assertions. **Wave 01 truth integrity is accepted;
public premium release remains blocked by the open runtime/security/commercial gates in the ledger.**
