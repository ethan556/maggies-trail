import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const course = 'unlike-fractions-g5';
const optionIds = ['o0', 'o1', 'o2', 'o3'];

const repairs = [
  {
    workId: 'CHOICE-0094',
    lessonId: 'g5u-01-05',
    stepId: 'k2',
    before: ['It stays at 12', 'It doubles to 24', 'It changes to 10', 'It is removed'],
    after: [
      'The denominator stays 12.',
      'The denominator becomes 24.',
      'The denominator becomes 10.',
      'The denominator disappears.',
    ],
  },
  {
    workId: 'CHOICE-0095',
    lessonId: 'g5u-02-01',
    stepId: 'k3',
    before: ['It stays at 12', 'It doubles to 24', 'It changes to 11', 'It is removed'],
    after: [
      'The denominator stays 12.',
      'The denominator becomes 24.',
      'The denominator becomes 11.',
      'The denominator disappears.',
    ],
  },
  {
    workId: 'CHOICE-0096',
    lessonId: 'g5u-03-02',
    stepId: 'k1',
    before: [
      'Reasonable — it is greater than each addend and below 1',
      'Unreasonable — every fraction sum must exceed 1',
      'Unreasonable — adding across should give 2/5',
      'Undecidable — estimation cannot test a fraction sum',
    ],
    after: [
      'Yes: 5/6 is between 1/2 and 1.',
      'No: a fraction sum must exceed 1.',
      'No: adding across gives 2/5.',
      'No: estimates cannot test sums.',
    ],
  },
  {
    workId: 'CHOICE-0097',
    lessonId: 'g5u-03-02',
    stepId: 'k3',
    before: [
      'It supports 5/6 — the sum lies above both addends and below 1',
      'It rejects 5/6 — every fraction sum must exceed 1',
      'It rejects 5/6 — adding across should give 2/5',
      'It cannot test 5/6 — benchmarks do not check sums',
    ],
    after: [
      'It supports 5/6 between 1/2 and 1.',
      'It rejects 5/6: sums must exceed 1.',
      'It rejects 5/6: adding across gives 2/5.',
      'It rejects 5/6: benchmarks cannot test sums.',
    ],
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sameLabels(actual, expected) {
  return actual.length === expected.length && actual.every((label, index) => label === expected[index]);
}

function optionLengthSpread(labels) {
  return Math.max(...labels.map((label) => label.length)) - Math.min(...labels.map((label) => label.length));
}

async function readLesson(lessonId) {
  const file = path.join(root, 'content', 'courses', course, 'lessons', `${lessonId}.json`);
  return { file, lesson: JSON.parse(await fs.readFile(file, 'utf8')) };
}

function targetStep(lesson, repair) {
  const step = lesson.steps?.find((candidate) => candidate.id === repair.stepId);
  assert(step?.kind === 'check', `${repair.workId}: expected check step ${repair.stepId}`);
  assert(step.widget?.type === 'mcq', `${repair.workId}: expected MCQ widget`);
  assert(step.widget.options?.length === optionIds.length, `${repair.workId}: expected four options`);
  assert(
    step.widget.options.every((option, index) => option.id === optionIds[index]),
    `${repair.workId}: option IDs or order changed`,
  );
  assert(
    step.widget.options.filter((option) => option.correct === true).length === 1 && step.widget.options[0].correct === true,
    `${repair.workId}: correct-option contract changed`,
  );
  assert(
    step.widget.options.every((option) => typeof option.feedback === 'string' && option.feedback.trim().length > 0),
    `${repair.workId}: option feedback must remain present`,
  );
  return step;
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  const documents = new Map();
  for (const repair of repairs) {
    if (!documents.has(repair.lessonId)) documents.set(repair.lessonId, await readLesson(repair.lessonId));
  }

  let changed = 0;
  for (const repair of repairs) {
    const { lesson } = documents.get(repair.lessonId);
    const step = targetStep(lesson, repair);
    const labels = step.widget.options.map((option) => option.label);
    assert(
      sameLabels(labels, repair.before) || sameLabels(labels, repair.after),
      `${repair.workId}: source differs from the sealed before/after vectors`,
    );
    if (sameLabels(labels, repair.before)) {
      changed += 1;
      step.widget.options.forEach((option, index) => {
        option.label = repair.after[index];
      });
    }
    assert(optionLengthSpread(repair.after) <= 15, `${repair.workId}: post-repair option lengths are not parallel`);
  }

  if (checkOnly && changed > 0) {
    throw new Error(`${course}: ${changed} approved choice-surface repair(s) are not current`);
  }
  if (!checkOnly) {
    for (const { file, lesson } of documents.values()) {
      await fs.writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
    }
  }
  console.log(JSON.stringify({ course, signedRootCauseClosures: repairs.length, changed, current: changed === 0 }));
}

await main();
