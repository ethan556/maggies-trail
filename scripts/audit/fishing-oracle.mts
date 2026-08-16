/**
 * S242 / ENG-01 R3 — IS THE CONVERGENCE CHANNEL WORTH ANYTHING TO A LEARNER WHO KNOWS NOTHING?
 *
 * `ENG01_REVERSIBLE_PLAY_ASSESSMENT.md` §3.4 recorded R3 from a SOURCE READ: 38 engines whose miss
 * feedback is directional (`lowFeedback`/`highFeedback`) or quantitative (`dragBucket`'s "k of n
 * sorted right so far"), sitting on step kinds that permit retries. It then asserted, also from
 * source, that "on a graded step the two-attempt bound makes one directional bit nearly worthless."
 *
 * "Nearly worthless" is not a measurement. This is.
 *
 * ── The model ───────────────────────────────────────────────────────────────────────────────────
 * An attacker who knows NO mathematics but does know the widget's controls. He can enumerate the
 * states the controls can reach, he can read the feedback string, and he can count. He may not
 * compute anything about the subject. Then, on a graded step, he has exactly two submissions
 * (`playerStore.ts:366-376` — first wrong → `retry`, second wrong → revealed).
 *
 * For a probe p and a hypothetical target c, the feedback he would see is
 *
 *     evaluate({...spec, <target fields> := c}, p).feedback
 *
 * — computed with the REAL evaluator, by moving the target rather than by re-deriving the grading
 * rule here. That is the whole reason this audit is trustworthy: it never restates what the
 * feedback means, it asks the shipped grader.
 *
 * With probe p the candidate space splits into `W(p)` (targets p already satisfies — note this is
 * usually bigger than one, because `fractionBar` and `areaModel` deliberately accept every
 * equivalent build) and one class per distinct feedback string. Guess uniformly inside the
 * surviving class on attempt two and the win probability is exactly
 *
 *     P(win in 2 | p) = ( |W(p)| + #distinct feedback classes ) / |C|
 *
 * against a blind baseline of two distinct guesses, ( |W(p₁)| + |W(p₂)\W(p₁)| ) / |C|. The ratio is
 * what the channel is worth. `fishable` — the number this packet exists to find — is a step where
 * that probability reaches **1**: the oracle alone, with no mathematics, wins every time, and the
 * mastery record it writes is false.
 *
 * ── What it does NOT claim ──────────────────────────────────────────────────────────────────────
 * `interactive` steps are unbounded (§1) but ungraded, so a hill-climb there wastes the learning
 * without forging evidence. They are measured and reported separately, and the ranking follows the
 * graded population.
 *
 * Run: npx tsx scripts/audit/fishing-oracle.mts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { globSync } from "node:fs";
import { evaluate } from "../../src/lib/evaluate";
import { WidgetSpec } from "../../src/lib/schema";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "eng");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/* Enumeration caps. A candidate space this audit cannot walk is reported as skipped WITH its size,
 * never silently dropped — an unmeasured engine that vanishes from the table reads as a clean one. */
const MAX_CANDIDATES = 1500;
const MAX_PROBES = 40;

type Spec = Record<string, unknown> & { type: string };
interface Model {
  /** Every target the step could have had, given the controls the learner is offered. */
  candidates: unknown[];
  /** Rewrite the spec so `c` is the target. The grading rule itself is never touched. */
  retarget: (spec: Spec, c: unknown) => Spec;
  /** The submission that expresses candidate `c`. Identity for every engine but moneyBoard. */
  submit?: (c: unknown) => unknown;
}

const money = (spec: Spec) => {
  /* compose/change: the tray is a bounded multiset, so the reachable TOTALS are enumerable by
   * dynamic programming and each one is a target the step could have had. */
  const tray = (spec.tray as Array<{ cents: number; max: number }>) ?? [];
  if (!tray.length) return null;
  let reach = new Map<number, Record<number, number>>([[0, {}]]);
  for (const d of tray) {
    const next = new Map(reach);
    for (const [tot, build] of reach)
      for (let k = 1; k <= d.max; k++) {
        const t = tot + d.cents * k;
        if (t > 2000 || next.has(t)) continue;
        next.set(t, { ...build, [d.cents]: k });
      }
    reach = next;
  }
  reach.delete(0); // "place nothing" is not a submission; the evaluator rejects it before grading
  const builds = reach;
  return {
    candidates: [...builds.keys()].sort((a, b) => a - b),
    retarget: (s: Spec, c: unknown) =>
      s.mode === "change" ? { ...s, priceCents: (s.paidCents as number) - (c as number) } : { ...s, targetCents: c },
    submit: (c: unknown) => builds.get(c as number),
  } satisfies Model;
};

function modelFor(spec: Spec): Model | null {
  switch (spec.type) {
    case "numberLinePlace": {
      const min = spec.min as number, max = spec.max as number, step = (spec.step as number) || 1;
      const c: number[] = [];
      for (let v = min; v <= max + 1e-9; v += step) c.push(Math.round(v * 1e6) / 1e6);
      return { candidates: c, retarget: (s, t) => ({ ...s, target: t }) };
    }
    case "fractionBar": {
      const nMin = (spec.numMin as number) ?? 1, nMax = (spec.numMax as number) ?? 12;
      const dMin = (spec.denMin as number) ?? 1, dMax = (spec.denMax as number) ?? 12;
      const c: Array<{ n: number; d: number }> = [];
      for (let n = nMin; n <= nMax; n++) for (let d = dMin; d <= dMax; d++) c.push({ n, d });
      return {
        candidates: c,
        retarget: (s, t) => ({ ...s, targetNum: (t as { n: number }).n, targetDen: (t as { d: number }).d }),
      };
    }
    case "areaModel": {
      if (spec.countGrid) {
        /* Fixed-grid counting: the control is a single count, and the target is an area. */
        const cells = ((spec.wStart as number) || 1) * ((spec.hStart as number) || 1);
        const c: number[] = [];
        for (let k = 1; k <= cells; k++) c.push(k);
        return { candidates: c, retarget: (s, t) => ({ ...s, targetArea: t }) };
      }
      const wMax = spec.wMax as number, hMax = spec.hMax as number;
      const c: Array<{ w: number; h: number }> = [];
      for (let w = 1; w <= wMax; w++)
        for (let h = 1; h <= hMax; h++) if (!spec.square || w === h) c.push({ w, h });
      return {
        candidates: c,
        retarget: (s, t) => {
          const { w, h } = t as { w: number; h: number };
          /* `requireFactors` pins WHICH factor pair counts, so a retarget that moved only the area
           * would leave the old pair pinned and every candidate would read as wrong. */
          return { ...s, targetArea: w * h, ...(s.requireFactors ? { requireFactors: { w, h } } : {}) };
        },
      };
    }
    case "dragBucket": {
      const items = spec.items as Array<{ id: string; bucketId: string }>;
      const buckets = (spec.buckets as Array<{ id: string }>).map((b) => b.id);
      if (buckets.length ** items.length > MAX_CANDIDATES * 4) return null;
      const c: Array<Record<string, string>> = [];
      const walk = (i: number, acc: Record<string, string>) => {
        if (i === items.length) return void c.push({ ...acc });
        for (const b of buckets) walk(i + 1, { ...acc, [items[i].id]: b });
      };
      walk(0, {});
      return {
        candidates: c,
        retarget: (s, t) => ({
          ...s,
          items: (s.items as Array<{ id: string }>).map((it) => ({ ...it, bucketId: (t as Record<string, string>)[it.id] })),
        }),
      };
    }
    case "moneyBoard":
      return spec.mode === "count" ? null : money(spec);
    default:
      return null;
  }
}

interface Row {
  lesson: string; step: string; kind: string; engine: string;
  candidates: number; classes: number; accepting: number;
  pOracle: number; pBlind: number; advantage: number; fishable: boolean;
}

/** The R3 engines this audit can enumerate. Everything else in R3 is out of scope and said so
 * below rather than quietly absent — an unmeasured engine missing from the table reads as clean. */
const MODELLED = new Set(["numberLinePlace", "fractionBar", "areaModel", "dragBucket", "moneyBoard"]);
/** R3's full membership, transcribed from the verdict column of §3.4's engine table. Only these are
 * tallied as unmeasured; the rest of the corpus is a different audit's population, not a gap. */
const R3 = new Set([
  "accumulateArea", "angleMeasure", "areaModel", "circleAngleExplore", "compassConstruct",
  "covariationScrubber", "derivativeTrace", "dilationExplore", "doubleNumberLine", "dragBucket",
  "elapsedTime", "expLogExplore", "feasibleRegionExplore", "fractionBar", "fractionOfSet",
  "hundredthsGrid", "integerChips", "moneyBoard", "netFold", "numberLinePlace", "parametricTrace",
  "percentBar", "placeValue", "polarTrace", "probabilityArea", "ratioTable", "riemannSum",
  "rotationLab", "secantSlope", "sequenceBuild", "sliceSum", "slider", "slopeField", "spinnerSim",
  "taylorApprox", "treeDiagram", "triangleSolve", "unitCircleExplore", "vectorExplore",
]);

const rows: Row[] = [];
const skipped: Array<{ engine: string; reason: string; n: number }> = [];
const outOfScope = new Map<string, number>();
let scanned = 0;

for (const file of globSync("content/courses/*/lessons/*.json")) {
  const lesson = JSON.parse(readFileSync(file, "utf8")) as { steps?: Array<Record<string, unknown>> };
  for (const step of lesson.steps ?? []) {
    /* PARSE, do not read raw. `evaluate` is written against the Zod-parsed spec, where `.default([])`
     * has already filled `commonPlacements` and friends; handing it raw lesson JSON crashes on the
     * first optional array. The player parses too, so this is also the spec the learner meets. */
    const parsed = WidgetSpec.safeParse(step.widget);
    if (!parsed.success) continue;
    const spec = parsed.data as unknown as Spec;
    const model = modelFor(spec);
    if (!model) {
      /* Two different absences, and collapsing them is how an audit reports a clean corpus it
       * never looked at: an R3 engine with no enumerator at all, versus one recognised here whose
       * state space this model cannot walk (moneyBoard's `count` mode grades a typed total, not a
       * tray build, so there is no control space to enumerate). */
      if (!R3.has(spec.type)) continue;
      const key = MODELLED.has(spec.type) ? `${spec.type} — recognised, no enumerable control space` : spec.type;
      outOfScope.set(key, (outOfScope.get(key) ?? 0) + 1);
      continue;
    }
    scanned++;
    const C = model.candidates;
    if (C.length < 2 || C.length > MAX_CANDIDATES) {
      skipped.push({ engine: spec.type, reason: C.length < 2 ? "degenerate" : "too large to enumerate", n: C.length });
      continue;
    }
    const asSubmission = model.submit ?? ((c: unknown) => c);
    /* Probes: an even spread across the reachable space. The attacker gets no help choosing —
     * he is picking positions on a dial, which is exactly what he can do without mathematics. */
    const stride = Math.max(1, Math.floor(C.length / MAX_PROBES));
    let best = { p: 0, classes: 0, accepting: 0 };
    for (let i = 0; i < C.length; i += stride) {
      const probe = asSubmission(C[i]);
      if (probe === undefined) continue;
      const classes = new Set<string>();
      let accepting = 0;
      for (const c of C) {
        const r = evaluate(model.retarget(spec, c) as never, probe);
        if (r.correct) accepting++;
        else classes.add(r.feedback);
      }
      const score = accepting + classes.size;
      if (score > best.accepting + best.classes) best = { p: i, classes: classes.size, accepting };
    }
    const pOracle = Math.min(1, (best.accepting + best.classes) / C.length);
    /* Blind: two distinct submissions, no feedback read. The acceptance set is the same size
     * wherever it sits, so two independent draws are worth 2·|W|/|C| minus the overlap. */
    const pBlind = Math.min(1, (2 * best.accepting) / C.length);
    rows.push({
      lesson: file.split("/").pop()!.replace(".json", ""),
      step: String(step.id), kind: String(step.kind ?? "?"), engine: spec.type,
      candidates: C.length, classes: best.classes, accepting: best.accepting,
      pOracle: Math.round(pOracle * 1000) / 1000,
      pBlind: Math.round(pBlind * 1000) / 1000,
      advantage: Math.round((pOracle / Math.max(pBlind, 1e-9)) * 100) / 100,
      fishable: pOracle >= 0.999,
    });
  }
}

const graded = rows.filter((r) => r.kind === "check" || r.kind === "challenge");
const interactive = rows.filter((r) => r.kind === "interactive");
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "ENG01_R3_FISHING_ORACLE.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} — S242/ENG-01 R3. Win probability in TWO submissions for an attacker who`,
  "# reads only the feedback string and knows no mathematics, against a blind two-guess baseline.",
  "# pOracle = (|accepting| + #feedback classes)/|candidates| for the best probe. fishable = pOracle 1.0.",
  "lesson,step,kind,engine,candidates,feedbackClasses,acceptingStates,pOracle,pBlind,advantage,fishable",
  ...rows
    .sort((a, b) => Number(b.fishable) - Number(a.fishable) || b.pOracle - a.pOracle || a.candidates - b.candidates)
    .map((r) => [r.lesson, r.step, r.kind, r.engine, r.candidates, r.classes, r.accepting, r.pOracle, r.pBlind, r.advantage, r.fishable].join(","))
].join("\n") + "\n");

console.log(`fishing-oracle @ ${seal}`);
console.log(`  ${scanned} R3 widget instances reached an enumerator; ${rows.length} enumerated, ${skipped.length} skipped`);
console.log(`  graded (check/challenge): ${graded.length}   interactive: ${interactive.length}   other: ${rows.length - graded.length - interactive.length}`);
console.log(`  GRADED — mean P(win in 2): oracle ${mean(graded.map((r) => r.pOracle)).toFixed(3)} vs blind ${mean(graded.map((r) => r.pBlind)).toFixed(3)}`);
console.log(`  GRADED — fishable to certainty WITHOUT mathematics: ${graded.filter((r) => r.fishable).length}`);
console.log(`  INTERACTIVE — fishable to certainty in two: ${interactive.filter((r) => r.fishable).length} (ungraded: wastes the learning, forges nothing)`);
for (const r of graded.filter((x) => x.fishable))
  console.log(`    ! ${r.lesson}#${r.step} (${r.kind}) ${r.engine}: ${r.candidates} candidates, ${r.accepting} accepted, ${r.classes} classes`);
const byEngine = new Map<string, Row[]>();
for (const r of graded) byEngine.set(r.engine, [...(byEngine.get(r.engine) ?? []), r]);
console.log("\n  graded, by engine:");
for (const [engine, rs] of [...byEngine].sort((a, b) => b[1].length - a[1].length))
  console.log(`    ${engine.padEnd(18)} ${String(rs.length).padStart(3)} steps · mean pOracle ${mean(rs.map((r) => r.pOracle)).toFixed(3)} · blind ${mean(rs.map((r) => r.pBlind)).toFixed(3)} · fishable ${rs.filter((r) => r.fishable).length}`);
const bySkip = new Map<string, number>();
for (const s of skipped) bySkip.set(`${s.engine}: ${s.reason}`, (bySkip.get(`${s.engine}: ${s.reason}`) ?? 0) + 1);
for (const [k, n] of outOfScope) bySkip.set(k, (bySkip.get(k) ?? 0) + n);
if (bySkip.size) {
  console.log("\n  NOT MEASURED — declared, not dropped (R3 instances with no enumerator here):");
  for (const [k, n] of [...bySkip].sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(4)}  ${k}`);
}
console.log(`  wrote ${relative(ROOT, csv)}`);
