// The notebook's contract: derived, never authored; evidence, never a grade.
import { describe, expect, it } from "vitest";
import { buildNotebook, type NotebookIndex } from "./notebook";
import type { Profile } from "./progress";
import type { SkillState } from "./mastery";

const TODAY = "2026-07-16";

const index: NotebookIndex = {
  contentVersion: "test",
  courses: [
    {
      title: "Counting",
      lessons: [
        { id: "a1", title: "Count the Dots", takeaways: ["One number per thing.", "The last number is how many."], tags: ["count-1to1"] },
        { id: "a2", title: "Ten Frames", takeaways: ["Ten makes a full frame."], tags: ["ten-frame"] }
      ]
    },
    {
      title: "Fractions",
      lessons: [{ id: "b1", title: "Equal Parts", takeaways: ["Parts must be equal."], tags: ["frac-equal", "frac-name"] }]
    }
  ]
};

const skill = (over: Partial<SkillState>): SkillState => ({
  tag: "t",
  mastery: 0.8,
  attempts: 3,
  correctStreak: 2,
  lastSeen: TODAY,
  ...over
});

const profile = (lessons: Record<string, boolean>, mastery: Record<string, SkillState> = {}): Profile =>
  ({
    xp: 0,
    activity: { streak: 0, lastActive: null },
    review: [],
    badges: [],
    lessons: Object.fromEntries(Object.entries(lessons).map(([id, c]) => [id, { completed: c, bestXp: 0 }])),
    mastery
  }) as unknown as Profile;

describe("buildNotebook", () => {
  it("only completed lessons become cards; empty courses vanish; order follows the index", () => {
    const sections = buildNotebook(index, profile({ a1: true, a2: false, b1: true }), TODAY);
    expect(sections.map((s) => s.courseTitle)).toEqual(["Counting", "Fractions"]);
    expect(sections[0].cards.map((c) => c.id)).toEqual(["a1"]);
    expect(sections[0].cards[0].takeaways).toHaveLength(2);
  });

  it("retained is the mean over EVIDENCED tags only, and null with no graded evidence", () => {
    const sections = buildNotebook(
      index,
      profile(
        { a1: true, b1: true },
        { "frac-equal": skill({ mastery: 0.9 }), "frac-name": skill({ attempts: 0 }) }
      ),
      TODAY
    );
    const b1 = sections.find((s) => s.courseTitle === "Fractions")!.cards[0];
    expect(b1.retained).toBeCloseTo(0.9, 5); // the attempts-0 tag contributes nothing
    const a1 = sections.find((s) => s.courseTitle === "Counting")!.cards[0];
    expect(a1.retained).toBeNull();
    expect(a1.fading).toBe(false);
  });

  it("fading uses the parent report's rule: proficient when last seen, measurably decayed since", () => {
    const stale = skill({ mastery: 0.85, lastSeen: "2026-05-01" });
    const fresh = skill({ mastery: 0.85, lastSeen: TODAY });
    const withStale = buildNotebook(index, profile({ b1: true }, { "frac-equal": stale }), TODAY);
    expect(withStale[0].cards[0].fading).toBe(true);
    expect(withStale[0].cards[0].retained!).toBeLessThan(0.85);
    const withFresh = buildNotebook(index, profile({ b1: true }, { "frac-equal": fresh }), TODAY);
    expect(withFresh[0].cards[0].fading).toBe(false);
  });

  it("is pure: identical inputs, identical notebook", () => {
    const p = profile({ a1: true }, { "count-1to1": skill({}) });
    expect(buildNotebook(index, p, TODAY)).toEqual(buildNotebook(index, p, TODAY));
  });
});
