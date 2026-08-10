# WAVE 02 PLAN — PREMIUM PRODUCT SHELL, FAIL-CLOSED PREPARATION

## Objective

Reach the Wave-02 screenshot-quality gate without weakening the mathematical or release-integrity culture.
Because the exact runtime cannot currently be reconstructed, this S220 batch is permitted to repair the
verification substrate and prepare deterministic visual certification. It is **not** permitted to declare
the shell premium based on source inspection or historical screenshots alone.

## Work order

### 1. Preserve the sealed mathematics

- Keep `content/courses/**` byte-identical to S219.
- Reject any refactor that touches core lesson/player state unless it directly restores the blocked runtime
  and survives equivalent current-tree gates.
- Re-prove the exact corpus hash before sealing.

### 2. Attempt the canonical runtime restore first

- Use the exact lockfile.
- Require Node ≥22.17 or supported 24.x for browser certification.
- Run `npm ci` against the configured registry.
- If the exact dependency tree cannot be restored, record the exact package/registry failure and stop
  current-browser claims.

### 3. Refuse risky dependency workarounds

A dependency-removal refactor is acceptable only if it actually reconstructs a complete supported runtime
and preserves the player API/semantics. If removing one missing dependency merely exposes another missing
package, revert byte-exact and refuse the workaround.

### 4. Make the generated-evidence chain safe on the current corpus

- Preserve immutable historical baselines as immutable.
- Historical proofs may recognize later changes only from an existing cumulative authorization whose
  **current bytes still equal the sealed per-file SHA-256**.
- Historical runtime loaders must import the real current local model/evaluator code, not behavior stubs.
- Frozen historical hash writers must validate historical lesson count **before** writing.
- `verify:generated` must verify a frozen S151 ledger, never regenerate it from today's 1,701 lessons.
- Require every generated group to be byte-stable on the second pass.

### 5. Build the deterministic Wave-02 visual matrix

Create one machine-readable source of truth and one runner for:

- 15 required routes/states;
- 390 / 768 / 1440 widths;
- light/dark;
- deterministic reduced-motion final-state screenshots;
- lesson start and completion seeded from known state;
- horizontal overflow and desktop keyboard-focus checks;
- touch-target telemetry;
- manifest output for review.

Keep 200% browser zoom and real-device testing explicit manual gates rather than simulating them with CSS
zoom.

### 6. Adversarially falsify the new controls

Required mutations:

1. mutate a post-S151 authorized lesson byte → cumulative exact-hash verifier must fail;
2. mutate frozen `SESSION151_LESSON_HASHES.json` → frozen-ledger verifier must fail;
3. delete one mandatory visual viewport → visual contract must fail;
4. restore each target byte-exact and re-run green.

### 7. Seal only what has actually been proven

If current dependencies/browser remain unavailable:

- Wave 02 status = **OPEN / PREFLIGHT COMPLETE, VISUAL CERTIFICATION NOT EXECUTED**;
- visual delta = **none**;
- do not claim 390/768/1440 screenshots were reviewed;
- do not claim typecheck/Vitest/build/Playwright are current S220 results;
- seal the verification repairs and visual harness as `wave02-preflight`, then make the supported runtime
  the first action of S221.
