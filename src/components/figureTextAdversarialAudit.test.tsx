import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import { FIGURE_IDS } from "./figureIds";
import { FIXED_EXEMPLAR_FIGURES, figureTextBindingKey, isFigureTextAligned } from "@/lib/figureTextAlignment";
import { FIGURE_TEXT_MISMATCH_BLOCKLIST } from "@/lib/figureTextMismatchBlocklist.generated";
import { CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS } from "@/lib/figureTextMismatchBlocklist.manualHolds";

const ROOT = process.cwd();
const COURSES = join(ROOT, "content", "courses");
const FIXED_EXEMPLARS = new Set<string>(FIXED_EXEMPLAR_FIGURES);

type Row = {
  source: string;
  lesson_id: string;
  step_path: string;
  figure_id: string;
  render_decision: "RENDER" | "SUPPRESS_KNOWN_MISMATCH";
  adversarial_decision: "PASS" | "REVIEW" | "SUPPRESS_KNOWN_MISMATCH";
  risk_reasons: string;
  binding_key: string;
  illustration_description: string;
  accompanying_text: string;
};

type PendingIllustrationRow = {
  work_id: string;
  priority: "P0" | "P1";
  priority_score: string;
  workstream: "ILLUSTRATION_REPLACEMENT";
  status: "OPEN_REPLACEMENT_REQUIRED";
  source: string;
  lesson_id: string;
  step_path: string;
  current_figure_id: string;
  learner_harm: string;
  frequency: string;
  visibility: string;
  strategic_importance: string;
  mismatch_evidence: string;
  next_action: string;
};

const partNames = new Map([
  ["half", 2], ["halves", 2],
  ["third", 3], ["thirds", 3], ["fourth", 4], ["fourths", 4],
  ["fifth", 5], ["fifths", 5], ["sixth", 6], ["sixths", 6],
  ["seventh", 7], ["sevenths", 7], ["eighth", 8], ["eighths", 8],
  ["ninth", 9], ["ninths", 9], ["tenth", 10], ["tenths", 10],
]);

const numberWords = new Map([
  ["zero", 0], ["one", 1], ["two", 2], ["three", 3], ["four", 4], ["five", 5], ["six", 6],
  ["seven", 7], ["eight", 8], ["nine", 9], ["ten", 10], ["eleven", 11], ["twelve", 12],
  ["thirteen", 13], ["fourteen", 14], ["fifteen", 15], ["sixteen", 16], ["seventeen", 17],
  ["eighteen", 18], ["nineteen", 19], ["twenty", 20],
]);

const operations = {
  addition: /\badd(?:ing|ition)?\b|\bcount(?:ing)? on\b/i,
  subtraction: /\bsubtract(?:ing|ion)?\b|\btake away\b/i,
  multiplication: /\bmultiply|multiplication/i,
  division: /\bdivide|division/i,
};

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  });
}

function decode(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function description(id: string): string {
  const figure = FIGURES[id];
  if (!figure) return "";
  const svg = renderToStaticMarkup(figure());
  const aria = svg.match(/aria-label="([^"]+)"/i)?.[1] ?? "";
  const title = svg.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  return decode(`${aria} ${title}`.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function namedPartCounts(value: string): Set<number> {
  const text = value.toLowerCase();
  const result = new Set<number>();
  for (const [word, number] of partNames) if (new RegExp(`\\b${word}\\b`).test(text)) result.add(number);
  for (const match of text.matchAll(/\b(\d+)\s+(?:equal|unequal|different(?:-sized)?)?\s*(?:parts|pieces|regions|sections|shares)\b/g)) {
    result.add(Number(match[1]));
  }
  for (const [word, number] of numberWords) {
    if (new RegExp(`\\b${word}\\s+(?:equal|unequal|different(?:-sized)?)?\\s*(?:parts|pieces|regions|sections|shares)\\b`).test(text)) result.add(number);
  }
  return result;
}

function operationSet(value: string): Set<string> {
  return new Set(Object.entries(operations).filter(([, pattern]) => pattern.test(value)).map(([name]) => name));
}

function exampleNumbers(value: string): Set<number> {
  const text = value.toLowerCase();
  const result = new Set<number>();
  for (const match of text.matchAll(/(?<![a-z])[-−]?\d+(?:\.\d+)?/g)) result.add(Math.abs(Number(match[0].replace("−", "-"))));
  for (const [word, number] of numberWords) if (new RegExp(`\\b${word}\\b`).test(text)) result.add(number);
  return result;
}

function disjoint(a: Set<unknown>, b: Set<unknown>): boolean {
  return a.size > 0 && b.size > 0 && [...a].every((value) => !b.has(value));
}

function risks(figureText: string, lessonText: string): string[] {
  const found: string[] = [];
  const figureParts = namedPartCounts(figureText);
  const lessonParts = namedPartCounts(lessonText);
  const figureOperations = operationSet(figureText);
  const lessonOperations = operationSet(lessonText);
  const figureNumbers = exampleNumbers(figureText);
  const lessonNumbers = exampleNumbers(lessonText);
  if (disjoint(figureParts, lessonParts)) found.push(`PART_COUNT_CONFLICT[figure=${[...figureParts].join("+")};text=${[...lessonParts].join("+")}]`);
  if (disjoint(figureOperations, lessonOperations)) found.push(`OPERATION_CONFLICT[figure=${[...figureOperations].join("+")};text=${[...lessonOperations].join("+")}]`);
  if (figureNumbers.size >= 2 && lessonNumbers.size >= 2 && disjoint(figureNumbers, lessonNumbers)) {
    found.push(`EXAMPLE_NUMBER_CONFLICT[figure=${[...figureNumbers].join("+")};text=${[...lessonNumbers].join("+")}]`);
  }
  return found;
}

function collect(value: unknown, path: string, source: string, lessonId: string, descriptions: Map<string, string>, rows: Row[]): void {
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  if (typeof record.figure === "string") {
    const accompanyingText = [record.title, record.body, record.prompt].filter((part): part is string => typeof part === "string").join(" ");
    const illustrationDescription = descriptions.get(record.figure) ?? "";
    const aligned = isFigureTextAligned(record.figure, accompanyingText);
    const reasons = risks(illustrationDescription, accompanyingText);
    rows.push({
      source: relative(ROOT, source).replaceAll("\\", "/"),
      lesson_id: lessonId,
      step_path: path,
      figure_id: record.figure,
      render_decision: aligned ? "RENDER" : "SUPPRESS_KNOWN_MISMATCH",
      adversarial_decision: aligned ? (reasons.length ? "REVIEW" : "PASS") : "SUPPRESS_KNOWN_MISMATCH",
      risk_reasons: reasons.join("|"),
      binding_key: figureTextBindingKey(record.figure, accompanyingText),
      illustration_description: illustrationDescription,
      accompanying_text: accompanyingText,
    });
  }
  for (const [key, child] of Object.entries(record)) {
    if (key === "figure") continue;
    if (Array.isArray(child)) child.forEach((item, index) => collect(item, `${path}.${key}[${index}]`, source, lessonId, descriptions, rows));
    else collect(child, `${path}.${key}`, source, lessonId, descriptions, rows);
  }
}

function countFigurePlacements(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  const record = value as Record<string, unknown>;
  let count = typeof record.figure === "string" ? 1 : 0;
  for (const [key, child] of Object.entries(record)) {
    if (key === "figure") continue;
    if (Array.isArray(child)) count += child.reduce((total, item) => total + countFigurePlacements(item), 0);
    else count += countFigurePlacements(child);
  }
  return count;
}

function csv(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

describe("adversarial illustration and accompanying-text audit", () => {
  it("catalogues every placement and finds no unreviewed high-confidence conflict", () => {
    const descriptions = new Map(Object.keys(FIGURES).map((id) => [id, description(id)]));
    const rows: Row[] = [];
    let sourcePlacementCount = 0;
    for (const source of files(COURSES)) {
      const lesson = JSON.parse(readFileSync(source, "utf8"));
      sourcePlacementCount += countFigurePlacements(lesson.steps ?? []);
      sourcePlacementCount += countFigurePlacements(lesson.remedials ?? []);
      collect(lesson.steps ?? [], "steps", source, lesson.id ?? "", descriptions, rows);
      collect(lesson.remedials ?? [], "remedials", source, lesson.id ?? "", descriptions, rows);
    }
    rows.sort((a, b) => a.source.localeCompare(b.source) || a.step_path.localeCompare(b.step_path));
    const columns: Array<keyof Row> = ["source", "lesson_id", "step_path", "figure_id", "render_decision", "adversarial_decision", "risk_reasons", "binding_key", "illustration_description", "accompanying_text"];
    // S242. Same treatment as the queue write below: a test run regenerates a tracked audit
    // artifact only when asked to. The assertions still run every time.
    if (process.env.UPDATE_FIGURE_TEXT_AUDIT === "1") {
      writeFileSync(join(ROOT, "FIGURE_TEXT_ADVERSARIAL_AUDIT.csv"), `${columns.join(",")}\n${rows.map((row) => columns.map((column) => csv(row[column])).join(",")).join("\n")}\n`, "utf8");
    }

    // Hidden content is containment, not completion. Keep every suppressed placement in a
    // durable, individually addressable replacement queue until an aligned visual is authored.
    const suppressed = rows.filter((row) => row.render_decision === "SUPPRESS_KNOWN_MISMATCH");
    const frequencyByFigure = new Map<string, number>();
    for (const row of suppressed) frequencyByFigure.set(row.figure_id, (frequencyByFigure.get(row.figure_id) ?? 0) + 1);
    const pending = suppressed.map((row) => {
      const frequency = frequencyByFigure.get(row.figure_id) ?? 1;
      const highConfidenceConflict = /PART_COUNT_CONFLICT|OPERATION_CONFLICT/.test(row.risk_reasons);
      const learnerHarm = highConfidenceConflict ? 5 : 4;
      const visibility = row.step_path.startsWith("steps") ? 5 : 4;
      const strategicImportance = frequency >= 100 ? 5 : frequency >= 20 ? 4 : 3;
      return {
        row,
        frequency,
        learnerHarm,
        visibility,
        strategicImportance,
        score: learnerHarm * Math.min(5, Math.max(1, Math.ceil(Math.log2(frequency + 1)))) * visibility * strategicImportance,
      };
    }).sort((a, b) => b.score - a.score || a.row.source.localeCompare(b.row.source) || a.row.step_path.localeCompare(b.row.step_path));
    const pendingRows: PendingIllustrationRow[] = pending.map((item, index) => ({
      work_id: `ILL-${String(index + 1).padStart(4, "0")}`,
      priority: item.score >= 300 ? "P0" : "P1",
      priority_score: String(item.score),
      workstream: "ILLUSTRATION_REPLACEMENT",
      status: "OPEN_REPLACEMENT_REQUIRED",
      source: item.row.source,
      lesson_id: item.row.lesson_id,
      step_path: item.row.step_path,
      current_figure_id: item.row.figure_id,
      learner_harm: String(item.learnerHarm),
      frequency: String(item.frequency),
      visibility: String(item.visibility),
      strategic_importance: String(item.strategicImportance),
      mismatch_evidence: item.row.risk_reasons || "KNOWN_FIXED_EXAMPLE_MISMATCH",
      next_action: "Create or select a concept-specific illustration, then verify visible copy and accessible description before restoring it.",
    }));
    const pendingColumns: Array<keyof PendingIllustrationRow> = ["work_id", "priority", "priority_score", "workstream", "status", "source", "lesson_id", "step_path", "current_figure_id", "learner_harm", "frequency", "visibility", "strategic_importance", "mismatch_evidence", "next_action"];
    // S242. This write used to be unguarded, and it is the whole of "Trap K". It emits ONLY this
    // audit's 1,078 ILLUSTRATION_REPLACEMENT rows, under the identical 15-column header, over a
    // consolidated ledger that carries 11,487 rows across nine workstreams — so `npx vitest run`
    // silently deleted 10,409 rows of tracked source-of-truth data, and the run REPORTED PASS.
    // The file still parsed and still looked like the queue, which is why it survived so long; it
    // was caught only because someone diffed the tree afterwards. It also silently reverted
    // CLOSURE_LEDGER item CL-P1-061, whose entire subject is consolidating those nine workstreams.
    //
    // Gated behind an env flag, exactly as the blocklist write below already was. This does NOT
    // weaken the gate: the assertions at the end of this test — 3,816 rows, 1,078 suppressed,
    // 1,078 pending, every pending row OPEN_REPLACEMENT_REQUIRED — are what enforce the contract,
    // and they still run on every invocation. Changing what a test WRITES is not changing what it
    // ASSERTS. Regenerate deliberately with:
    //     UPDATE_PENDING_WORKLOAD_QUEUE=1 npx vitest run src/components/figureTextAdversarialAudit.test.tsx
    if (process.env.UPDATE_PENDING_WORKLOAD_QUEUE === "1") {
      writeFileSync(
        join(ROOT, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv"),
        `${pendingColumns.join(",")}\n${pendingRows.map((row) => pendingColumns.map((column) => csv(row[column])).join(",")).join("\n")}\n`,
        "utf8",
      );
    }

    const reviewRows = rows.filter((row) => row.adversarial_decision === "REVIEW");
    const blocklistCandidates = rows.filter((row) => row.risk_reasons.length > 0);
    const blocklistCandidateKeys = [...new Set(blocklistCandidates.map((row) => row.binding_key))].sort();
    const currentManualHoldKeys = CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS.map((hold) => hold.bindingKey);
    const nextBlocklistKeys = [...new Set([
      ...FIGURE_TEXT_MISMATCH_BLOCKLIST,
      ...blocklistCandidateKeys,
      ...currentManualHoldKeys,
    ])].sort();
    const generatedBlocklistSource = `/** Generated by the adversarial figure/text audit. Do not hand-edit. */\nexport const FIGURE_TEXT_MISMATCH_BLOCKLIST: ReadonlySet<string> = new Set(${JSON.stringify(nextBlocklistKeys, null, 2)});\n`;
    const blocklistPath = join(ROOT, "src", "lib", "figureTextMismatchBlocklist.generated.ts");
    if (process.env.UPDATE_FIGURE_TEXT_BLOCKLIST === "1") {
      /* This is intentionally monotonic. A candidate proves a key must be added; it does
       * not prove that a prior containment decision may be removed. Legacy zero-binding
       * keys remain until their own reviewed removal wave, and current manual holds are
       * re-added even if a stale generated file omitted them. */
      if (readFileSync(blocklistPath, "utf8") !== generatedBlocklistSource) {
        writeFileSync(blocklistPath, generatedBlocklistSource, "utf8");
      }
    }
    const manualHoldByKey = new Map<string, (typeof CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS)[number]>(
      CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS.map((hold) => [hold.bindingKey, hold] as const),
    );
    expect(new Set(currentManualHoldKeys).size).toBe(CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS.length);
    expect(CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS.every((hold) => hold.status === "CURRENT_MANUAL_HOLD" && hold.reason.length > 0)).toBe(true);
    expect(blocklistCandidateKeys.every((key) => FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key))).toBe(true);
    expect(currentManualHoldKeys.every((key) => FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key))).toBe(true);
    expect(readFileSync(blocklistPath, "utf8")).toBe(generatedBlocklistSource);

    for (const hold of CURRENT_FIGURE_TEXT_MISMATCH_MANUAL_HOLDS) {
      const bindings = rows.filter((row) => row.binding_key === hold.bindingKey);
      expect(bindings, `CURRENT_MANUAL_HOLD ${hold.bindingKey} must bind exactly once`).toHaveLength(1);
      expect(bindings[0]).toMatchObject({
        source: hold.source,
        lesson_id: hold.lessonId,
        step_path: hold.stepPath,
        figure_id: hold.figureId,
        binding_key: hold.bindingKey,
      });
      expect(bindings[0].risk_reasons).toBe("");
    }
    /* A non-candidate key is retained only when it is unused or is one of the two
     * source-controlled live holds. This prevents a broad historical list from
     * silently becoming a new suppression authority. */
    for (const key of [...FIGURE_TEXT_MISMATCH_BLOCKLIST].filter((key) => !blocklistCandidateKeys.includes(key))) {
      const bindings = rows.filter((row) => row.binding_key === key);
      const hold = manualHoldByKey.get(key);
      if (bindings.length === 0) {
        expect(hold).toBeUndefined();
        continue;
      }
      expect(hold, `current non-candidate binding ${key} needs a CURRENT_MANUAL_HOLD`).toBeDefined();
      if (!hold) throw new Error(`Missing CURRENT_MANUAL_HOLD for ${key}`);
      expect(bindings).toHaveLength(1);
      expect(bindings[0]).toMatchObject({
        source: hold.source,
        lesson_id: hold.lessonId,
        step_path: hold.stepPath,
        figure_id: hold.figureId,
        binding_key: hold.bindingKey,
      });
      expect(bindings[0].risk_reasons).toBe("");
    }

    expect(pendingRows).toHaveLength(suppressed.length);
    expect(pendingRows.every((row) => row.status === "OPEN_REPLACEMENT_REQUIRED")).toBe(true);
    expect(pendingRows.map((row) => row.work_id)).toEqual(
      pendingRows.map((_, index) => `ILL-${String(index + 1).padStart(4, "0")}`),
    );
    expect(suppressed.every((row) => FIXED_EXEMPLARS.has(row.figure_id) || FIGURE_TEXT_MISMATCH_BLOCKLIST.has(row.binding_key))).toBe(true);
    const adversariallyBlocked = rows.filter((row) => FIGURE_TEXT_MISMATCH_BLOCKLIST.has(row.binding_key));
    expect(adversariallyBlocked.every((row) => row.risk_reasons.length > 0 || manualHoldByKey.has(row.binding_key))).toBe(true);
    expect(reviewRows, "review FIGURE_TEXT_ADVERSARIAL_AUDIT.csv").toEqual([]);
  });
});
