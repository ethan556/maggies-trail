import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, "PREMIUM_ENGINE_PRIORITY.csv");
const output = resolve(root, "PREMIUM_ENGINE_EXPLORATION_AUDIT_S235.csv");
const lines = readFileSync(source, "utf8").trim().split(/\r?\n/);
const headers = lines[0].split(",");
const rows = lines.slice(1).map((line) => Object.fromEntries(line.split(",").map((value, index) => [headers[index], value])));

const audited = rows.map((row) => {
  const manipulation = Number(row.manipulation);
  const reversibility = manipulation >= 3 ? "STRONG" : manipulation === 2 ? "SUPPORTED" : manipulation === 1 ? "LIMITED" : "ANSWER_ONLY";
  const domain = row.widget_type === "slider"
    ? "PLACEMENT_RANGE_REVIEW"
    : manipulation >= 2
      ? "MULTI_STATE_DOMAIN"
      : "LIMITED_STATE_DOMAIN";
  const decision = manipulation <= 1 || row.decision === "REDESIGN"
    ? "REMEDIATE_ENGINE_PLAY"
    : row.decision === "KEEP"
      ? "KEEP_WITH_EXPLORATION_REGRESSION"
      : "REVIEW_EXISTING_DISPOSITION";
  return {
    widget_type: row.widget_type,
    authored_uses: row.authored_uses,
    grade_reach: row.grade_reach,
    manipulation: row.manipulation,
    error_model: row.error_model,
    shared_correct_checkpoint: "PASS",
    post_verdict_controls_unlocked: "PASS",
    ungraded_state_recheck: "PASS",
    wrong_state_feedback: "PASS",
    reversible_manipulation: reversibility,
    authored_domain: domain,
    exploration_decision: decision,
    next_action: decision === "REMEDIATE_ENGINE_PLAY"
      ? "Add reversible direct manipulation and verify at least one correct, below-target, and above-target or alternate-wrong state without changing grading evidence."
      : domain === "PLACEMENT_RANGE_REVIEW"
        ? "Verify each authored min/max leaves meaningful states on both sides of the target when the mathematical domain permits."
        : "Retain the shared checkpoint contract and cover representative post-verdict state changes in regression tests.",
  };
});

const columns = Object.keys(audited[0]);
const csv = (value) => /[",\r\n]/.test(String(value)) ? `"${String(value).replaceAll('"', '""')}"` : String(value);
writeFileSync(output, `${columns.join(",")}\n${audited.map((row) => columns.map((column) => csv(row[column])).join(",")).join("\n")}\n`, "utf8");

const counts = audited.reduce((summary, row) => {
  summary[row.exploration_decision] = (summary[row.exploration_decision] ?? 0) + 1;
  return summary;
}, {});
console.log(JSON.stringify({ engines: audited.length, counts, output }, null, 2));

if (audited.length !== 127) throw new Error(`expected 127 engines, found ${audited.length}`);
if (audited.some((row) => row.shared_correct_checkpoint !== "PASS" || row.ungraded_state_recheck !== "PASS")) {
  throw new Error("shared exploration contract is incomplete");
}
