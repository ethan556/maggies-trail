/**
 * S242 / CML-01 — WHAT WOULD IT ACTUALLY TAKE TO RETIRE THE WAIVERS BEFORE THEY EXPIRE?
 *
 * `CML_WAIVERS.json` allows at most 161 `prediction-not-causal` and 39 `flagship-response-heavy`
 * warnings, and both entries expire **2026-11-13**. On that date the gate goes red whether or not
 * anything else has happened. The waiver's own rationale calls the residue "real signal rather than
 * lint drift" and hands it to Wave 5, which has not started.
 *
 * "158 lessons need re-sequencing" is the sentence everyone repeats. It is an assumption. The rule
 * is that a prediction must be attached to, or followed within three steps by, DIRECT mathematical
 * manipulation — so there are two very different populations inside that number:
 *
 *   · the lesson HAS a manipulative step, just not near the prediction  → moving a step may close it,
 *     and moving a step changes no prose, which CLAUDE.md rule 1 protects
 *   · the lesson has NO manipulative step at all                        → nothing can be moved; it
 *     needs a new interactive surface, which is authoring, not sequencing
 *
 * Those two have completely different costs and only one of them is a "re-sequencing" job. This
 * script separates them, and reports the distance from each flagged prediction to the nearest
 * manipulative step so the first population can be ordered by how far it has to travel.
 *
 * Run: npx tsx scripts/audit/cml-burndown.mts
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/** The engine capability registry is what `cml-lint` derives DIRECT from; reuse it, do not guess. */
const CAPS = (JSON.parse(readFileSync(join(ROOT, "scripts/engine-capabilities.json"), "utf8")) as {
  types: Record<string, { manip: number }>;
}).types;
const isDirect = (type?: string) => (type ? (CAPS[type]?.manip ?? 0) >= 2 : false);

/** The lessons the strict gate names, read from the gate rather than re-derived. */
const flagged = new Map<string, number[]>();
for (const line of execSync("npm run cml:lint:strict", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).split("\n")) {
  const m = line.match(/^WARNING prediction-not-causal (\S+?)#(\d+):/);
  if (m) flagged.set(m[1], [...(flagged.get(m[1]) ?? []), Number(m[2])]);
}

interface Row {
  lesson: string; predictAt: number; steps: number;
  nearestDirect: number | null; distance: number | null; verdict: string;
}
const rows: Row[] = [];

for (const [file, indices] of flagged) {
  const lesson = JSON.parse(readFileSync(join(ROOT, file), "utf8")) as {
    id: string; steps: Array<{ widget?: { type?: string } }>;
  };
  const directAt = lesson.steps.map((s, i) => (isDirect(s.widget?.type) ? i : -1)).filter((i) => i >= 0);
  for (const at of indices) {
    if (!directAt.length) {
      rows.push({ lesson: lesson.id, predictAt: at, steps: lesson.steps.length, nearestDirect: null, distance: null, verdict: "no-manipulative-anywhere" });
      continue;
    }
    const nearest = directAt.reduce((a, b) => (Math.abs(b - at) < Math.abs(a - at) ? b : a));
    const distance = nearest - at;
    rows.push({
      lesson: lesson.id, predictAt: at, steps: lesson.steps.length, nearestDirect: nearest, distance,
      // The rule looks FORWARD three steps. A manipulative that already sits behind the prediction
      // cannot satisfy it by being moved closer without moving the prediction itself.
      verdict: distance > 0 ? "reachable-by-moving" : "manipulative-precedes-prediction",
    });
  }
}

const by = (v: string) => rows.filter((r) => r.verdict === v);
mkdirSync(OUT, { recursive: true });
const out = join(OUT, "CML01_BURNDOWN.csv");
writeFileSync(out, [
  `# sourceSeal=${seal} — S242/CML-01. The waivers expire 2026-11-13. This splits the`,
  "# prediction-not-causal population by whether the lesson HAS a manipulative step at all.",
  "# reachable-by-moving = a direct step exists AFTER the prediction; re-sequencing may close it.",
  "# manipulative-precedes-prediction = the only direct step is before it; the prediction moves, not the step.",
  "# no-manipulative-anywhere = nothing to sequence toward; this is authoring, not re-sequencing.",
  "lesson,predictStepIndex,stepCount,nearestDirectIndex,distance,verdict",
  ...rows.sort((a, b) => a.verdict.localeCompare(b.verdict) || (a.distance ?? 99) - (b.distance ?? 99))
    .map((r) => [r.lesson, r.predictAt, r.steps, r.nearestDirect ?? "", r.distance ?? "", r.verdict].join(",")),
].join("\n") + "\n");

console.log(`cml-burndown @ ${seal}`);
console.log(`  flagged predictions            ${rows.length}  across ${flagged.size} lessons`);
console.log(`    reachable-by-moving          ${by("reachable-by-moving").length}   ← a direct step already exists after it`);
console.log(`    manipulative-precedes        ${by("manipulative-precedes-prediction").length}   ← the prediction is the thing out of place`);
console.log(`    no-manipulative-anywhere     ${by("no-manipulative-anywhere").length}   ← AUTHORING, not sequencing`);
const reach = by("reachable-by-moving");
if (reach.length) {
  const near = reach.filter((r) => (r.distance ?? 99) <= 6).length;
  console.log(`\n  of the reachable, within six steps: ${near}`);
  console.log("  distance histogram:", Object.entries(
    reach.reduce<Record<string, number>>((acc, r) => { const k = String(r.distance); acc[k] = (acc[k] ?? 0) + 1; return acc; }, {})
  ).sort((a, b) => Number(a[0]) - Number(b[0])).map(([d, n]) => `${d}:${n}`).join(" "));
}
console.log(`\n  wrote ${relative(ROOT, out)}`);
