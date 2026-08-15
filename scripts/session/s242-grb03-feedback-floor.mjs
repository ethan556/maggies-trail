#!/usr/bin/env node
/**
 * S242 / GRB-03 — FEEDBACK THAT SHOWS THE ARITHMETIC AND NEVER NAMES THE THEOREM.
 *
 * THE DEFECT. 26 success and fallback strings in the circle-theorem and solid-geometry templates are
 * bare calculation: `x = (4 · 6)/3 = 8.`, `PT = √(4 · 9) = 6.`, `180 − 95 = 85°.` A learner who got
 * it wrong reads the numbers being pushed around and learns nothing about WHY those numbers go
 * there. Every one is under the repository's own 25-character diagnostic floor — a floor the variant
 * gate already enforces on other engines but not on these.
 *
 * THE REPAIR NAMES THE THEOREM AND KEEPS THE ARITHMETIC. `x = (4 · 6)/3 = 8` becomes "Two chords
 * crossing inside a circle cut each other so the two products match: x = (4 · 6)/3 = 8." That is the
 * framing CLAUDE.md prescribes for copy that trips the floor, and it is the sentence a learner
 * actually needs: the calculation was never the hard part.
 *
 * EVERY REPLACEMENT IS KEYED ON THE EXACT CURRENT STRING, so each edit is explicit, reviewable and
 * reversible, and a template whose text has moved on will report a miss rather than being silently
 * skipped. No number is changed and no answer is touched.
 *
 * Run: node scripts/session/s242-grb03-feedback-floor.mjs [--check]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CHECK = process.argv.includes("--check");
const ROOT = process.cwd();
const FILE = join(ROOT, "src/lib/geometryVariantTemplates.json");

/** current text -> replacement. The theorem first, the arithmetic after the colon. */
const REPLACEMENTS = new Map(Object.entries({
  "(8π / 30π) × 360 = 96°.":
    "An arc is the same fraction of the circumference as its angle is of 360°: (8π / 30π) × 360 = 96°.",
  "180 − 95 = 85°.":
    "Opposite angles of a cyclic quadrilateral add to 180°: 180 − 95 = 85°.",
  "x = (4 · 6)/3 = 8.":
    "Two chords crossing inside a circle cut each other so the two products match: x = (4 · 6)/3 = 8.",
  "4(4 + x) = 60 ⇒ x = 11.":
    "For a secant, the whole length times the outside piece is the same for both: 4(4 + x) = 60 ⇒ x = 11.",
  "PT = √(4 · 9) = 6.":
    "A tangent squared equals the secant's whole length times its outside piece: PT = √(4 · 9) = 6.",
  "(100 + 40)/2 = 70°.":
    "An angle where two chords cross is half the SUM of the two arcs it catches: (100 + 40)/2 = 70°.",
  "(130 − 30)/2 = 50°.":
    "An angle with its vertex outside the circle is half the DIFFERENCE of the arcs: (130 − 30)/2 = 50°.",
  "x = 2(65) − 38 = 92°.":
    "Reverse the half-the-difference rule to recover the far arc: x = 2(65) − 38 = 92°.",
  "(15π/36π)(360) = 150°.":
    "A sector takes the same fraction of 360° as it does of the circle's area: (15π/36π)(360) = 150°.",
  "AB = x + y = 7.":
    "Two tangents drawn from one point are equal, so the sides split into matching pairs: AB = x + y = 7.",
  "2(x + y + z) = 24.":
    "Each tangent length is counted twice around the triangle: 2(x + y + z) = 24.",
  "140 ÷ 2 = 70°.":
    "The angle between a tangent and a chord is half the arc the chord cuts off: 140 ÷ 2 = 70°.",
  "Tangent ⊥ radius: 90°.":
    "A tangent meets the radius at the point of contact at a right angle: 90°.",
  "PT = √(17² − 8²) = 15.":
    "Tangent and radius make a right angle, so Pythagoras finishes it: PT = √(17² − 8²) = 15.",
  "180 ÷ 2 = 90°.":
    "An angle drawn on a semicircle is always a right angle — Thales: 180 ÷ 2 = 90°.",
  "PT₁ = PT₂ = 11.":
    "The two tangents from an external point are always the same length: PT₁ = PT₂ = 11.",
  "r = 3, h = 7: V = 63π.":
    "Spinning a rectangle about a side sweeps a cylinder, V = πr²h: r = 3, h = 7 gives 63π."
}));

const raw = readFileSync(FILE, "utf8");

if (CHECK) {
  /* The original must be matched as a COMPLETE json value — with its quotes — not as a substring.
   * Every replacement ENDS with the text it replaced ("…the two products match: x = (4 · 6)/3 = 8."),
   * so a substring check reports all 17 as unrepaired immediately after repairing them. */
  const remaining = [...REPLACEMENTS.keys()].filter((k) => raw.includes(JSON.stringify(k)));
  const applied = [...REPLACEMENTS.values()].filter((v) => raw.includes(JSON.stringify(v)));
  console.log(`${remaining.length === 0 ? "ok  " : "MISS"} ${applied.length}/${REPLACEMENTS.size} replacements present, ${remaining.length} original(s) still on disk`);
  if (remaining.length) for (const r of remaining) console.log(`      still terse: ${r}`);
  process.exitCode = remaining.length ? 1 : 0;
} else {
  let out = raw;
  let changed = 0;
  for (const [from, to] of REPLACEMENTS) {
    // JSON-escape both sides so the match is against the on-disk encoding, not the decoded string.
    const encodedFrom = JSON.stringify(from).slice(1, -1);
    const encodedTo = JSON.stringify(to).slice(1, -1);
    if (!out.includes(encodedFrom)) { console.error(`miss: ${from}`); continue; }
    const before = out;
    out = out.split(encodedFrom).join(encodedTo);
    if (out !== before) changed++;
  }
  // The floor exists to make feedback diagnostic; assert the result clears it rather than trusting it.
  for (const value of REPLACEMENTS.values())
    if (value.length < 25) { console.error(`replacement still under the floor: ${value}`); process.exit(1); }
  writeFileSync(FILE, out);
  console.log(`s242-grb03-feedback-floor: ${changed} template string(s) now name their theorem`);
}
