import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";

describe("bt-term-count-grows", () => {
  const Figure = FIGURES["bt-term-count-grows"];

  it("shows the actual binomial terms instead of anonymous count blocks", () => {
    expect(Figure).toBeDefined();
    const markup = renderToStaticMarkup(createElement(Figure!));

    const terms = [...markup.matchAll(/data-binomial-term="([^"]+)"/g)].map((match) => match[1]);
    expect(terms).toEqual([
      "a²", "2ab", "b²",
      "a³", "3a²b", "3ab²", "b³",
      "a⁴", "4a³b", "6a²b²", "4ab³", "b⁴",
    ]);
    expect(markup).toContain("n = 2 · 3 terms");
    expect(markup).toContain("n = 3 · 4 terms");
    expect(markup).toContain("n = 4 · 5 terms");
  });

  it("keeps the general-rule caption below every labelled term cell", () => {
    const markup = renderToStaticMarkup(createElement(Figure!));
    const cells = [...markup.matchAll(/<rect x="[^"]+" y="(\d+)" width="66" height="27"/g)];
    expect(cells).toHaveLength(12);
    const finalCellBottom = Math.max(...cells.map((match) => Number(match[1]) + 27));
    const caption = markup.match(/data-binomial-caption="true"[^>]* y="(\d+)"/);

    expect(caption).not.toBeNull();
    expect(Number(caption![1])).toBeGreaterThanOrEqual(finalCellBottom + 20);
  });
});
