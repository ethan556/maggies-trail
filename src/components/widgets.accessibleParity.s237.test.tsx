// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

/**
 * S237 — APP-WIDE ACCESSIBLE/VISIBLE PARITY GATE.
 *
 * THE RULE THIS ENFORCES:
 *   Accessible-only text — sr-only spans and aria-labels — may never state a numeric value that
 *   the visible interface withholds.
 *
 * WHY IT EXISTS. Two engines were caught handing screen-reader users the answer sighted learners
 * had to work out. moneyBoard's receipt printed "Change ?" — the author deliberately withholding
 * it — while the sr-only text announced "target 325 cents". lengthCompare asked learners to count
 * an overhang and then stated its length in the SVG's accessible name. No existing gate could see
 * either: the visible DOM was correct in both cases, and the tests only ever read textContent,
 * which silently concatenates sr-only text with visible text.
 *
 * WHY THE RULE IS SHAPED THIS WAY. It is self-correcting about legitimate targets. A goal stated
 * in the prompt ("How many nickels make 25 cents?") is in the VISIBLE text, so naming it in the
 * accessible text is parity and passes. Only a value that exists solely in the accessible layer
 * fails — which is exactly the defect.
 *
 * NOT the inverse gate. This must never be "satisfied" by deleting accessible text: removing a
 * description would leave blind users worse off than before. See widgets.answerParity.s237.test.tsx,
 * which asserts the givens are still SPOKEN for the two fixed engines. Both directions are pinned.
 *
 * 0 and 1 are ignored throughout — they appear as counters, indices and "1 coin" pluralisation
 * everywhere, and would drown real findings.
 *
 * PROVEN LIMIT — READ BEFORE TRUSTING A GREEN RUN.
 * This gate catches ASYMMETRIES, not every answer leak. Verified empirically: reverting the
 * moneyBoard fix and re-running leaves this gate GREEN. The reason is that the same value also
 * reaches the "Describe this model" <details> panel, which is collapsed but VISIBLE to everyone,
 * so the number appears in both layers and no asymmetry exists to detect.
 *
 * Two consequences:
 *   1. A green run here does NOT mean no answer is leaking. It means no answer is leaking to
 *      screen-reader users ALONE. Leaks visible to everybody are a different defect class, tracked
 *      in ANSWER_ON_SCREEN_AUDIT_S237.md, and need per-engine gating behind tone === "info".
 *   2. The two engines fixed in 79b0671 are pinned by widgets.answerParity.s237.test.tsx, which
 *      asserts the specific strings directly. Do not delete that file believing this one covers it.
 *
 * Sampling is keyed by type AND mode because a per-type sample missed the leaky path entirely:
 * moneyBoard's change mode is a different render path from compose, and with two samples per
 * engine it was never selected. That was also found by the revert-and-rerun check, not by reasoning.
 */

afterEach(cleanup);

const SAMPLES_PER_ENGINE = 2;

type Sample = { type: string; lesson: string; spec: TWidget };

/** Authored specs grouped by engine, validated so a malformed fixture cannot masquerade as a pass. */
function collectSamples(): Sample[] {
  const byType = new Map<string, Sample[]>();
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const f = join(dir, e.name);
      if (e.isDirectory()) walk(f);
      else if (f.endsWith(".json")) {
        let j: unknown;
        try { j = JSON.parse(readFileSync(f, "utf8")); } catch { continue; }
        const lesson = e.name.replace(/\.json$/, "");
        (function rec(n: unknown) {
          if (!n || typeof n !== "object") return;
          const node = n as Record<string, unknown>;
          if (typeof node.type === "string" && typeof node.prompt === "string") {
            const parsed = WidgetSpec.safeParse(node);
            if (parsed.success) {
              // Keyed by type AND mode. Sampling by type alone let the leaky path go untested:
              // moneyBoard's change mode is a different render path from compose, and with two
              // samples per engine it never got picked. A reverted-fix check proved the gate blind.
              const mode = typeof node.mode === "string" ? node.mode : "-";
              const key = `${node.type}:${mode}`;
              const list = byType.get(key) ?? [];
              if (list.length < SAMPLES_PER_ENGINE) {
                list.push({ type: node.type, lesson, spec: parsed.data as TWidget });
                byType.set(key, list);
              }
            }
          }
          for (const k in node) rec(node[k]);
        })(j);
      }
    }
  };
  walk("content");
  return [...byType.values()].flat();
}

const numbersIn = (text: string): string[] => {
  const out: string[] = [];
  for (const m of text.matchAll(/-?\d+(?:\.\d+)?/g)) {
    const n = Number(m[0]);
    if (Number.isFinite(n) && Math.abs(n) > 1) out.push(m[0]);
  }
  return out;
};

/** Split the rendered tree into what a sighted learner reads and what only assistive tech reads. */
function splitText(root: HTMLElement): { visible: string; accessibleOnly: string } {
  const clone = root.cloneNode(true) as HTMLElement;
  const srNodes = Array.from(clone.querySelectorAll(".sr-only"));
  const srText = srNodes.map((n) => n.textContent ?? "").join(" ");
  srNodes.forEach((n) => n.remove());
  // aria-label REPLACES an element's content for assistive tech, so it is accessible-only unless
  // the same string is also rendered as visible text.
  //
  // INTERACTIVE elements are excluded on purpose. A control's accessible NAME is a navigational
  // affordance ("Add a quarter", "cell 5"), not a description of state, and per-cell indices
  // collide constantly with small answer values — tenFrame's cell-5 button label against a target
  // total of 5 was a false positive that cost real investigation. Both genuine defects lived in
  // DESCRIPTIVE text: moneyBoard in an sr-only span, lengthCompare in a role="img" label.
  const describers = Array.from(root.querySelectorAll("[aria-label]")).filter(
    (n) => !n.matches('button, input, select, textarea, a, [role="button"], [role="link"], [role="spinbutton"]')
  );
  const ariaText = describers.map((n) => n.getAttribute("aria-label") ?? "").join(" ");
  return { visible: flatten(clone), accessibleOnly: `${srText} ${ariaText}` };
}

/**
 * S237b — textContent is WRONG here, and wrong in the direction that manufactures violations. It
 * concatenates sibling text nodes with no separator, so a readout showing 28.27 followed by a
 * progress line starting "0 of 4" yields "28.270"; numbersIn() reads a maximal numeric token and
 * reports 28.270, so 28.27 looks absent from the visible layer while the SVG description states
 * it. solidSliceLab then fails a parity rule it has never broken. Found when a counter moved next
 * to a readout, which is the only reason it surfaced at all.
 *
 * Walking text nodes and joining with a space is what the DOM means: separate text nodes in
 * separate elements are never one token. STRICTER, not looser — fusion can equally bury a real
 * leaked number inside a longer token, and no longer can.
 */
function flatten(root: HTMLElement): string {
  const parts: string[] = [];
  const walk = (n: Node) => {
    if (n.nodeType === 3) { const t = n.textContent; if (t && t.trim()) parts.push(t.trim()); return; }
    n.childNodes.forEach(walk);
  };
  walk(root);
  return parts.join(" ");
}

/**
 * BASELINE — EXPLICITLY NOT A LIST OF APPROVED EXEMPTIONS.
 *
 * Every entry here is an UNREVIEWED candidate defect: a number spoken in descriptive accessible
 * text that the visible interface does not render. Some are certainly legitimate — a box plot's
 * quartiles and a number line's ticks ARE the picture, and stating them is the whole point of an
 * accessible description. At least one (extraneousRootLab) is a known leak from
 * ANSWER_ON_SCREEN_AUDIT_S237.md and should be removed from this list by fixing the engine, not by
 * keeping it here.
 *
 * The gate ratchets: anything NEW fails immediately. Entries should only ever leave this list.
 * Do not add to it to make a build pass.
 */

/**
 * S237b — 11 entries were removed from this list, and NOT by fixing an engine. They never
 * occurred: the old splitText fused adjacent sibling text nodes, so values the screen genuinely
 * showed read as missing. Half this list was that artifact —
 *   absValueLine|51, absValueLine|9, boxPlot|100, boxPlot|20, boxPlot|60, boxPlot|80, dragOrder|5, dragOrder|6, dragOrder|7, dragOrder|8, triangleSolve|39
 * None of those engines was edited when the entries were dropped; correcting the tokenizer alone
 * made them stop firing. Re-adding any of them without a reproduction is a regression, not a
 * finding. The 11 that remain were re-measured against the corrected tokenizer and all still fire.
 */
const KNOWN_UNREVIEWED = new Set<string>([
  "boxPlot|15",
  "boxPlot|5",
  "boxPlot|70",
  "boxPlot|90",
  "extraneousRootLab|2",
  "moneyBoard|2",
  "moneyBoard|5",
  "oddEvenPairs|7",
  "taylorApprox|8",
  "tenFrame|10",
  "trialProbabilityLab|14",
]);

const samples = collectSamples();

describe("S237 app-wide accessible/visible parity", () => {
  it("samples a broad set of authored engines", () => {
    // Guards against the walker silently collecting nothing and the gate passing vacuously.
    expect(samples.length).toBeGreaterThan(100);
  });

  it("SELF-CHECK: the detector actually fires on a planted leak", () => {
    // A gate that passes because it detects nothing is worse than no gate. This plants the exact
    // moneyBoard shape that was fixed — an answer present only in sr-only text — and asserts the
    // detector catches it. If this ever goes green-by-blindness, the main assertion below is void.
    const leaky = document.createElement("div");
    leaky.innerHTML =
      '<p>Paid 1000c Cost 675c Change ?</p><span class="sr-only">target 325 cents</span>';
    const { visible, accessibleOnly } = splitText(leaky);
    const visibleNums = new Set(numbersIn(visible));
    const spokenNums = new Set(numbersIn(accessibleOnly));
    expect(spokenNums.has("325")).toBe(true);
    expect(visibleNums.has("325")).toBe(false);

    // And the converse: a value shown in BOTH places must not be flagged.
    const fine = document.createElement("div");
    fine.innerHTML = '<p>How many nickels make 25 cents?</p><span class="sr-only">target 25 cents</span>';
    const f = splitText(fine);
    expect(new Set(numbersIn(f.visible)).has("25")).toBe(true);
  });

  it("never states a number in accessible-only text that the visible interface withholds", () => {
    const violations: string[] = [];
    const skipped: string[] = [];

    for (const { type, lesson, spec } of samples) {
      let host: HTMLElement;
      try {
        host = render(
          <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone="neutral" />
        ).container;
      } catch (err) {
        // A render failure is a real defect but belongs to a different gate; record, do not mask.
        skipped.push(`${type} (${lesson}): render threw — ${(err as Error).message.slice(0, 80)}`);
        cleanup();
        continue;
      }
      const { visible, accessibleOnly } = splitText(host);
      const visibleNums = new Set(numbersIn(visible));
      const spokenNums = new Set(numbersIn(accessibleOnly));
      for (const n of spokenNums) {
        if (!visibleNums.has(n)) violations.push(`${type}|${n}`);
      }
      cleanup();
    }

    if (skipped.length) {
      // eslint-disable-next-line no-console
      console.log(`\n[parity] ${skipped.length} spec(s) could not render:\n  ${skipped.slice(0, 10).join("\n  ")}`);
    }
    const seen = new Set(violations);
    const fresh = [...seen].filter((v) => !KNOWN_UNREVIEWED.has(v)).sort();
    if (fresh.length) {
      // eslint-disable-next-line no-console
      console.log(`\n[parity] ${fresh.length} NEW violation(s):\n  ${fresh.join("\n  ")}`);
    }
    // Only NEW violations fail. The baseline is a ratchet, not an approval — see KNOWN_UNREVIEWED.
    expect(fresh).toEqual([]);
  });
});
