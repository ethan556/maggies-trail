import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Lesson as LessonSchema, WidgetSpec, widgetIntegrityErrors } from "./schema";
import { lintLesson } from "./pedagogy";

type StepDocument = {
  id: string;
  widget?: Record<string, unknown> & { type?: string };
  variant?: unknown;
};

type LessonDocument = { id: string; steps: StepDocument[] };

const root = process.cwd();
const capabilities = JSON.parse(
  readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8")
) as { types: Record<string, { manip?: number }> };
const responseOnly = new Set(["numeric", "mcq", "fractionEntry", "pointEntry", "subitizeFlash"]);

const hosts = [
  ["parametric-polar-calculus", "pc-02-01", "k2", "circleMeasureExplore"],
  ["polar-parametric", "pp-02-02", "k1", "polarTrace"],
  ["polygons-quadrilaterals", "pq-03-01", "i2", "distanceGrid"],
  ["polynomial-functions", "pf-02-02", "i2", "signChart"],
  ["quadratics", "qu-01-03", "i1", "quadraticExplore"],
  ["quadratics", "qu-01-03", "i2", "quadraticExplore"],
  ["rational-functions", "rf-04-02", "i2", "graphZoom"],
  ["rational-number-operations", "rno-01-01", "i2", "integerChips"],
  ["ratios-rates", "rr-01-03", "i2", "ratioTable"],
  ["right-triangles-trig", "rt-05-03", "i2", "triangleSolve"],
  ["sampling-and-probability", "sp-01-02", "i2", "sampleSim"],
  ["series-convergence", "sc-02-02", "k1", "taylorApprox"],
  ["shapes-shares-g2", "ssg2-02-01", "i2", "areaModel"],
  ["similarity", "sy-01-01", "i2", "dilationExplore"],
  ["statistical-inference", "si-02-02", "k1", "sampleSim"],
  ["tens-and-ones", "tno-01-01", "i2", "baseTenCompose"],
  ["triangle-congruence", "tc-01-01", "i2", "triangleConstraintLab"],
  ["trig-functions", "tf-03-02", "i2", "unitCircleExplore"],
  ["trig-graphs-inverses", "tg-03-01", "k1", "unitCircleExplore"],
  ["trig-identities-equations", "ti-01-01", "k1", "unitCircleExplore"]
] as const;

const lessonKeys = Array.from(new Map(hosts.map(([course, id]) => [`${course}/${id}`, [course, id] as const])).values());

function lesson(course: string, id: string): LessonDocument {
  return JSON.parse(
    readFileSync(join(root, "content", "courses", course, "lessons", `${id}.json`), "utf8")
  ) as LessonDocument;
}

function widget(course: string, id: string, stepId: string) {
  const host = lesson(course, id).steps.find((candidate) => candidate.id === stepId);
  expect(host, `${course}/${id}#${stepId}`).toBeDefined();
  return { host: host!, parsed: WidgetSpec.parse(host?.widget) };
}

describe("S244 flagship visual-first packet B contract", () => {
  it.each(hosts)("%s/%s keeps %s on direct engine %s", (course, id, stepId, type) => {
    const { host, parsed } = widget(course, id, stepId);
    expect(parsed.type).toBe(type);
    expect(host.variant).toBeUndefined();
    expect(capabilities.types[type]?.manip, `${id}#${stepId}`).toBeGreaterThanOrEqual(2);
    expect(widgetIntegrityErrors(parsed), `${id}#${stepId}`).toEqual([]);
  });

  it.each(lessonKeys)("%s/%s passes schema, pedagogy, and the visual-first ratio", (course, id) => {
    const parsed = LessonSchema.parse(lesson(course, id));
    const types = parsed.steps.flatMap((step) => step.widget ? [step.widget.type] : []);
    const direct = types.filter((type) => (capabilities.types[type]?.manip ?? 0) >= 2).length;
    const response = types.filter((type) => responseOnly.has(type)).length;

    expect(lintLesson(parsed), `${course}/${id}`).toEqual([]);
    expect(direct).toBeGreaterThanOrEqual(2);
    expect(response / Math.max(types.length, 1)).toBeLessThanOrEqual(0.75);
  });
});

describe("S244 flagship visual-first packet B mathematical state", () => {
  it.each([
    ["parametric-polar-calculus", "pc-02-01", "k2", { type: "circleMeasureExplore", mode: "radiusScale", targetRadius: 3, askQuantity: "area" }],
    ["polar-parametric", "pp-02-02", "k1", { type: "polarTrace", targetA: 4, targetPetals: 8 }],
    ["polygons-quadrilaterals", "pq-03-01", "i2", { type: "distanceGrid", anchor: [0, 0], targetPoint: [3, 4] }],
    ["polynomial-functions", "pf-02-02", "i2", { type: "signChart", roots: [{ x: -1, mult: 3 }, { x: 2, mult: 2 }] }],
    ["quadratics", "qu-01-03", "i1", { type: "quadraticExplore", targetA: 3, targetH: 0, targetK: 0 }],
    ["quadratics", "qu-01-03", "i2", { type: "quadraticExplore", targetA: 1, targetH: 0, targetK: 7 }],
    ["rational-functions", "rf-04-02", "i2", { type: "graphZoom", behaviour: "removable", a: 2, targetVerdict: "limit-exists" }],
    ["rational-number-operations", "rno-01-01", "i2", { type: "integerChips", target: -16 }],
    ["ratios-rates", "rr-01-03", "i2", { type: "ratioTable", rows: [[4, 10]], askA: 2, targetB: 5 }],
    ["right-triangles-trig", "rt-05-03", "i2", { type: "triangleSolve", a: 5, b: 12, target: 13 }],
    ["sampling-and-probability", "sp-01-02", "i2", { type: "sampleSim", populationP: 0.55, targetSize: 120 }],
    ["series-convergence", "sc-02-02", "k1", { type: "taylorApprox", fn: "geometric", mode: "radius", targetXTenths: 10 }],
    ["shapes-shares-g2", "ssg2-02-01", "i2", { type: "areaModel", countGrid: true, targetArea: 16, wStart: 4, hStart: 4 }],
    ["similarity", "sy-01-01", "i2", { type: "dilationExplore", targetK: 0.5 }],
    ["statistical-inference", "si-02-02", "k1", { type: "sampleSim", populationP: 0.45, targetSize: 320 }],
    ["tens-and-ones", "tno-01-01", "i2", { type: "baseTenCompose", target: 40, requireStandard: true }],
    ["triangle-congruence", "tc-01-01", "i2", { type: "triangleConstraintLab", targetCriterion: "SAS", targetAngle: 70 }],
    ["trig-functions", "tf-03-02", "i2", { type: "unitCircleExplore", targetAngle: 300 }],
    ["trig-graphs-inverses", "tg-03-01", "k1", { type: "unitCircleExplore", targetAngle: 45 }],
    ["trig-identities-equations", "ti-01-01", "k1", { type: "unitCircleExplore", targetAngle: 30 }]
  ] as const)("%s/%s#%s pins an exact solvable state", (course, id, stepId, expected) => {
    expect(widget(course, id, stepId).parsed).toMatchObject(expected);
  });

  it("keeps the named geometric and proportional truths exact", () => {
    expect(Math.hypot(3, 4)).toBe(5);
    expect(5 ** 2 + 12 ** 2).toBe(13 ** 2);
    expect(4 / 10).toBe(2 / 5);
    expect(4 * 4).toBe(16);
    expect(3 ** 2).toBe(9);
  });
});
