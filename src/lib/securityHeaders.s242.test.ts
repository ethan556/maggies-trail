/**
 * S242 / SEC-02 — THE SECURITY HEADERS ARE REAL, AND THE CSP HASHES ARE NOT STALE.
 *
 * WHAT THIS CLOSES. The dependency and configuration audit found the app defined NO
 * Content-Security-Policy, HSTS, nosniff, referrer or permissions policy of its own. Those are now
 * set in `next.config.mjs`.
 *
 * WHY THIS FILE IS THE LOAD-BEARING PART. The CSP allows the two pre-hydration inline scripts —
 * `themeInit` (applies dark mode before first paint) and `motionInit` (applies the learner's
 * reduce-motion, text-scale and reading-space preferences) — by SHA-256 hash rather than by
 * `'unsafe-inline'`, which keeps the strongest half of the policy intact. Nonces cannot be used
 * here: a nonce must vary per response, which would force every currently-static route to render
 * dynamically.
 *
 * The cost of hashes is that they fail SILENTLY and invisibly. Edit either script by one character
 * and the browser refuses to run it: the theme flashes light-then-dark on every load, a learner who
 * set reduce-motion gets animations anyway, and nothing in the test suite, the type checker or the
 * build says a word. Every symptom is a visual regression on first paint, which is exactly the
 * class of defect no automated gate in this repo watches for.
 *
 * So this file recomputes both hashes from the REAL strings — importing `motionInit`, which is
 * assembled from `storageKeys` at module scope, rather than re-reading its template source — and
 * fails if `next.config.mjs` does not carry them. That makes a stale hash a red test instead of a
 * bug report from a parent.
 *
 * DELIBERATELY NOT ASSERTED HERE:
 *   · That the headers actually arrive on an HTTP response. That needs a running server and belongs
 *     in the e2e layer; this file proves the configuration is correct and internally consistent.
 *   · `style-src 'unsafe-inline'`, which is retained on purpose — KaTeX sets inline style
 *     attributes on the elements it renders and 54 components emit scoped <style> blocks. It is
 *     asserted below so that its presence stays a deliberate, visible decision rather than drift.
 */
import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { motionInit } from "./motionBootstrap";

const ROOT = process.cwd();
const sha256 = (source: string) => `sha256-${createHash("sha256").update(source, "utf8").digest("base64")}`;

async function headerMap(): Promise<Map<string, string>> {
  const config = (await import(/* @vite-ignore */ join(ROOT, "next.config.mjs"))).default;
  const routes = await config.headers();
  expect(routes.length, "no header route configured").toBeGreaterThan(0);
  const all = routes.flatMap((r: { headers: Array<{ key: string; value: string }> }) => r.headers);
  return new Map(all.map((h: { key: string; value: string }) => [h.key, h.value]));
}

/** `themeInit` is a plain template literal in the layout, so its runtime value is its source. */
function themeInitSource(): string {
  const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
  const match = layout.match(/const themeInit = `([^`]*)`/);
  expect(match, "themeInit is no longer a simple template literal — this test must be updated with it").toBeTruthy();
  return (match as RegExpMatchArray)[1];
}

describe("SEC-02 — the CSP carries a current hash for every inline script", () => {
  it("themeInit", async () => {
    const csp = (await headerMap()).get("Content-Security-Policy") ?? "";
    expect(
      csp,
      "themeInit's hash is missing or stale — the browser will block it and the theme will flash on every load"
    ).toContain(sha256(themeInitSource()));
  });

  it("motionInit", async () => {
    const csp = (await headerMap()).get("Content-Security-Policy") ?? "";
    expect(
      csp,
      "motionInit's hash is missing or stale — reduce-motion, text-scale and reading-space preferences will be silently ignored"
    ).toContain(sha256(motionInit));
  });

  it("every inline script in the layout is accounted for", () => {
    // If a third pre-hydration script is added, it needs a hash too — and the person adding it
    // will not think of the CSP unless something says so.
    const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
    const inline = [...layout.matchAll(/<script\s+dangerouslySetInnerHTML/g)];
    expect(
      inline.length,
      "a new inline script was added to the layout — add its SHA-256 to the CSP in next.config.mjs and assert it here"
    ).toBe(2);
  });

  it("script-src does not fall back to 'unsafe-inline'", async () => {
    const csp = (await headerMap()).get("Content-Security-Policy") ?? "";
    const scriptSrc = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src")) ?? "";
    expect(scriptSrc, "script-src exists").not.toBe("");
    expect(scriptSrc, "hashes were replaced by 'unsafe-inline' — that is the protection this directive exists to give").not.toContain("unsafe-inline");
    expect(scriptSrc).not.toContain("unsafe-eval");
  });
});

describe("SEC-02 — the rest of the policy is present and states its own exceptions", () => {
  it("carries the directives the audit found missing", async () => {
    const csp = (await headerMap()).get("Content-Security-Policy") ?? "";
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

  it("style-src keeps 'unsafe-inline' — deliberate, and asserted so it stays deliberate", async () => {
    const csp = (await headerMap()).get("Content-Security-Policy") ?? "";
    const styleSrc = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("style-src")) ?? "";
    // KaTeX writes inline style attributes; removing this breaks every rendered expression.
    expect(styleSrc).toContain("'unsafe-inline'");
  });

  it("sets the transport and framing headers", async () => {
    const headers = await headerMap();
    expect(headers.get("Strict-Transport-Security")).toMatch(/max-age=\d{7,}/);
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });
});
