import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { StandardsObjective } from './standards';
import type { OfficialStandardsSource, StandardsEvidenceDossier } from './standardsEvidence';

export interface StandardsFramework {
  id: string;
  name: string;
  version: string;
  authority: string;
  status: string;
  source: string;
}

export interface MasteryInfrastructureMetrics {
  objectives: number;
  lessons: number;
  exactDirectManipulationObjectives: number;
  exactDirectManipulationPct: number;
  familyLabCoverageObjectives: number;
  familyLabCoveragePct: number;
  objectivesWithEightOfTenMasteryArcElements: number;
  objectivesWithRuntimeMasteryArc: number;
  runtimeMasteryArcPct: number;
  objectivesWithTwentyPlusPracticeStates: number;
  objectivesWithTwentyPlusFamilyStates: number;
  exactPracticeDepthPct: number;
  familyPracticeDepthPct: number;
  frameworks: number;
  crosswalkEdges: number;
  verifiedFullIntentEdges: number;
  provisionalEdges: number;
  officialSourceRegistryCount: number;
  reviewReadyEdges: number;
  humanApprovedEdges: number;
  humanPartialEdges?: number;
  humanRejectedEdges: number;
  edgesNeedingExactBenchmark: number;
  certifiedExactPracticeObjectives: number;
  certifiedExactPracticeStates: number;
}

export async function loadStandardsData(): Promise<{
  frameworks: StandardsFramework[];
  objectives: StandardsObjective[];
  metrics: MasteryInfrastructureMetrics;
  officialSources: OfficialStandardsSource[];
  evidenceDossiers: StandardsEvidenceDossier[];
}> {
  const root = process.cwd();
  const [frameworksRaw, objectivesRaw, metricsRaw, sourcesRaw, dossiersRaw] = await Promise.all([
    fs.readFile(path.join(root,'content/standards/frameworks.json'),'utf8'),
    fs.readFile(path.join(root,'content/standards/objectives.json'),'utf8'),
    fs.readFile(path.join(root,'content/mastery/infrastructure-metrics.json'),'utf8'),
    fs.readFile(path.join(root,'content/standards/source-registry.json'),'utf8'),
    fs.readFile(path.join(root,'content/standards/evidence-dossiers.json'),'utf8')
  ]);
  return {
    frameworks:(JSON.parse(frameworksRaw) as { frameworks: StandardsFramework[] }).frameworks,
    objectives:(JSON.parse(objectivesRaw) as { objectives: StandardsObjective[] }).objectives,
    metrics:JSON.parse(metricsRaw) as MasteryInfrastructureMetrics,
    officialSources:(JSON.parse(sourcesRaw) as { sources: OfficialStandardsSource[] }).sources,
    evidenceDossiers:(JSON.parse(dossiersRaw) as { dossiers: StandardsEvidenceDossier[] }).dossiers
  };
}
