import type { ManipulativeContract } from '../contracts';

export interface RatioState {
  readonly baseX: number;
  readonly baseY: number;
  readonly x: number;
  readonly y: number;
}

export type RatioAction =
  | { readonly type: 'scale'; readonly factor: number }
  | { readonly type: 'set-pair'; readonly x: number; readonly y: number }
  | { readonly type: 'change-x-only'; readonly delta: number }
  | { readonly type: 'change-y-only'; readonly delta: number };

function isProportional(state: RatioState): boolean {
  return state.x * state.baseY === state.y * state.baseX;
}

export function createRatioCovariationContract(
  baseX: number,
  baseY: number,
): ManipulativeContract<RatioState, RatioAction> {
  if (baseX <= 0 || baseY <= 0) throw new Error('A ratio kernel requires positive base quantities.');
  const initialState: RatioState = { baseX, baseY, x: baseX, y: baseY };

  return {
    id: 'cml-ratio-covariation',
    role: 'flagship',
    kernel: 'covariation',
    initialState,
    semanticActionName: (action) => action.type,
    reduce: (state, action) => {
      switch (action.type) {
        case 'scale':
          return { ...state, x: state.baseX * action.factor, y: state.baseY * action.factor };
        case 'set-pair':
          return { ...state, x: action.x, y: action.y };
        case 'change-x-only':
          return { ...state, x: state.x + action.delta };
        case 'change-y-only':
          return { ...state, y: state.y + action.delta };
      }
    },
    constraints: [
      (_state, action) => {
        const values =
          action.type === 'scale'
            ? [action.factor]
            : action.type === 'set-pair'
              ? [action.x, action.y]
              : [action.delta];
        return {
          valid: values.every(Number.isFinite) && (action.type !== 'scale' || action.factor > 0),
          code: 'invalid-ratio-action',
          message: 'Use finite quantities and a positive scale factor.',
        };
      },
    ],
    invariants: [
      (_before, after) => ({
        invariantId: 'constant-ratio',
        holds: isProportional(after),
        message: isProportional(after)
          ? 'Both quantities changed by the same scale factor.'
          : 'The pair left the proportional relationship.',
      }),
    ],
    adapters: [
      {
        kind: 'table',
        toView: (state) => [
          { x: state.baseX, y: state.baseY },
          { x: state.x, y: state.y },
        ],
        narrate: (state) => `The current pair is ${state.x} to ${state.y}.`,
      },
      {
        kind: 'number-line',
        toView: (state) => ({
          top: { base: state.baseX, current: state.x },
          bottom: { base: state.baseY, current: state.y },
        }),
        narrate: (state) => 'The aligned marks show whether both quantities share a scale factor.',
      },
      {
        kind: 'graph',
        toView: (state) => ({
          origin: [0, 0],
          reference: [state.baseX, state.baseY],
          current: [state.x, state.y],
          slope: state.y / state.x,
        }),
        narrate: (state) => `The point is at (${state.x}, ${state.y}).`,
      },
      {
        kind: 'symbolic',
        toView: (state) => ({
          equation: `y = ${(state.baseY / state.baseX).toString()}x`,
          currentSatisfies: isProportional(state),
        }),
        narrate: (state) =>
          isProportional(state)
            ? 'The current pair satisfies the proportional equation.'
            : 'The current pair does not satisfy the proportional equation.',
      },
    ],
    classifyStrategy: (_before, after, action) => {
      if (action.type === 'scale' && isProportional(after)) return ['structural:multiplicative-scaling'];
      if (action.type === 'set-pair' && isProportional(after)) return ['structural:equivalent-ratio'];
      return ['experimental:counterfactual-change'];
    },
    classifyMisconception: (_before, after, action) => {
      if ((action.type === 'change-x-only' || action.type === 'change-y-only') && !isProportional(after)) {
        return ['additive-change-in-proportional-context'];
      }
      if (action.type === 'set-pair' && !isProportional(after)) return ['non-equivalent-ratio'];
      return [];
    },
    comparePrediction: (prediction, observed) => {
      const expected = prediction.expected;
      const matched = typeof expected === 'boolean' && expected === isProportional(observed);
      return {
        matched,
        message: matched
          ? 'Your prediction about proportionality matched the synchronized views.'
          : 'Compare the table, aligned number lines, graph, and equation before revising.',
      };
    },
    fadingPlan: {
      initial: {
        visible: new Set(['table', 'number-line', 'graph', 'symbolic']),
        labelsVisible: true,
        guidesVisible: true,
        objectsVisible: true,
      },
      steps: [
        { afterSuccessfulAttempts: 2, hide: ['number-line'] },
        { afterSuccessfulAttempts: 4, hide: ['table'], labelsVisible: false },
        { afterSuccessfulAttempts: 6, hide: ['graph'], guidesVisible: false },
      ],
    },
  };
}
