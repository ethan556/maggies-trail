import type { ManipulativeContract } from '../contracts';

export interface BaseTenState {
  readonly ones: number;
  readonly tens: number;
  readonly hundreds: number;
}

export type BaseTenAction =
  | { readonly type: 'add'; readonly place: 'ones' | 'tens' | 'hundreds'; readonly count: number }
  | { readonly type: 'remove'; readonly place: 'ones' | 'tens' | 'hundreds'; readonly count: number }
  | { readonly type: 'exchange-up'; readonly from: 'ones' | 'tens' }
  | { readonly type: 'exchange-down'; readonly from: 'tens' | 'hundreds' };

export function baseTenValue(state: BaseTenState): number {
  return state.ones + state.tens * 10 + state.hundreds * 100;
}

function addAt(state: BaseTenState, place: keyof BaseTenState, delta: number): BaseTenState {
  return { ...state, [place]: state[place] + delta };
}

export function createBaseTenExchangeContract(
  initialState: BaseTenState,
): ManipulativeContract<BaseTenState, BaseTenAction> {
  return {
    id: 'cml-base-ten-exchange',
    role: 'flagship',
    kernel: 'quantity-composition',
    initialState,
    semanticActionName: (action) => {
      if (action.type === 'exchange-up') return `exchange-ten-${action.from}-up`;
      if (action.type === 'exchange-down') return `exchange-one-${action.from}-down`;
      return `${action.type}-${action.count}-${action.place}`;
    },
    reduce: (state, action) => {
      switch (action.type) {
        case 'add':
          return addAt(state, action.place, action.count);
        case 'remove':
          return addAt(state, action.place, -action.count);
        case 'exchange-up':
          return action.from === 'ones'
            ? { ...state, ones: state.ones - 10, tens: state.tens + 1 }
            : { ...state, tens: state.tens - 10, hundreds: state.hundreds + 1 };
        case 'exchange-down':
          return action.from === 'tens'
            ? { ...state, tens: state.tens - 1, ones: state.ones + 10 }
            : { ...state, hundreds: state.hundreds - 1, tens: state.tens + 10 };
      }
    },
    constraints: [
      (state, action) => {
        if (action.type === 'exchange-up') {
          const available = action.from === 'ones' ? state.ones : state.tens;
          return {
            valid: available >= 10,
            code: 'exchange-up-needs-ten',
            message: `Make a group of ten ${action.from} before exchanging.`,
          };
        }
        if (action.type === 'exchange-down') {
          const available = action.from === 'tens' ? state.tens : state.hundreds;
          return {
            valid: available >= 1,
            code: 'exchange-down-needs-one',
            message: `You need one ${action.from} to ungroup.`,
          };
        }
        if (action.type === 'remove') {
          return {
            valid: state[action.place] >= action.count && action.count > 0,
            code: 'cannot-remove-missing-units',
            message: `There are not enough ${action.place} to remove.`,
          };
        }
        return {
          valid: action.count > 0,
          code: 'positive-count-required',
          message: 'Add a positive number of units.',
        };
      },
    ],
    invariants: [
      (before, after, action) => ({
        invariantId: 'quantity-preserved-during-exchange',
        holds:
          action.type === 'add' || action.type === 'remove'
            ? true
            : baseTenValue(before) === baseTenValue(after),
        message: 'Trading units changes the representation, not the quantity.',
      }),
    ],
    adapters: [
      {
        kind: 'concrete',
        toView: (state) => ({
          hundredFlats: state.hundreds,
          tenRods: state.tens,
          oneCubes: state.ones,
        }),
        narrate: (state) => `${state.hundreds} hundreds, ${state.tens} tens, and ${state.ones} ones.`,
      },
      {
        kind: 'table',
        toView: (state) => [
          { place: 'hundreds', count: state.hundreds, value: state.hundreds * 100 },
          { place: 'tens', count: state.tens, value: state.tens * 10 },
          { place: 'ones', count: state.ones, value: state.ones },
        ],
        narrate: (state) => `The place-value chart represents ${baseTenValue(state)}.`,
      },
      {
        kind: 'symbolic',
        toView: baseTenValue,
        narrate: (state) => `The numeral is ${baseTenValue(state)}.`,
      },
    ],
    classifyStrategy: (_before, _after, action, history) => {
      if (action.type === 'exchange-up' || action.type === 'exchange-down') {
        return ['structural:place-value-exchange'];
      }
      const repeatedOnes = [...history, { action }].filter(
        (event) => event.action.type === 'add' && event.action.place === 'ones',
      ).length;
      return repeatedOnes >= 5 ? ['inefficient:counting-by-ones'] : ['constructing:quantity'];
    },
    classifyMisconception: (_before, after) => {
      if (after.ones >= 20 || after.tens >= 20) return ['missed-efficient-exchange'];
      return [];
    },
    comparePrediction: (prediction, observed) => {
      const expected = typeof prediction.expected === 'number' ? prediction.expected : undefined;
      const actual = baseTenValue(observed);
      return {
        matched: expected === actual,
        message:
          expected === actual
            ? `Your prediction matched ${actual}.`
            : `You predicted ${String(expected)}, but the construction shows ${actual}. Revise the exchange plan.`,
      };
    },
    fadingPlan: {
      initial: {
        visible: new Set(['concrete', 'table', 'symbolic']),
        labelsVisible: true,
        guidesVisible: true,
        objectsVisible: true,
      },
      steps: [
        { afterSuccessfulAttempts: 2, labelsVisible: false },
        { afterSuccessfulAttempts: 4, hide: ['concrete'], guidesVisible: false },
        { afterSuccessfulAttempts: 6, hide: ['table'], show: ['symbolic'], objectsVisible: false },
      ],
    },
  };
}
