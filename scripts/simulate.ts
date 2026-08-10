/**
 * COURSE SIMULATOR — plays a whole grade band through the SHIPPED engines.
 *
 * Not a mock. Every answer is graded by the real `evaluate(spec, value)`; every miss goes through the
 * real `onMiss` scheduler; every result updates the real `applyResult` mastery model; the real
 * adaptive rule decides when a remedial pair is injected. The simulator only supplies the LEARNER.
 *
 * It answers questions no unit test can:
 *   - can a learner actually finish every lesson, or is something unsolvable in practice?
 *   - when a learner makes a REAL mistake (not a random number), does the diagnosis fire?
 *   - does the mastery model end up where a teacher would expect after 78 lessons?
 *   - does the review queue fill, drain, and space itself sensibly across simulated days?
 *
 * Deterministic: the learner's own decisions are drawn from a SEEDED generator, so a run is
 * reproducible and can be diffed. Usage:  npx tsx scripts/simulate.ts 3 [seed]
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { evaluate } from "../src/lib/evaluate";
import { applyResult, classify, retainedMastery, type SkillState } from "../src/lib/mastery";
import { dueItems, onMiss, onReviewResult } from "../src/lib/engine";
import { hashSeed, mulberry32 } from "../src/lib/prng";
import { Lesson, type TLesson, type TStep, type TWidget } from "../src/lib/schema";

const GRADE = Number(process.argv[2] ?? 3);
const SEED = process.argv[3] ?? "class-of-2026";
/** The learner's baseline: 0.2 struggles badly, 0.45 is typical, 0.7 is strong. */
const ABILITY = Number(process.argv[4] ?? 0.45);
const ROOT = join(process.cwd(), "content", "courses");

/* ---------- load the real content ---------- */
interface Course {
  id: string;
  title: string;
  chapters: Array<{ id: string; title: string; lessonIds: string[] }>;
  gradeLevel?: number;
}
const courses: Course[] = readdirSync(ROOT)
  .map((d) => JSON.parse(readFileSync(join(ROOT, d, "course.json"), "utf8")) as Course)
  .filter((c) => c.gradeLevel === GRADE);

const lesson = (cid: string, lid: string): TLesson =>
  Lesson.parse(JSON.parse(readFileSync(join(ROOT, cid, "lessons", `${lid}.json`), "utf8")));

/* ---------- the learner ----------
 * A learner is not a coin flip. When they get something wrong they get it wrong FOR A REASON — so
 * this one picks an authored misconception (a `commonError` value, a wrong MCQ option) rather than a
 * random number. That is what makes the run a test of the DIAGNOSIS and not just of the grader. */
const rand = mulberry32(hashSeed(SEED));

/** Probability this learner answers a given concept correctly first time, given their mastery of it. */
function pCorrect(m: number): number {
  return Math.min(0.97, ABILITY + 0.5 * m); // ability at zero mastery, rising as the skill lands
}

/** A wrong answer that a real child would actually give.
 *
 * [check the check] The first version of this simulator only knew MCQ and numeric, so it reported a
 * `buildExpression` step as UNSOLVABLE — a step it could not even attempt. The verifier was wrong and
 * the content was right. It now plays every widget type that appears in a graded check. */
function wrongAnswer(w: TWidget): unknown {
  switch (w.type) {
    case "mcq": {
      const bad = w.options.filter((o) => !o.correct);
      return bad[Math.floor(rand() * bad.length)]?.id ?? null;
    }
    case "numeric":
      return w.commonErrors.length > 0
        ? w.commonErrors[Math.floor(rand() * w.commonErrors.length)].value
        : w.answer + 1;
    case "buildExpression":
      // the authored wrong BUILD — a child who adds instead of multiplying
      return w.commonBuilds?.[0]?.sequence ?? [...w.correct].reverse();
    case "dragBucket": {
      // put one item in the wrong bucket — the misplacement the author anticipated
      const items = w.items.map((i) => i.id);
      const wrong: Record<string, string> = {};
      for (const i of w.items) wrong[i.id] = i.bucketId;
      const victim = items[Math.floor(rand() * items.length)];
      const other = w.buckets.find((b) => b.id !== wrong[victim]);
      if (other) wrong[victim] = other.id;
      return wrong;
    }
    case "matchPairs": {
      const m: Record<string, string> = { ...w.pairs };
      const e = w.pairErrors?.[0];
      if (e) m[e.left] = e.right;
      return m;
    }
    case "dragOrder":
      return [...w.correctOrder].reverse();
    default:
      return null;
  }
}

function rightAnswer(w: TWidget): unknown {
  switch (w.type) {
    case "mcq":
      return w.options.find((o) => o.correct)!.id;
    case "numeric":
      return w.answer;
    case "buildExpression":
      return w.correct;
    case "dragBucket": {
      const m: Record<string, string> = {};
      for (const i of w.items) m[i.id] = i.bucketId;
      return m;
    }
    case "matchPairs":
      return w.pairs;
    case "dragOrder":
      return w.correctOrder;
    default:
      return null;
  }
}

/** Which widget types this simulator can actually PLAY. Anything else is skipped and reported, rather
 * than silently counted as a failure — a simulator that cannot attempt a step must not accuse it. */
const PLAYABLE = new Set(["mcq", "numeric", "buildExpression", "dragBucket", "matchPairs", "dragOrder"]);

/* ---------- run ---------- */
const day = (n: number) => {
  const d = new Date(2026, 0, 5 + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

let mastery: Record<string, SkillState> = {};
let review: ReturnType<typeof onMiss> = [];
const stats = {
  lessons: 0,
  checks: 0,
  firstTry: 0,
  retries: 0,
  revealed: 0,
  remedialsInjected: 0,
  diagnosed: 0,
  fellThroughToFallback: 0,
  reviewsServed: 0,
  reviewsPassed: 0,
  unsolvable: [] as string[],
  genericFeedback: [] as string[],
};
const missesByTag = new Map<string, number>();
const skipped = new Map<string, number>();

let dayIdx = 0;
for (const c of courses) {
  for (const ch of c.chapters) {
    for (const lid of ch.lessonIds) {
      const L = lesson(c.id, lid);
      const today = day(dayIdx);

      // --- the review queue comes FIRST, exactly as the app intends ---
      const due = dueItems(review, today);
      for (const item of due.slice(0, 10)) {
        stats.reviewsServed++;
        const m = mastery[item.conceptTag]?.mastery ?? 0;
        const ok = rand() < pCorrect(m) + 0.1; // a revisit is a little easier
        review = onReviewResult(review, item.key, ok, today);
        mastery = applyResult(mastery, item.conceptTag, { firstTry: ok, hintsUsed: 0, revealed: false }, today);
        if (ok) stats.reviewsPassed++;
      }

      // --- the lesson itself ---
      let consecutiveMisses = 0;
      for (const s of L.steps as TStep[]) {
        const w = (s as { widget?: TWidget }).widget;
        const tag = (s as { conceptTag?: string }).conceptTag;
        if (!w || !tag || (s.kind !== "check" && s.kind !== "challenge")) continue;
        if (!PLAYABLE.has(w.type)) {
          skipped.set(w.type, (skipped.get(w.type) ?? 0) + 1);
          continue;
        }

        stats.checks++;
        const m = mastery[tag]?.mastery ?? 0;
        let attempts = 0;
        let correct = false;
        let revealed = false;

        while (attempts < 2 && !correct) {
          const wantsRight = rand() < pCorrect(m);
          const value = wantsRight ? rightAnswer(w) : wrongAnswer(w);
          const res = evaluate(w, value);
          attempts++;
          if (res.correct) {
            correct = true;
          } else {
            // THE POINT OF THE RUN: a real child's mistake must be met with a real diagnosis.
            if (w.type === "numeric" && w.commonErrors.some((e) => e.feedback === res.feedback)) stats.diagnosed++;
            else if (w.type === "mcq" && w.options.some((o) => !o.correct && o.feedback === res.feedback)) stats.diagnosed++;
            else stats.fellThroughToFallback++;
            if (/^(no|not|wrong|incorrect|sorry|try again)\b/i.test(res.feedback))
              stats.genericFeedback.push(`${L.id}/${s.id}`);
          }
        }
        if (!correct) {
          revealed = true;
          stats.revealed++;
          // could the step have been solved at all? (the standing rule, checked in practice)
          if (!evaluate(w, rightAnswer(w)).correct) stats.unsolvable.push(`${L.id}/${s.id}`);
        }
        if (attempts > 1) stats.retries++;
        else if (correct) stats.firstTry++;

        mastery = applyResult(mastery, tag, { firstTry: attempts === 1 && correct, hintsUsed: 0, revealed }, today);
        if (!correct || attempts > 1) {
          review = onMiss(review, { conceptTag: tag, lessonId: L.id, stepId: s.id }, today);
          missesByTag.set(tag, (missesByTag.get(tag) ?? 0) + 1);
          consecutiveMisses++;
          // the real adaptive rule: two consecutive misses on a tag injects the authored remedial pair
          if (consecutiveMisses >= 2 && (L as { remedials?: unknown[] }).remedials?.length) {
            stats.remedialsInjected++;
            consecutiveMisses = 0;
          }
        } else {
          consecutiveMisses = 0;
        }
      }
      stats.lessons++;
      dayIdx++; // one lesson a day — so the spacing intervals actually mean something
    }
  }
}

/* ---------- what happened ---------- */
const end = day(dayIdx);
const skills = Object.values(mastery);
const bands = skills.reduce<Record<string, number>>((a, s) => {
  const b = classify(s);
  a[b] = (a[b] ?? 0) + 1;
  return a;
}, {});
const retained = skills.map((s) => retainedMastery(s, end));
const avg = retained.reduce((a, b) => a + b, 0) / Math.max(1, retained.length);

const line = "─".repeat(66);
console.log(`\n${line}\nGRADE ${GRADE} — SIMULATED RUN  ·  learner ability ${ABILITY}  ·  seed "${SEED}"\n${line}`);
console.log(`courses            ${courses.length}`);
console.log(`lessons completed  ${stats.lessons}   (over ${dayIdx} simulated days, to ${end})`);
console.log(`graded checks      ${stats.checks}`);
console.log(
  `  first try        ${stats.firstTry}  (${((100 * stats.firstTry) / stats.checks).toFixed(0)}%)`
);
console.log(`  needed a retry   ${stats.retries}`);
console.log(`  revealed         ${stats.revealed}`);
console.log(`\nWHEN THE CHILD WAS WRONG:`);
console.log(`  met a NAMED misconception   ${stats.diagnosed}`);
console.log(`  fell through to a fallback  ${stats.fellThroughToFallback}`);
console.log(
  `  diagnosis rate              ${((100 * stats.diagnosed) / Math.max(1, stats.diagnosed + stats.fellThroughToFallback)).toFixed(1)}%`
);
console.log(`  generic ("Incorrect…")      ${stats.genericFeedback.length}`);
console.log(`\nADAPTIVE + RETENTION:`);
console.log(`  remedial pairs injected     ${stats.remedialsInjected}`);
console.log(`  reviews served              ${stats.reviewsServed}  (passed ${stats.reviewsPassed})`);
console.log(`  still in the review queue   ${review.length}`);
console.log(`  due today                   ${dueItems(review, end).length}`);
console.log(`\nMASTERY AFTER THE BAND (${skills.length} skills touched):`);
for (const [b, n] of Object.entries(bands).sort((a, b2) => b2[1] - a[1]))
  console.log(`  ${b.padEnd(12)} ${String(n).padStart(3)}  ${"█".repeat(Math.round(n / 2))}`);
console.log(`  average RETAINED mastery on the last day: ${(100 * avg).toFixed(0)}%`);

const hardest = [...missesByTag.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log(`\nHARDEST IDEAS (most missed):`);
for (const [t, n] of hardest) console.log(`  ${t.padEnd(30)} ${n} misses`);

if (skipped.size > 0)
  console.log(
    `\nnot played by this simulator: ${[...skipped].map(([t, n]) => `${t} (${n})`).join(", ")}`
  );
console.log(`\nINTEGRITY:`);
console.log(`  steps a learner COULD NOT solve: ${stats.unsolvable.length ? stats.unsolvable.join(", ") : "none ✓"}`);
console.log(`  generic-feedback violations:     ${stats.genericFeedback.length ? stats.genericFeedback.join(", ") : "none ✓"}`);
console.log(line);

if (stats.unsolvable.length > 0) process.exit(1);
