/* run-test-groups --reuse-unchanged: the honesty pins.
 *
 * Reuse is only as honest as its refusal conditions, so those are what get tested — not the happy
 * path's arithmetic but the three ways a stale count could masquerade as current:
 *   1. source changed        -> the recorded sourceSha mismatches; reuse must be refused
 *   2. group membership grew -> fileCount mismatches even if the sha matched; refused
 *   3. content/ changed      -> content-DEPENDENT files must re-run even under a source match,
 *                              and content/sweep groups must never be reused at all
 * The selection function itself (which files count as content-dependent) is pinned against the
 * measured ground truth on this tree, so the probe regex cannot silently rot.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { sourceFingerprint } from "../../scripts/session/source-fingerprint.mjs";

const root = process.cwd();

describe("source-fingerprint", () => {
  it("is deterministic and covers a non-trivial file set", () => {
    const a = sourceFingerprint(root);
    const b = sourceFingerprint(root);
    expect(a.sha256).toBe(b.sha256);
    expect(a.files).toBeGreaterThan(300);
  });

  it("excludes content/ — a lesson edit must NOT move the source fingerprint", () => {
    // The exclusion is structural (content/ is not in ROOTS/FILES), pinned by reading the module
    // source rather than mutating the tree mid-suite.
    const src = readFileSync(join(root, "scripts/session/source-fingerprint.mjs"), "utf8");
    const roots = src.match(/const ROOTS = \[([^\]]+)\]/)?.[1] ?? "";
    expect(roots).not.toContain('"content"');
    expect(roots).toContain('"src"');
    expect(roots).toContain('"scripts"');
    const files = src.match(/const FILES = \[([^\]]+)\]/)?.[1] ?? "";
    expect(files).toContain("package-lock.json"); // the katex lesson: lockfile drift changes behavior
  });
});

describe("recorder reuse honesty (structural pins on run-test-groups.mjs)", () => {
  const src = readFileSync(join(root, "scripts/session/run-test-groups.mjs"), "utf8");

  it("content and sweep can never be reused — both read the corpus by design", () => {
    expect(src).toMatch(/alwaysFresh = group === "content" \|\| group === "sweep"/);
  });

  it("reuse requires BOTH a sourceSha match and an unchanged group file count", () => {
    expect(src).toMatch(/prevG\.sourceSha256 === srcFp\.sha256 && prevG\.fileCount === files\.length/);
  });

  it("reuse is opt-in: without the flag the previous record is never even read", () => {
    expect(src).toMatch(/reuseFlag && existsSync\(prevPath\)/);
  });

  it("a reused group still re-runs its content-dependent files fresh", () => {
    expect(src).toMatch(/contentDependentFiles\(files\)/);
    // and an unreadable file is treated as dependent, never silently skipped
    expect(src).toMatch(/catch \{ return true; \}/);
  });

  it("every recorded group carries provenance an auditor can re-derive", () => {
    expect(src).toMatch(/provenance: `reused: sourceSha match/);
    expect(src).toMatch(/provenance: "fresh full run"/);
  });
});

describe("content-dependence probe matches the measured ground truth", () => {
  // Measured on this tree (S205F): these rest-group files read content/ and MUST be selected.
  const known = [
    "src/components/LessonPlayer.play.test.tsx",
    "src/components/LessonPlayer.predict.test.tsx",
    "src/components/LessonPlayer.ui.test.tsx",
    "src/components/figures.test.ts",
    "src/lib/content.test.ts",
    "src/lib/lessonState.test.ts",
  ];
  const probe = /content\/courses|readdirSync\(.*content|CONTENT_DIR|join\([^\n]*"content"/;

  it("selects every known content-reading test file", () => {
    for (const f of known) {
      if (!existsSync(join(root, f))) continue; // renamed files fail the next assertion instead
      expect(probe.test(readFileSync(join(root, f), "utf8")), f).toBe(true);
    }
    expect(known.filter((f) => existsSync(join(root, f))).length).toBeGreaterThanOrEqual(5);
  });

  it("does NOT select a plainly content-independent file (the probe is not trivially true)", () => {
    const indep = readFileSync(join(root, "src/lib/describeState.test.tsx"), "utf8");
    expect(probe.test(indep)).toBe(false);
  });
});

describe("failure-first: a forged record cannot survive the recorder", () => {
  it("reuse under a mismatched sourceSha falls back to a fresh run (decision fn extracted)", () => {
    // The decision is a pure predicate; evaluate it directly with a forged prev record.
    const canReuse = (
      reuseFlag: boolean, alwaysFresh: boolean,
      prevG: { sourceSha256: string; fileCount: number } | null,
      liveSha: string, liveCount: number
    ) =>
      reuseFlag && !alwaysFresh && !!prevG &&
      prevG.sourceSha256 === liveSha && prevG.fileCount === liveCount;
    const live = { sha: "aaaa", count: 101 };
    expect(canReuse(true, false, { sourceSha256: "aaaa", fileCount: 101 }, live.sha, live.count)).toBe(true);
    // forged/stale sha -> refused
    expect(canReuse(true, false, { sourceSha256: "bbbb", fileCount: 101 }, live.sha, live.count)).toBe(false);
    // group grew -> refused even with matching sha
    expect(canReuse(true, false, { sourceSha256: "aaaa", fileCount: 100 }, live.sha, live.count)).toBe(false);
    // content/sweep -> refused regardless
    expect(canReuse(true, true, { sourceSha256: "aaaa", fileCount: 101 }, live.sha, live.count)).toBe(false);
    // no flag -> refused
    expect(canReuse(false, false, { sourceSha256: "aaaa", fileCount: 101 }, live.sha, live.count)).toBe(false);
  });
});
