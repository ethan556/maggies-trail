import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("CML lint portability", () => {
  it("loads its capability registry from the script directory on this platform", () => {
    const result = spawnSync(
      process.execPath,
      [path.join(process.cwd(), "scripts", "cml-lint.mjs"), process.cwd(), "--strict"],
      { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 },
    );

    expect(result.error).toBeUndefined();
    expect(result.stderr).not.toContain("engine-capabilities.json");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("CML lint (strict):");
    expect(result.stdout).toContain("all warning classes within their waived ceilings");
  }, 10_000);
});
