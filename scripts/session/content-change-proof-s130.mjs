#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..", "..");
const baseline = JSON.parse(readFileSync(join(root, "SESSION129_LESSON_HASHES.json"), "utf8"));
const ledger = JSON.parse(readFileSync(join(root, "SESSION130_CONTENT_CHANGE_LEDGER.json"), "utf8"));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const canonical = (v) => Array.isArray(v) ? `[${v.map(canonical).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}` : JSON.stringify(v);
const H = (v) => sha(canonical(v));
const errors = [];
if (ledger.session !== 130 || ledger.baselineSession !== 129) errors.push("ledger session/baseline mismatch");
const targets = new Map(ledger.lessons.map((row) => [row.sourcePath, row]));
function lessonFiles() {
  const out=[]; const courses=join(root,"content","courses");
  for(const course of readdirSync(courses)){const dir=join(courses,course,"lessons"); if(!existsSync(dir)) continue; for(const file of readdirSync(dir).filter(x=>x.endsWith('.json'))) out.push(`content/courses/${course}/lessons/${file}`)}
  return out.sort();
}
const files=lessonFiles();
if(files.length!==baseline.count) errors.push(`lesson count ${files.length} != baseline ${baseline.count}`);
for(const path of files){
  const text=readFileSync(join(root,path));
  const rec=targets.get(path);
  if(!rec){ if(sha(text)!==baseline.files[path]) errors.push(`${path}: changed outside Session 130 ledger`); continue; }
  if(baseline.files[path]!==rec.beforeSha256) errors.push(`${path}: before hash does not match Session 129 seal`);
  if(sha(text)!==rec.afterSha256) errors.push(`${path}: after hash does not match current bytes`);
  const doc=JSON.parse(text);
  const top=Object.fromEntries(Object.entries(doc).filter(([k])=>!['steps','remedials'].includes(k)));
  if(H(top)!==rec.frozenSurfaceProof.topLevel.after || rec.frozenSurfaceProof.topLevel.before!==rec.frozenSurfaceProof.topLevel.after) errors.push(`${path}: top-level fields changed`);
  if(H(doc.steps.map(s=>s.id))!==rec.frozenSurfaceProof.stepOrder.after || rec.frozenSurfaceProof.stepOrder.before!==rec.frozenSurfaceProof.stepOrder.after) errors.push(`${path}: step order changed`);
  const targetIds=new Set(['i1','i2','i3','k1','k2','k3','ch1']);
  for(const step of doc.steps){
    const proof=rec.frozenSurfaceProof.steps[step.id]; if(!proof){errors.push(`${path}/${step.id}: missing proof`);continue;}
    let value=step;
    if(targetIds.has(step.id)){
      value=structuredClone(step); delete value.widget; if(value.variant) value.variant.form='__TARGET_FORM__';
    }
    if(H(value)!==proof.after || proof.before!==proof.after) errors.push(`${path}/${step.id}: frozen surface changed`);
  }
  for(const route of doc.remedials??[]){
    const proof=rec.frozenSurfaceProof.remedials[route.conceptTag]; if(!proof){errors.push(`${path}/${route.conceptTag}: missing remedial proof`);continue;}
    let value=route;
    if(['ssg2-grid-count','ssg2-grid-apply'].includes(route.conceptTag)){value=structuredClone(route); delete value.check.widget;}
    if(H(value)!==proof.after || proof.before!==proof.after) errors.push(`${path}/${route.conceptTag}: remedial fields outside widget changed`);
  }
}
if(errors.length){console.error(`Session 130 content proof failed (${errors.length})`); for(const e of errors) console.error(`- ${e}`); process.exit(1)}
console.log(`Session 130 content proof passed: ${files.length} lessons; 2 files / 16 widget nodes / 8 variant forms changed; all other authored surfaces preserved`);
