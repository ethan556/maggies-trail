# WAVE 02 BASELINE — PREMIUM PRODUCT SHELL / RUNTIME GATE

**Session:** S220  
**Wave status at start:** OPEN. Wave 02 may not claim visual certification until current-source runtime gates are executable.  
**Canonical input:** S219 Wave-01 seal.

## 1. Immutable mathematical baseline

Direct corpus verification at the start of S220:

- courses: **129**;
- lessons: **1,701**;
- steps: **15,621**;
- registered widget/engine types: **127**;
- registered manipulatives: **121**;
- authored course/lesson files: **1,830**;
- exact authored corpus SHA-256: `b6461fe5b12d211f98ac3f65fe9aa14fa2e36288aa93a4bbfda7b3476525cf19`.

S220 begins under a strict content freeze. No visual-shell preflight repair is authorized to change
`content/courses/**`.

## 2. Runtime gate — still blocked

The S219 handover required a supported runtime and exact dependency tree before Wave-02 visual claims.
Fresh S220 evidence:

- Node: **v22.16.0**;
- npm: **10.9.2**;
- exact `package-lock.json` is present;
- `@sparticuz/chromium@149.0.0` declares Node `^22.17.0 || >=24.0.0`, so this runtime is below the package floor;
- no reusable sealed `node_modules` tree exists in the available workspace;
- exact `npm ci --ignore-scripts --no-audit --no-fund` reaches the configured internal registry but exits **1** because `zustand@5.0.14` returns HTTP **404**;
- public npm is not a usable fallback in this environment.

Therefore the following are **not current S220 evidence** and remain OPEN:

- semantic TypeScript typecheck under the exact dependency tree;
- full Vitest suite;
- current build;
- current Playwright/browser suite;
- `npm audit` / authoritative installed-tree dependency audit;
- current-build proof that `images.unoptimized` eliminates the Sharp optimizer attack surface;
- rendered Wave-02 screenshot review.

The S218 runtime counts remain historical evidence only and are not borrowed as S220 greens.

## 3. Existing visual evidence

The seal contains historical Session-127 captures at phone, tablet, short-landscape and desktop sizes.
They are useful reference material only. They do **not** certify the current S220 shell because source,
runtime, routes and product state have changed since S127.

A second historical limitation was identified: older capture scripts could record entry animations while
content was still transitioning, creating visually faded screenshots that are not final-state evidence.
Wave 02 therefore requires deterministic settled captures with reduced motion as the screenshot baseline,
with motion semantics reviewed separately under normal motion.

## 4. Generated-evidence integrity baseline

Wave-01 verified the current product-state generator, but S220's broader `verify:generated` preflight
found historical audit machinery that could not safely exercise today's corpus/source:

1. four frozen Python audits unioned `set` with `{}` when a refusal-only batch emitted no authorized paths;
2. their later-session authorization sets stopped before eight already documented S210–S218 lesson changes;
3. S147–S151 JavaScript content proofs duplicated stale path allow-lists instead of consuming the current
   cumulative exact-hash proof;
4. the S151 evaluator VM loader knew only the dependency graph that existed in S151;
5. `verify:generated` invoked `lesson-hashes-s151.py` as if a frozen 1,129-lesson baseline were a current
   generator;
6. that historical hash script wrote `SESSION151_LESSON_HASHES.json` **before** checking the expected
   1,129-lesson count, so a red freshness run could corrupt the frozen ledger.

These are release-integrity defects because a premium visual pass is not trustworthy if the audit chain
can silently stale, skip current code, or destroy its own historical baseline.

## 5. Wave-02 visual certification target

The required deterministic matrix is:

- viewports: **390×844, 768×1024, 1440×900**;
- themes: **light and dark**;
- 15 shell/learner surfaces: home, onboarding, placement, dashboard, catalog, course landing,
  Trailhead, Atlas, lesson start, lesson completion, profile, family, teach, premium, account;
- total planned captures: **90**;
- screenshot baseline: reduced motion + settled final state;
- recorded automated checks: HTTP status, final URL, horizontal overflow, h1/title, visible controls,
  sub-24px targets, touch context, desktop keyboard-focus reachability;
- manual/real-browser gates retained: **200% zoom**, screen-reader spatial-math parity, real-device touch,
  and normal-motion mathematical-meaning review.

**Baseline decision:** prepare and adversarially validate this certification machinery now, but refuse
visual product changes until the real current-source browser matrix can run.
