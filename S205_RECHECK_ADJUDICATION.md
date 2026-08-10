# S205 — re-check adjudication of the two widest undocumented-enum clusters

Continues the sweep begun in `content/patches/s205-recheck-sweep.json` (six candidates, one
converted). This pass takes the two clusters that sweep did not touch — the widest two in the
65-lesson queue — and adjudicates every lesson in them individually, under the **three-gate fit
test** that the first sweep's refusals established.

**Result: 32 lessons examined, 0 conversions.** 19 refused on the engine; 13 cannot be converted at
all without deleting authored content. Both outcomes are recorded below with the source lines that
decide them, so neither has to be re-derived.

---

## 1. The three-gate test

An engine fits a lesson only if it clears all three. The first sweep's refusals failed gates 2 and
3 while passing gate 1 — which is why a schema-only reading kept producing false positives.

| gate | question | where the answer lives |
|---|---|---|
| **models** | Is this the same mathematics? | schema spec + doc comment |
| **reaches** | Can the control attain the required state? | the renderer — slider `min`/`max`/`step`, drag bounds, and the schema's numeric caps |
| **represents** | Does the readout display the quantity the lesson asks about? | the renderer's readout and `aria-label` strings |

---

## 2. The structural finding: 24 of the 97 remaining C/D lessons cannot be converted at all

`steppedReveal` is not a control. Its spec (`schema.ts:327-344`) is `panels: [{ title, body }]` with
`min(2).max(6)` — **two to six panels of authored instructional prose.** Replacing a `steppedReveal`
step with a lab does not swap a widget; it **deletes authored teaching**, which the content freeze
forbids.

`ca-03-01` i1 is typical — three panels, each a worked counterexample:

> *"Drop differentiability — Take f(x) = |x| − 1 on [−1, 1]. The ends match (both 0), it is
> continuous — and f′ is NEVER zero. The corner ate the flat spot."*

Measured across the corpus [`node scripts/measure/step-mix.mjs` sibling scan, this session]:

| | lessons |
|---|--:|
| C/D lessons with **zero** convertible interactive steps | **24** |
| — all 24 blocked by `steppedReveal` occupying the only interactive step | 24 |
| C/D lessons with ≥1 convertible interactive step | 73 |
| total convertible interactive steps across those 73 | 133 |

The 24, by course — note that this is **almost the entire calculus block**:

```
curve-analysis            ca-01-03 ca-02-02 ca-03-01 ca-03-03 ca-05-01
derivative-rules          dr-03-02 dr-03-03 dr-04-02 dr-04-03
derivatives-in-context    dc-01-03 dc-02-01 dc-03-02 dc-04-02
integration-accumulation  in-01-03 in-04-02 in-05-01 in-05-02 in-05-03
parametric-polar-calculus pc-01-01 pc-01-02
series-convergence        sc-01-02 sc-01-03
statistical-inference     si-05-01 si-05-03
```

These lessons score `conseq 3 · contrast 3 · invariant 3 · misconception 2–3` and total 24–25. They
are **not badly taught** — they are richly authored expositions that the tier rule marks C because
it counts manipulation. The applier converts `interactive` steps only, and their one interactive
step is prose.

**This is a product decision, not a conversion task.** Three options, and the next session should
pick one explicitly rather than discover the wall again:

1. **Extend the applier to INSERT a step** rather than replace one — the lesson gains a lab and
   keeps its panels. Costs a new applier capability and a step-order/ID policy.
2. **Accept these 24 as a permanent Tier C floor** and say so in the reporting, so the "< 50 Tier
   C/D" target is understood as "< 50 of the 73 convertible".
3. **Revisit the tier rule** so a `steppedReveal` with ≥3 panels and misconception ≥2 is not scored
   as manip 0. This is the riskiest — it changes the ruler rather than the corpus.

Until one is chosen, the honest floor on the "< 50 Tier C/D" target is **24**, not 0.

---

## 3. Cluster A — `derivativeTrace` (18 lessons): refused

**The engine.** `fn: "square" | "cubic" | "abs"` is a closed set of three hard-coded functions
(`evaluate.ts:158-165`): f = x², x³, |x| with f′ = 2x, 3x², ±1. Domain `XMIN = -4, XMAX = 4`
(`widgets.tsx:4072`). Grades `f′(x)` in slope mode or `x` in point mode — **there is no f(x) readout
and no way to supply a different function.**

13 of the 18 are `steppedReveal`-blocked (§2). The 5 adjudicable ones:

| lesson | step asks | gate failed |
|---|---|---|
| `fna-03-02` Piecewise Functions | evaluate p(−3) on a piecewise rule | **models** — no piecewise function in the enum; no f(x) readout |
| `fna-03-03` Absolute Value & Step Functions | "−x when x = −7" | **reaches** — x = −7 is outside [−4, 4]; and **represents** — the engine grades f′, never \|x\| itself |
| `fna-04-02` Domain of a Composition | smallest x accepted by √(x−2) | **models** — a domain endpoint of a radical; no derivative involved |
| `fna-04-03` Decomposing Composition | inner function of (3x+1)⁴ | **models** — symbolic decomposition, no graph state |
| `fna-05-02` Restricting the Domain | f⁻¹(16) for f = x², x ≥ 0 | **represents** — the engine has no inverse and no f-value readout, though `fn: "square"` matches |

`fna-03-03` is the near-miss worth recording: the engine's `abs` mode exists precisely to show that
f′ is undefined at the corner, which is this lesson's *concept*. It fails on the step's *question*,
which is arithmetic at x = −7. An engine can model a lesson's idea and still be unable to host its
authored step.

---

## 4. Cluster B — `graphZoom` (14 lessons): refused

**The engine.** A limit-existence instrument at a **finite point a**: `behaviour` ∈ {continuous,
removable, jump, infinite}, and it grades a magnification level (0–6, `widgets.tsx` zoom buttons)
plus a two-way verdict `limit-exists | no-limit`. There is no x → ∞ view and no numeric answer
field.

| lesson | step asks | gate failed |
|---|---|---|
| `pra-01-01` Rational Root Theorem | \|constant term\| of x³+2x²−5x−6 | **models** — divisor arithmetic |
| `pra-01-03` The Full Pipeline | synthetic-division quotient coefficient b | **models** |
| `pra-02-01` Fundamental Theorem | zero count of a degree-5 polynomial | **models** |
| `pra-02-02` Conjugate Zero Theorem | which zero must accompany 3+2i | **models** |
| `pra-02-03` Building from Mixed Zeros | S for zeros 1±i | **models** |
| `pra-03-02` Slant by Division | constant completing quotient x+c | **models** — and the slant asymptote is a limit at **infinity**, which the engine cannot express |
| `rf-02-03` Restriction Tracking | count of excluded x; evaluate a chain at x=2 | **represents** — excluded values are holes/poles, but the engine has no count readout |
| `rf-03-02` Polynomial LCD | LCD of two rational expressions ×2 | **models** |
| `rf-03-03` Unlike Denominators | numerator over the LCD; arithmetic check | **models** |
| `rf-04-03` Horizontal Asymptotes | asymptote of (3x+1)/(x²+5) | **models** — again a limit at infinity, not at a finite a |
| `rf-05-03` Inverse & Joint Variation | t = 120/s arithmetic; table classification | **models** |
| `lc-02-03` Rationalizing to Resolve Limits | *which expression* you multiply by | **represents** — see below |
| `lc-04-03` Intermediate Value Theorem | why IVT guarantees a root in (1,2) | **models** — an interval claim, not a limit at a point |
| `lc-05-03` Limits Everywhere | partial sum ½+¼+⅛+1/16 | **models** — `sequenceBuild` is the better candidate here |

`lc-02-03` is this cluster's near-miss and the mirror of `fna-03-03`: (√(x+4)−2)/x **is** a textbook
removable discontinuity at a = 0 with limit ¼, which is exactly `graphZoom`'s `removable`
behaviour. It fails because the authored step asks *which conjugate you multiply by* — a symbolic
technique — and the engine grades zoom depth plus a verdict. **The engine models the lesson; it
cannot host the step.**

---

## 5. What this says about the queue

The 65-lesson "undocumented enum" queue was built on a proxy — *an engine with undocumented enums
appears in this course* — not on the engine each original refusal actually named. On the two widest
clusters that proxy returned **0 for 19** adjudicable lessons. Combined with the first sweep's 1
conversion from 6 hand-picked candidates, the observed rate across 25 adjudicated lessons is
**1 in 25**, not the 2-for-2 that motivated the exercise.

Recommended revision, in order:

1. **The S203M-U refusal ledger is NOT in the repository** — verified this session: `grep -c refused`
   over every markdown doc finds no per-lesson refusal entries from those sessions (the only
   `REFUSED` hits in `CONVERSION_LOG.md` are Playwright `ERR_CONNECTION_REFUSED` lines). The
   "recover the ledger" plan is therefore not executable from disk. What remains executable is what
   this session did: re-derive candidates from tier data and adjudicate each against the three-gate
   test, reading the renderer. Budget accordingly — the ledger shortcut does not exist.
2. **Resolve the 24 `steppedReveal`-blocked lessons as a policy question** (§2) before counting them
   against any conversion target.
3. **Build engines against the 73 lessons that have a convertible step**, not against the raw 97.
