import {
  PLACEMENT_BANK,
  type DiagnosticDomain,
  type DiagnosticReport,
  type DiagnosticRepresentation,
  type PlacementItem,
  type PlacementResponse
} from './placement';

export const DIAGNOSTIC_INSTRUMENT_VERSION = 'maggies-diagnostic-2026.1';
export const DIAGNOSTIC_CONSENT_VERSION = 'diagnostic-field-research-2026-07';
export const DIAGNOSTIC_CALIBRATION_ALGORITHM_VERSION = 'ctt-2pl-bridge-1';

export interface DiagnosticFieldResponse {
  position: number;
  itemId: string;
  conceptTag: string;
  grade: number;
  domain: DiagnosticDomain;
  representation: DiagnosticRepresentation;
  correct: boolean;
  selectedChoice: number | null;
  confidence: 0 | 0.5 | 1;
  responseMs: number;
  provisionalDifficulty: number;
  provisionalDiscrimination: number;
}

export interface DiagnosticFieldPacket {
  schemaVersion: 1;
  sessionId: string;
  instrumentVersion: string;
  consent: {
    granted: true;
    version: string;
    consentedAt: string;
    statement: string;
  };
  startedAt: string;
  completedAt: string;
  startGrade: number;
  responses: DiagnosticFieldResponse[];
  report: {
    scaledScore: number;
    theta: number;
    standardError: number;
    scaledLower95: number;
    scaledUpper95: number;
    domainScores: Array<{
      domain: DiagnosticDomain;
      attempts: number;
      correct: number;
      scaledScore: number;
      standardError: number;
      status: string;
      highConfidenceErrors: number;
    }>;
  };
  qualityFlags: string[];
  clientVersion: string;
}

export interface DiagnosticFieldSubmission {
  learnerId: string;
  packet: DiagnosticFieldPacket;
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const ID = /^[A-Za-z0-9:_-]{8,200}$/;
const clampMs = (value: number | undefined): number => Math.max(100, Math.min(1_800_000, Math.round(value ?? 1_000)));

function fieldQualityFlags(responses: DiagnosticFieldResponse[]): string[] {
  const flags: string[] = [];
  if (responses.length < 10) flags.push('short-administration');
  const veryFast = responses.filter((row) => row.responseMs < 800).length;
  if (responses.length && veryFast / responses.length >= 0.5) flags.push('rapid-responding');
  const sameChoice = responses.map((row) => row.selectedChoice).filter((choice): choice is number => choice != null);
  if (sameChoice.length >= 8 && new Set(sameChoice).size === 1) flags.push('single-option-pattern');
  if (responses.every((row) => row.confidence === 1)) flags.push('uniform-max-confidence');
  return flags;
}

function packetId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `diag:${crypto.randomUUID()}`;
  return `diag:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 12)}`;
}

export function buildDiagnosticFieldPacket(args: {
  responses: PlacementResponse[];
  report: DiagnosticReport;
  startGrade: number;
  startedAt: string;
  completedAt?: string;
  consentedAt?: string;
  clientVersion?: string;
  bank?: PlacementItem[];
}): DiagnosticFieldPacket {
  const bank = args.bank ?? PLACEMENT_BANK;
  const byId = new Map(bank.map((item) => [item.id, item]));
  const responses: DiagnosticFieldResponse[] = args.responses.map((response, index) => {
    const source = response.itemId ? byId.get(response.itemId) : bank.find((item) => item.tag === response.tag);
    if (!source) throw new Error(`Unknown diagnostic item: ${response.itemId ?? response.tag}`);
    return {
      position: index + 1,
      itemId: source.id,
      conceptTag: source.tag,
      grade: source.grade,
      domain: source.domain,
      representation: source.representation,
      correct: response.correct,
      selectedChoice: Number.isInteger(response.selectedChoice) ? response.selectedChoice! : null,
      confidence: response.confidence ?? 0.5,
      responseMs: clampMs(response.responseMs),
      provisionalDifficulty: source.difficulty,
      provisionalDiscrimination: source.discrimination
    };
  });
  const now = args.consentedAt ?? new Date().toISOString();
  return {
    schemaVersion: 1,
    sessionId: packetId(),
    instrumentVersion: DIAGNOSTIC_INSTRUMENT_VERSION,
    consent: {
      granted: true,
      version: DIAGNOSTIC_CONSENT_VERSION,
      consentedAt: now,
      statement: 'I agree to contribute this diagnostic administration for item calibration and learning-measurement research. The packet excludes names, email addresses, prompts, and free-text responses.'
    },
    startedAt: args.startedAt,
    completedAt: args.completedAt ?? new Date().toISOString(),
    startGrade: Math.max(0, Math.min(13, Math.round(args.startGrade))),
    responses,
    report: {
      scaledScore: args.report.overall.scaledScore,
      theta: args.report.overall.theta,
      standardError: args.report.overall.standardError,
      scaledLower95: args.report.overall.scaledLower95,
      scaledUpper95: args.report.overall.scaledUpper95,
      domainScores: args.report.domainScores.map((domain) => ({
        domain: domain.domain,
        attempts: domain.attempts,
        correct: domain.correct,
        scaledScore: domain.scaledScore,
        standardError: domain.standardError,
        status: domain.status,
        highConfidenceErrors: domain.highConfidenceErrors
      }))
    },
    qualityFlags: fieldQualityFlags(responses),
    clientVersion: args.clientVersion ?? 'session-100'
  };
}

export function validateDiagnosticFieldSubmission(value: unknown, bank: PlacementItem[] = PLACEMENT_BANK):
  | { ok: true; submission: DiagnosticFieldSubmission }
  | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, error: 'object required' };
  const candidate = value as Partial<DiagnosticFieldSubmission>;
  if (typeof candidate.learnerId !== 'string' || !ID.test(candidate.learnerId)) return { ok: false, error: 'valid learnerId required' };
  const packet = candidate.packet;
  if (!packet || typeof packet !== 'object' || Array.isArray(packet)) return { ok: false, error: 'packet required' };
  if (packet.schemaVersion !== 1 || packet.instrumentVersion !== DIAGNOSTIC_INSTRUMENT_VERSION) return { ok: false, error: 'unsupported diagnostic instrument' };
  if (!ID.test(packet.sessionId)) return { ok: false, error: 'invalid sessionId' };
  if (packet.consent?.granted !== true || packet.consent.version !== DIAGNOSTIC_CONSENT_VERSION || !ISO.test(packet.consent.consentedAt)) return { ok: false, error: 'current explicit consent required' };
  if (!ISO.test(packet.startedAt) || !ISO.test(packet.completedAt) || packet.completedAt < packet.startedAt) return { ok: false, error: 'invalid administration timestamps' };
  if (!Number.isInteger(packet.startGrade) || packet.startGrade < 0 || packet.startGrade > 13) return { ok: false, error: 'invalid startGrade' };
  if (!Array.isArray(packet.responses) || packet.responses.length < 1 || packet.responses.length > 40) return { ok: false, error: 'invalid response count' };
  const sourceById = new Map(bank.map((item) => [item.id, item]));
  const seen = new Set<string>();
  for (let index = 0; index < packet.responses.length; index++) {
    const row = packet.responses[index];
    const source = sourceById.get(row.itemId);
    if (!source || seen.has(row.itemId)) return { ok: false, error: 'unknown or repeated item' };
    seen.add(row.itemId);
    if (row.position !== index + 1 || row.conceptTag !== source.tag || row.grade !== source.grade || row.domain !== source.domain || row.representation !== source.representation) return { ok: false, error: 'item metadata mismatch' };
    if (typeof row.correct !== 'boolean' || ![0, 0.5, 1].includes(row.confidence) || !Number.isInteger(row.responseMs) || row.responseMs < 100 || row.responseMs > 1_800_000) return { ok: false, error: 'invalid response evidence' };
    if (row.selectedChoice != null && (!Number.isInteger(row.selectedChoice) || row.selectedChoice < 0 || row.selectedChoice >= source.choices.length)) return { ok: false, error: 'invalid selected choice' };
    if (row.provisionalDifficulty !== source.difficulty || row.provisionalDiscrimination !== source.discrimination) return { ok: false, error: 'item parameters do not match instrument' };
  }
  if (!packet.report || !Number.isFinite(packet.report.scaledScore) || packet.report.scaledScore < 200 || packet.report.scaledScore > 800 || !Number.isFinite(packet.report.standardError) || packet.report.standardError <= 0) return { ok: false, error: 'invalid report summary' };
  if (!Array.isArray(packet.qualityFlags) || packet.qualityFlags.some((flag) => typeof flag !== 'string' || flag.length > 80)) return { ok: false, error: 'invalid quality flags' };
  return { ok: true, submission: candidate as DiagnosticFieldSubmission };
}

export function fieldPacketDownload(packet: DiagnosticFieldPacket): string {
  return JSON.stringify({ exportType: 'maggies-diagnostic-field-packet', exportedAt: new Date().toISOString(), packet }, null, 2);
}
