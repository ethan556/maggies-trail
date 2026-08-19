# S269 — Decimals: Tenths & Hundredths figure-truth repair

## Scope and decision

The fixed `dpv-hundredths-grid` renderer is a generic hundred-square explanation. It cannot honestly depict the course's many named decimal quantities, such as `0.37`, `0.07`, `0.43`, or `$0.37`. The source had attached that one renderer to each of those claims. The runtime numeric-parity guard correctly withheld the conflicting render, but the stale source bindings still produced illustration-replacement debt.

This packet removes only the 16 stale bindings. It retains the learner-visible text and matching narration, along with every interactive `hundredthsGrid` model that is parameterized to the actual prompt. No generic picture is relabelled as a particular amount.

## Exact changes

- Withheld bindings: 16
  - `dg4-01-01/c2`, `dg4-01-02/c2`, `dg4-01-06/c2`
  - `dg4-02-01/c2`, `dg4-02-02/c2`, `dg4-02-03/c2`, `dg4-02-04/c1`, `dg4-02-04/c2`, `dg4-02-05/c2`
  - `dg4-03-01/c1`, `dg4-03-01/c2`, `dg4-03-02/c2`, `dg4-03-03/c1`, `dg4-03-04/c2`, `dg4-03-05/c2`, `dg4-03-06/c2`
- Retained generic grid bindings: 20, where the course's existing model remains appropriate.
- Retained interactive hundredths-grid tasks: every lesson keeps both `i1` and `i2` as a parameterized visual model.

## QA

- `node scripts/audit/repair-decimals-intro-g4-s269.mjs --check`
- `pnpm exec vitest run src/lib/session184.decimalsIntro.test.ts src/lib/session246.decimalsIntroProgression.test.ts src/lib/session269.decimalsIntroFigureWithholding.test.ts`
- `pnpm run validate:content`
- `pnpm run lint:pedagogy`
- `pnpm run cml:lint:strict`
- `pnpm exec tsc --noEmit --pretty false`

## Queue effect

The source change makes 16 stale `ILLUSTRATION_REPLACEMENT` rows refresh-closable. It does not self-close any independent lesson, visual-disposition, language, or standards review.

## Accessibility

The repair enforces WCAG 1.1.1 and 1.3.1 in the relevant sense: a displayed visual must communicate the same quantity as the adjacent instructional claim. Where it cannot, the model remains available through the correctly parameterized interactive surface instead of exposing a contradictory SVG or ARIA description.
