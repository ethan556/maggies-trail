# Grade 3 — Pattern Valley Pilot (Phase C/D)

**Scope wired:** the pilot region (`pattern-valley`, 10 trails / 36 landmarks) plus the
transitive prerequisite closure needed for correct approach evaluation. Every other grade keeps
its existing UI untouched — §31 requires the pilot to pass before any rollout.

## Surfaces

| Surface | Route | §  | What it answers |
|---|---|---|---|
| Trailhead | `/trailhead` | 10 | where am I · the ONE next action · what needs maintenance · what else is open |
| Atlas | `/atlas` | 11 | all 14 regions, map + semantically equivalent list |
| Basecamp | `/basecamp/[courseId]` | 12 | trail purpose, approach trails, landmark sequence, next action |
| Field Journal | `/journal` | 17 | established takeaways by trail, with route state |
| Instruments | Trailhead panel | 9 | which transferable ideas are discovered/assembled/calibrated |
| Return Paths | Trailhead panel | 16 | why a concept returned, which rung, how to restore it |

## §32 adversarial review — answered against the running pilot

1. **Theme improves understanding?** Partly. Region/landmark framing gives the curriculum a
   navigable shape and Return Paths explain retention in terms a learner can act on. The map
   itself is orientation, not instruction — honest answer: *supports*, does not teach.
2. **Next action instant?** Yes — one `h1`, one primary action, asserted by test at 360 px.
3. **Decoration competing?** No. The only art is the region map, dropped entirely in Minimal.
4. **Colour shortcuts?** No. Walked/unwalked carries `sr-only` text; asserted by test.
5. **Map hides structure?** No — the list is the primary path and carries every region.
6. **Young learner understands?** Unverified. No G3 learner has used this; the copy is
   plain-language but untested with children.
7. **Older learner patronised?** N/A — pilot is G3 only.
8. **Works in Minimal?** Yes — mode-equivalence tests assert identical routes and controls.
9. **Progress = real evidence?** Yes. Completion alone discovers no instrument (tested).
10. **Coherent outside player?** Yes for the four new surfaces; the older surfaces
    (`/dashboard`, `/courses`) are untouched and still look like the previous product.
11. **Teacher/parent restrained?** Not addressed — Phase C changed no adult surface.
12. **Usable in grayscale?** Believed yes (no colour-only state); not measured in grayscale.
13. **Fast on low-end?** Bundles are 1.5–3.6 kB per route; not profiled on real low-end hardware.
14. **Bespoke, not templated?** The map is drawn from grade-band elevation, so the picture is
    made of the data. The rest is the existing design system, deliberately.

**Verdict:** the pilot passes the structural questions (2–5, 8, 9). It does not yet answer
6, 11, 12, 13 with evidence, and 1 and 10 are honestly partial. Those are the gaps a Phase E
review must close before rollout.

## S201 parity closure and rollout review

S201 did not widen the world until the pilot's capability regressions were closed in order.
The shipped sequence was:

1. Atlas search/filter/sort parity;
2. compact engagement support below the Trailhead's singular primary action;
3. Basecamp parity for every course, including transitive approach trails and the legacy syllabus
   affordances;
4. all-region Trailhead rollout and additional adversarial checks.

### Capability parity evidence

- **Atlas:** every one of 129 course titles is searchable in the client-side compact index, and
  every one of 1,667 lesson titles is searchable through the server endpoint without sending the
  252 KB world manifest or full lesson-title corpus on initial load. The semantic region list is
  filtered; the map is never the sole result path.
- **Trailhead:** daily goal, XP, streak, league, freeze disclosure, and the shared mastery
  recommendation render after the primary action. The action remains singular and is still
  selected by `dominantAction`.
- **Basecamp:** `/basecamp/[courseId]` resolves every course. The slice includes the complete
  transitive prerequisite closure, and a cross-region fixture pins sliced derivation to full
  derivation. Scope, progress, continue/rewalk, practice, test-out, entitlement disclosure,
  waypoint minutes, route rail, and Mastery Studio are retained.
- **Canonical course surface:** `/courses/[slug]` permanently redirects to Basecamp. There is no
  second independently maintained course UI.
- **Regions:** every Atlas region enters a region-specific Trailhead; Basecamp is global.

### §32 adversarial review after S201

1. **Theme improves understanding?** Partial but stronger. Hierarchy, maintenance explanations,
   prerequisite approaches, and evidence-gated instruments support orientation and retention.
   The map itself remains orientation, not instruction.
2. **Next action instant?** Yes by source contract and tests: one `[data-primary-action]` precedes
   compact support metrics in DOM order.
3. **Decoration competing?** No new decoration was added. Minimal mode still removes the map.
4. **Colour shortcuts?** No new colour-only state. Grayscale browser coverage was added.
5. **Map hides structure?** No. The filtered accessible list remains the semantic path.
6. **Young learner understands?** **Unverified.** No child-comprehension study was performed and
   no proxy metric is claimed as a substitute.
7. **Older learner patronised?** Structurally improved by region-specific rollout, but not yet
   validated with older learners.
8. **Works in Minimal?** Mode-equivalence tests now include search/filter/sort controls as well as
   routes; presentation flags remain unable to reach derivation.
9. **Progress = real evidence?** Yes. S201 did not alter reveal or derivation policy.
10. **Coherent outside player?** Stronger: Atlas, Trailhead, Basecamp, Return Paths, and Journal
    now form one global route. Legacy Dashboard remains available rather than being silently
    deleted.
11. **Teacher/parent restrained?** Structurally checked: `/family` and `/teach` remain outside the
    region-map shell. Human visual review remains outstanding.
12. **Usable in grayscale?** Automated grayscale and forced-colors cases were added. Execution in
    this audit environment remains unverified because dependencies could not be installed.
13. **Fast on low-end?** A repeatable Chromium 4x CPU-throttled trace test was added. Real low-end
    hardware remains unverified; CPU throttling is a proxy, not a replacement.
14. **Bespoke, not templated?** The data-derived map and evidence-derived route states remain.
    S201 prioritised capability parity over adding visual novelty.

### Honest gate status

Dependency-free world, voice, colour, math-format, visual-explanation, registration, test-group,
and generator guards pass in the S201 working tree. The new Vitest and Playwright cases were
added but could not be executed in this sandbox because `npm ci` could not resolve registry
packages. Young-learner comprehension and real low-end-device testing remain explicitly open.
