import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const course = 'decimal-operations';

const choiceRepairs = [
  {
    workId: 'CHOICE-0047',
    lessonId: 'dop-02-02',
    stepId: 'i2',
    before: [
      'The ones product spilled past 9 into the tens place',
      'To make the answer bigger',
      "It's just a rule with no reason",
    ],
    after: [
      'The tens part of the ones product moves to the tens column.',
      'The carry exists only to make the answer larger.',
      'The carry exists only because the algorithm says so.',
    ],
  },
  {
    workId: 'CHOICE-0048',
    lessonId: 'dop-02-03',
    stepId: 'i2',
    before: [
      'Because that row multiplies by the tens digit, which stands for a multiple of ten',
      'Because you always put a 0 there for decoration',
      'Because the first row was too small',
    ],
    after: [
      'The row represents tens, so it begins in the tens place.',
      'The zero decorates the second row after multiplying.',
      'The first row is too small to hold the result.',
    ],
  },
  {
    workId: 'CHOICE-0049',
    lessonId: 'dop-03-01',
    stepId: 'i2',
    before: [
      'A rough size for the answer, to catch big mistakes',
      'The exact remainder',
      'Nothing useful',
    ],
    after: [
      "It predicts the quotient's size before you compute exactly.",
      'It predicts the exact remainder before you compute.',
      'It gives no useful information before you compute.',
    ],
  },
];

const progressionRepairs = [
  {
    workId: 'PROGRESSION-dop-03-01',
    lessonId: 'dop-03-01',
    stepId: 'k2',
    before: {
      body: 'A bigger quotient.',
      prompt: 'Estimate 612 ÷ 29 using 600 ÷ 30. About what is it?',
    },
    after: {
      body: 'Build a compatible division.',
      prompt: 'Round 612 ÷ 29 once to the compatible division 600 ÷ 30. What quotient should that estimate give?',
    },
  },
  {
    workId: 'PROGRESSION-dop-03-01',
    lessonId: 'dop-03-01',
    stepId: 'k3',
    before: {
      body: 'Estimate to catch an error.',
      prompt: 'Estimate 423 ÷ 19 using 420 ÷ 20. About what is it?',
    },
    after: {
      body: 'Reject an implausible quotient.',
      prompt: 'A student says 423 ÷ 19 is about 2. Use 420 ÷ 20 to give the estimate that disproves the claim.',
    },
  },
  {
    workId: 'PROGRESSION-dop-04-02',
    lessonId: 'dop-04-02',
    stepId: 'k2',
    before: {
      body: 'Borrow across zeros.',
      prompt: 'Subtract 10.0 − 3.47 (pad 10.0 to 10.00). (enter as a decimal)',
    },
    after: {
      body: 'Trace the zero-borrow chain.',
      prompt: 'Track the borrow across both zeros in 10.00 − 3.47. What difference results? (enter as a decimal)',
    },
  },
  {
    workId: 'PROGRESSION-dop-05-01',
    lessonId: 'dop-05-01',
    stepId: 'k3',
    before: {
      body: 'One more with a tidy-up.',
      prompt: '1.5 × 0.2 (15 × 2 = 30, two decimal places → 0.30). Give the product. (enter as a decimal)',
    },
    after: {
      body: 'Write the equivalent product.',
      prompt: '1.5 × 0.2 gives 0.30 after placing two decimal digits. What equivalent decimal should you enter? (enter as a decimal)',
    },
  },
  {
    workId: 'PROGRESSION-dop-05-02',
    lessonId: 'dop-05-02',
    stepId: 'ch1',
    before: {
      body: 'Multiply, count, and check.',
      prompt: '1.5 × 1.2. Give the product. (enter as a decimal)',
    },
    after: {
      body: 'Bound the product, then place the point.',
      prompt: 'Use 2 × 1 ≈ 2 to check 1.5 × 1.2. What product fits that estimate? (enter as a decimal)',
    },
  },
  {
    workId: 'PROGRESSION-dop-05-03',
    lessonId: 'dop-05-03',
    stepId: 'k1',
    before: {
      body: 'A quotient over one.',
      prompt: '7.5 ÷ 5 (75 ÷ 5 = 15, point straight up). What is the quotient? (enter as a decimal)',
    },
    after: {
      body: 'Trace the decimal’s vertical path.',
      prompt: 'For 7.5 ÷ 5, 75 ÷ 5 gives 15. Where does the decimal land in the quotient? (enter as a decimal)',
    },
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sameVector(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function lengthSpread(labels) {
  return Math.max(...labels.map((label) => label.length)) - Math.min(...labels.map((label) => label.length));
}

async function loadLesson(lessonId) {
  const file = path.join(root, 'content', 'courses', course, 'lessons', `${lessonId}.json`);
  return { file, lesson: JSON.parse(await fs.readFile(file, 'utf8')) };
}

function findStep(lesson, repair) {
  const step = lesson.steps?.find((candidate) => candidate.id === repair.stepId);
  assert(step, `${repair.workId}: missing ${repair.lessonId}/${repair.stepId}`);
  return step;
}

function assertChoiceContract(step, repair) {
  assert(step.kind === 'interactive' && step.widget?.type === 'mcq', `${repair.workId}: expected interactive MCQ`);
  assert(step.widget.options?.length === 3, `${repair.workId}: expected three options`);
  assert(
    sameVector(step.widget.options.map((option) => option.id), ['a', 'b', 'c']),
    `${repair.workId}: option IDs or order changed`,
  );
  assert(
    sameVector(step.widget.options.map((option) => option.correct === true), [true, false, false]),
    `${repair.workId}: correctness contract changed`,
  );
  assert(
    step.widget.options.every((option) => typeof option.feedback === 'string' && option.feedback.trim().length > 0),
    `${repair.workId}: feedback contract changed`,
  );
}

function assertProgressionContract(step, repair) {
  assert(step.kind === 'check' || step.kind === 'challenge', `${repair.workId}: expected check or challenge`);
  assert(['numeric', 'placeValueTransformLab'].includes(step.widget?.type), `${repair.workId}: expected current evaluator widget`);
  assert(typeof step.widget?.prompt === 'string', `${repair.workId}: missing evaluator prompt`);
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  const documents = new Map();
  for (const repair of [...choiceRepairs, ...progressionRepairs]) {
    if (!documents.has(repair.lessonId)) documents.set(repair.lessonId, await loadLesson(repair.lessonId));
  }

  let changed = 0;
  for (const repair of choiceRepairs) {
    const step = findStep(documents.get(repair.lessonId).lesson, repair);
    assertChoiceContract(step, repair);
    const labels = step.widget.options.map((option) => option.label);
    assert(sameVector(labels, repair.before) || sameVector(labels, repair.after), `${repair.workId}: unexpected label vector`);
    assert(lengthSpread(repair.after) <= 15, `${repair.workId}: repaired labels are not parallel`);
    if (sameVector(labels, repair.before)) {
      changed += 1;
      step.widget.options.forEach((option, index) => { option.label = repair.after[index]; });
    }
  }

  for (const repair of progressionRepairs) {
    const step = findStep(documents.get(repair.lessonId).lesson, repair);
    assertProgressionContract(step, repair);
    const current = { body: step.body, prompt: step.widget.prompt };
    const isBefore = current.body === repair.before.body && current.prompt === repair.before.prompt;
    const isAfter = current.body === repair.after.body && current.prompt === repair.after.prompt;
    assert(isBefore || isAfter, `${repair.workId}/${repair.stepId}: unexpected learner-job copy`);
    if (isBefore) {
      changed += 1;
      step.body = repair.after.body;
      step.widget.prompt = repair.after.prompt;
    }
  }

  if (checkOnly && changed > 0) throw new Error(`${course}: ${changed} approved P1 repair(s) are not current`);
  if (!checkOnly) {
    for (const { file, lesson } of documents.values()) {
      await fs.writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
    }
  }
  console.log(JSON.stringify({ course, signedRootCauseClosures: choiceRepairs.length + 5, changed, current: changed === 0 }));
}

await main();
