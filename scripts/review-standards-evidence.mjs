#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { normalizeStandardsDecisionStatus, validateStandardsDecision } from './standards/decision-contract.mjs';

const root=process.cwd();
const args=Object.fromEntries(process.argv.slice(2).map((arg)=>{const [k,...rest]=arg.replace(/^--/,'').split('=');return [k,rest.join('=')||true];}));
const status=normalizeStandardsDecisionStatus(args.status ?? args.decision);
if (!args.edge || !status || status === 'candidate' || !args.reviewer || !args.notes) {
  console.error('usage: node scripts/review-standards-evidence.mjs --edge=<edgeId> --status=partial|approved|rejected --reviewer=<name/id> --notes=<rationale> [--depth=<reviewed-depth>] [--official-text=<snapshot>] [--official-source-url=<url>] [--claim-boundary=<limit>]');
  console.error('legacy --decision=approve|reject remains accepted and is stored canonically as approved|rejected.');
  process.exit(2);
}
const dossier=JSON.parse(fs.readFileSync(path.join(root,'content/standards/evidence-dossiers.json'),'utf8')).dossiers.find((d)=>d.edgeId===args.edge);
if (!dossier) throw new Error(`Unknown edge ${args.edge}`);
if (status==='approved' && (!args.depth || !args['official-text'])) {
  throw new Error('Approval requires --depth and --official-text so a reviewer signs the actual official expectation, not a scope label.');
}
const p=path.join(root,'content/standards/human-review-decisions.json');
const doc=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{schemaVersion:1,decisions:[]};
const decision={
  edgeId:String(args.edge), decision:status, reviewer:String(args.reviewer), reviewedAt:new Date().toISOString(), notes:String(args.notes),
  approvedDepth:args.depth?String(args.depth):null, officialTextSnapshot:args['official-text']?String(args['official-text']):null,
  officialSourceUrl:args['official-source-url']?String(args['official-source-url']):null,
  claimBoundary:args['claim-boundary']?String(args['claim-boundary']):null,
  dossierHash:dossier.dossierHash
};
const validation=validateStandardsDecision(decision,{allowLegacy:false});
if (validation.errors.length) throw new Error(validation.errors.join('; '));
decision.signature=crypto.createHash('sha256').update(JSON.stringify(decision)).digest('hex');
doc.schemaVersion=2;
doc.statusContract=['candidate','partial','approved','rejected'];
doc.decisions=(doc.decisions??[]).filter((d)=>d.edgeId!==decision.edgeId).concat(decision).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
fs.writeFileSync(p,JSON.stringify(doc,null,2)+'\n');
console.log(`${decision.decision}: ${decision.edgeId} by ${decision.reviewer}`);
