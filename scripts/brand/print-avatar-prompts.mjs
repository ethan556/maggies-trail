#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pack = JSON.parse(await readFile(resolve(repoRoot, "avatar-prompts.json"), "utf8"));
const requested = process.argv.slice(2);

if (requested.length === 0) {
  console.error("Usage: node scripts/brand/print-avatar-prompts.mjs avatar-101 [avatar-201 ...]");
  process.exitCode = 2;
} else {
  const byId = new Map(pack.avatars.map((avatar) => [avatar.id, avatar]));
  for (const id of requested) {
    const avatar = byId.get(id);
    if (!avatar) {
      console.error(`${id}: no prompt-pack record`);
      process.exitCode = 1;
      continue;
    }
    console.log(JSON.stringify({
      promptPackVersion: pack.version,
      id: avatar.id,
      kind: avatar.kind,
      band: avatar.band,
      prompt: avatar.prompt,
      negativePrompt: avatar.negative_prompt,
      files: avatar.files
    }, null, 2));
  }
}
