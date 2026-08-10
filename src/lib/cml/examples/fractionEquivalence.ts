import type { ManipulativeContract } from '../contracts';

export interface FractionEquivalenceState {
  readonly numerator: number;
  readonly denominator: number;
  readonly scale: number;
}

export type FractionEquivalenceAction =
  | { readonly type: 'set-scale'; readonly scale: number }
  | { readonly type: 'scale-up' }
  | { readonly type: 'scale-down' };

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function displayedFraction(state: FractionEquivalenceState): { numerator: number; denominator: number } {
  return {
    numerator: state.numerator * state.scale,
    denominator: state.denominator * state.scale,
  };
}

export function createFractionEquivalenceContract(
  numerator: number,
  denominator: number,
): ManipulativeContract<FractionEquivalenceState, FractionEquivalenceAction> {
  if (denominator <= 0 || numerator < 0 || numerator > denominator) {
    throw new Error('The reference fraction must be between 0 and 1 with a positive denominator.');
  }
  const divisor = gcd(numerator, denominator);
  const initialState = {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
    scale: 1,
  };

  return {
    id: 'cml-fraction-equivalence',
    role: 'flagship',
    kernel: 'equivalence-transformation',
    initialState,
    semanticActionName: (action) => action.type,
    reduce: (state, action) => {
      if (action.type === 'set-scale') return { ...state, scale: action.scale };
      if (action.type === 'scale-up') return { ...state, scale: state.scale + 1 };
      return { ...state, scale: Math.max(1, state.scale - 1) };
    },
    constraints: [
      (state, action) => {
        const proposed =
          action.type === 'set-scale'
            ? action.scale
            : action.type === 'scale-up'
              ? state.scale + 1
              : state.scale - 1;
        return {
          valid: Number.isInteger(proposed) && proposed >= 1 && state.denominator * proposed <= 48,
          code: 'invalid-partition-scale',
          message: 'Use a whole-number scale that keeps the partition readable.',
        };
      },
    ],
    invariants: [
      (before, after) => {
        const left = displayedFraction(before);
        const right = displayedFraction(after);
        return {
          invariantId: 'fraction-magnitude-preserved',
          holds: left.numerator * right.denominator === right.numerator * left.denominator,
          message: 'Repartitioning changes the number of pieces, not the represented amount.',
        };
      },
    ],
    adapters: [
      {
        kind: 'diagram',
        toView: (state) => {
          const fraction = displayedFraction(state);
          return {
            totalParts: fraction.denominator,
            shadedParts: fraction.numerator,
            equalParts: true,
          };
        },
        narrate: (state) => {
          const fraction = displayedFraction(state);
          return `${fraction.numerator} of ${fraction.denominator} equal parts are shaded.`;
        },
      },
      {
        kind: 'number-line',
        toView: (state) => ({
          min: 0,
          max: 1,
          partitions: state.denominator * state.scale,
          point: state.numerator / state.denominator,
        }),
        narrate: (state) => `The point remains at ${state.numerator}/${state.denominator} of the unit interval.`,
      },
      {
        kind: 'symbolic',
        toView: displayedFraction,
        narrate: (state) => {
          const fraction = displayedFraction(state);
          return `${fraction.numerator}/${fraction.denominator} is equivalent to ${state.numerator}/${state.denominator}.`;
        },
      },
    ],
    classifyStrategy: (_before, after, action) =>
      action.type === 'set-scale' && after.scale > 1
        ? ['structural:multiplicative-repartitioning']
        : ['exploring:equivalent-partitions'],
    classifyMisconception: (_before, after) =>
      after.scale > 12 ? ['overpartitioning-without-purpose'] : [],
    comparePrediction: (prediction, observed) => {
      const fraction = displayedFraction(observed);
      const expected = prediction.expected;
      const matched =
        typeof expected === 'string' && expected === `${fraction.numerator}/${fraction.denominator}`;
      return {
        matched,
        message: matched
          ? 'Your predicted equivalent fraction matches the repartitioned model.'
          : `The model shows ${fraction.numerator}/${fraction.denominator}. Explain why its location did not change.`,
      };
    },
    fadingPlan: {
      initial: {
        visible: new Set(['diagram', 'number-line', 'symbolic']),
        labelsVisible: true,
        guidesVisible: true,
        objectsVisible: true,
      },
      steps: [
        { afterSuccessfulAttempts: 2, labelsVisible: false },
        { afterSuccessfulAttempts: 4, hide: ['diagram'] },
        { afterSuccessfulAttempts: 6, hide: ['number-line'], guidesVisible: false },
      ],
    },
  };
}
