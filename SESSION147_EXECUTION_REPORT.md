# Session 147 execution report

## Result

Session 147 began from the definitively sealed Session 146 archive, recomputed the live 22-lesson reviewed K–8 queue from disk, reranked every remaining mathematical family, and selected the largest exact-fit closure that survived authored-claim and learner-action review.

The selected closure is `affineRelationshipLab`, spanning five lessons and 35 authored experiences. The queue moved **22 → 17** without changing any authored prompt, answer, misconception feedback, variant declaration, ID, ordering, hint, explanation, prediction, or remedial mapping.

## Breakthrough

One affine truth state, `y = mx + b`, now drives:

- slope and intercept reading;
- positive, negative, and zero association;
- rate comparison, including lower-rate goals and ties;
- initial-value comparison as a distinct claim;
- simultaneous rate-and-start comparison;
- substitution and evaluation;
- candidate-point verification against one or two relationships;
- exact intersection x, y, and point derivation;
- rendering, grading, feedback, narration, reveal, keyboard state, CML routing, and seeded generation.

## Exact authored boundary

- Changed lesson files: **5**
- Widget substitutions: **35**
- Main experiences: **30**
- Remedial routes: **5**
- Variant declarations changed: **0**
- Non-target lessons byte-identical: **1,124**

## Failures found before release

1. The first slope-association parser required a printed equation, but the authored form states the slope in prose. A dedicated stated-slope parser was added.
2. Two systems contexts state `y = kx` in prose rather than an equation token. A direct-proportional context parser was added.
3. “Which starts higher?” was initially routed through the broader rate-and-start claim. A separate `compareStart` task was added to preserve the narrower authored claim.
4. The registration audit could not discover compressed `type:z.literal` syntax. The schema declaration was normalized to the repository contract style.
5. Mutation M41 used a spacing-specific source string and falsely failed after harmless formatting normalization. It now tests the engine-scoped plain-`ZodObject` structure with a structural regular expression.
6. Two raw npm `.log` files remained in the candidate root. Their evidence was already consolidated into `SESSION147_NPM_CI.txt`; the transient logs were removed.
7. The first diff-statistics generator embedded a host-specific `/mnt/data` baseline. It now resolves the baseline from an environment variable or relative workspace path.
8. The inherited package workflow stopped at Session 146. Session 147 affine artifacts and clean-extraction gates are now explicit package requirements.

## Executed proof

- Failure-first audit: **38/38**
- Authored-content audit: **35/35**
- Affine generator sweep: **20,736/20,736**
- Affine mutations: **53/53 rejected; 3/3 controls accepted**
- Historical seeded cases: **105,984/105,984**
- Total seeded cases including Session 147: **126,720/126,720**
- Historical and current mutations, Sessions 143–147: **184/184 rejected**
- Source transpilation: **23/23**
- Lesson JSON and IDs: **1,129/1,129**
- Lesson hashes: **1,129/1,129**
- Registration: **121/121**
- Player harness: **36/36**
- Generated freshness: **83/83 byte-stable**
- Comprehensive extracted-package manifest: **2,817/2,817**
- Package identity, tidy, native integrity, clean extraction: **passed**

## Runtime boundary

Two exact-lock public-registry `npm ci` attempts were executed using `nohup setsid`. Both exited 1 inside npm with “Exit handler never called” after the Node engine warning and produced only an incomplete 2.7 MB dependency tree, which was removed. The lockfile remained byte-identical. Node is 22.16.0 while Chromium 149 declares 22.17.0 as its minimum.

Current-tree project TypeScript typecheck, Vitest, production build, and Playwright are therefore **not claimed**.
