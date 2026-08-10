const fs = require('fs');
const path = require('path');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
}).outputText, f);
const V = require('../../src/lib/variants.ts');

const grades = {};
let total = 0;
let served = 0;
let k8Lessons = 0;
let k8WidgetSteps = 0;
let flagshipSteps = 0;
for (const courseId of fs.readdirSync('content/courses').sort()) {
  const courseFile = path.join('content', 'courses', courseId, 'course.json');
  const lessonDir = path.join('content', 'courses', courseId, 'lessons');
  if (!fs.existsSync(courseFile) || !fs.existsSync(lessonDir)) continue;
  const course = JSON.parse(fs.readFileSync(courseFile, 'utf8'));
  const grade = Number(course.gradeLevel);
  for (const file of fs.readdirSync(lessonDir).filter((f) => f.endsWith('.json'))) {
    const lesson = JSON.parse(fs.readFileSync(path.join(lessonDir, file), 'utf8'));
    if (grade >= 0 && grade <= 8) k8Lessons++;
    for (const step of lesson.steps || []) {
      if (grade >= 0 && grade <= 8 && step.widget) k8WidgetSteps++;
      if (step.cml?.flagship) flagshipSteps++;
      if (!['check', 'challenge'].includes(step.kind)) continue;
      total++;
      const ok = Boolean(V.variantForStep(step, `session90:${courseId}:${file}:${step.id}`, 'core'));
      if (ok) served++;
      const key = String(grade);
      grades[key] ||= { total: 0, served: 0 };
      grades[key].total++;
      if (ok) grades[key].served++;
    }
  }
}
for (const value of Object.values(grades)) value.percent = Number((100 * value.served / value.total).toFixed(2));
console.log(JSON.stringify({
  overall: { total, served, gaps: total - served, percent: Number((100 * served / total).toFixed(2)) },
  grades,
  k8Lessons,
  k8WidgetSteps,
  flagshipSteps,
  cmlProfiles: [...fs.readFileSync('src/lib/cml/catalog.ts','utf8').matchAll(/^  ([A-Za-z0-9_]+): \{/gm)].length,
  status: 'PASS'
}, null, 2));
