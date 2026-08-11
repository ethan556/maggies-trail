import { authoredMathParts } from "./src/lib/math/authoredMath";
import fs from "node:fs";

const csv = fs.readFileSync("COWORK_CACHE/typesetting-renderer-gap.csv", "utf8");
const lines = csv.split("\n").slice(1).filter(Boolean);

// crude CSV parse (quoted fields, commas inside quotes, "" escape)
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i+1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { fields.push(cur); cur = ""; }
      else cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

let bothGap = 0;
let falseOnlyMatched = 0;
for (const line of lines) {
  const [bucket, lesson_id, json_path, source, action, text] = parseCsvLine(line);
  const a = authoredMathParts(text, { includeArithmetic: false });
  const b = authoredMathParts(text, { includeArithmetic: true });
  const aHasTex = a.some(p => p.tex);
  const bHasTex = b.some(p => p.tex);
  if (!aHasTex && !bHasTex) bothGap++;
  else falseOnlyMatched++;
}
console.log("bothGap", bothGap, "matchedInSomeMode", falseOnlyMatched);
