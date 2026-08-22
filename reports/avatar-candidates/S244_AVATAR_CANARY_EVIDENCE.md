# S244 premium avatar V4 canary evidence

Status: **mechanical canary passed after non-destructive normalization; the v2 Summit reframes pass
this visual review; non-shipping; independent hash approval still pending.** `public/avatars` and
`ENABLED_AVATAR_IDS` remain unchanged.

## Verdict

All ten inputs are independent 1254×1254 opaque PNG masters with unique SHA-256 hashes. The eight
human portraits have a premium dimensional painterly finish, distinct facial geometry, and a clear
age progression from Early through Summit. The two neutral medallions read as the same premium
material system and remain legible at picker size.

The first unnormalized masters did **not** pass framing: human silhouette top margins spanned
13.4–29.1%, widths 52.7–88.5%, heights 67.9–86.6%, and five portraits touched the bottom edge.
The original 301/302 shoulder crops also forced materially smaller faces after contain-scaling.
Their exact v1 files are retained as `*-master-v1-rejected.png`; independent v2 reframes with narrow,
isolated shoulder crops replaced only the quarantined canonical candidates. None was published or
enabled.

The deterministic normalization keeps the painted subjects intact, removes only the sampled
near-ivory background, applies one uniform scale and translation per subject, and places the result
on an exact `#F7F3EC` canvas. It does not crop, stretch, regenerate, or combine identities. Human
subjects fit approximately inside x=12.5–87.5%, y=14–95% with at least 4.9% measured bottom
clearance. The slightly wider box is required for the widest Summit shoulder crop to remain above
the production validator's 68% minimum height without distortion.

At both 256 and 512 px the rebuilt set reads coherently: clean matte edges, no visible rectangular
background seams, no device chrome, no repeated face, no text or watermark, and age-truth remains
clear. The v2 Summit faces now align materially with Adventurer while reading genuinely older.
Across all eight humans, normalized top-margin range is 3.4 percentage points and height range is
3.8 points. This reviewer recommends the canary art direction; final representation and exact-hash
approval remains an independent human gate.

## Normalized measurements

| id | band/kind | left | top | right | bottom | width | height |
|---|---|---:|---:|---:|---:|---:|---:|
| 001 | Early human | 20.9% | 14.3% | 20.8% | 5.3% | 58.3% | 80.5% |
| 002 | Early human | 21.3% | 14.3% | 21.1% | 5.3% | 57.6% | 80.5% |
| 101 | Explorer human | 14.9% | 14.4% | 14.9% | 4.9% | 70.1% | 80.8% |
| 102 | Explorer human | 17.3% | 14.4% | 17.3% | 5.3% | 65.4% | 80.4% |
| 201 | Adventurer human | 15.5% | 14.4% | 15.5% | 4.9% | 68.9% | 80.8% |
| 202 | Adventurer human | 13.6% | 14.3% | 13.7% | 4.9% | 72.8% | 80.9% |
| 301 | Summit human | 12.9% | 16.7% | 12.8% | 5.3% | 74.3% | 78.0% |
| 302 | Summit human | 12.9% | 17.7% | 12.8% | 5.3% | 74.3% | 77.1% |
| 401 | neutral symbol | 19.6% | 17.5% | 19.5% | 17.3% | 60.8% | 65.2% |
| 403 | neutral symbol | 19.6% | 17.3% | 19.5% | 17.2% | 60.8% | 65.5% |

All normalized corner patches are exactly RGB `(247,243,236)`. All 10 normalized masters and both
export sizes have unique decoded pixels. Each lossy WebP derives from its own normalized master and
passes the 12-MAE source-pair tolerance.

## Source hash lock

| id | original master SHA-256 | normalized master SHA-256 |
|---|---|---|
| 001 | `aa04aa6624e59e942b575a7aab9aabf18f16bfc89aa97a3fff0695c561179e97` | `3fefe1980d6a60d09601801a30e41d36d560d8fa0a02ae8ee29a99fff6269736` |
| 002 | `ee13d56b59aa2e0bcf1da0461bb4ae3114e10fa700a81bb9cd31a76746ede2dd` | `fa6430f479322366ef7b9fac80c788bd110f5e8d713a0bcb0a438b604eb21c0c` |
| 101 | `0fa0e113d5ca049042bee63d3931fe16b82e647e12666b3cddc2502367261bcf` | `7fce17bda83f9da44b77a10178cbb2dd2c3128b25908b4e4ada0fa7e8592155f` |
| 102 | `54c0d91fbb8d8dd8ecabe1b0feda8a2ec306ed75ec6f1896c3a9e52f4ecdba0b` | `aa2b677fd3cb13f990ce112e6c6d92e4fb33fe62f0f127c752302811584adbc8` |
| 201 | `98063d68fc99f546265a78a2092871d7561cb1481ea3c314fae77f653101d182` | `ae64cc10b137511c1f0214aec412fecb073dc1dc43d65375d82c9c8c51caf9a8` |
| 202 | `fa969fc59c4e9e6472b886d85c3fd7a5e6764929e85c32e912f64347af92e267` | `10e5d74b09de2555fbe1bdae4bf128f366629035bb8dc69f6aeb47905373013e` |
| 301 | `806aeebe6a18c5e895a051946ed4e8d9f3995c40365e7eaa9c4642c741122f39` | `aa96ccec6927d0b5a15c2a650489e11c8f295791387274279eb4ce142a00e0c8` |
| 302 | `0d6bcf9b3f56ff782a59d0b13ed6f4d2ad3f4e1ba15d677965d173db2bdf96d2` | `3ee57fe439c032674e21afb86c477b21ddc0e9a8ef18a71efaa147251c1e22fc` |
| 401 | `4c78729598d9274b80bc76949f23e01a597777491b1420c2bffadd5f02e589ae` | `e1a41409ac86423c437860e841404ad0fe5fe5d312e30a79fccd2b866038c091` |
| 403 | `6b9bbe44290225aab6e3c3dd912b6100b524eb2465401c81e479b064ee34f657` | `213894894b6d1f7562feccd884b7ca9a971aa412735e370784a7127f742947a3` |

## Reproducible evidence and release boundary

- Original masters: `reports/avatar-candidates/s244-masters/`
- Normalized masters and quarantined 256/512 WebPs: `reports/avatar-candidates/s244-normalized/`
- 256 contact sheet: `reports/avatar-candidates/s244-normalized/s244-canary-contact-sheet-256.png`
- 512 contact sheet: `reports/avatar-candidates/s244-normalized/s244-canary-contact-sheet-512.png`
- Deterministic transform: `scripts/brand/normalize-avatar-canary-s244.mjs`
- Measurement: `scripts/brand/measure-avatar-canary-s244.mjs`
- Canary validation: `scripts/brand/validate-avatar-canary-s244.mjs`

Rebuild and validate with:

```text
npm run build:avatars:canary:s244
npm run validate:avatars:canary:s244
npm run validate:avatars
```

Passing this canary does **not** authorize runtime integration. Its ids belong to four different
15-option release cohorts. The first possible release is one complete approved band—never these ten
mixed canary assets and never a partial picker.
