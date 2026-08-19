import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const lessonsRoot = path.join(process.cwd(), 'content', 'courses', 'decimal-operations', 'lessons');

const choices = [
  {
    lessonId: 'dop-02-02',
    stepId: 'i2',
    labels: [
      'The tens part of the ones product moves to the tens column.',
      'The carry exists only to make the answer larger.',
      'The carry exists only because the algorithm says so.',
    ],
    contractHash: '6d5d1e5c18141527aa80ca8f5ee17960b3bac4906f96b61cf4544f4efad848e6',
  },
  {
    lessonId: 'dop-02-03',
    stepId: 'i2',
    labels: [
      'The row represents tens, so it begins in the tens place.',
      'The zero decorates the second row after multiplying.',
      'The first row is too small to hold the result.',
    ],
    contractHash: '46fb9b3f75dcb57bdf59dc464f5306c01014b39d0c4a943f3c793e6fe08e3223',
  },
  {
    lessonId: 'dop-03-01',
    stepId: 'i2',
    labels: [
      "It predicts the quotient's size before you compute exactly.",
      'It predicts the exact remainder before you compute.',
      'It gives no useful information before you compute.',
    ],
    contractHash: 'd583adccb1b1843aabef29ae3eb6aa967e8c21aebe3d432eb96e80caa873654b',
  },
];

const progressions = [
  {
    lessonId: 'dop-03-01',
    stepId: 'k2',
    body: 'Build a compatible division.',
    prompt: 'Round 612 ÷ 29 once to the compatible division 600 ÷ 30. What quotient should that estimate give?',
    contractHash: '8f9e5870ff499cb646fef9e5b9d8ffb05439bbe1827c86715d5993cf54174447',
  },
  {
    lessonId: 'dop-03-01',
    stepId: 'k3',
    body: 'Reject an implausible quotient.',
    prompt: 'A student says 423 ÷ 19 is about 2. Use 420 ÷ 20 to give the estimate that disproves the claim.',
    contractHash: 'd52466323938cd7dad11b101016129dfc4761a6dd5b3c7abc7706f77441a2f5c',
  },
  {
    lessonId: 'dop-04-02',
    stepId: 'k2',
    body: 'Trace the zero-borrow chain.',
    prompt: 'Track the borrow across both zeros in 10.00 − 3.47. What difference results? (enter as a decimal)',
    contractHash: 'e03fa5e26821e1e52c3b23fe08101178f94a5688934d891767990e8f5978449b',
  },
  {
    lessonId: 'dop-05-01',
    stepId: 'k3',
    body: 'Write the equivalent product.',
    prompt: '1.5 × 0.2 gives 0.30 after placing two decimal digits. What equivalent decimal should you enter? (enter as a decimal)',
    contractHash: '56e6277d2155cdb9053a745c2588ed1cd071697c03a5648329ac6de8aea7147e',
  },
  {
    lessonId: 'dop-05-02',
    stepId: 'ch1',
    body: 'Bound the product, then place the point.',
    prompt: 'Use 2 × 1 ≈ 2 to check 1.5 × 1.2. What product fits that estimate? (enter as a decimal)',
    contractHash: '9fa86b9b6f18fe22437dd1718b5ac2890227ecae21e52729ab4df764f5adecc2',
  },
  {
    lessonId: 'dop-05-03',
    stepId: 'k1',
    body: 'Trace the decimal’s vertical path.',
    prompt: 'For 7.5 ÷ 5, 75 ÷ 5 gives 15. Where does the decimal land in the quotient? (enter as a decimal)',
    contractHash: '34ce10ce0e67bf8371eab425c4d5bea25a4cadd3f4e93a5e78da9d38fd4648d1',
  },
];

const previousFigureWithholdings = [
  ['dop-02-02', 'c1'], ['dop-02-02', 'c2'], ['dop-02-03', 'c2'], ['dop-03-01', 'c2'],
  ['dop-04-02', 'c1'], ['dop-04-02', 'c2'], ['dop-05-02', 'c1'], ['dop-05-02', 'c2'], ['dop-05-03', 'c1'],
];

function readLesson(lessonId: string) {
  return JSON.parse(fs.readFileSync(path.join(lessonsRoot, `${lessonId}.json`), 'utf8'));
}

function readStep(lessonId: string, stepId: string) {
  return readLesson(lessonId).steps.find((step: { id: string }) => step.id === stepId);
}

function hash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

describe('S298 Decimal Operations P1 repair', () => {
  test('keeps all three repaired MCQ contracts while making labels parallel', () => {
    for (const item of choices) {
      const step = structuredClone(readStep(item.lessonId, item.stepId));
      const lengths = step.widget.options.map((option: { label: string }) => option.label.length);
      for (const option of step.widget.options) delete option.label;

      expect(step.kind).toBe('interactive');
      expect(step.widget.type).toBe('mcq');
      expect(step.widget.options.map((option: { id: string }) => option.id)).toEqual(['a', 'b', 'c']);
      expect(step.widget.options.map((option: { correct: boolean }) => option.correct === true)).toEqual([true, false, false]);
      expect(step.widget.options.every((option: { feedback: string }) => option.feedback.length > 0)).toBe(true);
      expect(hash(step)).toBe(item.contractHash);

      const actual = readStep(item.lessonId, item.stepId).widget.options.map((option: { label: string }) => option.label);
      expect(actual).toEqual(item.labels);
      expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(15);
    }
  });

  test('gives the six progression placements distinct learner jobs without changing evaluators', () => {
    for (const item of progressions) {
      const step = structuredClone(readStep(item.lessonId, item.stepId));
      const { body } = step;
      const prompt = step.widget.prompt;
      delete step.body;
      delete step.widget.prompt;

      expect(['check', 'challenge']).toContain(step.kind);
      expect(['numeric', 'placeValueTransformLab']).toContain(step.widget.type);
      expect(body).toBe(item.body);
      expect(prompt).toBe(item.prompt);
      expect(hash(step)).toBe(item.contractHash);
    }
  });

  test('retains all nine prior S266 fixed-figure fail-closures', () => {
    for (const [lessonId, stepId] of previousFigureWithholdings) {
      expect(readStep(lessonId, stepId).figure).toBeUndefined();
    }
  });
});
