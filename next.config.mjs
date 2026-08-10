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
  }
};
export default nextConfig;
