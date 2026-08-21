# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `ad69342cba1404fe1ee71878a483bb260e993895a16e1daede5aa72242a43bbc`
- Local cache: `.chatgpt-work-cache/maggies-v4/ad69342cba1404fe1ee71878a483bb260e993895a16e1daede5aa72242a43bbc/`
- Base commit metadata: `7778cf7ad945221e3e23d93328bab2951cfc4712`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,663 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,140,889 | `683b54a20e892fbbf382a3a121f7b33ae63e14f6f3ad234a21bed69ad09d7b68` |
| standards | 12 | 55,993,745 | `b595f211b348c8576b9884c6dd27a62537e5271abce1bfeee34e3344fc5a3f10` |
| mastery | 6 | 8,015,251 | `73641fc0d9e3bf7b7a36fe546edd9a771c03ab049b8b2f686716c4e6dabe030d` |
| rubric-contract | 20 | 227,957 | `50dc14fd7ea39377efa7d127384e6d9f0c58ad21037624da8469ade218ca4c04` |
| contract-code | 15 | 825,426 | `8b1290c77aeb662c15e9ff5cab9e0529789f21e24d3136d8f8b78c8fada045f5` |
| generators | 22 | 4,495,686 | `621f698ba2372c3ff9da1bff4abc1229315de785f2d34b115634bd33091b2049` |
| widgets | 8 | 2,077,806 | `2498ae2e5ad5e7aae3a908ced7646a4d34f9cbb93f93f246e8f93db075fc3997` |
| evaluators | 17 | 1,322,210 | `8dd9db08ed5c037523670d6c0ef54860ebe289985bd6e8cda2232d0d5d212157` |
| visuals-assets | 229 | 15,358,423 | `d1f3e571d96daff9ae9f3a39c2a7f8c5ed07e7680d7fb9180ca49b4fb3b435ce` |
| standards-toolchain | 31 | 244,274 | `3d0770632699e9801f36f5a202cd5e031630bc4df65b26f90cd80b4aa90484ed` |
| review-detectors | 8 | 108,646 | `18b83d8c8c87e22c00a64af4fd592fd7af126e7a3f7319514cfcf3191d1c8936` |
| evidence-artifacts | 76 | 15,542,090 | `70c7b7d8b7983712497bf31bbe5f6387c4a06c5b740419b10035dd2dd52d4f10` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
