#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rel = 'SESSION151_LESSON_HASHES.json';
const file = path.join(root, rel);
const expectedFileSha = '3ff6e1891c158e5e55c9124b48b6043e44a9d57f376bcd553e86bb3ed0a47a01';
const bytes = fs.readFileSync(file);
const fileSha = crypto.createHash('sha256').update(bytes).digest('hex');
if (fileSha !== expectedFileSha) {
  throw new Error(`${rel} drifted: expected sealed sha256 ${expectedFileSha}, got ${fileSha}`);
}
const data = JSON.parse(bytes.toString('utf8'));
if (data.scope !== 'all authored lesson JSON files in Session 151') throw new Error('unexpected frozen ledger scope');
if (data.algorithm !== 'SHA-256') throw new Error('unexpected frozen ledger algorithm');
if (data.count !== 1129) throw new Error(`expected frozen count 1129, got ${data.count}`);
if (!data.files || typeof data.files !== 'object' || Array.isArray(data.files)) throw new Error('frozen ledger files must be an object');
const entries = Object.entries(data.files);
if (entries.length !== 1129) throw new Error(`expected 1129 frozen file hashes, got ${entries.length}`);
const pathRe = /^content\/courses\/[^/]+\/lessons\/[^/]+\.json$/;
const hashRe = /^[0-9a-f]{64}$/;
for (const [lessonPath, hash] of entries) {
  if (!pathRe.test(lessonPath)) throw new Error(`invalid frozen lesson path: ${lessonPath}`);
  if (!hashRe.test(hash)) throw new Error(`invalid SHA-256 for ${lessonPath}`);
}
console.log(`FROZEN_S151_LEDGER_PASS:${entries.length} entries · sha256 ${fileSha}`);
