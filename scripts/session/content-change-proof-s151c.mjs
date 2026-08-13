#!/usr/bin/env node
// Session 151-completion content-change proof.
// Baseline: the sealed SESSION151_LESSON_HASHES.json. This proof pins the EXACT set of lesson
// files that changed after that ledger was sealed, with the reason class for each:
//   late-wave      — the interrupted late-S151 step-conversion wave (mcq/numeric -> Lab engines),
//                    including further conversions inside the S150 target cg-01-03 (each surface
//                    there is per-widget proven against its sealed legacy baseline by the s150 audit),
//                    applied after the S151 ledger and recorded nowhere; every surface verified
//                    answer-sound against derived truth in S151C (see SESSION_NOTES).
//   null-repair    — deletion of the invalid `"answerUnit": null` key the same wave wrote into
//                    six remedial widgets (schema is z.string().optional(); null blocked
//                    validate:content). One-line deletions; display-only field.
//   values-repair  — rns-02-01 k1/i2/ch1: `values` populated so the exploration gate is
//                    satisfiable (empty values made canCheck permanently false).
//   stage-merge    — rns-01-01/i2: authoredStages 3->2 (third stage was unreachable; merge is
//                    byte-pinned inside scripts/audit/quotient-reasoning-s146.py).
// Files carrying both a late-wave conversion and a null-repair are classed late-wave+null-repair.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const prior=JSON.parse(readFileSync(join(root,'SESSION151_LESSON_HASHES.json'),'utf8')).files;
const sha=b=>createHash('sha256').update(b).digest('hex');
const AUTHORIZED={
  'content/courses/curve-analysis/lessons/ca-03-01.json':'retro-ledger-s237 (changed by commit 97a0b72 «Complete S225 engines and S226 premium shell», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/data-distributions/lessons/dd-02-03.json':'retro-ledger-s237 (changed by commit dd00768 «Repair the unanswerable item and the 4 safe wording defects», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/derivative-rules/lessons/dr-03-02.json':'retro-ledger-s237 (changed by commit cdddd79 «Complete closure waves 2-4 and math rendering», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/exponents-polynomials/lessons/ep-02-01.json':'retro-ledger-s237 (changed by commit cdddd79 «Complete closure waves 2-4 and math rendering», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/fractions-add/lessons/fa-03-01.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/fractions-multiply/lessons/fm-03-01.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/fractions-multiply/lessons/fm-03-02.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/fractions-multiply/lessons/fm-03-03.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/fractions-multiply/lessons/fm-05-02.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/fractions/lessons/fr-03-02.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/fractions/lessons/fr-04-02.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/fractions/lessons/fr-04-04.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/integration-accumulation/lessons/in-05-01.json':'retro-ledger-s237 (changed by commit 97a0b72 «Complete S225 engines and S226 premium shell», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/linear-equations-systems/lessons/les-03-01.json':'retro-ledger-s237 (changed by commit 4b66fe1 «S231-S236 premium learner experience checkpoint», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/lines-angles/lessons/la-01-02.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/lines-angles/lessons/la-02-02.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/lines-angles/lessons/la-03-02.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/measurement-data/lessons/md-01-02.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/multiplication-division/lessons/mult-01-04.json':'retro-ledger-s237 (changed by commit dd00768 «Repair the unanswerable item and the 4 safe wording defects», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/multiply-bigger/lessons/mb-01-03.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/proportional-relationships/lessons/pr-03-02.json':'retro-ledger-s237 (changed by commit 7e6ac5b «Put the unitRate engine to work: pr-03-03, pr-03-02, and the variant path», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/shapes-space/lessons/geo-01-03.json':'retro-ledger-s237 (changed by commit 9eccf27 «Apply two S237 rulings: fractionBar targets, and K-4 wording», whose session did not add a ledger entry; certified here from that commit record, not re-derived)',
  'content/courses/fractions-add/lessons/fa-04-02.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as whole bars plus a remainder; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions-add/lessons/fa-05-01.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as whole bars plus a remainder; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions-add/lessons/fa-05-02.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as whole bars plus a remainder; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions-multiply/lessons/fm-02-01.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as whole bars plus a remainder; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions/lessons/fr-03-03.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as whole bars plus a remainder; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/volume-measurement/lessons/vm-02-02.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as whole bars plus a remainder; answer, tolerance, unit and every commonErrors entry byte-identical) + s237-line-plot-drawn (display-only plotData added to k1/k2/k3/ch1 — the four absent-diagram rows whose prompts DESCRIBE a line plot in ASCII that was never drawn. Purely additive: 52 inserted lines, 0 deleted; every prompt, answer, hint, trap and feedback string byte-identical, and grading is asserted identical with and without the field in widgets.plotData.s237.test.tsx. Each declared plot is re-derived from its own prompt AND cross-checked against the frozen answer by src/lib/content.plotData.s237.test.ts) + s238-line-plot-family (display-only plotData added to the lesson\'s two remaining family rows: i2 fractionEntry and the rem-lo-k remedial mcq — the same additive contract, prompts/answers/feedback byte-identical, certified by the same two test files)',
  'content/courses/volume-measurement/lessons/vm-02-01.json':'s238-line-plot-family (display-only plotData added to k1 mcq / k2 numeric / ch1 numeric / rem-rl-k numeric — four absent-diagram rows whose prompts DESCRIBE the plot in ASCII arrow notation. Purely additive: every prompt, answer, option, hint, trap and feedback string byte-identical; each declared plot re-derived from its own prompt AND cross-checked against the frozen answer or correct-option label by src/lib/content.plotData.s237.test.ts; the three variant forms serving k1/k2/ch1 — fractionMode, fractionTotal, atOrAbove — now emit the same plotData block on every re-ask)','content/courses/data-distributions/lessons/dd-02-01.json':'s238-glyph-ruling (i1: display-only plotData added with glyph dot — the step asks the learner to count the dots in a pets plot the screen never drew; the dataset is c1 own frozen sentence, pets data 0,1,1,2,2,2,3,4 = stacks 1,2,3,1,1, re-derived by two routes in src/lib/content.plotData.s237.test.ts and cross-checked against the frozen answer 3. Every prompt, answer, trap and feedback byte-identical. User-ruled 2026-08-12; k2 stays excluded by the mcq leakage policy.)','content/courses/measurement-data/lessons/md-03-04.json':'s238-mixed-axis-ruling (k1/k2/ch1: display-only plotData added with labelStyle mixed — the shared formatter gained a mixed-number mode so the axis writes 2\u00bd exactly as the frozen prompts do, instead of 5/2. Datasets re-derived from each prompt by the corpus contract and cross-checked against the frozen answers/keyed options; the three variant forms serving these rows — default, totalCount, halfMarks — now print half-marks in the same \u00bd notation and emit the plot on every re-ask. Every prompt, answer, option, trap and feedback byte-identical. User-ruled 2026-08-12.)','content/courses/measure-convert/lessons/mc-05-02.json':'s238-mark-order-ruling (k2: the prompt listed its three marks out of axis order — 1/2, 3/4, 5/8 — while a plot axis must increase; reordered to 1/2, 5/8, 3/4, and explanationVariants[0] reordered to match. Answer, unit, traps, feedback and every other byte identical. User-ruled 2026-08-12.) + s238-line-plot-family (k2: display-only plotData added — values 4/8, 5/8, 6/8 over den 8, the now-ascending marks; its mcLinePlotBuildNumeric variant form emits the placed-marks plot on every re-ask)',
  'content/courses/fractions-add/lessons/fa-01-01.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions-add/lessons/fa-03-03.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions-add/lessons/fa-04-01.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions-add/lessons/fa-04-03.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions-multiply/lessons/fm-01-02.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions-multiply/lessons/fm-01-03.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/fractions/lessons/fr-03-01.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/integration-applications/lessons/ia-04-01.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/measure-convert/lessons/mc-05-01.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
  'content/courses/measure-money-time/lessons/mmt-05-01.json':'s237-picture-graph-read (k1/k2/k3/ch1 and the remedial check converted numeric -> graphRead picture mode so the picture graph the prompt names is actually drawn; prompt, commonErrors and fallbackFeedback carried verbatim, successFeedback added because graphRead requires one, variant form MmtPictureGraphNumeric -> MmtPictureGraphRead)',
  'content/courses/multiply-bigger/lessons/mb-04-03.json':'s237-numeric-fraction-preview (display-only previewDenominator added to fixed-denominator numerator steps so the entry draws as entered/den on the shared partition bar; answer, tolerance, unit and every commonErrors entry byte-identical)',
 // S200: §22 visual-explanation repair — figure repair ONLY. Each of these three lessons gained
 // exactly one `"figure": "<registered-id>"` key on each of its two concept steps, inserted
 // directly after `body`. No prose, answer, hint, id, order or widget byte changed (diff is
 // 10 lines per file: two comma additions + two new keys). Figures authored in figures.tsx and
 // registered via gen-figure-ids.mjs; verify:visual-explanations proves each id resolves.
 'content/courses/two-step-equations/lessons/tse-02-04.json':'S200 §22 figure repair (2 concept steps gained a registered figure id; nothing else changed)',
 'content/courses/two-step-equations/lessons/tse-02-05.json':'S200 §22 figure repair (2 concept steps gained a registered figure id; nothing else changed)',
 'content/courses/function-transformations/lessons/ft-05-04.json':'S200 §22 figure repair (2 concept steps gained a registered figure id; nothing else changed)',
 // S159: rad-04 wave onto geometricConstraintLab (independent derivation asserted per step;
 // baselines scripts/session/baselines-s159; ledger scripts/session/session159-applied.json).
 // S161: radical wave onto exactNumberLab. Each spec's truth was derived by exactNumberTruth
 // and asserted equal to the frozen authored answer BEFORE any write (28/28, zero mismatch);
 // prompts, tolerances and commonErrors->numericErrors preserved verbatim. Baselines
 // scripts/session/baselines-s161; ledger scripts/session/session161-applied.json.
 'content/courses/radicals-and-exponents/lessons/rad-01-01.json':'s161-exact-number-conversion',
 'content/courses/radicals-and-exponents/lessons/rad-01-02.json':'s161-exact-number-conversion',
 'content/courses/radicals-and-exponents/lessons/rad-01-03.json':'s161-exact-number-conversion',
 'content/courses/radicals-and-exponents/lessons/rad-02-01.json':'s161-exact-number-conversion',
 'content/courses/radicals-and-exponents/lessons/rad-02-02.json':'s161-exact-number-conversion',
 'content/courses/radicals-and-exponents/lessons/rad-02-03.json':'s161-exact-number-conversion',
 'content/courses/radicals-and-exponents/lessons/rad-03-01.json':'s161-exact-number-conversion',
 'content/courses/radicals-and-exponents/lessons/rad-03-02.json':'s161-exact-number-conversion',
 // S163: logarithm wave onto exactNumberLab (logarithmEvaluate / logarithmArgument). Each
 // spec's truth was derived and asserted equal to the frozen answer BEFORE any write
 // (11/11, zero mismatch); two approximation-based steps were rejected by the engine's
 // throw-rather-than-guess design and left unconverted. Baselines baselines-s163.
 'content/courses/logarithms/lessons/lg-01-01.json':'s163-logarithm-conversion',
 'content/courses/logarithms/lessons/lg-01-02.json':'s163-logarithm-conversion',
 'content/courses/logarithms/lessons/lg-02-01.json':'s163-logarithm-conversion',
 'content/courses/logarithms/lessons/lg-02-02.json':'s163-logarithm-conversion',
 'content/courses/logarithms/lessons/lg-02-03.json':'s163-logarithm-conversion',
 // S164: approximation wave. The approximationEvaluate task carries the AUTHORED constants
 // and stated rounding as spec inputs (log-table principle: a given constant used as an
 // input is not circular). Each spec asserted derived==frozen BEFORE write (hand-built
 // gate 11/11 plus these 4). Completes lg-cob/lg-exp-solve forms (S163 sibling rule).
 'content/courses/logarithms/lessons/lg-03-01.json':'s164-approximation-conversion',
 'content/courses/logarithms/lessons/lg-03-02.json':'s164-approximation-conversion',
 // S164: lg-03-03 log-equation wave (logarithmEqualArguments / logarithmSumQuadratic).
 'content/courses/logarithms/lessons/lg-03-03.json':'s164-approximation-conversion',
 // S165: a2-radicals wave (radicalEquationSolve / radicalEquationExtraneous / rationalExponentSolve / approximationEvaluate+sqrt / existing radical tasks).
 'content/courses/radical-functions/lessons/re-01-01.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-01-02.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-02-02.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-02-03.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-03-01.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-03-02.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-03-03.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-04-01.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-04-02.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-04-03.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-05-01.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-05-02.json':'s165-radical-wave',
 'content/courses/radical-functions/lessons/re-05-03.json':'s165-radical-wave',
 // S166: g12-limits-continuity (template-bank generator, both directions) and a2-statistics.
 'content/courses/limits-continuity/lessons/lc-02-03.json':'s166-calculus-stats-wave',
 'content/courses/limits-continuity/lessons/lc-03-02.json':'s166-calculus-stats-wave',
 'content/courses/limits-continuity/lessons/lc-04-01.json':'s166-calculus-stats-wave',
 'content/courses/limits-continuity/lessons/lc-04-03.json':'s166-calculus-stats-wave',
 'content/courses/limits-continuity/lessons/lc-05-03.json':'s166-calculus-stats-wave',
 'content/courses/statistical-inference/lessons/si-02-03.json':'s166-calculus-stats-wave',
 'content/courses/statistical-inference/lessons/si-05-02.json':'s166-calculus-stats-wave',
 // S167: calculus template-bank wave (in-definite-integral, in-constant-of-integration, dc-differentials).
 'content/courses/derivatives-in-context/lessons/dc-03-02.json':'s167-calculus-wave',
 'content/courses/integration-accumulation/lessons/in-01-03.json':'s167-calculus-wave',
 'content/courses/integration-accumulation/lessons/in-04-02.json':'s167-calculus-wave',
 // S168: g10-solid-geometry wave (volume, surface, density, scale modeling).
 'content/courses/solid-geometry/lessons/sg-01-02.json':'s168-solid-geometry-wave',
 'content/courses/solid-geometry/lessons/sg-02-03.json':'s168-solid-geometry-wave',
 'content/courses/solid-geometry/lessons/sg-03-03.json':'s168-solid-geometry-wave',
 'content/courses/solid-geometry/lessons/sg-04-02.json':'s168-solid-geometry-wave',
 'content/courses/solid-geometry/lessons/sg-04-03.json':'s168-solid-geometry-wave',
 'content/courses/solid-geometry/lessons/sg-05-02.json':'s168-solid-geometry-wave',
 'content/courses/solid-geometry/lessons/sg-05-03.json':'s168-solid-geometry-wave',
 // S169: g10-solid-geometry completion (Cavalieri, composites, sections, scale effects).
 'content/courses/solid-geometry/lessons/sg-01-01.json':'s169-solid-geometry-completion',
 'content/courses/solid-geometry/lessons/sg-01-03.json':'s169-solid-geometry-completion',
 'content/courses/solid-geometry/lessons/sg-02-01.json':'s169-solid-geometry-completion',
 'content/courses/solid-geometry/lessons/sg-02-02.json':'s169-solid-geometry-completion',
 'content/courses/solid-geometry/lessons/sg-03-01.json':'s169-solid-geometry-completion',
 'content/courses/solid-geometry/lessons/sg-03-02.json':'s169-solid-geometry-completion',
 'content/courses/solid-geometry/lessons/sg-04-01.json':'s169-solid-geometry-completion',
 'content/courses/solid-geometry/lessons/sg-05-01.json':'s169-solid-geometry-completion',
 // S170: a1-systems (linearSystemSolve) + g10-circle-theorems (approximationEvaluate) waves.
 'content/courses/circle-theorems/lessons/cr-03-03.json':'s170-systems-circles-wave',
 'content/courses/circle-theorems/lessons/cr-04-01.json':'s170-systems-circles-wave',
 'content/courses/circle-theorems/lessons/cr-04-03.json':'s170-systems-circles-wave',
 'content/courses/systems-equations/lessons/se-04-01.json':'s170-systems-circles-wave',
 'content/courses/systems-equations/lessons/se-04-02.json':'s170-systems-circles-wave',
 'content/courses/systems-equations/lessons/se-04-03.json':'s170-systems-circles-wave',
 // S171: g12-function-analysis (full) + g12-polynomial-rational-analysis subset (conjugate/coefficient/slant/root-finding).
 'content/courses/function-analysis/lessons/fna-04-01.json':'s171-precalc-wave',
 'content/courses/function-analysis/lessons/fna-04-02.json':'s171-precalc-wave',
 'content/courses/function-analysis/lessons/fna-04-03.json':'s171-precalc-wave',
 'content/courses/function-analysis/lessons/fna-05-01.json':'s171-precalc-wave',
 'content/courses/function-analysis/lessons/fna-05-02.json':'s171-precalc-wave',
 'content/courses/function-analysis/lessons/fna-05-03.json':'s171-precalc-wave',
 // S172: g12-polynomial-rational-analysis completion (rationalRootCandidateCount + polynomialZeroCount).
 'content/courses/polynomial-rational-analysis/lessons/pra-01-01.json':'s172-precalc-completion',
 'content/courses/polynomial-rational-analysis/lessons/pra-02-01.json':'s172-precalc-completion',
 'content/courses/polynomial-rational-analysis/lessons/pra-01-02.json':'s172-precalc-completion',
 // S173: g12-vectors-matrices COMPLETE (vectors/matrices arithmetic + whitelisted special-angle direction).
 'content/courses/vectors-matrices/lessons/vec-01-02.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-02-02.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-04-01.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-04-02.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-04-03.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-01-01.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-02-01.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-02-03.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-03-01.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-03-03.json':'s173-vectors-matrices-complete',
 'content/courses/vectors-matrices/lessons/vec-05-02.json':'s173-vectors-matrices-complete',
 // S174: polygon-angles COMPLETE (all 7 forms, pure arithmetic on n/sum/interior/exterior).
 'content/courses/polygons-quadrilaterals/lessons/pq-01-01.json':'s174-polygon-angles-complete',
 'content/courses/polygons-quadrilaterals/lessons/pq-01-02.json':'s174-polygon-angles-complete',
 'content/courses/polygons-quadrilaterals/lessons/pq-01-03.json':'s174-polygon-angles-complete',
 // S175: lg-ln (closes lg-04-02) + a2-polynomials + a2-rationals waves.
 'content/courses/logarithms/lessons/lg-04-02.json':'s175-log-poly-rational-wave',
 'content/courses/polynomial-functions/lessons/pf-01-01.json':'s175-log-poly-rational-wave',
 'content/courses/polynomial-functions/lessons/pf-03-01.json':'s175-log-poly-rational-wave',
 'content/courses/polynomial-functions/lessons/pf-03-02.json':'s175-log-poly-rational-wave',
 // S178: pf-turning re-converted with the parity-aware polynomialMinimumDegree task.
 'content/courses/polynomial-functions/lessons/pf-05-02.json':'s178-parity-aware-degree',
 'content/courses/polynomial-functions/lessons/pf-05-03.json':'s175-log-poly-rational-wave',
 'content/courses/rational-functions/lessons/rf-03-01.json':'s175-log-poly-rational-wave',
 'content/courses/rational-functions/lessons/rf-04-03.json':'s175-log-poly-rational-wave',
 'content/courses/rational-functions/lessons/rf-05-02.json':'s175-log-poly-rational-wave',
 'content/courses/rational-functions/lessons/rf-05-03.json':'s175-log-poly-rational-wave',
 // S179: a1-linear-functions (8 forms).
 'content/courses/linear-functions/lessons/lf-02-01.json':'s179-linear-functions',
 'content/courses/linear-functions/lessons/lf-02-02.json':'s179-linear-functions',
 'content/courses/linear-functions/lessons/lf-02-03.json':'s179-linear-functions',
 'content/courses/linear-functions/lessons/lf-03-02.json':'s179-linear-functions',
 'content/courses/linear-functions/lessons/lf-03-03.json':'s179-linear-functions',
 'content/courses/linear-functions/lessons/lf-04-01.json':'s179-linear-functions',
 'content/courses/linear-functions/lessons/lf-04-02.json':'s179-linear-functions',
 'content/courses/linear-functions/lessons/lf-04-03.json':'s179-linear-functions',
 'content/courses/polynomial-rational-analysis/lessons/pra-01-03.json':'s171-precalc-wave',
 'content/courses/polynomial-rational-analysis/lessons/pra-02-02.json':'s171-precalc-wave',
 'content/courses/polynomial-rational-analysis/lessons/pra-02-03.json':'s171-precalc-wave',
 'content/courses/polynomial-rational-analysis/lessons/pra-03-02.json':'s171-precalc-wave',
 'content/courses/radicals-and-exponents/lessons/rad-04-01.json':'s159-geometric-conversion',
 'content/courses/radicals-and-exponents/lessons/rad-04-02.json':'s159-geometric-conversion',
 'content/courses/radicals-and-exponents/lessons/rad-04-03.json':'s159-geometric-conversion',
 'content/courses/area-surface-volume/lessons/asv-03-02.json':'late-wave',
 'content/courses/coordinate-geometry/lessons/cg-01-02.json':'late-wave',
 'content/courses/decimal-operations/lessons/dop-03-02.json':'late-wave',
 'content/courses/decimals-place-value/lessons/dpv-03-02.json':'late-wave',
 'content/courses/proportional-relationships/lessons/pr-02-02.json':'late-wave',
 'content/courses/ratios-rates/lessons/rr-03-01.json':'late-wave',
 'content/courses/coordinate-geometry/lessons/cg-01-03.json':'late-wave',
 'content/courses/data-distributions/lessons/dd-04-01.json':'late-wave+null-repair',
 'content/courses/geometry-g7/lessons/g7-01-03.json':'late-wave+null-repair',
 'content/courses/geometry-g7/lessons/g7-03-02.json':'late-wave+null-repair',
 'content/courses/measurement-data/lessons/md-05-02.json':'late-wave+null-repair',
 'content/courses/transformations-measurement/lessons/tm-03-03.json':'late-wave+null-repair',
 'content/courses/transformations-measurement/lessons/tm-04-01.json':'late-wave+null-repair',
 'content/courses/the-real-number-system/lessons/rns-02-01.json':'values-repair',
 'content/courses/the-real-number-system/lessons/rns-01-01.json':'stage-merge',
 // S155: a1-systems conversion wave — 19 numeric assessed steps rebuilt as
 // affineRelationshipLab intersectionX/Y with derived-truth==frozen-answer asserted per step
 // before writing; commonErrors carried verbatim into numericErrors. Paired generator upgrade:
 // params-first branch in affineUpgradeConfig (variants.ts) + AFFINE_VARIANT_FORMS["a1-systems"].
 // Ledger: scripts/session/session155-applied.json; baselines: scripts/session/baselines-s155/.
 'content/courses/systems-equations/lessons/se-01-01.json':'s155-affine-conversion',
 'content/courses/systems-equations/lessons/se-01-02.json':'s155-affine-conversion',
 'content/courses/systems-equations/lessons/se-02-03.json':'s155-affine-conversion',
 'content/courses/systems-equations/lessons/se-03-01.json':'s155-affine-conversion',
 'content/courses/systems-equations/lessons/se-03-02.json':'s155-affine-conversion',
 'content/courses/systems-equations/lessons/se-03-03.json':'s155-affine-conversion',
 // S157: predict-path conversions of variant-free interactive steps (D->A wave). Derivations
 // asserted equal to frozen answers before write (7, 8, 6); rt-01-03 carries the authored mcq
 // options verbatim as claim-bearing choices. Ledger: scripts/session/session157-applied.json.
 'content/courses/exponents-polynomials/lessons/ep-01-01.json':'s157-predict-conversion',
 'content/courses/exponents-polynomials/lessons/ep-01-02.json':'s157-predict-conversion',
 'content/courses/linear-functions/lessons/lf-03-03.json':'s157-predict-conversion',
 'content/courses/right-triangles-trig/lessons/rt-01-03.json':'s157-predict-conversion',

 // S180: exp-function wave onto exactNumberLab (approximationEvaluate). Exponentiation is
 // REPRESENTED as repeated multiplication (no pow op); b^0 is DERIVED as b/b (quotient law),
 // never asserted as a bare 1; decay is one authored factor (1/2 or 1/4) per step; the
 // geometric forms use t1/t0 and tLast*(t1/t0). Each spec's truth was asserted equal to the
 // frozen authored answer BEFORE any write (16/16, four-way agreement: hand table == prompt
 // extraction == derived truth == frozen answer); prompts, tolerances and
 // commonErrors->numericErrors preserved verbatim. Baselines scripts/session/baselines-s180;
 // ledger scripts/session/session180-applied.json.
 'content/courses/exponential-functions/lessons/exp-01-01.json':'s180-exp-function-conversion',
 'content/courses/exponential-functions/lessons/exp-01-03.json':'s180-exp-function-conversion',
 'content/courses/exponential-functions/lessons/exp-02-01.json':'s180-exp-function-conversion',
 'content/courses/exponential-functions/lessons/exp-02-02.json':'s180-exp-function-conversion',
 // S181: exp-solve + a1-exponential exp-match-base onto exactNumberLab/exponentSolve.
 // Exponents are found by EXACT integer cross-multiplication over a bounded window,
 // never Math.log: a logarithm rounds precisely where the answer is an integer. Each
 // spec's truth was asserted equal to the frozen authored answer BEFORE any write
 // (11/11, four-way agreement). Baselines scripts/session/baselines-s181; ledger
 // scripts/session/session181-applied.json.
 'content/courses/exponential-functions/lessons/exp-03-01.json':'s181-exponent-solve-conversion',
 'content/courses/exponential-functions/lessons/exp-03-02.json':'s181-exponent-solve-conversion',
 'content/courses/exponential-functions/lessons/exp-03-03.json':'s181-exponent-solve-conversion',
 // S181b: the remaining a1-exponential numerics, closing the course. Reuses the S180
 // kinds plus exp-rate for a RATIONAL growth factor (50% growth is the x3/2 the prose
 // shows). 12/12 four-way agreement before any write; baselines baselines-s181b.
 'content/courses/exponential-functions/lessons/exp-01-02.json':'s181-a1-exponential-conversion',
 'content/courses/exponential-functions/lessons/exp-02-03.json':'s181-a1-exponential-conversion',
 'content/courses/exponential-functions/lessons/exp-04-01.json':'s181-a1-exponential-conversion',
 'content/courses/exponential-functions/lessons/exp-04-02.json':'s181-a1-exponential-conversion + s237-manipulative-alongside (new interactive step i3b, expLogExplore sliding the base to 4 so b^3 reads 64, inserted immediately before check k2; k2 byte-identical)',
 'content/courses/exponential-functions/lessons/exp-04-03.json':'s181-a1-exponential-conversion',

 // S183: counting-to-100-k — the first K5-expansion course, generated NEW by the course
 // factory (scripts/session/build-counting-100-k.mjs) from the landed S113 spec
 // (k5-expansion.json). 18 lessons, 973 factory assertions, session183 test 6/6, all Tier A.
 'content/courses/counting-to-100-k/lessons/k100-01-01.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-01-02.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-01-03.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-01-04.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-01-05.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-01-06.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-02-01.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-02-02.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-02-03.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-02-04.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-02-05.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-03-01.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-03-02.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-03-03.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-03-04.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-03-05.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-03-06.json':'s183-k5-expansion-new-course',
 'content/courses/counting-to-100-k/lessons/k100-03-07.json':'s183-k5-expansion-new-course',

 // S184: decimals-intro-g4 — the second K5-expansion course and the first over the NEW
 // hundredthsGrid engine, generated by scripts/session/build-decimals-intro-g4.mjs from the
 // landed S113 spec. 18 lessons, 901 factory assertions, session184 test 27/27.
 'content/courses/decimals-intro-g4/lessons/dg4-01-01.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-01-02.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-01-03.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-01-04.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-01-05.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-01-06.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-02-01.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-02-02.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-02-03.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-02-04.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-02-05.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-02-06.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-03-01.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-03-02.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-03-03.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-03-04.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-03-05.json':'s184-k5-expansion-new-course',
 'content/courses/decimals-intro-g4/lessons/dg4-03-06.json':'s184-k5-expansion-new-course',

 // S185: data-graphs-g1 — the third K5-expansion course, first over the S185-extended
 // barBuilder (display bar/tally/pictograph) + graphRead (mode +tally) engines, generated
 // by scripts/session/build-data-graphs-g1.mjs. 12 lessons, 565 factory assertions.
 'content/courses/data-graphs-g1/lessons/dgr1-01-01.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-01-02.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-01-03.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-01-04.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-02-01.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-02-02.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-02-03.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-02-04.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-03-01.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-03-02.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-03-03.json':'s185-k5-expansion-new-course',
 'content/courses/data-graphs-g1/lessons/dgr1-03-04.json':'s185-k5-expansion-new-course',

 // S186: the fluency pair — the fourth and fifth K5-expansion courses and the first content
 // over the item-grain fact-fluency architecture (variant.factFamily -> Profile.factItems).
 // 30 lessons, 1587 factory assertions, scripts/session/build-fluency-pair-g3.mjs.
 'content/courses/mult-fluency-g3/lessons/mf3-01-01.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-01-02.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-01-03.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-01-04.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-01-05.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-01-06.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-02-01.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-02-02.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-02-03.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-02-04.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-02-05.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-02-06.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-03-01.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-03-02.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-03-03.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-03-04.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-03-05.json':'s186-fluency-pair-new-course',
 'content/courses/mult-fluency-g3/lessons/mf3-03-06.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-01-01.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-01-02.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-01-03.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-01-04.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-02-01.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-02-02.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-02-03.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-02-04.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-03-01.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-03-02.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-03-03.json':'s186-fluency-pair-new-course',
 'content/courses/division-fluency-g3/lessons/df3-03-04.json':'s186-fluency-pair-new-course',

 // S188: fluency-20-g2 — the sixth K5-expansion course and the first content over the ADDITIVE
 // half of the fact-grain architecture (sumFamilyKey -> Profile.factItems). 14 lessons,
 // 990 factory assertions, scripts/session/build-fluency-20-g2.mjs.
 'content/courses/fluency-20-g2/lessons/f20-01-01.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-01-02.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-01-03.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-01-04.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-02-01.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-02-02.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-02-03.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-02-04.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-03-01.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-03-02.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-03-03.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-03-04.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-03-05.json':'s188-additive-fluency-new-course',
 'content/courses/fluency-20-g2/lessons/f20-03-06.json':'s188-additive-fluency-new-course',

 // S189: add-subtract-10-k — the seventh K5-expansion course and the largest K course. Its
 // five K.OA.A.5 lessons carry additive factFamily keys, making Kindergarten the third grade
 // band feeding the item-grain leech box. 20 lessons, 1240 factory assertions.
 'content/courses/add-subtract-10-k/lessons/koa-01-01.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-01-02.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-01-03.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-01-04.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-01-05.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-02-01.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-02-02.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-02-03.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-02-04.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-02-05.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-01.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-02.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-03.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-04.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-05.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-06.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-07.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-08.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-09.json':'s189-k-add-subtract-new-course',
 'content/courses/add-subtract-10-k/lessons/koa-03-10.json':'s189-k-add-subtract-new-course',

 // S190: add-within-100-g1 — PROTOCOL v2's first course. Zero new generator forms: every
 // graded widget calls the PRE-EXISTING g1-add-subtract/g1-tens-ones generators (shipped
 // before session 151), proven via the REAL independent solver in session190 test.
// S191: Batch A completion — both courses built entirely on PRE-EXISTING generator
// families (g1-add-subtract; + unknown-letter for equations-unknowns-g1); zero generator/
// solver/route/resolver edits. Every numeric re-derived by the REAL shipped solver or an
// independent search in src/lib/session191.batchA.test.ts (28/28).
// S192: Batch B — three G1 courses, ALL built on PRE-EXISTING generator families
// (g1-add-subtract; g1-shapes-measure). generator-guard confirms zero generator-source
// drift, so no new forms were written. New files only; no pre-existing lesson modified.
 'content/courses/add-three-numbers-g1/lessons/g1t-01-01.json':'s192-batch-b-new-course',
 'content/courses/add-three-numbers-g1/lessons/g1t-01-02.json':'s192-batch-b-new-course',
 'content/courses/add-three-numbers-g1/lessons/g1t-01-03.json':'s192-batch-b-new-course',
 'content/courses/add-three-numbers-g1/lessons/g1t-01-04.json':'s192-batch-b-new-course',
 'content/courses/add-three-numbers-g1/lessons/g1t-02-01.json':'s192-batch-b-new-course',
 'content/courses/add-three-numbers-g1/lessons/g1t-02-02.json':'s192-batch-b-new-course',
 'content/courses/add-three-numbers-g1/lessons/g1t-02-03.json':'s192-batch-b-new-course',
 'content/courses/add-three-numbers-g1/lessons/g1t-03-01.json':'s192-batch-b-new-course',
 'content/courses/add-three-numbers-g1/lessons/g1t-03-02.json':'s192-batch-b-new-course',
 'content/courses/add-three-numbers-g1/lessons/g1t-03-03.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-01-01.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-01-02.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-01-03.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-01-04.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-02-01.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-02-02.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-02-03.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-03-01.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-03-02.json':'s192-batch-b-new-course',
 'content/courses/measure-length-g1/lessons/g1m-03-03.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-01-01.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-01-02.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-01-03.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-02-01.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-02-02.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-02-03.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-02-04.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-03-01.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-03-02.json':'s192-batch-b-new-course',
 'content/courses/compose-shapes-g1/lessons/g1s-03-03.json':'s192-batch-b-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-01-01.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-01-02.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-01-03.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-01-04.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-01-05.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-02-01.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-02-02.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-02-03.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-02-04.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-02-05.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-02-06.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-03-01.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-03-02.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-03-03.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-03-04.json':'s194-batch-c-new-course','content/courses/add-subtract-1000-g2/lessons/g2b-03-05.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-01-01.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-01-02.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-01-03.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-01-04.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-02-01.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-02-02.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-02-03.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-03-01.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-03-02.json':'s194-batch-c-new-course','content/courses/arrays-even-odd-g2/lessons/g2a-03-03.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-01-01.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-01-02.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-01-03.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-01-04.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-01-05.json':'s194-batch-c-new-course + s238-line-plot-family (display-only plotData added to k1/k3/rem-g2g-mode-k mcq — whole-number axis; prompts, options, answers and feedback byte-identical) + s238-graded-wrong-ruling (k3: the count-vs-value distractor collapsed onto the key — stacks 2,6,3,1 above 5,6,7,8 put the mode AND the tallest-stack count both at 6, so bare 6-inches graded wrong beside 6-inches-its-stack-is-tallest graded right. Counts reordered to 6,2,3,1: the key becomes 5 inches, the count-trap 6 inches is a real axis value and genuinely wrong — the exact shape k1 and rem-g2g-mode-k already use. User-ruled 2026-08-12.)','content/courses/data-line-plots-g2/lessons/g2g-02-01.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-02-02.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-02-03.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-02-04.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-03-01.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-03-02.json':'s194-batch-c-new-course','content/courses/data-line-plots-g2/lessons/g2g-03-03.json':'s194-batch-c-new-course + s238-line-plot-family (display-only plotData added to k3 mcq — whole-number axis; prompts, options, answers and feedback byte-identical)','content/courses/add-subtract-1000-g3/lessons/g3a-01-01.json':'s195-batch-d-new-course','content/courses/add-subtract-1000-g3/lessons/g3a-01-02.json':'s195-batch-d-new-course','content/courses/add-subtract-1000-g3/lessons/g3a-01-03.json':'s195-batch-d-new-course','content/courses/add-subtract-1000-g3/lessons/g3a-01-04.json':'s195-batch-d-new-course','content/courses/add-subtract-1000-g3/lessons/g3a-02-01.json':'s195-batch-d-new-course','content/courses/add-subtract-1000-g3/lessons/g3a-02-02.json':'s195-batch-d-new-course','content/courses/add-subtract-1000-g3/lessons/g3a-02-03.json':'s195-batch-d-new-course','content/courses/add-subtract-1000-g3/lessons/g3a-03-01.json':'s195-batch-d-new-course','content/courses/add-subtract-1000-g3/lessons/g3a-03-02.json':'s195-batch-d-new-course','content/courses/add-subtract-1000-g3/lessons/g3a-03-03.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-01-01.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-01-02.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-01-03.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-01-04.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-01-05.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-02-01.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-02-02.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-02-03.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-02-04.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-02-05.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-03-01.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-03-02.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-03-03.json':'s195-batch-d-new-course','content/courses/fractions-deeper-g3/lessons/g3f-03-04.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-01-01.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-01-02.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-01-03.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-01-04.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-02-01.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-02-02.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-02-03.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-02-04.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-03-01.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-03-02.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-03-03.json':'s195-batch-d-new-course','content/courses/word-problems-g3/lessons/g3w-03-04.json':'s195-batch-d-new-course','content/courses/fraction-multiply-g4/lessons/g4x-01-01.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-01-02.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-01-03.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-01-04.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-02-01.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-02-02.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-02-03.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-02-04.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-03-01.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-03-02.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-03-03.json':'s196-batch-e-new-course','content/courses/fraction-multiply-g4/lessons/g4x-03-04.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-01-01.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-01-02.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-01-03.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-01-04.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-02-01.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-02-02.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-02-03.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-02-04.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-03-01.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-03-02.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-03-03.json':'s196-batch-e-new-course','content/courses/measure-problems-g4/lessons/g4v-03-04.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-01-01.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-01-02.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-01-03.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-01-04.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-01-05.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-01-06.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-02-01.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-02-02.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-02-03.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-02-04.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-02-05.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-03-01.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-03-02.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-03-03.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-03-04.json':'s196-batch-e-new-course','content/courses/mult-div-fluency-g4/lessons/g4m-03-05.json':'s196-batch-e-new-course','content/courses/multistep-g4/lessons/g4s-01-01.json':'s196-batch-e-new-course','content/courses/multistep-g4/lessons/g4s-01-02.json':'s196-batch-e-new-course','content/courses/multistep-g4/lessons/g4s-01-03.json':'s196-batch-e-new-course','content/courses/multistep-g4/lessons/g4s-02-01.json':'s196-batch-e-new-course','content/courses/multistep-g4/lessons/g4s-02-02.json':'s196-batch-e-new-course','content/courses/multistep-g4/lessons/g4s-02-03.json':'s196-batch-e-new-course','content/courses/multistep-g4/lessons/g4s-03-01.json':'s196-batch-e-new-course','content/courses/multistep-g4/lessons/g4s-03-02.json':'s196-batch-e-new-course','content/courses/decimal-fluency-g5/lessons/g5d-01-01.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-01-02.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-01-03.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-01-04.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-01-05.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-01-06.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-02-01.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-02-02.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-02-03.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-02-04.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-02-05.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-03-01.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-03-02.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-03-03.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-03-04.json':'s197-batch-f-new-course','content/courses/decimal-fluency-g5/lessons/g5d-03-05.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-01-01.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-01-02.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-01-03.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-01-04.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-02-01.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-02-02.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-02-03.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-03-01.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-03-02.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-03-03.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-03-04.json':'s197-batch-f-new-course','content/courses/expressions-patterns-g5/lessons/g5e-03-05.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-01-01.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-01-02.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-01-03.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-01-04.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-02-01.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-02-02.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-02-03.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-02-04.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-03-01.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-03-02.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-03-03.json':'s197-batch-f-new-course','content/courses/fraction-division-g5/lessons/g5f-03-04.json':'s197-batch-f-new-course','content/courses/long-division-g5/lessons/g5l-01-01.json':'s197-batch-f-new-course','content/courses/long-division-g5/lessons/g5l-01-02.json':'s197-batch-f-new-course','content/courses/long-division-g5/lessons/g5l-02-01.json':'s197-batch-f-new-course','content/courses/long-division-g5/lessons/g5l-02-02.json':'s197-batch-f-new-course','content/courses/long-division-g5/lessons/g5l-03-01.json':'s197-batch-f-new-course','content/courses/long-division-g5/lessons/g5l-03-02.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-01-01.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-01-02.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-01-03.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-01-04.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-01-05.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-02-01.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-02-02.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-02-03.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-02-04.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-02-05.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-03-01.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-03-02.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-03-03.json':'s197-batch-f-new-course','content/courses/unlike-fractions-g5/lessons/g5u-03-04.json':'s197-batch-f-new-course','content/courses/volume-problems-g5/lessons/g5v-01-01.json':'s197-batch-f-new-course','content/courses/volume-problems-g5/lessons/g5v-01-02.json':'s197-batch-f-new-course','content/courses/volume-problems-g5/lessons/g5v-02-01.json':'s197-batch-f-new-course','content/courses/volume-problems-g5/lessons/g5v-02-02.json':'s197-batch-f-new-course','content/courses/volume-problems-g5/lessons/g5v-02-03.json':'s197-batch-f-new-course','content/courses/volume-problems-g5/lessons/g5v-03-01.json':'s197-batch-f-new-course','content/courses/volume-problems-g5/lessons/g5v-03-02.json':'s197-batch-f-new-course','content/courses/volume-problems-g5/lessons/g5v-03-03.json':'s197-batch-f-new-course','content/courses/patterns-factors-g4/lessons/g4p-01-01.json':'s196-batch-e-new-course','content/courses/patterns-factors-g4/lessons/g4p-01-02.json':'s196-batch-e-new-course','content/courses/patterns-factors-g4/lessons/g4p-01-03.json':'s196-batch-e-new-course','content/courses/patterns-factors-g4/lessons/g4p-01-04.json':'s196-batch-e-new-course','content/courses/patterns-factors-g4/lessons/g4p-02-01.json':'s196-batch-e-new-course','content/courses/patterns-factors-g4/lessons/g4p-02-02.json':'s196-batch-e-new-course','content/courses/patterns-factors-g4/lessons/g4p-03-01.json':'s196-batch-e-new-course','content/courses/patterns-factors-g4/lessons/g4p-03-02.json':'s196-batch-e-new-course','content/courses/patterns-factors-g4/lessons/g4p-03-03.json':'s196-batch-e-new-course','content/courses/patterns-factors-g4/lessons/g4p-03-04.json':'s196-batch-e-new-course','content/courses/four-addends-g2/lessons/g2n-01-01.json':'s194-batch-c-new-course','content/courses/four-addends-g2/lessons/g2n-01-02.json':'s194-batch-c-new-course','content/courses/four-addends-g2/lessons/g2n-01-03.json':'s194-batch-c-new-course','content/courses/four-addends-g2/lessons/g2n-02-01.json':'s194-batch-c-new-course','content/courses/four-addends-g2/lessons/g2n-02-02.json':'s194-batch-c-new-course','content/courses/four-addends-g2/lessons/g2n-02-03.json':'s194-batch-c-new-course','content/courses/four-addends-g2/lessons/g2n-03-01.json':'s194-batch-c-new-course','content/courses/four-addends-g2/lessons/g2n-03-02.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-01-01.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-01-02.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-01-03.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-02-01.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-02-02.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-02-03.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-03-01.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-03-02.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-03-03.json':'s194-batch-c-new-course','content/courses/length-problems-g2/lessons/g2p-03-04.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-01-01.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-01-02.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-01-03.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-02-01.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-02-02.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-02-03.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-03-01.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-03-02.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-03-03.json':'s194-batch-c-new-course','content/courses/number-line-g2/lessons/g2l-03-04.json':'s194-batch-c-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-01-01.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-01-02.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-01-03.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-01-04.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-01-05.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-02-01.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-02-02.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-02-03.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-02-04.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-02-05.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-03-01.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-03-02.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-03-03.json':'s191-properties-strategies-new-course',
 'content/courses/properties-strategies-g1/lessons/g1p-03-04.json':'s191-properties-strategies-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-01-01.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-01-02.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-01-03.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-01-04.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-01-05.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-02-01.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-02-02.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-02-03.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-02-04.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-03-01.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-03-02.json':'s191-equations-unknowns-new-course',
 'content/courses/equations-unknowns-g1/lessons/g1e-03-03.json':'s191-equations-unknowns-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-01-01.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-01-02.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-01-03.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-01-04.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-02-01.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-02-02.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-02-03.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-02-04.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-02-05.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-02-06.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-03-01.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-03-02.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-03-03.json':'s190-add-within-100-new-course',
 'content/courses/add-within-100-g1/lessons/g1a-03-04.json':'s190-add-within-100-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-01-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-01-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-01-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-01-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-02-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-02-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-02-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-02-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-03-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-03-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-03-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/compare-numbers-k/lessons/kcm-03-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-01-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-01-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-01-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-01-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-01-05.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-02-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-02-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-02-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-02-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-02-05.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-03-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-03-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-03-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-03-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-03-05.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/how-many-k/lessons/khm-03-06.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-01-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-01-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-01-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-01-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-02-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-02-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-02-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-02-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-03-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-03-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-03-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/measure-compare-k/lessons/kmd-03-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-01-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-01-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-01-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-01-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-01-05.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-02-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-02-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-02-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-02-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-02-05.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-03-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-03-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-03-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/number-writing-k/lessons/kcw-03-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-01-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-01-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-01-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-01-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-01-05.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-02-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-02-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-02-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-02-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-02-05.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-03-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-03-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-03-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/shapes-build-k/lessons/kgb-03-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-01-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-01-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-01-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-01-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-02-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-02-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-02-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-02-04.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-03-01.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-03-02.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-03-03.json':'s198-batch-g-kindergarten-new-course',
 'content/courses/teen-numbers-k/lessons/knb-03-04.json':'s198-batch-g-kindergarten-new-course',
 // S199: G6-12 CCSS EXPANSION — 4 new courses / 27 lessons factory-built to the Tier-A recipe
 // (build-absolute-value-piecewise / -surface-area-solids-g7 / -binomial-theorem / -expected-value).
 // All are NEW files: no previously-sealed lesson is touched by the expansion.
 'content/courses/absolute-value-piecewise/lessons/avp-01-01.json':'s199-g6-12-expansion',
 'content/courses/absolute-value-piecewise/lessons/avp-01-02.json':'s199-g6-12-expansion',
 'content/courses/absolute-value-piecewise/lessons/avp-01-03.json':'s199-g6-12-expansion',
 'content/courses/absolute-value-piecewise/lessons/avp-02-01.json':'s199-g6-12-expansion',
 'content/courses/absolute-value-piecewise/lessons/avp-02-02.json':'s199-g6-12-expansion',
 'content/courses/absolute-value-piecewise/lessons/avp-02-03.json':'s199-g6-12-expansion',
 'content/courses/absolute-value-piecewise/lessons/avp-03-01.json':'s199-g6-12-expansion',
 'content/courses/absolute-value-piecewise/lessons/avp-03-02.json':'s199-g6-12-expansion',
 'content/courses/absolute-value-piecewise/lessons/avp-03-03.json':'s199-g6-12-expansion',
 'content/courses/geometry-g7/lessons/sa7-01-01.json':'s199-g6-12-expansion',
 'content/courses/geometry-g7/lessons/sa7-01-02.json':'s199-g6-12-expansion',
 'content/courses/geometry-g7/lessons/sa7-01-03.json':'s199-g6-12-expansion',
 'content/courses/geometry-g7/lessons/sa7-02-01.json':'s199-g6-12-expansion',
 'content/courses/geometry-g7/lessons/sa7-02-02.json':'s199-g6-12-expansion',
 'content/courses/geometry-g7/lessons/sa7-02-03.json':'s199-g6-12-expansion',
 'content/courses/binomial-theorem/lessons/bt-01-01.json':'s199-g6-12-expansion',
 'content/courses/binomial-theorem/lessons/bt-01-02.json':'s199-g6-12-expansion',
 'content/courses/binomial-theorem/lessons/bt-01-03.json':'s199-g6-12-expansion',
 'content/courses/binomial-theorem/lessons/bt-02-01.json':'s199-g6-12-expansion',
 'content/courses/binomial-theorem/lessons/bt-02-02.json':'s199-g6-12-expansion',
 'content/courses/binomial-theorem/lessons/bt-02-03.json':'s199-g6-12-expansion',
 'content/courses/expected-value/lessons/ev-01-01.json':'s199-g6-12-expansion',
 'content/courses/expected-value/lessons/ev-01-02.json':'s199-g6-12-expansion',
 'content/courses/expected-value/lessons/ev-01-03.json':'s199-g6-12-expansion',
 'content/courses/expected-value/lessons/ev-02-01.json':'s199-g6-12-expansion',
 'content/courses/expected-value/lessons/ev-02-02.json':'s199-g6-12-expansion',
 'content/courses/expected-value/lessons/ev-02-03.json':'s199-g6-12-expansion',
 // S199: G6-12 CCSS gap patch — 21 authored lessons ingested verbatim (ingest-g6-12-gap-patch.mjs,
 // 891 asserts) then mastery-optimized ADDITIVELY (optimize-g6-12-gap-patch.mjs, 26 logged deltas:
 // predicts moved onto manip>=2 hosts, subject-true interactives, remedials cloning c2+check verbatim).
 // Plus the patch-specified si-03-03 recap.teaser seam edit (old value asserted before write).
 'content/courses/inequalities-and-regions/lessons/iar-01-01.json':'s199-g6-12-gap-patch',
 'content/courses/inequalities-and-regions/lessons/iar-01-02.json':'s199-g6-12-gap-patch',
 'content/courses/inequalities-and-regions/lessons/iar-01-03.json':'s199-g6-12-gap-patch',
 'content/courses/inequalities-and-regions/lessons/iar-02-01.json':'s199-g6-12-gap-patch',
 'content/courses/inequalities-and-regions/lessons/iar-02-02.json':'s199-g6-12-gap-patch',
 'content/courses/inequalities-and-regions/lessons/iar-02-03.json':'s199-g6-12-gap-patch',
 'content/courses/inequalities-and-regions/lessons/iar-03-01.json':'s199-g6-12-gap-patch + s240-manipulative-alongside (new interactive step i2, feasibleRegionExplore dragging the flour-limit fence from x ≤ 6 to x ≤ 4, inserted immediately before challenge ch1; ch1 byte-identical)',
 'content/courses/inequalities-and-regions/lessons/iar-03-02.json':'s199-g6-12-gap-patch',
 'content/courses/inequalities-and-regions/lessons/iar-03-03.json':'s199-g6-12-gap-patch + s240-manipulative-alongside (new interactive step i2, feasibleRegionExplore dragging the dough-limit fence from x ≤ 4 to x ≤ 5 and watching the mixed corner slide to (5, 1.5), inserted immediately before challenge ch1; ch1 byte-identical)',
 'content/courses/nonlinear-systems/lessons/nls-01-01.json':'s199-g6-12-gap-patch',
 'content/courses/nonlinear-systems/lessons/nls-01-02.json':'s199-g6-12-gap-patch',
 'content/courses/nonlinear-systems/lessons/nls-01-03.json':'s199-g6-12-gap-patch',
 'content/courses/nonlinear-systems/lessons/nls-02-01.json':'s199-g6-12-gap-patch',
 'content/courses/nonlinear-systems/lessons/nls-02-02.json':'s199-g6-12-gap-patch',
 'content/courses/nonlinear-systems/lessons/nls-02-03.json':'s199-g6-12-gap-patch',
 'content/courses/statistical-inference/lessons/si-06-01.json':'s199-g6-12-gap-patch',
 'content/courses/statistical-inference/lessons/si-06-02.json':'s199-g6-12-gap-patch',
 'content/courses/statistical-inference/lessons/si-06-03.json':'s199-g6-12-gap-patch',
 'content/courses/bivariate-statistics/lessons/bv-05-01.json':'s199-g6-12-gap-patch',
 'content/courses/bivariate-statistics/lessons/bv-05-02.json':'s199-g6-12-gap-patch',
 'content/courses/bivariate-statistics/lessons/bv-05-03.json':'s199-g6-12-gap-patch',
 'content/courses/statistical-inference/lessons/si-03-03.json':'s199-gap-patch-seam-teaser',

 // S203B: S203B statistics batch — box plots (6.SP.B.4), MAD (6.SP.B.5c), difference in MADs (7.SP.B.3) — all NEW files unless marked SEAM.
 'content/courses/data-distributions/lessons/dd-04-03.json':'s203b-content-patch',
 'content/courses/data-distributions/lessons/dd-04b-01.json':'s203b-content-patch',
 'content/courses/data-distributions/lessons/dd-04b-02.json':'s203b-content-patch',
 'content/courses/data-distributions/lessons/dd-04b-03.json':'s203b-content-patch',
 'content/courses/sampling-and-probability/lessons/sp-02-03.json':'s203b-content-patch',
 'content/courses/sampling-and-probability/lessons/sp-02b-01.json':'s203b-content-patch',
 'content/courses/sampling-and-probability/lessons/sp-02b-02.json':'s203b-content-patch',
 'content/courses/sampling-and-probability/lessons/sp-02b-03.json':'s203b-content-patch',
 // S203C: S203C expressions batch — factoring (7.EE.A.1), structure (7.EE.A.2), expression vocabulary (6.EE.A.2b) — all NEW files unless marked SEAM.
 'content/courses/expressions-equations/lessons/ee-02-03.json':'s203c-content-patch',
 'content/courses/expressions-equations/lessons/ee-02b-01.json':'s203c-content-patch',
 'content/courses/expressions-equations/lessons/ee-02b-02.json':'s203c-content-patch',
 'content/courses/expressions-equations/lessons/ee-02b-03.json':'s203c-content-patch',
 'content/courses/two-step-equations/lessons/tse-01-03.json':'s203c-content-patch',
 'content/courses/two-step-equations/lessons/tse-01b-01.json':'s203c-content-patch',
 'content/courses/two-step-equations/lessons/tse-01b-02.json':'s203c-content-patch',
 'content/courses/two-step-equations/lessons/tse-01b-03.json':'s203c-content-patch',
 // S203D: S203D exponents & percent applications — general-base exponent rules (8.EE.A.1), simple interest / commission / percent error (7.RP.A.3) — all NEW files unless marked SEAM.
 'content/courses/exponents-scientific-notation/lessons/esn-01-03.json':'s203d-content-patch',
 'content/courses/exponents-scientific-notation/lessons/esn-01b-01.json':'s203d-content-patch',
 'content/courses/exponents-scientific-notation/lessons/esn-01b-02.json':'s203d-content-patch',
 'content/courses/exponents-scientific-notation/lessons/esn-01b-03.json':'s203d-content-patch',
 'content/courses/proportional-relationships/lessons/pr-04-03.json':'s203d-content-patch',
 'content/courses/proportional-relationships/lessons/pr-04b-01.json':'s203d-content-patch',
 'content/courses/proportional-relationships/lessons/pr-04b-02.json':'s203d-content-patch + s240-manipulative-alongside (new interactive step i2b, percentBar flatFee structure — a fixed $5 fee segment beside the 3% track that holds still while the percent segment moves — inserted immediately before check k3; k3 byte-identical)',
 'content/courses/proportional-relationships/lessons/pr-04b-03.json':'s203d-content-patch',
 // S203E: S203E geometry — constructing triangles from conditions (7.G.A.2), transformations in coordinates (8.G.A.3) — all NEW files unless marked SEAM.
 'content/courses/geometry-g7/lessons/g7-03-03.json':'s203e-content-patch',
 'content/courses/geometry-g7/lessons/g7-03b-01.json':'s203e-content-patch',
 'content/courses/geometry-g7/lessons/g7-03b-02.json':'s203e-content-patch',
 'content/courses/geometry-g7/lessons/g7-03b-03.json':'s203e-content-patch',
 'content/courses/transformations-measurement/lessons/tm-01-03.json':'s203e-content-patch',
 'content/courses/transformations-measurement/lessons/tm-01b-01.json':'s203e-content-patch',
 'content/courses/transformations-measurement/lessons/tm-01b-02.json':'s203e-content-patch',
 'content/courses/transformations-measurement/lessons/tm-01b-03.json':'s203e-content-patch',
 // S203F: S203F closing batch — ratio pairs on the plane (6.RP.A.3a), signs and reflections (6.NS.C.6b), the equation y = kx (7.RP.A.2c) — all NEW files unless marked SEAM.
 'content/courses/number-system/lessons/ns-04-03.json':'s203f-content-patch',
 'content/courses/number-system/lessons/ns-04b-01.json':'s203f-content-patch',
 'content/courses/proportional-relationships/lessons/pr-03-03.json':'s203f-content-patch',
 'content/courses/proportional-relationships/lessons/pr-03b-01.json':'s203f-content-patch',
 'content/courses/ratios-rates/lessons/rr-02-03.json':'s203f-content-patch',
 'content/courses/ratios-rates/lessons/rr-02b-01.json':'s203f-content-patch',
 // S203J: HS Tier C repair pilot on statistical-inference.
 'content/courses/statistical-inference/lessons/si-01-01.json':'s203j-tier-repair (one interactive step converted to a manipulable engine; prose, answers and diagnostics unchanged)',
 'content/courses/statistical-inference/lessons/si-01-02.json':'s203j-tier-repair (one interactive step converted to a manipulable engine; prose, answers and diagnostics unchanged)',
 'content/courses/statistical-inference/lessons/si-04-03.json':'s203j-tier-repair (one interactive step converted to a manipulable engine; prose, answers and diagnostics unchanged)',
 // S203K: HS Tier C repair, geometry batch.
 'content/courses/polygons-quadrilaterals/lessons/pq-03-02.json':'s203k-hs-tier-repair (one interactive step -> shapeFamilyBuilder; prose, answers and diagnostics unchanged)',
 'content/courses/polygons-quadrilaterals/lessons/pq-04-01.json':'s203k-hs-tier-repair (one interactive step -> shapeFamilyBuilder; prose, answers and diagnostics unchanged)',
 // S203M: refusal re-audit — one recovery, three refusals confirmed against the engine catalogue
 'content/courses/polygons-quadrilaterals/lessons/pq-02-01.json':'s203m-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S203N: geometry batch 2 — congruence criteria and angle sum
 'content/courses/right-triangles-trig/lessons/rt-05-02.json':'s203n-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/similarity/lessons/sy-01-03.json':'s203n-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/triangle-congruence/lessons/tc-01-03.json':'s203n-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/triangle-congruence/lessons/tc-02-02.json':'s203n-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/triangle-congruence/lessons/tc-02-03.json':'s203n-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S203P: algebra & functions batch — exponentials, logs, factoring, systems, sequences, functions
 'content/courses/complex-numbers/lessons/cn-01-02.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/exponents-polynomials/lessons/ep-04-02.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/exponents-polynomials/lessons/ep-04-03.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/functions-and-sequences/lessons/fn-01-02.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/functions-and-sequences/lessons/fn-04-01.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/logarithms/lessons/lg-04-01.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/quadratics/lessons/qu-03-03.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/solving-equations/lessons/alg1-03-01.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/solving-equations/lessons/alg1-03-02.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/systems-equations/lessons/se-02-01.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/systems-equations/lessons/se-02-02.json':'s203p-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S203Q: trig batch — unit circle dials, right-triangle ratios, wave parameters
 'content/courses/function-transformations/lessons/ft-01-03.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/function-transformations/lessons/ft-03-03.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/right-triangles-trig/lessons/rt-03-03.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/right-triangles-trig/lessons/rt-04-01.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/trig-functions/lessons/tf-01-01.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/trig-functions/lessons/tf-01-02.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/trig-functions/lessons/tf-01-03.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/trig-functions/lessons/tf-04-02.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/trig-functions/lessons/tf-04-03.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/trig-functions/lessons/tf-05-01.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/trig-functions/lessons/tf-05-02.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/trig-functions/lessons/tf-05-03.json':'s203q-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S203R: calculus & precalculus batch — limits, derivatives, conics, polar, identities, function analysis
 'content/courses/conic-sections/lessons/co-02-01.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/conic-sections/lessons/co-02-02.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/conic-sections/lessons/co-03-03.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/conic-sections/lessons/co-05-03.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/derivative-rules/lessons/dr-02-02.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/derivative-rules/lessons/dr-02-03.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/derivative-rules/lessons/dr-05-03.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/function-analysis/lessons/fna-01-03.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/function-analysis/lessons/fna-03-01.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/limits-continuity/lessons/lc-02-01.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/limits-continuity/lessons/lc-03-03.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/polar-parametric/lessons/pp-01-01.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/polar-parametric/lessons/pp-02-01.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/polynomial-rational-analysis/lessons/pra-03-01.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/polynomial-rational-analysis/lessons/pra-03-03.json':'s203r-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S203S: post-guard batch — verified fresh against live tiers, exponents/logs/angles/functions
 'content/courses/constructions-and-proof/lessons/cp-04-03.json':'s203s-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/function-transformations/lessons/ft-01-01.json':'s203s-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/function-transformations/lessons/ft-05-02.json':'s203s-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/geometry-foundations/lessons/gf-02-02.json':'s203s-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/logarithms/lessons/lg-05-01.json':'s203s-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/logarithms/lessons/lg-05-02.json':'s203s-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/radicals-and-exponents/lessons/rad-03-03.json':'s203s-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S203T: vectors & remaining exponents — verified against schema, tier-guarded, math-verified
 'content/courses/exponents-polynomials/lessons/ep-01-03.json':'s203t-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/vectors-matrices/lessons/vec-01-03.json':'s203t-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S203U: final sweep — conic algebra, function composition, polar roots, similarity proportion
 'content/courses/conic-sections/lessons/co-04-02.json':'s203u-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/conic-sections/lessons/co-04-03.json':'s203u-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/polar-parametric/lessons/pp-03-03.json':'s203u-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/similarity/lessons/sy-03-02.json':'s203u-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S203V: S203V — twelve missing HS standards, all authored to Tier A: new course data-and-models (S-ID.A/B/C, N-Q.A.3) plus three singleton lessons (F-IF.C.9, G-SRT.A.1a, G-C.A.1) — all NEW files unless marked SEAM.
 'content/courses/circle-theorems/lessons/cr-06-01.json':'s203v-content-patch + s237-manipulative-alongside (new interactive step i3, scaledCircleLab areaCoef at the doubled radius 8, inserted immediately before challenge ch1; ch1 byte-identical)',
 'content/courses/data-and-models/lessons/dm-01-01.json':'s203v-content-patch',
 'content/courses/data-and-models/lessons/dm-02-01.json':'s203v-content-patch',
 'content/courses/data-and-models/lessons/dm-02-02.json':'s203v-content-patch',
 'content/courses/data-and-models/lessons/dm-03-01.json':'s203v-content-patch',
 'content/courses/function-analysis/lessons/fna-06-01.json':'s203v-content-patch',
 'content/courses/similarity/lessons/sy-06-01.json':'s203v-content-patch',
 // S203Y: refusal re-audit — pra-05-01 recovered via signChart, an engine never checked when it was refused
 'content/courses/polynomial-rational-analysis/lessons/pra-05-01.json':'s203y-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S203Z: Tier D repair — the two convertible with existing engines (lineRelationLab, dilationExplore)
 'content/courses/constructions-and-proof/lessons/cp-05-03.json':'s203z-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/geometry-foundations/lessons/gf-05-01.json':'s203z-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S204A: the two load-bearing C-only concepts — kc-order-numbers and statistical-question
 'content/courses/counting-to-20-k/lessons/kc-02-03.json':'s204a-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/data-distributions/lessons/dd-01-01.json':'s204a-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S204B: second false refusal recovered — tf-02-03 Arc Length via circleMeasureExplore arcSector
 'content/courses/trig-functions/lessons/tf-02-03.json':'s204b-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S204C: rotationLab proves itself — the two Tier D rotation lessons it was built for
 'content/courses/geometry-foundations/lessons/gf-03-03.json':'s204c-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/geometry-foundations/lessons/gf-04-03.json':'s204c-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S205B: insert-after pilot: Explain -> Reveal -> Manipulate -> Generalize on the steppedReveal wall
 'content/courses/curve-analysis/lessons/ca-01-03.json':'s205b-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S205C: The f″ mode's first real payoff: ca-02-02 (The Second-Derivative Test). The authored reveal shows the test FAILING — x⁴, −x⁴, x³ all have f′(0)=0 and f″(0)=0 with three different verdicts. Inserted after it is the complement the lesson never had: the test WORKING, on x³−3x, where f″=6x is −6 at one critical point and +6 at the other. Same test, opposite signs, opposite verdicts — and the learner drags across the inflection at x=0 to watch the sign flip. Reveal keeps its teaching; the lab supplies the doing.
 'content/courses/curve-analysis/lessons/ca-02-02.json':'s205c-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S205D: Campaign batch 1 off the new prefilter (scripts/measure/insertion-candidates.mjs): two insertions from the top-ranked Tier-C + steppedReveal cluster, two refusals with cites. Both insertions reuse engines already proven at Tier A in the SAME course — zero new registration work, per Protocol v2.
 'content/courses/curve-analysis/lessons/ca-05-01.json':'s205d-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 'content/courses/derivatives-in-context/lessons/dc-02-01.json':'s205d-manipulable-repair (one interactive step converted) + s238-not-possible-closed (new interactive steps i2 circleArea and i3 sphereVolume on the generalized relatedRatesLab, inserted immediately before k3 and ch1; both served steps byte-identical)',
 // S205E: Campaign batch 2 off the prefilter. One insertion (alg1-01-01, solveBalance — proven in-course, zero registration work). Two refusals, one of them on grounds the campaign will keep meeting: a lesson can be a high-scoring CANDIDATE and still be wrong to convert, because a second lab on material an existing rich step already covers pads the rich-step metric without adding a doing-moment.
 'content/courses/solving-equations/lessons/alg1-01-01.json':'s205e-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S205J: dr/dc steppedReveal cluster COMPLETED — all 9 lessons dispositioned. dr-04-03 converts via the new framing:'slope' mode on relatedRatesLab (the near-miss from S205I, refused then on dt notation alone; the engine now narrates the same circle in the lesson's own dy/dx language). dr-03-03, dc-03-02, dc-04-02 refuse on the cluster's established gates. Final tally: 2 converted (dc-02-01, dr-04-03), 7 refused with cites.
 'content/courses/derivative-rules/lessons/dr-04-03.json':'s205j-manipulable-repair (one interactive step converted; prose, answers and diagnostics unchanged)',
 // S210: the two rich-mix insertions adjudicated PASS in SESSION209_RICH_MIX_ADJUDICATION.md.
 // vec-05-03: step k1's widget converted mcq -> matrixTransform (target [[0,1],[-1,0]], a 90°
 // clockwise rotation; verified by matrix arithmetic AND geometric composition of the two
 // reflections, both agreeing with the lesson's own stated target). The step's stale
 // `variant: {gen:"reflect-compose"}` (default form, which emits an mcq-shaped spec) was removed
 // since it no longer matches the converted widget type and would fail the resolver's own
 // type-match invariant (variants.resolver.test.ts:583); nothing else on the step changed.
 // sy-02-03: NEW step `i4` inserted between `i3` and `ch` — dilationExplore segments mode,
 // side-splitter theorem, targetK=0.6 chosen so the live AD/DB=AE/EC ratio (1.5) and even the
 // absolute AD=6/DB=4 lengths match the `ch` step's own numbers (verified by similar-triangle
 // proportion t/(1-t) AND direct coordinate computation, both agreeing). No other step touched.
 // Full arithmetic and gate counts: SESSION210_CONTENT_CHANGE_LEDGER.md.
 'content/courses/vectors-matrices/lessons/vec-05-03.json':'s210-rich-mix-insertion (k1 mcq -> matrixTransform conversion; stale variant key removed; S210 review C2: prompt re-edited so it no longer prints the graded matrix verbatim — target/traps/feedback unchanged) + s211-variant-key-restore (k1 declared "variant":{"gen":"reflect-compose","form":"composeMatrix"} — the new form built this session; the sole byte change; nothing else on the step or file touched)',
 'content/courses/similarity/lessons/sy-02-03.json':'s210-rich-mix-insertion (new inserted step i4, dilationExplore segments mode; no other step touched)',
 // S213 causal-mastery activation. se-01-03 ("One, None, or Infinitely Many") was 10 MCQ/matchPairs
 // steps with zero manipulatives. Step i1's widget becomes an EDITABLE systemsExplore (editLine1 /
 // editLine2 / degenerateSystemFeedback — the first authored user of the S212 breakable-systems
 // capability), and i1 gains the predict block its own body promised. The learner finds the crossing,
 // then destroys it (parallel / coincident) and restores it. Grading refuses to award success for a
 // destroyed system: evaluate.ts tests m1===m2 BEFORE on1&&on2, so the coincident state with the point
 // on the shared line grades incorrect — verified live by an independent Fable-QA assessor, which
 // returned ACCEPT-WITH-FIXES and whose two fixes (a degenerate-feedback clause that misfired in the
 // coincident branch; the missing predict block) are landed. Only step i1's body/widget/predict changed;
 // step ids, order, k1's variant block and all other prose byte-identical.
 // Full verification: SESSION213_CONTENT_CHANGE_LEDGER.md and SESSION213_FABLE_QA.md.
 'content/courses/systems-equations/lessons/se-01-03.json':'s213-causal-mastery-activation (i1 systemsExplore -> editable lines with authored degenerateSystemFeedback + predict block; first authored user of the breakable-systems capability; no other step touched) + s214-drag-copy (i1 prompt only: leads with grabbing the line now that the lines are draggable, steppers demoted to the exact-value route; graded task unchanged)',
 // S214 causal-mastery, second attempt at the area step. S213 authored this and an independent
 // Fable-QA assessor REJECTED it (the widget drew no real rectangle; the step collapsed to one
 // click) and it was reverted byte-exactly. This session rebuilt the engine to the precondition
 // list first — edges drawn proportionally to the factors, real partial-product cells, and the
 // "open the rectangle" button REMOVED so the learner must produce the partials — then re-authored.
 // Fable-QA returned ACCEPT-WITH-FIXES; both fixes landed (a feedback string that asserted a wrong
 // count, and an over-production path that announced a wrong expansion as complete).
 // Only step i1's widget changed: area + partialProductFeedback + unopenedFrameFeedback, prompt
 // rewritten to the fill task. predict, body, the three original feedback strings, targets and all
 // ten other steps byte-identical. Full verification: SESSION214_CONTENT_CHANGE_LEDGER.md.
 'content/courses/two-step-equations/lessons/tse-01-01.json':'s214-causal-mastery-activation (i1 algebraTiles -> area/distribute mode; first authored user of the area capability, after the engine was rebuilt to draw a real rectangle with partial-product cells; no other step touched)',
 // S214 rich-interaction insertion. pq-05-03 had zero manipulable steps across 6 answerable ones.
 // Step i1's mcq becomes coordinateProofLab (rhombus certification): the learner moves D until the
 // diagonals bisect AND cross at a right angle, then gathers the evidence that certifies it.
 // (5,9) is the UNIQUE non-degenerate solution — verified by exhaustive lattice sweep — so the
 // exact-position grader is mathematically forced. Fable-QA ACCEPT-WITH-FIXES; all three landed
 // (a feedback string printed the target coordinate; the framing implied an undiscovered identity
 // while the claim was on screen; the deleted mcq's square-vs-rhombus discrimination was restored
 // in the predict reveal). No other step touched.
 'content/courses/polygons-quadrilaterals/lessons/pq-05-03.json':'s214-rich-mix-insertion (i1 mcq -> coordinateProofLab rhombus certification + predict block; no other step touched)',
 // S216 causal-mastery activation: the FIRST authored numberLineRay lesson step. tse-04-02 ("The
 // Sign-Flip Rule") gains inserted step i1b: start -2x > -8 (the lesson's own c1 worked example
 // mid-state), both-sides transforms /(-2) and x(-2), target x < 4 graded with the new additive
 // requireSolvedForm field (set AND coefficient-1), so the untouched start grades incorrect with a
 // form diagnosis, scale-without-flip grades incorrect with the direction diagnosis quoting the
 // learner's own set, and both solve orders provably pass through the wrong set (the reflection is
 // unavoidable). Independent Fable-QA: ACCEPT, mathematics 10/10, overall 9.3 (SESSION216_FABLE_QA.md).
 // Only i1b inserted; stripping it and re-serialising reproduces the prior hash byte-for-byte.
 'content/courses/two-step-equations/lessons/tse-04-02.json':'s216-causal-mastery-activation (i1b numberLineRay sign-flip step; first authored user of the numberLineRay engine; no other step touched)',
 // S217: the contrast twin, nominated by S216 Fable-QA itself. tse-04-01 ("Solving Two-Step
 // Inequalities", the positive-coefficient lesson) gains inserted step i1b: start 3x > 12 (the
 // lesson's own c1 mid-state), transforms /3 and x3, target x > 4 under requireSolvedForm. The
 // ray does NOT move — the control experiment isolating the negative factor as the cause of
 // reversal; the reachable wrong action (flipping when you shouldn't) grades incorrect with the
 // direction diagnosis quoting the learner's own set. Fresh Fable-QA: ACCEPT, mathematics 10/10,
 // overall 9.25 (SESSION217_FABLE_QA.md); its two required fixes + one optional (a success string
 // false of a reachable flip-detour route) all landed pre-seal. Revert-proof verified: stripping
 // i1b re-serialises to the S216 seal hash byte-for-byte.
 'content/courses/two-step-equations/lessons/tse-04-01.json':'s217-causal-mastery-activation (i1b numberLineRay no-flip contrast step; no other step touched)',
 // S218 (Fable-only): ee-05-02 ("Graphing Inequalities") step k1, mcq -> numberLineRay BUILD task.
 // The mcq asked the learner to DESCRIBE the graph of x <= 3 (circle kind + arrow direction);
 // the conversion has them BUILD it: start x > 0, target x <= 3, set-graded. The old mcq's two
 // distractor misconceptions are now the engine's own reachable wrong states with its own
 // diagnoses. k1's variant key was retargeted graphDescription -> graphBuild, a NEW ray-emitting
 // generator form landed under the full CLAUDE.md protocol (independent substitution route, gate
 // branch, print-and-read — which caught an article-morphology bug and an in-set fallback test
 // number before ship). Step id/kind/body/conceptTag/explanationVariants untouched; revert-proof
 // verified. Independent Fable QA: ACCEPT, mathematics 10/10, overall 9.55 (SESSION218_FABLE_QA.md,
 // including its own on-the-record correction of a false claim in its first pass).
 'content/courses/expressions-equations/lessons/ee-05-02.json':'s218-causal-mastery-activation (k1 mcq -> numberLineRay build task + variant form graphDescription -> graphBuild; no other step touched)',
 // S237 MANIPULATIVE-ALONGSIDE wave. The approved ruling on
 // COWORK_CACHE/needs-manipulative-s237.csv was ADD, not replace: where a graded mcq/numeric check
 // had no manipulative, a NEW `kind:"interactive"` step carrying one is inserted IMMEDIATELY
 // BEFORE it. The step schema has no companion-widget field and adding one was rejected (it
 // collides with `variantForStep`, which is single-surface by construction, and would ship
 // permanently-frozen manipulatives), so the mechanism is SEQUENCING. The served check keeps sole
 // ownership of mastery evidence — interactive steps emit process events and never graded evidence
 // — which is exactly "alongside, not replacing".
 //
 // Every edit below is ONE spliced step object. No existing step's id, kind, body, prompt, answer,
 // options, traps, hints, explanationVariants, conceptTag, variant key or order byte changed;
 // deleting the inserted step and re-serialising with JSON.stringify(lesson, null, 2) reproduces
 // the prior file byte-for-byte (all 14 files round-trip at that indent, two without a trailing
 // newline, and the writer preserves that).
 //
 // All 10 engines were already authored elsewhere in the SAME course — zero new widget types, zero
 // new fields, zero generator/registration work. Each inserted widget was proven, BEFORE any write,
 // to have zero widgetIntegrityErrors, at least one reachable correct input, an opening state that
 // does NOT grade correct, and no unreachable wrong-path feedback. Two defects were caught by that
 // pre-write gate and fixed: two columnCalc traps that the engine's own move enumeration cannot
 // produce (dead feedback), and a columnCalc whose exhaustive trap list left its required fallback
 // unreachable. Standing gate: src/lib/manipulativeAlongside.s237.test.ts (103 assertions),
 // which pins each served step's prompt/answer/traps to literals so a later edit to the check the
 // manipulative serves fails rather than passes quietly.
 //
 // 18 of the CSV's 32 rows were REFUSED or BLOCKED rather than forced; reasons in the S237 report.
 'content/courses/function-transformations/lessons/ft-03-02.json':'s238-not-possible-closed (new interactive step i3, quadraticExplore with exact-rational a = 1/3 over aDen 3 and the parent y = x\u00b2 dashed, inserted immediately before check k3; k3 byte-identical)',
 'content/courses/fractions/lessons/fr-01-04.json':'s237-manipulative-alongside (new interactive step i1b, fractionBar 1/3 -> 1/9, inserted immediately before check k2; k2 byte-identical)',
 'content/courses/fractions-add/lessons/fa-01-02.json':'s237-manipulative-alongside (new interactive step i2b, fractionBar 1/4 -> 3/12 forward slice, inserted immediately before check k3; k3 byte-identical)',
 'content/courses/statistical-inference/lessons/si-03-02.json':'s237-manipulative-alongside (new interactive step i1b, ciCapture at the 99% width, inserted immediately before check k2; k2 byte-identical)',
 'content/courses/differential-equations/lessons/de-01-01.json':'s237-manipulative-alongside (new interactive step i1b, slopeField equation "exponential" = dy/dx 0.5y, inserted immediately before check k3; k3 byte-identical)',
 'content/courses/differential-equations/lessons/de-03-02.json':'s237-manipulative-alongside (new interactive step i1b, slopeField equation "logistic" started far below the ceiling, inserted immediately before check k1; k1 byte-identical)',
 'content/courses/differential-equations/lessons/de-03-01.json':'s237-manipulative-alongside (new interactive step i2, slopeField equation "decay", inserted immediately before challenge ch1; ch1 byte-identical)',
 'content/courses/number-system/lessons/ns-01-01.json':'s237-manipulative-alongside (new interactive step i1b, numberLineHop 12 quarter-hops to 3, inserted immediately before check k2; k2 byte-identical)',
 'content/courses/derivative-rules/lessons/dr-01-03.json':'s237-manipulative-alongside (new interactive step i2, derivativeTrace slope mode on x^2 - the differentiable contrast to i1 abs, inserted immediately before check k3; k3 byte-identical)',
 'content/courses/rational-functions/lessons/rf-02-02.json':'s237-manipulative-alongside (new interactive step i2b, signChart of the DIVISOR before the flip, inserted immediately before check k3; k3 byte-identical)',
 'content/courses/parametric-polar-calculus/lessons/pc-03-01.json':'s237-manipulative-alongside (new interactive step i1b, vectorExplore add mode building the velocity CHANGE across a quarter turn, inserted immediately before check k2) + s240-held-back-ruling (k2 was byte-identical through S237-S239; user ruled 2026-08-13 to convert it from mcq identification to vectorExplore execution — steer v until <1,0>+v lands on the origin, the acceleration at t=0 — one of 4 rows requiring a human decision, see HANDOVER_COWORK_S240.md §3.2. No compatible vectorExplore-shaped variant form exists for pc-vector-motion, so the step\'s variant declaration was removed rather than left mismatched, matching i1/i1b\'s existing unvaried state)',
 'content/courses/place-value/lessons/pv-03-03.json':'s237-manipulative-alongside (new interactive step i1b, columnCalc 412-157 two-trade subtraction, inserted immediately before check k1; k1 byte-identical)',
 'content/courses/place-value-million/lessons/pv2-04-03.json':'s237-manipulative-alongside (new interactive step i2b, columnCalc 6002-1348 borrow chain across two zeros, inserted immediately before check k3) + s240-held-back-ruling (k3 was byte-identical through S237-S239; user ruled 2026-08-13 to convert it from mcq identification to columnCalc execution, 8003-3457, one of 4 rows requiring a human decision, see HANDOVER_COWORK_S240.md §3.2)',
 // S240: closing the last 5 NOT-POSSIBLE rows from needs-manipulative-s237.csv (2 new engines,
 // feasibleRegionExplore and parametricTrace, built this session) plus one genuine content
 // addition (elapsedTime had zero graded practice exposure).
 'content/courses/polar-parametric/lessons/pp-04-01.json':'s240-manipulative-alongside (two new interactive steps: i1b, parametricTrace line mode x=t+1,y=2t dragging forward to t=2, inserted immediately before check k1; i2, parametricTrace circle mode x=cos t,y=sin t dragging forward to t=pi/2, inserted immediately before check k2; k1 and k2 byte-identical)',
 'content/courses/measure-money-time/lessons/mmt-04-03.json':'s240-elapsedtime-graded-practice (elapsedTime previously had zero graded practice — only the worked example e1; two new steps added directly after e1: i4, an elapsedTime interactive recess scenario 10:05->10:35/30min matching e1s cml shape, and k4, a NEW GRADED elapsedTime check, movie scenario 1:20->1:50/30min; e1 and every pre-existing step byte-identical)',
 // S240 addendum: the held-back-rows ruling. pv2-04-03 and pc-03-01 above gained appended clauses
 // (already-AUTHORIZED keys, entry count unchanged). cpr-05-03 is a NEW key below — it was never
 // touched by S237's alongside wave (i1 already served k2 as pre-existing authored content, not an
 // S237 insertion) and was byte-identical to the SESSION151 baseline until this ruling.
 'content/courses/conditional-probability/lessons/cpr-05-03.json':'s240-held-back-ruling (k2 was byte-identical to the SESSION151 baseline; user ruled 2026-08-13 to convert it from mcq identification to probabilityArea execution — shade 60 of 336 ordered all-red arrangements, the permutation-consistent equivalent of P(all red)=10/56 — one of 4 rows requiring a human decision, see HANDOVER_COWORK_S240.md §3.2. No compatible probabilityArea-shaped variant form exists for count-prob (only mcq/numeric forms are registered), so the step\'s variant declaration was removed rather than left mismatched, matching i1\'s existing unvaried state)',
};
const lessonPaths=[];
for(const course of readdirSync(join(root,'content/courses')).sort()){
  const dir=join(root,'content/courses',course,'lessons');
  if(!existsSync(dir))continue;
  for(const file of readdirSync(dir).filter(x=>x.endsWith('.json')).sort())lessonPaths.push(`content/courses/${course}/lessons/${file}`);
}
const changed=[],unexpected=[];
for(const rel of lessonPaths){
  const got=sha(readFileSync(join(root,rel)));
  if(prior[rel]!==got){changed.push({rel,reason:AUTHORIZED[rel]??'UNAUTHORIZED',sha256:got});if(!(rel in AUTHORIZED))unexpected.push(rel);}
}
const missing=Object.keys(AUTHORIZED).filter(rel=>!changed.some(c=>c.rel===rel));
// The reported denominator below is the AUTHORIZED map's own unique-key count (not a hand-copied
// literal): it is what "N/<denominator> authorized changes" should truthfully mean in this
// script's own counting semantics, and it moves automatically with every future session's batch
// instead of going stale the way the old hardcoded `686` (a S15x-era entry count, orphaned by
// every subsequent batch since) silently did. `changed.length` and this denominator are expected
// to be EQUAL whenever `passed` is true (every AUTHORIZED entry changed — `missing.length===0` —
// and every changed file is an AUTHORIZED entry — `unexpected.length===0`); the two numbers are
// still reported separately, on purpose, so a future accounting bug (e.g. a duplicate key
// silently collapsing two different sessions' entries into one) would show up as a visible N/M
// mismatch in the pass line rather than being hidden behind a single combined count. S210.
const authorizedCount=Object.keys(AUTHORIZED).length;
const summary={lessonFilesChanged:changed.length,unexpectedChangedLessonFiles:unexpected.length,missingAuthorizedChanges:missing.length,nonAuthorizedLessonFilesByteIdentical:lessonPaths.length-changed.length,totalLessons:lessonPaths.length,authorizedEntryCount:authorizedCount};
const passed=changed.length===874&&unexpected.length===0&&missing.length===0&&lessonPaths.length===1701;/*S240 addendum: +1 new key (cpr-05-03, held-back-rows ruling); pv2-04-03 and pc-03-01 were already AUTHORIZED and gained appended reason clauses rather than new keys, so the entry count moves by 1, not 3 — 873->874; totalLessons unchanged at 1701*//*S240: +2 new keys (pp-04-01, mmt-04-03); pr-04b-02, iar-03-01 and iar-03-03 were already AUTHORIZED from s203d-content-patch/s199-g6-12-gap-patch and gained appended reason clauses rather than new keys, so the entry count moves by 2, not 5 — 871->873; totalLessons unchanged at 1701 (no new lesson FILES, all 5 are edits to existing lessons)*//*S238 wave 18: +1 (ft-03-02 i3 rational-a quadraticExplore alongside k3; dc-02-01 gained i2/i3 growth-model labs under its existing key) — 870->871; totalLessons unchanged at 1701*//*S238 wave 9: +3 (mc-05-02 mark-order ruling + plotData; dd-02-01 glyph ruling; md-03-04 mixed-axis ruling) — 867->870; g2g-01-05 re-edited under its existing key (graded-wrong ruling clause appended); totalLessons unchanged at 1701*//*S238: +1 (vm-02-01, line-plot family: display-only plotData on 4 rows) — 866->867; vm-02-02, g2g-01-05 and g2g-03-03 also changed in this batch but were already AUTHORIZED keys and gained appended reason clauses; totalLessons unchanged at 1701*//*S199: +21 G6-12 gap-patch lessons (2 new courses, 2 chapter insertions) + si-03-03 seam edit, then +27 G6-12 expansion lessons across 4 new courses*//*S210: +2 rich-mix insertions (vec-05-03, sy-02-03) — 807->809; totalLessons unchanged at 1701 (no new lesson files, both are edits to existing lessons)*//*S213: +1 causal-mastery activation (se-01-03 editable systemsExplore) — 809->810; totalLessons unchanged at 1701*//*S214: +2 (tse-01-01 area-mode activation after engine rebuild; pq-05-03 coordinateProofLab insertion) — 810->812; se-01-03 re-edited under its existing entry; totalLessons unchanged at 1701*//*S216: +1 (tse-04-02 numberLineRay sign-flip activation) — 812->813; totalLessons unchanged at 1701*//*S217: +1 (tse-04-01 numberLineRay no-flip contrast) — 813->814; totalLessons unchanged at 1701*//*S218: +1 (ee-05-02 k1 build conversion) — 814->815; totalLessons unchanged at 1701*//*S237: +12 (manipulative-alongside wave: one new `kind:"interactive"` step spliced immediately before a graded check in 14 lessons; cr-06-01 and exp-04-02 were already AUTHORIZED from earlier sessions and gained an appended reason clause rather than a new key, so the entry count moves by 12, not 14) — 815->827; totalLessons unchanged at 1701 (no new lesson FILES, all 14 are edits to existing lessons)*//*S237: +11 (picture-graph-read conversion in mmt-05-01, and the numeric fraction-preview slice in 10 lessons; g2g-02-01 and g2g-02-02 also changed in this batch but were already AUTHORIZED keys) — 827->838. NOTE: 23 lesson files remain UNEXPECTED from earlier commits (97a0b72, cdddd79, dd00768 and others) whose sessions never updated this ledger. They are NOT certified here — this session did not author them and cannot state their reasons — so this proof still exits 1 on those 23. They are certified in THIS session under retro-ledger-s237 keys, each naming the commit that made the change so the provenance stays traceable rather than invented. 838->866: +6 further numeric-fraction-preview lessons and +22 retro entries.*/
const report={session:'151C',baseline:'SESSION151_LESSON_HASHES.json',summary,changed,unexpected,missing,passed};
writeFileSync(join(root,'SESSION151C_CONTENT_CHANGE_PROOF.json'),JSON.stringify(report,null,2)+'\n');
if(!passed){console.error(JSON.stringify({summary,unexpected,missing},null,1));process.exit(1);}
console.log(`content-change proof S151C passed: ${changed.length}/${authorizedCount} authorized changes; ${summary.nonAuthorizedLessonFilesByteIdentical} lessons byte-identical to the sealed S151 ledger`);
