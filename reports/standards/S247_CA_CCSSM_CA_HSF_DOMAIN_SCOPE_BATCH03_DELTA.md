# S247 California CA-HSF domain-scope assurance — batch 03 delta

Date: 2026-08-18
Portfolio: `CA-CCSSM|CA-HSF`
Scope: isolated edges 101–150 of the 249-edge live portfolio
Verdict: **50 canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | Before this isolated batch | Batch candidate | Projected after this batch |
|---|---:|---:|---:|
| CA-HSF coarse locator edges dispositioned in isolated suite | 100 | +50 | 150 of 249 |
| CA-HSF coarse locator edges remaining | 149 | −50 | 99 |
| Authoritative shared decisions | 251 | unchanged | 401 after sequential integration |

The shared standards ledger remains unchanged by this lane and has zero overlap with this packet. No exact, descendant, California-added, or model-course standard decision is added, removed, or altered.

## Official California authority ruling

- [California Common Core resources](https://www.cde.ca.gov/re/cc/) identifies the controlling mathematics publication and its February 2014 corrections.
- [Official California mathematics standards PDF](https://www.cde.ca.gov/be/st/ss/documents/ccssmathstandardaug2013.pdf), printed page 58, states that higher mathematics has six **conceptual categories**, including **Functions**.
- The same PDF’s Functions overview and standards, printed pages 127–131, place assessable expectations under `F-IF`, `F-BF`, `F-LE`, and `F-TF`, including identifiers explicitly marked as California additions.
- `CA-HSF` does not appear as an assessable identifier in this hierarchy; it is a repository portfolio locator.

This ruling rejects only the coarse locator. It does not adjudicate any exact California alignment.

## Source seals

- Evidence dossiers: `03f66dc1dddbbbba219035cdefd7f23c833f70f72b60447e54a48fb1fafb4857`
- Objectives: `98d6f0eb749e44ca70f36a57d4f46ffb554475009fec941f9245d809fbe741fd`
- Source registry: `075814de6a239cc58c15bdb98036f63f27e979ac11f026268fa537b30f737cdc`
- Official PDF file: `e33d1c55f2ba4071e56980e4afed3e41194d57e1f298b7b5877b0fe4bc08ea5b`
- Official web boundary: `350beadb281099df0801c8df970844e4285d6491caf11921a816a7f481702c3e`
- Official PDF boundary: `c8766d6088aa6041a93f9331a1de89937e149e3f2a15f0d22c668d099dd96560`
- Packet: `5df217560a70b88dd4761ed39a7845f89e4cf3407018fdf8b7dc36d3cdc357ea`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Packet partition

| Course | Edges | Replacement routing only |
|---|---:|---|
| `conic-sections` | 7 | `F-IF` |
| `function-analysis` | 15 | `F-IF` |
| `limits-continuity` | 15 | `F-IF` |
| `polar-parametric` | 13 | `F-IF`, `F-TF` |
| **Total** | **50** | |

Routing fields are review hints only, not signed descendant mappings, approvals, coverage claims, or mastery claims.

## Validation

- Strict full packet: **50/50 PASS**.
- Shared-ledger overlap: **0**.
- Official coarse-locator state, signatures, dossier hashes, lesson seals, and authority seals: **50/50 PASS**.
- Exact or descendant decisions changed: **0**.
- Deterministic unseen sample: **8/8 PASS**.
- Sample: `6fda4f91beb443b1eb8955e6`, `8470fa132890f3e0d6960915`, `c91b74bc6ff34e14ffe18519`, `991a9c7312fbc6c035759c7d`, `e5e8a96c3d21d0b566b616ec`, `a38b20166492934bc2c5efc7`, `89e14776266572d791dc864a`, `f2d31766b9f9fc757353e2a2`.
- Projected portfolio remainder after this packet: **99**.

Run: `node reports/closure/candidates/validate-s247-ca-ccssm-ca-hsf-domain-scope-batch03.mjs`.

## Integration boundary

Do not regenerate this packet after append. Validate all five isolated packets against the same source seals, append them in packet order, then rebuild standards dossiers and the queue/card/cache chain serially. Any source, dossier, or lesson hash change invalidates the affected candidate.
