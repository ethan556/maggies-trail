# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `2ccc346adeac2cb979d213d014bc10015ab6831eae25aa8d887d03ce92dce69b`
- Local cache: `.chatgpt-work-cache/maggies-v4/2ccc346adeac2cb979d213d014bc10015ab6831eae25aa8d887d03ce92dce69b/`
- Base commit metadata: `f1216b23ebe198c81125231b672f84037941ed39`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,653 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,352,953 | `44698ee1c8b1451bc293b622de218c9f009325fa40463a3ae3132178327d9188` |
| standards | 12 | 55,996,742 | `6c9f39bfaade9b228e29f735d06e8dae00db892900f8afd296d5219d3b390e59` |
| mastery | 6 | 8,251,662 | `40e05e95e415ebf357c3052548ce989d2afcea5b56b169eb2bb9c0a82eaabae6` |
| rubric-contract | 20 | 231,688 | `dd26e1e9eee01601b70f2c48574a9929a7614dad87dc3b9eecf0c4e822552e92` |
| contract-code | 15 | 831,422 | `25e3085a923275c66cf8cbc821c4f88f869236e67ae94b6267c3405a8c2e8349` |
| generators | 22 | 4,581,561 | `3b7002f2d9bf7dbd45f85afb4a7b88efccb9214315b72361ca451be3c0e22fbf` |
| widgets | 8 | 2,083,717 | `f25be5474f0a62869882cb157415882bca62c705ee1bf593cab9006335295c42` |
| evaluators | 17 | 1,333,914 | `00ff6bf6baddbcf21ff72bcb919b8ddd74493ad2cc707b8977e4b82290d7843e` |
| visuals-assets | 229 | 15,264,334 | `13ea3e11e9eff3431714e6c6051d9a770bac8d2b52e5664579ebc45946738a30` |
| standards-toolchain | 31 | 246,024 | `cafcb11ed7ad93c0397883fa34988a4afb1a618d505e11d7845897946d2292f7` |
| review-detectors | 8 | 109,944 | `93735707ae099cb361796215b7f3ffee88f1bc60c188e0a39420e0fd034fa22e` |
| evidence-artifacts | 76 | 13,661,292 | `837ef06124fb7107440157a3c648e5a81dd7c7aa040315ab1793ef3560a46e47` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
