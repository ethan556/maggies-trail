import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const lessonsRoot = path.join(process.cwd(), 'content', 'courses', 'unlike-fractions-g5', 'lessons');

const cases = [
  {
    lessonId: 'g5u-01-05',
    stepId: 'k2',
    conceptTag: 'g5u-add',
    variant: { gen: 'g4-fractions', form: 'faLikeDenomWordMcq' },
    prompt: 'When you add 5/12 + 5/12, what happens to the denominator?',
    labels: [
      'The denominator stays 12.',
      'The denominator becomes 24.',
      'The denominator becomes 10.',
      'The denominator disappears.',
    ],
    feedback: [
      'Correct — adding counts how many same-size pieces you hold; it never re-cuts them.',
      'Doubling the denominator would halve every piece, changing the amount instead of counting it.',
      'That is the numerator of the answer — the count of pieces, not their size.',
      'Without a denominator the pieces have no size, and the answer would name nothing.',
    ],
  },
  {
    lessonId: 'g5u-02-01',
    stepId: 'k3',
    conceptTag: 'g5u-sub',
    variant: { gen: 'g4-fractions', form: 'faLikeDenomWordMcq' },
    prompt: 'When you add 6/12 + 5/12, what happens to the denominator?',
    labels: [
      'The denominator stays 12.',
      'The denominator becomes 24.',
      'The denominator becomes 11.',
      'The denominator disappears.',
    ],
    feedback: [
      'Correct — adding counts how many same-size pieces you hold; it never re-cuts them.',
      'Doubling the denominator would halve every piece, changing the amount instead of counting it.',
      'That is the numerator of the answer — the count of pieces, not their size.',
      'Without a denominator the pieces have no size, and the answer would name nothing.',
    ],
  },
  {
    lessonId: 'g5u-03-02',
    stepId: 'k1',
    conceptTag: 'g5u-reasonable',
    variant: undefined,
    prompt: 'A student computes 1/2 + 1/3 and gets 5/6. Is that reasonable?',
    labels: [
      'Yes: 5/6 is between 1/2 and 1.',
      'No: a fraction sum must exceed 1.',
      'No: adding across gives 2/5.',
      'No: estimates cannot test sums.',
    ],
    feedback: [
      'Correct — both fractions are under a half and a half, so the sum must sit between 1/2 and 1.',
      'Two fractions each below one whole need not reach one; 1/2 + 1/3 falls short of it.',
      '2/5 is less than 1/2, and a sum can never be smaller than one of the parts being added.',
      'There is: comparing the answer to each part and to one whole rules out most wrong answers instantly.',
    ],
  },
  {
    lessonId: 'g5u-03-02',
    stepId: 'k3',
    conceptTag: 'g5u-reasonable',
    variant: undefined,
    prompt: 'A benchmark line places 5/6 between 1/2 and 1. What does that show about the proposed sum 1/2 + 1/3?',
    labels: [
      'It supports 5/6 between 1/2 and 1.',
      'It rejects 5/6: sums must exceed 1.',
      'It rejects 5/6: adding across gives 2/5.',
      'It rejects 5/6: benchmarks cannot test sums.',
    ],
    feedback: [
      'Correct — both fractions are under a half and a half, so the sum must sit between 1/2 and 1.',
      'Two fractions each below one whole need not reach one; 1/2 + 1/3 falls short of it.',
      '2/5 is less than 1/2, and a sum can never be smaller than one of the parts being added.',
      'There is: comparing the answer to each part and to one whole rules out most wrong answers instantly.',
    ],
  },
];

function readLesson(lessonId: string) {
  return JSON.parse(fs.readFileSync(path.join(lessonsRoot, `${lessonId}.json`), 'utf8'));
}

describe('S297 unlike-fractions Grade 5 choice-surface repair', () => {
  test('keeps the four repaired MCQs parallel without altering runtime contracts', () => {
    for (const item of cases) {
      const lesson = readLesson(item.lessonId);
      const step = lesson.steps.find((candidate: { id: string }) => candidate.id === item.stepId);
      const options = step.widget.options;
      const lengths = options.map((option: { label: string }) => option.label.length);

      expect(step.kind).toBe('check');
      expect(step.conceptTag).toBe(item.conceptTag);
      expect(step.variant).toEqual(item.variant);
      expect(step.widget.type).toBe('mcq');
      expect(step.widget.prompt).toBe(item.prompt);
      expect(options.map((option: { id: string }) => option.id)).toEqual(['o0', 'o1', 'o2', 'o3']);
      expect(options.map((option: { correct: boolean }) => option.correct)).toEqual([true, false, false, false]);
      expect(options.map((option: { label: string }) => option.label)).toEqual(item.labels);
      expect(options.map((option: { feedback: string }) => option.feedback)).toEqual(item.feedback);
      expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(15);
    }
  });

  test('keeps the complete 14-lesson course inventory intact', () => {
    const lessonIds = fs.readdirSync(lessonsRoot).filter((file) => file.endsWith('.json')).sort();
    expect(lessonIds).toEqual([
      'g5u-01-01.json', 'g5u-01-02.json', 'g5u-01-03.json', 'g5u-01-04.json', 'g5u-01-05.json',
      'g5u-02-01.json', 'g5u-02-02.json', 'g5u-02-03.json', 'g5u-02-04.json', 'g5u-02-05.json',
      'g5u-03-01.json', 'g5u-03-02.json', 'g5u-03-03.json', 'g5u-03-04.json',
    ]);
  });
});
