/**
 * S242 / TOOL-01 — THE VERIFIERS GIVE THE SAME ANSWER ON WINDOWS AND LINUX.
 *
 * Two gates were reporting fiction on Windows, and both for the same reason: a path built with
 * `join()` carries the platform separator, and the code that consumed it assumed POSIX.
 *
 *   · `native-integrity.mjs` filtered route pages with `/(?:^|\/)page\.tsx$/` against `join`-built
 *     paths. On Windows those are `src\app\page.tsx`, the `(?:^|\/)` never matched, `routePages`
 *     came back EMPTY, and the static route set held only "/". Every internal link in the app then
 *     reported as pointing at a missing route — the 48 phantom findings. Worse than a false alarm:
 *     a gate that fails 48 times on a clean tree is a gate people stop reading.
 *
 *   · `generator-guard.mjs` keyed its hash baseline by `relative(root, p)`, which yields
 *     `src\lib\variants.ts` on Windows against a baseline written as `src/lib/variants.ts`. Every
 *     key mismatched, so all 29 inputs read as simultaneously removed AND added — a diff that
 *     cannot be real — forcing the 287-second sweep to re-run on every Windows invocation.
 *
 * WHY THIS FILE TESTS THE RULE AND NOT THE SCRIPTS. CI here is Linux, so a test that merely runs
 * the two gates would pass with or without the fix and prove nothing — which is exactly how the
 * bug survived. Instead it exercises the normalisation on literal Windows-shaped strings, which is
 * platform-independent and therefore actually catches a regression.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const WIN = "\\";
const toPosix = (p: string) => p.split(WIN).join("/");

describe("TOOL-01 — route discovery survives Windows separators", () => {
  const ROUTE_FILTER = /(?:^|\/)page\.tsx$/;
  const winPaths = [
    "src\\app\\page.tsx",
    "src\\app\\(shell)\\practice\\[chapterId]\\page.tsx",
    "src\\app\\layout.tsx",
    "src\\app\\api\\review-steps\\route.ts"
  ];

  it("the raw filter finds nothing on Windows paths — the defect, pinned", () => {
    expect(winPaths.filter((p) => ROUTE_FILTER.test(p))).toEqual([]);
  });

  it("normalised first, it finds exactly the page files", () => {
    expect(winPaths.filter((p) => ROUTE_FILTER.test(toPosix(p)))).toHaveLength(2);
  });

  it("native-integrity normalises before matching", () => {
    const src = readFileSync(join(ROOT, "scripts/native-integrity.mjs"), "utf8");
    expect(src, "route filter must not test a join()-built path directly").toMatch(
      /ROUTE|posix\(p\)|split\(sep\)\.join\("\/"\)/
    );
    expect(src).toContain('split(sep).join("/")');
  });
});

describe("TOOL-01 — the generator baseline is keyed by one canonical separator", () => {
  it("a Windows relative path normalises to the baseline's form", () => {
    expect(toPosix("src\\lib\\variants.ts")).toBe("src/lib/variants.ts");
  });

  it("generator-guard normalises its keys", () => {
    const src = readFileSync(join(ROOT, "scripts/session/generator-guard.mjs"), "utf8");
    expect(src).toContain('split(sep).join("/")');
    expect(src, "sep must be imported to normalise with it").toMatch(/import \{[^}]*\bsep\b[^}]*\} from "node:path"/);
  });

  it("every key already on disk is POSIX-shaped", () => {
    // If a baseline were ever recorded on Windows before this fix, it would carry backslash keys
    // and silently disagree with every Linux run thereafter.
    const baseline = JSON.parse(readFileSync(join(ROOT, "GENERATOR_SOURCE_HASHES.json"), "utf8"));
    const keys = Object.keys(baseline.files ?? {});
    expect(keys.length).toBeGreaterThan(20);
    expect(keys.filter((k) => k.includes("\\"))).toEqual([]);
  });
});
