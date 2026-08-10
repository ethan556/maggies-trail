function assertEqual<T>(actual: T, expected: T, label = 'assertion'): void {
  if (actual !== expected) throw new Error(`${label}: expected ${String(expected)}, received ${String(actual)}`);
}
import {
  createCausalRuntime,
  decideAdaptiveRung,
  summarizeConceptMastery,
  validateCMLLesson,
  type ManipulativeContract,
  type MasteryEvidenceRecord,
} from '../src/lib/cml/index';

type State = { ones: number; tens: number };
type Action = { type: 'exchange' } | { type: 'add-one' };

const contract: ManipulativeContract<State, Action> = {
  id: 'test-base-ten',
  role: 'flagship',
  kernel: 'quantity-composition',
  initialState: { ones: 10, tens: 0 },
  semanticActionName: (action) => action.type,
  reduce: (state, action) =>
    action.type === 'exchange'
      ? { ones: state.ones - 10, tens: state.tens + 1 }
      : { ...state, ones: state.ones + 1 },
  constraints: [
    (state, action) => ({
      valid: action.type !== 'exchange' || state.ones >= 10,
      code: 'need-ten-ones',
      message: 'An exchange requires ten ones.',
    }),
  ],
  invariants: [
    (before, after) => ({
      invariantId: 'quantity-preserved',
      holds: before.ones + 10 * before.tens === after.ones + 10 * after.tens,
    }),
  ],
  adapters: [
    {
      kind: 'symbolic',
      toView: (state) => state.tens * 10 + state.ones,
      narrate: (state) => `${state.tens} tens and ${state.ones} ones.`,
    },
  ],
  classifyStrategy: (_before, _after, action) =>
    action.type === 'exchange' ? ['structural:unit-exchange'] : ['inefficient:counting-by-ones'],
  classifyMisconception: (before, _after, action) =>
    action.type === 'exchange' && before.ones < 10 ? ['exchange-without-ten'] : [],
  comparePrediction: (prediction, observed) => ({
    matched: prediction.expected === observed.tens,
    message: prediction.expected === observed.tens ? 'Prediction matched.' : 'Revise the prediction.',
  }),
};

const runtime = createCausalRuntime(contract);
runtime.commitPrediction(1, 'symbolic');
const event = runtime.dispatch({ type: 'exchange' }, { correct: true, confidence: 'sure' });
assertEqual(event.after.tens, 1);
assertEqual(event.invariants[0]!.holds, true);
assertEqual(runtime.comparePrediction()?.matched, true);
assertEqual(runtime.undo(), true);
assertEqual(runtime.snapshot().state.tens, 0);
assertEqual(runtime.redo(), true);
assertEqual(runtime.snapshot().state.tens, 1);

const decision = decideAdaptiveRung([
  { ...event, id: 'a', direction: 'away', misconceptionTags: ['same-error'] },
  { ...event, id: 'b', direction: 'away', misconceptionTags: ['same-error'] },
]);
assertEqual(decision.rung, 'contrast');

const evidence: MasteryEvidenceRecord[] = [
  {
    id: '1', learnerId: 'l', lessonId: 'a', sessionId: 's1', occurredAt: '2026-01-01T10:00:00Z',
    conceptTag: 'place-value', stage: 'retrieve', correct: true, independent: true, efficient: true,
    representation: 'concrete', misconceptionTags: [], strategyTags: ['exchange'], confidence: 'sure',
  },
  {
    id: '2', learnerId: 'l', lessonId: 'b', sessionId: 's1', occurredAt: '2026-01-01T10:05:00Z',
    conceptTag: 'place-value', stage: 'retrieve', correct: true, independent: true, efficient: true,
    representation: 'symbolic', misconceptionTags: [], strategyTags: ['exchange'], confidence: 'sure',
  },
  {
    id: '3', learnerId: 'l', lessonId: 'c', sessionId: 's2', occurredAt: '2026-01-08T10:00:00Z',
    conceptTag: 'place-value', stage: 'retrieve', correct: true, independent: true, efficient: true,
    representation: 'symbolic', misconceptionTags: [], strategyTags: ['exchange'], confidence: 'sure', transfer: true,
  },
];
assertEqual(summarizeConceptMastery('place-value', evidence).level, 'transferable');

const authoringIssues = validateCMLLesson({
  lessonId: 'pilot',
  grade: 4,
  steps: [
    { stage: 'predict' },
    { stage: 'construct', directManipulation: true, causalConsequence: true, invariants: ['value'] },
    { stage: 'observe', causalConsequence: true },
    { stage: 'explain' },
    { stage: 'revise', revisionOf: 'prediction-1' },
    { stage: 'generalize', translationFrom: 'diagram', translationTo: 'symbolic' },
    { stage: 'retrieve', delayedRetrieval: true, transferFamily: 'pilot-transfer' },
  ],
});
assertEqual(authoringIssues.filter((issue) => issue.severity === 'error').length, 0);

console.log('CML foundation self-test passed.');
