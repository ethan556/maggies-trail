/**
 * Phase B — world types. The manifest is GEOGRAPHY (frozen, generated, no learner state);
 * WorldEvidence is the learner's durable record projected out of the existing Profile; and
 * everything derived from the two lives in pure functions so it can be tested exhaustively
 * and can never disagree with the stores it reads.
 */

export interface WorldRegion {
  id: string;
  gradeBand: number;
  name: string;
  description: string;
  visualMaturity: "early" | "elementary" | "middle" | "secondary" | "advanced";
  environmentalGrammar: string;
  primaryDomains: string[];
  accessibilityLabel: string;
}

export interface WorldCourse {
  courseId: string;
  regionId: string;
  trailName: string;
  trailSummary: string;
  prerequisiteCourseIds: string[];
  landmarkIds: string[];
  /** Empty until Phase D maps instruments to conceptTag evidence. */
  instrumentIds: string[];
  /** Empty until Phase D derives transfer connections. */
  conceptConnections: string[];
}

export interface WorldLandmark {
  id: string; // `${courseId}:${chapterId}`
  courseId: string;
  chapterId: string;
  name: string;
  waypointIds: string[];
}

export interface WorldInstrument {
  id: string;
  name: string;
  transferableIdea: string;
  /** Phase D fills these; the state ladder in revealRules is already total over them. */
  conceptTags: string[];
}

export interface WorldConnection {
  id: string;
  fromCourseId: string;
  toCourseId: string;
  sharedConceptTags: string[];
  description: string;
}

export interface WorldManifest {
  version: number;
  generatedBy: string;
  regions: WorldRegion[];
  courses: WorldCourse[];
  landmarks: WorldLandmark[];
  instruments: WorldInstrument[];
  connections: WorldConnection[];
}

/** The learner's durable evidence, projected from the existing Profile. Nothing here is new
 * state — every field is already stored by progress.ts / engine.ts / mastery.ts. */
export interface WorldSkill {
  tag: string;
  mastery: number;
  attempts: number;
  correctStreak: number;
  lastSeen: string | null;
}
export interface WorldEvidence {
  /** lessonId → completion record (LessonProgress projection). */
  lessons: Record<string, { completed: boolean; completedAt?: string }>;
  /** Pending spaced-review items (graduated items are removed by engine.onCorrect).
   * `conceptTag` and `box` are carried because §16 requires Return Paths to explain WHY a
   * concept returns and how far along its retention ladder it is — a due date alone cannot. */
  review: Array<{ lessonId: string; due: string; conceptTag: string; box: number }>;
  /** chapterId → passed test-out. */
  testouts: Record<string, boolean>;
  /** conceptTag → skill state. */
  mastery: Record<string, WorldSkill>;
}

export type LandmarkState = "unvisited" | "active" | "complete";
/** §16's five labelled states plus the quiet default when none applies. */
export type MaintenanceState =
  | "recently-traveled"
  | "needs-reinforcement"
  | "route-fading"
  | "route-restored"
  | "enduring"
  | "holding";
export type InstrumentState = "undiscovered" | "discovered" | "assembled" | "calibrated" | "carried" | "enduring";

export interface DerivedCourse {
  courseId: string;
  regionId: string;
  approachOpen: boolean;
  totalWaypoints: number;
  completedWaypoints: number;
  complete: boolean;
  landmarks: Array<{ id: string; name: string; state: LandmarkState; completed: number; total: number }>;
  maintenance: MaintenanceState;
}

export interface WorldState {
  today: string;
  /** The evidence this state was derived from. Carried so surfaces that need RAW evidence
   * (instrument states read mastery; Return Paths read review items) do not have to re-load
   * the profile and risk deriving from a different snapshot than the rest of the page. */
  evidence: WorldEvidence;
  regions: Array<{ id: string; name: string; courseIds: string[] }>;
  courses: Record<string, DerivedCourse>;
  /** Latest completion, as a location: where the learner last stood on the trail. */
  currentLocation: { courseId: string; landmarkId: string; waypointId: string } | null;
}
