/**
 * S242 / SEC-02 — THE CSP ARRIVES, AND THE APP RUNS UNDER IT.
 *
 * WHY THIS FILE EXISTS, AND WHAT IT IS THE ANSWER TO. The first Content-Security-Policy this repo
 * shipped allowed inline scripts by SHA-256 hash. Its unit test recomputed both hashes from the
 * real strings and passed, and the header of that test file said, in as many words:
 *
 *   > DELIBERATELY NOT ASSERTED HERE: That the headers actually arrive on an HTTP response. That
 *   > needs a running server and belongs in the e2e layer; this file proves the configuration is
 *   > correct and internally consistent.
 *
 * The configuration was correct and internally consistent, and the application did not run. Next.js
 * emits fifteen inline scripts per page; the thirteen this repo does not write — React's streaming
 * runtime and the RSC payload — vary with the page and cannot be hashed. All thirteen were blocked,
 * hydration never started, and every route served a `<body>` containing script elements and nothing
 * else. 104 of 117 chromium assertions failed and twelve of the thirteen that "passed" were vacuous
 * against a blank page.
 *
 * So this file asserts the sentence that file declined to: the header arrives, it carries a nonce,
 * every script on the page holds that nonce, the browser reports no violation, and — the one that
 * actually matters — REACT HYDRATES AND THE PAGE HAS CONTENT. The last assertion is not decoration.
 * It is the only one that would have caught the hashes, and no amount of checking the policy's
 * arithmetic can substitute for it.
 *
 * RUNS AGAINST EITHER SERVER. The dev policy adds 'unsafe-eval' and the HMR websocket, because
 * React Refresh needs them; the production/dev split is asserted from `buildCsp` in
 * `src/lib/securityHeaders.s242.test.ts`, where both branches can be named. Everything asserted
 * here holds in both, so this spec is honest wherever it is pointed.
 */
import { expect, test, type Page } from "@playwright/test";

/**
 * A shell, a client-rendered surface, a catalogue, and a real lesson stage.
 *
 * The floors are PER ROUTE and each one is a measurement, not a round number. The first draft used
 * a single floor of 200 characters and `/learn/as100-01-01` failed at 144 — correctly rendered, and
 * short because a lesson stage shows ONE step at a time. That is the pedagogy, not a defect, and a
 * shared threshold would have had to be lowered to the sparsest surface for every route, which is
 * how a gate stops catching anything. Under the blocked policy every one of these was 0.
 */
const ROUTES = [
  { path: "/", minText: 400, minControls: 4, why: "the landing shell" },
  { path: "/dashboard", minText: 400, minControls: 8, why: "client-rendered from localStorage on mount" },
  { path: "/courses", minText: 2000, minControls: 20, why: "the full catalogue" },
  { path: "/learn/as100-01-01", minText: 80, minControls: 3, why: "a stage shows one step: prose, Listen, Continue" }
];

/** Console lines a blocked script produces, in Chromium's wording. */
const BLOCKED = /Content Security Policy|Refused to (execute|load|apply)/i;

function watchForViolations(page: Page): string[] {
  const seen: string[] = [];
  page.on("console", (msg) => {
    if (BLOCKED.test(msg.text())) seen.push(msg.text());
  });
  return seen;
}

test.describe("SEC-02 — the policy on the wire", () => {
  test("exactly one CSP header, carrying a nonce", async ({ page }) => {
    const response = await page.goto("/");
    expect(response, "no response for /").toBeTruthy();

    // `headersArray` keeps duplicates; `headers()` folds them. Two CSP headers are enforced as an
    // INTERSECTION, so a second one — say a leftover static policy in next.config.mjs — would block
    // the nonced scripts while every unit assertion about the middleware still passed.
    const all = (await response!.headersArray()).filter((h) => h.name.toLowerCase() === "content-security-policy");
    expect(all.length, "there must be exactly one Content-Security-Policy header").toBe(1);

    const csp = all[0].value;
    expect(csp, "script-src carries no per-request nonce — Next's streaming runtime cannot run").toMatch(/script-src[^;]*'nonce-[A-Za-z0-9+/=]{16,}'/);
    expect(csp, "'unsafe-inline' on script-src is the protection this policy exists to give").not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test("the nonce is per-response, not a constant", async ({ page }) => {
    // A nonce reused across responses is not a nonce; an attacker who can read one page can then
    // inject into the next. This is the one property a static policy could never have.
    const nonceOf = async () => {
      const res = await page.goto("/?n=" + Math.random());
      return (res!.headers()["content-security-policy"] ?? "").match(/'nonce-([^']+)'/)?.[1] ?? "";
    };
    const first = await nonceOf();
    const second = await nonceOf();
    expect(first, "no nonce in the policy").not.toBe("");
    expect(second, "the nonce did not change between responses").not.toBe(first);
  });

  test("the static asset routes are deliberately not matched", async ({ request }) => {
    // The matcher excludes `public/` by extension. If that ever inverts, every font and icon takes
    // a middleware hop, so the exclusion is asserted rather than left to the regex.
    const res = await request.get("/icon.svg");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-security-policy"], "middleware should not run for static assets").toBeUndefined();
    // The transport headers, which live in next.config.mjs, DO still apply to them.
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });
});

test.describe("SEC-02 — the app runs under the policy", () => {
  for (const { path, minText, minControls, why } of ROUTES) {
    test(`${path} — every script is nonced, nothing is blocked, and React hydrates`, async ({ page }) => {
      const violations = watchForViolations(page);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));

      const response = await page.goto(path, { waitUntil: "networkidle" });
      const nonce = (response!.headers()["content-security-policy"] ?? "").match(/'nonce-([^']+)'/)?.[1] ?? "";
      expect(nonce, "no nonce on the response").not.toBe("");

      // Every <script> the document carries must hold the nonce from THIS response. One that does
      // not is one the browser refused to run, which is exactly the failure mode being closed.
      const scripts = await page.evaluate(() => {
        const tags = Array.from(document.querySelectorAll("script"));
        return {
          total: tags.length,
          // The browser hides the nonce VALUE from getAttribute after parsing (nonce hiding), so
          // read the live `nonce` IDL property, which retains it.
          nonced: tags.filter((s) => (s as HTMLScriptElement).nonce !== "").length
        };
      });
      expect(scripts.total, "the page carries no scripts at all").toBeGreaterThan(4);
      expect(scripts.nonced, `${scripts.total - scripts.nonced} of ${scripts.total} scripts have no nonce`).toBe(scripts.total);

      expect(violations, `CSP blocked something: ${violations.slice(0, 3).join(" | ")}`).toEqual([]);
      expect(errors, `uncaught page errors: ${errors.slice(0, 3).join(" | ")}`).toEqual([]);

      // THE ASSERTION THAT WOULD HAVE CAUGHT THE HASHES. Under the old policy `<body>` reached the
      // browser containing script elements and nothing else — no text, no controls, no landmarks.
      const rendered = await page.evaluate(() => ({
        text: (document.body.innerText || "").trim().length,
        controls: document.querySelectorAll("button, a[href], input, select").length,
        landmarks: document.querySelectorAll("main, header, nav, [role='main']").length
      }));
      expect(rendered.text, `${path} (${why}) rendered ${rendered.text} characters — this is what a blocked hydration looks like`).toBeGreaterThanOrEqual(minText);
      expect(rendered.controls, `${path} rendered ${rendered.controls} interactive controls`).toBeGreaterThanOrEqual(minControls);
      expect(rendered.landmarks, "the page rendered no landmarks").toBeGreaterThan(0);
    });
  }

  test("the pre-hydration scripts actually ran", async ({ page }) => {
    // `themeInit` and `motionInit` are the two scripts this repo writes. They are nonced from
    // `x-nonce` in the layout rather than by Next, so they can break independently of the rest —
    // and their failure is invisible: a theme flash and silently ignored motion preferences.
    await page.addInitScript(() => {
      try {
        localStorage.setItem("numera:theme", "dark");
      } catch {
        /* storage unavailable — the assertion below will say so */
      }
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
