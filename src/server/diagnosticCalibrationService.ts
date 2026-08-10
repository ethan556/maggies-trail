import type { DB } from './db';
import type { SessionInfo } from './authService';
import { audit, canTouchLearner } from './authService';
import type { DiagnosticFieldSubmission } from '@/lib/diagnosticCalibration';

export type DiagnosticIngestResult =
  | { accepted: true; duplicate: boolean }
  | { error: 'forbidden' | 'invalid' };

export function saveDiagnosticFieldSubmission(
  db: DB,
  session: SessionInfo,
  submission: DiagnosticFieldSubmission
): DiagnosticIngestResult {
  if (!canTouchLearner(db, session, submission.learnerId)) return { error: 'forbidden' };
  const { packet } = submission;
  const existing = db.prepare('SELECT id FROM diagnostic_field_sessions WHERE id = ?').get(packet.sessionId) as { id: string } | undefined;
  if (existing) return { accepted: true, duplicate: true };

  const run = db.transaction(() => {
    db.prepare(`INSERT INTO diagnostic_field_sessions (
      id, learner_id, instrument_version, consent_version, consented_at, started_at, completed_at,
      start_grade, item_count, vertical_score, vertical_se, domain_summary_json,
      quality_flags_json, client_version, received_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      packet.sessionId,
      submission.learnerId,
      packet.instrumentVersion,
      packet.consent.version,
      packet.consent.consentedAt,
      packet.startedAt,
      packet.completedAt,
      packet.startGrade,
      packet.responses.length,
      packet.report.scaledScore,
      packet.report.standardError,
      JSON.stringify(packet.report.domainScores),
      JSON.stringify(packet.qualityFlags),
      packet.clientVersion,
      new Date().toISOString()
    );
    const insert = db.prepare(`INSERT INTO diagnostic_field_responses (
      session_id, position, item_id, concept_tag, grade, domain, representation, correct,
      selected_choice, confidence, response_ms, provisional_difficulty, provisional_discrimination
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    for (const row of packet.responses) insert.run(
      packet.sessionId,
      row.position,
      row.itemId,
      row.conceptTag,
      row.grade,
      row.domain,
      row.representation,
      row.correct ? 1 : 0,
      row.selectedChoice,
      row.confidence,
      row.responseMs,
      row.provisionalDifficulty,
      row.provisionalDiscrimination
    );
    audit(db, session.user.id, 'diagnostic-field-contribution', `${packet.instrumentVersion}:${packet.responses.length}`);
  });
  run();
  return { accepted: true, duplicate: false };
}
