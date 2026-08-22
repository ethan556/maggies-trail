export type StandardsReviewStatus = 'candidate' | 'partial' | 'approved' | 'rejected';

export interface OfficialStandardsSource {
  id: string;
  framework: string;
  authority: string;
  title: string;
  officialUrl: string;
  versionLabel: string;
  authorityVerified: boolean;
  contentLocatorRule: string;
  claimBoundary: string;
  sourceFingerprint: string;
}

export interface StandardsEvidenceStep {
  lessonId: string;
  stepId: string;
  kind: string;
  widget?: string;
  evidenceRoles: string[];
}

export interface StandardsEvidenceDossier {
  edgeId: string;
  objectiveId: string;
  objectiveTitle: string;
  courseId: string;
  gradeLevel: number;
  framework: string;
  candidateCode: string;
  candidateLabel: string;
  candidateRole: string;
  candidateDepth: string;
  sourceId: string;
  officialUrl: string;
  sourceVersion: string;
  sourceLocator: string;
  sourceTextStatus: 'exact-code-text-import-required' | 'scope-locator-requires-exact-benchmark';
  mappingRationale: string;
  evidenceSummary: Record<string, unknown>;
  stepEvidence: StandardsEvidenceStep[];
  checks: Record<string, boolean>;
  claimLimit: string;
  review: {
    status: StandardsReviewStatus;
    reviewer: string | null;
    reviewedAt: string | null;
    notes: string | null;
    officialTextSnapshot: string | null;
    officialSourceUrl: string | null;
    claimBoundary: string | null;
    approvedDepth: string | null;
  };
  dossierHash: string;
}
