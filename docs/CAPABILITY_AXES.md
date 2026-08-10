# Capability axes — level definitions for `scripts/engine-capabilities.json`

Documentation of an existing system, not a new one. Every definition below comes from grouping the
126 registered widget types by their current score on each axis, then reading a sample at each
level — spec in `src/lib/schema.ts`, component in `src/components/widgets.tsx` — for what engines
at level *N* genuinely have in common that level *N−1* lacks. Where a session report already
adjudicated a case, that precedent is cited and followed, not re-argued.

## How these scores are used

Two consumers read this table.

1. **Engine grade** — `scripts/measure/engine-matrix-s121.mjs`, the formula this task specifies:
   `D` if `conseq=0 ∨ a11y=0 ∨ mobile=0 ∨ Σ≤8`; else `A` if `manip≥2 ∧ conseq≥2 ∧ err≥2 ∧ Σ≥17`;
   else `B` if `manip≥2 ∧ conseq≥2 ∧ Σ≥13`; else `C`. Computed fresh against the table as it stands
   today: **A 65 · B 44 · C 12 · D 5** (126 types).
2. **Lesson tier** — `scripts/flagship-tier.mjs`, a 13-dimension superset. Per lesson, `manip` and
   `conseq` are the **max** over its widget steps (the best step carries it); `a11y`/`mobile`/
   `polish` are the **min** (the worst step drags it down); `adapt` combines engine wiring with
   authored remedials. The asymmetry is deliberate — richness credited on the best evidence,
   delivery quality bounded by the worst — and it is the system behind every "A 608 · B 199 · C …"
   count in the session reports. `err` is *not* read here; it feeds only the engine grade above.

Two mechanical contracts already pin part of the table (`src/lib/engineCapabilities.test.ts`):
every type carries all seven dimensions in 0–3 (TOTALITY); `adapt=3` must exactly match components
whose body wires `onEvent`, checked per-component against `widgets.tsx` (CONSISTENCY); `err=3`
engines must be backed, in aggregate, by a reveal-ghost testid; and
`dragBucket`/`buildExpression`/`matchPairs`/`dragOrder` are pinned to `manip ≤ 1` by name. Only
`manip` had written level prose anywhere in the repo before this file (S205M); the other six are
documented here for the first time.

Current distribution per axis (0/1/2/3, out of 126): manip 6/11/76/33 · conseq 2/5/51/68 · err
0/10/**0**/116 · adapt 63/**0**/5/58 · a11y 0/0/7/119 · mobile 0/3/83/40 · polish 0/0/55/71. The
bolded zeros matter: `err` and `adapt` are declared 0–3 but no engine has ever scored a 2 or a 1
respectively — both already behave as near-binary axes, which the definitions below make explicit.

## manip — does the learner manipulate a mathematical model?

Reproduced from `src/lib/engineCapabilities.test.ts` (S205M, pinned). S207 individually
adjudicated every engine currently at `manip=1` against this text and lifted none
(`SESSION207_EXECUTION_REPORT.md` §3). This is the one axis with prior written precedent; the
other six extend its method, not its wording.

**0** — no arrangement or construction action exists at all; the learner selects from a fixed set
or types a value. Examples: `mcq`, `numeric`, `fractionEntry`, `subitizeFlash`. *Not earned by*:
feedback richness layered on top — a dashed reveal-ghost chip doesn't change what the learner did
to reach it.

**1** — the learner arranges, places, or toggles GIVEN static elements — orders tokens, drags into
buckets, matches pairs, slots a comparison symbol — but no mathematical MODEL computes a new
dependent state in response. Pinned by name: `dragBucket`, `buildExpression`, `matchPairs`,
`dragOrder`. Also here: `placeCompare`, `rationalCompare`, `exactNumberLab` (mode floor).
*Not earned by*: a BETTER placement gesture — `dragBucket` already has full drag-and-drop and
stays at 1 because "dragging a label into a box is not manipulating a model" (S205M). A live
readout that parses the arrangement (`buildExpression`'s `reads:` line) is `conseq`'s achievement,
not `manip`'s.

**2** — the learner manipulates a model whose dependent quantities visibly respond: a beam that
tips, a curve that redraws, a machine that transforms an input, a candidate sliding against
derived landmarks. Examples: `functionMachine`, `balanceScale`, `lineExplore`, `fractionBar`.
*Not earned by*: level 3's compounding — a single continuous control moving one parameter of one
model is what caps an engine at 2, not a defect in it.

**3** — the manipulated object is itself compound, or handled directly in its own coordinate space
rather than through a proxy control: dragging a point/vertex/vector where it actually lives (not a
slider standing in for it), fitting a line against many data points at once, a multi-step
construction, a model built from several jointly-adjustable named attributes. Examples:
`plotPoint`, `scatterFit`, `vectorExplore`, `compassConstruct`. *Lower confidence*: unlike 0/1/2,
this line has no equivalent written adjudication history — S205M and S207 both stop at defining
"≥2." Treat the 2-vs-3 boundary as this document's own inference, not reproduced precedent.

## conseq — does a visible mathematical consequence result from the learner's action?

**0** — answering produces no rendered mathematical object at all; a click or keystroke, then a
later right/wrong. Both current members: `mcq`, `numeric`. The engine-grade `D` rule treats
`conseq=0` as an automatic defect (same bucket as `a11y=0`/`mobile=0`), not merely "low."

**1** — a minor derived judgment or decorative preview exists beyond raw equality, but nothing that
functions as a legible mathematical picture. Examples: `fractionEntry` (a value-vs-form distinction
gates its reveal ghost, but there is no rendered fraction), `pointEntry` (its mini-grid dot/vector
is `aria-hidden`, i.e. explicitly not a first-class output), `radicalCheck`, `subitizeFlash`.
*Not earned by*: a preview that is hidden from meaning, gated to one narrow state, or not itself a
legible object.

**2** — a genuine mathematical representation renders and updates live as the learner acts: a bar
sized by the typed fraction, a structural highlight, a parsed-and-evaluated readout. Examples:
`fractionBar`, `rationalCompare` (the deciding num/den/sign structure lights up), `buildExpression`
(the `reads:` line evaluates the build), `ratioTable`. *Not earned by*: level 3 — a representation
that directly, singly renders the input is a complete level-2 engine, not an unfinished level-3 one.

**3** — the consequence is compound, or is itself the graded object: several dependent parts change
together (a scale with two pans, a rectangle whose partial-product cells fill in, a phantom
intersection rendered alongside its visible cause), or the same live model drives both the
interaction and the grading. Examples: `functionMachine`, `algebraTiles`, `balanceScale`,
`extraneousRootLab`.

## err — does wrong-answer feedback teach the specific error, not just mark it wrong?

Two mechanisms earn this axis its top score, and the pinned test's own comment names only the
first: "`errorTeach=3` requires a reveal-ghost testid to exist in `widgets.tsx` (the ghost grammar
is what that score MEANS)." The second — live per-move direction cues from
`src/lib/processEvents.ts` (`MULTI_CONTROL` engines) — is real but never folded into that sentence.

**1** — the widget marks an answer right/wrong, possibly with a reveal chip stating the correct
value, but feedback isn't tied to a diagnosed misconception or a responding model — presentation,
not error-teaching. Examples: `mcq`, `numeric`, `fractionEntry`, `pointEntry`, `radicalCheck` all
gained a dashed-tangerine reveal ghost in S206–S207 and *still* sit at 1, explicitly: "tone
decoration is presentation, not a new err-teach mechanism… which these static surfaces still do
not have" (`SESSION207_EXECUTION_REPORT.md` §2e). `rationalCompare`, `buildExpression`,
`toggleExplore`, `subitizeFlash` likewise. This is the clearest refusal clause on the whole table:
**a ghost chip is necessary but not sufficient.**

**2** — unused by any of the 126 current rows.

**3** — feedback is specific to what the learner actually got wrong. Most commonly a reveal-time
ghost contrasting a genuinely-computed wrong state against the correct one, ideally across several
distinguishable misconception paths (`extraneousRootLab` names five: phantom picked, not squared,
sign region, domain confusion, success). In the live-manipulation "Lab" engines the same job is
done differently — real-time `toward`/`away`/`oscillating`/`one-control-fixation` cues computed
from the model, with engine-specific copy for some (`hundredthsGrid`, `numberLinePlace`,
`quadraticExplore`). *Not earned by*: a ghost that only restates the answer on an otherwise-static
surface (that's level 1); a live-cue stream that never rises above the `GENERIC` fallback copy in
`processEvents.ts` is the weakest form of this level and the most contestable — see below.

## adapt — does the engine report per-move process evidence?

Defined by the codebase itself: `onEvent` in `WProps` is a "process-evidence sink… Instrumented
engines report each meaningful move's relation to the step's target; surfaces that don't adapt…
simply omit it" (`widgets.tsx`, the `WProps` interface). `adapt=3` is exactly "the function body
invokes `onEvent`," mechanically pinned.

**0** — the component never invokes `onEvent`; no per-move evidence leaves the widget. The majority
default (63 of 126). Examples: `mcq`, `dragBucket`, `slider`, `algebraTiles`.

**1** — unused by any of the 126 current rows.

**2** — used by exactly five engines: `barBuilder`, `graphRead`, `exactNumberLab`,
`pointSetReasoningLab`, `hundredthsGrid`. See the honesty check — this level does not correspond to
one consistent technical state across its own members.

**3** — the component invokes `onEvent` from its answer control(s), reporting direction against the
step's target. Examples: `pointEntry`, `functionMachine`, `balanceScale`, `lineExplore`.

## a11y — is the interface operable and legible through assistive technology?

Nearly saturated (119/126 at level 3); the interesting content is in the small level-2 remainder.

**2** — solid native semantics (labeled inputs, `role="radiogroup"`/`role="radio"`, native
`<button>`, 44px targets) but no exposed description of a VISUAL model, because most of these seven
have none to expose. All seven current members: `mcq`, `numeric`, `fractionEntry`, `pointEntry`,
`radicalCheck`, `steppedReveal`, `subitizeFlash`. `pointEntry` is the clean case: its one piece of
visual richness, a mini-grid drawing the entered point, is rendered `aria-hidden="true"` —
deliberately not exposed, consistent with staying off level 3.

**3** — the interface additionally exposes the STATE of a visual/graphical model to assistive tech
— `role="img"` with a state-dependent `aria-label`, or an `aria-live` region reporting the model's
state as it changes — not just interactive-control semantics. Examples: `rationalCompare` (operand
cards are `role="img"` with computed labels; the chosen comparison symbol is announced via
`aria-live`), `buildExpression`, `plotPoint`, `functionMachine`. *Not earned by*: perfect button/
input semantics alone, if a visual model exists and is hidden rather than described (see
`pointEntry` above) — though `subitizeFlash`, in the honesty check, complicates this.

## mobile — is the interaction viable one-thumb on a small screen?

Grounded in the repo's own standard, `docs/CML_INTEGRATION_MAP.md` (~line 115): "Keep 44-pixel
targets, keyboard parity, reduced-motion behavior, and stable layouts." Keyboard parity is carried
by the `a11y` axis (near-saturated) and reduced motion is handled centrally (`src/lib/motion.ts`,
`globals.css`) almost everywhere, so this axis's spread tracks the other two clauses: touch-target
size, and whether a discrete alternative exists to a fine continuous drag.

**1** — the primary interaction is fine-motor pointer dragging on an SVG canvas with no large
discrete alternative, and/or its one control has no explicit sizing at all. Examples:
`compassConstruct` (a compass-arm drag plus one unstyled `<input type="range">`, zero
button-sized targets anywhere), `matrixTransform`. Three engines total sit here.

**2** — the default baseline (83 of 126). Standard controls are present and usually *intended* at
≥44px on the primary buttons (`min-h-11` / `min-h-[44px]`), but the core manipulation is often a
single slider or drag with no stepped alternative, and/or one non-decorative control undershoots
44px in one dimension. Example: `columnCalc`'s digit-token buttons carry `min-h-[44px]` but only
`min-w-[40px]` — under width even where height clears it. Also here: `functionMachine`, `slider`.

**3** — every primary interactive control is sized ≥44px in both dimensions in source, and/or the
design offers a discrete tap/stepper alternative alongside fine dragging. Example: `barBuilder`'s
tally/pictograph modes exist specifically to add "native, min-h-11, aria-labeled" per-category
+/− stepper buttons, and its mobile score moved 2→3 in the same session that added them
(`SESSION_NOTES.md`, S185). Also here: `mixedRegroup` (`min-h-[44px] w-14` throughout),
`triangleConstraintLab`.

*Caveat*: source-level class scanning cannot fully verify a RENDERED pixel size — padding,
box-sizing and layout all matter, and `min-h-[44px]`-style arbitrary values undercount under naive
greps. The one time this repo measured mobile targets, it used a real browser at a real viewport,
not classes. Treat this axis's findings as source-level indicators, not measurements.

## polish — does the interface carry deliberate visual/motion craft, not just correctness?

The axis held with least confidence. `extraneousRootLab`'s own capability-table entry states the
reasoning directly (`CONVERSION_LOG.md`, Block 6): `polish: 2` — "GhostChip reveal and rendered
reflect-region, but no transitions — which also means the base render IS the final state, so
reduced motion needs nothing." That is the clearest citable precedent this axis has.

**2** — functionally complete and correctly styled, but state changes SNAP rather than settle — no
dedicated motion beyond the shared global press/hover primitives (`.pressable`), so reduced motion
has nothing extra to gate. Examples: `extraneousRootLab`, `functionMachine`, `riemannSum`.

**3** — carries authored motion: a value eases toward its new position (`MOTION.settleMs`,
`glideStyle()` in `src/lib/motion.ts`), a placed object "pops" or arrives with a keyframe (e.g.
`plotPoint`'s `pp-pop` animation on each placed dot), or a domain-specific reveal choreography
beyond the bare ghost — the "Trail Ghost" arrival treatment named in `UX_POLISH_SESSION_101.md`
(Session 106: "one attribute-suffix rule gives all 91 ghost sites the same orchestrated arrival…
both reduced-motion gates emit nothing"). Always gated behind `prefers-reduced-motion:
no-preference`. Examples: `plotPoint`, `dragOrder`, `matchPairs`, `fractionBar`.

*Honest limitation*: two mechanical proxies were tried (Tailwind `transition`/`motion-reduce:`
classes; calls to the shared motion helpers) and neither cleanly separated the 2s from the 3s —
both fired on roughly the same fraction of each group (~30% either side, across all 126 engines).
Either the proxies are too coarse, or `polish` is a more holistic craft judgment than one technical
marker can capture. Treat the level-3 examples as read individually, not a generalizing rule.

## The honesty check

Applying the definitions above to all 126 rows surfaces **five findings**: two well-evidenced
score/definition mismatches, one structural finding that a whole score level (`adapt=2`) matches
no consistent technical state, and two findings where a plausible alternative reading (live cues
instead of a ghost; no visual model to expose) keeps the current score defensible. No score was
changed to produce or avoid any of these.

| engine(s) | axis | current | definition says | more likely wrong |
|---|---|---|---|---|
| `exactNumberLab` | adapt | 2 | 3 | **the score.** Its component invokes `onEvent` from the reveal control, the numeric magnitude-rail drag, the typed-numeric field, and the choice buttons — the same pattern that earns every other engine a 3. Invisible to the pinned mechanical test only because its signature `{spec,value,onChange,disabled,tone,onEvent}:WProps<TExactNumberLab>` has no space before `WProps`, which the test's regex requires — this engine has never actually been checked by the contract meant to police this axis. |
| `barBuilder`, `graphRead`, `pointSetReasoningLab`, `hundredthsGrid` | adapt | 2 | 0 | **ambiguous, but see open questions.** None of the four invoke `onEvent` anywhere in current source — structurally identical, by the mechanical rule that pins `adapt=3`, to every `adapt=0` engine. |
| `rotationLab` | err | 3 | ≤ 1 | **the score.** No `tone`-gated feedback of any richness exists. The component's only tone-conditioned output is `{tone ? <p className="text-sm">{tone}</p> : null}` (`widgets.tsx`, `RotationLabW`) — printing the literal `StageTone` token (`"info"`/`"error"`/`"success"`) as visible text, not diagnostic copy. Reads as leftover placeholder markup, not a graded feature. |
| `triangleConstraintLab`, `coordinateProofLab`, `solidSliceLab`, `verticalLineScanner`, `covariationScrubber`, `unitRuler`, `triangleAngleLab`, `samplingBiasLab`, `shapeFamilyBuilder` | err | 3 | contested | **ambiguous.** None of these nine accept a `tone` prop, so none can render the reveal-ghost contrast the pinned test's comment says `err=3` *means*. All nine are in `processEvents.ts`'s `MULTI_CONTROL` set and emit live per-move direction cues — but most fall through to the `GENERIC` cue table rather than engine-specific copy, a state `KNOWN_ISSUES.md` already calls "a deliberate choice, not rot." Whether a live generic cue equals a reveal ghost is a judgment call this document should not make. |
| `subitizeFlash` | a11y | 2 | plausibly 3 | **ambiguous, leaning score.** Its dot pattern carries `role="img"` with a state-dependent `aria-label` (`"${spec.count} dots"` / `"dots hidden"`) in the base render, not just at reveal — the same pattern that earns `rationalCompare` a 3. Unlike `pointEntry` (whose comparable visual is `aria-hidden`, correctly consistent with staying at 2), there is no equivalent "deliberately not exposed" reading here. |

`conseq`, `mobile`, and `polish` produced no individually-verifiable contradiction at the same
confidence bar as the four axes above — not because they are clean, but because this session could
not build a mechanical proxy reliable enough to trust an individual verdict (see each section's
caveats). That is a limitation of this pass, not a clean bill of health.

## Open questions

1. **`adapt=2` looks vacuous.** Its five members split evenly between "indistinguishable from 0"
   (four engines, zero `onEvent` presence) and "indistinguishable from 3" (`exactNumberLab`, full
   `onEvent` presence). No reading of the source produced a technical property a middle level
   should track. Best guess: a marker applied when an engine was touched during an adaptivity push,
   independent of whether wiring landed — process residue, not a capability. Recommend retiring
   level 2 here or re-examining its five members on purpose.
2. **`err=2` and `adapt=1` are simply unused** (0 of 126 each) — not a contradiction, but worth
   naming so a future session doesn't assume the declared 0–3 range is live everywhere.
3. **`a11y=2` is a small, possibly-stale cluster**, not a designed tier: all seven members are the
   oldest "answer surface" kinds, and at least one (`subitizeFlash`) has since gained accessibility
   work that looks like it clears the level-3 bar demonstrated elsewhere, unrevisited — the same
   shape of gap that stalled the `mobile` axis, just never named.
4. **`manip`'s 2-vs-3 boundary is this document's weakest inference.** 0 vs 1 vs 2 all have
   multi-session written adjudication behind them (S205M, S207); 2 vs 3 does not.
5. **`mobile` cannot be fully verified from source.** Rendered touch-target size is a computed
   layout property; class-scanning both undercounts (arbitrary-value syntax) and overcounts
   (decorative elements share controls' class vocabulary). A trustworthy audit needs the
   real-browser measurement this axis has used exactly once, not a wider grep.
6. **`polish` may not be a single axis.** The craft judgments bundled into it — motion, reveal
   choreography, hover language, visual density — didn't move together under either mechanical
   check this session ran. Whether the checks were too crude or the axis is really two or three
   axes wearing one name is left open.
