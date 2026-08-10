#!/usr/bin/env node
/**
 * corpus-fingerprint — one definition of "is this recorded test result still about THIS tree?".
 *
 * Imported by BOTH `scripts/session/run-test-groups.mjs` (which writes the record) and
 * `scripts/gen-product-state.mjs` (which decides whether to trust it). Keeping it in one module is
 * the point: two copies of a hash construction drift, and a fingerprint that drifts silently
 * accepts stale numbers, which is the exact failure this whole mechanism exists to prevent.
 *
 * WHAT IT COVERS, and why that is the right line:
 *   - every lesson file's bytes — the dominant way test counts go stale is a content batch landing;
 *   - the sorted list of test-file PATHS — so an added or deleted suite also invalidates the record.
 * It deliberately does NOT cover the contents of test files. Doing so would invalidate the record on
 * every source edit and make it useless in practice; the residual risk is a test added or removed
 * inside an existing file, which the session that does it will re-run anyway.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export function corpusFingerprint(root) {
  const rows = [];
  const coursesDir = join(root, "content", "courses");
  for (const course of readdirSync(coursesDir).sort()) {
    const dir = join(coursesDir, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
      const rel = `content/courses/${course}/lessons/${file}`;
      rows.push(`${rel}:${createHash("sha256").update(readFileSync(join(root, rel))).digest("hex")}`);
    }
  }
  const lessons = rows.length;

  const testPaths = [];
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, `${prefix}/${e.name}`);
      else if (/\.test\.(ts|tsx)$/.test(e.name)) testPaths.push(`${prefix}/${e.name}`);
    }
  };
  walk(join(root, "src"), "src");
  testPaths.sort();
  rows.push(`__testfiles__:${testPaths.join(",")}`);

  return {
    sha256: createHash("sha256").update(rows.join("\n")).digest("hex"),
    lessons,
    testFiles: testPaths.length
  };
}
