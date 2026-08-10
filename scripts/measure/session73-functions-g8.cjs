const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts'] = (mod, filename) => {
  const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  mod._compile(out, filename);
};
const { variantForGenForm } = require('../../src/lib/variants.ts');

const GROUPS = {
  'g8-fn-function-definition': ['fgFunctionRepeatedInput','fgFunctionTableRepeated','fgFunctionSharedOutput','fgSortFunctionRules'],
  'g8-fn-vertical-line': ['fgVltLine','fgVltSideways','fgVltUpright','fgVltSort'],
  'g8-fn-rate-of-change': ['fgRatePositive','fgRateWide','fgRateNegative','fgRateContext'],
  'g8-fn-constant-slope': ['fgSlopeSimilarTriangles','fgSlopePoints','fgSlopeFractionMcq','fgSlopeSigned'],
  'g8-fn-initial-value': ['fgInitialTable','fgInitialPointSlope','fgInitialEquation','fgInitialEquationTwoPoints'],
  'g8-fn-same-function-forms': ['fgFormsStoryBuild','fgFormsTableEquation','fgFormsGraphBuild','fgFormsOddOne'],
  'g8-fn-compare-rates': ['fgCompareEquationTable','fgCompareTables','fgCompareInterceptTrap','fgCompareThree'],
  'g8-fn-compare-full': ['fgCompareRateStart','fgCompareSameRate'],
};
const TAGS = new Set(Object.keys(GROUPS));
const FORM_KEYS = new Set(Object.entries(GROUPS).flatMap(([tag, forms]) => forms.map(f => `${tag}@${f}`)));

function extractStandingRoutes() {
  const file = path.resolve('src/lib/variants.test.ts');
  const sourceText = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const helperNames = new Set(['g8RelationIsFunction', 'g8PrintedFunctionRule']);
  const helpers = [];
  const props = [];
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name && helperNames.has(node.name.text)) helpers.push(node.getText(sf));
    if (ts.isVariableDeclaration(node) && node.name.getText(sf) === 'INDEPENDENT' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      for (const prop of node.initializer.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const raw = prop.name.getText(sf);
        const key = raw.replace(/^['"]|['"]$/g, '');
        if (TAGS.has(key) || FORM_KEYS.has(key)) props.push(prop.getText(sf));
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  const snippet = `${helpers.join('\n')}\nconst INDEPENDENT = {\n${props.join(',\n')}\n};\nmodule.exports = INDEPENDENT;`;
  const js = ts.transpileModule(snippet, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const m = { exports: {} };
  new Function('module', 'exports', js)(m, m.exports);
  return m.exports;
}
const ROUTES = extractStandingRoutes();
for (const tag of TAGS) assert.equal(typeof ROUTES[tag], 'function', `missing standing route ${tag}`);

function serialize(v) {
  const w = v.widget;
  const route = ROUTES[`${v.tag}@${currentForm}`] || ROUTES[v.tag];
  assert.equal(typeof route, 'function');
  if (w.type === 'mcq') {
    const key = w.prompt + '||' + w.options.map(o => o.label).join(';;');
    return { want: route(key), got: w.options.find(o => o.correct).label };
  }
  if (w.type === 'numeric') return { want: route(w.prompt), got: v.answer };
  if (w.type === 'dragBucket') {
    const key = w.prompt + '||' + w.items.map(i => i.label).join(',');
    const want = route(key);
    const got = Object.fromEntries(w.items.map(i => [i.label, i.bucketId]));
    return { want, got };
  }
  if (w.type === 'buildExpression') {
    const byId = new Map(w.tokens.map(t => [t.id, t.label]));
    return { want: route(w.prompt), got: w.correct.map(id => byId.get(id)) };
  }
  throw new Error(`unsupported surface ${w.type}`);
}

const NEGATION = /^(no|not|wrong|incorrect|sorry|try again|nope)\b/i;
function feedbacks(w) {
  if (w.type === 'mcq') return w.options.map(o => o.feedback);
  if (w.type === 'numeric') return [...w.commonErrors.map(e => e.feedback), w.fallbackFeedback];
  if (w.type === 'dragBucket') return [...w.items.map(i => i.feedback), w.missFeedback, w.successFeedback];
  if (w.type === 'buildExpression') return [...w.commonBuilds.map(x => x.feedback), w.missFeedback, w.successFeedback];
  return [];
}
function generic(v) {
  const w = v.widget;
  assert(w.prompt.length >= 9, `short prompt: ${w.prompt}`);
  assert(!/\+\s*−|\+\s*-\d/.test(w.prompt), `bad sign typography: ${w.prompt}`);
  assert(!/\b1x\b/.test(w.prompt), `1x typography: ${w.prompt}`);
  assert(!/\b1 minutes\b/.test(w.prompt), `singular grammar: ${w.prompt}`);
  assert(!/\d\.\d{12,}/.test(w.prompt), `float artifact: ${w.prompt}`);
  for (const fb of feedbacks(w)) {
    assert(fb.length >= 25, `short feedback: ${fb}`);
    assert(!NEGATION.test(fb), `negating feedback: ${fb}`);
    assert(!/\d\.\d{12,}/.test(fb), `float artifact feedback: ${fb}`);
  }
  if (w.type === 'numeric') {
    const vals = w.commonErrors.map(e => e.value);
    assert(vals.every(Number.isFinite));
    assert(vals.every(x => Math.abs(x - w.answer) > Math.max(1e-12, w.tolerance)), `trap equals answer ${v.tag}@${global.currentForm}: ${w.prompt} :: ans=${w.answer} traps=${vals}`);
    assert.equal(new Set(vals.map(x => x.toPrecision(14))).size, vals.length, `duplicate numeric traps: ${w.prompt}`);
  } else if (w.type === 'mcq') {
    assert.equal(w.options.filter(o => o.correct).length, 1);
    assert.equal(new Set(w.options.map(o => o.label)).size, w.options.length, `duplicate MCQ labels: ${w.prompt}`);
  } else if (w.type === 'dragBucket') {
    assert.equal(new Set(w.items.map(i => i.label)).size, w.items.length, `duplicate bucket labels`);
    const used = new Set(w.items.map(i => i.bucketId));
    for (const b of w.buckets) assert(used.has(b.id), `empty bucket ${b.id}`);
  } else if (w.type === 'buildExpression') {
    assert.equal(new Set(w.tokens.map(t => t.label)).size, w.tokens.length, `duplicate build labels: ${w.prompt}`);
    const correct = w.correct.join('|');
    for (const c of w.commonBuilds) assert.notEqual(c.sequence.join('|'), correct, `dead common build`);
    const used = new Set(w.correct);
    assert(w.tokens.some(t => !used.has(t.id)), `no distractor token`);
  }
}

const bands = ['support','core','stretch'];
const draws = Number(process.env.DRAWS || 3000);
let checks = 0;
const positions = new Map();
for (const [tag, forms] of Object.entries(GROUPS)) {
  for (const form of forms) {
    for (const band of bands) {
      const fresh = new Set();
      for (let i = 0; i < draws; i++) {
        global.currentForm = form;
        const seed = `s73:${tag}:${form}:${band}:${i}`;
        const v = variantForGenForm(tag, form, seed, band);
        const again = variantForGenForm(tag, form, seed, band);
        assert.deepStrictEqual(again, v, `nondeterministic ${tag}@${form}`);
        generic(v);
        const { want, got } = serialize(v);
        if (typeof want === 'number') assert(Math.abs(want - got) < 1e-9, `${tag}@${form}: ${want} != ${got}\n${v.widget.prompt}`);
        else assert.deepStrictEqual(want, got, `${tag}@${form} route disagreement\n${v.widget.prompt}`);
        if (form === 'fgRateContext') {
          const m = v.widget.prompt.match(/and (-?\d+) liters/);
          assert(m && Number(m[1]) > 0, `nonpositive tank content: ${v.widget.prompt}`);
        }
        if (v.widget.type === 'mcq') {
          const idx = v.widget.options.findIndex(o => o.correct);
          const key = `${tag}@${form}`;
          const arr = positions.get(key) || [0,0,0,0]; arr[idx]++; positions.set(key,arr);
        }
        if (i < 12) fresh.add(JSON.stringify(v.widget) + JSON.stringify(v.answer));
        checks++;
      }
      assert(fresh.size >= 4, `low freshness ${tag}@${form}/${band}: ${fresh.size}`);
    }
  }
}
for (const [key, arr] of positions) {
  const used = arr.filter(n => n > 0).length;
  assert(used >= 3, `MCQ correct position too narrow ${key}: ${arr}`);
}
// Same generator forms must not collapse under one seed; bands must not repeat under one seed.
for (const [tag, forms] of Object.entries(GROUPS)) {
  for (let i = 0; i < 1000; i++) {
    for (const band of bands) {
      const seen = new Set();
      for (const form of forms) {
        const v = variantForGenForm(tag, form, `same:${tag}:${band}:${i}`, band);
        const signature = JSON.stringify(v.widget) + '|' + JSON.stringify(v.answer);
        assert(!seen.has(signature), `same-seed form collapse ${tag}/${band}/${form}`);
        seen.add(signature);
      }
    }
    for (const form of forms) {
      const sigs = bands.map(b => {
        const v = variantForGenForm(tag, form, `band:${tag}:${form}:${i}`, b);
        return JSON.stringify(v.widget) + '|' + JSON.stringify(v.answer);
      });
      assert.equal(new Set(sigs).size, 3, `band collapse ${tag}@${form}`);
    }
  }
}
console.log(JSON.stringify({ forms: Object.values(GROUPS).flat().length, drawsPerFormBand: draws, checks, standingRoutes: TAGS.size, status: 'PASS' }));
