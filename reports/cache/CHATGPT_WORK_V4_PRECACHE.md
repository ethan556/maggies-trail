# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `fb25456739e6845771511cc3dbde2ae5fb63ddf04d616f23fb72f699f9a5e8e2`
- Local cache: `.chatgpt-work-cache/maggies-v4/fb25456739e6845771511cc3dbde2ae5fb63ddf04d616f23fb72f699f9a5e8e2/`
- Base commit metadata: `2fc6d5d70bd055ea26295dec6df45e35d2baf591`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,653 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,505,325 | `74da52f7b2690f7a581c41e28fa3a94fcc041dd659de1a2c47488ca5f132dce1` |
| standards | 12 | 27,080,895 | `8143610a8b8a0450231183015a0b9f5b0201c3ad35774ed14c444657d0342ce7` |
| mastery | 6 | 8,251,662 | `419a173dffdf0b4f05303680505f1ae0c4a4ec92434f110abeddf97c98aca3d9` |
| rubric-contract | 20 | 231,688 | `dd26e1e9eee01601b70f2c48574a9929a7614dad87dc3b9eecf0c4e822552e92` |
| contract-code | 15 | 828,603 | `f8e4ba0bc3359b49ca0ff4b0242984c48250ae6ba5fc29815a56ec8654624945` |
| generators | 22 | 4,578,777 | `715194627d39d327ba25473e9f9734acf032ea8874e87e332049e6f8e6e0bd4c` |
| widgets | 8 | 2,070,599 | `9e9a147ceaf506b0a7ced72521312dd7c70dd5260c0902847c29a38e7e3357d9` |
| evaluators | 17 | 1,328,531 | `bf7936b533c55fcf04ebdb95205d3d3a42336dfc8a0ece363cc97d2ceab21c8d` |
| visuals-assets | 227 | 14,809,913 | `ba719e26b6fcfebfa2d4ec33d1100319f9a4e32efc96a9b1b16665c1e46594b6` |
| standards-toolchain | 14 | 122,497 | `3a188beaf092ce6b5449aba9e6e2f34254f1a0c430b04834a6918f90a7a0175d` |
| review-detectors | 8 | 109,944 | `93735707ae099cb361796215b7f3ffee88f1bc60c188e0a39420e0fd034fa22e` |
| evidence-artifacts | 67 | 17,329,728 | `820f64ef06bd700ed540c1232a6a99982859ef8139e02612b41698cd5adf5595` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
