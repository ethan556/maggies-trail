const fs = require('fs');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
}).outputText, f);
const { buildCMLMesh } = require('../../src/lib/cml/mesh.ts');
const catalog = fs.readFileSync('src/lib/cml/catalog.ts', 'utf8');
const profiles = new Set([...catalog.matchAll(/^  ([A-Za-z0-9_]+): \{/gm)].map((match) => match[1]));
let profiledSteps = 0;
let meshHandledSteps = 0;
let totalCards = 0;
const errors = [];
for (const courseId of fs.readdirSync('content/courses')) {
  const courseFile = `content/courses/${courseId}/course.json`;
  const lessonDir = `content/courses/${courseId}/lessons`;
  if (!fs.existsSync(courseFile) || !fs.existsSync(lessonDir)) continue;
  const grade = JSON.parse(fs.readFileSync(courseFile, 'utf8')).gradeLevel;
  if (grade < 0 || grade > 8) continue;
  for (const file of fs.readdirSync(lessonDir).filter((name) => name.endsWith('.json'))) {
    const lesson = JSON.parse(fs.readFileSync(`${lessonDir}/${file}`, 'utf8'));
    for (const step of lesson.steps || []) {
      if (!profiles.has(step.widget?.type)) continue;
      profiledSteps++;
      try {
        const mesh = buildCMLMesh(step.widget, null);
        if (!mesh || typeof mesh.narration !== 'string' || !Array.isArray(mesh.cards)) throw new Error('invalid mesh shape');
        totalCards += mesh.cards.length;
        if (mesh.cards.length) meshHandledSteps++;
      } catch (error) {
        errors.push(`${courseId}/${file}/${step.id}/${step.widget.type}: ${error.message}`);
      }
    }
  }
}
if (errors.length) throw new Error(errors.slice(0, 20).join('\n'));
console.log(JSON.stringify({ profiledSteps, meshHandledSteps, totalCards, profiles: profiles.size, status: 'PASS' }));
