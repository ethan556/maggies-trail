import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const script = "scripts/audit/spoken-decimal-notation-audit.mjs";

function run(...args: string[]) {
  return execFileSync(process.execPath, [script, ...args], { encoding: "utf8" });
}

describe("S271 spoken-decimal numeric-notation ratchet", () => {
  it("keeps the detector's explicit read-aloud boundary honest", () => {
    expect(run("--self-test")).toContain("self-test passed");
  });

  it("keeps concrete decimal quantities in digits across lessons and runtime surfaces", () => {
    const audit = JSON.parse(run("--json")) as {
      findings: Array<{ phrase: string }>;
      exemptions: Array<{ reason: string }>;
      lessonFiles: number;
      learnerVisibleStrings: number;
      app: { sourceFiles: number; findings: Array<{ phrase: string }>; exemptions: Array<{ reason: string }> };
      totalFindings: number;
      totalExemptions: number;
    };
    expect(audit.lessonFiles).toBeGreaterThan(1_600);
    expect(audit.learnerVisibleStrings).toBeGreaterThan(10_000);
    expect(audit.app.sourceFiles).toBeGreaterThan(100);
    expect(audit.findings).toEqual([]);
    expect(audit.app.findings).toEqual([]);
    expect(audit.totalFindings).toBe(0);
    expect(audit.exemptions.every((row) => row.reason === "explicit-read-aloud-instruction")).toBe(true);
    expect(audit.app.exemptions.every((row) => row.reason === "explicit-read-aloud-instruction")).toBe(true);
    expect(audit.totalExemptions).toBe(audit.exemptions.length + audit.app.exemptions.length);
    expect(() => run("--check")).not.toThrow();
  }, 30_000);
});