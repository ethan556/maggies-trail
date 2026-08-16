// @vitest-environment jsdom
/**
 * S242 — THE CONTRACTS THIS SESSION LANDED, CHECKED OVER THE **GENERATED** CORPUS.
 *
 * `ACC01_ACCESSIBILITY_MATRIX.md` §8 item 5 states the gap this closes, and states it plainly:
 *
 *   > Runtime-generated widget specs are outside the denominator. All counts are of AUTHORED
 *   > specs. **5,897 `variant` declarations regenerate specs at runtime**; a generator emitting a
 *   > different `tone` condition would change §5(f)'s reach invisibly to a corpus grep. Settling
 *   > that needs the generators run.
 *
 * Every count in ENG-01 and ACC-01 is of authored specs. The generated corpus is larger and almost
 * entirely GRADED — of the 5,897 declarations, **5,835 sit on `check` or `challenge` steps** — and
 * it reaches precisely the engines this session repaired:
 *
 *     exactNumberLab 338 · buildExpression 204 · tapDiagram 59 · dragOrder 41
 *     affineRelationshipLab 39 · geometricConstraintLab 38 · dragBucket 37
 *     placeValueTransformLab 29 · proportionalReasoningLab 27 · quotientReasoningLab 23
 *
 * `widgets.generatedRender.s241.test.tsx` already renders this corpus, but it asserts RENDER
 * HEALTH — parse, no throw, no SVG collision. It says nothing about whether a generated widget
 * hands the learner the answer. This file asserts the pedagogical/perceptual contracts.
 *
 * WHY `tone` IS LEFT UNDEFINED: that is the state a learner is in while working, and the only
 * state in which any of this can be a defect. Post-verdict every one of these reveals is intended.
 *
 * ── ONE ASSERTION WAS WITHDRAWN, AND WHY ────────────────────────────────────────────────────────
 * A first cut also asserted that no generated spec paints `PALETTE.leaf` on an untouched widget.
 * It flagged 21 cells, all `trialProbabilityLab`, and reading them showed the detector was wrong:
 * `widgets.tsx:2038-2039` draws the OBSERVED DATA in leaf — a dashed line labelled
 * `evidence {favourable}` — unconditionally. That is a reference marker, not a claim about the
 * learner, and forbidding it would forbid the counter-examples §5(f) holds up as correct.
 * Correctness cues are CONDITIONAL; the assertion below is keyed on the specific mark that carries
 * the verdict, not on the colour.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, exactNumberTruth, exactNumberExplorationKeys, type TWidget } from "@/lib/schema";
import { VARIANT_GENERATORS, variantForGenForm } from "@/lib/variants";
import { PALETTE } from "@/lib/palette";
import type { Band } from "@/lib/difficulty";

afterEach(cleanup);

const BANDS: Band[] = ["support", "core", "stretch"];
interface Case { pair: string; band: Band; spec: TWidget; answer: unknown }

/** Both audits used to walk `generator.forms` alone, which never reaches a generator's DEFAULT
 * branch — the branch 370 authored steps run. Probed unconditionally here for the same reason. */
const formsOf = (g: { forms?: readonly string[] }) => {
  const declared = g.forms ?? [];
  return declared.includes("default") ? declared : [...declared, "default"];
};

const cases: Case[] = [];
for (const generator of VARIANT_GENERATORS) {
  for (const form of formsOf(generator as { forms?: readonly string[] })) {
    for (const band of BANDS) {
      // Two distinct specs per cell: enough to catch a value-dependent leak, cheap enough to run
      // always-on. The cell — not the seed count — is the unit that matters (see S241).
      const seen = new Set<string>();
      for (let i = 0; i < 6 && seen.size < 2; i++) {
        let v;
        try { v = variantForGenForm(generator.tag, form, `s242|${generator.tag}|${form}|${band}|${i}`, band); } catch { break; }
        if (!v) break;
        const key = JSON.stringify(v.widget);
        if (seen.has(key)) continue;
        seen.add(key);
        const parsed = WidgetSpec.safeParse(v.widget);
        if (!parsed.success) continue; // s241 owns parse failures and fails loudly on them
        cases.push({ pair: `${generator.tag}|${form}`, band, spec: parsed.data as TWidget, answer: v.answer });
      }
    }
  }
}

/** Everything the DOM would show or speak, JOINED WITH SEPARATORS.
 *
 * `container.textContent` concatenates sibling nodes with nothing between them, so `10` beside
 * `-8` reads as `10-8` and a search for a bare `3` matches inside numbers that were never on
 * screen together. The first cut used it and reported 306 R1 leaks, every one an artefact of that
 * mashing. Walking text nodes and joining with spaces is what makes the search mean anything. */
function perceived(container: HTMLElement) {
  const parts: string[] = [];
  const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) parts.push(n.textContent ?? "");
  for (const el of Array.from(container.querySelectorAll("[aria-label],[aria-valuetext],[alt]")))
    parts.push(el.getAttribute("aria-label") ?? "", el.getAttribute("aria-valuetext") ?? "", el.getAttribute("alt") ?? "");
  return parts.filter(Boolean).join(" ⧫ ");
}

/* ONE RENDER PASS, THREE LEDGERS. Rendering ~3,000 cells three times over is three times the wall
 * clock for no extra coverage, and the first cut timed out at vitest's 5s default doing exactly
 * that. Collected here so each assertion below is a cheap read of an already-measured fact. */
const r1Leaks: string[] = [];
const claimLeaf: string[] = [];
const mute: string[] = [];
/** How many answer-revealing stages the sweep actually found. A differential that never fires is
 * a green light for nothing, so the count is asserted alongside the result. */
let revealingStages = 0;

for (const c of cases) {
  const type = (c.spec as { type: string }).type;
  const { container } = render(<WidgetRenderer spec={c.spec} value={null} onChange={() => {}} disabled={false} />);
  if (perceived(container).replace(/[⧫\s]/g, "").length < 3) mute.push(`${c.pair} [${c.band}] ${type}`);
  cleanup();

  /* R1, MEASURED EXACTLY RATHER THAN BY DIGIT SEARCH.
   *
   * A first cut searched the rendered text for the answer's digits and reported 359 hits. Every one
   * read as a coincidence the question itself creates: `ladder-shift|mulTwice` breaks the SOURCE
   * number 0.04 into place-value digits `0 0 4` beside an answer of 4; `remainder-word` numbers its
   * panels "Stage 1", "Stage 2" beside an answer of 2; `g6-center-spread` must show the data set
   * that contains its own answer. A bare digit cannot separate "the widget printed the answer" from
   * "a number equal to the answer is legitimately on screen" — the two are the same string, and no
   * tightening fixes that. (Two narrowings were made first and are worth keeping in mind: text
   * nodes must be joined WITH separators, or `10` beside `-8` reads as `10-8`; and the lookbehind
   * must exclude minus signs, or a search for `2` matches inside the exponent `-2`.)
   *
   * The exact question is asked instead, against the engine's own truth function: which STAGE
   * VALUES print the answer, and are those strings on screen with every stage opened? That is the
   * defect ENG-01 §3.1 documented verbatim — `stages.push({key:"approx:compute", value: fmt(rounded)})`
   * with `rounded` assigned to `answerNumber` on the next line — and it is decidable.
   *
   * SCOPE, STATED: `exactNumberLab` only — 338 of the 494 staged-reveal declarations, and the engine
   * ENG-01 called the worst (358 authored instances, 345 graded). Its six siblings export the same
   * shape of truth function and are the obvious next step. */
  if (type === "exactNumberLab") {
    type Truth = { stages: Array<{ key: string; value?: string }>; answerNumber?: number };
    let truth: Truth | null = null;
    try { truth = exactNumberTruth(c.spec as never) as unknown as Truth; } catch { truth = null; }
    const answerNumber = truth?.answerNumber;
    /* THE STAGE VALUE MUST **BE** THE ANSWER, NOT MERELY CONTAIN IT.
     *
     * ENG-01 §3.1's defect is exact: `stages.push({key:"approx:compute", value: fmt(rounded)})`
     * with `rounded` assigned to `answerNumber` on the next line. A stage reading `24 ÷ 3 = 8` on
     * an item whose answer is 3 is not that defect — it is a given intermediate step that happens
     * to use the answer as an operand, and probing three of them confirmed all three render
     * correctly ("Open — this is the step to work out yourself." on every stage that IS the
     * answer). Selecting by containment flagged 268 such coincidences; selecting by equality
     * selects the defect. */
    const revealing = (truth?.stages ?? []).filter(
      (st) => typeof answerNumber === "number" && typeof st.value === "string" && st.value.trim() === String(answerNumber)
    );
    if (revealing.length) {
      const open = { revealed: exactNumberExplorationKeys(c.spec as never) };
      /* THE ASSERTION IS DIFFERENTIAL, AND THAT IS THE WHOLE POINT.
       *
       * Searching the pre-verdict render for the answer cannot work, and the probe that settled it
       * is worth recording. `exp-function|initialValue` asks *"For f(x) = 5 · 2^x, what is the
       * initial value f(0)?"* — answer 5. Pre-verdict the widget correctly prints
       * **"Open — this is the step to work out yourself."** in place of both derived stages; the
       * gate works exactly as designed. But a bare `5` is still on screen, in the PROMPT and on a
       * tick label, because the question contains its own answer's digits. No search of one render
       * can tell those apart.
       *
       * Counting across BOTH renders can. The prompt's `5` appears in each and cancels; what
       * remains is what the verdict ADDS. So the contract is stated as: revealing the verdict must
       * increase the number of times the stage's value appears. That is simultaneously the leak
       * check (equal counts ⇒ it was already showing) and the paired-acceptance check (no increase
       * ⇒ the gate has become a deletion and the explanation never arrives). */
      const occurrences = (text: string, value: string) => {
        const v = value.trim();
        const re = /^-?\d+(?:\.\d+)?$/.test(v)
          ? new RegExp(`(?<![\\d.\\-−])${v.replace(".", "\\.")}(?![\\d.])`, "g")
          : new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
        return (text.match(re) ?? []).length;
      };
      const working = render(<WidgetRenderer spec={c.spec} value={open} onChange={() => {}} disabled={false} />);
      const before = perceived(working.container);
      cleanup();
      const settled = render(<WidgetRenderer spec={c.spec} value={open} onChange={() => {}} disabled={false} tone="info" />);
      const after = perceived(settled.container);
      cleanup();
      revealingStages += revealing.length;
    for (const st of revealing) {
        const value = st.value as string;
        if (occurrences(after, value) <= occurrences(before, value))
          r1Leaks.push(
            `${c.pair} [${c.band}] stage "${st.key}" value "${value}" (answer ${answerNumber}) — ` +
            `${occurrences(before, value)} occurrences while working, ${occurrences(after, value)} after the verdict: the reveal adds nothing`
          );
      }
    }
  }

  if (type === "trialProbabilityLab") {
    /* The one S242-gated correctness mark the generators actually emit. Rendered with the learner's
     * choice SET, because an untouched widget cannot be right yet and would pass vacuously. */
    const choices = (c.spec as { choices?: Array<{ id: string }> }).choices ?? [];
    for (const choice of choices) {
      const { container: k } = render(<WidgetRenderer spec={c.spec} value={choice.id} onChange={() => {}} disabled={false} />);
      const mark = k.querySelector('[data-testid="tpl-learner-claim"]');
      const paints = mark
        ? [mark, ...Array.from(mark.querySelectorAll("*"))].flatMap((n) => [n.getAttribute("fill"), n.getAttribute("stroke")])
        : [];
      if (paints.includes(PALETTE.leaf)) claimLeaf.push(`${c.pair} [${c.band}] choice ${choice.id}`);
      cleanup();
    }
  }
}

describe("S242 — generated widgets keep the session's contracts", () => {
  it("generated enough cells to be worth asserting over", () => {
    // Without this, every assertion below passes vacuously if the registry fails to load.
    expect(cases.length).toBeGreaterThan(2000);
  });

  it("R1 — the sweep actually found answer-revealing stages to check", () => {
    // Selecting by equality is strict, and a strict filter that matches nothing proves nothing.
    expect(revealingStages).toBeGreaterThan(20);
  });

  it("R1 — every answer-revealing stage is withheld until the verdict, and arrives with it", () => {
    expect(
      r1Leaks,
      "a generated staged-reveal lab either shows its answer while the learner works, or never shows the derivation at all"
    ).toEqual([]);
  });

  it("5f — the trialProbabilityLab claim marker stays neutral until the verdict", () => {
    expect(
      claimLeaf,
      "a generated widget marks the learner's claim correct before they have committed to it"
    ).toEqual([]);
  });

  it("AN — every generated widget renders something perceivable", () => {
    expect(mute, "a generated widget with nothing to read or hear").toEqual([]);
  });
});
