import type { Config } from "tailwindcss";

const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{json,md}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#22314F",
        paper: "#FAFBF5",
        sky: "#2E7CD6",
        tangerine: "#FF8A3D",
        leaf: "#2FA36B",
        "leaf-ink": channel("leaf-ink"),
        "sky-ink": channel("sky-ink"),
        "tangerine-ink": channel("tangerine-ink"),
        "berry-ink": channel("berry-ink"),
        cta: channel("cta"),
        "cta-good": channel("cta-good"),
        "cta-danger": channel("cta-danger"),
        berry: "#D6455D",
        night: "#161D31",
        dusk: "#1D2740",
        bg: channel("bg"),
        "bg-2": channel("bg-2"),
        surface: channel("surface"),
        "surface-2": channel("surface-2"),
        muted: channel("text-muted"),
        content: channel("text"),
        "content-2": channel("text-2"),
        "primary-hover": channel("primary-hover"),
        "primary-press": channel("primary-press"),
      },
      borderRadius: {
        card: "1rem",
        pill: "9999px",
      },
      boxShadow: {
        e1: "var(--shadow-e1)",
        e2: "var(--shadow-e2)",
        e3: "var(--shadow-e3)",
      },
      /* S242 — `content` AND `content-2` USED TO LIVE IN BOTH SCALES, AND THE COLLISION WAS SILENT.
       *
       * `colors` above declares `content` and `content-2`; this map declared the same two keys. A
       * Tailwind `text-*` class resolves against BOTH, so `text-content-2` emitted two rules —
       *
       *     .text-content-2{color:rgb(var(--text-2)/…)}
       *     .text-content-2{font-size:1.125rem;line-height:1.6}
       *
       * — of equal specificity. The colour was never lost; the FONT SIZE was an ambush.
       *
       * WHICH SITES ACTUALLY LOST IS A QUESTION ABOUT CSS ORDER, and the first count of this got it
       * wrong by 20×. Equal specificity means the LAST rule wins, and Tailwind emits font-size
       * utilities sorted lexicographically by class suffix. `[` is 0x5B and `c` is 0x63, so every
       * arbitrary `text-[…]` sorts BEFORE `content` and loses; so do `base`, `compute` and the
       * numeric `Nxl` sizes. `sm`, `xs`, `lg`, `xl`, `display` and `equation` sort after and were
       * never affected. Five className strings lost, not eighty-one — measured, then confirmed by
       * pixel-diffing before/after captures, where `/atlas` differed by zero pixels and the 390px
       * pages differed only across the tab bar.
       *
       * The five: the bottom tab bar's `text-[11px]` labels painted at 18px, which is what pushed
       * "More" 19px off a 320px screen at textScale xl and failed WCAG 1.4.4 + 1.4.10; two
       * `text-2xl` stat numerals painted at 16px instead of 24px; and two `text-base` sites, one of
       * which was already 1rem and so never moved.
       *
       * Nothing saw any of it because it is invisible to typecheck, to vitest, and to any gate
       * without layout — and the browser layer was dark under the old CSP. `s242-reflow.spec.ts`
       * found it within a minute of the app first hydrating.
       *
       * The keys are renamed so the two scales cannot collide again — this fixes the CLASS of bug
       * rather than its five instances, since with `body`/`body-lg` there is no second meaning for
       * a `text-*` class to resolve to, whatever anyone writes next. The six sites that were relying
       * on the token for their size carry `text-body-lg` explicitly now and paint exactly as before.
       * Evidence: `reports/generator-audit/TEXT_TOKEN_COLLISION.csv`, from
       * `scripts/audit/text-token-collision.mts`. */
      fontSize: {
        display: ["2.25rem", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display-lg": ["3rem", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        equation: ["1.25rem", { lineHeight: "1.45" }],
        compute: ["1.5rem", { lineHeight: "1.35" }],
      },
    },
  },
  plugins: [],
};

export default config;
