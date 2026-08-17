/** @type {import('next').NextConfig} */
const nextConfig = {
  // S205 security hardening: the only next/image use in the product is the brand SVG, both
  // instances already `unoptimized`. Disabling the optimizer globally removes the /_next/image
  // endpoint, which is the sole path by which Next's bundled sharp (<0.35.0, libvips
  // CVE-2026-33327/-33328/-35590/-35591) can be fed input. Zero visual change; the real fix is
  // the Next 16 migration (its own session — breaking change), tracked in KNOWN_ISSUES.
  images: { unoptimized: true },
  // Every route that touches the content catalog must trace the JSON files on Vercel.
  outputFileTracingIncludes: {
    "/learn/[lessonId]": ["./content/**/*"],
    "/courses": ["./content/**/*"],
    "/courses/[slug]": ["./content/**/*"],
    "/dashboard": ["./content/**/*"],
    "/profile": ["./content/**/*"]
  },
  /* S242 / SEC-02 — application security headers.
   *
   * The audit found NO app-defined CSP, HSTS, nosniff, referrer or permissions policy.
   *
   * THE CONTENT-SECURITY-POLICY IS NO LONGER HERE. It lives in `src/middleware.ts`, because it
   * needs a per-request nonce. This file used to allow inline scripts by SHA-256 hash and to argue,
   * at length and wrongly, that a nonce "cannot work here" — the reasoning being that a nonce must
   * vary per response and so defeats static prerendering. That trade was real; what the argument
   * missed is that hashes never covered the scripts that matter. Next.js emits fifteen inline
   * scripts per page and thirteen of them — React's streaming runtime and the RSC payload — vary
   * with the page, so no static hash can name them. Every one was blocked and the app did not
   * hydrate. `src/middleware.ts` carries the full account and the measured cost.
   *
   * DO NOT ADD A CSP BACK TO THIS FILE. Two Content-Security-Policy headers on one response are
   * enforced as an INTERSECTION: a static policy here would block the nonced scripts the middleware
   * allows, and the symptom would be indistinguishable from the bug that motivated the move.
   *
   * The headers below have no per-request component, so they stay where they are — one place, one
   * static configuration, applied to every response including the static assets that middleware
   * deliberately does not match.
   *
   * frame-ancestors 'none' (in the middleware policy) and X-Frame-Options DENY are deliberate even
   * though LTI is on the roadmap: an LTI launch that needs framing should relax this for its own
   * route explicitly, not inherit a permissive default site-wide. */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" }
        ]
      }
    ];
  }
};
export default nextConfig;
