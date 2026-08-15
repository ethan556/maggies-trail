/**
 * S242 / CACHE-01 — THE PRECACHE STAYS OUT OF GIT AND OUT OF RELEASE ARCHIVES.
 *
 * `.cowork-cache/pedagogy-v3/` holds a 6 MB derived index of the whole corpus. Every byte of it is
 * reconstructible from tracked source in about a second, and none of it is read by the application.
 * The plan states the constraint plainly: "Cache outputs are evidence accelerators, never
 * source-of-truth curriculum and never included in release archives."
 *
 * WHY THAT NEEDS AN ASSERTION. Both mechanisms are one line in one file, and both fail silently
 * when removed. A missing `.gitignore` entry commits six megabytes of derived index that then goes
 * stale in the repository and is quoted as truth by whoever finds it — which is exactly the failure
 * mode the truth reconciliation of this session spent its time undoing. A missing
 * `native-integrity` entry lets a release archive ship it.
 *
 * DELIBERATELY NOT ASSERTED: that the cache is byte-stable across rebuilds. That IS proved, by
 * `node scripts/cache/pedagogy-v3-cache.mjs --verify`, which builds it twice from clean and
 * compares — but it takes seconds and belongs in the gate chain, not in the unit suite.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("CACHE-01 — the precache cannot be committed or shipped", () => {
  it(".gitignore excludes it", () => {
    expect(
      read(".gitignore"),
      "the .cowork-cache ignore rule is gone — a 6 MB derived index will be committed and then quoted as truth once it goes stale"
    ).toMatch(/^\.cowork-cache\/$/m);
  });

  it("native-integrity flags it as a release-archive artifact", () => {
    const source = read("scripts/native-integrity.mjs");
    expect(
      source,
      "the .cowork-cache entry is gone from the generated-artifact list — a release archive can now ship the precache"
    ).toContain('".cowork-cache"');
    // It must also be skipped when WALKING the tree; otherwise every cache layer is scanned as if
    // it were source, which is both slow and a source of phantom findings.
    const walkExclusions = source.slice(0, source.indexOf("for (const name of ["));
    expect(walkExclusions, "the tree walk does not skip .cowork-cache").toContain(".cowork-cache");
  });

  it("the builder writes no timestamp, so two builds can be byte-identical", () => {
    // A generation time in the manifest would make every rebuild differ, which destroys the
    // byte-stability property TRUTH-03 needs and makes --verify meaningless. The seal and the input
    // hashes carry the same information without that cost.
    const builder = read("scripts/cache/pedagogy-v3-cache.mjs");
    const body = builder.slice(builder.indexOf("const LAYERS"));
    expect(body).not.toMatch(/new Date\(\)|Date\.now\(\)|toISOString/);
  });

  it("invalidation is by content hash, never by mtime", () => {
    const builder = read("scripts/cache/pedagogy-v3-cache.mjs");
    // `statSync` is used once, to report layer sizes. It must never reach the staleness decision:
    // a checkout of an older branch rewrites mtimes without changing content, and a file restored
    // to earlier content keeps a NEWER mtime, so an mtime cache serves the wrong answer forever.
    const staleness = builder.slice(builder.indexOf("function layerState"), builder.indexOf("if (MODE === \"status\")"));
    expect(staleness).not.toMatch(/mtime|statSync/);
    expect(staleness).toContain("_inputFingerprint");
  });
});
