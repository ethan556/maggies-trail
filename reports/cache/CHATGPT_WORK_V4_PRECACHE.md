# Maggie's Trail V4 ChatGPT Work precache

Deterministic, content-addressed evidence cache. It is not curriculum, a backlog, or approval authority.

- Cache seal: `df51a5919fafc29566e56b956b435bb2432156d66976f8fe530eb28e503ace92`
- Local cache: `.chatgpt-work-cache/maggies-v4/df51a5919fafc29566e56b956b435bb2432156d66976f8fe530eb28e503ace92/`
- Base commit metadata: `3793c45c2266730e8950b73e11c2b6b27a35b306`
- Queue freshness: **SOURCE_SEAL_MATCH**
- Inventory: **129 courses / 1,701 lessons / 15,653 top-level steps**
- Canonical policy pin: `8c87f7c8e16c66c6b8d711855322f6be7f7a815ab70fd2930403474e9fd8c694`
- Exact worker prefix: `23106956319f89721869698d4cad42db1b2dc3cd2ed6c78c181915622fbf3a2f`

## Dependency partitions

| Partition | Files | Bytes | SHA-256 |
|---|---:|---:|---|
| curriculum | 1,832 | 23,352,277 | `084fb8d5bc8859d3ea5042605b61e8aab611587e979c26a6d21d820f6cbbdbcf` |
| standards | 12 | 55,996,742 | `6c9f39bfaade9b228e29f735d06e8dae00db892900f8afd296d5219d3b390e59` |
| mastery | 6 | 8,251,662 | `40e05e95e415ebf357c3052548ce989d2afcea5b56b169eb2bb9c0a82eaabae6` |
| rubric-contract | 20 | 231,688 | `dd26e1e9eee01601b70f2c48574a9929a7614dad87dc3b9eecf0c4e822552e92` |
| contract-code | 15 | 820,862 | `9e96973c76602140bbcfa8d7e27323656c994d61d48ee9a2afa8de0ecc2d644e` |
| generators | 22 | 4,581,561 | `3b7002f2d9bf7dbd45f85afb4a7b88efccb9214315b72361ca451be3c0e22fbf` |
| widgets | 8 | 2,049,089 | `978c7ad0e15cfb3bc90c0ce84513c84e68a6ef6cbf3c824d2d5532cb826815f6` |
| evaluators | 17 | 1,322,790 | `495bda8f67bcd679c9990b98e96d22a03ab222e017ca902e240861a33324658a` |
| visuals-assets | 227 | 14,815,286 | `c21573b6985a3183550d70a25a91e03f2fd6aa144c3e17778b3d25af423a06d1` |
| standards-toolchain | 31 | 246,036 | `d07a5cf8d30003c6fccf729391e0ff81e5b2cfe2b87d6bd8ee0181fb5b32cddd` |
| review-detectors | 8 | 109,944 | `93735707ae099cb361796215b7f3ffee88f1bc60c188e0a39420e0fd034fa22e` |
| evidence-artifacts | 76 | 13,734,561 | `7409a760dc87fb671aa0cc90be0af542c2b003e4d323440a9970d57087ed899e` |

The manifest contains one compact capsule per course and logical dependency family. It carries no lesson prose, standards text, raw audit rows, or screenshots.

## Worker packet rule

Start every packet with `reports/cache/CHATGPT_WORK_V4_EXACT_PREFIX.md` byte-for-byte, then append `--- PACKET EVIDENCE ---` and the variable packet suffix.
Model, effort, and speed stay in execution metadata. Immutable scope, contract, owned files, evidence hashes, tests, invalidations, stop rules, and return schema stay in the packet.

## Commands

- Warm or refresh: `node scripts/cache/chatgpt-work-v4-cache.mjs`
- Verify tracked truth and any present local cache: `node scripts/cache/chatgpt-work-v4-cache.mjs --check`

Writes are atomic and the cache manifest is written last. Older content-addressed seals are retained; no cache directory is deleted automatically.
