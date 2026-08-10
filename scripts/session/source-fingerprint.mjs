/** source-fingerprint — one sha256 over everything that can change test BEHAVIOR except content/.
 *
 * The pair (sourceFingerprint, corpusFingerprint) is a complete statement of a test group's
 * inputs: every group depends on source; only some groups read content/. If a group's recorded
 * pair matches the live pair bit-for-bit, re-running it must produce the identical result — that
 * is not an assumption, it is the project's determinism doctrine, and the sweep group exists to
 * enforce exactly it. Reuse under a matching pair is therefore as honest as a re-run; reuse under
 * a MISMATCHED pair is fabrication, which is why the recorder refuses it loudly.
 *
 * Covered: src/, e2e/, db/migrations/, scripts/ (test selection and generators live here),
 * package-lock.json (dependency versions change behavior — katex 0.16.31 proved it),
 * next.config.mjs, tsconfig.json, vitest and playwright configs.
 * Deliberately NOT covered: content/ (that is corpusFingerprint's job), reports/, *.md.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src", "e2e", "db/migrations", "scripts"];
/* S205G: vitest.setup.ts and package.json were MISSING and both change test behaviour.
 * vitest.setup.ts is the severe one — vitest loads it before EVERY test, so it can redefine
 * globals, and vitest.config.ts only names its PATH: editing the setup file's contents left this
 * fingerprint bit-identical. Proved by probe, not argued: appending a global-mutating line to
 * vitest.setup.ts moved zero bits of the hash, which under reuse would report stale passes as
 * current. package.json is the milder one (package-lock pins resolved versions) but its scripts
 * and overrides still steer what runs. If you add a root-level file that any test reads, add it
 * here in the same commit — a fingerprint that misses an input is worse than no fingerprint,
 * because it launders staleness as proof. */
const FILES = ["package-lock.json", "package.json", "next.config.mjs", "tsconfig.json", "vitest.config.ts", "vitest.setup.ts", "playwright.config.ts"];

function* walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield p;
  }
}

export function sourceFingerprint(root) {
  const h = createHash("sha256");
  let files = 0;
  for (const r of ROOTS) {
    const d = join(root, r);
    if (!existsSync(d)) continue;
    for (const p of walk(d)) {
      h.update(p.slice(root.length));
      h.update(readFileSync(p));
      files++;
    }
  }
  for (const f of FILES) {
    const p = join(root, f);
    if (!existsSync(p)) continue;
    h.update(f);
    h.update(readFileSync(p));
    files++;
  }
  return { sha256: h.digest("hex"), files };
}
