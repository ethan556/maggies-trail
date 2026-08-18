export const STANDARDS_DECISION_STATUSES = Object.freeze([
  'candidate',
  'partial',
  'approved',
  'rejected'
]);

const LEGACY_STATUS = Object.freeze({
  'ready-for-human-review': 'candidate',
  approve: 'approved',
  reject: 'rejected'
});

export function normalizeStandardsDecisionStatus(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  const normalized = LEGACY_STATUS[raw] ?? raw;
  return STANDARDS_DECISION_STATUSES.includes(normalized) ? normalized : null;
}

export function decisionStatusOf(record) {
  return normalizeStandardsDecisionStatus(record?.status ?? record?.decision);
}

export function isFinalStandardsDecision(status) {
  const normalized = normalizeStandardsDecisionStatus(status);
  return normalized === 'approved' || normalized === 'rejected';
}

export function validateStandardsDecision(record, { allowLegacy = true } = {}) {
  const errors = [];
  const raw = record?.status ?? record?.decision;
  const status = normalizeStandardsDecisionStatus(raw);
  if (!status) errors.push(`unknown standards decision status: ${String(raw)}`);
  if (!allowLegacy && raw !== status) errors.push(`non-canonical standards decision status: ${String(raw)}`);
  if (status === 'candidate') errors.push('candidate is represented by no human decision record');
  if (!record?.edgeId) errors.push('edgeId is required');
  if (!record?.reviewer) errors.push('reviewer is required');
  if (!record?.reviewedAt) errors.push('reviewedAt is required');
  if (!record?.notes) errors.push('notes are required');
  if (!record?.dossierHash) errors.push('dossierHash is required');
  if ((status === 'partial' || status === 'approved') && !record?.approvedDepth) {
    errors.push(`${status} requires approvedDepth`);
  }
  if ((status === 'partial' || status === 'approved') && !record?.officialTextSnapshot) {
    errors.push(`${status} requires officialTextSnapshot`);
  }
  if (status === 'partial' && !record?.claimBoundary) errors.push('partial requires claimBoundary');
  if (status === 'partial' && !record?.officialSourceUrl) errors.push('partial requires officialSourceUrl');
  return { status, errors };
}
