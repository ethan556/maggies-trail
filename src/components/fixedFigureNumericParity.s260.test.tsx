import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import {
  compareFigureNumericParity,
  FIXED_NUMERIC_EXEMPLAR_CONTRACTS,
  isDeclaredFixedNumericExemplarAligned,
  type FixedNumericExemplarId,
} from "../lib/figureNumericParity";
import { isFigureTextAligned } from "../lib/figureTextAlignment";

const COURSES = join(process.cwd(), "content", "courses");

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  });
}

function decode(value: string): string {
  return value
    .replace(/&minus;|&#x2212;|&#8722;/gi, "−")
    .replace(/&times;|&#xd7;|&#215;/gi, "×")
    .replace(/&divide;|&#xf7;|&#247;/gi, "÷")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function renderedChannels(id: FixedNumericExemplarId): { visible: string; title: string; desc: string; aria: string } {
  const Figure = FIGURES[id];
  expect(Figure, `${id} must be registered`).toBeTypeOf("function");
  const markup = renderToStaticMarkup(createElement(Figure));
  const title = decode(markup.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").replace(/<[^>]+>/g, " ");
  const desc = decode(markup.match(/<desc>([\s\S]*?)<\/desc>/)?.[1] ?? "").replace(/<[^>]+>/g, " ");
  const aria = decode(markup.match(/aria-label="([^"]+)"/)?.[1] ?? "");
  const visible = decode(markup.replace(/<(?:title|desc)>[\s\S]*?<\/(?:title|desc)>/g, " ").replace(/<[^>]+>/g, " "));
  return { visible, title, desc, aria };
}

function localText(record: Record<string, unknown>): string {
  return ["title", "body", "prompt", "narration", "explanation", "caption", "feedback"]
    .map((key) => record[key])
    .filter((value): value is string => typeof value === "string")
    .join(" ");
}

describe("S260 fixed-number figure contracts", () => {
  it("seals every declared claim against the registered renderer's visible, title, and ARIA channels", () => {
    for (const [rawId, contract] of Object.entries(FIXED_NUMERIC_EXEMPLAR_CONTRACTS)) {
      const id = rawId as FixedNumericExemplarId;
      const channels = renderedChannels(id);
      expect(channels.visible.trim(), `${id} visible channel`).not.toBe("");
      expect(channels.title.trim(), `${id} title channel`).not.toBe("");
      expect(`${channels.title} ${channels.desc} ${channels.aria}`.trim(), `${id} accessible channel`).not.toBe("");
      const rendered = `${channels.visible} ${channels.title} ${channels.desc} ${channels.aria}`;
      expect(compareFigureNumericParity(contract.figureClaim, rendered), `${id}: ${contract.figureClaim}`).toMatchObject({ aligned: true });
    }
  });

  it("either aligns or fails closed every current declared fixed-number placement", () => {
    const failures: string[] = [];
    const failClosed: string[] = [];
    let placements = 0;
    const visit = (value: unknown, file: string, path = "$"): void => {
      if (!value || typeof value !== "object") return;
      const record = value as Record<string, unknown>;
      if (typeof record.figure === "string" && record.figure in FIXED_NUMERIC_EXEMPLAR_CONTRACTS) {
        placements += 1;
        const text = localText(record);
        if (!isDeclaredFixedNumericExemplarAligned(record.figure, text)) {
          const key = `${file}:${path}:${record.figure}`;
          failures.push(key);
          if (!isFigureTextAligned(record.figure, text)) failClosed.push(key);
        }
      }
      for (const [key, child] of Object.entries(record)) {
        if (key === "figure") continue;
        if (Array.isArray(child)) child.forEach((item, index) => visit(item, file, `${path}.${key}[${index}]`));
        else visit(child, file, `${path}.${key}`);
      }
    };
    for (const file of files(COURSES)) visit(JSON.parse(readFileSync(file, "utf8")), file);
    // Source-local repairs may safely withhold a fixed renderer. Reconcile live placements rather than freezing a census.
    expect(placements).toBeGreaterThan(0);
    expect(placements - failures.length).toBeGreaterThan(0);
    expect(failClosed).toEqual(failures);
    const vis03Rows = readFileSync(join(process.cwd(), "reports", "vis", "VIS03_FIGURE_EXEMPLAR_DRIFT.csv"), "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && !line.startsWith("lesson,"));
    expect(vis03Rows).toEqual([]);
  });
});
