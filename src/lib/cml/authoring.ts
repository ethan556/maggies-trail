import type { CMLStage, RepresentationKind } from './contracts';

export interface CMLStepDeclaration {
  readonly stage: CMLStage;
  readonly flagship?: boolean;
  readonly conceptTag?: string;
  readonly engine?: string;
  readonly responseOnly?: boolean;
  readonly directManipulation?: boolean;
  readonly causalConsequence?: boolean;
  readonly predictionId?: string;
  readonly invariants?: readonly string[];
  readonly misconceptionSet?: readonly string[];
  readonly translationFrom?: RepresentationKind;
  readonly translationTo?: RepresentationKind;
  readonly revisionOf?: string;
  readonly fadeLevel?: 0 | 1 | 2 | 3;
  readonly transferFamily?: string;
  readonly delayedRetrieval?: boolean;
}

export interface CMLLessonSpec {
  readonly lessonId: string;
  readonly grade: number;
  readonly steps: readonly CMLStepDeclaration[];
}

export interface AuthoringIssue {
  readonly severity: 'error' | 'warning';
  readonly code: string;
  readonly message: string;
  readonly stepIndex?: number;
}

const REQUIRED_ORDER: readonly CMLStage[] = [
  'predict',
  'construct',
  'observe',
  'explain',
  'revise',
  'generalize',
  'retrieve',
];

export function validateCMLLesson(spec: CMLLessonSpec): readonly AuthoringIssue[] {
  const issues: AuthoringIssue[] = [];
  const stages = spec.steps.map((step) => step.stage);

  let lastIndex = -1;
  for (const stage of REQUIRED_ORDER) {
    const index = stages.indexOf(stage);
    if (index < 0) {
      issues.push({
        severity: stage === 'revise' || stage === 'retrieve' ? 'error' : 'warning',
        code: `missing-${stage}`,
        message: `The lesson has no ${stage} stage.`,
      });
      continue;
    }
    if (index < lastIndex) {
      issues.push({
        severity: 'error',
        code: 'stage-order',
        message: `${stage} occurs before an earlier CML stage.`,
        stepIndex: index,
      });
    }
    lastIndex = Math.max(lastIndex, index);
  }

  spec.steps.forEach((step, index) => {
    if (step.flagship && (step.responseOnly || !step.directManipulation)) {
      issues.push({
        severity: 'error',
        code: 'flagship-is-response-only',
        message: 'A flagship step must manipulate mathematical state directly.',
        stepIndex: index,
      });
    }
    if (step.stage === 'construct' && !step.directManipulation) {
      issues.push({
        severity: 'error',
        code: 'construct-without-manipulation',
        message: 'Construct must change the mathematical model, not only record an answer.',
        stepIndex: index,
      });
    }
    if (step.stage === 'observe' && !step.causalConsequence) {
      issues.push({
        severity: 'error',
        code: 'observe-without-consequence',
        message: 'Observe must expose a consequence caused by the learner action.',
        stepIndex: index,
      });
    }
    if (step.stage === 'construct' && (!step.invariants || step.invariants.length === 0)) {
      issues.push({
        severity: 'warning',
        code: 'missing-invariant',
        message: 'Declare what remains true during valid manipulation.',
        stepIndex: index,
      });
    }
    if (step.stage === 'revise' && !step.revisionOf) {
      issues.push({
        severity: 'error',
        code: 'revision-without-trace',
        message: 'Revision must reference the prediction or prior construction being repaired.',
        stepIndex: index,
      });
    }
    if (step.translationFrom && !step.translationTo) {
      issues.push({
        severity: 'error',
        code: 'incomplete-translation',
        message: 'A translation requires both source and target representations.',
        stepIndex: index,
      });
    }
    if (step.stage === 'retrieve' && !step.delayedRetrieval && !step.transferFamily) {
      issues.push({
        severity: 'warning',
        code: 'weak-retrieval',
        message: 'Retrieval should be delayed or structurally transferred.',
        stepIndex: index,
      });
    }
  });

  const fadeLevels = spec.steps
    .map((step) => step.fadeLevel)
    .filter((level): level is 0 | 1 | 2 | 3 => level !== undefined);
  for (let index = 1; index < fadeLevels.length; index += 1) {
    if (fadeLevels[index]! < fadeLevels[index - 1]!) {
      issues.push({
        severity: 'warning',
        code: 'support-restored-without-reason',
        message: 'Representational support increases after it was faded; document remediation intent.',
      });
      break;
    }
  }

  return issues;
}
