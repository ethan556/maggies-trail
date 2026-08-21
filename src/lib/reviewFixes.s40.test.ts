/**
 * Session-40 review corrections, pinned.
 *
 * 1. fr-02-02 k1's highFeedback once carried text written for an unreachable
 *    MCQ distractor ("6 is way off past 1") and fired for marks 2–5. The fix
 *    carries the original's teaching clause and must make sense at mark 3.
 * 2. fr-02-02 k2 / fr-01-04 ch1 retry feedback must not print the answer —
 *    the original MCQ options never did.
 * 3. pv-03-02's three misdigit diagnoses (71 / 73 / 313), dropped in the
 *    parallel-stream numeric→baseTenCompose conversion, are restored as
 *    reachable composition traps with the v36-verbatim text.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { evaluate } from "@/lib/evaluate";
import { WidgetSpec, type TWidget } from "@/lib/schema";

function lessonWidget(lessonId: string, stepId: string): TWidget {
  const root = join(process.cwd(), "content/courses");
  for (const dir of readdirSync(root)) {
    const p = join(root, dir, "lessons", `${lessonId}.json`);
    if (!existsSync(p)) continue;
    const l = JSON.parse(readFileSync(p, "utf8"));
    const s = l.steps.find((x: { id: string }) => x.id === stepId);
    if (!s?.widget) break;
    return WidgetSpec.parse(s.widget) as TWidget;
  }
  throw new Error(`${lessonId}#${stepId} not found`);
}

describe("fr-02-02 — overshoot feedback is contextually correct", () => {
  const k1 = lessonWidget("fr-02-02", "k1");
  it("mark 3 gets overshoot teaching, not the unreachable 'number 6' text", () => {
    const r = evaluate(k1, 3);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/counts the JUMPS between 0 and 1/);
    expect(r.feedback).not.toMatch(/way off past 1/);
  });
  it("mark 6 still hits the 6/6 = 1 trap ahead of the generic overshoot", () => {
    expect(evaluate(k1, 6).feedback).toMatch(/6\/6, which is 1/);
  });
});

describe("fr-02-02 k2 / fr-01-04 ch1 — retry feedback does not print the answer", () => {
  const k2 = lessonWidget("fr-02-02", "k2");
  it("Nia's fifth-mark trap is the v36 option text, with no first-mark reveal", () => {
    const r = evaluate(k2, 5);
    expect(r.feedback).toBe("Five jumps of a five-cut trip: 5/5 = 1. Nia stood at the finish line, not at 1/5.");
  });
  it("checking at 0 gets the verbatim start diagnosis", () => {
    expect(evaluate(k2, 0).feedback).toBe("0 is the start, before any jumps.");
  });
  const ch1 = lessonWidget("fr-01-04", "ch1");
  it.each([
    [{ whole: 0, num: 6, den: 2, sign: 1 }, /six halves is three cakes/],
    [{ whole: 0, num: 6, den: 6, sign: 1 }, /Sam only took two\.$/]
  ])("trap %o diagnoses without printing 2/6", (entry, re) => {
    const r = evaluate(ch1, entry);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(re);
    expect(r.feedback).not.toMatch(/: 2\/6/);
  });
});

describe("pv-03-02 — restored misdigit traps fire with v36-verbatim diagnoses", () => {
  // k3 was redesigned in session 329 (progression/duplication remediation,
  // s329-PGE-pv-03-02): the ones-overflow "58 + 16" check duplicated k2's
  // template ("# + # = ? build the sum in standard form with rods and
  // cubes."), so k3 now targets a tens-overflow-into-hundreds trade
  // ("93 + 81 = 174") instead — a different transfer demand, not just new
  // numbers in the same shape. Its off-by-one-in-the-remainder trap is the
  // v329-verbatim analogue of the old v36 diagnosis pinned below for k2/ch1.
  it.each([
    ["k2", { hundreds: 0, tens: 7, ones: 1 }, /71 lost a one in the shuffle/],
    ["k3", { hundreds: 1, tens: 6, ones: 4 }, /164 left only 6 tens behind/],
    ["ch1", { hundreds: 3, tens: 1, ones: 3 }, /313 dropped BOTH receipts.*both must be counted/]
  ])("%s build %o", (stepId, build, re) => {
    const w = lessonWidget("pv-03-02", stepId);
    const r = evaluate(w, build);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(re);
  });
});
