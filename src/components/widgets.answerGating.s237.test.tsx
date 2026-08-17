// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import type { TWidget } from "@/lib/schema";

/** Load an authored spec rather than hand-writing one: a fixture that drifts from the real schema
 *  silently tests nothing. An earlier draft invented `stages: {label, options}` and simply threw. */
function authored(type: string, match: (s: Record<string, unknown>) => boolean): TWidget {
  let found: TWidget | null = null;
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (found) return;
      const f = join(dir, e.name);
      if (e.isDirectory()) walk(f);
      else if (f.endsWith(".json")) {
        let j: unknown;
        try { j = JSON.parse(readFileSync(f, "utf8")); } catch { continue; }
        (function rec(n: unknown) {
          if (!n || typeof n !== "object" || found) return;
          const node = n as Record<string, unknown>;
          if (node.type === type && match(node)) { found = node as unknown as TWidget; return; }
          for (const k in node) rec(node[k]);
        })(j);
      }
    }
  };
  walk("content");
  if (!found) throw new Error(`no authored ${type} spec matched`);
  return found;
}

/**
 * S237. Engines that printed their own graded answer during active work now hold it until a
 * verdict, matching the tone === "info" convention each component already used for its GhostChip.
 *
 * Both directions are asserted. Active work must not show the answer; the verdict state must still
 * show it, so a future change cannot "pass" by deleting the worked feedback entirely.
 */

const active = { value: null, onChange: () => {}, disabled: false, tone: "neutral" as const };
const verdict = { value: null, onChange: () => {}, disabled: true, tone: "info" as const };
const text = () => (document.body.textContent ?? "").replace(/\s+/g, " ");

afterEach(cleanup);

const noSolution = authored("equationOutcomeLab", (n) => Array.isArray(n.choices) && n.choices.length > 0);

describe("S237 graded answers are held until a verdict", () => {
  // compoundEventLab was subsequently closed as a P0 canary: the outcome cells remain available
  // to count, while the computed total and probability now wait for a settled/revealed answer.

  it("equationOutcomeLab does not announce the outcome while the learner is classifying", () => {
    render(<WidgetRenderer spec={noSolution} {...active} />);
    // Scope to the stem: "No solution" is also a CHOICE LABEL, which must obviously still render.
    const buttons = Array.from(document.querySelectorAll("button")).map((b) => b.textContent ?? "");
    const stem = buttons.reduce((acc, b) => acc.replace(b, ""), text());
    expect(stem).not.toMatch(/no solution/i);
  });

  it("equationOutcomeLab still shows the outcome after a verdict", () => {
    render(<WidgetRenderer spec={noSolution} {...verdict} />);
    expect(text()).toMatch(/no solution/i);
  });
});
