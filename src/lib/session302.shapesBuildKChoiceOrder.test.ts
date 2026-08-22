import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { Lesson, WidgetSpec } from "./schema";

const directory = join(process.cwd(), "content", "courses", "shapes-build-k", "lessons");
const lessons = readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .map((file) => Lesson.parse(JSON.parse(readFileSync(join(directory, file), "utf8"))));

// Options hashes below re-pinned per reports/closure/S327_FIX_CH1.md ("S327 Fix Packet CH1 —
// CHOICE_SURFACE_INTEGRITY"): each step's correct-option label was a length/prose outlier vs its
// distractors (mcq-leakage.mts LENGTH tell); fixed by trimming self-explaining clauses into
// `feedback` and/or lengthening distractors with genuine misconception detail. Correct answer,
// prompt, and figure are byte-identical to before; independently re-verified clean against the
// live mcq-leakage.mts LENGTH/QUALIFIER/ABSOLUTES/GRAMMAR/ODD-ONE-OUT rules for all 9 rows.
const contracts = [
  ["kgb-01-01", "k2", null, "39ca948e58c9dba384cbbd34f3798095797dab8ae9e9cc0a27d06429bf4f25d1", "54c0eed5d9b06b968fce24a83363bbb015109fe76545c7c5c3b3e7461cf93766"],
  ["kgb-01-02", "ch1", null, "07c2b97a793ede319a780b7c2fc33e4c639af28fbe89abcb790649e1638e8341", "072aa72e5ed063d41baea05593308f1bf93e8c246be82823513cf5a6340f30c9"],
  ["kgb-01-04", "k2", null, "4dfcfa5151f8654c8c49544405278c36ab468aaea91d734296ae417f878d9a6e", "8bbb2ae17ee54ad035b0fe57af65831dc66886d996d1872e0ccd10843c22bbce"],
  ["kgb-02-04", "k2", null, "b2b2cb9e5aae9b372dcfe0a2f4102affe14752dcefbd32d9705cdba5dbc7d450", "631d0eefec847ddc14eb7dd8783ad948b2a86983d96c7a50a2f9849a22a487e4"],
  ["kgb-02-05", "k1", null, "a4d95a1d296839e6a2061957b0a911225427e078c5219e85e6aae5c8951b4145", "6c6afe0bd26822837d2133a0ebc90af3dad2f32975e6c52b2925b039e0492e6d"],
  ["kgb-02-05", "k2", null, "49054e2f5aa5d21efd8c50f583a56a42827be31cd454d4d01b34403b301246cd", "69b34fb02f13d081c549bdfdbb2e55a898f3c94537451ae2edf6e662ad3e1c38"],
  ["kgb-03-01", "k1", null, "374455aff44b718e4fba4a0a024152e7583e32d34fed6fa0ee3ff2a2a09c3529", "b32209917ef71b010d6c3a7d2e2612162f18455b384241646cadde5750823549"],
  ["kgb-03-01", "k2", null, "cbb6cfff71118c3e564c78811ae235b78e797de81bc59a3f4bd599af4a7b420a", "8fe1092e6398ea505448a05a75880ba19c61323b673085b387e7fbd8dcfde9c5"],
  ["kgb-03-02", "k1", null, "792ee2d11e47a6dd196f11bd0780efeb59bfd688ac9bbdc42dfa4d4c1a960ce3", "4c9759b5376a37a6109343e688302380ddc2f67485d862fd6c3be8e102e74ded"],
] as const;

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

describe("S302 Shapes Build Kindergarten choice-order repair", () => {
  it("distributes correct choices while retaining prompt, option, evaluator, and figure contracts", () => {
    expect(contracts).toHaveLength(9);
    const correctIndices = contracts.map(([lessonId, stepId, figure, promptHash, optionsHash], index) => {
      const lesson = lessons.find((candidate) => candidate.id === lessonId);
      const step = lesson?.steps.find((candidate) => candidate.id === stepId);
      const widget = WidgetSpec.parse(step?.widget);
      expect(widget.type, `${lessonId}/${stepId}`).toBe("mcq");
      if (widget.type !== "mcq") throw new Error("Expected MCQ");
      expect(step?.figure ?? null, `${lessonId}/${stepId} figure`).toBe(figure);
      expect(hash(widget.prompt), `${lessonId}/${stepId} prompt`).toBe(promptHash);
      expect(hash(JSON.stringify(widget.options.map(({ id, label, correct, feedback }) => ({ id, label, correct, feedback })).sort((left, right) => left.id.localeCompare(right.id)))), `${lessonId}/${stepId} options`).toBe(optionsHash);
      expect(widget.options.map((option) => option.id).sort(), `${lessonId}/${stepId} IDs`).toEqual(["o0", "o1", "o2", "o3"]);
      expect(widget.options.filter((option) => option.correct).map((option) => option.id), `${lessonId}/${stepId} correct ID`).toEqual(["o0"]);
      for (const option of widget.options)
        expect(evaluate(widget, option.id).correct, `${lessonId}/${stepId}/${option.id}`).toBe(option.correct);
      const correctIndex = widget.options.findIndex((option) => option.correct);
      expect(correctIndex, `${lessonId}/${stepId}`).toBe(index % 3 + 1);
      return correctIndex;
    });

    expect(correctIndices.filter((index) => index === 1)).toHaveLength(3);
    expect(correctIndices.filter((index) => index === 2)).toHaveLength(3);
    expect(correctIndices.filter((index) => index === 3)).toHaveLength(3);
  });

  it("keeps every targeted Shapes Build item schema-valid", () => {
    expect(lessons).toHaveLength(14);
    for (const [lessonId, stepId] of contracts) {
      const step = lessons.find((lesson) => lesson.id === lessonId)?.steps.find((candidate) => candidate.id === stepId);
      expect(step?.widget?.type, `${lessonId}/${stepId}`).toBe("mcq");
    }
  });
});
