import type {
  Confidence,
  FadingPlan,
  FadingState,
  ManipulativeContract,
  MathematicalSnapshot,
  Prediction,
  ProcessEvent,
  RepresentationKind,
  RuntimeSnapshot,
} from './contracts';

function createId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

function cloneSet<T>(value: ReadonlySet<T>): Set<T> {
  return new Set(value);
}

function defaultFading(contractKinds: readonly RepresentationKind[]): FadingState {
  return {
    visible: new Set(contractKinds),
    labelsVisible: true,
    guidesVisible: true,
    objectsVisible: true,
  };
}

function applyFadingPlan(
  base: FadingState,
  plan: FadingPlan | undefined,
  successfulAttempts: number,
): FadingState {
  if (!plan) return base;

  const next: FadingState = {
    visible: cloneSet(plan.initial.visible),
    labelsVisible: plan.initial.labelsVisible,
    guidesVisible: plan.initial.guidesVisible,
    objectsVisible: plan.initial.objectsVisible,
  };

  const visible = cloneSet(next.visible);
  let labelsVisible = next.labelsVisible;
  let guidesVisible = next.guidesVisible;
  let objectsVisible = next.objectsVisible;

  for (const step of [...plan.steps].sort(
    (a, b) => a.afterSuccessfulAttempts - b.afterSuccessfulAttempts,
  )) {
    if (successfulAttempts < step.afterSuccessfulAttempts) continue;
    for (const kind of step.hide ?? []) visible.delete(kind);
    for (const kind of step.show ?? []) visible.add(kind);
    if (step.labelsVisible !== undefined) labelsVisible = step.labelsVisible;
    if (step.guidesVisible !== undefined) guidesVisible = step.guidesVisible;
    if (step.objectsVisible !== undefined) objectsVisible = step.objectsVisible;
  }

  return { visible, labelsVisible, guidesVisible, objectsVisible };
}

export interface CausalRuntime<State, Action> {
  readonly snapshot: () => RuntimeSnapshot<State, Action>;
  readonly dispatch: (
    action: Action,
    options?: { confidence?: Confidence; independent?: boolean; correct?: boolean },
  ) => ProcessEvent<State, Action>;
  readonly commitPrediction: (
    expected: Prediction<State>['expected'],
    representation?: RepresentationKind,
  ) => Prediction<State>;
  readonly comparePrediction: () =>
    | { matched: boolean; message: string }
    | undefined;
  readonly undo: () => boolean;
  readonly redo: () => boolean;
  readonly reset: () => void;
  readonly replay: () => readonly ProcessEvent<State, Action>[];
  readonly mathematicalSnapshot: () => MathematicalSnapshot;
}

export function createCausalRuntime<State, Action>(
  contract: ManipulativeContract<State, Action>,
): CausalRuntime<State, Action> {
  let state = contract.initialState;
  let history: ProcessEvent<State, Action>[] = [];
  let undone: ProcessEvent<State, Action>[] = [];
  let prediction: Prediction<State> | undefined;
  let successfulAttempts = 0;

  const kinds = contract.adapters.map((adapter) => adapter.kind);

  const getFading = (): FadingState =>
    applyFadingPlan(defaultFading(kinds), contract.fadingPlan, successfulAttempts);

  const snapshot = (): RuntimeSnapshot<State, Action> => ({
    state,
    history: [...history],
    undone: [...undone],
    ...(prediction ? { prediction } : {}),
    fading: getFading(),
    successfulAttempts,
  });

  const dispatch: CausalRuntime<State, Action>['dispatch'] = (action, options = {}) => {
    const before = state;
    const failedConstraint = contract.constraints
      .map((constraint) => constraint(before, action))
      .find((result) => !result.valid);

    const after = failedConstraint ? before : contract.reduce(before, action);
    const invariants = contract.invariants.map((invariant) => invariant(before, after, action));
    const provisional: ProcessEvent<State, Action> = {
      id: createId('event'),
      timestamp: new Date().toISOString(),
      action,
      before,
      after,
      actionName: contract.semanticActionName(action),
      direction: failedConstraint ? 'invalid' : 'neutral',
      strategyTags: [],
      misconceptionTags: [],
      ...(failedConstraint ? { constraint: failedConstraint } : {}),
      invariants,
      ...(options.confidence ? { confidence: options.confidence } : {}),
      independent: options.independent ?? true,
    };

    const strategyTags = contract.classifyStrategy?.(before, after, action, history) ?? [];
    const misconceptionTags =
      contract.classifyMisconception?.(before, after, action, history) ?? [];

    const event: ProcessEvent<State, Action> = {
      ...provisional,
      direction:
        failedConstraint || invariants.some((item) => !item.holds)
          ? 'invalid'
          : misconceptionTags.length > 0
            ? 'away'
            : strategyTags.length > 0
              ? 'toward'
              : 'neutral',
      strategyTags,
      misconceptionTags,
    };

    if (!failedConstraint) state = after;
    history = [...history, event];
    undone = [];
    if (options.correct) successfulAttempts += 1;
    return event;
  };

  const commitPrediction: CausalRuntime<State, Action>['commitPrediction'] = (
    expected,
    representation,
  ) => {
    const committed: Prediction<State> = {
      id: createId('prediction'),
      committedAt: new Date().toISOString(),
      expected,
      ...(representation ? { representation } : {}),
    };
    prediction = committed;
    return committed;
  };

  const comparePrediction: CausalRuntime<State, Action>['comparePrediction'] = () => {
    if (!prediction || !contract.comparePrediction) return undefined;
    return contract.comparePrediction(prediction, state);
  };

  const undo = (): boolean => {
    const last = history.at(-1);
    if (!last) return false;
    state = last.before;
    history = history.slice(0, -1);
    undone = [last, ...undone];
    return true;
  };

  const redo = (): boolean => {
    const next = undone[0];
    if (!next) return false;
    state = next.after;
    history = [...history, next];
    undone = undone.slice(1);
    return true;
  };

  const reset = (): void => {
    state = contract.initialState;
    history = [];
    undone = [];
    prediction = undefined;
    successfulAttempts = 0;
  };

  const replay = (): readonly ProcessEvent<State, Action>[] => [...history];

  const mathematicalSnapshot = (): MathematicalSnapshot => {
    const fading = getFading();
    const representations: Partial<Record<RepresentationKind, unknown>> = {};
    const narration: string[] = [];

    for (const adapter of contract.adapters) {
      if (!fading.visible.has(adapter.kind)) continue;
      representations[adapter.kind] = adapter.toView(state);
      narration.push(adapter.narrate(state));
    }

    return {
      canonical: state,
      representations,
      narration: narration.join(' '),
    };
  };

  return {
    snapshot,
    dispatch,
    commitPrediction,
    comparePrediction,
    undo,
    redo,
    reset,
    replay,
    mathematicalSnapshot,
  };
}
