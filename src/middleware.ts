import { NextResponse, type NextRequest } from "next/server";

/**
 * S242 / SEC-02 — THE CONTENT SECURITY POLICY, MOVED FROM `next.config.mjs` TO A PER-REQUEST NONCE.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────────────────────────
 * The previous policy allowed inline scripts by SHA-256 hash: two hashes, for `themeInit` and
 * `motionInit`, the only two inline scripts THIS REPO writes. That reasoning was sound and the
 * arithmetic was right. It was also incomplete, and the app did not run.
 *
 * Next.js emits fifteen inline <script> elements per page, not two. Thirteen of them are React's
 * streaming runtime (`$RB`, `$RV`, the `requestAnimationFrame` reveal shims) and the RSC payload,
 * pushed in chunks as `self.__next_f.push([...])`. Their CONTENT DEPENDS ON THE PAGE, so no static
 * hash can cover them. Under the hashed policy every one was blocked, hydration never ran, and
 * `<body>` reached the browser containing script elements and nothing else. The keyboard walk's
 * paired-acceptance guard is what surfaced it: 104 of 117 chromium e2e assertions were failing, and
 * twelve of the thirteen "passes" were assertions vacuous against an empty page.
 *
 * A nonce is the only mechanism that covers a payload generated per response. Next.js reads the
 * `Content-Security-Policy` REQUEST header, extracts the nonce, and stamps it on every script tag
 * it emits — which is why the policy is set on `request` below as well as on the response. That is
 * not belt-and-braces; drop the request one and Next's own scripts go back to being blocked.
 *
 * ── THE COST, STATED PLAINLY ────────────────────────────────────────────────────────────────────
 * The config this replaces objected that "a nonce must be per-response, which defeats static
 * prerendering". True. `src/app/layout.tsx` now calls `headers()`, so every route renders
 * dynamically. The build route table before this change was 21 static (○) and 12 dynamic (ƒ), and
 * the twelve were every core learning surface — /learn/[lessonId], /practice/[chapterId],
 * /courses/[slug], /mastery/[conceptTag], /basecamp/[courseId], /trailhead, /placement. The 21 are
 * shells (/, /dashboard, /review, /notebook, /account, /admin) whose content is client-rendered
 * from localStorage on mount anyway. So the price is prerendering on 21 shells, and the thing
 * bought is an application that hydrates.
 *
 * 'unsafe-inline' was the alternative and it is worse than it sounds: browsers IGNORE
 * 'unsafe-inline' when any hash or nonce is present, so taking that route means deleting the
 * hashes as well, leaving `script-src 'self' 'unsafe-inline'` — under which any injected inline
 * script executes. That is the whole protection this directive exists to give.
 *
 * ── NOTES FOR WHOEVER EDITS THIS NEXT ───────────────────────────────────────────────────────────
 * · The nonce is generated with `crypto.getRandomValues`. CLAUDE.md rule 2 bans `Math.random` in
 *   variant generators because a generator must be a pure function of its seed. A nonce has the
 *   opposite requirement — a predictable nonce is not a nonce — so randomness here is correct, and
 *   this note exists so nobody "fixes" it later.
 * · 'strict-dynamic' lets the nonced bootstrap load the chunk graph. Browsers that honour it ignore
 *   'self'; 'self' stays as the fallback for those that do not.
 * · style-src keeps 'unsafe-inline'. KaTeX writes inline style attributes on every element it
 *   renders and 54 components emit scoped <style> blocks. Unchanged from the hashed policy, and
 *   still asserted in `securityHeaders.s242.test.ts` so it stays a decision rather than drift.
 * · The CSP lives HERE and nowhere else. `next.config.mjs` still sets the transport and framing
 *   headers; it must not set a CSP too. Two Content-Security-Policy headers are enforced as an
 *   INTERSECTION, so a leftover static one would block the nonced scripts and the symptom would
 *   look exactly like the bug this file fixes.
 */

/** 128 bits, base64. `btoa` and Web Crypto are both available in the edge runtime. */
function newNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * `dev` is a PARAMETER, not a module constant read from `process.env`, so the test can assert the
 * production policy and the development policy separately — under vitest `NODE_ENV` is "test", and
 * a constant captured at module load would have silently tested the dev shape and called it prod.
 *
 * `next dev` compiles with `eval`-based source maps and React Refresh, both of which need
 * 'unsafe-eval', and talks to an HMR websocket. Production needs neither, and
 * `securityHeaders.s242.test.ts` asserts both are absent there.
 */
export function buildCsp(nonce: string, dev: boolean): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    // `connect-src` must admit the dev server's HMR websocket; production talks only to itself.
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "manifest-src 'self'",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests"
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = newNonce();
  const csp = buildCsp(nonce, process.env.NODE_ENV !== "production");

  // Read by Next.js to stamp the nonce onto the streaming runtime and RSC payload scripts, and by
  // `src/app/layout.tsx` (via `x-nonce`) for the two pre-hydration scripts this repo writes.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  /**
   * Everything except immutable build output and the static files in `public/`. Those are assets,
   * not documents — a CSP on a font or a chunk protects nothing, and running middleware for them
   * would put a per-request hop in front of the cache. Excluding them BY EXTENSION rather than by
   * listing `icons/`, `brand/`, `avatars/`, `assets/`, `notebook-index.json` … keeps this correct
   * when someone adds a folder to `public/` and never reads this file.
   *
   * API routes ARE matched: they carried a CSP under the old config-level policy, and dropping it
   * here would be a silent reduction in coverage rather than a decision.
   */
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpe?g|gif|svg|webp|avif|ico|json|txt|xml|css|js|map|woff2?|ttf|otf|eot|mp3|wav|ogg|webmanifest)$).*)"
  ]
};
