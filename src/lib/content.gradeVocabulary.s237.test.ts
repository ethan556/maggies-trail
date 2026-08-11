import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * S237 — K–4 LEARNER SURFACES DO NOT USE ARGUMENTATION VOCABULARY.
 *
 * Reported from the app: a grade-3 fractions step read "Repair Rio's reasoning… Rio says 2/4 is
 * MORE than 1/2 'because two pieces beat one piece.' What's the repair?" A third grader has to
 * decode the question before they can start the mathematics.
 *
 * It was not one lesson. 60 learner-facing surfaces across 28 K–4 lessons used `equivalence` (17),
 * `the claim` (13), `verdict` (12), `repair` (9), `invariant` (4), `reasoning` (3) — and 32 of the
 * 60 were in FEEDBACK, which a learner reads at the moment they are least able to parse it.
 *
 * WHAT THIS GATE IS AND IS NOT. It is a floor on vocabulary in graded bands K–4 only; the same
 * words are correct and wanted in high-school courses, so the band is read from the course's
 * gradeLevel rather than assumed. It checks only fields a learner reads or hears — including
 * `narration`, because the spoken channel drifting from the visible one is its own defect. It does
 * not check authoring metadata (`kernel`, `actionGoal`, and similar), where this vocabulary is
 * exactly right: 2,725 such matches exist and are all correct.
 *
 * The banned list is deliberately narrow — words whose everyday meaning does not help a child
 * infer the mathematical one. "Bigger", "share", "match" are fine. "Verdict" is not.
 */

const LEARNER_FIELDS = new Set([
  "prompt", "body", "title", "label", "feedback", "successFeedback", "missFeedback",
  "explanationVariants", "narration", "hint",
]);

/** Terms a K–4 learner should never have to decode. Replacements used in S237 are in the commit. */
const BANNED = /\b(the claim|verdict|equivalence|invariant|conjecture|premise|restate|residue|discriminant|counterexample|the case for)\b/i;

type Finding = { lesson: string; grade: number; field: string; term: string; text: string };

const gradeOf = new Map<string, number>();
for (const dir of readdirSync("content/courses", { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  try {
    const course = JSON.parse(readFileSync(join("content/courses", dir.name, "course.json"), "utf8"));
    if (typeof course.gradeLevel === "number") gradeOf.set(dir.name, course.gradeLevel);
  } catch { /* a course without a numeric band is out of scope */ }
}

function scan(): { findings: Finding[]; lessonsChecked: number } {
  const findings: Finding[] = [];
  let lessonsChecked = 0;
  for (const [course, grade] of gradeOf) {
    if (grade > 4) continue;
    const dir = join("content/courses", course, "lessons");
    let entries: string[];
    try { entries = readdirSync(dir); } catch { continue; }
    for (const name of entries) {
      if (!name.endsWith(".json")) continue;
      let lesson: Record<string, unknown>;
      try { lesson = JSON.parse(readFileSync(join(dir, name), "utf8")); } catch { continue; }
      lessonsChecked++;
      const id = typeof lesson.id === "string" ? lesson.id : name;
      (function walk(node: unknown) {
        if (Array.isArray(node)) { node.forEach(walk); return; }
        if (!node || typeof node !== "object") return;
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
          if (LEARNER_FIELDS.has(key)) {
            for (const text of Array.isArray(value) ? value : [value]) {
              if (typeof text !== "string") continue;
              const hit = BANNED.exec(text);
              if (hit) findings.push({ lesson: id, grade, field: key, term: hit[0], text: text.slice(0, 120) });
            }
          } else walk(value);
        }
      })(lesson);
    }
  }
  return { findings, lessonsChecked };
}

describe("S237 K-4 learner vocabulary", () => {
  const { findings, lessonsChecked } = scan();

  it("actually reached the K-4 corpus", () => {
    // Guards against a path change silently making this gate vacuous.
    expect([...gradeOf.values()].filter((g) => g <= 4).length).toBeGreaterThan(40);
    expect(lessonsChecked).toBeGreaterThan(300);
  });

  it("SELF-CHECK: the detector fires on the reported string", () => {
    expect(BANNED.test("Rio says 2/4 is MORE than 1/2. What's the verdict?")).toBe(true);
    expect(BANNED.test("That's the whole idea of equivalence.")).toBe(true);
    // …and not on ordinary mathematical English, which must stay allowed.
    expect(BANNED.test("Which bar shows more? Share the pizza fairly.")).toBe(false);
  });

  it("no K-4 learner-facing surface uses argumentation vocabulary", () => {
    const shown = findings.slice(0, 12).map((f) => `${f.lesson} g${f.grade} [${f.field}] ${f.term}: ${f.text}`);
    expect(shown).toEqual([]);
  });
});
