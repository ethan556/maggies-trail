# S269 — Derivatives in Context figure-truth repair

The four affected source bindings pointed at fixed SVG examples that taught a different situation from the adjacent lesson text:

- a generic sign table rather than the stated velocity/acceleration rule;
- a `3 → 5 → 15` gear chain rather than related rates with time;
- a radius-5 tangent circle rather than a 10-foot ladder; and
- the same fixed gear chain beside a no-numbers-on-the-diagram instruction.

All four bindings are safely withheld. The exact claims, narration, graders, and parameterized interactive exercises are unchanged. This prevents contradictory visual and ARIA evidence while leaving a future exact model clearly scoped.

QA:

- `node scripts/audit/repair-derivatives-in-context-s269.mjs --check`
- `pnpm exec vitest run src/lib/session269.derivativesInContextFigureWithholding.test.ts`
- schema, pedagogy, strict CML, TypeScript, lint, and scoped diff checks

Queue-compatible effect: four stale illustration-replacement rows become refresh-closable; independent disposition debt remains untouched.
