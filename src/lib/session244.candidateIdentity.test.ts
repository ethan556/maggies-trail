import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("S244 local candidate identity", () => {
  it("binds content, runtime, and evidence to the current commit", () => {
    const report = JSON.parse(
      execFileSync(process.execPath, ["scripts/release/v4-candidate-identity.mjs"], {
        encoding: "utf8",
      }),
    ) as {
      candidate: { key: string; head: string; workingTreeClean: boolean };
      inventory: { courses: number; lessons: number };
      fingerprints: Record<string, { fileCount: number; sha256: string }>;
      gates: Record<string, string>;
    };

    expect(report.candidate.head).toMatch(/^[0-9a-f]{40}$/);
    expect(report.candidate.key).toMatch(/^[0-9a-f]{12}-[0-9a-f]{16}-(?:clean|dirty)$/);
    expect(report.inventory).toEqual({ courses: 129, lessons: 1701 });
    for (const fingerprint of Object.values(report.fingerprints)) {
      expect(fingerprint.fileCount).toBeGreaterThan(0);
      expect(fingerprint.sha256).toMatch(/^[0-9a-f]{64}$/);
    }
    expect(report.gates.localCandidateIdentity).toBe("PASS");
    expect(report.gates.candidateFreeze).toBe(
      report.candidate.workingTreeClean ? "PASS" : "BLOCKED",
    );
    expect(["PASS", "BLOCKED"]).toContain(report.gates.deploymentParity);
  });
});
