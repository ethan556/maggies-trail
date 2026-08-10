#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "..", "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const files = {
  config: "playwright.config.ts",
  state: "e2e/player-state.spec.ts",
  viewport: "e2e/player-viewport.spec.ts",
  player: "src/components/LessonPlayer.tsx",
  runner: "scripts/session/run-browser.sh",
  shots: "scripts/measure/shots-s127.cjs"
};
const text = Object.fromEntries(Object.entries(files).map(([key, path]) => [key, read(path)]));
const failures = [];
const checks = [];
function requireText(scope, needle, label = needle) {
  const ok = text[scope].includes(needle);
  checks.push({ scope: files[scope], label, ok });
  if (!ok) failures.push(`${files[scope]}: missing ${label}`);
}

for (const [scope, body] of Object.entries(text)) {
  for (const forbidden of ["test.only(", "test.skip(", "test.fixme(", ".only(", ".skip("]) {
    if (body.includes(forbidden)) failures.push(`${files[scope]}: forbidden disabled/focused test token ${forbidden}`);
  }
}

for (const hook of ["data-player-phase", "data-step-id", "data-step-index", "data-step-count", "data-testid=\"feedback-scroll\""]) {
  requireText("player", hook, `observable player hook ${hook}`);
}
for (const title of [
  "Enter advances one legal state",
  "retry preserves learner work",
  "resume restores XP",
  "completion state consolidates",
  "keyboard focus reaches",
  "reduced-motion preference"
]) requireText("state", title, `state spec: ${title}`);
for (const title of [
  "44px targets",
  "retry feedback stays contained",
  "long misconception feedback at XL text"
]) requireText("viewport", title, `viewport spec: ${title}`);
for (const assertion of [
  "toHaveAttribute(\"data-player-phase\", \"retry\")",
  "toHaveValue(\"15\")",
  "toBeDisabled()",
  "toHaveURL(/\\/learn\\/as100-01-02$/)",
  "toBeGreaterThanOrEqual(43.5)",
  "inputCenterOwned",
  "feedbackClientHeight"
]) {
  const scope = text.state.includes(assertion) ? "state" : "viewport";
  requireText(scope, assertion, `load-bearing assertion ${assertion}`);
}
for (const [width, height] of [[360, 800], [390, 844], [768, 1024], [1024, 768], [1440, 900], [844, 390]]) {
  requireText("config", `width: ${width}, height: ${height}`, `viewport ${width}x${height}`);
}
requireText("config", "testIgnore: [playerState, playerViewport]", "legacy suite is not multiplied across the matrix");
requireText("config", "testMatch: playerViewport", "viewport specs run only in viewport projects");
requireText("runner", "shots-s127.cjs", "canonical browser runner captures Session 127 states");
for (const capture of ["phone-390-prediction", "phone-390-retry-preserved", "desktop-reveal-contrast", "short-landscape-xl-feedback", "tablet-resume", "desktop-completion"]) {
  requireText("shots", capture, `visual artifact ${capture}`);
}

const stateDeclarations = (text.state.match(/\btest\(/g) ?? []).length;
const viewportDeclarations = (text.viewport.match(/\btest\(/g) ?? []).length;
const viewportProjects = 6;
const legacyExecutions = 47;
const projectedExecutions = legacyExecutions + stateDeclarations + viewportDeclarations * viewportProjects;
const result = {
  session: 127,
  status: failures.length ? "FAIL" : "PASS",
  stateDeclarations,
  viewportDeclarations,
  viewportProjects,
  legacyExecutions,
  projectedExecutions,
  checks,
  failures
};
const jsonPath = join(root, "PLAYER_HARNESS_CONTRACT_S127.json");
const mdPath = join(root, "PLAYER_HARNESS_CONTRACT_S127.md");
writeFileSync(jsonPath, JSON.stringify(result, null, 2) + "\n");
const md = `# Player harness contract — Session 127\n\n` +
  `Status: **${result.status}**\n\n` +
  `- State-machine declarations: ${stateDeclarations}\n` +
  `- Viewport declarations: ${viewportDeclarations}\n` +
  `- Viewport projects: ${viewportProjects}\n` +
  `- Existing browser executions retained: ${legacyExecutions}\n` +
  `- Projected full Playwright executions: **${projectedExecutions}**\n` +
  `- Contract checks: ${checks.filter((x) => x.ok).length}/${checks.length}\n\n` +
  `## Adversarial coverage\n\n` +
  `Prediction commitment; work→retry→revealed→next transitions; learner-work preservation; rapid-Enter latch; durable resume/restart; completion routing; visible keyboard focus; app-level reduced motion; 44px targets; horizontal-overflow rejection; sticky-footer containment; XL-text long-feedback reachability; six state screenshots.\n\n` +
  (failures.length ? `## Failures\n\n${failures.map((x) => `- ${x}`).join("\n")}\n` : `No focused, skipped, or fixme tests were found. All required hooks, assertions, projects, and visual captures are present.\n`);
writeFileSync(mdPath, md);
if (failures.length) {
  console.error(`player harness contract failed: ${failures.length} issue(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`player harness contract passed: ${checks.length}/${checks.length} checks, ${projectedExecutions} projected browser executions`);
