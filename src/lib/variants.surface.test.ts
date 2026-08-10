/**
 * SURFACE PRESERVATION GATE.
 *
 * Practice and review both refresh an authored item by replacing its widget with a generated one.
 * A conceptTag names a SKILL, and a skill can be authored on several surfaces — `tse-solve-two-step`
 * carries numeric items, solveBalance items and inversePipeline items at once. The generator for that
 * tag emits exactly one surface. Without a guard, refreshing a balance or an undo-machine hands the
 * learner a text field instead: correctly graded, deterministic, and a strictly worse lesson.
 *
 * This gate walks every practice-eligible authored step in the corpus and asserts that
 * `variantForStep` either preserves the surface or declines. It is a real regression risk rather than
 * a hypothetical: at the time this file was written ten authored steps were silently downgrading,
 * six of them manipulatives.
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { hasVariants, variantFor, variantForStep } from "./variants";

type Step = {
  kind?: string;
  conceptTag?: string;
  widget?: { type?: string };
  variant?: { gen: string; form?: string };
};

type Row = { tag: string; type: string; file: string; step: Step };

function authoredSteps(): Row[] {
  const out: Row[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        walk(p);
        continue;
      }
      if (!e.name.endsWith(".json")) continue;
      let j: { steps?: Step[] };
      try {
        j = JSON.parse(readFileSync(p, "utf8")) as { steps?: Step[] };
      } catch {
        continue;
      }
      for (const s of j.steps ?? []) {
        if ((s.kind !== "check" && s.kind !== "challenge") || !s.widget?.type || !s.conceptTag) continue;
        out.push({ tag: s.conceptTag, type: s.widget.type, file: e.name, step: s });
      }
    }
  };
  walk(join(process.cwd(), "content", "courses"));
  return out;
}

describe("variant substitution preserves the authored surface", () => {
  const steps = authoredSteps();

  it("finds a corpus to check", () => {
    expect(steps.length).toBeGreaterThan(1000);
  });

  it("never swaps an authored widget for a different widget type", () => {
    const bad: string[] = [];
    for (const s of steps) {
      const v = variantForStep(s.step, `gate:${s.file}:${s.tag}`);
      if (v && v.widget.type !== s.type) bad.push(`${s.file} ${s.tag}: ${s.type} → ${v.widget.type}`);
    }
    expect(bad).toEqual([]);
  });

  it("declines rather than downgrades where a tag's generator has another surface", () => {
    // The guard must actually be load-bearing: somewhere in the corpus a covered step's generator
    // emits a different type, and variantForStep must return null there while variantFor does not.
    // If this ever stops being true the tags have become surface-homogeneous, and the guard is free
    // insurance rather than dead code — either way, say so out loud rather than deleting it.
    const declined = steps.filter((s) => {
      if (s.step.variant !== undefined) return false; // declared steps serve their own surface
      if (!hasVariants(s.tag)) return false;
      const raw = variantFor(s.tag, "probe");
      return raw !== null && raw.widget.type !== s.type;
    });
    for (const s of declined) {
      expect(variantForStep(s.step, "probe"), `${s.file} ${s.tag} should decline`).toBeNull();
    }
  });

  it("still refreshes where the surfaces agree", () => {
    const refreshed = steps.filter((s) => variantForStep(s.step, `x:${s.file}:${s.tag}`) !== null);
    // Guarding must not silently switch freshness off across the board.
    expect(refreshed.length).toBeGreaterThan(150);
  });
});
