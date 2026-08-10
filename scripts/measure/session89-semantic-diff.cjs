const fs = require('fs');
const path = require('path');
const assert = require('assert');

const baseline = process.argv[2];
if (!baseline) throw new Error('usage: node session89-semantic-diff.cjs <session87-baseline-root>');

const manifest = JSON.parse(fs.readFileSync('content/cml/integrated-pilots.json', 'utf8'));
const pilots = new Map(manifest.pilots.map((p) => [`${p.courseId}/${p.lessonId}/${p.stepId}`, p]));
const predictionAdds = new Set([
  'measure-money-time/mmt-02-03/i1',
  'decimal-operations/dop-02-02/k3'
]);

const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
};

let lessonFiles = 0;
let steps = 0;
let cmlAdditions = 0;
let predictionAdditions = 0;
let changedLessonFiles = 0;

const courses = fs.readdirSync('content/courses').sort();
for (const course of courses) {
  const currentDir = path.join('content', 'courses', course, 'lessons');
  const baseDir = path.join(baseline, 'content', 'courses', course, 'lessons');
  if (!fs.existsSync(currentDir) || !fs.existsSync(baseDir)) continue;
  const currentNames = fs.readdirSync(currentDir).filter((f) => f.endsWith('.json')).sort();
  const baseNames = fs.readdirSync(baseDir).filter((f) => f.endsWith('.json')).sort();
  assert.deepStrictEqual(currentNames, baseNames, `${course}: lesson file set drift`);
  for (const file of currentNames) {
    lessonFiles++;
    const current = JSON.parse(fs.readFileSync(path.join(currentDir, file), 'utf8'));
    const original = JSON.parse(fs.readFileSync(path.join(baseDir, file), 'utf8'));
    const originalById = new Map((original.steps || []).map((step) => [step.id, step]));
    let changed = false;
    for (const step of current.steps || []) {
      steps++;
      const before = originalById.get(step.id);
      assert(before, `${course}/${file}/${step.id}: unexpected new step`);
      const key = `${course}/${path.basename(file, '.json')}/${step.id}`;
      const normalized = structuredClone(step);
      if (pilots.has(key)) {
        assert(!Object.hasOwn(before, 'cml'), `${key}: baseline unexpectedly has CML metadata`);
        assert(normalized.cml?.flagship === true, `${key}: flagship CML metadata missing`);
        delete normalized.cml;
        cmlAdditions++;
        changed = true;
      } else {
        assert.deepStrictEqual(normalized.cml, before.cml, `${key}: non-pilot CML drift`);
      }
      if (predictionAdds.has(key)) {
        assert(!before.predict, `${key}: prediction was not an addition`);
        assert(normalized.predict, `${key}: expected prediction addition missing`);
        delete normalized.predict;
        predictionAdditions++;
      }
      assert.deepStrictEqual(canonical(normalized), canonical(before), `${key}: authored lesson drift beyond allowed CML metadata`);
    }
    assert.equal((current.steps || []).length, (original.steps || []).length, `${course}/${file}: step count drift`);
    if (changed) changedLessonFiles++;
  }
}

assert.equal(cmlAdditions, manifest.count, 'CML pilot addition count');
assert.equal(predictionAdditions, predictionAdds.size, 'prediction addition count');
console.log(JSON.stringify({
  lessonFiles,
  steps,
  changedLessonFiles,
  cmlAdditions,
  predictionAdditions,
  authoredChangesOutsideCML: 0,
  status: 'PASS'
}));
