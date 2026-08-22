const nums=(s)=>[...s.matchAll(/\d+/g)].map(m=>+m[0]);
const exact=(options,label)=>{const x=options.find(o=>o===label);if(x===undefined)throw new Error(`no option ${label}: ${options.join(' || ')}`);return x;};
// S330: like exact(), but tolerant of a trailing "s" mismatch between `label` and the option text —
// for building a label like "More {noun}" from a noun captured out of prompt prose, where English
// count-agreement legitimately singularizes the noun in the SENTENCE ("1 heart") while the option
// itself is always the plural category name ("More hearts"). Tries the exact label first (so every
// already-correct call site behaves identically), then the pluralized and singularized forms.
const exactFlexPlural=(options,label)=>{
 const x=options.find(o=>o===label||o===`${label}s`||(label.endsWith('s')&&o===label.slice(0,-1)));
 if(x===undefined)throw new Error(`no option ${label}: ${options.join(' || ')}`);
 return x;
};
const pairNums=(label)=>[...label.matchAll(/\d+/g)].map(m=>+m[0]);
// wv: word-number for the K0_ADD_SUBTRACT (Koa*) forms below. The generator (g0Variants.ts) always
// spells its own k1 template with DIGITS ("3 blocks"), which plain nums() already parses — but the
// statically-authored k2/k3/ch1 surface variety for these same forms restates most stories with
// numbers spelled out in words ("Four apples combine with three apples"), so every Koa* branch
// tries the digit shape first and falls back to an anchored word-phrase regex.
const ONE_WORDS={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20};
const wv=(tok)=>{if(tok==null)return undefined;const t=tok.toLowerCase();if(t in ONE_WORDS)return ONE_WORDS[t];if(t==='pair')return 2;if(t.endsWith('s')&&(t.slice(0,-1) in ONE_WORDS))return ONE_WORDS[t.slice(0,-1)];return undefined};
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
 case'KoaJoinNumeric':{
  let m=prompt.match(/has (\d+) \w+\. Another group has (\d+)/);
  if(m)return +m[1]+ +m[2];
  m=prompt.match(/(\w+) apples combine with (\w+) apples/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/(\w+) blocks? joins? (\w+) blocks?/i);
  if(m)return wv(m[1])+wv(m[2]);
  throw new Error('KoaJoinNumeric: '+prompt);
 }
 case'KoaFingersNumeric':{
  if(ns.length>=2)return ns[0]+ns[1];
  let m=prompt.match(/shows? (\w+) fingers? and the other shows (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/[Tt]wo hands each show (\w+) raised fingers/i);
  if(m)return wv(m[1])*2;
  m=prompt.match(/[Aa] full hand and (\w+) extra finger/i);
  if(m)return 5+wv(m[1]);
  throw new Error('KoaFingersNumeric: '+prompt);
 }
 case'KoaDrawingsNumeric':{
  if(ns.length>=2)return ns[0]+ns[1];
  let m=prompt.match(/begins with (\w+) circles and adds a pair/i);
  if(m)return wv(m[1])+2;
  m=prompt.match(/has (\w+) circles, then gains (\w+) more/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/(\w+) circles are drawn before (\w+) more join them/i);
  if(m)return wv(m[1])+wv(m[2]);
  throw new Error('KoaDrawingsNumeric: '+prompt);
 }
 case'KoaActOutNumeric':{
  if(ns.length>=2)return ns[0]+ns[1];
  let m=prompt.match(/(\w+) children are joined by (\w+) others/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/(\w+) children are playing and another group of (\w+) joins/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/[Aa] group of (\w+) gains (\w+) children/i);
  if(m)return wv(m[1])+wv(m[2]);
  throw new Error('KoaActOutNumeric: '+prompt);
 }
 case'KoaTakeAwayNumeric': case'KoaSubDrawingsNumeric': case'KoaSubActOutNumeric': case'KoaHowManyLeftNumeric': return ns[0]-ns[1];
 case'KoaAddToStoryNumeric':{
  if(ns.length>=2)return ns[0]+ns[1];
  let m=prompt.match(/(\w+) apples are joined by (\w+) apples/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/(\w+) blocks are in a basket before (\w+) more enter/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/begins with (\w+) bears and receives (\w+) more/i);
  if(m)return wv(m[1])+wv(m[2]);
  throw new Error('KoaAddToStoryNumeric: '+prompt);
 }
 case'KoaTakeFromStoryNumeric':{
  if(ns.length>=2)return ns[0]-ns[1];
  let m=prompt.match(/[Hh]alf of (\w+) apples are removed/i);
  if(m)return Math.floor(wv(m[1])/2);
  m=prompt.match(/(\w+) blocks are in a basket before (\w+) leave/i);
  if(m)return wv(m[1])-wv(m[2]);
  m=prompt.match(/(\w+) bears lose a pair/i);
  if(m)return wv(m[1])-2;
  throw new Error('KoaTakeFromStoryNumeric: '+prompt);
 }
 case'KoaPutTogetherNumeric':{
  let m=prompt.match(/has (\d+) red grapes and (\d+) green/);
  if(m)return +m[1]+ +m[2];
  m=prompt.match(/(\w+) red grapes sit beside (\w+) green grapes/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/(\w+) red grapes and (\w+) green grapes make one bowl/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/combines (\w+) red grapes with (\w+) green grapes/i);
  if(m)return wv(m[1])+wv(m[2]);
  throw new Error('KoaPutTogetherNumeric: '+prompt);
 }
 case'KoaSums5Numeric':{
  let m=prompt.match(/^(\d+) \+ (\d+) = \?/);
  if(m)return +m[1]+ +m[2];
  m=prompt.match(/[Cc]ombine (\w+) with a group of (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/total made by (\w+) and (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  m=prompt.match(/sum belongs to (\w+) and (\w+)/i);
  if(m)return wv(m[1])+wv(m[2]);
  throw new Error('KoaSums5Numeric: '+prompt);
 }
 case'KoaDiffs5Numeric':{
  let m=prompt.match(/^(\d+) [−-] (\d+) = \?/);
  if(m)return +m[1]- +m[2];
  m=prompt.match(/[Aa] group of (\w+) loses (\w+) item/i);
  if(m)return wv(m[1])-1;
  m=prompt.match(/[Rr]emove (\w+) from a group of (\w+)/i);
  if(m)return wv(m[2])-wv(m[1]);
  m=prompt.match(/(\w+) loses a pair/i);
  if(m)return wv(m[1])-2;
  throw new Error('KoaDiffs5Numeric: '+prompt);
 }
 case'KoaPlusMinusOneNumeric':{
  let m=prompt.match(/^(\d+) \+ 1 = \?/);
  if(m)return +m[1]+1;
  m=prompt.match(/^(\d+) [−-] 1 = \?/);
  if(m)return +m[1]-1;
  m=prompt.match(/[Tt]ake one away from (\w+)/i);
  if(m)return wv(m[1])-1;
  m=prompt.match(/[Ss]tep backward once from (\w+)/i);
  if(m)return wv(m[1])-1;
  m=prompt.match(/[Mm]ove forward once from (\w+)/i);
  if(m)return wv(m[1])+1;
  throw new Error('KoaPlusMinusOneNumeric: '+prompt);
 }
 case'KoaZeroFactNumeric':{
  let m=prompt.match(/^(\d+) [+−-] 0 = \?/);
  if(m)return +m[1];
  m=prompt.match(/(\w+) objects have none removed/i);
  if(m)return wv(m[1]);
  m=prompt.match(/[Aa] group of (\w+) loses nothing/i);
  if(m)return wv(m[1]);
  m=prompt.match(/[Nn]othing joins a group of (\w+)/i);
  if(m)return wv(m[1]);
  throw new Error('KoaZeroFactNumeric: '+prompt);
 }
 case'KoaSpeedy5Numeric':{
  let m=prompt.match(/fast: (\d+) \+ (\d+) = \?/);
  if(m)return +m[1]+ +m[2];
  m=prompt.match(/fast: (\d+) [−-] (\d+) = \?/);
  if(m)return +m[1]- +m[2];
  m=prompt.match(/[Rr]emove (\w+) from (\w+) and name the remainder/i);
  if(m)return wv(m[2])-wv(m[1]);
  m=prompt.match(/difference when (\w+) leaves (\w+)/i);
  if(m)return wv(m[2])-wv(m[1]);
  m=prompt.match(/[Cc]ombine (\w+) and (\w+) without counting/i);
  if(m)return wv(m[1])+wv(m[2]);
  throw new Error('KoaSpeedy5Numeric: '+prompt);
 }
 case'KoaWriteAddMcq':{
  if(ns.length>=2){const cand=`${ns[0]} + ${ns[1]} = ${ns[0]+ns[1]}`;if(options.includes(cand))return cand;}
  const trueAdd=options.find(o=>{const m=o.match(/^(\d+) \+ (\d+) = (\d+)$/);return m&&+m[1]+ +m[2]===+m[3];});
  if(trueAdd)return trueAdd;
  throw new Error('KoaWriteAddMcq: '+prompt);
 }
 case'KoaWriteSubMcq': return exact(options,`${ns[0]} \u2212 ${ns[1]} = ${ns[0]-ns[1]}`);
 case'KoaChooseOpMcq':{const add=/more ducks? swims? (?:into|over)/i.test(prompt);const modern=options.includes('Add both groups')||options.includes('Subtract the leaving group');return exact(options,modern?(add?'Add both groups':'Subtract the leaving group'):(add?'Add':'Subtract'));}
 case'KoaModelStoryMcq':{
  const crossed=options.find(o=>/\d+\s*(?:cats?\s*)?crossed out/.test(o));
  if(crossed)return crossed;
  throw new Error('KoaModelStoryMcq: '+prompt);
 }
  // S183 k0-count-100: each route re-derives the answer from the PROMPT TEXT the learner reads,
  // never from the generator's internals. Sequence facts come from the printed numbers alone.
  case 'kSeqNextHop': case 'kSeqNextMcq': case 'kDecadeNextMcq': {
   let base=ns[0];
   if(base===undefined){
    // Two word-only phrasings state the same "+1" sequence fact without a literal digit.
    let m=prompt.match(/full ten and (\w+) extras gain one more/i);
    if(m)base=10+wv(m[1]);
    else if((m=prompt.match(/^(\w+) shells are counted; one new shell arrives/i)))base=wv(m[1]);
   }
   // A minority of these prompts ask "comes right BEFORE N" despite the form's own "Next" name —
   // the direction word in the prompt, not the form tag, decides the sign.
   const delta=/\bbefore\b/i.test(prompt)?-1:1;
   const a=String(base+delta);return form==='kSeqNextHop'?base+delta:exact(options,a);
  }
  case 'kSeqBeforeHop': {
   // Two phrasings restate the same "back hop" story without a literal "right before N": one
   // spells the back-step count as a word ("take three back-steps").
   let m=prompt.match(/^Use one back-step from (\d+) to identify its smaller neighbour/i);
   if(m)return +m[1]-1;
   m=prompt.match(/^Start at (\d+) and take (\w+) back-steps?\. Which lesser number is the landing\?/i);
   if(m)return +m[1]-wv(m[2]);
   return ns[0]-1;
  }
  case 'kSeqMissingMcq': case 'kChartMissingMcq': return exact(options,String(ns[0]+2));
  case 'kDecadeCrossHop': case 'kCountFromHop': return ns[0]+ns[1];
  case 'kTensNextHop': return ns[0]+10;
  case 'kTensNextMcq': case 'kChartRowMcq': return exact(options,String(ns[0]+10));
  case 'kTensBackHop': return ns[0]-10;
  case 'kTensBackMcq': return exact(options,String(ns[0]-10));
  case 'kCountBackHop': return ns[0]-ns[1];
  case 'kTensOrderDrag': case 'kSeqOrderDrag': return state.items.map(x=>x.label).sort((a,b)=>+a-+b);
  case 'countAddMcq': {const values=/red counters?/.test(prompt)?ns.slice(0,3):ns.slice(0,2);return exact(options,String(values.reduce((a,b)=>a+b,0)));}
  case 'countAddLine': case 'countTensLine': {if(state){const sign=state.direction==='back'?-1:1;return state.start+sign*state.hop*state.hops;}const start=ns[0],hops=/once/.test(prompt)?1:ns[1],hop=form==='countTensLine'?10:1;return start+hop*hops;}
  case 'countCompareEqualMcq': return exact(options,'They are equal');
  case 'countTensMcq': {if(prompt.startsWith('Starting at 0'))return exact(options,String(ns[2]/10));const seq=ns.slice(0,3).map(n=>n*10).join(', ');return exact(options,seq);}
  case 'countObjectsMcq': {
   // "Mia counted three shells but wrote 2. Which numeral corrects her record?" states the WRONG
   // digit she wrote as a decoy alongside the TRUE word-stated count; ns.length's own digit grab
   // would seize on that decoy instead of the count the question actually asks to correct to.
   let m=prompt.match(/counted (\w+) .*\bwrote \d+/i);
   if(m){const v=wv(m[1]);if(v!==undefined)return exact(options,String(v));}
   if(ns.length)return exact(options,String(Math.max(...ns)));
   // Word-only tally ("Eight stars each have one tick...") states the total count as the FIRST
   // number word in the prompt, not as an enumerated 1,2,3,... list of digits.
   for(const t of prompt.match(/[A-Za-z]+/g)||[]){const v=wv(t);if(v!==undefined)return exact(options,String(v));}
   return exact(options,String(Math.max(...ns)));
  }
  case 'countObjectsFlash': case 'countReadFlash': return state?.visibleCount ?? Number(parts[1]);
  case 'countDecomposeMcq': {if(prompt.includes('shared equally'))return exact(options,String(ns[0]/ns[1]));const total=ns[0];return options.find(x=>{const [a,b]=pairNums(x);return Number.isFinite(a)&&Number.isFinite(b)&&a+b!==total;});}
  case 'countMakeTenMcq': return options.find(x=>pairNums(x).reduce((a,b)=>a+b,0)===10);
  case 'countMoreFewerMcq': {
   // Several sub-patterns share this form, not just a stars/hearts pair. (1) The general "There
   // are N {noun1} and M {noun2}... Which statement is true?" compares the two counts and answers
   // "More {noun}" using whichever noun the prompt itself names — no noun is hardcoded. (2) A
   // "spaced-out vs tight" prompt asks which group is bigger by COUNT despite a visual-spread cue
   // that makes the smaller group LOOK bigger. (3) An error-correction prompt echoes back the
   // learner's own disputed number. (4) A pure-method question has one fixed correct answer with
   // no counts to compare at all.
   let m=prompt.match(/There are (\d+) (\w+) and (\d+) (\w+)\.\s*Which statement is true\?/i);
   // S330: a count of exactly 1 singularizes ITS noun in the prompt's own count-agreement grammar
   // ("1 heart" beside "3 stars"), but "More {noun}" options are always the plural category name —
   // exactFlexPlural (not exact) tolerates that mismatch instead of assuming the captured noun's
   // grammatical number already matches the option text.
   if(m){const n1=+m[1],noun1=m[2],n2=+m[3],noun2=m[4];return exactFlexPlural(options,n1>n2?`More ${noun1}`:n2>n1?`More ${noun2}`:'They are equal');}
   m=prompt.match(/A (\w[\w-]*) group of (\d+) looks bigger than a (\w[\w-]*) group of (\d+)\. Which method settles/i);
   if(m){const desc1=m[1],n1=+m[2],desc2=m[3],n2=+m[4];return exact(options,n2>n1?`The ${desc2} group of ${n2} is bigger`:`The ${desc1} group of ${n1} is bigger`);}
   m=prompt.match(/A learner calls (\d+) the smaller group when it is paired with (\d+)\. Which observation corrects the error\?/i);
   if(m)return exact(options,`${m[1]} is the larger group, not the smaller one`);
   if(prompt.startsWith('Two rows fill different amounts of space'))return exact(options,'Count each row and compare the two totals');
   // Fallback: "Pair 5 hearts with 5 of the 6 stars..." restates the paired SUBSET count (5)
   // ahead of the real star TOTAL (6) — positional ns[0]/ns[1] grabs the subset, not the total.
   // Anchoring each count to its own noun is right regardless of which comes first in the prompt.
   const starM=prompt.match(/(\d+)\s+stars?\b/i),heartM=prompt.match(/(\d+)\s+hearts?\b/i);
   const a=starM?+starM[1]:ns[0],b=heartM?+heartM[1]:ns[1];
   return exact(options,a>b?'More stars':b>a?'More hearts':'They are equal');
  }
  case 'countOrderDrag': return state.items.map(x=>x.label).sort((a,b)=>+a-+b);
  case 'countBetweenMcq': return exact(options,String((ns[0]+ns[1])/2));
  case 'countReadMcq': {
   // "What does the numeral N secretly say?" asks for a ten-and-ones DESCRIPTION of N, not the
   // bare numeral itself (which every other authored prompt for this form asks for instead).
   let m=prompt.match(/What does the numeral (\d+) secretly say\?/i);
   if(m){const NUM_WORDS=['zero','one','two','three','four','five','six','seven','eight','nine'];return exact(options,`One complete ten, and ${NUM_WORDS[+m[1]%10]} more`);}
   // "Thirteen is one ten plus how many extra ones?" asks for the ONES digit of a word-spelled
   // teen number (teen − 10), not the teen number itself.
   m=prompt.match(/^(\w+) is one ten plus how many extra ones\?/i);
   if(m){const v=wv(m[1]);if(v!==undefined)return exact(options,String(v-10));}
   // "One full ten and three extra dots need a numeral label." / "...ten-frame and two extra dots
   // make which numeral?" spell the ONES count as a word and ask for the full teen numeral (10+N);
   // ns[0] would otherwise be undefined (no literal digit anywhere in either sentence).
   m=prompt.match(/\bten\b[\s\S]*?(\w+) extra dots?/i);
   if(m){const v=wv(m[1]);if(v!==undefined)return exact(options,String(10+v));}
   if(ns.length)return exact(options,String(ns[0]));
   // Plain word-count prompts ("A six-dot card needs a written label...") state the numeral as a
   // single number word with no digit anywhere in the prompt.
   for(const t of prompt.match(/[A-Za-z]+/g)||[]){const v=wv(t);if(v!==undefined)return exact(options,String(v));}
   return exact(options,String(ns[0]));
  }
  case 'countZeroTap': return state.hotspots.filter(h=>h.count===0).map(h=>h.label).sort();
  case 'countSubtractMcq': return exact(options,String(ns[0]-ns[1]));
  case 'countSubtractLine': {if(state)return state.start-state.hop*state.hops;const hops=/once/.test(prompt)?1:ns[1];return ns[0]-hops;}
  // S328 reworded the prompt from "A full group of 10 is already shown. Add the extra dots
 // needed to make {teen}." (ns=[10,teen], answer=ns[1]-10) to "{teen} is a full ten and
 // {extra} more. Tap to build {that} {extra} extra {dot(s)}." (ns=[teen,extra,extra]) because
 // the frame actually starts EMPTY (preFilled=0) and can never show a pre-built ten -- the old
 // wording claimed a rendered state the widget cannot produce. The second sentence now states
 // the tap count directly, so the independent read is the second parsed number, not teen-10.
 case 'countTeenFrame': return ns[1];
  case 'shapeComposePairs': {const map={'two triangles':'a square','two squares side by side':'a rectangle','six squares folded up':'a cube','two half-circles':'a circle','four equal triangles':'a larger square'};return Object.fromEntries(state.left.map(x=>[x.label,map[x.label]]));}
  case 'shapeComposeMcq': {
   if(prompt.startsWith('A simple'))return exact(options,'A square and a triangle');
   // "You have N triangles. Each square needs M. How many squares can you build?" is a DIVISION
   // story (N/M) — a different job from the default "how many triangles build N squares?" (2N).
   const m=prompt.match(/have (\d+) triangles\. Each square needs (\d+)/i);
   if(m)return exact(options,`${+m[1]/+m[2]} squares`);
   return exact(options,String(ns[0]*2));
  }
  case 'shapeComposeTap': return state.hotspots.filter(h=>h.label==='triangle').map(h=>h.label).sort();
  case 'shapeWeightMcq': {
   // The generator's own template always names its object "bear"/"bags" and says "goes up"/"goes
   // down"/"stays level" — but authored content varies both the noun (backpack, truck, bags) and
   // the verb phrase ("that pan rises"/"sinks down" instead of "goes up"/"goes down"). The noun and
   // direction are both re-derived from the actual prompt text instead of assumed fixed.
   if(/\blevel\b/i.test(prompt)){
    const m=prompt.match(/Two (\w+) sit/i);
    return exact(options,`The ${m?m[1]:'bags'} weigh the same`);
   }
   const lighter=/\bgoes?\s+up\b/i.test(prompt)||/\brises?\b/i.test(prompt);
   const nm=prompt.match(/about the (\w+)\?/i)||prompt.match(/the (?:toy )?(\w+)'s side/i)||prompt.match(/^A (?:toy )?(\w+) sits/i);
   return exact(options,`The ${nm?nm[1]:'bear'} is ${lighter?'lighter':'heavier'}`);
  }
  case 'shapeWeightTap': {if(prompt.includes('Tap the heavier')){const heavy=prompt.match(/the (.+?) side goes down/)[1];return [state.hotspots.find(h=>h.label===heavy).label];}const small=prompt.match(/than a (.+?)\. Tap/)[1];return [state.hotspots.find(h=>h.label===small).label];}
  case 'shapeLengthCompare': return state.items.reduce((a,b)=>a.length>=b.length?a:b).label;
  case 'shapePositionMcq': {const word=prompt.match(/“(.+?)”/)[1],opp={above:'below',below:'above','in front of':'behind',behind:'in front of',inside:'outside',outside:'inside','left of':'right of','right of':'left of'};return exact(options,opp[word]);}
  case 'shapePositionTap': {
   // Several prompts drop "is" and/or say "under"/"over" instead of "below"/"above", and name an
   // object other than "the table" ("beside the nest"). Hotspot labels always use above/below/
   // beside, so the relation word is normalized to one of those before the label lookup.
   const REL_SYN={under:'below',over:'above',above:'above',below:'below',beside:'beside'};
   const word=(prompt.match(/(above|below|beside|under|over)\s+the\s+\w+/i)||[])[1];
   const rel=REL_SYN[word?.toLowerCase()];
   return [state.hotspots.find(h=>h.label.includes(rel)).label];
  }
  case 'shapeRollStackMcq': {
   // S330: the "why can cans stack" answer is worded two ways across the corpus — the g0Variants.ts
   // generator always says "Their flat circle ends rest on one another"; statically-authored content
   // (e.g. shapes-build-k/kgb-02-05) says "Their flat ends rest on one another", no "circle". Both
   // options describe the same "flat ends meet" idea, so match on that phrase instead of picking one
   // exact wording.
   if(!prompt.startsWith('Why can cans'))return exact(options,'A sphere');
   const flatEnds=options.find(o=>/flat.*rest on one another/i.test(o));
   if(!flatEnds)throw new Error(`no "flat ... rest on one another" option: ${options.join(' || ')}`);
   return flatEnds;
  }
  case 'shapeRollStackTap': return [state.hotspots.find(h=>h.label==='cubes').label];
  case 'shapeAnyWayMcq': {
   // Three distinct answer families share this form, distinguished by the QUESTION asked, not by
   // where the shape word sits in the prompt: (1) "What proves it is still a X?" wants the
   // sides/corners COUNT as evidence; (2) an identity question ("what (shape) is it (now)?"/"what
   // stays true?") wants the shape restated ("Still a X"), with X taken from anywhere in the
   // prompt — not necessarily right after a leading "A "; (3) anything else (a "what
   // decides/counts..." definitional question) wants the generic "Its sides and corners".
   // S330: family (2)'s actual g0Variants.ts template is "A {shape} is turned sideways. What
   // shape is it now?" — the generator names the axis being asked about ("shape") between "What"
   // and "is it now?"; the regex below tolerates that one inserted word (or none, for a bare
   // "What is it now?"/"What stays true?") rather than requiring an exact "What is it" adjacency.
   const SIDES={square:4,rectangle:4,triangle:3};
   let m=prompt.match(/What proves it is still a (\w+)\?/i);
   if(m){const n=SIDES[m[1].toLowerCase()];return exact(options,`It still has ${n} sides and ${n} corners`);}
   if(/What (?:\w+ )?(is it( now)?|stays true)\?$/.test(prompt)){
    const shape=(prompt.match(/\b(square|triangle|rectangle)\b/i)||[])[1];
    if(shape)return exact(options,`Still a ${shape.toLowerCase()}`);
   }
   return exact(options,'Its sides and corners');
  }
  // "Tap every shape with no straight sides and no corners" describes a circle by property
  // instead of naming it, so the literal-word check alone would fall through to 'triangle'.
  case 'shapeAnyWayTap': {const target=(prompt.includes('circle')||prompt.includes('no straight sides'))?'circle':'triangle';return state.hotspots.filter(h=>h.label.includes(target)).map(h=>h.label).sort();}
  case 'shapeSortMcq': {const m=prompt.match(/sort a (\w+) (\w+).*by color and then by kind/),color=m[1],item=m[2],kind={apple:'food',banana:'food',car:'toy',sock:'clothing'}[item];return exact(options,`${color[0].toUpperCase()+color.slice(1)} group first, then ${kind} group`);}
  case 'shapeSortTap': {
   // Only one real phrasing ("Tap the group with more") is a bare max-count question; the rest
   // state an explicit rule the answer must satisfy: a shape-type/size rule quoted in the prompt
   // ("The rule is 'circles.'", "The size rule is 'small shapes.'"), or a MINIMUM-count rule
   // ("fewest"). The quoted rule's words are matched against each hotspot's own label.
   const rm=prompt.match(/rule is '([^']+)'/i);
   if(rm){
    const words=rm[1].toLowerCase().replace(/\.$/,'').split(/\s+/).filter(w=>w.length>2);
    const hit=state.hotspots.find(h=>words.some(w=>h.label.toLowerCase().includes(w)));
    if(hit)return [hit.label];
   }
   if(/\bfewest\b|\bleast\b|\bsmallest\b/i.test(prompt))return [state.hotspots.reduce((a,b)=>a.count<=b.count?a:b).label];
   return [state.hotspots.reduce((a,b)=>a.count>=b.count?a:b).label];
  }
  case 'shapeSortFrame': return state?.target ?? ns[ns.length-1];
 }
 throw new Error(`no Grade 0 independent route for ${form}`);
}
module.exports={solvePrompt};
