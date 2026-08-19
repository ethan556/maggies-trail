# S269 — Area & Surface Volume figure-truth repair

Three concepts used fixed figures with different values or a different box setup:

- `asv-frac-volume` depicts `3½ × 2 × 2 = 14`, while `asv-05-02/c1` teaches `3 × 2 × 3/2 = 9` and `c2` teaches `7/2 × 2 × 4 = 28`.
- `asv-boxes-fit` is a generic 2-by-2 box sketch, not the aquarium/planter/moving-van synthesis claim in `asv-05-03/c1`.

The source bindings are withheld, leaving the mathematical claims, narration, and evaluated interactions untouched. This is a safe correction: no displayed or accessible diagram now suggests the wrong dimensions, product, or volume.

QA: `node scripts/audit/repair-area-surface-volume-s269.mjs --check`, focused Vitest, schema, pedagogy, strict CML, TypeScript, lint, and scoped diff check.

Queue-compatible effect: three illustration-replacement rows become refresh-closable. Independent review stays open.
