# S246 constructions-and-proof generator assurance

Date: 2026-08-17  
Generator: `g10-constructions-proof`  
Verdict: **PASS for all ten numeric forms; the global resolver now stops in the separate Grade 10 coordinate-proofs family.**

## Scope and outcome

The resolver first exposed `cp-02-01/k2`, whose generated perpendicular-at-a-point question was
identical for every seed. Its fallback and misconception feedback had also drifted into an
unrelated Thales/semicircle explanation. Continuing within the coherent generator family exposed
the remaining stale numeric forms. All ten numeric forms are now generated from bounded,
mathematically meaningful state tables:

- perpendicular at a point: right-angle equations and right-angle partitions;
- perpendicular from a point: horizontal and vertical coordinate feet;
- parallel through a point: varied supplementary co-interior pairs;
- regular hexagon: central and interior angle equations;
- inscribed square/triangle: central-angle equations for both constructions;
- conjecture and proof: displayed counterexample counts derived from actual lists;
- converses: co-interior algebra that proves parallelism;
- proving transversal relationships: equal alternate-interior expressions;
- transversal family: corresponding and co-interior jobs;
- vertical angles: equality equations and linear-pair-to-vertical transfer.

These are not cosmetic substitutions. The printed givens, operation path, mathematical answer, and
misconception traps change across seeds. The same seed remains deterministic.

## Independent assurance

`geometryIndependent.cjs` reconstructs every answer from the learner-visible prompt. It does not
read the generator's case tables or trust the keyed answer. The focused test covers deterministic
replay, schema validity, prompt-derived answers, trap uniqueness, answer/trap separation, both
question jobs where applicable, and unseen resolver seeds.

Fourteen live lesson consumers use the repaired numeric forms. No authored lesson declaration,
lesson prose, standard, or evaluator was changed.

## Gates

- Focused construction-family contract: **PASS**.
- Real resolver: all constructions/proof failures cleared; next failure is `cx-01-03/k2` under
  `g10-coordinate-proofs`.
- Full generator regression plus all S246 properties: **4,012/4,012 PASS**.
- TypeScript: **PASS**.
- Schema: **1,840/1,840 PASS**.
- Pedagogy: **1,711/1,711 PASS**.
- Strict CML: **0 errors / 0 warnings**.
- Targeted lint: **0 errors**; only the file's existing authored-bank `any` warnings remain.
- Expanded maths audit: **414,487 strings**, with the symbolic residue unchanged at **1,077**.
- Consolidated queue: **14,821**, source seal matched.
- ChatGPT Work precache: refreshed and verified at
  `98c52589acf693eee239162953f3267a39ef1bf393ed31537e52cffab7f80713`.

The normal Windows `tsx` launcher still fails before project code at `uv_os_get_passwd ENOMEM`.
Schema and pedagogy were therefore executed through the established in-process TypeScript loader;
both project gates passed.
