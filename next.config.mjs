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
   * The audit found NO app-defined CSP, HSTS, nosniff, referrer or permissions policy. These are
   * set here rather than in middleware deliberately: middleware runs per request and would force
   * every currently-static route to render dynamically, trading a real performance property for a
   * header that does not need one.
   *
   * WHY script-src USES HASHES, NOT 'unsafe-inline'. Two inline scripts run before hydration —
   * `themeInit` and `motionInit` — to apply theme and motion preferences before first paint. Both
   * are fixed strings, so they can be hashed, and hashing keeps the strongest half of the CSP
   * intact. The obvious alternative, nonces, cannot work here for the same reason middleware
   * cannot: a nonce must be per-response, which defeats static prerendering.
   *
   * The hazard with hashes is that they go stale SILENTLY — edit either script and the browser
   * blocks it, the theme flashes on load, motion preferences are ignored, and no test notices.
   * `securityHeaders.s242.test.ts` recomputes both hashes from the real strings and fails if they
   * are not present here, which is what makes this approach safe to maintain.
   *
   * style-src keeps 'unsafe-inline'. KaTeX injects inline style attributes on the elements it
   * renders, and 54 components emit scoped <style> blocks. Hashing those is impractical and they
   * are not an XSS vector in the way scripts are. Stated plainly rather than hidden.
   *
   * frame-ancestors 'none' and X-Frame-Options DENY are deliberate even though LTI is on the
   * roadmap: an LTI launch that needs framing should relax this for its own route explicitly,
   * not inherit a permissive default site-wide. */
  async headers() {
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'sha256-9r4UfGgqRerDqRDrvS/DWWD2MbCUsyFX9AYHKwqN3Uo=' 'sha256-7Yd61OcsE9cwiYSFkCqnJtwprYj5mKqZSeK1dt5Rtxo='",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "manifest-src 'self'",
      "media-src 'self'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests"
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
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
