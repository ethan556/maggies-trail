# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `ff13e208782c8bbaaa61891363e4817782c9a95fafd8b7018edc2fc3247ffca9`
- Local cache: `.chatgpt-work-cache/maggies-v4/ff13e208782c8bbaaa61891363e4817782c9a95fafd8b7018edc2fc3247ffca9/`
- Base commit metadata: `c0916a6f23b709c7c898530ad0c0700360dbdaf2`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,653 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,505,773 | `880ba5602acfb71b2a54250c0d800a2b4a8a53ba324a27b530ca5abc7c00f382` |
| standards | 12 | 27,082,186 | `39aaf4912eb4247975fe51bf9db14693102104bc81aec350323439b497e9c539` |
| mastery | 6 | 8,251,632 | `d0716feaf85dffe6d46425097237c25694dcc9c11ec4da6c115ab160d58be015` |
| rubric-contract | 20 | 231,688 | `640e2b1af5f8f24b3decb645a841a8dcdae4f41d1c9f30322f25a8650abe38c2` |
| contract-code | 15 | 828,603 | `f8e4ba0bc3359b49ca0ff4b0242984c48250ae6ba5fc29815a56ec8654624945` |
| generators | 22 | 4,459,565 | `5bc586fdf20bbdd40f509fa635751dc1ee6d1a3f88f98b9b48ace782908bbf12` |
| widgets | 8 | 2,070,599 | `9e9a147ceaf506b0a7ced72521312dd7c70dd5260c0902847c29a38e7e3357d9` |
| evaluators | 17 | 1,328,531 | `bf7936b533c55fcf04ebdb95205d3d3a42336dfc8a0ece363cc97d2ceab21c8d` |
| visuals-assets | 227 | 14,809,913 | `1603a470758784f6b0184eeb72c79f3a18dc17346c0a8a8cbed9111b4641be22` |
| standards-toolchain | 14 | 119,344 | `5f3f77c86872f5662576be9ad69603345bb13ce86688967f6ab6c6f18ea34402` |
| review-detectors | 8 | 121,369 | `2a37dd83ceea88d5afa8ca9185bb0cb69003bbe1360c27c2f13eda349197d158` |
| evidence-artifacts | 67 | 17,426,802 | `a810f0e9dd930da5a493993d8ff372ac6f221072139aec44bf96cbbf609fce38` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
