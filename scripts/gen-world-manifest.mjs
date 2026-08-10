#!/usr/bin/env node
/**
 * gen-world-manifest (Phase B prerequisite, pulled forward from Phase A).
 *
 * Generates `content/world/world-manifest.json` deterministically from three inputs that
 * already exist — course.json files, PATH_EDGES, and the §5 region table below. Nothing here
 * is authored per-course by hand, so the manifest can never drift from the curriculum: rerun
 * this script and it is correct again. `verify:world` fails if the checked-in file differs
 * from a fresh generation.
 *
 * Two §7 rules are load-bearing:
 *   - NO LEARNING STATE. The manifest describes the world's geography, never the learner's
 *     position in it. Derivation of visible/active/enduring lives in src/world/ as pure
 *     functions over the profile. verify:world asserts the forbidden keys are absent.
 *   - instrumentIds / conceptConnections are EMPTY in Phase B. Mapping instruments to
 *     conceptTag evidence is Phase D work; writing placeholder mappings now would be data
 *     that looks authoritative and is not.
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

/** §5, verbatim intent: fourteen regions, one per grade band 0..13. Only maturity and
 * density change across them — the semantics are identical everywhere. */
const REGIONS = [
  { grade: 0,  id: "trailhead-meadow",     name: "Trailhead Meadow",     maturity: "early",      grammar: "warm, spacious, concrete; large shapes, low density",                    domains: ["counting", "shapes", "comparison"] },
  { grade: 1,  id: "numberwood",           name: "Numberwood",           maturity: "early",      grammar: "counting groves and shape clearings",                                     domains: ["addition", "subtraction", "place value", "shapes"] },
  { grade: 2,  id: "measure-creek",        name: "Measure Creek",        maturity: "early",      grammar: "bridges, units, number-line crossings, arrays",                           domains: ["measurement", "money", "time", "arrays"] },
  { grade: 3,  id: "pattern-valley",       name: "Pattern Valley",       maturity: "elementary", grammar: "branching paths, multiplication terraces, fraction crossings",            domains: ["multiplication", "division", "fractions", "area"] },
  { grade: 4,  id: "builders-range",       name: "Builder's Range",      maturity: "elementary", grammar: "factor ridges, decimal terraces, construction",                           domains: ["factors", "decimals", "fraction operations", "angles"] },
  { grade: 5,  id: "coordinate-highlands", name: "Coordinate Highlands", maturity: "elementary", grammar: "fraction networks, coordinate trails, symbolic overlays",                 domains: ["fraction arithmetic", "volume", "coordinates", "expressions"] },
  { grade: 6,  id: "ratio-riverlands",     name: "Ratio Riverlands",     maturity: "middle",     grammar: "proportional flows and unit-rate channels",                               domains: ["ratios", "rates", "expressions", "data"] },
  { grade: 7,  id: "proportion-pass",      name: "Proportion Pass",      maturity: "middle",     grammar: "scale routes, probability forks, signed elevation",                       domains: ["proportionality", "signed numbers", "probability", "geometry"] },
  { grade: 8,  id: "function-frontier",    name: "Function Frontier",    maturity: "middle",     grammar: "slope trails, transformations, linked representations",                   domains: ["functions", "linear equations", "transformations", "roots"] },
  { grade: 9,  id: "equation-range",       name: "Equation Range",       maturity: "secondary",  grammar: "balance, systems intersections, inequality regions, piecewise routes",    domains: ["equations", "systems", "quadratics", "exponentials"] },
  { grade: 10, id: "proof-peaks",          name: "Proof Peaks",          maturity: "secondary",  grammar: "drafting, correspondence marks, deductive routes",                        domains: ["congruence", "similarity", "circles", "proof"] },
  { grade: 11, id: "transformation-basin", name: "Transformation Basin", maturity: "secondary",  grammar: "function families, inverses, complex maps",                               domains: ["polynomials", "rationals", "logarithms", "complex numbers"] },
  { grade: 12, id: "horizon-observatory",  name: "Horizon Observatory",  maturity: "secondary",  grammar: "cycles, vectors, matrices, polar coordinates, limits",                    domains: ["trigonometry", "vectors", "conics", "limits"] },
  { grade: 13, id: "change-summit",        name: "Change Summit",        maturity: "advanced",   grammar: "professional restraint; slope fields and accumulation contours",          domains: ["derivatives", "integrals", "series", "differential equations"] }
];

/** §9 instrument registry — data only. conceptTags stay empty until Phase D maps evidence. */
const INSTRUMENTS = [
  { id: "number-lantern",       name: "Number Lantern",       transferableIdea: "cardinality and sequence" },
  { id: "base-ten-compass",     name: "Base-Ten Compass",     transferableIdea: "place value" },
  { id: "regrouping-bridge",    name: "Regrouping Bridge",    transferableIdea: "exchange across places" },
  { id: "equivalence-lens",     name: "Equivalence Lens",     transferableIdea: "equivalent fractions and expressions" },
  { id: "unit-chain",           name: "Unit Chain",           transferableIdea: "unit conversion" },
  { id: "constraint-compass",   name: "Constraint Compass",   transferableIdea: "geometric conditions" },
  { id: "scale-dial",           name: "Scale Dial",           transferableIdea: "proportional reasoning" },
  { id: "balance-key",          name: "Balance Key",          transferableIdea: "equation equivalence" },
  { id: "covariation-telescope", name: "Covariation Telescope", transferableIdea: "functions as covariation" },
  { id: "cycle-astrolabe",      name: "Cycle Astrolabe",      transferableIdea: "periodicity" },
  { id: "variation-field-glass", name: "Variation Field Glass", transferableIdea: "distributions and variation" },
  { id: "change-altimeter",     name: "Change Altimeter",     transferableIdea: "the derivative as local change" },
  { id: "accumulation-gauge",   name: "Accumulation Gauge",   transferableIdea: "the integral as accumulation" }
];

/**
 * §9 instrument → conceptTag mapping. Deterministic and pattern-based, NOT hand-curated: the
 * corpus has 1,705 distinct step conceptTags and a hand list would rot on the next authored
 * lesson. Each instrument owns a keyword pattern; PRECEDENCE resolves tags that genuinely
 * carry two ideas (unit-rate is proportional reasoning before it is unit conversion;
 * antiderivative is accumulation before it is change), most specific idea first.
 *
 * Patterns are deliberately tight. Loose ones produced real false positives during design —
 * `metric` matched "geoMETRIC" and "paraMETRIC", `mean` matched "MEANing", `variab` matched
 * "isolate-VARIABle" — each of which would have attached a learner's evidence to an
 * instrument they had never used. Word-boundary anchors on hyphens fixed all four.
 *
 * ~255 of 1,705 tags map. That is the intended shape: instruments are thirteen big
 * transferable ideas, not a taxonomy of the whole curriculum. An unmapped tag simply carries
 * no instrument evidence.
 */
const INSTRUMENT_PATTERNS = {
  "number-lantern": /count-sequence|count-on|cardinal|subitiz|one-more|number-order|counting/,
  "base-ten-compass": /place-value|expanded-form|digit-value|(^|-)pv-|hundreds|tens-ones/,
  "regrouping-bridge": /regroup|carry|borrow|(^|-)trade|make-ten|compose-ten|decompose-ten/,
  "equivalence-lens": /equivalent|equiv|simplify|common-denominator|like-terms/,
  "unit-chain": /convert|(^|-)units?(-|$)|measurement-convert|(^|-)mmt-|(^|-)metric(-|$)|customary/,
  "constraint-compass": /congru|constraint|construct|angle-sum|triangle-ineq|similar-|proof/,
  "scale-dial": /ratio|proportion|scale|percent|unit-rate|dilation/,
  "balance-key": /solve-|equation|balance|inverse-op|isolate/,
  "covariation-telescope": /function|slope|linear-|graph-story|input-output|rate-of-change|intercept/,
  "cycle-astrolabe": /trig|sine|cosine|period|radian|unit-circle|angle-rotation/,
  "variation-field-glass": /distribution|spread|deviation|(^|-)mad(-|$)|(^|-)mean(-|$)|median|variabil|sample|histogram|box-plot/,
  "change-altimeter": /derivative|secant|tangent-slope|instantaneous|(^|-)limit-/,
  "accumulation-gauge": /integral|riemann|accumulat|area-under|antideriv/
};
const INSTRUMENT_PRECEDENCE = [
  "accumulation-gauge", "change-altimeter", "cycle-astrolabe", "variation-field-glass",
  "covariation-telescope", "constraint-compass", "scale-dial", "equivalence-lens",
  "balance-key", "unit-chain", "regrouping-bridge", "base-ten-compass", "number-lantern"
];

export function instrumentForTag(tag) {
  for (const id of INSTRUMENT_PRECEDENCE) if (INSTRUMENT_PATTERNS[id].test(tag)) return id;
  return null;
}

// ---- read the curriculum ----
const coursesDir = join(root, "content", "courses");
const courseDirs = readdirSync(coursesDir, { withFileTypes: true }).filter((d) => d.isDirectory());
const courses = [];
const landmarks = [];
const courseTagsById = new Map();
for (const dir of courseDirs) {
  const metaPath = join(coursesDir, dir.name, "course.json");
  if (!existsSync(metaPath)) continue;
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  const region = REGIONS.find((r) => r.grade === meta.gradeLevel);
  if (!region) throw new Error(`${meta.id}: gradeLevel ${meta.gradeLevel} has no region`);
  const landmarkIds = [];
  for (const ch of meta.chapters ?? []) {
    const id = `${meta.id}:${ch.id}`;
    landmarkIds.push(id);
    landmarks.push({ id, courseId: meta.id, chapterId: ch.id, name: ch.title, waypointIds: ch.lessonIds });
  }
  // conceptTags actually used by this course's steps — the evidence instruments derive from
  const courseTags = new Set();
  for (const ch of meta.chapters ?? []) {
    for (const lessonId of ch.lessonIds) {
      const lp = join(coursesDir, dir.name, "lessons", `${lessonId}.json`);
      if (!existsSync(lp)) continue;
      for (const st of JSON.parse(readFileSync(lp, "utf8")).steps ?? []) {
        if (st.conceptTag) courseTags.add(st.conceptTag);
      }
    }
  }
  courseTagsById.set(meta.id, courseTags);
  courses.push({
    courseId: meta.id,
    regionId: region.id,
    trailName: meta.title,
    trailSummary: meta.tagline ?? "",
    prerequisiteCourseIds: [], // filled from PATH_EDGES below
    landmarkIds,
    instrumentIds: [],
    conceptConnections: []
  });
}
courses.sort((a, b) => a.courseId.localeCompare(b.courseId));

// ---- prerequisites from PATH_EDGES (the single existing source of course ordering) ----
const graphSrc = readFileSync(join(root, "src", "lib", "content.server.ts"), "utf8");
const start = graphSrc.indexOf("export const PATH_EDGES");
const end = graphSrc.indexOf("];", start);
const edges = [...graphSrc.slice(start, end).matchAll(/\{ from: "([^"]+)", to: "([^"]+)" \}/g)]
  .map((m) => ({ from: m[1], to: m[2] }));
if (edges.length === 0) throw new Error("PATH_EDGES parsed to zero edges");
const byId = new Map(courses.map((c) => [c.courseId, c]));
for (const { from, to } of edges) {
  const target = byId.get(to);
  if (!target) continue; // verify:world reports dangling edges; generation stays total
  if (byId.has(from) && !target.prerequisiteCourseIds.includes(from)) target.prerequisiteCourseIds.push(from);
}
for (const c of courses) c.prerequisiteCourseIds.sort();

// Attach instrument evidence: each instrument gets the sorted tags it owns; each course gets
// the instruments its own steps can supply evidence for.
const tagsByInstrument = new Map(INSTRUMENTS.map((i) => [i.id, new Set()]));
for (const [courseId, tags] of courseTagsById) {
  const course = byId.get(courseId);
  const owned = new Set();
  for (const t of tags) {
    const inst = instrumentForTag(t);
    if (!inst) continue;
    tagsByInstrument.get(inst).add(t);
    owned.add(inst);
  }
  if (course) course.instrumentIds = [...owned].sort();
}
for (const i of INSTRUMENTS) i.conceptTags = [...tagsByInstrument.get(i.id)].sort();

const manifest = {
  version: 1,
  generatedBy: "scripts/gen-world-manifest.mjs — regenerate, never hand-edit",
  regions: REGIONS.map(({ grade, id, name, maturity, grammar, domains }) => ({
    id,
    gradeBand: grade,
    name,
    description: `${name} — the ${grade === 0 ? "Kindergarten" : grade >= 9 ? ["Algebra 1", "Geometry", "Algebra 2", "Precalculus", "Calculus"][grade - 9] : `Grade ${grade}`} region of the Atlas.`,
    visualMaturity: maturity,
    environmentalGrammar: grammar,
    primaryDomains: domains,
    accessibilityLabel: `${name} region, ${grade === 0 ? "Kindergarten" : grade >= 9 ? ["Algebra 1", "Geometry", "Algebra 2", "Precalculus", "Calculus"][grade - 9] : `Grade ${grade}`}`
  })),
  courses,
  landmarks,
  instruments: INSTRUMENTS,
  connections: []
};

mkdirSync(join(root, "content", "world"), { recursive: true });
writeFileSync(join(root, "content", "world", "world-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`world-manifest: ${INSTRUMENTS.reduce((n, i) => n + i.conceptTags.length, 0)} instrument tags · ${manifest.regions.length} regions · ${courses.length} courses · ${landmarks.length} landmarks · ${INSTRUMENTS.length} instruments · ${edges.length} edges applied`);
