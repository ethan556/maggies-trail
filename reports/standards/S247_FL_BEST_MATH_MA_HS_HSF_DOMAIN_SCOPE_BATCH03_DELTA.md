# S247 Florida MA.HS.HSF locator assurance — batch 03 delta

Date: 2026-08-18
Portfolio: `FL-BEST-MATH|MA.HS.HSF`
Scope: isolated edges 101–150 of the 249-edge live portfolio
Verdict: **50 canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | Before this isolated batch | Batch candidate | Projected after this batch |
|---|---:|---:|---:|
| MA.HS.HSF locator edges dispositioned in isolated suite | 100 | +50 | 150 of 249 |
| MA.HS.HSF locator edges remaining | 149 | −50 | 99 |
| Authoritative shared decisions | 500 | unchanged | 650 after sequential integration |

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
- Packet: `db38992689954f21f1db32c0748edf6881c3dc75e196fa7e3e0ca125e6d90d4a`

Every candidate also signs its current dossier hash and all referenced lesson source hashes.

## Packet partition

| Course | Edges | Replacement routing only |
|---|---:|---|
| `conic-sections` | 7 | `MA.912.AR` |
| `function-analysis` | 15 | `MA.912.F` |
| `limits-continuity` | 15 | `MA.912.C` |
| `polar-parametric` | 13 | `MA.912.C`, `MA.912.T` |
| **Total** | **50** | |

Routing fields are review hints only, not signed mappings, approvals, coverage claims, or mastery claims.

## Validation

- Strict full packet: **50/50 PASS**.
- Shared-ledger overlap: **0**.
- Signatures, live coarse-locator state, dossier hashes, lesson seals, and authority seals: **50/50 PASS**.
- Exact or descendant decisions changed: **0**.
- Deterministic unseen sample: **8/8 PASS**.
- Sample: `5097e42bae7f0b6035e32c66`, `7e6822d26dddbe3f51a6427d`, `7ff01b9e9c40eb7edcc32c6a`, `9ffbc945d7cd943e469bb6bd`, `257555850e028fbc80661297`, `af357b2545584f20c7b0a219`, `eec2f87277749c8d26cedec6`, `7fced8dc9fb9ff219f85b3a4`.
- Projected portfolio remainder: **99**.

Run: `node reports/closure/candidates/validate-s247-fl-best-math-ma-hs-hsf-domain-scope-batch03.mjs`.

## Integration boundary

Validate all five isolated packets against the same seals, append them in packet order, then rebuild standards dossiers and dependent queues once. Any relevant source, dossier, or lesson change invalidates the affected candidate.
