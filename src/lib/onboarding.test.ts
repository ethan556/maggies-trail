import { describe, expect, it } from "vitest";
import { G1_TRAILS, G4_TRAILS, Q2_EASY, Q2_HARD, recommend, recommendG4, secondQuestion } from "./onboarding";

describe("onboarding placement", () => {
  it("branches the second question on the first answer", () => {
    expect(secondQuestion(true).id).toBe(Q2_HARD.id);
    expect(secondQuestion(false).id).toBe(Q2_EASY.id);
  });

  it("routes shaky placements to the trailhead", () => {
    expect(recommend(1, 3).lessonId).toBe("mult-01-01"); // low comfort overrides score
    expect(recommend(3, 1).lessonId).toBe("mult-01-01");
    expect(recommend(2, 0).lessonId).toBe("mult-01-01");
  });

  it("soft-skips two-correct placements to Meet Division", () => {
    expect(recommend(2, 2).lessonId).toBe("mult-02-01");
    expect(recommend(3, 2).lessonId).toBe("mult-02-01");
  });

  it("routes perfect scores by comfort", () => {
    expect(recommend(3, 3)).toMatchObject({ lessonId: "pv-01-01", courseSlug: "place-value" });
    expect(recommend(2, 3).lessonId).toBe("mult-03-01");
  });

  it("every recommended lesson id exists in authored content ranges", () => {
    for (const rec of [recommend(1, 0), recommend(2, 2), recommend(3, 3), recommend(2, 3)]) {
      expect(rec.lessonId).toMatch(/^(mult|pv)-\d{2}-\d{2}$/);
    }
  });
});

describe("grade-4 trail pick (P9 — no calibrated adaptive quiz yet, direct choice instead)", () => {
  it("lists at least the two live G4 courses", () => {
    expect(G4_TRAILS.length).toBeGreaterThanOrEqual(2);
    expect(G4_TRAILS.map((t) => t.id)).toEqual(
      expect.arrayContaining(["multiply-bigger", "place-value-million"])
    );
  });

  it("recommends the correct first lesson for each trail", () => {
    expect(recommendG4("multiply-bigger")).toMatchObject({
      lessonId: "mb-01-01",
      courseSlug: "multiply-bigger"
    });
    expect(recommendG4("place-value-million")).toMatchObject({
      lessonId: "pv2-01-01",
      courseSlug: "place-value-million"
    });
  });

  it("falls back to the first (foundational G1) trail on an unrecognized id", () => {
    expect(recommendG4("nonexistent")).toMatchObject({ lessonId: G1_TRAILS[0].lessonId });
  });
});
