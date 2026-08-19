import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { motionInit } from "@/lib/motionBootstrap";

/**
 * Product name/description — single-sourced from `public/manifest.webmanifest` so the three
 * places a share target can read this app's identity (the manifest, the root `<meta>` tags, and
 * the Open Graph / Twitter cards) state it in the *same words*. They drifted before: the root
 * description used to say "…algebra, geometry, and precalculus", silently omitting statistics
 * and calculus, both of which the catalog actually ships. If you edit one of these strings,
 * edit `public/manifest.webmanifest` in the same commit.
 */
const APP_NAME = "Maggie's Trail"; // manifest `short_name`
const APP_TITLE = "Maggie's Trail — Visual K–12 math you can touch"; // manifest `name`
const APP_DESCRIPTION =
  "Interactive K–12 mathematics from counting through algebra, geometry, statistics, precalculus, and calculus — learned by doing."; // manifest `description`

/**
 * The 1200x630 share card, rendered by `scripts/brand/render-og-image.mjs` from the approved
 * WS-A vectors (`public/brand/maggies-mark.svg` + `maggies-wordmark.svg`) plus `COPY.tagline`.
 * Regenerate with `npm run gen:brand-og` after any change to those assets.
 */
const OG_IMAGE = {
  url: "/brand/maggies-og.png",
  width: 1200,
  height: 630,
  alt: "Maggie's Trail — Visual K–12 math you can touch",
  type: "image/png"
} as const;

/** Browser/PWA chrome follows the identity mark's Deep Navy rather than the instructional sky
 * accent. This mirrors `manifest.webmanifest` and avoids a blue shell around a navy app icon. */
export const viewport: Viewport = {
  themeColor: "#0D1B2A"
};

export const metadata: Metadata = {
  title: APP_TITLE,
  manifest: "/manifest.webmanifest",
  referrer: "no-referrer",
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  // Canonical production origin. Not invented for this pass: `WAVE04_BASELINE.md:11` records
  // this host returning HTTP 200 from Vercel with a build marker, and it is the live comparison
  // target named in OPTIMIZATION_PLAN_V3.md and CLAUDE_COWORK_TRANSFER_MANIFEST_S237.md. It is
  // a *.vercel.app deploy domain, not a registered custom domain — if one is ever bought, this
  // constant is the single place that changes. Required: without it Next cannot resolve the
  // relative `icons`/`openGraph.images` paths below into the absolute URLs crawlers demand.
  metadataBase: new URL("https://maggies-trail.vercel.app"),
  // Mirrors `public/manifest.webmanifest`'s `icons` array exactly — same files, same sizes. The
  // maskable 512 is deliberately absent here: `purpose: "maskable"` is a manifest-only concept
  // with no <link rel> equivalent, so it stays declared in the manifest alone.
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon.ico", sizes: "any" }]
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    // Resolved against `metadataBase` into the absolute origin URL.
    url: "/",
    locale: "en_US",
    images: [OG_IMAGE]
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    images: [OG_IMAGE]
  }
};

/** Applies the saved theme before first paint (no flash). */
const themeInit = `(function(){try{var t=localStorage.getItem("numera:theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;

/**
 * S242 / SEC-02 — the per-request CSP nonce, minted in `src/middleware.ts` and forwarded on the
 * `x-nonce` request header. Next.js stamps its own script tags (the streaming runtime and the RSC
 * payload chunks) from the `Content-Security-Policy` request header the middleware also sets; the
 * two scripts BELOW are written by this repo, so they have to be stamped here.
 *
 * Reading `headers()` opts every route into dynamic rendering. That is the accepted, stated cost of
 * the nonce — see the header comment in `src/middleware.ts`. It is also not optional: a statically
 * prerendered page carries script tags baked at build time, which by definition cannot hold a nonce
 * minted per request, so under a nonce policy those pages would be blocked exactly as they were
 * under the hashed one.
 *
 * `?? undefined` rather than `?? ""`: an empty `nonce` attribute matches nothing, so a missing
 * header would fail as a silent block. Omitting the attribute fails the same way but leaves the
 * rendered HTML honest about what happened.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: motionInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
