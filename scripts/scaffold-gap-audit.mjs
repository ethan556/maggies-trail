// Scores every lesson's CHALLENGE step against the hardest thing it has already rehearsed,
// and writes a ranked SCAFFOLD_AUDIT.md. Deterministic and data-driven — re-run after any
// content change: node scripts/scaffold-gap-audit.mjs
//
// The question this answers: does this lesson ask a genuinely NEW combination of skills at
// the challenge step, with no earlier check/interactive step having rehearsed that combination
// (or something comparably compound) first? A steep, unrehearsed jump from single-operation
// checks to a multi-operation challenge lets a learner's first encounter with "do A, then do B"
// be the one that's graded at the highest stakes in the lesson — exactly backwards from gradual,
// scaffolded difficulty.
//
// COMPOUNDNESS SCORE (per widget prompt): counts how many distinct arithmetic/operation
// "families" the prompt's language implies (add, subtract, multiply, divide, percent, rate,
// comparison, conversion), plus 1 if it uses sequencing language ("then", "after", "next",
// "before"), plus 1 if it names 3+ numbers. This is a proxy, not a proof — it is intentionally
// calibrated to flag CANDIDATES for human review, not to fail a build. Session sixteen[+1]
// reviewed the candidates this produced by hand: several were false positives (a challenge that
// LOOKS compound by keyword count but is actually well-rehearsed by an equally-compound earlier
// check), and several were real gaps, fixed by inserting a verified intermediate check step
// immediately before the challenge. See DECISIONS.md for the specific calls made.
//
// This script does NOT gate the build (see README's gate list) — it is advisory, like
// FLAGSHIP.md's ranking. A future session (or the same one, re-run after fixes) uses the
// ranked list to decide where to look next; it does not fail CI on a fuzzy heuristic.

import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "content", "courses");

const FAMILIES = {
  add: /\b(add(?:s|ed|ing)?|sum|total|altogether|combined|plus|in all|both together)\b/i,
  sub: /\b(subtract(?:s|ed|ing)?|minus|difference|left|remaining|fewer|less than|take away|used up|spent)\b/i,
  mul: /\b(times|multipl(?:y|ies|ied)|each|per|groups? of|product of|twice|triple|double(?:d)?)\b/i,
  div: /\b(divide(?:s|d)?|split|share(?:d)?|per|quotient|average|split (?:evenly|equally))\b/i,
  pct: /\b(percent|%|of the|discount|tax|tip|markup|interest)\b/i,
  rate: /\b(per (?:hour|minute|second|day|mile|km|kg|lb)|rate of|speed of|miles per|km\/h|mph)\b/i,
  cmp: /\b(how much (?:more|less|farther|shorter|longer|faster|slower|greater|smaller)|compare[sd]?|difference between)\b/i,
  conv: /\b(convert(?:s|ed)?|how many (?:inches|feet|cm|m|kg|g|liters?|ml|minutes|hours|seconds))\b/i
};
const SEQUENCE = /\b(then|after(?:wards)?|next|before|once you|now that|first[,]?\s|following that)\b/i;

function score(prompt) {
  const fams = Object.values(FAMILIES).reduce((n, re) => n + (re.test(prompt) ? 1 : 0), 0);
  const seq = SEQUENCE.test(prompt) ? 1 : 0;
  const nums = (prompt.match(/-?\d[\d,]*\.?\d*/g) ?? []).length;
  return fams + seq + (nums >= 3 ? 1 : 0);
}

const rows = [];
for (const course of readdirSync(ROOT)) {
  const dir = path.join(ROOT, course, "lessons");
  let files = [];
  try {
    files = readdirSync(dir);
  } catch {
    continue;
  }
  for (const f of files) {
    const lesson = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
    let challenge = null;
    let maxEarlier = 0;
    let nChecks = 0;
    for (const s of lesson.steps ?? []) {
      const w = s.widget;
      if (!w || !w.prompt) continue;
      const sc = score(w.prompt);
      if (s.kind === "interactive" || s.kind === "check") {
        nChecks++;
        if (sc > maxEarlier) maxEarlier = sc;
      } else if (s.kind === "challenge") {
        challenge = { id: s.id, score: sc, prompt: w.prompt };
      }
    }
    if (!challenge) continue;
    rows.push({
      course,
      lessonId: lesson.id,
      title: lesson.title,
      file: path.join(course, "lessons", f),
      challengeScore: challenge.score,
      maxEarlierScore: maxEarlier,
      gap: challenge.score - maxEarlier,
      nChecks,
      challengePrompt: challenge.prompt
    });
  }
}

rows.sort((a, b) => b.gap - a.gap || b.challengeScore - a.challengeScore);

const flaggedStrong = rows.filter((r) => r.gap >= 3);
const flaggedModerate = rows.filter((r) => r.gap === 2 && r.challengeScore >= 2);

const lines = [];
lines.push("# Scaffold Gap Audit");
lines.push("");
lines.push("Regenerate with `node scripts/scaffold-gap-audit.mjs`. Advisory only — not a build gate");
lines.push("(see the file header for why). Ranks each lesson's CHALLENGE step's compoundness score");
lines.push("against the hardest check/interactive step already rehearsed earlier in the SAME lesson.");
lines.push("A large gap is a candidate for a human to review: does an earlier step really rehearse");
lines.push("the combination the challenge asks for, or is the challenge the learner's first encounter");
lines.push("with it at the highest-stakes moment in the lesson?");
lines.push("");
lines.push(`**${rows.length} lessons scanned. ${flaggedStrong.length} at gap≥3. ${flaggedModerate.length} at gap=2 (challengeScore≥2).**`);
lines.push("");
lines.push("| gap | challenge score | max earlier | course/lesson | title |");
lines.push("|---|---|---|---|---|");
for (const r of rows.slice(0, 60)) {
  lines.push(`| ${r.gap} | ${r.challengeScore} | ${r.maxEarlierScore} | ${r.course}/${r.lessonId} | ${r.title} |`);
}
lines.push("");
lines.push("## Top candidates, in full");
for (const r of rows.slice(0, 30)) {
  lines.push("");
  lines.push(`### ${r.course}/${r.lessonId} — ${r.title} (gap ${r.gap})`);
  lines.push(`- challenge score ${r.challengeScore}, hardest earlier step ${r.maxEarlierScore}, ${r.nChecks} check/interactive steps before it`);
  lines.push(`- CHALLENGE: ${r.challengePrompt}`);
}

writeFileSync(path.join(process.cwd(), "SCAFFOLD_AUDIT.md"), lines.join("\n") + "\n");
console.log(
  `scaffold-gap-audit: ${rows.length} lessons scanned, ${flaggedStrong.length} at gap>=3, ${flaggedModerate.length} at gap=2 (score>=2). SCAFFOLD_AUDIT.md written.`
);
