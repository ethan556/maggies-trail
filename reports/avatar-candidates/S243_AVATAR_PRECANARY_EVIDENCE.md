# S243 Avatar Art-Direction PRE-CANARY Evidence

**Verdict: REVISE — NON-SHIPPING.** This packet is an art-direction pre-canary, not the V4
identity canary and not a release approval. None of the files in
`reports/avatar-candidates/s243-precanary/` should be copied to `public/`, enabled in the avatar
manifest, or described as production-ready on the strength of this review.

## Evidence set

The four exported portraits are independent square renders; they are not crops from the supplied
composite concept boards. They cover one candidate from each human age collection:

| Candidate | Collection / intended first view | Files reviewed | Source status |
|---|---|---|---|
| `avatar-001` | Early Trail / K–2 | `avatar-001-256.webp`, `avatar-001-512.webp` | independent render; pre-canary |
| `avatar-101` | Explorer / grades 3–5 | `avatar-101-256.webp`, `avatar-101-512.webp` | independent render; pre-canary |
| `avatar-201` | Adventurer / grades 6–8 | `avatar-201-256.webp`, `avatar-201-512.webp` | independent render; pre-canary |
| `avatar-301` | Summit / grades 9–13 | `avatar-301-256.webp`, `avatar-301-512.webp` | independent render; pre-canary |
| `avatar-301-reframe-candidate` | Summit reframe experiment | `avatar-301-reframe-candidate.png` | source candidate only; no approved export pair |

Visual index: [four-up pre-canary contact sheet](./s243-precanary/contact-sheet-unapproved.png).
Its content is assessed here as **pre-canary**, not as a passed canary.

## Deterministic framing measurements

Run from the repository root:

```text
node scripts/brand/measure-avatar-precanary-s243.mjs
```

The script hashes each reviewed large candidate, estimates the warm-neutral background from four
corner samples, and measures the foreground silhouette with a fixed RGB-distance threshold. These
are silhouette measures, not face-landmark claims. The command includes no timestamp, network
input, randomness, or output mutation, so identical inputs produce identical JSON.

| Candidate | SHA-256 prefix | Background RGB | Top margin | Side margins (L / R) | Silhouette width | Foreground pixels | 512-byte size |
|---|---|---:|---:|---:|---:|---:|---:|
| `avatar-001` | `6f629b7566dc` | 249, 244, 234 | 6.3% | 19.7% / 20.7% | 59.6% | 39.2% | 35,078 |
| `avatar-101` | `3153bfaeab4f` | 251, 243, 234 | 2.5% | 7.8% / 13.1% | 79.1% | 44.8% | 33,636 |
| `avatar-201` | `ce82077db947` | 250, 242, 231 | 3.5% | 12.9% / 10.7% | 76.4% | 55.1% | 45,936 |
| `avatar-301` | `e4880aacd9d1` | 246, 240, 234 | 20.5% | 11.3% / 11.7% | 77.0% | 34.5% | 24,220 |
| `avatar-301-reframe-candidate` | `68020dd89bdd` | 243, 238, 230 | 4.7% | 0.0% / 0.0% | 100.0% | 51.0% | 1,692,852 (PNG source) |

The measured top-margin spread is **18.0 percentage points** (2.5%–20.5%). `avatar-301` has more
than three times the top margin of `avatar-001` and roughly eight times that of `avatar-101`.
Silhouette widths span **19.5 percentage points** (59.6%–79.1%), while foreground coverage spans
**20.6 percentage points** (34.5%–55.1%). These are visible grid-level framing differences, not
compression noise. The current `avatar-301` is substantially smaller in-frame than the other
three; the reframe experiment overcorrects because the foreground reaches both side edges.

Background samples are all close to warm ivory, but they are not identical. The large WebP file
sizes vary by about **1.90×** from smallest to largest. V4 requires background, lighting, framing,
sharpness, and file-weight variance to remain inside approved family tolerances; the framing
variance already blocks approval, and explicit numeric tolerances for the remaining properties
still need to be locked before batch production.

## Human art-direction review against the locked spec

Approximate landmark readings below are visual-review estimates from the 512 px exports (±2
percentage points), included to direct the next render rather than to impersonate an automated
face-landmark gate.

| Candidate | Approx. eye line from top | Approx. crown-to-chin | Age-band read | Framing verdict |
|---|---:|---:|---|---|
| `avatar-001` | 48% | 63% | clearly K–2 | head too large for the 45–55% target; eye line above the 55–60% target |
| `avatar-101` | 41% | 64% | clearly grades 3–5 | head too large; eye line substantially high; top/hair margin tight |
| `avatar-201` | 35% | 61% | clearly grades 6–8 | head too large; eye line very high; long hair/body fill makes this the densest tile |
| `avatar-301` | 47% | 44% | genuinely older / Summit | head slightly below target and overall portrait much smaller than the family |
| `avatar-301-reframe-candidate` | about 40% | about 64% | genuinely older / Summit | closer to peer visual weight, but head is too large and shoulders touch both edges |

Positive direction worth preserving: all four exports read as premium dimensional illustration,
avoid embedded card/device chrome, use restrained warm-neutral backgrounds, and communicate a
clear age progression rather than turning the Summit portrait into an enlarged elementary face.
Those strengths do not offset the contact-sheet consistency failure.

## V4 canary completeness check

V4 requires an identity canary of two human avatars from **each** age collection, two neutral
symbols, four representative achievement treatments, the locked state, and picker/profile/roster
states. An independent assessor must then review the actual small/large, light/dark, keyboard,
screen-reader, narrow-screen, and reduced-motion states.

| Required V4 canary evidence | Present here | Result |
|---|---:|---|
| 2 humans × 4 age collections (8 total) | 1 × 4 (4 total) | incomplete |
| 2 identity-neutral symbols | 0 | missing |
| 4 achievement treatments + locked state | 0 | missing |
| Picker, profile, and roster rendered states | 0 | missing |
| Small and large assets | 4 pairs | present, but framing fails |
| Light/dark, narrow-screen, reduced-motion evidence | 0 | missing |
| Keyboard and screen-reader evidence | 0 | missing |
| Independent-assessor approval of exact asset/build | 0 | missing |

## Required revision packet

1. Lock one numeric frame template before another render: eye line, crown-to-chin height,
   shoulder crop, and minimum safe margin. Use the same template across all age bands.
2. Re-render or reframe the four portraits toward that template. `avatar-301` needs to be larger;
   `avatar-001`, `avatar-101`, and `avatar-201` need smaller heads/lower eye placement. Reject the
   current Summit reframe because it has no horizontal safe area.
3. Produce a new labelled contact sheet at both 256 px and realistic small-roster display size;
   repeat the deterministic silhouette measurement and perform a separate face-landmark review.
4. Complete the actual bounded V4 canary (second human per band, two symbols, achievement/locked
   treatments, and rendered picker/profile/roster states) before any batch of 8–12.
5. Obtain an independent assessor verdict against the exact candidate hashes and rendered build.

Until all five steps pass, the only defensible status is **REVISE / PRE-CANARY / NON-SHIPPING**.
