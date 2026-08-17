import { describe, expect, it } from "vitest";
import { groupsFor, type LearnerTier } from "./intervention";

function tier(
  learnerId: string,
  name: string,
  avatarId: string | undefined
): LearnerTier {
  return {
    learnerId,
    name,
    ...(avatarId ? { avatarId } : {}),
    tier: 2,
    reasons: [{ code: "low-proficiency", detail: "Shared skill needs practice." }],
    attempted: 5,
    proficient: 2,
    fading: 0,
    activeDays14: 4,
    focusTags: ["fraction-equivalence"]
  };
}

describe("intervention group learner identity", () => {
  it("carries chosen avatar ids into the teacher's shared-need roster without inventing one", () => {
    const groups = groupsFor([
      tier("learner-a", "Ada", "avatar-201"),
      tier("learner-b", "Ben", undefined)
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].members).toEqual([
      { learnerId: "learner-a", name: "Ada", avatarId: "avatar-201", tier: 2 },
      { learnerId: "learner-b", name: "Ben", tier: 2 }
    ]);
  });
});
