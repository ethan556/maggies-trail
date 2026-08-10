# Maggie's Trail

Maggie's Trail is a local-first, interactive K–12 and precalculus mathematics platform. Lessons are authored as typed JSON and rendered through one lesson player; progress, review, mastery, and in-progress lesson state remain usable when the network or account service is unavailable.

The canonical current inventory is generated in [`PRODUCT_STATE.md`](PRODUCT_STATE.md) and [`PRODUCT_STATE_VERIFIED.json`](PRODUCT_STATE_VERIFIED.json). Do not copy counts into this README: release counts must come from those corpus-hashed artifacts so this file cannot silently outlive the curriculum it describes.

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Accounts and cross-device sync additionally require a writable SQLite location. Set `MAGGIE_DB_PATH` when the default `data/app.db` is not appropriate. Production password and learner-PIN hashing requires a non-empty `AUTH_PEPPER`.

## Release gates

Run the dependency-free integrity gate first; it works even in a clean archive before packages are restored:

```bash
npm run validate:native
```

It checks JSON validity, local import resolution, internal routes and assets, bounded API parsing, native-button semantics, registration consistency, and host-portable source paths.

A release still requires the package-backed gates:

```bash
npm run typecheck
npm test                 # shard with --shard=1/4 … 4/4 if it stalls under memory pressure
npm run validate:content
npm run lint:pedagogy
npm run lint             # ESLint CLI + .eslintrc.cjs; gate is 0 errors
npm run build
npm run test:e2e         # against the production build; --workers=1 on constrained hosts
npm audit
```

Regenerate derived curriculum/product records after relevant changes:

```bash
npm run gen:manifest
npm run gen:flagship
npm run audit:scaffold
npm run gen:inventory
npm run gen:state
```

Generated counts and gate status must describe what was actually executed; unavailable gates are not green gates.

### Variant batch compiler

Grade- or course-wide runtime refresh work uses the manifest-driven pipeline documented in
[`VARIANT_BATCH_WORKFLOW.md`](VARIANT_BATCH_WORKFLOW.md). It discovers real runtime gaps, compiles
only unresolved targets, locks authored-content hashes, and derives deterministic, independent-route,
evaluator, coverage, and whole-registry verification from one plan. Its learner-action adapter layer
also verifies manipulatives such as subitizing, number-line hops, ordering, tap diagrams, ten
frames, matching, aligned length comparison, base-ten composition, fraction bars, clocks, place
comparison, odd/even pairing, constrained money boards, and word-form token building from visible
state rather than stored answers.

## Content architecture

Lessons live in `content/courses/<course>/lessons/<lesson>.json`. A lesson normally contains 8–15 `concept`, `interactive`, `check`, `challenge`, `recap`, or `remedial` steps.

Key contracts:

- Every graded step has a `conceptTag`, so mastery and spaced review attach to the mathematical idea rather than a screen.
- Wrong-answer feedback diagnoses the misconception instead of merely restating the answer.
- Concept steps are followed quickly by something the learner does.
- Challenge steps occur late in the lesson and carry a structured hint ladder.
- Prediction blocks ask learners to commit before a manipulative reveals the outcome; predictions are reflective evidence, not grades.
- Figures and widgets render on the shared light learning stage in both themes.

`FLAGSHIP.md`, `FLAGSHIP_TIERS.md`, `MCQ_INVENTORY.md`, `SCAFFOLD_AUDIT.md`, and `CURRICULUM_INVENTORY.md` are generated review surfaces, not hand-maintained claims.

## Adding a widget

A widget is not complete until all of these agree:

1. `src/lib/schema.ts` — schema, discriminated union, and exported type.
2. `src/components/widgets.tsx` — component, dispatch case, and registry.
3. `src/lib/evaluate.ts` — evaluation, checkability, and answer text.
4. `src/lib/pedagogy.ts` — wrong-path feedback collection.
5. `src/components/widgetSamples.ts` — development/audit sample.
6. Keyboard interaction tests.
7. Evaluation and misconception-feedback tests.
8. `src/components/stageWidth.ts` — exhaustive stage sizing.

Use native controls, visible focus, minimum 44 px targets, reduced-motion-aware transitions, and shared plotting utilities.

## Runtime architecture

- **Catalog:** `src/lib/content.server.ts` loads courses in canonical manifest order, then builds lesson and skill indexes deterministically.
- **Progress:** `src/lib/progress.ts` is local-first and namespaced per learner.
- **Storage:** `src/lib/safeStorage.ts` mirrors writes into tab memory when browser storage is blocked and avoids resurrecting keys removed elsewhere.
- **Resume:** `src/lib/lessonState.ts` saves strict mid-lesson snapshots and rejects snapshots that no longer match the lesson.
- **Mastery and review:** evidence accumulates per `conceptTag`; retention and spaced review drive recommendations.
- **Accounts:** server-verified passwords, single-use email tokens, HttpOnly sessions, learner-scoped PIN sessions, durable rate limits, and an audit trail.
- **Sync:** authenticated semantic merge over a versioned SQLite profile with account/learner-scoped idempotency and transactional projections.
- **Institutions:** an additive server-side layer for districts and schools — a self-referencing org tree with subtree-inherited administration, OneRoster v1.1 CSV import (transactional, idempotent, dry-run first), assignments with a recomputed per-learner status cache, evidence-derived intervention tiers with case tracking, cohort-suppressed district reporting, and LTI 1.3 launch validation. Pure logic lives in `src/lib/institution/`; authorization is re-derived from rows on every call in `src/server/`.
- **Failure behavior:** lessons and local progress continue when durable account infrastructure is unavailable; account routes return explicit 503 responses rather than crashing the learner experience. Every institutional surface degrades to a calm empty state rather than an error wall, so a solo learner never sees an institutional hole in their trail.

## Deployment truth

The learner core is deployable as a normal Next.js application. Durable accounts, classrooms, and cross-device sync require a **single writable SQLite volume** and scheduled backup/retention operations. This is not a multi-node database architecture.

Email flows currently write complete messages to `mail_outbox`; a real SMTP/SES worker still needs to deliver and mark those rows. LTI grade passback follows the same pattern: scores are queued into `lms_outbox` and a drain worker is the documented seam — this deployment makes no outbound HTTP. Billing remains a clearly labeled client-side demonstration and must not be treated as a real entitlement authority. See [`KNOWN_ISSUES.md`](KNOWN_ISSUES.md) and [`INSTITUTIONS.md`](INSTITUTIONS.md).

## Session 89: Integrated Causal Mastery Learning

The production lesson player now supports the CML cycle—Predict, Construct, Observe, Explain, Revise, Generalize, Retrieve—across 45 profiled mathematical engines. Eighteen K–8 flagship sequences provide the first complete vertical pilot, with synchronized representations, visible revision, causal explanations, counterfactuals, fading, transfer, and delayed retrieval. See `CML_IMPLEMENTATION_SESSION_89.md` and `REGRESSION_AUDIT_SESSION_89.md`.

## Session 90 interaction layer

The lesson player uses a collapsed-by-default **Mastery lens** for direct mathematical manipulatives. It coordinates learner action, target, invariant, repair, and transfer through a consistent color grammar while keeping one mathematical representation in focus. All 46 profiled direct/supporting engines have specialized representation-mesh adapters. See [`LESSON_PLAYER_POLISH_SESSION_90.md`](LESSON_PLAYER_POLISH_SESSION_90.md).


## Session 93 — Algebra II compiler completion and whole-app manipulative reuse

Completed all **405** remaining Algebra II runtime gaps across nine Grade-11 courses. Algebra II rises
from **110/515** to **515/515 (100%)**, and overall runtime coverage rises to **3,413/4,471 (76.34%)**.

The implementation uses **211 reusable forms** across nine generator families and independently
reconstructs truth from prompts and learner-visible state. A whole-app manipulative review selected one
causal flagship per course without adding a new widget type. Complex multiplication, transformations,
logarithmic inverses, multiplicity, extraneous roots, discontinuities, series convergence, sampling, and
unit-circle structure now use shared CML profiles and synchronized representation meshes. See
`ALGEBRA2_COMPLETION_SESSION_93.md` and `REGRESSION_AUDIT_SESSION_93.md`.

## Session 92 — Algebra I compiler completion and causal mastery

Completed all **295** remaining Algebra I runtime gaps across eight Grade-9 courses. Algebra I rises
from **89/384** to **384/384 (100%)**, and overall runtime coverage rises to **3,008/4,471 (67.28%)**.
The batch uses 120 reusable forms across eight generator families while preserving 208 numeric, 66
MCQ, 20 expression-building, and one matching surface.

Independent prompt-derived solution routes verify every form. One flagship direct-manipulation CML
sequence now anchors each Algebra I course, and `quadraticExplore` plus `expLogExplore` are integrated
into the shared causal engine and representation-mesh contracts. The semantic baseline comparison
proves exactly 295 variant additions and eight CML additions across 96 lesson files, with no
unauthorized content drift.

See `ALGEBRA1_COMPLETION_SESSION_92.md`, `REGRESSION_AUDIT_SESSION_92.md`, and
`ALGEBRA1_CML_AUDIT_SESSION_92.json`.

## Session 100 — Exact practice, standards evidence, and field calibration

Every one of the 1,165 canonical objectives now has at least 20 exact-skill practice states. The 87 previously thin objectives receive deterministic 24-state certification banks spanning support/core/stretch difficulty, contextual and non-contextual forms, representation demands, misconception feedback, and near/medium/far transfer. Rebuild and verify with `npm run practice:certify` and `node scripts/verify-session100-readiness.cjs`.

The standards graph now exposes 6,119 checksum-protected human-review dossiers linked to eight official-authority source registries. Candidate mappings remain provisional until a reviewer captures the exact official wording, evidence depth, rationale, and signed decision through `npm run standards:review -- --edge=...`.

The diagnostic field-calibration pipeline adds explicit-consent collection, secure authenticated ingestion, portable de-identified packets, a versioned SQLite evidence schema, classical item statistics, candidate 2PL estimation, uncertainty, distractor analysis, optional DIF screening, salted longitudinal growth linkage, and an explicit human promotion gate. Runtime parameters remain provisional until a real field run passes every declared gate and is approved.

## Session 113 — Institutional layer (rostering, assignments, interventions, reporting, LTI)

Districts and schools now have a first-class, **additive** server layer. An org tree carries
subtree-inherited administration; OneRoster v1.1 CSV bundles import transactionally and
idempotently with a dry run that writes nothing but an audit row; teachers assign lessons or whole
courses from the curriculum manifest and see a per-learner status cache that a synced completion
updates with no assignment-side write; intervention tiers are recomputed from evidence by a pure
module (insufficient evidence stays Tier 1 by design) with a human case layer on top; district
reports suppress small cohorts to protect individual learners; and LTI 1.3 launches are validated
end to end — RS256 over the platform's JWKS, temporal claims, single-use nonce, `jti` replay guard,
deployment and message-type checks — with every rejection carrying a reason code a district can
debug against. Students never receive accounts: a student launch redirects straight into the lesson,
where the engine is local-first.

Surfaces: `/admin` (org tree, roster import, staff, reports with CSV, LTI registration) and
`/teach/class/[classId]` (manifest-driven assignment picker, tier trail bar, shared-need small
groups, intervention cases), plus a learner-side "From your teacher" card. Zero new dependencies —
signature verification is `node:crypto` only — and no generative AI anywhere in the path.

See [`INSTITUTIONS.md`](INSTITUTIONS.md) for the data model, RBAC matrix, OneRoster subset, tier
thresholds, suppression policy, and the honestly enumerated owed seams.
