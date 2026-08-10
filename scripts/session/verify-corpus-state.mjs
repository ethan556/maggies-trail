#!/usr/bin/env node
/** Fail closed when authored curriculum, manifest, and product-state identity disagree. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { authoredCorpusFingerprint } from "./authored-corpus-fingerprint.mjs";

export function verifyCorpusState(root = process.cwd()) {
  const readJSON = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
  const live = authoredCorpusFingerprint(root);
  const manifest = readJSON("content/curriculum-manifest.json");
  const product = readJSON("PRODUCT_STATE.json");
  const verified = readJSON("PRODUCT_STATE_VERIFIED.json");

  let lessons = 0;
  let steps = 0;
  let courses = 0;
  for (const dir of readdirSync(join(root, "content", "courses")).sort()) {
    const courseFile = join(root, "content", "courses", dir, "course.json");
    if (!existsSync(courseFile)) continue;
    courses++;
    const lessonDir = join(root, "content", "courses", dir, "lessons");
    if (!existsSync(lessonDir)) continue;
    for (const f of readdirSync(lessonDir).filter((x) => x.endsWith(".json"))) {
      const lesson = JSON.parse(readFileSync(join(lessonDir, f), "utf8"));
      lessons++;
      steps += lesson.steps?.length ?? 0;
    }
  }

  const errors = [];
  const expect = (ok, msg) => { if (!ok) errors.push(msg); };
  expect(manifest.corpusSha256 === live.sha256, `manifest corpusSha256 ${manifest.corpusSha256 ?? "missing"} != live ${live.sha256}`);
  expect(product.corpusSha256 === live.sha256, `PRODUCT_STATE corpusSha256 ${product.corpusSha256 ?? "missing"} != live ${live.sha256}`);
  expect(verified.corpusSha256 === live.sha256, `PRODUCT_STATE_VERIFIED corpusSha256 ${verified.corpusSha256 ?? "missing"} != live ${live.sha256}`);
  expect(verified.verification?.status === "verified", "PRODUCT_STATE_VERIFIED verification.status != verified");
  expect(verified.verification?.manifestCorpusSha256 === live.sha256, "verified manifest hash does not match live corpus");
  expect(manifest.totals?.courses === courses, `manifest courses ${manifest.totals?.courses} != live ${courses}`);
  expect(manifest.totals?.lessons === lessons, `manifest lessons ${manifest.totals?.lessons} != live ${lessons}`);
  expect(manifest.totals?.steps === steps, `manifest steps ${manifest.totals?.steps} != live ${steps}`);
  expect(product.courses === courses && verified.courses === courses, "product-state course total disagrees with live corpus");
  expect(product.lessons === lessons && verified.lessons === lessons, "product-state lesson total disagrees with live corpus");
  expect(product.steps === steps && verified.steps === steps, "product-state step total disagrees with live corpus");

  if (errors.length) {
    throw new Error(`corpus-state verification failed:\n- ${errors.join("\n- ")}`);
  }
  return { ...live, steps, contentVersion: manifest.contentVersion, generatedAt: verified.generatedAt };
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  try {
    const result = verifyCorpusState(process.cwd());
    console.log(`corpus-state verified: ${result.courses} courses · ${result.lessons} lessons · ${result.steps} steps · sha256 ${result.sha256}`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
