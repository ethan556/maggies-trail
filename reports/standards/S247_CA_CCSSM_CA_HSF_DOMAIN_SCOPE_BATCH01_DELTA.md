# S247 California CA-HSF domain-scope assurance — batch 01 delta

Date: 2026-08-18
Portfolio: `CA-CCSSM|CA-HSF`
Scope: isolated edges 1–50 of the 249-edge live portfolio
Verdict: **50 canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | Before this isolated batch | Batch candidate | Projected after this batch |
|---|---:|---:|---:|
| CA-HSF coarse locator edges dispositioned in isolated suite | 0 | +50 | 50 of 249 |
| CA-HSF coarse locator edges remaining | 249 | −50 | 199 |
| Authoritative shared decisions | 251 | unchanged | 301 after sequential integration |

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
- Packet: `f4c6a299d2fdb3a77f7bbb7373feddaa5a4099ff98828c21492755f43943bd8b`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Packet partition

| Course | Edges | Replacement routing only |
|---|---:|---|
| `functions-and-sequences` | 12 | `F-IF`, `F-BF`, `F-LE` |
| `linear-functions` | 12 | `F-IF`, `F-BF`, `F-LE` |
| `quadratics` | 11 | `F-IF`, `F-BF`, `F-LE` |
| `function-transformations` | 15 | `F-BF`, `F-IF` |
| **Total** | **50** | |

Routing fields are review hints only, not signed descendant mappings, approvals, coverage claims, or mastery claims.

## Validation

- Strict full packet: **50/50 PASS**.
- Shared-ledger overlap: **0**.
- Official coarse-locator state, signatures, dossier hashes, lesson seals, and authority seals: **50/50 PASS**.
- Exact or descendant decisions changed: **0**.
- Deterministic unseen sample: **8/8 PASS**.
- Sample: `c68b1d3eb01b301afcdf50ef`, `71f60a4922c29bf4a0c6792a`, `7e09e261f9e87fa50505974c`, `72ae8b10c0f2d0b9a4298ea8`, `b6240f02d14fd197e8a17d05`, `423719a3408af4cbc471c551`, `4ca88de8e29c4a0665bb4630`, `0e237bdebc5dc320434ba3a2`.
- Projected portfolio remainder after this packet: **199**.

Run: `node reports/closure/candidates/validate-s247-ca-ccssm-ca-hsf-domain-scope-batch01.mjs`.

## Integration boundary

Do not regenerate this packet after append. Validate all five isolated packets against the same source seals, append them in packet order, then rebuild standards dossiers and the queue/card/cache chain serially. Any source, dossier, or lesson hash change invalidates the affected candidate.
