# S246 conditional-probability generator assurance

Date: 2026-08-17  
Generator: `g10-conditional-probability`  
Verdict: **PASS for the repaired numeric family; the global resolver now stops at a separate Grade 12 conic form.**

## Scope

The packet repaired the eight numeric forms used by the Grade 10 conditional-probability course:

- overlap/union counts;
- joint probability;
- marginal probability;
- complement of a union;
- conditional probability;
- reverse-conditional diagnosis;
- table union;
- independent versus mutually exclusive reasoning.

The overlap form now contains ten coherent contexts split between finding a union and finding an
intersection. The other seven forms use bounded mathematical state banks with eight distinct table
or event states each. Variation changes counts, probabilities, contexts and—where the concept
requires it—the unknown position or operation. It is not produced by relabelling a fixed answer.

Every generated numeric item includes the quantities needed to solve it, states the three-decimal
convention where rounding is required, and carries misconception-specific feedback. Generic filler
options or reasoning demands unsupported by the numeric response surface were not introduced.

## Independent assurance

`statProbabilityIndependent.cjs` now recomputes these answers from the printed quantities rather
than trusting the generator state or a stored answer lookup. The S246 regression covers:

- same-seed determinism;
- all three difficulty bands;
- exact widget-schema validity;
- prompt-derived answer agreement;
- distinct traps that cannot equal the answer;
- both authored overlap consumers;
- 96 seeds per repaired form plus 64 real-resolver seeds.

## Gates

- Conditional-probability focused suite and resolver frontier: conditional family PASS; global
  resolver next fails at `co-01-01/k1`, `g12-conic-sections`, not this family.
- Full generator regression: **4,001/4,001 PASS**.
- TypeScript: **PASS**.
- Content schema: **1,840/1,840 PASS** through the Windows-safe in-process TypeScript route.
- Pedagogy: **1,711/1,711 PASS** through the same route.
- Targeted ESLint: **0 errors**; one pre-existing `any` warning remains on the authored-template
  bank boundary.

No lesson declaration, authored lesson prose, commit, push or deployment was changed by this packet.
