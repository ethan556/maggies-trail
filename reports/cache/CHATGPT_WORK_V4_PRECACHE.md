# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `3b7107e67433b430692eda725b6493eef9e2b726494a9f368ba4d3ff20075d00`
- Local cache: `.chatgpt-work-cache/maggies-v4/3b7107e67433b430692eda725b6493eef9e2b726494a9f368ba4d3ff20075d00/`
- Base commit metadata: `a78d6a3e610ccf1b7a54721e907fca1be9d8c2d9`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,654 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,071,314 | `186d46a6d70ca0deed627287437c716095dba23e0820e303f6ddb76f66e20541` |
| standards | 12 | 55,993,745 | `b595f211b348c8576b9884c6dd27a62537e5271abce1bfeee34e3344fc5a3f10` |
| mastery | 6 | 8,015,251 | `73641fc0d9e3bf7b7a36fe546edd9a771c03ab049b8b2f686716c4e6dabe030d` |
| rubric-contract | 20 | 228,937 | `0d34e706004977403e7b2435d98372281a0f6edcb3ad35abc2226c88300dcad7` |
| contract-code | 15 | 825,426 | `8b1290c77aeb662c15e9ff5cab9e0529789f21e24d3136d8f8b78c8fada045f5` |
| generators | 22 | 4,484,969 | `525834884a9b71d1a62eed86b128fcbe04546d4f3c7f2e976175a5ed8b5ea56b` |
| widgets | 8 | 2,075,907 | `5ab93da27610162227662c33183195ebe8478b6ac92cf8fc1431aaed5a0cf16d` |
| evaluators | 17 | 1,322,210 | `8dd9db08ed5c037523670d6c0ef54860ebe289985bd6e8cda2232d0d5d212157` |
| visuals-assets | 229 | 15,351,920 | `85eaca19371bc15e57a2776ad4fba0ea37a962d1c1a070623c01b38238c8b229` |
| standards-toolchain | 31 | 244,274 | `3d0770632699e9801f36f5a202cd5e031630bc4df65b26f90cd80b4aa90484ed` |
| review-detectors | 8 | 108,646 | `18b83d8c8c87e22c00a64af4fd592fd7af126e7a3f7319514cfcf3191d1c8936` |
| evidence-artifacts | 76 | 14,506,034 | `02fee45268c80089055a5d8d52fe9e985a2d5ebe7d40a9a8a151ca35e1f5ba67` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
