# S247 California CA-HSF domain-scope assurance — batch 02 delta

Date: 2026-08-18
Portfolio: `CA-CCSSM|CA-HSF`
Scope: isolated edges 51–100 of the 249-edge live portfolio
Verdict: **50 canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | Before this isolated batch | Batch candidate | Projected after this batch |
|---|---:|---:|---:|
| CA-HSF coarse locator edges dispositioned in isolated suite | 50 | +50 | 100 of 249 |
| CA-HSF coarse locator edges remaining | 199 | −50 | 149 |
| Authoritative shared decisions | 251 | unchanged | 351 after sequential integration |

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
- Packet: `3c6df9e9da1ac6e44796ceb11f12ec2ae10b2d9a892d7057bd5874c00f0f2f68`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Packet partition

| Course | Edges | Replacement routing only |
|---|---:|---|
| `logarithms` | 15 | `F-LE`, `F-IF`, `F-BF` |
| `sequences-series` | 13 | `F-BF`, `F-LE` |
| `trig-functions` | 13 | `F-TF`, `F-IF` |
| `conic-sections` | 9 | `F-IF` |
| **Total** | **50** | |

Routing fields are review hints only, not signed descendant mappings, approvals, coverage claims, or mastery claims.

## Validation

- Strict full packet: **50/50 PASS**.
- Shared-ledger overlap: **0**.
- Official coarse-locator state, signatures, dossier hashes, lesson seals, and authority seals: **50/50 PASS**.
- Exact or descendant decisions changed: **0**.
- Deterministic unseen sample: **8/8 PASS**.
- Sample: `f7f8a2e09c4831d1b54bb77e`, `4a19a2461b8857a7f9c473cb`, `266ecd04fab245e27bb20dee`, `c5b88cc8f6da51dbe2ecb93a`, `9c8448f58172028f95c3cf92`, `4f864589501e485f9b7150ce`, `2bfb808bbae9305fec899649`, `c3d2c38ae86480f49fa76c4c`.
- Projected portfolio remainder after this packet: **149**.

Run: `node reports/closure/candidates/validate-s247-ca-ccssm-ca-hsf-domain-scope-batch02.mjs`.

## Integration boundary

Do not regenerate this packet after append. Validate all five isolated packets against the same source seals, append them in packet order, then rebuild standards dossiers and the queue/card/cache chain serially. Any source, dossier, or lesson hash change invalidates the affected candidate.
