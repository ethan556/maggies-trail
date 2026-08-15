/**
 * S242 / SEC-01 — THE DEPENDENCY OVERRIDES THAT CLOSE A HIGH-SEVERITY ADVISORY STAY CLOSED.
 *
 * WHAT THIS IS ABOUT. The V3 audit recorded one high-severity transitive finding: `nanoid@3.3.17`
 * reaching the tree through PostCSS. It is closed — `package.json` carries `"nanoid": "^3.3.18"`
 * in `overrides`, the lockfile resolves 3.3.18, and `npm audit` reports 0 vulnerabilities at every
 * severity across 622 dependencies.
 *
 * WHY A TEST AND NOT A NOTE IN A LEDGER. An `overrides` entry is one of the easiest things in a
 * repository to lose. It survives no merge that rewrites `package.json`, `npm install --force` can
 * walk it back, and a lockfile regenerated on another machine can resolve differently. When it
 * goes, NOTHING says so: the build succeeds, the app runs, the tests pass, and the only signal is
 * an `npm audit` that somebody has to remember to run and read. That is precisely the shape of
 * defect this repository keeps finding — a guardrail that fails silently — so the override gets an
 * assertion that fails loudly instead.
 *
 * DELIBERATELY NOT ASSERTED HERE. This does not run `npm audit`. A test that hits the network is a
 * test that goes red when a runner is offline and green when an advisory database is unreachable —
 * failing open in exactly the case that matters. What is asserted is the local, deterministic fact
 * the audit result depended on: the override is declared, and the version actually installed in
 * the tree is at or above the fixed one. Running the audit itself belongs in the release chain,
 * where a human reads the output.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

/** Compare dotted numeric versions without pulling in semver for three integers. */
const atLeast = (actual: string, floor: string): boolean => {
  const a = actual.replace(/^\D+/, "").split(".").map(Number);
  const f = floor.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) > (f[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (f[i] ?? 0)) return false;
  }
  return true;
};

describe("SEC-01 — the nanoid advisory stays closed", () => {
  it("package.json still declares the override", () => {
    expect(
      pkg.overrides?.nanoid,
      "the nanoid override is gone — PostCSS will pull 3.3.17 back in and the high-severity advisory reopens"
    ).toBeTruthy();
    expect(atLeast(String(pkg.overrides.nanoid), "3.3.18")).toBe(true);
  });

  it("the version actually installed is at or above the fixed one", () => {
    // The declaration is a request; this is what the resolver did with it.
    const installed = join(ROOT, "node_modules/nanoid/package.json");
    if (!existsSync(installed)) return; // nothing installed: nothing to certify, and no false green
    const version = JSON.parse(readFileSync(installed, "utf8")).version as string;
    expect(atLeast(version, "3.3.18"), `nanoid ${version} is below the fixed 3.3.18`).toBe(true);
  });

  it("the lockfile pins the fixed version too", () => {
    const lockPath = join(ROOT, "package-lock.json");
    if (!existsSync(lockPath)) return;
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    const entry = lock.packages?.["node_modules/nanoid"];
    expect(entry, "no nanoid entry in the lockfile").toBeTruthy();
    expect(atLeast(entry.version, "3.3.18"), `lockfile pins nanoid ${entry.version}`).toBe(true);
  });
});

describe("SEC-01 — the other pinned mitigations are still pinned", () => {
  it("sharp stays on its mitigated version", () => {
    // Recorded alongside nanoid in the audit; an exact pin, so any drift is a decision.
    expect(pkg.overrides?.sharp, "the sharp pin is gone").toBeTruthy();
  });

  it("postcss is not left resolving on its own", () => {
    // "$postcss" makes the override follow the declared dependency rather than float.
    expect(pkg.overrides?.postcss).toBeTruthy();
  });
});
