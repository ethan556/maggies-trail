# Session 149 gate evidence

## Current-session engine and content gates

- Failure-first audit: **59/59**
- Authored audit: **42/42**
- Content-change proof: **6 files / 42 widgets / 36 main / 6 remedial / 0 variant drift**
- Geometric generator sweep: **27,648/27,648**
  - Numeric: **21,888**
  - Semantic choice: **5,760**
- Session 149 mutations: **65/65 rejected**
- Valid controls: **3/3 accepted**
- Source transpilation: **27/27** using TypeScript 5.8.3
- Content JSON: **1,129 lessons / 1,129 unique IDs**
- Lesson hashes: **1,129/1,129**
- Registration: **123/123**
- Player harness: **36/36**
- Reviewed queue: **4/4 classified; 0 unreviewed**
- Native integrity: **PASS**
- CML integration: **PASS**

## Historical seeded sweeps re-executed

- Signed fractions: **4,608/4,608**
- Shape hierarchy: **11,520/11,520**
- Conditional tables: **9,216/9,216**
- Graph stories: **9,216/9,216**
- Proportional reasoning: **23,040/23,040**
- Place-value transformations: **27,648/27,648**
- Quotient reasoning: **20,736/20,736**
- Affine relationships: **20,736/20,736**
- Exact numbers: **27,648/27,648**
- Geometric constraints: **27,648/27,648**

Total executed seeded cases: **182,016/182,016**.

## Historical mutation matrices

- Session 143: **20/20**
- Session 144: **29/29**
- Session 145: **35/35**
- Session 146: **47/47**
- Session 147: **53/53**
- Session 148: **60/60**
- Session 149: **65/65**

Combined: **309/309 deliberate defects rejected**; **20/20 valid controls accepted**.

## Generated-evidence proof

The first expanded Session 149 freshness run regenerated two legitimately stale Session 148 artifacts. The mandatory second complete run passed **114/114 artifacts byte-stable**. No detector was bypassed or hand-edited.

## Portability repair

The first clean extraction exposed Git-dependent `PRODUCT_STATE` bytes. The generator no longer reads `.git`; source-archive output is now identical in the working tree and extracted package. The complete freshness chain was rerun and passed **114/114**.
 Session 144 source/content artifacts are also now mandatory members of the global freshness chain rather than extraction-only checks.

## Dependency-backed boundary

`npm ci` exited 1 because the configured registry returned 404 for locked `zustand@5.0.14`. The lockfile remained byte-identical. Project typecheck, Vitest, build, and Playwright are not claimed.

## Package proof

Final clean-extraction result:

- Package identity: **PASS**
- Tidy release tree: **PASS**
- Native integrity: **PASS**
- Exact content boundary and 1,129 hashes: **PASS**
- 182,016 seeded cases: **PASS**
- 309 mutations rejected / 20 controls accepted: **PASS**
- Generated freshness: **114/114**
- Comprehensive artifact manifest: **2,908/2,908**
- Tar re-extraction: **PASS**
