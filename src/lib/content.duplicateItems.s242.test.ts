/**
 * S242 / MCQ-01 — THE SAME QUESTION TWICE IN ONE LESSON, RATCHETED.
 *
 * 75 lessons ask an identical MCQ twice — same prompt, same option set, usually `k1` and again at
 * `k3`. A learner answers it, meets it again in the same sitting, and TWO independent "correct"
 * attempts are recorded against ONE remembered item. That is precisely the mastery-as-memory failure
 * this program exists to remove, reintroduced by copy-paste.
 *
 * `refreshLessonSteps` now regenerates every later occurrence, on every walk including the first —
 * the one exception to the first-walk-is-authored rule, argued at its definition. That closes the 8
 * whose conceptTag resolves a generator today, and each of the other 67 the moment one does.
 *
 * THIS FILE IS THE RATCHET, and it exists because the mechanism alone cannot fix 67 of them. Two
 * numbers are pinned:
 *
 *   · the count of duplicated groups may not RISE — a new copy-paste is a regression;
 *   · the count that the refresh cannot differentiate may not rise either, so adding a duplicate
 *     whose tag has no generator is caught even while the totals drift downward.
 *
 * Both are exact equalities against the measured baseline. An exact match is deliberate: a `<=`
 * would let someone quietly delete a lesson to buy headroom, and it would not force the ledger in
 * MCQ01_DISTRACTOR_REUSE.md to be updated when the number genuinely improves.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { variantForStep } from "./variants";

const ROOT = process.cwd();

/** Measured at seal 642965a, 2026-08-16. Lower these when the ledger is updated, never raise them. */
const BASELINE_DUPLICATE_GROUPS = 75;
const BASELINE_UNDIFFERENTIABLE = 67;

/* CROSS-LESSON DUPLICATION IS THE LARGER HALF AND WAS NOT RATCHETED.
 *
 * The within-lesson case is the worst — same sitting, two attempts on one remembered item — but it
 * is a subset. 162 distinct items appear more than once across 377 placements, and the same
 * question asked in lesson A and again in lesson B is still one item counted twice by the mastery
 * model. It also turned out to be the cause of a SECOND finding: 55% of the "reused filler
 * distractor" slots in MCQ01_DISTRACTOR_REUSE.md sit on a duplicated item, so the distractor
 * repeats only because the whole question does.
 *
 * The lesson refresh cannot help here: two lessons each meeting the item once are each on their
 * own first walk, and the first walk is authored by design. This is authoring work, and pinning it
 * is what stops it growing while that work is queued. */
const BASELINE_DUPLICATED_ITEMS = 162;
const BASELINE_DUPLICATE_PLACEMENTS = 377;

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

interface Occurrence { lesson: string; step: string; index: number; raw: Record<string, unknown> }

/** Identity as a learner meets it: the question, and the set of options, ignoring their order. */
function itemIdentity(widget: { type?: string; prompt?: string; options?: Array<{ label?: string }> }): string | null {
  if (widget.type !== "mcq" || !widget.prompt?.trim() || !Array.isArray(widget.options)) return null;
  const labels = widget.options.map((option) => String(option.label ?? "").trim()).sort().join("|");
  return `${widget.prompt.trim()}~~${labels}`;
}

function duplicateGroups(): Occurrence[][] {
  const groups: Occurrence[][] = [];
  for (const file of walk(join(ROOT, "content", "courses"))) {
    let json: { lesson?: { id?: string; steps?: unknown[] }; id?: string; steps?: unknown[] };
    try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
    const lesson = json.lesson ?? json;
    if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
    const byIdentity = new Map<string, Occurrence[]>();
    for (const [index, raw] of lesson.steps.entries()) {
      const step = raw as { id?: string; widget?: Record<string, unknown> };
      const identity = step.widget ? itemIdentity(step.widget as never) : null;
      if (!identity) continue;
      if (!byIdentity.has(identity)) byIdentity.set(identity, []);
      byIdentity.get(identity)!.push({ lesson: String(lesson.id), step: String(step.id ?? index), index, raw: step as Record<string, unknown> });
    }
    for (const occurrences of byIdentity.values()) {
      if (occurrences.length > 1) groups.push(occurrences.sort((a, b) => a.index - b.index));
    }
  }
  return groups;
}

/** Every authored mcq item, keyed by identity, wherever it appears. */
function placementsByItem(): Map<string, string[]> {
  const byItem = new Map<string, string[]>();
  for (const file of walk(join(ROOT, "content", "courses"))) {
    let json: { lesson?: { id?: string; steps?: unknown[] }; id?: string; steps?: unknown[] };
    try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
    const lesson = json.lesson ?? json;
    if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
    for (const [index, raw] of lesson.steps.entries()) {
      const step = raw as { id?: string; widget?: Record<string, unknown> };
      const identity = step.widget ? itemIdentity(step.widget as never) : null;
      if (!identity) continue;
      if (!byItem.has(identity)) byItem.set(identity, []);
      byItem.get(identity)!.push(`${lesson.id}#${step.id ?? index}`);
    }
  }
  return byItem;
}

describe("MCQ-01 — duplicate items across the corpus", () => {
  it("does not grow", () => {
    const byItem = placementsByItem();
    const duplicated = [...byItem.values()].filter((where) => where.length > 1);
    const placements = duplicated.reduce((n, where) => n + where.length, 0);
    expect(duplicated.length, "distinct items appearing more than once").toBe(BASELINE_DUPLICATED_ITEMS);
    expect(placements, "placements those duplicated items occupy").toBe(BASELINE_DUPLICATE_PLACEMENTS);
  });
});

describe("MCQ-01 — within-lesson duplicate items", () => {
  const groups = duplicateGroups();

  it("does not grow", () => {
    const where = groups.slice(0, 8).map((g) => `${g[0].lesson}: ${g.map((o) => o.step).join(" = ")}`);
    expect(groups.length, `duplicate groups changed. First few: ${where.join(" · ")}`).toBe(BASELINE_DUPLICATE_GROUPS);
  });

  it("counts how many the lesson refresh still cannot differentiate", () => {
    /* A later occurrence is CLOSED when `variantForStep` resolves for it, because the refresh then
     * regenerates it away from the first copy. It is OPEN when nothing resolves — the learner still
     * meets the identical question twice, and only authoring or a new generator fixes it. */
    const open: string[] = [];
    for (const group of groups) {
      for (const occurrence of group.slice(1)) {
        let resolved = null;
        try { resolved = variantForStep(occurrence.raw as never, `${occurrence.lesson}:${occurrence.step}:dup`, "core"); } catch { /* unresolved */ }
        if (!resolved) open.push(`${occurrence.lesson}#${occurrence.step} tag=${String(occurrence.raw.conceptTag ?? "-")}`);
      }
    }
    expect(open.length, `undifferentiable duplicates changed. Sample: ${open.slice(0, 5).join(" · ")}`).toBe(BASELINE_UNDIFFERENTIABLE);
  });

  it("regenerates the later occurrence wherever a generator exists", () => {
    // The mechanism half, asserted directly: where a variant resolves, it must differ from the copy
    // the learner already answered. A "fix" that served the same widget again would pass the counts.
    let checked = 0;
    for (const group of groups) {
      const first = JSON.stringify(group[0].raw.widget);
      for (const occurrence of group.slice(1)) {
        let resolved = null;
        try { resolved = variantForStep(occurrence.raw as never, `${occurrence.lesson}:${occurrence.step}:0:repeat`, "core"); } catch { /* unresolved */ }
        if (!resolved) continue;
        checked++;
        expect(JSON.stringify(resolved.widget), `${occurrence.lesson}#${occurrence.step} regenerated to the same widget`).not.toBe(first);
      }
    }
    expect(checked, "no duplicate resolved a variant — this test is measuring nothing").toBeGreaterThan(0);
  });
});
