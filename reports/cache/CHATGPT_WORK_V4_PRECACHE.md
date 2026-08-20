# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `20d9488d68c701284bddea11fc32ae2bb2d40ee084558f4c06eeef5c412aba87`
- Local cache: `.chatgpt-work-cache/maggies-v4/20d9488d68c701284bddea11fc32ae2bb2d40ee084558f4c06eeef5c412aba87/`
- Base commit metadata: `feb69a1a5c2e21ef7ff20aacd671fa4810a52a29`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,654 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,032,384 | `70ac350cb55c420f474ce2475df9a48f09e560a5a896ee3c2847156aca7cf1a6` |
| standards | 12 | 55,993,745 | `b595f211b348c8576b9884c6dd27a62537e5271abce1bfeee34e3344fc5a3f10` |
| mastery | 6 | 8,015,251 | `73641fc0d9e3bf7b7a36fe546edd9a771c03ab049b8b2f686716c4e6dabe030d` |
| rubric-contract | 20 | 228,937 | `b743bf7ef2b0fc6bc2e000f892b6f9027b227e8217040c8acee8b95fafafadd0` |
| contract-code | 15 | 825,426 | `8b1290c77aeb662c15e9ff5cab9e0529789f21e24d3136d8f8b78c8fada045f5` |
| generators | 22 | 4,484,969 | `525834884a9b71d1a62eed86b128fcbe04546d4f3c7f2e976175a5ed8b5ea56b` |
| widgets | 8 | 2,073,358 | `85dc3639ce96b0fcda5e70db1daf4d696ba76e8f7235fc117ee64fdc9bbab8df` |
| evaluators | 17 | 1,322,210 | `8dd9db08ed5c037523670d6c0ef54860ebe289985bd6e8cda2232d0d5d212157` |
| visuals-assets | 229 | 15,310,593 | `d10d1e95926047adfe908b30a12a6916b6ae3d48c01d0acb3193b9379f5d7bf8` |
| standards-toolchain | 31 | 244,274 | `3d0770632699e9801f36f5a202cd5e031630bc4df65b26f90cd80b4aa90484ed` |
| review-detectors | 8 | 108,646 | `18b83d8c8c87e22c00a64af4fd592fd7af126e7a3f7319514cfcf3191d1c8936` |
| evidence-artifacts | 76 | 14,464,888 | `d0a52499303bb5236ffb16b34f4714d05d0fa8b5d26539b5e960bdb72f3306e6` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
