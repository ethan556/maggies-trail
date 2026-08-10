#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
const root=resolve(import.meta.dirname,'../..'),output='SESSION149_ARTIFACTS.json';
const manifest=JSON.parse(readFileSync(join(root,output),'utf8'));
const forbiddenDirs=new Set(['node_modules','.next','.cml-build','coverage','test-results','playwright-report','.git']);
function excluded(rel,name,isDir){if(isDir&&forbiddenDirs.has(name))return true;if(rel===output)return true;return name.endsWith('.log')||name.endsWith('.tsbuildinfo')||name==='.DS_Store';}
function walk(dir){const out=[];for(const name of readdirSync(dir).sort()){const full=join(dir,name),rel=relative(root,full).replaceAll('\\','/'),st=statSync(full);if(excluded(rel,name,st.isDirectory()))continue;if(st.isDirectory())out.push(...walk(full));else if(st.isFile())out.push(rel);}return out;}
const expected=new Map(manifest.files.map(x=>[x.path,x])),actual=walk(root),errors=[];
for(const rel of actual){const row=expected.get(rel);if(!row){errors.push(`unlisted file: ${rel}`);continue;}const bytes=readFileSync(join(root,rel)),sha=createHash('sha256').update(bytes).digest('hex');if(bytes.length!==row.size)errors.push(`size mismatch: ${rel}`);if(sha!==row.sha256)errors.push(`hash mismatch: ${rel}`);expected.delete(rel);}
for(const rel of expected.keys())errors.push(`manifest file missing: ${rel}`);
if(manifest.session!==149||manifest.root!=='maggies-trail-session-149')errors.push('manifest identity mismatch');
if(manifest.fileCount!==actual.length)errors.push(`file count mismatch: manifest ${manifest.fileCount}, actual ${actual.length}`);
if(errors.length){console.error(`artifact manifest failed: ${errors.length} errors`);for(const e of errors.slice(0,50))console.error(`- ${e}`);process.exit(1);}console.log(`artifact manifest passed: ${actual.length}/${actual.length} files`);
