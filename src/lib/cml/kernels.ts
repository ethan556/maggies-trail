export interface ConceptKernelDescriptor {
  readonly id:
    | 'quantity-composition'
    | 'equivalence-transformation'
    | 'covariation'
    | 'spatial-invariance'
    | 'chance-sampling';
  readonly purpose: string;
  readonly canonicalActions: readonly string[];
  readonly coreInvariants: readonly string[];
  readonly candidateEngines: readonly string[];
}

export const CML_KERNELS: readonly ConceptKernelDescriptor[] = [
  {
    id: 'quantity-composition',
    purpose: 'Compose, decompose, exchange, compare, and locate quantities across representations.',
    canonicalActions: ['compose', 'decompose', 'exchange', 'group', 'ungroup', 'locate'],
    coreInvariants: ['quantity-preserved', 'unit-value-preserved', 'order-preserved'],
    candidateEngines: [
      'tenFrame',
      'baseTenCompose',
      'numberLineHop',
      'numberLinePlace',
      'placeValue',
      'moneyBoard',
    ],
  },
  {
    id: 'equivalence-transformation',
    purpose: 'Transform forms while preserving value, equality, or solution set.',
    canonicalActions: ['partition', 'repartition', 'scale', 'simplify', 'balance', 'substitute'],
    coreInvariants: ['value-preserved', 'equality-preserved', 'solution-set-preserved'],
    candidateEngines: [
      'fractionBar',
      'fractionGrid',
      'algebraTiles',
      'balanceScale',
      'solveBalance',
      'integerChips',
      'quotientReasoningLab',
      'exactNumberLab',
    ],
  },
  {
    id: 'covariation',
    purpose: 'Coordinate how two or more quantities change together.',
    canonicalActions: ['vary-input', 'scale-pair', 'change-parameter', 'trace', 'compare-rate'],
    coreInvariants: ['constant-ratio', 'constant-rate', 'function-rule', 'intersection-condition'],
    candidateEngines: [
      'ratioTable',
      'doubleNumberLine',
      'lineExplore',
      'functionMachine',
      'systemsExplore',
      'affineRelationshipLab',
      'proportionalReasoningLab',
      'placeValueTransformLab',
      'graphStoryLab',
      'conditionalTableLab',
      'ciCapture',
      'scatterFit',
    ],
  },
  {
    id: 'spatial-invariance',
    purpose: 'Transform, measure, compose, and decompose spatial objects while tracking invariants.',
    canonicalActions: ['translate', 'rotate', 'reflect', 'dilate', 'measure', 'compose', 'fold'],
    coreInvariants: ['distance-preserved', 'angle-preserved', 'area-relation', 'volume-relation'],
    candidateEngines: [
      'pointSetReasoningLab',
      'geometricConstraintLab',
      'transformExplore',
      'dilationExplore',
      'angleMeasure',
      'areaModel',
      'volumeBuilder',
      'netFold',
    ],
  },
  {
    id: 'chance-sampling',
    purpose: 'Generate data, vary sampling processes, and connect chance to distributions and claims.',
    canonicalActions: ['sample', 'resample', 'simulate', 'classify-outcome', 'fit', 'compare-distribution'],
    coreInvariants: ['probability-total', 'sample-size', 'center-spread-relation', 'association-not-causation'],
    candidateEngines: [
      'spinnerSim',
      'sampleSim',
      'dotPlot',
      'boxPlot',
      'scatterFit',
      'shuffleTest',
    ],
  },
] as const;
