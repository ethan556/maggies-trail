/* Playbook status — measured from disk, never from the logs.
 *
 *   node scripts/measure/playbook-status.mjs        # writes PLAYBOOK_STATUS.md
 *
 * Two questions the tier report alone cannot answer:
 *   1. Is each enhancement in CONVERSION_PLAYBOOK_6_12.md §8 actually BUILT?  (schema surface)
 *   2. Has it actually REACHED LESSONS?                                      (uptake)
 * A capability that is built and unused is indistinguishable from one that was never built, from
 * the learner's side. S120 found three of those, one of them unusable because its own integrity
 * gate refused the shape it was built for — a defect no tier count would have surfaced.
 *
 * Deterministic: reads content/ and src/lib/schema.ts, and shells out to flagship-tier.mjs for
 * the tier column so there is one tier authority, not two.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = "content/courses";
const schema = readFileSync("src/lib/schema.ts", "utf8");

/* ---- the playbook's §8 table, plus the two engine builds it lists below the line ---- */
const ENHANCEMENTS = [
  { id: "a", engine: "triangleConstraintLab", field: "constraint", serves: 3,
    built: () => /isoscelesLegs/.test(schema), uses: (w) => w.type === "triangleConstraintLab" && !!w.constraint },
  { id: "b", engine: "dilationExplore", field: "showRatios", serves: 8,
    built: () => /showRatios/.test(schema), uses: (w) => w.type === "dilationExplore" && !!w.showRatios },
  { id: "c", engine: "triangleSolve", field: 'mode:"ratios"', serves: 10,
    built: () => /"ratios"/.test(schema), uses: (w) => w.type === "triangleSolve" && w.mode === "ratios" },
  { id: "d", engine: "compassConstruct", field: "+5 modes", serves: 6,
    built: () => /copyAngle/.test(schema),
    uses: (w) => w.type === "compassConstruct" && !["perpBisector", "hexagon"].includes(w.mode) },
  { id: "e", engine: "quadDrag", field: "kite", serves: 1,
    built: () => /a kite/.test(schema), uses: (w) => w.type === "quadDrag" && /kite/.test(w.targetName ?? "") },
  { id: "e", engine: "quadDrag", field: "showMidsegment", serves: 1,
    built: () => /showMidsegment/.test(schema), uses: (w) => w.type === "quadDrag" && !!w.showMidsegment },
  { id: "f", engine: "solveBalance", field: "groups", serves: 5,
    built: () => /groups/.test(schema), uses: (w) => w.type === "solveBalance" && !!w.groups },
  { id: "g", engine: "solveBalance", field: "negative tiles", serves: 1,
    built: () => /solveBalanceWitness/.test(schema),
    uses: (w) => w.type === "solveBalance" && (w.a < 0 || w.b < 0 || w.c < 0) },
  { id: "h", engine: "solveBalance", field: "inequality", serves: 3,
    built: () => /relation/.test(schema),
    uses: (w) => w.type === "solveBalance" && w.relation && w.relation !== "eq" },
  { id: "i", engine: "numberLinePlace", field: "showDistanceFromZero", serves: 3,
    built: () => /showDistanceFromZero/.test(schema),
    uses: (w) => w.type === "numberLinePlace" && !!w.showDistanceFromZero },
  { id: "j", engine: "signChart", field: "probeX", serves: 2,
    built: () => /probeX/.test(schema), uses: (w) => w.type === "signChart" && !!w.probeX },
  { id: "k", engine: "signChart", field: "poles + holes", serves: 10,
    built: () => /poles/.test(schema),
    uses: (w) => w.type === "signChart" && ((w.poles?.length ?? 0) > 0 || (w.holes?.length ?? 0) > 0) },
  { id: "—", engine: "unitCircleExplore", field: "wave", serves: 14,
    built: () => /angularScale/.test(schema), uses: (w) => w.type === "unitCircleExplore" && !!w.trace },
  { id: "—", engine: "unitCircleExplore", field: "ghost", serves: 12,
    built: () => /ghostAngle/.test(schema), uses: (w) => w.type === "unitCircleExplore" && !!w.ghost },
  { id: "—", engine: "unitCircleExplore", field: "branch", serves: 4,
    built: () => /branch/.test(schema), uses: (w) => w.type === "unitCircleExplore" && !!w.branch },
  { id: "—", engine: "extraneousRootLab", field: "new engine", serves: 14,
    built: () => /extraneousRootLab/.test(schema), uses: (w) => w.type === "extraneousRootLab" }
];

/* ---- walk every lesson once ---- */
const uptake = ENHANCEMENTS.map(() => []);
const byType = new Map();
for (const course of readdirSync(ROOT)) {
  const dir = join(ROOT, course, "lessons");
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    const lesson = JSON.parse(readFileSync(join(dir, f), "utf8"));
    for (const s of lesson.steps ?? []) {
      if (!s.widget) continue;
      if (!byType.has(s.widget.type)) byType.set(s.widget.type, []);
      byType.get(s.widget.type).push(lesson.id);
      ENHANCEMENTS.forEach((e, i) => { if (e.uses(s.widget)) uptake[i].push(lesson.id); });
    }
  }
}

/* ---- tiers, from the one authority ---- */
const tmp = join(tmpdir(), `playbook-tiers-${process.pid}.json`);
execFileSync("node", ["scripts/flagship-tier.mjs"], { env: { ...process.env, TIER_JSON: tmp }, stdio: "ignore" });
const rows = JSON.parse(readFileSync(tmp, "utf8"));
rmSync(tmp, { force: true });

const BLOCKS = [
  ["1 — G7 two-step equations", ["tse-"]],
  ["2 — G12 trigonometry", ["tg-", "ti-"]],
  ["3 — G10 geometry", ["sg-", "cx-", "tc-", "rt-", "sy-", "cp-", "pq-", "cr-", "gf-"]],
  ["4 — G6 number system", ["ns-"]],
  ["5 — A2 polynomial & rational", ["pf-", "rf-"]],
  ["6 — A2 radicals", ["re-"]]
];

const md = [];
md.push("# Playbook status (generated — do not hand-edit)");
md.push("");
md.push("Regenerate with `node scripts/measure/playbook-status.mjs`. Measured from `content/` and");
md.push("`src/lib/schema.ts` on disk; tiers come from `scripts/flagship-tier.mjs` so there is one");
md.push("tier authority. Tracks `CONVERSION_PLAYBOOK_6_12.md`.");
md.push("");
md.push("## Engine enhancements — built, and reaching lessons?");
md.push("");
md.push("`serves` is the playbook's own estimate of the lessons each enhancement was specified for.");
md.push("A large gap between `serves` and `lessons` is the signal this table exists for: capability");
md.push("that was paid for and never delivered.");
md.push("");
md.push("| § | engine | enhancement | built | lessons | serves | using |");
md.push("| --- | --- | --- | :-: | --: | --: | --- |");
ENHANCEMENTS.forEach((e, i) => {
  const ids = [...new Set(uptake[i])].sort();
  const flag = !e.built() ? "✗" : ids.length === 0 ? "⚠ unused" : "✓";
  md.push(`| ${e.id} | \`${e.engine}\` | ${e.field} | ${flag} | ${ids.length} | ${e.serves} | ${ids.join(" ") || "—"} |`);
});
md.push("");
md.push("## Per-block tiers");
md.push("");
md.push("Acceptance (§9.1): every converted lesson ≥ B, and ≥ 90% of the block at A.");
md.push("");
md.push("| block | lessons | A | B | C | D | still C/D |");
md.push("| --- | --: | --: | --: | --: | --: | --- |");
for (const [name, prefixes] of BLOCKS) {
  const r = rows.filter((x) => prefixes.some((p) => x.id.startsWith(p)));
  const n = (t) => r.filter((x) => x.tier === t).length;
  const residue = r.filter((x) => x.tier === "C" || x.tier === "D").map((x) => x.id);
  md.push(`| ${name} | ${r.length} | ${n("A")} | ${n("B")} | ${n("C")} | ${n("D")} | ${residue.length} |`);
}
md.push("");
for (const [name, prefixes] of BLOCKS) {
  const residue = rows
    .filter((x) => prefixes.some((p) => x.id.startsWith(p)) && (x.tier === "C" || x.tier === "D"))
    .map((x) => `${x.id} (${x.tier} ${x.total})`);
  if (residue.length) {
    md.push(`**Block ${name} residue (${residue.length}):** ${residue.join(" · ")}`);
    md.push("");
  }
}
md.push("");
md.push("## Block 3's purpose-built labs — how far each has reached");
md.push("");
md.push("These engines were built for the G10 geometry courses and are not §8 enhancements, so the");
md.push("table above does not track them. Block 3 is authoring-bound, not engine-bound: the residue");
md.push("below is served by engines that already exist and already pass their gates.");
md.push("");
md.push("| engine | lessons | using |");
md.push("| --- | --: | --- |");
const B3_ENGINES = ["solidSliceLab", "coordinateProofLab", "triangleConstraintLab", "triangleSolve",
  "dilationExplore", "compassConstruct", "quadDrag", "distanceGrid", "circleAngleExplore", "transformExplore"];
for (const type of B3_ENGINES) {
  const ids = [...new Set(byType.get(type) ?? [])].sort();
  md.push(`| \`${type}\` | ${ids.length} | ${ids.join(" ") || "—"} |`);
}
md.push("");
const all = (t) => rows.filter((x) => x.tier === t).length;
md.push(`Product-wide: ${rows.length} lessons · A ${all("A")} · B ${all("B")} · C ${all("C")} · D ${all("D")}.`);
md.push("");

writeFileSync("PLAYBOOK_STATUS.md", md.join("\n"));
const unused = ENHANCEMENTS.filter((e, i) => e.built() && uptake[i].length === 0).length;
const unbuilt = ENHANCEMENTS.filter((e) => !e.built()).length;
console.log(`playbook: ${ENHANCEMENTS.length} enhancements · ${unbuilt} unbuilt · ${unused} built-but-unused`);
