'use client';

import { DEFAULT_CHILD_ID, ROSTER_KEY } from './storageKeys';
import { storageGet } from './safeStorage';
import type { DiagnosticFieldPacket } from './diagnosticCalibration';

export type DiagnosticContributionResult =
  | { status: 'uploaded' }
  | { status: 'unavailable'; reason: string }
  | { status: 'failed'; reason: string };

export function activeDiagnosticLearnerId(): string {
  try {
    const raw = storageGet(ROSTER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { activeId?: unknown };
      if (typeof parsed.activeId === 'string' && parsed.activeId.length <= 200) return parsed.activeId;
    }
  } catch {
    // Device-local users still receive a portable packet using the default learner slot.
  }
  return DEFAULT_CHILD_ID;
}

export async function contributeDiagnosticPacket(packet: DiagnosticFieldPacket): Promise<DiagnosticContributionResult> {
  try {
    const response = await fetch('/api/diagnostic-calibration', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ learnerId: activeDiagnosticLearnerId(), packet })
    });
    if (response.ok) return { status: 'uploaded' };
    if ([401, 403, 503].includes(response.status)) {
      const body = (await response.json().catch(() => ({}))) as { reason?: string; error?: string };
      return { status: 'unavailable', reason: body.reason ?? body.error ?? 'secure field collection is not available on this deployment' };
    }
    return { status: 'failed', reason: `collection endpoint returned ${response.status}` };
  } catch {
    return { status: 'unavailable', reason: 'secure field collection could not be reached' };
  }
}

export function downloadDiagnosticPacket(packet: DiagnosticFieldPacket): void {
  const payload = JSON.stringify({ exportType: 'maggies-diagnostic-field-packet', exportedAt: new Date().toISOString(), packet }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = `${packet.sessionId.replaceAll(':', '-')}.json`;
  anchor.click();
  URL.revokeObjectURL(href);
}
