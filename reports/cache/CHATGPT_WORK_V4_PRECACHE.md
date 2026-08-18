# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `553863d8058eb4519d1d849c0c7f87498e24234451e4332a2150f78080643cdd`
- Local cache: `.chatgpt-work-cache/maggies-v4/553863d8058eb4519d1d849c0c7f87498e24234451e4332a2150f78080643cdd/`
- Base commit metadata: `70a6ba29c1e32ef31e169e73b403a7ba9c7b9312`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,653 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,509,042 | `eb7fda3bc705bd05cc093e0f77da15b927f523bb42ea3d3837fa20cc929a04b8` |
| standards | 11 | 26,896,274 | `96c4078231aff5ffb18bc58d621ad0bad2f56fe78ba22a8cdbba201838f90205` |
| mastery | 6 | 8,251,632 | `d0716feaf85dffe6d46425097237c25694dcc9c11ec4da6c115ab160d58be015` |
| rubric-contract | 20 | 231,688 | `640e2b1af5f8f24b3decb645a841a8dcdae4f41d1c9f30322f25a8650abe38c2` |
| contract-code | 15 | 828,603 | `f8e4ba0bc3359b49ca0ff4b0242984c48250ae6ba5fc29815a56ec8654624945` |
| generators | 22 | 4,397,194 | `0b51e977ea9f98a272bc94bd1edd666e736dd221c1c55cfeba2aa182d6a40dee` |
| widgets | 8 | 2,069,711 | `dc2601a0849486df2adb4a28822a85fa14224366509afaa9a9c0b6d6f3ea34ee` |
| evaluators | 17 | 1,328,531 | `bf7936b533c55fcf04ebdb95205d3d3a42336dfc8a0ece363cc97d2ceab21c8d` |
| visuals-assets | 227 | 14,809,367 | `c3d39816077cebb11965229210621dbf40e3eefb245f258674eb993ea511e68b` |
| standards-toolchain | 11 | 105,792 | `59eee3fa86e71f7d7d7b5529c56a36ab0f042ae120892bfdb82516f369797c3e` |
| review-detectors | 8 | 120,337 | `d64a02072c2c61d03f5a6c390327449da180bc221e40c7f0b822ee05fc442cfa` |
| evidence-artifacts | 59 | 17,231,142 | `45bf1f2289bf9ce47375cfd951a0db355366f400e78abf7cd7a8e95a33bc94ec` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
