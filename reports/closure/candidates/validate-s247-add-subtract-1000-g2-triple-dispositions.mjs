import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLessonReviewAuthority } from "../../../scripts/audit/lesson-review-authority-s246.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const candidatePath = path.join(here, "S247_ADD_SUBTRACT_1000_G2_TRIPLE_DISPOSITIONS.jsonl");
const coursePath = path.join(root, "content/courses/add-subtract-1000-g2/course.json");
const lessonRoot = path.join(root, "content/courses/add-subtract-1000-g2/lessons");
const cardsPath = path.join(root, "reports/closure/LESSON_REVIEW_CARDS_S244.json");
const queuePath = path.join(root, "PREMIUM_PENDING_WORKLOAD_QUEUE.csv");
const ledgerPath = path.join(root, "reports/closure/LESSON_REVIEW_DECISIONS_S244.jsonl");
const figurePath = path.join(root, "src/components/figures.tsx");
const widgetPath = path.join(root, "src/components/widgets.tsx");
const evaluatorPath = path.join(root, "src/lib/evaluate.ts");
const focusedTestPath = path.join(root, "src/components/session247.addSubtract1000G2Course.test.tsx");

const read = (file) => fs.readFileSync(file, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const parseJsonl = (file) => read(file).split(/\r?\n/).filter(Boolean).map((line, index) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`${path.relative(root, file)}:${index + 1}: ${error.message}`); }
});
const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(",")}}`;
  return JSON.stringify(value);
};
const template = (prompt) => String(prompt).toLowerCase().replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ").trim();
const countBy = (records, field, values) => Object.fromEntries(values.map((value) => [value, records.filter((record) => record[field] === value).length]));
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const assert = (condition, message, errors) => { if (!condition) errors.push(message); };

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [headers, ...data] = rows.filter((candidate) => candidate.some((entry) => entry !== ""));
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

const expected = {
  "g2b-01-01": ["33185707e3c589f552831af88541ea393bfd564a30882e72142507d17e91fbc3", "REVISE", "SUFFICIENT", "REVISE"],
  "g2b-01-02": ["c9ecaa2cf6a692f8d677ef4deb34ce7d28d4cd2570ac77d2d3cd9cf24e7fd8f2", "REVISE", "SUFFICIENT", "REVISE"],
  "g2b-01-03": ["12c89123192163d18c6e4ddf0b22e8311309a81ece43e90ce8d69deb48fed4f8", "REVISE", "SUFFICIENT", "REVISE"],
  "g2b-01-04": ["888c219d5acf04f4bc29f9c603cc9f1c5cf01b289441eb5e8fd5e4b0c7921867", "KEEP", "SUFFICIENT", "FIT"],
  "g2b-01-05": ["49713811dce6a6c337e8363bc00dc92978db0786d74c11a2c9bcdd290fd5375d", "REVISE", "SUFFICIENT", "REVISE"],
  "g2b-02-01": ["60d2fb555c0c0fdaabc303effed609007b39ccc86e0f0dcc1de22ee12bb0875f", "KEEP", "SUFFICIENT", "FIT"],
  "g2b-02-02": ["9c0ef25f00a7c8ff67e98c5cbe7db28d12b1af3f5b5a186a0809fd6b51cb326b", "KEEP", "SUFFICIENT", "FIT"],
  "g2b-02-03": ["6052a8e2eeb33631d1e6d2ee67904c23eeb1a47664266108d2c2e5a83a480a5e", "KEEP", "SUFFICIENT", "FIT"],
  "g2b-02-04": ["a8ec06bb12402dc94144c860bbd33b33e393b131d491093b1ff67a2146087d70", "REVISE", "PREFERRED", "REVISE"],
  "g2b-02-05": ["b59ebc19cb1809c0d57d0961fbe7b266110772e8dab9e45a862dffd5231b9239", "REVISE", "REQUIRED", "FIT"],
  "g2b-02-06": ["48c1be7d5f02abf0c2227aa2de3a08a92dd7746015e4e3c06300eac2993c89d4", "KEEP", "SUFFICIENT", "FIT"],
  "g2b-03-01": ["d1eb6ac46a6e2806292aa6b62dc0fbfdc0ce0487674520a066cf2390a47ec661", "REVISE", "SUFFICIENT", "REVISE"],
  "g2b-03-02": ["712319170ee1a9c6eab906a3cdc9897dcffbae878513a0df15b63a5dac14e983", "KEEP", "SUFFICIENT", "FIT"],
  "g2b-03-03": ["0e8d2d5ca637acf00e5f88cfd4effe41341c128f5da217d4e7d28434c51ded7b", "REVISE", "SUFFICIENT", "REVISE"],
  "g2b-03-04": ["35c9dfc3a2c97093c7b30d962e714fc09d4cb97dc28370b57fbe155182158653", "KEEP", "SUFFICIENT", "FIT"],
  "g2b-03-05": ["02da9de28b770531fafa1842e57bee610b98f98ed162feb57aea40d10e4c7067", "REVISE", "PREFERRED", "REVISE"],
};
const expectedFigures = {
  "g2b-01-01": "skip-count-line", "g2b-01-02": "pv1000-decompose", "g2b-01-03": "pv1000-trade-ones",
  "g2b-01-04": "pv1000-cascade", "g2b-01-05": "pv1000-stadium", "g2b-02-01": "pv1000-decompose",
  "g2b-02-02": "pv1000-trade-down", "g2b-02-03": "pv1000-cascade-down", "g2b-02-04": "pv3-borrow-zero",
  "g2b-02-05": "pv1000-skip-anywhere", "g2b-02-06": "skip-count-line", "g2b-03-01": "pv3-jump",
  "g2b-03-02": "pv1000-same-value", "g2b-03-03": "pv1000-trade-ones", "g2b-03-04": "pv1000-stadium",
  "g2b-03-05": "as100-name-tool",
};
const correctLabels = {
  "g2b-01-01/k3": "About 600 — round each and add", "g2b-01-02/k3": "About 600 — round each and add",
  "g2b-01-03/k3": "Because ten ones and one ten are equal amounts", "g2b-01-04/k3": "Trade ten of the tens for one hundred",
  "g2b-01-05/k3": "Because ten ones and one ten are equal amounts", "g2b-02-01/k3": "About 400",
  "g2b-02-02/k3": "They have the same value.", "g2b-02-03/k3": "It becomes 10 tens.",
  "g2b-02-04/k3": "The 0 tens cannot give a ten to the ones.", "g2b-03-01/k3": "An open number line with friendly jumps",
  "g2b-03-02/k3": "Trade ten of the tens for one hundred", "g2b-03-03/k1": "Because ten ones and one ten are equal amounts",
  "g2b-03-03/k2": "No. A trade keeps the same value.", "g2b-03-03/ch1": "Both amounts equal 100.",
  "g2b-03-05/k1": "Column work with trading", "g2b-03-05/k2": "Mental math — just add the hundreds",
  "g2b-03-05/k3": "About 500 — round each and add", "g2b-03-05/ch1": "Trade a hundred, then a ten",
};
const languageDebt = new Set(["g2b-01-01", "g2b-01-02", "g2b-01-03", "g2b-01-05", "g2b-02-04", "g2b-03-01", "g2b-03-03", "g2b-03-05"]);
const optionParityDebt = new Set(["g2b-01-01/k3", "g2b-01-02/k3", "g2b-03-01/k3", "g2b-03-05/k2", "g2b-03-05/k3"]);

const errors = [];
const course = JSON.parse(read(coursePath));
const ids = course.chapters.flatMap((chapter) => chapter.lessonIds);
const lessons = Object.fromEntries(ids.map((id) => [id, JSON.parse(read(path.join(lessonRoot, `${id}.json`)))]));
const records = parseJsonl(candidatePath);
const recordByLesson = new Map(records.map((record) => [record.lessonId, record]));
const schema = parseJsonl(ledgerPath)[0];
const exactFields = new Set(["recordType", ...schema.contract.requiredDecisionFields]);
const authority = loadLessonReviewAuthority(root);
const liveByLesson = new Map(authority.lessons.filter((lesson) => lesson.courseId === course.id).map((lesson) => [lesson.lessonId, lesson]));

assert(course.id === "add-subtract-1000-g2" && course.gradeLevel === 2, "unexpected course identity or grade", errors);
assert(ids.length === 16 && new Set(ids).size === 16, `manifest lesson set is not exact 16 (${ids.length})`, errors);
assert(records.length === 16 && recordByLesson.size === 16, `candidate record set is not exact 16 (${records.length}/${recordByLesson.size})`, errors);
assert(new Set(records.map((record) => record.recordId)).size === 16, "candidate recordIds are not unique", errors);
assert(ids.every((id) => recordByLesson.has(id)) && records.every((record) => ids.includes(record.lessonId)), "candidate lesson IDs differ from manifest", errors);

for (const id of ids) {
  const record = recordByLesson.get(id);
  const live = liveByLesson.get(id);
  const contract = expected[id];
  assert(Boolean(record && live && contract), `${id}: missing record, live source, or contract`, errors);
  if (!record || !live || !contract) continue;
  assert(Object.keys(record).length === exactFields.size && Object.keys(record).every((field) => exactFields.has(field)), `${id}: fields differ from exact ledger contract`, errors);
  assert([...exactFields].every((field) => record[field] !== undefined && record[field] !== null && record[field] !== ""), `${id}: empty required field`, errors);
  assert(record.recordType === "lesson-disposition" && record.recordId === `S247-G2B-${id}`, `${id}: record identity mismatch`, errors);
  assert(record.reviewer === "ChatGPT Work independent assessor (add-subtract-1000-g2)", `${id}: reviewer mismatch`, errors);
  assert(Number.isFinite(Date.parse(record.reviewedAt)), `${id}: invalid reviewedAt`, errors);
  assert(record.reviewedBasisHash === contract[0] && live.reviewBasisHash === contract[0], `${id}: stale candidate/live review basis`, errors);
  assert(same([record.decision, record.visualDecision, record.gradeLanguageDecision], contract.slice(1)), `${id}: triple disposition mismatch`, errors);
  assert(String(record.rationale).length >= 350, `${id}: rationale is not substantive`, errors);
  assert(String(record.reopenCondition).length >= 220, `${id}: reopen condition is not substantive`, errors);
  assert(Array.isArray(record.evidenceRefs) && record.evidenceRefs.length >= 5, `${id}: insufficient evidence refs`, errors);
  for (const reference of record.evidenceRefs ?? []) {
    const marker = [reference.indexOf(":"), reference.indexOf("#")].filter((index) => index > 1).sort((a, b) => a - b)[0];
    const file = marker === undefined ? reference : reference.slice(0, marker);
    assert(fs.existsSync(path.join(root, file)), `${id}: missing evidence file ${file}`, errors);
  }
  assert(record.gradeLanguageDecision === (languageDebt.has(id) ? "REVISE" : "FIT"), `${id}: language debt mapping changed`, errors);
  assert((authority.duplicateInventory.byLesson.get(id) ?? []).length === 0, `${id}: exact MCQ duplicate basis changed`, errors);
  assert((authority.standards.byLesson.get(id) ?? []).length === 0, `${id}: standards evidence basis changed from missing`, errors);
}

// Source-mechanical illustration closure: all 32 former count-on-hops concepts plus 16 remedials now use registered semantic figures.
const figureRaw = read(figurePath);
for (const id of ids) {
  const lesson = lessons[id];
  const concepts = lesson.steps.filter((step) => step.kind === "concept");
  const expectedFigure = expectedFigures[id];
  assert(concepts.length === 2, `${id}: expected two main concepts`, errors);
  assert(concepts.every((step) => step.figure === expectedFigure && step.figure !== "count-on-hops"), `${id}: former illustration placements are not both replaced`, errors);
  assert(lesson.remedials?.[0]?.concept?.figure === expectedFigure, `${id}: remedial figure differs from reviewed semantic figure`, errors);
  assert(figureRaw.includes(`"${expectedFigure}":`), `${id}: figure ${expectedFigure} is not registered`, errors);
}

// Structural progression closure and the one remaining semantic weakness that the exact-template test cannot see.
for (const id of ids) {
  const widgets = lessons[id].steps.filter((step) => step.widget).map((step) => ({ signature: stable(step.widget), prompt: step.widget.prompt.trim(), template: template(step.widget.prompt) }));
  for (const field of ["signature", "prompt", "template"]) assert(new Set(widgets.map((widget) => widget[field])).size === widgets.length, `${id}: duplicate ${field} widget job`, errors);
}
assert(lessons["g2b-01-01"].steps.find((step) => step.id === "c1").body.includes("300 + 200 = 500"), "g2b-01-01 taught exemplar changed", errors);
assert(lessons["g2b-01-01"].steps.find((step) => step.id === "ch1").widget.prompt.includes("300 + 200"), "g2b-01-01 repeated challenge changed; progression disposition must be reconsidered", errors);
assert(lessons["g2b-03-05"].steps.find((step) => step.id === "ch1").widget.prompt.includes("what must happen before subtracting the ones"), "g2b-03-05 distinct procedural challenge changed", errors);

// Independent arithmetic/evaluator agreement for every numeric, number-line, base-ten, and MCQ surface.
const numericAudit = [];
const numberLines = [];
const baseTens = [];
const mcqs = [];
for (const id of ids) {
  const lesson = lessons[id];
  const surfaces = [...lesson.steps, ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.check])].filter((step) => step?.widget);
  for (const step of surfaces) {
    const widget = step.widget;
    const key = `${id}/${step.id}`;
    if (widget.type === "numeric") {
      const prompt = widget.prompt.replaceAll("-", "−");
      let truth;
      const equation = prompt.match(/(\d+)\s*([+−])\s*(\d+)\s*=\s*\?/);
      if (equation) truth = equation[2] === "+" ? Number(equation[1]) + Number(equation[3]) : Number(equation[1]) - Number(equation[3]);
      const parts = prompt.match(/(\d+)\s+hundreds?,\s*(\d+)\s+tens?,\s*and\s*(\d+)\s+ones?/i);
      if (parts) truth = 100 * Number(parts[1]) + 10 * Number(parts[2]) + Number(parts[3]);
      const tenMore = prompt.match(/(?:ten more than|Add ten mentally to)\s*(\d+)/i);
      if (tenMore) truth = Number(tenMore[1]) + 10;
      const hundredMore = prompt.match(/(?:one hundred more than|Add one hundred mentally to)\s*(\d+)/i);
      if (hundredMore) truth = Number(hundredMore[1]) + 100;
      numericAudit.push({ key, truth, answer: widget.answer });
      assert(Number.isFinite(truth), `${key}: numeric prompt could not be independently parsed`, errors);
      assert(truth === widget.answer, `${key}: numeric answer ${widget.answer} != ${truth}`, errors);
      assert(String(widget.successFeedback).includes(String(widget.answer)), `${key}: success feedback omits answer`, errors);
    } else if (widget.type === "numberLineHop") {
      const landing = widget.start + (widget.direction === "forward" ? 1 : -1) * widget.hop * widget.hops;
      numberLines.push({ key, landing });
      assert(landing >= widget.min && landing <= widget.max, `${key}: landing outside line domain`, errors);
      assert(widget.successFeedback.includes(String(landing)) && widget.missFeedback.includes(String(landing)), `${key}: line feedback disagrees with landing ${landing}`, errors);
    } else if (widget.type === "baseTenCompose") {
      const h = Math.floor(widget.target / 100), t = Math.floor(widget.target / 10) % 10, o = widget.target % 10;
      baseTens.push({ key, target: widget.target, requireStandard: widget.requireStandard });
      assert(widget.target <= widget.maxHundreds * 100 + widget.maxTens * 10 + widget.maxOnes, `${key}: target unreachable`, errors);
      if (widget.requireStandard) assert(h <= widget.maxHundreds && t <= widget.maxTens && o <= widget.maxOnes, `${key}: standard form unreachable`, errors);
      for (const common of widget.commonBuilds ?? []) {
        const total = (common.hundreds ?? 0) * 100 + common.tens * 10 + common.ones;
        assert((common.hundreds ?? 0) <= widget.maxHundreds && common.tens <= widget.maxTens && common.ones <= widget.maxOnes, `${key}: common-build state exceeds tray caps`, errors);
        assert(String(common.feedback).trim().length >= 20, `${key}: common-build feedback is not substantive`, errors);
      }
    } else if (widget.type === "mcq") {
      const correct = widget.options.filter((option) => option.correct);
      mcqs.push({ key, options: widget.options });
      assert(correct.length === 1, `${key}: MCQ is not singularly keyed`, errors);
      assert(new Set(widget.options.map((option) => option.id)).size === widget.options.length, `${key}: duplicate MCQ IDs`, errors);
      if (correctLabels[key]) assert(correct[0]?.label === correctLabels[key], `${key}: correct semantic label changed`, errors);
    }
  }
}
assert(numberLines.length === 9, `number-line surface count ${numberLines.length} != 9`, errors);
assert(baseTens.length === 23, `base-ten surface count ${baseTens.length} != 23`, errors);
assert(mcqs.length === 20, `MCQ surface count ${mcqs.length} != 20`, errors);
assert(Object.keys(correctLabels).length === 18, "main-step correct-label oracle changed", errors);
for (const debtKey of optionParityDebt) {
  const item = mcqs.find(({ key }) => key === debtKey);
  assert(Boolean(item), `${debtKey}: option-parity surface missing`, errors);
  if (item) {
    const lengths = item.options.map((option) => option.label.length);
    const ratio = Math.max(...lengths) / Math.min(...lengths);
    assert(ratio >= 1.8, `${debtKey}: reviewed option-parity debt changed (${ratio.toFixed(2)})`, errors);
  }
}

// Runtime/accessibility and randomization contracts used by this packet.
const widgetRaw = read(widgetPath);
const evaluatorRaw = read(evaluatorPath);
const focusedRaw = read(focusedTestPath);
for (const marker of ["function BaseTenComposeW", "Value-preserving exchanges", "role=\"status\"", "aria-live=\"polite\"", "function McqW", "seededShuffle(spec.options", "aria-label={accessibleMathText(spec.prompt)}"]) assert(widgetRaw.includes(marker), `widget runtime marker missing: ${marker}`, errors);
for (const marker of ['case "baseTenCompose"', 'case "numberLineHop"', 'case "mcq"']) assert(evaluatorRaw.includes(marker), `evaluator marker missing: ${marker}`, errors);
for (const marker of ["renderToStaticMarkup", "isFigureTextAligned", "role=\"img\"", "<title>", "distinct widget, exact-prompt, and normalized-prompt jobs", "Grade 2 language hazards"]) assert(focusedRaw.includes(marker), `focused regression marker missing: ${marker}`, errors);
assert(figureRaw.includes('<svg viewBox="0 0 210 96" role="img"') && figureRaw.includes('y="104"'), "reviewed Pv3BorrowZero clipped-label geometry changed", errors);
assert(figureRaw.includes("[430,440,450,460]") && !figureRaw.slice(figureRaw.indexOf("function Pv1000SkipAnywhere"), figureRaw.indexOf("function Pv1000FivesEnd")).includes("490"), "reviewed ten-hop boundary visual changed", errors);

const cards = JSON.parse(read(cardsPath)).cards.filter((card) => card.courseId === course.id);
const cardByLesson = new Map(cards.map((card) => [card.lessonId, card]));
assert(cards.length === 16 && ids.every((id) => cardByLesson.has(id)), `current card artifact does not contain exact 16 target cards (${cards.length})`, errors);
const currentCardSourceHashes = ids.filter((id) => cardByLesson.get(id)?.lessonSourceHash === liveByLesson.get(id)?.lessonSourceHash).length;
const currentCardBasisHashes = ids.filter((id) => cardByLesson.get(id)?.reviewBasisHash === liveByLesson.get(id)?.reviewBasisHash).length;
const queue = parseCsv(read(queuePath)).filter((row) => ids.includes(row.lesson_id));
const queueCounts = Object.fromEntries([...new Set(queue.map((row) => row.workstream))].sort().map((workstream) => [workstream, queue.filter((row) => row.workstream === workstream).length]));

const decisions = countBy(records, "decision", schema.contract.allowedLessonDecisions);
const visualDecisions = countBy(records, "visualDecision", schema.contract.allowedVisualDecisions);
const gradeLanguageDecisions = countBy(records, "gradeLanguageDecision", schema.contract.allowedGradeLanguageDecisions);
assert(same(decisions, { KEEP: 7, REVISE: 9, ESCALATE: 0 }), `decision distribution ${JSON.stringify(decisions)}`, errors);
assert(same(visualDecisions, { REQUIRED: 1, PREFERRED: 2, SUFFICIENT: 13, ESCALATE: 0 }), `visual distribution ${JSON.stringify(visualDecisions)}`, errors);
assert(same(gradeLanguageDecisions, { FIT: 8, REVISE: 8, ESCALATE: 0 }), `language distribution ${JSON.stringify(gradeLanguageDecisions)}`, errors);

const report = {
  status: errors.length ? "FAIL" : "PASS",
  courseId: course.id,
  gradeLevel: course.gradeLevel,
  lessons: ids.length,
  candidateRecords: records.length,
  decisions,
  visualDecisions,
  gradeLanguageDecisions,
  sourceMechanicalClosure: { illustrationPlacementsClosed: 32, structuralProgressionLessonsClosed: 16 },
  semanticAssurance: { progressionLessonsFullyClosed: 15, progressionLessonsRemaining: ["g2b-01-01"], optionParitySurfacesRemaining: [...optionParityDebt], visualPresentationOrOpportunityLessonsRemaining: ["g2b-02-04", "g2b-02-05", "g2b-03-05"], gradeLanguageLessonsRemaining: [...languageDebt] },
  standards: { targetLessonsWithEvidenceDossiers: ids.filter((id) => (authority.standards.byLesson.get(id) ?? []).length > 0).length, targetLessonsMissingEvidenceDossiers: ids.filter((id) => (authority.standards.byLesson.get(id) ?? []).length === 0).length },
  arithmeticSurfaces: { numeric: numericAudit.length, numberLine: numberLines.length, baseTen: baseTens.length, mcqIncludingRemedials: mcqs.length },
  derivedArtifactsObserved: { cards: cards.length, currentCardSourceHashes, currentCardBasisHashes, queueRows: queue.length, queueCounts },
  candidateSha256: sha256(read(candidatePath)),
  errors,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
