# Session 147 gate evidence

## Session 147 engine and content gates

- Failure-first audit: **38/38**
- Authored-content audit: **35/35**
- Content-change proof: **5 files / 35 widgets / 30 main / 5 remedial / 0 variant drift**
- Affine generator sweep: **20,736/20,736**
  - Numeric: 8,064
  - Semantic choice: 10,368
  - Point: 2,304
- Session 147 mutations: **53/53 rejected**
- Valid controls: **3/3 accepted**
- Source transpilation: **23/23** using TypeScript 5.8.3
- Content JSON: **1,129 lessons / 1,129 unique IDs**
- Lesson hashes: **1,129/1,129**
- Registration: **121/121**
- Player harness: **36/36**
- Reviewed queue: **17/17 classified; 0 unreviewed**
- CML integration: **PASS**
- CML advisory: **2 inherited `re-04-02` errors; 275 warnings**

## Historical seeded sweeps rerun from the extracted package

- Signed fractions: **4,608/4,608**
- Shape hierarchy: **11,520/11,520**
- Conditional tables: **9,216/9,216**
- Graph stories: **9,216/9,216**
- Proportional reasoning: **23,040/23,040**
- Place-value transformations: **27,648/27,648**
- Quotient reasoning: **20,736/20,736**
- Affine relationships: **20,736/20,736**

Total executed seeded cases: **126,720/126,720**.

## Historical mutation matrices

- Session 143: **20/20**
- Session 144: **29/29**
- Session 145: **35/35**
- Session 146: **47/47**
- Session 147: **53/53**

Combined: **184/184 deliberate defects rejected**; **14/14 valid controls accepted**.

## Generated and package proof

- Generated artifacts: **83/83 byte-stable after regeneration**
- Comprehensive package manifest: **2,817/2,817 valid after extraction and gate execution**
- Package root: `maggies-trail-session-147`
- Native integrity: **PASS**
- Package identity: **PASS**
- Tidy release tree: **PASS**
- Exact content boundary: **PASS**
- Lesson-hash proof: **PASS**
- Tar re-extraction: **PASS**

## Dependency-backed boundary

Two exact-lock installs were attempted and both exited 1 inside npm with “Exit handler never called.” The incomplete tree was removed and `package-lock.json` remained byte-identical. Consequently, project typecheck, Vitest, build, and Playwright are **not claimed**.
