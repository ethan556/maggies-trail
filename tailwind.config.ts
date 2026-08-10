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
      fontSize: {
        display: ["2.25rem", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display-lg": ["3rem", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        content: ["1rem", { lineHeight: "1.6" }],
        "content-2": ["1.125rem", { lineHeight: "1.6" }],
        equation: ["1.25rem", { lineHeight: "1.45" }],
        compute: ["1.5rem", { lineHeight: "1.35" }],
      },
    },
  },
  plugins: [],
};

export default config;
