import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src");
const AUDITED = new Map<string, number>([
  ["app/page.tsx", 1],
  ["app/(shell)/daily/DailyClient.tsx", 3],
  ["app/(shell)/leaderboard/LeaderboardClient.tsx", 1],
  ["app/(shell)/review/ReviewClient.tsx", 1],
  ["components/NotebookClient.tsx", 1],
  ["components/SyllabusClient.tsx", 1],
  ["components/SyncIndicator.tsx", 1],
  ["world/Basecamp.tsx", 1],
]);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return /\.(?:ts|tsx)$/.test(entry.name) && !/\.test\.(?:ts|tsx)$/.test(entry.name) ? [file] : [];
  });
}

describe("OS reduced-motion pulse ratchet", () => {
  it("guards each of the ten audited pulse affordances without removing normal-motion feedback", () => {
    const observed = [...AUDITED].map(([relative, expected]) => ({
      relative, expected, count: readFileSync(join(ROOT, relative), "utf8").match(/motion-safe:animate-pulse/g)?.length ?? 0,
    }));
    expect(observed).toEqual([...AUDITED].map(([relative, expected]) => ({ relative, expected, count: expected })));
  });

  it("has no production raw animate-pulse utility outside motion-safe", () => {
    const unsafe: string[] = [];
    for (const file of sourceFiles(ROOT)) {
      const source = readFileSync(file, "utf8");
      const count = source.match(/(?<!motion-safe:)animate-pulse\b/g)?.length ?? 0;
      if (count) unsafe.push(`${file.slice(process.cwd().length + 1).replace(/\\/g, "/")}: ${count}`);
    }
    expect(unsafe).toEqual([]);
  });
});
