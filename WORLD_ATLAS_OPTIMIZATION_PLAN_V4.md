# Maggie's Trail: World Atlas Optimization Plan v4

**Status:** active execution plan
**Updated:** 2026-08-19
**Supersedes as an execution guide:** the historical Session 199 master prompt.
**Governing principle:** preserve the historical prompt's ambition for coherence, while making mathematical correctness, accessibility, evidence freshness, and learner reasoning the control system.

## 1. Decision

Maggie's Trail no longer needs a world-atlas rebuild. The current product already has the Trailhead, Atlas, Basecamp, Field Journal, Return Paths, deterministic world state, and equivalent Minimal, Guided, and Immersive modes.

The work now is to keep that system true, accessible, current, and instructionally useful.

This plan therefore prioritizes:

1. source-sealed evidence and reproducible derived artifacts;
2. learner-visible mathematical and representational truth;
3. accessible, usable learning surfaces;
4. evidence-backed world navigation; and
5. measured learner benefit over decorative expansion.

## 2. Current-state baseline

| Area | Current state | Planning implication |
| --- | --- | --- |
| Curriculum | 129 courses and 1,701 lesson JSON files | The Session 199 count of 1,667 lessons is obsolete. |
| Atlas | 14 regions, 129 courses, 530 landmarks, and 13 instruments | Maintain the generated world; do not create a second architecture. |
| World state | Deterministic, derived from existing progress and review evidence | Never fabricate unlocks, prerequisite links, or carried-state claims. |
| Modes | Minimal, Guided, and Immersive already exist with equivalent learner actions | Treat modes as presentation choices, not separate products. |
| Lesson player | Protected by the premium learner-screen and trail-voice contracts | Keep world-building out of active reasoning screens. |
| Visual correctness | Numeric-claim guard, figure alignment, number-line direction, clipping, graph, and decimal-notation work are in place | Make zero unsafe learner-visible conflicts the hard release rule. |
| Artifact freshness | The checked-in world manifest requires regeneration after source changes | Refresh derived evidence before expanding the world or claiming current queue metrics. |

## 3. What remains valid from the historical prompt

- Mathematics comes before theme, reward, or exploration.
- The atlas should make progress, prerequisites, and return paths easier to understand.
- Grade-aware language and visual maturity matter.
- Instructional colour must carry stable meaning rather than decoration.
- Motion must explain a change or support attention; it must never become visual noise.
- Maps must have accessible catalogue/list alternatives and keyboard-equivalent actions.
- Performance and responsive behavior are product requirements, not finishing work.

## 4. What is retired or reframed

| Historical idea | v4 decision |
| --- | --- |
| Build the entire atlas, Trailhead, Basecamp, Journal, and modes | Already substantially shipped; verify and refine instead of rebuilding. |
| A Grade 3 world pilot before broad rollout | Convert to a regression and learner-research route; the architecture is already broader than a pilot. |
| 99.5% or 100% static visual coverage | Replace with semantic representation coverage. A withheld visual is preferable to an incorrect one. |
| Add trails and connections for a richer map | Add a link only when prerequisite or transfer evidence can prove it. |
| Score-based critic completion | Use deterministic correctness, accessibility, browser, and learner-outcome evidence. |
| Large documentation program | Maintain this living plan plus generated evidence; avoid document-only delivery. |
| Avatars, story overlays, sound, offline, and reward loops as immediate work | Treat as separately justified discovery work after core learning quality is demonstrably strong. |

## 5. Delivery sequence

### Phase 0 — Freeze, regenerate, and seal evidence

**Goal:** establish a single trustworthy source baseline before feature or content expansion.

1. Pause new source-writing waves at coherent boundaries.
2. Regenerate and verify, in dependency order:
   - figure-text adversarial evidence;
   - VIS01 and legacy figure alignment;
   - generated numeric claims and numeric-parity evidence;
   - VIS03;
   - pending-work queue;
   - lesson review cards;
   - backlog portfolios; and
   - cache manifest last.
3. Regenerate the world manifest and require `verify:world` to pass against the checked-in artifact.
4. Use two-run hashes or each generator's `--check` mode wherever available.

**Definition of done:** every derived report has a source seal matching the frozen tree; cache freshness reports `SOURCE_SEAL_MATCH`; no report mixes prior source counts with current source.

### Phase 1 — Learner-visible correctness and accessibility

**Goal:** prevent a learner from being misled, blocked, or excluded.

Prioritize these root causes after a fresh source audit:

- diagram, graph, and nearby text disagreement;
- missing number-line direction arrows where motion has direction;
- clipped or invisible numeric labels at narrow widths and 200% zoom;
- focus visibility, skip navigation, and dialog focus return;
- colour-only status/state cues;
- widget-prompt inclusion in reading-mode behavior;
- OS reduced-motion behavior; and
- numerals for concrete decimal values, except an explicit read-aloud task.

**Definition of done:** zero unsafe numeric/operation/direction conflicts; keyboard-only completion works; required labels remain visible at 390px and 200% zoom; screen-reader text agrees with the rendered model.

### Phase 2 — Semantic representation coverage

**Goal:** measure whether a learner has an appropriate representation, not whether a `figure` field is populated.

Classify each concept surface as exactly one of:

1. exact visual or direct-manipulation model;
2. adequate symbolic, table, equation, or derivation representation;
3. safely withheld representation with a machine-readable reason; or
4. replacement asset required.

Keep raw figure coverage as a debt signal only. Do not use it as a release gate that pressures authors to reattach mismatched fixed exemplars.

**Definition of done:** zero unsafe rendered representations; every withhold has a source reason; replacement debt is grouped by reusable mathematical model rather than by isolated lesson row.

### Phase 3 — Evidence-backed World Atlas enrichment

**Goal:** make the existing world more useful without inventing educational relationships.

- Keep landmarks, region state, review paths, and instruments derived from learner evidence.
- Add cross-course connections only after a prerequisite/transfer model and source data support them.
- Keep unavailable states explicitly unavailable rather than presenting fictional progress.
- Improve instrument mapping only where mastery evidence can explain why the instrument is relevant.

**Definition of done:** every displayed trail, connection, or unlock has a traceable data source and an accessible textual explanation.

### Phase 4 — Surface coherence and mobile polish

**Goal:** make the learner shell, atlas, and supporting surfaces feel like one product without overwhelming lessons.

- Retire the remaining non-core instructional-colour debt through semantic token use.
- Audit Trailhead, Atlas, Basecamp, Journal, Review, and Daily surfaces at phone and desktop breakpoints.
- Preserve direct access to lessons, review, and return paths in every presentation mode.
- Use decorative imagery only when it improves orientation, comprehension, or emotional clarity.

**Definition of done:** consistent semantic colour use, no critical mobile clipping, no mode-specific loss of learner actions, and no world chrome competing with the task.

### Phase 5 — Validate value with learners

**Goal:** establish that the atlas improves learning navigation rather than merely looking coherent.

Run small, representative learner studies across early elementary, upper elementary, and high-school routes. Measure:

- ability to find the next appropriate task;
- ability to return to unfinished or due review work;
- understanding of prerequisites and progress;
- completion and recovery after an error; and
- distraction or confusion caused by presentation mode.

Only after this evidence should optional work such as audio, richer story layers, offline/PWA capability, or further reward design be scheduled.

## 6. Release gates

Every release affecting learner content or the world must pass:

- current source-sealed derived artifacts;
- content schema, pedagogy, CML, TypeScript, and scoped lint checks;
- zero unsafe figure/text/numeric/direction conflicts;
- browser checks at 390px, desktop, 200% zoom, keyboard-only, and reduced motion;
- accessible name/description parity for interactive and SVG models;
- deterministic queue/card/portfolio/cache verification; and
- targeted learner-route regression checks.

## 7. Ownership and operating rules

- **Source work:** implement only bounded, evidence-backed root causes; preserve evaluator truth and stable IDs.
- **Shared renderers:** fix systemic behavior once, then prove it across every consumer.
- **Derived artifacts:** rebuild serially from a frozen source tree; do not concurrently mutate sources.
- **World data:** generated from curriculum/progress evidence; never hand-edit the manifest.
- **Assessments:** independently review a source packet before appending dispositions.
- **Stop rule:** if an exact visual or educational relationship cannot be proved, withhold it and record replacement debt.

## 8. Immediate priorities

1. Complete the Phase 0 evidence rebuild and world-manifest freshness check.
2. Apply the fresh Phase 1 accessibility audit to the highest-leverage shared root causes.
3. Establish the Phase 2 semantic-coverage contract and migrate reporting away from raw visual-count pressure.
4. Only then enrich Atlas connections and instruments using real prerequisite and transfer evidence.
