// MCQ-heavy lesson classifier. For every lesson over the MCQ-heavy threshold,
// decide whether its multiple-choice steps are PEDAGOGICALLY CORRECT (the answer
// is a judgment — discrimination, justification, classification, strategy) or a
// CONVERSION OPPORTUNITY (the learner should calculate, construct, place, graph).
//
//   node scripts/gen-mcq-inventory.mjs        # writes MCQ_INVENTORY.md
//
// This exists because "reduce MCQ" is the wrong goal — the right goal is "MCQ
// only where it teaches best." The report separates the two so the backlog is
// honest: the convertible set, not the whole flagged set.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = "content/courses";
const prereqs = JSON.parse(readFileSync("content/skill-prereqs.json", "utf8")).prereqs;
const memo = new Map();
function ancestors(tag) {
  if (memo.has(tag)) return memo.get(tag);
  const out = new Set();
  const stack = [...(prereqs[tag] ?? [])];
  while (stack.length) {
    const t = stack.pop();
    if (out.has(t)) continue;
    out.add(t);
    stack.push(...(prereqs[t] ?? []));
  }
  memo.set(tag, out);
  return out;
}
const dependents = new Map();
for (const t of Object.keys(prereqs))
  for (const a of ancestors(t)) (dependents.get(a) ?? dependents.set(a, new Set()).get(a)).add(t);
const centralityOf = (tag) => dependents.get(tag)?.size ?? 0;

// A distractor's job is one of these. Prompt-level signals that MCQ is the
// RIGHT tool: the correct answer is a judgment, not a computed object.
const KEEP = [
  [/\bwhy\b|because/i, "justification"],
  [/which .{0,30}(best|tool|method|strategy|approach|first)/i, "strategy-selection"],
  [/\b(prime|composite|rational|irrational|congruent|similar|proportional|quadrant|parallel|perpendicular)\b/i, "classification"],
  [/difference between|same as|equivalent to|when is|only (if|when)/i, "concept-discrimination"],
  [/is .{0,40}(a solution|correct|true|proportional|congruent)|does .{0,30}satisfy/i, "truth-judgment"],
  [/counterexample|which .{0,20}(claim|statement|explanation|reasoning)/i, "statement-comparison"],
  [/\b(criterion|criteria|theorem|proof|converse|postulate|CPCTC)\b/i, "proof-justification"],
  [/without computing|bigger.{0,10}smaller.{0,10}same|estimate|reason(ing)? about/i, "estimation-reasoning"],
  [/\bmust be\b|guarantee|always|never|enough to|sufficient/i, "logical-necessity"],
  [/what .{0,20}(kind|type|name)|called|identify (the|which)/i, "identification"]
];
// Signals the learner should GENERATE a mathematical object instead.
const NUMERIC = /^[-−]?[\d,]+(\.\d+)?(\s*\/\s*\d+)?$/;

const rows = [];
for (const dir of readdirSync(ROOT)) {
  const cf = join(ROOT, dir, "course.json");
  if (!existsSync(cf)) continue;
  const course = JSON.parse(readFileSync(cf, "utf8"));
  const g = course.gradeLevel;
  const lessonsDir = join(ROOT, dir, "lessons");
  for (const f of readdirSync(lessonsDir).filter((x) => x.endsWith(".json"))) {
    const l = JSON.parse(readFileSync(join(lessonsDir, f), "utf8"));
    const widgets = l.steps.filter((s) => s.widget);
    const graded = widgets.filter((s) => s.kind === "check" || s.kind === "challenge");
    const mcq = graded.filter((s) => s.widget.type === "mcq");
    if (!graded.length || mcq.length / graded.length <= 0.6) continue;
    const tags = [...new Set(l.steps.map((s) => s.conceptTag).filter(Boolean))];
    const centrality = Math.max(0, ...tags.map(centralityOf));
    let keepHits = 0;
    let numericHits = 0;
    const reasons = new Set();
    for (const s of mcq) {
      const p = s.widget.prompt;
      let matched = false;
      for (const [re, reason] of KEEP)
        if (re.test(p)) {
          keepHits++;
          reasons.add(reason);
          matched = true;
          break;
        }
      const correct = s.widget.options.filter((o) => o.correct);
      if (!matched && correct.length && correct.every((o) => NUMERIC.test(o.label.trim()))) numericHits++;
    }
    const verdict =
      keepHits >= Math.ceil(mcq.length * 0.6)
        ? "KEEP"
        : numericHits >= Math.ceil(mcq.length * 0.5)
          ? "CONVERT"
          : "REVIEW";
    rows.push({ lesson: l.id, title: l.title, course: course.title, grade: g, centrality, mcq: mcq.length, verdict, reasons: [...reasons] });
  }
}

rows.sort((a, b) => b.centrality - a.centrality);
const count = (v) => rows.filter((r) => r.verdict === v).length;
const k8 = rows.filter((r) => r.grade <= 8);

const md = [];
md.push("# MCQ-heavy lesson classification (generated — do not hand-edit)");
md.push("");
md.push("Regenerate with `node scripts/gen-mcq-inventory.mjs`. A lesson is MCQ-heavy when");
md.push("more than 60% of its graded steps are multiple choice. The goal is not zero MCQ —");
md.push("it is MCQ *only where the answer is a judgment*. Verdicts:");
md.push("");
md.push("- **KEEP** — the MCQ steps test discrimination, justification, classification,");
md.push("  strategy selection, or statement comparison. Multiple choice is the right tool.");
md.push("- **CONVERT** — a majority of steps have a computed/constructed answer the learner");
md.push("  should generate (numeric entry, placement, construction).");
md.push("- **REVIEW** — mixed; needs a human read per step.");
md.push("");
md.push(`## Totals`);
md.push("");
md.push(`${rows.length} MCQ-heavy lessons · KEEP ${count("KEEP")} · CONVERT ${count("CONVERT")} · REVIEW ${count("REVIEW")}.`);
md.push(`K–8 subset: ${k8.length} lessons.`);
md.push("");
md.push(`## CONVERT — genuine conversion opportunities (do these)`);
md.push("");
md.push(`| lesson | course (G) | central | MCQ | `);
md.push(`| --- | --- | --: | --: |`);
for (const r of rows.filter((x) => x.verdict === "CONVERT"))
  md.push(`| ${r.lesson} — ${r.title} | ${r.course} (G${r.grade}) | ${r.centrality} | ${r.mcq} |`);
if (!count("CONVERT")) md.push(`| _none_ | | | |`);
md.push("");
md.push(`## REVIEW — case-by-case, ranked by prerequisite centrality`);
md.push("");
md.push(`| lesson | course (G) | central | MCQ |`);
md.push(`| --- | --- | --: | --: |`);
for (const r of rows.filter((x) => x.verdict === "REVIEW").slice(0, 40))
  md.push(`| ${r.lesson} — ${r.title} | ${r.course} (G${r.grade}) | ${r.centrality} | ${r.mcq} |`);
md.push("");
md.push(`## KEEP — MCQ is pedagogically correct (${count("KEEP")} lessons)`);
md.push("");
md.push(`| lesson | course (G) | central | keep reasons |`);
md.push(`| --- | --- | --: | --- |`);
for (const r of rows.filter((x) => x.verdict === "KEEP").slice(0, 40))
  md.push(`| ${r.lesson} — ${r.title} | ${r.course} (G${r.grade}) | ${r.centrality} | ${r.reasons.join(", ") || "—"} |`);
md.push("");
writeFileSync("MCQ_INVENTORY.md", md.join("\n"));
console.log(`mcq-inventory: ${rows.length} MCQ-heavy · KEEP ${count("KEEP")} · CONVERT ${count("CONVERT")} · REVIEW ${count("REVIEW")}`);
