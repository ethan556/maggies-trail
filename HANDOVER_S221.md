# HANDOVER → Session 221 / Closure Wave 02 EXECUTION

Start from the S220 Wave-02 preflight seal. Do not start from an older session or regenerate frozen S151
hash baselines.

## What S220 proved

### Mathematics/corpus preserved

- `content/courses/**` is byte-identical to S219.
- 129 courses · 1,701 lessons · 15,621 steps.
- exact corpus SHA-256:
  `b6461fe5b12d211f98ac3f65fe9aa14fa2e36288aa93a4bbfda7b3476525cf19`.
- zero learner-facing visual or lesson-content changes in S220 preflight.

### Generated-evidence chain repaired

- all **81** generated-freshness groups pass byte-stable after reviewed regeneration;
- post-S151 cumulative authorization is **815 exact current lesson hashes**, not a path-only allow-list;
- frozen `SESSION151_LESSON_HASHES.json` is verified, never regenerated, at SHA-256
  `3ff6e1891c158e5e55c9124b48b6043e44a9d57f376bcd553e86bb3ed0a47a01`;
- S151 integration 95/95;
- S151 engine sweep 33,408/33,408;
- S151 mutations 155/155 rejected, 29/29 controls;
- S151 failure-first 44/44;
- three new contract mutations (authorized lesson, frozen ledger, visual viewport) all turn the intended
  gate red and restore byte-exact.

### Wave-02 visual matrix ready but not executed

`npm run verify:closure-visual` is the deterministic runner. Its contract requires:

- 15 surfaces;
- 390×844, 768×1024, 1440×900;
- light + dark;
- 90 captures total;
- reduced-motion settled screenshot baseline;
- lesson start + completion state;
- horizontal-overflow, small-target and desktop keyboard-focus telemetry;
- manual real 200% zoom, screen-reader spatial parity, real-device touch and normal-motion review.

Do **not** report the 90 captures as passed until `WAVE02_SCREENSHOTS/manifest.json` exists from the current
seal and every defect has been adjudicated.

## Mandatory first action in S221

Recover the runtime, then execute rather than plan:

1. Node ≥22.17 or supported 24.x (`@sparticuz/chromium@149.0.0` declares
   `^22.17.0 || >=24.0.0`).
2. Restore the exact lockfile dependency tree.
   - Current environment evidence: exact `npm ci` exits 1 because the configured mirror returns 404 for
     `zustand@5.0.14`.
   - Do not remove core dependencies merely to satisfy an incomplete mirror.
3. Run current-source semantic typecheck, full Vitest/content/pedagogy/registration/build/Playwright chain.
4. Complete installed-tree dependency/security audit and re-prove/remove the Sharp optimizer path.
5. Run `npm run verify:closure-visual` against the current production/current-source server.
6. Review all 90 current screenshots and manifest telemetry. Rank defects by learner harm × frequency ×
   visibility × strategic importance.
7. Implement only evidence-led shell fixes, re-run the complete matrix, then perform 200% zoom/device/SR/
   normal-motion gates.

## STOP rules carried forward

- Do not borrow S218 runtime greens as current S221 evidence.
- Do not alter `SESSION151_LESSON_HASHES.json`; it is immutable historical evidence.
- Do not run `lesson-hashes-s151.py` as current freshness generation.
- Do not call historical screenshots current visual proof.
- Do not make visual changes solely because source classes “look old.” Render first.
- Do not touch lesson mathematics during Wave 02 unless an actual visual defect requires a narrowly scoped,
  independently verified representation repair.

## Highest-leverage next decision after the matrix

If the shell has material current defects, repair Wave 02 until the blind 390/768/1440 review is premium.
If the shell is already strong and only small P1s remain, close Wave 02 and proceed to Wave 3 using
`PREMIUM_INTERACTION_PRIORITY.csv`, with the dCL collision/design items and ranked concept-acquisition gaps
still governed by the closure STOP rules.

## Seal provenance

The S220 handoff seal is the **post-portability-repair** archive. A clean extraction under the S220 folder
name passed the core dependency-free gates and all 81 generated-freshness groups. The earlier candidate
archive that changed `EXCELLENCE_BACKLOG_S126.json` when renamed was rejected and discarded.
