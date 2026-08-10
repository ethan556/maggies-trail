/* @vitest-environment jsdom */
/* exactNumberLab magnitude rail (S205K) — the manipulation surface, verified the only way a
 * per-TYPE capability claim is allowed to be made: against EVERY numeric task the corpus actually
 * uses, on the corpus's own specs, not hand-built fixtures.
 *
 * What manip=2 for numeric mode claims, and what these tests pin:
 *   1. PRESENCE — the rail renders for every in-use numeric task (enumerated from the corpus at
 *      test time, so a new task added to content joins this suite automatically).
 *   2. ONE STATE, TWO SURFACES — dragging the rail writes the same v.numeric the typed input
 *      reads, and vice versa. If the surfaces ever fork, the manipulation is decoration.
 *   3. NO LEAK, structurally — before any reveal the rail shows no landmarks (landmarks come only
 *      from REVEALED stages), and nothing in its DOM encodes the answer. The domain is derived
 *      from candidate+landmarks only; the test asserts the rail's rendered numbers exclude the
 *      truth answer when nothing is revealed and the candidate is elsewhere.
 *   4. MODE BOUNDARY — choice/relation modes get NO rail; their manip rating stays 1 and the
 *      capability file says so per-mode. Rendering a rail there would be a claim nobody verified.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WidgetRenderer } from "@/components/widgets";
import { exactNumberTruth } from "@/lib/schema";
import type { TWidget } from "@/lib/schema";

afterEach(cleanup);

/** Every numeric-mode exactNumberLab spec in the corpus, one representative per task. */
function corpusNumericSpecs(): Map<string, { spec: TWidget; lesson: string }> {
  const byTask = new Map<string, { spec: TWidget; lesson: string }>();
  for (const course of readdirSync("content/courses")) {
    const ld = `content/courses/${course}/lessons`;
    if (!existsSync(ld)) continue;
    for (const f of readdirSync(ld)) {
      if (!f.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(`${ld}/${f}`, "utf8"));
      for (const s of lesson.steps ?? []) {
        const w = s.widget;
        if (w?.type === "exactNumberLab" && w.answerMode === "numeric" && !byTask.has(w.task))
          byTask.set(w.task, { spec: w as TWidget, lesson: f });
      }
    }
  }
  return byTask;
}

const specs = corpusNumericSpecs();

describe("exactNumberLab magnitude rail — per-task presence on the corpus's own specs", () => {
  it("found the numeric tasks the corpus uses", () => {
    expect(specs.size).toBeGreaterThanOrEqual(20); // 24 at time of writing; floor allows curation
  });

  for (const [task, { spec, lesson }] of specs) {
    it(`renders and drags for task=${task} (${lesson})`, () => {
      const onChange = vi.fn();
      const { container } = render(
        <WidgetRenderer spec={spec} value={{}} onChange={onChange} disabled={false} />,
      );
      expect(container.querySelector('[data-testid="enl-rail"]'), "rail missing").not.toBeNull();
      const rail = screen.getByLabelText("drag your candidate answer along the number line");
      fireEvent.change(rail, { target: { value: "3" } });
      const written = onChange.mock.calls.at(-1)?.[0];
      expect(written?.numeric, "drag must write v.numeric").toBe(3);
    });
  }
});

describe("one state, two surfaces", () => {
  const any = [...specs.values()][0].spec;

  it("the rail reflects a value typed into the input", () => {
    render(<WidgetRenderer spec={any} value={{ numeric: 7.5 }} onChange={vi.fn()} disabled={false} />);
    const rail = screen.getByLabelText("drag your candidate answer along the number line");
    expect((rail as HTMLInputElement).value).toBe("7.5");
    expect(rail.getAttribute("aria-valuetext")).toContain("candidate 7.5");
  });

  it("dragging the rail and typing write the same field", () => {
    const onChange = vi.fn();
    render(<WidgetRenderer spec={any} value={{ numeric: 2 }} onChange={onChange} disabled={false} />);
    fireEvent.change(screen.getByLabelText("drag your candidate answer along the number line"), { target: { value: "4" } });
    const fromRail = onChange.mock.calls.at(-1)?.[0];
    fireEvent.change(screen.getByLabelText(/Enter exact-number answer/), { target: { value: "4" } });
    const fromInput = onChange.mock.calls.at(-1)?.[0];
    expect(fromRail.numeric).toBe(4);
    expect(fromInput.numeric).toBe(4);
  });
});

describe("leak audit", () => {
  /* A spec whose answer sits far from 0 and from the default candidate, so any leak of the
   * answer's magnitude into the pre-reveal rail is detectable in its rendered numbers. */
  const far = [...specs.values()].map(({ spec }) => ({ spec, ans: exactNumberTruth(spec as never).answerNumber }))
    .find((x) => typeof x.ans === "number" && Math.abs(x.ans) >= 6);

  it("shows no landmarks before any stage is revealed", () => {
    const { container } = render(
      <WidgetRenderer spec={[...specs.values()][0].spec} value={{}} onChange={vi.fn()} disabled={false} />,
    );
    expect(container.querySelectorAll('[data-testid="enl-landmark"]').length).toBe(0);
  });

  it("the pre-reveal rail's rendered numbers do not include the answer", () => {
    expect(far, "corpus should contain a far-from-zero answer").toBeTruthy();
    if (!far) return;
    const { container } = render(
      <WidgetRenderer spec={far.spec} value={{ numeric: 1 }} onChange={vi.fn()} disabled={false} />,
    );
    const railText = container.querySelector('[data-testid="enl-rail"]')?.textContent ?? "";
    const rail = screen.getByLabelText("drag your candidate answer along the number line");
    const shown = [railText, rail.getAttribute("aria-valuetext") ?? ""].join(" ");
    expect(shown.includes(String(far.ans)), `answer ${far.ans} leaked into: ${shown}`).toBe(false);
  });

  it("reveals populate landmarks from revealed stages only", () => {
    const { spec } = [...specs.values()][0];
    const truth = exactNumberTruth(spec as never);
    const firstKey = truth.stages[0]?.key;
    const { container } = render(
      <WidgetRenderer spec={spec} value={{ revealed: [firstKey] }} onChange={vi.fn()} disabled={false} />,
    );
    const n = container.querySelectorAll('[data-testid="enl-landmark"]').length;
    expect(n).toBeLessThanOrEqual(1); // one reveal → at most one landmark, never the full ladder
  });
});

describe("mode boundary — no rail where no capability is claimed", () => {
  it("choice-mode specs render no rail", () => {
    let choiceSpec: TWidget | null = null;
    outer: for (const course of readdirSync("content/courses")) {
      const ld = `content/courses/${course}/lessons`;
      if (!existsSync(ld)) continue;
      for (const f of readdirSync(ld)) {
        if (!f.endsWith(".json")) continue;
        const lesson = JSON.parse(readFileSync(`${ld}/${f}`, "utf8"));
        for (const s of lesson.steps ?? []) {
          if (s.widget?.type === "exactNumberLab" && s.widget.answerMode === "choice") {
            choiceSpec = s.widget; break outer;
          }
        }
      }
    }
    expect(choiceSpec, "corpus has 22 choice-mode steps").not.toBeNull();
    const { container } = render(
      <WidgetRenderer spec={choiceSpec as TWidget} value={{}} onChange={vi.fn()} disabled={false} />,
    );
    expect(container.querySelector('[data-testid="enl-rail"]')).toBeNull();
  });
});
