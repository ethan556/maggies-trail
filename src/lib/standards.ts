export type AlignmentStatus = 'canonical' | 'equivalent-spine' | 'provisional-crosswalk' | 'verified';
export type EvidenceLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface FrameworkRef {
  framework: string;
  code: string;
  label: string;
  role: 'introduce' | 'develop' | 'assess' | 'retrieve';
  depth: 'standard' | 'cluster' | 'course-scope' | 'full-intent';
  status: AlignmentStatus;
}

export interface ObjectiveEvidence {
  exposed: boolean;
  constructed: boolean;
  practiced: boolean;
  transferred: boolean;
  retrievalReady: boolean;
  cumulative: boolean;
}

export interface StandardsObjective {
  id: string;
  title: string;
  courseId: string;
  gradeLevel: number;
  frameworkRefs: FrameworkRef[];
  lessonIds: string[];
  widgets: string[];
  representations: string[];
  evidence: ObjectiveEvidence;
  masteryArcScore: number;
  practiceStates: number;
  directManipulation: {
    coverage: 'exact' | 'family' | 'none';
    sourceTag?: string;
    lessonId?: string;
    stepId?: string;
    engine?: string;
  };
}

export function designedEvidenceLevel(evidence: ObjectiveEvidence): EvidenceLevel {
  if (evidence.retrievalReady && evidence.cumulative) return 5;
  if (evidence.transferred) return 4;
  if (evidence.practiced) return 3;
  if (evidence.constructed) return 2;
  if (evidence.exposed) return 1;
  return 0;
}

export interface StandardsCoverageSummary {
  objectives: number;
  frameworks: number;
  frameworkEdges: number;
  exactDirect: number;
  familyDirect: number;
  fullArc: number;
  practiceDepth: number;
  levels: Record<EvidenceLevel, number>;
}

export function summarizeStandards(objectives: StandardsObjective[]): StandardsCoverageSummary {
  const frameworks = new Set<string>();
  let frameworkEdges = 0;
  let exactDirect = 0;
  let familyDirect = 0;
  let fullArc = 0;
  let practiceDepth = 0;
  const levels: Record<EvidenceLevel, number> = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0 };
  for (const objective of objectives) {
    for (const ref of objective.frameworkRefs) frameworks.add(ref.framework);
    frameworkEdges += objective.frameworkRefs.length;
    if (objective.directManipulation.coverage === 'exact') exactDirect++;
    if (objective.directManipulation.coverage !== 'none') familyDirect++;
    if (objective.masteryArcScore >= 8) fullArc++;
    if (objective.practiceStates >= 20) practiceDepth++;
    levels[designedEvidenceLevel(objective.evidence)]++;
  }
  return { objectives:objectives.length, frameworks:frameworks.size, frameworkEdges, exactDirect, familyDirect, fullArc, practiceDepth, levels };
}

/** Standards claims are deliberately conservative. A mapping can support
 * planning while still being marked provisional; only verified/full-intent
 * mappings with transfer and retrieval evidence may be reported as mastered. */
export function claimLevel(objective: StandardsObjective, framework: string): 'unmapped' | 'planned' | 'evidence-backed' | 'mastery-ready' {
  const refs = objective.frameworkRefs.filter((ref) => ref.framework === framework);
  if (!refs.length) return 'unmapped';
  if (!objective.evidence.practiced) return 'planned';
  if (!objective.evidence.transferred || !objective.evidence.retrievalReady) return 'evidence-backed';
  return refs.some((ref) => ref.status === 'verified' && ref.depth === 'full-intent') ? 'mastery-ready' : 'evidence-backed';
}
