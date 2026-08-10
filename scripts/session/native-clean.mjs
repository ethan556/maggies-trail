#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "..", "..");
const temp = mkdtempSync(join(tmpdir(), "maggies-native-clean-"));
const copy = join(temp, basename(root));
try {
  execFileSync("rsync", ["-a", "--exclude", "node_modules", "--exclude", ".next", "--exclude", ".cml-build", "--exclude", "coverage", "--exclude", "test-results", "--exclude", "playwright-report", `${root}/`, `${copy}/`], { cwd: dirname(root), stdio: "inherit" });
  execFileSync(process.execPath, [join(copy, "scripts", "native-integrity.mjs")], { cwd: copy, stdio: "inherit", timeout: 120_000 });
  console.log("native clean-copy gate passed");
} finally {
  rmSync(temp, { recursive: true, force: true });
}
