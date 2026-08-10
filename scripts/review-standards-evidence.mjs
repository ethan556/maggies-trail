#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const args=Object.fromEntries(process.argv.slice(2).map((arg)=>{const [k,...rest]=arg.replace(/^--/,'').split('=');return [k,rest.join('=')||true];}));
if (!args.edge || !['approve','reject'].includes(String(args.decision)) || !args.reviewer || !args.notes) {
  console.error('usage: node scripts/review-standards-evidence.mjs --edge=<edgeId> --decision=approve|reject --reviewer=<name/id> --notes=<rationale> [--depth=full-intent|standard|cluster|course-scope] [--official-text=<snapshot>]');
  process.exit(2);
}
const dossier=JSON.parse(fs.readFileSync(path.join(root,'content/standards/evidence-dossiers.json'),'utf8')).dossiers.find((d)=>d.edgeId===args.edge);
if (!dossier) throw new Error(`Unknown edge ${args.edge}`);
if (args.decision==='approve' && (!args.depth || !args['official-text'])) {
  throw new Error('Approval requires --depth and --official-text so a reviewer signs the actual official expectation, not a scope label.');
}
const p=path.join(root,'content/standards/human-review-decisions.json');
const doc=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{schemaVersion:1,decisions:[]};
const decision={
  edgeId:String(args.edge), decision:String(args.decision), reviewer:String(args.reviewer), reviewedAt:new Date().toISOString(), notes:String(args.notes),
  approvedDepth:args.depth?String(args.depth):null, officialTextSnapshot:args['official-text']?String(args['official-text']):null,
  dossierHash:dossier.dossierHash
};
decision.signature=crypto.createHash('sha256').update(JSON.stringify(decision)).digest('hex');
doc.decisions=(doc.decisions??[]).filter((d)=>d.edgeId!==decision.edgeId).concat(decision).sort((a,b)=>a.edgeId.localeCompare(b.edgeId));
fs.writeFileSync(p,JSON.stringify(doc,null,2)+'\n');
console.log(`${decision.decision}: ${decision.edgeId} by ${decision.reviewer}`);
