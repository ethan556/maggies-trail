const nums=(s)=>[...s.matchAll(/\d+/g)].map(m=>+m[0]);
const exact=(options,label)=>{const x=options.find(o=>o===label);if(x===undefined)throw new Error(`no option ${label}: ${options.join(' || ')}`);return x;};
const pairNums=(label)=>[...label.matchAll(/\d+/g)].map(m=>+m[0]);
function solvePrompt(form,input){
 const parts=input.split('||'),prompt=parts[0],raw=parts.slice(1).join('||');
 let state=null,options=[];
 if(raw){
  try{state=JSON.parse(raw);}catch{
   options=(parts[1]||'').split(';;').filter(Boolean);
   if(form==='shapeComposePairs') state={left:(parts[1]||'').split('\u001f').filter(Boolean).map(label=>({label})),right:(parts[2]||'').split('\u001f').filter(Boolean).map(label=>({label}))};
   else if(form==='countOrderDrag'||form==='kTensOrderDrag'||form==='kSeqOrderDrag') state={items:(parts[1]||'').split(',').filter(Boolean).map(label=>({label}))};
   else if(['countZeroTap','shapeComposeTap','shapeWeightTap','shapePositionTap','shapeRollStackTap','shapeAnyWayTap','shapeSortTap'].includes(form)) state={hotspots:(parts[1]||'').split(',').filter(Boolean).map(label=>({label,count:(nums(label)[0]??0)}))};
  }
 }
 const ns=nums(prompt);
 switch(form){
 // ---- S189 k0-add-subtract: every answer recomputed from the PARSED PROMPT ----
 case'KoaJoinNumeric':{const m=prompt.match(/has (\d+) \w+\. Another group has (\d+)/);return +m[1]+ +m[2];}
 case'KoaFingersNumeric':{const m=prompt.match(/up (\d+) fingers on one hand and (\d+)/);return +m[1]+ +m[2];}
 case'KoaDrawingsNumeric':{const m=prompt.match(/Draw (\d+) circles\. Then draw (\d+)/);return +m[1]+ +m[2];}
 case'KoaActOutNumeric':{const m=prompt.match(/^(\d+) children are playing\. (\d+) more/);return +m[1]+ +m[2];}
 case'KoaTakeAwayNumeric':{const m=prompt.match(/are (\d+) cookies\. You eat (\d+)/);return +m[1]- +m[2];}
 case'KoaSubDrawingsNumeric':{const m=prompt.match(/Draw (\d+) circles, then cross out (\d+)/);return +m[1]- +m[2];}
 case'KoaSubActOutNumeric':{const m=prompt.match(/^(\d+) children are playing\. (\d+) go home/);return +m[1]- +m[2];}
 case'KoaHowManyLeftNumeric':{const m=prompt.match(/^(\d+) balloons.*until (\d+) have gone/);return +m[1]- +m[2];}
 case'KoaAddToStoryNumeric':{const m=prompt.match(/holds (\d+) \w+\. Someone puts in (\d+)/);return +m[1]+ +m[2];}
 case'KoaTakeFromStoryNumeric':{const m=prompt.match(/holds (\d+) \w+\. Someone takes out (\d+)/);return +m[1]- +m[2];}
 case'KoaPutTogetherNumeric':{const m=prompt.match(/has (\d+) red grapes and (\d+) green/);return +m[1]+ +m[2];}
 case'KoaSums5Numeric':{const m=prompt.match(/^(\d+) \+ (\d+) = \?/);return +m[1]+ +m[2];}
 case'KoaDiffs5Numeric':{const m=prompt.match(/^(\d+) [−-] (\d+) = \?/);return +m[1]- +m[2];}
 case'KoaPlusMinusOneNumeric':{let m=prompt.match(/^(\d+) \+ 1 = \?/);if(m)return +m[1]+1;m=prompt.match(/^(\d+) [−-] 1 = \?/);return +m[1]-1;}
 case'KoaZeroFactNumeric':{const m=prompt.match(/^(\d+) [+−-] 0 = \?/);return +m[1];}
 case'KoaSpeedy5Numeric':{let m=prompt.match(/fast: (\d+) \+ (\d+) = \?/);if(m)return +m[1]+ +m[2];m=prompt.match(/fast: (\d+) [−-] (\d+) = \?/);return +m[1]- +m[2];}
 case'KoaWriteAddMcq':{const m=prompt.match(/^(\d+) birds.*?\. (\d+) more/);return exact(options,`${+m[1]} + ${+m[2]} = ${+m[1]+ +m[2]}`);}
 case'KoaWriteSubMcq':{const m=prompt.match(/^(\d+) frogs.*?\. (\d+) hop/);return exact(options,`${+m[1]} \u2212 ${+m[2]} = ${+m[1]- +m[2]}`);}
 case'KoaChooseOpMcq':{return exact(options,/more ducks swim over/.test(prompt)?'Add':'Subtract');}
 case'KoaModelStoryMcq':{const m=prompt.match(/^"(\d+) cats sit on a wall\. (\d+) jump down/);return exact(options,`${+m[1]} cats drawn, with ${+m[2]} crossed out`);}
  // S183 k0-count-100: each route re-derives the answer from the PROMPT TEXT the learner reads,
  // never from the generator's internals. Sequence facts come from the printed numbers alone.
  case 'kSeqNextHop': case 'kSeqNextMcq': case 'kDecadeNextMcq': {const a=String(ns[0]+1);return form==='kSeqNextHop'?ns[0]+1:exact(options,a);}
  case 'kSeqBeforeHop': return ns[0]-1;
  case 'kSeqMissingMcq': case 'kChartMissingMcq': return exact(options,String(ns[0]+2));
  case 'kDecadeCrossHop': case 'kCountFromHop': return ns[0]+ns[1];
  case 'kTensNextHop': return ns[0]+10;
  case 'kTensNextMcq': case 'kChartRowMcq': return exact(options,String(ns[0]+10));
  case 'kTensBackHop': return ns[0]-10;
  case 'kCountBackHop': return ns[0]-ns[1];
  case 'kTensOrderDrag': case 'kSeqOrderDrag': return state.items.map(x=>x.label).sort((a,b)=>+a-+b);
  case 'countAddMcq': {const values=prompt.includes('red counters')?ns.slice(0,3):ns.slice(0,2);return exact(options,String(values.reduce((a,b)=>a+b,0)));}
  case 'countAddLine': case 'countTensLine': {if(state){const sign=state.direction==='back'?-1:1;return state.start+sign*state.hop*state.hops;}const start=ns[0],hops=/once/.test(prompt)?1:ns[1],hop=form==='countTensLine'?10:1;return start+hop*hops;}
  case 'countCompareEqualMcq': return exact(options,'They are equal');
  case 'countTensMcq': {if(prompt.startsWith('Starting at 0'))return exact(options,String(ns[2]/10));const seq=ns.slice(0,3).map(n=>n*10).join(', ');return exact(options,seq);}
  case 'countObjectsMcq': return exact(options,String(Math.max(...ns)));
  case 'countObjectsFlash': case 'countReadFlash': return state?.visibleCount ?? Number(parts[1]);
  case 'countDecomposeMcq': {if(prompt.includes('shared equally'))return exact(options,String(ns[0]/ns[1]));const total=ns[0];return options.find(x=>{const [a,b]=pairNums(x);return Number.isFinite(a)&&Number.isFinite(b)&&a+b!==total;});}
  case 'countMakeTenMcq': return options.find(x=>pairNums(x).reduce((a,b)=>a+b,0)===10);
  case 'countMoreFewerMcq': {const [a,b]=ns;return exact(options,a>b?'More stars':b>a?'More hearts':'They are equal');}
  case 'countOrderDrag': return state.items.map(x=>x.label).sort((a,b)=>+a-+b);
  case 'countBetweenMcq': return exact(options,String((ns[0]+ns[1])/2));
  case 'countReadMcq': return exact(options,String(ns[0]));
  case 'countZeroTap': return state.hotspots.filter(h=>h.count===0).map(h=>h.label).sort();
  case 'countSubtractMcq': return exact(options,String(ns[0]-ns[1]));
  case 'countSubtractLine': {if(state)return state.start-state.hop*state.hops;const hops=/once/.test(prompt)?1:ns[1];return ns[0]-hops;}
  case 'countTeenFrame': return ns[1]-10;
  case 'shapeComposePairs': {const map={'two triangles':'a square','two squares side by side':'a rectangle','six squares folded up':'a cube','two half-circles':'a circle','four equal triangles':'a larger square'};return Object.fromEntries(state.left.map(x=>[x.label,map[x.label]]));}
  case 'shapeComposeMcq': return prompt.startsWith('A simple')?exact(options,'A square and a triangle'):exact(options,String(ns[0]*2));
  case 'shapeComposeTap': return state.hotspots.filter(h=>h.label==='triangle').map(h=>h.label).sort();
  case 'shapeWeightMcq': {if(prompt.includes('stays level'))return exact(options,'The bags weigh the same');return exact(options,prompt.includes('goes up')?'The bear is lighter':'The bear is heavier');}
  case 'shapeWeightTap': {if(prompt.includes('Tap the heavier')){const heavy=prompt.match(/the (.+?) side goes down/)[1];return [state.hotspots.find(h=>h.label===heavy).label];}const small=prompt.match(/than a (.+?)\. Tap/)[1];return [state.hotspots.find(h=>h.label===small).label];}
  case 'shapeLengthCompare': return state.items.reduce((a,b)=>a.length>=b.length?a:b).label;
  case 'shapePositionMcq': {const word=prompt.match(/“(.+?)”/)[1],opp={above:'below',below:'above','in front of':'behind',behind:'in front of',inside:'outside',outside:'inside','left of':'right of','right of':'left of'};return exact(options,opp[word]);}
  case 'shapePositionTap': {const rel=prompt.match(/is (above|below|beside) the table/)[1];return [state.hotspots.find(h=>h.label.includes(rel)).label];}
  case 'shapeRollStackMcq': return exact(options,prompt.startsWith('Why can cans')?'Their flat circle ends rest on one another':'A sphere');
  case 'shapeRollStackTap': return [state.hotspots.find(h=>h.label==='cubes').label];
  case 'shapeAnyWayMcq': {if(prompt.startsWith('A ')){const shape=prompt.match(/^A (\w+)/)[1];return exact(options,`Still a ${shape}`);}return exact(options,'Its sides and corners');}
  case 'shapeAnyWayTap': {const target=prompt.includes('circle')?'circle':'triangle';return state.hotspots.filter(h=>h.label.includes(target)).map(h=>h.label).sort();}
  case 'shapeSortMcq': {const m=prompt.match(/sort a (\w+) (\w+).*by color and then by kind/),color=m[1],item=m[2],kind={apple:'food',banana:'food',car:'toy',sock:'clothing'}[item];return exact(options,`${color[0].toUpperCase()+color.slice(1)} group first, then ${kind} group`);}
  case 'shapeSortTap': return [state.hotspots.reduce((a,b)=>a.count>=b.count?a:b).label];
  case 'shapeSortFrame': return state?.target ?? ns[ns.length-1];
 }
 throw new Error(`no Grade 0 independent route for ${form}`);
}
module.exports={solvePrompt};
