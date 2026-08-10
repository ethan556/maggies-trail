import type {
  Confidence,
  EvidenceLevel,
  EvidenceOutput,
  RepresentationKind,
} from './contracts';

export interface MasteryEvidenceRecord extends EvidenceOutput {
  readonly id: string;
  readonly learnerId: string;
  readonly lessonId: string;
  readonly sessionId: string;
  readonly occurredAt: string;
}

export interface ConceptMasterySummary {
  readonly conceptTag: string;
  readonly level: EvidenceLevel;
  readonly independentSuccesses: number;
  readonly representations: readonly RepresentationKind[];
  readonly misconceptionRepairs: number;
  readonly hasDelayedEvidence: boolean;
  readonly hasTransferEvidence: boolean;
  readonly lastEvidenceAt?: string;
}

function calendarDay(value: string): number {
  const date = new Date(value);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function daysBetween(earlier: string, later: string): number {
  return Math.floor((calendarDay(later) - calendarDay(earlier)) / 86_400_000);
}

function isCredibleIndependentSuccess(record: MasteryEvidenceRecord): boolean {
  return (
    record.correct &&
    record.independent &&
    record.confidence !== 'guess' &&
    record.misconceptionTags.length === 0
  );
}

export function summarizeConceptMastery(
  conceptTag: string,
  records: readonly MasteryEvidenceRecord[],
): ConceptMasterySummary {
  const relevant = records
    .filter((record) => record.conceptTag === conceptTag)
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

  if (relevant.length === 0) {
    return {
      conceptTag,
      level: 'exposed',
      independentSuccesses: 0,
      representations: [],
      misconceptionRepairs: 0,
      hasDelayedEvidence: false,
      hasTransferEvidence: false,
    };
  }

  const independent = relevant.filter(isCredibleIndependentSuccess);
  const representationSet = new Set(independent.map((record) => record.representation));
  const firstIndependent = independent[0];
  const delayed = firstIndependent
    ? independent.filter(
        (record) =>
          record.sessionId !== firstIndependent.sessionId &&
          daysBetween(firstIndependent.occurredAt, record.occurredAt) >= 1,
      )
    : [];
  const transfer = independent.filter((record) => record.transfer === true);
  const misconceptionRepairs = relevant.filter(
    (record, index) =>
      record.correct &&
      record.misconceptionTags.length === 0 &&
      relevant.slice(0, index).some((prior) => prior.misconceptionTags.length > 0),
  ).length;

  let level: EvidenceLevel = 'exposed';
  if (relevant.some((record) => record.correct)) level = 'practiced';
  if (independent.length >= 2 && representationSet.size >= 1) level = 'mastered';
  if (level === 'mastered' && delayed.length >= 1) level = 'retained';
  if (level === 'retained' && transfer.length >= 1 && representationSet.size >= 2) {
    level = 'transferable';
  }

  const lastEvidenceAt = relevant.at(-1)?.occurredAt;
  return {
    conceptTag,
    level,
    independentSuccesses: independent.length,
    representations: [...representationSet],
    misconceptionRepairs,
    hasDelayedEvidence: delayed.length > 0,
    hasTransferEvidence: transfer.length > 0,
    ...(lastEvidenceAt ? { lastEvidenceAt } : {}),
  };
}

export function shouldScheduleReview(
  summary: ConceptMasterySummary,
  now: string,
): { due: boolean; intervalDays: number; reason: string } {
  const intervals: Record<EvidenceLevel, number> = {
    exposed: 0,
    practiced: 1,
    mastered: 3,
    retained: 7,
    transferable: 21,
  };
  const intervalDays = intervals[summary.level];
  if (!summary.lastEvidenceAt) {
    return { due: true, intervalDays, reason: 'No evidence has been recorded.' };
  }
  const elapsed = daysBetween(summary.lastEvidenceAt, now);
  return {
    due: elapsed >= intervalDays,
    intervalDays,
    reason:
      elapsed >= intervalDays
        ? `Review is due after ${elapsed} day(s).`
        : `Next review after ${intervalDays - elapsed} more day(s).`,
  };
}

export function normalizeConfidence(value: unknown): Confidence | undefined {
  return value === 'guess' || value === 'unsure' || value === 'sure' ? value : undefined;
}
