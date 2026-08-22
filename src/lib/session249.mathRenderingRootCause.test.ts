import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const REPORT_DIR = join(process.cwd(), "reports", "math-presentation");

function dataRows(file: string): string[][] {
  const text = readFileSync(join(REPORT_DIR, file), "utf8")
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("#"))
    .join("\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if (char === "\n" && !quoted) { row.push(field); rows.push(row); row = []; field = ""; }
    else if (char !== "\r") field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.slice(1).filter((candidate) => candidate.some(Boolean));
}

describe("S249 math-rendering root-cause packet", () => {
  it("keeps every non-symbolic presentation index at zero", () => {
    const zeroIndexes = [
      "MATH_MACHINE_EXPRESSION_LEAK_INDEX.csv",
      "MATH_FRACTION_DISPLAY_INDEX.csv",
      "MATH_CANONICAL_FORM_INDEX.csv",
      "MATH_CONSTANT_ORDER_INDEX.csv",
      "MATH_DERIVATIVE_NOTATION_INDEX.csv",
      "MATH_INTEGRAL_NOTATION_INDEX.csv",
      "MATH_UNIT_NOTATION_INDEX.csv",
      "MATH_DECIMAL_FRACTION_POLICY_INDEX.csv",
    ];
    for (const file of zeroIndexes) expect(dataRows(file), file).toHaveLength(0);
  });

  it("keeps the universal symbolic-display residue at zero", () => {
    expect(dataRows("MATH_SYMBOLIC_DISPLAY_INDEX.csv")).toHaveLength(0);
  });
});
