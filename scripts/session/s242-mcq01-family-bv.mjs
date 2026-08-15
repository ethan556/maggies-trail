#!/usr/bin/env node
/**
 * S242 / MCQ-01 — FIRST FAMILY: the bivariate-data items whose answer explains itself.
 *
 * THE LEAK. Four items in `bv-*` offer a correct option that carries its own explanation while every
 * distractor is a bare label:
 *
 *     Positive — y goes up as x goes up      vs   Negative · No association · Can't tell
 *
 * A learner who has never seen a scatter plot picks the option that argues for itself. The tell is
 * not length for its own sake — it is that the answer is the only option doing a different KIND of
 * thing.
 *
 * THE REPAIR MOVES THE CLAUSE AND CHANGES NO PEDAGOGY. The label becomes `Positive`; the explanation
 * moves into that option's `feedback`, which is where it belongs — a learner reads feedback AFTER
 * committing, so the sentence teaches instead of deciding. Every option ends up the same shape, and
 * nothing about which answer is correct, or why, changes.
 *
 * WHY ONLY FOUR. §9 batches MCQ review at 20–50 related items grouped by misconception family, and
 * these four are one family: reading association and prediction from bivariate data. 128 further rows
 * carry the same shape in other families and are listed in reports/mcq/MCQ_LEAKAGE_INDEX.csv —
 * they get their own batches, with the family read first.
 *
 * Run: node scripts/session/s242-mcq01-family-bv.mjs [--check]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const CHECK = process.argv.includes("--check");
const ROOT = process.cwd();

/** lesson#step -> the option label that must lose its explanation. */
const TARGETS = [
  { lesson: "bv-01-02", step: "i1" },
  { lesson: "bv-01-02", step: "k1" },
  { lesson: "bv-03-03", step: "k1" },
  { lesson: "bv-05-01", step: "ch1" }
];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && e.name.endsWith(".json")) out.push(full);
  }
  return out;
}

/* FORMAT-PRESERVING RAW EDITS, NOT A JSON ROUND-TRIP. Two of these three lesson files do not
 * re-serialise to their own on-disk formatting (one uses two-space indent, one uses one), so
 * writing them back through JSON.stringify would reformat the whole file and bury a two-word change
 * in a thousand-line diff. The edit is therefore textual and narrowly anchored: the exact label
 * string, and the feedback string that follows it inside the same option object. */
function locate(lessonId) {
  for (const file of walk(join(ROOT, "content"))) {
    const raw = readFileSync(file, "utf8");
    if (!raw.includes(`"${lessonId}"`)) continue;
    let json;
    try { json = JSON.parse(raw); } catch { continue; }
    const lesson = json.lesson ?? json;
    if (lesson?.id === lessonId) return { file, raw, lesson };
  }
  return null;
}

/** `Positive — y goes up as x goes up` -> ["Positive", "y goes up as x goes up"] */
const SPLIT = /^([^—–]{1,28}?)\s+[—–]\s+(.+)$/;
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let changed = 0;
for (const target of TARGETS) {
  const found = locate(target.lesson);
  if (!found) { console.error(`${target.lesson}: not found`); process.exit(1); }
  const step = (found.lesson.steps ?? []).find((s) => String(s.id) === target.step);
  if (!step || step.widget?.type !== "mcq") { console.error(`${target.lesson}#${target.step}: not an mcq`); process.exit(1); }
  const option = step.widget.options.find((o) => o.correct);
  if (!option) { console.error(`${target.lesson}#${target.step}: no correct option`); process.exit(1); }

  const m = SPLIT.exec(String(option.label));
  if (CHECK) {
    console.log(`${m ? "MISS" : "ok  "} ${target.lesson}#${target.step}: ${option.label}`);
    if (m) process.exitCode = 1;
    continue;
  }
  if (!m) continue; // already repaired

  const [, label, clause] = m;
  const sentence = clause.trim().replace(/[.]$/, "");
  const existing = String(option.feedback ?? "").trim();
  /* THE CLAUSE IS PROMOTED ONLY WHERE THERE IS NOWHERE ELSE FOR IT.
   *
   * The first cut appended it to the authored feedback unconditionally, and reading the result
   * settled the question: "Right — rising-to-the-right dots show a positive association — y goes up
   * as x goes up." The feedback already said it, better, and the merge produced a sentence with two
   * em-dashes saying one thing twice. In all four of these the authored feedback is the reviewed
   * explanation and the label's clause is a duplicate of it, so the repair is simply to delete the
   * duplicate from the place it was doing harm. Where an option has NO feedback the clause is
   * promoted rather than lost. */
  const merged = existing || `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;

  const asJson = (text) => JSON.stringify(text).slice(1, -1);
  let raw = found.raw;
  const labelPattern = new RegExp(`("label"\\s*:\\s*)"${escape(asJson(option.label))}"`);
  if (!labelPattern.test(raw)) { console.error(`${target.lesson}#${target.step}: label not found verbatim`); process.exit(1); }
  raw = raw.replace(labelPattern, `$1"${asJson(label.trim())}"`);
  if (!existing) {
    // No feedback to hold it: the clause becomes the feedback, appended to the option object.
    const anchor = new RegExp(`("label"\\s*:\\s*"${escape(asJson(label.trim()))}")`);
    raw = raw.replace(anchor, `$1, "feedback": "${asJson(merged)}"`);
  }
  writeFileSync(found.file, raw);
  changed++;
}

if (!CHECK) console.log(`s242-mcq01-family-bv: ${changed} option label(s) shortened, explanation moved to feedback`);
