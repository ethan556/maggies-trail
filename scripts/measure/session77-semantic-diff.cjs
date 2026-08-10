#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const currentRoot = path.resolve(__dirname, '../..');
const baselineRoot = '/mnt/data/session77_baseline';
const lessonDir = 'content/courses/coordinate-geometry/lessons';
const files = fs.readdirSync(path.join(currentRoot, lessonDir)).filter((name) => name.endsWith('.json')).sort();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function collectVariants(value, location = '$', out = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectVariants(entry, `${location}[${index}]`, out));
    return out;
  }
  if (!value || typeof value !== 'object') return out;
  if (Object.prototype.hasOwnProperty.call(value, 'variant')) {
    out.push({ location, variant: clone(value.variant) });
  }
  for (const [key, entry] of Object.entries(value)) {
    if (key !== 'variant') collectVariants(entry, `${location}.${key}`, out);
  }
  return out;
}

function stripVariants(value) {
  if (Array.isArray(value)) return value.map(stripVariants);
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key !== 'variant') out[key] = stripVariants(entry);
  }
  return out;
}

let additions = 0;
const changedFiles = [];
for (const name of files) {
  const relative = path.join(lessonDir, name);
  const before = JSON.parse(fs.readFileSync(path.join(baselineRoot, relative), 'utf8'));
  const after = JSON.parse(fs.readFileSync(path.join(currentRoot, relative), 'utf8'));
  assert.deepStrictEqual(stripVariants(after), stripVariants(before), `${name}: non-variant content changed`);

  const beforeMap = new Map(collectVariants(before).map((entry) => [entry.location, entry.variant]));
  const afterMap = new Map(collectVariants(after).map((entry) => [entry.location, entry.variant]));
  for (const [location, oldVariant] of beforeMap) {
    assert(afterMap.has(location), `${name}: variant removed at ${location}`);
    assert.deepStrictEqual(afterMap.get(location), oldVariant, `${name}: existing variant changed at ${location}`);
  }
  const fileAdds = [...afterMap.keys()].filter((location) => !beforeMap.has(location)).length;
  if (fileAdds) changedFiles.push({ name, additions: fileAdds });
  additions += fileAdds;
}
assert.strictEqual(additions, 37, `expected 37 variant additions, found ${additions}`);
assert.strictEqual(changedFiles.length, 10, `expected 10 changed lesson files, found ${changedFiles.length}`);
console.log(JSON.stringify({ lessonFiles: files.length, changedFiles: changedFiles.length, variantAdditions: additions, authoredContentChanges: 0, status: 'PASS' }));
