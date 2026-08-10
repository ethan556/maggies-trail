/* S120 — hand the three starved capabilities to the lessons they were built for.
 *
 * Nothing authored is edited: only the `widget` block of one designated step per lesson is
 * replaced, and a `predict` block added where the step did not already carry one. Every step's
 * `body`, `kind`, `id`, `conceptTag`, hints and explanationVariants are captured before the edit
 * and re-checked byte-for-byte after it. Any mismatch aborts before a single file is written.
 *
 *   node scripts/convert/s120-uptake.mjs          # dry run, prints the plan
 *   node scripts/convert/s120-uptake.mjs --write  # applies
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WRITE = process.argv.includes("--write");
const ROOT = "content/courses";
const SPECS = process.argv.find((a) => a.endsWith(".json")) ?? "scripts/convert/s120-specs.json";
const { conversions } = JSON.parse(readFileSync(SPECS, "utf8"));

const FROZEN = ["id", "kind", "body", "conceptTag", "hints", "explanationVariants", "teaser", "takeaways"];
const snap = (step) => JSON.stringify(Object.fromEntries(FROZEN.map((k) => [k, step[k]])));

const planned = [];
let bad = 0;
const fail = (msg) => { console.error("  ABORT " + msg); bad++; };

for (const c of conversions) {
  const file = join(ROOT, c.dir, "lessons", c.lesson + ".json");
  const raw = readFileSync(file, "utf8");
  const lesson = JSON.parse(raw);
  const step = (lesson.steps ?? []).find((s) => s.id === c.step);

  if (!step) { fail(`${c.lesson}: no step ${c.step}`); continue; }
  if (!step.widget) { fail(`${c.lesson}/${c.step}: step has no widget`); continue; }
  if (step.widget.type !== c.oldType)
    { fail(`${c.lesson}/${c.step}: expected widget "${c.oldType}", found "${step.widget.type}" — the tree has moved under this plan`); continue; }
  // Predict-only entries add the missing commitment and leave the lab exactly as authored.
  if (!c.widget && !c.predict) { fail(`${c.lesson}/${c.step}: entry changes nothing`); continue; }
  if (step.kind !== "interactive")
    { fail(`${c.lesson}/${c.step}: predict is only legal on interactive steps, this is "${step.kind}"`); continue; }
  if (c.keepPredict && !step.predict)
    { fail(`${c.lesson}/${c.step}: plan says preserve the authored predict, but there is none`); continue; }
  if (!c.keepPredict && !c.predict && !step.predict)
    { fail(`${c.lesson}/${c.step}: no predict authored and none on disk`); continue; }
  if (!c.keepPredict && c.predict && step.predict)
    { fail(`${c.lesson}/${c.step}: a predict already exists — refusing to overwrite authored content`); continue; }

  const before = snap(step);
  const widgetBefore = JSON.stringify(step.widget);
  if (c.widget) step.widget = c.widget;
  if (c.predict) step.predict = c.predict;
  const after = snap(step);
  if (before !== after) { fail(`${c.lesson}/${c.step}: authored fields changed during the edit`); continue; }
  if (!c.widget && JSON.stringify(step.widget) !== widgetBefore)
    { fail(`${c.lesson}/${c.step}: predict-only entry altered the widget`); continue; }

  // Formatting is not uniform across the corpus (most lesson files are 1-space, a few 2-space,
  // and not all end in a newline). Re-emit each file in its OWN style so the diff is the widget
  // block and nothing else.
  const indent = (raw.split("\n")[1] ?? " ").match(/^\s*/)[0].length || 1;
  const trailingNewline = raw.endsWith("\n");
  const reprint = (obj) => JSON.stringify(obj, null, indent) + (trailingNewline ? "\n" : "");
  if (reprint(JSON.parse(raw)) !== raw)
    { fail(`${c.lesson}: re-printing the untouched file does not reproduce it byte-for-byte — refusing to reformat the corpus`); continue; }

  planned.push({ file, text: reprint(lesson), c });
  console.log(
    c.widget
      ? `  ${c.lesson}/${c.step}  ${c.oldType} -> ${c.widget.type}   ${c.capability}${c.predict ? "  +predict" : c.keepPredict ? "  (predict preserved)" : ""}`
      : `  ${c.lesson}/${c.step}  ${c.oldType} kept, +predict   ${c.capability}`
  );
}

if (bad) { console.error(`\n${bad} problem(s); nothing written.`); process.exit(1); }
if (!WRITE) { console.log(`\n${planned.length} conversions ready (dry run — pass --write to apply).`); process.exit(0); }

for (const p of planned) writeFileSync(p.file, p.text);
console.log(`\n${planned.length} lessons written.`);
