#!/usr/bin/env node
/**
 * Read-only Phase 2 semantic-representation migration inventory.
 *
 * Default mode emits the complete deterministic source inventory to stdout. `--check` takes two
 * complete snapshots, validates the schema, and fails if source changed or the inventory differs.
 * It writes no report: this foundation intentionally leaves queues, cards, cache, and reviewer
 * authority untouched.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  SemanticRepresentationInventorySchema,
  type SemanticRepresentationInventory,
  type SemanticRepresentationInventoryRecord,
} from "../../src/lib/semanticRepresentation";

type JsonRecord = Record<string, unknown>;

export type SemanticRepresentationSourceInput = {
  path: string;
  source: string;
};

const normalized = (value: string): string => value.replaceAll("\\", "/");
const isRecord = (value: unknown): value is JsonRecord => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const sha256 = (value: string | Buffer): string => createHash("sha256").update(value).digest("hex");

function jsonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) return jsonFiles(file);
      return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
    });
}

function sourceInputs(root: string): SemanticRepresentationSourceInput[] {
  const courses = join(root, "content", "courses");
  return jsonFiles(courses)
    .filter((file) => dirname(file).endsWith("lessons"))
    .map((file) => ({ path: normalized(relative(root, file)), source: readFileSync(file, "utf8") }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${label} must be a non-empty string`);
  return value;
}

function courseIdFor(sourcePath: string): string {
  const parts = sourcePath.split("/");
  const index = parts.indexOf("courses");
  const courseId = index >= 0 ? parts[index + 1] : undefined;
  return requiredString(courseId, `${sourcePath}: course id`);
}

function panelSurface(widgetType: string): "widget-panel" | "stepped-reveal-panel" {
  return widgetType === "steppedReveal" ? "stepped-reveal-panel" : "widget-panel";
}

function addStepRecords(
  records: SemanticRepresentationInventoryRecord[],
  sourcePath: string,
  courseId: string,
  lessonId: string,
  location: SemanticRepresentationInventoryRecord["location"],
  step: JsonRecord,
  index: number,
): void {
  const stepId = requiredString(step.id, `${sourcePath}: ${location} step ${index} id`);
  const stepKind = requiredString(step.kind, `${sourcePath}: ${location}/${stepId} kind`);
  const base = { sourcePath, courseId, lessonId, location, stepId, stepKind };
  records.push({ ...base, surface: "instructional-step", state: "present" });

  if (!("figure" in step) || step.figure === undefined) {
    records.push({ ...base, surface: "figure", state: "absent" });
  } else if (typeof step.figure === "string" && step.figure.trim() !== "") {
    records.push({ ...base, surface: "figure", state: "present", reference: step.figure });
  } else {
    records.push({ ...base, surface: "figure", state: "malformed" });
  }

  if (!("widget" in step) || step.widget === undefined) {
    records.push({ ...base, surface: "widget", state: "absent" });
    return;
  }
  if (!isRecord(step.widget) || typeof step.widget.type !== "string" || step.widget.type.trim() === "") {
    records.push({ ...base, surface: "widget", state: "malformed" });
    return;
  }

  const widget = step.widget;
  const widgetType = requiredString(widget.type, `${sourcePath}: ${location}/${stepId} widget type`);
  records.push({ ...base, surface: "widget", state: "present", reference: widgetType });
  const surface = panelSurface(widgetType);
  if (!("panels" in widget)) {
    if (surface === "stepped-reveal-panel") records.push({ ...base, surface, state: "absent", reference: widgetType });
    return;
  }
  if (!Array.isArray(widget.panels)) {
    records.push({ ...base, surface, state: "malformed", reference: widgetType });
    return;
  }
  for (const [panelIndex, panel] of widget.panels.entries()) {
    records.push({
      ...base,
      surface,
      state: isRecord(panel) ? "present" : "malformed",
      reference: widgetType,
      panelIndex,
    });
  }
}

function sortRecords(records: SemanticRepresentationInventoryRecord[]): SemanticRepresentationInventoryRecord[] {
  return records.sort((left, right) =>
    left.sourcePath.localeCompare(right.sourcePath)
    || left.location.localeCompare(right.location)
    || left.stepId.localeCompare(right.stepId)
    || left.surface.localeCompare(right.surface)
    || (left.panelIndex ?? -1) - (right.panelIndex ?? -1),
  );
}

/** Pure deterministic inventory builder, exported for focused migration tests. */
export function inventoryFromSourceInputs(inputs: readonly SemanticRepresentationSourceInput[]): SemanticRepresentationInventory {
  const files = [...inputs]
    .map(({ path, source }) => ({ path: normalized(path), source }))
    .sort((left, right) => left.path.localeCompare(right.path));
  const records: SemanticRepresentationInventoryRecord[] = [];
  const seal = createHash("sha256");

  for (const file of files) {
    seal.update(file.path);
    seal.update("\0");
    seal.update(file.source);
    seal.update("\0");
    const lesson = JSON.parse(file.source) as unknown;
    if (!isRecord(lesson)) throw new Error(`${file.path}: lesson JSON must be an object`);
    const lessonId = requiredString(lesson.id, `${file.path}: lesson id`);
    const courseId = courseIdFor(file.path);
    if (!Array.isArray(lesson.steps)) throw new Error(`${file.path}: lesson steps must be an array`);
    lesson.steps.forEach((step, index) => {
      if (!isRecord(step)) throw new Error(`${file.path}: main step ${index} must be an object`);
      addStepRecords(records, file.path, courseId, lessonId, "main", step, index);
    });
    if (lesson.remedials === undefined) continue;
    if (!Array.isArray(lesson.remedials)) throw new Error(`${file.path}: remedials must be an array when declared`);
    lesson.remedials.forEach((route, routeIndex) => {
      if (!isRecord(route)) throw new Error(`${file.path}: remedial ${routeIndex} must be an object`);
      for (const [key, location] of [["concept", "remedial-concept"], ["check", "remedial-check"]] as const) {
        if (route[key] === undefined) continue;
        if (!isRecord(route[key])) throw new Error(`${file.path}: remedial ${routeIndex}/${key} must be an object`);
        addStepRecords(records, file.path, courseId, lessonId, location, route[key], routeIndex);
      }
    });
  }

  const sorted = sortRecords(records);
  const countMap = new Map<string, number>();
  for (const record of sorted) {
    const key = [record.location, record.stepKind, record.surface, record.state].join("\0");
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }
  const counts = [...countMap.entries()]
    .map(([key, count]) => {
      const [location, stepKind, surface, state] = key.split("\0");
      return { location, stepKind, surface, state, count };
    })
    .sort((left, right) =>
      left.location.localeCompare(right.location)
      || left.stepKind.localeCompare(right.stepKind)
      || left.surface.localeCompare(right.surface)
      || left.state.localeCompare(right.state),
    );

  return SemanticRepresentationInventorySchema.parse({
    version: 1,
    sourceSeal: {
      algorithm: "sha256",
      sourceRoot: "content/courses",
      fileCount: files.length,
      sha256: seal.digest("hex"),
      files: files.map((file) => ({ path: file.path, sha256: sha256(file.source) })),
    },
    records: sorted,
    counts,
  });
}

export function collectSemanticRepresentationInventory(root = process.cwd()): SemanticRepresentationInventory {
  return inventoryFromSourceInputs(sourceInputs(resolve(root)));
}

function inventoryDigest(inventory: SemanticRepresentationInventory): string {
  return sha256(JSON.stringify(inventory));
}

function check(root: string): void {
  const first = collectSemanticRepresentationInventory(root);
  const second = collectSemanticRepresentationInventory(root);
  const firstJson = JSON.stringify(first);
  const secondJson = JSON.stringify(second);
  if (firstJson !== secondJson) throw new Error("semantic-representation inventory changed between sealed source reads");
  process.stdout.write(`${JSON.stringify({
    mode: "check",
    status: "CURRENT",
    sourceSeal: {
      sourceRoot: first.sourceSeal.sourceRoot,
      fileCount: first.sourceSeal.fileCount,
      sha256: first.sourceSeal.sha256,
    },
    inventorySha256: inventoryDigest(first),
    recordCount: first.records.length,
    measuredCounts: first.counts,
  }, null, 2)}\n`);
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--check")) throw new Error("Usage: npx tsx scripts/audit/semantic-representation-inventory.mts [--check]");
  if (args.includes("--check")) {
    check(process.cwd());
    return;
  }
  process.stdout.write(`${JSON.stringify(collectSemanticRepresentationInventory(process.cwd()), null, 2)}\n`);
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (entry === import.meta.url) main();
