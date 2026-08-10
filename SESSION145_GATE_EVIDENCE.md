# Session 145 gate evidence

## Executed and passed

| Gate | Evidence |
|---|---|
| Starting archive SHA-256 | `20db0eddd5c87e8185a9d9aa9b2b0ca5d47cb53094e21ca65bc71a0dd4523713` |
| No-presumption queue recomputation | 34 initial rows; all classified before mutation |
| Exact-fit authored audit | 50/50 experiences; 43 main + 7 remedial |
| Place-value generator sweep | 27,648/27,648; 24 forms × 3 bands × 384 seeds |
| Place-value adversarial mutations | 35/35 rejected; 3/3 controls accepted |
| Signed-fraction regenerated sweep | 4,608/4,608 |
| Shape-hierarchy regenerated sweep | 11,520/11,520 |
| Conditional-table regenerated sweep | 9,216/9,216 |
| Graph-story regenerated sweep | 9,216/9,216 |
| Proportional-reasoning regenerated sweep | 23,040/23,040 |
| Dependency-free source transpilation | 19/19 files, TypeScript 5.8.3 |
| Authored JSON parsing | 1,129/1,129; unique IDs 1,129 |
| Lesson hash snapshot/proof | 1,129/1,129 |
| Content-change proof | 7 files, 50 nodes, zero variant drift, 1,122 non-target files byte-identical |
| Registration consistency | files/course/plan consistent |
| Engine registration contract | 119/119 |
| Player harness contract | 36/36 checks; 71 projected browser executions |
| CML integration | 18 flagship pilots, 86 direct profiles, 1,129 lessons |
| Native integrity | passed |
| Native clean-copy | passed |
| Historical report chain | passed through Session 145 |

## Advisory, unchanged release class

CML lint remains advisory and exits 0. It reports two inherited `re-04-02` errors and 277 warnings. Session 144 recorded the same two errors and 278 warnings; Session 145 reduces warnings by one and introduces no new CML error.

## Dependency-backed gates not claimed

| Gate | Status |
|---|---|
| Exact-lock installation | Controlled timeout, exit 124; zero installed package files |
| TypeScript project typecheck | Not executed with a complete dependency tree |
| Vitest | Not executed with a complete dependency tree |
| `validate:content` runtime schema gate | Not executed with a complete dependency tree |
| `lint:pedagogy` runtime gate | Not executed with a complete dependency tree |
| Production build | Not executed with a complete dependency tree |
| Playwright | Not executed; Node 22.16 is also below Chromium 149's 22.17 floor |

The package-safe proof chain is the release boundary. Tar re-extraction and extracted-copy reruns are recorded by the packaging command and must pass before the final checksum is accepted.

## Final package proof

A clean archive rehearsal was created and re-extracted. Package identity, native integrity, tidy state, the seven-file content proof, 1,129 lesson hashes, all historical audits and source-hash sweeps, the Session 145 27,648-case sweep, 35 mutations, and 57-artifact second-run freshness all passed on the extracted copy.
