import { promises as fs } from "fs";
import path from "path";
import { Course, DailyCategoryFile, Lesson, type TCourse, type TDailyCategoryFile, type TLesson } from "./schema";

const ROOT = path.join(process.cwd(), "content", "courses");

/* ---------------- Catalog (P4) ----------------
 * One pass over content at first request; cached for the process lifetime in
 * production (content is immutable at runtime). Dev rebuilds per request so
 * authoring stays live. Closes the per-request full-rescan flagged in QA_LOG P1 #5.
 */

export interface LessonSummary {
  id: string;
  title: string;
  minutes: number;
  chapterId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  /** The recap step's authored takeaways — the notebook's concept card is
   * GENERATED from these, never separately authored (single source of truth). */
  takeaways: string[];
  /** conceptTags the lesson exercises, in step order — the notebook's link
   * from a card to the live (decaying) mastery evidence. */
  conceptTags: string[];
}

export interface CatalogCourse {
  course: TCourse;
  lessonCount: number;
  totalMinutes: number;
  /** ordered as the chapters list them */
  lessons: LessonSummary[];
  /** distinct conceptTags (skills) taught in this course — for per-course mastery grouping */
  conceptTags: string[];
}

export interface Catalog {
  courses: CatalogCourse[];
  /** lessonId → summary, for search and continue-logic */
  lessonIndex: Record<string, LessonSummary>;
  /** lessonId → absolute file path, for fast single-lesson loads */
  lessonFiles: Record<string, string>;
  /** conceptTag → the id of the lesson that first introduces it (chapter order) — for routing */
  skillFirstLesson: Record<string, string>;
}

/** Canonical course order comes from the generated curriculum manifest.
 * Keeping the catalog, recommendations, and skill routing on the same source
 * prevents filesystem enumeration order from changing the learner path. */
async function canonicalCourseOrder(): Promise<Map<string, number>> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "content", "curriculum-manifest.json"), "utf8");
    const manifest = JSON.parse(raw) as { courses?: Array<{ slug?: string; id?: string }> };
    return new Map(
      (manifest.courses ?? []).flatMap((course, index) => {
        const keys = [course.slug, course.id].filter((key): key is string => !!key);
        return keys.map((key) => [key, index] as const);
      })
    );
  } catch {
    return new Map();
  }
}

/** Shape of a coming-soon catalog card (see UPCOMING_COURSES below). */
export interface UpcomingCourse {
  slug: string;
  title: string;
  tagline: string;
  category: "Math";
  gradeLevel: number;
}
/**
 * Courses announced as coming-soon in the catalog.
 *
 * All twelve courses that once lived here have SHIPPED, so the list is now empty rather than stale:
 * `getUpcoming()` filters out anything already live, which meant the old entries rendered nothing
 * while still implying unfinished work. An empty list is the honest state.
 *
 * The one genuinely deferred band is HIGH-SCHOOL STATISTICS & PROBABILITY (CCSS S-IC inference and
 * S-CP conditional probability). It is deliberately NOT advertised here: a coming-soon card is a
 * promise, and it should only appear once the course is actually scheduled. Tracked in ROADMAP.md.
 */
export const UPCOMING_COURSES: UpcomingCourse[] = [];

/** Soft prerequisite edges for the dashboard trail (recommendations, not locks). */
export const PATH_EDGES: Array<{ from: string; to: string }> = [
  { from: "counting-120", to: "add-subtract-20" },
  { from: "add-subtract-20", to: "tens-and-ones" },
  { from: "add-subtract-20", to: "shapes-measure-g1" },
  { from: "add-subtract-100", to: "measure-money-time" },
  { from: "add-subtract-100", to: "shapes-shares-g2" },
  { from: "tens-and-ones", to: "add-subtract-100" },
  { from: "add-subtract-20", to: "add-subtract-100" },
  { from: "add-subtract-20", to: "multiplication-division" },
  { from: "add-subtract-100", to: "place-value-1000" },
  { from: "place-value-1000", to: "multiplication-division" },
  { from: "ratios-rates", to: "proportional-relationships" },
  { from: "proportional-relationships", to: "rational-number-operations" },
  { from: "rational-number-operations", to: "two-step-equations" },
  { from: "two-step-equations", to: "sampling-and-probability" },
  { from: "multiplication-division", to: "place-value" },
  { from: "multiplication-division", to: "fractions" },
  { from: "place-value", to: "measurement-data" },
  { from: "fractions", to: "shapes-space" },
  { from: "multiplication-division", to: "multiply-bigger" },
  { from: "place-value", to: "place-value-million" },
  { from: "fractions", to: "fractions-add" },
  { from: "measurement-data", to: "measure-convert" },
  { from: "shapes-space", to: "lines-angles" },
  { from: "place-value-million", to: "decimals-place-value" },
  { from: "multiply-bigger", to: "decimal-operations" },
  { from: "fractions-add", to: "fractions-multiply" },
  { from: "measure-convert", to: "volume-measurement" },
  { from: "lines-angles", to: "coordinate-geometry" },
  { from: "fractions-multiply", to: "ratios-rates" },
  { from: "decimal-operations", to: "number-system" },
  { from: "number-system", to: "expressions-equations" },
  { from: "counting-to-20-k", to: "counting-120" },
  { from: "shapes-and-sorting-k", to: "shapes-measure-g1" },
  { from: "expressions-equations", to: "area-surface-volume" },
  { from: "expressions-equations", to: "solving-equations" },
  { from: "solving-equations", to: "exponents-polynomials" },
  { from: "exponents-polynomials", to: "quadratics" },
  { from: "exponents-polynomials", to: "exponential-functions" },
  { from: "exponents-polynomials", to: "radicals-and-exponents" },
  { from: "linear-functions", to: "functions-and-sequences" },
  { from: "solving-equations", to: "linear-functions" },
  // S203V — S203V — twelve missing HS standards, all authored to Tier A: new course data-and-models (S-ID.A/B/C, N-Q.A.3) plus three singleton lessons (F-IF.C.9, G-SRT.A.1a, G-C.A.1) wiring
  { from: "bivariate-statistics", to: "data-and-models" },
  { from: "data-and-models", to: "statistical-inference" },
  // S199 — G6-12 expansion wiring (S-MD+): the capstone for conditional probability
  { from: "conditional-probability", to: "expected-value" },
  { from: "expected-value", to: "statistical-inference" },
  // S199 — G6-12 expansion wiring (A-APR.C.5+): joins polynomial expansion to combinations
  { from: "exponents-polynomials", to: "binomial-theorem" },
  { from: "conditional-probability", to: "binomial-theorem" },
  // S199 — G6-12 expansion wiring (7.G.B.6): a grade-level home for prism/composite measurement
  // S199 — G6-12 expansion wiring (F-IF.C.7b): |x| and piecewise move from G12 to Algebra 1
  { from: "solving-equations", to: "absolute-value-piecewise" },
  { from: "absolute-value-piecewise", to: "function-transformations" },
  // S199 — G6-12 gap patch wiring (A-REI.D.12, A-REI.C.7)
  { from: "solving-equations", to: "inequalities-and-regions" },
  { from: "systems-equations", to: "inequalities-and-regions" },
  { from: "quadratics", to: "nonlinear-systems" },
  { from: "systems-equations", to: "nonlinear-systems" },
  { from: "nonlinear-systems", to: "conic-sections" },
  { from: "linear-functions", to: "systems-equations" },
  { from: "measure-convert", to: "data-distributions" },
  { from: "rational-number-operations", to: "the-real-number-system" },
  { from: "the-real-number-system", to: "exponents-scientific-notation" },
  { from: "proportional-relationships", to: "functions-g8" },
  { from: "two-step-equations", to: "linear-equations-systems" },
  { from: "functions-g8", to: "linear-equations-systems" },
  { from: "area-surface-volume", to: "geometry-g7" },
  { from: "geometry-g7", to: "transformations-measurement" },
  { from: "functions-g8", to: "bivariate-statistics" },
  { from: "data-distributions", to: "bivariate-statistics" },
  { from: "functions-and-sequences", to: "function-transformations" },
  { from: "quadratics", to: "function-transformations" },
  { from: "quadratics", to: "complex-numbers" },
  { from: "function-transformations", to: "complex-numbers" },
  { from: "exponents-polynomials", to: "polynomial-functions" },
  { from: "complex-numbers", to: "polynomial-functions" },
  { from: "radicals-and-exponents", to: "radical-functions" },
  { from: "function-transformations", to: "radical-functions" },
  { from: "function-transformations", to: "function-analysis" },
  { from: "polynomial-functions", to: "polynomial-rational-analysis" },
  { from: "rational-functions", to: "polynomial-rational-analysis" },
  { from: "complex-numbers", to: "polynomial-rational-analysis" },
  { from: "trig-functions", to: "trig-graphs-inverses" },
  { from: "right-triangles-trig", to: "trig-graphs-inverses" },
  { from: "trig-graphs-inverses", to: "trig-identities-equations" },
  { from: "trig-functions", to: "trig-identities-equations" },
  { from: "trig-identities-equations", to: "polar-parametric" },
  { from: "complex-numbers", to: "polar-parametric" },
  { from: "right-triangles-trig", to: "vectors-matrices" },
  { from: "systems-equations", to: "vectors-matrices" },
  { from: "coordinate-proofs", to: "conic-sections" },
  { from: "complex-numbers", to: "conic-sections" },
  { from: "function-analysis", to: "limits-continuity" },
  { from: "polynomial-rational-analysis", to: "limits-continuity" },
  { from: "polynomial-functions", to: "rational-functions" },
  { from: "exponential-functions", to: "logarithms" },
  { from: "function-transformations", to: "logarithms" },
  { from: "functions-and-sequences", to: "sequences-series" },
  { from: "radical-functions", to: "trig-functions" },
  { from: "transformations-measurement", to: "geometry-foundations" },
  { from: "geometry-foundations", to: "constructions-and-proof" },
  { from: "constructions-and-proof", to: "triangle-congruence" },
  { from: "triangle-congruence", to: "similarity" },
  { from: "similarity", to: "right-triangles-trig" },
  { from: "triangle-congruence", to: "polygons-quadrilaterals" },
  { from: "triangle-congruence", to: "circle-theorems" },
  { from: "linear-functions", to: "coordinate-proofs" },
  { from: "transformations-measurement", to: "coordinate-proofs" },
  { from: "similarity", to: "solid-geometry" },
  { from: "sampling-and-probability", to: "conditional-probability" },
  { from: "bivariate-statistics", to: "conditional-probability" },
  { from: "conditional-probability", to: "statistical-inference" },
  { from: "limits-continuity", to: "derivative-rules" },
  { from: "function-analysis", to: "derivative-rules" },
  { from: "derivative-rules", to: "integration-accumulation" },
  { from: "sequences-series", to: "series-convergence" },
  { from: "integration-accumulation", to: "series-convergence" },
  { from: "polar-parametric", to: "parametric-polar-calculus" },
  { from: "integration-applications", to: "parametric-polar-calculus" },
  { from: "integration-accumulation", to: "integration-applications" },
  { from: "integration-accumulation", to: "differential-equations" },
  { from: "exponential-functions", to: "differential-equations" },
  { from: "derivative-rules", to: "curve-analysis" },
  { from: "derivative-rules", to: "derivatives-in-context" },
  { from: "polynomial-rational-analysis", to: "curve-analysis" },
  // S203V: bivariate-statistics -> statistical-inference now routes through data-and-models,
  // the HS course closing S-ID.A/B/C. See the two replacement edges below (S203V wiring block).
  { from: "transformations-measurement", to: "solid-geometry" }
];

async function buildCatalog(): Promise<Catalog> {
  const courseOrder = await canonicalCourseOrder();
  const courses: CatalogCourse[] = [];
  const lessonIndex: Record<string, LessonSummary> = {};
  const lessonFiles: Record<string, string> = {};
  const skillFirstLesson: Record<string, string> = {};

  let dirs: string[] = [];
  try {
    dirs = await fs.readdir(ROOT);
  } catch {
    return { courses: [], lessonIndex, lessonFiles, skillFirstLesson };
  }

  for (const dir of dirs) {
    const coursePath = path.join(ROOT, dir, "course.json");
    let courseRaw: string;
    try {
      courseRaw = await fs.readFile(coursePath, "utf8");
    } catch {
      continue; // not a course dir
    }
    const course = Course.parse(JSON.parse(courseRaw));

    // Read every lesson file once; index by id.
    const perFile: Record<
      string,
      { title: string; minutes: number; chapterId: string; file: string; takeaways: string[] }
    > = {};
    const courseTags = new Set<string>();
    const tagsByLessonId: Record<string, string[]> = {};
    const lessonsDir = path.join(ROOT, dir, "lessons");
    let files: string[] = [];
    try {
      files = await fs.readdir(lessonsDir);
    } catch {
      files = [];
    }
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const fp = path.join(lessonsDir, f);
      const data = JSON.parse(await fs.readFile(fp, "utf8")) as {
        id?: string;
        title?: string;
        minutes?: number;
        chapterId?: string;
        steps?: Array<{ conceptTag?: string; kind?: string; takeaways?: string[] }>;
      };
      if (!data.id || !data.title || !data.minutes || !data.chapterId) continue;
      const lt: string[] = [];
      for (const st of data.steps ?? []) if (st.conceptTag) {
        courseTags.add(st.conceptTag);
        if (!lt.includes(st.conceptTag)) lt.push(st.conceptTag);
      }
      tagsByLessonId[data.id] = lt;
      const takeaways = (data.steps ?? [])
        .filter((st) => st.kind === "recap")
        .flatMap((st) => st.takeaways ?? []);
      perFile[data.id] = { title: data.title, minutes: data.minutes, chapterId: data.chapterId, file: fp, takeaways };
    }

    // Order lessons as chapters list them (check:registration guarantees consistency).
    const lessons: LessonSummary[] = [];
    for (const ch of course.chapters) {
      for (const id of ch.lessonIds) {
        const meta = perFile[id];
        if (!meta) continue;
        const summary: LessonSummary = {
          id,
          title: meta.title,
          minutes: meta.minutes,
          chapterId: ch.id,
          courseId: course.id,
          courseSlug: course.slug,
          courseTitle: course.title,
          takeaways: meta.takeaways,
          conceptTags: tagsByLessonId[id] ?? []
        };
        lessons.push(summary);
        lessonIndex[id] = summary;
        lessonFiles[id] = meta.file;
      }
    }

    courses.push({
      course,
      lessonCount: lessons.length,
      totalMinutes: lessons.reduce((s, l) => s + l.minutes, 0),
      lessons,
      conceptTags: [...courseTags].sort()
    });
  }

  courses.sort((a, b) => {
    const ia = courseOrder.get(a.course.slug) ?? courseOrder.get(a.course.id);
    const ib = courseOrder.get(b.course.slug) ?? courseOrder.get(b.course.id);
    if (ia !== undefined || ib !== undefined) return (ia ?? Number.MAX_SAFE_INTEGER) - (ib ?? Number.MAX_SAFE_INTEGER);
    return (a.course.gradeLevel - b.course.gradeLevel) || a.course.title.localeCompare(b.course.title) || a.course.slug.localeCompare(b.course.slug);
  });

  // Compute first-introduction routing only AFTER canonical sorting. Previously this
  // happened during fs.readdir traversal, making shared skills route differently
  // across filesystems and deployments.
  for (const entry of courses) {
    for (const lesson of entry.lessons) {
      for (const tag of lesson.conceptTags) if (!(tag in skillFirstLesson)) skillFirstLesson[tag] = lesson.id;
    }
  }

  return { courses, lessonIndex, lessonFiles, skillFirstLesson };
}

let catalogCache: Promise<Catalog> | null = null;

export function getCatalog(): Promise<Catalog> {
  if (!catalogCache || process.env.NODE_ENV === "development") {
    catalogCache = buildCatalog();
  }
  return catalogCache;
}

export interface SkillGraph {
  /** tags in curriculum order (course topo order → lesson order) */
  order: string[];
  /** tag → prerequisite tags (absent === none) */
  prereqs: Record<string, string[]>;
}

let graphCache: Promise<SkillGraph> | null = null;
/** Deterministic skill graph (order + prerequisites), generated by scripts/gen-skill-prereqs.mjs.
 * Consumers: recommendNext()/isReady() readiness, the placement diagnostic, and the curriculum
 * forward-advance walk. */
export function getSkillGraph(): Promise<SkillGraph> {
  if (!graphCache || process.env.NODE_ENV === "development") {
    graphCache = (async () => {
      try {
        const raw = await fs.readFile(path.join(process.cwd(), "content", "skill-prereqs.json"), "utf8");
        const data = JSON.parse(raw) as { order?: string[]; prereqs?: Record<string, string[]> };
        return { order: data.order ?? [], prereqs: data.prereqs ?? {} };
      } catch {
        return { order: [], prereqs: {} };
      }
    })();
  }
  return graphCache;
}

/** Just the prerequisite map (back-compat convenience). */
export async function getSkillPrereqs(): Promise<Record<string, string[]>> {
  return (await getSkillGraph()).prereqs;
}

/** Coming-soon cards only for courses that are NOT live yet. */
export async function getUpcoming(): Promise<UpcomingCourse[]> {
  const cat = await getCatalog();
  const live = new Set(cat.courses.map((c) => c.course.slug));
  return UPCOMING_COURSES.filter((u) => !live.has(u.slug));
}

export async function getCourseBySlug(slug: string): Promise<CatalogCourse | null> {
  const cat = await getCatalog();
  return cat.courses.find((c) => c.course.slug === slug) ?? null;
}

export async function loadLessonById(id: string): Promise<TLesson | null> {
  const cat = await getCatalog();
  const fp = cat.lessonFiles[id];
  if (!fp) return null;
  try {
    const raw = await fs.readFile(fp, "utf8");
    return Lesson.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

/* ---------------- Daily Challenge (P5) ---------------- */

const DAILY_ROOT = path.join(process.cwd(), "content", "daily");

async function buildDaily(): Promise<TDailyCategoryFile[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(DAILY_ROOT);
  } catch {
    return [];
  }
  const out: TDailyCategoryFile[] = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = await fs.readFile(path.join(DAILY_ROOT, f), "utf8");
      out.push(DailyCategoryFile.parse(JSON.parse(raw)));
    } catch {
      continue;
    }
  }
  return out;
}

let dailyCache: Promise<TDailyCategoryFile[]> | null = null;

export function getDailyFiles(): Promise<TDailyCategoryFile[]> {
  if (!dailyCache || process.env.NODE_ENV === "development") {
    dailyCache = buildDaily();
  }
  return dailyCache;
}
