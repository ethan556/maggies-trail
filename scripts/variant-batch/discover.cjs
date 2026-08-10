const fs=require('fs'),path=require('path');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const V=require('../../src/lib/variants.ts');
const args=process.argv.slice(2);let grade=null,out=null,root='.',courses=[];
for(let i=0;i<args.length;i++){if(args[i]==='--grade')grade=Number(args[++i]);else if(args[i]==='--out')out=args[++i];else if(args[i]==='--root')root=args[++i];else courses.push(args[i]);}
if(grade!==null){for(const e of fs.readdirSync(path.join(root,'content/courses'),{withFileTypes:true}).filter(e=>e.isDirectory())){const p=path.join(root,'content/courses',e.name,'course.json');if(!fs.existsSync(p))continue;const meta=JSON.parse(fs.readFileSync(p,'utf8'));if(meta.gradeLevel===grade)courses.push(e.name);}}
courses=[...new Set(courses)].sort();if(!courses.length)throw new Error('usage: discover.cjs [--root repo] --grade <n> [--out file] OR discover.cjs [--root repo] <course...>');
const groups=new Map(),courseRows=[],targets=[];
for(const course of courses){const dir=path.join(root,'content/courses',course,'lessons');let total=0,served=0,gaps=0;
 for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort()){const doc=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));for(const step of doc.steps||[])if(['check','challenge'].includes(step.kind)){total++;const seed=`discover:${course}:${file}:${step.id}`;if(V.variantForStep(step,seed,'core')){served++;continue;}gaps++;const surface=step.widget?.type||'missing',key=`${course}|${step.conceptTag}|${surface}`;const row=groups.get(key)||{key,course,conceptTag:step.conceptTag,surface,count:0,examples:[]};row.count++;if(row.examples.length<3)row.examples.push({file,stepId:step.id,kind:step.kind,prompt:step.widget?.prompt});groups.set(key,row);targets.push({course,file,stepId:step.id,conceptTag:step.conceptTag,surface});}}
 courseRows.push({course,total,served,gaps});
}
const report={schemaVersion:1,generatedAt:new Date().toISOString(),courses:courseRows,total:courseRows.reduce((n,r)=>n+r.total,0),served:courseRows.reduce((n,r)=>n+r.served,0),gaps:targets.length,selectorGroups:[...groups.values()].sort((a,b)=>a.key.localeCompare(b.key)),targets};
const text=JSON.stringify(report,null,2)+'\n';if(out)fs.writeFileSync(out,text);console.log(JSON.stringify({courses:courses.length,total:report.total,served:report.served,gaps:report.gaps,selectorGroups:report.selectorGroups.length,out,status:'PASS'}));
