import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import lesson from "../../content/courses/ratios-rates/lessons/rr-03-02.json";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

describe("rr-better-buy figure and lesson-text integrity", () => {
  const concept = lesson.steps.find((step) => step.id === "c1");

  it("renders the same two juice deals that the learner is asked to compare", () => {
    expect(concept?.figure).toBe("rr-better-buy");
    expect(isFigureTextAligned(concept?.figure ?? "", concept?.body ?? "")).toBe(true);

    const Figure = FIGURES[concept?.figure ?? ""];
    expect(Figure).toBeDefined();
    const markup = renderToStaticMarkup(createElement(Figure!));

    for (const expected of ["$3 ÷ 12 oz", "25¢/oz", "$4 ÷ 20 oz", "20¢/oz"]) {
      expect(markup).toContain(expected);
    }
    expect(markup).not.toContain("$6 / 3 lb");
    expect(markup).not.toContain("$10 / 4 lb");
  });

  it("fails closed if the old per-pound example is ever bound to this juice explanation", () => {
    expect(
      isFigureTextAligned(
        "rr-better-buy",
        "A 12-ounce juice for $3 costs 3 ÷ 12 = 25 cents per ounce; a 20-ounce juice for $4 costs 4 ÷ 20 = 20 cents per ounce."
      )
    ).toBe(true);
    expect(
      isFigureTextAligned(
        "rr-better-buy",
        "6 dollars for 3 pounds is 2 dollars per pound, beating 10 dollars for 4 pounds at 2 dollars 50 per pound."
      )
    ).toBe(false);
  });
});
