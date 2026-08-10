#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../..'),baseline=JSON.parse(readFileSync(join(root,'SESSION143_LESSON_HASHES.json'),'utf8'));
const expected=new Set(['content/courses/ratios-rates/lessons/rr-03-02.json','content/courses/ratios-rates/lessons/rr-03-03.json','content/courses/ratios-rates/lessons/rr-05-03.json','content/courses/proportional-relationships/lessons/pr-02-01.json','content/courses/proportional-relationships/lessons/pr-02-03.json']);
const sha=b=>createHash('sha256').update(b).digest('hex'),changed=[],errors=[];
for(const course of readdirSync(join(root,'content/courses'))){const dir=join(root,'content/courses',course,'lessons');if(!existsSync(dir))continue;for(const f of readdirSync(dir).filter(x=>x.endsWith('.json'))){const rel=`content/courses/${course}/lessons/${f}`,h=sha(readFileSync(join(root,rel)));if(baseline.files[rel]!==h)changed.push(rel)}}
changed.sort();if(JSON.stringify(changed)!==JSON.stringify([...expected].sort()))errors.push(`changed lesson set mismatch: ${changed.join(', ')}`);
try{execFileSync(process.execPath,[join(root,'scripts/audit/proportional-reasoning-s144.mjs')],{cwd:root,stdio:'inherit'})}catch{errors.push('proportional authored audit failed')}
if(errors.length){console.error(`Session 144 content proof failed (${errors.length})`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}
console.log('Session 144 content proof passed: exactly 5 lesson files changed; 38 authored experiences preserved; zero variant-declaration drift');
