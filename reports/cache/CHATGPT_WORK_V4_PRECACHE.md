# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `6c776e7b29e76b65e85bad141cb1bb6811eacf5ec3e779714a623c1fdcfe2a16`
- Local cache: `.chatgpt-work-cache/maggies-v4/6c776e7b29e76b65e85bad141cb1bb6811eacf5ec3e779714a623c1fdcfe2a16/`
- Base commit metadata: `a6a2e4731dbd0552aac4b5d62c6ca6fd94db4b80`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,653 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,505,947 | `9e6fea566422b55ffe80be7d194ad67ee466829a1ab5c313791db4fbb5dd1bf3` |
| standards | 12 | 27,080,895 | `8143610a8b8a0450231183015a0b9f5b0201c3ad35774ed14c444657d0342ce7` |
| mastery | 6 | 8,251,662 | `419a173dffdf0b4f05303680505f1ae0c4a4ec92434f110abeddf97c98aca3d9` |
| rubric-contract | 20 | 231,688 | `640e2b1af5f8f24b3decb645a841a8dcdae4f41d1c9f30322f25a8650abe38c2` |
| contract-code | 15 | 828,603 | `f8e4ba0bc3359b49ca0ff4b0242984c48250ae6ba5fc29815a56ec8654624945` |
| generators | 22 | 4,492,965 | `705429b6748ead74c4a6a2dcde72763d78f7fde09eacf71ef61f3f586351465b` |
| widgets | 8 | 2,070,599 | `9e9a147ceaf506b0a7ced72521312dd7c70dd5260c0902847c29a38e7e3357d9` |
| evaluators | 17 | 1,328,531 | `bf7936b533c55fcf04ebdb95205d3d3a42336dfc8a0ece363cc97d2ceab21c8d` |
| visuals-assets | 227 | 14,809,913 | `ba719e26b6fcfebfa2d4ec33d1100319f9a4e32efc96a9b1b16665c1e46594b6` |
| standards-toolchain | 14 | 122,497 | `3a188beaf092ce6b5449aba9e6e2f34254f1a0c430b04834a6918f90a7a0175d` |
| review-detectors | 8 | 121,369 | `2a37dd83ceea88d5afa8ca9185bb0cb69003bbe1360c27c2f13eda349197d158` |
| evidence-artifacts | 67 | 17,409,677 | `11117aed96eee3fc3b6578f421588bea7f1aa577d8920e35887c4ac2649b60d2` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
