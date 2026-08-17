# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `98c52589acf693eee239162953f3267a39ef1bf393ed31537e52cffab7f80713`
- Local cache: `.chatgpt-work-cache/maggies-v4/98c52589acf693eee239162953f3267a39ef1bf393ed31537e52cffab7f80713/`
- Base commit metadata: `66ac01f9414da80906ea5f7182eec326261c551f`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,653 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,508,981 | `47e516a008de5437ee3fb529ae761d7aaf5b680c82f0cfc43c83dc81bb174f43` |
| standards | 11 | 26,896,274 | `96c4078231aff5ffb18bc58d621ad0bad2f56fe78ba22a8cdbba201838f90205` |
| mastery | 6 | 8,251,632 | `d0716feaf85dffe6d46425097237c25694dcc9c11ec4da6c115ab160d58be015` |
| rubric-contract | 20 | 231,688 | `640e2b1af5f8f24b3decb645a841a8dcdae4f41d1c9f30322f25a8650abe38c2` |
| contract-code | 15 | 828,603 | `f8e4ba0bc3359b49ca0ff4b0242984c48250ae6ba5fc29815a56ec8654624945` |
| generators | 22 | 4,297,277 | `27ab3a75648d7de4efe6c1e5772660107a277df079b56039725227a83d95bcad` |
| widgets | 8 | 2,068,294 | `9dad15c07f0d4e7015fa8780f64862a54689d9be947f3111843006833f90849a` |
| evaluators | 17 | 1,325,519 | `eacd49be322b2103d303c8968b5c0a56d27f9672943869b30810c2c39669c31f` |
| visuals-assets | 227 | 14,807,446 | `833f54feffe16cdc6450187d1ba11364a6cc233238ace94da84df9f38697c72e` |
| standards-toolchain | 11 | 105,792 | `59eee3fa86e71f7d7d7b5529c56a36ab0f042ae120892bfdb82516f369797c3e` |
| review-detectors | 8 | 120,337 | `d64a02072c2c61d03f5a6c390327449da180bc221e40c7f0b822ee05fc442cfa` |
| evidence-artifacts | 54 | 17,137,913 | `596fb41e31e590cde4bcf332b26c221688d4ce8ef44f9539b3f92d09e5268876` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
