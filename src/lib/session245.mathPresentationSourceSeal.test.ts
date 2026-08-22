import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  mathPresentationInputFingerprint,
  mathPresentationSourceSeal,
} from "../../scripts/audit/math-presentation-source-seal";

const temporaryRoots: string[] = [];

function temporaryRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "maggies-math-seal-"));
  temporaryRoots.push(root);
  mkdirSync(join(root, "inputs"));
  return root;
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("S245 math-presentation source evidence", () => {
  it("changes when a measured working-tree input changes even if HEAD does not", () => {
    const root = temporaryRoot();
    const file = join(root, "inputs", "lesson.json");
    writeFileSync(file, '{"prompt":"1.234567"}\n');
    const before = mathPresentationInputFingerprint(root, ["inputs"]);
    writeFileSync(file, '{"prompt":"1.234568"}\n');
    const after = mathPresentationInputFingerprint(root, ["inputs"]);

    expect(after.sha256).not.toBe(before.sha256);
    expect(after.files).toBe(1);
  });

  it("is stable across input ordering and combines HEAD with the current input fingerprint", () => {
    const root = temporaryRoot();
    writeFileSync(join(root, "inputs", "b.ts"), "export const b = 2;\n");
    writeFileSync(join(root, "inputs", "a.ts"), "export const a = 1;\n");

    const directory = mathPresentationInputFingerprint(root, ["inputs"]);
    const reversed = mathPresentationInputFingerprint(root, [
      "inputs/b.ts",
      "inputs/a.ts",
    ]);
    expect(reversed).toEqual(directory);

    const evidence = mathPresentationSourceSeal(root, "abc1234");
    // The production helper has a wider default input set; this fixture deliberately has none of
    // those paths, so its empty-input digest must still be explicit instead of claiming HEAD alone.
    expect(evidence.seal).toMatch(/^abc1234\+inputs\.[0-9a-f]{12}$/);
    expect(evidence.inputSha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it("matches the current regenerated index rather than HEAD alone", () => {
    const firstLine = readFileSync(
      join(process.cwd(), "reports", "math-presentation", "MATH_SYMBOLIC_DISPLAY_INDEX.csv"),
      "utf8",
    ).split(/\r?\n/, 1)[0];
    const recorded = firstLine.match(/^# sourceSeal=(\S+)/)?.[1];
    expect(recorded).toBeDefined();
    const head = recorded!.split("+inputs.")[0];
    const current = mathPresentationSourceSeal(process.cwd(), head);
    expect(recorded).toBe(current.seal);
    expect(recorded).not.toBe(head);
  });
});
