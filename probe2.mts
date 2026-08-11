import fs from "node:fs";

const csv = fs.readFileSync("COWORK_CACHE/typesetting-renderer-gap.csv", "utf8");
const lines = csv.split("\n").slice(1).filter(Boolean);

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

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻";
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const supRe = new RegExp(`[${SUP}]`);
const subRe = new RegExp(`[${SUB}]`);
const caretRe = /\^/;
const sqrtRe = /\bsqrt\s*\(/i;
const bareRadicalRe = /√/;
const iPowerRe = /\bi[⁰¹²³⁴⁵⁶⁷⁸⁹]/;
const xyRatioRe = /[a-zA-Z]²\s*\/\s*[a-zA-Z]²/;
const blankCaretRe = /\^_+/;
const integralRe = /∫/;
const primeRe = /[′″]/;
const dollarArithRe = /\$\d+(\.\d+)?\s*[−\-+]\s*\$\d+/;
const degreeArithRe = /\d+°\s*[+\-−]\s*\d+°/;
const subscriptCoordRe = subRe;
const ineqAsciiRe = /(<=|>=)/;
const dydxRe = /\bd[a-zA-Z]\s*\/\s*d[a-zA-Z]\b/;
const wordFracRe = /\b[a-zA-Z]\w*\s*\/\s*[a-zA-Z]\w*\b/; // word/word fractions like sin/cos, opposite/hypotenuse

type Row = { lesson_id: string; json_path: string; action: string; text: string };
const rows: Row[] = [];
for (const line of lines) {
  const [bucket, lesson_id, json_path, source, action, text] = parseCsvLine(line);
  rows.push({ lesson_id, json_path, action, text });
}

function classify(r: Row): string {
  const t = r.text;
  if (r.action === 'INLINE_MATH' && /approxFormula/.test(r.json_path)) return 'approxformula_field';
  if (iPowerRe.test(t)) return 'i_power';
  if (blankCaretRe.test(t)) return 'blank_caret_fill';
  if (integralRe.test(t)) return 'integral_notation';
  if (primeRe.test(t)) return 'prime_derivative';
  if (ineqAsciiRe.test(t)) return 'ascii_inequality';
  if (dollarArithRe.test(t)) return 'dollar_arith';
  if (degreeArithRe.test(t)) return 'degree_arith';
  if (xyRatioRe.test(t)) return 'xy_ratio_conic';
  if (subRe.test(t)) return 'subscript_notation';
  if (supRe.test(t) && !caretRe.test(t)) return 'sup_no_caret';
  if (sqrtRe.test(t)) return 'sqrt_bare_word'; // shouldn't happen since sqrt( matched already... check paren balance
  if (/\bsqrt\b/i.test(t)) return 'sqrt_token_or_unbalanced';
  if (bareRadicalRe.test(t)) return 'radical_edge_case';
  if (dydxRe.test(t)) return 'dydx_slash';
  return 'other';
}

const cats: Record<string, Row[]> = {};
for (const r of rows) {
  const c = classify(r);
  (cats[c] ??= []).push(r);
}

const order = Object.entries(cats).sort((a,b) => b[1].length - a[1].length);
for (const [k, v] of order) {
  console.log(`\n=== ${k} (${v.length}) ===`);
  console.log(JSON.stringify(v[0].text).slice(0, 200));
}

console.log("\n\n=== FULL OTHER LIST ===");
for (const r of cats['other']) {
  console.log('---', r.lesson_id, r.action, '|', r.json_path);
  console.log(r.text);
}
