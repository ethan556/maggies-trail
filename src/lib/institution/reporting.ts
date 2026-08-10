/**
 * DISTRICT REPORTING — aggregates that are safe to put in a board deck.
 *
 * The hard part of district reporting is not the arithmetic, it is the
 * privacy. An "aggregate" over four children is not an aggregate; it is four
 * children's records with a mean drawn on top. Two suppression rules therefore
 * run on EVERY cell before it leaves this module:
 *
 *   PRIMARY SUPPRESSION    a cell with fewer than `minCohort` learners
 *                          publishes its count band and nothing else.
 *   COMPLEMENTARY          if exactly one cell in a row is suppressed, the
 *   SUPPRESSION            next-smallest cell is suppressed too — otherwise
 *                          the reader subtracts it back out of the row total.
 *                          This is the step most implementations skip, and it
 *                          is the one that actually leaks.
 *
 * `minCohort` defaults to 10, the threshold most state education agencies use
 * for public reporting. It is a parameter rather than a constant because the
 * correct value is set by the district's own policy, not by us.
 *
 * Percentages are computed then ROUNDED ONCE at the edge. Rounding inputs and
 * summing them is how a report ends up claiming 101%.
 */

import { PROFICIENT, retainedMastery, type SkillState } from "@/lib/mastery";

export interface ReportLearner {
  learnerId: string;
  /** Grouping keys. Absent values collapse into "—" rather than dropping the row. */
  schoolId: string;
  schoolName: string;
  classId: string;
  className: string;
  grade: number | null;
  mastery: Record<string, SkillState>;
  lessonsCompleted: number;
  activeDays14: number;
}

export type Dimension = "school" | "class" | "grade";

export interface Cell {
  key: string;
  label: string;
  learners: number;
  /** Undefined whenever the cell is suppressed — the type makes leaking hard. */
  proficientShare?: number;
  meanLessons?: number;
  meanActiveDays?: number;
  suppressed: boolean;
  /** Why, in words the recipient can act on. */
  suppressionReason?: "below-threshold" | "complementary";
}

export interface Report {
  dimension: Dimension;
  minCohort: number;
  cells: Cell[];
  /** The all-up row. Suppressed only if the WHOLE population is below threshold. */
  total: Cell;
  generatedFor: string;
}

const keyFor = (l: ReportLearner, d: Dimension): { key: string; label: string } => {
  if (d === "school") return { key: l.schoolId || "—", label: l.schoolName || "Unassigned school" };
  if (d === "class") return { key: l.classId || "—", label: l.className || "Unassigned class" };
  return { key: l.grade === null ? "—" : String(l.grade), label: l.grade === null ? "Ungraded" : `Grade ${l.grade}` };
};

/** Proficient AND retained — the same bar the learner's own ladder uses. */
function proficientShareOf(l: ReportLearner, today: string): number {
  const attempted = Object.values(l.mastery ?? {}).filter((s) => s.attempts > 0);
  if (attempted.length === 0) return 0;
  const good = attempted.filter((s) => s.mastery >= PROFICIENT && retainedMastery(s, today) >= PROFICIENT).length;
  return good / attempted.length;
}

const mean = (xs: number[]) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);

function measure(group: ReportLearner[], key: string, label: string, today: string): Cell {
  return {
    key,
    label,
    learners: group.length,
    proficientShare: mean(group.map((l) => proficientShareOf(l, today))),
    meanLessons: mean(group.map((l) => l.lessonsCompleted)),
    meanActiveDays: mean(group.map((l) => l.activeDays14)),
    suppressed: false
  };
}

function suppress(cell: Cell, reason: NonNullable<Cell["suppressionReason"]>): Cell {
  return {
    key: cell.key,
    label: cell.label,
    learners: cell.learners,
    suppressed: true,
    suppressionReason: reason
  };
}

/**
 * Build one report. Cells come back label-sorted so two runs over the same
 * population produce byte-identical output — a district that diffs last
 * month's CSV against this month's should see only real changes.
 */
export function buildReport(
  learners: ReportLearner[],
  dimension: Dimension,
  today: string,
  minCohort = 10
): Report {
  const groups = new Map<string, { label: string; members: ReportLearner[] }>();
  for (const l of learners) {
    const { key, label } = keyFor(l, dimension);
    const g = groups.get(key) ?? { label, members: [] };
    g.members.push(l);
    groups.set(key, g);
  }

  let cells = [...groups.entries()]
    .map(([key, g]) => measure(g.members, key, g.label, today))
    .sort((a, b) => a.label.localeCompare(b.label) || a.key.localeCompare(b.key));

  // Primary suppression.
  cells = cells.map((c) => (c.learners < minCohort ? suppress(c, "below-threshold") : c));

  // Complementary suppression: one suppressed cell is subtractable from the
  // total, so a second (the smallest remaining) must go too.
  const suppressedCount = cells.filter((c) => c.suppressed).length;
  if (suppressedCount === 1 && cells.length > 1) {
    let smallest = -1;
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].suppressed) continue;
      if (smallest === -1 || cells[i].learners < cells[smallest].learners) smallest = i;
    }
    if (smallest >= 0) cells[smallest] = suppress(cells[smallest], "complementary");
  }

  const total = measure(learners, "__total__", "All learners", today);
  const totalCell = learners.length < minCohort ? suppress(total, "below-threshold") : total;

  return { dimension, minCohort, cells, total: totalCell, generatedFor: today };
}

// ── Growth ──────────────────────────────────────────────────────────────────

export interface GrowthPoint {
  /** ISO date of the period end. */
  date: string;
  learners: number;
  proficientShare?: number;
  suppressed: boolean;
}

/**
 * A growth series is a sequence of already-computed snapshots. We do NOT
 * reconstruct history from current state — mastery decays with time, so
 * replaying today's records through a past date would fabricate a trend line
 * that never happened. Callers pass real snapshots or get nothing.
 */
export function growthSeries(
  snapshots: Array<{ date: string; learners: number; proficientShare: number }>,
  minCohort = 10
): GrowthPoint[] {
  return [...snapshots]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) =>
      s.learners < minCohort
        ? { date: s.date, learners: s.learners, suppressed: true }
        : { date: s.date, learners: s.learners, proficientShare: s.proficientShare, suppressed: false }
    );
}

// ── Export ──────────────────────────────────────────────────────────────────

const pct = (v: number | undefined) => (v === undefined ? "" : String(Math.round(v * 1000) / 10));
const num1 = (v: number | undefined) => (v === undefined ? "" : String(Math.round(v * 10) / 10));

export const REPORT_HEADERS = [
  "dimension",
  "key",
  "label",
  "learners",
  "proficient_retained_pct",
  "mean_lessons_completed",
  "mean_active_days_14",
  "suppressed",
  "suppression_reason"
] as const;

/** CSV for the district's own warehouse. Suppressed cells export blank measures, never zeros. */
export function reportCsv(report: Report): string {
  const rows = [...report.cells, report.total].map((c) => ({
    dimension: report.dimension,
    key: c.key,
    label: c.label,
    learners: c.learners,
    proficient_retained_pct: pct(c.proficientShare),
    mean_lessons_completed: num1(c.meanLessons),
    mean_active_days_14: num1(c.meanActiveDays),
    suppressed: c.suppressed ? "true" : "false",
    suppression_reason: c.suppressionReason ?? ""
  }));
  const head = REPORT_HEADERS.join(",");
  const body = rows.map((r) => REPORT_HEADERS.map((h) => String(r[h])).join(","));
  return [head, ...body].join("\r\n");
}
