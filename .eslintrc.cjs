/**
 * ESLint gate (Session 113). `next lint` is deprecated (removed in Next 16), so
 * `npm run lint` calls the ESLint CLI directly. ESLint 8 + eslintrc today; the
 * flat-config migration rides the Next 16 session (see KNOWN_ISSUES).
 *
 * Deliberate deviations, each with its reason — none silently:
 *
 * · react/no-unescaped-entities OFF — raw apostrophes/quotes in JSX copy are
 *   valid HTML; the rule exists to catch unclosed tags, and rewriting 200+
 *   authored learner-facing strings to &apos; churns copy for zero benefit.
 *
 * · prefer-const {destructuring:'all'} — a destructure where only SOME bindings
 *   are reassigned cannot be split into const+let; 'all' keeps full enforcement
 *   on plain declarations. All 16 legacy plain-declaration sites were FIXED
 *   (split, preserving seeded pick() call order), not exempted.
 *
 * · no-explicit-any WARN not error — 55 legacy occurrences predate the gate.
 *   New `any` still surfaces in every run, and CLAUDE.md forbids introducing
 *   more; burning the backlog is tracked work, not a reason to ship an
 *   always-red gate.
 *
 * · no-unused-vars underscore convention — `_x` is the intentional-discard
 *   idiom this codebase already uses (e.g. seeded generators consuming a draw
 *   they do not emit).
 *
 * · CommonJS override for **\/*.cjs and scripts/**\/*.js — .cjs is an explicit
 *   CommonJS declaration (this includes src/lib/*Independent.cjs, which are
 *   CommonJS BY DESIGN so the independent verification routes share zero code
 *   path with the TS they check); no-require-imports policing the module
 *   system there is a false positive, not a defect.
 */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    "react/no-unescaped-entities": "off",
    "prefer-const": ["error", { destructuring: "all" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }
    ]
  },
  overrides: [
    {
      files: ["**/*.cjs", "scripts/**/*.js"],
      rules: { "@typescript-eslint/no-require-imports": "off" }
    }
  ],
  ignorePatterns: [".next/", "data/", "test-results/", "playwright-report/", "coverage/", "next-env.d.ts"]
};
