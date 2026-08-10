#!/usr/bin/env node
/*
 * Offline field-calibration pipeline for Maggie's Trail diagnostic.
 *
 * This script estimates research candidates; it NEVER edits the runtime bank and NEVER labels a
 * run field-calibrated. `promote-diagnostic-calibration.cjs` requires explicit human approval after
 * all declared sample, uncertainty, quality, and fairness gates pass.
 *
 * Input: one or more JSON / NDJSON files containing exported packets. Accepted shapes:
 *   { packet: DiagnosticFieldPacket, analysisGroup?: "..." }
 *   DiagnosticFieldPacket
 *   [ ...either shape... ]
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = process.cwd();
const contract = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/assessment/diagnostic-calibration-contract.json'), 'utf8'));
const active = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/assessment/calibration/active.json'), 'utf8'));
const q = contract.qualityGates;
const args = process.argv.slice(2);
const values = (flag) => args.flatMap((arg, i) => arg === flag && args[i + 1] ? [args[i + 1]] : []);
const inputPaths = values('--input');
const outputPath = values('--output')[0] || path.join(ROOT, 'content/assessment/calibration/latest-run.json');
const population = values('--population')[0] || 'Consented Maggie’s Trail diagnostic administrations passing packet validation and declared quality filters.';
if (!inputPaths.length) {
  console.error('Usage: node scripts/calibrate-diagnostic.cjs --input packets.json [--input more.ndjson] --output run.json [--population description]');
  process.exit(2);
}

const sha = (value) => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const logistic = (x) => 1 / (1 + Math.exp(-x));
const mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const sd = (xs, m = mean(xs)) => xs.length > 1 ? Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1)) : 0;
const round = (x, d = 6) => Number.isFinite(x) ? Number(x.toFixed(d)) : null;

function parseFile(file) {
  const text = fs.readFileSync(file, 'utf8').trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : parsed.sessions && Array.isArray(parsed.sessions) ? parsed.sessions : [parsed];
  } catch {
    return text.split(/\r?\n/).filter(Boolean).map((line, index) => {
      try { return JSON.parse(line); } catch { throw new Error(`${file}:${index + 1}: invalid JSON`); }
    });
  }
}

function normalize(row, sourceFile, ordinal) {
  const packet = row && row.packet ? row.packet : row;
  if (!packet || packet.schemaVersion !== 1 || packet.instrumentVersion !== contract.instrumentVersion || !Array.isArray(packet.responses)) return null;
  const responses = packet.responses.filter((r) => r && typeof r.itemId === 'string' && typeof r.correct === 'boolean');
  if (!responses.length) return null;
  return {
    id: packet.sessionId || `import:${sha(`${sourceFile}:${ordinal}`).slice(0, 20)}`,
    sourceFile,
    analysisGroup: typeof row.analysisGroup === 'string' && row.analysisGroup.length <= 80 ? row.analysisGroup : null,
    studyLearnerId: typeof row.studyLearnerId === 'string' && /^study:[a-f0-9]{16,64}$/.test(row.studyLearnerId) ? row.studyLearnerId : null,
    startGrade: packet.startGrade,
    completedAt: packet.completedAt,
    qualityFlags: Array.isArray(packet.qualityFlags) ? packet.qualityFlags : [],
    responses: responses.map((r, i) => ({
      position: r.position || i + 1,
      itemId: r.itemId,
      correct: r.correct ? 1 : 0,
      selectedChoice: Number.isInteger(r.selectedChoice) ? r.selectedChoice : null,
      confidence: [0, 0.5, 1].includes(r.confidence) ? r.confidence : 0.5,
      responseMs: Number.isFinite(r.responseMs) ? r.responseMs : 1000,
      provisionalDifficulty: Number(r.provisionalDifficulty),
      provisionalDiscrimination: Number(r.provisionalDiscrimination)
    }))
  };
}

const sessions = [];
const rejected = [];
for (const file of inputPaths) {
  const rows = parseFile(file);
  rows.forEach((row, index) => {
    const session = normalize(row, file, index);
    if (session) sessions.push(session); else rejected.push({ sourceFile: file, ordinal: index + 1, reason: 'unsupported or empty packet' });
  });
}
const uniqueSessions = [...new Map(sessions.map((s) => [s.id, s])).values()];
for (const s of sessions) if (uniqueSessions.find((u) => u.id === s.id) !== s) rejected.push({ sourceFile: s.sourceFile, sessionId: s.id, reason: 'duplicate session id' });

function abilityProxy(session) {
  const n = session.responses.length;
  const score = session.responses.reduce((sum, row) => sum + row.correct, 0);
  const adjusted = (score + 0.5) / (n + 1);
  return clamp(Math.log(adjusted / (1 - adjusted)), -3.8, 3.8);
}
for (const session of uniqueSessions) {
  session.total = session.responses.reduce((sum, row) => sum + row.correct, 0);
  session.theta = abilityProxy(session);
}

function pointBiserial(rows) {
  const valid = rows.filter((r) => Number.isFinite(r.restScore));
  const yes = valid.filter((r) => r.correct === 1).map((r) => r.restScore);
  const no = valid.filter((r) => r.correct === 0).map((r) => r.restScore);
  if (yes.length < 2 || no.length < 2) return null;
  const all = valid.map((r) => r.restScore);
  const s = sd(all);
  if (!s) return null;
  const p = yes.length / all.length;
  return ((mean(yes) - mean(no)) / s) * Math.sqrt(p * (1 - p));
}

function logLikelihood(rows, a, b, c = 0.25) {
  let ll = 0;
  for (const row of rows) {
    const latent = logistic(a * (row.theta - b));
    const p = clamp(c + (1 - c) * latent, 1e-8, 1 - 1e-8);
    ll += row.correct ? Math.log(p) : Math.log(1 - p);
  }
  return ll;
}

function fit2pl(rows) {
  if (rows.length < 30 || !rows.some((r) => r.correct) || !rows.some((r) => !r.correct)) return { fitStatus: 'insufficient-variation' };
  let best = { a: 1, b: 0, ll: -Infinity };
  for (let a = 0.35; a <= 2.8 + 1e-9; a += 0.05) {
    for (let b = -4; b <= 4 + 1e-9; b += 0.05) {
      const ll = logLikelihood(rows, a, b);
      if (ll > best.ll) best = { a, b, ll };
    }
  }
  // Fisher information for Wald uncertainty around the grid optimum.
  let iaa = 0, iab = 0, ibb = 0;
  for (const row of rows) {
    const z = logistic(best.a * (row.theta - best.b));
    const p = clamp(0.25 + 0.75 * z, 1e-8, 1 - 1e-8);
    const common = 0.75 * z * (1 - z);
    const dpda = common * (row.theta - best.b);
    const dpdb = -common * best.a;
    const w = 1 / (p * (1 - p));
    iaa += dpda * dpda * w;
    iab += dpda * dpdb * w;
    ibb += dpdb * dpdb * w;
  }
  const determinant = iaa * ibb - iab * iab;
  const aSe = determinant > 1e-10 ? Math.sqrt(ibb / determinant) : null;
  const bSe = determinant > 1e-10 ? Math.sqrt(iaa / determinant) : null;
  return {
    fitStatus: aSe && bSe ? 'estimated' : 'singular-information',
    discrimination: best.a,
    difficulty: best.b,
    discriminationSe: aSe,
    difficultySe: bSe,
    logLikelihood: best.ll
  };
}

function difScreen(rows) {
  const groups = [...new Set(rows.map((r) => r.group).filter(Boolean))];
  if (groups.length < 2) return { status: 'not-estimated', reason: 'No analysis-group labels were supplied.' };
  const stats = groups.map((group) => {
    const subset = rows.filter((r) => r.group === group);
    return { group, n: subset.length, p: mean(subset.map((r) => r.correct)) };
  });
  if (stats.some((s) => s.n < 50)) return { status: 'insufficient-sample', groups: stats };
  let maxGap = 0;
  for (const a of stats) for (const b of stats) maxGap = Math.max(maxGap, Math.abs(a.p - b.p));
  return { status: maxGap >= 0.15 ? 'review-required' : 'screen-clear', maxRawPGap: round(maxGap), groups: stats.map((s) => ({ ...s, p: round(s.p) })) };
}

const byItem = new Map();
for (const session of uniqueSessions) {
  for (const response of session.responses) {
    const rows = byItem.get(response.itemId) || [];
    rows.push({ ...response, theta: session.theta, restScore: session.total - response.correct, group: session.analysisGroup, sessionId: session.id });
    byItem.set(response.itemId, rows);
  }
}

const itemResults = [...byItem.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([itemId, rows]) => {
  const n = rows.length;
  const pValue = mean(rows.map((r) => r.correct));
  const pb = pointBiserial(rows);
  const fit = fit2pl(rows);
  const distractors = {};
  for (const row of rows) {
    const key = row.selectedChoice == null ? 'unknown' : String(row.selectedChoice);
    distractors[key] = (distractors[key] || 0) + 1;
  }
  const flags = [];
  if (n < q.minimumResponsesPerItem) flags.push('below-minimum-item-sample');
  if (n < q.minimumResponsesPerItemForPromotion) flags.push('below-promotion-item-sample');
  if (pValue < q.acceptablePValueRange[0] || pValue > q.acceptablePValueRange[1]) flags.push('extreme-p-value');
  if (pb == null || pb < q.minimumPointBiserial) flags.push('low-discrimination-ctt');
  if (fit.fitStatus !== 'estimated') flags.push('2pl-not-stable');
  if (fit.difficultySe == null || fit.difficultySe > q.maximumDifficultyStandardError) flags.push('difficulty-uncertain');
  if (fit.discriminationSe == null || fit.discriminationSe > q.maximumDiscriminationStandardError) flags.push('discrimination-uncertain');
  const ci = fit.fitStatus === 'estimated' ? {
    difficulty: [round(fit.difficulty - 1.96 * fit.difficultySe), round(fit.difficulty + 1.96 * fit.difficultySe)],
    discrimination: [round(Math.max(0.05, fit.discrimination - 1.96 * fit.discriminationSe)), round(fit.discrimination + 1.96 * fit.discriminationSe)]
  } : null;
  return {
    itemId,
    sampleN: n,
    pValue: round(pValue),
    pointBiserial: round(pb),
    difficulty: round(fit.difficulty),
    difficultySe: round(fit.difficultySe),
    discrimination: round(fit.discrimination),
    discriminationSe: round(fit.discriminationSe),
    fitStatus: fit.fitStatus,
    ci95: ci,
    distractors,
    dif: difScreen(rows),
    qualityFlags: flags,
    provisionalDifficulty: rows[0]?.provisionalDifficulty ?? null,
    provisionalDiscrimination: rows[0]?.provisionalDiscrimination ?? null
  };
});

const usableSessions = uniqueSessions.filter((s) => !s.qualityFlags.includes('rapid-responding'));
const rapidShare = uniqueSessions.length ? uniqueSessions.filter((s) => s.qualityFlags.includes('rapid-responding')).length / uniqueSessions.length : 0;
const anchors = itemResults.filter((item) => item.fitStatus === 'estimated' && item.qualityFlags.every((flag) => !['extreme-p-value', 'low-discrimination-ctt'].includes(flag)));
const thetaValues = usableSessions.map((s) => s.theta);
const thetaMean = mean(thetaValues);
const thetaSd = sd(thetaValues) || 1;

function linearLink(items) {
  const pairs = items.filter((item) => Number.isFinite(item.provisionalDifficulty) && Number.isFinite(item.difficulty));
  if (pairs.length < 2) return { intercept: 0, slope: 1 };
  const xs = pairs.map((item) => item.provisionalDifficulty);
  const ys = pairs.map((item) => item.difficulty);
  const xm = mean(xs), ym = mean(ys);
  const denom = xs.reduce((sum, x) => sum + (x - xm) ** 2, 0);
  const slope = denom ? xs.reduce((sum, x, i) => sum + (x - xm) * (ys[i] - ym), 0) / denom : 1;
  return { intercept: ym - slope * xm, slope };
}
const link = linearLink(anchors);
const parameterByItem = new Map(itemResults.map((item) => [item.itemId, item]));
function fieldTheta(session) {
  let best={theta:session.theta,ll:-Infinity};
  for(let theta=-4;theta<=4+1e-9;theta+=0.05){
    let ll=-0.5*(theta/1.5)**2;
    for(const response of session.responses){
      const item=parameterByItem.get(response.itemId);
      const a=Number.isFinite(item?.discrimination)?item.discrimination:response.provisionalDiscrimination;
      const b=Number.isFinite(item?.difficulty)?item.difficulty:response.provisionalDifficulty;
      const p=clamp(0.25+0.75*logistic(a*(theta-b)),1e-8,1-1e-8);
      ll+=response.correct?Math.log(p):Math.log(1-p);
    }
    if(ll>best.ll)best={theta,ll};
  }
  return best.theta;
}
for(const session of uniqueSessions)session.fieldTheta=fieldTheta(session);
const longitudinal=new Map();
for(const session of uniqueSessions){
  if(!session.studyLearnerId)continue;
  const rows=longitudinal.get(session.studyLearnerId)||[];rows.push(session);longitudinal.set(session.studyLearnerId,rows);
}
const growthPairs=[];
for(const [studyLearnerId,rows] of longitudinal){
  if(rows.length<2)continue;
  rows.sort((a,b)=>String(a.completedAt).localeCompare(String(b.completedAt)));
  const first=rows[0],last=rows[rows.length-1];
  const thetaChange=last.fieldTheta-first.fieldTheta;
  growthPairs.push({studyLearnerId,administrations:rows.length,firstAt:first.completedAt,lastAt:last.completedAt,thetaChange:round(thetaChange),scaledPointChange:Math.round(thetaChange*90)});
}
const growthValues=growthPairs.map((row)=>row.thetaChange);
const growthMean=mean(growthValues),growthSe=growthValues.length>1?sd(growthValues)/Math.sqrt(growthValues.length):null;
const growthSummary={
  status:growthPairs.length?'research-estimate':'no-repeated-measures',
  linkedLearners:longitudinal.size,
  learnersWithRepeatedMeasures:growthPairs.length,
  meanThetaChange:round(growthMean),
  meanScaledPointChange:growthPairs.length?Math.round(growthMean*90):null,
  standardError:round(growthSe),
  ci95:growthSe==null?null:[round(growthMean-1.96*growthSe),round(growthMean+1.96*growthSe)],
  pairs:growthPairs,
  claimBoundary:'Growth estimates require repeated consented administrations and remain research-only until the vertical scale, measurement invariance, and longitudinal sensitivity are validated.'
};

const totalResponses = uniqueSessions.reduce((sum, s) => sum + s.responses.length, 0);
const expectedItemCount = 28;
const allItemsPresent = itemResults.length === expectedItemCount;
const itemPromotionReady = allItemsPresent && itemResults.every((item) => item.qualityFlags.length === 0);
const promotionEligible =
  usableSessions.length >= q.minimumUsableSessions &&
  rapidShare <= q.maximumRapidResponseShare &&
  anchors.length >= q.minimumAnchorItems &&
  itemPromotionReady;

const runCore = {
  schemaVersion: 1,
  instrumentVersion: contract.instrumentVersion,
  algorithmVersion: contract.algorithmVersion,
  createdAt: new Date().toISOString(),
  populationDefinition: population,
  source: {
    files: inputPaths.map((file) => path.resolve(file)),
    importedSessions: sessions.length,
    uniqueSessions: uniqueSessions.length,
    usableSessions: usableSessions.length,
    rejectedPackets: rejected.length,
    totalResponses
  },
  qualitySummary: {
    rapidResponseShare: round(rapidShare),
    expectedItemCount,
    observedItemCount: itemResults.length,
    anchors: anchors.length,
    promotionEligible,
    humanApprovalRequired: true,
    blockingReasons: [
      ...(usableSessions.length < q.minimumUsableSessions ? ['insufficient-usable-sessions'] : []),
      ...(rapidShare > q.maximumRapidResponseShare ? ['rapid-response-share-too-high'] : []),
      ...(anchors.length < q.minimumAnchorItems ? ['insufficient-anchor-items'] : []),
      ...(!allItemsPresent ? ['incomplete-item-bank'] : []),
      ...(!itemPromotionReady ? ['one-or-more-items-fail-quality-gates'] : [])
    ]
  },
  growthSummary,
  scaleLink: {
    status: anchors.length >= q.minimumAnchorItems ? 'candidate-link' : 'insufficient-anchors',
    anchorItemIds: anchors.map((item) => item.itemId),
    thetaMean: round(thetaMean),
    thetaSd: round(thetaSd),
    provisionalToField: { intercept: round(link.intercept), slope: round(link.slope) },
    reportedScale: { intercept: 500, slope: 90, formula: 'score = clamp(round(500 + 90 * theta), 200, 800)' },
    method: 'anchor-item linear link plus empirical field theta location/scale; requires human psychometric review'
  },
  items: itemResults,
  rejected,
  status: promotionEligible ? 'candidate' : 'research-only',
  approval: { approvedBy: null, approvedAt: null, notes: null },
  claimBoundary: contract.claimBoundary,
  previousActiveStatus: active.status
};
const runId = `diagcal:${sha(runCore).slice(0, 24)}`;
const output = { ...runCore, runId, outputSha256: sha({ ...runCore, runId }) };
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');
console.log(`diagnostic calibration: ${uniqueSessions.length} sessions · ${totalResponses} responses · ${itemResults.length} items · ${output.status}`);
console.log(`promotion eligible: ${promotionEligible ? 'yes' : 'no'} · output ${outputPath}`);
