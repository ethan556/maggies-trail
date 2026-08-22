#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { loadLessonReviewAuthority } from "./lesson-review-authority-s246.mjs";

const root = process.cwd();
const candidatePath = path.join(root, "reports/closure/candidates/S251_REMAINING_COARSE_STANDARDS_ONLY_LESSON_SUPERSESSIONS.jsonl");
const records = fs.readFileSync(candidatePath, "utf8").trim().split(/\r?\n/).map(JSON.parse);
const authority = loadLessonReviewAuthority(root);
if (records.length !== 53 || authority.lessonDecisions.summary.historyRecordCount !== 339
  || authority.lessonDecisions.summary.currentCount !== 170 || authority.lessonDecisions.summary.staleCount !== 57
  || authority.lessonDecisions.summary.invalidCount !== 0 || authority.lessonDecisions.summary.duplicateRecordIdCount !== 0) {
  throw new Error(`Postappend authority drift: ${JSON.stringify(authority.lessonDecisions.summary)}`);
}
for (const record of records) {
  const current = authority.lessonDecisions.byLesson.get(record.lessonId);
  if (current?.status !== "CURRENT_HUMAN_DECISION" || current.record?.recordId !== record.recordId
    || JSON.stringify(current.record) !== JSON.stringify(record)) throw new Error(`${record.lessonId}: supersession is not exact current authority`);
}
console.log(JSON.stringify({ status: "PASS", records: records.length, ...authority.lessonDecisions.summary }, null, 2));
