export type CMLStage =
  | 'predict'
  | 'construct'
  | 'observe'
  | 'explain'
  | 'revise'
  | 'generalize'
  | 'retrieve';

export type RepresentationKind =
  | 'concrete'
  | 'diagram'
  | 'number-line'
  | 'table'
  | 'symbolic'
  | 'graph'
  | 'language';

export type Confidence = 'guess' | 'unsure' | 'sure';

export type EvidenceLevel =
  | 'exposed'
  | 'practiced'
  | 'mastered'
  | 'retained'
  | 'transferable';

export type EngineRole = 'flagship' | 'supporting' | 'assessment';

export interface MathematicalSnapshot {
  readonly canonical: unknown;
  readonly representations: Partial<Record<RepresentationKind, unknown>>;
  readonly narration: string;
}

export interface ConstraintResult {
  readonly valid: boolean;
  readonly code?: string;
  readonly message?: string;
}

export interface InvariantResult {
  readonly holds: boolean;
  readonly invariantId: string;
  readonly message?: string;
}

export interface Prediction<State> {
  readonly id: string;
  readonly committedAt: string;
  readonly expected: Partial<State> | string | number | boolean;
  readonly representation?: RepresentationKind;
}

export interface ProcessEvent<State, Action> {
  readonly id: string;
  readonly timestamp: string;
  readonly action: Action;
  readonly before: State;
  readonly after: State;
  readonly actionName: string;
  readonly direction?: 'toward' | 'away' | 'past' | 'invalid' | 'neutral';
  readonly magnitude?: number;
  readonly strategyTags: readonly string[];
  readonly misconceptionTags: readonly string[];
  readonly constraint?: ConstraintResult;
  readonly invariants: readonly InvariantResult[];
  readonly confidence?: Confidence;
  readonly independent: boolean;
}

export interface RepresentationAdapter<State> {
  readonly kind: RepresentationKind;
  readonly toView: (state: State) => unknown;
  readonly narrate: (state: State) => string;
}

export interface FadingState {
  readonly visible: ReadonlySet<RepresentationKind>;
  readonly labelsVisible: boolean;
  readonly guidesVisible: boolean;
  readonly objectsVisible: boolean;
}

export interface FadingStep {
  readonly afterSuccessfulAttempts: number;
  readonly hide?: readonly RepresentationKind[];
  readonly show?: readonly RepresentationKind[];
  readonly labelsVisible?: boolean;
  readonly guidesVisible?: boolean;
  readonly objectsVisible?: boolean;
}

export interface FadingPlan {
  readonly initial: FadingState;
  readonly steps: readonly FadingStep[];
}

export interface EvidenceOutput {
  readonly conceptTag: string;
  readonly stage: CMLStage;
  readonly correct: boolean;
  readonly independent: boolean;
  readonly efficient: boolean;
  readonly explanationAccurate?: boolean;
  readonly transfer?: boolean;
  readonly delayed?: boolean;
  readonly representation: RepresentationKind;
  readonly misconceptionTags: readonly string[];
  readonly strategyTags: readonly string[];
  readonly confidence?: Confidence;
  readonly responseTimeMs?: number;
}

export interface ManipulativeContract<State, Action> {
  readonly id: string;
  readonly role: EngineRole;
  readonly kernel:
    | 'quantity-composition'
    | 'equivalence-transformation'
    | 'covariation'
    | 'spatial-invariance'
    | 'chance-sampling';
  readonly initialState: State;
  readonly semanticActionName: (action: Action) => string;
  readonly reduce: (state: State, action: Action) => State;
  readonly constraints: readonly ((state: State, action: Action) => ConstraintResult)[];
  readonly invariants: readonly ((before: State, after: State, action: Action) => InvariantResult)[];
  readonly adapters: readonly RepresentationAdapter<State>[];
  readonly classifyStrategy?: (
    before: State,
    after: State,
    action: Action,
    history: readonly ProcessEvent<State, Action>[],
  ) => readonly string[];
  readonly classifyMisconception?: (
    before: State,
    after: State,
    action: Action,
    history: readonly ProcessEvent<State, Action>[],
  ) => readonly string[];
  readonly comparePrediction?: (prediction: Prediction<State>, observed: State) => {
    readonly matched: boolean;
    readonly message: string;
  };
  readonly fadingPlan?: FadingPlan;
}

export interface RuntimeSnapshot<State, Action> {
  readonly state: State;
  readonly history: readonly ProcessEvent<State, Action>[];
  readonly undone: readonly ProcessEvent<State, Action>[];
  readonly prediction?: Prediction<State>;
  readonly fading: FadingState;
  readonly successfulAttempts: number;
}
