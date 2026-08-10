/* Find plain `numeric` HS steps that an exactNumberLab TASK can serve exactly.
 *
 * WHY THIS IS SAFE. exactNumberLab derives BOTH its derivation stages and its answer from
 * (task, values) — nothing is authored prose. So a conversion invents no content: the authored
 * prompt, answer, hints and feedback all stay, and the engine supplies the manipulable derivation.
 *
 * THE GATE. A candidate is accepted only when the engine's DERIVED answer equals the step's FROZEN
 * authored answer. That is the same discipline the campaign has used throughout: the frozen number
 * confirms the parse. A regex that mis-reads a prompt will produce a different number and be
 * dropped, so a false positive would require a wrong parse that coincidentally lands on the right
 * answer — possible in principle, which is why every accepted candidate is still read by hand
 * before it is written.
 *
 * This script PROPOSES. It never writes. Adjudication stays human.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { exactNumberTruth } from "../../src/lib/schema";

type Step = { id: string; widget?: Record<string, unknown> };
type Lesson = { id?: string; title?: string; steps?: Step[] };
type Candidate = {
  course: string; lesson: string; step: string; task: string;
  prompt: string; frozen: number; derived: number; extra: Record<string, unknown>;
};

const norm = (s: string) => s.replace(/[−–—]/g, "-").replace(/\s+/g, " ").trim();
const sup: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
const unsup = (s: string) => s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => `^${sup[c]}`);

/** Each proposer returns the extra spec fields for its task, or null. */
const PROPOSERS: Array<{ task: string; propose: (p: string) => Record<string, unknown> | null }> = [
  {
    // "log_b(x)" / "log base b of x" — the engine derives the exponent chain.
    task: "logarithmEvaluate",
    propose: (p) => {
      const m = norm(p).match(/log[_ ]?(?:base )?(\d+)\s*\(?\s*(\d+(?:\.\d+)?)\s*\)?/i);
      if (!m) return null;
      return { logBase: Number(m[1]), logArgument: Number(m[2]) };
    },
  },
  {
    // "b^e" with an integer base and exponent.
    task: "powerEvaluate",
    propose: (p) => {
      const m = unsup(norm(p)).match(/(-?\d+)\s*\^\s*\(?(-?\d+)\)?/);
      if (!m) return null;
      return { powerBase: Number(m[1]), powerExponent: Number(m[2]) };
    },
  },
  {
    // "f(x) = ax^2 + bx + c ... at x = k"  (also covers linear when a is absent)
    task: "polynomialEvaluate",
    propose: (p) => {
      const s = unsup(norm(p));
      const at = s.match(/(?:at|when|for)\s+x\s*=\s*(-?\d+(?:\.\d+)?)/i) ?? s.match(/x\s*(?:→|->)\s*(-?\d+(?:\.\d+)?)/);
      if (!at) return null;
      const a = s.match(/(-?\d*)\s*x\s*\^\s*2/);
      const b = s.match(/(?<!\^)(-?\d*)\s*x(?!\s*\^)/);
      const c = s.match(/[+-]\s*(\d+)\s*(?:$|[,.)])/);
      if (!a && !b) return null;
      const coef = (m: RegExpMatchArray | null) => {
        if (!m) return 0;
        const raw = m[1];
        if (raw === "" || raw === "+") return 1;
        if (raw === "-") return -1;
        return Number(raw);
      };
      const cs = [coef(a), coef(b), c ? Number(norm(s).includes(`- ${c[1]}`) ? -c[1] : c[1]) : 0];
      if (cs.every((n) => n === 0)) return null;
      return { polyCoefficients: cs, polyAt: Number(at[1]) };
    },
  },
];

const HS = (g: number) => g >= 9;
const out: Candidate[] = [];
const root = "content/courses";
for (const course of readdirSync(root)) {
  const cj = join(root, course, "course.json");
  const ld = join(root, course, "lessons");
  if (!existsSync(cj) || !existsSync(ld)) continue;
  if (!HS(JSON.parse(readFileSync(cj, "utf8")).gradeLevel)) continue;
  for (const file of readdirSync(ld)) {
    if (!file.endsWith(".json")) continue;
    const lesson = JSON.parse(readFileSync(join(ld, file), "utf8")) as Lesson;
    for (const step of lesson.steps ?? []) {
      const w = step.widget;
      if (!w || w.type !== "numeric") continue;
      const frozen = w.answer;
      const prompt = String(w.prompt ?? "");
      if (typeof frozen !== "number" || !prompt) continue;
      for (const { task, propose } of PROPOSERS) {
        const extra = propose(prompt);
        if (!extra) continue;
        let derived: number | undefined;
        try {
          derived = exactNumberTruth({ task, values: [], ...extra } as never).answerNumber;
        } catch {
          continue; // the engine refused these inputs; that is a clean rejection
        }
        // THE GATE: the engine must land on the lesson's own frozen answer.
        if (typeof derived !== "number" || derived !== frozen) continue;
        out.push({ course, lesson: file.replace(".json", ""), step: step.id, task, prompt, frozen, derived, extra });
        break;
      }
    }
  }
}

const byTask: Record<string, number> = {};
for (const c of out) byTask[c.task] = (byTask[c.task] ?? 0) + 1;
console.log(`answer-confirmed conversion candidates: ${out.length}`);
console.log(Object.entries(byTask).sort((a, b) => b[1] - a[1]).map(([t, n]) => `  ${String(n).padStart(4)} ${t}`).join("\n"));
console.log("\nEvery candidate below still needs a human read: the gate proves the NUMBER matches,");
console.log("not that the task's derivation narrates what this lesson is actually teaching.");
for (const c of out.slice(0, 12)) console.log(`  ${c.lesson}/${c.step} [${c.task}] ${c.prompt.slice(0, 70)} => ${c.frozen}`);
writeFileSync("EXACTNUMBER_CONVERSION_CANDIDATES.json", JSON.stringify({ generated: new Date().toISOString(), count: out.length, candidates: out }, null, 2));
