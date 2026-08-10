# Session 151 Gate Evidence

| Gate | Result | Evidence |
|---|---:|---|
| Sealed S150 branch and 146-lesson inventory | PASS | `SESSION151_HS_TIER_REVIEW.json` |
| Exact-fit rerank | PASS | 29 lessons, existing engines only |
| Authored anchor preservation | PASS | 29/29 |
| Exact content boundary | PASS | 29 files, 29 widgets, 0 variants, 1,100 unchanged |
| Integration | PASS | 95/95 |
| Seeded engine sweep | PASS | 33408/33408 |
| Adversarial mutations | PASS | 155/155; controls 29/29 |
| Failure-first audit | PASS | 44/44 |
| Source transpilation | PASS | 29/29 |
| Content JSON | PASS | 1129/1129 |
| Lesson hashes | PASS | 1,129/1,129 |
| Registration | PASS | 124/124 |
| Player harness | PASS | 36/36 |
| Historical seeded replay | PASS | 200448/200448 |
| Historical mutation replay | PASS | 379/379 |
| Generated freshness | PASS | 146/146 |
| CML integration | PASS | 1,129 lesson JSON files |
| CML lint | ADVISORY | inherited 2 errors / 275 warnings; no new error |
| Exact-lock install | FAIL/BLOCKED | registry 404 for `zustand@5.0.14`; lock unchanged |
| Typecheck / Vitest / build / Playwright | NOT CLAIMED | usable dependency tree unavailable |
| Clean archive rehearsal | PASS | manifest 3,034/3,034; all three freshness batches, CML integration, and Session 151 gates replayed |
| Definitive archive replay | PASS | all Session 151 gates, three freshness batches, CML integration, and manifest 3,034/3,034 |
