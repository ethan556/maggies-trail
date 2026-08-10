#!/usr/bin/env node
/**
 * Exact cumulative authorization bridge for historical S147–S151 content proofs.
 *
 * SESSION151C_CONTENT_CHANGE_PROOF.json is the cumulative post-S151 ledger. Unlike
 * a path-only allow-list, each entry also carries the exact current sha256. Historical
 * proofs may therefore acknowledge later legitimate edits/additions without becoming
 * blind to a new mutation of an already-authorized file.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function verifiedPostS151Changes(root = process.cwd()) {
  const proofPath = join(root, "SESSION151C_CONTENT_CHANGE_PROOF.json");
  if (!existsSync(proofPath)) throw new Error(`missing cumulative content proof: ${proofPath}`);
  const proof = JSON.parse(readFileSync(proofPath, "utf8"));
  if (proof?.passed !== true) throw new Error("SESSION151C_CONTENT_CHANGE_PROOF.json is not a passing proof");
  if (!Array.isArray(proof.changed)) throw new Error("SESSION151C content proof has no changed[] ledger");
  if (proof.summary?.unexpectedChangedLessonFiles !== 0 || proof.summary?.missingAuthorizedChanges !== 0) {
    throw new Error("SESSION151C content proof reports unexpected or missing authorized changes");
  }
  if (proof.summary?.authorizedEntryCount !== proof.changed.length) {
    throw new Error(`SESSION151C authorization count mismatch: ${proof.summary?.authorizedEntryCount} != ${proof.changed.length}`);
  }

  const paths = new Set();
  for (const entry of proof.changed) {
    const rel = entry?.rel;
    const expected = entry?.sha256;
    if (typeof rel !== "string" || !/^content\/courses\/[^/]+\/lessons\/[^/]+\.json$/.test(rel)) {
      throw new Error(`invalid cumulative lesson path: ${String(rel)}`);
    }
    if (paths.has(rel)) throw new Error(`duplicate cumulative lesson path: ${rel}`);
    if (typeof expected !== "string" || !/^[0-9a-f]{64}$/.test(expected)) {
      throw new Error(`invalid cumulative sha256 for ${rel}`);
    }
    const abs = join(root, rel);
    if (!existsSync(abs)) throw new Error(`authorized cumulative lesson is missing: ${rel}`);
    const got = sha(readFileSync(abs));
    if (got !== expected) {
      throw new Error(`authorized cumulative lesson hash drift: ${rel}\nexpected ${expected}\nactual   ${got}`);
    }
    paths.add(rel);
  }
  return paths;
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  try {
    const paths = verifiedPostS151Changes(process.cwd());
    console.log(`POST_S151_AUTHORIZED_EXACT_PASS:${paths.size} lesson files match their sealed hashes`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
