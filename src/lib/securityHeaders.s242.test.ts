/**
 * S242 / SEC-02 — THE SECURITY HEADERS ARE REAL, AND THE CSP ADMITS WHAT NEXT.JS ACTUALLY EMITS.
 *
 * WHAT THIS CLOSES. The dependency and configuration audit found the app defined NO
 * Content-Security-Policy, HSTS, nosniff, referrer or permissions policy of its own.
 *
 * WHAT THIS FILE USED TO ASSERT, AND WHY THAT WAS NOT ENOUGH. The first policy allowed inline
 * scripts by SHA-256 hash — one for `themeInit`, one for `motionInit` — and this file recomputed
 * both hashes from the real strings so they could not go stale. Every assertion in it passed. The
 * app still did not run: Next.js emits fifteen inline scripts per page, and the thirteen this repo
 * does not write (React's streaming runtime, the RSC payload chunks) vary per page and cannot be
 * hashed. They were all blocked, hydration never started, and `<body>` arrived carrying script
 * elements and no content.
 *
 * The lesson is in the old header, which said in as many words: "DELIBERATELY NOT ASSERTED HERE —
 * that the headers actually arrive on an HTTP response." The configuration was internally
 * consistent and the page was blank. So the split is now explicit and both halves exist:
 *
 *   · THIS FILE proves the policy's SHAPE — that the nonce is there, that 'unsafe-inline' has not
 *     crept back onto script-src, that the production policy carries no 'unsafe-eval', and that
 *     `next.config.mjs` does not set a SECOND CSP (two are enforced as an intersection, so a
 *     leftover static one would block the nonced scripts and look exactly like the original bug).
 *   · `e2e/s242-csp.spec.ts` proves the policy WORKS — real server, real response headers, and an
 *     assertion that the page hydrates, which is the only claim that would have caught the hashes.
 *
 * style-src keeps 'unsafe-inline': KaTeX writes inline style attributes on every element it renders
 * and 54 components emit scoped <style> blocks. Asserted below so it stays a decision, not drift.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCsp } from "../middleware";

const ROOT = process.cwd();
const NONCE = "TESTNONCEsGz9pQ1lJ0eA==";

const directives = (csp: string) => new Map(csp.split(";").map((d) => d.trim()).map((d) => [d.split(" ")[0], d]));

async function configHeaderMap(): Promise<Map<string, string>> {
  const config = (await import(/* @vite-ignore */ join(ROOT, "next.config.mjs"))).default;
  const routes = await config.headers();
  expect(routes.length, "no header route configured").toBeGreaterThan(0);
  const all = routes.flatMap((r: { headers: Array<{ key: string; value: string }> }) => r.headers);
  return new Map(all.map((h: { key: string; value: string }) => [h.key, h.value]));
}

describe("SEC-02 — script-src admits the nonce and nothing weaker", () => {
  it("carries the per-request nonce and 'strict-dynamic'", () => {
    const scriptSrc = directives(buildCsp(NONCE, false)).get("script-src") ?? "";
    expect(scriptSrc, "script-src exists").not.toBe("");
    expect(scriptSrc, "the nonce is what allows React's streaming runtime and the RSC payload").toContain(`'nonce-${NONCE}'`);
    // Without 'strict-dynamic' the chunk graph the nonced bootstrap pulls in is not trusted.
    expect(scriptSrc).toContain("'strict-dynamic'");
  });

  it("does not fall back to 'unsafe-inline'", () => {
    const scriptSrc = directives(buildCsp(NONCE, false)).get("script-src") ?? "";
    // Note this is stronger than it looks: browsers IGNORE 'unsafe-inline' when a nonce is present,
    // so adding it would mean first REMOVING the nonce — i.e. abandoning the policy entirely.
    expect(scriptSrc, "'unsafe-inline' on script-src is the protection this directive exists to give").not.toContain("unsafe-inline");
  });

  it("'unsafe-eval' and the HMR websocket are development-only", () => {
    const prod = buildCsp(NONCE, false);
    const dev = buildCsp(NONCE, true);
    expect(prod, "next dev needs 'unsafe-eval' for React Refresh; the shipped policy must not carry it").not.toContain("unsafe-eval");
    expect(prod).not.toContain("ws:");
    // And the dev branch must actually be doing something, or the e2e run is testing a policy that
    // differs from production in ways nobody stated.
    expect(dev).toContain("'unsafe-eval'");
    expect(directives(dev).get("connect-src")).toContain("ws:");
  });

  it("carries the directives the audit found missing", () => {
    const csp = buildCsp(NONCE, false);
    for (const directive of [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "connect-src 'self'"
    ]) {
      expect(csp, `CSP is missing ${directive}`).toContain(directive);
    }
  });

  it("style-src keeps 'unsafe-inline' — deliberate, and asserted so it stays deliberate", () => {
    // KaTeX writes inline style attributes; removing this breaks every rendered expression.
    expect(directives(buildCsp(NONCE, false)).get("style-src")).toContain("'unsafe-inline'");
  });
});

describe("SEC-02 — the nonce reaches every inline script this repo writes", () => {
  it("both pre-hydration scripts in the layout are nonced", () => {
    const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
    const inline = [...layout.matchAll(/<script\s+([^>]*?)dangerouslySetInnerHTML/g)];
    expect(
      inline.length,
      "the layout's pre-hydration scripts moved or changed shape — this assertion must move with them"
    ).toBe(2);
    for (const [, attrs] of inline) {
      expect(
        attrs,
        "an inline script in the layout has no nonce — the browser will block it, the theme will flash on load, and reduce-motion will be silently ignored"
      ).toContain("nonce={nonce}");
    }
  });

  it("the layout reads the nonce the middleware forwards", () => {
    const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
    expect(layout, "the nonce arrives on the x-nonce request header set in src/middleware.ts").toContain('headers()).get("x-nonce")');
  });

  it("the middleware sets the policy on the REQUEST as well as the response", () => {
    // This is the line that makes Next.js stamp its OWN scripts. Delete it and the two scripts
    // above still run while the thirteen that matter are blocked — the exact failure this replaced.
    const mw = readFileSync(join(ROOT, "src/middleware.ts"), "utf8");
    expect(mw).toContain('requestHeaders.set("Content-Security-Policy", csp)');
    expect(mw).toContain('requestHeaders.set("x-nonce", nonce)');
    expect(mw).toContain('response.headers.set("Content-Security-Policy", csp)');
  });
});

describe("SEC-02 — the static headers, and exactly one CSP", () => {
  it("next.config.mjs does NOT also set a Content-Security-Policy", async () => {
    const headers = await configHeaderMap();
    expect(
      headers.has("Content-Security-Policy"),
      "two CSP headers on one response are enforced as an INTERSECTION — a static policy here blocks the middleware's nonced scripts, and the page goes blank exactly as it did before"
    ).toBe(false);
    expect(headers.has("Content-Security-Policy-Report-Only")).toBe(false);
  });

  it("sets the transport and framing headers", async () => {
    const headers = await configHeaderMap();
    expect(headers.get("Strict-Transport-Security")).toMatch(/max-age=\d{7,}/);
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });
});
