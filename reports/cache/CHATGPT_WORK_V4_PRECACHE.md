# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `01fcc620cd02078cbb9715aa4cf0983c3abe252658fe452f3f6fb13718230c88`
- Local cache: `.chatgpt-work-cache/maggies-v4/01fcc620cd02078cbb9715aa4cf0983c3abe252658fe452f3f6fb13718230c88/`
- Base commit metadata: `06a9bb1f9e827ab4b77b886dcf4071ddf0d9b37c`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,654 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,022,490 | `b700e56613b1caf8d52962a634d924d5bfd11881e37ce288b1abf7522b265e52` |
| standards | 12 | 55,993,745 | `b595f211b348c8576b9884c6dd27a62537e5271abce1bfeee34e3344fc5a3f10` |
| mastery | 6 | 8,015,251 | `73641fc0d9e3bf7b7a36fe546edd9a771c03ab049b8b2f686716c4e6dabe030d` |
| rubric-contract | 20 | 229,155 | `88231c6dca7df685d113beeebc251fa132fde7419add7e82495d630f78463f9f` |
| contract-code | 15 | 817,290 | `699e937fdf3513486ebdbabf361cd2c5203d7acff8761b409956b9e9172a68af` |
| generators | 22 | 4,484,969 | `525834884a9b71d1a62eed86b128fcbe04546d4f3c7f2e976175a5ed8b5ea56b` |
| widgets | 8 | 2,054,588 | `cdab1b5ba79f7e265537bed74e06b3604b247fa2b85abf15410bf246086b08f4` |
| evaluators | 17 | 1,312,383 | `175b6b610556144582b1327a81a4a6e4be29e7814304170d3e0278d17e8db216` |
| visuals-assets | 229 | 15,290,514 | `5b2884057bd4c47ce77f55239ba08bb9c10916a78b26bce557fc6781c9cdcf0f` |
| standards-toolchain | 31 | 244,274 | `3d0770632699e9801f36f5a202cd5e031630bc4df65b26f90cd80b4aa90484ed` |
| review-detectors | 8 | 108,646 | `18b83d8c8c87e22c00a64af4fd592fd7af126e7a3f7319514cfcf3191d1c8936` |
| evidence-artifacts | 76 | 14,399,688 | `e35d50f22024e5ea0fd2dde9b06e51ba340f5ab12586eca0da90b8865e232942` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
