#!/usr/bin/env node
/**
 * Adversarial coverage prover (S154).
 *
 * Purpose: before committing a session to converting a lesson family onto an engine, PROVE
 * how many of that family's assessed steps the engine can actually serve — by deriving each
 * step's answer with an INDEPENDENT solver and comparing it to the frozen authored answer.
 *
 * Why this exists: S152 produced a tier "simulation" that swapped widget `type` only. It
 * showed D->A for eight lessons and was wrong twice over — (a) seven of the eight target
 * engines carry no value-keyed error surface, so they cannot legally receive the authored
 * commonErrors, and (b) a type swap proves nothing about whether a valid, answer-preserving
 * spec exists. This prover answers the real question and refuses to guess.
 *
 * Discipline: a family is only claimed as covered when MISMATCH === 0. Steps the prover
 * cannot parse unambiguously are reported as out-of-scope, never silently counted.
 *
 * Usage:  node scripts/measure/coverage-prover.mjs [generatorTag]
 *         (defaults to a1-systems, the family proven in S154)
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const tag = process.argv[2] ?? "a1-systems";

const norm = (s) => s.replaceAll("\u2212", "-").replaceAll("\u2013", "-").replaceAll("\u2014", "-");
const TERM = /([+-]?)(\d+(?:\.\d+)?)?([xy])?/g;
const CAND = /(?<![A-Za-z0-9])([0-9xy+\-.\s]*=[0-9xy+\-.\s]*)/g;

/** Exact rational arithmetic — float drift must never decide a coverage claim. */
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const rat = (n, d = 1) => { const g = gcd(n, d) || 1; const s = d < 0 ? -1 : 1; return { n: (s * n) / g, d: (s * d) / g }; };
const add = (p, q) => rat(p.n * q.d + q.n * p.d, p.d * q.d);
const mul = (p, q) => rat(p.n * q.n, p.d * q.d);
const sub = (p, q) => add(p, { n: -q.n, d: q.d });
const val = (p) => p.n / p.d;

function coeffs(raw) {
  const eq = raw.replaceAll(" ", "").replace(/\.+$/, "");
  if ((eq.match(/=/g) ?? []).length !== 1) return null;
  const [L, R] = eq.split("=");
  if (!L || !R) return null;
  const side = (e, sign) => {
    let a = rat(0), b = rat(0), c = rat(0);
    TERM.lastIndex = 0;
    for (const m of e.matchAll(TERM)) {
      const [, s, num, v] = m;
      if (num === undefined && v === undefined) continue;
      let k = rat(num === undefined ? 1 : Math.round(Number(num) * 1e6), num === undefined ? 1 : 1e6);
      if (s === "-") k = { n: -k.n, d: k.d };
      const t = mul(k, rat(sign));
      if (v === "x") a = add(a, t); else if (v === "y") b = add(b, t); else c = add(c, t);
    }
    return [a, b, c];
  };
  const [a1, b1, c1] = side(L, 1), [a2, b2, c2] = side(R, -1);
  const A = add(a1, a2), B = add(b1, b2), C = { n: -add(c1, c2).n, d: add(c1, c2).d };
  return A.n === 0 && B.n === 0 ? null : { A, B, C };
}


/** a1-radicals rule set (S158). Ordered most-specific-first — the S152 prover's four false
 * mismatches came from `simplify-coef` firing inside a like-terms prompt; order IS the logic.
 * Every rule returns null when its own preconditions fail (non-square quotient, radicand
 * mismatch), so a matched-but-underivable step is out-of-scope, never a guess. */
const isqrt = (n) => { const k = Math.floor(Math.sqrt(n)); return k * k === n ? k : (k + 1) * (k + 1) === n ? k + 1 : k; };
const sqCoef = (n, b) => { if (n % b !== 0) return null; const q = n / b, k = isqrt(q); return k * k === q ? k : null; };
const RADICAL_RULES = [
  ["like-terms", /(-?\d*) *√(\d+) *([+-]) *(\d*) *√(\d+) *= *a *√(\d+)/,
    (c1, r1, op, c2, r2, rt) => r1 === r2 && r2 === rt ? Number(c1 || 1) + (op === "+" ? 1 : -1) * Number(c2 || 1) : null],
  ["simplify-combine", /Simplify then combine: *√(\d+) *([+-]) *√(\d+) *= *a *√(\d+)/,
    (n, op, b, rt) => { if (Number(b) !== Number(rt)) return null; const k = sqCoef(Number(n), Number(rt)); return k === null ? null : k + (op === "+" ? 1 : -1) * 1; }],
  ["product-coef", /(\d*) *√(\d+) *[*] *(\d*) *√(\d+) *= *a *√(\d+)/,
    (c1, r1, c2, r2, rt) => { const prod = Number(r1) * Number(r2), t = Number(rt); if (prod % t !== 0) return null; const k = sqCoef(prod, t); return k === null ? null : Number(c1 || 1) * Number(c2 || 1) * k; }],
  ["simplify-coef", /√(\d+) *= *a *√(\d+)/, (n, b) => sqCoef(Number(n), Number(b))],
  ["sqrt-perfect", /What is *√(\d+)\?/, (n) => { const k = isqrt(Number(n)); return k * k === Number(n) ? k : null; }],
  ["radical-product-plain", /√(\d+) *[*] *√(\d+) *= *\?/,
    (a, b) => { const p = Number(a) * Number(b), k = isqrt(p); return k * k === p ? k : null; }],
  ["rational-exponent", /What is *(\d+)\^\((\d+)\/(\d+)\)\?/,
    (base, m, n) => { const r = Math.round(Number(base) ** (1 / Number(n))); if (r ** Number(n) !== Number(base)) return null; return r ** Number(m); }],
  ["pythagorean-hyp", /legs (\d+) and (\d+)\. What is the hypotenuse\?/,
    (a, b) => { const h = Math.hypot(Number(a), Number(b)); return Number.isInteger(h) ? h : null; }],
  ["pythagorean-leg", /hypotenuse (\d+), one leg (\d+)\. What is the other leg\?/,
    (c, a) => { const s = Number(c) ** 2 - Number(a) ** 2; const k = isqrt(s); return k * k === s ? k : null; }],
  ["c-squared", /For legs (\d+) and (\d+), what is c²/,
    (a, b) => Number(a) ** 2 + Number(b) ** 2],
  ["distance-2d", /distance from \((-?\d+), *(-?\d+)\) to \((-?\d+), *(-?\d+)\)/,
    (x1, y1, x2, y2) => { const d = Math.hypot(Number(x2) - Number(x1), Number(y2) - Number(y1)); return Number.isInteger(d) ? d : null; }],
  ["largest-sq-factor", /largest perfect[- ]square factor of *(\d+)/,
    (n) => { let best = 1; for (let k = 1; k * k <= Number(n); k++) if (Number(n) % (k * k) === 0) best = k * k; return best; }],
];

function proveRadicalStep(prompt) {
  const p = norm(prompt).replaceAll("\u00d7", "*").replaceAll("\u00b7", "*");
  for (const [name, rx, fn] of RADICAL_RULES) {
    const m = rx.exec(p);
    if (!m) continue;
    const got = fn(...m.slice(1));
    if (got !== null) return { rule: name, value: got };
  }
  return null;
}


/** a2-logarithms rule set (S162). Only EXACTLY derivable steps are claimed: every rule returns
 * null unless the logarithm resolves to an exact integer power, so the many prompts that supply
 * an authored approximation ("Using log 2 = 0.301...") are reported out-of-scope rather than
 * guessed at. Ordered most-specific-first, as always. */
const SUBS = "\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089";
const SUPS = "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079";
const deSub = (t) => t.replace(/[\u2080-\u2089]/g, (c) => String(SUBS.indexOf(c)))
  .replace(/[\u2070\u00b9\u00b2\u00b3\u2074-\u2079]/g, (c) => String(SUPS.indexOf(c)))
  .replaceAll("\u2212", "-").replaceAll("\u00b7", "*");
const ilog = (b, x) => {
  if (!(b > 1) || !(x > 0)) return null;
  const k = Math.round(Math.log(x) / Math.log(b));
  for (const c of [k - 1, k, k + 1]) if (Math.abs(b ** c - x) < 1e-9) return c;
  return null;
};
const LOG_RULES = [
  ["coef-log-sum", /Evaluate (\d+) log(\d+) (\d+) \+ log\d+ (\d+)/,
    (c, b, a1, a2) => { const t1 = ilog(+b, +a1), t2 = ilog(+b, +a2); return t1 === null || t2 === null ? null : +c * t1 + t2; }],
  ["frac-log-sum10", /Evaluate \((\d+)\/(\d+)\) log (\d+) \+ (\d+) log (\d+) \(base 10\)/,
    (p, q, a, m, bb) => ilog(10, (+a) ** (+p / +q) * (+bb) ** +m)],
  ["log-sum-base10", /Evaluate log ([\d ]+) \+ log (\d+) \+ log (\d+) \(base 10\)/,
    (a, b, c) => ilog(10, +a.trim() * +b * +c)],
  ["cob-compute", /Compute log(\d+) (\d+)/, (b, x) => ilog(+b, +x)],
  ["log-power", /Evaluate log(\d+) \((\d+)(\d)\)/, (b, a, n) => { const t = ilog(+b, +a); return t === null ? null : t * +n; }],
  ["log-eval", /Evaluate log(\d+) \(?([\d/().]+)\)?\./, (b, x) => {
    const t = x.replace(/[()]/g, ""), m = /^(\d+)\/(\d+)$/.exec(t);
    const v = m ? +m[1] / +m[2] : /^\d+(?:\.\d+)?$/.test(t) ? +t : null;
    return v === null ? null : ilog(+b, v); }],
  ["log-solve-x", /Solve for x: log(\d+) x = (-?\d+)/, (b, k) => (+b) ** +k],
  ["log-x-plus", /Solve: log(\d+) x \+ log\d+ (\d+) = (\d+)/, (b, a, k) => (+b) ** +k / +a],
  ["exp-solve", /Solve (\d+) \* (\d+)\^x = (\d+)\./, (c, b, p) => ilog(+b, +p / +c)],
  ["log-eq-both", /Solve log\d+\((\d+)x - (\d+)\) = log\d+\(x \+ (\d+)\)/, (a, b, c) => (+b + +c) / (+a - 1)],
  ["e-ln", /Evaluate e\^\(ln (\d+)\)/, (a) => +a],
  ["ln-e-prod", /Evaluate ln\(e(\d+) \* e(\d+)\)/, (a, b) => +a + +b],
  ["half-life-exact", /Half-life (\d+) days\. After how many days does 1\/(\d+) of the sample remain\?/,
    (h, frac) => { const n = Math.log2(+frac); return Number.isInteger(n) ? +h * n : null; }],
  ["log-sum-quadratic", /Solve log(\d+)\(x \+ (\d+)\) \+ log\d+ x = (\d+)/,
    (b, m, k) => { const rhs = (+b) ** +k, disc = (+m) ** 2 + 4 * rhs; const r = Math.sqrt(disc);
      const x = (-(+m) + r) / 2; return Number.isInteger(Math.round(x * 1e6) / 1e6) ? Math.round(x) : null; }],
  ["ph-ratio", /How many times more acidic is pH (\d+) than pH (\d+)\?/,
    (a, b) => 10 ** (+b - +a)],

];
function proveLogStep(prompt) {
  const p = deSub(prompt);
  for (const [name, rx, fn] of LOG_RULES) {
    const m = rx.exec(p);
    if (!m) continue;
    const got = fn(...m.slice(1));
    if (got !== null && got !== undefined && Number.isFinite(got)) return { rule: name, value: got };
  }
  return null;
}

const lessons = [];
const coursesDir = join(root, "content", "courses");
for (const course of readdirSync(coursesDir).sort()) {
  const dir = join(coursesDir, course, "lessons");
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort())
    lessons.push({ rel: `${course}/lessons/${f}`, doc: JSON.parse(readFileSync(join(dir, f), "utf8")) });
}

let proven = 0, mismatch = 0, outOfScope = 0;
const covered = new Set(), problems = [];
for (const { doc } of lessons) {
  for (const s of doc.steps ?? []) {
    const v = s.variant, w = s.widget;
    if (!v || !w || v.gen !== tag || w.type !== "numeric") continue;
    if (s.kind !== "check" && s.kind !== "challenge") continue;
    if (tag === "a2-logarithms") {
      const proof = proveLogStep(w.prompt);
      if (!proof) { outOfScope++; problems.push(["needs-authored-approximation", doc.id, s.id]); continue; }
      if (Math.abs(proof.value - w.answer) < 1e-9) { proven++; covered.add(doc.id); }
      else { mismatch++; problems.push(["MISMATCH", doc.id, s.id, `${proof.rule} derived ${proof.value} vs frozen ${w.answer}`]); }
      continue;
    }
    if (tag === "a1-radicals") {
      const proof = proveRadicalStep(w.prompt);
      if (!proof) { outOfScope++; problems.push(["no-rule", doc.id, s.id]); continue; }
      if (Math.abs(proof.value - w.answer) < 1e-9) { proven++; covered.add(doc.id); }
      else { mismatch++; problems.push(["MISMATCH", doc.id, s.id, `${proof.rule} derived ${proof.value} vs frozen ${w.answer}`]); }
      continue;
    }
    const p = norm(w.prompt);
    const ask = /What is\s+([xy])\s*\?/i.exec(p);
    if (!ask) { outOfScope++; problems.push(["ambiguous-ask", doc.id, s.id]); continue; }
    const cs = [];
    CAND.lastIndex = 0;
    for (const m of p.matchAll(CAND)) { const c = coeffs(m[1]); if (c) cs.push(c); }
    if (cs.length < 2) { outOfScope++; problems.push(["no-equations", doc.id, s.id]); continue; }
    const [e1, e2] = cs;
    const det = sub(mul(e1.A, e2.B), mul(e2.A, e1.B));
    if (det.n === 0) { outOfScope++; problems.push(["singular", doc.id, s.id]); continue; }
    const X = { n: sub(mul(e1.C, e2.B), mul(e2.C, e1.B)).n * det.d, d: sub(mul(e1.C, e2.B), mul(e2.C, e1.B)).d * det.n };
    const Y = { n: sub(mul(e1.A, e2.C), mul(e2.A, e1.C)).n * det.d, d: sub(mul(e1.A, e2.C), mul(e2.A, e1.C)).d * det.n };
    const got = ask[1].toLowerCase() === "y" ? Y : X;
    if (Math.abs(val(got) - w.answer) < 1e-9) { proven++; covered.add(doc.id); }
    else { mismatch++; problems.push(["MISMATCH", doc.id, s.id, `derived ${val(got)} vs frozen ${w.answer}`]); }
  }
}

console.log(`coverage-prover [${tag}]: PROVEN ${proven} | MISMATCH ${mismatch} | out-of-scope ${outOfScope} | lessons ${[...covered].sort().join(", ")}`);
for (const p of problems.slice(0, 12)) console.log("   ", p.join("  "));
if (mismatch > 0) { console.error("coverage claim REJECTED: a derived answer disagrees with frozen content"); process.exit(1); }
