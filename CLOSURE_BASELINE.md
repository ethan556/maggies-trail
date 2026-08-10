# MAGGIE'S TRAIL — CLOSURE BASELINE

**Canonical input:** Session 218 sealed source archive  
**Closure session:** S219 / Wave 01 audit  
**Audit date:** 2026-08-09  
**Rule:** direct authored/source measurement wins over historical documentation.

## Executive finding

S218's mathematical corpus is intact, but its generated truth layer was not current. The authored
course/lesson corpus directly measures **129 courses · 1,701 lessons · 15,621 steps**. The S218
`curriculum-manifest.json` claimed **15,611 steps** and the S218 `PRODUCT_STATE.json` claimed
**126 widget types, 11,910 tests / 282 files, and 71 certified Playwright executions from Session
135**. `CURRICULUM_INVENTORY.md` was older still at **1,673 lessons · 15,359 steps**.

The old `contentVersion` could not detect these changes because it hashed lesson identity/title
rather than the exact authored bytes. Wave 01 therefore treats generated-state integrity as a P0
release defect, not a reporting nuisance.

## 1. Exact authored corpus

| Metric | Fresh measured value |
|---|---:|
| Courses | **129** |
| Lessons | **1,701** |
| Steps | **15,621** |
| Authored course/lesson files in corpus identity | **1,830** |
| Full authored corpus SHA-256 | `b6461fe5b12d211f98ac3f65fe9aa14fa2e36288aa93a4bbfda7b3476525cf19` |
| Registered engine/widget types | **127** |
| Authored widget instances | **10,236** |
| Registry manipulatives in verified product state | **121** |

The authored `content/courses/**` tree is byte-identical to the S218 seal. No lesson mathematics was
changed during this Wave 01 audit/repair.

## 2. Engine capability distribution

The grade below is the repository's actual capability formula in
`scripts/engine-capabilities.json`: the seven scored axes are `manip`, `conseq`, `err`, `adapt`,
`a11y`, `mobile`, and `polish`.

| Capability grade | Registered engines | Authored widget instances |
|---|---:|---:|
| A | **65** | **1,800** |
| B | **45** | **855** |
| C | **12** | **1,164** |
| D | **5** | **6,417** |
| **Total** | **127** | **10,236** |

The large D-instance count is not automatically a defect: ordinary MCQ/numeric/retrieval surfaces
are intentionally low-manipulation. Closure prioritization therefore uses lesson purpose, not raw
interaction-count inflation.

## 3. A/B interaction density by grade band

| Band | Lessons | A/B instances | Mean A/B per lesson | Median | Lessons with zero A/B | Zero rate |
|---|---:|---:|---:|---:|---:|---:|
| K–2 | 410 | 998 | 2.434 | 2 | 16 | 3.9% |
| Grades 3–5 | 419 | 659 | 1.573 | 2 | 75 | 17.9% |
| Grades 6–8 | 245 | 444 | 1.812 | 1 | 59 | 24.1% |
| High school / calculus | 627 | 554 | 0.884 | 1 | 128 | 20.4% |
| **Total** | **1,701** | **2,655** | **1.561** | — | **278** | **16.3%** |

### Operational lesson-purpose classification

`CLOSURE_LESSON_CLASSIFICATION.csv` is a deterministic audit substrate, **not new authored
curriculum metadata**. It classifies all 1,701 lessons for prioritization and requires a human
re-read before any `CHANGE` row is edited.

| Class | All lessons | Zero-A/B lessons |
|---|---:|---:|
| A — concept acquisition | **552** | **72** |
| B — conceptual transfer | **69** | **9** |
| C — procedural fluency | **1,027** | **187** |
| D — retrieval | **40** | **5** |
| E — assessment/mastery | **13** | **5** |

Thus the fresh mechanical screen finds **81 A/B conceptual candidates with zero rich interaction**,
including **72 concept-acquisition lessons**. This is a ranking input, not permission to mass-convert
them. `PREMIUM_INTERACTION_PRIORITY.csv` records **39 CHANGE · 229 KEEP · 10 REFUSE** decisions
for the 278 zero-A/B lessons; REFUSE is used for retrieval/assessment cases where manipulative
conversion would degrade independent evidence.

## 4. Process evidence, mobile, and accessible state

- Engines with `adapt=0`: **63 / 127**.
- Engines with `mobile=1`: **3 / 127** — `systemsExplore`, `matrixTransform`, `compassConstruct`.
- Registered engines with a `describeWidgetState` branch: **84 / 127**.
- Important high-use/spatial manipulatives lacking `describeState` under the closure criterion
  (≥20 authored uses, `manip>=2`): **13**:
  `numberLineHop` (452), `tenFrame` (165), `tapDiagram` (132), `fractionBar` (101),
  `estimateSlider` (95), `barBuilder` (70), `lengthCompare` (63), `baseTenCompose` (56),
  `numberLinePlace` (52), `clockSet` (40), `columnCalc` (39), `hundredthsGrid` (36), `slider` (28).
- High-use manipulatives with `adapt=0` include `tenFrame` (165), `tapDiagram` (132),
  `lengthCompare` (63), `unitCircleExplore` (40), `clockSet` (40), `columnCalc` (39), `slider` (28),
  `expLogExplore` (28), `signChart` (27), and `solveBalance` (20).

These are Wave 5/6 closure inputs; they are not reasons to add new engines.

## 5. Generated-state disagreements found at baseline

| Artifact | S218/current-looking value found | Fresh direct truth |
|---|---|---|
| `content/curriculum-manifest.json` | 1,701 lessons / **15,611** steps; title-derived `contentVersion` | 1,701 / **15,621**; exact authored corpus hash |
| `CURRICULUM_INVENTORY.md` | **1,673** lessons / **15,359** steps; MCQ-heavy 252 | **1,701** / **15,621**; MCQ-heavy 257 |
| `PLAYBOOK_STATUS.md` | A1173 / B431 / C96 / D1 | A1186 / B457 / C57 / D1 |
| `PRODUCT_STATE.json` | 126 widgets; 11,910 tests/282 files; 71 browser runs; Session 135 | 127 widgets; last certified S218 12,925/322 and 115 browser runs, explicitly historical |
| `reports/session-test-result.json` | stale S205Q result with current-looking filename | preserved as `session-test-result.S205Q.json`; no current-looking alias |
| `README.md` / root `STATE.md` / root `HANDOVER.md` | old snapshots presented at privileged entry points | counts removed or rewritten to corpus-hashed S219 state / S220 handover |
| `FLAGSHIP.md` | 1,673-lesson generated ranking | regenerated: 1,701 lessons; 1,341 flagship; 143 rich-engine/no-prediction |

## 6. Dependency/security baseline

Exact lockfile versions include Next **15.5.23**, React/React DOM **19.2.7**, Vitest **4.1.10**,
`better-sqlite3` **12.11.1**, `@sparticuz/chromium` **149.0.0**, and transitive `sharp` **0.34.5**.

- Next 15.5.23 is beyond the 15.5.21 patched threshold for the July 2026 high-severity App Router
  Server Actions DoS advisory.
- React 19.2.7 is beyond the 19.2.4 patched threshold for the January 2026 RSC DoS/source-exposure
  follow-up.
- `sharp@0.34.5` is inside the `<0.35.0` high-severity libvips advisory range. S205/S218 disabled
  Next's image optimizer globally as a reachability mitigation, but that mitigation **cannot be
  freshly browser/build re-certified in this checkout** because dependencies are unavailable.
- `npm audit` could not run: the configured registry/audit endpoint is unavailable in this sandbox.
- `npm ci` could not reconstruct dependencies; no matching local dependency tree exists.
- Current Node is **22.16.0**, below `@sparticuz/chromium@149.0.0`'s declared `^22.17.0 || >=24.0.0`.

**Release ruling:** do not claim a clean dependency gate from this environment. The known Next/React
advisories checked above are patched by the exact lock; the sharp high advisory is historically
mitigated but remains open for current-build reachability proof or removal/upgrade, and the full
transitive audit remains open.

## 7. Incomplete production systems found

Direct source inspection shows the following public-premium blockers remain:

- subscription checkout/billing is explicitly simulated (`premium/page.tsx`, `entitlement.ts`);
- production email delivery is an outbox, not SMTP/provider delivery (`authService.ts`);
- cross-device class tools are explicitly disabled in the local-first deployment (`ClassClient.tsx`);
- LTI AGS queues scores but does not implement live delivery (`ltiService.ts`);
- route observability is presently `console.error` only (`app/error.tsx`);
- no hosted production deployment is configured in current product state.

Positive baseline: SQLite backup, restore, retention purge, auth/session primitives, and server-side
persistence architecture are real code paths with existing test coverage in the repository; they
should be re-certified once the full dependency tree is runnable.

## 8. Outstanding known learner/product issues carried into closure

1. 81 mechanically identified A/B conceptual zero-rich candidates require human necessity audit.
2. High-school A/B density remains lower than earlier grades.
3. `distributionCompareLab` still lacks the queued manipulable wrong-state counterfactual; its
   overlap label also has a known bracket-collision polish note.
4. Second justified `algebraTiles` distribution deployment remains queued.
5. Seven previously proposed advanced engine gaps require fresh necessity audits, not automatic build.
6. 63 engines remain `adapt=0`; important process-evidence work is not complete.
7. 43 registered engines have no `describeState`; 13 are high-use/spatial priorities.
8. Three engines remain `mobile=1`.
9. Current performance, build, browser accessibility, and visual breakpoints are not freshly measured.
10. Paid-user billing/email/cross-device/class/LTI/observability workflows are incomplete.
11. Psychometric calibration remains provisional until real learner evidence exists.

## 9. Baseline correction on the record

During the audit, the first A/B census accidentally summed `repr` instead of the registry's seventh
axis `polish`. That understated rich-engine coverage. The error was independently re-derived and
corrected before any prioritization artifact was accepted. The authoritative numbers are the ones
above: **65 A / 45 B / 12 C / 5 D engines; 1,800 / 855 / 1,164 / 6,417 authored instances**.

## 10. Dependency-free source-release gate

Native source-release integrity was not assumed from S218. It was run on the Wave-01 tree, initially failed on three concrete artifacts/import issues, and passed only after repair: **2,491 JSON · 1,187 source files · 1,680 local imports · 47 internal links · 2 assets · 268 buttons · 28 API routes**.
