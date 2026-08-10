import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const COURSE_ROOT = join(ROOT, "content", "courses");
const SOURCE_ROOT = join(ROOT, "src");
const capabilities = JSON.parse(readFileSync(join(ROOT, "scripts", "engine-capabilities.json"), "utf8"));
const caps = capabilities.types ?? capabilities;

function walk(dir, predicate = () => true) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path, predicate));
    else if (predicate(path)) out.push(path);
  }
  return out;
}

function csvCell(value) {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeCsv(name, rows, columns) {
  const lines = [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))];
  writeFileSync(join(ROOT, name), `${lines.join("\n")}\n`);
}

function allSteps(lesson) {
  const steps = [...(lesson.steps ?? [])];
  for (const remedial of lesson.remedials ?? []) {
    if (remedial.concept) steps.push({ ...remedial.concept, _remedial: true });
    if (remedial.check) steps.push({ ...remedial.check, _remedial: true });
  }
  return steps;
}

const lessons = [];
for (const courseDir of readdirSync(COURSE_ROOT)) {
  const coursePath = join(COURSE_ROOT, courseDir, "course.json");
  const lessonsPath = join(COURSE_ROOT, courseDir, "lessons");
  if (!existsSync(coursePath) || !existsSync(lessonsPath)) continue;
  const course = JSON.parse(readFileSync(coursePath, "utf8"));
  for (const file of readdirSync(lessonsPath).filter((name) => name.endsWith(".json"))) {
    const path = join(lessonsPath, file);
    const lesson = JSON.parse(readFileSync(path, "utf8"));
    lessons.push({ course, lesson, path, steps: allSteps(lesson) });
  }
}

const misconceptionRules = [
  ["sign-direction", /sign|negative|positive|direction|left instead|right instead/i],
  ["operation-swap", /add(?:ed|ing)? instead|subtract(?:ed|ing)? instead|multipl(?:y|ied).*instead|divid(?:e|ed).*instead|wrong operation/i],
  ["place-value", /place value|ones|tens|hundreds|decimal place|regroup|carry|borrow/i],
  ["fraction-denominator", /denominator|numerator|common denominator|reciprocal/i],
  ["exponent-rule", /exponent|power|squared|cubed|base.*power|multiply.*powers/i],
  ["inverse-confusion", /inverse|undo|opposite operation|backwards/i],
  ["unit-conversion", /unit|convert|centimeter|meter|inch|feet|degree/i],
  ["boundary-endpoint", /endpoint|boundary|lower limit|upper limit|subtract the value/i],
  ["rate-vs-start", /slope|rate|start(?:ing)? value|intercept/i],
  ["inside-vs-derivative", /derivative of the inside|inside function|du|chain rule/i],
  ["representation-read", /read the graph|axis|row|column|table|coordinate/i]
];

function misconceptionId(option) {
  const source = `${option.label ?? ""} ${option.feedback ?? ""}`;
  const matched = misconceptionRules.find(([, pattern]) => pattern.test(source))?.[0];
  if (matched) return matched;
  const feedback = String(option.feedback ?? "").trim();
  if (feedback.length >= 24 && !/^(no|not quite|try again|incorrect)[.!]?$/i.test(feedback)) return "authored-specific-rationale";
  return "unmapped-review";
}

function punctuationSignature(text) {
  return [...new Set((text.match(/[.!?;:—–]/g) ?? []))].sort().join("");
}

const mcqRows = [];
for (const { course, lesson, path, steps } of lessons) {
  for (const step of steps) {
    if (step.widget?.type !== "mcq") continue;
    const options = step.widget.options ?? [];
    const correct = options.find((option) => option.correct);
    if (!correct) continue;
    const wrong = options.filter((option) => !option.correct);
    const correctLength = String(correct.label ?? "").trim().length;
    const longestWrong = Math.max(0, ...wrong.map((option) => String(option.label ?? "").trim().length));
    const correctPunctuation = punctuationSignature(String(correct.label ?? ""));
    const wrongPunctuation = new Set(wrong.map((option) => punctuationSignature(String(option.label ?? ""))));
    const longestLeak = correctLength >= Math.max(longestWrong + 18, Math.ceil(longestWrong * 1.35));
    const punctuationLeak = Boolean(correctPunctuation) && !wrongPunctuation.has(correctPunctuation);
    const mapped = wrong.map(misconceptionId);
    const unmapped = mapped.filter((id) => id === "unmapped-review").length;
    const blindGuessRisk = longestLeak || punctuationLeak ? "FAIL" : "PASS";
    const distractorQuality = unmapped === 0 ? "PASS" : unmapped === wrong.length ? "FAIL" : "REVIEW";
    mcqRows.push({
      course_id: course.id,
      grade: course.gradeLevel,
      lesson_id: lesson.id,
      step_id: step.id,
      remedial: step._remedial ? "yes" : "no",
      source: relative(ROOT, path).replaceAll("\\", "/"),
      prompt: step.widget.prompt,
      correct_option: correct.label,
      correct_length: correctLength,
      longest_wrong_length: longestWrong,
      longest_option_leak: longestLeak ? "yes" : "no",
      punctuation_leak: punctuationLeak ? "yes" : "no",
      blind_guess_test: blindGuessRisk,
      distractor_taxonomy: mapped.join("|"),
      unmapped_distractors: unmapped,
      distractor_quality: distractorQuality,
      decision: blindGuessRisk === "FAIL" || distractorQuality === "FAIL" ? "REMEDIATE" : distractorQuality === "REVIEW" ? "HUMAN_REVIEW" : "KEEP"
    });
  }
}

const predictionRows = [];
for (const { course, lesson, path, steps } of lessons) {
  for (const step of steps) {
    if (!step.predict) continue;
    const type = step.widget?.type ?? "none";
    const c = caps[type] ?? {};
    const direct = (c.manip ?? 0) >= 2 && (c.conseq ?? 0) >= 2;
    const duplicatesTask = step.widget?.prompt && String(step.predict.prompt).trim().toLowerCase() === String(step.widget.prompt).trim().toLowerCase();
    const hasOutcome = Boolean(step.predict.outcomeId && (step.predict.options ?? []).some((option) => option.id === step.predict.outcomeId));
    const hasReveal = Boolean(String(step.predict.reveal ?? "").trim());
    let decision = "KEEP";
    let reason = "Prediction precedes a direct causal model, retains the learner choice, and explains the observed outcome.";
    if (!direct || duplicatesTask) {
      decision = "REMOVE";
      reason = !direct ? "The attached surface does not meet the direct-manipulation and visible-consequence threshold." : "The prediction duplicates the task prompt instead of predicting an outcome.";
    } else if (!hasOutcome || !hasReveal) {
      decision = "REFRAME";
      reason = "The causal model is suitable, but the prediction needs a deterministic outcome and explanatory reveal.";
    }
    predictionRows.push({
      course_id: course.id,
      grade: course.gradeLevel,
      lesson_id: lesson.id,
      step_id: step.id,
      source: relative(ROOT, path).replaceAll("\\", "/"),
      widget_type: type,
      prompt: step.predict.prompt,
      option_count: (step.predict.options ?? []).length,
      outcome_id: step.predict.outcomeId ?? "",
      reveal_present: hasReveal ? "yes" : "no",
      direct_causal_surface: direct ? "yes" : "no",
      duplicates_task: duplicatesTask ? "yes" : "no",
      decision,
      reason
    });
  }
}

const sourceFiles = walk(SOURCE_ROOT, (path) => /\.(tsx?|jsx?)$/.test(path) && !/\.(?:test|spec)\.[jt]sx?$/.test(path));
const rangeRows = [];
for (const path of sourceFiles) {
  const source = readFileSync(path, "utf8");
  const lines = source.split(/\r?\n/);
  for (const match of source.matchAll(/<input\b[\s\S]{0,700}?type\s*=\s*["']range["'][\s\S]{0,700}?>/g)) {
    const index = source.slice(0, match.index).split(/\r?\n/).length - 1;
    const before = lines.slice(Math.max(0, index - 80), index + 1).join("\n");
    const after = lines.slice(index, Math.min(lines.length, index + 80)).join("\n");
    const context = `${before}\n${after}`;
    const names = [...before.matchAll(/(?:export\s+)?function\s+([A-Z][A-Za-z0-9_]*)|(?:export\s+)?const\s+([A-Z][A-Za-z0-9_]*)\s*(?::[^=]+)?=/g)];
    const latestName = names.at(-1);
    const component = latestName?.[1] ?? latestName?.[2] ?? "module-scope";
    const pointer = /onPointer(?:Down|Move|Up)|setPointerCapture|drag/i.test(context);
    const svg = /<svg\b/i.test(context);
    const rangeCount = (context.match(/type=["']range["']/g) ?? []).length;
    const decision = pointer && svg ? "HYBRID" : rangeCount > 1 ? "DIRECT" : "KEEP-SLIDER";
    rangeRows.push({
      source: relative(ROOT, path).replaceAll("\\", "/"),
      line: index + 1,
      component,
      aria_or_label: (match[0].match(/aria-label\s*=\s*["'{]([^"'}]+)/)?.[1] ?? match[0].replace(/\s+/g, " ").trim()).slice(0, 180),
      nearby_range_count: rangeCount,
      svg_present: svg ? "yes" : "no",
      pointer_drag_present: pointer ? "yes" : "no",
      decision,
      rationale: decision === "HYBRID" ? "Direct object manipulation exists; retain the slider as an accessible precision fallback." : decision === "DIRECT" ? "Multiple parameter sliders dominate the model; prototype direct handles with keyboard-equivalent controls." : "A single continuous variable is an honest slider task; retain with target-size, labels, and keyboard checks."
    });
  }
}

const figureUsage = new Map();
for (const { course, lesson, path, steps } of lessons) {
  for (const step of steps) {
    if (!step.figure) continue;
    const list = figureUsage.get(step.figure) ?? [];
    list.push({ course: course.id, grade: course.gradeLevel, lesson: lesson.id, step: step.id, source: path });
    figureUsage.set(step.figure, list);
  }
}
const visualRows = [...figureUsage.entries()].map(([figure, uses]) => {
  const gradeSpan = [...new Set(uses.map((use) => use.grade))].sort((a, b) => Number(a) - Number(b));
  const count = uses.length;
  const priority = count >= 25 ? "P0" : count >= 10 ? "P1" : count >= 3 ? "P2" : "P3";
  return {
    figure_id: figure,
    authored_uses: count,
    grade_span: gradeSpan.join("|"),
    sample_lessons: uses.slice(0, 6).map((use) => `${use.lesson}:${use.step}`).join("|"),
    current_role: "concept-support",
    priority,
    decision: count >= 10 ? "REDESIGN_OR_VALIDATE_AT_SCALE" : "VALIDATE",
    requirement: "Verify 390/768/1440 light/dark; preserve labels and relationships; prefer SVG/vector source and meaningful alt text."
  };
}).sort((a, b) => b.authored_uses - a.authored_uses || a.figure_id.localeCompare(b.figure_id));

const mathSignal = /[=<>±×÷√∫∑πθΔ∞²³⁴⁵⁶⁷⁸⁹]|\^\s*[{(]?[-+\w]|\b(?:sqrt|sin|cos|tan|log|ln|lim|dx|dy|du)\b|\d\s*\/\s*\d/i;
const denseMath = /(?:=|→|⇒).*(?:=|→|⇒)|∫|∑|\blim\b|\{.*\}|\\frac/i;
const asciiMath = /\^|\b(?:sqrt|pi)\b|<=|>=|->|\*|\d\s*\/\s*\d/i;
const mathRows = [];
function collectStrings(value, path = "", out = []) {
  if (typeof value === "string") out.push({ path, value });
  else if (Array.isArray(value)) value.forEach((item, index) => collectStrings(item, `${path}[${index}]`, out));
  else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) collectStrings(child, path ? `${path}.${key}` : key, out);
  return out;
}
for (const { course, lesson, path } of lessons) {
  for (const item of collectStrings(lesson)) {
    if (!mathSignal.test(item.value)) continue;
    const mathChars = (item.value.match(/[=<>±×÷√∫∑πθΔ∞²³⁴⁵⁶⁷⁸⁹^*/]/g) ?? []).length;
    const classification = denseMath.test(item.value) || mathChars >= 5 ? "C" : asciiMath.test(item.value) ? "B" : mathChars >= 1 ? "A" : "D";
    mathRows.push({
      course_id: course.id,
      grade: course.gradeLevel,
      lesson_id: lesson.id,
      json_path: item.path,
      source: relative(ROOT, path).replaceAll("\\", "/"),
      classification,
      ascii_notation_risk: asciiMath.test(item.value) ? "yes" : "no",
      display_recommended: classification === "C" ? "yes" : "no",
      text: item.value,
      action: classification === "C" ? "DISPLAY_MATH" : classification === "B" ? "INLINE_MATH" : "MATH_PROSE_OK"
    });
  }
}

const usage = new Map();
const gradesByType = new Map();
for (const { course, steps } of lessons) {
  for (const step of steps) {
    const type = step.widget?.type;
    if (!type) continue;
    usage.set(type, (usage.get(type) ?? 0) + 1);
    const grades = gradesByType.get(type) ?? new Set();
    grades.add(String(course.gradeLevel));
    gradesByType.set(type, grades);
  }
}
const engineRows = [...new Set([...Object.keys(caps), ...usage.keys()])].map((type) => {
  const c = caps[type] ?? {};
  const count = usage.get(type) ?? 0;
  const frequency = count >= 100 ? 5 : count >= 40 ? 4 : count >= 15 ? 3 : count >= 4 ? 2 : 1;
  const direct = (c.manip ?? 0) >= 2;
  const consequence = (c.conseq ?? 0) >= 2;
  const harm = !consequence ? 5 : !direct ? 4 : (c.err ?? 0) < 2 ? 3 : 2;
  const visibility = direct || consequence ? 5 : 3;
  const gradeReach = gradesByType.get(type)?.size ?? 0;
  const strategic = gradeReach >= 5 ? 5 : gradeReach >= 3 ? 4 : count > 0 ? 3 : 1;
  const priorityScore = harm * frequency * visibility * strategic;
  let decision = "POLISH";
  if (count === 0) decision = "DEPRECATE_CANDIDATE";
  else if (!direct || !consequence) decision = "REDESIGN";
  else if ((c.a11y ?? 0) >= 2 && (c.mobile ?? 0) >= 2 && (c.polish ?? 0) >= 2) decision = "KEEP";
  return {
    widget_type: type,
    authored_uses: count,
    grade_reach: gradeReach,
    manipulation: c.manip ?? 0,
    consequence: c.conseq ?? 0,
    error_model: c.err ?? 0,
    adaptive: c.adapt ?? 0,
    accessibility: c.a11y ?? 0,
    mobile: c.mobile ?? 0,
    polish: c.polish ?? 0,
    learner_harm: harm,
    frequency,
    visibility,
    strategic_importance: strategic,
    priority_product: priorityScore,
    decision
  };
}).sort((a, b) => b.priority_product - a.priority_product || b.authored_uses - a.authored_uses || a.widget_type.localeCompare(b.widget_type));

writeCsv("MCQ_DISTRACTOR_AUDIT.csv", mcqRows, ["course_id", "grade", "lesson_id", "step_id", "remedial", "source", "prompt", "correct_option", "correct_length", "longest_wrong_length", "longest_option_leak", "punctuation_leak", "blind_guess_test", "distractor_taxonomy", "unmapped_distractors", "distractor_quality", "decision"]);
writeCsv("PREDICTION_GATE_AUDIT.csv", predictionRows, ["course_id", "grade", "lesson_id", "step_id", "source", "widget_type", "prompt", "option_count", "outcome_id", "reveal_present", "direct_causal_surface", "duplicates_task", "decision", "reason"]);
writeCsv("DIRECT_MANIPULATION_AUDIT.csv", rangeRows, ["source", "line", "component", "aria_or_label", "nearby_range_count", "svg_present", "pointer_drag_present", "decision", "rationale"]);
writeCsv("VISUAL_REBUILD_QUEUE.csv", visualRows, ["figure_id", "authored_uses", "grade_span", "sample_lessons", "current_role", "priority", "decision", "requirement"]);
writeCsv("MATH_TYPESETTING_AUDIT.csv", mathRows, ["course_id", "grade", "lesson_id", "json_path", "source", "classification", "ascii_notation_risk", "display_recommended", "text", "action"]);
writeCsv("PREMIUM_ENGINE_PRIORITY.csv", engineRows, ["widget_type", "authored_uses", "grade_reach", "manipulation", "consequence", "error_model", "adaptive", "accessibility", "mobile", "polish", "learner_harm", "frequency", "visibility", "strategic_importance", "priority_product", "decision"]);

const tally = (rows, field, value) => rows.filter((row) => row[field] === value).length;
const report = `# Premium Rebuild Baseline — S226

Generated from the current S225 working tree before Wave A product-source edits. The live/current-source lesson player was also inspected at 390×844 and 1440×1000 in the in-app browser.

## Corpus

- Lessons: **${lessons.length.toLocaleString("en-US")}**
- Authored and remedial MCQ moments: **${mcqRows.length.toLocaleString("en-US")}**
- MCQs failing the blind-guess heuristic: **${tally(mcqRows, "blind_guess_test", "FAIL").toLocaleString("en-US")}**
- MCQs requiring distractor remediation or human review: **${mcqRows.filter((row) => row.decision !== "KEEP").length.toLocaleString("en-US")}**
- Authored prediction gates: **${predictionRows.length.toLocaleString("en-US")}** (keep ${tally(predictionRows, "decision", "KEEP")}, reframe ${tally(predictionRows, "decision", "REFRAME")}, remove ${tally(predictionRows, "decision", "REMOVE")})
- Source range inputs: **${rangeRows.length.toLocaleString("en-US")}**
- Authored figure IDs: **${visualRows.length.toLocaleString("en-US")}**
- Math-bearing authored strings: **${mathRows.length.toLocaleString("en-US")}**; ASCII-notation risks: **${tally(mathRows, "ascii_notation_risk", "yes").toLocaleString("en-US")}**
- Registered or authored engine types: **${engineRows.length.toLocaleString("en-US")}**

## Current-flow evidence

1. The sticky player header already provides exit, progress, lesson identity, and XP.
2. A second waypoint card repeats stage identity, progress, and lesson title before every step.
3. A third “Trail clearing” label repeats the step kind immediately above the mathematical object.
4. On 390×844, those layers plus resume/prediction receipts push the active model below the initial viewport and leave only a partial object above the fixed action bar.
5. The mathematical engines and curriculum content are not the root cause of this Wave A defect; redundant shell height and repeated labels are.

Evidence: \`PREMIUM_REBUILD_SCREENSHOTS_S226/baseline-mobile-prediction.png\`, \`baseline-mobile-active-math.png\`, and \`baseline-desktop-active-math.png\`.

## Wave A decision

Make the lesson title and progress a compact single header, remove the repeated waypoint/clearing labels from the visual hierarchy, suppress decorative trail atmosphere during active work, and shorten non-mathematical action-dock copy. Preserve navigation, narration, prediction state, grading, adaptive feedback, XP, and all curriculum mathematics.

The audit CSVs are machine-generated triage, not a claim that heuristics replace mathematical review. Rows marked REVIEW or REMEDIATE require human verification before curriculum changes.
`;
writeFileSync(join(ROOT, "PREMIUM_REBUILD_BASELINE.md"), report);

console.log(JSON.stringify({ lessons: lessons.length, mcq: mcqRows.length, predictions: predictionRows.length, ranges: rangeRows.length, figures: visualRows.length, math: mathRows.length, engines: engineRows.length }, null, 2));
