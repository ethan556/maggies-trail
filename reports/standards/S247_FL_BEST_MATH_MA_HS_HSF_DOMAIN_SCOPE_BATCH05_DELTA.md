# S247 Florida MA.HS.HSF locator assurance — batch 05 delta

Date: 2026-08-18
Portfolio: `FL-BEST-MATH|MA.HS.HSF`
Scope: isolated edges 201–249 of the 249-edge live portfolio
Verdict: **49 canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | Before this isolated batch | Batch candidate | Projected after this batch |
|---|---:|---:|---:|
| MA.HS.HSF locator edges dispositioned in isolated suite | 200 | +49 | 249 of 249 |
| MA.HS.HSF locator edges remaining | 49 | −49 | 0 |
| Authoritative shared decisions | 500 | unchanged | 749 after sequential integration |

The shared ledger remains unchanged by this lane and has zero overlap with this packet. No exact Florida benchmark, strand, course limit, or MTR decision is altered.

## Official Florida authority ruling

- [Florida B.E.S.T. Mathematics](https://www.fldoe.org/academics/standards/subject-areas/math-science/mathematics/) identifies the official adopted standards publication.
- [Official B.E.S.T. mathematics PDF](https://cpalmsmediaprod.blob.core.windows.net/uploads/docs/standards/best/ma/mathbeststandardsfinal.pdf), printed page 3, defines five code positions: subject, grade band, strand, standard, and benchmark. It states that the benchmark is the specific expectation.
- The PDF’s 9–12 Functions strand, printed pages 138–141, is `MA.912.F`; standards are `MA.912.F.1` through `MA.912.F.3`, and exact benchmarks add the final place, for example `MA.912.F.1.1`.
- `MA.HS.HSF` does not occur as an official assessable identifier and is a repository portfolio locator.

This ruling rejects only the coarse locator; all exact Florida alignment remains open.

## Source seals

- Evidence dossiers: `03f66dc1dddbbbba219035cdefd7f23c833f70f72b60447e54a48fb1fafb4857`
- Objectives: `98d6f0eb749e44ca70f36a57d4f46ffb554475009fec941f9245d809fbe741fd`
- Source registry: `075814de6a239cc58c15bdb98036f63f27e979ac11f026268fa537b30f737cdc`
- Official PDF file: `8767ed58e5c5b94992c444391c217f6ce121f03a36007deba0566ed3d7e0b0fc`
- Official web boundary: `fed56eebc519a37002cb713c9d0b484493f75e3c58b6aefbb8d02862062d5782`
- Official PDF boundary: `92a47992946cfa0d69c4ae097140326c0864b8fe22d23d9ecbd4bfeed725b7ea`
- Packet: `c4dfefe9423f6e761b1671e7b3ccb4b2eb4026c890cda995df0a28704e30cbad`

Every candidate also signs its current dossier hash and all referenced lesson source hashes.

## Packet partition

| Course | Edges | Replacement routing only |
|---|---:|---|
| `derivative-rules` | 4 | `MA.912.C` |
| `derivatives-in-context` | 11 | `MA.912.C` |
| `integration-accumulation` | 16 | `MA.912.C` |
| `integration-applications` | 6 | `MA.912.C` |
| `parametric-polar-calculus` | 5 | `MA.912.C` |
| `series-convergence` | 7 | `MA.912.C` |
| **Total** | **49** | |

Routing fields are review hints only, not signed mappings, approvals, coverage claims, or mastery claims.

## Validation

- Strict full packet: **49/49 PASS**.
- Shared-ledger overlap: **0**.
- Signatures, live coarse-locator state, dossier hashes, lesson seals, and authority seals: **49/49 PASS**.
- Exact or descendant decisions changed: **0**.
- Deterministic unseen sample: **8/8 PASS**.
- Sample: `49a0c0149adf6e284d637b2f`, `3d29d160de59a1f638aca501`, `f0e3280928bd5308ee14b46c`, `192cb214016a3d63ad636545`, `a79e17f676c4bdb627967234`, `6e084289d6333d307c5cde7b`, `794fa059fdc6f7f94bd74f6e`, `aad8b8c0526dfefd9e1fdd2d`.
- Projected portfolio remainder: **0**.

Run: `node reports/closure/candidates/validate-s247-fl-best-math-ma-hs-hsf-domain-scope-batch05.mjs`.

## Integration boundary

Validate all five isolated packets against the same seals, append them in packet order, then rebuild standards dossiers and dependent queues once. Any relevant source, dossier, or lesson change invalidates the affected candidate.
