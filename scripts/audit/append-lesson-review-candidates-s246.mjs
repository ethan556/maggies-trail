#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority, resolveLessonDecisionLedger } from "./lesson-review-authority-s246.mjs";

const MAX_CANDIDATE_FILES = 20;
const MAX_RECORDS = 250;
const MAX_TOTAL_BYTES = 5 * 1024 * 1024;

function parseJsonl(raw, source) {
  return raw.split(/\r?\n/).flatMap((line, index) => {
    if (!line.trim()) return [];
    try { return [{ value: JSON.parse(line), line: index + 1 }]; }
    catch (error) { throw new Error(`${source}:${index + 1} is not valid JSON: ${error.message}`); }
  });
}

function countBy(records, field) {
  return Object.fromEntries([...new Set(records.map((record) => String(record[field])))].sort().map((value) => [
    value,
    records.filter((record) => String(record[field]) === value).length
  ]));
}

export function planLessonReviewAppend({ ledgerRaw, candidateSources, lessons, maxRecords = MAX_RECORDS }) {
  if (!Array.isArray(candidateSources) || candidateSources.length === 0) throw new Error("At least one candidate JSONL path is required");
  if (candidateSources.length > MAX_CANDIDATE_FILES) throw new Error(`At most ${MAX_CANDIDATE_FILES} candidate files may be merged at once`);
  const ledgerEntries = parseJsonl(ledgerRaw, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
  const schema = ledgerEntries[0]?.value;
  if (schema?.recordType !== "schema" || schema?.schemaVersion !== 1) throw new Error("The authoritative ledger must begin with the S244 schema record");
  const requiredFields = ["recordType", ...(schema.contract?.requiredDecisionFields ?? [])].sort();
  const knownLessons = new Set(lessons.map((lesson) => lesson.lessonId));
  const ledgerDispositions = ledgerEntries.slice(1).filter((entry) => entry.value.recordType === "lesson-disposition");
  const ledgerRecordIds = new Set(ledgerDispositions.map((entry) => String(entry.value.recordId)));
  const batchRecordIds = new Set();
  const batchLessonIds = new Set();
  const records = [];

  for (const source of candidateSources) {
    const entries = parseJsonl(source.raw, source.path);
    if (entries.length === 0) throw new Error(`${source.path} contains no candidate records`);
    for (const entry of entries) {
      const record = entry.value;
      const where = `${source.path}:${entry.line}`;
      if (!record || Array.isArray(record) || typeof record !== "object" || record.recordType !== "lesson-disposition") {
        throw new Error(`${where} must be exactly one lesson-disposition object`);
      }
      const actualFields = Object.keys(record).sort();
      if (actualFields.length !== requiredFields.length || actualFields.some((field, index) => field !== requiredFields[index])) {
        throw new Error(`${where} fields must exactly match the authoritative lesson-disposition contract`);
      }
      const recordId = String(record.recordId);
      const lessonId = String(record.lessonId);
      if (!knownLessons.has(lessonId)) throw new Error(`${where} references unknown lesson ${lessonId}`);
      if (ledgerRecordIds.has(recordId)) throw new Error(`${where} recordId ${recordId} already exists in the authoritative ledger`);
      if (batchRecordIds.has(recordId)) throw new Error(`${where} duplicates recordId ${recordId} within this batch`);
      if (batchLessonIds.has(lessonId)) throw new Error(`${where} duplicates lessonId ${lessonId} within this batch`);
      batchRecordIds.add(recordId);
      batchLessonIds.add(lessonId);
      records.push(record);
      if (records.length > maxRecords) throw new Error(`Batch exceeds the bounded limit of ${maxRecords} records`);
    }
  }

  const prefix = ledgerRaw.length === 0 || ledgerRaw.endsWith("\n") ? ledgerRaw : `${ledgerRaw}\n`;
  const appendedText = records.map((record) => JSON.stringify(record)).join("\n") + "\n";
  const combinedRaw = prefix + appendedText;
  const resolution = resolveLessonDecisionLedger({ lessons, raw: combinedRaw });
  for (const record of records) {
    const disposition = resolution.byLesson.get(String(record.lessonId));
    if (disposition?.status !== "CURRENT_HUMAN_DECISION" || disposition.record?.recordId !== record.recordId) {
      const errors = disposition?.errors?.length ? ` (${disposition.errors.join(", ")})` : "";
      throw new Error(`${record.recordId}/${record.lessonId} does not resolve to CURRENT_HUMAN_DECISION: ${disposition?.status ?? "UNKNOWN"}${errors}`);
    }
  }
  return {
    records,
    appendedText,
    combinedRaw,
    summary: {
      candidateFiles: candidateSources.map((source) => source.path),
      recordCount: records.length,
      ledgerHistoryBefore: ledgerDispositions.length,
      ledgerHistoryAfter: ledgerDispositions.length + records.length,
      decision: countBy(records, "decision"),
      visualDecision: countBy(records, "visualDecision"),
      gradeLanguageDecision: countBy(records, "gradeLanguageDecision")
    }
  };
}

function parseArgs(argv) {
  let check = false;
  const paths = [];
  for (const arg of argv) {
    if (arg === "--check") check = true;
    else if (arg.startsWith("--")) throw new Error(`Unknown option ${arg}`);
    else paths.push(arg);
  }
  if (paths.length === 0) throw new Error("Usage: node scripts/audit/append-lesson-review-candidates-s246.mjs [--check] <candidate.jsonl> [...]");
  return { check, paths };
}

export function runCli(argv, root = process.cwd()) {
  const { check, paths } = parseArgs(argv);
  const resolved = paths.map((candidatePath) => {
    const absolute = path.resolve(root, candidatePath);
    const relative = path.relative(root, absolute).replaceAll(path.sep, "/");
    if (relative === ".." || relative.startsWith("../") || path.isAbsolute(relative)) throw new Error(`Candidate path must stay within the repository: ${candidatePath}`);
    if (path.extname(absolute).toLowerCase() !== ".jsonl") throw new Error(`Candidate path must be JSONL: ${candidatePath}`);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`Candidate file not found: ${candidatePath}`);
    return { path: relative, absolute, raw: fs.readFileSync(absolute, "utf8") };
  });
  const totalBytes = resolved.reduce((total, source) => total + Buffer.byteLength(source.raw), 0);
  if (totalBytes > MAX_TOTAL_BYTES) throw new Error(`Candidate inputs exceed the bounded ${MAX_TOTAL_BYTES}-byte limit`);
  const ledgerPath = path.join(root, "reports", "closure", "LESSON_REVIEW_DECISIONS_S244.jsonl");
  const ledgerRaw = fs.readFileSync(ledgerPath, "utf8");
  const authority = loadLessonReviewAuthority(root);
  const plan = planLessonReviewAppend({ ledgerRaw, candidateSources: resolved, lessons: authority.lessons });
  if (!check) fs.appendFileSync(ledgerPath, `${ledgerRaw.endsWith("\n") ? "" : "\n"}${plan.appendedText}`);
  const output = { mode: check ? "check" : "append", ...plan.summary };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runCli(process.argv.slice(2)); }
  catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
