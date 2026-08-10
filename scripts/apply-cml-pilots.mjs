#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? process.cwd());
const write = process.argv.includes('--write');

const explain = (prompt, correct, wrong, invariant) => ({
  prompt,
  options: [
    { id: 'invariant', label: correct, correct: true, feedback: `Exactly. ${invariant}` },
    { id: 'surface', label: wrong, correct: false, feedback: `That describes a surface feature, not the mathematical relationship that must remain true. ${invariant}` }
  ]
});

const PILOTS = [
  {
    id: 'k-quantity-composition', grade: 0, course: 'counting-to-20-k', lesson: 'kc-02-01', step: 'i2', widget: 'tenFrame',
    kernel: 'quantity-composition', actionGoal: 'Build the quantity in a structured frame, then reorganize it without recounting every object.',
    invariants: ['quantity-preserved', 'five-and-ten-structure'], misconceptions: ['counting-all', 'decorative-matching'],
    representations: ['concrete', 'diagram', 'symbolic', 'language'], translationFrom: 'concrete', translationTo: 'symbolic',
    transferFamily: 'same-quantity-new-arrangement', counterfactualPrompt: 'Move the counters into a different arrangement that still shows the same number. What must not change?',
    explanation: explain('Why can the counters move without changing the answer?', 'The arrangement can change while the number of counters stays fixed.', 'The answer changes whenever the picture looks different.', 'Quantity is preserved when only the arrangement changes.')
  },
  {
    id: 'g1-make-ten', grade: 1, course: 'add-subtract-20', lesson: 'as-02-01', step: 'i1', widget: 'tenFrame',
    kernel: 'quantity-composition', actionGoal: 'Complete a ten and use the leftover part instead of counting every counter.',
    invariants: ['sum-preserved', 'ten-structure'], misconceptions: ['counting-all', 'lost-part'],
    representations: ['concrete', 'diagram', 'symbolic', 'language'], translationFrom: 'diagram', translationTo: 'symbolic',
    transferFamily: 'make-ten-new-addends', counterfactualPrompt: 'Move one counter from one addend to the other. Can you preserve the sum while making a complete ten?',
    explanation: explain('Why does moving a part to make ten keep the answer unchanged?', 'The same total is repartitioned into a ten and a leftover part.', 'Moving a counter always adds one to the total.', 'The addends change form, but their sum is preserved.')
  },
  {
    id: 'g1-g2-place-exchange', grade: 1, course: 'tens-and-ones', lesson: 'tno-01-01', step: 'i1', widget: 'baseTenCompose',
    kernel: 'quantity-composition', actionGoal: 'Exchange ten ones for one ten and prove that the represented number is unchanged.',
    invariants: ['quantity-preserved', 'unit-value-preserved'], misconceptions: ['illegal-exchange', 'digit-place-confusion'],
    representations: ['concrete', 'table', 'symbolic', 'language'], translationFrom: 'concrete', translationTo: 'table',
    transferFamily: 'symbolic-regrouping-after-fade', counterfactualPrompt: 'Create a second build for the same number using one more ten and ten fewer ones.',
    explanation: explain('Why is one ten interchangeable with ten ones?', 'Both representations have a value of ten.', 'A ten is larger because it is drawn longer.', 'Unit value, not visual size, makes one ten equal to ten ones.')
  },
  {
    id: 'g2-measure-unit-iteration', grade: 2, course: 'measure-money-time', lesson: 'mmt-02-03', step: 'i1', widget: 'lengthCompare',
    kernel: 'spatial-invariance', actionGoal: 'Compare lengths using equal units and a common starting point instead of visual impression.',
    invariants: ['measured-length-fixed', 'unit-size-consistent'], misconceptions: ['misaligned-starts', 'visual-size-only'],
    representations: ['diagram', 'table', 'symbolic', 'language'], translationFrom: 'diagram', translationTo: 'table',
    transferFamily: 'new-objects-same-unit', counterfactualPrompt: 'Imagine shifting one bar sideways without stretching it. Should its measured length change?',
    explanation: explain('What makes the comparison fair?', 'The same-size units and the measured counts determine length.', 'The object drawn farthest to the right must be longest.', 'Position can change while measured length stays fixed.')
  },
  {
    id: 'g2-shape-composition', grade: 2, course: 'shapes-shares-g2', lesson: 'ssg2-02-01', step: 'i1', widget: 'areaModel',
    kernel: 'spatial-invariance', actionGoal: 'Compose the rectangle from equal squares and coordinate rows, columns, and total squares.',
    invariants: ['target-boundary', 'equal-unit-squares', 'area-product'], misconceptions: ['add-rows-columns', 'unequal-units'],
    representations: ['diagram', 'table', 'symbolic', 'language'], translationFrom: 'diagram', translationTo: 'symbolic',
    transferFamily: 'rotated-grid-same-area', counterfactualPrompt: 'Rotate the rectangle. Which measurements trade places, and which quantity remains unchanged?',
    explanation: explain('Why do rows times columns count every square exactly once?', 'Each row has the same number of squares, and every row is included.', 'Rows and columns should be added because they are two numbers.', 'The grid is equal groups, so multiplication counts the full area.')
  },
  {
    id: 'g3-distributive-arrays', grade: 3, course: 'measurement-data', lesson: 'md-04-02', step: 'e1', widget: 'areaModel',
    kernel: 'equivalence-transformation', actionGoal: 'Build, rotate, and mentally split the array while preserving its product and area.',
    invariants: ['product-preserved', 'area-preserved'], misconceptions: ['partial-product-omission', 'perimeter-area-confusion'],
    representations: ['diagram', 'table', 'symbolic', 'language'], translationFrom: 'diagram', translationTo: 'symbolic',
    transferFamily: 'partial-products-new-factors', counterfactualPrompt: 'Split one side into two parts. How must the two partial areas recombine to equal the original product?',
    explanation: explain('What remains true when the array is split or rotated?', 'The same unit squares are regrouped, so total area and product stay fixed.', 'The product changes whenever the rectangle changes orientation.', 'Rearrangement preserves the counted unit squares.')
  },
  {
    id: 'g3-fraction-equivalence', grade: 3, course: 'fractions', lesson: 'fr-03-01', step: 'e1', widget: 'fractionBar',
    kernel: 'equivalence-transformation', actionGoal: 'Repartition the same whole and connect the bar, number-line point, and fraction symbol.',
    invariants: ['magnitude-preserved', 'whole-preserved'], misconceptions: ['denominator-size-conflation', 'unequal-whole'],
    representations: ['diagram', 'number-line', 'symbolic', 'language'], translationFrom: 'diagram', translationTo: 'number-line',
    transferFamily: 'equivalent-fraction-new-orientation', counterfactualPrompt: 'Double both the shaded parts and total parts. What changes visually, and what stays at the same number-line point?',
    explanation: explain('Why can two different-looking fractions be equivalent?', 'They name the same portion of the same whole and land at the same magnitude.', 'A fraction with a larger denominator is always larger.', 'Partition count may change while magnitude stays fixed.')
  },
  {
    id: 'g4-angle-invariants', grade: 4, course: 'lines-angles', lesson: 'la-01-02', step: 'e1', widget: 'angleMeasure',
    kernel: 'spatial-invariance', actionGoal: 'Rotate the ray to create the turn and reason about angle size independently of ray length.',
    invariants: ['angle-independent-of-ray-length', 'vertex-fixed'], misconceptions: ['wrong-scale', 'measurement-dependence'],
    representations: ['diagram', 'symbolic', 'language'], translationFrom: 'diagram', translationTo: 'symbolic',
    transferFamily: 'rotated-angle-no-horizontal-baseline', counterfactualPrompt: 'If both rays are drawn twice as long, what happens to the angle measure?',
    explanation: explain('What determines an angle’s measure?', 'The amount of turn between the rays, not their lengths.', 'Longer rays make a larger angle.', 'Angle measure is invariant under changing ray length.')
  },
  {
    id: 'g4-g5-decimal-regrouping', grade: 5, course: 'decimal-operations', lesson: 'dop-02-02', step: 'k3', widget: 'columnCalc',
    kernel: 'quantity-composition', actionGoal: 'Perform each carry as a place-value exchange and connect the action to the written algorithm.',
    invariants: ['quantity-preserved', 'place-value-preserved'], misconceptions: ['forgotten-carry', 'digit-wise-operation'],
    representations: ['concrete', 'table', 'symbolic', 'language'], translationFrom: 'table', translationTo: 'symbolic',
    transferFamily: 'decimal-operation-after-model-fades', counterfactualPrompt: 'Deliberately omit one carry. Which column becomes inconsistent with the place-value exchange?',
    explanation: explain('Why must a carry move into the next place?', 'Ten units in one place are exchanged for one unit in the next place.', 'A carry is an extra digit added by a rule with no value meaning.', 'Regrouping preserves quantity through place-value equivalence.')
  },
  {
    id: 'g5-fraction-scaling', grade: 5, course: 'fractions-multiply', lesson: 'fm-03-01', step: 'i1', widget: 'fractionBar',
    kernel: 'equivalence-transformation', actionGoal: 'Treat multiplication by a fraction as scaling and compare the product with both factors.',
    invariants: ['whole-defined', 'scaling-factor-controls-size'], misconceptions: ['multiply-numerators-only', 'product-always-larger'],
    representations: ['diagram', 'number-line', 'symbolic', 'language'], translationFrom: 'diagram', translationTo: 'symbolic',
    transferFamily: 'scaling-area-to-number-line', counterfactualPrompt: 'Hold one factor fixed and move the other below, at, and above one. How must the product respond?',
    explanation: explain('Why can multiplying make a number smaller?', 'A factor between zero and one scales the other quantity down.', 'Multiplication always produces a larger answer.', 'Product size depends on the scaling factor, not the operation name alone.')
  },
  {
    id: 'g5-coordinate-transformations', grade: 5, course: 'coordinate-geometry', lesson: 'cg-01-01', step: 'i1', widget: 'plotPoint',
    kernel: 'spatial-invariance', actionGoal: 'Construct the ordered pair through horizontal and vertical movement and explain the axis roles.',
    invariants: ['ordered-pair-axis-meaning'], misconceptions: ['xy-reversal', 'axis-order-confusion'],
    representations: ['graph', 'table', 'symbolic', 'language'], translationFrom: 'symbolic', translationTo: 'graph',
    transferFamily: 'unfamiliar-quadrant-or-shape', counterfactualPrompt: 'Swap the coordinates. Which movement changes first, and where does the point go?',
    explanation: explain('Why does coordinate order matter?', 'The first number controls horizontal position and the second controls vertical position.', 'Coordinates can be swapped because they use the same two numbers.', 'Axis roles make an ordered pair directional, not interchangeable.')
  },
  {
    id: 'g6-ratio-covariation', grade: 6, course: 'ratios-rates', lesson: 'rr-01-03', step: 'i1', widget: 'ratioTable',
    kernel: 'covariation', actionGoal: 'Scale both quantities together and test whether the unit rate remains invariant.',
    invariants: ['constant-ratio', 'paired-scaling'], misconceptions: ['additive-not-multiplicative', 'inconsistent-scaling'],
    representations: ['table', 'number-line', 'symbolic', 'graph', 'language'], translationFrom: 'table', translationTo: 'graph',
    transferFamily: 'new-units-reversed-orientation', counterfactualPrompt: 'Change only one quantity. What visible evidence shows that proportionality has broken?',
    explanation: explain('What makes two ratio pairs equivalent?', 'Both quantities are multiplied or divided by the same factor.', 'The same number is added to both quantities.', 'Equivalent ratios preserve a multiplicative relationship.')
  },
  {
    id: 'g6-g7-signed-number-structure', grade: 7, course: 'rational-number-operations', lesson: 'rno-01-01', step: 'i1', widget: 'integerChips',
    kernel: 'equivalence-transformation', actionGoal: 'Add and remove zero pairs while tracking the net signed value.',
    invariants: ['value-preserved-by-zero-pairs'], misconceptions: ['sign-error', 'negative-magnitude'],
    representations: ['concrete', 'number-line', 'symbolic', 'language'], translationFrom: 'concrete', translationTo: 'symbolic',
    transferFamily: 'signed-operation-without-chips', counterfactualPrompt: 'Add three positive-negative pairs. How can the board change while its net value stays identical?',
    explanation: explain('Why does a positive chip paired with a negative chip preserve value?', 'Their values sum to zero.', 'Two chips always increase the value by two.', 'A zero pair changes the model but not the net value.')
  },
  {
    id: 'g7-equation-transformations', grade: 7, course: 'two-step-equations', lesson: 'tse-02-04', step: 'i1', widget: 'solveBalance',
    kernel: 'equivalence-transformation', actionGoal: 'Apply legal inverse operations to both sides and preserve the solution set at every move.',
    invariants: ['equality-preserved', 'solution-set-preserved'], misconceptions: ['one-sided-operation', 'wrong-inverse'],
    representations: ['diagram', 'symbolic', 'language'], translationFrom: 'diagram', translationTo: 'symbolic',
    transferFamily: 'equation-with-fractions-no-balance', counterfactualPrompt: 'Apply an operation to only one side on purpose. What breaks, and how would you repair the trace?',
    explanation: explain('Why must the same legal operation be applied to both sides?', 'It creates an equivalent equation with the same solutions.', 'The two sides can be changed independently as long as x is isolated.', 'Balanced transformations preserve equality and the solution set.')
  },
  {
    id: 'g7-sampling-variability', grade: 6, course: 'data-distributions', lesson: 'dd-02-01', step: 'e1', widget: 'dotPlot',
    kernel: 'chance-sampling', actionGoal: 'Build and inspect a distribution while coordinating individual values, center, spread, and shape.',
    invariants: ['data-values-determine-distribution', 'sample-size-is-frequency-total'], misconceptions: ['axis-frequency-confusion', 'center-only'],
    representations: ['diagram', 'table', 'symbolic', 'language'], translationFrom: 'diagram', translationTo: 'table',
    transferFamily: 'new-distribution-same-statistical-claim', counterfactualPrompt: 'Move one extreme value farther away. Which measures should change, and which might stay stable?',
    explanation: explain('Why must a claim about a distribution use more than its center?', 'Spread and shape can differ even when centers match.', 'The mean alone completely describes every dataset.', 'A distribution is determined by the pattern of all its values.')
  },
  {
    id: 'g8-functions-covariation', grade: 8, course: 'functions-g8', lesson: 'fg-01-01', step: 'e1', widget: 'functionMachine',
    kernel: 'covariation', actionGoal: 'Vary the input and coordinate the output, table row, graph point, and equation.',
    invariants: ['one-output-per-input', 'rule-consistent'], misconceptions: ['input-output-reversal', 'additive-rule-only'],
    representations: ['table', 'symbolic', 'graph', 'language'], translationFrom: 'table', translationTo: 'graph',
    transferFamily: 'unfamiliar-story-to-graph', counterfactualPrompt: 'Increase the input by one repeatedly. What pattern must appear in the outputs, table, and graph?',
    explanation: explain('What makes this mapping a function?', 'Each input is transformed by the same rule into exactly one output.', 'Different inputs must always have different outputs.', 'A function requires one output per input, not unique outputs overall.')
  },
  {
    id: 'g8-systems-equivalent-views', grade: 8, course: 'linear-equations-systems', lesson: 'les-03-01', step: 'i1', widget: 'systemsExplore',
    kernel: 'covariation', actionGoal: 'Locate the point satisfying both constraints and connect intersection to simultaneous substitution.',
    invariants: ['shared-solution', 'equivalent-system'], misconceptions: ['one-equation-only', 'intersection-as-decoration'],
    representations: ['graph', 'table', 'symbolic', 'language'], translationFrom: 'graph', translationTo: 'symbolic',
    transferFamily: 'noninteger-or-no-intersection-system', counterfactualPrompt: 'Move to a point on only one line. Which equation is satisfied, and why is it not yet a system solution?',
    explanation: explain('Why is the intersection the solution of the system?', 'Its coordinates make both equations true at the same time.', 'It is the visually highest point on either line.', 'A system solution must satisfy every constraint simultaneously.')
  },
  {
    id: 'g8-bivariate-association', grade: 8, course: 'bivariate-statistics', lesson: 'bv-02-01', step: 'e1', widget: 'scatterFit',
    kernel: 'chance-sampling', actionGoal: 'Fit and perturb a model while residual direction and overall association update together.',
    invariants: ['association-not-causation', 'residual-direction'], misconceptions: ['through-every-point', 'outlier-ignored'],
    representations: ['graph', 'table', 'symbolic', 'language'], translationFrom: 'graph', translationTo: 'symbolic',
    transferFamily: 'unfamiliar-dataset-defend-claim', counterfactualPrompt: 'Move one point far from the cluster. How should the best-fit line and residual pattern respond?',
    explanation: explain('What makes a line a useful fit?', 'It balances the overall residual pattern and captures the association without needing to hit every point.', 'It must pass through every data point exactly.', 'A best-fit model summarizes a trend; it is not interpolation through every observation.')
  }
];

const defaultPredictions = {
  'g2-measure-unit-iteration': {
    prompt: 'If a measured object is shifted sideways without being stretched, what happens to its length?',
    options: [{ id: 'same', label: 'It stays the same' }, { id: 'longer', label: 'It becomes longer' }, { id: 'shorter', label: 'It becomes shorter' }],
    outcomeId: 'same',
    reveal: 'Position can change without changing length. Fair comparison depends on equal units and aligned starts, not where the drawing sits.'
  },
  'g4-g5-decimal-regrouping': {
    prompt: 'When one column creates ten or more units, what must happen before the next column is finished?',
    options: [{ id: 'exchange', label: 'Exchange ten units for one in the next place' }, { id: 'ignore', label: 'Ignore the extra ten' }, { id: 'repeat', label: 'Repeat the same digit' }],
    outcomeId: 'exchange',
    reveal: 'A carry is a place-value exchange: ten units in one place become one unit in the next place while the total value stays unchanged.'
  }
};

const installed = [];
for (const pilot of PILOTS) {
  const file = path.join(root, 'content', 'courses', pilot.course, 'lessons', `${pilot.lesson}.json`);
  if (!fs.existsSync(file)) throw new Error(`Missing pilot lesson: ${file}`);
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const step = json.steps?.find((candidate) => candidate.id === pilot.step);
  if (!step) throw new Error(`Missing pilot step: ${pilot.course}/${pilot.lesson}#${pilot.step}`);
  if (step.widget?.type !== pilot.widget)
    throw new Error(`Pilot surface mismatch ${pilot.id}: expected ${pilot.widget}, found ${step.widget?.type}`);
  if (!step.predict && defaultPredictions[pilot.id]) step.predict = defaultPredictions[pilot.id];
  if (!step.predict) throw new Error(`Flagship pilot ${pilot.id} requires a prediction commitment`);
  step.cml = {
    stage: 'construct', flagship: true, kernel: pilot.kernel, actionGoal: pilot.actionGoal,
    predictionId: `${pilot.id}-prediction`, invariants: pilot.invariants, misconceptions: pilot.misconceptions,
    representations: pilot.representations, translationFrom: pilot.translationFrom, translationTo: pilot.translationTo,
    fadeLevel: pilot.grade <= 2 ? 0 : pilot.grade <= 5 ? 1 : 2,
    transferFamily: pilot.transferFamily, delayed: true, counterfactualPrompt: pilot.counterfactualPrompt,
    explanation: pilot.explanation
  };
  if (write) fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  installed.push({ id: pilot.id, grade: pilot.grade, courseId: pilot.course, lessonId: pilot.lesson, stepId: pilot.step, widget: pilot.widget, file: path.relative(root, file) });
}

const manifest = {
  version: 2,
  release: 'session-89-cml-integrated-pilot',
  method: 'Predict → Construct → Observe → Explain → Revise → Generalize → Retrieve',
  count: installed.length,
  pilots: installed
};
if (write) {
  const out = path.join(root, 'content', 'cml', 'integrated-pilots.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`);
}
console.log(`${write ? 'Applied' : 'Verified'} ${installed.length} integrated CML pilot steps.`);
