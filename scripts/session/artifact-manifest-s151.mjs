#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
const root=resolve(import.meta.dirname,'../..');
const output='SESSION151_ARTIFACTS.json';
const forbiddenDirs=new Set(['node_modules','.next','.cml-build','coverage','test-results','playwright-report','.git']);
function excluded(rel,name,isDir){
  if(isDir&&forbiddenDirs.has(name))return true;
  if(rel===output)return true;
  return name.endsWith('.log')||name.endsWith('.tsbuildinfo')||name==='.DS_Store';
}
function walk(dir){
  const out=[];
  for(const name of readdirSync(dir).sort()){
    const full=join(dir,name),rel=relative(root,full).replaceAll('\\','/'),st=statSync(full);
    if(excluded(rel,name,st.isDirectory()))continue;
    if(st.isDirectory())out.push(...walk(full));
    else if(st.isFile())out.push({path:rel,size:st.size,sha256:createHash('sha256').update(readFileSync(full)).digest('hex')});
  }
  return out;
}
const files=walk(root);
const manifest={session:151,root:'maggies-trail-session-151',scope:'all packaged regular files except this manifest and explicitly forbidden dependency/build/log paths',excluded:[output,'node_modules/**','.next/**','.cml-build/**','coverage/**','test-results/**','playwright-report/**','.git/**','*.log','*.tsbuildinfo','.DS_Store'],fileCount:files.length,totalBytes:files.reduce((n,x)=>n+x.size,0),files};
writeFileSync(join(root,output),JSON.stringify(manifest,null,2)+'\n');
console.log(`artifact manifest written: ${files.length} files, ${manifest.totalBytes} bytes`);
