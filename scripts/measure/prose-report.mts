import { VARIANT_GENERATORS, variantFor, variantForGenForm } from "../../src/lib/variants";
const SEEDS = 40;
function visible(node: any, key = ""): string[] {
  if (typeof node === "string") {
    if (["id","type","delimiter","form","addColor","correct","answer","sequence","targets"].includes(key)) return [];
    return [node];
  }
  if (Array.isArray(node)) return node.flatMap((n) => visible(n, key));
  if (node && typeof node === "object") return Object.entries(node).flatMap(([k, v]) => visible(v, k));
  return [];
}
const RULES: Array<[string, (s:string,p:string)=>string|null]> = [
  ["plural-after-1", (s)=>{const m=s.match(/\b1 ([a-z]+s)\b/); return m?m[1]:null;}],
  ["ordinal", (s)=>{for(const m of s.matchAll(/\b(\d+)(st|nd|rd|th)\b/g)){const n=Number(m[1]);const t=n%100;const want=(t>=11&&t<=13)?"th":(["th","st","nd","rd"][n%10]??"th");if(want!==m[2])return m[0];}return null;}],
  ["digit-ths", (s)=>{const m=s.match(/\b\d+ths\b/);return m?m[0]:null;}],
  ["quantifier", (s)=>{const m=s.match(/\b(all both|both all|a an|an a|the a|a the|the the|of of|in in|to to)\b/i);return m?m[0]:null;}],
  ["repeated-word", (s)=>{const m=s.match(/\b([a-z]{2,})\s+\1\b/i);return m&&m[1].toLowerCase()!=="had"?m[0]:null;}],
  ["dangling", (s)=>{const m=s.match(/\s(a|an|the|of|and|or|than|is|are|to|with|by|for|from)\.(\s|$)/i);return m?m[0].trim():null;}],
  ["rounding", (s,p)=>{if(/decimal|round|nearest|to two|to three|approx|≈/i.test(p))return null;const m=s.match(/\b\d+\.\d{3,}\b/);return m?m[0]:null;}],
  ["float", (s)=>{const m=s.match(/\b\d+\.\d*(0{5,}\d|9{5,}\d)\d*\b/);return m?m[0]:null;}],
  ["template", (s)=>{const m=s.match(/undefined|NaN|\[object Object\]|\$\{|\bnull\b/);return m?m[0]:null;}],
  ["punct", (s)=>{const m=s.match(/ {2,}| [,.;:]|,,|\.\.(?!\.)|\(\)|\s+$|^\s+/);return m?JSON.stringify(m[0]):null;}],
];
const byRule = new Map<string, Map<string, string>>();
for (const g of VARIANT_GENERATORS) {
  for (const form of ["default", ...(g.forms ?? [])]) {
    for (let i = 0; i < SEEDS; i++) {
      const seed = `p:${g.tag}:${form}:${i}`;
      const v = form === "default" ? variantFor(g.tag, seed) : variantForGenForm(g.tag, form, seed);
      if (!v) continue;
      const prompt = (v.widget as any).prompt ?? "";
      for (const s of visible(v.widget)) {
        for (const [name, fn] of RULES) {
          const hit = fn(s, prompt);
          if (hit !== null) {
            if (!byRule.has(name)) byRule.set(name, new Map());
            const k = `${hit}`;
            if (!byRule.get(name)!.has(k)) byRule.get(name)!.set(k, `${g.tag}@${form} :: ${s.slice(0,120)}`);
          }
        }
      }
    }
  }
}
for (const [rule, hits] of byRule) {
  console.log(`\n##### ${rule} (${hits.size} distinct) #####`);
  for (const [k, ex] of [...hits].slice(0, 40)) console.log(`  ${k}  ||  ${ex}`);
}
