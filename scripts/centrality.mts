/**
 * conceptTag CENTRALITY — ranks tags by how much of the mastery claim rests on them.
 *
 * Centrality here is not just frequency. A tag matters more when:
 *   steps      — many practice-eligible steps carry it (direct assessment surface)
 *   lessons    — it spans several lessons (it is a thread, not a one-off)
 *   remedial   — other lessons route BACK to it when learners miss (it is a prerequisite)
 *   mastery    — it appears in mastery evidence (a mastery claim literally cites it)
 *
 * A tag with generators can be re-asked with fresh problems forever, so mastery on it is a
 * MEASUREMENT. A tag without them can only re-ask the same authored items, so mastery on it is a
 * memorisation claim. This script says exactly which tags are which, ranked by what's at stake.
 */
import fs from "fs";
import path from "path";
import { variantForStep } from "../src/lib/variants";

type Row = {
  tag: string;
  grade: number;
  steps: number;        // practice-eligible steps carrying the tag
  served: number;       // of those, how many a generator can refresh
  lessons: Set<string>;
  remedialFor: number;  // times this tag is a remedial target
  types: Set<string>;
};

const grade = new Map<string, number>();
for (const c of fs.readdirSync("content/courses", { withFileTypes: true })) {
  if (!c.isDirectory()) continue;
  try {
    grade.set(
      c.name,
      JSON.parse(fs.readFileSync(path.join("content/courses", c.name, "course.json"), "utf8")).gradeLevel
    );
  } catch {}
}

const T = new Map<string, Row>();
const row = (tag: string, g: number) => {
  if (!T.has(tag))
    T.set(tag, { tag, grade: g, steps: 0, served: 0, lessons: new Set(), remedialFor: 0, types: new Set() });
  return T.get(tag)!;
};

function walk(dir: string, course: string) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p, course || e.name);
      continue;
    }
    if (!e.name.endsWith(".json") || e.name === "course.json") continue;
    let j: any;
    try {
      j = JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
      continue;
    }
    const g = grade.get(course) ?? 99;

    for (const s of j.steps ?? []) {
      if (!s.conceptTag) continue;
      const practiceEligible = (s.kind === "check" || s.kind === "challenge") && s.widget;
      if (!practiceEligible) continue;
      const r = row(s.conceptTag, g);
      r.steps++;
      r.lessons.add(j.id ?? e.name);
      r.types.add(s.widget.type);
      if (variantForStep(s, "centrality-probe")) r.served++;
    }
    // Remedial pairs name the tag they rescue — that tag is a prerequisite others depend on.
    for (const rem of j.remedials ?? []) {
      if (!rem.conceptTag) continue;
      row(rem.conceptTag, g).remedialFor++;
    }
  }
}
walk("content/courses", "");

const rows = [...T.values()];
// Weighted so that a prerequisite others fall back to outranks a same-size leaf tag.
const score = (r: Row) => r.steps * 3 + r.lessons.size * 2 + r.remedialFor * 5;
rows.sort((a, b) => score(b) - score(a));

const top = rows.slice(0, 200);
const unservedTop = top.filter((r) => r.served < r.steps);
const fullyServedTop = top.filter((r) => r.served === r.steps && r.steps > 0);

const sum = (rs: Row[], f: (r: Row) => number) => rs.reduce((a, r) => a + f(r), 0);

console.log(`conceptTags total: ${rows.length}`);
console.log(`TOP 200 — steps ${sum(top, (r) => r.steps)}, served ${sum(top, (r) => r.served)} ` +
  `(${((sum(top, (r) => r.served) / sum(top, (r) => r.steps)) * 100).toFixed(1)}%)`);
console.log(`  fully served: ${fullyServedTop.length}/200 tags`);
console.log(`  with a gap:   ${unservedTop.length}/200 tags, ` +
  `${sum(unservedTop, (r) => r.steps - r.served)} unrefreshed steps\n`);

// The highest-leverage work: unserved, ranked, homogeneous shape (one widget type) first.
const HOMO = "homogeneous";
console.log("TOP UNSERVED BY CENTRALITY (rank, grade, steps, lessons, remedialFor, shape)");
let shown = 0;
for (const r of unservedTop) {
  if (shown >= 40) break;
  const rank = rows.indexOf(r) + 1;
  const shape = r.types.size === 1 ? [...r.types][0] : `MIXED(${[...r.types].join("/")})`;
  console.log(
    `${String(rank).padStart(3)}  G${String(r.grade).padStart(2)}  ` +
      `${String(r.steps - r.served).padStart(2)}u/${String(r.steps).padStart(2)}  ` +
      `L${r.lessons.size}  R${r.remedialFor}  ${shape.padEnd(22)} ${r.tag}`
  );
  shown++;
}

// Grade-level rollup of where the unrefreshed centrality actually sits.
const byGrade = new Map<number, { steps: number; served: number }>();
for (const r of rows) {
  const g = byGrade.get(r.grade) ?? { steps: 0, served: 0 };
  g.steps += r.steps;
  g.served += r.served;
  byGrade.set(r.grade, g);
}
console.log("\nGRADE ROLLUP (all tags)");
for (const [g, v] of [...byGrade].sort((a, b) => a[0] - b[0])) {
  if (v.steps === 0) continue;
  console.log(`  G${String(g).padStart(2)}  ${String(v.served).padStart(4)}/${String(v.steps).padStart(4)}  ${((v.served / v.steps) * 100).toFixed(1)}%`);
}
