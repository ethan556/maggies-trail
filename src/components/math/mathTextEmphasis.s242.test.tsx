// @vitest-environment jsdom
/**
 * S242 — `*emphasis*` RENDERS AS ITALICS, AND `5 * 3^x` DOES NOT.
 *
 * THE DEFECT. Both renderers split on `**` and nothing handled a single asterisk, so `*then*`
 * reached the screen with its markers. 138 authored strings are affected and in every one the
 * emphasis is doing instructional work — "A word like *then* or *after* points to order", "*more*
 * does not always mean add" — marking the keyword the sentence is about. Rendering the marker
 * instead of the emphasis loses the teaching and looks like a bug to a parent, because it is one.
 *
 * THE REASON IT WAS NOT ALREADY FIXED, which is the whole content of this file. The same character
 * is MULTIPLICATION in this corpus: "For f(x) = 5 * 3^x, what is f(2)?". Split naively and that
 * prompt becomes "For f(x) = 5 " + italic + " 3^x, what is f(2)?" with the asterisks consumed — a
 * silently wrong equation, which is far worse than a visible asterisk. Every assertion below exists
 * to hold one side of that line.
 *
 * The rule was measured before it was written: across the whole authored corpus plus a sample from
 * every generator, 223 strings carry a single asterisk once bold is removed. 138 match this rule
 * and every one is emphasis; 85 do not and every one is multiplication. No string falls on the
 * wrong side, and the cases below are drawn from both groups.
 */
import { describe, expect, it } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { MathProse } from "./MathText";
import { Rich } from "../playerChrome";

afterEach(cleanup);

const html = (node: React.ReactElement) => render(node).container;

describe("emphasis — a single asterisk pair becomes italics", () => {
  it("renders the authored keyword emphasis", () => {
    const container = html(<MathProse text="A word like *then* or *after* points to order." />);
    const ems = [...container.querySelectorAll("em")].map((e) => e.textContent);
    expect(ems).toEqual(["then", "after"]);
    // And the markers are gone from what the learner reads.
    expect(container.textContent).toBe("A word like then or after points to order.");
  });

  it("works inside bold, so **a *b* c** nests", () => {
    const container = html(<MathProse text="**Beware the *keyword* trap**" />);
    expect(container.querySelector("strong")?.textContent).toBe("Beware the keyword trap");
    expect(container.querySelector("em")?.textContent).toBe("keyword");
    expect(container.textContent).not.toContain("*");
  });

  it("reaches step body prose through Rich, from the same rule", () => {
    // Rich splits bold itself and delegates every segment to MathProse, so body text and widget
    // prompts cannot drift apart on this again.
    const container = html(<Rich text="*more* does not always mean add." />);
    expect(container.querySelector("em")?.textContent).toBe("more");
    expect(container.textContent).not.toContain("*");
  });

  it("handles an apostrophe and a multi-word run", () => {
    const container = html(<MathProse text="count what you *don't* want, and the *power of the point* follows." />);
    expect([...container.querySelectorAll("em")].map((e) => e.textContent)).toEqual(["don't", "power of the point"]);
  });
});

describe("emphasis — multiplication is never mistaken for it", () => {
  const multiplication = [
    "For f(x) = 5 * 3^x, what is f(2)?",
    "Is f(x) = 4 * 3^x growth or decay?",
    "For f(x) = 16 * (1/2)^x, what is f(3)?",
    "a4 = 3 * 4^(4-1) = 192."
  ];

  it.each(multiplication)("%s keeps its asterisk and emits no <em>", (text) => {
    const container = html(<MathProse text={text} includeArithmetic />);
    expect(container.querySelector("em"), "an equation was read as emphasis").toBeNull();
    expect(container.textContent).toContain("*");
  });

  it("a digit either side blocks a run — 2*3*4 is arithmetic, not emphasis", () => {
    const container = html(<MathProse text="2*3*4 is twenty-four." />);
    expect(container.querySelector("em")).toBeNull();
  });

  it("a letter either side blocks a run — a*b*c is a product", () => {
    const container = html(<MathProse text="a*b*c" />);
    expect(container.querySelector("em")).toBeNull();
  });

  it("an unclosed asterisk cannot swallow the rest of the sentence", () => {
    const container = html(<MathProse text="Multiply 3 * 4 and then check." />);
    expect(container.querySelector("em")).toBeNull();
    expect(container.textContent).toBe("Multiply 3 * 4 and then check.");
  });
});

describe("emphasis — the existing contracts still hold", () => {
  it("bold alone is unchanged", () => {
    const container = html(<MathProse text="The **first** thing" />);
    expect(container.querySelector("strong")?.textContent).toBe("first");
    expect(container.querySelector("em")).toBeNull();
  });

  it("math inside emphasis still typesets", () => {
    // The tokenizer runs inside every leaf, so emphasis does not switch mathematics off.
    const container = html(<MathProse text="the value *x^2* matters" />);
    const em = container.querySelector("em");
    expect(em).not.toBeNull();
    expect(em?.querySelector(".math-inline"), "the power inside the emphasis was not tokenized").not.toBeNull();
  });

  it("plain prose takes the fast path and gains no wrapper", () => {
    const container = html(<MathProse text="Just ordinary words here." />);
    expect(container.querySelector("em")).toBeNull();
    expect(container.querySelector("strong")).toBeNull();
    expect(container.textContent).toBe("Just ordinary words here.");
  });
});

describe("emphasis — the corpus is clean under this rule", () => {
  it("every authored italic run in a representative sample renders", () => {
    // Drawn from the measured 138; if the rule is narrowed later, these are what it must keep.
    const authored = [
      ["A ∩ B needs both conditions at once. Only 18 is a multiple of 3 *and* above 15.", "and"],
      ["Those are the cards in B that are *not* in A.", "not"],
      ["Complement means *everything else*.", "everything else"],
      ["A central angle does not measure something *about* its arc.", "about"]
    ] as const;
    for (const [text, expected] of authored) {
      cleanup();
      const container = html(<MathProse text={text} includeArithmetic />);
      expect(container.querySelector("em")?.textContent, text).toBe(expected);
      expect(container.textContent, text).not.toContain("*");
    }
  });
});

// Keep the screen import meaningful for future assertions without an unused-import lint failure.
void screen;
