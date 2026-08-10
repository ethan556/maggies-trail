# SESSION126_GATE_EVIDENCE — ordered verification record

Session 126 was executed from `maggies-trail-session-125.tar.gz`, whose internal root was
`maggies-trail-session-121`. The working and packaged root was corrected to
`maggies-trail-session-126`.

## Input baseline recorded by Session 125

- TypeScript: exit 0.
- Vitest: 10,092/10,092 across 162 files.
- Content schema: 1,223/1,223.
- Pedagogy lint: 1,139/1,139.
- Build: exit 0.
- Playwright: 47/47, `PWEXIT:0`.
- Native integrity: clean on the packaged tree.

These are input-archive records, not reruns claimed by Session 126.

## Session 126 dependency-free gates — rerun in this container

```text
excellence-s126: 64/64 classified, 0 unreviewed | dispositions {"build":35,"extend":18,"intentional-assessment":2,"multi-engine":4,"reuse":5} | representations no=49 partial=13 | honest prediction ceilings=3
```

```text
engine registration passed: 106/106 core-complete; describeState 59/106
```

```text
registration: files ↔ course.json ↔ PLAN.md all consistent
```

```text
hash proof passed: 1129 authored lesson files byte-identical to SESSION126_LESSON_HASHES.json
```

```text
generated freshness note: PRODUCT_STATE regeneration skipped because local Vitest is unavailable; full verify:session requires dependencies
tiers: A 608 B 201 C 292 D 28 | K-8 A 314 B 170 | C-only load-bearing 66 | backlog 64
playbook: 16 enhancements · 0 unbuilt · 0 built-but-unused
excellence-s126: 64/64 classified, 0 unreviewed | dispositions {"build":35,"extend":18,"intentional-assessment":2,"multi-engine":4,"reuse":5} | representations no=49 partial=13 | honest prediction ceilings=3
engine registration passed: 106/106 core-complete; describeState 59/106
generated freshness passed: 7 artifacts byte-stable after regeneration
```

```text
Native integrity passed: 1344 JSON files, 763 source files, 1055 local imports, 45 internal links, 2 assets, 194 buttons, 25 API routes.
native clean-copy gate passed
```

```text
tidy passed: release tree has canonical living docs, one Session-125/126 note, and no generated dependency/build artifacts
tidy clean-copy gate passed
```

```text
package identity passed: maggies-trail-session-126
```

```text
predict QA: 801 predictions checked, 73 problem(s), 171 warning(s)
```

The 73 prediction problems are the frozen, pre-existing duplicate-prompt/reveal corpus already
recorded in `KNOWN_ISSUES.md`. Session 126 changed no lesson JSON and therefore added zero.

All new `.mjs` files passed `node --check`; all new/modified shell runners passed `bash -n`; the
new TypeScript adversarial spec passed Node 22's TypeScript syntax check:

```text
node --experimental-strip-types --check src/lib/excellenceBacklog.s126.test.ts
NODE_SYNTAX_EXIT:0
```

## Package-backed gate status

The source archive does not vendor `node_modules`. Three controlled installation paths were tried.
None produced a usable dependency tree:

1. The internal mirror lacked exact locked packages. After locally bypassing its missing Zustand
   tarball, it failed on the next exact package:

```text
npm error code E404
npm error 404 Not Found - GET https://packages.applied-caas-gateway1.internal.api.openai.org/artifactory/api/npm/npm-public/zod/-/zod-3.25.76.tgz
EXIT:1
```

2. The public registry repeatedly failed DNS resolution (`EAI_AGAIN`) for package tarballs.
3. The final public-registry `npm ci --ignore-scripts` terminated inside npm itself:

```text
npm error Exit handler never called!
EXIT:1
```

The environment also warned that `@sparticuz/chromium@149.0.0` declares Node `^22.17.0 || >=24`,
while this container provides Node `22.16.0`.

Consequently, the following were **not rerun**, and are not reported as green by Session 126:

- `tsc --noEmit`;
- targeted Vitest;
- full Vitest;
- `validate:content`;
- `lint:pedagogy`;
- ESLint;
- production build;
- live Next server and Playwright.

The tree remains internally consistent, the exact lockfile is unchanged from Session 125, and the
canonical `verify:session` command now encodes the full ordered chain for the next environment with
a working package source. Session 127 must begin by running it before behavioral browser work.

## Packaging gate

The final tar is created only after this report and the living documents are complete. The package
script re-extracts the tar and reruns native integrity, package identity, authored-content hash
proof, tidy, and the generated engine-registration contract. The final digest is written outside the archive in `maggies-trail-session-126.tar.gz.sha256`;
`SESSION126_ARTIFACTS.json` hashes the named evidence files embedded in the tar.
