#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const read=p=>readFileSync(join(root,p),'utf8');
const checks=[]; const check=(id,passed,detail)=>checks.push({id,passed:Boolean(passed),detail});
const schema=read('src/lib/schema.ts'), evaluate=read('src/lib/evaluate.ts'), widgets=read('src/components/widgets.tsx'), variants=read('src/lib/variants.ts'), pedagogy=read('src/lib/pedagogy.ts'), describe=read('src/lib/describeState.ts'), vtests=read('src/lib/variants.test.ts'), ktests=read('src/components/widgets.keyboard.test.tsx');
const between=(src,a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i+a.length);return i>=0&&j>=0?src.slice(i,j):''};
const plain=(name)=>{const i=schema.indexOf(`export const ${name}`);if(i<0)return false;const j=schema.indexOf('\nexport ',i+1);const block=schema.slice(i,j===-1?schema.length:j);return block.includes('z.object({')&&!/\.superRefine\s*\(|\.refine\s*\(/.test(block)};
check('union.exactNumber.plain',plain('ExactNumberLabSpec'),'ExactNumberLabSpec is a plain ZodObject before the discriminated union.');
check('union.affine.plain',plain('AffineRelationshipLabSpec'),'AffineRelationshipLabSpec remains a plain ZodObject.');
check('union.proportional.plain',plain('ProportionalReasoningLabSpec'),'ProportionalReasoningLabSpec remains a plain ZodObject.');
check('union.placeValue.plain',plain('PlaceValueTransformLabSpec'),'PlaceValueTransformLabSpec remains a plain ZodObject.');
check('union.quotient.plain',plain('QuotientReasoningLabSpec'),'QuotientReasoningLabSpec is a plain ZodObject before the discriminated union.');
check('union.graphStory.plain',plain('GraphStoryLabSpec'),'GraphStoryLabSpec remains a plain ZodObject.');
check('union.conditional.plain',plain('ConditionalTableLabSpec'),'ConditionalTableLabSpec remains a plain ZodObject.');
check('integrity.quotient.relocated',between(schema,'case "quotientReasoningLab"','case "graphStoryLab"').includes('invalidRemainder requires')&&between(schema,'case "quotientReasoningLab"','case "graphStoryLab"').includes('exactly one independently derived correct choice'),'Quotient cross-field validation is in widgetIntegrityErrors.');
check('math.remainder.reconstruction',schema.includes('claimedQ * divisor!.num + claimedR === dividend!.num'),'A claimed quotient/remainder must reconstruct the dividend, not merely have a small remainder.');
check('repair.percentChange.generator',variants.includes('type: "percentChangeLab"')&&variants.includes('pr-price-adjust-g7'),'Lost percentChangeLab generator repair remains present.');
check('repair.percentChange.gate',vtests.includes('parsed.type === "percentChangeLab"'),'percentChangeLab structural gate remains present.');
check('repair.conditional.gate',vtests.includes('parsed.type === "conditionalTableLab"'),'conditionalTableLab structural gate remains present.');
check('repair.ghostChip',widgets.includes('function GhostChip')&&!widgets.includes('function RevealGhost'),'GhostChip recovery remains present.');
check('repair.signedFraction',variants.includes('path: "correct" | "wrongSign" | "keptDivisor" | "magnitudeError" | "unreduced"'),'Signed-fraction unreduced path remains present.');
check('repair.angleMeasure',pedagogy.includes('case "angleMeasure"')&&pedagogy.includes('w.commonAngles ?? []'),'angleMeasure commonAngles wiring remains present.');
check('repair.cgCollision',variants.includes('cgParallelogramTrapezoidVerdict'),'Collision-free coordinate-geometry form remains present.');
check('repair.shapeTarget',widgets.includes('function ShapeHierarchyLabW')&&widgets.includes('min-h-14'),'Shape hierarchy retains deliberate taller controls.');
check('repair.triangleAria',(widgets.match(/aria-label="hinge angle"/g)||[]).length===1,'Triangle closure has no duplicate hinge-angle accessible name.');
check('repair.compositeWording',widgets.includes('subtract this cut-away piece')&&widgets.includes('add this piece'),'Composite area uses mathematical add/subtract wording.');
check('repair.describeNarration',describe.includes('Testing whether ${spec.subjectLabel} is always, sometimes, or never'),'Shape hierarchy narration repair remains present.');
check('repair.keyboardSurfaces',['compositeAreaLab','percentChangeLab','scaledCircleLab','signedFractionLab','triangleClosureLab','shapeHierarchyLab','equationOutcomeLab','quotientReasoningLab'].every(t=>ktests.includes(`it("${t}"`)),'Recovered and new keyboard gates are present.');
check('new.quotient.evaluate',evaluate.includes('case "quotientReasoningLab"')&&evaluate.includes('validKeys.has(item)'),'Quotient grading filters fabricated exploration keys.');
check('new.quotient.renderer',widgets.includes('function QuotientReasoningLabW')&&widgets.includes('qrl-ghost'),'Quotient renderer and reveal surface are present.');
check('new.quotient.variant',variants.includes('upgradeQuotientVariant')&&variants.includes('type:"quotientReasoningLab"'),'Legacy generators are upgraded to the quotient lab.');
check('new.quotient.gate',vtests.includes('parsed.type === "quotientReasoningLab"'),'Quotient generator has an explicit gateOne branch.');


check('new.affine.integrity',between(schema,'case "affineRelationshipLab"','case "quotientReasoningLab"').includes('off its line')&&between(schema,'case "affineRelationshipLab"','case "quotientReasoningLab"').includes('exactly two lines'),'Affine cross-field validation is in widgetIntegrityErrors.');
check('new.affine.evaluate',evaluate.includes('case "affineRelationshipLab"')&&evaluate.includes('affineRelationshipExplorationKeys(spec)'),'Affine grading filters fabricated exploration keys.');
check('new.affine.renderer',widgets.includes('function AffineRelationshipLabW')&&widgets.includes('arl-ghost'),'Affine renderer and ghost reveal surface are present.');
check('new.affine.variant',variants.includes('upgradeAffineVariant')&&variants.includes('type:"affineRelationshipLab"'),'Legacy generators are upgraded to the affine lab.');
check('new.affine.slopeProseParser',variants.includes('could not parse stated slope'),'Slope-association prose has a dedicated parser.');
check('new.affine.contextParser',variants.includes('could not parse direct proportional context'),'Contextual y=kx forms have a dedicated parser.');
check('new.affine.gate',vtests.includes('parsed.type === "affineRelationshipLab"'),'Affine generator has an explicit gateOne branch.');
check('new.affine.keyboard',ktests.includes('it("affineRelationshipLab"'),'Affine renderer has a keyboard gate.');

check('new.exact.integrity',between(schema,'case "exactNumberLab"','case "affineRelationshipLab"').includes('exactly one independently derived correct choice'),'Exact-number cross-field validation is in widgetIntegrityErrors.');
check('new.exact.evaluate',evaluate.includes('case "exactNumberLab"')&&evaluate.includes('exactNumberExplorationKeys(spec)'),'Exact-number grading filters fabricated exploration keys.');
check('new.exact.renderer',widgets.includes('function ExactNumberLabW')&&widgets.includes('enl-ghost'),'Exact-number renderer and ghost reveal surface are present.');
check('new.exact.variant',variants.includes('upgradeExactVariant')&&variants.includes('type:"exactNumberLab"'),'Targeted legacy generators are upgraded to the exact-number lab.');
check('new.exact.unicodeParser',variants.includes('.replaceAll("≤","<=")')&&variants.includes('.replaceAll("≥",">=")'),'Unicode inequality symbols normalize before parsing.');
check('new.exact.variableParser',variants.includes('const q=t.match(/([a-z])')&&variants.includes('variable=q[1]'),'Inequality parser supports arbitrary single-letter variables.');
check('new.exact.choiceCarriers',variants.includes('typeof truth.answerNumber==="number"')&&variants.includes('truth.answerRelation'),'Numeric and relation MCQs use typed truth carriers.');
check('new.exact.rootCandidates',variants.includes('found no root candidates'),'Root-selection variants populate the shared truth state.');
check('new.exact.gate',vtests.includes('parsed.type === "exactNumberLab"'),'Exact-number generator has an explicit gateOne branch.');
check('new.exact.keyboard',ktests.includes('it("exactNumberLab"'),'Exact-number renderer has a keyboard gate.');
const caps=JSON.parse(read('scripts/engine-capabilities.json'));
check('capabilities.singleTypesRoot',Object.keys(caps).length===1&&Boolean(caps.types),'Engine capabilities has one authoritative types root, with no silently ignored top-level duplicates.');
// S182: this check's PURPOSE is registration visibility, but it used to pin manip===3 as a
// proxy — so correcting an over-generous rating broke an audit that was never about the
// rating's value. It now asserts what it claims: the engine is inside `types` with a
// complete, in-range rating set that tier compilation can read. The canonical value of the
// manipulation rating is asserted in exactly ONE place, exact-number-mutations-s148.mjs M56,
// so a future ruler change has a single place to be argued and a single place to update.
{const c=caps.types?.exactNumberLab,dims=['manip','conseq','err','adapt','a11y','mobile','polish'];
check('capabilities.exactRegistered',Boolean(c)&&dims.every(d=>Number.isInteger(c[d])&&c[d]>=0&&c[d]<=3),'exactNumberLab capability is inside types and visible to tier compilation.');}
check('capabilities.affineRegistered',caps.types?.affineRelationshipLab?.manip===3&&caps.types?.affineRelationshipLab?.conseq===3,'affineRelationshipLab capability is inside types and visible to tier compilation.');
check('capabilities.quotientRegistered',caps.types?.quotientReasoningLab?.manip===3&&caps.types?.quotientReasoningLab?.conseq===3,'quotientReasoningLab capability is inside types and visible to tier compilation.');

const cg=JSON.parse(read('content/courses/coordinate-geometry/lessons/cg-04-02.json'));
check('content.cgCollision.oneString',cg.steps?.find(s=>s.id==='k3')?.variant?.form==='cgParallelogramTrapezoidVerdict','Authorized S140 one-string content repair remains intact.');
const packageJsonHash=createHash('sha256').update(read('package.json')).digest('hex');
const lockHash=createHash('sha256').update(read('package-lock.json')).digest('hex');
check('package.packageJson.present',packageJsonHash.length===64,'Package declaration is readable and hashed.');
check('package.lockfile.present',lockHash.length===64,'Lockfile is readable and hashed.');
const failures=checks.filter(c=>!c.passed);
const report={session:148,purpose:'Failure-first regression audit before Session 148 release.',checks,summary:{passed:checks.length-failures.length,failed:failures.length,total:checks.length},packageJsonSha256:packageJsonHash,packageLockSha256:lockHash,passed:failures.length===0};
writeFileSync(join(root,'SESSION148_FAILURE_FIRST_AUDIT.json'),JSON.stringify(report,null,2)+'\n');
writeFileSync(join(root,'SESSION148_FAILURE_FIRST_AUDIT.md'),['# Session 148 failure-first audit','',`- Result: **${report.passed?'PASS':'FAIL'}**`,`- Checks: **${report.summary.passed}/${report.summary.total}**`,'','## Checks','',...checks.map(c=>`- ${c.passed?'PASS':'FAIL'} — \`${c.id}\`: ${c.detail}`),''].join('\n'));
if(failures.length){for(const f of failures)console.error(`${f.id}: ${f.detail}`);process.exit(1)}
console.log(`Session 148 failure-first audit passed: ${checks.length}/${checks.length}`);
