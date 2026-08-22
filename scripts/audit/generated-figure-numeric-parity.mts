/** Corpus audit for renderer-derived exact arithmetic-title claims. */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { FIGURE_NUMERIC_CLAIMS } from "../../src/lib/figureNumericClaims.generated";
import { compareExactFigureNumericParity, hasExplicitNumericOrSymbolicClaim } from "../../src/lib/figureNumericParity";
import { isFigureTextAligned } from "../../src/lib/figureTextAlignment";

const ROOT = process.cwd(), COURSES = join(ROOT, "content", "courses");
const OUT = join(ROOT, "reports", "vis", "S262_GENERATED_FIGURE_NUMERIC_PARITY.json");
const asJson = process.argv.includes("--json");
const files = (dir: string, out: string[] = []): string[] => {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) files(file, out);
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(file);
  }
  return out.sort();
};
const localText = (record: Record<string, unknown>): string =>
  ["title", "body", "prompt", "narration", "explanation", "caption", "feedback"]
    .map((key) => record[key]).filter((value): value is string => typeof value === "string").join(" ").replace(/\s+/g, " ").trim();

type Row = { file: string; lesson: string; path: string; figure: string; renderedClaim: string; authoredText: string; reasons: string[]; safelyWithheld: boolean };
const rows: Row[] = [];
let placements = 0, explicitPlacements = 0;
function visit(value: unknown, context: { file: string; lesson: string; path: string }): void {
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>, figure = record.figure;
  if (typeof figure === "string" && figure in FIGURE_NUMERIC_CLAIMS) {
    placements += 1;
    const authoredText = localText(record);
    if (hasExplicitNumericOrSymbolicClaim(authoredText)) {
      explicitPlacements += 1;
      const renderedClaim = FIGURE_NUMERIC_CLAIMS[figure as keyof typeof FIGURE_NUMERIC_CLAIMS];
      const result = compareExactFigureNumericParity(renderedClaim, authoredText);
      if (!result.aligned) rows.push({
        file: relative(ROOT, context.file).replace(/\\/g, "/"), lesson: context.lesson, path: context.path,
        figure, renderedClaim, authoredText, reasons: result.reasons, safelyWithheld: !isFigureTextAligned(figure, authoredText),
      });
    }
  }
  for (const [key, child] of Object.entries(record)) {
    if (key === "figure") continue;
    if (Array.isArray(child)) child.forEach((item, index) => visit(item, { ...context, path: `${context.path}.${key}[${index}]` }));
    else visit(child, { ...context, path: `${context.path}.${key}` });
  }
}
const courseFiles = files(COURSES);
for (const file of courseFiles) {
  let source: Record<string, unknown>;
  try { source = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = (source.lesson && typeof source.lesson === "object" ? source.lesson : source) as Record<string, unknown>;
  visit(source, { file, lesson: String(lesson.id ?? source.id ?? relative(COURSES, file)), path: "$" });
}
const unsafe = rows.filter((row) => !row.safelyWithheld);
const sourceSeal = createHash("sha256")
  .update(JSON.stringify(FIGURE_NUMERIC_CLAIMS))
  .update(courseFiles.map((file) => `${relative(ROOT, file).replace(/\\/g, "/")}\0${readFileSync(file, "utf8")}`).join("\0"))
  .digest("hex");
const result = { sourceSeal, generatedClaims: Object.keys(FIGURE_NUMERIC_CLAIMS).length, placements, explicitPlacements, aligned: explicitPlacements - rows.length, replacementDebt: rows.length, safelyWithheld: rows.length - unsafe.length, unsafe: unsafe.length, rows };
if (process.argv.includes("--write")) {
  writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`);
  console.error(`WROTE ${relative(ROOT, OUT).replace(/\\/g, "/")}`);
}
if (asJson) console.log(JSON.stringify(result, null, 2));
else {
  console.log("generated-figure-numeric-parity");
  console.log(`  ${result.generatedClaims} renderer-derived arithmetic-title claims`);
  console.log(`  ${placements} placements; ${explicitPlacements} beside explicit authored claims`);
  console.log(`  ${result.aligned} exact-aligned; ${result.replacementDebt} replacement debt; ${result.safelyWithheld} safely withheld; ${result.unsafe} unsafe`);
  for (const row of rows) console.log(`  ${row.lesson} ${row.path} ${row.figure}: ${row.safelyWithheld ? "SAFELY_WITHHELD" : "UNSAFE"}; ${row.reasons.join(", ")}`);
}
if (unsafe.length || (rows.length && process.argv.includes("--strict-debt"))) process.exitCode = 1;
