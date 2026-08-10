#!/usr/bin/env node
/**
 * authored-corpus-fingerprint — exact identity of the authored curriculum corpus.
 *
 * This hash is intentionally narrower than session/corpus-fingerprint.mjs. It covers the bytes
 * that generate curriculum-manifest.json: every course.json and every lesson JSON, with each
 * relative path mixed into the digest. Product-state generation refuses to proceed when this
 * fingerprint disagrees with the manifest, so a stale generated state cannot silently inherit
 * old counts after authored content changes.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export function authoredCorpusFingerprint(root = process.cwd()) {
  const coursesRoot = join(root, "content", "courses");
  if (!existsSync(coursesRoot)) throw new Error(`authored corpus not found: ${coursesRoot}`);

  const files = [];
  let courses = 0;
  let lessons = 0;
  for (const dir of readdirSync(coursesRoot).sort()) {
    const courseDir = join(coursesRoot, dir);
    const courseFile = join(courseDir, "course.json");
    if (!existsSync(courseFile)) continue;
    courses++;
    files.push(courseFile);
    const lessonsDir = join(courseDir, "lessons");
    if (!existsSync(lessonsDir)) continue;
    for (const file of readdirSync(lessonsDir).filter((f) => f.endsWith(".json")).sort()) {
      files.push(join(lessonsDir, file));
      lessons++;
    }
  }

  const h = createHash("sha256");
  for (const abs of files) {
    const rel = relative(root, abs).split(sep).join("/");
    const bytes = readFileSync(abs);
    h.update(rel);
    h.update("\0");
    h.update(bytes);
    h.update("\0");
  }
  return { sha256: h.digest("hex"), files: files.length, courses, lessons };
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) console.log(JSON.stringify(authoredCorpusFingerprint(process.cwd()), null, 2));
