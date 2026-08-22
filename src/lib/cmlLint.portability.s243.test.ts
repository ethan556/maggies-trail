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
    // S330: CML_WAIVERS.json now carries exactly one deliberate, dated waiver — see its own
    // "rationale"/"evidence" fields for why df3-03-02/i1's prediction-not-causal warning is
    // waived rather than repaired (the lesson is division-by-zero; there is no manipulative
    // widget that models "no number works", unlike every other lesson in its paired courses).
    // A waived-but-nonzero warning count means the corpus is no longer literally warning-free,
    // so the previously-true "0 error(s), 0 warning(s)" no longer holds — the honest current
    // summary line is asserted instead, together with the "within their waived ceilings" line
    // that scripts/cml-lint.mjs only prints once every found warning is covered by a waiver.
    // If CML_WAIVERS.json's waivers array ever goes back to empty (the warning gets genuinely
    // repaired, or the waiver expires and is dropped), this assertion needs to revert to
    // "0 error(s), 0 warning(s)" and drop the second expect below.
    expect(result.stdout).toContain("0 error(s), 1 warning(s)");
    expect(result.stdout).toContain("all warning classes within their waived ceilings (prediction-not-causal 1/1)");
  }, 10_000);
});
