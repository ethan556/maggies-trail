# S247 California CA-HSF domain-scope assurance — batch 04 delta

Date: 2026-08-18
Portfolio: `CA-CCSSM|CA-HSF`
Scope: isolated edges 151–200 of the 249-edge live portfolio
Verdict: **50 canonical, signed `rejected` candidates; not appended**

## Delta

| Measure | Before this isolated batch | Batch candidate | Projected after this batch |
|---|---:|---:|---:|
| CA-HSF coarse locator edges dispositioned in isolated suite | 150 | +50 | 200 of 249 |
| CA-HSF coarse locator edges remaining | 99 | −50 | 49 |
| Authoritative shared decisions | 251 | unchanged | 451 after sequential integration |

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
- Packet: `891326d0e2a82086bd06f4c63cc357614a815a073229dd96fcb77ff6891cbb53`

Every candidate additionally signs its current dossier hash and every referenced lesson source hash.

## Packet partition

| Course | Edges | Replacement routing only |
|---|---:|---|
| `polar-parametric` | 2 | `F-IF`, `F-TF` |
| `trig-graphs-inverses` | 15 | `F-TF`, `F-IF` |
| `curve-analysis` | 16 | `F-IF` |
| `derivative-rules` | 17 | `F-IF` |
| **Total** | **50** | |

Routing fields are review hints only, not signed descendant mappings, approvals, coverage claims, or mastery claims.

## Validation

- Strict full packet: **50/50 PASS**.
- Shared-ledger overlap: **0**.
- Official coarse-locator state, signatures, dossier hashes, lesson seals, and authority seals: **50/50 PASS**.
- Exact or descendant decisions changed: **0**.
- Deterministic unseen sample: **8/8 PASS**.
- Sample: `7fb297f572e8976aec1d7339`, `5ed6ff96aa0f87492d34289a`, `f2fcf542b5d5a885c744da01`, `d72d060d5a2a4cc3344357c9`, `4b57b3c1260f188d0f417f4a`, `618721c3fc92baf8f79a4670`, `94d3ac04d566758ab35c4a7a`, `b80b6aa6c45305aace5120ed`.
- Projected portfolio remainder after this packet: **49**.

Run: `node reports/closure/candidates/validate-s247-ca-ccssm-ca-hsf-domain-scope-batch04.mjs`.

## Integration boundary

Do not regenerate this packet after append. Validate all five isolated packets against the same source seals, append them in packet order, then rebuild standards dossiers and the queue/card/cache chain serially. Any source, dossier, or lesson hash change invalidates the affected candidate.
