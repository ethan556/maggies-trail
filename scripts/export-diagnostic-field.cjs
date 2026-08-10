#!/usr/bin/env node
// Export de-identified diagnostic field packets from the durable SQLite store.
const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const value = (flag, fallback) => { const i = args.indexOf(flag); return i >= 0 && args[i + 1] ? args[i + 1] : fallback; };
const dbPath = value('--db', process.env.MAGGIE_DB_PATH || path.join(process.cwd(), 'data', 'app.db'));
const out = value('--output', path.join(process.cwd(), 'data', 'diagnostic-field-export.json'));
const salt = value('--salt', process.env.DIAGNOSTIC_EXPORT_SALT);
if (!salt || salt.length < 16) throw new Error('A 16+ character --salt or DIAGNOSTIC_EXPORT_SALT is required for pseudonymous longitudinal linkage.');
const studyId = (learnerId) => `study:${crypto.createHash('sha256').update(`${salt}|${learnerId}`).digest('hex').slice(0, 24)}`;
const db = new Database(dbPath, { readonly: true });
const sessions = db.prepare(`SELECT id, learner_id, instrument_version, consent_version, consented_at, started_at, completed_at,
  start_grade, vertical_score, vertical_se, domain_summary_json, quality_flags_json, client_version
  FROM diagnostic_field_sessions ORDER BY completed_at, id`).all();
const responseQuery = db.prepare(`SELECT position, item_id, concept_tag, grade, domain, representation, correct,
  selected_choice, confidence, response_ms, provisional_difficulty, provisional_discrimination
  FROM diagnostic_field_responses WHERE session_id = ? ORDER BY position`);
const exported = sessions.map((session) => {
  const theta = (session.vertical_score - 500) / 90;
  const scaledHalf = Math.round(1.96 * session.vertical_se * 90);
  return { studyLearnerId: studyId(session.learner_id), packet: {
    schemaVersion: 1,
    sessionId: session.id,
    instrumentVersion: session.instrument_version,
    consent: { granted: true, version: session.consent_version, consentedAt: session.consented_at, statement: 'Consent recorded by the field-collection endpoint; no direct identifiers are present in this export.' },
    startedAt: session.started_at,
    completedAt: session.completed_at,
    startGrade: session.start_grade,
    responses: responseQuery.all(session.id).map((row) => ({
      position: row.position, itemId: row.item_id, conceptTag: row.concept_tag, grade: row.grade,
      domain: row.domain, representation: row.representation, correct: row.correct === 1,
      selectedChoice: row.selected_choice, confidence: row.confidence, responseMs: row.response_ms,
      provisionalDifficulty: row.provisional_difficulty, provisionalDiscrimination: row.provisional_discrimination
    })),
    report: {
      scaledScore: session.vertical_score, theta, standardError: session.vertical_se,
      scaledLower95: Math.max(200, session.vertical_score - scaledHalf),
      scaledUpper95: Math.min(800, session.vertical_score + scaledHalf),
      domainScores: JSON.parse(session.domain_summary_json)
    },
    qualityFlags: JSON.parse(session.quality_flags_json),
    clientVersion: session.client_version
  }};
});
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(exported, null, 2) + '\n');
console.log(`exported ${exported.length} de-identified diagnostic sessions to ${out}`);
