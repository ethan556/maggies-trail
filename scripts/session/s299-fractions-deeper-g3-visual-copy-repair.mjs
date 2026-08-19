import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const course = 'fractions-deeper-g3';

const repairs = [
  {
    workId: 'VIS-g3f-01-03-c1-frac-three-fourths',
    lessonId: 'g3f-01-03',
    stepId: 'c1',
    figure: 'frac-three-fourths',
    before: 'Every fraction is built from unit fractions: 3/4 is simply 1/4 and 1/4 and 1/4 — three pieces of the same size.',
    after: 'The bar is split into four equal pieces, and three are shaded: 3/4. Each shaded piece is one unit fourth.',
  },
  {
    workId: 'VIS-g3f-01-05-c2-mc-ruler-eighths',
    lessonId: 'g3f-01-05',
    stepId: 'c2',
    figure: 'mc-ruler-eighths',
    before: 'On an eighths ruler the marks are 1/8, 2/8, 3/8 and onward. Count JUMPS from zero, never the tick marks themselves.',
    after: 'This ruler marks 6/8, which is the same length as 3/4. Count the six equal jumps from zero to the marked tick.',
  },
  {
    workId: 'VIS-g3f-02-01-c2-frac-numline-unit',
    lessonId: 'g3f-02-01',
    stepId: 'c2',
    figure: 'frac-numline-unit',
    before: 'Count spaces, not marks. A fourths line has five marks but four jumps; a thirds line has four marks but three jumps.',
    after: 'This fourths line marks 1/4 after one equal jump from zero. On any fraction line, count equal spaces rather than tick marks.',
  },
  {
    workId: 'VIS-g3f-02-02-c1-thirds-compare',
    lessonId: 'g3f-02-02',
    stepId: 'c1',
    figure: 'thirds-compare',
    before: 'Sixths and eighths cut the same journey into more, smaller jumps — and the more jumps there are, the shorter each one becomes.',
    after: 'Halves, thirds, and fourths cut the same whole into more equal pieces. More equal pieces make each piece smaller.',
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readLesson(lessonId) {
  const file = path.join(root, 'content', 'courses', course, 'lessons', `${lessonId}.json`);
  return { file, lesson: JSON.parse(await fs.readFile(file, 'utf8')) };
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
    const step = lesson.steps?.find((candidate) => candidate.id === repair.stepId);
    assert(step?.kind === 'concept', `${repair.workId}: expected concept step`);
    assert(step.figure === repair.figure, `${repair.workId}: fixed semantic figure changed`);
    assert(
      (step.body === repair.before && step.narration === repair.before) ||
      (step.body === repair.after && step.narration === repair.after),
      `${repair.workId}: source is not at a sealed before/after copy state`,
    );
    if (step.body === repair.before) {
      changed += 1;
      step.body = repair.after;
      step.narration = repair.after;
    }
  }

  if (checkOnly && changed > 0) throw new Error(`${course}: ${changed} visual-copy repair(s) are not current`);
  if (!checkOnly) {
    for (const { file, lesson } of documents.values()) {
      await fs.writeFile(file, `${JSON.stringify(lesson, null, 2)}\n`);
    }
  }
  console.log(JSON.stringify({ course, signedRootCauseClosures: repairs.length, changed, current: changed === 0 }));
}

await main();
