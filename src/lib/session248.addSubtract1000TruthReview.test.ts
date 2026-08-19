import { describe, expect, it } from "vitest";
import mentalTen from "../../content/courses/add-subtract-1000-g2/lessons/g2b-02-05.json";
import methodChoice from "../../content/courses/add-subtract-1000-g2/lessons/g2b-03-05.json";

describe("S248 independent add/subtract within 1000 corrections", () => {
  it("qualifies the ten-more rule at hundred boundaries", () => {
    const concept = mentalTen.steps.find((step) => step.id === "c1");
    expect(concept?.body).toContain("Ones stay the same");
    expect(concept?.body).toContain("Hundreds change only across a hundred");
    expect(concept?.narration).toBe(concept?.body);
    expect(concept?.body.length).toBeLessThanOrEqual(110);
  });

  it("uses the final challenge for trade reasoning, not a repeated method choice", () => {
    const firstCheck = methodChoice.steps.find((step) => step.id === "k1");
    const challenge = methodChoice.steps.find((step) => step.id === "ch1");
    const firstOptions = (firstCheck?.widget as { options?: Array<{ label:string; correct?:boolean }> } | undefined)?.options ?? [];
    const challengeOptions = (challenge?.widget as { options?: Array<{ label:string; correct?:boolean }> } | undefined)?.options ?? [];
    expect(firstCheck?.widget?.prompt).toContain("Which method fits");
    expect(challenge?.widget?.prompt).toContain("what must happen before subtracting the ones");
    expect(challengeOptions.find((option) => option.correct)?.label).toBe("Trade a hundred, then a ten");
    expect(challengeOptions.map((option) => option.label)).not.toEqual(firstOptions.map((option) => option.label));
  });
});
