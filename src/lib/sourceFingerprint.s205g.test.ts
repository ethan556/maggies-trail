/* source-fingerprint completeness — the guard on the guard.
 *
 * WHY. S205F introduced test-group REUSE: if a group's recorded (sourceFingerprint,
 * corpusFingerprint) pair matches the live pair, the recorder reuses its result instead of
 * re-running it. That is honest exactly as far as the fingerprint is complete, and fabrication the
 * moment it is not — a missed input means a stale PASS gets reported as current.
 *
 * The original FILES list omitted `vitest.setup.ts`, which vitest loads before EVERY test and
 * which can redefine globals. `vitest.config.ts` was covered, but it only names the setup file's
 * PATH, so editing the setup file's CONTENTS left the fingerprint bit-identical. Proved by probe:
 * appending a global-mutating line moved zero bits. `package.json` was missing too.
 *
 * These tests are behavioural, not a list-equality assertion: each one MUTATES a file on disk,
 * recomputes, and requires the hash to move — so they fail if coverage is ever narrowed, and they
 * cannot pass vacuously. Every mutation is restored in a finally block.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sourceFingerprint } from "../../scripts/session/source-fingerprint.mjs";

const root = process.cwd();
const fp = () => sourceFingerprint(root).sha256;

/** Append a marker to a file, recompute, restore. Returns the hash seen while mutated. */
function hashWhileMutated(relPath: string, marker: string): string {
  const p = join(root, relPath);
  const original = readFileSync(p, "utf8");
  try {
    writeFileSync(p, original + marker);
    return fp();
  } finally {
    writeFileSync(p, original);
  }
}

describe("sourceFingerprint covers every input that can change test behaviour", () => {
  it("is stable when nothing changes", () => {
    expect(fp()).toBe(fp());
  });

  /* The regression that motivated this file. vitest.setup.ts runs before every single test. */
  it("notices a change to vitest.setup.ts (the S205F gap)", () => {
    const before = fp();
    const during = hashWhileMutated("vitest.setup.ts", "\n// fingerprint probe\n");
    expect(during).not.toBe(before);
    expect(fp()).toBe(before); // restored exactly
  });

  it("notices a change to package.json", () => {
    const before = fp();
    const during = hashWhileMutated("package.json", "\n");
    expect(during).not.toBe(before);
    expect(fp()).toBe(before);
  });

  it.each([
    ["src", "src/lib/evaluate.ts"],
    ["e2e", "e2e/player-viewport.spec.ts"],
    ["scripts", "scripts/session/source-fingerprint.mjs"],
    ["config", "tsconfig.json"],
    ["lockfile", "package-lock.json"],
  ])("notices a change under %s", (_label, rel) => {
    const before = fp();
    expect(hashWhileMutated(rel, "\n")).not.toBe(before);
    expect(fp()).toBe(before);
  });

  /* content/ is deliberately EXCLUDED — that is corpusFingerprint's job, and the recorder checks
   * the PAIR. If this ever starts failing, someone has folded content into the source hash, which
   * would make every content edit invalidate every group's reuse including groups that never read
   * content/. That is a design change, not a bug fix; do it deliberately or not at all. */
  it("deliberately ignores content/, which corpusFingerprint covers", () => {
    const before = fp();
    const p = join(root, "content/courses/curve-analysis/lessons/ca-01-03.json");
    const original = readFileSync(p, "utf8");
    try {
      writeFileSync(p, original + "\n");
      expect(fp()).toBe(before);
    } finally {
      writeFileSync(p, original);
    }
  });
});
