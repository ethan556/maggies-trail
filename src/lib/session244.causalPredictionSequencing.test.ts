import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Step = {
  id: string;
  kind: string;
  widget?: { type?: string; [key: string]: unknown };
  predict?: {
    options: Array<{ id: string; label: string }>;
    outcomeId: string;
    reveal: string;
  };
};

type Lesson = { id: string; steps: Step[] };

const root = process.cwd();

function lesson(course: string, id: string): Lesson {
  return JSON.parse(
    readFileSync(join(root, "content", "courses", course, "lessons", `${id}.json`), "utf8")
  ) as Lesson;
}

const migrated = [
  ["area-surface-volume", "asv-05-01", "i1", "i2", "volumeBuilder"],
  ["fractions", "fr-04-01", "i1", "i2", "tapDiagram"],
  ["multiplication-division", "mult-02-03", "i1", "i2", "slider"],
  ["multiplication-division", "mult-03-04", "i1", "i2", "tapDiagram"],
  ["multiplication-division", "mult-04-05", "i1", "i2", "estimateSlider"],
  ["exponents-polynomials", "ep-01-03", "i1", "i3", "placeValueTransformLab"],
  ["fractions-add", "fa-05-01", "i1", "k3", "mixedRegroup"],
  ["place-value-million", "pv2-04-03", "i1", "i2b", "columnCalc"],
  ["quadratics", "qu-02-02", "i1", "i3", "quadraticExplore"],
  ["quadratics", "qu-03-01", "i1", "i3", "quadraticExplore"],
  ["geometry-foundations", "gf-02-02", "i1", "i3", "angleMeasure"],
  ["geometry-foundations", "gf-03-03", "i1", "i3", "rotationLab"],
  ["geometry-foundations", "gf-04-03", "i1", "i3", "rotationLab"],
  ["geometry-foundations", "gf-05-01", "i1", "i3", "transformExplore"]
] as const;

const thinned = [
  ["right-triangles-trig", "rt-01-04", "i2", "i1", "triangleSolve"],
  ["number-system", "ns-01-01", "i2", "i1", "numberLineHop"],
  ["decimal-operations", "dop-02-02", "i1", "k3", "columnCalc"],
  ["triangle-congruence", "tc-02-01", "i1", "i3", "triangleConstraintLab"]
] as const;

const k2Direct = [
  ["add-subtract-20", "as-04-01", "i1", "numberLineHop"],
  ["add-subtract-20", "as-04-02", "i1", "balanceScale"],
  ["counting-120", "c120-01-03", "i1", "numberLineHop"],
  ["counting-120", "c120-02-01", "i1", "numberLineHop"],
  ["counting-120", "c120-02-02", "i1", "numberLinePlace"],
  ["counting-120", "c120-05-02", "i1", "numberLineHop"],
  ["counting-120", "c120-05-03", "i1", "numberLineHop"],
  ["tens-and-ones", "tno-04-01", "i1a", "numberLinePlace"],
  ["tens-and-ones", "tno-04-02", "i1a", "numberLinePlace"],
  ["tens-and-ones", "tno-04-03", "i1a", "numberLinePlace"],
  ["add-subtract-100", "as100-04-01", "i1", "numberLineHop"],
  ["add-subtract-100", "as100-04-02", "i1", "columnCalc"],
  ["add-subtract-100", "as100-04-03", "i1", "numberLineHop"],
  ["add-subtract-100", "as100-05-02", "i1", "oddEvenPairs"],
  ["place-value-1000", "pv1000-03-02", "i1a", "placeValueTransformLab"],
  ["place-value-1000", "pv1000-03-03", "i2a", "placeValueTransformLab"]
] as const;

const k2HopLandings = [
  ["add-subtract-20", "as-04-01", "i1", 4],
  ["counting-120", "c120-01-03", "i1", 30],
  ["counting-120", "c120-02-01", "i1", 30],
  ["counting-120", "c120-05-02", "i1", 55],
  ["counting-120", "c120-05-03", "i1", 44],
  ["add-subtract-100", "as100-04-01", "i1", 42],
  ["add-subtract-100", "as100-04-03", "i1", 25]
] as const;

const k2Placements = [
  ["counting-120", "c120-02-02", "i1", 41, 47],
  ["tens-and-ones", "tno-04-01", "i1a", 45, 52],
  ["tens-and-ones", "tno-04-02", "i1a", 63, 67],
  ["tens-and-ones", "tno-04-03", "i1a", 48, 52]
] as const;

describe("S244 causal-prediction sequencing canary", () => {
  it.each(migrated)(
    "%s/%s moves the prediction from %s onto %s (%s)",
    (course, id, oldStepId, causalStepId, widgetType) => {
      const steps = lesson(course, id).steps;
      const oldStep = steps.find((step) => step.id === oldStepId);
      const causalStep = steps.find((step) => step.id === causalStepId);

      expect(oldStep?.predict).toBeUndefined();
      expect(causalStep?.kind).toBe("interactive");
      expect(causalStep?.widget?.type).toBe(widgetType);
      expect(causalStep?.predict).toBeDefined();
      expect(causalStep?.predict?.options.map((option) => option.id)).toContain(
        causalStep?.predict?.outcomeId
      );
      expect(causalStep?.predict?.reveal.length).toBeGreaterThanOrEqual(25);
    }
  );

  it.each(thinned)(
    "%s/%s removes redundant prediction %s and keeps causal host %s (%s)",
    (course, id, removedStepId, causalStepId, widgetType) => {
      const steps = lesson(course, id).steps;
      const removedStep = steps.find((step) => step.id === removedStepId);
      const causalStep = steps.find((step) => step.id === causalStepId);

      expect(removedStep?.predict).toBeUndefined();
      expect(causalStep?.kind).toBe("interactive");
      expect(causalStep?.widget?.type).toBe(widgetType);
      expect(causalStep?.predict).toBeDefined();
      expect(steps.filter((step) => step.predict)).toHaveLength(1);
    }
  );

  it("hosts every remaining canary prediction on a manipulation-capable engine", () => {
    const capabilities = JSON.parse(
      readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8")
    ) as { types: Record<string, { manip?: number }> };

    for (const [course, id] of [...migrated, ...thinned]) {
      for (const step of lesson(course, id).steps.filter((candidate) => candidate.predict)) {
        const type = step.widget?.type ?? "";
        expect(capabilities.types[type]?.manip, `${id}/${step.id} uses ${type}`).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe("S244 K–2 causal-prediction family", () => {
  it.each(k2Direct)(
    "%s/%s binds its only prediction to %s (%s)",
    (course, id, stepId, widgetType) => {
      const steps = lesson(course, id).steps;
      const host = steps.find((step) => step.id === stepId);
      const predictions = steps.filter((step) => step.predict);

      expect(host?.kind).toBe("interactive");
      expect(host?.widget?.type).toBe(widgetType);
      expect(host?.predict).toBeDefined();
      expect(predictions).toHaveLength(1);
      expect(host?.predict?.options.map((option) => option.id)).toContain(host?.predict?.outcomeId);
      expect(new Set(host?.predict?.options.map((option) => option.id)).size).toBe(
        host?.predict?.options.length
      );
    }
  );

  it("uses a direct-manipulation engine for every K–2 prediction", () => {
    const capabilities = JSON.parse(
      readFileSync(join(root, "scripts", "engine-capabilities.json"), "utf8")
    ) as { types: Record<string, { manip?: number }> };

    for (const [course, id, stepId] of k2Direct) {
      const host = lesson(course, id).steps.find((step) => step.id === stepId);
      const type = host?.widget?.type ?? "";
      expect(capabilities.types[type]?.manip, `${id}/${stepId} uses ${type}`).toBeGreaterThanOrEqual(2);
    }
  });

  it.each(k2HopLandings)(
    "%s/%s#%s makes the authored hop land on %s",
    (course, id, stepId, expectedLanding) => {
      const widget = lesson(course, id).steps.find((step) => step.id === stepId)?.widget;
      const start = Number(widget?.start);
      const hop = Number(widget?.hop);
      const hops = Number(widget?.hops);
      const sign = widget?.direction === "back" ? -1 : 1;

      expect(start + sign * hop * hops).toBe(expectedLanding);
    }
  );

  it.each(k2Placements)(
    "%s/%s#%s moves from %s to the compared target %s",
    (course, id, stepId, start, target) => {
      const widget = lesson(course, id).steps.find((step) => step.id === stepId)?.widget;
      expect(widget?.start).toBe(start);
      expect(widget?.target).toBe(target);
      expect(Number(widget?.min)).toBeLessThanOrEqual(Math.min(start, target));
      expect(Number(widget?.max)).toBeGreaterThanOrEqual(Math.max(start, target));
    }
  );

  it("keeps the equal-sign prediction on a scale that balances at x = 2", () => {
    const widget = lesson("add-subtract-20", "as-04-02").steps.find((step) => step.id === "i1")?.widget;
    expect(Number(widget?.a) * 2 + Number(widget?.b)).toBe(Number(widget?.c));
  });

  it("makes the regrouping prediction drive the exact 52 − 27 column state", () => {
    const widget = lesson("add-subtract-100", "as100-04-02").steps.find(
      (step) => step.id === "i1"
    )?.widget;
    expect(widget).toMatchObject({ type: "columnCalc", op: "subtract", a: 52, b: 27 });
  });

  it("makes the parity prediction inspect all fourteen counters as pairs", () => {
    const widget = lesson("add-subtract-100", "as100-05-02").steps.find(
      (step) => step.id === "i1"
    )?.widget;
    expect(widget).toMatchObject({ type: "oddEvenPairs", n: 14, mode: "pair", answer: "even" });
  });

  it.each([
    ["pv1000-03-02", "i1a", [275, 312]],
    ["pv1000-03-03", "i2a", [267, 627]]
  ] as const)("%s#%s opens the hundreds place for %j", (id, stepId, values) => {
    const widget = lesson("place-value-1000", id).steps.find((step) => step.id === stepId)?.widget;
    expect(widget).toMatchObject({
      type: "placeValueTransformLab",
      task: "decidingPlace",
      values: [...values],
      requiredExplorations: 1
    });
    expect(widget?.choices).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "hundreds", claim: "place:2" })])
    );
  });
});
