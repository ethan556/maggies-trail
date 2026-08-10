#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const fail = (msg) => { throw new Error(msg); };
const assert = (cond, msg) => { if (!cond) fail(msg); };

// 1) The one canonical authored-corpus identity must verify end-to-end.
execFileSync(process.execPath, ['scripts/session/verify-corpus-state.mjs'], { cwd: root, stdio: 'inherit' });
const manifest = JSON.parse(read('content/curriculum-manifest.json'));
const state = JSON.parse(read('PRODUCT_STATE_VERIFIED.json'));
assert(manifest.corpusSha256 === state.corpusSha256, 'manifest/product-state corpus hashes disagree');
assert(manifest.corpusFiles === 1830 && state.corpusFiles === 1830, 'authored corpus file count drifted');
assert(state.courses === 129 && state.lessons === 1701 && state.steps === 15621, 'verified curriculum totals drifted');
assert(state.widgetTypes === 127, 'registered widget count drifted');

// 2) No current-looking stale S205Q test result may masquerade as the current tree.
assert(!fs.existsSync(path.join(root, 'reports/session-test-result.json')), 'stale session-test-result.json exists');
assert(fs.existsSync(path.join(root, 'reports/session-test-result.S205Q.json')), 'historical S205Q result was not preserved');
const cert = JSON.parse(read('reports/certified-runtime.json'));
assert(cert.session === 218, 'certified runtime must remain the last actually executed seal, S218');
assert(cert.unitTests === 12925 && cert.unitTestFiles === 322 && cert.playwrightExecutions === 115,
  'S218 certified runtime baseline drifted');
assert(/Session 218; carried forward, not rerun/.test(state.unitTestEvidence), 'product state does not label unit-test evidence as historical');
assert(/Session 218; carried forward, not rerun/.test(state.browserEvidence), 'product state does not label browser evidence as historical');

// 3) Production onboarding must no longer expose the legacy Grade-3-only 3-question quiz.
const onboarding = read('src/app/(shell)/onboarding/OnboardingFlow.tsx');
assert(onboarding.includes('Take the 12-item diagnostic'), 'canonical diagnostic CTA missing');
assert(onboarding.includes('/placement?grade='), 'onboarding does not route to canonical placement');
assert(onboarding.includes('Start at my grade level'), 'explicit diagnostic bypass missing');
for (const legacy of ['Quick question', 'secondQuestion', 'Q1', 'Q3', "at: \"q\"", "at: \"comfort\""]) {
  assert(!onboarding.includes(legacy), `legacy onboarding production token remains: ${legacy}`);
}
const placement = read('src/app/(shell)/placement/PlacementFlow.tsx');
assert(placement.includes('onboardingGoal'), 'placement cannot persist an onboarding-launched diagnostic');
assert(placement.includes('recommendedLessonId'), 'placement completion does not persist recommendation into onboarding state');

// 4) Production launch surface must not manufacture social proof.
const readme = read('README.md');
assert(!/current checkout contains/i.test(readme), 'README contains a hand-copied current-count snapshot');
const flagship = read('FLAGSHIP.md');
assert(flagship.includes('Catalogue: 1701 lessons.'), 'FLAGSHIP.md is not regenerated for the verified corpus');

const home = read('src/app/page.tsx');
assert(!home.includes('TESTIMONIALS'), 'testimonial fixture remains on production homepage');
assert(!home.includes('Demo testimonials'), 'demo/fictitious testimonial copy remains on homepage');
assert(home.includes('What you can verify') && home.includes('Product evidence'), 'evidence-first replacement missing');

// 5) Do not accidentally conceal commercial blockers while fixing launch credibility.
const premium = read('src/app/(shell)/premium/page.tsx');
const entitlement = read('src/lib/entitlement.ts');
assert(/demo|pretend|no real billing/i.test(premium), 'premium simulation marker disappeared without a real billing implementation');
assert(/NOT REAL|demo/i.test(entitlement), 'entitlement simulation marker disappeared without replacement evidence');

console.log('closure-wave1 static audit passed: corpus truth + runtime labeling + onboarding unification + social-proof integrity + commercial blocker visibility');
