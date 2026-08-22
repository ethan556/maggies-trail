import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const DEFAULT_INPUTS = [
  "content/courses",
  "src/lib",
  "src/components",
  "scripts/audit/math-presentation-authored.ts",
  "scripts/audit/math-presentation-detectors.ts",
  "scripts/audit/math-presentation-indexes.mts",
  "scripts/audit/math-presentation-source-seal.ts",
] as const;

function collectFiles(path: string): string[] {
  if (!existsSync(path)) return [];
  const entries = readdirSync(path, { withFileTypes: true });
  if (entries.length === 0 || !entries.some((entry) => entry.isDirectory())) {
    // `readdirSync` throws for files, so reaching here means an empty or flat directory.
    return entries.flatMap((entry) =>
      entry.isFile()
        ? [join(path, entry.name)]
        : collectFiles(join(path, entry.name)),
    );
  }
  return entries.flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory()
      ? collectFiles(child)
      : entry.isFile()
        ? [child]
        : [];
  });
}

function filesForInput(path: string): string[] {
  if (!existsSync(path)) return [];
  try {
    return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
      const child = join(path, entry.name);
      return entry.isDirectory()
        ? collectFiles(child)
        : entry.isFile()
          ? [child]
          : [];
    });
  } catch {
    return [path];
  }
}

/** Hash the actual authored, generated, renderer-boundary, and detector inputs measured by the CSVs. */
export function mathPresentationInputFingerprint(
  root: string,
  inputs: readonly string[] = DEFAULT_INPUTS,
): { sha256: string; files: number } {
  const files = inputs
    .flatMap((input) => filesForInput(join(root, input)))
    .filter((file) => !/[.]test[.][cm]?[jt]sx?$/.test(file))
    .sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(relative(root, file).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(file));
    hash.update("\0");
  }
  return { sha256: hash.digest("hex"), files: files.length };
}

export function mathPresentationSourceSeal(
  root: string,
  head: string,
): {
  seal: string;
  inputSha256: string;
  inputFiles: number;
} {
  const fingerprint = mathPresentationInputFingerprint(root);
  return {
    seal: `${head}+inputs.${fingerprint.sha256.slice(0, 12)}`,
    inputSha256: fingerprint.sha256,
    inputFiles: fingerprint.files,
  };
}
