# S244 mathematics-symbol avatar cohort — author QA

Status: **INDEPENDENT PASS / APPROVED FOR ATOMIC 12-ITEM RELEASE**

This is a separate 12-item extension (`avatar-501`–`avatar-512`). It does not enlarge, weaken, or
change the locked 60-item core avatar gate. The extension releases all-or-none.

## Production method

The mathematical marks are deterministic glyphs, not image-model text. Each exact mark is placed
inside the same dimensional navy/ivory/orange painterly medallion treatment, then rendered into
independent 1024 masters and 512/256 candidates. True 80, 48 and 32 px evidence is retained.
The second-pass build removes the first-pass noise filter entirely, keeps the outer warm-ivory
canvas clean, and gives every mark its promised semantic motif rather than stamping one generic
background beneath all 12.

Included marks: π, θ, ∫, Σ, √, Δ, ∇, ±, ≈, ∂, ƒ and →.

## Author review

- 12/12 unique master hashes; `releaseEligible:false`.
- Exact marks remain recognizable at 80 and 48 px.
- At 32 px, the single-glyph set remains distinguishable. The original multi-character derivative,
  function and limit candidates were rejected before this report; `∂`, `ƒ` and `→` replaced them.
- Circular crop and lower-right selection-badge clearance are preserved.
- No asset has been copied to `public/avatars`, enabled in the runtime allowlist, or exposed in the
  picker.
- Semantic names are neutral and non-leading, for example “Pi symbol avatar” and “Integral symbol
  avatar.”

## Independent-hold corrections

- Δ now includes a visible before-to-after trail and destination point.
- ƒ now includes a rising function curve; → now shows a dotted approach path ending at a limit
  point.
- The runtime definition fails closed unless the exact 12-id allowlist is complete, and the asset
  validator binds that rule to `avatar-math-symbol-cohort.json`.
- Picker radios use semantic accessible names such as “Theta symbol avatar,” not generic ordinal
  labels.
- All regenerated hashes are recorded in the candidate manifest; no revised asset is public.

## Independent gate — PASS

An independent mathematics and visual assessor explicitly tested π/n, θ/0, ∫/f, Σ/E,
√/check-mark and ∇/triangle confusion at 80/48/32 px. All 12 passed after the revision. The
runtime, picker and validator now enforce one complete 12-item release with semantic accessible
names and an exact nested 24-WebP production set.

Evidence:

- `reports/avatar-candidates/s244-math-symbols/s244-math-symbol-contact-sheet-80.png`
- `reports/avatar-candidates/s244-math-symbols/s244-math-symbol-contact-sheet-48.png`
- `reports/avatar-candidates/s244-math-symbols/s244-math-symbol-contact-sheet-32.png`
- `reports/avatar-candidates/s244-math-symbols/candidate-manifest.json`
