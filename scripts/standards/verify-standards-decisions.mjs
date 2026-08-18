#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { decisionStatusOf, normalizeStandardsDecisionStatus, validateStandardsDecision } from './decision-contract.mjs';

const hash = (value) => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

export function verifyStandardsDecisions(root = process.cwd()) {
  const dossiers = JSON.parse(fs.readFileSync(path.join(root,'content/standards/evidence-dossiers.json'),'utf8')).dossiers ?? [];
  const decisions = JSON.parse(fs.readFileSync(path.join(root,'content/standards/human-review-decisions.json'),'utf8')).decisions ?? [];
  const byEdge = new Map(dossiers.map((dossier) => [String(dossier.edgeId), dossier]));
  const results = [];
  for (const decision of decisions) {
    const errors = [...validateStandardsDecision(decision).errors];
    const dossier = byEdge.get(String(decision.edgeId));
    if (!dossier) errors.push('decision is not bound to a dossier');
    const { signature, ...unsigned } = decision;
    if (hash(JSON.stringify(unsigned)) !== signature) errors.push('decision signature mismatch');
    if (dossier) {
      const { dossierHash, ...candidateCore } = dossier;
      candidateCore.claimLimit = 'Planning/review only. Not a verified alignment or mastery claim.';
      candidateCore.review = { status:'candidate', reviewer:null, reviewedAt:null, notes:null, officialTextSnapshot:null, officialSourceUrl:null, claimBoundary:null, approvedDepth:null };
      const legacyCandidateCore = structuredClone(candidateCore);
      legacyCandidateCore.review = { status:'ready-for-human-review', reviewer:null, reviewedAt:null, notes:null, officialTextSnapshot:null, approvedDepth:null };
      if (decision.dossierHash !== dossierHash && decision.dossierHash !== hash(candidateCore) && decision.dossierHash !== hash(legacyCandidateCore)) errors.push('decision dossier hash is stale');
      if (normalizeStandardsDecisionStatus(dossier.review?.status) !== decisionStatusOf(decision)) errors.push('dossier review status disagrees with decision');
    }
    results.push({ edgeId:String(decision.edgeId), status:decisionStatusOf(decision), valid:errors.length===0, errors });
  }
  const statusCounts = Object.fromEntries(['candidate','partial','approved','rejected'].map((status)=>[status,dossiers.filter((d)=>normalizeStandardsDecisionStatus(d.review?.status)===status).length]));
  return { dossierCount:dossiers.length, decisionCount:decisions.length, validDecisionCount:results.filter((r)=>r.valid).length, invalidDecisionCount:results.filter((r)=>!r.valid).length, statusCounts, results };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = verifyStandardsDecisions();
  console.log(JSON.stringify(report,null,2));
  if (report.invalidDecisionCount) process.exitCode = 1;
}
