import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import { FIGURE_NUMERIC_CLAIMS } from "../lib/figureNumericClaims.generated";

function decode(value: string): string {
  return value
    .replace(/&minus;|&#x2212;|&#8722;/gi, "−")
    .replace(/&times;|&#xd7;|&#215;/gi, "×")
    .replace(/&divide;|&#xf7;|&#247;/gi, "÷")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"').replace(/&#x27;|&#39;/gi, "'")
    .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function arithmetic(title: string): boolean {
  const operand = String.raw`(?:\(?[−-]?\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?\)?|[a-z])`;
  return /\d/.test(title) && (
    /=|\bequals?\b/i.test(title) ||
    new RegExp(`${operand}\\s*[+×÷]\\s*${operand}`, "i").test(title) ||
    new RegExp(`${operand}\\s+[−-]\\s+${operand}`, "i").test(title) ||
    /\d\s*(?:\^\s*\d|[⁰¹²³⁴⁵⁶⁷⁸⁹])/.test(title)
  );
}

function exactClaim(title: string): string {
  const value = decode(title);
  const introduced = [
    /\b(?:showing|shows)\s+(.+?)(?:(?:[.!?])(?=\s|$)|$)/gi,
    /\b(?:the\s+)?(?:caption|equation|formula)\s+(?:reads?|shows?)\s+(.+?)(?:(?:[.!?])(?=\s|$)|$)/gi,
    /:\s*(.+?)(?:(?:[.!?])(?=\s|$)|$)/g,
  ];
  for (const pattern of introduced) {
    const matches = [...value.matchAll(pattern)];
    for (let index = matches.length - 1; index >= 0; index -= 1) {
      const candidate = decode(matches[index][1]);
      if (arithmetic(candidate)) return candidate;
    }
  }
  return value.split(/(?<=[.!?])\s+/).map(decode).filter(arithmetic).join(" ");
}

describe("generated exact figure arithmetic-title claims", () => {
  it("is an exact renderer-derived map with no manual omissions or stale claims", () => {
    const actual: Record<string, string> = {};
    for (const id of Object.keys(FIGURES).sort()) {
      const markup = renderToStaticMarkup(createElement(FIGURES[id]));
      const title = decode(markup.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
      const claim = exactClaim(title);
      if (claim) actual[id] = claim;
    }
    expect(FIGURE_NUMERIC_CLAIMS).toEqual(actual);
    expect(Object.keys(actual).length).toBeGreaterThan(100);
    expect(actual["mult3-array"]).toBe("4 rows × 6 columns = 24");
    expect(actual["count-on-hops"]).toBeUndefined();
    expect(actual["number-line-jumps"]).not.toMatch(/number line from 0 to 12/i);
  });
});
