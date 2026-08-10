# Session 146 gate evidence

- Starting archive checksum: **verified** (`6a2af385…e48296`)
- Failure-first regression audit: **28/28**
- Authored quotient audit: **37/37**
- Generator sweep: **20,736/20,736**
- Adversarial mutations: **47/47 rejected; 3/3 controls**
- Source transpilation: **21/21**
- Content JSON: **1,129/1,129; 1,129 unique IDs**
- Content boundary: **5 files / 37 widget nodes / 0 variant drift / 1,124 lessons byte-identical**
- Lesson hashes: **1,129/1,129**
- Registration: **120/120**
- Player-harness source contract: **36/36**
- Generated freshness: **70/70 byte-stable on second run**
- Historical sweeps: **85,248/85,248 aggregate**
- Native integrity and native clean-copy: **passed**
- CML advisory: **2 inherited errors, 275 warnings**
- Dependency-backed gates: **not claimed; incomplete install**
- Final tar re-extraction rehearsal: **passed complete proof chain**

## Late manifest-staleness gate

- Initial final-candidate manifest verification: **FAIL — 1 stale hash / 2,771** (`SESSION146_FAILURE_FIRST_AUDIT.md`).
- Cause: the failure-first Markdown report was regenerated after the manifest.
- Repair: regenerate the manifest last, rebuild the tar, re-extract the exact tar, and verify every listed byte count and SHA-256.
- Final extracted manifest: **2,771/2,771 valid**.
- Product-source and authored-content delta from this repair: **zero**.
