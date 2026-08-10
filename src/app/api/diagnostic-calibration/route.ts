import { NextRequest, NextResponse } from 'next/server';
import { validateDiagnosticFieldSubmission } from '@/lib/diagnosticCalibration';
import { loadPlacementBank } from '@/lib/placementBank.server';
import { tryGetDb } from '@/server/db';
import { rateLimit, sessionFor } from '@/server/authService';
import { SESSION_COOKIE, readJson } from '@/server/http';
import { saveDiagnosticFieldSubmission } from '@/server/diagnosticCalibrationService';

const NO_DB = () => NextResponse.json(
  { error: 'unavailable', reason: 'secure diagnostic field collection requires a durable database on this deployment' },
  { status: 503 }
);

export async function POST(req: NextRequest) {
  const db = tryGetDb();
  if (!db) return NO_DB();
  const session = sessionFor(db, req.cookies.get(SESSION_COOKIE)?.value ?? null);
  if (!session) return NextResponse.json({ error: 'unauthenticated', reason: 'sign in before contributing diagnostic field data' }, { status: 401 });
  if (!rateLimit(db, `diagnostic-field:${session.user.id}`, 12, 3600)) return NextResponse.json({ error: 'rate-limited' }, { status: 429 });
  const body = await readJson<unknown>(req, 180_000);
  const bank = await loadPlacementBank();
  const checked = validateDiagnosticFieldSubmission(body, bank);
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 422 });
  const result = saveDiagnosticFieldSubmission(db, session, checked.submission);
  if ('error' in result) return NextResponse.json(result, { status: result.error === 'forbidden' ? 403 : 422 });
  return NextResponse.json({ accepted: true, duplicate: result.duplicate, instrumentVersion: checked.submission.packet.instrumentVersion });
}
