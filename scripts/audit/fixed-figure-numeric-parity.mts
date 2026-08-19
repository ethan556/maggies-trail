/**
 * Deterministic corpus audit for authored prose beside declared fixed-number
 * figures. Generic rule prose is accepted only through the figure's narrow,
 * source-controlled semantic contract. Explicit worked examples must preserve
 * signed values, operation polarity, and movement direction.
 *
 * Run: npx tsx scripts/audit/fixed-figure-numeric-parity.mts [--json]
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import {
  compareFigureNumericParity,
  FIXED_NUMERIC_EXEMPLAR_CONTRACTS,
  hasExplicitNumericOrSymbolicClaim,
  isDeclaredFixedNumericExemplarAligned,
  type FixedNumericExemplarId,
} from "../../src/lib/figureNumericParity";
import { isFigureTextAligned } from "../../src/lib/figureTextAlignment";

const ROOT = process.cwd();
const COURSES = join(ROOT, "content", "courses");
const asJson = process.argv.includes("--json");

type Finding = {
  file: string;
  lesson: string;
  path: string;
  figure: FixedNumericExemplarId;
  explicit: boolean;
  reasons: string[];
  figureClaim: string;
  authoredText: string;
  safelyWithheld: boolean;
};

function files(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files(path, out);
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(path);
  }
  return out.sort();
}

function localText(record: Record<string, unknown>): string {
  return ["title", "body", "prompt", "narration", "explanation", "caption", "feedback"]
    .map((key) => record[key])
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const findings: Finding[] = [];
let placements = 0;
const counts = new Map<string, number>();

function visit(value: unknown, context: { file: string; lesson: string; path: string }): void {
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  const figure = record.figure;
  if (typeof figure === "string" && figure in FIXED_NUMERIC_EXEMPLAR_CONTRACTS) {
    const id = figure as FixedNumericExemplarId;
    const authoredText = localText(record);
    const contract = FIXED_NUMERIC_EXEMPLAR_CONTRACTS[id];
    placements += 1;
    counts.set(id, (counts.get(id) ?? 0) + 1);
    if (!isDeclaredFixedNumericExemplarAligned(id, authoredText)) {
      const explicit = hasExplicitNumericOrSymbolicClaim(authoredText);
      const comparison = explicit ? compareFigureNumericParity(contract.figureClaim, authoredText) : undefined;
      findings.push({
        file: relative(ROOT, context.file).replace(/\\/g, "/"),
        lesson: context.lesson,
        path: context.path,
        figure: id,
        explicit,
        reasons: comparison?.reasons.length ? comparison.reasons : ["GENERIC_SEMANTIC_CONTRACT_MISMATCH"],
        figureClaim: contract.figureClaim,
        authoredText,
        safelyWithheld: !isFigureTextAligned(id, authoredText),
      });
    }
  }
  for (const [key, child] of Object.entries(record)) {
    if (key === "figure") continue;
    if (Array.isArray(child)) child.forEach((item, index) => visit(item, { ...context, path: `${context.path}.${key}[${index}]` }));
    else if (child && typeof child === "object") visit(child, { ...context, path: `${context.path}.${key}` });
  }
}

for (const file of files(COURSES)) {
  let source: Record<string, unknown>;
  try { source = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>; } catch { continue; }
  const lesson = (source.lesson && typeof source.lesson === "object" ? source.lesson : source) as Record<string, unknown>;
  const lessonId = String(lesson.id ?? source.id ?? relative(COURSES, file));
  visit(source, { file, lesson: lessonId, path: "$" });
}

const result = {
  declaredFigures: Object.keys(FIXED_NUMERIC_EXEMPLAR_CONTRACTS).length,
  placements,
  allowedToRender: placements - findings.length,
  replacementDebt: findings.length,
  safelyWithheld: findings.filter((row) => row.safelyWithheld).length,
  unsafeFindings: findings.filter((row) => !row.safelyWithheld).length,
  explicitFindings: findings.filter((row) => row.explicit).length,
  genericFindings: findings.filter((row) => !row.explicit).length,
  byFigure: Object.fromEntries([...counts].sort(([a], [b]) => a.localeCompare(b))),
  rows: findings,
};

if (asJson) console.log(JSON.stringify(result, null, 2));
else {
  console.log("fixed-figure-numeric-parity");
  console.log(`  ${result.declaredFigures} declared fixed-number figure contracts`);
  console.log(`  ${placements} corpus placements: ${result.allowedToRender} allowed to render, ${result.replacementDebt} replacement-debt placements`);
  console.log(`  ${result.safelyWithheld} safely withheld; ${result.unsafeFindings} unsafe findings`);
  console.log(`  ${result.explicitFindings} explicit-claim debt; ${result.genericFindings} generic-contract debt`);
  for (const row of findings) console.log(`  ${row.lesson} ${row.path} ${row.figure}: ${row.safelyWithheld ? "SAFELY_WITHHELD" : "UNSAFE"}; ${row.reasons.join(", ")}`);
}

if (findings.length || result.unsafeFindings) process.exitCode = 1;
