# Session 139 — gate evidence

## Primary runtime boundary

The last fully executed primary-gate boundary remains Session 135: tsc 0; Vitest 10,201/10,201 across 174 files; content/pedagogy validators green; build exit 0; Playwright 71/71. Session 139 does not inherit those passes.

## Fresh exact-lock recovery attempt

Command:

```bash
npm ci --ignore-scripts
```

Observed output:

```text
npm warn EBADENGINE @sparticuz/chromium@149.0.0 requires Node ^22.17.0 or >=24.0.0
current Node: v22.16.0
npm error E404: locked zustand@5.0.14 tarball unavailable from configured internal registry
EXIT:1
```

No identical-lock dependency tree with `node_modules` was found under `/mnt/data`, `/mnt/user-data`, or `/tmp`. Therefore project-local tsc, Vitest, validators, ESLint, build, production server, Playwright, and screenshots are **unavailable in this environment—not passed and not inherited**.

## Executed dependency-free chain

```text
Node v22.16.0 · npm 10.9.2
changed-source transpilation: 10/10, 0 diagnostics
source JSON parse: 1,401 files, 0 errors
Session 139 content proof: 1,129 lessons; 1 file / 9 widget nodes / 0 variant declarations changed
signed-fraction executable variant sweep: 4,608/4,608
  multiply: 2,304 · divide: 2,304
  positive truth: 2,304 · negative truth: 2,304
signed-fraction static lesson audit: 9/9 experiences
excellence ledger: 48/48 classified · 0 unreviewed
course files ↔ course.json ↔ PLAN.md: consistent
engine registration: 114/114 core-complete · describeState 68/114
player harness contract: 36/36 · 71 projected browser executions
generated freshness: 31/31 artifacts byte-stable
native clean-copy integrity: 1,401 JSON · 810 source files · 1,100 local imports · 45 internal links · 2 assets · 209 buttons · 25 API routes
lesson hash proof: 1,129/1,129
```

## Historical non-regression chain

Regeneration reran the Session 128–138 audits. All remained green against the improved Session-139 state, including reuse, exact estimation, fixed-grid reading, distribution comparison, trial probability, compound events, composite area, geometry roundup, and percent change.

## Package-safe acceptance criteria

The final tar is accepted only after re-extraction reruns:

- native integrity;
- package identity;
- Session-139 content proof;
- 1,129-file hash proof;
- tidy verification;
- 114/114 engine registration;
- 36/36 player-harness contract;
- every historical non-regression audit;
- the Session-139 signed-fraction audit, including the current-generator hash match to the executed 4,608-case sweep.
